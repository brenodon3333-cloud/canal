// Busca no Wikimedia Commons pela ABA DO CHROME (javascript_tool numa página de commons.wikimedia.org).
// Por que pelo navegador: a API recusa muitos pedidos vindos do terminal (erro 429).
// Edite o objeto Q (chave -> busca ou "Category:Nome") e rode. Baixa UM arquivo levantamento_commons.json
// para a pasta Downloads (o Chrome bloqueia vários downloads seguidos da mesma página, então é um só).
// Depois: mova o JSON para <projeto>/imagens/ e use baixar_commons.py.
const Q = {
  "pessoa_1": "Category:John Pemberton",
  "anuncios": "Coca-Cola advertisement 1890s",
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const strip = s => (s || '').replace(/<[^>]+>/g, '').trim().slice(0, 140);
const res = {}; const errs = [];
for (const [k, q] of Object.entries(Q)) {
  const base = {format: 'json', action: 'query', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '1600',
    iiextmetadatafilter: 'LicenseShortName|DateTimeOriginal|Artist|ImageDescription'};
  const p = q.startsWith('Category:') ? {generator: 'categorymembers', gcmtitle: q, gcmtype: 'file', gcmlimit: '50'}
                                      : {generator: 'search', gsrsearch: q, gsrnamespace: '6', gsrlimit: '30'};
  try {
    const d = await (await fetch('/w/api.php?' + new URLSearchParams({...base, ...p}))).json();
    res[k] = Object.values(d.query?.pages || {}).map(pg => { const i = pg.imageinfo?.[0] || {}; const m = i.extmetadata || {};
      return {title: pg.title.replace('File:', ''), w: i.width, h: i.height, license: m.LicenseShortName?.value || '?',
        date: strip(m.DateTimeOriginal?.value), artist: strip(m.Artist?.value), desc: strip(m.ImageDescription?.value),
        url: i.url, thumb: i.thumburl, page: i.descriptionurl}; });
  } catch (e) { errs.push(k + ': ' + e.message); }
  await sleep(700);
}
const a = document.createElement('a');
a.href = URL.createObjectURL(new Blob([JSON.stringify(res, null, 1)], {type: 'application/json'}));
a.download = 'levantamento_commons.json'; document.body.appendChild(a); a.click();
`ok: ${Object.keys(res).length} buscas, ${Object.values(res).flat().length} arquivos, erros: ${errs.join('; ') || 'nenhum'}`
