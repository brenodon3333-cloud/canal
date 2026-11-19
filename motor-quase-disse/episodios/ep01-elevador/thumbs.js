// Thumbnails do episódio 1 (1280x720). Cada uma parte de um quadro do próprio episódio, desenhado de novo em
// alta resolução e recortado, e recebe por cima só o que a cena pede (notas, a frase) e no máximo 3 palavras.
//   node episodios/ep01-elevador/thumbs.js [versao]   -> saida/ep01-elevador/thumb_<versao>_<nome>.png e .jpg
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const RAIZ = path.join(__dirname, '../..');
const { montarTempo } = require(path.join(RAIZ, 'motor/tempo'));
const D = require(path.join(RAIZ, 'motor/desenho'));
GlobalFonts.registerFromPath(path.join(RAIZ, 'assets/fontes/ArchivoBlack-Regular.ttf'), 'Archivo');
const E = require('./episodio');
const T = montarTempo(E.blocos, require('./narracao/tempos.json'));
const { TINTA } = D;
const W = 1280, H = 720;
const versao = process.argv[2] || 't1';
const saida = path.join(RAIZ, 'saida/ep01-elevador');

// quadro do episódio no instante t, recortado em (x, y, largura) do quadro de 1920x1080
function cena(t, x, y, w) {
  const c = createCanvas(W, H), g = c.getContext('2d');
  const s = W / w;
  D.ferv.passo = Math.floor(t * 12);
  g.save(); g.scale(s, s); g.translate(-x, -y); E.desenhar(g, t, T, D); g.restore();
  return c;
}
// mais contraste e cor do que no vídeo: a thumbnail é vista pequena, ao lado de outras
function base(g, c, filtro = 'contrast(1.12) saturate(1.25) brightness(1.04)') {
  g.save(); g.filter = filtro; g.drawImage(c, 0, 0); g.restore();
}
function vinheta(g, a = 0.55) {
  const gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.72);
  gr.addColorStop(0, 'rgba(8,6,16,0)'); gr.addColorStop(1, `rgba(8,6,16,${a})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
// texto da thumbnail: letra grossa âmbar (a mesma cor do número do painel) com contorno de tinta
function texto(g, txt, x, y, tam, { cor = '#ffb347', alinh = 'left', r = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(r);
  g.font = `${tam}px Archivo`; g.textAlign = alinh; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(8,6,16,0.55)'; g.fillText(txt, tam * 0.05, tam * 0.07); // sombra curta
  g.lineWidth = tam * 0.2; g.strokeStyle = TINTA; g.strokeText(txt, 0, 0);
  g.fillStyle = cor; g.fillText(txt, 0, 0);
  g.restore();
}
// a fala escrita como no episódio: peça de madeira clara com contorno de tinta, pendurada por um fio
function frase(g, txt, x, y, tam, r = 0) {
  g.save(); g.translate(x, y); g.rotate(r);
  g.font = `${tam}px Archivo`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = tam * 0.16; g.strokeStyle = TINTA; g.strokeText(txt, 0, 0);
  g.fillStyle = '#fbf8f1'; g.fillText(txt, 0, 0);
  g.restore();
}
// colcheia desenhada à mão
function nota(g, x, y, s, r, cor = '#ffcf6b', alfa = 1) {
  g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); g.globalAlpha = alfa;
  g.lineJoin = 'round'; g.lineCap = 'round';
  const p = new (require('@napi-rs/canvas').Path2D)();
  p.ellipse(0, 0, 15, 11, -0.4, 0, Math.PI * 2);
  g.fillStyle = cor; g.strokeStyle = TINTA; g.lineWidth = 5;
  g.stroke(p); g.fill(p);
  g.beginPath(); g.moveTo(13, -4); g.lineTo(13, -62); g.quadraticCurveTo(30, -48, 34, -30);
  g.lineWidth = 11; g.strokeStyle = TINTA; g.stroke();
  g.lineWidth = 5; g.strokeStyle = cor; g.stroke();
  g.restore();
}
function rachadura(g, pts) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = TINTA; g.lineWidth = 4;
  g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke(); g.restore();
}
function brilho(g, x, y, r, cor, a) {
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = a;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}

const thumbs = {
  // 1 · o "Bom dia." pendurado entre os dois, no elevador escuro
  'sem-resposta': (g) => {
    const x0 = 600, y0 = 250, w0 = 1120, k = W / w0, X = (x) => (x - x0) * k, Y = (y) => (y - y0) * k;
    base(g, cena(21.5, x0, y0, w0));
    g.fillStyle = 'rgba(10,8,22,0.42)'; g.fillRect(0, 0, W, H); // a luz de emergência do elevador parado
    brilho(g, X(960), Y(60), 700, '#ffd9a0', 0.18);
    vinheta(g, 0.6);
    frase(g, 'Bom dia.', X(1140), Y(440), 132, -0.06);
    texto(g, 'SEM RESPOSTA', W / 2, H - 46, 118, { alinh: 'center' });
  },
  // 2 · ela no sofá batendo a vassoura no teto, e a música saindo pelas rachaduras
  'toda-noite': (g) => {
    const x0 = 300, y0 = 112, w0 = 1060, k = W / w0, X = (x) => (x - x0) * k, Y = (y) => (y - y0) * k;
    base(g, cena(2.32, x0, y0, w0));
    vinheta(g, 0.5);
    const tx = X(1078), ty = Y(172); // onde o cabo toca o teto
    rachadura(g, [[tx - 70, ty + 2], [tx - 40, ty + 10], [tx - 22, ty + 4], [tx, ty + 14]]);
    rachadura(g, [[tx + 6, ty + 10], [tx + 40, ty + 6], [tx + 62, ty + 18], [tx + 110, ty + 12]]);
    rachadura(g, [[tx + 240, ty + 4], [tx + 270, ty + 16], [tx + 300, ty + 8]]);
    brilho(g, tx, ty + 60, 320, '#ffb347', 0.22);
    nota(g, tx + 110, ty + 100, 1.25, 0.25);
    nota(g, tx + 215, ty + 215, 1.35, 0.15);
    nota(g, tx - 190, ty + 90, 1.0, -0.2, '#ffcf6b', 0.95);
    nota(g, tx - 330, ty + 170, 0.85, -0.3, '#ffcf6b', 0.85);
    texto(g, 'TODA', 46, 590, 124);
    texto(g, 'NOITE', 46, 702, 124);
  },
  // 3 · o fone no pescoço dele vazando a música, e ela desfocada atrás
  'era-ele': (g) => {
    const x0 = 280, y0 = 140, w0 = 1640, k = W / w0, X = (x) => (x - x0) * k, Y = (y) => (y - y0) * k;
    base(g, cena(57.0, x0, y0, w0));
    vinheta(g, 0.45);
    const fx = X(1010), fy = Y(800); // concha direita do fone
    brilho(g, fx, fy, 200, '#ffcf6b', 0.18);
    nota(g, fx + 70, fy - 80, 1.05, 0.2, '#ffcf6b', 1);
    nota(g, fx + 190, fy - 170, 0.9, -0.15, '#ffcf6b', 0.9);
    nota(g, fx + 320, fy - 240, 0.75, 0.25, '#ffcf6b', 0.8);
    texto(g, 'ERA ELE?', W - 40, H - 50, 140, { alinh: 'right' });
  },
};

const FF = path.join(RAIZ, '.tools/bin/ffmpeg');
for (const [nome, fn] of Object.entries(thumbs)) {
  const c = createCanvas(W, H), g = c.getContext('2d');
  fn(g);
  const png = path.join(saida, `thumb_${versao}_${nome}.png`), jpg = png.replace(/\.png$/, '.jpg');
  fs.writeFileSync(png, c.toBuffer('image/png'));
  execFileSync(FF, ['-v', 'error', '-y', '-i', png, '-q:v', '2', jpg]);
  console.log(jpg, (fs.statSync(jpg).size / 1024).toFixed(0) + ' KB');
}
