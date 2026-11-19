# PROMPT MESTRE — Documentário por referência
*por Tubemakers · licença MIT*

Primeira vez? Comece pelo passo **0) Instalar**. Depois, para cada vídeo, abra o Claude Code numa **pasta vazia** e siga do passo 1.
Troque o que está entre `< >`. Cole um prompt por vez e espere o Claude terminar.

---

## 0) Instalar (só na primeira vez)
1. Descompacte o `.zip` numa pasta (ex.: `Documentos\documentario-por-referencia`).
2. Abra o **Claude Code nessa pasta** (no app: *Abrir pasta*; no terminal: `cd` até a pasta e digite `claude`).
3. Cole:
```
Descompactei o pacote "documentario-por-referencia" nesta pasta. Leia o LEIA-ME.md e instale tudo para mim:
1. confira se tenho Python 3.10+, FFmpeg e Node.js 18+; se faltar algo, me mostre o comando e instale com a minha permissão;
2. rode o instalador do meu sistema (instalar_windows.ps1 no Windows, instalar_mac_linux.sh no Mac/Linux);
3. rode o verificar_ambiente.py e me diga o que ainda falta (por exemplo, ligar o navegador ou um conector de IA).
No fim, me explique em poucas linhas como começar o primeiro documentário.
```
4. Quando ele disser que está pronto, **feche essa conversa** e siga para o passo 1 numa conversa nova, dentro de uma **pasta vazia** para o seu vídeo.

## 1) Começar — análise da referência
```
Use a skill video-por-referencia.

Pasta do projeto: <caminho da pasta>
Vídeo de referência: <caminho do arquivo .mp4 OU link do canal/vídeo no YouTube>
Vídeos de movimento extras (opcional): <caminhos>
Modo: <CURTO vertical até 3 min | LONGO horizontal de 20 a 45 min>

Analise a referência quadro a quadro: ritmo, cortes, textos, movimentos, estrutura dos capítulos e som.
Salve tudo na pasta do projeto e me diga, em português simples, o que entendeu e as regras que vai seguir.
Não escreva o roteiro ainda.
```

## 2) Roteiro — pesquisa e narração para copiar
```
Tema: <empresa, pessoa ou acontecimento>
Duração: <ex.: 3 minutos | 30 minutos>
Ângulo (opcional): <ex.: "como a marca vende um sentimento", "o lado que ninguém conta">

Pesquise com fontes abertas, confira cada fato (2 fontes para afirmação forte), siga a fórmula do documentário
e passe o roteiro pelo revisor de risco. Me entregue:
- 3 opções de título
- o roteiro completo salvo na pasta
- a NARRAÇÃO num bloco único, pronta para eu copiar: números por extenso, [CAPÍTULO N] marcado e o guia de voz no topo.
Depois pare e espere o meu áudio.
```

## 3) Edição — a partir do seu áudio
Grave a narração na sua IA de voz (pode ser um arquivo só) e cole:
```
Aqui está a narração: <caminho do arquivo .mp3/.wav>

Transcreva palavra por palavra, confira com o roteiro e divida por capítulo.
Junte todo o material sem direitos autorais (acervo público, filmagens de arquivo, recortes 2.5D, imagens por IA
só onde não existir arquivo, música por capítulo e efeitos), me mostre o custo antes de gerar e monte a edição
no estilo da referência, com cada corte preso às palavras da minha voz.
Confira quadro a quadro antes de me entregar. <No LONGO: me mande cada capítulo para aprovar.>
```

## 4) Ajustes
```
Ajuste no vídeo:
- <mm:ss> <o que mudar, ex.: "troca a imagem por uma foto real do fundador">
- <mm:ss> <ex.: "a música está alta demais aqui">
Corrija só esses trechos, renderize de novo e confira os pontos alterados.
```

## 5) Publicação
```
Prepare a publicação: descrição com fontes, créditos do acervo e capítulos do YouTube,
3 opções de título, ideia de thumbnail e a lista de cenas feitas por IA.
Rode o revisor de risco no pacote final e me diga se preciso marcar "conteúdo alterado ou sintético".
```

---

### Dicas
- Uma pasta por vídeo. Tudo fica salvo lá (análise, roteiro, áudio, imagens com créditos, edição e vídeo final).
- No vídeo longo, peça "renderiza só o capítulo N" para aprovar em partes.
- Para ajustar, diga sempre o **tempo** (mm:ss): o Claude corrige só aquele trecho.
- Se não tiver conector de geração de IA, o Claude escreve os pedidos de imagem e música num arquivo para você gerar na sua ferramenta e salvar nas pastas indicadas.

---
Criado pelo canal **Tubemakers**.
