'use client';

import React from 'react';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Task {
  task_id: str;
  user_request: string;
  status: string;
  created_at: string;
}

interface SidebarProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onNewChat: () => void;
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  activeTaskId,
  onSelectTask,
  onNewChat,
  user,
}) => {
  return (
    <aside className="w-64 h-[calc(100vh-4rem)] bg-[var(--bg-surface)] border-r border-slate-800 flex flex-col flex-shrink-0">
      {/* New Chat Button */}
      <div className="p-4 border-b border-slate-800/80">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-medium text-xs rounded-xl transition-all shadow-sm group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          New Agent Orchestration
        </button>
      </div>

      {/* History Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Task History
        </span>
        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
          {user ? 'My Tasks' : 'Guest'}
        </span>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {tasks.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No previous tasks found
          </div>
        ) : (
          tasks.map((task) => {
            const isActive = activeTaskId === task.task_id;
            return (
              <button
                key={task.task_id}
                onClick={() => onSelectTask(task.task_id)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/30 text-slate-100'
                    : 'bg-slate-900/30 border-transparent hover:bg-slate-800/50 hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-xs font-medium truncate mb-1 text-slate-200">
                  {task.user_request || 'Untitled Task'}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    {task.status === 'done' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    {task.status === 'running' && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
                    {task.status === 'error' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                    {task.status === 'queued' && <Clock className="w-3 h-3 text-slate-400" />}
                    <span className="capitalize">{task.status}</span>
                  </div>
                  <span>{task.created_at ? new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
