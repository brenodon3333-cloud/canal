// Varre quadro a quadro e mostra onde mão ou pé não alcançou (px). Uso: node motor/varrer.js <ep> <t0> <t1>
// O episódio precisa ter personagens.js com FALTA (ver ep01-elevador).
const path = require('path'); const RAIZ = path.join(__dirname, '..');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { montarTempo } = require('./tempo'); const D = require('./desenho');
GlobalFonts.registerFromPath(path.join(RAIZ, 'assets/fontes/ArchivoBlack-Regular.ttf'), 'Archivo');
const ep = process.argv[2], pasta = path.join(RAIZ, 'episodios', ep);
const E = require(path.join(pasta, 'episodio.js')); const P = require(path.join(pasta, 'personagens.js'));
const T = montarTempo(E.blocos, require(path.join(pasta, 'narracao/tempos.json')));
const [a, b] = process.argv.slice(3, 5).map(Number);
const c = createCanvas(192, 108), g = c.getContext('2d');
let run = null;
for (let f = Math.floor(a * 24); f <= b * 24; f++) {
  const t = f / 24; P.FALTA.max = 0; for (const k in P.FALTA.porGesto) delete P.FALTA.porGesto[k];
  g.save(); g.scale(0.1, 0.1); D.ferv.passo = Math.floor(t * 12); E.desenhar(g, t, T, D); g.restore();
  const v = P.FALTA.max, gs = Object.entries(P.FALTA.porGesto).filter(([, x]) => x > 0.05).map(([k, x]) => `${k}=${x.toFixed(1)}`).join(' ');
  if (v > 0.05) console.log(t.toFixed(3), v.toFixed(1), gs);
}
