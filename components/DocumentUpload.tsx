'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, Sheet, File, CheckCircle2,
  AlertCircle, X, Loader2, ChevronUp, ChevronDown, Paperclip
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UploadedFile {
  id: string;
  name: string;
  status: 'uploading' | 'success' | 'error';
  chunks?: number;
  error?: string;
}

interface DocumentUploadProps {
  user: any;
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className="w-3.5 h-3.5 text-rose-400" />;
  if (ext === 'xlsx' || ext === 'xls') return <Sheet className="w-3.5 h-3.5 text-emerald-400" />;
  if (ext === 'csv') return <File className="w-3.5 h-3.5 text-sky-400" />;
  return <File className="w-3.5 h-3.5 text-slate-400" />;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ user }) => {
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    const fileId = `${Date.now()}-${file.name}`;
    setFiles(prev => [...prev, { id: fileId, name: file.name, status: 'uploading' }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated. Please sign in to upload documents.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'success', chunks: data.chunks_ingested }
            : f
        )
      );
    } catch (e: any) {
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'error', error: e.message }
            : f
        )
      );
    }
  }, []);

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    Array.from(incoming).forEach(uploadFile);
  }, [uploadFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (id: string) =>
    setFiles(prev => prev.filter(f => f.id !== id));

  const successCount = files.filter(f => f.status === 'success').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;

  return (
    <div className="border-t border-slate-800/80">
      {/* Header toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Paperclip className="w-3.5 h-3.5 text-amber-400" />
            {uploadingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            My Documents
          </span>
          {successCount > 0 && (
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
              {successCount} indexed
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {!user ? (
            <p className="text-center text-[10px] text-slate-500 py-2">
              🔒 Sign in to upload documents
            </p>
          ) : (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center gap-1.5 
                  p-4 rounded-xl border border-dashed cursor-pointer transition-all
                  ${dragging
                    ? 'border-amber-500/60 bg-amber-500/8 scale-[1.01]'
                    : 'border-slate-700 hover:border-amber-500/40 hover:bg-slate-800/30'
                  }
                `}
              >
                <div className={`p-2 rounded-lg transition-colors ${dragging ? 'bg-amber-500/15' : 'bg-slate-800'}`}>
                  <Upload className={`w-4 h-4 transition-colors ${dragging ? 'text-amber-400' : 'text-slate-400'}`} />
                </div>
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  <span className="text-amber-400 font-medium">Click or drop</span> to upload<br />
                  <span className="text-slate-500">PDF, Excel, CSV — max 50 MB</span>
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5">
                  {files.map(f => (
                    <div
                      key={f.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] transition-all ${
                        f.status === 'success'
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : f.status === 'error'
                          ? 'bg-rose-500/5 border-rose-500/20'
                          : 'bg-slate-800/50 border-slate-700/50'
                      }`}
                    >
                      <FileIcon name={f.name} />
                      <span className="flex-1 truncate text-slate-300 min-w-0">{f.name}</span>

                      {f.status === 'uploading' && (
                        <Loader2 className="w-3 h-3 text-amber-400 animate-spin flex-shrink-0" />
                      )}
                      {f.status === 'success' && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {f.chunks !== undefined && (
                            <span className="text-emerald-400">{f.chunks}c</span>
                          )}
                        </div>
                      )}
                      {f.status === 'error' && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          <button
                            onClick={() => removeFile(f.id)}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Error details */}
              {files.some(f => f.status === 'error') && (
                <div className="space-y-0.5">
                  {files.filter(f => f.status === 'error').map(f => (
                    <p key={f.id} className="text-[9px] text-rose-400 leading-relaxed px-1 truncate" title={f.error}>
                      {f.name}: {f.error}
                    </p>
                  ))}
                </div>
              )}

              {/* Tip */}
              {successCount > 0 && (
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  ✨ Ask the Research agent anything about your documents
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
