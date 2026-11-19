// Revisão automática quadro a quadro.
// Desenha TODOS os quadros (30 por segundo) e mede onde cada texto foi parar na tela.
// Aponta: texto cortado na borda, textos encostando um no outro, texto na faixa das
// legendas e quadro "vazio" (quase nada desenhado fora das transições).
//
// Uso: node tools/qa.mjs <pasta> [fps=30]
// Saída: <pasta>/saida/qa.txt
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const [, , videoDir, fpsArg = '30', onlyArg] = process.argv;
const ONLY = onlyArg ? new Set(onlyArg.split(',').map(Number)) : null; // ex.: 3,4 confere só essas cenas
const root = path.resolve(videoDir);
const animDir = path.join(root, 'animacao');
const FPS = Number(fpsArg);
function bundle() {
  const strip = (src) => src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+/gm, '');
  const parts = ['lib.js', 'fx.js', 'audio.js', 'scenes.js'].map((f) => strip(fs.readFileSync(path.join(animDir, f), 'utf8')));
  const html = fs.readFileSync(path.join(animDir, 'index.html'), 'utf8');
  return html.replace(/<script type="module">([\s\S]*?)<\/script>/, (_, main) =>
    `<script>\n(() => {\n${parts.join('\n')}\n${strip(main)}\n})();\n</script>`);
}
const timeline = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'timeline.json'), 'utf8')).timeline;
const total = timeline[timeline.length - 1].segEnd;

const b = await chromium.launch({ executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome', args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'] });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => console.error('[página]', e.message));
// grava a caixa de cada texto desenhado, já com a câmera aplicada
const PATCH = () => {
  const P = CanvasRenderingContext2D.prototype, orig = P.fillText;
  window.__texts = [];
  P.fillText = function (str, x, y, maxW) {
    if (this.canvas && this.canvas.id === 'c' && String(str).trim()) {
      const m = this.measureText(str);
      let w = m.width; if (maxW && w > maxW) w = maxW;
      const al = this.textAlign, bl = this.textBaseline;
      let x0 = al === 'center' ? x - w / 2 : (al === 'right' || al === 'end') ? x - w : x;
      const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
      let y0 = y - asc, y1 = y + desc;
      const T = this.getTransform();
      const pts = [[x0, y0], [x0 + w, y0], [x0, y1], [x0 + w, y1]].map(([px, py]) => [T.a * px + T.c * py + T.e, T.b * px + T.d * py + T.f]);
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      window.__texts.push({ rot: Math.abs(T.b) > 1e-3, s: String(str), a: this.globalAlpha, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) });
    }
    return orig.call(this, str, x, y, maxW);
  };
};
await page.setContent(bundle());
await page.evaluate(PATCH);
await page.waitForFunction(() => window.ready === true);
await page.evaluate(() => document.fonts.ready);
await page.evaluate((tl) => window.setup(tl), timeline);

const W = 1920, H = 1080, SUB = 890;
const N = Math.floor(total * FPS);
const issues = new Map(); // chave -> {kind, scene, msg, runs:[[a,b]], worst}
const DT = 1 / FPS;
const add = (kind, scene, msg, ta, worst = 0) => {
  const key = `${kind}|${scene}|${msg}`;
  let it = issues.get(key);
  if (!it) { it = { kind, scene, msg, runs: [], worst: 0 }; issues.set(key, it); }
  const r = it.runs[it.runs.length - 1];
  if (r && ta - r[1] <= DT * 1.5) r[1] = ta; else it.runs.push([ta, ta]);
  it.worst = Math.max(it.worst, worst);
};
const probe = await page.evaluate((ta) => { window.__texts = []; window.frame(ta); return window.__texts.length; }, timeline[3].segStart + 10);
if (!probe) throw new Error('a revisão não está vendo os textos');
console.log(`teste: ${probe} textos medidos num quadro da cena 4`);
const t0 = Date.now();
const BATCH = 60;
for (let f = 0; f < N; f += BATCH) {
  const frames = [];
  for (let k = f; k < Math.min(N, f + BATCH); k++) { const ta = k / FPS; if (ONLY && !timeline.some((sg, i) => ONLY.has(i + 1) && ta >= sg.segStart && ta < sg.segEnd)) continue; frames.push(ta); }
  if (!frames.length) continue;
  const res = await page.evaluate((list) => list.map((ta) => { window.__texts = []; window.frame(ta); return window.__texts; }), frames);
  res.forEach((texts, j) => {
    const ta = frames[j];
    let si = timeline.length - 1;
    for (let k = 0; k < timeline.length; k++) if (ta < timeline[k].segEnd) { si = k; break; }
    const seg = timeline[si], t = ta - seg.segStart;
    if (t < 0.6 || seg.segEnd - ta < 0.5) return; // transições
    const vis = texts.filter((x) => x.a > 0.5 && x.x1 - x.x0 > 4);
    for (const x of vis) {
      const cut = x.x0 < -2 || x.x1 > W + 2 || x.y0 < -2 || x.y1 > H + 2;
      const inside = x.x1 > 0 && x.x0 < W && x.y1 > 0 && x.y0 < H;
      if (cut && inside) add('CORTADO', si + 1, `"${x.s}"`, t, Math.max(-x.x0, x.x1 - W, -x.y0, x.y1 - H));
      if (inside && !cut && x.y1 > SUB && x.a > 0.6) add('LEGENDA', si + 1, `"${x.s}"`, t, x.y1);
    }
    for (let a = 0; a < vis.length; a++) for (let c = a + 1; c < vis.length; c++) {
      const A = vis[a], B = vis[c];
      if (A.rot || B.rot) continue;
      if (A.s === B.s) continue; // brilho do neon: o mesmo texto desenhado duas vezes
      const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
      if (ox <= 0 || oy <= 0) continue;
      const small = Math.min((A.x1 - A.x0) * (A.y1 - A.y0), (B.x1 - B.x0) * (B.y1 - B.y0));
      if ((ox * oy) / small > 0.12) add('SOBREPOSTO', si + 1, `"${A.s}" × "${B.s}"`, t);
    }
  });
}
await b.close();
const MIN_RUN = 0.4; // ignora problemas que duram menos que isso (ex.: câmera passando)
const list = [];
for (const i of issues.values()) {
  const runs = i.runs.filter(([a, b]) => b - a + DT >= MIN_RUN);
  if (runs.length) list.push({ ...i, runs, first: runs[0][0], dur: runs.reduce((s, [a, b]) => s + b - a + DT, 0) });
}
list.sort((a, b) => a.scene - b.scene || a.first - b.first);
const lines = list.map((i) => `cena ${String(i.scene).padStart(2, '0')}  ${i.runs.map(([a, b]) => `${a.toFixed(1)}–${b.toFixed(1)}`).slice(0, 4).join(', ')} s  ${i.kind.padEnd(10)} ${i.msg}  (${i.dur.toFixed(1)} s${i.kind === 'LEGENDA' ? `, até y=${Math.round(i.worst)}` : i.kind === 'CORTADO' ? `, ${Math.round(i.worst)} px pra fora` : ''})`);
const head = `${N} quadros conferidos (${FPS} por segundo, ${total.toFixed(1)} s) em ${((Date.now() - t0) / 1000).toFixed(0)} s. Problemas: ${list.length}`;
fs.mkdirSync(path.join(root, 'saida'), { recursive: true });
fs.writeFileSync(path.join(root, 'saida', ONLY ? 'qa-parcial.txt' : 'qa.txt'), head + '\n' + lines.join('\n') + '\n');
console.log(head);
console.log(lines.join('\n'));
