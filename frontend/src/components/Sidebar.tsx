import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  PlayCircle,
  BarChart3,
  Info,
  Cpu,
  Activity,
  Bot,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Cpu size={20} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-title">OS SCHEDULER</div>
            <div className="sidebar-logo-subtitle">Process Simulator v1.0</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>

        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/processes"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>Process Management</span>
        </NavLink>

        <NavLink
          to="/simulation"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <PlayCircle size={18} />
          <span>CPU Simulator</span>
        </NavLink>

        <NavLink
          to="/compare"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>Algorithm Compare</span>
        </NavLink>

        <div className="sidebar-section-title" style={{ marginTop: '1rem' }}>
          Memory & AI
        </div>

        <NavLink
          to="/paging"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>Paging Simulator</span>
        </NavLink>

        <NavLink
          to="/ai-agent"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Bot size={18} />
          <span>AI Verification Agent</span>
        </NavLink>

        <div className="sidebar-section-title" style={{ marginTop: '1rem' }}>
          Information
        </div>

        <NavLink
          to="/about"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Info size={18} />
          <span>About & Team</span>
        </NavLink>
      </nav>

      {/* System Status in Sidebar Footer */}
      <div
        style={{
          padding: '1.25rem',
          borderTop: '1px solid var(--color-sidebar-border)',
          background: 'rgba(15, 17, 23, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={14} color="#10b981" />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            System Engine
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Preemptive & Non-Preemptive
        </div>
      </div>
    </aside>
  );
};
