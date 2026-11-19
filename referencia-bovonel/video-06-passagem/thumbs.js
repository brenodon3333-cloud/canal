// Thumbnails do vídeo 06 (1920x1080). Usam os mesmos desenhos do vídeo (cartão de embarque, painel de partidas, jato, caminhão-tanque).
// Gerar: node tools/thumbs.mjs video-06-passagem
// Regras: objeto real em destaque, até 4 palavras, texto com profundidade, nada do nome do canal.

const TCAM = { x: 960, y: 540, z: 1 };
function tbVig(ctx, w, h, a = 0.55) {
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}
function tbGlow(ctx, x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080); }
function bigType(ctx, str, x, y, o = {}) {
  const { size = 160, color = '#fff', color2 = null, align = 'left', depth = 9, stroke = 12, hl = null, rot = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = font(size, 900); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(str).width, x0 = align === 'left' ? 0 : align === 'center' ? -w / 2 : -w;
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
function fundoSaguao(ctx, w, h, spots, noite = 0) {
  ctx.fillStyle = '#060a15'; ctx.fillRect(0, 0, w, h);
  saguaoFundo(ctx, TCAM, 1, noite);
  for (const [x, y, r, c, a] of spots) tbGlow(ctx, x, y, r, c, a);
}

// A: o cartão de embarque de R$ 746 aberto em canhotos; o canhoto da tarifa fica branco
function drawThumb6A(ctx, w, h) {
  fundoSaguao(ctx, w, h, [[1250, 640, 820, '#38bdf8', 0.18], [300, 250, 700, '#84cc16', 0.16]]);
  const parts = FATIAS.map((F, i) => ({ f: F.f, color: F.color, k: i < 4 ? 1 : 0, lab: i < 4 ? F.lab : '', dy: [-46, 24, -64, 34, 0][i], rot: [-0.05, 0.04, -0.07, 0.05, 0][i] }));
  cartao(ctx, 1060, 720, 0.98, { tarifa: 'R$ 746,62', parts, rot: -0.05 });
  tbVig(ctx, w, h, 0.45);
  const wq = bigType(ctx, 'QUEM', 80, 250, { size: 200 });
  bigType(ctx, 'FICA?', 80 + wq + 80, 250, { size: 200, color: '#fff7c2', color2: '#facc15', hl: '#1e3a8a' });
}

// B: o caminhão-tanque abastecendo a asa; "+84%" no querosene
function drawThumb6B(ctx, w, h) {
  fundoSaguao(ctx, w, h, [[1300, 520, 820, '#84cc16', 0.22], [400, 900, 600, '#f59e0b', 0.15]]);
  aviaoLado(ctx, 1250, 470, 2.3, { tail: '#1e3a8a' });
  caminhaoTanque(ctx, 1290, 900, 1.15);
  // mangueira do caminhão até o bocal sob a asa
  ctx.save(); ctx.strokeStyle = '#111827'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(925, 878); ctx.bezierCurveTo(760, 860, 860, 690, 1180, 640); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  fillRR(ctx, 1160, 612, 64, 52, 10, '#ca8a04'); fillRR(ctx, 1176, 600, 32, 18, 6, '#1f2937');
  tbVig(ctx, w, h, 0.45);
  bigType(ctx, '+84%', 80, 300, { size: 230, color: '#ecfccb', color2: '#84cc16', depth: 11 });
  bigType(ctx, 'DOBROU?', 80, 1000, { size: 170, color: '#fff7c2', color2: '#facc15', hl: '#b91c1c' });
}

// C: o painel de partidas com as linhas viradas para CANCELADO
function drawThumb6C(ctx, w, h) {
  fundoSaguao(ctx, w, h, [[1100, 700, 900, '#ef4444', 0.24]], 0.3);
  const rows = CORTES.map((c, i) => ({ c: [c[0], c[1], c[2], 'CANCELADO'], col: '#f87171', tf: 0 }));
  ctx.save(); ctx.translate(1060, 690); ctx.rotate(-0.03); painel(ctx, 0, -270, 1.08, rows, 100, { clock: 'FEV 2027' }); ctx.restore();
  tbVig(ctx, w, h, 0.45);
  const wv = bigType(ctx, 'O VOO', 80, 300, { size: 210 });
  bigType(ctx, 'SUMIU', 80 + wv + 70, 300, { size: 210, color: '#fff7c2', color2: '#facc15', hl: '#b91c1c' });
}

const THUMBS = {
  A: { draw: drawThumb6A, file: 'thumb-A-tarifa.jpg' },
  B: { draw: drawThumb6B, file: 'thumb-B-querosene.jpg' },
  C: { draw: drawThumb6C, file: 'thumb-C-cancelado.jpg' },
};
