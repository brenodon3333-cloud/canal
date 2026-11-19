// Som do episódio 1. Cada som de contato cai no instante que comanda a imagem (M.contatos).
// A música do vizinho existe em duas texturas com o mesmo ritmo e a mesma melodia:
//   pelo teto: só graves (e um resto da melodia em ~470 Hz, que é o que atravessa a laje e chega no celular)
//   vazando do fone: só agudos, fininha
// É a mesma música; o que muda é a textura (Ifverse, café: a faixa de 2 a 8 kHz sobe e o volume quase não muda).

function som(mesa, T, S, ctx) {
  const m = ctx.marcas(T), pl = (t) => ctx.planoEm(Math.min(t, T.total - 0.001)).id;
  const { n, ruido, ruidoRosa, biquad, env, seno, soma, escala, dB, curva } = S;
  const DUR = T.total + 0.3, DL = n(DUR);
  const norm = (z, alvo = 0.9) => { let pk = 0; for (const v of z) pk = Math.max(pk, Math.abs(v)); return escala(z, alvo / (pk || 1)); };
  const fr = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));

  // ------------------------------------------------------------ geradores
  const peca = (f, seed, madeira = 1, dec = 0.022) => {
    const len = n(0.12);
    return soma(env(seno(len, f), (t) => Math.exp(-t / dec)), escala(env(seno(len, f * 2.3), (t) => Math.exp(-t / (dec * 0.55))), 0.4),
      escala(env(biquad(ruido(len, seed), 'bp', 2200 * madeira, 1.6), (t) => Math.exp(-t / 0.004)), 1.4));
  };
  const toc = (seed, corpoF = 620, grave = 190) => {
    const len = n(0.16);
    const corpo = env(biquad(ruido(len, seed), 'bp', corpoF, 3.5), (t) => Math.exp(-t / 0.035));
    const est = env(biquad(ruido(len, seed + 1), 'bp', 2400, 2), (t) => Math.exp(-t / 0.004));
    const gr = env(seno(len, (t) => grave - 300 * t), (t) => Math.exp(-t / 0.03));
    return norm(soma(escala(corpo, 5), escala(est, 1.2), escala(gr, 0.5)));
  };
  const pop = (seed, f = 2300) => soma(env(seno(n(0.05), f), (t) => Math.exp(-t / 0.008)), escala(env(biquad(ruido(n(0.05), seed), 'hp', 3000), (t) => Math.exp(-t / 0.002)), 0.6));
  const tecido = (dur, seed) => env(biquad(ruido(n(dur), seed), 'bp', 2600, 0.6), (t) => Math.sin(Math.PI * t / dur) * (0.6 + 0.4 * Math.sin(t * 60)));
  const inspira = (dur, seed, f0 = 1100) => env(biquad(ruido(n(dur), seed), 'bp', (t) => f0 + 1400 * t / dur, 1.1), (t) => Math.sin(Math.PI * Math.min(1, t / dur)) ** 1.5);
  const expira = (dur, seed) => env(biquad(ruido(n(dur), seed), 'bp', 800, 0.9), (t) => Math.sin(Math.PI * t / dur) ** 2);
  const desliza = (dur, f, seed, q = 1.3) => {
    const len = n(dur), fric = biquad(ruido(len, seed + 1), 'lp', 25);
    let pk = 0; for (const v of fric) pk = Math.max(pk, Math.abs(v));
    return env(biquad(ruido(len, seed), 'bp', f, q), (t) => Math.min(1, t / 0.04) * Math.min(1, (dur - t) / 0.08) * (0.55 + 0.45 * fric[Math.min(len - 1, n(t))] / pk));
  };
  const metalzinho = (seed, f = 4200, dec = 0.05) => soma(env(seno(n(0.12), f), (t) => Math.exp(-t / dec)), escala(env(seno(n(0.12), f * 1.48), (t) => Math.exp(-t / (dec * 0.6))), 0.6),
    escala(env(biquad(ruido(n(0.12), seed), 'hp', 4000), (t) => Math.exp(-t / 0.002)), 0.5));
  const tique = (alto, seed) => {
    const len = n(0.07);
    return soma(escala(env(biquad(ruido(len, seed), 'hp', 2000), (t) => Math.exp(-t / 0.0015)), 0.6), escala(env(biquad(ruido(len, seed + 1), 'bp', alto ? 3600 : 2900, 14), (t) => Math.exp(-t / 0.012)), 3),
      escala(env(seno(len, alto ? 1900 : 1600), (t) => Math.exp(-t / 0.008)), 0.25));
  };
  const engole = () => {
    const len = n(0.3);
    const tom = env(seno(len, (tt) => Math.max(85, 300 - 1100 * tt)), (tt) => (tt < 0.012 ? tt / 0.012 : Math.exp(-(tt - 0.012) / 0.07)));
    return biquad(soma(tom, escala(env(biquad(ruido(len, 61), 'bp', 1300, 3), (tt) => Math.exp(-tt / 0.01)), 0.8), env(biquad(ruido(len, 62), 'bp', 700, 2), (tt) => Math.sin(Math.PI * Math.min(1, tt / 0.22)) * 0.5)), 'lp', 2500);
  };
  // cabo de vassoura no gesso: médio seco + grave curto + farelo
  const vassourada = (seed, forca = 1) => {
    const len = n(0.3);
    const corpo = env(biquad(ruido(len, seed), 'bp', 540, 3), (t) => Math.exp(-t / 0.03));
    const gr = env(seno(len, (t) => 150 - 160 * t), (t) => Math.exp(-t / 0.05));
    const est = env(biquad(ruido(len, seed + 1), 'bp', 2100, 1.5), (t) => Math.exp(-t / 0.005));
    const farelo = env(biquad(ruido(len, seed + 2), 'hp', 3500), (t) => (t < 0.03 ? 0 : Math.exp(-(t - 0.03) / 0.08)) * 0.25 * (0.5 + 0.5 * Math.sin(t * 900)));
    return norm(soma(escala(corpo, 5 * forca), escala(gr, 0.6 * forca), escala(est, 1.3), escala(farelo, 1)));
  };
  const plim = () => { const len = n(0.9); return soma(env(seno(len, 1318.5), (t) => Math.exp(-t / 0.35)), escala(env(seno(len, 1760), (t) => (t < 0.11 ? 0 : Math.exp(-(t - 0.11) / 0.4))), 0.8)); };
  // o estalo do cabo, em cima, dentro do poço: metal fino + ecos do poço
  const estaloCabo = () => {
    const len = n(0.7);
    const snap = env(biquad(ruido(len, 81), 'hp', 2500), (t) => Math.exp(-t / 0.004));
    const parc = soma(...[1830, 2710, 3960, 5420].map((f, i) => escala(env(seno(len, f), (t) => Math.exp(-t / (0.16 - i * 0.03))), 0.5 / (i + 1))));
    const z = soma(escala(snap, 1.4), parc);
    const y = new Float32Array(len);
    [[0, 1], [0.055, 0.45], [0.13, 0.25], [0.21, 0.12]].forEach(([d, a]) => { const i0 = n(d), zz = d > 0 ? biquad(z, 'lp', 3500 - d * 9000) : z; for (let i = 0; i + i0 < len; i++) y[i + i0] += zz[i] * a; });
    return norm(y);
  };
  // o tranco: baque grave na cabine + corpo metálico + corrente chacoalhando
  const tranco = () => {
    const len = n(1.2), r = S.rng(91);
    const baque = env(seno(len, (t) => 40 + 60 * Math.exp(-t * 18)), (t) => (t < 0.004 ? t / 0.004 : Math.exp(-t / 0.12)));
    const corpo = env(biquad(ruido(len, 92), 'bp', 340, 1.4), (t) => Math.exp(-t / 0.08));
    const chapa = soma(...[410, 655, 980, 1340].map((f, i) => escala(env(seno(len, f * (1 + 0.004 * Math.sin(i))), (t) => Math.exp(-t / (0.35 - i * 0.06))), 0.22 / (i + 1))));
    const corrente = new Float32Array(len);
    for (let k = 0; k < 26; k++) {
      const t0 = 0.02 + Math.pow(r(), 1.6) * 0.75, a = Math.exp(-t0 * 3.5) * (0.4 + 0.6 * r());
      const p = metalzinho(93 + k, 2400 + r() * 2600, 0.02), i0 = n(t0);
      for (let i = 0; i < p.length && i0 + i < len; i++) corrente[i0 + i] += p[i] * a * 0.5;
    }
    const cabine = env(biquad(ruido(len, 94), 'bp', 720, 1.2), (t) => (t < 0.003 ? t / 0.003 : Math.exp(-t / 0.06)));
    return norm(soma(escala(baque, 0.5), escala(corpo, 4), escala(cabine, 5), escala(chapa, 2.4), corrente));
  };
  // duas frases de madeira se encaixando: dois toques secos a 9 ms + um corpo curto
  const encaixe = () => {
    const a = peca(1580, 101, 1.5, 0.012), b = peca(1720, 102, 1.6, 0.01), len = n(0.2), y = new Float32Array(len);
    for (let i = 0; i < a.length; i++) y[i] += a[i];
    const i0 = n(0.009); for (let i = 0; i < b.length && i0 + i < len; i++) y[i0 + i] += b[i] * 0.9;
    const corpo = env(biquad(ruido(len, 103), 'bp', 380, 2.5), (t) => Math.exp(-t / 0.03));
    return norm(soma(y, escala(corpo, 2.2)));
  };
  const passo = (seed, macio = 1) => norm(biquad(toc(seed, 380 + 120 * (1 - macio), 130), 'lp', 2600 - 1200 * macio));
  const almofada = (seed) => norm(soma(escala(env(biquad(ruido(n(0.25), seed + 50), 'bp', 900, 0.9), (t) => (t < 0.004 ? t / 0.004 : Math.exp(-t / 0.04))), 0.8), env(biquad(ruido(n(0.25), seed), 'lp', 320), (t) => Math.exp(-t / 0.05)), escala(env(seno(n(0.25), (t) => 95 - 60 * t), (t) => Math.exp(-t / 0.06)), 0.6)));
  const chaves = (seed) => {
    const len = n(0.35), y = new Float32Array(len), r = S.rng(seed);
    for (let k = 0; k < 7; k++) { const p = metalzinho(seed + k, 3300 + r() * 3000, 0.03), i0 = n(Math.pow(r(), 1.4) * 0.22); for (let i = 0; i < p.length && i0 + i < len; i++) y[i0 + i] += p[i] * (0.5 + 0.5 * r()); }
    return norm(y);
  };

  // ------------------------------------------------------------ a música do vizinho (100 bpm, colcheia = 0,3 s)
  const COL = 0.3, BATIDAS = [0, 2, 3, 6], NOTAS = [440, 523.25, 440, 659.25];
  function musica(dur) {
    const len = n(dur), st = { kick: new Float32Array(len), bass: new Float32Array(len), stab: new Float32Array(len), hats: new Float32Array(len), snare: new Float32Array(len), apito: new Float32Array(len) };
    const pos = (arr, x, t) => { const i0 = n(t); for (let i = 0; i < x.length && i0 + i < len; i++) arr[i0 + i] += x[i]; };
    const kick = env(seno(n(0.3), (t) => 48 + 72 * Math.exp(-t * 30)), (t) => (t < 0.003 ? t / 0.003 : Math.exp(-t / 0.12)));
    const bassN = (t0) => env(soma(seno(n(0.28), 55), escala(seno(n(0.28), 110), 0.5)), (t) => Math.min(1, t / 0.005) * Math.exp(-t / 0.18));
    const stabN = (f) => { const l = n(0.2), x = new Float32Array(l); for (let h = 1; h <= 9; h++) { const s = seno(l, f * h); for (let i = 0; i < l; i++) x[i] += s[i] / h; } return env(x, (t) => Math.min(1, t / 0.004) * Math.exp(-t / 0.075)); };
    const hat = (seed, a) => escala(env(biquad(ruido(n(0.05), seed), 'hp', 7000), (t) => Math.exp(-t / 0.012)), a);
    const snr = (seed) => soma(env(biquad(ruido(n(0.18), seed), 'bp', 1800, 0.8), (t) => Math.exp(-t / 0.05)), escala(env(seno(n(0.18), 190), (t) => Math.exp(-t / 0.04)), 0.6));
    for (let c = 0, t = 0; t < dur; c++, t = c * COL) {
      const passoC = c % 8;
      const k = BATIDAS.indexOf(passoC);
      if (k >= 0) { pos(st.kick, kick, t); pos(st.bass, bassN(t), t); pos(st.stab, stabN(NOTAS[k]), t); }
      pos(st.hats, hat(500 + c, passoC % 2 ? 1 : 0.55), t);
      if (passoC === 4) pos(st.snare, snr(700 + c), t);
      if (passoC === 7) { pos(st.apito, env(seno(n(0.09), 1318.5), (tt) => Math.sin(Math.PI * tt / 0.09)), t); pos(st.apito, env(seno(n(0.09), 1174.7), (tt) => Math.sin(Math.PI * tt / 0.09)), t + 0.11); }
    }
    return st;
  }
  const pelaLaje = (st) => soma(biquad(biquad(soma(st.kick, escala(st.bass, 0.8), escala(st.stab, 0.45), escala(st.snare, 0.3)), 'lp', 240), 'lp', 240), escala(biquad(st.stab, 'bp', 470, 1.3), 0.35));
  const peloFone = (st) => biquad(biquad(biquad(soma(escala(st.hats, 0.7), escala(st.snare, 0.6), st.stab, escala(st.apito, 0.8)), 'hp', 1700), 'hp', 1700), 'pico', 3200, 1.2, 6);
  const corta = (x, dur, entra = 0.01, sai = 0.015) => env(x, (t) => Math.min(1, t / entra) * Math.min(1, Math.max(0, (dur - t) / sai)));

  // ------------------------------------------------------------ automação
  const sobVoz = (t) => { let d = 0; for (const f of Object.values(T.falas)) d = Math.min(d, t > f.ini - 0.15 && t < f.fim + 0.4 ? -5 : 0); return dB(d); };
  const em = (lista) => (t) => lista.includes(pl(t));
  const naSala = em(['A']), noCorredor = em(['B']), noElevador = em(['C', 'D', 'E', 'F']), noSaguao = em(['G']);
  const tc = m.tr.tranco, enc = m.rs.encaixe;

  // ------------------------------------------------------------ música pelo teto (abre, noite 1, título e noite 2)
  const trechosTeto = [[0, m.n1.para, -14, 'música do vizinho pelo teto (só graves)', 'o problema se ouve antes de se ver'],
    [m.titulo.volta, m.b.manha, -17, 'a música recomeça, baixinho', 'ele não parou'],
    [m.n2.musica, m.n2.para, -15, 'a música começa de novo no teto', 'a mesma imagem do começo']];
  for (const [a, b, g, nome, funcao] of trechosTeto) {
    const st = musica(b - a + 0.05), x = corta(pelaLaje(st), b - a, a === m.titulo.volta ? 0.4 : 0.01);
    mesa.por(x, a, { g, pan: 0.05, dist: 0.55, nome, origem: 'apartamento de cima, pela laje', funcao });
  }
  // vazando do fone: do corte para dentro do elevador até ele desligar; quase nada nas orelhas, audível no pescoço
  {
    const a = m.e.corte, b = m.si.clique, st = musica(b - a + 0.05), x = corta(peloFone(st), b - a, 0.2, 0.012);
    const gFone = (t) => { const tt = t + a; return dB(lerp(-46, -22, fr(tt, m.nt.fora - 0.05, m.nt.fora + 0.25))); };
    mesa.por(env(x, gFone), a, { g: 0, pan: -0.25, dist: 0.1, nome: 'música vazando do fone (só agudos)', origem: 'fone do Caio', funcao: 'O SOM MUDA O ENTENDIMENTO: é a música do teto' });
  }
  function lerp(a, b, k) { return a + (b - a) * k; }

  // ------------------------------------------------------------ ambientes
  // sala: relógio, cidade ao longe, geladeira de outro cômodo
  const cidade = biquad(biquad(ruidoRosa(DL, 3), 'lp', 600), 'hp', 80);
  mesa.porLeito(cidade, 0, (t) => dB(-40) * (naSala(t) ? 1 : 0) * sobVoz(t), () => 0.3, 0.3, { nome: 'cidade ao longe', origem: 'janela', dist: 0.9, pan: 0.3, funcao: 'leito da sala' });
  const gel = soma(seno(DL, 100), escala(seno(DL, 200), 0.6), escala(seno(DL, 300), 0.5), escala(seno(DL, 450), 0.25));
  mesa.porLeito(gel, 0, (t) => dB(-46) * (naSala(t) ? 1 : 0), () => -0.6, 0.4, { nome: 'geladeira em outro cômodo', origem: 'cozinha, fora de quadro', dist: 0.9, pan: -0.6, funcao: 'leito' });
  for (let t = 0.3; t < T.total; t += 1) {
    if (!naSala(t)) continue;
    const perto = m.n1.k.some((k) => Math.abs(t - k) < 0.25) || m.n2.deCima.concat(m.n2.toque).some((k) => Math.abs(t - k) < 0.25);
    if (perto) continue;
    const quieto = t > m.n2.para && t < m.n2.deCima[0];
    mesa.por(tique(Math.round(t) % 2 === 0, 300 + Math.round(t)), t, { g: quieto ? -24 : -29, pan: -0.25, dist: 0.5, nome: quieto ? 'relógio no quase silêncio' : '', origem: 'relógio da parede', funcao: 'a espera ganha duração' });
  }
  // corredor: tom do ambiente e o motor do elevador subindo pelo poço, cada vez mais perto
  const tomCorredor = biquad(ruidoRosa(DL, 5), 'lp', 900);
  mesa.porLeito(tomCorredor, 0, (t) => dB(-44) * (noCorredor(t) ? 1 : 0) * sobVoz(t), () => 0, 0.5, { nome: 'tom do corredor', origem: 'corredor', dist: 0.7, pan: 0, funcao: 'leito' });
  const motor = soma(seno(DL, 58), escala(seno(DL, 116), 0.7), escala(seno(DL, 232), 0.45), escala(seno(DL, 348), 0.3), escala(seno(DL, 464), 0.2), escala(seno(DL, (t) => 720 + 4 * Math.sin(t * 1.3)), 0.06), escala(biquad(ruidoRosa(DL, 7), 'bp', 300, 1), 1.5));
  const gMotor = (t) => {
    if (noCorredor(t)) return dB(lerp(-58, -38, fr(t, m.b.manha, m.e.plim))) * (t < m.e.plim + 0.2 ? 1 : dB(-20 * fr(t, m.e.plim, m.e.plim + 0.4)));
    if (!noElevador(t)) return 0;
    if (t < m.e.motor) return dB(-60);
    const liga = fr(t, m.e.motor, m.e.motor + 0.5);
    let g = dB(-36) * liga;
    if (t >= tc && t < enc) g *= dB(-60 * fr(t, tc, tc + 0.03)); // some em 30 ms no tranco
    if (t >= enc) g = dB(-36) * fr(t, enc, enc + 0.08); // volta no quadro do encaixe
    return g;
  };
  mesa.porLeito(motor, 0, gMotor, () => 0, 0.15, { nome: 'motor do elevador', origem: 'poço, em cima', dist: 0.5, pan: 0, funcao: 'o elevador anda; para no tranco; volta no encaixe' });
  const zumbido = soma(...[120, 240, 360, 480, 600, 840, 1200].map((f, i) => escala(seno(DL, f), [0.5, 0.8, 0.55, 0.5, 0.35, 0.2, 0.1][i])), escala(biquad(ruido(DL, 9), 'bp', 2400, 3), 0.2));
  mesa.porLeito(zumbido, 0, (t) => dB(-44) * (noElevador(t) ? 1 : 0) * ctx.luzElevador(t) * (t >= tc && t < enc ? dB(4) : 1), () => 0.05, 0.1,
    { nome: 'zumbido da luz do elevador', origem: 'teto da cabine', dist: 0.2, pan: 0, funcao: 'no silêncio, é a única coisa que se ouve; falha junto com a luz' });
  const rua = biquad(biquad(ruidoRosa(DL, 11), 'lp', 1800), 'hp', 150);
  mesa.porLeito(rua, 0, (t) => dB(-38) * (noSaguao(t) ? 1 : 0) * sobVoz(t), () => 0.4, 0.4, { nome: 'rua pela porta de vidro', origem: 'saguão, porta à direita', dist: 0.7, pan: 0.4, funcao: 'o mundo de fora volta' });

  // ------------------------------------------------------------ noite 1
  m.n1.k.forEach((k, i) => mesa.por(vassourada(110 + i, 1 + i * 0.1), k, { g: -2 + i, pan: 0.1, dist: 0.25, nome: `VASSOURA BATE NO TETO ${i + 1}`, origem: 'teto da sala', funcao: 'contato' }));
  mesa.por(tecido(0.4, 115), m.n1.abaixa, { g: -36, pan: 0.1, dist: 0.3, nome: 'roupa: ela abaixa a vassoura', origem: 'Lurdes', funcao: '' });
  // ------------------------------------------------------------ manhã
  mesa.por(pop(120, 1900), m.ma.botao, { g: -34, pan: 0.15, dist: 0.3, nome: 'botão do elevador', origem: 'parede do corredor', funcao: 'contato' });
  mesa.por(plim(), m.e.plim, { g: -34, pan: 0.3, dist: 0.4, nome: 'plim de chegada', origem: 'elevador', funcao: 'contato: a luz acende' });
  mesa.por(desliza(m.e.aberta - m.e.abre, 420, 121), m.e.abre, { g: -30, pan: 0.3, dist: 0.4, nome: 'portas abrindo', origem: 'elevador', funcao: '' });
  mesa.por(toc(122, 300, 110), m.e.aberta, { g: -34, pan: 0.3, dist: 0.4, nome: 'portas terminam de abrir', origem: 'elevador', funcao: 'contato' });
  mesa.por(passo(123), m.e.recua + 0.3, { g: -32, pan: 0.05, dist: 0.35, nome: 'pé recua', origem: 'Lurdes', funcao: 'hesitação' });
  mesa.por(passo(124), m.e.passo1, { g: -31, pan: 0.1, dist: 0.35, nome: 'passo 1', origem: 'Lurdes', funcao: 'contato' });
  mesa.por(passo(125), m.e.passo2, { g: -31, pan: 0.15, dist: 0.35, nome: 'passo 2', origem: 'Lurdes', funcao: 'contato' });
  mesa.por(biquad(passo(126), 'pico', 1800, 2, 4), m.e.pousa, { g: -26, pan: 0.35, dist: 0.25, nome: 'pé pousa no piso do elevador', origem: 'Lurdes', funcao: 'contato' });
  mesa.por(desliza(m.e.fechada - m.e.fecha, 400, 127), m.e.fecha, { g: -32, pan: 0, dist: 0.3, nome: 'portas fechando atrás da câmera', origem: 'portas (fora de quadro)', funcao: 'o som chega antes da causa' });
  mesa.por(toc(128, 300, 110), m.e.fechada, { g: -32, pan: 0, dist: 0.3, nome: 'portas fecham', origem: 'portas', funcao: '' });
  // ------------------------------------------------------------ bom dia, plano sustentado
  mesa.por(peca(1050, 130), m.bd.texto, { g: -30, pan: 0.2, dist: 0.15, nome: '"Bom dia." aparece (peça de madeira)', origem: 'boca da Lurdes', funcao: 'a fala tem peso de objeto' });
  m.bd.alca.forEach((a, i) => mesa.por(tecido(0.5, 131 + i), a + 0.1, { g: -35, pan: 0.35, dist: 0.25, nome: i ? '' : 'ela ajeita a alça da sacola', origem: 'Lurdes', funcao: 'gesto mínimo' }));
  // ------------------------------------------------------------ estalo e tranco
  mesa.por(estaloCabo(), m.es.som, { g: -21, pan: -0.05, dist: 0.45, nome: 'ESTALO DO CABO', origem: 'poço, em cima, fora de quadro', funcao: 'perigo que só ela percebe' });
  mesa.por(tranco(), tc, { g: 2, pan: 0, dist: 0, nome: 'TRANCO', origem: 'cabine inteira', funcao: 'o mundo some: o motor para em 30 ms' });
  mesa.por(inspira(0.25, 140, 1500), tc + 0.08, { g: -27, pan: 0.3, dist: 0.15, nome: 'susto dela (ar preso)', origem: 'Lurdes', funcao: '' });
  // ------------------------------------------------------------ medo
  const md = m.b.medo;
  mesa.por(tecido(0.5, 141), md + 0.35, { g: -36, pan: 0.2, dist: 0.2, nome: '', origem: 'Lurdes', funcao: '' });
  mesa.por(norm(soma(toc(142, 900, 160), escala(metalzinho(143, 2600, 0.12), 0.5))), m.md.agarra, { g: -29, pan: 0.35, dist: 0.15, nome: 'MÃO AGARRA O CORRIMÃO', origem: 'corrimão', funcao: 'contato' });
  mesa.por(chaves(144), m.md.agarra + 0.01, { g: -34, pan: 0.4, dist: 0.15, nome: 'chaveiro balança', origem: 'mão dela', funcao: 'o 501 entra em cena' });
  for (let t = md + 1.2, i = 0; t < md + 5.5; t += 0.62, i++) { mesa.por(inspira(0.22, 150 + i, 1300), t, { g: -30, pan: 0.2, dist: 0.1, nome: i ? '' : 'respiração curta dela', origem: 'Lurdes', funcao: 'o corpo conta o medo' }); mesa.por(expira(0.26, 170 + i), t + 0.3, { g: -33, pan: 0.2, dist: 0.1 }); }
  // ------------------------------------------------------------ ele nota e tira o fone
  mesa.por(pop(180, 1500), m.nt.toca, { g: -32, pan: -0.15, dist: 0.15, nome: 'mão toca o fone', origem: 'fone do Caio', funcao: 'contato' });
  mesa.por(tecido(0.7, 181), m.nt.toca + 0.05, { g: -34, pan: -0.15, dist: 0.15, nome: 'fone sai das orelhas', origem: 'Caio', funcao: '' });
  mesa.por(engole(), m.en.engole, { g: -26, pan: -0.1, dist: 0, nome: 'ele engole seco', origem: 'garganta do Caio', funcao: 'a culpa tem corpo' });
  mesa.por(pop(182, 2600), m.si.clique, { g: -19, pan: -0.2, dist: 0.2, nome: 'botão do fone: a música para', origem: 'fone', funcao: 'contato: ele escolheu' });
  // ------------------------------------------------------------ resposta e encaixe
  mesa.por(peca(1350, 190, 1.2, 0.016), m.rs.texto, { g: -30, pan: -0.15, dist: 0.15, nome: '"Bom dia." dele aparece (peça menor)', origem: 'boca do Caio', funcao: '' });
  mesa.por(encaixe(), enc, { g: -8, pan: 0, dist: 0.1, nome: 'AS FRASES SE ENCAIXAM', origem: 'entre os dois', funcao: 'contato e consequência no mesmo quadro' });
  mesa.por(toc(191, 200, 70), enc, { g: -22, pan: 0, dist: 0.4, nome: 'motor volta (tranco do freio soltando)', origem: 'poço', funcao: '' });
  mesa.por(tique(true, 192), enc + 0.05, { g: -28, pan: 0, dist: 0.2, nome: 'luz volta (relé)', origem: 'teto', funcao: '' });
  // ------------------------------------------------------------ térreo
  mesa.por(plim(), m.tm.plim, { g: -34, pan: 0, dist: 0.5, nome: 'plim no térreo', origem: 'elevador', funcao: '' });
  mesa.por(desliza(0.7, 420, 200), m.tm.abre, { g: -32, pan: 0, dist: 0.5, nome: 'portas do térreo', origem: 'elevador', funcao: '' });
  m.tm.passosCaio.forEach((t, i) => mesa.por(passo(210 + i, 1), t, { g: -36 - i * 0.6, pan: Math.max(-0.9, -0.1 - i * 0.07), dist: 0.4, nome: i ? '' : 'passos do Caio (tênis, para a esquerda)', origem: 'Caio', funcao: 'cada um para um lado' }));
  m.tm.passosLurdes.forEach((t, i) => mesa.por(passo(240 + i, 0.3), t, { g: -35 - i * 0.5, pan: Math.min(0.9, 0.1 + i * 0.05), dist: 0.4, nome: i ? '' : 'passos da Lurdes (para a direita)', origem: 'Lurdes', funcao: '' }));
  mesa.por(desliza(0.8, 400, 201), m.tm.fecha, { g: -36, pan: 0, dist: 0.6, nome: 'portas fecham no saguão vazio', origem: 'elevador', funcao: '' });
  // ------------------------------------------------------------ noite 2
  const n2 = m.n2;
  mesa.por(tecido(0.3, 250), n2.encosto, { g: -33, pan: 0, dist: 0.3, nome: 'mão no encosto do sofá', origem: 'sofá', funcao: 'contato' });
  mesa.por(almofada(251), n2.pe1, { g: -23, pan: 0, dist: 0.3, nome: 'pé afunda no assento', origem: 'sofá', funcao: 'contato: preparação' });
  mesa.por(almofada(252), n2.pe2, { g: -24, pan: 0.05, dist: 0.3, nome: 'outro pé no assento', origem: 'sofá', funcao: 'contato' });
  mesa.por(tecido(0.6, 253), n2.ergue, { g: -36, pan: 0.1, dist: 0.3, nome: 'ela levanta a vassoura', origem: 'Lurdes', funcao: '' });
  n2.deCima.forEach((t, i) => mesa.por(biquad(toc(260 + i, 520, 160), 'lp', 1400), t, { g: -7, pan: 0.05, dist: 0.5, nome: i ? '' : 'DUAS BATIDINHAS DE CIMA', origem: 'apartamento de cima, pela laje', funcao: 'ele responde' }));
  n2.toque.forEach((t, i) => mesa.por(vassourada(270 + i, 0.5), t, { g: -14, pan: 0.1, dist: 0.25, nome: i ? '' : 'duas batidinhas da vassoura, de leve', origem: 'teto da sala', funcao: 'ela responde' }));
  mesa.por(tecido(0.6, 280), n2.abaixa, { g: -37, pan: 0.1, dist: 0.3 });
  // fim: o ambiente some no preto (o leito da sala já some quando sai o plano A)
}

module.exports = { som };
