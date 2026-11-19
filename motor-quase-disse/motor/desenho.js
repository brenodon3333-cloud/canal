// Utilidades de desenho em Canvas 2D: traço com "fervura" (o contorno treme de leve
// a 12 desenhos por segundo, como animação em dois), curvas de tempo e textura de grão.
const { createCanvas } = require('@napi-rs/canvas');

const TINTA = '#17141f';
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const suave = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const saida = (t) => 1 - Math.pow(1 - clamp(t), 3);
const entrada = (t) => Math.pow(clamp(t), 3);
const voltaAtras = (t) => { t = clamp(t); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
// fração de a..b no tempo t
const fr = (t, a, b) => clamp((t - a) / (b - a));
// mola amortecida disparada em t0 (devolve deslocamento; 0 antes do disparo)
const mola = (t, t0, freq = 3, amort = 4) => (t < t0 ? 0 : Math.exp(-amort * (t - t0)) * Math.sin(2 * Math.PI * freq * (t - t0)));

// Quadros-chave: [[t, valor, curva?], ...]
function chave(t, ks) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, a] = ks[i - 1], [t1, b, c] = ks[i];
      return lerp(a, b, (c || suave)((t - t0) / (t1 - t0)));
    }
  }
  return ks[ks.length - 1][1];
}

function hash(i) {
  let x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// estado global da fervura: muda a cada 1/12 s
const ferv = { passo: 0, amp: 1.6 };
// espessura do contorno: 1 = normal. Num plano detalhe desenhado com zoom de câmera,
// use 1/zoom para o contorno continuar com a mesma espessura na tela.
const linhaK = { k: 1 };
const treme = (seed, k) => (hash(seed * 31.7 + k * 7.3 + ferv.passo * 13.1) - 0.5) * 2 * ferv.amp;

// Caminho suave fechado/aberto por pontos (Catmull-Rom -> Bézier), com tremor no traço
function caminho(g, pts, fechado = true, seed = 1, tremor = 1) {
  const p = pts.map(([x, y], k) => [x + treme(seed, k) * tremor, y + treme(seed + 0.5, k) * tremor]);
  const N = p.length;
  g.beginPath();
  g.moveTo(p[0][0], p[0][1]);
  const lim = fechado ? N : N - 1;
  for (let i = 0; i < lim; i++) {
    const p0 = p[(i - 1 + N) % N], p1 = p[i], p2 = p[(i + 1) % N], p3 = p[(i + 2) % N];
    const a0 = fechado || i > 0 ? p0 : p1, a3 = fechado || i < N - 2 ? p3 : p2;
    g.bezierCurveTo(
      p1[0] + (p2[0] - a0[0]) / 6, p1[1] + (p2[1] - a0[1]) / 6,
      p2[0] - (a3[0] - p1[0]) / 6, p2[1] - (a3[1] - p1[1]) / 6,
      p2[0], p2[1]);
  }
  if (fechado) g.closePath();
}

function elipsePts(cx, cy, rx, ry, k = 14, rot = 0) {
  const out = [];
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    out.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return out;
}

// preenche e contorna
// reto: true = lados retos (polígono), para objetos de quina (mesa, pé de mesa, bolo)
function poligono(g, pts, seed, tremor) {
  g.beginPath();
  pts.forEach(([x, y], k) => { const px = x + treme(seed, k) * tremor * 0.6, py = y + treme(seed + 0.5, k) * tremor * 0.6; k ? g.lineTo(px, py) : g.moveTo(px, py); });
  g.closePath();
}
function forma(g, pts, cor, { seed = 1, linha = 5, fechado = true, tinta = TINTA, tremor = 1, reto = false } = {}) {
  if (reto) poligono(g, pts, seed, tremor); else caminho(g, pts, fechado, seed, tremor);
  if (cor && fechado) { g.fillStyle = cor; g.fill(); }
  if (linha > 0) {
    g.lineWidth = linha * linhaK.k; g.strokeStyle = tinta; g.lineJoin = 'round'; g.lineCap = 'round';
    g.stroke();
  }
}

// membro (braço, perna, cabo): volume colorido com contorno de tinta de espessura constante
function membro(g, pts, larg, cor, { seed = 1, borda = 5 } = {}) {
  traco(g, pts, larg + 2 * borda * linhaK.k, { seed });
  traco(g, pts, larg, { seed, tinta: cor });
}

function traco(g, pts, larg, { seed = 1, tinta = TINTA, tremor = 1 } = {}) {
  caminho(g, pts, false, seed, tremor);
  g.lineWidth = larg; g.strokeStyle = tinta; g.lineCap = 'round'; g.lineJoin = 'round';
  g.stroke();
}

// Olho: branco, pupila, pálpebras. look em -1..1, pupila 0..1 (tamanho), palpS/palpI 0..1 (fechamento)
function olho(g, cx, cy, rx, ry, { lx = 0, ly = 0, pupila = 0.5, palpS = 0, palpI = 0, pele = '#f3e2c7', linha = 4, seed = 3 } = {}) {
  g.save();
  const pts = elipsePts(cx, cy, rx, ry, 12);
  caminho(g, pts, true, seed, 0.6);
  g.fillStyle = '#fbf8f1'; g.fill();
  g.save(); g.clip();
  const pr = Math.min(rx, ry) * pupila;
  g.fillStyle = TINTA;
  g.beginPath(); g.arc(cx + lx * (rx - pr * 0.8) * 0.85, cy + ly * (ry - pr * 0.8) * 0.85, pr, 0, Math.PI * 2); g.fill();
  if (pupila > 0.25) { // brilho
    g.fillStyle = '#fbf8f1';
    g.beginPath(); g.arc(cx + lx * (rx - pr) * 0.85 - pr * 0.35, cy + ly * (ry - pr) * 0.85 - pr * 0.35, pr * 0.25, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = pele;
  if (palpS > 0) g.fillRect(cx - rx - 4, cy - ry - 4, rx * 2 + 8, (ry * 2 + 4) * palpS + 2);
  if (palpI > 0) g.fillRect(cx - rx - 4, cy + ry + 4 - (ry * 2 + 4) * palpI, rx * 2 + 8, (ry * 2 + 4) * palpI + 2);
  g.restore();
  caminho(g, pts, true, seed, 0.6);
  g.lineWidth = linha; g.strokeStyle = TINTA; g.stroke();
  if (palpS > 0.03) traco(g, [[cx - rx, cy - ry + ry * 2 * palpS], [cx + rx, cy - ry + ry * 2 * palpS]], linha * 0.9, { seed: seed + 1, tremor: 0.4 });
  if (palpI > 0.03) traco(g, [[cx - rx * 0.9, cy + ry - ry * 2 * palpI], [cx + rx * 0.9, cy + ry - ry * 2 * palpI]], linha * 0.8, { seed: seed + 2, tremor: 0.4 });
  g.restore();
}

// Boca: abertura 0..1; cantos (esq, dir) em px para cima (+) ou baixo (-)
function boca(g, cx, cy, larg, { abre = 0, cantoE = 0, cantoD = 0, linha = 5, seed = 9, interior = '#5a1f2b' } = {}) {
  const xe = cx - larg / 2, xd = cx + larg / 2;
  if (abre > 0.04) {
    const h = larg * 0.75 * abre;
    const pts = [[xe, cy - cantoE], [cx, cy - h * 0.25], [xd, cy - cantoD], [cx, cy + h]];
    forma(g, pts, interior, { seed, linha });
  } else {
    const meio = (cantoE + cantoD) / 2;
    traco(g, [[xe, cy - cantoE], [cx - larg * 0.2, cy + meio * 0.5], [cx + larg * 0.2, cy + meio * 0.5], [xd, cy - cantoD]], linha, { seed, tremor: 0.5 });
  }
}

// Textura de grão pré-gerada; desenhada com deslocamento a cada passo da fervura
function criarGrao(w, h) {
  const c = createCanvas(w, h), g = c.getContext('2d');
  const img = g.createImageData(w, h);
  let s = 7;
  for (let i = 0; i < w * h; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const v = (s >> 16) & 255;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

module.exports = { linhaK, membro, TINTA, lerp, clamp, suave, saida, entrada, voltaAtras, fr, mola, chave, hash, ferv, caminho, elipsePts, forma, traco, olho, boca, criarGrao };
