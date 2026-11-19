// Elenco do prédio: altura desenhada fixa por personagem e escala por profundidade.
// Pedido do dono depois do ep01: a Lurdes não pode ficar do tamanho do Caio num plano e menor em outro.
//   escala = d * REF * ALTURA[nome] / NATIVO[vista]
//   d = (yPé − horizonte) / (yRef − horizonte)   (1 na linha de chão de referência do plano)
// REF é a altura do Caio em px com d = 1: 734 px, a do plano do elevador do ep01, que foi aprovado.
// NATIVO é a altura de cada desenho com escala 1, medida por motor/alturas.js (que avisa se mudar).
const REF = 734;
const ALTURA = { caio: 1.0, arlindo: 0.88, lurdes: 0.72 };
const NATIVO = { caioFrente: 773, caioCostas: 774, lurdesFrente: 530, lurdesCostas: 531, arlindoFrente: 668, arlindoCostas: 672 };
const nomeDe = (vista) => vista.replace(/(Frente|Costas)$/, '');
function profundidade(yPe, cena) { return (yPe - cena.horizonte) / (cena.yRef - cena.horizonte); }
function escala(vista, d) {
  const nome = nomeDe(vista);
  if (!(nome in ALTURA) || !(vista in NATIVO)) throw new Error(`vista sem altura: ${vista}`);
  return (d * REF * ALTURA[nome]) / NATIVO[vista];
}
// registro do que foi desenhado no quadro (motor/alturas.js lê para medir)
const registro = { ativo: false, quadro: [] };
module.exports = { REF, ALTURA, NATIVO, nomeDe, profundidade, escala, registro };
