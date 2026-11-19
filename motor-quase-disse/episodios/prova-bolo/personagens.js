// Nico e Bia em dois ângulos. Regras de continuidade entre ângulos:
//  Nico: cabeça em ovo alto, topete curvado para a frente, suéter verde-água, cabelo escuro só no topo.
//  Bia:  cabeça redonda, coque atrás e em cima, suéter coral, cabelo cobrindo a nuca.
const D = require('../../motor/desenho');
const { TINTA, forma, traco, olho, boca, elipsePts } = D;

const COR = {
  nicoPele: '#f3e2c7', nicoSueter: '#3e8c86', nicoGola: '#5fb0a6', nicoCabelo: '#2a2233',
  biaPele: '#f0cfa8', biaSueter: '#e2654c', biaGola: '#f08d72', biaCabelo: '#3b2340',
  bochecha: 'rgba(230,110,110,0.28)',
  nicoCalca: '#2c3550', biaCalca: '#4a2f3a', cadeira: '#3a2420', sapato: '#17141f',
};

// Topete: desenhado a partir da base, girado por "ang" (a mola do pós-movimento)
function topete(g, bx, by, s, ang, cor, linha) {
  g.save();
  g.translate(bx, by); g.rotate(ang);
  const pts = [[-10 * s, 4 * s], [-14 * s, -40 * s], [8 * s, -66 * s], [40 * s, -62 * s], [30 * s, -48 * s], [12 * s, -40 * s], [10 * s, 4 * s]];
  forma(g, pts, cor, { seed: 41, linha });
  g.restore();
}

function cabeloNico(g, cx, cy, rx, ry, seedCab) {
  g.save();
  D.caminho(g, elipsePts(cx, cy, rx, ry, 16), true, 11, 0.8);
  g.clip();
  g.fillStyle = COR.nicoCabelo;
  D.caminho(g, [[cx - rx * 1.2, cy - ry * 1.3], [cx + rx * 1.2, cy - ry * 1.3], [cx + rx * 1.1, cy - ry * 0.62], [cx + rx * 0.3, cy - ry * 0.5], [cx - rx * 0.4, cy - ry * 0.56], [cx - rx * 1.1, cy - ry * 0.2]], true, seedCab, 0.8);
  g.fill();
  g.restore();
}

// ---------------------------------------------------------------- Nico de perfil (olha para +x)
// p: { dy, rot, olhoX, olhoY, pupila, palpS, palpI, sobr, abre, cantoE, cantoD, topete, mao:{x,y}, garfo:bool }
function nicoPerfil(g, x, y, p = {}) {
  const L = 5;
  g.save();
  g.translate(x, y + (p.dy || 0));
  g.rotate(p.rot || 0);
  const corpo = p.parte !== 'bracos', bracos = p.parte !== 'corpo';
  if (corpo) {
  // tronco
  forma(g, [[-88, 128], [-92, -90], [-70, -160], [-25, -185], [35, -182], [75, -150], [92, -85], [94, 128]], COR.nicoSueter, { seed: 21, linha: L });
  forma(g, [[-30, -182], [0, -170], [38, -180], [28, -196], [0, -188], [-26, -196]], COR.nicoGola, { seed: 22, linha: L * 0.8 });
  // cabeça
  g.save();
  g.translate(15, -290); g.rotate(p.cabRot || 0); g.translate(-15, 290);
  topete(g, 2, -383, 1, (p.topete || 0) + 0.05, COR.nicoCabelo, L);
  forma(g, elipsePts(15, -290, 78, 98, 16, 0.08), COR.nicoPele, { seed: 11, linha: L });
  cabeloNico(g, 15, -290, 78, 98, 12);
  forma(g, elipsePts(15, -290, 78, 98, 16, 0.08), null, { seed: 11, linha: L });
  // orelha
  forma(g, elipsePts(-18, -282, 13, 19, 8), COR.nicoPele, { seed: 13, linha: L * 0.8 });
  // nariz
  forma(g, [[84, -300], [101, -290], [99, -274], [84, -270]], COR.nicoPele, { seed: 14, linha: L * 0.8 });
  // bochecha
  g.fillStyle = COR.bochecha; g.beginPath(); g.ellipse(48, -262, 16, 10, 0, 0, Math.PI * 2); g.fill();
  olho(g, 54, -310, 14, 19, { lx: p.olhoX ?? 0.6, ly: p.olhoY ?? 0, pupila: p.pupila ?? 0.5, palpS: p.palpS || 0, palpI: p.palpI || 0, pele: COR.nicoPele, linha: L * 0.8, seed: 15 });
  const sb = p.sobr || 0; // + sobe, - desce/franze
  traco(g, [[38, -342 - sb * 10], [70, -340 - sb * 6 + (p.sobrInc || 0) * 6]], 7, { seed: 16 });
  boca(g, 70, -246, 24, { abre: p.abre || 0, cantoE: p.cantoE || 0, cantoD: p.cantoD || 0, linha: L * 0.9, seed: 17 });
  g.restore();
  }
  // braço próximo e mão
  const m = p.mao || { x: 70, y: -8 };
  if (bracos) {
  traco(g, [[30, -148], [60, -75], [m.x - 10, m.y - 6]], 50, { seed: 18 });
  traco(g, [[30, -148], [60, -75], [m.x - 10, m.y - 6]], 40, { seed: 18, tinta: COR.nicoSueter });
  if (p.garfo) {
    traco(g, [[m.x - 4, m.y + 6], [m.x + 26, m.y - 52]], 9, { seed: 19 });
    traco(g, [[m.x - 4, m.y + 6], [m.x + 26, m.y - 52]], 4, { seed: 19, tinta: '#c9ced8' });
  }
  forma(g, elipsePts(m.x, m.y, 21, 17, 10), COR.nicoPele, { seed: 20, linha: L * 0.8 });
  }
  g.restore();
}

// ---------------------------------------------------------------- Bia de perfil (olha para -x)
// p: { dy, rot, olhoX, pupila, palpS, feliz, abre, cantoE, cantoD, maos:[{x,y},{x,y}] }
function biaPerfil(g, x, y, p = {}) {
  const L = 5;
  g.save();
  g.translate(x, y + (p.dy || 0));
  g.scale(-1, 1); // desenhada olhando para +x e espelhada
  g.rotate(p.rot || 0);
  const corpo = p.parte !== 'bracos', bracos = p.parte !== 'corpo';
  // braço de trás (atrás do tronco)
  const m = p.maos || [{ x: 80, y: -10 }, { x: 60, y: -14 }];
  if (corpo) {
  traco(g, [[-10, -125], [40, -70], [m[1].x - 8, m[1].y]], 46, { seed: 51 });
  traco(g, [[-10, -125], [40, -70], [m[1].x - 8, m[1].y]], 36, { seed: 51, tinta: '#b84e3a' });
  forma(g, [[-94, 128], [-100, -70], [-80, -135], [-30, -158], [30, -156], [78, -130], [98, -70], [98, 128]], COR.biaSueter, { seed: 52, linha: L });
  forma(g, [[-28, -156], [5, -146], [36, -154], [28, -170], [0, -164], [-24, -170]], COR.biaGola, { seed: 53, linha: L * 0.8 });
  // cabeça
  g.save();
  g.translate(10, -255); g.rotate(p.cabRot || 0); g.translate(-10, 255);
  forma(g, elipsePts(-62, -322, 40, 38, 10), COR.biaCabelo, { seed: 54, linha: L }); // coque
  forma(g, elipsePts(10, -255, 84, 84, 16), COR.biaPele, { seed: 55, linha: L });
  g.save();
  D.caminho(g, elipsePts(10, -255, 84, 84, 16), true, 55, 0.8); g.clip();
  g.fillStyle = COR.biaCabelo;
  D.caminho(g, [[-90, -360], [120, -360], [100, -300], [60, -312], [20, -296], [-10, -250], [-20, -190], [-100, -170]], true, 56, 0.8);
  g.fill();
  g.restore();
  forma(g, elipsePts(10, -255, 84, 84, 16), null, { seed: 55, linha: L });
  forma(g, [[88, -258], [100, -246], [88, -236]], COR.biaPele, { seed: 57, linha: L * 0.8, fechado: true });
  g.fillStyle = COR.bochecha; g.beginPath(); g.ellipse(52, -222, 15, 10, 0, 0, Math.PI * 2); g.fill();
  if (p.feliz > 0.5) { // olhos fechados de alegria
    traco(g, [[38, -262], [52, -276], [66, -262]], 6, { seed: 58 });
  } else {
    olho(g, 52, -266, 15, 20, { lx: p.olhoX ?? 0.6, ly: p.olhoY ?? 0, pupila: p.pupila ?? 0.55, palpS: p.palpS || 0, pele: COR.biaPele, linha: L * 0.8, seed: 59 });
  }
  traco(g, [[36, -300 - (p.sobr || 0) * 9], [68, -297 - (p.sobr || 0) * 5]], 7, { seed: 60 });
  boca(g, 68, -210, 24, { abre: p.abre || 0, cantoE: p.cantoE ?? 3, cantoD: p.cantoD ?? 6, linha: L * 0.9, seed: 61 });
  g.restore();
  }
  // braço da frente e mãos
  if (bracos) {
  traco(g, [[30, -125], [70, -60], [m[0].x - 8, m[0].y]], 50, { seed: 62 });
  traco(g, [[30, -125], [70, -60], [m[0].x - 8, m[0].y]], 40, { seed: 62, tinta: COR.biaSueter });
  forma(g, elipsePts(m[1].x, m[1].y, 19, 16, 10), COR.biaPele, { seed: 63, linha: L * 0.8 });
  forma(g, elipsePts(m[0].x, m[0].y, 20, 17, 10), COR.biaPele, { seed: 64, linha: L * 0.8 });
  }
  g.restore();
}

// ---------------------------------------------------------------- Nico de frente (3/4, olha para +x)
// p: { dy, esc, olhoX, olhoY, vesgo, pupila, palpS, palpI, palpIE, sobr, sobrInc, abre, cantoE, cantoD, larg, bocaDy, topete }
function nicoFrente(g, x, y, p = {}) {
  const L = 7;
  g.save();
  g.translate(x, y + (p.dy || 0));
  const e = p.esc || 1; g.scale(e, e);
  // tronco
  forma(g, [[-460, 700], [-430, 420], [-300, 330], [-80, 290], [120, 292], [330, 335], [450, 430], [480, 700]], COR.nicoSueter, { seed: 71, linha: L });
  forma(g, [[-110, 300], [0, 360], [130, 300], [100, 262], [0, 318], [-90, 262]], COR.nicoGola, { seed: 72, linha: L });
  // pescoço
  forma(g, [[-62, 200], [-60, 310], [70, 312], [74, 200]], '#dcc5a3', { seed: 73, linha: L });
  // cabeça
  g.save();
  g.rotate(p.cabRot || 0);
  topete(g, -10, -292, 2.6, (p.topete || 0) + 0.12, COR.nicoCabelo, L);
  forma(g, elipsePts(-250, 30, 40, 62, 10), COR.nicoPele, { seed: 74, linha: L }); // orelha
  traco(g, [[-258, 8], [-240, 30], [-256, 54]], 5, { seed: 75 });
  forma(g, elipsePts(0, 0, 250, 300, 18), COR.nicoPele, { seed: 76, linha: L });
  g.save();
  D.caminho(g, elipsePts(0, 0, 250, 300, 18), true, 76, 0.8); g.clip();
  g.fillStyle = COR.nicoCabelo;
  D.caminho(g, [[-300, -380], [300, -380], [270, -170], [120, -150], [-20, -170], [-160, -140], [-250, -40], [-320, -60]], true, 77, 0.8);
  g.fill();
  g.restore();
  forma(g, elipsePts(0, 0, 250, 300, 18), null, { seed: 76, linha: L });
  // bochechas (sobem com o sorriso)
  const cb = (p.bochecha || 0) * 12;
  g.fillStyle = COR.bochecha;
  g.beginPath(); g.ellipse(-120, 110 - cb, 46, 26, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(215, 110 - cb, 30, 24, 0, 0, Math.PI * 2); g.fill();
  const lx = p.olhoX ?? 0.5, ly = p.olhoY ?? 0, v = p.vesgo || 0, pu = p.pupila ?? 0.45, arreg = 1 + (p.arregala || 0) * 0.12;
  olho(g, -60, -20, 50, 64 * arreg, { lx: lx + v, ly, pupila: pu, palpS: p.palpS || 0, palpI: (p.palpI || 0) + (p.palpIE || 0), pele: COR.nicoPele, linha: L * 0.85, seed: 78 });
  olho(g, 122, -20, 42, 60 * arreg, { lx: lx - v, ly, pupila: pu, palpS: p.palpS || 0, palpI: p.palpI || 0, pele: COR.nicoPele, linha: L * 0.85, seed: 79 });
  const sb = p.sobr || 0, si = p.sobrInc || 0; // sobrInc: + preocupado (ponta interna sobe)
  traco(g, [[-118, -112 - sb * 22], [-8, -116 - sb * 22 - si * 16]], 13, { seed: 80 });
  traco(g, [[88, -114 - sb * 22 - si * 16], [168, -104 - sb * 20]], 12, { seed: 81 });
  // nariz
  forma(g, [[150, 40], [196, 62], [200, 100], [162, 112], [138, 96]], COR.nicoPele, { seed: 82, linha: L * 0.85 });
  boca(g, 92, 182 + (p.bocaDy || 0), p.larg || 104, { abre: p.abre || 0, cantoE: p.cantoE || 0, cantoD: p.cantoD || 0, linha: L, seed: 83 });
  if (p.bochechaCheia) { // boca cheia: volume nas bochechas
    traco(g, [[-30, 150], [-50, 190], [-30, 228]], 5, { seed: 84 });
    traco(g, [[210, 150], [228, 190], [212, 226]], 5, { seed: 85 });
  }
  g.restore();
  g.restore();
}

// ---------------------------------------------------------------- Bia de frente (3/4, olha para -x)
function biaFrente(g, x, y, p = {}) {
  const L = 7;
  g.save();
  g.translate(x, y + (p.dy || 0));
  const e = p.esc || 1; g.scale(e, e);
  forma(g, [[-470, 720], [-440, 420], [-300, 320], [-90, 285], [110, 288], [310, 330], [440, 430], [470, 720]], COR.biaSueter, { seed: 91, linha: L });
  forma(g, [[-120, 292], [-10, 352], [120, 292], [90, 256], [-10, 312], [-100, 256]], COR.biaGola, { seed: 92, linha: L });
  forma(g, [[-70, 190], [-66, 300], [64, 300], [62, 190]], '#d9b48c', { seed: 93, linha: L });
  g.save();
  g.rotate(p.cabRot || 0);
  forma(g, elipsePts(150, -270, 115, 105, 12), COR.biaCabelo, { seed: 94, linha: L }); // coque atrás e em cima
  forma(g, [[150, -120], [290, -60], [300, 120], [250, 220], [180, 120]], COR.biaCabelo, { seed: 95, linha: L }); // cabelo da nuca
  forma(g, elipsePts(0, 0, 255, 262, 18), COR.biaPele, { seed: 96, linha: L });
  g.save();
  D.caminho(g, elipsePts(0, 0, 255, 262, 18), true, 96, 0.8); g.clip();
  g.fillStyle = COR.biaCabelo;
  D.caminho(g, [[-300, -330], [320, -330], [300, 160], [210, 40], [160, -120], [40, -150], [-80, -120], [-200, -160], [-290, -60]], true, 97, 0.8);
  g.fill();
  g.restore();
  forma(g, elipsePts(0, 0, 255, 262, 18), null, { seed: 96, linha: L });
  g.fillStyle = COR.bochecha;
  g.beginPath(); g.ellipse(-205, 100 - (p.bochecha || 0) * 10, 30, 22, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(95, 100 - (p.bochecha || 0) * 10, 46, 26, 0, 0, Math.PI * 2); g.fill();
  const lx = p.olhoX ?? -0.6, pu = p.pupila ?? 0.55;
  olho(g, -130, -10, 42, 58, { lx, ly: p.olhoY || 0, pupila: pu, palpS: p.palpS || 0, palpI: p.palpI || 0, pele: COR.biaPele, linha: L * 0.85, seed: 98 });
  olho(g, 50, -10, 50, 62, { lx, ly: p.olhoY || 0, pupila: pu, palpS: p.palpS || 0, palpI: p.palpI || 0, pele: COR.biaPele, linha: L * 0.85, seed: 99 });
  const sb = p.sobr || 0;
  traco(g, [[-170, -92 - sb * 22], [-92, -102 - sb * 26]], 12, { seed: 100 });
  traco(g, [[0, -104 - sb * 26], [104, -94 - sb * 22]], 13, { seed: 101 });
  forma(g, [[-176, 50], [-206, 80], [-196, 104], [-160, 102]], COR.biaPele, { seed: 102, linha: L * 0.85 });
  boca(g, -70, 170, p.larg || 96, { abre: p.abre || 0, cantoE: p.cantoE ?? 6, cantoD: p.cantoD ?? 6, linha: L, seed: 103 });
  g.restore();
  // mãos juntas sob o queixo
  if (p.maos !== false) {
    const my = p.maosY ?? 330;
    traco(g, [[-260, 760], [-150, 520], [-90, my + 30]], 96, { seed: 104 });
    traco(g, [[-260, 760], [-150, 520], [-90, my + 30]], 82, { seed: 104, tinta: COR.biaSueter });
    traco(g, [[160, 760], [60, 520], [10, my + 30]], 96, { seed: 105 });
    traco(g, [[160, 760], [60, 520], [10, my + 30]], 82, { seed: 105, tinta: COR.biaSueter });
    forma(g, elipsePts(-78, my, 58, 50, 10), COR.biaPele, { seed: 106, linha: L });
    forma(g, elipsePts(-8, my + 6, 58, 50, 10), COR.biaPele, { seed: 107, linha: L });
    traco(g, [[-40, my - 30], [-44, my + 30]], 5, { seed: 108 });
  }
  g.restore();
}


// ---------------------------------------------------------------- cadeira e pernas (plano geral, de lado)
// dir: +1 olha para a direita (Nico), -1 para a esquerda (Bia). y = altura do tampo da mesa.
// Ficam fora da rotação do tronco: inclinar o corpo não arrasta a cadeira nem os pés.
function cadeiraPerfil(g, x, y, dir) {
  g.save(); g.translate(x, y); g.scale(dir, 1);
  const c = COR.cadeira;
  forma(g, [[-118, -150], [-96, -150], [-90, 132], [-112, 132]], c, { seed: 501, linha: 5 }); // encosto
  forma(g, [[-112, 120], [60, 120], [60, 140], [-112, 140]], c, { seed: 502, linha: 5 });   // assento
  forma(g, [[-108, 140], [-92, 140], [-94, 312], [-106, 312]], c, { seed: 503, linha: 5 });
  forma(g, [[40, 140], [56, 140], [54, 312], [42, 312]], c, { seed: 504, linha: 5 });
  g.restore();
}
function pernasPerfil(g, x, y, dir, calca, dy = 0, joelho = 0) {
  g.save(); g.translate(x, y + dy * 0.35); g.scale(dir, 1);
  const kx = 118 + joelho, ky = 112;
  traco(g, [[-40, 112], [kx, ky]], 66, { seed: 511 });            // coxa
  traco(g, [[-40, 112], [kx, ky]], 54, { seed: 511, tinta: calca });
  traco(g, [[kx, ky], [kx + 6, 296 - dy * 0.35]], 54, { seed: 512 }); // canela
  traco(g, [[kx, ky], [kx + 6, 296 - dy * 0.35]], 42, { seed: 512, tinta: calca });
  forma(g, [[kx - 22, 290 - dy * 0.35], [kx + 52, 292 - dy * 0.35], [kx + 54, 314 - dy * 0.35], [kx - 24, 314 - dy * 0.35]], COR.sapato, { seed: 513, linha: 4 });
  g.restore();
}

module.exports = { COR, nicoPerfil, biaPerfil, nicoFrente, biaFrente, cadeiraPerfil, pernasPerfil };
