package com.osscheduler.scheduler;

import com.osscheduler.dto.GanttSegment;
import com.osscheduler.dto.ProcessResult;
import com.osscheduler.dto.SchedulingResponse;
import com.osscheduler.model.Process;

import java.util.*;

/**
 * Contains all five CPU scheduling algorithm implementations.
 * Each method takes a fresh copy of processes and returns a SchedulingResponse.
 * This class is stateless — it never mutates the Process entities passed in.
 */
public class SchedulingAlgorithms {

    // =====================================================================
    // FCFS — First Come, First Served (Non-Preemptive)
    // =====================================================================
    public static SchedulingResponse runFCFS(List<Process> processes) {
        List<ProcessInfo> jobs = toInfoList(processes);

        // Sort by arrival time; preserve input order for ties
        jobs.sort(Comparator.comparingInt((ProcessInfo p) -> p.arrival)
                .thenComparingInt(p -> p.inputOrder));

        List<GanttSegment> gantt = new ArrayList<>();
        int clock = 0;

        for (ProcessInfo p : jobs) {
            if (clock < p.arrival) {
                gantt.add(new GanttSegment("IDLE", clock, p.arrival, true));
                clock = p.arrival;
            }
            p.firstStart = clock;
            p.completion = clock + p.burst;
            gantt.add(new GanttSegment(p.pid, clock, p.completion, false));
            clock = p.completion;
        }

        return buildResponse("FCFS", 0, jobs, gantt);
    }

    // =====================================================================
    // SJF — Shortest Job First (Non-Preemptive)
    // =====================================================================
    public static SchedulingResponse runSJF(List<Process> processes) {
        List<ProcessInfo> jobs = toInfoList(processes);
        List<ProcessInfo> completed = new ArrayList<>();
        List<GanttSegment> gantt = new ArrayList<>();
        int time = 0;

        while (completed.size() < jobs.size()) {
            ProcessInfo best = null;

            for (ProcessInfo p : jobs) {
                if (!completed.contains(p) && p.arrival <= time) {
                    if (best == null
                            || p.burst < best.burst
                            || (p.burst == best.burst && p.arrival < best.arrival)
                            || (p.burst == best.burst && p.arrival == best.arrival
                                    && p.inputOrder < best.inputOrder)) {
                        best = p;
                    }
                }
            }

            if (best == null) {
                // CPU idle — jump to the next arriving process
                int nextArrival = jobs.stream()
                        .filter(p -> !completed.contains(p))
                        .mapToInt(p -> p.arrival)
                        .min().orElse(time + 1);
                gantt.add(new GanttSegment("IDLE", time, nextArrival, true));
                time = nextArrival;
                continue;
            }

            best.firstStart = time;
            best.completion = time + best.burst;
            gantt.add(new GanttSegment(best.pid, time, best.completion, false));
            time = best.completion;
            completed.add(best);
        }

        return buildResponse("SJF", 0, completed, gantt);
    }

    // =====================================================================
    // SRTF — Shortest Remaining Time First (Preemptive)
    // =====================================================================
    public static SchedulingResponse runSRTF(List<Process> processes) {
        List<ProcessInfo> jobs = toInfoList(processes);
        int n = jobs.size();
        int[] remaining = new int[n];
        int[] firstStart = new int[n];
        int[] completion = new int[n];
        Arrays.fill(firstStart, -1);
        for (int i = 0; i < n; i++) remaining[i] = jobs.get(i).burst;

        int time = 0, finished = 0;
        List<GanttSegment> gantt = new ArrayList<>();
        String lastPid = null;
        int segStart = 0;

        while (finished < n) {
            int best = -1;
            for (int i = 0; i < n; i++) {
                ProcessInfo p = jobs.get(i);
                if (remaining[i] > 0 && p.arrival <= time) {
                    if (best == -1
                            || remaining[i] < remaining[best]
                            || (remaining[i] == remaining[best]
                                    && p.arrival < jobs.get(best).arrival)
                            || (remaining[i] == remaining[best]
                                    && p.arrival == jobs.get(best).arrival
                                    && p.inputOrder < jobs.get(best).inputOrder)) {
                        best = i;
                    }
                }
            }

            String currentPid = (best == -1) ? "IDLE" : jobs.get(best).pid;

            if (lastPid == null) {
                lastPid = currentPid;
                segStart = time;
            } else if (!lastPid.equals(currentPid)) {
                gantt.add(new GanttSegment(lastPid, segStart, time, "IDLE".equals(lastPid)));
                lastPid = currentPid;
                segStart = time;
            }

            if (best == -1) {
                time++;
                continue;
            }

            if (firstStart[best] == -1) firstStart[best] = time;
            remaining[best]--;
            time++;

            if (remaining[best] == 0) {
                completion[best] = time;
                finished++;
            }
        }

        // Flush last segment
        if (lastPid != null) {
            gantt.add(new GanttSegment(lastPid, segStart, time, "IDLE".equals(lastPid)));
        }

        for (int i = 0; i < n; i++) {
            ProcessInfo p = jobs.get(i);
            p.firstStart = firstStart[i];
            p.completion = completion[i];
        }

        return buildResponse("SRTF", 0, jobs, gantt);
    }

    // =====================================================================
    // Priority Scheduling (Non-Preemptive, lower number = higher priority)
    // =====================================================================
    public static SchedulingResponse runPriority(List<Process> processes) {
        List<ProcessInfo> jobs = toInfoList(processes);
        List<ProcessInfo> completed = new ArrayList<>();
        List<GanttSegment> gantt = new ArrayList<>();
        int time = 0;

        while (completed.size() < jobs.size()) {
            ProcessInfo best = null;

            for (ProcessInfo p : jobs) {
                if (!completed.contains(p) && p.arrival <= time) {
                    if (best == null
                            || p.priority < best.priority
                            || (p.priority == best.priority && p.arrival < best.arrival)
                            || (p.priority == best.priority && p.arrival == best.arrival
                                    && p.inputOrder < best.inputOrder)) {
                        best = p;
                    }
                }
            }

            if (best == null) {
                int nextArrival = jobs.stream()
                        .filter(p -> !completed.contains(p))
                        .mapToInt(p -> p.arrival)
                        .min().orElse(time + 1);
                gantt.add(new GanttSegment("IDLE", time, nextArrival, true));
                time = nextArrival;
                continue;
            }

            best.firstStart = time;
            best.completion = time + best.burst;
            gantt.add(new GanttSegment(best.pid, time, best.completion, false));
            time = best.completion;
            completed.add(best);
        }

        return buildResponse("Priority", 0, completed, gantt);
    }

    // =====================================================================
    // Round Robin (Preemptive with configurable time quantum)
    // =====================================================================
    public static SchedulingResponse runRoundRobin(List<Process> processes, int quantum) {
        List<ProcessInfo> jobs = toInfoList(processes);

        // Sort by arrival time for initial queue ordering
        jobs.sort(Comparator.comparingInt((ProcessInfo p) -> p.arrival)
                .thenComparingInt(p -> p.inputOrder));

        int n = jobs.size();
        int[] remaining = new int[n];
        int[] firstStart = new int[n];
        int[] completion = new int[n];
        Arrays.fill(firstStart, -1);
        for (int i = 0; i < n; i++) remaining[i] = jobs.get(i).burst;

        Queue<Integer> queue = new ArrayDeque<>();
        List<GanttSegment> gantt = new ArrayList<>();
        int time = 0, next = 0, finished = 0;

        while (finished < n) {
            // Handle idle period
            if (queue.isEmpty() && next < n && time < jobs.get(next).arrival) {
                int nextArrival = jobs.get(next).arrival;
                gantt.add(new GanttSegment("IDLE", time, nextArrival, true));
                time = nextArrival;
            }

            // Enqueue newly arrived processes
            while (next < n && jobs.get(next).arrival <= time) {
                queue.add(next++);
            }

            if (queue.isEmpty()) continue;

            int index = queue.remove();
            ProcessInfo p = jobs.get(index);

            if (firstStart[index] == -1) firstStart[index] = time;

            int runTime = Math.min(quantum, remaining[index]);
            int segStart = time;
            time += runTime;
            remaining[index] -= runTime;

            gantt.add(new GanttSegment(p.pid, segStart, time, false));

            // Processes arriving during this time slice join before requeue
            while (next < n && jobs.get(next).arrival <= time) {
                queue.add(next++);
            }

            if (remaining[index] > 0) {
                queue.add(index);
            } else {
                completion[index] = time;
                finished++;
            }
        }

        for (int i = 0; i < n; i++) {
            jobs.get(i).firstStart = firstStart[i];
            jobs.get(i).completion = completion[i];
        }

        return buildResponse("Round Robin", quantum, jobs, gantt);
    }

    // =====================================================================
    // Helper: Convert Process entities to internal mutable ProcessInfo
    // =====================================================================
    private static List<ProcessInfo> toInfoList(List<Process> processes) {
        List<ProcessInfo> list = new ArrayList<>();
        for (Process p : processes) {
            list.add(new ProcessInfo(p.getPid(), p.getArrivalTime(),
                    p.getBurstTime(), p.getPriority(), p.getInputOrder()));
        }
        return list;
    }

    // =====================================================================
    // Helper: Build SchedulingResponse from results
    // =====================================================================
    private static SchedulingResponse buildResponse(String algorithm, int quantum,
                                                     List<ProcessInfo> jobs,
                                                     List<GanttSegment> gantt) {
        List<ProcessResult> results = new ArrayList<>();
        double totalWT = 0, totalTAT = 0, totalRT = 0;
        int totalCpu = 0, totalIdle = 0;

        for (ProcessInfo p : jobs) {
            int tat = p.completion - p.arrival;
            int wt = tat - p.burst;
            int rt = p.firstStart - p.arrival;

            totalWT += wt;
            totalTAT += tat;
            totalRT += rt;
            totalCpu += p.burst;

            results.add(new ProcessResult(p.pid, p.arrival, p.burst,
                    p.firstStart, p.completion, tat, wt, rt));
        }

        for (GanttSegment seg : gantt) {
            if (seg.isIdle()) totalIdle += seg.getDuration();
        }

        int n = jobs.size();
        int finalClock = gantt.isEmpty() ? 0 : gantt.get(gantt.size() - 1).getEnd();

        SchedulingResponse response = new SchedulingResponse();
        response.setAlgorithm(algorithm);
        response.setTimeQuantum(quantum);
        response.setProcessResults(results);
        response.setGanttChart(gantt);
        response.setAvgWaitingTime(n > 0 ? totalWT / n : 0);
        response.setAvgTurnaroundTime(n > 0 ? totalTAT / n : 0);
        response.setAvgResponseTime(n > 0 ? totalRT / n : 0);
        response.setTotalProcesses(n);
        response.setTotalCpuTime(totalCpu);
        response.setTotalIdleTime(totalIdle);
        response.setFinalClock(finalClock);

        return response;
    }

    // =====================================================================
    // Internal mutable representation used during algorithm execution
    // =====================================================================
    static class ProcessInfo {
        String pid;
        int arrival, burst, priority, inputOrder;
        int firstStart = 0;
        int completion = 0;

        ProcessInfo(String pid, int arrival, int burst, int priority, int inputOrder) {
            this.pid = pid;
            this.arrival = arrival;
            this.burst = burst;
            this.priority = priority;
            this.inputOrder = inputOrder;
        }
    }
}
