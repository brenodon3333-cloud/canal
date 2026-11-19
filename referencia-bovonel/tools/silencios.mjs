// Decodifica a narração no navegador e encontra as pausas entre as cenas.
// Uso: node tools/silencios.mjs <arquivo de áudio> [pausaMinima=1.2] [limiar_dB=-40]
// Saída: lista de pausas e um JSON com os trechos de fala.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const [, , file, minGapArg = '1.2', dbArg = '-40'] = process.argv;
const b = await chromium.launch({
  executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome',
  args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'],
});
const p = await b.newPage();
const b64 = fs.readFileSync(file).toString('base64');
const res = await p.evaluate(async ([data, minGap, db]) => {
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const buf = await ctx.decodeAudioData(bytes.buffer);
  const ch = buf.getChannelData(0);
  const sr = buf.sampleRate;
  const win = Math.round(sr * 0.02); // janelas de 20 ms
  const thr = Math.pow(10, db / 20);
  const loud = [];
  for (let i = 0; i < ch.length; i += win) {
    let s = 0;
    const end = Math.min(ch.length, i + win);
    for (let j = i; j < end; j++) s += ch[j] * ch[j];
    loud.push(Math.sqrt(s / (end - i)) > thr);
  }
  const gaps = [];
  let runStart = -1;
  for (let k = 0; k <= loud.length; k++) {
    const quiet = k < loud.length && !loud[k];
    if (quiet && runStart < 0) runStart = k;
    if (!quiet && runStart >= 0) {
      const a = runStart * 0.02, z = k * 0.02;
      if (z - a >= minGap) gaps.push([a, z]);
      runStart = -1;
    }
  }
  return { duration: buf.duration, sampleRate: sr, channels: buf.numberOfChannels, gaps };
}, [b64, Number(minGapArg), Number(dbArg)]);
await b.close();

console.log(`duração: ${res.duration.toFixed(2)}s, ${res.sampleRate} Hz, ${res.channels} canal(is)`);
const inner = res.gaps.filter(([a, z]) => a > 0.05 && z < res.duration - 0.05);
console.log(`pausas internas >= ${minGapArg}s: ${inner.length}`);
inner.forEach(([a, z], i) => console.log(`  ${i + 1}: ${a.toFixed(2)} -> ${z.toFixed(2)} (${(z - a).toFixed(2)}s)`));
const lead = res.gaps.find(([a]) => a <= 0.05);
const tail = res.gaps.find(([, z]) => z >= res.duration - 0.05);
console.log('silêncio inicial:', lead ? lead[1].toFixed(2) : 0, ' final:', tail ? (res.duration - tail[0]).toFixed(2) : 0);
fs.writeFileSync(file + '.pausas.json', JSON.stringify({ ...res, inner, lead: lead || null, tail: tail || null }, null, 1));
