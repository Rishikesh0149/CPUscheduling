package com.osscheduler.exception;

/**
 * Thrown when an invalid process state transition is attempted.
 */
public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(String pid, String currentState, String targetState) {
        super("Process '" + pid + "' cannot transition from " + currentState + " to " + targetState + ".");
    }
}
