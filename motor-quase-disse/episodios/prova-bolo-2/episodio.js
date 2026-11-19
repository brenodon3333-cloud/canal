// PROVA 2 · "O bolo", segunda versão (~31 s).
// A história que esta versão conta: o Nico tenta sustentar o elogio, a frase cai, e a Bia vê a frase cair.
// Ela entende sem que ninguém diga nada. O final muda por causa disso.
const D = require('../../motor/desenho');
const P = require('./personagens');
const { chave, fr, suave, saida, entrada, voltaAtras, mola, lerp, forma, traco, elipsePts, TINTA } = D;

const FPS = 24;

// ---------------------------------------------------------------- linha do tempo (ajustável)
const blocos = [
  { id: 'abre', dur: 1.0 },                          // escuro: a cozinha se ouve antes de se ver
  { id: 'l1', fala: 'L1', antes: 1.5, depois: 1.0 }, // a cereja: o cuidado dela abre a cena
  { id: 'l2', fala: 'L2', antes: 0.4, depois: 1.35 },// depois da fala: ele pega o garfo, ela acompanha
  { id: 'mordida', dur: 3.9 },                       // B1: preparação, contato, gosto, olha para ela
  { id: 'espera', dur: 2.6 },                        // C1: o que ele vê
  { id: 'decide', dur: 5.0 },                        // B2: procura a resposta, decide, sorri, a frase cai
  { id: 'mesa', dur: 1.1 },                          // D: detalhe: as letras batem na mesa
  { id: 'percebe', dur: 2.9 },                       // C2: ela viu a frase cair
  { id: 'bate', dur: 4.1 },                          // A2: toc toc na fatia; os dois sabem
  { id: 'l3', fala: 'L3', antes: 0.3, depois: 1.5 },
  { id: 'preto', dur: 1.2 },
];
const MORD = { sobe: 0.55, olhaBia: 0.85, voltaGarfo: 1.05, prepara: 1.10, contato: 1.50, entende: 1.72, segunda: 2.30, procura: 2.95 };
const DEC = { olhaBaixo: 0.35, piscaPensa: 1.0, ar: 1.45, gole: 1.7, volta: 1.95, sorri: 2.25, letras: 2.95, treme: 3.6, cede: 4.0, cai: 4.35 };
const FRASE = 'TÁ ÓTIMO.';

// posições no plano geral (mundo de 1920x1080)
const NICO_X = 680, BIA_X = 1240, MESA_Y = 690, BOLO_X = 1090, CHAO_Y = 1004;
const CEREJA_BOLO = { x: BOLO_X + 4, y: MESA_Y - 152 };

let M = null;
function marcas(T) {
  if (M) return M;
  const l1 = T.B('l1').ini, f2 = T.fala('L2').fim;
  M = {
    l1, pb: T.W('L1', 'bolo').ini - 0.05,
    nico: T.W('L2', 'Nico').ini, prometeu: T.W('L2', 'prometeu').ini, f2,
    mord: T.B('mordida').ini, esp: T.B('espera').ini, dec: T.B('decide').ini, mesa: T.B('mesa').ini,
    perc: T.B('percebe').ini, bate: T.B('bate').ini, l3: T.B('l3').ini, preto: T.B('preto').ini,
  };
  M.tc = M.mord + MORD.contato;
  M.cereja = { pega: l1 + 0.6, poe: l1 + 1.35 };
  M.garfo = { pega: f2 + 0.4, aperta: f2 + 0.62, sobe: f2 + 0.75 };
  M.queda = M.dec + DEC.cai;
  M.planos = [
    { de: 0, ate: M.mord, id: 'A1' }, { de: M.mord, ate: M.esp, id: 'B1' }, { de: M.esp, ate: M.dec, id: 'C1' },
    { de: M.dec, ate: M.mesa, id: 'B2' }, { de: M.mesa, ate: M.perc, id: 'D' }, { de: M.perc, ate: M.bate, id: 'C2' },
    { de: M.bate, ate: M.preto, id: 'A2' }, { de: M.preto, ate: T.total + 1, id: 'preto' },
  ];
  M.letras = letrasMundo(M);
  // relógio: a fase é escolhida para um tique cair no meio da pausa em que ele procura a resposta
  const fase = (M.dec + DEC.piscaPensa) % 1;
  const evita = [M.tc, M.dec + DEC.ar, M.dec + DEC.gole, M.mesa + 0.4, M.letras[2].chao, M.bate + 1.0, M.bate + 1.22];
  M.tiques = [];
  for (let t = fase; t < T.total; t += 1) {
    const mudo = (t > M.tc - 0.02 && t < M.tc + 1.25) || (t > M.queda - 0.5 && t < M.mesa + 0.7) || evita.some((e) => Math.abs(t - e) < 0.22);
    M.tiques.push({ t, mudo });
  }
  return M;
}
const planoEm = (t) => M.planos.find((p) => t >= p.de && t < p.ate);

// ---------------------------------------------------------------- as letras depois que caem (mundo)
// Uma só descrição serve ao detalhe (D) e ao geral (A2). O "Ó", o primeiro a ceder, rola e cai no chão.
function letrasMundo(m) {
  const base = [[712, -0.35, 4], [738, 0.2, 18], [758, 0, 8], [781, 0.55, 2], [800, -0.25, 16], [726, 0.75, 24], [764, -0.6, 25], [790, 0.1, 26]]; // x, giro, profundidade no tampo
  const L = [];
  let k = 0;
  for (const ch of FRASE) {
    if (ch === ' ') continue;
    const [x, r, fundo] = base[k];
    const pousa = m.mesa + 0.38 + k * 0.035;
    L.push({ ch, x, r, fundo, pousa, rola: k === 2 });
    k++;
  }
  const o = L[2];
  o.beira = o.pousa + 0.32;                 // chega à beira da mesa
  o.chao = o.beira + Math.sqrt((2 * (CHAO_Y - 16 - 716)) / 2400); // tempo de queda até o chão
  return L;
}
function letraMundoEm(l, t) {
  const g = 2400, y0 = MESA_Y - 230, yl = MESA_Y - 4 + (l.fundo || 0);
  if (t < l.pousa - 0.38) return null;
  if (t < l.pousa) { const dt = t - (l.pousa - 0.38); return { x: l.x - 18 + 18 * (dt / 0.38), y: Math.min(yl, y0 + 0.5 * g * dt * dt * 1.36), r: l.r * dt * 1.5 }; }
  const dl = t - l.pousa;
  if (!l.rola) return { x: l.x, y: yl - Math.abs(Math.sin(dl * 26)) * Math.exp(-dl * 12) * 9, r: l.r };
  if (t < l.beira) { const q = fr(t, l.pousa, l.beira); return { x: l.x - 22 * q, y: lerp(MESA_Y, 716, q) - Math.abs(Math.sin(dl * 30)) * Math.exp(-dl * 8) * 7, r: -5 * q }; }
  if (t < l.chao) { const dt = t - l.beira; return { x: l.x - 22 - 40 * dt, y: 716 + 0.5 * g * dt * dt, r: -5 - 7 * dt }; }
  const dc = t - l.chao, xf = l.x - 22 - 40 * (l.chao - l.beira);
  return { x: xf, y: CHAO_Y - 16 - Math.abs(Math.sin(dc * 18)) * Math.exp(-dc * 9) * 14, r: -5 - 7 * (l.chao - l.beira) };
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
function geladeira(g, x0, y0, w, h) {
  forma(g, [[x0, y0], [x0 + w, y0 + 6], [x0 + w, y0 + h], [x0, y0 + h]], '#6f7a90', { seed: 220, linha: 5 });
  traco(g, [[x0, y0 + h * 0.34], [x0 + w, y0 + h * 0.34]], 5, { seed: 221 });
  traco(g, [[x0 + w - 28, y0 + h * 0.1], [x0 + w - 28, y0 + h * 0.26]], 9, { seed: 222 });
  traco(g, [[x0 + w - 28, y0 + h * 0.42], [x0 + w - 28, y0 + h * 0.62]], 9, { seed: 223 });
  g.fillStyle = '#7dff9e'; g.beginPath(); g.arc(x0 + w - 60, y0 + h * 0.08, 5, 0, 7); g.fill();
}
function janela(g, x0, y0, w, h) {
  forma(g, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], '#203a63', { seed: 230, linha: 6 });
  g.fillStyle = '#f5ecc8'; g.beginPath(); g.arc(x0 + w * 0.68, y0 + h * 0.3, h * 0.11, 0, 7); g.fill();
  g.fillStyle = '#203a63'; g.beginPath(); g.arc(x0 + w * 0.68 + h * 0.05, y0 + h * 0.27, h * 0.1, 0, 7); g.fill();
  traco(g, [[x0 + w / 2, y0], [x0 + w / 2, y0 + h]], 6, { seed: 231 });
  traco(g, [[x0, y0 + h / 2], [x0 + w, y0 + h / 2]], 6, { seed: 232 });
}
function cereja(g, x, y) {
  forma(g, elipsePts(x, y, 13, 13, 8), '#c62a3a', { seed: 267, linha: 4 });
  traco(g, [[x + 2, y - 12], [x + 11, y - 30]], 4, { seed: 268 });
  g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(x - 4, y - 4, 3, 0, 7); g.fill();
}
function fatia(g, x, y, mordida = false) {
  const top = mordida ? [[x - 30, y - 40], [x + 6, y - 40], [x + 14, y - 30], [x + 30, y - 40]] : [[x - 30, y - 40], [x + 30, y - 40]];
  forma(g, [[x - 34, y], [x + 34, y], ...top.slice().reverse().map(([a, b]) => [a, b])], '#e8b86a', { seed: 240, linha: 4 });
  traco(g, [[x - 32, y - 20], [x + 32, y - 20]], 6, { seed: 241, tinta: '#c0566d', tremor: 0.4 });
  forma(g, [[x - 32, y - 38], [x + 32, y - 38], [x + 28, y - 52], [x - 28, y - 52]], '#f4a6b8', { seed: 242, linha: 4 });
}
function prato(g, x, y) { forma(g, elipsePts(x, y, 72, 11, 12), '#ece8e0', { seed: 250, linha: 4 }); }
function boloInteiro(g, x, comCereja) {
  const y = MESA_Y;
  forma(g, elipsePts(x, y - 4, 52, 9, 10), '#d9d2c4', { seed: 260, linha: 4 });
  forma(g, [[x - 12, y - 6], [x + 12, y - 6], [x + 9, y - 30], [x - 9, y - 30]], '#d9d2c4', { seed: 261, linha: 4 });
  forma(g, elipsePts(x, y - 32, 100, 12, 12), '#ece8e0', { seed: 262, linha: 4 });
  forma(g, [[x - 85, y - 36], [x + 85, y - 36], [x + 82, y - 120], [x - 82, y - 120]], '#e8b86a', { seed: 263, linha: 5 });
  traco(g, [[x - 82, y - 78], [x + 82, y - 78]], 8, { seed: 264, tinta: '#c0566d', tremor: 0.4 });
  forma(g, [[x - 86, y - 116], [x + 86, y - 116], [x + 86, y - 100], [x + 60, y - 92], [x + 40, y - 102], [x + 10, y - 88], [x - 20, y - 100], [x - 50, y - 90], [x - 86, y - 102]], '#f4a6b8', { seed: 265, linha: 5 });
  forma(g, [[x - 84, y - 136], [x + 84, y - 136], [x + 86, y - 116], [x - 86, y - 116]], '#f4a6b8', { seed: 266, linha: 5 });
  if (comCereja) cereja(g, CEREJA_BOLO.x, CEREJA_BOLO.y);
  forma(g, [[x - 85, y - 36], [x - 52, y - 36], [x - 52, y - 136], [x - 84, y - 136]], '#d9a659', { seed: 269, linha: 4 });
}
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
function letra(g, ch, x, y, tam, r = 0, esc = 1) {
  g.save(); g.translate(x, y); g.rotate(r); g.scale(esc, esc);
  g.font = `${tam}px Archivo`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.lineJoin = 'round'; g.lineWidth = tam * 0.12; g.strokeStyle = TINTA; g.strokeText(ch, 0, 0);
  g.fillStyle = '#fbf8f1'; g.fillText(ch, 0, 0);
  g.restore();
}

// ---------------------------------------------------------------- estado dos objetos no geral
function pratoX(t, m) {
  return chave(t, [[m.pb, 975], [m.pb + 0.35, 915, (x) => x], [m.pb + 1.0, 860, saida], [m.bate + 2.9, 860], [m.bate + 3.5, 960, suave]]);
}
function cerejaPos(t, m, pose) { // onde está a cereja agora: no bolo, na mão da Bia ou na fatia
  if (t < m.cereja.pega) return { onde: 'bolo' };
  if (t < m.cereja.poe) { const h = pose.maos[0]; return { onde: 'mao', x: BIA_X - h.x, y: MESA_Y + h.y - 16 }; } // presa na ponta dos dedos
  return { onde: 'fatia' };
}

// ---------------------------------------------------------------- poses do plano geral
const QUEIXO = [{ x: 78, y: -186 }, { x: 64, y: -180 }];
function poseNicoA(t, m) {
  const p = { olhoX: 0.6, olhoY: 0, pupila: 0.5, mao: { x: 60, y: -8 }, cantoE: 3, cantoD: 5 };
  if (t < m.mord) {
    // acompanha as mãos dela (cereja e prato) e só depois olha no rosto
    const maos = fr(t, m.l1 + 0.4, m.l1 + 0.7) * (1 - fr(t, m.pb + 0.9, m.pb + 1.15));
    p.olhoY = 0.55 * maos; p.olhoX = 0.6 + 0.1 * maos;
    p.dy = -6 * fr(t, m.nico, m.nico + 0.3);
    p.cantoD = 5 + 5 * fr(t, m.pb + 1.0, m.pb + 1.3); // sorri de volta para ela
    p.palpS = Math.max(0, 1 - Math.abs(t - (m.l1 + 0.2)) / 0.07) + Math.max(0, 1 - Math.abs(t - (m.nico + 0.6)) / 0.07);
    // garfo: vai até o garfo no prato, segura, aperta a fatia, levanta com um pedaço
    const px = pratoX(t, m), loc = (wx, wy) => ({ x: wx - NICO_X, y: wy - MESA_Y });
    const cabo = loc(px - 28, MESA_Y - 4), sobreFatia = loc(px - 2, MESA_Y - 118), alto = loc(NICO_X + 112, MESA_Y - 72);
    const g0 = m.f2 + 0.05, g1 = m.garfo.pega, g2 = m.garfo.aperta, g3 = m.garfo.sobe, g4 = m.garfo.sobe + 0.4;
    if (t >= g0) {
      const a = suave(fr(t, g0, g1)), b = suave(fr(t, g1, g2)), c = suave(fr(t, g3, g4));
      let mx = lerp(60, cabo.x, a), my = lerp(-8, cabo.y, a);
      mx = lerp(mx, sobreFatia.x, b); my = lerp(my, sobreFatia.y, b);
      const aperta = Math.sin(Math.PI * fr(t, g2, g3)) * 10; // empurra o garfo na fatia
      my += aperta;
      mx = lerp(mx, alto.x, c); my = lerp(my, alto.y, c);
      p.mao = { x: mx, y: my };
      p.garfo = t >= g1;
      p.ponta = { x: lerp(lerp(56, 4, b), 30, c), y: lerp(lerp(-4, 52, b), -58, c) };
      p.pedaco = t >= g3;
      p.olhoY = lerp(0.6 * a, -0.05, c); p.olhoX = lerp(0.65, 0.45, c);
    }
    return p;
  }
  // depois da queda: olha as letras; o toc toc; é pego; alívio e sorriso de verdade
  const u = t - m.bate;
  p.garfo = true; p.mao = { x: -5, y: -10 }; p.ponta = { x: 40, y: -40 };
  p.pupila = 0.3; p.olhoY = 0.7; p.olhoX = 0.55; p.sobrInc = 0.6; p.cantoE = -2; p.cantoD = 0; p.dy = 6;
  const olhaFatia = fr(u, 1.0, 1.1), pego = fr(u, 1.4, 1.5), alivio = fr(u, 1.8, 2.2);
  p.olhoY = lerp(lerp(0.7, 0.45, olhaFatia), 0, pego); p.olhoX = lerp(0.55, 0.7, olhaFatia);
  p.sobr = 0.6 * pego * (1 - alivio); p.pupila = lerp(0.3, 0.5, pego);
  p.dy = lerp(6, 14, alivio); p.cabRot = 0.04 * alivio;
  p.feliz = u > 2.05 && u < 3.4 ? 1 : 0;
  p.cantoE = lerp(-2, 9, alivio); p.cantoD = lerp(0, 13, alivio); p.sobrInc = lerp(0.6, 0.2, alivio);
  p.palpS = Math.max(0, 1 - Math.abs(t - (m.l3 + 1.1)) / 0.07);
  return p;
}
function poseBiaA(t, m) {
  const p = { olhoX: 0.6, pupila: 0.6, cantoE: 7, cantoD: 10, maos: [{ x: 95, y: -8 }, { x: 78, y: -12 }] };
  const loc = (wx, wy) => ({ x: BIA_X - wx, y: wy - MESA_Y });
  if (t < m.mord) {
    const l1 = m.l1;
    const cBolo = loc(CEREJA_BOLO.x, CEREJA_BOLO.y + 16), cFatia = loc(975 + 14, MESA_Y - 70 + 16), borda = loc(1044, MESA_Y - 6);
    const vai = suave(fr(t, l1 + 0.1, m.cereja.pega)), leva = suave(fr(t, m.cereja.pega + 0.05, m.cereja.poe));
    const ajeita = Math.sin(Math.PI * fr(t, m.cereja.poe, m.cereja.poe + 0.3)) * 3; // aperta a cereja de leve
    const borda1 = suave(fr(t, m.cereja.poe + 0.3, m.cereja.poe + 0.6));
    const ergue = Math.sin(Math.PI * leva) * 40;
    let h = { x: lerp(95, cBolo.x, vai), y: lerp(-8, cBolo.y, vai) };
    h = { x: lerp(h.x, cFatia.x, leva), y: lerp(h.y, cFatia.y, leva) - ergue + ajeita };
    h = { x: lerp(h.x, borda.x, borda1), y: lerp(h.y, borda.y, borda1) };
    // empurra o prato com a ponta dos dedos e solta; o prato chega sozinho
    const px = pratoX(t, m);
    if (t >= m.pb && t < m.pb + 0.35) h = { x: BIA_X - px - 70, y: -6 };
    const solta = suave(fr(t, m.pb + 0.4, m.pb + 0.9));
    if (t >= m.pb + 0.35) h = { x: lerp(BIA_X - 915 - 70, 95, solta), y: lerp(-6, -8, solta) };
    p.maos[0] = h;
    // olhos na cereja, depois no prato, depois no rosto dele
    const naMao = fr(t, l1 + 0.05, l1 + 0.3) * (1 - fr(t, m.pb + 0.9, m.pb + 1.2));
    p.olhoY = 0.6 * naMao; p.olhoX = 0.6 - 0.05 * naMao;
    p.rot = 0.05 * naMao;
    const inc = suave(fr(t, m.prometeu, m.prometeu + 0.45));
    p.rot = Math.max(p.rot, 0.07 * inc);
    p.maos = [{ x: lerp(p.maos[0].x, QUEIXO[0].x, inc), y: lerp(p.maos[0].y, QUEIXO[0].y, inc) }, { x: lerp(78, QUEIXO[1].x, inc), y: lerp(-12, QUEIXO[1].y, inc) }];
    // acompanha o garfo: desce até o prato, sobe com ele
    const naFatia = fr(t, m.f2 + 0.1, m.f2 + 0.3), sobe = fr(t, m.garfo.sobe, m.garfo.sobe + 0.45);
    if (t > m.f2) { p.olhoY = lerp(0.5 * naFatia, -0.15, sobe); p.cabRot = -0.05 * sobe; p.cantoE = 8 + 4 * sobe; p.cantoD = 11 + 4 * sobe; }
    p.palpS = Math.max(0, 1 - Math.abs(t - (m.nico + 0.15)) / 0.07);
    return p;
  }
  // A2: toc toc; mão na boca; segura o riso; puxa o prato de volta
  const u = t - m.bate;
  p.maos = QUEIXO.map((q) => ({ ...q })); p.olhoY = 0; p.cantoE = 8; p.cantoD = 9; p.sobrInc = 0.5;
  const fatia = loc(pratoX(t, m) - 4, MESA_Y - 64), sobre = { x: fatia.x, y: fatia.y - 30 };
  const vai = suave(fr(u, 0.3, 0.9)), recolhe = suave(fr(u, 1.35, 1.55)), boca = suave(fr(u, 1.5, 1.75));
  const toc = Math.max(0, 1 - Math.abs(u - 1.0) / 0.06) + Math.max(0, 1 - Math.abs(u - 1.22) / 0.06);
  let h = { x: lerp(QUEIXO[0].x, sobre.x, vai), y: lerp(QUEIXO[0].y, sobre.y, vai) + 30 * Math.min(1, toc) };
  h = { x: lerp(h.x, 330, recolhe), y: lerp(h.y, -100, recolhe) };
  h = { x: lerp(h.x, 76, boca), y: lerp(h.y, -212, boca) };
  const desce = suave(fr(u, 2.55, 2.95));
  h = { x: lerp(h.x, 95, desce), y: lerp(h.y, -8, desce) };
  // puxa o prato de volta
  const pegaPrato = suave(fr(u, 2.6, 2.9)), soltaPrato = suave(fr(u, 3.55, 3.9));
  const bordaPrato = loc(pratoX(t, m) + 70, MESA_Y - 6);
  const outra = { x: lerp(lerp(QUEIXO[1].x, bordaPrato.x, pegaPrato), 95, soltaPrato), y: lerp(lerp(QUEIXO[1].y, bordaPrato.y, pegaPrato), -8, soltaPrato) };
  p.maos = [h, outra];
  p.rot = 0.15 * vai * (1 - recolhe * 0.7) + 0.08 * pegaPrato * (1 - soltaPrato);
  p.olhoY = 0.45 * vai * (1 - fr(u, 1.3, 1.45));
  p.feliz = u > 1.7 && u < 2.6 ? 1 : 0;
  p.dy = u > 1.7 && u < 2.5 ? Math.sin(u * 2 * Math.PI * 7) * 3 : 0; // riso contido: só os ombros
  p.cantoE = 8 + 6 * fr(u, 1.6, 1.8); p.cantoD = 10 + 6 * fr(u, 1.6, 1.8);
  p.sobrInc = 0.5 * (1 - fr(u, 1.6, 2.0));
  p.palpS = Math.max(0, 1 - Math.abs(t - (m.l3 + 0.5)) / 0.07);
  return p;
}

// ---------------------------------------------------------------- plano geral (também o detalhe, com outra câmera)
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
    traco(g, [[960, -200], [960, 190]], 4, { seed: 310 });
    forma(g, [[905, 190], [1015, 190], [1085, 282], [835, 282]], '#c8892f', { seed: 311, linha: 5 });
    const pn = poseNicoA(t, m), pb = poseBiaA(t, m);
    P.cadeiraPerfil(g, NICO_X, MESA_Y, 1);
    P.cadeiraPerfil(g, BIA_X, MESA_Y, -1);
    P.nicoPerfil(g, NICO_X, MESA_Y, { ...pn, parte: 'corpo' });
    P.biaPerfil(g, BIA_X, MESA_Y, { ...pb, parte: 'corpo' });
    P.pernasPerfil(g, NICO_X, MESA_Y, 1, P.COR.nicoCalca, pn.dy || 0);
    P.pernasPerfil(g, BIA_X, MESA_Y, -1, P.COR.biaCalca, pb.dy || 0, 10);
    forma(g, [[300, 682], [1620, 682], [1636, 716], [284, 716]], '#a45d36', { seed: 320, linha: 5 });
    forma(g, [[284, 716], [1636, 716], [1636, 752], [284, 752]], '#6e3622', { seed: 321, linha: 5 });
    forma(g, [[340, 752], [372, 752], [366, CHAO_Y + 2], [346, CHAO_Y + 2]], '#4d2618', { seed: 322, linha: 5 });
    forma(g, [[1548, 752], [1580, 752], [1574, CHAO_Y + 2], [1554, CHAO_Y + 2]], '#4d2618', { seed: 323, linha: 5 });
    const px = pratoX(t, m);
    prato(g, px, MESA_Y - 2);
    fatia(g, px, MESA_Y - 8, t >= m.mord);
    const c = cerejaPos(t, m, pb);
    if (c.onde === 'fatia') cereja(g, px + 14, MESA_Y - 70);
    if (!pn.garfo && t < m.mord) { // garfo deitado no prato até ele pegar
      D.membro(g, [[px - 34, MESA_Y - 12], [px + 26, MESA_Y - 16]], 3, '#c9ced8', { seed: 330, borda: 2.5 });
    }
    boloInteiro(g, BOLO_X, c.onde === 'bolo');
    if (t >= m.mesa) for (const l of [...m.letras].sort((a, b) => a.fundo - b.fundo)) { const s = letraMundoEm(l, t); if (s) letra(g, l.ch, s.x, s.y, 30, s.r); }
    P.nicoPerfil(g, NICO_X, MESA_Y, { ...pn, parte: 'bracos' });
    P.biaPerfil(g, BIA_X, MESA_Y, { ...pb, parte: 'bracos' });
    if (c.onde === 'mao') cereja(g, c.x, c.y); // por cima dos dedos, para se ver a pinça
    luz(g, 960, 600, 1250, '#fff3d6', '#2a2448');
    brilho(g, 960, 300, 480, '#ffcf7a', 0.35);
    brilho(g, 960, 690, 520, '#ffcf7a', 0.18);
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
    z: t < m.esp ? lerp(1.0, 1.035, fr(t, m.mord, m.esp)) : lerp(1.045, 1.075, fr(t, m.dec, m.mesa)),
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
    if (t >= m.dec) letrasB(g, t, m);
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
  // C2: ela olhou as letras caírem; o "Ó" bate no chão; os olhos voltam para ele; o rosto muda
  const u = t - m.perc, chao = m.letras[2].chao - m.perc;
  const segue = suave(fr(u, chao - 0.05, chao + 0.15)), volta = suave(fr(u, 0.95, 1.35)), muda = suave(fr(u, 1.45, 1.95));
  return {
    olhoX: lerp(-0.45, -0.7, volta), olhoY: lerp(lerp(0.75, 0.95, segue), 0, volta), pupila: 0.6,
    sobr: lerp(0.5, 0.15, muda) - 0.2 * segue * (1 - volta), sobrInc: 0.85 * muda,
    cantoE: lerp(lerp(16, 6, fr(u, 0.4, 0.9)), 9, muda), cantoD: lerp(lerp(18, 7, fr(u, 0.4, 0.9)), 11, muda), larg: lerp(110, 78, muda),
    bochecha: 0.6 * muda, cabRot: lerp(-0.02, -0.07, muda), dy: 8 * segue * (1 - volta) - 4 * muda,
    palpS: Math.max(0, 1 - Math.abs(u - 2.15) / 0.12) * 0.9, palpI: 0.12 * muda,
    maosY: lerp(290, 370, suave(fr(u, 1.5, 2.0))), esc: 1.02,
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
const CAM_A = { z: 0.96, cx: 960, cy: 585 }; // abre um pouco: os pés ficam acima da faixa da legenda
function desenhar(g, t, T) {
  marcas(T);
  const p = planoEm(t);
  D.linhaK.k = 1; D.ferv.amp = 1.6;
  if (p.id === 'A1') cenaA(g, t, M, { ...CAM_A, z: chave(t, [[0.6, 0.96], [M.mord, 0.995, (x) => x]]) });
  else if (p.id === 'A2') {
    const z = chave(t, [[M.l3, 0.96], [M.preto, 1.03, (x) => x]]);
    cenaA(g, t, M, { z, cx: lerp(960, 950, fr(t, M.l3, M.preto)), cy: lerp(585, 560, fr(t, M.l3, M.preto)) });
  } else if (p.id === 'D') { // detalhe: mesmo mundo, câmera de perto; contorno compensado
    const z = 3.0, u = t - M.mesa;
    D.linhaK.k = 1 / z; D.ferv.amp = 1.6 / z;
    cenaA(g, t, M, { z: z + 0.06 * u, cx: 790, cy: 640, sy: u > 0.38 && u < 0.6 ? Math.sin(u * 140) * 4 * (1 - fr(u, 0.38, 0.6)) : 0 });
    D.linhaK.k = 1; D.ferv.amp = 1.6;
  }
  else if (p.id === 'B1' || p.id === 'B2') cenaB(g, t, M);
  else if (p.id === 'C1' || p.id === 'C2') cenaC(g, t, M);
  else { g.fillStyle = '#000'; g.fillRect(0, 0, 1920, 1080); return; }
  if (!grao) grao = D.criarGrao(2048, 1200);
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.07;
  g.drawImage(grao, -(D.hash(D.ferv.passo) * 120) | 0, -(D.hash(D.ferv.passo + 9) * 110) | 0);
  g.restore();
  const esc = 1 - fr(t, 0.6, 1.2);
  if (esc > 0) { g.fillStyle = `rgba(0,0,0,${esc})`; g.fillRect(0, 0, 1920, 1080); }
}

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

  // ambiente: a mordida apaga o mundo; antes da queda a sala "prende a respiração"; depois volta
  const tc = m.tc, q = m.queda, pousa = m.mesa + 0.38;
  const queda = S.curva([[0, 0], [tc - 0.01, 0], [tc + 0.03, -40], [tc + 0.9, -40], [tc + 2.6, 0],
    [m.dec + DEC.treme, 0], [q - 0.05, -7], [q + 0.05, -16], [pousa - 0.02, -16], [pousa + 0.6, -2], [m.perc + 0.6, 0],
    [m.preto, 0], [T.total, -45]]);
  const sobVoz = (t) => { let d = 0; for (const f of Object.values(T.falas)) d = Math.min(d, t > f.ini - 0.15 && t < f.fim + 0.4 ? -5 : 0); return dB(d); };
  const DL = n(DUR);
  const hum = soma(seno(DL, 100), escala(seno(DL, 200), 0.6), escala(seno(DL, 300), 0.55), escala(seno(DL, 400), 0.4),
    escala(seno(DL, 600), 0.22), escala(seno(DL, (t) => 1180 + 6 * Math.sin(t * 0.7)), 0.05), escala(biquad(ruidoRosa(DL, 3), 'bp', 1400, 0.9), 2.6));
  for (let i = 0; i < DL; i++) hum[i] *= 0.85 + 0.15 * Math.sin((2 * Math.PI * i) / S.SR * 0.23);
  const humPan = { A1: -0.6, A2: -0.6, D: -0.5, B1: -0.35, B2: -0.35, C1: -0.1, C2: -0.1, preto: -0.3 };
  const humG = { A1: -35, A2: -35, D: -36, B1: -34, B2: -34, C1: -38, C2: -38, preto: -37 };
  mesa.porLeito(hum, 0, (t) => dB(porPlano(t, humG)) * queda(t) * sobVoz(t), (t) => porPlano(t, humPan), 0.25,
    { nome: 'zumbido da geladeira', origem: 'geladeira, fundo à esquerda', dist: 0.6, pan: -0.5, funcao: 'leito; some na mordida e antes da queda' });
  mesa.porLeito(biquad(biquad(ruidoRosa(DL, 5), 'lp', 1200), 'hp', 120), 0, (t) => dB(-38) * queda(t) * sobVoz(t), () => 0, 0.4,
    { nome: 'ar da cozinha', origem: 'sala inteira', dist: 0.8, pan: 0, funcao: 'preenche as pausas' });
  m.tiques.forEach((k, i) => {
    if (k.mudo) return;
    const p = pl(k.t), longe = p === 'C1' || p === 'C2';
    const marca = Math.abs(k.t - (m.dec + DEC.piscaPensa)) < 0.05;
    mesa.por(tique(i % 2 === 0, 700 + i), k.t, { g: (longe ? -29 : -27) + (marca ? 3 : 0), pan: longe ? 0.05 : -0.35, dist: longe ? 0.75 : 0.55,
      nome: marca ? 'tique no meio da pausa em que ele procura a resposta' : '', origem: 'relógio', funcao: 'a pausa ganha duração' });
  });

  // A1: a cereja, o prato, o garfo (fora da voz para ser ouvido)
  mesa.por(pop(10), m.cereja.pega, { g: -31, pan: 0.25, dist: 0.3, nome: 'cabinho da cereja solta', origem: 'dedos da Bia no bolo', funcao: 'gesto pequeno que pede atenção' });
  mesa.por(peca(900, 11, 0.7, 0.012), m.cereja.poe, { g: -33, pan: 0.15, dist: 0.3, nome: 'cereja assenta na fatia', origem: 'fatia', funcao: 'cuidado' });
  mesa.por(desliza(0.32, 1700, 12), m.pb, { g: -30, pan: 0.15, dist: 0.35, nome: 'prato empurrado de leve', origem: 'dedos da Bia', funcao: 'oferta' });
  mesa.por(desliza(0.6, 1400, 13), m.pb + 0.35, { g: -33, pan: -0.05, dist: 0.4, nome: '', origem: 'prato deslizando', funcao: '' });
  mesa.por(peca(1500, 14, 1.6), m.pb + 0.98, { g: -29, pan: -0.15, dist: 0.4, nome: 'prato para diante do Nico', origem: 'prato', funcao: 'chegada' });
  mesa.por(tecido(0.35, 15), m.prometeu, { g: -36, pan: 0.35, dist: 0.3, nome: 'roupa: Bia junta as mãos', origem: 'Bia', funcao: 'expectativa' });
  mesa.por(metal(16), m.garfo.pega, { g: -31, pan: -0.15, dist: 0.35, nome: 'garfo sai do prato', origem: 'mão do Nico', funcao: 'começa a prova' });
  mesa.por(peca(1700, 17, 1.6, 0.015), m.garfo.aperta + 0.08, { g: -31, pan: -0.1, dist: 0.35, nome: 'garfo encosta no prato', origem: 'fatia e prato', funcao: 'contato' });

  // B1
  mesa.por(inspira(0.32, 18), m.mord + MORD.prepara, { g: -30, pan: 0, dist: 0.05, nome: 'Nico toma ar', origem: 'boca do Nico', funcao: 'preparação' });
  mesa.por(crocante(0.3, 1.1, 19), tc, { g: 0, pan: 0, dist: 0, nome: 'MORDIDA: pedra triturada + estalo de dente + baque', origem: 'boca do Nico, colada', funcao: 'o som conta antes do rosto' });
  mesa.por(crocante(0.42, 0.55, 20, 0.5), m.mord + MORD.segunda, { g: -9, pan: 0, dist: 0, nome: 'segunda mastigada', origem: 'boca do Nico', funcao: 'confirma' });
  // C1
  mesa.por(rangido(0.3, 21, 45), m.esp + 1.0, { g: -34, pan: 0.15, dist: 0.25, nome: 'cadeira: Bia se aproxima', origem: 'cadeira da Bia', funcao: 'reação pequena' });
  // B2
  mesa.por(inspira(0.3, 22), m.dec + DEC.ar, { g: -30, pan: 0, dist: 0.05, nome: 'Nico toma ar (decide)', origem: 'nariz do Nico', funcao: 'a decisão tem corpo' });
  mesa.por(engole(), m.dec + DEC.gole, { g: -28, pan: 0, dist: 0, nome: 'engolida', origem: 'garganta do Nico', funcao: 'antes do sorriso' });
  let k = 0;
  for (const ch of FRASE) {
    if (ch === ' ') continue;
    mesa.por(peca(1050 + k * 40, 30 + k), m.dec + DEC.letras + k * 0.08, { g: -31, pan: 0.05 + k * 0.05, dist: 0.1, nome: k === 0 ? 'letras aparecem (peças de madeira)' : '', origem: 'texto em cena', funcao: 'a fala tem peso de objeto' });
    k++;
  }
  mesa.por(chacoalha(DEC.cai - DEC.treme, 40), m.dec + DEC.treme, { g: -33, pan: 0.2, dist: 0.1, nome: 'letras tremem no ar', origem: 'texto em cena', funcao: 'esforço para sustentar o elogio' });
  // D: as letras batem na mesa; o "Ó" rola até a beira
  m.letras.forEach((l, i) => {
    mesa.por(quica(820 + ((i * 137) % 5) * 110, 50 + i, i < 3 ? 1 : 0.75), l.pousa, { g: -34, pan: -0.2 + i * 0.05, dist: 0.25, nome: i === 0 ? 'LETRAS BATEM NA MESA (madeira em madeira, quicando)' : '', origem: 'tampo da mesa, perto', funcao: 'a frase cai: o ouvido acompanha a queda' });
  });
  const o = m.letras[2];
  mesa.por(rola(o.beira - o.pousa, 60), o.pousa + 0.05, { g: -38, pan: -0.25, dist: 0.3, nome: 'o "Ó" rola até a beira', origem: 'mesa', funcao: 'uma letra continua depois das outras' });
  // C2: o "Ó" chega ao chão enquanto vemos a Bia
  mesa.por(quica(470, 61, 1), o.chao, { g: -29, pan: -0.15, dist: 0.6, nome: 'A LETRA TOCA O CHÃO (fora de quadro)', origem: 'chão sob a mesa, longe', funcao: 'ela ouve também: os olhos seguem' });
  mesa.por(tecido(0.4, 62), m.perc + 1.5, { g: -37, pan: 0.05, dist: 0.2, nome: 'roupa: mãos descem', origem: 'Bia', funcao: 'a postura muda com o que ela entendeu' });
  // A2
  mesa.por(tecido(0.3, 63), m.bate + 0.35, { g: -36, pan: 0.3, dist: 0.35, nome: 'Bia se debruça', origem: 'Bia', funcao: '' });
  mesa.por(toc(64), m.bate + 1.0, { g: -16, pan: -0.05, dist: 0.3, nome: 'TOC TOC: nó do dedo na fatia', origem: 'fatia diante do Nico', funcao: 'ela sabe; ele sabe que ela sabe' });
  mesa.por(toc(65), m.bate + 1.22, { g: -18, pan: -0.05, dist: 0.3, nome: '', origem: 'fatia', funcao: '' });
  mesa.por(env(tecido(0.8, 66), (t) => 0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 7)), m.bate + 1.7, { g: -35, pan: 0.3, dist: 0.35, nome: 'riso contido (só roupa e ombros)', origem: 'Bia', funcao: 'sem voz de personagem' });
  mesa.por(rangido(0.45, 67, 32), m.bate + 1.85, { g: -32, pan: -0.4, dist: 0.35, nome: 'cadeira: Nico relaxa', origem: 'cadeira do Nico', funcao: 'alívio' });
  mesa.por(desliza(0.6, 1500, 68), m.bate + 2.9, { g: -29, pan: 0.0, dist: 0.35, nome: 'Bia puxa o prato de volta', origem: 'prato', funcao: 'a primeira imagem volta ao contrário' });
  mesa.por(peca(1500, 69, 1.6), m.bate + 3.5, { g: -30, pan: 0.15, dist: 0.4, nome: '', origem: 'prato para', funcao: '' });
}

module.exports = { FPS, blocos, desenhar, som, MORD, DEC, ganhoVoz: -2, legendas: true };
