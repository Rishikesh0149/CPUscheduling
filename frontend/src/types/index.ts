// ===== Process Types =====

export type ProcessState = 'NEW' | 'READY' | 'TERMINATED';

export interface Process {
  pid: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  state: ProcessState;
  inputOrder: number;
}

export interface CreateProcessRequest {
  pid: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
}

// ===== Scheduling Types =====

export type Algorithm = 'FCFS' | 'SJF' | 'SRTF' | 'Priority' | 'Round Robin';

export interface SchedulingRequest {
  algorithm: Algorithm;
  timeQuantum: number;
}

export interface ProcessResult {
  pid: string;
  arrivalTime: number;
  burstTime: number;
  startTime: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
}

export interface GanttSegment {
  pid: string;
  start: number;
  end: number;
  idle: boolean;
  duration: number;
}

export interface SchedulingResponse {
  algorithm: string;
  timeQuantum: number;
  processResults: ProcessResult[];
  ganttChart: GanttSegment[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  totalProcesses: number;
  totalCpuTime: number;
  totalIdleTime: number;
  finalClock: number;
}

// ===== Comparison Types =====

export interface AlgorithmComparison {
  algorithm: string;
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
}

export interface CompareRequest {
  timeQuantum: number;
}

export interface CompareResponse {
  results: AlgorithmComparison[];
  bestWaitingTime: string;
  bestTurnaroundTime: string;
  bestResponseTime: string;
  timeQuantum: number;
}

// ===== History Types =====

export interface SchedulingHistory {
  id: number;
  algorithm: string;
  processCount: number;
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  totalCpuTime: number;
  totalIdleTime: number;
  finalClock: number;
  runAt: string;
}

// ===== API Error Type =====

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}

// ===== Paging Types =====

export type PagingAlgorithm = 'FIFO' | 'Optimal (OPT)' | 'LRU' | 'Second Chance (Clock)' | 'LFU';

export interface PageStep {
  stepIndex: number;
  page: number;
  frames: number[];
  hit: boolean;
  victimPage: number | null;
  replacedFrameIndex: number | null;
  clockPointer?: number | null;
  referenceBits?: number[] | null;
  pageFrequencies?: Record<number, number> | null;
  reason: string;
}

export interface PagingRequest {
  algorithm: string;
  referenceString: number[];
  frameCount: number;
}

export interface PagingResponse {
  algorithm: string;
  frameCount: number;
  totalPages: number;
  totalHits: number;
  totalFaults: number;
  hitRatio: number;
  faultRatio: number;
  referenceString: number[];
  steps: PageStep[];
}

export interface PagingComparisonResponse {
  referenceString: number[];
  frameCount: number;
  results: PagingResponse[];
  bestAlgorithm: string;
  minFaults: number;
}

export interface BeladyAnomalyResult {
  referenceString: number[];
  anomalyDetected: boolean;
  description: string;
  frameTests: Array<{
    frames: number;
    faults: number;
    hits: number;
    faultRatio: number;
    isAnomaly: boolean;
  }>;
}

// ===== AI Verification Agent Types =====

export interface AnswerVerificationRequest {
  algorithm: string;
  frameCount: number;
  referenceString: number[];
  userFaults?: number | null;
  userHits?: number | null;
  userHitRatio?: number | null;
  userVictims?: number[] | null;
  userNotes?: string;
}

export interface AnswerVerificationResponse {
  correct: boolean;
  scorePercentage: number;
  verdictTitle: string;
  summaryMessage: string;
  actualFaults: number;
  actualHits: number;
  actualHitRatio: number;
  actualFaultRatio: number;
  breakdown: Record<string, boolean>;
  discrepancies: string[];
  stepByStepAnalysis: string[];
  pedagogicalTips: string[];
  simulationResult: PagingResponse;
}

export interface SchedulingVerificationRequest {
  algorithm: string;
  timeQuantum: number;
  processes: CreateProcessRequest[];
  userAvgWaitingTime?: number | null;
  userAvgTurnaroundTime?: number | null;
  userAvgResponseTime?: number | null;
  userFinalClock?: number | null;
  userGanttOrder?: string[] | null;
  userProcessResults?: ProcessResult[] | null;
  userNotes?: string;
}

export interface SchedulingVerificationResponse {
  correct: boolean;
  scorePercentage: number;
  verdictTitle: string;
  summaryMessage: string;
  actualAvgWaitingTime: number;
  actualAvgTurnaroundTime: number;
  actualAvgResponseTime: number;
  actualFinalClock: number;
  breakdown: Record<string, boolean>;
  discrepancies: string[];
  processDiagnostics: string[];
  ganttComparison: string[];
  pedagogicalTips: string[];
  simulationResult: SchedulingResponse;
}


