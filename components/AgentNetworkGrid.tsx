'use client';

import React, { useState } from 'react';
import {
  Shield, Sparkles, Cpu, Search, CheckSquare, FileText, PenTool,
  BarChart3, Edit3, Code2, Bug, BookOpen, LineChart, Database,
  PieChart, TrendingUp, DollarSign, Scale, Mail, Palette,
  Briefcase, FileSearch, Layers, Target, Compass, ChevronDown, ChevronUp
} from 'lucide-react';
import { SpotlightCard } from '@/components/SpotlightCard';
import { soundFx } from '@/lib/soundFx';

interface AgentNetworkGridProps {
  events?: any[];
}

export const AgentNetworkGrid: React.FC<AgentNetworkGridProps> = ({ events = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

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
      id: 'executive',
      category: 'executive',
      name: 'Executive Leadership',
      role: 'CEO Router & Aggregator',
      color: '#f59e0b',
      spotlight: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      icon: Shield,
      agents: [
        { name: 'CEO Agent', icon: Shield, role: 'Intent Analysis & Subtask Planning' },
        { name: 'Aggregator Agent', icon: Cpu, role: 'Final Report Synthesis' },
      ],
    },
    {
      id: 'strategy',
      category: 'strategy',
      name: 'Business Strategy',
      role: 'Market, SWOT, Financial Models & Pitch Decks',
      color: '#f59e0b',
      spotlight: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
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
      id: 'legal',
      category: 'legal',
      name: 'Legal & Compliance',
      role: 'Contract Review, ToS Drafting & Audits',
      color: '#06b6d4',
      spotlight: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.3)',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
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
      id: 'sales',
      category: 'sales',
      name: 'Sales & Outreach',
      role: 'Lead Profiling, Cold Emails & Sequences',
      color: '#f43f5e',
      spotlight: 'rgba(244, 63, 94, 0.1)',
      border: 'rgba(244, 63, 94, 0.3)',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
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
      id: 'design',
      category: 'design',
      name: 'Brand & Visual Design',
      role: 'Brand Guides, Logo Concepts & Visuals',
      color: '#ec4899',
      spotlight: 'rgba(236, 72, 153, 0.1)',
      border: 'rgba(236, 72, 153, 0.3)',
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/25',
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
      id: 'rag',
      category: 'rag',
      name: 'Document Intelligence (RAG)',
      role: 'Private Document Q&A & Semantic Search',
      color: '#06b6d4',
      spotlight: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.3)',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
      icon: FileSearch,
      agents: [
        { name: 'DocumentQAAgent', icon: FileSearch, role: 'Context-Scoped Document Answers' },
        { name: 'RAGRetrievalEngine', icon: Database, role: 'Qdrant Vector Chunks & Citation' },
      ],
    },
    {
      id: 'research',
      category: 'research',
      name: 'Research & Fact-Checking',
      role: 'Live Web, ArXiv & Academic Research',
      color: '#10b981',
      spotlight: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      icon: Search,
      agents: [
        { name: 'WebSearchAgent', icon: Search, role: 'DuckDuckGo Live Search' },
        { name: 'FactCheckerAgent', icon: CheckSquare, role: 'Source Verification & Fact Audit' },
        { name: 'SummarizerAgent', icon: FileText, role: 'Key Insight Extraction' },
      ],
    },
    {
      id: 'content',
      category: 'content',
      name: 'Content & Copywriting',
      role: 'Creative Writing & SEO Polish',
      color: '#10b981',
      spotlight: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      icon: PenTool,
      agents: [
        { name: 'CopywriterAgent', icon: PenTool, role: 'Persuasive Content Writing' },
        { name: 'SEOOptimizerAgent', icon: BarChart3, role: 'Keyword & SERP Optimization' },
        { name: 'EditorAgent', icon: Edit3, role: 'Grammar & Tone Polish' },
      ],
    },
    {
      id: 'engineering',
      category: 'engineering',
      name: 'Software Engineering',
      role: 'Full-Stack Code & Sandbox Execution',
      color: '#06b6d4',
      spotlight: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.3)',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
      icon: Code2,
      agents: [
        { name: 'CodeGeneratorAgent', icon: Code2, role: 'Full-Stack Code Generation' },
        { name: 'DebuggerAgent', icon: Bug, role: 'Sandbox Python & Web Testing' },
        { name: 'DocWriterAgent', icon: BookOpen, role: 'Developer Documentation' },
      ],
    },
    {
      id: 'analytics',
      category: 'analytics',
      name: 'Data Analytics',
      role: 'EDA, Correlations & Visualizations',
      color: '#10b981',
      spotlight: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
      icon: Database,
      agents: [
        { name: 'DataPlannerAgent', icon: Database, role: 'Analysis Planning & Profiling' },
        { name: 'EDAAgent', icon: BarChart3, role: 'Exploratory Data Analysis' },
        { name: 'DashboardAgent', icon: PieChart, role: 'Interactive Visualizations' },
      ],
    },
    {
      id: 'finance',
      category: 'finance',
      name: 'Financial Analysis',
      role: 'Market Data, Technicals & Valuation',
      color: '#f59e0b',
      spotlight: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
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
    { id: 'all', label: 'All Swarms', count: departments.length },
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

  const toggleExpand = (deptId: string) => {
    soundFx.playClick();
    setExpandedDept(expandedDept === deptId ? null : deptId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Autonomous Agent Swarm Matrix
          </h3>
          <p className="text-xs text-slate-400">
            {totalAgents} Autonomous Agents across {departments.length} Specialized Departments with Dynamic Inter-Dept Routing
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span> Idle
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Active
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Done
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              soundFx.playClick();
              setSelectedCategory(cat.id);
            }}
            onMouseEnter={() => soundFx.playHover()}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
              selectedCategory === cat.id
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-sm'
                : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDepts.map((dept) => {
          const DeptIcon = dept.icon;
          const isExpanded = expandedDept === dept.id;

          return (
            <SpotlightCard
              key={dept.id}
              spotlightColor={dept.spotlight}
              borderColor={dept.border}
              className="p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner"
                    style={{ backgroundColor: `${dept.color}15`, color: dept.color }}
                  >
                    <DeptIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{dept.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">{dept.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${dept.badgeColor}`}>
                    {dept.agents.length} Agents
                  </span>
                  <button
                    onClick={() => toggleExpand(dept.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Agent list */}
              <div className="space-y-2">
                {dept.agents.slice(0, isExpanded ? undefined : 3).map((agent, aIdx) => {
                  const status = getAgentStatus(agent.name);
                  const IconComponent = agent.icon;

                  return (
                    <div
                      key={aIdx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs hover:border-slate-700 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/5 flex-shrink-0"
                          style={{ backgroundColor: `${dept.color}12`, color: dept.color }}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-200 truncate group-hover:text-amber-300 transition-colors">
                            {agent.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{agent.role}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md capitalize border flex-shrink-0 font-semibold ${
                          status === 'working'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : status === 'done'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : status === 'error'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}

                {!isExpanded && dept.agents.length > 3 && (
                  <button
                    onClick={() => toggleExpand(dept.id)}
                    className="w-full text-center py-1.5 text-[11px] font-medium text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    + View {dept.agents.length - 3} more agents
                  </button>
                )}
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
};
