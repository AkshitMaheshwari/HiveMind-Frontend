'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, Code, Brain, ChevronRight, Zap, Shield, FileSearch,
  CheckCircle, ArrowUpRight, TrendingUp, Layers, Key, Lock, Cpu
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { soundFx } from '@/lib/soundFx';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { ModelSelector, ModelConfig } from '@/components/ModelSelector';
import { SpotlightCard } from '@/components/SpotlightCard';
import { HiveMindCanvas } from '@/components/HiveMindCanvas';
import { SynapseNetworkGraph } from '@/components/SynapseNetworkGraph';
import { AgentNetworkGrid } from '@/components/AgentNetworkGrid';
import { TelemetryTicker } from '@/components/TelemetryTicker';
import { SystemCapabilities } from '@/components/SystemCapabilities';

// ─── Preset Sample Prompts for Quick Action ──────────────────────────────────
const STARTER_PROMPTS = [
  {
    title: 'Autonomous SaaS GTM & Investor Deck',
    dept: 'Strategy & Financial Swarm',
    icon: TrendingUp,
    prompt: 'Construct a 3-year market penetration roadmap, complete unit economics model, and a 9-slide seed pitch deck for an enterprise AI agent platform.',
    color: '#f59e0b',
    spotlight: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  {
    title: 'Full-Stack Web App & Live Execution',
    dept: 'Code Engineering Swarm',
    icon: Code,
    prompt: 'Build a responsive SaaS pricing calculator with currency toggles, tier comparisons, and animated slider controls using Tailwind CSS and vanilla JavaScript.',
    color: '#8b5cf6',
    spotlight: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.35)',
  },
  {
    title: 'Enterprise Multi-Touch Cold Outreach',
    dept: 'Sales & Growth Swarm',
    icon: Zap,
    prompt: 'Draft an aggressive 4-stage cold email sequence targeting VP of Engineering roles, addressing legacy latency and technical compliance objections.',
    color: '#06b6d4',
    spotlight: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
  },
  {
    title: 'Document Intelligence & Vector RAG',
    dept: 'Document Intelligence',
    icon: FileSearch,
    prompt: 'Query our uploaded private financial disclosures to extract revenue breakdown by geography with exact citation chunk references.',
    color: '#ec4899',
    spotlight: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.35)',
  },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [modelSelectorTab, setModelSelectorTab] = useState<'gemini' | 'groq' | 'openai' | 'github' | 'gmail'>('gemini');
  const [hasGitHubToken, setHasGitHubToken] = useState(false);
  const [hasGmailToken, setHasGmailToken] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);

  // Load saved model config
  useEffect(() => {
    const savedKeys = localStorage.getItem('hivemind_api_keys');
    const savedModel = localStorage.getItem('hivemind_selected_model');
    const savedProvider = localStorage.getItem('hivemind_selected_provider');
    const savedModelName = localStorage.getItem('hivemind_selected_model_name');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setHasGitHubToken(Boolean(parsed.github || parsed.github_token));
        setHasGmailToken(Boolean(parsed.gmail || parsed.gmail_token));
      } catch {}
    }
    if (savedKeys && savedModel && savedProvider) {
      const keys = JSON.parse(savedKeys);
      setModelConfig({
        provider: savedProvider as any,
        modelId: savedModel,
        modelName: savedModelName || savedModel,
        apiKey: keys[savedProvider] || '',
      });
    }
  }, [modelSelectorOpen]);

  // Fetch Supabase Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleSaveModel = (config: ModelConfig) => {
    setModelConfig(config);
    localStorage.setItem('hivemind_selected_model', config.modelId);
    localStorage.setItem('hivemind_selected_provider', config.provider);
    localStorage.setItem('hivemind_selected_model_name', config.modelName);
    const existingKeys = JSON.parse(localStorage.getItem('hivemind_api_keys') || '{}');
    existingKeys[config.provider] = config.apiKey;
    localStorage.setItem('hivemind_api_keys', JSON.stringify(existingKeys));
    setHasGitHubToken(Boolean(existingKeys.github || existingKeys.github_token));
    setHasGmailToken(Boolean(existingKeys.gmail || existingKeys.gmail_token));
  };

  const handleLaunchPrompt = (prompt: string) => {
    soundFx.playClick();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hivemind_prefilled_prompt', prompt);
      window.location.href = '/chat';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-main)] font-sans antialiased text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenSettings={(tab) => {
          if (tab) setModelSelectorTab(tab);
          setModelSelectorOpen(true);
        }}
        onOpenGitHub={() => {
          setModelSelectorTab('github');
          setModelSelectorOpen(true);
        }}
        hasGitHubToken={hasGitHubToken}
        onOpenGmail={() => {
          setModelSelectorTab('gmail');
          setModelSelectorOpen(true);
        }}
        hasGmailToken={hasGmailToken}
        activeTab="dashboard"
        setActiveTab={(t) => {
          if (t === 'admin') window.location.href = '/chat?tab=admin';
          else if (t === 'chat') window.location.href = '/chat';
          else if (t === 'documents') window.location.href = '/documents';
        }}
        selectedModelName={modelConfig?.modelName}
      />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Live Swarm Telemetry Ribbon */}
        <TelemetryTicker />

        {/* Interactive Hero Banner with Neural Canvas */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border border-[var(--border-subtle)] p-8 md:p-12 shadow-2xl amber-glow">
          {/* Interactive Mouse Synaptic Canvas */}
          <HiveMindCanvas />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Multi-Agent Swarm Intelligence</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
              Orchestrate <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Autonomous AI Swarms</span> with Zero Friction.
            </h1>

            <p className="text-base md:text-lg text-slate-300 font-normal leading-relaxed">
              Deploy collaborative AI specialist teams in real-time. From full-stack code synthesis and financial market modeling to legal compliance audits and vector RAG retrieval.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleLaunchPrompt('Create a 3-year strategic business plan, investor pitch deck, and financial model for an AI infrastructure startup.')}
                onMouseEnter={() => soundFx.playHover()}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Autonomous Swarm</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setModelSelectorOpen(true);
                }}
                onMouseEnter={() => soundFx.playHover()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-500/40 text-slate-200 transition-all"
              >
                <Key className="w-4 h-4 text-amber-400" />
                <span>Configure Keys & Integrations</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Starter Action Missions Grid ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Featured Mission Directives</h2>
              <p className="text-xs text-slate-400">Click any directive to launch an orchestrated multi-agent workflow immediately.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STARTER_PROMPTS.map((card, i) => {
              const Icon = card.icon;
              return (
                <SpotlightCard
                  key={i}
                  spotlightColor={card.spotlight}
                  borderColor={card.border}
                  className="p-5 flex flex-col justify-between h-56 cursor-pointer group"
                  onClick={() => handleLaunchPrompt(card.prompt)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${card.color}15`, borderColor: `${card.color}40`, color: card.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{ backgroundColor: `${card.color}10`, borderColor: `${card.color}30`, color: card.color }}
                      >
                        {card.dept.split(' ')[0]}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                        {card.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition-colors pt-2 border-t border-slate-800/80">
                    <span>Deploy Swarm</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>

        {/* Interactive Inter-Department Synaptic Graph */}
        <SynapseNetworkGraph />

        {/* Agent Swarm Network Grid */}
        <AgentNetworkGrid events={[]} />

        {/* System Capabilities & Architectural Guarantees */}
        <SystemCapabilities />
        
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
        }}
      />

      <ModelSelector
        isOpen={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        onSave={handleSaveModel}
        currentConfig={modelConfig}
        initialTab={modelSelectorTab}
      />
    </div>
  );
}
