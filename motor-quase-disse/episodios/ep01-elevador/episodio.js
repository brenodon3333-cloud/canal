// QUASE DISSE · EPISÓDIO 1 · "O elevador" (~99 s)
// Toda noite a Dona Lurdes bate a vassoura no teto. No elevador, um "Bom dia." fica sem resposta e pendurado no ar.
// O elevador trava; do fone do garoto vaza a música que ela ouve pelo teto. Ele responde; as frases se encaixam.
const D = require('../../motor/desenho');
const P = require('./personagens');
const { chave, fr, suave, saida, entrada, voltaAtras, mola, lerp, forma, traco, elipsePts, TINTA } = D;

const FPS = 24;
const blocos = [
  { id: 'abre', dur: 1.2 },
  { id: 'noite1', fala: 'L1', antes: 2.9, depois: 1.3 }, // gancho: a imagem entra na primeira batida
  { id: 'titulo', dur: 2.6 },
  { id: 'manha', fala: 'L2', antes: 1.1, depois: 0.9 },
  { id: 'entra', dur: 6.4 },
  { id: 'bomdia', dur: 10.0 },
  { id: 'painel', dur: 3.0 },
  { id: 'estalo', dur: 2.0 },
  { id: 'tranco', dur: 3.4 },
  { id: 'medo', dur: 6.0 },
  { id: 'nota', dur: 4.0 },
  { id: 'vaza', dur: 6.0 },
  { id: 'entende', dur: 5.0 },
  { id: 'silencio', dur: 3.0 },
  { id: 'resposta', dur: 5.0 },
  { id: 'terreo', fala: 'L3', antes: 3.0, depois: 1.4 },
  { id: 'noite2', dur: 14.0 },
  { id: 'cartela', dur: 2.6 },
  { id: 'preto', dur: 2.0 },
];

// ---------------------------------------------------------------- marcas de tempo (segundos absolutos)
let M = null;
function marcas(T) {
  if (M) return M;
  const b = Object.fromEntries(blocos.map((x) => [x.id, T.B(x.id).ini]));
  M = { b };
  const n1 = b.noite1, e = b.entra, bd = b.bomdia, tr = b.tranco, md = b.medo, nt = b.nota, vz = b.vaza, en = b.entende, si = b.silencio, rs = b.resposta, tm = b.terreo, n2 = b.noite2;
  M.n1 = { k: [n1 + 0.05, n1 + 0.62, n1 + 1.12], abaixa: T.W('L1', 'teto').ini };
  M.n1.para = M.n1.k[2] + 0.4;
  M.titulo = { volta: b.titulo + 0.9 };
  M.ma = { botao: b.manha + 0.62, cima: T.W('L2', 'cima').ini };
  M.e = { ind5: e + 0.1, plim: e + 0.35, abre: e + 0.4, aberta: e + 1.2, recua: e + 1.4, passo1: e + 2.7, passo2: e + 3.2, corte: e + 3.4, pousa: e + 3.52, fecha: e + 3.9, fechada: e + 4.7, motor: e + 5.0 };
  M.bd = { boca: bd + 0.8, texto: bd + 1.0, olhaTexto: bd + 2.6, alca: [bd + 4.6, bd + 6.0], olhaCaio: bd + 7.5, ind4: bd + 5.0 };
  M.pn = { ind3: b.painel + 1.0 };
  M.es = { som: b.estalo + 0.5 };
  M.tr = { tranco: tr + 0.25 };
  M.md = { agarra: md + 0.9 };
  M.nt = { para: nt + 0.6, toca: nt + 2.6, fora: nt + 2.85, pescoco: nt + 3.6 };
  M.vz = { corte: vz + 2.6 };
  M.en = { engole: en + 3.4, botao: en + 4.0 };
  M.si = { clique: si + 0.3 };
  M.rs = { texto: rs + 0.6, encaixe: rs + 1.6 };
  M.tm = { plim: tm + 0.2, abre: tm + 0.3, sai: tm + 1.0, fecha: tm + 5.4 };
  M.n2 = { musica: n2 + 0.8, encosto: n2 + 2.5, pe1: n2 + 2.8, sobe: n2 + 3.0, pe2: n2 + 3.9, ergue: n2 + 4.6, para: n2 + 5.6, deCima: [n2 + 7.1, n2 + 7.45], olha: n2 + 7.9, toque: [n2 + 8.8, n2 + 9.25], abaixa: n2 + 9.8, sorri: n2 + 10.4 };
  // passos no saguão: cada pé que pousa
  // o pé pousa quando o seno do passo volta a zero: a cada meio ciclo
  M.tm.cicloC = 0.9; M.tm.iniL = M.tm.sai + 0.3; M.tm.cicloL = 0.8;
  M.tm.passosCaio = []; for (let k = 1; M.tm.sai + k * M.tm.cicloC / 2 <= M.tm.sai + 4.2; k++) M.tm.passosCaio.push(M.tm.sai + k * M.tm.cicloC / 2);
  M.tm.passosLurdes = []; for (let k = 1; M.tm.iniL + k * M.tm.cicloL / 2 <= M.tm.sai + 5.0; k++) M.tm.passosLurdes.push(M.tm.iniL + k * M.tm.cicloL / 2);
  M.planos = [
    ['abre', 'preto'], ['noite1', 'A'], ['titulo', 'titulo'], ['manha', 'B'], ['entra', 'B'],
    ['bomdia', 'C'], ['painel', 'D'], ['estalo', 'E'], ['tranco', 'C'], ['medo', 'E'], ['nota', 'F'], ['vaza', 'F'],
    ['entende', 'F'], ['silencio', 'C'], ['resposta', 'C'], ['terreo', 'G'], ['noite2', 'A'], ['cartela', 'cartela'], ['preto', 'preto'],
  ].map(([id, pl]) => ({ de: b[id], id: pl, bloco: id }));
  M.planos.splice(5, 0, { de: M.e.corte, id: 'C', bloco: 'entra' }); // o corte para dentro do elevador acontece no meio do passo
  M.planos.splice(M.planos.findIndex((p) => p.bloco === 'vaza') + 1, 0, { de: M.vz.corte, id: 'E', bloco: 'vaza' });
  M.planos.forEach((p, i) => { p.ate = i + 1 < M.planos.length ? M.planos[i + 1].de : T.total + 1; });
  M.contatos = [
    ['vassoura bate no teto 1', M.n1.k[0]], ['vassoura bate no teto 2', M.n1.k[1]], ['vassoura bate no teto 3', M.n1.k[2]],
    ['dedo aperta o botão do elevador', M.ma.botao], ['luz de chegada acende (plim)', M.e.plim], ['portas terminam de abrir', M.e.aberta],
    ['pé recua', M.e.recua + 0.3], ['passo 1', M.e.passo1], ['passo 2', M.e.passo2], ['pé pousa dentro do elevador', M.e.pousa],
    ['"Bom dia." aparece', M.bd.texto], ['tranco', M.tr.tranco], ['mão agarra o corrimão', M.md.agarra], ['mão toca o fone', M.nt.toca],
    ['dedo aperta o botão do fone', M.si.clique], ['"Bom dia." dele aparece', M.rs.texto], ['as duas frases se encaixam', M.rs.encaixe],
    ['portas do térreo começam a abrir (plim)', M.tm.plim],
    ...M.tm.passosCaio.map((t, i) => [`passo do Caio ${i + 1}`, t]), ...M.tm.passosLurdes.map((t, i) => [`passo da Lurdes ${i + 1}`, t]),
    ['mão no encosto do sofá', M.n2.encosto], ['pé no assento', M.n2.pe1], ['outro pé no assento', M.n2.pe2],
    ['batida de cima 1', M.n2.deCima[0]], ['batida de cima 2', M.n2.deCima[1]], ['vassoura toca o teto de leve 1', M.n2.toque[0]], ['vassoura toca o teto de leve 2', M.n2.toque[1]],
  ].map(([nome, t]) => ({ nome, t }));
  return M;
}
const planoEm = (t) => M.planos.find((p) => t >= p.de && t < p.ate) || M.planos[M.planos.length - 1];
const pulso = (t, t0, larg = 0.07) => Math.max(0, 1 - Math.abs(t - t0) / larg); // piscar

// andar mostrado no painel e se a seta anda
function andarEm(t) {
  const m = M;
  if (t < m.ma.cima) return { n: '7', seta: true };
  if (t < m.e.ind5) return { n: '6', seta: true };
  if (t < m.bd.ind4) return { n: '5', seta: t >= m.e.motor };
  if (t < m.pn.ind3) return { n: '4', seta: true };
  if (t < m.b.terreo) return { n: '3', seta: t < m.tr.tranco || t >= m.rs.encaixe };
  return { n: 'T', seta: false };
}
// luz do elevador: pisca no tranco, fica fraca enquanto está parado, volta no encaixe
function luzElevador(t) {
  const m = M, tc = m.tr.tranco;
  if (t < tc + 0.05) return 1;
  if (t >= m.rs.encaixe) return 1 - 0.6 * pulso(t, m.rs.encaixe + 0.06, 0.05);
  const pis = pulso(t, tc + 0.12, 0.06) + pulso(t, tc + 0.42, 0.05) + pulso(t, tc + 0.55, 0.04);
  return Math.max(0.12, lerp(1, 0.58, fr(t, tc + 0.05, tc + 0.7)) - 0.8 * Math.min(1, pis));
}

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
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = a;
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-3000, -3000, 8000, 8000); g.restore();
}
function escurece(g, a, cor = '8,6,16') { if (a > 0.001) { g.fillStyle = `rgba(${cor},${a})`; g.fillRect(-3000, -3000, 8000, 8000); } }
// fala escrita em cena: peças de madeira claras com contorno de tinta. piv: 'meio' ou 'topo' (pendurada, balança pelo topo)
function frase(g, txt, x, y, tam, { r = 0, esc = 1, alfa = 1, piv = 'meio' } = {}) {
  if (alfa <= 0 || esc <= 0.001) return;
  g.save(); g.globalAlpha = alfa;
  g.font = `${tam}px Archivo`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const dy = piv === 'topo' ? tam * 0.55 : 0;
  g.translate(x, y - dy); g.rotate(r); g.scale(esc, esc); g.translate(0, dy);
  g.lineJoin = 'round'; g.lineWidth = tam * 0.16; g.strokeStyle = TINTA; g.strokeText(txt, 0, 0);
  g.fillStyle = '#fbf8f1'; g.fillText(txt, 0, 0);
  g.restore();
}
function larguraFrase(g, txt, tam) { g.save(); g.font = `${tam}px Archivo`; const w = g.measureText(txt).width; g.restore(); return w; }

// ---------------------------------------------------------------- A · sala da Lurdes, de noite
const SALA = { teto: 170, chao: 935, assento: 806, encosto: 650, x: 1000 };
function poeira(g, t, t0, x, forca = 1) { // pó do gesso caindo depois da batida
  const u = t - t0;
  if (u < 0 || u > 1.2) return;
  g.save(); g.fillStyle = '#d9d2c4';
  for (let i = 0; i < 9 * forca; i++) {
    const h = D.hash(i * 7 + t0 * 13);
    const px = x + (h - 0.5) * 70 * forca + Math.sin(u * 5 + i) * 6, py = SALA.teto + 6 + u * (120 + 140 * D.hash(i + 3)) + u * u * 90;
    g.globalAlpha = (1 - u / 1.2) * 0.85;
    g.beginPath(); g.arc(px, py, 2 + 2.5 * D.hash(i + 9), 0, 7); g.fill();
  }
  g.restore();
}
function abajur(g, x, y) {
  forma(g, [[x - 70, y], [x + 70, y], [x + 70, y + 12], [x - 70, y + 12]], '#4a2f2a', { seed: 1001, linha: 5, reto: true });
  forma(g, [[x - 12, y + 12], [x + 12, y + 12], [x + 10, SALA.chao], [x - 10, SALA.chao]], '#4a2f2a', { seed: 1002, linha: 5, reto: true });
  forma(g, [[x - 8, y - 190], [x + 8, y - 190], [x + 8, y], [x - 8, y]], '#6a5a48', { seed: 1003, linha: 4, reto: true });
  forma(g, [[x - 50, y - 300], [x + 50, y - 300], [x + 80, y - 190], [x - 80, y - 190]], '#f2c46b', { seed: 1004, linha: 5 });
}
function sofa(g) {
  const c = '#8c4f5e', e = '#6e3a48';
  forma(g, [[640, SALA.encosto + 20], [660, SALA.encosto], [1340, SALA.encosto], [1360, SALA.encosto + 20], [1360, SALA.assento], [640, SALA.assento]], e, { seed: 1010, linha: 5 });
  forma(g, [[660, SALA.assento - 30], [1340, SALA.assento - 30], [1350, SALA.assento + 6], [650, SALA.assento + 6]], c, { seed: 1011, linha: 5 });
  traco(g, [[1000, SALA.assento - 28], [1000, SALA.assento + 4]], 4, { seed: 1012 });
  forma(g, [[620, SALA.assento - 60], [690, SALA.assento - 60], [690, 905], [620, 905]], e, { seed: 1013, linha: 5 });
  forma(g, [[1310, SALA.assento - 60], [1380, SALA.assento - 60], [1380, 905], [1310, 905]], e, { seed: 1014, linha: 5 });
  forma(g, [[650, SALA.assento + 6], [1350, SALA.assento + 6], [1350, 905], [650, 905]], c, { seed: 1015, linha: 5, reto: true });
  forma(g, [[660, 905], [690, 905], [688, 930], [662, 930]], '#2a1a1e', { seed: 1016, linha: 4, reto: true });
  forma(g, [[1310, 905], [1340, 905], [1338, 930], [1312, 930]], '#2a1a1e', { seed: 1017, linha: 4, reto: true });
}
function relogioParede(g, x, y, r, t) {
  forma(g, elipsePts(x, y, r, r, 14), '#efe9dc', { seed: 1020, linha: 5 });
  const s = Math.floor(t), as = (s / 60) * Math.PI * 2 - Math.PI / 2;
  traco(g, [[x, y], [x + Math.cos(-1.9) * r * 0.45, y + Math.sin(-1.9) * r * 0.45]], 6, { seed: 1021, tremor: 0.3 });
  traco(g, [[x, y], [x + Math.cos(-0.2) * r * 0.65, y + Math.sin(-0.2) * r * 0.65]], 5, { seed: 1022, tremor: 0.3 });
  traco(g, [[x, y], [x + Math.cos(as) * r * 0.8, y + Math.sin(as) * r * 0.8]], 2.5, { seed: 1023, tinta: '#c0392b', tremor: 0.2 });
}
function janelaNoite(g, x0, y0, w, h) {
  forma(g, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], '#1d3359', { seed: 1030, linha: 6, reto: true });
  g.fillStyle = '#f5ecc8'; g.beginPath(); g.arc(x0 + w * 0.7, y0 + h * 0.3, h * 0.1, 0, 7); g.fill();
  g.fillStyle = '#1d3359'; g.beginPath(); g.arc(x0 + w * 0.7 + h * 0.045, y0 + h * 0.27, h * 0.09, 0, 7); g.fill();
  for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(245,220,140,0.8)'; g.fillRect(x0 + 20 + i * 44, y0 + h - 40 - (i % 2) * 22, 12, 14); } // janelas acesas do prédio da frente
  traco(g, [[x0 + w / 2, y0], [x0 + w / 2, y0 + h]], 6, { seed: 1031 });
  traco(g, [[x0, y0 + h / 2], [x0 + w, y0 + h / 2]], 6, { seed: 1032 });
}
// vassoura de pé ao lado do corpo (as cerdas tocam onde ela está pisando). c = quadril em relação aos pés
function vassouraAoLado(c) { return { topo: { x: c.x + 70, y: c.y - 540 }, base: { x: c.x + 62, y: c.y - 70 } }; }
// vassoura e poses da sala. dCabo: quanto o cabo está abaixo do teto (0 = encostado)
function vassouraNoTeto(dCabo, dx = 0) {
  const topo = { x: 1112 + dx, y: SALA.teto + dCabo }, base = { x: 1084 + dx, y: 680 + dCabo };
  const ao = (k) => ({ x: lerp(topo.x, base.x, k), y: lerp(topo.y, base.y, k) });
  return { topo, base, maoAlta: ao(0.38), maoBaixa: ao(0.56) };
}
function poseSala(t, m) {
  const p = { olhoX: 0.5, olhoY: -0.85, cabRot: -0.22, pupila: 0.5, sobr: -0.3, cantoE: -2, cantoD: -3 };
  if (t < m.b.titulo) { // noite 1: já está no sofá, batendo
    const ks = m.n1.k;
    let d = 0;
    // antes de cada contato o cabo desce e sobe rápido; o contato é o instante k
    for (const k of ks) {
      if (t >= k - 0.3 && t < k) { const q = (t - (k - 0.3)) / 0.3; d = q < 0.6 ? 44 * saida(q / 0.6) : 44 * (1 - entrada((q - 0.6) / 0.4)); }
    }
    if (t < ks[0]) d = 40 * (1 - entrada(fr(t, ks[0] - 0.12, ks[0])));
    const abaixa = suave(fr(t, m.n1.abaixa, m.n1.abaixa + 0.8));
    const v = vassouraNoTeto(d);
    const lado = vassouraAoLado({ x: 0, y: 0 });
    const vt = { x: lerp(v.topo.x - SALA.x, lado.topo.x, abaixa), y: lerp(v.topo.y - SALA.assento, lado.topo.y, abaixa) };
    const vb = { x: lerp(v.base.x - SALA.x, lado.base.x, abaixa), y: lerp(v.base.y - SALA.assento, lado.base.y, abaixa) };
    p.vassoura = { topo: vt, base: vb };
    const ao = (k) => ({ x: lerp(vt.x, vb.x, k), y: lerp(vt.y, vb.y, k) });
    const solta = suave(fr(t, m.n1.abaixa + 0.5, m.n1.abaixa + 0.9));
    const hPerto = ao(0.56), ladoPerto = { x: 34, y: -192 };
    p.maos = [{ x: lerp(hPerto.x, ladoPerto.x, solta), y: lerp(hPerto.y, ladoPerto.y, solta) }, ao(lerp(0.38, 0.45, abaixa))];
    const golpe = ks.reduce((a, k) => Math.max(a, t >= k ? Math.exp(-(t - k) * 9) : 0), 0);
    p.corpo = { x: 0, y: -4 * golpe + 4 * (d > 20 && abaixa === 0 ? 1 : 0) };
    p.palpS = 0.25 * golpe;
    p.olhoY = lerp(-0.85, -0.2, abaixa); p.cabRot = lerp(-0.22, -0.04, abaixa); p.sobr = lerp(-0.4, -0.1, abaixa);
    p.cantoE = -2; p.cantoD = lerp(-3, -1, abaixa);
    p.palpS = Math.max(p.palpS, pulso(t, m.n1.para + 0.35, 0.07));
    p.gesto = 'Lurdes: vassoura no teto';
    p.origem = { x: SALA.x, y: SALA.assento };
    return p;
  }
  // noite 2: de pé no chão; sobe no sofá com preparação; levanta a vassoura; a música para sozinha; responde
  const n = m.n2, org = { x: 940, y: SALA.chao };
  const seatL = { x: 60, y: SALA.assento - SALA.chao }; // assento no referencial dela
  p.origem = org;
  const s1 = suave(fr(t, n.pe1 - 0.5, n.pe1)), sob = suave(fr(t, n.sobe, n.sobe + 0.8)), s2 = fr(t, n.sobe + 0.05, n.pe2);
  p.corpo = { x: 60 * sob, y: seatL.y * sob };
  const pe1 = { x: lerp(10, seatL.x + 10, s1), y: lerp(-14, seatL.y - 14, s1) - Math.sin(Math.PI * s1) * 40 };
  const pe2 = { x: lerp(-8, seatL.x - 8, suave(s2)), y: lerp(-14, seatL.y - 14, suave(s2)) - Math.sin(Math.PI * s2) * 50 };
  p.pes = [pe1, pe2];
  // mãos: a de perto vai ao encosto e apoia; a de longe segura a vassoura em pé ao lado do corpo
  const encosto = { x: 40, y: SALA.encosto - SALA.chao + 6 };
  const ladoPerto = { x: p.corpo.x + 36, y: p.corpo.y - 190 };
  let hPerto = ladoPerto;
  const apoia = suave(fr(t, n.encosto - 0.5, n.encosto));
  hPerto = { x: lerp(hPerto.x, encosto.x, apoia), y: lerp(hPerto.y, encosto.y, apoia) };
  const larga = suave(fr(t, n.sobe + 0.4, n.sobe + 0.7)); // solta o encosto antes do braço esticar
  hPerto = { x: lerp(hPerto.x, ladoPerto.x, larga), y: lerp(hPerto.y, ladoPerto.y, larga) };
  // vassoura: de pé ao lado, depois erguida até perto do teto (em coordenadas da sala)
  const er = suave(fr(t, n.ergue, n.ergue + 0.8));
  // toques leves: o cabo sobe só até encostar e volta
  let dTeto = lerp(100, 46, er); // em pé no sofá, o cabo já está perto do teto
  for (const k of n.toque) { if (t >= k - 0.2 && t < k + 0.22) { const q = t < k ? suave(fr(t, k - 0.2, k)) : 1 - suave(fr(t, k, k + 0.22)); dTeto = lerp(46, 0, q); } }
  const ab = suave(fr(t, n.abaixa, n.abaixa + 1.2));
  const vMundo = vassouraNoTeto(dTeto, -8 + 8 * er);
    let vt = { x: vMundo.topo.x - org.x, y: vMundo.topo.y - org.y }, vb = { x: vMundo.base.x - org.x, y: vMundo.base.y - org.y };
  const lado = vassouraAoLado(p.corpo), k = er * (1 - ab); // 0 = de pé ao lado, 1 = no teto
  vt = { x: lerp(lado.topo.x, vt.x, k), y: lerp(lado.topo.y, vt.y, k) }; vb = { x: lerp(lado.base.x, vb.x, k), y: lerp(lado.base.y, vb.y, k) };
  p.vassoura = { topo: vt, base: vb };
  const naVassoura = (k) => ({ x: lerp(vt.x, vb.x, k), y: lerp(vt.y, vb.y, k) });
  const hLonge = naVassoura(lerp(0.45, 0.38, k));
  const hPertoV = naVassoura(0.56);
  const doisNoCabo = suave(fr(t, n.ergue - 0.2, n.ergue + 0.2)) * (1 - suave(fr(t, n.abaixa + 0.7, n.abaixa + 1.1)));
  hPerto = { x: lerp(hPerto.x, hPertoV.x, doisNoCabo), y: lerp(hPerto.y, hPertoV.y, doisNoCabo) };
  p.maos = [hPerto, hLonge];
  p.gesto = t >= n.encosto - 0.5 && t < n.sobe + 0.7 ? 'Lurdes: mão no encosto' : 'Lurdes: vassoura (noite 2)';
  // rosto: ouve a música, olha para cima, decide; a música para; espera; responde; o canto da boca sobe
  const olhaCima = suave(fr(t, n.musica + 0.8, n.musica + 1.1));
  p.olhoY = lerp(0, -0.85, olhaCima); p.cabRot = lerp(0, -0.2, olhaCima);
  p.olhoX = 0.55; p.sobr = lerp(0, -0.35, olhaCima);
  const parou = fr(t, n.para + 0.2, n.para + 0.4);
  p.sobr = lerp(p.sobr, 0.5, parou); p.pupila = lerp(0.5, 0.42, parou);
  const ouve = fr(t, n.deCima[0] + 0.12, n.deCima[0] + 0.3);
  p.sobr = lerp(p.sobr, 0.8, ouve); p.pupila = lerp(p.pupila, 0.55, ouve);
  const olhaV = suave(fr(t, n.olha, n.olha + 0.35)) * (1 - suave(fr(t, n.toque[0] - 0.4, n.toque[0] - 0.2)));
  p.olhoX = lerp(p.olhoX, 0.9, olhaV); p.olhoY = lerp(p.olhoY, -0.4, olhaV);
  const so = suave(fr(t, n.sorri, n.sorri + 0.8));
  p.cantoE = lerp(-1, 2, so); p.cantoD = lerp(-2, 7, so); p.sobr = lerp(p.sobr, 0.2, so);
  p.olhoY = lerp(p.olhoY, -0.1, ab); p.cabRot = lerp(p.cabRot, -0.03, ab);
  p.palpS = pulso(t, n.para + 0.5, 0.07) + pulso(t, n.sorri + 0.9, 0.12) * 0.9;
  return p;
}
function cenaA(g, t, m) {
  const noite2 = t >= m.b.noite2;
  const ini = noite2 ? m.b.noite2 : m.b.noite1, dur = noite2 ? 14 : m.b.titulo - m.b.noite1;
  // gancho: perto dela e do teto. A noite 2 começa um pouco mais aberta (ela ainda está no chão) e se aproxima devagar
  const cam = noite2 ? { z: lerp(1.22, 1.42, suave(fr(t, ini, ini + dur))), cx: lerp(990, 1010, fr(t, ini, ini + 5)), cy: lerp(580, 490, suave(fr(t, ini, ini + 6))) }
    : { z: lerp(1.45, 1.5, fr(t, ini, ini + dur)), cx: 1015, cy: 470 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.85, () => {
    g.fillStyle = '#2b2642'; g.fillRect(-400, SALA.teto, 2720, SALA.chao - SALA.teto);
    g.fillStyle = '#1f1b30'; g.fillRect(-400, -400, 2720, SALA.teto + 400);
    forma(g, [[-400, SALA.teto - 8], [2320, SALA.teto - 8], [2320, SALA.teto + 10], [-400, SALA.teto + 10]], '#3a3352', { seed: 1040, linha: 5, reto: true });
    g.fillStyle = '#1b1828'; g.fillRect(-400, SALA.chao, 2720, 600);
    traco(g, [[-400, SALA.chao], [2320, SALA.chao]], 5, { seed: 1041 });
    janelaNoite(g, 1490, 300, 250, 270);
    relogioParede(g, 780, 400, 46, t);
    forma(g, [[1120, 330], [1250, 330], [1250, 450], [1120, 450]], '#5d4a6e', { seed: 1042, linha: 5, reto: true }); // quadro
    forma(g, [[1140, 350], [1230, 350], [1230, 430], [1140, 430]], '#a58bb8', { seed: 1043, linha: 3, reto: true });
  });
  camada(g, cam, 1, () => {
    abajur(g, 420, 620);
    sofa(g);
    const p = poseSala(t, m);
    P.lurdesPerfil(g, p.origem.x, p.origem.y, p);
    if (!noite2) m.n1.k.forEach((k) => poeira(g, t, k, 1068));
    else { m.n2.deCima.forEach((k) => poeira(g, t, k, 1050, 0.45)); m.n2.toque.forEach((k) => poeira(g, t, k, 1064, 0.35)); }
    luz(g, 420, 330, 1500, '#fff0cf', '#231d3a');
    brilho(g, 420, 360, 460, '#ffcf7a', 0.45);
    brilho(g, 1000, 650, 700, '#ffcf7a', 0.12);
  });
}

// ---------------------------------------------------------------- B · corredor do 5º andar, de manhã
const COR_ = { chao: 930, portaX0: 1190, portaX1: 1540, portaY0: 380, botao: { x: 1132, y: 640 } };
function portasElevador(g, abre, x0, x1, y0, y1, dentro) {
  const w = (x1 - x0) / 2, a = abre * w * 0.96;
  if (abre > 0.01) dentro();
  forma(g, [[x0 + w - a - w, y0], [x0 + w - a, y0], [x0 + w - a, y1], [x0 + w - a - w, y1]], '#9aa3b4', { seed: 1101, linha: 5, reto: true });
  forma(g, [[x0 + w + a, y0], [x0 + w + a + w, y0], [x0 + w + a + w, y1], [x0 + w + a, y1]], '#9aa3b4', { seed: 1102, linha: 5, reto: true });
}
function poseLurdesB(t, m) {
  const p = { olhoX: 0.6, olhoY: 0, pupila: 0.5, cantoE: 0, cantoD: 0, sobr: 0 };
  const e = m.e;
  // botão: a mão sai do lado do corpo, aperta e volta
  const lado = { x: 34, y: -196 };
  const bt = { x: COR_.botao.x - 1010 + 6, y: COR_.botao.y - COR_.chao };
  const vai = suave(fr(t, m.ma.botao - 0.4, m.ma.botao)), volta = suave(fr(t, m.ma.botao + 0.12, m.ma.botao + 0.5));
  let h = { x: lerp(lerp(lado.x, bt.x, vai), lado.x, volta), y: lerp(lerp(lado.y, bt.y, vai), lado.y, volta) };
  p.gesto = t > m.ma.botao - 0.03 && t < m.ma.botao + 0.1 ? 'Lurdes: botão' : null;
  p.olhoY = 0.3 * vai * (1 - volta);
  // olha o indicador em "cima"
  const sobe = suave(fr(t, m.ma.cima - 0.05, m.ma.cima + 0.2)) * (1 - suave(fr(t, m.ma.cima + 1.1, m.ma.cima + 1.4)));
  p.olhoY = lerp(p.olhoY, -0.8, sobe); p.cabRot = -0.12 * sobe;
  // portas abrem e ele está lá dentro: ela recua meio passo, espera, entra
  const ve = suave(fr(t, e.abre + 0.5, e.abre + 0.7));
  p.sobr = 0.6 * ve * (1 - fr(t, e.recua + 0.8, e.recua + 1.2)); p.pupila = lerp(0.5, 0.42, ve);
  p.cantoE = -2 * ve; p.cantoD = -2 * ve;
  const rec = suave(fr(t, e.recua, e.recua + 0.3)), s1 = fr(t, e.passo1 - 0.38, e.passo1), s2 = fr(t, e.passo2 - 0.5, e.passo2);
  const pePerto = { x: lerp(lerp(10, -22, rec), 104, suave(s2)), y: -14 - Math.sin(Math.PI * s2) * 24 - Math.sin(Math.PI * fr(t, e.recua, e.recua + 0.3)) * 14 };
  const peLonge = { x: lerp(-8, 54, suave(s1)), y: -14 - Math.sin(Math.PI * s1) * 24 };
  p.pes = [pePerto, peLonge];
  p.corpo = { x: lerp(lerp(0, -16, rec), 80, suave(fr(t, e.passo1 - 0.38, e.passo2))), y: 4 * Math.sin(Math.PI * s1) + 4 * Math.sin(Math.PI * s2) }; // o corpo afunda um pouco no passo (a perna de trás não estica)
  p.rot = -0.05 * rec * (1 - fr(t, e.passo1 - 0.4, e.passo1));
  h = { x: h.x + p.corpo.x, y: h.y + p.corpo.y };
  p.maos = [h, { x: p.corpo.x + 22, y: -200 + p.corpo.y }];
  p.palpS = pulso(t, m.b.manha + 0.2, 0.07) + pulso(t, e.recua + 0.9, 0.07);
  return p;
}
function cenaB(g, t, m) {
  const cam = { z: lerp(1.0, 1.03, fr(t, m.b.manha, m.e.corte)), cx: 980, cy: 560 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  const abre = suave(fr(t, m.e.abre, m.e.aberta));
  camada(g, cam, 1, () => {
    g.fillStyle = '#4a4f66'; g.fillRect(-400, -400, 2720, COR_.chao + 400);
    g.fillStyle = '#2c2e3e'; g.fillRect(-400, COR_.chao, 2720, 600);
    traco(g, [[-400, COR_.chao], [2320, COR_.chao]], 5, { seed: 1110 });
    for (let x = -300; x < 2300; x += 160) traco(g, [[x, COR_.chao + 2], [x - 120, 1300]], 3, { seed: 1111 + x, tinta: '#24263a', tremor: 0.3 });
    // porta do 501
    forma(g, [[280, 380], [540, 380], [540, COR_.chao], [280, COR_.chao]], '#6b4a3a', { seed: 1120, linha: 6, reto: true });
    forma(g, [[300, 400], [520, 400], [520, COR_.chao], [300, COR_.chao]], '#8a5e46', { seed: 1121, linha: 5, reto: true });
    g.fillStyle = '#e9c46a'; g.beginPath(); g.arc(495, 680, 10, 0, 7); g.fill();
    forma(g, [[370, 450], [450, 450], [450, 494], [370, 494]], '#e9e2d0', { seed: 1122, linha: 4, reto: true });
    g.font = '34px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = TINTA; g.fillText('501', 410, 474);
    // elevador: moldura, portas, indicador, botão
    forma(g, [[COR_.portaX0 - 30, COR_.portaY0 - 30], [COR_.portaX1 + 30, COR_.portaY0 - 30], [COR_.portaX1 + 30, COR_.chao], [COR_.portaX0 - 30, COR_.chao]], '#6d7486', { seed: 1130, linha: 6, reto: true });
    portasElevador(g, abre, COR_.portaX0, COR_.portaX1, COR_.portaY0, COR_.chao, () => {
      g.save(); g.beginPath(); g.rect(COR_.portaX0, COR_.portaY0, COR_.portaX1 - COR_.portaX0, COR_.chao - COR_.portaY0); g.clip();
      g.fillStyle = '#b9c3cf'; g.fillRect(COR_.portaX0, COR_.portaY0, 400, 600);
      g.fillStyle = '#8d97a6'; g.fillRect(COR_.portaX0, COR_.chao - 60, 400, 60);
      traco(g, [[COR_.portaX0, 690], [COR_.portaX1, 690]], 7, { seed: 1131, tinta: '#dfe5ec' });
      const pc = poseCaioC(t, m);
      g.save(); g.translate(1365, COR_.chao - 6); g.scale(0.66, 0.66); P.caioFrente(g, 0, 0, pc); g.restore();
      brilho(g, 1365, 420, 300, '#eef6ff', 0.35);
      g.restore();
    });
    const a = andarEm(t);
    forma(g, [[1300, 290], [1430, 290], [1430, 350], [1300, 350]], '#1a1a22', { seed: 1140, linha: 5, reto: true });
    g.save(); g.font = '40px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffb347'; g.shadowColor = '#ff9a2e'; g.shadowBlur = 12;
    g.fillText(a.n, 1345, 322);
    if (a.seta) { const y = 304 + ((t * 1.6) % 1) * 22; g.beginPath(); g.moveTo(1392, y + 14); g.lineTo(1404, y); g.lineTo(1380, y); g.closePath(); g.fill(); }
    g.restore();
    const chegou = t >= m.e.plim; // luz de chegada
    g.fillStyle = chegou ? '#7dff9a' : '#2b3a30'; g.beginPath(); g.arc(1460, 320, 9, 0, 7); g.fill();
    forma(g, [[COR_.botao.x - 22, COR_.botao.y - 40], [COR_.botao.x + 22, COR_.botao.y - 40], [COR_.botao.x + 22, COR_.botao.y + 40], [COR_.botao.x - 22, COR_.botao.y + 40]], '#8a92a3', { seed: 1141, linha: 4, reto: true });
    const aceso = t >= m.ma.botao && t < m.e.plim;
    g.fillStyle = aceso ? '#ffd27a' : '#d6d9e0'; g.beginPath(); g.arc(COR_.botao.x, COR_.botao.y, 11, 0, 7); g.fill();
    g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke();
    const p = poseLurdesB(t, m);
    P.lurdesPerfil(g, 1010, COR_.chao, p);
    luz(g, 960, 120, 1500, '#f4f6ff', '#2a2c40');
  });
}

// ---------------------------------------------------------------- C · dentro do elevador, geral frontal
const EL = { x0: 520, x1: 1400, y0: 110, y1: 900, caio: { x: 770, y: 1000, s: 0.95 }, lurdes: { x: 1540, y: 1015, s: 1 }, pend: { x: 1150, y: 430 }, rail: 710 };
// corrimão lateral em perspectiva: do canto do fundo (1400, 710) até a borda da frente (1960, 842)
function railLado(x) { return EL.rail + ((x - EL.x1) / 560) * 132; }
function railLadoE(x) { return EL.rail + ((EL.x0 - x) / 560) * 132; }
function caixaElevador(g, t, luzK) {
  // paredes, teto, chão (aço escovado) e painel na parede da esquerda
  forma(g, [[EL.x0, EL.y0], [EL.x1, EL.y0], [EL.x1, EL.y1], [EL.x0, EL.y1]], '#aeb6c3', { seed: 1201, linha: 6, reto: true });
  for (let x = EL.x0 + 176; x < EL.x1; x += 176) traco(g, [[x, EL.y0], [x, EL.y1]], 3, { seed: 1202 + x, tinta: '#8f98a8', tremor: 0.3 });
  // cantos da frente: as quinas seguem as linhas de fuga
  const tE = [EL.x0 - 560, EL.y0 - 150], tD = [EL.x1 + 560, EL.y0 - 150], bE = [EL.x0 - 560, EL.y1 + 220], bD = [EL.x1 + 560, EL.y1 + 220];
  forma(g, [tE, [EL.x0, EL.y0], [EL.x0, EL.y1], bE], '#98a1b0', { seed: 1210, linha: 6, reto: true });
  forma(g, [tD, [EL.x1, EL.y0], [EL.x1, EL.y1], bD], '#98a1b0', { seed: 1211, linha: 6, reto: true });
  forma(g, [tE, tD, [EL.x1, EL.y0], [EL.x0, EL.y0]], '#6d7486', { seed: 1212, linha: 6, reto: true });
  forma(g, [[EL.x0, EL.y1], [EL.x1, EL.y1], bD, bE], '#5a5f6e', { seed: 1213, linha: 6, reto: true });
  // luz do teto
  g.save(); g.globalAlpha = 0.35 + 0.65 * luzK;
  forma(g, [[720, 30], [1200, 30], [1160, 84], [760, 84]], '#f3f8ff', { seed: 1214, linha: 5, reto: true });
  g.restore();
  // corrimãos: fundo e paredes laterais
  const rr = EL.rail;
  traco(g, [[EL.x0 + 10, rr], [EL.x1 - 10, rr]], 16, { seed: 1220, tinta: TINTA });
  traco(g, [[EL.x0 + 10, rr], [EL.x1 - 10, rr]], 9, { seed: 1220, tinta: '#dfe4ea' });
  const xr = 1960;
  traco(g, [[EL.x1, rr], [xr, railLado(xr)]], 20, { seed: 1221, tinta: TINTA });
  traco(g, [[EL.x1, rr], [xr, railLado(xr)]], 11, { seed: 1221, tinta: '#dfe4ea' });
  traco(g, [[EL.x0, rr], [-40, railLadoE(-40)]], 20, { seed: 1222, tinta: TINTA });
  traco(g, [[EL.x0, rr], [-40, railLadoE(-40)]], 11, { seed: 1222, tinta: '#dfe4ea' });
  // painel
  forma(g, [[300, 330], [440, 356], [440, 640], [300, 668]], '#7b8394', { seed: 1230, linha: 5, reto: true });
  forma(g, [[318, 360], [424, 378], [424, 430], [318, 420]], '#16161d', { seed: 1231, linha: 4, reto: true });
  const a = andarEm(t);
  g.save(); g.font = '40px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffb347'; g.shadowColor = '#ff9a2e'; g.shadowBlur = 10;
  g.fillText(a.n, 356, 396);
  if (a.seta) { const y = 380 + ((t * 1.6) % 1) * 22; g.beginPath(); g.moveTo(398, y + 14); g.lineTo(410, y); g.lineTo(386, y); g.closePath(); g.fill(); }
  g.restore();
  for (let i = 0; i < 8; i++) { const bx = 338 + (i % 2) * 52, by = 470 + Math.floor(i / 2) * 42; g.fillStyle = i === 0 ? '#ffd27a' : '#d6d9e0'; g.beginPath(); g.arc(bx, by, 11, 0, 7); g.fill(); g.lineWidth = 3; g.strokeStyle = TINTA; g.stroke(); }
}
function bobDe(t, ativo) { return ativo ? 0.05 * Math.sin((2 * Math.PI * t) / 0.6) : 0; }
function poseCaioC(t, m) {
  const p = { olhoX: 0.1, olhoY: 0.35, pupila: 0.5, fone: 0, cantoE: 0, cantoD: 0 };
  const tocando = t < m.nt.para; // mexe a cabeça no ritmo até notar o medo dela
  p.bob = bobDe(t, tocando);
  if (t < m.b.silencio) {
    p.fone = t < m.nt.toca + 0.05 ? 0 : t < m.nt.pescoco ? suave(fr(t, m.nt.toca + 0.05, m.nt.pescoco)) : 1;
    const olhaEla = pulso(t, m.e.corte + 0.5, 0.25) * (t > m.e.corte ? 1 : 0);
    p.olhoX = lerp(0.1, 0.9, Math.min(1, olhaEla * 2)); p.olhoY = lerp(0.35, 0.05, Math.min(1, olhaEla * 2));
    const tc = m.tr.tranco, luzOlha = suave(fr(t, tc + 0.25, tc + 0.4)) * (1 - suave(fr(t, tc + 1.2, tc + 1.5)));
    p.olhoY = lerp(p.olhoY, -0.85, luzOlha); p.olhoX = lerp(p.olhoX, 0.0, luzOlha); p.sobr = 0.3 * luzOlha;
    p.dy = t >= tc ? 12 * Math.exp(-(t - tc) * 7) * Math.cos((t - tc) * 30) * (t - tc < 0.3 ? 1 : 0.4) : 0;
    p.bob *= t > tc ? 0.6 : 1;
    p.palpS = 0.15 + pulso(t, m.bd.olhaTexto + 0.3, 0.07);
    return p;
  }
  // silêncio e resposta: fone no pescoço; a mão aperta o botão do fone e volta ao bolso
  p.fone = 1;
  const f = P.foneEm(1);
  const naConcha = { x: f.x + 6, y: f.y + 14 };
  const solta = suave(fr(t, m.si.clique + 0.35, m.si.clique + 0.8));
  p.maos = [null, solta >= 1 ? null : { x: lerp(naConcha.x, 30, solta), y: lerp(naConcha.y, -334, solta) }];
  p.gesto = t < m.si.clique + 0.1 ? 'Caio: botão do fone' : null;
  p.olhoX = 0.3; p.olhoY = 0.55; p.sobrInc = 0.5; p.cantoE = -2; p.cantoD = -1;
  const olhaFrase = suave(fr(t, m.b.silencio + 2.2, m.b.silencio + 2.5));
  p.olhoX = lerp(p.olhoX, 0.75, olhaFrase); p.olhoY = lerp(p.olhoY, 0.2, olhaFrase);
  const r = m.b.resposta;
  p.abre = 0.18 * Math.sin(Math.PI * fr(t, r + 0.35, r + 0.75));
  const cima = suave(fr(t, m.rs.encaixe + 0.1, m.rs.encaixe + 0.3)) * (1 - suave(fr(t, r + 3.2, r + 3.4)));
  p.olhoY = lerp(p.olhoY, -0.85, cima); p.olhoX = lerp(p.olhoX, 0.2, cima);
  const ela = suave(fr(t, r + 3.4, r + 3.6)) * (1 - suave(fr(t, r + 4.2, r + 4.4)));
  p.olhoX = lerp(p.olhoX, 0.95, ela); p.olhoY = lerp(p.olhoY, 0.1, ela); p.cantoD = lerp(p.cantoD, 4, ela);
  p.palpS = 0.15 + pulso(t, m.si.clique + 0.5, 0.07) + pulso(t, r + 4.5, 0.07);
  return p;
}
function poseLurdesC(t, m) {
  const p = { olhoX: 0.15, olhoY: 0.1, pupila: 0.5, sacola: true, chaves: true, cantoE: 0, cantoD: 0, sobr: 0 };
  const strap = { x: 52, y: -322 };
  let hE = { x: -92, y: -190 }, hD = { x: 92, y: -192 };
  p.dy = t < m.e.pousa + 0.3 && t >= m.e.corte ? 6 * Math.sin(Math.PI * fr(t, m.e.corte, m.e.pousa + 0.3)) : 0;
  // olha o Caio de relance e volta
  const relance = Math.max(pulso(t, m.e.motor + 0.2, 0.3), pulso(t, m.bd.olhaCaio + 0.35, 0.4));
  p.olhoX = lerp(p.olhoX, -0.9, Math.min(1, relance * 1.6));
  // bom dia
  p.abre = 0.28 * Math.sin(Math.PI * fr(t, m.bd.boca, m.bd.texto + 0.25));
  const olhaTexto = suave(fr(t, m.bd.olhaTexto, m.bd.olhaTexto + 0.2)) * (1 - suave(fr(t, m.bd.olhaTexto + 0.8, m.bd.olhaTexto + 1.0)));
  p.olhoX = lerp(p.olhoX, -0.65, olhaTexto); p.olhoY = lerp(p.olhoY, -0.6, olhaTexto);
  p.sobrInc = 0.4 * fr(t, m.bd.texto + 1.0, m.bd.texto + 2.0);
  // ajeita a alça duas vezes (gesto mínimo do plano sustentado)
  let os = 0;
  for (const a of m.bd.alca) { const q = Math.sin(Math.PI * fr(t, a, a + 0.6)); hE = { x: lerp(hE.x, strap.x, Math.min(1, q * 1.4)), y: lerp(hE.y, strap.y, Math.min(1, q * 1.4)) }; os += 8 * Math.max(0, Math.sin(Math.PI * fr(t, a + 0.15, a + 0.45))); }
  p.ombroSacola = os;
  const tc = m.tr.tranco;
  if (t >= tc) { // tranco: encolhe, olhos arregalados para cima
    p.dy = 14 * Math.exp(-(t - tc) * 7) * Math.cos((t - tc) * 30) * (t - tc < 0.3 ? 1 : 0.4);
    const susto = fr(t, tc + 0.08, tc + 0.2);
    p.olhoY = lerp(p.olhoY, -0.8, susto); p.olhoX = lerp(p.olhoX, 0, susto); p.pupila = lerp(0.5, 0.36, susto); p.sobr = 0.8 * susto;
    p.cantoE = -3 * susto; p.cantoD = -3 * susto; p.ombroSacola = 10 * susto;
  }
  if (t >= m.b.silencio) { // depois do medo: a mão direita no corrimão do lado; os olhos baixos
    const xParede = EL.x1 + (EL.lurdes.y - EL.y1) / 0.393;
    const rail = { x: xParede - 14, y: railLado(xParede - 14) };
    hD = { x: (rail.x - EL.lurdes.x) / EL.lurdes.s, y: (rail.y - EL.lurdes.y) / EL.lurdes.s };
    p.gesto = 'Lurdes: corrimão';
    p.olhoX = 0.05; p.olhoY = 0.45; p.pupila = 0.4; p.sobr = 0.4; p.sobrInc = 0.7; p.cantoE = -2; p.cantoD = -2; p.ombroSacola = 0;
    const r = m.b.resposta;
    const ouve = suave(fr(t, m.rs.texto + 0.05, m.rs.texto + 0.3));
    p.olhoX = lerp(p.olhoX, -0.9, ouve); p.olhoY = lerp(p.olhoY, -0.3, ouve); p.sobr = lerp(p.sobr, 0.7, ouve);
    const cima = suave(fr(t, m.rs.encaixe + 0.1, m.rs.encaixe + 0.3)) * (1 - suave(fr(t, r + 3.1, r + 3.3)));
    p.olhoY = lerp(p.olhoY, -0.85, cima); p.olhoX = lerp(p.olhoX, -0.1, cima);
    const ele = suave(fr(t, r + 3.3, r + 3.5)) * (1 - suave(fr(t, r + 4.1, r + 4.3)));
    p.olhoX = lerp(p.olhoX, -0.95, ele); p.olhoY = lerp(p.olhoY, -0.2, ele);
    const alivio = suave(fr(t, m.rs.encaixe + 0.4, r + 3.6));
    p.cantoE = lerp(-2, 2, alivio); p.cantoD = lerp(-2, 3, alivio); p.sobrInc = lerp(0.7, 0.3, alivio); p.pupila = lerp(0.4, 0.5, alivio);
  }
  p.maos = [hE, hD];
  p.palpS = pulso(t, m.bd.texto + 1.6, 0.07) + pulso(t, m.bd.alca[1] + 1.2, 0.07) + pulso(t, m.b.silencio + 1.4, 0.08) + pulso(t, m.b.resposta + 4.6, 0.07);
  return p;
}
// as duas frases: posição, rotação e escala
function frasesEm(t, m) {
  const out = [];
  const bocaL = { x: EL.lurdes.x, y: EL.lurdes.y - 380 * EL.lurdes.s }, bocaC = { x: EL.caio.x + 2, y: EL.caio.y - 616 * EL.caio.s };
  const enc = m.rs.encaixe, tc = m.tr.tranco;
  if (t >= m.bd.texto && t < enc + 0.5) {
    const ap = fr(t, m.bd.texto, m.bd.texto + 0.18), vai = suave(fr(t, m.bd.texto + 0.25, m.bd.texto + 1.2));
    let x = lerp(bocaL.x - 270, EL.pend.x, vai), y = lerp(bocaL.y - 40, EL.pend.y, vai) + Math.sin(t * 1.9) * 3;
    let r = Math.sin(t * 1.3) * 0.02;
    if (t >= tc) { const u = t - tc; r += 0.34 * Math.exp(-u / 1.1) * Math.sin(2 * Math.PI * 0.9 * u); y += 10 * Math.exp(-u * 6) * Math.sin(u * 30); }
    let esc = voltaAtras(ap) * 1;
    y -= 40 * suave(fr(t, m.rs.texto, m.rs.texto + 0.35)); // a dela sobe um pouco e abre lugar embaixo
    let alfa = 1;
    if (t >= enc) { const q = fr(t, enc + 0.22, enc + 0.48); esc *= (1 - 0.08 * Math.sin(Math.PI * fr(t, enc, enc + 0.2))) * (1 - entrada(q)); alfa = 1 - q; }
    out.push({ txt: 'Bom dia.', x, y, tam: 72, r, esc, alfa, piv: 'topo' });
  }
  if (t >= m.rs.texto && t < enc + 0.5) {
    const ap = fr(t, m.rs.texto, m.rs.texto + 0.18), vai = suave(fr(t, m.rs.texto + 0.2, enc));
    // encaixa logo abaixo da dela (72 px em cima, 60 px embaixo), com a mesma inclinação dela no instante do encaixe
    const alvo = { x: EL.pend.x, y: EL.pend.y - 40 + 72 * 0.5 + 60 * 0.5 + 2 };
    let x = lerp(bocaC.x + 215, alvo.x, vai), y = lerp(bocaC.y + 70, alvo.y, vai) + Math.sin(Math.PI * vai) * 14; // passa por baixo da dela
    let esc = voltaAtras(ap), alfa = 1;
    const rEla = Math.sin(t * 1.3) * 0.02, r = rEla * vai;
    if (vai > 0) { x += Math.sin(r) * -(alvo.y - EL.pend.y + 72 * 0.55) * vai; y += Math.sin(t * 1.9) * 3 * vai; } // segue o giro e o balanço dela em volta do pino
    if (t >= enc) { const q = fr(t, enc + 0.22, enc + 0.48); esc *= (1 - 0.08 * Math.sin(Math.PI * fr(t, enc, enc + 0.2))) * (1 - entrada(q)); alfa = 1 - q; }
    out.push({ txt: 'Bom dia.', x, y, tam: 60, r, esc, alfa, piv: 'meio' });
  }
  return out;
}
function cenaC(g, t, m) {
  const tc = m.tr.tranco, u = t - tc;
  const treme = u > 0 && u < 0.6 ? Math.exp(-u * 8) : 0;
  const pl = planoEm(t);
  const z = pl.bloco === 'bomdia' ? lerp(1.0, 1.05, fr(t, m.b.bomdia, m.b.painel)) : pl.bloco === 'resposta' ? lerp(1.05, 1.08, fr(t, m.b.resposta, m.b.terreo)) : pl.bloco === 'silencio' ? lerp(1.04, 1.05, fr(t, m.b.silencio, m.b.resposta)) : 1.02;
  const cam = { z, cx: 980, cy: 560, sx: Math.sin(u * 83) * 16 * treme, sy: Math.cos(u * 71) * 22 * treme };
  const lk = luzElevador(t);
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 1, () => {
    caixaElevador(g, t, lk);
    const pc = poseCaioC(t, m), pl2 = poseLurdesC(t, m);
    g.save(); g.translate(EL.caio.x, EL.caio.y); g.scale(EL.caio.s, EL.caio.s); P.caioFrente(g, 0, 0, pc); g.restore();
    g.save(); g.translate(EL.lurdes.x, EL.lurdes.y); g.scale(EL.lurdes.s, EL.lurdes.s); P.lurdesFrente(g, 0, 0, pl2); g.restore();
    for (const f of frasesEm(t, m)) frase(g, f.txt, f.x, f.y, f.tam, f);
    luz(g, 960, 60, 1500, '#f6f9ff', '#2c3042');
    escurece(g, (1 - lk) * 0.62, '10,8,22');
    if (lk < 0.7) brilho(g, 960, 60, 700, '#ffd9a0', 0.08); // a luz de emergência, mais quente
  });
}

// ---------------------------------------------------------------- D · detalhe do painel
function cenaD(g, t, m) {
  const u = t - m.b.painel;
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, { z: lerp(1.0, 1.04, u / 3), cx: 960, cy: 540 }, 1, () => {
    g.fillStyle = '#7b8394'; g.fillRect(-200, -200, 2320, 1480);
    for (let y = -200; y < 1300; y += 9) { g.fillStyle = `rgba(255,255,255,${0.03 + 0.03 * D.hash(y)})`; g.fillRect(-200, y, 2320, 2); }
    forma(g, [[640, 150], [1280, 150], [1280, 560], [640, 560]], '#16161d', { seed: 1301, linha: 8, reto: true });
    const a = andarEm(t);
    g.save(); g.font = '300px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffb347'; g.shadowColor = '#ff9a2e'; g.shadowBlur = 40;
    g.fillText(a.n, 880, 370);
    if (a.seta) { const y = 230 + ((t * 1.6) % 1) * 170; g.beginPath(); g.moveTo(1130, y + 110); g.lineTo(1210, y); g.lineTo(1050, y); g.closePath(); g.fill(); }
    g.restore();
    const nums = ['T', '1', '2', '3', '4', '5', '6', '7'];
    nums.forEach((nm, i) => {
      const bx = 760 + (i % 4) * 135, by = 700 + Math.floor(i / 4) * 150;
      g.fillStyle = i === 0 ? '#ffd27a' : '#d6d9e0'; g.beginPath(); g.arc(bx, by, 48, 0, 7); g.fill(); g.lineWidth = 7; g.strokeStyle = TINTA; g.stroke();
      if (i === 0) brilho(g, bx, by, 110, '#ffcf7a', 0.4);
      g.font = '50px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = TINTA; g.fillText(nm, bx, by + 3);
    });
    luz(g, 960, 200, 1400, '#f6f9ff', '#3a4052');
  });
}

// ---------------------------------------------------------------- E · close da Lurdes (três-quartos, olha para o Caio)
function poseLurdesE(t, m) {
  const p = { olhoX: -0.35, olhoY: 0.2, pupila: 0.5, cantoE: 0, cantoD: 0, sobr: 0, sobrInc: 0.3 };
  if (t < m.b.tranco) { // estalo: os olhos sobem antes da cabeça
    const s = m.es.som;
    const olhos = saida(fr(t, s + 0.12, s + 0.24)), cab = suave(fr(t, s + 0.35, s + 0.75));
    p.olhoY = lerp(0.2, -0.9, olhos); p.olhoX = lerp(-0.35, -0.1, olhos); p.cabRot = 0.07 * cab; p.dy = -10 * cab;
    p.sobr = 0.7 * olhos; p.pupila = lerp(0.5, 0.42, olhos);
    p.cantoE = -2 * cab; p.cantoD = -2 * cab;
    p.palpS = pulso(t, m.b.estalo + 0.2, 0.07);
    return p;
  }
  if (t < m.b.nota) { // medo
    const u = t - m.b.medo;
    const resp = Math.max(0, Math.sin(Math.PI * 2 * (u - 1.2) / 0.62)) * fr(u, 1.2, 1.4) * (1 - fr(u, 5.4, 5.8));
    p.ombro = 10 * resp; p.dy = -4 * resp;
    p.pupila = 0.38; p.sobr = 0.75; p.sobrInc = 0.9; p.cantoE = -5; p.cantoD = -4; p.larg = 70;
    const porta = suave(fr(u, 2.5, 2.8)) * (1 - suave(fr(u, 4.0, 4.3)));
    const baixo = suave(fr(u, 4.5, 4.8));
    p.olhoX = lerp(lerp(-0.2, 0.25, porta), -0.15, baixo); p.olhoY = lerp(lerp(-0.4, 0.05, porta), 0.6, baixo);
    p.olhoX = u < 0.6 ? lerp(-0.1, -0.2, u / 0.6) : p.olhoX;
    p.cabRot = lerp(0.05, 0, fr(u, 0, 1)) - 0.03 * baixo;
    p.palpS = pulso(u, 3.3, 0.08) + pulso(u, 5.2, 0.08);
    return p;
  }
  // vaza (segunda metade): os olhos descem até o fone e ficam; depois sobem devagar até o teto
  const u = t - m.vz.corte;
  p.pupila = 0.4; p.sobr = 0.5; p.sobrInc = 0.8; p.cantoE = -4; p.cantoD = -3; p.larg = 70;
  const fone = saida(fr(u, 0.3, 0.55)), sobe = suave(fr(u, 1.8, 2.9));
  p.olhoX = lerp(lerp(-0.6, -0.85, fone), -0.25, sobe); p.olhoY = lerp(lerp(0.1, 0.6, fone), -0.9, sobe);
  p.cabRot = 0.08 * sobe; p.dy = -12 * sobe;
  p.sobr = lerp(0.5, 0.95, fr(u, 0.55, 0.9)); p.pupila = lerp(0.4, 0.33, fr(u, 0.55, 0.9));
  p.abre = 0.14 * fr(u, 0.7, 1.0);
  p.palpS = pulso(u, 1.4, 0.08);
  return p;
}
function cenaE(g, t, m) {
  const ini = planoEm(t).de;
  const cam = { z: lerp(1.0, 1.03, fr(t, ini, ini + 6)), cx: 960, cy: 540 };
  const lk = luzElevador(t);
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.5, () => {
    g.fillStyle = '#aab2bf'; g.fillRect(-300, -300, 2520, 1700);
    for (let x = -300; x < 2300; x += 300) traco(g, [[x, -300], [x, 1400]], 5, { seed: 1401 + x, tinta: '#8f98a8', tremor: 0.3 });
    g.save(); g.filter = 'blur(9px)';
    const pc = poseCaioC(t, m);
    if (t >= m.b.vaza) { pc.fone = 1; pc.bob = 0; pc.olhoX = 0.9; pc.olhoY = 0.2; }
    g.translate(360, 1560); g.scale(1.55, 1.55); P.caioFrente(g, 0, 0, pc);
    g.restore();
  });
  camada(g, cam, 1, () => {
    const p = poseLurdesE(t, m);
    // corrimão da parede ao lado dela, em perspectiva, passando por trás do corpo; a mão procura o tubo e aperta
    traco(g, [[1180, 860], [1980, 972]], 30, { seed: 1410, tinta: TINTA });
    traco(g, [[1180, 860], [1980, 972]], 18, { seed: 1410, tinta: '#dfe4ea' });
    P.lurdesClose(g, 1150, 470, p);
    if (t >= m.b.medo) {
      const u = t - m.b.medo;
      const vai = suave(fr(u, 0.3, 0.9)), aperta = suave(fr(u, 0.9, 1.15));
      const mx = lerp(1620, 1500, vai), my = lerp(1240, 897, vai);
      P.maoCorrimao(g, mx, my, aperta, true, t * 6);
    }
    luz(g, 900, 80, 1500, '#f6f9ff', '#2c3042');
    escurece(g, (1 - lk) * 0.62, '10,8,22');
  });
  camada(g, cam, 1.3, () => { // fio de luz fria na borda da tela, do teto
    brilho(g, 960, -200, 900, '#e8f0ff', 0.12 * lk);
  });
}

// ---------------------------------------------------------------- F · close do Caio (três-quartos, olha para a Lurdes)
function poseCaioF(t, m) {
  const p = { olhoX: 0.15, olhoY: 0.45, pupila: 0.5, fone: 0, cantoE: 0, cantoD: 0 };
  const cupDir = (k) => { const dx = lerp(250, 150, k) + Math.sin(Math.PI * k) * 110, dy = lerp(10, 300, k); return { x: dx + 14, y: dy }; };
  if (t < m.b.vaza) { // nota
    const u = t - m.b.nota;
    p.bob = bobDe(t, t < m.nt.para) * 1.2;
    const mao = suave(fr(u, 0.9, 1.2));
    p.olhoX = lerp(0.15, 0.85, mao); p.olhoY = lerp(0.45, 0.85, mao);
    p.sobr = 0.4 * mao; p.sobrInc = 0.5 * mao;
    const k = suave(fr(t, m.nt.toca + 0.05, m.nt.pescoco));
    p.fone = k;
    const sobeMao = suave(fr(t, m.nt.toca - 0.6, m.nt.toca)), desce = suave(fr(t, m.nt.pescoco, m.nt.pescoco + 0.4));
    if (sobeMao > 0 && desce < 1) { const c = cupDir(k); p.mao = { x: lerp(c.x + 80, c.x, sobeMao), y: lerp(c.y + 700, c.y + 40, sobeMao) + 600 * entrada(desce) }; }
    p.palpS = 0.18 + pulso(u, 1.6, 0.07);
    return p;
  }
  if (t < m.b.entende) { // vaza (primeira metade): o fone pendurado, ele olha para ela, preocupado
    const u = t - m.b.vaza;
    p.fone = 1; p.olhoX = 0.9; p.olhoY = lerp(0.6, 0.15, suave(fr(u, 0, 0.3)));
    p.sobr = 0.55; p.sobrInc = 0.55; p.abre = 0.12 * Math.sin(Math.PI * fr(u, 0.6, 1.6)); p.cabRot = 0.03;
    p.palpS = 0.1 + pulso(u, 2.0, 0.07);
    return p;
  }
  // entende: segue o olhar dela para cima, volta para ela, vê as chaves, entende; engole; a mão vai ao botão do fone
  const u = t - m.b.entende;
  p.fone = 1;
  const cima = suave(fr(u, 0.2, 0.6)) * (1 - suave(fr(u, 1.1, 1.3)));
  const chaves = suave(fr(u, 1.8, 2.0)) * (1 - suave(fr(u, 2.6, 2.8)));
  const cima2 = suave(fr(u, 2.8, 3.0)) * (1 - suave(fr(u, 3.2, 3.35)));
  p.olhoX = 0.9; p.olhoY = 0.15;
  p.olhoX = lerp(p.olhoX, 0.4, cima); p.olhoY = lerp(p.olhoY, -0.9, cima);
  p.olhoX = lerp(p.olhoX, 0.75, chaves); p.olhoY = lerp(p.olhoY, 0.9, chaves);
  p.olhoX = lerp(p.olhoX, 0.35, cima2); p.olhoY = lerp(p.olhoY, -0.85, cima2);
  const entendeu = suave(fr(u, 3.2, 3.5));
  p.sobr = lerp(0.55, 0.85, entendeu); p.sobrInc = lerp(0.55, 1.0, entendeu); p.pupila = lerp(0.5, 0.36, entendeu);
  p.abre = 0.2 * Math.sin(Math.PI * fr(u, 3.15, 3.4));
  p.engole = Math.sin(Math.PI * fr(t, m.en.engole, m.en.engole + 0.35));
  p.dy = 6 * p.engole;
  p.cabRot = 0.03 - 0.04 * entendeu;
  if (u > 3.6) { p.olhoX = lerp(0.9, 0.5, fr(u, 3.6, 3.9)); p.olhoY = lerp(0.15, 0.6, fr(u, 3.6, 3.9)); }
  const c = cupDir(1), vai = suave(fr(t, m.en.botao, m.en.botao + 0.6));
  if (vai > 0) p.mao = { x: lerp(c.x + 80, c.x - 10, vai), y: lerp(c.y + 700, c.y + 60, vai) };
  p.palpS = 0.12 + pulso(u, 1.5, 0.07);
  return p;
}
function cenaF(g, t, m) {
  const ini = planoEm(t).de;
  const cam = { z: lerp(1.0, 1.035, fr(t, ini, ini + 5)), cx: 960, cy: 540 };
  const lk = luzElevador(t);
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.5, () => {
    g.fillStyle = '#98a1b0'; g.fillRect(-300, -300, 2520, 1700);
    g.save(); g.filter = 'blur(7px)';
    forma(g, [[40, 160], [330, 200], [330, 900], [40, 940]], '#7b8394', { seed: 1501, linha: 6, reto: true });
    forma(g, [[80, 220], [290, 248], [290, 380], [80, 360]], '#16161d', { seed: 1502, linha: 4, reto: true });
    const a = andarEm(t);
    g.font = '110px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffb347'; g.fillText(a.n, 180, 300);
    traco(g, [[300, 700], [2300, 700]], 30, { seed: 1503, tinta: '#dfe4ea' });
    g.restore();
  });
  camada(g, cam, 1, () => {
    const p = poseCaioF(t, m);
    P.caioClose(g, 760, 470, p);
    luz(g, 1000, 60, 1500, '#f6f9ff', '#2c3042');
    escurece(g, (1 - lk) * 0.62, '10,8,22');
  });
  camada(g, cam, 1.4, () => { // ela, desfocada, no primeiro plano
    g.save(); g.filter = 'blur(16px)';
    forma(g, elipsePts(1900, 1000, 330, 300, 12), '#7b5fa0', { seed: 1510, linha: 0 });
    forma(g, elipsePts(1880, 560, 210, 210, 12), '#e2c3a6', { seed: 1511, linha: 0 });
    forma(g, elipsePts(1840, 380, 150, 120, 12), '#cfcbd6', { seed: 1512, linha: 0 });
    forma(g, elipsePts(1990, 470, 130, 140, 12), '#cfcbd6', { seed: 1513, linha: 0 });
    g.restore();
  });
}

// ---------------------------------------------------------------- G · saguão, cada um para um lado
function cenaG(g, t, m) {
  const u = t - m.b.terreo;
  const cam = { z: lerp(1.0, 1.02, fr(u, 0, 7)), cx: 960, cy: 560 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  const abre = suave(fr(t, m.tm.abre, m.tm.abre + 0.7)) * (1 - suave(fr(t, m.tm.fecha, m.tm.fecha + 0.8)));
  const sai = m.tm.sai;
  // trajetórias: saem da porta, vêm para a frente e vão cada um para um lado
  const qC = fr(t, sai, sai + 4.2), qL = fr(t, sai + 0.3, sai + 5.0);
  const pC = { x: lerp(905, -220, qC), y: lerp(905, 1030, Math.min(1, qC * 2.2)), s: lerp(0.7, 0.86, Math.min(1, qC * 2.2)) };
  const pL = { x: lerp(1015, 2140, qL), y: lerp(910, 1040, Math.min(1, qL * 2.2)), s: lerp(0.72, 0.9, Math.min(1, qL * 2.2)) };
  camada(g, cam, 1, () => {
    g.fillStyle = '#5b5f73'; g.fillRect(-300, -300, 2520, 1200);
    g.fillStyle = '#3a3c4a'; g.fillRect(-300, 900, 2520, 600);
    for (let i = 0; i < 14; i++) traco(g, [[-300 + i * 190, 900], [-700 + i * 260, 1400]], 3, { seed: 1601 + i, tinta: '#2e303c', tremor: 0.3 });
    traco(g, [[-300, 900], [2300, 900]], 5, { seed: 1600 });
    // caixas de correio (o 302 é o do Nico e da Bia)
    forma(g, [[150, 470], [610, 470], [610, 720], [150, 720]], '#7a6a5a', { seed: 1610, linha: 6, reto: true });
    ['701', '702', '601', '602', '501', '502', '301', '302'].forEach((nm, i) => {
      const bx = 170 + (i % 4) * 110, by = 490 + Math.floor(i / 4) * 112;
      forma(g, [[bx, by], [bx + 96, by], [bx + 96, by + 96], [bx, by + 96]], '#a08a70', { seed: 1611 + i, linha: 4, reto: true });
      g.font = '26px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = TINTA; g.fillText(nm, bx + 48, by + 30);
      traco(g, [[bx + 20, by + 64], [bx + 76, by + 64]], 4, { seed: 1620 + i });
    });
    // porta de vidro com a rua
    forma(g, [[1450, 330], [1780, 330], [1780, 900], [1450, 900]], '#dfe9f2', { seed: 1630, linha: 7, reto: true });
    g.fillStyle = 'rgba(255,240,200,0.5)'; g.fillRect(1460, 340, 310, 550);
    traco(g, [[1615, 330], [1615, 900]], 6, { seed: 1631 });
    // vaso de planta
    forma(g, [[1290, 820], [1370, 820], [1356, 900], [1304, 900]], '#9a5a3a', { seed: 1640, linha: 5 });
    for (let i = 0; i < 5; i++) traco(g, [[1330, 822], [1270 + i * 30, 700 + (i % 2) * 30]], 7, { seed: 1641 + i, tinta: '#4f7f3e' });
    // elevador
    forma(g, [[760, 380], [1160, 380], [1160, 900], [760, 900]], '#6d7486', { seed: 1650, linha: 6, reto: true });
    portasElevador(g, abre, 790, 1130, 410, 900, () => {
      g.save(); g.beginPath(); g.rect(790, 410, 340, 490); g.clip();
      g.fillStyle = '#b9c3cf'; g.fillRect(790, 410, 340, 490);
      g.restore();
    });
    forma(g, [[900, 320], [1020, 320], [1020, 366], [900, 366]], '#1a1a22', { seed: 1651, linha: 4, reto: true });
    g.save(); g.font = '34px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffb347'; g.fillText('T', 960, 344); g.restore();
    // os dois (quem está mais perto da câmera é desenhado depois)
    const passoC = t < sai ? null : (t - sai) / m.tm.cicloC, passoL = t < m.tm.iniL ? null : (t - m.tm.iniL) / m.tm.cicloL;
    const olhaTras = suave(fr(u, 2.2, 2.45)) * (1 - suave(fr(u, 2.85, 3.1)));
    const corpoC = { fone: 1, passo: passoC, olhoX: lerp(-0.6, 0.95, olhaTras), olhoY: 0.1, cabRot: 0.08 * olhaTras, palpS: 0.15 };
    const corpoL = { sacola: true, chaves: true, passo: passoL, olhoX: 0.6, olhoY: 0.1, cantoE: 1, cantoD: 2 };
    const dentroAinda = t < sai;
    const desenhaC = () => { g.save(); g.translate(pC.x, pC.y); g.scale(pC.s, pC.s); P.caioFrente(g, 0, 0, corpoC); g.restore(); };
    const desenhaL = () => { g.save(); g.translate(pL.x, pL.y); g.scale(pL.s, pL.s); P.lurdesFrente(g, 0, 0, corpoL); g.restore(); };
    if (!dentroAinda || abre > 0.3) { if (pC.y < pL.y) { desenhaC(); desenhaL(); } else { desenhaL(); desenhaC(); } }
    luz(g, 1600, 300, 1700, '#fff6e0', '#3a3a50');
    brilho(g, 1615, 600, 500, '#fff1c8', 0.25);
  });
}

// ---------------------------------------------------------------- cartelas
function cartela(g, txt, t, ini, dur, tam) {
  g.fillStyle = '#0c0a14'; g.fillRect(0, 0, 1920, 1080);
  const a = Math.min(fr(t, ini + 0.15, ini + 0.6), 1 - fr(t, ini + dur - 0.45, ini + dur - 0.05));
  const esc = 0.96 + 0.04 * saida(fr(t, ini + 0.15, ini + 0.9));
  frase(g, txt, 960, 540, tam, { alfa: a, esc });
}

// ---------------------------------------------------------------- composição
let grao = null;
function desenhar(g, t, T) {
  marcas(T);
  const p = planoEm(t);
  D.linhaK.k = 1; D.ferv.amp = 1.6;
  if (p.id === 'A') cenaA(g, t, M);
  else if (p.id === 'B') cenaB(g, t, M);
  else if (p.id === 'C') cenaC(g, t, M);
  else if (p.id === 'D') cenaD(g, t, M);
  else if (p.id === 'E') cenaE(g, t, M);
  else if (p.id === 'F') cenaF(g, t, M);
  else if (p.id === 'G') cenaG(g, t, M);
  else if (p.id === 'titulo') { cartela(g, 'O ELEVADOR', t, M.b.titulo, 2.6, 130); return; }
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
  linhas.push(`Maior falta em qualquer quadro: ${P.FALTA.max.toFixed(1)} px`);
  linhas.push('', 'Contatos (o som é posto no mesmo instante):');
  for (const c of M.contatos) linhas.push(`  ${c.t.toFixed(3)} s  ${c.nome}`);
  return linhas.join('\n');
}
function contatos(T) { marcas(T); return M.contatos; }

module.exports = { FPS, blocos, desenhar, som: (...a) => require('./som_ep').som(...a, { marcas, planoEm: (t) => planoEm(t), andarEm: (t) => andarEm(t), luzElevador: (t) => luzElevador(t) }), relatorio, contatos, ganhoVoz: -2, legendas: false, srt: true };
