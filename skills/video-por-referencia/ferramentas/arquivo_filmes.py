"""Filmagens de arquivo em domínio público do Internet Archive (coleção Prelinger e afins).

Uso 1 (buscar):   python -I -X utf8 arquivo_filmes.py buscar "<termos>" [colecao=prelinger] [n=20]
Uso 2 (baixar):   python -I -X utf8 arquivo_filmes.py baixar <identificador> <pasta_saida>
Uso 3 (trecho):   python -I -X utf8 arquivo_filmes.py trecho <arquivo.mp4> <ini_seg> <dur_seg> <saida.mp4>
Só aceita item com licença de domínio público / CC0 / CC BY (campo licenseurl) — Prelinger costuma ser domínio público.
Dica de busca: termos em inglês e da época ("soda fountain 1950s", "soldiers drinking", "factory bottling").
Depois de baixar: folha de contato com analisar_referencia.py (passo 2–4 s) para achar os trechos bons.
"""
import json, os, subprocess, sys, urllib.parse

def get(url):
    return json.loads(subprocess.run(["curl", "-sS", "-m", "60", url], capture_output=True, text=True).stdout or "{}")

def livre(lic):
    lic = (lic or "").lower()
    return any(k in lic for k in ["publicdomain", "/zero/", "licenses/by/"]) and "-sa" not in lic and "-nd" not in lic

cmd = sys.argv[1]
if cmd == "buscar":
    termos = sys.argv[2]
    col = sys.argv[3] if len(sys.argv) > 3 else "prelinger"
    n = sys.argv[4] if len(sys.argv) > 4 else "20"
    q = f"collection:{col} AND mediatype:movies AND ({termos})"
    url = "https://archive.org/advancedsearch.php?" + urllib.parse.urlencode(
        {"q": q, "fl[]": ["identifier", "title", "year", "licenseurl", "runtime"], "rows": n, "output": "json"}, doseq=True)
    docs = get(url).get("response", {}).get("docs", [])
    sys.stdout.reconfigure(encoding="utf-8")
    for d in docs:
        print(f"{'LIVRE ' if livre(d.get('licenseurl')) else 'checar'} | {d['identifier']} | {d.get('year', '?')} | {d.get('runtime', '?')} | {d.get('title', '')[:70]}")
    print(f"\n{len(docs)} resultados. 'checar' = sem licença no índice: confira em https://archive.org/details/<id> antes de usar.")
elif cmd == "baixar":
    ident, pasta = sys.argv[2], sys.argv[3]
    os.makedirs(pasta, exist_ok=True)
    meta = get(f"https://archive.org/metadata/{ident}")
    lic = meta.get("metadata", {}).get("licenseurl", "")
    if not livre(lic) and "prelinger" not in json.dumps(meta.get("metadata", {}).get("collection", "")).lower():
        sys.exit(f"Licença não confirmada ({lic or 'vazia'}). Abra https://archive.org/details/{ident} e confira antes.")
    mp4s = [f for f in meta.get("files", []) if f["name"].lower().endswith(".mp4")]
    if not mp4s:
        sys.exit("Item sem MP4.")
    alvo = min(mp4s, key=lambda f: abs(int(f.get("size", 0)) - 150_000_000))  # ~150 MB: qualidade boa sem ser gigante
    dest = os.path.join(pasta, ident + ".mp4")
    url = f"https://archive.org/download/{ident}/{urllib.parse.quote(alvo['name'])}"
    print(f"baixando {alvo['name']} ({int(alvo.get('size', 0)) / 1e6:.0f} MB)…", flush=True)
    subprocess.run(["curl", "-sS", "-L", "-f", "-o", dest, url], check=True)
    json.dump({"id": ident, "titulo": meta["metadata"].get("title"), "ano": meta["metadata"].get("year"), "licenca": lic or "Prelinger (domínio público)",
               "pagina": f"https://archive.org/details/{ident}"}, open(dest + ".credito.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("ok", dest)
elif cmd == "trecho":
    src, ini, dur, out = sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", ini, "-i", src, "-t", dur, "-an", "-c:v", "libx264", "-crf", "18", "-preset", "fast",
                    "-vf", "scale='min(1920,iw)':-2", out], check=True)
    print("ok", out)
