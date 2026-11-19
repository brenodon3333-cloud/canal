// Gera as thumbnails de um vídeo a partir de <pasta>/animacao/thumbs.js, usando os mesmos desenhos do vídeo.
// Uso: node tools/thumbs.mjs <pasta> [A,B,C]   -> <pasta>/saida/thumb-*.jpg (1920x1080) e saida/preview/thumbs-tamanho-real.jpg
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const [, , videoDir, only] = process.argv;
const root = path.resolve(videoDir), anim = path.join(root, 'animacao'), out = path.join(root, 'saida');
const strip = (s) => s.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+/gm, '');
const code = ['lib.js', 'fx.js', 'scenes.js', 'thumbs.js'].map((f) => strip(fs.readFileSync(path.join(anim, f), 'utf8'))).join('\n');
const html = `<html><body style="margin:0;background:#000"><canvas id="c" width="1920" height="1080"></canvas><script>
(() => { ${code}
window.render = (k) => { const c = document.getElementById('c'), ctx = c.getContext('2d'); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,1920,1080); THUMBS[k].draw(ctx, 1920, 1080); return { file: THUMBS[k].file, data: c.toDataURL('image/jpeg', 0.92) }; };
window.keys = Object.keys(THUMBS); window.ready = true; })();
</script></body></html>`;
const b = await chromium.launch({ executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome', args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.error('[página]', e.message));
await p.setContent(html);
await p.waitForFunction(() => window.ready === true);
await p.evaluate(() => document.fonts.ready);
const keys = only ? only.split(',') : await p.evaluate(() => window.keys);
const shots = [];
for (const k of keys) {
  const r = await p.evaluate((x) => window.render(x), k);
  fs.writeFileSync(path.join(out, r.file), Buffer.from(r.data.split(',')[1], 'base64'));
  shots.push(r.data);
  console.log(path.join(out, r.file));
}
// prévia: cada thumb no tamanho em que aparece na lista do YouTube (360 px) e no celular (168 px)
const p2 = await b.newPage({ viewport: { width: 1200, height: 700 } });
await p2.setContent(`<style>body{margin:0;background:#0f0f0f;font:600 15px sans-serif;color:#aaa;padding:16px}img{border-radius:10px;display:block;margin-bottom:6px}.r{display:flex;gap:18px;align-items:flex-end;margin-bottom:18px}</style>
${shots.map((s, i) => `<div class="r"><div><img src="${s}" width="360" height="202">${keys[i]}: 360 px</div><div><img src="${s}" width="168" height="94">168 px</div></div>`).join('')}`);
await p2.screenshot({ path: path.join(out, 'preview', 'thumbs-tamanho-real.jpg'), fullPage: true, type: 'jpeg', quality: 90 });
await b.close();
