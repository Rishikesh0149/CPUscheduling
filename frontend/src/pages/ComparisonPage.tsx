import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  Trophy,
  Award,
  Zap,
  TrendingDown,
  Info,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { CompareRequest, CompareResponse, AlgorithmComparison } from '../types';
import { schedulingService, processService } from '../services/schedulingService';

interface ComparisonPageProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ onNotify }) => {
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comparison, setComparison] = useState<CompareResponse | null>(null);

  const handleRunComparison = async () => {
    try {
      setIsLoading(true);
      const req: CompareRequest = {
        timeQuantum: Number(timeQuantum) || 2,
      };
      const res = await schedulingService.compare(req);
      setComparison(res);
      onNotify('All 5 scheduling algorithms compared successfully!', 'success');
    } catch (err: any) {
      onNotify(err.message || 'Comparison failed', 'error');
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
      onNotify('Sample processes populated! Now click "Run Benchmark Comparison".', 'success');
    } catch (err: any) {
      onNotify(err.message || 'Failed to populate samples', 'error');
    }
  };

  // Prepare chart data format
  const chartData = comparison
    ? comparison.results.map((r) => ({
        algorithm: r.algorithm,
        'Avg Waiting Time': Number(r.avgWaitingTime.toFixed(2)),
        'Avg Turnaround Time': Number(r.avgTurnaroundTime.toFixed(2)),
        'Avg Response Time': Number(r.avgResponseTime.toFixed(2)),
      }))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Control Banner Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={20} /> Multi-Algorithm Benchmarking Engine
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

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '220px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Round Robin Time Quantum
            </label>
            <input
              type="number"
              min="1"
              value={timeQuantum}
              onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f1f5f9',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          <button
            onClick={handleRunComparison}
            disabled={isLoading}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              padding: '11px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Zap size={18} /> {isLoading ? 'Benchmarking All 5...' : 'Run Benchmark Comparison'}
          </button>
        </div>
      </div>

      {comparison && (
        <>
          {/* Best Performers Trophies */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="stat-card" style={{ '--stat-color': '#10b981' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Lowest Waiting Time
                </span>
                <Trophy size={18} color="#10b981" />
              </div>
              <div className="stat-value" style={{ color: '#10b981', fontSize: '1.6rem', fontWeight: 700, margin: '8px 0 4px' }}>
                {comparison.bestWaitingTime}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Optimal overall wait minimization
              </div>
            </div>

            <div className="stat-card" style={{ '--stat-color': '#6366f1' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Lowest Turnaround Time
                </span>
                <Award size={18} color="#6366f1" />
              </div>
              <div className="stat-value" style={{ color: '#6366f1', fontSize: '1.6rem', fontWeight: 700, margin: '8px 0 4px' }}>
                {comparison.bestTurnaroundTime}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Fastest average job completion
              </div>
            </div>

            <div className="stat-card" style={{ '--stat-color': '#f59e0b' } as React.CSSProperties}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Fastest Response Time
                </span>
                <Zap size={18} color="#f59e0b" />
              </div>
              <div className="stat-value" style={{ color: '#f59e0b', fontSize: '1.6rem', fontWeight: 700, margin: '8px 0 4px' }}>
                {comparison.bestResponseTime}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Quickest initial CPU response
              </div>
            </div>
          </div>

          {/* Graphical Comparison Bar Chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BarChart3 size={18} /> Performance Metrics Comparison (Cycles)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Lower values indicate superior CPU scheduling efficiency
              </div>
            </div>

            <div style={{ width: '100%', height: 380, marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3554" />
                  <XAxis dataKey="algorithm" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e2235',
                      borderColor: '#2d3554',
                      color: '#f1f5f9',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="Avg Waiting Time" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Avg Turnaround Time" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Avg Response Time" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} /> Tabular Benchmark Results
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                    <th style={{ padding: '12px 16px' }}>Algorithm</th>
                    <th style={{ padding: '12px 16px' }}>Type</th>
                    <th style={{ padding: '12px 16px' }}>Avg Waiting Time (WT)</th>
                    <th style={{ padding: '12px 16px' }}>Avg Turnaround Time (TAT)</th>
                    <th style={{ padding: '12px 16px' }}>Avg Response Time (RT)</th>
                    <th style={{ padding: '12px 16px' }}>Benchmark Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.results.map((res: AlgorithmComparison) => {
                    const isBestWT = res.algorithm === comparison.bestWaitingTime;
                    const isBestTAT = res.algorithm === comparison.bestTurnaroundTime;
                    const isBestRT = res.algorithm === comparison.bestResponseTime;

                    const isAnyBest = isBestWT || isBestTAT || isBestRT;

                    return (
                      <tr
                        key={res.algorithm}
                        style={{
                          borderBottom: '1px solid rgba(45, 53, 84, 0.5)',
                          background: isAnyBest ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f1f5f9' }}>
                          {res.algorithm}
                          {res.algorithm === 'Round Robin' && ` (q=${comparison.timeQuantum})`}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {res.algorithm.includes('SRTF') || res.algorithm.includes('Round Robin')
                            ? 'Preemptive'
                            : 'Non-Preemptive'}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: isBestWT ? '#10b981' : '#f1f5f9', fontWeight: isBestWT ? 700 : 400 }}>
                            {res.avgWaitingTime.toFixed(2)} cycles
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: isBestTAT ? '#6366f1' : '#f1f5f9', fontWeight: isBestTAT ? 700 : 400 }}>
                            {res.avgTurnaroundTime.toFixed(2)} cycles
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: isBestRT ? '#f59e0b' : '#f1f5f9', fontWeight: isBestRT ? 700 : 400 }}>
                            {res.avgResponseTime.toFixed(2)} cycles
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {isBestWT && (
                              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 600 }}>
                                Best WT
                              </span>
                            )}
                            {isBestTAT && (
                              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', fontWeight: 600 }}>
                                Best TAT
                              </span>
                            )}
                            {isBestRT && (
                              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 600 }}>
                                Best RT
                              </span>
                            )}
                            {!isAnyBest && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                Baseline
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
