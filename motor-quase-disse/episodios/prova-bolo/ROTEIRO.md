# Prova · "O bolo" (≈ 23,5 s com a voz-guia)

Cena descartável, feita para testar o fluxo. Uma cozinha à noite, uma luminária, dois personagens.
Bia serve o primeiro bolo que fez. Nico prometeu ser sincero. O som da mordida conta ao público
que o bolo está duro antes que o rosto dele conte. Ele mente e ganha o bolo inteiro.

## Narração

Voz sintética local (Piper, `pt_BR-faber-medium`), por decisão do dono em 18/11/2026. Ninguém precisa gravar.

> A Bia nunca tinha feito um bolo.
>
> O Nico prometeu ser sincero.
>
> A sinceridade ficou pra outro dia.

## Narração com as notas de cena

| fala | o que o público já viu | o que a voz acrescenta | onde segurar |
|---|---|---|---|
| L1 · "A Bia nunca tinha feito um bolo." | Escuro com geladeira e relógio, depois a cozinha. Bia empurra o prato. | Que é a primeira vez dela. Isso dá peso ao que vem. | O prato começa a andar um pouco antes de "bolo". A palavra cai quando ele já desliza sozinho. |
| L2 · "O Nico prometeu ser sincero." | Nico recebe a fatia. | A promessa. É a expectativa da cena. | Bia se inclina em "prometeu"; Nico pega o garfo em "sincero" e acena. Depois vêm 0,9 s de silêncio antes do corte. |
| (sem voz, 9 s) | Mordida, reação, espera da Bia, mentira, o bolo inteiro empurrado. | Nada. A voz some para o som contar. | A narração só volta depois que Nico afunda na cadeira. |
| L3 · "A sinceridade ficou pra outro dia." | Ele mentiu e o castigo chegou. | Dá nome ao que vimos. A palavra "sinceridade" volta depois de "sincero" (L2). | A frase entra só depois da reação dele. Em "outro dia" ele ergue o garfo de novo, resignado. |

Os personagens não falam com a voz. A fala de Nico aparece escrita na cena ("TÁ ÓTIMO.") e vira objeto:
surge com batidas de peças de madeira, cai na mesa e o bolo empurra as letras para o chão.
A cena continua legível sem entender português: sorriso forçado, alegria da Bia, bolo empurrado.

## Planos

| bloco | plano | o que acontece | por quê |
|---|---|---|---|
| abre (1,2 s) | escuro → geral A | geladeira e relógio antes da imagem | o som apresenta o lugar |
| l1, l2 | **A** geral, de lado | prato vai até Nico; Bia se inclina; garfo | palco frontal com a luminária no centro, a mesa como linha |
| mordida (2,9 s) | **B** close do Nico, do lugar da Bia (ombro dela desfocado à direita) | garfo sobe · olhos descem ao garfo (levemente vesgos) · olham a Bia · voltam · cabeça recua e boca abre (preparação) · bote · CONTATO · rosto parado por 0,22 s · pupila encolhe · topete ainda balança | gesto com preparação e reação pequena legível de perto |
| espera (2,4 s) | **C** close da Bia, do lugar do Nico (nuca e topete dele desfocados à esquerda) | pisca, sobrancelhas sobem, sorriso cresce | quem espera não ouviu o que nós ouvimos |
| mentira (3,6 s) | **B** de novo, mesma composição | engole · canto direito da boca sobe antes do esquerdo, com tremor · letras · letras caem | a repetição ensina onde procurar a mudança |
| empurra (2,6 s) | **A** geral | letras pousam (continuidade do corte) · pulinho · Bia recua e empurra · letras caem da mesa · Nico afunda | a imagem do início volta mudada: antes uma fatia, agora o bolo inteiro |
| l3 | **A** com aproximação lenta no Nico | ele ergue o garfo de novo | consequência |
| preto (1,9 s) | escuro | segunda mordida, só som | o efeito continua depois do corte |

## Som dos momentos principais

A lista completa de entradas, gerada a cada render, fica em `saida/prova-bolo/planilha_som_<versão>.md`.

**Mordida (o som muda o entendimento da imagem).** A imagem mostra um bolo rosa e macio.
- Contato no quadro do bote · boca do Nico, colado ao ouvido, centro · 0,3 s · trituração granular (grãos de 900 Hz a 5,5 kHz) + estalo agudo e curto de "dente em pedra" (3,15 kHz) + baque grave da mandíbula. Função: dizer "duro como pedra" antes do rosto.
- No mesmo instante, geladeira, ar da sala e relógio somem (−40 dB em 30 ms) e voltam em 1,7 s. O ouvido percebe a troca de textura.
- O rosto só reage 0,22 s depois. O som chega antes da compreensão do personagem.
- Segunda mastigada a +0,8 s, mais lenta e com menos estalo; a pálpebra inferior treme junto.

**Espera.** No close da Bia, o primeiro tique do relógio que volta vem de fora do quadro, mais distante. Ele marca a duração da espera.

**Mentira.** Engolida (garganta, colada) antes do sorriso. Cada letra é uma peça de madeira com altura subindo um pouco. As letras caem com um sopro curto que atravessa o corte e pousam com batidas na mesa do plano geral.

**Bolo empurrado.** Arrasto grave da boleira + louça. Cada letra que passa da borda faz uma batida na mesa e outra no chão, mais longe e com mais sala. O chão continua soando depois que a Bia para.

**Ambiente contínuo.** Zumbido da geladeira (100 Hz + harmônicos até 600 Hz + assobio fraco em 1,18 kHz para existir no alto-falante de celular), ar da cozinha, relógio a cada segundo. Abaixa 5 dB sob a narração. O pan muda com o ângulo: à esquerda no geral, mais ao centro no close do Nico, quase central e mais distante no close da Bia.

## Tempos ajustáveis

Tudo em `episodio.js`:
- `blocos`: duração de cada bloco fixo e pausas `antes`/`depois` de cada fala.
- `MORD`: instantes internos da mordida (subida do garfo, olhar, preparação, contato, reação, segunda mastigada).
- Ações presas a palavras: `T.W('L1','bolo')`, `T.W('L2','prometeu')`, `T.W('L2','sincero')`, `T.W('L3','outro')`, `T.W('L3','dia')`.
