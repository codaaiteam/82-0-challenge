// Client-side share poster — draws the result card to a canvas and downloads a PNG.

export function downloadPoster({
  brand,          // "82-0 CHALLENGE" | "20-0 CHALLENGE"
  record,         // "78-4"
  grade,          // "A"
  title,          // "Almost Undefeated"
  points,         // 92.5
  lineup,         // [{ pos, name, sub }]
  url,            // "82-0-challenge.com"
  daily,          // optional daily label, e.g. "Daily Challenge · 2026-06-06"
}) {
  const W = 1080, H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#131a2b');
  bg.addColorStop(1, '#0a0e1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // subtle top glow
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 700);
  glow.addColorStop(0, 'rgba(255,138,41,0.18)');
  glow.addColorStop(1, 'rgba(255,138,41,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 700);

  ctx.textAlign = 'center';

  // brand
  ctx.fillStyle = '#ff8a29';
  ctx.font = '900 64px Inter, -apple-system, sans-serif';
  ctx.fillText(brand, W / 2, 130);

  // daily badge
  let y = 200;
  if (daily) {
    ctx.fillStyle = '#9fb0d0';
    ctx.font = '700 34px Inter, -apple-system, sans-serif';
    ctx.fillText(daily.toUpperCase(), W / 2, y);
    y += 40;
  }

  // record
  const recGrad = ctx.createLinearGradient(0, y + 40, 0, y + 260);
  recGrad.addColorStop(0, '#ffd089');
  recGrad.addColorStop(1, '#ff5e3a');
  ctx.fillStyle = recGrad;
  ctx.font = '900 230px Inter, -apple-system, sans-serif';
  ctx.fillText(record, W / 2, y + 240);

  // grade row
  ctx.fillStyle = '#eef1f8';
  ctx.font = '800 44px Inter, -apple-system, sans-serif';
  ctx.fillText(`${grade}  ·  ${title}  ·  ${points} pts`, W / 2, y + 330);

  // lineup
  const slotColors = ['#ff8a29', '#38bdf8', '#34d399', '#a78bfa', '#fb7185'];
  let ly = y + 430;
  ctx.textAlign = 'left';
  lineup.forEach((p, i) => {
    // chip
    ctx.fillStyle = '#1a2236';
    roundRect(ctx, 120, ly - 44, W - 240, 64, 14);
    ctx.fill();
    ctx.fillStyle = slotColors[i % slotColors.length];
    ctx.font = '900 30px Inter, -apple-system, sans-serif';
    ctx.fillText(p.pos, 150, ly);
    ctx.fillStyle = '#eef1f8';
    ctx.font = '700 32px Inter, -apple-system, sans-serif';
    ctx.fillText(p.name, 260, ly);
    ctx.fillStyle = '#5d6c8d';
    ctx.font = '600 26px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(p.sub, W - 150, ly);
    ctx.textAlign = 'left';
    ly += 84;
  });

  // footer url
  ctx.textAlign = 'center';
  ctx.fillStyle = '#9fb0d0';
  ctx.font = '700 36px Inter, -apple-system, sans-serif';
  ctx.fillText(url, W / 2, H - 70);

  // download
  const a = document.createElement('a');
  a.download = `${brand.toLowerCase().replace(/\s+/g, '-')}-${record}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
