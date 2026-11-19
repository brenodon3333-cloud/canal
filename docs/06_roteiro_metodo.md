# 06 · Como pesquisar e escrever um episódio

Este método junta o que foi aprovado no Bovonel (método editorial e roteiro que segura), o que foi aprovado no Quase Disse (gancho, título depois do gancho, emoção por plano, pacote de publicação) e o que a pesquisa do Monke mostrou.

O que é específico do formato "A Cobaia" é **[PROPOSTA]**.

---

## 1. Escolher o tema

1. **Partir de uma promessa concreta e desejada.** Pelos dados do Monke **[OBSERVADO]**:
   - promessas concretas vão muito melhor que temas abstratos: sono (1,8 mi) contra "NPC" (12 mil);
   - "Tema não é ideia" (Bovonel).
2. **Preencher a ficha de 8 critérios** (docs/04, seção 1.2). Aprovar só a partir de 12/16 **[PROPOSTA]**.
3. **Para a Cobaia, a ideia tem forma de experimento:** uma crença da internet + um teste + um resultado mensurável. Exemplos:
   - "Acordar às 5h muda sua vida?";
   - "Banho gelado dá energia?";
   - "Pomodoro funciona para quem procrastina?".
4. **Fora do canal:** sexo e pornô, hormônio como solução, suplemento e remédio, e qualquer coisa que dependa de diagnóstico (docs/01).
5. **Antes de escrever, checar a concorrência:** buscar o tema no YouTube (docs/02). Se os 10 primeiros resultados já dão o mesmo veredito, procure um ângulo novo ou outro tema.

## 2. Pesquisar

- **Fontes confiáveis e com data.** Em saúde, prefira revisões e diretrizes a estudos isolados.
- Anote **o que as fontes não explicam**: essa lacuna é o ângulo do episódio.
- **Separe dado de opinião**, como o `fontes.md` do Bovonel fazia.
- Colete as perguntas que as pessoas fazem nos comentários e nas buscas sobre o tema.
- **Pare de pesquisar quando tiver:**
  - a crença da internet;
  - o mecanismo real (por que funciona ou não);
  - o protocolo correto;
  - um número que dá para medir na tela;
  - um veredito honesto.
- **Registre** as fontes num `fontes.md` do episódio. A descrição do vídeo cita essas fontes.

## 3. Embalagem antes do roteiro

Título, thumbnail e os primeiros 30 segundos são uma peça só e são escritos **antes** do roteiro (Bovonel). A thumb já sai planejada como um plano do episódio (Quase Disse). Detalhes em docs/12.

## 4. Estrutura do episódio da Cobaia [PROPOSTA]

| Bloco | Função | Regra |
|---|---|---|
| Gancho (0 a 10 s) | Um flash do pior momento do experimento, sem explicação | É a primeira imagem. Sem saudação nem logo. |
| Promessa (10 a 30 s) | A crença da internet aparece como objeto (manchete, notificação) e vira "Experimento NN" na prancheta | O título do episódio entra aqui, depois do gancho |
| Linha de base | Como a cobaia está hoje: a rotina e o número medido | É onde o público se reconhece ("sou eu") |
| Tentativa ingênua | Ela faz a versão da internet ao pé da letra e falha de um jeito físico, com 2 ou 3 gags que escalam | Ritmo rápido, cortes de 1 a 3 s |
| Mecanismo | O narrador para o tempo e explica com uma metáfora visual dentro do mundo dela | Uma imagem que se entende sem som. Uma ideia só. |
| Tentativa certa | O protocolo correto, com um tropeço pequeno no meio | Cada passo do protocolo aparece como ação, não como lista falada |
| Resultado | O número medido de novo; o mesmo plano da linha de base, mudado | A imagem que volta mudada (Quase Disse) |
| Veredito | O carimbo: FUNCIONA / FUNCIONA, MAS… / MITO | Silêncio curto antes do carimbo |
| Gancho para o próximo | A cobaia vê o próximo experimento e reage | O pedido de inscrição acontece dentro da história |

## 5. A dupla narrador e cobaia [PROPOSTA]

- **O narrador é o pesquisador:** calmo, preciso, seco. A piada dele é o rigor que não combina com o caos.
- **A cobaia não tem voz.** Ela responde com **fala escrita como objeto** (Quase Disse): uma ou duas palavras que aparecem perto dela e caem, tremem ou se quebram conforme a emoção. Por exemplo: "SÓ MAIS 5", "?!", "TÔ BEM".
  - Isso resolve três coisas: a comédia de resposta, a identidade visual e a dublagem, já que as palavras vêm de um arquivo por idioma.
- **A ação dela contradiz a narração.** É a forma mais simples de humor neste formato:
  - Narrador: "No primeiro dia, a cobaia acordou disposta."
  - Corte para a cobaia dormindo em pé, com a escova de dentes na boca.
- **A reação vem atrasada** (0,2 a 0,3 s depois do som). Já foi testado no Quase Disse; para a comédia, use também o "olhar para a câmera" depois da gag.

## 6. Escrever a narração

Regras do Bovonel e do Quase Disse, aplicadas:

- **A narração entra depois do que a imagem já mostrou** e acrescenta o que a imagem não diz. Nunca descreve o que estamos vendo.
- **Cada frase tem função:** informar, provar, criar tensão, fazer a transição ou recompensar.
- **Cada número é dito uma vez.** A prancheta mostra os números; a voz não precisa repetir.
- **Sem recapitulação no meio.** As listas aparecem uma vez só.
- **Varie a entrada das frases:** no máximo 3 frases começando com "E o", "Mas" ou "Então", e 2 com "Ou seja" ou "Agora" por episódio.
- **Uma pergunta aberta por vez.**
- **Frases curtas, escritas para ouvir:** meia pausa antes da frase importante, e frase curta para o impacto.
- **Nada de sermão nem tom de coach** (prompt mestre do Quase Disse).
- **O vídeo termina na imagem, não numa pergunta do narrador.** A pergunta ao público vai na descrição e no comentário fixado.
- **Formato do arquivo:** `falas.json`, uma fala por bloco, com `id`, `texto` e `guia_lentidao` (docs/10).
- **Antes de entregar o texto:** rode o medidor de repetição (a portar, docs/15) e leia em voz alta perguntando "em que segundo a pessoa largaria?".

## 7. Roteiro em tabela

O `ROTEIRO.md` de cada episódio do Quase Disse é o modelo. Ele tem:

1. **A história em um parágrafo.**
2. **A regra do episódio.**
3. **A imagem que volta mudada e o som que conta.**
4. **Personagens**, com a altura de cada um em relação à tabela.
5. **Narração**, em tabela: fala, quando entra, o que o público já viu, o que a voz acrescenta.
6. **Planos e atuação**, em tabela: bloco, tempo, emoção de 1 a 10, plano, o que acontece, de onde vem a escolha.
7. **Som de cada momento**, em tabela: som, origem e distância, instante e duração, função, referência.
8. **Plano da thumbnail.**
9. **Pacote de publicação.**
10. **Riscos que vou conferir.**
11. **Depois do render:** a seção "O que a v1 mediu".

Veja `codigo/motor-quase-disse/episodios/ep02-porteiro/ROTEIRO.md`.

**Mapa de emoção** (prompt mestre do Quase Disse): a curva sobe e desce, o ponto mais alto fica perto do fim e o final desce para algo calmo. Na Cobaia **[PROPOSTA]**:
- picos de comédia na tentativa ingênua;
- o pico de tensão no veredito;
- um final leve e engraçado.

## 8. Antes de animar

- **A voz vem primeiro.** Nunca anime antes de ter a narração (Bovonel). Com a voz-guia Piper, dá para começar antes da gravação final: o alinhamento refaz os tempos quando a gravação chegar (docs/10).
- **Todo instante ligado à fala usa `T.W(fala, palavra)`**, nunca segundos fixos.
