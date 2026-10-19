import {
  PageStep,
  PagingResponse,
  PagingComparisonResponse,
  BeladyAnomalyResult,
  AnswerVerificationRequest,
  AnswerVerificationResponse,
} from '../types';

export function runLocalFIFO(refs: number[], frameCount: number): PagingResponse {
  const frames: number[] = [];
  const fifoQueue: number[] = [];
  const steps: PageStep[] = [];
  let hits = 0;
  let faults = 0;

  for (let i = 0; i < refs.length; i++) {
    const page = refs[i];
    const hit = frames.includes(page);
    let victim: number | null = null;
    let replacedIndex: number | null = null;
    let reason = '';

    if (hit) {
      hits++;
      reason = `Page ${page} hit! Already resident in frame cache.`;
    } else {
      faults++;
      if (frames.length < frameCount) {
        frames.push(page);
        fifoQueue.push(page);
        replacedIndex = frames.length - 1;
        reason = `Page fault: Allocated into free frame slot ${replacedIndex}.`;
      } else {
        victim = fifoQueue.shift()!;
        replacedIndex = frames.indexOf(victim);
        frames[replacedIndex] = page;
        fifoQueue.push(page);
        reason = `Page fault: Evicted oldest page ${victim} (FIFO replacement).`;
      }
    }

    steps.push({
      stepIndex: i,
      page,
      frames: [...frames],
      hit,
      victimPage: victim,
      replacedFrameIndex: replacedIndex,
      reason,
    });
  }

  return buildResponse('FIFO', refs, frameCount, hits, faults, steps);
}

export function runLocalOPT(refs: number[], frameCount: number): PagingResponse {
  const frames: number[] = [];
  const loadTimes: number[] = [];
  const steps: PageStep[] = [];
  let hits = 0;
  let faults = 0;

  for (let i = 0; i < refs.length; i++) {
    const page = refs[i];
    const hit = frames.includes(page);
    let victim: number | null = null;
    let replacedIndex: number | null = null;
    let reason = '';

    if (hit) {
      hits++;
      reason = `Page ${page} hit! Page found in frame memory.`;
    } else {
      faults++;
      if (frames.length < frameCount) {
        frames.push(page);
        loadTimes.push(i);
        replacedIndex = frames.length - 1;
        reason = `Page fault: Loaded into free frame slot ${replacedIndex}.`;
      } else {
        let farthestDistance = -1;
        let victimIdx = 0;

        for (let f = 0; f < frames.length; f++) {
          const candidate = frames[f];
          let nextUse = Number.MAX_SAFE_INTEGER;

          for (let future = i + 1; future < refs.length; future++) {
            if (refs[future] === candidate) {
              nextUse = future;
              break;
            }
          }

          if (nextUse > farthestDistance) {
            farthestDistance = nextUse;
            victimIdx = f;
          } else if (nextUse === farthestDistance && farthestDistance === Number.MAX_SAFE_INTEGER) {
            if (loadTimes[f] < loadTimes[victimIdx]) {
              victimIdx = f;
            }
          }
        }

        victim = frames[victimIdx];
        replacedIndex = victimIdx;
        frames[victimIdx] = page;
        loadTimes[victimIdx] = i;

        if (farthestDistance === Number.MAX_SAFE_INTEGER) {
          reason = `Page fault: Evicted page ${victim} (Never referenced again in future).`;
        } else {
          reason = `Page fault: Evicted page ${victim} (Next referenced farthest at step ${farthestDistance + 1}).`;
        }
      }
    }

    steps.push({
      stepIndex: i,
      page,
      frames: [...frames],
      hit,
      victimPage: victim,
      replacedFrameIndex: replacedIndex,
      reason,
    });
  }

  return buildResponse('Optimal (OPT)', refs, frameCount, hits, faults, steps);
}

export function runLocalLRU(refs: number[], frameCount: number): PagingResponse {
  const frames: number[] = [];
  const lastUsed: Record<number, number> = {};
  const steps: PageStep[] = [];
  let hits = 0;
  let faults = 0;

  for (let i = 0; i < refs.length; i++) {
    const page = refs[i];
    const hit = frames.includes(page);
    let victim: number | null = null;
    let replacedIndex: number | null = null;
    let reason = '';

    if (hit) {
      hits++;
      lastUsed[page] = i;
      reason = `Page ${page} hit! Updated last-used access timestamp to step ${i + 1}.`;
    } else {
      faults++;
      if (frames.length < frameCount) {
        frames.push(page);
        lastUsed[page] = i;
        replacedIndex = frames.length - 1;
        reason = `Page fault: Placed into unoccupied frame slot ${replacedIndex}.`;
      } else {
        let oldestTime = Number.MAX_SAFE_INTEGER;
        let victimIdx = 0;

        for (let f = 0; f < frames.length; f++) {
          const candidate = frames[f];
          const time = lastUsed[candidate] ?? -1;
          if (time < oldestTime) {
            oldestTime = time;
            victimIdx = f;
          }
        }

        victim = frames[victimIdx];
        replacedIndex = victimIdx;
        frames[victimIdx] = page;
        delete lastUsed[victim];
        lastUsed[page] = i;
        reason = `Page fault: Evicted page ${victim} (Least recently used, last accessed step ${oldestTime + 1}).`;
      }
    }

    steps.push({
      stepIndex: i,
      page,
      frames: [...frames],
      hit,
      victimPage: victim,
      replacedFrameIndex: replacedIndex,
      reason,
    });
  }

  return buildResponse('LRU', refs, frameCount, hits, faults, steps);
}

export function runLocalClock(refs: number[], frameCount: number): PagingResponse {
  const frames: (number | null)[] = new Array(frameCount).fill(null);
  const refBits: number[] = new Array(frameCount).fill(0);
  let hand = 0;
  const steps: PageStep[] = [];
  let hits = 0;
  let faults = 0;
  let occupiedCount = 0;

  for (let i = 0; i < refs.length; i++) {
    const page = refs[i];
    const existingIndex = frames.indexOf(page);
    const hit = existingIndex !== -1;
    let victim: number | null = null;
    let replacedIndex: number | null = null;
    let reason = '';

    if (hit) {
      hits++;
      refBits[existingIndex] = 1;
      reason = `Page ${page} hit! Reference bit set to 1 at frame slot ${existingIndex}.`;
    } else {
      faults++;
      if (occupiedCount < frameCount) {
        const emptyIdx = frames.indexOf(null);
        frames[emptyIdx] = page;
        refBits[emptyIdx] = 1;
        replacedIndex = emptyIdx;
        occupiedCount++;
        reason = `Page fault: Placed in initial frame slot ${emptyIdx} (Ref bit = 1).`;
      } else {
        const logParts: string[] = [];
        while (true) {
          if (refBits[hand] === 1) {
            refBits[hand] = 0;
            logParts.push(`Frame ${hand} (Page ${frames[hand]}) bit cleared 1→0`);
            hand = (hand + 1) % frameCount;
          } else {
            victim = frames[hand];
            replacedIndex = hand;
            frames[hand] = page;
            refBits[hand] = 1;
            reason = `Page fault: Evicted page ${victim} at frame ${hand} (Bit was 0). ${
              logParts.length > 0 ? '[' + logParts.join(', ') + ']' : ''
            }`;
            hand = (hand + 1) % frameCount;
            break;
          }
        }
      }
    }

    const cleanFrames = frames.filter((f): f is number => f !== null);

    steps.push({
      stepIndex: i,
      page,
      frames: cleanFrames,
      hit,
      victimPage: victim,
      replacedFrameIndex: replacedIndex,
      clockPointer: hand,
      referenceBits: [...refBits],
      reason,
    });
  }

  return buildResponse('Second Chance (Clock)', refs, frameCount, hits, faults, steps);
}

export function runLocalLFU(refs: number[], frameCount: number): PagingResponse {
  const frames: number[] = [];
  const freqMap: Record<number, number> = {};
  const arrivalTime: Record<number, number> = {};
  const steps: PageStep[] = [];
  let hits = 0;
  let faults = 0;

  for (let i = 0; i < refs.length; i++) {
    const page = refs[i];
    const hit = frames.includes(page);
    let victim: number | null = null;
    let replacedIndex: number | null = null;
    let reason = '';

    freqMap[page] = (freqMap[page] || 0) + 1;

    if (hit) {
      hits++;
      reason = `Page ${page} hit! Access frequency counter incremented to ${freqMap[page]}.`;
    } else {
      faults++;
      if (frames.length < frameCount) {
        frames.push(page);
        arrivalTime[page] = i;
        replacedIndex = frames.length - 1;
        reason = `Page fault: Allocated into empty frame slot ${replacedIndex} (Freq: ${freqMap[page]}).`;
      } else {
        let minFreq = Number.MAX_SAFE_INTEGER;
        let victimIdx = 0;

        for (let f = 0; f < frames.length; f++) {
          const candidate = frames[f];
          const freq = freqMap[candidate] || 0;
          if (freq < minFreq) {
            minFreq = freq;
            victimIdx = f;
          } else if (freq === minFreq) {
            if ((arrivalTime[candidate] ?? 0) < (arrivalTime[frames[victimIdx]] ?? 0)) {
              victimIdx = f;
            }
          }
        }

        victim = frames[victimIdx];
        replacedIndex = victimIdx;
        frames[victimIdx] = page;
        arrivalTime[page] = i;
        reason = `Page fault: Evicted page ${victim} (Lowest frequency count: ${minFreq} refs).`;
      }
    }

    const currentFreqs: Record<number, number> = {};
    for (const f of frames) {
      currentFreqs[f] = freqMap[f] || 0;
    }

    steps.push({
      stepIndex: i,
      page,
      frames: [...frames],
      hit,
      victimPage: victim,
      replacedFrameIndex: replacedIndex,
      pageFrequencies: currentFreqs,
      reason,
    });
  }

  return buildResponse('LFU', refs, frameCount, hits, faults, steps);
}

export function runLocalPaging(algo: string, refs: number[], frames: number): PagingResponse {
  const norm = algo.toUpperCase();
  if (norm.includes('FIFO')) return runLocalFIFO(refs, frames);
  if (norm.includes('OPT')) return runLocalOPT(refs, frames);
  if (norm.includes('LRU')) return runLocalLRU(refs, frames);
  if (norm.includes('CLOCK') || norm.includes('SECOND')) return runLocalClock(refs, frames);
  if (norm.includes('LFU')) return runLocalLFU(refs, frames);
  return runLocalFIFO(refs, frames);
}

export function runLocalPagingComparison(refs: number[], frames: number): PagingComparisonResponse {
  const results = [
    runLocalFIFO(refs, frames),
    runLocalOPT(refs, frames),
    runLocalLRU(refs, frames),
    runLocalClock(refs, frames),
    runLocalLFU(refs, frames),
  ];

  let bestAlgorithm = 'Optimal (OPT)';
  let minFaults = Number.MAX_SAFE_INTEGER;

  for (const r of results) {
    if (r.totalFaults < minFaults) {
      minFaults = r.totalFaults;
      bestAlgorithm = r.algorithm;
    }
  }

  return {
    referenceString: refs,
    frameCount: frames,
    results,
    bestAlgorithm,
    minFaults,
  };
}

export function runLocalBeladyCheck(refs: number[] = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]): BeladyAnomalyResult {
  const frameTests = [];
  let prevFaults = -1;
  let anomalyDetected = false;
  let description = 'No Belady Anomaly detected in test range.';

  for (let f = 1; f <= 6; f++) {
    const res = runLocalFIFO(refs, f);
    const isAnomaly = prevFaults !== -1 && res.totalFaults > prevFaults;
    if (isAnomaly) {
      anomalyDetected = true;
      description = `Belady's Anomaly observed! Frame count increased from ${f - 1} to ${f}, causing page faults to INCREASE from ${prevFaults} to ${res.totalFaults}!`;
    }
    prevFaults = res.totalFaults;
    frameTests.push({
      frames: f,
      faults: res.totalFaults,
      hits: res.totalHits,
      faultRatio: res.faultRatio,
      isAnomaly,
    });
  }

  return {
    referenceString: refs,
    anomalyDetected,
    description,
    frameTests,
  };
}

export function verifyAnswerLocally(req: AnswerVerificationRequest): AnswerVerificationResponse {
  const truth = runLocalPaging(req.algorithm, req.referenceString, req.frameCount);
  const breakdown: Record<string, boolean> = {};
  const discrepancies: string[] = [];
  const tips: string[] = [];
  let score = 100;

  if (req.userFaults !== undefined && req.userFaults !== null) {
    const ok = req.userFaults === truth.totalFaults;
    breakdown['Total Page Faults'] = ok;
    if (!ok) {
      score -= 40;
      discrepancies.push(
        `Your calculated Page Fault count was ${req.userFaults}, but the actual value is ${truth.totalFaults}.`
      );
    }
  }

  if (req.userHits !== undefined && req.userHits !== null) {
    const ok = req.userHits === truth.totalHits;
    breakdown['Total Page Hits'] = ok;
    if (!ok) {
      score -= 30;
      discrepancies.push(
        `Your calculated Page Hit count was ${req.userHits}, but the actual value is ${truth.totalHits}.`
      );
    }
  }

  if (req.userHitRatio !== undefined && req.userHitRatio !== null) {
    const ok = Math.abs(req.userHitRatio - truth.hitRatio) < 1.0;
    breakdown['Hit Ratio (%)'] = ok;
    if (!ok) {
      score -= 15;
      discrepancies.push(
        `Your calculated Hit Ratio was ${req.userHitRatio}%, but the true value is ${truth.hitRatio}%.`
      );
    }
  }

  if (req.userVictims && req.userVictims.length > 0) {
    const actualVictims = truth.steps.map((s) => s.victimPage).filter((v): v is number => v !== null);
    const count = Math.min(req.userVictims.length, actualVictims.length);
    let matched = 0;
    for (let k = 0; k < count; k++) {
      if (req.userVictims[k] === actualVictims[k]) {
        matched++;
      } else {
        discrepancies.push(
          `At eviction #${k + 1}, you chose page ${req.userVictims[k]}, but ${truth.algorithm} evicted page ${actualVictims[k]}.`
        );
      }
    }
    const victimsMatch = count > 0 && matched === actualVictims.length;
    breakdown['Victim Sequence'] = victimsMatch;
    if (!victimsMatch) score -= 15;
  }

  score = Math.max(0, score);
  const correct = score >= 95;

  let verdictTitle = '';
  let summaryMessage = '';

  if (correct) {
    verdictTitle = 'Verification Passed: 100% Accurate!';
    summaryMessage = `Superb work! Your calculations and understanding of ${truth.algorithm} are completely verified.`;
  } else if (score >= 60) {
    verdictTitle = `Partially Correct (${Math.round(score)}%)`;
    summaryMessage = `Good try! You've got the overall concept down, but small calculation discrepancies were found.`;
  } else {
    verdictTitle = `Discrepancies Detected (${Math.round(score)}%)`;
    summaryMessage = `The AI verification agent flagged differences between your submission and the actual execution trace.`;
  }

  const stepAnalysis = truth.steps.map(
    (s) =>
      `Step ${s.stepIndex + 1} (Ref ${s.page}): ${s.hit ? 'HIT' : 'FAULT'} -> Frames: [${s.frames.join(', ')}] ${
        s.victimPage !== null ? `(Evicted ${s.victimPage})` : ''
      } - ${s.reason}`
  );

  const aUpper = truth.algorithm.toUpperCase();
  if (aUpper.includes('FIFO')) {
    tips.push('FIFO principle: Replace the page that entered the memory earliest, ignoring hits.');
    tips.push("Be alert to Belady's Anomaly where more frames can lead to more faults in FIFO.");
  } else if (aUpper.includes('OPT')) {
    tips.push('Optimal rule: Evict the page that will not be used for the longest period of time.');
    tips.push('Pages with no future occurrences in the reference string are the top eviction candidates.');
  } else if (aUpper.includes('LRU')) {
    tips.push('LRU rule: Look backwards in time; replace the page that hasn’t been accessed for the longest duration.');
    tips.push('Every time a page HIT happens, renew its timestamp!');
  } else if (aUpper.includes('CLOCK') || aUpper.includes('SECOND')) {
    tips.push('Second Chance rule: If bit is 1, give it another chance (set to 0) and advance the clock hand.');
    tips.push('The victim is the first frame encountered with a reference bit of 0.');
  } else if (aUpper.includes('LFU')) {
    tips.push('LFU rule: Replace the page with the lowest overall reference count.');
    tips.push('When counts are equal, use FIFO (the one loaded earliest) as tie-breaker.');
  }

  return {
    correct,
    scorePercentage: score,
    verdictTitle,
    summaryMessage,
    actualFaults: truth.totalFaults,
    actualHits: truth.totalHits,
    actualHitRatio: truth.hitRatio,
    actualFaultRatio: truth.faultRatio,
    breakdown,
    discrepancies,
    stepByStepAnalysis: stepAnalysis,
    pedagogicalTips: tips,
    simulationResult: truth,
  };
}

function buildResponse(
  algo: string,
  refs: number[],
  frameCount: number,
  hits: number,
  faults: number,
  steps: PageStep[]
): PagingResponse {
  const total = refs.length;
  const hitRatio = total > 0 ? (hits * 100) / total : 0;
  const faultRatio = total > 0 ? (faults * 100) / total : 0;

  return {
    algorithm: algo,
    frameCount,
    totalPages: total,
    totalHits: hits,
    totalFaults: faults,
    hitRatio: Math.round(hitRatio * 10) / 10,
    faultRatio: Math.round(faultRatio * 10) / 10,
    referenceString: refs,
    steps,
  };
}
