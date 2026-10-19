package com.osscheduler.dto;

import java.util.List;
import java.util.Map;

public class PageStep {
    private int stepIndex;
    private int page;
    private List<Integer> frames;
    private boolean hit;
    private Integer victimPage;
    private Integer replacedFrameIndex;
    private Integer clockPointer;
    private List<Integer> referenceBits;
    private Map<Integer, Integer> pageFrequencies;
    private String reason;

    public PageStep() {}

    public PageStep(int stepIndex, int page, List<Integer> frames, boolean hit,
                    Integer victimPage, Integer replacedFrameIndex, Integer clockPointer,
                    List<Integer> referenceBits, Map<Integer, Integer> pageFrequencies,
                    String reason) {
        this.stepIndex = stepIndex;
        this.page = page;
        this.frames = frames;
        this.hit = hit;
        this.victimPage = victimPage;
        this.replacedFrameIndex = replacedFrameIndex;
        this.clockPointer = clockPointer;
        this.referenceBits = referenceBits;
        this.pageFrequencies = pageFrequencies;
        this.reason = reason;
    }

    public int getStepIndex() {
        return stepIndex;
    }

    public void setStepIndex(int stepIndex) {
        this.stepIndex = stepIndex;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public List<Integer> getFrames() {
        return frames;
    }

    public void setFrames(List<Integer> frames) {
        this.frames = frames;
    }

    public boolean isHit() {
        return hit;
    }

    public void setHit(boolean hit) {
        this.hit = hit;
    }

    public Integer getVictimPage() {
        return victimPage;
    }

    public void setVictimPage(Integer victimPage) {
        this.victimPage = victimPage;
    }

    public Integer getReplacedFrameIndex() {
        return replacedFrameIndex;
    }

    public void setReplacedFrameIndex(Integer replacedFrameIndex) {
        this.replacedFrameIndex = replacedFrameIndex;
    }

    public Integer getClockPointer() {
        return clockPointer;
    }

    public void setClockPointer(Integer clockPointer) {
        this.clockPointer = clockPointer;
    }

    public List<Integer> getReferenceBits() {
        return referenceBits;
    }

    public void setReferenceBits(List<Integer> referenceBits) {
        this.referenceBits = referenceBits;
    }

    public Map<Integer, Integer> getPageFrequencies() {
        return pageFrequencies;
    }

    public void setPageFrequencies(Map<Integer, Integer> pageFrequencies) {
        this.pageFrequencies = pageFrequencies;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
