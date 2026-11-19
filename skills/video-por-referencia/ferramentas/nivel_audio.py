"""Confere o volume de cada áudio de uma pasta e aponta os que vieram mudos.

Uso:  python -I -X utf8 nivel_audio.py <pasta> [--normalizar]
Pico < -30 dB  -> provavelmente veio quase mudo: gere de novo.
Pico entre -30 e -8 dB com --normalizar -> sobe o ganho até pico ~ -3 dB.
"""
import glob, os, re, subprocess, sys

pasta = sys.argv[1]
norm = "--normalizar" in sys.argv
for f in sorted(glob.glob(os.path.join(pasta, "*.mp3")) + glob.glob(os.path.join(pasta, "*.wav"))):
    log = subprocess.run(["ffmpeg", "-nostats", "-i", f, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    pk = float(re.search(r"max_volume: (-?[0-9.]+)", log).group(1))
    mv = float(re.search(r"mean_volume: (-?[0-9.]+)", log).group(1))
    status = "MUDO — gerar de novo" if pk < -30 else ("baixo" if pk < -8 else "ok")
    if norm and -30 <= pk < -8:
        tmp = f + ".tmp" + os.path.splitext(f)[1]
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-af", f"volume={-3 - pk:.1f}dB", tmp], check=True)
        os.replace(tmp, f); status = f"normalizado (+{-3 - pk:.1f} dB)"
    print(f"{os.path.basename(f):45s} pico {pk:6.1f} dB  média {mv:6.1f} dB  {status}")
