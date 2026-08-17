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

        private List<CandidateEmbedding> candidates;

        public RecognizeRequest(String imageBase64, List<CandidateEmbedding> candidates) {
            this.imageBase64 = imageBase64;
            this.candidates = candidates;
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
    public static class DetectRequest {
        @JsonProperty("image_base64")
        private String imageBase64;

        public DetectRequest(String imageBase64) {
            this.imageBase64 = imageBase64;
        }
    }

    @Data
    public static class DetectResponse {
        private Boolean faceDetected;
        private Integer x;
        private Integer y;
        private Integer width;
        private Integer height;
        private Double qualityScore;
        private Integer imageWidth;
        private Integer imageHeight;
        private String message;
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
     *
     * @param studentId   ID of the student
     * @param imageBase64 Base64-encoded image
     * @return RegisterResponse containing the generated embedding
     * @throws FaceServiceException if the service is unreachable or returns an error
     */
    public RegisterResponse registerFace(Long studentId, String imageBase64) {
        String url = faceServiceUrl + "/api/face/register";
        RegisterRequest request = new RegisterRequest(studentId, imageBase64);

        log.debug("Calling face service register for studentId={}", studentId);

        return post(url, request, RegisterResponse.class);
    }

    /**
     * Recognizes a face by comparing the probe image against candidate embeddings.
     *
     * @param imageBase64 Base64-encoded probe image
     * @param candidates  List of candidates (studentId + stored embedding)
     * @return RecognizeResponse with matched status, confidence, and matched studentId
     * @throws FaceServiceException if the service is unreachable or returns an error
     */
    public RecognizeResponse recognizeFace(String imageBase64, List<CandidateEmbedding> candidates) {
        String url = faceServiceUrl + "/api/face/recognize";
        RecognizeRequest request = new RecognizeRequest(imageBase64, candidates);

        log.debug("Calling face service recognize against {} candidates", candidates.size());

        return post(url, request, RecognizeResponse.class);
    }

    /**
     * Detects a single face location for the browser auto-capture flow.
     *
     * This is detection only; it does not compare embeddings or mark attendance.
     */
    public DetectResponse detectFace(String imageBase64) {
        String url = faceServiceUrl + "/api/face/detect";
        DetectRequest request = new DetectRequest(imageBase64);

        log.debug("Calling face service detect endpoint");

        return post(url, request, DetectResponse.class);
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
