'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { ChatThread } from '@/components/ChatThread';
import { AdminView } from '@/components/AdminView';
import { AuthModal } from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'thinking';
  content?: string;
  events?: any[];
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'admin'>('chat');

  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

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

  // Fetch user task history
  const fetchTasks = async () => {
    try {
      const headers: Record<string, string> = {};
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('http://localhost:8000/api/tasks', { headers });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Load single task details
  const handleSelectTask = async (taskId: string) => {
    setActiveTaskId(taskId);
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`http://localhost:8000/api/task/${taskId}`, { headers });
      if (res.ok) {
        const task = await res.json();
        if (task && !task.error) {
          const newMessages: ChatMessage[] = [];
          if (task.user_request) {
            newMessages.push({ id: 'req', role: 'user', content: task.user_request });
          }
          if (task.final_output) {
            newMessages.push({
              id: 'res',
              role: 'assistant',
              content: task.final_output,
              events: task.events || [],
            });
          }
          setMessages(newMessages);
        }
      }
    } catch (e) {
      console.error('Failed to load task details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveTaskId(null);
    setMessages([]);
    if (ws) ws.close();
  };

  // Submit Prompt to Start Task
  const handleSubmitPrompt = async (prompt: string) => {
    setLoading(true);
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: prompt }]);
    setMessages((prev) => [...prev, { id: 'thinking', role: 'thinking' }]);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: prompt }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const taskId = data.task_id;
      setActiveTaskId(taskId);

      // Refresh task list
      fetchTasks();

      // Connect WebSocket
      const socket = new WebSocket(`ws://localhost:8000/ws/${taskId}`);
      setWs(socket);

      let eventsList: any[] = [];
      let finalReport = '';

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          eventsList.push(parsed);

          if (parsed.event === 'final_output') {
            finalReport = parsed.data || '';
          }

          if (parsed.event === 'task_done') {
            setMessages((prev) =>
              prev.filter((m) => m.id !== 'thinking').concat([
                {
                  id: taskId,
                  role: 'assistant',
                  content: finalReport || 'Task completed successfully.',
                  events: eventsList,
                },
              ])
            );
            setLoading(false);
            fetchTasks();
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      socket.onerror = () => {
        setLoading(false);
      };
    } catch (e: any) {
      setMessages((prev) =>
        prev.filter((m) => m.id !== 'thinking').concat([
          { id: 'err', role: 'assistant', content: `❌ **Error starting task:** ${e.message}` },
        ])
      );
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMessages([]);
    setTasks([]);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-main)] font-sans antialiased text-slate-100">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenSettings={() => alert('API Keys can be configured in your browser localStorage or via .env')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <>
            <Sidebar
              tasks={tasks}
              activeTaskId={activeTaskId}
              onSelectTask={handleSelectTask}
              onNewChat={handleNewChat}
              user={user}
            />
            <ChatThread
              messages={messages}
              onSubmitPrompt={handleSubmitPrompt}
              loading={loading}
            />
          </>
        ) : (
          <AdminView user={user} />
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          fetchTasks();
        }}
      />
    </div>
  );
}
