"""Monta os grupos de legenda (palavra por palavra) já no tempo ABSOLUTO da linha do tempo.

Uso:  python -I -X utf8 legendas.py <config.json> <saida_legendas.json>
config.json:
{
  "blocos": [ {"palavras": "caminho/01_intro_palavras.json", "inicio": 0.6}, ... ],   # 'inicio' = onde o bloco entra no vídeo (s)
  "corrigir": {"Coupons": "Cupons", "Nace": "Nasce"},                                # erros do Whisper -> grafia certa
  "remover": [["o", 24.28]],                                                           # palavra fantasma: [texto, tempo no bloco]
  "max_palavras": 3
}
Regra: quebra o grupo em pontuação ou a cada N palavras; junta '-Cola', '.300', '$' na palavra anterior.
"""
import json, re, sys

cfg = json.load(open(sys.argv[1], encoding="utf-8"))
fix = cfg.get("corrigir", {})
rem = cfg.get("remover", [])
N = cfg.get("max_palavras", 3)
groups = []
for b in cfg["blocos"]:
    o = b["inicio"]
    ws = json.load(open(b["palavras"], encoding="utf-8"))
    toks = []
    for w in ws:
        t = w["w"]
        if any(t == r[0] and abs(w["ini"] - r[1]) < 0.06 for r in rem):
            continue
        t = fix.get(t, t)
        if toks and (t.startswith("-") or t.startswith(".") or t == "$"):
            toks[-1]["w"] += t; toks[-1]["fim"] = w["fim"] + o; continue
        toks.append({"w": t, "ini": round(w["ini"] + o, 3), "fim": round(w["fim"] + o, 3)})
    cur = []
    for t in toks:
        cur.append(t)
        if re.search(r"[.,?!:;…]$", t["w"]) or len(cur) >= N:
            groups.append(cur); cur = []
    if cur:
        groups.append(cur)
out = []
for i, g in enumerate(groups):
    nxt = groups[i + 1][0]["ini"] if i + 1 < len(groups) else g[-1]["fim"] + 0.5
    end = min(nxt, g[-1]["fim"] + 0.45)
    out.append({"s": g[0]["ini"], "e": round(max(end, g[-1]["fim"] + 0.05), 3), "w": [{"t": x["w"], "s": x["ini"]} for x in g]})
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False)
print(f"{len(out)} grupos; a legenda termina em {out[-1]['e']:.2f}s")
