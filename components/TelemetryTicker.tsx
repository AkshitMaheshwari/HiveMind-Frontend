'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity, Cpu, ShieldCheck, Database, Zap, Sparkles, Terminal
} from 'lucide-react';

const MOCK_STREAM_EVENTS = [
  'StrategyRouter: Dispatched subtasks to MarketAnalyst and FinancialModeler',
  'MarketAnalyst: Scraped TAM/SAM/SOM benchmarks via Research Dept',
  'CodeSandbox: Executed Monte Carlo 1,000 simulations in isolated runner',
  'LegalAgent: Completed GDPR/CCPA clause compliance audit',
  'RAG Engine: Vector chunks indexed with cosine similarity 0.94',
  'SalesSynthesizer: 4-Touch Cadence packaged with verified leads',
  'Aggregator: Synthesized partner-grade report across 4 departments',
];

export const TelemetryTicker: React.FC = () => {
  const [latency, setLatency] = useState(19);
  const [eventIndex, setEventIndex] = useState(0);

  // Micro-oscillate latency to simulate live telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(18 + Math.random() * 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through simulated live agent events
  useEffect(() => {
    const interval = setInterval(() => {
      setEventIndex((prev) => (prev + 1) % MOCK_STREAM_EVENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-slate-950/80 backdrop-blur-md p-3.5 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Swarm Vital Stats */}
        <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">SWARM ONLINE</span>
          </div>

          <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>Nodes: <strong className="text-slate-200">40+ Agents</strong></span>
          </div>

          <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Latency: <strong className="text-slate-200">{latency}ms</strong></span>
          </div>

          <div className="h-3.5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>LLM Failover: <strong className="text-slate-200">Active</strong></span>
          </div>
        </div>

        {/* Right: Live Event Stream Ticker */}
        <div className="flex items-center gap-2 w-full md:w-auto bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800/80 min-w-0">
          <Terminal className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex-shrink-0">
            Live Pulse:
          </span>
          <span className="text-[11px] font-mono text-slate-300 truncate animate-fadeIn">
            {MOCK_STREAM_EVENTS[eventIndex]}
          </span>
        </div>

      </div>
    </div>
  );
};
