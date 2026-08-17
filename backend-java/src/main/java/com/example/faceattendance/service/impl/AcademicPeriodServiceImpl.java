package com.example.faceattendance.service.impl;

import com.example.faceattendance.dto.academicperiod.AcademicPeriodResponse;
import com.example.faceattendance.dto.academicperiod.CreateAcademicPeriodRequest;
import com.example.faceattendance.dto.academicperiod.UpdateAcademicPeriodRequest;
import com.example.faceattendance.entity.AcademicPeriod;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.repository.AcademicPeriodRepository;
import com.example.faceattendance.service.AcademicPeriodService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AcademicPeriodServiceImpl
        implements AcademicPeriodService {

    private final AcademicPeriodRepository repository;

    @Override
    @Transactional
    public AcademicPeriodResponse create(
            CreateAcademicPeriodRequest request) {

        String course =
                request.getCourse().trim();

        String batch =
                request.getBatch().trim();

        String semester =
                request.getSemester().trim();

        validateDates(
                request.getStartDate(),
                request.getEndDate()
        );

        if (repository.existsByCourseAndBatchAndSemester(
                course,
                batch,
                semester
        )) {

            throw new IllegalArgumentException(
                    "Academic period already exists for "
                            + course
                            + " / "
                            + batch
                            + " / "
                            + semester
            );
        }

        AcademicPeriod period =
                AcademicPeriod.builder()
                        .course(course)
                        .batch(batch)
                        .semester(semester)
                        .startDate(request.getStartDate())
                        .endDate(request.getEndDate())
                        .active(false)
                        .build();

        AcademicPeriod saved =
                repository.save(period);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicPeriodResponse getById(
            Long id) {

        return toResponse(
                findOrThrow(id)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicPeriodResponse> getAll() {

        return repository
                .findAllByOrderByStartDateDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicPeriodResponse> getByCourse(
            String course) {

        return repository
                .findByCourseOrderByStartDateAsc(
                        course.trim()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicPeriodResponse getActive(
            String course,
            String batch,
            String semester) {

        AcademicPeriod period =
                repository
                        .findByCourseAndBatchAndSemesterAndActiveTrue(
                                course.trim(),
                                batch.trim(),
                                semester.trim()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No active academic period found for "
                                                + course
                                                + " / "
                                                + batch
                                                + " / "
                                                + semester
                                )
                        );

        return toResponse(period);
    }

    @Transactional(readOnly = true)
    @Override
    public Optional<AcademicPeriodResponse> findActive(
            String course,
            String batch,
            String semester) {

        // Deliberately does NOT throw — this is called from batch
        // attendance-percentage calculations that may already be
        // running inside a shared transaction. Throwing there would
        // mark that transaction rollback-only even if the caller
        // catches the exception, since the mark happens as the
        // exception unwinds through this method's own transactional
        // proxy — before the caller's catch block ever runs.
        return repository
                .findByCourseAndBatchAndSemesterAndActiveTrue(
                        course.trim(),
                        batch.trim(),
                        semester.trim()
                )
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public AcademicPeriodResponse update(
            Long id,
            UpdateAcademicPeriodRequest request) {

        AcademicPeriod period =
                findOrThrow(id);

        if (StringUtils.hasText(request.getCourse())) {
            period.setCourse(
                    request.getCourse().trim()
            );
        }

        if (StringUtils.hasText(request.getBatch())) {
            period.setBatch(
                    request.getBatch().trim()
            );
        }

        if (StringUtils.hasText(request.getSemester())) {
            period.setSemester(
                    request.getSemester().trim()
            );
        }

        if (request.getStartDate() != null) {
            period.setStartDate(
                    request.getStartDate()
            );
        }

        if (request.getEndDate() != null) {
            period.setEndDate(
                    request.getEndDate()
            );
        }

        validateDates(
                period.getStartDate(),
                period.getEndDate()
        );

        return toResponse(
                repository.save(period)
        );
    }

    @Override
    @Transactional
    public void activate(Long id) {

        AcademicPeriod selected =
                findOrThrow(id);

        /*
         * Only one active period for the same
         * course + batch + semester.
         *
         * First deactivate the existing active
         * period for this exact combination.
         */
        repository
                .findByCourseAndBatchAndSemesterAndActiveTrue(
                        selected.getCourse(),
                        selected.getBatch(),
                        selected.getSemester()
                )
                .ifPresent(current -> {

                    if (!current.getId()
                            .equals(selected.getId())) {

                        current.setActive(false);

                        repository.save(current);
                    }
                });

        selected.setActive(true);

        repository.save(selected);
    }

    @Override
    @Transactional
    public void deactivate(Long id) {

        AcademicPeriod selected =
                findOrThrow(id);

        selected.setActive(false);

        repository.save(selected);
    }

    @Override
    @Transactional
    public void delete(Long id) {

        AcademicPeriod period =
                findOrThrow(id);

        if (period.isActive()) {

            throw new IllegalStateException(
                    "Active academic period cannot be deleted. "
                            + "Deactivate it first."
            );
        }

        repository.delete(period);
    }

    private AcademicPeriod findOrThrow(
            Long id) {

        return repository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Academic period not found with id: "
                                        + id
                        )
                );
    }

    private void validateDates(
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null
                || endDate == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {

            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }
    }

    private AcademicPeriodResponse toResponse(
            AcademicPeriod period) {

        return AcademicPeriodResponse.builder()
                .id(period.getId())
                .course(period.getCourse())
                .batch(period.getBatch())
                .semester(period.getSemester())
                .startDate(period.getStartDate())
                .endDate(period.getEndDate())
                .active(period.isActive())
                .createdAt(period.getCreatedAt())
                .updatedAt(period.getUpdatedAt())
                .build();
    }
}