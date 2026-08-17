package com.example.faceattendance.service.impl;
import java.time.DayOfWeek;
import java.time.LocalDate;

import com.example.faceattendance.dto.holiday.CreateHolidayRequest;
import com.example.faceattendance.dto.holiday.HolidayResponse;
import com.example.faceattendance.entity.Holiday;
import com.example.faceattendance.exception.ResourceNotFoundException;
import com.example.faceattendance.repository.HolidayRepository;
import com.example.faceattendance.service.HolidayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class HolidayServiceImpl implements HolidayService {

    private final HolidayRepository holidayRepository;

    // =========================================================
    // CREATE HOLIDAY
    // =========================================================

    @Override
    @Transactional
    public HolidayResponse create(
            CreateHolidayRequest request) {

        LocalDate date =
                request.getHolidayDate();

        // Prevent duplicate holiday
        if (holidayRepository.existsByHolidayDate(date)) {

            throw new IllegalArgumentException(
                    "A holiday already exists for date: " + date
            );
        }

        Holiday holiday = Holiday.builder()
                .holidayDate(date)
                .reason(request.getReason().trim())
                .build();

        Holiday saved =
                holidayRepository.save(holiday);

        log.info(
                "Holiday created: id={}, date={}, reason={}",
                saved.getId(),
                saved.getHolidayDate(),
                saved.getReason()
        );

        return toResponse(saved);
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public HolidayResponse getById(Long id) {

        Holiday holiday =
                findOrThrow(id);

        return toResponse(holiday);
    }


    // =========================================================
    // GET BY DATE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public HolidayResponse getByDate(
            LocalDate date) {

        return holidayRepository
                .findByHolidayDate(date)
                .map(this::toResponse)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No holiday found for date: "
                                        + date
                        )
                );
    }


    // =========================================================
    // GET BETWEEN DATES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<HolidayResponse> getBetweenDates(
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate.isAfter(endDate)) {

            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }

        return holidayRepository
                .findByHolidayDateBetween(
                        startDate,
                        endDate
                )
                .stream()
                .sorted(
                        (a, b) ->
                                a.getHolidayDate()
                                        .compareTo(
                                                b.getHolidayDate()
                                        )
                )
                .map(this::toResponse)
                .toList();
    }


    // =========================================================
    // CHECK HOLIDAY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public boolean isHoliday(
            LocalDate date) {

        return holidayRepository
                .existsByHolidayDate(date);
    }


    // =========================================================
    // DELETE HOLIDAY
    // =========================================================

    @Override
    @Transactional
    public void delete(Long id) {

        Holiday holiday =
                findOrThrow(id);

        holidayRepository.delete(holiday);

        log.info(
                "Holiday deleted: id={}, date={}",
                holiday.getId(),
                holiday.getHolidayDate()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public long countWorkingDays(
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date"
            );
        }

        long workingDays = 0;

        LocalDate date = startDate;

        while (!date.isAfter(endDate)) {

            // Every Sunday is non-working
            boolean sunday =
                    date.getDayOfWeek() == DayOfWeek.SUNDAY;

            // Only 2nd Saturday is non-working
            boolean secondSaturday =
                    date.getDayOfWeek() == DayOfWeek.SATURDAY
                            && getSaturdayOccurrence(date) == 2;

            // Manually declared holiday
            boolean holiday =
                    holidayRepository.existsByHolidayDate(date);

            if (!sunday
                    && !secondSaturday
                    && !holiday) {

                workingDays++;
            }

            date = date.plusDays(1);
        }

        return workingDays;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWorkingDay(LocalDate date) {

        // Sunday is always non-working
        if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return false;
        }

        // 2nd Saturday is non-working
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY
                && getSaturdayOccurrence(date) == 2) {
            return false;
        }

        // Admin-declared holiday
        if (holidayRepository.existsByHolidayDate(date)) {
            return false;
        }

        return true;
    }

    private int getSaturdayOccurrence(LocalDate date) {

        return ((date.getDayOfMonth() - 1) / 7) + 1;
    }


    // =========================================================
    // FIND OR THROW
    // =========================================================

    private Holiday findOrThrow(Long id) {

        return holidayRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Holiday not found with id: "
                                        + id
                        )
                );
    }


    // =========================================================
    // ENTITY → DTO
    // =========================================================

    private HolidayResponse toResponse(
            Holiday holiday) {

        return HolidayResponse.builder()
                .id(holiday.getId())
                .holidayDate(
                        holiday.getHolidayDate()
                )
                .reason(
                        holiday.getReason()
                )
                .createdAt(
                        holiday.getCreatedAt()
                )
                .updatedAt(
                        holiday.getUpdatedAt()
                )
                .build();
    }
}