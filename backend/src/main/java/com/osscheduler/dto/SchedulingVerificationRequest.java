package com.osscheduler.dto;

import java.util.List;

public class SchedulingVerificationRequest {

    private String algorithm; // FCFS, SJF, SRTF, Priority, Round Robin
    private int timeQuantum = 2;
    private List<CreateProcessRequest> processes;
    private Double userAvgWaitingTime;
    private Double userAvgTurnaroundTime;
    private Double userAvgResponseTime;
    private Integer userFinalClock;
    private List<String> userGanttOrder; // e.g. ["P1", "P2", "P3"]
    private List<ProcessResult> userProcessResults;
    private String userNotes;

    public SchedulingVerificationRequest() {}

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public int getTimeQuantum() {
        return timeQuantum;
    }

    public void setTimeQuantum(int timeQuantum) {
        this.timeQuantum = timeQuantum;
    }

    public List<CreateProcessRequest> getProcesses() {
        return processes;
    }

    public void setProcesses(List<CreateProcessRequest> processes) {
        this.processes = processes;
    }

    public Double getUserAvgWaitingTime() {
        return userAvgWaitingTime;
    }

    public void setUserAvgWaitingTime(Double userAvgWaitingTime) {
        this.userAvgWaitingTime = userAvgWaitingTime;
    }

    public Double getUserAvgTurnaroundTime() {
        return userAvgTurnaroundTime;
    }

    public void setUserAvgTurnaroundTime(Double userAvgTurnaroundTime) {
        this.userAvgTurnaroundTime = userAvgTurnaroundTime;
    }

    public Double getUserAvgResponseTime() {
        return userAvgResponseTime;
    }

    public void setUserAvgResponseTime(Double userAvgResponseTime) {
        this.userAvgResponseTime = userAvgResponseTime;
    }

    public Integer getUserFinalClock() {
        return userFinalClock;
    }

    public void setUserFinalClock(Integer userFinalClock) {
        this.userFinalClock = userFinalClock;
    }

    public List<String> getUserGanttOrder() {
        return userGanttOrder;
    }

    public void setUserGanttOrder(List<String> userGanttOrder) {
        this.userGanttOrder = userGanttOrder;
    }

    public List<ProcessResult> getUserProcessResults() {
        return userProcessResults;
    }

    public void setUserProcessResults(List<ProcessResult> userProcessResults) {
        this.userProcessResults = userProcessResults;
    }

    public String getUserNotes() {
        return userNotes;
    }

    public void setUserNotes(String userNotes) {
        this.userNotes = userNotes;
    }
}
