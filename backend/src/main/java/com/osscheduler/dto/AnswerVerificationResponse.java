package com.osscheduler.dto;

import java.util.List;
import java.util.Map;

public class AnswerVerificationResponse {
    private boolean correct;
    private double scorePercentage;
    private String verdictTitle;
    private String summaryMessage;
    private int actualFaults;
    private int actualHits;
    private double actualHitRatio;
    private double actualFaultRatio;
    private Map<String, Boolean> breakdown;
    private List<String> discrepancies;
    private List<String> stepByStepAnalysis;
    private List<String> pedagogicalTips;
    private PagingResponse simulationResult;

    public AnswerVerificationResponse() {}

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

    public int getActualFaults() {
        return actualFaults;
    }

    public void setActualFaults(int actualFaults) {
        this.actualFaults = actualFaults;
    }

    public int getActualHits() {
        return actualHits;
    }

    public void setActualHits(int actualHits) {
        this.actualHits = actualHits;
    }

    public double getActualHitRatio() {
        return actualHitRatio;
    }

    public void setActualHitRatio(double actualHitRatio) {
        this.actualHitRatio = actualHitRatio;
    }

    public double getActualFaultRatio() {
        return actualFaultRatio;
    }

    public void setActualFaultRatio(double actualFaultRatio) {
        this.actualFaultRatio = actualFaultRatio;
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

    public List<String> getStepByStepAnalysis() {
        return stepByStepAnalysis;
    }

    public void setStepByStepAnalysis(List<String> stepByStepAnalysis) {
        this.stepByStepAnalysis = stepByStepAnalysis;
    }

    public List<String> getPedagogicalTips() {
        return pedagogicalTips;
    }

    public void setPedagogicalTips(List<String> pedagogicalTips) {
        this.pedagogicalTips = pedagogicalTips;
    }

    public PagingResponse getSimulationResult() {
        return simulationResult;
    }

    public void setSimulationResult(PagingResponse simulationResult) {
        this.simulationResult = simulationResult;
    }
}
