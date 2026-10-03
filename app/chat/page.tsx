'use client';

import { apiKeyStorage } from '@/lib/api-key-storage';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { ChatThread } from '@/components/ChatThread';
import dynamic from 'next/dynamic';
const AdminView = dynamic(() => import('@/components/AdminView').then(m => m.AdminView));
import { AuthModal } from '@/components/AuthModal';
import { ModelSelector, ModelConfig } from '@/components/ModelSelector';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getApiUrl } from '@/lib/config';
import { watchTask, TaskEvent, DepartmentProgress, updateDepartmentProgress } from '@/lib/task-stream';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'thinking';
  content?: string;
  events?: any[];
  streaming?: boolean;
}

interface Conversation {
  conversation_id: string;
  first_message: string;
  last_updated: string;
  message_count: number;
}

// Generate a stable UUID for conversation tracking
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const isAdminTab = searchParams.get('tab') === 'admin';

  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [modelSelectorTab, setModelSelectorTab] = useState<'gemini' | 'groq' | 'openai' | 'github' | 'gmail'>('gemini');
  const [hasGitHubToken, setHasGitHubToken] = useState(false);
  const [hasGmailToken, setHasGmailToken] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);

  // Conversation-level state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const streamCleanup = useRef<(() => void) | null>(null);
  const activeTaskRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const [mode, setMode] = useState<'fast' | 'balanced' | 'thorough'>('balanced');
  const [departments, setDepartments] = useState<DepartmentProgress[]>([]);
  const [activity, setActivity] = useState('');
  const [mobileHistory, setMobileHistory] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  useEffect(() => () => streamCleanup.current?.(), []);
  const activeConvRef = useRef<string | null>(null);

  // Keep ref in sync (avoids stale closures inside WebSocket callbacks)
  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  // ── Model config ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const savedKeys = apiKeyStorage.getItem('hivemind_api_keys');
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

  const handleSaveModel = (config: ModelConfig) => {
    setModelConfig(config);
    localStorage.setItem('hivemind_selected_model', config.modelId);
    localStorage.setItem('hivemind_selected_provider', config.provider);
    localStorage.setItem('hivemind_selected_model_name', config.modelName);
    const existingKeys = JSON.parse(apiKeyStorage.getItem('hivemind_api_keys') || '{}');
    existingKeys[config.provider] = config.apiKey;
    apiKeyStorage.setItem('hivemind_api_keys', JSON.stringify(existingKeys));
    setHasGitHubToken(Boolean(existingKeys.github || existingKeys.github_token));
    setHasGmailToken(Boolean(existingKeys.gmail || existingKeys.gmail_token));
  };

  const getApiKeysForRequest = () => {
    let saved: Record<string, string> = {};
    try {
      const raw = apiKeyStorage.getItem('hivemind_api_keys');
      if (raw) saved = JSON.parse(raw);
    } catch {}

    return {
      google_api_key: saved.gemini || (modelConfig?.provider === 'gemini' ? modelConfig.apiKey : undefined),
      groq_api_key: saved.groq || (modelConfig?.provider === 'groq' ? modelConfig.apiKey : undefined),
      openai_api_key: saved.openai || (modelConfig?.provider === 'openai' ? modelConfig.apiKey : undefined),
      github_token: saved.github_token || saved.github || undefined,
      gmail_token: saved.gmail_token || saved.gmail || undefined,
    };
  };

  // ── Auth ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
      else setAuthModalOpen(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAuthModalOpen(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch conversation list (sidebar) ─────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setConversations([]); return; }
      const headers: Record<string, string> = {};
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
      const res = await fetch(getApiUrl('/api/conversations'), { headers });
      if (res.ok) setConversations(await res.json());
    } catch (e) {
      console.error('Failed to fetch conversations:', e);
    }
  }, []);

  useEffect(() => {
    if (user) fetchConversations();
    else setConversations([]);
  }, [user?.id, fetchConversations]);

  // Check for prefilled prompt launched from dashboard
  useEffect(() => {
    if (typeof window !== 'undefined' && user && modelConfig && !loading && messages.length === 0) {
      const prefilled = sessionStorage.getItem('hivemind_prefilled_prompt');
      if (prefilled) {
        sessionStorage.removeItem('hivemind_prefilled_prompt');
        handleSubmitPrompt(prefilled);
      }
    }
  }, [user, modelConfig, loading, messages.length]);

  // ── Load a full conversation thread when clicking sidebar ─────────────────────
  const detachStream = () => {
    streamCleanup.current?.();
    streamCleanup.current = null;
    activeTaskRef.current = null;
    submittingRef.current = false;
    setLoading(false);
    setActivity('');
    setDepartments([]);
  };

  const subscribeToTask = (taskId: string, conversationId: string, token: string) => {
    streamCleanup.current?.();
    activeTaskRef.current = taskId;
    const messageId = `stream-${taskId}`;
    let content = '';
    let events: TaskEvent[] = [];
    let frame: ReturnType<typeof setTimeout> | undefined;
    const current = () => activeConvRef.current === conversationId && activeTaskRef.current === taskId;
    const render = (streaming: boolean) => {
      clearTimeout(frame);
      frame = undefined;
      if (!current()) return;
      setMessages(previous => {
        const filtered = previous.filter(message => message.id !== 'thinking');
        const result: ChatMessage = { id: messageId, role: 'assistant', content, streaming, events: [...events] };
        return filtered.some(message => message.id === messageId)
          ? filtered.map(message => message.id === messageId ? result : message)
          : [...filtered, result];
      });
    };
    const dispose = watchTask(taskId, token, event => {
      if (!current()) return;
      setDepartments(previous => updateDepartmentProgress(previous, event));
      if (event.event === 'partial_output') {
        content = event.data || '';
        if (!frame) frame = setTimeout(() => render(true), 50);
      } else if (event.event === 'error') {
        content = content ? `${content}\n\n**Could not finish:** ${event.data}` : event.data || 'Could not finish this task.';
        setCanRetry(true);
        render(false);
      } else if (event.event === 'task_cancelled') {
        content = content ? `${content}\n\n*Stopped.*` : 'Stopped. You can edit your request and try again.';
        render(false);
      } else {
        if (event.event !== 'connection_status') {
          const duplicate = events.some(item => event.id ? item.id === event.id : item.event === event.event && item.data === event.data);
          if (!duplicate) events = [...events, event];
        }
        if (event.event !== 'charts_json' && event.event !== 'metrics') setActivity(event.data || 'Working...');
        if (content && !frame) frame = setTimeout(() => render(true), 50);
      }
    }, () => {
      if (!current()) return;
      render(false);
      submittingRef.current = false;
      activeTaskRef.current = null;
      setLoading(false);
      setCancelling(false);
      setActivity('');
      void fetchConversations();
    });
    streamCleanup.current = () => { clearTimeout(frame); dispose(); };
  };

  const handleSelectConversation = async (conversationId: string) => {
    if (!user) { setAuthModalOpen(true); return; }
    detachStream();
    setMobileHistory(false);
    activeConvRef.current = conversationId;
    setActiveConversationId(conversationId);
    setCanRetry(false);
    setMessages([]);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const response = await fetch(getApiUrl(`/api/conversation/${conversationId}/messages`), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Could not load conversation.');
      const turns = await response.json();
      if (activeConvRef.current !== conversationId) return;
      const loaded: ChatMessage[] = [];
      for (const turn of turns) {
        loaded.push({ id: `user-${turn.task_id}`, role: 'user', content: turn.user_request });
        if (turn.final_output || turn.error || turn.status === 'cancelled') {
          loaded.push({ id: `stream-${turn.task_id}`, role: 'assistant', content: turn.final_output || turn.error || 'Stopped.' });
        }
      }
      setMessages(loaded);
      const running = [...turns].reverse().find(turn => ['running', 'queued'].includes(turn.status));
      if (running) {
        setActivity('Reconnecting to your running task...');
        submittingRef.current = true;
        subscribeToTask(running.task_id, conversationId, token);
      } else setLoading(false);
    } catch (error) {
      if (activeConvRef.current === conversationId) {
        setActivity(error instanceof Error ? error.message : 'Could not load conversation.');
        setLoading(false);
      }
    }
  };

  const handleNewChat = () => {
    setMobileHistory(false);
    detachStream();
    activeConvRef.current = null;
    setActiveConversationId(null);
    setMessages([]);
    setCanRetry(false);
  };

  const handleConversationDeleted = async (conversationId: string) => {
    if (activeConversationId === conversationId) handleNewChat();
    fetchConversations();
  };

  // ── Submit prompt ─────────────────────────────────────────────────────────────
  const handleSubmitPrompt = async (prompt: string) => {
    if (!user) { setAuthModalOpen(true); return; }
    if (!modelConfig) { setModelSelectorOpen(true); return; }
    if (submittingRef.current || !prompt.trim()) return;
    submittingRef.current = true;
    const conversationId = activeConversationId || generateUUID();
    activeConvRef.current = conversationId;
    setActiveConversationId(conversationId);
    setLastPrompt(prompt);
    setCanRetry(false);
    setLoading(true);
    setActivity('Sending your request...');
    setDepartments([]);
    setMessages(previous => [...previous, { id: `user-${generateUUID()}`, role: 'user', content: prompt }]);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const response = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ message: prompt, conversation_id: conversationId,
          api_keys: getApiKeysForRequest(), selected_model: modelConfig.modelId, mode }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.detail === 'string' ? body.detail : `Request failed (${response.status}).`);
      }
      const data = await response.json();
      if (activeConvRef.current !== conversationId) return;
      subscribeToTask(data.task_id, conversationId, token);
    } catch (error) {
      if (activeConvRef.current !== conversationId) return;
      setActivity(error instanceof Error ? error.message : 'Could not start task.');
      setCanRetry(true);
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleStop = async () => {
    const taskId = activeTaskRef.current;
    if (!taskId || cancelling) return;
    setCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(getApiUrl(`/api/task/${taskId}/cancel`), {
        method: 'POST', headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });
      if (!response.ok) throw new Error('Could not stop the task. Please retry.');
    } catch (error) {
      setActivity(error instanceof Error ? error.message : 'Could not stop the task.');
    } finally { setCancelling(false); }
  };

  const handleSignOut = async () => {
    detachStream();
    activeConvRef.current = null;
    await supabase.auth.signOut();
    setUser(null);
    setMessages([]);
    setConversations([]);
    setActiveConversationId(null);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-main)] font-sans antialiased text-slate-100">
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
        activeTab={isAdminTab ? 'admin' : 'chat'}
        setActiveTab={(t) => {
          if (t === 'admin') window.location.href = '/chat?tab=admin';
          else if (t === 'dashboard') window.location.href = '/';
          else if (t === 'documents') window.location.href = '/documents';
          else window.location.href = '/chat';
        }}
        selectedModelName={modelConfig?.modelName}
      />

      {!isAdminTab && <div className="md:hidden flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs shrink-0">
        <button type="button" onClick={() => setMobileHistory(value => !value)} aria-expanded={mobileHistory} className="text-slate-300 py-1">{mobileHistory ? 'Close history' : 'History & files'}</button>
        <button type="button" onClick={handleNewChat} className="text-amber-400 py-1">New chat</button>
      </div>}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {isAdminTab ? (
          <AdminView user={user} />
        ) : (
          <>
            {mobileHistory && <button aria-label="Close history" onClick={() => setMobileHistory(false)} className="md:hidden absolute inset-0 z-30 bg-black/60" />}
            <div className={`${mobileHistory ? 'absolute inset-y-0 left-0 z-40 block' : 'hidden'} md:static md:block md:h-full`}>
            <Sidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onConversationDeleted={handleConversationDeleted}
              user={user}
            />
            </div>
            <ChatThread
              mode={mode}
              onModeChange={setMode}
              departments={departments}
              activity={activity}
              onStop={handleStop}
              cancelling={cancelling}
              onRetry={canRetry ? () => handleSubmitPrompt(lastPrompt) : undefined}
              messages={messages}
              onSubmitPrompt={handleSubmitPrompt}
              loading={loading}
              user={user}
              onOpenAuth={() => setAuthModalOpen(true)}
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
            />
          </>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          fetchConversations();
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

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#0a0d14] flex items-center justify-center text-amber-400 font-mono text-xs">Loading HiveMind...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
