# 10 · Som, narração e sincronia

## 1. Princípios aprovados

- **Música mínima ou nenhuma.** Quem manda é a narração e os efeitos **[APROVADO EM OUTRO CANAL]**, nos dois canais. No Quase Disse, música só existiu dentro da cena: a música do vizinho e o rádio do quartinho.
- **Efeito no quadro do contato.** A meta é menos de um quadro: 42 ms a 24 qps **[APROVADO EM OUTRO CANAL]**.
- **Hierarquia no celular:** no celular simulado, o som principal da cena precisa ser o efeito mais alto **[APROVADO EM OUTRO CANAL]**.
- **Revisão com som:** confira cada contato que se ouve com a mão que o produz **[APROVADO EM OUTRO CANAL]**.

## 2. Síntese de som por código (`motor/som.js`)

Tudo é gerado amostra por amostra, a 48 kHz. **Nenhum som vem de biblioteca.** O dono não consegue baixar sons e a internet do ambiente pode bloquear downloads.

**Primitivas:**
- `ruido(n, seed)`: branco.
- `ruidoRosa(n, seed)`: filtro de Paul Kellet.
- `seno(n, f | f(t))`: a frequência pode variar no tempo.
- `biquad(x, 'lp'|'hp'|'bp'|'pico', f | f(t), q, ganho)`: filtro RBJ. A frequência pode variar; os coeficientes são recalculados a cada 32 amostras.
- `env(x, fn)`: envelope.
- `ataqueQueda(a, d)`.
- `soma(...)`, `escala(x, g)`, `dB(d)`, `n(seg)`.
- `curva([[t, dB]...])`: automação interpolada em dB.
- `comprimir(x, limiar, razao, ataque, soltura)`: compressor RMS.

**Mesa de mixagem:**
- `mesa.por(x, t, { g, pan, dist, nome, origem, funcao })` põe um som no instante `t`.
  - `dist` de 0 a 1 abafa o som (passa-baixa em `16000 · 0,25^dist`), baixa 6 dB por unidade e manda mais para a sala.
  - `pan` usa a lei de seno e cosseno.
  - `nome` entra na planilha de som e no `eventos.json`, que as conferências leem.
- `mesa.porLeito(x, t0, gFn, panFn, envio, info)`: leitos contínuos (ambiente), com ganho e pan que variam no tempo. Exemplo: o ambiente some quando o plano muda de lugar.
- `mesa.sala(tamanho, abafa, nivel)`: reverb tipo Schroeder/Freeverb, com 6 filtros em pente e 3 passa-tudo. O estéreo vem do deslocamento dos atrasos (+23 amostras). O render usa `sala(0.74, 0.4, 0.45)`.

**Receitas que funcionaram** (estão em `episodios/*/som_ep.js`):

| Som | Receita |
|---|---|
| Peça de madeira (fala escrita aparece) | seno f (1050 a 1350 Hz) com queda de 22 ms + seno 2,3f com queda de 12 ms × 0,4 + ruído passa-banda 2200 Hz com queda de 4 ms × 1,4 |
| Encaixe das falas | duas peças (1580 e 1720 Hz) a 9 ms uma da outra + corpo de ruído passa-banda 380 Hz com queda de 30 ms × 2,2 |
| Toque de madeira ou batida (`toc`) | ruído passa-banda em corpoF (Q 3,5, queda 35 ms) × 5 + estalo de 2400 Hz (4 ms) + seno grave que desce |
| Clique de plástico (botão) | seno de 2300 Hz com queda de 8 ms + passa-alta de 3 kHz com queda de 2 ms |
| Tec da caneta (ep02) | clique passa-banda 3300 Hz (3 ms) × 2 + corpo de 1150 Hz (12 ms) × 1,6 + "mola" seno de 5400 Hz (18 ms) × 0,18 |
| Passo | `toc` com corpo de 380 a 500 Hz e passa-baixa de 1400 a 2600 Hz, conforme o sapato |
| Vassoura no gesso | corpo passa-banda 540 Hz (30 ms) × 5 + grave que desce de 150 Hz + estalo de 2100 Hz + "farelo" agudo depois de 30 ms |
| Tranco do elevador | baque grave + corpo de 340 Hz + parciais de chapa (410, 655, 980, 1340 Hz) + 26 tilintares de corrente aleatórios |
| Estalo de cabo | estalo passa-alta + parciais (1830 a 5420 Hz) + 3 ecos do poço cada vez mais abafados |
| Plim de elevador | seno de 1318,5 Hz (queda 0,35 s) + 1760 Hz entrando a 0,11 s |
| Bzzz de porta (ep02) | harmônicos de 120 a 960 Hz com mais peso de 300 a 720 Hz, saturados com `tanh`, passa-alta de 280 Hz (2 vezes) |
| Engolida | seno que desce de 300 para 85 Hz + clique de 1300 Hz + ruído de 700 Hz |
| Respiração | inspira: ruído passa-banda que sobe de 1100 a 2500 Hz; expira: passa-banda de 800 Hz |
| Zumbido de luz | harmônicos de 120 Hz até 1200 Hz (precisa de energia até ~600 Hz para existir no celular) |
| Geladeira | 100, 200, 300 e 450 Hz + um assobio fraco de 1180 Hz |
| Música em duas texturas (ep01) | a mesma partitura (100 bpm, colcheia de 0,3 s, ataques nas colcheias 1, 3, 4 e 7). Pela laje: passa-baixa de 240 Hz + um resto da melodia em 470 Hz. Pelo fone: passa-alta de 1700 Hz + pico em 3200 Hz. |

## 3. Mixagem e o celular

**[TESTADO]**

- **Alvo:** o render pede −14 LUFS e −1,5 dBTP ao `loudnorm`, com o limitador **antes** da normalização. Na prática, o resultado fica abaixo disso (ep01 −16, ep02 −20): o limitador a 0,5 e o `loudnorm` linear não sobem um episódio quieto sem estourar o pico, e a Kiro escolheu não comprimir para não inverter a hierarquia. **Alvo de entrega aceito até agora:** de −14 a −17 LUFS; o ep02 a −20 ficou como exceção, ainda sem a opinião do dono. O AAC sobe o pico real em 0,3 a 1 dB. Se o mp4 passar de −1 dBTP, baixe o wav e refaça só o áudio do mp4 (`-c:v copy`).
- **Resultados:**
  - ep01: −16,0 LUFS, −1,2 dBTP, correlação L/R 0,96;
  - ep02: −20,1 LUFS, −2,1 dBTP, 0,85;
  - prova v6: −15,5 LUFS.
- **O celular simulado** tem duas versões, e elas não dão números idênticos:
  - **`motor/conferir.py`** (a medida oficial do relatório): soma em mono `(L+R)/2` e aplica filtros biquad RBJ de 2ª ordem em numpy: passa-alta de 300 Hz duas vezes e passa-baixa de 7 kHz uma vez (função `banda_celular`). Mede o nível de cada evento como o maior RMS em janelas de 50 ms, relativo à média da voz.
  - **Scripts de conferência dos episódios** (`conferencia/celular_e_contatos.py` e `niveis.py`): usam o filtro do ffmpeg `pan=mono|c0=0.5*c0+0.5*c1,highpass=f=300,lowpass=f=7000` e dão o pico em dB FS absoluto. Os números das hierarquias citadas (−12,0 dB no tranco etc.) vêm deste método.
  - Compare sempre números do mesmo método.
- **Hierarquia medida no ep01** (dB no celular): tranco −12,0 · encaixe −15,1 · engolida −16,3 · "Bom dia." dele −17,9 · dela −18,3. O efeito principal é o mais alto.

**Lições (não repetir):**
1. **Sons graves não crescem no celular.** O limitador os achata. Para um efeito subir no celular: tire abaixo de 120 Hz e ponha corpo entre 300 e 800 Hz. Subir o ganho não adianta: no ep01, +2 a +4 dB mudaram menos de 0,3 dB.
2. **Sons agudos curtos crescem no celular.** Comece metal e cliques de 8 a 10 dB abaixo do que pareceria certo.
3. **Vários impactos juntos somam.** Oito letras em 0,25 s passaram o som principal em +3 dB. Meça grupos, não só eventos isolados.
4. **O limitador prende os picos no mesmo teto.** Para um efeito ficar abaixo de outro, às vezes é preciso baixá-lo 15 dB, não 2.
5. **Uma medida sob a narração inclui a voz.** Para comparar efeitos, use os eventos fora da narração. O script `conferencia/niveis.py` do ep02 marca "(sob a narração)".
6. **Comprimir para ganhar volume pode inverter a hierarquia.** No ep02, a compressão levou a −15 LUFS, mas fez as páginas e a engolida passarem do efeito principal. A decisão foi manter a hierarquia.
7. **Um clique no mesmo instante em que a música corta fica escondido.** Ponha-o uns 3 dB acima da música.
8. **O zumbido de geladeira em 100 Hz some no celular.** Ponha harmônicos até 600 Hz e um assobio fraco.
9. **Um ambiente que muda por lugar** dá continuidade: o leito segue o plano.
10. **O som atravessa o corte quando o espaço é o mesmo** (Ifverse).

## 4. Narração

**Situação:**
- Quase Disse: voz sintética Piper `pt_BR-faber-medium` **[APROVADO EM OUTRO CANAL]**.
- Bovonel: o dono gerava voz de IA numa ferramenta não registrada e mandava o MP3.
- **Canal novo:** "eu forneço a narração" **[PENDENTE: ainda não se sabe se é a voz dele ou uma IA]**.

**Voz-guia** (`voz.py guia <ep>`):
1. Piper sintetiza cada fala com `--length-scale guia_lentidao` (1,08 a 1,15).
2. Converte para 48 kHz com passa-alta de 70 Hz.
3. Junta as falas com 1,6 s de silêncio entre elas.
4. Passa pelo mesmo alinhamento que uma gravação real vai passar.

Isso permite animar antes da gravação final. Quando ela chegar, `voz.py alinhar <ep> entrada/voz.m4a` refaz os tempos, e as ações presas a palavras andam junto. **[TESTADO]** com uma gravação simulada mais lenta e em AAC: o vídeo passou de 23,5 para 24,9 s e continuou sincronizado.

**Vozes disponíveis:** `recursos/voz/pt_BR-faber-medium.onnx` e `pt_BR-cadu-medium.onnx`, com os `.json` de configuração.
- **Licença:** dados CC0. A faber foi treinada a partir de um modelo base de dados Hi-Fi TTS (provavelmente CC BY 4.0). Por precaução, credite "Narração: voz sintética Piper (faber)" **[NÃO CONFIRMADO juridicamente]**.

## 5. Alinhamento (como cada palavra ganha o seu instante)

`motor/voz.py alinhar`:

1. **Converter** a gravação para 48 kHz mono (`voz48k.wav`).
2. **Transcrever** com faster-whisper `small` (CPU, int8, `language='pt'`, `word_timestamps=True`). O modelo baixa do Hugging Face no primeiro uso, para `.tools/hf/`.
3. **Casar o texto do roteiro com o que foi ouvido** com `difflib.SequenceMatcher`, depois de normalizar.
   - `equal`: usa o tempo ouvido.
   - `replace` (o reconhecedor ouviu outra palavra): usa o tempo da palavra ouvida na mesma posição.
   - Palavras sem par: interpoladas entre as vizinhas.
4. **Bordas da fala pela energia** (`refinar`): RMS a cada 10 ms com limiar no máximo −42 dB. Inclui até 250 ms antes (ataque) e 400 ms depois (cauda), com margem de −40 ms e +80 ms.
5. **Correção de +68 ms** nas palavras internas (`CORRECAO_WHISPER`). O Whisper marca o início cedo demais.
   - Medido com `motor/teste_alinhamento.py`: o Piper informa a duração de cada fonema, então o início real de cada palavra é conhecido; as falas são juntadas e codificadas em AAC como um áudio de celular.

**Resultado do teste** (erro médio por palavra em fala contínua):

| Voz · ritmo · pausas | Whisper cru | Encaixe por energia (técnica do Bovonel) | **Whisper + 68 ms** |
|---|---|---|---|
| cadu · 1,0 · 0,4 s | 51 ms | 96 ms | **33 ms** |
| faber · 1,25 · 0,6 s | 52 ms | 87 ms | **27 ms** |
| cadu · 1,4 · 1,5 s | 71 ms | 90 ms | **44 ms** |

- O **encaixe por energia do Bovonel piorou** em fala contínua, porque não há vale de energia entre as palavras. Fica desligado; liga com `VOZ_ENCAIXE=1`.
- O pior caso passa de 100 ms, quase sempre na primeira palavra de uma fala que começa por vogal.
- **Calibrado só em voz sintética. Com voz humana, rode o teste de novo** **[PENDENTE]**. Como calibrar com a voz do dono:
  1. Peça a ele que grave 4 ou 5 falas de um episódio, com 1 a 2 s entre elas, no celular.
  2. Rode `voz.py alinhar <ep> entrada/<arquivo>`.
  3. Para cada fala, marque à mão o início real de 5 a 8 palavras internas, olhando a forma de onda. Use um zoom do envelope de 5 ms, que dá para desenhar com o canvas, e a escuta com `ffmpeg -ss`.
  4. A média de (início real − início do alinhamento) é o novo viés. Ajuste com `VOZ_CORRECAO=<segundos>` ou mude `CORRECAO_WHISPER` em `voz.py`.
  5. Registre o erro médio antes e depois em `DECISOES.md`.

**Palavras que o Whisper erra:**
- **Nomes próprios e palavras raras.** "Arlindo" foi ouvido como "alimdo". **"Cobaia" foi ouvida como "Acobar"** no teste do modelo, em 19/11/2026.
- O casamento por posição (`replace`) salvou os tempos nos dois casos. Mesmo assim, para o canal novo, considere passar `initial_prompt` com os nomes do canal na transcrição. Num teste solto, `initial_prompt='Seu Arlindo, porteiro.'` fez o Whisper acertar **[TESTADO]**, mas isso não está no `voz.py`.
- O `relatorio.txt` avisa quando menos de 70% das palavras batem. Nesse caso, confira os disparos por palavra.

## 6. Sincronia: como garantir e como medir

1. **Um contato = um instante** em `M.contatos`. A imagem chega lá e o som começa lá.
2. **O instante vem da mesma fórmula do movimento.** Passos: o pé pousa a cada meio ciclo. Queda: `t0 + √(2h/g)`. Clique: o instante em que o polegar chega ao botão.
3. **Medir no mp4.** Os scripts estão em `episodios/ep01-elevador/conferencia/celular_e_contatos.py` e `ep02-porteiro/conferencia/sincronia.py`.
   - Envelope de 4 ms da derivada do áudio.
   - Para cada contato, procura a maior subida (pelo menos 6 dB) a ±60 ms.
   - Resultado no ep01: de −16 a +20 ms.
4. **Quando o detector se confunde** (eventos a menos de 60 ms um do outro, ou sob a voz), **meça cada som sozinho**. Monte uma mesa só com aquele evento e ache o primeiro momento acima de 10% do pico. No ep02, todos os 143 sons começaram a até 33 ms do contato.
5. **A reação do rosto vem 0,22 s depois do som** (docs/07). Isso é linguagem, não erro de sincronia.

## 7. Para o canal novo [PROPOSTA]

- **O narrador é personagem** (o pesquisador). Direção: calmo, seco e preciso, com meia pausa antes do veredito. Se a voz for do dono, ele grava as falas com 1 a 2 s entre elas, num celular, num cômodo quieto. O alinhamento cuida do resto.
- **A cobaia não tem voz.** Os sons dela são efeitos (passinhos, guinchinho opcional) e falas escritas com o som de madeira.
- **O som que conta em cada experimento:** o celular com som de cassino, o despertador que vira personagem.
- **O silêncio antes do carimbo do veredito.**
- **Sem música de fundo.** Se houver música, só dentro da cena (o rádio, o celular tocando).
