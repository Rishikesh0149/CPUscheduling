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

// ===== Process Management =====

export const processService = {
  getAll: (): Promise<Process[]> =>
    api.get('/processes').then((r) => r.data),

  getById: (pid: string): Promise<Process> =>
    api.get(`/processes/${pid}`).then((r) => r.data),

  create: (request: CreateProcessRequest): Promise<Process> =>
    api.post('/processes', request).then((r) => r.data),

  delete: (pid: string): Promise<{ message: string }> =>
    api.delete(`/processes/${pid}`).then((r) => r.data),

  deleteAll: (): Promise<{ message: string }> =>
    api.delete('/processes').then((r) => r.data),

  moveToReady: (pid: string): Promise<Process> =>
    api.put(`/processes/${pid}/ready`).then((r) => r.data),
};

// ===== Scheduling =====

export const schedulingService = {
  run: (request: SchedulingRequest): Promise<SchedulingResponse> =>
    api.post('/scheduling/run', request).then((r) => r.data),

  compare: (request: CompareRequest): Promise<CompareResponse> =>
    api.post('/scheduling/compare', request).then((r) => r.data),

  getHistory: (): Promise<SchedulingHistory[]> =>
    api.get('/scheduling/history').then((r) => r.data),

  getHistoryById: (id: number): Promise<SchedulingHistory> =>
    api.get(`/scheduling/history/${id}`).then((r) => r.data),
};
