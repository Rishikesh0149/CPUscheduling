import {
  Process,
  ProcessResult,
  GanttSegment,
  SchedulingResponse,
  CompareResponse,
  AlgorithmComparison,
  Algorithm,
} from '../types';

interface ProcessInfo {
  pid: string;
  arrival: number;
  burst: number;
  priority: number;
  inputOrder: number;
  firstStart: number;
  completion: number;
}

function toInfoList(processes: Process[]): ProcessInfo[] {
  return processes.map((p, index) => ({
    pid: p.pid,
    arrival: p.arrivalTime,
    burst: p.burstTime,
    priority: p.priority,
    inputOrder: p.inputOrder !== undefined ? p.inputOrder : index,
    firstStart: -1,
    completion: 0,
  }));
}

function buildResponse(
  algorithm: string,
  quantum: number,
  jobs: ProcessInfo[],
  gantt: GanttSegment[]
): SchedulingResponse {
  // Sort results by PID naturally
  const sortedJobs = [...jobs].sort((a, b) => a.pid.localeCompare(b.pid, undefined, { numeric: true }));

  const results: ProcessResult[] = sortedJobs.map((p) => {
    const tat = p.completion - p.arrival;
    const wt = tat - p.burst;
    const rt = p.firstStart - p.arrival;
    return {
      pid: p.pid,
      arrivalTime: p.arrival,
      burstTime: p.burst,
      startTime: p.firstStart,
      completionTime: p.completion,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
    };
  });

  const n = results.length;
  const avgWt = n > 0 ? results.reduce((acc, r) => acc + r.waitingTime, 0) / n : 0;
  const avgTat = n > 0 ? results.reduce((acc, r) => acc + r.turnaroundTime, 0) / n : 0;
  const avgRt = n > 0 ? results.reduce((acc, r) => acc + r.responseTime, 0) / n : 0;
  const totalCpu = results.reduce((acc, r) => acc + r.burstTime, 0);
  const finalClock = gantt.length > 0 ? gantt[gantt.length - 1].end : 0;
  const totalIdle = Math.max(0, finalClock - totalCpu);

  return {
    algorithm,
    timeQuantum: quantum,
    processResults: results,
    ganttChart: gantt,
    avgWaitingTime: Number(avgWt.toFixed(2)),
    avgTurnaroundTime: Number(avgTat.toFixed(2)),
    avgResponseTime: Number(avgRt.toFixed(2)),
    totalProcesses: n,
    totalCpuTime: totalCpu,
    totalIdleTime: totalIdle,
    finalClock,
  };
}

export function runFCFS(processes: Process[]): SchedulingResponse {
  const jobs = toInfoList(processes);
  jobs.sort((a, b) => a.arrival - b.arrival || a.inputOrder - b.inputOrder);

  const gantt: GanttSegment[] = [];
  let clock = 0;

  for (const p of jobs) {
    if (clock < p.arrival) {
      gantt.push({ pid: 'IDLE', start: clock, end: p.arrival, idle: true, duration: p.arrival - clock });
      clock = p.arrival;
    }
    p.firstStart = clock;
    p.completion = clock + p.burst;
    gantt.push({ pid: p.pid, start: clock, end: p.completion, idle: false, duration: p.burst });
    clock = p.completion;
  }

  return buildResponse('FCFS', 0, jobs, gantt);
}

export function runSJF(processes: Process[]): SchedulingResponse {
  const jobs = toInfoList(processes);
  const completed: ProcessInfo[] = [];
  const gantt: GanttSegment[] = [];
  let time = 0;

  while (completed.length < jobs.length) {
    let best: ProcessInfo | null = null;

    for (const p of jobs) {
      if (!completed.includes(p) && p.arrival <= time) {
        if (
          best === null ||
          p.burst < best.burst ||
          (p.burst === best.burst && p.arrival < best.arrival) ||
          (p.burst === best.burst && p.arrival === best.arrival && p.inputOrder < best.inputOrder)
        ) {
          best = p;
        }
      }
    }

    if (best === null) {
      const remainingJobs = jobs.filter((p) => !completed.includes(p));
      const nextArrival = Math.min(...remainingJobs.map((p) => p.arrival));
      gantt.push({ pid: 'IDLE', start: time, end: nextArrival, idle: true, duration: nextArrival - time });
      time = nextArrival;
      continue;
    }

    best.firstStart = time;
    best.completion = time + best.burst;
    gantt.push({ pid: best.pid, start: time, end: best.completion, idle: false, duration: best.burst });
    time = best.completion;
    completed.push(best);
  }

  return buildResponse('SJF', 0, completed, gantt);
}

export function runSRTF(processes: Process[]): SchedulingResponse {
  const jobs = toInfoList(processes);
  const n = jobs.length;
  const remaining = jobs.map((p) => p.burst);
  const firstStart = new Array(n).fill(-1);
  const completion = new Array(n).fill(0);

  let time = 0;
  let finished = 0;
  const gantt: GanttSegment[] = [];
  let lastPid: string | null = null;
  let segStart = 0;

  while (finished < n) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      const p = jobs[i];
      if (remaining[i] > 0 && p.arrival <= time) {
        if (
          best === -1 ||
          remaining[i] < remaining[best] ||
          (remaining[i] === remaining[best] && p.arrival < jobs[best].arrival) ||
          (remaining[i] === remaining[best] && p.arrival === jobs[best].arrival && p.inputOrder < jobs[best].inputOrder)
        ) {
          best = i;
        }
      }
    }

    const currentPid = best === -1 ? 'IDLE' : jobs[best].pid;

    if (lastPid === null) {
      lastPid = currentPid;
      segStart = time;
    } else if (lastPid !== currentPid) {
      gantt.push({
        pid: lastPid,
        start: segStart,
        end: time,
        idle: lastPid === 'IDLE',
        duration: time - segStart,
      });
      lastPid = currentPid;
      segStart = time;
    }

    if (best === -1) {
      time++;
      continue;
    }

    if (firstStart[best] === -1) firstStart[best] = time;
    remaining[best]--;
    time++;

    if (remaining[best] === 0) {
      completion[best] = time;
      finished++;
    }
  }

  if (lastPid !== null) {
    gantt.push({
      pid: lastPid,
      start: segStart,
      end: time,
      idle: lastPid === 'IDLE',
      duration: time - segStart,
    });
  }

  for (let i = 0; i < n; i++) {
    jobs[i].firstStart = firstStart[i];
    jobs[i].completion = completion[i];
  }

  return buildResponse('SRTF', 0, jobs, gantt);
}

export function runPriority(processes: Process[]): SchedulingResponse {
  const jobs = toInfoList(processes);
  const completed: ProcessInfo[] = [];
  const gantt: GanttSegment[] = [];
  let time = 0;

  while (completed.length < jobs.length) {
    let best: ProcessInfo | null = null;

    for (const p of jobs) {
      if (!completed.includes(p) && p.arrival <= time) {
        if (
          best === null ||
          p.priority < best.priority ||
          (p.priority === best.priority && p.arrival < best.arrival) ||
          (p.priority === best.priority && p.arrival === best.arrival && p.inputOrder < best.inputOrder)
        ) {
          best = p;
        }
      }
    }

    if (best === null) {
      const remainingJobs = jobs.filter((p) => !completed.includes(p));
      const nextArrival = Math.min(...remainingJobs.map((p) => p.arrival));
      gantt.push({ pid: 'IDLE', start: time, end: nextArrival, idle: true, duration: nextArrival - time });
      time = nextArrival;
      continue;
    }

    best.firstStart = time;
    best.completion = time + best.burst;
    gantt.push({ pid: best.pid, start: time, end: best.completion, idle: false, duration: best.burst });
    time = best.completion;
    completed.push(best);
  }

  return buildResponse('Priority', 0, completed, gantt);
}

export function runRoundRobin(processes: Process[], quantum: number): SchedulingResponse {
  const jobs = toInfoList(processes);
  jobs.sort((a, b) => a.arrival - b.arrival || a.inputOrder - b.inputOrder);

  const n = jobs.length;
  const remaining = jobs.map((p) => p.burst);
  const firstStart = new Array(n).fill(-1);
  const completion = new Array(n).fill(0);

  const queue: number[] = [];
  const gantt: GanttSegment[] = [];
  let time = 0;
  let next = 0;
  let finished = 0;

  while (finished < n) {
    if (queue.length === 0 && next < n && time < jobs[next].arrival) {
      const nextArrival = jobs[next].arrival;
      gantt.push({ pid: 'IDLE', start: time, end: nextArrival, idle: true, duration: nextArrival - time });
      time = nextArrival;
    }

    while (next < n && jobs[next].arrival <= time) {
      queue.push(next++);
    }

    if (queue.length === 0) continue;

    const index = queue.shift()!;
    const p = jobs[index];

    if (firstStart[index] === -1) firstStart[index] = time;

    const runTime = Math.min(quantum, remaining[index]);
    const segStart = time;
    time += runTime;
    remaining[index] -= runTime;

    gantt.push({ pid: p.pid, start: segStart, end: time, idle: false, duration: runTime });

    while (next < n && jobs[next].arrival <= time) {
      queue.push(next++);
    }

    if (remaining[index] > 0) {
      queue.push(index);
    } else {
      completion[index] = time;
      finished++;
    }
  }

  for (let i = 0; i < n; i++) {
    jobs[i].firstStart = firstStart[i];
    jobs[i].completion = completion[i];
  }

  return buildResponse('Round Robin', quantum, jobs, gantt);
}

export function runLocalAlgorithm(algorithm: Algorithm, timeQuantum: number, processes: Process[]): SchedulingResponse {
  switch (algorithm) {
    case 'FCFS':
      return runFCFS(processes);
    case 'SJF':
      return runSJF(processes);
    case 'SRTF':
      return runSRTF(processes);
    case 'Priority':
      return runPriority(processes);
    case 'Round Robin':
      return runRoundRobin(processes, timeQuantum || 2);
  }
}

export function runLocalComparison(timeQuantum: number, processes: Process[]): CompareResponse {
  const algos: Algorithm[] = ['FCFS', 'SJF', 'SRTF', 'Priority', 'Round Robin'];
  const results: AlgorithmComparison[] = algos.map((algo) => {
    const res = runLocalAlgorithm(algo, timeQuantum, processes);
    return {
      algorithm: algo,
      avgWaitingTime: res.avgWaitingTime,
      avgTurnaroundTime: res.avgTurnaroundTime,
      avgResponseTime: res.avgResponseTime,
    };
  });

  const bestWt = [...results].sort((a, b) => a.avgWaitingTime - b.avgWaitingTime)[0]?.algorithm || 'FCFS';
  const bestTat = [...results].sort((a, b) => a.avgTurnaroundTime - b.avgTurnaroundTime)[0]?.algorithm || 'FCFS';
  const bestRt = [...results].sort((a, b) => a.avgResponseTime - b.avgResponseTime)[0]?.algorithm || 'FCFS';

  return {
    results,
    bestWaitingTime: bestWt,
    bestTurnaroundTime: bestTat,
    bestResponseTime: bestRt,
    timeQuantum: timeQuantum || 2,
  };
}
