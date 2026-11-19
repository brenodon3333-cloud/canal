// MODELO MÍNIMO DE EPISÓDIO: copie esta pasta para começar um episódio novo.
// Mostra o contrato que motor/render.js espera: FPS, blocos, desenhar, som, contatos, relatorio.
// Um personagem simples aperta um botão na palavra "botão" da narração; o som do clique cai no mesmo instante.
const D = require('../../motor/desenho');
const { fr, suave, lerp, forma, traco, elipsePts, TINTA } = D;

const FPS = 24;
// blocos em sequência: com `dur` fixo, ou medidos pela fala (antes + duração da fala + depois)
const blocos = [
  { id: 'abre', dur: 1.0 },
  { id: 'aperta', fala: 'L1', antes: 0.6, depois: 1.6 },
];

let M = null;
function marcas(T) { // todos os instantes do episódio, calculados uma vez
  if (M) return M;
  const b = Object.fromEntries(blocos.map((x) => [x.id, T.B(x.id).ini]));
  M = { b, clique: T.W('L1', 'botão').ini };          // o contato fica preso à palavra, nunca a segundos fixos
  M.contatos = [{ nome: 'dedo aperta o botão', t: M.clique }];
  return M;
}

const BOTAO = { x: 1180, y: 640 };
function boneco(g, x, y, mao, olhoX) { // personagem mínimo: corpo, cabeça, olhos e um braço de tamanho fixo
  forma(g, elipsePts(x, y - 160, 90, 130, 14), '#c98a5a', { seed: 1 });
  forma(g, elipsePts(x, y - 330, 80, 75, 14), '#e0a774', { seed: 2 });
  D.olho(g, x - 25, y - 340, 13, 16, { lx: olhoX, pupila: 0.5, pele: '#e0a774', seed: 3 });
  D.olho(g, x + 25, y - 340, 13, 16, { lx: olhoX, pupila: 0.5, pele: '#e0a774', seed: 4 });
  const S = { x: x + 70, y: y - 220 }, L = 130;            // ombro e comprimento de cada segmento
  const dx = mao.x - S.x, dy = mao.y - S.y, d = Math.min(Math.hypot(dx, dy), 2 * L - 1);
  const a = Math.acos(d / (2 * L)), base = Math.atan2(dy, dx);
  const E = { x: S.x + Math.cos(base + a) * L, y: S.y + Math.sin(base + a) * L };   // cotovelo para baixo
  const H = { x: S.x + Math.cos(base) * d, y: S.y + Math.sin(base) * d };
  D.membro(g, [[S.x, S.y], [E.x, E.y], [H.x, H.y]], 34, '#c98a5a', { seed: 5 });
  forma(g, elipsePts(H.x, H.y, 18, 16, 9), '#e0a774', { seed: 6, linha: 4 });
}

function desenhar(g, t, T) {
  const m = marcas(T);
  g.fillStyle = '#2b2642'; g.fillRect(0, 0, 1920, 1080);
  g.fillStyle = '#1b1828'; g.fillRect(0, 820, 1920, 260);
  forma(g, [[BOTAO.x - 40, BOTAO.y - 40], [BOTAO.x + 40, BOTAO.y - 40], [BOTAO.x + 40, BOTAO.y + 40], [BOTAO.x - 40, BOTAO.y + 40]], '#8a92a3', { seed: 7, reto: true });
  const aceso = t >= m.clique;
  g.fillStyle = aceso ? '#ffd27a' : '#d6d9e0'; g.beginPath(); g.arc(BOTAO.x, BOTAO.y, 18, 0, 7); g.fill();
  const vai = suave(fr(t, m.clique - 0.45, m.clique)), volta = suave(fr(t, m.clique + 0.15, m.clique + 0.6));
  const descanso = { x: 1010, y: 700 };
  const mao = { x: lerp(lerp(descanso.x, BOTAO.x - 6, vai), descanso.x, volta), y: lerp(lerp(descanso.y, BOTAO.y, vai), descanso.y, volta) };
  // a reação vem 0,22 s depois do som
  const olha = suave(fr(t, m.clique + 0.22, m.clique + 0.4));
  boneco(g, 900, 820, mao, lerp(0.6, -0.2, olha));
  if (t < 0.4) { g.fillStyle = `rgba(0,0,0,${1 - t / 0.4})`; g.fillRect(0, 0, 1920, 1080); }
}

function som(mesa, T, S) {
  const m = marcas(T);
  const len = S.n(0.08);
  const clique = S.soma(S.env(S.seno(len, 2300), (t) => Math.exp(-t / 0.008)), S.escala(S.env(S.biquad(S.ruido(len, 3), 'hp', 3000), (t) => Math.exp(-t / 0.002)), 0.6));
  mesa.por(clique, m.clique, { g: -26, pan: 0.2, dist: 0.2, nome: 'CLIQUE DO BOTÃO', origem: 'botão', funcao: 'contato' });
  const sala = S.biquad(S.ruidoRosa(S.n(T.total + 0.3), 9), 'lp', 900);
  mesa.porLeito(sala, 0, () => S.dB(-42), () => 0, 0.4, { nome: 'tom da sala', origem: 'sala', dist: 0.7, pan: 0, funcao: 'leito' });
}

module.exports = { FPS, blocos, desenhar, som, contatos: (T) => marcas(T).contatos, relatorio: () => 'modelo: ' + M.contatos.map((c) => `${c.t.toFixed(3)} s ${c.nome}`).join('; '), ganhoVoz: 0, legendas: false, srt: true };
