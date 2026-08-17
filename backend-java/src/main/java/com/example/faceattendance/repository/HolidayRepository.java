package com.example.faceattendance.repository;

import com.example.faceattendance.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository
        extends JpaRepository<Holiday, Long> {

    boolean existsByHolidayDate(LocalDate holidayDate);

    Optional<Holiday> findByHolidayDate(LocalDate holidayDate);

    List<Holiday> findByHolidayDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    long countByHolidayDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );
}