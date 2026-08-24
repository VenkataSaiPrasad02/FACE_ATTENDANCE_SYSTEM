package com.example.faceattendance.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilterOptionsResponse {

    private List<String> courses;

    private List<String> batches;

    private List<String> semesters;

    private List<String> years;
}
