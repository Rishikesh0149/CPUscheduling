package com.osscheduler.controller;

import com.osscheduler.dto.*;
import com.osscheduler.service.PagingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paging")
public class PagingController {

    private final PagingService pagingService;

    public PagingController(PagingService pagingService) {
        this.pagingService = pagingService;
    }

    /**
     * POST /api/paging/run
     * Executes a specific paging algorithm on the given reference string & frames.
     */
    @PostMapping("/run")
    public ResponseEntity<PagingResponse> runPaging(@Valid @RequestBody PagingRequest request) {
        return ResponseEntity.ok(pagingService.simulate(request));
    }

    /**
     * POST /api/paging/compare
     * Runs all 5 paging algorithms (FIFO, OPT, LRU, CLOCK, LFU) on the same string.
     */
    @PostMapping("/compare")
    public ResponseEntity<PagingComparisonResponse> comparePaging(
            @RequestParam(defaultValue = "3") int frameCount,
            @RequestBody List<Integer> referenceString) {
        return ResponseEntity.ok(pagingService.compare(referenceString, frameCount));
    }

    /**
     * POST /api/paging/belady-check
     * Analyzes Belady's Anomaly across frames 1 through 6 for FIFO.
     */
    @PostMapping("/belady-check")
    public ResponseEntity<Map<String, Object>> checkBelady(
            @RequestBody(required = false) List<Integer> referenceString) {
        return ResponseEntity.ok(pagingService.checkBeladyAnomaly(referenceString));
    }

    /**
     * POST /api/paging/verify-answer
     * AI Agent endpoint that grades and verifies student answers with step diagnostics.
     */
    @PostMapping("/verify-answer")
    public ResponseEntity<AnswerVerificationResponse> verifyAnswer(
            @Valid @RequestBody AnswerVerificationRequest request) {
        return ResponseEntity.ok(pagingService.verifyAnswer(request));
    }
}
