// Efeitos cinematográficos: câmera virtual, fundo vivo, partículas, granulação,
// vinheta, tremida e transições. Tudo desenhado no canvas, sem imagens externas.

// ---------- câmera ----------
// keys: [{ t, x, y, z, d }] em coordenadas do "mundo" da cena.
// A posição de repouso é { x: 960, y: 540, z: 1 } (a tela inteira).
export function evalCam(keys, t) {
  const first = keys[0];
  let from = { x: first.x, y: first.y, z: first.z };
  let to = from, start = 0, dur = 1;
  const at = (tt) => {
    const k = ease.inOut(clamp((tt - start) / dur));
    return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), z: lerp(from.z, to.z, k) };
  };
  // vídeo 05: depois de chegar, a câmera continua andando devagar (empurrão lento + deriva),
  // para nunca ficar parada; o movimento seguinte parte de onde ela está.
  let drift = { dx: first.dx ?? 0, dy: first.dy ?? 0, dz: first.dz ?? 0.006 };
  const settle = (tt) => {
    const p = at(tt), since = Math.min(12, Math.max(0, tt - (start + dur)));
    const ramp = since < 1 ? since * since / 2 : since - 0.5; // entra suave
    return { x: p.x + drift.dx * ramp, y: p.y + drift.dy * ramp, z: p.z * (1 + drift.dz * ramp) };
  };
  for (let i = 1; i < keys.length; i++) {
    const kf = keys[i];
    if (kf.t > t) break;
    from = settle(kf.t);
    to = { x: kf.x ?? to.x, y: kf.y ?? to.y, z: kf.z ?? to.z };
    start = kf.t; dur = kf.d || 1.4;
    drift = { dx: kf.dx ?? 0, dy: kf.dy ?? 0, dz: kf.dz ?? 0.006 };
  }
  return settle(t);
}

// Camada com paralaxe: depth < 1 fica mais longe (anda menos), > 1 mais perto (anda mais).
export function layer(ctx, cam, depth, fn) {
  ctx.save();
  ctx.translate((cam.x - 960) * (1 - depth), (cam.y - 540) * (1 - depth));
  fn();
  ctx.restore();
}

// Câmera "viva": leve respiração e deriva, aproximação lenta e tremida nos impactos.
export function liveCam(cam, t, impacts, seed) {
  const s = seed || 0;
  let { x, y, z } = cam;
  x += 9 * Math.sin(t * 0.21 + s) + 4 * Math.sin(t * 0.53 + s * 2);
  y += 6 * Math.sin(t * 0.17 + s * 3) + 3 * Math.cos(t * 0.47 + s);
  z *= 1 + 0.006 * Math.sin(t * 0.31 + s);
  let rot = 0.0035 * Math.sin(t * 0.13 + s);
  for (const ti of impacts || []) {
    const dt = t - ti;
    if (dt < 0 || dt > 0.7) continue;
    const a = Math.exp(-dt * 7);
    x += 16 * a * Math.sin(dt * 95);
    y += 12 * a * Math.cos(dt * 83);
    rot += 0.006 * a * Math.sin(dt * 70);
    z *= 1 + 0.035 * a;
  }
  return { x, y, z, rot };
}

export function applyCam(ctx, c) {
  ctx.translate(W / 2, H / 2);
  ctx.rotate(c.rot || 0);
  ctx.scale(c.z, c.z);
  ctx.translate(-c.x, -c.y);
}

// ---------- fundo ----------
// O fundo de cores é desenhado em baixa resolução e ampliado (é todo desfocado mesmo).
let BG = null;
export function backgroundLive(ctx, t, cam, accent) {
  if (!BG) { BG = document.createElement('canvas'); BG.width = 384; BG.height = 216; }
  const g2 = BG.getContext('2d');
  const sx = BG.width / W;
  g2.setTransform(sx, 0, 0, sx, 0, 0);
  const g = g2.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#070b16');
  g.addColorStop(1, '#0f1830');
  g2.fillStyle = g;
  g2.fillRect(0, 0, W, H);
  const blobs = [
    [0.25, 0.3, 700, accent, 0.20, 0.07],
    [0.8, 0.7, 800, '#1d4ed8', 0.16, 0.05],
    [0.6, 0.15, 600, '#7c3aed', 0.10, 0.09],
  ];
  for (const [bx, by, r, col, a, sp] of blobs) {
    const px = bx * W + Math.sin(t * sp + bx * 9) * 160 - (cam.x - 960) * 0.08;
    const py = by * H + Math.cos(t * sp * 1.3 + by * 7) * 110 - (cam.y - 540) * 0.08;
    const rg = g2.createRadialGradient(px, py, 0, px, py, r);
    rg.addColorStop(0, hexA(col, a));
    rg.addColorStop(1, hexA(col, 0));
    g2.fillStyle = rg;
    g2.fillRect(0, 0, W, H);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(BG, 0, 0, W, H);
  // grade em perspectiva leve, com paralaxe da câmera
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  const step = 90 * Math.sqrt(cam.z);
  const ox = (-(cam.x - 960) * 0.35 * cam.z) % step;
  const oy = (-(cam.y - 540) * 0.35 * cam.z + t * 5) % step;
  ctx.beginPath();
  for (let x = ox - step; x < W + step; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = oy - step; y < H + step; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  ctx.restore();
}

// ---------- partículas de poeira ----------
const DUST = Array.from({ length: 70 }, (_, i) => {
  const r = (n) => { const v = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return v - Math.floor(v); };
  return { x: r(1), y: r(2), s: 1 + r(3) * 2.6, v: 6 + r(4) * 18, d: 0.25 + r(5) * 0.9, a: 0.08 + r(6) * 0.22, ph: r(7) * 6.28 };
});
export function dust(ctx, t, cam) {
  ctx.save();
  for (const p of DUST) {
    let x = (p.x * W + Math.sin(t * 0.3 + p.ph) * 30 - (cam.x - 960) * p.d * 0.6) % W;
    let y = (p.y * H - t * p.v - (cam.y - 540) * p.d * 0.6) % H;
    if (x < 0) x += W; if (y < 0) y += H;
    const tw = 0.6 + 0.4 * Math.sin(t * 1.7 + p.ph);
    ctx.globalAlpha = p.a * tw;
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath(); ctx.arc(x, y, p.s * (0.7 + p.d * 0.5), 0, 6.283); ctx.fill();
  }
  ctx.restore();
}

// ---------- granulação de filme e vinheta ----------
let GRAIN = null;
function grainCanvas() {
  if (GRAIN) return GRAIN;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  GRAIN = c;
  return c;
}
export function grain(ctx, t) {
  const c = grainCanvas();
  const ox = 0, oy = 0; // granulação fixa: dá textura sem pesar no arquivo
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = ctx.createPattern(c, 'repeat');
  ctx.translate(-ox, -oy);
  ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}
let VIG = null;
export function vignette(ctx) {
  if (!VIG) {
    VIG = document.createElement('canvas'); VIG.width = W; VIG.height = H;
    const g = VIG.getContext('2d');
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 1.0);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.62)');
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
  }
  ctx.drawImage(VIG, 0, 0);
}

// Clarão suave usado nas transições e revelações.
export function flash(ctx, k, color = '#ffffff') {
  if (k <= 0) return;
  const rg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
  rg.addColorStop(0, hexA(color, 0.28 * k));
  rg.addColorStop(1, hexA(color, 0));
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);
}

// ---------- tipografia ----------
// Texto com brilho colorido.
export function glowText(ctx, str, x, y, o = {}) {
  ctx.save();
  ctx.shadowColor = o.glow || 'rgba(255,255,255,0.5)';
  ctx.shadowBlur = o.blur || 30;
  text(ctx, str, x, y, o);
  ctx.restore();
}

// Palavra que "bate" na tela: entra grande e assenta.
export function punchText(ctx, t, t0, str, x, y, o = {}) {
  const k = prog(t, t0, 0.45);
  if (k <= 0) return;
  const out = o.until != null ? 1 - prog(t, o.until, 0.35) : 1;
  if (out <= 0) return;
  const s = lerp(1.35, 1, ease.out(k));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  glowText(ctx, str, 0, 0, { ...o, alpha: ease.out(k) * out });
  ctx.restore();
}

// Valor que conta de `from` até `to` entre t0 e t0+dur.
export function counting(t, t0, dur, from, to) {
  return lerp(from, to, ease.out(prog(t, t0, dur)));
}

// Anel de choque que se expande (para impactos).
export function shockRing(ctx, t, t0, x, y, color, r0 = 60, r1 = 360) {
  const k = prog(t, t0, 0.8);
  if (k <= 0 || k >= 1) return;
  ctx.save();
  ctx.globalAlpha = (1 - k) * 0.7;
  ctx.strokeStyle = color;
  ctx.lineWidth = 6 * (1 - k) + 1;
  ctx.beginPath();
  ctx.arc(x, y, lerp(r0, r1, ease.out(k)), 0, 6.283);
  ctx.stroke();
  ctx.restore();
}

// Faíscas que saem de um ponto (para revelações).
export function sparks(ctx, t, t0, x, y, color, n = 18) {
  const k = prog(t, t0, 0.9);
  if (k <= 0 || k >= 1) return;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283 + i * 0.37;
    const sp = 140 + ((i * 53) % 90) * 2.2;
    const d = sp * ease.out(k);
    ctx.globalAlpha = (1 - k) * 0.9;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 5 * (1 - k) + 1.5, 0, 6.283);
    ctx.fill();
  }
  ctx.restore();
}
