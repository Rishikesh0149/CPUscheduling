package com.osscheduler.dto;

import java.util.List;

/**
 * Full scheduling result response returned from a run.
 */
public class SchedulingResponse {

    private String algorithm;
    private int timeQuantum;
    private List<ProcessResult> processResults;
    private List<GanttSegment> ganttChart;
    private double avgWaitingTime;
    private double avgTurnaroundTime;
    private double avgResponseTime;
    private int totalProcesses;
    private int totalCpuTime;
    private int totalIdleTime;
    private int finalClock;

    public SchedulingResponse() {}

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public int getTimeQuantum() { return timeQuantum; }
    public void setTimeQuantum(int timeQuantum) { this.timeQuantum = timeQuantum; }

    public List<ProcessResult> getProcessResults() { return processResults; }
    public void setProcessResults(List<ProcessResult> processResults) { this.processResults = processResults; }

    public List<GanttSegment> getGanttChart() { return ganttChart; }
    public void setGanttChart(List<GanttSegment> ganttChart) { this.ganttChart = ganttChart; }

    public double getAvgWaitingTime() { return avgWaitingTime; }
    public void setAvgWaitingTime(double avgWaitingTime) { this.avgWaitingTime = avgWaitingTime; }

    public double getAvgTurnaroundTime() { return avgTurnaroundTime; }
    public void setAvgTurnaroundTime(double avgTurnaroundTime) { this.avgTurnaroundTime = avgTurnaroundTime; }

    public double getAvgResponseTime() { return avgResponseTime; }
    public void setAvgResponseTime(double avgResponseTime) { this.avgResponseTime = avgResponseTime; }

    public int getTotalProcesses() { return totalProcesses; }
    public void setTotalProcesses(int totalProcesses) { this.totalProcesses = totalProcesses; }

    public int getTotalCpuTime() { return totalCpuTime; }
    public void setTotalCpuTime(int totalCpuTime) { this.totalCpuTime = totalCpuTime; }

    public int getTotalIdleTime() { return totalIdleTime; }
    public void setTotalIdleTime(int totalIdleTime) { this.totalIdleTime = totalIdleTime; }

    public int getFinalClock() { return finalClock; }
    public void setFinalClock(int finalClock) { this.finalClock = finalClock; }
}
