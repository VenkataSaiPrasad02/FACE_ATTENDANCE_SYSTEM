package com.example.faceattendance.service;

import com.example.faceattendance.dto.holiday.CreateHolidayRequest;
import com.example.faceattendance.dto.holiday.HolidayResponse;

import java.time.LocalDate;
import java.util.List;

public interface HolidayService {

    HolidayResponse create(CreateHolidayRequest request);

    HolidayResponse getById(Long id);

    HolidayResponse getByDate(LocalDate date);

    List<HolidayResponse> getBetweenDates(
            LocalDate startDate,
            LocalDate endDate
    );

    boolean isHoliday(LocalDate date);

    void delete(Long id);
    long countWorkingDays(
            LocalDate startDate,
            LocalDate endDate
    );
    boolean isWorkingDay(
            LocalDate date
    );


}