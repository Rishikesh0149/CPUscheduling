package com.osscheduler.dto;

import java.util.List;

/**
 * Response DTO for the algorithm comparison endpoint.
 */
public class CompareResponse {

    private List<AlgorithmComparison> results;
    private String bestWaitingTime;
    private String bestTurnaroundTime;
    private String bestResponseTime;
    private int timeQuantum;

    public CompareResponse() {}

    public List<AlgorithmComparison> getResults() { return results; }
    public void setResults(List<AlgorithmComparison> results) { this.results = results; }

    public String getBestWaitingTime() { return bestWaitingTime; }
    public void setBestWaitingTime(String bestWaitingTime) { this.bestWaitingTime = bestWaitingTime; }

    public String getBestTurnaroundTime() { return bestTurnaroundTime; }
    public void setBestTurnaroundTime(String bestTurnaroundTime) { this.bestTurnaroundTime = bestTurnaroundTime; }

    public String getBestResponseTime() { return bestResponseTime; }
    public void setBestResponseTime(String bestResponseTime) { this.bestResponseTime = bestResponseTime; }

    public int getTimeQuantum() { return timeQuantum; }
    public void setTimeQuantum(int timeQuantum) { this.timeQuantum = timeQuantum; }
}
