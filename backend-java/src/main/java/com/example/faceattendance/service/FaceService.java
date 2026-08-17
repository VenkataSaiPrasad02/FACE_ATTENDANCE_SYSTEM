package com.example.faceattendance.service;

import com.example.faceattendance.dto.face.FaceRegisterRequest;
import com.example.faceattendance.dto.face.FaceRegisterResponse;
import com.example.faceattendance.dto.face.FaceDetectRequest;
import com.example.faceattendance.dto.face.FaceDetectResponse;

/**
 * Face registration service contract.
 */
public interface FaceService {

    /**
     * Registers a student's face by obtaining an embedding from the FaceService
     * and persisting it in the database.
     *
     * @param request contains studentId and base64-encoded image
     * @return response indicating success
     */
    FaceRegisterResponse register(FaceRegisterRequest request);

    void deleteByStudentId(Long studentId);

    /**
     * Detects a single face location for the camera auto-capture flow.
     */
    FaceDetectResponse detect(FaceDetectRequest request);

}
