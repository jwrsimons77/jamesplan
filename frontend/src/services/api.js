const KEY = 'apiBase';
// Read Vite env at build-time in the browser. Guard for SSR/build tools.
const ENV_BASE = (typeof import.meta !== 'undefined' && import.meta.env)
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
  getLogsSummary(plan_id, user_id) {
    const qp = new URLSearchParams({ plan_id: String(plan_id) });
    if (user_id != null) qp.set('user_id', String(user_id));
    return apiGet(`/api/logs/summary?${qp.toString()}`);
  },
  startLog(plan_day_id, dateISO, user_id) {
    return apiPost('/api/logs', { plan_day_id, date: dateISO, user_id });
  },
  addSet(logId, payload) {
    return apiPost(`/api/logs/${logId}/sets`, payload);
  },
  getLastSet(exercise_id, user_id) {
    const qp = new URLSearchParams({ exercise_id: String(exercise_id) });
    if (user_id != null) qp.set('user_id', String(user_id));
    return apiGet(`/api/last-set?${qp.toString()}`);
  },
  getCalendar(range){
    const qp = new URLSearchParams();
    if (range?.from) qp.set('from', range.from);
    if (range?.to) qp.set('to', range.to);
    const s = qp.toString();
    return apiGet(`/api/plan/calendar${s ? ('?' + s) : ''}`);
  },
  replaceExerciseSets(logId, exerciseId, rows){
    return apiPut(`/api/logs/${logId}/exercises/${exerciseId}/sets`, { rows });
  },
  getExerciseSets(logId, exerciseId){
    return apiGet(`/api/logs/${logId}/exercises/${exerciseId}/sets`);
  },
  getRecentSets(exercise_id, user_id, limit=2){
    const qp = new URLSearchParams({ exercise_id: String(exercise_id), limit: String(limit) });
    if (user_id != null) qp.set('user_id', String(user_id));
    return apiGet(`/api/recent-sets?${qp.toString()}`);
  }
}
