'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot, User, Code, Eye, ExternalLink, ChevronDown, ChevronRight,
  Sparkles, Terminal, Copy, Check as CheckIcon
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'thinking';
  content?: string;
  events?: any[];
  streaming?: boolean;
}

interface ChatThreadProps {
  messages: ChatMessage[];
  onSubmitPrompt: (prompt: string) => void;
  loading: boolean;
  user: any;
  onOpenAuth: () => void;
}

// ─── Code block with copy button ─────────────────────────────────────────────

const CodeBlock: React.FC<{ children: string; language?: string }> = ({ children, language }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-slate-300 font-mono">
        <code>{children}</code>
      </pre>
    </div>
  );
};

// ─── Markdown renderer ────────────────────────────────────────────────────────

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => (
        <h1 className="text-lg font-bold text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-800">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-base font-semibold text-slate-100 mt-4 mb-2">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-sm font-semibold text-slate-200 mt-3 mb-1.5">{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className="text-sm font-medium text-slate-300 mt-2 mb-1">{children}</h4>
      ),
      p: ({ children }) => (
        <p className="text-sm leading-relaxed text-slate-300 mb-2 last:mb-0">{children}</p>
      ),
      ul: ({ children }) => (
        <ul className="my-2 space-y-1 pl-4">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="my-2 space-y-1 pl-4 list-decimal">{children}</ol>
      ),
      li: ({ children, ...props }: any) => (
        <li className="text-sm text-slate-300 leading-relaxed list-none flex gap-2">
          <span className="text-amber-500 mt-1.5 flex-shrink-0 select-none">•</span>
          <span>{children}</span>
        </li>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold text-slate-100">{children}</strong>
      ),
      em: ({ children }) => (
        <em className="italic text-slate-300">{children}</em>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
        >
          {children}
        </a>
      ),
      code: ({ inline, className, children }: any) => {
        const lang = className?.replace('language-', '');
        if (inline) {
          return (
            <code className="px-1.5 py-0.5 rounded-md bg-slate-800 text-amber-300 text-[12px] font-mono border border-slate-700">
              {children}
            </code>
          );
        }
        return <CodeBlock language={lang}>{String(children).replace(/\n$/, '')}</CodeBlock>;
      },
      pre: ({ children }) => <>{children}</>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-amber-500/50 pl-4 my-3 text-slate-400 italic">
          {children}
        </blockquote>
      ),
      hr: () => <hr className="border-slate-800 my-4" />,
      table: ({ children }) => (
        <div className="overflow-x-auto my-3 rounded-xl border border-slate-800">
          <table className="w-full text-xs">{children}</table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-slate-900/80 text-slate-300 font-medium">{children}</thead>
      ),
      tbody: ({ children }) => (
        <tbody className="divide-y divide-slate-800">{children}</tbody>
      ),
      tr: ({ children }) => <tr className="hover:bg-slate-900/40">{children}</tr>,
      th: ({ children }) => (
        <th className="px-3 py-2 text-left text-[11px] uppercase tracking-wider">{children}</th>
      ),
      td: ({ children }) => (
        <td className="px-3 py-2 text-slate-300">{children}</td>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

// ─── Typing cursor ────────────────────────────────────────────────────────────
const TypingCursor: React.FC = () => (
  <span className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 animate-pulse align-text-bottom" />
);

// ─── Main ChatThread ──────────────────────────────────────────────────────────

export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  onSubmitPrompt,
  loading,
  user,
  onOpenAuth,
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeTabs, setActiveTabs] = useState<Record<string, 'report' | 'preview'>>({});
  const [showLogs, setShowLogs] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) { onOpenAuth(); return; }
    if (!prompt.trim() || loading) return;
    onSubmitPrompt(prompt);
    setPrompt('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const extractHtml = (content: string) => {
    if (!content) return null;
    const regex = /```(?:html|xml)?\s*\n([\s\S]*?)```/gi;
    const match = regex.exec(content);
    if (match) return match[1].trim();
    if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
      const start = content.indexOf('<!DOCTYPE') !== -1 ? content.indexOf('<!DOCTYPE') : content.indexOf('<html');
      const end = content.indexOf('</html>');
      if (start !== -1 && end !== -1) return content.substring(start, end + 7);
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

  const handleExampleClick = (p: string) => {
    if (!user) { onOpenAuth(); } else { onSubmitPrompt(p); }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-[var(--bg-main)] relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-full text-center space-y-6 pt-16">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 amber-glow mb-2">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Start a new task</h2>
            <p className="text-sm text-slate-400 max-w-lg">
              Delegate complex tasks, web generation, data engineering, and more to your autonomous AI swarm.
            </p>

            {!user && (
              <div className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl max-w-md w-full text-center space-y-3 shadow-lg">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">🔒 Authentication Required</div>
                <p className="text-xs text-slate-300">You must sign in or create an account to start chatting and managing isolated tasks.</p>
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl text-xs transition-all shadow-md"
                >
                  Sign In / Create Account
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mt-4">
              <button
                onClick={() => handleExampleClick("Build a modern landing page for my college fest using Next.js and Tailwind CSS.")}
                className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-amber-400 text-sm mb-1 group-hover:translate-x-0.5 transition-transform">
                  🌐 UI Generation
                </div>
                <div className="text-xs text-slate-400">Build a modern landing page for my college fest.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Write a Python script to scrape news articles.")}
                className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-emerald-400 text-sm mb-1 group-hover:translate-x-0.5 transition-transform">
                  🐍 Python Scripting
                </div>
                <div className="text-xs text-slate-400">Write a Python web scraper for news articles.</div>
              </button>

              <button
                onClick={() => handleExampleClick("What is the TRACER arxiv paper about?")}
                className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-blue-400 text-sm mb-1 group-hover:translate-x-0.5 transition-transform">
                  🔬 Research
                </div>
                <div className="text-xs text-slate-400">Ask about arxiv papers, topics, or research.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Write a compelling blog post about the future of AI agents.")}
                className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-purple-400 text-sm mb-1 group-hover:translate-x-0.5 transition-transform">
                  ✍️ Content
                </div>
                <div className="text-xs text-slate-400">Blog posts, copywriting, and SEO content.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Analyze AAPL fundamentals and technical indicators.")}
                className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-rose-400 text-sm mb-1 group-hover:translate-x-0.5 transition-transform">
                  📈 Financial Analysis
                </div>
                <div className="text-xs text-slate-400">Stock fundamentals, technicals, and news.</div>
              </button>
              
              <button
                onClick={() => handleExampleClick("Can you analyze this dataset and plot the correlation matrix?")}
                className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-cyan-400 text-sm mb-1 group-hover:translate-x-0.5 transition-transform">
                  📊 Data Analysis
                </div>
                <div className="text-xs text-slate-400">Data engineering, EDA, and statistics.</div>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const htmlContent = msg.content ? extractHtml(msg.content) : null;
            const currentTab = activeTabs[msg.id] || 'report';
            const logsOpen = showLogs[msg.id] || false;

            // Extract chart data if present in events
            const chartEvent = msg.events?.find(e => e.event === 'charts_json');
            let chartsData = null;
            if (chartEvent && chartEvent.data) {
              try {
                chartsData = JSON.parse(chartEvent.data);
              } catch (e) {
                console.error("Failed to parse chart data", e);
              }
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                        ? 'bg-amber-500/15 border-amber-500/30 text-slate-100 ml-auto max-w-lg text-left'
                        : 'bg-[var(--bg-card)] border-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.role === 'thinking' ? (
                      <div className="flex items-center gap-2 text-amber-400/90 text-xs">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>CEO Agent is analyzing prompt and assigning department teams...</span>
                      </div>
                    ) : msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
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

                        {currentTab === 'report' ? (
                          <MarkdownContent content={msg.content || ''} />
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
                      <div>
                        <MarkdownContent content={msg.content || ''} />
                        {msg.streaming && <TypingCursor />}
                      </div>
                    )}
                  </div>

                  {/* Render Charts if present */}
                  {chartsData && chartsData.map((chart: any, i: number) => (
                    <div key={i} className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                      <h4 className="text-sm font-semibold text-slate-200 mb-4">{chart.title || 'Chart'}</h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} 
                              itemStyle={{ color: '#fbbf24' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={2} dot={false} />
                            {chart.lines?.map((lineKey: string, idx: number) => (
                               <Line key={idx} type="monotone" dataKey={lineKey} stroke={['#38bdf8', '#34d399', '#a78bfa'][idx % 3]} strokeWidth={2} dot={false} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}

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
        <div ref={bottomRef} />
      </div>

      {/* Input Box Area */}
      <div className="p-4 border-t border-slate-800 bg-[var(--bg-surface)]">
        {!user ? (
          <div className="max-w-4xl mx-auto flex items-center justify-between p-3 bg-slate-900/90 border border-amber-500/30 rounded-2xl">
            <span className="text-xs text-slate-300 font-medium pl-2">🔒 Please sign in to chat and run agent tasks.</span>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-xs rounded-xl shadow transition-all hover:brightness-110"
            >
              Sign In to Chat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={1}
                placeholder="Ask anything — research, code, content, web generation... (Shift+Enter for newline)"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-5 pr-5 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all resize-none overflow-hidden leading-relaxed"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex-shrink-0 p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl disabled:opacity-40 transition-all mb-0.5"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}
        <p className="text-center text-[10px] text-slate-600 mt-2">
          Press Enter to send · Shift+Enter for newline · HiveMind AI processes your request with multiple specialized agents
        </p>
      </div>
    </div>
  );
};
