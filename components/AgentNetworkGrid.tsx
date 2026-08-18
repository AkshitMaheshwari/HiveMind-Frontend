'use client';

import React, { useState } from 'react';
import {
  Shield, Sparkles, Cpu, Search, CheckSquare, FileText, PenTool,
  BarChart3, Edit3, Code2, Bug, BookOpen, LineChart, Database,
  PieChart, TrendingUp, DollarSign, Scale, Mail, Palette,
  Briefcase, FileSearch, Layers, Target, Compass
} from 'lucide-react';

interface AgentNetworkGridProps {
  events?: any[];
}

export const AgentNetworkGrid: React.FC<AgentNetworkGridProps> = ({ events = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Determine agent status from latest events
  const getAgentStatus = (agentName: string) => {
    const agentEvents = events.filter((ev) => ev.agent === agentName);
    if (!agentEvents.length) return 'idle';
    const last = agentEvents[agentEvents.length - 1];
    if (last.event === 'agent_working') return 'working';
    if (last.event === 'agent_done') return 'done';
    if (last.event === 'error') return 'error';
    return 'idle';
  };

  const departments = [
    {
      category: 'executive',
      name: 'Executive Leadership',
      role: 'CEO Router & Aggregator',
      color: 'from-amber-500/15 to-amber-600/5 border-amber-500/30',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      icon: Shield,
      agents: [
        { name: 'CEO Agent', icon: Shield, role: 'Intent Analysis & Subtask Planning' },
        { name: 'Aggregator Agent', icon: Cpu, role: 'Final Report Synthesis' },
      ],
    },
    {
      category: 'strategy',
      name: 'Business Strategy',
      role: 'Market, SWOT, Financial Models & Pitch Decks',
      color: 'from-amber-500/10 to-orange-600/10 border-amber-500/30',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      icon: Compass,
      agents: [
        { name: 'StrategyRouterAgent', icon: Compass, role: 'Strategy Task Classifier' },
        { name: 'MarketAnalystAgent', icon: Search, role: 'TAM/SAM/SOM & Market Sizing' },
        { name: 'CompetitorAnalystAgent', icon: Target, role: 'Competitive Landscape & Gaps' },
        { name: 'FinancialModelerAgent', icon: LineChart, role: '3-Year Projections & Unit Economics' },
        { name: 'SWOTAgent', icon: CheckSquare, role: 'Evidence-Based SWOT Matrix' },
        { name: 'BusinessPlanAgent', icon: Briefcase, role: 'Executive Business Plan & GTM' },
        { name: 'PitchDeckAgent', icon: Layers, role: '9-Slide Investor Pitch Deck' },
        { name: 'StrategySynthesizerAgent', icon: Cpu, role: 'Partner-Level Executive Strategy' },
      ],
    },
    {
      category: 'legal',
      name: 'Legal & Compliance',
      role: 'Contract Review, ToS Drafting & Audits',
      color: 'from-violet-500/10 to-purple-600/10 border-violet-500/30',
      badgeColor: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
      icon: Scale,
      agents: [
        { name: 'LegalRouterAgent', icon: Scale, role: 'Legal Intent Classifier' },
        { name: 'ContractReviewAgent', icon: FileSearch, role: 'Risky Clause Flagger & Alternatives' },
        { name: 'ToSDrafterAgent', icon: FileText, role: 'Terms of Service & Privacy Policy' },
        { name: 'ComplianceChecklistAgent', icon: CheckSquare, role: 'GDPR, CCPA & SOC2 Compliance' },
        { name: 'LegalSynthesizerAgent', icon: Shield, role: 'Consolidated Legal Review & Disclaimers' },
      ],
    },
    {
      category: 'sales',
      name: 'Sales & Outreach',
      role: 'Lead Profiling, Cold Emails & Sequences',
      color: 'from-rose-500/10 to-pink-600/10 border-rose-500/30',
      badgeColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
      icon: Mail,
      agents: [
        { name: 'SalesRouterAgent', icon: Mail, role: 'Outreach Pipeline Router' },
        { name: 'LeadResearchAgent', icon: Search, role: 'Prospect Profiling via Research Dept' },
        { name: 'ColdEmailAgent', icon: PenTool, role: 'High-Converting B2B Cold Copy' },
        { name: 'FollowUpSequencerAgent', icon: Layers, role: '4-Touch Cadence & Breakup Emails' },
        { name: 'SalesSynthesizerAgent', icon: Briefcase, role: 'Sales Outreach Kit Packaging' },
      ],
    },
    {
      category: 'design',
      name: 'Brand & Visual Design',
      role: 'Brand Guides, Logo Concepts & Visuals',
      color: 'from-fuchsia-500/10 to-pink-600/10 border-fuchsia-500/30',
      badgeColor: 'text-fuchsia-400 bg-fuchsia-500/15 border-fuchsia-500/30',
      icon: Palette,
      agents: [
        { name: 'DesignRouterAgent', icon: Palette, role: 'Design Asset Router' },
        { name: 'BrandingAgent', icon: PenTool, role: 'Color Palettes, Typography & Voice' },
        { name: 'LogoConceptAgent', icon: Sparkles, role: 'Visual Concepts & DALL-E 3 Mockups' },
        { name: 'PitchVisualsAgent', icon: Layers, role: 'Slide Layout & Visual Direction' },
        { name: 'DesignSynthesizerAgent', icon: Cpu, role: 'Design System Specification' },
      ],
    },
    {
      category: 'rag',
      name: 'Document Intelligence (RAG)',
      role: 'Private Document Q&A & Semantic Search',
      color: 'from-sky-500/10 to-cyan-600/10 border-sky-500/30',
      badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
      icon: FileSearch,
      agents: [
        { name: 'DocumentQAAgent', icon: FileSearch, role: 'Context-Scoped Document Answers' },
        { name: 'RAGRetrievalEngine', icon: Database, role: 'Qdrant Vector Chunks & Citation' },
      ],
    },
    {
      category: 'research',
      name: 'Research & Fact-Checking',
      role: 'Live Web, ArXiv & Academic Research',
      color: 'from-blue-500/10 to-indigo-600/10 border-blue-500/30',
      badgeColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
      icon: Search,
      agents: [
        { name: 'WebSearchAgent', icon: Search, role: 'DuckDuckGo Live Search' },
        { name: 'FactCheckerAgent', icon: CheckSquare, role: 'Source Verification & Fact Audit' },
        { name: 'SummarizerAgent', icon: FileText, role: 'Key Insight Extraction' },
      ],
    },
    {
      category: 'content',
      name: 'Content & Copywriting',
      role: 'Creative Writing & SEO Polish',
      color: 'from-emerald-500/10 to-teal-600/10 border-emerald-500/30',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      icon: PenTool,
      agents: [
        { name: 'CopywriterAgent', icon: PenTool, role: 'Persuasive Content Writing' },
        { name: 'SEOOptimizerAgent', icon: BarChart3, role: 'Keyword & SERP Optimization' },
        { name: 'EditorAgent', icon: Edit3, role: 'Grammar & Tone Polish' },
      ],
    },
    {
      category: 'engineering',
      name: 'Software Engineering',
      role: 'Full-Stack Code & Sandbox Execution',
      color: 'from-purple-500/10 to-pink-600/10 border-purple-500/30',
      badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      icon: Code2,
      agents: [
        { name: 'CodeGeneratorAgent', icon: Code2, role: 'Full-Stack Code Generation' },
        { name: 'DebuggerAgent', icon: Bug, role: 'Sandbox Python & Web Testing' },
        { name: 'DocWriterAgent', icon: BookOpen, role: 'Developer Documentation' },
      ],
    },
    {
      category: 'analytics',
      name: 'Data Analytics',
      role: 'EDA, Correlations & Visualizations',
      color: 'from-cyan-500/10 to-blue-600/10 border-cyan-500/30',
      badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      icon: Database,
      agents: [
        { name: 'DataPlannerAgent', icon: Database, role: 'Analysis Planning & Profiling' },
        { name: 'EDAAgent', icon: BarChart3, role: 'Exploratory Data Analysis' },
        { name: 'DashboardAgent', icon: PieChart, role: 'Interactive Visualizations' },
      ],
    },
    {
      category: 'finance',
      name: 'Financial Analysis',
      role: 'Market Data, Technicals & Valuation',
      color: 'from-amber-500/10 to-red-600/10 border-amber-500/30',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      icon: TrendingUp,
      agents: [
        { name: 'MarketDataAgent', icon: TrendingUp, role: 'Real-Time OHLCV & Prices' },
        { name: 'TechnicalAnalysisAgent', icon: LineChart, role: 'RSI, MACD & Moving Averages' },
        { name: 'SynthesizerAgent', icon: DollarSign, role: 'Financial Valuation Reports' },
      ],
    },
  ];

  const totalAgents = departments.reduce((acc, d) => acc + d.agents.length, 0);

  const categories = [
    { id: 'all', label: 'All Departments', count: departments.length },
    { id: 'strategy', label: 'Strategy & Leadership', count: 2 },
    { id: 'legal', label: 'Legal & Compliance', count: 1 },
    { id: 'sales', label: 'Sales & Growth', count: 1 },
    { id: 'design', label: 'Brand & Design', count: 1 },
    { id: 'rag', label: 'Document RAG', count: 1 },
    { id: 'engineering', label: 'Code & Data', count: 3 },
  ];

  const filteredDepts = selectedCategory === 'all'
    ? departments
    : selectedCategory === 'strategy'
    ? departments.filter(d => ['executive', 'strategy'].includes(d.category))
    : selectedCategory === 'engineering'
    ? departments.filter(d => ['engineering', 'analytics', 'finance'].includes(d.category))
    : departments.filter(d => d.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            HiveMind Autonomous Agent Swarm
          </h3>
          <p className="text-xs text-slate-400">
            {totalAgents} Specialized AI Agents across {departments.length} Autonomous Departments collaborating in real-time
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span> Idle
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Working
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Completed
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
              selectedCategory === cat.id
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDepts.map((dept, idx) => {
          const DeptIcon = dept.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-br ${dept.color} border glass-panel transition-all hover:border-amber-500/40 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-amber-400">
                    <DeptIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{dept.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">{dept.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${dept.badgeColor} flex-shrink-0`}>
                  {dept.agents.length} Agents
                </span>
              </div>

              <div className="space-y-2">
                {dept.agents.map((agent, aIdx) => {
                  const status = getAgentStatus(agent.name);
                  const IconComponent = agent.icon;

                  return (
                    <div
                      key={aIdx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 flex-shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-200 truncate">{agent.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{agent.role}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md capitalize border flex-shrink-0 ${
                          status === 'working'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : status === 'done'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : status === 'error'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

