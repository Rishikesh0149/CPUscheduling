package com.osscheduler.dto;

/**
 * Summary metrics for a single algorithm in a comparison run.
 */
public class AlgorithmComparison {

    private String algorithm;
    private double avgWaitingTime;
    private double avgTurnaroundTime;
    private double avgResponseTime;

    public AlgorithmComparison() {}

    public AlgorithmComparison(String algorithm, double avgWaitingTime,
                               double avgTurnaroundTime, double avgResponseTime) {
        this.algorithm = algorithm;
        this.avgWaitingTime = avgWaitingTime;
        this.avgTurnaroundTime = avgTurnaroundTime;
        this.avgResponseTime = avgResponseTime;
    }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public double getAvgWaitingTime() { return avgWaitingTime; }
    public void setAvgWaitingTime(double avgWaitingTime) { this.avgWaitingTime = avgWaitingTime; }

    public double getAvgTurnaroundTime() { return avgTurnaroundTime; }
    public void setAvgTurnaroundTime(double avgTurnaroundTime) { this.avgTurnaroundTime = avgTurnaroundTime; }

    public double getAvgResponseTime() { return avgResponseTime; }
    public void setAvgResponseTime(double avgResponseTime) { this.avgResponseTime = avgResponseTime; }
}
