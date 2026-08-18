'use client';

import React from 'react';
import { Shield, Sparkles, Cpu, Search, CheckSquare, FileText, PenTool, BarChart3, Edit3, Code2, Bug, BookOpen, LineChart, Database, PieChart, TrendingUp, DollarSign } from 'lucide-react';

interface AgentNetworkGridProps {
  events?: any[];
}

export const AgentNetworkGrid: React.FC<AgentNetworkGridProps> = ({ events = [] }) => {
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
      name: 'Executive Leadership',
      role: 'CEO Router & Aggregator',
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/40',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      agents: [
        { name: 'CEO Agent', icon: Shield, role: 'Intent Analysis & Subtask Planning' },
        { name: 'Aggregator Agent', icon: Cpu, role: 'Final Report Synthesis' },
      ],
    },
    {
      name: 'Research & Fact-Checking',
      role: 'Information Gathering',
      color: 'from-blue-500/10 to-indigo-600/10 border-blue-500/30',
      badgeColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
      agents: [
        { name: 'WebSearchAgent', icon: Search, role: 'DuckDuckGo Live Search' },
        { name: 'FactCheckerAgent', icon: CheckSquare, role: 'Source Verification' },
        { name: 'SummarizerAgent', icon: FileText, role: 'Key Insight Extraction' },
      ],
    },
    {
      name: 'Content & Marketing',
      role: 'Creative Copywriting',
      color: 'from-emerald-500/10 to-teal-600/10 border-emerald-500/30',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      agents: [
        { name: 'CopywriterAgent', icon: PenTool, role: 'Persuasive Content Writing' },
        { name: 'SEOOptimizerAgent', icon: BarChart3, role: 'Keyword & SERP Optimization' },
        { name: 'EditorAgent', icon: Edit3, role: 'Grammar & Tone Polish' },
      ],
    },
    {
      name: 'Software Engineering',
      role: 'Code Generation & Execution',
      color: 'from-purple-500/10 to-pink-600/10 border-purple-500/30',
      badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      agents: [
        { name: 'CodeGeneratorAgent', icon: Code2, role: 'Full-stack Code Generation' },
        { name: 'DebuggerAgent', icon: Bug, role: 'Sandbox Python & Web Testing' },
        { name: 'DocWriterAgent', icon: BookOpen, role: 'Developer Documentation' },
      ],
    },
    {
      name: 'Data Analytics',
      role: 'EDA & Visualizations',
      color: 'from-cyan-500/10 to-blue-600/10 border-cyan-500/30',
      badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      agents: [
        { name: 'DataPlannerAgent', icon: Database, role: 'Analysis Planning' },
        { name: 'EDAAgent', icon: BarChart3, role: 'Exploratory Data Analysis' },
        { name: 'DashboardAgent', icon: PieChart, role: 'Interactive Visualizations' },
      ],
    },
    {
      name: 'Financial Analysis',
      role: 'Market & Stock Data',
      color: 'from-rose-500/10 to-red-600/10 border-rose-500/30',
      badgeColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
      agents: [
        { name: 'MarketDataAgent', icon: TrendingUp, role: 'OHLCV & Prices' },
        { name: 'TechnicalAnalysisAgent', icon: LineChart, role: 'Trading Indicators' },
        { name: 'SynthesizerAgent', icon: DollarSign, role: 'Financial Reports' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            HiveMind Multi-Agent Network Swarm
          </h3>
          <p className="text-xs text-slate-400">22 Autonomous AI Agents collaborating in real-time</p>
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

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {departments.map((dept, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-gradient-to-br ${dept.color} border glass-panel transition-all hover:border-amber-500/40`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-100">{dept.name}</h4>
                <p className="text-[11px] text-slate-400">{dept.role}</p>
              </div>
              <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${dept.badgeColor}`}>
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
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{agent.name}</div>
                        <div className="text-[10px] text-slate-500">{agent.role}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md capitalize border ${
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
        ))}
      </div>
    </div>
  );
};
