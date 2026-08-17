package com.example.faceattendance.controller;

import com.example.faceattendance.service.EmbeddingCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/face/cache")
@RequiredArgsConstructor
public class EmbeddingCacheController {

    private final EmbeddingCacheService embeddingCacheService;

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshCache() {

        embeddingCacheService.refresh();

        return ResponseEntity.ok(
                Map.of(
                        "message", "Embedding cache refreshed successfully",
                        "candidates", embeddingCacheService.size()
                )
        );
    }
}