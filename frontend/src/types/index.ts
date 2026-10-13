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
