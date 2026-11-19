# 03 · O que o canal Quase Disse ensinou

O Quase Disse (`@quasedisse`) é o projeto anterior mais próximo do canal novo: personagens animados, histórias, som e atuação. Ele foi produzido de 18 a 19/11/2026. **Nada foi publicado**, então não há dados de público. O que está aqui é técnico e criativo, medido nos vídeos finais.

O código completo está em `codigo/motor-quase-disse/`. O registro original das decisões está nos arquivos `DECISOES.md` e `IDENTIDADE.md` da mesma pasta, que reproduzem as palavras do dono. Este documento organiza esse conteúdo para o canal novo.

---

## 1. O que o canal era

- **Premissa:** histórias curtas sobre o que as pessoas quase dizem. Os personagens não têm voz. Quando falam, as palavras aparecem escritas na cena como objetos: pesam, ficam penduradas, caem, se encaixam. Só o narrador fala, e diz pouco.
- **Narração sintética:** Piper, voz `pt_BR-faber-medium` **[APROVADO]**, "até quero que use a voz sintética", 18/11/2026.
- **Universo:** um prédio com moradores que se repetem: Dona Lurdes (501), Caio (601), Seu Arlindo (porteiro), Nico e Bia (302).
- **Regras que o dono aprovou para o canal inteiro** **[APROVADO EM OUTRO CANAL]**:
  - Gancho nos primeiros segundos e título só depois do gancho.
  - Cartela "Quase Disse." no fim.
  - Emoção de 1 a 10 por plano no roteiro.
  - Pacote de publicação com cada roteiro.
  - Pergunta ao público na descrição e no comentário fixado, não na narração.
  - Sem Shorts: "vou querer não, depois começa a fazer bagunça", 19/11/2026.
  - Sem legenda queimada na imagem: a narração vai só no `.srt`.

## 2. Os episódios e o que cada um provou

| Episódio | O que é | O que provou | Situação |
|---|---|---|---|
| prova-bolo (v1 a v3) | Nico come o bolo da Bia e mente que está ótimo. As letras de "TÁ ÓTIMO." caem do nada. | O fluxo voz → alinhamento → imagem → som funciona. Um "plano detalhe" é a mesma cena com zoom 3. | Prova técnica |
| prova-bolo-2 (v5) | A Bia percebe a mentira. | Corte para quem espera, antes da resposta: **o dono gostou**. "Ali eu entendi o que os dois estavam sentindo." | Prova |
| prova-bolo-3 (v6) | A versão final da prova | Braço com tamanho fixo (cinemática inversa, IK), mão presa ao objeto até soltar, um contato = um instante, e o "Ó" que rola e para de pé | Entregue |
| ep01-elevador (93,5 s) | A Dona Lurdes bate a vassoura no teto contra a música do vizinho. No elevador, o "Bom dia." dela fica pendurado no ar. O elevador trava, e do fone do Caio vaza a mesma música. Ele responde, as frases se encaixam e o elevador volta a andar. | Tudo junto, num episódio de verdade. **"Ficou ótimo."** O dono pediu que vire referência de ritmo e de mixagem. | **[APROVADO]** |
| ep02-porteiro (137 s) | Último dia do Seu Arlindo, porteiro há 31 anos. Os moradores quase dizem. No almoço, ele ouve o tec-tec da caneta dele pela porta. À tarde, o livro está cheio de agradecimentos. No dia seguinte, ele volta de visita e a Lurdes abre a porta para ele. | Tamanho fixo dos personagens, vistas de costas, letras de mão por apartamento e thumbnails planejadas | Entregue. **O dono não comentou.** |

Para ver como ficaram, abra `amostras/ep01-elevador_v1_amostra_540p.mp4`, `amostras/ep02-porteiro_v1_amostra_540p.mp4` e `amostras/prova-bolo-v6_amostra_540p.mp4`.

## 3. Pedidos do dono que viraram regra

Cada linha tem a frase dele, o que mudou e se a regra é **definitiva** (vale sempre) ou **específica** (vale para um caso).

| Data | Frase ou pedido do dono | Regra que ficou | Tipo |
|---|---|---|---|
| 18/11 | "Só tem a metade do corpo?" (no plano geral, os personagens sem pernas embaixo da mesa) | **Se o quadro mostra uma parte do corpo, ela precisa estar desenhada**: pernas, cadeira, a mão segurando o objeto. Mostrar só do peito para cima no close é normal. | Definitiva |
| 18/11 (v5→v6) | Na volta da v5, o antebraço da Bia cresceu para alcançar o prato | **O braço tem tamanho fixo.** Se a mão não alcança, mude os lugares ou os objetos; nunca estique. | Definitiva |
| 18/11 (v5→v6) | O prato deslizou depois que a mão saiu | **A mão fica no objeto até soltar.** O objeto só se move com a mão nele ou por uma causa visível. | Definitiva |
| 18/11 | v5 com legenda queimada; derrubado na v6 | **Nenhuma legenda fixa na imagem.** A narração vai no `.srt`. Texto na imagem só quando pertence à cena. | Definitiva |
| 18/11 | O corte para a Bia esperando | **O corte para quem espera vem antes da resposta.** | Definitiva |
| 18/11 | "Quero levar esse cuidado para o canal inteiro" | **Revisão dupla:** ver o mp4 uma vez sem som, seguindo os objetos, e outra com som, conferindo cada contato. | Definitiva |
| 19/11 | ep01: "ficou ótimo" | O ep01 é a referência de ritmo e de mixagem. | Específica |
| 19/11 | "Shorts pode descartar… depois começa a fazer bagunça" | Sem Shorts. **No canal novo, perguntar de novo**: a decisão foi para o Quase Disse. | Definitiva no Quase Disse |
| 19/11 | "A Dona Lurdes indo pro elevador ficou maior que ele e no elevador menor, porque ela é menor" | **Tamanho fixo por personagem.** A escala muda só com a profundidade. | Definitiva |
| 19/11 | "Sei que tem que pegar do vídeo, mas tem que fazer melhores" (thumbnails) | A thumb é planejada no roteiro: rosto grande no auge da emoção, luz quente contra fundo escuro, um objeto de curiosidade, até 3 palavras fora do rosto. | Definitiva |
| 19/11 | Pediu título, descrição e tags para baixar | Entregar um `.txt` pronto para colar no YouTube Studio. | Definitiva |

## 4. Linguagem que funcionou

Estas técnicas foram **testadas** no vídeo final. As marcadas com "aprovado" tiveram a aprovação direta do dono.

1. **A reação vem atrasada em relação ao som.** O som do contato cai no quadro do contato, e o rosto só muda **0,22 s depois**. Esse atraso é onde o público entende antes do personagem.
2. **Algo continua depois que o corpo para:** o topete em mola, o "Bom dia." balançando como pêndulo por 2 s depois do tranco do elevador, as letras no chão.
3. **A fala escrita tem peso de objeto.** Ela soa sempre como uma peça de madeira leve; é a mesma família de som em todo o canal. Quando duas falas se respondem, **encaixam** com um clique de madeira.
   - No ep01, as duas frases ficavam lado a lado e se liam "Bom dia.Bom dia.". **Solução:** a frase que responde passa por baixo e para logo abaixo, com a mesma inclinação. Tamanhos: 72 px para a primeira e 60 px para a resposta.
4. **Na frase-chave, o mundo some.** O ambiente cai de 20 a 40 dB em 30 ms. O primeiro som que volta entra no plano de quem espera.
5. **O som que conta.** Em cada episódio, um som que o ouvido entende antes do rosto do personagem:
   - ep01: a mesma música em duas texturas, só graves pelo teto e só agudos vazando do fone;
   - ep02: o tec-tec da caneta ouvido pela porta.
6. **A imagem que volta mudada:** o mesmo enquadramento no começo e no fim, com uma diferença. No ep01, a vassoura bate forte no começo e responde de leve no fim. **Aprovado.**
7. **Dois ângulos com marcas fixas.** O plano geral é lateral, como um palco. Os closes são três-quartos, do lugar de quem olha, com o ombro do outro desfocado na frente. Os olhares cruzam o quadro na mesma direção do plano geral.
8. **Silhueta que se lê de costas:** um topete, um coque, um fone amarelo, um quepe e um bigode.
9. **Plano sustentado com um gesto mínimo.** No ep01, o "Bom dia." fica 10 s no ar enquanto ela ajeita a alça da sacola duas vezes.
10. **A narração some** nos segundos que importam e volta só depois da reação.
11. **Silêncio de narração no clímax.** No ep02, a leitura do livro dura 14 s, só com o relógio.

## 5. Problemas que apareceram, a causa e a solução (não repetir)

| Problema | Causa | Solução |
|---|---|---|
| Personagem sem pernas no plano geral | A pose foi desenhada só da cintura para cima | Pernas e cadeiras desenhadas, fora da rotação do tronco: inclinar o corpo não arrasta os pés |
| O antebraço cresceu para alcançar o prato | A mão foi para o alvo sem limite | Cinemática inversa de dois segmentos com tamanho fixo. A mão para no limite, e o relatório mostra quantos px faltaram (docs/07) |
| O prato deslizou sozinho | A posição do prato e a da mão eram contas separadas | Os dois saem da mesma conta: os dedos ficam presos à borda do prato, do toque até soltar |
| Um retângulo amarelo estufava na frente do bolo | A suavização Catmull-Rom arredondava o retângulo | `forma(..., { reto: true })` para objetos de quina |
| A letra "Ó" rolou e parou deitada | A distância rolada não fechava uma volta inteira | Calcular a distância para fechar o giro em uma volta, e girar em torno do próprio centro |
| As letras no plano geral (30 px) não se liam | Pequenas demais | Quando o episódio depende da leitura, use um plano mais fechado (pelo menos 48 a 60 px no quadro de 1080) |
| A mão ficou no encosto enquanto o corpo subia (falta de alcance) | Só a varredura quadro a quadro mostrou | `motor/varrer.js` em todos os quadros, não só no relatório geral |
| Passos fora do som em até 50 ms | O instante do passo vinha de outra conta | O instante do som sai da mesma fórmula que levanta o pé: pousa a cada meio ciclo |
| O ciclo de passo de 0,4 s parecia corrida | Ritmo errado | Caio com 0,9 s e Lurdes com 0,8 s por ciclo |
| O corrimão parecia uma barra no peito (close) | Desenhado na frente do corpo | O tubo vem da parede e passa por trás do corpo |
| Subir 2 a 4 dB no tranco não mudava nada no celular | O limitador achata os sons graves | Para crescer no celular: tirar abaixo de 120 Hz e pôr corpo entre 300 e 800 Hz |
| O bzzz da porta (ep02) não subia | Energia em 120 a 360 Hz, que o celular corta | Harmônicos de 300 a 960 Hz e passa-alta em 280 Hz |
| O encaixe ficava acima do efeito principal mesmo baixando 2 dB | O limitador prendia os dois picos no mesmo teto | Baixar o bastante para sair do teto (15 dB) e medir de novo |
| A Lurdes do mesmo tamanho do Caio no corredor e com 72% dele no elevador | A escala foi escolhida a olho em cada plano | `motor/elenco.js` e `motor/alturas.js` (docs/07) |
| Thumbnails fracas no ep01 | Era um quadro do vídeo com texto: rostos pequenos e neutros, cinza sobre cinza | Thumb planejada (docs/12) |
| As frases "Bom dia.Bom dia." lado a lado não se liam | Layout | A resposta encaixa embaixo |
| O fundo dos closes terminava antes da borda no corte vertical | O canvas do fundo era curto | Fundos sempre maiores que o quadro com o zoom máximo |
| A sincronia automática (sincronia.py) acusava até 60 ms em eventos colados | O detector pegava o som vizinho, a 50 ms | Medir cada som sozinho: todos começavam a até 33 ms. Espaçar eventos colados (letras a cada 110 ms) |
| Volume do ep02 4 dB abaixo do ep01 (−20 LUFS) | Episódio quieto. Comprimir até −15 LUFS fazia páginas e engolidas passarem do efeito principal | Mantida a hierarquia; volume baixo aceito. **[PENDENTE]**: perguntar ao dono se soa baixo no celular dele |
| O preparar.sh terminou sem o módulo nativo do canvas e sem o numpy (reconstrução de 19/11) | Instalação incompleta na primeira passada | Conferência no fim do script; rodar de novo resolve (docs/13) |

## 6. O que nunca foi testado no Quase Disse (riscos para o canal novo)

- **Humor.** Nenhum episódio teve piada como objetivo.
- **Ritmo rápido.** Os episódios são de plano longo; o mais curto tem cerca de 2 s e a maioria passa de 4 s.
- **Andar bom.** O ciclo atual mexe só as pernas, sem balanço do corpo nem braço oposto.
- **Personagem virando enquanto anda** (o "turnaround" em movimento).
- **Expressão exagerada de comédia** (esticar e achatar).
- **Velocidade de produção.** O ep02 tem cerca de 1.200 linhas de código só dele, escritas em umas 2 horas de trabalho da Kiro, e 9 minutos de renderização. Um canal com muitos gestos por minuto precisa da biblioteca de atuação (docs/15).
- **Voz humana.** O alinhamento foi calibrado só em voz sintética.
- **Público.** Nada foi publicado.

## 7. Material de apoio no pacote

- Código e roteiros: `codigo/motor-quase-disse/episodios/<ep>/` (`ROTEIRO.md`, `episodio.js`, `personagens.js`, `som_ep.js`, `falas.json`, `narracao/`).
- Registro original: `codigo/motor-quase-disse/DECISOES.md` e `IDENTIDADE.md`.
- Regras que a Kiro lia automaticamente: `codigo/motor-quase-disse/.kiro/steering/canal-animacao.md`.
- Amostras: `amostras/` (vídeos em 540p, folhas de quadros, thumbs, relatórios de alcance e contatos, planilhas de som).
