import React, { useState } from 'react';
import {
  Play,
  Clock,
  Cpu,
  BarChart2,
  Zap,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Algorithm, SchedulingRequest, SchedulingResponse } from '../types';
import { schedulingService, processService } from '../services/schedulingService';

interface SimulationPageProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Stable color map for processes
const PROCESS_COLORS: Record<string, string> = {
  P1: '#6366f1', // Indigo
  P2: '#10b981', // Emerald
  P3: '#f59e0b', // Amber
  P4: '#0ea5e9', // Sky
  P5: '#8b5cf6', // Violet
  P6: '#ec4899', // Pink
  P7: '#14b8a6', // Teal
  P8: '#f97316', // Orange
  IDLE: '#475569', // Slate
};

const getProcessColor = (pid: string, isIdle: boolean): string => {
  if (isIdle) return '#334155';
  if (PROCESS_COLORS[pid]) return PROCESS_COLORS[pid];
  // Deterministic fallback color
  let hash = 0;
  for (let i = 0; i < pid.length; i++) hash = pid.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
};

export const SimulationPage: React.FC<SimulationPageProps> = ({ onNotify }) => {
  const [algorithm, setAlgorithm] = useState<Algorithm>('FCFS');
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SchedulingResponse | null>(null);

  const handleRunSimulation = async () => {
    try {
      setIsLoading(true);
      const req: SchedulingRequest = {
        algorithm,
        timeQuantum: algorithm === 'Round Robin' ? Number(timeQuantum) : 2,
      };
      const res = await schedulingService.run(req);
      setResult(res);
      onNotify(`${algorithm} simulation completed successfully!`, 'success');
    } catch (err: any) {
      onNotify(err.message || 'Simulation execution failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSamples = async () => {
    const samples = [
      { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 2 },
      { pid: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
      { pid: 'P3', arrivalTime: 2, burstTime: 8, priority: 4 },
      { pid: 'P4', arrivalTime: 3, burstTime: 6, priority: 3 },
    ];
    try {
      await processService.deleteAll();
      for (const s of samples) {
        await processService.create(s);
      }
      onNotify('Sample processes loaded (P1-P4)! Now click "Run Simulation".', 'success');
    } catch (err: any) {
      onNotify(err.message || 'Failed to populate samples', 'error');
    }
  };

  const cpuUtilization =
    result && result.finalClock > 0
      ? ((result.totalCpuTime / result.finalClock) * 100).toFixed(1)
      : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Control Panel Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Cpu size={20} /> Configure & Execute CPU Scheduler
          </div>
          <button
            onClick={handleLoadSamples}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={14} color="var(--color-amber)" /> Reset to Sample Processes
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            alignItems: 'end',
          }}
        >
          {/* Algorithm Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Scheduling Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
              style={{
                width: '100%',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f1f5f9',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <option value="FCFS">FCFS — First-Come First-Served (Non-preemptive)</option>
              <option value="SJF">SJF — Shortest Job First (Non-preemptive)</option>
              <option value="SRTF">SRTF — Shortest Remaining Time First (Preemptive)</option>
              <option value="Priority">Priority Scheduling (Non-preemptive, lower = higher)</option>
              <option value="Round Robin">Round Robin — Fixed Time Quantum (Preemptive)</option>
            </select>
          </div>

          {/* Time Quantum (Round Robin only) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: algorithm === 'Round Robin' ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                marginBottom: '8px',
              }}
            >
              Time Quantum (Cycles) {algorithm !== 'Round Robin' && '(Only for Round Robin)'}
            </label>
            <input
              type="number"
              min="1"
              value={timeQuantum}
              disabled={algorithm !== 'Round Robin'}
              onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                background: algorithm === 'Round Robin' ? 'var(--color-bg-secondary)' : 'rgba(26, 29, 46, 0.4)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: algorithm === 'Round Robin' ? '#f1f5f9' : 'var(--color-text-muted)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                opacity: algorithm === 'Round Robin' ? 1 : 0.6,
              }}
            />
          </div>

          {/* Run Button */}
          <div>
            <button
              onClick={handleRunSimulation}
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                padding: '11px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Play size={18} /> {isLoading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <>
          {/* KPI Summary Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div className="stat-card" style={{ '--stat-color': '#10b981' } as React.CSSProperties}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Avg Waiting Time
              </div>
              <div className="stat-value" style={{ color: '#10b981', fontSize: '2.1rem', fontWeight: 700, margin: '8px 0 4px' }}>
                {result.avgWaitingTime.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>cycles per process</div>
            </div>

            <div className="stat-card" style={{ '--stat-color': '#6366f1' } as React.CSSProperties}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Avg Turnaround Time
              </div>
              <div className="stat-value" style={{ color: '#6366f1', fontSize: '2.1rem', fontWeight: 700, margin: '8px 0 4px' }}>
                {result.avgTurnaroundTime.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>cycles per process</div>
            </div>

            <div className="stat-card" style={{ '--stat-color': '#f59e0b' } as React.CSSProperties}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Avg Response Time
              </div>
              <div className="stat-value" style={{ color: '#f59e0b', fontSize: '2.1rem', fontWeight: 700, margin: '8px 0 4px' }}>
                {result.avgResponseTime.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>cycles to first execution</div>
            </div>

            <div className="stat-card" style={{ '--stat-color': '#0ea5e9' } as React.CSSProperties}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                CPU Utilization
              </div>
              <div className="stat-value" style={{ color: '#0ea5e9', fontSize: '2.1rem', fontWeight: 700, margin: '8px 0 4px' }}>
                {cpuUtilization}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {result.totalCpuTime} / {result.finalClock} cycles active
              </div>
            </div>

            <div className="stat-card" style={{ '--stat-color': '#8b5cf6' } as React.CSSProperties}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Clock
              </div>
              <div className="stat-value" style={{ color: '#8b5cf6', fontSize: '2.1rem', fontWeight: 700, margin: '8px 0 4px' }}>
                {result.finalClock}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Idle: {result.totalIdleTime} cycles
              </div>
            </div>
          </div>

          {/* Interactive Gantt Chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BarChart2 size={18} /> Interactive Gantt Chart Timeline
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Algorithm: <strong style={{ color: '#f1f5f9' }}>{result.algorithm}</strong>
                {result.algorithm === 'Round Robin' && ` (Quantum = ${result.timeQuantum})`}
              </div>
            </div>

            {/* Gantt Bar */}
            <div style={{ overflowX: 'auto', padding: '1rem 0' }}>
              <div
                style={{
                  display: 'flex',
                  minWidth: `${Math.max(600, result.finalClock * 32)}px`,
                  background: 'var(--color-bg-secondary)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                }}
              >
                {result.ganttChart.map((seg, idx) => {
                  const segWidthPercent = (seg.duration / result.finalClock) * 100;
                  const color = getProcessColor(seg.pid, seg.idle);

                  return (
                    <div
                      key={idx}
                      title={`${seg.idle ? 'CPU IDLE' : seg.pid}: ${seg.start} → ${seg.end} (${seg.duration} cycles)`}
                      style={{
                        width: `${segWidthPercent}%`,
                        minWidth: `${seg.duration * 30}px`,
                        background: color,
                        padding: '16px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid rgba(15, 17, 23, 0.6)',
                        position: 'relative',
                        transition: 'opacity 0.2s',
                        cursor: 'default',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#fff',
                          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                        }}
                      >
                        {seg.idle ? 'IDLE' : seg.pid}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'rgba(255, 255, 255, 0.85)',
                          marginTop: '2px',
                        }}
                      >
                        {seg.duration}c
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Gantt Timeline Ticks */}
              <div
                style={{
                  display: 'flex',
                  minWidth: `${Math.max(600, result.finalClock * 32)}px`,
                  position: 'relative',
                  marginTop: '6px',
                }}
              >
                {result.ganttChart.map((seg, idx) => {
                  const segWidthPercent = (seg.duration / result.finalClock) * 100;

                  return (
                    <div
                      key={idx}
                      style={{
                        width: `${segWidthPercent}%`,
                        minWidth: `${seg.duration * 30}px`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                        padding: '0 2px',
                      }}
                    >
                      <span>{seg.start}</span>
                      {idx === result.ganttChart.length - 1 && <span>{seg.end}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gantt Legend */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              {Array.from(new Set(result.ganttChart.map((s) => s.pid))).map((pid) => {
                const isIdle = pid === 'IDLE';
                const color = getProcessColor(pid, isIdle);
                return (
                  <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }} />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{pid}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Process Execution Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Layers size={18} /> Process Schedule Metrics Breakdown
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                TAT = CT - AT | WT = TAT - BT | RT = Start - AT
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '10px 14px' }}>PID</th>
                    <th style={{ padding: '10px 14px' }}>Arrival Time</th>
                    <th style={{ padding: '10px 14px' }}>Burst Time</th>
                    <th style={{ padding: '10px 14px' }}>Start Time</th>
                    <th style={{ padding: '10px 14px' }}>Completion Time (CT)</th>
                    <th style={{ padding: '10px 14px' }}>Turnaround Time (TAT)</th>
                    <th style={{ padding: '10px 14px' }}>Waiting Time (WT)</th>
                    <th style={{ padding: '10px 14px' }}>Response Time (RT)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.processResults.map((pr) => (
                    <tr
                      key={pr.pid}
                      style={{
                        borderBottom: '1px solid rgba(45, 53, 84, 0.5)',
                        transition: 'background 0.2s',
                      }}
                    >
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: getProcessColor(pr.pid, false) }}>
                        {pr.pid}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>{pr.arrivalTime}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>{pr.burstTime}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>{pr.startTime}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>{pr.completionTime}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f1f5f9' }}>
                        {pr.turnaroundTime}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#10b981' }}>
                        {pr.waitingTime}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f59e0b' }}>
                        {pr.responseTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
