'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot, User, Code, Eye, ExternalLink, ChevronDown, ChevronRight,
  Sparkles, Terminal, Copy, Check as CheckIcon, GitPullRequest, Mail,
  ArrowUpRight, Zap, TrendingUp, FileText, ArrowRight
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
  onOpenGmail?: () => void;
  hasGmailToken?: boolean;
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
      code: ({ node, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !match && typeof children === 'string' && !children.includes('\n');
        if (isInline) {
          return (
            <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs border border-slate-700/50" {...props}>
              {children}
            </code>
          );
        }
        return <CodeBlock language={match ? match[1] : ''}>{String(children).replace(/\n$/, '')}</CodeBlock>;
      },
      table: ({ children }) => (
        <div className="overflow-x-auto my-3 rounded-xl border border-slate-800">
          <table className="w-full text-xs text-slate-300 border-collapse">{children}</table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-200">{children}</thead>
      ),
      th: ({ children }) => (
        <th className="px-3 py-2 text-left font-semibold">{children}</th>
      ),
      td: ({ children }) => (
        <td className="px-3 py-2 border-t border-slate-800/60">{children}</td>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-amber-500/50 pl-3 my-2 text-slate-400 italic text-xs">
          {children}
        </blockquote>
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
    }}
  >
    {cleanMarkdownText(content)}
  </ReactMarkdown>
);

// ─── Main ChatThread Component ────────────────────────────────────────────────
export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  onSubmitPrompt,
  loading,
  user,
  onOpenAuth,
  onOpenGitHub,
  hasGitHubToken,
  onOpenGmail,
  hasGmailToken,
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeTabs, setActiveTabs] = useState<Record<string, 'report' | 'preview'>>({});
  const [showLogs, setShowLogs] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
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

  const extractHtml = (content: string): string | null => {
    if (!content) return null;

    // 1. Check for ```html code blocks
    const htmlFenceRegex = /```html\s*([\s\S]*?)```/i;
    const fenceMatch = content.match(htmlFenceRegex);
    if (fenceMatch && fenceMatch[1] && fenceMatch[1].trim()) {
      let html = fenceMatch[1].trim();
      const docTypeIdx = html.search(/<!DOCTYPE\s+html/i);
      const htmlStartIdx = html.search(/<html/i);
      const htmlEndIdx = html.search(/<\/html>/i);
      if (docTypeIdx !== -1 && htmlEndIdx !== -1) {
        return html.substring(docTypeIdx, htmlEndIdx + 7).trim();
      } else if (htmlStartIdx !== -1 && htmlEndIdx !== -1) {
        return html.substring(htmlStartIdx, htmlEndIdx + 7).trim();
      }
      return html;
    }

    // 2. Extract strictly from <!DOCTYPE html> to </html>
    const docTypeMatch = content.match(/(<!DOCTYPE\s+html[\s\S]*?<\/html>)/i);
    if (docTypeMatch && docTypeMatch[1]) {
      return docTypeMatch[1].trim();
    }

    // 3. Extract strictly from <html ... </html>
    const htmlTagMatch = content.match(/(<html[\s\S]*?<\/html>)/i);
    if (htmlTagMatch && htmlTagMatch[1]) {
      return htmlTagMatch[1].trim();
    }

    // 4. Check for generic code blocks containing complete HTML documents
    const genericFenceMatch = content.match(/```(?:xml|jsx|tsx)?\s*([\s\S]*?)```/i);
    if (genericFenceMatch && genericFenceMatch[1]) {
      const code = genericFenceMatch[1].trim();
      const docMatch = code.match(/(<!DOCTYPE\s+html[\s\S]*?<\/html>)/i);
      if (docMatch && docMatch[1]) return docMatch[1].trim();
      const tagMatch = code.match(/(<html[\s\S]*?<\/html>)/i);
      if (tagMatch && tagMatch[1]) return tagMatch[1].trim();
    }

    return null;
  };

  const openFullscreen = (html: string) => {
    const win = window.open('', '_blank');
    if (win) {
      if (html.toLowerCase().includes('<!doctype html') || html.toLowerCase().includes('<html')) {
        win.document.open();
        win.document.write(html);
        win.document.close();
      } else {
        win.document.open();
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
    }
  };

  const handleExampleClick = (p: string) => {
    if (!user) { onOpenAuth(); } else { onSubmitPrompt(p); }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-[#070a12] relative overflow-hidden">
      {/* ─── Messages & Content Scroll Area ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 py-4">
            
            {/* Clean Hero Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autonomous Swarm Orchestrator</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
                Where would you like to start?
              </h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto">
                Delegate full-stack code synthesis, live GitHub operations, inbox triage, and financial models to specialized AI departments.
              </p>
            </div>

            {/* Auth Notice if not signed in */}
            {!user && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl max-w-md w-full text-center space-y-2.5 shadow-lg">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">🔒 Authentication Required</div>
                <p className="text-xs text-slate-300">Sign in to orchestrate multi-agent swarms with isolated memory.</p>
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Sign In / Create Account
                </button>
              </div>
            )}

            {/* ─── Compact 2-Column Live Integrations Bar ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl text-left">
              {/* GitHub Compact Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/30 to-slate-900/80 border border-purple-500/30 shadow-md hover:border-purple-500/50 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <GitPullRequest className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">GitHub Swarm</h4>
                      <p className="text-[10px] text-slate-400">Repo trees, commits & PRs</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenGitHub?.()}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                      hasGitHubToken
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-purple-600 hover:bg-purple-500 text-white border-transparent'
                    }`}
                  >
                    {hasGitHubToken ? 'Active 🟢' : 'Connect'}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-purple-500/20 text-[11px]">
                  <button
                    onClick={() => handleExampleClick("Show me the project structure of AkshitMaheshwari/portfolio")}
                    className="px-2 py-0.5 rounded-md bg-slate-900/90 hover:bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[10px] transition-all hover:border-purple-400 font-mono"
                  >
                    📁 Inspect Repo Tree
                  </button>
                  <button
                    onClick={() => handleExampleClick("In my repository owner/repo, fix the typo in README.md and open a PR")}
                    className="px-2 py-0.5 rounded-md bg-slate-900/90 hover:bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[10px] transition-all hover:border-purple-400"
                  >
                    🚀 Open PR
                  </button>
                </div>
              </div>

              {/* Gmail Compact Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900/80 border border-rose-500/30 shadow-md hover:border-rose-500/50 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Gmail Swarm</h4>
                      <p className="text-[10px] text-slate-400">Triage, summarize & draft</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenGmail?.()}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                      hasGmailToken
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-rose-600 hover:bg-rose-500 text-white border-transparent'
                    }`}
                  >
                    {hasGmailToken ? 'Active 🟢' : 'Connect'}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-rose-500/20 text-[11px]">
                  <button
                    onClick={() => handleExampleClick("Check my unread emails from today and summarize them")}
                    className="px-2 py-0.5 rounded-md bg-slate-900/90 hover:bg-rose-950/60 border border-rose-500/30 text-rose-200 text-[10px] transition-all hover:border-rose-400 font-medium"
                  >
                    📬 Unread Emails
                  </button>
                  <button
                    onClick={() => handleExampleClick("Search my emails for invoice from Stripe")}
                    className="px-2 py-0.5 rounded-md bg-slate-900/90 hover:bg-rose-950/60 border border-rose-500/30 text-rose-200 text-[10px] transition-all hover:border-rose-400 font-medium"
                  >
                    🔍 Search Invoices
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Curated 4-Directive Quick Grid ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full max-w-4xl text-left">
              <button
                onClick={() => handleExampleClick("Create a 3-year go-to-market strategy, competitive analysis, and pitch deck for an AI startup.")}
                className="p-3 bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 rounded-xl transition-all hover:bg-slate-850 group flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-amber-400 text-xs mb-0.5 flex items-center gap-1.5">
                    🏢 Business Strategy
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    GTM plans, SWOT matrix, and 9-slide investor pitch decks.
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 group-hover:text-amber-400 transition-colors pt-2 flex items-center gap-1">
                  <span>Deploy Swarm</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => handleExampleClick("Build an interactive financial dashboard using Next.js, Tailwind CSS, and Recharts.")}
                className="p-3 bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/40 rounded-xl transition-all hover:bg-slate-850 group flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-purple-400 text-xs mb-0.5 flex items-center gap-1.5">
                    💻 Code Engineering
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    Full-stack web apps, algorithms, and automated PRs.
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 group-hover:text-purple-400 transition-colors pt-2 flex items-center gap-1">
                  <span>Deploy Swarm</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => handleExampleClick("Analyze NVDA and MSFT fundamentals, technical indicators (RSI, MACD), and sentiment.")}
                className="p-3 bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl transition-all hover:bg-slate-850 group flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-cyan-400 text-xs mb-0.5 flex items-center gap-1.5">
                    📈 Financial Intel
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    OHLCV market analytics, technical charts, and metrics.
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 group-hover:text-cyan-400 transition-colors pt-2 flex items-center gap-1">
                  <span>Deploy Swarm</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => handleExampleClick("Search my uploaded documents and summarize key clauses and SLA commitments.")}
                className="p-3 bg-slate-900/70 border border-slate-800/80 hover:border-sky-500/40 rounded-xl transition-all hover:bg-slate-850 group flex flex-col justify-between"
              >
                <div>
                  <div className="font-semibold text-sky-400 text-xs mb-0.5 flex items-center gap-1.5">
                    📄 Document RAG
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    Instant answers with citations from private uploaded files.
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 group-hover:text-sky-400 transition-colors pt-2 flex items-center gap-1">
                  <span>Deploy Swarm</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

          </div>
        ) : (
          messages.map((msg) => {
          messages.map((msg, index) => {
            const htmlContent = msg.content ? extractHtml(msg.content) : null;
            const currentTab = activeTabs[msg.id] || 'report';
            const logsOpen = showLogs[msg.id] || false;

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
                key={`${msg.id || 'msg'}-${index}`}
                className={`flex gap-3 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`flex-1 max-w-3xl ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`rounded-2xl p-4 md:p-5 border text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-500/15 border-amber-500/30 text-slate-100 ml-auto max-w-lg text-left shadow-sm'
                        : 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-md'
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

                    {/* Chart Visualization */}
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

                  {/* Agent Execution Logs */}
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
                              ev.department === 'sales' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
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
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ─── Sleek Modern Floating Prompt Input Bar ─── */}
      <div className="p-3 md:p-4 bg-gradient-to-t from-[#06080e] via-[#06080e]/90 to-transparent">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Quick Filter / Tool Shortcuts Strip */}
          <div className="flex items-center justify-between px-1 text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setPrompt('Check my unread emails from today and summarize them')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all text-[11px]"
              >
                <span>📬 Check Inbox</span>
              </button>

              <button
                type="button"
                onClick={() => setPrompt('Show me the project structure of ')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all text-[11px]"
              >
                <span>📁 Repo Tree</span>
              </button>

              <button
                type="button"
                onClick={() => setPrompt('Search my uploaded documents and ')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all text-[11px]"
              >
                <span>📑 Search Docs</span>
              </button>
            </div>

            <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
              Swarm Core · Multi-Agent
            </span>
          </div>

          {/* Textarea Input Container */}
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-800 focus-within:border-amber-500/50 rounded-2xl p-2 transition-all shadow-xl"
          >
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={1}
                placeholder="Ask the swarm anything — 'Check unread emails', 'Inspect repo', code, research..."
                className="w-full bg-transparent border-0 pl-3 pr-2 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none overflow-hidden leading-relaxed"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex-shrink-0 p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl disabled:opacity-40 transition-all shadow-md"
              title="Send Prompt (Enter)"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-500">
            Press Enter to send · Shift+Enter for new line · HiveMind AI Swarm
          </p>
        </div>
      </div>
    </div>
  );
};
