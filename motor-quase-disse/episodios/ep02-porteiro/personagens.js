// Episódio 2. A Lurdes e o Caio vêm do ep01 com o mesmo desenho (personagens do ep01, sem mudança).
// Novos aqui: o Seu Arlindo (frente, costas, close) e as vistas de costas do Caio e da Lurdes,
// que o saguão pede: quem sai pela porta de vidro anda para longe da câmera.
// Seu Arlindo: QUEPE azul-marinho e BIGODE grosso grisalho (a silhueta dele), uniforme azul-marinho com crachá âmbar.
// Altura: elenco.js (Caio 1,00 · Arlindo 0,88 · Lurdes 0,72), a escala vem só da profundidade.
const D = require('../../motor/desenho');
const E1 = require('../ep01-elevador/personagens');
const { TINTA, forma, traco, olho, boca, elipsePts, membro, lerp } = D;
const { ik, anota, FALTA } = E1;

const COR = {
  ...E1.COR,
  aPele: '#a9744f', aPeleEsc: '#8d5d3d', aUni: '#2c3e6b', aUniEsc: '#22305a', aUniClaro: '#3c5290', aCalca: '#1f2a48', aSapato: '#18151c',
  aBigode: '#d6d0ca', aBigodeEsc: '#aaa39d', aQuepe: '#24335c', aAba: '#121019', aCracha: '#e9b04a',
  aCivil: '#c9b48a', aCivilEsc: '#a8936a', aCivilCalca: '#4b3b2e', aBoina: '#6b4a32',
};

// ---------------------------------------------------------------- Seu Arlindo de frente
// p: sentado (bool), passo (fase do andar, null = parado), dy, rot, maos [{x,y},{x,y}] (alvos locais, null = ao lado do corpo),
//    olhoX, olhoY, pupila, palpS, sobr, sobrInc, cabRot, abre (boca sob o bigode), cantoE, cantoD,
//    quepe: 'cabeca' (padrão) | 'mao' (na mão esquerda da tela) | null, civil (roupa de folga, boina), gesto
function quepe(g, L, seed = 1100) {
  forma(g, [[-60, -572], [-66, -616], [-44, -646], [0, -654], [44, -646], [66, -616], [60, -572]], COR.aQuepe, { seed, linha: L });
  forma(g, [[-60, -588], [60, -588], [60, -572], [-60, -572]], COR.aAba, { seed: seed + 1, linha: L * 0.8, reto: true });
  forma(g, [[-64, -576], [64, -576], [54, -556], [-54, -556]], COR.aAba, { seed: seed + 2, linha: L * 0.8 });
  forma(g, elipsePts(0, -616, 9, 10, 8), COR.aCracha, { seed: seed + 3, linha: 3 });
}
function boina(g, L, seed = 1110) {
  forma(g, [[-62, -572], [-68, -612], [-32, -650], [30, -654], [72, -618], [64, -572]], COR.aBoina, { seed, linha: L }); // mesma altura do quepe
  forma(g, [[-62, -580], [64, -580], [58, -562], [-56, -562]], '#55392a', { seed: seed + 1, linha: L * 0.8 });
}
function arlindoFrente(g, x, y, p = {}) {
  const L = 5, civil = !!p.civil;
  g.save(); g.translate(x, y);
  const quadril = p.sentado ? -200 : -280;
  const passo = p.passo ?? null;
  // pernas
  [-1, 1].forEach((s, i) => {
    const lev = passo === null ? 0 : Math.max(0, Math.sin(passo * Math.PI * 2 + (i ? Math.PI : 0)));
    const ty = -14 - lev * 26;
    const joelho = p.sentado ? [s * 40, -176] : [s * 33, -142 - lev * 20];
    membro(g, [[s * 30, quadril + (p.dy || 0)], joelho, [s * 32, ty]], 46, civil ? COR.aCivilCalca : COR.aCalca, { seed: 1000 + i });
    forma(g, elipsePts(s * 34, ty + 5, 33, 13, 10), COR.aSapato, { seed: 1002 + i, linha: 4 });
  });
  g.translate(0, (p.dy || 0) + (quadril + 280));
  g.rotate(p.rot || 0);
  const uni = civil ? COR.aCivil : COR.aUni, uniEsc = civil ? COR.aCivilEsc : COR.aUniEsc;
  // alvos das mãos vêm no referencial dos pés; o tronco desceu (quadril + 280) quando ele senta
  const sobe = quadril + 280 + (p.dy || 0);
  const lado = [{ x: -90, y: -238 + sobe }, { x: 90, y: -238 + sobe }]; // braços caídos, quase retos
  const mt = (p.maos || [null, null]).map((m, i) => m || lado[i]);
  const bE = ik({ x: -74, y: -432 }, { x: mt[0].x, y: mt[0].y - sobe }, 100, 100, 'fora'), bD = ik({ x: 74, y: -432 }, { x: mt[1].x, y: mt[1].y - sobe }, 100, 100, 'fora');
  anota(p.gesto, Math.max(bE.falta, bD.falta));
  // tronco: barriga redonda, cinto, botões, crachá
  forma(g, [[-82, -270], [-94, -340], [-92, -400], [-72, -442], [0, -452], [72, -442], [92, -400], [96, -340], [82, -270], [0, -262]], uni, { seed: 1010, linha: L });
  traco(g, [[-84, -284], [84, -284]], 7, { seed: 1011, tinta: civil ? '#6b5640' : '#141220' });
  traco(g, [[0, -446], [0, -290]], 3.5, { seed: 1012, tinta: uniEsc });
  for (const yy of [-410, -370, -330]) { g.fillStyle = civil ? '#efe6d6' : '#b9c3dc'; g.beginPath(); g.arc(4, yy, 3.5, 0, 7); g.fill(); }
  forma(g, [[-20, -452], [0, -424], [20, -452]], civil ? '#efe6d6' : COR.aUniClaro, { seed: 1013, linha: 4 });
  if (!civil) forma(g, [[30, -414], [64, -414], [64, -396], [30, -396]], COR.aCracha, { seed: 1014, linha: 3, reto: true });
  // braços
  const bracos = () => {
    membro(g, [[bE.S.x, bE.S.y], [bE.E.x, bE.E.y], [bE.H.x, bE.H.y]], 32, uni, { seed: 1020 });
    membro(g, [[bD.S.x, bD.S.y], [bD.E.x, bD.E.y], [bD.H.x, bD.H.y]], 32, uni, { seed: 1021 });
    forma(g, elipsePts(bE.H.x, bE.H.y, 16, 15, 9), COR.aPele, { seed: 1022, linha: 4 });
    forma(g, elipsePts(bD.H.x, bD.H.y, 16, 15, 9), COR.aPele, { seed: 1023, linha: 4 });
    if (p.quepe === 'mao') { // o quepe pendurado pela aba na mão esquerda (da tela)
      g.save(); g.translate(bE.H.x, bE.H.y + 46); g.rotate(0.15); g.translate(0, 600); quepe(g, L, 1130); g.restore();
    }
    if (p.saco) { // saco de pão da padaria na mão direita (da tela)
      const h = bD.H;
      forma(g, [[h.x - 30, h.y + 6], [h.x + 30, h.y + 6], [h.x + 36, h.y + 110], [h.x - 36, h.y + 110]], '#d9b98a', { seed: 1024, linha: 4 });
      traco(g, [[h.x - 26, h.y + 20], [h.x + 26, h.y + 20]], 3, { seed: 1025, tinta: '#b2925e' });
      forma(g, elipsePts(h.x, h.y, 16, 15, 9), COR.aPele, { seed: 1026, linha: 4 }); // a mão por cima da boca do saco
    }
  };
  bracos();
  // cabeça
  g.save(); g.translate(0, -470); g.rotate(p.cabRot || 0); g.translate(0, 470);
  forma(g, [[-20, -476], [20, -476], [20, -446], [-20, -446]], COR.aPeleEsc, { seed: 1030, linha: 4, reto: true });
  forma(g, elipsePts(-56, -528, 10, 15, 8), COR.aPele, { seed: 1031, linha: 4 });
  forma(g, elipsePts(56, -528, 10, 15, 8), COR.aPele, { seed: 1032, linha: 4 });
  forma(g, elipsePts(0, -528, 55, 62, 16), COR.aPele, { seed: 1033, linha: L });
  forma(g, [[-56, -556], [-48, -578], [-40, -540], [-50, -520]], COR.aBigode, { seed: 1034, linha: 3 }); // costeletas grisalhas
  forma(g, [[56, -556], [48, -578], [40, -540], [50, -520]], COR.aBigode, { seed: 1035, linha: 3 });
  const lx = p.olhoX ?? 0, ly = p.olhoY ?? 0;
  olho(g, -21, -536, 10, 12, { lx, ly, pupila: p.pupila ?? 0.55, palpS: p.palpS ?? 0.2, pele: COR.aPele, linha: 3.5, seed: 1036 });
  olho(g, 21, -536, 10, 12, { lx, ly, pupila: p.pupila ?? 0.55, palpS: p.palpS ?? 0.2, pele: COR.aPele, linha: 3.5, seed: 1037 });
  const sb = p.sobr || 0, si = p.sobrInc || 0;
  traco(g, [[-38, -556 - sb * 6], [-8, -558 - sb * 6 - si * 5]], 8, { seed: 1038, tinta: COR.aBigodeEsc });
  traco(g, [[8, -558 - sb * 6 - si * 5], [38, -556 - sb * 6]], 8, { seed: 1039, tinta: COR.aBigodeEsc });
  forma(g, elipsePts(0, -514, 12, 11, 10), COR.aPele, { seed: 1040, linha: 3.5 }); // nariz redondo
  boca(g, 0, -484, 18, { abre: p.abre || 0, cantoE: p.cantoE ?? 0, cantoD: p.cantoD ?? 0, linha: 3.5, seed: 1041 });
  forma(g, [[-36, -494], [-20, -506], [0, -502], [20, -506], [36, -494], [30, -484], [12, -490], [0, -488], [-12, -490], [-30, -484]], COR.aBigode, { seed: 1042, linha: 4 }); // bigode
  if (p.quepe === undefined || p.quepe === 'cabeca') { if (civil) boina(g, L); else quepe(g, L); }
  else forma(g, [[-54, -570], [-40, -596], [0, -604], [40, -596], [54, -570], [30, -578], [0, -582], [-30, -578]], '#8e8984', { seed: 1043, linha: 4 }); // sem quepe: cabelo grisalho ralo
  g.restore();
  g.restore();
  return { maos: [bE.H, bD.H] };
}

// ---------------------------------------------------------------- costas (quem anda para a porta de vidro)
// mesmas medidas da vista de frente; o rosto não aparece; p.cabRot vira a cabeça (quase se vira)
function arlindoCostas(g, x, y, p = {}) {
  const L = 5, civil = !!p.civil;
  g.save(); g.translate(x, y);
  const passo = p.passo ?? null;
  [-1, 1].forEach((s, i) => {
    const lev = passo === null ? 0 : Math.max(0, Math.sin(passo * Math.PI * 2 + (i ? Math.PI : 0)));
    const ty = -14 - lev * 22;
    membro(g, [[s * 30, -280], [s * 33, -142 - lev * 16], [s * 32, ty]], 46, civil ? COR.aCivilCalca : COR.aCalca, { seed: 1050 + i });
    forma(g, elipsePts(s * 32, ty + 2, 30, 12, 10), COR.aSapato, { seed: 1052 + i, linha: 4 });
  });
  const uni = civil ? COR.aCivil : COR.aUni;
  const lado = [{ x: -90, y: -238 }, { x: 90, y: -238 }]; // braços caídos, quase retos
  const mt = (p.maos || [null, null]).map((m, i) => m || lado[i]);
  const bE = ik({ x: -74, y: -432 }, mt[0], 100, 100, 'fora'), bD = ik({ x: 74, y: -432 }, mt[1], 100, 100, 'fora');
  anota(p.gesto, Math.max(bE.falta, bD.falta));
  forma(g, [[-82, -270], [-92, -340], [-90, -400], [-72, -442], [0, -450], [72, -442], [90, -400], [92, -340], [82, -270], [0, -266]], uni, { seed: 1060, linha: L });
  traco(g, [[-84, -284], [84, -284]], 7, { seed: 1061, tinta: civil ? '#6b5640' : '#141220' });
  traco(g, [[0, -440], [0, -292]], 3, { seed: 1062, tinta: civil ? COR.aCivilEsc : COR.aUniEsc });
  membro(g, [[bE.S.x, bE.S.y], [bE.E.x, bE.E.y], [bE.H.x, bE.H.y]], 32, uni, { seed: 1063 });
  membro(g, [[bD.S.x, bD.S.y], [bD.E.x, bD.E.y], [bD.H.x, bD.H.y]], 32, uni, { seed: 1064 });
  forma(g, elipsePts(bE.H.x, bE.H.y, 16, 15, 9), COR.aPele, { seed: 1065, linha: 4 });
  forma(g, elipsePts(bD.H.x, bD.H.y, 16, 15, 9), COR.aPele, { seed: 1066, linha: 4 });
  if (p.quepe === 'mao') { g.save(); g.translate(bE.H.x, bE.H.y + 46); g.rotate(-0.15); g.translate(0, 600); quepe(g, L, 1130); g.restore(); }
  g.save(); g.translate(0, -470); g.rotate(p.cabRot || 0); g.translate(0, 470);
  forma(g, [[-20, -476], [20, -476], [20, -446], [-20, -446]], COR.aPeleEsc, { seed: 1067, linha: 4, reto: true });
  forma(g, elipsePts(-56, -528, 10, 15, 8), COR.aPele, { seed: 1068, linha: 4 });
  forma(g, elipsePts(56, -528, 10, 15, 8), COR.aPele, { seed: 1069, linha: 4 });
  forma(g, elipsePts(0, -528, 55, 62, 16), COR.aPele, { seed: 1070, linha: L });
  forma(g, [[-52, -500], [-56, -560], [0, -578], [56, -560], [52, -500], [30, -486], [0, -482], [-30, -486]], '#8e8984', { seed: 1071, linha: 4 }); // nuca grisalha
  if (p.quepe === undefined || p.quepe === 'cabeca') {
    if (civil) boina(g, L, 1112);
    else { forma(g, [[-60, -572], [-66, -616], [-44, -646], [0, -654], [44, -646], [66, -616], [60, -572]], COR.aQuepe, { seed: 1072, linha: L }); forma(g, [[-60, -588], [60, -588], [60, -572], [-60, -572]], COR.aAba, { seed: 1073, linha: L * 0.8, reto: true }); }
  }
  g.restore();
  g.restore();
  return { maos: [bE.H, bD.H] };
}

// Caio de costas: cabelo cobre a cabeça, o arco do fone por cima, capuz caído nas costas
function caioCostas(g, x, y, p = {}) {
  const L = 5;
  g.save(); g.translate(x, y);
  const passo = p.passo ?? null;
  [-1, 1].forEach((s, i) => {
    const lev = passo === null ? 0 : Math.max(0, Math.sin(passo * Math.PI * 2 + (i ? Math.PI : 0)));
    const ty = -16 - lev * 26;
    membro(g, [[s * 30, -330], [s * 34, -170 - lev * 18], [s * 32, ty]], 44, COR.cJeans, { seed: 1150 + i });
    forma(g, elipsePts(s * 32, ty + 2, 28, 12, 10), COR.cTenis, { seed: 1152 + i, linha: 4 });
  });
  const lado = [{ x: -104, y: -302 }, { x: 104, y: -302 }];
  const mt = (p.maos || [null, null]).map((m, i) => m || lado[i]);
  const bE = ik({ x: -90, y: -520 }, mt[0], 112, 112, 'fora'), bD = ik({ x: 90, y: -520 }, mt[1], 112, 112, 'fora');
  anota(p.gesto, Math.max(bE.falta, bD.falta));
  forma(g, [[-92, -320], [-100, -420], [-96, -518], [-62, -556], [0, -562], [62, -556], [96, -518], [100, -420], [92, -320], [0, -314]], COR.cMoletom, { seed: 1160, linha: L });
  forma(g, [[-70, -552], [70, -552], [56, -470], [0, -446], [-56, -470]], COR.cMoletomEsc, { seed: 1161, linha: L }); // capuz caído
  membro(g, [[bE.S.x, bE.S.y], [bE.E.x, bE.E.y], [bE.H.x, bE.H.y]], 34, COR.cMoletom, { seed: 1162 });
  membro(g, [[bD.S.x, bD.S.y], [bD.E.x, bD.E.y], [bD.H.x, bD.H.y]], 34, COR.cMoletom, { seed: 1163 });
  forma(g, elipsePts(bE.H.x, bE.H.y, 16, 15, 9), COR.cPele, { seed: 1164, linha: 4 });
  forma(g, elipsePts(bD.H.x, bD.H.y, 16, 15, 9), COR.cPele, { seed: 1165, linha: 4 });
  g.save(); g.translate(0, -600); g.rotate(p.cabRot || 0); g.translate(0, 600);
  forma(g, [[-18, -604], [18, -604], [18, -558], [-18, -558]], '#a77a52', { seed: 1166, linha: 4, reto: true });
  forma(g, elipsePts(-56, -656, 10, 15, 8), COR.cPele, { seed: 1167, linha: 4 });
  forma(g, elipsePts(56, -656, 10, 15, 8), COR.cPele, { seed: 1168, linha: 4 });
  forma(g, elipsePts(0, -660, 56, 70, 16), COR.cCabelo, { seed: 1169, linha: L });
  const k = p.fone ?? 0, f = E1.foneEm(k);
  D.membro(g, [[-f.x, f.y], [-f.x * 0.8, f.topo + (f.y - f.topo) * 0.35], [0, f.topo], [f.x * 0.8, f.topo + (f.y - f.topo) * 0.35], [f.x, f.y]], 11, COR.fone, { seed: 1170, borda: L * 0.8 });
  forma(g, elipsePts(-f.x - 4, f.y, 19, 27, 10), COR.fone, { seed: 1171, linha: L });
  forma(g, elipsePts(f.x + 4, f.y, 19, 27, 10), COR.fone, { seed: 1172, linha: L });
  g.restore();
  g.restore();
  return { maos: [bE.H, bD.H] };
}

// sacola de pano da Lurdes com o alho-poró, desenhada solta (a cena move a sacola com a mão dela)
function sacola(g, x, y, s = 1, rot = 0, aberta = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(rot);
  traco(g, [[26, -10], [146 - 113, -350 + 240]], 9, { seed: 715, tinta: COR.alho });
  traco(g, [[33, -110], [15, -152]], 7, { seed: 716, tinta: '#447a36' });
  traco(g, [[33, -110], [57, -144]], 7, { seed: 717, tinta: '#447a36' });
  forma(g, [[-33, 0], [33, 0], [41, 100], [-39, 100]], COR.sacola, { seed: 718, linha: 4 });
  if (aberta > 0) forma(g, elipsePts(0, 2, 33, 6 + 6 * aberta, 10), '#6d6150', { seed: 719, linha: 3 }); // boca da sacola aberta
  g.restore();
}
// Lurdes de costas: nuvem de cabelo inteira, casaco, sacola no ombro com o alho-poró (lê de longe)
function lurdesCostas(g, x, y, p = {}) {
  const L = 5;
  g.save(); g.translate(x, y);
  const passo = p.passo ?? null;
  [-1, 1].forEach((s, i) => {
    const lev = passo === null ? 0 : Math.max(0, Math.sin(passo * Math.PI * 2 + (i ? Math.PI : 0)));
    const ty = -14 - lev * 22;
    membro(g, [[s * 26, -176], [s * 30, -95 - lev * 14], [s * 26, ty]], 40, COR.lCalca, { seed: 1200 + i });
    forma(g, elipsePts(s * 26, ty + 2, 24, 11, 10), COR.lSapato, { seed: 1202 + i, linha: 4 });
  });
  const lado = [{ x: -92, y: -190 }, { x: 92, y: -190 }];
  const mt = (p.maos || [null, null]).map((m, i) => m || lado[i]);
  const bE = ik({ x: -68, y: -330 }, mt[0], 84, 84, 'fora'), bD = ik({ x: 68, y: -330 }, mt[1], 84, 84, 'fora');
  anota(p.gesto, Math.max(bE.falta, bD.falta));
  forma(g, [[-70, -170], [-88, -240], [-80, -310], [-52, -348], [0, -358], [52, -348], [80, -310], [88, -240], [70, -170], [0, -166]], COR.lCasaco, { seed: 1210, linha: L });
  traco(g, [[0, -340], [0, -176]], 3.5, { seed: 1211, tinta: COR.lCasacoEsc });
  // sacola no ombro esquerdo dela: de costas, aparece à direita da tela
  traco(g, [[52, -346], [96, -236]], 6, { seed: 1212, tinta: '#a99a7c' });
  traco(g, [[66, -342], [128, -236]], 6, { seed: 1213, tinta: '#a99a7c' });
  sacola(g, 113, -240, 1, 0, 0);
  membro(g, [[bE.S.x, bE.S.y], [bE.E.x, bE.E.y], [bE.H.x, bE.H.y]], 30, COR.lCasaco, { seed: 1214 });
  membro(g, [[bD.S.x, bD.S.y], [bD.E.x, bD.E.y], [bD.H.x, bD.H.y]], 30, COR.lCasaco, { seed: 1215 });
  forma(g, elipsePts(bE.H.x, bE.H.y, 15, 14, 9), COR.lPele, { seed: 1216, linha: 4 });
  forma(g, elipsePts(bD.H.x, bD.H.y, 15, 14, 9), COR.lPele, { seed: 1217, linha: 4 });
  g.save(); g.translate(0, -380); g.rotate(p.cabRot || 0); g.translate(0, 380);
  const nuvem = [[-54, -458, 30], [-22, -482, 34], [20, -484, 34], [54, -460, 30], [-68, -420, 26], [68, -420, 26], [-40, -400, 26], [0, -396, 28], [40, -400, 26], [0, -440, 40]];
  nuvem.forEach(([cx, cy, r], i) => forma(g, elipsePts(cx, cy, r, r * 0.92, 10), COR.lCabelo, { seed: 1220 + i, linha: L }));
  g.restore();
  g.restore();
  return { maos: [bE.H, bD.H] };
}

// ---------------------------------------------------------------- close do Seu Arlindo (três-quartos, olha para +x)
// origem no centro da cabeça; escala ~4x do geral. p: olhoX, olhoY, pupila, palpS, palpI, sobr, sobrInc, cabRot, dy,
//   bigode (tremor 0..1), aperta (lábios apertados 0..1), abre, brilho (olhos molhados 0..1), lagrima (0..1 desce), mastiga (0..1), semQuepe
function arlindoClose(g, x, y, p = {}) {
  const L = 7;
  g.save(); g.translate(x, y + (p.dy || 0));
  // ombros e uniforme
  forma(g, [[-470, 760], [-450, 470], [-320, 350], [-100, 300], [130, 304], [340, 356], [470, 470], [490, 760]], COR.aUni, { seed: 1300, linha: L });
  forma(g, [[-120, 300], [-10, 420], [-60, 300]], COR.aUniClaro, { seed: 1301, linha: L });
  forma(g, [[150, 304], [40, 420], [100, 300]], COR.aUniClaro, { seed: 1302, linha: L });
  traco(g, [[20, 420], [24, 760]], 7, { seed: 1303, tinta: COR.aUniEsc });
  forma(g, [[160, 470], [300, 470], [300, 540], [160, 540]], COR.aCracha, { seed: 1304, linha: L * 0.8, reto: true });
  traco(g, [[180, 505], [280, 505]], 6, { seed: 1305, tinta: '#8a5e1c' });
  forma(g, [[-80, 200], [-76, 312], [90, 316], [94, 200]], COR.aPeleEsc, { seed: 1306, linha: L });
  g.save(); g.rotate(p.cabRot || 0);
  forma(g, elipsePts(-226, 30, 36, 56, 10), COR.aPele, { seed: 1310, linha: L }); // orelha
  forma(g, elipsePts(0, 10, 236, 270, 18), COR.aPele, { seed: 1311, linha: L });
  forma(g, [[-236, -60], [-200, -160], [-170, -40], [-200, 60]], COR.aBigode, { seed: 1312, linha: L * 0.7 }); // costeleta
  g.fillStyle = 'rgba(150,60,50,0.22)';
  g.beginPath(); g.ellipse(-110, 130, 46, 26, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(176, 124, 34, 22, 0, 0, Math.PI * 2); g.fill();
  const lx = p.olhoX ?? 0.6, ly = p.olhoY ?? 0, pu = p.pupila ?? 0.5;
  const pS = p.palpS ?? 0.22, pI = p.palpI || 0;
  olho(g, -46, -10, 44, 52, { lx, ly, pupila: pu, palpS: pS, palpI: pI, pele: COR.aPele, linha: L * 0.8, seed: 1313 });
  olho(g, 122, -10, 38, 48, { lx, ly, pupila: pu, palpS: pS, palpI: pI, pele: COR.aPele, linha: L * 0.8, seed: 1314 });
  const br = p.brilho || 0;
  if (br > 0) { // olhos molhados: a linha d'água de baixo brilha e o reflexo cresce
    g.save(); g.globalAlpha = br;
    traco(g, [[-84, 34 - pI * 70], [-8, 34 - pI * 70]], 6, { seed: 1315, tinta: '#cfe4f2', tremor: 0.4 });
    traco(g, [[90, 30 - pI * 66], [156, 30 - pI * 66]], 5, { seed: 1316, tinta: '#cfe4f2', tremor: 0.4 });
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(-46 + lx * 22 + 14, -10 + ly * 26 + 12, 7, 0, 7); g.fill();
    g.beginPath(); g.arc(122 + lx * 18 + 12, -10 + ly * 22 + 10, 6, 0, 7); g.fill();
    g.restore();
  }
  if ((p.lagrima || 0) > 0) { // uma lágrima desce do olho de cá
    const k = p.lagrima, ty = 40 + k * 120;
    forma(g, [[-30, ty - 22], [-20, ty], [-30, ty + 12], [-40, ty]], '#d8ecf7', { seed: 1317, linha: 3 });
  }
  const sb = p.sobr || 0, si = p.sobrInc || 0;
  traco(g, [[-120, -100 - sb * 22], [-10, -110 - sb * 24 - si * 20]], 22, { seed: 1318, tinta: COR.aBigodeEsc });
  traco(g, [[78, -110 - sb * 24 - si * 20], [176, -98 - sb * 22]], 20, { seed: 1319, tinta: COR.aBigodeEsc });
  forma(g, elipsePts(160, 72, 52, 46, 12), COR.aPele, { seed: 1320, linha: L * 0.9 }); // nariz grande e redondo
  // boca sob o bigode: lábio de baixo; aperta = vira uma linha fina; mastiga sobe e desce o queixo
  const ms = (p.mastiga || 0) * 12, ap = p.aperta || 0;
  boca(g, 70, 196 + ms, lerp(96, 70, ap), { abre: (p.abre || 0) * (1 - ap), cantoE: lerp(-2, -8, ap), cantoD: lerp(-2, -8, ap), linha: L, seed: 1321 });
  const tb = (p.bigode || 0) * 6 * Math.sin((D.ferv.passo || 0) * 2.1);
  forma(g, [[-50, 150 + tb], [0, 110], [70, 120], [150, 104], [222, 140 + tb], [210, 170 + tb], [150, 158], [70, 170], [0, 162], [-40, 184 + tb]], COR.aBigode, { seed: 1322, linha: L });
  traco(g, [[30, 140], [60, 156]], 4, { seed: 1323, tinta: COR.aBigodeEsc, tremor: 0.4 });
  traco(g, [[110, 136], [140, 150]], 4, { seed: 1324, tinta: COR.aBigodeEsc, tremor: 0.4 });
  // quepe: copa, faixa e aba para o lado de cá (+x)
  if (!p.semQuepe) {
    forma(g, [[-250, -210], [-264, -360], [-170, -460], [0, -488], [170, -464], [262, -370], [256, -210]], COR.aQuepe, { seed: 1325, linha: L });
    forma(g, [[-252, -270], [258, -270], [258, -210], [-252, -210]], COR.aAba, { seed: 1326, linha: L, reto: true });
    forma(g, [[-120, -220], [300, -230], [356, -180], [300, -156], [-60, -170]], COR.aAba, { seed: 1327, linha: L });
    forma(g, elipsePts(40, -366, 36, 38, 10), COR.aCracha, { seed: 1328, linha: L * 0.8 });
  } else {
    forma(g, [[-240, -100], [-210, -230], [0, -270], [200, -230], [236, -100], [150, -150], [0, -170], [-150, -150]], '#8e8984', { seed: 1329, linha: L });
  }
  g.restore();
  g.restore();
}

// ---------------------------------------------------------------- mãos vistas de cima (detalhe do livro)
// caneta: ponta em (x, y); ang = direção da ponta para o fim da caneta; clique 0..1 (o polegar no botão)
function caneta(g, x, y, ang, s = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  forma(g, [[0, 0], [26, -7], [26, 7]], '#d8dce4', { seed: 1400, linha: 3 });
  forma(g, [[26, -9], [250, -10], [262, 0], [250, 10], [26, 9]], '#20283f', { seed: 1401, linha: 4 });
  forma(g, [[150, -12], [236, -12], [236, -6], [150, -6]], '#d4a640', { seed: 1402, linha: 2.5, reto: true }); // clipe dourado
  forma(g, [[262, -6], [282, -6], [282, 6], [262, 6]], '#c9ced8', { seed: 1403, linha: 3, reto: true }); // botão
  g.restore();
}
// mão direita do Arlindo escrevendo, vista de cima: a manga vem de baixo à direita.
// A ponta da caneta fica em (x, y). clique 0..1 aproxima o polegar do botão.
function maoEscreve(g, x, y, { ang = 0.55, clique = 0, solta = 0 } = {}) {
  const L = 6;
  const c = Math.cos(ang), s = Math.sin(ang);
  const P = (d, e) => ({ x: x + c * d - s * e, y: y + s * d + c * e }); // d ao longo da caneta, e para o lado
  const palma = P(150, 70);
  membro(g, [[palma.x + 260, palma.y + 420], [palma.x + 120, palma.y + 170], [palma.x + 20, palma.y + 20]], 120, COR.aUni, { seed: 1410, borda: 6 });
  forma(g, [[palma.x + 40, palma.y + 60], [palma.x + 60, palma.y + 20], [palma.x + 100, palma.y + 50], [palma.x + 80, palma.y + 90]], COR.aUniClaro, { seed: 1411, linha: 4 }); // punho da manga
  forma(g, elipsePts(palma.x, palma.y, 74, 58, 12, ang), COR.aPele, { seed: 1412, linha: L });
  if (solta < 1) caneta(g, x, y, ang);
  // dedos: indicador e médio por cima da caneta, perto da ponta
  const d1 = P(62, 8), d2 = P(92, 30);
  forma(g, elipsePts(d1.x, d1.y, 34, 16, 10, ang), COR.aPele, { seed: 1413, linha: L * 0.8 });
  forma(g, elipsePts(d2.x, d2.y, 30, 16, 10, ang), COR.aPele, { seed: 1414, linha: L * 0.8 });
  // polegar: do lado de lá da caneta; no clique ele sobe até o botão
  const pol = { a: P(lerp(84, 268, clique), lerp(-30, -14, clique)) };
  const base = P(140, 10);
  membro(g, [[base.x, base.y], [lerp(base.x, pol.a.x, 0.5), lerp(base.y, pol.a.y, 0.5) - 10], [pol.a.x, pol.a.y]], 30, COR.aPele, { seed: 1415, borda: 5 });
}

module.exports = { COR, FALTA, ik, anota, arlindoFrente, arlindoCostas, caioCostas, lurdesCostas, sacola, arlindoClose, caneta, maoEscreve, quepe,
  lurdesFrente: E1.lurdesFrente, caioFrente: E1.caioFrente, lurdesClose: E1.lurdesClose, caioClose: E1.caioClose, foneEm: E1.foneEm };
