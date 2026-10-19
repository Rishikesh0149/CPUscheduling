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
    // AI Verification Agent for CPU Scheduling
    // =========================================================================

    public SchedulingVerificationResponse verifySchedulingAnswer(SchedulingVerificationRequest request) {
        java.util.List<Process> processes = new java.util.ArrayList<>();
        if (request.getProcesses() != null && !request.getProcesses().isEmpty()) {
            int idx = 0;
            for (CreateProcessRequest c : request.getProcesses()) {
                Process p = new Process(c.getPid(), c.getArrivalTime(), c.getBurstTime(), c.getPriority(), ProcessState.READY, idx++);
                processes.add(p);
            }
        } else {
            processes = processRepository.findAllByOrderByInputOrderAsc();
        }

        if (processes.isEmpty()) {
            throw new IllegalArgumentException("No processes specified for verification. Provide a process list or load sample processes.");
        }

        SchedulingResponse truth = executeAlgorithm(request.getAlgorithm(), request.getTimeQuantum(), processes);

        SchedulingVerificationResponse resp = new SchedulingVerificationResponse();
        resp.setSimulationResult(truth);
        resp.setActualAvgWaitingTime(truth.getAvgWaitingTime());
        resp.setActualAvgTurnaroundTime(truth.getAvgTurnaroundTime());
        resp.setActualAvgResponseTime(truth.getAvgResponseTime());
        resp.setActualFinalClock(truth.getFinalClock());

        java.util.Map<String, Boolean> breakdown = new java.util.LinkedHashMap<>();
        java.util.List<String> discrepancies = new java.util.ArrayList<>();
        java.util.List<String> processDiagnostics = new java.util.ArrayList<>();
        java.util.List<String> ganttComparison = new java.util.ArrayList<>();
        java.util.List<String> tips = new java.util.ArrayList<>();

        double score = 100.0;

        // 1. Check Avg Waiting Time
        if (request.getUserAvgWaitingTime() != null) {
            double diff = Math.abs(request.getUserAvgWaitingTime() - truth.getAvgWaitingTime());
            boolean ok = diff < 0.15;
            breakdown.put("Average Waiting Time", ok);
            if (!ok) {
                score -= 30.0;
                discrepancies.add("Your predicted Avg Waiting Time was " + request.getUserAvgWaitingTime() +
                        ", but the actual value is " + truth.getAvgWaitingTime() + ".");
            }
        }

        // 2. Check Avg Turnaround Time
        if (request.getUserAvgTurnaroundTime() != null) {
            double diff = Math.abs(request.getUserAvgTurnaroundTime() - truth.getAvgTurnaroundTime());
            boolean ok = diff < 0.15;
            breakdown.put("Average Turnaround Time", ok);
            if (!ok) {
                score -= 30.0;
                discrepancies.add("Your predicted Avg Turnaround Time was " + request.getUserAvgTurnaroundTime() +
                        ", but the actual value is " + truth.getAvgTurnaroundTime() + ".");
            }
        }

        // 3. Check Avg Response Time
        if (request.getUserAvgResponseTime() != null) {
            double diff = Math.abs(request.getUserAvgResponseTime() - truth.getAvgResponseTime());
            boolean ok = diff < 0.15;
            breakdown.put("Average Response Time", ok);
            if (!ok) {
                score -= 15.0;
                discrepancies.add("Your predicted Avg Response Time was " + request.getUserAvgResponseTime() +
                        ", but the actual value is " + truth.getAvgResponseTime() + ".");
            }
        }

        // 4. Check Final Clock / Total Completion
        if (request.getUserFinalClock() != null) {
            boolean ok = (request.getUserFinalClock() == truth.getFinalClock());
            breakdown.put("Total Completion Time (Final Clock)", ok);
            if (!ok) {
                score -= 15.0;
                discrepancies.add("Your calculated Final Clock was " + request.getUserFinalClock() +
                        ", but the scheduler terminated at clock tick " + truth.getFinalClock() + ".");
            }
        }

        // 5. Check Process-level results if provided
        if (request.getUserProcessResults() != null && !request.getUserProcessResults().isEmpty()) {
            java.util.Map<String, ProcessResult> truthMap = truth.getProcessResults().stream()
                    .collect(java.util.stream.Collectors.toMap(ProcessResult::getPid, p -> p));

            int procMatched = 0;
            for (ProcessResult up : request.getUserProcessResults()) {
                ProcessResult tp = truthMap.get(up.getPid());
                if (tp != null) {
                    boolean ctOk = (up.getCompletionTime() == tp.getCompletionTime());
                    boolean tatOk = (up.getTurnaroundTime() == tp.getTurnaroundTime());
                    boolean wtOk = (up.getWaitingTime() == tp.getWaitingTime());

                    if (ctOk && tatOk && wtOk) {
                        procMatched++;
                        processDiagnostics.add("Process " + up.getPid() + ": Correctly calculated (CT=" + tp.getCompletionTime() +
                                ", TAT=" + tp.getTurnaroundTime() + ", WT=" + tp.getWaitingTime() + ")");
                    } else {
                        StringBuilder sb = new StringBuilder("Process " + up.getPid() + " mismatch: ");
                        if (!ctOk) sb.append("Predicted CT=").append(up.getCompletionTime()).append(" (Actual=").append(tp.getCompletionTime()).append("); ");
                        if (!tatOk) sb.append("Predicted TAT=").append(up.getTurnaroundTime()).append(" (Actual=").append(tp.getTurnaroundTime()).append("); ");
                        if (!wtOk) sb.append("Predicted WT=").append(up.getWaitingTime()).append(" (Actual=").append(tp.getWaitingTime()).append("); ");
                        processDiagnostics.add(sb.toString());
                    }
                }
            }

            boolean allProcsOk = (procMatched == truth.getProcessResults().size());
            breakdown.put("Process Details (CT, TAT, WT)", allProcsOk);
            if (!allProcsOk) score -= 10.0;
        }

        // 6. Check Gantt Execution Order if provided
        if (request.getUserGanttOrder() != null && !request.getUserGanttOrder().isEmpty()) {
            java.util.List<String> actualGanttOrder = truth.getGanttChart().stream()
                    .filter(g -> !g.isIdle())
                    .map(GanttSegment::getPid)
                    .collect(java.util.stream.Collectors.toList());

            boolean orderMatch = request.getUserGanttOrder().equals(actualGanttOrder);
            breakdown.put("Gantt Execution Order", orderMatch);
            if (!orderMatch) {
                score -= 10.0;
                discrepancies.add("Your Gantt execution sequence " + request.getUserGanttOrder() +
                        " did not match the actual execution sequence " + actualGanttOrder + ".");
            }
        }

        if (score < 0) score = 0;
        resp.setScorePercentage(score);
        resp.setCorrect(score >= 95.0);

        if (score >= 95.0) {
            resp.setVerdictTitle("Verification Passed: 100% Accurate CPU Schedule!");
            resp.setSummaryMessage("Brilliant work! Your calculated metrics and scheduling execution trace match the " +
                    truth.getAlgorithm() + " algorithm completely.");
        } else if (score >= 60.0) {
            resp.setVerdictTitle("Partially Correct (" + (int) score + "%)");
            resp.setSummaryMessage("Good attempt! Your grasp of " + truth.getAlgorithm() + " is solid, but some completion or turnaround time calculations diverged.");
        } else {
            resp.setVerdictTitle("Calculation Discrepancies Detected (" + (int) score + "%)");
            resp.setSummaryMessage("The AI Agent found calculation errors between your submission and the actual " +
                    truth.getAlgorithm() + " schedule.");
        }

        // Gantt Chart segment summary
        for (GanttSegment seg : truth.getGanttChart()) {
            ganttComparison.add("[" + seg.getStart() + " -> " + seg.getEnd() + "] " +
                    (seg.isIdle() ? "CPU IDLE" : "Process " + seg.getPid()) +
                    " (Duration: " + seg.getDuration() + ")");
        }

        // Pedagogical Guidance Tips for CPU Scheduling
        String algo = truth.getAlgorithm().toUpperCase();
        if (algo.contains("FCFS")) {
            tips.add("FCFS Rule: Processes are dispatched in strict arrival order (or input order if arrival times tie).");
            tips.add("Remember Convoy Effect: A CPU-heavy process at the head can significantly inflate average waiting time.");
        } else if (algo.contains("SJF")) {
            tips.add("SJF Rule: Non-preemptive. Among processes currently arrived at the clock time, pick the one with the smallest burst time.");
            tips.add("Once a job starts executing in SJF, it runs until completion without preemption.");
        } else if (algo.contains("SRTF")) {
            tips.add("SRTF Rule: Preemptive. At every time unit (especially on new arrivals), evaluate remaining burst times.");
            tips.add("If a newly arrived process has shorter remaining time than current running process, preempt immediately!");
        } else if (algo.contains("PRIORITY")) {
            tips.add("Priority Rule: Lower priority number indicates higher scheduling priority (e.g., Priority 1 > Priority 2).");
            tips.add("In this non-preemptive implementation, once a job gains the CPU, it runs to completion.");
        } else if (algo.contains("ROUND ROBIN") || algo.contains("RR")) {
            tips.add("Round Robin Rule: Each ready process is given a time quantum of " + truth.getTimeQuantum() + " time units.");
            tips.add("Newly arrived processes are queued before a preempted process re-enters the ready queue.");
        }

        resp.setBreakdown(breakdown);
        resp.setDiscrepancies(discrepancies);
        resp.setProcessDiagnostics(processDiagnostics);
        resp.setGanttComparison(ganttComparison);
        resp.setPedagogicalTips(tips);

        return resp;
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
