// PROVA 3 · "O bolo", terceira versão (~34 s).
// Mesma história da v5 (a Bia vê a frase cair), refeita pelas mãos: braços de comprimento fixo,
// cada objeto preso à mão do primeiro toque até soltar, e cada som de contato no quadro do contato.
const D = require('../../motor/desenho');
const P = require('./personagens');
const { chave, fr, suave, saida, entrada, voltaAtras, mola, lerp, forma, traco, elipsePts, TINTA } = D;

const FPS = 24;

const blocos = [
  { id: 'abre', dur: 1.0 },
  { id: 'l1', fala: 'L1', antes: 2.4, depois: 0.6 },  // a cereja em silêncio; a entrega do prato durante a fala
  { id: 'l2', fala: 'L2', antes: 0.3, depois: 1.6 },  // depois da fala: ele pega o garfo e tira a garfada
  { id: 'mordida', dur: 3.9 },
  { id: 'espera', dur: 2.6 },
  { id: 'decide', dur: 4.9 },
  { id: 'mesa', dur: 2.5 },                            // detalhe: a frase bate no prato; o último "O" rola e para
  { id: 'olhar', dur: 1.4 },                           // o olhar do Nico fecha a queda
  { id: 'percebe', dur: 2.6 },
  { id: 'devolve', dur: 3.9 },                         // ela olha, se aproxima, alcança, segura, traz e solta
  { id: 'l3', fala: 'L3', antes: 0.3, depois: 1.5 },
  { id: 'preto', dur: 1.2 },
];
const MORD = { sobe: 0.55, olhaBia: 0.85, voltaGarfo: 1.05, prepara: 1.10, contato: 1.50, entende: 1.72, segunda: 2.30, procura: 2.95 };
const DEC = { olhaBaixo: 0.35, piscaPensa: 1.0, ar: 1.45, gole: 1.7, volta: 1.95, sorri: 2.25, letras: 2.95, treme: 3.6, cede: 4.0, cai: 4.35 };
const FRASE = 'TÁ ÓTIMO.';

// lugares mais próximos que na v5: assim os braços alcançam sem esticar
const NICO_X = 700, BIA_X = 1180, MESA_Y = 690, CHAO_Y = 1004;
const BOLO_X = 1345, CEREJA_BOLO = { x: BOLO_X + 4, y: MESA_Y - 141 };
const P_INI = 1010, P_FIM = 900, P_VOLTA = 1000, PR = 46; // pratinho: início, entregue, devolvido; raio
const GARFO_MESA = [[766, MESA_Y - 4], [822, MESA_Y - 7]];
const GARFO_DEPOIS = [[716, MESA_Y - 4], [770, MESA_Y - 6]]; // à esquerda de onde o "Ó" para

let M = null;
const REL = { falta: {}, }; // relatório de contato: quanto a mão deixou de alcançar, por gesto
function anotaFalta(nome, v) { REL.falta[nome] = Math.max(REL.falta[nome] || 0, v); }

function marcas(T) {
  if (M) return M;
  const l1 = T.B('l1').ini, f2 = T.fala('L2').fim;
  M = {
    l1, f2, nico: T.W('L2', 'Nico').ini, prometeu: T.W('L2', 'prometeu').ini,
    mord: T.B('mordida').ini, esp: T.B('espera').ini, dec: T.B('decide').ini, mesa: T.B('mesa').ini,
    olhar: T.B('olhar').ini, perc: T.B('percebe').ini, dev: T.B('devolve').ini, l3: T.B('l3').ini, preto: T.B('preto').ini,
  };
  M.tc = M.mord + MORD.contato;
  M.queda = M.dec + DEC.cai;
  // gestos do começo (segundos absolutos)
  M.c = { olha: l1 + 0.1, vai: l1 + 0.25, pega: l1 + 0.8, poe: l1 + 1.6, solta: l1 + 1.85, borda: l1 + 2.2, ergue: l1 + 2.45, leva: l1 + 2.6, desce: l1 + 3.3, pousa: l1 + 3.38, larga: l1 + 3.5, volta: l1 + 3.9 };
  M.g = { vai: f2 + 0.05, pega: f2 + 0.35, fatia: f2 + 0.75, encosta: f2 + 0.95, tira: f2 + 1.0, sobe: f2 + 1.4 };
  M.d = { olha: M.dev + 0.0, vai: M.dev + 0.5, toca: M.dev + 1.1, ergue: M.dev + 1.25, leva: M.dev + 1.4, desce: M.dev + 2.1, pousa: M.dev + 2.18, larga: M.dev + 2.35, boca: M.dev + 2.5 };
  M.planos = [
    { de: 0, ate: M.mord, id: 'A1' }, { de: M.mord, ate: M.esp, id: 'B1' }, { de: M.esp, ate: M.dec, id: 'C1' },
    { de: M.dec, ate: M.mesa, id: 'B2' }, { de: M.mesa, ate: M.olhar, id: 'D' }, { de: M.olhar, ate: M.perc, id: 'B3' },
    { de: M.perc, ate: M.dev, id: 'C2' }, { de: M.dev, ate: M.preto, id: 'A2' }, { de: M.preto, ate: T.total + 1, id: 'preto' },
  ];
  M.letras = letrasMundo(M);
  // contatos: o mesmo instante comanda a imagem e o som
  const O = M.letras[2];
  M.contatos = [
    ['dedos pegam a cereja', M.c.pega], ['cereja encosta na fatia', M.c.poe], ['dedos tocam a borda do prato', M.c.borda],
    ['prato encosta na mesa (entrega)', M.c.pousa], ['mão pega o garfo', M.g.pega], ['garfo encosta no prato', M.g.encosta],
    ['mordida', M.tc],
    ...M.letras.map((l, k) => [`letra ${l.ch} bate (${l.onde})`, l.pousa]),
    ['"Ó" cai do prato na mesa', O.cai], ['"Ó" para', O.para],
    ['dedos tocam a borda do prato (volta)', M.d.toca], ['prato encosta na mesa (volta)', M.d.pousa],
  ].map(([nome, t]) => ({ nome, t }));
  const fase = (M.dec + DEC.piscaPensa) % 1;
  const evita = M.contatos.map((c) => c.t).concat([M.dec + DEC.ar, M.dec + DEC.gole]);
  M.tiques = [];
  for (let t = fase; t < T.total; t += 1) {
    const mudo = (t > M.tc - 0.02 && t < M.tc + 1.25) || (t > M.queda - 0.5 && t < O.para + 0.3) || evita.some((e) => Math.abs(t - e) < 0.22);
    M.tiques.push({ t, mudo });
  }
  return M;
}
const planoEm = (t) => M.planos.find((p) => t >= p.de && t < p.ate);

// ---------------------------------------------------------------- objetos que se movem: pratinho, cereja, garfo
function pratoPos(t, m) { // centro do pratinho e quanto está erguido
  let x = P_INI, y = 0;
  // entrega: erguido de leve, levado, pousado
  y -= 9 * suave(fr(t, m.c.ergue, m.c.leva)) * (1 - suave(fr(t, m.c.desce, m.c.pousa)));
  x = lerp(x, P_FIM, suave(fr(t, m.c.leva, m.c.desce)));
  // volta
  y -= 8 * suave(fr(t, m.d.ergue, m.d.leva)) * (1 - suave(fr(t, m.d.desce, m.d.pousa)));
  x = lerp(x, P_VOLTA, suave(fr(t, m.d.leva, m.d.desce)));
  return { x, y };
}
const bordaDir = (pp) => ({ x: pp.x + PR + 4, y: MESA_Y - 6 + pp.y }); // onde os dedos da Bia seguram
const cerejaNaFatia = (pp) => ({ x: pp.x + 8, y: MESA_Y - 66 + pp.y });

// ---------------------------------------------------------------- as letras depois que caem (mundo)
// A frase bate no pratinho e em volta dele, longe das mãos. O "Ó" (o primeiro a ceder) cai do prato, rola até a
// frente do Nico, balança e para. As letras que caem no prato vão junto quando a Bia leva o prato.
function letrasMundo(m) {
  const L = [
    // A cereja e o buraco da garfada ficam à vista: só o "I" pousa em cima da fatia (na cobertura, ao lado
    // da cereja); as outras ficam de pé no prato, na frente da fatia. A linha de base é a superfície onde a letra apoia.
    { ch: 'T', dx: 24, y: -3, r: 0.15, onde: 'prato' },
    { ch: 'Á', dx: -32, y: -3, r: -0.2, onde: 'prato' },
    { ch: 'Ó', dx: -40, y: -7, r: 0, onde: 'prato', rola: true }, // o acento deixa ver o giro
    { ch: 'T', dx: 39, y: -2, r: 0.4, onde: 'prato' },
    { ch: 'I', dx: 23, y: -53, r: 0.12, onde: 'fatia' },
    { ch: 'M', dx: -13, y: -2, r: -0.12, onde: 'prato' },
    { ch: 'O', dx: 6, y: -2, r: 0.18, onde: 'prato' },
    { ch: '.', dx: 48, y: -2, r: 0, onde: 'prato' },
  ];
  L.forEach((l, k) => { l.pousa = m.mesa + 0.32 + k * 0.03; });
  const O = L[2];
  O.cai = O.pousa + 0.26;           // escorrega pela borda do prato
  // para na frente do Nico, em madeira limpa, e de pé (acento em cima): a distância rolada fecha o giro em 2π.
  // Com 812 ele parava deitado, com o acento de lado, e não se lia "Ó".
  O.x0 = P_FIM + O.dx; O.xf = Math.round(P_FIM - PR - 4 - 11 * (2 * Math.PI - 2));
  O.para = O.pousa + 1.45;
  return L;
}
function letraEm(l, t, m) { // posição no mundo (ou null se ainda não caiu)
  const y0 = MESA_Y - 240;
  if (t < l.pousa - 0.32) return null;
  const pp = pratoPos(t, m);
  const alvo = l.onde === 'mesa' ? { x: l.x, y: MESA_Y + l.y } : { x: pp.x + l.dx, y: MESA_Y + l.y + pp.y };
  if (t < l.pousa) { const q = fr(t, l.pousa - 0.32, l.pousa); return { x: alvo.x - 10 * (1 - q), y: lerp(y0, alvo.y, q * q), r: l.r * q }; }
  const dl = t - l.pousa;
  if (!l.rola) return { x: alvo.x, y: alvo.y - Math.abs(Math.sin(dl * 26)) * Math.exp(-dl * 13) * 7, r: l.r };
  // o "O": quica no prato, escorrega pela borda, rola na madeira até parar, balança
  const R = 11;
  if (t < l.cai) { const q = fr(t, l.pousa, l.cai); return { x: lerp(l.x0, P_FIM - PR - 4, q), y: MESA_Y - 7 - Math.sin(Math.PI * q) * 12, r: -q * 2 }; }
  const xr = l.xf + (P_FIM - PR - 4 - l.xf) * Math.exp(-(t - l.cai) / 0.33);
  const giro = -2 - (P_FIM - PR - 4 - xr) / R;
  const balanca = t > l.para - 0.45 ? 0.16 * Math.exp(-(t - (l.para - 0.45)) * 6) * Math.sin((t - (l.para - 0.45)) * 2 * Math.PI * 2.6) : 0;
  return { x: t < l.para ? xr : l.xf, y: MESA_Y, r: (t < l.para ? giro : -2 - (P_FIM - PR - 4 - l.xf) / R) + balanca };
}

// ---------------------------------------------------------------- câmera e luz
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
  gr.addColorStop(0, centro); gr.addColorStop(0.55, '#c9b9d6'); gr.addColorStop(1, borda);
  g.fillStyle = gr; g.fillRect(-2000, -2000, 6000, 6000); g.restore();
}
function brilho(g, cx, cy, r, cor, a) {
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = a;
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-2000, -2000, 6000, 6000); g.restore();
}

// ---------------------------------------------------------------- objetos
function relogio(g, x, y, r, t) {
  forma(g, elipsePts(x, y, r, r, 14), '#efe9dc', { seed: 201, linha: 5 });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; traco(g, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.88, y + Math.sin(a) * r * 0.88]], 3, { seed: 210 + i, tremor: 0.3 }); }
  const s = M.tiques.filter((k) => k.t <= t).length;
  const as = (s / 60) * Math.PI * 2 - Math.PI / 2 + 0.6;
  traco(g, [[x, y], [x + Math.cos(-1.2) * r * 0.45, y + Math.sin(-1.2) * r * 0.45]], 6, { seed: 202, tremor: 0.3 });
  traco(g, [[x, y], [x + Math.cos(0.4) * r * 0.65, y + Math.sin(0.4) * r * 0.65]], 5, { seed: 203, tremor: 0.3 });
  traco(g, [[x, y], [x + Math.cos(as) * r * 0.8, y + Math.sin(as) * r * 0.8]], 2.5, { seed: 204, tinta: '#c0392b', tremor: 0.2 });
}
function geladeira(g, x0, y0, w, h) { // sem luz indicadora: num cenário simples ela parecia uma pista
  forma(g, [[x0, y0], [x0 + w, y0 + 6], [x0 + w, y0 + h], [x0, y0 + h]], '#6f7a90', { seed: 220, linha: 5 });
  traco(g, [[x0, y0 + h * 0.34], [x0 + w, y0 + h * 0.34]], 5, { seed: 221 });
  traco(g, [[x0 + w - 28, y0 + h * 0.1], [x0 + w - 28, y0 + h * 0.26]], 9, { seed: 222 });
  traco(g, [[x0 + w - 28, y0 + h * 0.42], [x0 + w - 28, y0 + h * 0.62]], 9, { seed: 223 });
}
function janela(g, x0, y0, w, h) {
  forma(g, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], '#203a63', { seed: 230, linha: 6 });
  g.fillStyle = '#f5ecc8'; g.beginPath(); g.arc(x0 + w * 0.68, y0 + h * 0.3, h * 0.11, 0, 7); g.fill();
  g.fillStyle = '#203a63'; g.beginPath(); g.arc(x0 + w * 0.68 + h * 0.05, y0 + h * 0.27, h * 0.1, 0, 7); g.fill();
  traco(g, [[x0 + w / 2, y0], [x0 + w / 2, y0 + h]], 6, { seed: 231 });
  traco(g, [[x0, y0 + h / 2], [x0 + w, y0 + h / 2]], 6, { seed: 232 });
}
function cereja(g, x, y) {
  forma(g, elipsePts(x, y, 11, 11, 8), '#c62a3a', { seed: 267, linha: 4 });
  traco(g, [[x + 2, y - 10], [x + 9, y - 25]], 3.5, { seed: 268 });
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(x - 3.5, y - 3.5, 2.6, 0, 7); g.fill();
}
// formas de quina usam lados retos (reto: true). Na v5, um retângulo desenhado com curva suave
// passava do contorno e virou a "forma amarela" na frente do bolo.
function retangulo(x0, y0, x1, y1) {
  return [[x0, y0], [(x0 + x1) / 2, y0], [x1, y0], [x1, (y0 + y1) / 2], [x1, y1], [(x0 + x1) / 2, y1], [x0, y1], [x0, (y0 + y1) / 2]];
}
const RETO = { reto: true };
function pratinho(g, x, y) { forma(g, elipsePts(x, y, PR, 8, 14), '#ece8e0', { seed: 250, linha: 4 }); }
function fatia(g, x, y, falta) { // vista de lado; "falta" = já saiu uma garfada (lado do Nico)
  const top = falta ? [[x - 28, y - 34], [x - 14, y - 34], [x - 8, y - 24], [x + 4, y - 26], [x + 26, y - 34]] : [[x - 28, y - 34], [x, y - 34], [x + 26, y - 34]];
  forma(g, [[x - 30, y], [x, y], [x + 30, y], [x + 28, y - 17], ...top.slice().reverse(), [x - 29, y - 17]], '#e8b86a', { seed: 240, linha: 4 });
  traco(g, [[x - 28, y - 17], [x + 28, y - 17]], 5, { seed: 241, tinta: '#c0566d', tremor: 0.4 });
  const cob = falta ? [[x + 26, y - 33], [x + 24, y - 45], [x - 2, y - 45], [x - 6, y - 35]] : [[x + 26, y - 33], [x + 24, y - 45], [x - 24, y - 45], [x - 26, y - 33]];
  forma(g, cob, '#f4a6b8', { seed: 242, linha: 4 });
}
function boloInteiro(g, x, comCereja) {
  const y = MESA_Y;
  forma(g, elipsePts(x, y - 4, 36, 7, 10), '#d9d2c4', { seed: 260, linha: 4 });
  forma(g, retangulo(x - 9, y - 28, x + 9, y - 6), '#d9d2c4', { seed: 261, linha: 4, tremor: 0.5, reto: true });
  forma(g, elipsePts(x, y - 30, 66, 9, 14), '#ece8e0', { seed: 262, linha: 4 });
  forma(g, retangulo(x - 58, y - 110, x + 58, y - 33), '#e8b86a', { seed: 263, linha: 5, tremor: 0.6, reto: true });
  traco(g, [[x - 56, y - 70], [x + 56, y - 70]], 7, { seed: 264, tinta: '#c0566d', tremor: 0.4 });
  forma(g, [[x - 60, y - 126], [x, y - 128], [x + 60, y - 126], [x + 60, y - 98], [x + 42, y - 90], [x + 24, y - 100], [x + 4, y - 86], [x - 18, y - 98], [x - 38, y - 88], [x - 60, y - 98]], '#f4a6b8', { seed: 265, linha: 5 });
  if (comCereja) cereja(g, CEREJA_BOLO.x, CEREJA_BOLO.y);
}
function garfoMesa(g, a, b) { D.membro(g, [a, b], 3, '#c9ced8', { seed: 330, borda: 2.5 }); }
function garfoClose(g, x1, y1, x2, y2, comPedaco) {
  D.membro(g, [[x1, y1], [x2, y2]], 15, '#c9ced8', { seed: 280, borda: 5.5 });
  const a = Math.atan2(y2 - y1, x2 - x1);
  g.save(); g.translate(x2, y2); g.rotate(a);
  forma(g, [[-10, -26], [40, -26], [40, 26], [-10, 26]], '#c9ced8', { seed: 281, linha: 6 });
  for (const yy of [-17, 0, 17]) D.membro(g, [[38, yy], [82, yy]], 5, '#c9ced8', { seed: 282 + yy, borda: 3.5 });
  if (comPedaco) {
    g.rotate(-a);
    forma(g, [[30, -30], [118, -40], [124, 30], [36, 40]], '#e8b86a', { seed: 290, linha: 6 });
    forma(g, [[26, -32], [120, -42], [114, -70], [34, -62]], '#f4a6b8', { seed: 291, linha: 6 });
  }
  g.restore();
}
function letra(g, ch, x, y, tam, r = 0, esc = 1, centro = false) {
  // centro: gira em volta do meio da letra (o "Ó" rolando), não do pé; senão ela afunda na mesa ao girar
  const meio = centro ? tam * 0.36 : 0;
  g.save(); g.translate(x, y - meio); g.rotate(r); g.scale(esc, esc);
  g.font = `${tam}px Archivo`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.lineJoin = 'round'; g.lineWidth = tam * 0.12; g.strokeStyle = TINTA; g.strokeText(ch, 0, meio);
  g.fillStyle = '#fbf8f1'; g.fillText(ch, 0, meio);
  g.restore();
}

// ---------------------------------------------------------------- poses do plano geral
// As mãos são dadas como ALVOS NO MUNDO; os braços (comprimento fixo) resolvem o resto.
const QUEIXO_B = [{ x: BIA_X - 78, y: MESA_Y - 186 }, { x: BIA_X - 64, y: MESA_Y - 180 }];
const mix = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
const arco = (a, b, k, h) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - Math.sin(Math.PI * k) * h });

function poseNicoA(t, m) {
  const p = { olhoX: 0.6, olhoY: 0, pupila: 0.5, cantoE: 3, cantoD: 5 };
  const repouso = { x: 752, y: MESA_Y - 2 };
  let alvo = repouso;
  if (t < m.mord) {
    const seguir = fr(t, m.c.vai, m.c.vai + 0.25) * (1 - fr(t, m.c.larga + 0.1, m.c.larga + 0.35));
    p.olhoY = 0.5 * seguir; p.olhoX = 0.6 + 0.1 * seguir;
    p.cantoD = 5 + 5 * fr(t, m.c.larga + 0.3, m.c.larga + 0.6);
    p.dy = -6 * fr(t, m.nico, m.nico + 0.3);
    p.palpS = Math.max(0, 1 - Math.abs(t - (m.l1 + 0.05)) / 0.07) + Math.max(0, 1 - Math.abs(t - (m.nico + 0.6)) / 0.07);
    // garfo: da mesa à fatia, aperta, tira a garfada, sobe
    const cabo = { x: GARFO_MESA[0][0], y: GARFO_MESA[0][1] };
    const pp = pratoPos(t, m);
    const sobreFatia = { x: pp.x - 14, y: MESA_Y - 112 }; // com a ponta para baixo (52 px) encosta na cobertura
    const alto = { x: NICO_X + 112, y: MESA_Y - 74 };
    const a = suave(fr(t, m.g.vai, m.g.pega)), b = suave(fr(t, m.g.pega + 0.05, m.g.fatia)), c = suave(fr(t, m.g.tira, m.g.sobe));
    const aperta = 12 * Math.sin(Math.PI * fr(t, m.g.fatia, m.g.tira));
    alvo = mix(mix(mix(repouso, cabo, a), sobreFatia, b), alto, c);
    alvo = { x: alvo.x, y: alvo.y + aperta };
    p.garfo = t >= m.g.pega;
    p.ponta = { x: lerp(lerp(56, 4, b), 30, c), y: lerp(lerp(-3, 52, b), -58, c) };
    p.pedaco = t >= m.g.tira;
    p.rot = 0.06 * b * (1 - c);
    if (t >= m.g.vai) { p.olhoY = lerp(0.6 * Math.max(a, b), -0.05, c); p.olhoX = lerp(0.65, 0.45, c); }
    if (t >= m.g.pega) anotaFalta('Nico segura o garfo', 0);
    p.alvo = alvo;
    p.contato = t >= m.g.pega - 0.02 && t < m.g.sobe ? 'Nico: garfo' : null;
    return p;
  }
  // depois da queda: mãos no colo; olha o "Ó"; olha a Bia; segue o prato; alívio
  const u = t - m.dev;
  p.bracoAtras = true; p.alvo = { x: NICO_X + 70, y: MESA_Y + 58 };
  p.pupila = 0.3; p.sobrInc = 0.6; p.cantoE = -2; p.cantoD = 0; p.dy = 6;
  const ve = fr(u, 0.9, 1.05), segue = fr(u, 1.4, 1.6), olhaEla = fr(u, 2.25, 2.4), alivio = fr(u, 2.5, 2.9);
  p.olhoY = lerp(lerp(lerp(0.8, 0, ve), 0.35, segue), 0, olhaEla); p.olhoX = lerp(lerp(0.5, 0.65, ve), 0.7, segue);
  p.sobr = 0.5 * ve * (1 - alivio); p.pupila = lerp(0.3, 0.5, ve);
  p.dy = lerp(6, 14, alivio); p.cabRot = 0.04 * alivio;
  p.feliz = u > 2.7 && u < 3.7 ? 1 : 0;
  p.cantoE = lerp(-2, 9, alivio); p.cantoD = lerp(0, 13, alivio); p.sobrInc = lerp(0.6, 0.2, alivio);
  p.palpS = Math.max(0, 1 - Math.abs(t - (m.l3 + 1.1)) / 0.07);
  return p;
}

function poseBiaA(t, m) {
  const p = { olhoX: 0.6, pupila: 0.6, cantoE: 7, cantoD: 10 };
  const chin0 = QUEIXO_B[0], chin1 = QUEIXO_B[1];
  if (t < m.mord) {
    const c = m.c, pp = pratoPos(t, m);
    const naCereja = { x: CEREJA_BOLO.x + 2, y: CEREJA_BOLO.y + 15 }, naFatia0 = cerejaNaFatia({ x: P_INI, y: 0 });
    const poeAlvo = { x: naFatia0.x + 2, y: naFatia0.y + 15 };
    let h = chin0;
    h = mix(h, naCereja, suave(fr(t, c.vai, c.pega)));
    h = arco(h, poeAlvo, suave(fr(t, c.pega + 0.05, c.poe)), 34);
    h = { x: h.x, y: h.y + 3 * Math.sin(Math.PI * fr(t, c.poe, c.solta)) }; // aperta a cereja de leve
    h = mix(h, bordaDir({ x: P_INI, y: 0 }), suave(fr(t, c.solta, c.borda)));
    if (t >= c.borda && t < c.larga) h = bordaDir(pp); // segura a borda: a mão vai junto com o prato
    if (t >= c.larga) h = arco(bordaDir(pp), chin0, suave(fr(t, c.larga, c.volta)), 20);
    // inclina o tronco para levar o prato
    const viraAtras = suave(fr(t, c.olha, c.vai + 0.3)) * (1 - suave(fr(t, c.pega + 0.1, c.pega + 0.55)));
    p.rot = 0.3 * suave(fr(t, c.ergue, c.desce)) * (1 - suave(fr(t, c.larga, c.volta))) - 0.34 * viraAtras;
    p.dy = -6 * suave(fr(t, c.leva, c.desce)) * (1 - suave(fr(t, c.larga, c.volta)));
    // olhos: na cereja, na fatia, no prato indo, e só então no rosto dele
    const nasMaos = fr(t, c.olha, c.olha + 0.2) * (1 - fr(t, c.larga + 0.1, c.larga + 0.35));
    p.olhoY = 0.55 * nasMaos; p.olhoX = lerp(0.6 - 0.1 * nasMaos, -0.8, viraAtras); // olha para trás, para o bolo
    const inc = suave(fr(t, m.prometeu, m.prometeu + 0.45));
    p.rot = Math.max(p.rot, 0.07 * inc);
    let h2 = chin1;
    const naFatia = fr(t, m.f2 + 0.3, m.f2 + 0.5), sobe = fr(t, m.g.tira, m.g.sobe);
    if (t > m.f2) { p.olhoY = lerp(0.5 * naFatia, -0.15, sobe); p.cabRot = -0.05 * sobe; p.cantoE = 8 + 4 * sobe; p.cantoD = 11 + 4 * sobe; }
    p.palpS = Math.max(0, 1 - Math.abs(t - (m.nico + 0.15)) / 0.07);
    p.alvos = [h, h2];
    p.contato = t >= c.pega && t < c.solta ? 'Bia: cereja' : t >= c.borda && t < c.larga ? 'Bia: prato (entrega)' : null;
    return p;
  }
  // A2: olha o prato, se aproxima, alcança, segura, traz para perto, solta; depois a mão vai à boca
  const d = m.d, pp = pratoPos(t, m);
  const peito = { x: BIA_X - 70, y: MESA_Y - 128 };
  let h = peito;
  h = mix(h, bordaDir(pp), suave(fr(t, d.vai, d.toca)));
  if (t >= d.toca && t < d.larga) h = bordaDir(pp);
  const boca = { x: BIA_X - 78, y: MESA_Y - 210 };
  if (t >= d.larga) h = arco(bordaDir(pp), boca, suave(fr(t, d.larga, d.boca + 0.4)), 10);
  const baixa = suave(fr(t, d.boca + 0.9, d.boca + 1.3));
  if (t >= d.boca + 0.9) h = mix(boca, chin0, baixa);
  p.alvos = [h, { x: BIA_X - 58, y: MESA_Y - 150 }];
  p.rot = 0.33 * suave(fr(t, d.vai, d.toca)) * (1 - 0.75 * suave(fr(t, d.leva, d.desce))) * (1 - suave(fr(t, d.larga, d.boca + 0.3)));
  p.dy = -8 * suave(fr(t, d.vai, d.toca)) * (1 - suave(fr(t, d.leva, d.desce)));
  p.olhoY = 0.55 * (1 - fr(t, d.larga, d.larga + 0.2)); p.olhoX = 0.55;
  p.cantoE = 8; p.cantoD = 10; p.sobrInc = 0.5 * (1 - fr(t, d.larga, d.boca));
  p.feliz = t > d.boca + 0.15 && t < d.boca + 1.0 ? 1 : 0;
  p.dy += t > d.boca + 0.15 && t < d.boca + 0.9 ? Math.sin((t - d.boca) * 2 * Math.PI * 7) * 3 : 0;
  p.cantoE += 6 * fr(t, d.boca, d.boca + 0.2); p.cantoD += 6 * fr(t, d.boca, d.boca + 0.2);
  p.palpS = Math.max(0, 1 - Math.abs(t - (m.l3 + 0.5)) / 0.07);
  p.contato = t >= d.toca && t < d.larga ? 'Bia: prato (volta)' : null;
  return p;
}

// ---------------------------------------------------------------- plano geral (o detalhe usa o mesmo mundo)
function cenaA(g, t, m, cam) {
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  const detalhe = cam.z > 2;
  camada(g, cam, detalhe ? 1 : 0.6, () => {
    g.fillStyle = '#2b2642'; g.fillRect(-300, -300, 2520, 1160);
    g.fillStyle = '#1b1828'; g.fillRect(-300, 860, 2520, 600);
    traco(g, [[-300, 860], [2220, 860]], 5, { seed: 300 });
    janela(g, 1500, 150, 250, 270);
    relogio(g, 540, 170, 50, t);
    geladeira(g, -60, 250, 250, 610);
  });
  camada(g, cam, 1, () => {
    traco(g, [[935, -200], [935, 190]], 4, { seed: 310 });
    forma(g, [[880, 190], [990, 190], [1060, 282], [810, 282]], '#c8892f', { seed: 311, linha: 5 });
    const pn = poseNicoA(t, m), pb = poseBiaA(t, m);
    // braços de comprimento fixo
    const bn = P.resolverBracos('nico', NICO_X, MESA_Y, pn, [pn.alvo]);
    pn.braco = bn[0];
    const bb = P.resolverBracos('bia', BIA_X, MESA_Y, pb, pb.alvos);
    pb.bracos = bb;
    if (pn.contato) anotaFalta(pn.contato, bn[0].falta);
    if (pb.contato) anotaFalta(pb.contato, bb[0].falta);
    REL.maxFalta = Math.max(REL.maxFalta || 0, bn[0].falta, bb[0].falta, bb[1].falta);
    P.cadeiraPerfil(g, NICO_X, MESA_Y, 1);
    P.cadeiraPerfil(g, BIA_X, MESA_Y, -1);
    P.nicoPerfil(g, NICO_X, MESA_Y, { ...pn, parte: 'corpo' });
    P.biaPerfil(g, BIA_X, MESA_Y, { ...pb, parte: 'corpo' });
    P.pernasPerfil(g, NICO_X, MESA_Y, 1, P.COR.nicoCalca, pn.dy || 0);
    P.pernasPerfil(g, BIA_X, MESA_Y, -1, P.COR.biaCalca, pb.dy || 0, 10);
    forma(g, retangulo(300, 682, 1620, 716), '#a45d36', { seed: 320, linha: 5, tremor: 0.6, reto: true });
    forma(g, retangulo(284, 716, 1636, 752), '#6e3622', { seed: 321, linha: 5, tremor: 0.6, reto: true });
    forma(g, retangulo(346, 752, 368, CHAO_Y + 2), '#4d2618', { seed: 322, linha: 5, tremor: 0.5, reto: true });
    forma(g, retangulo(1552, 752, 1576, CHAO_Y + 2), '#4d2618', { seed: 323, linha: 5, tremor: 0.5, reto: true });
    if (!pn.garfo && t < m.mord) garfoMesa(g, GARFO_MESA[0], GARFO_MESA[1]);
    if (t >= m.mord) garfoMesa(g, GARFO_DEPOIS[0], GARFO_DEPOIS[1]); // depois da mordida ele largou o garfo na mesa
    boloInteiro(g, BOLO_X, t < m.c.pega);
    const pp = pratoPos(t, m);
    pratinho(g, pp.x, MESA_Y - 2 + pp.y);
    fatia(g, pp.x, MESA_Y - 8 + pp.y, t >= m.g.tira);
    if (t >= m.c.poe) { const cf = cerejaNaFatia(pp); cereja(g, cf.x, cf.y); }
    if (t >= m.mesa) for (const l of m.letras) { const s = letraEm(l, t, m); if (s) letra(g, l.ch, s.x, s.y, 30, s.r, 1, !!l.rola && t >= l.pousa); }
    P.nicoPerfil(g, NICO_X, MESA_Y, { ...pn, parte: 'bracos' });
    P.biaPerfil(g, BIA_X, MESA_Y, { ...pb, parte: 'bracos' });
    if (t >= m.c.pega && t < m.c.poe) { const h = bb[0].mundo; cereja(g, h.x - 2, h.y - 15); } // na pinça dos dedos
    luz(g, 935, 600, 1250, '#fff3d6', '#2a2448');
    brilho(g, 935, 300, 480, '#ffcf7a', 0.35);
    brilho(g, 935, 690, 520, '#ffcf7a', 0.18);
  });
}

// ---------------------------------------------------------------- close do Nico (B1 e B2)
function poseNicoB(t, m) {
  const p = { olhoX: 0.55, pupila: 0.45, larg: 104, cantoE: 3, cantoD: 5 };
  if (t < m.esp) {
    const u = t - m.mord, c = MORD.contato;
    const desce = fr(u, 0.15, 0.5), sobe = fr(u, MORD.olhaBia, MORD.olhaBia + 0.08), volta = fr(u, MORD.voltaGarfo, MORD.voltaGarfo + 0.08);
    const naBia = sobe * (1 - volta);
    p.olhoY = 0.7 * desce * (1 - naBia) * (1 - fr(u, c + 0.1, c + 0.3));
    p.olhoX = lerp(lerp(0.55, 0.15, desce), 0.85, naBia);
    p.vesgo = 0.28 * desce * (1 - naBia) * (1 - fr(u, c, c + 0.15));
    p.sobrInc = 0.4 * desce;
    const prep = fr(u, MORD.prepara, c - 0.1), bote = fr(u, c - 0.1, c);
    p.dy = -22 * suave(prep) * (1 - bote) + 16 * bote * (1 - fr(u, c + 0.05, c + 0.4));
    p.abre = suave(prep) * (1 - entrada(bote));
    p.cantoE = 3 - 4 * desce; p.cantoD = 5 - 4 * desce;
    if (u >= c) { p.abre = 0; p.bochechaCheia = true; p.cantoE = -4; p.cantoD = -2; p.larg = 70; }
    const ent = fr(u, MORD.entende, MORD.entende + 0.08);
    p.pupila = lerp(0.45, 0.14, ent); p.arregala = ent; p.sobr = 0.9 * ent; p.sobrInc = lerp(p.sobrInc, 0.2, ent);
    if (u > c) p.olhoX = lerp(0.15, 0.3, ent);
    const mast = Math.sin(Math.PI * fr(u, MORD.segunda, MORD.segunda + 0.35));
    p.bocaDy = 10 * mast;
    p.palpIE = 0.28 * (Math.max(0, 1 - Math.abs(u - (MORD.segunda + 0.05)) / 0.06) + Math.max(0, 1 - Math.abs(u - (MORD.segunda + 0.25)) / 0.06));
    p.topete = 0.38 * mola(u, c, 3.2, 3.2) - 0.05 * suave(prep) * (1 - bote);
    // depois de sentir o gosto: os olhos sobem devagar até ela
    const procura = suave(fr(u, MORD.procura, MORD.procura + 0.4));
    p.olhoX = lerp(p.olhoX, 0.9, procura); p.olhoY = lerp(p.olhoY, -0.05, procura);
    p.pupila = lerp(p.pupila, 0.3, procura); p.cabRot = 0.035 * procura;
    return p;
  }
  if (t >= m.olhar) { // B3: os olhos dele no "Ó" parado; solta o ar; pisca devagar. O olhar fecha a queda.
    const u = t - m.olhar, solta = Math.sin(Math.PI * fr(u, 0.45, 1.0));
    return { olhoX: 0.4, olhoY: 0.85, pupila: 0.34, sobr: 0.2, sobrInc: 0.8, larg: 96, cantoE: -3, cantoD: 2, cabRot: 0.02,
      ombro: -6 * solta, dy: 4 * solta + 6 * fr(u, 0.4, 1.0), palpS: 0.25 + 0.75 * Math.sin(Math.PI * fr(u, 0.7, 1.15)), palpI: 0.1 };
  }
  // B2: procura a resposta, decide, sorri, tenta segurar a frase, vê a frase cair
  const u = t - m.dec;
  Object.assign(p, { pupila: 0.3, arregala: 0.8, sobr: 0.7, sobrInc: 0.2, olhoX: 0.9, olhoY: -0.05, cabRot: 0.035, bochechaCheia: true, larg: 70, cantoE: -4, cantoD: -2 });
  const baixa = suave(fr(u, DEC.olhaBaixo, DEC.olhaBaixo + 0.3)), sobeOlho = suave(fr(u, DEC.volta, DEC.volta + 0.3));
  p.olhoX = lerp(lerp(0.9, 0.05, baixa), 0.85, sobeOlho); p.olhoY = lerp(lerp(-0.05, 0.7, baixa), 0, sobeOlho);
  // um piscar curto no meio da pausa: ele está pensando
  p.palpS = Math.max(0, 1 - Math.abs(u - DEC.piscaPensa) / 0.06);
  p.olhoX += 0.15 * Math.sin(Math.PI * fr(u, 1.1, 1.3)) * (1 - sobeOlho);
  p.sobrInc = lerp(lerp(0.2, -0.7, baixa), 0.7, sobeOlho); p.sobr = lerp(lerp(0.7, 0.05, baixa), 0.45, sobeOlho);
  p.arregala = lerp(0.8, 0, baixa);
  p.ombro = 14 * Math.sin(Math.PI * fr(u, DEC.ar, DEC.gole + 0.2));
  p.dy = 12 * Math.sin(Math.PI * fr(u, DEC.gole, DEC.gole + 0.3));
  if (u > DEC.gole + 0.15) p.bochechaCheia = false;
  p.pupila = lerp(0.3, 0.34, sobeOlho); p.cabRot = 0.035 * (1 - baixa) + 0.03 * sobeOlho;
  // sorriso: o canto direito sobe primeiro, o esquerdo atrasa; o esforço treme
  const sd = saida(fr(u, DEC.sorri, DEC.sorri + 0.3)), se = suave(fr(u, DEC.sorri + 0.2, DEC.sorri + 0.7));
  const esforco = fr(u, DEC.treme, DEC.cai);
  const tremor = u > DEC.sorri + 0.4 ? Math.sin(u * 2 * Math.PI * 9) * (1.4 + 3 * esforco) : 0;
  p.cantoD = lerp(-2, 26, sd) + tremor; p.cantoE = lerp(-4, 16, se) - tremor;
  p.larg = lerp(70, 150, Math.max(sd, se) * 0.9);
  p.palpI = 0.22 * se; p.bochecha = se;
  // a frase cai: os olhos dele descem atrás dela e o sorriso perde força
  const ve = suave(fr(u, DEC.cai + 0.05, DEC.cai + 0.4));
  p.olhoY = lerp(p.olhoY, 0.85, ve); p.olhoX = lerp(p.olhoX, 0.4, ve);
  p.cantoD -= 12 * ve; p.cantoE -= 9 * ve; p.sobrInc = lerp(p.sobrInc, 0.9, ve);
  return p;
}
function letrasB(g, t, m) {
  const u = t - m.dec;
  g.font = '104px Archivo';
  let x = 990, k = 0;
  const esforco = fr(u, DEC.treme, DEC.cai);
  for (const ch of FRASE) {
    const w = g.measureText(ch).width;
    if (ch !== ' ') {
      const ap = m.dec + DEC.letras + k * 0.08;
      if (t >= ap) {
        const esc = voltaAtras(fr(t, ap, ap + 0.14));
        const tr = esforco * 7 * (k === 2 ? 1.6 : 1);
        let y = 715 + Math.sin(u * 3 + k) * 2 + Math.sin(u * 47 + k * 2.1) * tr;
        let r = (D.hash(k + 3) - 0.5) * 0.08 + Math.sin(u * 39 + k) * tr * 0.006;
        if (k === 2) { const cede = suave(fr(u, DEC.cede, DEC.cai)); y += 20 * cede; r += 0.28 * cede; } // o "Ó" cede primeiro
        const dq = t - (m.queda + k * 0.035);
        if (dq > 0) { y += 3200 * dq * dq; r += dq * 1.8 * (k % 2 ? 1 : -1); }
        letra(g, ch, x + w / 2, y, 104, r, esc);
      }
      k++;
    }
    x += w + (ch === ' ' ? 18 : 6);
  }
}
function cenaB(g, t, m) {
  const u = t - m.mord, c = MORD.contato;
  const tremeu = t < m.esp && u >= c ? Math.exp(-(u - c) * 14) : 0;
  const cam = {
    z: t < m.esp ? lerp(1.0, 1.035, fr(t, m.mord, m.esp)) : t < m.mesa ? lerp(1.045, 1.075, fr(t, m.dec, m.mesa)) : lerp(1.075, 1.09, fr(t, m.olhar, m.perc)),
    cx: 960, cy: 540, sx: Math.sin(u * 91) * 9 * tremeu, sy: Math.cos(u * 77) * 7 * tremeu,
  };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.5, () => {
    g.fillStyle = '#2b2642'; g.fillRect(-300, -300, 2520, 1700);
    g.save(); g.filter = 'blur(5px)'; geladeira(g, -40, 60, 330, 1000); relogio(g, 560, 150, 64, t); g.restore();
  });
  camada(g, cam, 1, () => {
    const p = poseNicoB(t, m);
    P.nicoFrente(g, 760, 500, p);
    if (t < m.esp) {
      // garfo: na hora do bote a ponta entra na boca (a parte acima da linha dos lábios some)
      const boca = { x: 852, y: 500 + (p.dy || 0) + 182 + (p.bocaDy || 0) };
      const sobe = saida(fr(u, 0, MORD.sobe)), prep = suave(fr(u, MORD.prepara, c - 0.1)), bote = fr(u, c - 0.1, c), sai = entrada(fr(u, c + 0.12, c + 0.5));
      const fora = { x: boca.x - 6 + 10 * prep, y: boca.y + 78 + 24 * prep };
      const dentro = { x: boca.x - 2, y: boca.y - 26 };
      let tip = { x: lerp(fora.x, dentro.x, bote), y: lerp(lerp(1320, fora.y, sobe), dentro.y, bote) };
      if (u > c + 0.12) tip = { x: dentro.x - 30 * sai, y: dentro.y + 760 * sai };
      g.save();
      if (u >= c - 0.05 && u < c + 0.3) { // recorte: o que passa da linha dos lábios está dentro da boca
        g.beginPath(); g.rect(-500, -500, 3000, 3000);
        g.rect(boca.x + 70, boca.y - 160, -140, 160); // retângulo anti-horário: buraco
        g.clip('evenodd');
      }
      garfoClose(g, tip.x - 330, tip.y + 500, tip.x - 40, tip.y + 30, u < c);
      g.restore();
      if (u >= c - 0.05 && u < c + 0.3) D.boca(g, boca.x, boca.y, 70, { cantoE: -4, cantoD: -2, linha: 7, seed: 83 }); // lábios por cima do cabo
    }
    if (t >= m.dec && t < m.mesa) letrasB(g, t, m);
    luz(g, 1150, 380, 1300, '#fff1d2', '#2a2448');
    brilho(g, 1250, -60, 700, '#ffcf7a', 0.4);
  });
  camada(g, cam, 1.4, () => {
    g.save(); g.filter = 'blur(14px)';
    forma(g, elipsePts(1900, 1060, 380, 300, 12), '#7a3328', { seed: 400, linha: 0 });
    forma(g, elipsePts(1960, 560, 250, 280, 12), '#2a1830', { seed: 401, linha: 0 });
    forma(g, elipsePts(1880, 300, 110, 100, 10), '#2a1830', { seed: 402, linha: 0 });
    g.restore();
  });
}

// ---------------------------------------------------------------- close da Bia (C1 e C2)
function poseBiaC(t, m) {
  if (t < m.dec) { // C1: espera
    const u = t - m.esp;
    const anima = suave(fr(u, 1.0, 1.4));
    const ansiosa = fr(u, 0.25, 0.4) * (1 - fr(u, 0.95, 1.05)) + fr(u, 1.6, 1.7) * (1 - fr(u, 2.3, 2.4));
    return {
      olhoX: -0.7, pupila: 0.6 + 0.04 * anima, palpS: Math.max(0, 1 - Math.abs(u - 0.55) / 0.09), sobr: 0.5 * anima,
      cantoE: lerp(8, 18, anima), cantoD: lerp(8, 20, anima), larg: lerp(90, 110, anima), bochecha: anima,
      cabRot: -0.05 * anima, esc: 1 + 0.02 * anima, maosY: 300 - 10 * anima, dy: -6 * anima,
      polegar: ansiosa * Math.sin(u * 2 * Math.PI * 3.2),
    };
  }
  // C2: os olhos dela estão no prato (ela viu a frase bater); sobem até ele; o rosto muda
  const u = t - m.perc;
  const volta = suave(fr(u, 0.8, 1.2)), muda = suave(fr(u, 1.3, 1.8));
  return {
    olhoX: lerp(-0.45, -0.7, volta), olhoY: lerp(0.7, 0, volta), pupila: 0.6,
    sobr: lerp(0.35, 0.15, muda), sobrInc: 0.85 * muda,
    cantoE: lerp(lerp(14, 6, fr(u, 0.2, 0.7)), 9, muda), cantoD: lerp(lerp(16, 7, fr(u, 0.2, 0.7)), 11, muda), larg: lerp(104, 78, muda),
    bochecha: 0.6 * muda, cabRot: lerp(-0.02, -0.07, muda), dy: 6 * (1 - volta) - 4 * muda,
    palpS: Math.max(0.3 * (1 - volta), Math.max(0, 1 - Math.abs(u - 2.05) / 0.12) * 0.9), palpI: 0.12 * muda,
    maosY: lerp(290, 370, suave(fr(u, 1.4, 1.9))), esc: 1.02,
  };
}
function cenaC(g, t, m) {
  const ini = t < m.dec ? m.esp : m.perc;
  const cam = { z: lerp(1.0, 1.025, fr(t - ini, 0, 2.6)) + (t >= m.dec ? 0.02 : 0), cx: 960, cy: 540 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.5, () => {
    g.fillStyle = '#2b2642'; g.fillRect(-300, -300, 2520, 1700);
    g.save(); g.filter = 'blur(5px)'; janela(g, 1440, 90, 380, 420); g.restore();
  });
  camada(g, cam, 1, () => {
    P.biaFrente(g, 1110, 520, poseBiaC(t, m));
    luz(g, 900, 380, 1300, '#fff1d2', '#2a2448');
    brilho(g, 700, -60, 700, '#ffcf7a', 0.4);
  });
  camada(g, cam, 1.4, () => {
    g.save(); g.filter = 'blur(14px)';
    forma(g, elipsePts(60, 1080, 380, 300, 12), '#1f4a47', { seed: 410, linha: 0 });
    forma(g, elipsePts(40, 560, 250, 300, 12), '#6e6455', { seed: 411, linha: 0 });
    forma(g, elipsePts(40, 380, 250, 150, 12), '#1a1520', { seed: 412, linha: 0 });
    forma(g, [[10, 260], [30, 150], [110, 110], [170, 150], [90, 170], [60, 260]], '#1a1520', { seed: 413, linha: 0 });
    g.restore();
  });
}


// ---------------------------------------------------------------- composição
let grao = null;
function desenhar(g, t, T) {
  marcas(T);
  const p = planoEm(t);
  D.linhaK.k = 1; D.ferv.amp = 1.6;
  if (p.id === 'A1') cenaA(g, t, M, { z: chave(t, [[0.6, 1.0], [M.mord, 1.04, (x) => x]]), cx: 935, cy: 565 });
  else if (p.id === 'A2') {
    const z = chave(t, [[M.l3, 1.0], [M.preto, 1.07, (x) => x]]);
    cenaA(g, t, M, { z, cx: lerp(935, 905, fr(t, M.l3, M.preto)), cy: lerp(565, 545, fr(t, M.l3, M.preto)) });
  } else if (p.id === 'D') { // detalhe da mesa: mesmo mundo, câmera de perto; o contorno é compensado
    const z = 3.0, u = t - M.mesa;
    D.linhaK.k = 1 / z; D.ferv.amp = 1.6 / z;
    const bate = M.letras[0].pousa - M.mesa;
    cenaA(g, t, M, { z: z + 0.03 * u, cx: lerp(890, 868, suave(fr(u, 0.6, 1.9))), cy: 640, sy: u > bate && u < bate + 0.2 ? Math.sin(u * 140) * 3 * (1 - fr(u, bate, bate + 0.2)) : 0 });
    D.linhaK.k = 1; D.ferv.amp = 1.6;
  }
  else if (p.id === 'B1' || p.id === 'B2' || p.id === 'B3') cenaB(g, t, M);
  else if (p.id === 'C1' || p.id === 'C2') cenaC(g, t, M);
  else { g.fillStyle = '#000'; g.fillRect(0, 0, 1920, 1080); return; }
  if (!grao) grao = D.criarGrao(2048, 1200);
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.07;
  g.drawImage(grao, -(D.hash(D.ferv.passo) * 120) | 0, -(D.hash(D.ferv.passo + 9) * 110) | 0);
  g.restore();
  const esc = 1 - fr(t, 0.6, 1.2);
  if (esc > 0) { g.fillStyle = `rgba(0,0,0,${esc})`; g.fillRect(0, 0, 1920, 1080); }
}

function relatorio() {
  const linhas = ['Alcance das mãos durante cada contato (px que faltaram; precisa ser 0):'];
  for (const [k, v] of Object.entries(REL.falta)) linhas.push(`  ${k}: ${v.toFixed(1)}`);
  linhas.push(`Maior falta em qualquer quadro do plano geral: ${(REL.maxFalta || 0).toFixed(1)} px`);
  linhas.push('', 'Contatos (o som é posto no mesmo instante):');
  for (const c of M.contatos) linhas.push(`  ${c.t.toFixed(3)} s  ${c.nome}`);
  return linhas.join('\n');
}
function contatos(T) { marcas(T); return M.contatos; }

// ---------------------------------------------------------------- som
function som(mesa, T, S) {
  marcas(T);
  const m = M, DUR = T.total + 0.3;
  const { n, ruido, ruidoRosa, biquad, env, seno, soma, escala, dB } = S;
  const pl = (t) => planoEm(Math.min(t, T.total - 0.001)).id;
  const porPlano = (t, tab) => tab[pl(t)] ?? tab.A1;
  // geradores
  const tique = (alto, seed) => {
    const len = n(0.07);
    const c = env(biquad(ruido(len, seed), 'hp', 2000), (t) => Math.exp(-t / 0.0015));
    const r = env(biquad(ruido(len, seed + 1), 'bp', alto ? 3600 : 2900, 14), (t) => Math.exp(-t / 0.012));
    const k = env(seno(len, alto ? 1900 : 1600), (t) => Math.exp(-t / 0.008));
    return soma(escala(c, 0.6), escala(r, 3), escala(k, 0.25));
  };
  const crocante = (dur, dens, seed, pedra = 1) => {
    const len = n(dur + 0.25), y = new Float32Array(len), r = S.rng(seed);
    let t = 0, k = 0;
    while (t < dur) {
      const e = Math.exp(-t / (dur * 0.45)), gl = n(0.0015 + r() * 0.005);
      const gr = biquad(ruido(gl * 3, seed + ++k), 'bp', 900 + r() * 4600, 2 + r() * 4);
      const g0 = (0.35 + 0.65 * r()) * e * 4, i0 = n(t);
      for (let i = 0; i < gr.length && i0 + i < len; i++) y[i0 + i] += gr[i] * g0 * Math.exp((-3 * i) / gl);
      t += (0.002 + r() * 0.012) / (dens * (0.35 + e));
    }
    const thud = env(seno(n(0.16), (tt) => 55 + 130 * Math.exp(-tt * 22)), (tt) => (tt < 0.004 ? tt / 0.004 : Math.exp(-tt / 0.045)));
    const corpo = env(biquad(ruido(n(0.2), seed + 99), 'bp', 420, 1.2), (tt) => Math.exp(-tt / 0.05));
    const ping = env(biquad(ruido(n(0.12), seed + 7), 'bp', 3150, 40), (tt) => Math.exp(-tt / 0.03));
    const ping2 = env(seno(n(0.12), 3150), (tt) => Math.exp(-tt / 0.025));
    const z = soma(y, escala(thud, 0.9), escala(corpo, 1.2), escala(ping, 6 * pedra), escala(ping2, 0.12 * pedra));
    let pk = 0; for (const v of z) pk = Math.max(pk, Math.abs(v));
    return escala(z, 0.9 / pk);
  };
  const engole = () => {
    const len = n(0.3);
    const tom = env(seno(len, (tt) => Math.max(85, 300 - 1100 * tt)), (tt) => (tt < 0.012 ? tt / 0.012 : Math.exp(-(tt - 0.012) / 0.07)));
    const cl = env(biquad(ruido(len, 61), 'bp', 1300, 3), (tt) => Math.exp(-tt / 0.01));
    const ag = env(biquad(ruido(len, 62), 'bp', 700, 2), (tt) => Math.sin(Math.PI * Math.min(1, tt / 0.22)) * 0.5);
    return biquad(soma(tom, escala(cl, 0.8), ag), 'lp', 2500);
  };
  const peca = (f, seed, madeira = 1, dec = 0.022) => {
    const len = n(0.12);
    const a = env(seno(len, f), (t) => Math.exp(-t / dec));
    const b = env(seno(len, f * 2.3), (t) => Math.exp(-t / (dec * 0.55)));
    const c = env(biquad(ruido(len, seed), 'bp', 2200 * madeira, 1.6), (t) => Math.exp(-t / 0.004));
    return soma(a, escala(b, 0.4), escala(c, 1.4));
  };
  // letra de madeira (~5 cm) caindo numa mesa: batida + quiques cada vez menores e mais rápidos
  const quica = (f, seed, forca = 1) => {
    const y = new Float32Array(n(0.5)), r = S.rng(seed);
    let t = 0, a = forca, gap = 0.075 + r() * 0.03;
    for (let k = 0; k < 4 && a > 0.08; k++) {
      const p = peca(f * (1 + (r() - 0.5) * 0.08), seed + k, 1.1);
      const i0 = n(t);
      for (let i = 0; i < p.length && i0 + i < y.length; i++) y[i0 + i] += p[i] * a;
      t += gap; gap *= 0.62; a *= 0.42;
    }
    return y;
  };
  const desliza = (dur, f, seed, q = 1.3) => {
    const len = n(dur), fric = biquad(ruido(len, seed + 1), 'lp', 25);
    let pk = 0; for (const v of fric) pk = Math.max(pk, Math.abs(v));
    const x = biquad(ruido(len, seed), 'bp', f, q);
    return env(x, (t) => Math.min(1, t / 0.04) * Math.min(1, (dur - t) / 0.08) * (0.55 + 0.45 * fric[Math.min(len - 1, n(t))] / pk));
  };
  const metal = (seed) => {
    const len = n(0.35), parc = [[2950, 0.25, 1], [4620, 0.17, 0.6], [6930, 0.11, 0.35], [8400, 0.07, 0.2]];
    return escala(soma(...parc.map(([f, d, a]) => escala(env(seno(len, f), (t) => Math.exp(-t / d)), a)),
      escala(env(biquad(ruido(len, seed), 'hp', 3000), (t) => Math.exp(-t / 0.002)), 0.8)), 0.4);
  };
  const tecido = (dur, seed) => env(biquad(ruido(n(dur), seed), 'bp', 2600, 0.6), (t) => Math.sin(Math.PI * t / dur) * (0.6 + 0.4 * Math.sin(t * 60)));
  const rangido = (dur, seed, f0 = 40) => {
    const len = n(dur), x = new Float32Array(len), r = S.rng(seed);
    let t = 0;
    while (t < dur) { x[n(t)] = 1; t += 1 / (f0 * (0.7 + 0.6 * Math.sin((Math.PI * t) / dur)) * (0.9 + 0.2 * r())); }
    return env(soma(biquad(x, 'bp', 820, 7), escala(biquad(x, 'bp', 1650, 7), 0.6)), (tt) => Math.sin(Math.PI * tt / dur));
  };
  const inspira = (dur, seed) => env(biquad(ruido(n(dur), seed), 'bp', (t) => 1100 + 1400 * t / dur, 1.1), (t) => Math.sin(Math.PI * Math.min(1, t / dur)) ** 1.5);
  // nó do dedo numa coisa dura: corpo médio seco + estalo + um grave curto (lê no celular pelos médios)
  const toc = (seed) => {
    const len = n(0.14);
    const corpo = env(biquad(ruido(len, seed), 'bp', 620, 3.5), (t) => Math.exp(-t / 0.035));
    const est = env(biquad(ruido(len, seed + 1), 'bp', 2400, 2), (t) => Math.exp(-t / 0.004));
    const grave = env(seno(len, (t) => 190 - 300 * t), (t) => Math.exp(-t / 0.03));
    const z = soma(escala(corpo, 5), escala(est, 1.2), escala(grave, 0.5));
    let pk = 0; for (const v of z) pk = Math.max(pk, Math.abs(v));
    return escala(z, 0.9 / pk);
  };
  const pop = (seed) => soma(env(seno(n(0.05), 2300), (t) => Math.exp(-t / 0.008)), escala(env(biquad(ruido(n(0.05), seed), 'hp', 3000), (t) => Math.exp(-t / 0.002)), 0.6));
  const chacoalha = (dur, seed) => { // letras de madeira tremendo no ar, cada vez mais
    const y = new Float32Array(n(dur)), r = S.rng(seed);
    for (let t = 0; t < dur;) {
      const p = peca(1200 + r() * 900, seed + (t * 1000 | 0), 1.3, 0.008);
      const a = 0.15 + 0.85 * (t / dur), i0 = n(t);
      for (let i = 0; i < p.length && i0 + i < y.length; i++) y[i0 + i] += p[i] * a * (0.4 + 0.6 * r());
      t += 0.05 - 0.03 * (t / dur) + r() * 0.02;
    }
    return y;
  };
  const rola = (dur, seed) => env(biquad(ruido(n(dur), seed), 'bp', 950, 2.2), (t) => Math.min(1, t / 0.03) * Math.min(1, (dur - t) / 0.05) * (0.5 + 0.5 * Math.abs(Math.sin(t * 38))));

  // cerâmica: o pratinho encostando na madeira (corpo curto + um brilho de louça)
  const louca = (seed, forca = 1) => {
    const len = n(0.2);
    const corpo = env(biquad(ruido(len, seed), 'bp', 900, 2.2), (t) => Math.exp(-t / 0.018));
    const brilhoL = soma(...[2650, 4100, 5900].map((f, i) => escala(env(seno(len, f), (t) => Math.exp(-t / (0.05 - i * 0.012))), 0.35 / (i + 1))));
    const z = soma(escala(corpo, 4 * forca), escala(brilhoL, forca));
    let pk = 0; for (const v of z) pk = Math.max(pk, Math.abs(v));
    return escala(z, 0.9 / pk);
  };
  const toque = (seed) => env(biquad(ruido(n(0.03), seed), 'bp', 3200, 2), (t) => Math.exp(-t / 0.003)); // ponta do dedo na borda
  const fofo = (seed) => biquad(peca(600, seed, 0.6, 0.01), 'lp', 1500); // letra caindo na cobertura

  // ambiente
  const tc = m.tc, q = m.queda, O = m.letras[2], bate = m.letras[0].pousa;
  const queda = S.curva([[0, 0], [tc - 0.01, 0], [tc + 0.03, -40], [tc + 0.9, -40], [tc + 2.6, 0],
    [m.dec + DEC.treme, 0], [q - 0.05, -7], [q + 0.05, -16], [bate - 0.02, -16], [bate + 0.3, -12], [O.para, -10], [O.para + 0.8, -2], [m.perc + 0.4, 0],
    [m.preto, 0], [T.total, -45]]);
  const sobVoz = (t) => { let d = 0; for (const f of Object.values(T.falas)) d = Math.min(d, t > f.ini - 0.15 && t < f.fim + 0.4 ? -5 : 0); return dB(d); };
  const DL = n(DUR);
  const hum = soma(seno(DL, 100), escala(seno(DL, 200), 0.6), escala(seno(DL, 300), 0.55), escala(seno(DL, 400), 0.4),
    escala(seno(DL, 600), 0.22), escala(seno(DL, (t) => 1180 + 6 * Math.sin(t * 0.7)), 0.05), escala(biquad(ruidoRosa(DL, 3), 'bp', 1400, 0.9), 2.6));
  for (let i = 0; i < DL; i++) hum[i] *= 0.85 + 0.15 * Math.sin((2 * Math.PI * i) / S.SR * 0.23);
  const humPan = { A1: -0.6, A2: -0.6, D: -0.5, B1: -0.35, B2: -0.35, B3: -0.35, C1: -0.1, C2: -0.1, preto: -0.3 };
  const humG = { A1: -35, A2: -35, D: -36, B1: -34, B2: -34, B3: -34, C1: -38, C2: -38, preto: -37 };
  mesa.porLeito(hum, 0, (t) => dB(porPlano(t, humG)) * queda(t) * sobVoz(t), (t) => porPlano(t, humPan), 0.25,
    { nome: 'zumbido da geladeira', origem: 'geladeira, fundo à esquerda', dist: 0.6, pan: -0.5, funcao: 'leito; some na mordida e na queda' });
  mesa.porLeito(biquad(biquad(ruidoRosa(DL, 5), 'lp', 1200), 'hp', 120), 0, (t) => dB(-38) * queda(t) * sobVoz(t), () => 0, 0.4,
    { nome: 'ar da cozinha', origem: 'sala inteira', dist: 0.8, pan: 0, funcao: 'preenche as pausas' });
  m.tiques.forEach((k, i) => {
    if (k.mudo) return;
    const p = pl(k.t), longe = p === 'C1' || p === 'C2';
    const marca = Math.abs(k.t - (m.dec + DEC.piscaPensa)) < 0.05;
    mesa.por(tique(i % 2 === 0, 700 + i), k.t, { g: (longe ? -29 : -27) + (marca ? 3 : 0), pan: longe ? 0.05 : -0.35, dist: longe ? 0.75 : 0.55,
      nome: marca ? 'tique no meio da pausa em que ele procura a resposta' : '', origem: 'relógio', funcao: 'a pausa ganha duração' });
  });

  // A1 · cada som no instante do contato que a imagem mostra
  const c = m.c, gf = m.g;
  mesa.por(pop(10), c.pega, { g: -31, pan: 0.25, dist: 0.3, nome: 'cabinho da cereja solta', origem: 'dedos da Bia no bolo', funcao: 'contato: pegar' });
  mesa.por(fofo(11), c.poe, { g: -30, pan: 0.15, dist: 0.3, nome: 'cereja assenta na cobertura', origem: 'fatia', funcao: 'contato: pôr' });
  mesa.por(toque(12), c.borda, { g: -36, pan: 0.15, dist: 0.3, nome: 'dedos tocam a borda do pratinho', origem: 'Bia', funcao: 'contato: segurar' });
  mesa.por(louca(13, 1), c.pousa, { g: -25, pan: -0.05, dist: 0.35, nome: 'PRATINHO ENCOSTA NA MESA (entrega)', origem: 'entre os dois', funcao: 'contato: soltar' });
  mesa.por(tecido(0.6, 14), c.leva, { g: -38, pan: 0.3, dist: 0.3, nome: 'roupa: Bia se inclina', origem: 'Bia', funcao: '' });
  mesa.por(tecido(0.35, 15), m.prometeu, { g: -37, pan: 0.35, dist: 0.3, nome: 'roupa: Bia junta as mãos', origem: 'Bia', funcao: 'expectativa' });
  mesa.por(metal(16), gf.pega, { g: -33, pan: -0.25, dist: 0.35, nome: 'mão pega o garfo da mesa', origem: 'Nico', funcao: 'contato' });
  mesa.por(peca(1900, 17, 1.7, 0.012), gf.encosta, { g: -31, pan: -0.1, dist: 0.35, nome: 'garfo atravessa a fatia e encosta no prato', origem: 'pratinho', funcao: 'contato' });

  // B1 · B2
  mesa.por(inspira(0.32, 18), m.mord + MORD.prepara, { g: -30, pan: 0, dist: 0.05, nome: 'Nico toma ar', origem: 'boca do Nico', funcao: 'preparação' });
  mesa.por(crocante(0.3, 1.1, 19), tc, { g: 0, pan: 0, dist: 0, nome: 'MORDIDA', origem: 'boca do Nico, colada', funcao: 'o som conta antes do rosto' });
  mesa.por(crocante(0.42, 0.55, 20, 0.5), m.mord + MORD.segunda, { g: -9, pan: 0, dist: 0, nome: 'segunda mastigada', origem: 'boca do Nico', funcao: 'confirma' });
  mesa.por(rangido(0.3, 21, 45), m.esp + 1.0, { g: -34, pan: 0.15, dist: 0.25, nome: 'cadeira: Bia se aproxima', origem: 'cadeira da Bia', funcao: 'reação pequena' });
  mesa.por(inspira(0.3, 22), m.dec + DEC.ar, { g: -30, pan: 0, dist: 0.05, nome: 'Nico toma ar (decide)', origem: 'nariz do Nico', funcao: 'a decisão tem corpo' });
  mesa.por(engole(), m.dec + DEC.gole, { g: -28, pan: 0, dist: 0, nome: 'engolida', origem: 'garganta do Nico', funcao: 'antes do sorriso' });
  let k = 0;
  for (const ch of FRASE) {
    if (ch === ' ') continue;
    mesa.por(peca(1050 + k * 40, 30 + k), m.dec + DEC.letras + k * 0.08, { g: -31, pan: 0.05 + k * 0.05, dist: 0.1, nome: k === 0 ? 'letras aparecem' : '', origem: 'texto em cena', funcao: 'a fala tem peso de objeto' });
    k++;
  }
  mesa.por(chacoalha(DEC.cai - DEC.treme, 40), m.dec + DEC.treme, { g: -33, pan: 0.2, dist: 0.1, nome: 'letras tremem no ar', origem: 'texto em cena', funcao: 'esforço' });

  // D · a frase bate: louça (no prato), cobertura (na fatia), madeira (na mesa)
  m.letras.forEach((l, i) => {
    const s = l.onde === 'prato' ? louca(50 + i, 0.6) : l.onde === 'fatia' ? fofo(50 + i) : quica(820 + ((i * 137) % 5) * 110, 50 + i, 0.8);
    const g = l.onde === 'prato' ? -33 : l.onde === 'fatia' ? -31 : -34; // 7 no prato em 0,2 s: cada um mais baixo
    mesa.por(s, l.pousa, { g, pan: -0.1 + i * 0.04, dist: 0.25, nome: `letra ${l.ch} bate (${l.onde})`, origem: l.onde, funcao: i === 0 ? 'a frase bate no prato que ela fez' : '' });
  });
  mesa.por(env(rola(O.cai - O.pousa, 59), (t) => 0.6), O.pousa + 0.04, { g: -36, pan: -0.15, dist: 0.25, nome: '', origem: '"Ó" escorregando no prato', funcao: '' });
  mesa.por(peca(760, 60, 0.9, 0.018), O.cai, { g: -33, pan: -0.2, dist: 0.25, nome: '"Ó" cai do prato na madeira', origem: 'mesa', funcao: 'contato' });
  // rolar: o som perde força e ritmo junto com a velocidade
  const rolarDur = O.para - O.cai - 0.45;
  mesa.por(env(rola(rolarDur, 61), (t) => Math.exp(-t / 0.33)), O.cai + 0.02, { g: -30, pan: -0.25, dist: 0.25, nome: '"Ó" rolando na madeira', origem: 'mesa', funcao: 'uma última letra parando' });
  // um toque cada vez que o balanço passa pelo ponto de apoio (2,6 Hz)
  [0.0, 0.19, 0.38].forEach((dt, i) => mesa.por(peca(700, 62 + i, 0.8, 0.01), O.para - 0.45 + dt, { g: -36 - i * 3, pan: -0.25, dist: 0.25, nome: i === 0 ? '"Ó" balança e para' : '', origem: 'mesa', funcao: '' }));
  // B3 · o olhar dele fecha: um suspiro curto
  mesa.por(env(biquad(ruido(n(0.45), 70), 'bp', 900, 0.9), (t) => Math.sin(Math.PI * t / 0.45) ** 2), m.olhar + 0.5, { g: -32, pan: 0, dist: 0.05, nome: 'Nico solta o ar', origem: 'nariz do Nico', funcao: 'fecha a queda' });
  // C2
  mesa.por(tecido(0.4, 71), m.perc + 1.4, { g: -37, pan: 0.05, dist: 0.2, nome: 'roupa: mãos descem', origem: 'Bia', funcao: 'a postura muda' });
  // A2 · a volta do prato, contato por contato
  const d = m.d;
  mesa.por(tecido(0.5, 72), d.vai, { g: -37, pan: 0.3, dist: 0.35, nome: 'roupa: Bia se aproxima', origem: 'Bia', funcao: '' });
  mesa.por(toque(73), d.toca, { g: -35, pan: 0.0, dist: 0.3, nome: 'dedos tocam a borda do pratinho (volta)', origem: 'Bia', funcao: 'contato: segurar' });
  mesa.por(chacoalha(0.22, 74), d.ergue, { g: -40, pan: 0.0, dist: 0.3, nome: 'letras chacoalham no prato erguido', origem: 'pratinho', funcao: '' });
  mesa.por(louca(75, 1), d.pousa, { g: -25, pan: 0.15, dist: 0.35, nome: 'PRATINHO ENCOSTA NA MESA (volta)', origem: 'perto da Bia', funcao: 'contato: soltar' });
  mesa.por(env(tecido(0.8, 76), (t) => 0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 7)), d.boca + 0.15, { g: -36, pan: 0.3, dist: 0.35, nome: 'riso contido (só roupa)', origem: 'Bia', funcao: 'sem voz de personagem' });
  mesa.por(rangido(0.45, 77, 32), m.dev + 2.5, { g: -33, pan: -0.4, dist: 0.35, nome: 'cadeira: Nico relaxa', origem: 'cadeira do Nico', funcao: 'alívio' });
}

module.exports = { FPS, blocos, desenhar, som, relatorio, contatos, MORD, DEC, ganhoVoz: -2, legendas: false, srt: true };
