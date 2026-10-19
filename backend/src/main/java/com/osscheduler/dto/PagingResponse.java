package com.osscheduler.dto;

import java.util.List;

public class PagingResponse {
    private String algorithm;
    private int frameCount;
    private int totalPages;
    private int totalHits;
    private int totalFaults;
    private double hitRatio;
    private double faultRatio;
    private List<Integer> referenceString;
    private List<PageStep> steps;

    public PagingResponse() {}

    public PagingResponse(String algorithm, int frameCount, int totalPages,
                          int totalHits, int totalFaults, double hitRatio,
                          double faultRatio, List<Integer> referenceString,
                          List<PageStep> steps) {
        this.algorithm = algorithm;
        this.frameCount = frameCount;
        this.totalPages = totalPages;
        this.totalHits = totalHits;
        this.totalFaults = totalFaults;
        this.hitRatio = hitRatio;
        this.faultRatio = faultRatio;
        this.referenceString = referenceString;
        this.steps = steps;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public int getFrameCount() {
        return frameCount;
    }

    public void setFrameCount(int frameCount) {
        this.frameCount = frameCount;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getTotalHits() {
        return totalHits;
    }

    public void setTotalHits(int totalHits) {
        this.totalHits = totalHits;
    }

    public int getTotalFaults() {
        return totalFaults;
    }

    public void setTotalFaults(int totalFaults) {
        this.totalFaults = totalFaults;
    }

    public double getHitRatio() {
        return hitRatio;
    }

    public void setHitRatio(double hitRatio) {
        this.hitRatio = hitRatio;
    }

    public double getFaultRatio() {
        return faultRatio;
    }

    public void setFaultRatio(double faultRatio) {
        this.faultRatio = faultRatio;
    }

    public List<Integer> getReferenceString() {
        return referenceString;
    }

    public void setReferenceString(List<Integer> referenceString) {
        this.referenceString = referenceString;
    }

    public List<PageStep> getSteps() {
        return steps;
    }

    public void setSteps(List<PageStep> steps) {
        this.steps = steps;
    }
}
