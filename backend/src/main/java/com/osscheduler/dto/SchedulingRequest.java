package com.osscheduler.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for running a scheduling simulation.
 */
public class SchedulingRequest {

    @NotBlank(message = "Algorithm must be specified")
    private String algorithm;

    @Min(value = 1, message = "Time quantum must be positive")
    private int timeQuantum = 2;

    public SchedulingRequest() {}

    public SchedulingRequest(String algorithm, int timeQuantum) {
        this.algorithm = algorithm;
        this.timeQuantum = timeQuantum;
    }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public int getTimeQuantum() { return timeQuantum; }
    public void setTimeQuantum(int timeQuantum) { this.timeQuantum = timeQuantum; }
}
