// 82-0 global leaderboard — POST /submit, GET /top, GET /rank.
// Entertainment board: validation keeps scores plausible, not tamper-proof.

const ALLOWED_ORIGINS = new Set([
  'https://82-0-challenge.com',
  'https://www.82-0-challenge.com',
  'http://localhost:3000',
]);

const MODES = new Set(['classic', 'hoopiq', 'daily']);
const GRADES = new Set(['S+', 'S', 'A', 'B', 'C', 'D']);

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

// Better-score ordering: more wins first, then team rating, then who submitted
// earlier on a tie.
const ORDER = 'wins DESC, points DESC, created_at ASC';

function validate(b) {
  if (!b || typeof b !== 'object') return 'bad body';
  const name = String(b.name || '').trim().slice(0, 14);
  if (name.length < 2) return 'name too short';
  if (BANNED.test(name)) return 'name rejected';
  const wins = b.wins | 0, losses = b.losses | 0;
  if (wins < 0 || losses < 0 || wins + losses !== 82) return 'bad record';
  const points = Number(b.points);
  if (!(points >= 0 && points <= 100)) return 'bad points';
  const grade = String(b.grade || '');
  if (!GRADES.has(grade)) return 'bad grade';
  const mode = String(b.mode || '');
  if (!MODES.has(mode)) return 'bad mode';
  const star = String(b.star || '').trim().slice(0, 40);
  return { name, wins, losses, points, grade, mode, star };
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
    `INSERT INTO scores (id, name, wins, losses, points, grade, mode, star, day, ip_hash, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
  ).bind(id, v.name, v.wins, v.losses, v.points, v.grade, v.mode, v.star, utcDay(now), ipHash, now).run();

  const ranks = await rankOf(env, id);
  return json({ id, ...ranks }, origin, 201);
}

async function rankOf(env, id) {
  const row = await env.DB.prepare('SELECT * FROM scores WHERE id = ?1').bind(id).first();
  if (!row) return null;
  const better = `(wins > ?1) OR (wins = ?1 AND points > ?2)
    OR (wins = ?1 AND points = ?2 AND created_at < ?3)`;
  const args = [row.wins, row.points, row.created_at];
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

async function handleTop(request, env, origin, url) {
  const period = url.searchParams.get('period') === 'today' ? 'today' : 'all';
  const limit = Math.min(100, Math.max(1, url.searchParams.get('limit') | 0 || 100));

  // 60s edge cache keyed by period+limit+day.
  const cacheKey = new Request(`https://lb.82-0-challenge.com/top?period=${period}&limit=${limit}&day=${utcDay()}`);
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    const res = new Response(cached.body, cached);
    Object.entries(cors(origin)).forEach(([k, vv]) => res.headers.set(k, vv));
    return res;
  }

  const where = period === 'today' ? 'WHERE day = ?1' : '';
  const stmt = env.DB.prepare(
    `SELECT id, name, wins, losses, points, grade, mode, star, day, created_at
     FROM scores ${where} ORDER BY ${ORDER} LIMIT ${limit}`
  );
  const { results } = await (period === 'today' ? stmt.bind(utcDay()) : stmt).all();

  const res = json({ period, day: utcDay(), entries: results }, origin, 200, {
    'Cache-Control': 'public, max-age=60',
  });
  await caches.default.put(cacheKey, res.clone());
  return res;
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
