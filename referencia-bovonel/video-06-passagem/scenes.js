// Vídeo 06: Por que a passagem de avião está tão cara (e quem fica com cada real).
// Cada cena recebe K(frase) = instante (s, relativo à cena) em que a frase começa na narração.
// Conceito: o aeroporto é o palco e o painel de partidas é o fio condutor; o cartão de embarque se destaca em canhotos.
// Regras dos vídeos 04 e 05: câmera sempre andando, paralaxe em camadas, transições discretas (corte ou 'push'),
// uma só virada de efeito (o painel inteiro virando "CANCELADO" na cena 5), sem música (só ambiente quase inaudível).
import { W, H, C, clamp, lerp, prog, ease, appear, text, font, rr, fillRR, strokeRR, circle, hexA, source } from './lib.js';
import { glowText, counting, shockRing, sparks, layer } from './fx.js';

// cores fixas do canal por tipo de fatia: matéria-prima verde (combustível), cadeia roxo (o avião alugado),
// União vermelho (imposto), empresa azul (operação e lucro)
const P = {
  comb: '#84cc16', aviao: '#a855f7', imposto: '#ef4444', lucro: '#60a5fa', resto: '#3b82f6', estado: '#f59e0b',
  ink: '#1d2230', paper: '#f7f5ef', red: '#dc2626', ok: '#4ade80', dolar: '#22c55e', amber: '#fbbf24', sky: '#38bdf8',
  board: '#0b0f17', flap: '#161b25', flapTxt: '#f5d76e',
};
const vis = (t, a, b, fin = 0.4, fout = 0.4) => Math.min(appear(t, a, fin), 1 - appear(t, b, fout));
// Estação do cenário: some quando a câmera está longe dela.
function zone(ctx, cam, a, b, fn) {
  const d = cam.x < a ? a - cam.x : cam.x > b ? cam.x - b : 0, al = 1 - clamp((d - 150) / 350);
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha *= al; fn(); ctx.restore();
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const MONO = (size, w = 700) => `${w} ${size}px "DejaVu Sans Mono", "Liberation Mono", monospace`;
function mono(ctx, str, x, y, size, color = P.ink, align = 'left', w = 700) {
  ctx.save(); ctx.font = MONO(size, w); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore();
}


// ================================================================ tipografia caprichada
// Título com profundidade: extrusão escura, contorno, degradê e marca-texto opcional atrás.
function headline(ctx, str, x, y, o = {}) {
  const { size = 72, color = '#ffffff', color2 = null, align = 'center', hl = null, k = 1, rot = 0, letter = 0 } = o;
  if (k <= 0) return 0;
  const depth = o.depth ?? Math.max(3, Math.round(size / 14));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const kk = clamp(k), sc = o.noPop ? 1 : lerp(1.22, 1, ease.out(kk));
  ctx.scale(sc, sc); ctx.globalAlpha *= clamp(kk * 1.8);
  ctx.font = font(size, 900); ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (letter) ctx.letterSpacing = `${letter}px`;
  const w = ctx.measureText(str).width;
  const x0 = align === 'left' ? 0 : align === 'center' ? -w / 2 : -w;
  if (hl) {
    const pad = size * 0.2, hk = ease.out(clamp(kk * 1.4)), L = x0 - pad, R = L + (w + 2 * pad) * hk, T0 = -size * 0.6, B0 = size * 0.52;
    ctx.save(); ctx.fillStyle = hl; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.moveTo(L, T0 + 5); ctx.lineTo(R, T0); ctx.lineTo(R + 9, (T0 + B0) / 2); ctx.lineTo(R - 3, B0); ctx.lineTo(L + 4, B0 + 5); ctx.lineTo(L - 9, (T0 + B0) / 2 + 3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = depth + 4;
  ctx.fillStyle = '#05070d'; ctx.fillText(str, depth * 0.45, depth); ctx.restore();
  ctx.fillStyle = '#05070d'; for (let i = depth - 1; i > 0; i--) ctx.fillText(str, i * 0.45, i);
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(4, size / 9); ctx.strokeStyle = '#05070d'; ctx.strokeText(str, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.45); g.addColorStop(0, color); g.addColorStop(1, color2 || color);
  ctx.fillStyle = g; ctx.fillText(str, 0, 0);
  ctx.restore();
  return w;
}
// Legenda de apoio: peso forte, sombra curta e cor clara.
function cap(ctx, str, x, y, o = {}) {
  text(ctx, str, x, y, { size: o.size || 34, weight: o.weight || 800, color: o.color || '#e2e8f0', align: o.align || 'center', alpha: o.alpha ?? 1, shadow: true, letter: o.letter || 0 });
}
// Valor em destaque (número com brilho) que entra subindo.
function bigNum(ctx, str, x, y, k, o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 26);
  glowText(ctx, str, 0, 0, { size: o.size || 96, weight: 900, color: o.color || '#ffffff', glow: o.glow || hexA(o.color || '#ffffff', 0.55), blur: 34, align: o.align || 'center' });
  ctx.restore();
}
// Carimbo oval (tinta com falhas)
function ovalStamp(ctx, cx, cy, rx, ry, lines, color, k = 1, rot = -0.12) {
  if (k <= 0) return;
  const sc = lerp(1.6, 1, ease.out(clamp(k * 1.4)));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2) * 0.92;
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(3, ry * 0.07);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283); ctx.stroke();
  ctx.lineWidth = Math.max(2, ry * 0.035); ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.88, ry * 0.84, 0, 0, 6.283); ctx.stroke();
  lines.forEach(([str, dy, size, weight = 900], i) => text(ctx, str, 0, dy * ry, { size: size * ry, weight, color, letter: i === 1 ? 2 : 1 }));
  const r = rng(Math.round(rx * 7));
  ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 60; i++) { const a = r() * 6.283, d = r(); ctx.beginPath(); ctx.arc(Math.cos(a) * rx * d, Math.sin(a) * ry * d, 1 + r() * 2.5, 0, 6.283); ctx.fill(); }
  ctx.restore();
}
// Carimbo retangular grande (imposto do pecado)
function rectStamp(ctx, cx, cy, w, h, str, color, k = 1, rot = -0.08, size = 64) {
  if (k <= 0) return;
  const sc = lerp(1.8, 1, ease.out(clamp(k * 1.5)));
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2.2) * 0.96;
  // fundo de papel (adesivo), para o carimbo vermelho ler em cima de qualquer coisa
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8; fillRR(ctx, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 18, '#f3efe4'); ctx.restore();
  ctx.strokeStyle = color; ctx.lineWidth = 9; strokeRR(ctx, -w / 2, -h / 2, w, h, 14, color, 9);
  strokeRR(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 8, color, 3);
  text(ctx, str, 0, 2, { size, weight: 900, color, letter: 3 });
  const r = rng(Math.round(w)); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.55)';
  for (let i = 0; i < 90; i++) { ctx.beginPath(); ctx.arc((r() - 0.5) * w, (r() - 0.5) * h, 1 + r() * 3, 0, 6.283); ctx.fill(); }
  ctx.restore();
}
// seta desenhada (sem caractere de seta)
function arrow(ctx, x0, y0, x1, y1, color, lw = 6, k = 1) {
  if (k <= 0) return;
  const x = lerp(x0, x1, k), y = lerp(y0, y1, k), a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x - Math.cos(a) * lw * 2, y - Math.sin(a) * lw * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a - 0.45) * lw * 4, y - Math.sin(a - 0.45) * lw * 4); ctx.lineTo(x - Math.cos(a + 0.45) * lw * 4, y - Math.sin(a + 0.45) * lw * 4); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function check(ctx, x, y, s, color, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 10 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pts = [[-30, 0], [-8, 22], [34, -24]], L1 = 31, L2 = 63, d = (L1 + L2) * clamp(k);
  ctx.beginPath(); ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
  if (d <= L1) ctx.lineTo(x + lerp(pts[0][0], pts[1][0], d / L1) * s, y + lerp(pts[0][1], pts[1][1], d / L1) * s);
  else { ctx.lineTo(x + pts[1][0] * s, y + pts[1][1] * s); const q = (d - L1) / L2; ctx.lineTo(x + lerp(pts[1][0], pts[2][0], q) * s, y + lerp(pts[1][1], pts[2][1], q) * s); }
  ctx.stroke(); ctx.restore();
}
function crossOut(ctx, x0, y0, x1, y1, color, k = 1, lw = 10) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, clamp(k)), lerp(y0, y1, clamp(k))); ctx.stroke(); ctx.restore();
}


function moeda(ctx, x, y, r, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, o.flat ?? 1);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  const gold = o.prata ? ['#f3f4f6', '#9ca3af'] : ['#fde68a', '#b7791f'];
  g.addColorStop(0, gold[0]); g.addColorStop(1, gold[1]);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = r * 0.4; ctx.shadowOffsetY = r * 0.12; circle(ctx, 0, 0, r, gold[1]); ctx.restore();
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.94, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(80,50,10,0.35)'; ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, 6.283); ctx.stroke();
  text(ctx, o.label || 'R$', 0, 2, { size: r * 0.62, weight: 900, color: o.prata ? '#4b5563' : '#7c4a03' });
  ctx.restore();
}
function chip(ctx, x, y, str, color, k, o = {}) { // etiqueta arredondada que entra
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(x, y); const sc = lerp(0.6, 1, ease.back(clamp(k))); ctx.scale(sc, sc);
  ctx.font = font(o.size || 30, 900); const w = ctx.measureText(str).width + 50, h = (o.size || 30) * 1.7;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, o.bg || '#0b1222'); ctx.restore();
  strokeRR(ctx, -w / 2, -h / 2, w, h, h / 2, color, 4);
  text(ctx, str, 0, 2, { size: o.size || 30, weight: 900, color: o.fg || color });
  ctx.restore();
}


// ================================================================ cenário: saguão do aeroporto (fundo com paralaxe e desfoque)
// janelões para a pista no fim de tarde, pilares, luminárias do teto e aviões parados lá fora.
let HALL = null;
function saguaoFundo(ctx, cam, a = 1, noite = 0) {
  if (!HALL) {
    const Wd = 2600, Hd = 1400;
    const c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 900); sky.addColorStop(0, '#1b2a4a'); sky.addColorStop(0.55, '#3b3f6b'); sky.addColorStop(0.8, '#a65a4a'); sky.addColorStop(1, '#2a1a22');
    g.fillStyle = sky; g.fillRect(0, 0, Wd, 900);
    g.fillStyle = '#141820'; g.fillRect(0, 860, Wd, 540); // pátio
    g.fillStyle = 'rgba(250,204,21,0.35)'; for (let x = 0; x < Wd; x += 120) g.fillRect(x, 960, 60, 6); // faixa do pátio
    const r = rng(9);
    for (let i = 0; i < 4; i++) { // aviões parados (silhuetas)
      const x = 200 + i * 640 + r() * 80, y = 840, s = 1.4 + r() * 0.5;
      g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#0c1018';
      g.beginPath(); g.moveTo(-160, 0); g.quadraticCurveTo(-170, -22, -140, -26); g.lineTo(140, -26); g.quadraticCurveTo(175, -20, 180, -8); g.lineTo(170, 2); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-130, -26); g.lineTo(-165, -86); g.lineTo(-140, -86); g.lineTo(-95, -26); g.closePath(); g.fill();
      g.fillRect(-40, -6, 90, 10); g.restore();
    }
    for (let x = 0; x < Wd; x += 325) { g.fillStyle = '#0a0d14'; g.fillRect(x, 0, 40, Hd); } // montantes dos janelões
    g.fillStyle = '#0a0d14'; g.fillRect(0, 0, Wd, 90); g.fillRect(0, 1060, Wd, 340); // teto e piso
    for (let x = 60; x < Wd; x += 160) { const lg = g.createRadialGradient(x, 60, 0, x, 60, 90); lg.addColorStop(0, 'rgba(255,240,210,0.55)'); lg.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = lg; g.fillRect(x - 90, 0, 180, 180); }
    const fl = g.createLinearGradient(0, 1060, 0, 1400); fl.addColorStop(0, 'rgba(160,170,200,0.25)'); fl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = fl; g.fillRect(0, 1060, Wd, 340); // reflexo do piso
    const tmp = document.createElement('canvas'); tmp.width = Wd; tmp.height = Hd; const t2 = tmp.getContext('2d');
    t2.filter = 'blur(12px)'; for (const dx of [-Wd, 0, Wd]) t2.drawImage(c, dx, 0); HALL = tmp;
  }
  layer(ctx, cam, 0.35, () => {
    ctx.save(); ctx.globalAlpha *= a;
    const cx = cam.x - (cam.x - 960) * 0.65, k0 = Math.floor((cx - 1500 + 340) / 2600), k1 = Math.floor((cx + 1500 + 340) / 2600);
    for (let k = k0; k <= k1; k++) ctx.drawImage(HALL, -340 + k * 2600, -160);
    ctx.fillStyle = `rgba(6,10,20,${0.5 + 0.25 * noite})`; ctx.fillRect(-340 + k0 * 2600, -160, (k1 - k0 + 1) * 2600, 1400);
    ctx.restore();
  });
}
// reflexos de vidro e luzes desfocadas perto da câmera (camada da frente)
function bokeh(ctx, cam, t, seed = 1, n = 12, color = '#ffe8c2', a = 0.12) {
  const r = rng(seed);
  layer(ctx, cam, 1.45, () => {
    for (let i = 0; i < n; i++) {
      const x = r() * 2600 - 340, y = r() * 1300 - 110, rad = 18 + r() * 50, ph = r() * 6.28;
      const g = ctx.createRadialGradient(x, y + Math.sin(t * 0.4 + ph) * 12, 0, x, y, rad);
      g.addColorStop(0, hexA(color, a * (0.6 + 0.4 * Math.sin(t * 0.7 + ph)))); g.addColorStop(1, hexA(color, 0));
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad - 14, rad * 2, rad * 2 + 28);
    }
  });
}

// ================================================================ painel de partidas (letras que viram, split-flap)
// rows: [{ c: ['07:40', 'AV 2207', 'PORTO VELHO', 'CONFIRMADO'], col: '#4ade80', tf, from: [...] }]
// tf = instante em que a linha vira para c; antes disso mostra `from` (ou vazio). o.title, o.clock
const FLAP_COLS = [5, 7, 15, 11];
const FLAP_CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:';
function flapStr(s, n) { s = (s || '').toUpperCase(); return (s + ' '.repeat(n)).slice(0, n); }
function painel(ctx, x, y, s, rows, t, o = {}) {
  const cw = 30, ch = 46, gap = 3, colGap = 26;
  const widths = FLAP_COLS.map((n) => n * (cw + gap) - gap);
  const inner = widths.reduce((a, b) => a + b, 0) + colGap * (FLAP_COLS.length - 1);
  const Wb = inner + 60, rowsN = o.rowsN || rows.length, Hb = 120 + rowsN * (ch + 16) + 30;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.alpha ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; fillRR(ctx, -Wb / 2, 0, Wb, Hb, 18, P.board); ctx.restore();
  strokeRR(ctx, -Wb / 2, 0, Wb, Hb, 18, '#2a3242', 4);
  fillRR(ctx, -Wb / 2, 0, Wb, 74, 18, '#121826'); ctx.fillStyle = '#121826'; ctx.fillRect(-Wb / 2, 40, Wb, 34);
  // ícone de avião decolando + título
  ctx.save(); ctx.translate(-Wb / 2 + 54, 38); ctx.rotate(-0.35); aviaoIcone(ctx, 0, 0, 0.9, P.flapTxt); ctx.restore();
  text(ctx, o.title || 'PARTIDAS', -Wb / 2 + 100, 38, { size: 34, weight: 900, color: P.flapTxt, align: 'left', letter: 4 });
  text(ctx, 'DEPARTURES', -Wb / 2 + 330, 40, { size: 20, weight: 700, color: '#8a93a6', align: 'left', letter: 3 });
  if (o.clock) mono(ctx, o.clock, Wb / 2 - 40, 38, 30, P.flapTxt, 'right', 800);
  // cabeçalho das colunas
  const heads = o.heads || ['HORA', 'VOO', 'DESTINO', 'OBSERVAÇÃO'];
  let cx0 = -inner / 2;
  heads.forEach((hd, i) => { text(ctx, hd, cx0, 100, { size: 18, weight: 800, color: '#7d8699', align: 'left', letter: 2 }); cx0 += widths[i] + colGap; });
  rows.forEach((row, ri) => {
    const yy = 120 + ri * (ch + 16);
    let xx = -inner / 2, idx = 0;
    FLAP_COLS.forEach((n, ci) => {
      const target = flapStr(row.c[ci], n), from = flapStr(row.from ? row.from[ci] : '', n);
      for (let k = 0; k < n; k++) {
        const settle = (row.tf ?? -1) + 0.18 + idx * 0.011 + (k % 3) * 0.02;
        let chv = t < (row.tf ?? -1) ? from[k] : t < settle ? FLAP_CH[Math.floor((t * 23 + k * 7 + ri * 3 + ci) % FLAP_CH.length)] : target[k];
        if (t >= (row.tf ?? -1) && t < settle && target[k] === ' ' && from[k] === ' ') chv = ' ';
        const flipping = t >= (row.tf ?? -1) && t < settle;
        const cx = xx + k * (cw + gap);
        fillRR(ctx, cx, yy, cw, ch, 4, P.flap);
        const sh = ctx.createLinearGradient(0, yy, 0, yy + ch); sh.addColorStop(0, 'rgba(255,255,255,0.06)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.25)');
        ctx.fillStyle = sh; ctx.fillRect(cx, yy, cw, ch);
        if (chv !== ' ') {
          const col = ci === 3 && !flipping && t >= (row.tf ?? -1) ? (row.col || P.flapTxt) : ci === 3 && t < (row.tf ?? -1) && row.fromCol ? row.fromCol : P.flapTxt;
          ctx.save(); if (flipping) { ctx.translate(cx + cw / 2, yy + ch / 2); ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.sin(t * 40 + k))); ctx.translate(-(cx + cw / 2), -(yy + ch / 2)); }
          mono(ctx, chv, cx + cw / 2, yy + ch / 2 + 2, 30, col, 'center', 800); ctx.restore();
        }
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(cx, yy + ch / 2 - 1, cw, 2);
        idx++;
      }
      xx += widths[ci] + colGap;
    });
  });
  ctx.restore();
  return { w: Wb * s, h: Hb * s };
}

// ================================================================ aviões
function aviaoIcone(ctx, x, y, s, color) { // avião visto de cima (pictograma), apontando para a direita
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-30, -3); ctx.lineTo(26, -4); ctx.quadraticCurveTo(36, 0, 26, 4); ctx.lineTo(-30, 3); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2, -3); ctx.lineTo(-14, -30); ctx.lineTo(-6, -30); ctx.lineTo(12, -3); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-2, 3); ctx.lineTo(-14, 30); ctx.lineTo(-6, 30); ctx.lineTo(12, 3); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-26, -2); ctx.lineTo(-34, -13); ctx.lineTo(-29, -13); ctx.lineTo(-20, -2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-26, 2); ctx.lineTo(-34, 13); ctx.lineTo(-29, 13); ctx.lineTo(-20, 2); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function aviaoLado(ctx, x, y, s, o = {}) { // jato de corredor único visto de lado, nariz à direita
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  if (o.shadow !== false) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(10, 90, 300, 16, 0, 0, 6.283); ctx.fill(); }
  const body = ctx.createLinearGradient(0, -40, 0, 40); body.addColorStop(0, '#f8fafc'); body.addColorStop(0.6, '#d7dde5'); body.addColorStop(1, '#9aa5b4');
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(-300, -10); ctx.quadraticCurveTo(-290, -38, -250, -38); ctx.lineTo(220, -38); ctx.quadraticCurveTo(300, -36, 320, 0); ctx.quadraticCurveTo(300, 36, 220, 38); ctx.lineTo(-240, 38); ctx.quadraticCurveTo(-290, 30, -300, -10); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = o.tail || '#1e3a8a'; ctx.beginPath(); ctx.moveTo(-250, -38); ctx.lineTo(-300, -150); ctx.lineTo(-250, -150); ctx.lineTo(-170, -38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = o.tail || '#1e3a8a'; ctx.fillRect(-240, 6, 470, 8);
  ctx.fillStyle = '#334155'; for (let i = 0; i < 22; i++) fillRR(ctx, -200 + i * 18, -20, 9, 12, 3, '#1f2937');
  ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.moveTo(262, -24); ctx.quadraticCurveTo(292, -22, 304, -8); ctx.lineTo(268, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(-40, 20); ctx.lineTo(80, 20); ctx.lineTo(-10, 70); ctx.lineTo(-70, 70); ctx.closePath(); ctx.fill(); // asa
  fillRR(ctx, -30, 44, 90, 34, 16, '#64748b'); fillRR(ctx, 50, 50, 14, 22, 5, '#1f2937'); // motor
  ctx.restore();
}
function turboelice(ctx, x, y, s) { // avião regional (turbo-hélice) de lado
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = ctx.createLinearGradient(0, -30, 0, 30); body.addColorStop(0, '#f8fafc'); body.addColorStop(1, '#a3adbb');
  ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(-200, -6); ctx.quadraticCurveTo(-190, -28, -160, -28); ctx.lineTo(150, -28); ctx.quadraticCurveTo(205, -24, 215, 0); ctx.quadraticCurveTo(200, 26, 150, 28); ctx.lineTo(-160, 28); ctx.quadraticCurveTo(-195, 22, -200, -6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0f766e'; ctx.beginPath(); ctx.moveTo(-160, -28); ctx.lineTo(-200, -110); ctx.lineTo(-165, -110); ctx.lineTo(-110, -28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#94a3b8'; ctx.fillRect(-60, -40, 170, 12); // asa alta
  fillRR(ctx, 20, -46, 70, 26, 10, '#64748b'); ctx.fillStyle = '#e2e8f0'; ctx.fillRect(92, -62, 5, 58); // motor e hélice
  for (let i = 0; i < 14; i++) fillRR(ctx, -140 + i * 18, -14, 9, 11, 3, '#1f2937');
  ctx.restore();
}

// ================================================================ cartão de embarque (layout real) que se destaca em canhotos
// o: { nome, de, para, voo, data, portao, assento, embarque, tarifa, parts: [{ f, color, k, dy, rot, lab, sub }], a }
const PASS_W = 1500, PASS_H = 440, PASS_TEX = {};
function passTexture(o) {
  const SC = 1.6, c = document.createElement('canvas'); c.width = PASS_W * SC; c.height = PASS_H * SC;
  const g = c.getContext('2d'); g.scale(SC, SC); g.translate(PASS_W / 2, PASS_H / 2);
  cartaoDesenho(g, o);
  return c;
}
function cartaoDesenho(ctx, o) {
  const L = -PASS_W / 2, T = -PASS_H / 2;
    const pg = ctx.createLinearGradient(L, T, L, T + PASS_H); pg.addColorStop(0, '#fbfcfe'); pg.addColorStop(1, '#e9edf3');
    ctx.fillStyle = pg; rr(ctx, L, T, PASS_W, PASS_H, 22); ctx.fill();
    ctx.save(); rr(ctx, L, T, PASS_W, PASS_H, 22); ctx.clip();
    ctx.fillStyle = '#1e3a8a'; ctx.fillRect(L, T, PASS_W, 86);
    text(ctx, 'CARTÃO DE EMBARQUE', L + 40, T + 44, { size: 30, weight: 900, color: '#ffffff', align: 'left', letter: 4 });
    text(ctx, 'BOARDING PASS', L + 470, T + 46, { size: 18, weight: 700, color: '#93c5fd', align: 'left', letter: 3 });
    ctx.save(); ctx.translate(L + PASS_W - 380, T + 44); ctx.rotate(-0.25); aviaoIcone(ctx, 0, 0, 1.1, '#ffffff'); ctx.restore();
    const F = (lab, val, fx, fy, size = 40) => { text(ctx, lab, fx, fy, { size: 16, weight: 800, color: '#64748b', align: 'left', letter: 2 }); text(ctx, val, fx, fy + 40, { size, weight: 900, color: '#0f172a', align: 'left' }); };
    F('PASSAGEIRO / NAME', o.nome || 'SILVA / MARIA', L + 40, T + 120, 34);
    F('DE / FROM', o.de || 'RIO BRANCO · RBR', L + 40, T + 210, 38);
    F('PARA / TO', o.para || 'PORTO VELHO · PVH', L + 520, T + 210, 38);
    F('VOO', o.voo || 'AV 2207', L + 40, T + 300, 34); F('DATA', o.data || '22 AGO', L + 250, T + 300, 34);
    F('PORTÃO', o.portao || '3', L + 460, T + 300, 34); F('ASSENTO', o.assento || '14C', L + 640, T + 300, 34); F('EMBARQUE', o.embarque || '07:10', L + 840, T + 300, 34);
    // tarifa
    fillRR(ctx, L + 1010, T + 120, 200, 130, 14, 'rgba(30,58,138,0.08)'); strokeRR(ctx, L + 1010, T + 120, 200, 130, 14, 'rgba(30,58,138,0.35)', 2);
    text(ctx, 'TARIFA', L + 1110, T + 148, { size: 16, weight: 800, color: '#64748b', letter: 2 });
    text(ctx, o.tarifa || 'R$ 100,00', L + 1110, T + 200, { size: 34, weight: 900, color: '#0f172a' });
    // código de barras 2D (PDF417) embaixo
    const rb = rng(41); let bx = L + 40; ctx.fillStyle = '#111827';
    while (bx < L + 980) { const bw = 1 + Math.floor(rb() * 4); for (let row = 0; row < 4; row++) if (rb() > 0.45) ctx.fillRect(bx, T + 372 + row * 12, bw, 11); bx += bw + 1; }
    // canhoto da direita (picote)
    ctx.setLineDash([8, 9]); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(L + 1240, T + 96); ctx.lineTo(L + 1240, T + PASS_H - 10); ctx.stroke(); ctx.setLineDash([]);
    text(ctx, 'VOO', L + 1370, T + 140, { size: 16, weight: 800, color: '#64748b', letter: 2 }); text(ctx, o.voo || 'AV 2207', L + 1370, T + 176, { size: 30, weight: 900, color: '#0f172a' });
    text(ctx, 'ASSENTO', L + 1370, T + 236, { size: 16, weight: 800, color: '#64748b', letter: 2 }); text(ctx, o.assento || '14C', L + 1370, T + 274, { size: 44, weight: 900, color: '#1e3a8a' });
    const rq = rng(8), qs = 7; for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) if (rq() > 0.5) ctx.fillRect(L + 1328 + i * qs, T + 318 + j * qs, qs, qs);
    ctx.restore();
}
function cartao(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const L = -PASS_W / 2, T = -PASS_H / 2;
  const parts = o.parts;
  const key = [o.nome, o.de, o.para, o.voo, o.data, o.portao, o.assento, o.embarque, o.tarifa].join('|');
  if (!PASS_TEX[key]) PASS_TEX[key] = passTexture(o);
  const tex = PASS_TEX[key];
  const base = () => { ctx.drawImage(tex, L, T, PASS_W, PASS_H); };
  if (!parts) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.fillStyle = '#e9edf3'; rr(ctx, L, T, PASS_W, PASS_H, 22); ctx.fill(); ctx.restore();
    base();
  } else {
    let x0 = L;
    parts.forEach((p, i) => {
      const w = PASS_W * p.f, dy = p.dy || 0, k = clamp(p.k || 0);
      ctx.save(); ctx.translate(x0 + w / 2, dy); ctx.rotate(p.rot || 0); ctx.translate(-(x0 + w / 2), 0);
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + (i ? 3 : 0), T - 4, w - (i ? 3 : 0) - (i < parts.length - 1 ? 3 : 0), PASS_H + 8); ctx.clip();
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14; ctx.fillStyle = '#e9edf3'; rr(ctx, L, T, PASS_W, PASS_H, 22); ctx.fill(); ctx.restore();
      base();
      if (k > 0) { ctx.fillStyle = hexA(p.color, 0.9 * k); rr(ctx, L, T, PASS_W, PASS_H, 22); ctx.fill(); }
      ctx.restore();
      if (k > 0 && p.lab) {
        const cxp = x0 + w / 2;
        ctx.save(); ctx.globalAlpha *= clamp(k * 1.5);
        glowText(ctx, p.lab, cxp, -30, { size: Math.min(150, w * 0.62), weight: 900, color: '#ffffff', glow: 'rgba(0,0,0,0.45)', blur: 18 });
        if (p.sub) text(ctx, p.sub, cxp, 80, { size: Math.min(34, w * 0.16), weight: 900, color: '#ffffff' });
        ctx.restore();
      }
      // picote entre canhotos
      if (i < parts.length - 1) { ctx.setLineDash([7, 8]); ctx.strokeStyle = 'rgba(15,23,42,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + w, T + 10); ctx.lineTo(x0 + w, T + PASS_H - 10); ctx.stroke(); ctx.setLineDash([]); }
      ctx.restore();
      x0 += w;
    });
  }
  ctx.restore();
}

// ================================================================ mapa de rotas (contorno do Brasil com aeroportos)
const BRASIL = [[-74, -8], [-70, -4], [-69, 1], [-64, 4], [-60, 5], [-56, 2], [-51, 4], [-50, 0], [-44, -2], [-38, -3.5], [-35, -5], [-35, -9], [-39, -13], [-40, -20], [-42, -23], [-44, -23], [-48, -26], [-49, -29], [-53, -33.7], [-57, -30], [-55, -27], [-54, -25], [-58, -20], [-58, -16], [-60, -14], [-65, -11], [-70, -11], [-73, -9]];
const CITY = { RBR: [-67.8, -10.0, 'Rio Branco'], PVH: [-63.9, -8.8, 'Porto Velho'], BVB: [-60.7, 2.8, 'Boa Vista'], MAO: [-60.0, -3.1, 'Manaus'], BSB: [-47.9, -15.8, 'Brasília'], GRU: [-46.5, -23.4, 'São Paulo'],
  GIG: [-43.2, -22.8, 'Rio'], CNF: [-43.9, -19.6, 'BH'], SSA: [-38.5, -13.0, 'Salvador'], REC: [-34.9, -8.1, 'Recife'], FOR: [-38.5, -3.8, 'Fortaleza'], BEL: [-48.5, -1.4, 'Belém'], POA: [-51.2, -30.0, 'Porto Alegre'],
  CGB: [-56.1, -15.6, 'Cuiabá'], CGR: [-54.6, -20.5, 'Campo Grande'], FLN: [-48.5, -27.6, 'Florianópolis'], CPV: [-35.9, -7.2, 'Campina Grande'], BYO: [-56.5, -21.1, 'Bonito'], THE: [-42.8, -5.1, 'Teresina'] };
function mapaRotas(ctx, cx, cy, sc, a = 1) { // devolve pt(code|[lon,lat]) -> [x, y]
  const pt = (c) => { const [lon, lat] = typeof c === 'string' ? CITY[c] : c; return [cx + (lon + 54) * sc, cy - (lat + 14) * sc]; };
  if (a <= 0) return pt;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.beginPath(); BRASIL.forEach(([lon, lat], i) => { const [x, y] = pt([lon, lat]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath();
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sc * 26); g.addColorStop(0, 'rgba(30,58,138,0.35)'); g.addColorStop(1, 'rgba(15,23,42,0.25)');
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.shadowColor = 'rgba(56,189,248,0.6)'; ctx.shadowBlur = 18; ctx.strokeStyle = 'rgba(125,211,252,0.75)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  ctx.restore();
  return pt;
}
function aeroporto(ctx, x, y, code, k = 1, color = '#e2e8f0', o = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  circle(ctx, x, y, 9, color); circle(ctx, x, y, 4, '#0b1222');
  if (o.label !== false) text(ctx, o.name || code, x + (o.dx ?? 16), y + (o.dy ?? -18), { size: o.size || 24, weight: 900, color, align: o.align || 'left' });
  ctx.restore();
}
// rota em arco entre dois pontos; k = quanto já foi desenhado; off = 0..1 apagando
function rota(ctx, p0, p1, k, color, o = {}) {
  if (k <= 0) return;
  const [x0, y0] = p0, [x1, y1] = p1, mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * (o.bend ?? 0.22);
  const N = 40, n = Math.max(1, Math.floor(N * clamp(k)));
  ctx.save(); ctx.globalAlpha *= o.alpha ?? 1; ctx.strokeStyle = color; ctx.lineWidth = o.lw || 4; ctx.lineCap = 'round';
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const u = i / N, x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke(); ctx.restore();
  if (o.plane && k < 1) { const u = clamp(k), x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
    const dx = 2 * (1 - u) * (mx - x0) + 2 * u * (x1 - mx), dy = 2 * (1 - u) * (my - y0) + 2 * u * (y1 - my);
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(dy, dx)); aviaoIcone(ctx, 0, 0, o.plane, '#ffffff'); ctx.restore(); }
}

// ================================================================ mapa de assentos (cabine vista de cima, 30 fileiras x 6)
// colorOf(fileira, assento) -> [cor, intensidade 0..1]
function cabine(ctx, x, y, s, colorOf, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  const L = -760, R = 760, Hh = 170;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  ctx.fillStyle = '#e5e9ef'; ctx.beginPath(); ctx.moveTo(L + 60, -Hh); ctx.lineTo(R - 140, -Hh); ctx.quadraticCurveTo(R + 30, -Hh, R + 60, 0); ctx.quadraticCurveTo(R + 30, Hh, R - 140, Hh); ctx.lineTo(L + 60, Hh); ctx.quadraticCurveTo(L - 20, Hh, L - 40, 0); ctx.quadraticCurveTo(L - 20, -Hh, L + 60, -Hh); ctx.closePath(); ctx.fill(); ctx.restore();
  fillRR(ctx, L + 10, -Hh + 18, R - L - 150, 2 * Hh - 36, 30, '#cfd6e0');
  fillRR(ctx, L + 20, -14, R - L - 170, 28, 6, '#b6c0cd'); // corredor
  for (let r = 0; r < 30; r++) for (let sI = 0; sI < 6; sI++) {
    const sx = L + 50 + r * 46, sy = sI < 3 ? -Hh + 34 + sI * 40 : 30 + (sI - 3) * 40;
    const [col, k] = colorOf(r, sI);
    fillRR(ctx, sx, sy, 36, 34, 7, '#9aa6b6');
    if (k > 0) fillRR(ctx, sx, sy, 36, 34, 7, hexA(col, clamp(k)));
    fillRR(ctx, sx + 28, sy + 2, 6, 30, 3, 'rgba(0,0,0,0.18)');
  }
  // nariz (cabine dos pilotos)
  ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.moveTo(R - 40, -40); ctx.quadraticCurveTo(R + 30, -30, R + 40, 0); ctx.quadraticCurveTo(R + 30, 30, R - 40, 40); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ================================================================ objetos menores
function celular(ctx, x, y, s, content, o = {}) { // celular em pé; content(ctx, x0, y0, w, h) desenha a tela
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 44; ctx.shadowOffsetY = 18; fillRR(ctx, -210, -400, 420, 800, 58, '#111318'); ctx.restore();
  strokeRR(ctx, -210, -400, 420, 800, 58, '#3a3f4a', 4);
  ctx.save(); rr(ctx, -192, -382, 384, 764, 44); ctx.clip();
  const sg = ctx.createLinearGradient(0, -382, 0, 382); sg.addColorStop(0, '#f8fafc'); sg.addColorStop(1, '#e2e8f0'); ctx.fillStyle = sg; ctx.fillRect(-192, -382, 384, 764);
  content(ctx, -192, -382, 384, 764);
  ctx.restore();
  fillRR(ctx, -60, -372, 120, 26, 13, '#111318');
  ctx.restore();
}
// gráfico em degraus: o preço sobe conforme o avião enche. k = quanto do desenho já entrou; o.mult = escala (dobrar tudo)
function escada(ctx, x, y, w, h, k, o = {}) {
  const steps = [0.18, 0.26, 0.36, 0.5, 0.68, 0.9], n = steps.length, mult = o.mult ?? 1, col = o.color || P.sky;
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.strokeStyle = 'rgba(226,232,240,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  if (!o.noAxis) { text(ctx, 'assentos vendidos', x + w / 2, y + 36, { size: 26, weight: 800, color: '#cbd5e1' }); ctx.save(); ctx.translate(x - 30, y - h / 2); ctx.rotate(-Math.PI / 2); text(ctx, 'tarifa', 0, 0, { size: 26, weight: 800, color: '#cbd5e1' }); ctx.restore(); }
  const shown = clamp(k) * n;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.shadowColor = hexA(col, 0.7); ctx.shadowBlur = 16; if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const f = clamp(shown - i); if (f <= 0) break;
    const x0 = x + (i / n) * w, x1 = x0 + (w / n) * f, yy = y - h * Math.min(1.25, steps[i] * mult);
    if (i === 0) ctx.moveTo(x0, yy); else ctx.lineTo(x0, yy);
    ctx.lineTo(x1, yy);
  }
  ctx.stroke(); ctx.restore();
  ctx.restore();
}
function refinaria(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#1f2937';
  [[-260, -260, 60], [-170, -330, 50], [-90, -220, 70]].forEach(([tx, ty, tw]) => { fillRR(ctx, tx, ty, tw, -ty, 10, '#334155'); fillRR(ctx, tx - 6, ty - 14, tw + 12, 20, 6, '#475569'); });
  fillRR(ctx, 0, -180, 200, 180, 16, '#334155'); ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.ellipse(100, -180, 100, 24, 0, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-200, -60); ctx.lineTo(260, -60); ctx.lineTo(260, -10); ctx.stroke();
  // chama no alto da chaminé
  ctx.fillStyle = 'rgba(251,146,60,0.85)'; ctx.beginPath(); ctx.ellipse(-145, -360, 12, 26, 0, 0, 6.283); ctx.fill();
  ctx.restore();
}
function caminhaoTanque(ctx, x, y, s, o = {}) { // caminhão-tanque de querosene, de lado, frente à direita
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 70, 330, 18, 0, 0, 6.283); ctx.fill();
  const tg = ctx.createLinearGradient(0, -120, 0, 30); tg.addColorStop(0, '#f1f5f9'); tg.addColorStop(1, '#94a3b8');
  ctx.fillStyle = tg; rr(ctx, -320, -130, 470, 150, 70); ctx.fill();
  fillRR(ctx, -300, -60, 430, 30, 6, '#ca8a04');
  text(ctx, 'QUEROSENE DE AVIAÇÃO', -85, -45, { size: 22, weight: 900, color: '#111827', letter: 1 });
  text(ctx, 'JET A-1', -85, -94, { size: 30, weight: 900, color: '#1e3a8a', letter: 3 });
  fillRR(ctx, 160, -110, 150, 130, 18, '#1e3a8a'); fillRR(ctx, 230, -96, 66, 52, 8, '#93c5fd');
  ctx.fillStyle = '#334155'; ctx.fillRect(-320, 16, 630, 20);
  for (const wx of [-250, -150, 230]) { circle(ctx, wx, 46, 34, '#111827'); circle(ctx, wx, 46, 14, '#9ca3af'); }
  if (o.mang > 0) { ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-320, -20); ctx.quadraticCurveTo(-420, 60 - 80 * o.mang, -520, -40 - 60 * o.mang); ctx.stroke(); }
  ctx.restore();
}
function folha(ctx, x, y, s, head, headCol, lines, k, o = {}) { // documento oficial (comunicado, decreto, guia, balanço)
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + (1 - ease.out(clamp(k))) * 70); ctx.rotate(o.rot ?? 0.025); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  const w = o.w || 640, h = o.h || 620;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 14; ctx.fillStyle = '#f8fafc'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
  ctx.fillStyle = headCol; ctx.fillRect(-w / 2, -h / 2, w, 84);
  text(ctx, head, -w / 2 + 34, -h / 2 + 42, { size: 28, weight: 900, color: '#ffffff', align: 'left', letter: 2 });
  if (o.sub) text(ctx, o.sub, -w / 2 + 34, -h / 2 + 116, { size: 20, weight: 700, color: '#64748b', align: 'left', letter: 1 });
  lines.forEach((L, i) => {
    const yy = -h / 2 + (o.top || 170) + i * (o.lh || 64);
    const kk = clamp((L.k ?? 1));
    if (kk <= 0) return;
    ctx.save(); ctx.globalAlpha *= kk;
    if (L.hl) fillRR(ctx, -w / 2 + 20, yy - 26, w - 40, 52, 8, hexA(L.hl, 0.25));
    text(ctx, L.a, -w / 2 + 34, yy, { size: L.size || 26, weight: L.b ? 900 : 700, color: L.col || '#334155', align: 'left' });
    if (L.b2 != null) text(ctx, L.b2, w / 2 - 34, yy, { size: (L.size || 26) + 4, weight: 900, color: L.col2 || '#0f172a', align: 'right' });
    if (L.x > 0) crossOut(ctx, -w / 2 + 26, yy, -w / 2 + 26 + (w - 52) * clamp(L.x), yy, P.red, 1, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(-w / 2 + 30, yy + 30, w - 60, 2);
    ctx.restore();
  });
  ctx.restore();
}
function ledPainel(ctx, x, y, w, h, str, color, k = 1, o = {}) { // painel de LED (cotação)
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; fillRR(ctx, x - w / 2, y - h / 2, w, h, 18, '#05070b'); ctx.restore();
  strokeRR(ctx, x - w / 2, y - h / 2, w, h, 18, '#1f2937', 4);
  ctx.fillStyle = 'rgba(255,255,255,0.03)'; for (let yy = y - h / 2 + 6; yy < y + h / 2; yy += 6) ctx.fillRect(x - w / 2 + 6, yy, w - 12, 2);
  if (o.label) text(ctx, o.label, x - w / 2 + 30, y - h / 2 + 34, { size: 22, weight: 800, color: '#64748b', align: 'left', letter: 2 });
  ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 24; ctx.font = MONO(o.size || 96, 800); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y + (o.label ? 16 : 4)); ctx.restore();
  ctx.restore();
}
function contador(ctx, x, y, s, label, value, k, color) { // mostrador de rodinhas (odômetro) de caminhão-tanque
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 26; fillRR(ctx, -280, -110, 560, 220, 22, '#d1d5db'); ctx.restore();
  fillRR(ctx, -260, -92, 520, 184, 16, '#9ca3af');
  text(ctx, label, 0, -60, { size: 24, weight: 900, color: '#111827', letter: 2 });
  const chars = value.split(''), cw = 52, x0 = -(chars.length * cw) / 2;
  chars.forEach((c, i) => {
    const cx = x0 + i * cw;
    fillRR(ctx, cx + 2, -30, cw - 4, 92, 6, '#111827');
    const g = ctx.createLinearGradient(0, -30, 0, 62); g.addColorStop(0, 'rgba(255,255,255,0.15)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = g; ctx.fillRect(cx + 2, -30, cw - 4, 92);
    text(ctx, c, cx + cw / 2, 18, { size: 60, weight: 900, color: /[0-9]/.test(c) ? color : '#e5e7eb' });
  });
  ctx.restore();
}
function cauda(ctx, x, y, s, color, nome, k = 1, o = {}) { // estabilizador vertical (cauda, enflechada) sobre o dorso da fuselagem, com o nome
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y + (o.rise === false ? 0 : (1 - ease.out(clamp(k))) * 90)); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  // dorso da fuselagem
  const fg = ctx.createLinearGradient(0, 100, 0, 160); fg.addColorStop(0, '#e2e8f0'); fg.addColorStop(1, '#94a3b8');
  ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-250, 160); ctx.quadraticCurveTo(-240, 112, -150, 108); ctx.lineTo(170, 108); ctx.quadraticCurveTo(230, 112, 250, 160); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const g = ctx.createLinearGradient(-120, 0, 140, 0); g.addColorStop(0, color); g.addColorStop(1, hexA(color, 0.78));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-170, 112); ctx.quadraticCurveTo(-60, 0, 0, -240); ctx.lineTo(96, -262); ctx.lineTo(112, -244); ctx.lineTo(150, 112); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(-170, 112); ctx.quadraticCurveTo(-60, 0, 0, -240); ctx.lineTo(22, -244); ctx.quadraticCurveTo(-30, 0, -130, 112); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(78, -222); ctx.lineTo(112, 100); ctx.stroke(); // leme
  if (nome) text(ctx, nome, 0, 200, { size: 40, weight: 900, color: '#ffffff', letter: 3 });
  ctx.restore();
}
function martelo(ctx, x, y, s, ang) { // martelo de juiz
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  fillRR(ctx, -150, 120, 300, 40, 12, '#5b3a1e'); fillRR(ctx, -110, 100, 220, 30, 10, '#7c4f2a'); // base
  ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, '#9a6b3f'); g.addColorStop(1, '#5b3a1e');
  ctx.fillStyle = g; ctx.fillRect(-12, -10, 230, 22); // cabo
  fillRR(ctx, -110, -46, 110, 92, 18, '#7c4f2a'); fillRR(ctx, -122, -40, 16, 80, 6, '#c9a66b'); fillRR(ctx, -4, -40, 16, 80, 6, '#c9a66b');
  ctx.restore();
}
function calendario(ctx, x, y, s, o, k = 1) { // mês em grade 7 x 6; o.mark(dia) -> cor | null; o.title
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= clamp(k * 2);
  const cw = 92, chh = 72, w = cw * 7 + 40, h = chh * 6 + 160;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; fillRR(ctx, -w / 2, -h / 2, w, h, 18, '#f8fafc'); ctx.restore();
  fillRR(ctx, -w / 2, -h / 2, w, 80, 18, o.headCol || '#1e3a8a'); ctx.fillStyle = o.headCol || '#1e3a8a'; ctx.fillRect(-w / 2, -h / 2 + 50, w, 30);
  text(ctx, o.title, 0, -h / 2 + 42, { size: 32, weight: 900, color: '#ffffff', letter: 3 });
  ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach((d, i) => text(ctx, d, -w / 2 + 20 + cw * i + cw / 2, -h / 2 + 112, { size: 22, weight: 900, color: '#64748b' }));
  const first = o.first ?? 0, days = o.days ?? 31;
  for (let d = 1; d <= days; d++) {
    const idx = first + d - 1, cx = -w / 2 + 20 + (idx % 7) * cw, cy = -h / 2 + 140 + Math.floor(idx / 7) * chh;
    const m = o.mark ? o.mark(d) : null;
    if (m) fillRR(ctx, cx + 4, cy + 4, cw - 8, chh - 8, 10, m);
    text(ctx, String(d), cx + cw / 2, cy + chh / 2, { size: 28, weight: 800, color: m ? '#ffffff' : '#0f172a' });
  }
  ctx.restore();
}
function cronometro(ctx, x, y, r, k, label) { // relógio de 24 horas
  ctx.save(); ctx.translate(x, y);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; circle(ctx, 0, 0, r, '#0b1222'); ctx.restore();
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = r * 0.16; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, 0, 6.283); ctx.stroke();
  ctx.strokeStyle = P.ok; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, r * 0.8, -Math.PI / 2, -Math.PI / 2 + 6.283 * clamp(k)); ctx.stroke();
  text(ctx, label, 0, -6, { size: r * 0.42, weight: 900, color: '#ffffff' });
  text(ctx, 'horas', 0, r * 0.34, { size: r * 0.17, weight: 800, color: '#94a3b8' });
  ctx.restore();
}
function terminalIcone(ctx, x, y, s, color) { // prédio do aeroporto com torre de controle
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-160, 60); ctx.lineTo(-160, -10); ctx.quadraticCurveTo(0, -70, 160, -10); ctx.lineTo(160, 60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let i = 0; i < 7; i++) ctx.fillRect(-140 + i * 42, 0, 26, 40);
  ctx.fillStyle = color; ctx.fillRect(170, -130, 22, 190); ctx.beginPath(); ctx.moveTo(150, -130); ctx.lineTo(212, -130); ctx.lineTo(200, -170); ctx.lineTo(162, -170); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function xicara(ctx, x, y, s, t) { // xícara de café com vapor
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 108, 200, 26, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.ellipse(0, 96, 190, 30, 0, 0, 6.283); ctx.fill(); // pires
  const g = ctx.createLinearGradient(-120, 0, 120, 0); g.addColorStop(0, '#cbd5e1'); g.addColorStop(0.4, '#ffffff'); g.addColorStop(1, '#94a3b8');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-120, -40); ctx.lineTo(120, -40); ctx.quadraticCurveTo(115, 90, 0, 92); ctx.quadraticCurveTo(-115, 90, -120, -40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 18; ctx.beginPath(); ctx.arc(140, 10, 34, -1.3, 1.3); ctx.stroke();
  ctx.fillStyle = '#3f2410'; ctx.beginPath(); ctx.ellipse(0, -40, 118, 22, 0, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#6b3d1a'; ctx.beginPath(); ctx.ellipse(-10, -42, 90, 13, 0, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let k2 = 0; k2 <= 20; k2++) { const yy = -70 - k2 * 9, xx = (i - 1) * 40 + Math.sin(k2 * 0.5 + t * 2 + i) * 14; k2 ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  ctx.restore();
}
function pacoteCafe(ctx, x, y, s) { // pacote de café 500 g a vácuo
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.05);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const g = ctx.createLinearGradient(-150, 0, 150, 0); g.addColorStop(0, '#5a1a12'); g.addColorStop(0.5, '#8b2a1c'); g.addColorStop(1, '#4a140e');
  ctx.fillStyle = g; rr(ctx, -150, -220, 300, 440, 24); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-150 + i * 60, -220); ctx.lineTo(-140 + i * 60, 220); ctx.stroke(); }
  fillRR(ctx, -120, -110, 240, 150, 16, '#f5e6c8');
  text(ctx, 'CAFÉ', 0, -60, { size: 64, weight: 900, color: '#5a1a12', letter: 4 });
  text(ctx, 'TORRADO E MOÍDO', 0, 4, { size: 20, weight: 800, color: '#7c2d12', letter: 1 });
  text(ctx, '500 g', 0, 150, { size: 40, weight: 900, color: '#f5e6c8' });
  ctx.restore();
}
function totem(ctx, x, y, s, press, label) { // totem de autoatendimento (check-in) com o botão
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14; fillRR(ctx, -170, -330, 340, 660, 30, '#1f2937'); ctx.restore();
  fillRR(ctx, -140, -300, 280, 360, 16, '#0b1222');
  text(ctx, 'CHECK-IN', 0, -260, { size: 28, weight: 900, color: P.flapTxt, letter: 3 });
  const pz = 1 - 0.08 * Math.sin(clamp(press) * Math.PI);
  ctx.save(); ctx.translate(0, -90); ctx.scale(pz, pz);
  ctx.save(); ctx.shadowColor = hexA(P.ok, 0.6 * clamp(press * 2)); ctx.shadowBlur = 40; fillRR(ctx, -120, -50, 240, 100, 20, press > 0.5 ? '#16a34a' : '#22c55e'); ctx.restore();
  fillRR(ctx, -120, 34, 240, 16, 8, 'rgba(0,0,0,0.25)');
  text(ctx, label, 0, 0, { size: 30, weight: 900, color: '#ffffff', letter: 1 });
  ctx.restore();
  fillRR(ctx, -110, 120, 220, 18, 6, '#0b0e12'); // saída do cartão
  ctx.restore();
}
// gráfico do petróleo (linha) sem números, só a forma do ano
function graficoPetroleo(ctx, x, y, w, h, k, o = {}) {
  const pts = [0.3, 0.32, 0.36, 0.78, 0.88, 0.82, 0.8, 0.84, 0.9, 0.86, 0.92];
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov'];
  ctx.save(); ctx.globalAlpha *= o.a ?? 1;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; fillRR(ctx, x - 40, y - h - 90, w + 80, h + 160, 22, '#05070b'); ctx.restore();
  text(ctx, 'PETRÓLEO · 2026', x, y - h - 50, { size: 26, weight: 900, color: '#94a3b8', align: 'left', letter: 3 });
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2; for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(x, y - (h * i) / 4); ctx.lineTo(x + w, y - (h * i) / 4); ctx.stroke(); }
  meses.forEach((m, i) => text(ctx, m, x + (w * i) / (pts.length - 1), y + 34, { size: 20, weight: 700, color: '#64748b' }));
  const n = (pts.length - 1) * clamp(k);
  ctx.save(); ctx.strokeStyle = P.amber; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.shadowColor = hexA(P.amber, 0.8); ctx.shadowBlur = 18; ctx.beginPath();
  for (let i = 0; i <= Math.ceil(n); i++) { const f = Math.min(i, n), i0 = Math.floor(f), fr = f - i0, v = i0 + 1 < pts.length ? lerp(pts[i0], pts[i0 + 1], fr) : pts[i0]; const xx = x + (w * f) / (pts.length - 1), yy = y - h * v; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
  ctx.stroke(); ctx.restore();
  ctx.restore();
}
// barra horizontal comprida com uma fatia (para "menos de 2 de cada 100")
function barraFatia(ctx, x, y, w, h, f, k, color, label) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  fillRR(ctx, x, y, w * ease.out(clamp(k)), h, h / 2, '#334155');
  const fw = Math.max(10, w * f);
  ctx.save(); ctx.shadowColor = hexA(color, 0.9); ctx.shadowBlur = 20; fillRR(ctx, x + w - fw, y, fw * clamp((k - 0.6) * 3), h, 6, color); ctx.restore();
  if (label) text(ctx, label, x + w / 2, y + h / 2 + 2, { size: h * 0.42, weight: 900, color: '#e2e8f0' });
  ctx.restore();
}

// tanque/cilindro de combustível com nível (para comparar o litro)
function tanqueNivel(ctx, x, yBase, w, h, k, color, top, bottom) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  const hh = h * ease.out(clamp(k));
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; fillRR(ctx, x - w / 2, yBase - hh, w, hh, 20, '#1f2937'); ctx.restore();
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, hexA(color, 0.7)); g.addColorStop(0.35, color); g.addColorStop(1, hexA(color, 0.6));
  fillRR(ctx, x - w / 2 + 8, yBase - hh + 8, w - 16, hh - 16, 14, g);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x - w / 2 + 22, yBase - hh + 18, 10, hh - 36);
  if (top) text(ctx, top, x, yBase - hh - 40, { size: 48, weight: 900, color: '#ffffff' });
  if (bottom) text(ctx, bottom, x, yBase + 40, { size: 30, weight: 800, color: '#cbd5e1' });
  ctx.restore();
}
const ROW_ACRE = ['07:10', 'AV 2207', 'PORTO VELHO', 'CONFIRMADO'];

// ================================================================ Cena 01: o voo que durou dois meses e a contradição
function scene01(K) {
  const tAgo = K('Em agosto'), t6 = K('depois de seis anos'), tVoltou = K('voltou o voo direto'), tRB = K('entre Rio Branco'), tPV = K('e Porto Velho');
  const tUma = K('Uma hora no ar'), tQuin = K('quinhentos e poucos quilômetros'), tNov = K('Em novembro'), tAcaba = K('ele acaba'), tDurou = K('Durou pouco mais de dois meses');
  const tAno = K('No mesmo ano'), tComb = K('o combustível do avião'), tDuas = K('quase duas vezes mais caro'), tParte = K('E tem uma parte estranha'), tSet = K('em setembro'), tBarata = K('saiu um pouco mais barata');
  const tSe = K('Se o combustível dobrou'), tJunto = K('não dobrou junto'), tResp = K('A resposta explica o voo do Acre'), tNorte = K('por que voar pelo Norte'), tJan = K('o que muda em janeiro'), tRef = K('quando a reforma tributária');
  const tHoje = K('Hoje a gente abre o preço'), tCada = K('quem fica com cada real');
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.14, dz: 0.004 }, { t: tVoltou, x: 940, y: 460, z: 1.06, d: 1.6, dx: 4 },
    { t: tUma - 0.4, x: 2400, y: 520, z: 1.0, d: 1.5, dx: 6 }, { t: tQuin, x: 2420, y: 540, z: 1.08, d: 1.8 },
    { t: tNov - 0.3, x: 960, y: 470, z: 1.08, d: 1.3 }, { t: tDurou, x: 980, y: 490, z: 1.0, d: 1.8, dx: -3 },
    { t: tAno - 0.2, x: 3800, y: 500, z: 1.0, d: 1.6, dz: 0.008 }, { t: tDuas, x: 3800, y: 480, z: 1.1, d: 1.6 },
    { t: tParte - 0.3, x: 5200, y: 500, z: 1.0, d: 1.6 }, { t: tBarata, x: 5180, y: 500, z: 1.08, d: 2 },
    { t: tSe - 0.2, x: 5200, y: 470, z: 1.02, d: 1.4 }, { t: tJunto, x: 5200, y: 460, z: 1.12, d: 1.4 },
    { t: tResp - 0.4, x: 960, y: 470, z: 1.0, d: 1.7, dx: 3 }, { t: tRef, x: 960, y: 480, z: 1.06, d: 2 },
    { t: tHoje - 0.3, x: 960, y: 520, z: 0.98, d: 1.5 }, { t: tCada, x: 960, y: 520, z: 1.06, d: 2.4 },
  ];
  const sfx = [[tAgo + 0.1, 'chime', 0.5], [tVoltou, 'flip', 0.8, { dur: 0.8 }], [t6, 'pop', 0.4], [tUma, 'jet', 0.45, { dur: 3 }], [tQuin, 'pop', 0.4],
    [tNov, 'flip', 0.5, { dur: 0.5 }], [tAcaba, 'flip', 0.9, { dur: 0.8 }], [tAcaba + 0.9, 'buzz', 0.35], [tDurou, 'tick', 0.4], [tComb, 'liquid', 0.4, { dur: 1.4 }], [tDuas, 'hit', 0.6],
    [tParte, 'pop', 0.4], [tSet, 'paper', 0.4], [tBarata, 'drop', 0.4], [tSe, 'whoosh', 0.3], [tJunto, 'impact', 0.5],
    [tResp + 0.6, 'flip', 0.5, { dur: 0.6 }], [tNorte, 'flip', 0.5, { dur: 0.6 }], [tJan, 'flip', 0.5, { dur: 0.6 }], [tHoje, 'paper', 0.6, { dur: 0.5 }], [tCada, 'coin', 0.5]];
  return {
    accent: P.amber, cam, sfx, impacts: [tDuas, tJunto], trans: 'cut',
    draw(ctx, t, cam2) {
      saguaoFundo(ctx, cam2, 0.95);
      // A: o painel de partidas
      zone(ctx, cam2, 900, 1000, () => {
      const pk = 1 - appear(t, tHoje - 0.3, 0.5);
      if (pk > 0) {
        const acre = t < tAcaba ? { c: ROW_ACRE, tf: tVoltou, col: P.ok } : { c: ['07:10', 'AV 2207', 'PORTO VELHO', 'ENCERRADO'], from: ROW_ACRE, fromCol: P.ok, tf: tAcaba, col: '#f87171' };
        const rows = [acre, { c: ['', '', 'O VOO DO ACRE', 'A SEGUIR'], tf: tResp + 0.6 }, { c: ['', '', 'O NORTE', 'A SEGUIR'], tf: tNorte }, { c: ['', '', 'JANEIRO', 'A SEGUIR'], tf: tJan }];
        painel(ctx, 960, 150, 1, rows, t, { rowsN: 4, clock: t < tNov ? 'AGO 2026' : 'NOV 2026', alpha: pk });
      }
      if (t > tRB) cap(ctx, 'Rio Branco (AC) · Porto Velho (RO)', 960, 610, { size: 34, alpha: vis(t, tRB, tUma - 0.3) });
      chip(ctx, 960, 690, '6 anos sem voo direto', P.amber, vis(t, t6, tUma - 0.3), { size: 32 });
      if (t > tDurou - 0.2) { // linha do tempo AGO -> NOV
        const k = vis(t, tDurou - 0.2, tAno, 0.4, 0.4), bw = 520 * ease.out(prog(t, tDurou, 0.9));
        ctx.save(); ctx.globalAlpha *= k;
        fillRR(ctx, 700, 640, 520, 14, 7, '#334155'); fillRR(ctx, 700, 640, bw, 14, 7, P.amber);
        text(ctx, 'AGO', 700, 690, { size: 28, weight: 900, color: '#e2e8f0' }); text(ctx, 'NOV', 1220, 690, { size: 28, weight: 900, color: '#f87171' });
        chip(ctx, 960, 760, 'durou pouco mais de 2 meses', '#f87171', appear(t, tDurou + 0.6, 0.4), { size: 30 });
        ctx.restore();
      }
      if (t > tHoje - 0.3) {
        cartao(ctx, 960, 560, 0.8, { a: appear(t, tHoje, 0.6), rot: lerp(0.08, -0.02, ease.out(prog(t, tHoje, 0.9))) });
        headline(ctx, 'quem fica com cada real?', 960, 215, { size: 70, k: appear(t, tCada, 0.5), hl: '#1e3a8a' });
      }
      });
      // B: estrada x voo (mapa do Acre e de Rondônia)
      zone(ctx, cam2, 2300, 2500, () => {
      const pt = mapaRotas(ctx, 3982, 1200, 140, 0.9);
      const a = pt('RBR'), b = pt('PVH');
      // estrada (BR-364) serpenteando
      ctx.save(); ctx.strokeStyle = '#a3a3a3'; ctx.lineWidth = 8; ctx.setLineDash([22, 14]); ctx.beginPath();
      const kR = ease.inOut(prog(t, tQuin - 0.2, 1.6)); const N = 50;
      for (let i = 0; i <= N * kR; i++) { const u = i / N, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + Math.sin(u * 9) * 40 + 70 * Math.sin(u * Math.PI); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore();
      rota(ctx, a, b, ease.inOut(prog(t, tUma, 1.6)), P.sky, { lw: 6, plane: 1.4, bend: 0.5 });
      aeroporto(ctx, a[0], a[1], 'RBR', 1, '#e2e8f0', { name: 'Rio Branco', dx: -20, dy: 44, align: 'right', size: 30 });
      aeroporto(ctx, b[0], b[1], 'PVH', 1, '#e2e8f0', { name: 'Porto Velho', dx: 20, dy: 44, size: 30 });
      chip(ctx, 2400, 260, '1 hora no ar', P.sky, appear(t, tUma + 0.3, 0.4), { size: 34 });
      chip(ctx, 2400, 760, 'uns 540 km de estrada', '#e5e5e5', appear(t, tQuin + 0.3, 0.4), { size: 32 });
      });
      // C: o combustível quase dobrou
      zone(ctx, cam2, 3700, 3900, () => {
      if (t > tComb - 0.3) {
        cap(ctx, 'querosene de aviação: preço do litro', 3800, 190, { size: 34, alpha: appear(t, tComb - 0.3, 0.5) });
        tanqueNivel(ctx, 3600, 720, 190, 250, prog(t, tComb, 0.8), P.comb, '', 'dez/2025');
        tanqueNivel(ctx, 4000, 720, 190, 460, prog(t, tDuas - 0.2, 1.0), P.comb, '', 'nov/2026');
        headline(ctx, 'quase 2×', 3800, 300, { size: 92, k: appear(t, tDuas + 0.4, 0.5), color: '#d9f99d', color2: P.comb });
      }
      });
      // D: e a passagem? + a pergunta
      zone(ctx, cam2, 5100, 5300, () => {
      if (t > tParte - 0.3) {
        const k1 = appear(t, tParte, 0.5), k2 = appear(t, tSet, 0.5);
        const box = (bx, title, val, col, sub, k) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(0, (1 - ease.out(k)) * 40);
          fillRR(ctx, bx - 280, 330, 560, 300, 26, '#0b1222'); strokeRR(ctx, bx - 280, 330, 560, 300, 26, col, 5);
          text(ctx, title, bx, 385, { size: 32, weight: 900, color: '#cbd5e1', letter: 2 }); text(ctx, val, bx, 490, { size: 110, weight: 900, color: col }); text(ctx, sub, bx, 580, { size: 26, weight: 700, color: '#94a3b8' }); ctx.restore(); };
        const up = 1 - appear(t, tSe - 0.2, 0.5);
        ctx.save(); ctx.globalAlpha *= up;
        box(4880, 'QUEROSENE', '+84%', P.comb, 'dez/2025 a nov/2026', k1);
        box(5520, 'PASSAGEM MÉDIA', '−0,5%', P.sky, 'set/2025 a set/2026', k2);
        ctx.restore();
      }
      if (t > tSe - 0.2) {
        const k = appear(t, tSe - 0.1, 0.5);
        headline(ctx, 'o combustível dobrou...', 5200, 380, { size: 76, k, color: '#d9f99d', color2: P.comb });
        headline(ctx, 'por que o bilhete não?', 5200, 520, { size: 86, k: appear(t, tJunto - 0.6, 0.5), hl: '#b91c1c' });
      }
      });
      bokeh(ctx, cam2, t, 3, 12);
    },
    overlay(ctx, t) {
      source(ctx, 'g1 (ago e out/2026); Petrobras; Anac (set/2026)', vis(t, tRB, tHoje - 0.5, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 02: a média e o que ela esconde
const SEAT_R = (() => { const r = rng(606), m = []; for (let i = 0; i < 180; i++) m.push(r()); return m; })();
function faixaDoAssento(row, s) { const v = SEAT_R[row * 6 + s]; return v < 0.348 ? 0 : v > 0.908 ? 2 : 1; } // 0 até R$ 500, 1 meio, 2 acima de R$ 1.500
function scene02(K) {
  const tAnac = K('A Anac'), tCalc = K('calcula a média'), tSet = K('Em setembro'), t746 = K('deu setecentos e quarenta e seis'), tTrecho = K('por trecho'), tIda = K('Só a ida'), tMetade = K('É quase metade de um salário mínimo');
  const tNing = K('Só que quase ninguém paga a média'), tMes = K('Um mês antes'), tTres = K('um em cada três assentos'), tDez = K('quase um em cada dez'), tMil = K('passou de mil e quinhentos');
  const tMesmo = K('É o mesmo avião'), tPolt = K('a mesma poltrona'), tDif = K('vendida por preços muito diferentes');
  const tLugar = K('O lugar de onde você sai'), tRR = K('em Roraima'), t1400 = K('foi de mil e quatrocentos reais'), tDobro = K('mais que o dobro do resto do país');
  const tAntes = K('Antes de entender'), tDentro = K('vale ver o que tem dentro dele');
  const cam = [
    { t: 0, x: 960, y: 500, z: 1.06, dx: 4 }, { t: t746 - 0.3, x: 960, y: 470, z: 1.14, d: 1.4 }, { t: tMetade - 0.2, x: 980, y: 510, z: 1.02, d: 1.6 },
    { t: tNing - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6, dz: 0.007 }, { t: tTres, x: 2380, y: 470, z: 1.05, d: 1.6 }, { t: tMesmo - 0.2, x: 2440, y: 450, z: 1.14, d: 1.6 },
    { t: tLugar - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: tRR + 0.2, x: 3860, y: 480, z: 1.08, d: 1.6 }, { t: tDobro, x: 3980, y: 470, z: 1.04, d: 1.8 },
    { t: tAntes - 0.4, x: 5200, y: 500, z: 0.98, d: 1.6 }, { t: tDentro, x: 5200, y: 510, z: 1.06, d: 2.2 },
  ];
  const sfx = [[tAnac, 'pop', 0.4], [tCalc, 'key', 0.5], [t746, 'meter', 0.5, { dur: 1.4 }], [tTrecho, 'pop', 0.35], [tIda, 'swoosh', 0.3], [tMetade, 'coin', 0.4],
    [tNing, 'whoosh', 0.35], [tMes, 'paper', 0.35], [tTres, 'sparkle', 0.4], [tDez, 'sparkle', 0.4], [tMesmo + 0.4, 'belt', 0.6], [tDif, 'pop', 0.4],
    [tLugar, 'whoosh', 0.3], [tRR, 'pop', 0.5], [t1400, 'hit', 0.5], [tDobro, 'pop', 0.4], [tAntes, 'paper', 0.5, { dur: 0.5 }], [tDentro, 'tear', 0.5]];
  return {
    accent: P.sky, cam, sfx, impacts: [t1400], trans: 'push',
    draw(ctx, t, cam2) {
      saguaoFundo(ctx, cam2, 0.9);
      // A: a tarifa média (painel da Anac)
      zone(ctx, cam2, 900, 1000, () => {
      if (t > tAnac - 0.3) {
        const k = appear(t, tAnac - 0.3, 0.6);
        // enquanto a Anac "calcula": dígitos girando e etiquetas de preço (passagens vendidas) subindo até o painel
        let str = 'R$ ---';
        if (t >= t746) str = 'R$ ' + Math.floor(counting(t, t746, 1.4, 0, 746.62));
        else if (t > tCalc) { const h = Math.sin((Math.floor(t * 14) + 7) * 12.9898) * 43758.5453, u = h - Math.floor(h); str = 'R$ ' + String(100 + Math.floor(u * 1900)).replace(/^(\d)(\d{3})$/, '$1.$2'); }
        ledPainel(ctx, 960, 370, 1080, 300, str, P.flapTxt, k, { label: 'ANAC · TARIFA MÉDIA DOMÉSTICA · SET/2026', size: 150 });
        if (t > tCalc - 0.2 && t < t746 + 0.6) {
          const PRECOS = ['R$ 389', 'R$ 1.212', 'R$ 517', 'R$ 2.034', 'R$ 268', 'R$ 845', 'R$ 1.590', 'R$ 433', 'R$ 699', 'R$ 1.077', 'R$ 312', 'R$ 958'];
          const LANES = [560, 860, 1160, 1360, 710, 1010];
          for (let i = 0; i < 24; i++) {
            const t0 = tCalc - 0.2 + i * 0.32, u = prog(t, t0, 1.6);
            if (u <= 0 || u >= 1) continue;
            const x = LANES[i % LANES.length], y = lerp(800, 600, ease.out(u));
            const al = Math.min(clamp(u * 5), clamp((1 - u) * 3)) * (1 - appear(t, t746, 0.5));
            ctx.save(); ctx.globalAlpha *= al;
            fillRR(ctx, x - 80, y - 24, 160, 48, 24, 'rgba(15,23,42,0.85)'); strokeRR(ctx, x - 80, y - 24, 160, 48, 24, 'rgba(245,215,110,0.55)', 2);
            text(ctx, PRECOS[i % PRECOS.length], x, y + 1, { size: 26, weight: 800, color: '#f5d76e' });
            ctx.restore();
          }
        }
        chip(ctx, 760, 590, 'por trecho', '#e2e8f0', appear(t, tTrecho, 0.4), { size: 30 });
        chip(ctx, 1160, 590, 'só a ida', P.sky, appear(t, tIda, 0.4), { size: 30 });
        if (t > tMetade - 0.2) {
          const kk = appear(t, tMetade - 0.2, 0.5), fw = 900 * 0.46 * ease.out(prog(t, tMetade + 0.4, 1));
          ctx.save(); ctx.globalAlpha *= kk;
          text(ctx, 'salário mínimo: R$ 1.621', 510, 670, { size: 28, weight: 800, color: '#cbd5e1', align: 'left' });
          fillRR(ctx, 510, 700, 900, 50, 25, '#334155'); fillRR(ctx, 510, 700, fw, 50, 25, P.flapTxt);
          text(ctx, '46%', 510 + Math.max(60, fw) - 50, 726, { size: 28, weight: 900, color: '#111827' });
          ctx.restore();
        }
      }
      });
      // B: o mesmo avião, preços diferentes (mapa de assentos)
      zone(ctx, cam2, 2300, 2500, () => {
      if (t > tNing - 0.4) {
        const a = appear(t, tNing - 0.3, 0.6), kG = appear(t, tTres + 0.3, 0.9), kR = appear(t, tDez + 0.3, 0.9), kB = appear(t, tMesmo, 0.9);
        const cols = [P.ok, '#60a5fa', '#f87171'];
        cabine(ctx, 2400, 470, 0.95, (r, s) => { const f = faixaDoAssento(r, s); return [cols[f], f === 0 ? kG : f === 2 ? kR : kB * 0.85]; }, { a });
        chip(ctx, 2400, 210, 'agosto de 2026', '#e2e8f0', vis(t, tMes, tMesmo), { size: 28 });
        chip(ctx, 1960, 720, '1 em 3: até R$ 500', P.ok, appear(t, tTres + 0.5, 0.4), { size: 30 });
        chip(ctx, 2840, 720, 'quase 1 em 10: mais de R$ 1.500', '#f87171', appear(t, tDez + 0.5, 0.4), { size: 30 });
        if (t > tMesmo) { // duas poltronas vizinhas, faixas opostas
          const k = appear(t, tPolt, 0.4), pulse = 0.5 + 0.5 * Math.sin(t * 6);
          const sx = (r) => 2400 + 0.95 * (-760 + 50 + r * 46 + 18), sy = 470 + 0.95 * (30 + 17);
          let rg = 0, rr2 = 0; for (let r = 5; r < 30; r++) { if (!rg && faixaDoAssento(r, 3) === 0 && faixaDoAssento(r + 1, 3) === 2) { rg = r; rr2 = r + 1; break; } }
          if (!rg) { rg = 12; rr2 = 13; }
          ctx.save(); ctx.globalAlpha *= k; ctx.lineWidth = 6;
          ctx.strokeStyle = hexA('#ffffff', 0.6 + 0.4 * pulse); ctx.beginPath(); ctx.arc(sx(rg), sy, 34, 0, 6.283); ctx.stroke(); ctx.beginPath(); ctx.arc(sx(rr2), sy, 34, 0, 6.283); ctx.stroke();
          ctx.restore();
          headline(ctx, 'mesmo avião, mesma poltrona', 2400, 210, { size: 58, k: appear(t, tMesmo + 0.2, 0.5) });
        }
      }
      });
      // C: onde você sai também pesa (Roraima)
      zone(ctx, cam2, 3700, 4000, () => {
      if (t > tLugar - 0.4) {
        const a = appear(t, tLugar - 0.3, 0.6);
        const pt = mapaRotas(ctx, 3720, 470, 17, a);
        const rrp = pt('BVB');
        Object.keys(CITY).filter((c) => c !== 'BVB').forEach((c, i) => { const [x, y] = pt(c); aeroporto(ctx, x, y, c, appear(t, tLugar + 0.2 + i * 0.12, 0.3) * (1 - 0.5 * appear(t, tRR, 0.6)), '#94a3b8', { label: false }); });
        if (t > tRR) { const k = appear(t, tRR, 0.5); const g = ctx.createRadialGradient(rrp[0], rrp[1], 0, rrp[0], rrp[1], 90 * k); g.addColorStop(0, 'rgba(248,113,113,0.6)'); g.addColorStop(1, 'rgba(248,113,113,0)'); ctx.fillStyle = g; ctx.fillRect(rrp[0] - 100, rrp[1] - 100, 200, 200); aeroporto(ctx, rrp[0], rrp[1], 'BVB', k, '#f87171', { name: 'Roraima', size: 30 }); }
        if (t > t1400 - 0.2) {
          const kb = prog(t, t1400, 0.9), kc = prog(t, tDobro, 0.9);
          text(ctx, 'tarifa média em 2025', 4420, 160, { size: 28, weight: 800, color: '#cbd5e1', alpha: appear(t, t1400 - 0.2, 0.4) });
          tanqueNivel(ctx, 4300, 720, 160, 380, kb, '#f87171', 'R$ 1.401', 'Roraima');
          tanqueNivel(ctx, 4540, 720, 160, 185, kc, '#94a3b8', 'R$ 648', 'Brasil');
          chip(ctx, 4420, 228, 'mais que o dobro', '#f87171', appear(t, tDobro + 0.6, 0.4), { size: 30 });
        }
      }
      });
      // D: o bilhete vai ser aberto
      zone(ctx, cam2, 5100, 5300, () => {
      if (t > tAntes - 0.4) {
        const k = appear(t, tAntes - 0.3, 0.6);
        cartao(ctx, 5200, 560, 0.8, { a: k, rot: -0.02 });
        if (t > tDentro) { // picotes aparecendo
          const kk = prog(t, tDentro, 0.9); let x0 = 5200 - 600;
          [0.34, 0.16, 0.08, 0.06].forEach((f, i) => { x0 += 1200 * f; ctx.save(); ctx.globalAlpha *= clamp(kk * 3 - i * 0.5); ctx.setLineDash([10, 9]); ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0, 390); ctx.lineTo(x0, lerp(390, 730, kk)); ctx.stroke(); ctx.restore(); });
        }
        headline(ctx, 'o que tem dentro?', 5200, 230, { size: 74, k: appear(t, tDentro, 0.5), hl: '#1e3a8a' });
      }
      });
      bokeh(ctx, cam2, t, 5, 12);
    },
    overlay(ctx, t) {
      source(ctx, 'Anac (tarifas de ago e set/2026; Anuário 2025)', vis(t, t746 - 0.5, tAntes, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 03: o bilhete aberto em canhotos (quem fica com cada real)
const FATIAS = [
  { f: 0.34, color: P.comb, lab: '34', sub: 'querosene' },
  { f: 0.16, color: P.aviao, lab: '16', sub: 'o avião' },
  { f: 0.08, color: P.imposto, lab: '8', sub: 'imposto' },
  { f: 0.06, color: P.lucro, lab: '6', sub: 'lucro' },
  { f: 0.36, color: P.resto, lab: '36', sub: 'o resto' },
];
function partes(ks, o = {}) { // ks = intensidade de cada canhoto; o.pop = índice que salta
  return FATIAS.map((F, i) => ({ f: F.f, color: F.color, lab: F.lab, sub: '', k: ks[i], dy: (i % 2 ? 14 : -14) * clamp(ks[i]) + (o.pop === i ? -40 * (o.popK || 0) : 0), rot: (i % 2 ? 0.012 : -0.012) * clamp(ks[i]) }));
}
function subFatias(ctx, cx, y, s, ks, o = {}) { // nomes das fatias embaixo do bilhete
  let x0 = cx - (PASS_W * s) / 2;
  FATIAS.forEach((F, i) => { const w = PASS_W * s * F.f; if (ks[i] > 0) text(ctx, F.sub, x0 + w / 2, y + (i === 2 || i === 3 ? (i === 2 ? -6 : 34) : 0), { size: o.size || 28, weight: 900, color: F.color, alpha: clamp(ks[i] * 2) }); x0 += w; });
}
function scene03(K) {
  const tPega = K('Pega cem reais de passagem'), tConta = K('Pela conta do canal'), t34 = K('uns trinta e quatro vão para o tanque'), tQue = K('é o querosene de aviação');
  const t16 = K('Uns dezesseis pagam o avião'), tAlug = K('o aluguel'), tSeg = K('o seguro'), tMan = K('a manutenção'), tDol = K('quase tudo cobrado em dólar');
  const t8 = K('Uns oito são imposto'), t6 = K('Uns seis ficam de lucro'), tResto = K('O resto'), tPil = K('paga pilotos e comissários'), tAero = K('o aeroporto'), tCtrl = K('o controle do espaço aéreo'), tVenda = K('a venda do bilhete'), tDesg = K('e o desgaste do avião');
  const tRepara = K('Repara no imposto'), tCerv = K('Na cerveja'), tTerco = K('quase um terço da lata'), tNaPass = K('Na passagem, é um dos menores pedaços');
  const tTaxa = K('A taxa de embarque'), tLinha = K('aquela linha separada'), tNem = K('nem entra nessa conta'), tVai = K('ela vai para o aeroporto'), tGRU = K('Em Guarulhos'), t3575 = K('são trinta e cinco reais e setenta e cinco');
  const tOu = K('Ou seja'), tManda = K('quem manda é o tanque');
  const X = [465, 840, 1020, 1125, 1440];
  const cam = [
    { t: 0, x: 960, y: 450, z: 1.0, dz: 0.004 }, { t: t34 - 0.2, x: 860, y: 450, z: 1.06, d: 1.4, dz: 0.002 }, { t: t16 - 0.2, x: 900, y: 450, z: 1.08, d: 1.3, dz: 0.002 },
    { t: t8 - 0.2, x: 960, y: 450, z: 1.1, d: 1.2, dz: 0.001 }, { t: t6 - 0.2, x: 980, y: 450, z: 1.1, d: 1.1, dz: 0.001 }, { t: tResto - 0.2, x: 1000, y: 450, z: 1.03, d: 1.4, dz: 0.002 }, { t: tDesg, x: 960, y: 460, z: 1.0, d: 1.8 },
    { t: tRepara - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: tNaPass, x: 2460, y: 480, z: 1.08, d: 1.8 },
    { t: tTaxa - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6, dx: 4 }, { t: tVai, x: 3900, y: 470, z: 1.04, d: 1.5 }, { t: tGRU, x: 3860, y: 470, z: 1.1, d: 1.6 },
    { t: tOu - 0.3, x: 960, y: 450, z: 1.0, d: 1.4 }, { t: tManda, x: 820, y: 440, z: 1.1, d: 2 },
  ];
  const sfx = [[tPega, 'paper', 0.5, { dur: 0.4 }], [tConta, 'pop', 0.4], [t34, 'tear', 0.8], [tQue, 'liquid', 0.35, { dur: 1 }], [t16, 'tear', 0.7], [tDol, 'coin', 0.4], [t8, 'tear', 0.7], [t6, 'tear', 0.6], [tResto, 'tear', 0.7],
    ...[tPil, tAero, tCtrl, tVenda, tDesg].map((tt) => [tt, 'pop', 0.3]), [tRepara, 'whoosh', 0.3], [tTerco, 'canopen', 0.45], [tNaPass, 'pop', 0.4],
    [tTaxa, 'whoosh', 0.3], [tLinha, 'printer', 0.4, { dur: 0.7 }], [tVai, 'swoosh', 0.4], [t3575, 'cash', 0.4], [tOu, 'swoosh', 0.3], [tManda, 'hit', 0.6]];
  return {
    accent: P.comb, cam, sfx, impacts: [tManda], trans: 'cut',
    draw(ctx, t, cam2) {
      saguaoFundo(ctx, cam2, 0.85);
      // A: o bilhete de R$ 100 se destaca em canhotos
      zone(ctx, cam2, 700, 1300, () => {
      const ks = [prog(t, t34, 0.6), prog(t, t16, 0.6), prog(t, t8, 0.6), prog(t, t6, 0.6), prog(t, tResto, 0.6)];
      const popK = appear(t, tManda - 0.2, 0.5);
      cartao(ctx, 960, 430, 1.0, { parts: partes(ks, { pop: 0, popK }), tarifa: 'R$ 100,00', a: appear(t, 0, 0.5) });
      subFatias(ctx, 960, 712, 1.0, ks);
      chip(ctx, 960, 140, 'conta do canal (estimativa)', '#e2e8f0', vis(t, tConta, t16 - 0.3), { size: 30 });
      if (t > tAlug - 0.2) { const a = vis(t, tAlug - 0.2, t8 - 0.2); ['aluguel', 'seguro', 'manutenção'].forEach((s2, i) => chip(ctx, 620 + i * 230, 140, s2, P.aviao, a * appear(t, [tAlug, tSeg, tMan][i], 0.4), { size: 28 })); chip(ctx, 1330, 140, 'em dólar', P.dolar, a * appear(t, tDol, 0.4), { size: 28 }); }
      if (t > tPil - 0.2) { const a = vis(t, tPil - 0.2, tRepara - 0.4); ['pilotos', 'aeroporto', 'espaço aéreo', 'venda', 'desgaste'].forEach((s2, i) => chip(ctx, 460 + i * 250, 140, s2, '#93c5fd', a * appear(t, [tPil, tAero, tCtrl, tVenda, tDesg][i], 0.4), { size: 26 })); }
      if (t > tOu) headline(ctx, 'quem manda é o tanque', 960, 150, { size: 72, k: appear(t, tManda - 0.3, 0.5), color: '#d9f99d', color2: P.comb });
      });
      // B: o imposto na cerveja x na passagem
      zone(ctx, cam2, 2300, 2500, () => {
      if (t > tRepara - 0.4) {
        const a = appear(t, tRepara - 0.3, 0.6);
        ctx.save(); ctx.globalAlpha *= a;
        { ctx.save(); ctx.globalAlpha *= 1 - appear(t, tTerco + 0.1, 0.3); headline(ctx, 'repara no imposto', 2360, 200, { size: 64, k: appear(t, tRepara, 0.5), hl: '#7f1d1d' }); ctx.restore(); }
        // lata (silhueta) com 1/3 em vermelho
        const kc = appear(t, tCerv, 0.6), fill = ease.inOut(prog(t, tTerco, 1));
        ctx.save(); ctx.globalAlpha *= kc; ctx.translate(1960, 470);
        const lg = ctx.createLinearGradient(-110, 0, 110, 0); lg.addColorStop(0, '#6b7280'); lg.addColorStop(0.3, '#e5e7eb'); lg.addColorStop(1, '#4b5563');
        fillRR(ctx, -110, -200, 220, 400, 34, lg); fillRR(ctx, -110, 200 - 400 * 0.3 * fill, 220, 400 * 0.3 * fill, 30, hexA(P.imposto, 0.9));
        ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.ellipse(0, -200, 96, 16, 0, 0, 6.283); ctx.fill();
        ctx.restore();
        text(ctx, 'cerveja', 1960, 730, { size: 34, weight: 900, color: '#e2e8f0', alpha: kc });
        chip(ctx, 1960, 200, 'quase 1/3 é imposto', '#fca5a5', appear(t, tTerco + 0.5, 0.4), { size: 30 });
        // a passagem com o canhoto vermelho
        const kp = appear(t, tNaPass - 0.3, 0.6);
        cartao(ctx, 2760, 470, 0.5, { parts: FATIAS.map((F, i) => ({ f: F.f, color: F.color, k: i === 2 ? prog(t, tNaPass, 0.6) : 0, dy: i === 2 ? -20 * prog(t, tNaPass, 0.6) : 0 })), a: kp });
        text(ctx, 'passagem', 2760, 730, { size: 34, weight: 900, color: '#e2e8f0', alpha: kp });
        chip(ctx, 2760, 200, 'um dos menores pedaços', '#fca5a5', appear(t, tNaPass + 0.6, 0.4), { size: 30 });
        ctx.restore();
      }
      });
      // C: a taxa de embarque vai para o aeroporto
      zone(ctx, cam2, 3700, 4000, () => {
      if (t > tTaxa - 0.4) {
        const a = appear(t, tTaxa - 0.3, 0.6), hl = prog(t, tLinha, 0.5);
        folha(ctx, 3560, 470, 0.95, 'COMPRA CONFIRMADA', '#1e3a8a', [
          { a: 'Tarifa aérea', b2: 'R$ 100,00' },
          { a: 'Taxa de embarque', b2: 'R$ 35,75', hl: hl > 0 ? P.amber : null, col: hl > 0.5 ? '#92400e' : '#334155' },
          { a: 'Total', b2: 'R$ 135,75', b: 1 },
        ], a, { w: 640, h: 420, top: 180, lh: 76, sub: 'ida · 1 adulto · GRU' });
        if (t > tVai - 0.2) {
          const k = appear(t, tVai - 0.2, 0.5);
          arrow(ctx, 3900, 450, 4120, 450, P.amber, 7, prog(t, tVai, 0.5));
          ctx.save(); ctx.globalAlpha *= k; terminalIcone(ctx, 4300, 460, 1.0, '#cbd5e1'); ctx.restore();
          text(ctx, 'vai para o aeroporto', 4300, 590, { size: 30, weight: 900, color: P.amber, alpha: k });
        }
        chip(ctx, 3560, 200, 'fora da conta dos R$ 100', '#e2e8f0', appear(t, tNem, 0.4), { size: 30 });
        chip(ctx, 4300, 300, 'Guarulhos: R$ 35,75', P.amber, appear(t, t3575, 0.4), { size: 30 });
      }
      });
      bokeh(ctx, cam2, t, 7, 10);
    },
    overlay(ctx, t) {
      source(ctx, 'conta do canal com dados da Anac, Gol e MPor', vis(t, tConta, tRepara, 0.5, 0.4));
      source(ctx, 'Anac (tarifa de embarque, jul/2026)', vis(t, tGRU - 0.3, tOu, 0.5, 0.4));
    },
  };
}

// gota de querosene (tamanho = valor)
function gota(ctx, x, y, r, color, k, label, sub) {
  if (k <= 0) return;
  const rr2 = r * ease.back(clamp(k));
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= clamp(k * 2);
  ctx.save(); ctx.shadowColor = hexA(color, 0.7); ctx.shadowBlur = 30;
  const g = ctx.createRadialGradient(-rr2 * 0.3, -rr2 * 0.2, rr2 * 0.1, 0, 0, rr2); g.addColorStop(0, '#f7fee7'); g.addColorStop(0.35, color); g.addColorStop(1, hexA(color, 0.75));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -rr2 * 1.6); ctx.bezierCurveTo(rr2 * 0.35, -rr2 * 1.0, rr2, -rr2 * 0.4, rr2, 0.1 * rr2); ctx.arc(0, 0.1 * rr2, rr2, 0, Math.PI); ctx.bezierCurveTo(-rr2, -rr2 * 0.4, -rr2 * 0.35, -rr2 * 1.0, 0, -rr2 * 1.6); ctx.fill(); ctx.restore();
  ctx.restore();
  if (label) text(ctx, label, x, y + rr2 + 50, { size: 44, weight: 900, color: '#ffffff', alpha: clamp(k * 2) });
  if (sub) text(ctx, sub, x, y + rr2 + 96, { size: 26, weight: 800, color: '#cbd5e1', alpha: clamp(k * 2) });
}

// ================================================================ Cena 04: o tanque (petróleo, Petrobras, dólar e a ajuda de centavos)
function scene04(K) {
  const tQ = K('O querosene sai das refinarias'), tAc = K('e acompanha o petróleo lá fora'), t2026 = K('Em 2026'), tGuerra = K('com a guerra no Oriente Médio'), tDisp = K('o petróleo disparou');
  const tAbr = K('Em abril'), t55 = K('cinquenta e cinco por cento de uma vez'), tDep = K('Depois vieram mais quatro aumentos'), tAgo = K('de agosto a novembro');
  const tLitro = K('O litro que a Petrobras vendia'), t360 = K('por uns três e sessenta'), t660 = K('passou de seis e sessenta');
  const tPior = K('Para piorar'), tDol = K('o dólar chegou a cinco e sessenta e cinco'), tMaior = K('o maior valor em quase um ano e meio'), tPesa = K('Ele pesa duas vezes'), tComb = K('no combustível'), tAlug = K('e no aluguel do avião');
  const tGov = K('O governo tentou ajudar'), tZer = K('e zerou o imposto federal do querosene'), tMai = K('de abril até o fim de maio'), tEco = K('A economia foi de sete centavos'), tAum = K('O aumento passou de três reais');
  const tBriga = K('A briga do imposto'), tCent = K('é de centavos'), tPet = K('A do petróleo é de reais');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.04, dx: 6 }, { t: tAc, x: 1000, y: 470, z: 1.1, d: 1.6 },
    { t: t2026 - 0.4, x: 2400, y: 470, z: 1.0, d: 1.6 }, { t: tDisp, x: 2480, y: 450, z: 1.1, d: 1.4 }, { t: tAbr - 0.2, x: 2360, y: 480, z: 1.04, d: 1.4 }, { t: t55, x: 2280, y: 470, z: 1.12, d: 1.4 }, { t: tDep, x: 2520, y: 480, z: 1.02, d: 1.6 },
    { t: tLitro - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: t660, x: 3800, y: 470, z: 1.12, d: 1.6 },
    { t: tPior - 0.4, x: 5200, y: 480, z: 1.0, d: 1.6 }, { t: tDol, x: 5200, y: 440, z: 1.1, d: 1.4 }, { t: tPesa, x: 5200, y: 500, z: 1.0, d: 1.6 },
    { t: tGov - 0.4, x: 6400, y: 480, z: 1.0, d: 1.6 }, { t: tEco - 0.3, x: 6720, y: 480, z: 1.0, d: 1.6 }, { t: tAum, x: 7120, y: 470, z: 1.02, d: 1.6 }, { t: tBriga, x: 7150, y: 460, z: 1.08, d: 2.4 },
  ];
  const sfx = [[tQ, 'truck', 0.45, { dur: 2.6 }], [tAc, 'pop', 0.35], [t2026, 'paper', 0.35], [tGuerra, 'riser', 0.35, { dur: 1.6 }], [tDisp, 'hit', 0.6], [tAbr, 'paper', 0.5, { dur: 0.5 }], [t55, 'stamp', 0.9],
    ...[0, 1, 2, 3].map((i) => [tAgo - 1.2 + i * 0.45, 'stamp', 0.5]), [tLitro, 'meter', 0.4, { dur: 1 }], [t660, 'meter', 0.6, { dur: 1.2 }],
    [tPior, 'whoosh', 0.3], [tDol, 'beep', 0.4, { n: 2 }], [tMaior, 'pop', 0.4], [tComb, 'pop', 0.35], [tAlug, 'pop', 0.35],
    [tGov, 'paper', 0.5, { dur: 0.5 }], [tZer, 'stamp', 0.5], [tEco, 'drip', 0.6], [tAum, 'drip', 0.9, { big: 1 }], [tCent, 'pop', 0.4], [tPet, 'hit', 0.6]];
  return {
    accent: P.comb, cam, sfx, impacts: [t55, tPet], trans: 'push',
    draw(ctx, t, cam2) {
      saguaoFundo(ctx, cam2, 0.75, 0.6);
      // A: refinaria -> caminhão-tanque
      zone(ctx, cam2, 900, 1100, () => {
      refinaria(ctx, 640, 700, 1.05);
      const tk = ease.out(prog(t, tQ + 0.2, 1.8));
      caminhaoTanque(ctx, lerp(1900, 1250, tk), 690, 0.9);
      cap(ctx, 'refinaria da Petrobras', 640, 760, { size: 28, alpha: appear(t, tQ, 0.5) });
      chip(ctx, 1000, 200, 'segue o petróleo lá fora, em dólar', P.dolar, appear(t, tAc, 0.4), { size: 32 });
      });
      // B: o petróleo dispara; o comunicado de abril e os aumentos seguidos
      zone(ctx, cam2, 2250, 2550, () => {
      const out = 1 - appear(t, tAbr - 0.2, 0.5);
      if (out > 0) { graficoPetroleo(ctx, 2000, 660, 800, 360, prog(t, t2026, Math.max(1, tDisp + 1 - t2026)), { a: appear(t, t2026 - 0.3, 0.5) * out }); chip(ctx, 2400, 170, 'guerra no Oriente Médio', '#fca5a5', vis(t, tGuerra, tAbr - 0.2) , { size: 30 }); }
      if (t > tAbr - 0.2) {
        const k = appear(t, tAbr - 0.2, 0.6);
        folha(ctx, 2220, 470, 0.9, 'PETROBRAS · COMUNICADO', '#047857', [
          { a: 'Querosene de aviação (QAV)', b: 1 }, { a: 'preço para as distribuidoras' }, { a: 'reajuste a partir de abril/2026' },
        ], k, { w: 620, h: 560, top: 170, lh: 60 });
        bigNum(ctx, '+54,6%', 2220, 620, appear(t, t55, 0.4), { size: 104, color: '#15803d', glow: 'rgba(21,128,61,0.25)' });
        rectStamp(ctx, 2220, 330, 380, 96, 'DE UMA VEZ', P.red, prog(t, t55 + 0.6, 0.35), -0.1, 44);
        ['AGO', 'SET', 'OUT', 'NOV'].forEach((m, i) => ovalStamp(ctx, 2820, 240 + i * 150, 120, 60, [[m, -0.1, 0.62], ['AUMENTO', 0.45, 0.26]], P.red, prog(t, tAgo - 1.2 + i * 0.45, 0.3), -0.12 + i * 0.05));
      }
      });
      // C: o litro da Petrobras
      zone(ctx, cam2, 3700, 3900, () => {
      if (t > tLitro - 0.4) {
        const k = appear(t, tLitro - 0.3, 0.6), v = t < t660 ? 3.64 : counting(t, t660, 1.2, 3.64, 6.69);
        contador(ctx, 3800, 430, 1.25, 'LITRO DE QUEROSENE · PETROBRAS', 'R$ ' + v.toFixed(2).replace('.', ','), k, P.comb);
        chip(ctx, 3800, 660, t < t660 ? 'dezembro de 2025' : 'novembro de 2026', t < t660 ? '#e2e8f0' : P.comb, k, { size: 32 });
        if (t > t660 + 1.3) chip(ctx, 3800, 200, '+84% no ano (conta do canal)', '#d9f99d', appear(t, t660 + 1.3, 0.4), { size: 28 });
      }
      });
      // D: o dólar pesa duas vezes
      zone(ctx, cam2, 5100, 5300, () => {
      if (t > tPior - 0.4) {
        const k = appear(t, tPior - 0.3, 0.6);
        ledPainel(ctx, 5200, 340, 900, 240, t < tDol ? 'US$ 1 = R$ ?' : 'US$ 1 = R$ 5,65', P.dolar, k, { label: 'DÓLAR · NOVEMBRO DE 2026', size: 96 });
        chip(ctx, 5200, 520, 'maior valor em 17 meses', P.dolar, appear(t, tMaior, 0.4), { size: 30 });
        if (t > tPesa) {
          arrow(ctx, 5100, 560, 4880, 660, P.dolar, 7, prog(t, tComb, 0.4)); arrow(ctx, 5300, 560, 5520, 660, P.dolar, 7, prog(t, tAlug, 0.4));
          chip(ctx, 4820, 720, 'combustível', P.comb, appear(t, tComb + 0.2, 0.4), { size: 32 }); chip(ctx, 5580, 720, 'aluguel do avião', P.aviao, appear(t, tAlug + 0.2, 0.4), { size: 32 });
          headline(ctx, 'pesa 2 vezes', 5200, 180, { size: 60, k: appear(t, tPesa, 0.5) });
        }
      }
      });
      // E: a ajuda do governo (centavos) x o aumento (reais)
      zone(ctx, cam2, 6300, 7200, () => {
      if (t > tGov - 0.4) {
        const k = appear(t, tGov - 0.3, 0.6) * (1 - appear(t, tEco + 2.5, 0.6));
        folha(ctx, 6400, 470, 0.9, 'DECRETO · ABRIL DE 2026', '#1e3a8a', [
          { a: 'PIS/Cofins do querosene', b: 1 }, { a: 'alíquota', b2: 'zero', k: prog(t, tZer, 0.4) }, { a: 'vale até 31 de maio', k: prog(t, tMai, 0.4) },
        ], k, { w: 600, h: 460, top: 180, lh: 70 });
      }
      if (t > tEco - 0.3) {
        gota(ctx, 6900, 576, 16, '#e2e8f0', appear(t, tEco, 0.5), 'R$ 0,07', 'ajuda por litro');
        gota(ctx, 7400, 440, 150, P.comb, appear(t, tAum, 0.7), '+R$ 3,05', 'aumento por litro');
      }
      if (t > tBriga) {
        chip(ctx, 6900, 180, 'imposto: centavos', '#e2e8f0', appear(t, tCent, 0.4), { size: 34 });
        chip(ctx, 7400, 180, 'petróleo: reais', P.comb, appear(t, tPet, 0.4), { size: 34 });
      }
      });
      bokeh(ctx, cam2, t, 11, 10);
    },
    overlay(ctx, t) {
      source(ctx, 'Petrobras (abr a nov/2026); Agência Gov; Casa Civil', vis(t, tAbr, tPior, 0.5, 0.4));
      source(ctx, 'cotação de 13/11/2026', vis(t, tDol, tGov, 0.5, 0.4));
      source(ctx, 'Casa Civil (decreto de 8/4/2026); g1', vis(t, tGov + 0.3, 64, 0.5, 0.4));
    },
  };
}

// caixa de comparação (querosene x passagem)
function caixaComp(ctx, bx, by, title, val, col, sub, k, vs = 110) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(k * 2); ctx.translate(0, (1 - ease.out(clamp(k))) * 40);
  fillRR(ctx, bx - 280, by, 560, 300, 26, '#0b1222'); strokeRR(ctx, bx - 280, by, 560, 300, 26, col, 5);
  text(ctx, title, bx, by + 55, { size: 32, weight: 900, color: '#cbd5e1', letter: 2 }); text(ctx, val, bx, by + 160, { size: vs, weight: 900, color: col }); text(ctx, sub, bx, by + 250, { size: 26, weight: 700, color: '#94a3b8' });
  ctx.restore();
}
const CORTES = [['08:30', 'AV 4410', 'MIAMI'], ['09:05', 'AV 4412', 'ORLANDO'], ['10:20', 'AV 2851', 'PUNTA CANA'], ['11:40', 'AV 1706', 'BONITO'], ['13:15', 'AV 1590', 'CAMPO GRANDE'], ['15:50', 'AV 2207', 'PORTO VELHO']];

// ================================================================ Cena 05: por que não dobrou (a empresa corta voos) — a virada do vídeo
function scene05(K) {
  const tAgora = K('Agora, a pergunta do começo'), tSe = K('Se o tanque subiu tanto'), tNao = K('não subiu'), tPorque = K('Porque a companhia aérea não monta o preço'), tSom = K('somando os custos');
  const tOlha = K('Ela olha quantos lugares ainda sobram'), tGente = K('e quanta gente está procurando aquele voo'), tCada = K('Cada voo é dividido em faixas de preço'), tPoucos = K('com poucos assentos em cada uma'), tPrim = K('os primeiros saem baratos'), tSobe = K('e a tarifa sobe conforme o avião enche');
  const tDobr = K('Se a empresa simplesmente dobrasse tudo'), tDeix = K('muita gente deixaria de voar'), tVazio = K('e o avião sairia vazio'), tEntao = K('Então ela faz outra coisa'), tCorta = K('corta os voos que não se pagam');
  const tOut = K('Em outubro, a Gol confirmou'), t38 = K('o fim de trinta e oito rotas'), tFev = K('a maioria a partir de fevereiro'), tCausa = K('por causa do combustível'), tBSB = K('Brasília vai ficar sem voo direto'), t17 = K('pela primeira vez em dezessete anos');
  const tRB = K('E o voo de Rio Branco para Porto Velho'), tLista = K('também sai da lista'), tMenos = K('Com menos voos'), tSobram = K('sobram menos assentos'), tCaros = K('e os que sobram ficam mais caros');
  const tConta = K('A conta do combustível não aparece só no preço'), tSome = K('Aparece no voo que some'), tLonge = K('quase sempre longe dos grandes centros'), tBV = K('Em Boa Vista'), t22 = K('recebeu vinte e dois por cento menos passageiros');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.0, dz: 0.006 }, { t: tPorque - 0.2, x: 960, y: 470, z: 1.1, d: 1.6 },
    { t: tOlha - 0.4, x: 2400, y: 470, z: 1.0, d: 1.6, dx: 5 }, { t: tCada, x: 2300, y: 470, z: 1.06, d: 1.6 }, { t: tPrim, x: 2620, y: 470, z: 1.08, d: 1.6 },
    { t: tDobr - 0.4, x: 3800, y: 470, z: 1.0, d: 1.6 }, { t: tVazio, x: 3980, y: 470, z: 1.08, d: 1.4 },
    { t: tEntao - 0.4, x: 5200, y: 440, z: 1.0, d: 1.5, dz: 0.004 }, { t: tCorta, x: 5200, y: 430, z: 1.06, d: 0.9 },
    { t: tOut - 0.4, x: 6600, y: 470, z: 1.0, d: 1.6 }, { t: tBSB, x: 6620, y: 420, z: 1.1, d: 1.6 }, { t: tRB, x: 6480, y: 470, z: 1.12, d: 1.6 },
    { t: tMenos - 0.4, x: 8000, y: 470, z: 1.0, d: 1.6, dx: 4 },
    { t: tConta - 0.4, x: 6600, y: 470, z: 1.0, d: 1.6 }, { t: tLonge, x: 6620, y: 440, z: 1.04, d: 1.6 }, { t: tBV, x: 6760, y: 420, z: 1.06, d: 1.6 },
  ];
  const sfx = [[tAgora, 'swoosh', 0.3], [tSe, 'pop', 0.35], [tNao, 'pop', 0.4], [tPorque, 'key', 0.4], [tSom + 0.3, 'buzz', 0.35],
    [tOlha, 'tap', 0.6], [tGente, 'tap', 0.5], [tCada, 'pop', 0.4], ...[0, 1, 2, 3].map((i) => [tPoucos + i * 0.3, 'tick', 0.4]), [tPrim, 'coin', 0.35], [tSobe, 'riser', 0.3, { dur: 1.4 }],
    [tDobr, 'whoosh', 0.3], [tDeix, 'drop', 0.4], [tVazio, 'belt', 0.5], [tEntao, 'riser', 0.4, { dur: 1.6 }], [tCorta, 'flip', 1.0, { dur: 1.2 }], [tCorta + 1.3, 'impact', 0.5],
    [tOut, 'paper', 0.4], [t38, 'meter', 0.5, { dur: 1.4 }], [tCausa, 'pop', 0.35], [tBSB, 'jet', 0.4, { dur: 2.2 }], [t17, 'drop', 0.4], [tRB, 'flip', 0.6, { dur: 0.6 }], [tLista, 'buzz', 0.35],
    [tMenos, 'whoosh', 0.3], [tSobram, 'drop', 0.35], [tCaros, 'coin', 0.4], [tSome, 'poweroff', 0.4], [tBV, 'pop', 0.45], [t22, 'hit', 0.5]];
  const caiu = [];
  return {
    accent: P.sky, cam, sfx, impacts: [tCorta + 1.3, t22], trans: 'push',
    draw(ctx, t, cam2) {
      saguaoFundo(ctx, cam2, 0.85);
      // A: a pergunta volta; o preço não é soma de custos
      zone(ctx, cam2, 900, 1000, () => {
      const o1 = 1 - appear(t, tPorque - 0.2, 0.5);
      if (o1 > 0) { ctx.save(); ctx.globalAlpha *= o1; headline(ctx, 'a pergunta do começo', 960, 200, { size: 64, k: appear(t, tAgora + 0.4, 0.5) }); caixaComp(ctx, 660, 300, 'QUEROSENE', '+84%', P.comb, 'em 2026', appear(t, tSe, 0.5)); caixaComp(ctx, 1260, 300, 'PASSAGEM MÉDIA', '−0,5%', P.sky, 'setembro', appear(t, tNao, 0.5)); ctx.restore(); }
      if (t > tPorque - 0.2) {
        const k = appear(t, tPorque - 0.2, 0.5);
        ctx.save(); ctx.globalAlpha *= k;
        fillRR(ctx, 360, 360, 1200, 200, 26, '#0b1222'); strokeRR(ctx, 360, 360, 1200, 200, 26, '#334155', 4);
        text(ctx, 'custos + margem = preço', 960, 462, { size: 70, weight: 900, color: '#e2e8f0' });
        crossOut(ctx, 400, 470, 1520, 450, P.red, prog(t, tSom + 0.3, 0.4), 14);
        ctx.restore();
        chip(ctx, 960, 650, 'não é assim que funciona', '#fca5a5', appear(t, tSom + 0.6, 0.4), { size: 32 });
      }
      });
      // B: faixas de preço (o app) e a tarifa em degraus
      zone(ctx, cam2, 2250, 2650, () => {
      if (t > tOlha - 0.4) {
        const k = appear(t, tOlha - 0.3, 0.6);
        celular(ctx, 1980, 470, 0.7, (c, x0, y0, w, h) => {
          c.fillStyle = '#1e3a8a'; c.fillRect(x0, y0, w, 120);
          text(c, 'IDA · 1 ADULTO', x0 + 30, y0 + 78, { size: 26, weight: 900, color: '#ffffff', align: 'left', letter: 1 });
          text(c, 'voo das 07:10', x0 + 30, y0 + 160, { size: 28, weight: 900, color: '#0f172a', align: 'left' });
          const bands = [['faixa 1', 'esgotada', '#94a3b8'], ['faixa 2', 'esgotada', '#94a3b8'], ['faixa 3', 'restam 2', '#d97706'], ['faixa 4', 'disponível', '#16a34a']];
          bands.forEach(([a1, b1, col], i) => {
            const kk = appear(t, tCada + 0.3 + i * 0.3, 0.4); if (kk <= 0) return;
            const yy = y0 + 220 + i * 120;
            c.save(); c.globalAlpha *= clamp(kk * 2);
            fillRR(c, x0 + 20, yy, w - 40, 100, 16, '#ffffff'); strokeRR(c, x0 + 20, yy, w - 40, 100, 16, '#cbd5e1', 2);
            text(c, a1, x0 + 44, yy + 34, { size: 26, weight: 900, color: '#0f172a', align: 'left' });
            text(c, b1, x0 + 44, yy + 72, { size: 22, weight: 800, color: col, align: 'left' });
            fillRR(c, x0 + 200, yy + 30, 40 + i * 30, 40, 8, hexA(col, 0.8));
            c.restore();
          });
          // lugares livres (bolinhas)
          const left = t < tGente ? 24 : Math.max(2, 24 - Math.floor((t - tGente) * 3));
          for (let i = 0; i < 24; i++) circle(c, x0 + 40 + (i % 12) * 26, y0 + h - 90 + Math.floor(i / 12) * 28, 9, i < left ? '#22c55e' : '#cbd5e1');
          text(c, 'lugares livres', x0 + w / 2, y0 + h - 130, { size: 22, weight: 800, color: '#475569' });
        }, { a: k, rot: -0.03 });
        if (t > tPrim - 0.3) {
          const ke = prog(t, tPrim, Math.max(1.5, tSobe + 1.5 - tPrim));
          escada(ctx, 2420, 700, 760, 440, ke, { a: appear(t, tPrim - 0.3, 0.4) });
          chip(ctx, 2560, 300, 'primeiros: baratos', P.ok, appear(t, tPrim + 0.4, 0.4), { size: 28 });
          chip(ctx, 2980, 200, 'enchendo: mais caro', '#fca5a5', appear(t, tSobe + 0.6, 0.4), { size: 28 });
        }
      }
      });
      // C: se dobrasse tudo, o avião sairia vazio
      zone(ctx, cam2, 3700, 4100, () => {
      if (t > tDobr - 0.4) {
        const a = appear(t, tDobr - 0.3, 0.5);
        escada(ctx, 3200, 700, 640, 420, 1, { a: a * 0.4, dash: [12, 10], color: '#94a3b8', noAxis: true });
        escada(ctx, 3200, 700, 640, 420, ease.out(prog(t, tDobr + 0.3, 1.2)), { a, color: '#f87171', mult: 2, noAxis: true });
        chip(ctx, 3520, 180, 'preço em dobro', '#f87171', appear(t, tDobr + 0.6, 0.4), { size: 30 });
        if (t > tDeix - 0.2) {
          const kv = prog(t, tDeix, 1.6);
          cabine(ctx, 4330, 470, 0.42, (r, s) => ['#60a5fa', faixaDoAssento(r, s) === 1 && SEAT_R[r * 6 + s] > 0.75 ? 1 - kv * 0.2 : 1 - kv], { a: appear(t, tDeix - 0.2, 0.5) });
          chip(ctx, 4330, 620, 'avião vazio', '#fca5a5', appear(t, tVazio, 0.4), { size: 32 });
        }
      }
      });
      // D: a virada — o painel inteiro vira CANCELADO
      zone(ctx, cam2, 5100, 5300, () => {
      if (t > tEntao - 0.6) {
        const rows = CORTES.map((c, i) => ({ c: [...c, 'CANCELADO'], from: [...c, 'CONFIRMADO'], fromCol: P.ok, col: '#f87171', tf: tCorta + i * 0.05 }));
        painel(ctx, 5200, 110, 0.92, rows, t, { clock: 'FEV 2027', alpha: appear(t, tEntao - 0.6, 0.5) });
        headline(ctx, 'corta os voos que não se pagam', 5200, 680, { size: 60, k: appear(t, tCorta + 1.2, 0.5), hl: '#b91c1c' });
      }
      });
      // E e G: o mapa das rotas que somem; o Norte e Boa Vista
      zone(ctx, cam2, 6300, 6800, () => {
      if (t > tOut - 0.4) {
        const pt = mapaRotas(ctx, 6610, 470, 17, appear(t, tOut - 0.3, 0.6));
        const EUA = [6330, 130];
        aeroporto(ctx, EUA[0], EUA[1], 'EUA', appear(t, tOut + 1.0, 0.6), '#e2e8f0', { name: 'EUA', dx: -18, dy: 0, align: 'right', size: 28 });
        const routes = [['CGR', 'GIG'], ['GRU', 'BYO'], ['CPV', 'SSA'], ['RBR', 'MAO'], ['FOR', null], ['BSB', null], ['RBR', 'PVH']];
        routes.forEach(([a, b], i) => {
          const p0 = pt(a), p1 = b ? pt(b) : EUA;
          let on = appear(t, tOut + i * 0.25, 0.6), off = 0;
          if (a === 'BSB') off = prog(t, t17, 0.8); else if (a === 'RBR' && b === 'PVH') off = prog(t, tLista, 0.8); else off = prog(t, t38 + 0.6 + i * 0.35, 0.6);
          const flick = a === 'RBR' && b === 'PVH' && t > tRB && t < tLista ? 0.5 + 0.5 * Math.sin(t * 18) : 1;
          rota(ctx, p0, p1, on, off > 0.01 ? '#f87171' : P.sky, { lw: a === 'BSB' ? 7 : 5, alpha: (1 - off * 0.85) * flick, dash: off > 0.01 ? [10, 10] : null, bend: b ? 0.25 : 0.16 });
          aeroporto(ctx, p0[0], p0[1], a, on, '#e2e8f0', { label: false });
          if (b) aeroporto(ctx, p1[0], p1[1], b, on, '#e2e8f0', { label: false });
        });
        if (t > tBSB - 0.2) { const p = pt('BSB'); aeroporto(ctx, p[0], p[1], 'BSB', 1, '#fbbf24', { name: 'Brasília', size: 28 }); chip(ctx, 6900, 110, 'EUA: sem voo direto, 1ª vez em 17 anos', '#fbbf24', vis(t, t17, tMenos - 0.4), { size: 26 }); }
        if (t > tRB - 0.2) { const p = pt('RBR'), q = pt('PVH'); aeroporto(ctx, p[0], p[1], 'RBR', 1, '#fbbf24', { name: 'Rio Branco', dx: -14, dy: 40, align: 'right', size: 26 }); aeroporto(ctx, q[0], q[1], 'PVH', 1, '#fbbf24', { name: 'Porto Velho', dy: 40, size: 26 }); }
        const cnt = Math.round(counting(t, t38, 1.4, 0, 38));
        chip(ctx, 7050, 520, `${cnt} rotas a menos`, '#f87171', vis(t, t38, tMenos - 0.4), { size: 34 });
        chip(ctx, 7050, 600, 'a maioria a partir de fev/2027', '#e2e8f0', vis(t, tFev, tMenos - 0.4), { size: 26 });
        chip(ctx, 7050, 680, 'por causa do combustível', P.comb, vis(t, tCausa, tMenos - 0.4), { size: 26 });
        // G: o Norte e Boa Vista
        if (t > tConta - 0.4) {
          const kl = appear(t, tLonge, 0.8), bv = pt('BVB'), nc = pt([-62, -4]);
          const g = ctx.createRadialGradient(nc[0], nc[1], 0, nc[0], nc[1], 260 * kl); g.addColorStop(0, 'rgba(248,113,113,0.35)'); g.addColorStop(1, 'rgba(248,113,113,0)'); ctx.fillStyle = g; ctx.fillRect(nc[0] - 280, nc[1] - 280, 560, 560);
          chip(ctx, 6600, 110, 'a conta chega no voo que some', '#e2e8f0', vis(t, tSome, 88), { size: 30 });
          if (t > tBV) { aeroporto(ctx, bv[0], bv[1], 'BVB', 1, '#f87171', { name: 'Boa Vista', size: 26 }); caixaComp(ctx, 7120, 200, 'BOA VISTA', '−22%', '#f87171', 'passageiros · 1º sem. 2026', appear(t, t22, 0.5)); }
        }
      }
      });
      // F: menos voos -> menos assentos -> mais caros
      zone(ctx, cam2, 7900, 8100, () => {
      if (t > tMenos - 0.4) {
        const a = appear(t, tMenos - 0.3, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        for (let i = 0; i < 10; i++) { const gone = i % 5 === 1 || i % 5 === 3 || i === 9 ? prog(t, tMenos + 0.3 + i * 0.08, 0.5) : 0; ctx.save(); ctx.globalAlpha *= 1 - gone * 0.8; aviaoIcone(ctx, 7460 + i * 120, 230, 1.5, gone > 0.5 ? '#64748b' : '#e2e8f0'); ctx.restore(); }
        text(ctx, 'voos', 7380, 232, { size: 30, weight: 900, color: '#cbd5e1', align: 'right' });
        const sk = 1 - 0.4 * ease.inOut(prog(t, tSobram, 1));
        text(ctx, 'assentos', 7380, 440, { size: 30, weight: 900, color: '#cbd5e1', align: 'right' }); fillRR(ctx, 7420, 410, 1100, 60, 30, '#334155'); fillRR(ctx, 7420, 410, 1100 * sk, 60, 30, '#60a5fa');
        const pk = 0.45 + 0.4 * ease.inOut(prog(t, tCaros, 1));
        text(ctx, 'tarifa', 7380, 600, { size: 30, weight: 900, color: '#cbd5e1', align: 'right' }); fillRR(ctx, 7420, 570, 1100, 60, 30, '#334155'); fillRR(ctx, 7420, 570, 1100 * pk, 60, 30, '#f87171');
        ctx.restore();
        chip(ctx, 8000, 740, 'os que sobram ficam mais caros', '#f87171', appear(t, tCaros + 0.4, 0.4), { size: 30 });
      }
      });
      bokeh(ctx, cam2, t, 13, 10);
    },
    overlay(ctx, t) {
      source(ctx, 'Gol (out/2026), via Space Money, O Globo e g1', vis(t, tOut, tMenos - 0.4, 0.5, 0.4));
      source(ctx, 'g1 Roraima (jul/2026)', vis(t, tBV, 88, 0.5, 0.4));
    },
  };
}

function pessoa(ctx, x, y, s, color) { // pictograma de passageiro
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, -34, 18, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-30, 40); ctx.quadraticCurveTo(-30, -8, 0, -8); ctx.quadraticCurveTo(30, -8, 30, 40); ctx.closePath(); ctx.fill();
  ctx.restore();
}
const CIA = { latam: '#be185d', gol: '#f97316', azul: '#2563eb' };

// ================================================================ Cena 06: quem fica com o lucro (e a desculpa dos processos)
function scene06(K) {
  const tQuem = K('E quem fica com o lucro'), tTres = K('três empresas levam quase todos'), tLat = K('Latam Gol e Azul'), tGol = K('Gol e Azul'), tAz = K('e Azul');
  const tMaior = K('A Latam é a maior'), t4 = K('com quatro de cada dez'), tTri = K('No terceiro trimestre'), tGrupo = K('o grupo Latam'), tSom = K('somando todos os países'), tLuc = K('lucrou quatrocentos e quarenta e um milhões'), t16 = K('dezesseis por cento mais');
  const tMes = K('No mesmo período'), tPrej = K('a Azul teve prejuízo'), tEsp = K('O lucro não está espalhado'), tFica = K('ele fica com quem tem mais aviões'), tDisp = K('nas rotas mais disputadas');
  const tCulpa = K('As empresas costumam pôr a culpa'), tProc = K('os processos na Justiça'), t3m = K('Em três meses de 2025'), t330 = K('elas pagaram trezentos e trinta milhões'), tParece = K('Parece muito'), tMenos = K('mas é menos de dois reais');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.04, dz: 0.006 }, { t: tTres, x: 960, y: 500, z: 1.0, d: 1.6 }, { t: t4 - 0.2, x: 960, y: 520, z: 1.08, d: 1.6 },
    { t: tTri - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: tLuc, x: 2200, y: 470, z: 1.08, d: 1.6 }, { t: tPrej - 0.3, x: 2620, y: 470, z: 1.08, d: 1.6 },
    { t: tEsp - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: tFica, x: 3700, y: 470, z: 1.08, d: 2 },
    { t: tCulpa - 0.4, x: 5200, y: 480, z: 1.0, d: 1.6 }, { t: tProc, x: 5120, y: 470, z: 1.1, d: 1.2 }, { t: tParece - 0.3, x: 5200, y: 500, z: 1.0, d: 1.6 }, { t: tMenos, x: 5300, y: 500, z: 1.06, d: 2 },
  ];
  const sfx = [[tQuem, 'pop', 0.4], [tLat, 'whoosh', 0.3], [tGol, 'whoosh', 0.3], [tAz, 'whoosh', 0.3], ...Array.from({ length: 10 }, (_, i) => [t4 - 0.2 + i * 0.07, 'tick', 0.3]),
    [tTri, 'paper', 0.5, { dur: 0.5 }], [tLuc, 'cash', 0.5], [t16, 'pop', 0.4], [tPrej, 'drop', 0.5], [tEsp, 'whoosh', 0.3], ...[0, 1, 2, 3, 4].map((i) => [tFica + i * 0.25, 'coin', 0.3]),
    [tProc, 'gavel', 0.9], [tProc + 0.35, 'gavel', 0.6], [t330, 'meter', 0.4, { dur: 1.2 }], [tParece, 'pop', 0.3], [tMenos + 0.4, 'sparkle', 0.4]];
  return {
    accent: CIA.latam, cam, sfx, impacts: [tProc], trans: 'push',
    draw(ctx, t, cam2) {
      saguaoFundo(ctx, cam2, 0.7, 0.4);
      // A: três empresas, a Latam com quatro de cada dez
      zone(ctx, cam2, 900, 1000, () => {
      headline(ctx, 'quem fica com o lucro?', 960, 150, { size: 72, k: appear(t, tQuem, 0.5) * (1 - appear(t, t4 - 0.4, 0.4)) });
      const up = 1 - appear(t, t4 - 0.4, 0.5);
      // "três empresas": as caudas entram ainda cinzas e ganham a cor quando o nome é dito
      [[600, CIA.latam, 'LATAM', tLat], [960, CIA.gol, 'GOL', tGol], [1320, CIA.azul, 'AZUL', tAz]].forEach(([x, col, nome, tn], i) => {
        const ys = 470 - 60 * (1 - up), sc = 0.9 - 0.25 * (1 - up), kS = appear(t, tTres + 0.3 + i * 0.3, 0.6), kC = appear(t, tn, 0.5);
        cauda(ctx, x, ys, sc, '#475569', '', kS * (1 - kC));
        cauda(ctx, x, ys, sc, col, nome, kC, { rise: kS < 1 });
      });
      if (t > t4 - 0.4) {
        for (let i = 0; i < 10; i++) { const k = appear(t, t4 - 0.2 + i * 0.07, 0.3); ctx.save(); ctx.globalAlpha *= k; pessoa(ctx, 600 + i * 80, 690, 0.9, i < 4 ? CIA.latam : '#64748b'); ctx.restore(); }
        chip(ctx, 1520, 690, '4 de cada 10', CIA.latam, appear(t, t4 + 0.6, 0.4), { size: 30 });
      }
      });
      // B: o balanço do trimestre
      zone(ctx, cam2, 2200, 2650, () => {
      if (t > tTri - 0.4) {
        cap(ctx, 'resultado do 3º trimestre de 2026', 2400, 170, { size: 34, alpha: appear(t, tTri - 0.3, 0.5) });
        caixaComp(ctx, 2100, 280, 'GRUPO LATAM', t < tLuc ? 'US$ ?' : '+US$ ' + Math.floor(counting(t, tLuc, 1.2, 0, 441)) + ' mi', P.ok, t < t16 ? 'todos os países' : 'todos os países · +16%', appear(t, tGrupo, 0.5), 80);
        chip(ctx, 2100, 650, 'lucro', P.ok, appear(t, tLuc + 0.4, 0.4), { size: 30 });
        caixaComp(ctx, 2720, 280, 'AZUL', '−R$ 538 mi', '#f87171', 'prejuízo no trimestre', appear(t, tPrej, 0.5), 80);
        chip(ctx, 2720, 650, 'prejuízo', '#f87171', appear(t, tPrej + 0.4, 0.4), { size: 30 });
      }
      });
      // C: o lucro vai para quem tem mais aviões nas rotas disputadas
      zone(ctx, cam2, 3650, 3850, () => {
      if (t > tEsp - 0.4) {
        const a = appear(t, tEsp - 0.3, 0.5);
        cauda(ctx, 3400, 560, 0.85, CIA.latam, 'LATAM', a); cauda(ctx, 3800, 600, 0.6, CIA.gol, 'GOL', a); cauda(ctx, 4140, 600, 0.6, CIA.azul, 'AZUL', a);
        for (let i = 0; i < 9; i++) { const k = prog(t, tFica + i * 0.22, 0.9); if (k <= 0 || k >= 1) continue; const x = lerp(3800 + (i % 3 - 1) * 160, 3400, ease.inOut(k)), y = lerp(300, 470, ease.in(k)) - Math.sin(k * Math.PI) * 120; moeda(ctx, x, y, 30); }
        headline(ctx, 'o lucro não está espalhado', 3800, 160, { size: 58, k: appear(t, tEsp, 0.5) });
        chip(ctx, 4300, 300, 'mais aviões nas rotas disputadas', CIA.latam, appear(t, tDisp, 0.4), { size: 28 });
      }
      });
      // D: os processos na Justiça
      zone(ctx, cam2, 5100, 5300, () => {
      if (t > tCulpa - 0.4) {
        const a = appear(t, tCulpa - 0.3, 0.5);
        const hitA = t < tProc ? -0.6 : t < tProc + 0.12 ? lerp(-0.6, 0.15, (t - tProc) / 0.12) : t < tProc + 0.35 ? lerp(0.15, -0.3, (t - tProc - 0.12) / 0.23) : t < tProc + 0.47 ? lerp(-0.3, 0.15, (t - tProc - 0.35) / 0.12) : 0.15;
        ctx.save(); ctx.globalAlpha *= a * (1 - appear(t, tParece - 0.3, 0.5) * 0.6); martelo(ctx, 4800, 440, 1.0, hitA); ctx.restore();
        chip(ctx, 4800, 220, 'processos na Justiça', '#e2e8f0', appear(t, tProc, 0.4), { size: 32 });
        if (t > t3m - 0.2) { bigNum(ctx, 'R$ 330 mi', 5480, 400, appear(t, t330, 0.5), { size: 120, color: '#fde68a', glow: hexA(P.amber, 0.6) }); cap(ctx, 'em condenações · jan a mar/2025', 5480, 500, { size: 30, alpha: appear(t, t3m, 0.5) }); }
        if (t > tParece - 0.2) {
          barraFatia(ctx, 4500, 620, 1400, 70, 0.0187, appear(t, tParece, 1.2), '#f87171', 'custos das companhias');
          chip(ctx, 5800, 740, 'menos de 2 de cada 100', '#f87171', appear(t, tMenos + 0.4, 0.4), { size: 30 });
        }
      }
      });
      bokeh(ctx, cam2, t, 17, 9);
    },
    overlay(ctx, t) {
      source(ctx, 'Anac (ago/2026); Latam e Azul (3º tri/2026)', vis(t, tMaior, tEsp, 0.5, 0.4));
      source(ctx, 'Anac, painel contábil (1º tri/2025)', vis(t, t3m, 60, 0.5, 0.4));
    },
  };
}

// bilhete com o canhoto do imposto crescendo (g = 0 hoje, 1 reforma completa)
function partesImposto(g, kOthers = 0.35) {
  const fT = lerp(0.08, 0.27, g), sc = (1 - fT) / 0.92;
  return FATIAS.map((F, i) => ({ f: i === 2 ? fT : F.f * sc, color: F.color, lab: i === 2 ? (g < 0.5 ? '8' : '27') : '', k: i === 2 ? 1 : kOthers, dy: i === 2 ? -24 : 0 }));
}

// ================================================================ Cena 07: janeiro (a reforma tributária chega na passagem)
function scene07(K) {
  const tFalta = K('Falta janeiro'), tDesde = K('Desde 2023'), tPIS = K('não paga PIS nem Cofins'), tDois = K('dois impostos federais'), tIsen = K('Essa isenção vai até o dia 31 de dezembro');
  const tJan = K('Em janeiro, começa a CBS'), tCBS = K('começa a CBS'), tRef = K('o imposto federal da reforma tributária'), tLugar = K('no lugar dos dois');
  const tMin = K('O Ministério de Portos e Aeroportos'), tQuando = K('quando a reforma estiver completa'), tTrip = K('pode mais que triplicar'), t27 = K('chegar a uns vinte e sete de cada cem'), t17 = K('O preço subiria uns dezessete por cento');
  const tAssoc = K('A associação das companhias da América Latina'), tPar = K('chegou a um número parecido'), tAinda = K('Ainda não está fechado'), tGrandes = K('As grandes empresas estão pedindo'), tReg = K('para pagar como aviação regional'), t40 = K('que tem desconto de quarenta por cento');
  const tPed = K('O imposto, que hoje é um pedaço pequeno'), tMudar = K('é o pedaço que mais vai mudar');
  const cam = [
    { t: 0, x: 760, y: 480, z: 1.08, dx: 6 }, { t: tDesde - 0.3, x: 1060, y: 480, z: 1.0, d: 1.6 }, { t: tIsen, x: 1160, y: 470, z: 1.08, d: 1.6 }, { t: tJan, x: 1120, y: 480, z: 1.04, d: 1.6 },
    { t: tMin - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: t27, x: 2400, y: 470, z: 1.06, d: 1.6 }, { t: t17 - 0.3, x: 2690, y: 480, z: 1.0, d: 1.4, dx: -3 },
    { t: tAinda - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6 }, { t: tReg, x: 3820, y: 470, z: 1.08, d: 1.8 },
    { t: tPed - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: tMudar, x: 2400, y: 470, z: 1.06, d: 2 },
  ];
  const sfx = [[tFalta, 'flip', 0.6, { dur: 0.6 }], [tDesde, 'paper', 0.5, { dur: 0.5 }], [tPIS, 'key', 0.4], [tDois, 'key', 0.4], [tIsen, 'stamp', 0.7], [tJan, 'chime', 0.4], [tCBS, 'stamp', 0.6], [tLugar, 'pop', 0.4],
    [tMin, 'whoosh', 0.3], [tQuando, 'riser', 0.35, { dur: 1.6 }], [tTrip, 'hit', 0.6], [t17, 'coin', 0.4], [tPar, 'pop', 0.4], [tAinda, 'stamp', 0.8], [tReg, 'jet', 0.35, { dur: 2 }], [t40, 'pop', 0.4], [tMudar, 'impact', 0.5]];
  return {
    accent: P.imposto, cam, sfx, impacts: [tTrip, tMudar], trans: 'push',
    draw(ctx, t, cam2) {
      saguaoFundo(ctx, cam2, 0.7, 0.5);
      // A: o calendário de janeiro e a guia dos impostos da passagem
      zone(ctx, cam2, 700, 1200, () => {
      calendario(ctx, 560, 470, 0.72, { title: 'JANEIRO 2027', first: 5, days: 31, headCol: '#b91c1c', mark: (d) => (d === 1 ? '#dc2626' : null) }, appear(t, tFalta - 0.2, 0.5));
      if (t > tDesde - 0.3) {
        const xk = prog(t, tJan, 0.6);
        folha(ctx, 1300, 470, 0.95, 'TRIBUTOS SOBRE A PASSAGEM', '#1e3a8a', [
          { a: 'PIS', b2: '0,00', x: xk, k: prog(t, tPIS - 0.2, 0.4) }, { a: 'COFINS', b2: '0,00', x: xk, k: prog(t, tPIS + 0.4, 0.4) },
          { a: 'zerados desde 2023', col: '#64748b', k: prog(t, tDois, 0.4) },
          { a: 'CBS (reforma tributária)', b2: 'entra', b: 1, col: '#b91c1c', col2: '#b91c1c', k: prog(t, tCBS + 0.2, 0.4), hl: '#ef4444' },
        ], appear(t, tDesde - 0.3, 0.6), { w: 640, h: 520, top: 170, lh: 74, sub: 'voo doméstico · passageiro' });
        rectStamp(ctx, 1460, 620, 420, 92, 'ATÉ 31/12/2026', P.red, prog(t, tIsen + 0.4, 0.35) * (1 - appear(t, tJan, 0.4)), -0.1, 44);
        chip(ctx, 1300, 150, 'janeiro: começa a CBS', '#fca5a5', appear(t, tCBS + 0.3, 0.4), { size: 30 });
      }
      });
      // B: o canhoto do imposto cresce
      zone(ctx, cam2, 2350, 2700, () => {
      if (t > tMin - 0.4) {
        const g = ease.inOut(prog(t, t27 - 0.2, 1.4)), a = appear(t, tMin - 0.3, 0.6);
        const pulse = t > tMudar ? 0.5 + 0.5 * Math.sin((t - tMudar) * 3) : g;
        cartao(ctx, 2400, 470, 0.8, { parts: partesImposto(t > tMudar ? pulse : g), a });
        cap(ctx, 'parte do imposto em cada R$ 100 (estimativa do Ministério)', 2400, 175, { size: 30, alpha: a });
        chip(ctx, 2060, 720, 'hoje: uns 8', '#fca5a5', appear(t, tMin + 0.4, 0.4), { size: 30 });
        chip(ctx, 2560, 720, 'reforma completa: IBS + CBS cheios', '#e2e8f0', vis(t, tQuando, t27 - 0.1, 0.4, 0.3), { size: 28 });
        chip(ctx, 2640, 720, 'reforma completa: uns 27', '#f87171', appear(t, t27, 0.4), { size: 30 });
        if (t > tTrip) headline(ctx, 'mais que o triplo', 2400, 236, { size: 56, k: vis(t, tTrip, tAinda - 0.4), hl: '#b91c1c' });
        if (t > t17 - 0.2) { chip(ctx, 3270, 380, 'preço: uns +17%', '#fde68a', vis(t, t17, tAinda - 0.4), { size: 32 }); chip(ctx, 3270, 470, 'aéreas da América Latina: +16%', '#e2e8f0', vis(t, tPar, tAinda - 0.4), { size: 26 }); }
        if (t > tPed - 0.3) headline(ctx, 'o pedaço que mais vai mudar', 2400, 236, { size: 60, k: appear(t, tMudar, 0.5), hl: '#b91c1c' });
      }
      });
      // C: ainda em discussão; o pedido para pagar como aviação regional
      zone(ctx, cam2, 3700, 3900, () => {
      if (t > tAinda - 0.4) {
        rectStamp(ctx, 3800, 220, 520, 110, 'EM DISCUSSÃO', '#f59e0b', prog(t, tAinda, 0.35), -0.06, 54);
        const kp = appear(t, tGrandes, 0.6);
        ctx.save(); ctx.globalAlpha *= kp; turboelice(ctx, lerp(3500, 3760, ease.out(kp)), 500, 1.3); ctx.restore();
        chip(ctx, 3800, 700, 'aviação regional: −40% no imposto novo', '#5eead4', appear(t, t40, 0.4), { size: 30 });
        chip(ctx, 3800, 360, 'grandes empresas querem pagar como regional', '#e2e8f0', appear(t, tReg, 0.4), { size: 26 });
      }
      });
      bokeh(ctx, cam2, t, 19, 9);
    },
    overlay(ctx, t) {
      source(ctx, 'Ministério da Fazenda; MPor (set/2026); Alta; O Globo', vis(t, tDesde, 60, 0.5, 0.4));
    },
  };
}

// régua de "dias antes do voo" (60 a 0) com a faixa barata (35 a 28) e a última semana (7 a 0)
function linhaDias(ctx, x, y, w, k, kb, kr, t) {
  if (k <= 0) return;
  const X = (d) => x + w * (1 - d / 60);
  ctx.save(); ctx.globalAlpha *= clamp(k * 2);
  fillRR(ctx, x, y - 10, w * ease.out(clamp(k)), 20, 10, '#334155');
  if (kb > 0) { ctx.save(); ctx.shadowColor = hexA('#16a34a', 0.8); ctx.shadowBlur = 20; fillRR(ctx, X(35), y - 34, (X(28) - X(35)) * ease.out(clamp(kb)), 68, 12, hexA('#16a34a', 0.9)); ctx.restore(); }
  if (kr > 0) fillRR(ctx, X(7), y - 34, (X(0) - X(7)) * ease.out(clamp(kr)), 68, 12, hexA('#dc2626', 0.9));
  for (let d = 60; d >= 0; d -= 5) { ctx.fillStyle = '#94a3b8'; ctx.fillRect(X(d) - 2, y + 22, 4, 18); text(ctx, String(d), X(d), y + 66, { size: 24, weight: 800, color: '#cbd5e1' }); }
  text(ctx, 'dias antes do voo', x + w / 2, y + 116, { size: 28, weight: 800, color: '#94a3b8' });
  ctx.save(); ctx.translate(X(0) + 60, y); ctx.rotate(-0.3); aviaoIcone(ctx, 0, 0, 1.6, '#93c5fd'); ctx.restore();
  ctx.restore();
}

// ================================================================ Cena 08: duas coisas na sua mão
function scene08(K) {
  const tQue = K('O que dá pra fazer com isso'), tPri = K('Primeiro'), tCompra = K('compra com uns trinta dias de antecedência'), tKay = K('Um levantamento do Kayak'), t28 = K('comprar entre vinte e oito e trinta e cinco dias antes'), tBar = K('costuma sair mais barato');
  const tUlt = K('Na última semana'), tDobro = K('chega a custar o dobro'), tSeg = K('Segundo'), tAchou = K('achou um preço bom'), tGar = K('garante'), tRegra = K('Pela regra da Anac'), t24 = K('você tem vinte e quatro horas para desistir'), tSete = K('desde que compre com pelo menos sete dias'), tSegura = K('Dá pra segurar o valor');
  const cam = [
    { t: 0, x: 960, y: 480, z: 1.04, dz: 0.006 }, { t: tCompra, x: 960, y: 470, z: 1.0, d: 1.6 }, { t: t28, x: 940, y: 460, z: 1.08, d: 1.6 }, { t: tUlt, x: 1060, y: 470, z: 1.1, d: 1.4 },
    { t: tSeg - 0.4, x: 2400, y: 480, z: 1.0, d: 1.6 }, { t: tGar, x: 2300, y: 470, z: 1.08, d: 1.2 }, { t: t24, x: 2500, y: 470, z: 1.06, d: 1.6 }, { t: tSegura, x: 2420, y: 480, z: 1.1, d: 2 },
  ];
    const sfx = [[tQue, 'pop', 0.4], [tPri, 'pop', 0.4], [tCompra, 'paper', 0.4], [t28, 'sparkle', 0.4], [tUlt, 'pop', 0.4], [tDobro, 'buzz', 0.35],
    [tSeg, 'pop', 0.4], [tAchou, 'tap', 0.6], [tGar, 'ding', 0.5], [t24, 'clock', 0.4, { n: 4, step: 0.4 }], [tSete, 'pop', 0.35], [tSegura, 'relay', 0.5]];
  return {
    accent: P.ok, cam, sfx, impacts: [], trans: 'push',
    draw(ctx, t, cam2) {
      saguaoFundo(ctx, cam2, 0.8);
      // A: comprar uns 30 dias antes
      zone(ctx, cam2, 900, 1100, () => {
      headline(ctx, 'o que dá pra fazer?', 960, 140, { size: 66, k: appear(t, tQue, 0.5) * (1 - appear(t, tCompra - 0.6, 0.4)) });
      { // painel do site de busca: quando comprar
        const kc = appear(t, tQue + 0.9, 0.6);
        if (kc > 0) {
          ctx.save(); ctx.globalAlpha *= clamp(kc * 2); ctx.translate(0, (1 - ease.out(kc)) * 40);
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 34; ctx.shadowOffsetY = 12; fillRR(ctx, 290, 330 + 60, 1340, 240, 24, '#0b1222'); ctx.restore();
          strokeRR(ctx, 290, 390, 1340, 240, 24, '#1f2a3d', 3);
          ctx.restore();
        }
      }
      if (t > tPri - 0.2) {
        chip(ctx, 520, 150, '1', P.ok, appear(t, tPri, 0.4), { size: 40 });
        text(ctx, 'compre uns 30 dias antes', 600, 150, { size: 40, weight: 900, color: '#ffffff', align: 'left', alpha: appear(t, tCompra, 0.4) });
        const kb = appear(t, t28 + 0.4, 0.6), kr = appear(t, tUlt + 0.3, 0.6), kl = appear(t, tCompra, 0.6);
        linhaDias(ctx, 360, 480, 1200, kl, kb, kr, t);
        chip(ctx, 930, 340, '28 a 35 dias antes: costuma ser mais barato', P.ok, appear(t, t28 + 0.8, 0.4), { size: 28 });
        chip(ctx, 1450, 680, 'última semana: até o dobro', '#f87171', appear(t, tDobro, 0.4), { size: 28 });
      }
      });
      // B: garantir o preço; 24 horas para desistir
      zone(ctx, cam2, 2300, 2500, () => {
      if (t > tSeg - 0.4) {
        chip(ctx, 1920, 150, '2', P.ok, appear(t, tSeg, 0.4), { size: 40 });
        text(ctx, 'achou um preço bom? garante', 2000, 150, { size: 40, weight: 900, color: '#ffffff', align: 'left', alpha: appear(t, tAchou, 0.4) });
        const press = prog(t, tAchou + 0.3, 0.3);
        celular(ctx, 2140, 490, 0.66, (c, x0, y0, w, h) => {
          c.fillStyle = '#1e3a8a'; c.fillRect(x0, y0, w, 120); text(c, 'RESUMO DA COMPRA', x0 + 30, y0 + 78, { size: 24, weight: 900, color: '#ffffff', align: 'left', letter: 1 });
          text(c, 'tarifa', x0 + 40, y0 + 200, { size: 30, weight: 800, color: '#475569', align: 'left' });
          text(c, 'garantida', x0 + 40, y0 + 250, { size: 40, weight: 900, color: press > 0.5 ? '#16a34a' : '#0f172a', align: 'left' });
          const bp = 1 - 0.08 * Math.sin(press * Math.PI);
          c.save(); c.translate(x0 + w / 2, y0 + h - 160); c.scale(bp, bp); fillRR(c, -150, -50, 300, 100, 22, press > 0.5 ? '#16a34a' : '#22c55e'); text(c, press > 0.5 ? 'COMPRADO' : 'COMPRAR', 0, 2, { size: 34, weight: 900, color: '#ffffff' }); c.restore();
          if (press > 0.5) check(c, x0 + w / 2, y0 + 400, 1.6, '#16a34a', prog(t, tGar, 0.5));
        }, { a: appear(t, tAchou - 0.3, 0.5), rot: 0.03 });
        if (t > tRegra - 0.2) {
          const k = appear(t, tRegra - 0.2, 0.5);
          ctx.save(); ctx.globalAlpha *= k; cronometro(ctx, 2720, 430, 170, 1 - prog(t, t24, 5) * 0.25, '24'); ctx.restore();
          chip(ctx, 2720, 660, 'para desistir sem pagar nada', P.ok, appear(t, t24 + 0.8, 0.4), { size: 28 });
          chip(ctx, 2720, 750, 'compra com 7 dias ou mais de antecedência', '#e2e8f0', appear(t, tSete, 0.4), { size: 24 });
        }
      }
      });
      bokeh(ctx, cam2, t, 23, 9);
    },
    overlay(ctx, t) {
      source(ctx, 'Kayak (2026); CNN Brasil (nov/2026)', vis(t, tKay, tSeg, 0.5, 0.4));
      source(ctx, 'Anac, Resolução 400', vis(t, tRegra, 40, 0.5, 0.4));
    },
  };
}

// ================================================================ Cena 09: fechamento, inscrição no painel e o próximo vídeo
function scene09(K) {
  const tEnt = K('Então, da próxima vez'), tLembra = K('lembra'), tMaior = K('a maior fatia vai para o tanque'), tSegue = K('e o tanque segue o petróleo e o dólar');
  const tImp = K('O imposto é pequeno hoje'), tMuda = K('mas muda a partir de janeiro'), tQuando = K('E quando o custo aperta'), tNem = K('a conta nem sempre chega no preço'), tAs = K('Às vezes ela chega como um voo'), tSome = K('que existe por dois meses e some');
  const tSe = K('Se esse vídeo te ajudou'), tInsc = K('se inscreve no canal'), tProx = K('No próximo'), tDesce = K('a gente desce do avião'), tCoz = K('e vai pra cozinha'), tCafe = K('o café teve a maior queda de preço'), tPlano = K('desde o Plano Real');
  const tAbre = K('A gente abre o pacote'), tCada = K('e mostra quem fica com cada real'), tAte = K('Até lá');
  const tPress = tInsc + 0.25;
  const cam = [
    { t: 0, x: 960, y: 470, z: 1.04, dz: 0.004 }, { t: tMaior - 0.2, x: 860, y: 450, z: 1.06, d: 1.6 }, { t: tImp - 0.2, x: 1020, y: 450, z: 1.12, d: 1.4 }, { t: tQuando - 0.3, x: 960, y: 470, z: 1.0, d: 1.6 },
    { t: tAs - 0.4, x: 2400, y: 440, z: 1.0, d: 1.6 }, { t: tSome, x: 2400, y: 430, z: 1.08, d: 1.4 }, { t: tSe - 0.2, x: 2500, y: 460, z: 1.0, d: 1.4 }, { t: tPress, x: 2600, y: 470, z: 1.06, d: 1.0 },
    { t: tProx - 0.4, x: 3800, y: 480, z: 1.0, d: 1.6, dz: 0.008 }, { t: tCada, x: 3800, y: 470, z: 1.06, d: 2.4 },
  ];
  const sfx = [[tEnt, 'paper', 0.5, { dur: 0.4 }], [tMaior, 'tear', 0.6], [tSegue, 'pop', 0.35], [tImp, 'pop', 0.35], [tMuda, 'riser', 0.3, { dur: 1 }], [tNem, 'pop', 0.3],
    [tAs, 'flip', 0.5, { dur: 0.5 }], [tSome, 'poweroff', 0.45], [tSe, 'flip', 0.7, { dur: 0.7 }], [tPress, 'click', 0.9], [tPress + 0.05, 'chime', 0.6], [tPress + 0.5, 'flip', 0.6, { dur: 0.6 }],
    [tProx, 'whoosh', 0.35], [tDesce, 'jet', 0.4, { dur: 2.2 }], [tCoz, 'clink', 0.4], [tCafe, 'liquid', 0.35, { dur: 1.2 }], [tPlano, 'pop', 0.4], [tCada, 'coin', 0.5]];
  return {
    accent: P.amber, cam, sfx, impacts: [], trans: 'push',
    draw(ctx, t, cam2) {
      saguaoFundo(ctx, cam2, 0.85, 0.3);
      // A: o bilhete inteiro, a fatia do tanque e a do imposto
      zone(ctx, cam2, 700, 1100, () => {
      const pop = vis(t, tMaior, tImp - 0.2, 0.4, 0.4), popI = appear(t, tImp, 0.4);
      const ps = FATIAS.map((F, i) => ({ f: F.f, color: F.color, lab: F.lab, k: 1, dy: i === 0 ? -40 * pop : i === 2 ? -40 * popI : 0 }));
      cartao(ctx, 960, 430, 1.0, { parts: ps, a: appear(t, 0, 0.5) });
      subFatias(ctx, 960, 712, 1.0, [1, 1, 1, 1, 1]);
      chip(ctx, 520, 150, 'petróleo', P.amber, vis(t, tSegue + 0.3, tNem - 0.3), { size: 30 }); chip(ctx, 780, 150, 'dólar', P.dolar, vis(t, tSegue + 0.9, tNem - 0.3), { size: 30 });
      if (t > tMuda - 0.2 && t < tNem) { chip(ctx, 1240, 150, 'muda em janeiro', '#f87171', vis(t, tMuda, tNem - 0.3), { size: 30 }); }
      headline(ctx, 'a conta nem sempre chega no preço', 960, 150, { size: 54, k: appear(t, tNem, 0.5) * 1, hl: '#1e3a8a', noPop: false });
      });
      // B: o voo que some; o painel vira o pedido de inscrição
      zone(ctx, cam2, 2350, 2650, () => {
      if (t > tAs - 0.6) {
        const rows = [t < tSe ? { c: ['07:10', 'AV 2207', 'PORTO VELHO', 'ENCERRADO'], col: '#f87171', tf: -1 }
          : t < tPress + 0.5 ? { c: ['AGORA', 'CANAL', 'INSCREVA-SE', 'EMBARQUE'], from: ['07:10', 'AV 2207', 'PORTO VELHO', 'ENCERRADO'], fromCol: '#f87171', tf: tSe, col: P.flapTxt }
            : { c: ['AGORA', 'CANAL', 'INSCREVA-SE', 'INSCRITO'], from: ['AGORA', 'CANAL', 'INSCREVA-SE', 'EMBARQUE'], tf: tPress + 0.5, col: P.ok }];
        const fade = t < tSe ? 1 - 0.6 * prog(t, tSome, 1.2) : 1;
        painel(ctx, 2400, 200, 1, rows, t, { rowsN: 1, clock: 'PORTÃO B', alpha: appear(t, tAs - 0.6, 0.5) * fade });
        cap(ctx, 'Rio Branco–Porto Velho: durou 2 meses', 2400, 480, { size: 32, alpha: vis(t, tAs, tSe - 0.3) });
        if (t > tSe - 0.2) {
          const kt = appear(t, tSe - 0.2, 0.5);
          ctx.save(); ctx.globalAlpha *= kt; totem(ctx, 2900, 640 - 80 * (1 - ease.out(kt)), 0.55, prog(t, tPress, 0.35), 'INSCREVER'); ctx.restore();
          if (t > tPress + 0.4) { check(ctx, 2900, 470, 1.0, P.ok, prog(t, tPress + 0.4, 0.4)); chip(ctx, 2400, 560, 'inscrito: embarque imediato', P.ok, appear(t, tPress + 0.9, 0.4), { size: 30 }); }
        }
      }
      });
      // C: o próximo vídeo (café)
      zone(ctx, cam2, 3700, 3900, () => {
      if (t > tProx - 0.4) {
        const a = appear(t, tProx - 0.3, 0.5);
        ctx.save(); ctx.globalAlpha *= a;
        if (t > tDesce) { const k = ease.inOut(prog(t, tDesce, 2.2)); ctx.save(); ctx.translate(lerp(3200, 4500, k), lerp(140, 300, k)); ctx.rotate(0.12); aviaoIcone(ctx, 0, 0, 2.2, '#e2e8f0'); ctx.restore(); }
        { const up = 90 * ease.inOut(prog(t, tCada - 0.5, 0.8)); xicara(ctx, 3560, 560 - up, 1.0, t); pacoteCafe(ctx, 4100, 500 - up, 0.9); }
        ctx.restore();
        cap(ctx, 'PRÓXIMO VÍDEO', 3800, 170, { size: 30, color: '#94a3b8', alpha: a, letter: 4 });
        chip(ctx, 3800, 250, 'a maior queda de preço em 1 ano desde o Plano Real', '#fde68a', appear(t, tCafe + 0.6, 0.4), { size: 28 });
        headline(ctx, 'quem fica com cada real?', 3800, 725, { size: 54, k: appear(t, tCada, 0.5), hl: '#7c2d12' });
      }
      });
      bokeh(ctx, cam2, t, 29, 10);
    },
    overlay(ctx, t) {
      source(ctx, 'IBGE (IPCA, jul/2026)', vis(t, tCafe, 50, 0.5, 0.4));
    },
  };
}

export const SCENES = [
  { id: '01', name: 'o-voo-de-dois-meses', build: scene01 },
  { id: '02', name: 'a-media-esconde', build: scene02 },
  { id: '03', name: 'o-bilhete-aberto', build: scene03 },
  { id: '04', name: 'o-tanque', build: scene04 },
  { id: '05', name: 'o-voo-que-some', build: scene05 },
  { id: '06', name: 'quem-fica-com-o-lucro', build: scene06 },
  { id: '07', name: 'janeiro', build: scene07 },
  { id: '08', name: 'na-sua-mao', build: scene08 },
  { id: '09', name: 'fechamento', build: scene09 },
];
