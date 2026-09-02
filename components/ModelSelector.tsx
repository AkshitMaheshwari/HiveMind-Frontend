'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain, Zap, Cpu, Key, Check, Eye, EyeOff, ExternalLink,
  ChevronDown, Sparkles, RefreshCw, X, GitPullRequest, Mail, Info, ShieldCheck, ArrowRight
} from 'lucide-react';
import { getApiUrl } from '@/lib/config';

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

export type ProviderType = 'gemini' | 'groq' | 'openai' | 'github' | 'gmail';

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
    label: 'Gemini',
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
    label: 'GitHub',
    color: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-500/40',
    accent: 'text-purple-400',
    activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-400',
    icon: <GitPullRequest className="w-4 h-4" />,
    placeholder: 'ghp_... or github_pat_...',
    keyHint: 'Get from github.com/settings/tokens (repo scope)',
  },
  gmail: {
    label: 'Gmail',
    color: 'from-rose-500/20 to-red-500/20',
    border: 'border-rose-500/40',
    accent: 'text-rose-400',
    activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
    icon: <Mail className="w-4 h-4" />,
    placeholder: 'ya29.a0... (OAuth Token) or App Password',
    keyHint: 'From Google OAuth or Google App Passwords',
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
    gmail: '',
  });
  const [githubSaved, setGithubSaved] = useState(false);
  const [gmailSaved, setGmailSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [modelRegistry, setModelRegistry] = useState<ModelRegistry | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);
  const [gmailMethod, setGmailMethod] = useState<'app_password' | 'oauth'>('app_password');

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
        setApiKeys((prev) => ({
          ...prev,
          ...parsed,
          github: parsed.github_token || parsed.github || '',
          gmail: parsed.gmail_token || parsed.gmail || '',
        }));
      } catch {}
    }
  }, [isOpen]);

  // Fetch available models from backend
  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch(getApiUrl('/api/models'));
      if (res.ok) {
        const data: ModelRegistry = await res.json();
        setModelRegistry(data);
      }
    } catch (e) {
      console.error('Failed to fetch models from backend:', e);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    if (isOpen && !modelRegistry) {
      fetchModels();
    }
  }, [isOpen]);

  // Set default model on provider switch
  useEffect(() => {
    if (activeProvider !== 'github' && activeProvider !== 'gmail' && modelRegistry) {
      const providerModels = modelRegistry[activeProvider as 'gemini' | 'groq' | 'openai'] || [];
      if (providerModels.length > 0) {
        const isCurrentValid = providerModels.some((m: ModelEntry) => m.id === selectedModelId);
        if (!isCurrentValid) {
          setSelectedModelId(providerModels[0].id);
        }
      }
    }
  }, [activeProvider, modelRegistry, selectedModelId]);

  if (!isOpen) return null;

  const meta = PROVIDER_META[activeProvider];
  const models: ModelEntry[] = (activeProvider !== 'github' && activeProvider !== 'gmail' && modelRegistry)
    ? (modelRegistry[activeProvider as 'gemini' | 'groq' | 'openai'] || [])
    : [];
  const currentApiKey = apiKeys[activeProvider] || '';
  const selectedModel = models.find((m: ModelEntry) => m.id === selectedModelId);

  const handleSave = () => {
    if (activeProvider === 'github') {
      const updatedKeys = {
        ...apiKeys,
        github: currentApiKey.trim(),
        github_token: currentApiKey.trim(),
      };
      localStorage.setItem('hivemind_api_keys', JSON.stringify(updatedKeys));
      setGithubSaved(true);
      setTimeout(() => setGithubSaved(false), 3000);
      return;
    }

    if (activeProvider === 'gmail') {
      const updatedKeys = {
        ...apiKeys,
        gmail: currentApiKey.trim(),
        gmail_token: currentApiKey.trim(),
      };
      localStorage.setItem('hivemind_api_keys', JSON.stringify(updatedKeys));
      setGmailSaved(true);
      setTimeout(() => setGmailSaved(false), 3000);
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
      <div className="w-full max-w-2xl bg-[#0f1117] border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">LLM Provider & Integrations</h2>
              <p className="text-xs text-slate-400">Bring Your Own Key (BYOK) — Keys stored securely in local browser storage</p>
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
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Provider Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Select Provider / Integration
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(PROVIDER_META) as ProviderType[]).map((prov) => {
                const p = PROVIDER_META[prov];
                const isActive = activeProvider === prov;
                const hasKey = Boolean(apiKeys[prov]?.trim());
                return (
                  <button
                    key={prov}
                    onClick={() => setActiveProvider(prov)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isActive
                        ? p.activeBg + ' shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {p.icon}
                      <span className="truncate">{p.label}</span>
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

          {/* ══════════════ GMAIL INTEGRATION ONBOARDING GUIDE ══════════════ */}
          {activeProvider === 'gmail' && (
            <div className="space-y-4">
              {/* Method Switcher */}
              <div className="flex items-center justify-between p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setGmailMethod('app_password')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all ${
                    gmailMethod === 'app_password'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚡ Method 1: Google App Password (Recommended · 1 min)
                </button>
                <button
                  type="button"
                  onClick={() => setGmailMethod('oauth')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all ${
                    gmailMethod === 'oauth'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🏢 Method 2: Google Cloud OAuth 2.0 Token
                </button>
              </div>

              {/* Step-by-step instructions box */}
              {gmailMethod === 'app_password' ? (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-3 text-xs text-slate-300">
                  <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    How to get your Google App Password (Step-by-Step):
                  </div>
                  <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">1</span>
                      <div>
                        Enable <strong>2-Step Verification</strong> on your Google Account if not already enabled.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">2</span>
                      <div>
                        Open Google Security:{' '}
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-400 hover:text-rose-300 underline inline-flex items-center gap-0.5 font-semibold"
                        >
                          myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">3</span>
                      <div>
                        Enter App name as <strong>"HiveMind AI"</strong> and click <strong>Create</strong>.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">4</span>
                      <div>
                        Copy the generated <strong>16-character code</strong> and paste it in the field below.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-3 text-xs text-slate-300">
                  <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    How to get your Google Cloud OAuth Token:
                  </div>
                  <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">1</span>
                      <div>
                        Open{' '}
                        <a
                          href="https://console.cloud.google.com/apis/library/gmail.googleapis.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-400 hover:text-rose-300 underline inline-flex items-center gap-0.5 font-semibold"
                        >
                          Google Cloud Console <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>{' '}
                        and <strong>Enable Gmail API</strong>.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">2</span>
                      <div>
                        Configure OAuth consent screen with scope <code className="bg-slate-950 px-1 rounded text-rose-300 border border-slate-800">https://mail.google.com/</code>.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">3</span>
                      <div>
                        Generate your Bearer Access Token (or via OAuth Playground) and paste it below.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Key / Token Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                {meta.label} {activeProvider === 'gmail' ? 'Access Token / App Password' : (activeProvider === 'github' ? 'Personal Access Token' : 'API Key')}
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

          {/* Model Selector (Only for LLM providers, not github or gmail) */}
          {activeProvider !== 'github' && activeProvider !== 'gmail' && (
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

          {/* Gmail Feature Capabilities Note */}
          {activeProvider === 'gmail' && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2 text-slate-300">
              <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> What can the Gmail AI Agent do?
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li><strong>Inbox Triage:</strong> Read and summarize recent/unread messages with action items.</li>
                <li><strong>Search Emails:</strong> Find specific invoices, tickets, or client messages.</li>
                <li><strong>Draft AI Replies:</strong> Create personalized response drafts in your Gmail Drafts.</li>
                <li><strong>Send Messages:</strong> Compose and send live emails directly from chat.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex-shrink-0">
          <span className="text-[11px] text-slate-500">
            {activeProvider === 'github'
              ? (githubSaved ? '✅ GitHub Token Saved!' : 'Token saved locally in browser')
              : activeProvider === 'gmail'
              ? (gmailSaved ? '✅ Gmail Token Saved!' : 'Token saved locally in browser')
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
              disabled={
                activeProvider !== 'github' &&
                activeProvider !== 'gmail' &&
                (!currentApiKey.trim() || !selectedModelId)
              }
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 disabled:opacity-40 transition-all shadow-md"
            >
              {activeProvider === 'github'
                ? 'Save GitHub Token'
                : activeProvider === 'gmail'
                ? 'Save Gmail Token'
                : 'Apply & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
