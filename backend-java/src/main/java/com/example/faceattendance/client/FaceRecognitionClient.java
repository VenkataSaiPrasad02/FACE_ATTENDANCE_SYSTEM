package com.example.faceattendance.client;

import com.example.faceattendance.exception.FaceServiceException;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * HTTP client that communicates exclusively with the Python Face Recognition Service.
 * Controllers MUST NOT make direct HTTP calls to the face service — only this class does.
 *
 * All business decisions (whether to mark attendance, etc.) belong in the service layer.
 * This client is responsible only for HTTP transport and serialization.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FaceRecognitionClient {

    private final RestTemplate restTemplate;

    @Value("${face.service.url}")
    private String faceServiceUrl;

    // ------------------------------------------------------------------
    // Request / Response inner classes
    // ------------------------------------------------------------------

    @Data
    public static class RegisterRequest {
        @JsonProperty("student_id")
        private Long studentId;

        @JsonProperty("image_base64")
        private String imageBase64;

        public RegisterRequest(Long studentId, String imageBase64) {
            this.studentId = studentId;
            this.imageBase64 = imageBase64;
        }
    }

    @Data
    public static class RegisterResponse {
        @JsonProperty("student_id")
        private Long studentId;

        private List<Double> embedding;

        @JsonProperty("embedding_dim")
        private Integer embeddingDim;

        private String message;
    }

    @Data
    public static class CandidateEmbedding {
        @JsonProperty("student_id")
        private Long studentId;

        private List<Double> embedding;

        public CandidateEmbedding(Long studentId, List<Double> embedding) {
            this.studentId = studentId;
            this.embedding = embedding;
        }
    }

    @Data
    public static class RecognizeRequest {
        @JsonProperty("image_base64")
        private String imageBase64;

        public RecognizeRequest(String imageBase64) {
            this.imageBase64 = imageBase64;
        }
    }

    @Data
    public static class RecognizeResponse {
        private Boolean matched;
        private Double confidence;

        @JsonProperty("student_id")
        private Long studentId;
    }

    @Data
    public static class HealthResponse {
        private String status;
        private String service;
        private String version;
    }

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    /**
     * Registers a face by sending the image to the Python service.
     * Python detects the face, generates the embedding, and returns it —
     * Java is responsible for persisting it (see FaceServiceImpl).
     *
     * @param studentId   the student this face belongs to
     * @param imageBase64 Base64-encoded image
     * @return RegisterResponse containing the generated embedding
     * @throws FaceServiceException if the service is unreachable or returns an error
     */
    public RegisterResponse registerFace(Long studentId, String imageBase64) {
        String url = faceServiceUrl + "/api/face/register";
        RegisterRequest request = new RegisterRequest(studentId, imageBase64);
        return post(url, request, RegisterResponse.class);
    }

    /**
     * Recognizes a face against whatever candidates the Python service
     * already holds in memory (populated via {@link #syncEmbeddings}).
     * The candidate list is deliberately NOT sent on every request —
     * that's the whole point of the optimized architecture.
     *
     * @param imageBase64 Base64-encoded probe image
     * @return RecognizeResponse with matched status, confidence, and matched studentId
     * @throws FaceServiceException if the service is unreachable or returns an error
     */
    public RecognizeResponse recognizeFace(String imageBase64) {
        String url = faceServiceUrl + "/api/face/recognize";
        RecognizeRequest request = new RecognizeRequest(imageBase64);
        return post(url, request, RecognizeResponse.class);
    }

    /**
     * Pushes the complete embedding snapshot to Python's in-memory store.
     * Called by EmbeddingCacheService.refresh() — startup, register, update, delete.
     *
     * @param candidates full list of studentId + embedding pairs
     * @throws FaceServiceException if the service is unreachable or returns an error
     */
    public void syncEmbeddings(List<CandidateEmbedding> candidates) {
        String url = faceServiceUrl + "/api/face/sync";
        var body = new java.util.HashMap<String, Object>();
        body.put("candidates", candidates);
        log.info(
                "Syncing {} candidates. First candidate: studentId={}, embeddingSize={}",
                candidates.size(),
                candidates.isEmpty() ? null : candidates.get(0).getStudentId(),
                candidates.isEmpty() || candidates.get(0).getEmbedding() == null
                        ? null
                        : candidates.get(0).getEmbedding().size()
        );        post(url, body, Object.class);
    }

    /**
     * Checks whether the Python face service is healthy.
     *
     * @return true if service responds with status "ok"
     */
    public boolean isHealthy() {
        try {
            String url = faceServiceUrl + "/api/face/health";
            ResponseEntity<HealthResponse> response =
                    restTemplate.getForEntity(url, HealthResponse.class);
            return response.getStatusCode().is2xxSuccessful()
                    && response.getBody() != null
                    && "ok".equals(response.getBody().getStatus());
        } catch (Exception e) {
            log.warn("Face service health check failed: {}", e.getMessage());
            return false;
        }
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    private <T> T post(String url, Object requestBody, Class<T> responseType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.POST, entity, responseType);
            return response.getBody();
        } catch (ResourceAccessException e) {
            throw new FaceServiceException(
                    "Face recognition service is unavailable. Please ensure the Python service is running on "
                            + faceServiceUrl, e);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new FaceServiceException(
                    "Face service returned an error: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            throw new FaceServiceException(
                    "Unexpected error communicating with face service: " + e.getMessage(), e);
        }
    }
}