/**
 * Centralized API & WebSocket configuration for Frontend
 * Sourced from NEXT_PUBLIC_BACKEND_URL with localhost fallback for local dev.
 */

export const BACKEND_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};

export const getWebSocketUrl = (taskId: string, token?: string): string => {
  const wsBase = BACKEND_URL.replace(/^http:\/\//i, 'ws://').replace(/^https:\/\//i, 'wss://');
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${wsBase}/ws/${taskId}${tokenParam}`;
};
