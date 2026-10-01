'use client';

import React from 'react';
import {
  GitPullRequest, Mail, CheckCircle2, ArrowRight,
  FolderTree, GitCommit, FileCode, Search, Inbox, Send, Sparkles,
  Zap
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface IntegrationsShowcaseProps {
  hasGitHubToken: boolean;
  hasGmailToken: boolean;
  onOpenGitHub: () => void;
  onOpenGmail: () => void;
  onLaunchPrompt: (prompt: string) => void;
}

export const IntegrationsShowcase: React.FC<IntegrationsShowcaseProps> = ({
  hasGitHubToken,
  hasGmailToken,
  onOpenGitHub,
  onOpenGmail,
  onLaunchPrompt,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[11px] font-semibold mb-1">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>Native Tool Ecosystem</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Live Workspace Integrations
          </h2>
          <p className="text-xs text-slate-400">
            Connect your developer repositories and communication channels directly to the autonomous swarm.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* GitHub Swarm Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-slate-950 border border-purple-500/30 p-6 flex flex-col justify-between shadow-xl hover:border-purple-500/60 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner group-hover:scale-105 transition-transform">
                  <GitPullRequest className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">GitHub Swarm Integration</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      hasGitHubToken
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {hasGitHubToken ? '● Connected' : '○ Not Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Autonomous Codebase & Repository Agent</p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenGitHub();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-semibold transition-all shadow-sm"
              >
                {hasGitHubToken ? 'Manage Token' : 'Connect GitHub'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-purple-500/20">
              <div className="flex items-center gap-2">
                <FolderTree className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Recursive Directory Tree Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>File Inspection & Semantic Search</span>
              </div>
              <div className="flex items-center gap-2">
                <GitCommit className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Automated File Edits & Commit Push</span>
              </div>
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>Autonomous Pull Request Generation</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-semibold text-purple-300/80 uppercase tracking-wider">
                Instant Swarm Commands:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onLaunchPrompt('Show me the complete project directory structure and architecture for my repository AkshitMaheshwari/portfolio')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs transition-all hover:border-purple-400 font-mono flex items-center gap-1.5 text-left"
                >
                  <span>📁 Inspect Repo Architecture</span>
                </button>
                <button
                  onClick={() => onLaunchPrompt('In my repository owner/repo, review recent commits and create a PR fixing open issue descriptions')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs transition-all hover:border-purple-400 flex items-center gap-1.5 text-left"
                >
                  <span>🚀 Open Automated PR</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gmail Swarm Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 border border-rose-500/30 p-6 flex flex-col justify-between shadow-xl hover:border-rose-500/60 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">Gmail Swarm Integration</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      hasGmailToken
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {hasGmailToken ? '● Connected' : '○ Not Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Autonomous Inbox Triage & Communication Agent</p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenGmail();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-semibold transition-all shadow-sm"
              >
                {hasGmailToken ? 'Manage Account' : 'Connect Gmail'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-rose-500/20">
              <div className="flex items-center gap-2">
                <Inbox className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>Unread Email Triage & Summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>Search Invoices, Receipts & Clients</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>AI Draft Generation & Smart Replies</span>
              </div>
              <div className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>Thread Parsing & Action Item Extraction</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-semibold text-rose-300/80 uppercase tracking-wider">
                Instant Swarm Commands:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onLaunchPrompt('Check all my unread emails from today, group them by sender priority, and provide an executive summary')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs transition-all hover:border-rose-400 flex items-center gap-1.5 text-left"
                >
                  <span>📬 Triage Unread Emails</span>
                </button>
                <button
                  onClick={() => onLaunchPrompt('Search my emails for recent invoices or billing statements and list their totals')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs transition-all hover:border-rose-400 flex items-center gap-1.5 text-left"
                >
                  <span>🔍 Search Invoices & Billing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
