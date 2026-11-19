// captura as duas texturas da música direto do som_ep (sem o resto da mixagem) e mede o padrão por colcheia no "celular"
const S = require('../../../motor/som'); const { montarTempo } = require('../../../motor/tempo');
const E = require('../episodio.js');
const T = montarTempo(E.blocos, require('../narracao/tempos.json'));
const cap = {};
const mesa = new S.Mesa(T.total + 0.3);
const orig = mesa.por.bind(mesa);
mesa.por = (x, t, o = {}) => { if (/música/.test(o.nome || '')) cap[o.nome] = { x: Float32Array.from(x), t, g: o.g || 0 }; };
mesa.porLeito = () => {};
E.som(mesa, T, S);
const cel = (x) => S.biquad(S.biquad(S.biquad(S.biquad(x, 'hp', 300), 'hp', 300), 'lp', 7000), 'lp', 7000);
for (const [nome, c] of Object.entries(cap)) {
  const y = cel(c.x), passo = Math.round(0.3 * S.SR), w = Math.round(0.02 * S.SR);
  const nivel = new Array(8).fill(0), cont = new Array(8).fill(0);
  for (let k = 0; (k + 1) * passo < y.length; k++) { let e = 0; for (let i = 0; i < w; i++) e += y[k * passo + i] ** 2; nivel[k % 8] += e; cont[k % 8]++; }
  const db = nivel.map((v, i) => 10 * Math.log10(v / cont[i] / w + 1e-12));
  const mx = Math.max(...db);
  console.log(nome.padEnd(48), db.map((v) => (v - mx).toFixed(0).padStart(4)).join(''));
}
