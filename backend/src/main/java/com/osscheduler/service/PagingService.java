package com.osscheduler.service;

import com.osscheduler.dto.*;
import com.osscheduler.paging.PagingAlgorithms;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PagingService {

    public PagingResponse simulate(PagingRequest request) {
        return PagingAlgorithms.run(
                request.getAlgorithm(),
                request.getReferenceString(),
                request.getFrameCount()
        );
    }

    public PagingComparisonResponse compare(List<Integer> referenceString, int frameCount) {
        return PagingAlgorithms.compareAll(referenceString, frameCount);
    }

    public Map<String, Object> checkBeladyAnomaly(List<Integer> referenceString) {
        // Default Belady string if none provided: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
        List<Integer> refs = (referenceString != null && !referenceString.isEmpty())
                ? referenceString
                : Arrays.asList(1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5);

        List<Map<String, Object>> frameTests = new ArrayList<>();
        int prevFaults = -1;
        boolean anomalyDetected = false;
        String anomalyDetail = "No Belady's Anomaly observed for this sequence across frames 1 to 6.";

        for (int frames = 1; frames <= 6; frames++) {
            PagingResponse resp = PagingAlgorithms.runFIFO(refs, frames);
            Map<String, Object> data = new HashMap<>();
            data.put("frames", frames);
            data.put("faults", resp.getTotalFaults());
            data.put("hits", resp.getTotalHits());
            data.put("faultRatio", resp.getFaultRatio());

            if (prevFaults != -1 && resp.getTotalFaults() > prevFaults) {
                anomalyDetected = true;
                anomalyDetail = "Belady's Anomaly detected! Increasing memory frames from " +
                        (frames - 1) + " to " + frames +
                        " increased page faults from " + prevFaults + " to " + resp.getTotalFaults() + "!";
                data.put("isAnomaly", true);
            } else {
                data.put("isAnomaly", false);
            }

            prevFaults = resp.getTotalFaults();
            frameTests.add(data);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("referenceString", refs);
        result.put("anomalyDetected", anomalyDetected);
        result.put("description", anomalyDetail);
        result.put("frameTests", frameTests);
        return result;
    }

    public AnswerVerificationResponse verifyAnswer(AnswerVerificationRequest request) {
        PagingResponse truth = PagingAlgorithms.run(
                request.getAlgorithm(),
                request.getReferenceString(),
                request.getFrameCount()
        );

        AnswerVerificationResponse response = new AnswerVerificationResponse();
        response.setSimulationResult(truth);
        response.setActualFaults(truth.getTotalFaults());
        response.setActualHits(truth.getTotalHits());
        response.setActualHitRatio(truth.getHitRatio());
        response.setActualFaultRatio(truth.getFaultRatio());

        Map<String, Boolean> breakdown = new LinkedHashMap<>();
        List<String> discrepancies = new ArrayList<>();
        List<String> stepAnalysis = new ArrayList<>();
        List<String> tips = new ArrayList<>();

        double score = 100.0;

        // 1. Check Page Faults
        if (request.getUserFaults() != null) {
            boolean faultsCorrect = request.getUserFaults() == truth.getTotalFaults();
            breakdown.put("Total Page Faults", faultsCorrect);
            if (!faultsCorrect) {
                score -= 40.0;
                discrepancies.add("Your calculated Page Fault count was " + request.getUserFaults() +
                        ", but the actual count is " + truth.getTotalFaults() + ".");
            }
        }

        // 2. Check Page Hits
        if (request.getUserHits() != null) {
            boolean hitsCorrect = request.getUserHits() == truth.getTotalHits();
            breakdown.put("Total Page Hits", hitsCorrect);
            if (!hitsCorrect) {
                score -= 30.0;
                discrepancies.add("Your calculated Page Hit count was " + request.getUserHits() +
                        ", but the actual count is " + truth.getTotalHits() + ".");
            }
        }

        // 3. Check Hit Ratio if provided
        if (request.getUserHitRatio() != null) {
            double diff = Math.abs(request.getUserHitRatio() - truth.getHitRatio());
            boolean ratioCorrect = diff < 1.0;
            breakdown.put("Hit Ratio (%)", ratioCorrect);
            if (!ratioCorrect) {
                score -= 15.0;
                discrepancies.add("Your calculated Hit Ratio was " + request.getUserHitRatio() +
                        "%, but the actual Hit Ratio is " + truth.getHitRatio() + "%.");
            }
        }

        // 4. Check step-by-step victim page predictions if provided
        if (request.getUserVictims() != null && !request.getUserVictims().isEmpty()) {
            List<Integer> actualVictims = new ArrayList<>();
            for (PageStep step : truth.getSteps()) {
                if (step.getVictimPage() != null) {
                    actualVictims.add(step.getVictimPage());
                }
            }

            int checkLen = Math.min(request.getUserVictims().size(), actualVictims.size());
            int victimMatches = 0;
            for (int k = 0; k < checkLen; k++) {
                if (Objects.equals(request.getUserVictims().get(k), actualVictims.get(k))) {
                    victimMatches++;
                } else {
                    discrepancies.add("At replacement #" + (k + 1) + ", you predicted victim " +
                            request.getUserVictims().get(k) + ", but " + truth.getAlgorithm() +
                            " actually evicted page " + actualVictims.get(k) + ".");
                }
            }
            if (checkLen > 0) {
                breakdown.put("Victim Page Sequence", victimMatches == actualVictims.size());
                if (victimMatches < actualVictims.size()) {
                    score -= 15.0;
                }
            }
        }

        if (score < 0) score = 0;
        response.setScorePercentage(score);
        response.setCorrect(score >= 95.0);

        if (score >= 95.0) {
            response.setVerdictTitle("Verification Passed: 100% Correct!");
            response.setSummaryMessage("Excellent analysis! Your calculated values align perfectly with the " +
                    truth.getAlgorithm() + " execution rules.");
        } else if (score >= 60.0) {
            response.setVerdictTitle("Partially Correct (" + (int) score + "%)");
            response.setSummaryMessage("Good attempt! You have the right foundational intuition, but some calculation or replacement discrepancies were detected.");
        } else {
            response.setVerdictTitle("Calculation Discrepancies Detected (" + (int) score + "%)");
            response.setSummaryMessage("The AI Agent found mismatches between your submission and the actual simulation steps.");
        }

        // Step-by-step analytical breakdown
        for (PageStep s : truth.getSteps()) {
            stepAnalysis.add("Step " + (s.getStepIndex() + 1) + " (Ref " + s.getPage() + "): " +
                    (s.isHit() ? "HIT" : "FAULT") + " -> Frames: " + s.getFrames() +
                    (s.getVictimPage() != null ? " [Evicted " + s.getVictimPage() + "]" : "") +
                    " (" + s.getReason() + ")");
        }

        // Pedagogical guidance tips
        String algo = truth.getAlgorithm().toUpperCase();
        if (algo.contains("FIFO")) {
            tips.add("Rule Check: FIFO strictly evicts the page that has been in memory the longest, regardless of recent accesses.");
            tips.add("Remember Belady's Anomaly: FIFO is prone to higher page fault rates when frame capacity increases.");
        } else if (algo.contains("OPT")) {
            tips.add("Rule Check: Optimal (OPT) replaces the page whose next reference occurs farthest in the future.");
            tips.add("Pages that are NEVER referenced again in the future string have highest eviction priority.");
        } else if (algo.contains("LRU")) {
            tips.add("Rule Check: LRU replaces the page whose most recent reference occurred farthest in the past.");
            tips.add("Ensure you update the access timestamp whenever a page HIT occurs!");
        } else if (algo.contains("CLOCK") || algo.contains("SECOND")) {
            tips.add("Rule Check: Second Chance gives pages with reference bit = 1 a second chance by setting the bit to 0 and advancing the hand.");
            tips.add("When a page hit occurs, its reference bit is immediately set to 1 without moving the hand.");
        } else if (algo.contains("LFU")) {
            tips.add("Rule Check: LFU replaces the page with the lowest access frequency count.");
            tips.add("When a frequency tie occurs, break ties using FIFO arrival order.");
        }

        response.setBreakdown(breakdown);
        response.setDiscrepancies(discrepancies);
        response.setStepByStepAnalysis(stepAnalysis);
        response.setPedagogicalTips(tips);

        return response;
    }
}
