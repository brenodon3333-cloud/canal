"""Voz do episódio.

  python motor/voz.py guia    <episodio>            gera a voz-guia local (Piper) e alinha
  python motor/voz.py alinhar <episodio> <arquivo>  alinha a gravação real (qualquer formato)

Saídas em episodios/<ep>/narracao/:
  voz48k.wav   a fala usada na mixagem (48 kHz, mono)
  tempos.json  início/fim de cada fala e de cada palavra, em segundos no arquivo
  relatorio.txt  o que o reconhecedor ouviu e quanto bateu com o texto
"""
import difflib, json, os, re, subprocess, sys, unicodedata, wave
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.path.join(RAIZ, '.tools/bin/ffmpeg')
SR = 48000
# atraso aplicado às palavras internas; medido em 3 vozes x 3 ritmos (viés de −60 a −75 ms)
CORRECAO_WHISPER = float(os.environ.get('VOZ_CORRECAO', '0.068'))


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)


def ler_wav(caminho):
    with wave.open(caminho) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x


def para_48k(origem, destino):
    # filtro leve: corta ronco abaixo de 70 Hz; mantém o resto como foi gravado
    subprocess.run([FF, '-y', '-v', 'error', '-i', origem, '-ac', '1', '-ar', str(SR),
                    '-af', 'highpass=f=70', '-c:a', 'pcm_s16le', destino], check=True)


def transcrever(caminho):
    os.environ.setdefault('HF_HOME', os.path.join(RAIZ, '.tools/hf'))
    from faster_whisper import WhisperModel
    m = WhisperModel('small', device='cpu', compute_type='int8')
    segs, _ = m.transcribe(caminho, language='pt', word_timestamps=True, vad_filter=False)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]


def envelope(x, passo=240):
    """RMS a cada 5 ms exatos (240 amostras a 48 kHz)."""
    n = len(x) // passo
    return np.sqrt(np.mean(x[: n * passo].reshape(n, passo) ** 2, axis=1) + 1e-12), passo / SR


def encaixar(rms, step, t):
    """Técnica do Bovonel (tools/alinhar.mjs): leva o início da palavra para a subida de energia
    mais forte (> 6 dB) a até 140 ms, com penalidade pela distância; sem subida clara,
    para o vale de energia mais próximo a até 90 ms."""
    def em(tt):
        return rms[max(0, min(len(rms) - 1, int(round(tt / step))))]
    def media(a, k=6):
        return sum(em(a + i * step) for i in range(k)) / k
    db = lambda v: 20 * np.log10(max(v, 1e-6))
    melhor = None
    d = -0.14
    while d <= 0.14:
        sobe = db(media(t + d)) - db(media(t + d - 6 * step))
        nota = sobe - 30 * abs(d)
        if sobe > 6 and (melhor is None or nota > melhor[0]):
            melhor = (nota, t + d)
        d += step
    if melhor:
        return melhor[1]
    bt, bv, d = t, float('inf'), -0.09
    while d <= 0.09:
        v = em(t + d) * (1 + 3 * abs(d))
        if v < bv:
            bv, bt = v, t + d
        d += step
    return bt


def refinar(x, ini, fim):
    """Ajusta as bordas pela energia: inclui o ataque da primeira sílaba e a cauda da última."""
    hop = int(0.01 * SR)
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    lim = db.max() - 42
    a = int(ini / 0.01)
    fim_i = min(int(fim / 0.01), n - 1)
    while a < fim_i and db[a] < lim:  # o reconhecedor às vezes começa a palavra no silêncio
        a += 1
    while fim_i > a and db[fim_i] < lim:
        fim_i -= 1
    fim = fim_i * 0.01
    for _ in range(25):  # até 250 ms antes
        if a <= 0 or db[a - 1] < lim:
            break
        a -= 1
    b = min(int(fim / 0.01), n - 1)
    for _ in range(40):  # até 400 ms depois
        if b >= n - 1 or db[b + 1] < lim:
            break
        b += 1
    return max(0.0, a * 0.01 - 0.04), min(len(x) / SR, b * 0.01 + 0.08)


def alinhar(ep, origem):
    pasta = os.path.join(RAIZ, 'episodios', ep)
    falas = json.load(open(os.path.join(pasta, 'falas.json')))
    nar = os.path.join(pasta, 'narracao')
    os.makedirs(nar, exist_ok=True)
    v48 = os.path.join(nar, 'voz48k.wav')
    para_48k(origem, v48)
    x = ler_wav(v48)

    ouvido = transcrever(v48)
    roteiro = []  # (id_fala, palavra)
    for f in falas:
        for p in f['texto'].split():
            if norm(p):
                roteiro.append((f['id'], p))
    a = [norm(p) for _, p in roteiro]
    b = [norm(w) for w, _, _ in ouvido]
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    tempo = [None] * len(a)
    casados = [False] * len(a)
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == 'equal':
            for k in range(a1 - a0):
                _, s, e = ouvido[b0 + k]
                tempo[a0 + k] = (s, e); casados[a0 + k] = True
        elif op == 'replace':
            # palavra ouvida diferente ("Bia" -> "vive"): usa o tempo da palavra ouvida na mesma posição
            na, nb = a1 - a0, b1 - b0
            for k in range(na):
                j = b0 + min(nb - 1, int(k * nb / na))
                _, s, e = ouvido[j]
                tempo[a0 + k] = (s, e); casados[a0 + k] = True
    casou = sum(1 for op, a0, a1, _, _ in sm.get_opcodes() if op == 'equal' for _ in range(a1 - a0))
    rms, step = envelope(x)
    deslocs = []
    # palavras não reconhecidas: interpola entre vizinhas reconhecidas
    for i in range(len(tempo)):
        if tempo[i] is None:
            prev = next((tempo[j] for j in range(i - 1, -1, -1) if tempo[j]), None)
            nxt = next((tempo[j] for j in range(i + 1, len(tempo)) if tempo[j]), None)
            s = prev[1] if prev else (nxt[0] - 0.3 if nxt else 0)
            e = nxt[0] if nxt else s + 0.3
            tempo[i] = (s, max(s + 0.05, e))

    saida = {'arquivo': 'voz48k.wav', 'origem': os.path.basename(origem), 'linhas': {}}
    for f in falas:
        idx = [i for i, (fid, _) in enumerate(roteiro) if fid == f['id']]
        ini, fim = refinar(x, tempo[idx[0]][0], tempo[idx[-1]][1])
        ant = None
        for j, i in enumerate(idx):  # palavras ficam dentro das bordas medidas pela energia
            s, e = tempo[i]
            s0 = s
            if j > 0 and casados[i]:
                if os.environ.get('VOZ_ENCAIXE'):  # técnica do Bovonel; piorou em fala contínua (ver DECISOES.md)
                    s = encaixar(rms, step, s)
                else:  # o Whisper marca o início das palavras internas cedo demais (medido em motor/teste_alinhamento.py)
                    s += CORRECAO_WHISPER
            s = min(max(s, ini + 0.04), fim)
            if ant is not None:
                s = max(s, ant + 0.04)  # ordem garantida, como no Bovonel
            ant = s
            deslocs.append(abs(s - s0))
            tempo[i] = (s, max(s + 0.04, min(e, fim)))
        saida['linhas'][f['id']] = {
            'ini': round(ini, 3), 'fim': round(fim, 3),
            'palavras': [{'p': roteiro[i][1], 'ini': round(tempo[i][0], 3), 'fim': round(tempo[i][1], 3)} for i in idx],
        }
    json.dump(saida, open(os.path.join(nar, 'tempos.json'), 'w'), ensure_ascii=False, indent=1)

    taxa = casou / max(1, len(a))
    rel = [f'origem: {origem}', f'duração: {len(x)/SR:.2f} s',
           f'palavras do texto reconhecidas: {casou}/{len(a)} ({taxa:.0%})',
           'ouvido: ' + ' '.join(w for w, _, _ in ouvido),
           f'ajuste dos inícios (correção do Whisper de {1000*CORRECAO_WHISPER:.0f} ms e bordas por energia): médio {1000*np.mean(deslocs):.0f} ms, máximo {1000*max(deslocs):.0f} ms']
    for fid, l in saida['linhas'].items():
        rel.append(f"{fid}: {l['ini']:.2f}–{l['fim']:.2f} s")
    if taxa < 0.7:
        rel.append('ATENÇÃO: o texto lido difere bastante do roteiro; conferir os disparos por palavra.')
    open(os.path.join(nar, 'relatorio.txt'), 'w').write('\n'.join(rel) + '\n')
    print('\n'.join(rel))


def guia(ep):
    pasta = os.path.join(RAIZ, 'episodios', ep)
    falas = json.load(open(os.path.join(pasta, 'falas.json')))
    tmp = os.path.join(pasta, 'narracao', '_guia')
    os.makedirs(tmp, exist_ok=True)
    modelo = os.path.join(RAIZ, '.tools/voz/pt_BR-faber-medium.onnx')
    pedacos = []
    for f in falas:
        out = os.path.join(tmp, f['id'] + '.wav')
        subprocess.run([os.path.join(RAIZ, '.venv/bin/piper'), '-m', modelo, '-f', out,
                        '--length-scale', str(f.get('guia_lentidao', 1.08))],
                       input=f['texto'].encode(), check=True, capture_output=True)
        o48 = out.replace('.wav', '_48.wav')
        para_48k(out, o48)
        pedacos.append(ler_wav(o48))
    pausa = np.zeros(int(1.6 * SR), np.float32)
    tudo = np.concatenate([np.concatenate([pausa, p]) for p in pedacos] + [pausa])
    destino = os.path.join(tmp, 'guia_completa.wav')
    with wave.open(destino, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(tudo, -1, 1) * 32767).astype(np.int16).tobytes())
    # a guia passa pelo mesmo alinhamento que a gravação real vai passar
    alinhar(ep, destino)


if __name__ == '__main__':
    cmd, ep = sys.argv[1], sys.argv[2]
    if cmd == 'guia':
        guia(ep)
    elif cmd == 'alinhar':
        alinhar(ep, sys.argv[3])
    else:
        sys.exit(__doc__)
