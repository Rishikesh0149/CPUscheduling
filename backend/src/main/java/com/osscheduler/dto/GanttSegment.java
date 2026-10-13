package com.osscheduler.dto;

/**
 * Represents a single execution segment in the Gantt chart.
 * A segment is a contiguous time block where a specific process (or IDLE) ran.
 */
public class GanttSegment {

    private String pid;   // process PID or "IDLE"
    private int start;
    private int end;
    private boolean idle;

    public GanttSegment() {}

    public GanttSegment(String pid, int start, int end, boolean idle) {
        this.pid = pid;
        this.start = start;
        this.end = end;
        this.idle = idle;
    }

    public String getPid() { return pid; }
    public void setPid(String pid) { this.pid = pid; }

    public int getStart() { return start; }
    public void setStart(int start) { this.start = start; }

    public int getEnd() { return end; }
    public void setEnd(int end) { this.end = end; }

    public boolean isIdle() { return idle; }
    public void setIdle(boolean idle) { this.idle = idle; }

    public int getDuration() { return end - start; }
}
