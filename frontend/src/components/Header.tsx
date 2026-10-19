import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Dashboard Overview',
    subtitle: 'System state, process counts, and simulation statistics',
  },
  '/processes': {
    title: 'Process Management',
    subtitle: 'Create, monitor, state transition, and inspect processes',
  },
  '/simulation': {
    title: 'CPU Scheduling Simulator',
    subtitle: 'Simulate FCFS, SJF, SRTF, Priority, and Round Robin with Gantt charts',
  },
  '/compare': {
    title: 'Algorithm Performance Comparison',
    subtitle: 'Benchmark and compare all 5 scheduling algorithms side-by-side',
  },
  '/paging': {
    title: 'Virtual Memory Paging Simulator',
    subtitle: 'Simulate FIFO, Optimal, LRU, Second Chance (Clock), and LFU with memory frame inspection',
  },
  '/ai-agent': {
    title: 'AI OS Answer Verification Agent',
    subtitle: 'Verify student calculation accuracy, diagnose logic errors, and learn OS principles',
  },
  '/about': {
    title: 'About OS Scheduling Project',
    subtitle: 'Project overview, architecture, mentor Vivekananda GN, and team details',
  },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const info = routeTitles[location.pathname] || {
    title: 'OS Scheduling Simulator',
    subtitle: 'Process Management & CPU Scheduling System',
  };

  useEffect(() => {
    const checkBackend = () => {
      api.get('/processes')
        .then(() => setBackendStatus('online'))
        .catch(() => setBackendStatus('offline'));
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div>
        <h1 className="header-title">{info.title}</h1>
        <p className="header-subtitle">{info.subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background:
              backendStatus === 'online'
                ? 'rgba(16, 185, 129, 0.12)'
                : backendStatus === 'offline'
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(99, 102, 241, 0.12)',
            border: `1px solid ${
              backendStatus === 'online'
                ? 'rgba(16, 185, 129, 0.3)'
                : backendStatus === 'offline'
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(99, 102, 241, 0.3)'
            }`,
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          {backendStatus === 'online' && (
            <>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span style={{ color: '#10b981' }}>Backend Online (Port 8080)</span>
            </>
          )}
          {backendStatus === 'offline' && (
            <>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                }}
              />
              <span style={{ color: '#ef4444' }}>Backend Connecting / Offline</span>
            </>
          )}
          {backendStatus === 'checking' && (
            <>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#6366f1',
                }}
              />
              <span style={{ color: '#a5b4fc' }}>Checking Connection...</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
