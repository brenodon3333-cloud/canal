"""Recorta pessoa/objeto do fundo (rembg, local e grátis) para o efeito 2.5D (Parallax na montagem).

Uso:  python -I -X utf8 recortar.py <imagem_ou_pasta> <pasta_saida> [modelo]
Modelos: u2net_human_seg (pessoas — padrão), isnet-general-use (objetos/produtos), u2net (geral)
Saída: PNG com fundo transparente, mesmo nome. Na primeira vez o modelo é baixado para ~/.u2net.
Dica: fotos antigas pequenas -> rode ampliar.py ANTES de recortar (borda fica mais limpa).
"""
import os, sys
from PIL import Image
from rembg import new_session, remove

ent, sai = sys.argv[1], sys.argv[2]
modelo = sys.argv[3] if len(sys.argv) > 3 else "u2net_human_seg"
os.makedirs(sai, exist_ok=True)
arqs = [ent] if os.path.isfile(ent) else [os.path.join(ent, n) for n in sorted(os.listdir(ent)) if n.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
s = new_session(modelo)
for f in arqs:
    im = Image.open(f).convert("RGB")
    out = remove(im, session=s, post_process_mask=True)
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)  # tira a sobra transparente
    dest = os.path.join(sai, os.path.splitext(os.path.basename(f))[0] + ".png")
    out.save(dest)
    print(f"ok {os.path.basename(dest)} {out.size}", flush=True)
