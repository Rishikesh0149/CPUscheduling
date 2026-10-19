package com.osscheduler.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PagingRequest {

    @NotNull(message = "Algorithm must not be null")
    private String algorithm; // FIFO, OPT, LRU, CLOCK, LFU

    @NotEmpty(message = "Reference string must not be empty")
    private List<Integer> referenceString;

    @Min(value = 1, message = "Frame count must be at least 1")
    @Max(value = 16, message = "Frame count must be at most 16")
    private int frameCount = 3;

    public PagingRequest() {}

    public PagingRequest(String algorithm, List<Integer> referenceString, int frameCount) {
        this.algorithm = algorithm;
        this.referenceString = referenceString;
        this.frameCount = frameCount;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
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
}
