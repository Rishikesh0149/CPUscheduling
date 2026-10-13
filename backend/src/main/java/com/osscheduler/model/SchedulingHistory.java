package com.osscheduler.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores a completed scheduling run result for history.
 */
@Entity
@Table(name = "scheduling_history")
public class SchedulingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String algorithm;

    @Column(nullable = false)
    private int processCount;

    @Column(nullable = false)
    private double avgWaitingTime;

    @Column(nullable = false)
    private double avgTurnaroundTime;

    @Column(nullable = false)
    private double avgResponseTime;

    @Column(nullable = false)
    private int totalCpuTime;

    @Column(nullable = false)
    private int totalIdleTime;

    @Column(nullable = false)
    private int finalClock;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String resultJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime runAt;

    public SchedulingHistory() {
        this.runAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public int getProcessCount() { return processCount; }
    public void setProcessCount(int processCount) { this.processCount = processCount; }

    public double getAvgWaitingTime() { return avgWaitingTime; }
    public void setAvgWaitingTime(double avgWaitingTime) { this.avgWaitingTime = avgWaitingTime; }

    public double getAvgTurnaroundTime() { return avgTurnaroundTime; }
    public void setAvgTurnaroundTime(double avgTurnaroundTime) { this.avgTurnaroundTime = avgTurnaroundTime; }

    public double getAvgResponseTime() { return avgResponseTime; }
    public void setAvgResponseTime(double avgResponseTime) { this.avgResponseTime = avgResponseTime; }

    public int getTotalCpuTime() { return totalCpuTime; }
    public void setTotalCpuTime(int totalCpuTime) { this.totalCpuTime = totalCpuTime; }

    public int getTotalIdleTime() { return totalIdleTime; }
    public void setTotalIdleTime(int totalIdleTime) { this.totalIdleTime = totalIdleTime; }

    public int getFinalClock() { return finalClock; }
    public void setFinalClock(int finalClock) { this.finalClock = finalClock; }

    public String getResultJson() { return resultJson; }
    public void setResultJson(String resultJson) { this.resultJson = resultJson; }

    public LocalDateTime getRunAt() { return runAt; }
    public void setRunAt(LocalDateTime runAt) { this.runAt = runAt; }
}
