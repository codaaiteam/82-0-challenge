// Cloudflare Pages Function for /share/<id> — the viral landing page for a
// shared result. Replaces the old Next.js src/app/share/[id]/ SSR route, which
// could not survive output:'export'. Data comes from the leaderboard Worker
// (already live, unaffected by the Railway ban); this Function renders the HTML
// shell with the dynamic Open Graph tags that make shared links unfurl.

const LB_API = 'https://lb.82-0-challenge.com'
const SITE = 'https://www.82-0-challenge.com'

const CHIP_COLORS = ['#f2641e', '#2e9d6b', '#3b7fd4', '#b24bd0', '#d9a21e']

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

function initials(name) {
  return String(name || '').split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase()
}

async function getShare(id) {
  if (!/^[a-f0-9]{20}$/.test(id)) return null
  try {
    const res = await fetch(`${LB_API}/share?id=${encodeURIComponent(id)}`, {
      cf: { cacheTtl: 31536000, cacheEverything: true },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function onRequestGet({ params }) {
  const id = params.id
  const data = await getShare(id)

  if (!data) {
    // Unknown / malformed id: bounce to the game instead of showing a 404.
    return Response.redirect(`${SITE}/#game`, 302)
  }

  const record = `${data.wins}–${data.losses}`
  const title = `Someone went ${record} in the 82-0 Challenge — can you beat it?`
  const description = `A starting five went ${record} (grade ${data.grade} · ${data.points} pts). Draft your own all-time team and try to top it.`
  const ogImage = `${SITE}/og.png`
  const lineup = Array.isArray(data.lineup) ? data.lineup : []

  const rows = lineup.map((p, i) => `
        <div class="row">
          <span class="chip" style="background:${CHIP_COLORS[i % CHIP_COLORS.length]}">
            <b>${esc(initials(p.name))}</b><i>${esc(p.pos)}</i>
          </span>
          <span class="name">${esc(p.name)}<small>${esc(p.team)} · ${esc(p.decade)}</small></span>
        </div>`).join('')

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:url" content="${SITE}/share/${esc(id)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImage)}">
<link rel="icon" href="/favicon.ico" sizes="any">
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, system-ui, -apple-system, sans-serif; background: #0c0d11; color: #eef1f8; }
  .main { min-height: 100vh; display: flex; justify-content: center; padding: 3rem 1rem 4rem; }
  .card { width: 100%; max-width: 560px; text-align: center; background: #181b22; border: 1px solid #2a2f3b; border-radius: 18px; padding: 2rem 1.5rem; height: fit-content; }
  .kicker { color: #a6adba; font-size: .8rem; text-transform: uppercase; letter-spacing: .14em; font-weight: 700; }
  .record { font-size: 4.2rem; font-weight: 900; line-height: 1.15; background: linear-gradient(135deg, #ffd9b8, #f2641e 60%, #c24e12); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .gradeRow { display: flex; justify-content: center; align-items: baseline; gap: .5rem; margin-bottom: 1rem; }
  .grade { background: linear-gradient(135deg, #f2641e, #c24e12); color: #fff; font-weight: 900; padding: .15rem .6rem; border-radius: 8px; }
  .pts { color: #a6adba; font-weight: 700; }
  .challenge { font-size: 1.7rem; font-weight: 900; color: #fff; margin-bottom: 1.5rem; }
  .lineup { display: flex; flex-direction: column; gap: .5rem; text-align: left; }
  .row { display: flex; align-items: center; gap: .8rem; background: #1b1e27; border-radius: 12px; padding: .55rem .8rem; }
  .chip { flex: 0 0 44px; height: 44px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; }
  .chip b { font-size: .85rem; font-weight: 900; }
  .chip i { font-style: normal; font-size: .55rem; font-weight: 700; opacity: .8; }
  .name { display: flex; flex-direction: column; font-weight: 700; color: #eef1f8; }
  .name small { color: #5f6675; font-weight: 600; font-size: .72rem; }
  .cta { margin-top: 1.75rem; }
  .cta p { color: #a6adba; font-weight: 600; margin-bottom: .8rem; }
  .playBtn { display: inline-block; background: linear-gradient(135deg, #f2641e, #c24e12); color: #fff; font-weight: 800; padding: .8rem 1.8rem; border-radius: 12px; text-decoration: none; }
</style>
</head>
<body>
  <main class="main">
    <div class="card">
      <div class="kicker">A challenger built this five</div>
      <div class="record">${esc(record)}</div>
      <div class="gradeRow">
        <span class="grade">${esc(data.grade)}</span>
        <span class="pts">· ${esc(data.points)} pts</span>
      </div>
      <div class="challenge">Can you beat it?</div>
      <div class="lineup">${rows}
      </div>
      <div class="cta">
        <p>Draft your own all-time starting five and try to top this record.</p>
        <a class="playBtn" href="${SITE}/#game">Accept the challenge — build your five →</a>
      </div>
    </div>
  </main>
</body>
</html>`

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })
}
