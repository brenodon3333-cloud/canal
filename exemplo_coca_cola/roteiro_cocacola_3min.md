> **Exemplo real** feito com este pacote (vídeo vertical de 2:55). Os arquivos de imagem, áudio e vídeo não vêm no pacote; o código da edição está em `skills/video-por-referencia/modelo_remotion/src/Video_exemplo_coca_cola.tsx`.

# Roteiro — "Coca-Cola: de remédio a império" (≈ 3 min, vertical 9:16)

**Base:** documentário da MagnatesMedia sobre a Coca-Cola (estrutura, gancho, vinheta de capítulo, paleta) + movimentos dos vídeos EarnEdits e Rivinity (texto palavra por palavra com desfoque, odômetro de anos, recortes, marca-texto, linha que carrega objetos, flashes de luz).
As análises de referência ficam na pasta `referencia/` de cada projeto (não vêm no pacote: são quadros de vídeos de terceiros).

**Duração:** 448 palavras de narração (≈ 2min50s no ritmo da referência, 155 palavras/min) + 4 vinhetas de 1,5 s + pausas dramáticas ≈ **3 min**. Os tempos abaixo são o alvo; depois da narração gravada, a gente encaixa cada cena no tempo real da voz.

**Paleta:** vermelho Coca (≈ #E61D2B), preto, branco, papel off-white; fotos de arquivo em sépia/P&B.
**Fontes:** palavra-chave gigante em sem serifa extra grossa (Montserrat Black); legenda pequena em serifada itálica (estilo EarnEdits) ou sem serifa fina.
**Regra de ouro:** nenhum quadro parado. Mínimo: push-in de 3–5% + grão de filme. Na introdução, troca visual a cada 0,7–1 s; no resto, a cada 1–2 s.

## Formato: VERTICAL 9:16 (Shorts / Reels / TikTok)

- **Resolução:** 1080x1920, 30 fps (igual aos vídeos EarnEdits e Rivinity).
- **Limite do Shorts: 3:00 cravado.** Exportar com no máximo **2:58**. Por isso as vinhetas de capítulo no vertical duram **1 s** (não 2 s).
- **Áreas seguras:** nada de texto nos **25% de baixo** (legenda do app, nome do canal), nos **15% da direita** (botões de curtir/comentar) e nos **10% de cima**. Texto importante fica no miolo, entre 15% e 70% da altura.
- **Palavra gigante:** no máximo 2 linhas e ~9 letras por linha. Palavras longas quebram ou diminuem (ex.: "REFRIGE-/RANTE" ou fonte menor).
- **Legenda da narração:** é o próprio texto palavra por palavra com desfoque (estilo EarnEdits/Rivinity), em ~60% da altura. Não precisa de outra legenda por cima.
- **Moldura de tampinhas:** fileiras de tampinhas em cima e embaixo (podem ficar nas áreas "não seguras", são só decoração); a faixa preta do meio carrega o texto.
- **Imagens 16:9 (arquivo, filmagens antigas):** nunca com barra preta. Ou corta no centro com pan lateral lento, ou coloca dentro de uma TV/projetor/moldura no meio da tela com o fundo desfocado da mesma imagem.
- **Mapas:** recortar só a região que importa e mover a câmera na vertical.
- **Retrato em círculo + nome:** círculo no terço de cima, nome em serifada grande cruzando a parte de baixo do círculo.
- **Primeiro segundo:** no vertical a pessoa decide em 1 s se fica. Desde o quadro 1 aparece o texto **"A história que a Coca-Cola não conta"** junto com a tampinha estourando.
- **Loop:** o vídeo termina com o mesmo "pssst" do começo, e o último quadro (tampinha) emenda no primeiro, então quem assiste até o fim tende a rever.

**Se a narração passar de 2:52**, cortar nesta ordem (sem perder a história):
1. "protestos, abaixo-assinados" (cap. 4)
2. "E a cocaína? Já tinha saído da receita." (cap. 2)
3. "desde um ferimento de batalha" (cap. 1)

## Mapa de tempo REAL (narração gravada — voz Arthur)

No projeto original, os áudios ficavam em `audio/narracao/` (um por bloco). Os tempos das tabelas abaixo eram estimativas: **na montagem vale este mapa**, e o tempo exato de cada palavra está em `audio/narracao/legendas/palavras_com_tempo.json` (e um `.srt` por bloco).

| Bloco | Arquivo | Duração | Na linha do tempo |
|---|---|---|---|
| Intro | `01_intro.mp3` | 28,0 s | 0:00,0 – 0:28,0 |
| Vinheta Cap. 1 | `garrafa_abrindo_pssst.mp3` + whoosh | 1,0 s | 0:28,0 – 0:29,0 |
| Cap. 1 | `02_cap1_como_tudo_comecou.mp3` | 32,6 s | 0:29,0 – 1:01,6 |
| Vinheta Cap. 2 | | 1,0 s | 1:01,6 – 1:02,6 |
| Cap. 2 | `03_cap2_a_ascensao.mp3` | 40,7 s | 1:02,6 – 1:43,3 |
| Vinheta Cap. 3 | | 1,0 s | 1:43,3 – 1:44,3 |
| Cap. 3 | `04_cap3_a_guerra.mp3` | 28,0 s | 1:44,3 – 2:12,3 |
| Vinheta Cap. 4 | | 1,0 s | 2:12,3 – 2:13,3 |
| Cap. 4 | `05_cap4_o_maior_desastre.mp3` | 25,6 s | 2:13,3 – 2:38,9 |
| Fechamento | `06_fechamento.mp3` | 14,3 s | 2:38,9 – 2:53,2 |
| "Pssst" final (loop) | | 0,8 s | 2:53,2 – **2:54,0** |

**Total: ~2:54** (limite do Shorts: 3:00). Não precisa mais cortar frases.

Como a narração foi feita: geração no ElevenLabs v4 (via Higgsfield), depois pausas longas encurtadas e fala acelerada **1,2x** sem mudar o tom (a intro em 1,15x, para "Ela **vende** uma ideia" ficar clara). Ritmo final ≈ 160 palavras/min, o mesmo da abertura da referência. 

---

Legenda das colunas: **Fala** = narração · **Tela** = imagem + movimento · **Texto** = o que aparece escrito · **Som** = trilha e efeitos (SFX).

---

## INTRODUÇÃO — gancho (0:00 – 0:30)

> Todo ano, a Coca-Cola gasta bilhões em propaganda… e quase nunca tenta te vender o refrigerante. Ela vende uma ideia. Felicidade. Família. Momentos. Mas por trás dessa garrafa existe uma história que quase ninguém conhece. Cocaína. Guerra. Um contrato de um dólar. E o maior erro da história do marketing. Então aperta o cinto: em três minutos, você vai entender como água com açúcar virou o império mais reconhecido do planeta.

| Tempo | Fala | Tela / movimento | Texto | Som |
|---|---|---|---|---|
| 0:00–0:01 | — | Preto. Tampinha de garrafa gira em close e estoura em direção à câmera | **A história que a Coca-Cola não conta** (fica até 0:02) | **"Pssst" de garrafa abrindo** + bolhas; trilha entra com pulso grave |
| 0:01–0:02 | "Todo ano, a Coca-Cola…" | Logo em contorno fino se desenha (traço animado) e enche de branco sobre vermelho | — | Impacto (hit) quando o logo enche |
| 0:02–0:04 | "…gasta bilhões em propaganda…" | Notas de dólar caem em câmera lenta, em camadas (as da frente desfocadas passando rápido) | Legenda pequena: "gasta **bilhões** em propaganda" → palavra gigante **BILHÕES** | Whoosh + chuva de moedas leve |
| 0:04–0:06 | "…e quase nunca tenta te vender o refrigerante." | Garrafa de vidro sobe pelo meio e **corta a palavra REFRIGERANTE** ao meio (estilo MagnatesMedia) | **REFRIGERANTE** riscado em vermelho | Corte de vidro / swipe |
| 0:06–0:07 | "Ela vende uma ideia." | Entra a **nossa moldura**: faixa preta no meio, fileira de tampinhas vermelhas girando em cima e embaixo. Lâmpada ilustrada (cartum P&B) acende no centro | "uma **ideia**" | Clique de lâmpada + zumbido elétrico |
| 0:07–0:08 | "Felicidade." | Lâmpadas se multiplicam (1 → 5) e deslizam para os lados | **FELICIDADE** | Hit curto |
| 0:08–0:09 | "Família." | Recorte vintage de família brindando entra com escala | **FAMÍLIA** | Hit curto |
| 0:09–0:10 | "Momentos." | Mãos brindando garrafas, congela 4 quadros e segue | **MOMENTOS** | Hit + tilintar de vidro |
| 0:10–0:12 | "Mas por trás dessa garrafa…" | Câmera atravessa a garrafa (vidro desfocado em primeiro plano) e o fundo fica escuro | "por trás dessa **garrafa**" palavra por palavra (blur → nítido) | Trilha cai para só o grave; riser começa |
| 0:12–0:15 | "…existe uma história que quase ninguém conhece." | Ilustração P&B de rosto assustado (cartum anos 50) entra da esquerda; olhos tremem | "**quase ninguém** conhece" | Riser |
| 0:15–0:16 | "Cocaína." | Folha de coca ilustrada em traço branco se desenha, flash vermelho | **COCAÍNA** (glitch rápido) | Impacto pesado |
| 0:16–0:17 | "Guerra." | Silhueta de soldado com capacete cruza a tela em parallax | **GUERRA** | Impacto + tambor militar |
| 0:17–0:19 | "Um contrato de um dólar." | Nota de 1 dólar gira e vira um contrato antigo; carimbo cai | **US$ 1** (odômetro rolando 1.000.000 → 1) | Moeda + carimbo |
| 0:19–0:22 | "E o maior erro da história do marketing." | Lata de New Coke (recorte) treme, racha e quebra em pedaços | "o maior **ERRO**" | Vidro/metal quebrando, trilha para de vez (0,3 s de silêncio) |
| 0:22–0:24 | "Então aperta o cinto:" | Estrada com linhas de velocidade (speed lines) correndo para o centro | **APERTA O CINTO** | Whoosh longo, trilha volta com tudo |
| 0:24–0:26 | "em três minutos, você vai entender…" | Contador de anos rolando rápido: 1886 → 1915 → 1941 → 1985 → 2026 | Odômetro **1886 → 2026** | Tique-taque acelerando |
| 0:26–0:28 | "…como água com açúcar…" | Close de líquido escuro sendo servido sobre gelo, câmera lenta | "água com **açúcar**" | Gelo tilintando, líquido |
| 0:28–0:30 | "…virou o império mais reconhecido do planeta." | Câmera recua: a garrafa vira um globo terrestre com pontos vermelhos acendendo no mundo todo | **IMPÉRIO** | Braam (impacto grave longo) → corte para silêncio de 0,5 s |

**VINHETA — Capítulo 1 (0:30–0:32):** onda branca varre o vermelho → "Capítulo 1" → garrafa sobe e corta o texto → subtítulo **"Como tudo começou"**. Som: "pssst" de garrafa + whoosh. *(Mesma vinheta em todos os capítulos.)*

---

## CAPÍTULO 1 — Como tudo começou (0:32 – 1:05)

> Atlanta, 1886. John Pemberton é farmacêutico, ex-soldado da Guerra Civil e viciado em morfina desde um ferimento de batalha. Ele quer criar um remédio — e copia o sucesso da época: um vinho misturado com folha de coca, a mesma planta da cocaína. Só que a cidade proíbe o álcool. Pemberton tira o vinho, coloca xarope de açúcar, noz-de-cola e água com gás. Nasce a Coca-Cola: vendida como tônico para os nervos, a cinco centavos o copo. Resultado do primeiro ano? Nove copos por dia.

| Tempo | Fala | Tela / movimento | Texto | Som |
|---|---|---|---|---|
| 0:32–0:34 | "Atlanta, 1886." | Número **1886** gigante e desfocado em primeiro plano; câmera atravessa o número e revela rua antiga em sépia | "Atlanta, **1886**" | Trilha B entra (piano antigo + chiado de vinil) |
| 0:34–0:37 | "John Pemberton é farmacêutico…" | Retrato de Pemberton em **círculo**, nome em serifada enorme cruzando a foto, flash de luz âmbar na entrada | **JOHN PEMBERTON** | Flash + whoosh |
| 0:37–0:40 | "…ex-soldado da Guerra Civil e viciado em morfina…" | Recorte de Pemberton sobre papel; **rótulos à mão com seta**: "ex-soldado", "morfina" | Rótulos manuscritos | Rabisco de caneta |
| 0:40–0:42 | "…desde um ferimento de batalha." | Ilustração de batalha (P&B) com zoom rápido + tremor | — | Tiro de canhão abafado |
| 0:42–0:45 | "Ele quer criar um remédio — e copia o sucesso da época:" | Prateleira de farmácia antiga, frascos em parallax (os da frente desfocados) | "um **remédio**" | Vidro tilintando |
| 0:45–0:48 | "…um vinho misturado com folha de coca…" | Diagrama em traço branco sobre preto se desenhando: VINHO + FOLHA DE COCA → frasco | VINHO · COCA | Clique em cada ícone |
| 0:48–0:49 | "…a mesma planta da cocaína." | Folha de coca acende em vermelho | **COCAÍNA** | Hit |
| 0:49–0:51 | "Só que a cidade proíbe o álcool." | Recorte de jornal antigo, **marca-texto amarelo** correndo sob "PROIBIÇÃO" | **PROIBIDO** (carimbo) | Carimbo |
| 0:51–0:55 | "Pemberton tira o vinho, coloca xarope de açúcar, noz-de-cola e água com gás." | Vinho é arrastado pra fora do quadro; entram 3 ícones um por palavra (açúcar, noz-de-cola, bolhas) | Cada ingrediente palavra por palavra | Pop a cada ícone |
| 0:55–0:57 | "Nasce a Coca-Cola:" | Copo é servido em câmera lenta; logo antigo (1886) se escreve à mão | **COCA-COLA** | Fizz + hit |
| 0:57–1:00 | "…vendida como tônico para os nervos…" | Anúncio antigo (domínio público) com câmera deslizando inclinada | "tônico para os **nervos**" | — |
| 1:00–1:02 | "…a cinco centavos o copo." | Moeda de 5 centavos cai girando e para | **5¢** | Moeda no balcão |
| 1:02–1:05 | "Resultado do primeiro ano? Nove copos por dia." | 9 copos aparecem um a um num balcão vazio; câmera recua mostrando a farmácia vazia | Contador **0 → 9** | Pausa de 0,3 s antes do "nove"; som de grilo leve (humor) |

**VINHETA — Capítulo 2: "A ascensão" (1:05–1:07)**

---

## CAPÍTULO 2 — A ascensão (1:07 – 1:50)

> Dois anos depois, Pemberton morre quase sem dinheiro. Quem fica com a fórmula é Asa Candler, que paga cerca de dois mil e trezentos dólares por tudo. E ele entende o segredo: o produto é o de menos. Cupons de bebida grátis, o logo pintado em muros, relógios, calendários… a marca em todo lugar. Em 1899, dois advogados pedem o direito de engarrafar a bebida. Candler acha que garrafa não tem futuro — e vende esse direito por um dólar. Um. Dólar. Foi o contrato que espalhou a Coca pelo mundo. Em 1915, nasce a garrafa curvilínea, feita pra ser reconhecida até no escuro. E a cocaína? Já tinha praticamente saído da receita.

| Tempo | Fala | Tela / movimento | Texto | Som |
|---|---|---|---|---|
| 1:07–1:10 | "Dois anos depois, Pemberton morre quase sem dinheiro." | Lápide com o retrato de Pemberton em parallax, névoa passando na frente | **1888** (odômetro 1886 → 1888) | Trilha baixa |
| 1:10–1:13 | "Quem fica com a fórmula é Asa Candler…" | Retrato de Candler em círculo + nome gigante cruzando; flash vermelho | **ASA CANDLER** | Flash + whoosh |
| 1:13–1:16 | "…que paga cerca de dois mil e trezentos dólares por tudo." | Notas antigas empilhando; contador subindo | **US$ 2.300** | Caixa registradora |
| 1:16–1:19 | "E ele entende o segredo: o produto é o de menos." | Garrafa encolhe no centro enquanto o logo cresce atrás até tomar a tela | "o produto é o **de menos**" | Riser curto |
| 1:19–1:24 | "Cupons de bebida grátis, o logo pintado em muros, relógios, calendários…" | Sequência rápida, **1 imagem por palavra**: cupom, muro pintado, relógio, calendário (anúncios antigos em domínio público) | Cada palavra pisca no ritmo | Clique de câmera em cada troca |
| 1:24–1:26 | "…a marca em todo lugar." | Mosaico: as 4 imagens se multiplicam até encher a tela de logos | **EM TODO LUGAR** | Hit |
| 1:26–1:30 | "Em 1899, dois advogados pedem o direito de engarrafar a bebida." | Odômetro **1899**; recortes de dois homens de terno entram dos lados, garrafa entre eles | "direito de **engarrafar**" | Trilha muda para swing/pizzicato animado |
| 1:30–1:33 | "Candler acha que garrafa não tem futuro…" | Candler (recorte) dá de ombros; garrafa vai para uma lixeira (transição física, estilo EarnEdits) | "garrafa **não tem futuro**" | Lata caindo na lixeira |
| 1:33–1:35 | "…e vende esse direito por um dólar." | Contrato antigo, **marca-texto amarelo** em "US$ 1" | — | Caneta assinando |
| 1:35–1:37 | "Um. Dólar." | Duas batidas: **UM** / **DÓLAR** em tela cheia, branco sobre preto, cada um com zoom-punch | **UM.** **DÓLAR.** | Dois impactos secos, trilha some entre eles |
| 1:37–1:41 | "Foi o contrato que espalhou a Coca pelo mundo." | **Linha que carrega os objetos** (estilo Rivinity): a linha atravessa um mapa e fábricas de engarrafamento vão brotando ao longo dela | "espalhou pelo **mundo**" | Whoosh contínuo + pops |
| 1:41–1:44 | "Em 1915, nasce a garrafa curvilínea…" | Odômetro **1915**; garrafa se desenha em traço branco e gira em 3D | **1915** | Hit cristalino |
| 1:44–1:47 | "…feita pra ser reconhecida até no escuro." | Tela fica preta; uma mão tateia e a silhueta da garrafa acende só pelo contorno | "até no **escuro**" | Trilha cai, só respiração/ambiente |
| 1:47–1:50 | "E a cocaína? Já tinha praticamente saído da receita." | Folha de coca do cap. 1 aparece e é **riscada** com X vermelho | "**praticamente** saído" | Risco de caneta + hit |

**VINHETA — Capítulo 3: "A guerra" (1:50–1:52)**

---

## CAPÍTULO 3 — A guerra (1:52 – 2:20)

> 1941. Os Estados Unidos entram na Segunda Guerra, e o chefe da empresa, Robert Woodruff, faz uma promessa: todo soldado americano vai ter uma Coca por cinco centavos, onde quer que esteja. Fábricas são montadas perto das frentes de batalha, e milhões de soldados voltam pra casa apaixonados pela marca. Enquanto isso, na Alemanha, sem o xarope americano, a filial inventa outra bebida com sobras da indústria de alimentos. O nome? Fanta.

| Tempo | Fala | Tela / movimento | Texto | Som |
|---|---|---|---|---|
| 1:52–1:55 | "1941. Os Estados Unidos entram na Segunda Guerra…" | Odômetro **1941**; filmagem de arquivo colorizada de soldados, grão forte | **1941** | Trilha C: caixa militar + cordas |
| 1:55–1:58 | "…e o chefe da empresa, Robert Woodruff…" | Retrato de Woodruff em círculo + nome cruzando | **ROBERT WOODRUFF** | Flash |
| 1:58–2:03 | "…faz uma promessa: todo soldado americano vai ter uma Coca por cinco centavos, onde quer que esteja." | Texto sendo **digitado em máquina de escrever** sobre papel; câmera acompanha a linha | "todo soldado… **5¢**… onde quer que esteja" | Máquina de escrever + sino no fim da linha |
| 2:03–2:07 | "Fábricas são montadas perto das frentes de batalha…" | Mapa da Europa/Pacífico em bege; pontos vermelhos acendendo com círculos de radar | Contador **0 → 64 fábricas** | Pops de radar |
| 2:07–2:10 | "…e milhões de soldados voltam pra casa apaixonados pela marca." | Arquivo: soldados bebendo de garrafas, sorrindo; transição por flash quente | **MILHÕES** | Trilha sobe |
| 2:10–2:13 | "Enquanto isso, na Alemanha, sem o xarope americano…" | Mapa gira para a Alemanha; a linha de abastecimento é **cortada** por uma tesoura | "**sem** o xarope" | Tesoura + trilha escurece |
| 2:13–2:17 | "…a filial inventa outra bebida com sobras da indústria de alimentos." | Recortes de maçã, soro de leite e frascos caindo num caldeirão ilustrado | "**sobras**" | Borbulhar |
| 2:17–2:20 | "O nome? Fanta." | Pausa de 0,4 s em preto → garrafa laranja explode em cor no meio da tela P&B | **FANTA** | Silêncio → impacto + fizz |

**VINHETA — Capítulo 4: "O maior desastre" (2:20–2:22)** *(versão com glitch vermelho, como no capítulo sombrio da referência)*

---

## CAPÍTULO 4 — O maior desastre (2:22 – 2:48)

> Anos 80. A Pepsi começa a vencer em testes cegos de sabor. E a Coca faz o impensável: em 1985, muda a fórmula. Nasce a New Coke. O público reage como se tivessem roubado sua infância — mais de mil ligações furiosas por dia, protestos, abaixo-assinados. Setenta e nove dias depois, a empresa recua e traz a original de volta. E a Coca… voltou ao topo.

| Tempo | Fala | Tela / movimento | Texto | Som |
|---|---|---|---|---|
| 2:22–2:25 | "Anos 80. A Pepsi começa a vencer em testes cegos de sabor." | Dois copos brancos lado a lado, com "?" entre eles; um deles sobe num gráfico | "testes **cegos**" | Trilha D: tensão eletrônica, tique-taque |
| 2:25–2:27 | "E a Coca faz o impensável:" | Câmera avança devagar sobre um cofre se abrindo (a fórmula secreta) | "o **impensável**" | Engrenagens do cofre |
| 2:27–2:29 | "em 1985, muda a fórmula." | Texto da fórmula sendo **digitado e apagado** com seleção azul de editor (estilo EarnEdits) | **1985** · "FÓRMULA" selecionada e deletada | Teclas + "delete" |
| 2:29–2:31 | "Nasce a New Coke." | Lata da New Coke cai do alto e quica no centro; glitch | **NEW COKE** | Lata batendo + glitch |
| 2:31–2:35 | "O público reage como se tivessem roubado sua infância…" | Arquivo de protestos (P&B, contraste alto), câmera tremendo levemente | "roubado sua **infância**" | Multidão gritando abafada |
| 2:35–2:39 | "…mais de mil ligações furiosas por dia, protestos, abaixo-assinados." | Ícones de telefone, cartas e cartazes se empilhando até cobrir a tela; contador de ligações subindo | Contador **400 → 1.500/dia** | Telefones tocando em camadas |
| 2:39–2:43 | "Setenta e nove dias depois, a empresa recua e traz a original de volta." | Calendário arrancando folhas rapidamente até **79**; lata vermelha "Classic" volta deslizando | **79 DIAS** | Folhas arrancando → hit |
| 2:43–2:45 | "E a Coca…" | Gráfico em traço vermelho parado, a câmera chega perto | — | Trilha some (0,5 s de silêncio) |
| 2:45–2:48 | "…voltou ao topo." | A linha do gráfico **explode para cima** e passa a linha da Pepsi | **DE VOLTA AO TOPO** | Impacto + trilha triunfal |

---

## FECHAMENTO (2:48 – 3:00)

> Hoje, a Coca-Cola está em mais de 200 países e é servida mais de dois bilhões de vezes por dia. Tudo começou com nove copos… e com uma lição que ela nunca esqueceu: ninguém compra refrigerante. A gente compra um sentimento.

| Tempo | Fala | Tela / movimento | Texto | Som |
|---|---|---|---|---|
| 2:48–2:51 | "Hoje, a Coca-Cola está em mais de 200 países…" | Globo girando, países acendendo em vermelho; **chips** surgindo empilhados (estilo EarnEdits) | **200+ PAÍSES** | Pops de interface |
| 2:51–2:54 | "…e é servida mais de dois bilhões de vezes por dia." | Contador rolando rápido até 2.200.000.000 | **2,2 BILHÕES / DIA** | Odômetro |
| 2:54–2:56 | "Tudo começou com nove copos…" | Corta para o balcão da farmácia de 1886 com os 9 copos (eco da cena 1:02) | **9** | Trilha cai, piano antigo volta |
| 2:56–2:58 | "…e com uma lição que ela nunca esqueceu: ninguém compra refrigerante." | Garrafa original numa **moldura dourada de museu**, câmera recuando | "ninguém compra **refrigerante**" | — |
| 2:58–3:00 | "A gente compra um sentimento." | A moldura some num flash de luz; logo final + "pssst" de garrafa abrindo | **UM SENTIMENTO** | **"Pssst" fecha o vídeo** (mesmo som da primeira cena) |

---

## Música de fundo

A referência usa trilha escura de tensão na abertura com impacto em cada palavra e silêncio antes da vinheta. Plano:

| Trecho | Clima | O que buscar |
|---|---|---|
| Intro (0:00–0:30) | Trailer escuro, pulsante, 110–120 BPM, com impactos e riser | "dark cinematic trailer pulse", "hybrid trailer hits" |
| Cap. 1 | Antigo, curioso | "vintage piano ragtime" + chiado de vinil |
| Cap. 2 | Animado, ascensão, investigativo | "swing pizzicato investigative", "upbeat documentary" |
| Cap. 3 | Guerra, marcial | "military snare strings", "WW2 documentary" |
| Cap. 4 | Tensão → vitória | "suspense ticking electronic" → "triumphant hit" |
| Fechamento | Emocional, crescendo curto | "cinematic emotional build" |

Fontes: Artlist (o conector já está ligado aqui — posso buscar faixas reais no próximo passo) ou Biblioteca de Áudio do YouTube (grátis). **Não usar jingles nem comerciais da Coca-Cola** — dá reivindicação de direitos autorais no YouTube.

**Efeitos (SFX) que se repetem:** garrafa abrindo ("pssst"), gelo no copo, whoosh, impacto grave (hit/braam), riser, moeda, carimbo, máquina de escrever, clique de câmera, glitch.

---

## Checagem de fatos (feita em 11/11/2026)

| # | Afirmação no roteiro | Resultado | Fonte |
|---|---|---|---|
| 1 | Pemberton: ex-soldado, ferido em batalha, viciado em morfina | ✅ Ferido a sabre na Batalha de Columbus (abril/1865), ficou dependente da morfina | [Wikipedia](https://en.wikipedia.org/wiki/John_Stith_Pemberton), [Military.com](https://www.military.com/veteran-jobs/coca-cola-was-result-of-wounded-soldier-trying-ease-his-own-pain.html) |
| 2 | Vinho com coca → cidade proíbe o álcool → troca por xarope | ✅ French Wine Coca; proibição local em Atlanta em 1886 | [Wikipedia](https://en.wikipedia.org/wiki/John_Stith_Pemberton) |
| 3 | 5 centavos o copo; média de 9 copos por dia no 1º ano | ✅ Confirmado pela própria empresa. Atenção: eram **copos** na máquina de refrigerante, não garrafas (a 1ª garrafa é de 1894) | [Coca-Cola Company](https://www.coca-colacompany.com/about-us/history/the-birth-of-a-refreshing-idea), [checagem Yahoo](https://uk.news.yahoo.com/fact-check-truth-behind-claims-130000012.html) |
| 4 | Pemberton morre quase sem dinheiro (1888); Candler paga ~US$ 2.300 | ✅ Morreu em 16/08/1888 "quase falido". US$ 2.300 é o total dado pela empresa (1888–1891); outras fontes dão valores parciais diferentes, por isso o "cerca de" | [Coca-Cola Company](https://www.coca-colacompany.com/about-us/history/the-asa-candler-era), [Georgia Encyclopedia](https://www.georgiaencyclopedia.org/articles/business-economy/asa-candler-1851-1929/) |
| 5 | 1899: dois advogados compram o direito de engarrafar por US$ 1 | ✅ Benjamin Thomas e Joseph Whitehead, advogados de Chattanooga. Candler duvidava das garrafas | [Wikipedia](https://en.wikipedia.org/wiki/Benjamin_Thomas_(industrialist)), [Tennessee Encyclopedia](https://tennesseeencyclopedia.net/?p=595) |
| 6 | A cocaína já tinha saído da receita em 1915 | ⚠️ **Corrigido.** A folha fresca saiu em 1903, mas ficaram traços até 1929. Agora diz "**praticamente** saído" | [Live Science](https://www.livescience.com/41975-does-coca-cola-contain-cocaine.html) |
| 7 | 1915: garrafa curvilínea, reconhecível no escuro | ✅ Concurso de 1915: garrafa reconhecível "só pelo tato" e até quebrada no chão; patente de 16/11/1915 | [Archives Foundation](https://www.archivesfoundation.org/documents/coca-cola-bottle-celebrating-100-years-american-icon), [National Archives](https://www.archives.gov/press/press-releases/2015/nr15-84.html) |
| 8 | 1941: Woodruff promete Coca a 5 centavos para todo soldado; fábricas perto das frentes | ✅ 64 fábricas enviadas para perto das zonas de combate (o contador agora mostra 64) | [Coca-Cola Canadá](https://www.coca-cola.ca/faqs/coca-cola-faqs-history/Was-coca-cola-consumed-by-soldiers-in-world-war-II), [Woodruff Arts Center](https://www.woodruff.org/about/robert-w-woodruff) |
| 9 | Fanta: Alemanha, sem xarope, feita com sobras | ✅ 1940, Max Keith, embargo; soro de leite e bagaço de maçã ("sobras das sobras") | [Wikipedia](https://en.wikipedia.org/wiki/Fanta), [The Local](https://www.thelocal.de/20170523/fanta-how-the-nazi-era-drink-became-the-world-famous-brand) |
| 10 | Pepsi vencendo testes cegos → New Coke em 1985 → volta em 79 dias | ✅ Pepsi Challenge desde 1975; New Coke em 23/04/1985; Classic de volta em 11/07/1985 (79 dias) | [History.com](https://www.history.com/news/cola-wars-pepsi-new-coke-failure), [Coca-Cola Company](https://www.coca-colacompany.com/about-us/history/new-coke-the-most-memorable-marketing-blunder-ever) |
| 11 | "Milhares de ligações por dia" | ⚠️ **Corrigido.** O dado confirmado é 1.500 por dia (antes eram 400). Agora diz "**mais de mil** ligações" | [Coca-Cola Company](https://www.coca-colacompany.com/about-us/history/new-coke-the-most-memorable-marketing-blunder-ever) |
| 12 | "E as vendas dispararam" | ⚠️ **Corrigido.** As fontes confirmam que a Classic voltou a liderar e passou a Pepsi em poucos meses, mas "dispararam" exagera. Agora diz "**voltou ao topo**" | [History.com](https://www.history.com/articles/cola-wars-pepsi-new-coke-failure) |
| 13 | Hoje: 200+ países, ~2 bilhões de vezes por dia | ✅ A empresa diz **2,2 bilhões** de doses por dia em mais de 200 países e territórios. Agora diz "**mais de** dois bilhões" | [Coca-Cola Company](https://www.coca-colacompany.com/about) |

## Sobre imagens e marca
- Fotos de Pemberton, Candler e Woodruff e anúncios anteriores a 1929 são de domínio público nos EUA.
- O logo da Coca-Cola é marca registrada: dá para mostrar num documentário que fala da marca, mas não usar como se fosse o nosso canal.
- A "parede de garrafas" é a assinatura da MagnatesMedia — por isso a nossa moldura usa **tampinhas girando**: mesma técnica, desenho nosso.
