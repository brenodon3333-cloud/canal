// Recortes de quadros (sem passar pelo vídeo) para revisar contatos de perto e relatório de alcance.
//   node motor/recorte.js <episodio> <saida.png> x y w h t1,t2,... [--varrer]
const fs = require('fs'), path = require('path');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const RAIZ = path.join(__dirname, '..');
GlobalFonts.registerFromPath(path.join(RAIZ, 'assets/fontes/ArchivoBlack-Regular.ttf'), 'Archivo');
const { montarTempo } = require('./tempo'); const D = require('./desenho');
const [ep, out, x, y, w, h, ts] = process.argv.slice(2);
const E = require(path.join(RAIZ, 'episodios', ep, 'episodio.js'));
const T = montarTempo(E.blocos, require(path.join(RAIZ, 'episodios', ep, 'narracao/tempos.json')));
const c = createCanvas(1920, 1080), g = c.getContext('2d');
const desenha = (t) => { D.ferv.passo = Math.floor(t * 12); g.save(); E.desenhar(g, t, T, D); g.restore(); };
if (process.argv.includes('--varrer')) { for (let t = 0; t < T.total; t += 1 / 24) desenha(t); if (E.relatorio) console.log(E.relatorio().split('\n\n')[0]); }
const lista = ts.split(',').map(Number), cw = 800, ch = Math.round((cw * +h) / +w);
const o = createCanvas(cw * 2, ch * Math.ceil(lista.length / 2)), go = o.getContext('2d');
lista.forEach((t, i) => { desenha(t); go.drawImage(c, +x, +y, +w, +h, (i % 2) * cw, Math.floor(i / 2) * ch, cw, ch); go.fillStyle = '#ff0'; go.font = '26px sans-serif'; go.fillText(t.toFixed(2) + ' s', (i % 2) * cw + 10, Math.floor(i / 2) * ch + 30); });
fs.writeFileSync(out, o.toBuffer('image/png'));
