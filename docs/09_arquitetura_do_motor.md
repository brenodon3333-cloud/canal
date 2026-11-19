# 09 · Arquitetura do motor de animação

O motor vive em `codigo/motor-quase-disse/`. **[TESTADO]**: foi reconstruído do zero numa pasta limpa em 19/11/2026 e gerou vídeo, som e conferências (docs/13).

Ele é o motor do canal novo, até que o dono decida outra coisa **[PROPOSTA]**.

---

## 1. Visão geral

```
falas.json ──► motor/voz.py ──► narracao/voz48k.wav + tempos.json (início e fim de cada palavra)
                                         │
blocos (episodio.js) ──► motor/tempo.js ─┴─► T: B('bloco'), W('L1','palavra'), falas, total
                                                         │
                         episodio.js: marcas(T) → M (todos os instantes, planos, contatos)
                                    ├─ desenhar(g, t, T)  ─┐
                                    └─ som(mesa, T, S)     ├─► motor/render.js ─► ffmpeg ─► .mp4 / .wav / .srt
                                                           │        + relatorio, contatos, eventos, planilha de som
motor/som.js (síntese + mesa de mixagem) ─────────────────┘
motor/conferir.py · varrer.js · alturas.js · folha.js · recorte.js  ──► conferências do arquivo final
```

**Tecnologia:**
- Node 22 com `@napi-rs/canvas`. É a API Canvas 2D do navegador, em Node: `fillRect`, caminhos, gradientes, `filter: blur`, modos `multiply`, `screen` e `overlay`, e fontes TTF via `GlobalFonts.registerFromPath`.
- Python 3.11 num `.venv` local, com `numpy`, `piper-tts`, `faster-whisper` e `imageio-ffmpeg`.
- O ffmpeg vem do pacote `imageio-ffmpeg`. É um binário estático, ligado em `.tools/bin/ffmpeg`.

**Por que não o navegador do Bovonel:** o Bovonel tinha um motor com Playwright, WebCodecs e um gravador de MOV próprio, porque o ambiente dele não tinha ffmpeg. Com ffmpeg, tudo fica em Node e é mais simples.

**Atenção:** o filtro `drawtext` do ffmpeg **não funciona** neste ffmpeg. Desenhe texto no canvas.

## 2. Pastas

```
motor-quase-disse/
├── preparar.sh            instala tudo localmente (docs/13)
├── produzir.sh            voz → render → conferência, num comando
├── package.json           dependência: @napi-rs/canvas
├── motor/
│   ├── desenho.js         traço com fervura, formas, membros, olho, boca, curvas de tempo, grão
│   ├── tempo.js           linha do tempo de blocos e palavras
│   ├── som.js             síntese (ruído, senos, biquads, envelopes), mesa de mixagem, sala, compressor
│   ├── render.js          renderiza som, imagem, legendas .srt, relatórios
│   ├── voz.py             voz-guia Piper e alinhamento Whisper
│   ├── teste_alinhamento.py   mede o erro do alinhamento contra uma referência exata
│   ├── conferir.py        mede o arquivo final: loudness, mono, celular simulado, quadros
│   ├── elenco.js          altura fixa por personagem e escala por profundidade
│   ├── alturas.js         confere as alturas quadro a quadro
│   ├── varrer.js          confere o alcance das mãos e dos pés quadro a quadro
│   ├── recorte.js         recortes de quadros e relatório de alcance
│   └── folha.js           folha de contato de PNGs
├── episodios/<ep>/
│   ├── falas.json         texto da narração: [{ id, texto, guia_lentidao }]
│   ├── episodio.js        blocos, marcas, planos, cenas, poses, contatos (o episódio inteiro)
│   ├── personagens.js     desenho dos personagens
│   ├── som_ep.js          som do episódio
│   ├── thumbs.js          thumbnails (ep01 e ep02)
│   ├── ROTEIRO.md         roteiro, tabelas e medidas da versão final
│   ├── narracao/          voz48k.wav, tempos.json, relatorio.txt (e _guia/ com a voz-guia)
│   └── conferencia/       scripts de conferência do episódio
├── assets/fontes/         Archivo Black e 8 fontes de mão (OFL, com as licenças)
├── entrada/               gravações recebidas (simulacao_gravacao.m4a: teste de voz mais lenta em AAC)
└── saida/<ep>/            tudo que o render gera (não vai para o pacote; é regenerável)
```

**O que é motor e o que é do episódio:**
- **Motor, compartilhado:** tudo em `motor/`.
- **Do episódio:** `episodio.js`, `personagens.js`, `som_ep.js`, `thumbs.js`, `folha_personagens.js` e `conferencia/*.py`. Os scripts de conferência são específicos de cada episódio, porque leem os nomes dos eventos daquele episódio.
- **Também por episódio:** a cinemática inversa (`ik`), as primitivas de luz (`luz`, `brilho`, `escurece`) e a câmera (`camera`, `camada`). Elas estão copiadas em cada `episodio.js`. Mova-as para `motor/` no canal novo (docs/15).
- **Regras automáticas da Kiro:** `.kiro/steering/canal-animacao.md`. É uma pasta oculta e não aparece no `ls` simples. Use `ls -a`.

## 3. O contrato de um episódio

`episodios/<ep>/episodio.js` exporta:

| Campo | Tipo | O que é |
|---|---|---|
| `FPS` | número | 24 |
| `blocos` | lista | `{ id, dur }` (duração fixa) ou `{ id, fala: 'L1', antes, depois }` (duração = antes + duração real da fala + depois) |
| `desenhar(g, t, T)` | função | Desenha o instante `t` em coordenadas de 1920 × 1080 |
| `som(mesa, T, S)` | função | Põe todos os sons na mesa (`S` = `motor/som.js`) |
| `contatos(T)` | função | Lista de `{ nome, t }`: os instantes em que a imagem mostra um toque |
| `relatorio()` | função | Texto com a falta de alcance por gesto e a lista de contatos |
| `ganhoVoz` | dB | Ganho da narração (0 no ep02, −2 no ep01) |
| `legendas` | booleano | `false`: nada queimado na imagem (regra do dono) |
| `srt` | booleano | `true`: gera o `.srt` da narração |
| `limite`, `master` | opcional | Teto do limitador (padrão 0,5) e filtro ffmpeg antes dele. O ep01 e o ep02 usam o padrão. |

**Modelo mínimo:** `episodios/_modelo/` é um episódio de 4,5 s com um personagem simples, uma fala, um braço de tamanho fixo e um contato com som. **[TESTADO]** na reconstrução. Comece copiando essa pasta.

## 4. A linha do tempo (`motor/tempo.js`)

```js
const T = montarTempo(E.blocos, tempos);   // tempos = narracao/tempos.json
T.B('bomdia')            // { ini, fim, dur } do bloco
T.W('L1', 'teto')        // { ini, fim } absolutos da palavra (1ª ocorrência; T.W('L1','bom',2) = 2ª)
T.fala('L1')             // { ini, fim, srcIni, srcFim, palavras }: onde a fala entra e de onde sai no arquivo
T.total                  // duração do episódio
```

- A comparação de palavras ignora acento, maiúscula e pontuação (`norm`).
- **Palavra que não existe na fala = erro na hora.** Assim nenhuma ação fica presa a uma palavra trocada.

**Regra:** toda ação ligada à narração usa `T.W`. Os segundos fixos só valem dentro de blocos sem fala. Quando a gravação real chega, as falas mudam de duração, os blocos se ajustam e as ações andam junto.

## 5. As marcas (`marcas(T)` dentro do episódio)

É uma função calculada uma vez e guardada em `M`. Ela cria:
- `M.b`: o início de cada bloco.
- **Grupos de instantes nomeados por bloco.** No ep01, por exemplo: `M.tr.tranco = b.tranco + 0.25` e `M.rs.encaixe = b.resposta + 1.6`.
- **`M.planos`**: a lista de `{ de, ate, id, bloco }`. Um plano por bloco, mais os cortes inseridos no meio. `planoEm(t)` devolve o plano do instante.
- **`M.contatos`**: cada toque é **um instante único**, usado pela imagem (a mão chega nesse `t`) e pelo som (o som começa nesse `t`). Esse é o segredo da sincronia: **imagem e som leem o mesmo número**.

## 6. O desenho de um quadro

```js
function desenhar(g, t, T) {
  marcas(T); const p = planoEm(t);
  D.linhaK.k = 1; D.ferv.amp = 1.6;
  if (p.id === 'A') cenaA(g, t, M); else if (p.id === 'B') cenaB(g, t, M); /* ... */
  // grão por cima
}
function cenaB(g, t, m) {
  const cam = { z: lerp(1.0, 1.03, fr(t, ini, ini + 6)), cx: 960, cy: 540 };
  g.fillStyle = '#100e18'; g.fillRect(0, 0, 1920, 1080);
  camada(g, cam, 1, () => { /* cenário, personagens (pose = função do tempo), objetos, falas, luz */ });
}
```

**Cada pose é uma função pura do tempo** (`poseCaioC(t, m)` devolve o objeto de pose). Por isso:
- qualquer quadro pode ser desenhado sozinho, fora de ordem, o que permite olhar só os quadros de interesse;
- `varrer.js` e `alturas.js` funcionam;
- dois renders do mesmo código dão o mesmo resultado. Foi confirmado pixel a pixel no ep01, antes e depois de apagar o código do Short.

**Estrutura usada para escrever uma pose:**

```js
function poseLurdesC(t, m) {
  const p = { olhoX: 0.15, olhoY: 0.1, pupila: 0.5 };                                // estado padrão
  const relance = pulso(t, m.e.motor + 0.2, 0.3);                                   // um gesto = uma curva no tempo
  p.olhoX = lerp(p.olhoX, -0.9, Math.min(1, relance * 1.6));
  if (t >= m.tr.tranco) { /* camada nova de atuação por cima da anterior */ }
  return p;
}
```

## 7. O render (`motor/render.js`)

```
node motor/render.js <ep> [--versao v1] [--escala 0.5] [--quadros 3.2,10.5] [--so-som]
```

- **`--quadros`:** grava só PNGs daqueles instantes (`saida/<ep>/quadro_<v>_<t>.png`). Leva segundos. Use sempre antes do render completo.
- **`--so-som`:** gera só o som (wav, planilha, eventos e contatos).

**Som:**
1. Cria a `Mesa`.
2. Chama `E.som`.
3. Recorta cada fala da gravação (`voz48k.wav`), comprime (−26 dB, 2,5:1), põe 12 ms de rampa nas bordas e posiciona na mesa.
4. Aplica a sala (reverb).
5. Mede com `alimiter` + `loudnorm` e aplica o ganho linear em duas passadas: alvo −14 LUFS e −1,5 dBTP.
6. Grava o wav em 48 kHz, 16 bits.

**Vídeo:**
- Para cada quadro: `D.ferv.passo = floor(t · 12)`, escala para a resolução, `E.desenhar` e a legenda (desligada).
- Os pixels RGBA vão por pipe para o ffmpeg com `libx264`, `-crf 18`, `-preset medium`, `-tune animation`, `yuv420p`, AAC de 192k e `+faststart`.

**Saídas em `saida/<ep>/`:**
- `<ep>_<v>.mp4`, `.wav` e `.srt`;
- `planilha_som_<v>.md`: cada som com instante, origem, distância e função;
- `eventos_<v>.json`;
- `contatos_<v>.json`;
- `relatorio_<v>.txt`.

**Tempo medido:**
- ep02 (137 s): **9 min** para renderizar o vídeo em 1080p (3289 quadros, ~6 qps).
- Prova de 35 s em 540p: 45 s.
- Quadros soltos: menos de 1 s cada.

## 8. Comandos do dia a dia

```
./produzir.sh <ep> guia v1                       # voz-guia + render + conferência
./produzir.sh <ep> entrada/voz.m4a v2            # gravação real (qualquer formato que o ffmpeg abra)
.venv/bin/python motor/voz.py guia <ep>          # só a voz-guia e o alinhamento
.venv/bin/python motor/voz.py alinhar <ep> <arquivo>
node motor/render.js <ep> --versao t1 --escala 0.5 --quadros 1.2,4.0,7.5
node motor/varrer.js <ep> 0 <duração>            # não pode imprimir nada
node motor/alturas.js <ep>                       # desvio <= 3%
.venv/bin/python motor/conferir.py <ep> v1       # loudness, mono, celular, quadros
node motor/folha.js saida.png 4 a.png b.png ...  # folha de contato
node -e "require('./episodios/<ep>/episodio.js')" # confere a sintaxe depois de editar
```

## 9. Armadilhas conhecidas

- **Um PNG recém-gravado às vezes não abre na leitura da Kiro.** Espere 3 a 6 s e tente de novo.
- **Renderize em primeiro plano, com timeout longo** (até 30 min). Em segundo plano, o processo não avançou neste ambiente.
- **`/tmp` não persiste** entre comandos, e o `pip` global é só leitura. Tudo fica dentro da pasta do projeto.
- **Variáveis de módulo** (`let M = null`) guardam as marcas. Se mudar `blocos` numa mesma execução, zere `M`.
- **Imagem do mp4 diferente do canvas:** confira sempre os quadros extraídos do mp4 (`conferir.py <ep> <v> 3.2 10.5`), não só o canvas. A compressão e o `yuv420p` podem mudar cores escuras e texto fino.
