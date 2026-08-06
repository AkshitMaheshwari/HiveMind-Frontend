'use client';

import React from 'react';
import { User, LogIn, LogOut, Shield, Key, Sparkles, Layers } from 'lucide-react';

interface NavbarProps {
  user: any;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
  activeTab: 'chat' | 'admin';
  setActiveTab: (tab: 'chat' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onOpenSettings,
  activeTab,
  setActiveTab,
}) => {
  const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';

  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md px-6 flex items-center justify-between z-30">
      {/* Brand & App Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 amber-glow">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-slate-100 tracking-wide text-base">HiveMind AI</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Enterprise v2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal">Multi-Agent Orchestrator Platform</p>
        </div>
      </div>

      {/* Center Tabs: Main Chat vs Admin View */}
      <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Agent Dashboard
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin Portal
          </button>
        )}
      </div>

      {/* Right Controls: API Keys & Auth */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-all"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          API Keys
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/20 flex items-center justify-center text-slate-200 font-semibold text-xs">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-slate-200 truncate max-w-[120px]">{user.email}</div>
                <div className="flex items-center gap-1 text-[10px] text-amber-400/90 font-mono capitalize">
                  <Shield className="w-2.5 h-2.5" />
                  {isAdmin ? 'Admin' : 'User'}
                </div>
              </div>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold shadow-md transition-all"
          >
            <LogIn className="w-4 h-4" />
            Sign In / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};
