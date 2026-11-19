// Folhas de contato para revisão visual: um quadro a cada `passo` segundos do vídeo inteiro.
// Uso: node tools/folhas.mjs <pasta> [passo=0.5] [de=0] [ate=fim]
// Saída: <pasta>/saida/folhas/folha-XX.jpg (6 x 6 quadros, cada um com o tempo e a cena)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const [, , videoDir, stepArg = '0.5', fromArg, toArg] = process.argv;
const root = path.resolve(videoDir);
const animDir = path.join(root, 'animacao');
function bundle() {
  const strip = (src) => src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+/gm, '');
  const parts = ['lib.js', 'fx.js', 'audio.js', 'scenes.js'].map((f) => strip(fs.readFileSync(path.join(animDir, f), 'utf8')));
  const html = fs.readFileSync(path.join(animDir, 'index.html'), 'utf8');
  return html.replace(/<script type="module">([\s\S]*?)<\/script>/, (_, main) =>
    `<script>\n(() => {\n${parts.join('\n')}\n${strip(main)}\n})();\n</script>`);
}
const timeline = JSON.parse(fs.readFileSync(path.join(root, 'audio', 'timeline.json'), 'utf8')).timeline;
const total = timeline[timeline.length - 1].segEnd;
const step = Number(stepArg), from = fromArg ? Number(fromArg) : 0, to = toArg ? Number(toArg) : total;
const outDir = path.join(root, 'saida', 'folhas');
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) if (fromArg == null) fs.unlinkSync(path.join(outDir, f));

const b = await chromium.launch({ executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome', args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'] });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await page.setContent(bundle());
await page.waitForFunction(() => window.ready === true);
await page.evaluate(() => document.fonts.ready);
await page.evaluate((tl) => window.setup(tl), timeline);
await page.evaluate(() => {
  const s = document.createElement('canvas'); s.width = 1920; s.height = 1110; window.__sheet = s;
});
const PER = 36, CW = 320, CH = 180;
const times = [];
for (let t = from; t < to; t += step) times.push(+t.toFixed(3));
let n = 0;
for (let i = 0; i < times.length; i += PER) {
  const chunk = times.slice(i, i + PER);
  const url = await page.evaluate(([list, tl, CW, CH]) => {
    const sh = window.__sheet, g = sh.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, sh.width, sh.height);
    const src = document.getElementById('c');
    list.forEach((ta, k) => {
      window.frame(ta);
      const x = (k % 6) * CW, y = Math.floor(k / 6) * (CH + 5);
      g.drawImage(src, x, y, CW, CH);
      let si = tl.length - 1;
      for (let j = 0; j < tl.length; j++) if (ta < tl[j].segEnd) { si = j; break; }
      g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(x, y, 118, 22);
      g.fillStyle = '#facc15'; g.font = '700 15px "Noto Sans"';
      g.fillText(`${ta.toFixed(1)}s · c${si + 1} ${(ta - tl[si].segStart).toFixed(1)}`, x + 4, y + 16);
      // linha da faixa das legendas
      g.fillStyle = 'rgba(255,0,0,0.5)'; g.fillRect(x, y + CH * 890 / 1080, CW, 1);
    });
    return sh.toDataURL('image/jpeg', 0.82);
  }, [chunk, timeline, CW, CH]);
  n++;
  const file = path.join(outDir, `folha-${String(Math.round(chunk[0] * 10)).padStart(5, '0')}.jpg`);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
console.log(`${times.length} quadros em ${n} folhas: ${outDir}`);
