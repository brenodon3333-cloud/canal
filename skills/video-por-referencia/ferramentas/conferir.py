"""Folhas de conferência de um render: 1 quadro por segundo, tempo carimbado, 30 por folha.

Uso:  python -I -X utf8 conferir.py <video.mp4> <pasta_saida>
Também mede o volume (LUFS integrado) da mixagem.
"""
import glob, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

video, outdir = sys.argv[1], sys.argv[2]
tmp = os.path.join(outdir, "_q")
os.makedirs(tmp, exist_ok=True)
for f in glob.glob(os.path.join(tmp, "*.jpg")):
    os.remove(f)
w, h = map(int, re.findall(r"\d+", subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", video],
                                capture_output=True, text=True).stdout)[:2])
tw = 216 if h > w else 384
th = round(tw * h / w)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "0.5", "-i", video, "-vf", f"fps=1,scale={tw}:{th}", os.path.join(tmp, "q_%04d.jpg")], check=True)
fs = sorted(glob.glob(os.path.join(tmp, "q_*.jpg")))
font = None
for c in ["C:/Windows/Fonts/arialbd.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
    if os.path.exists(c):
        font = ImageFont.truetype(c, 22); break
font = font or ImageFont.load_default()
cols, rows = (10, 3) if h > w else (6, 5)
per = cols * rows
for s in range(0, len(fs), per):
    sheet = Image.new("RGB", (tw * cols, th * rows), "gray")
    d = ImageDraw.Draw(sheet)
    for k, f in enumerate(fs[s:s + per]):
        x, y = (k % cols) * tw, (k // cols) * th
        sheet.paste(Image.open(f), (x, y))
        t = s + k + 0.5
        d.rectangle([x, y, x + 86, y + 28], fill="black")
        d.text((x + 4, y + 2), f"{int(t // 60)}:{t % 60:04.1f}", fill="yellow", font=font)
    sheet.save(os.path.join(outdir, f"folha_{s // per + 1:02d}.jpg"), quality=82)
log = subprocess.run(["ffmpeg", "-nostats", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = re.findall(r"I:\s+(-?[0-9.]+) LUFS", log)
print(f"{len(fs)} quadros em {len(range(0, len(fs), per))} folhas; volume integrado: {lufs[-1] if lufs else '?'} LUFS (alvo -14 a -16)")
