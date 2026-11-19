import React from "react";
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, Sequence} from "remotion";
import legendas from "./data/legendas.json";
import {
  Seq, KB, Punch, Small, Moldura, Toon, Counter, Portrait, Label, Stamp, Chips, Typed, Speed, Graph, BottleLine,
  Flash, Chapter, Grain, Split, Mosaic, f, FPS, RED, MONT, PLAY,
} from "./lib";

// Início de cada bloco de narração na linha do tempo (segundos)
const O = {intro: 0.6, c1: 29.6, c2: 63.2, c3: 104.9, c4: 134.5, fe: 160.1};
export const TOTAL = 175.2;
const i = (s: number) => O.intro + s;
const a = (s: number) => O.c1 + s;
const b = (s: number) => O.c2 + s;
const c = (s: number) => O.c3 + s;
const d = (s: number) => O.c4 + s;
const e = (s: number) => O.fe + s;

// Trechos em que a legenda de rodapé some (a tela já tem o texto grande)
const HIDE: [number, number][] = [[0, 28.6], [28.6, 29.6], [62.2, 63.2], [103.9, 104.9], [133.5, 134.5], [b(27.3), b(29.7)], [c(7.9), c(12.6)], [d(6.4), d(9.6)]];

type G = {s: number; e: number; w: {t: string; s: number}[]};
const Legenda: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  if (HIDE.some(([x, y]) => t >= x && t < y)) return null;
  const g = (legendas as G[]).find((x) => t >= x.s && t < x.e);
  if (!g) return null;
  return (
    <div style={{position: "absolute", top: 1215, left: 50, right: 50, textAlign: "center", fontFamily: MONT, fontWeight: 800, fontSize: 64, lineHeight: 1.15,
      color: "white", textShadow: "0 0 3px #000, 0 6px 24px rgba(0,0,0,.95)"}}>
      {g.w.map((w, k) => {
        const dt = (t - w.s) * FPS;
        const o = interpolate(dt, [-1, 4], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        const bl = interpolate(dt, [-1, 5], [14, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        const dy = interpolate(dt, [-1, 5], [18, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
        const now = t >= w.s && (k === g.w.length - 1 || t < g.w[k + 1].s);
        return <span key={k} style={{display: "inline-block", margin: "0 12px", opacity: o, filter: `blur(${bl}px)`, transform: `translateY(${dy}px) scale(${now ? 1.04 : 1})`,
          color: now ? "#ffe14d" : "white"}}>{w.t}</span>;
      })}
    </div>
  );
};

const Black: React.FC<{c?: string}> = ({c = "black"}) => <AbsoluteFill style={{background: c}} />;

/* ============================ IMAGENS ============================ */
const Visual: React.FC = () => (
  <>
    {/* ---------------- INTRO ---------------- */}
    <Seq a={0} b={i(0.2)}><KB s="ia/16_tampinha_macro.png" z={[1.5, 1.05]} /><Small t="A HISTÓRIA QUE A COCA-COLA NÃO CONTA" y={330} size={48} step={0.05} /></Seq>
    <Seq a={i(0.2)} b={i(1.45)}>
      <Black c={RED} />
      <Punch t="Coca-Cola" font={PLAY} italic size={160} y={900} />
      <Small t="A HISTÓRIA QUE A COCA-COLA NÃO CONTA" y={330} size={48} step={0} />
    </Seq>
    <Seq a={i(1.45)} b={i(3.0)}>
      <KB s="img/Cocacola-5cents-1900.jpg" z={[1.3, 1.1]} y={[80, -80]} tone="sepia" dark={0.35} />
      <Small t="gasta *bilhões em propaganda" y={560} />
      <Punch t="BILHÕES" color={RED} size={190} y={900} at={0.05} bg="white" />
    </Seq>
    <Seq a={i(3.0)} b={i(4.8)}><KB s="ia/18_refrigerante_no_gelo.png" z={[1.1, 1.3]} /><Small t="e quase nunca tenta te vender o..." y={560} /></Seq>
    <Seq a={i(4.8)} b={i(5.9)}><Black /><Moldura /><Punch t="REFRIGERANTE" size={128} y={960} strike /></Seq>
    <Seq a={i(5.9)} b={i(7.4)}><Black /><Moldura /><Toon s="ia/13_ilustracao_lampada.png" y={900} size={560} /><Punch t="IDEIA" color={RED} size={170} y={1180} at={0.6} /></Seq>
    <Seq a={i(7.4)} b={i(8.5)}><Black /><Moldura /><Toon s="ia/13_ilustracao_lampada.png" y={820} size={340} count={5} /><Punch t="FELICIDADE" color={RED} size={130} y={1140} /></Seq>
    <Seq a={i(8.5)} b={i(9.4)}><KB s="img/Coke_ad_Dec_1923_mdp_39015020918861-seq_843.jpg" z={[1.25, 1.1]} tone="sepia" /><Moldura band={1180} /><Punch t="FAMÍLIA" color="white" size={170} y={1240} bg={RED} /></Seq>
    <Seq a={i(9.4)} b={i(10.6)}><KB s="img/SC_151547_-_A_moment_of_relaxation_on_the_porch_of_their_PX_.jpg" z={[1.35, 1.15]} x={[60, -60]} tone="bw" /><Moldura band={1180} /><Punch t="MOMENTOS" size={150} y={1240} bg={RED} /></Seq>
    <Seq a={i(10.6)} b={i(12.2)}><KB s="ia/16_tampinha_macro.png" z={[1.0, 1.9]} dark={0.2} /><Small t="Mas por trás dessa *garrafa..." y={560} /></Seq>
    <Seq a={i(12.2)} b={i(15.0)}><Black /><Moldura /><Toon s="ia/14_ilustracao_rosto_assustado.png" x={[-700, -60]} y={880} size={700} shake={10} /><Punch t="QUASE NINGUÉM" color={RED} size={110} y={1230} at={0.9} /><Small t="conhece" y={1330} at={1.5} /></Seq>
    <Seq a={i(15.0)} b={i(15.96)}><KB s="ia/19_folha_de_coca_botanica.png" z={[1.2, 1.4]} tone="red" /><Punch t="COCAÍNA" size={170} y={900} glitch /><Flash color="#ff2030" /></Seq>
    <Seq a={i(15.96)} b={i(16.86)}><KB s="ia/06_soldados_ww2_bebendo.png" z={[1.4, 1.2]} tone="bw" shake={14} /><Punch t="GUERRA" size={190} y={900} /></Seq>
    <Seq a={i(16.86)} b={i(18.5)}><KB s="ia/04_contrato_1899_um_dolar.png" z={[1.1, 1.3]} dark={0.35} /><Counter from={1000000} to={1} dur={1.2} prefix="US$ " size={150} y={880} sub="UM CONTRATO" /></Seq>
    <Seq a={i(18.5)} b={i(20.9)}><Split s="ia/09_lata_NEW_1985.png" at={0.9} /><Punch t="O MAIOR ERRO" size={120} y={1180} glitch at={0.4} /></Seq>
    <Seq a={i(20.9)} b={i(22.3)}><Speed /><Punch t="APERTA O CINTO" size={120} y={940} /></Seq>
    <Seq a={i(22.3)} b={i(23.7)}><Black c="#120808" /><Counter from={1886} to={2026} dur={1.2} sep={false} size={300} y={880} sub="3 MINUTOS" /></Seq>
    <Seq a={i(23.7)} b={i(25.2)}><KB s="ia/18_refrigerante_no_gelo.png" z={[1.4, 1.15]} /><Punch t="AÇÚCAR" size={170} y={760} color="white" at={1.0} /></Seq>
    <Seq a={i(25.2)} b={28.6}><KB s="ia/17_globo_pontos_vermelhos.png" z={[1.6, 1.0]} /><Punch t="IMPÉRIO" size={200} y={900} at={0.7} /></Seq>

    <Seq a={28.6} b={29.6}><Chapter n={1} t="Como tudo começou" /></Seq>

    {/* ---------------- CAPÍTULO 1 ---------------- */}
    <Seq a={a(0)} b={a(2.8)}>
      <KB s="img/Peachtree_Street_1882.jpg" z={[1.3, 1.1]} tone="sepia" />
      <BigThrough t="1886" />
      <Small t="Atlanta," y={560} size={64} />
    </Seq>
    <Seq a={a(2.8)} b={a(4.8)}><Portrait s="img/John_Pemberton.jpg" name="John Pemberton" /></Seq>
    <Seq a={a(4.8)} b={a(8.5)}>
      <KB s="img/John_Pemberton.jpg" z={[1.15, 1.35]} y={[0, 60]} tone="sepia" fit="contain" />
      <Label t="ex-soldado" x={90} y={330} at={0.1} />
      <Label t="morfina" x={600} y={1000} at={2.3} flip />
    </Seq>
    <Seq a={a(8.5)} b={a(9.4)}><KB s="ia/03_batalha_guerra_civil_gravura.png" z={[1.1, 1.5]} shake={22} tone="bw" /><Flash color="#ffffff" /></Seq>
    <Seq a={a(9.4)} b={a(11.1)}><KB s="ia/01_farmacia_1886_soda_fountain.png" z={[1.05, 1.25]} x={[-40, 40]} /><Punch t="REMÉDIO" size={150} y={780} at={0.7} /></Seq>
    <Seq a={a(11.1)} b={a(12.9)}><KB s="img/Vin_Mariani_Robida_1888.jpeg" z={[1.0, 1.25]} y={[60, -80]} fit="contain" tone="sepia" /><Small t="o sucesso da época" y={240} /></Seq>
    <Seq a={a(12.9)} b={a(14.5)}><Black c="#0d0d0d" /><Chips items={["VINHO", "+", "FOLHA DE COCA"]} y={660} step={0.3} /></Seq>
    <Seq a={a(14.5)} b={a(16.1)}><KB s="img/Pemberton_French_Wine_Coca.jpg" z={[1.4, 1.9]} y={[200, -100]} tone="sepia" /></Seq>
    <Seq a={a(16.1)} b={a(16.9)}><KB s="ia/19_folha_de_coca_botanica.png" z={[1.3, 1.5]} tone="red" /><Punch t="COCAÍNA" size={170} y={900} glitch /></Seq>
    <Seq a={a(16.9)} b={a(19.0)}><KB s="img/Atlanta_Commercial_Centre_1887.jpg" z={[1.15, 1.35]} tone="sepia" fit="contain" /><Stamp t="PROIBIDO" at={0.75} y={880} /></Seq>
    <Seq a={a(19.0)} b={a(21.3)}><KB s="ia/02_maos_misturando_xarope.png" z={[1.1, 1.3]} /><Punch t="AÇÚCAR" size={150} y={760} at={1.6} bg={RED} /></Seq>
    <Seq a={a(21.3)} b={a(22.9)}><KB s="img/Cola_acuminata_-_Köhler_s_Medizinal-Pflanzen-190.jpg" z={[1.0, 1.2]} fit="contain" /><Punch t="NOZ-DE-COLA" size={110} y={1380} at={0.6} bg={RED} /></Seq>
    <Seq a={a(22.9)} b={a(24.1)}><KB s="ia/18_refrigerante_no_gelo.png" z={[1.5, 1.2]} /><Punch t="ÁGUA COM GÁS" size={110} y={760} bg={RED} /></Seq>
    <Seq a={a(24.1)} b={a(26.3)}><Black c={RED} /><Punch t="Coca-Cola" font={PLAY} italic size={160} y={880} at={0.1} /><Small t="1886" y={1060} size={70} at={0.5} /><Flash /></Seq>
    <Seq a={a(26.3)} b={a(27.8)}><KB s="img/The_Ideal_Brain_Tonic_1886.jpg" z={[1.05, 1.3]} rot={[-2, 2]} fit="contain" /><Punch t="TÔNICO PARA OS NERVOS" size={76} y={300} bg="white" color={RED} /></Seq>
    <Seq a={a(27.8)} b={a(29.5)}><KB s="img/Coca_Cola_First_Advertisements.jpg" z={[1.2, 1.4]} tone="sepia" dark={0.4} fit="contain" /><Punch t="5¢" size={330} y={880} font={PLAY} /></Seq>
    <Seq a={a(29.5)} b={a(32.6)}><KB s="ia/01_farmacia_1886_soda_fountain.png" z={[1.35, 1.0]} dark={0.35} /><Small t="Resultado do primeiro ano?" y={420} /><Counter from={0} to={9} dur={1.4} at={1.6} size={380} y={860} sub="COPOS POR DIA" /></Seq>

    <Seq a={62.2} b={63.2}><Chapter n={2} t="A ascensão" /></Seq>

    {/* ---------------- CAPÍTULO 2 ---------------- */}
    <Seq a={b(0)} b={b(3.3)}><KB s="img/John_Pemberton.jpg" z={[1.2, 1.05]} tone="bw" fit="contain" dark={0.3} /><Counter from={1886} to={1888} dur={0.8} sep={false} size={240} y={1500} /></Seq>
    <Seq a={b(3.3)} b={b(5.7)}><Portrait s="img/Asa_Griggs_Candler_1922.png" name="Asa Candler" /></Seq>
    <Seq a={b(5.7)} b={b(8.8)}><KB s="img/Asa_Candler.jpg" z={[1.1, 1.3]} tone="sepia" fit="contain" dark={0.5} /><Counter from={0} to={2300} dur={1.1} at={0.6} prefix="US$ " size={190} y={900} /></Seq>
    <Seq a={b(8.8)} b={b(12.2)}><KB s="img/Cocacola-5cents-1900.jpg" z={[1.0, 1.2]} y={[100, -60]} /><Punch t="O PRODUTO É O DE MENOS" size={84} y={1080} at={1.5} bg="black" /></Seq>
    <Seq a={b(12.2)} b={b(13.7)}><KB s="img/cupom_Coca-Cola_1888.jpg" z={[1.2, 1.45]} fit="contain" /><Punch t="GRÁTIS" size={150} y={1350} bg="#ffe14d" color="black" at={0.6} /></Seq>
    <Seq a={b(13.7)} b={b(15.1)}><KB s="img/Coke_ad_Dec_1923_mdp_39015020918861-seq_843.jpg" z={[1.4, 1.15]} x={[-50, 50]} /></Seq>
    <Seq a={b(15.1)} b={b(15.9)}><KB s="img/Coca_Cola_First_Advertisements.jpg" z={[1.5, 1.2]} fit="contain" tone="sepia" /></Seq>
    <Seq a={b(15.9)} b={b(16.9)}><KB s="img/The_Ideal_Brain_Tonic_1886.jpg" z={[1.4, 1.15]} /></Seq>
    <Seq a={b(16.9)} b={b(18.7)}><Mosaic imgs={["img/Cocacola-5cents-1900.jpg", "img/cupom_Coca-Cola_1888.jpg", "img/Coke_ad_Dec_1923_mdp_39015020918861-seq_843.jpg", "img/The_Ideal_Brain_Tonic_1886.jpg", "img/Coca_Cola_First_Advertisements.jpg"]} /><Punch t="EM TODO LUGAR" size={110} y={900} bg={RED} at={0.3} /></Seq>
    <Seq a={b(18.7)} b={b(20.4)}><Black c="#120808" /><Counter from={1888} to={1899} dur={0.9} sep={false} size={300} y={900} /></Seq>
    <Seq a={b(20.4)} b={b(23.3)}><KB s="ia/05_advogados_1899_carroca_garrafas.png" z={[1.05, 1.3]} y={[0, 40]} /><Punch t="ENGARRAFAR" size={120} y={600} at={1.5} bg={RED} /></Seq>
    <Seq a={b(23.3)} b={b(25.9)}><KB s="img/Asa_Candler.jpg" z={[1.1, 1.35]} tone="sepia" fit="contain" /><Small t="garrafa *não *tem *futuro" y={1050} size={66} at={0.9} /></Seq>
    <Seq a={b(25.9)} b={b(27.3)}><KB s="ia/04_contrato_1899_um_dolar.png" z={[1.0, 1.35]} /></Seq>
    <Seq a={b(27.3)} b={b(27.76)}><Black /><Punch t="UM." size={340} y={900} /></Seq>
    <Seq a={b(27.76)} b={b(29.7)}><Black /><Punch t="DÓLAR." size={250} y={900} color={RED} /></Seq>
    <Seq a={b(29.7)} b={b(32.2)}><KB s="ia/17_globo_pontos_vermelhos.png" z={[1.0, 1.4]} /><Punch t="PELO MUNDO" size={120} y={1080} at={1.6} /></Seq>
    <Seq a={b(32.2)} b={b(33.6)}><Black c="#120808" /><Counter from={1899} to={1915} dur={0.9} sep={false} size={300} y={900} /></Seq>
    <Seq a={b(33.6)} b={b(35.1)}><KB s="img/Coke_bottle_patent.png" z={[1.0, 1.2]} fit="contain" /></Seq>
    <Seq a={b(35.1)} b={b(37.6)}><Black /><BottleLine glow /><Small t="reconhecida até no *escuro" y={1640} size={58} /></Seq>
    <Seq a={b(37.6)} b={b(40.8)}><KB s="ia/19_folha_de_coca_botanica.png" z={[1.1, 1.25]} /><XMark at={0.5} /><Punch t="PRATICAMENTE" size={96} y={1450} at={1.4} bg="black" /></Seq>

    <Seq a={103.9} b={104.9}><Chapter n={3} t="A guerra" /></Seq>

    {/* ---------------- CAPÍTULO 3 ---------------- */}
    <Seq a={c(0)} b={c(1.9)}><KB s="ia/06_soldados_ww2_bebendo.png" z={[1.3, 1.2]} tone="bw" dark={0.55} /><Counter from={1915} to={1941} dur={1.0} sep={false} size={300} y={900} /></Seq>
    <Seq a={c(1.9)} b={c(5.7)}><KB s="ia/06_soldados_ww2_bebendo.png" z={[1.05, 1.3]} x={[30, -30]} tone="bw" /><Punch t="SEGUNDA GUERRA" size={110} y={560} at={1.5} bg="black" /></Seq>
    <Seq a={c(5.7)} b={c(7.9)}><Portrait s="img/Robert_Woodruff_1944.jpg" name="Robert Woodruff" tone="bw" /></Seq>
    <Seq a={c(7.9)} b={c(12.6)}>
      <AbsoluteFill style={{background: "linear-gradient(#efe6d2,#d9ccb0)"}} />
      <Typed t="Todo soldado americano vai ter uma Coca por 5 centavos, onde quer que esteja." paper y={560} size={80} cps={20} />
      <Small t="— Robert Woodruff, 1941" y={1350} color="#3a3328" size={50} at={3.6} />
    </Seq>
    <Seq a={c(12.6)} b={c(15.4)}><KB s="ia/17_globo_pontos_vermelhos.png" z={[1.6, 1.3]} /><Counter from={0} to={64} dur={1.6} at={0.3} size={300} y={880} sub="FÁBRICAS NAS FRENTES" /></Seq>
    <Seq a={c(15.4)} b={c(17.2)}><KB s="img/Medicine_in_the_form_of_ice-cream_sundaes_and_banana_splits_.jpg" z={[1.4, 1.15]} fit="contain" tone="bw" /><Punch t="MILHÕES" size={170} y={1450} at={0.2} bg={RED} /></Seq>
    <Seq a={c(17.2)} b={c(19.4)}><KB s="img/SC_151547_-_A_moment_of_relaxation_on_the_porch_of_their_PX_.jpg" z={[1.15, 1.4]} x={[-60, 60]} tone="bw" /><Small t="*apaixonados pela marca" y={1050} size={66} at={0.2} /></Seq>
    <Seq a={c(19.4)} b={c(22.6)}><Black c="#0d0d0d" /><Punch t="ALEMANHA" size={128} y={760} /><Punch t="SEM XAROPE" size={110} y={1000} color={RED} at={1.9} strike /></Seq>
    <Seq a={c(22.6)} b={c(26.4)}><KB s="ia/07_garrafa_laranja_fanta_pb.png" z={[1.1, 1.3]} tone="bw" /><Punch t="SOBRAS" size={150} y={560} at={1.9} bg="black" /></Seq>
    <Seq a={c(26.4)} b={c(27.2)}><Black /><Small t="O nome?" y={880} size={90} /></Seq>
    <Seq a={c(27.2)} b={133.5}><KB s="ia/07_garrafa_laranja_fanta_pb.png" z={[1.4, 1.2]} /><Punch t="FANTA" size={240} y={520} color="#ff8a00" bg="black" /><Flash color="#ff9a00" /></Seq>

    <Seq a={133.5} b={134.5}><Chapter n={4} t="O maior desastre" glitch /></Seq>

    {/* ---------------- CAPÍTULO 4 ---------------- */}
    <Seq a={d(0)} b={d(1.2)}><Black c="#1a0a2a" /><Punch t="ANOS 80" size={210} y={900} color="#ff4fd8" stroke /></Seq>
    <Seq a={d(1.2)} b={d(4.5)}><KB s="ia/08_teste_cego_dois_copos.png" z={[1.05, 1.3]} /><Punch t="TESTES CEGOS" size={110} y={440} at={1.5} bg="black" /></Seq>
    <Seq a={d(4.5)} b={d(6.4)}><KB s="ia/11_cofre_formula_secreta.png" z={[1.0, 1.5]} /><Punch t="O IMPENSÁVEL" size={110} y={1450} at={0.9} /></Seq>
    <Seq a={d(6.4)} b={d(9.6)}><Black c="#0a0a12" /><Small t="1985" y={480} size={120} /><Typed t="FÓRMULA ORIGINAL" editor y={860} size={100} cps={14} at={0.3} selectAt={d(8.0)} deleteAt={d(8.7)} /></Seq>
    <Seq a={d(9.6)} b={d(11.4)}><KB s="ia/09_lata_NEW_1985.png" z={[1.6, 1.15]} shake={8} /><Punch t="NEW COKE" size={150} y={1500} glitch at={0.5} /></Seq>
    <Seq a={d(11.4)} b={d(14.3)}><KB s="ia/10_protesto_1985.png" z={[1.1, 1.35]} shake={10} /><Punch t="INFÂNCIA" size={140} y={560} at={2.0} bg={RED} /></Seq>
    <Seq a={d(14.3)} b={d(18.9)}><KB s="ia/12_central_telefones_1985.png" z={[1.05, 1.35]} shake={4} /><Counter from={400} to={1500} dur={1.6} at={0.4} size={190} y={520} sub="LIGAÇÕES POR DIA" /></Seq>
    <Seq a={d(18.9)} b={d(20.8)}><Black c="#120808" /><Counter from={1} to={79} dur={1.0} size={340} y={860} sub="DIAS DEPOIS" /></Seq>
    <Seq a={d(20.8)} b={d(22.9)}><KB s="img/CokePepsiChallenge.jpg" z={[1.0, 1.3]} fit="contain" /><Punch t="A ORIGINAL VOLTA" size={96} y={1450} at={1.0} bg={RED} /></Seq>
    <Seq a={d(22.9)} b={e(0)}><Graph up={0.8} /><Punch t="DE VOLTA AO TOPO" size={104} y={420} at={0.85} /></Seq>

    {/* ---------------- FECHAMENTO ---------------- */}
    <Seq a={e(0)} b={e(3.0)}><KB s="ia/17_globo_pontos_vermelhos.png" z={[1.0, 1.25]} /><Chips items={["200+ PAÍSES"]} y={1420} at={1.6} /></Seq>
    <Seq a={e(3.0)} b={e(6.3)}><Black c="#120808" /><Counter from={0} to={2200000000} dur={2.0} at={0.7} size={128} y={880} sub="VEZES POR DIA" font={MONT} /></Seq>
    <Seq a={e(6.3)} b={e(8.0)}><KB s="ia/01_farmacia_1886_soda_fountain.png" z={[1.3, 1.1]} tone="sepia" /><Punch t="9 COPOS" size={170} y={900} at={0.8} /></Seq>
    <Seq a={e(8.0)} b={e(10.7)}><KB s="img/Cocacola-5cents-1900.jpg" z={[1.15, 0.92]} gold /></Seq>
    <Seq a={e(10.7)} b={e(12.7)}><Black /><Punch t="NINGUÉM COMPRA" size={110} y={760} /><Punch t="REFRIGERANTE" size={120} y={920} color={RED} at={0.5} strike /></Seq>
    <Seq a={e(12.7)} b={TOTAL - 0.8}><Black c={RED} /><Small t="A gente compra" y={720} size={70} /><Punch t="UM SENTIMENTO" size={120} y={900} at={0.6} /><Flash at={1.2} /></Seq>
    <Seq a={TOTAL - 0.8} b={TOTAL}><KB s="ia/16_tampinha_macro.png" z={[1.05, 1.5]} /></Seq>
  </>
);

/** Número gigante desfocado que a câmera atravessa */
const BigThrough: React.FC<{t: string}> = ({t}) => {
  const fr = useCurrentFrame();
  const sc = interpolate(fr, [0, 40, 70], [1, 1.6, 9], {extrapolateRight: "clamp"});
  const bl = interpolate(fr, [0, 30, 70], [0, 2, 30], {extrapolateRight: "clamp"});
  const o = interpolate(fr, [50, 75], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return <div style={{position: "absolute", top: 900, left: 0, right: 0, textAlign: "center", fontFamily: PLAY, fontWeight: 900, fontSize: 330, color: "white",
    transform: `translateY(-50%) scale(${sc})`, filter: `blur(${bl}px)`, opacity: o, textShadow: "0 10px 60px rgba(0,0,0,.8)"}}>{t}</div>;
};

const XMark: React.FC<{at: number}> = ({at}) => {
  const fr = useCurrentFrame() - f(at);
  const p1 = interpolate(fr, [0, 6], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const p2 = interpolate(fr, [5, 11], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return <svg width={1080} height={1920} style={{position: "absolute"}}>
    <line x1={200} y1={500} x2={200 + 680 * p1} y2={500 + 680 * p1} stroke={RED} strokeWidth={50} strokeLinecap="round" />
    <line x1={880} y1={500} x2={880 - 680 * p2} y2={500 + 680 * p2} stroke={RED} strokeWidth={50} strokeLinecap="round" />
  </svg>;
};

/* ============================ SOM ============================ */
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
    <Narr file="01_intro.mp3" at={O.intro} />
    <Narr file="02_cap1_como_tudo_comecou.mp3" at={O.c1} />
    <Narr file="03_cap2_a_ascensao.mp3" at={O.c2} />
    <Narr file="04_cap3_a_guerra.mp3" at={O.c3} />
    <Narr file="05_cap4_o_maior_desastre.mp3" at={O.c4} />
    <Narr file="06_fechamento.mp3" at={O.fe} />

    <Music file="01_intro_trailer_escuro.mp3" from={0} to={28.6} startAt={1.2} vol={0.22} />
    <Music file="02_cap1_ragtime_1886.mp3" from={28.6} to={62.2} vol={0.17} />
    <Music file="03_cap2_jazz_espiao_ascensao.mp3" from={62.2} to={103.9} vol={0.15} />
    <Music file="04_cap3_guerra_militar.mp3" from={103.9} to={133.5} vol={0.17} />
    <Music file="05_cap4_new_coke_tensao_vitoria.mp3" from={133.5} to={e(0.8)} startAt={1.76} vol={0.17} />
    <Music file="06_fechamento_emocional.mp3" from={e(0)} to={TOTAL} vol={0.24} />

    {/* abertura e vinhetas */}
    <Fx n="garrafa_abrindo_pssst" at={0} v={0.8} />
    {[28.6, 62.2, 103.9, 133.5].map((t) => <React.Fragment key={t}><Fx n="garrafa_abrindo_pssst" at={t - 0.15} v={0.6} /><Fx n="whoosh_transicao" at={t} v={0.5} /></React.Fragment>)}
    <Fx n="glitch" at={133.55} v={0.5} />
    <Fx n="garrafa_abrindo_pssst" at={TOTAL - 0.8} v={0.8} />
    {/* intro: impacto em cada palavra-chave */}
    {[i(0.2), i(1.48), i(4.86), i(6.5), i(7.42), i(8.52), i(9.4)].map((t) => <Fx key={t} n="impacto_hit" at={t} v={0.45} />)}
    <Fx n="gelo_e_refrigerante_no_copo" at={i(3.0)} v={0.35} />
    <Fx n="riser_ate_impacto" at={i(11.0)} v={0.4} />
    <Fx n="glitch" at={i(15.0)} v={0.5} />
    <Fx n="impacto_hit" at={i(15.96)} v={0.5} />
    <Fx n="moeda_no_balcao" at={i(17.6)} v={0.6} />
    <Fx n="glitch" at={i(18.9)} v={0.45} />
    <Fx n="impacto_hit" at={i(19.4)} v={0.5} />
    <Fx n="whoosh_transicao" at={i(20.85)} v={0.6} />
    <Fx n="maquina_de_escrever" at={i(22.3)} v={0.25} />
    <Fx n="gelo_e_refrigerante_no_copo" at={i(23.7)} v={0.35} />
    <Fx n="braam_impacto_longo" at={i(25.9)} v={0.55} />
    {/* capítulo 1 */}
    <Fx n="whoosh_transicao" at={a(2.8)} v={0.4} />
    <Fx n="impacto_hit" at={a(8.5)} v={0.45} />
    <Fx n="glitch" at={a(16.1)} v={0.4} />
    <Fx n="carimbo" at={a(17.6)} v={0.6} />
    <Fx n="gelo_e_refrigerante_no_copo" at={a(22.9)} v={0.35} />
    <Fx n="garrafa_abrindo_pssst" at={a(24.1)} v={0.45} />
    <Fx n="moeda_no_balcao" at={a(28.0)} v={0.6} />
    <Fx n="impacto_hit" at={a(31.1)} v={0.4} />
    {/* capítulo 2 */}
    <Fx n="whoosh_transicao" at={b(3.3)} v={0.4} />
    <Fx n="caixa_registradora" at={b(6.4)} v={0.5} />
    <Fx n="carimbo" at={b(12.8)} v={0.4} />
    <Fx n="whoosh_transicao" at={b(16.9)} v={0.4} />
    <Fx n="moeda_no_balcao" at={b(26.8)} v={0.6} />
    <Fx n="impacto_hit" at={b(27.3)} v={0.6} />
    <Fx n="braam_impacto_longo" at={b(27.76)} v={0.55} />
    <Fx n="whoosh_transicao" at={b(33.6)} v={0.4} />
    <Fx n="impacto_hit" at={b(38.1)} v={0.4} />
    {/* capítulo 3 */}
    <Fx n="whoosh_transicao" at={c(5.7)} v={0.4} />
    <Fx n="maquina_de_escrever" at={c(7.9)} v={0.4} />
    <Fx n="maquina_de_escrever" at={c(10.5)} v={0.35} />
    <Fx n="impacto_hit" at={c(15.4)} v={0.4} />
    <Fx n="impacto_hit" at={c(27.2)} v={0.6} />
    <Fx n="garrafa_abrindo_pssst" at={c(27.25)} v={0.45} />
    {/* capítulo 4 */}
    <Fx n="glitch" at={d(10.0)} v={0.45} />
    <Fx n="telefones_tocando" at={d(14.3)} v={0.35} />
    <Fx n="impacto_hit" at={d(18.9)} v={0.45} />
    <Fx n="braam_impacto_longo" at={d(23.7)} v={0.5} />
    {/* fechamento */}
    <Fx n="impacto_hit" at={e(10.7)} v={0.4} />
  </>
);

export const CocaColaExemplo: React.FC = () => (
  <AbsoluteFill style={{background: "black"}}>
    <Visual />
    <Legenda />
    <Grain />
    <Som />
  </AbsoluteFill>
);
