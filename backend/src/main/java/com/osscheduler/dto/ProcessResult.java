package com.osscheduler.dto;

/**
 * Scheduling result for a single process after a run.
 */
public class ProcessResult {

    private String pid;
    private int arrivalTime;
    private int burstTime;
    private int startTime;
    private int completionTime;
    private int turnaroundTime;
    private int waitingTime;
    private int responseTime;

    public ProcessResult() {}

    public ProcessResult(String pid, int arrivalTime, int burstTime,
                         int startTime, int completionTime,
                         int turnaroundTime, int waitingTime, int responseTime) {
        this.pid = pid;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.startTime = startTime;
        this.completionTime = completionTime;
        this.turnaroundTime = turnaroundTime;
        this.waitingTime = waitingTime;
        this.responseTime = responseTime;
    }

    public String getPid() { return pid; }
    public void setPid(String pid) { this.pid = pid; }

    public int getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(int arrivalTime) { this.arrivalTime = arrivalTime; }

    public int getBurstTime() { return burstTime; }
    public void setBurstTime(int burstTime) { this.burstTime = burstTime; }

    public int getStartTime() { return startTime; }
    public void setStartTime(int startTime) { this.startTime = startTime; }

    public int getCompletionTime() { return completionTime; }
    public void setCompletionTime(int completionTime) { this.completionTime = completionTime; }

    public int getTurnaroundTime() { return turnaroundTime; }
    public void setTurnaroundTime(int turnaroundTime) { this.turnaroundTime = turnaroundTime; }

    public int getWaitingTime() { return waitingTime; }
    public void setWaitingTime(int waitingTime) { this.waitingTime = waitingTime; }

    public int getResponseTime() { return responseTime; }
    public void setResponseTime(int responseTime) { this.responseTime = responseTime; }
}
