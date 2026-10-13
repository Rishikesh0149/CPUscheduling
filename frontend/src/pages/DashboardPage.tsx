import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  BarChart3,
  PlusCircle,
  RotateCcw,
  Cpu,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Process, SchedulingHistory } from '../types';
import { processService, schedulingService } from '../services/schedulingService';

interface DashboardPageProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNotify }) => {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [history, setHistory] = useState<SchedulingHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [procData, histData] = await Promise.all([
        processService.getAll().catch(() => []),
        schedulingService.getHistory().catch(() => []),
      ]);
      setProcesses(procData);
      setHistory(histData);
    } catch {
      // Handled silently or empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCount = processes.length;
  const newCount = processes.filter((p) => p.state === 'NEW').length;
  const readyCount = processes.filter((p) => p.state === 'READY').length;
  const terminatedCount = processes.filter((p) => p.state === 'TERMINATED').length;

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all processes?')) return;
    try {
      await processService.deleteAll();
      onNotify('All processes cleared successfully', 'success');
      loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to clear processes', 'error');
    }
  };

  const handleLoadSampleData = async () => {
    const samples = [
      { pid: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
      { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
      { pid: 'P3', arrivalTime: 2, burstTime: 8, priority: 3 },
      { pid: 'P4', arrivalTime: 3, burstTime: 3, priority: 4 },
      { pid: 'P5', arrivalTime: 4, burstTime: 5, priority: 2 },
    ];

    try {
      for (const s of samples) {
        await processService.create(s);
      }
      onNotify('Sample processes (P1 to P5) added!', 'success');
      loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to load samples', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>
            Operating Systems Process & CPU Scheduling Simulator
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', maxWidth: '680px' }}>
            Simulate and benchmark classic CPU scheduling algorithms including First-Come First-Served,
            Shortest Job First, SRTF (Preemptive), Priority Scheduling, and Round Robin with interactive Gantt charts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {totalCount === 0 && (
            <button
              onClick={handleLoadSampleData}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Zap size={16} /> Load Preset Samples
            </button>
          )}
          <button
            onClick={() => navigate('/simulation')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PlayCircle size={16} /> Launch Simulation
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="stat-card" style={{ '--stat-color': 'var(--color-accent)' } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Processes
            </span>
            <Layers size={18} color="var(--color-accent)" />
          </div>
          <div className="stat-value" style={{ color: '#f1f5f9', fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Configured in system
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--color-sky)' } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              New Processes
            </span>
            <Clock size={18} color="var(--color-sky)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-sky)', fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px' }}>
            {newCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Awaiting transition to Ready
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--color-emerald)' } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Ready Queue
            </span>
            <Cpu size={18} color="var(--color-emerald)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-emerald)', fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px' }}>
            {readyCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Ready for CPU dispatch
          </div>
        </div>

        <div className="stat-card" style={{ '--stat-color': 'var(--color-teal)' } as React.CSSProperties}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Terminated
            </span>
            <CheckCircle2 size={18} color="var(--color-teal)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-teal)', fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px' }}>
            {terminatedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Completed simulations
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--color-amber)" />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Quick Actions</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/processes')}
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
              }}
            >
              <PlusCircle size={15} color="var(--color-accent)" /> Manage / Add Processes
            </button>

            <button
              onClick={() => navigate('/compare')}
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
              }}
            >
              <BarChart3 size={15} color="var(--color-teal)" /> Compare 5 Algorithms
            </button>

            {totalCount > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                }}
              >
                <RotateCcw size={15} /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Processes Table Preview & Algorithms Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Process Pool Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} /> Active Process Pool
            </div>
            <button
              onClick={() => navigate('/processes')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {processes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
              <p style={{ marginBottom: '1rem' }}>No processes in system pool yet.</p>
              <button
                onClick={handleLoadSampleData}
                style={{
                  background: 'var(--color-accent)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Insert Sample Textbook Processes
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '8px 12px' }}>PID</th>
                    <th style={{ padding: '8px 12px' }}>Arrival</th>
                    <th style={{ padding: '8px 12px' }}>Burst</th>
                    <th style={{ padding: '8px 12px' }}>Priority</th>
                    <th style={{ padding: '8px 12px' }}>State</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.slice(0, 6).map((p) => (
                    <tr key={p.pid} style={{ borderBottom: '1px solid rgba(45, 53, 84, 0.4)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--color-accent)' }}>
                        {p.pid}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{p.arrivalTime}</td>
                      <td style={{ padding: '10px 12px' }}>{p.burstTime}</td>
                      <td style={{ padding: '10px 12px' }}>{p.priority}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background:
                              p.state === 'READY'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : p.state === 'NEW'
                                ? 'rgba(14, 165, 233, 0.15)'
                                : 'rgba(20, 184, 166, 0.15)',
                            color:
                              p.state === 'READY'
                                ? '#10b981'
                                : p.state === 'NEW'
                                ? '#38bdf8'
                                : '#14b8a6',
                          }}
                        >
                          {p.state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {processes.length > 6 && (
                <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  + {processes.length - 6} more processes
                </div>
              )}
            </div>
          )}
        </div>

        {/* Algorithm Reference Cards */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Cpu size={18} /> Supported CPU Schedulers
            </div>
            <button
              onClick={() => navigate('/compare')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              Benchmark <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                name: 'FCFS (First-Come First-Served)',
                type: 'Non-Preemptive',
                desc: 'Executes processes in order of arrival time. Simplest scheduling algorithm.',
                badgeColor: '#6366f1',
              },
              {
                name: 'SJF (Shortest Job First)',
                type: 'Non-Preemptive',
                desc: 'Selects the ready process with the smallest CPU burst time next.',
                badgeColor: '#10b981',
              },
              {
                name: 'SRTF (Shortest Remaining Time First)',
                type: 'Preemptive',
                desc: 'Preempts running job if newly arrived process has shorter burst remaining.',
                badgeColor: '#f59e0b',
              },
              {
                name: 'Priority Scheduling',
                type: 'Non-Preemptive',
                desc: 'Allocates CPU to process with highest priority (lower numerical value = higher priority).',
                badgeColor: '#8b5cf6',
              },
              {
                name: 'Round Robin (RR)',
                type: 'Preemptive',
                desc: 'Dispatches processes in cyclic queue with fixed time quantum slice.',
                badgeColor: '#0ea5e9',
              },
            ].map((algo) => (
              <div
                key={algo.name}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f1f5f9' }}>{algo.name}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: `${algo.badgeColor}22`,
                      color: algo.badgeColor,
                      fontWeight: 600,
                    }}
                  >
                    {algo.type}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{algo.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
