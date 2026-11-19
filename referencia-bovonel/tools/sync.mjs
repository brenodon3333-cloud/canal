// Gera a linha do tempo da narração: onde cada cena começa e termina e
// o instante (estimado) de cada palavra do roteiro.
//
// 1. As 12 maiores pausas do áudio separam as 13 cenas.
// 2. Dentro de cada cena, pausas curtas da voz são casadas com pontuação
//    do roteiro (pontos de ancoragem: palavra -> instante exato).
// 3. Entre âncoras, o tempo é distribuído pelo número de sílabas.
//
// Uso: node tools/sync.mjs <pasta-do-video>
// Saída: <pasta>/audio/timeline.json
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const PHRASE_GAP = 0.2; // pausa mínima entre frases (s)
const DB = -40;
const STEP = 0.01;

const root = path.resolve(process.argv[2]);
const audioFile = path.join(root, 'audio', 'narracao.mp3');
const roteiro = fs.readFileSync(path.join(root, 'roteiro.md'), 'utf8');

const scenes = [];
for (const line of roteiro.split('\n')) {
  if (/^## Cena/.test(line)) scenes.push([]);
  else if (line.startsWith('> ') && scenes.length) scenes[scenes.length - 1].push(...line.slice(2).trim().split(/\s+/));
}

// Sílabas aproximadas de uma palavra em português (como é falada).
const SPOKEN = { ICMS: 5, ANP: 4, CIDE: 2, PIS: 1, Cofins: 3, '2026': 7, '2027': 7, '2023': 7, '2002': 5 };
function syllables(tok) {
  const w = tok.replace(/[^\p{L}\p{N}]/gu, '');
  if (SPOKEN[w] != null) return SPOKEN[w];
  if (/^\d+$/.test(w)) return Math.max(2, w.length * 2);
  const groups = w.toLowerCase().match(/[aeiouáéíóúâêôãõàü]+/g);
  return Math.max(1, groups ? groups.length : 1);
}
function weight(tok) {
  let s = syllables(tok);
  if (/[.?!:]$/.test(tok)) s += 1.0;
  else if (/[,;]$/.test(tok)) s += 0.5;
  return s;
}

// Envelope de volume em janelas de 10 ms.
const b = await chromium.launch({
  executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome',
  args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'],
});
const p = await b.newPage();
const env = await p.evaluate(async (data) => {
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const buf = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(bytes.buffer);
  const sr = buf.sampleRate, win = Math.round(sr * 0.01);
  const chans = [...Array(buf.numberOfChannels).keys()].map((c) => buf.getChannelData(c));
  const out = [];
  for (let i = 0; i < buf.length; i += win) {
    let s = 0; const end = Math.min(buf.length, i + win);
    for (const ch of chans) for (let j = i; j < end; j++) s += ch[j] * ch[j];
    out.push(Math.sqrt(s / ((end - i) * chans.length)));
  }
  return { rms: out, duration: buf.duration };
}, fs.readFileSync(audioFile).toString('base64'));
await b.close();

const thr = Math.pow(10, DB / 20);
const loud = env.rms.map((v) => v > thr);
function quietRuns(minLen) {
  const runs = []; let s = -1;
  for (let k = 0; k <= loud.length; k++) {
    const q = k < loud.length && !loud[k];
    if (q && s < 0) s = k;
    if (!q && s >= 0) { if ((k - s) * STEP >= minLen) runs.push([s * STEP, k * STEP]); s = -1; }
  }
  return runs;
}
const firstLoud = loud.indexOf(true) * STEP;
const lastLoud = (loud.lastIndexOf(true) + 1) * STEP;
const N = scenes.length;
const inner = quietRuns(0.8).filter(([a, z]) => a > firstLoud && z < lastLoud);
const sceneGaps = [...inner].sort((x, y) => (y[1] - y[0]) - (x[1] - x[0])).slice(0, N - 1).sort((x, y) => x[0] - y[0]);
if (sceneGaps.length !== N - 1) throw new Error(`esperava ${N - 1} pausas entre cenas, achei ${sceneGaps.length}`);
const phraseRuns = quietRuns(PHRASE_GAP);

const timeline = [];
const report = [];
for (let i = 0; i < N; i++) {
  const words = scenes[i];
  const nW = words.length;
  const a0 = i === 0 ? firstLoud : sceneGaps[i - 1][1];
  const a1 = i === N - 1 ? lastLoud : sceneGaps[i][0];
  const segStart = i === 0 ? 0 : (sceneGaps[i - 1][0] + sceneGaps[i - 1][1]) / 2;
  const segEnd = i === N - 1 ? env.duration + 1.8 : (sceneGaps[i][0] + sceneGaps[i][1]) / 2;

  // posição acumulada (em sílabas) do início de cada palavra
  const cum = [0];
  words.forEach((w) => cum.push(cum[cum.length - 1] + weight(w)));
  const totalW = cum[nW];

  const bounds = [];
  words.forEach((w, k) => {
    if (k === nW - 1) return;
    if (/[.?!:]$/.test(w)) bounds.push({ k: k + 1, strong: true });
    else if (/[,;]$/.test(w)) bounds.push({ k: k + 1, strong: false });
  });
  const pauses = phraseRuns.filter(([a, z]) => a > a0 + 0.1 && z < a1 - 0.1).map(([a, z]) => ({ a, z, len: z - a }));

  // âncoras: [instante em que a palavra k começa, k]
  // Numa pausa, a palavra anterior termina em `a` e a próxima começa em `z`.
  const anchors = [{ t: a0, k: 0, endPrev: a0 }];
  let lastK = 0, lastT = a0;
  for (const ps of pauses) {
    const remainS = totalW - cum[lastK], remainT = a1 - lastT;
    const est = cum[lastK] + ((ps.a - lastT) / remainT) * remainS;
    let best = null;
    for (const bd of bounds) {
      if (bd.k <= lastK) continue;
      const penalty = bd.strong ? 0 : (ps.len > 0.45 ? 5 : 1.5);
      const d = Math.abs(cum[bd.k] - est) + penalty;
      if (!best || d < best.d) best = { ...bd, d };
    }
    const tol = Math.max(4, 0.15 * totalW);
    if (best && best.d < tol) {
      anchors.push({ t: ps.z, k: best.k, endPrev: ps.a });
      lastK = best.k; lastT = ps.z;
    }
  }
  anchors.push({ t: a1, k: nW, endPrev: a1 });

  // tempo de início de cada palavra
  const wt = new Array(nW).fill(0);
  for (let j = 0; j < anchors.length - 1; j++) {
    const A = anchors[j], B = anchors[j + 1];
    const span = cum[B.k] - cum[A.k];
    const tEnd = B.endPrev; // fala desse trecho vai de A.t até B.endPrev
    for (let k = A.k; k < B.k; k++) wt[k] = A.t + ((cum[k] - cum[A.k]) / span) * (tEnd - A.t);
  }
  timeline.push({
    scene: i, segStart, segEnd, speechStart: a0, speechEnd: a1,
    words: words.map((w, k) => ({ w, t: +(wt[k] - segStart).toFixed(3) })),
  });
  report.push(`cena ${String(i + 1).padStart(2, '0')}: ${segStart.toFixed(2)}–${segEnd.toFixed(2)}s, ${nW} palavras, ${anchors.length - 2}/${pauses.length} pausas ancoradas`);
}

fs.writeFileSync(path.join(root, 'audio', 'timeline.json'), JSON.stringify({ duration: env.duration, timeline }, null, 1));
console.log(`áudio: ${env.duration.toFixed(2)}s`);
console.log(report.join('\n'));
