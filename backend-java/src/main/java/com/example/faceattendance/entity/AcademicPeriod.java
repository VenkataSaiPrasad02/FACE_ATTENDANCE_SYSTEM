package com.example.faceattendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;



@Entity
@Table(name = "academic_periods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Optional display name / subject title for the period
     * (e.g. "Data Structures"). Falls back to the
     * course • batch • semester combination when absent.
     */
    @Column(length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String course;

    @Column(nullable = false, length = 20)
    private String batch;

    @Column(nullable = false, length = 50)
    private String semester;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean active;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}