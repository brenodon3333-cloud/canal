// PROVA · "O bolo" (~24 s). Descartável: serve para testar o fluxo inteiro.
// Começo: Bia serve o primeiro bolo que fez. Expectativa: Nico prometeu ser sincero.
// Consequência: o som da mordida conta o que o rosto ainda não contou; ele mente; ganha o bolo inteiro.
const { createCanvas } = require('@napi-rs/canvas');
const D = require('../../motor/desenho');
const P = require('./personagens');
const { chave, fr, suave, saida, entrada, voltaAtras, mola, lerp, clamp, forma, traco, elipsePts, TINTA } = D;

const FPS = 24;

// ---------------------------------------------------------------- linha do tempo (ajustável)
// "dur" = segundos fixos. "fala" = o bloco mede a gravação; antes/depois são as pausas desenhadas.
const blocos = [
  { id: 'abre', dur: 1.2 },                         // escuro: geladeira e relógio antes da imagem
  { id: 'l1', fala: 'L1', antes: 0.5, depois: 0.6 },
  { id: 'l2', fala: 'L2', antes: 0.35, depois: 0.9 },
  { id: 'mordida', dur: 2.9 },                      // close do Nico: preparação, contato, reação
  { id: 'espera', dur: 2.4 },                       // close da Bia: ela não ouviu o que nós ouvimos
  { id: 'mentira', dur: 3.6 },                      // volta ao close do Nico: engole, sorri, "TÁ ÓTIMO."
  { id: 'empurra', dur: 2.6 },                      // plano geral: as letras caem na mesa, a Bia empurra o bolo
  { id: 'l3', fala: 'L3', antes: 0.25, depois: 1.0 },
  { id: 'preto', dur: 1.9 },                        // escuro: a segunda mordida só se ouve
];

// Ajustes finos da mordida (segundos dentro do bloco "mordida")
const MORD = { sobe: 0.55, olhaBia: 0.85, voltaGarfo: 1.05, prepara: 1.10, contato: 1.50, entende: 1.72, segunda: 2.30 };
const FRASE = 'TÁ ÓTIMO.';

let M = null; // marcas absolutas, calculadas uma vez
function marcas(T) {
  if (M) return M;
  const m = T.B('mordida').ini;
  M = {
    pratoIni: T.W('L1', 'bolo').ini - 0.25,
    nico: T.W('L2', 'Nico').ini,
    prometeu: T.W('L2', 'prometeu').ini,
    sincero: T.W('L2', 'sincero').ini,
    mord: m, tc: m + MORD.contato,
    esp: T.B('espera').ini, ment: T.B('mentira').ini, emp: T.B('empurra').ini,
    l3: T.B('l3').ini, outro: T.W('L3', 'outro').ini, dia: T.W('L3', 'dia').ini,
    preto: T.B('preto').ini, fim: T.total,
  };
  M.planos = [
    { de: 0, ate: M.mord, id: 'A1' },
    { de: M.mord, ate: M.esp, id: 'B1' },
    { de: M.esp, ate: M.ment, id: 'C' },
    { de: M.ment, ate: M.emp, id: 'B2' },
    { de: M.emp, ate: M.preto, id: 'A2' },
    { de: M.preto, ate: T.total + 1, id: 'preto' },
  ];
  // tique do relógio: um por segundo; o som some na mordida (o mundo some junto) e o ponteiro segue
  M.tiques = [];
  for (let t = 0.3; t < T.total; t += 1) M.tiques.push({ t, mudo: t > M.tc - 0.02 && t < M.tc + 1.25 });
  M.letras = simularLetras(M);
  return M;
}
const planoEm = (t) => M.planos.find((p) => t >= p.de && t < p.ate);

// ---------------------------------------------------------------- letras na mesa (plano geral)
// Cálculo determinístico: o bolo empurra a fila de letras; quem passa da borda do prato cai.
const medidor = createCanvas(10, 10).getContext('2d');
const MESA_Y = 690, PRATO_BORDA = 870, CHAO_Y = 1000;
function boloX(t, m) { return chave(t, [[m.emp + 1.15, 1150], [m.emp + 1.65, 960, saida]]); }
function simularLetras(m) {
  medidor.font = '30px Archivo';
  const L = [];
  let x = 888;
  for (const ch of FRASE) {
    const w = medidor.measureText(ch).width;
    if (ch !== ' ') L.push({ ch, w, rest: x + w / 2, cai: null, xCai: 0 });
    x += w + (ch === ' ' ? 4 : 2);
  }
  for (let t = m.emp; t < m.emp + 2.4; t += 0.002) {
    let lim = boloX(t, m) - 85;
    for (let i = L.length - 1; i >= 0; i--) {
      const l = L[i];
      if (l.cai !== null) continue;
      const xi = Math.min(l.rest, lim - l.w / 2 - 1);
      if (xi - l.w / 2 < PRATO_BORDA) { l.cai = t; l.xCai = xi; continue; }
      lim = xi - l.w / 2 - 1;
    }
  }
  L.forEach((l, i) => { l.pousa = m.emp + 0.05 + i * 0.03; l.chao = l.cai === null ? null : l.cai + Math.sqrt((2 * (CHAO_Y - MESA_Y)) / 3000); });
  return L;
}
function letrasEm(t, m) {
  let lim = boloX(t, m) - 85;
  const out = [];
  for (let i = m.letras.length - 1; i >= 0; i--) {
    const l = m.letras[i];
    if (t < l.pousa - 0.2) continue;
    if (l.cai !== null && t >= l.cai) {
      const dt = t - l.cai;
      if (t < l.chao) out.push({ ...l, x: l.xCai - 70 * dt, y: MESA_Y + 1500 * dt * dt, r: -7 * dt });
      else {
        const dl = t - l.chao, q = Math.abs(Math.sin(dl * 16)) * Math.exp(-dl * 9) * 18;
        out.push({ ...l, x: l.xCai - 70 * (l.chao - l.cai), y: CHAO_Y - q, r: -7 * (l.chao - l.cai) });
      }
      continue;
    }
    const xi = Math.min(l.rest, lim - l.w / 2 - 1);
    lim = xi - l.w / 2 - 1;
    const queda = fr(t, l.pousa - 0.2, l.pousa);
    const y = t < l.pousa ? lerp(MESA_Y - 260, MESA_Y, entrada(queda)) : MESA_Y - Math.abs(Math.sin((t - l.pousa) * 22)) * Math.exp(-(t - l.pousa) * 14) * 10;
    out.push({ ...l, x: xi, y, r: xi < l.rest - 1 ? -0.12 : 0 });
  }
  return out;
}

// ---------------------------------------------------------------- câmera em camadas
function camera(g, z, cx, cy, k, sx = 0, sy = 0) {
  const zk = 1 + (z - 1) * k;
  g.translate(960 + sx * k, 540 + sy * k);
  g.scale(zk, zk);
  g.translate(-cx, -cy);
}
function camada(g, cam, k, fn) { g.save(); camera(g, cam.z, cam.cx, cam.cy, k, cam.sx, cam.sy); fn(); g.restore(); }

function luz(g, cx, cy, r, centro, borda) { // multiplica: o centro fica, as bordas escurecem
  g.save();
  g.globalCompositeOperation = 'multiply';
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, centro); gr.addColorStop(0.55, '#c9b9d6'); gr.addColorStop(1, borda);
  g.fillStyle = gr; g.fillRect(-200, -200, 2320, 1480);
  g.restore();
}
function brilho(g, cx, cy, r, cor, a) {
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = a;
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-200, -200, 2320, 1480); g.restore();
}

// ---------------------------------------------------------------- objetos
function relogio(g, x, y, r, t) {
  forma(g, elipsePts(x, y, r, r, 14), '#efe9dc', { seed: 201, linha: 5 });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; traco(g, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.88, y + Math.sin(a) * r * 0.88]], 3, { seed: 210 + i, tremor: 0.3 }); }
  const s = M.tiques.filter((k) => k.t <= t).length; // o ponteiro anda até nos tiques mudos
  const as = (s / 60) * Math.PI * 2 - Math.PI / 2 + 0.6;
  traco(g, [[x, y], [x + Math.cos(-1.2) * r * 0.45, y + Math.sin(-1.2) * r * 0.45]], 6, { seed: 202, tremor: 0.3 });
  traco(g, [[x, y], [x + Math.cos(0.4) * r * 0.65, y + Math.sin(0.4) * r * 0.65]], 5, { seed: 203, tremor: 0.3 });
  traco(g, [[x, y], [x + Math.cos(as) * r * 0.8, y + Math.sin(as) * r * 0.8]], 2.5, { seed: 204, tinta: '#c0392b', tremor: 0.2 });
}
function geladeira(g, x0, y0, w, h, led = true) {
  forma(g, [[x0, y0], [x0 + w, y0 + 6], [x0 + w, y0 + h], [x0, y0 + h]], '#6f7a90', { seed: 220, linha: 5 });
  traco(g, [[x0, y0 + h * 0.34], [x0 + w, y0 + h * 0.34]], 5, { seed: 221 });
  traco(g, [[x0 + w - 28, y0 + h * 0.1], [x0 + w - 28, y0 + h * 0.26]], 9, { seed: 222 });
  traco(g, [[x0 + w - 28, y0 + h * 0.42], [x0 + w - 28, y0 + h * 0.62]], 9, { seed: 223 });
  if (led) { g.fillStyle = '#7dff9e'; g.beginPath(); g.arc(x0 + w - 60, y0 + h * 0.08, 5, 0, 7); g.fill(); }
}
function janela(g, x0, y0, w, h) {
  forma(g, [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], '#203a63', { seed: 230, linha: 6 });
  g.fillStyle = '#f5ecc8'; g.beginPath(); g.arc(x0 + w * 0.68, y0 + h * 0.3, h * 0.11, 0, 7); g.fill();
  g.fillStyle = '#203a63'; g.beginPath(); g.arc(x0 + w * 0.68 + h * 0.05, y0 + h * 0.27, h * 0.1, 0, 7); g.fill();
  traco(g, [[x0 + w / 2, y0], [x0 + w / 2, y0 + h]], 6, { seed: 231 });
  traco(g, [[x0, y0 + h / 2], [x0 + w, y0 + h / 2]], 6, { seed: 232 });
}
function fatia(g, x, y, s = 1) { // fatia vista de lado
  forma(g, [[x - 34 * s, y], [x + 34 * s, y], [x + 30 * s, y - 40 * s], [x - 30 * s, y - 40 * s]], '#e8b86a', { seed: 240, linha: 4 });
  traco(g, [[x - 32 * s, y - 20 * s], [x + 32 * s, y - 20 * s]], 6 * s, { seed: 241, tinta: '#c0566d', tremor: 0.4 });
  forma(g, [[x - 32 * s, y - 38 * s], [x + 32 * s, y - 38 * s], [x + 28 * s, y - 52 * s], [x - 28 * s, y - 52 * s]], '#f4a6b8', { seed: 242, linha: 4 });
}
function prato(g, x, y) { forma(g, elipsePts(x, y, 72, 11, 12), '#ece8e0', { seed: 250, linha: 4 }); }
function boloInteiro(g, x) {
  const y = MESA_Y;
  forma(g, elipsePts(x, y - 4, 52, 9, 10), '#d9d2c4', { seed: 260, linha: 4 });
  forma(g, [[x - 12, y - 6], [x + 12, y - 6], [x + 9, y - 30], [x - 9, y - 30]], '#d9d2c4', { seed: 261, linha: 4 });
  forma(g, elipsePts(x, y - 32, 100, 12, 12), '#ece8e0', { seed: 262, linha: 4 });
  forma(g, [[x - 85, y - 36], [x + 85, y - 36], [x + 82, y - 120], [x - 82, y - 120]], '#e8b86a', { seed: 263, linha: 5 });
  traco(g, [[x - 82, y - 78], [x + 82, y - 78]], 8, { seed: 264, tinta: '#c0566d', tremor: 0.4 });
  forma(g, [[x - 86, y - 116], [x + 86, y - 116], [x + 86, y - 100], [x + 60, y - 92], [x + 40, y - 102], [x + 10, y - 88], [x - 20, y - 100], [x - 50, y - 90], [x - 86, y - 102]], '#f4a6b8', { seed: 265, linha: 5 });
  forma(g, [[x - 84, y - 136], [x + 84, y - 136], [x + 86, y - 116], [x - 86, y - 116]], '#f4a6b8', { seed: 266, linha: 5 });
  forma(g, elipsePts(x + 4, y - 152, 15, 15, 8), '#c62a3a', { seed: 267, linha: 4 });
  traco(g, [[x + 6, y - 166], [x + 16, y - 186]], 4, { seed: 268 });
  // lado cortado (falta a fatia que foi para o Nico)
  forma(g, [[x - 85, y - 36], [x - 52, y - 36], [x - 52, y - 136], [x - 84, y - 136]], '#d9a659', { seed: 269, linha: 4 });
}
function garfo(g, x1, y1, x2, y2, comPedaco) { // do cabo (x1,y1) à ponta (x2,y2), em close
  traco(g, [[x1, y1], [x2, y2]], 26, { seed: 280 });
  traco(g, [[x1, y1], [x2, y2]], 15, { seed: 280, tinta: '#c9ced8' });
  const a = Math.atan2(y2 - y1, x2 - x1);
  g.save(); g.translate(x2, y2); g.rotate(a);
  forma(g, [[-10, -26], [40, -26], [40, 26], [-10, 26]], '#c9ced8', { seed: 281, linha: 6 });
  for (const yy of [-17, 0, 17]) traco(g, [[38, yy], [82, yy]], 12, { seed: 282 + yy });
  for (const yy of [-17, 0, 17]) traco(g, [[38, yy], [82, yy]], 5, { seed: 282 + yy, tinta: '#c9ced8' });
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

// ---------------------------------------------------------------- plano A: geral, de lado
function poseNicoA(t, m) {
  const p = { olhoX: 0.6, olhoY: 0, pupila: 0.5, mao: { x: 60, y: -8 }, cantoE: 2, cantoD: 4 };
  if (t < m.mord) {
    const v = fr(t, m.pratoIni + 0.1, m.pratoIni + 0.4) - fr(t, m.pratoIni + 1.3, m.pratoIni + 1.6);
    p.olhoY = 0.75 * v; p.olhoX = 0.6 - 0.1 * v; // acompanha o prato chegando
    p.dy = -6 * fr(t, m.nico, m.nico + 0.3);
    p.palpS = Math.max(0, 1 - Math.abs(t - 2.0) / 0.07) + Math.max(0, 1 - Math.abs(t - (m.nico + 0.5)) / 0.07);
    const pega = fr(t, m.sincero, m.sincero + 0.35);
    p.garfo = pega > 0.5;
    p.mao = { x: lerp(60, 85, pega), y: lerp(-8, -48, saida(pega)) };
    p.cabRot = 0.07 * Math.sin(Math.PI * fr(t, m.sincero + 0.35, m.sincero + 0.75)); // aceno curto
    p.olhoY = Math.max(p.olhoY, 0.6 * (fr(t, m.sincero - 0.1, m.sincero + 0.1) - fr(t, m.sincero + 0.5, m.sincero + 0.7)));
    return p;
  }
  // depois da mentira
  p.garfo = true; p.mao = { x: 85, y: -40 };
  p.pupila = 0.24; p.cantoE = 5; p.cantoD = 8; p.sobrInc = 0.5;
  p.olhoY = 0.6; p.olhoX = 0.65;
  const recua = fr(t, m.emp + 1.15, m.emp + 1.4);
  p.rot = -0.05 * recua * (1 - fr(t, m.emp + 1.8, m.emp + 2.3));
  const afunda = fr(t, m.emp + 1.8, m.emp + 2.3);
  p.dy = 16 * suave(afunda); p.cabRot = 0.08 * afunda;
  p.cantoE = lerp(5, -2, afunda); p.cantoD = lerp(8, 0, afunda);
  p.pupila = lerp(0.24, 0.32, afunda);
  // "...pra outro dia": levanta o garfo de novo em direção ao bolo
  const vai = fr(t, m.outro, m.dia + 0.4);
  p.mao = { x: lerp(85, 170, suave(vai)), y: lerp(-40, -70, suave(vai)) };
  p.rot = (p.rot || 0) + 0.05 * suave(vai);
  p.palpS = 0.35 * afunda + Math.max(0, 1 - Math.abs(t - (m.dia + 0.6)) / 0.07);
  return p;
}
function poseBiaA(t, m) {
  const p = { olhoX: 0.6, pupila: 0.6, cantoE: 6, cantoD: 9, maos: [{ x: 95, y: -8 }, { x: 78, y: -12 }] };
  const queixo = [{ x: 78, y: -176 }, { x: 64, y: -170 }];
  if (t < m.mord) {
    // empurra o prato até a metade da mesa e solta; o prato desliza sozinho
    const emp = fr(t, m.pratoIni, m.pratoIni + 0.35), volta = fr(t, m.pratoIni + 0.45, m.pratoIni + 0.9);
    p.maos[0] = { x: lerp(lerp(300, 360, saida(emp)), 95, suave(volta)), y: -14 };
    p.olhoY = 0.5 * (fr(t, m.pratoIni, m.pratoIni + 0.2) - fr(t, m.pratoIni + 0.9, m.pratoIni + 1.1));
    const inc = fr(t, m.prometeu, m.prometeu + 0.45);
    p.rot = 0.07 * suave(inc);
    p.maos = [{ x: lerp(p.maos[0].x, queixo[0].x, suave(inc)), y: lerp(p.maos[0].y, queixo[0].y, suave(inc)) },
      { x: lerp(78, queixo[1].x, suave(inc)), y: lerp(-12, queixo[1].y, suave(inc)) }];
    p.palpS = Math.max(0, 1 - Math.abs(t - 4.1) / 0.07);
    return p;
  }
  // depois da mentira: pulinho, recua (preparação), empurra o bolo
  const u = t - m.emp;
  p.maos = queixo.map((q) => ({ ...q }));
  p.dy = -22 * Math.sin(Math.PI * fr(u, 0.35, 0.68));
  p.feliz = u > 0.33 && u < 0.92 ? 1 : 0;
  p.cantoE = 10; p.cantoD = 14;
  const prep = fr(u, 0.92, 1.15), vai = fr(u, 1.15, 1.65), solta = fr(u, 2.0, 2.4);
  p.rot = -0.05 * suave(prep) + 0.15 * saida(vai) - 0.11 * suave(solta);
  const bx = 1300 - boloX(t, m) + 85; // lado de trás do bolo, em coordenadas da Bia
  const noBolo = [{ x: bx - 10, y: -70 }, { x: bx - 16, y: -46 }];
  const a = suave(prep) * (1 - suave(solta));
  p.maos = p.maos.map((q, i) => ({ x: lerp(q.x, noBolo[i].x, a), y: lerp(q.y, noBolo[i].y, a) }));
  p.olhoY = 0.3 * a;
  p.palpS = Math.max(0, 1 - Math.abs(t - (m.l3 + 0.9)) / 0.07);
  return p;
}
function cenaA(g, t, m) {
  const a2 = t >= m.emp;
  const cam = a2
    ? { z: chave(t, [[m.l3, 1.0], [m.preto, 1.1, (x) => x]]), cx: lerp(960, 760, fr(t, m.l3, m.preto)), cy: lerp(560, 520, fr(t, m.l3, m.preto)) }
    : { z: chave(t, [[0.8, 1.0], [m.mord, 1.035, (x) => x]]), cx: 960, cy: 560 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.6, () => {
    g.fillStyle = '#2b2642'; g.fillRect(-300, -300, 2520, 1160);
    g.fillStyle = '#1b1828'; g.fillRect(-300, 860, 2520, 600);
    traco(g, [[-300, 860], [2220, 860]], 5, { seed: 300 });
    janela(g, 1500, 150, 250, 270);
    relogio(g, 540, 170, 50, t);
    geladeira(g, -60, 250, 250, 610);
  });
  camada(g, cam, 1, () => {
    // luminária
    traco(g, [[960, -200], [960, 190]], 4, { seed: 310 });
    forma(g, [[905, 190], [1015, 190], [1085, 282], [835, 282]], '#c8892f', { seed: 311, linha: 5 });
    const pn = poseNicoA(t, m), pb = poseBiaA(t, m);
    P.cadeiraPerfil(g, 640, MESA_Y, 1);
    P.cadeiraPerfil(g, 1300, MESA_Y, -1);
    P.nicoPerfil(g, 640, MESA_Y, { ...pn, parte: 'corpo' });
    P.biaPerfil(g, 1300, MESA_Y, { ...pb, parte: 'corpo' });
    P.pernasPerfil(g, 640, MESA_Y, 1, P.COR.nicoCalca, pn.dy || 0);
    P.pernasPerfil(g, 1300, MESA_Y, -1, P.COR.biaCalca, pb.dy || 0, 10);
    // mesa
    forma(g, [[300, 682], [1620, 682], [1636, 716], [284, 716]], '#a45d36', { seed: 320, linha: 5 });
    forma(g, [[284, 716], [1636, 716], [1636, 752], [284, 752]], '#6e3622', { seed: 321, linha: 5 });
    forma(g, [[340, 752], [372, 752], [366, 1010], [346, 1010]], '#4d2618', { seed: 322, linha: 5 });
    forma(g, [[1548, 752], [1580, 752], [1574, 1010], [1554, 1010]], '#4d2618', { seed: 323, linha: 5 });
    // prato com a fatia
    const px = chave(t, [[m.pratoIni, 1000], [m.pratoIni + 0.35, 940, (x) => x], [m.pratoIni + 0.95, 800, saida]]);
    prato(g, px, MESA_Y - 2);
    if (t < m.mord) fatia(g, px, MESA_Y - 8);
    else forma(g, [[px - 30, MESA_Y - 8], [px + 26, MESA_Y - 8], [px + 22, MESA_Y - 30], [px - 6, MESA_Y - 30]], '#e8b86a', { seed: 243, linha: 4 }); // sobrou um toco
    if (t < m.sincero + 0.2) { traco(g, [[px - 30, MESA_Y - 12], [px + 26, MESA_Y - 16]], 8, { seed: 330 }); traco(g, [[px - 30, MESA_Y - 12], [px + 26, MESA_Y - 16]], 3, { seed: 330, tinta: '#c9ced8' }); }
    boloInteiro(g, boloX(t, m));
    // letras (só depois da mentira)
    if (a2) for (const l of letrasEm(t, m)) letra(g, l.ch, l.x, l.y, 30, l.r);
    P.nicoPerfil(g, 640, MESA_Y, { ...pn, parte: 'bracos' });
    P.biaPerfil(g, 1300, MESA_Y, { ...pb, parte: 'bracos' });
    luz(g, 960, 600, 1250, '#fff3d6', '#2a2448');
    brilho(g, 960, 300, 480, '#ffcf7a', 0.35);
    brilho(g, 960, 690, 520, '#ffcf7a', 0.18);
  });
}

// ---------------------------------------------------------------- plano B: close do Nico (da posição da Bia)
function poseNicoB(t, m) {
  const p = { olhoX: 0.55, pupila: 0.45, larg: 104, cantoE: 3, cantoD: 5 };
  if (t < m.esp) {
    const u = t - m.mord, c = MORD.contato;
    // olhar: desce para o garfo, sobe para a Bia, volta ao garfo
    const desce = fr(u, 0.15, 0.5), sobe = fr(u, MORD.olhaBia, MORD.olhaBia + 0.08), volta = fr(u, MORD.voltaGarfo, MORD.voltaGarfo + 0.08);
    const naBia = sobe * (1 - volta);
    p.olhoY = 0.7 * desce * (1 - naBia) * (1 - fr(u, c + 0.1, c + 0.3));
    p.olhoX = lerp(lerp(0.55, 0.15, desce), 0.85, naBia);
    p.vesgo = 0.28 * desce * (1 - naBia) * (1 - fr(u, c, c + 0.15));
    p.sobrInc = 0.4 * desce;
    // preparação: cabeça recua e a boca abre; estalo: avança e fecha
    const prep = fr(u, MORD.prepara, c - 0.1), bote = fr(u, c - 0.1, c);
    p.dy = -22 * suave(prep) * (1 - bote) + 16 * bote * (1 - fr(u, c + 0.05, c + 0.4));
    p.abre = suave(prep) * (1 - entrada(bote));
    p.cantoE = 3 - 4 * desce; p.cantoD = 5 - 4 * desce;
    if (u >= c) { p.abre = 0; p.bochechaCheia = true; p.cantoE = -4; p.cantoD = -2; p.larg = 70; }
    // entende: pupila encolhe, olho arregala, sobrancelha dispara (com atraso de propósito)
    const ent = fr(u, MORD.entende, MORD.entende + 0.08);
    p.pupila = lerp(0.45, 0.14, ent); p.arregala = ent; p.sobr = 0.9 * ent; p.sobrInc = lerp(p.sobrInc, 0.2, ent);
    if (u > c) p.olhoX = lerp(0.15, 0.3, ent);
    // segunda mastigada: queixo desce e volta, pálpebra de baixo treme
    const mast = Math.sin(Math.PI * fr(u, MORD.segunda, MORD.segunda + 0.35));
    p.bocaDy = 10 * mast;
    p.palpIE = 0.28 * (Math.max(0, 1 - Math.abs(u - (MORD.segunda + 0.05)) / 0.06) + Math.max(0, 1 - Math.abs(u - (MORD.segunda + 0.25)) / 0.06));
    p.topete = 0.38 * mola(u, c, 3.2, 3.2) - 0.05 * suave(prep) * (1 - bote); // o topete continua depois que a cabeça para
    return p;
  }
  // B2: engole, sorri à força, "TÁ ÓTIMO."
  const u = t - m.ment;
  p.pupila = 0.14; p.arregala = 1; p.sobr = 0.9; p.sobrInc = 0.2; p.olhoX = 0.3; p.bochechaCheia = u < 0.45; p.larg = 70; p.cantoE = -4; p.cantoD = -2;
  const gole = Math.sin(Math.PI * fr(u, 0.28, 0.6));
  p.dy = 12 * gole;
  p.topete = 0.18 * mola(u, 0.45, 3.2, 3.5);
  const volta = fr(u, 0.6, 1.0);
  p.pupila = lerp(0.14, 0.26, volta); p.olhoX = lerp(0.3, 0.85, volta); p.sobr = lerp(0.9, 0.55, volta); p.sobrInc = lerp(0.2, 0.75, volta); p.arregala = lerp(1, 0.6, volta);
  // sorriso forçado: canto direito sobe primeiro, o esquerdo atrasa; tremor de esforço
  const sd = saida(fr(u, 0.9, 1.25)), se = suave(fr(u, 1.1, 1.75));
  const tremor = u > 1.3 ? Math.sin(u * 2 * Math.PI * 9) * 1.6 : 0;
  p.cantoD = lerp(-2, 26, sd) + tremor; p.cantoE = lerp(-4, 16, se) - tremor;
  p.larg = lerp(70, 150, Math.max(sd, se) * 0.9);
  p.palpI = 0.22 * se; p.bochecha = se;
  p.palpS = Math.max(0, 1 - Math.abs(u - 2.75) / 0.06) * 0.0; // sem piscar: ele não pode piscar agora
  return p;
}
function letrasB(g, t, m) {
  const u = t - m.ment;
  g.font = '104px Archivo';
  let x = 990, k = 0;
  for (const ch of FRASE) {
    const w = g.measureText(ch).width;
    if (ch !== ' ') {
      const ap = m.ment + 1.5 + k * 0.09;
      if (t >= ap) {
        const esc = voltaAtras(fr(t, ap, ap + 0.14));
        const dq = t - (m.ment + 3.1 + k * 0.035);
        const y = 715 + (dq > 0 ? 3000 * dq * dq : 0) + Math.sin(u * 3 + k) * 2;
        const r = (dq > 0 ? dq * 1.6 * (k % 2 ? 1 : -1) : 0) + (D.hash(k + 3) - 0.5) * 0.08;
        letra(g, ch, x + w / 2, y, 104, r, esc);
      }
      k++;
    }
    x += w + (ch === ' ' ? 18 : 6);
  }
}
function cenaB(g, t, m) {
  const u = t - m.mord, c = MORD.contato;
  const tremeu = t < m.esp ? Math.exp(-Math.max(0, u - c) * 14) * (u >= c ? 1 : 0) : 0;
  const cam = {
    z: t < m.esp ? lerp(1.0, 1.03, fr(t, m.mord, m.esp)) : lerp(1.045, 1.07, fr(t, m.ment, m.emp)),
    cx: 960, cy: 540,
    sx: Math.sin(u * 91) * 9 * tremeu, sy: Math.cos(u * 77) * 7 * tremeu,
  };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.5, () => {
    g.fillStyle = '#2b2642'; g.fillRect(-300, -300, 2520, 1700);
    g.save(); g.filter = 'blur(5px)';
    geladeira(g, -40, 60, 330, 1000);
    relogio(g, 560, 150, 64, t);
    g.restore();
  });
  camada(g, cam, 1, () => {
    const p = poseNicoB(t, m);
    P.nicoFrente(g, 760, 500, p);
    if (t < m.esp) { // garfo
      const sobe = saida(fr(u, 0, MORD.sobe)), prep = suave(fr(u, MORD.prepara, c - 0.1)), bote = fr(u, c - 0.1, c), sai = entrada(fr(u, c + 0.1, c + 0.5));
      const tipX = 850 + 10 * prep, tipY = lerp(1300, 770, sobe) + 22 * prep - 70 * bote + 650 * sai;
      garfo(g, tipX - 360, tipY + 520, tipX - 40, tipY + 30, u < c);
    }
    if (t >= m.ment) letrasB(g, t, m);
    luz(g, 1150, 380, 1300, '#fff1d2', '#2a2448');
    brilho(g, 1250, -60, 700, '#ffcf7a', 0.4);
  });
  camada(g, cam, 1.4, () => { // primeiro plano: ombro e coque da Bia, fora de foco
    g.save(); g.filter = 'blur(14px)';
    forma(g, elipsePts(1900, 1060, 380, 300, 12), '#7a3328', { seed: 400, linha: 0 });
    forma(g, elipsePts(1960, 560, 250, 280, 12), '#2a1830', { seed: 401, linha: 0 });
    forma(g, elipsePts(1880, 300, 110, 100, 10), '#2a1830', { seed: 402, linha: 0 });
    g.restore();
  });
}

// ---------------------------------------------------------------- plano C: close da Bia (da posição do Nico)
function cenaC(g, t, m) {
  const u = t - m.esp;
  const cam = { z: lerp(1.0, 1.025, fr(u, 0, 2.4)), cx: 960, cy: 540 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 0.5, () => {
    g.fillStyle = '#2b2642'; g.fillRect(-300, -300, 2520, 1700);
    g.save(); g.filter = 'blur(5px)'; janela(g, 1440, 90, 380, 420); g.restore();
  });
  camada(g, cam, 1, () => {
    const pisca = Math.max(0, 1 - Math.abs(u - 0.55) / 0.09);
    const anima = suave(fr(u, 1.0, 1.4));
    P.biaFrente(g, 1110, 520 - 6 * anima, {
      olhoX: -0.7, pupila: 0.6 + 0.04 * anima, palpS: pisca, sobr: 0.5 * anima,
      cantoE: lerp(8, 18, anima), cantoD: lerp(8, 20, anima), larg: lerp(90, 110, anima), bochecha: anima,
      cabRot: -0.05 * anima, esc: 1 + 0.02 * anima, maosY: 330 - 10 * anima,
    });
    luz(g, 900, 380, 1300, '#fff1d2', '#2a2448');
    brilho(g, 700, -60, 700, '#ffcf7a', 0.4);
  });
  camada(g, cam, 1.4, () => { // primeiro plano: nuca e topete do Nico
    g.save(); g.filter = 'blur(14px)';
    forma(g, elipsePts(60, 1080, 380, 300, 12), '#1f4a47', { seed: 410, linha: 0 });
    forma(g, elipsePts(40, 560, 250, 300, 12), '#6e6455', { seed: 411, linha: 0 });
    forma(g, elipsePts(40, 380, 250, 150, 12), '#1a1520', { seed: 412, linha: 0 });
    forma(g, [[10, 260], [30, 150], [110, 110], [170, 150], [90, 170], [60, 260]], '#1a1520', { seed: 413, linha: 0 });
    g.restore();
  });
}

// ---------------------------------------------------------------- composição final
let grao = null;
function desenhar(g, t, T) {
  marcas(T);
  const p = planoEm(t);
  if (p.id === 'A1' || p.id === 'A2') cenaA(g, t, M);
  else if (p.id === 'B1' || p.id === 'B2') cenaB(g, t, M);
  else if (p.id === 'C') cenaC(g, t, M);
  else { g.fillStyle = '#000'; g.fillRect(0, 0, 1920, 1080); return; }
  // grão
  if (!grao) grao = D.criarGrao(2048, 1200);
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = 0.07;
  g.drawImage(grao, -(D.hash(D.ferv.passo) * 120) | 0, -(D.hash(D.ferv.passo + 9) * 110) | 0);
  g.restore();
  // abertura: escuro, depois a imagem sobe
  const esc = 1 - fr(t, 0.85, 1.45);
  if (esc > 0) { g.fillStyle = `rgba(0,0,0,${esc})`; g.fillRect(0, 0, 1920, 1080); }
}

// ---------------------------------------------------------------- som
function som(mesa, T, S) {
  marcas(T);
  const m = M, DUR = T.total + 0.3;
  const { n, ruido, ruidoRosa, biquad, env, seno, soma, escala, dB } = S;
  const pl = (t) => planoEm(Math.min(t, T.total - 0.001)).id;
  const porPlano = (t, tab) => tab[pl(t)] ?? tab.A1;

  // geradores --------------------------------------------------------------
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
      const e = Math.exp(-t / (dur * 0.45));
      const gl = n(0.0015 + r() * 0.005);
      const gr = biquad(ruido(gl * 3, seed + ++k), 'bp', 900 + r() * 4600, 2 + r() * 4);
      const g0 = (0.35 + 0.65 * r()) * e * 4;
      const i0 = n(t);
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
  const peca = (f, seed, madeira = 1) => { // letra: peça pequena de madeira
    const len = n(0.09);
    const a = env(seno(len, f), (t) => Math.exp(-t / 0.022));
    const b = env(seno(len, f * 2.3), (t) => Math.exp(-t / 0.012));
    const c = env(biquad(ruido(len, seed), 'bp', 2200 * madeira, 1.6), (t) => Math.exp(-t / 0.004));
    return soma(a, escala(b, 0.4), escala(c, 1.4));
  };
  const desliza = (dur, f, seed, q = 1.3) => {
    const len = n(dur), fric = biquad(ruido(len, seed + 1), 'lp', 25);
    let pk = 0; for (const v of fric) pk = Math.max(pk, Math.abs(v));
    const x = biquad(ruido(len, seed), 'bp', f, q);
    return env(x, (t) => Math.min(1, t / 0.04) * Math.min(1, (dur - t) / 0.08) * (0.55 + 0.45 * fric[Math.min(len - 1, n(t))] / pk));
  };
  const metal = (seed) => {
    const len = n(0.35), parc = [[2950, 0.25, 1], [4620, 0.17, 0.6], [6930, 0.11, 0.35], [8400, 0.07, 0.2]];
    const z = soma(...parc.map(([f, d, a]) => escala(env(seno(len, f), (t) => Math.exp(-t / d)), a)),
      escala(env(biquad(ruido(len, seed), 'hp', 3000), (t) => Math.exp(-t / 0.002)), 0.8));
    return escala(z, 0.4);
  };
  const tecido = (dur, seed) => env(biquad(ruido(n(dur), seed), 'bp', 2600, 0.6), (t) => Math.sin(Math.PI * t / dur) * (0.6 + 0.4 * Math.sin(t * 60)));
  const rangido = (dur, seed, f0 = 40) => {
    const len = n(dur), x = new Float32Array(len), r = S.rng(seed);
    let t = 0;
    while (t < dur) { x[n(t)] = 1; t += 1 / (f0 * (0.7 + 0.6 * Math.sin((Math.PI * t) / dur)) * (0.9 + 0.2 * r())); }
    const y = soma(biquad(x, 'bp', 820, 7), escala(biquad(x, 'bp', 1650, 7), 0.6));
    return env(y, (tt) => Math.sin(Math.PI * tt / dur));
  };
  const inspira = (dur, seed) => env(biquad(ruido(n(dur), seed), 'bp', (t) => 1100 + 1400 * t / dur, 1.1), (t) => Math.sin(Math.PI * Math.min(1, t / dur)) ** 1.5);
  const sopro = (dur, seed) => env(biquad(ruido(n(dur), seed), 'bp', (t) => 3200 * Math.pow(0.2, t / dur), 1.6), (t) => Math.sin(Math.PI * t / dur));

  // ambiente contínuo -------------------------------------------------------
  // a mordida apaga geladeira, sala e relógio por um instante (troca de textura); depois voltam devagar
  const tc = m.tc;
  const queda = S.curva([[0, 0], [tc - 0.01, 0], [tc + 0.03, -40], [tc + 0.9, -40], [tc + 2.6, 0], [m.preto + 0.8, 0], [T.total, -40]]);
  const sobVoz = (t) => { // abaixa o ambiente 5 dB enquanto o narrador fala
    let d = 0;
    for (const f of Object.values(T.falas)) d = Math.min(d, t > f.ini - 0.15 && t < f.fim + 0.4 ? -5 : 0);
    return dB(d);
  };
  const DL = n(DUR);
  // v2: harmônicos médios e um assobio fraco de compressor para o zumbido existir no celular
  const hum = soma(seno(DL, 100), escala(seno(DL, 200), 0.6), escala(seno(DL, 300), 0.55), escala(seno(DL, 400), 0.4),
    escala(seno(DL, 600), 0.22), escala(seno(DL, (t) => 1180 + 6 * Math.sin(t * 0.7)), 0.05),
    escala(biquad(ruidoRosa(DL, 3), 'bp', 1400, 0.9), 2.6));
  for (let i = 0; i < DL; i++) hum[i] *= 0.85 + 0.15 * Math.sin((2 * Math.PI * i) / S.SR * 0.23);
  const humPan = { A1: -0.6, A2: -0.6, B1: -0.35, B2: -0.35, C: -0.1, preto: -0.3 };
  const humG = { A1: -35, A2: -35, B1: -34, B2: -34, C: -38, preto: -37 };
  mesa.porLeito(hum, 0, (t) => dB(porPlano(t, humG)) * queda(t) * sobVoz(t), (t) => porPlano(t, humPan), 0.25,
    { nome: 'zumbido da geladeira (100 Hz + harmônicos até 400 Hz + chiado)', origem: 'geladeira, fundo à esquerda', dist: 0.6, pan: -0.5, funcao: 'leito contínuo; some na mordida' });
  const sala = biquad(biquad(ruidoRosa(DL, 5), 'lp', 1200), 'hp', 120);
  mesa.porLeito(sala, 0, (t) => dB(-38) * queda(t) * sobVoz(t), () => 0, 0.4,
    { nome: 'ar da cozinha', origem: 'sala inteira', dist: 0.8, pan: 0, funcao: 'preenche as pausas da narração' });

  for (const [i, k] of m.tiques.entries()) {
    if (k.mudo) continue;
    const p = pl(k.t);
    const voltou = k.t > tc && k.t < tc + 3;
    mesa.por(tique(i % 2 === 0, 700 + i), k.t, {
      g: (p === 'C' ? -29 : -27) + (voltou ? 3 : 0), pan: { A1: -0.4, A2: -0.4, B1: -0.3, B2: -0.3, C: 0.05 }[p] ?? 0, dist: p === 'C' ? 0.75 : 0.55,
      nome: voltou ? 'tique do relógio (o primeiro depois do silêncio)' : '', origem: p === 'C' ? 'relógio, fora de quadro' : 'relógio na parede', funcao: 'a espera ganha duração',
    });
  }

  // ações -------------------------------------------------------------------
  mesa.por(desliza(0.32, 1700, 11), m.pratoIni, { g: -28, pan: 0.15, dist: 0.35, nome: 'prato empurrado na madeira', origem: 'mão da Bia', funcao: 'apresenta a fatia' });
  mesa.por(desliza(0.55, 1400, 12), m.pratoIni + 0.35, { g: -31, pan: -0.1, dist: 0.4, nome: 'prato deslizando sozinho', origem: 'prato', funcao: 'continua depois da mão' });
  mesa.por(peca(1500, 13, 1.6), m.pratoIni + 0.93, { g: -27, pan: -0.2, dist: 0.4, nome: 'prato para', origem: 'prato diante do Nico', funcao: 'pontua a chegada' });
  mesa.por(tecido(0.35, 14), m.prometeu, { g: -35, pan: 0.35, dist: 0.3, nome: 'roupa: Bia se inclina', origem: 'Bia', funcao: 'expectativa' });
  mesa.por(metal(15), m.sincero + 0.18, { g: -33, pan: -0.25, dist: 0.35, nome: 'garfo levantado do prato', origem: 'mão do Nico', funcao: 'o compromisso vira gesto' });

  mesa.por(inspira(0.32, 16), m.mord + MORD.prepara, { g: -30, pan: 0, dist: 0.05, nome: 'Nico toma ar', origem: 'boca do Nico', funcao: 'preparação' });
  mesa.por(crocante(0.3, 1.1, 17), tc, { g: 0, pan: 0, dist: 0, nome: 'MORDIDA: pedra triturada + estalo agudo de dente + baque grave', origem: 'boca do Nico, colada', funcao: 'o som conta que o bolo está duro antes do rosto' });
  mesa.por(crocante(0.42, 0.55, 18, 0.5), m.mord + MORD.segunda, { g: -9, pan: 0, dist: 0, nome: 'segunda mastigada, mais lenta', origem: 'boca do Nico', funcao: 'confirma' });
  mesa.por(rangido(0.3, 19, 45), m.esp + 1.0, { g: -33, pan: 0.15, dist: 0.25, nome: 'cadeira: Bia se aproxima', origem: 'cadeira da Bia', funcao: 'reação pequena' });

  mesa.por(engole(), m.ment + 0.3, { g: -25, pan: 0, dist: 0, nome: 'engolida', origem: 'garganta do Nico', funcao: 'decisão física antes da mentira' });
  let k = 0;
  for (const ch of FRASE) {
    if (ch === ' ') continue;
    mesa.por(peca(1050 + k * 40, 30 + k), m.ment + 1.5 + k * 0.09, { g: -30, pan: 0.05 + k * 0.05, dist: 0.1, nome: k === 0 ? 'letras aparecem (peças de madeira)' : '', origem: 'texto em cena', funcao: 'a fala ganha peso de objeto' });
    k++;
  }
  mesa.por(sopro(0.32, 40), m.ment + 3.12, { g: -30, pan: 0.2, dist: 0.2, nome: 'letras caem', origem: 'texto em cena', funcao: 'liga o close ao plano geral' });

  m.letras.forEach((l, i) => {
    mesa.por(peca(780 + i * 25, 50 + i, 0.8), l.pousa, { g: -30, pan: -0.05 + i * 0.03, dist: 0.4, nome: i === 0 ? 'letras batem na mesa' : '', origem: 'mesa', funcao: 'continuidade entre ângulos' });
    if (l.cai !== null) {
      mesa.por(peca(900 + i * 30, 60 + i, 1.2), l.cai, { g: -31, pan: -0.1, dist: 0.4, nome: i === 0 ? 'letra empurrada para fora' : '', origem: 'borda do prato', funcao: 'consequência' });
      mesa.por(peca(520 + i * 20, 70 + i, 0.6), l.chao, { g: -32, pan: -0.15, dist: 0.65, nome: i === 0 ? 'letras no chão' : '', origem: 'chão sob a mesa', funcao: 'continua depois do gesto' });
    }
  });
  mesa.por(rangido(0.25, 80, 55), m.emp + 0.35, { g: -30, pan: 0.4, dist: 0.35, nome: 'cadeira: pulinho da Bia', origem: 'cadeira da Bia', funcao: 'alegria' });
  mesa.por(desliza(0.55, 650, 81, 1), m.emp + 1.15, { g: -21, pan: 0.25, dist: 0.3, nome: 'bolo inteiro arrastado', origem: 'boleira empurrada pela Bia', funcao: 'a imagem do prato volta, maior' });
  mesa.por(desliza(0.5, 2400, 82, 2), m.emp + 1.15, { g: -30, pan: 0.25, dist: 0.3, nome: '', origem: 'louça', funcao: '' });
  mesa.por(rangido(0.5, 83, 30), m.emp + 1.8, { g: -31, pan: -0.4, dist: 0.35, nome: 'cadeira: Nico afunda', origem: 'cadeira do Nico', funcao: 'reação' });
  mesa.por(metal(84), m.dia + 0.15, { g: -38, pan: -0.3, dist: 0.4, nome: 'garfo encosta na boleira', origem: 'mão do Nico', funcao: 'aceita a segunda fatia' });

  mesa.por(crocante(0.34, 1, 90), m.preto + 0.38, { g: -3, pan: 0, dist: 0.15, nome: 'MORDIDA no escuro', origem: 'Nico, fora de quadro', funcao: 'a consequência continua depois do corte' });
}

module.exports = { FPS, blocos, desenhar, som, MORD, ganhoVoz: -2 };
