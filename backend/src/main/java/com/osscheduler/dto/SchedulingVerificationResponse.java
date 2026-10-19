package com.osscheduler.dto;

import java.util.List;
import java.util.Map;

public class SchedulingVerificationResponse {

    private boolean correct;
    private double scorePercentage;
    private String verdictTitle;
    private String summaryMessage;
    private double actualAvgWaitingTime;
    private double actualAvgTurnaroundTime;
    private double actualAvgResponseTime;
    private int actualFinalClock;
    private Map<String, Boolean> breakdown;
    private List<String> discrepancies;
    private List<String> processDiagnostics;
    private List<String> ganttComparison;
    private List<String> pedagogicalTips;
    private SchedulingResponse simulationResult;

    public SchedulingVerificationResponse() {}

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public double getScorePercentage() {
        return scorePercentage;
    }

    public void setScorePercentage(double scorePercentage) {
        this.scorePercentage = scorePercentage;
    }

    public String getVerdictTitle() {
        return verdictTitle;
    }

    public void setVerdictTitle(String verdictTitle) {
        this.verdictTitle = verdictTitle;
    }

    public String getSummaryMessage() {
        return summaryMessage;
    }

    public void setSummaryMessage(String summaryMessage) {
        this.summaryMessage = summaryMessage;
    }

    public double getActualAvgWaitingTime() {
        return actualAvgWaitingTime;
    }

    public void setActualAvgWaitingTime(double actualAvgWaitingTime) {
        this.actualAvgWaitingTime = actualAvgWaitingTime;
    }

    public double getActualAvgTurnaroundTime() {
        return actualAvgTurnaroundTime;
    }

    public void setActualAvgTurnaroundTime(double actualAvgTurnaroundTime) {
        this.actualAvgTurnaroundTime = actualAvgTurnaroundTime;
    }

    public double getActualAvgResponseTime() {
        return actualAvgResponseTime;
    }

    public void setActualAvgResponseTime(double actualAvgResponseTime) {
        this.actualAvgResponseTime = actualAvgResponseTime;
    }

    public int getActualFinalClock() {
        return actualFinalClock;
    }

    public void setActualFinalClock(int actualFinalClock) {
        this.actualFinalClock = actualFinalClock;
    }

    public Map<String, Boolean> getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(Map<String, Boolean> breakdown) {
        this.breakdown = breakdown;
    }

    public List<String> getDiscrepancies() {
        return discrepancies;
    }

    public void setDiscrepancies(List<String> discrepancies) {
        this.discrepancies = discrepancies;
    }

    public List<String> getProcessDiagnostics() {
        return processDiagnostics;
    }

    public void setProcessDiagnostics(List<String> processDiagnostics) {
        this.processDiagnostics = processDiagnostics;
    }

    public List<String> getGanttComparison() {
        return ganttComparison;
    }

    public void setGanttComparison(List<String> ganttComparison) {
        this.ganttComparison = ganttComparison;
    }

    public List<String> getPedagogicalTips() {
        return pedagogicalTips;
    }

    public void setPedagogicalTips(List<String> pedagogicalTips) {
        this.pedagogicalTips = pedagogicalTips;
    }

    public SchedulingResponse getSimulationResult() {
        return simulationResult;
    }

    public void setSimulationResult(SchedulingResponse simulationResult) {
        this.simulationResult = simulationResult;
    }
}
