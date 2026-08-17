package com.example.faceattendance.service;

import com.example.faceattendance.dto.attendance.DashboardStatsResponse;

/**
 * Dashboard statistics service contract.
 */
public interface DashboardService {

    /**
     * Returns today's attendance statistics for the dashboard.
     */
    DashboardStatsResponse getStats();
}
