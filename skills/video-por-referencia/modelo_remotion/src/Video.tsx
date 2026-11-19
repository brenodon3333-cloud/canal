/*
 * ESQUELETO DA MONTAGEM — copie e preencha. Exemplo completo e testado: Video_exemplo_coca_cola.tsx
 *
 * 1. O = onde cada bloco de narração entra na linha do tempo (s). Entre blocos: 1 s de vinheta de capítulo.
 * 2. Cada <Seq a b> é uma cena com tempo ABSOLUTO. Use os helpers i()/a()/b()... = início do bloco + segundo da palavra
 *    (pegue o segundo exato de cada palavra no *_palavras.json da narração).
 * 3. Regras: intro troca a cada 0,7–1,5 s; corpo a cada 1–2 s (máx 3 s); palavra-chave do desfecho fica ≥ 1,2 s.
 * 4. Componentes prontos em lib.tsx (tabela "Para → Componente" no SKILL.md): KB, Clip, Parallax, TVAntiga, Jornal, Punch, Small,
 *    Counter, Portrait, Label, Stamp, Chips, Typed, Mapa, Linha, Barras, Graph, Traco, Moldura, Toon, Chapter, Flash, Speed,
 *    Split, Mosaic, Grain. A Moldura (tampinhas) e o objeto da Chapter são do exemplo da Coca-Cola: troque pelo símbolo do tema.
 * 5. Posições SEMPRE em fração da altura (y={H * 0.45}) para a mesma cena servir no vertical e no horizontal.
 */
import React from "react";
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Sequence} from "remotion";
import legendas from "./data/legendas.json";
import {Seq, KB, Punch, Small, Chapter, Grain, Flash, f, FPS, MONT, TEMA} from "./lib";

export const LARGURA = 1080;   // CURTO vertical: 1080 x 1920 · LONGO horizontal: 1920 x 1080
export const ALTURA = 1920;
const H = ALTURA;
TEMA.cor = "#E61D2B";          // cor da empresa do vídeo (ex.: azul Pepsi #004B93, amarelo Shell #FBCE07)
TEMA.escuro = "#7d0a12";
TEMA.claro = "#ff6b74";

const O = {intro: 0.6, c1: 0};          // <- preencher com o início de cada bloco
export const TOTAL = 60;                // <- duração total (s). Shorts: no máximo 178 s
const i = (s: number) => O.intro + s;

const HIDE: [number, number][] = [[0, 0.6]];   // trechos sem legenda de rodapé (intro com texto próprio, vinhetas, telas só de texto)

type G = {s: number; e: number; w: {t: string; s: number}[]};
const Legenda: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  if (HIDE.some(([x, y]) => t >= x && t < y)) return null;
  const g = (legendas as G[]).find((x) => t >= x.s && t < x.e);
  if (!g) return null;
  return (
    <div style={{position: "absolute", top: ALTURA * 0.63, left: 50, right: 50, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 64,
      lineHeight: 1.15, color: "white", textShadow: "0 0 3px #000, 0 6px 24px rgba(0,0,0,.95)"}}>
      {g.w.map((w, k) => {
        const dt = (t - w.s) * FPS;
        const o = interpolate(dt, [-1, 4], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        const bl = interpolate(dt, [-1, 5], [14, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        const now = t >= w.s && (k === g.w.length - 1 || t < g.w[k + 1].s);
        return <span key={k} style={{display: "inline-block", margin: "0 12px", opacity: o, filter: `blur(${bl}px)`, color: now ? "#ffe14d" : "white"}}>{w.t}</span>;
      })}
    </div>
  );
};

const Visual: React.FC = () => (
  <>
    {/* EXEMPLO — apague e escreva as cenas do roteiro */}
    <Seq a={0} b={i(1.5)}><KB s="ia/exemplo.png" z={[1.4, 1.05]} /><Punch t="GANCHO" size={180} y={H * 0.47} at={0.6} /><Flash /></Seq>
    <Seq a={i(1.5)} b={i(3)}><KB s="img/exemplo.jpg" tone="sepia" /><Small t="frase com *destaque" y={H * 0.29} /></Seq>
    <Seq a={i(3)} b={i(4)}><Chapter n={1} t="Subtítulo" /></Seq>
  </>
);

const Narr: React.FC<{file: string; at: number}> = ({file, at}) => (
  <Sequence from={f(at)} layout="none"><Audio src={staticFile(`audio/narracao/${file}`)} /></Sequence>
);
const Music: React.FC<{file: string; from: number; to: number; startAt?: number; vol?: number}> = ({file, from, to, startAt = 0, vol = 0.16}) => {
  const len = f(to) - f(from);
  return (
    <Sequence from={f(from)} durationInFrames={len} layout="none">
      <Audio src={staticFile(`audio/musicas/${file}`)} startFrom={f(startAt)}
        volume={(fr) => vol * interpolate(fr, [0, 6, len - 8, len], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})} />
    </Sequence>
  );
};
const Fx: React.FC<{n: string; at: number; v?: number}> = ({n, at, v = 0.5}) => (
  <Sequence from={Math.max(0, f(at))} layout="none"><Audio src={staticFile(`audio/efeitos/${n}.mp3`)} volume={v} /></Sequence>
);

const Som: React.FC = () => (
  <>
    {/* narração 1.0 | música 0.15–0.22 por baixo da voz | efeitos 0.4–0.6 */}
    {/* <Narr file="01.wav" at={O.intro} /> */}
    {/* <Music file="01_intro.mp3" from={0} to={28.6} vol={0.22} /> */}
    {/* <Fx n="impacto_hit" at={i(1.5)} /> */}
  </>
);

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: "black"}}>
    <Visual />
    <Legenda />
    <Grain />
    <Som />
  </AbsoluteFill>
);
