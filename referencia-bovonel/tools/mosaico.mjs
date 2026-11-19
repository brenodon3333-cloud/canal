// Junta várias prévias PNG numa grade 2 x N (cada quadro em 960 x 540) para revisar de uma vez.
// Uso: node tools/mosaico.mjs saida.jpg a.png b.png c.png d.png
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const [, , out, ...files] = process.argv;
const cols = 2, w = 960, h = 540, rows = Math.ceil(files.length / cols);
const imgs = files.map((f) => ({ name: path.basename(f, '.png'), data: 'data:image/png;base64,' + fs.readFileSync(f).toString('base64') }));
const b = await chromium.launch({ executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome', args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'] });
const page = await b.newPage();
const jpg = await page.evaluate(async ({ imgs, cols, w, h, rows }) => {
  const c = document.createElement('canvas'); c.width = cols * w + (cols - 1) * 8; c.height = rows * h + (rows - 1) * 8;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < imgs.length; i++) {
    const im = new Image(); im.src = imgs[i].data; await im.decode();
    const x = (i % cols) * (w + 8), y = Math.floor(i / cols) * (h + 8);
    ctx.drawImage(im, x, y, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x, y, 230, 34); ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(imgs[i].name, x + 8, y + 25);
  }
  return c.toDataURL('image/jpeg', 0.85);
}, { imgs, cols, w, h, rows });
fs.writeFileSync(out, Buffer.from(jpg.split(',')[1], 'base64'));
await b.close();
console.log(out);
