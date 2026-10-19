import React, { useState } from 'react';
import {
  Bot,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Send,
  HelpCircle,
  RefreshCw,
  Award,
  Layers,
  Cpu,
  Plus,
  Trash2,
  Clock,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  PagingAlgorithm,
  Algorithm,
  CreateProcessRequest,
  ProcessResult,
  AnswerVerificationRequest,
  AnswerVerificationResponse,
  SchedulingVerificationRequest,
  SchedulingVerificationResponse,
} from '../types';
import { pagingService } from '../services/pagingService';
import { schedulingService } from '../services/schedulingService';

interface AIVerificationPageProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

// ===== Paging Practice Challenges =====
interface PagingPracticeProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  algorithm: PagingAlgorithm;
  referenceString: number[];
  frameCount: number;
  prompt: string;
}

const PAGING_PROBLEMS: PagingPracticeProblem[] = [
  {
    title: 'Textbook LRU Challenge',
    difficulty: 'Easy',
    algorithm: 'LRU',
    referenceString: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3],
    frameCount: 3,
    prompt: 'Calculate total Page Faults and Page Hits using LRU with 3 frames.',
  },
  {
    title: 'Optimal Benchmark Examination',
    difficulty: 'Medium',
    algorithm: 'Optimal (OPT)',
    referenceString: [2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2],
    frameCount: 3,
    prompt: 'Determine the theoretical minimum page fault count using the Optimal (OPT) algorithm.',
  },
  {
    title: 'Second Chance Clock Pointer Tracking',
    difficulty: 'Hard',
    algorithm: 'Second Chance (Clock)',
    referenceString: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
    frameCount: 4,
    prompt: 'Trace reference bit flips and hand advances for Second Chance replacement with 4 frames.',
  },
  {
    title: 'LFU Frequency Tie-Break',
    difficulty: 'Hard',
    algorithm: 'LFU',
    referenceString: [1, 1, 1, 2, 2, 3, 4, 1, 2, 3, 5],
    frameCount: 3,
    prompt: 'Calculate page faults for LFU with 3 frames, using FIFO as the tie-breaker for equal frequencies.',
  },
];

// ===== CPU Scheduling Practice Challenges =====
interface CpuPracticeProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  algorithm: Algorithm;
  quantum?: number;
  processes: CreateProcessRequest[];
  prompt: string;
}

const CPU_PROBLEMS: CpuPracticeProblem[] = [
  {
    title: 'FCFS Convoy Effect Problem',
    difficulty: 'Easy',
    algorithm: 'FCFS',
    processes: [
      { pid: 'P1', arrivalTime: 0, burstTime: 24, priority: 1 },
      { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 2 },
      { pid: 'P3', arrivalTime: 0, burstTime: 3, priority: 3 },
    ],
    prompt: 'Compute Average Waiting Time and Turnaround Time when a long CPU-burst process arrives first.',
  },
  {
    title: 'SRTF Preemption & Tie-Break Exam',
    difficulty: 'Medium',
    algorithm: 'SRTF',
    processes: [
      { pid: 'P1', arrivalTime: 0, burstTime: 8, priority: 3 },
      { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
      { pid: 'P3', arrivalTime: 2, burstTime: 9, priority: 4 },
      { pid: 'P4', arrivalTime: 3, burstTime: 5, priority: 2 },
    ],
    prompt: 'Evaluate remaining times at arrival ticks and calculate Avg WT and Completion Times under SRTF.',
  },
  {
    title: 'Round Robin Quantum Time-Slice',
    difficulty: 'Medium',
    algorithm: 'Round Robin',
    quantum: 2,
    processes: [
      { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
      { pid: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
      { pid: 'P3', arrivalTime: 2, burstTime: 1, priority: 3 },
      { pid: 'P4', arrivalTime: 3, burstTime: 2, priority: 4 },
    ],
    prompt: 'Trace queue rotation with Time Quantum = 2 and compute Average Turnaround Time and Waiting Time.',
  },
  {
    title: 'Priority Scheduling Analysis',
    difficulty: 'Hard',
    algorithm: 'Priority',
    processes: [
      { pid: 'P1', arrivalTime: 0, burstTime: 4, priority: 3 },
      { pid: 'P2', arrivalTime: 1, burstTime: 5, priority: 1 },
      { pid: 'P3', arrivalTime: 2, burstTime: 2, priority: 4 },
      { pid: 'P4', arrivalTime: 3, burstTime: 1, priority: 2 },
    ],
    prompt: 'Schedule jobs based on highest priority (lowest numerical value) and verify average metrics.',
  },
];

const TUTOR_TOPICS: Record<string, { category: string; question: string; answer: string; keyRule: string }> = {
  srtfPreemption: {
    category: 'CPU Scheduling',
    question: 'How does SRTF decide when to preempt a running process?',
    answer:
      'SRTF (Shortest Remaining Time First) is the preemptive variant of SJF. Whenever a new process arrives in the system, the CPU compares its required burst time with the REMAINING burst time of the currently running process. If the newcomer has a strictly shorter remaining burst time, the CPU immediately preempts the active job, pushes it to ready queue, and allocates the CPU to the newcomer.',
    keyRule: 'Key Rule: If New_Process.Burst < Current_Process.RemainingBurst, preempt immediately!',
  },
  rrQuantum: {
    category: 'CPU Scheduling',
    question: 'What happens if Round Robin time quantum is too small or too large?',
    answer:
      'If the time quantum is extremely small (e.g., 1ms), context switching overhead dominates CPU cycles and throughput collapses. If the time quantum is infinitely large, Round Robin degenerates into standard FCFS (First-Come, First-Served). The optimal quantum is typically chosen such that 80% of CPU bursts are shorter than the quantum.',
    keyRule: 'Key Rule: Small quantum -> high context switch overhead; Large quantum -> behaves like FCFS.',
  },
  belady: {
    category: 'Memory Paging',
    question: "What is Belady's Anomaly and which algorithms suffer from it?",
    answer:
      "Belady's Anomaly occurs when increasing the number of physical page frames results in MORE page faults rather than fewer. It primarily affects FIFO and other non-stack algorithms. Stack algorithms (like LRU and Optimal) are mathematically guaranteed never to suffer from Belady's Anomaly because the set of pages resident in N frames is always a strict subset of pages resident in N+1 frames.",
    keyRule: "Key Rule: FIFO can experience Belady's Anomaly. LRU and Optimal are immune.",
  },
  clock: {
    category: 'Memory Paging',
    question: 'How does the Second Chance (Clock) algorithm approximate LRU with low hardware overhead?',
    answer:
      'True LRU requires hardware timestamps on every memory reference or expensive list manipulation. The Clock algorithm approximates LRU efficiently using a single Reference Bit per frame. When a page is accessed, the CPU hardware sets its reference bit to 1. When a replacement is needed, a circular clock hand inspects frames: if bit == 1, it resets it to 0 (second chance) and advances; if bit == 0, it selects that frame as the victim immediately.',
    keyRule: 'Key Rule: Bit 1 gets reset to 0; first frame found with Bit 0 is evicted.',
  },
};

export const AIVerificationPage: React.FC<AIVerificationPageProps> = ({ onNotify }) => {
  const [activeModule, setActiveModule] = useState<'cpu' | 'paging'>('cpu');

  // ===== CPU Scheduling Verifier State =====
  const [cpuAlgorithm, setCpuAlgorithm] = useState<Algorithm>('SRTF');
  const [cpuQuantum, setCpuQuantum] = useState<number>(2);
  const [cpuProcesses, setCpuProcesses] = useState<CreateProcessRequest[]>([
    { pid: 'P1', arrivalTime: 0, burstTime: 8, priority: 3 },
    { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
    { pid: 'P3', arrivalTime: 2, burstTime: 9, priority: 4 },
    { pid: 'P4', arrivalTime: 3, burstTime: 5, priority: 2 },
  ]);
  const [userAvgWT, setUserAvgWT] = useState<string>('');
  const [userAvgTAT, setUserAvgTAT] = useState<string>('');
  const [userAvgRT, setUserAvgRT] = useState<string>('');
  const [userFinalClock, setUserFinalClock] = useState<string>('');
  const [userGanttOrder, setUserGanttOrder] = useState<string>('');
  const [cpuProcInputs, setCpuProcInputs] = useState<Record<string, { ct: string; tat: string; wt: string }>>({});
  const [isCpuLoading, setIsCpuLoading] = useState<boolean>(false);
  const [cpuVerificationResult, setCpuVerificationResult] = useState<SchedulingVerificationResponse | null>(null);

  // ===== Paging Verifier State =====
  const [pagingAlgorithm, setPagingAlgorithm] = useState<PagingAlgorithm>('LRU');
  const [refStringInput, setRefStringInput] = useState<string>('7, 0, 1, 2, 0, 3, 0, 4, 2, 3');
  const [frameCount, setFrameCount] = useState<number>(3);
  const [userFaults, setUserFaults] = useState<string>('');
  const [userHits, setUserHits] = useState<string>('');
  const [userHitRatio, setUserHitRatio] = useState<string>('');
  const [userVictims, setUserVictims] = useState<string>('');
  const [isPagingLoading, setIsPagingLoading] = useState<boolean>(false);
  const [pagingVerificationResult, setPagingVerificationResult] = useState<AnswerVerificationResponse | null>(null);

  // Active Tutor Topic
  const [activeTutorTopic, setActiveTutorTopic] = useState<string>('srtfPreemption');

  // Process editor helpers
  const handleAddProcess = () => {
    const nextNum = cpuProcesses.length + 1;
    const newProc: CreateProcessRequest = {
      pid: `P${nextNum}`,
      arrivalTime: nextNum - 1,
      burstTime: 4,
      priority: 2,
    };
    setCpuProcesses([...cpuProcesses, newProc]);
  };

  const handleRemoveProcess = (pid: string) => {
    if (cpuProcesses.length <= 1) {
      onNotify('At least one process must remain', 'error');
      return;
    }
    setCpuProcesses(cpuProcesses.filter((p) => p.pid !== pid));
  };

  const handleUpdateProcess = (index: number, field: keyof CreateProcessRequest, value: any) => {
    const updated = [...cpuProcesses];
    updated[index] = { ...updated[index], [field]: value };
    setCpuProcesses(updated);
  };

  // CPU Verification Submission
  const handleVerifyCpu = async () => {
    if (userAvgWT.trim() === '' && userAvgTAT.trim() === '' && userFinalClock.trim() === '') {
      onNotify('Please enter at least your predicted Avg Waiting Time, Avg Turnaround Time, or Final Clock', 'error');
      return;
    }

    const procResults: ProcessResult[] = [];
    Object.entries(cpuProcInputs).forEach(([pid, vals]) => {
      if (vals.ct !== '' || vals.tat !== '' || vals.wt !== '') {
        procResults.push({
          pid,
          arrivalTime: 0,
          burstTime: 0,
          startTime: 0,
          completionTime: Number(vals.ct) || 0,
          turnaroundTime: Number(vals.tat) || 0,
          waitingTime: Number(vals.wt) || 0,
          responseTime: 0,
        });
      }
    });

    const ganttOrder = userGanttOrder.trim()
      ? userGanttOrder.split(/[\s,]+/).map((s) => s.trim()).filter((s) => s.length > 0)
      : undefined;

    const req: SchedulingVerificationRequest = {
      algorithm: cpuAlgorithm,
      timeQuantum: cpuAlgorithm === 'Round Robin' ? cpuQuantum : 2,
      processes: cpuProcesses,
      userAvgWaitingTime: userAvgWT.trim() !== '' ? Number(userAvgWT) : null,
      userAvgTurnaroundTime: userAvgTAT.trim() !== '' ? Number(userAvgTAT) : null,
      userAvgResponseTime: userAvgRT.trim() !== '' ? Number(userAvgRT) : null,
      userFinalClock: userFinalClock.trim() !== '' ? Number(userFinalClock) : null,
      userGanttOrder: ganttOrder,
      userProcessResults: procResults.length > 0 ? procResults : undefined,
    };

    try {
      setIsCpuLoading(true);
      const res = await schedulingService.verifyAnswer(req);
      setCpuVerificationResult(res);
      if (res.correct) {
        onNotify('🎉 100% Accurate! AI Agent verified your CPU schedule perfectly!', 'success');
      } else {
        onNotify('AI Agent analyzed your schedule and diagnosed calculation errors.', 'info');
      }
    } catch (err: any) {
      onNotify(err.message || 'Verification process failed', 'error');
    } finally {
      setIsCpuLoading(false);
    }
  };

  // Paging Verification Submission
  const parseReferenceString = (input: string): number[] => {
    return input
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !isNaN(Number(s)))
      .map(Number);
  };

  const handleVerifyPaging = async () => {
    const refs = parseReferenceString(refStringInput);
    if (refs.length === 0) {
      onNotify('Please enter a valid reference string of integers', 'error');
      return;
    }
    if (userFaults.trim() === '' && userHits.trim() === '') {
      onNotify('Please enter at least your predicted Page Faults or Page Hits', 'error');
      return;
    }

    const victimList = userVictims.trim().length > 0 ? parseReferenceString(userVictims) : undefined;
    const req: AnswerVerificationRequest = {
      algorithm: pagingAlgorithm,
      frameCount,
      referenceString: refs,
      userFaults: userFaults.trim() !== '' ? Number(userFaults) : null,
      userHits: userHits.trim() !== '' ? Number(userHits) : null,
      userHitRatio: userHitRatio.trim() !== '' ? Number(userHitRatio) : null,
      userVictims: victimList,
    };

    try {
      setIsPagingLoading(true);
      const res = await pagingService.verifyAnswer(req);
      setPagingVerificationResult(res);
      if (res.correct) {
        onNotify('🎉 100% Correct! AI Agent verified your paging calculation!', 'success');
      } else {
        onNotify('AI Agent analyzed your submission and found discrepancies.', 'info');
      }
    } catch (err: any) {
      onNotify(err.message || 'Verification process failed', 'error');
    } finally {
      setIsPagingLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Header */}
      <div className="card" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.35)',
            }}
          >
            <Bot size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc' }}>
              AI Answer Verification Agent & Virtual OS Tutor
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Dual-domain automated grader: Validate your manual calculations for both <strong>CPU Process Scheduling</strong> (FCFS, SJF, SRTF, Priority, Round Robin) and <strong>Memory Paging</strong> (FIFO, OPT, LRU, Clock, LFU) with step diagnostics.
            </p>
          </div>
        </div>

        {/* Module Switcher Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
          <button
            onClick={() => setActiveModule('cpu')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: activeModule === 'cpu' ? '1px solid #6366f1' : '1px solid var(--color-border)',
              background: activeModule === 'cpu' ? 'rgba(99, 102, 241, 0.2)' : 'var(--color-bg-secondary)',
              color: activeModule === 'cpu' ? '#818cf8' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <Cpu size={16} /> CPU Scheduling Verifier
          </button>

          <button
            onClick={() => setActiveModule('paging')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: activeModule === 'paging' ? '1px solid #a855f7' : '1px solid var(--color-border)',
              background: activeModule === 'paging' ? 'rgba(168, 85, 247, 0.2)' : 'var(--color-bg-secondary)',
              color: activeModule === 'paging' ? '#c084fc' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <Layers size={16} /> Memory Paging Verifier
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1: CPU SCHEDULING VERIFIER                                         */}
      {/* ========================================================================= */}
      {activeModule === 'cpu' && (
        <>
          {/* Preset Practice Challenges for CPU */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Sparkles size={18} color="#f59e0b" /> Academic CPU Scheduling Challenges
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Load a problem, solve by hand, then verify your results
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {CPU_PROBLEMS.map((prob, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{prob.title}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background:
                            prob.difficulty === 'Easy'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : prob.difficulty === 'Medium'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          color:
                            prob.difficulty === 'Easy'
                              ? '#10b981'
                              : prob.difficulty === 'Medium'
                              ? '#f59e0b'
                              : '#ef4444',
                        }}
                      >
                        {prob.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#818cf8', marginBottom: '6px', fontWeight: 600 }}>
                      {prob.algorithm} {prob.quantum ? `(Quantum = ${prob.quantum})` : ''} • {prob.processes.length} Processes
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, marginBottom: '10px' }}>
                      {prob.prompt}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCpuAlgorithm(prob.algorithm);
                      if (prob.quantum) setCpuQuantum(prob.quantum);
                      setCpuProcesses(prob.processes);
                      setUserAvgWT('');
                      setUserAvgTAT('');
                      setUserAvgRT('');
                      setUserFinalClock('');
                      setUserGanttOrder('');
                      setCpuProcInputs({});
                      setCpuVerificationResult(null);
                      onNotify(`Loaded challenge: ${prob.title}`, 'info');
                    }}
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid #6366f1',
                      color: '#818cf8',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    Load Challenge <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CPU Problem Config & Process Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Cpu size={18} color="var(--color-accent)" /> Step 1: Scheduling Parameters & Process Set
              </div>
              <button
                onClick={handleAddProcess}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} color="#10b981" /> Add Process
              </button>
            </div>

            {/* Algorithm Select & Quantum */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Target Scheduling Algorithm:
                </label>
                <select
                  value={cpuAlgorithm}
                  onChange={(e) => setCpuAlgorithm(e.target.value as Algorithm)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="FCFS">First Come First Served (FCFS)</option>
                  <option value="SJF">Shortest Job First (SJF - Non-Preemptive)</option>
                  <option value="SRTF">Shortest Remaining Time First (SRTF - Preemptive)</option>
                  <option value="Priority">Priority Scheduling (Non-Preemptive)</option>
                  <option value="Round Robin">Round Robin (RR)</option>
                </select>
              </div>

              {cpuAlgorithm === 'Round Robin' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Time Quantum (q):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={cpuQuantum}
                    onChange={(e) => setCpuQuantum(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-secondary)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Editable Process Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '8px' }}>Process ID</th>
                    <th style={{ padding: '8px' }}>Arrival Time (AT)</th>
                    <th style={{ padding: '8px' }}>Burst Time (BT)</th>
                    <th style={{ padding: '8px' }}>Priority (Lower = Higher)</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cpuProcesses.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#818cf8' }}>{p.pid}</td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          min="0"
                          value={p.arrivalTime}
                          onChange={(e) => handleUpdateProcess(idx, 'arrivalTime', Number(e.target.value))}
                          style={{
                            width: '70px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-secondary)',
                            color: '#f8fafc',
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          min="1"
                          value={p.burstTime}
                          onChange={(e) => handleUpdateProcess(idx, 'burstTime', Number(e.target.value))}
                          style={{
                            width: '70px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-secondary)',
                            color: '#f8fafc',
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          type="number"
                          min="1"
                          value={p.priority}
                          onChange={(e) => handleUpdateProcess(idx, 'priority', Number(e.target.value))}
                          style={{
                            width: '70px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-secondary)',
                            color: '#f8fafc',
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveProcess(p.pid)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                          }}
                          title="Remove process"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Step 2: Student Calculated Metrics Input */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: '10px',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#f59e0b" /> Step 2: Enter Your Calculated Scheduling Metrics:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Predicted Avg Waiting Time (WT):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={userAvgWT}
                    onChange={(e) => setUserAvgWT(e.target.value)}
                    placeholder="e.g. 5.75"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-primary)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Predicted Avg Turnaround Time (TAT):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={userAvgTAT}
                    onChange={(e) => setUserAvgTAT(e.target.value)}
                    placeholder="e.g. 11.25"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-primary)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Predicted Final Clock (Completion):
                  </label>
                  <input
                    type="number"
                    value={userFinalClock}
                    onChange={(e) => setUserFinalClock(e.target.value)}
                    placeholder="e.g. 26"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-primary)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Gantt Order (Optional, comma-separated):
                  </label>
                  <input
                    type="text"
                    value={userGanttOrder}
                    onChange={(e) => setUserGanttOrder(e.target.value)}
                    placeholder="e.g. P1, P2, P4, P3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-primary)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Verify Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleVerifyCpu}
                disabled={isCpuLoading}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: isCpuLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                }}
              >
                <Bot size={18} /> {isCpuLoading ? 'Verifying CPU Schedule...' : 'Verify CPU Schedule with AI Agent'}
              </button>
            </div>
          </div>

          {/* CPU Verification Result Assessment Card */}
          {cpuVerificationResult && (
            <div className="card" style={{ border: `1px solid ${cpuVerificationResult.correct ? '#10b981' : '#f59e0b'}` }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {cpuVerificationResult.correct ? (
                    <CheckCircle size={24} color="#10b981" />
                  ) : (
                    <AlertCircle size={24} color="#f59e0b" />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                      {cpuVerificationResult.verdictTitle}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {cpuVerificationResult.summaryMessage}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: cpuVerificationResult.correct ? '#10b981' : '#f59e0b',
                    background: cpuVerificationResult.correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${cpuVerificationResult.correct ? '#10b981' : '#f59e0b'}`,
                  }}
                >
                  {Math.round(cpuVerificationResult.scorePercentage)}%
                </div>
              </div>

              {/* Metric Comparison Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Actual Avg Waiting Time
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                    {cpuVerificationResult.actualAvgWaitingTime}
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Actual Avg Turnaround Time
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>
                    {cpuVerificationResult.actualAvgTurnaroundTime}
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Actual Final Clock
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                    {cpuVerificationResult.actualFinalClock}
                  </div>
                </div>
              </div>

              {/* Checklist Badges */}
              {Object.keys(cpuVerificationResult.breakdown).length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Calculation Breakdown Verification:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(cpuVerificationResult.breakdown).map(([item, isOk]) => (
                      <div
                        key={item}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: isOk ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          border: `1px solid ${isOk ? '#10b981' : '#ef4444'}`,
                          color: isOk ? '#10b981' : '#ef4444',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isOk ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {item}: {isOk ? 'Accurate' : 'Discrepancy'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discrepancies callout */}
              {cpuVerificationResult.discrepancies.length > 0 && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                    AI Diagnostic Calculation Discrepancies:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>
                    {cpuVerificationResult.discrepancies.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pedagogical Tips */}
              {cpuVerificationResult.pedagogicalTips.length > 0 && (
                <div
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                    Scheduling Principles & Advice:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.82rem', color: '#c7d2fe', lineHeight: 1.5 }}>
                    {cpuVerificationResult.pedagogicalTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ground Truth Process Result Table */}
              <details style={{ marginTop: '0.5rem', cursor: 'pointer' }}>
                <summary style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', outline: 'none' }}>
                  View Ground Truth Process Completion & Gantt Chart
                </summary>
                <div style={{ marginTop: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', marginBottom: '10px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        <th style={{ padding: '6px' }}>PID</th>
                        <th style={{ padding: '6px' }}>Arrival</th>
                        <th style={{ padding: '6px' }}>Burst</th>
                        <th style={{ padding: '6px' }}>Completion (CT)</th>
                        <th style={{ padding: '6px' }}>Turnaround (TAT)</th>
                        <th style={{ padding: '6px' }}>Waiting (WT)</th>
                        <th style={{ padding: '6px' }}>Response (RT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cpuVerificationResult.simulationResult.processResults.map((pr) => (
                        <tr key={pr.pid} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '6px', fontWeight: 700, color: '#818cf8' }}>{pr.pid}</td>
                          <td style={{ padding: '6px' }}>{pr.arrivalTime}</td>
                          <td style={{ padding: '6px' }}>{pr.burstTime}</td>
                          <td style={{ padding: '6px', fontWeight: 600 }}>{pr.completionTime}</td>
                          <td style={{ padding: '6px', fontWeight: 600 }}>{pr.turnaroundTime}</td>
                          <td style={{ padding: '6px', fontWeight: 600 }}>{pr.waitingTime}</td>
                          <td style={{ padding: '6px' }}>{pr.responseTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Gantt Timeline Trace:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {cpuVerificationResult.ganttComparison.map((g, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'var(--color-bg-secondary)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          color: '#f8fafc',
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODULE 2: MEMORY PAGING VERIFIER                                          */}
      {/* ========================================================================= */}
      {activeModule === 'paging' && (
        <>
          {/* Preset Practice Challenges for Paging */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Sparkles size={18} color="#f59e0b" /> Academic Paging Challenges
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Select a paging challenge to solve and verify with AI
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {PAGING_PROBLEMS.map((prob, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{prob.title}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background:
                            prob.difficulty === 'Easy'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : prob.difficulty === 'Medium'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          color:
                            prob.difficulty === 'Easy'
                              ? '#10b981'
                              : prob.difficulty === 'Medium'
                              ? '#f59e0b'
                              : '#ef4444',
                        }}
                      >
                        {prob.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#818cf8', marginBottom: '6px', fontWeight: 600 }}>
                      {prob.algorithm} • {prob.frameCount} Frames
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, marginBottom: '10px' }}>
                      {prob.prompt}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setPagingAlgorithm(prob.algorithm);
                      setRefStringInput(prob.referenceString.join(', '));
                      setFrameCount(prob.frameCount);
                      setUserFaults('');
                      setUserHits('');
                      setUserHitRatio('');
                      setUserVictims('');
                      setPagingVerificationResult(null);
                      onNotify(`Loaded challenge: ${prob.title}`, 'info');
                    }}
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid #6366f1',
                      color: '#818cf8',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    Load Challenge <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Paging Problem Input */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Layers size={18} color="var(--color-accent)" /> Step 1: Paging Problem Definition & Your Answers
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Algorithm:
                </label>
                <select
                  value={pagingAlgorithm}
                  onChange={(e) => setPagingAlgorithm(e.target.value as PagingAlgorithm)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="FIFO">1. FIFO (First-In, First-Out)</option>
                  <option value="Optimal (OPT)">2. Optimal (OPT)</option>
                  <option value="LRU">3. LRU (Least Recently Used)</option>
                  <option value="Second Chance (Clock)">4. Second Chance / Clock</option>
                  <option value="LFU">5. LFU (Least Frequently Used)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Reference String:
                </label>
                <input
                  type="text"
                  value={refStringInput}
                  onChange={(e) => setRefStringInput(e.target.value)}
                  placeholder="e.g. 7, 0, 1, 2, 0, 3"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    color: '#f8fafc',
                    fontFamily: 'monospace',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Frame Allocation: <span style={{ color: '#818cf8', fontWeight: 700 }}>{frameCount} Frames</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={frameCount}
                  onChange={(e) => setFrameCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#6366f1', marginTop: '10px' }}
                />
              </div>
            </div>

            {/* Student Answers Form */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: '10px',
                padding: '1.25rem',
                border: '1px solid var(--color-border)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#f59e0b" /> Enter Your Calculated Solution Below:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Your Predicted Page Faults:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={userFaults}
                    onChange={(e) => setUserFaults(e.target.value)}
                    placeholder="e.g. 8"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-primary)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Your Predicted Page Hits:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={userHits}
                    onChange={(e) => setUserHits(e.target.value)}
                    placeholder="e.g. 2"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-primary)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Your Predicted Hit Ratio (%):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={userHitRatio}
                    onChange={(e) => setUserHitRatio(e.target.value)}
                    placeholder="e.g. 20.0"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-primary)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Victim Sequence (Optional):
                  </label>
                  <input
                    type="text"
                    value={userVictims}
                    onChange={(e) => setUserVictims(e.target.value)}
                    placeholder="e.g. 7, 0, 1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-primary)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleVerifyPaging}
                disabled={isPagingLoading}
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: isPagingLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)',
                }}
              >
                <Bot size={18} /> {isPagingLoading ? 'Analyzing Answer...' : 'Verify Paging Answer with AI Agent'}
              </button>
            </div>
          </div>

          {/* Paging Result Card */}
          {pagingVerificationResult && (
            <div className="card" style={{ border: `1px solid ${pagingVerificationResult.correct ? '#10b981' : '#f59e0b'}` }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {pagingVerificationResult.correct ? (
                    <CheckCircle size={24} color="#10b981" />
                  ) : (
                    <AlertCircle size={24} color="#f59e0b" />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                      {pagingVerificationResult.verdictTitle}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {pagingVerificationResult.summaryMessage}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: pagingVerificationResult.correct ? '#10b981' : '#f59e0b',
                    background: pagingVerificationResult.correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${pagingVerificationResult.correct ? '#10b981' : '#f59e0b'}`,
                  }}
                >
                  {Math.round(pagingVerificationResult.scorePercentage)}%
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
                <div style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Actual Page Faults
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
                    {pagingVerificationResult.actualFaults}
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Actual Page Hits
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                    {pagingVerificationResult.actualHits}
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Actual Hit Ratio
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>
                    {pagingVerificationResult.actualHitRatio}%
                  </div>
                </div>
              </div>

              {/* Checklist */}
              {Object.keys(pagingVerificationResult.breakdown).length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Submission Verification:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(pagingVerificationResult.breakdown).map(([item, isOk]) => (
                      <div
                        key={item}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: isOk ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          border: `1px solid ${isOk ? '#10b981' : '#ef4444'}`,
                          color: isOk ? '#10b981' : '#ef4444',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isOk ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {item}: {isOk ? 'Accurate' : 'Discrepancy'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pagingVerificationResult.discrepancies.length > 0 && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                    AI Diagnostic Discrepancy Notes:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>
                    {pagingVerificationResult.discrepancies.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {pagingVerificationResult.pedagogicalTips.length > 0 && (
                <div
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                    Algorithm Principles & Learning Tips:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.82rem', color: '#c7d2fe', lineHeight: 1.5 }}>
                    {pagingVerificationResult.pedagogicalTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Virtual OS Tutor & Concept Explainer */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BookOpen size={18} color="#8b5cf6" /> Operating Systems Virtual Tutor & Concept Explainer
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
          {Object.entries(TUTOR_TOPICS).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setActiveTutorTopic(key)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: activeTutorTopic === key ? '1px solid #8b5cf6' : '1px solid var(--color-border)',
                background: activeTutorTopic === key ? 'rgba(139, 92, 246, 0.2)' : 'var(--color-bg-secondary)',
                color: activeTutorTopic === key ? '#c084fc' : 'var(--color-text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '0.7rem', opacity: 0.7, marginRight: '4px' }}>[{t.category}]</span>
              {key === 'srtfPreemption' && 'SRTF Preemption'}
              {key === 'rrQuantum' && 'Round Robin Time Quantum'}
              {key === 'belady' && "Belady's Anomaly"}
              {key === 'clock' && 'Second Chance (Clock) Logic'}
            </button>
          ))}
        </div>

        {TUTOR_TOPICS[activeTutorTopic] && (
          <div
            style={{
              background: 'var(--color-bg-secondary)',
              borderRadius: '10px',
              padding: '1.25rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              {TUTOR_TOPICS[activeTutorTopic].question}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              {TUTOR_TOPICS[activeTutorTopic].answer}
            </p>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(139, 92, 246, 0.15)',
                borderLeft: '3px solid #8b5cf6',
                color: '#d8b4fe',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {TUTOR_TOPICS[activeTutorTopic].keyRule}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
