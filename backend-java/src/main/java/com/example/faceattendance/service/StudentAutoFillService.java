package com.example.faceattendance.service;

import com.example.faceattendance.dto.autofill.AutoFillConfigRequest;
import com.example.faceattendance.dto.autofill.AutoFillConfigResponse;

import java.util.List;

/**
 * Manages reusable auto-fill presets for student creation.
 *
 * Configurations only pre-fill the Add Student form; editing or
 * deleting one never modifies existing student records.
 */
public interface StudentAutoFillService {

    /** All configurations, ordered by name. */
    List<AutoFillConfigResponse> getAll();

    AutoFillConfigResponse getById(Long id);

    AutoFillConfigResponse create(AutoFillConfigRequest request);

    AutoFillConfigResponse update(Long id, AutoFillConfigRequest request);

    void delete(Long id);

    /**
     * Marks the given configuration as the active (default) preset and
     * deactivates every other configuration.
     */
    AutoFillConfigResponse activate(Long id);
}
