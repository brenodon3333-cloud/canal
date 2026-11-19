// Dona Lurdes e Caio. Regras de continuidade entre ângulos:
//  Lurdes: baixa e redonda, cabelo grisalho em nuvem, óculos redondos, casaco lilás, calça cinza-ameixa.
//  Caio:   alto e magro, moletom verde-escuro com capuz caído, FONE AMARELO (a silhueta dele), jeans, tênis branco.
// Braços e pernas têm comprimento fixo (ik): a mão vai até o alvo ou para no limite e registra a falta.
const D = require('../../motor/desenho');
const { TINTA, forma, traco, olho, boca, elipsePts, membro, lerp } = D;

const COR = {
  lPele: '#f1d2b4', lCasaco: '#9a7cc1', lCasacoEsc: '#7b5fa0', lCabelo: '#d2cfda', lCalca: '#4a4458', lSapato: '#2a2230',
  cPele: '#c08e62', cMoletom: '#2f5a4e', cMoletomEsc: '#244539', cCabelo: '#1d1820', cJeans: '#2e3d5c', cTenis: '#efece6',
  fone: '#e8b931', foneEsc: '#b8891c', sacola: '#d8cbb0', alho: '#5f9a4a', alhoBranco: '#eef0e2',
  bochecha: 'rgba(230,110,110,0.28)', madeira: '#b07a46', cerdas: '#c9a35a',
};

// ---------------------------------------------------------------- cinemática de dois segmentos
function ik(S, alvo, L1, L2, dobra = 1) {
  const dx = alvo.x - S.x, dy = alvo.y - S.y;
  let d = Math.hypot(dx, dy) || 1e-6, falta = 0, H = { x: alvo.x, y: alvo.y };
  const max = L1 + L2 - 0.5;
  if (d > max) { falta = d - max; H = { x: S.x + (dx / d) * max, y: S.y + (dy / d) * max }; d = max; }
  d = Math.max(d, Math.abs(L1 - L2) + 1);
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const base = Math.atan2(H.y - S.y, H.x - S.x);
  const E1 = { x: S.x + Math.cos(base + a) * L1, y: S.y + Math.sin(base + a) * L1 };
  const E2 = { x: S.x + Math.cos(base - a) * L1, y: S.y + Math.sin(base - a) * L1 };
  // dobra: +1 cotovelo/joelho para baixo (braço que pesa), 'frente' joelho para +x (perna de perfil), 'fora' para longe do centro
  let E;
  if (dobra === 'frente') E = E1.x >= E2.x ? E1 : E2;
  else if (dobra === 'fora') E = Math.abs(E1.x) >= Math.abs(E2.x) ? E1 : E2;
  else E = E1.y >= E2.y ? E1 : E2;
  return { S, E, H, falta };
}
// alvo (no referencial do personagem, sem a rotação do tronco) -> referencial do tronco
function noTronco(alvo, piv, rot) {
  const x = alvo.x - piv.x, y = alvo.y - piv.y, c = Math.cos(-rot), s = Math.sin(-rot);
  return { x: piv.x + x * c - y * s, y: piv.y + x * s + y * c };
}
const FALTA = { max: 0, porGesto: {} };
function anota(nome, v) { FALTA.max = Math.max(FALTA.max, v); if (nome) FALTA.porGesto[nome] = Math.max(FALTA.porGesto[nome] || 0, v); }

// ---------------------------------------------------------------- Lurdes: cabeça (usada de perfil e de frente)
function cabeloNuvem(g, pts, seed, L) {
  pts.forEach(([x, y, r], i) => forma(g, elipsePts(x, y, r, r * 0.92, 10), COR.lCabelo, { seed: seed + i, linha: L }));
}
function oculos(g, cx, cy, r, L, seed) {
  traco(g, D.elipsePts(cx, cy, r, r, 12).concat([D.elipsePts(cx, cy, r, r, 12)[0]]), L, { seed, tremor: 0.4 });
}

// ---------------------------------------------------------------- Lurdes de perfil (olha para +x)
// p: corpo{x,y} (quadril em relação ao ponto do chão), rot, pes[{x,y},{x,y}] (tornozelos: perto, longe),
//    maos[{x,y},{x,y}] (alvos: perto, longe), olhoX, olhoY, pupila, palpS, sobr, abre, cantoE, cantoD, cabRot,
//    vassoura {topo:{x,y}, base:{x,y}} (no referencial do personagem), gesto (nome para o relatório de alcance)
function lurdesPerfil(g, x, y, p = {}) {
  const L = 5;
  const c = p.corpo || { x: 0, y: 0 }, rot = p.rot || 0;
  const Q = { x: c.x, y: -180 + c.y };
  g.save(); g.translate(x, y);
  // pernas (fora da rotação do tronco: o tronco inclina, os pés ficam)
  const pes = p.pes || [{ x: 10, y: -14 }, { x: -8, y: -14 }];
  const pernas = [1, 0].map((i) => ik({ x: Q.x + (i ? -4 : 4), y: Q.y }, pes[i], 86, 86, 'frente'));
  pernas.forEach((pe, k) => anota(null, pe.falta));
  const desenhaPerna = (pe, cor, seed) => {
    membro(g, [[pe.S.x, pe.S.y], [pe.E.x, pe.E.y], [pe.H.x, pe.H.y]], 34, cor, { seed });
    forma(g, elipsePts(pe.H.x + 14, pe.H.y + 6, 24, 11, 10), COR.lSapato, { seed: seed + 1, linha: 4 });
  };
  desenhaPerna(pernas[0], '#3d3849', 601);
  // tronco
  g.save(); g.translate(Q.x, Q.y); g.rotate(rot); g.translate(-Q.x, -Q.y); g.translate(c.x, c.y);
  const mt = (p.maos || [{ x: 40, y: -200 }, { x: 30, y: -205 }]).map((a) => noTronco({ x: a.x - c.x, y: a.y - c.y }, { x: 0, y: -180 }, rot));
  const bLonge = ik({ x: 6, y: -338 }, mt[1], 82, 84);
  const bPerto = ik({ x: 18, y: -335 }, mt[0], 82, 84);
  anota(p.gesto, Math.max(bPerto.falta, bLonge.falta));
  membro(g, [[bLonge.S.x, bLonge.S.y], [bLonge.E.x, bLonge.E.y], [bLonge.H.x, bLonge.H.y]], 30, COR.lCasacoEsc, { seed: 610 });
  forma(g, elipsePts(bLonge.H.x, bLonge.H.y, 15, 13, 9), '#e2bf9e', { seed: 611, linha: 4 });
  forma(g, [[-50, -175], [-68, -240], [-60, -318], [-30, -352], [14, -360], [44, -336], [60, -282], [64, -222], [52, -175], [0, -168]], COR.lCasaco, { seed: 612, linha: L });
  traco(g, [[52, -300], [56, -180]], 4, { seed: 613, tinta: COR.lCasacoEsc });
  // cabeça
  g.save(); g.translate(22, -398); g.rotate(p.cabRot || 0); g.translate(-22, 398);
  cabeloNuvem(g, [[-22, -462, 32], [8, -480, 30], [38, -474, 26], [-36, -428, 27], [-30, -394, 21]], 620, L);
  forma(g, elipsePts(5, -412, 12, 17, 8), COR.lPele, { seed: 626, linha: L * 0.8 }); // orelha
  forma(g, elipsePts(22, -418, 62, 62, 16), COR.lPele, { seed: 627, linha: L });
  cabeloNuvem(g, [[4, -478, 22], [30, -476, 18]], 628, L * 0.8);
  forma(g, [[78, -416], [92, -402], [80, -392]], COR.lPele, { seed: 630, linha: L * 0.8 }); // nariz
  g.fillStyle = COR.bochecha; g.beginPath(); g.ellipse(56, -392, 12, 8, 0, 0, Math.PI * 2); g.fill();
  olho(g, 54, -422, 9, 11, { lx: p.olhoX ?? 0.6, ly: p.olhoY ?? 0, pupila: p.pupila ?? 0.55, palpS: p.palpS || 0, pele: COR.lPele, linha: 3.5, seed: 631 });
  oculos(g, 54, -421, 19, 4, 632);
  traco(g, [[35, -421], [8, -420]], 3.5, { seed: 633, tremor: 0.3 });
  const sb = p.sobr || 0;
  traco(g, [[42, -448 - sb * 7], [66, -446 - sb * 5]], 5, { seed: 634 });
  boca(g, 64, -380, 18, { abre: p.abre || 0, cantoE: p.cantoE ?? 1, cantoD: p.cantoD ?? 2, linha: 4, seed: 635 });
  g.restore();
  // vassoura (na frente do corpo, atrás do braço de perto)
  if (p.vassoura) {
    const v = p.vassoura;
    const tl = noTronco({ x: v.topo.x - c.x, y: v.topo.y - c.y }, { x: 0, y: -180 }, rot), bl = noTronco({ x: v.base.x - c.x, y: v.base.y - c.y }, { x: 0, y: -180 }, rot);
    membro(g, [[tl.x, tl.y], [bl.x, bl.y]], 9, COR.madeira, { seed: 640, borda: 3.5 });
    const a = Math.atan2(bl.y - tl.y, bl.x - tl.x);
    g.save(); g.translate(bl.x, bl.y); g.rotate(a - Math.PI / 2);
    forma(g, [[-16, -6], [16, -6], [30, 64], [-30, 64]], COR.cerdas, { seed: 641, linha: 4, reto: true });
    for (const xx of [-14, 0, 14]) traco(g, [[xx * 0.6, 4], [xx * 1.3, 60]], 2.5, { seed: 642 + xx, tinta: '#a07f3c', tremor: 0.3 });
    g.restore();
  }
  membro(g, [[bPerto.S.x, bPerto.S.y], [bPerto.E.x, bPerto.E.y], [bPerto.H.x, bPerto.H.y]], 32, COR.lCasaco, { seed: 650 });
  forma(g, elipsePts(bPerto.H.x, bPerto.H.y, 16, 14, 9), COR.lPele, { seed: 651, linha: 4 });
  g.restore();
  desenhaPerna(pernas[1], COR.lCalca, 660);
  g.restore();
  return { maos: [bPerto.H, bLonge.H] };
}

// ---------------------------------------------------------------- Lurdes de frente (plano do elevador e do saguão)
// p: dy, rot, passo (fase do andar, 0 = parada), olhoX, olhoY, pupila, palpS, sobr, sobrInc, abre, cantoE, cantoD, cabRot,
//    maos [{x,y} esquerda da tela, {x,y} direita] (alvos locais), sacola (bool), ombroSacola (px que o ombro sobe)
function lurdesFrente(g, x, y, p = {}) {
  const L = 5;
  g.save(); g.translate(x, y);
  // pernas
  const passo = p.passo ?? null;
  [-1, 1].forEach((s, i) => {
    const lev = passo === null ? 0 : Math.max(0, Math.sin(passo * Math.PI * 2 + (i ? Math.PI : 0)));
    const ty = -14 - lev * 26;
    membro(g, [[s * 26, -176 + (p.dy || 0)], [s * 30, -95 + (p.dy || 0) * 0.5 - lev * 18], [s * 26, ty]], 40, COR.lCalca, { seed: 700 + i });
    forma(g, elipsePts(s * 28, ty + 6, 26, 12, 10), COR.lSapato, { seed: 702 + i, linha: 4 });
  });
  g.translate(0, p.dy || 0);
  g.rotate(p.rot || 0);
  const mt = p.maos || [{ x: -92, y: -190 }, { x: 92, y: -190 }];
  const os = p.ombroSacola || 0;
  const bE = ik({ x: -68, y: -330 }, mt[0], 84, 84, 'fora'), bD = ik({ x: 68, y: -330 - os }, mt[1], 84, 84, 'fora');
  anota(p.gesto, Math.max(bE.falta, bD.falta));
  // tronco
  forma(g, [[-70, -170], [-88, -240], [-80, -310], [-52, -348], [0, -360], [52, -348 - os * 0.6], [80, -310], [88, -240], [70, -170], [0, -162]], COR.lCasaco, { seed: 710, linha: L });
  traco(g, [[0, -340], [0, -172]], 4, { seed: 711, tinta: COR.lCasacoEsc });
  for (const yy of [-310, -270, -230]) { g.fillStyle = '#efe6d6'; g.beginPath(); g.arc(-8, yy, 4, 0, 7); g.fill(); }
  forma(g, [[-22, -352], [0, -326], [22, -352]], '#efe6d6', { seed: 712, linha: 4 });
  // sacola de pano no ombro direito (da tela), com um alho-poró para fora: lê de costas e de longe
  if (p.sacola) {
    traco(g, [[52, -346 - os], [96, -236]], 6, { seed: 713, tinta: '#a99a7c' });
    traco(g, [[66, -342 - os], [128, -236]], 6, { seed: 714, tinta: '#a99a7c' });
    traco(g, [[118, -236], [146, -350]], 9, { seed: 715, tinta: COR.alho });
    traco(g, [[146, -350], [128, -392]], 7, { seed: 716, tinta: '#447a36' });
    traco(g, [[146, -350], [170, -384]], 7, { seed: 717, tinta: '#447a36' });
    forma(g, [[80, -240], [146, -240], [154, -140], [74, -140]], COR.sacola, { seed: 718, linha: 4 });
  }
  // braços
  membro(g, [[bE.S.x, bE.S.y], [bE.E.x, bE.E.y], [bE.H.x, bE.H.y]], 30, COR.lCasaco, { seed: 720 });
  membro(g, [[bD.S.x, bD.S.y], [bD.E.x, bD.E.y], [bD.H.x, bD.H.y]], 30, COR.lCasaco, { seed: 721 });
  forma(g, elipsePts(bE.H.x, bE.H.y, 15, 14, 9), COR.lPele, { seed: 722, linha: 4 });
  forma(g, elipsePts(bD.H.x, bD.H.y, 15, 14, 9), COR.lPele, { seed: 723, linha: 4 });
  if (p.chaves) { // chaveiro na mão direita (da tela): é a mão que vai agarrar o corrimão
    const h = bD.H;
    traco(g, elipsePts(h.x + 4, h.y + 16, 6, 6, 8).concat([elipsePts(h.x + 4, h.y + 16, 6, 6, 8)[0]]), 2.5, { seed: 724, tinta: '#c9ced8' });
    forma(g, [[h.x - 2, h.y + 22], [h.x + 12, h.y + 22], [h.x + 12, h.y + 40], [h.x - 2, h.y + 40]], '#e9c46a', { seed: 725, linha: 2.5, reto: true });
  }
  // cabeça
  g.save(); g.translate(0, -380); g.rotate(p.cabRot || 0); g.translate(0, 380);
  cabeloNuvem(g, [[-54, -458, 30], [-22, -482, 34], [20, -484, 34], [54, -460, 30], [-68, -420, 24], [68, -420, 24]], 730, L);
  forma(g, elipsePts(0, -420, 64, 64, 16), COR.lPele, { seed: 737, linha: L });
  cabeloNuvem(g, [[-24, -478, 20], [16, -480, 21]], 738, L * 0.8);
  g.fillStyle = COR.bochecha;
  g.beginPath(); g.ellipse(-36, -394, 13, 8, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(36, -394, 13, 8, 0, 0, Math.PI * 2); g.fill();
  const lx = p.olhoX ?? 0, ly = p.olhoY ?? 0;
  olho(g, -24, -424, 9, 11, { lx, ly, pupila: p.pupila ?? 0.55, palpS: p.palpS || 0, pele: COR.lPele, linha: 3.5, seed: 740 });
  olho(g, 24, -424, 9, 11, { lx, ly, pupila: p.pupila ?? 0.55, palpS: p.palpS || 0, pele: COR.lPele, linha: 3.5, seed: 741 });
  oculos(g, -24, -423, 19, 4, 742); oculos(g, 24, -423, 19, 4, 743);
  traco(g, [[-6, -424], [6, -424]], 3.5, { seed: 744, tremor: 0.2 });
  const sb = p.sobr || 0, si = p.sobrInc || 0;
  traco(g, [[-38, -450 - sb * 7], [-12, -452 - sb * 7 - si * 6]], 5, { seed: 745 });
  traco(g, [[12, -452 - sb * 7 - si * 6], [38, -450 - sb * 7]], 5, { seed: 746 });
  traco(g, [[-4, -408], [2, -400], [-4, -396]], 3.5, { seed: 747, tremor: 0.3 });
  boca(g, 0, -380, 22, { abre: p.abre || 0, cantoE: p.cantoE ?? 1, cantoD: p.cantoD ?? 1, linha: 4, seed: 748 });
  g.restore();
  g.restore();
  return { maos: [bE.H, bD.H] };
}

// ---------------------------------------------------------------- Caio de frente
// fone: 0 = nas orelhas, 1 = no pescoço (valores intermediários: ele está tirando)
function foneEm(k) { // posição das conchas e altura do arco, em coordenadas locais
  const e = Math.max(0, Math.min(1, k));
  const ix = 60, iy = -662, fx = 50, fy = -574;
  return { x: lerp(ix, fx, e) + Math.sin(Math.PI * e) * 34, y: lerp(iy, fy, e), topo: lerp(-752, -560, e), atras: e > 0.12 };
}
function desenhaFone(g, k, sx, L, parte) {
  const f = foneEm(k);
  const arco = [[-f.x, f.y], [-f.x * 0.8, f.topo + (f.y - f.topo) * 0.35], [0, f.topo], [f.x * 0.8, f.topo + (f.y - f.topo) * 0.35], [f.x, f.y]];
  if (parte !== 'conchas') { D.membro(g, arco, 11, COR.fone, { seed: 801, borda: L * 0.8 }); }
  if (parte !== 'arco') {
    forma(g, elipsePts(-f.x - 4 * sx, f.y, 19, 27, 10), COR.fone, { seed: 802, linha: L });
    forma(g, elipsePts(f.x + 4 * sx, f.y, 19, 27, 10), COR.fone, { seed: 803, linha: L });
    forma(g, elipsePts(f.x + 4 * sx, f.y, 8, 12, 8), COR.foneEsc, { seed: 804, linha: 0 });
  }
}
// p: dy, rot, passo, bob (inclinação da cabeça no ritmo), olhoX, olhoY, pupila, palpS, sobr, sobrInc, abre, cantoE, cantoD,
//    maos [{x,y},{x,y}] (null = no bolso), fone (0..1), gesto
function caioFrente(g, x, y, p = {}) {
  const L = 5;
  g.save(); g.translate(x, y);
  const passo = p.passo ?? null;
  [-1, 1].forEach((s, i) => {
    const lev = passo === null ? 0 : Math.max(0, Math.sin(passo * Math.PI * 2 + (i ? Math.PI : 0)));
    const ty = -16 - lev * 30;
    membro(g, [[s * 30, -330 + (p.dy || 0)], [s * 34, -170 - lev * 22], [s * 32, ty]], 44, COR.cJeans, { seed: 810 + i });
    forma(g, elipsePts(s * 34, ty + 6, 32, 13, 10), COR.cTenis, { seed: 812 + i, linha: 4 });
  });
  g.translate(0, p.dy || 0); g.rotate(p.rot || 0);
  forma(g, elipsePts(0, -556, 74, 26, 12), COR.cMoletomEsc, { seed: 814, linha: L }); // capuz caído atrás do pescoço
  const noBolso = [{ x: -28, y: -334 }, { x: 28, y: -334 }];
  const mt = (p.maos || [null, null]).map((m, i) => m || noBolso[i]);
  const bE = ik({ x: -90, y: -520 }, mt[0], 112, 112), bD = ik({ x: 90, y: -520 }, mt[1], 112, 112);
  anota(p.gesto, Math.max(bE.falta, bD.falta));
  forma(g, [[-92, -320], [-100, -420], [-96, -518], [-62, -556], [0, -562], [62, -556], [96, -518], [100, -420], [92, -320], [0, -312]], COR.cMoletom, { seed: 815, linha: L });
  traco(g, [[-14, -552], [-17, -496]], 3.5, { seed: 816, tinta: '#d9d4c6' });
  traco(g, [[14, -552], [17, -496]], 3.5, { seed: 817, tinta: '#d9d4c6' });
  // pescoço e fone no pescoço (atrás da cabeça quando caído)
  forma(g, [[-18, -604], [18, -604], [18, -558], [-18, -558]], '#a77a52', { seed: 818, linha: 4, reto: true });
  const k = p.fone || 0;
  if (foneEm(k).atras) desenhaFone(g, k, 1, L, 'arco');
  // braços (antes do bolso: as mãos somem dentro dele)
  const bracos = () => {
    membro(g, [[bE.S.x, bE.S.y], [bE.E.x, bE.E.y], [bE.H.x, bE.H.y]], 34, COR.cMoletom, { seed: 820 });
    membro(g, [[bD.S.x, bD.S.y], [bD.E.x, bD.E.y], [bD.H.x, bD.H.y]], 34, COR.cMoletom, { seed: 821 });
    if (p.maos && p.maos[0]) forma(g, elipsePts(bE.H.x, bE.H.y, 16, 15, 9), COR.cPele, { seed: 822, linha: 4 });
    if (p.maos && p.maos[1]) forma(g, elipsePts(bD.H.x, bD.H.y, 16, 15, 9), COR.cPele, { seed: 823, linha: 4 });
  };
  const algumaFora = p.maos && (p.maos[0] || p.maos[1]);
  if (!algumaFora) bracos();
  forma(g, [[-56, -378], [56, -378], [64, -318], [-64, -318]], COR.cMoletomEsc, { seed: 824, linha: 4 }); // bolso canguru
  // cabeça
  g.save(); g.translate(0, -600); g.rotate((p.bob || 0) + (p.cabRot || 0)); g.translate(0, 600);
  forma(g, elipsePts(-56, -656, 10, 15, 8), COR.cPele, { seed: 830, linha: 4 });
  forma(g, elipsePts(56, -656, 10, 15, 8), COR.cPele, { seed: 831, linha: 4 });
  forma(g, elipsePts(0, -660, 56, 70, 16), COR.cPele, { seed: 832, linha: L });
  forma(g, [[-60, -676], [-58, -716], [-30, -742], [10, -748], [46, -730], [62, -690], [50, -684], [40, -704], [22, -694], [6, -708], [-12, -692], [-30, -704], [-44, -684]], COR.cCabelo, { seed: 833, linha: L });
  const lx = p.olhoX ?? 0, ly = p.olhoY ?? 0;
  olho(g, -20, -662, 11, 14, { lx, ly, pupila: p.pupila ?? 0.5, palpS: p.palpS ?? 0.15, pele: COR.cPele, linha: 3.5, seed: 834 });
  olho(g, 22, -662, 11, 14, { lx, ly, pupila: p.pupila ?? 0.5, palpS: p.palpS ?? 0.15, pele: COR.cPele, linha: 3.5, seed: 835 });
  const sb = p.sobr || 0, si = p.sobrInc || 0;
  traco(g, [[-34, -684 - sb * 7], [-10, -686 - sb * 7 - si * 6]], 5, { seed: 836 });
  traco(g, [[10, -686 - sb * 7 - si * 6], [34, -684 - sb * 7]], 5, { seed: 837 });
  traco(g, [[2, -650], [8, -638], [0, -634]], 3.5, { seed: 838, tremor: 0.3 });
  boca(g, 2, -616, 22, { abre: p.abre || 0, cantoE: p.cantoE ?? 0, cantoD: p.cantoD ?? 0, linha: 4, seed: 839 });
  if (!foneEm(k).atras) desenhaFone(g, k, 1, L, 'arco');
  g.restore();
  desenhaFone(g, k, 1, L, 'conchas');
  if (algumaFora) bracos();
  g.restore();
  return { maos: [bE.H, bD.H] };
}

// ---------------------------------------------------------------- closes três-quartos
// Lurdes olha para -x (para o Caio). Origem no centro da cabeça; escala ~4x do plano geral.
// p: olhoX, olhoY, pupila, palpS, sobr, sobrInc, abre, cantoE, cantoD, cabRot, dy, ombro, aperta (0..1 dedos fechados)
function lurdesClose(g, x, y, p = {}) {
  const L = 7;
  g.save(); g.translate(x, y + (p.dy || 0));
  g.save(); g.translate(0, -(p.ombro || 0));
  forma(g, [[-420, 760], [-400, 470], [-290, 330], [-90, 280], [110, 286], [300, 340], [420, 470], [450, 760]], COR.lCasaco, { seed: 900, linha: L });
  forma(g, [[-90, 290], [0, 380], [90, 292], [60, 262], [0, 330], [-60, 262]], '#efe6d6', { seed: 901, linha: L });
  traco(g, [[0, 380], [0, 760]], 6, { seed: 902, tinta: COR.lCasacoEsc });
  forma(g, [[-60, 200], [-56, 286], [60, 290], [64, 200]], '#e2bf9e', { seed: 903, linha: L });
  g.restore();
  g.save(); g.rotate(p.cabRot || 0);
  cabeloNuvem(g, [[-170, -200, 110], [-40, -270, 120], [110, -250, 112], [230, -150, 95], [-240, -60, 85], [250, -30, 80], [200, 80, 60]], 910, L);
  forma(g, elipsePts(0, 0, 240, 246, 18), COR.lPele, { seed: 920, linha: L });
  cabeloNuvem(g, [[-90, -230, 70], [40, -248, 74], [150, -200, 56]], 921, L * 0.8);
  forma(g, elipsePts(210, 20, 34, 52, 10), COR.lPele, { seed: 925, linha: L }); // orelha (lado de lá)
  g.fillStyle = COR.bochecha;
  g.beginPath(); g.ellipse(-170, 90, 40, 24, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(90, 92, 46, 26, 0, 0, Math.PI * 2); g.fill();
  const lx = p.olhoX ?? -0.6, ly = p.olhoY ?? 0, pu = p.pupila ?? 0.5;
  olho(g, -120, -16, 38, 46, { lx, ly, pupila: pu, palpS: p.palpS || 0, palpI: p.palpI || 0, pele: COR.lPele, linha: L * 0.8, seed: 926 });
  olho(g, 40, -16, 44, 50, { lx, ly, pupila: pu, palpS: p.palpS || 0, palpI: p.palpI || 0, pele: COR.lPele, linha: L * 0.8, seed: 927 });
  oculos(g, -120, -14, 70, 8, 928); oculos(g, 40, -14, 78, 8, 929);
  traco(g, [[-50, -18], [-38, -18]], 7, { seed: 930, tremor: 0.2 });
  traco(g, [[118, -20], [196, -4]], 6, { seed: 931, tremor: 0.3 });
  const sb = p.sobr || 0, si = p.sobrInc || 0;
  traco(g, [[-176, -108 - sb * 22], [-80, -116 - sb * 24 - si * 18]], 12, { seed: 932 });
  traco(g, [[-6, -118 - sb * 24 - si * 18], [104, -110 - sb * 22]], 12, { seed: 933 });
  forma(g, [[-176, 50], [-214, 92], [-200, 116], [-160, 112]], COR.lPele, { seed: 934, linha: L * 0.85 }); // nariz para -x
  boca(g, -84, 168, p.larg || 84, { abre: p.abre || 0, cantoE: p.cantoE ?? 2, cantoD: p.cantoD ?? 2, linha: L, seed: 935 });
  g.restore();
  g.restore();
}
// mão da Lurdes no corrimão (desenhada pela cena, por cima do corrimão): aperta = 0 aberta .. 1 fechada
function maoCorrimao(g, x, y, aperta, chaves, ferv = 0) {
  const L = 6;
  membro(g, [[x + 260, y + 300], [x + 120, y + 120], [x + 20, y + 8]], 110, COR.lCasaco, { seed: 940, borda: 6 });
  forma(g, elipsePts(x, y - 4, 70, 46, 12), COR.lPele, { seed: 941, linha: L });
  for (let i = 0; i < 4; i++) { // dedos por cima do tubo
    const fx = x - 54 + i * 34, dd = 14 * aperta;
    forma(g, elipsePts(fx, y + 30 + dd * 0.5, 15, 24 + dd * 0.4, 8), COR.lPele, { seed: 942 + i, linha: L * 0.8 });
  }
  if (chaves) {
    const kx = x + 40, ky = y + 52;
    traco(g, elipsePts(kx, ky, 18, 18, 10).concat([elipsePts(kx, ky, 18, 18, 10)[0]]), 6, { seed: 950, tinta: '#c9ced8' });
    const bal = Math.sin(ferv * 1.7) * 0.06;
    D.membro(g, [[kx - 22, ky + 8], [kx - 64, ky + 66]], 9, '#c9ced8', { seed: 952, borda: 3 }); // a chave fica atrás da plaquinha
    g.save(); g.translate(kx, ky + 16); g.rotate(bal);
    forma(g, [[-30, 0], [30, 0], [30, 54], [-30, 54]], '#e9c46a', { seed: 951, linha: 5, reto: true });
    g.font = '30px Archivo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = TINTA; g.fillText('501', 0, 29);
    g.restore();
  }
}

// Caio olha para +x (para a Lurdes). p: olhoX, olhoY, pupila, palpS, sobr, sobrInc, abre, cantoE, cantoD, cabRot, bob, dy,
//   fone (0 orelhas .. 1 pescoço), mao {x,y} (null = fora de quadro), engole (0..1)
function caioClose(g, x, y, p = {}) {
  const L = 7;
  g.save(); g.translate(x, y + (p.dy || 0));
  forma(g, elipsePts(20, 330, 330, 80, 14), COR.cMoletomEsc, { seed: 960, linha: L });
  forma(g, [[-440, 760], [-420, 470], [-300, 350], [-90, 300], [120, 304], [320, 352], [440, 470], [460, 760]], COR.cMoletom, { seed: 961, linha: L });
  traco(g, [[-50, 330], [-60, 560]], 9, { seed: 962, tinta: '#d9d4c6' });
  traco(g, [[70, 330], [80, 560]], 9, { seed: 963, tinta: '#d9d4c6' });
  const eng = p.engole || 0;
  forma(g, [[-70, 200], [-66, 320], [76, 322], [80, 200]], '#a77a52', { seed: 964, linha: L });
  if (eng > 0) traco(g, [[0, 250 + eng * 30], [14, 262 + eng * 30]], 6, { seed: 965 });
  const k = Math.max(0, Math.min(1, p.fone || 0));
  // fone: concha de lá (atrás da cabeça) e arco
  const cx = lerp(-230, -150, k) - Math.sin(Math.PI * k) * 90, cy = lerp(10, 300, k);
  const dx = lerp(250, 150, k) + Math.sin(Math.PI * k) * 110, dyy = lerp(10, 300, k);
  const topo = lerp(-330, 360, k);
  const arco = [[cx, cy], [cx * 0.7, topo + (cy - topo) * 0.4], [10, topo], [dx * 0.7, topo + (dyy - topo) * 0.4], [dx, dyy]];
  const caido = k > 0.12;
  if (caido) D.membro(g, arco, 34, COR.fone, { seed: 966, borda: 6 });
  g.save(); g.rotate((p.bob || 0) + (p.cabRot || 0));
  forma(g, elipsePts(-225, 20, 36, 54, 10), COR.cPele, { seed: 967, linha: L });
  forma(g, elipsePts(0, 0, 232, 282, 18), COR.cPele, { seed: 968, linha: L });
  forma(g, [[-250, -40], [-246, -200], [-150, -300], [0, -318], [150, -296], [240, -190], [236, -60], [200, -110], [160, -150], [110, -120], [60, -168], [0, -130], [-60, -170], [-120, -124], [-180, -160], [-216, -60]], COR.cCabelo, { seed: 969, linha: L });
  g.fillStyle = 'rgba(160,70,60,0.22)';
  g.beginPath(); g.ellipse(-110, 120, 44, 24, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(170, 116, 34, 22, 0, 0, Math.PI * 2); g.fill();
  const lx = p.olhoX ?? 0.6, ly = p.olhoY ?? 0, pu = p.pupila ?? 0.5;
  olho(g, -50, -10, 46, 56, { lx, ly, pupila: pu, palpS: p.palpS ?? 0.18, palpI: p.palpI || 0, pele: COR.cPele, linha: L * 0.8, seed: 970 });
  olho(g, 120, -10, 40, 52, { lx, ly, pupila: pu, palpS: p.palpS ?? 0.18, palpI: p.palpI || 0, pele: COR.cPele, linha: L * 0.8, seed: 971 });
  const sb = p.sobr || 0, si = p.sobrInc || 0;
  traco(g, [[-104, -96 - sb * 22], [-4, -104 - sb * 24 - si * 18]], 13, { seed: 972 });
  traco(g, [[78, -104 - sb * 24 - si * 18], [168, -94 - sb * 22]], 12, { seed: 973 });
  forma(g, [[150, 40], [196, 70], [196, 104], [158, 110]], COR.cPele, { seed: 974, linha: L * 0.85 });
  boca(g, 80, 176, p.larg || 90, { abre: p.abre || 0, cantoE: p.cantoE ?? 0, cantoD: p.cantoD ?? 0, linha: L, seed: 975 });
  if (!caido) {
    D.membro(g, arco, 34, COR.fone, { seed: 966, borda: 6 });
    forma(g, elipsePts(cx - 10, cy, 52, 76, 12), COR.fone, { seed: 976, linha: L });
    forma(g, elipsePts(dx + 14, dyy, 58, 84, 12), COR.fone, { seed: 977, linha: L });
    forma(g, elipsePts(dx + 22, dyy, 22, 34, 10), COR.foneEsc, { seed: 978, linha: 0 });
  }
  g.restore();
  if (caido) {
    forma(g, elipsePts(cx - 10, cy, 52, 76, 12), COR.fone, { seed: 976, linha: L });
    forma(g, elipsePts(dx + 14, dyy, 58, 84, 12), COR.fone, { seed: 977, linha: L });
    forma(g, elipsePts(dx + 22, dyy, 22, 34, 10), COR.foneEsc, { seed: 978, linha: 0 });
  }
  if (p.mao) { // mão que vem de baixo até o fone (antebraço entra pela borda do quadro)
    const m = p.mao;
    membro(g, [[m.x + 120, 900], [m.x + 70, m.y + 220], [m.x, m.y + 40]], 104, COR.cMoletom, { seed: 980, borda: 7 });
    forma(g, elipsePts(m.x, m.y, 58, 66, 12), COR.cPele, { seed: 981, linha: L });
    for (let i = 0; i < 3; i++) forma(g, elipsePts(m.x - 30 + i * 30, m.y - 56, 15, 26, 8), COR.cPele, { seed: 982 + i, linha: L * 0.8 });
  }
  g.restore();
  return { fone: { x: dx + 14, y: dyy } };
}

module.exports = { COR, ik, FALTA, anota, lurdesPerfil, lurdesFrente, caioFrente, lurdesClose, maoCorrimao, caioClose, foneEm };
