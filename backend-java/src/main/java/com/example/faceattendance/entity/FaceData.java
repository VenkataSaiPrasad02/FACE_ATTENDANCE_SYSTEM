package com.example.faceattendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Stores the face embedding vector for a student.
 * Raw face images are NEVER stored — only the AI-generated embedding.
 */
@Entity
@Table(name = "face_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    /**
     * JSON array of float values, e.g. "[0.123, -0.456, ...]".
     * Stored as LONGTEXT to accommodate 512-dimension embeddings.
     */
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String embedding;

    @Column(name = "model_version", nullable = false, length = 50)
    @Builder.Default
    private String modelVersion = "insightface-v1";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
