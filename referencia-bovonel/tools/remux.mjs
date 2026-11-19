// Converte o MP4 fragmentado do MediaRecorder (moof/mdat) em MP4 "normal"
// (moov no início + um mdat), com duração correta e tabela de keyframes.
// Assim o arquivo abre bem no CapCut, Premiere, Windows e no YouTube.
// Suporta uma faixa de vídeo, que é o que o MediaRecorder gera aqui.
import fs from 'fs';
import { readMp3 } from './mp3.mjs';

function boxes(buf, start, end) {
  const out = [];
  let p = start;
  while (p + 8 <= end) {
    let size = buf.readUInt32BE(p);
    const type = buf.toString('latin1', p + 4, p + 8);
    let hdr = 8;
    if (size === 1) { size = Number(buf.readBigUInt64BE(p + 8)); hdr = 16; }
    if (size === 0) size = end - p;
    out.push({ type, start: p, body: p + hdr, end: p + size });
    p += size;
  }
  return out;
}
const child = (buf, b, type) => boxes(buf, b.body, b.end).find((x) => x.type === type);
const raw = (buf, b) => buf.subarray(b.start, b.end);

function box(type, ...parts) {
  const payload = Buffer.concat(parts.map((x) => (Buffer.isBuffer(x) ? x : Buffer.from(x))));
  const h = Buffer.alloc(8);
  h.writeUInt32BE(8 + payload.length, 0);
  h.write(type, 4, 'latin1');
  return Buffer.concat([h, payload]);
}
const u32 = (...v) => { const b = Buffer.alloc(4 * v.length); v.forEach((x, i) => b.writeUInt32BE(x >>> 0, i * 4)); return b; };
const u64 = (v) => { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(v)); return b; };
const full = (type, version, flags, ...parts) => box(type, u32(((version & 255) << 24) | (flags & 0xffffff)), ...parts);

function patchDuration(buf, b, dur, verOffDur0, verOffDur1) {
  // copia a caixa e troca o campo de duração (versão 0: 32 bits, versão 1: 64 bits)
  const out = Buffer.from(raw(buf, b));
  const hdr = b.body - b.start;
  const v = out[hdr];
  if (v === 1) out.writeBigUInt64BE(BigInt(dur), hdr + verOffDur1);
  else out.writeUInt32BE(dur >>> 0, hdr + verOffDur0);
  return out;
}

const u16 = (...v) => { const b = Buffer.alloc(2 * v.length); v.forEach((x, i) => b.writeUInt16BE(x & 0xffff, i * 2)); return b; };

// Faixa de vídeo a partir de quadros H.264 já codificados (WebCodecs): um quadro por vez, com tempo exato.
// raw = { data: Buffer com os quadros em sequência, samples: [{ size, key }], fps, width, height, avcC: Buffer, color: [prim, transf, matriz, faixaCheia] }
function rawVideoTrack(raw, id) {
  const { data, samples, fps, width, height, avcC, color = [6, 6, 6, false] } = raw;
  const timescale = fps * 1000, dur = 1000;
  const matrix = u32(0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000);
  const colr = box('colr', 'nclx', u16(color[0], color[1], color[2]), Buffer.from([color[3] ? 0x80 : 0]));
  const avc1 = box('avc1', Buffer.alloc(6), u16(1), Buffer.alloc(16), u16(width, height), u32(0x480000, 0x480000, 0), u16(1),
    Buffer.alloc(32), u16(0x18, 0xffff), box('avcC', avcC), colr, box('pasp', u32(1, 1)));
  const t = {
    id, timescale, isVideo: true, samples: [], chunks: [],
    bufs: {
      stsd: full('stsd', 0, 0, u32(1), avc1),
      mediaHeader: full('vmhd', 0, 1, Buffer.alloc(8)),
      dinf: box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))),
      hdlr: full('hdlr', 0, 0, u32(0), 'vide', u32(0, 0, 0), 'VideoHandler\0'),
    },
  };
  t.makeMdhd = (d) => full('mdhd', 0, 0, u32(0, 0, timescale, d), Buffer.from([0x55, 0xc4, 0, 0]));
  t.makeTkhd = (d) => full('tkhd', 0, 3, u32(0, 0, id, 0, d, 0, 0), u32(0, 0), matrix, u32(width * 65536, height * 65536));
  let off = 0;
  for (let i = 0; i < samples.length; i += fps) {
    const c = { id, samples: [], t: i / fps };
    for (const x of samples.slice(i, i + fps)) { c.samples.push({ src: data, off, size: x.size, dur, sync: !!x.key, cto: 0 }); off += x.size; }
    t.chunks.push(c); t.samples.push(...c.samples);
  }
  if (off !== data.length) throw new Error(`quadros (${off} bytes) não batem com os dados (${data.length} bytes)`);
  return t;
}

export function remux(input, output, opts = {}) {
  const tracks = {};
  const order = [];
  const chunkSeq = []; // ordem física: { id, samples }
  if (opts.raw) {
    const t = rawVideoTrack(opts.raw, 1);
    tracks[1] = t; order.push(1); chunkSeq.push(...t.chunks);
  } else {
  const buf = fs.readFileSync(input);
  const top = boxes(buf, 0, buf.length);
  const moov = top.find((b) => b.type === 'moov');
  if (!moov) throw new Error('moov não encontrado');
  const mvex = child(buf, moov, 'mvex');
  const trexById = {};
  for (const tx of boxes(buf, mvex.body, mvex.end).filter((b) => b.type === 'trex')) {
    trexById[buf.readUInt32BE(tx.body + 4)] = {
      dur: buf.readUInt32BE(tx.body + 12), size: buf.readUInt32BE(tx.body + 16), flags: buf.readUInt32BE(tx.body + 20),
    };
  }
  for (const trak of boxes(buf, moov.body, moov.end).filter((b) => b.type === 'trak')) {
    const tkhd = child(buf, trak, 'tkhd');
    const id = buf.readUInt32BE(tkhd.body + (buf[tkhd.body] === 1 ? 20 : 12));
    const mdia = child(buf, trak, 'mdia');
    const mdhd = child(buf, mdia, 'mdhd');
    const minf = child(buf, mdia, 'minf');
    const stbl = child(buf, minf, 'stbl');
    const mediaHeader = boxes(buf, minf.body, minf.end).find((x) => x.type === 'vmhd' || x.type === 'smhd');
    tracks[id] = {
      id, tkhd, mdhd, hdlr: child(buf, mdia, 'hdlr'), mediaHeader, dinf: child(buf, minf, 'dinf'),
      stsd: child(buf, stbl, 'stsd'), timescale: buf.readUInt32BE(mdhd.body + (buf[mdhd.body] === 1 ? 20 : 12)),
      isVideo: mediaHeader.type === 'vmhd', samples: [], chunks: [],
    };
    const t = tracks[id];
    t.bufs = { stsd: raw(buf, t.stsd), mediaHeader: raw(buf, t.mediaHeader), dinf: raw(buf, t.dinf), hdlr: raw(buf, t.hdlr) };
    t.makeMdhd = (d) => patchDuration(buf, t.mdhd, d, 16, 24);
    t.makeTkhd = (d) => patchDuration(buf, t.tkhd, d, 20, 28);
    order.push(id);
  }

  // Coleta amostras de todos os fragmentos; cada trun vira um "chunk".
  for (const moof of top.filter((b) => b.type === 'moof')) {
    for (const traf of boxes(buf, moof.body, moof.end).filter((b) => b.type === 'traf')) {
      const tfhd = child(buf, traf, 'tfhd');
      const tf = buf.readUInt32BE(tfhd.body) & 0xffffff;
      const id = buf.readUInt32BE(tfhd.body + 4);
      const tr = tracks[id]; const tx = trexById[id] || { dur: 0, size: 0, flags: 0 };
      let q = tfhd.body + 8;
      let base = moof.start;
      if (tf & 0x1) { base = Number(buf.readBigUInt64BE(q)); q += 8; }
      if (tf & 0x2) q += 4;
      let dDur = tx.dur, dSize = tx.size, dFlags = tx.flags;
      if (tf & 0x8) { dDur = buf.readUInt32BE(q); q += 4; }
      if (tf & 0x10) { dSize = buf.readUInt32BE(q); q += 4; }
      if (tf & 0x20) { dFlags = buf.readUInt32BE(q); q += 4; }
      for (const trun of boxes(buf, traf.body, traf.end).filter((b) => b.type === 'trun')) {
        const ver = buf[trun.body];
        const fl = buf.readUInt32BE(trun.body) & 0xffffff;
        const n = buf.readUInt32BE(trun.body + 4);
        let r = trun.body + 8;
        let dataOff = 0, firstFlags = null;
        if (fl & 0x1) { dataOff = buf.readInt32BE(r); r += 4; }
        if (fl & 0x4) { firstFlags = buf.readUInt32BE(r); r += 4; }
        let off = base + dataOff;
        const samples = [];
        for (let i = 0; i < n; i++) {
          let dur = dDur, size = dSize, flags = dFlags, cto = 0;
          if (fl & 0x100) { dur = buf.readUInt32BE(r); r += 4; }
          if (fl & 0x200) { size = buf.readUInt32BE(r); r += 4; }
          if (fl & 0x400) { flags = buf.readUInt32BE(r); r += 4; } else if (i === 0 && firstFlags !== null) flags = firstFlags;
          if (fl & 0x800) { cto = ver === 1 ? buf.readInt32BE(r) : buf.readUInt32BE(r); r += 4; }
          samples.push({ src: buf, off, size, dur, sync: !(flags & 0x10000), cto });
          off += size;
        }
        if (samples.length) { const c = { id, samples, t: 0 }; tr.chunks.push(c); tr.samples.push(...samples); chunkSeq.push(c); }
      }
    }
  }
  }

  // tempo de início de cada chunk (para intercalar áudio e vídeo no mdat)
  for (const id of order) {
    let acc = 0;
    for (const c of tracks[id].chunks) { c.t = acc / tracks[id].timescale; acc += c.samples.reduce((a2, x) => a2 + (x.dur || 0), 0); }
  }
  if (opts.mp3) {
    const m = readMp3(opts.mp3);
    if (opts.maxSeconds) m.frames = m.frames.slice(0, Math.ceil((opts.maxSeconds * m.sampleRate) / m.samplesPerFrame));
    const id = Math.max(...order) + 1;
    const descr = (tag, body) => Buffer.concat([Buffer.from([tag, body.length]), body]);
    const dcd = descr(0x04, Buffer.concat([Buffer.from([0x6b, 0x15, 0, 0, 0]), u32(m.maxBitrate, m.maxBitrate)]));
    const esd = descr(0x03, Buffer.concat([Buffer.from([0, 0, 0]), dcd, descr(0x06, Buffer.from([2]))]));
    const mp4a = box('mp4a', Buffer.alloc(6), Buffer.from([0, 1]), u32(0, 0),
      Buffer.from([0, m.channels, 0, 16, 0, 0, 0, 0]), u32(m.sampleRate * 65536), full('esds', 0, 0, esd));
    const t = {
      id, timescale: m.sampleRate, isVideo: false, samples: [], chunks: [],
      bufs: {
        stsd: full('stsd', 0, 0, u32(1), mp4a),
        mediaHeader: full('smhd', 0, 0, u32(0)),
        dinf: box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))),
        hdlr: full('hdlr', 0, 0, u32(0), 'soun', u32(0, 0, 0), 'SoundHandler\0'),
      },
    };
    const matrix = u32(0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000);
    t.makeMdhd = (d) => full('mdhd', 0, 0, u32(0, 0, m.sampleRate, d), Buffer.from([0x55, 0xc4, 0, 0]));
    t.makeTkhd = (d) => full('tkhd', 0, 3, u32(0, 0, id, 0, d, 0, 0), u32(0, 0x01000000), matrix, u32(0, 0));
    const perChunk = Math.round(m.sampleRate / m.samplesPerFrame); // ~1 s por chunk
    for (let i = 0; i < m.frames.length; i += perChunk) {
      const samples = m.frames.slice(i, i + perChunk).map((f) => ({ src: m.buf, off: f.off, size: f.size, dur: m.samplesPerFrame, sync: true, cto: 0 }));
      const c = { id, samples, t: (i * m.samplesPerFrame) / m.sampleRate };
      t.chunks.push(c); t.samples.push(...samples); chunkSeq.push(c);
    }
    tracks[id] = t;
    order.push(id);
    chunkSeq.sort((x, y) => x.t - y.t);
  }

  if (opts.pcm) {
    // PCM 16 bits little-endian ('sowt'), mono ou estéreo, em blocos de 1 s.
    const { data, sampleRate, channels = 1 } = opts.pcm;
    const id = Math.max(...order) + 1;
    const frameBytes = 2 * channels;
    const N = Math.floor(data.length / frameBytes);
    const matrix = u32(0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000);
    const sowt = box('sowt', Buffer.alloc(6), Buffer.from([0, 1]), Buffer.from([0, 0, 0, 0]), u32(0),
      Buffer.from([0, channels, 0, 16, 0, 0, 0, 0]), u32(sampleRate * 65536));
    const t = {
      id, timescale: sampleRate, isVideo: false, pcm: true, frameBytes, nSamples: N, samples: [], chunks: [],
      bufs: {
        stsd: full('stsd', 0, 0, u32(1), sowt),
        mediaHeader: full('smhd', 0, 0, u32(0)),
        dinf: box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))),
        hdlr: full('hdlr', 0, 0, u32(0), 'soun', u32(0, 0, 0), 'SoundHandler\0'),
      },
    };
    t.makeMdhd = (d) => full('mdhd', 0, 0, u32(0, 0, sampleRate, d), Buffer.from([0x55, 0xc4, 0, 0]));
    t.makeTkhd = (d) => full('tkhd', 0, 3, u32(0, 0, id, 0, d, 0, 0), u32(0, 0x01000000), matrix, u32(0, 0));
    for (let i = 0; i < N; i += sampleRate) {
      const count = Math.min(sampleRate, N - i);
      const c = { id, count, t: i / sampleRate, samples: [{ src: data, off: i * frameBytes, size: count * frameBytes, dur: count }] };
      t.chunks.push(c); chunkSeq.push(c);
    }
    tracks[id] = t;
    order.push(id);
    chunkSeq.sort((x, y) => x.t - y.t);
  }

  const tables = {};
  let movieMs = 0;
  for (const id of order) {
    const tr = tracks[id];
    if (tr.pcm) {
      tr.duration = tr.nSamples;
      tr.durMs = Math.round((tr.duration / tr.timescale) * 1000);
      movieMs = Math.max(movieMs, tr.durMs);
      const se = [];
      tr.chunks.forEach((c, i) => { const l = se[se.length - 1]; if (!l || l[1] !== c.count) se.push([i + 1, c.count, 1]); });
      tables[id] = {
        stts: full('stts', 0, 0, u32(1, tr.nSamples, 1)),
        stss: Buffer.alloc(0), ctts: Buffer.alloc(0),
        stsc: full('stsc', 0, 0, u32(se.length), ...se.map((e) => u32(...e))),
        stsz: full('stsz', 0, 0, u32(tr.frameBytes, tr.nSamples)),
      };
      continue;
    }
    const all = tr.samples;
    if (!all.length) continue;
    const durs = all.map((x) => x.dur).filter((d) => d > 0).sort((x, y) => x - y);
    const median = durs[Math.floor(durs.length / 2)] || 1;
    for (const x of all) if (!x.dur) x.dur = median;
    // a imagem gravada em tempo real costuma terminar 1 ou 2 quadros antes do som: o último quadro fica na tela até o fim do som,
    // para cada arquivo (ou parte) ter imagem e som com a mesma duração e as partes emendarem sem salto.
    if (tr.isVideo && opts.pcm) {
      const audioSec = opts.pcm.data.length / 2 / (opts.pcm.channels || 1) / opts.pcm.sampleRate;
      const target = Math.round(audioSec * tr.timescale), cur = all.reduce((acc, x) => acc + x.dur, 0);
      if (cur < target && target - cur < tr.timescale) all[all.length - 1].dur += target - cur;
    }
    tr.duration = all.reduce((acc, x) => acc + x.dur, 0);
    tr.durMs = Math.round((tr.duration / tr.timescale) * 1000);
    movieMs = Math.max(movieMs, tr.durMs);
    const runs = (vals) => { const o = []; for (const v of vals) { const l = o[o.length - 1]; if (l && l[1] === v) l[0]++; else o.push([1, v]); } return o; };
    const st = runs(all.map((x) => x.dur));
    const stts = full('stts', 0, 0, u32(st.length), ...st.map(([c, d]) => u32(c, d)));
    let stss = Buffer.alloc(0);
    if (tr.isVideo) {
      const idx = all.map((x, i) => (x.sync ? i + 1 : 0)).filter(Boolean);
      stss = full('stss', 0, 0, u32(idx.length), u32(...idx));
    }
    let ctts = Buffer.alloc(0);
    if (all.some((x) => x.cto !== 0)) {
      const cr = runs(all.map((x) => x.cto));
      const bb = Buffer.alloc(cr.length * 8);
      cr.forEach(([c, o], i) => { bb.writeUInt32BE(c, i * 8); bb.writeInt32BE(o, i * 8 + 4); });
      ctts = full('ctts', 1, 0, u32(cr.length), bb);
    }
    const se = [];
    tr.chunks.forEach((c, i) => { const l = se[se.length - 1]; if (!l || l[1] !== c.samples.length) se.push([i + 1, c.samples.length, 1]); });
    const stsc = full('stsc', 0, 0, u32(se.length), ...se.map((e) => u32(...e)));
    const stsz = full('stsz', 0, 0, u32(0, all.length), u32(...all.map((x) => x.size)));
    tables[id] = { stts, stss, ctts, stsc, stsz };
  }

  const mdatPayload = chunkSeq.reduce((acc, c) => acc + c.samples.reduce((a2, x) => a2 + x.size, 0), 0);
  const use64 = mdatPayload > 0xfffffff0;
  const build = (dataStart) => {
    let pos = dataStart;
    for (const c of chunkSeq) { c.newOff = pos; pos += c.samples.reduce((a2, x) => a2 + x.size, 0); }
    const traks = order.filter((id) => tables[id]).map((id) => {
      const tr = tracks[id]; const tb = tables[id];
      const offs = tr.chunks.map((c) => c.newOff);
      const co = use64 ? full('co64', 0, 0, u32(offs.length), ...offs.map(u64)) : full('stco', 0, 0, u32(offs.length), u32(...offs));
      const stbl = box('stbl', tr.bufs.stsd, tb.stts, tb.stss, tb.ctts, tb.stsc, tb.stsz, co);
      const minf = box('minf', tr.bufs.mediaHeader, tr.bufs.dinf, stbl);
      const mdhd = tr.makeMdhd(tr.duration);
      const mdia = box('mdia', mdhd, tr.bufs.hdlr, minf);
      const tkhd = tr.makeTkhd(tr.durMs);
      return box('trak', tkhd, mdia);
    });
    const matrix = u32(0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000);
    const mvhd = full('mvhd', 0, 0, u32(0, 0, 1000, movieMs), u32(0x10000), Buffer.from([1, 0, 0, 0]), u32(0, 0), matrix, u32(0, 0, 0, 0, 0, 0), u32(Math.max(...order) + 1));
    return box('moov', mvhd, ...traks);
  };
  const ftyp = opts.mov ? box('ftyp', 'qt  ', u32(0x200), 'qt  ') : box('ftyp', 'isom', u32(0x200), 'isom', 'iso2', 'avc1', 'mp41');
  const mdatHdr = use64 ? 16 : 8;
  let moovOut = build(0);
  moovOut = build(ftyp.length + moovOut.length + mdatHdr);

  const fd = fs.openSync(output, 'w');
  fs.writeSync(fd, ftyp);
  fs.writeSync(fd, moovOut);
  const h = Buffer.alloc(mdatHdr);
  if (use64) { h.writeUInt32BE(1, 0); h.write('mdat', 4, 'latin1'); h.writeBigUInt64BE(BigInt(16 + mdatPayload), 8); }
  else { h.writeUInt32BE(8 + mdatPayload, 0); h.write('mdat', 4, 'latin1'); }
  fs.writeSync(fd, h);
  for (const c of chunkSeq) for (const x of c.samples) fs.writeSync(fd, x.src, x.off, x.size);
  fs.closeSync(fd);
  return order.filter((id) => tables[id]).map((id) => ({ id, video: tracks[id].isVideo, samples: tracks[id].pcm ? tracks[id].nSamples : tracks[id].samples.length, seconds: tracks[id].duration / tracks[id].timescale }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(remux(process.argv[2], process.argv[3], { mp3: process.argv[4] }));
}
