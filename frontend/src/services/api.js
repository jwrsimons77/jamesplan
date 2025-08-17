const KEY = 'apiBase';
const ENV_BASE = (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_API_BASE
  : undefined;
export function getApiBase() {
  const v = localStorage.getItem(KEY);
  return (ENV_BASE && ENV_BASE.trim()) || v || 'http://localhost:8080';
}
export function setApiBase(v) {
  localStorage.setItem(KEY, v);
}

export async function apiGet(path) {
  const base = getApiBase();
  const res = await fetch(base + path);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export async function apiPost(path, body) {
  const base = getApiBase();
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export async function apiPut(path, body) {
  const base = getApiBase();
  const res = await fetch(base + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

export const PlanApi = {
  putOrder(plan_day_ids) {
    return apiPut('/api/plan/order', { plan_day_ids });
  },
  getLogsSummary(plan_id) {
    return apiGet(`/api/logs/summary?plan_id=${encodeURIComponent(plan_id)}`);
  },
  startLog(plan_day_id, dateISO) {
    return apiPost('/api/logs', { plan_day_id, date: dateISO });
  },
  addSet(logId, payload) {
    return apiPost(`/api/logs/${logId}/sets`, payload);
  }
}
