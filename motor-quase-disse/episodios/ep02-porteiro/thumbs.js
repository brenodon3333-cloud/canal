// Thumbnails do episódio 2. Regras (pedido do dono, 19/11/2026): sai do episódio, mas é feita para ser thumbnail:
// rosto grande com a expressão no auge, luz quente recortando contra um fundo escuro, um objeto de curiosidade,
// até 3 palavras sem cobrir rosto nem mão. Renderizada em 2560x1440 e reduzida para 1280x720.
//   node episodios/ep02-porteiro/thumbs.js [versao]
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const RAIZ = path.join(__dirname, '../..');
const { montarTempo } = require(path.join(RAIZ, 'motor/tempo'));
const D = require(path.join(RAIZ, 'motor/desenho'));
GlobalFonts.registerFromPath(path.join(RAIZ, 'assets/fontes/ArchivoBlack-Regular.ttf'), 'Archivo');
const E = require('./episodio');
const T = montarTempo(E.blocos, require('./narracao/tempos.json'));
const { TINTA } = D;
const W = 2560, H = 1440, versao = process.argv[2] || 't1', saida = path.join(RAIZ, 'saida/ep02-porteiro');
const FF = path.join(RAIZ, '.tools/bin/ffmpeg');
const B = (id) => T.B(id).ini;

function cena(t, x, y, w) { // quadro do episódio no instante t, recorte (x, y, largura) em coordenadas de 1920x1080
  const c = createCanvas(W, H), g = c.getContext('2d'), s = W / w;
  D.ferv.passo = Math.floor(t * 12);
  g.fillStyle = '#0c0a14'; g.fillRect(0, 0, W, H);
  g.save(); g.scale(s, s); g.translate(-x, -y); E.desenhar(g, t, T, D); g.restore();
  return c;
}
function base(g, c, f = 'contrast(1.15) saturate(1.3) brightness(1.02)') { g.save(); g.filter = f; g.drawImage(c, 0, 0); g.restore(); }
// escurece tudo menos um foco (elipse), para o personagem saltar do fundo
function foco(g, cx, cy, rx, ry, a = 0.72, cor = '10,8,24') {
  g.save(); g.translate(cx, cy); g.scale(1, ry / rx);
  const gr = g.createRadialGradient(0, 0, rx * 0.55, 0, 0, rx * 1.25);
  gr.addColorStop(0, `rgba(${cor},0)`); gr.addColorStop(1, `rgba(${cor},${a})`);
  g.fillStyle = gr; g.fillRect(-W * 3, -H * 3, W * 6, H * 6); g.restore();
}
function brilho(g, x, y, r, cor, a, modo = 'screen') {
  g.save(); g.globalCompositeOperation = modo; g.globalAlpha = a;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}
function texto(g, txt, x, y, tam, { cor = '#ffb347', alinh = 'left', r = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(r);
  g.font = `${tam}px Archivo`; g.textAlign = alinh; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(6,4,12,0.7)'; g.fillText(txt, tam * 0.06, tam * 0.08);
  g.lineWidth = tam * 0.2; g.strokeStyle = TINTA; g.strokeText(txt, 0, 0);
  g.fillStyle = cor; g.fillText(txt, 0, 0);
  g.restore();
}

const thumbs = {
  // 1 · a leitura, no auge: bigode tremendo, olhos molhados, a lágrima; a luz do abajur de baixo
  '31-anos': (g) => {
    const t = B('leitura') + 6.2 + 6.5, x0 = 330, y0 = 60, w0 = 1640, k = W / w0, X = (x) => (x - x0) * k, Y = (y) => (y - y0) * k;
    base(g, cena(t, x0, y0, w0));
    foco(g, X(900), Y(560), 900, 980, 0.8);
    brilho(g, X(560), Y(1000), 1300, '#ffb35c', 0.42);
    brilho(g, X(700), Y(560), 700, '#ffd9a0', 0.16);
    texto(g, '31', 2440, 720, 440, { alinh: 'right' });
    texto(g, 'ANOS', 2440, 990, 250, { alinh: 'right' });
  },
  // 2 · o almoço: o garfo parado no ar, ele escuta; a fresta da porta clara atrás (de onde vem o tec-tec)
  'quem-era': (g) => {
    const t = B('almoco') + 5.1 + 1.6, x0 = 220, y0 = 60, w0 = 1640, k = W / w0, X = (x) => (x - x0) * k, Y = (y) => (y - y0) * k;
    base(g, cena(t, x0, y0, w0));
    foco(g, X(760), Y(560), 900, 980, 0.62);
    brilho(g, X(1490), Y(450), 700, '#fff0c8', 0.35);
    brilho(g, X(1200), Y(600), 1100, '#ffc27a', 0.18);
    texto(g, 'QUEM', 2470, 300, 250, { alinh: 'right' });
    texto(g, 'ERA?', 2470, 560, 250, { alinh: 'right' });
  },
  // 3 · a Lurdes quase diz: as letras saem da boca e já caem; os olhos baixos
  'nao-disse': (g) => {
    const t = B('lurdes') + 5.65, x0 = 360, y0 = -80, w0 = 1640, k = W / w0, X = (x) => (x - x0) * k, Y = (y) => (y - y0) * k;
    base(g, cena(t, x0, y0, w0));
    foco(g, X(1150), Y(470), 1000, 1050, 0.7);
    brilho(g, X(700), Y(200), 1200, '#ffd08a', 0.22);
    texto(g, 'NÃO', 90, 330, 270);
    texto(g, 'DISSE', 90, 600, 270);
  },
};

const pequenas = [];
for (const [nome, fn] of Object.entries(thumbs)) {
  const c = createCanvas(W, H), g = c.getContext('2d'); fn(g);
  const big = path.join(saida, `_thumb_${versao}_${nome}.png`), jpg = path.join(saida, `thumb_${versao}_${nome}.jpg`);
  fs.writeFileSync(big, c.toBuffer('image/png'));
  execFileSync(FF, ['-v', 'error', '-y', '-i', big, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '2', jpg]);
  fs.unlinkSync(big); pequenas.push(jpg);
  console.log(jpg, (fs.statSync(jpg).size / 1024).toFixed(0) + ' KB');
}
// as três em tamanho de celular (320x180 e 168x94), para conferir se a expressão se lê sem o texto
const fc = ['-v', 'error', '-y', ...pequenas.flatMap((p) => ['-i', p]), '-filter_complex',
  '[0]scale=320:180[a];[1]scale=320:180[b];[2]scale=320:180[c];[0]scale=168:94[d];[1]scale=168:94[e];[2]scale=168:94[f];[a][b][c]hstack=3[t];[d][e][f]hstack=3,pad=960:94[u];[t][u]vstack',
  '-q:v', '2', path.join(saida, `thumbs_${versao}_pequenas.jpg`)];
execFileSync(FF, fc);
