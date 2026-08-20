'use client';

import React, { useState } from 'react';
import {
  MessageSquare, Plus, MessagesSquare, Clock, Trash2, AlertTriangle, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DocumentUpload } from '@/components/DocumentUpload';
import { soundFx } from '@/lib/soundFx';

interface Conversation {
  conversation_id: string;
  first_message: string;
  last_updated: string;
  message_count: number;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  onConversationDeleted: (conversationId: string) => void;
  user: any;
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
const ConfirmDeleteModal: React.FC<{
  conversation: Conversation;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}> = ({ conversation, onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div className="w-full max-w-sm bg-[#0f1117] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden">
      <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 to-red-600" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Delete Conversation</h3>
            <p className="text-xs text-slate-400">All messages in this thread will be removed.</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            "{conversation.first_message}"
          </p>
          <div className="flex items-center gap-2 mt-2">
            <MessagesSquare className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">{conversation.message_count} messages</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {deleting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</>
            ) : (
              <><Trash2 className="w-3.5 h-3.5" /> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onConversationDeleted,
  user,
}) => {
  const [confirmConv, setConfirmConv] = useState<Conversation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setConfirmConv(conv);
  };

  const handleConfirmDelete = async () => {
    if (!confirmConv || !user) return;
    setDeleting(true);
    setDeletingId(confirmConv.conversation_id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      // Fetch all task IDs in this conversation then delete each one
      const res = await fetch(
        `http://localhost:8000/api/conversation/${confirmConv.conversation_id}/messages`,
        { headers }
      );

      if (res.ok) {
        const tasks: any[] = await res.json();
        await Promise.all(
          tasks.map(async (task) => {
            if (!task.task_id) return;
            await supabase.from('task_events').delete().eq('task_id', task.task_id);
            await supabase.from('tasks').delete().eq('id', task.task_id);
          })
        );
      }

      onConversationDeleted(confirmConv.conversation_id);
    } catch (e) {
      console.error('Delete conversation failed:', e);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeleting(false);
      setDeletingId(null);
      setConfirmConv(null);
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <aside className="w-64 h-[calc(100vh-4rem)] bg-[var(--bg-surface)] border-r border-slate-800 flex flex-col flex-shrink-0">
        {/* New Chat Button */}
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <button
            onClick={() => {
              soundFx.playClick();
              onNewChat();
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-xl transition-all shadow-sm group hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            New Agent Orchestration
          </button>
        </div>

        {/* History Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Conversations
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
            {user ? `${conversations.length}` : 'Guest'}
          </span>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {!user ? (
            <div className="p-4 text-center text-xs text-slate-500 space-y-2">
              <div>🔒 Log in to view your conversation history</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConversationId === conv.conversation_id;
              const isBeingDeleted = deletingId === conv.conversation_id;

              return (
                <div
                  key={conv.conversation_id}
                  className={`relative group w-full rounded-xl border transition-all ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-900/30 border-transparent hover:bg-slate-800/50 hover:border-slate-800'
                  } ${isBeingDeleted ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  {/* Clickable conversation area */}
                  <button
                    onClick={() => onSelectConversation(conv.conversation_id)}
                    className="w-full text-left p-3 pr-10"
                  >
                    {/* First message preview */}
                    <div className="flex items-start gap-2 mb-1">
                      <MessageSquare className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-medium text-slate-200 line-clamp-2 leading-snug">
                        {conv.first_message || 'Untitled Conversation'}
                      </span>
                    </div>
                    {/* Meta row */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pl-5">
                      <span className="flex items-center gap-1">
                        <MessagesSquare className="w-2.5 h-2.5" />
                        {conv.message_count} msg{conv.message_count !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(conv.last_updated)}
                      </span>
                    </div>
                  </button>

                  {/* Delete button — appears on hover */}
                  <button
                    onClick={(e) => handleDeleteClick(e, conv)}
                    title="Delete conversation"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Document Upload Panel */}
        <DocumentUpload user={user} />
      </aside>

      {/* Delete Confirm Modal */}
      {confirmConv && (
        <ConfirmDeleteModal
          conversation={confirmConv}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmConv(null)}
          deleting={deleting}
        />
      )}
    </>
  );
};
