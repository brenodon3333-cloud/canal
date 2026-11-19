// Mede, quadro a quadro, a altura desenhada de cada personagem e compara com a tabela de elenco.js.
// Cada personagem é desenhado de novo sozinho, com a pose e a escala daquele instante; a altura em px
// é dividida pela profundidade (d), e o resultado tem de ser ALTURA × REF (tolerância de 3%).
// Também confere a razão entre dois personagens no mesmo quadro.
//   node motor/alturas.js <ep> [t0 t1] [--passo 3]
// Sentado e com o quepe na mão ficam fora da comparação (a altura muda de propósito), mas são listados.
const path = require('path');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const { montarTempo } = require('./tempo'); const D = require('./desenho'); const EL = require('./elenco');
const RAIZ = path.join(__dirname, '..');
GlobalFonts.registerFromPath(path.join(RAIZ, 'assets/fontes/ArchivoBlack-Regular.ttf'), 'Archivo');
const args = process.argv.slice(2), ep = args[0], pasta = path.join(RAIZ, 'episodios', ep);
const E = require(path.join(pasta, 'episodio.js')), P = require(path.join(pasta, 'personagens.js'));
const T = montarTempo(E.blocos, require(path.join(pasta, 'narracao/tempos.json')));
const nums = args.slice(1).filter((x) => !x.startsWith('--') && !isNaN(+x)).map(Number);
const [a, b] = nums.length >= 2 ? nums : [0, T.total];
const pi = args.indexOf('--passo'), passo = pi >= 0 ? +args[pi + 1] : 3;
const tela = createCanvas(192, 108), gt = tela.getContext('2d');
const W = 1200, H = 1300, c = createCanvas(W, H), g = c.getContext('2d');
function alturaPx(vista, pose) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.translate(W / 2, H - 100); P[vista](g, 0, 0, pose);
  const d = g.getImageData(0, 0, W, H).data; let top = -1, bot = -1;
  for (let y = 0; y < H && top < 0; y++) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 40) { top = y; break; }
  for (let y = H - 1; y >= 0 && bot < 0; y--) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 40) { bot = y; break; }
  return bot - top;
}
EL.registro.ativo = true;
let pior = 0, n = 0, piorPar = 0; const fora = {};
for (let f = Math.floor(a * 24); f <= b * 24; f += passo) {
  const t = f / 24; D.ferv.passo = Math.floor(t * 12);
  gt.save(); gt.scale(0.1, 0.1); E.desenhar(gt, t, T, D); gt.restore();
  const q = EL.registro.quadro.slice(); const medidos = [];
  for (const it of q) {
    const px = alturaPx(it.vista, it.pose) * it.s, norm = px / it.d / EL.REF, alvo = EL.ALTURA[EL.nomeDe(it.vista)];
    if (!it.comparar) { fora[it.vista + (it.pose.sentado ? ' sentado' : ' quepe na mão')] = (fora[it.vista] || 0) + 1; continue; }
    const err = norm / alvo - 1; n++; pior = Math.max(pior, Math.abs(err));
    medidos.push({ ...it, norm });
    if (Math.abs(err) > 0.03) console.log(`${t.toFixed(2)} s  ${it.vista}: ${norm.toFixed(3)} (tabela ${alvo.toFixed(2)}, ${(err * 100).toFixed(1)}%)`);
  }
  for (let i = 0; i < medidos.length; i++) for (let j = i + 1; j < medidos.length; j++) {
    const A = medidos[i], B = medidos[j], ra = A.norm / B.norm, rt = EL.ALTURA[EL.nomeDe(A.vista)] / EL.ALTURA[EL.nomeDe(B.vista)];
    const e = Math.abs(ra / rt - 1); piorPar = Math.max(piorPar, e);
    if (e > 0.03) console.log(`${t.toFixed(2)} s  razão ${A.vista}/${B.vista} = ${ra.toFixed(3)} (tabela ${rt.toFixed(3)})`);
  }
}
console.log(`medidas: ${n} · maior desvio da tabela: ${(pior * 100).toFixed(1)}% · maior desvio de razão entre dois no mesmo quadro: ${(piorPar * 100).toFixed(1)}%`);
console.log('fora da comparação:', Object.keys(fora).join(', ') || 'nenhum');
