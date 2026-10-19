import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Clock,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  PagingAlgorithm,
  PagingResponse,
  PagingComparisonResponse,
  BeladyAnomalyResult,
  PageStep,
} from '../types';
import { pagingService } from '../services/pagingService';

interface PagingSimulationPageProps {
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

const PRESET_STRINGS: Record<string, { label: string; refs: number[]; frames: number; desc: string }> = {
  standard: {
    label: 'Textbook Standard',
    refs: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1],
    frames: 3,
    desc: 'Classic reference string used in Silberschatz & Galvin OS textbooks.',
  },
  belady: {
    label: "Belady's Anomaly Demo",
    refs: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
    frames: 3,
    desc: "Demonstrates Belady's anomaly in FIFO: 3 frames yield 9 faults, but 4 frames yield 10 faults!",
  },
  locality: {
    label: 'High Locality of Reference',
    refs: [2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2],
    frames: 3,
    desc: 'Exhibits strong temporal locality where LRU and Clock excel.',
  },
  lfuDemo: {
    label: 'LFU Frequency Test',
    refs: [1, 1, 1, 2, 2, 3, 4, 1, 2, 3, 5],
    frames: 3,
    desc: 'Shows how frequent historical page hits protect hot pages in LFU.',
  },
};

export const PagingSimulationPage: React.FC<PagingSimulationPageProps> = ({ onNotify }) => {
  const [algorithm, setAlgorithm] = useState<PagingAlgorithm>('FIFO');
  const [refStringInput, setRefStringInput] = useState<string>(
    '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1'
  );
  const [frameCount, setFrameCount] = useState<number>(3);
  const [result, setResult] = useState<PagingResponse | null>(null);
  const [comparison, setComparison] = useState<PagingComparisonResponse | null>(null);
  const [beladyData, setBeladyData] = useState<BeladyAnomalyResult | null>(null);
  const [activeTab, setActiveTab] = useState<'simulation' | 'comparison' | 'belady'>('simulation');

  // Animation Stepper State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000);
  const timerRef = useRef<number | null>(null);

  const parseReferenceString = (input: string): number[] => {
    return input
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !isNaN(Number(s)))
      .map(Number);
  };

  const handleRunSimulation = async () => {
    const refs = parseReferenceString(refStringInput);
    if (refs.length === 0) {
      onNotify('Please enter a valid reference string of integers', 'error');
      return;
    }
    try {
      const res = await pagingService.simulate({
        algorithm,
        referenceString: refs,
        frameCount,
      });
      setResult(res);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      onNotify(`${algorithm} simulated successfully (${res.totalFaults} faults, ${res.totalHits} hits)!`, 'success');

      // Also trigger comparison & belady in background
      pagingService.compare(refs, frameCount).then(setComparison).catch(() => {});
      pagingService.checkBelady(refs).then(setBeladyData).catch(() => {});
    } catch (err: any) {
      onNotify(err.message || 'Simulation execution failed', 'error');
    }
  };

  useEffect(() => {
    handleRunSimulation();
  }, []);

  // Animation player effect
  useEffect(() => {
    if (isPlaying && result) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= result.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, result, playbackSpeed]);

  const handleApplyPreset = (key: string) => {
    const p = PRESET_STRINGS[key];
    if (p) {
      setRefStringInput(p.refs.join(', '));
      setFrameCount(p.frames);
      onNotify(`Applied preset: ${p.label}`, 'info');
    }
  };

  const handleGenerateRandom = () => {
    const randoms = Array.from({ length: 16 }, () => Math.floor(Math.random() * 8));
    setRefStringInput(randoms.join(', '));
    onNotify('Generated 16 random page references (0-7)', 'info');
  };

  const currentStep: PageStep | null =
    result && result.steps.length > 0 ? result.steps[currentStepIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Configuration Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Layers size={20} color="var(--color-accent)" /> Configure Paging / Page Replacement Simulator
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleGenerateRandom}
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
              <Sparkles size={14} color="#f59e0b" /> Random String
            </button>
          </div>
        </div>

        {/* Algorithm Selection Pills */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            Select Page Replacement Algorithm:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            {(['FIFO', 'Optimal (OPT)', 'LRU', 'Second Chance (Clock)', 'LFU'] as PagingAlgorithm[]).map((algo) => {
              const active = algorithm === algo;
              return (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: active ? '1px solid #6366f1' : '1px solid var(--color-border)',
                    background: active ? 'rgba(99, 102, 241, 0.18)' : 'var(--color-bg-secondary)',
                    color: active ? '#818cf8' : 'var(--color-text-primary)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>{algo}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {algo === 'FIFO' && 'First-In, First-Out Queue'}
                    {algo === 'Optimal (OPT)' && 'Future-Knowledge Benchmark'}
                    {algo === 'LRU' && 'Least Recently Used'}
                    {algo === 'Second Chance (Clock)' && 'Reference Bit Circular Hand'}
                    {algo === 'LFU' && 'Frequency Counter Tracker'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preset Buttons */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
            Standard Academic Reference Scenarios:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(PRESET_STRINGS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => handleApplyPreset(key)}
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title={p.desc}
              >
                <Zap size={12} color="#10b981" /> {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reference String & Frame Count Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Reference String (comma or space separated):
            </label>
            <input
              type="text"
              value={refStringInput}
              onChange={(e) => setRefStringInput(e.target.value)}
              placeholder="e.g. 7, 0, 1, 2, 0, 3, 0, 4, 2, 3"
              style={{
                width: '100%',
                padding: '10px 14px',
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
              Page Frame Allocation: <span style={{ color: '#818cf8', fontWeight: 700 }}>{frameCount} Frames</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="1"
                max="8"
                value={frameCount}
                onChange={(e) => setFrameCount(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#6366f1' }}
              />
              <span
                style={{
                  background: 'var(--color-bg-secondary)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  minWidth: '40px',
                  textAlign: 'center',
                }}
              >
                {frameCount}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleRunSimulation}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Play size={16} /> Run {algorithm} Simulation
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('simulation')}
          style={{
            background: activeTab === 'simulation' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: activeTab === 'simulation' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTab === 'simulation' ? '#818cf8' : 'var(--color-text-secondary)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Layers size={16} /> Step-by-Step Matrix & Visualizer
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          style={{
            background: activeTab === 'comparison' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: activeTab === 'comparison' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTab === 'comparison' ? '#818cf8' : 'var(--color-text-secondary)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BarChart2 size={16} /> 5-Algorithm Comparison
        </button>

        <button
          onClick={() => setActiveTab('belady')}
          style={{
            background: activeTab === 'belady' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: activeTab === 'belady' ? '1px solid #6366f1' : '1px solid transparent',
            color: activeTab === 'belady' ? '#818cf8' : 'var(--color-text-secondary)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} /> Belady's Anomaly Test
        </button>
      </div>

      {/* Tab 1: Step-by-step Interactive Simulation & Table */}
      {activeTab === 'simulation' && result && (
        <>
          {/* Metrics Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Total References
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
                {result.totalPages}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                Allocated {result.frameCount} memory frames
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Page Hits
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>
                {result.totalHits}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
                Hit Ratio: {result.hitRatio}%
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Page Faults
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ef4444' }}>
                {result.totalFaults}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px' }}>
                Fault Ratio: {result.faultRatio}%
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Active Algorithm
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8', marginTop: '4px' }}>
                {result.algorithm}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Step {currentStepIndex + 1} of {result.steps.length}
              </div>
            </div>
          </div>

          {/* Interactive Live Frame Visualizer Player */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Play size={18} color="var(--color-emerald)" /> Interactive Memory Frame Inspection
              </div>
              {/* Stepper Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentStepIndex(0)}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  title="Reset to Step 1"
                >
                  <RotateCcw size={14} />
                </button>

                <button
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentStepIndex === 0}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentStepIndex === 0 ? 0.4 : 1,
                  }}
                  title="Previous Step"
                >
                  <SkipBack size={14} />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    background: isPlaying ? '#ef4444' : '#6366f1',
                    border: 'none',
                    color: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? 'Pause' : 'Play'}
                </button>

                <button
                  onClick={() => setCurrentStepIndex((prev) => Math.min(result.steps.length - 1, prev + 1))}
                  disabled={currentStepIndex === result.steps.length - 1}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: '#f8fafc',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: currentStepIndex === result.steps.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: currentStepIndex === result.steps.length - 1 ? 0.4 : 1,
                  }}
                  title="Next Step"
                >
                  <SkipForward size={14} />
                </button>

                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                  }}
                >
                  <option value={1500}>0.6x (Slow)</option>
                  <option value={1000}>1x (Normal)</option>
                  <option value={500}>2x (Fast)</option>
                </select>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                <span>Reference Step {currentStepIndex + 1} / {result.steps.length}</span>
                <span>Referencing Page: <strong style={{ color: '#818cf8', fontSize: '0.9rem' }}>{currentStep?.page}</strong></span>
              </div>
              <input
                type="range"
                min="0"
                max={result.steps.length - 1}
                value={currentStepIndex}
                onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>

            {/* Live Frame Slots Display */}
            {currentStep && (
              <div
                style={{
                  background: 'var(--color-bg-secondary)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: currentStep.hit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        border: `1px solid ${currentStep.hit ? '#10b981' : '#ef4444'}`,
                        color: currentStep.hit ? '#10b981' : '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {currentStep.hit ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {currentStep.hit ? 'PAGE HIT' : 'PAGE FAULT'}
                    </div>

                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                      Referenced Page: <strong>Page {currentStep.page}</strong>
                    </span>
                  </div>

                  {currentStep.victimPage !== null && (
                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        color: '#f59e0b',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      Evicted Victim: Page {currentStep.victimPage}
                    </div>
                  )}
                </div>

                {/* Visual Memory Frame Boxes */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${result.frameCount}, 1fr)`, gap: '1rem', margin: '1.25rem 0' }}>
                  {Array.from({ length: result.frameCount }).map((_, slotIdx) => {
                    const pageInSlot = currentStep.frames[slotIdx];
                    const isOccupied = pageInSlot !== undefined && pageInSlot !== null;
                    const isTouched = isOccupied && (pageInSlot === currentStep.page);
                    const isVictimSlot = currentStep.replacedFrameIndex === slotIdx;
                    const isClockHand = currentStep.clockPointer === slotIdx;
                    const refBit = currentStep.referenceBits ? currentStep.referenceBits[slotIdx] : null;
                    const freqCount = currentStep.pageFrequencies && isOccupied ? currentStep.pageFrequencies[pageInSlot] : null;

                    return (
                      <div
                        key={slotIdx}
                        style={{
                          background: isTouched
                            ? currentStep.hit
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(99, 102, 241, 0.18)'
                            : 'var(--color-bg-primary)',
                          border: isTouched
                            ? currentStep.hit
                              ? '2px solid #10b981'
                              : '2px solid #6366f1'
                            : '1px solid var(--color-border)',
                          borderRadius: '10px',
                          padding: '1rem',
                          textAlign: 'center',
                          position: 'relative',
                          transition: 'all 0.25s ease',
                          boxShadow: isTouched ? '0 0 15px rgba(99, 102, 241, 0.3)' : 'none',
                        }}
                      >
                        {/* Clock hand indicator */}
                        {isClockHand && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-12px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              background: '#f59e0b',
                              color: '#0f172a',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Clock size={10} /> CLOCK HAND
                          </div>
                        )}

                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                          Frame {slotIdx}
                        </div>

                        <div
                          style={{
                            fontSize: '1.8rem',
                            fontWeight: 800,
                            color: isOccupied ? '#f8fafc' : '#475569',
                            minHeight: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isOccupied ? pageInSlot : '—'}
                        </div>

                        {/* Extra metadata badges for Clock / LFU */}
                        <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          {refBit !== null && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: refBit === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.1)',
                                color: refBit === 1 ? '#10b981' : '#94a3b8',
                                border: `1px solid ${refBit === 1 ? '#10b981' : 'transparent'}`,
                              }}
                            >
                              Ref Bit: {refBit}
                            </span>
                          )}

                          {freqCount !== null && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'rgba(99, 102, 241, 0.2)',
                                color: '#818cf8',
                              }}
                            >
                              Freq: {freqCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reason description callout */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#e2e8f0',
                    borderLeft: `3px solid ${currentStep.hit ? '#10b981' : '#6366f1'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <HelpCircle size={16} color={currentStep.hit ? '#10b981' : '#818cf8'} style={{ flexShrink: 0 }} />
                  <span>{currentStep.reason}</span>
                </div>
              </div>
            )}
          </div>

          {/* Complete Step Matrix Grid Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Layers size={18} /> Complete Paging Execution Matrix
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Green = Page Hit • Red = Page Fault
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', minWidth: '120px' }}>Reference String</th>
                    {result.steps.map((s, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: '10px 8px',
                          color: idx === currentStepIndex ? '#818cf8' : '#f8fafc',
                          fontWeight: 700,
                          background: idx === currentStepIndex ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                        }}
                      >
                        {s.page}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Frame Rows */}
                  {Array.from({ length: result.frameCount }).map((_, frameIdx) => (
                    <tr key={frameIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        Frame {frameIdx}
                      </td>
                      {result.steps.map((s, stepIdx) => {
                        const val = s.frames[frameIdx];
                        const isCurrent = stepIdx === currentStepIndex;
                        return (
                          <td
                            key={stepIdx}
                            style={{
                              padding: '8px',
                              background: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                              color: val !== undefined ? '#f8fafc' : '#475569',
                              fontFamily: 'monospace',
                              fontWeight: 600,
                            }}
                          >
                            {val !== undefined ? val : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Hit / Fault Status Row */}
                  <tr style={{ borderTop: '2px solid var(--color-border)', background: 'rgba(0, 0, 0, 0.2)' }}>
                    <td style={{ padding: '10px', textAlign: 'left', fontWeight: 700, color: '#f8fafc' }}>
                      Status
                    </td>
                    {result.steps.map((s, idx) => (
                      <td key={idx} style={{ padding: '10px 4px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: s.hit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: s.hit ? '#10b981' : '#ef4444',
                          }}
                        >
                          {s.hit ? 'H' : 'F'}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: 5-Algorithm Comparison */}
      {activeTab === 'comparison' && comparison && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BarChart2 size={18} color="var(--color-accent)" /> 5 Paging Algorithms Benchmark Comparison
              </div>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  color: '#10b981',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                Top Performer: {comparison.bestAlgorithm} ({comparison.minFaults} Faults)
              </div>
            </div>

            {/* Recharts Bar Graph */}
            <div style={{ height: '320px', width: '100%', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparison.results} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="algorithm" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="totalFaults" name="Page Faults" radius={[6, 6, 0, 0]}>
                    {comparison.results.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.algorithm === comparison.bestAlgorithm ? '#10b981' : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '1rem' }}>
              Algorithm Metric Breakdown
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px' }}>Algorithm</th>
                  <th style={{ padding: '10px' }}>Page Faults</th>
                  <th style={{ padding: '10px' }}>Page Hits</th>
                  <th style={{ padding: '10px' }}>Hit Ratio</th>
                  <th style={{ padding: '10px' }}>Fault Ratio</th>
                  <th style={{ padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {comparison.results.map((r) => {
                  const isBest = r.algorithm === comparison.bestAlgorithm;
                  return (
                    <tr
                      key={r.algorithm}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isBest ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{r.algorithm}</td>
                      <td style={{ padding: '10px', color: isBest ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                        {r.totalFaults}
                      </td>
                      <td style={{ padding: '10px', color: '#10b981', fontWeight: 600 }}>{r.totalHits}</td>
                      <td style={{ padding: '10px' }}>{r.hitRatio}%</td>
                      <td style={{ padding: '10px' }}>{r.faultRatio}%</td>
                      <td style={{ padding: '10px' }}>
                        {isBest ? (
                          <span
                            style={{
                              background: '#10b981',
                              color: '#0f172a',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            MIN FAULTS
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>Standard</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Belady's Anomaly Test */}
      {activeTab === 'belady' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <AlertTriangle size={18} color="#f59e0b" /> Belady's Anomaly Analysis
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              <strong>Belady's Anomaly</strong> is the counter-intuitive phenomenon in some page replacement algorithms
              (most notably <strong>FIFO</strong>) where increasing the number of page frames actually causes the number
              of page faults to <em>increase</em> rather than decrease! Optimal (OPT) and LRU are stack algorithms and are
              mathematically immune to Belady's Anomaly.
            </p>

            {beladyData && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: beladyData.anomalyDetected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${beladyData.anomalyDetected ? '#ef4444' : '#10b981'}`,
                  color: beladyData.anomalyDetected ? '#fca5a5' : '#86efac',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {beladyData.anomalyDetected ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                <span>{beladyData.description}</span>
              </div>
            )}

            {/* Line Chart showing Faults vs Frames */}
            {beladyData && (
              <div style={{ height: '300px', width: '100%', marginTop: '1.5rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={beladyData.frameTests} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="frames" label={{ value: 'Frame Count', position: 'insideBottom', offset: -10, fill: '#94a3b8' }} stroke="#94a3b8" />
                    <YAxis label={{ value: 'Page Faults', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                      }}
                    />
                    <Line type="monotone" dataKey="faults" name="Page Faults" stroke="#ef4444" strokeWidth={3} dot={{ r: 6, fill: '#ef4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
