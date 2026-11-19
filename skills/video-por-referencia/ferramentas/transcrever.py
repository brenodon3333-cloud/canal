"""Transcreve um áudio/vídeo com tempo de cada palavra (faster-whisper, CPU).

Uso:  python -I -X utf8 transcrever.py <arquivo> <pasta_saida> [modelo=small] [idioma=pt|auto]
Saídas na pasta: <nome>.txt (frases com tempo), <nome>_palavras.json, <nome>.srt

Obs.: em algumas instalações o faster-whisper falha ao abrir arquivo direto (erro "metadata_errors" do pacote av),
por isso o áudio é decodificado pelo ffmpeg e passado como array — funciona em qualquer sistema.
"""
import json, os, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

src, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "small"
lang = sys.argv[4] if len(sys.argv) > 4 else "pt"
os.makedirs(out, exist_ok=True)
name = os.path.splitext(os.path.basename(src))[0]

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(raw, np.int16).astype(np.float32) / 32768

m = WhisperModel(model, device="cpu", compute_type="int8", cpu_threads=max(4, (os.cpu_count() or 8) - 4))
segs, info = m.transcribe(audio, language=None if lang == "auto" else lang, vad_filter=True, word_timestamps=True)

def ts(t):
    h, mi, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h:02d}:{mi:02d}:{int(s):02d},{int((s % 1) * 1000):03d}"

words, lines, srt = [], [], []
for i, s in enumerate(segs, 1):
    lines.append(f"[{s.start:7.1f}-{s.end:7.1f}] {s.text.strip()}")
    srt.append(f"{i}\n{ts(s.start)} --> {ts(s.end)}\n{s.text.strip()}\n")
    for w in (s.words or []):
        words.append({"w": w.word.strip(), "ini": round(w.start, 3), "fim": round(w.end, 3)})
    print(lines[-1], flush=True)

open(os.path.join(out, name + ".txt"), "w", encoding="utf-8").write(f"# idioma={info.language} duracao={len(audio)/16000:.1f}s\n" + "\n".join(lines))
open(os.path.join(out, name + ".srt"), "w", encoding="utf-8").write("\n".join(srt))
json.dump(words, open(os.path.join(out, name + "_palavras.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
dur = len(audio) / 16000
print(f"\nOK: {len(words)} palavras, {dur:.1f}s, {len(words) / dur * 60:.0f} palavras/min, idioma={info.language}")
