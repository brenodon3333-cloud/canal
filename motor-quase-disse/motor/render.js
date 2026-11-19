// Renderiza um episódio: som + imagem -> mp4.
//   node motor/render.js <episodio> [--versao v1] [--quadros 3.2,10.5] [--escala 0.5] [--so-som]
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { montarTempo } = require('./tempo');
const som = require('./som');
const D = require('./desenho');

const RAIZ = path.join(__dirname, '..');
const FF = path.join(RAIZ, '.tools/bin/ffmpeg');
GlobalFonts.registerFromPath(path.join(RAIZ, 'assets/fontes/ArchivoBlack-Regular.ttf'), 'Archivo');
const FONTE_LEGENDA = '/usr/share/fonts/google-noto-vf/NotoSans[wght].ttf';
if (fs.existsSync(FONTE_LEGENDA)) GlobalFonts.registerFromPath(FONTE_LEGENDA, 'Legenda');

const args = process.argv.slice(2);
const ep = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const versao = opt('versao', 'v1');
const escala = parseFloat(opt('escala', '1'));
const quadros = opt('quadros', null);

const pastaEp = path.join(RAIZ, 'episodios', ep);
const E = require(path.join(pastaEp, 'episodio.js'));
const tempos = JSON.parse(fs.readFileSync(path.join(pastaEp, 'narracao/tempos.json'), 'utf8'));
const T = montarTempo(E.blocos, tempos);
const saidaDir = path.join(RAIZ, 'saida', ep);
fs.mkdirSync(saidaDir, { recursive: true });
const DUR = T.total;

// ---------------------------------------------------------------- legendas (só a narração)
// A fala de personagem já está escrita na cena; a legenda não a repete nem a antecipa.
// Cada legenda entra com a voz e sai 0,4 s depois dela (no mínimo 1,2 s na tela).
const textos = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(pastaEp, 'falas.json'), 'utf8')).map((f) => [f.id, f.texto]));
const LEG = (E.legendas || E.srt) ? Object.entries(T.falas).map(([id, f]) => ({ id, ini: f.ini - 0.05, fim: Math.max(f.fim + 0.4, f.ini + 1.2), txt: textos[id] })) : [];
function legenda(g, t) {
  if (!E.legendas) return; // E.srt sozinho: só o arquivo .srt, nada queimado na imagem
  const l = LEG.find((x) => t >= x.ini && t < x.fim);
  if (!l) return;
  const a = Math.min(1, (t - l.ini) / 0.08, (l.fim - t) / 0.12);
  g.save(); g.globalAlpha = a;
  g.font = '600 46px Legenda, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = g.measureText(l.txt).width, x = 960, y = 1000;
  g.fillStyle = 'rgba(12,10,20,0.72)';
  const r = 14, bx = x - w / 2 - 26, by = y - 36, bw = w + 52, bh = 72;
  g.beginPath(); g.moveTo(bx + r, by); g.arcTo(bx + bw, by, bx + bw, by + bh, r); g.arcTo(bx + bw, by + bh, bx, by + bh, r);
  g.arcTo(bx, by + bh, bx, by, r); g.arcTo(bx, by, bx + bw, by, r); g.fill();
  g.fillStyle = '#fbf8f1'; g.fillText(l.txt, x, y + 2);
  g.restore();
}
function srt() {
  const tc = (s) => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  return LEG.map((l, i) => `${i + 1}\n${tc(Math.max(0, l.ini))} --> ${tc(l.fim)}\n${l.txt}\n`).join('\n');
}

function lerVoz() {
  const wav = fs.readFileSync(path.join(pastaEp, 'narracao', tempos.arquivo));
  // procura o bloco "data" (PCM 16 bits mono 48 kHz, gerado por motor/voz.py)
  let p = 12;
  while (p < wav.length) {
    const id = wav.toString('ascii', p, p + 4), tam = wav.readUInt32LE(p + 4);
    if (id === 'data') {
      const x = new Float32Array(tam / 2);
      for (let i = 0; i < x.length; i++) x[i] = wav.readInt16LE(p + 8 + i * 2) / 32768;
      return x;
    }
    p += 8 + tam;
  }
  throw new Error('wav sem dados');
}

function renderSom() {
  const mesa = new som.Mesa(DUR + 0.3);
  E.som(mesa, T, som);
  // voz: cada fala recortada da gravação e posta no seu bloco
  const voz = som.comprimir(lerVoz(), -26, 2.5);
  for (const [id, f] of Object.entries(process.env.SEM_VOZ ? {} : T.falas)) { // SEM_VOZ=1: só para conferir a sincronia dos efeitos (os tempos não mudam)
    const a = Math.round(f.srcIni * som.SR), b = Math.round(f.srcFim * som.SR);
    const trecho = voz.slice(a, b);
    const bordas = Math.round(0.012 * som.SR); // evita estalo nas emendas
    for (let i = 0; i < bordas; i++) { trecho[i] *= i / bordas; trecho[trecho.length - 1 - i] *= i / bordas; }
    mesa.por(trecho, f.ini, { g: E.ganhoVoz ?? 0, pan: 0, nome: `voz ${id}`, origem: 'narrador (fora de quadro)', funcao: 'narração' });
  }
  mesa.sala(0.74, 0.4, 0.45);
  const bruto = path.join(saidaDir, '_mix.f32');
  const inter = Buffer.alloc(mesa.len * 8);
  for (let i = 0; i < mesa.len; i++) { inter.writeFloatLE(mesa.L[i], i * 8); inter.writeFloatLE(mesa.R[i], i * 8 + 4); }
  fs.writeFileSync(bruto, inter);
  // loudnorm em duas passadas: mede, depois aplica ganho linear (-14 LUFS, pico -1.5 dBTP)
  const ent = ['-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', bruto];
  // limitador antes da normalização: os picos curtos (mordida) não podem travar o ganho da mixagem
  // E.limite: teto do limitador; E.master: filtro antes dele (compressão). O ep01 usa o padrão (0,5, sem compressão).
  const LIM = (E.master ? E.master + ',' : '') + `alimiter=limit=${E.limite ?? 0.5}:attack=1:release=60:level=false`;
  const med = require('child_process').spawnSync(FF, ['-hide_banner', ...ent, '-af', LIM + ',loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']).stderr.toString();
  let j = null;
  try { j = JSON.parse(med.slice(med.lastIndexOf('{'), med.lastIndexOf('}') + 1)); } catch (e) { console.warn('loudnorm: medição falhou, usando passada única'); }
  const filtro = j
    ? `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`
    : 'loudnorm=I=-14:TP=-1.5:LRA=11';
  const wav = path.join(saidaDir, `${ep}_${versao}.wav`);
  execFileSync(FF, ['-y', '-v', 'error', ...ent, '-af', LIM + ',' + filtro + ',aresample=48000', '-c:a', 'pcm_s16le', wav]);
  fs.unlinkSync(bruto);
  // planilha de som
  const linhas = ['| instante | som | origem na cena | distância | duração | função |', '|---|---|---|---|---|---|'];
  for (const e of mesa.log.sort((a, b) => a.t - b.t)) {
    const d = e.dist < 0.15 ? 'colado' : e.dist < 0.45 ? 'perto' : e.dist < 0.75 ? 'médio' : 'longe';
    linhas.push(`| ${e.t.toFixed(2)} s | ${e.nome} | ${e.origem} | ${d} | ${e.dur.toFixed(2)} s | ${e.funcao} |`);
  }
  fs.writeFileSync(path.join(saidaDir, `planilha_som_${versao}.md`), linhas.join('\n') + '\n');
  fs.writeFileSync(path.join(saidaDir, `eventos_${versao}.json`), JSON.stringify(mesa.log.filter((e) => e.nome)));
  if (E.contatos) fs.writeFileSync(path.join(saidaDir, `contatos_${versao}.json`), JSON.stringify(E.contatos(T)));
  return { wav, med: j };
}

function quadro(g, t, W, H) {
  D.ferv.passo = Math.floor(t * 12);
  g.save();
  g.scale(W / 1920, H / 1080);
  E.desenhar(g, t, T, D);
  legenda(g, t);
  g.restore();
}

async function renderVideo(wav) {
  const W = Math.round(1920 * escala / 2) * 2, H = Math.round(1080 * escala / 2) * 2, FPS = E.FPS || 24;
  const c = createCanvas(W, H), g = c.getContext('2d');
  const mp4 = path.join(saidaDir, `${ep}_${versao}.mp4`);
  const ff = spawn(FF, ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-i', wav, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-tune', 'animation',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.ceil(DUR * FPS);
  for (let f = 0; f < total; f++) {
    quadro(g, f / FPS, W, H);
    const buf = Buffer.from(g.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 48 === 0) process.stdout.write(`\r  quadro ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  process.stdout.write('\n');
  return mp4;
}

(async () => {
  console.log(`episódio ${ep} · ${DUR.toFixed(2)} s · versão ${versao}`);
  if (quadros) {
    const W = Math.round(1920 * escala), H = Math.round(1080 * escala);
    const c = createCanvas(W, H), g = c.getContext('2d');
    for (const s of String(quadros).split(',')) {
      const t = parseFloat(s);
      quadro(g, t, W, H);
      const f = path.join(saidaDir, `quadro_${versao}_${t.toFixed(2)}.png`);
      fs.writeFileSync(f, c.toBuffer('image/png'));
      console.log(f);
    }
    return;
  }
  const { wav, med } = renderSom();
  if (med) console.log(`loudnorm (antes): ${med.input_i} LUFS, pico ${med.input_tp} dBTP, LRA ${med.input_lra}`);
  if (LEG.length) fs.writeFileSync(path.join(saidaDir, `${ep}_${versao}.srt`), srt());
  console.log('som:', wav);
  if (opt('so-som', false)) return;
  console.log('vídeo:', await renderVideo(wav));
  if (E.relatorio) { const r = E.relatorio(); fs.writeFileSync(path.join(saidaDir, `relatorio_${versao}.txt`), r + '\n'); console.log(r); }
})();
