// Lê os quadros de um MP3 para colocá-lo dentro do MP4 sem recomprimir.
import fs from 'fs';

const BR = {
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], // MPEG-1 Layer III
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],     // MPEG-2/2.5 Layer III
};
const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

export function readMp3(file) {
  const buf = fs.readFileSync(file);
  let p = 0;
  if (buf.toString('latin1', 0, 3) === 'ID3') {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    p = 10 + size + ((buf[5] & 0x10) ? 10 : 0);
  }
  const frames = [];
  let sampleRate = 0, channels = 0, samplesPerFrame = 0, maxBitrate = 0;
  while (p + 4 <= buf.length) {
    const h = buf.readUInt32BE(p);
    if (((h & 0xffe00000) >>> 0) !== 0xffe00000) { p++; continue; }
    const ver = (h >> 19) & 3;        // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
    const layer = (h >> 17) & 3;      // 1 = Layer III
    const bi = (h >> 12) & 15, si = (h >> 10) & 3, pad = (h >> 9) & 1, mode = (h >> 6) & 3;
    if (ver === 1 || layer !== 1 || bi === 0 || bi === 15 || si === 3) { p++; continue; }
    const kbps = BR[ver === 3 ? 1 : 2][bi];
    const sr = SR[ver][si];
    const spf = ver === 3 ? 1152 : 576;
    const len = Math.floor(((spf / 8) * kbps * 1000) / sr) + pad;
    if (p + len > buf.length) break;
    // Confere se o próximo quadro também começa com sincronismo (evita falsos positivos).
    if (p + len + 2 <= buf.length && (buf.readUInt16BE(p + len) & 0xffe0) !== 0xffe0 && p + len !== buf.length) { p++; continue; }
    // O primeiro quadro pode ser só de informação (Xing/Info/VBRI). Os decodificadores pulam esse quadro.
    if (!frames.length) {
      const side = ver === 3 ? (mode === 3 ? 17 : 32) : (mode === 3 ? 9 : 17);
      const tag = buf.toString('latin1', p + 4 + side, p + 8 + side);
      const vbri = buf.toString('latin1', p + 36, p + 40);
      if (tag === 'Xing' || tag === 'Info' || vbri === 'VBRI') { p += len; continue; }
    }
    if (!sampleRate) { sampleRate = sr; channels = mode === 3 ? 1 : 2; samplesPerFrame = spf; }
    maxBitrate = Math.max(maxBitrate, kbps * 1000);
    frames.push({ off: p, size: len });
    p += len;
  }
  return { buf, frames, sampleRate, channels, samplesPerFrame, maxBitrate, seconds: (frames.length * samplesPerFrame) / sampleRate };
}
