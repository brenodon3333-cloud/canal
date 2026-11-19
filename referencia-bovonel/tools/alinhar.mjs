// Alinha o roteiro com a narração, palavra por palavra, sem depender de pausas
// longas entre as cenas.
//
// 1. Divide o áudio em "blocos de fala" separados por pausas (>= 0,2 s).
// 2. Programação dinâmica: cada bloco (ou sequência de blocos) recebe um trecho
//    contínuo do texto. Custo = duração diferente da esperada pelas sílabas +
//    pausa caindo fora de pontuação + troca de cena numa pausa curta.
// 3. Dentro de cada bloco, as palavras são distribuídas por sílabas e depois
//    "encaixadas" no vale de energia mais próximo (início real da palavra).
//
// Uso: node tools/alinhar.mjs <pasta-do-video>
// Pré-requisito: node tools/envelope.mjs <pasta> (gera audio/envelope.json)
// Saída: <pasta>/audio/timeline.json (mesmo formato do sync.mjs) e audio/alinhamento.txt
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.argv[2]);
const env = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'envelope.json'), 'utf8'));
const roteiro = fs.readFileSync(path.join(root, 'roteiro.md'), 'utf8');
const STEP = env.step;
const DB = -40, MIN_GAP = 0.2;

// ---------------------------------------------------------------- texto
const scenes = [];
for (const line of roteiro.split('\n')) {
  if (/^## Cena/.test(line)) scenes.push([]);
  else if (line.startsWith('> ') && scenes.length) scenes[scenes.length - 1].push(...line.slice(2).trim().split(/\s+/));
}
// sem "## Cena" no roteiro: usa narracao-texto.txt (cada parágrafo é uma cena)
if (!scenes.some((x) => x.length)) {
  scenes.length = 0;
  const txt = fs.readFileSync(path.join(root, 'narracao-texto.txt'), 'utf8');
  for (const p of txt.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)) scenes.push(p.split(/\s+/));
}
const SPOKEN = { ICMS: 5, IPI: 3, PIS: 1, Cofins: 3, iPhone: 2, Apple: 2, ANP: 4, CIDE: 2, '2026': 7, '2027': 7, '2023': 7, '2002': 5, '18': 3, '17': 4, Pro: 1 };
function syl(tok) {
  const w = tok.replace(/[^\p{L}\p{N}]/gu, '');
  if (SPOKEN[w] != null) return SPOKEN[w];
  if (/^\d+$/.test(w)) return Math.max(2, w.length * 2);
  const g = w.toLowerCase().match(/[aeiouáéíóúâêôãõàü]+/g);
  return Math.max(1, g ? g.length : 1);
}
const toks = []; // {w, s(sílabas), scene, end: 'para'|'strong'|'weak'|null}
scenes.forEach((ws, si) => ws.forEach((w, k) => {
  let end = null;
  if (k === ws.length - 1) end = 'para';
  else if (/[.?!:]$/.test(w)) end = 'strong';
  else if (/[,;]$/.test(w)) end = 'weak';
  toks.push({ w, s: syl(w), scene: si, end });
}));
const cum = [0];
toks.forEach((t) => cum.push(cum[cum.length - 1] + t.s));
const NT = toks.length;

// ---------------------------------------------------------------- áudio
const thr = Math.pow(10, DB / 20);
const loud = env.rms.map((v) => v > thr);
const chunks = []; // [a, z] fala
{
  let s = -1, lastEnd = -1;
  const raw = [];
  for (let k = 0; k <= loud.length; k++) {
    const L = k < loud.length && loud[k];
    if (L && s < 0) s = k;
    if (!L && s >= 0) { raw.push([s * STEP, k * STEP]); s = -1; }
  }
  // junta trechos separados por silêncio menor que MIN_GAP
  for (const r of raw) {
    if (chunks.length && r[0] - chunks[chunks.length - 1][1] < MIN_GAP) chunks[chunks.length - 1][1] = r[1];
    else chunks.push([...r]);
  }
}
// remove ruídos muito curtos (< 60 ms) colados em pausas
const C = chunks.filter(([a, z]) => z - a >= 0.06);
const NC = C.length;
const speechTotal = C.reduce((s, [a, z]) => s + (z - a), 0);
const RATE = cum[NT] / speechTotal; // sílabas por segundo de fala

// ---------------------------------------------------------------- programação dinâmica
// estado: (i blocos usados, k palavras usadas). Transição: blocos i..i2-1 <- palavras k..k2-1
const MAXB = 4, MAXW = 60;
const INF = 1e18;
const cost = Array.from({ length: NC + 1 }, () => new Float64Array(NT + 1).fill(INF));
const back = Array.from({ length: NC + 1 }, () => new Int32Array((NT + 1) * 2).fill(-1));
cost[0][0] = 0;
function boundaryCost(k2, gapLen) {
  // palavra k2-1 é a última do trecho; gapLen = pausa depois do bloco (Infinity no fim)
  if (k2 === NT) return 0;
  const e = toks[k2 - 1].end;
  if (e === 'para') return 3 * Math.max(0, 0.9 - gapLen); // troca de cena prefere pausa longa
  if (e === 'strong') return 0.2;
  if (e === 'weak') return 0.6;
  return 4.0;
}
for (let i = 0; i < NC; i++) {
  for (let k = 0; k < NT; k++) {
    const c0 = cost[i][k];
    if (c0 >= INF) continue;
    let dur = 0, inner = 0;
    for (let i2 = i + 1; i2 <= Math.min(NC, i + MAXB); i2++) {
      dur += C[i2 - 1][1] - C[i2 - 1][0];
      if (i2 > i + 1) inner += 1.2 + 2 * (C[i2 - 1][0] - C[i2 - 2][1]); // pausa ignorada
      const gap = i2 < NC ? C[i2][0] - C[i2 - 1][1] : Infinity;
      for (let k2 = k + 1; k2 <= Math.min(NT, k + MAXW); k2++) {
        if (i2 === NC && k2 !== NT) continue;
        if (k2 === NT && i2 !== NC) continue;
        const exp = (cum[k2] - cum[k]) / RATE;
        const lr = Math.log(Math.max(dur, 0.05) / exp);
        const w = 10 * Math.min(1, (cum[k2] - cum[k]) / 6); // trechos curtos pesam menos
        const c = c0 + w * lr * lr + boundaryCost(k2, gap) + inner;
        if (c < cost[i2][k2]) { cost[i2][k2] = c; back[i2][k2 * 2] = i; back[i2][k2 * 2 + 1] = k; }
      }
    }
  }
}
if (cost[NC][NT] >= INF) throw new Error('não consegui alinhar');
const segs = [];
for (let i = NC, k = NT; i > 0;) {
  const pi = back[i][k * 2], pk = back[i][k * 2 + 1];
  segs.push({ i0: pi, i1: i, k0: pk, k1: k });
  i = pi; k = pk;
}
segs.reverse();

// ---------------------------------------------------------------- início de cada palavra
const wt = new Array(NT).fill(0);
const rmsAt = (t) => env.rms[Math.max(0, Math.min(env.rms.length - 1, Math.round(t / STEP)))];
for (const sg of segs) {
  const blocks = C.slice(sg.i0, sg.i1);
  const durs = blocks.map(([a, z]) => z - a);
  const total = durs.reduce((a, b) => a + b, 0);
  // mapeia posição em sílabas -> tempo, pulando as pausas internas
  const toTime = (frac) => {
    let x = frac * total;
    for (let b = 0; b < blocks.length; b++) {
      if (x <= durs[b] || b === blocks.length - 1) return blocks[b][0] + Math.min(x, durs[b]);
      x -= durs[b];
    }
  };
  const S = cum[sg.k1] - cum[sg.k0];
  for (let k = sg.k0; k < sg.k1; k++) {
    let t = toTime((cum[k] - cum[sg.k0]) / S);
    if (k > sg.k0) {
      // encaixa no começo real da palavra: a subida de energia mais forte por perto (±140 ms).
      // Se não houver subida clara, usa o vale de energia mais próximo.
      const dB = (v) => 20 * Math.log10(Math.max(v, 1e-6));
      const avg = (a, n) => { let s = 0; for (let i = 0; i < n; i++) s += rmsAt(a + i * STEP); return s / n; };
      let best = null;
      for (let d = -0.14; d <= 0.14; d += STEP) {
        const rise = dB(avg(t + d, 6)) - dB(avg(t + d - 6 * STEP, 6));
        const score = rise - 30 * Math.abs(d);
        if (rise > 6 && (!best || score > best.score)) best = { score, t: t + d };
      }
      if (best) t = best.t;
      else {
        let bt = t, bv = Infinity;
        for (let d = -0.09; d <= 0.09; d += STEP) { const v = rmsAt(t + d) * (1 + 3 * Math.abs(d)); if (v < bv) { bv = v; bt = t + d; } }
        t = bt;
      }
    } else t = blocks[0][0];
    wt[k] = t;
  }
}
for (let k = 1; k < NT; k++) if (wt[k] < wt[k - 1] + 0.04) wt[k] = wt[k - 1] + 0.04;

// ---------------------------------------------------------------- linha do tempo por cena
const N = scenes.length;
const firstOf = (si) => toks.findIndex((t) => t.scene === si);
const lastOf = (si) => toks.map((t) => t.scene).lastIndexOf(si);
const segOfTok = (k) => segs.find((s) => k >= s.k0 && k < s.k1);
const speechEndOf = (k) => { const s = segOfTok(k); return C[s.i1 - 1][1]; };
const timeline = [];
const lines = [];
for (let si = 0; si < N; si++) {
  const f = firstOf(si), l = lastOf(si);
  const speechStart = wt[f], speechEnd = speechEndOf(l);
  timeline.push({ scene: si, speechStart, speechEnd });
}
for (let si = 0; si < N; si++) {
  const T = timeline[si];
  T.segStart = si === 0 ? 0 : (timeline[si - 1].speechEnd + T.speechStart) / 2;
  T.segEnd = si === N - 1 ? env.duration + 1.8 : (T.speechEnd + timeline[si + 1].speechStart) / 2;
  T.words = toks.map((t, k) => ({ t, k })).filter((o) => o.t.scene === si).map(({ t, k }) => ({ w: t.w, t: +(wt[k] - T.segStart).toFixed(3) }));
  const gapAfter = si < N - 1 ? timeline[si + 1].speechStart - T.speechEnd : 0;
  lines.push(`cena ${String(si + 1).padStart(2, '0')}: ${T.segStart.toFixed(2)}–${T.segEnd.toFixed(2)} s (voz ${T.speechStart.toFixed(2)}–${T.speechEnd.toFixed(2)}), pausa depois ${gapAfter.toFixed(2)} s, ${T.words.length} palavras`);
}
// relatório detalhado: cada trecho com duração real x esperada
const det = segs.map((s) => {
  const dur = C.slice(s.i0, s.i1).reduce((a, [x, y]) => a + (y - x), 0);
  const exp = (cum[s.k1] - cum[s.k0]) / RATE;
  return `${C[s.i0][0].toFixed(2).padStart(7)} ${(dur / exp).toFixed(2)}  ${toks.slice(s.k0, s.k1).map((t) => t.w).join(' ')}`;
});
fs.writeFileSync(path.join(root, 'audio', 'timeline.json'), JSON.stringify({ duration: env.duration, timeline }, null, 1));
fs.writeFileSync(path.join(root, 'audio', 'alinhamento.txt'), lines.join('\n') + '\n\n' + det.join('\n') + '\n');
console.log(`blocos de fala: ${NC}, palavras: ${NT}, ritmo ${RATE.toFixed(2)} sílabas/s, custo ${cost[NC][NT].toFixed(1)}`);
console.log(lines.join('\n'));
