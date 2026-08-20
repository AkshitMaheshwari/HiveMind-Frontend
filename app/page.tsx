'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { ModelSelector, ModelConfig } from '@/components/ModelSelector';
import { supabase } from '@/lib/supabase';
import { HiveMindCanvas } from '@/components/HiveMindCanvas';
import { SynapseNetworkGraph } from '@/components/SynapseNetworkGraph';
import { TelemetryTicker } from '@/components/TelemetryTicker';
import { AgentNetworkGrid } from '@/components/AgentNetworkGrid';
import { SystemCapabilities } from '@/components/SystemCapabilities';
import { SpotlightCard } from '@/components/SpotlightCard';
import { soundFx } from '@/lib/soundFx';
import {
  Sparkles, ArrowRight, Compass, Scale, Code2, FileSearch,
  Zap, Play, ChevronRight, CheckCircle2, Shield
} from 'lucide-react';
import Link from 'next/link';

const QUICK_ACTIONS = [
  {
    title: 'Investor Pitch & Financial Model',
    dept: 'Strategy Swarm',
    icon: Compass,
    prompt: 'Build a comprehensive 9-slide investor pitch deck with TAM/SAM/SOM market sizing, competitor analysis, and 3-year unit economics for a B2B AI startup.',
    color: '#f59e0b',
    spotlight: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  {
    title: 'Legal Contract & Risk Audit',
    dept: 'Legal Swarm',
    icon: Scale,
    prompt: 'Review this SaaS Service Agreement, identify risky indemnity & limitation of liability clauses, draft safer fallbacks, and check GDPR/SOC2 compliance.',
    color: '#06b6d4',
    spotlight: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
  },
  {
    title: 'Full-Stack Code & Sandbox Runner',
    dept: 'Engineering Swarm',
    icon: Code2,
    prompt: 'Create a full-stack Python data pipeline with Monte Carlo simulation, execute it in the sandbox, and generate interactive charts.',
    color: '#10b981',
    spotlight: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  {
    title: 'Deep RAG Document Intelligence',
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
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);

  // Load saved model config
  useEffect(() => {
    const savedKeys = localStorage.getItem('hivemind_api_keys');
    const savedModel = localStorage.getItem('hivemind_selected_model');
    const savedProvider = localStorage.getItem('hivemind_selected_provider');
    const savedModelName = localStorage.getItem('hivemind_selected_model_name');
    if (savedKeys && savedModel && savedProvider) {
      const keys = JSON.parse(savedKeys);
      setModelConfig({
        provider: savedProvider as any,
        modelId: savedModel,
        modelName: savedModelName || savedModel,
        apiKey: keys[savedProvider] || '',
      });
    }
  }, []);

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
        onOpenSettings={() => setModelSelectorOpen(true)}
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

            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              Deploy 40+ specialized agents across 10 autonomous departments — Business Strategy, Legal, Sales, Brand Design, Document RAG, Full-Stack Engineering, and Financial Analytics — collaborating concurrently in real-time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/chat"
                onClick={() => soundFx.playClick()}
                onMouseEnter={() => soundFx.playHover()}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Swarm Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setModelSelectorOpen(true);
                }}
                onMouseEnter={() => soundFx.playHover()}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-500/40 shadow-sm transition-all"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Configure Models & Keys</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Launch Swarm Prompt Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400" />
                Quick-Launch Autonomous Swarm Missions
              </h2>
              <p className="text-xs text-slate-400">Click any preset mission to dispatch multi-agent pipelines immediately</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action, idx) => {
              const Icon = action.icon;
              return (
                <SpotlightCard
                  key={idx}
                  spotlightColor={action.spotlight}
                  borderColor={action.border}
                  className="p-5 flex flex-col justify-between cursor-pointer group hover:scale-[1.01] transition-transform"
                  onClick={() => handleLaunchPrompt(action.prompt)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/5"
                        style={{ backgroundColor: `${action.color}15`, color: action.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                        {action.dept}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {action.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                    <span>Dispatch Mission</span>
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
      />
    </div>
  );
}
