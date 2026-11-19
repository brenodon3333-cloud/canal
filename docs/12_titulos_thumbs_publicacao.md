# 12 · Títulos, thumbnails, publicação e análise

## 1. O que os dados dizem [OBSERVADO no Monke, docs/02]

- **Funciona:** uma promessa de resultado concreto e desejado.
  - "5 habits for good sleep." (1,8 mi);
  - "[crença] is BS. Do this instead" (mediana de 632 mil);
  - uma identidade exagerada: "DISGUSTINGLY locked in", "dangerously self-educated".
- **Vai mal:** tema abstrato ("NPC", "You're Too Intelligent"), mensagem emotiva genérica e lista de objetos.
- **A thumb do Monke:** de 2 a 3 palavras grandes, o personagem com o corpo contando a ideia (curvado contra musculoso) e poucos objetos. O estilo é igual nos vídeos que vão bem e nos que vão mal.

## 2. Títulos

Regras **[APROVADO EM OUTRO CANAL]** (Bovonel e Quase Disse):
- 5 títulos por episódio, cada um com até 60 caracteres. Conte os caracteres.
- Honesto: abre uma pergunta que o vídeo responde.
- Entendido sem reler.
- A palavra de busca vem perto do começo.
- Não repete o texto da thumb.

**Para a Cobaia [PROPOSTA]:**
- "Testei [crença] por 7 dias";
- "[Crença] funciona? A Cobaia testou";
- "[Crença] é mito. Faça isto no lugar".

## 3. Thumbnails

**[APROVADO EM OUTRO CANAL]**. Frase do dono no ep01: "sei que tem que pegar do vídeo, mas tem que fazer melhores".

- **Planejada no roteiro.** O roteiro reserva um plano feito para virar thumb: a expressão no auge, o rosto grande (de 40 a 50% da altura), luz quente recortando o personagem contra um fundo escuro e um objeto que gere curiosidade.
- **Até 3 palavras grandes**, em Archivo Black âmbar (`#ffb347`) com contorno de tinta e sombra curta. O texto nunca cobre rosto nem mão.
- **Como fazer** (`episodios/ep02-porteiro/thumbs.js`):
  1. Desenhe o quadro do episódio em 2560 × 1440, recortado no ponto certo, com mais contraste e saturação (`contrast(1.15) saturate(1.3)`).
  2. Ponha um foco escuro em volta do rosto (gradiente radial `rgba(10,8,24,0.6 a 0.8)`).
  3. Ponha o brilho quente em `screen`.
  4. Adicione o texto.
  5. Reduza para 1280 × 720 com lanczos e salve em JPG (até 2 MB; ficaram com cerca de 150 KB).
- **Conferência:** em 320 × 180 e 168 × 94, a expressão tem de se ler **sem o texto**.
- **Três opções** por episódio, para usar no "Testar e comparar" do YouTube Studio.
- **Nunca o nome do canal na thumb** (Bovonel).
- **Erro do ep01:** quadros do vídeo com texto por cima ficaram com rostos pequenos e neutros e cinza sobre cinza. Não repita.
- **Exemplos no pacote:** `amostras/thumb_v1_*.jpg` (ep02, a versão melhor) e `amostras/17-thumb-sem-resposta.jpg`, `18-thumb-toda-noite.jpg` e `19-thumb-era-ele.jpg` (ep01, a versão fraca).

**Para a Cobaia [PROPOSTA]:**
- A cobaia em pose exagerada.
- A prancheta ou o carimbo do veredito como o objeto de curiosidade.
- 1 a 3 palavras: "MITO?", "7 DIAS", "FUNCIONOU?".

## 4. O pacote de publicação

**[APROVADO EM OUTRO CANAL]**. Entregue um `.txt` para copiar e colar (exemplos: `amostras/publicacao_ep01.txt` e `publicacao_ep02.txt`) com:

- **5 títulos.**
- **Descrição:** 3 linhas que contam a história sem entregar o fim, a pergunta ao público, a linha do canal, o crédito da narração e 5 hashtags. Para o canal novo, inclua as **fontes** do experimento.
- **Tags:** até 500 caracteres, separadas por vírgula.
- **Comentário fixado:** a pergunta ao público.
- **Ajustes do Studio:**
  - o arquivo de upload;
  - a miniatura escolhida;
  - a legenda `.srt` com o idioma português (Brasil);
  - a categoria "Filmes e animação" (para a Cobaia, considerar "Educação");
  - conteúdo para crianças: sugestão "Não". A escolha é do dono.
  - **"Conteúdo alterado ou sintético":** não precisa marcar em animação, e a voz não imita uma pessoa real. A regra do YouTube só exige o aviso quando o conteúdo parece real; foi verificada em nov/2026 na página de ajuda do YouTube sobre conteúdo alterado ou sintético.
- **Capítulos** (Bovonel): começam em 0:00, cada um com pelo menos 10 s, conferidos na linha do tempo.

**Medidas do YouTube** (pesquisadas pelo Bovonel em nov/2026):

| Item | Medida |
|---|---|
| Banner | 2560 × 1440, até 6 MB; área segura 1546 × 423 |
| Foto do perfil | 800 × 800, exibida a 98 px |
| Marca d'água | quadrada, mínimo 150 × 150, até 1 MB, PNG transparente |
| Thumb | 1280 × 720 ou maior, até 2 MB |
| Descrição do canal | até 1000 caracteres; os ~150 primeiros aparecem na busca |
| Descrição do vídeo | até 5000 caracteres |

## 5. Nome do canal

**Como checar se o @ está livre:** o código HTTP de `https://www.youtube.com/@nome` (404 = sem canal público) e a busca de canais do YouTube.
- Em 19/11/2026: `@cobaia`, `@acobaia` e `@modocobaia` **existem**; `@cobaiatesta` estava livre.
- O nome definitivo é **[PENDENTE]**.
- **Lição do Quase Disse:** cerca de 24 nomes propostos já existiam ("Meia Palavra", "Pigarro", "Entrelinhas"...). Cheque antes de propor.

## 6. Ritmo de publicação e análise

- **Monke:** 1 vídeo por semana, sem Shorts **[OBSERVADO]**.
- **Bovonel:** domingo 10h, terça e quinta 17h **[APROVADO EM OUTRO CANAL]**, com a regra de ter sempre 1 vídeo pronto a mais.
- **Canal novo:** **[PENDENTE]**. A Kiro propõe começar com 1 por semana e medir quanto tempo leva produzir um episódio antes de prometer mais.
- **Depois de publicar** (Modelo H, Bovonel): peça ao dono prints do YouTube Studio com **2 e 7 dias**: impressões, taxa de cliques, retenção (com o gráfico) e comentários.
  - **Nos dois canais anteriores, nenhum print chegou.** Por isso não há nenhum dado de público.
  - Faça disso uma rotina desde o primeiro vídeo: explique ao dono, em poucos passos, onde fica cada número no Studio.
- **A cada episódio:** uma melhoria principal, registrada, e o catálogo atualizado.
