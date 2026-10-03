import { getApiUrl, getWebSocketUrl } from './config';

export interface TaskEvent {
  id?: string;
  sequence?: number;
  event: string;
  data?: string;
  agent?: string;
  department?: string;
  departments?: string[];
  depends_on?: string[];
  subtasks?: { department: string; depends_on?: string[] }[];
  timestamp?: string;
}

export interface DepartmentProgress {
  name: string;
  status: 'waiting' | 'running' | 'done' | 'error' | 'skipped' | 'stopped' | 'unknown';
  dependsOn: string[];
  detail?: string;
}

export function updateDepartmentProgress(previous: DepartmentProgress[], event: TaskEvent): DepartmentProgress[] {
  if (event.event === 'ceo_plan_ready' && Array.isArray(event.departments)) {
    return event.departments.map(name => previous.find(item => item.name === name) || {
      name, status: 'waiting', dependsOn: event.subtasks?.find(task => task.department === name)?.depends_on || [],
    });
  }
  const statuses: Record<string, DepartmentProgress['status']> = {
    department_waiting: 'waiting', department_started: 'running', department_done: 'done',
    department_error: 'error', department_skipped: 'skipped',
  };
  const status = statuses[event.event];
  if (status && event.department) {
    const existing = previous.find(item => item.name === event.department);
    const updated: DepartmentProgress = { name: event.department, status,
      dependsOn: event.depends_on || existing?.dependsOn || [], detail: event.data };
    return existing ? previous.map(item => item.name === event.department ? updated : item) : [...previous, updated];
  }
  if (['task_cancelled', 'error', 'task_done'].includes(event.event)) {
    return previous.map(item => ['waiting', 'running'].includes(item.status)
      ? { ...item, status: event.event === 'task_cancelled' ? 'stopped' : event.event === 'task_done' ? 'unknown' : 'error', detail: 'Work did not report completion.' } : item);
  }
  return previous;
}

/** Own every socket/timer for a task. Poll only for recovery, never concurrently. */
export function watchTask(
  taskId: string,
  token: string,
  onEvent: (event: TaskEvent) => void,
  onComplete: () => void,
) {
  let disposed = false;
  let finished = false;
  let socket: WebSocket | null = null;
  let sequence = 0;
  let reconnectDelay = 1000;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let lastContact = Date.now();
  let polling = false;
  let hasOutput = false;
  const abort = new AbortController();
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const deliver = (event: TaskEvent) => {
    if (disposed || finished) return;
    if (event.event === 'partial_output' && event.data) hasOutput = true;
    onEvent(event);
  };
  const complete = () => {
    if (disposed || finished) return;
    finished = true;
    clearInterval(watchdog);
    clearTimeout(reconnectTimer);
    socket?.close();
    onComplete();
  };
  const poll = async () => {
    if (disposed || finished || polling) return;
    polling = true;
    try {
      const response = await fetch(getApiUrl(`/api/task/${taskId}`), { headers, signal: abort.signal });
      if (!response.ok || disposed || finished) return;
      const task = await response.json();
      if (disposed || finished) return;
      if (['done', 'error', 'cancelled'].includes(task.status)) {
        if (task.task_plan?.departments) deliver({ event: 'ceo_plan_ready',
          departments: task.task_plan.departments, subtasks: task.task_plan.subtasks });
        for (const entry of task.events || []) {
          if (['charts_json', 'metrics', 'department_started', 'department_done', 'department_error', 'department_skipped'].includes(entry.event_type || entry.event)) {
            deliver({ ...entry, event: entry.event_type || entry.event });
          }
        }
        if (task.final_output) deliver({ event: 'partial_output', data: task.final_output });
        if (task.status === 'error') deliver({ event: 'error', data: task.error || 'Task failed. Please retry.' });
        if (task.status === 'cancelled') deliver({ event: 'task_cancelled', data: 'Stopped.' });
        if (task.status === 'done') deliver({ event: 'task_done', data: 'Complete.' });
        complete();
      }
    } catch {
      // Retain the current output while the connection recovers.
    } finally {
      polling = false;
    }
  };
  const connect = () => {
    if (disposed || finished) return;
    const url = new URL(getWebSocketUrl(taskId, token));
    url.searchParams.set('after', String(sequence));
    socket = new WebSocket(url);
    socket.onopen = () => { reconnectDelay = 1000; lastContact = Date.now(); };
    socket.onmessage = (message) => {
      if (disposed || finished) return;
      lastContact = Date.now();
      let event: TaskEvent;
      try { event = JSON.parse(message.data); } catch { return; }
      if (event.event === 'pong') return;
      if (event.sequence && event.sequence <= sequence) return;
      sequence = event.sequence || sequence;
      if (event.event === 'task_done') {
        deliver(event);
        // Do not mark finished before fetching a missing final response.
        if (hasOutput) complete(); else void poll();
        return;
      }
      deliver(event);
      if (event.event === 'error' || event.event === 'task_cancelled') complete();
    };
    socket.onerror = () => socket?.close();
    socket.onclose = () => {
      if (disposed || finished) return;
      deliver({ event: 'connection_status', data: 'Reconnecting. Your task is still running.' });
      void poll();
      reconnectTimer = setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, 15000);
    };
  };
  const watchdog = setInterval(() => {
    if (disposed || finished) return;
    if (socket?.readyState !== WebSocket.OPEN || Date.now() - lastContact > 15000) {
      void poll();
      if (socket?.readyState === WebSocket.OPEN) socket.close();
    } else {
      socket.send('ping');
    }
  }, 5000);
  connect();
  void poll(); // Recovers terminal tasks after navigation or a server restart.
  return () => {
    disposed = true;
    clearInterval(watchdog);
    clearTimeout(reconnectTimer);
    abort.abort();
    socket?.close();
  };
}
