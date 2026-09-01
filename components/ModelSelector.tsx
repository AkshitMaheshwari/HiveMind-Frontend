'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain, Zap, Cpu, Key, Check, Eye, EyeOff, ExternalLink,
  ChevronDown, Sparkles, RefreshCw, X, GitPullRequest
} from 'lucide-react';

export interface ModelConfig {
  provider: 'gemini' | 'groq' | 'openai';
  modelId: string;
  modelName: string;
  apiKey: string;
}

export interface ModelEntry {
  id: string;
  name: string;
  context_length?: number;
  description?: string;
}

export interface ModelRegistry {
  gemini: ModelEntry[];
  groq: ModelEntry[];
  openai: ModelEntry[];
}

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ModelConfig) => void;
  currentConfig: ModelConfig | null;
  initialTab?: ProviderType;
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
  initialTab,
}) => {
  const [activeProvider, setActiveProvider] = useState<ProviderType>(
    initialTab || currentConfig?.provider || 'gemini'
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

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveProvider(initialTab);
    }
  }, [isOpen, initialTab]);

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

  // Fetch available models from backend
  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch('http://localhost:8000/api/models');
      if (res.ok) {
        const data: ModelRegistry = await res.json();
        setModelRegistry(data);
        // Default model for current provider if none selected
        if (!selectedModelId && activeProvider !== 'github') {
          const providerModels = data[activeProvider as 'gemini' | 'groq' | 'openai'] || [];
          if (providerModels.length > 0) {
            setSelectedModelId(providerModels[0].id);
          }
        }
      }
    } catch {
      // Fallback static list if backend unreachable
      setModelRegistry({
        gemini: [
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Recommended)' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
        ],
        groq: [
          { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Versatile)' },
          { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Instant)' },
          { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
        ],
        openai: [
          { id: 'gpt-4o', name: 'GPT-4o (Omni)' },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        ],
      });
      if (!selectedModelId && activeProvider !== 'github') {
        setSelectedModelId(
          activeProvider === 'gemini' ? 'gemini-2.0-flash'
          : activeProvider === 'groq'   ? 'llama-3.3-70b-versatile'
          : 'gpt-4o'
        );
      }
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchModels();
  }, [isOpen]);

  // When switching provider, set default model if current selection isn't in that provider
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">LLM Provider & Model Configuration</h2>
              <p className="text-xs text-slate-400">Bring Your Own Key (BYOK) — Keys stored securely in browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Provider Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Select Provider / Integration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(PROVIDER_META) as ProviderType[]).map((prov) => {
                const p = PROVIDER_META[prov];
                const isActive = activeProvider === prov;
                const hasKey = Boolean(apiKeys[prov]?.trim());
                return (
                  <button
                    key={prov}
                    onClick={() => setActiveProvider(prov)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isActive
                        ? p.activeBg + ' shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {p.icon}
                      <span>{p.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasKey ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Ready
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">No Key</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                {meta.label} API Key / Token
              </label>
              <span className="text-[11px] text-slate-500">{meta.keyHint}</span>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={currentApiKey}
                onChange={(e) => updateKey(e.target.value)}
                placeholder={meta.placeholder}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Model Selector (Only for LLM providers, not github token) */}
          {activeProvider !== 'github' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Select {meta.label} Model
                </label>
                <button
                  onClick={fetchModels}
                  disabled={loadingModels}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingModels ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loadingModels ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse">
                  Fetching live models from backend...
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {models.map((model) => {
                    const isSelected = selectedModelId === model.id;
                    return (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModelId(model.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-slate-100">{model.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{model.id}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* GitHub Explanation Note */}
          {activeProvider === 'github' && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-2 text-slate-300">
              <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                <GitPullRequest className="w-4 h-4" /> Live GitHub Repository Operations
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Your Personal Access Token (PAT) enables the HiveMind AI Swarm to inspect live repositories, analyze code trees, create branches, commit code, and open Pull Requests directly from chat.
              </p>
              <div className="text-[10px] text-purple-400/90 font-mono">
                Required Scopes: <code className="bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/60">repo</code> (Full control of private & public repositories)
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <span className="text-[11px] text-slate-500">
            {activeProvider === 'github'
              ? (githubSaved ? '✅ GitHub Token Saved!' : 'Token saved locally in browser')
              : (currentApiKey ? '✅ Key loaded' : '⚠️ Key required to run')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={activeProvider !== 'github' && (!currentApiKey.trim() || !selectedModelId)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 disabled:opacity-40 transition-all shadow-md"
            >
              {activeProvider === 'github' ? 'Save GitHub Token' : 'Apply & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
