'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { ChatThread } from '@/components/ChatThread';
import { AdminView } from '@/components/AdminView';
import { AuthModal } from '@/components/AuthModal';
import { ModelSelector, ModelConfig } from '@/components/ModelSelector';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

export default function ChatPage() {
  const searchParams = useSearchParams();
  const isAdminTab = searchParams.get('tab') === 'admin';

  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);

  // Conversation-level state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const activeConvRef = useRef<string | null>(null);

  // Keep ref in sync (avoids stale closures inside WebSocket callbacks)
  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  // ── Model config ─────────────────────────────────────────────────────────────
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

  const handleSaveModel = (config: ModelConfig) => {
    setModelConfig(config);
    localStorage.setItem('hivemind_selected_model', config.modelId);
    localStorage.setItem('hivemind_selected_provider', config.provider);
    localStorage.setItem('hivemind_selected_model_name', config.modelName);
    const existingKeys = JSON.parse(localStorage.getItem('hivemind_api_keys') || '{}');
    existingKeys[config.provider] = config.apiKey;
    localStorage.setItem('hivemind_api_keys', JSON.stringify(existingKeys));
  };

  const getApiKeysForRequest = () => {
    if (!modelConfig) return undefined;
    const keyMap: Record<string, string> = {
      gemini: 'google_api_key',
      groq: 'groq_api_key',
      openai: 'openai_api_key',
    };
    return { [keyMap[modelConfig.provider]]: modelConfig.apiKey };
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
      const res = await fetch('http://localhost:8000/api/conversations', { headers });
      if (res.ok) setConversations(await res.json());
    } catch (e) {
      console.error('Failed to fetch conversations:', e);
    }
  }, []);

  useEffect(() => {
    if (user) fetchConversations();
    else setConversations([]);
  }, [user, fetchConversations]);

  // ── Load a full conversation thread when clicking sidebar ─────────────────────
  const handleSelectConversation = async (conversationId: string) => {
    if (!user) { setAuthModalOpen(true); return; }
    if (wsRef.current) wsRef.current.close();
    setActiveConversationId(conversationId);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch(
        `http://localhost:8000/api/conversation/${conversationId}/messages`,
        { headers }
      );

      if (res.ok) {
        const turns: any[] = await res.json();
        const newMessages: ChatMessage[] = [];

        turns.forEach((turn, idx) => {
          if (turn.user_request) {
            newMessages.push({
              id: `user-${idx}`,
              role: 'user',
              content: turn.user_request,
            });
          }
          if (turn.final_output) {
            newMessages.push({
              id: `assistant-${idx}`,
              role: 'assistant',
              content: turn.final_output,
            });
          }
        });

        setMessages(newMessages);
      }
    } catch (e) {
      console.error('Failed to load conversation:', e);
    } finally {
      setLoading(false);
    }
  };

  // ── New chat ──────────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    if (wsRef.current) wsRef.current.close();
    setActiveConversationId(null);
    setMessages([]);
  };

  // ── Delete conversation (all tasks in it) ─────────────────────────────────────
  const handleConversationDeleted = async (conversationId: string) => {
    if (activeConversationId === conversationId) handleNewChat();
    fetchConversations();
  };

  // ── Submit prompt ─────────────────────────────────────────────────────────────
  const handleSubmitPrompt = async (prompt: string) => {
    if (!user) { setAuthModalOpen(true); return; }
    if (!modelConfig) { setModelSelectorOpen(true); return; }

    // Determine conversation: reuse active or create new one
    const conversationId = activeConversationId || generateUUID();
    if (!activeConversationId) setActiveConversationId(conversationId);

    setLoading(true);
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: prompt },
      { id: 'thinking', role: 'thinking' },
    ]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: prompt,
          conversation_id: conversationId,
          api_keys: getApiKeysForRequest(),
          selected_model: modelConfig?.modelId,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const taskId = data.task_id;

      // Open WebSocket for real-time streaming
      const wsUrl = `ws://localhost:8000/ws/${taskId}?token=${encodeURIComponent(accessToken)}`;
      if (wsRef.current) wsRef.current.close();
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      const streamMsgId = `stream-${taskId}`;
      let eventsList: any[] = [];

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          if (parsed.event === 'partial_output') {
            setMessages((prev) => {
              const existing = prev.find((m) => m.id === streamMsgId);
              if (existing) {
                return prev.map((m) =>
                  m.id === streamMsgId ? { ...m, content: parsed.data, streaming: true } : m
                );
              } else {
                return prev
                  .filter((m) => m.id !== 'thinking')
                  .concat([{ id: streamMsgId, role: 'assistant', content: parsed.data, streaming: true }]);
              }
            });
            return;
          }

          eventsList.push(parsed);

          if (parsed.event === 'task_done') {
            setMessages((prev) =>
              prev
                .map((m) =>
                  m.id === streamMsgId ? { ...m, streaming: false, events: eventsList } : m
                )
                .filter((m) => m.id !== 'thinking')
            );
            setLoading(false);
            // Refresh sidebar to show/update conversation entry
            fetchConversations();
          }

          if (parsed.event === 'error') {
            setMessages((prev) =>
              prev
                .filter((m) => m.id !== 'thinking' && m.id !== streamMsgId)
                .concat([{ id: 'err-' + Date.now(), role: 'assistant', content: `❌ **Error:** ${parsed.data}` }])
            );
            setLoading(false);
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      socket.onerror = () => {
        setLoading(false);
        setMessages((prev) => prev.filter((m) => m.id !== 'thinking'));
      };

    } catch (e: any) {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== 'thinking')
          .concat([{ id: 'err', role: 'assistant', content: `❌ **Error starting task:** ${e.message}` }])
      );
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
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
        onOpenSettings={() => setModelSelectorOpen(true)}
        activeTab={isAdminTab ? 'admin' : 'chat'}
        setActiveTab={(t) => {
          if (t === 'admin') window.location.href = '/chat?tab=admin';
          else if (t === 'dashboard') window.location.href = '/';
          else if (t === 'documents') window.location.href = '/documents';
          else window.location.href = '/chat';
        }}
        selectedModelName={modelConfig?.modelName}
      />

      <div className="flex flex-1 overflow-hidden">
        {isAdminTab ? (
          <AdminView user={user} />
        ) : (
          <>
            <Sidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              onConversationDeleted={handleConversationDeleted}
              user={user}
            />
            <ChatThread
              messages={messages}
              onSubmitPrompt={handleSubmitPrompt}
              loading={loading}
              user={user}
              onOpenAuth={() => setAuthModalOpen(true)}
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
      />
    </div>
  );
}
