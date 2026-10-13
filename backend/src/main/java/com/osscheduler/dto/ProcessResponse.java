package com.osscheduler.dto;

import com.osscheduler.model.ProcessState;

/**
 * Response DTO for a single process.
 */
public class ProcessResponse {

    private String pid;
    private int arrivalTime;
    private int burstTime;
    private int priority;
    private ProcessState state;
    private int inputOrder;

    public ProcessResponse() {}

    public ProcessResponse(String pid, int arrivalTime, int burstTime,
                           int priority, ProcessState state, int inputOrder) {
        this.pid = pid;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
        this.state = state;
        this.inputOrder = inputOrder;
    }

    public String getPid() { return pid; }
    public void setPid(String pid) { this.pid = pid; }

    public int getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(int arrivalTime) { this.arrivalTime = arrivalTime; }

    public int getBurstTime() { return burstTime; }
    public void setBurstTime(int burstTime) { this.burstTime = burstTime; }

    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }

    public ProcessState getState() { return state; }
    public void setState(ProcessState state) { this.state = state; }

    public int getInputOrder() { return inputOrder; }
    public void setInputOrder(int inputOrder) { this.inputOrder = inputOrder; }
}
