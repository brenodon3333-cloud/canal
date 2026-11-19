# Decisões do canal (o que foi testado e funcionou)

Atualize este arquivo quando uma escolha for confirmada ou derrubada num episódio.

## Ambiente verificado por execução (18/11/2026)

| capacidade | ferramenta | estado |
|---|---|---|
| Desenho e animação | Canvas 2D em Node (`@napi-rs/canvas`), mesma API do navegador usada no Bovonel | ok: formas, gradientes, `filter: blur`, modos `multiply`/`screen`/`overlay`, fontes TTF |
| Exportar vídeo | ffmpeg 7 estático via `imageio-ffmpeg` (pip), quadros RGBA por pipe → H.264 + AAC | ok: 1920×1080, 24 qps, ~2 min para 23 s |
| Síntese de som | DSP próprio em JS (`motor/som.js`): ruído, senos, biquads, envelopes, sala Schroeder, compressor | ok. Adaptação: o Web Audio exige navegador; a mesma lógica roda em Node e escreve direto no arquivo |
| Voz-guia local | Piper TTS, voz `pt_BR-faber-medium` | ok, inteligível; serve para marcar tempo, não para publicar |
| Alinhar a gravação | faster-whisper `small` com tempos por palavra + casamento com o texto do roteiro + correção de +68 ms nas palavras internas + bordas por energia | ok. Erro medido em fala contínua: média de 27 a 44 ms por palavra (ver "Precisão do alinhamento") |
| Medir a mixagem | ffmpeg `ebur128` + análise em numpy (`motor/conferir.py`) | ok |
| Navegador headless | Chromium do Playwright existe na máquina | não usado; ficou como alternativa |

**Falhas encontradas e contornos**
- O repositório `github.com/brenodon5555-lab/larissa` deu 403 pela ponte git do ambiente e 404 no acesso público (privado ou inexistente).
- `github.com/brenodon3333-cloud/bovonel` é público, mas a conexão autenticada do ambiente com o GitHub responde 403 (até `gh api user`). Baixei o código pela via pública (`codeload.github.com`) em `/projects/sandbox/bovonel/` só para leitura. Sem essa conexão não dá para enviar nada ao GitHub.
- O arquivo `Estudo_dos_tres_filmes.html` não chegou. Usei só as notas em texto; nenhum vídeo de referência foi visto ou medido aqui.
- `pip install` global falha (sistema só leitura) e `/tmp` não persiste entre comandos: tudo fica em `.venv/` e `.tools/` dentro do projeto (`preparar.sh`).
- Sem ffmpeg no sistema: o binário estático vem do pacote pip `imageio-ffmpeg`.

## O que veio do Bovonel (examinado em 18/11/2026)

O Bovonel fazia tudo dentro do Chromium: Canvas 2D, Web Audio offline, WebCodecs e um gravador de MOV em JS, porque aquele ambiente não tinha ffmpeg. Aqui há ffmpeg e Canvas em Node, então o navegador não é necessário.

**Trazido ou confirmado**
- Ação presa à frase da narração e erro quando a palavra não existe: `K("frase")` lá, `T.W(fala, palavra)` aqui.
- Câmera em camadas com paralaxe e tremida que decai depois do impacto: mesma ideia, já aplicada.
- O envelope de volume com passo exato (lá o erro de 5 ms fixo escorregava 0,23%): aqui o passo é 240/48000 = 5 ms exatos.
- **Encaixe da palavra na subida de energia** (`alinhar.mjs`): portado e medido. **Piorou** o resultado em fala contínua (erro médio de 87 a 105 ms, contra 51 a 71 ms do Whisper cru). Em fala corrida não há vale de energia entre as palavras, e o encaixe pula para a sílaba errada. Ficou desligado; liga com `VOZ_ENCAIXE=1`.
- Feedbacks do dono que valem aqui: só animar em cima da voz real; música mínima ou nenhuma (a voz e os efeitos mandam); transições discretas; revisão quadro a quadro antes de entregar; qualidade antes do tamanho do arquivo; links diretos com o nome exato do arquivo.

**Diferente de propósito**
- No Bovonel a câmera nunca podia ficar parada mais de ~3 s (feedback do vídeo 04). Aqui a direção pede o contrário: planos sustentados como os de IF HUMANS. A regra nova: um plano parado sempre tem um gesto mínimo que muda a expectativa, e a câmera anda devagar quando não há gesto.
- 24 qps em vez de 30, por ser animação de personagem desenhada "em dois".
- O dono gerava a narração com IA e juntava e legendava as partes no CapCut. Aqui ele não grava nem edita nada: a narração é sintética e a legenda vai só em `.srt`.
- Taxa de vídeo: CRF 18 deu ~5 Mbps em desenho chapado. O Bovonel achou blocos a 2,4 Mbps e entregou a 11 Mbps. Conferir os quadros do mp4 depois de movimentos rápidos; se aparecerem blocos, subir a taxa.

## Precisão do alinhamento (medida, não estimada)

`motor/teste_alinhamento.py` sintetiza as falas com Piper, que informa a duração de cada fonema. Assim o início real de cada palavra é conhecido (o meio da transição entre palavras). As falas são juntadas com pausas curtas, codificadas em AAC como um áudio de celular e passadas pelo mesmo `voz.py`.

| voz · ritmo · pausas | Whisper cru | encaixe do Bovonel | Whisper + 68 ms (em uso) |
|---|---|---|---|
| cadu · 1,0 · 0,4 s | 51 ms | 96 ms | **33 ms** (até 50 ms: 83%) |
| faber · 1,25 · 0,6 s | 52 ms | 87 ms | **27 ms** (até 50 ms: 83%) |
| cadu · 1,4 · 1,5 s | 71 ms | 90 ms | **44 ms** (até 50 ms: 67%) |

Erro médio por palavra. O pior caso ainda passa de 100 ms, quase sempre na primeira palavra de uma fala que começa por vogal: o limiar de energia acha a vogal tarde, quando ela já está audível.
A meta do Bovonel era efeito a até 33 ms da palavra (1 quadro a 30 qps). Aqui 1 quadro tem 42 ms. A média fica dentro de 1 quadro, mas nem toda palavra fica.
**Calibrado só em voz sintética.** Com a gravação real, rodar de novo e conferir se o viés de ~68 ms se mantém.

## Decisões do dono

- **19/11/2026 · Tamanho dos personagens, depois do ep01.** "A Dona Lurdes indo pro elevador ficou maior que ele e no elevador menor, porque ela é menor." Medido no código do ep01: no corredor (plano B) ela tem 519 px e o Caio, com escala 0,66, tem 510 px (ela 2% maior). No elevador (plano C) ela tem 530 px e ele 734 px (ela com 72% da altura dele). O ep01 fica como está; a correção vale do ep02 em diante. **Regra:** altura desenhada fixa por personagem, e só a profundidade muda a escala. A tabela usa o elevador do ep01, que foi aprovado, como referência:

  | personagem | altura desenhada (Caio = 1,00) |
  |---|---|
  | Caio | 1,00 (773 px com escala 1) |
  | Seu Arlindo | 0,88 |
  | Dona Lurdes | 0,72 |

  Escala por profundidade: `escala = (yPé − horizonte) / (yRef − horizonte)`. Quem pisa na mesma linha do chão tem a mesma escala. `motor/alturas.js` mede a razão em todo quadro com dois personagens ou mais (tolerância de 3%).
- **19/11/2026 · Thumbnails.** "Sei que tem que pegar do vídeo, mas tem que fazer melhores." As do ep01 tinham rostos neutros e pequenos e cinza sobre cinza, e pareciam quadros do vídeo com texto. Do ep02 em diante, o roteiro prevê um plano feito para virar thumbnail. Ele tem a expressão no auge, um rosto grande, luz quente recortando o personagem contra um fundo escuro e um objeto que gere curiosidade. Regras completas na steering do canal.
- **19/11/2026 · Episódio 1 "O elevador" v1 aprovado.** "Ficou ótimo." Ficam confirmados: o motor volta no mesmo quadro do encaixe; a frase dele se encaixa embaixo da dela; a música tem duas texturas (só graves pelo teto, só agudos no fone) com o mesmo ritmo; a noite 2 sem narração. Use a v1 como referência de ritmo e de mixagem para os próximos episódios.
- **18/11/2026 · Narração sintética.** "Até quero que use a voz sintética." A voz do canal passa a ser a Piper `pt_BR-faber-medium`, a mesma da prova. O dono não precisa gravar nada. A voz alternativa é a `pt_BR-cadu-medium`.
  - Licença, conforme os cartões dos modelos: as duas vozes foram treinadas em dados CC0. A `cadu` partiu de um modelo base também CC0. A `faber` partiu do modelo base `hifi_tts_92`, feito com dados Hi-Fi TTS, que até onde sei são CC BY 4.0. Por precaução, creditar na descrição do vídeo: "Narração: Piper TTS, voz faber". NÃO CONFIRMADO juridicamente.
  - Ganho técnico: com voz sintética, o Piper informa a duração de cada fonema, o que permite saber o tempo exato de cada palavra sem reconhecimento. O fluxo atual (Whisper corrigido) continua funcionando; trocar pelo tempo do próprio Piper fica como melhoria possível.
- **18/11/2026 · "Só tem a metade do corpo?"** No plano geral os personagens não tinham pernas nem cadeiras debaixo da mesa, e o vão debaixo da mesa aparece na imagem. Era um erro meu, não estilo. Corrigido na v4 com cadeiras e pernas sentadas. Elas ficam fora da rotação do tronco: inclinar o corpo não arrasta os pés. Regra: **se o enquadramento mostra uma parte do corpo, ela precisa estar desenhada**. Nos closes, mostrar só do peito para cima é enquadramento normal.

- **18/11/2026 · O que o dono gostou na v4:** a mordida, o corte para a Bia esperando e a volta para ele responder. "Ali eu entendi o que os dois estavam sentindo." **Regra confirmada:** o corte para quem espera vem antes da resposta.
- **18/11/2026 · Entrega (v5):** vídeos com legendas queimadas na imagem, mais um `.srt`. **Derrubado na v6:** ver abaixo. O nome provisório "Meia Palavra" continua. A voz sintética continua.
- **18/11/2026 · Entrega (v6, vale agora):** **nenhuma legenda fixa queimada embaixo.** Texto na imagem só quando pertence à cena ("TÁ ÓTIMO." perto do rosto). A narração vai só no `.srt` (`legendas: false, srt: true`). Com isso a faixa de baixo deixa de ser reservada.
- **18/11/2026 · v5 de "O bolo" (`episodios/prova-bolo-2`):** a Bia percebe a mentira. Escolhas propostas como linguagem do canal, aguardando o dono: ver `.kiro/artifacts/5-comparacao-v4-v5.md` e `episodios/prova-bolo-2/ROTEIRO.md`.

## Lições técnicas da v5
- **Plano detalhe pelo mesmo mundo:** o detalhe da mesa usa a mesma cena do plano geral com zoom 3. Assim a continuidade (letras, cereja, mão, garfo) é automática. `D.linhaK.k = 1/zoom` mantém o contorno com a mesma espessura na tela, e `D.membro` desenha braços e pernas com contorno constante.
- **Vários impactos juntos somam:** oito letras batendo em 0,25 s passaram a mordida no celular (+3 dB). Com o limitador antes da normalização, baixar 6 dB quase não mudou nada, porque antes o limitador já estava comprimindo. Foi preciso baixar 17 dB. Meça grupos de eventos, não só eventos isolados.
- **Garfo na boca:** recorte com `clip('evenodd')`: a parte acima da linha dos lábios some e os lábios são desenhados por cima.
- **Legenda e pés:** no plano geral a câmera abre para 0,96. Assim os pés ficam acima da faixa da legenda (y de 964 a 1036).
- `conferir.py` usa o `.wav` quando ele é mais novo que o `.mp4` (`--so-som`).
- Às vezes uma imagem recém-gravada não aparece na leitura imediata (o Bovonel registrou o mesmo). Esperar 1 a 2 s e listar a pasta resolve.

## v6 de "O bolo" (`episodios/prova-bolo-3`, 18/11/2026)

O dono gostou na v5 do olhar do Nico depois da mordida, da espera da Bia e do plano mais perto das letras caindo. O que ele apontou e o que virou regra:

- **Braço tem tamanho fixo.** Na volta da v5 o antebraço da Bia cresceu para alcançar o prato. Agora os braços são calculados do ombro até a mão (cinemática inversa em `personagens.js`, `resolverBracos`), com braço e antebraço de comprimento fixo e o cotovelo sempre na solução de baixo. Se o alvo está longe, a mão para no limite e o relatório `recorte.js <ep> ... --varrer` mostra quantos pixels faltaram. Para alcançar, mude os lugares ou os objetos (na v6 as cadeiras ficaram mais próximas e o bolo foi para trás da Bia). Nunca estique o braço.
- **A mão segura o objeto até soltar.** Na v5 o prato deslizou depois que a mão já tinha saído. Agora a posição do prato e a da mão saem da mesma conta: os dedos ficam presos à borda (`bordaDir`) do toque até soltar.
- **Um contato, um instante.** Cada contato (pegar, pousar, tocar a madeira) é um número só em `M.contatos`, usado pela imagem e pelo som. O render grava `contatos_<v>.json` e a conferência compara cada contato com o som mais próximo e mede a subida de energia no mp4. Na v6: todos a 0 ms do evento e a no máximo 10 ms no mp4.
- **Forma amarela na frente do bolo (1–5 s da v5):** era o lado cortado do bolo (`#d9a659`). A suavização Catmull-Rom de `forma` arredondava o retângulo e ele estufava para fora. Correção: `forma(..., { reto: true })` desenha retângulos com cantos retos. O lado cortado saiu, porque a fatia agora já está servida no pratinho, longe do bolo.
- **Sem a luz verde da geladeira.**
- **A queda termina num lugar claro.** As letras caem no pratinho, longe da mão e da beira da mesa. Só o "I" fica em cima da fatia, ao lado da cereja. As outras ficam de pé no prato, na frente da fatia. Assim a cereja e o vão da garfada continuam à vista (com "M" e "O" em cima da fatia, eles tapavam os dois). O "Ó" escorrega do prato, rola, balança e para **de pé**, com o acento em cima. A distância rolada é calculada para fechar o giro em uma volta (com 812 px ele parava deitado e não se lia "Ó"). Ele gira em torno do próprio centro, senão afunda na mesa. Depois corta para o Nico olhando o "Ó" parado (bloco `olhar`).
- **Revisão de entrega:** ver o mp4 uma vez sem som seguindo só os objetos que se movem (na v6: cereja, prato e fatia), e outra com som, conferindo cada contato que se ouve com a mão. Folhas de quadros: `ffmpeg -ss A -t D -i X.mp4 -vf "fps=N,crop=...,scale=480:-2,tile=CxR"`. O filtro `drawtext` não funciona neste ffmpeg.
- **Níveis da v6 no celular simulado** (pico nos 60 ms do contato): mordida −2,9 dB, prato na entrega −7,9 dB (sob a voz), prato na volta −9,0 dB, "Ó" cai −9,6 dB, primeira letra −14,7 dB. Volume geral −15,5 LUFS, pico −0,9 dBTP, correlação 0,90.
- `conferir.py`: a janela de análise agora é `min(50 ms, tamanho do trecho)`. Sons mais curtos que 50 ms quebravam a medida.

## Nome do canal (18/11/2026)

"Meia Palavra" já existe no YouTube (`@meiapalavra`) e foi descartado pelo dono. Propus três nomes com o @ livre: Quase Disse, Edifício Sossego e Engoli Seco (detalhes em `.kiro/artifacts/13-nomes-para-o-canal.md`). **O dono escolheu "Quase Disse" (`@quasedisse`).** Em 18/11/2026 o @ estava livre; só fica garantido quando o canal for criado.

**Prompt mestre (18/11/2026):** o dono mandou um prompt de canal de superação "E se...?" para agregar valor, sem trocar a direção. A seção "O que entra do prompt mestre", em `IDENTIDADE.md`, diz o que entrou, o que foi adaptado e o que ficou de fora, com o motivo de cada um.
Como conferir: a busca do YouTube por canais (`results?search_query=...&sp=EgIQAg%253D%253D`, lendo `ytInitialData`) e o código HTTP de `youtube.com/@nome` (404 = sem canal público). O `curl` do ambiente acessa o YouTube. O script está em `/projects/sandbox/.nomes/checar.sh`.

## Som: o que o caderno de cenas do dono ensina (recebido em 18/11/2026)

O dono mandou o caderno com 67 sequências e 12 trechos de sincronia de DISCIPLINE, Ifverse e IF HUMANS. Os vídeos não estão no ambiente. As medidas são dele, não minhas. Os números de quadro batem com 30 qps (quadro 2913 ≈ 1min37,1s).
- **O ataque cai no quadro do contato:** a ~10 ms no saco (DISCIPLINE, 1min37,07s) e a ~30 ms no clarão (2min02s). Nossa meta (menos de um quadro) está certa.
- **A textura pode contar mais que o volume:** no café do Ifverse (0min12,4s) o volume quase não muda e a parte entre 2 e 8 kHz sobe de ~1% para 36% e 68%. No ep. 1, a mesma música passa de só graves (pelo teto) para só agudos (vazando do fone).
- **Nem todo corte merece acento:** o corte para a mão no café (0min16,25s) não tem ataque nenhum e fica quase todo abaixo de 250 Hz. Uma troca visual pequena (o mostrador de DISCIPLINE, 1min01,2s) também não ganha som.
- **Silêncio depois do corte cria espera:** no capuz de IF HUMANS (1min53,25s) a imagem se repete e o som cai para ~−45 dBFS.
- **Família de impactos:** DISCIPLINE dá o mesmo tipo de impacto a dois obstáculos. No canal, a fala escrita sempre soa como peça de madeira leve.
- **O som atravessa o corte quando o espaço é o mesmo:** no estádio do Ifverse (5min39s) o grave continua dos dois lados do corte.

## Fluxo de produção

1. Eu escrevo `falas.json` (texto) e `episodio.js` (blocos, planos, atuação, som).
2. `./produzir.sh <ep> guia v1` gera a voz-guia, alinha, renderiza e confere.
3. Desde 18/11/2026 a voz-guia é a narração final (decisão do dono).
4. Se um dia houver gravação humana: `./produzir.sh <ep> entrada/voz.m4a v2`. O alinhamento recorta cada fala, as ações presas a palavras se movem junto, e as pausas desenhadas são preservadas; as pausas da gravação não entram no vídeo.

Testado com uma gravação simulada mais lenta, com outra voz e em AAC: o vídeo passou de 23,5 s para 24,9 s, e "bolo", "sincero" e "dia" continuaram sincronizados com as ações.

## Regras de linguagem que funcionaram na prova

- **Dois ângulos com marcas fixas.** O geral fica de lado, como um palco. Os closes são três-quartos, do lugar de quem olha, com o ombro do outro desfocado no primeiro plano. Os olhares cruzam o quadro na mesma direção do geral (Nico olha para a direita, Bia para a esquerda). Cada personagem tem uma silhueta que se lê de costas (topete; coque).
- **A reação vem atrasada em relação ao som.** O som do contato chega no quadro do contato e o rosto só muda 0,22 s depois. Esse atraso é onde o público entende antes do personagem.
- **Algo continua depois que o corpo para:** o topete (mola), o prato que desliza sozinho, as letras no chão.
- **Fala de personagem é texto em cena e tem peso de objeto.** Só o narrador tem voz, o que resolve a restrição de uma voz só e mantém a cena legível para quem não entende português.
- **Na frase-chave da cena, o mundo some.** Geladeira, sala e relógio caem 40 dB em 30 ms. O primeiro som que volta (um tique) entra no plano de quem espera.
- **A narração some** nos 9 s de ação e volta só depois da reação.

## Mixagem para celular (medido no arquivo exportado)

- Alvo: −14 LUFS, pico −1,5 dBTP, com um limitador antes da normalização. Resultado v2: −15,2 LUFS e −0,9 dBTP depois do AAC. A codificação AAC sobe o pico; vale baixar o alvo de pico para −2.
- Somado em mono: correlação L/R de 0,93, sem cancelamento. A queda de ~3 dB no mono vem da lei de pan, não de fase.
- **Erro corrigido na v2:** o zumbido da geladeira estava quase todo em 100 Hz. Num alto-falante de celular (simulado com mono e faixa de 300 Hz a 7 kHz) o ambiente ficava 20 dB abaixo da voz, e o "mundo some" da mordida não se ouvia. A correção pôs harmônicos até 600 Hz e um assobio fraco em 1,18 kHz. A queda na mordida agora mede 36 dB no celular.
- **Hierarquia:** a mordida é o efeito mais alto (−1,9 dB em relação aos picos da voz no celular). Engolida −4,9, letras −7, cliques de garfo e tecido bem abaixo. Na v1 a engolida soava mais alta que a mordida no celular.
- Sons agudos curtos (metal, peças) parecem mais altos no celular do que na faixa cheia. Comece com eles 8 a 10 dB abaixo do que pareceria certo.

## Episódio 1 "O elevador", v1 (19/11/2026)

- **Mixagem:** o limitador antes da normalização achata os sons com muito grave. Na v1, subir o tranco 2 dB e a vassoura 4 dB mudou menos de 0,3 dB no celular. Para um efeito crescer no celular, tire o subgrave (abaixo de 120 Hz) e ponha corpo entre 300 e 800 Hz. Não adianta subir o ganho.
- **Passos:** os instantes dos passos saem da mesma fórmula que levanta o pé (o pé pousa a cada meio ciclo). Antes disso os sons estavam até 50 ms fora. Ritmo: Caio com ciclo de 0,9 s, Lurdes com 0,8 s. O ciclo antigo de 0,4 a 0,48 s parecia corrida.
- **Frases em cena:** 72 px para a dela e 60 px para a dele. No encaixe, a frase dele passa por baixo da dela, sem cruzar, e para logo abaixo, com a mesma inclinação. Lado a lado ficava "Bom dia.Bom dia." e não se lia.
- **Alcance:** a varredura quadro a quadro achou três faltas que o relatório geral não mostrava: a mão que ficava no encosto enquanto o corpo subia, o cabo da vassoura que passava por baixo do assento no meio do movimento e a perna de trás no passo do corredor. As correções foram soltar o encosto antes de o braço esticar, começar o cabo perto do teto e deixar o corpo afundar no passo. Rode `node motor/varrer.js ep01-elevador 0 94` depois de mudar uma pose; não pode imprimir nenhuma linha.
- **Close com corrimão:** o tubo é o da parede ao lado dela e passa por trás do corpo. Na frente do corpo ele parecia uma barra no peito.
- **Clique que para a música:** um clique no mesmo instante em que a música corta fica escondido pelo fim dela. Ele precisa ficar uns 3 dB acima da música; a −19 já se ouve.

## Sem Shorts (19/11/2026)

- O dono descartou os Shorts: "vou querer não, depois começa a fazer bagunça". O canal publica só o episódio. Não proponha Short no pacote de publicação.
- O Short do ep01 chegou a ser feito e foi apagado, junto com o código da câmera vertical (`motor/vertical.js` e o modo vertical do episódio). O episódio voltou ao código da v1; oito quadros conferidos antes e depois saem idênticos, pixel a pixel.

## Thumbnails (19/11/2026)

- Cada thumbnail é um quadro do próprio episódio, desenhado de novo em 1280x720 e recortado (`episodios/ep01-elevador/thumbs.js`). Por cima vai só o que a cena pede (notas, a frase) e no máximo 3 palavras.
- Mais contraste e cor do que no vídeo (contraste 1,12 e saturação 1,25), com vinheta. Texto em Archivo Black âmbar (#ffb347, a cor do número do painel) com contorno de tinta.
- O texto não cobre rosto nem mão. Conferido em 320x180 e 168x94 (tamanhos de celular); as três palavras ainda se leem.

## Episódio 2 "O porteiro", v1 (19/11/2026)

- **Tamanho fixo dos personagens** (pedido do dono): `motor/elenco.js` tem a altura de cada um (Caio 1,00 · Arlindo 0,88 · Lurdes 0,72, com o Caio a 734 px na linha de referência) e a escala sai só da profundidade. `motor/alturas.js <ep>` desenha cada personagem do quadro sozinho, mede a altura e compara com a tabela. Na v1: desvio máximo de 1,7%.
- **Vistas de costas:** quem sai pela porta de vidro anda para longe da câmera. O Caio, a Lurdes e o Seu Arlindo ganharam vista de costas com a mesma altura da vista de frente (conferido na folha de elenco, `episodios/ep02-porteiro/folha_personagens.js`).
- **Letra de mão:** cada apartamento escreve no livro com uma fonte manuscrita diferente (todas OFL, em `assets/fontes/` com as licenças). A tinta é a mesma, porque a caneta é a dele.
- **Andar com passos inteiros:** `trajeto()` arredonda cada trecho para meio-passos inteiros, e assim o personagem para com os dois pés no chão. Os instantes dos passos saem da mesma conta.
- **Mixagem num episódio quieto:** o limitador prende os picos dos efeitos principais no mesmo teto, então baixar 2 dB não muda nada. Para o encaixe ficar abaixo do bzzz, foi preciso baixar 15 dB. Um zumbido só cresce no celular com a energia entre 300 e 900 Hz.
- **Volume:** a v1 ficou em −20,1 LUFS, 4 dB abaixo do ep01. Comprimir a mixagem até −15 LUFS fazia sons longos (páginas, engolida) passarem do efeito principal. A hierarquia venceu. `render.js` agora aceita `E.limite` e `E.master` por episódio; o ep01 não usa e soa igual.
- **Sincronia:** a conferência automática no mp4 se confunde em grupos de eventos colados. Nesses casos, cada som é medido sozinho (todos começam a até 33 ms do contato). O espaço entre palavras não é peça: não aparece, não cai e não soa.
- **Thumbnails** (`episodios/ep02-porteiro/thumbs.js`): renderizadas em 2560x1440 a partir do episódio, com foco escuro em volta do rosto, luz quente e o texto fora do rosto. No close da leitura, os olhos ficaram mais abertos e molhados. Com as pálpebras baixas, ele parecia sonolento, não emocionado. A mudança também foi para o vídeo.

## Pendências (dependem de teste)

- Ouvir de verdade, num celular. Tudo acima foi medido; ninguém escutou ainda.
- Voz humana: não é mais necessária (narração sintética). Se voltar a ser usada, o alinhamento só foi testado com vozes sintéticas.
- As letras no plano geral têm 30 px e não se leem como palavra, só como objeto branco. Na prova isso basta; um episódio que dependa da leitura precisa de um plano mais fechado.
- O sorriso forçado no close se lê como sorriso. Que ele é forçado vem da pupila pequena e do tremor, e isso é sutil. Pode precisar de exagero.
