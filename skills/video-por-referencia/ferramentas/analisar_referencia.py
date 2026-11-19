"""Perícia do vídeo de referência: dados técnicos, cortes, ritmo e folhas de contato.

Uso:  python -I -X utf8 analisar_referencia.py <video> <pasta_saida> [intro_seg=60] [passo_corpo_seg=auto]
Gera na pasta:
  ficha.txt                  — resolução, fps, duração, nº de cortes, duração mediana do plano, ritmo por trecho
  cortes.txt                 — tempo de cada corte seco
  folhas/intro_*.jpg         — 1 quadro por segundo da abertura (6x5 por folha), tempo carimbado
  folhas/corpo_*.jpg         — o vídeo inteiro em quadros espaçados (8x6 por folha)
Depois: rode transcrever.py no mesmo vídeo para pegar a fala e as palavras/min.
"""
import json, os, re, statistics, subprocess, sys

video, out = sys.argv[1], sys.argv[2]
intro = float(sys.argv[3]) if len(sys.argv) > 3 else 60
os.makedirs(os.path.join(out, "folhas"), exist_ok=True)
def _fonte():
    # o drawtext do ffmpeg precisa de um arquivo de fonte; procura um Arial/DejaVu conforme o sistema
    for c in ["C:/Windows/Fonts/arial.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/TTF/DejaVuSans.ttf"]:
        if os.path.exists(c):
            return "fontfile='" + c.replace(":", "\\:") + "'"
    return "font=Arial"
FONT = _fonte()

pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate",
                                "-of", "json", video], capture_output=True, text=True).stdout)
dur = float(pr["format"]["duration"])
vs = next(s for s in pr["streams"] if s["codec_type"] == "video")
w, h = vs["width"], vs["height"]
num, den = map(int, vs["r_frame_rate"].split("/"))
fps = num / den
vertical = h > w
passo = float(sys.argv[4]) if len(sys.argv) > 4 else (2 if dur < 90 else 6)

# cortes secos (o filtro showinfo só imprime com -v info)
log = subprocess.run(["ffmpeg", "-v", "info", "-nostats", "-i", video, "-an", "-vf", "scale=160:-1,select='gt(scene,0.28)',showinfo", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
cuts = [float(x) for x in re.findall(r"pts_time:([0-9.]+)", log)]
open(os.path.join(out, "cortes.txt"), "w").write("\n".join(f"{c:.2f}" for c in cuts))
planos = [b - a for a, b in zip([0] + cuts, cuts + [dur])]

ficha = [f"arquivo: {video}", f"resolucao: {w}x{h} ({'vertical' if vertical else 'horizontal'})  fps: {fps:.3f}  duracao: {dur:.1f}s",
         f"cortes secos: {len(cuts)}  planos: {len(planos)}  mediana do plano: {statistics.median(planos):.2f}s  media: {statistics.mean(planos):.2f}s",
         f"cortes na abertura (0-{intro:.0f}s): {len([c for c in cuts if c < intro])}  (se for ~0, a abertura é motion contínuo)", "ritmo por trecho:"]
janela = 10 if dur < 120 else 180
t = 0.0
while t < dur:
    n = len([c for c in cuts if t <= c < t + janela])
    ficha.append(f"  {t:6.0f}-{min(dur, t + janela):6.0f}s: {n:3d} cortes ({janela / max(n, 1):.1f}s/plano)")
    t += janela
open(os.path.join(out, "ficha.txt"), "w", encoding="utf-8").write("\n".join(ficha))
print("\n".join(ficha))

# folhas de contato
tw = 240 if vertical else 320
subprocess.run(["ffmpeg", "-v", "error", "-y", "-t", str(min(intro, dur)), "-i", video, "-vf",
                f"fps=1,scale={tw}:-1,drawtext={FONT}:text='%{{pts\\:hms}}':x=4:y=4:fontsize=14:fontcolor=yellow:box=1:boxcolor=black,tile=6x5",
                os.path.join(out, "folhas", "intro_%02d.jpg")], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf",
                f"fps=1/{passo},scale={tw}:-1,drawtext={FONT}:text='%{{pts\\:hms}}':x=3:y=3:fontsize=12:fontcolor=yellow:box=1:boxcolor=black,tile=8x6",
                os.path.join(out, "folhas", "corpo_%02d.jpg")], check=True)
print("folhas:", sorted(os.listdir(os.path.join(out, "folhas"))))
