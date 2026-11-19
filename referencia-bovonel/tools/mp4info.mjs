// Mostra a estrutura de caixas (boxes) de um MP4. Uso: node tools/mp4info.mjs arquivo.mp4
import fs from 'fs';
const buf = fs.readFileSync(process.argv[2]);
const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'mvex', 'moof', 'traf', 'edts', 'dinf']);
function walk(start, end, depth, counts) {
  let p = start;
  while (p + 8 <= end) {
    let size = buf.readUInt32BE(p);
    const type = buf.toString('latin1', p + 4, p + 8);
    let hdr = 8;
    if (size === 1) { size = Number(buf.readBigUInt64BE(p + 8)); hdr = 16; }
    if (size === 0) size = end - p;
    if (depth === 0 && (type === 'moof' || type === 'mdat')) {
      counts[type] = (counts[type] || 0) + 1;
      if (counts[type] > 2) { p += size; continue; }
    }
    let extra = '';
    if (type === 'mvhd' || type === 'mdhd') {
      const v = buf[p + hdr];
      const ts = v === 1 ? buf.readUInt32BE(p + hdr + 20) : buf.readUInt32BE(p + hdr + 12);
      const du = v === 1 ? Number(buf.readBigUInt64BE(p + hdr + 24)) : buf.readUInt32BE(p + hdr + 16);
      extra = ` timescale=${ts} duration=${du}`;
    }
    if (type === 'trun') {
      extra = ` flags=0x${buf.readUInt32BE(p + hdr).toString(16)} samples=${buf.readUInt32BE(p + hdr + 4)}`;
    }
    if (type === 'tfhd') extra = ` flags=0x${buf.readUInt32BE(p + hdr).toString(16)}`;
    if (type === 'stsd') extra = ` codec=${buf.toString('latin1', p + hdr + 12, p + hdr + 16)}`;
    console.log(`${'  '.repeat(depth)}${type} ${size}${extra}`);
    if (CONTAINERS.has(type)) walk(p + hdr, p + size, depth + 1, counts);
    p += size;
  }
}
const counts = {};
walk(0, buf.length, 0, counts);
console.log('total moof:', counts.moof, 'mdat:', counts.mdat);
