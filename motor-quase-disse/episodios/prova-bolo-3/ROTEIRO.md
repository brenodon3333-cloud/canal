# Prova 3 · "O bolo", sexta versão (34,7 s)

**A história** é a mesma da v5. Bia serve o primeiro bolo que fez. Nico prova, sente que está duro, procura uma resposta e decide sorrir. O elogio aparece escrito ("TÁ ÓTIMO."), treme e cai. A Bia vê a frase cair, entende e leva o prato de volta. Narração: "A Bia nunca tinha feito um bolo." · "O Nico prometeu ser sincero." · "Não precisou."

A v6 corrige o que o dono apontou na v5. Lista completa em `.kiro/artifacts/8-comparacao-v5-v6.md`.

## Planos e atuação

| bloco | plano | o que acontece |
|---|---|---|
| abre (1,0 s) | escuro | geladeira e relógio antes da imagem |
| l1 | **A** geral | O bolo grande fica atrás da Bia; a fatia já está servida num pratinho, longe dele. Ela olha, vira o braço para trás, pega a cereja do topo do bolo com dois dedos, traz e põe na fatia. Os dedos vão à borda do pratinho, erguem um pouco, ela se inclina, leva e pousa ao alcance do Nico. A mão fica na borda até o prato tocar a madeira e só então solta. |
| l2 | **A** geral | Bia junta as mãos sob o queixo. Depois da fala, Nico pega o garfo, corta a fatia e levanta um pedaço. **Fica um vão na fatia**, que continua visível até o fim. |
| mordida (3,9 s) | **B** close do Nico | igual à v5 (aprovada): garfo, olhar para ela, mordida, rosto parado, olhos sobem até ela |
| espera (2,6 s) | **C** close da Bia | igual à v5 (aprovada) |
| decide (4,9 s) | **B** | ele procura a resposta, toma ar, engole, sorri. "TÁ ÓTIMO." aparece perto do rosto, treme e cai |
| mesa (2,5 s) | **D** detalhe | a frase cai no pratinho. Só o "I" fica em cima da fatia, ao lado da cereja; as outras letras ficam de pé no prato, na frente da fatia, longe das mãos e da beira da mesa. O "Ó" escorrega pela borda do prato, rola na madeira até a frente do Nico, balança e **para de pé**. É a última letra a parar. |
| olhar (1,4 s) | **B** close do Nico | ele olha o "Ó" parado, solta o ar e pisca devagar. O olhar dele fecha a queda. |
| percebe (2,6 s) | **C** | os olhos dela estão nas letras, depois sobem até ele. O sorriso fica terno. |
| devolve (3,9 s) | **A** geral | um movimento só: ela olha o prato, aproxima a mão, alcança, segura a borda, ergue um pouco, traz para perto de si, pousa e solta. O braço tem o mesmo tamanho o tempo todo. As letras do prato vão junto; o "Ó" fica na mesa, na frente dele. |
| l3 | **A** | "Não precisou." |
| preto (1,2 s) | escuro | só o ambiente sumindo |

## Contato e som

Cada contato tem um instante único em `episodio.js` (`M.contatos`). O mesmo número comanda a imagem (a mão chega, o prato toca a madeira) e o som. O render grava a lista em `saida/prova-bolo-3/contatos_v6.json`, e a conferência compara cada contato com o som mais próximo.

| contato | som |
|---|---|
| dedos pegam a cereja | cabinho soltando |
| cereja na fatia | `fofo` (macio, cobertura) |
| dedos na borda do prato | `toque` (ponta de dedo em louça) |
| prato na mesa (entrega e volta) | `louca` (louça em madeira) |
| garfo: pega, encosta no prato | metal, 8 a 10 dB abaixo |
| mordida | o som mais alto da cena |
| letras no prato / na fatia | madeira leve em louça (−33 dB) / em cobertura (−31 dB) |
| "Ó" cai do prato na mesa | madeira em madeira (−33 dB), depois o rolar |
| "Ó" balança e para | três tiques, cada um quando o balanço passa pelo ponto de apoio |

## Braços

Os braços são calculados a partir do ombro (cinemática inversa, `personagens.js`, `resolverBracos`). Braço e antebraço têm comprimento fixo. Se um alvo fica fora de alcance, a mão para no limite e o relatório (`recorte.js ... --varrer`) mostra quantos pixels faltaram. A meta é 0 em todos os gestos. Para alcançar, os lugares e os objetos mudam; o braço nunca estica.

## Tempos ajustáveis

Em `episodio.js`: `blocos`, `MORD`, `DEC`, os gestos `M.c` (cereja e entrega), `M.g` (garfo) e `M.d` (devolução), e o desenho das letras em `letrasMundo`.
