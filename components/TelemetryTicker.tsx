'use client';
import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/config';

export const TelemetryTicker = () => {
  const [health, setHealth] = useState<{ status: string; database?: string; rag?: string } | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    fetch(getApiUrl('/health'), { signal: abort.signal }).then(response => {
      if (!response.ok) throw new Error('Unavailable');
      return response.json();
    }).then(setHealth).catch(() => { if (!abort.signal.aborted) setHealth({ status: 'unavailable' }); });
    return () => abort.abort();
  }, []);
  return <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs flex flex-wrap gap-4 text-slate-400" role="status">
    <span>Backend: <strong className="text-slate-200">{health?.status || 'Checking...'}</strong></span>
    {health?.database && <span>History: {health.database}</span>}
    {health?.rag && <span>Document search: {health.rag}</span>}
    <span>Task timings appear in chat execution details.</span>
  </div>;
};
