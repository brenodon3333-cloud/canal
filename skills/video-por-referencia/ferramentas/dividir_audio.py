"""Divide UMA narração (o áudio que a pessoa trouxe) em blocos por capítulo, cortando no silêncio.

Uso:  python -I -X utf8 dividir_audio.py <audio> <palavras.json> <pasta_saida> "<frase inicial bloco 2>" "<frase inicial bloco 3>" ...
Ex.:  ... narracao.mp3 narracao_palavras.json blocos "Atlanta" "Dois anos depois" "Mil novecentos e quarenta" "Anos oitenta" "Hoje"
Procura a 1ª ocorrência de cada frase (em ordem) nas palavras transcritas e corta no meio da pausa antes dela.
Saída: 01.wav, 02.wav ... + blocos.json (início/fim de cada bloco no áudio original).
Por que dividir: assim dá para encaixar vinhetas de 1 s entre capítulos sem cortar a voz no meio.
"""
import json, os, re, subprocess, sys, unicodedata

audio, pal, out = sys.argv[1], sys.argv[2], sys.argv[3]
frases = sys.argv[4:]
os.makedirs(out, exist_ok=True)
ws = json.load(open(pal, encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9 ]", "", unicodedata.normalize("NFKD", s.lower()).encode("ascii", "ignore").decode())
toks = [norm(w["w"]) for w in ws]
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio], capture_output=True, text=True).stdout)

cortes, pos = [], 0
for fr in frases:
    alvo = norm(fr).split()
    achou = None
    for i in range(pos, len(toks) - len(alvo) + 1):
        if toks[i:i + len(alvo)] == alvo:
            achou = i; break
    if achou is None:
        sys.exit(f"Não achei a frase '{fr}' depois da palavra {pos}. Confira a transcrição.")
    meio = (ws[achou - 1]["fim"] + ws[achou]["ini"]) / 2 if achou > 0 else ws[achou]["ini"]
    cortes.append(round(meio, 3)); pos = achou + 1
lim = [0.0] + cortes + [dur]
blocos = []
for k in range(len(lim) - 1):
    a, b = lim[k], lim[k + 1]
    f = os.path.join(out, f"{k + 1:02d}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", audio, "-ss", str(a), "-to", str(b), "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                    "-ar", "44100", f], check=True)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
    blocos.append({"arquivo": f, "ini_original": a, "fim_original": b, "duracao": round(d, 3)})
    print(f"bloco {k + 1:02d}: {a:7.2f}–{b:7.2f}s  ->  {d:.2f}s")
json.dump(blocos, open(os.path.join(out, "blocos.json"), "w", encoding="utf-8"), indent=1)
print(f"total de fala: {sum(x['duracao'] for x in blocos):.1f}s")
