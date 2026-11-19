// Efeitos sonoros e trilha sintetizados (Web Audio, renderização offline),
// mixados com a narração. Nenhum arquivo de som externo além da voz.

const SR = 48000; // 48 kHz mono: qualidade cheia (o vídeo é entregue em partes, sem limite de tamanho)

function noiseBuffer(ac, sec, kind = 'white') {
  const n = Math.ceil(sec * ac.sampleRate);
  const b = ac.createBuffer(1, n, ac.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
  }
  return b;
}
function env(g, T, pts) { // pts: [[dt, valor], ...]
  g.gain.setValueAtTime(pts[0][1], T + pts[0][0]);
  for (let i = 1; i < pts.length; i++) g.gain.linearRampToValueAtTime(pts[i][1], T + pts[i][0]);
}
function expEnv(g, T, peak, attack, decay) {
  g.gain.setValueAtTime(0.0001, T);
  g.gain.linearRampToValueAtTime(peak, T + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, T + attack + decay);
}
function osc(ac, type, f, T, dur, out) {
  const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, T);
  o.connect(out); o.start(T); o.stop(T + dur + 0.05);
  return o;
}
function noise(ac, nb, T, dur, out) {
  const s = ac.createBufferSource(); s.buffer = nb; s.loop = true;
  s.loopStart = Math.random() * (nb.duration - 0.5);
  s.connect(out); s.start(T, Math.random() * (nb.duration - dur - 0.1 > 0 ? nb.duration - dur - 0.1 : 0)); s.stop(T + dur + 0.05);
  return s;
}
function filt(ac, type, f, q, out) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q ?? 0.7; b.connect(out); return b; }
function gainNode(ac, v, out) { const g = ac.createGain(); g.gain.value = v; g.connect(out); return g; }

// Cada efeito recebe (ac, out, rev, T, gain, opts). `rev` é o envio para reverberação.
function makeSFX(ac) {
  const white = noiseBuffer(ac, 4), brown = noiseBuffer(ac, 6, 'brown');
  return {
    whoosh(out, rev, T, g, o) {
      const d = o.dur || 0.7;
      const v = gainNode(ac, 0, out); v.connect(rev);
      env(v, T, [[0, 0], [d * 0.6, 0.55 * g], [d, 0]]);
      const bp = filt(ac, 'bandpass', 400, 1.4, v);
      bp.frequency.setValueAtTime(250, T); bp.frequency.exponentialRampToValueAtTime(2800, T + d * 0.6); bp.frequency.exponentialRampToValueAtTime(500, T + d);
      noise(ac, white, T, d, bp);
    },
    swoosh(out, rev, T, g) { this.whoosh(out, rev, T, g * 0.8, { dur: 0.38 }); },
    pop(out, rev, T, g) {
      const v = gainNode(ac, 0, out); v.connect(rev);
      expEnv(v, T, 0.42 * g, 0.004, 0.14);
      const o = osc(ac, 'sine', 900, T, 0.2, v); o.frequency.exponentialRampToValueAtTime(230, T + 0.09);
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.12 * g, 0.001, 0.02);
      noise(ac, white, T, 0.04, filt(ac, 'highpass', 3000, 0.7, c));
    },
    click(out, rev, T, g) {
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.3 * g, 0.001, 0.025);
      noise(ac, white, T, 0.05, filt(ac, 'bandpass', 3500, 2, c));
      const v = gainNode(ac, 0, out); expEnv(v, T, 0.15 * g, 0.001, 0.04);
      osc(ac, 'square', 1800, T, 0.05, filt(ac, 'lowpass', 4000, 0.7, v));
    },
    tick(out, rev, T, g) {
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.16 * g, 0.001, 0.012);
      noise(ac, white, T, 0.03, filt(ac, 'bandpass', 5200, 3, c));
    },
    coin(out, rev, T, g) {
      for (const [dt, base] of [[0, 1], [0.085, 0.94]]) {
        for (const [f, a, d] of [[2093, 0.18, 0.5], [3135, 0.12, 0.35], [4186, 0.08, 0.25], [5274, 0.05, 0.18]]) {
          const v = gainNode(ac, 0, out); v.connect(rev);
          expEnv(v, T + dt, a * g, 0.002, d);
          osc(ac, 'sine', f * base, T + dt, d + 0.05, v);
        }
      }
    },
    cash(out, rev, T, g) {
      const c = gainNode(ac, 0, out); env(c, T, [[0, 0.35 * g], [0.06, 0]]);
      noise(ac, white, T, 0.08, filt(ac, 'bandpass', 1600, 1.5, c));
      for (const [f, a] of [[1568, 0.16], [2349, 0.12], [3136, 0.1], [4699, 0.06], [6272, 0.04]]) {
        const v = gainNode(ac, 0, out); v.connect(rev);
        expEnv(v, T + 0.07, a * g, 0.002, 1.3);
        osc(ac, 'sine', f, T + 0.07, 1.4, v);
      }
    },
    hit(out, rev, T, g) {
      const v = gainNode(ac, 0, out); v.connect(rev);
      expEnv(v, T, 0.7 * g, 0.003, 0.45);
      const o = osc(ac, 'sine', 140, T, 0.5, v); o.frequency.exponentialRampToValueAtTime(45, T + 0.3);
      const n = gainNode(ac, 0, out); expEnv(n, T, 0.3 * g, 0.002, 0.18);
      noise(ac, white, T, 0.2, filt(ac, 'lowpass', 1400, 0.7, n));
    },
    impact(out, rev, T, g) {
      const v = gainNode(ac, 0, out); v.connect(rev);
      expEnv(v, T, 0.95 * g, 0.004, 1.4);
      const o = osc(ac, 'sine', 85, T, 1.5, v); o.frequency.exponentialRampToValueAtTime(30, T + 1.2);
      const n = gainNode(ac, 0, out); n.connect(rev); expEnv(n, T, 0.45 * g, 0.002, 0.6);
      noise(ac, brown, T, 0.7, filt(ac, 'lowpass', 600, 0.7, n));
      const h = gainNode(ac, 0, out); expEnv(h, T, 0.18 * g, 0.001, 0.08);
      noise(ac, white, T, 0.1, filt(ac, 'highpass', 2500, 0.7, h));
    },
    drop(out, rev, T, g) { // queda de valor: tom descendo
      const v = gainNode(ac, 0, out); v.connect(rev);
      expEnv(v, T, 0.3 * g, 0.01, 0.55);
      const o = osc(ac, 'triangle', 700, T, 0.6, filt(ac, 'lowpass', 2500, 0.7, v)); o.frequency.exponentialRampToValueAtTime(110, T + 0.5);
    },
    riser(out, rev, T, g, o) {
      const d = o.dur || 2;
      const v = gainNode(ac, 0, out); v.connect(rev);
      v.gain.setValueAtTime(0.0001, T); v.gain.exponentialRampToValueAtTime(0.35 * g, T + d); v.gain.linearRampToValueAtTime(0, T + d + 0.05);
      const bp = filt(ac, 'bandpass', 300, 2, v);
      bp.frequency.setValueAtTime(250, T); bp.frequency.exponentialRampToValueAtTime(5500, T + d);
      noise(ac, white, T, d + 0.1, bp);
      const s = gainNode(ac, 0.12, v);
      const ob = osc(ac, 'sawtooth', 110, T, d, filt(ac, 'lowpass', 1500, 0.7, s)); ob.frequency.exponentialRampToValueAtTime(440, T + d);
    },
    liquid(out, rev, T, g, o) {
      const d = o.dur || 2;
      const p = gainNode(ac, 0, out); env(p, T, [[0, 0], [0.2, 0.09 * g], [d - 0.2, 0.09 * g], [d, 0]]);
      noise(ac, white, T, d, filt(ac, 'bandpass', 900, 0.8, p));
      let t = T;
      while (t < T + d) {
        const f = 260 + Math.random() * 420;
        const v = gainNode(ac, 0, out); expEnv(v, t, 0.12 * g, 0.003, 0.06);
        const b = osc(ac, 'sine', f, t, 0.08, v); b.frequency.exponentialRampToValueAtTime(f * 1.9, t + 0.05);
        t += 0.05 + Math.random() * 0.11;
      }
    },
    truck(out, rev, T, g, o) {
      const d = o.dur || 3;
      const v = gainNode(ac, 0, out);
      env(v, T, [[0, 0], [d * 0.35, 0.55 * g], [d * 0.7, 0.45 * g], [d, 0]]);
      noise(ac, brown, T, d, filt(ac, 'lowpass', 320, 0.8, v));
      const e = gainNode(ac, 0.22, v);
      const m = osc(ac, 'sawtooth', 52, T, d, filt(ac, 'lowpass', 220, 1, e)); m.frequency.linearRampToValueAtTime(64, T + d * 0.5); m.frequency.linearRampToValueAtTime(48, T + d);
    },
    neon(out, rev, T, g) {
      const v = gainNode(ac, 0, out);
      const pattern = [[0, 1], [0.08, 0], [0.18, 1], [0.24, 0], [0.4, 1], [0.46, 0.2], [0.62, 1], [1.0, 1], [1.6, 0.25], [2.4, 0]];
      v.gain.setValueAtTime(0, T);
      for (const [dt, a] of pattern) v.gain.setValueAtTime(a * 0.14 * g, T + dt);
      const lp = filt(ac, 'lowpass', 1600, 0.7, v);
      osc(ac, 'sawtooth', 100, T, 2.5, lp); osc(ac, 'square', 120, T, 2.5, gainNode(ac, 0.4, lp));
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.3 * g, 0.001, 0.05);
      noise(ac, white, T, 0.06, filt(ac, 'highpass', 2000, 0.7, c));
    },
    // ---------- efeitos novos do vídeo 03 (eletricidade) ----------
    hum(out, rev, T, g, o) { // zumbido de transformador / fio de alta tensão
      const d = o.dur || 1.5;
      const v = gainNode(ac, 0, out);
      env(v, T, [[0, 0], [Math.min(0.3, d * 0.3), 0.16 * g], [d * 0.8, 0.14 * g], [d, 0]]);
      const lp = filt(ac, 'lowpass', o.f || 420, 2, v);
      osc(ac, 'sawtooth', 60, T, d, lp); osc(ac, 'sawtooth', 120, T, d, gainNode(ac, 0.5, lp)); osc(ac, 'square', 180, T, d, gainNode(ac, 0.12, lp));
      const trem = ac.createOscillator(); trem.frequency.value = 7; const tg = ac.createGain(); tg.gain.value = 0.04 * g; trem.connect(tg); tg.connect(v.gain); trem.start(T); trem.stop(T + d + 0.05);
    },
    spark(out, rev, T, g, o) { // faísca: estalos curtos e secos
      const n = o.n || 5;
      for (let i = 0; i < n; i++) {
        const t = T + i * (0.018 + Math.random() * 0.035);
        const c = gainNode(ac, 0, out); c.connect(rev); expEnv(c, t, (0.32 - i * 0.03) * g, 0.0008, 0.018 + Math.random() * 0.02);
        noise(ac, white, t, 0.05, filt(ac, 'highpass', 2500 + Math.random() * 3000, 0.7, c));
      }
      const z = gainNode(ac, 0, out); expEnv(z, T, 0.08 * g, 0.002, 0.12);
      osc(ac, 'sawtooth', 900, T, 0.15, filt(ac, 'bandpass', 3000, 3, z));
    },
    switch(out, rev, T, g) { // interruptor: clique duplo com corpo
      for (const [dt, a] of [[0, 1], [0.035, 0.55]]) {
        const c = gainNode(ac, 0, out); c.connect(rev); expEnv(c, T + dt, 0.42 * g * a, 0.0007, 0.03);
        noise(ac, white, T + dt, 0.05, filt(ac, 'bandpass', 2200, 1.5, c));
        const b = gainNode(ac, 0, out); expEnv(b, T + dt, 0.25 * g * a, 0.001, 0.06);
        const o2 = osc(ac, 'sine', 240, T + dt, 0.08, b); o2.frequency.exponentialRampToValueAtTime(120, T + dt + 0.06);
      }
    },
    relay(out, rev, T, g) { // relé metálico
      const c = gainNode(ac, 0, out); c.connect(rev); expEnv(c, T, 0.3 * g, 0.0006, 0.05);
      noise(ac, white, T, 0.06, filt(ac, 'bandpass', 4200, 4, c));
      const m = gainNode(ac, 0, out); expEnv(m, T, 0.14 * g, 0.001, 0.09);
      osc(ac, 'square', 1250, T, 0.1, filt(ac, 'lowpass', 3000, 1, m));
      const k = gainNode(ac, 0, out); expEnv(k, T, 0.35 * g, 0.002, 0.12);
      const o2 = osc(ac, 'sine', 160, T, 0.15, k); o2.frequency.exponentialRampToValueAtTime(70, T + 0.1);
    },
    meter(out, rev, T, g, o) { // medidor mecânico girando: tique-taque de engrenagem
      const d = o.dur || 1;
      let t = T, step = 0.045;
      while (t < T + d) {
        const c = gainNode(ac, 0, out); expEnv(c, t, 0.13 * g, 0.0006, 0.015);
        noise(ac, white, t, 0.03, filt(ac, 'bandpass', 3300, 5, c));
        t += step; step = Math.min(0.11, step * 1.03);
      }
      const w = gainNode(ac, 0, out); env(w, T, [[0, 0], [0.1, 0.04 * g], [d, 0]]);
      osc(ac, 'sawtooth', 210, T, d, filt(ac, 'bandpass', 700, 4, w));
      this.relay(out, rev, T + d, g * 0.7);
    },
    bulb(out, rev, T, g, o) { // lâmpada acendendo: "tink" + leve zumbido
      const p = o.p || 1;
      const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T, 0.12 * g, 0.001, 0.28);
      osc(ac, 'sine', 2350 * p, T, 0.3, v); osc(ac, 'sine', 3530 * p, T, 0.2, gainNode(ac, 0.5, v));
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.08 * g, 0.0005, 0.012);
      noise(ac, white, T, 0.02, filt(ac, 'highpass', 5000, 0.7, c));
    },
    wind(out, rev, T, g, o) { // vento na bandeira
      const d = o.dur || 2.5;
      const v = gainNode(ac, 0, out); v.connect(rev);
      env(v, T, [[0, 0], [d * 0.3, 0.3 * g], [d * 0.7, 0.24 * g], [d, 0]]);
      const bp = filt(ac, 'bandpass', 500, 0.9, v);
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.7; const lg = ac.createGain(); lg.gain.value = 260; lfo.connect(lg); lg.connect(bp.frequency); lfo.start(T); lfo.stop(T + d + 0.05);
      noise(ac, white, T, d, bp);
      // pano batendo
      for (let t = T + 0.2; t < T + d - 0.2; t += 0.32 + Math.random() * 0.25) {
        const f = gainNode(ac, 0, out); expEnv(f, t, 0.06 * g, 0.004, 0.05);
        noise(ac, brown, t, 0.08, filt(ac, 'lowpass', 900, 0.7, f));
      }
    },
    stamp(out, rev, T, g) { // carimbo batendo no papel
      const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T, 0.75 * g, 0.002, 0.22);
      const o2 = osc(ac, 'sine', 110, T, 0.25, v); o2.frequency.exponentialRampToValueAtTime(45, T + 0.18);
      const p = gainNode(ac, 0, out); expEnv(p, T, 0.4 * g, 0.0008, 0.06);
      noise(ac, white, T, 0.08, filt(ac, 'bandpass', 1400, 0.9, p));
    },
    paper(out, rev, T, g, o) { // papel deslizando / caindo
      const d = o.dur || 0.35;
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [d * 0.3, 0.22 * g], [d, 0]]);
      const bp = filt(ac, 'bandpass', 2200, 0.8, v); bp.frequency.setValueAtTime(3500, T); bp.frequency.exponentialRampToValueAtTime(1200, T + d);
      noise(ac, white, T, d, bp);
      const k = gainNode(ac, 0, out); expEnv(k, T + d * 0.9, 0.18 * g, 0.002, 0.07);
      noise(ac, brown, T + d * 0.9, 0.1, filt(ac, 'lowpass', 700, 0.7, k));
    },
    key(out, rev, T, g) { // tecla
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.16 * g, 0.0006, 0.02);
      noise(ac, white, T, 0.03, filt(ac, 'bandpass', 2800 + Math.random() * 800, 3, c));
    },
    buzz(out, rev, T, g) { // erro: "0 resultados"
      for (const dt of [0, 0.16]) {
        const v = gainNode(ac, 0, out); env(v, T + dt, [[0, 0], [0.01, 0.12 * g], [0.12, 0.12 * g], [0.13, 0]]);
        osc(ac, 'square', 196, T + dt, 0.14, filt(ac, 'lowpass', 1400, 0.7, v));
      }
    },
    ding(out, rev, T, g) { // confirmação positiva
      for (const [dt, f] of [[0, 1318.5], [0.09, 1975.5]]) {
        const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T + dt, 0.15 * g, 0.002, 0.6);
        osc(ac, 'sine', f, T + dt, 0.7, v);
      }
    },
    water(out, rev, T, g, o) { // chuveiro
      const d = o.dur || 2;
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [0.25, 0.16 * g], [d - 0.3, 0.14 * g], [d, 0]]);
      noise(ac, white, T, d, filt(ac, 'highpass', 1800, 0.6, filt(ac, 'lowpass', 7000, 0.6, v)));
    },
    poweroff(out, rev, T, g) { // a casa apagando
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0.22 * g], [0.9, 0]]);
      const lp = filt(ac, 'lowpass', 900, 1, v); lp.frequency.setValueAtTime(900, T); lp.frequency.exponentialRampToValueAtTime(80, T + 0.9);
      const o2 = osc(ac, 'sawtooth', 120, T, 0.95, lp); o2.frequency.exponentialRampToValueAtTime(28, T + 0.9);
    },
    poweron(out, rev, T, g) { // ligando
      const v = gainNode(ac, 0, out); v.connect(rev); env(v, T, [[0, 0], [0.45, 0.16 * g], [0.6, 0]]);
      const o2 = osc(ac, 'sawtooth', 40, T, 0.62, filt(ac, 'lowpass', 1200, 1, v)); o2.frequency.exponentialRampToValueAtTime(130, T + 0.5);
    },
    whip(out, rev, T, g) { this.whoosh(out, rev, T, g, { dur: 0.32 }); },
    sparkle(out, rev, T, g) {
      for (let i = 0; i < 9; i++) {
        const t = T + i * 0.045 + Math.random() * 0.02;
        const v = gainNode(ac, 0, out); v.connect(rev);
        expEnv(v, t, 0.06 * g, 0.002, 0.25);
        osc(ac, 'sine', 2600 + Math.random() * 3600, t, 0.3, v);
      }
    },

    // ---------- efeitos novos do vídeo 04 (açougue, campo, porto) ----------
    beep(out, rev, T, g, o) { // bipe da balança
      const n = o.n || 1;
      for (let i = 0; i < n; i++) {
        const v = gainNode(ac, 0, out); env(v, T + i * 0.13, [[0, 0], [0.005, 0.12 * g], [0.08, 0.12 * g], [0.09, 0]]);
        osc(ac, 'square', 2730, T + i * 0.13, 0.1, filt(ac, 'lowpass', 5000, 0.7, v));
      }
    },
    printer(out, rev, T, g, o) { // impressora térmica: motor de passo + papel saindo
      const d = o.dur || 0.9;
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [0.03, 0.1 * g], [d - 0.05, 0.1 * g], [d, 0]]);
      const m = osc(ac, 'sawtooth', 420, T, d, filt(ac, 'bandpass', 1300, 3, v));
      const lfo = ac.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 38; const lg = ac.createGain(); lg.gain.value = 0.06 * g; lfo.connect(lg); lg.connect(v.gain); lfo.start(T); lfo.stop(T + d + 0.05);
      const p2 = gainNode(ac, 0, out); env(p2, T, [[0, 0], [0.05, 0.07 * g], [d, 0.05 * g], [d + 0.05, 0]]);
      noise(ac, white, T, d + 0.05, filt(ac, 'bandpass', 4200, 1.2, p2));
      this.click(out, rev, T + d + 0.02, g * 0.8);
    },
    chop(out, rev, T, g) { // cutelo na tábua
      const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T, 0.8 * g, 0.002, 0.25);
      const o2 = osc(ac, 'sine', 180, T, 0.3, v); o2.frequency.exponentialRampToValueAtTime(60, T + 0.2);
      const w = gainNode(ac, 0, out); expEnv(w, T, 0.45 * g, 0.001, 0.09);
      noise(ac, brown, T, 0.12, filt(ac, 'lowpass', 1800, 0.8, w));
      for (const [f, a] of [[2650, 0.06], [4120, 0.04]]) { const m = gainNode(ac, 0, out); m.connect(rev); expEnv(m, T, a * g, 0.001, 0.5); osc(ac, 'sine', f, T, 0.55, m); }
      const s = gainNode(ac, 0, out); env(s, T - 0.14, [[0, 0], [0.12, 0.18 * g], [0.14, 0]]);
      const bp = filt(ac, 'bandpass', 900, 1.5, s); bp.frequency.setValueAtTime(600, T - 0.14); bp.frequency.exponentialRampToValueAtTime(3500, T);
      noise(ac, white, T - 0.14, 0.15, bp);
    },
    knife(out, rev, T, g) { // faca deslizando na carne / tábua
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [0.05, 0.14 * g], [0.22, 0.1 * g], [0.3, 0]]);
      const bp = filt(ac, 'bandpass', 2500, 3, v); bp.frequency.setValueAtTime(1800, T); bp.frequency.linearRampToValueAtTime(3800, T + 0.3);
      noise(ac, white, T, 0.32, bp);
      const k = gainNode(ac, 0, out); expEnv(k, T + 0.28, 0.25 * g, 0.002, 0.08);
      noise(ac, brown, T + 0.28, 0.1, filt(ac, 'lowpass', 900, 0.7, k));
    },
    coldDoor(out, rev, T, g) { // porta da câmara fria: trava, vedação soltando e ar frio
      this.relay(out, rev, T, g * 0.9);
      const s = gainNode(ac, 0, out); env(s, T + 0.05, [[0, 0], [0.1, 0.22 * g], [0.6, 0.12 * g], [1.4, 0]]);
      noise(ac, white, T + 0.05, 1.4, filt(ac, 'highpass', 3000, 0.7, s));
      const l = gainNode(ac, 0, out); l.connect(rev); env(l, T, [[0, 0], [0.3, 0.3 * g], [1.6, 0]]);
      noise(ac, brown, T, 1.7, filt(ac, 'lowpass', 260, 0.7, l));
    },
    bell(out, rev, T, g) { // sino de leilão
      for (const [dt, a] of [[0, 1], [0.32, 0.8], [0.64, 0.65]]) for (const [f, k, d] of [[880, 0.16, 1.4], [1760 * 1.01, 0.08, 0.9], [2637, 0.05, 0.6], [3520 * 1.02, 0.03, 0.4]]) {
        const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T + dt, k * a * g, 0.002, d);
        osc(ac, 'sine', f, T + dt, d + 0.05, v);
      }
    },
    horn(out, rev, T, g, o) { // buzina de navio
      const d = o.dur || 1.8;
      const v = gainNode(ac, 0, out); v.connect(rev); env(v, T, [[0, 0], [0.15, 0.2 * g], [d - 0.3, 0.18 * g], [d, 0]]);
      const lp = filt(ac, 'lowpass', 700, 1.2, v);
      for (const [f, a] of [[98, 1], [147, 0.6], [196, 0.35]]) { const o2 = osc(ac, 'sawtooth', f, T, d, gainNode(ac, a * 0.35, lp)); o2.detune.value = (Math.random() - 0.5) * 12; }
    },
    sizzle(out, rev, T, g, o) { // chiado de churrasqueira
      const d = o.dur || 1.5;
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [0.15, 0.12 * g], [d - 0.2, 0.1 * g], [d, 0]]);
      noise(ac, white, T, d, filt(ac, 'highpass', 4500, 0.6, v));
      for (let t = T; t < T + d; t += 0.02 + Math.random() * 0.06) { const c = gainNode(ac, 0, out); expEnv(c, t, 0.05 * g, 0.0006, 0.01); noise(ac, white, t, 0.02, filt(ac, 'highpass', 6000, 0.7, c)); }
    },
    chalk(out, rev, T, g, o) { // giz na lousa
      const d = o.dur || 0.8;
      let t = T;
      while (t < T + d) {
        const len = 0.06 + Math.random() * 0.12;
        const v = gainNode(ac, 0, out); env(v, t, [[0, 0], [0.01, 0.1 * g], [len - 0.01, 0.08 * g], [len, 0]]);
        noise(ac, white, t, len + 0.02, filt(ac, 'bandpass', 3000 + Math.random() * 2500, 2.5, v));
        t += len + 0.02 + Math.random() * 0.05;
      }
    },
    clock(out, rev, T, g, o) { // relógio grande de parede: tique-taque de madeira
      const n = o.n || 4, step = o.step || 0.5;
      for (let i = 0; i < n; i++) {
        const t = T + i * step, f = i % 2 ? 1500 : 1900;
        const c = gainNode(ac, 0, out); c.connect(rev); expEnv(c, t, 0.24 * g, 0.0008, 0.05);
        noise(ac, white, t, 0.06, filt(ac, 'bandpass', f, 4, c));
        const b = gainNode(ac, 0, out); expEnv(b, t, 0.15 * g, 0.001, 0.07);
        osc(ac, 'sine', i % 2 ? 420 : 520, t, 0.09, b);
      }
    },
    moo(out, rev, T, g) { // mugido curto e baixo
      const d = 1.1;
      const v = gainNode(ac, 0, out); v.connect(rev); env(v, T, [[0, 0], [0.2, 0.12 * g], [0.8, 0.1 * g], [d, 0]]);
      const f1 = filt(ac, 'bandpass', 520, 4, v), f2 = filt(ac, 'bandpass', 1100, 5, gainNode(ac, 0.5, v));
      const o2 = osc(ac, 'sawtooth', 150, T, d, f1); o2.frequency.linearRampToValueAtTime(128, T + 0.4); o2.frequency.linearRampToValueAtTime(108, T + d);
      const o3 = osc(ac, 'sawtooth', 150, T, d, f2); o3.frequency.linearRampToValueAtTime(128, T + 0.4); o3.frequency.linearRampToValueAtTime(108, T + d);
    },
    gate(out, rev, T, g) { // porteira de madeira fechando
      const c = gainNode(ac, 0, out); env(c, T, [[0, 0], [0.05, 0.08 * g], [0.45, 0.06 * g], [0.5, 0]]);
      const o2 = osc(ac, 'sawtooth', 220, T, 0.5, filt(ac, 'bandpass', 900, 6, c)); o2.frequency.linearRampToValueAtTime(330, T + 0.45);
      const b = gainNode(ac, 0, out); b.connect(rev); expEnv(b, T + 0.5, 0.55 * g, 0.002, 0.3);
      noise(ac, brown, T + 0.5, 0.35, filt(ac, 'lowpass', 700, 0.8, b));
      const k = gainNode(ac, 0, out); expEnv(k, T + 0.5, 0.3 * g, 0.002, 0.2);
      const o3 = osc(ac, 'sine', 140, T + 0.5, 0.25, k); o3.frequency.exponentialRampToValueAtTime(70, T + 0.7);
    },
    clank(out, rev, T, g) { // contêiner de metal
      const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T, 0.5 * g, 0.002, 0.5);
      const o2 = osc(ac, 'sine', 95, T, 0.55, v); o2.frequency.exponentialRampToValueAtTime(55, T + 0.4);
      for (const [f, a, d] of [[612, 0.1, 0.7], [1180, 0.07, 0.5], [1730, 0.05, 0.35]]) { const m = gainNode(ac, 0, out); m.connect(rev); expEnv(m, T, a * g, 0.001, d); osc(ac, 'triangle', f, T, d + 0.05, m); }
    },
    flip(out, rev, T, g, o) { // painel de placas giratórias
      const d = o.dur || 0.7;
      for (let t = T; t < T + d; t += 0.025 + Math.random() * 0.02) {
        const c = gainNode(ac, 0, out); expEnv(c, t, 0.11 * g, 0.0006, 0.012);
        noise(ac, white, t, 0.02, filt(ac, 'bandpass', 2400 + Math.random() * 1500, 3, c));
      }
      this.click(out, rev, T + d, g * 0.9);
    },
    weight(out, rev, T, g) { // peso de ferro batendo
      const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T, 0.45 * g, 0.002, 0.25);
      const o2 = osc(ac, 'sine', 120, T, 0.3, v); o2.frequency.exponentialRampToValueAtTime(70, T + 0.2);
      const m = gainNode(ac, 0, out); expEnv(m, T, 0.08 * g, 0.001, 0.3); osc(ac, 'triangle', 1650, T, 0.32, m);
    },
    ice(out, rev, T, g, o) { // gelo mexendo na caixa de isopor
      const d = o.dur || 0.9;
      for (let t = T; t < T + d; t += 0.04 + Math.random() * 0.1) {
        const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, t, (0.05 + Math.random() * 0.05) * g, 0.001, 0.08);
        osc(ac, 'sine', 2200 + Math.random() * 2600, t, 0.1, v);
      }
      const s = gainNode(ac, 0, out); env(s, T, [[0, 0], [0.1, 0.06 * g], [d, 0]]);
      noise(ac, white, T, d, filt(ac, 'bandpass', 5000, 1, s));
    },
    fizz(out, rev, T, g, o) { // gás subindo na lata/copo: estalinhos agudos e chiado
      const d = o.dur || 1.4;
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [0.08, 0.1 * g], [d, 0]]);
      noise(ac, white, T, d, filt(ac, 'highpass', 6500, 0.7, v));
      for (let t = T; t < T + d; t += 0.015 + Math.random() * 0.05) { const k = gainNode(ac, 0, out); expEnv(k, t, (0.03 + Math.random() * 0.04) * g * (1 - (t - T) / d), 0.0005, 0.01); noise(ac, white, t, 0.015, filt(ac, 'highpass', 7000, 1, k)); }
    },
    clink(out, rev, T, g, o) { // vidro com vidro (garrafa, copo)
      for (const [f, a, d] of [[3150, 0.16, 0.6], [4720, 0.1, 0.4], [6340, 0.06, 0.25], [2210, 0.05, 0.5]]) {
        const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T, a * g, 0.001, d); osc(ac, 'sine', f * (o.p || 1), T, d + 0.05, v);
      }
    },
    crate(out, rev, T, g) { // engradado batendo com garrafas
      const v = gainNode(ac, 0, out); expEnv(v, T, 0.35 * g, 0.002, 0.18); osc(ac, 'triangle', 140, T, 0.2, filt(ac, 'lowpass', 700, 1, v));
      const n = gainNode(ac, 0, out); expEnv(n, T, 0.2 * g, 0.001, 0.08); noise(ac, white, T, 0.1, filt(ac, 'bandpass', 900, 1, n));
      for (let i = 0; i < 4; i++) this.clink(out, rev, T + 0.02 + i * 0.035, g * 0.5, { p: 0.9 + i * 0.07 });
    },
    scan(out, rev, T, g) { // leitor de código de barras do caixa
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [0.004, 0.14 * g], [0.11, 0.14 * g], [0.12, 0]]);
      osc(ac, 'sine', 1975, T, 0.13, v);
    },
    canopen(out, rev, T, g) { // lata abrindo: clique + "tsss"
      this.click(out, rev, T, g * 1.2);
      const v = gainNode(ac, 0, out); env(v, T + 0.02, [[0, 0], [0.03, 0.26 * g], [0.6, 0.06 * g], [0.9, 0]]);
      noise(ac, white, T + 0.02, 0.9, filt(ac, 'highpass', 5000, 0.7, v));
    },
    rail(out, rev, T, g) { // gancho correndo no trilho metálico
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [0.05, 0.12 * g], [0.5, 0.08 * g], [0.6, 0]]);
      noise(ac, white, T, 0.6, filt(ac, 'bandpass', 3200, 6, v));
      this.clank(out, rev, T + 0.55, g * 0.5);
    },
    // ---------- efeitos novos do vídeo 06 (aeroporto) ----------
    chime(out, rev, T, g) { // aviso sonoro do aeroporto: "plim-plom" de dois tons
      for (const [dt, f] of [[0, 784], [0.42, 622.3]]) for (const [m, a, d] of [[1, 0.16, 1.4], [2, 0.05, 0.9], [3, 0.02, 0.6]]) {
        const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T + dt, a * g, 0.004, d); osc(ac, 'sine', f * m, T + dt, d + 0.05, v);
      }
    },
    jet(out, rev, T, g, o) { // jato passando ao longe
      const d = o.dur || 3;
      const v = gainNode(ac, 0, out); v.connect(rev); env(v, T, [[0, 0], [d * 0.45, 0.32 * g], [d, 0]]);
      const bp = filt(ac, 'bandpass', 600, 0.6, v); bp.frequency.setValueAtTime(1800, T); bp.frequency.exponentialRampToValueAtTime(380, T + d);
      noise(ac, white, T, d, bp);
      const r = gainNode(ac, 0, out); env(r, T, [[0, 0], [d * 0.5, 0.28 * g], [d, 0]]); noise(ac, brown, T, d, filt(ac, 'lowpass', 200, 0.7, r));
    },
    belt(out, rev, T, g) { // cinto de segurança fechando
      this.click(out, rev, T, g * 1.1);
      const m = gainNode(ac, 0, out); expEnv(m, T + 0.01, 0.12 * g, 0.001, 0.12); osc(ac, 'triangle', 2400, T + 0.01, 0.14, filt(ac, 'bandpass', 2400, 4, m));
    },
    tear(out, rev, T, g) { // papel destacando no picote
      for (let i = 0; i < 9; i++) { const t2 = T + i * 0.022 + Math.random() * 0.01; const c = gainNode(ac, 0, out); expEnv(c, t2, (0.14 - i * 0.008) * g, 0.0008, 0.02); noise(ac, white, t2, 0.03, filt(ac, 'bandpass', 2600 + Math.random() * 1800, 1.5, c)); }
      const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [0.05, 0.12 * g], [0.22, 0]]); noise(ac, white, T, 0.25, filt(ac, 'highpass', 3000, 0.7, v));
    },
    tap(out, rev, T, g) { // toque na tela do celular
      const c = gainNode(ac, 0, out); expEnv(c, T, 0.18 * g, 0.0008, 0.03); noise(ac, white, T, 0.04, filt(ac, 'bandpass', 1500, 1.2, c));
      const v = gainNode(ac, 0, out); expEnv(v, T, 0.08 * g, 0.001, 0.06); osc(ac, 'sine', 1200, T, 0.08, v);
    },
    drip(out, rev, T, g, o) { // gota caindo (pequena ou grande)
      const big = o.big ? 1 : 0, f0 = big ? 380 : 1400;
      const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T, (big ? 0.4 : 0.22) * g, 0.002, big ? 0.35 : 0.12);
      const b = osc(ac, 'sine', f0, T, 0.4, v); b.frequency.exponentialRampToValueAtTime(f0 * 2.4, T + (big ? 0.12 : 0.05));
      if (big) this.hit(out, rev, T + 0.02, g * 0.4);
    },
    gavel(out, rev, T, g) { // martelo de juiz na base de madeira
      const v = gainNode(ac, 0, out); v.connect(rev); expEnv(v, T, 0.7 * g, 0.001, 0.16);
      const o2 = osc(ac, 'triangle', 420, T, 0.2, filt(ac, 'lowpass', 2400, 1, v)); o2.frequency.exponentialRampToValueAtTime(180, T + 0.12);
      const n = gainNode(ac, 0, out); expEnv(n, T, 0.35 * g, 0.0006, 0.05); noise(ac, white, T, 0.06, filt(ac, 'bandpass', 1800, 1.2, n));
    },
  };
}

function impulse(ac, sec, decay) {
  const n = Math.floor(sec * ac.sampleRate);
  const b = ac.createBuffer(1, n, ac.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
  return b;
}

// ---------- ambiente (vídeo 05) ----------
// Sem música: feedback do dono no vídeo 04 ("música mínima ou nenhuma"). Só um ambiente quase inaudível
// por cena (geladeira, fábrica, rua, bar), ~30 dB abaixo da voz. Os efeitos sonoros carregam o vídeo.
// sections: [{ t, amb: 'geladeira'|'fabrica'|'rua'|'bar'|'saguao'|'pista'|'nada', a }]
function music(ac, out, total, sections) {
  const white = noiseBuffer(ac, 4), brown = noiseBuffer(ac, 6, 'brown');
  const loop = (buf, T, d, dest) => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(dest); s.start(T, Math.random() * 2); s.stop(T + d + 0.1); };
  sections.forEach((sec, i) => {
    const T = sec.t, end = Math.min(total, i + 1 < sections.length ? sections[i + 1].t : total), d = end - T;
    if (d <= 0 || !sec.amb || sec.amb === 'nada') return;
    const a = sec.a ?? 1;
    const v = gainNode(ac, 0, out); env(v, T, [[0, 0], [1.2, a], [Math.max(1.3, d - 0.8), a], [d, 0]]);
    if (sec.amb === 'geladeira') { // compressor de geladeira: zumbido grave + ar
      osc(ac, 'sawtooth', 58, T, d, filt(ac, 'lowpass', 160, 1, gainNode(ac, 0.05, v)));
      loop(brown, T, d, filt(ac, 'lowpass', 500, 0.7, gainNode(ac, 0.06, v)));
    } else if (sec.amb === 'fabrica') { // fábrica ao longe: ronco e batidas leves da esteira
      loop(brown, T, d, filt(ac, 'lowpass', 260, 0.8, gainNode(ac, 0.12, v)));
      for (let t = T + 0.5; t < end; t += 0.42) { const k = gainNode(ac, 0, v); expEnv(k, t, 0.02, 0.002, 0.06); noise(ac, white, t, 0.08, filt(ac, 'bandpass', 2400, 2, k)); }
    } else if (sec.amb === 'rua') { // estrada: ronco de motor distante
      loop(brown, T, d, filt(ac, 'lowpass', 220, 0.7, gainNode(ac, 0.14, v)));
    } else if (sec.amb === 'saguao') { // saguão do aeroporto: ar-condicionado e burburinho distante, bem baixo
      loop(brown, T, d, filt(ac, 'lowpass', 300, 0.7, gainNode(ac, 0.08, v)));
      for (const [f, q, g2] of [[500, 1.4, 0.03], [1100, 1.8, 0.018]]) loop(white, T, d, filt(ac, 'bandpass', f, q, gainNode(ac, g2, v)));
    } else if (sec.amb === 'pista') { // pátio: turbina em marcha lenta, longe
      loop(brown, T, d, filt(ac, 'lowpass', 240, 0.8, gainNode(ac, 0.12, v)));
      osc(ac, 'sawtooth', 92, T, d, filt(ac, 'lowpass', 300, 2, gainNode(ac, 0.012, v)));
      loop(white, T, d, filt(ac, 'bandpass', 3200, 2, gainNode(ac, 0.006, v)));
    } else if (sec.amb === 'bar') { // bar: burburinho de vozes (ruído em bandas de fala) e copos
      for (const [f, q, g] of [[420, 1.5, 0.05], [900, 1.8, 0.04], [1700, 2, 0.025]]) loop(white, T, d, filt(ac, 'bandpass', f, q, gainNode(ac, g, v)));
      for (let t = T + 1; t < end; t += 1.6 + Math.random() * 2.4) { const k = gainNode(ac, 0, v); expEnv(k, t, 0.03, 0.002, 0.5); osc(ac, 'sine', 2600 + Math.random() * 1800, t, 0.55, k); }
    }
  });
}

// Mixagem final. Devolve PCM 16 bits mono (Int16Array) a 48 kHz.
async function renderMix(voiceBuf, events, total, sections) {
  const ac = new OfflineAudioContext(1, Math.ceil(total * SR), SR);
  const master = ac.createDynamicsCompressor();
  master.threshold.value = -6; master.ratio.value = 12; master.attack.value = 0.003; master.release.value = 0.12; master.knee.value = 3;
  const masterGain = gainNode(ac, 0.95, ac.destination); master.connect(masterGain);

  // voz: ganho + compressão leve
  const vc = ac.createDynamicsCompressor();
  vc.threshold.value = -20; vc.ratio.value = 3; vc.attack.value = 0.005; vc.release.value = 0.15;
  const vSrc = ac.createBufferSource(); vSrc.buffer = voiceBuf;
  const mute = (typeof window !== 'undefined' && window.__mute) || {};
  const vGain = gainNode(ac, mute.voice ? 0 : 2.1, vc); vSrc.connect(vGain); vc.connect(master);
  vSrc.start(0);

  // reverberação compartilhada
  const conv = ac.createConvolver(); conv.buffer = impulse(ac, 2.4, 3.2);
  const revIn = gainNode(ac, mute.bed || mute.sfx ? 0 : 0.28, conv); conv.connect(master);

  // efeitos
  const sfxBus = gainNode(ac, mute.bed || mute.sfx ? 0 : 0.62, master);
  const SFX = makeSFX(ac);
  for (const [t, name, g = 1, o = {}] of events) {
    if (!SFX[name] || t < 0 || t > total) continue;
    SFX[name](sfxBus, revIn, t, g, o);
  }

  // ambiente fixo, bem baixo (sem música)
  const ambBus = gainNode(ac, mute.bed ? 0 : 0.18, master);
  music(ac, ambBus, total, sections);

  const out = await ac.startRendering();
  const d = out.getChannelData(0);
  const pcm = new Int16Array(d.length);
  let peak = 0;
  for (let i = 0; i < d.length; i++) {
    const v = Math.max(-1, Math.min(1, d[i]));
    peak = Math.max(peak, Math.abs(v));
    pcm[i] = v < 0 ? v * 32768 : v * 32767;
  }
  return { pcm, peak, sampleRate: SR };
}
