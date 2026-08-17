package com.example.faceattendance.service.impl;

import com.example.faceattendance.client.FaceRecognitionClient;
import com.example.faceattendance.dto.face.FaceRegisterRequest;
import com.example.faceattendance.dto.face.FaceRegisterResponse;
import com.example.faceattendance.entity.FaceData;
import com.example.faceattendance.entity.Student;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.repository.FaceDataRepository;
import com.example.faceattendance.repository.StudentRepository;
import com.example.faceattendance.service.EmbeddingCacheService;
import com.example.faceattendance.service.FaceService;
import com.example.faceattendance.util.PerfMonitor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Face registration business logic.
 * Validates the student exists, delegates AI work to FaceRecognitionClient,
 * and persists the embedding. Raw images are NEVER stored.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FaceServiceImpl implements FaceService {

    private final StudentRepository studentRepository;
    private final FaceDataRepository faceDataRepository;
    private final FaceRecognitionClient faceRecognitionClient;
    private final ObjectMapper objectMapper;
    private final PerfMonitor perf;
    private final EmbeddingCacheService embeddingCacheService;

    @Override
    @Transactional
    public FaceRegisterResponse register(FaceRegisterRequest request) {
        PerfMonitor.Snapshot totalSnap = perf.start();

        // Base64 payload size, as actually received — measured once, cheap.
        if (perf.isEnabled() && request.getImageBase64() != null) {
            String b64 = request.getImageBase64();
            perf.logInfo("Base64 string received : {} KB ({} chars)",
                    String.format("%.1f", b64.length() / 1024.0), b64.length());
        }

        // 1. Validate student exists
        PerfMonitor.Snapshot dbSnap = perf.start();
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found with id: " + request.getStudentId()));
        perf.stop("Face Register - student lookup (DB)", dbSnap);

        // 2. Call Python face service — raises FaceServiceException if unreachable
        PerfMonitor.Snapshot pythonSnap = perf.start();
        FaceRecognitionClient.RegisterResponse pythonResponse =
                faceRecognitionClient.registerFace(request.getStudentId(), request.getImageBase64());
        perf.stop("Face Register - Python service call (network + detection + embedding)", pythonSnap);

        // 3. Serialize embedding to JSON string for storage
        PerfMonitor.Snapshot serializeSnap = perf.start();
        List<Double> embedding = pythonResponse.getEmbedding();
        String embeddingJson;
        try {
            embeddingJson = objectMapper.writeValueAsString(embedding);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize face embedding", e);
        }
        perf.stop("Face Register - embedding JSON serialize", serializeSnap);

        if (perf.isEnabled()) {
            int dims = embedding != null ? embedding.size() : 0;
            int sizeBytes = embeddingJson.getBytes(StandardCharsets.UTF_8).length;
            perf.logInfo("Embedding: dims={} | representation=JSON-array String | " +
                            "serialized size={} KB | DB column type=LONGTEXT",
                    dims, String.format("%.2f", sizeBytes / 1024.0));
        }

        // 4. Upsert FaceData (overwrite if already exists for this student)
        PerfMonitor.Snapshot saveSnap = perf.start();

        FaceData faceData = faceDataRepository.findByStudentId(student.getId())
                .orElse(FaceData.builder().student(student).build());

        faceData.setEmbedding(embeddingJson);
        faceDataRepository.save(faceData);

// 5. Mark the student as having a registered face
        student.setFaceRegistered(true);
        studentRepository.save(student);

        perf.stop("Face Register - DB save (FaceData + Student)", saveSnap);

        // 6. Refresh in-memory embedding cache
        embeddingCacheService.refresh();

        log.info("Face embedding cache refreshed after registration. Cached candidates={}",
                embeddingCacheService.size());

        log.info("Face registered for studentId={}", student.getId());

        perf.stop("Face Register - TOTAL", totalSnap);

        return FaceRegisterResponse.builder()
                .studentId(student.getId())
                .studentName(student.getFullName())
                .message("Face registered successfully")
                .build();
    }

    @Override
    @Transactional
    public void deleteByStudentId(Long studentId) {

        faceDataRepository.findByStudentId(studentId)
                .ifPresent(faceData -> {
                    faceDataRepository.delete(faceData);
                    log.info("Face data deleted for studentId={}", studentId);
                });

        // Remove deleted student's embedding from memory cache
        embeddingCacheService.refresh();

        log.info("Face embedding cache refreshed after deletion. Cached candidates={}",
                embeddingCacheService.size());
    }
}
