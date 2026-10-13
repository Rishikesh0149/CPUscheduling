package com.osscheduler;

import com.osscheduler.dto.GanttSegment;
import com.osscheduler.dto.ProcessResult;
import com.osscheduler.dto.SchedulingResponse;
import com.osscheduler.model.Process;
import com.osscheduler.model.ProcessState;
import com.osscheduler.scheduler.SchedulingAlgorithms;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for all five CPU scheduling algorithm implementations.
 * Tests verify: completion times, TAT, WT, RT, averages, tie-breaking,
 * idle periods, SRTF preemption, and Round Robin queue ordering.
 */
class SchedulingAlgorithmsTest {

    private List<Process> processes;

    private Process makeProcess(String pid, int arrival, int burst, int priority, int order) {
        return new Process(pid, arrival, burst, priority, ProcessState.READY, order);
    }

    // =========================================================================
    // FCFS Tests
    // =========================================================================

    @Test
    @DisplayName("FCFS: basic single process")
    void fcfs_singleProcess() {
        List<Process> procs = List.of(makeProcess("P1", 0, 5, 1, 0));
        SchedulingResponse r = SchedulingAlgorithms.runFCFS(procs);

        assertEquals(1, r.getProcessResults().size());
        ProcessResult p = r.getProcessResults().get(0);

        assertEquals(0, p.getStartTime());
        assertEquals(5, p.getCompletionTime());
        assertEquals(5, p.getTurnaroundTime());
        assertEquals(0, p.getWaitingTime());
        assertEquals(0, p.getResponseTime());
        assertEquals(5, r.getFinalClock());
    }

    @Test
    @DisplayName("FCFS: three processes, no idle time")
    void fcfs_threeProcessesNoIdle() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 4, 1, 0),
                makeProcess("P2", 1, 3, 1, 1),
                makeProcess("P3", 2, 5, 1, 2)
        );
        SchedulingResponse r = SchedulingAlgorithms.runFCFS(procs);

        ProcessResult p1 = findResult(r, "P1");
        ProcessResult p2 = findResult(r, "P2");
        ProcessResult p3 = findResult(r, "P3");

        assertEquals(4, p1.getCompletionTime());
        assertEquals(7, p2.getCompletionTime());
        assertEquals(12, p3.getCompletionTime());

        assertEquals(4, p1.getTurnaroundTime());
        assertEquals(6, p2.getTurnaroundTime());
        assertEquals(10, p3.getTurnaroundTime());

        assertEquals(0, p1.getWaitingTime());
        assertEquals(3, p2.getWaitingTime());
        assertEquals(5, p3.getWaitingTime());
    }

    @Test
    @DisplayName("FCFS: idle period when first process arrives late")
    void fcfs_idlePeriod() {
        List<Process> procs = List.of(makeProcess("P1", 5, 3, 1, 0));
        SchedulingResponse r = SchedulingAlgorithms.runFCFS(procs);

        // Should have one IDLE segment [0,5] and one P1 segment [5,8]
        long idleCount = r.getGanttChart().stream().filter(GanttSegment::isIdle).count();
        assertEquals(1, idleCount);
        assertEquals(8, r.getFinalClock());

        ProcessResult p = findResult(r, "P1");
        assertEquals(5, p.getStartTime());
        assertEquals(8, p.getCompletionTime());
        assertEquals(3, p.getTurnaroundTime());
        assertEquals(0, p.getWaitingTime());
    }

    @Test
    @DisplayName("FCFS: average metrics calculation")
    void fcfs_averages() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 4, 1, 0),
                makeProcess("P2", 0, 3, 1, 1)
        );
        SchedulingResponse r = SchedulingAlgorithms.runFCFS(procs);

        // P1: WT=0, TAT=4 | P2: WT=4, TAT=7
        assertEquals(2.0, r.getAvgWaitingTime(), 0.01);
        assertEquals(5.5, r.getAvgTurnaroundTime(), 0.01);
    }

    // =========================================================================
    // SJF Tests
    // =========================================================================

    @Test
    @DisplayName("SJF: selects shortest burst time")
    void sjf_selectsShortest() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 6, 1, 0),
                makeProcess("P2", 0, 3, 1, 1),
                makeProcess("P3", 0, 8, 1, 2)
        );
        SchedulingResponse r = SchedulingAlgorithms.runSJF(procs);

        // Order should be P2 (3), P1 (6), P3 (8)
        List<ProcessResult> results = r.getProcessResults();
        assertEquals("P2", results.get(0).getPid());
    }

    @Test
    @DisplayName("SJF: tie-breaking by arrival time then input order")
    void sjf_tieBreakerArrivalThenOrder() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 4, 1, 0),
                makeProcess("P2", 0, 4, 1, 1)
        );
        SchedulingResponse r = SchedulingAlgorithms.runSJF(procs);

        // Same burst, same arrival → P1 (inputOrder 0) first
        assertEquals("P1", r.getProcessResults().get(0).getPid());
    }

    @Test
    @DisplayName("SJF: handles idle period")
    void sjf_idlePeriod() {
        List<Process> procs = List.of(makeProcess("P1", 10, 5, 1, 0));
        SchedulingResponse r = SchedulingAlgorithms.runSJF(procs);

        long idleCount = r.getGanttChart().stream().filter(GanttSegment::isIdle).count();
        assertEquals(1, idleCount);
        assertEquals(15, r.getFinalClock());
    }

    // =========================================================================
    // SRTF Tests
    // =========================================================================

    @Test
    @DisplayName("SRTF: preempts when shorter process arrives")
    void srtf_preemption() {
        // P1 arrives at 0 with burst 6, P2 arrives at 2 with burst 3
        // P1 runs [0,2], then P2 preempts, P2 runs [2,5], P1 resumes [5,9]
        List<Process> procs = List.of(
                makeProcess("P1", 0, 6, 1, 0),
                makeProcess("P2", 2, 3, 1, 1)
        );
        SchedulingResponse r = SchedulingAlgorithms.runSRTF(procs);

        ProcessResult p1 = findResult(r, "P1");
        ProcessResult p2 = findResult(r, "P2");

        assertEquals(0, p1.getStartTime());   // first start
        assertEquals(9, p1.getCompletionTime());

        assertEquals(2, p2.getStartTime());
        assertEquals(5, p2.getCompletionTime());
    }

    @Test
    @DisplayName("SRTF: response time is first execution time")
    void srtf_responseTime() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 5, 1, 0),
                makeProcess("P2", 1, 2, 1, 1)
        );
        SchedulingResponse r = SchedulingAlgorithms.runSRTF(procs);

        ProcessResult p2 = findResult(r, "P2");
        assertEquals(1, p2.getStartTime());
        assertEquals(0, p2.getResponseTime()); // started at arrival=1
    }

    @Test
    @DisplayName("SRTF: merged Gantt segments for same consecutive process")
    void srtf_mergedSegments() {
        // P1 alone, no preemption → one segment
        List<Process> procs = List.of(makeProcess("P1", 0, 4, 1, 0));
        SchedulingResponse r = SchedulingAlgorithms.runSRTF(procs);

        long p1Segments = r.getGanttChart().stream()
                .filter(s -> "P1".equals(s.getPid())).count();
        assertEquals(1, p1Segments);
    }

    // =========================================================================
    // Priority Scheduling Tests
    // =========================================================================

    @Test
    @DisplayName("Priority: lower number runs first")
    void priority_lowerNumberFirst() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 4, 3, 0),
                makeProcess("P2", 0, 3, 1, 1),
                makeProcess("P3", 0, 5, 2, 2)
        );
        SchedulingResponse r = SchedulingAlgorithms.runPriority(procs);

        // Order: P2 (pri 1), P3 (pri 2), P1 (pri 3)
        assertEquals("P2", r.getProcessResults().get(0).getPid());
        assertEquals("P3", r.getProcessResults().get(1).getPid());
        assertEquals("P1", r.getProcessResults().get(2).getPid());
    }

    @Test
    @DisplayName("Priority: tie-breaking by arrival then input order")
    void priority_tieBreaking() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 4, 1, 0),
                makeProcess("P2", 0, 3, 1, 1)
        );
        SchedulingResponse r = SchedulingAlgorithms.runPriority(procs);

        assertEquals("P1", r.getProcessResults().get(0).getPid());
    }

    @Test
    @DisplayName("Priority: idle period handling")
    void priority_idlePeriod() {
        List<Process> procs = List.of(makeProcess("P1", 5, 3, 1, 0));
        SchedulingResponse r = SchedulingAlgorithms.runPriority(procs);

        long idleCount = r.getGanttChart().stream().filter(GanttSegment::isIdle).count();
        assertEquals(1, idleCount);
    }

    // =========================================================================
    // Round Robin Tests
    // =========================================================================

    @Test
    @DisplayName("Round Robin: basic quantum=2, two processes")
    void rr_basicQuantum2() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 4, 1, 0),
                makeProcess("P2", 0, 4, 1, 1)
        );
        SchedulingResponse r = SchedulingAlgorithms.runRoundRobin(procs, 2);

        ProcessResult p1 = findResult(r, "P1");
        ProcessResult p2 = findResult(r, "P2");

        // P1:[0,2], P2:[2,4], P1:[4,6], P2:[6,8]
        assertEquals(6, p1.getCompletionTime());
        assertEquals(8, p2.getCompletionTime());
    }

    @Test
    @DisplayName("Round Robin: process arriving during a time slice joins after current running process")
    void rr_arrivalDuringSlice() {
        // P1 arrives at 0 with burst 4 (quantum 3), P2 arrives at 2 with burst 2
        List<Process> procs = List.of(
                makeProcess("P1", 0, 4, 1, 0),
                makeProcess("P2", 2, 2, 1, 1)
        );
        SchedulingResponse r = SchedulingAlgorithms.runRoundRobin(procs, 3);

        // P1 runs [0,3], P2 arrives at 2 → joins queue at time 3
        // P2 runs [3,5], P1 resumes [5,6]
        ProcessResult p1 = findResult(r, "P1");
        ProcessResult p2 = findResult(r, "P2");

        assertEquals(6, p1.getCompletionTime());
        assertEquals(5, p2.getCompletionTime());
    }

    @Test
    @DisplayName("Round Robin: first start time used for response time")
    void rr_responseTime() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 6, 1, 0),
                makeProcess("P2", 0, 4, 1, 1)
        );
        SchedulingResponse r = SchedulingAlgorithms.runRoundRobin(procs, 2);

        ProcessResult p2 = findResult(r, "P2");
        // P2 first runs at t=2
        assertEquals(2, p2.getStartTime());
        assertEquals(2, p2.getResponseTime());
    }

    @Test
    @DisplayName("Round Robin: idle period when queue is empty")
    void rr_idlePeriod() {
        List<Process> procs = List.of(makeProcess("P1", 5, 3, 1, 0));
        SchedulingResponse r = SchedulingAlgorithms.runRoundRobin(procs, 2);

        long idleCount = r.getGanttChart().stream().filter(GanttSegment::isIdle).count();
        assertEquals(1, idleCount);
    }

    @Test
    @DisplayName("Round Robin: single process completes in one quantum burst")
    void rr_singleProcessWithinQuantum() {
        List<Process> procs = List.of(makeProcess("P1", 0, 2, 1, 0));
        SchedulingResponse r = SchedulingAlgorithms.runRoundRobin(procs, 5);

        ProcessResult p1 = findResult(r, "P1");
        assertEquals(2, p1.getCompletionTime());
        assertEquals(0, p1.getWaitingTime());
    }

    // =========================================================================
    // Cross-Algorithm Tests
    // =========================================================================

    @Test
    @DisplayName("TAT = CT - AT formula verified for all algorithms")
    void allAlgorithms_tatFormula() {
        List<Process> procs = List.of(
                makeProcess("P1", 0, 5, 2, 0),
                makeProcess("P2", 1, 3, 1, 1)
        );

        for (SchedulingResponse r : List.of(
                SchedulingAlgorithms.runFCFS(procs),
                SchedulingAlgorithms.runSJF(procs),
                SchedulingAlgorithms.runSRTF(procs),
                SchedulingAlgorithms.runPriority(procs),
                SchedulingAlgorithms.runRoundRobin(procs, 2))) {

            for (ProcessResult pr : r.getProcessResults()) {
                assertEquals(pr.getCompletionTime() - pr.getArrivalTime(),
                        pr.getTurnaroundTime(),
                        "TAT mismatch in " + r.getAlgorithm() + " for " + pr.getPid());
                assertEquals(pr.getTurnaroundTime() - pr.getBurstTime(),
                        pr.getWaitingTime(),
                        "WT mismatch in " + r.getAlgorithm() + " for " + pr.getPid());
                assertEquals(pr.getStartTime() - pr.getArrivalTime(),
                        pr.getResponseTime(),
                        "RT mismatch in " + r.getAlgorithm() + " for " + pr.getPid());
            }
        }
    }

    @Test
    @DisplayName("All algorithms: process count matches input")
    void allAlgorithms_processCount() {
        List<Process> procs = List.of(
                makeProcess("A", 0, 3, 1, 0),
                makeProcess("B", 1, 4, 2, 1),
                makeProcess("C", 2, 2, 1, 2)
        );

        assertEquals(3, SchedulingAlgorithms.runFCFS(procs).getTotalProcesses());
        assertEquals(3, SchedulingAlgorithms.runSJF(procs).getTotalProcesses());
        assertEquals(3, SchedulingAlgorithms.runSRTF(procs).getTotalProcesses());
        assertEquals(3, SchedulingAlgorithms.runPriority(procs).getTotalProcesses());
        assertEquals(3, SchedulingAlgorithms.runRoundRobin(procs, 2).getTotalProcesses());
    }

    // =========================================================================
    // Helper
    // =========================================================================

    private ProcessResult findResult(SchedulingResponse r, String pid) {
        return r.getProcessResults().stream()
                .filter(p -> pid.equals(p.getPid()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Process " + pid + " not found in results"));
    }
}
