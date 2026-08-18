'use client';

import React, { useState } from 'react';
import {
  Layers, Database, FileSearch, Zap, ChevronDown, ChevronUp,
  CheckCircle2, ArrowUpRight, Box, ShieldCheck, RefreshCcw
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
    icon: <Layers className="w-5 h-5" />,
    label: 'Tool Registry',
    tag: 'NEW',
    tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
    description: 'Central registry for all agent tools — no more hardcoded imports.',
    bullets: [
      'Register once, available to all departments',
      'Tag-based filtering (research / content / code)',
      'ToolSpec validation at startup — zero silent failures',
      'Adding a new tool = 1 file + 1 line',
    ],
    accent: 'from-amber-500/20 to-amber-600/5',
    glow: 'border-amber-500/20 hover:border-amber-500/40',
  },
  {
    icon: <FileSearch className="w-5 h-5" />,
    label: 'RAG Pipeline',
    tag: 'NEW',
    tagColor: 'text-violet-400 bg-violet-400/10 border-violet-400/25',
    description: 'Upload your documents — agents answer questions from them instantly.',
    bullets: [
      'Sentence-aware chunking (no mid-sentence cuts)',
      'OpenAI embeddings with tenacity retry / backoff',
      'User-scoped search (server-side Qdrant filter)',
      'Atomic ingestion — fail = zero chunks stored',
    ],
    accent: 'from-violet-500/20 to-violet-600/5',
    glow: 'border-violet-500/20 hover:border-violet-500/40',
  },
  {
    icon: <Database className="w-5 h-5" />,
    label: 'Connector Interface',
    tag: 'NEW',
    tagColor: 'text-sky-400 bg-sky-400/10 border-sky-400/25',
    description: 'Plug any data source into the RAG pipeline with one class.',
    bullets: [
      'PDF → full text extraction via pypdf',
      'Excel → per-sheet Document objects (openpyxl)',
      'CSV → structured row extraction',
      '50 MB limit, typed errors, user-facing messages',
    ],
    accent: 'from-sky-500/20 to-sky-600/5',
    glow: 'border-sky-500/20 hover:border-sky-500/40',
  },
];

const guarantees = [
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: 'CEO routing logic untouched' },
  { icon: <RefreshCcw className="w-4 h-4 text-amber-400" />, text: 'All existing imports still work (compat shim)' },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: '49 / 49 unit tests passing' },
  { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: 'User data isolation at DB level (not app code)' },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
