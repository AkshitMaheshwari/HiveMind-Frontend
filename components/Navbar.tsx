'use client';

import React, { useState, useEffect } from 'react';
import {
  User, LogIn, LogOut, Shield, Key, Sparkles, Layers, ChevronDown, Library,
  Volume2, VolumeX, Activity
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface NavbarProps {
  user: any;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
  activeTab: 'dashboard' | 'chat' | 'admin' | 'documents';
  setActiveTab: (tab: 'dashboard' | 'chat' | 'admin' | 'documents') => void;
  selectedModelName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onOpenSettings,
  activeTab,
  setActiveTab,
  selectedModelName,
}) => {
  const [sfxEnabled, setSfxEnabled] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';

  useEffect(() => {
    setSfxEnabled(soundFx.isEnabled());
  }, []);

  const handleToggleSfx = () => {
    const newState = soundFx.toggle();
    setSfxEnabled(newState);
  };

  const handleTabClick = (tab: 'dashboard' | 'chat' | 'admin' | 'documents') => {
    soundFx.playClick();
    setActiveTab(tab);
  };

  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-xl px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & App Title */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center text-amber-400 amber-glow transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" title="Swarm Core Active" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-slate-100 tracking-wide text-base">HiveMind AI</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
              Enterprise Swarm
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal">Autonomous Multi-Agent Orchestrator</p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-[var(--border-subtle)] shadow-inner">
        <button
          onClick={() => handleTabClick('dashboard')}
          onMouseEnter={() => soundFx.playHover()}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Dashboard
        </button>

        <button
          onClick={() => handleTabClick('chat')}
          onMouseEnter={() => soundFx.playHover()}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'chat'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Chat & Swarm
        </button>

        <button
          onClick={() => handleTabClick('documents')}
          onMouseEnter={() => soundFx.playHover()}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'documents'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          My Documents
        </button>

        {isAdmin && (
          <button
            onClick={() => handleTabClick('admin')}
            onMouseEnter={() => soundFx.playHover()}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin Portal
          </button>
        )}
      </div>

      {/* Right Controls: SFX, Model Selector & Auth */}
      <div className="flex items-center gap-2.5">
        {/* Audio SFX Toggle */}
        <button
          onClick={handleToggleSfx}
          title={sfxEnabled ? 'Mute Micro-interactions' : 'Enable Sci-Fi Audio FX'}
          className={`p-2 rounded-xl border transition-all ${
            sfxEnabled
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-850'
          }`}
        >
          {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Model Selector Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenSettings();
          }}
          onMouseEnter={() => soundFx.playHover()}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 border border-[var(--border-subtle)] hover:border-amber-500/30 transition-all group shadow-sm"
        >
          <Key className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
          {selectedModelName ? (
            <span className="flex items-center gap-1.5 text-slate-200">
              <span className="max-w-[120px] truncate">{selectedModelName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />
            </span>
          ) : (
            <span className="text-slate-300">Select Model</span>
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shadow-inner">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{user.email}</div>
                <div className="flex items-center gap-1 text-[10px] text-amber-400/90 font-mono capitalize">
                  <Shield className="w-2.5 h-2.5" />
                  {isAdmin ? 'Admin' : 'User'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                onSignOut();
              }}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenAuth();
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md transition-all hover:shadow-amber-500/25"
          >
            <LogIn className="w-4 h-4" />
            Sign In / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};
