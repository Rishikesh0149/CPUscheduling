import React from 'react';
import {
  Users,
  Code2,
  Server,
  FileCheck2,
  Cpu,
  Layers,
  BookOpen,
  CheckCircle,
  Database,
  Terminal,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Rishikesh Sah',
      role: 'Frontend Development',
      icon: <Code2 size={24} color="#6366f1" />,
      accentColor: '#6366f1',
      contributions: [
        'Designed and implemented interactive React & TypeScript user interface',
        'Built interactive Gantt chart timeline with dynamic process color-coding and cycle indicators',
        'Developed multi-algorithm comparison visualizer with Recharts bar graphs',
        'Created responsive layout with custom design system and stateful toast notifications',
        'Implemented client-side process validation and ready queue lifecycle management',
      ],
    },
    {
      name: 'Pappu Kumar',
      role: 'Backend Development',
      icon: <Server size={24} color="#10b981" />,
      accentColor: '#10b981',
      contributions: [
        'Architected Spring Boot 3 REST API for process lifecycle and scheduling simulation',
        'Implemented core scheduling algorithms: FCFS, SJF, SRTF, Priority, and Round Robin',
        'Engineered Gantt chart time-slicing logic and CPU idle cycle detection',
        'Calculated scheduling performance metrics: Waiting Time, Turnaround Time, and Response Time',
        'Configured H2 in-memory persistence and Spring Web validation filters',
      ],
    },
    {
      name: 'Shresth Pathak',
      role: 'Integration, Testing, and Documentation',
      icon: <FileCheck2 size={24} color="#f59e0b" />,
      accentColor: '#f59e0b',
      contributions: [
        'Authored JUnit 5 and Mockito test suites covering all 5 scheduling algorithms',
        'Verified edge cases including simultaneous arrivals, zero burst times, and preemptive preemption triggers',
        'Integrated frontend Axios API layer with backend REST endpoints and CORS configurations',
        'Structured project documentation, API contracts, and user demonstration guide',
        'Ensured full parity with the original Java Swing application reference architecture',
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="card" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Cpu size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f1f5f9' }}>
              OS Process Management & Memory Paging Simulator
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                College Operating Systems Course Project
              </span>
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                }}
              >
                Fall Semester 2026-27
              </span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginTop: '10px' }}>
          This application modernizes the traditional Java Swing CPU scheduling simulator into a full-stack,
          real-time web application. It models process state lifecycles and executes both preemptive and
          non-preemptive CPU scheduling algorithms, virtual memory paging algorithms (FIFO, OPT, LRU, Second Chance / Clock, LFU),
          and includes an intelligent AI Answer Verification Agent.
        </p>
      </div>

      {/* Faculty Mentor Section */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          padding: '1.5rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              flexShrink: 0,
            }}
          >
            <BookOpen size={28} color="#fff" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#6366f1',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Project Mentor
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Academic Course Guide • Fall Semester 2026-27
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
              Vivekananda GN
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginTop: '4px' }}>
              Faculty Mentor, Department of Computer Science & Engineering. Provided curriculum direction,
              architectural review, and pedagogical oversight for OS scheduling algorithms, memory management simulation, and AI verification validation.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <Users size={20} color="var(--color-accent)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>
            Project Team Members & Contributions
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${member.accentColor}20`,
                      border: `1px solid ${member.accentColor}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {member.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>{member.name}</h4>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: member.accentColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    Key Responsibilities & Deliverables:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {member.contributions.map((c, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          fontSize: '0.82rem',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.45,
                        }}
                      >
                        <CheckCircle size={14} color={member.accentColor} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Architecture & Stack */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Frontend Architecture */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Code2 size={18} /> Frontend Technology Stack
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>Framework & Language</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>React 19 + TypeScript</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>Build Tool</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Vite 8</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>Data Visualization</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Recharts + SVG Timeline</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>Styling & Theme</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Custom Dark Navy CSS System</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>HTTP Client</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Axios + Interceptors</span>
            </div>
          </div>
        </div>

        {/* Backend Architecture */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Server size={18} /> Backend Technology Stack
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>Runtime & SDK</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Java 21 / 24 SE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>Core Framework</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Spring Boot 3 (Spring Web)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>Validation</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Jakarta Bean Validation API</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>Testing Framework</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>JUnit 5 + Mockito</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>Build Tool</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Apache Maven 3.9</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theoretical Formulas Reference */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BookOpen size={18} /> OS CPU Scheduling Formulas & Definitions
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
            <h4 style={{ color: 'var(--color-accent)', fontSize: '0.9rem', marginBottom: '4px' }}>Turnaround Time (TAT)</h4>
            <code style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>TAT = Completion Time - Arrival Time</code>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
              The total elapsed time interval from process submission to its complete termination.
            </p>
          </div>

          <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
            <h4 style={{ color: 'var(--color-emerald)', fontSize: '0.9rem', marginBottom: '4px' }}>Waiting Time (WT)</h4>
            <code style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>WT = Turnaround Time - Burst Time</code>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
              The total amount of time a process spends waiting in the ready queue before completion.
            </p>
          </div>

          <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
            <h4 style={{ color: 'var(--color-amber)', fontSize: '0.9rem', marginBottom: '4px' }}>Response Time (RT)</h4>
            <code style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>RT = First Execution Time - Arrival Time</code>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
              The time elapsed from submission until the CPU produces its very first response to the job.
            </p>
          </div>

          <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
            <h4 style={{ color: '#818cf8', fontSize: '0.9rem', marginBottom: '4px' }}>Page Hit Ratio & Fault Ratio</h4>
            <code style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>Hit Ratio = (Hits / References) × 100%</code>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
              Fault Ratio = 100% - Hit Ratio. Evaluates paging memory cache effectiveness.
            </p>
          </div>

          <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
            <h4 style={{ color: '#f43f5e', fontSize: '0.9rem', marginBottom: '4px' }}>Belady's Anomaly</h4>
            <code style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>Faults(N + 1 frames) &gt; Faults(N frames)</code>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
              Occurs in non-stack algorithms (e.g. FIFO) where increasing physical frame capacity paradoxically increases page faults.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

