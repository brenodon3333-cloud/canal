// Artes do canal Bovonel: logo, banner e thumbnails.
// Usa as mesmas cores, ícones e tipografia do vídeo (lib.js).

function glowT(ctx, str, x, y, o) {
  ctx.save();
  ctx.shadowColor = o.glow || 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = o.blur ?? 30;
  ctx.shadowOffsetY = o.dy ?? 0;
  text(ctx, str, x, y, o);
  ctx.restore();
}
function navyBg(ctx, w, h, spots) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#060a15'); g.addColorStop(1, '#101a34');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (const [x, y, r, col, a] of spots) {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, hexA(col, a)); rg.addColorStop(1, hexA(col, 0));
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
  }
}
function gridLines(ctx, w, h, step, a = 0.04) {
  ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 0; x < w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
  for (let y = 0; y < h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
  ctx.stroke(); ctx.restore();
}
function vig(ctx, w, h, a = 0.6) {
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}
const SL = [C.petro, C.etanol, C.icms, C.fed, C.dist];

// Etiqueta de preço com "B" (símbolo do canal). Centro em (0,0), largura ~ s.
function priceTag(ctx, s, withStripe = true) {
  const w = s, h = s * 0.64, nose = h * 0.5;
  ctx.save();
  ctx.translate(-w / 2 + nose / 2, -h / 2);
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(0, h / 2); ctx.lineTo(nose, 0); ctx.lineTo(w - 18, 0);
    ctx.quadraticCurveTo(w, 0, w, 18); ctx.lineTo(w, h - 18); ctx.quadraticCurveTo(w, h, w - 18, h);
    ctx.lineTo(nose, h); ctx.closePath();
  };
  ctx.save(); ctx.shadowColor = hexA(C.gold, 0.55); ctx.shadowBlur = s * 0.12;
  const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#fde047'); g.addColorStop(1, '#eab308');
  ctx.fillStyle = g; path(); ctx.fill(); ctx.restore();
  if (withStripe) {
    ctx.save(); path(); ctx.clip();
    const sh = h * 0.16, sy = h - sh;
    const x0 = nose * 0.9, sw = (w - x0) / 5;
    SL.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x0 + i * sw, sy, sw + 1, sh); });
    ctx.restore();
  }
  // furo
  ctx.fillStyle = '#0b1222';
  ctx.beginPath(); ctx.arc(nose * 0.62, h / 2, h * 0.09, 0, 6.283); ctx.fill();
  // B
  text(ctx, 'B', nose + (w - nose) / 2, h * (withStripe ? 0.43 : 0.5), { size: h * 0.78, weight: 900, color: '#0b1222' });
  ctx.restore();
}

// ---------------------------------------------------------------- logo 800x800
function drawLogo(ctx, w, h) {
  navyBg(ctx, w, h, [[w / 2, h / 2, w * 0.55, C.gold, 0.22], [w * 0.2, h * 0.9, w * 0.5, '#1d4ed8', 0.25]]);
  ctx.save(); ctx.translate(w / 2 + 14, h / 2); ctx.rotate(-0.17);
  priceTag(ctx, w * 0.72);
  ctx.restore();
}

// ---------------------------------------------------------------- banner 2560x1440
function drawBanner(ctx, w, h) {
  navyBg(ctx, w, h, [[w / 2, h / 2, 1100, C.gold, 0.12], [w * 0.15, h * 0.3, 900, '#1d4ed8', 0.3], [w * 0.85, h * 0.7, 900, '#7c3aed', 0.22]]);
  gridLines(ctx, w, h, 96);
  // decoração fora da área segura (aparece só na TV/computador)
  ctx.save(); ctx.globalAlpha = 0.5;
  // rosca de fatias à direita
  const cx = w * 0.905, cy = h * 0.3, R = 230, r = 140;
  const vals = [32, 15, 24, 3, 26]; let a0 = -Math.PI / 2;
  vals.forEach((v, i) => { const sp = (v / 100) * 6.283; ctx.fillStyle = SL[i]; ctx.beginPath(); ctx.arc(cx, cy, R, a0, a0 + sp); ctx.arc(cx, cy, r, a0 + sp, a0, true); ctx.closePath(); ctx.fill(); a0 += sp; });
  // barras à esquerda
  [0.55, 0.8, 0.4, 0.95, 0.65].forEach((k, i) => fillRR(ctx, 180 + i * 90, h * 0.82 - 380 * k, 60, 380 * k, 12, SL[i]));
  // moedas
  [[w * 0.1, h * 0.18, 60], [w * 0.95, h * 0.85, 70], [w * 0.75, h * 0.12, 45], [w * 0.25, h * 0.92, 50]].forEach(([x, y, rr0]) => iconCoin(ctx, x, y, rr0, C.gold));
  ctx.restore();
  vig(ctx, w, h, 0.45);
  // área segura: 1546x423 centralizada
  const sx = (w - 1546) / 2, sy = (h - 423) / 2;
  ctx.save(); ctx.translate(sx + 210, h / 2); ctx.rotate(-0.17); priceTag(ctx, 330); ctx.restore();
  glowT(ctx, 'BOVONEL', sx + 440, h / 2 - 62, { size: 190, weight: 900, align: 'left', letter: 10, glow: 'rgba(0,0,0,0.8)', blur: 30 });
  glowT(ctx, 'A gente abre o preço e mostra quem fica com cada centavo.', sx + 446, h / 2 + 78, { size: 36, weight: 600, align: 'left', color: '#e2e8f0', blur: 16 });
  // assinatura de cores
  SL.forEach((c, i) => fillRR(ctx, sx + 446 + i * 120, h / 2 + 135, 104, 14, 7, c));
}

// ---------------------------------------------------------------- thumbnails 1920x1080
// A: o litro fatiado
function drawThumbA(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.72, h * 0.5, 800, C.gas, 0.28], [w * 0.15, h * 0.2, 700, '#1d4ed8', 0.3]]);
  gridLines(ctx, w, h, 90, 0.035);
  // garrafa/litro em fatias
  const bx = 1150, by = 120, bw = 560, bh = 840;
  const parts = [[32, C.petro, '32%'], [15, C.etanol, '15%'], [24, C.icms, '24%'], [3, C.fed, ''], [26, C.dist, '26%']];
  ctx.save(); ctx.shadowColor = hexA(C.gas, 0.6); ctx.shadowBlur = 80; fillRR(ctx, bx, by, bw, bh, 70, '#0b1222'); ctx.restore();
  ctx.save(); rr(ctx, bx, by, bw, bh, 70); ctx.clip();
  let y = by, gap = 14;
  parts.forEach(([v, c, lab], i) => {
    const ph = (v / 100) * bh;
    const off = (i - 2) * 0; // camadas levemente separadas
    ctx.fillStyle = c; ctx.fillRect(bx, y + off, bw, ph - (i < 4 ? gap * 0 : 0));
    if (lab) text(ctx, lab, bx + bw / 2, y + ph / 2 + 4, { size: 92, weight: 900, color: 'rgba(0,0,0,0.55)' });
    y += ph;
  });
  ctx.restore();
  // separações entre fatias (cortes)
  y = by;
  parts.forEach(([v], i) => { y += (v / 100) * bh; if (i < 4) { ctx.fillStyle = '#0b1222'; ctx.fillRect(bx + 6, y - 3, bw - 12, 6); } });
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 12; rr(ctx, bx, by, bw, bh, 70); ctx.stroke(); ctx.restore();
  vig(ctx, w, h, 0.5);
  // texto
  glowT(ctx, 'QUEM FICA', 90, 290, { size: 170, weight: 900, align: 'left', blur: 30, dy: 8 });
  glowT(ctx, 'COM ISSO?', 90, 470, { size: 170, weight: 900, align: 'left', color: C.gold, blur: 30, dy: 8 });
  // etiqueta de preço
  ctx.save(); ctx.translate(380, 780); ctx.rotate(-0.06);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40; fillRR(ctx, -320, -95, 680, 190, 34, '#dc2626'); ctx.restore();
  text(ctx, 'R$ 6,54', -70, 4, { size: 120, weight: 900 });
  text(ctx, '/litro', 250, 26, { size: 46, weight: 800, color: 'rgba(255,255,255,0.85)' });
  ctx.restore();
}

// B: a nota de R$ 100 em pedaços
function drawThumbB(ctx, w, h) {
  navyBg(ctx, w, h, [[w / 2, h * 0.55, 900, '#38bdf8', 0.22], [w * 0.1, h * 0.1, 600, C.icms, 0.18]]);
  gridLines(ctx, w, h, 90, 0.035);
  const nw = 1500, nh = 640, nx = (w - nw) / 2, ny = 300;
  const parts = [[32, C.petro, 'R$ 32'], [26, C.dist, 'R$ 26'], [24, C.icms, 'R$ 24'], [15, C.etanol, 'R$ 15'], [3, C.fed, '']];
  let x = nx;
  parts.forEach(([v, c, lab], i) => {
    const pw = (v / 100) * nw;
    const dx = (i - 2) * 46, dy = [30, -40, 50, -20, 60][i], rot = [-0.08, 0.05, -0.04, 0.08, 0.15][i];
    ctx.save();
    ctx.translate(x + pw / 2 + dx, ny + nh / 2 + dy); ctx.rotate(rot);
    ctx.save(); ctx.shadowColor = hexA(c, 0.7); ctx.shadowBlur = 50;
    const g = ctx.createLinearGradient(-pw / 2, -nh / 2, pw / 2, nh / 2); g.addColorStop(0, hexA(c, 0.55)); g.addColorStop(1, 'rgba(15,23,42,0.95)');
    ctx.fillStyle = g;
    // borda rasgada
    ctx.beginPath(); ctx.moveTo(-pw / 2, -nh / 2);
    ctx.lineTo(pw / 2, -nh / 2);
    for (let k = 0; k <= 12; k++) ctx.lineTo(pw / 2 + (k % 2 ? 10 : -8), -nh / 2 + (k / 12) * nh);
    ctx.lineTo(-pw / 2, nh / 2);
    for (let k = 12; k >= 0; k--) ctx.lineTo(-pw / 2 + (k % 2 ? -8 : 10), -nh / 2 + (k / 12) * nh);
    ctx.closePath(); ctx.fill(); ctx.restore();
    // faixa colorida do dono da fatia
    ctx.fillStyle = c; ctx.fillRect(-pw / 2 + 8, nh / 2 - 120, pw - 16, 120);
    if (i === 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 6; ctx.strokeRect(-pw / 2 + 30, -nh / 2 + 30, pw - 30, nh - 180);
      text(ctx, '100', -pw / 2 + 60, -nh / 2 + 120, { size: 130, weight: 900, align: 'left' });
    }
    if (lab) glowT(ctx, lab, 0, nh / 2 - 58, { size: Math.min(86, pw * 0.36), weight: 900, blur: 10 });
    ctx.restore();
    x += pw;
  });
  vig(ctx, w, h, 0.45);
  glowT(ctx, 'PRA ONDE VAI?', w / 2, 170, { size: 168, weight: 900, color: C.gold, blur: 34, dy: 8 });
}

// C: imposto zerado e o preço parado
function drawThumbC(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.42, h * 0.5, 800, C.led, 0.3], [w * 0.9, h * 0.2, 700, C.fed, 0.28]]);
  gridLines(ctx, w, h, 90, 0.035);
  // placa do posto grande
  ctx.save(); ctx.translate(760, 560); ctx.scale(1.9, 1.9);
  fillRR(ctx, -14, 170, 28, 300, 6, '#334155');
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 40; fillRR(ctx, -230, -200, 460, 380, 26, '#0f172a'); ctx.restore();
  strokeRR(ctx, -230, -200, 460, 380, 26, 'rgba(255,255,255,0.2)', 4);
  fillRR(ctx, -230, -200, 460, 90, 26, '#dc2626'); ctx.fillStyle = '#dc2626'; ctx.fillRect(-230, -140, 460, 30);
  text(ctx, 'GASOLINA COMUM', 0, -152, { size: 34, weight: 900, letter: 2 });
  fillRR(ctx, -190, -80, 380, 210, 16, '#05070d');
  ctx.save(); ctx.shadowColor = C.led; ctx.shadowBlur = 40;
  text(ctx, 'R$', -150, -40, { size: 34, weight: 800, color: C.led, align: 'left' });
  text(ctx, '6,54', 20, 30, { size: 150, weight: 900, color: C.led });
  ctx.restore();
  ctx.restore();
  // carimbo IMPOSTO ZERADO
  ctx.save(); ctx.translate(1540, 250); ctx.rotate(-0.18); ctx.scale(0.88, 0.88);
  ctx.save(); ctx.shadowColor = hexA(C.fed, 0.8); ctx.shadowBlur = 40;
  strokeRR(ctx, -330, -120, 660, 240, 30, C.fed, 16); ctx.restore();
  text(ctx, 'IMPOSTO', 0, -40, { size: 96, weight: 900, color: C.fed, letter: 4 });
  text(ctx, 'ZERADO', 0, 62, { size: 110, weight: 900, color: '#fff', letter: 4 });
  ctx.restore();
  // seta e interrogação
  ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.shadowColor = hexA(C.gold, 0.7); ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.moveTo(1420, 440); ctx.quadraticCurveTo(1300, 700, 1160, 760); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1160, 760); ctx.lineTo(1215, 690); ctx.moveTo(1160, 760); ctx.lineTo(1250, 778); ctx.stroke();
  ctx.restore();
  glowT(ctx, '?', 1660, 780, { size: 460, weight: 900, color: C.gold, blur: 50 });
  vig(ctx, w, h, 0.45);
}

// ---------------------------------------------------------------- marca d'água 300x300 (fundo transparente)
function drawMarcaDagua(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.save(); ctx.translate(w / 2 - 37, h / 2 + 6); ctx.rotate(-0.17);
  // contorno escuro para aparecer também em vídeos claros
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 14;
  priceTag(ctx, w * 0.7); ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- vídeo 02 (iPhone)
// iPhone de frente, centro em (0,0), altura h. o.screen(ctx, x, y, w, h) desenha a tela.
function phoneT(ctx, h, o = {}) {
  const w = h * 0.49, r = h * 0.13, bez = h * 0.024;
  ctx.save();
  ctx.save(); ctx.shadowColor = o.glow || 'rgba(0,0,0,0.7)'; ctx.shadowBlur = o.blur ?? 60;
  fillRR(ctx, -w / 2, -h / 2, w, h, r, '#9aa4b2'); ctx.restore();
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, '#e2e8f0'); g.addColorStop(0.5, '#7b8592'); g.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = g; rr(ctx, -w / 2, -h / 2, w, h, r); ctx.fill();
  const sx = -w / 2 + bez, sy = -h / 2 + bez, sw = w - 2 * bez, sh = h - 2 * bez, sr = r - bez;
  ctx.save(); rr(ctx, sx, sy, sw, sh, sr); ctx.clip();
  const sg = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh); sg.addColorStop(0, '#16213f'); sg.addColorStop(1, '#0a0f1e');
  ctx.fillStyle = sg; ctx.fillRect(sx, sy, sw, sh);
  if (o.screen) o.screen(ctx, sx, sy, sw, sh);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sw * 0.7, sy); ctx.lineTo(sx, sy + sh * 0.55); ctx.closePath(); ctx.fill();
  ctx.restore();
  fillRR(ctx, -w * 0.17, sy + h * 0.022, w * 0.34, h * 0.042, h * 0.021, '#000');
  ctx.restore();
}
function tagT(ctx, x, y, str, color, size, rot = 0) {
  const pad = size * 0.45;
  ctx.save(); ctx.font = `900 ${size}px "Noto Sans", sans-serif`;
  const w = ctx.measureText(str).width + pad * 2 + size * 0.5, h = size * 1.5;
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 40;
  ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 + h / 2, -h / 2); ctx.lineTo(w / 2 - 16, -h / 2); ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + 16);
  ctx.lineTo(w / 2, h / 2 - 16); ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - 16, h / 2); ctx.lineTo(-w / 2 + h / 2, h / 2); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#0b1222'; ctx.beginPath(); ctx.arc(-w / 2 + h * 0.42, 0, size * 0.13, 0, 6.283); ctx.fill();
  text(ctx, str, size * 0.28, 4, { size, weight: 900, color: '#0b1222' });
  ctx.restore();
}

// A: metade da tela do iPhone é imposto
function drawThumb2A(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.7, h * 0.5, 800, C.fed, 0.3], [w * 0.15, h * 0.2, 700, '#1d4ed8', 0.3]]);
  gridLines(ctx, w, h, 90, 0.035);
  ctx.save(); ctx.translate(1390, 560); ctx.rotate(0.12);
  phoneT(ctx, 980, { glow: hexA(C.fed, 0.7), blur: 90, screen(c, x, y, sw, sh) {
    const cut = y + sh * 0.46;
    const gt = c.createLinearGradient(0, y, 0, cut); gt.addColorStop(0, C.icms); gt.addColorStop(1, '#dc2626');
    c.fillStyle = gt; c.fillRect(x, y, sw, cut - y);
    c.fillStyle = C.petro; c.fillRect(x, cut, sw, y + sh - cut);
    c.fillStyle = '#0b1222'; c.fillRect(x, cut - 5, sw, 10);
    text(c, '46%', x + sw / 2, y + sh * 0.25, { size: 150, weight: 900, color: '#fff' });
    text(c, 'IMPOSTO', x + sw / 2, y + sh * 0.36, { size: 50, weight: 900, color: 'rgba(255,255,255,0.9)', letter: 3 });
    text(c, 'celular', x + sw / 2, y + sh * 0.72, { size: 54, weight: 800, color: 'rgba(255,255,255,0.75)' });
  } });
  ctx.restore();
  vig(ctx, w, h, 0.5);
  glowT(ctx, 'METADE', 90, 330, { size: 210, weight: 900, align: 'left', blur: 30, dy: 8 });
  glowT(ctx, 'É IMPOSTO', 90, 530, { size: 170, weight: 900, align: 'left', color: '#f87171', blur: 30, dy: 8 });
  tagT(ctx, 400, 790, 'R$ 11.999', C.gold, 110, -0.06);
}

// B: o mesmo celular, um preço pequeno e outro gigante
function drawThumb2B(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.68, h * 0.55, 850, C.gold, 0.2], [w * 0.2, h * 0.6, 600, '#1d4ed8', 0.35]]);
  gridLines(ctx, w, h, 90, 0.035);
  // EUA: pequeno
  ctx.save(); ctx.translate(430, 650); phoneT(ctx, 480, { glow: hexA(C.petro, 0.5) }); ctx.restore();
  text(ctx, 'EUA', 430, 360, { size: 64, weight: 900, color: '#93c5fd', letter: 4 });
  tagT(ctx, 430, 950, 'R$ 6.139', '#93c5fd', 70, -0.04);
  // Brasil: gigante
  ctx.save(); ctx.translate(1350, 560); ctx.rotate(-0.05); phoneT(ctx, 900, { glow: hexA(C.gold, 0.6), blur: 90 }); ctx.restore();
  glowT(ctx, 'BRASIL', 1350, 75, { size: 76, weight: 900, color: C.gold, letter: 6, glow: hexA(C.gold, 0.6) });
  tagT(ctx, 1380, 930, 'R$ 11.999', C.gold, 120, 0.05);
  // seta crescendo
  ctx.save(); ctx.strokeStyle = C.fed; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.shadowColor = hexA(C.fed, 0.8); ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.moveTo(680, 640); ctx.quadraticCurveTo(820, 380, 930, 330); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(930, 330); ctx.lineTo(850, 320); ctx.moveTo(930, 330); ctx.lineTo(900, 405); ctx.stroke(); ctx.restore();
  vig(ctx, w, h, 0.45);
  glowT(ctx, 'MESMO', 90, 130, { size: 100, weight: 900, align: 'left', blur: 24, dy: 6 });
  glowT(ctx, 'CELULAR', 90, 230, { size: 100, weight: 900, align: 'left', blur: 24, dy: 6 });
}

// C: imposto empilhado em cima de imposto, esmagando o iPhone
function drawThumb2C(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.66, h * 0.4, 800, '#e11d48', 0.28], [w * 0.1, h * 0.85, 600, C.icms, 0.2]]);
  gridLines(ctx, w, h, 90, 0.035);
  const cx = 1340;
  ctx.save(); ctx.translate(cx, 880); ctx.scale(1, 0.62); phoneT(ctx, 560, { glow: hexA(C.petro, 0.6) }); ctx.restore();
  const blocks = [['IMPORTAÇÃO', '#fb7185', 0.03], ['IPI', '#ef4444', -0.04], ['PIS / COFINS', '#e11d48', 0.05], ['ICMS', C.icms, -0.03]];
  blocks.forEach(([lab, col, rot], i) => {
    const y = 650 - i * 150, bw = 640 - i * 30;
    ctx.save(); ctx.translate(cx + (i % 2 ? -18 : 18), y); ctx.rotate(rot);
    ctx.save(); ctx.shadowColor = hexA(col, 0.7); ctx.shadowBlur = 40; fillRR(ctx, -bw / 2, -62, bw, 124, 20, col); ctx.restore();
    strokeRR(ctx, -bw / 2 + 10, -52, bw - 20, 104, 14, 'rgba(255,255,255,0.35)', 4);
    text(ctx, lab, 0, 4, { size: 66, weight: 900, color: '#fff', letter: 2 });
    ctx.restore();
  });
  // rachaduras de pressão
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  [[-210, 760, -280, 730], [-200, 790, -290, 805], [210, 760, 285, 735], [205, 795, 295, 810]].forEach(([a, b, c2, d]) => { ctx.beginPath(); ctx.moveTo(cx + a, b); ctx.lineTo(cx + c2, d); ctx.stroke(); });
  ctx.restore();
  vig(ctx, w, h, 0.5);
  glowT(ctx, 'IMPOSTO', 90, 300, { size: 170, weight: 900, align: 'left', blur: 30, dy: 8 });
  glowT(ctx, 'SOBRE', 90, 470, { size: 130, weight: 900, align: 'left', color: '#f87171', blur: 30, dy: 8 });
  glowT(ctx, 'IMPOSTO', 90, 640, { size: 170, weight: 900, align: 'left', blur: 30, dy: 8 });
}

// ---------------------------------------------------------------- vídeo 03 (conta de luz)
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// Texto de thumb com profundidade: marca-texto opcional, extrusão escura, contorno e preenchimento em degradê.
function bigType(ctx, str, x, y, o = {}) {
  const { size = 160, color = '#fff', color2 = null, align = 'left', depth = 9, stroke = 12, hl = null, rot = 0, letter = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = font(size, 900); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if (letter) ctx.letterSpacing = `${letter}px`;
  const w = ctx.measureText(str).width;
  const x0 = align === 'left' ? 0 : align === 'center' ? -w / 2 : -w;
  if (hl) {
    const pad = size * 0.16, top = -size * 0.8, bh = size * 1.02;
    ctx.save(); ctx.rotate(-0.025); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; ctx.fillStyle = hl;
    ctx.beginPath(); ctx.moveTo(x0 - pad, top + 6); ctx.lineTo(x0 + w + pad, top); ctx.lineTo(x0 + w + pad + 10, top + bh * 0.5); ctx.lineTo(x0 + w + pad - 4, top + bh); ctx.lineTo(x0 - pad + 4, top + bh + 6); ctx.lineTo(x0 - pad - 10, top + bh * 0.45); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = depth + 6; ctx.fillStyle = '#05070d'; ctx.fillText(str, depth * 0.4, depth); ctx.restore();
  ctx.fillStyle = '#05070d'; for (let i = depth; i > 0; i--) ctx.fillText(str, i * 0.4, i);
  ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = '#05070d'; ctx.strokeText(str, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.75, 0, 0); g.addColorStop(0, color); g.addColorStop(1, color2 || color);
  ctx.fillStyle = g; ctx.fillText(str, 0, 0);
  ctx.restore();
  return w;
}

// Conta de luz em papel, com o layout de uma conta real. Coordenadas locais 900 x 1280, canto em (0,0).
// o.reveal = true desenha a "tinta escondida" (linha dos encargos) em vermelho brilhante.
const BILL_W = 900, BILL_H = 1280;
function contaPapel(ctx, o = {}) {
  const W = BILL_W, H = BILL_H, NAVY = '#12305e', GR = '#5b6170', INK = '#1d2230';
  const T = (s, x, y, size, weight = 600, color = INK, align = 'left', letter = 0) => text(ctx, s, x, y, { size, weight, color, align, letter });
  // papel
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 34; ctx.fillStyle = '#efece3'; ctx.fillRect(0, 0, W, H); ctx.restore();
  const pg = ctx.createLinearGradient(0, 0, W, H); pg.addColorStop(0, '#fdfcf8'); pg.addColorStop(0.55, '#f3f0e7'); pg.addColorStop(1, '#e2ddd0');
  ctx.fillStyle = pg; ctx.fillRect(0, 0, W, H);
  const r = rng(7); for (let i = 0; i < 2600; i++) { ctx.fillStyle = `rgba(60,50,30,${r() * 0.05})`; ctx.fillRect(r() * W, r() * H, 1 + r() * 2.5, 1 + r() * 1.5); }
  // cabeçalho da distribuidora
  ctx.save(); ctx.translate(78, 74); circle(ctx, 0, 0, 42, NAVY);
  ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.moveTo(6, -30); ctx.lineTo(-16, 4); ctx.lineTo(-1, 4); ctx.lineTo(-8, 30); ctx.lineTo(16, -6); ctx.lineTo(1, -6); ctx.closePath(); ctx.fill(); ctx.restore();
  T('DISTRIBUIDORA', 136, 60, 32, 900, NAVY, 'left', 1); T('de Energia S.A.', 137, 94, 21, 600, NAVY);
  T('CNPJ 00.000.000/0001-00 · Insc. Est. 000.000.000.000', 870, 50, 13, 500, GR, 'right');
  T('Av. Central, 1000 · Centro · Atendimento 0800 000 0000', 870, 70, 13, 500, GR, 'right');
  T('Ouvidoria 0800 000 0001 · Aneel 167', 870, 90, 13, 500, GR, 'right');
  ctx.fillStyle = NAVY; ctx.fillRect(28, 128, W - 56, 50);
  T('CONTA DE ENERGIA ELÉTRICA', 46, 153, 25, 900, '#fff', 'left', 1);
  T('NOTA FISCAL Nº 012.345.678 · SÉRIE 001', 856, 153, 14, 700, '#dbe4f3', 'right');
  // cliente
  T('NOME DO CLIENTE', 30, 205, 12, 700, GR); T('MARIA APARECIDA DA SILVA', 30, 230, 21, 800);
  T('RUA DAS FLORES, 120 · CENTRO · CEP 01000-000', 30, 258, 15, 500); T('Classificação: B1 RESIDENCIAL · Monofásico', 30, 281, 15, 500);
  T('Nº DA INSTALAÇÃO', 600, 205, 12, 700, GR); T('3012345678', 600, 230, 22, 800);
  T('Nº DO CLIENTE', 600, 260, 12, 700, GR); T('7001234567', 600, 283, 18, 700);
  // caixas: referência, vencimento, total
  const box = (x, w, lab, val, dark) => {
    ctx.fillStyle = dark ? NAVY : 'rgba(18,48,94,0.07)'; ctx.fillRect(x, 305, w, 96);
    if (!dark) { ctx.strokeStyle = 'rgba(18,48,94,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(x, 305, w, 96); }
    T(lab, x + 16, 330, 13, 800, dark ? '#c7d4ea' : GR, 'left', 1); T(val, x + 16, 370, dark ? 40 : 30, 900, dark ? '#fff' : INK);
  };
  box(28, 272, 'REFERENTE A', 'NOV/2026'); box(314, 272, 'VENCIMENTO', '10/12/2026'); box(600, 272, 'TOTAL A PAGAR', 'R$ 199,00', true);
  // leitura
  const cols = [[30, 'MEDIDOR'], [170, 'LEITURA ANTERIOR'], [345, 'LEITURA ATUAL'], [505, 'CONSTANTE'], [640, 'CONSUMO kWh'], [790, 'DIAS']];
  ctx.fillStyle = 'rgba(18,48,94,0.1)'; ctx.fillRect(28, 418, W - 56, 32);
  cols.forEach(([x, l]) => T(l, x, 434, 12, 800, GR));
  ['A1234567', '14.523', '14.705', '1', '182', '30'].forEach((v, i) => T(v, cols[i][0], 470, 17, i === 4 ? 900 : 600));
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(28, 490); ctx.lineTo(W - 28, 490); ctx.stroke();
  // histórico de consumo
  T('HISTÓRICO DE CONSUMO (kWh)', 30, 520, 13, 900, NAVY, 'left', 1);
  const hist = [158, 149, 163, 171, 176, 168, 155, 160, 172, 178, 182, 175, 182], mes = ['NOV', 'DEZ', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV'];
  hist.forEach((v, i) => { const bh = (v - 100) * 1.45, x = 34 + i * 43; ctx.fillStyle = i === 12 ? NAVY : '#a9b2c3'; ctx.fillRect(x, 670 - bh, 28, bh); T(mes[i], x + 14, 688, 10, 700, GR, 'center'); });
  // bandeiras dos meses
  ctx.strokeStyle = 'rgba(18,48,94,0.35)'; ctx.lineWidth = 2; ctx.strokeRect(612, 505, 260, 190);
  T('BANDEIRA TARIFÁRIA', 628, 530, 13, 900, NAVY, 'left', 1);
  [['SET', 'AMARELA', '#eab308'], ['OUT', 'VERDE', '#16a34a'], ['NOV', 'VERDE', '#16a34a']].forEach(([m, n, c], i) => { const y = 570 + i * 42; T(m, 630, y, 15, 800); fillRR(ctx, 690, y - 15, 30, 30, 5, c); T(n, 732, y, 16, 800, c === '#eab308' ? '#a16207' : '#15803d'); });
  // itens da fatura
  const IX = [30, 470, 560, 650, 860];
  ctx.fillStyle = NAVY; ctx.fillRect(28, 712, W - 56, 36);
  ['ITENS DA FATURA', 'UNID.', 'QUANT.', 'PREÇO UNIT.', 'VALOR (R$)'].forEach((l, i) => T(l, IX[i], 730, 12, 800, '#fff', i === 4 ? 'right' : 'left'));
  const rows = [['Consumo Uso Sistema [kWh] - TUSD', 'kWh', '182', '0,538516', '98,01'], ['Consumo [kWh] - TE', 'kWh', '182', '0,483516', '88,00'], null,
    ['Adicional Bandeira Verde', '', '', '', '0,00'], ['Contrib. Ilum. Pública - Municipal', '', '', '', '12,99']];
  rows.forEach((row, i) => {
    const y = 774 + i * 38;
    if (i % 2 === 0) { ctx.fillStyle = 'rgba(18,48,94,0.05)'; ctx.fillRect(28, y - 19, W - 56, 38); }
    if (!row) {
      if (o.reveal) {
        ctx.save(); ctx.fillStyle = 'rgba(239,68,68,0.28)'; ctx.fillRect(28, y - 21, W - 56, 42);
        ctx.strokeStyle = '#e11d24'; ctx.lineWidth = 3; ctx.strokeRect(28, y - 21, W - 56, 42);
        ctx.shadowColor = '#ff2d2d'; ctx.shadowBlur = 14;
        T('ENCARGOS', 292, y + 1, 30, 900, '#d0161e'); T('R$ 29,85', 612, y + 1, 30, 900, '#d0161e', 'right');
        ctx.restore();
      }
      return;
    }
    row.forEach((v, j) => T(v, IX[j], y, 16, j === 4 ? 800 : 600, INK, j === 4 ? 'right' : 'left'));
  });
  ctx.strokeStyle = NAVY; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(28, 965); ctx.lineTo(W - 28, 965); ctx.stroke();
  T('TOTAL', IX[0], 988, 18, 900); T('199,00', IX[4], 988, 20, 900, INK, 'right');
  // tributos
  const TX = [30, 330, 560, 860];
  ctx.fillStyle = 'rgba(18,48,94,0.1)'; ctx.fillRect(28, 1012, W - 56, 30);
  ['TRIBUTOS', 'BASE DE CÁLCULO (R$)', 'ALÍQUOTA (%)', 'VALOR (R$)'].forEach((l, i) => T(l, TX[i], 1027, 12, 800, GR, i === 3 ? 'right' : 'left'));
  [['ICMS', '186,01', '18,00', '33,48'], ['PIS/PASEP', '186,01', '1,02', '1,90'], ['COFINS', '186,01', '4,71', '8,76']].forEach((row, i) => row.forEach((v, j) => T(v, TX[j], 1060 + i * 28, 15, j === 0 ? 800 : 600, INK, j === 3 ? 'right' : 'left')));
  // linha de corte + código de barras + Pix
  ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, 1150); ctx.lineTo(W - 10, 1150); ctx.stroke(); ctx.restore();
  T('836600000019 990000480012 003012345678 112026121004', 30, 1176, 15, 700, INK, 'left', 1);
  const rb = rng(31); let bx = 30; ctx.fillStyle = '#111'; while (bx < 640) { const bw = 1 + Math.floor(rb() * 4); if (rb() > 0.42) ctx.fillRect(bx, 1192, bw, 68); bx += bw + 1; }
  const rq = rng(77), qs = 6, q0x = 704, q0y = 1160;
  ctx.fillStyle = '#111'; for (let i = 0; i < 25; i++) for (let j = 0; j < 19; j++) if (rq() > 0.5) ctx.fillRect(q0x + i * qs, q0y + j * qs, qs, qs);
  [[0, 0], [18, 0], [0, 12]].forEach(([i, j]) => { ctx.fillStyle = '#111'; ctx.fillRect(q0x + i * qs, q0y + j * qs, 7 * qs, 7 * qs); ctx.fillStyle = '#f3f0e7'; ctx.fillRect(q0x + (i + 1) * qs, q0y + (j + 1) * qs, 5 * qs, 5 * qs); ctx.fillStyle = '#111'; ctx.fillRect(q0x + (i + 2) * qs, q0y + (j + 2) * qs, 3 * qs, 3 * qs); });
  T('PAGUE COM PIX', 780, 1140, 12, 900, NAVY, 'center', 1);
  // dobras do papel
  [H * 0.335, H * 0.665].forEach((fy) => { const fg = ctx.createLinearGradient(0, fy - 14, 0, fy + 14); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(0.48, 'rgba(0,0,0,0.10)'); fg.addColorStop(0.52, 'rgba(255,255,255,0.35)'); fg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = fg; ctx.fillRect(0, fy - 14, W, 28); });
  // luz rasante
  const lg = ctx.createLinearGradient(0, 0, W, 0); lg.addColorStop(0, 'rgba(255,255,255,0.10)'); lg.addColorStop(0.7, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,0.12)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
}
// coloca a conta na tela: centro (cx, cy), escala s, rotação rot
function placeBill(ctx, cx, cy, s, rot) { ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-BILL_W / 2, -BILL_H / 2); }

// Bandeira de tecido tremulando, presa no mastro em x0.
function flagCloth(ctx, x0, y0, w, h, base, dark, light) {
  const N = 120, F = 11.5, wave = (u) => Math.sin(u * F - 0.9) * h * 0.1 * (0.2 + u), slope = (u) => Math.cos(u * F - 0.9) * (0.45 + 0.9 * u);
  const path = () => { ctx.beginPath(); ctx.moveTo(x0, y0 + wave(0)); for (let i = 0; i <= N; i++) { const u = i / N; ctx.lineTo(x0 + u * w, y0 + wave(u) - u * h * 0.04); } for (let i = N; i >= 0; i--) { const u = i / N; ctx.lineTo(x0 + u * w * 0.985, y0 + h + wave(u - 0.04) * 1.2 + u * h * 0.05); } ctx.closePath(); };
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30; ctx.fillStyle = base; path(); ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
  for (let i = 0; i <= 48; i++) { const u = i / 48, sl = slope(u); g.addColorStop(u, sl > 0 ? hexA(light, Math.min(0.85, 0.75 * sl)) : hexA(dark, Math.min(0.85, -0.85 * sl))); }
  ctx.fillStyle = g; path(); ctx.fill();
  const v = ctx.createLinearGradient(0, y0 - 40, 0, y0 + h + 60); v.addColorStop(0, 'rgba(255,255,255,0.18)'); v.addColorStop(0.5, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = v; path(); ctx.fill();
  // bainha junto ao mastro
  ctx.save(); path(); ctx.clip(); ctx.fillStyle = hexA(dark, 0.45); ctx.fillRect(x0, y0 - 200, 26, h + 400); ctx.restore();
}
function mastro(ctx, x, y0, y1) {
  const g = ctx.createLinearGradient(x - 12, 0, x + 12, 0); g.addColorStop(0, '#6b7280'); g.addColorStop(0.4, '#f1f5f9'); g.addColorStop(1, '#4b5563');
  ctx.fillStyle = g; ctx.fillRect(x - 11, y0, 22, y1 - y0);
  const k = ctx.createRadialGradient(x - 6, y0 - 8, 2, x, y0, 24); k.addColorStop(0, '#fff'); k.addColorStop(1, '#9ca3af'); ctx.fillStyle = k; ctx.beginPath(); ctx.arc(x, y0, 22, 0, 6.283); ctx.fill();
}

// A: a lupa revela a linha escondida da conta
function drawThumb3A(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.62, h * 0.5, 900, C.gold, 0.16], [w * 0.1, h * 0.15, 700, '#1d4ed8', 0.32], [w * 0.62, h * 0.62, 420, '#ef4444', 0.22]]);
  gridLines(ctx, w, h, 90, 0.03);
  const B = [1290, 545, 0.84, -0.06];
  ctx.save(); placeBill(ctx, ...B); contaPapel(ctx); ctx.restore();
  // lupa
  const L = [1290, 722], R = 285, Z = 1.9;
  ctx.save(); ctx.strokeStyle = '#1f2937'; ctx.lineCap = 'round';
  const ang = 0.8, hx = L[0] + Math.cos(ang) * (R + 20), hy = L[1] + Math.sin(ang) * (R + 20);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 40; ctx.lineWidth = 84; ctx.strokeStyle = '#111827'; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(ang) * 360, hy + Math.sin(ang) * 360); ctx.stroke(); ctx.restore();
  ctx.lineWidth = 60; ctx.strokeStyle = '#7c2d12'; ctx.beginPath(); ctx.moveTo(hx + Math.cos(ang) * 90, hy + Math.sin(ang) * 90); ctx.lineTo(hx + Math.cos(ang) * 360, hy + Math.sin(ang) * 360); ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(hx + Math.cos(ang) * 95 - 18, hy + Math.sin(ang) * 95 + 14); ctx.lineTo(hx + Math.cos(ang) * 350 - 18, hy + Math.sin(ang) * 350 + 14); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(L[0], L[1], R, 0, 6.283); ctx.clip();
  ctx.fillStyle = '#0b1222'; ctx.fillRect(L[0] - R, L[1] - R, 2 * R, 2 * R);
  ctx.translate(L[0], L[1]); ctx.scale(Z, Z); ctx.translate(-L[0], -L[1]);
  placeBill(ctx, ...B); contaPapel(ctx, { reveal: true });
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(L[0], L[1], R, 0, 6.283); ctx.clip();
  const gl = ctx.createRadialGradient(L[0], L[1], R * 0.4, L[0], L[1], R); gl.addColorStop(0, 'rgba(255,60,60,0)'); gl.addColorStop(1, 'rgba(255,60,60,0.10)'); ctx.fillStyle = gl; ctx.fillRect(L[0] - R, L[1] - R, 2 * R, 2 * R);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.ellipse(L[0] - R * 0.35, L[1] - R * 0.45, R * 0.45, R * 0.18, -0.6, 0, 6.283); ctx.fill();
  ctx.restore();
  const rim = ctx.createLinearGradient(L[0] - R, L[1] - R, L[0] + R, L[1] + R); rim.addColorStop(0, '#e5e7eb'); rim.addColorStop(0.5, '#6b7280'); rim.addColorStop(1, '#1f2937');
  ctx.save(); ctx.shadowColor = 'rgba(239,68,68,0.6)'; ctx.shadowBlur = 50; ctx.strokeStyle = rim; ctx.lineWidth = 30; ctx.beginPath(); ctx.arc(L[0], L[1], R + 12, 0, 6.283); ctx.stroke(); ctx.restore();
  vig(ctx, w, h, 0.5);
  bigType(ctx, 'O QUE', 70, 300, { size: 150 });
  bigType(ctx, 'ELA', 70, 470, { size: 150 });
  bigType(ctx, 'ESCONDE?', 70, 660, { size: 150, color: '#fff7c2', color2: '#facc15', hl: '#b91c1c' });
}

// B: bandeira verde e a conta subiu
function drawThumb3B(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.25, h * 0.3, 800, '#22c55e', 0.25], [w * 0.78, h * 0.35, 700, '#ef4444', 0.3]]);
  gridLines(ctx, w, h, 90, 0.03);
  ctx.save(); placeBill(ctx, 1430, 720, 0.74, 0.07); contaPapel(ctx); ctx.restore();
  mastro(ctx, 150, 70, 1100);
  flagCloth(ctx, 160, 100, 760, 440, '#16a34a', '#052e16', '#86efac');
  // +9,4% sobre a conta
  bigType(ctx, '+9,4%', 1450, 250, { size: 210, color: '#fee2e2', color2: '#ef4444', align: 'center', rot: -0.05, depth: 12, stroke: 16 });
  vig(ctx, w, h, 0.45);
  bigType(ctx, 'VERDE...', 230, 770, { size: 150, color: '#bbf7d0', color2: '#22c55e' });
  bigType(ctx, 'E SUBIU?', 230, 960, { size: 160, hl: '#b91c1c' });
}

// C: a tomada com gambiarra de plugues, cada fio é alguém cobrando
// Plugue brasileiro saindo de uma tomada: (x, y) é onde ele encosta, ang aponta para fora. Devolve onde o fio começa.
function plugBR(ctx, x, y, ang, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  const g = ctx.createLinearGradient(0, -34, 0, 34); g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#e2e8f0'); g.addColorStop(1, '#94a3b8');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(70, -24); ctx.quadraticCurveTo(84, -20, 86, -14); ctx.lineTo(86, 14); ctx.quadraticCurveTo(84, 20, 70, 24); ctx.lineTo(0, 34); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.10)'; for (let i = 0; i < 5; i++) ctx.fillRect(16 + i * 10, -26 + i * 1.6, 4, 52 - i * 3.2);
  const g2 = ctx.createLinearGradient(0, -16, 0, 16); g2.addColorStop(0, '#f1f5f9'); g2.addColorStop(1, '#8b95a5');
  ctx.fillStyle = g2; rr(ctx, 84, -15, 46, 30, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(92 + i * 10, -15); ctx.lineTo(92 + i * 10, 15); ctx.stroke(); }
  ctx.restore();
  return [x + Math.cos(ang) * 128 * s, y + Math.sin(ang) * 128 * s];
}
function benjamim(ctx, x, y, s, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  const g = ctx.createLinearGradient(-70, -70, 70, 70); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b8c0cc');
  ctx.fillStyle = g; rr(ctx, -70, -70, 140, 140, 26); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 3; rr(ctx, -60, -60, 120, 120, 20); ctx.stroke();
  ctx.fillStyle = '#334155'; [[-22, -6], [22, -6], [0, 24]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 8, 0, 6.283); ctx.fill(); });
  ctx.restore();
}
function cableTag(ctx, x, y, label, col, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = font(46, 900); const tw = ctx.measureText(label).width + 70, th = 76;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(th / 2, -th / 2); ctx.lineTo(tw, -th / 2); ctx.lineTo(tw, th / 2); ctx.lineTo(th / 2, th / 2); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#0b1222'; ctx.beginPath(); ctx.arc(th * 0.42, 0, 8, 0, 6.283); ctx.fill();
  text(ctx, label, th * 0.42 + 22, 3, { size: 46, weight: 900, color: '#0b1222', align: 'left' });
  ctx.restore();
}
function drawThumb3C(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.66, h * 0.42, 820, C.gold, 0.2], [w * 0.1, h * 0.85, 600, '#7c3aed', 0.22]]);
  // parede com textura
  const r = rng(11); for (let i = 0; i < 9000; i++) { ctx.fillStyle = `rgba(255,255,255,${r() * 0.025})`; ctx.fillRect(r() * w, r() * h, 2, 2); }
  const SX = 1250, SY = 430;
  // placa 4x2 com duas tomadas
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  const pg = ctx.createLinearGradient(SX - 160, SY - 260, SX + 160, SY + 260); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#c9d0da');
  ctx.fillStyle = pg; rr(ctx, SX - 165, SY - 270, 330, 540, 28); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 4; rr(ctx, SX - 145, SY - 250, 290, 500, 20); ctx.stroke();
  const hexS = (cx, cy, R) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); } ctx.closePath(); };
  [SY - 120, SY + 120].forEach((cy) => { ctx.fillStyle = '#d5dbe3'; hexS(SX, cy, 92); ctx.fill(); ctx.fillStyle = '#b3bcc8'; hexS(SX, cy, 78); ctx.fill(); });
  ctx.fillStyle = '#334155'; [[-26, -8], [26, -8], [0, 22]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(SX + a, SY + 120 + b, 9, 0, 6.283); ctx.fill(); });
  [[SX, SY - 248], [SX, SY + 248]].forEach(([x, y]) => { circle(ctx, x, y, 10, '#aab3bf'); ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.stroke(); });
  // gambiarra: benjamim em cada tomada, mais um benjamim encaixado no de cima
  benjamim(ctx, SX, SY - 120, 1.05);
  benjamim(ctx, SX, SY + 120, 1.05);
  const plugs = [
    ['ICMS', C.icms, [SX - 70, SY - 165], -2.5, [560, 70]],
    ['PIS/COFINS', '#f87171', [SX + 70, SY - 165], -0.6, [1520, 110]],
    ['CDE', '#f472b6', [SX + 74, SY - 95], 0.05, [1600, 330]],
    ['ILUMINAÇÃO', '#fdba74', [SX + 74, SY + 105], 0.2, [1520, 640]],
    ['BANDEIRA', '#4ade80', [SX + 55, SY + 185], 1.05, [1440, 830]],
    ['TRANSMISSÃO', '#22d3ee', [SX - 55, SY + 185], 2.05, [1030, 900]],
  ];
  const backs = plugs.map(([, , c, ang]) => [c, ang]);
  // fios caindo com o peso (atrás dos plugues)
  ctx.save(); ctx.lineCap = 'round';
  plugs.forEach(([, , c, ang, e]) => {
    const p0 = [c[0] + Math.cos(ang) * 128, c[1] + Math.sin(ang) * 128];
    const p1 = [p0[0] + Math.cos(ang) * 120, p0[1] + Math.sin(ang) * 120];
    const draw = () => { ctx.beginPath(); ctx.moveTo(...p0); ctx.bezierCurveTo(p1[0], p1[1] + 60, e[0] - 90, e[1] + 70, e[0], e[1]); ctx.stroke(); };
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 22; draw();
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 14; draw();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4; ctx.save(); ctx.translate(-2, -3); draw(); ctx.restore();
  });
  ctx.restore();
  backs.forEach(([c, ang]) => plugBR(ctx, c[0], c[1], ang, 1));
  benjamim(ctx, SX + 26, SY - 140, 0.72, 0.32);
  // faíscas
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const sg = ctx.createRadialGradient(SX + 10, SY - 150, 0, SX + 10, SY - 150, 260); sg.addColorStop(0, 'rgba(253,224,71,0.5)'); sg.addColorStop(0.3, 'rgba(250,204,21,0.16)'); sg.addColorStop(1, 'rgba(250,204,21,0)');
  ctx.fillStyle = sg; ctx.fillRect(SX - 300, SY - 420, 620, 560);
  const rs = rng(5); ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) { const a = rs() * 6.283, d0 = 70 + rs() * 40, d1 = d0 + 30 + rs() * 90; ctx.beginPath(); ctx.moveTo(SX + 10 + Math.cos(a) * d0, SY - 150 + Math.sin(a) * d0); ctx.lineTo(SX + 10 + Math.cos(a) * d1, SY - 150 + Math.sin(a) * d1); ctx.stroke(); }
  ctx.restore();
  // etiquetas nas pontas dos cabos
  plugs.forEach(([lab, col, , , e], i) => cableTag(ctx, e[0], e[1], lab, col, [-0.08, 0.06, 0.04, -0.05, 0.05, -0.04][i]));
  vig(ctx, w, h, 0.5);
  bigType(ctx, 'QUEM ESTÁ', 70, 560, { size: 130 });
  bigType(ctx, 'PLUGADO?', 70, 740, { size: 160, color: '#fff7c2', color2: '#facc15', hl: '#1e3a8a' });
}

const ASSETS = {
  thumb3A: { w: 1920, h: 1080, draw: drawThumb3A, file: 'video-03-luz/saida/thumb-A-esconde.jpg' },
  thumb3B: { w: 1920, h: 1080, draw: drawThumb3B, file: 'video-03-luz/saida/thumb-B-verde.jpg' },
  thumb3C: { w: 1920, h: 1080, draw: drawThumb3C, file: 'video-03-luz/saida/thumb-C-plugado.jpg' },
  thumb2A: { w: 1920, h: 1080, draw: drawThumb2A, file: 'video-02-iphone/saida/thumb-A-metade.jpg' },
  thumb2B: { w: 1920, h: 1080, draw: drawThumb2B, file: 'video-02-iphone/saida/thumb-B-dobro.jpg' },
  thumb2C: { w: 1920, h: 1080, draw: drawThumb2C, file: 'video-02-iphone/saida/thumb-C-empilhado.jpg' },
  marcaDagua: { w: 300, h: 300, draw: drawMarcaDagua, file: 'canal/antigo/marca-dagua-v1.png' },
  logo: { w: 800, h: 800, draw: drawLogo, file: 'canal/antigo/logo-v1.png' },
  banner: { w: 2560, h: 1440, draw: drawBanner, file: 'canal/antigo/banner-v1.png' },
  thumbA: { w: 1920, h: 1080, draw: drawThumbA, file: 'video-01-gasolina/saida/thumb-A-litro.jpg' },
  thumbB: { w: 1920, h: 1080, draw: drawThumbB, file: 'video-01-gasolina/saida/thumb-B-nota.jpg' },
  thumbC: { w: 1920, h: 1080, draw: drawThumbC, file: 'video-01-gasolina/saida/thumb-C-imposto.jpg' },
};
