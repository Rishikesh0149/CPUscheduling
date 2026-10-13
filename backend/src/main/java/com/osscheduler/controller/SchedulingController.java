package com.osscheduler.controller;

import com.osscheduler.dto.CompareRequest;
import com.osscheduler.dto.CompareResponse;
import com.osscheduler.dto.SchedulingRequest;
import com.osscheduler.dto.SchedulingResponse;
import com.osscheduler.model.SchedulingHistory;
import com.osscheduler.service.SchedulingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for CPU scheduling operations.
 */
@RestController
@RequestMapping("/api/scheduling")
public class SchedulingController {

    private final SchedulingService schedulingService;

    public SchedulingController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    /**
     * POST /api/scheduling/run
     * Runs a scheduling algorithm on the current process list.
     * Marks all processes TERMINATED after completion.
     */
    @PostMapping("/run")
    public ResponseEntity<SchedulingResponse> runScheduling(
            @Valid @RequestBody SchedulingRequest request) {
        return ResponseEntity.ok(schedulingService.runScheduling(request));
    }

    /**
     * POST /api/scheduling/compare
     * Compares all five algorithms using the same process data.
     * Does NOT mutate process states.
     */
    @PostMapping("/compare")
    public ResponseEntity<CompareResponse> compareAlgorithms(
            @Valid @RequestBody CompareRequest request) {
        return ResponseEntity.ok(schedulingService.compareAlgorithms(request));
    }

    /**
     * GET /api/scheduling/history
     * Returns all past scheduling run summaries.
     */
    @GetMapping("/history")
    public ResponseEntity<List<SchedulingHistory>> getHistory() {
        return ResponseEntity.ok(schedulingService.getHistory());
    }

    /**
     * GET /api/scheduling/history/{id}
     * Returns a specific history record by ID.
     */
    @GetMapping("/history/{id}")
    public ResponseEntity<SchedulingHistory> getHistoryById(@PathVariable Long id) {
        return ResponseEntity.ok(schedulingService.getHistoryById(id));
    }
}
