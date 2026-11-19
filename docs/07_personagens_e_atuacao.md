# 07 · Personagens, expressões e atuação por código

Tudo aqui está **[TESTADO]** no Quase Disse, salvo quando marcado de outro jeito.

Arquivos de referência:
- `codigo/motor-quase-disse/episodios/ep01-elevador/personagens.js`: Lurdes e Caio, de frente, de perfil e em close.
- `codigo/motor-quase-disse/episodios/ep02-porteiro/personagens.js`: Seu Arlindo, as vistas de costas e a mão que escreve.
- `codigo/motor-quase-disse/motor/desenho.js`: as primitivas de desenho.
- `codigo/motor-quase-disse/motor/elenco.js` e `motor/alturas.js`: o tamanho fixo de cada personagem.

---

## 1. O traço: o "desenho em dois"

O contorno de tinta treme de leve a cada 1/12 s. Isso dá a sensação de animação desenhada à mão, feita "em dois" (um desenho a cada dois quadros, a 24 qps).

- `D.ferv.passo = Math.floor(t * 12)` é calculado em cada quadro, antes de desenhar.
- `treme(seed, k)` devolve um deslocamento pseudoaleatório. Ele é estável para o mesmo `seed`, o mesmo ponto `k` e o mesmo passo, e muda a cada passo:
  ```js
  const treme = (seed, k) => (hash(seed * 31.7 + k * 7.3 + ferv.passo * 13.1) - 0.5) * 2 * ferv.amp;  // amp = 1,6 px
  function hash(i) { let x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  ```
- **Cada forma tem um `seed` próprio e fixo**, por exemplo `{ seed: 612 }` no casaco da Lurdes. Por isso a mesma forma treme sempre do mesmo jeito: o personagem não "pisca" entre os quadros. **Nunca reutilize um seed** em duas formas que se tocam, ou elas tremem juntas e parecem coladas.
- `caminho(g, pts, fechado, seed, tremor)` liga os pontos com Catmull-Rom convertido em Bézier, o que deixa a curva suave.
- `forma(g, pts, cor, { seed, linha, reto, tinta })` preenche e contorna.
  - `reto: true` desenha um polígono de lados retos, para objetos de quina. Sem isso, a curva arredonda e estufa retângulos. Esse erro apareceu no bolo da prova.
- `traco(g, pts, largura, { seed, tinta, tremor })` desenha uma linha aberta.
- `membro(g, pts, largura, cor, { seed, borda })` desenha um braço ou uma perna: um traço de tinta mais largo por baixo e a cor por cima. O contorno tem espessura constante.
- `D.linhaK.k`: num plano detalhe com zoom, ponha `1/zoom`, para o contorno manter a mesma espessura na tela.
- `TINTA = '#17141f'` é a cor do contorno em todo o canal.
- `elipsePts(cx, cy, rx, ry, k, rot)` gera os pontos de uma elipse para passar a `forma`.

## 2. Estrutura de um personagem

Cada vista é uma função `nomeVista(g, x, y, pose)`:

- desenha com a origem nos **pés**, em `(x, y)`;
- usa a escala 1 nativa;
- devolve a posição final das mãos (`{ maos: [mE, mD] }`). A cena precisa disso para desenhar objetos presos na mão.

A **pose** é um objeto simples. Todo parâmetro tem um valor padrão, então `{}` desenha o personagem neutro.

| Parâmetro | Faixa | Efeito |
|---|---|---|
| `olhoX`, `olhoY` | −1 a 1 | Para onde as pupilas olham |
| `pupila` | 0 a 1 | Tamanho da pupila. Pequena (0,33 a 0,4) = susto ou tensão; 0,55 a 0,6 = ternura ou emoção |
| `palpS`, `palpI` | 0 a 1 | Pálpebra de cima e de baixo. Piscar = um pulso de 0,07 s em `palpS` |
| `sobr` | 0 a 1 | Sobrancelha sobe (surpresa) |
| `sobrInc` | 0 a 1 | Sobrancelha inclina para dentro (preocupação, pena) |
| `abre` | 0 a 1 | Boca aberta (fala, susto) |
| `cantoE`, `cantoD` | px | Cantos da boca: + sobe (sorriso), − desce |
| `cabRot` | rad | Inclinação da cabeça |
| `dy` | px | O corpo afunda ou sobe (tranco, engolir, respirar) |
| `rot` | rad | Inclinação do tronco |
| `maos` | `[{x,y}, {x,y}]` | Alvos das mãos no referencial do personagem. `null` = posição de descanso |
| `passo` | número ou `null` | Fase do andar (ciclos). `null` = parado |
| `gesto` | texto | Nome do gesto, para o relatório de alcance |
| Específicos | — | `fone` 0 a 1 (Caio), `sacola`, `chaves`, `quepe` (`'cabeca'`, `'mao'` ou `null`), `civil`, `sentado`, `brilho` (olho molhado), `lagrima`, `bigode` (tremor), `aperta` (lábios apertados), `mastiga`, `engole` |

**A ordem de desenho é a profundidade:** perna de trás, braço de trás, tronco, cabeça, objeto, braço da frente, perna da frente.
- No perfil, a perna "longe" é desenhada antes do tronco e a "perto", depois.
- As pernas ficam **fora da rotação do tronco**: inclinar o corpo não arrasta os pés.

**Silhueta que se lê de costas** **[APROVADO EM OUTRO CANAL]**:
- Lurdes: nuvem de cabelo grisalho, casaco lilás e uma sacola com alho-poró para fora.
- Caio: fone amarelo grande.
- Arlindo: quepe e bigode.

Cada personagem tem **um acento de cor** e a mesma paleta em todas as vistas: o objeto `COR` no topo do arquivo de personagens.

## 3. Braço e perna de tamanho fixo (cinemática inversa)

**Onde está o código:** a função `ik` **não fica em `motor/`**. Ela é copiada nos personagens de cada episódio:
- a versão abaixo vem de `episodios/ep01-elevador/personagens.js`, linha ~16, e é reaproveitada pelo ep02 via `require('../ep01-elevador/personagens')`;
- a prova `prova-bolo-3/personagens.js` tem uma variante mais antiga, `ik(S, alvo, Lu, Lf)`.

**[PROPOSTA]** Para o canal novo, mova a `ik` para `motor/ik.js` e use só uma versão.

É **regra do dono**. Se a mão não alcança, mude os lugares ou os objetos; nunca estique.

```js
function ik(S, alvo, L1, L2, dobra = 1) {          // S = ombro (ou quadril); L1, L2 = braço e antebraço
  const dx = alvo.x - S.x, dy = alvo.y - S.y;
  let d = Math.hypot(dx, dy) || 1e-6, falta = 0, H = { x: alvo.x, y: alvo.y };
  const max = L1 + L2 - 0.5;
  if (d > max) { falta = d - max; H = { x: S.x + (dx / d) * max, y: S.y + (dy / d) * max }; d = max; }
  d = Math.max(d, Math.abs(L1 - L2) + 1);
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));  // lei dos cossenos
  const base = Math.atan2(H.y - S.y, H.x - S.x);
  const E1 = { x: S.x + Math.cos(base + a) * L1, y: S.y + Math.sin(base + a) * L1 };
  const E2 = { x: S.x + Math.cos(base - a) * L1, y: S.y + Math.sin(base - a) * L1 };
  let E;                                            // qual das duas soluções do cotovelo
  if (dobra === 'frente') E = E1.x >= E2.x ? E1 : E2;       // joelho de perfil, para a frente
  else if (dobra === 'fora') E = Math.abs(E1.x) >= Math.abs(E2.x) ? E1 : E2;  // cotovelo para longe do corpo (vista de frente)
  else E = E1.y >= E2.y ? E1 : E2;                  // cotovelo para baixo (braço que pesa)
  return { S, E, H, falta };
}
```

- **`falta`** são os px que faltaram. Cada personagem chama `anota(pose.gesto, falta)`, e isso alimenta `FALTA = { max, porGesto }`.
- **Medidas usadas** (escala 1): braço da Lurdes 82 + 84 e perna 86 + 86; braço do Caio 112 + 112; braço do Arlindo 100 + 100.
- **Tronco inclinado:** converta o alvo da mão para o referencial do tronco antes de resolver:
  ```js
  function noTronco(alvo, piv, rot) { const x = alvo.x - piv.x, y = alvo.y - piv.y, c = Math.cos(-rot), s = Math.sin(-rot);
    return { x: piv.x + x * c - y * s, y: piv.y + x * s + y * c }; }
  ```
- **Sentado:** o quadril desce, e todos os alvos das mãos (que estão no referencial dos pés) descem junto. No Arlindo sentado: `sobe = quadril + 280`.
- **Verificar:** `node motor/varrer.js <ep> <t0> <t1>` desenha todos os quadros em miniatura e imprime cada instante com falta acima de 0,05 px. **Não pode imprimir nenhuma linha.** O relatório de cada render também lista a falta por gesto. Exemplo: `amostras/ep02-porteiro_relatorio_alcance_contatos.txt`.
- **Por que varrer todos os quadros:** no ep01, três faltas só apareceram no meio do movimento.
  - A mão ficou no encosto enquanto o corpo subia.
  - O cabo da vassoura passou por baixo do assento.
  - A perna de trás no passo do corredor.
  - Correções: soltar o encosto antes de o braço esticar; começar o cabo perto do teto; deixar o corpo afundar 4 px no passo, para a perna de trás não esticar.

## 4. A mão segura o objeto até soltar

- A posição do objeto e a da mão saem **da mesma conta**. Nunca anime os dois separadamente.
- **Para pegar:** a mão vai até o ponto de pega com `suave(fr(t, t0, t1))`. No instante do contato, o objeto passa a seguir a mão (a cena lê `r.maos[i]` devolvido pela função do personagem). Ao soltar, o objeto fica onde a mão deixou.
- **Exemplos no código:**
  - o saco de pão passa da mão do Arlindo para a da Lurdes no instante `rs.pega` (ep02, `cenaB`, "saco de pão");
  - a caneta (ep02, `escritaA`): estados `segura` / `larga` com posições de descanso (`REST_MESA`, `REST_TORTA`, `REST_FINAL`).
- **Verificar:** na revisão sem som, siga cada objeto que se move (docs/11).

## 5. Tamanho fixo de cada personagem e escala pela profundidade

Pedido do dono depois do ep01.

```js
// motor/elenco.js
const REF = 734;                                        // altura do Caio em px com d = 1 (plano do elevador aprovado)
const ALTURA = { caio: 1.0, arlindo: 0.88, lurdes: 0.72 };
const NATIVO = { caioFrente: 773, caioCostas: 774, lurdesFrente: 530, lurdesCostas: 531, arlindoFrente: 668, arlindoCostas: 672 };
const profundidade = (yPe, cena) => (yPe - cena.horizonte) / (cena.yRef - cena.horizonte);
const escala = (vista, d) => (d * REF * ALTURA[nome(vista)]) / NATIVO[vista];
```

**Como usar:**
- Cada cena tem um `horizonte` e uma linha de chão de referência `yRef`. No saguão do ep02: horizonte 470 e yRef 1000.
- Quem pisa na mesma linha tem a mesma escala, e quem está mais longe (pé mais alto) fica menor.
- **Sempre desenhe pela função `poe(g, it)`** (ep02), que calcula `s = escala(vista, profundidade(yPe))`, registra o personagem no quadro e desenha.

**Como criar um personagem novo:**
1. Desenhe a vista.
2. Rode `node episodios/ep02-porteiro/folha_personagens.js` (adapte para o episódio). Ele mede a altura nativa de cada vista em px e põe todos lado a lado na mesma linha.
3. Copie a altura medida para `NATIVO`.
4. Escolha a `ALTURA` relativa.
5. Confira a folha. Exemplo: `amostras/ep02_elenco_alturas.png`.

**Verificar:** `node motor/alturas.js <ep> [t0 t1] [--passo 3]`.
- Ele desenha cada personagem do quadro sozinho, com a pose e a escala daquele instante, e mede a altura.
- Divide pela profundidade e compara com a tabela (tolerância de 3%). Compara também a razão entre dois personagens no mesmo quadro.
- Resultado do ep02: maior desvio de 1,7% na tabela e de 1,8% na razão.
- Sentado e de quepe na mão ficam fora da conta, porque a altura muda de propósito.

## 6. Olhos, boca e o rosto em close

**Olho** (`D.olho`):
- Elipse branca, pupila de tinta com brilho e pálpebras de cima e de baixo, que cobrem com a cor da pele, mais uma linha.
- A pupila se move dentro de `(rx − raio) · 0,85`.
- O brilho da pupila só aparece com `pupila > 0,25`.

**Boca** (`D.boca`):
- Com `abre > 0,04`, vira uma forma com o interior `#5a1f2b`.
- Fechada, é um traço com os cantos subindo ou descendo.

**Close três-quartos:**
- É uma função separada, com escala de cerca de 4 vezes a do plano geral, origem no centro da cabeça e espessura de linha 7.
- O olho de lá é menor que o de cá (perspectiva).
- O nariz aponta para o lado do olhar.
- A orelha de lá desaparece atrás da cabeça.
- Exemplos: `lurdesClose`, `caioClose` e `arlindoClose`.

**Expressões que funcionaram** (a combinação de parâmetros):

| Emoção | Receita |
|---|---|
| Susto | `pupila` de 0,33 a 0,36; `sobr` 0,8; `cantoE`/`cantoD` −3; `dy` com mola; olhos para cima |
| Preocupação ou pena | `sobrInc` de 0,6 a 0,9; `cantoE`/`cantoD` −2 a −4; olhar baixo (`olhoY` de 0,5 a 0,8) |
| Entendimento ("caiu a ficha") | `sobr` e `sobrInc` sobem juntos em 0,3 s; `pupila` diminui; boca entreabre 0,2 por 0,25 s; depois engole |
| Emoção contida (ep02, leitura) | `brilho` 1 (olho molhado); `palpI` 0,16 (nunca 0,32, que parece sono); `bigode` treme; `aperta` 1; `pupila` 0,58; lágrima descendo em 2 s |
| Alívio ou sorriso leve | `cantoE`/`cantoD` de +2 a +4 em 0,4 s; `sobrInc` desce |
| Sonolência | `palpS` de 0,45 a 0,6 (evitar quando a intenção é emoção) |

**Erro corrigido:** no close da leitura, `palpI` 0,32 com pupila 0,5 fez o Arlindo parecer **com sono**, não emocionado. Isso só foi notado na thumbnail. Hoje: `palpI` 0,16 e pupila 0,58.

**O sorriso forçado** (prova do bolo) se lê como sorriso de verdade. O "forçado" vem só da pupila pequena e do tremor, e é sutil demais **[PENDENTE]**. Na comédia, exagere.

## 7. Movimento: tempo e curvas

Curvas (`motor/desenho.js`):
- `suave(t)`: smoothstep, para entradas e saídas suaves.
- `saida(t)`: desacelera.
- `entrada(t)`: acelera.
- `voltaAtras(t)`: passa do ponto e volta, para objetos que "aparecem" com vida.
- `mola(t, t0, freq, amort)`: oscilação amortecida depois de um impacto.
- `fr(t, a, b)`: a fração de `a` a `b`, presa entre 0 e 1.
- `chave(t, [[t, valor, curva?], …])`: quadros-chave genéricos.

**Receitas testadas:**
- **Piscar:** `pulso(t, t0, 0.07)` em `palpS`. Ponha piscadas nos momentos de pausa, a cada 2 a 5 s. Nunca no meio de uma reação forte.
- **A reação atrasada:** o som em `t0` e o rosto começando em `t0 + 0,22`.
- **Tranco:** `dy = 14 · e^(−7u) · cos(30u)`, com a amplitude reduzida para 0,4 depois de 0,3 s.
- **Mexer a cabeça no ritmo** (o Caio de fone): `bob = 0,05 · sen(2πt/0,6)`.
- **Respiração curta** (medo): inspira de 0,22 s e expira de 0,26 s, a cada 0,62 s, com som junto.
- **Olhar que segue:** quadros-chave em `olhoX`/`olhoY` com `chave()`. Os olhos chegam antes da cabeça.
- **Frase que balança como pêndulo:** `r = 0,34 · e^(−u/1,1) · sen(2π · 0,9 · u)`.

## 8. Andar

```js
// ep02: o trajeto é arredondado para meio-passos inteiros: o personagem para com os dois pés no chão
function trajeto(t0, ciclo, pontos) { /* cada trecho: k = round(distância / velocidade / (ciclo/2)) meio-passos */ }
function ondeEsta(tj, t) { /* x, yPe interpolados e passo = (t - t0)/ciclo durante o trecho; passo null parado */ }
```

- **A perna:** `lev = max(0, sen(passo · 2π + (i ? π : 0)))`. Cada pé sobe meio ciclo e fica no chão no outro meio.
- **O pé pousa** quando o seno volta a zero, a cada meio ciclo. **O som do passo é posto exatamente nesse instante.** `tj.passos` sai da mesma conta.
- **Ritmo:** Caio 0,9 s por ciclo, Lurdes 0,8 s, Arlindo 0,9 s. O ciclo de 0,4 s parecia corrida.
- **Limitação [PENDENTE]:** o andar mexe só as pernas. Não há balanço vertical do corpo, braço oposto nem virada em movimento. Para comédia, isso precisa evoluir (docs/15).
- **Profundidade ao andar:** a escala acompanha o `yPe` a cada quadro, sem mudança brusca. Saindo pela porta: vista de costas. Entrando: vista de frente.

## 9. Fala escrita como objeto

- **Peça de madeira:** Archivo Black com contorno de tinta de `0,16 · tamanho`, preenchimento `#fbf8f1` e pivô no topo quando está pendurada.
- **Entrada:** `voltaAtras(fr(t, t0, t0 + 0,18))`.
- **Balanço:** `y += 3 · sen(1,9t)`; `r = 0,02 · sen(1,3t)`.
- **Encaixe:** a resposta vem por baixo e para logo abaixo da outra, a `tamA/2 + tamB/2 + 2` px, com a mesma inclinação. No encaixe, as duas encolhem 8% por 0,2 s e somem em 0,26 s. O som é o clique de madeira (docs/10).
- **Letras que caem:**
  - cada letra é uma peça solta (`fileira()` calcula o centro de cada caractere);
  - a queda é `y = y0 + ½ · g · u²`, com `g = 3000 px/s²`;
  - o instante do contato com o chão é `t0 + √(2 · altura / g)`, e o som cai exatamente aí;
  - ao pousar, a letra deita em 0,12 s (achatamento vertical para 0,42) e gira um pouco;
  - **espaços não são peças**: não aparecem, não caem e não soam;
  - **espalhe as quedas a cada 0,11 s ou mais.** A 0,05 s, os sons se misturam e o ouvido não conta as letras.
- **Legibilidade:** pelo menos 40 px no plano geral e de 100 a 120 px no close. Com 30 px, a letra se lê só como "objeto branco".

## 10. Para o canal novo [PROPOSTA]

- **Protagonista porquinho-da-índia:** corpo redondo sem pescoço, orelhas pequenas, olhos enormes e um acento de cor forte (a decidir). A silhueta tem de se ler em 1 s e em 168 × 94 px.
- **Tamanho:** entra na tabela `elenco.js` como os outros. Se houver humanos no universo, a escala relativa fica definida desde o primeiro desenho.
- **Comédia exige** esticar e achatar o corpo (nunca o braço: a regra do tamanho fixo continua), poses-chave fortes, antecipação antes do movimento e exagero de expressão. Nada disso foi testado; é o objetivo do piloto.
- **Atuação escrita por nome:** a biblioteca de poses e expressões (docs/15) para não escrever 30 linhas de código por gesto.
