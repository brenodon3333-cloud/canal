# 13 · Guia de reconstrução do zero

Este guia foi **[TESTADO]** em 19/11/2026. O motor foi copiado do pacote para uma pasta limpa e montado com estes passos. Todas as verificações abaixo passaram, e os resultados reais estão citados em cada passo.

**Tempo:** os passos 1 a 4 levam uns 5 minutos. O passo 5 baixa o Whisper (~460 MB) na primeira vez e pode levar mais 5 a 10 minutos. O passo 6 leva cerca de 1 minuto, o passo 7 alguns segundos, e o passo 8 (opcional) cerca de 6 minutos para o ep01 de 93 s.

---

## Passo 0: o que o ambiente precisa ter

- Linux com bash, `curl`, `python3` (3.10 ou mais; o teste usou 3.11) e `node` 22 com `npm`.
- **Internet** para:
  - PyPI (pacotes Python);
  - npm (`@napi-rs/canvas`);
  - Hugging Face (o modelo `small` do faster-whisper, cerca de 460 MB, no primeiro alinhamento).

  As vozes Piper e as fontes já estão no pacote.
- **Sem internet:** é possível renderizar episódios que já têm `narracao/tempos.json`, porque eles não precisam do Whisper. Não é possível alinhar uma narração nova.

## Passo 1: copiar o motor

```bash
# PKG = onde está a pasta PROMPT_MESTRE_NOVO_CANAL (depois de descompactar o ZIP, ou já extraída)
unzip PROMPT_MESTRE_NOVO_CANAL_v1.zip -d ~/projeto      # se ainda estiver em ZIP
PKG=~/projeto/PROMPT_MESTRE_NOVO_CANAL
cp -r "$PKG/codigo/motor-quase-disse" ~/projeto/canal-novo   # copia também a pasta oculta .kiro/steering
cd ~/projeto/canal-novo
mkdir -p .tools/voz
cp "$PKG"/recursos/voz/pt_BR-faber-medium.onnx* .tools/voz/   # ANTES do preparar.sh: evita baixar a voz
cp "$PKG"/recursos/voz/pt_BR-cadu-medium.onnx* .tools/voz/    # voz alternativa
chmod +x preparar.sh produzir.sh
```

O nome `canal-novo` é só um exemplo. Use a pasta do workspace do ambiente novo.

## Passo 2: instalar

```bash
./preparar.sh
```

O script faz quatro coisas:
1. Cria o `.venv` e instala `imageio-ffmpeg`, `numpy`, `piper-tts` e `faster-whisper`.
2. Roda `npm install`, que traz o `@napi-rs/canvas`.
3. Liga o ffmpeg estático em `.tools/bin/ffmpeg`.
4. Baixa a voz e a fonte, se faltarem, e confere tudo.

**Saída esperada:** `pronto: ffmpeg=ffmpeg version ...` e depois `ambiente conferido: tudo presente`.

**Se aparecer "FALTA ...":** na reconstrução de teste, a primeira passada terminou sem o módulo nativo do canvas e sem o numpy. Rodar `npm install` e `.venv/bin/pip install imageio-ffmpeg numpy piper-tts faster-whisper` de novo resolveu. Rode `./preparar.sh` outra vez até sair "tudo presente".

## Passo 3: verificar o desenho

```bash
node -e "require('@napi-rs/canvas'); console.log('canvas ok')"
node motor/render.js ep02-porteiro --versao teste --escala 0.5 --quadros 18.8,88.5
```

- **Esperado:** dois PNGs em `saida/ep02-porteiro/quadro_teste_18.80.png` e `..._88.50.png`.
  - Aos 18,8 s: o saguão, com o porteiro e o Caio, e "Bom dia." encaixando.
  - Aos 88,5 s: o close do Seu Arlindo emocionado por cima do livro.
- **Compare** com `amostras/ep02_quadros_mp4.jpg`.
- Se as letras aparecerem numa fonte comum, a fonte não foi registrada. Confira `assets/fontes/`.

## Passo 4: verificar as conferências de personagem

```bash
node motor/alturas.js ep02-porteiro 0 137 --passo 8
node motor/varrer.js ep02-porteiro 80 110 | wc -l
```

- **Esperado:** `medidas: 160 · maior desvio da tabela: 1.7% · ... razão ... 1.8%`, e `0` no varrer.

## Passo 5: verificar a voz e o alinhamento

```bash
cp -r episodios/prova-bolo-3/narracao episodios/prova-bolo-3/narracao.original   # guarda o original
.venv/bin/python motor/voz.py guia prova-bolo-3
```

- **Esperado:** três linhas `L1: ...`, `L2: ...`, `L3: ...` com tempos.
- O primeiro uso baixa o modelo do Whisper para `.tools/hf/` e leva mais tempo.
- **Atenção:** este passo **reescreve** `episodios/prova-bolo-3/narracao/`. No teste, os tempos ficaram iguais aos originais, porque a voz é a mesma.

## Passo 6: verificar som, vídeo e conferência

```bash
node motor/render.js prova-bolo-3 --versao teste --escala 0.5
.venv/bin/python motor/conferir.py prova-bolo-3 teste
```

**Esperado:**
- `som: …wav`, `vídeo: …mp4` e `Maior falta em qualquer quadro do plano geral: 0.0 px`. No teste, isso levou 45 s.
- Na conferência:

  ```
  duração: 00:00:34.75
  loudness integrada: -15.3 LUFS estéreo · -18.7 LUFS somado em mono · pico real -0.9 dBTP
  correlação L/R: 0.90
  ```
- Compare com `amostras/prova-bolo-v6_amostra_540p.mp4`. O −15,5 LUFS citado em docs/10 é da v6 original em 1080p. Esta renderização de teste é em 540p e com a voz-guia refeita, por isso dá −15,3.

## Passo 7: verificar o episódio modelo

```bash
.venv/bin/python motor/voz.py guia _modelo
node motor/render.js _modelo --versao v1
.venv/bin/python motor/conferir.py _modelo v1
```

- **Esperado:** um vídeo de 4,5 s. Um boneco aperta um botão na palavra "botão" (2,47 s), o botão acende, ouve-se o clique, e os olhos dele mudam 0,22 s depois.
- **Esperado também:** o relatório avisa que só 40% das palavras bateram. O Whisper ouviu "Acobar e aperte o botão" em vez de "A cobaia aperta o botão". **É esperado e mostra uma limitação real** (docs/10, seção 5). Os tempos de "botão" saem certos mesmo assim.

## Passo 8: renderizar um episódio inteiro (opcional; cerca de 6 min para o ep01, 9 min para o ep02)

```bash
node motor/render.js ep01-elevador --versao conf
.venv/bin/python motor/conferir.py ep01-elevador conf
```

**Esperado:** −16,0 LUFS, −1,2 dBTP e correlação de 0,96, como na versão aprovada (`amostras/ep01_conferencia_celular.txt`).

## Passo 9: a pasta do canal novo

**[PROPOSTA]**. Mantenha o motor numa pasta só e o canal novo em `episodios/<nome>/`. Crie também, na raiz:

- `DECISOES.md`: copie a seção de decisões do docs/14 e continue.
- `IDENTIDADE.md`: quando o dono aprovar a identidade.
- `.kiro/steering/canal.md`: as regras que a Kiro deve ler automaticamente em toda conversa. Use `codigo/motor-quase-disse/.kiro/steering/canal-animacao.md` como modelo e tire o que era só do Quase Disse.
- **Ferramentas que vêm do Bovonel** (docs/15): ponha em `motor/` quando forem portadas.

## Problemas conhecidos e como identificar

| Sintoma | Causa | O que fazer |
|---|---|---|
| `Cannot find module '@napi-rs/canvas'` | `npm install` incompleto | `npm install` de novo |
| `No module named numpy` | pip incompleto | `.venv/bin/pip install imageio-ffmpeg numpy piper-tts faster-whisper` |
| `.tools/bin/ffmpeg` não existe | O link não foi criado | Rode `./preparar.sh` de novo |
| O Whisper trava ou não baixa | Sem acesso ao Hugging Face | `HF_HOME=.tools/hf`; teste a rede; ou use um `tempos.json` já pronto |
| Texto desenhado sem a fonte | A fonte não foi registrada | `GlobalFonts.registerFromPath(...)` no topo do episódio; confira `assets/fontes/` |
| Um render longo para no meio | Rodou em segundo plano | Rode em primeiro plano, com timeout longo |
| A Kiro não consegue abrir o PNG que acabou de gerar | Atraso do sistema de arquivos | Espere 3 a 6 s; reduza imagens acima de 10 MB |
| `palavra "x" não encontrada em L1` | O `T.W` pede uma palavra que não está na fala | Corrija a palavra ou o `falas.json` |
| `drawtext` do ffmpeg falha | Este ffmpeg não tem o filtro | Desenhe o texto no canvas |
