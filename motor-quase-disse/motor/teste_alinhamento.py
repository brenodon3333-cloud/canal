"""Mede o erro do alinhamento em fala contínua, contra uma referência exata.
Piper sintetiza cada fala e informa quantas amostras dura cada fonema; o início de cada palavra
é conhecido com resolução de ~12 ms. As falas são juntadas com pausas curtas e codificadas em AAC
(como um áudio de celular), e passam pelo mesmo motor/voz.py usado na gravação real.
  python motor/teste_alinhamento.py <episodio> [-v]
"""
import json, os, subprocess, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import voz
from piper import PiperVoice, SynthesisConfig

ep = sys.argv[1]
R = voz.RAIZ
falas = json.load(open(os.path.join(R, 'episodios', ep, 'falas.json')))
tmp = os.path.join(R, '.tools/teste_alinh'); os.makedirs(tmp, exist_ok=True)
nar = os.path.join(R, 'episodios', ep, 'narracao')


def montar(modelo, lentidao, pausa):
    v = PiperVoice.load(os.path.join(R, '.tools/voz', modelo), include_alignments=True)
    sr = v.config.sample_rate
    partes, verdade, t = [np.zeros(int(0.7 * sr), np.int16)], [], 0.7
    for f in falas:
        pal = f['texto'].split()
        # fronteira entre palavras: o "espaço" de Piper tem som (é transição, não silêncio);
        # a referência é o meio dele. Depois do "^" inicial (silencioso), é o fim dele.
        audio, inicios, n, marca = [], [], 0, None
        for ch in v.synthesize(f['texto'], syn_config=SynthesisConfig(length_scale=lentidao), include_alignments=True):
            for a in ch.phoneme_alignments:
                k = int(a.num_samples)
                if a.phoneme == '^':
                    marca = n + k
                elif a.phoneme == ' ':
                    marca = n + k // 2
                elif marca is not None and a.phoneme not in ('.', ',', '$', '_'):
                    inicios.append(marca); marca = None
                n += k
            audio.append(ch.audio_int16_array)
        assert len(inicios) == len(pal), (inicios, pal)
        verdade += [(f['id'], p, t + s / sr) for p, s in zip(pal, inicios)]
        x = np.concatenate(audio)
        partes += [x, np.zeros(int(pausa * sr), np.int16)]
        t += len(x) / sr + pausa
    y = np.concatenate(partes)
    w0 = os.path.join(tmp, 'frase.wav')
    with wave.open(w0, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(y.tobytes())
    if FORMATO == 'wav':
        return w0, verdade
    m4a = os.path.join(tmp, 'frase.m4a')
    subprocess.run([voz.FF, '-v', 'error', '-y', '-i', w0, '-c:a', 'aac', '-b:a', '96k', m4a], check=True)
    return m4a, verdade


FORMATO = 'wav' if '--wav' in sys.argv else 'm4a'


def medir(arq, verdade, modo):
    voz.CORRECAO_WHISPER = 0.0 if modo == 'cru' else 0.068
    if modo == 'encaixe': os.environ['VOZ_ENCAIXE'] = '1'
    else: os.environ.pop('VOZ_ENCAIXE', None)
    import io, contextlib
    with contextlib.redirect_stdout(io.StringIO()):
        voz.alinhar(ep, arq)
    tj = json.load(open(os.path.join(nar, 'tempos.json')))
    # AAC acrescenta atraso no começo do arquivo; mede com o mesmo deslocamento para todas as palavras
    est = [p['ini'] for l in tj['linhas'].values() for p in l['palavras']]
    real = [v[2] for v in verdade]
    off = 0.0  # erro absoluto: sem compensar nada
    primeiras = {sum(len(f['texto'].split()) for f in falas[:i]) for i in range(len(falas))}
    vies = np.median([e - r for k, (e, r) in enumerate(zip(est, real)) if k not in primeiras])
    print(f'    viés das palavras internas (medido − real): {1000*vies:+.0f} ms')
    err, linhas = [], []
    for k, (e, r, v) in enumerate(zip(est, real, verdade)):
        d = e - r - off
        err.append(abs(d))
        linhas.append(f'{v[1]:14s} real {r:6.3f}  medido {e - off:6.3f}  erro {1000*d:+5.0f} ms')
    return np.array(err), off, linhas


bk = {n: open(os.path.join(nar, n), 'rb').read() for n in ('tempos.json', 'voz48k.wav', 'relatorio.txt')}
try:
    for modelo, lent, pausa in [('pt_BR-cadu-medium.onnx', 1.0, 0.4), ('pt_BR-faber-medium.onnx', 1.25, 0.6), ('pt_BR-cadu-medium.onnx', 1.4, 1.5)]:
        arq, verdade = montar(modelo, lent, pausa)
        print(f'\n{modelo} · lentidão {lent} · pausas de {pausa} s')
        for nome, sem in [('Whisper cru     ', 'cru'), ('encaixe Bovonel ', 'encaixe'), ('Whisper corrigido', 'corrigido')]:
            e, off, linhas = medir(arq, verdade, sem)
            print(f'  {nome}: média {1000*e.mean():4.0f} ms · mediana {1000*np.median(e):4.0f} ms · máx {1000*e.max():4.0f} ms · '
                  f'até 33 ms: {np.mean(e <= 0.033):4.0%} · até 50 ms: {np.mean(e <= 0.05):4.0%}  (atraso do arquivo {1000*off:.0f} ms)')
            if '-v' in sys.argv: print('    ' + '\n    '.join(linhas))
finally:
    for n, b in bk.items(): open(os.path.join(nar, n), 'wb').write(b)
