'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Key, ChevronRight, Sparkles, Check, Eye, EyeOff, Cpu, Zap, Brain, GitPullRequest
} from 'lucide-react';

export interface ModelConfig {
  provider: 'gemini' | 'groq' | 'openai';
  modelId: string;
  modelName: string;
  apiKey: string;
}

interface ModelEntry {
  id: string;
  name: string;
  description: string;
}

interface ModelRegistry {
  gemini: ModelEntry[];
  groq: ModelEntry[];
  openai: ModelEntry[];
}

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ModelConfig) => void;
  currentConfig: ModelConfig | null;
}

type ProviderType = 'gemini' | 'groq' | 'openai' | 'github';

const PROVIDER_META: Record<ProviderType, {
  label: string;
  color: string;
  border: string;
  accent: string;
  activeBg: string;
  icon: React.ReactNode;
  placeholder: string;
  keyHint: string;
}> = {
  gemini: {
    label: 'Google Gemini',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/40',
    accent: 'text-blue-400',
    activeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-400',
    icon: <Brain className="w-4 h-4" />,
    placeholder: 'AIzaSy...',
    keyHint: 'Get from console.cloud.google.com',
  },
  groq: {
    label: 'Groq',
    color: 'from-orange-500/20 to-amber-500/20',
    border: 'border-orange-500/40',
    accent: 'text-orange-400',
    activeBg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
    icon: <Zap className="w-4 h-4" />,
    placeholder: 'gsk_...',
    keyHint: 'Get from console.groq.com',
  },
  openai: {
    label: 'OpenAI',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/40',
    accent: 'text-emerald-400',
    activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
    icon: <Cpu className="w-4 h-4" />,
    placeholder: 'sk-...',
    keyHint: 'Get from platform.openai.com',
  },
  github: {
    label: 'GitHub Integration',
    color: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-500/40',
    accent: 'text-purple-400',
    activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-400',
    icon: <GitPullRequest className="w-4 h-4" />,
    placeholder: 'ghp_... or github_pat_...',
    keyHint: 'Get from github.com/settings/tokens (repo scope)',
  },
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig,
}) => {
  const [activeProvider, setActiveProvider] = useState<ProviderType>(
  );
  const [selectedModelId, setSelectedModelId] = useState<string>(
    currentConfig?.modelId || ''
  );
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    gemini: currentConfig?.provider === 'gemini' ? currentConfig.apiKey : '',
    groq:   currentConfig?.provider === 'groq'   ? currentConfig.apiKey : '',
    openai: currentConfig?.provider === 'openai' ? currentConfig.apiKey : '',
    github: '',
  });
  const [githubSaved, setGithubSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [modelRegistry, setModelRegistry] = useState<ModelRegistry | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);

  // Persist API keys in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hivemind_api_keys');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setApiKeys((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  // Fetch model registry from backend
  useEffect(() => {
    if (!isOpen) return;
    setLoadingModels(true);
    fetch('http://localhost:8000/api/models')
      .then((r) => r.json())
      .then((data) => setModelRegistry(data))
      .catch(() => {
        // Fallback registry if backend not reachable
        setModelRegistry({
          gemini: [
            { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', description: 'Flagship hybrid reasoning & multimodal model, ultra-fast & intelligent' },
            { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', description: 'High-performance production model for complex workflows' },
            { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', description: 'Latest versatile general-purpose performance' },
            { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite Latest', description: 'Ultra-low latency execution for high throughput' },
            { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', description: 'Next-gen flagship multimodal model, high speed' },
            { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', description: 'Deep reasoning & complex multi-step analysis' },
            { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', description: 'Ultra-lightweight preview for fast tasks' },
            { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', description: 'Next-gen preview model with enhanced reasoning' },
            { id: 'gemini-3.1-flash-live-preview', name: 'Gemini 3.1 Flash Live Preview', description: 'Real-time low latency multimodal streaming preview' },
          ],
          groq: [
            { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', description: 'Flagship open-weights on Groq, 500 T/s, 131k context' },
            { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B', description: 'Ultra-fast open weights on Groq, 1000 T/s, 131k context' },
            { id: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B', description: 'Alibaba reasoning model, 131k context, tools support' },
            { id: 'groq/compound', name: 'Groq Compound', description: 'Groq engineered multi-agent system, 131k context' },
            { id: 'groq/compound-mini', name: 'Compound Mini', description: 'Fast lightweight compound model, 131k context' },
            { id: 'allam-2-7b', name: 'ALLaM 2 7B', description: 'SDAIA bilingual Arabic/English model, 4k context' },
          ],
          openai: [
            { id: 'gpt-4o', name: 'GPT-4o', description: 'Best OpenAI model, multimodal' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Affordable, fast, intelligent' },
          ],
        });
      })
      .finally(() => setLoadingModels(false));
  }, [isOpen]);

  // Auto-select first model when switching provider
  useEffect(() => {
    if (!modelRegistry || activeProvider === 'github') return;
    const models = modelRegistry[activeProvider as 'gemini' | 'groq' | 'openai'] || [];
    if (models.length > 0 && !models.find((m: ModelEntry) => m.id === selectedModelId)) {
      setSelectedModelId(models[0].id);
    }
  }, [activeProvider, modelRegistry, selectedModelId]);

  if (!isOpen) return null;

  const meta = PROVIDER_META[activeProvider];
  const models: ModelEntry[] = (activeProvider !== 'github' && modelRegistry)
    ? (modelRegistry[activeProvider as 'gemini' | 'groq' | 'openai'] || [])
    : [];
  const currentApiKey = apiKeys[activeProvider] || '';
  const selectedModel = models.find((m: ModelEntry) => m.id === selectedModelId);

  const handleSave = () => {
    if (activeProvider === 'github') {
      const updatedKeys = { ...apiKeys, github: currentApiKey.trim(), github_token: currentApiKey.trim() };
      localStorage.setItem('hivemind_api_keys', JSON.stringify(updatedKeys));
      setGithubSaved(true);
      setTimeout(() => setGithubSaved(false), 3000);
      return;
    }
    if (!selectedModelId || !currentApiKey.trim()) return;
    const config: ModelConfig = {
      provider: activeProvider as 'gemini' | 'groq' | 'openai',
      modelId: selectedModelId,
      modelName: selectedModel?.name || selectedModelId,
      apiKey: currentApiKey.trim(),
    };
    // Persist API keys
    const updatedKeys = { ...apiKeys, [activeProvider]: currentApiKey.trim() };
    localStorage.setItem('hivemind_api_keys', JSON.stringify(updatedKeys));
    onSave(config);
    onClose();
  };

  const updateKey = (val: string) => {
    setApiKeys((prev) => ({ ...prev, [activeProvider]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0f1117] border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Gradient accent top bar */}
        <div className={`h-0.5 w-full bg-gradient-to-r ${meta.color.replace('/20', '')}`} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Model & Integrations</h2>
              <p className="text-xs text-slate-400">Configure AI models, API keys, and GitHub access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex h-[440px]">
          {/* Left: Provider tabs */}
          <div className="w-44 border-r border-slate-800 p-3 flex flex-col gap-1 flex-shrink-0">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Provider & Tools</p>
            {(Object.keys(PROVIDER_META) as ProviderType[]).map((provider) => {
              const pm = PROVIDER_META[provider];
              const isActive = provider === activeProvider;
              return (
                <button
                  key={provider}
                  onClick={() => setActiveProvider(provider)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all border ${
                    isActive
                      ? `${pm.activeBg}`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent'
                  }`}
                >
                  <span className={isActive ? pm.accent : 'text-slate-500'}>{pm.icon}</span>
                  {pm.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}

            {currentConfig && (
              <div className="mt-auto p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-[10px] text-slate-500 mb-1">Active Model</p>
                <p className="text-[11px] font-medium text-amber-400 truncate">{currentConfig.modelName}</p>
                <p className="text-[10px] text-slate-500 capitalize">{currentConfig.provider}</p>
              </div>
            )}
          </div>

          {/* Right: Model list + API key OR GitHub Integration Panel */}
          {activeProvider === 'github' ? (
            <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <GitPullRequest className="w-5 h-5" />
                  <h3 className="text-sm font-semibold text-slate-100">GitHub Agent Integration</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your GitHub Personal Access Token (PAT) to empower the Multi-Agent System with end-to-end repository capabilities.
                </p>

                <div className="grid grid-cols-1 gap-2.5 my-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <p className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                      <span>📁</span> Codebase RAG & Ingestion
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Index full repositories to ask questions about your codebase, search functions, and analyze architecture.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <p className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                      <span>🚀</span> Automated PRs & Code Edits
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Ask the Code Agent to fix bugs or build features, and it will branch, commit, and open a Pull Request directly on GitHub.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKeys.github || ''}
                      onChange={(e) => {
                        setGithubSaved(false);
                        updateKey(e.target.value);
                      }}
                      placeholder="ghp_... or github_pat_..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none font-mono pr-10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    🔗 Create a token at{' '}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 underline hover:text-purple-300"
                    >
                      github.com/settings/tokens
                    </a>{' '}
                    with <code className="text-amber-400">repo</code> scope.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleSave}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {githubSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      GitHub Token Saved!
                    </>
                  ) : (
                    'Save GitHub Token'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Model list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {meta.label} Models
                </p>

                {loadingModels ? (
                  <div className="flex items-center justify-center h-32 text-slate-500 text-xs">
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Loading models...
                  </div>
                ) : (
                  models.map((model: ModelEntry) => {
                    const isSelected = model.id === selectedModelId;
                    return (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModelId(model.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all group ${
                          isSelected
                            ? `bg-gradient-to-r ${meta.color} ${meta.border}`
                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? `${meta.border} ${meta.accent}` : 'border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold transition-colors ${isSelected ? meta.accent : 'text-slate-200'}`}>
                            {model.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{model.description}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* API Key input */}
              <div className="border-t border-slate-800 p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {meta.label} API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={currentApiKey}
                      onChange={(e) => updateKey(e.target.value)}
                      placeholder={meta.placeholder}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none font-mono pr-10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                    🔗 {meta.keyHint} — stored in browser only, never sent to our servers.
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!selectedModelId || !currentApiKey.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-md"
                >
                  {selectedModel ? `Use ${selectedModel.name}` : 'Select a Model'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
