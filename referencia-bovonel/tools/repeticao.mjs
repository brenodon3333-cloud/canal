// Mede repetição num texto de narração antes de entregar (feedback do dono no vídeo 05: "muito repetitivo").
// Uso: node tools/repeticao.mjs <pasta-do-video>   (lê <pasta>/narracao-texto.txt; cada parágrafo é uma cena)
// Aponta: números ditos mais de uma vez, palavras-chave em excesso, muletas de frase, frases que repetem uma cena anterior.
import fs from 'fs';
import path from 'path';

const file = path.join(path.resolve(process.argv[2]), 'narracao-texto.txt');
const text = fs.readFileSync(file, 'utf8');
const scenes = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const words = norm(text).match(/[a-z]+/g) || [];
const problems = [];

// 1) números por extenso repetidos (cada valor deve ser dito uma vez; voltar só no fechamento, de outro jeito)
const NUM = /\b(?:(?:um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|duzentos|trezentos|quatrocentos|quinhentos|mil|milhoes|bilhoes)(?:\s+(?:e|virgula)\s+|\s+)?)+(?:reais|real|centavos|por cento|mil|milhoes|bilhoes|litros|mililitros)\b/g;
const numCount = new Map();
scenes.forEach((s, i) => { for (const m of norm(s).matchAll(NUM)) { const k = m[0].replace(/\s+/g, ' ').trim(); if (!numCount.has(k)) numCount.set(k, []); numCount.get(k).push(i + 1); } });
const repNums = [...numCount].filter(([, c]) => c.length > 1).sort((a, b) => b[1].length - a[1].length);
for (const [k, c] of repNums) problems.push(`número repetido ${c.length}x: "${k}" (cenas ${[...new Set(c)].join(', ')})`);

// 2) muletas e perguntas retóricas
// conta só no começo da frase (onde a muleta pesa)
const starts = norm(text).split(/(?<=[.!?:])\s+|\n+/).map((f) => f.trim());
const tics = [['ou seja', 2], ['e o ', 3], ['e a ', 3], ['mas ', 3], ['agora', 2], ['entao', 3], ['e tem mais', 1], ['trocando em miudos', 1]];
for (const [t, max] of tics) { const n = starts.filter((f) => f.startsWith(t)).length; if (n > max) problems.push(`frase começando com "${t.trim()}" ${n}x (máximo ${max})`); }
const questions = (text.match(/\?/g) || []).length;
if (questions > scenes.length * 1.5) problems.push(`${questions} perguntas para ${scenes.length} cenas: pergunta demais perde força`);

// 3) palavras de conteúdo mais usadas (excesso = o texto gira em volta do mesmo ponto)
const STOP = new Set('a o e de do da dos das que em no na nos nas um uma pra pro para por com se nao mais mas sem ser sao foi tem ja isso esse essa este esta seu sua voce vai como quando ele ela eles elas lhe ou ao aos so tambem ate muito muita cada outro outra mesmo mesma la aqui ai entao agora dia faz fica ficam ficou vem vira'.split(' '));
const freq = new Map(); for (const w of words) if (w.length > 3 && !STOP.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
const per1000 = (n) => (n * 1000) / words.length;
const top = [...freq].sort((a, b) => b[1] - a[1]).slice(0, 12);
for (const [w, n] of top) if (per1000(n) > 12) problems.push(`palavra "${w}" ${n}x (${per1000(n).toFixed(0)} a cada 1.000 palavras; trocar por sinônimo, pronome ou cortar)`);

// 4) listas repetidas: a mesma sequência de 3+ itens em cenas diferentes
const lists = scenes.map((s) => (norm(s).match(/\b[a-z]+(?:, [a-z ]+){2,}/g) || []).map((l) => new Set(l.split(/,\s*|\s+e\s+/).map((x) => x.trim().split(' ').pop()))));
for (let i = 0; i < scenes.length; i++) for (let j = i + 1; j < scenes.length; j++) for (const a of lists[i]) for (const b of lists[j]) {
  const common = [...a].filter((x) => b.has(x) && x.length > 3);
  if (common.length >= 2) problems.push(`lista repetida nas cenas ${i + 1} e ${j + 1}: ${common.join(', ')}`);
}

// 5) frases muito parecidas com outra já dita (mais de 60% das palavras em comum)
const sentences = scenes.flatMap((s, i) => s.split(/(?<=[.!?:])\s+/).map((f) => ({ i: i + 1, f, w: new Set((norm(f).match(/[a-z]{4,}/g) || []).filter((x) => !STOP.has(x))) }))).filter((x) => x.w.size >= 4);
for (let a = 0; a < sentences.length; a++) for (let b = a + 1; b < sentences.length; b++) {
  const A = sentences[a], B = sentences[b]; const inter = [...A.w].filter((x) => B.w.has(x)).length;
  if (inter / Math.min(A.w.size, B.w.size) >= 0.6) problems.push(`frase parecida (cena ${A.i} e ${B.i}): "${A.f.slice(0, 60)}..." / "${B.f.slice(0, 60)}..."`);
}

console.log(`${scenes.length} cenas, ${words.length} palavras, ~${(words.length / 142).toFixed(1)} min de voz no ritmo do vídeo 04.`);
console.log(problems.length ? `${problems.length} ponto(s) de repetição:\n  - ` + problems.join('\n  - ') : 'Sem repetição acima do limite.');
