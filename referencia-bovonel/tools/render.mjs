// Renderizador do canal Bovonel.
//
// Uso:
//   node tools/render.mjs <pasta> preview <cena> <t1,t2,...>  -> PNGs (tempo dentro da cena) em saida/preview/
//   node tools/render.mjs <pasta> storyboard                    -> saida/storyboard.png
//   node tools/render.mjs <pasta> cues                          -> confere se todas as frases da animação foram achadas
//   node tools/render.mjs <pasta> audio                         -> saida/trilha-final.wav (voz + efeitos + música)
//   node tools/render.mjs <pasta> stems [voz|fundo|musica]              -> saida/_stem-voz.wav e _stem-fundo.wav (para medir mistura e sincronia)
//   node tools/render.mjs <pasta> final [segundos] [início]     -> saida/video-final.mov (imagem + trilha-final); com segundos, gera saida/teste-final.mov a partir do início
//   node tools/render.mjs <pasta> thumb                         -> saida/thumbnail.png
//
// Pré-requisito: node tools/sync.mjs <pasta>  (gera audio/timeline.json)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { remux } from './remux.mjs';

const require = createRequire(import.meta.url);
const PW = process.env.PLAYWRIGHT_MODULE ||
  '/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright';
const CHROME = process.env.CHROME_BIN || '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome';
const { chromium } = require(PW);

const [, , videoDir, mode = 'preview', arg1, arg2] = process.argv;
const root = path.resolve(videoDir);
const animDir = path.join(root, 'animacao');
const outDir = path.join(root, 'saida');
fs.mkdirSync(outDir, { recursive: true });
const MIME = 'video/mp4;codecs=avc1.640028';
const BITRATE = Number(process.env.BITRATE || 1_500_000);

// Seções da trilha (por cena): intensidade de cada camada.
// Cada vídeo pode ter o seu plano em animacao/musica.json; sem ele, vale o do vídeo 01.
const musicFile = path.join(animDir, 'musica.json');
const MUSIC = fs.existsSync(musicFile) ? JSON.parse(fs.readFileSync(musicFile, 'utf8')) : [
  { scene: 0, prog: 'minor', pulse: 0.8, arp: 0, hats: 0 },
  { scene: 2, prog: 'minor', pulse: 1, arp: 1, hats: 0 },
  { scene: 4, prog: 'minor', pulse: 1, arp: 1, hats: 1 },
  { scene: 7, prog: 'tense', pulse: 1.2, arp: 1.2, hats: 1.2 },
  { scene: 9, prog: 'minor', pulse: 1, arp: 1, hats: 1 },
  { scene: 11, prog: 'tense', pulse: 1.3, arp: 1.3, hats: 1.3 },
  { scene: 12, prog: 'end', pulse: 0.6, arp: 1, hats: 0.5 },
];

// A rede do navegador é bloqueada, então a página é montada num único HTML.
function bundle() {
  const strip = (src) => src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+/gm, '');
  const parts = ['lib.js', 'fx.js', 'audio.js', 'scenes.js'].map((f) => strip(fs.readFileSync(path.join(animDir, f), 'utf8')));
  const html = fs.readFileSync(path.join(animDir, 'index.html'), 'utf8');
  return html.replace(/<script type="module">([\s\S]*?)<\/script>/, (_, main) =>
    `<script>\n(() => {\n${parts.join('\n')}\n${strip(main)}\n})();\n</script>`);
}

const timeline = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'timeline.json'), 'utf8')).timeline;
const total = timeline[timeline.length - 1].segEnd;

const browser = await chromium.launch({ executablePath: CHROME, args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => console.error('[página]', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('[console]', m.text()); });
let sink = null;
await page.exposeFunction('__chunk', (b64) => { sink.write(Buffer.from(b64, 'base64')); });
// WebCodecs só existe em contexto seguro: abre uma página file:// (sem rede) e monta o HTML nela.
await page.goto('file://' + outDir + '/');
await page.setContent(bundle());
await page.waitForFunction(() => window.ready === true);
await page.evaluate(() => document.fonts.ready);
const { errors, events, impacts = [], trans = [] } = await page.evaluate((tl) => window.setup(tl), timeline);
if (errors.length) { console.error('Frases não encontradas na narração:\n  ' + errors.join('\n  ')); if (mode !== 'cues') process.exitCode = 1; }

function wav(pcm, sr) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
// Trilha escrita em cima da imagem (musica.json em formato de objeto): troca frases por tempos exatos.
function musicPlan(M) {
  const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const bad = [];
  const at = (cena, frase, depois) => {
    const seg = timeline[cena - 1];
    if (frase === 'impacto') {
      const from = depois ? at(cena, depois) : seg.segStart;
      const t = impacts.find((x) => x > from + 0.05 && x < seg.segEnd);
      if (t === undefined) bad.push(`cena ${cena}: impacto depois de "${depois}"`);
      return t ?? 1e9;
    }
    const toks = seg.words.map((w) => norm(w.w).join('')), p = norm(frase);
    for (let i = 0; i + p.length <= toks.length; i++) if (p.every((x, j) => toks[i + j] === x)) return seg.segStart + seg.words[i].t;
    bad.push(`cena ${cena}: "${frase}"`);
    return 1e9;
  };
  const secoes = M.secoes.map((x) => ({ ...x, t: x.frase ? at(x.cena, x.frase) : timeline[x.cena - 1].segStart }));
  const pausas = M.pausas.map((x) => {
    const a = at(x.cena, x.para), b = x.volta === 'impacto' ? at(x.cena, 'impacto', x.para) : at(x.cena, x.volta);
    return { a: a - 0.05, b, forca: x.forca ?? 0.8 };
  });
  const golpes = [
    ...M.golpes.map((x) => ({ t: at(x.cena, x.frase), forca: x.forca ?? 0.6 })),
    ...impacts.map((t) => ({ t, forca: 0.75 })),
    ...pausas.map((x) => ({ t: x.b, forca: x.forca })),
  ];
  // toda troca de cena: a música respira meio segundo antes e entra no tempo 1 com um golpe leve
  timeline.slice(1).forEach((seg, i) => { pausas.push({ a: seg.segStart - 0.45, b: seg.segStart, troca: trans[i + 1] }); golpes.push({ t: seg.segStart, forca: 0.5 }); });
  const subidas = M.subidas.map((x) => ({ fim: at(x.cena, x.ate, x.depois), dur: x.dur, forca: x.forca ?? 1 }));
  const fim = M.fim ? at(M.fim.cena, M.fim.frase) : total;
  if (bad.length) throw new Error('trilha: frases não encontradas:\n  ' + bad.join('\n  '));
  // golpes muito próximos viram um só (o mais forte)
  golpes.sort((x, y) => x.t - y.t);
  const g2 = [];
  for (const g of golpes) { const l = g2[g2.length - 1]; if (l && g.t - l.t < 0.35) { l.forca = Math.max(l.forca, g.forca); continue; } g2.push({ ...g }); }
  pausas.sort((x, y) => x.a - y.a);
  secoes.sort((x, y) => x.t - y.t);
  return { plano: true, bpm: M.bpm, secoes, pausas, golpes: g2, subidas, fim };
}

async function mixAudio(seconds) {
  const sections = Array.isArray(MUSIC) ? MUSIC.map((m) => ({ ...m, t: timeline[m.scene].segStart })) : musicPlan(MUSIC);
  const tmp = path.join(outDir, '_pcm.raw');
  sink = fs.createWriteStream(tmp);
  const voice = fs.readFileSync(path.join(root, 'audio', 'narracao.mp3')).toString('base64');
  const r = await page.evaluate(([v, e, t, s]) => window.mixAudio(v, e, t, s), [voice, events, seconds, sections]);
  await new Promise((res) => sink.end(res));
  const pcm = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  console.log(`trilha: ${(r.samples / r.sampleRate).toFixed(2)}s, pico ${r.peak.toFixed(2)}, ${events.length} efeitos`);
  return { pcm, sampleRate: r.sampleRate };
}

if (mode === 'plano') {
  // mostra a trilha resolvida (tempos de cada seção, pausa, golpe e subida)
  const P = musicPlan(MUSIC);
  fs.writeFileSync(path.join(outDir, 'plano-trilha.json'), JSON.stringify(P));
  const f = (t) => t.toFixed(2).padStart(7);
  for (const x of P.secoes) console.log(`${f(x.t)}  seção  cena ${x.cena} ${x.frase ? '"' + x.frase + '"' : '(início)'} ${x.prog}`);
  for (const x of P.pausas) console.log(`${f(x.a)}  pausa até ${x.b.toFixed(2)}${x.troca ? ' (troca: ' + x.troca + ')' : ''}`);
  for (const x of P.golpes) console.log(`${f(x.t)}  golpe ${x.forca}`);
  for (const x of P.subidas) console.log(`${f(x.fim - x.dur)}  subida até ${x.fim.toFixed(2)}`);
  console.log(`${f(P.fim)}  fim`);
} else if (mode === 'eventos') {
  // lista os efeitos sonoros com tempo (para escrever a trilha em cima da imagem)
  fs.writeFileSync(path.join(outDir, 'eventos.json'), JSON.stringify({ events, impacts, trans }));
  console.log(`${events.length} eventos em saida/eventos.json`);
} else if (mode === 'cues') {
  console.log(errors.length ? `${errors.length} frase(s) com problema` : `todas as frases encontradas; ${events.length} efeitos sonoros`);
} else if (mode === 'preview') {
  const dir = path.join(outDir, 'preview');
  fs.mkdirSync(dir, { recursive: true });
  const sc = Number(arg1) - 1;
  for (const t of arg2.split(',').map(Number)) {
    await page.evaluate((ta) => window.frame(ta), timeline[sc].segStart + t);
    const f = path.join(dir, `cena${arg1.padStart(2, '0')}-t${t.toFixed(1)}.png`);
    await page.locator('canvas').screenshot({ path: f });
    console.log(f);
  }
} else if (mode === 'storyboard') {
  const shots = [];
  for (const seg of timeline) {
    for (const k of [0.45, 0.85]) {
      await page.evaluate((ta) => window.frame(ta), seg.segStart + (seg.segEnd - seg.segStart) * k);
      shots.push([seg.scene + 1, k, await page.evaluate(() => document.getElementById('c').toDataURL('image/jpeg', 0.8))]);
    }
  }
  const p2 = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
  await p2.setContent(`<style>body{margin:0;background:#05070d;font:600 16px "Noto Sans";color:#cbd5e1}
    .g{display:grid;grid-template-columns:repeat(4,474px);gap:6px;padding:6px}img{width:474px;height:266px;display:block;border-radius:6px}</style>
    <div class="g">${shots.map(([n, k, s]) => `<div><img src="${s}"><span>Cena ${n} · ${Math.round(k * 100)}%</span></div>`).join('')}</div>`);
  await p2.screenshot({ path: path.join(outDir, 'storyboard.png'), fullPage: true });
  console.log(path.join(outDir, 'storyboard.png'));
} else if (mode === 'audio') {
  const { pcm, sampleRate } = await mixAudio(total);
  fs.writeFileSync(path.join(outDir, 'trilha-final.wav'), wav(pcm, sampleRate));
  console.log(path.join(outDir, 'trilha-final.wav'));
} else if (mode === 'stems') {
  // separa a mistura em voz e fundo (música + efeitos), pelo mesmo caminho da mistura final, para medir equilíbrio e sincronia
  for (const [nm, mute] of [['voz', { bed: true }], ['fundo', { voice: true }], ['musica', { voice: true, sfx: true }]].filter(([nm]) => !arg1 || arg1 === nm)) {
    await page.evaluate((m) => { window.__mute = m; }, mute);
    const { pcm, sampleRate } = await mixAudio(total);
    fs.writeFileSync(path.join(outDir, `_stem-${nm}.wav`), wav(pcm, sampleRate));
  }
  await page.evaluate(() => { window.__mute = null; });
  console.log('stems prontos');
} else if (mode === 'final') {
  const seconds = arg1 ? Number(arg1) : total;
  const name = arg1 ? 'teste-final.mov' : 'video-final.mov';
  const start = arg2 ? Number(arg2) : 0;
  // TRILHA=<wav>: usa uma trilha já mixada (a mesma para todas as partes), em vez de mixar de novo
  let pcm, sampleRate;
  if (process.env.TRILHA) {
    const w = fs.readFileSync(process.env.TRILHA);
    const di = w.indexOf('data');
    sampleRate = w.readUInt32LE(24);
    if (w.readUInt16LE(22) !== 1 || w.readUInt16LE(34) !== 16) throw new Error('TRILHA precisa ser WAV mono 16 bits');
    pcm = w.subarray(di + 8);
    const need = Math.round((start + seconds) * sampleRate) * 2;
    if (pcm.length < need) pcm = Buffer.concat([pcm, Buffer.alloc(need - pcm.length)]);
    console.log(`trilha: ${process.env.TRILHA} (${(pcm.length / 2 / sampleRate).toFixed(2)} s)`);
  } else ({ pcm, sampleRate } = await mixAudio(start + seconds));
  if (start || arg1) pcm = pcm.subarray(Math.round(start * sampleRate) * 2, Math.round((start + seconds) * sampleRate) * 2);
  if (!arg1) fs.writeFileSync(path.join(outDir, 'trilha-final.wav'), wav(pcm, sampleRate));
  const tmp = path.join(outDir, '_video.frag.mp4');
  sink = fs.createWriteStream(tmp);
  const file = path.join(outDir, name);
  let tracks;
  if (await page.evaluate(() => typeof window.encode === 'function' && typeof VideoEncoder === 'function')) {
    // quadro a quadro, tempo exato (nenhum quadro perdido)
    const r = await page.evaluate(([t, b, s0]) => window.encode(t, b, s0, 30), [seconds, BITRATE, start]);
    await new Promise((res) => sink.end(res));
    console.log(`imagem: ${r.frames} quadros codificados um a um em ${r.seconds.toFixed(1)}s; cor ${JSON.stringify(r.color)}`);
    const cs = r.color || {};
    const P = { bt709: 1, bt470bg: 5, smpte170m: 6 }, T = { bt709: 1, smpte170m: 6, 'iec61966-2-1': 13 }, M = { rgb: 0, bt709: 1, bt470bg: 5, smpte170m: 6 };
    const raw = { data: fs.readFileSync(tmp), samples: r.samples.map(([size, key]) => ({ size, key })), fps: 30, width: 1920, height: 1080,
      avcC: Buffer.from(r.avcC), color: [P[cs.primaries] ?? 1, T[cs.transfer] ?? 1, M[cs.matrix] ?? 1, !!cs.fullRange] };
    tracks = remux(null, file, { raw, pcm: { data: pcm, sampleRate }, mov: true });
  } else {
    const r = await page.evaluate(([t, m, b, s0]) => window.record(t, m, b, s0), [seconds, MIME, BITRATE, start]);
    await new Promise((res) => sink.end(res));
    console.log(`imagem: ${r.frames} quadros desenhados em ${r.seconds.toFixed(1)}s, ${r.slow} atrasos (pior ${r.worst.toFixed(0)} ms)`);
    tracks = remux(tmp, file, { pcm: { data: pcm, sampleRate }, mov: true });
  }
  fs.unlinkSync(tmp);
  console.log(JSON.stringify(tracks));
  console.log(`${name}: ${(fs.statSync(file).size / 1e6).toFixed(1)} MB`);
} else if (mode === 'thumb') {
  const p2 = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await p2.setContent(fs.readFileSync(path.join(animDir, 'thumbnail.html'), 'utf8'));
  await p2.evaluate(() => document.fonts.ready);
  await p2.screenshot({ path: path.join(outDir, 'thumbnail.png') });
  console.log(path.join(outDir, 'thumbnail.png'));
}
await browser.close();
