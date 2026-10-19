package com.osscheduler.dto;

import java.util.List;

public class AnswerVerificationRequest {
    private String algorithm; // FIFO, OPT, LRU, CLOCK, LFU
    private int frameCount;
    private List<Integer> referenceString;
    private Integer userFaults;
    private Integer userHits;
    private Double userHitRatio;
    private List<Integer> userVictims;
    private String userNotes;

    public AnswerVerificationRequest() {}

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

    public List<Integer> getReferenceString() {
        return referenceString;
    }

    public void setReferenceString(List<Integer> referenceString) {
        this.referenceString = referenceString;
    }

    public Integer getUserFaults() {
        return userFaults;
    }

    public void setUserFaults(Integer userFaults) {
        this.userFaults = userFaults;
    }

    public Integer getUserHits() {
        return userHits;
    }

    public void setUserHits(Integer userHits) {
        this.userHits = userHits;
    }

    public Double getUserHitRatio() {
        return userHitRatio;
    }

    public void setUserHitRatio(Double userHitRatio) {
        this.userHitRatio = userHitRatio;
    }

    public List<Integer> getUserVictims() {
        return userVictims;
    }

    public void setUserVictims(List<Integer> userVictims) {
        this.userVictims = userVictims;
    }

    public String getUserNotes() {
        return userNotes;
    }

    public void setUserNotes(String userNotes) {
        this.userNotes = userNotes;
    }
}
