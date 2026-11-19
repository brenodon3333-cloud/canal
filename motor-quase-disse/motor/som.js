// Síntese e mixagem de som por código (48 kHz, estéreo).
// Mesma lógica do Web Audio usado no Bovonel (osciladores, ruído, filtros, envelopes),
// aqui renderizada amostra por amostra em Node para sair direto no arquivo final.

const SR = 48000;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (seg) => Math.max(1, Math.round(seg * SR));
const dB = (d) => Math.pow(10, d / 20);

function ruido(len, seed = 1) {
  const r = rng(seed);
  const x = new Float32Array(len);
  for (let i = 0; i < len; i++) x[i] = r() * 2 - 1;
  return x;
}

function ruidoRosa(len, seed = 1) {
  const r = rng(seed);
  const x = new Float32Array(len);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < len; i++) {
    const w = r() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
    x[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return x;
}

// Biquad RBJ. f pode ser número ou função do tempo (s) para varreduras.
function biquad(x, tipo, f, q = 0.707, ganho = 0) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  let b0, b1, b2, a1, a2;
  const coef = (fc) => {
    fc = Math.min(Math.max(fc, 10), SR * 0.45);
    const w = (2 * Math.PI * fc) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    const A = Math.pow(10, ganho / 40);
    let B0, B1, B2, A0, A1, A2;
    if (tipo === 'lp') { B0 = (1 - c) / 2; B1 = 1 - c; B2 = B0; A0 = 1 + al; A1 = -2 * c; A2 = 1 - al; }
    else if (tipo === 'hp') { B0 = (1 + c) / 2; B1 = -(1 + c); B2 = B0; A0 = 1 + al; A1 = -2 * c; A2 = 1 - al; }
    else if (tipo === 'bp') { B0 = al; B1 = 0; B2 = -al; A0 = 1 + al; A1 = -2 * c; A2 = 1 - al; }
    else { B0 = 1 + al * A; B1 = -2 * c; B2 = 1 - al * A; A0 = 1 + al / A; A1 = -2 * c; A2 = 1 - al / A; } // pico
    b0 = B0 / A0; b1 = B1 / A0; b2 = B2 / A0; a1 = A1 / A0; a2 = A2 / A0;
  };
  const varia = typeof f === 'function';
  if (!varia) coef(f);
  for (let i = 0; i < x.length; i++) {
    if (varia && i % 32 === 0) coef(f(i / SR));
    const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}

// Envelope multiplicador: fn(t) -> ganho linear
function env(x, fn) {
  for (let i = 0; i < x.length; i++) x[i] *= fn(i / SR);
  return x;
}
const ataqueQueda = (a, d) => (t) => (t < a ? t / a : Math.exp(-(t - a) / d));

function seno(len, freq, fase = 0) {
  const x = new Float32Array(len);
  let ph = fase;
  const varia = typeof freq === 'function';
  for (let i = 0; i < len; i++) {
    x[i] = Math.sin(ph);
    ph += (2 * Math.PI * (varia ? freq(i / SR) : freq)) / SR;
  }
  return x;
}

function soma(...xs) {
  const len = Math.max(...xs.map((x) => x.length));
  const y = new Float32Array(len);
  for (const x of xs) for (let i = 0; i < x.length; i++) y[i] += x[i];
  return y;
}
const escala = (x, g) => { for (let i = 0; i < x.length; i++) x[i] *= g; return x; };

// ------------------------------------------------------------------ mesa de mixagem
class Mesa {
  constructor(dur) {
    this.len = n(dur);
    this.L = new Float32Array(this.len);
    this.R = new Float32Array(this.len);
    this.revL = new Float32Array(this.len); // envio para a sala
    this.revR = new Float32Array(this.len);
    this.log = []; // lista de entradas para a planilha de som
  }
  // pan: -1 esquerda .. 1 direita. dist: 0 colado .. 1 longe (abafa e põe mais sala)
  por(x, t, { g = 0, pan = 0, dist = 0, nome = '', origem = '', funcao = '' } = {}) {
    let y = x;
    if (dist > 0) y = biquad(y, 'lp', 16000 * Math.pow(0.25, dist), 0.7);
    const ganho = dB(g - dist * 6);
    const p = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
    const gl = Math.cos(p) * ganho * Math.SQRT2 * 0.8, gr = Math.sin(p) * ganho * Math.SQRT2 * 0.8;
    const envio = 0.08 + dist * 0.5;
    const i0 = Math.round(t * SR);
    for (let i = 0; i < y.length; i++) {
      const k = i0 + i;
      if (k < 0 || k >= this.len) continue;
      this.L[k] += y[i] * gl; this.R[k] += y[i] * gr;
      this.revL[k] += y[i] * gl * envio; this.revR[k] += y[i] * gr * envio;
    }
    if (nome) this.log.push({ t, dur: y.length / SR, nome, origem, dist, pan, funcao });
  }
  // leito contínuo com ganho (linear), pan e distância variando no tempo (ex.: troca de ângulo)
  porLeito(x, t0, gFn, panFn, envio = 0.15, info = null) {
    const i0 = Math.round(t0 * SR);
    for (let i = 0; i < x.length; i++) {
      const k = i0 + i;
      if (k < 0 || k >= this.len) continue;
      const t = k / SR, gl0 = gFn(t), p = ((Math.max(-1, Math.min(1, panFn(t))) + 1) * Math.PI) / 4;
      const l = x[i] * gl0 * Math.cos(p) * 1.13, r = x[i] * gl0 * Math.sin(p) * 1.13;
      this.L[k] += l; this.R[k] += r; this.revL[k] += l * envio; this.revR[k] += r * envio;
    }
    if (info) this.log.push({ t: t0, dur: x.length / SR, ...info });
  }
  // sala pequena (Schroeder/Freeverb simplificado); estéreo por deslocamento de atrasos
  sala(tamanho = 0.72, abafa = 0.35, nivel = 0.5) {
    const combs = [1116, 1188, 1277, 1356, 1422, 1491].map((d) => Math.round(d * SR / 44100));
    const alls = [556, 441, 341].map((d) => Math.round(d * SR / 44100));
    const proc = (ent, desloc) => {
      const out = new Float32Array(this.len);
      for (const d0 of combs) {
        const d = d0 + desloc, buf = new Float32Array(d);
        let idx = 0, lp = 0;
        for (let i = 0; i < this.len; i++) {
          const o = buf[idx];
          lp = o * (1 - abafa) + lp * abafa;
          buf[idx] = ent[i] + lp * tamanho;
          idx = (idx + 1) % d;
          out[i] += o / combs.length;
        }
      }
      for (const d0 of alls) {
        const d = d0 + desloc, buf = new Float32Array(d);
        let idx = 0;
        for (let i = 0; i < this.len; i++) {
          const b = buf[idx], v = out[i];
          out[i] = -v + b; buf[idx] = v + b * 0.5;
          idx = (idx + 1) % d;
        }
      }
      return out;
    };
    const wl = proc(this.revL, 0), wr = proc(this.revR, 23);
    for (let i = 0; i < this.len; i++) { this.L[i] += wl[i] * nivel; this.R[i] += wr[i] * nivel; }
  }
}

// Compressor simples para a voz (RMS, ataque/soltura em ms)
function comprimir(x, limiar = -24, razao = 3, ataque = 8, soltura = 120) {
  const y = new Float32Array(x.length);
  const ca = Math.exp(-1 / (SR * ataque / 1000)), cs = Math.exp(-1 / (SR * soltura / 1000));
  let e = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i] * x[i];
    e = v > e ? ca * e + (1 - ca) * v : cs * e + (1 - cs) * v;
    const nivel = 10 * Math.log10(e + 1e-12);
    const red = nivel > limiar ? (nivel - limiar) * (1 - 1 / razao) : 0;
    y[i] = x[i] * dB(-red);
  }
  return y;
}

// Curva de automação [[t, dB], ...] -> função t -> ganho linear (interpolação em dB)
function curva(pontos) {
  return (t) => {
    if (t <= pontos[0][0]) return dB(pontos[0][1]);
    for (let i = 1; i < pontos.length; i++) {
      if (t <= pontos[i][0]) {
        const [t0, a] = pontos[i - 1], [t1, b] = pontos[i];
        return dB(a + ((b - a) * (t - t0)) / (t1 - t0));
      }
    }
    return dB(pontos[pontos.length - 1][1]);
  };
}

module.exports = { SR, n, dB, rng, ruido, ruidoRosa, biquad, env, ataqueQueda, seno, soma, escala, Mesa, comprimir, curva };
