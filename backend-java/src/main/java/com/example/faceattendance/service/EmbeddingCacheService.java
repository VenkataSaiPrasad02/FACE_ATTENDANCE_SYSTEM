package com.example.faceattendance.service;

import com.example.faceattendance.client.FaceRecognitionClient;
import com.example.faceattendance.entity.FaceData;
import com.example.faceattendance.repository.FaceDataRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingCacheService {

    private final FaceDataRepository faceDataRepository;
    private final ObjectMapper objectMapper;

    /*
     * Holds all registered face embeddings in memory.
     *
     * AtomicReference allows us to replace the complete list
     * safely when refreshing the cache.
     */
    private final AtomicReference<
            List<FaceRecognitionClient.CandidateEmbedding>
            > cache = new AtomicReference<>(List.of());

    /**
     * Load all embeddings once when Spring Boot starts.
     */
    @PostConstruct
    public void initialize() {

        log.info("Initializing face embedding cache...");

        refresh();
    }

    /**
     * Load embeddings from MySQL and convert the JSON strings
     * into Java lists only ONCE.
     */
    public synchronized void refresh() {

        long start = System.nanoTime();

        List<FaceData> faceDataList =
                faceDataRepository.findAll();

        List<FaceRecognitionClient.CandidateEmbedding> newCache =
                faceDataList.stream()
                        .map(faceData -> {

                            try {

                                List<Double> embedding =
                                        objectMapper.readValue(
                                                faceData.getEmbedding(),
                                                new TypeReference<List<Double>>() {}
                                        );

                                return new FaceRecognitionClient
                                        .CandidateEmbedding(
                                        faceData.getStudent().getId(),
                                        embedding
                                );

                            } catch (Exception e) {

                                throw new IllegalStateException(
                                        "Failed to load embedding for student "
                                                + faceData.getStudent().getId(),
                                        e
                                );
                            }

                        })
                        .collect(Collectors.toUnmodifiableList());

        /*
         * Replace the old cache only after the complete new cache
         * has been successfully created.
         */
        cache.set(newCache);

        long elapsed =
                (System.nanoTime() - start) / 1_000_000;

        log.info(
                "Embedding cache loaded: {} candidates in {} ms",
                newCache.size(),
                elapsed
        );
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
}