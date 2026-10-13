package com.osscheduler.dto;

import jakarta.validation.constraints.Min;

import java.util.List;

/**
 * Request DTO for comparing all scheduling algorithms.
 */
public class CompareRequest {

    @Min(value = 1, message = "Time quantum must be positive")
    private int timeQuantum = 2;

    public CompareRequest() {}

    public CompareRequest(int timeQuantum) {
        this.timeQuantum = timeQuantum;
    }

    public int getTimeQuantum() { return timeQuantum; }
    public void setTimeQuantum(int timeQuantum) { this.timeQuantum = timeQuantum; }
}
