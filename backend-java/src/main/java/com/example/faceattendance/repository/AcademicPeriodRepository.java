package com.example.faceattendance.repository;

import com.example.faceattendance.entity.AcademicPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicPeriodRepository
        extends JpaRepository<AcademicPeriod, Long> {

    Optional<AcademicPeriod>
    findByCourseAndBatchAndSemesterAndActiveTrue(
            String branch,
            String batch,
            String semester
    );

    List<AcademicPeriod>
    findByCourseOrderByStartDateAsc(
            String branch
    );

    List<AcademicPeriod>
    findAllByOrderByStartDateDesc();

    boolean existsByCourseAndBatchAndSemester(
            String course,
            String batch,
            String semester
    );
}