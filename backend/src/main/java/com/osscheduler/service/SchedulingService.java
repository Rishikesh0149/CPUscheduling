package com.osscheduler.service;

import com.osscheduler.dto.*;
import com.osscheduler.exception.DuplicateProcessException;
import com.osscheduler.exception.InvalidStateTransitionException;
import com.osscheduler.exception.ProcessNotFoundException;
import com.osscheduler.model.Process;
import com.osscheduler.model.ProcessState;
import com.osscheduler.model.SchedulingHistory;
import com.osscheduler.repository.ProcessRepository;
import com.osscheduler.repository.SchedulingHistoryRepository;
import com.osscheduler.scheduler.SchedulingAlgorithms;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for all process management and scheduling operations.
 */
@Service
public class SchedulingService {

    private final ProcessRepository processRepository;
    private final SchedulingHistoryRepository historyRepository;

    public SchedulingService(ProcessRepository processRepository,
                             SchedulingHistoryRepository historyRepository) {
        this.processRepository = processRepository;
        this.historyRepository = historyRepository;
    }

    // =========================================================================
    // Process Management
    // =========================================================================

    public List<ProcessResponse> getAllProcesses() {
        return processRepository.findAllByOrderByInputOrderAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProcessResponse getProcess(String pid) {
        return toResponse(findOrThrow(pid));
    }

    @Transactional
    public ProcessResponse createProcess(CreateProcessRequest request) {
        String pid = request.getPid().trim();

        // Case-insensitive duplicate check
        if (processRepository.existsByPidIgnoreCase(pid)) {
            throw new DuplicateProcessException(pid);
        }

        int nextOrder = (int) processRepository.count();

        Process process = new Process(
                pid,
                request.getArrivalTime(),
                request.getBurstTime(),
                request.getPriority(),
                ProcessState.NEW,
                nextOrder
        );

        return toResponse(processRepository.save(process));
    }

    @Transactional
    public void deleteProcess(String pid) {
        Process p = findOrThrow(pid);
        processRepository.delete(p);
    }

    @Transactional
    public void deleteAllProcesses() {
        processRepository.deleteAll();
    }

    @Transactional
    public ProcessResponse moveToReady(String pid) {
        Process p = findOrThrow(pid);

        if (p.getState() != ProcessState.NEW) {
            throw new InvalidStateTransitionException(pid,
                    p.getState().name(), ProcessState.READY.name());
        }

        p.setState(ProcessState.READY);
        return toResponse(processRepository.save(p));
    }

    // =========================================================================
    // Scheduling
    // =========================================================================

    @Transactional
    public SchedulingResponse runScheduling(SchedulingRequest request) {
        List<Process> processes = processRepository.findAllByOrderByInputOrderAsc();

        if (processes.isEmpty()) {
            throw new IllegalArgumentException("No processes available to schedule. Add at least one process first.");
        }

        SchedulingResponse response = executeAlgorithm(request.getAlgorithm(), request.getTimeQuantum(), processes);

        // Mark all participating processes as TERMINATED
        for (Process p : processes) {
            p.setState(ProcessState.TERMINATED);
        }
        processRepository.saveAll(processes);

        // Save to history
        saveHistory(response);

        return response;
    }

    public CompareResponse compareAlgorithms(CompareRequest request) {
        List<Process> processes = processRepository.findAllByOrderByInputOrderAsc();

        if (processes.isEmpty()) {
            throw new IllegalArgumentException("No processes available to compare. Add at least one process first.");
        }

        String[] algorithms = {"FCFS", "SJF", "SRTF", "Priority", "Round Robin"};
        List<AlgorithmComparison> comparisons = new java.util.ArrayList<>();

        for (String algo : algorithms) {
            SchedulingResponse result = executeAlgorithm(algo, request.getTimeQuantum(), processes);
            comparisons.add(new AlgorithmComparison(
                    algo,
                    result.getAvgWaitingTime(),
                    result.getAvgTurnaroundTime(),
                    result.getAvgResponseTime()
            ));
        }

        // Find best algorithms (lowest average)
        String bestWT = comparisons.stream()
                .min(java.util.Comparator.comparingDouble(AlgorithmComparison::getAvgWaitingTime))
                .map(AlgorithmComparison::getAlgorithm).orElse("N/A");
        String bestTAT = comparisons.stream()
                .min(java.util.Comparator.comparingDouble(AlgorithmComparison::getAvgTurnaroundTime))
                .map(AlgorithmComparison::getAlgorithm).orElse("N/A");
        String bestRT = comparisons.stream()
                .min(java.util.Comparator.comparingDouble(AlgorithmComparison::getAvgResponseTime))
                .map(AlgorithmComparison::getAlgorithm).orElse("N/A");

        CompareResponse compareResponse = new CompareResponse();
        compareResponse.setResults(comparisons);
        compareResponse.setBestWaitingTime(bestWT);
        compareResponse.setBestTurnaroundTime(bestTAT);
        compareResponse.setBestResponseTime(bestRT);
        compareResponse.setTimeQuantum(request.getTimeQuantum());

        return compareResponse;
    }

    // =========================================================================
    // History
    // =========================================================================

    public List<SchedulingHistory> getHistory() {
        return historyRepository.findAllByOrderByRunAtDesc();
    }

    public SchedulingHistory getHistoryById(Long id) {
        return historyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("History record " + id + " not found."));
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private SchedulingResponse executeAlgorithm(String algorithm, int quantum, List<Process> processes) {
        return switch (algorithm.trim().toUpperCase()) {
            case "FCFS" -> SchedulingAlgorithms.runFCFS(processes);
            case "SJF" -> SchedulingAlgorithms.runSJF(processes);
            case "SRTF" -> SchedulingAlgorithms.runSRTF(processes);
            case "PRIORITY" -> SchedulingAlgorithms.runPriority(processes);
            case "ROUND ROBIN", "RR" -> SchedulingAlgorithms.runRoundRobin(processes, quantum);
            default -> throw new IllegalArgumentException("Unknown algorithm: " + algorithm
                    + ". Valid options: FCFS, SJF, SRTF, Priority, Round Robin");
        };
    }

    private void saveHistory(SchedulingResponse response) {
        SchedulingHistory history = new SchedulingHistory();
        history.setAlgorithm(response.getAlgorithm());
        history.setProcessCount(response.getTotalProcesses());
        history.setAvgWaitingTime(response.getAvgWaitingTime());
        history.setAvgTurnaroundTime(response.getAvgTurnaroundTime());
        history.setAvgResponseTime(response.getAvgResponseTime());
        history.setTotalCpuTime(response.getTotalCpuTime());
        history.setTotalIdleTime(response.getTotalIdleTime());
        history.setFinalClock(response.getFinalClock());
        historyRepository.save(history);
    }

    private Process findOrThrow(String pid) {
        return processRepository.findByPidIgnoreCase(pid)
                .orElseThrow(() -> new ProcessNotFoundException(pid));
    }

    private ProcessResponse toResponse(Process p) {
        return new ProcessResponse(p.getPid(), p.getArrivalTime(), p.getBurstTime(),
                p.getPriority(), p.getState(), p.getInputOrder());
    }
}
