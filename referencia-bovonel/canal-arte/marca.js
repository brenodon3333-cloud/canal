// Identidade do canal, versão 2 (15/11/2026): logo, banner e marca d'água.
// Usa as funções de assets.js (navyBg, gridLines, vig, glowT, bigType, rng) e de lib.js.
// Ideia: a etiqueta de preço do canal "abre" e mostra as fatias de quem fica com cada centavo.

const FATIAS = ['#3b82f6', '#84cc16', '#f59e0b', '#ef4444', '#a855f7']; // empresa, matéria-prima, estado, União, cadeia
const TAG_RATIO = 0.6;

// Contorno da etiqueta: retângulo com a ponta esquerda chanfrada. Canto superior esquerdo em (0,0).
function tagPath(ctx, w, h) {
  const n = h * 0.42, r = h * 0.12;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(n, 0);
  ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(n, h);
  ctx.closePath();
}

// Furo com ilhós de metal, centro em (x, y).
function eyelet(ctx, x, y, r) {
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, '#f8fafc'); g.addColorStop(0.45, '#9ca3af'); g.addColorStop(1, '#374151');
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = r * 0.6; ctx.shadowOffsetY = r * 0.15;
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#0a1020'; ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, 6.283); ctx.fill();
}

// Etiqueta de papel colorida (usada no leque). Pivô no furo: (0,0) é o centro do furo.
function plainTag(ctx, w, color, o = {}) {
  const h = w * TAG_RATIO, hx = h * 0.3, hy = h * 0.5;
  ctx.save(); ctx.translate(-hx, -hy);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = w * 0.05; ctx.shadowOffsetY = w * 0.012;
  ctx.fillStyle = color; tagPath(ctx, w, h); ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = g; tagPath(ctx, w, h); ctx.fill();
  if (o.edge !== false) { ctx.lineWidth = Math.max(1, w * 0.006); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; tagPath(ctx, w, h); ctx.stroke(); }
  ctx.restore();
}

// A etiqueta principal: amarela, com o "B" e a faixa das fatias. (0,0) = centro do furo.
function mainTag(ctx, w, o = {}) {
  const h = w * TAG_RATIO, hx = h * 0.3, hy = h * 0.5, stripe = o.stripe ?? 0.2;
  ctx.save(); ctx.translate(-hx, -hy);
  ctx.save(); ctx.shadowColor = o.glow || 'rgba(250,204,21,0.45)'; ctx.shadowBlur = w * 0.09; ctx.shadowOffsetY = w * 0.01;
  ctx.fillStyle = '#facc15'; tagPath(ctx, w, h); ctx.fill(); ctx.restore();
  ctx.save(); tagPath(ctx, w, h); ctx.clip();
  const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#fff06a'); g.addColorStop(0.55, '#facc15'); g.addColorStop(1, '#e0a800');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // fibra do papel
  const r = rng(11); for (let i = 0; i < w * 1.6; i++) { ctx.fillStyle = `rgba(120,80,0,${r() * 0.06})`; ctx.fillRect(r() * w, r() * h, 1 + r() * w * 0.006, 1 + r() * w * 0.003); }
  // faixa das fatias (o preço aberto)
  const sy = h * (1 - stripe), x0 = h * 0.36, sw = (w - x0) / FATIAS.length;
  FATIAS.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x0 + i * sw, sy, sw + 1, h * stripe); });
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x0, sy, w, h * 0.018);
  // brilho na borda de cima
  const top = ctx.createLinearGradient(0, 0, 0, h * 0.35); top.addColorStop(0, 'rgba(255,255,255,0.45)'); top.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = top; ctx.fillRect(0, 0, w, h * 0.35);
  ctx.restore();
  ctx.lineWidth = Math.max(1.5, w * 0.008); ctx.strokeStyle = 'rgba(120,80,0,0.35)'; tagPath(ctx, w, h); ctx.stroke();
  // B
  const bx = x0 + (w - x0) / 2 + w * 0.01, by = h * (1 - stripe) * 0.52, bs = h * (1 - stripe) * 0.98;
  ctx.save(); ctx.font = font(bs, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillText('B', bx, by + bs * 0.025);
  ctx.fillStyle = '#0b1530'; ctx.fillText('B', bx, by);
  ctx.restore();
  ctx.restore();
  eyelet(ctx, 0, 0, h * 0.1);
}

// Cordão saindo do furo.
function tagString(ctx, x, y, pts, lw) {
  ctx.save(); ctx.strokeStyle = '#e7e2d6'; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = lw * 2;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(...pts); ctx.stroke(); ctx.restore();
}

// Leque: as etiquetas coloridas abertas atrás da amarela, presas no mesmo furo.
function tagFan(ctx, w, o = {}) {
  const spread = o.spread ?? 0.16;
  for (let i = FATIAS.length - 1; i >= 0; i--) {
    ctx.save(); ctx.rotate(-spread * (i + 1)); plainTag(ctx, w, FATIAS[i]); ctx.restore();
  }
  mainTag(ctx, w, { stripe: o.stripe ?? 0 });
}

// Etiqueta "fatiada" (logo escolhida pelo dono, 15/11/2026): a amarela cortada em 5 fatias de tamanhos
// diferentes, como as fatias de um preço. O "B" fica inteiro na fatia maior, para ler em tamanho pequeno.
const CORTES = [0, 0.27, 0.43, 0.81, 0.91, 1];
function tagSliced(ctx, w) {
  const h = w * TAG_RATIO, hx = h * 0.3, hy = h * 0.5, n = 5, gap = w * 0.028;
  const dys = [0.035, -0.04, 0, 0.045, -0.03], rots = [-0.03, 0.025, 0, -0.03, 0.04];
  for (let i = 0; i < n; i++) {
    const a = CORTES[i] * w, b = CORTES[i + 1] * w, dx = i * gap - (gap * (n - 1)) / 2, dy = dys[i] * h;
    const mx = (a + b) / 2 - hx;
    ctx.save(); ctx.translate(dx + mx, dy); ctx.rotate(rots[i]); ctx.translate(-mx, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(a - hx, -h * 2, b - a, h * 4); ctx.clip();
    // sombra que separa uma fatia da outra
    ctx.save(); ctx.translate(-hx, -hy); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = w * 0.04; ctx.shadowOffsetY = w * 0.015;
    ctx.fillStyle = '#c99700'; tagPath(ctx, w, h); ctx.fill(); ctx.restore();
    mainTag(ctx, w, { stripe: 0.2 });
    // faixa da fatia inteira numa cor só + espessura do corte
    ctx.save(); ctx.translate(-hx, -hy); tagPath(ctx, w, h); ctx.clip();
    ctx.fillStyle = FATIAS[i]; ctx.fillRect(a, h * 0.8, b - a, h * 0.2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(a, h * 0.8, b - a, h * 0.018);
    if (i > 0) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(a, 0, w * 0.006, h); }
    if (i < n - 1) { ctx.fillStyle = 'rgba(90,60,0,0.35)'; ctx.fillRect(b - w * 0.007, 0, w * 0.007, h); }
    ctx.restore();
    ctx.restore();
    ctx.restore();
  }
}

// ---------------------------------------------------------------- logos 800x800 (o YouTube recorta em círculo)
function logoBg(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.55, h * 0.45, w * 0.55, '#facc15', 0.2], [w * 0.15, h * 0.95, w * 0.6, '#1d4ed8', 0.35], [w * 0.9, h * 0.1, w * 0.5, '#7c3aed', 0.2]]);
  const v = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.5);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}
// A: a etiqueta de sempre, refeita com papel, ilhós e faixa maior.
function drawLogoA(ctx, w, h) {
  logoBg(ctx, w, h);
  ctx.save(); ctx.translate(w * 0.27, h * 0.5); ctx.rotate(-0.2); mainTag(ctx, w * 0.66); ctx.restore();
}
// B: o leque (recomendada).
function drawLogoB(ctx, w, h) {
  logoBg(ctx, w, h);
  ctx.save(); ctx.translate(w * 0.25, h * 0.6); ctx.rotate(0.12); tagFan(ctx, w * 0.6, { spread: 0.15 }); ctx.restore();
}
// C: a etiqueta fatiada.
function drawLogoC(ctx, w, h) {
  logoBg(ctx, w, h);
  ctx.save(); ctx.translate(w * 0.29, h * 0.53); ctx.rotate(-0.14); tagSliced(ctx, w * 0.66); ctx.restore();
}

// ---------------------------------------------------------------- marca d'água 300x300, fundo transparente
function drawMarcaDagua2(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.save(); ctx.translate(w * 0.24, h * 0.6); ctx.rotate(0.12);
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 10;
  tagFan(ctx, w * 0.6, { spread: 0.15 });
  ctx.restore();
}

// ---------------------------------------------------------------- etiqueta de gôndola (banner)
// Layout de etiqueta de prateleira de verdade. Coordenadas locais 420 x 250.
function shelfLabel(ctx, d) {
  const W0 = 420, H0 = 250, INK = '#111827', GR = '#4b5563';
  const T = (s, x, y, size, weight = 700, color = INK, align = 'left', letter = 0) => text(ctx, s, x, y, { size, weight, color, align, letter });
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
  fillRR(ctx, 0, 0, W0, H0, 10, '#f4f1e8'); ctx.restore();
  const pg = ctx.createLinearGradient(0, 0, W0, H0); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#e6e1d4');
  fillRR(ctx, 0, 0, W0, H0, 10, pg);
  ctx.save(); rr(ctx, 0, 0, W0, H0, 10); ctx.clip();
  fillRR(ctx, 0, 0, W0, 54, 0, d.cor);
  T(d.nome, 18, 28, 25, 900, '#fff', 'left', 1);
  T(d.desc, 18, 76, 15, 600, GR);
  T('R$', 18, 132, 26, 800);
  ctx.save(); ctx.font = font(84, 900); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = INK; ctx.fillText(d.preco, 58, 160); const pw = ctx.measureText(d.preco).width; ctx.restore();
  if (d.un) T(d.un, 66 + pw, 146, 22, 700, GR);
  // fatia do imposto: a barra mostra quanto do preço é imposto
  const bx = 18, by = 182, bw = W0 - 36, bh = 18, k = d.imposto / 100;
  fillRR(ctx, bx, by, bw, bh, 4, '#3b82f6');
  ctx.save(); rr(ctx, bx, by, bw, bh, 4); ctx.clip();
  const ig = ctx.createLinearGradient(bx, 0, bx + bw * k, 0); ig.addColorStop(0, '#f59e0b'); ig.addColorStop(1, '#ef4444');
  ctx.fillStyle = ig; ctx.fillRect(bx, by, bw * k, bh); ctx.restore();
  T(d.legenda, 18, 220, 15, 800, '#b91c1c');
  // código de barras
  const r = rng(d.seed); let x = 300; ctx.fillStyle = '#111'; while (x < 402) { const bw2 = 1 + Math.floor(r() * 3); if (r() > 0.4) ctx.fillRect(x, 206, bw2, 30); x += bw2 + 1; }
  T(d.cod, 300, 243, 9, 600, GR);
  ctx.restore();
}
const LABELS = [
  { nome: 'GASOLINA COMUM', desc: 'Preço por litro', preco: '6,54', un: '/litro', imposto: 27, legenda: 'IMPOSTO: 27%', cor: '#c2410c', seed: 3, cod: '7891000 100014' },
  { nome: 'iPHONE', desc: 'iPhone 18 Pro · 256 GB', preco: '11.999', un: '', imposto: 46, legenda: 'IMPOSTO: 46%', cor: '#1e3a8a', seed: 5, cod: '7891000 200021' },
  { nome: 'CONTA DE LUZ', desc: 'Residencial · 182 kWh', preco: '199,00', un: '', imposto: 45, legenda: 'IMPOSTOS E ENCARGOS: 45%', cor: '#a16207', seed: 7, cod: '7891000 300038' },
  { nome: 'CARNE BOVINA', desc: 'Média dos cortes', preco: '50,00', un: '/kg', imposto: 7, legenda: 'IMPOSTO: 7%', cor: '#991b1b', seed: 9, cod: '7891000 400045' },
  { nome: 'CERVEJA LATA', desc: '350 ml', preco: '4,00', un: '', imposto: 30, legenda: 'IMPOSTO: 30%', cor: '#b45309', seed: 13, cod: '7891000 500052' },
];

// ---------------------------------------------------------------- banner 2560x1440
// Celular: só o centro 1546x423 aparece. Computador: a faixa inteira de 2560x423. TV: tudo.
function drawBanner2(ctx, w, h) {
  navyBg(ctx, w, h, [[w * 0.5, h * 0.5, 1150, '#facc15', 0.09], [w * 0.22, h * 0.5, 1000, '#1d4ed8', 0.3], [w * 0.8, h * 0.5, 1000, '#7c3aed', 0.22]]);
  gridLines(ctx, w, h, 96, 0.025);
  vig(ctx, w, h, 0.55);
  const cy = h / 2 + 10, sx = (w - 1546) / 2;
  // área segura (1546 x 423): nome + frase em duas linhas + dias. O grupo é medido e centralizado.
  const meas = (str, size, weight, letter = 0) => { ctx.save(); ctx.font = font(size, weight); if (letter) ctx.letterSpacing = `${letter}px`; const m = ctx.measureText(str).width; ctx.restore(); return m; };
  // sem logo no banner (pedido do dono, 15/11/2026): tudo centralizado na área segura
  const cx = w / 2, L1 = 'A gente abre o preço e mostra ', L2 = 'quem fica com cada centavo.', TS = 48;
  const pill = 'VÍDEO NOVO: DOMINGO, TERÇA E QUINTA', PS = 28, pw = meas(pill, PS, 800) + 44;
  bigType(ctx, 'BOVONEL', cx, cy - 34, { size: 200, depth: 10, stroke: 12, letter: 8, align: 'center' });
  const w1 = meas(L1, TS, 700), w2 = meas(L2, TS, 700), lx = cx - (w1 + w2) / 2;
  glowT(ctx, L1, lx, cy + 52, { size: TS, weight: 700, align: 'left', color: '#e2e8f0', blur: 14 });
  glowT(ctx, L2, lx + w1, cy + 52, { size: TS, weight: 700, align: 'left', color: '#fde68a', blur: 14 });
  const rowW = 5 * 46 - 8 + 22 + pw, rx = cx - rowW / 2;
  FATIAS.forEach((c, i) => fillRR(ctx, rx + i * 46, cy + 139, 38, 12, 6, c));
  const px = rx + 5 * 46 - 8 + 22;
  fillRR(ctx, px, cy + 120, pw, 50, 25, 'rgba(250,204,21,0.14)');
  strokeRR(ctx, px, cy + 120, pw, 50, 25, 'rgba(250,204,21,0.7)', 2.5);
  text(ctx, pill, px + 22, cy + 146, { size: PS, weight: 800, color: '#fde68a', align: 'left' });
}

// Tamanho final de cada arquivo (out = multiplicador sobre w x h) e supersampling (ss): desenha maior e reduz,
// para bordas, letras e sombras ficarem lisas. grain = granulação mínima que evita faixas nos degradês escuros.
Object.assign(ASSETS, {
  logoC: { w: 800, h: 800, out: 1.5, ss: 2, grain: 0.8, draw: drawLogoC, file: 'canal/logo.png' },
  banner2: { w: 2560, h: 1440, out: 1, ss: 3, grain: 1.2, draw: drawBanner2, file: 'canal/banner.png' },
  marca2: { w: 300, h: 300, out: 2, ss: 3, draw: drawMarcaDagua2, file: 'canal/marca-dagua.png' },
  logoA: { w: 800, h: 800, out: 1, ss: 2, draw: drawLogoA, file: 'canal/antigo/logo-opcao-A.png' },
  logoB: { w: 800, h: 800, out: 1, ss: 2, draw: drawLogoB, file: 'canal/antigo/logo-opcao-B.png' },
});
