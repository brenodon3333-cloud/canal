"""Renderiza um vídeo longo CAPÍTULO POR CAPÍTULO e junta no fim (+ capítulos do YouTube).

Uso:  python -I -X utf8 render_capitulos.py <pasta_montagem> <capitulos.json> [composicao=Video] [so=N]
capitulos.json: {"total": 1834.2, "capitulos": [{"titulo": "Abertura", "ini": 0}, {"titulo": "Como tudo começou", "ini": 58.4}, ...]}
- Cada capítulo vira out/caps/NN.mp4 (pula os que já existem: dá para retomar ou refazer só um apagando o arquivo dele).
- so=N renderiza só o capítulo N (para mandar à pessoa aprovar enquanto o resto é feito).
- No fim junta tudo em out/video_final.mp4 (vídeo copiado, áudio refeito para não dar estalo na emenda)
  e grava out/capitulos_youtube.txt pronto para colar na descrição.
Por que assim: 30 min renderizam em ~2 h; se algo der errado no minuto 25, refaz só aquele capítulo.
"""
import json, os, subprocess, sys

pasta, cfgp = sys.argv[1], sys.argv[2]
comp = next((a for a in sys.argv[3:] if not a.startswith("so=")), "Video")
so = next((int(a[3:]) for a in sys.argv[3:] if a.startswith("so=")), None)
cfg = json.load(open(cfgp, encoding="utf-8"))
FPS = 30
caps = cfg["capitulos"]
total = cfg["total"]
os.makedirs(os.path.join(pasta, "out", "caps"), exist_ok=True)
npx = "npx.cmd" if os.name == "nt" else "npx"
partes = []
for k, c in enumerate(caps, 1):
    a = round(c["ini"] * FPS)
    b = round((caps[k]["ini"] if k < len(caps) else total) * FPS) - 1
    dest = os.path.join("out", "caps", f"{k:02d}.mp4")
    partes.append(dest)
    if so and k != so:
        continue
    if os.path.exists(os.path.join(pasta, dest)):
        print(f"cap {k:02d} já existe — pulando"); continue
    print(f"cap {k:02d} '{c['titulo']}': quadros {a}-{b} ({(b - a + 1) / FPS:.1f}s)…", flush=True)
    subprocess.run([npx, "remotion", "render", "src/index.ts", comp, dest, f"--frames={a}-{b}", "--concurrency=8", "--crf=19", "--log=error"], cwd=pasta, check=True)

if so:
    print("pronto:", os.path.join(pasta, partes[so - 1])); sys.exit()

lista = os.path.join(pasta, "out", "caps", "lista.txt")
open(lista, "w").write("".join(f"file '{os.path.basename(p)}'\n" for p in partes))
final = os.path.join(pasta, "out", "video_final.mp4")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", final], check=True)

def hms(s):
    s = int(s); h, m, ss = s // 3600, s % 3600 // 60, s % 60
    return f"{h}:{m:02d}:{ss:02d}" if h else f"{m:02d}:{ss:02d}"
txt = "\n".join(f"{hms(c['ini'])} {c['titulo']}" for c in caps)
open(os.path.join(pasta, "out", "capitulos_youtube.txt"), "w", encoding="utf-8").write(txt)
dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", final], capture_output=True, text=True).stdout.strip()
print(f"OK: {final} ({dur}s)\n\nCapítulos para a descrição do YouTube (o primeiro precisa ser 00:00):\n{txt}")
