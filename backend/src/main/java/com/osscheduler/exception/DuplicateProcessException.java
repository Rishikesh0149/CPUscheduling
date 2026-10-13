package com.osscheduler.exception;

/**
 * Thrown when a process with the given PID already exists.
 */
public class DuplicateProcessException extends RuntimeException {
    public DuplicateProcessException(String pid) {
        super("Process with ID '" + pid + "' already exists.");
    }
}
