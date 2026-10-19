package com.osscheduler.paging;

import com.osscheduler.dto.PageStep;
import com.osscheduler.dto.PagingComparisonResponse;
import com.osscheduler.dto.PagingResponse;

import java.util.*;

public class PagingAlgorithms {

    // =====================================================================
    // 1. FIFO — First-In, First-Out
    // =====================================================================
    public static PagingResponse runFIFO(List<Integer> refs, int frameCount) {
        List<Integer> frames = new ArrayList<>();
        Queue<Integer> fifoQueue = new ArrayDeque<>();
        List<PageStep> steps = new ArrayList<>();
        int hits = 0;
        int faults = 0;

        for (int i = 0; i < refs.size(); i++) {
            int page = refs.get(i);
            boolean hit = frames.contains(page);
            Integer victim = null;
            Integer replacedIndex = null;
            String reason;

            if (hit) {
                hits++;
                reason = "Page " + page + " already resident in frame (Cache Hit)";
            } else {
                faults++;
                if (frames.size() < frameCount) {
                    frames.add(page);
                    fifoQueue.add(page);
                    replacedIndex = frames.size() - 1;
                    reason = "Page fault: Allocated into empty frame slot " + replacedIndex;
                } else {
                    victim = fifoQueue.poll();
                    replacedIndex = frames.indexOf(victim);
                    frames.set(replacedIndex, page);
                    fifoQueue.add(page);
                    reason = "Page fault: Evicted oldest page " + victim + " (FIFO replacement)";
                }
            }

            steps.add(new PageStep(
                    i, page, new ArrayList<>(frames), hit, victim, replacedIndex,
                    null, null, null, reason
            ));
        }

        return createResponse("FIFO", refs, frameCount, hits, faults, steps);
    }

    // =====================================================================
    // 2. Optimal (OPT) — Minimum Page Faults Theoretical Benchmark
    // =====================================================================
    public static PagingResponse runOPT(List<Integer> refs, int frameCount) {
        List<Integer> frames = new ArrayList<>();
        List<Integer> loadTimes = new ArrayList<>(); // For FIFO tie-breaking
        List<PageStep> steps = new ArrayList<>();
        int hits = 0;
        int faults = 0;

        for (int i = 0; i < refs.size(); i++) {
            int page = refs.get(i);
            boolean hit = frames.contains(page);
            Integer victim = null;
            Integer replacedIndex = null;
            String reason;

            if (hit) {
                hits++;
                reason = "Page " + page + " found in memory (Cache Hit)";
            } else {
                faults++;
                if (frames.size() < frameCount) {
                    frames.add(page);
                    loadTimes.add(i);
                    replacedIndex = frames.size() - 1;
                    reason = "Page fault: Placed in free frame slot " + replacedIndex;
                } else {
                    // Look ahead in future reference string
                    int farthestDistance = -1;
                    int victimIdx = 0;

                    for (int f = 0; f < frames.size(); f++) {
                        int candidate = frames.get(f);
                        int nextUse = Integer.MAX_VALUE;

                        for (int future = i + 1; future < refs.size(); future++) {
                            if (refs.get(future) == candidate) {
                                nextUse = future;
                                break;
                            }
                        }

                        if (nextUse > farthestDistance) {
                            farthestDistance = nextUse;
                            victimIdx = f;
                        } else if (nextUse == farthestDistance && farthestDistance == Integer.MAX_VALUE) {
                            // Tie-breaker: earlier loaded page
                            if (loadTimes.get(f) < loadTimes.get(victimIdx)) {
                                victimIdx = f;
                            }
                        }
                    }

                    victim = frames.get(victimIdx);
                    replacedIndex = victimIdx;
                    frames.set(victimIdx, page);
                    loadTimes.set(victimIdx, i);

                    if (farthestDistance == Integer.MAX_VALUE) {
                        reason = "Page fault: Evicted page " + victim + " (Never referenced again in future)";
                    } else {
                        reason = "Page fault: Evicted page " + victim + " (Next referenced farthest at step " + farthestDistance + ")";
                    }
                }
            }

            steps.add(new PageStep(
                    i, page, new ArrayList<>(frames), hit, victim, replacedIndex,
                    null, null, null, reason
            ));
        }

        return createResponse("Optimal (OPT)", refs, frameCount, hits, faults, steps);
    }

    // =====================================================================
    // 3. LRU — Least Recently Used
    // =====================================================================
    public static PagingResponse runLRU(List<Integer> refs, int frameCount) {
        List<Integer> frames = new ArrayList<>();
        Map<Integer, Integer> lastUsed = new HashMap<>();
        List<PageStep> steps = new ArrayList<>();
        int hits = 0;
        int faults = 0;

        for (int i = 0; i < refs.size(); i++) {
            int page = refs.get(i);
            boolean hit = frames.contains(page);
            Integer victim = null;
            Integer replacedIndex = null;
            String reason;

            if (hit) {
                hits++;
                lastUsed.put(page, i);
                reason = "Page " + page + " already in memory (Cache Hit, updated last-access to step " + i + ")";
            } else {
                faults++;
                if (frames.size() < frameCount) {
                    frames.add(page);
                    lastUsed.put(page, i);
                    replacedIndex = frames.size() - 1;
                    reason = "Page fault: Placed into unoccupied frame slot " + replacedIndex;
                } else {
                    // Find page with oldest lastUsed step
                    int oldestTime = Integer.MAX_VALUE;
                    int victimIdx = 0;

                    for (int f = 0; f < frames.size(); f++) {
                        int candidate = frames.get(f);
                        int time = lastUsed.getOrDefault(candidate, -1);
                        if (time < oldestTime) {
                            oldestTime = time;
                            victimIdx = f;
                        }
                    }

                    victim = frames.get(victimIdx);
                    replacedIndex = victimIdx;
                    frames.set(victimIdx, page);
                    lastUsed.remove(victim);
                    lastUsed.put(page, i);
                    reason = "Page fault: Evicted page " + victim + " (Least recently used, last accessed at step " + oldestTime + ")";
                }
            }

            steps.add(new PageStep(
                    i, page, new ArrayList<>(frames), hit, victim, replacedIndex,
                    null, null, null, reason
            ));
        }

        return createResponse("LRU", refs, frameCount, hits, faults, steps);
    }

    // =====================================================================
    // 4. Second Chance / Clock Algorithm
    // =====================================================================
    public static PagingResponse runClock(List<Integer> refs, int frameCount) {
        List<Integer> frames = new ArrayList<>(Collections.nCopies(frameCount, null));
        List<Integer> refBits = new ArrayList<>(Collections.nCopies(frameCount, 0));
        int hand = 0;
        List<PageStep> steps = new ArrayList<>();
        int hits = 0;
        int faults = 0;
        int occupiedCount = 0;

        for (int i = 0; i < refs.size(); i++) {
            int page = refs.get(i);
            int existingIndex = frames.indexOf(page);
            boolean hit = (existingIndex != -1);
            Integer victim = null;
            Integer replacedIndex = null;
            String reason;

            if (hit) {
                hits++;
                refBits.set(existingIndex, 1);
                reason = "Page " + page + " hit! Second chance bit set to 1 at frame " + existingIndex;
            } else {
                faults++;
                if (occupiedCount < frameCount) {
                    // Fill next empty slot
                    int emptyIdx = frames.indexOf(null);
                    frames.set(emptyIdx, page);
                    refBits.set(emptyIdx, 1);
                    replacedIndex = emptyIdx;
                    occupiedCount++;
                    reason = "Page fault: Loaded page " + page + " into initial frame " + emptyIdx + " (Bit=1)";
                } else {
                    // Clock circular scan for bit 0
                    StringBuilder scanLog = new StringBuilder();
                    while (true) {
                        if (refBits.get(hand) == 1) {
                            // Give second chance
                            refBits.set(hand, 0);
                            scanLog.append("Frame ").append(hand).append(" (Page ").append(frames.get(hand)).append(") bit cleared 1->0; ");
                            hand = (hand + 1) % frameCount;
                        } else {
                            // Found victim
                            victim = frames.get(hand);
                            replacedIndex = hand;
                            frames.set(hand, page);
                            refBits.set(hand, 1);
                            reason = "Page fault: Evicted page " + victim + " at frame " + hand + " (Bit was 0). " + scanLog;
                            hand = (hand + 1) % frameCount;
                            break;
                        }
                    }
                }
            }

            // Clean list of frames without nulls for response
            List<Integer> cleanFrames = new ArrayList<>();
            for (Integer f : frames) {
                if (f != null) cleanFrames.add(f);
            }

            steps.add(new PageStep(
                    i, page, cleanFrames, hit, victim, replacedIndex,
                    hand, new ArrayList<>(refBits), null, reason
            ));
        }

        return createResponse("Second Chance (Clock)", refs, frameCount, hits, faults, steps);
    }

    // =====================================================================
    // 5. LFU — Least Frequently Used
    // =====================================================================
    public static PagingResponse runLFU(List<Integer> refs, int frameCount) {
        List<Integer> frames = new ArrayList<>();
        Map<Integer, Integer> freqMap = new HashMap<>();
        Map<Integer, Integer> arrivalTime = new HashMap<>(); // For FIFO tie-breaking
        List<PageStep> steps = new ArrayList<>();
        int hits = 0;
        int faults = 0;

        for (int i = 0; i < refs.size(); i++) {
            int page = refs.get(i);
            boolean hit = frames.contains(page);
            Integer victim = null;
            Integer replacedIndex = null;
            String reason;

            // Increment frequency for referenced page
            freqMap.put(page, freqMap.getOrDefault(page, 0) + 1);

            if (hit) {
                hits++;
                reason = "Page " + page + " hit! Frequency counter increased to " + freqMap.get(page);
            } else {
                faults++;
                if (frames.size() < frameCount) {
                    frames.add(page);
                    arrivalTime.put(page, i);
                    replacedIndex = frames.size() - 1;
                    reason = "Page fault: Added to free frame slot " + replacedIndex + " (Freq: " + freqMap.get(page) + ")";
                } else {
                    // Find page with minimum frequency
                    int minFreq = Integer.MAX_VALUE;
                    int victimIdx = 0;

                    for (int f = 0; f < frames.size(); f++) {
                        int candidate = frames.get(f);
                        int freq = freqMap.getOrDefault(candidate, 0);

                        if (freq < minFreq) {
                            minFreq = freq;
                            victimIdx = f;
                        } else if (freq == minFreq) {
                            // Tie-breaker: earliest arrival in frames
                            if (arrivalTime.getOrDefault(candidate, 0) < arrivalTime.getOrDefault(frames.get(victimIdx), 0)) {
                                victimIdx = f;
                            }
                        }
                    }

                    victim = frames.get(victimIdx);
                    replacedIndex = victimIdx;
                    frames.set(victimIdx, page);
                    arrivalTime.put(page, i);
                    reason = "Page fault: Evicted page " + victim + " (Lowest frequency: " + minFreq + " references)";
                }
            }

            Map<Integer, Integer> currentFreqs = new HashMap<>();
            for (Integer f : frames) {
                currentFreqs.put(f, freqMap.getOrDefault(f, 0));
            }

            steps.add(new PageStep(
                    i, page, new ArrayList<>(frames), hit, victim, replacedIndex,
                    null, null, currentFreqs, reason
            ));
        }

        return createResponse("LFU", refs, frameCount, hits, faults, steps);
    }

    // =====================================================================
    // Simulation Runner Dispatcher
    // =====================================================================
    public static PagingResponse run(String algorithm, List<Integer> refs, int frameCount) {
        if (refs == null || refs.isEmpty() || frameCount < 1) {
            throw new IllegalArgumentException("Invalid reference string or frame count");
        }
        String algo = algorithm.toUpperCase().trim();
        if (algo.contains("FIFO")) {
            return runFIFO(refs, frameCount);
        } else if (algo.contains("OPT") || algo.contains("OPTIMAL")) {
            return runOPT(refs, frameCount);
        } else if (algo.contains("LRU")) {
            return runLRU(refs, frameCount);
        } else if (algo.contains("CLOCK") || algo.contains("SECOND")) {
            return runClock(refs, frameCount);
        } else if (algo.contains("LFU")) {
            return runLFU(refs, frameCount);
        } else {
            return runFIFO(refs, frameCount);
        }
    }

    // =====================================================================
    // Compare All 5 Paging Algorithms
    // =====================================================================
    public static PagingComparisonResponse compareAll(List<Integer> refs, int frameCount) {
        List<PagingResponse> results = new ArrayList<>();
        results.add(runFIFO(refs, frameCount));
        results.add(runOPT(refs, frameCount));
        results.add(runLRU(refs, frameCount));
        results.add(runClock(refs, frameCount));
        results.add(runLFU(refs, frameCount));

        String bestAlgo = "Optimal (OPT)";
        int minFaults = Integer.MAX_VALUE;

        for (PagingResponse r : results) {
            if (r.getTotalFaults() < minFaults) {
                minFaults = r.getTotalFaults();
                bestAlgo = r.getAlgorithm();
            }
        }

        return new PagingComparisonResponse(refs, frameCount, results, bestAlgo, minFaults);
    }

    private static PagingResponse createResponse(String algorithm, List<Integer> refs, int frameCount,
                                                 int hits, int faults, List<PageStep> steps) {
        int total = refs.size();
        double hitRatio = total > 0 ? (hits * 100.0 / total) : 0.0;
        double faultRatio = total > 0 ? (faults * 100.0 / total) : 0.0;

        return new PagingResponse(
                algorithm, frameCount, total, hits, faults,
                Math.round(hitRatio * 10.0) / 10.0,
                Math.round(faultRatio * 10.0) / 10.0,
                refs, steps
        );
    }
}
