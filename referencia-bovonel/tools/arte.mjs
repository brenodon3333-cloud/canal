// Gera as artes do canal (logo, banner, marca d'água, thumbnails antigas) a partir de canal/arte/assets.js e canal/arte/marca.js.
// Uso: node tools/arte.mjs [logoC,banner2,marca2,...]   (sem argumento gera todas)
// Identidade atual (v2, 15/11/2026): logoC -> canal/logo.png, banner2 -> canal/banner.png, marca2 -> canal/marca-dagua.png.
// Qualidade: cada arte pode ter `out` (tamanho final = w*out) e `ss` (desenha ss vezes maior e reduz em etapas, para bordas lisas),
// e `grain` (granulação de ±grain níveis, evita faixas nos degradês escuros). Sombras são escaladas junto.
// Prévia de conferência: canal/previa/conferencia-v2.png (logo em 98/40/24 px, banner com as áreas de celular e computador).
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const strip = (s) => s.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+/gm, '');
const lib = strip(fs.readFileSync('video-01-gasolina/animacao/lib.js', 'utf8'));
const assets = strip(fs.readFileSync('canal/arte/assets.js', 'utf8')) + '\n' + strip(fs.readFileSync('canal/arte/marca.js', 'utf8'));
const html = `<html><body style="margin:0;background:#000"><canvas id="c"></canvas><script>
(() => { ${lib}\n${assets}
// Faz shadowBlur/shadowOffset seguirem a escala (o canvas não escala sombras sozinho).
function scaleShadows(ctx, k) {
  const P = CanvasRenderingContext2D.prototype;
  for (const prop of ['shadowBlur', 'shadowOffsetX', 'shadowOffsetY']) {
    const d = Object.getOwnPropertyDescriptor(P, prop);
    Object.defineProperty(ctx, prop, { configurable: true, get() { return d.get.call(this) / k; }, set(v) { d.set.call(this, v * k); } });
  }
}
window.render = (name) => {
  const a = ASSETS[name], out = a.out || 1, ss = a.ss || 1;
  const big = document.createElement('canvas'); big.width = a.w * out * ss; big.height = a.h * out * ss;
  const bctx = big.getContext('2d'); scaleShadows(bctx, out * ss); bctx.scale(out * ss, out * ss);
  a.draw(bctx, a.w, a.h);
  // reduz em etapas de no máximo 2x (cada etapa com suavização alta)
  let src = big;
  while (src.width > a.w * out) {
    const nw = Math.max(a.w * out, Math.round(src.width / 2)), nh = Math.round(nw * a.h / a.w);
    const c2 = document.createElement('canvas'); c2.width = nw; c2.height = nh;
    const x = c2.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, nw, nh);
    src = c2;
  }
  if (a.grain) {
    const x = src.getContext('2d'), im = x.getImageData(0, 0, src.width, src.height), d = im.data;
    let s = 12345; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const n = (r() + r() - 1) * a.grain; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    x.putImageData(im, 0, 0);
  }
  const jpg = a.file.endsWith('.jpg');
  return { file: a.file, w: src.width, h: src.height, data: src.toDataURL(jpg ? 'image/jpeg' : 'image/png', 0.95) };
};
window.names = Object.keys(ASSETS);
window.ready = true; })();
</script></body></html>`;

const b = await chromium.launch({ executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome', args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'] });
const p = await b.newPage();
p.on('pageerror', (e) => console.error('[página]', e.message));
await p.setContent(html);
await p.waitForFunction(() => window.ready);
await p.evaluate(() => document.fonts.ready);
const names = process.argv[2] ? process.argv[2].split(',') : await p.evaluate(() => window.names);
const out = {};
for (const n of names) {
  const r = await p.evaluate((n) => window.render(n), n);
  const buf = Buffer.from(r.data.split(',')[1], 'base64');
  fs.mkdirSync(path.dirname(r.file), { recursive: true });
  fs.writeFileSync(r.file, buf);
  out[n] = r.data;
  console.log(`${r.file}: ${r.w}x${r.h}, ${(buf.length / 1024 / 1024).toFixed(2)} MB`);
}

// prévia da identidade v2
if (out.logoC && out.banner2) {
  const L = (s) => `<img src="${out.logoC}" style="width:${s}px;height:${s}px;border-radius:50%;display:block">`;
  const W = 1500, k = W / 2560;
  const pg = await b.newPage({ viewport: { width: 1560, height: 900 } });
  await pg.setContent(`<body style="margin:0;background:#0f0f0f;font-family:'Noto Sans';color:#ddd;padding:30px">
    <div style="font-size:30px;font-weight:900;color:#fff;margin-bottom:18px">Logo (opção C)</div>
    <div style="display:flex;gap:40px;align-items:center;margin-bottom:12px">${L(400)}${L(160)}${L(98)}${L(40)}${L(24)}
      ${out.marca2 ? `<div style="width:220px;height:124px;background:linear-gradient(135deg,#334155,#e2e8f0);border-radius:8px;position:relative">
        <img src="${out.marca2}" style="width:60px;position:absolute;right:8px;bottom:8px"></div>` : ''}</div>
    <div style="font-size:18px;margin-bottom:40px">400 · 160 (página do canal) · 98 · 40 (comentários) · 24 px (menu) · marca d'água num vídeo claro</div>
    <div style="font-size:30px;font-weight:900;color:#fff;margin-bottom:12px">Banner inteiro (TV)</div>
    <div style="position:relative;width:${W}px"><img src="${out.banner2}" style="width:${W}px;display:block">
      <div style="position:absolute;left:0;top:${(1440 - 423) / 2 * k}px;width:${W - 6}px;height:${423 * k}px;border:3px dashed #38bdf8"></div>
      <div style="position:absolute;left:${(2560 - 1546) / 2 * k}px;top:${(1440 - 423) / 2 * k}px;width:${1546 * k}px;height:${423 * k}px;border:3px dashed #22c55e"></div></div>
    <div style="margin:8px 0 40px;font-size:18px">azul = o que aparece no computador · verde = o que aparece no celular</div>
    <div style="font-size:30px;font-weight:900;color:#fff;margin-bottom:12px">Como fica no computador</div>
    <div style="width:${W}px;height:${W * 423 / 2560}px;background:url(${out.banner2}) center/${W}px auto no-repeat;border-radius:16px"></div>
    <div style="display:flex;gap:24px;align-items:center;margin:22px 0 40px">${L(160)}<div><div style="font-size:40px;font-weight:800;color:#fff">Bovonel</div>
      <div style="font-size:18px;color:#aaa">Por que as coisas custam o que custam no Brasil? ...</div></div></div>
    <div style="font-size:30px;font-weight:900;color:#fff;margin-bottom:12px">Como fica no celular</div>
    <div style="width:420px;background:#0f0f0f;border:2px solid #333;border-radius:24px;padding:14px">
      <div style="width:420px;height:${420 * 423 / 1546}px;background:url(${out.banner2}) center/${420 * 2560 / 1546}px auto no-repeat;border-radius:12px"></div>
      <div style="display:flex;gap:14px;align-items:center;margin-top:14px">${L(72)}<div style="font-size:24px;font-weight:800;color:#fff">Bovonel</div></div></div>
  </body>`);
  await pg.waitForTimeout(300);
  fs.mkdirSync('canal/previa', { recursive: true });
  await pg.screenshot({ path: 'canal/previa/conferencia-v2.png', fullPage: true });
}
await b.close();
