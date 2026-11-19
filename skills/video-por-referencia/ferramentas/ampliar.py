"""Aumenta a resolução de fotos pequenas com o Real-ESRGAN (versão ncnn, roda até em placa de vídeo integrada via Vulkan).

Uso:  python -I -X utf8 ampliar.py <imagem_ou_pasta> <pasta_saida> [min_lado=1400] [escala=4]
Só amplia imagens cujo MENOR lado é < min_lado; as outras são copiadas. ~15 s por foto.
Atenção: em rosto pode deixar a pele "encerada". Ótimo para documentos, anúncios, ruas e fundos;
em retrato, compare com o original antes de usar.

Onde o programa procura o executável realesrgan-ncnn-vulkan (nesta ordem):
  1. variável de ambiente REALESRGAN (caminho completo do executável)
  2. config_local.json nesta pasta: {"realesrgan": "C:/caminho/realesrgan-ncnn-vulkan.exe"}
  3. o PATH do sistema
  4. a pasta ferramentas/realesrgan/ dentro da skill
Download grátis (escolha o zip do seu sistema e descompacte em ferramentas/realesrgan/):
  https://github.com/xinntao/Real-ESRGAN/releases  ->  realesrgan-ncnn-vulkan-<versão>-<windows|macos|ubuntu>.zip
"""
import json, os, shutil, subprocess, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
NOMES = ["realesrgan-ncnn-vulkan.exe", "realesrgan-ncnn-vulkan"]

def achar_exe():
    if os.environ.get("REALESRGAN") and os.path.exists(os.environ["REALESRGAN"]):
        return os.environ["REALESRGAN"]
    cfg = os.path.join(AQUI, "config_local.json")
    if os.path.exists(cfg):
        p = json.load(open(cfg, encoding="utf-8")).get("realesrgan")
        if p and os.path.exists(p):
            return p
    for n in NOMES:
        if shutil.which(n):
            return shutil.which(n)
        p = os.path.join(AQUI, "realesrgan", n)
        if os.path.exists(p):
            return p
    sys.exit("Real-ESRGAN não encontrado. Baixe em https://github.com/xinntao/Real-ESRGAN/releases e descompacte em "
             f"{os.path.join(AQUI, 'realesrgan')} (ou veja as outras opções no topo deste arquivo).")

EXE = achar_exe()
ent, sai = sys.argv[1], sys.argv[2]
minlado = int(sys.argv[3]) if len(sys.argv) > 3 else 1400
esc = sys.argv[4] if len(sys.argv) > 4 else "4"
os.makedirs(sai, exist_ok=True)
arqs = [ent] if os.path.isfile(ent) else [os.path.join(ent, n) for n in sorted(os.listdir(ent)) if n.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
for f in arqs:
    im = Image.open(f)
    base = os.path.splitext(os.path.basename(f))[0]
    if min(im.size) >= minlado:
        shutil.copy(f, os.path.join(sai, os.path.basename(f)))
        print(f"copiada  {base} {im.size}"); continue
    tmp_in = f
    if im.mode not in ("RGB", "RGBA"):  # o executável não lê alguns PNG em paleta/escala de cinza
        tmp_in = os.path.join(sai, base + "_rgb_tmp.png"); im.convert("RGB").save(tmp_in)
    dest = os.path.join(sai, base + ".png")
    subprocess.run([EXE, "-i", os.path.abspath(tmp_in), "-o", os.path.abspath(dest), "-n", "realesrgan-x4plus", "-s", esc],
                   cwd=os.path.dirname(EXE), check=True, capture_output=True)
    if tmp_in != f:
        os.remove(tmp_in)
    print(f"ampliada {base} {im.size} -> {Image.open(dest).size}", flush=True)
