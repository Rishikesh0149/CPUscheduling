package com.osscheduler.exception;

/**
 * Thrown when a process cannot be found by PID.
 */
public class ProcessNotFoundException extends RuntimeException {
    public ProcessNotFoundException(String pid) {
        super("Process with ID '" + pid + "' not found.");
    }
}
