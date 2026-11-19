# 04 · O que o canal Bovonel ensinou

O Bovonel foi o primeiro canal do dono: economia do dia a dia em motion graphics, "por que X custa o que custa no Brasil", com a promessa "a gente abre o preço e mostra quem fica com cada centavo".

Foram 6 vídeos produzidos entre 12 e 16/11/2026: gasolina, iPhone, conta de luz, carne, cerveja e passagem aérea.

- **Publicação: NÃO CONFIRMADA.** Nenhum print do YouTube Studio chegou. **Não existe dado de público.**
- Há narrações 7, 8 e 9 no pacote do Bovonel sem roteiro correspondente. Não se sabe se esses vídeos existiram **[INACESSÍVEL]**.

O código e os manuais estão em `codigo/referencia-bovonel/` **só como referência**: rodam no navegador (Playwright + Chromium) e não no motor atual.

O dono pediu: **"Vamos aproveitar o conhecimento, não copiar o formato."** O canal novo não herda o visual de motion graphic, a cor por fatia nem o formato editorial do Bovonel.

---

## 1. O que trazer para o canal novo

### 1.1 A animação entra na palavra da narração **[APROVADO EM OUTRO CANAL]**

- Frase do dono no vídeo 01 v2: "as coisas vão aparecendo de acordo com a voz", e ele disse que esse é "o principal".
- **Nunca animar antes de ter a voz.** O vídeo 01 v1 ficou "parado" e fora de ritmo justamente porque foi animado antes da narração.
- **No código:** `K("frase da narração")` devolve o segundo em que aquela frase começa. Cada número, gesto e efeito é marcado nesse instante. No motor atual, o equivalente é `T.W('L1', 'palavra')` (docs/09).

### 1.2 Método editorial

Fonte: o "Manual Mestre Integrado", resumido em `referencia-bovonel/manual-mestre.md`. O original está **[INACESSÍVEL]**.

**Regra principal:** preservar o padrão do canal e escolher **uma única melhoria principal por vídeo**, registrando qual foi.

**Pessoas antes da máquina:** em vez de "o algoritmo não gostou", perguntar: as pessoas certas viram motivo para clicar, continuar e ver o próximo?

**Retenção com alma:** a retenção é consequência do progresso. Não corte uma parte útil só porque é difícil. Primeiro deixe-a mais clara, mais gradual e mais visual.

**Hierarquia de decisão,** quando dois princípios brigam:
1. Verdade e coerência com a promessa.
2. Clareza para o público central.
3. Transformação e recompensa real.
4. Identidade humana e voz própria.
5. Progresso narrativo e retenção.
6. Consistência de formato.
7. Sofisticação técnica e efeitos.

**As sete perguntas antes de cada vídeo:**
1. Para qual pessoa este canal existe?
2. Qual transformação ela deve experimentar?
3. Por que clicaria neste vídeo agora?
4. Por que continuaria assistindo?
5. Qual problema mais profundo existe por baixo do assunto?
6. O que faz este vídeo parecer parte do mesmo canal?
7. Qual melhoria concreta vai para a próxima produção?

**Ficha de ideia:** cada ideia recebe nota de 0 a 2 em 8 critérios, total de 16.
- Os critérios: tem problema que o público sente; tem consequência; traz uma nova verdade; tem transformação; tem pergunta aberta; tem recompensa; é visual; sustenta a duração sem repetir.
- **"Tema não é ideia."** "Impostos" é tema. "Por que o iPhone custa o dobro no Brasil" é ideia com ângulo.
- Os exemplos preenchidos estão em `referencia-bovonel/ideias/`.

**Embalagem antes do roteiro:** título, thumbnail e os 30 primeiros segundos são uma peça só.
- 0 a 5 s: confirmar o clique.
- 5 a 15 s: uma situação reconhecível.
- 15 a 30 s: ampliar a promessa.
- Sem saudação longa.

**Esqueleto de roteiro (Modelo E):** gancho → reconhecimento → consequência → explicação → quebra de crença → exemplo → problema profundo → tensão máxima → virada → aplicação → recompensa → próximo passo. Use só os blocos que trazem clareza, conflito ou transformação.

**Revisão (Modelo F):**
- A primeira frase pode sair sem perda?
- O vídeo começa no assunto?
- Cada bloco acrescenta algo?
- O final responde à pergunta principal?

**Microganchos:**
- uma pergunta respondida no bloco seguinte;
- uma contradição;
- uma consequência ainda não explicada;
- um convite para o espectador adivinhar antes da revelação.

**Depois da publicação (Modelo H):**
1. Observar clique, retenção, a maior queda, os comentários e a continuidade.
2. Formular hipóteses.
3. Escolher uma melhoria e registrá-la.

### 1.3 "Roteiro que segura o público" **[APROVADO EM OUTRO CANAL]**

Esta regra nasceu de um feedback duro. O dono sobre o roteiro do vídeo 05: **"Muito repetitivo, não adianta ser mais longo se não faz o público continuar assistindo… ficando bom é o que importa."**

A Kiro mediu o que deu errado com `tools/repeticao.mjs`:
- "quatro reais" dito 6 vezes;
- a divisão 30/20/50 dita 3 vezes;
- a lista "malte, alumínio, energia" em 4 cenas;
- "imposto" 30 vezes;
- 8 frases começando com "E o…", 6 com "Mas" e 4 com "Ou seja".

As regras que ficaram, a partir do vídeo 06:

- **Cada número é dito uma vez.** Pode voltar uma única vez no fechamento, de outro jeito.
- **Cada bloco traz algo novo:** um fato, uma virada ou uma consequência. Se só reorganiza, sai.
- **Sem recapitulação no meio.** Um resumo curto só no fim.
- **Listas só uma vez.**
- **Variar a entrada das frases:** no máximo 3 frases começando com "E o", "Mas" ou "Então", e 2 com "Ou seja" ou "Agora", no vídeo todo.
- **Uma pergunta aberta por vez,** respondida no bloco seguinte.
- **Duração decidida pelo conteúdo.** Nada de meta de minutos.
- **Pesquisar até ter uma história:** uma pessoa, um lugar ou um caso que atravessa o vídeo, uma surpresa por bloco e as perguntas que as pessoas fazem nos comentários.
- **Ler em voz alta** pensando "em que segundo a pessoa largaria o vídeo?" e cortar ali.

### 1.4 Câmera e transições **[APROVADO EM OUTRO CANAL]**

- **"Achei a câmera meio paradona"** (vídeo 04). Regra: câmera sempre andando, com travelling, push-in lento, pan e tilt revelando, troca de enquadramento, paralaxe e deriva depois de cada movimento. Nunca o mesmo quadro parado por mais de ~3 s.
  - **Conflito com o Quase Disse:** lá o plano sustentado de 10 s foi aprovado. Para o canal novo **[PROPOSTA]**: câmera viva nos trechos de explicação e tentativa; plano parado só quando o parado é a piada ou a emoção, sempre com um gesto mínimo.
- **"Só exagerou nas transições"** (vídeo 04). Regra: transições discretas (corte seco, *push*, *match cut*) e no máximo uma transição de efeito por vídeo, numa virada forte.
- **Fórmula da câmera:** está documentada em docs/08, para trazer ao motor atual.

### 1.5 Som **[APROVADO EM OUTRO CANAL]**

- **"A música de fundo ficou alta, ela tem que ser mínima possível ou que quase não dê pra escutar ou nenhuma, porque o que manda é a narração e os efeitos sonoros"** (vídeo 04).
  - Regra: música pelo menos ~30 dB abaixo da voz, ou nenhuma. Na dúvida, nenhuma.
- **Medidas do vídeo 06:**
  - fundo (efeitos + ambiente) em média 22,6 dB abaixo da voz;
  - ambiente 33,7 dB abaixo;
  - pico 0,88.
- **Efeito sonoro com personalidade do tema** e silêncio antes das revelações.

### 1.6 Imagem **[APROVADO EM OUTRO CANAL]**

- **Objetos do mundo real com layout real:** cabeçalho, campos, letra miúda, código de barras, textura. A conta de luz desenhada como retângulo branco ficou "sem graça e fora da realidade" (vídeo 03).
- **Cada imagem precisa fazer sentido sem som.**
- **Não repetir soluções visuais** de vídeos anteriores: manter um catálogo (`catalogo-visual.md`). O ICMS mostrado igual nos vídeos 01 e 02 gerou essa regra.
- **Texto com hierarquia:** uma palavra de destaque, marca-texto, texto preso no objeto, entrada animada própria.
- **Pedido de inscrição com animação ligada ao tema,** que pareça um botão de verdade sendo apertado. Nunca o botão vermelho genérico.
- **Cada vídeo anuncia o próximo** no fechamento.

### 1.7 Qualidade e entrega **[APROVADO EM OUTRO CANAL]**

- "Qualidade antes do tamanho… se for mais que 10 [Mbps] também não tem importância."
  - Teste feito: a 2,4 Mbps aparecem blocos e texto borrado depois dos movimentos; a 12 Mbps fica limpo.
- **Revisão quadro a quadro antes de entregar,** pedida pelo dono.
- Na entrega: link e nome exato do arquivo, e o que foi conferido e corrigido.
- **"Aprimorar"** quer dizer análise profunda, procurando até o que ele não soube explicar.

### 1.8 Publicação **[APROVADO EM OUTRO CANAL]**

- 3 títulos e 3 thumbnails para usar no "Testar e comparar" do YouTube Studio.
- Título com a palavra de busca no começo e até ~60 caracteres.
- Thumbnail com até 4 palavras, um ponto focal e nunca o nome do canal.
- Descrição com capítulos (o primeiro em 0:00, cada um com pelo menos 10 s), fontes e tags de até 500 caracteres.
- Comentário fixado.
- Dias fixos aprovados no Bovonel: domingo 10h, terça e quinta 17h. **Para o canal novo, perguntar.**
- Pedir prints do Studio com 2 e 7 dias. **Nunca chegaram.** No canal novo, isso é prioridade (docs/12).

## 2. O que NÃO trazer

- O visual: azul-marinho, cor fixa por fatia, números com brilho, motion graphic com ícones.
- O formato "abrir o preço".
- **O motor de navegador** (Playwright + WebCodecs + gravador próprio). Ele existia porque aquele ambiente não tinha ffmpeg. O motor do Quase Disse, em Node com ffmpeg, é mais simples e já tem personagens.

## 3. Ferramentas do Bovonel que valem a pena portar

Estão em `codigo/referencia-bovonel/tools/`. O plano está em docs/15.

| Ferramenta | O que faz | Por que portar |
|---|---|---|
| `qa.mjs` | Intercepta cada `fillText` e guarda a caixa do texto depois da câmera. Acusa texto CORTADO (fora do quadro), SOBREPOSTO (mais de 12% sobre outro texto) e na faixa de legenda. Ignora os primeiros 0,6 s e os últimos 0,5 s de cada cena e problemas com menos de 0,4 s. | No canal novo haverá muito texto em cena (prancheta, veredito, falas escritas) |
| `repeticao.mjs` | Mede números ditos mais de uma vez, entradas de frase repetidas ("E o", "Mas"…), palavras demais e frases parecidas entre cenas | O roteiro do vídeo 05 mostrou o problema |
| `fx.js`: `evalCam`, `liveCam`, `layer` | Câmera com quadros-chave, deriva depois de chegar, respiração e tremida nos impactos | O motor atual tem só um zoom lento por plano |
| `alinhar.mjs` | Alinhamento sem reconhecimento de voz, por programação dinâmica sobre os blocos de fala | Só como reserva. O Whisper é mais preciso em fala contínua (docs/10) |
| `folhas.mjs` | Folhas de contato a cada 0,5 s | O motor atual já faz isso com ffmpeg `tile` |
| `thumbs.mjs` | Thumbnail desenhada com os desenhos do próprio vídeo | Ideia já trazida (docs/12) |
