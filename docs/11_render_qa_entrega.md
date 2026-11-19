# 11 · Renderização, controle de qualidade e entrega

## 1. A ordem de trabalho de um episódio

O que está **[TESTADO]** veio do Quase Disse. O que é específico do canal novo é **[PROPOSTA]**.

1. Escreva o roteiro e o `falas.json`.
2. Gere a voz-guia: `voz.py guia <ep>`.
3. Escreva o `episodio.js` com os blocos, as marcas, os planos e os contatos.
4. **Prévias em quadros:** `render.js <ep> --versao pN --escala 0.5 --quadros ...` e uma folha de contato (`folha.js`). Olhe as folhas e corrija. Repita até o enquadramento, as poses e as falas estarem certos. No ep01, isso levou 8 rodadas (p1 a p8).
5. Escreva o `som_ep.js`. Rode `render.js --so-som` e meça os níveis no celular, ajustando até a hierarquia estar certa. No ep01, isso levou 5 rodadas (s2 a s5).
6. Rode `varrer.js` em todo o episódio (0 linhas) e `alturas.js` (desvio de até 3%).
7. Faça o **render completo** (`--versao v1`).
8. **Conferências no mp4** (seção 2).
9. **Revisão sem som e revisão com som** (seção 3).
10. Faça as thumbnails e o pacote de publicação (docs/12).
11. Atualize o `ROTEIRO.md` (seção "O que a v1 mediu"), as decisões e os artefatos.
12. Entregue ao dono (seção 4).

## 2. Conferências do arquivo final

**Regra:** confira **o mp4 exportado**, não o que o código pretendia fazer.

| Conferência | Ferramenta | Critério |
|---|---|---|
| Duração, trilhas, loudness, mono | `conferir.py <ep> <v>` | De −14 a −17 LUFS (o ep02 a −20 foi exceção, ainda sem a opinião do dono); pico real ≤ −1 dBTP; correlação L/R ≥ 0,8 |
| Nível de cada evento no celular | `conferir.py`; `conferencia/niveis.py` (ep02) | O efeito principal é o mais alto fora da narração |
| Sincronia dos contatos | `conferencia/celular_e_contatos.py` (ep01), `sincronia.py` (ep02) | Cada som a até 42 ms do contato. Se houver dúvida, meça o som sozinho (docs/10). |
| Alcance de mãos e pés | `varrer.js <ep> 0 <dur>` | Nenhuma linha impressa |
| Altura dos personagens | `alturas.js <ep>` | Desvio de até 3% |
| Quadros do mp4 | `conferir.py <ep> <v> t1 t2 ...` ou `ffmpeg -ss t -i mp4 -frames:v 1` | O que aparece no mp4 é igual ao canvas. Texto legível, sem blocos de compressão. |
| Nada queimado além do que pertence à cena | Folha de quadros | Sem legenda; texto só dentro da cena |
| Emendas (se houver colagem de trechos) | Salto entre amostras ±10 ms comparado com a região | Sem clique |

**Folhas de contato úteis:**
- Episódio inteiro, 1 quadro por segundo: `ffmpeg -i X.mp4 -vf "fps=1,scale=240:-2,tile=12x12" -frames:v 1 folha.jpg`.
- Contatos: 1 quadro antes e no instante de cada contato, montados com `folha.js`.
- **Leitura:** a leitura de imagem da Kiro aceita até 10 MB. Reduza as folhas grandes para JPG.

## 3. As duas revisões obrigatórias [APROVADO EM OUTRO CANAL]

Frase do dono: "Quero levar esse cuidado para o canal inteiro."

1. **Sem som, seguindo só os objetos que se movem.** Para cada objeto: ele só se move com a mão nele, ou por uma causa visível? A mão fica nele até soltar? Ele termina num lugar claro?
2. **Com som, conferindo cada contato que se ouve com a mão que o produz.** Também: o efeito principal é o mais alto? A voz se entende? Há silêncio sobrando?

**Perguntas extras do Bovonel:**
- Cada imagem faz sentido sem som?
- Alguma solução visual repete um episódio anterior? Mantenha um catálogo.

**Na entrega, diga o que foi conferido e o que foi corrigido.**

## 4. Entrega ao dono

**[APROVADO EM OUTRO CANAL]**

- **Onde:** em Artifacts (`/projects/sandbox/.kiro/artifacts/` neste ambiente; o dono abre em "Show summary → Artifacts").
  - Os arquivos são numerados em sequência: `24-ep02-porteiro-v1.mp4`, `25-...-para-upload.mp4`...
  - O caminho pode ser outro num ambiente novo. Descubra onde ficam os Artifacts.
- **Dois vídeos:**
  - uma cópia leve para assistir: crf 23 a 24, 30 a 40 MB;
  - o arquivo cheio para subir no YouTube: crf 18, 140 a 200 MB.

  Diga qual é qual.
- **Junto:**
  - a legenda `.srt`;
  - as thumbnails, mais uma imagem com as três no tamanho do celular;
  - a folha de quadros;
  - o roteiro atualizado;
  - o `publicacao.txt` para colar no Studio.
- **A mensagem ao dono:** em português simples e curta.
  1. O que é cada arquivo.
  2. O que foi conferido e os números que importam.
  3. O que ele precisa decidir.
  4. "Eu medi, mas não consigo ouvir: vale escutar uma vez no seu celular."
- **GitHub:** neste ambiente, o envio deu 403, e o dono nunca conseguiu dar acesso. Os Artifacts foram o canal que funcionou. Num ambiente novo, teste o envio antes de prometer um pull request.

## 5. Erros de processo que não devem se repetir

- **Animar antes da voz** (Bovonel, vídeo 01 v1).
- **Conferir só o relatório geral de alcance:** três faltas só apareceram na varredura quadro a quadro (ep01).
- **Confiar no detector automático de sincronia** com eventos colados (ep02).
- **Entregar sem a revisão sem som:** o prato deslizando (prova v5) teria sido pego.
- **Thumbnail sem plano** (ep01).
- **Escolher a escala de um personagem a olho** (ep01).
- **Prometer um formato (Short) antes de o dono pedir.** Ele descartou depois de pronto.
- **Ler PNG grande demais.** O limite da leitura de imagem é 10 MB; reduza antes.
