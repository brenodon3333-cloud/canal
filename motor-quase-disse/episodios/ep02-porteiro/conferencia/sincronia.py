# Sincronia no mp4: para cada contato, a subida de energia (envelope de 4 ms) mais próxima entre as fortes da vizinhança.
# Em grupos de contatos colados (letras caindo a cada 50 ms), escolher a maior subida pega a do vizinho; aqui vale a mais próxima
# entre as que têm pelo menos 6 dB e 60% da maior. Contatos sem subida clara (sob a voz ou sons macios) ficam listados à parte.
# Uso (da raiz): .venv/bin/python episodios/ep02-porteiro/conferencia/sincronia.py v2
import json, subprocess, sys, numpy as np
v = sys.argv[1]; d = 'saida/ep02-porteiro/'
r = subprocess.run(['.tools/bin/ffmpeg','-v','error','-i',f'{d}ep02-porteiro_{v}.mp4','-vn','-ac','1','-ar','48000','-f','f32le','-'],capture_output=True)
x = np.frombuffer(r.stdout, np.float32); SR = 48000; n = int(0.004*SR)
dx = np.abs(np.diff(x, prepend=0)); k = len(dx)//n
e4 = 20*np.log10(np.sqrt((dx[:k*n].reshape(k,n)**2).mean(1))+1e-9)
ruins, desv = [], []
for c in json.load(open(f'{d}contatos_{v}.json')):
    t = c['t']; i = int(round(t/0.004)); sub = []
    for j in range(max(6, i-15), min(len(e4)-3, i+16)):
        s = e4[j:j+3].mean() - e4[j-6:j].mean()
        if s > e4[j-1:j+2].mean() - e4[j-7:j-1].mean() and s >= (e4[j+1:j+4].mean() - e4[j-5:j+1].mean()): sub.append((s, j))
    if not sub: ruins.append((t, c['nome'], 0)); continue
    mx = max(s for s, _ in sub); fortes = [(abs(j*0.004 - t), j, s) for s, j in sub if s >= 6 and s >= 0.6*mx]
    if not fortes: ruins.append((t, c['nome'], mx)); continue
    dist, j, s = min(fortes); dt = (j*0.004 - t)*1000; desv.append((abs(dt), dt, t, c['nome'], s))
desv.sort(reverse=True)
print(f'contatos com subida clara: {len(desv)} · pior desvio {desv[0][0]:.0f} ms · acima de 42 ms: {sum(1 for x in desv if x[0] > 42)}')
for a, dt, t, nm, s in desv[:12]: print(f'  {t:8.3f} {dt:+5.0f} ms  subida {s:4.1f} dB  {nm}')
print(f'sem subida clara ({len(ruins)}):', '; '.join(f'{t:.2f} {nm}' for t, nm, _ in ruins))
