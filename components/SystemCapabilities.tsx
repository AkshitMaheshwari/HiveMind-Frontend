'use client';

import React, { useState } from 'react';
import {
  Compass, Share2, FileSearch, Sparkles, Zap, ChevronDown, ChevronUp,
  CheckCircle2, ShieldCheck, RefreshCcw, Layers, Database
} from 'lucide-react';

interface Capability {
  icon: React.ReactNode;
  label: string;
  tag: string;
  tagColor: string;
  description: string;
  bullets: string[];
  accent: string;
  glow: string;
}

const capabilities: Capability[] = [
  {
    icon: <Compass className="w-5 h-5" />,
    label: '10 Autonomous Departments',
    tag: 'EXPANDED',
    tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
    description: '40+ specialized agents covering Strategy, Legal, Sales, Design, RAG, Code, and Analytics.',
    bullets: [
      'Business Strategy (SWOT, TAM/SAM/SOM, 9-slide pitch decks)',
      'Legal & Compliance (Clause review, ToS drafting, GDPR/SOC2)',
      'Sales & Outreach (Lead profiling, cold email & follow-ups)',
      'Brand & Design (Brand guidelines & DALL-E 3 mockups)',
    ],
    accent: 'from-amber-500/20 to-amber-600/5',
    glow: 'border-amber-500/20 hover:border-amber-500/40',
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    label: 'Inter-Dept Hive Mind',
    tag: 'NEW ARCH',
    tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
    description: 'Agents seamlessly call sister departments directly without CEO bottlenecks.',
    bullets: [
      'Strategy dept calls Research dept directly for market data',
      'Sales dept calls Research dept for prospect intelligence',
      'Strategy dept reuses Code dept sandbox for financial models',
      'Zero tool duplication — unified agent capabilities',
    ],
    accent: 'from-emerald-500/20 to-emerald-600/5',
    glow: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
  {
    icon: <FileSearch className="w-5 h-5" />,
    label: 'RAG Document Engine',
    tag: 'PRODUCTION',
    tagColor: 'text-violet-400 bg-violet-400/10 border-violet-400/25',
    description: 'Upload PDFs, Excel, CSV — agents answer questions with strict chunk citations.',
    bullets: [
      'Sentence-aware chunking (zero mid-sentence cuts)',
      'Vector embeddings with tenacity retry / backoff',
      'User-scoped search (server-side Qdrant filter)',
      'Atomic ingestion — 50MB file size limit',
    ],
    accent: 'from-violet-500/20 to-violet-600/5',
    glow: 'border-violet-500/20 hover:border-violet-500/40',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Visual & Code Sandbox',
    tag: 'LIVE',
    tagColor: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/25',
    description: 'DALL-E 3 image generation, Python sandbox execution, and live HTML preview.',
    bullets: [
      'Automated logo mockups & design asset generation',
      'Python code execution sandbox with security filters',
      'Interactive Recharts for analytics and financials',
      'Live iframe preview for generated web applications',
    ],
    accent: 'from-fuchsia-500/20 to-fuchsia-600/5',
    glow: 'border-fuchsia-500/20 hover:border-fuchsia-500/40',
  },
];

const guarantees = [
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: 'CEO router analyzes intent & dispatches subtasks' },
  { icon: <RefreshCcw className="w-4 h-4 text-amber-400" />, text: 'Real-time WebSocket event streaming to UI' },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: 'User document isolation at database vector level' },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: 'Automatic resilient multi-LLM fallback (Groq / Gemini / OpenAI)' },
];

const CapabilityCard: React.FC<{ cap: Capability; index: number }> = ({ cap, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`
        relative rounded-2xl border bg-[var(--bg-card)] transition-all duration-200 overflow-hidden
        ${cap.glow}
      `}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Gradient top strip */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${cap.accent}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${cap.accent} border ${cap.glow.split(' ')[0]}`}>
              <span className={cap.tagColor.split(' ')[0]}>{cap.icon}</span>
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
            onClick={() => setOpen(v => !v)}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-300"
          >
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable bullets */}
        {open && (
          <ul className="mt-4 space-y-2 border-t border-slate-800/60 pt-3">
            {cap.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-300 leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export const SystemCapabilities: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">System Upgrades</h2>
            <p className="text-[10px] text-slate-500">What's new in this build</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-400">49/49 tests passing</span>
        </div>
      </div>

      {/* Capability cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {capabilities.map((cap, i) => (
          <CapabilityCard key={cap.label} cap={cap} index={i} />
        ))}
      </div>

      {/* Guarantees strip */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Implementation guarantees
        </p>
        <div className="grid grid-cols-2 gap-2">
          {guarantees.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              {g.icon}
              <span className="text-[11px] text-slate-400">{g.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
