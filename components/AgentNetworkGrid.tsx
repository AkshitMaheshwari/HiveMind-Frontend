'use client';

import React, { useState } from 'react';
import {
  Shield, Sparkles, Cpu, Search, CheckSquare, FileText, PenTool,
  Code2, Bug, LineChart, Database,
  TrendingUp, Mail, Palette, Briefcase, FileSearch, Layers, Target, Compass,
  ChevronDown, ChevronUp, GitPullRequest, ArrowRight, Activity, Terminal, BookOpen
} from 'lucide-react';
import { SpotlightCard } from '@/components/SpotlightCard';
import { soundFx } from '@/lib/soundFx';

interface AgentNetworkGridProps {
  events?: any[];
  onLaunchPrompt?: (prompt: string) => void;
}

export const AgentNetworkGrid: React.FC<AgentNetworkGridProps> = ({
  events = [],
  onLaunchPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedDept, setExpandedDept] = useState<string | null>('executive');

  const departments = [
    {
      id: 'executive',
      category: 'executive',
      name: 'Executive & Orchestration',
      shortName: 'CEO Swarm',
      role: 'CEO Router, Dynamic Workflow Planner & Aggregator',
      color: '#f59e0b',
      spotlight: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      icon: Shield,
      samplePrompt: 'Coordinate an end-to-end audit: review codebase, extract SLA terms from uploaded docs, and synthesize a CEO brief.',
      agents: [
        { name: 'CEO Orchestrator Agent', icon: Shield, role: 'Intent Analysis, Multi-Department Delegation & Execution Scheduling', tools: ['State Graph', 'Task Allocator'] },
        { name: 'Mission Router Agent', icon: Compass, role: 'Few-Shot Department Routing & Semantic Intent Matching', tools: ['Semantic Classifier'] },
        { name: 'Executive Synthesis Agent', icon: Cpu, role: 'Cross-Department Output Consolidation & Executive Briefing', tools: ['Aggregator Engine'] },
      ],
    },
    {
      id: 'code',
      category: 'code',
      name: 'Code & Repository Engineering',
      shortName: 'Code Swarm',
      role: 'Full-Stack Synthesis, Codebase QA, Git & PR Automation',
      color: '#8b5cf6',
      spotlight: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.35)',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
      icon: Code2,
      samplePrompt: 'Build a responsive SaaS calculator with React, TypeScript and Tailwind, inspect repo structure, and open a GitHub PR.',
      agents: [
        { name: 'Architecture Lead Agent', icon: Layers, role: 'System Architecture Design, Schema Planning & Interface Specs', tools: ['AST Parser', 'Spec Engine'] },
        { name: 'Full-Stack Developer Agent', icon: Code2, role: 'Frontend & Backend Implementation with Live HTML Previews', tools: ['E2B Sandbox', 'Code Exec'] },
        { name: 'QA & Security Analyst Agent', icon: Bug, role: 'Static Code Analysis, Vulnerability Scanning & Test Cases', tools: ['Linter', 'Security Auditor'] },
        { name: 'GitHub Operations Agent', icon: GitPullRequest, role: 'Live Repository Tree Inspection, File Reading, Commits & Automated PRs', tools: ['GitHub REST API'] },
      ],
    },
    {
      id: 'finance',
      category: 'finance',
      name: 'Financial Intelligence & Strategy',
      shortName: 'Finance Swarm',
      role: 'Market Analytics, 3-Year P&L, SWOT & Investor Pitch Decks',
      color: '#06b6d4',
      spotlight: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.35)',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
      icon: LineChart,
      samplePrompt: 'Analyze NVDA and MSFT fundamentals, calculate RSI/MACD indicators, and build a 3-year cash flow forecast.',
      agents: [
        { name: 'Market Analyst Agent', icon: Search, role: 'Yahoo Finance Live Metrics, Stock Fundamentals & Macro Data', tools: ['Yahoo Finance API'] },
        { name: 'Financial Modeler Agent', icon: LineChart, role: '3-Year Financial Projections, EBITDA & Unit Economics Modeling', tools: ['Recharts Visualizer'] },
        { name: 'SWOT & Strategy Agent', icon: CheckSquare, role: 'Evidence-Based Competitive Landscape & SWOT Matrix', tools: ['Strategic Matrix'] },
        { name: 'Pitch Deck Architect Agent', icon: Layers, role: '9-Slide Institutional Investor Deck with Narrative Flow', tools: ['Presentation Engine'] },
      ],
    },
    {
      id: 'sales',
      category: 'sales',
      name: 'Sales, Growth & Communication',
      shortName: 'Sales Swarm',
      role: 'Inbox Triage, B2B Cold Outreach, Lead Intelligence & Sequencing',
      color: '#f43f5e',
      spotlight: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.35)',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
      icon: Mail,
      samplePrompt: 'Check unread emails from today, triage client requests, and draft customized follow-up replies.',
      agents: [
        { name: 'Gmail Operations Agent', icon: Mail, role: 'Live Inbox Triage, Unread Email Parsing, Invoice Searches & AI Drafts', tools: ['Gmail REST API'] },
        { name: 'GTM Strategy Agent', icon: Target, role: 'Ideal Customer Profile (ICP) & Competitor Positioning Strategy', tools: ['Market Profiler'] },
        { name: 'B2B Copywriter Agent', icon: PenTool, role: 'High-Converting Multi-Touch Cold Outreach & Value Propositions', tools: ['Copy Engine'] },
        { name: 'Follow-Up Sequencer Agent', icon: Layers, role: '4-Stage Cadence Automation, Breakup Emails & Objection Handling', tools: ['Sequencer'] },
      ],
    },
    {
      id: 'rag',
      category: 'rag',
      name: 'Document Intelligence & Vector RAG',
      shortName: 'RAG Swarm',
      role: 'Multi-Format Vector Embeddings, Hybrid Search & Evidence Grounding',
      color: '#38bdf8',
      spotlight: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.35)',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
      icon: FileSearch,
      samplePrompt: 'Search uploaded contracts to extract termination clauses and SLA penalty terms with exact chunk citations.',
      agents: [
        { name: 'Ingestion & Chunker Agent', icon: FileText, role: 'Semantic & Recursive Chunking for PDF, Excel, CSV, & Markdown', tools: ['FastEmbed Tokenizer'] },
        { name: 'Vector Retrieval Engine', icon: Database, role: 'Qdrant Cloud Hybrid Search (Dense Embeddings + Sparse BM25)', tools: ['Qdrant Cloud API'] },
        { name: 'Citation & Grounding Agent', icon: CheckSquare, role: 'Multi-Hop Verification & Source Attribution Guarantee', tools: ['Grounding Verifier'] },
      ],
    },
    {
      id: 'research',
      category: 'research',
      name: 'Research & Live Intelligence',
      shortName: 'Research Swarm',
      role: 'Autonomous Web Scraping, Academic ArXiv Search & Fact Audit',
      color: '#10b981',
      spotlight: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      icon: Search,
      samplePrompt: 'Perform deep market research on quantum computing agent architectures with peer-reviewed citations.',
      agents: [
        { name: 'Web Intelligence Agent', icon: Search, role: 'Live Search & Web Page Extraction via Tavily & DuckDuckGo', tools: ['Tavily API', 'DDG'] },
        { name: 'Fact Verifier Agent', icon: CheckSquare, role: 'Cross-Source Triangulation & Hallucination Elimination', tools: ['Evidence Auditor'] },
        { name: 'ArXiv & Tech Researcher', icon: BookOpen, role: 'Deep Technical Whitepaper & Benchmark Synthesis', tools: ['ArXiv Indexer'] },
      ],
    },
  ];

  const totalAgents = departments.reduce((acc, d) => acc + d.agents.length, 0);

  const filteredDepts = selectedCategory === 'all'
    ? departments
    : departments.filter((d) => d.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* ─── Header & High-Level Architecture Stats ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-semibold mb-1.5">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Multi-Agent Swarm Matrix</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
            Autonomous Department & Agent Architecture
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Explore the specialized AI departments, autonomous agents, and native tools powering HiveMind.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-bold text-slate-100">{departments.length}</span>
            <span className="text-slate-400 text-[11px]">Departments</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="font-bold text-slate-100">{totalAgents}</span>
            <span className="text-slate-400 text-[11px]">Specialized Agents</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-slate-100">8</span>
            <span className="text-slate-400 text-[11px]">Native Cloud Tools</span>
          </div>
        </div>
      </div>

      {/* ─── Department Category Filter Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => {
            soundFx.playClick();
            setSelectedCategory('all');
          }}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Departments ({totalAgents} Agents)
        </button>
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => {
              soundFx.playClick();
              setSelectedCategory(dept.category);
              setExpandedDept(dept.id);
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex-shrink-0 flex items-center gap-1.5 ${
              selectedCategory === dept.category
                ? 'bg-slate-800 text-slate-100 border border-amber-500/40 shadow-sm'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span style={{ color: dept.color }}>●</span>
            <span>{dept.shortName}</span>
            <span className="text-[10px] text-slate-500">({dept.agents.length})</span>
          </button>
        ))}
      </div>

      {/* ─── Departments & Agents Interactive Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepts.map((dept) => {
          const Icon = dept.icon;
          const isExpanded = expandedDept === dept.id;

          return (
            <SpotlightCard
              key={dept.id}
              spotlightColor={dept.spotlight}
              borderColor={dept.border}
              className="p-5 flex flex-col justify-between rounded-2xl bg-slate-950/80 border transition-all shadow-lg"
            >
              <div className="space-y-4">
                {/* Department Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner flex-shrink-0"
                      style={{ backgroundColor: `${dept.color}15`, borderColor: `${dept.color}40`, color: dept.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-100">{dept.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{dept.role}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${dept.badgeColor}`}>
                    {dept.agents.length} Agents
                  </span>
                </div>

                {/* Agent Roster List */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span>Department Sub-Agents</span>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setExpandedDept(isExpanded ? null : dept.id);
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                    >
                      <span>{isExpanded ? 'Collapse' : 'Expand All'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {dept.agents.slice(0, isExpanded ? dept.agents.length : 2).map((agent, idx) => {
                      const AgentIcon = agent.icon;
                      return (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-2.5"
                        >
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: `${dept.color}15`, color: dept.color }}
                          >
                            <AgentIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-semibold text-slate-200 truncate">{agent.name}</h4>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 mt-0.5">
                              {agent.role}
                            </p>
                            {isExpanded && agent.tools && (
                              <div className="flex items-center gap-1 flex-wrap mt-1.5">
                                {agent.tools.map((tool, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                                  >
                                    ⚙ {tool}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  State Machine · LangGraph
                </span>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    if (onLaunchPrompt) onLaunchPrompt(dept.samplePrompt);
                    else {
                      sessionStorage.setItem('hivemind_prefilled_prompt', dept.samplePrompt);
                      window.location.href = '/chat';
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group"
                >
                  <span>Deploy Swarm</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
};
