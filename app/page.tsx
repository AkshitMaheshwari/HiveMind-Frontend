'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { ModelSelector, ModelConfig } from '@/components/ModelSelector';
import { supabase } from '@/lib/supabase';
import { HiveMindCanvas } from '@/components/HiveMindCanvas';
import { AgentNetworkGrid } from '@/components/AgentNetworkGrid';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SystemCapabilities } from '@/components/SystemCapabilities';

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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-main)] font-sans antialiased text-slate-100">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenSettings={() => setModelSelectorOpen(true)}
        activeTab="dashboard"
        setActiveTab={(t) => {
          if (t === 'admin') window.location.href = '/chat?tab=admin';
          else if (t === 'chat') window.location.href = '/chat';
        }}
        selectedModelName={modelConfig?.modelName}
      />

      <div className="flex-1 overflow-y-auto p-8 bg-slate-950/50">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Interactive Hero Banner with Canvas Particles */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-8 shadow-2xl amber-glow">
            <HiveMindCanvas />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Autonomous Multi-Agent Swarm
              </div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight mb-3">
                HiveMind Enterprise Orchestrator
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed mb-8 max-w-xl">
                Experience next-generation multi-agent execution with 40+ autonomous agents across 10 specialized departments — Strategy, Legal, Sales, Design, Document RAG, Full-Stack Engineering, and Financial Analytics — collaborating in real-time.
              </p>

              <Link href="/chat" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md transition-all shadow-amber-500/20 hover:shadow-amber-500/40">
                Launch Workspace & Chat
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Agent Swarm Network Grid */}
          <AgentNetworkGrid events={[]} />

          {/* System Upgrades showcase */}
          <SystemCapabilities />
          
        </div>
      </div>

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
