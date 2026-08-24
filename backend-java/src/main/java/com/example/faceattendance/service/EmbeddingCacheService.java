package com.example.faceattendance.service;

import com.example.faceattendance.client.FaceRecognitionClient;
import com.example.faceattendance.entity.FaceData;
import com.example.faceattendance.repository.FaceDataRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.UnaryOperator;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingCacheService {

    private final FaceDataRepository faceDataRepository;
    private final ObjectMapper objectMapper;
    private final FaceRecognitionClient faceRecognitionClient;

    /*
     * Holds all registered face embeddings in memory.
     *
     * AtomicReference allows us to replace the complete list
     * safely when refreshing or incrementally updating the cache.
     */
    private final AtomicReference<
            List<FaceRecognitionClient.CandidateEmbedding>
            > cache = new AtomicReference<>(List.of());

    /*
     * Single background worker that pushes cache snapshots to Python.
     * A single thread guarantees syncs never overlap and always run in
     * submission order; each task reads the LATEST snapshot, so rapid
     * consecutive registrations coalesce naturally (see requestSync()).
     */
    private final ExecutorService syncExecutor =
            Executors.newSingleThreadExecutor(r -> {
                Thread t = new Thread(r, "embedding-sync");
                t.setDaemon(true);
                return t;
            });

    /** True while a Python sync task is queued/running — used to coalesce. */
    private final AtomicBoolean syncQueued = new AtomicBoolean(false);

    /**
     * Load all embeddings once when Spring Boot starts.
     */
    @PostConstruct
    public void initialize() {

        log.info("Initializing face embedding cache...");

        refresh();
    }

    @PreDestroy
    public void shutdown() {
        syncExecutor.shutdownNow();
    }

    /**
     * Full reload from MySQL + synchronous push to Python.
     *
     * Deliberately expensive — used ONLY at startup and by the manual
     * admin refresh endpoint. Registration/deletion paths use the O(1)
     * {@link #upsert} / {@link #removeCandidate} instead: a full reload
     * here costs tens of seconds at scale (large table scan + parsing
     * thousands of 512-dim vectors + ~100 MB JSON sync payload), which
     * previously blocked every face-registration HTTP request and blew
     * past the frontend's 30 s timeout.
     */
    public synchronized void refresh() {

        long start = System.nanoTime();

        List<Object[]> rows =
                faceDataRepository.findAllStudentIdEmbeddingPairs();

        List<FaceRecognitionClient.CandidateEmbedding> newCache =
                rows.stream()
                        .map(row -> parseCandidate((Long) row[0], (String) row[1]))
                        .collect(java.util.stream.Collectors.toUnmodifiableList());

        /*
         * Replace the old cache only after the complete new cache
         * has been successfully created.
         */
        cache.set(newCache);

        try {
            faceRecognitionClient.syncEmbeddings(newCache);
        } catch (Exception e) {
            log.warn("Failed to sync embeddings to Python service: {}", e.getMessage());
        }

        long elapsed =
                (System.nanoTime() - start) / 1_000_000;

        log.info(
                "Embedding cache loaded: {} candidates in {} ms",
                newCache.size(),
                elapsed
        );
    }

    /**
     * Registers/re-registers ONE student's embedding in memory and queues a
     * background sync of the resulting snapshot to Python. O(n) list copy,
     * no DB access, no re-parsing of unrelated embeddings — runs in
     * microseconds so the registration HTTP response is no longer delayed
     * by tens of seconds of cache maintenance.
     */
    public void upsert(Long studentId, String embeddingJson) {

        FaceRecognitionClient.CandidateEmbedding candidate =
                parseCandidate(studentId, embeddingJson);

        mutate(current -> {
            List<FaceRecognitionClient.CandidateEmbedding> updated =
                    new ArrayList<>(current.size() + 1);

            boolean replaced = false;
            for (FaceRecognitionClient.CandidateEmbedding existing : current) {
                if (existing.getStudentId().equals(studentId)) {
                    updated.add(candidate);
                    replaced = true;
                } else {
                    updated.add(existing);
                }
            }
            if (!replaced) {
                updated.add(candidate);
            }
            return List.copyOf(updated);
        });
    }

    /**
     * Removes ONE student's embedding from memory and queues a background
     * sync. No-op if the student has no cached embedding.
     */
    public void removeCandidate(Long studentId) {

        mutate(current -> {
            if (current.stream().noneMatch(c -> c.getStudentId().equals(studentId))) {
                return current;
            }
            return List.copyOf(
                    current.stream()
                            .filter(c -> !c.getStudentId().equals(studentId))
                            .collect(java.util.stream.Collectors.toUnmodifiableList())
            );
        });
    }

    /**
     * Get the current in-memory candidates.
     *
     * No database query.
     * No JSON parsing.
     */
    public List<FaceRecognitionClient.CandidateEmbedding>
    getCandidates() {

        return cache.get();
    }

    /**
     * Return number of cached face embeddings.
     */
    public int size() {

        return cache.get().size();
    }

    // ------------------------------------------------------------------
    // Internals
    // ------------------------------------------------------------------

    private FaceRecognitionClient.CandidateEmbedding parseCandidate(
            Long studentId, String embeddingJson) {

        try {

            List<Double> embedding =
                    objectMapper.readValue(
                            embeddingJson,
                            new TypeReference<List<Double>>() {}
                    );

            return new FaceRecognitionClient.CandidateEmbedding(studentId, embedding);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Failed to load embedding for student "
                            + studentId,
                    e
            );
        }
    }

    /** Copy-on-write cache mutation followed by an after-commit sync request. */
    private void mutate(UnaryOperator<List<FaceRecognitionClient.CandidateEmbedding>> operator) {
        cache.updateAndGet(operator);
        scheduleSyncAfterCommit();
    }

    /**
     * Queues the Python snapshot sync to run AFTER the surrounding transaction
     * commits, so Python only ever receives embeddings that are durable in
     * MySQL. Outside a transaction it runs immediately.
     */
    private void scheduleSyncAfterCommit() {

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            requestSync();
                        }
                    }
            );
        } else {
            requestSync();
        }
    }

    /**
     * Coalesces bursts into a single queued sync per generation. The worker
     * loops until no newer request arrived while it was syncing, so the last
     * task always pushes the freshest snapshot.
     */
    private void requestSync() {

        if (!syncQueued.compareAndSet(false, true)) {
            return;
        }

        try {
            syncExecutor.submit(() -> {
                do {
                    syncQueued.set(false);
                    try {
                        faceRecognitionClient.syncEmbeddings(cache.get());
                        log.info("Background embedding sync pushed {} candidates",
                                cache.get().size());
                    } catch (Exception e) {
                        log.warn("Background embedding sync failed: {}", e.getMessage());
                    }
                } while (syncQueued.getAndSet(false));
            });
        } catch (Exception e) {
            syncQueued.set(false);
            log.warn("Could not queue embedding sync: {}", e.getMessage());
        }
    }
}
