# PROMPT MESTRE DO NOVO CANAL

**Versão 1 · 19/11/2026 · Preparado pela Kiro para uma Kiro nova**

Este é o documento central de um pacote de transferência de conhecimento.

**Para quem recebe:** você é uma Kiro que nunca participou das conversas anteriores. Este pacote existe para você entender o projeto, reconstruir o ambiente e continuar o trabalho sem depender de conversas, repositórios antigos ou links.

**Leia este arquivo inteiro antes de qualquer outra coisa.** Depois, siga a ordem de leitura da seção 4.

---

## 1. Em uma página

**O dono do projeto**

- É brasileiro e fala português; responda sempre em português, de forma simples e curta.
- Não programa, não edita e não mexe em terminal.
- A parte dele é opinar e decidir. No canal novo, também vai fornecer a narração, quando chegar a hora.
- Ele vê os arquivos pela aba **Artifacts** ("Show summary → Artifacts") ou por um link de pull request.
- **Nunca peça a ele para programar, marcar tempos, procurar efeitos ou editar.**

**O que ele quer**

- Um **canal novo de YouTube, de animação, sobre desenvolvimento pessoal**, inspirado no canal **Monke** (@monkebiznis), mas original: com identidade, personagens, histórias e produção próprios.
- Tudo é feito por você, em código: pesquisa, roteiro, desenho, animação, som, mixagem, renderização, thumbnails e pacote de publicação.

**O que já existe**

- **Dois projetos anteriores** dele, cujo conhecimento está neste pacote:
  - **Bovonel**: motion graphics de economia. Ensinou o método editorial e a sincronia com a narração.
  - **Quase Disse**: animação de personagens com histórias quase sem fala. Ensinou personagens, atuação, som e controle de qualidade. O dono às vezes escreve "Quem Disse"; o nome certo é **Quase Disse**.
- **Um motor de animação por código que funciona.** Foi reconstruído do zero a partir deste pacote em 19/11/2026: rodou de ponta a ponta e gerou vídeo, som e conferências. O código está em `codigo/motor-quase-disse/`.
- **Uma pesquisa sobre o Monke e o mercado**, com dados (`pesquisa/`).
- **Uma proposta de conceito**, "A Cobaia" (nome provisório). **O dono ainda não respondeu à proposta.** Ela é PROPOSTA, não decisão.

**Em que etapa estamos** O dono definiu as etapas (seção 5): pesquisa → análise → proposta → discussão → definição → produção. Estamos entre **proposta** e **discussão**. Três perguntas estão abertas para ele (seção 6).

---

## 2. Como ler os rótulos deste pacote

Toda afirmação importante tem um destes rótulos. **Não troque um pelo outro.** Uma Kiro nova que transforma proposta em decisão quebra a confiança do dono.

| **Rótulo**                    | **O que quer dizer**                                                                                                        |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **[APROVADO]**                | O dono disse que sim, com palavras dele. A frase dele vem citada quando existe.                                             |
| **[APROVADO EM OUTRO CANAL]** | Aprovado no Bovonel ou no Quase Disse. Serve de ponto de partida forte, mas **ainda não foi confirmado para o canal novo**. |
| **[TESTADO]**                 | Foi renderizado e medido no arquivo final, com o resultado registrado.                                                      |
| **[OBSERVADO]**               | Visto ou medido em dados de terceiros (YouTube, sites), sem teste nosso.                                                    |
| **[PROPOSTA]**                | Ideia da Kiro, ainda não aprovada.                                                                                          |
| **[HIPÓTESE]**                | Aposta sem evidência ainda.                                                                                                 |
| **[PENDENTE]**                | Precisa de decisão ou de desenvolvimento.                                                                                   |
| **[INACESSÍVEL]**             | O material existiu, mas não está no pacote nem no disco.                                                                    |

---

## 3. O que está no pacote

```
PROMPT_MESTRE_NOVO_CANAL/
├── PROMPT_MESTRE_NOVO_CANAL.md      este arquivo (índice e regras de trabalho)
├── docs/                            o conhecimento, por assunto (ordem de leitura na seção 4)
├── codigo/
│   ├── motor-quase-disse/           o motor que funciona (Node + Python + ffmpeg), com 5 episódios de exemplo
│   └── referencia-bovonel/          código e manuais do Bovonel (motor de navegador; só referência)
├── pesquisa/                        dados do Monke (53 vídeos), script de coleta, folhas de thumbnails
├── amostras/                        vídeos de exemplo em 540p, folhas de quadros, thumbnails, relatórios de conferência
└── recursos/voz/                    vozes Piper (pt_BR faber e cadu), para não depender de download

```

**O que NÃO está no pacote** (e como obter):

| **Item**                                                                                                                                  | **Por que ficou de fora**                                      | **Como obter**                                                    |
| :---------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- | :---------------------------------------------------------------- |
| Pacotes Python e Node                                                                                                                     | São reinstaláveis                                              | `preparar.sh` instala (docs/13)                                   |
| Modelo do faster-whisper `small` (\~460 MB)                                                                                               | É grande e baixa sozinho no primeiro uso                       | Precisa de internet até o Hugging Face no primeiro alinhamento    |
| Vídeos em qualidade cheia                                                                                                                 | Têm centenas de MB                                             | Renderize de novo com o código; ou use as amostras em 540p        |
| Arquivos originais do dono (caderno de DISCIPLINE/Ifverse/IF HUMANS, "prompt mestre" do Quase Disse, "Manual Mestre Integrado", "3 em 1") | **[INACESSÍVEL]**: chegaram só pela conversa ou nunca chegaram | Os resumos estão em docs/05 e docs/04. Peça os originais ao dono. |

---

## 4. Ordem de leitura

1. Este arquivo.
2. `docs/01_proposta_do_canal.md`: o conceito proposto, o público, o formato, as alternativas e as perguntas abertas.
3. `docs/02_pesquisa_monke_e_mercado.md`: os dados que sustentam a proposta.
4. `docs/03_aprendizados_quase_disse.md`: o projeto que mais ensinou sobre personagem e atuação.
5. `docs/04_aprendizados_bovonel.md`: o método editorial e a sincronia com a narração.
6. `docs/05_referencias_discipline_ifverse_ifhumans.md`: linguagem cinematográfica e som.
7. `docs/06_roteiro_metodo.md`: como pesquisar e escrever.
8. `docs/07_personagens_e_atuacao.md`: como construir personagens consistentes, com o código explicado.
9. `docs/08_direcao_de_arte_e_camera.md`: cenário, profundidade, luz, câmera e cortes.
10. `docs/09_arquitetura_do_motor.md`: o motor, peça por peça, com os algoritmos.
11. `docs/10_audio_narracao_sincronia.md`: síntese de som, mixagem, narração e alinhamento.
12. `docs/11_render_qa_entrega.md`: renderização, conferências e entrega ao dono.
13. `docs/12_titulos_thumbs_publicacao.md`: embalagem e publicação.
14. `docs/13_reconstrucao_do_zero.md`: **o guia passo a passo para montar o ambiente**, com as verificações.
15. `docs/14_historico_decisoes_e_pendencias.md`: as decisões com data, os erros e as pendências.
16. `docs/15_o_que_construir_para_o_canal_novo.md`: as ferramentas que faltam e o plano para criá-las.

---

## 5. Regras de trabalho com o dono

As regras abaixo foram pedidas por ele e valem para tudo.

1. **Etapas na ordem dele** **[APROVADO]**, mensagem de 19/11/2026:
   1. Pesquisa e análise das referências.
   2. Exame do que a Kiro sabe fazer e do que falta aprender.
   3. A melhor ideia original, com as escolhas explicadas.
   4. Discussão e aprimoramento juntos.
   5. Só depois: identidade, personagens, regras narrativas, estilo, estrutura dos episódios e processo de produção.

   "Não quero que você tome decisões definitivas antes dessa conversa."
2. **Inspirado no Monke, sem copiar** **[APROVADO]**. Ele quer aprender com a forma como o Monke transforma conhecimento em entretenimento, em que personagem, roteiro, humor e som trabalham juntos. Não quer "uma cópia dele com outro personagem". Também não quer herdar obrigatoriamente o visual, o motion graphic ou a estrutura editorial do Bovonel: "aproveitar o conhecimento, não copiar o formato".
3. **Autonomia criativa** **[APROVADO]**. Ele quer que você pense por conta própria, questione as referências dele e proponha a ideia em que realmente acredita, com justificativa. Não quer uma lista enorme de sugestões genéricas.
4. **Qualidade desde o começo** **[APROVADO]**:
   - o roteiro desperta curiosidade, desenvolve uma situação, ensina e segura o espectador;
   - as ações dos personagens têm propósito;
   - o humor entra quando é adequado;
   - câmera, expressões, movimentos, som e transições servem ao entendimento.
5. **Sem duração fixa** **[APROVADO]**. "Cada episódio deve ter o tempo necessário para funcionar bem, sem enrolação." Isso já valia no Bovonel ("ficar bom é o que importa").
6. **Participação dele simples** **[APROVADO]**. "Você cuida da pesquisa, criação, roteiro, programação, animação, áudio visual e renderização; eu forneço a narração quando chegar a hora e participo das decisões criativas."
   - Atenção: no Quase Disse ele escolheu a voz sintética Piper ("até quero que use a voz sintética", 18/11/2026). No canal novo, ele disse que **fornece a narração**. Ainda não se sabe se será a voz dele gravada ou uma voz de IA gerada por ele **[PENDENTE]**.
7. **Ferramentas novas quando precisar** **[APROVADO]**. "Se forem necessárias novas ferramentas de programação para alcançar esse resultado, quero que você identifique isso e planeje como desenvolvê-las."
8. **Arquivo Mestre só com autorização** **[APROVADO]**. Este pacote foi pedido e autorizado em 19/11/2026. Deve ser atualizado quando o projeto evoluir.
9. **Não inventar** **[APROVADO]**, regra repetida em todos os canais. O que não foi confirmado fica marcado como PENDENTE ou NÃO CONFIRMADO. Se algo está inacessível, diga exatamente o que falta.
10. **Comunicação** **[APROVADO EM OUTRO CANAL]**:
    - fale em português simples, sem jargão;
    - dê o nome exato e o lugar do arquivo (ele já baixou a versão errada uma vez);
    - mostre o que foi conferido e o que foi corrigido;
    - quando ele pedir para "aprimorar", faça uma análise profunda e procure até o que ele não soube explicar.
11. **Ensinar no material** **[APROVADO]**. Nenhum documento pode depender de "veja o repositório antigo". O conhecimento precisa estar escrito aqui.

---

## 6. Decisões abertas, em ordem de prioridade

| **#** | **Pergunta para o dono**                                                                                                               | **Por que importa**                                                                                | **O que a Kiro propõe**                        |
| :---- | :------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- | :--------------------------------------------- |
| 1     | A direção "A Cobaia" segue, muda, ou ele prefere outra?                                                                                | Define tudo o que vem depois                                                                       | Seguir com "A Cobaia" (docs/01)                |
| 2     | Protagonista animal (porquinho-da-índia) ou pessoa?                                                                                    | Silhueta, dublagem, risco de público infantil                                                      | Porquinho-da-índia, com tom de jovem adulto    |
| 3     | Narração: voz dele gravada, voz de IA gerada por ele, ou voz sintética Piper feita pela Kiro?                                          | O narrador é personagem no formato proposto; o alinhamento só foi calibrado com voz sintética      | Pedir uma gravação de teste de 30 s e calibrar |
| 4     | Ele pode mandar 2 ou 3 vídeos do Monke em arquivo, ou as transcrições?                                                                 | O YouTube bloqueia o player no ambiente da Kiro; a atuação e o ritmo do Monke **não foram vistos** | —                                              |
| 5     | Ele ainda tem os originais (caderno de DISCIPLINE/Ifverse/IF HUMANS, prompt mestre do Quase Disse, Manual Mestre Integrado, "3 em 1")? | Hoje só existem resumos                                                                            | —                                              |
| 6     | Nome definitivo do canal                                                                                                               | Só depois das decisões 1 e 2                                                                       | Checar se o @ está livre (docs/12)             |

**Próximo passo depois das respostas** **[PROPOSTA]**:

1. Refinar o conceito.
2. Construir a biblioteca de atuação (docs/15).
3. Fazer um **piloto de 60 a 90 s**.
4. O dono julga o humor e o ritmo.
5. Só então definir a identidade e produzir o episódio 1.

---

## 7. O primeiro dia de uma Kiro nova

1. Leia este arquivo e os docs 01, 02 e 14.
2. Monte o ambiente seguindo `docs/13_reconstrucao_do_zero.md` e rode todas as verificações. Elas levam uns 10 minutos.
3. Renderize alguns quadros do episódio de exemplo `ep02-porteiro` e compare com `amostras/ep02_quadros_mp4.jpg`. Se ficarem iguais, o motor está certo.
4. Se o dono ainda não respondeu à seção 6, **pergunte, em português e em poucas linhas**. Não comece a produzir.
5. Guarde as respostas dele em `docs/14_historico_decisoes_e_pendencias.md`, com data e a frase dele. Mude o rótulo de PROPOSTA para APROVADO só quando ele aprovar.

---

## 8. Como atualizar este pacote

Atualize depois de cada decisão do dono, cada teste importante e cada episódio entregue:

1. Registre em `docs/14` a data, o que mudou e a frase do dono.
2. Corrija o documento do assunto. Se uma regra nova substituir uma antiga, marque a antiga como "substituída em DD/MM, por quê". Não apague.
3. Atualize a versão e a data no topo deste arquivo.
4. Refaça o ZIP e entregue em Artifacts com o nome `PROMPT_MESTRE_NOVO_CANAL_vN.zip`.
5. Antes de entregar, pergunte: "uma Kiro nova, lendo só este pacote, sabe o que foi decidido, o que está pendente e qual é o próximo passo?"

---

## 9. Registro de versões

| **Versão** | **Data**   | **O que mudou**                                                                                                                                                                                                                 |
| :--------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1          | 19/11/2026 | Pacote criado: pesquisa do Monke e do mercado, proposta "A Cobaia", conhecimento do Bovonel e do Quase Disse, motor completo com 5 episódios de exemplo, guia de reconstrução testado numa pasta limpa, vozes Piper e amostras. |