# 15 · O que construir para o canal novo

Tudo aqui é **[PROPOSTA]**: são ferramentas que **ainda não existem**. Estão em ordem de prioridade, com a justificativa, o desenho técnico e o teste que prova que funcionam.

O dono autorizou: "Se forem necessárias novas ferramentas de programação para alcançar esse resultado, quero que você identifique isso e planeje como desenvolvê-las."

---

## 1. Biblioteca de atuação (prioridade 1)

**Problema:**
- No Quase Disse, cada gesto foi escrito à mão dentro do episódio. O ep02 tem cerca de 1.200 linhas só dele.
- Um formato de comédia, com várias gags por minuto, precisa de muito mais gestos.
- Sem uma biblioteca, um episódio leva dias e o personagem muda de jeito entre episódios.

**Desenho:**
- `motor/atuacao.js` com:
  - **Poses nomeadas**: objetos de pose parciais, como `susto`, `derreter`, `olhar_camera`, `pulinho`, `negar_com_cabeca`, `cochilar_em_pe`, `segurar_celular`.
  - **Expressões nomeadas**: `alegre`, `confiante`, `culpado`, `exausto`, `assustado`, `desconfiado`, `aliviado`. Cada uma é a receita de olhos, sobrancelha e boca (docs/07, seção 6).
  - **Transições com antecipação e exagero:** antes de pular, agacha 0,1 s; depois de cair, o corpo achata e volta. **O braço continua com tamanho fixo.**
  - **Uma linha do tempo de atuação por personagem:**
    ```js
    const atua = acoes([
      ['expr', 'confiante', T.W('L2', 'cinco')],
      ['pose', 'olhar_camera', T.W('L2', 'cinco').ini + 0.4, { dur: 0.8 }],
      ['gesto', 'apertar', M.contatos.despertador, { mao: 1, alvo: OBJ.despertador }],
    ]);
    const pose = atua(t);   // mistura as camadas no tempo, devolve a pose para a função do personagem
    ```
  - **Piscar automático** em intervalos variados de 2 a 5 s, nunca dentro de uma reação.
- **Teste:**
  - Uma folha com todas as poses e expressões do protagonista.
  - Uma cena de 20 s escrita só com a biblioteca, com até 15 linhas de atuação.
  - Varredura de alcance com 0 px; alturas dentro de 3%.

## 2. O protagonista e o rig dele (prioridade 1)

- Vistas de **frente, três-quartos, perfil e costas**, com a mesma altura na tabela `elenco.js`.
- **Turnaround em movimento:** trocar a vista no meio de um giro, com um quadro intermediário. Não existe hoje.
- **Andar com corpo:** balanço vertical de ~3% da altura a cada meio ciclo, braço oposto à perna e inclinação para a frente quando corre. O som do passo continua vindo da mesma conta.
- **Esticar e achatar** o corpo (escala não uniforme preservando a área). Não se aplica aos membros.
- **Teste:** uma folha de turnaround, um ciclo de andar em 3 velocidades e o relatório de sincronia dos passos.

## 3. Câmera do Bovonel no motor atual (prioridade 2)

- Portar `evalCam` e `liveCam` (o código está em docs/08) para `motor/camera.js`, integrando com `camada()`. A tremida passa a vir de `impacts` = os instantes dos contatos fortes.
- Cortes rápidos: uma lista de planos curtos gerada a partir das marcas.
- **Teste:** uma cena com 4 movimentos de câmera. O quadro não fica parado mais de 3 s, exceto quando o roteiro pede.

## 4. Kit do experimento (prioridade 2)

- Objetos de cena reutilizáveis:
  - a prancheta com o título "Experimento NN" e o dia;
  - o gráfico de dias que se desenha à mão;
  - o cronômetro e o despertador;
  - o carimbo do veredito, com 3 variantes;
  - a manchete da internet que cai.
- **Todo texto vem de um arquivo de idioma** (item 5).
- O carimbo tem um som próprio, com silêncio antes.
- **Teste:** uma folha com todos os objetos; texto legível em 540p; e a conferência de texto (item 7) com 0 problemas.

## 5. Texto por idioma (prioridade 2)

- Cada episódio tem `textos/pt.json`, `textos/en.json`, etc. A função `tx('chave')` devolve o texto do idioma do render.
- Opção do render: `--idioma en` lê `falas_en.json` e `narracao_en/`.
- A tela é idêntica; só mudam as palavras e a voz.
- **Teste:** renderizar o piloto em pt e em en e comparar os quadros. Só o texto pode mudar. Conferir que nenhuma frase traduzida estoura o espaço, porque o inglês costuma ser mais curto e o espanhol mais longo.

## 6. Renderização paralela (prioridade 3)

- **Hoje:** cerca de 6 qps, 9 min para 137 s.
- **Proposta:** dividir os quadros em N processos Node (um por núcleo), cada um gravando um trecho em mp4 sem áudio, e juntar com o `concat` do ffmpeg. Isso é possível porque cada quadro é uma função pura do tempo.
- **Teste:** o mesmo episódio renderizado nos dois modos, com os mesmos pixels e um tempo menor.

## 7. Conferências que faltam (prioridade 3)

- **Conferência de texto:** portar `qa.mjs` do Bovonel. Ele intercepta `fillText`, guarda a caixa do texto depois da transformação e acusa texto cortado, sobreposto ou fora da área segura.
- **Medidor de repetição no roteiro:** portar `repeticao.mjs` (números repetidos, entradas de frase, palavras demais).
- **Conferência de ritmo:** um relatório com a duração de cada plano, o tempo desde a última mudança na tela e os trechos de narração sem ação. Ajuda a responder "em que segundo a pessoa largaria?".
- **Sincronia que separa eventos colados:** juntar no motor a medida "som sozinho" (docs/10, seção 6).

## 8. Narração real (quando o dono decidir)

- `voz.py` aceitar `initial_prompt` com os nomes do canal, para o Whisper acertar "cobaia" e o nome do protagonista.
- Recalibrar o `CORRECAO_WHISPER` com a voz real. A ideia: o dono grava um texto conhecido, a Kiro marca alguns inícios de palavra pela forma de onda e mede o viés.
- Normalizar a gravação do celular: passa-alta, redução leve de ruído e compressor. Testar se o celular dele grava em AAC ou Opus.

## 9. Ordem sugerida

1. Itens 1 e 2: biblioteca de atuação e protagonista.
2. Item 4 (kit do experimento) e item 3 (câmera).
3. **Piloto de 60 a 90 s:** uma tentativa ingênua com 2 gags e um mecanismo. O dono julga o humor.
4. Itens 5, 6, 7 e 8, conforme a necessidade.
5. Episódio 1 completo, medindo o tempo de produção.
