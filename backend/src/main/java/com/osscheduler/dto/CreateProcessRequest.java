package com.osscheduler.dto;

import jakarta.validation.constraints.*;

/**
 * Request DTO for creating a new process.
 */
public class CreateProcessRequest {

    @NotBlank(message = "Process ID cannot be empty")
    @Size(max = 50, message = "Process ID must be at most 50 characters")
    private String pid;

    @Min(value = 0, message = "Arrival time must be non-negative")
    private int arrivalTime = 0;

    @Min(value = 1, message = "Burst time must be positive")
    private int burstTime;

    @Min(value = 0, message = "Priority must be non-negative")
    private int priority = 1;

    public CreateProcessRequest() {}

    public CreateProcessRequest(String pid, int arrivalTime, int burstTime, int priority) {
        this.pid = pid;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
    }

    public String getPid() { return pid; }
    public void setPid(String pid) { this.pid = pid; }

    public int getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(int arrivalTime) { this.arrivalTime = arrivalTime; }

    public int getBurstTime() { return burstTime; }
    public void setBurstTime(int burstTime) { this.burstTime = burstTime; }

    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
}
