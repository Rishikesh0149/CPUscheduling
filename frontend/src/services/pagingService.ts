import api from './api';
import {
  PagingRequest,
  PagingResponse,
  PagingComparisonResponse,
  BeladyAnomalyResult,
  AnswerVerificationRequest,
  AnswerVerificationResponse,
} from '../types';
import {
  runLocalPaging,
  runLocalPagingComparison,
  runLocalBeladyCheck,
  verifyAnswerLocally,
} from '../utils/localPaging';

export const pagingService = {
  simulate: async (request: PagingRequest): Promise<PagingResponse> => {
    try {
      const res = await api.post('/paging/run', request);
      return res.data;
    } catch {
      return runLocalPaging(request.algorithm, request.referenceString, request.frameCount);
    }
  },

  compare: async (referenceString: number[], frameCount: number): Promise<PagingComparisonResponse> => {
    try {
      const res = await api.post(`/paging/compare?frameCount=${frameCount}`, referenceString);
      return res.data;
    } catch {
      return runLocalPagingComparison(referenceString, frameCount);
    }
  },

  checkBelady: async (referenceString?: number[]): Promise<BeladyAnomalyResult> => {
    try {
      const res = await api.post('/paging/belady-check', referenceString || []);
      return res.data;
    } catch {
      return runLocalBeladyCheck(referenceString);
    }
  },

  verifyAnswer: async (request: AnswerVerificationRequest): Promise<AnswerVerificationResponse> => {
    try {
      const res = await api.post('/paging/verify-answer', request);
      return res.data;
    } catch {
      return verifyAnswerLocally(request);
    }
  },
};
