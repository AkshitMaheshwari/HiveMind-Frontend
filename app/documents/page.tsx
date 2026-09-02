'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getApiUrl } from '@/lib/config';
import {
  FileText, Sheet, File, Upload, Trash2, RefreshCw,
  Loader2, AlertCircle, CheckCircle2, Sparkles, Database,
  Search, X, AlertTriangle, ChevronUp, ChevronDown
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

interface IndexedDoc {
  source_identifier: string;
  source_type: string;
  chunk_count: number;
  created_at: string;
}

interface UploadingFile {
  id: string;
  name: string;
  status: 'uploading' | 'success' | 'error';
  chunks?: number;
  error?: string;
}

function FileIcon({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const ext = name.split('.').pop()?.toLowerCase();
  const cls = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  if (ext === 'pdf') return <FileText className={`${cls} text-rose-400`} />;
  if (ext === 'xlsx' || ext === 'xls') return <Sheet className={`${cls} text-emerald-400`} />;
  if (ext === 'csv') return <File className={`${cls} text-sky-400`} />;
  return <File className={`${cls} text-slate-400`} />;
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentsPage() {
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [docs, setDocs] = useState<IndexedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<IndexedDoc | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
      else { setLoading(false); setAuthModalOpen(true); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { setAuthModalOpen(true); setDocs([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch document list from backend
  const fetchDocs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setDocs([]); return; }
      const res = await fetch(getApiUrl('/api/documents'), {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setDocs(await res.json());
    } catch (e) {
      console.error('Failed to fetch documents:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (user) fetchDocs(); }, [user, fetchDocs]);

  // Upload
  const uploadFile = useCallback(async (file: File) => {
    const fileId = `${Date.now()}-${file.name}`;
    setUploadingFiles(prev => [...prev, { id: fileId, name: file.name, status: 'uploading' }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated.');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setUploadingFiles(prev =>
        prev.map(f => f.id === fileId ? { ...f, status: 'success', chunks: data.chunks_ingested } : f)
      );
      // Refresh the doc list after successful upload
      fetchDocs(true);
    } catch (e: any) {
      setUploadingFiles(prev =>
        prev.map(f => f.id === fileId ? { ...f, status: 'error', error: e.message } : f)
      );
    }
  }, [fetchDocs]);

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    Array.from(incoming).forEach(uploadFile);
  }, [uploadFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Delete document
  const handleDelete = async (doc: IndexedDoc) => {
    setDeletingId(doc.source_identifier);
    setConfirmDelete(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        getApiUrl(`/api/documents/${encodeURIComponent(doc.source_identifier)}`),
        { method: 'DELETE', headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      if (res.ok) {
        setDocs(prev => prev.filter(d => d.source_identifier !== doc.source_identifier));
      }
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = docs.filter(d =>
    d.source_identifier.toLowerCase().includes(query.toLowerCase())
  );

  const totalChunks = docs.reduce((acc, d) => acc + d.chunk_count, 0);
  const pendingUploads = uploadingFiles.filter(f => f.status === 'uploading').length;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-sans antialiased text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 border-b border-slate-800 bg-[var(--bg-surface)]/90 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100">HiveMind AI</h1>
            <p className="text-[10px] text-slate-400">Knowledge Base</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <a href="/" className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all">
            Dashboard
          </a>
          <a href="/chat" className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all">
            Chat & Tasks
          </a>
          <span className="px-4 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
            My Documents
          </span>
        </nav>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/20 flex items-center justify-center text-slate-200 font-semibold text-xs">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs text-slate-400 max-w-[120px] truncate hidden sm:block">{user.email}</span>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold"
          >
            Sign In
          </button>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Page title + stats */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">My Knowledge Base</h2>
            <p className="text-sm text-slate-400 mt-1">
              Upload documents to give your agents long-term memory. Vectors are stored permanently in Qdrant Cloud.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats pills */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 font-medium">{docs.length}</span>
              <span className="text-slate-500">docs</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-300 font-medium">{totalChunks.toLocaleString()}</span>
              <span className="text-slate-500">chunks</span>
            </div>
            <button
              onClick={() => fetchDocs(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => user ? inputRef.current?.click() : setAuthModalOpen(true)}
          className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? 'border-amber-500/70 bg-amber-500/8 scale-[1.01]'
              : 'border-slate-700 hover:border-amber-500/40 hover:bg-slate-800/20'
          }`}
        >
          <div className={`p-4 rounded-2xl transition-colors ${dragging ? 'bg-amber-500/15' : 'bg-slate-800/80'}`}>
            <Upload className={`w-8 h-8 transition-colors ${dragging ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-200">
              {dragging ? 'Drop to upload' : 'Click or drag files here'}
            </p>
            <p className="text-xs text-slate-500 mt-1">PDF, Excel (.xlsx, .xls), CSV — max 50 MB per file</p>
          </div>
          {pendingUploads > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading {pendingUploads} file{pendingUploads > 1 ? 's' : ''}…
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.csv"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>

        {/* Active uploads */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Upload Activity</h3>
            <div className="space-y-2">
              {uploadingFiles.map(f => (
                <div
                  key={f.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ${
                    f.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' :
                    f.status === 'error' ? 'bg-rose-500/5 border-rose-500/20' :
                    'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <FileIcon name={f.name} size="md" />
                  <span className="flex-1 truncate text-slate-300 text-sm">{f.name}</span>
                  {f.status === 'uploading' && <Loader2 className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />}
                  {f.status === 'success' && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400">{f.chunks} chunks indexed</span>
                    </div>
                  )}
                  {f.status === 'error' && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-xs text-rose-400 max-w-[200px] truncate" title={f.error}>{f.error}</span>
                      <button onClick={() => setUploadingFiles(prev => prev.filter(u => u.id !== f.id))}>
                        <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Library */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Indexed Documents
            </h3>
            {docs.length > 0 && (
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search documents…"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span className="text-sm">Loading your knowledge base…</span>
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Database className="w-7 h-7 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Sign in to access your documents</p>
                <p className="text-xs text-slate-500 mt-1">Your knowledge base is private and persisted across sessions.</p>
              </div>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-sm rounded-xl"
              >
                Sign In
              </button>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center border border-dashed border-slate-800 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <Database className="w-7 h-7 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">
                  {query ? `No documents matching "${query}"` : 'No documents indexed yet'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {query ? 'Try a different search term.' : 'Upload a PDF, Excel, or CSV file above to get started.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3 bg-slate-900/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span className="w-8" />
                <span>Document</span>
                <span className="text-right">Type</span>
                <span className="text-right">Chunks</span>
                <span className="w-8" />
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-800/60">
                {filteredDocs.map(doc => (
                  <div
                    key={doc.source_identifier}
                    className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-slate-800/30 transition-all group"
                  >
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                      <FileIcon name={doc.source_identifier} size="sm" />
                    </div>

                    {/* Name */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate" title={doc.source_identifier}>
                        {doc.source_identifier}
                      </p>
                    </div>

                    {/* Type */}
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border uppercase tracking-wide ${
                      doc.source_type === 'pdf' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      doc.source_type === 'xlsx' || doc.source_type === 'xls' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}>
                      {doc.source_type || 'file'}
                    </span>

                    {/* Chunks */}
                    <div className="flex items-center gap-1.5 text-right">
                      <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {doc.chunk_count.toLocaleString()}
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => setConfirmDelete(doc)}
                      disabled={deletingId === doc.source_identifier}
                      title="Remove from knowledge base"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {deletingId === doc.source_identifier ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0f1117] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 to-red-600" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Remove Document</h3>
                  <p className="text-xs text-slate-400">All vectors will be deleted from Qdrant.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <FileIcon name={confirmDelete.source_identifier} size="sm" />
                <p className="text-xs text-slate-300 truncate">{confirmDelete.source_identifier}</p>
                <span className="ml-auto text-[10px] text-slate-500">{confirmDelete.chunk_count} chunks</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u) => { setUser(u); fetchDocs(); }}
      />
    </div>
  );
}
