// Folha de contato: junta quadros num só PNG com o instante escrito.
//   node motor/folha.js saida.png colunas a.png b.png ...
const fs = require('fs');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
(async () => {
  const [out, colsS, ...arqs] = process.argv.slice(2);
  const cols = parseInt(colsS, 10);
  const imgs = await Promise.all(arqs.map((a) => loadImage(fs.readFileSync(a))));
  const w = 640, h = Math.round((w * imgs[0].height) / imgs[0].width), rows = Math.ceil(imgs.length / cols);
  const c = createCanvas(cols * w + (cols + 1) * 6, rows * h + (rows + 1) * 6), g = c.getContext('2d');
  g.fillStyle = '#888'; g.fillRect(0, 0, c.width, c.height);
  imgs.forEach((im, i) => {
    const x = 6 + (i % cols) * (w + 6), y = 6 + Math.floor(i / cols) * (h + 6);
    g.drawImage(im, x, y, w, h);
    const rot = arqs[i].match(/([\d.]+)\.png$/);
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, y, 110, 30);
    g.fillStyle = '#ff0'; g.font = '22px sans-serif'; g.fillText(rot ? rot[1] + ' s' : String(i), x + 6, y + 23);
  });
  fs.writeFileSync(out, c.toBuffer('image/png'));
})().catch((e) => { console.error(e); process.exit(1); });
