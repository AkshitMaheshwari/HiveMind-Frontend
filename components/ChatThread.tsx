'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot, User, Code, Eye, ExternalLink, ChevronDown, ChevronRight,
  Sparkles, Terminal, Copy, Check as CheckIcon, GitPullRequest
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
  onOpenGitHub?: () => void;
  hasGitHubToken?: boolean;
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

function cleanMarkdownText(content: string): string {
  if (!content) return '';
  const str = content.trim();
  
  if (
    (str.startsWith("[{'type': 'text'") || str.startsWith('[{"type": "text"') ||
     str.startsWith("{'type': 'text'") || str.startsWith('{"type": "text"')) &&
    (str.includes("'text':") || str.includes('"text":'))
  ) {
    const match = str.match(/['"]text['"]\s*:\s*(['"])([\s\S]*?)\1\s*,\s*['"]extras['"]/);
    if (match && match[2]) {
      return match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
    try {
      const fixed = str.replace(/'/g, '"');
      const parsed = JSON.parse(fixed);
      if (Array.isArray(parsed) && parsed[0]?.text) return parsed[0].text;
      if (parsed.text) return parsed.text;
    } catch {}
  }
  return content;
}

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
      code: ({ className, children, ...props }: any) => {
        return (
          <code className="px-1.5 py-0.5 rounded-md bg-slate-800 text-amber-300 text-[12px] font-mono border border-slate-700" {...props}>
            {children}
          </code>
        );
      },
      pre: (preProps: any) => {
        const codeElement = preProps.children;
        if (React.isValidElement(codeElement)) {
          const { className, children } = codeElement.props as any;
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const extractText = (node: any): string => {
            if (typeof node === 'string') return node;
            if (typeof node === 'number') return String(node);
            if (Array.isArray(node)) return node.map(extractText).join('');
            if (React.isValidElement(node) && (node.props as any)?.children) {
              return extractText((node.props as any).children);
            }
            return '';
          };
          const codeString = extractText(children).replace(/\n$/, '');
          return <CodeBlock language={language}>{codeString}</CodeBlock>;
        }
        return <pre className="overflow-x-auto my-3 p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono text-slate-300">{preProps.children}</pre>;
      },
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
    {cleanMarkdownText(content)}
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
  onOpenGitHub,
  hasGitHubToken,
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    onSubmitPrompt(prompt.trim());
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Helper to extract HTML code block
  const extractHtml = (content: string): string | null => {
    const htmlRegex = /```html\n([\s\S]*?)```/i;
    const match = content.match(htmlRegex);
    if (match && match[1]) return match[1];

    if (content.includes('<!DOCTYPE html>') || (content.includes('<html') && content.includes('</html>'))) {
      return content;
    }
    return null;
  };

  const openFullscreen = (html: string) => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Preview</title>
</head>
<body style="margin:0;padding:0;">
  ${html}
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

            {/* GitHub & DevOps Featured Integration Banner */}
            <div className="w-full max-w-4xl p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/80 border border-purple-500/30 shadow-xl text-left relative overflow-hidden backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0 shadow-inner">
                    <GitPullRequest className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100">🐙 GitHub & DevOps Swarm Agent</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Live Integration
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Inspect live repository trees, read codebase files, commit features, and open Pull Requests directly from chat.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenGitHub) onOpenGitHub();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 ${
                    hasGitHubToken
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white hover:shadow-purple-500/25'
                  }`}
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  {hasGitHubToken ? 'GitHub Token Active ⚙️' : 'Connect GitHub Token'}
                </button>
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-purple-500/20 text-xs">
                <span className="text-[11px] text-purple-300/80 font-medium">Try asking:</span>
                <button
                  onClick={() => handleExampleClick("Show me the project structure of AkshitMaheshwari/portfolio")}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[11px] transition-all hover:border-purple-400 font-mono"
                >
                  📁 Show project structure of AkshitMaheshwari/portfolio
                </button>
                <button
                  onClick={() => handleExampleClick("Inspect my portfolio repository and summarize its architecture")}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[11px] transition-all hover:border-purple-400"
                >
                  🔍 Inspect my portfolio repository
                </button>
                <button
                  onClick={() => handleExampleClick("In my repository owner/repo, fix the typo in README.md and open a PR")}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[11px] transition-all hover:border-purple-400"
                >
                  🚀 Fix bug & open Pull Request
                </button>
              </div>
            </div>

            {/* Starter Mission Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-4xl mt-3">
              <button
                onClick={() => handleExampleClick("Create a 3-year go-to-market strategy, competitive analysis, and pitch deck for an AI analytics startup.")}
                className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-amber-400 text-xs mb-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                  🏢 Business Strategy
                </div>
                <div className="text-[11px] text-slate-400">GTM plans, SWOT matrix, and 9-slide investor pitch decks.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Review this SaaS service agreement for liability risks and draft a GDPR compliance checklist.")}
                className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-violet-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-violet-400 text-xs mb-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                  ⚖️ Legal & Compliance
                </div>
                <div className="text-[11px] text-slate-400">Contract clause reviews, ToS drafting, and regulatory checklists.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Write a 4-email personalized cold outreach sequence targeting enterprise CTOs with objection handling.")}
                className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-rose-400 text-xs mb-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                  📧 Sales & Outreach
                </div>
                <div className="text-[11px] text-slate-400">Lead profiling, high-converting copy, and follow-up cadences.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Create a complete brand identity guide with hex palettes, typography, and logo concepts for a modern fintech app.")}
                className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-fuchsia-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-fuchsia-400 text-xs mb-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                  🎨 Brand & Design
                </div>
                <div className="text-[11px] text-slate-400">Design systems, logo concepts, and visual guidelines.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Search my uploaded documents and summarize the key clauses and SLA commitments.")}
                className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-sky-400 text-xs mb-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                  📄 Document RAG Q&A
                </div>
                <div className="text-[11px] text-slate-400">Instant answers with source citations from your uploaded files.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Build an interactive financial dashboard using Next.js, Tailwind CSS, and Recharts.")}
                className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-purple-400 text-xs mb-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                  💻 Software Engineering
                </div>
                <div className="text-[11px] text-slate-400">Full-stack web applications, Python algorithms, and debugging.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Analyze NVDA and MSFT fundamentals, technical indicators (RSI, MACD), and recent earnings sentiment.")}
                className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-amber-300 text-xs mb-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                  📈 Financial Analysis
                </div>
                <div className="text-[11px] text-slate-400">Live OHLCV market metrics, technical analysis, and reports.</div>
              </button>

              <button
                onClick={() => handleExampleClick("Perform exploratory data analysis on our customer metrics, calculate correlations, and visualize trends.")}
                className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition-all hover:bg-slate-800/60 group"
              >
                <div className="font-semibold text-cyan-400 text-xs mb-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-1.5">
                  📊 Data Analytics
                </div>
                <div className="text-[11px] text-slate-400">Statistical data profiling, KPI calculations, and chart generation.</div>
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
                        <span>{msg.content || 'CEO Agent is analyzing prompt and assigning department teams...'}</span>
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

                        {/* Content Body */}
                        {currentTab === 'report' ? (
                          <MarkdownContent content={msg.content || ''} />
                        ) : (
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-white min-h-[400px]">
                            <iframe
                              srcDoc={htmlContent}
                              title="preview"
                              className="w-full h-[500px] border-0"
                              sandbox="allow-scripts allow-same-origin"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <MarkdownContent content={msg.content || ''} />
                    )}

                    {/* Chart Visualization if chartsData present */}
                    {chartsData && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <h4 className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-2">
                          📊 Generated Analytics Chart
                        </h4>
                        <div className="h-64 w-full bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartsData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                              <YAxis stroke="#94a3b8" fontSize={11} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                              {Object.keys(chartsData[0] || {})
                                .filter(key => key !== 'name')
                                .map((key, index) => {
                                  const colors = ['#f59e0b', '#06b6d4', '#10b981', '#ec4899', '#8b5cf6'];
                                  return (
                                    <Line
                                      key={key}
                                      type="monotone"
                                      dataKey={key}
                                      stroke={colors[index % colors.length]}
                                      strokeWidth={2}
                                      dot={{ fill: colors[index % colors.length], r: 3 }}
                                      activeDot={{ r: 5 }}
                                    />
                                  );
                                })}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Agent Execution Logs Collapsible */}
                  {msg.events && msg.events.length > 0 && (
                    <div className="mt-2 text-left">
                      <button
                        onClick={() => setShowLogs({ ...showLogs, [msg.id]: !logsOpen })}
                        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-amber-400 transition-colors font-medium"
                      >
                        {logsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <Terminal className="w-3 h-3" />
                        <span>Execution Steps ({msg.events.length} agent events)</span>
                      </button>

                      {logsOpen && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 font-mono text-[11px] max-h-56 overflow-y-auto">
                          {msg.events.map((ev, i) => {
                            const badgeStyle =
                              ev.department === 'code' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              ev.department === 'research' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              ev.department === 'finance' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-slate-800 text-slate-400 border-slate-700';

                            return (
                              <div key={i} className="flex items-start gap-2 text-slate-300">
                                <span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase font-semibold flex-shrink-0 ${badgeStyle}`}>
                                  {ev.department || 'CEO'}
                                </span>
                                <span className="text-slate-400 flex-shrink-0">{ev.agent || 'Orchestrator'}:</span>
                                <span className="text-slate-200 break-words">{ev.data}</span>
                              </div>
                            );
                          })}
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
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Quick Agent Tool Badges */}
            <div className="flex items-center justify-between px-1 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenGitHub?.()}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    hasGitHubToken
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-purple-300 hover:border-purple-500/30'
                  }`}
                >
                  <GitPullRequest className="w-3 h-3 text-purple-400" />
                  <span>{hasGitHubToken ? 'GitHub Active' : 'Connect GitHub'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrompt('Show me the project structure of ')}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                >
                  <span>📁 Repo Tree</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrompt('In repository owner/repo, ')}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                >
                  <span>🚀 Open PR</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                Swarm Core · Live DevOps Mode
              </span>
            </div>

            <form onSubmit={handleSubmit} className="relative flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handlePromptChange}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  rows={1}
                  placeholder="Ask anything — 'Show structure of owner/repo', code, research, pitch decks... (Shift+Enter for newline)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-5 pr-5 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all resize-none overflow-hidden leading-relaxed"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="flex-shrink-0 p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl disabled:opacity-40 transition-all mb-0.5 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
        <p className="text-center text-[10px] text-slate-600 mt-2">
          Press Enter to send · Shift+Enter for newline · HiveMind AI processes your request with multiple specialized agents
        </p>
      </div>
    </div>
  );
};
