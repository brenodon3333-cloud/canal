// Biblioteca de desenho do canal Bovonel.
// Tudo é desenhado em um canvas 1920x1080. Nenhuma imagem externa é usada.

export const W = 1920;
export const H = 1080;
export const SAFE_BOTTOM = 890; // abaixo disso fica livre para legendas

export const C = {
  bg1: '#0a101d',
  bg2: '#121c33',
  text: '#f1f5f9',
  muted: '#94a3b8',
  dim: 'rgba(148,163,184,0.35)',
  line: 'rgba(255,255,255,0.10)',
  card: 'rgba(255,255,255,0.055)',
  petro: '#3b82f6',
  etanol: '#84cc16',
  icms: '#f59e0b',
  fed: '#ef4444',
  dist: '#a855f7',
  gas: '#fb923c',
  gold: '#facc15',
  led: '#ffb020',
};

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const prog = (t, start, dur) => clamp((t - start) / dur);
export const ease = {
  in: (k) => k * k * k,
  out: (k) => 1 - Math.pow(1 - k, 3),
  inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  back: (k) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
  },
};
// Entrada padrão: 0 -> 1 com easing, começando em `start`.
export const appear = (t, start, dur = 0.6, fn = ease.out) => fn(prog(t, start, dur));

export function brl(v, dec = 2) {
  const s = v.toFixed(dec).replace('.', ',');
  return 'R$ ' + s;
}

export function font(size, weight = 700) {
  return `${weight} ${size}px "Noto Sans", sans-serif`;
}

export function text(ctx, str, x, y, o = {}) {
  const {
    size = 56, weight = 700, color = C.text, align = 'center',
    baseline = 'middle', alpha = 1, maxWidth, shadow = false, letter = 0,
  } = o;
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = font(size, weight);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (letter) ctx.letterSpacing = `${letter}px`;
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;
  }
  if (maxWidth) ctx.fillText(str, x, y, maxWidth);
  else ctx.fillText(str, x, y);
  ctx.restore();
}

export function measure(ctx, str, size, weight = 700) {
  ctx.save();
  ctx.font = font(size, weight);
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}

export function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

export function fillRR(ctx, x, y, w, h, r, color, alpha = 1) {
  if (w <= 0 || h <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  rr(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();
}

export function strokeRR(ctx, x, y, w, h, r, color, lw = 2, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  rr(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.restore();
}

export function circle(ctx, x, y, r, color, alpha = 1) {
  if (r <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// Fundo comum a todas as cenas.
export function background(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, C.bg1);
  g.addColorStop(1, C.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // grade sutil que se move devagar
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  const step = 80;
  const off = (t * 6) % step;
  ctx.beginPath();
  for (let x = -step + off; x < W + step; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = -step + off; y < H + step; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  ctx.restore();

  // vinheta
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

// Marca do canal no canto superior esquerdo.
export function brand(ctx, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha * 0.85;
  // etiqueta de preço
  ctx.translate(64, 52);
  ctx.fillStyle = C.gold;
  ctx.beginPath();
  ctx.moveTo(0, 14); ctx.lineTo(14, 0); ctx.lineTo(44, 0); ctx.lineTo(44, 28); ctx.lineTo(14, 28);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 13, 14, 4, C.bg1);
  ctx.restore();
  text(ctx, 'BOVONEL', 122, 67, { size: 24, weight: 800, align: 'left', color: C.text, alpha: alpha * 0.85, letter: 3 });
}

// Fonte do dado, no canto superior direito (fora da área de legenda).
export function source(ctx, str, alpha = 1) {
  text(ctx, 'Fonte: ' + str, W - 64, 67, { size: 22, weight: 500, align: 'right', color: C.muted, alpha });
}

export function card(ctx, x, y, w, h, alpha = 1, accent) {
  fillRR(ctx, x, y, w, h, 22, C.card, alpha);
  strokeRR(ctx, x, y, w, h, 22, C.line, 2, alpha);
  if (accent) fillRR(ctx, x, y + 18, 8, h - 36, 4, accent, alpha);
}

// Cartão de fato com entrada deslizando da direita.
export function factCard(ctx, t, start, x, y, w, h, str, accent, o = {}) {
  const k = appear(t, start, 0.7);
  if (k <= 0) return;
  const dx = (1 - k) * 60;
  ctx.save();
  ctx.translate(dx, 0);
  card(ctx, x, y, w, h, k, accent);
  const size = o.size || 40;
  if (o.sub) {
    text(ctx, str, x + 44, y + h / 2 - 20, { size, align: 'left', alpha: k, maxWidth: w - 70 });
    text(ctx, o.sub, x + 44, y + h / 2 + 26, { size: 28, weight: 500, color: C.muted, align: 'left', alpha: k, maxWidth: w - 70 });
  } else {
    text(ctx, str, x + 44, y + h / 2 + 2, { size, align: 'left', alpha: k, maxWidth: w - 70 });
  }
  ctx.restore();
}

// ---------- ícones (desenhados com formas simples) ----------

export function iconPlatform(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // pernas
  ctx.beginPath();
  ctx.moveTo(-34, 50); ctx.lineTo(-26, 0); ctx.moveTo(34, 50); ctx.lineTo(26, 0);
  ctx.moveTo(-30, 25); ctx.lineTo(30, 25);
  ctx.stroke();
  // convés
  ctx.fillRect(-46, -8, 92, 12);
  // torre
  ctx.beginPath();
  ctx.moveTo(-14, -8); ctx.lineTo(0, -60); ctx.lineTo(14, -8);
  ctx.moveTo(-9, -28); ctx.lineTo(9, -28);
  ctx.stroke();
  // ondas
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = -60; i <= 60; i += 20) {
    ctx.moveTo(i - 10, 42); ctx.quadraticCurveTo(i - 5, 36, i, 42); ctx.quadraticCurveTo(i + 5, 48, i + 10, 42);
  }
  ctx.stroke();
  ctx.restore();
}

export function iconRefinery(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  rr(ctx, -50, 10, 100, 40, 6); ctx.fill();
  rr(ctx, -40, -40, 18, 52, 6); ctx.fill();
  rr(ctx, -12, -55, 18, 67, 6); ctx.fill();
  rr(ctx, 18, -25, 26, 37, 8); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(-40, 24, 80, 6);
  ctx.restore();
}

export function iconDistributor(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  // dois tanques cilíndricos
  for (const dx of [-26, 26]) {
    rr(ctx, dx - 22, -30, 44, 76, 10); ctx.fill();
    ctx.beginPath(); ctx.ellipse(dx, -30, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-48, 4, 44, 5); ctx.fillRect(4, 4, 44, 5);
  ctx.restore();
}

export function iconCane(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = 9;
  for (const [dx, h] of [[-24, 90], [0, 104], [24, 84]]) {
    ctx.beginPath(); ctx.moveTo(dx, 50); ctx.lineTo(dx, 50 - h); ctx.stroke();
    ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3;
    for (let yy = 50 - 22; yy > 50 - h; yy -= 22) { ctx.beginPath(); ctx.moveTo(dx - 5, yy); ctx.lineTo(dx + 5, yy); ctx.stroke(); }
    ctx.restore();
  }
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -40); ctx.quadraticCurveTo(-30, -60, -46, -44);
  ctx.moveTo(0, -40); ctx.quadraticCurveTo(30, -64, 48, -48);
  ctx.moveTo(-24, -26); ctx.quadraticCurveTo(-44, -36, -52, -18);
  ctx.moveTo(24, -20); ctx.quadraticCurveTo(44, -34, 54, -14);
  ctx.stroke();
  ctx.restore();
}

export function iconTruck(ctx, x, y, s, color, tankColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = tankColor || color;
  rr(ctx, -60, -26, 82, 44, 20); ctx.fill();
  ctx.fillStyle = color;
  rr(ctx, 26, -22, 34, 40, 8); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  rr(ctx, 40, -16, 14, 14, 3); ctx.fill();
  ctx.fillStyle = '#0b1220';
  for (const dx of [-40, -10, 44]) { ctx.beginPath(); ctx.arc(dx, 24, 11, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#cbd5e1';
  for (const dx of [-40, -10, 44]) { ctx.beginPath(); ctx.arc(dx, 24, 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

export function iconPump(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  rr(ctx, -36, -50, 52, 100, 10); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  rr(ctx, -26, -38, 32, 24, 4); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(16, -20); ctx.lineTo(34, -20); ctx.lineTo(34, 24); ctx.quadraticCurveTo(34, 34, 26, 34);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillRect(-44, 46, 68, 8);
  ctx.restore();
}

export function iconBank(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-54, -18); ctx.lineTo(0, -52); ctx.lineTo(54, -18); ctx.closePath(); ctx.fill();
  for (const dx of [-38, -13, 13, 38]) ctx.fillRect(dx - 7, -12, 14, 48);
  ctx.fillRect(-54, 38, 108, 12);
  ctx.restore();
}

export function iconCoin(ctx, x, y, r, color, label = 'R$') {
  circle(ctx, x, y, r, color);
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  text(ctx, label, x, y + r * 0.04, { size: r * 0.62, weight: 900, color: 'rgba(0,0,0,0.55)' });
}

export function iconDrop(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -55);
  ctx.bezierCurveTo(10, -35, 40, -5, 40, 18);
  ctx.arc(0, 18, 40, 0, Math.PI, false);
  ctx.bezierCurveTo(-40, -5, -10, -35, 0, -55);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(-14, 14, 7, 14, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Pequenos ícones para a grade de custos do posto.
export function miniIcon(ctx, kind, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'truck') {
    ctx.restore();
    iconTruck(ctx, x, y, s * 0.9, color);
    return;
  } else if (kind === 'person') {
    ctx.beginPath(); ctx.arc(0, -24, 20, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-38, 46); ctx.quadraticCurveTo(-38, 2, 0, 2); ctx.quadraticCurveTo(38, 2, 38, 46); ctx.closePath(); ctx.fill();
  } else if (kind === 'house') {
    ctx.beginPath(); ctx.moveTo(-46, -4); ctx.lineTo(0, -46); ctx.lineTo(46, -4); ctx.stroke();
    ctx.fillRect(-32, -6, 64, 50);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-10, 14, 20, 30);
  } else if (kind === 'bolt') {
    ctx.beginPath(); ctx.moveTo(10, -50); ctx.lineTo(-28, 6); ctx.lineTo(0, 6); ctx.lineTo(-10, 50); ctx.lineTo(28, -6); ctx.lineTo(0, -6); ctx.closePath(); ctx.fill();
  } else if (kind === 'card') {
    rr(ctx, -46, -30, 92, 60, 10); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-46, -14, 92, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-34, 12, 26, 8);
  } else if (kind === 'chart') {
    ctx.beginPath(); ctx.moveTo(-44, 40); ctx.lineTo(-14, 6); ctx.lineTo(8, 22); ctx.lineTo(42, -26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(42, -26); ctx.lineTo(20, -24); ctx.moveTo(42, -26); ctx.lineTo(40, -4); ctx.stroke();
  }
  ctx.restore();
}

// Barra do litro (empilhada), usada nas cenas das fatias.
export function literBar(ctx, t, slices, upto, current, startK) {
  const x = 140, y = 800, w = W - 280, h = 40;
  const total = slices.reduce((s, a) => s + a.val, 0);
  text(ctx, 'O litro de R$ 6,54', x, y - 34, { size: 28, weight: 600, color: C.muted, align: 'left' });
  fillRR(ctx, x, y, w, h, 12, 'rgba(255,255,255,0.06)');
  ctx.save();
  rr(ctx, x, y, w, h, 12);
  ctx.clip();
  let cx = x;
  for (let i = 0; i < slices.length; i++) {
    const sw = (slices[i].val / total) * w;
    if (i < upto) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = slices[i].color;
      ctx.fillRect(cx, y, sw, h);
    } else if (i === current) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = slices[i].color;
      ctx.fillRect(cx, y, sw * startK, h);
    }
    cx += sw;
  }
  ctx.restore();
}
