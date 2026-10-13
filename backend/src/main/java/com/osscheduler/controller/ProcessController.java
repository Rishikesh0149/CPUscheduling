package com.osscheduler.controller;

import com.osscheduler.dto.CreateProcessRequest;
import com.osscheduler.dto.ProcessResponse;
import com.osscheduler.service.SchedulingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for process management operations.
 */
@RestController
@RequestMapping("/api/processes")
public class ProcessController {

    private final SchedulingService schedulingService;

    public ProcessController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    /**
     * GET /api/processes
     * Returns all processes in input order.
     */
    @GetMapping
    public ResponseEntity<List<ProcessResponse>> getAllProcesses() {
        return ResponseEntity.ok(schedulingService.getAllProcesses());
    }

    /**
     * GET /api/processes/{pid}
     * Returns a single process by PID.
     */
    @GetMapping("/{pid}")
    public ResponseEntity<ProcessResponse> getProcess(@PathVariable String pid) {
        return ResponseEntity.ok(schedulingService.getProcess(pid));
    }

    /**
     * POST /api/processes
     * Creates a new process in NEW state.
     */
    @PostMapping
    public ResponseEntity<ProcessResponse> createProcess(
            @Valid @RequestBody CreateProcessRequest request) {
        ProcessResponse response = schedulingService.createProcess(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * DELETE /api/processes/{pid}
     * Removes a single process by PID.
     */
    @DeleteMapping("/{pid}")
    public ResponseEntity<Map<String, String>> deleteProcess(@PathVariable String pid) {
        schedulingService.deleteProcess(pid);
        return ResponseEntity.ok(Map.of("message", "Process '" + pid + "' removed successfully."));
    }

    /**
     * DELETE /api/processes
     * Removes all processes.
     */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteAllProcesses() {
        schedulingService.deleteAllProcesses();
        return ResponseEntity.ok(Map.of("message", "All processes cleared."));
    }

    /**
     * PUT /api/processes/{pid}/ready
     * Transitions a process from NEW to READY state.
     */
    @PutMapping("/{pid}/ready")
    public ResponseEntity<ProcessResponse> moveToReady(@PathVariable String pid) {
        return ResponseEntity.ok(schedulingService.moveToReady(pid));
    }
}
