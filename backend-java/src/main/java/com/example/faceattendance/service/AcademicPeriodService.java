package com.example.faceattendance.service;

import com.example.faceattendance.dto.academicperiod.AcademicPeriodResponse;
import com.example.faceattendance.dto.academicperiod.CreateAcademicPeriodRequest;
import com.example.faceattendance.dto.academicperiod.UpdateAcademicPeriodRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface AcademicPeriodService {

    AcademicPeriodResponse create(
            CreateAcademicPeriodRequest request
    );

    AcademicPeriodResponse getById(Long id);

    List<AcademicPeriodResponse> getAll();

    List<AcademicPeriodResponse> getByCourse(
            String course
    );

    AcademicPeriodResponse getActive(

            String course,
            String batch,
            String semester
    );

    @Transactional(readOnly = true)
    Optional<AcademicPeriodResponse> findActive(
            String course,
            String batch,
            String semester);

    AcademicPeriodResponse update(
            Long id,
            UpdateAcademicPeriodRequest request
    );

    void activate(Long id);

    void deactivate(Long id);

    void delete(Long id);
}