package com.osscheduler.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA Entity representing an OS process in the simulator.
 * Tracks PID, arrival/burst/priority values, and current state.
 */
@Entity
@Table(name = "processes")
public class Process {

    @Id
    @Column(nullable = false, unique = true, length = 50)
    private String pid;

    @Column(nullable = false)
    private int arrivalTime;

    @Column(nullable = false)
    private int burstTime;

    @Column(nullable = false)
    private int priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcessState state;

    @Column(nullable = false)
    private int inputOrder;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Process() {}

    public Process(String pid, int arrivalTime, int burstTime, int priority,
                   ProcessState state, int inputOrder) {
        this.pid = pid;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
        this.state = state;
        this.inputOrder = inputOrder;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
