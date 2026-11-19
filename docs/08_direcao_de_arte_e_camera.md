# 08 · Direção de arte, cenário, luz, câmera e cortes

## 1. Quadro e formato

**[TESTADO]**
- 1920 × 1080 a 24 qps.
- O episódio desenha em coordenadas de 1920 × 1080. O render escala para a resolução de saída, e com `--escala 0.5` gera prévias em 960 × 540.
- Não tem Shorts nem versão vertical. No Quase Disse, o dono descartou: "depois começa a fazer bagunça". O código da versão vertical foi apagado. No canal novo, é preciso perguntar de novo **[PENDENTE]**.

## 2. Câmera do motor atual (Quase Disse)

```js
function camera(g, c, k) {              // c = { z, cx, cy, sx?, sy? }; k = profundidade da camada
  const zk = 1 + (c.z - 1) * k;          // camadas longe (k<1) aproximam menos: paralaxe de zoom
  g.translate(960 + (c.sx || 0) * k, 540 + (c.sy || 0) * k);   // sx, sy = tremida
  g.scale(zk, zk);
  g.translate(-c.cx, -c.cy);             // cx, cy = ponto do mundo no centro da tela
}
function camada(g, c, k, fn) { g.save(); camera(g, c, k); fn(); g.restore(); }
```

**Como se usa:**
- Cada plano define a câmera em função do tempo. Exemplo: `{ z: lerp(1.0, 1.03, fr(t, ini, ini + 6)), cx: 960, cy: 540 }`, um push-in lento de 3% em 6 s.
- As camadas usam `k` de 0,5 (fundo), 1 (ação) e 1,3 (primeiro plano).
- **Tremida no impacto:** `sx = sen(83u) · 16 · e^(−8u)` e `sy = cos(71u) · 22 · e^(−8u)` por 0,6 s.

**Plano detalhe pelo mesmo mundo:** é a mesma cena desenhada com zoom 3, com `D.linhaK.k = 1/zoom`. A continuidade fica automática: letras, mão e objeto estão onde estavam.

## 3. Câmera do Bovonel (para portar ao motor atual; docs/15)

**[TESTADO no Bovonel]**. O dono reclamou de "câmera paradona" no Bovonel, e esta foi a solução.

```js
// quadros-chave { t, x, y, z, d (duração), dx, dy, dz (deriva depois de chegar) }
function evalCam(keys, t) {
  const first = keys[0];
  let from = { x: first.x, y: first.y, z: first.z }, to = from, start = 0, dur = 1;
  const at = (tt) => { const k = ease.inOut(clamp((tt - start) / dur)); return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), z: lerp(from.z, to.z, k) }; };
  let drift = { dx: first.dx ?? 0, dy: first.dy ?? 0, dz: first.dz ?? 0.006 };
  const settle = (tt) => { const p = at(tt), since = Math.min(12, Math.max(0, tt - (start + dur)));
    const ramp = since < 1 ? since * since / 2 : since - 0.5;            // a deriva entra suave
    return { x: p.x + drift.dx * ramp, y: p.y + drift.dy * ramp, z: p.z * (1 + drift.dz * ramp) }; };
  for (let i = 1; i < keys.length; i++) { const kf = keys[i]; if (kf.t > t) break;
    from = settle(kf.t); to = { x: kf.x ?? to.x, y: kf.y ?? to.y, z: kf.z ?? to.z };
    start = kf.t; dur = kf.d || 1.4; drift = { dx: kf.dx ?? 0, dy: kf.dy ?? 0, dz: kf.dz ?? 0.006 }; }
  return settle(t);
}
// câmera viva: respiração e tremida nos impactos
function liveCam(cam, t, impacts, seed = 0) {
  let { x, y, z } = cam;
  x += 9 * Math.sin(t * 0.21 + seed) + 4 * Math.sin(t * 0.53 + seed * 2);
  y += 6 * Math.sin(t * 0.17 + seed * 3) + 3 * Math.cos(t * 0.47 + seed);
  z *= 1 + 0.006 * Math.sin(t * 0.31 + seed);
  let rot = 0.0035 * Math.sin(t * 0.13 + seed);
  for (const ti of impacts || []) { const dt = t - ti; if (dt < 0 || dt > 0.7) continue; const a = Math.exp(-dt * 7);
    x += 16 * a * Math.sin(dt * 95); y += 12 * a * Math.cos(dt * 83); rot += 0.006 * a * Math.sin(dt * 70); z *= 1 + 0.035 * a; }
  return { x, y, z, rot };
}
// ease.inOut(t) = t<.5 ? 4t³ : 1 − (−2t+2)³/2
```

- A paralaxe por camada do Bovonel é `ctx.translate((cam.x − 960)(1 − depth), (cam.y − 540)(1 − depth))`.
- As cenas do Bovonel eram um "mundo" largo (x até ~7000) em que a câmera viajava entre estações. Veja `referencia-bovonel/video-06-passagem/scenes.js`.

## 4. Luz que conta a história

**[TESTADO]**. As funções estão em `episodio.js` dos episódios do Quase Disse.

- **`luz(g, cx, cy, r, centro, borda)`:** um gradiente radial em `multiply`. Escurece as bordas e dá a cor da fonte de luz.
- **`brilho(g, cx, cy, r, cor, a)`:** um gradiente em `screen`, para abajur, janela e luz de emergência.
- **`escurece(g, a, 'r,g,b')`:** um véu da cor da noite.
- **Grão de filme:** uma textura de ruído de 2048 × 1200 em `overlay`, com alfa 0,07 e deslocada a cada passo da fervura.
- **Uma fonte de luz quente organiza o quadro** (prompt mestre do Quase Disse): o abajur âmbar à noite, o sol entrando pela porta de dia.
- **A luz muda com a história:**
  - no ep01, o elevador pisca no tranco e fica a 58%, mais quente (luz de emergência);
  - no ep02, o sol anda pelo chão durante a tarde, e às 18h o abajur passa a mandar.
- **Paleta do Quase Disse:** noite azul-violeta com uma luz âmbar e um acento de cor por personagem. **Não é obrigatória no canal novo.**
- **Fundo desfocado nos closes:** `g.filter = 'blur(7px)'` na camada de fundo, com o personagem do outro lado desfocado no primeiro plano.
- **Cuidado [TESTADO]:** os fundos têm de ser maiores que o quadro no zoom máximo. Num corte vertical, o fundo terminou antes da borda e apareceu um canto preto.

## 5. Cenário e profundidade

- **Cada cena define a geometria do lugar** como constantes: chão, teto, horizonte, portas, balcão. Exemplo no ep02: `SAG`, `MESA`, `ELEV`, `PORTA`.
- **A profundidade decide três coisas:**
  - a escala dos personagens (docs/07);
  - a ordem de desenho: quem tem o pé mais baixo na tela vem por último;
  - o que fica atrás do balcão.
- **Objetos de quina:** `reto: true`.
- **Layout real nos objetos que o público conhece** (Bovonel): o livro da portaria tem margem vermelha, pautas, data e uma letra diferente por morador; o painel do elevador tem número e seta.
- **Letra de mão por personagem** (ep02): 8 fontes OFL em `assets/fontes/` (Kalam, Caveat, Gochi Hand, Patrick Hand, Indie Flower, Shadows Into Light, Reenie Beanie, Nothing You Could Do). As licenças estão junto.
- **A frase tem de caber:** se a linha não cabe na página, a letra encolhe (`cabe(txt, f, tam, max)`).

## 6. Planos, cortes e continuidade

**Lista de planos** (`M.planos`): cada bloco tem um plano. Os cortes no meio de um bloco são inseridos com `corta(t, id, bloco)`. `planoEm(t)` devolve o plano do instante.

**Regras testadas:**
- **Dois ângulos com marcas fixas:** o plano geral é um palco lateral ou frontal; os closes são três-quartos, do lugar de quem olha. Os olhares cruzam o quadro na mesma direção do plano geral.
  - No ep02, o close do Caio foi espelhado (`scale(-1, 1)`) para olhar para a esquerda, onde fica o porteiro.
- **O corte para dentro do elevador acontece no meio do passo** (ep01). O movimento esconde o corte.
- **O corte para quem espera, antes da resposta** **[APROVADO]**.
- **A troca de imagem acompanha a mudança de ideia ou de emoção**, não um cronômetro (Bovonel).
- **Transições discretas:** corte seco é o padrão, com no máximo uma transição de efeito por vídeo (Bovonel).

**Para o canal novo [PROPOSTA]:**
- Cortes de 1 a 3 s nas tentativas e nas gags.
- Planos de 4 a 8 s no mecanismo e no veredito.
- Um plano "câmera de experimento" fixo e frontal, que se repete no dia 1 e no dia 7 para a comparação.
- Medir a duração de cada plano com a conferência de ritmo (docs/15).

## 7. Thumbnails e direção visual juntas

A thumb nasce de um plano planejado para ela (docs/12). Por isso, ao desenhar o cenário e a luz da cena-chave, pense também na leitura em 168 × 94 px: um rosto grande, luz quente e fundo escuro.
