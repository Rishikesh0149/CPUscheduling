import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
} from 'lucide-react';
import { Process, CreateProcessRequest } from '../types';
import { processService } from '../services/schedulingService';

interface ProcessManagementPageProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ProcessManagementPage: React.FC<ProcessManagementPageProps> = ({ onNotify }) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [pid, setPid] = useState('');
  const [arrivalTime, setArrivalTime] = useState(0);
  const [burstTime, setBurstTime] = useState(5);
  const [priority, setPriority] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProcesses = async () => {
    try {
      setLoading(true);
      const data = await processService.getAll();
      setProcesses(data);
      // Auto-suggest next PID
      if (!pid || pid.startsWith('P')) {
        const nextNum = data.length + 1;
        setPid(`P${nextNum}`);
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to fetch processes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const handleAddProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pid.trim()) {
      onNotify('Process ID cannot be empty', 'error');
      return;
    }
    if (arrivalTime < 0) {
      onNotify('Arrival Time must be greater than or equal to 0', 'error');
      return;
    }
    if (burstTime <= 0) {
      onNotify('Burst Time must be greater than 0', 'error');
      return;
    }
    if (priority <= 0) {
      onNotify('Priority must be at least 1', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const req: CreateProcessRequest = {
        pid: pid.trim().toUpperCase(),
        arrivalTime: Number(arrivalTime),
        burstTime: Number(burstTime),
        priority: Number(priority),
      };
      await processService.create(req);
      onNotify(`Process ${req.pid} created successfully!`, 'success');
      // Reset form
      const nextNum = processes.length + 2;
      setPid(`P${nextNum}`);
      setBurstTime(5);
      fetchProcesses();
    } catch (err: any) {
      onNotify(err.message || 'Failed to create process', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToReady = async (processPid: string) => {
    try {
      await processService.moveToReady(processPid);
      onNotify(`Process ${processPid} moved to Ready Queue`, 'success');
      fetchProcesses();
    } catch (err: any) {
      onNotify(err.message || 'Failed to move to ready', 'error');
    }
  };

  const handleMoveAllToReady = async () => {
    const newProcesses = processes.filter((p) => p.state === 'NEW');
    if (newProcesses.length === 0) {
      onNotify('No NEW processes to transition', 'info');
      return;
    }
    try {
      for (const p of newProcesses) {
        await processService.moveToReady(p.pid);
      }
      onNotify(`Moved ${newProcesses.length} process(es) to Ready Queue`, 'success');
      fetchProcesses();
    } catch (err: any) {
      onNotify(err.message || 'Failed to move some processes', 'error');
    }
  };

  const handleDelete = async (processPid: string) => {
    try {
      await processService.delete(processPid);
      onNotify(`Process ${processPid} removed`, 'info');
      fetchProcesses();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete process', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all processes?')) return;
    try {
      await processService.deleteAll();
      onNotify('All processes cleared', 'info');
      setPid('P1');
      fetchProcesses();
    } catch (err: any) {
      onNotify(err.message || 'Failed to clear processes', 'error');
    }
  };

  const handleLoadSamples = async () => {
    const samples = [
      { pid: 'P1', arrivalTime: 0, burstTime: 4, priority: 2 },
      { pid: 'P2', arrivalTime: 1, burstTime: 3, priority: 1 },
      { pid: 'P3', arrivalTime: 2, burstTime: 1, priority: 4 },
      { pid: 'P4', arrivalTime: 3, burstTime: 5, priority: 3 },
      { pid: 'P5', arrivalTime: 4, burstTime: 2, priority: 2 },
    ];
    try {
      await processService.deleteAll();
      for (const s of samples) {
        await processService.create(s);
      }
      onNotify('Standard textbook processes (P1-P5) populated!', 'success');
      fetchProcesses();
    } catch (err: any) {
      onNotify(err.message || 'Failed to populate samples', 'error');
    }
  };

  const readyProcesses = processes.filter((p) => p.state === 'READY');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner & Batch Control Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>
              Process Control & Lifecycle Management
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Add individual processes or populate standard benchmark scenarios. Move processes into the Ready Queue for simulation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleLoadSamples}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
              }}
            >
              <Sparkles size={15} /> Load Benchmark Set
            </button>

            <button
              onClick={handleMoveAllToReady}
              disabled={processes.filter((p) => p.state === 'NEW').length === 0}
              style={{
                background: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                opacity: processes.filter((p) => p.state === 'NEW').length === 0 ? 0.5 : 1,
              }}
            >
              <CheckCircle size={15} /> Move All NEW to Ready
            </button>

            {processes.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                }}
              >
                <Trash2 size={15} /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Process Creation Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Plus size={18} /> Add New Process
            </div>
          </div>

          <form onSubmit={handleAddProcess} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Process ID (PID)
              </label>
              <input
                type="text"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                placeholder="e.g. P1"
                required
                style={{
                  width: '100%',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#f1f5f9',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Arrival Time (AT)
              </label>
              <input
                type="number"
                min="0"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(Math.max(0, parseInt(e.target.value) || 0))}
                required
                style={{
                  width: '100%',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#f1f5f9',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Time unit at which process arrives in system (≥ 0)
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                CPU Burst Time (BT)
              </label>
              <input
                type="number"
                min="1"
                value={burstTime}
                onChange={(e) => setBurstTime(Math.max(1, parseInt(e.target.value) || 1))}
                required
                style={{
                  width: '100%',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#f1f5f9',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                CPU execution cycles required (&gt; 0)
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Priority Level
              </label>
              <input
                type="number"
                min="1"
                value={priority}
                onChange={(e) => setPriority(Math.max(1, parseInt(e.target.value) || 1))}
                required
                style={{
                  width: '100%',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#f1f5f9',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Lower integer indicates higher priority (1 is highest)
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Plus size={16} /> Add Process to Pool
            </button>
          </form>
        </div>

        {/* Process Pool & Ready Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Visual Ready Queue */}
          <div className="card" style={{ background: 'rgba(26, 29, 46, 0.6)' }}>
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
              <div className="card-title" style={{ fontSize: '0.9rem' }}>
                <Clock size={16} color="var(--color-emerald)" /> Ready Queue Visualizer ({readyProcesses.length})
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                FIFO dispatch order
              </span>
            </div>

            {readyProcesses.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                Ready queue is currently empty. Transition processes from NEW to READY below.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                {readyProcesses.map((p, idx) => (
                  <div
                    key={p.pid}
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      minWidth: '90px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>#{idx + 1}</span>
                    <strong style={{ fontSize: '1rem', color: '#10b981' }}>{p.pid}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      BT: {p.burstTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Processes Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Layers size={18} /> Configured Processes ({processes.length})
              </div>
            </div>

            {processes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                <p>No processes currently registered.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                  Use the form on the left or click "Load Benchmark Set" above to start.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '10px 14px' }}>PID</th>
                      <th style={{ padding: '10px 14px' }}>Arrival Time</th>
                      <th style={{ padding: '10px 14px' }}>Burst Time</th>
                      <th style={{ padding: '10px 14px' }}>Priority</th>
                      <th style={{ padding: '10px 14px' }}>State</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((p) => (
                      <tr
                        key={p.pid}
                        style={{
                          borderBottom: '1px solid rgba(45, 53, 84, 0.5)',
                          transition: 'background 0.2s',
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-accent)' }}>
                          {p.pid}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                          {p.arrivalTime}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                          {p.burstTime}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)' }}>
                          {p.priority}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
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
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {p.state === 'NEW' && (
                              <button
                                onClick={() => handleMoveToReady(p.pid)}
                                title="Move to Ready Queue"
                                style={{
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  color: '#10b981',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Play size={12} /> Ready
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(p.pid)}
                              title="Delete Process"
                              style={{
                                background: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#f87171',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
