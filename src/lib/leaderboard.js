// Client helpers for the global leaderboard worker + local personal-best state.

export const LB_API =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8788'
    : 'https://lb.82-0-challenge.com';

export async function submitScore(payload) {
  const res = await fetch(`${LB_API}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'submit failed');
  return data; // { id, rank, total, todayRank, todayTotal, day }
}

export async function fetchTop(period = 'today', mode = 'all') {
  const m = mode && mode !== 'all' ? `&mode=${encodeURIComponent(mode)}` : '';
  const res = await fetch(`${LB_API}/top?period=${period}${m}`);
  if (!res.ok) throw new Error('fetch failed');
  return res.json(); // { period, day, entries }
}

// ---- result shares (the /share/<id> viral page) ----

export async function createShare(payload) {
  const res = await fetch(`${LB_API}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'share failed');
  return data; // { id }
}

// ---- localStorage: last submission (for highlighting yourself) ----

const SUB_KEY = 'hoop820_submission';

export function saveSubmission(data) {
  try { localStorage.setItem(SUB_KEY, JSON.stringify(data)); } catch { /* private mode */ }
}

export function loadSubmission() {
  try { return JSON.parse(localStorage.getItem(SUB_KEY)) || null; } catch { return null; }
}
