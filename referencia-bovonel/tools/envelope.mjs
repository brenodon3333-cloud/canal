// Extrai o envelope de volume da narração (RMS em janelas de 5 ms) para o alinhador.
// Uso: node tools/envelope.mjs <pasta-do-video>
// Saída: <pasta>/audio/envelope.json  { step, duration, sampleRate, rms: [...] }
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright');

const root = path.resolve(process.argv[2]);
const file = path.join(root, 'audio', 'narracao.mp3');
const STEP = 0.005;
const b = await chromium.launch({
  executablePath: '/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome',
  args: ['--disable-crash-reporter', '--disable-crashpad-for-testing'],
});
const p = await b.newPage();
const res = await p.evaluate(async ([data, step]) => {
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const buf = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(bytes.buffer);
  const sr = buf.sampleRate, win = Math.round(sr * step);
  const chans = [...Array(buf.numberOfChannels).keys()].map((c) => buf.getChannelData(c));
  const rms = [];
  let peak = 0;
  for (let i = 0; i < buf.length; i += win) {
    let s = 0; const end = Math.min(buf.length, i + win);
    for (const ch of chans) for (let j = i; j < end; j++) { const v = ch[j]; s += v * v; if (Math.abs(v) > peak) peak = Math.abs(v); }
    rms.push(+Math.sqrt(s / ((end - i) * chans.length)).toFixed(5));
  }
  // passo real da janela (221 amostras a 44,1 kHz = 5,011 ms, não 5 ms): sem isso as palavras escorregam 0,23% para trás
  return { step: win / sr, duration: buf.duration, sampleRate: sr, peak, rms };
}, [fs.readFileSync(file).toString('base64'), STEP]);
await b.close();
fs.writeFileSync(path.join(root, 'audio', 'envelope.json'), JSON.stringify(res));
console.log(`envelope: ${res.rms.length} janelas, ${res.duration.toFixed(2)} s, pico ${(20 * Math.log10(res.peak)).toFixed(1)} dBFS`);
