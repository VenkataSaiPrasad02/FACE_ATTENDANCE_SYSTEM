package com.example.faceattendance.service.impl;

import com.example.faceattendance.dto.autofill.AutoFillConfigRequest;
import com.example.faceattendance.dto.autofill.AutoFillConfigResponse;
import com.example.faceattendance.entity.StudentAutoFillConfig;
import com.example.faceattendance.exception.DuplicateStudentException;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.repository.StudentAutoFillConfigRepository;
import com.example.faceattendance.service.StudentAutoFillService;
import com.example.faceattendance.utils.AcademicLabels;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentAutoFillServiceImpl implements StudentAutoFillService {

    private final StudentAutoFillConfigRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<AutoFillConfigResponse> getAll() {
        return repository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AutoFillConfigResponse getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Override
    @Transactional
    public AutoFillConfigResponse create(AutoFillConfigRequest request) {

        String name = request.getName().trim();

        if (repository.existsByNameIgnoreCase(name)) {
            throw new DuplicateStudentException(
                    "An auto-fill configuration named '" + name + "' already exists");
        }

        boolean activate = Boolean.TRUE.equals(request.getActive());

        StudentAutoFillConfig config = StudentAutoFillConfig.builder()
                .name(name)
                .course(request.getCourse().trim())
                .batch(request.getBatch().trim())
                .year(AcademicLabels.formatYear(request.getYear()))
                .semester(AcademicLabels.formatSemester(request.getSemester()))
                .active(false)
                .build();

        StudentAutoFillConfig saved = repository.save(config);

        if (activate) {
            saved.setActive(true);
            deactivateOthers(saved);
        }

        log.info("Auto-fill config created: id={}, name={}", saved.getId(), saved.getName());

        return toDto(repository.save(saved));
    }

    @Override
    @Transactional
    public AutoFillConfigResponse update(Long id, AutoFillConfigRequest request) {

        StudentAutoFillConfig config = findOrThrow(id);

        String name = request.getName().trim();

        repository.findAllByOrderByNameAsc().stream()
                .filter(other -> !other.getId().equals(id))
                .filter(other -> other.getName().equalsIgnoreCase(name))
                .findFirst()
                .ifPresent(other -> {
                    throw new DuplicateStudentException(
                            "An auto-fill configuration named '" + name + "' already exists");
                });

        config.setName(name);
        config.setCourse(request.getCourse().trim());
        config.setBatch(request.getBatch().trim());
        config.setYear(AcademicLabels.formatYear(request.getYear()));
        config.setSemester(AcademicLabels.formatSemester(request.getSemester()));

        /*
         * Editing values affects only FUTURE student creation — existing
         * students are never rewritten from configuration changes.
         */
        if (Boolean.TRUE.equals(request.getActive()) && !Boolean.TRUE.equals(config.getActive())) {
            config.setActive(true);
            deactivateOthers(config);
        } else if (Boolean.FALSE.equals(request.getActive())) {
            config.setActive(false);
        }

        StudentAutoFillConfig saved = repository.save(config);

        log.info("Auto-fill config updated: id={}, name={}", saved.getId(), saved.getName());

        return toDto(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {

        StudentAutoFillConfig config = findOrThrow(id);

        repository.delete(config);

        log.info("Auto-fill config deleted: id={}, name={}", config.getId(), config.getName());
    }

    @Override
    @Transactional
    public AutoFillConfigResponse activate(Long id) {

        StudentAutoFillConfig config = findOrThrow(id);

        config.setActive(true);
        deactivateOthers(config);

        return toDto(repository.save(config));
    }

    private void deactivateOthers(StudentAutoFillConfig keepActive) {
        repository.findAllByOrderByNameAsc().stream()
                .filter(other -> !other.getId().equals(keepActive.getId()))
                .filter(StudentAutoFillConfig::getActive)
                .forEach(other -> other.setActive(false));
    }

    private StudentAutoFillConfig findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Auto-fill configuration not found: " + id));
    }

    private AutoFillConfigResponse toDto(StudentAutoFillConfig config) {
        return AutoFillConfigResponse.builder()
                .id(config.getId())
                .name(config.getName())
                .course(config.getCourse())
                .batch(config.getBatch())
                .year(config.getYear())
                .semester(config.getSemester())
                .active(Boolean.TRUE.equals(config.getActive()))
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
