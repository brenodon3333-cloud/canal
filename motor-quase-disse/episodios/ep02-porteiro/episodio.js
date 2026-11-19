// QUASE DISSE · EPISÓDIO 2 · "O porteiro" (~2 min)
// O último dia do Seu Arlindo, porteiro há 31 anos. Os moradores quase dizem; as letras caem antes de terminar.
// No almoço, o tec-tec da caneta dele chega pela porta do quartinho. Às 18:00 o livro da portaria está cheio.
// No dia seguinte ele volta de visita, e é a Dona Lurdes quem abre a porta para ele.
const path = require('path');
const { GlobalFonts } = require('@napi-rs/canvas');
const D = require('../../motor/desenho');
const EL = require('../../motor/elenco');
const P = require('./personagens');
const { fr, suave, saida, entrada, voltaAtras, lerp, forma, traco, elipsePts, TINTA } = D;

const RAIZ = path.join(__dirname, '../..');
const fonte = (arq, nome) => GlobalFonts.registerFromPath(path.join(RAIZ, 'assets/fontes', arq), nome);
fonte('ArchivoBlack-Regular.ttf', 'Archivo');
// letras de mão: cada apartamento tem a sua; a do Seu Arlindo é a Kalam
fonte('Kalam-Regular.ttf', 'Kalam'); fonte('Caveat-Variavel.ttf', 'Caveat'); fonte('GochiHand-Regular.ttf', 'Gochi');
fonte('PatrickHand-Regular.ttf', 'Patrick'); fonte('IndieFlower-Regular.ttf', 'Indie'); fonte('ShadowsIntoLight.ttf', 'Shadows');
fonte('ReenieBeanie.ttf', 'Reenie'); fonte('NothingYouCouldDo.ttf', 'Nothing');

const FPS = 24;
const blocos = [
  { id: 'abre', dur: 1.2 },
  { id: 'gancho', dur: 5.6 },
  { id: 'titulo', dur: 2.6 },
  { id: 'manha', dur: 3.4 },
  { id: 'caio', dur: 11.0 },
  { id: 'porta', fala: 'L1', antes: 0.6, depois: 1.7 },
  { id: 'ultimo', fala: 'L2', antes: 0.5, depois: 1.4 },
  { id: 'lurdes', dur: 11.5 },
  { id: 'ninguem', fala: 'L3', antes: 0.8, depois: 3.8 },
  { id: 'anota', dur: 3.4 },
  { id: 'almoco', dur: 13.0 },
  { id: 'volta', dur: 6.0 },
  { id: 'tarde', dur: 5.0 },
  { id: 'fim', dur: 5.5 },
  { id: 'leitura', dur: 14.0 },
  { id: 'assina', dur: 7.5 },
  { id: 'sai', dur: 7.0 },
  { id: 'seguinte', fala: 'L4', antes: 1.2, depois: 1.2 },
  { id: 'interfone', dur: 11.5 },
  { id: 'resposta', dur: 5.5 },
  { id: 'cartela', dur: 2.6 },
  { id: 'preto', dur: 2.0 },
];

// ---------------------------------------------------------------- saguão: geometria e profundidade
// horizonte 470; linha de chão de referência 1000 (d = 1: Caio com 734 px, como no elevador do ep01)
const SAG = { horizonte: 470, yRef: 1000, chao: 800, teto: 90 };
const MESA = { x0: 230, x1: 740, topoTras: 624, topoFrente: 643, base: 660, peFrente: 920, peTras: 870 };
const ARL = { x: 470, yPe: 880 }; // banco atrás do balcão
const BOTAO = { x: 615, y: 636 };
const LIVRO_B = { x: 470, y: 634 };
const ABAJUR = { x: 300 };
const ELEV = { x0: 960, x1: 1220, y0: 330, chao: 800, cx: 1090 };
const PORTA = { x0: 1480, x1: 1780, y0: 300, chao: 800, cx: 1630 };
const RES = { x: 860, yPe: 928 }; // onde o morador para, ao lado do balcão
const RELOGIO = { x: 470, y: 238, r: 54 };
const esc = (vista, yPe) => EL.escala(vista, EL.profundidade(yPe, SAG));

// ---------------------------------------------------------------- andar: trajeto com meio-passos inteiros
// o pé pousa a cada meio ciclo; a duração de cada trecho é arredondada para meio-passos inteiros, assim ele para com os dois pés no chão
function trajeto(t0, ciclo, pontos) {
  const trechos = []; let t = t0;
  for (let i = 1; i < pontos.length; i++) {
    const [a, b] = [pontos[i - 1], pontos[i]];
    const k = Math.max(1, b.meios || Math.round(Math.hypot(b.x - a.x, (b.yPe - a.yPe) * 2.2) / (b.vel || 210) / (ciclo / 2)));
    trechos.push({ a, b, t0: t, t1: t + k * ciclo / 2, k });
    t += k * ciclo / 2;
  }
  const passos = []; for (const tr of trechos) for (let j = 1; j <= tr.k; j++) passos.push(tr.t0 + j * ciclo / 2);
  return { t0, t1: t, ciclo, trechos, passos, pontos };
}
function ondeEsta(tj, t) {
  if (t <= tj.t0) return { x: tj.pontos[0].x, yPe: tj.pontos[0].yPe, passo: null, anda: false };
  for (const tr of tj.trechos) if (t < tr.t1) {
    const q = (t - tr.t0) / (tr.t1 - tr.t0);
    return { x: lerp(tr.a.x, tr.b.x, q), yPe: lerp(tr.a.yPe, tr.b.yPe, q), passo: (t - tj.t0) / tj.ciclo, anda: true };
  }
  const f = tj.pontos[tj.pontos.length - 1];
  return { x: f.x, yPe: f.yPe, passo: null, anda: false };
}

// ---------------------------------------------------------------- marcas de tempo (segundos absolutos)
let M = null;
function marcas(T) {
  if (M) return M;
  const b = Object.fromEntries(blocos.map((x) => [x.id, T.B(x.id).ini]));
  M = { b };
  const g = b.gancho;
  // gancho: escreve, tec-tec, deita a caneta, a mão esquerda folheia para trás
  M.g = { escreve: [g + 0.1, g + 2.1], tec: [g + 2.3, g + 2.5], deita: g + 3.0, sai: [g + 3.0, g + 3.4], folheia: [] };
  { let t = g + 3.45, dt = 0.4; while (t < g + 5.05) { M.g.folheia.push(t); t += dt; dt = Math.max(0.075, dt * 0.8); } }
  M.ma = { olhaElev: b.manha + 1.8 };
  const c = b.caio;
  M.c = { plim: c + 0.3, abre: c + 0.4, aberta: c + 1.2, fecha: c + 4.2 };
  M.c.vem = trajeto(c + 1.3, 0.9, [{ x: ELEV.cx, yPe: 802 }, { x: RES.x, yPe: RES.yPe, meios: 6 }]);
  M.c.bomdiaA = c + 4.2; M.c.foneTira = [c + 4.45, c + 5.15]; M.c.bomdiaC = c + 5.4; M.c.encaixe = c + 6.0;
  M.c.corteC = c + 6.5; M.c.letras = [0, 1, 2, 3, 4, 5, 6].map((i) => c + 6.8 + i * 0.16); M.c.voltaB = c + 8.6;
  M.c.caem = M.c.letras.map((_, i) => c + 8.75 + i * 0.11); M.c.olhaChao = c + 9.0; M.c.foneBota = [c + 9.8, c + 10.45];
  const pt = b.porta;
  M.pt = { botao: T.W('L1', 'porta').ini };
  M.pt.abre = M.pt.botao + 0.15; M.pt.aberta = M.pt.abre + 0.7;
  M.pt.vai = trajeto(pt + 0.05, 0.9, [{ x: RES.x, yPe: RES.yPe }, { x: PORTA.cx, yPe: 806, meios: 6 }, { x: PORTA.cx + 10, yPe: 790, meios: 1 }, { x: 2060, yPe: 790, meios: 4 }]);
  M.pt.fecha = M.pt.vai.trechos[2].t1 + 0.5; M.pt.fechada = M.pt.fecha + 0.6;
  const ul = b.ultimo;
  M.ul = { dedo: ul + 0.8, reta: ul + 1.2, sai: [ul + 1.3, ul + 1.8] };
  const l = b.lurdes;
  M.l = { plim: l + 0.3, abre: l + 0.4, aberta: l + 1.2, fecha: l + 4.4 };
  M.l.vem = trajeto(l + 1.3, 0.8, [{ x: ELEV.cx, yPe: 802 }, { x: RES.x - 20, yPe: RES.yPe + 2, meios: 7 }]);
  M.l.corteD = l + 4.3; M.l.letras = [0, 1, 2, 3, 4].map((i) => l + 4.6 + i * 0.2); M.l.aperta = l + 6.0; M.l.voltaB = l + 6.6;
  M.l.pegaSacola = [l + 6.6, l + 6.85]; M.l.levaSacola = [l + 6.85, l + 7.2]; M.l.caem = [0, 1, 2, 3, 4].map((i) => l + 7.25 + i * 0.12);
  M.l.voltaSacola = [l + 8.15, l + 8.55]; M.l.soltaSacola = [l + 8.55, l + 8.85];
  M.l.ateL = l + 8.7; M.l.ateA = l + 9.2; M.l.encaixe = l + 9.8;
  M.l.botao = l + 11.0; M.l.abre = l + 11.15; M.l.aberta = l + 11.85;
  const ng = b.ninguem;
  M.l.vai = trajeto(l + 10.4, 0.8, [{ x: RES.x - 20, yPe: RES.yPe + 2 }, { x: PORTA.cx, yPe: 808, meios: 8 }]);
  M.l.para = M.l.vai.t1; M.l.quase = [M.l.para + 0.2, M.l.para + 1.0];
  M.l.sai = trajeto(M.l.para + 1.2, 0.8, [{ x: PORTA.cx, yPe: 808 }, { x: PORTA.cx + 10, yPe: 790, meios: 1 }, { x: 2060, yPe: 790, meios: 5 }]);
  M.l.fechaPorta = M.l.sai.trechos[1].t1 - 0.6; M.l.fechada = M.l.fechaPorta + 0.6;
  M.ng = { olhaLetras: ng + 4.0 };
  const an = b.anota;
  M.an = { pega: an + 0.4, escreve: [an + 0.85, an + 2.0], tec: [an + 2.2, an + 2.4], deita: an + 2.8, sai: [an + 2.8, an + 3.3] };
  const al = b.almoco;
  M.al = { garfadas: [al + 0.5, al + 2.7, al + 5.1, al + 10.6], plim1: al + 3.6, passos1: [al + 4.2, al + 4.6, al + 5.0], tec1: al + 5.3, risco1: [al + 5.45, al + 6.6], tec2: al + 6.8,
    passos2: [al + 7.3, al + 7.7, al + 8.1], plim2: al + 8.6, para: al + 5.3 + 0.22, solta: al + 10.0 };
  const vo = b.volta;
  M.vo = { olhaLivro: vo + 0.6, corteA: vo + 1.4, dedo: vo + 2.3, reta: vo + 2.7, voltaB: vo + 3.6 };
  const fi = b.fim;
  M.fi = { relogio: fi + 0.3, maosLivro: fi + 2.0, corteA: fi + 2.6, pegaCapa: fi + 3.0, abre: [fi + 3.05, fi + 3.8] };
  const le = b.leitura;
  M.le = { vira: [le + 4.9, le + 5.7], pegaPagina: le + 4.9, corteF: le + 6.2 };
  const as = b.assina;
  M.as = { pega: as + 0.6, tec0: as + 1.2, linha1: [as + 1.4, as + 3.2], linha2: [as + 3.5, as + 5.0], tec: [as + 5.3, as + 5.5], deita: as + 6.0, sai: [as + 6.4, as + 7.0] };
  const sa = b.sai;
  M.sa = { botao: sa + 0.45, abre: sa + 0.6, aberta: sa + 1.3 };
  M.sa.vai = trajeto(sa + 1.0, 0.9, [{ x: 560, yPe: 880 }, { x: PORTA.cx, yPe: 806, meios: 8 }, { x: PORTA.cx + 10, yPe: 790, meios: 1 }, { x: 2060, yPe: 790, meios: 4 }]);
  M.sa.fecha = M.sa.vai.trechos[1].t1 + 0.5; M.sa.fechada = M.sa.fecha + 0.6;
  const it = b.interfone;
  M.it = { interfone: it + 0.8, plim: it + 1.2, abre: it + 1.3, aberta: it + 2.1, fecha: it + 5.4, corteG: it + 4.6, voltaB: it + 7.4, botao: it + 7.65 };
  M.it.vem = trajeto(it + 2.1, 0.8, [{ x: ELEV.cx, yPe: 802 }, { x: RES.x - 60, yPe: RES.yPe + 2, meios: 7 }]);
  M.it.abrePorta = M.it.botao + 0.15; M.it.portaAberta = M.it.abrePorta + 0.7;
  M.it.entra = trajeto(M.it.portaAberta + 0.1, 0.9, [{ x: PORTA.cx - 30, yPe: 790 }, { x: PORTA.cx - 40, yPe: 812, meios: 1 }, { x: 1000, yPe: 918, meios: 5 }]);
  M.it.fechaPorta = M.it.entra.trechos[0].t1 + 0.9; M.it.portaFechada = M.it.fechaPorta + 0.6;
  const rs = b.resposta;
  M.rs = { bomdiaA: rs + 0.2, bomdiaL: rs + 0.6, encaixe: rs + 1.2, oferece: [rs + 2.0, rs + 2.6], pega: rs + 2.8, solta: rs + 3.2 };

  M.planos = [
    ['abre', 'preto'], ['gancho', 'A'], ['titulo', 'titulo'], ['manha', 'B'], ['caio', 'B'], ['porta', 'B'], ['ultimo', 'A'], ['lurdes', 'B'],
    ['ninguem', 'B'], ['anota', 'A'], ['almoco', 'E'], ['volta', 'B'], ['tarde', 'B'], ['fim', 'B'], ['leitura', 'A'], ['assina', 'A'], ['sai', 'B'],
    ['seguinte', 'B'], ['interfone', 'B'], ['resposta', 'B'], ['cartela', 'cartela'], ['preto', 'preto'],
  ].map(([id, pl]) => ({ de: b[id], id: pl, bloco: id }));
  const corta = (de, id, bloco) => { const i = M.planos.findIndex((p) => p.de > de); M.planos.splice(i < 0 ? M.planos.length : i, 0, { de, id, bloco }); };
  corta(M.c.corteC, 'C', 'caio'); corta(M.c.voltaB, 'B', 'caio');
  corta(M.l.corteD, 'D', 'lurdes'); corta(M.l.voltaB, 'B', 'lurdes');
  corta(M.vo.corteA, 'A', 'volta'); corta(M.vo.voltaB, 'B', 'volta');
  corta(M.fi.corteA, 'A', 'fim'); corta(M.le.corteF, 'F', 'leitura');
  corta(M.it.corteG, 'G', 'interfone'); corta(M.it.voltaB, 'B', 'interfone');
  M.planos.forEach((p, i) => { p.ate = i + 1 < M.planos.length ? M.planos[i + 1].de : T.total + 1; });

  // contatos: cada um é um instante só, usado pela imagem e pelo som
  const C = [];
  const ad = (nome, t) => C.push({ nome, t });
  ad('tec 1 (gancho)', M.g.tec[0]); ad('tec 2 (gancho)', M.g.tec[1]); ad('caneta pousa no papel (gancho)', M.g.deita);
  M.g.folheia.forEach((t, i) => ad(`página cai ${i + 1}`, t + folhaDur(i)));
  ad('plim (Caio)', M.c.plim); ad('portas do elevador abertas (Caio)', M.c.aberta);
  M.c.vem.passos.forEach((t, i) => ad(`passo do Caio ${i + 1}`, t));
  ad('"Bom dia." dele (Arlindo)', M.c.bomdiaA); ad('mão toca o fone', M.c.foneTira[0] + 0.15); ad('"Bom dia." do Caio', M.c.bomdiaC); ad('encaixe (Caio)', M.c.encaixe);
  const LC = letrasCaio(), LL = letrasLurdes(); // o espaço não é peça: não aparece, não cai, não soa
  M.c.letras.forEach((t, i) => { if (LC[i].ch !== ' ') ad(`letra ${i + 1} aparece (Caio)`, t); });
  M.c.caem.forEach((t, i) => { if (LC[i].ch !== ' ') ad(`letra ${i + 1} bate no chão`, t + quedaDur('c', i)); });
  ad('mão toca o fone (põe)', M.c.foneBota[0] + 0.2);
  ad('dedo aperta o botão da porta (Caio)', M.pt.botao); ad('porta de vidro abre (Caio)', M.pt.abre);
  M.pt.vai.passos.forEach((t, i) => ad(`passo do Caio saindo ${i + 1}`, t));
  ad('porta fecha (Caio)', M.pt.fechada);
  ad('dedo encosta na caneta', M.ul.dedo);
  ad('plim (Lurdes)', M.l.plim); ad('portas do elevador abertas (Lurdes)', M.l.aberta);
  M.l.vem.passos.forEach((t, i) => ad(`passo da Lurdes ${i + 1}`, t));
  M.l.letras.forEach((t, i) => { if (LL[i].ch !== ' ') ad(`letra ${i + 1} aparece (Lurdes)`, t); });
  ad('mão pega a sacola', M.l.pegaSacola[1]);
  M.l.caem.forEach((t, i) => { if (LL[i].ch !== ' ') ad(`letra ${i + 1} cai na sacola`, t + quedaDur('l', i)); });
  ad('"Até amanhã." dela', M.l.ateL); ad('"Até amanhã." dele', M.l.ateA); ad('encaixe (Lurdes)', M.l.encaixe);
  ad('dedo aperta o botão da porta (Lurdes)', M.l.botao); ad('porta de vidro abre (Lurdes)', M.l.abre);
  M.l.vai.passos.forEach((t, i) => ad(`passo da Lurdes saindo ${i + 1}`, t));
  M.l.sai.passos.forEach((t, i) => ad(`passo da Lurdes lá fora ${i + 1}`, t));
  ad('porta fecha (Lurdes)', M.l.fechada);
  ad('mão pega a caneta (anota)', M.an.pega); ad('tec 1 (anota)', M.an.tec[0]); ad('tec 2 (anota)', M.an.tec[1]); ad('caneta pousa (anota)', M.an.deita);
  M.al.garfadas.forEach((t, i) => ad(`garfo raspa a marmita ${i + 1}`, t));
  ad('dedo encosta na caneta torta', M.vo.dedo);
  ad('capa do livro cai aberta', M.fi.abre[1]); ad('mão pega o canto da página', M.le.pegaPagina); ad('página vira e cai', M.le.vira[1]);
  ad('mão pega a caneta (assina)', M.as.pega); ad('tec (assina, antes)', M.as.tec0); ad('tec 1 (assina)', M.as.tec[0]); ad('tec 2 (assina)', M.as.tec[1]); ad('caneta pousa torta', M.as.deita);
  ad('dedo aperta o botão (ele mesmo)', M.sa.botao); ad('porta abre (ele sai)', M.sa.abre);
  M.sa.vai.passos.forEach((t, i) => ad(`passo do Arlindo saindo ${i + 1}`, t));
  ad('porta fecha (ele saiu)', M.sa.fechada);
  ad('dedo no interfone (de fora)', M.it.interfone); ad('plim (Lurdes, manhã seguinte)', M.it.plim);
  M.it.vem.passos.forEach((t, i) => ad(`passo da Lurdes ${i + 1} (manhã seguinte)`, t));
  ad('DEDO DA LURDES APERTA O BOTÃO DA PORTA', M.it.botao); ad('porta abre para ele', M.it.abrePorta);
  M.it.entra.passos.forEach((t, i) => ad(`passo do Arlindo entrando ${i + 1}`, t));
  ad('porta fecha (ele entrou)', M.it.portaFechada);
  ad('"Bom dia." dele (fim)', M.rs.bomdiaA); ad('"Bom dia." dela (fim)', M.rs.bomdiaL); ad('ENCAIXE FINAL', M.rs.encaixe); ad('mão dela pega o saco de pão', M.rs.pega);
  M.contatos = C.sort((a, b2) => a.t - b2.t);
  return M;
}
const planoEm = (t) => M.planos.find((p) => t >= p.de && t < p.ate) || M.planos[M.planos.length - 1];
const pulso = (t, t0, larg = 0.07) => Math.max(0, 1 - Math.abs(t - t0) / larg);
// duração de cada folha virando no gancho (fica mais rápida)
function folhaDur(i) { return Math.max(0.07, 0.3 * Math.pow(0.8, i)); }

// ---------------------------------------------------------------- câmera, luz, texto
function camera(g, c, k) {
  const zk = 1 + (c.z - 1) * k;
  g.translate(960 + (c.sx || 0) * k, 540 + (c.sy || 0) * k);
  g.scale(zk, zk);
  g.translate(-c.cx, -c.cy);
}
function camada(g, c, k, fn) { g.save(); camera(g, c, k); fn(); g.restore(); }
function luz(g, cx, cy, r, centro, borda) {
  g.save(); g.globalCompositeOperation = 'multiply';
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, centro); gr.addColorStop(0.55, '#c9c0d8'); gr.addColorStop(1, borda);
  g.fillStyle = gr; g.fillRect(-3000, -3000, 8000, 8000); g.restore();
}
function brilho(g, cx, cy, r, cor, a) {
  if (a <= 0.001) return;
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = Math.min(1, a);
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-3000, -3000, 8000, 8000); g.restore();
}
function escurece(g, a, cor = '8,6,16') { if (a > 0.001) { g.fillStyle = `rgba(${cor},${Math.min(1, a)})`; g.fillRect(-3000, -3000, 8000, 8000); } }
// fala escrita em cena: peça de madeira clara com contorno de tinta (mesma família do ep01)
function frase(g, txt, x, y, tam, { r = 0, esc: e = 1, alfa = 1, piv = 'meio' } = {}) {
  if (alfa <= 0 || e <= 0.001) return;
  g.save(); g.globalAlpha = alfa;
  g.font = `${tam}px Archivo`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const dy = piv === 'topo' ? tam * 0.55 : 0;
  g.translate(x, y - dy); g.rotate(r); g.scale(e, e); g.translate(0, dy);
  g.lineJoin = 'round'; g.lineWidth = tam * 0.16; g.strokeStyle = TINTA; g.strokeText(txt, 0, 0);
  g.fillStyle = '#fbf8f1'; g.fillText(txt, 0, 0);
  g.restore();
}
function largura(txt, tam, f = 'Archivo') { const c = largura.c || (largura.c = require('@napi-rs/canvas').createCanvas(10, 10).getContext('2d')); c.font = `${tam}px ${f}`; return c.measureText(txt).width; }
// uma letra solta (peça de madeira); deitada = 0 de pé .. 1 deitada no chão (achata em perspectiva)
function letra(g, ch, x, y, tam, { r = 0, deitada = 0, alfa = 1, esc: e = 1 } = {}) {
  if (ch === ' ' || alfa <= 0) return;
  g.save(); g.globalAlpha = alfa; g.translate(x, y); g.rotate(r); g.scale(e, e * lerp(1, 0.42, deitada));
  g.font = `${tam}px Archivo`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.lineJoin = 'round'; g.lineWidth = tam * 0.16; g.strokeStyle = TINTA; g.strokeText(ch, 0, 0);
  g.fillStyle = '#fbf8f1'; g.fillText(ch, 0, 0);
  g.restore();
}
// fileira de letras: posição de cada uma (centro de cada caractere), da esquerda para a direita
function fileira(txt, xFim, y, tam) {
  const w = largura(txt, tam); let x = xFim - w; const out = [];
  for (const ch of txt) { const cw = largura(ch, tam); out.push({ ch, x: x + cw / 2, y }); x += cw; }
  return out;
}
const G_QUEDA = 3000;

// ---------------------------------------------------------------- posições derivadas no saguão
const sCaio = () => esc('caioFrente', RES.yPe);
const bocaCaioRes = () => ({ x: RES.x + 2 * sCaio(), y: RES.yPe - 616 * sCaio() });
const sL = () => esc('lurdesFrente', RES.yPe + 2);
const bocaLurdesRes = () => ({ x: RES.x - 20, y: RES.yPe + 2 - 380 * sL() });
const sAS = () => esc('arlindoFrente', ARL.yPe); // sentado: mesma escala, só o quadril desce
const bocaArl = () => ({ x: ARL.x, y: ARL.yPe - 404 * sAS() });
const SACOLA = { x: -113, y: -240 }; // a sacola no ombro esquerdo dela (lado do balcão); as letras caem direto nela
function letrasCaio() { const b = bocaCaioRes(); return fileira('Seu Arl', b.x - 46, b.y - 18, 40); }
function letrasLurdes() { const b = bocaLurdesRes(); const s = sL(); const xBolsa = RES.x - 20 + SACOLA.x * s; const w = largura('O sen', 32); return fileira('O sen', xBolsa + w / 2 - 4, b.y - 22, 32); }
function quedaDur(quem, i) {
  if (quem === 'c') { const L = letrasCaio()[i]; const chao = RES.yPe + 10 + (i % 3) * 6; return Math.sqrt((2 * (chao - L.y)) / G_QUEDA); }
  const L = letrasLurdes()[i]; const s = sL(); const boca = RES.yPe + 2 + (SACOLA.y - 10 + 6) * s; return Math.sqrt((2 * (boca - L.y)) / G_QUEDA);
}

// ---------------------------------------------------------------- o livro da portaria (visto de cima)
const LIVRO = { e: { x0: 250, x1: 950 }, d: { x0: 970, x1: 1670 }, y0: 110, y1: 1010, lomba: 960, linha0: 262, passo: 68, tam: 50 };
const TINTA_CANETA = '#1f2f7a';
const linhaY = (i) => LIVRO.linha0 + i * LIVRO.passo;
// linhas de cada página: [texto, fonte]. A caneta é a mesma para todos (a dele): a tinta é igual, a letra muda.
const PAG = {
  ontem: { data: '18/11/2026', linhas: [['06:59 — Início do plantão.', 'Kalam'], ['07:40 — 601 saiu.', 'Kalam'], ['08:10 — 501 saiu.', 'Kalam'], ['09:32 — Entrega, 302.', 'Kalam'],
    ['10:05 — 501 voltou.', 'Kalam'], ['12:00 — Almoço.', 'Kalam'], ['13:00 — Volta.', 'Kalam'], ['15:20 — Entrega, 702.', 'Kalam'], ['16:45 — 601 voltou.', 'Kalam'], ['18:00 — Fim do plantão.', 'Kalam']] },
  hoje: { data: '19/11/2026', linhas: [['06:59 — Início do plantão.', 'Kalam'], ['07:41 — 601 saiu.', 'Kalam'], ['08:12 — 501 saiu.', 'Kalam'], ['12:00 — Almoço.', 'Kalam'],
    ['12:04 — 501. Obrigada por guardar', 'Caveat', 58], ['minha chave. Foram 212 vezes.', 'Caveat', 58],
    ['12:07 — 601. O senhor dava bom dia', 'Gochi'], ['todo dia. Eu demorei pra responder.', 'Gochi'],
    ['12:09 — 302. Obrigado por cada', 'Patrick'], ['encomenda. Foram muitas.', 'Patrick']] },
  verso: { data: '', linhas: [['12:13 — 702. O senhor carregou minhas', 'Indie', 44], ['compras no dia da mudança.', 'Indie', 44], ['12:16 — 401. Meu filho aprendeu', 'Shadows', 52], ['a dar tchau com o senhor.', 'Shadows', 52],
    ['12:20 — 203. Obrigada.', 'Nothing', 44], ['12:22 — 604. Vai fazer falta.', 'Reenie', 60], ['12:25 — 101. Obrigado pelo guarda-chuva', 'Caveat', 52], ['emprestado em 2009.', 'Caveat', 52],
    ['12:31 — 502. Bom descanso, Seu Arlindo.', 'Patrick', 46], ['12:38 — 303. Obrigado.', 'Gochi', 48]] },
  depois: { data: '', linhas: [['12:40 — 704. Valeu por tudo.', 'Indie', 50], ['12:47 — 201. A gente vai sentir', 'Shadows', 52], ['falta do seu bom dia.', 'Shadows', 52], ['12:52 — 402. Obrigada, de verdade.', 'Caveat', 54]] },
};
const FINAL = [['18:00 — Fim do plantão.', 'Kalam'], ['Obrigado.', 'Kalam']];
const LINHA_FINAL = 5; // na página "depois", logo abaixo da última mensagem
function escreve(g, txt, x, y, f, tam, k = 1, { tinta = TINTA_CANETA, treme = 0, firme = 0 } = {}) {
  g.save(); g.font = `${tam}px ${f}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = tinta;
  const w = g.measureText(txt).width;
  if (k < 1) { g.beginPath(); g.rect(x - 20, y - tam * 1.3, w * k + 20, tam * 2); g.clip(); }
  if (treme > 0) { // cada letra um pouco fora do lugar: a mão tremeu
    let xx = x; let i = 0;
    for (const ch of txt) { const cw = g.measureText(ch).width; g.fillText(ch, xx + (D.hash(i * 3.1) - 0.5) * treme * 5, y + (D.hash(i * 7.7) - 0.5) * treme * 9); xx += cw; i++; }
  } else g.fillText(txt, x, y);
  if (firme > 0) { g.lineWidth = firme; g.strokeStyle = tinta; g.strokeText(txt, x, y); }
  g.restore();
  return { x: x + w * k, y: y - tam * 0.22 + Math.sin(k * w * 0.21) * tam * 0.16, w };
}
// cada linha cabe na página: de x0 + 70 até x1 − 36 (594 px); a letra encolhe se precisar
function cabe(txt, f, tam, max = 594) { const w = largura(txt, tam, f); return w > max ? tam * max / w : tam; }
function papel(g, x0, x1, y0, y1, seed, cor = '#f3ead2') {
  forma(g, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], cor, { seed, linha: 4, reto: true });
  for (let i = 0; i < 12; i++) traco(g, [[x0 + 30, linhaY(i) + 14], [x1 - 30, linhaY(i) + 14]], 2, { seed: seed + 10 + i, tinta: '#b9c6d8', tremor: 0.2 });
  traco(g, [[x0 + 52, y0 + 20], [x0 + 52, y1 - 20]], 2.5, { seed: seed + 30, tinta: '#d9a3a3', tremor: 0.2 });
}
// página com conteúdo; ate = quantas linhas aparecem (fração na última = sendo escrita)
function pagina(g, lado, pg, ate = 99, opt = {}) {
  const L = LIVRO[lado];
  papel(g, L.x0, L.x1, LIVRO.y0, LIVRO.y1, lado === 'e' ? 2000 : 2100, opt.cor);
  if (pg.data) escreve(g, pg.data, L.x1 - 250, LIVRO.y0 + 74, 'Kalam', 40, 1, { tinta: '#5b6478' });
  const n = Math.min(pg.linhas.length, Math.floor(ate));
  for (let i = 0; i < n; i++) { const [txt, f, tam] = pg.linhas[i]; escreve(g, txt, L.x0 + 70, linhaY(i), f, cabe(txt, f, tam || LIVRO.tam), 1, opt.firme ? { firme: 1.2, tinta: '#16236a' } : {}); }
}
function livroAberto(g, esq, dir, opt = {}) {
  forma(g, [[LIVRO.e.x0 - 26, LIVRO.y0 - 22], [LIVRO.d.x1 + 26, LIVRO.y0 - 22], [LIVRO.d.x1 + 26, LIVRO.y1 + 22], [LIVRO.e.x0 - 26, LIVRO.y1 + 22]], '#24414a', { seed: 1990, linha: 6, reto: true }); // capa
  esq(); dir();
  g.save(); const gr = g.createLinearGradient(LIVRO.lomba - 60, 0, LIVRO.lomba + 60, 0);
  gr.addColorStop(0, 'rgba(60,40,30,0)'); gr.addColorStop(0.5, 'rgba(60,40,30,0.28)'); gr.addColorStop(1, 'rgba(60,40,30,0)');
  g.fillStyle = gr; g.fillRect(LIVRO.lomba - 60, LIVRO.y0, 120, LIVRO.y1 - LIVRO.y0); g.restore();
  if (opt.fita) { traco(g, [[LIVRO.lomba + 4, LIVRO.y0 + 10], [LIVRO.lomba + 16, LIVRO.y1 + 60]], 14, { seed: 1991, tinta: '#a8323a' }); }
}
// folha virando em volta da lomba: q 0 = deitada à esquerda .. 1 deitada à direita
function folhaVirando(g, q, seed) {
  const a = Math.PI * (1 - q), ex = LIVRO.lomba + Math.cos(a) * 700, curva = Math.sin(a) * 90;
  const sombra = Math.sin(a);
  g.save();
  g.fillStyle = `rgba(20,14,10,${0.18 * sombra})`; g.fillRect(Math.min(ex, LIVRO.lomba), LIVRO.y0, Math.abs(ex - LIVRO.lomba), LIVRO.y1 - LIVRO.y0);
  const cor = `rgb(${Math.round(243 - 40 * sombra)},${Math.round(234 - 40 * sombra)},${Math.round(210 - 36 * sombra)})`;
  forma(g, [[LIVRO.lomba, LIVRO.y0], [ex, LIVRO.y0 - curva * 0.5], [ex + (ex > LIVRO.lomba ? -1 : 1) * curva * 0.2, LIVRO.y1 + curva * 0.3], [LIVRO.lomba, LIVRO.y1]], cor, { seed, linha: 4 });
  g.restore();
  return { ex, ey: LIVRO.y1 + curva * 0.3 };
}
// datas que aparecem quando ele folheia para trás (31 anos)
const DATAS = ['14/06/2024', '02/09/2021', '27/01/2018', '11/05/2015', '30/10/2011', '08/03/2008', '19/07/2004', '23/11/2001', '05/02/1999', '16/08/1997', '22/12/1996', '03/04/1995'];
function paginaAntiga(g, lado, data, primeira) {
  const pg = { data, linhas: [['06:59 — Início do plantão.' + (primeira ? ' Arlindo.' : ''), 'Kalam'], ...(primeira ? [] : [['07:3' + (data.charCodeAt(1) % 10) + ' — 601 saiu.', 'Kalam'], ['12:00 — Almoço.', 'Kalam'], ['13:00 — Volta.', 'Kalam'], ['18:00 — Fim do plantão.', 'Kalam']])] };
  pagina(g, lado, pg, 99, { cor: primeira ? '#f6efd9' : '#efe3c4', firme: primeira });
}
// mão com o indicador esticado (vista de cima), a manga vem de baixo à direita
function maoDedo(g, x, y, ang = -2.3) {
  const L = 6, c = Math.cos(ang), s = Math.sin(ang);
  const punho = { x: x - c * 120, y: y - s * 120 };
  D.membro(g, [[punho.x + 240, punho.y + 420], [punho.x + 110, punho.y + 170], [punho.x + 10, punho.y + 20]], 118, P.COR.aUni, { seed: 1420, borda: 6 });
  forma(g, elipsePts(punho.x, punho.y, 70, 56, 12, ang), P.COR.aPele, { seed: 1421, linha: L });
  D.membro(g, [[punho.x + c * 40, punho.y + s * 40], [x, y]], 26, P.COR.aPele, { seed: 1422, borda: 5 });
  for (let i = 0; i < 3; i++) forma(g, elipsePts(punho.x + c * 46 - s * (i - 1) * 26 + c * -10 * Math.abs(i - 1), punho.y + s * 46 + c * (i - 1) * 26, 22, 16, 8, ang), P.COR.aPele, { seed: 1423 + i, linha: L * 0.8 });
}
// mão aberta (vista de cima) para segurar a capa ou o canto da página
function maoAberta(g, x, y, ang = -2.4) {
  const L = 6, c = Math.cos(ang), s = Math.sin(ang);
  const palma = { x: x - c * 70, y: y - s * 70 };
  D.membro(g, [[palma.x + 250, palma.y + 420], [palma.x + 110, palma.y + 170], [palma.x + 10, palma.y + 20]], 118, P.COR.aUni, { seed: 1430, borda: 6 });
  forma(g, elipsePts(palma.x, palma.y, 74, 60, 12, ang), P.COR.aPele, { seed: 1431, linha: L });
  for (let i = 0; i < 4; i++) { const k = i - 1.5; forma(g, elipsePts(palma.x + c * 70 - s * k * 26, palma.y + s * 70 + c * k * 26, 34, 14, 8, ang), P.COR.aPele, { seed: 1432 + i, linha: L * 0.8 }); }
}
// mão esquerda folheando (vem de baixo à esquerda), o polegar no canto de baixo da página da esquerda
function maoFolheia(g, x, y, k) {
  const L = 6;
  D.membro(g, [[x - 300, y + 420], [x - 140, y + 170], [x - 30, y + 40]], 118, P.COR.aUni, { seed: 1440, borda: 6 });
  forma(g, elipsePts(x - 20, y + 30, 76, 58, 12, 0.6), P.COR.aPele, { seed: 1441, linha: L });
  forma(g, elipsePts(x + 34 + Math.sin(k * 40) * 4, y - 6, 36, 17, 8, -0.5), P.COR.aPele, { seed: 1442, linha: L * 0.8 }); // polegar
}

// ---------------------------------------------------------------- A · o livro, de cima
const REST_PAG = { x: 1060, y: linhaY(4) - 6, ang: 0 }; // caneta deitada na página, paralela às linhas
const REST_MESA = { x: 1772, y: 300, ang: Math.PI / 2 }; // na mesa, paralela à borda do livro (depois que os moradores mexeram)
const REST_TORTA = { x: 1748, y: 316, ang: Math.PI / 2 - 0.5 };
const REST_FINAL = { x: 1110, y: linhaY(8) + 12, ang: 0.38 }; // torta, de propósito
const ANG_ESC = 0.55;
function pontaEm(txt, f, tam, x, y, k) {
  const w = largura(txt, tam, f);
  return { x: x + w * k, y: y - tam * 0.22 + Math.sin(k * w * 0.21) * tam * 0.16 };
}
const mix = (a, b, q) => ({ x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), ang: lerp(a.ang, b.ang, q) });
const FORA = { x: 2300, y: 1500, ang: ANG_ESC };
// estado da mão de escrever e da caneta: {mao: {x,y,ang,clique,comCaneta}|null, caneta: {x,y,ang}|null}
function cliqueEm(t, tecs) { let c = 0; for (const tc of tecs) c = Math.max(c, Math.max(0, 1 - Math.abs(t - tc) / 0.09) * 0.25 + (Math.abs(t - tc) < 0.04 ? 0.75 : 0)); const perto = tecs.some((tc) => t > tecs[0] - 0.2 && t < tecs[tecs.length - 1] + 0.12); return perto ? Math.max(0.75, c) : 0; }
function escritaA(t, m) {
  const pl = planoEm(t).bloco, out = { mao: null, caneta: null, linhaParcial: null };
  const segura = (p, clique = 0) => { out.mao = { ...p, clique, comCaneta: true }; };
  const larga = (pc, mao) => { out.caneta = pc; if (mao) out.mao = { ...mao, clique: 0, comCaneta: false }; };
  if (pl === 'gancho') {
    const [a, b] = m.g.escreve, L0 = PAG.hoje.linhas[0], x0 = LIVRO.d.x0 + 70, y0 = linhaY(0);
    if (t < m.g.deita - 0.4) {
      const k = fr(t, a, b); const pt = pontaEm(L0[0], L0[1], LIVRO.tam, x0, y0, k);
      out.linhaParcial = { pag: 'hoje', i: 0, k };
      const fim = pontaEm(L0[0], L0[1], LIVRO.tam, x0, y0, 1);
      const sobe = suave(fr(t, b, b + 0.15)); // a ponta sai do papel para o clique
      segura({ x: pt.x + 20 * sobe, y: pt.y - 30 * sobe, ang: ANG_ESC }, cliqueEm(t, m.g.tec));
      return out;
    }
    out.linhaParcial = null;
    const fim = pontaEm(L0[0], L0[1], LIVRO.tam, x0, y0, 1), de = { x: fim.x + 20, y: fim.y - 30, ang: ANG_ESC };
    if (t < m.g.deita) { segura(mix(de, REST_MESA, suave(fr(t, m.g.deita - 0.4, m.g.deita)))); return out; }
    const q = suave(fr(t, m.g.sai[0], m.g.sai[1]));
    larga(REST_MESA, q < 1 ? mix({ ...REST_MESA, x: REST_MESA.x + 30, y: REST_MESA.y + 40 }, FORA, q) : null);
    return out;
  }
  if (pl === 'ultimo') { out.caneta = { ...REST_MESA, ang: REST_MESA.ang + lerp(0.07, 0, suave(fr(t, m.ul.dedo, m.ul.reta))) }; return out; }
  if (pl === 'anota') {
    const L = PAG.hoje.linhas[3], x0 = LIVRO.d.x0 + 70, y0 = linhaY(3);
    const ini = pontaEm(L[0], L[1], LIVRO.tam, x0, y0, 0), fim = pontaEm(L[0], L[1], LIVRO.tam, x0, y0, 1);
    if (t < m.an.pega) { larga(REST_MESA, mix(FORA, { ...REST_MESA, x: REST_MESA.x + 30, y: REST_MESA.y + 40 }, suave(fr(t, m.b.anota, m.an.pega)))); return out; }
    if (t < m.an.escreve[0]) { segura(mix(REST_MESA, { ...ini, ang: ANG_ESC }, suave(fr(t, m.an.pega, m.an.escreve[0])))); return out; }
    if (t < m.an.escreve[1] + 0.1) { const k = fr(t, m.an.escreve[0], m.an.escreve[1]); out.linhaParcial = { pag: 'hoje', i: 3, k }; const p = pontaEm(L[0], L[1], LIVRO.tam, x0, y0, k); segura({ ...p, ang: ANG_ESC }); return out; }
    const de = { x: fim.x + 20, y: fim.y - 30, ang: ANG_ESC };
    if (t < m.an.deita - 0.35) { segura(mix({ ...fim, ang: ANG_ESC }, de, suave(fr(t, m.an.escreve[1], m.an.escreve[1] + 0.15))), cliqueEm(t, m.an.tec)); return out; }
    if (t < m.an.deita) { segura(mix(de, REST_MESA, suave(fr(t, m.an.deita - 0.35, m.an.deita)))); return out; }
    const q = suave(fr(t, m.an.sai[0], m.an.sai[1]));
    larga(REST_MESA, q < 1 ? mix({ ...REST_MESA, x: REST_MESA.x + 30, y: REST_MESA.y + 40 }, FORA, q) : null);
    return out;
  }
  if (pl === 'volta') { out.caneta = mix(REST_TORTA, REST_MESA, suave(fr(t, m.vo.dedo, m.vo.reta))); return out; }
  if (pl === 'fim' || pl === 'leitura') { out.caneta = REST_MESA; return out; }
  if (pl === 'assina') {
    const [L1, L2] = FINAL, x0 = LIVRO.d.x0 + 70, y1 = linhaY(LINHA_FINAL), y2 = linhaY(LINHA_FINAL + 1);
    const pega = { ...REST_MESA, x: REST_MESA.x - 30, y: REST_MESA.y + 40 };
    if (t < m.as.pega) { larga(REST_MESA, mix(FORA, pega, suave(fr(t, m.b.assina, m.as.pega)))); return out; }
    const i1 = pontaEm(L1[0], L1[1], LIVRO.tam, x0, y1, 0);
    if (t < m.as.linha1[0]) { segura(mix(REST_MESA, { ...i1, x: i1.x + 10, y: i1.y - 26, ang: ANG_ESC }, suave(fr(t, m.as.pega, m.as.tec0 - 0.05))), cliqueEm(t, [m.as.tec0])); return out; }
    if (t < m.as.linha1[1]) { const k = fr(t, m.as.linha1[0], m.as.linha1[1]); out.linhaParcial = { pag: 'final', i: 0, k }; segura({ ...pontaEm(L1[0], L1[1], LIVRO.tam, x0, y1, k), ang: ANG_ESC }); return out; }
    const f1 = pontaEm(L1[0], L1[1], LIVRO.tam, x0, y1, 1), i2 = pontaEm(L2[0], L2[1], LIVRO.tam, x0, y2, 0);
    if (t < m.as.linha2[0]) { out.linhaParcial = { pag: 'final', i: 1, k: 0 }; const q = suave(fr(t, m.as.linha1[1], m.as.linha2[0])); segura({ x: lerp(f1.x, i2.x, q), y: lerp(f1.y, i2.y, q) - Math.sin(Math.PI * q) * 30, ang: ANG_ESC }); return out; }
    if (t < m.as.linha2[1]) { const k = fr(t, m.as.linha2[0], m.as.linha2[1]); out.linhaParcial = { pag: 'final', i: 1, k }; const p = pontaEm(L2[0], L2[1], LIVRO.tam, x0, y2, k); segura({ x: p.x + Math.sin(t * 47) * 2.5, y: p.y + Math.sin(t * 61) * 3, ang: ANG_ESC }); return out; }
    const f2 = pontaEm(L2[0], L2[1], LIVRO.tam, x0, y2, 1), de = { x: f2.x + 20, y: f2.y - 30, ang: ANG_ESC };
    if (t < m.as.deita - 0.4) { segura(mix({ ...f2, ang: ANG_ESC }, de, suave(fr(t, m.as.linha2[1], m.as.linha2[1] + 0.15))), cliqueEm(t, m.as.tec)); return out; }
    if (t < m.as.deita) { segura(mix(de, REST_FINAL, suave(fr(t, m.as.deita - 0.4, m.as.deita)))); return out; }
    if (t < m.as.sai[0]) { segura(REST_FINAL); return out; } // a mão fica um instante na caneta torta
    const q = suave(fr(t, m.as.sai[0], m.as.sai[1]));
    larga(REST_FINAL, q < 1 ? mix({ ...REST_FINAL, x: REST_FINAL.x + 30, y: REST_FINAL.y + 40 }, FORA, q) : null);
    return out;
  }
  return out;
}
function mesaMadeira(g) {
  g.fillStyle = '#6b4a34'; g.fillRect(-400, -400, 2720, 1900);
  for (let i = 0; i < 18; i++) traco(g, [[-400, -300 + i * 110 + (i % 3) * 14], [2320, -280 + i * 110]], 3, { seed: 1950 + i, tinta: '#5a3d2a', tremor: 0.3 });
}
function livroFechado(g, fita = true) {
  forma(g, [[LIVRO.d.x0 - 8, LIVRO.y0 - 22], [LIVRO.d.x1 + 26, LIVRO.y0 - 22], [LIVRO.d.x1 + 26, LIVRO.y1 + 22], [LIVRO.d.x0 - 8, LIVRO.y1 + 22]], '#24414a', { seed: 1992, linha: 6, reto: true });
  traco(g, [[LIVRO.d.x0 + 30, LIVRO.y0 - 22], [LIVRO.d.x0 + 30, LIVRO.y1 + 22]], 4, { seed: 1993, tinta: '#1a3038' });
  forma(g, [[LIVRO.d.x0 + 150, 430], [LIVRO.d.x1 - 110, 430], [LIVRO.d.x1 - 110, 610], [LIVRO.d.x0 + 150, 610]], '#e9e0c8', { seed: 1994, linha: 5, reto: true });
  g.save(); g.font = '46px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = TINTA;
  g.fillText('LIVRO DA', (LIVRO.d.x0 + LIVRO.d.x1 + 40) / 2, 490); g.fillText('PORTARIA', (LIVRO.d.x0 + LIVRO.d.x1 + 40) / 2, 552); g.restore();
  if (fita) traco(g, [[LIVRO.d.x0 + 200, LIVRO.y1 + 10], [LIVRO.d.x0 + 214, LIVRO.y1 + 70]], 14, { seed: 1995, tinta: '#a8323a' });
}
function cenaA(g, t, m) {
  const pl = planoEm(t), bl = pl.bloco, ini = pl.de;
  let cam = { z: lerp(1.0, 1.03, fr(t, ini, ini + 6)), cx: 960, cy: 560 };
  if (bl === 'gancho') cam = { z: lerp(1.04, 1.0, fr(t, ini, ini + 5.6)), cx: 960, cy: 560 };
  if (bl === 'ultimo') cam = { z: 1.3, cx: 1440, cy: 420 };
  if (bl === 'anota') cam = { z: 1.22, cx: 1330, cy: linhaY(2.5) };
  if (bl === 'leitura') {
    const u = t - ini, zoom = suave(fr(u, 0, 1.2)), desce = suave(fr(u, 1.0, 4.5)), abre = suave(fr(u, 5.0, 6.2));
    cam = { z: lerp(lerp(1.0, 1.55, zoom), 1.12, abre), cx: lerp(lerp(1000, 1320, zoom), 960, abre), cy: lerp(lerp(560, linhaY(4), zoom), 560, abre) + (linhaY(8.6) - linhaY(4)) * desce * (1 - abre) };
  }
  if (bl === 'assina') { const u = t - ini, entra = suave(fr(u, 1.0, 2.0)); cam = { z: lerp(1.0, 1.32, entra), cx: lerp(1000, 1290, entra), cy: lerp(560, linhaY(LINHA_FINAL + 0.5), entra) }; }
  const noite = bl === 'fim' || bl === 'leitura' || bl === 'assina';
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 1, () => {
    D.linhaK.k = 1 / cam.z;
    mesaMadeira(g);
    const est = escritaA(t, m);
    const parcial = (pag, i, k) => { const [txt, f, tam] = (pag === 'final' ? FINAL : PAG[pag].linhas)[i]; const L = LIVRO.d; escreve(g, txt, L.x0 + 70, linhaY(pag === 'final' ? LINHA_FINAL + i : i), f, tam || LIVRO.tam, k, pag === 'final' && i === 1 ? { treme: 1 } : {}); };
    if (bl === 'gancho') {
      const fl = m.g.folheia, n = fl.length;
      const dataDe = (i) => DATAS[Math.round((i * (DATAS.length - 1)) / (n - 1))];
      let feitas = 0, virando = -1, q = 0;
      fl.forEach((t0, i) => { if (t >= t0 + folhaDur(i)) feitas = i + 1; else if (t >= t0) { virando = i; q = fr(t, t0, t0 + folhaDur(i)); } });
      const ultimaFeita = feitas === n;
      livroAberto(g,
        () => { if (feitas === 0 && virando < 0) pagina(g, 'e', PAG.ontem); else if (ultimaFeita) { forma(g, [[LIVRO.e.x0, LIVRO.y0], [LIVRO.e.x1, LIVRO.y0], [LIVRO.e.x1, LIVRO.y1], [LIVRO.e.x0, LIVRO.y1]], '#b59a72', { seed: 1996, linha: 4, reto: true }); } else paginaAntiga(g, 'e', dataDe(Math.min(n - 1, (virando >= 0 ? virando : feitas) + 1)), false); },
        () => {
          if (feitas === 0) { const hoje = { ...PAG.hoje, linhas: PAG.hoje.linhas.slice(0, 1) }; pagina(g, 'd', { ...hoje, linhas: [] }); if (est.linhaParcial) parcial('hoje', 0, est.linhaParcial.k); else pagina(g, 'd', hoje); }
          else paginaAntiga(g, 'd', dataDe(feitas - 1), feitas === n);
        });
      if (virando >= 0) folhaVirando(g, q, 1997 + virando);
      if (t >= m.g.sai[0] - 0.35) { const k = fr(t, m.g.sai[0] - 0.35, fl[0]); const cx = LIVRO.e.x0 + 50, cy = LIVRO.y1 - 40; maoFolheia(g, lerp(cx - 300, cx, suave(k)), lerp(cy + 400, cy, suave(k)), t); }
    } else if (bl === 'ultimo' || bl === 'anota') {
      const ate = bl === 'ultimo' ? 1 : 3;
      livroAberto(g, () => pagina(g, 'e', PAG.ontem), () => { pagina(g, 'd', PAG.hoje, ate); if (est.linhaParcial) parcial('hoje', 3, est.linhaParcial.k); else if (bl === 'anota' && t > m.an.escreve[1]) escreve(g, PAG.hoje.linhas[3][0], LIVRO.d.x0 + 70, linhaY(3), 'Kalam', LIVRO.tam); }, { fita: true });
    } else if (bl === 'volta' || (bl === 'fim' && t < m.fi.abre[0])) {
      livroFechado(g);
    } else if (bl === 'fim') {
      const q = fr(t, m.fi.abre[0], m.fi.abre[1]), qq = suave(q);
      livroAberto(g, () => { if (qq >= 1) pagina(g, 'e', PAG.ontem); else mesaMadeira2(g); }, () => pagina(g, 'd', PAG.hoje), { fita: true });
      if (qq < 1) { // o bloco de páginas com a capa vira da direita para a esquerda
        const a = Math.PI * qq, ex = LIVRO.lomba + Math.cos(a) * 726;
        const capaFora = qq < 0.5;
        forma(g, [[LIVRO.lomba, LIVRO.y0 - 22], [ex, LIVRO.y0 - 22 - Math.sin(a) * 40], [ex, LIVRO.y1 + 22 + Math.sin(a) * 30], [LIVRO.lomba, LIVRO.y1 + 22]], capaFora ? '#24414a' : '#efe3c4', { seed: 1998, linha: 6 });
      }
    } else if (bl === 'leitura') {
      const q = fr(t, m.le.vira[0], m.le.vira[1]), qq = suave(q);
      if (t < m.le.vira[0]) livroAberto(g, () => pagina(g, 'e', PAG.ontem), () => pagina(g, 'd', PAG.hoje), { fita: true });
      else if (qq < 1) {
        livroAberto(g, () => pagina(g, 'e', PAG.ontem), () => pagina(g, 'd', PAG.depois), { fita: true });
        const f = folhaVirando(g, 1 - qq, 1999);
        if (qq < 0.5) { /* a frente da folha (hoje) ainda à direita: só papel */ }
      } else livroAberto(g, () => pagina(g, 'e', PAG.verso), () => pagina(g, 'd', PAG.depois));
    } else if (bl === 'assina') {
      livroAberto(g, () => pagina(g, 'e', PAG.verso), () => {
        pagina(g, 'd', PAG.depois);
        const lp = est.linhaParcial;
        if (lp) { if (lp.i === 1) parcial('final', 0, 1); parcial('final', lp.i, lp.k); }
        else if (t >= m.as.linha2[1]) { parcial('final', 0, 1); parcial('final', 1, 1); }
      });
    }
    // caneta solta e mão
    if (est.caneta) P.caneta(g, est.caneta.x, est.caneta.y, est.caneta.ang);
    if (est.mao) P.maoEscreve(g, est.mao.x, est.mao.y, { ang: est.mao.ang, clique: est.mao.clique, solta: est.mao.comCaneta ? 0 : 1 });
    // o dedo endireita a caneta (último dia; volta do almoço)
    if (bl === 'ultimo' || bl === 'volta') {
      const [dedo, reta, s0, s1] = bl === 'ultimo' ? [m.ul.dedo, m.ul.reta, m.ul.sai[0], m.ul.sai[1]] : [m.vo.dedo, m.vo.reta, m.vo.reta + 0.1, m.vo.reta + 0.6];
      const c = est.caneta, fim = { x: c.x + Math.cos(c.ang) * 250, y: c.y + Math.sin(c.ang) * 250 };
      const vem = suave(fr(t, dedo - 0.5, dedo)), vai = suave(fr(t, s0, s1));
      if (vai < 1) maoDedo(g, lerp(lerp(fim.x + 500, fim.x, vem), fim.x + 500, vai), lerp(lerp(fim.y + 600, fim.y + 8, vem), fim.y + 600, vai));
    }
    // a mão que abre a capa (fim) e a que vira a página (leitura)
    if (bl === 'fim' && t >= m.fi.corteA) {
      const q = suave(fr(t, m.fi.abre[0], m.fi.abre[1])), a = Math.PI * q, ex = LIVRO.lomba + Math.cos(a) * 726;
      const vem = suave(fr(t, m.fi.corteA, m.fi.pegaCapa)), vai = suave(fr(t, m.fi.abre[1] + 0.05, m.fi.abre[1] + 0.6));
      const borda = { x: q > 0 ? ex : LIVRO.d.x1 + 20, y: 700 };
      if (vai < 1) maoAberta(g, lerp(lerp(borda.x + 400, borda.x, vem), borda.x - 300, vai), lerp(lerp(borda.y + 500, borda.y, vem), borda.y + 600, vai), q > 0.5 ? -0.8 : -2.4);
    }
    if (bl === 'leitura') {
      const q = suave(fr(t, m.le.vira[0], m.le.vira[1])), a = Math.PI * q, ex = LIVRO.lomba + Math.cos(a) * 700;
      const vem = suave(fr(t, m.le.pegaPagina - 0.35, m.le.pegaPagina)), vai = suave(fr(t, m.le.vira[1] + 0.05, m.le.vira[1] + 0.5));
      const canto = { x: q > 0 ? ex : LIVRO.d.x1 - 20, y: LIVRO.y1 - 30 };
      if (t > m.le.pegaPagina - 0.4 && vai < 1) maoAberta(g, lerp(lerp(canto.x + 380, canto.x, vem), canto.x - 300, vai), lerp(lerp(canto.y + 420, canto.y, vem), canto.y + 600, vai), q > 0.5 ? -0.8 : -2.4);
    }
    D.linhaK.k = 1;
    // luz: abajur âmbar à esquerda (de noite manda no quadro), dia mais frio
    luz(g, 700, 300, 1500, noite ? '#ffe2b0' : '#fff6e6', noite ? '#3a2c3a' : '#4a4a5c');
    brilho(g, 260, 140, 900, '#ffcf8a', noite ? 0.28 : 0.12);
  });
}
function mesaMadeira2(g) { g.save(); g.beginPath(); g.rect(LIVRO.e.x0 - 30, LIVRO.y0 - 30, LIVRO.e.x1 - LIVRO.e.x0 + 40, LIVRO.y1 - LIVRO.y0 + 60); g.clip(); mesaMadeira(g); g.restore(); }

// ---------------------------------------------------------------- B · o saguão
// luz do dia: manhã (sol entrando pela porta), tarde (o sol anda e esquenta), 18:00 (anoitece, o abajur manda)
function luzDia(t) {
  const bl = planoEm(t).bloco;
  if (['tarde'].includes(bl)) { const q = fr(t, M.b.tarde, M.b.fim); return { sol: lerp(0.9, 0.35, q), anda: q, quente: q, noite: 0.55 * suave(fr(q, 0.6, 1)) }; }
  if (['fim', 'sai', 'leitura', 'assina'].includes(bl)) return { sol: 0, anda: 1, quente: 1, noite: 0.62 };
  if (['volta'].includes(bl)) return { sol: 0.9, anda: 0, quente: 0.1, noite: 0 };
  return { sol: 1, anda: 0, quente: 0, noite: 0 };
}
function horaEm(t) { // minutos desde a meia-noite
  const bl = planoEm(t).bloco, hm = (h, mi) => h * 60 + mi;
  const tabela = { manha: hm(6, 59), caio: hm(7, 40), porta: hm(7, 41), ultimo: hm(7, 42), lurdes: hm(8, 11), ninguem: hm(8, 12), volta: hm(13, 0), fim: hm(18, 0), sai: hm(18, 2), seguinte: hm(6, 59), interfone: hm(7, 0), resposta: hm(7, 1) };
  if (bl === 'tarde') return lerp(hm(13, 1), hm(17, 59), suave(fr(t, M.b.tarde + 0.3, M.b.fim - 0.2)));
  if (bl === 'fim') return t < M.fi.relogio ? hm(17, 59) : hm(18, 0);
  return tabela[bl] ?? hm(7, 0);
}
function relogio(g, t) {
  const { x, y, r } = RELOGIO, min = horaEm(t);
  forma(g, elipsePts(x, y, r + 8, r + 8, 16), '#3a3446', { seed: 1700, linha: 5 });
  forma(g, elipsePts(x, y, r, r, 16), '#efe9dc', { seed: 1701, linha: 4 });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; traco(g, [[x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82], [x + Math.cos(a) * r * 0.94, y + Math.sin(a) * r * 0.94]], 3, { seed: 1702 + i, tremor: 0.2 }); }
  const ah = ((min / 60) % 12) / 12 * Math.PI * 2 - Math.PI / 2, am = ((min % 60) / 60) * Math.PI * 2 - Math.PI / 2;
  traco(g, [[x, y], [x + Math.cos(ah) * r * 0.5, y + Math.sin(ah) * r * 0.5]], 7, { seed: 1720, tremor: 0.3 });
  traco(g, [[x, y], [x + Math.cos(am) * r * 0.78, y + Math.sin(am) * r * 0.78]], 5, { seed: 1721, tremor: 0.3 });
}
// portas: elevador (abertura 0..1) e porta de vidro de correr (abertura 0..1)
function aberturaElevador(t) {
  const bl = planoEm(t).bloco, m = M;
  const ab = (a, b, f) => suave(fr(t, a, b)) * (1 - suave(fr(t, f, f + 0.8)));
  if (bl === 'caio') return ab(m.c.abre, m.c.aberta, m.c.fecha);
  if (bl === 'lurdes') return ab(m.l.abre, m.l.aberta, m.l.fecha);
  if (bl === 'interfone') return ab(m.it.abre, m.it.aberta, m.it.fecha);
  return 0;
}
function aberturaPorta(t) {
  const bl = planoEm(t).bloco, m = M;
  const ab = (a, b, f, ff) => suave(fr(t, a, b)) * (1 - suave(fr(t, f, ff)));
  if (bl === 'porta') return ab(m.pt.abre, m.pt.aberta, m.pt.fecha, m.pt.fechada);
  if (bl === 'lurdes' || bl === 'ninguem') return ab(m.l.abre, m.l.aberta, m.l.fechaPorta, m.l.fechada);
  if (bl === 'sai') return ab(m.sa.abre, m.sa.aberta, m.sa.fecha, m.sa.fechada);
  if (bl === 'interfone' || bl === 'resposta') return ab(m.it.abrePorta, m.it.portaAberta, m.it.fechaPorta, m.it.portaFechada);
  return 0;
}
// lá fora, pela porta de vidro: calçada, rua e o prédio da frente
function rua(g, x0, x1, y0, y1, ld) {
  const dia = 1 - ld.noite;
  g.fillStyle = ld.noite > 0.3 ? '#2a3150' : (ld.quente > 0.4 ? '#e6b98a' : '#cfd9e6'); g.fillRect(x0, y0, x1 - x0, y1 - y0); // céu e prédio da frente
  forma(g, [[x0 - 20, y0 + 40], [x1 + 20, y0 + 40], [x1 + 20, 640], [x0 - 20, 640]], ld.noite > 0.3 ? '#3b3a55' : '#b9a690', { seed: 1800, linha: 4, reto: true });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
    const wx = x0 + 30 + i * 72, wy = y0 + 80 + j * 120;
    forma(g, [[wx, wy], [wx + 44, wy], [wx + 44, wy + 70], [wx, wy + 70]], ld.noite > 0.3 ? ((i + j) % 2 ? '#f5d58a' : '#4a4a66') : '#8fa3b8', { seed: 1801 + i * 3 + j, linha: 3, reto: true });
  }
  g.fillStyle = '#5c5c66'; g.fillRect(x0, 640, x1 - x0, 60); // rua
  g.fillStyle = '#9a958c'; g.fillRect(x0, 700, x1 - x0, 100); // calçada
  traco(g, [[x0, 700], [x1, 700]], 4, { seed: 1810 });
  g.fillStyle = `rgba(255,236,190,${0.25 * dia})`; g.fillRect(x0, y0, x1 - x0, y1 - y0);
}
function portaVidro(g, t, ld, fora) {
  const { x0, x1, y0, chao, cx } = PORTA, ab = aberturaPorta(t), w = (x1 - x0) / 2;
  forma(g, [[x0 - 26, y0 - 26], [x1 + 26, y0 - 26], [x1 + 26, chao], [x0 - 26, chao]], '#55596a', { seed: 1820, linha: 6, reto: true });
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, chao - y0); g.clip();
  rua(g, x0, x1, y0, chao, ld);
  fora(); // quem está lá fora
  // folhas de vidro: correm para os lados
  for (const s of [-1, 1]) {
    const a = s < 0 ? x0 - ab * w * 0.96 : cx + ab * w * 0.96, b = a + w;
    g.fillStyle = 'rgba(205,225,240,0.22)'; g.fillRect(a, y0, w, chao - y0);
    g.save(); g.globalAlpha = 0.28; traco(g, [[a + 30, y0 + 40], [a + 110, y0 + 200]], 10, { seed: 1830 + s, tinta: '#ffffff', tremor: 0.2 }); traco(g, [[a + 60, y0 + 260], [a + 120, y0 + 360]], 6, { seed: 1832 + s, tinta: '#ffffff', tremor: 0.2 }); g.restore();
    forma(g, [[a, y0], [b, y0], [b, chao], [a, chao]], null, { seed: 1834 + s, linha: 6, reto: true, fechado: true });
    traco(g, [[s < 0 ? b - 22 : a + 22, 500], [s < 0 ? b - 22 : a + 22, 600]], 8, { seed: 1836 + s, tinta: '#c9ced8' });
  }
  g.restore();
}
function elevador(g, t, dentro) {
  const { x0, x1, y0, chao, cx } = ELEV, ab = aberturaElevador(t), w = (x1 - x0) / 2;
  forma(g, [[x0 - 30, y0 - 30], [x1 + 30, y0 - 30], [x1 + 30, chao], [x0 - 30, chao]], '#6d7486', { seed: 1840, linha: 6, reto: true });
  forma(g, [[cx - 54, y0 - 82], [cx + 54, y0 - 82], [cx + 54, y0 - 42], [cx - 54, y0 - 42]], '#1a1a22', { seed: 1841, linha: 4, reto: true });
  const bl = planoEm(t).bloco, desce = (bl === 'caio' && t < M.c.plim) || (bl === 'lurdes' && t < M.l.plim) || (bl === 'interfone' && t < M.it.plim);
  g.save(); g.font = '30px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffb347'; g.fillText(desce ? '2' : 'T', cx, y0 - 61); g.restore();
  if (ab > 0.01) {
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, chao - y0); g.clip();
    g.fillStyle = '#c3ccd8'; g.fillRect(x0, y0, x1 - x0, chao - y0);
    traco(g, [[x0, 640], [x1, 640]], 6, { seed: 1842, tinta: '#e4e9ef' });
    dentro();
    brilho(g, cx, y0 + 60, 260, '#eef6ff', 0.3);
    g.restore();
  }
  for (const s of [-1, 1]) {
    const a = s < 0 ? x0 - ab * w * 0.96 : cx + ab * w * 0.96;
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, chao - y0); g.clip();
    forma(g, [[a, y0], [a + w, y0], [a + w, chao], [a, chao]], '#9aa3b4', { seed: 1843 + s, linha: 5, reto: true });
    g.restore();
  }
}
// balcão aberto embaixo: o banco e as pernas dele aparecem
function banco(g) {
  const s = sAS(), y = ARL.yPe, assento = y - 200 * s;
  forma(g, elipsePts(ARL.x, assento, 70, 14, 12), '#3b3030', { seed: 1850, linha: 4 });
  for (const dx of [-50, 50]) traco(g, [[ARL.x + dx * 0.8, assento + 8], [ARL.x + dx, y - 2]], 7, { seed: 1851 + dx, tinta: '#2a2226' });
  traco(g, [[ARL.x - 44, y - 60], [ARL.x + 44, y - 60]], 5, { seed: 1853, tinta: '#2a2226' });
}
function balcao(g, t) {
  const { x0, x1, topoTras, topoFrente, base, peFrente, peTras } = MESA;
  for (const x of [x0 + 26, x1 - 26]) forma(g, [[x - 9, base], [x + 9, base], [x + 9, peTras], [x - 9, peTras]], '#4a3324', { seed: 1860 + x, linha: 4, reto: true }); // pés de trás
  forma(g, [[x0 + 14, topoTras], [x1 - 14, topoTras], [x1, topoFrente], [x0, topoFrente]], '#8a5e3e', { seed: 1862, linha: 5, reto: true });
  forma(g, [[x0, topoFrente], [x1, topoFrente], [x1, base], [x0, base]], '#6b4a34', { seed: 1863, linha: 5, reto: true });
  for (const x of [x0 + 18, x1 - 18]) forma(g, [[x - 12, base], [x + 12, base], [x + 12, peFrente], [x - 12, peFrente]], '#5a3d2a', { seed: 1864 + x, linha: 5, reto: true });
  // em cima: abajur, livro, caixinha do botão da porta
  const ax = ABAJUR.x;
  forma(g, elipsePts(ax, topoTras + 12, 36, 9, 10), '#3a2c2a', { seed: 1866, linha: 4 });
  traco(g, [[ax, topoTras + 8], [ax + 6, topoTras - 110]], 7, { seed: 1867, tinta: '#3a2c2a' });
  forma(g, [[ax - 44, topoTras - 180], [ax + 52, topoTras - 180], [ax + 72, topoTras - 110], [ax - 64, topoTras - 110]], '#f2c46b', { seed: 1868, linha: 5 });
  const aberto = livroAbertoB(t);
  if (aberto) { forma(g, [[LIVRO_B.x - 92, LIVRO_B.y - 10], [LIVRO_B.x + 92, LIVRO_B.y - 10], [LIVRO_B.x + 100, LIVRO_B.y + 4], [LIVRO_B.x - 100, LIVRO_B.y + 4]], '#f3ead2', { seed: 1869, linha: 4, reto: true }); traco(g, [[LIVRO_B.x, LIVRO_B.y - 10], [LIVRO_B.x, LIVRO_B.y + 4]], 2.5, { seed: 1870, tinta: '#b9a98a' }); }
  else forma(g, [[LIVRO_B.x - 40, LIVRO_B.y - 12], [LIVRO_B.x + 48, LIVRO_B.y - 12], [LIVRO_B.x + 52, LIVRO_B.y + 4], [LIVRO_B.x - 44, LIVRO_B.y + 4]], '#24414a', { seed: 1871, linha: 4, reto: true });
  const aceso = [M.pt.botao, M.l.botao, M.sa.botao, M.it.botao].some((b) => t >= b && t < b + 0.6) || (t >= M.it.interfone && t < M.it.interfone + 0.7);
  forma(g, [[BOTAO.x - 22, BOTAO.y - 12], [BOTAO.x + 22, BOTAO.y - 12], [BOTAO.x + 24, BOTAO.y + 4], [BOTAO.x - 24, BOTAO.y + 4]], '#8a92a3', { seed: 1872, linha: 4, reto: true });
  g.fillStyle = aceso ? '#ff7a5a' : '#c9473a'; g.beginPath(); g.ellipse(BOTAO.x, BOTAO.y - 9, 9, 5, 0, 0, 7); g.fill(); g.lineWidth = 2.5; g.strokeStyle = TINTA; g.stroke();
}
function livroAbertoB(t) { const bl = planoEm(t).bloco; return !['volta', 'tarde', 'fim'].includes(bl); }

// ---------------------------------------------------------------- quem está no saguão e como
const chaveV = (t, ks) => D.chave(t, ks);
const piscaEm = (t, lista) => lista.reduce((a, t0) => a + pulso(t, t0, 0.07), 0);
// o Seu Arlindo sentado: mãos no colo (embaixo do balcão aberto); vai ao botão; olha quem passa
const COLO = [{ x: -46, y: -196 }, { x: 46, y: -196 }];
const noBotao = () => ({ x: (BOTAO.x - ARL.x) / sAS(), y: (BOTAO.y - 8 - ARL.yPe) / sAS() });
function vaiAoBotao(t, tb, ida = 0.4, volta = 0.45) {
  const v = suave(fr(t, tb - ida, tb)) * (1 - suave(fr(t, tb + 0.15, tb + 0.15 + volta)));
  const b = noBotao(); return v > 0 ? { x: lerp(COLO[1].x, b.x, v), y: lerp(COLO[1].y, b.y, v) } : null;
}
function poseArlindoB(t, m) {
  const bl = planoEm(t).bloco;
  const p = { sentado: true, olhoX: 0, olhoY: 0.45, pupila: 0.55, palpS: 0.2, maos: [COLO[0], COLO[1]] };
  let olhar = [[0, 0, 0.45]];
  if (bl === 'manha') olhar = [[m.b.manha, 0, 0.5], [m.ma.olhaElev, 0, 0.5], [m.ma.olhaElev + 0.2, 0.75, -0.2]];
  if (bl === 'caio') olhar = [[m.b.caio, 0.75, -0.2], [m.c.vem.t1, 0.85, -0.3], [m.c.letras[0], 0.9, -0.4], [m.c.caem[0] + 0.3, 0.9, -0.4], [m.c.caem[0] + 0.5, 0.85, 0.7], [m.c.foneBota[0], 0.85, 0.6], [m.c.foneBota[0] + 0.3, 0.9, -0.3]];
  if (bl === 'porta') olhar = [[m.b.porta, 0.9, -0.3], [m.b.porta + 1.5, 0.95, -0.1], [m.pt.fecha, 0.95, 0], [m.pt.fecha + 0.4, 0.2, 0.5]];
  if (bl === 'lurdes') olhar = [[m.b.lurdes, 0.2, 0.5], [m.l.plim + 0.25, 0.8, -0.1], [m.l.vem.t1, 0.9, -0.35], [m.l.caem[0], 0.9, -0.1], [m.l.caem[0] + 0.3, 0.85, 0.2], [m.l.ateL, 0.9, -0.35], [m.l.botao + 0.2, 0.95, -0.15]];
  if (bl === 'ninguem') olhar = [[m.b.ninguem, 0.95, -0.15], [m.l.quase[0], 0.95, -0.1], [m.l.sai.t0 + 1.0, 0.95, 0], [m.ng.olhaLetras, 0.95, 0], [m.ng.olhaLetras + 0.3, 0.75, 0.75]];
  if (bl === 'volta') olhar = [[m.b.volta, 0.1, 0.4], [m.vo.olhaLivro, 0, 0.7], [m.vo.voltaB + 0.3, 0, 0.6], [m.vo.voltaB + 0.6, -0.8, 0], [m.vo.voltaB + 1.3, -0.8, 0], [m.vo.voltaB + 1.6, 0.9, -0.1], [m.vo.voltaB + 2.3, 0.9, 0.2], [m.vo.voltaB + 2.5, 0.75, 0.75]];
  if (bl === 'tarde') olhar = [[m.b.tarde, 0.6, 0.6], [m.b.tarde + 2, 0.1, 0.2], [m.b.tarde + 3.5, 0.9, -0.1]];
  if (bl === 'fim') olhar = [[m.b.fim, 0.6, 0.3], [m.fi.relogio + 0.25, -0.15, -0.9], [m.fi.relogio + 1.0, -0.15, -0.9], [m.fi.relogio + 1.3, 0, 0.75]];
  const k = olhar.map(([t0, x]) => [t0, x]), ky = olhar.map(([t0, , y]) => [t0, y]);
  p.olhoX = chaveV(t, k); p.olhoY = chaveV(t, ky);
  // botão da porta (mão direita da tela)
  for (const tb of [m.pt.botao, m.l.botao]) { const h = vaiAoBotao(t, tb); if (h) { p.maos[1] = h; p.gesto = 'Arlindo: botão'; } }
  // fala "Bom dia." / "Até amanhã."
  p.abre = 0.25 * (Math.sin(Math.PI * fr(t, m.c.bomdiaA - 0.2, m.c.bomdiaA + 0.15)) + Math.sin(Math.PI * fr(t, m.l.ateA - 0.2, m.l.ateA + 0.15)));
  // sorriso curto nos encaixes; triste quando as letras caem
  const sorri = Math.max(suave(fr(t, m.c.encaixe, m.c.encaixe + 0.3)) * (1 - suave(fr(t, m.c.corteC, m.c.corteC + 0.1))), suave(fr(t, m.l.encaixe, m.l.encaixe + 0.3)) * (1 - suave(fr(t, m.l.encaixe + 1.0, m.l.encaixe + 1.5))));
  p.cantoE = 3 * sorri; p.cantoD = 3 * sorri;
  const pena = suave(fr(t, m.c.caem[0] + 0.5, m.c.caem[0] + 1)) * (1 - suave(fr(t, m.c.foneBota[1], m.c.foneBota[1] + 0.5))) + suave(fr(t, m.ng.olhaLetras + 0.3, m.ng.olhaLetras + 0.8)) * (bl === 'ninguem' ? 1 : 0);
  p.sobrInc = 0.6 * Math.min(1, pena);
  if (bl === 'fim') { const vai = suave(fr(t, m.fi.maosLivro - 0.4, m.fi.maosLivro)); const lv = { x: (LIVRO_B.x - ARL.x) / sAS(), y: (LIVRO_B.y - 6 - ARL.yPe) / sAS() }; p.maos = [{ x: lerp(COLO[0].x, lv.x - 40, vai), y: lerp(COLO[0].y, lv.y, vai) }, { x: lerp(COLO[1].x, lv.x + 40, vai), y: lerp(COLO[1].y, lv.y, vai) }]; p.gesto = 'Arlindo: livro'; }
  if (bl === 'tarde') p.dy = 2 * Math.sin(t * 1.6);
  p.palpS = 0.2 + piscaEm(t, [m.b.manha + 0.8, m.c.encaixe + 0.5, m.pt.fechada + 0.2, m.l.vem.t1 + 0.3, m.b.ninguem + 2, m.b.volta + 0.3, m.b.tarde + 1.2, m.b.tarde + 3.9, m.b.fim + 0.2]);
  return p;
}
// sacola da Lurdes (local): pendurada, erguida embaixo das letras, de volta
function sacolaLurdes(t, m) { // a mão esquerda abre a boca da sacola embaixo das letras e solta depois
  const q = suave(fr(t, m.l.levaSacola[0], m.l.levaSacola[1])) * (1 - suave(fr(t, m.l.voltaSacola[0], m.l.voltaSacola[1])));
  return { x: SACOLA.x + 6 * q, y: SACOLA.y - 10 * q, frente: false, aberta: q, rot: 0.12 * q };
}
// lista do quadro: {vista, x, yPe, pose, fora (lá fora), elev (dentro do elevador), sacola}
function genteB(t, m) {
  const bl = planoEm(t).bloco, out = [];
  const arl = (pose) => out.push({ vista: 'arlindoFrente', x: ARL.x, yPe: ARL.yPe, pose, sentado: true });
  if (['manha', 'caio', 'porta', 'lurdes', 'ninguem', 'volta', 'tarde', 'fim'].includes(bl)) arl(poseArlindoB(t, m));
  // ---- Caio
  if (bl === 'caio') {
    const w = ondeEsta(m.c.vem, t);
    const pose = { fone: 0, olhoX: -0.6, olhoY: 0.2, pupila: 0.5, passo: w.passo, bob: t < m.c.bomdiaA + 0.3 ? 0.05 * Math.sin((2 * Math.PI * t) / 0.6) : 0 };
    // ouve o "Bom dia." e tira o fone na hora; depois põe de volta
    const [a, b] = m.c.foneTira, [c, d] = m.c.foneBota;
    const tira = suave(fr(t, a + 0.15, b - 0.2)), poe = suave(fr(t, c + 0.2, d - 0.15));
    pose.fone = tira * (1 - poe);
    const f = P.foneEm(pose.fone), concha = { x: f.x + 6, y: f.y + 14 };
    const sobe1 = suave(fr(t, a, a + 0.15)) * (1 - suave(fr(t, b - 0.2, b))), sobe2 = suave(fr(t, c, c + 0.2)) * (1 - suave(fr(t, d - 0.15, d)));
    const sobe = Math.max(sobe1, sobe2);
    if (sobe > 0) { pose.maos = [null, { x: lerp(30, concha.x, sobe), y: lerp(-334, concha.y, sobe) }]; pose.gesto = 'Caio: fone'; }
    pose.olhoX = chaveV(t, [[m.b.caio, 0], [m.c.vem.t1 - 0.6, -0.5], [m.c.bomdiaA + 0.1, -0.85], [m.c.encaixe + 0.4, -0.85], [m.c.voltaB, -0.6], [m.c.olhaChao, -0.6], [m.c.foneBota[0], -0.3], [m.c.foneBota[1], 0.2]]);
    pose.olhoY = chaveV(t, [[m.b.caio, 0.2], [m.c.bomdiaA + 0.1, 0.1], [m.c.voltaB, 0.3], [m.c.olhaChao, 0.9], [m.c.foneBota[0] + 0.2, 0.9], [m.c.foneBota[1], 0.3]]);
    pose.sobrInc = 0.5 * suave(fr(t, m.c.voltaB, m.c.voltaB + 0.4));
    pose.abre = 0.22 * Math.sin(Math.PI * fr(t, m.c.bomdiaC - 0.2, m.c.bomdiaC + 0.15));
    pose.cantoE = 2 * suave(fr(t, m.c.encaixe, m.c.encaixe + 0.3)) * (1 - suave(fr(t, m.c.voltaB, m.c.voltaB + 0.3)));
    pose.cantoD = pose.cantoE;
    pose.palpS = 0.15 + piscaEm(t, [m.c.vem.t1 + 0.2, m.c.encaixe + 0.6, m.c.foneBota[1] + 0.3]);
    out.push({ vista: 'caioFrente', x: w.x, yPe: w.yPe, pose, elev: t < m.c.vem.t0 + 0.2 });
  }
  if (bl === 'porta') {
    const w = ondeEsta(m.pt.vai, t);
    if (w.x < 2000) out.push({ vista: 'caioCostas', x: w.x, yPe: w.yPe, pose: { passo: w.passo, fone: 0 }, fora: w.yPe < 800 });
  }
  // ---- Lurdes
  if (bl === 'lurdes' && t < m.l.vai.t0) {
    const w = ondeEsta(m.l.vem, t), sc = sacolaLurdes(t, m);
    const pose = { olhoX: -0.3, olhoY: 0.1, pupila: 0.5, passo: w.passo, sacola: false, chaves: false };
    const alvoSac = { x: sc.x + 12, y: sc.y - 4 }; // a mão na boca da sacola
    const pega = suave(fr(t, m.l.pegaSacola[0], m.l.pegaSacola[1])), solta = suave(fr(t, m.l.soltaSacola[0], m.l.soltaSacola[1]));
    if (pega > 0 && solta < 1) { const q = pega * (1 - solta); pose.maos = [{ x: lerp(-92, alvoSac.x, q), y: lerp(-190, alvoSac.y, q) }, { x: 92, y: -192 }]; pose.gesto = 'Lurdes: sacola'; }
    pose.olhoX = chaveV(t, [[m.b.lurdes, 0.2], [m.l.vem.t1 - 0.8, -0.6], [m.l.voltaB, -0.5], [m.l.levaSacola[0], -0.3], [m.l.caem[0], -0.4], [m.l.ateL, -0.85], [m.l.encaixe + 0.5, -0.85], [m.l.encaixe + 0.8, -0.2]]);
    pose.olhoY = chaveV(t, [[m.b.lurdes, 0.1], [m.l.voltaB, 0.5], [m.l.levaSacola[0], 0.8], [m.l.voltaSacola[1], 0.5], [m.l.ateL, -0.1]]);
    pose.sobrInc = 0.5 * suave(fr(t, m.l.voltaB, m.l.voltaB + 0.3)) * (1 - suave(fr(t, m.l.encaixe, m.l.encaixe + 0.4)));
    pose.abre = 0.22 * Math.sin(Math.PI * fr(t, m.l.ateL - 0.2, m.l.ateL + 0.15));
    pose.cantoE = -2 * pose.sobrInc + 2 * suave(fr(t, m.l.encaixe, m.l.encaixe + 0.3)); pose.cantoD = pose.cantoE;
    pose.palpS = piscaEm(t, [m.l.vem.t1 + 0.3, m.l.voltaSacola[1] + 0.2, m.l.encaixe + 0.5]);
    out.push({ vista: 'lurdesFrente', x: w.x, yPe: w.yPe, pose, elev: t < m.l.vem.t0 + 0.2, sacola: sc });
  }
  if ((bl === 'lurdes' && t >= m.l.vai.t0) || bl === 'ninguem') {
    let w = ondeEsta(m.l.vai, t); let cab = 0;
    if (t >= m.l.para) { const q = Math.sin(Math.PI * fr(t, m.l.quase[0], m.l.quase[1])); cab = 0.1 * q; }
    if (t >= m.l.sai.t0) w = ondeEsta(m.l.sai, t);
    if (w.x < 2000) out.push({ vista: 'lurdesCostas', x: w.x, yPe: w.yPe, pose: { passo: w.passo, cabRot: cab, dy: 0 }, fora: w.yPe < 800 });
  }
  // ---- ele sai (com o quepe na mão)
  if (bl === 'sai') {
    if (t < m.sa.vai.t0) {
      const h = suave(fr(t, m.sa.botao - 0.4, m.sa.botao)) * (1 - suave(fr(t, m.sa.botao + 0.15, m.sa.botao + 0.5)));
      const bt = { x: (BOTAO.x - 560) / esc('arlindoFrente', 880), y: (BOTAO.y - 8 - 880) / esc('arlindoFrente', 880) };
      out.push({ vista: 'arlindoFrente', x: 560, yPe: 880, pose: { quepe: 'mao', olhoX: 0.6, olhoY: 0.5, maos: [null, h > 0 ? { x: lerp(90, bt.x, h), y: lerp(-238, bt.y, h) } : null], gesto: 'Arlindo: botão (de pé)' }, atras: true });
    } else {
      const w = ondeEsta(m.sa.vai, t);
      if (w.x < 2000) out.push({ vista: 'arlindoCostas', x: w.x, yPe: w.yPe, pose: { passo: w.passo, quepe: 'mao' }, fora: w.yPe < 800, atras: w.yPe < MESA.peFrente });
    }
  }
  // ---- manhã seguinte: ele lá fora; a Lurdes desce e abre a porta
  if (bl === 'interfone' || bl === 'resposta') {
    let w = { x: PORTA.cx - 30, yPe: 790, passo: null };
    if (t >= m.it.entra.t0) w = ondeEsta(m.it.entra, t);
    const ap = { civil: true, passo: w.passo, olhoX: 0, olhoY: 0.1, pupila: 0.55, palpS: 0.2, maos: [null, null] };
    const toca = suave(fr(t, m.it.interfone - 0.4, m.it.interfone)) * (1 - suave(fr(t, m.it.interfone + 0.25, m.it.interfone + 0.7)));
    if (toca > 0) { ap.maos[1] = { x: lerp(90, 196, toca), y: lerp(-238, -330, toca) }; ap.gesto = 'Arlindo: interfone'; }
    ap.olhoX = chaveV(t, [[m.b.interfone, 0], [m.it.plim + 0.2, -0.5], [m.it.voltaB, -0.6], [m.it.entra.t1 - 0.3, -0.85]]);
    ap.olhoY = chaveV(t, [[m.b.interfone, 0.1], [m.it.voltaB, 0.2], [m.it.entra.t1 - 0.3, 0.3]]);
    if (bl === 'resposta') {
      const of = suave(fr(t, m.rs.oferece[0], m.rs.oferece[1]));
      const solta = suave(fr(t, m.rs.solta, m.rs.solta + 0.5));
      const s = esc('arlindoFrente', w.yPe), troca = { x: (TROCA.x - w.x) / s, y: (TROCA.y - w.yPe) / s };
      ap.maos[0] = { x: lerp(-90, troca.x, of * (1 - solta)), y: lerp(-238, troca.y, of * (1 - solta)) }; ap.gesto = 'Arlindo: oferece o pão';
      ap.abre = 0.22 * Math.sin(Math.PI * fr(t, m.rs.bomdiaA - 0.2, m.rs.bomdiaA + 0.15));
      ap.cantoE = ap.cantoD = 4 * suave(fr(t, m.rs.encaixe, m.rs.encaixe + 0.4));
      ap.olhoX = -0.85; ap.olhoY = 0.3;
    }
    out.push({ vista: 'arlindoFrente', x: w.x, yPe: w.yPe, pose: ap, fora: w.yPe < 800, saco: true });
    if (t >= m.it.plim) {
      const lw = ondeEsta(m.it.vem, t);
      const lp = { olhoX: 0, olhoY: 0.1, pupila: 0.5, passo: lw.passo, sacola: false, chaves: false, maos: [{ x: -92, y: -190 }, { x: 92, y: -192 }] };
      lp.olhoX = chaveV(t, [[m.it.plim, 0], [m.it.vem.t0 + 0.6, 0.9], [m.it.vem.t1, 0.9], [m.it.botao - 0.5, -0.6], [m.it.botao + 0.3, 0.9]]);
      lp.olhoY = chaveV(t, [[m.it.plim, 0.1], [m.it.botao - 0.5, 0.4], [m.it.botao + 0.3, 0]]);
      lp.sobr = 0.6 * suave(fr(t, m.it.vem.t0 + 0.6, m.it.vem.t0 + 0.9)) * (1 - suave(fr(t, m.it.vem.t1, m.it.vem.t1 + 0.5)));
      const s = sL(), bt = { x: (BOTAO.x - lw.x) / s, y: (BOTAO.y - 8 - lw.yPe) / s };
      const vai = suave(fr(t, m.it.botao - 0.45, m.it.botao)) * (1 - suave(fr(t, m.it.botao + 0.2, m.it.botao + 0.7)));
      if (vai > 0) { lp.maos[0] = { x: lerp(-92, bt.x, vai), y: lerp(-190, bt.y, vai) }; lp.gesto = 'Lurdes: botão'; }
      if (bl === 'resposta') {
        const pega = suave(fr(t, m.rs.pega - 0.5, m.rs.pega)), tr = { x: (TROCA.x + 6 - lw.x) / s, y: (TROCA.y - 4 - lw.yPe) / s };
        lp.maos[1] = { x: lerp(92, tr.x, pega), y: lerp(-192, tr.y, pega) }; lp.gesto = 'Lurdes: pega o pão';
        lp.olhoX = 0.85; lp.olhoY = 0.1;
        lp.abre = 0.22 * Math.sin(Math.PI * fr(t, m.rs.bomdiaL - 0.2, m.rs.bomdiaL + 0.15));
        lp.cantoE = lp.cantoD = 3 * suave(fr(t, m.rs.encaixe, m.rs.encaixe + 0.4));
      }
      lp.palpS = piscaEm(t, [m.it.vem.t1 + 0.2, m.rs.encaixe + 0.6]);
      out.push({ vista: 'lurdesFrente', x: lw.x, yPe: lw.yPe, pose: lp, elev: t < m.it.vem.t0 + 0.2, sacola: { x: SACOLA.x, y: SACOLA.y, aberta: 0, rot: 0, frente: false } });
    }
  }
  return out;
}
const TROCA = { x: 936, y: 702 }; // onde o saco de pão passa de uma mão para a outra
// letras soltas no saguão: no ar, caindo e no chão
function letrasB(t, m) {
  const out = [], bl = planoEm(t).bloco;
  const dia1 = !['seguinte', 'interfone', 'resposta'].includes(bl) && t >= m.c.voltaB;
  if (dia1) letrasCaio().forEach((L, i) => {
    if (L.ch === ' ') return;
    const t0 = m.c.caem[i], dur = quedaDur('c', i), chao = RES.yPe + 10 + (i % 3) * 6;
    if (t < t0) { out.push({ ch: L.ch, x: L.x, y: L.y + Math.sin(t * 2 + i) * 2, tam: 40 }); return; }
    const u = Math.min(t - t0, dur), y = L.y + 0.5 * G_QUEDA * u * u, x = L.x + (i - 3) * 6 * (u / dur);
    const dep = t - t0 - dur, deita = dep > 0 ? suave(fr(dep, 0, 0.12)) : 0;
    out.push({ ch: L.ch, x, y: Math.min(y, chao), tam: 40, r: (D.hash(i + 3) - 0.5) * 0.8 * deita, deitada: deita, yOrd: chao });
  });
  if (bl === 'lurdes' && t >= m.l.voltaB && t < m.l.caem[4] + 0.6) {
    const s = sL(), sc = sacolaLurdes(t, m), bocaY = RES.yPe + 2 + (sc.y + 6) * s;
    letrasLurdes().forEach((L, i) => {
      if (L.ch === ' ') return;
      const t0 = m.l.caem[i];
      if (t < t0) { out.push({ ch: L.ch, x: L.x, y: L.y + Math.sin(t * 2 + i) * 2, tam: 34, frente: true }); return; }
      const u = t - t0, y = L.y + 0.5 * G_QUEDA * u * u;
      if (y < bocaY + 30) out.push({ ch: L.ch, x: L.x, y, tam: 34, frente: true, recorte: bocaY });
    });
  }
  return out;
}
// as falas em cena (peças de madeira) e os encaixes
function par(t, a, b, enc, A, B, tamA, tamB, txtA, txtB, pend) {
  const out = [];
  if (t >= a && t < enc + 0.5) {
    const ap = fr(t, a, a + 0.18), vai = suave(fr(t, a + 0.25, a + 1.0));
    let x = lerp(A.x + (pend.x > A.x ? 60 : -60), pend.x, vai), y = lerp(A.y - 30, pend.y, vai) + Math.sin(t * 1.9) * 3;
    y -= 30 * suave(fr(t, b, b + 0.35));
    let e = voltaAtras(ap), alfa = 1;
    if (t >= enc) { const q = fr(t, enc + 0.22, enc + 0.48); e *= (1 - 0.08 * Math.sin(Math.PI * fr(t, enc, enc + 0.2))) * (1 - entrada(q)); alfa = 1 - q; }
    out.push({ txt: txtA, x, y, tam: tamA, r: Math.sin(t * 1.3) * 0.02, esc: e, alfa, piv: 'topo' });
  }
  if (t >= b && t < enc + 0.5) {
    const ap = fr(t, b, b + 0.18), vai = suave(fr(t, b + 0.2, enc));
    const alvo = { x: pend.x, y: pend.y - 30 + tamA * 0.5 + tamB * 0.5 + 2 };
    let x = lerp(B.x + (pend.x > B.x ? 60 : -60), alvo.x, vai), y = lerp(B.y + 40, alvo.y, vai) + Math.sin(Math.PI * vai) * 12;
    let e = voltaAtras(ap), alfa = 1;
    if (t >= enc) { const q = fr(t, enc + 0.22, enc + 0.48); e *= (1 - 0.08 * Math.sin(Math.PI * fr(t, enc, enc + 0.2))) * (1 - entrada(q)); alfa = 1 - q; }
    out.push({ txt: txtB, x, y, tam: tamB, r: Math.sin(t * 1.3) * 0.02 * vai, esc: e, alfa, piv: 'meio' });
  }
  return out;
}
function falasB(t, m) {
  const bl = planoEm(t).bloco;
  if (bl === 'caio') { const A = bocaArl(), B = bocaCaioRes(); return par(t, m.c.bomdiaA, m.c.bomdiaC, m.c.encaixe, A, B, 52, 44, 'Bom dia.', 'Bom dia.', { x: (A.x + B.x) / 2, y: 372 }); }
  if (bl === 'lurdes') { const A = bocaLurdesRes(), B = bocaArl(); return par(t, m.l.ateL, m.l.ateA, m.l.encaixe, A, B, 46, 40, 'Até amanhã.', 'Até amanhã.', { x: (A.x + B.x) / 2 + 10, y: 380 }); }
  if (bl === 'resposta') {
    const sA = esc('arlindoFrente', 918), A = { x: M.it.entra.pontos[2].x, y: 918 - 484 * sA }, sl = sL(), B = { x: RES.x - 60, y: RES.yPe + 2 - 380 * sl };
    return par(t, m.rs.bomdiaA, m.rs.bomdiaL, m.rs.encaixe, A, B, 52, 46, 'Bom dia.', 'Bom dia.', { x: (A.x + B.x) / 2, y: 420 });
  }
  return [];
}

// ---------------------------------------------------------------- desenhar alguém no saguão (escala só pela profundidade)
function poe(g, it) {
  const d = EL.profundidade(it.yPe, SAG), s = EL.escala(it.vista, d);
  if (EL.registro.ativo) EL.registro.quadro.push({ vista: it.vista, x: it.x, yPe: it.yPe, s, d, pose: it.pose, comparar: !it.sentado && it.pose.quepe !== 'mao' });
  g.save(); g.translate(it.x, it.yPe); g.scale(s, s);
  if (it.sacola && !it.sacola.frente) desenhaSacola(g, it.sacola);
  const r = P[it.vista](g, 0, 0, it.pose);
  if (it.sacola && it.sacola.frente) desenhaSacola(g, it.sacola);
  g.restore();
  return { s, r };
}
function desenhaSacola(g, sc) {
  traco(g, [[-52, -346], [sc.x + 17, sc.y + 4]], 6, { seed: 713, tinta: '#a99a7c' });
  traco(g, [[-66, -342], [sc.x - 15, sc.y + 4]], 6, { seed: 714, tinta: '#a99a7c' });
  g.save(); g.translate(sc.x, sc.y); g.scale(-1, 1); P.sacola(g, 0, 0, 1, sc.rot, sc.aberta); g.restore();
}
function sacoPao(g, x, y, s) { // saco de papel da padaria pendurado pela mão em (x, y)
  g.save(); g.translate(x, y); g.scale(s, s);
  forma(g, [[-30, 4], [30, 4], [38, 112], [-38, 112]], '#d9b98a', { seed: 1024, linha: 4 });
  traco(g, [[-26, 22], [26, 22]], 3, { seed: 1025, tinta: '#b2925e' });
  forma(g, elipsePts(-8, 0, 12, 8, 8), '#e9d2a8', { seed: 1027, linha: 3 }); // pão aparecendo
  forma(g, elipsePts(0, 0, 16, 15, 9), P.COR.aPele, { seed: 1026, linha: 4 });
  g.restore();
}
function cenaB(g, t, m) {
  const bl = planoEm(t).bloco, ld = luzDia(t);
  let cam = { z: lerp(1.06, 1.08, fr(t, planoEm(t).de, planoEm(t).de + 8)), cx: 910, cy: 590 };
  if (bl === 'ninguem') { const q = suave(fr(t, m.l.sai.t1 - 1.2, m.b.anota)); cam = { z: lerp(1.06, 1.16, q), cx: lerp(910, 740, q), cy: lerp(590, 620, q) }; }
  if (bl === 'resposta') { const q = suave(fr(t, m.b.resposta, m.b.resposta + 3)); cam = { z: lerp(1.06, 1.14, q), cx: lerp(910, 880, q), cy: lerp(590, 610, q) }; }
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  const gente = genteB(t, m), letras = letrasB(t, m);
  const desenhados = {};
  camada(g, cam, 1, () => {
    // paredes, teto, chão
    g.fillStyle = '#3c3a4c'; g.fillRect(-400, -400, 2720, SAG.teto + 400);
    g.fillStyle = '#7d7290'; g.fillRect(-400, SAG.teto, 2720, SAG.chao - SAG.teto);
    g.fillStyle = '#6a4c40'; g.fillRect(-400, 640, 2720, SAG.chao - 640); // rodapé de madeira
    traco(g, [[-400, 640], [2320, 640]], 5, { seed: 1500, tinta: '#4a4658' });
    traco(g, [[-400, SAG.teto], [2320, SAG.teto]], 5, { seed: 1501 });
    g.fillStyle = '#4a4757'; g.fillRect(-400, SAG.chao, 2720, 900);
    for (let i = -8; i <= 8; i++) traco(g, [[960 + i * 230, SAG.chao], [960 + i * 230 * 2.6, 1500]], 3, { seed: 1510 + i, tinta: '#3d3a4a', tremor: 0.3 });
    for (const y of [850, 920, 1010]) traco(g, [[-400, y], [2320, y]], 2.5, { seed: 1530 + y, tinta: '#3d3a4a', tremor: 0.3 });
    traco(g, [[-400, SAG.chao], [2320, SAG.chao]], 5, { seed: 1502 });
    // porta do quartinho (fundos), interfone na parede, relógio
    forma(g, [[40, 330], [196, 330], [196, SAG.chao], [40, SAG.chao]], '#7a5a44', { seed: 1540, linha: 6, reto: true });
    g.fillStyle = '#c9a75a'; g.beginPath(); g.arc(176, 560, 8, 0, 7); g.fill();
    forma(g, [[640, 440], [700, 440], [700, 520], [640, 520]], '#d8d4c8', { seed: 1541, linha: 4, reto: true });
    forma(g, [[650, 452], [672, 452], [672, 508], [650, 508]], '#3a3a44', { seed: 1542, linha: 3, reto: true });
    relogio(g, t);
    // vaso de planta perto da porta
    forma(g, [[1330, 730], [1410, 730], [1396, SAG.chao], [1344, SAG.chao]], '#9a5a3a', { seed: 1545, linha: 5 });
    for (let i = 0; i < 5; i++) traco(g, [[1370, 732], [1310 + i * 30, 610 + (i % 2) * 30]], 7, { seed: 1546 + i, tinta: '#4f7f3e' });
    elevador(g, t, () => { for (const it of gente) if (it.elev) poe(g, it); });
    portaVidro(g, t, ld, () => { for (const it of gente) if (it.fora) desenhados[it.vista] = poe(g, it); });
    // sol entrando pela porta
    if (ld.sol > 0.01) {
      const off = -420 - 640 * ld.anda, ab = aberturaPorta(t);
      g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = (0.22 + 0.12 * ab) * ld.sol;
      g.fillStyle = ld.quente > 0.4 ? '#ffb46a' : '#fff1c8';
      g.beginPath(); g.moveTo(PORTA.x0, SAG.chao); g.lineTo(PORTA.x1, SAG.chao); g.lineTo(PORTA.x1 + off + 140 - 120 * ld.anda, 1080); g.lineTo(PORTA.x0 + off, 1080); g.closePath(); g.fill(); g.restore();
    }
    // atrás do balcão: banco, ele, o balcão por cima
    banco(g);
    for (const it of gente) if (!it.fora && !it.elev && (it.sentado || it.atras)) desenhados[it.vista] = poe(g, it);
    balcao(g, t);
    // na frente: letras no chão e gente, por profundidade
    const fila = [];
    for (const L of letras) if (!L.frente) fila.push({ y: L.yOrd ?? L.y + 2000, f: () => letra(g, L.ch, L.x, L.y, L.tam, { r: L.r || 0, deitada: L.deitada || 0 }) });
    for (const it of gente) if (!it.fora && !it.elev && !it.sentado && !it.atras) fila.push({ y: it.yPe, f: () => { desenhados[it.vista] = poe(g, it); } });
    fila.sort((a, b) => a.y - b.y).forEach((x) => x.f());
    // as letras dela caem dentro da sacola: some o que passa da boca da sacola
    for (const L of letras) if (L.frente) {
      g.save(); if (L.recorte) { g.beginPath(); g.rect(-400, -400, 2720, L.recorte + 400); g.clip(); }
      letra(g, L.ch, L.x, L.y, L.tam); g.restore();
    }
    // saco de pão: na mão dele, depois na dela
    const arl = gente.find((x) => x.saco);
    if (arl && desenhados[arl.vista]) {
      const lur = gente.find((x) => x.vista === 'lurdesFrente');
      const comEla = bl === 'resposta' && t >= m.rs.pega && lur && desenhados.lurdesFrente;
      const quem = comEla ? lur : arl, dd = comEla ? desenhados.lurdesFrente : desenhados[arl.vista], mi = comEla ? 1 : 0;
      const h = dd.r.maos[mi];
      const desenhaSaco = () => sacoPao(g, quem.x + h.x * dd.s, quem.yPe + h.y * dd.s, dd.s);
      if (arl.fora) { g.save(); g.beginPath(); g.rect(PORTA.x0, PORTA.y0, PORTA.x1 - PORTA.x0, PORTA.chao - PORTA.y0); g.clip(); desenhaSaco(); g.restore(); }
      else desenhaSaco();
    }
    for (const f of falasB(t, m)) frase(g, f.txt, f.x, f.y, f.tam, f);
    // luz
    luz(g, ld.noite > 0.3 ? ABAJUR.x + 200 : PORTA.cx, ld.noite > 0.3 ? 560 : 420, 1800, ld.noite > 0.3 ? '#ffe2b8' : '#fff8ea', ld.noite > 0.3 ? '#2a2236' : '#5a566e');
    escurece(g, ld.noite * 0.75, '14,10,30');
    brilho(g, ABAJUR.x + 4, MESA.topoTras - 140, 360, '#ffcf8a', 0.18 + 0.5 * ld.noite);
    brilho(g, PORTA.cx, 560, 520, ld.noite > 0.3 ? '#9fb4ff' : '#fff1c8', 0.22 * (1 - ld.noite * 0.6));
  });
}

// ---------------------------------------------------------------- fundos desfocados dos closes
function fundoSaguao(g, cam, cor = '#77738a', noite = 0) {
  camada(g, cam, 0.5, () => {
    g.fillStyle = cor; g.fillRect(-400, -400, 2720, 1900);
    g.save(); g.filter = 'blur(9px)';
    forma(g, [[1300, 140], [1640, 140], [1640, 900], [1300, 900]], noite ? '#5a6aa0' : '#e9eef4', { seed: 1601, linha: 0, reto: true }); // porta de vidro, clara
    forma(g, [[260, 200], [600, 200], [600, 900], [260, 900]], '#8d93a6', { seed: 1602, linha: 0, reto: true }); // elevador
    g.fillStyle = '#5b5668'; g.fillRect(-400, 760, 2720, 600);
    g.restore();
  });
}
// ---------------------------------------------------------------- C · close do Caio no balcão (espelhado: olha para o Seu Arlindo, à esquerda)
const BOCA_C = { x: 1180 - 80, y: 560 + 176 };
function letrasCloseC() { return fileira('Seu Arl', BOCA_C.x - 230, BOCA_C.y - 90, 118); }
function cenaC(g, t, m) {
  const u = t - m.c.corteC, cam = { z: lerp(1.0, 1.03, fr(u, 0, 2)), cx: 960, cy: 540 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  fundoSaguao(g, cam);
  camada(g, cam, 1, () => {
    const p = { fone: 1, olhoX: 0.75, olhoY: 0.1, pupila: 0.5, palpS: 0.18 };
    const ult = m.c.letras[m.c.letras.length - 1];
    p.abre = 0; m.c.letras.forEach((tl, i) => { if (letrasCloseC()[i].ch !== ' ') p.abre = Math.max(p.abre, 0.2 * Math.sin(Math.PI * fr(t, tl - 0.08, tl + 0.1))); });
    const trava = suave(fr(t, ult + 0.35, ult + 0.7));
    p.olhoY = lerp(0.1, 0.75, trava); p.olhoX = lerp(0.75, 0.45, trava); p.sobrInc = 0.7 * trava; p.cantoE = -4 * trava; p.cantoD = -3 * trava;
    p.engole = Math.sin(Math.PI * fr(t, ult + 0.5, ult + 0.85));
    p.palpS = 0.18 + pulso(t, ult + 0.95, 0.08);
    g.save(); g.translate(1180, 560); g.scale(-1, 1); P.caioClose(g, 0, 0, p); g.restore();
    letrasCloseC().forEach((L, i) => { const tl = m.c.letras[i]; if (t >= tl) letra(g, L.ch, L.x, L.y + 40, 118, { esc: voltaAtras(fr(t, tl, tl + 0.16)) }); });
    luz(g, 760, 200, 1500, '#fff6e6', '#3a3a50');
  });
}
// ---------------------------------------------------------------- D · close da Lurdes no balcão (olha para a esquerda)
const BOCA_D = { x: 1150 - 84, y: 470 + 168 };
function letrasCloseD() { return fileira('O sen', BOCA_D.x - 120, BOCA_D.y - 60, 108); }
function cenaD(g, t, m) {
  const u = t - m.l.corteD, cam = { z: lerp(1.0, 1.03, fr(u, 0, 2.3)), cx: 960, cy: 540 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  fundoSaguao(g, cam, '#7d7891');
  camada(g, cam, 1, () => {
    const p = { olhoX: -0.7, olhoY: 0.05, pupila: 0.5, palpS: 0 };
    p.abre = 0; m.l.letras.forEach((tl, i) => { if (letrasCloseD()[i].ch !== ' ') p.abre = Math.max(p.abre, 0.26 * Math.sin(Math.PI * fr(t, tl - 0.08, tl + 0.12))); });
    const trava = suave(fr(t, m.l.aperta - 0.3, m.l.aperta + 0.2));
    p.olhoY = lerp(0.05, 0.7, trava); p.olhoX = lerp(-0.7, -0.35, trava); p.sobr = 0.3 * trava; p.sobrInc = 0.8 * trava; p.cantoE = lerp(2, -4, trava); p.cantoD = lerp(2, -4, trava); p.larg = lerp(84, 64, trava);
    p.palpS = pulso(t, m.l.aperta + 0.3, 0.08);
    P.lurdesClose(g, 1150, 470, p);
    letrasCloseD().forEach((L, i) => { const tl = m.l.letras[i]; if (t >= tl) letra(g, L.ch, L.x, L.y + 36, 108, { esc: voltaAtras(fr(t, tl, tl + 0.16)) }); });
    luz(g, 760, 200, 1500, '#fff6e6', '#3a3a50');
  });
}
// ---------------------------------------------------------------- E · o quartinho dos fundos: ele almoça e escuta
const BOCA_E = { x: 700 + 70 * 0.95, y: 560 + 196 * 0.95 };
const MARMITA = { x: 1220, y: 960 };
function garfoEm(t, m) {
  // ponta do garfo: marmita -> boca -> mastiga; na 3ª garfada ele para no ar (escutou o tec-tec) até soltar
  const em = { x: MARMITA.x - 40, y: MARMITA.y - 18 }, boca = { x: BOCA_E.x + 40, y: BOCA_E.y - 6 };
  const [g1, g2, g3, g4] = m.al.garfadas;
  const sobe = (t0) => suave(fr(t, t0 + 0.1, t0 + 0.6)), desce = (t0) => suave(fr(t, t0 + 1.9, t0 + 2.2));
  let q = 0;
  if (t < g2) q = sobe(g1) * (1 - desce(g1));
  else if (t < g3) q = sobe(g2) * (1 - desce(g2));
  else if (t < g4) { q = suave(Math.min(fr(t, g3 + 0.1, g3 + 0.6), fr(m.al.para, g3 + 0.1, g3 + 0.6))); if (t > m.al.solta) q *= 1 - suave(fr(t, m.al.solta, g4)); }
  else q = suave(fr(t, g4 + 0.2, g4 + 1.0)) * 0.9;
  return { x: lerp(em.x, boca.x, q), y: lerp(em.y, boca.y, q) - Math.sin(Math.PI * q) * 60, q };
}
function cenaE(g, t, m) {
  const u = t - m.b.almoco, cam = { z: lerp(1.0, 1.06, fr(u, 0, 13)), cx: 960, cy: 540 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.5, () => { // o quartinho: azulejo, prateleira com o rádio, o quepe no gancho, a porta entreaberta
    g.fillStyle = '#9fb0a6'; g.fillRect(-400, -400, 2720, 1900);
    g.save(); g.filter = 'blur(7px)';
    for (let x = -400; x < 2300; x += 120) traco(g, [[x, -400], [x, 1500]], 3, { seed: 1610 + x, tinta: '#8a9b92', tremor: 0.2 });
    for (let y = -400; y < 1500; y += 120) traco(g, [[-400, y], [2300, y]], 3, { seed: 1611 + y, tinta: '#8a9b92', tremor: 0.2 });
    forma(g, [[160, 470], [520, 470], [520, 490], [160, 490]], '#6b4a34', { seed: 1612, linha: 4, reto: true });
    forma(g, [[230, 360], [430, 360], [430, 470], [230, 470]], '#a3473a', { seed: 1613, linha: 5, reto: true }); // rádio
    forma(g, elipsePts(280, 415, 30, 30, 10), '#e8d9b0', { seed: 1614, linha: 4 });
    g.save(); g.translate(1340, 300); g.scale(0.9, 0.9); g.translate(0, 600); P.quepe(g, 5, 1140); g.restore(); // o quepe pendurado
    forma(g, [[1500, 80], [1760, 120], [1760, 1100], [1500, 1100]], '#7a5a44', { seed: 1615, linha: 6, reto: true }); // porta entreaberta
    g.fillStyle = '#fff3d6'; g.fillRect(1470, 80, 34, 1020); // a fresta: a luz do saguão
    g.restore();
    brilho(g, 1490, 500, 380, '#fff1c8', 0.35);
  });
  camada(g, cam, 1, () => {
    const p = { semQuepe: true, olhoX: 0.25, olhoY: 0.55, pupila: 0.55, palpS: 0.25 };
    const gf = garfoEm(t, m);
    // mastiga depois de cada garfada
    const [g1, g2, g3, g4] = m.al.garfadas;
    const mast = (t0) => (t > t0 + 0.65 && t < t0 + 1.9 ? Math.abs(Math.sin((t - t0) * 9)) : 0);
    p.mastiga = Math.max(mast(g1), mast(g2), t > g4 ? mast(g4) * 0.6 : 0);
    p.abre = 0.25 * Math.max(pulso(t, g1 + 0.55, 0.12), pulso(t, g2 + 0.55, 0.12), pulso(t, g4 + 0.95, 0.12));
    const escuta = suave(fr(t, m.al.para + 0.1, m.al.para + 0.5)) * (1 - suave(fr(t, m.al.solta - 0.2, m.al.solta + 0.4)));
    p.olhoX = lerp(0.25, 0.95, escuta); p.olhoY = lerp(0.55, -0.05, escuta); p.sobr = 0.6 * escuta; p.pupila = lerp(0.55, 0.45, escuta);
    p.cabRot = 0.06 * escuta;
    p.palpS = 0.25 + piscaEm(t, [m.b.almoco + 1.6, m.b.almoco + 4.1, m.al.tec2 + 0.4, m.al.plim2 + 0.8, m.b.almoco + 12]);
    P.arlindoClose(g, 700, 560, p);
    // mesa e marmita (na frente), a mão com o garfo
    forma(g, [[-100, 900], [2020, 880], [2020, 1200], [-100, 1200]], '#6b4a34', { seed: 1620, linha: 6 });
    forma(g, elipsePts(MARMITA.x, MARMITA.y + 30, 250, 80, 18), '#a9b0bb', { seed: 1621, linha: 6 });
    forma(g, elipsePts(MARMITA.x, MARMITA.y, 236, 66, 18), '#c9ced8', { seed: 1622, linha: 6 });
    forma(g, elipsePts(MARMITA.x - 70, MARMITA.y + 4, 110, 40, 12), '#f4f1e6', { seed: 1623, linha: 4 }); // arroz
    forma(g, elipsePts(MARMITA.x + 90, MARMITA.y + 4, 100, 36, 12), '#6b3b26', { seed: 1624, linha: 4 }); // feijão
    const hx = gf.x + 170, hy = gf.y + 120;
    D.membro(g, [[hx + 300, 1160], [hx + 120, hy + 160], [hx + 14, hy + 16]], 110, P.COR.aUni, { seed: 1625, borda: 6 });
    traco(g, [[hx - 10, hy - 6], [gf.x + 10, gf.y]], 9, { seed: 1626, tinta: '#c9ced8' }); // cabo do garfo
    for (const k of [-1, 0, 1]) traco(g, [[gf.x + 10, gf.y + k * 7], [gf.x - 22, gf.y + k * 9 - 4]], 4, { seed: 1627 + k, tinta: '#c9ced8' });
    forma(g, elipsePts(hx, hy, 66, 52, 12, -0.5), P.COR.aPele, { seed: 1630, linha: 6 });
    for (let i = 0; i < 3; i++) forma(g, elipsePts(hx - 40 + i * 6, hy - 30 + i * 26, 26, 15, 8, -0.3), P.COR.aPele, { seed: 1631 + i, linha: 5 });
    luz(g, 1490, 400, 1700, '#fff6e6', '#334038');
  });
}
// ---------------------------------------------------------------- F · a leitura: close dele por cima do livro, luz do abajur de baixo
function cenaF(g, t, m) {
  const u = t - m.le.corteF, cam = { z: lerp(1.0, 1.07, fr(u, 0, 7.8)), cx: 960, cy: 560 };
  g.fillStyle = '#0c0a14'; g.fillRect(0, 0, 1920, 1080);
  fundoSaguao(g, cam, '#3a3550', 1);
  camada(g, cam, 0.5, () => escurece(g, 0.35, '10,8,22'));
  camada(g, cam, 1, () => {
    const p = { olhoX: 0.3, olhoY: 0.78, pupila: 0.5, palpS: 0.18 };
    const linha = Math.floor(u / 0.95), dentro = (u % 0.95) / 0.95;
    p.olhoX = lerp(0.05, 0.6, dentro) - (dentro > 0.9 ? (dentro - 0.9) * 10 * 0.55 : 0);
    p.olhoY = 0.72 + 0.04 * (linha % 3);
    const dor = suave(fr(u, 1.5, 4.5));
    p.sobrInc = 0.9 * dor; p.sobr = 0.25 * dor;
    p.brilho = suave(fr(u, 2.0, 5.0)); p.palpI = 0.16 * suave(fr(u, 3.0, 6.0)); // olhos molhados e abertos: emoção, não sono
    p.bigode = suave(fr(u, 3.5, 4.5)); p.aperta = suave(fr(u, 4.5, 5.2));
    p.lagrima = fr(u, 5.6, 7.6) > 0 ? fr(u, 5.6, 7.6) : 0;
    if (u > 5.4) { p.olhoX = 0.3; p.olhoY = lerp(0.78, 0.55, suave(fr(u, 5.4, 6.2))); }
    p.dy = 4 * Math.sin(Math.PI * fr(u, 4.6, 5.0)) + 4 * Math.sin(Math.PI * fr(u, 6.4, 6.8));
    p.cabRot = 0.04;
    p.palpS = 0.18 + pulso(u, 3.1, 0.08) + pulso(u, 6.9, 0.1); p.pupila = lerp(0.5, 0.58, p.brilho);
    P.arlindoClose(g, 900, 560, p);
    // o livro aberto na frente, de costas para a câmera, e os dedos dele na capa
    forma(g, [[360, 860], [930, 930], [930, 1200], [330, 1200]], '#24414a', { seed: 1640, linha: 7 });
    forma(g, [[930, 930], [1500, 850], [1530, 1200], [930, 1200]], '#24414a', { seed: 1641, linha: 7 });
    traco(g, [[930, 930], [930, 1200]], 6, { seed: 1642, tinta: '#1a3038' });
    forma(g, [[372, 848], [930, 916], [930, 930], [360, 860]], '#efe3c4', { seed: 1643, linha: 4 }); // borda das páginas
    forma(g, [[930, 916], [1490, 838], [1500, 850], [930, 930]], '#efe3c4', { seed: 1644, linha: 4 });
    for (const [x0, s] of [[420, 1], [1440, -1]]) for (let i = 0; i < 4; i++) forma(g, elipsePts(x0 + s * 10 * i, 930 + i * 44, 44, 19, 9, 0.15 * s), P.COR.aPele, { seed: 1645 + i + (s > 0 ? 0 : 10), linha: 6 });
    // luz do abajur: de baixo e da esquerda, quente
    luz(g, 420, 1000, 1500, '#ffe2b8', '#241c30');
    brilho(g, 360, 1080, 900, '#ffb866', 0.32);
  });
}
// ---------------------------------------------------------------- G · de dentro, pelo vidro: ele espera do lado de fora
function cenaG(g, t, m) {
  const u = t - m.it.corteG, cam = { z: lerp(1.0, 1.04, fr(u, 0, 2.8)), cx: 960, cy: 540 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.6, () => { // a rua de manhã
    g.fillStyle = '#d7dfe8'; g.fillRect(-400, -400, 2720, 1900);
    g.save(); g.filter = 'blur(6px)';
    forma(g, [[-400, -100], [2320, -100], [2320, 560], [-400, 560]], '#c4ad92', { seed: 1650, linha: 0, reto: true }); // prédio da frente
    for (let i = 0; i < 9; i++) forma(g, [[-300 + i * 280, 60], [-160 + i * 280, 60], [-160 + i * 280, 260], [-300 + i * 280, 260]], '#90a4ba', { seed: 1651 + i, linha: 0, reto: true });
    g.fillStyle = '#6a6a74'; g.fillRect(-400, 560, 2720, 180);
    g.fillStyle = '#a8a39a'; g.fillRect(-400, 740, 2720, 700);
    forma(g, [[1500, -200], [1560, -200], [1580, 760], [1480, 760]], '#5a4434', { seed: 1660, linha: 0 }); // árvore
    g.restore();
    brilho(g, 400, 100, 1200, '#fff1c8', 0.4);
  });
  camada(g, cam, 1, () => {
    const s = 1.55, x = 760, y = 1210;
    const p = { civil: true, olhoX: lerp(0, 0.15, Math.sin(u)), olhoY: 0.1, pupila: 0.55, palpS: 0.2, maos: [null, null] };
    const olhaSaco = suave(fr(u, 0.9, 1.2)) * (1 - suave(fr(u, 1.9, 2.2)));
    p.olhoY = lerp(0.05, 0.9, olhaSaco); p.olhoX = lerp(p.olhoX, -0.4, olhaSaco); p.cabRot = -0.05 * olhaSaco;
    p.dy = 3 * Math.sin(Math.PI * fr(u, 1.4, 2.0));
    p.cantoE = p.cantoD = 1;
    p.palpS = 0.2 + pulso(u, 0.5, 0.07) + pulso(u, 2.5, 0.07);
    g.save(); g.translate(x, y); g.scale(s, s); const r = P.arlindoFrente(g, 0, 0, p); g.restore();
    const h = r.maos[0]; sacoPao(g, x + h.x * s, y + h.y * s, s);
    // o vidro e a moldura
    g.fillStyle = 'rgba(205,225,240,0.2)'; g.fillRect(-400, -400, 2720, 1900);
    g.save(); g.globalAlpha = 0.3; traco(g, [[200, -100], [700, 900]], 40, { seed: 1670, tinta: '#ffffff', tremor: 0.2 }); traco(g, [[1300, -100], [1600, 500]], 22, { seed: 1671, tinta: '#ffffff', tremor: 0.2 }); g.restore();
    for (const xx of [-60, 1240, 2000]) forma(g, [[xx - 26, -100], [xx + 26, -100], [xx + 26, 1180], [xx - 26, 1180]], '#55596a', { seed: 1672 + xx, linha: 6, reto: true });
    traco(g, [[1290, 380], [1290, 640]], 14, { seed: 1675, tinta: '#c9ced8' }); traco(g, [[1190, 380], [1190, 640]], 14, { seed: 1676, tinta: '#c9ced8' });
  });
}
// ---------------------------------------------------------------- cartelas
function cartela(g, txt, t, ini, dur, tam) {
  g.fillStyle = '#0c0a14'; g.fillRect(0, 0, 1920, 1080);
  const a = Math.min(fr(t, ini + 0.15, ini + 0.6), 1 - fr(t, ini + dur - 0.45, ini + dur - 0.05));
  frase(g, txt, 960, 540, tam, { alfa: a, esc: 0.96 + 0.04 * saida(fr(t, ini + 0.15, ini + 0.9)) });
}
// ---------------------------------------------------------------- composição
let grao = null;
function desenhar(g, t, T) {
  marcas(T);
  const p = planoEm(t);
  D.linhaK.k = 1; D.ferv.amp = 1.6;
  if (EL.registro.ativo) EL.registro.quadro = [];
  if (p.id === 'A') cenaA(g, t, M);
  else if (p.id === 'B') cenaB(g, t, M);
  else if (p.id === 'C') cenaC(g, t, M);
  else if (p.id === 'D') cenaD(g, t, M);
  else if (p.id === 'E') cenaE(g, t, M);
  else if (p.id === 'F') cenaF(g, t, M);
  else if (p.id === 'G') cenaG(g, t, M);
  else if (p.id === 'titulo') { cartela(g, 'O PORTEIRO', t, M.b.titulo, 2.6, 130); return; }
  else if (p.id === 'cartela') { cartela(g, 'Quase Disse.', t, M.b.cartela, 2.6, 96); return; }
  else { g.fillStyle = '#000'; g.fillRect(0, 0, 1920, 1080); return; }
  if (!grao) grao = D.criarGrao(2048, 1200);
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.07;
  g.drawImage(grao, -(D.hash(D.ferv.passo) * 120) | 0, -(D.hash(D.ferv.passo + 9) * 110) | 0);
  g.restore();
}
function relatorio() {
  const linhas = ['Alcance de mãos e pés (px que faltaram; precisa ser 0 nos gestos):'];
  for (const [k, v] of Object.entries(P.FALTA.porGesto)) linhas.push(`  ${k}: ${v.toFixed(1)}`);
  linhas.push(`Maior falta em qualquer quadro: ${P.FALTA.max.toFixed(1)} px`, '', 'Contatos (o som é posto no mesmo instante):');
  for (const c of M.contatos) linhas.push(`  ${c.t.toFixed(3)} s  ${c.nome}`);
  return linhas.join('\n');
}
function contatos(T) { marcas(T); return M.contatos; }

module.exports = { FPS, blocos, desenhar, som: (...a) => require('./som_ep').som(...a, { marcas, planoEm: (t) => planoEm(t), luzDia: (t) => luzDia(t), aberturaPorta: (t) => aberturaPorta(t) }), relatorio, contatos, ganhoVoz: 0, legendas: false, srt: true };
