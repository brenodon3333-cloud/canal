// Som do episódio 2. Cada som de contato cai no instante que comanda a imagem (M.contatos).
// O som que conta: o tec-tec da caneta dele. No almoço ele chega pela porta do quartinho, abafado
// (corte acima de 2,5 kHz para tudo, menos o tec-tec, que é agudo e passa pela fresta).
function som(mesa, T, S, ctx) {
  const m = ctx.marcas(T), pl = (t) => ctx.planoEm(Math.min(t, T.total - 0.001));
  const { n, ruido, ruidoRosa, biquad, env, seno, soma, escala, dB } = S;
  const DUR = T.total + 0.3, DL = n(DUR);
  const norm = (z, alvo = 0.9) => { let pk = 0; for (const v of z) pk = Math.max(pk, Math.abs(v)); return escala(z, alvo / (pk || 1)); };
  const fr = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const lerp = (a, b, k) => a + (b - a) * k;
  const C = Object.fromEntries(m.contatos.map((c) => [c.nome, c.t]));

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
  // tec da caneta: clique de plástico com a mola de metal do clipe (o timbre próprio dele, para se reconhecer abafado)
  const tec = (seed, alto = 0) => {
    const len = n(0.08);
    const clique = env(biquad(ruido(len, seed), 'bp', 3300 + alto * 500, 3), (t) => Math.exp(-t / 0.003));
    const corpo = env(biquad(ruido(len, seed + 1), 'bp', 1150, 4), (t) => Math.exp(-t / 0.012));
    const mola = env(seno(len, 5400 + alto * 300), (t) => Math.exp(-t / 0.018));
    return norm(soma(escala(clique, 2), escala(corpo, 1.6), escala(mola, 0.18)));
  };
  // risco da caneta no papel: ruído agudo modulado pelos traços das letras
  const risco = (dur, seed) => { const len = n(dur), r = S.rng(seed); let fase = 0;
    const mod = new Float32Array(len); for (let i = 0; i < len; i++) { fase += (2 * Math.PI * (6 + 3 * Math.sin(i / 9000))) / S.SR; mod[i] = 0.35 + 0.65 * Math.max(0, Math.sin(fase)) ** 0.6; }
    return env(biquad(biquad(ruido(len, seed), 'bp', 3800, 1.2), 'hp', 1500), (t) => mod[Math.min(len - 1, n(t))] * Math.min(1, t / 0.03, (dur - t) / 0.05)); };
  const toque = (seed) => norm(soma(env(biquad(ruido(n(0.06), seed), 'bp', 2400, 2), (t) => Math.exp(-t / 0.004)), escala(env(biquad(ruido(n(0.06), seed + 1), 'bp', 900, 3), (t) => Math.exp(-t / 0.01)), 0.8)));
  const folha = (seed, dur = 0.25) => env(biquad(ruido(n(dur), seed), 'bp', 2400, 0.7), (t) => Math.sin(Math.PI * Math.min(1, t / dur)) ** 1.5);
  const papelCai = (seed) => norm(soma(env(biquad(ruido(n(0.1), seed), 'bp', 1600, 1.2), (t) => Math.exp(-t / 0.018)), escala(env(biquad(ruido(n(0.1), seed + 1), 'lp', 500), (t) => Math.exp(-t / 0.02)), 0.6)));
  const capa = (seed) => norm(soma(env(biquad(ruido(n(0.2), seed), 'bp', 700, 1.5), (t) => Math.exp(-t / 0.03)), escala(env(seno(n(0.2), (t) => 140 - 120 * t), (t) => Math.exp(-t / 0.04)), 0.5)));
  const plim = () => { const len = n(0.9); return soma(env(seno(len, 1318.5), (t) => Math.exp(-t / 0.35)), escala(env(seno(len, 1760), (t) => (t < 0.11 ? 0 : Math.exp(-(t - 0.11) / 0.4))), 0.8)); };
  const desliza = (dur, f, seed, q = 1.3) => env(biquad(ruido(n(dur), seed), 'bp', f, q), (t) => Math.min(1, t / 0.04) * Math.min(1, (dur - t) / 0.08));
  const passo = (seed, macio = 1) => norm(biquad(toc(seed, 380 + 120 * (1 - macio), 130), 'lp', 2600 - 1200 * macio));
  // bzzz da porta: zumbido com corpo entre 300 e 800 Hz (existe no celular) + a trava que solta
  const bzzz = (dur = 0.55) => { const len = n(dur); const base = soma(...[120, 240, 360, 480, 600, 720, 840, 960].map((f, i) => escala(seno(len, f), [0.12, 0.3, 0.8, 1, 0.9, 0.7, 0.45, 0.3][i])));
    const z = new Float32Array(len); for (let i = 0; i < len; i++) z[i] = Math.tanh(base[i] * 1.8);
    return norm(env(biquad(biquad(z, 'hp', 280), 'hp', 280), (t) => Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.03))); };
  const trava = (seed) => norm(soma(toc(seed, 900, 150), escala(env(biquad(ruido(n(0.1), seed + 2), 'hp', 3000), (t) => Math.exp(-t / 0.003)), 0.6)));
  const clack = (seed) => norm(soma(toc(seed, 420, 110), escala(env(biquad(ruido(n(0.16), seed + 3), 'bp', 2000, 3), (t) => Math.exp(-t / 0.008)), 0.5)));
  const metalzinho = (seed, f = 4200, dec = 0.05) => soma(env(seno(n(0.12), f), (t) => Math.exp(-t / dec)), escala(env(seno(n(0.12), f * 1.48), (t) => Math.exp(-t / (dec * 0.6))), 0.6),
    escala(env(biquad(ruido(n(0.12), seed), 'hp', 4000), (t) => Math.exp(-t / 0.002)), 0.5));
  const garfo = (seed) => norm(soma(biquad(desliza(0.18, 3000, seed, 2), 'hp', 1500), escala(metalzinho(seed + 1, 3700, 0.04), 0.5)));
  const tique = (alto, seed) => soma(escala(env(biquad(ruido(n(0.07), seed), 'hp', 2000), (t) => Math.exp(-t / 0.0015)), 0.6), escala(env(biquad(ruido(n(0.07), seed + 1), 'bp', alto ? 3600 : 2900, 14), (t) => Math.exp(-t / 0.012)), 3));
  const tecido = (dur, seed) => env(biquad(ruido(n(dur), seed), 'bp', 2600, 0.6), (t) => Math.sin(Math.PI * t / dur) * (0.6 + 0.4 * Math.sin(t * 60)));
  const encaixe = () => {
    const a = peca(1580, 101, 1.5, 0.012), b = peca(1720, 102, 1.6, 0.01), len = n(0.2), y = new Float32Array(len);
    for (let i = 0; i < a.length; i++) y[i] += a[i];
    const i0 = n(0.009); for (let i = 0; i < b.length && i0 + i < len; i++) y[i0 + i] += b[i] * 0.9;
    return norm(soma(y, escala(env(biquad(ruido(len, 103), 'bp', 380, 2.5), (t) => Math.exp(-t / 0.03)), 2.2)));
  };
  // letra de madeira batendo no piso: dois toques (bate e assenta)
  const letraChao = (seed) => { const a = peca(900 + (seed % 7) * 60, seed, 1.1, 0.014), len = n(0.16), y = new Float32Array(len);
    for (let i = 0; i < a.length; i++) y[i] += a[i]; const i0 = n(0.045); for (let i = 0; i < a.length && i0 + i < len; i++) y[i0 + i] += a[i] * 0.35; return norm(y); };
  const letraPano = (seed) => norm(biquad(soma(env(biquad(ruido(n(0.12), seed), 'lp', 700), (t) => Math.exp(-t / 0.03)), escala(peca(700, seed + 1, 0.6, 0.01), 0.3)), 'lp', 1600));
  const engole = () => { const len = n(0.3); return biquad(soma(env(seno(len, (tt) => Math.max(85, 300 - 1100 * tt)), (tt) => (tt < 0.012 ? tt / 0.012 : Math.exp(-(tt - 0.012) / 0.07))), escala(env(biquad(ruido(len, 61), 'bp', 1300, 3), (tt) => Math.exp(-tt / 0.01)), 0.8)), 'lp', 2500); };
  const fungada = (seed) => env(biquad(ruido(n(0.35), seed), 'bp', 1500, 1), (t) => Math.sin(Math.PI * t / 0.35) ** 2);
  const papelSaco = (seed, dur = 0.4) => env(biquad(ruido(n(dur), seed), 'bp', 3200, 0.8), (t) => Math.sin(Math.PI * t / dur) * (0.4 + 0.6 * Math.abs(Math.sin(t * 70))));

  // ------------------------------------------------------------ automação e lugares
  const sobVoz = (t) => { let d = 0; for (const f of Object.values(T.falas)) d = Math.min(d, t > f.ini - 0.15 && t < f.fim + 0.4 ? -4 : 0); return dB(d); };
  const em = (lista) => (t) => lista.includes(pl(t).id);
  const noSaguao = (t) => ['B', 'C', 'D', 'G'].includes(pl(t).id) || (pl(t).id === 'A' && !['leitura', 'assina'].includes(pl(t).bloco)) || (pl(t).id === 'A' && ['leitura', 'assina'].includes(pl(t).bloco));
  const noQuarto = em(['E']);
  const al = m.al;
  // a escuta do almoço: geladeira e rádio do quartinho caem 20 dB quando ele para o garfo
  const escutaQ = (t) => dB(-20 * fr(t, al.para, al.para + 0.15) * (1 - fr(t, al.solta, al.solta + 1.2)));

  // ------------------------------------------------------------ ambientes
  const tomSag = biquad(ruidoRosa(DL, 21), 'lp', 900);
  mesa.porLeito(tomSag, 0, (t) => dB(-38) * (noSaguao(t) ? 1 : 0) * sobVoz(t), () => 0, 0.5, { nome: 'tom do saguão', origem: 'saguão', dist: 0.7, pan: 0, funcao: 'leito' });
  // rua: abafada com a porta fechada, aberta quando a porta abre; de noite mais quieta
  const ruaX = biquad(biquad(ruidoRosa(DL, 22), 'lp', 2400), 'hp', 150);
  const carros = env(biquad(ruidoRosa(DL, 23), 'bp', 500, 0.8), (t) => 0.3 + 0.7 * Math.max(0, Math.sin(t * 0.37)) ** 4);
  const gRua = (t) => { const id = pl(t).id; if (!(id === 'B' || id === 'C' || id === 'D' || id === 'G')) return 0; const ab = ctx.aberturaPorta(t), ld = ctx.luzDia(t);
    return dB(id === 'G' ? -24 : lerp(-36, -24, ab)) * dB(-6 * ld.noite) * sobVoz(t); };
  mesa.porLeito(soma(ruaX, escala(carros, 1.5)), 0, gRua, () => 0.55, 0.3, { nome: 'rua pela porta de vidro', origem: 'porta à direita', dist: 0.7, pan: 0.55, funcao: 'o mundo de fora; abre com a porta' });
  // relógio do saguão, a cada segundo (também no detalhe do livro e no silêncio da leitura)
  for (let t = 0.4; t < T.total - 2; t += 1) {
    const p = pl(t); if (!['A', 'B', 'C', 'D', 'F'].includes(p.id) && p.id !== 'preto') continue;
    if (p.id === 'preto' && t > 2) continue;
    if (m.contatos.some((c) => Math.abs(c.t - t) < 0.2)) continue;
    const silencio = p.bloco === 'leitura';
    mesa.por(tique(Math.round(t) % 2 === 0, 400 + Math.round(t)), t, { g: silencio ? -24 : -30, pan: -0.3, dist: 0.5, nome: silencio && Math.round(t) === Math.round(m.b.leitura + 1) ? 'relógio na leitura (só ele)' : '', origem: 'relógio da parede', funcao: 'o tempo do último dia' });
  }
  // motor do elevador ao fundo quando ele sobe/desce
  const motor = soma(seno(DL, 58), escala(seno(DL, 116), 0.7), escala(seno(DL, 232), 0.45), escala(seno(DL, 348), 0.3), escala(seno(DL, 464), 0.2), escala(biquad(ruidoRosa(DL, 24), 'bp', 300, 1), 1.5));
  const viagens = [[m.b.manha + 0.8, m.c.plim], [m.b.lurdes - 2.4, m.l.plim], [m.b.interfone + 0.2, m.it.plim], [al.plim1 - 2.2, al.plim1], [al.plim2 - 0.3, al.plim2 + 2.0]];
  const gMotor = (t) => { let g = 0; for (const [a, b] of viagens) g = Math.max(g, fr(t, a - 0.6, a) * (1 - fr(t, b, b + 0.4))); const q = noQuarto(t) ? dB(-12) : 1; return dB(-40) * g * q * (noSaguao(t) || noQuarto(t) ? 1 : 0); };
  mesa.porLeito(biquad(motor, 'lp', 1400), 0, gMotor, () => 0.2, 0.3, { nome: 'motor do elevador', origem: 'poço', dist: 0.6, pan: 0.2, funcao: 'alguém vai chegar' });
  // quartinho: geladeira pequena e o rádio (música de dentro da cena, baixinha)
  const gel = soma(seno(DL, 100), escala(seno(DL, 200), 0.6), escala(seno(DL, 300), 0.5), escala(seno(DL, 450), 0.3), escala(biquad(ruido(DL, 25), 'bp', 1180, 20), 0.05));
  mesa.porLeito(gel, 0, (t) => dB(-37) * (noQuarto(t) ? 1 : 0) * escutaQ(t), () => -0.5, 0.3, { nome: 'geladeira do quartinho', origem: 'quartinho', dist: 0.5, pan: -0.5, funcao: 'cai 20 dB quando ele escuta' });
  const radio = (() => { const len = DL, y = new Float32Array(len); const notas = [392, 440, 494, 440, 392, 330, 349, 392];
    for (let k = 0, t = 0; t < DUR; k++, t += 0.42) { const f = notas[k % notas.length], s = env(soma(seno(n(0.38), f), escala(seno(n(0.38), f * 2), 0.4), escala(seno(n(0.38), f * 3), 0.2)), (tt) => Math.min(1, tt / 0.01) * Math.exp(-tt / 0.2)); const i0 = n(t); for (let i = 0; i < s.length && i0 + i < len; i++) y[i0 + i] += s[i]; }
    return biquad(biquad(y, 'hp', 350), 'lp', 3200); })();
  mesa.porLeito(radio, 0, (t) => dB(-40) * (noQuarto(t) ? 1 : 0) * escutaQ(t), () => -0.7, 0.4, { nome: 'rádio baixinho no quartinho', origem: 'prateleira', dist: 0.6, pan: -0.7, funcao: 'música de dentro da cena' });

  // ------------------------------------------------------------ gancho: escreve, tec-tec, folheia
  const [e0, e1] = m.g.escreve;
  mesa.por(risco(e1 - e0, 300), e0, { g: -34, pan: 0.15, dist: 0.1, nome: 'risco da caneta: "Início do plantão."', origem: 'livro', funcao: 'o hábito' });
  m.g.tec.forEach((t, i) => mesa.por(tec(310 + i, i), t, { g: -21, pan: 0.15, dist: 0.05, nome: i ? '' : 'TEC-TEC (caneta, gancho)', origem: 'caneta dele', funcao: 'o som que conta depois' }));
  mesa.por(papelCai(312), m.g.deita, { g: -30, pan: 0.2, dist: 0.1, nome: 'caneta deitada na mesa', origem: 'mesa', funcao: 'contato' });
  m.g.folheia.forEach((t, i) => { mesa.por(folha(320 + i, Math.max(0.08, 0.3 * Math.pow(0.8, i))), t, { g: -33 + i * 0.3, pan: -0.1, dist: 0.1, nome: i ? '' : 'páginas voltando, cada vez mais rápido', origem: 'livro', funcao: 'o tempo (31 anos)' });
    mesa.por(papelCai(340 + i), C[`página cai ${i + 1}`], { g: -33, pan: -0.1, dist: 0.1 }); });

  // ------------------------------------------------------------ manhã: Caio
  mesa.por(plim(), m.c.plim, { g: -43, pan: 0.15, dist: 0.5, nome: 'plim (Caio)', origem: 'elevador', funcao: 'contato' });
  mesa.por(desliza(0.8, 420, 401), m.c.abre, { g: -42, pan: 0.15, dist: 0.5, nome: 'portas do elevador', origem: 'elevador', funcao: '' });
  mesa.por(toc(402, 300, 110), m.c.aberta, { g: -40, pan: 0.15, dist: 0.5 });
  mesa.por(desliza(0.8, 400, 403), m.c.fecha, { g: -42, pan: 0.15, dist: 0.5 });
  const passos = (tj, seed, macio, g0, nome, panFn, quem) => tj.passos.forEach((t, i) => mesa.por(passo(seed + i, macio), t, { g: g0, pan: panFn(t), dist: 0.35, nome: i ? '' : nome, origem: quem, funcao: 'contato' }));
  const panX = (x) => Math.max(-0.9, Math.min(0.9, (x - 960) / 960));
  passos(m.c.vem, 410, 1, -37, 'passos do Caio (tênis)', () => 0, 'Caio');
  mesa.por(peca(1050, 420), m.c.bomdiaA, { g: -33, pan: -0.4, dist: 0.2, nome: '"Bom dia." dele', origem: 'Seu Arlindo', funcao: 'a fala tem peso de objeto' });
  mesa.por(tecido(0.5, 421), C['mão toca o fone'], { g: -33, pan: -0.05, dist: 0.2, nome: 'Caio tira o fone na hora', origem: 'Caio', funcao: 'ele aprendeu (ep01)' });
  mesa.por(peca(1350, 422, 1.2, 0.016), m.c.bomdiaC, { g: -33, pan: -0.05, dist: 0.2, nome: '"Bom dia." do Caio', origem: 'Caio', funcao: '' });
  mesa.por(encaixe(), m.c.encaixe, { g: -32, pan: -0.2, dist: 0.15, nome: 'encaixe (Caio)', origem: 'entre os dois', funcao: 'callback do ep01' });
  m.c.letras.forEach((t, i) => C[`letra ${i + 1} aparece (Caio)`] !== undefined && mesa.por(peca(1200 + i * 40, 430 + i, 1.3, 0.012), t, { g: -31, pan: 0, dist: 0.1, nome: i ? '' : 'letras saem: "Seu Arl"', origem: 'boca do Caio', funcao: 'o quase disse' }));
  m.c.caem.forEach((t, i) => { const tc = C[`letra ${i + 1} bate no chão`]; if (tc) mesa.por(letraChao(440 + i), tc, { g: -27 - (i % 3), pan: -0.05 + i * 0.02, dist: 0.25, nome: i ? '' : 'LETRAS BATEM NO CHÃO', origem: 'piso do saguão', funcao: 'não chegou a dizer' }); });
  mesa.por(engole(), m.c.letras[6] + 0.5, { g: -38, pan: 0, dist: 0.05, nome: 'Caio engole seco (close)', origem: 'Caio', funcao: '' });
  mesa.por(tecido(0.5, 450), C['mão toca o fone (põe)'], { g: -34, pan: -0.05, dist: 0.25, nome: 'põe o fone de volta', origem: 'Caio', funcao: '' });
  mesa.por(bzzz(), m.pt.botao, { g: -31, pan: -0.35, dist: 0.3, nome: 'BZZZ da porta (Caio)', origem: 'botão do balcão', funcao: 'a função dele' });
  mesa.por(trava(451), m.pt.abre, { g: -27, pan: 0.6, dist: 0.5, nome: 'trava da porta solta', origem: 'porta de vidro', funcao: 'contato' });
  mesa.por(desliza(0.7, 700, 452), m.pt.abre, { g: -34, pan: 0.6, dist: 0.5 });
  passos(m.pt.vai, 460, 1, -37, 'passos do Caio saindo', (t) => 0.3, 'Caio');
  mesa.por(desliza(0.6, 700, 470), m.pt.fecha, { g: -35, pan: 0.6, dist: 0.5 });
  mesa.por(clack(471), m.pt.fechada, { g: -30, pan: 0.6, dist: 0.5, nome: 'porta fecha', origem: 'porta de vidro', funcao: 'contato' });
  mesa.por(toque(474), m.ul.dedo, { g: -34, pan: 0.2, dist: 0.1 });
  mesa.por(tecido(0.3, 472), m.ul.dedo + 0.03, { g: -42, pan: 0.2, dist: 0.1, nome: 'dedo endireita a caneta', origem: 'mesa', funcao: 'o hábito' });
  mesa.por(papelCai(473), m.ul.reta, { g: -38, pan: 0.2, dist: 0.1 });

  // ------------------------------------------------------------ Lurdes
  mesa.por(plim(), m.l.plim, { g: -43, pan: 0.15, dist: 0.5, nome: 'plim (Lurdes)', origem: 'elevador', funcao: '' });
  mesa.por(desliza(0.8, 420, 501), m.l.abre, { g: -42, pan: 0.15, dist: 0.5 });
  mesa.por(toc(503, 300, 110), m.l.aberta, { g: -40, pan: 0.15, dist: 0.5 });
  mesa.por(desliza(0.8, 400, 502), m.l.fecha, { g: -42, pan: 0.15, dist: 0.5 });
  passos(m.l.vem, 505, 0.3, -37, 'passos da Lurdes', () => 0, 'Lurdes');
  m.l.letras.forEach((t, i) => C[`letra ${i + 1} aparece (Lurdes)`] !== undefined && mesa.por(peca(1150 + i * 50, 510 + i, 1.3, 0.012), t, { g: -31, pan: 0, dist: 0.1, nome: i ? '' : 'letras saem: "O sen"', origem: 'boca da Lurdes', funcao: '' }));
  mesa.por(toque(517), m.l.pegaSacola[1], { g: -33 }); mesa.por(tecido(0.4, 516), m.l.pegaSacola[1] + 0.03, { g: -35, pan: -0.1, dist: 0.2, nome: 'mão abre a sacola', origem: 'Lurdes', funcao: 'contato' });
  m.l.caem.forEach((t, i) => C[`letra ${i + 1} cai na sacola`] !== undefined && mesa.por(letraPano(520 + i), C[`letra ${i + 1} cai na sacola`], { g: -28, pan: -0.1, dist: 0.2, nome: i ? '' : 'letras caem na sacola (abafadas)', origem: 'sacola', funcao: 'ela guarda o que não disse' }));
  mesa.por(peca(1080, 530), m.l.ateL, { g: -33, pan: -0.1, dist: 0.2, nome: '"Até amanhã." dela', origem: 'Lurdes', funcao: '' });
  mesa.por(peca(1250, 531, 1.2, 0.016), m.l.ateA, { g: -33, pan: -0.4, dist: 0.2, nome: '"Até amanhã." dele', origem: 'Seu Arlindo', funcao: '' });
  mesa.por(encaixe(), m.l.encaixe, { g: -32, pan: -0.25, dist: 0.15, nome: 'encaixe (Lurdes)', origem: 'entre os dois', funcao: '' });
  mesa.por(bzzz(), m.l.botao, { g: -31, pan: -0.35, dist: 0.3, nome: 'BZZZ (Lurdes)', origem: 'botão', funcao: '' });
  mesa.por(trava(532), m.l.abre, { g: -27, pan: 0.6, dist: 0.5 });
  mesa.por(desliza(0.7, 700, 533), m.l.abre, { g: -34, pan: 0.6, dist: 0.5 });
  passos(m.l.vai, 540, 0.3, -37, 'passos da Lurdes até a porta', () => 0.3, 'Lurdes');
  passos(m.l.sai, 560, 0.3, -37, '', () => 0.6, 'Lurdes');
  mesa.por(desliza(0.6, 700, 570), m.l.fechaPorta, { g: -35, pan: 0.6, dist: 0.5 });
  mesa.por(clack(571), m.l.fechada, { g: -30, pan: 0.6, dist: 0.5 });
  // ------------------------------------------------------------ anota
  mesa.por(toque(603), m.an.pega, { g: -33 }); mesa.por(tecido(0.3, 600), m.an.pega + 0.03, { g: -38, pan: 0.2, dist: 0.1, nome: 'mão pega a caneta', origem: 'Arlindo', funcao: 'contato' });
  mesa.por(risco(m.an.escreve[1] - m.an.escreve[0], 601), m.an.escreve[0], { g: -34, pan: 0.15, dist: 0.1, nome: 'risco: "12:00 — Almoço."', origem: 'livro', funcao: '' });
  m.an.tec.forEach((t, i) => mesa.por(tec(610 + i, i), t, { g: -22, pan: 0.15, dist: 0.05, nome: i ? '' : 'TEC-TEC (anota)', origem: 'caneta', funcao: 'o hábito se repete antes do almoço' }));
  mesa.por(papelCai(612), m.an.deita, { g: -30, pan: 0.2, dist: 0.1 });

  // ------------------------------------------------------------ almoço: o ouvido entende antes do rosto
  al.garfadas.forEach((t, i) => mesa.por(garfo(620 + i), t, { g: -30, pan: 0.2, dist: 0.1, nome: i ? '' : 'garfo na marmita de alumínio', origem: 'marmita', funcao: 'contato' }));
  const porta = (x) => biquad(biquad(x, 'lp', 2500), 'lp', 2500); // pela porta entreaberta: abafado
  mesa.por(porta(plim()), al.plim1, { g: -43, pan: 0.6, dist: 0.6, nome: 'plim no saguão (pela porta)', origem: 'saguão, fora de quadro', funcao: 'alguém chegou' });
  al.passos1.forEach((t, i) => mesa.por(porta(passo(630 + i, 0.6)), t, { g: -34, pan: 0.6, dist: 0.6, nome: i ? '' : 'passos no saguão (pela porta)', origem: 'saguão', funcao: '' }));
  mesa.por(biquad(tec(640, 0), 'hp', 900), al.tec1, { g: -21, pan: 0.65, dist: 0.45, nome: 'TEC-TEC PELA PORTA', origem: 'balcão, fora de quadro', funcao: 'O SOM QUE CONTA: alguém está com a caneta dele' });
  mesa.por(biquad(tec(641, 1), 'hp', 900), al.tec1 + 0.2, { g: -21, pan: 0.65, dist: 0.45 });
  mesa.por(porta(risco(al.risco1[1] - al.risco1[0], 642)), al.risco1[0], { g: -27, pan: 0.65, dist: 0.5, nome: 'risco de caneta pela porta', origem: 'balcão', funcao: 'alguém escreve no livro' });
  mesa.por(biquad(tec(643, 0), 'hp', 900), al.tec2, { g: -22, pan: 0.65, dist: 0.45 });
  mesa.por(biquad(tec(644, 1), 'hp', 900), al.tec2 + 0.2, { g: -22, pan: 0.65, dist: 0.45 });
  al.passos2.forEach((t, i) => mesa.por(porta(passo(650 + i, 0.3)), t, { g: -35, pan: 0.6, dist: 0.6 }));
  mesa.por(porta(plim()), al.plim2, { g: -43, pan: 0.6, dist: 0.6 });
  mesa.por(engole(), al.solta - 0.6, { g: -38, pan: 0, dist: 0.05, nome: 'ele engole', origem: 'Arlindo', funcao: '' });
  // ------------------------------------------------------------ volta, fim, leitura, assina
  mesa.por(toque(702), m.vo.dedo, { g: -33, pan: 0.3, dist: 0.1 });
  mesa.por(tecido(0.3, 700), m.vo.dedo + 0.03, { g: -42, pan: 0.3, dist: 0.1, nome: 'dedo endireita a caneta torta', origem: 'mesa', funcao: 'alguém mexeu' });
  mesa.por(papelCai(701), m.vo.reta, { g: -36, pan: 0.3, dist: 0.1 });
  mesa.por(capa(710), C['capa do livro cai aberta'], { g: -30, pan: 0, dist: 0.1, nome: 'capa do livro cai aberta', origem: 'livro', funcao: 'contato' });
  mesa.por(folha(711, 0.75), m.fi.abre[0], { g: -32, pan: 0, dist: 0.1 });
  mesa.por(toque(723), m.le.pegaPagina, { g: -34, pan: 0.2, dist: 0.1, nome: 'mão pega o canto da página', origem: 'livro', funcao: 'contato' });
  mesa.por(folha(720, 0.8), m.le.vira[0], { g: -30, pan: 0.1, dist: 0.1, nome: 'página vira', origem: 'livro', funcao: 'tem mais' });
  mesa.por(papelCai(721), m.le.vira[1], { g: -30, pan: 0, dist: 0.1 });
  mesa.por(fungada(722), m.le.corteF + 4.7, { g: -31, pan: 0, dist: 0.05, nome: 'ele funga baixinho', origem: 'Arlindo', funcao: 'o corpo conta' });
  mesa.por(engole(), m.le.corteF + 6.4, { g: -37, pan: 0, dist: 0.05 });
  mesa.por(toque(734), m.as.pega, { g: -33 }); mesa.por(tecido(0.3, 730), m.as.pega + 0.03, { g: -38, pan: 0.3, dist: 0.1, nome: 'mão pega a caneta (assina)', origem: 'Arlindo', funcao: '' });
  mesa.por(tec(731, 0), m.as.tec0, { g: -25, pan: 0.2, dist: 0.05, nome: 'tec (abre a caneta)', origem: 'caneta', funcao: '' });
  mesa.por(risco(m.as.linha1[1] - m.as.linha1[0], 732), m.as.linha1[0], { g: -34, pan: 0.15, dist: 0.1, nome: 'risco: "18:00 — Fim do plantão."', origem: 'livro', funcao: '' });
  mesa.por(risco(m.as.linha2[1] - m.as.linha2[0], 733), m.as.linha2[0], { g: -35, pan: 0.15, dist: 0.1, nome: 'risco tremido: "Obrigado."', origem: 'livro', funcao: 'a mão treme' });
  m.as.tec.forEach((t, i) => mesa.por(tec(740 + i, i), t, { g: -21, pan: 0.15, dist: 0.05, nome: i ? '' : 'TEC-TEC (o último)', origem: 'caneta', funcao: 'o hábito, pela última vez' }));
  mesa.por(papelCai(742), m.as.deita, { g: -27, pan: 0.2, dist: 0.1, nome: 'caneta pousa torta', origem: 'livro', funcao: 'de propósito' });
  // ------------------------------------------------------------ ele sai
  mesa.por(bzzz(), m.sa.botao, { g: -36, pan: -0.3, dist: 0.3, nome: 'BZZZ (ele abre para si mesmo)', origem: 'botão', funcao: '' });
  mesa.por(trava(750), m.sa.abre, { g: -27, pan: 0.6, dist: 0.5 });
  mesa.por(desliza(0.7, 700, 751), m.sa.abre, { g: -34, pan: 0.6, dist: 0.5 });
  passos(m.sa.vai, 760, 0.6, -31, 'passos dele saindo', (t) => 0.3, 'Arlindo');
  mesa.por(desliza(0.6, 700, 770), m.sa.fecha, { g: -35, pan: 0.6, dist: 0.5 });
  mesa.por(clack(771), m.sa.fechada, { g: -29, pan: 0.6, dist: 0.5, nome: 'porta fecha atrás dele', origem: 'porta', funcao: '' });
  // ------------------------------------------------------------ manhã seguinte
  const it = m.it;
  mesa.por(biquad(bzzz(0.6), 'lp', 1800), it.interfone, { g: -32, pan: 0.6, dist: 0.6, nome: 'bzzz do interfone, de fora', origem: 'interfone na rua', funcao: 'a imagem volta mudada' });
  mesa.por(bzzz(0.4), it.interfone + 0.05, { g: -37, pan: -0.3, dist: 0.4, nome: 'interfone toca no balcão', origem: 'balcão vazio', funcao: '' });
  mesa.por(plim(), it.plim, { g: -43, pan: 0.15, dist: 0.5, nome: 'plim (Lurdes desce)', origem: 'elevador', funcao: '' });
  mesa.por(desliza(0.8, 420, 801), it.abre, { g: -42, pan: 0.15, dist: 0.5 });
  mesa.por(desliza(0.8, 400, 802), it.fecha, { g: -42, pan: 0.15, dist: 0.5 });
  passos(it.vem, 805, 0.3, -31, 'passos da Lurdes até o balcão', () => -0.1, 'Lurdes');
  mesa.por(bzzz(0.6), it.botao, { g: -3, pan: -0.3, dist: 0.2, nome: 'BZZZ: A LURDES ABRE A PORTA PARA ELE', origem: 'botão do balcão', funcao: 'o efeito mais alto do episódio' });
  mesa.por(trava(820), it.abrePorta, { g: -26, pan: 0.6, dist: 0.5 });
  mesa.por(desliza(0.7, 700, 821), it.abrePorta, { g: -33, pan: 0.6, dist: 0.5 });
  passos(it.entra, 830, 0.6, -31, 'passos dele entrando', () => 0.3, 'Arlindo');
  mesa.por(papelSaco(840), it.entra.t0 + 0.2, { g: -36, pan: 0.5, dist: 0.4 });
  mesa.por(desliza(0.6, 700, 841), it.fechaPorta, { g: -35, pan: 0.6, dist: 0.5 });
  mesa.por(clack(842), it.portaFechada, { g: -30, pan: 0.6, dist: 0.5 });
  const rs = m.rs;
  mesa.por(peca(1050, 850), rs.bomdiaA, { g: -37, pan: 0.05, dist: 0.2, nome: '"Bom dia." dele (fim)', origem: 'Arlindo', funcao: '' });
  mesa.por(peca(1180, 851, 1.1, 0.018), rs.bomdiaL, { g: -37, pan: -0.15, dist: 0.2, nome: '"Bom dia." dela (fim)', origem: 'Lurdes', funcao: 'ninguém fica sem resposta' });
  mesa.por(encaixe(), rs.encaixe, { g: -28, pan: 0, dist: 0.15, nome: 'ENCAIXE FINAL', origem: 'entre os dois', funcao: '' });
  mesa.por(papelSaco(852, 0.5), rs.pega, { g: -29, pan: -0.05, dist: 0.2, nome: 'saco de pão passa para ela', origem: 'saco de papel', funcao: 'contato' });
  // fim: a rua e o relógio somem no preto
}

module.exports = { som };
