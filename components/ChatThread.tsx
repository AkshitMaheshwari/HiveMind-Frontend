'use client';

import React, { useState } from 'react';
import { Bot, User, Code, Eye, ExternalLink, ChevronDown, ChevronRight, Sparkles, Terminal } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'thinking';
  content?: string;
  events?: any[];
}

interface ChatThreadProps {
  messages: ChatMessage[];
  onSubmitPrompt: (prompt: string) => void;
  loading: boolean;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ messages, onSubmitPrompt, loading }) => {
  const [prompt, setPrompt] = useState('');
  const [activeTabs, setActiveTabs] = useState<Record<string, 'report' | 'preview'>>({});
  const [showLogs, setShowLogs] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onSubmitPrompt(prompt);
    setPrompt('');
  };

  const extractHtml = (content: string) => {
    if (!content) return null;
    const regex = /```(?:html|xml)?\s*\n([\s\S]*?)```/gi;
    const match = regex.exec(content);
    if (match) return match[1].trim();

    if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
      const start = content.indexOf('<!DOCTYPE') !== -1 ? content.indexOf('<!DOCTYPE') : content.indexOf('<html');
      const end = content.indexOf('</html>');
      if (start !== -1 && end !== -1) {
        return content.substring(start, end + 7);
      }
    }
    return null;
  };

  const openFullscreen = (htmlCode: string) => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(`<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  ${htmlCode}
</body>
</html>`);
      win.document.close();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[var(--bg-main)]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto my-auto py-16">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 amber-glow">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">HiveMind Multi-Agent Assistant</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Delegate complex coding, web design, content creation, and research tasks to specialized AI agent teams.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md text-left">
              <button
                onClick={() => onSubmitPrompt("Build a modern college fest website named ANUGGONJ with dark theme")}
                className="p-3 bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 rounded-xl text-xs text-slate-300 transition-all hover:bg-slate-800/40"
              >
                🌐 College Fest Web App
              </button>
              <button
                onClick={() => onSubmitPrompt("Create a Python data scraping script with documentation")}
                className="p-3 bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 rounded-xl text-xs text-slate-300 transition-all hover:bg-slate-800/40"
              >
                🐍 Python Web Scraper
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const htmlContent = msg.content ? extractHtml(msg.content) : null;
            const currentTab = activeTabs[msg.id] || 'report';
            const logsOpen = showLogs[msg.id] || false;

            return (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-4xl mx-auto ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role !== 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div className={`flex-1 max-w-3xl ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-5 border text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-500/15 border-amber-500/30 text-slate-100 ml-auto max-w-lg'
                        : 'bg-[var(--bg-card)] border-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.role === 'thinking' ? (
                      <div className="flex items-center gap-2 text-amber-400/90 text-xs">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>CEO Agent is analyzing prompt and assigning department teams...</span>
                      </div>
                    ) : htmlContent ? (
                      <div>
                        {/* Tab Controls */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveTabs({ ...activeTabs, [msg.id]: 'report' })}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                currentTab === 'report'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <Code className="w-3.5 h-3.5" />
                              Report & Code
                            </button>
                            <button
                              onClick={() => setActiveTabs({ ...activeTabs, [msg.id]: 'preview' })}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                currentTab === 'preview'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Live Preview
                            </button>
                          </div>
                          <button
                            onClick={() => openFullscreen(htmlContent)}
                            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Fullscreen
                          </button>
                        </div>

                        {/* Content Body */}
                        {currentTab === 'report' ? (
                          <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                            <iframe
                              className="w-full h-full border-0"
                              srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></head><body>${htmlContent}</body></html>`}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>

                  {/* Collapsible Execution Events */}
                  {msg.events && msg.events.length > 0 && (
                    <div className="mt-2 text-left">
                      <button
                        onClick={() => setShowLogs({ ...showLogs, [msg.id]: !logsOpen })}
                        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-amber-400 font-mono transition-all"
                      >
                        {logsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        <Terminal className="w-3 h-3" />
                        <span>Execution Steps ({msg.events.length} agent events)</span>
                      </button>

                      {logsOpen && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1 max-h-48 overflow-y-auto">
                          {msg.events.map((ev, i) => (
                            <div key={i} className="flex gap-2 text-slate-300">
                              <span className="text-amber-400/80">[{ev.department || 'CEO'}]</span>
                              <span className="text-slate-400">{ev.agent || 'Orchestrator'}:</span>
                              <span className="text-slate-200">{ev.data}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 flex-shrink-0 mt-1">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Box Area */}
      <div className="p-4 border-t border-slate-800 bg-[var(--bg-surface)]">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            placeholder="Delegate a task to your AI company (e.g. Build a landing page, Python code, SEO analysis)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-5 pr-14 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-2 p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl disabled:opacity-40 transition-all"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
