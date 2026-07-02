// 82-0 global leaderboard — POST /submit, GET /top, GET /rank.
// Entertainment board: validation keeps scores plausible, not tamper-proof.

const ALLOWED_ORIGINS = new Set([
  'https://82-0-challenge.com',
  'https://www.82-0-challenge.com',
  'http://localhost:3000',
]);

// 'standard' / 'daily' are the live modes; 'classic' / 'hoopiq' stay accepted
// so historical rows still validate and label. The cap/filter tags come from
// Cap Mode and the Challenge Filters pages.
const MODES = new Set([
  'standard', 'daily', 'classic', 'hoopiq',
  'cap', 'nomvps', 'franchise', 'decade', 'hard', 'eramode', 'lebron',
]);
const GRADES = new Set(['S+', 'S', 'A', 'B', 'C', 'D']);
const STYLES = new Set(['balanced', 'smallball', 'twintowers', 'rungun']);

const BANNED = /\b(fuck|shit|cunt|nigg|fag|rape|hitler)\w*/i;

function cors(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.82-0-challenge.com';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

function json(data, origin, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin), ...extra },
  });
}

async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function utcDay(ts = Date.now()) {
  return new Date(ts).toISOString().slice(0, 10);
}

// Better-score ordering: team rating leads (so 82-0 seasons aren't all tied),
// then more wins, then who submitted earlier on a tie.
const ORDER = 'points DESC, wins DESC, created_at ASC';

function validate(b) {
  if (!b || typeof b !== 'object') return 'bad body';
  const name = String(b.name || '').trim().slice(0, 14);
  if (name.length < 2) return 'name too short';
  if (BANNED.test(name)) return 'name rejected';
  const wins = b.wins | 0, losses = b.losses | 0;
  if (wins < 0 || losses < 0 || wins + losses !== 82) return 'bad record';
  const points = Number(b.points);
  // Rating is uncapped (rewards production past the benchmark); 200 is a sane
  // upper bound that no real five approaches.
  if (!(points >= 0 && points <= 200)) return 'bad points';
  const grade = String(b.grade || '');
  if (!GRADES.has(grade)) return 'bad grade';
  const mode = String(b.mode || '');
  if (!MODES.has(mode)) return 'bad mode';
  // style is optional — unknown/missing values store as '' so a client that
  // doesn't send it never gets rejected.
  const style = STYLES.has(b.style) ? b.style : '';
  const star = String(b.star || '').trim().slice(0, 40);
  return { name, wins, losses, points, grade, mode, style, star };
}

async function handleSubmit(request, env, origin) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, origin, 400); }

  const v = validate(body);
  if (typeof v === 'string') return json({ error: v }, origin, 400);

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const ipHash = await sha256(`82-0:${ip}`);
  const now = Date.now();

  // Rate limit: 1 per 15s, 40 per day, per IP.
  const recent = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM scores WHERE ip_hash = ?1 AND created_at > ?2'
  ).bind(ipHash, now - 15_000).first();
  if (recent.n > 0) return json({ error: 'slow down' }, origin, 429);

  const today = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM scores WHERE ip_hash = ?1 AND day = ?2'
  ).bind(ipHash, utcDay(now)).first();
  if (today.n >= 40) return json({ error: 'daily limit' }, origin, 429);

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO scores (id, name, wins, losses, points, grade, mode, style, star, day, ip_hash, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
  ).bind(id, v.name, v.wins, v.losses, v.points, v.grade, v.mode, v.style, v.star, utcDay(now), ipHash, now).run();

  const ranks = await rankOf(env, id);
  return json({ id, ...ranks }, origin, 201);
}

async function rankOf(env, id) {
  const row = await env.DB.prepare('SELECT * FROM scores WHERE id = ?1').bind(id).first();
  if (!row) return null;
  const better = `(points > ?1) OR (points = ?1 AND wins > ?2)
    OR (points = ?1 AND wins = ?2 AND created_at < ?3)`;
  const args = [row.points, row.wins, row.created_at];
  const all = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM scores WHERE ${better}`
  ).bind(...args).first();
  const day = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM scores WHERE day = ?4 AND (${better})`
  ).bind(...args, row.day).first();
  const totals = await env.DB.prepare(
    'SELECT COUNT(*) AS all_n, SUM(day = ?1) AS day_n FROM scores'
  ).bind(row.day).first();
  return {
    rank: all.n + 1,
    total: totals.all_n,
    todayRank: day.n + 1,
    todayTotal: totals.day_n,
    day: row.day,
  };
}

// ---- shares: a snapshot of one result, fetched by the /share/<id> page ----

const POSITIONS = new Set(['PG', 'SG', 'SF', 'PF', 'C']);

function validateShare(b) {
  if (!b || typeof b !== 'object') return 'bad body';
  const wins = b.wins | 0, losses = b.losses | 0;
  if (wins < 0 || losses < 0 || wins + losses !== 82) return 'bad record';
  const points = Number(b.points);
  if (!(points >= 0 && points <= 200)) return 'bad points';
  const grade = String(b.grade || '');
  if (!GRADES.has(grade)) return 'bad grade';
  const mode = String(b.mode || '');
  if (!MODES.has(mode)) return 'bad mode';
  const style = STYLES.has(b.style) ? b.style : '';
  const name = String(b.name || '').trim().slice(0, 14);
  if (name && BANNED.test(name)) return 'name rejected';
  if (!Array.isArray(b.lineup) || b.lineup.length !== 5) return 'bad lineup';
  const lineup = [];
  for (const p of b.lineup) {
    if (!p || typeof p !== 'object') return 'bad lineup';
    const pos = String(p.pos || '');
    if (!POSITIONS.has(pos)) return 'bad lineup';
    const pname = String(p.name || '').trim().slice(0, 40);
    if (pname.length < 2 || BANNED.test(pname)) return 'bad lineup';
    lineup.push({
      pos,
      name: pname,
      team: String(p.team || '').trim().slice(0, 8),
      decade: String(p.decade || '').trim().slice(0, 8),
    });
  }
  return { wins, losses, points, grade, mode, style, name, lineup };
}

async function handleShareCreate(request, env, origin) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, origin, 400); }

  const v = validateShare(body);
  if (typeof v === 'string') return json({ error: v }, origin, 400);

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const ipHash = await sha256(`82-0:${ip}`);
  const now = Date.now();

  // Rate limit: 1 per 10s, 60 per day, per IP.
  const recent = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM shares WHERE ip_hash = ?1 AND created_at > ?2'
  ).bind(ipHash, now - 10_000).first();
  if (recent.n > 0) return json({ error: 'slow down' }, origin, 429);

  const today = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM shares WHERE ip_hash = ?1 AND day = ?2'
  ).bind(ipHash, utcDay(now)).first();
  if (today.n >= 60) return json({ error: 'daily limit' }, origin, 429);

  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 20);
  await env.DB.prepare(
    'INSERT INTO shares (id, payload, day, ip_hash, created_at) VALUES (?1, ?2, ?3, ?4, ?5)'
  ).bind(id, JSON.stringify(v), utcDay(now), ipHash, now).run();

  return json({ id }, origin, 201);
}

async function handleShareGet(env, origin, url) {
  const id = String(url.searchParams.get('id') || '');
  if (!/^[a-f0-9]{20}$/.test(id)) return json({ error: 'not found' }, origin, 404);
  const row = await env.DB.prepare('SELECT payload, created_at FROM shares WHERE id = ?1').bind(id).first();
  if (!row) return json({ error: 'not found' }, origin, 404);
  // Shares are immutable — let the edge and the share page cache them hard.
  return json({ ...JSON.parse(row.payload), createdAt: row.created_at }, origin, 200, {
    'Cache-Control': 'public, max-age=31536000, immutable',
  });
}

async function handleTop(request, env, origin, url) {
  const p = url.searchParams.get('period');
  const period = p === 'today' ? 'today' : p === 'week' ? 'week' : 'all';
  // Optional per-variant filter (cap / nomvps / franchise / decade / hard / …).
  const modeParam = String(url.searchParams.get('mode') || '');
  const mode = MODES.has(modeParam) ? modeParam : null;
  const limit = Math.min(100, Math.max(1, url.searchParams.get('limit') | 0 || 100));

  // No edge cache: a leaderboard must show a freshly-submitted score
  // immediately. D1 reads here are cheap and low-QPS. `no-store` also keeps
  // the browser/CDN from holding a stale (e.g. empty) board.
  const conds = [], binds = [];
  if (period === 'today') { conds.push('day = ?'); binds.push(utcDay()); }
  // week = rolling 7-day window (today + 6 prior days).
  else if (period === 'week') { conds.push('day >= ?'); binds.push(utcDay(Date.now() - 6 * 86_400_000)); }
  if (mode) { conds.push('mode = ?'); binds.push(mode); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const stmt = env.DB.prepare(
    `SELECT id, name, wins, losses, points, grade, mode, style, star, day, created_at
     FROM scores ${where} ORDER BY ${ORDER} LIMIT ${limit}`
  );
  const { results } = await (binds.length ? stmt.bind(...binds) : stmt).all();

  return json({ period, mode: mode || 'all', day: utcDay(), entries: results }, origin, 200, {
    'Cache-Control': 'no-store',
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    try {
      if (request.method === 'POST' && url.pathname === '/submit') {
        return await handleSubmit(request, env, origin);
      }
      if (request.method === 'GET' && url.pathname === '/top') {
        return await handleTop(request, env, origin, url);
      }
      if (request.method === 'POST' && url.pathname === '/share') {
        return await handleShareCreate(request, env, origin);
      }
      if (request.method === 'GET' && url.pathname === '/share') {
        return await handleShareGet(env, origin, url);
      }
      if (request.method === 'GET' && url.pathname === '/rank') {
        const ranks = await rankOf(env, url.searchParams.get('id') || '');
        return ranks ? json(ranks, origin) : json({ error: 'not found' }, origin, 404);
      }
      return json({ error: 'not found' }, origin, 404);
    } catch (err) {
      return json({ error: 'server error' }, origin, 500);
    }
  },
};
