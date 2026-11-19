// Compara a qualidade de dois arquivos de vídeo: tira o mesmo quadro de cada um e monta lado a lado (com zoom).
// Uso: node tools/comparar.mjs a.mov b.mov saida.png seg1,seg2,... [x,y,w,h do zoom]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const [a, b, out, times = '5,10,15', crop = '560,300,640,360'] = process.argv.slice(2);
const T = times.split(',').map(Number), [cx, cy, cw, ch] = crop.split(',').map(Number);
const br = await chromium.launch({ executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome', args: ['--disable-crash-reporter', '--disable-crashpad-for-testing', '--allow-file-access-from-files'] });
const p = await br.newPage({ viewport: { width: cw * 2 + 30, height: (ch + 40) * T.length + 10 } });
p.on('pageerror', (e) => console.error('[página]', e.message));
const url = (f) => 'file://' + path.resolve(f);
await p.goto(url(path.dirname(out)) + '/');
const res = await p.evaluate(async ({ A, B, T, cx, cy, cw, ch }) => {
  const load = (src) => new Promise((ok, bad) => { const v = document.createElement('video'); v.muted = true; v.src = src; v.onloadeddata = () => ok(v); v.onerror = () => bad(new Error('não decodificou ' + src)); });
  const seek = (v, t) => new Promise((ok) => { v.onseeked = () => ok(); v.currentTime = t; });
  const va = await load(A), vb = await load(B);
  const c = document.createElement('canvas'); c.width = cw * 2 + 30; c.height = (ch + 40) * T.length + 10; document.body.appendChild(c); document.body.style.margin = '0';
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  const grab = document.createElement('canvas'); grab.width = 1920; grab.height = 1080; const gg = grab.getContext('2d', { willReadFrequently: true });
  const stats = [];
  for (let i = 0; i < T.length; i++) {
    const y = 10 + i * (ch + 40);
    const px = [];
    for (const [k, v] of [[0, va], [1, vb]]) {
      await seek(v, T[i]); gg.drawImage(v, 0, 0, 1920, 1080);
      px.push(gg.getImageData(0, 0, 1920, 1080).data);
      g.drawImage(grab, cx, cy, cw, ch, k * (cw + 30), y + 30, cw, ch);
      g.fillStyle = '#facc15'; g.font = '700 20px sans-serif'; g.fillText(`${k ? 'B' : 'A'}  ${T[i]} s`, k * (cw + 30) + 6, y + 20);
    }
    let se = 0; for (let j = 0; j < px[0].length; j += 4) for (let q = 0; q < 3; q++) { const d = px[0][j + q] - px[1][j + q]; se += d * d; }
    stats.push(10 * Math.log10((255 * 255) / (se / (px[0].length * 0.75))));
  }
  return { png: c.toDataURL('image/png'), stats, dur: [va.duration, vb.duration] };
}, { A: url(a), B: url(b), T, cx, cy, cw, ch });
fs.writeFileSync(out, Buffer.from(res.png.split(',')[1], 'base64'));
console.log('durações', res.dur.map((d) => d.toFixed(2)).join(' / '), '| diferença A x B (PSNR, dB):', res.stats.map((s) => s.toFixed(1)).join(' '));
await br.close();
