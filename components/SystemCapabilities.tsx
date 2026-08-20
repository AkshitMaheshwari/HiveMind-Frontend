'use client';

import React, { useState } from 'react';
import {
  Compass, Share2, FileSearch, Sparkles, Zap, ChevronDown, ChevronUp,
  CheckCircle2, ShieldCheck, RefreshCcw, Layers, Database
} from 'lucide-react';
import { SpotlightCard } from '@/components/SpotlightCard';
import { soundFx } from '@/lib/soundFx';

interface Capability {
  icon: React.ReactNode;
  label: string;
  tag: string;
  tagColor: string;
  description: string;
  bullets: string[];
  spotlight: string;
  border: string;
}

const capabilities: Capability[] = [
  {
    icon: <Compass className="w-5 h-5" />,
    label: '10 Autonomous Departments',
    tag: '40+ AGENTS',
    tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
    description: '40+ specialized agents covering Strategy, Legal, Sales, Design, RAG, Code Sandbox, and Financial Analytics.',
    bullets: [
      'Business Strategy (SWOT, TAM/SAM/SOM, 9-slide pitch decks)',
      'Legal & Compliance (Clause risk review, ToS & Privacy drafting, GDPR/SOC2)',
      'Sales & Outreach (Prospect research, high-converting cold email & 4-touch cadences)',
      'Brand & Visual Design (Brand guidelines, DALL-E 3 visual assets & slide layouts)',
    ],
    spotlight: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    label: 'Inter-Dept Synaptic Routing',
    tag: 'ZERO BOTTLENECK',
    tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
    description: 'Agents seamlessly call sister departments directly without central CEO bottlenecks.',
    bullets: [
      'Strategy dept calls Research dept directly for real-time market data',
      'Sales dept calls Research dept for prospect intelligence',
      'Strategy dept reuses Code dept sandbox for financial models & charts',
      'Zero tool duplication — unified agent capability mesh',
    ],
    spotlight: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  {
    icon: <FileSearch className="w-5 h-5" />,
    label: 'RAG Document Engine',
    tag: 'HYBRID RETRIEVAL',
    tagColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',
    description: 'Upload PDFs, Excel, CSV — agents answer questions with strict chunk citations.',
    bullets: [
      'Sentence-aware chunking (zero mid-sentence cuts)',
      'Vector embeddings with tenacity retry / backoff',
      'User-scoped search (server-side Qdrant isolation)',
      'Atomic ingestion with citation metadata',
    ],
    spotlight: 'rgba(6, 182, 212, 0.08)',
    border: 'rgba(6, 182, 212, 0.3)',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Execution Sandbox & Visuals',
    tag: 'LIVE RUNNER',
    tagColor: 'text-pink-400 bg-pink-400/10 border-pink-400/25',
    description: 'DALL-E 3 image generation, Python sandbox execution, and live interactive charts.',
    bullets: [
      'Automated logo mockups & design asset generation',
      'Python code execution sandbox with security filters',
      'Interactive Recharts for analytics and financials',
      'Live interactive preview for generated web applications',
    ],
    spotlight: 'rgba(236, 72, 153, 0.08)',
    border: 'rgba(236, 72, 153, 0.3)',
  },
];

const guarantees = [
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: 'CEO router analyzes intent & dispatches subtasks' },
  { icon: <RefreshCcw className="w-4 h-4 text-amber-400" />, text: 'Real-time WebSocket event streaming to UI' },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: 'User document isolation at database vector level' },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: 'Automatic resilient multi-LLM fallback (Groq / Gemini / OpenAI)' },
];

const CapabilityCard: React.FC<{ cap: Capability }> = ({ cap }) => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    soundFx.playClick();
    setOpen(!open);
  };

  return (
    <SpotlightCard
      spotlightColor={cap.spotlight}
      borderColor={cap.border}
      className="p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400">
            {cap.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-slate-100">{cap.label}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border tracking-wider ${cap.tagColor}`}>
                {cap.tag}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{cap.description}</p>
          </div>
        </div>
        <button
          onClick={toggle}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
        >
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {open && (
        <ul className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
          {cap.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-300 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      )}
    </SpotlightCard>
  );
};

export const SystemCapabilities: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Swarm Architectural Capabilities</h2>
            <p className="text-[10px] text-slate-400">Production-grade enterprise features</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400">All Nodes Verified</span>
        </div>
      </div>

      {/* Capability cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {capabilities.map((cap) => (
          <CapabilityCard key={cap.label} cap={cap} />
        ))}
      </div>

      {/* Guarantees strip */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-slate-950/70 backdrop-blur-md p-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Core Engine Guarantees
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {guarantees.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              {g.icon}
              <span className="text-xs text-slate-300">{g.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
