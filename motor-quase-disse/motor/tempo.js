// Linha do tempo: blocos ("beats") em sequência. Um bloco pode ter duração fixa
// ou ser medido pela fala que ele contém (antes + duração da fala + depois).
// Depois de montada, a linha do tempo responde:
//   B('id')            -> { ini, fim, dur } do bloco
//   W('L1', 'bolo')    -> { ini, fim } absolutos da palavra na fala gravada
//   fala('L1')         -> { ini, fim, srcIni, srcFim } (onde entra e de onde sai no arquivo)

const norm = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function montarTempo(blocos, tempos) {
  const B = {};
  const falas = {};
  let t = 0;
  for (const b of blocos) {
    const ini = t;
    let dur;
    if (b.fala) {
      const l = tempos.linhas[b.fala];
      if (!l) throw new Error(`fala ${b.fala} ausente em tempos.json`);
      const antes = b.antes ?? 0;
      const depois = b.depois ?? 0;
      const fd = l.fim - l.ini;
      falas[b.fala] = { ini: ini + antes, fim: ini + antes + fd, srcIni: l.ini, srcFim: l.fim, palavras: l.palavras };
      dur = antes + fd + depois;
    } else {
      dur = b.dur;
    }
    B[b.id] = { ini, fim: ini + dur, dur };
    t += dur;
  }
  const total = t;
  const W = (id, palavra, n = 1) => {
    const f = falas[id];
    if (!f) throw new Error(`fala ${id} não posicionada`);
    const alvo = norm(palavra);
    let k = 0;
    for (const p of f.palavras) {
      if (norm(p.p) === alvo && ++k === n) {
        return { ini: f.ini + (p.ini - f.srcIni), fim: f.ini + (p.fim - f.srcIni) };
      }
    }
    throw new Error(`palavra "${palavra}" não encontrada em ${id}`);
  };
  const get = (id) => {
    if (!B[id]) throw new Error(`bloco ${id} inexistente`);
    return B[id];
  };
  return { B: get, W, fala: (id) => falas[id], falas, total };
}

module.exports = { montarTempo, norm };
