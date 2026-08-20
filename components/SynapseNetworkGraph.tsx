'use client';

import React, { useState } from 'react';
import {
  Compass, Shield, Mail, Scale, Palette,
  Search, PenTool, Code2, Database, TrendingUp,
  ArrowRight, Sparkles, Activity, Cpu, Layers
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface DeptNode {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  category: string;
  color: string;
  glow: string;
  x: number; // percentage
  y: number; // percentage
  agentsCount: number;
  connections: string[];
  description: string;
  primaryOutput: string;
}

const NODES: DeptNode[] = [
  {
    id: 'ceo',
    name: 'Executive Orchestrator',
    shortName: 'CEO & Router',
    icon: Shield,
    category: 'executive',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    x: 50,
    y: 20,
    agentsCount: 2,
    connections: ['strategy', 'legal', 'sales', 'engineering', 'research', 'analytics'],
    description: 'Deconstructs user queries, routes subtasks into autonomous agent graphs, and aggregates outputs.',
    primaryOutput: 'Master Execution Plan & Unified Synthesis',
  },
  {
    id: 'strategy',
    name: 'Business Strategy',
    shortName: 'Strategy Dept',
    icon: Compass,
    category: 'strategy',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.3)',
    x: 20,
    y: 42,
    agentsCount: 8,
    connections: ['research', 'engineering', 'ceo'],
    description: 'TAM/SAM/SOM sizing, 3-year financial models, SWOT analysis, and 9-slide investor pitch decks.',
    primaryOutput: 'Pitch Decks & GTM Business Plans',
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    shortName: 'Legal Dept',
    icon: Scale,
    category: 'legal',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.3)',
    x: 80,
    y: 42,
    agentsCount: 5,
    connections: ['ceo', 'sales'],
    description: 'Automated contract clause review, risk classification, ToS & Privacy drafting, and GDPR/SOC2 checks.',
    primaryOutput: 'Risk Audits & Policy Drafts',
  },
  {
    id: 'research',
    name: 'Research & Fact-Checking',
    shortName: 'Research Dept',
    icon: Search,
    category: 'research',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.3)',
    x: 15,
    y: 72,
    agentsCount: 3,
    connections: ['strategy', 'content', 'sales'],
    description: 'Live web scraping, academic research, source fact audits, and competitive intelligence gathering.',
    primaryOutput: 'Verified Citations & Market Data',
  },
  {
    id: 'engineering',
    name: 'Software Engineering',
    shortName: 'Code Sandbox',
    icon: Code2,
    category: 'engineering',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.3)',
    x: 50,
    y: 82,
    agentsCount: 3,
    connections: ['ceo', 'analytics', 'strategy'],
    description: 'Generates full-stack applications, executes Python sandbox scripts, and performs debugging in real-time.',
    primaryOutput: 'Executable Code & Sandbox Artifacts',
  },
  {
    id: 'sales',
    name: 'Sales & Outreach',
    shortName: 'Sales Dept',
    icon: Mail,
    category: 'sales',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.3)',
    x: 85,
    y: 72,
    agentsCount: 5,
    connections: ['legal', 'content', 'research'],
    description: 'Prospect profiling, high-converting B2B cold email copy, and multi-touch cadence sequences.',
    primaryOutput: '4-Touch Cadence & Outreach Kits',
  },
  {
    id: 'analytics',
    name: 'Data Analytics & Finance',
    shortName: 'Analytics Dept',
    icon: Database,
    category: 'analytics',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.3)',
    x: 35,
    y: 62,
    agentsCount: 6,
    connections: ['engineering', 'strategy'],
    description: 'Exploratory data analysis, real-time market data OHLCV, and interactive charts visualization.',
    primaryOutput: 'Interactive Charts & Valuations',
  },
  {
    id: 'content',
    name: 'Content & Brand Design',
    shortName: 'Content & Design',
    icon: Palette,
    category: 'design',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.3)',
    x: 65,
    y: 62,
    agentsCount: 8,
    connections: ['sales', 'ceo'],
    description: 'Persuasive copywriting, SEO SERP optimization, brand guideline design, and DALL-E 3 image generation.',
    primaryOutput: 'SEO Copy & Visual Assets',
  },
];

export const SynapseNetworkGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<DeptNode>(NODES[0]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const activeId = hoveredNode || selectedNode.id;
  const activeNode = NODES.find((n) => n.id === activeId) || selectedNode;

  const handleSelect = (node: DeptNode) => {
    setSelectedNode(node);
    soundFx.playClick();
  };

  const isConnected = (sourceId: string, targetId: string) => {
    const s = NODES.find((n) => n.id === sourceId);
    const t = NODES.find((n) => n.id === targetId);
    if (!s || !t) return false;
    return s.connections.includes(targetId) || t.connections.includes(sourceId);
  };

  return (
    <div className="relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-xl p-6 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 amber-glow">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                Interactive Hive Mind Synaptic Architecture
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                Zero Bottleneck Direct Routing
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Click any department node below to inspect real-time inter-department communication pathways.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Node: <strong className="text-slate-200">{activeNode.shortName}</strong></span>
        </div>
      </div>

      {/* Main Interactive Grid & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: SVG Synaptic Network Map */}
        <div className="lg:col-span-8 relative h-[360px] w-full rounded-2xl bg-slate-950/70 border border-slate-800/80 overflow-hidden">
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Draw all connection curves */}
            {NODES.map((node) =>
              node.connections.map((targetId) => {
                const target = NODES.find((n) => n.id === targetId);
                if (!target || node.id > target.id) return null; // avoid duplicate lines

                const isActiveConnection =
                  node.id === activeId || target.id === activeId;

                return (
                  <g key={`${node.id}-${target.id}`}>
                    <line
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2={`${target.x}%`}
                      y2={`${target.y}%`}
                      stroke={
                        isActiveConnection
                          ? 'url(#activeGrad)'
                          : 'rgba(255, 255, 255, 0.08)'
                      }
                      strokeWidth={isActiveConnection ? 2 : 1}
                      strokeDasharray={isActiveConnection ? '4 3' : undefined}
                      className={isActiveConnection ? 'animate-dash-flow' : ''}
                    />
                    {isActiveConnection && (
                      <circle
                        r="3"
                        fill="#f59e0b"
                        className="animate-pulse"
                      >
                        <animateMotion
                          path={`M ${(node.x / 100) * 500} ${(node.y / 100) * 360} L ${(target.x / 100) * 500} ${(target.y / 100) * 360}`}
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })
            )}
          </svg>

          {/* Interactive Department Nodes */}
          {NODES.map((node) => {
            const Icon = node.icon;
            const isCurrentActive = node.id === activeId;
            const isConnectedToActive =
              activeId !== node.id && isConnected(activeId, node.id);

            return (
              <button
                key={node.id}
                onClick={() => handleSelect(node)}
                onMouseEnter={() => {
                  setHoveredNode(node.id);
                  soundFx.playHover();
                }}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute group p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all duration-300 ${
                  isCurrentActive
                    ? 'scale-110 z-30 shadow-2xl ring-2 ring-amber-400 bg-slate-900 border-amber-500'
                    : isConnectedToActive
                    ? 'scale-105 z-20 bg-slate-900/90 border-slate-700 shadow-md ring-1 ring-cyan-500/40'
                    : 'scale-95 opacity-70 hover:opacity-100 bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                } border`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-inner"
                  style={{
                    backgroundColor: `${node.color}15`,
                    color: node.color,
                    boxShadow: isCurrentActive ? `0 0 16px ${node.glow}` : 'none',
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-200 whitespace-nowrap px-1">
                  {node.shortName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Department Details & Synaptic Telemetry Card */}
        <div className="lg:col-span-4 h-[360px] rounded-2xl bg-slate-950/80 border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${activeNode.color}20`,
                    color: activeNode.color,
                  }}
                >
                  {React.createElement(activeNode.icon, { className: 'w-4 h-4' })}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{activeNode.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeNode.agentsCount} Autonomous Agents
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2.5">
              {activeNode.description}
            </p>

            <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Primary Output Delivery:
              </span>
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{activeNode.primaryOutput}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Direct Neural Links:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeNode.connections.map((cId) => {
                  const target = NODES.find((n) => n.id === cId);
                  return (
                    <span
                      key={cId}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1"
                    >
                      <ArrowRight className="w-2.5 h-2.5 text-cyan-400" />
                      {target?.shortName || cId}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              State: Synchronized
            </span>
            <span>Zero Duplication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
