'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles, Heart, GitBranch, Terminal, Cpu, Database,
  ArrowUpRight, ShieldCheck
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md text-slate-400 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Mission Statement */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-black text-lg text-slate-100 tracking-tight">
                Hive<span className="text-amber-400">Mind</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                v2.0 Swarm
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              An enterprise-grade autonomous multi-agent platform orchestrating specialized AI departments with LangGraph state machines, Qdrant Vector RAG, and live execution sandboxes.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px] text-emerald-400">All 10 Swarm Departments Operational</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link
                  href="/"
                  onClick={() => soundFx.playClick()}
                  className="hover:text-amber-400 transition-colors"
                >
                  Dashboard & Explorer
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  onClick={() => soundFx.playClick()}
                  className="hover:text-amber-400 transition-colors"
                >
                  Live Swarm Console
                </Link>
              </li>
              <li>
                <Link
                  href="/documents"
                  onClick={() => soundFx.playClick()}
                  className="hover:text-amber-400 transition-colors"
                >
                  Document Intelligence (RAG)
                </Link>
              </li>
              <li>
                <Link
                  href="/chat?tab=admin"
                  onClick={() => soundFx.playClick()}
                  className="hover:text-amber-400 transition-colors"
                >
                  Telemetry & Admin Monitor
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Tech Stack */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Architecture</h4>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">LangGraph</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">FastAPI</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Next.js 16</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Qdrant Cloud</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Supabase</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">WebSockets</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              Designed for low-latency parallel reasoning, continuous state persistence, and verifiable source grounding.
            </p>
          </div>
        </div>

        {/* ─── Bottom Copyright Ribbon ─── */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 flex-wrap text-center sm:text-left">
            <span>© 2026</span>
            <span className="font-bold text-slate-200 hover:text-amber-400 transition-colors">
              Akshit Maheshwari
            </span>
            <span>. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-500">
              Crafted with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 mx-0.5" /> for Autonomous Multi-Agent AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
