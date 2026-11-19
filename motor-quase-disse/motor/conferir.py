"""Confere o arquivo exportado (não o que o código pretendia fazer).

  python motor/conferir.py <episodio> <versao> [instantes para extrair quadros...]

Mede: duração e trilhas do mp4; loudness em estéreo e somado em mono;
nível de cada evento numa simulação de alto-falante de celular (mono, 300 Hz–7 kHz)
comparado à voz; e extrai quadros do próprio mp4.
"""
import json, os, re, subprocess, sys
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.path.join(RAIZ, '.tools/bin/ffmpeg')
SR = 48000


def run(args):
    return subprocess.run([FF, '-hide_banner', *args], capture_output=True, text=True).stderr


def lufs(mp4, filtro=''):
    af = (filtro + ',' if filtro else '') + 'ebur128=peak=true'
    s = run(['-i', mp4, '-vn', '-af', af, '-f', 'null', '-'])
    i = re.findall(r'I:\s+(-?[\d.]+) LUFS', s)
    tp = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', s)
    return float(i[-1]), float(tp[-1]) if tp else None


def banda_celular(x):
    # 2ª ordem: passa-alta 300 Hz e passa-baixa 7 kHz (alto-falante pequeno)
    from numpy import pi, tan
    def biq(x, tipo, f, q=0.707):
        w = 2 * pi * f / SR; c = np.cos(w); s = np.sin(w); a = s / (2 * q)
        if tipo == 'lp': b = [(1 - c) / 2, 1 - c, (1 - c) / 2]
        else: b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
        A = [1 + a, -2 * c, 1 - a]
        b = [v / A[0] for v in b]; A = [v / A[0] for v in A]
        y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
        for i, v in enumerate(x):
            o = b[0] * v + b[1] * x1 + b[2] * x2 - A[1] * y1 - A[2] * y2
            x2, x1, y2, y1 = x1, v, y1, o; y[i] = o
        return y
    return biq(biq(biq(x, 'hp', 300), 'hp', 300), 'lp', 7000)


def main():
    ep, ver = sys.argv[1], sys.argv[2]
    inst = [float(v) for v in sys.argv[3:]]
    pasta = os.path.join(RAIZ, 'saida', ep)
    mp4 = os.path.join(pasta, f'{ep}_{ver}.mp4')
    wav = mp4[:-4] + '.wav'
    if not os.path.exists(mp4) or (os.path.exists(wav) and os.path.getmtime(wav) > os.path.getmtime(mp4) + 1):
        mp4 = wav  # só o som foi renderizado de novo: confere o som novo
    rel = []
    info = run(['-i', mp4])
    rel.append('trilhas: ' + ' | '.join(l.strip() for l in info.splitlines() if 'Stream #' in l))
    rel.append('duração: ' + re.search(r'Duration: ([\d:.]+)', info).group(1))
    i_st, tp = lufs(mp4)
    i_mono, _ = lufs(mp4, 'pan=mono|c0=0.5*c0+0.5*c1')
    rel.append(f'loudness integrada: {i_st:.1f} LUFS estéreo · {i_mono:.1f} LUFS somado em mono · pico real {tp} dBTP')

    raw = subprocess.run([FF, '-v', 'error', '-i', mp4, '-vn', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    st = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    L, R = st[:, 0], st[:, 1]
    corr = float(np.corrcoef(L, R)[0, 1])
    rel.append(f'correlação L/R: {corr:.2f} (perto de 1 = seguro em mono; negativo = cancela)')
    mono = (L + R) / 2
    cel = banda_celular(mono)

    def nivel(x, a, b):
        seg = x[int(a * SR):int(b * SR)]
        if len(seg) == 0: return -120
        # nível de pico em janelas de 50 ms (o que o ouvido percebe de um evento curto)
        w = min(int(0.05 * SR), len(seg)); k = max(1, len(seg) // w)
        r = np.sqrt(np.mean(seg[:k * w].reshape(k, w) ** 2, axis=1) + 1e-12)
        return 20 * np.log10(r.max())

    ev = json.load(open(os.path.join(pasta, f'eventos_{ver}.json')))
    vozes = [e for e in ev if e['nome'].startswith('voz')]
    vref = np.mean([nivel(cel, e['t'], e['t'] + e['dur']) for e in vozes])
    rel.append('')
    rel.append(f'celular simulado (mono, 300 Hz–7 kHz): voz = {vref:.1f} dB (referência)')
    rel.append('evento | instante | nível relativo à voz no celular | nível relativo, faixa cheia')
    vfull = np.mean([nivel(mono, e['t'], e['t'] + e['dur']) for e in vozes])
    for e in ev:
        if e['nome'].startswith('voz') or e['dur'] > 5: continue
        a, b = e['t'], e['t'] + min(e['dur'], 0.6)
        sob = any(v['t'] < b and v['t'] + v['dur'] > a for v in vozes)
        rel.append(f"{e['nome'][:58]:58s} | {e['t']:6.2f} s | {nivel(cel, a, b) - vref:+6.1f} dB | {nivel(mono, a, b) - vfull:+6.1f} dB" + (' | sob a voz: medida inclui a fala' if sob else ''))
    # o que se ouve nas pausas da narração (sem eventos)
    rel.append('')
    for a, b, nome in [(0.2, 0.9, 'escuro de abertura'), (4.0, 4.2, 'entre falas'), ]:
        rel.append(f'pausa · {nome} {a}-{b} s: {nivel(cel, a, b) - vref:+.1f} dB no celular')

    for t in inst:
        out = os.path.join(pasta, f'mp4_{ver}_{t:.2f}.png')
        subprocess.run([FF, '-v', 'error', '-y', '-ss', str(t), '-i', mp4, '-frames:v', '1', '-vf', 'scale=960:-2', out])
    texto = '\n'.join(rel)
    open(os.path.join(pasta, f'conferencia_{ver}.txt'), 'w').write(texto + '\n')
    print(texto)


if __name__ == '__main__':
    main()
