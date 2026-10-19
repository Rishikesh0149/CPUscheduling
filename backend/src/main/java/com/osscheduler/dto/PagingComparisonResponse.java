package com.osscheduler.dto;

import java.util.List;

public class PagingComparisonResponse {
    private List<Integer> referenceString;
    private int frameCount;
    private List<PagingResponse> results;
    private String bestAlgorithm;
    private int minFaults;

    public PagingComparisonResponse() {}

    public PagingComparisonResponse(List<Integer> referenceString, int frameCount,
                                  List<PagingResponse> results, String bestAlgorithm, int minFaults) {
        this.referenceString = referenceString;
        this.frameCount = frameCount;
        this.results = results;
        this.bestAlgorithm = bestAlgorithm;
        this.minFaults = minFaults;
    }

    public List<Integer> getReferenceString() {
        return referenceString;
    }

    public void setReferenceString(List<Integer> referenceString) {
        this.referenceString = referenceString;
    }

    public int getFrameCount() {
        return frameCount;
    }

    public void setFrameCount(int frameCount) {
        this.frameCount = frameCount;
    }

    public List<PagingResponse> getResults() {
        return results;
    }

    public void setResults(List<PagingResponse> results) {
        this.results = results;
    }

    public String getBestAlgorithm() {
        return bestAlgorithm;
    }

    public void setBestAlgorithm(String bestAlgorithm) {
        this.bestAlgorithm = bestAlgorithm;
    }

    public int getMinFaults() {
        return minFaults;
    }

    public void setMinFaults(int minFaults) {
        this.minFaults = minFaults;
    }
}
