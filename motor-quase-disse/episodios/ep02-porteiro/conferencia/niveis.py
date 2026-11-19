# Pico no celular simulado; marca os eventos que caem sob a narração (ali o pico inclui a voz).
# Pico no celular simulado (50 ms) nos 0,25 s depois de cada evento com nome, do mais alto ao mais baixo.
# Uso (da raiz do canal): .venv/bin/python episodios/ep02-porteiro/conferencia/niveis.py v1 [wav|mp4]
import json, subprocess, sys, numpy as np
v = sys.argv[1]; d = 'saida/ep02-porteiro/'
src = sys.argv[2] if len(sys.argv) > 2 else f'{d}ep02-porteiro_{v}.wav'
r = subprocess.run(['.tools/bin/ffmpeg','-v','error','-i',src,'-vn','-af','pan=mono|c0=0.5*c0+0.5*c1,highpass=f=300,lowpass=f=7000','-ar','48000','-f','f32le','-'],capture_output=True)
x = np.frombuffer(r.stdout, np.float32); SR = 48000; n = int(0.05*SR); k = len(x)//n
e = 20*np.log10(np.sqrt((x[:k*n].reshape(k,n)**2).mean(1))+1e-9)

ev = json.load(open(f'{d}eventos_{v}.json'))
voz = [{'ini': o['t'], 'fim': o['t'] + o['dur']} for o in ev if o['nome'].startswith('voz')]
sob = lambda t: any(f['ini'] - 0.3 < t < f['fim'] + 0.5 for f in voz)
lin = []
for o in ev:
    if o['nome'].startswith('voz'): continue
    a = int(o['t']/0.05); lin.append((e[a:a+5].max(), o['t'], o['nome']))
for p, t, nm in sorted(lin, reverse=True): print(f'{p:6.1f}  {t:7.2f}  {nm}' + ('   (sob a narração)' if sob(t) else ''))
