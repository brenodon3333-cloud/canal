# ARQUIVO MESTRE DO CANAL (Bovonel)

**Versão:** 6
**Atualizado em:** segunda, 16/11/2026, por volta das 14h (horário de Brasília, UTC−3)
**Último vídeo registrado:** vídeo 06 (passagem aérea), entregue em 16/11/2026 e **aguardando a aprovação do dono** (PR aberto, ainda não juntado ao `main`)
**Próximo passo:** o dono assiste ao vídeo 06 e aprova (ou pede ajustes); depois, vídeo 07 (café) (ver a seção 10)

Este arquivo reúne tudo o que foi combinado sobre o canal, para que qualquer pessoa (ou outra conta do Kiro) continue o trabalho sem o dono precisar explicar de novo. Nada aqui é inventado. O que não está confirmado aparece marcado como **PENDENTE** ou **NÃO CONFIRMADO**. O que não existe mais aparece como **NÃO ACESSÍVEL**.

Regras com prioridade, quando dois textos parecerem dizer coisas diferentes:
1. Este arquivo (seção 3 e a tabela "Regras que foram substituídas").
2. `.kiro/steering/estilo-do-canal.md` e `.kiro/steering/manual-mestre.md`.
3. O resto (README, `youtube.md` antigos, `ideias/*.md`).

---

## Índice
1. Identidade do canal
2. Materiais enviados pelo dono
3. Decisões aprovadas (por área)
4. Feedbacks e aprendizados
5. Processo de produção e sincronia com a narração
6. Plano de publicação
7. Situação de cada vídeo
8. Informações técnicas
9. Texto para retomar em outra conta
10. Próximo passo
11. Materiais para guardar, pacote para baixar, o que ficou de fora e links desta conta
12. Regra de atualização deste arquivo
13. Registro de mudanças

---

## 1. Identidade do canal

| Item | Definição |
|---|---|
| Nome | **Bovonel**. O nome **não aparece no vídeo** nem na thumbnail. |
| Proposta | Economia do dia a dia: "por que X custa o que custa no Brasil". Promessa central: **"a gente abre o preço e mostra quem fica com cada centavo."** |
| Público central | Brasileiro adulto (20 a 45 anos), assalariado ou autônomo, que sente os preços subirem e não estudou economia. Situação: paga, reclama ("tá tudo caro") e não sabe para onde vai o dinheiro. |
| Dor silenciosa | Sensação de ser feito de bobo e vergonha de não entender economia. |
| Transformação | De "está tudo caro e não sei por quê" para "eu sei quem fica com cada centavo". |
| Pilares | 1. Raio-X do preço · 2. Para onde vai o seu dinheiro (impostos, salário, inflação) · 3. Por que no Brasil é assim (comparação com outros países). |
| Linguagem | Amigo que explica com calma, firme nos números, sem jargão, nunca faz a pessoa se sentir burra. Frases para ouvir: curtas nas viradas, pausa antes da revelação. |
| Limites | Sem torcida política, sem "fique rico rápido", sem dica de investimento, sem notícia solta, sem sensacionalismo. Em bebida alcoólica, nada que incentive beber. |
| Estilo visual | Motion graphic cinematográfico desenhado em código. Fundo azul-marinho, granulação e vinheta, números com brilho, câmera virtual sempre em movimento, objetos do mundo real com layout real. 16:9, 1920x1080, 30 quadros por segundo, sem rosto. |
| Cores fixas por fatia | empresa/fábrica **azul** · estado **laranja** · União **vermelho** · cadeia/loja **roxo** · matéria-prima **verde** |
| Regra de ouro da imagem | **Tudo entra na palavra da narração.** Faixa de baixo livre para as legendas. |
| Objetivos | Cada vídeo funciona sozinho e anuncia o próximo no fechamento. Crescer pelo clique honesto e pela retenção que vem do progresso (cada minuto traz algo novo). Meta numérica de inscritos ou views: **NÃO DEFINIDA** pelo dono. |
| Diferencial | Abre o preço em números com fonte (dado oficial separado de estimativa do canal), mostra "o que as notícias não explicam", e cada vídeo tem um cenário visual próprio, sem repetir soluções (ver `catalogo-visual.md`). |
| Divisão do trabalho | **Kiro faz tudo**: escolha do tema, pesquisa, roteiro, texto da narração, animação, efeitos sonoros, ambiente, mixagem, vídeo em partes, thumbnails, títulos, descrição, tags, comentário fixado e horário. **O dono** gera a narração com IA, junta as partes e faz as legendas no CapCut, e publica. |
| Limitação do dono | Não consegue baixar sons, músicas ou vídeos de terceiros. Tudo é criado pelo Kiro por código. Não tem acesso a terminal; vê tudo pelo GitHub. |

Artes do canal (feitas pelo Kiro, em `canal/`), **identidade v2, de 15/11/2026**:
- `logo.png` (1200x1200, 1,6 MB): **opção C escolhida pelo dono**, a etiqueta amarela cortada em 5 fatias de tamanhos diferentes, cada uma com a faixa numa cor de fatia; o "B" fica inteiro na fatia maior.
- `banner.png` (2560x1440, 4,5 MB, limite 6 MB): só o necessário, como o dono pediu. BOVONEL, "A gente abre o preço e mostra quem fica com cada centavo." e "Vídeo novo: domingo, terça e quinta", centralizados dentro da área do celular (1546x423). **Sem a logo** (o dono pediu para tirar) e sem as etiquetas de gôndola das laterais (reprovadas).
- `marca-dagua.png` (600x600, fundo transparente): o leque de etiquetas (aprovado pelo dono: "ficou bom").
- `descricao-do-canal.md` (856 caracteres).
- Qualidade: tudo é desenhado 2 a 3 vezes maior e reduzido (bordas lisas), com sombras na escala certa e granulação mínima contra faixas no degradê escuro.
- Gerar de novo: `node tools/arte.mjs logoC,banner2,marca2` (código em `canal/arte/marca.js`; prévia em `canal/previa/conferencia-v2.png`).
- A versão 1 (13/11/2026) e as opções A e B de logo estão em `canal/antigo/`.
- **NÃO CONFIRMADO** se o dono já trocou no YouTube Studio (Personalização → Branding e Informações básicas).

---

## 2. Materiais enviados pelo dono

| Material | Onde está | Situação |
|---|---|---|
| **"Manual Mestre Integrado – YouTube"** | O original foi enviado na conversa. **O arquivo original não está no repositório.** Existe um resumo aplicado ao canal em `.kiro/steering/manual-mestre.md`. | **ORIGINAL NÃO ACESSÍVEL** a partir do repositório. O resumo é o que o canal usa. O dono deve guardar a cópia original dele junto com este arquivo. |
| **"3 em 1"** | O dono escreveu (15/11): "ainda mandei o 3 em 1 pra ajudar". Não existe arquivo com esse nome no repositório. As regras citam "o manual integrado que o dono mandou". | **NÃO CONFIRMADO** se o "3 em 1" é o mesmo "Manual Mestre Integrado" (que junta vários manuais em um) ou outro material. **Não foi reconstruído.** Pergunta para o dono: "o 3 em 1 é o Manual Mestre Integrado? Se não for, pode mandar de novo?" |
| Narrações (geradas por IA pelo dono) | `video-0N-x/audio/narracao.mp3` (vídeos 01 a 05). Chegam com nomes como `Narracao5.mp3.mp3` e o Kiro move para a pasta certa. | Guardadas. A ferramenta e a voz de IA que o dono usa **não foram registradas** (PENDENTE: perguntar, para manter a mesma voz). |
| Feedbacks por mensagem | Registrados na seção 4 e em `estilo-do-canal.md`. | Guardados. |
| Prints do YouTube Studio (2 e 7 dias) | Nenhum recebido ainda. | **PENDENTE.** |

O que o canal aplica do Manual Mestre (resumo, não é o original): pessoas antes da máquina; retenção com alma (retenção vem do progresso, não de truque); hierarquia de decisão (verdade > clareza > transformação > identidade > retenção > consistência > efeitos); as sete perguntas antes de cada vídeo; ficha de ideia com pontuação; título + thumbnail + 30 primeiros segundos planejados juntos e antes do roteiro; 3 thumbnails para "Testar e comparar"; esqueleto de roteiro (Modelo E); revisão (Modelo F); microganchos; cada frase com função; uma melhoria principal por vídeo; análise depois da publicação (Modelo H). Detalhes em `.kiro/steering/manual-mestre.md`.

---

## 3. Decisões aprovadas (por área)

Estas são as regras **em vigor**. As antigas estão na tabela logo depois.

### Escolha do tema
- Desde o vídeo 04, o Kiro escolhe o tema com a ficha do Manual Mestre (critérios de 0 a 2, total de 16) e mostra o motivo. Fichas em `ideias/carne.md` e `ideias/cerveja.md`.
- Cada fechamento anuncia o próximo tema. O próximo já anunciado é **passagem aérea** (fim do vídeo 05).

### Pesquisa
- Fontes confiáveis, com data. `fontes.md` em cada vídeo separa **dado oficial** de **estimativa do canal**.
- Pesquisar até ter **uma história** (pessoa, lugar ou caso real que atravessa o vídeo), uma surpresa por bloco e as perguntas que as pessoas fazem nos comentários e nas buscas. Anotar o que as fontes **não** explicam: é o ângulo do canal.
- A pesquisa vem **bem antes** do roteiro (pedido do dono).

### Roteiro (vale a partir do vídeo 06)
- Esqueleto do Manual Mestre; usar só os blocos que trazem clareza, conflito e transformação.
- **Cada número é dito uma vez** (pode voltar uma vez no fechamento, de outro jeito).
- Cada bloco traz algo novo. **Sem recapitulação no meio.** Um resumo curto só no fim.
- **Listas só uma vez.**
- Entradas de frase: no máximo 3 com "E o", "Mas" ou "Então" e 2 com "Ou seja" ou "Agora" no vídeo todo.
- **Uma pergunta aberta por vez**, respondida no bloco seguinte.
- **Duração: quem decide é o Kiro**, pelo conteúdo. Nada de meta de minutos. "Ficar bom é o que importa."
- Antes de entregar o texto: `node tools/repeticao.mjs <pasta>` e zerar os pontos (ou justificar cada um).

### Narração
- O Kiro entrega o texto **em um bloco só** (`narracao-texto.txt`, um parágrafo por cena), pedindo **pausa de ~2 s entre as cenas**.
- O dono gera com IA e envia pelo GitHub ("Add file" → "Upload files" → "Commit directly to the main branch").
- **Nunca animar antes de ter a voz.**
- Direção de voz: confronto firme, explicação controlada, pausa antes das viradas, fechamento sem pressa.

### Animação e efeitos visuais
- Conceito visual próprio por vídeo: um **palco** e um **fio condutor** (vídeo 04: balcão do açougue e etiqueta da balança; vídeo 05: a lata e o cupom fiscal).
- **Câmera sempre andando**: travelling, push-in lento, pan e tilt, troca de enquadramento, paralaxe em camadas, leve deriva depois de cada movimento. Nunca o mesmo quadro parado por mais de ~3 s.
- Objetos do mundo real com **layout real** (cabeçalho, campos, letra miúda, código de barras, textura).
- Texto com hierarquia: uma palavra de destaque, marca-texto, contorno, texto preso no objeto.
- Cada imagem precisa fazer sentido **sem som**.
- Variar a forma de mostrar números; **não repetir soluções** de vídeos anteriores (conferir e atualizar `catalogo-visual.md`).
- Faixa das legendas livre: conteúdo até ~y=820 px; a checagem automática acusa qualquer texto abaixo de ~y=890.

### Transições
- **Discretas**: corte seco ou "push" (a câmera desliza para a próxima cena), match cut, movimento que leva à próxima cena.
- **No máximo uma transição de efeito** por vídeo, numa virada forte (vídeo 05: o carimbo da cena 7; vídeo 06: o painel de partidas inteiro virando para CANCELADO na cena 5).

### Efeitos sonoros, ambiente e trilha
- Efeitos sonoros sintetizados por código em todo elemento importante, com sons ligados ao tema. Ficam ~21 dB abaixo da voz (medida do vídeo 05) e nunca atrapalham a voz.
- **Música mínima ou nenhuma.** Se houver, pelo menos ~30 dB abaixo da voz e sem subir nas pausas. Na dúvida, sem música.
- Vídeo 05 (modelo atual): **sem música**, só ambiente quase inaudível por cena (~32 dB abaixo da voz).
- Vídeo 06: mesmo modelo, sem música. Medido com o mesmo método nos dois vídeos: fundo (efeitos + ambiente) em média 22,6 dB abaixo da voz enquanto toca (05: 20,3 dB); ambiente 33,7 dB abaixo; pico 0,88 (abaixo de 0 dB).
- Silêncio antes das revelações.

### Edição e entrega
- O Kiro entrega o vídeo em **partes de até ~95 MB** (`saida/parte-1.mov`, `parte-2.mov`...), a 11 Mbps, quadro a quadro (30 fps exatos), cortadas nas pausas da voz. Formato: H.264 + áudio PCM.
- O dono junta as partes **em ordem numérica** no CapCut e faz as legendas lá. Atenção: em algumas listas `parte-10` aparece antes de `parte-2`; seguir o número.
- **Qualidade vem antes do tamanho.** O dono liberou passar de 10 Mbps.
- Revisão obrigatória antes de entregar: checagem automática de todos os quadros (`qa.mjs` precisa dar 0), folhas de contato a cada 0,5 s revisadas inteiras, conferência do áudio (efeito no começo da palavra, até ~33 ms; pico abaixo de 0 dB), comparação com o catálogo. Na entrega, dizer o que foi conferido e corrigido.
- Explicar ao dono em passos simples, com link direto e nome exato do arquivo (ele já baixou a versão errada uma vez).

### Títulos e thumbnails
- **3 títulos e 3 thumbnails**, cada título combina com uma thumb, para testar no "Testar e comparar" do YouTube Studio.
- Título honesto, entendido sem reler, palavra de busca no começo, até ~60 caracteres, não repete o texto da thumb.
- Thumbnail: 1920x1080 JPG, um ponto focal, até 4 palavras, leitura em tela pequena, desenhada com os mesmos desenhos do vídeo (`animacao/thumbs.js`). Nunca o nome do canal.

### Pacote do YouTube (`youtube.md` de cada vídeo)
- Descrição com capítulos (começa em 0:00, cada capítulo com pelo menos 10 s, conferidos na linha do tempo da voz), fontes, hashtags.
- Tags com até 500 caracteres no total.
- Comentário fixado.
- Dia e horário sugeridos.

### Encerramentos e pedido de inscrição
- **Cada vídeo tem fechamento próprio** e anuncia o próximo.
- **Pedido de inscrição com animação própria, ligada ao tema**, que pareça um botão de verdade sendo apertado, com som próprio. Nada de botão vermelho genérico (usado nos vídeos 01 e 02, não repetir).
- Exemplos já usados (não repetir): interruptor com etiqueta "B" que acende "INSCRITO" (03); dedo aperta o "B" da balança, que imprime a etiqueta "INSCRITO" com carimbo "BEM-VINDO" (04); etiqueta de prateleira que vira "INSCREVA-SE" no leitor de código de barras (05); painel de partidas que vira "INSCREVA-SE / EMBARQUE" e depois "INSCRITO" com o botão do totem de check-in e o aviso sonoro do aeroporto (06).

### Regras que foram substituídas (não usar mais)

| Regra antiga | Substituída por | Quando |
|---|---|---|
| README antigo: narração gravada cena por cena, clipes por cena, o dono põe música da biblioteca do YouTube/CapCut | Narração em um bloco só; o Kiro faz tudo e entrega em partes; música mínima ou nenhuma | Vídeo 01 versão 2 (13/11/2026). README atualizado em 15/11/2026. |
| `tools/sync.mjs` para sincronizar | `envelope.mjs` + `alinhar.mjs` (funcionam mesmo com pausas curtas) | Vídeo 02 |
| Vídeo final em um arquivo só (`video-final.mov`) a taxa baixa | Partes de até ~95 MB a 11 Mbps | 13/11/2026 (teste 2,4 x 12 Mbps em `canal/previa/comparacao-qualidade.png`) |
| Transições com zoom + clarão em toda troca (vídeos 01 e 02) e transições de efeito do vídeo 04 | Transições discretas, no máximo uma de efeito | Feedback do vídeo 04, 14/11/2026 |
| Trilha musical contínua (01 a 03) e trilha "escrita em cima da imagem" (04) | Música mínima ou nenhuma | Feedback do vídeo 04, 14/11/2026 |
| "Vamos aumentar o tempo de vídeo" / meta de 10 a 12 minutos / "6 a 7 min" na ficha de ideias / "6 a 12 minutos" no README antigo | O Kiro decide a duração pelo conteúdo | 15/11/2026 |
| Publicar **dia sim, dia não** | Dias fixos: domingo 10h, terça 17h e quinta 17h | 13/11/2026 ("Concordo com os dias fixos") |
| Vídeo 02 no domingo 22/11 | Terça 17/11 17h | 13/11/2026 |
| "Formato reconhecível" do manual (rosca, "os seus R$ 100"...) como molde visual | A sequência de ideias pode se repetir; a solução visual muda em todo vídeo | Feedback do vídeo 02 |

---

## 4. Feedbacks e aprendizados

**Tipo** quer dizer: **DEFINITIVA** = preferência que vale para todos os vídeos; **ESPECÍFICO** = comentário sobre um vídeo ou uma cena, que não vira regra sozinho; **OBSERVAÇÃO** = nota que ajusta uma regra, sem trocá-la.

As datas com "≈" são aproximadas (tiradas das datas dos commits e das anotações nas regras, entre a noite de 12/11 e 13/11/2026).

| Data | Vídeo | O que o dono disse (resumo ou citação) | Tipo | O que virou |
|---|---|---|---|---|
| ≈13/11/2026 | 01 v1 | O vídeo ficou "parado" e fora de ritmo (animação feita antes da voz). | DEFINITIVA | Nunca animar antes de ter a voz. |
| ≈13/11/2026 | 01 v2 | Aprovou o estilo cinematográfico; "as coisas vão aparecendo de acordo com a voz" é o principal. | DEFINITIVA | Tudo entra na palavra da narração. |
| ≈13/11/2026 | 01 | Pediu revisão quadro a quadro antes de entregar. | DEFINITIVA | Revisão obrigatória (`qa.mjs`, folhas, áudio). |
| 13/11/2026 | geral | Qualidade antes do tamanho do arquivo; "se for mais que 10 também não tem importância". | DEFINITIVA | Partes a 11 Mbps. |
| 13/11/2026 | geral | Quando pedir "aprimorar": análise profunda, procurar até o que ele não soube explicar. | DEFINITIVA | Seção "O que aprimorar quer dizer" em `estilo-do-canal.md`. |
| ≈13/11/2026 | 02 | "Acertou o tempo." | ESPECÍFICO (aprovação) | Sincronia aprovada. |
| ≈13/11/2026 | 02 | São Paulo/ICMS mostrado do mesmo jeito que as outras fatias (repetido). | ESPECÍFICO, que gerou regra | Regra geral: não repetir solução visual; `catalogo-visual.md`. |
| ≈13/11/2026 | 03 | "Teve realmente o que eu pedi", mais cinematográfico. A conta de luz desenhada ficou "sem graça e fora da realidade". | Aprovação + ESPECÍFICO que gerou regra | Objetos reais com layout real; textos caprichados; inscrição mais caprichada; imagem que se entende sem som. |
| 14/11/2026 | 04 | 1ª trilha: "não bateu em nada" com o vídeo. | ESPECÍFICO | Trilha refeita acompanhando a imagem (depois também foi considerada alta). |
| 14/11/2026 | 04 | "A música de fundo ficou alta, ela tem que ser mínima possível ou que quase não dê pra escutar ou nenhuma, porque o que manda é a narração e os efeitos sonoros." | DEFINITIVA | Música mínima ou nenhuma (≥ ~30 dB abaixo da voz). |
| 14/11/2026 | 04 | "Adorei o formato... é tipo um motion graphic, mas no estilo nosso." | DEFINITIVA (manter) | Formato motion graphic é o padrão. |
| 14/11/2026 | 04 | "Só exagerou nas transições." | DEFINITIVA | Transições discretas. |
| 14/11/2026 | 04 | "Achei a câmera meio paradona." | DEFINITIVA | Câmera sempre andando. |
| 14/11/2026 | 04 | "Não é pra refazer o vídeo 4." | ESPECÍFICO | Vídeo 04 fica como está. |
| 14/11/2026 | 04 | Ouvindo no PC: "não ficou ruim do tanto que eu te falei não, mas serve de observação." | OBSERVAÇÃO | As partes do 04 ficam com a música atual; a regra de música mínima continua. |
| 14/11/2026 | geral | "Vamos aumentar o tempo de vídeo, tô achando eles curtos." | Substituído | Trocado pela regra de 15/11 (abaixo). |
| 15/11/2026 | 05 (roteiro) | "Muito repetitivo, não adianta ser mais longo se não faz o público continuar assistindo... a partir de agora é você que sabe o tempo do vídeo, ficando bom é o que importa." Também: pesquisar bem antes do roteiro e usar o "3 em 1". | DEFINITIVA | Seção "Roteiro que segura o público" + `tools/repeticao.mjs` + duração decidida pelo Kiro. |
| 15/11/2026 | 05 | "Não é pra fazer outro roteiro." | ESPECÍFICO | Roteiro do 05 mantido; regras valem do 06 em diante. |
| 15/11/2026 | 05 | Vídeo e pacote aprovados (PR #3 juntado ao `main`). | ESPECÍFICO (aprovação) | — |
| 15/11/2026 | canal | Logo: "vou ficar com a C". Banner: "só coloca o necessário"; não gostou das etiquetas nas laterais. Marca d'água "ficou bom". "Aumentar a qualidade de tudo." Depois: "no banner não tem por que ter o negócio da logo". | ESPECÍFICO (identidade) + DEFINITIVA (banner limpo, qualidade alta nas artes) | Identidade v2 aplicada; artes com supersampling. |
| 15/11/2026 | links | "Aqui tá dando erro quando abri o link." | OBSERVAÇÃO | O repositório é **privado**: o dono precisa estar logado no GitHub, ou navegar pelas pastas a partir da página do repositório. |

Aprendizados técnicos (do Kiro, não do dono):
- O gravador do navegador (MediaRecorder) perdia quadros (~12 fps). Desde o vídeo 04, a imagem é codificada quadro a quadro com WebCodecs.
- O envelope de volume tinha passo real de 221/44100 s, não 5 ms exatos. Corrigido em `envelope.mjs`; sem isso, a sincronia escorrega ao longo do vídeo.
- Em `audio/alinhamento.txt`, a segunda coluna **não é** a duração da frase. Para achar pausas reais (cortes das partes), usar `audio/envelope.json` (volume a cada ~5 ms).
- As fontes do vídeo não têm os sinais "≈" e "→": escrever "uns", "quase", "·" ou "–".
- Os textos do cartão de embarque são desenhados numa imagem guardada (`passTexture`), para a checagem automática não acusar sobreposição dentro do próprio cartão.
- Medida do vídeo 05 com `repeticao.mjs`: "quatro reais" dito 6 vezes, divisão 30/20/50 dita 3 vezes, "imposto" 30 vezes. É o exemplo do que não fazer.

---

## 5. Processo de produção e sincronia com a narração

### Passo a passo de um vídeo
1. **Tema:** ficha de ideias em `ideias/<tema>.md` (o próximo já está escolhido: café).
2. **Pesquisa:** `video-0N-<tema>/fontes.md` (fontes com data; dado oficial x estimativa).
3. **Embalagem antes do roteiro:** títulos, ideia das 3 thumbs, 30 primeiros segundos (dentro de `roteiro.md`).
4. **Roteiro:** `roteiro.md` (sete perguntas, nova verdade, esqueleto, conceito visual, cenas) e `narracao-texto.txt` (um parágrafo por cena).
5. **Checagem de repetição:** `node tools/repeticao.mjs video-0N-<tema>`.
6. **Entrega do texto ao dono**, com o pedido de ~2 s de pausa entre cenas.
7. **O dono envia a narração** pelo GitHub. O Kiro move o arquivo para `video-0N-<tema>/audio/narracao.mp3`.
8. **Sincronia** (abaixo).
9. **Animação:** `animacao/scenes.js` (+ `lib.js`, `fx.js`, `audio.js`, `index.html`, `musica.json`).
10. **Revisão:** `cues`, `storyboard`, prévias, `qa.mjs` (0 problemas), folhas de contato, áudio.
11. **Áudio final** (`trilha-final.wav`) e **partes** (`parte-N.mov`).
12. **Thumbnails** (`thumbs.mjs`) e **`youtube.md`**.
13. **Atualizar** `catalogo-visual.md`, `ideias/`, este arquivo e o pacote (seção 12).
14. Pull request para o `main`; o dono aprova; junta.
15. **O dono:** baixa as partes, junta no CapCut, legenda, publica no dia combinado.

### Como a narração comanda o vídeo
1. `envelope.mjs` mede o volume da voz a cada ~5 ms (`audio/envelope.json`).
2. `alinhar.mjs` divide o áudio em blocos de fala separados por pausas e encaixa o texto neles. Cada palavra recebe o instante real em que começa (procura o vale de volume mais próximo). Resultado: `audio/timeline.json` (cenas e palavras com tempo) e `audio/alinhamento.txt` (resumo legível: início, fim e pausa de cada cena). Funciona mesmo se as pausas vierem curtas (vídeo 02 veio com ~0,5 s; vídeo 05 com 0,4 a 1 s).
   - Se o `roteiro.md` não tem seções `## Cena` com linhas `> `, o texto vem de `narracao-texto.txt` (cada parágrafo é uma cena).
3. Em `scenes.js`, cada cena usa `K("frase da narração")`, que devolve o segundo em que aquela frase começa dentro da cena. Números, cartões, câmera e efeitos são marcados nesses instantes. `LEAD = 0` no `index.html` (sem adiantar).
4. `render.mjs <pasta> cues` confere se toda frase usada em `K(...)` existe de verdade na narração.
5. O som é montado em cima da mesma linha do tempo: efeito no começo da palavra (até ~1 quadro, 33 ms).
6. As partes são cortadas nas pausas da voz, para a emenda no CapCut não cair no meio de uma palavra.

---

## 6. Plano de publicação

**Fuso:** horário de Brasília (UTC−3).

### Confirmado
- **Dias fixos: domingo 10h, terça 17h e quinta 17h.** Aprovado pelo dono em 13/11/2026 ("Concordo com os dias fixos").
- A proposta de publicar **dia sim, dia não** foi discutida e **substituída** pelos dias fixos. Não usar.

### Datas por vídeo

| Vídeo | Data e hora | Situação da data |
|---|---|---|
| 01 gasolina | domingo, 15/11/2026, 10h | Combinada |
| 02 iPhone | terça, 17/11/2026, 17h | Combinada (mudou de dom 22/11 para ter 17/11; se já estava agendado no Studio, era preciso trocar lá) |
| 03 conta de luz | quinta, 19/11/2026, 17h | Combinada |
| 04 carne | domingo, 22/11/2026, 10h | Combinada |
| 05 cerveja | terça, 24/11/2026, 17h | **SUGERIDA** no `youtube.md`; o dono aprovou o vídeo, mas **não confirmou a data de forma explícita** |
| 06 passagem aérea | quinta, 26/11/2026, 17h (próximo horário fixo) | **SUGERIDA** no `youtube.md`; vídeo entregue em 16/11, aguardando a aprovação do dono |

### Pendente
- **NÃO CONFIRMADO** se os vídeos foram de fato enviados e agendados no YouTube Studio, e se o vídeo 01 saiu hoje (15/11, 10h). Perguntar ao dono.
- **NÃO CONFIRMADO** se o dono está usando o "Testar e comparar" com as 3 thumbs/títulos.
- Regra de reserva (sugerida pelo Kiro, o dono disse que dá conta do ritmo): ter sempre 1 vídeo pronto a mais. Se não houver, passar para 2 por semana (domingo e quinta) em vez de publicar com pressa.
- Pedir prints do YouTube Studio de cada vídeo com **2 dias** e **7 dias** (retenção, taxa de cliques, comentários) e juntar as lições uma vez por semana. Nenhum print recebido ainda.
- Depois de uns 5 vídeos publicados: conferir em Studio → Análises → Público → "Quando seus espectadores estão no YouTube" e publicar 1 a 2 horas antes do pico.
- A descrição do canal (`canal/descricao-do-canal.md`) diz "Novo vídeo toda semana". Continua verdadeira, mas pode virar "domingo, terça e quinta" se o dono quiser (**PENDENTE**, não foi alterada).

---

## 7. Situação de cada vídeo

Legenda: **Publicado** = já está no ar · **Programado** = agendado no Studio · **Pronto** = entregue e aprovado, aguardando o dono subir · **Em produção**.

Como o Kiro não vê o YouTube Studio, a coluna "No YouTube" só muda quando o dono confirmar.

| Vídeo | Título principal | Narração | Cenas | Entrega | Situação no projeto | No YouTube |
|---|---|---|---|---|---|---|
| 01 gasolina | Para onde vai o dinheiro de um litro de gasolina? | ~6 min 33 s | 13 | `saida/video-final.mov` (arquivo único, 78 MiB, taxa baixa ~1,6 Mbps, feito antes da regra das partes) | Pronto | **NÃO CONFIRMADO** (data combinada: hoje, 15/11 10h) |
| 02 iPhone | Por que o iPhone custa quase o dobro no Brasil? | ~6 min 44 s | 13 | `saida/video-final.mov` (arquivo único, 81 MiB) | Pronto | **NÃO CONFIRMADO** |
| 03 conta de luz | Conta de luz: quem fica com cada real que você paga? | ~8 min 9 s | 10 | `saida/video-final.mov` (arquivo único, 91 MiB) | Pronto | **NÃO CONFIRMADO** |
| 04 carne | Maior exportador do mundo, e a carne nunca foi tão cara | ~7 min 1 s | 9 | `saida/parte-1.mov` a `parte-9.mov` (uma por cena, 11 Mbps) | Pronto, **não refazer** | **NÃO CONFIRMADO** |
| 05 cerveja | Cerveja: quanto do preço é imposto de verdade? | ~12 min 25 s | 11 | `saida/parte-1.mov` a `parte-13.mov` (cortes nas pausas da voz, até 68 s cada; a parte 3 tem 95,6 MB, abaixo do limite de 100 MiB) | Pronto e aprovado (PR #3) | **NÃO CONFIRMADO** |
| 06 passagem aérea | Por que a passagem de avião está tão cara? (recomendado) | ~8 min 51 s | 9 | `saida/parte-1.mov` a `parte-10.mov` (cortes nas pausas da voz, 50 a 57 s cada, de 39,8 a 61,2 MB, 11 Mbps) | **Entregue, aguardando aprovação** (16/11/2026) | — |
| 07 café | ainda não definido | — | — | — | Tema escolhido com a ficha (`ideias/passagem.md`, 15 de 16) e anunciado no fim do 06 | — |

Thumbnails (em `saida/` de cada vídeo, 1920x1080 JPG), cada uma combina com um dos 3 títulos do `youtube.md`:
- 01: `thumb-A-litro`, `thumb-B-nota`, `thumb-C-imposto` (também `thumbnail.png` antiga, 1280x720)
- 02: `thumb-A-metade`, `thumb-B-dobro`, `thumb-C-empilhado`
- 03: `thumb-A-esconde`, `thumb-B-verde`, `thumb-C-plugado`
- 04: `thumb-A-recorde`, `thumb-B-pra-fora`, `thumb-C-nao-e-imposto`
- 05: `thumb-A-56`, `thumb-B-pecado`, `thumb-C-cupom`
- 06: `thumb-A-tarifa`, `thumb-B-querosene`, `thumb-C-cancelado`

A thumb vencedora de cada teste: **PENDENTE** (depende dos resultados do Studio).

Ligações entre vídeos (a ordem importa): o fim do 01 anuncia o iPhone; o fim do 03 anuncia a carne; o fim do 04 anuncia a cerveja; o começo do 05 cita o vídeo da carne; o fim do 05 anuncia a passagem aérea ("a gente sai do churrasco e vai pro aeroporto"); a cena 3 do 06 compara o imposto da passagem com a lata de cerveja do 05; o fim do 06 anuncia o café ("a gente desce do avião e vai pra cozinha").

---

## 8. Informações técnicas

Nenhuma senha, token ou credencial está neste arquivo nem no pacote.

### Repositório
- GitHub: `brenodon1111-droid/por-tras-do-preco` (**privado**), ramo principal `main`.
- No sandbox do Kiro: `/projects/sandbox/por-tras-do-preco`.
- Pull requests #1, #2 e #3: todos juntados/fechados. Último commit do vídeo 05: `e4bfea3` "Vídeo 05 (cerveja) aprovado".
- O repositório tem ~2,2 GB por causa dos vídeos e WAVs. O "Download ZIP" do repositório inteiro fica enorme; por isso existe o pacote da seção 11.

### Pastas
```
por-tras-do-preco/
├── ARQUIVO_MESTRE_DO_CANAL.md   este arquivo
├── PACOTE_MESTRE_DO_CANAL.zip   pacote para baixar (seção 11)
├── README.md                    resumo curto, aponta para este arquivo
├── .kiro/steering/
│   ├── estilo-do-canal.md       regras de estilo e trabalho (lidas pelo Kiro em toda conversa)
│   └── manual-mestre.md         resumo do Manual Mestre aplicado ao canal
├── catalogo-visual.md           o que já foi usado em cada vídeo (para não repetir)
├── ideias/                      fichas de escolha de tema (carne, cerveja)
├── canal/                       logo, banner, marca d'água e descrição (v2), arte/assets.js e arte/marca.js,
│                                antigo/ (v1 e opções A e B de logo), previa/, teste-capcut/
├── tools/                       ferramentas (abaixo)
└── video-0N-<tema>/
    ├── roteiro.md  fontes.md  youtube.md  narracao-texto.txt (do 03 em diante)
    ├── animacao/   lib.js fx.js audio.js scenes.js index.html musica.json thumbs.js (04 e 05)
    ├── audio/      narracao.mp3 envelope.json alinhamento.txt timeline.json
    └── saida/      thumbs, qa.txt, trilha-final.wav, video-final.mov ou parte-N.mov,
                    folhas/ e preview/ (revisão)
```

### Ferramentas (`tools/`, todas rodam com `node` a partir da raiz do repositório)
| Ferramenta | Para que serve |
|---|---|
| `envelope.mjs <pasta>` | Volume da narração para o alinhador |
| `alinhar.mjs <pasta>` | Começo real de cada palavra → `timeline.json` e `alinhamento.txt` |
| `sync.mjs` | Sincronia antiga (vídeo 01); substituída pelas duas acima |
| `silencios.mjs <áudio>` | Lista as pausas de um áudio |
| `render.mjs <pasta> <modo>` | Renderizador: `cues`, `storyboard`, `preview <cena> <t1,t2>`, `audio`, `stems voz\|fundo\|musica`, `final <seg> <início>`, `eventos`, `plano`, `thumb` |
| `qa.mjs <pasta> 30 [cenas]` | Checagem automática de todos os quadros (precisa dar 0) |
| `folhas.mjs <pasta> 0.5 [de] [até]` | Folhas de contato para revisão visual |
| `checar-js.mjs <arquivos>` | Confere a sintaxe dos arquivos da animação |
| `repeticao.mjs <pasta>` | Mede repetição no texto da narração |
| `thumbs.mjs <pasta> [A,B,C]` | Gera as thumbnails a partir de `animacao/thumbs.js` |
| `arte.mjs [logo,banner,...]` | Gera as artes do canal a partir de `canal/arte/assets.js` e `canal/arte/marca.js` (atual: `logoC,banner2,marca2`) |
| `mosaico.mjs saida.jpg a.png ...` | Junta prévias numa grade |
| `comparar.mjs a.mov b.mov saida.png t1,t2` | Compara o mesmo quadro de dois vídeos |
| `remux.mjs`, `mp3.mjs`, `mp4info.mjs` | Montagem e diagnóstico do arquivo de vídeo |
| `pacote.py` | Monta `PACOTE_MESTRE_DO_CANAL.zip` (seção 11) |

### Comandos na ordem (exemplo com `video-06-passagem`)
```
node tools/repeticao.mjs video-06-passagem
node tools/envelope.mjs video-06-passagem
node tools/alinhar.mjs video-06-passagem
node tools/checar-js.mjs video-06-passagem/animacao/scenes.js
node tools/render.mjs video-06-passagem cues
node tools/render.mjs video-06-passagem storyboard
node tools/render.mjs video-06-passagem preview 3 1.5,4,8
node tools/qa.mjs video-06-passagem 30
node tools/folhas.mjs video-06-passagem 0.5
node tools/render.mjs video-06-passagem audio
node tools/render.mjs video-06-passagem stems voz
TRILHA=video-06-passagem/saida/trilha-final.wav BITRATE=11000000 node tools/render.mjs video-06-passagem final <segundos> <início>
   (gera saida/teste-final.mov; renomear para parte-N.mov; repetir para cada parte)
node tools/thumbs.mjs video-06-passagem A,B,C
python3 tools/pacote.py
```

### Dependências e ambiente
- Node.js v22 (o sandbox tem v22.23.4), Python 3 (só biblioteca padrão, para o pacote), Playwright com Chromium.
- **Os caminhos do Playwright e do Chrome estão fixos no código**: `/inner_container/opt/toolchains/.nvm/versions/node/v22.23.4/lib/node_modules/@playwright/mcp/node_modules/playwright` e `/inner_container/opt/playwright/chromium-1232/chrome-linux64/chrome`. Em outro ambiente, trocar esses caminhos no topo de cada ferramenta.
- Não há ffmpeg, numpy nem pip. Tudo (som, imagem, codificação) é feito no navegador por código.
- WebCodecs precisa de página aberta como `file://`; o `render.mjs` já faz isso.
- A internet do sandbox bloqueia downloads de mídia; por isso os sons são sintetizados.
- Limites do GitHub: arquivo acima de 100 MiB é bloqueado. Releases e Git LFS não funcionam neste ambiente (testado em 13/11/2026). Enviar partes grandes em lotes de até 3 por commit.
- Git e pull requests: `git push` pelo terminal; PR com `gh api repos/brenodon1111-droid/por-tras-do-preco/pulls`; juntar com `gh api -X PUT .../pulls/N/merge`.
- Dica: ao abrir uma imagem recém-gerada para conferir, às vezes a leitura falha; esperar um pouco e copiar com outro nome resolve.

---

## 9. Texto para retomar em outra conta

Copie o bloco abaixo e cole como primeira mensagem numa conversa nova do Kiro (ou de outro assistente). Antes, coloque os arquivos do pacote num repositório que essa conta consiga abrir (veja a seção 11).

```
Você vai continuar a produção do meu canal de YouTube "Bovonel" (economia do dia a dia:
"por que X custa o que custa no Brasil"). Eu não sou técnico. Você faz tudo: escolha do tema,
pesquisa, roteiro, texto da narração, animação em código, efeitos sonoros, mixagem, vídeo em
partes, thumbnails e textos do YouTube. Eu só gero a narração com IA, junto as partes e faço
as legendas no CapCut, e publico.

Antes de qualquer coisa, leia inteiro o ARQUIVO_MESTRE_DO_CANAL.md que está na raiz do
repositório (ou dentro do PACOTE_MESTRE_DO_CANAL.zip). Ele tem a identidade do canal, as regras
em vigor, as que foram substituídas, meus feedbacks, o processo, o calendário e a situação de
cada vídeo. Leia também .kiro/steering/estilo-do-canal.md, .kiro/steering/manual-mestre.md e
catalogo-visual.md. Se algo parecer contraditório, vale o arquivo mestre.

Situação: vídeos 01 a 05 prontos; vídeo 06 (passagem aérea) entregue em 16/11/2026, aguardando
a minha aprovação. O próximo é o vídeo 07 (café), já anunciado no fim do vídeo 06. Comece pela pesquisa (com uma história real, não só dados), depois o roteiro
seguindo "Roteiro que segura o público", rode tools/repeticao.mjs e me entregue o texto da
narração em um bloco só, com pausa de 2 segundos entre as cenas. Só anime depois que eu mandar
a narração.

Regras que eu mais cobro: tudo aparece na palavra da narração; música mínima ou nenhuma (quem
manda é a voz e os efeitos); transições discretas; câmera sempre se mexendo; objetos reais
parecendo reais; não repetir soluções de vídeos anteriores; cada vídeo com fechamento e pedido
de inscrição próprios; nada de repetir números e listas no roteiro; a duração você decide pelo
conteúdo. O nome Bovonel não aparece no vídeo.

Depois de cada vídeo ou mudança aprovada, atualize o ARQUIVO_MESTRE_DO_CANAL.md (data, situação,
decisões) e o pacote, e me mande o link para baixar.

Coisas que você precisa me perguntar logo no começo: quais vídeos já publiquei ou agendei no
YouTube Studio; se o "3 em 1" que mandei é o Manual Mestre Integrado; qual ferramenta e qual voz
de IA eu uso na narração.
```

---

## 10. Próximo passo

**Vídeo 06 (passagem aérea): entregue em 16/11/2026, aguardando a aprovação do dono.** Narração recebida em 15/11; 9 cenas, 8 min 51 s; checagem de todos os quadros com 0 problemas; folhas de contato revisadas inteiras; 10 partes; 3 thumbs; `youtube.md`.
1. O dono assiste às 10 partes juntas, em ordem, e aprova ou pede ajustes. Só depois juntar o PR ao `main`.
2. Agendar no Studio: sugestão quinta, 26/11/2026, 17h (**PENDENTE**: depende da aprovação e de confirmar as datas dos vídeos 01 a 05 no Studio).
3. Perguntar ao dono as pendências das seções 2, 6 e 7 (publicado ou agendado no Studio, "3 em 1", ferramenta de voz) e se o café está bem para o vídeo 07.
4. Vídeo 07 (café): pesquisa, roteiro e texto da narração (ficha em `ideias/passagem.md`, 15 de 16). Ângulo anunciado no fim do 06: "a maior queda de preço em um ano desde o Plano Real; a gente abre o pacote e mostra quem fica com cada real".

---

## 11. Materiais para guardar, pacote para baixar, o que ficou de fora e links desta conta

### O que guardar junto com este arquivo (fora desta conta)
1. Este arquivo: `ARQUIVO_MESTRE_DO_CANAL.md`.
2. O pacote `PACOTE_MESTRE_DO_CANAL.zip` (tudo o que é leve; lista abaixo).
3. **Separadamente**, os arquivos grandes que não cabem no pacote (lista "ficou de fora").
4. **A cópia original** do "Manual Mestre Integrado – YouTube" e do "3 em 1" (estão só com o dono).
5. As narrações originais que o dono gerou (também estão no pacote).

### O que tem no pacote
- `ARQUIVO_MESTRE_DO_CANAL.md`, `README.md`, `catalogo-visual.md`, `ideias/`
- `.kiro/steering/` (as regras que o Kiro lê sozinho)
- `tools/` (todas as ferramentas)
- `canal/` (logo, banner, marca d'água, descrição, `arte/assets.js`, `previa/`), sem o `teste-capcut/`
- Em cada vídeo: `roteiro.md`, `fontes.md`, `youtube.md`, `narracao-texto.txt`, `animacao/` (código completo), `audio/` (narração MP3 e arquivos de sincronia), as thumbnails, `storyboard.png` e `qa.txt` quando existem
- `CONTEUDO_DO_PACOTE.txt`, a lista de todos os arquivos com tamanho

Com o pacote, outra conta consegue **refazer qualquer vídeo** (código + narração + sincronia), mas precisa renderizar de novo para ter os arquivos de vídeo.

### O que ficou de fora do pacote (e onde está)
| O quê | Tamanho aproximado | Por que ficou de fora | Onde está |
|---|---|---|---|
| Partes do vídeo 04 (`parte-1` a `parte-9.mov`) | ~460 MiB | Grande demais (limite de 100 MiB por arquivo no GitHub) | Repositório, `video-04-carne/saida/` |
| Partes do vídeo 05 (`parte-1` a `parte-13.mov`) | ~790 MiB | Idem | Repositório, `video-05-cerveja/saida/` |
| Partes do vídeo 06 (`parte-1` a `parte-10.mov`) | ~490 MiB | Idem | Repositório, `video-06-passagem/saida/` (no ramo `video-06-passagem` até o PR ser juntado) |
| `video-final.mov` dos vídeos 01, 02 e 03 | ~250 MiB | Idem | Repositório, `saida/` de cada vídeo |
| `trilha-final.wav` (01 a 06) | ~235 MiB | Idem; dá para gerar de novo com `render.mjs <pasta> audio` | Repositório |
| `video-01-gasolina/saida/cenas/`, `video-completo.mp4`, `video-narrado.mp4` | ~95 MiB | Versão antiga (v1) do vídeo 01, não usada | Repositório |
| `saida/folhas/` e `saida/preview/` | ~450 MiB | Imagens de revisão; dá para gerar de novo | Repositório |
| `canal/teste-capcut/` | ~12 MiB | Teste de emenda no CapCut, sem uso agora | Repositório |
| Histórico do Git | ~2,2 GB | Não é necessário para continuar | Repositório |
| Manual Mestre original e "3 em 1" | — | **Nunca estiveram no repositório** | Só com o dono |

**Recomendação:** baixar agora, pelo GitHub, as partes dos vídeos que ainda não foram publicados e guardar no computador ou num drive. Se esta conta deixar de existir, eles se perdem.

### Links que dependem desta conta do GitHub
Todos abaixo só abrem **logado** na conta `brenodon1111-droid` (o repositório é privado). Se o repositório for apagado ou a conta perdida, nenhum funciona.
- Repositório: https://github.com/brenodon1111-droid/por-tras-do-preco
- Este arquivo: https://github.com/brenodon1111-droid/por-tras-do-preco/blob/main/ARQUIVO_MESTRE_DO_CANAL.md
- Pacote: https://github.com/brenodon1111-droid/por-tras-do-preco/blob/main/PACOTE_MESTRE_DO_CANAL.zip
- Pastas de cada vídeo: `https://github.com/brenodon1111-droid/por-tras-do-preco/tree/main/video-0N-<tema>/saida`
- Pull requests #1, #2 e #3 (histórico das aprovações)
- Os links que o Kiro mandou nas conversas anteriores apontam para esses mesmos endereços (alguns para ramos que já foram juntados ao `main`).

Também dependem desta conta do Kiro: o histórico das conversas e qualquer preferência salva na conta. Tudo o que importa delas foi copiado para este arquivo.

Para usar em outra conta: criar um repositório novo nessa conta e subir o conteúdo do pacote (ou adicionar a outra conta como colaboradora deste repositório, nas configurações do GitHub).

---

## 12. Regra de atualização deste arquivo

Depois de **cada vídeo entregue** e de **cada mudança aprovada pelo dono** (regra nova, feedback, data de publicação, situação no Studio), o Kiro:
1. Atualiza este arquivo: data no topo, versão +1, "último vídeo registrado", "próximo passo", seções 3, 4, 6, 7 e 10 conforme o caso, e uma linha no registro de mudanças.
2. Se uma regra nova substituir outra, move a antiga para "Regras que foram substituídas" e corrige o texto antigo em `estilo-do-canal.md` para não ficar contraditório.
3. Atualiza `catalogo-visual.md` e `ideias/`.
4. Gera o pacote de novo: `python3 tools/pacote.py`.
5. Junta ao `main` e manda ao dono o link de download deste arquivo e do pacote.
6. Confere: uma conta nova, lendo só este arquivo, sabe a situação de cada vídeo e qual é o próximo passo?

A mesma regra está em `.kiro/steering/estilo-do-canal.md`, que o Kiro lê sozinho em toda conversa.

---

## 13. Registro de mudanças

| Versão | Data (Brasília) | O que mudou |
|---|---|---|
| 1 | 15/11/2026 | Arquivo criado com tudo até o vídeo 05 aprovado. README atualizado para apontar para cá. Pacote `PACOTE_MESTRE_DO_CANAL.zip` criado. |
| 2 | 15/11/2026 | Dono pediu logo, banner e descrição novos. Identidade v2 criada em `canal/novo/` (3 logos, banner, marca d'água, descrição), aguardando a escolha da logo. Pacote gerado de novo. |
| 3 | 15/11/2026 | Dono escolheu a logo C, aprovou a marca d'água (leque) e pediu o banner só com o necessário e mais qualidade em tudo. Logo C refeita com o "B" inteiro, banner sem as etiquetas laterais, supersampling em tudo; identidade v2 passou a ser `canal/logo.png`, `banner.png`, `marca-dagua.png` e `descricao-do-canal.md`; v1 em `canal/antigo/`. |
| 4 | 15/11/2026 | Logo tirada do banner, texto centralizado. |
| 5 | 15/11/2026 | Identidade v2 juntada ao `main` (PR #5). Vídeo 06: pesquisa, roteiro e texto da narração entregues. Vídeo 07 escolhido: café. |
| 6 | 16/11/2026 | Vídeo 06 (passagem aérea) entregue para aprovação: animação, efeitos e ambiente, revisão, 10 partes, 3 thumbs e `youtube.md`. Catálogo visual, ficha de ideias e pacote atualizados. |
