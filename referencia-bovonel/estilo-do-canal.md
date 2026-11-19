# Canal Bovonel: estilo e forma de trabalho

Aprovado pelo dono do canal no vídeo 01 (gasolina, versão 2) e ajustado pelos feedbacks dos vídeos seguintes. Quando duas regras parecerem diferentes, vale a mais nova (as seções de feedback no fim) e o resumo em `ARQUIVO_MESTRE_DO_CANAL.md`, que lista as regras substituídas.

## O canal
- Nome: **Bovonel**. O nome **não aparece no vídeo** (nem marca no canto, nem na thumbnail).
- Tema: economia do dia a dia explicada ("por que X custa o que custa no Brasil").
- Formato: horizontal 16:9, 1920x1080, sem rosto. A duração e a divisão entre as partes seguem o conteúdo e a narração de cada vídeo (sem número fixo de cenas nem tempo fixo por parte).
- Próximo vídeo prometido (fechamento do vídeo 06, já narrado e entregue em 16/11/2026): café, "o café teve a maior queda de preço em um ano desde o Plano Real; a gente abre o pacote e mostra quem fica com cada real".

## Divisão do trabalho
- **Kiro faz tudo**: ideia, pesquisa (com fontes e data), roteiro, animação, efeitos sonoros, música, mixagem, vídeo final, título, descrição, tags e thumbnail.
- **Escolha do tema:** a partir do vídeo 04, o Kiro pesquisa e escolhe o tema com a ficha de ideias do Manual Mestre (tabela de critérios, como em `ideias/carne.md`) e apresenta a escolha com o motivo. O vídeo 03 é **conta de luz**, escolhido pelo dono. O dono aprovou o fechamento "No próximo, a gente abre ... e mostra quem fica com cada real."
- **O dono do canal** grava ou gera a narração com IA e faz as legendas no CapCut.
- O dono **não consegue baixar materiais** (sons, músicas, vídeos). Tudo deve ser criado pelo Kiro. A internet do sandbox é bloqueada para downloads, então efeitos e trilha são sintetizados por código (`animacao/audio.js`).

## Ordem de produção (obrigatória)
1. Kiro pesquisa e escreve o roteiro em cenas.
2. Kiro entrega o texto da narração **em um bloco só**, com instrução de **pausa de 2 segundos entre as cenas**.
3. O dono envia `narracao.mp3` pelo GitHub ("Add file" → "Upload files" → "Commit directly to the main branch").
4. Só então o Kiro faz o vídeo **em cima da narração** (`tools/envelope.mjs` + `tools/alinhar.mjs` → `animacao/scenes.js` → revisão → `tools/render.mjs final` em partes). O `sync.mjs` era do vídeo 01 e foi substituído.
- Nunca animar antes de ter a voz: o vídeo 01 v1 ficou "parado" e fora de ritmo por isso.

## Estilo visual aprovado
- Fundo escuro azul-marinho, cores fortes por assunto, ícones e gráficos desenhados em código.
- **Cinematográfico**: câmera virtual que segue o assunto (viaja pelo cenário, aproxima do que está sendo falado, abre no fim da cena), respiração leve da câmera, tremida nos impactos, partículas, granulação fixa, vinheta, brilho nos números.
- **Tudo entra na palavra da narração**: números contando, cartões, ícones, frases de impacto (ex.: "ELE NÃO SOME."). "As coisas vão aparecendo de acordo com a voz" é o ponto principal pedido.
- Efeitos sonoros em todo elemento que aparece (pop, whoosh, moeda, caixa registradora, impacto, riser, líquido, caminhão, neon, tique-taque) e música de fundo **mínima** (ver feedback do vídeo 04: quase inaudível ou nenhuma). Transições discretas (ver feedback do vídeo 04); o "zoom + clarão em toda troca" dos vídeos 01 e 02 não é mais usado.
- Evitar zoom que corte texto pela metade; deixar a faixa de baixo da tela livre para as legendas.

## Revisão antes de entregar (obrigatória)
Pedido do dono: analisar o vídeo quadro a quadro antes de entregar e corrigir qualquer detalhe.
1. **Checagem automática de todos os quadros** (30 por segundo): texto ou número cortado na borda, elementos encostando um no outro, algo dentro da faixa das legendas (≈180 px de baixo), quadro preto ou travado, salto brusco de câmera, número mostrado diferente do roteiro.
2. **Revisão visual:** folhas de contato com um quadro a cada 0,5 s do vídeo inteiro, mais quadros cheios antes, durante e depois de cada animação importante, cada número e cada troca de cena.
3. **Áudio:** cada efeito comparado com o começo real da palavra (diferença máxima de ~1 quadro, 33 ms); voz sempre acima da música; sem estouro (pico abaixo de 0 dB); sem silêncio sobrando.
4. Corrigir, renderizar de novo e repetir a revisão nos trechos alterados.
5. Na entrega, dizer ao dono o que foi conferido e o que foi corrigido.

### Ferramentas (a partir do vídeo 02)
1. `node tools/envelope.mjs <pasta>` e depois `node tools/alinhar.mjs <pasta>`: acham o começo real de cada palavra, mesmo se as pausas entre cenas forem curtas (no vídeo 02 a narração veio com pausas de ~0,5 s em vez de 2 s). Usar no lugar do `sync.mjs`. No `index.html` do vídeo, `LEAD = 0` (sem adiantar).
2. `node tools/render.mjs <pasta> cues`: confere se toda frase usada na animação existe na narração.
3. `node tools/qa.mjs <pasta>`: checagem automática de todos os quadros (texto cortado, sobreposto ou na faixa das legendas). Precisa dar 0 problemas.
4. `node tools/folhas.mjs <pasta> 0.5 [de] [até]`: folhas de contato para a revisão visual.
5. Música por vídeo em `animacao/musica.json` (mínima ou nenhuma; no vídeo 05 só ambiente).

## Entrega
- Vídeo final em partes `saida/parte-N.mov` (H.264 + PCM), a 11 Mbps, codificadas quadro a quadro (WebCodecs). Os vídeos 01 a 03 saíram num arquivo só (`video-final.mov`), antes desta regra.
- **Qualidade vem antes do tamanho do arquivo** (pedido do dono, 13/11/2026). Não baixar a taxa de vídeo só para caber num limite. Alvo: ~10 Mbps em 1080p (o YouTube recomenda 8 Mbps para 1080p a 30 quadros), o que dá ~600 MB para 8 minutos.
- Limite técnico: o GitHub bloqueia arquivo acima de 100 MiB dentro do repositório. Testado em 13/11/2026: neste ambiente o envio para Releases do GitHub é bloqueado e não há Git LFS. Retestado de 6 formas em 13/11/2026: continua bloqueado (não tem relação com o aparelho do dono). Teste de qualidade em 13/11: 2,4 x 12 Mbps no mesmo trecho; em 2,4 Mbps aparecem blocos e texto borrado logo depois de movimentos e transições, em 12 Mbps fica limpo (`canal/previa/comparacao-qualidade.png`). Ferramentas: `render.mjs <pasta> final <segundos> <início>` gera um trecho; `tools/comparar.mjs` tira o mesmo quadro de dois arquivos; o `remux.mjs` agora deixa imagem e som com a mesma duração em cada arquivo. Plano: entregar o vídeo em partes de até ~95 MB (parte-1, parte-2...), cortadas nas pausas entre cenas, conferindo que as emendas não têm salto de imagem nem de som. O dono junta as partes em ordem no CapCut (onde ele já faz as legendas). Ensinar o passo a passo na entrega. A escolha da taxa é do Kiro (o dono liberou passar de 10 Mbps).
- Também `saida/trilha-final.wav` (só o áudio) e a thumbnail.
- Explicar para o dono em passos simples, com o link direto do arquivo e o nome exato. Ele já se confundiu baixando a versão errada.

## Identidade fixa x execução própria (feedback do vídeo 02, aprovado)
O dono aprovou a sincronia do vídeo 02 ("acertou o tempo"). O próximo passo é **criatividade e acabamento**.

**Fica igual em todo vídeo (identidade):** fundo azul-marinho, paleta e cores fixas por tipo de fatia, tipografia, números com brilho, granulação e vinheta, câmera cinematográfica, tudo entrando na palavra da narração, faixa das legendas livre, nome do canal fora do vídeo.

**Muda em todo vídeo (execução própria):**
1. **Conceito visual do assunto.** Antes de animar, ler a narração e escolher uma metáfora central e um "cenário" próprios do tema (ex.: conta de luz = fios, medidor girando, interruptor, bandeiras tarifárias de verdade). Cada momento da fala decide o que mostrar e como.
2. **Não repetir solução para o mesmo conceito.** Se um lugar ou ideia já apareceu (ex.: São Paulo/estado/ICMS, fatias, "o produto completo", "os seus R$ 100", lista de motivos), mostrar de outro jeito. Consultar e atualizar `catalogo-visual.md` a cada vídeo.
3. **Variar enquadramentos** (close, plano aberto, travelling, vista de cima, tela dividida, plano detalhe) e **o ritmo** conforme a energia da fala: trechos rápidos com cortes curtos, viradas com pausa e respiro.
4. **Variar a forma de mostrar números:** contador, odômetro, balança, pilha de moedas, preenchimento, régua, comparação de tamanho, gráfico desenhado na hora, número escrito à mão etc. Não usar sempre "cartão + valor contando + barra embaixo".
5. **Transições pensadas para o tema** e discretas (corte seco, match cut, movimento de câmera que leva à próxima cena). No máximo uma transição de efeito por vídeo (feedback do vídeo 04).
6. **Efeitos sonoros com personalidade do tema:** sons novos ligados ao assunto, ambiente próprio, silêncio antes das revelações. Música só se ajudar, e mínima (feedback do vídeo 04). Efeito destaca o momento certo e nunca atrapalha a voz.
7. **Encerramento diferente a cada vídeo.**
8. **Pedido de inscrição com animação caprichada**, integrada ao tema e à identidade (ex.: a etiqueta "B" do canal vira o botão; no vídeo de luz, um interruptor que acende o botão). Não repetir o botão vermelho genérico.

**Na revisão antes de entregar, acrescentar:** comparar o vídeo com `catalogo-visual.md` e trocar qualquer cena que repita a solução de um vídeo anterior.

## Feedback do vídeo 03 (conta de luz), aprovado
O dono aprovou: "teve realmente o que eu pedi", ficou mais cinematográfico, a variedade melhorou. Pontos para melhorar a partir do vídeo 04:
1. **Objetos do mundo real precisam parecer reais.** A conta de luz desenhada ficou "sem graça e fora da realidade". Quando o vídeo mostra um objeto que o público conhece (conta, nota fiscal, cupom, etiqueta de mercado, bomba de posto, embalagem), copiar o layout real: cabeçalho, campos e rótulos de verdade, letra miúda, código de barras, QR code, tabelas com colunas, papel com textura, sombra, dobra e leve perspectiva. Números da tela batem com a conta do roteiro. Nada de retângulo branco com 4 linhas.
2. **Textos com mais capricho.** Hierarquia clara (uma palavra de destaque por frase), pesos e tamanhos misturados, marca-texto atrás da palavra-chave, contorno e sombra com profundidade, texto preso no objeto ou no cenário em vez de legenda solta no meio da tela, animação de entrada própria (letra a letra, carimbo, escrita, máquina). Evitar rótulo cinza pequeno centralizado.
3. **Pedido de inscrição ainda mais caprichado.** Mais tempo de tela, movimento em várias etapas, som próprio e ligação direta com o tema; o botão precisa parecer um botão de verdade sendo apertado.
4. **Cada imagem precisa fazer sentido sozinha.** Na revisão visual, para cada animação perguntar: "quem só vê a imagem, sem ouvir, entende o que é?". Se não entender, trocar.
5. Estas regras valem também para as thumbnails.

## Feedback do vídeo 04 (carne), 14/11/2026: vale a partir do vídeo 05
O dono adorou o formato ("tipo um motion graphic, mas no estilo nosso, ficou muito bom mesmo"). O vídeo 04 fica como está; nada de refazer. Corrigir nos próximos:
1. **Música de fundo no mínimo possível.** Quem manda é a narração e os efeitos sonoros. A música fica quase inaudível, só como cama, ou some (em alguns trechos ou no vídeo todo). No vídeo 04 ela ficou alta e atrapalhou, nas duas versões: a contínua e a que acompanhava a imagem. Na mistura, a música fica pelo menos ~30 dB abaixo da voz quando há fala (no vídeo 04 ficou ~18 dB) e não volta a subir nas pausas. Na dúvida, mais baixa ou sem música. Efeitos sonoros continuam com destaque.
2. **Transições mais discretas.** As do vídeo 04 (virada de placa, porta fria, cutelo, ponteiro) exageraram. Usar transições curtas e limpas, que servem à história (corte seco, match cut, movimento de câmera que leva à próxima cena); uma transição de efeito só onde há uma virada forte, e sem chamar mais atenção que o conteúdo.
3. **Câmera com mais dinamismo e mais cinematográfica.** No vídeo 04 ela ficou "meio paradona". Movimento contínuo e motivado: travelling acompanhando o assunto, push-in lento nas falas importantes, pan e tilt revelando o próximo elemento, troca de enquadramento (plano aberto, médio, detalhe) ao longo da cena, parallax entre camadas (fundo, meio, frente), foco/desfoque de profundidade e easing suave. Evitar segurar o mesmo quadro parado por mais de ~3 s.
4. Manter o que funcionou: o estilo motion graphic do canal, objetos reais detalhados, o fio condutor por vídeo e a revisão quadro a quadro.
5. **Depois (14/11):** ouvindo no PC, o dono achou que a música "não ficou tão ruim" quanto tinha falado, mas a regra do item 1 continua valendo como direção: música mínima.
6. **Duração: quem decide é o Kiro** (atualizado em 15/11/2026, depois de ouvir o roteiro do 05). O dono tinha pedido vídeos mais longos, mas achou o roteiro do 05 "muito repetitivo": "não adianta ser mais longo se não faz o público continuar assistindo". Regra: o tamanho sai do conteúdo. O vídeo fica do tamanho em que cada minuto traz algo novo; ficar bom é o que importa. Nada de meta de minutos.

## Roteiro que segura o público (feedback do vídeo 05, vale a partir do vídeo 06)
O roteiro do 05 não será refeito. O que deu errado nele, medido com `tools/repeticao.mjs`: o preço da lata ("quatro reais") dito 6 vezes, a divisão 30/20/50 dita 3 vezes (cenas 5, 6 e 11), a lista "malte, alumínio, energia" repetida em 4 cenas, a palavra "imposto" 30 vezes, 8 frases começando com "E o...", 6 com "Mas" e 4 com "Ou seja". O texto ficou mais longo andando em círculo, sem avançar.

**Antes de escrever (pesquisa de verdade, como o dono pediu):**
- Pesquisar até ter **uma história**, não só dados: uma pessoa, um lugar ou um caso real que atravessa o vídeo; uma surpresa por bloco; e as perguntas que as pessoas fazem nos comentários e nas buscas sobre o tema.
- Aplicar o Manual Mestre (o manual integrado que o dono mandou): pessoas antes da máquina, retenção com alma (retenção vem do progresso), microganchos, cada frase com função.

**Ao escrever:**
- **Cada número é dito uma vez.** Pode voltar uma única vez no fechamento, e de outro jeito (outra imagem, outra comparação). A tela mostra o número; a voz não precisa repetir.
- **Cada bloco entrega algo novo:** um fato, uma virada ou uma consequência. Se o bloco só reorganiza o que já foi dito, ele sai.
- **Sem recapitulação no meio.** Um resumo só no fim, curto.
- **Listas só uma vez.** Se precisar voltar ao assunto, usar uma palavra que resuma ("os custos em dólar").
- **Variar a entrada das frases:** no máximo 3 frases começando com "E o", "Mas" ou "Então", e 2 com "Ou seja" ou "Agora" no vídeo todo.
- **Uma pergunta aberta por vez,** respondida no bloco seguinte, para dar motivo de continuar.

**Antes de entregar o texto:** rodar `node tools/repeticao.mjs <pasta>` e zerar os pontos (ou justificar cada um). Ler em voz alta pensando: "em que segundo a pessoa largaria o vídeo?" e cortar ali.

## O que "aprimorar" quer dizer (pedido do dono, 13/11/2026)
Quando o dono pedir para "aprimorar", fazer uma análise profunda com critério criativo e técnico próprio, sem se limitar ao que ele apontou. Procurar também o que ele não soube explicar ou ainda não percebeu.
- Revisar o vídeo como um conjunto: clareza do roteiro, sincronia com a narração, composição das cenas, leitura dos textos, movimentos, transições, efeitos sonoros, trilha, encerramento e a ligação entre uma cena e a próxima (o fim de uma cena prepara o começo da outra).
- Cada escolha precisa ter função: ajudar a entender, dar ritmo ou melhorar a experiência. Melhorar nem sempre é acrescentar; às vezes é simplificar, mudar o tempo ou dar mais destaque ao que importa.
- Preservar o que já funciona e a identidade do canal; dar a cada vídeo soluções próprias, sem repetir no automático a estrutura do anterior.
- Na entrega, contar o que foi melhorado por iniciativa própria e por quê.

## Calendário de publicação (aprovado em 13/11/2026)
- Dias fixos: **domingo 10h, terça 17h e quinta 17h** (Brasília). Substituiu a ideia de publicar "dia sim, dia não". Vídeo 01: dom 15/11 10h; vídeo 02: ter 17/11 17h; vídeo 03: qui 19/11 17h; vídeo 04: dom 22/11 10h; vídeo 05: ter 24/11 17h (sugerido, falta o dono confirmar). Se já foram publicados ou agendados no Studio: perguntar ao dono.
- Regra de reserva sugerida: sempre ter 1 vídeo pronto a mais. Se não houver, passar para 2 por semana (domingo e quinta) em vez de publicar com pressa. O dono disse que dá conta do ritmo.
- Pedir ao dono prints do YouTube Studio de cada vídeo com 2 e com 7 dias (retenção, taxa de cliques, comentários) e juntar as lições uma vez por semana.

## Arquivo mestre (pedido do dono, 15/11/2026)
- `ARQUIVO_MESTRE_DO_CANAL.md`, na raiz, reúne identidade, materiais, decisões, feedbacks, processo, calendário, situação de cada vídeo, parte técnica e o texto para retomar em outra conta.
- **Depois de cada vídeo entregue e de cada mudança aprovada**: atualizar o arquivo (data, versão, situação, próximo passo, registro de mudanças), mover regras antigas para "Regras que foram substituídas", gerar o pacote de novo (`python3 tools/pacote.py`), juntar ao `main` e mandar ao dono o link de download do arquivo e do pacote.
- Nunca colocar senha, token ou credencial no arquivo. Não inventar: o que não está confirmado fica marcado como PENDENTE ou NÃO CONFIRMADO.
