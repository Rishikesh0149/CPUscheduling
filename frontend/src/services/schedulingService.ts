import api from './api';
import type {
  Process,
  CreateProcessRequest,
  SchedulingRequest,
  SchedulingResponse,
  CompareRequest,
  CompareResponse,
  SchedulingHistory,
} from '../types';
import { runLocalAlgorithm, runLocalComparison } from '../utils/localScheduler';

// Local storage key for fallback / offline mode
const STORAGE_KEY = 'os_scheduler_processes';

function getStoredProcesses(): Process[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveStoredProcesses(list: Process[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

// ===== Process Management =====

export const processService = {
  getAll: async (): Promise<Process[]> => {
    try {
      const res = await api.get('/processes');
      saveStoredProcesses(res.data);
      return res.data;
    } catch {
      return getStoredProcesses();
    }
  },

  getById: async (pid: string): Promise<Process> => {
    try {
      const res = await api.get(`/processes/${pid}`);
      return res.data;
    } catch {
      const list = getStoredProcesses();
      const found = list.find((p) => p.pid === pid);
      if (!found) throw new Error(`Process ${pid} not found`);
      return found;
    }
  },

  create: async (request: CreateProcessRequest): Promise<Process> => {
    try {
      const res = await api.post('/processes', request);
      return res.data;
    } catch {
      const list = getStoredProcesses();
      if (list.some((p) => p.pid.toUpperCase() === request.pid.toUpperCase())) {
        throw new Error(`Process with PID ${request.pid} already exists`);
      }
      const newProcess: Process = {
        pid: request.pid.toUpperCase(),
        arrivalTime: request.arrivalTime,
        burstTime: request.burstTime,
        priority: request.priority,
        state: 'NEW',
        inputOrder: list.length,
      };
      list.push(newProcess);
      saveStoredProcesses(list);
      return newProcess;
    }
  },

  delete: async (pid: string): Promise<{ message: string }> => {
    try {
      const res = await api.delete(`/processes/${pid}`);
      return res.data;
    } catch {
      const list = getStoredProcesses().filter((p) => p.pid !== pid);
      saveStoredProcesses(list);
      return { message: `Process ${pid} deleted successfully` };
    }
  },

  deleteAll: async (): Promise<{ message: string }> => {
    try {
      const res = await api.delete('/processes');
      saveStoredProcesses([]);
      return res.data;
    } catch {
      saveStoredProcesses([]);
      return { message: 'All processes deleted successfully' };
    }
  },

  moveToReady: async (pid: string): Promise<Process> => {
    try {
      const res = await api.put(`/processes/${pid}/ready`);
      return res.data;
    } catch {
      const list = getStoredProcesses();
      const p = list.find((item) => item.pid === pid);
      if (!p) throw new Error(`Process ${pid} not found`);
      p.state = 'READY';
      saveStoredProcesses(list);
      return p;
    }
  },
};

// ===== Scheduling =====

export const schedulingService = {
  run: async (request: SchedulingRequest): Promise<SchedulingResponse> => {
    try {
      const res = await api.post('/scheduling/run', request);
      return res.data;
    } catch {
      const processes = getStoredProcesses();
      if (processes.length === 0) {
        throw new Error('No processes to schedule. Please add processes first.');
      }
      const response = runLocalAlgorithm(request.algorithm, request.timeQuantum, processes);
      // Mark processes as TERMINATED
      processes.forEach((p) => (p.state = 'TERMINATED'));
      saveStoredProcesses(processes);
      return response;
    }
  },

  compare: async (request: CompareRequest): Promise<CompareResponse> => {
    try {
      const res = await api.post('/scheduling/compare', request);
      return res.data;
    } catch {
      const processes = getStoredProcesses();
      if (processes.length === 0) {
        throw new Error('No processes to compare. Please add processes first.');
      }
      return runLocalComparison(request.timeQuantum, processes);
    }
  },

  getHistory: async (): Promise<SchedulingHistory[]> => {
    try {
      const res = await api.get('/scheduling/history');
      return res.data;
    } catch {
      return [];
    }
  },

  getHistoryById: async (id: number): Promise<SchedulingHistory> => {
    const res = await api.get(`/scheduling/history/${id}`);
    return res.data;
  },
};
