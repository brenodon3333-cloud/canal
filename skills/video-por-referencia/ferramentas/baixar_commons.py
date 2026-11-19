"""Lista e baixa imagens livres do levantamento do Commons.

Uso 1 (listar livres):  python -I -X utf8 baixar_commons.py <levantamento.json> --listar
Uso 2 (baixar):         python -I -X utf8 baixar_commons.py <levantamento.json> <pasta_imagens> <escolha.json>
escolha.json = {"pessoas": ["John Pemberton.jpg", ...], "anuncios": [...]}   (títulos exatos do levantamento)

Só aceita domínio público, CC0 e CC BY (sem SA). Arquivos > 1600 px vêm pela miniatura de 1600 px
(passa sem bloqueio); os menores vêm pelo original com pausa de 12 s (o servidor dá 429 se for rápido).
Grava _creditos.json com licença, data e página de cada imagem baixada.
"""
import json, os, re, subprocess, sys, time

lev = json.load(open(sys.argv[1], encoding="utf-8"))
def livre(r):
    lic = r.get("license") or ""
    ok = re.search(r"public domain|^PD|CC0|CC BY \d|CC BY$|CC-BY", lic, re.I) and "SA" not in lic
    return ok and (r.get("w") or 0) >= 400 and not r["title"].lower().endswith((".pdf", ".tif", ".tiff", ".djvu", ".ogv", ".webm", ".svg"))

if sys.argv[2] == "--listar":
    sys.stdout.reconfigure(encoding="utf-8")
    for k, v in lev.items():
        v = [r for r in v if livre(r)]
        print(f"## {k} ({len(v)})")
        for r in v[:15]:
            print(f"  {r['title'][:75]} | {r['w']}x{r['h']} | {r['license']} | {r['date'][:16]}")
    sys.exit()

pasta, escolha = sys.argv[2], json.load(open(sys.argv[3], encoding="utf-8"))
bt = {r["title"]: r for v in lev.values() for r in v}
cred = []
for sub, titles in escolha.items():
    os.makedirs(os.path.join(pasta, sub), exist_ok=True)
    for t in titles:
        r = bt.get(t) or next((v for k, v in bt.items() if k.startswith(t[:40])), None)
        if not r or not livre(r):
            print("PULEI (não achei ou não é livre):", t); continue
        big = (r["w"] or 0) > 1600
        url = r["thumb"] if big else r["url"]
        ext = os.path.splitext(url.split("?")[0])[1].lower() or ".jpg"
        name = re.sub(r"[^\w\-]+", "_", os.path.splitext(r["title"])[0])[:60] + ext
        dest = os.path.join(pasta, sub, name)
        if not os.path.exists(dest):
            ok = subprocess.run(["curl", "-sS", "-f", "-L", "-o", dest, url]).returncode == 0
            if not ok and os.path.exists(dest):
                os.remove(dest)
            print(("ok    " if ok else "FALHOU ") + f"{sub}/{name}")
            time.sleep(2 if big else 12)
        cred.append({"arquivo": f"{sub}/{name}", "titulo": r["title"], "licenca": r["license"], "data": r["date"], "pagina": r["page"]})
json.dump(cred, open(os.path.join(pasta, "_creditos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("Se algo FALHOU com 429, espere alguns minutos e rode de novo (pula o que já baixou).")
