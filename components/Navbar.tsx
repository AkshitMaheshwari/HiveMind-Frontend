'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User, LogIn, LogOut, Shield, Key, Sparkles, Layers, ChevronDown, Library,
  Volume2, VolumeX, Activity, GitPullRequest, Mail, CheckCircle2, Zap
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface NavbarProps {
  user: any;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSettings: (tab?: 'gemini' | 'groq' | 'openai' | 'github' | 'gmail') => void;
  onOpenGitHub?: () => void;
  hasGitHubToken?: boolean;
  onOpenGmail?: () => void;
  hasGmailToken?: boolean;
  activeTab: 'dashboard' | 'chat' | 'admin' | 'documents';
  setActiveTab: (tab: 'dashboard' | 'chat' | 'admin' | 'documents') => void;
  selectedModelName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onOpenSettings,
  onOpenGitHub,
  hasGitHubToken,
  onOpenGmail,
  hasGmailToken,
  activeTab,
  setActiveTab,
  selectedModelName,
}) => {
  const [sfxEnabled, setSfxEnabled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const integrationsRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';

  useEffect(() => {
    setSfxEnabled(soundFx.isEnabled());
    
    // Close dropdowns on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (integrationsRef.current && !integrationsRef.current.contains(e.target as Node)) {
        setIntegrationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSfx = () => {
    const newState = soundFx.toggle();
    setSfxEnabled(newState);
  };

  const handleTabClick = (tab: 'dashboard' | 'chat' | 'admin' | 'documents') => {
    soundFx.playClick();
    setActiveTab(tab);
  };

  const activeIntegrationsCount = (hasGitHubToken ? 1 : 0) + (hasGmailToken ? 1 : 0);

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* ─── Left: Brand ─── */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={() => handleTabClick('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 amber-glow transition-transform group-hover:scale-105 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-100 tracking-tight text-sm">
              HiveMind<span className="text-amber-400">.AI</span>
            </span>
            <span className="hidden sm:inline-flex text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400/90 border border-amber-500/20">
              Swarm
            </span>
          </div>
        </button>
      </div>

      {/* ─── Center: Sleek Segmented Navigation Tabs ─── */}
      <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 shadow-inner">
        <button
          onClick={() => handleTabClick('dashboard')}
          onMouseEnter={() => soundFx.playHover()}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => handleTabClick('chat')}
          onMouseEnter={() => soundFx.playHover()}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => handleTabClick('documents')}
          onMouseEnter={() => soundFx.playHover()}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'documents'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          <span>Docs</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => handleTabClick('admin')}
            onMouseEnter={() => soundFx.playHover()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* ─── Right: Integrations, Model Selector, SFX & User Profile ─── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Live Integrations Popover Pill */}
        <div className="relative" ref={integrationsRef}>
          <button
            onClick={() => setIntegrationsOpen(!integrationsOpen)}
            onMouseEnter={() => soundFx.playHover()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all shadow-sm ${
              activeIntegrationsCount > 0
                ? 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-amber-500/40'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Live Swarm Integrations (GitHub & Gmail)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-[11px]">Integrations</span>
            
            {/* Active dots */}
            <div className="flex items-center gap-1 ml-0.5">
              <span className={`w-2 h-2 rounded-full ${hasGitHubToken ? 'bg-purple-400 shadow-sm shadow-purple-500/50' : 'bg-slate-700'}`} title={hasGitHubToken ? 'GitHub Active' : 'GitHub Not Connected'} />
              <span className={`w-2 h-2 rounded-full ${hasGmailToken ? 'bg-rose-400 shadow-sm shadow-rose-500/50' : 'bg-slate-700'}`} title={hasGmailToken ? 'Gmail Active' : 'Gmail Not Connected'} />
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Integrations Quick Dropdown */}
          {integrationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 space-y-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
                Connected Swarm Tools
              </div>

              {/* GitHub Item */}
              <button
                onClick={() => {
                  setIntegrationsOpen(false);
                  if (onOpenGitHub) onOpenGitHub();
                  else onOpenSettings('github');
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-purple-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <GitPullRequest className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">GitHub & DevOps</div>
                    <div className="text-[10px] text-slate-400">Repo trees, code & PRs</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                  hasGitHubToken
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {hasGitHubToken ? 'Active 🟢' : 'Connect'}
                </span>
              </button>

              {/* Gmail Item */}
              <button
                onClick={() => {
                  setIntegrationsOpen(false);
                  if (onOpenGmail) onOpenGmail();
                  else onOpenSettings('gmail');
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 border border-transparent hover:border-rose-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Gmail & Inbox</div>
                    <div className="text-[10px] text-slate-400">Read, summarize & draft</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                  hasGmailToken
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {hasGmailToken ? 'Active 🟢' : 'Connect'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Model Selector Chip */}
        <button
          onClick={() => {
            soundFx.playClick();
            onOpenSettings();
          }}
          onMouseEnter={() => soundFx.playHover()}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all text-slate-200 shadow-sm group"
          title="Configure AI Model & Keys"
        >
          <Key className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform flex-shrink-0" />
          <span className="max-w-[110px] sm:max-w-[140px] truncate text-[11px] font-medium">
            {selectedModelName || 'Select Model'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
        </button>

        {/* SFX Audio Toggle */}
        <button
          onClick={handleToggleSfx}
          title={sfxEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          className={`p-1.5 rounded-xl border transition-all ${
            sfxEnabled
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-500 hover:text-slate-300'
          }`}
        >
          {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* User Profile / Auth */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <div className="text-xs font-semibold text-slate-200 truncate">{user.email}</div>
                  <div className="text-[10px] text-amber-400/90 font-mono capitalize mt-0.5 flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    {isAdmin ? 'Administrator' : 'Standard User'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors text-left"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  API Keys & Models
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    soundFx.playClick();
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenAuth();
            }}
            onMouseEnter={() => soundFx.playHover()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md transition-all hover:shadow-amber-500/25"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
