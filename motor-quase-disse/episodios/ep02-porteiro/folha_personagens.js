// Folha do elenco do ep02 na mesma linha de chão (d = 1) e altura medida de cada vista.
//   node episodios/ep02-porteiro/folha_personagens.js
const path = require('path'), fs = require('fs');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const RAIZ = path.join(__dirname, '../..');
GlobalFonts.registerFromPath(path.join(RAIZ, 'assets/fontes/ArchivoBlack-Regular.ttf'), 'Archivo');
const P = require('./personagens'), EL = require('../../motor/elenco');

function altura(fn, pose) {
  const c = createCanvas(900, 1000), g = c.getContext('2d');
  g.translate(450, 900); fn(g, 0, 0, pose);
  const d = g.getImageData(0, 0, 900, 1000).data; let top = 1e9, bot = -1;
  for (let y = 0; y < 1000; y++) for (let x = 0; x < 900; x++) if (d[(y * 900 + x) * 4 + 3] > 40) { if (y < top) top = y; bot = y; }
  return bot - top;
}
const vistas = [
  ['caioFrente', P.caioFrente, {}], ['caioCostas', P.caioCostas, {}],
  ['arlindoFrente', P.arlindoFrente, {}], ['arlindoCostas', P.arlindoCostas, {}],
  ['lurdesFrente', P.lurdesFrente, { sacola: true }], ['lurdesCostas', P.lurdesCostas, {}],
];
const c = createCanvas(1920, 1080), g = c.getContext('2d');
g.fillStyle = '#5a5870'; g.fillRect(0, 0, 1920, 1080);
g.strokeStyle = '#000'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 1000); g.lineTo(1920, 1000); g.stroke();
const linhas = [];
vistas.forEach(([nome, fn, pose], i) => {
  const nat = altura(fn, pose), s = EL.escala(nome, 1);
  g.save(); g.translate(170 + i * 300, 1000); g.scale(s, s); fn(g, 0, 0, pose); g.restore();
  linhas.push(`${nome}: nativo ${nat} px (tabela ${EL.NATIVO[nome]}), na tela ${(nat * s).toFixed(0)} px = ${((nat * s) / EL.REF).toFixed(3)} do Caio`);
});
// sentado e de quepe na mão, para conferir
g.save(); const s = EL.escala('arlindoFrente', 1); g.translate(1820, 1000); g.scale(s * 0.6, s * 0.6); P.arlindoFrente(g, 0, 0, { sentado: true, quepe: 'mao', maos: [{ x: -60, y: -200 }, null] }); g.restore();
fs.writeFileSync(path.join(RAIZ, 'saida/ep02-porteiro/folha_personagens.png'), c.toBuffer('image/png'));
console.log(linhas.join('\n'));
