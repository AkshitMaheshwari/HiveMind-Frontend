'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Activity, Users, Database, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface AdminViewProps {
  user: any;
}

export const AdminView: React.FC<AdminViewProps> = ({ user }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminTasks = async () => {
    setLoading(true);
    try {
      const token = user?.access_token || '';
      const res = await fetch('http://localhost:8000/api/admin/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error('Failed to fetch admin tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminTasks();
  }, []);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const runningTasks = tasks.filter((t) => t.status === 'running').length;
  const errorTasks = tasks.filter((t) => t.status === 'error').length;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-main)]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Admin Control Portal</h2>
              <p className="text-xs text-slate-400">System-wide Multi-Agent Orchestration & Metrics Overview</p>
            </div>
          </div>
          <button
            onClick={fetchAdminTasks}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Total System Tasks</div>
              <div className="text-2xl font-bold text-slate-100">{totalTasks}</div>
            </div>
            <Activity className="w-8 h-8 text-amber-400/60" />
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Completed Tasks</div>
              <div className="text-2xl font-bold text-emerald-400">{doneTasks}</div>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400/60" />
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Active Executions</div>
              <div className="text-2xl font-bold text-amber-400">{runningTasks}</div>
            </div>
            <Clock className="w-8 h-8 text-amber-400/60" />
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Errors</div>
              <div className="text-2xl font-bold text-rose-400">{errorTasks}</div>
            </div>
            <AlertCircle className="w-8 h-8 text-rose-400/60" />
          </div>
        </div>

        {/* System Tasks Table */}
        <div className="bg-[var(--bg-card)] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">All User Tasks History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                  <th className="pb-3 px-3">Task ID</th>
                  <th className="pb-3 px-3">User Request</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">User Email</th>
                  <th className="pb-3 px-3">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tasks.map((t) => (
                  <tr key={t.id || t.task_id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono text-slate-400">{ (t.id || t.task_id)?.substring(0, 8) }...</td>
                    <td className="py-3 px-3 text-slate-200 font-medium max-w-xs truncate">{t.user_request}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        t.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        t.status === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{t.profiles?.email || t.user_id || 'System User'}</td>
                    <td className="py-3 px-3 text-slate-400">{t.created_at ? new Date(t.created_at).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
