import json, subprocess, sys, numpy as np
v = sys.argv[1]
mp4 = sys.argv[2] if len(sys.argv) > 2 else f'saida/ep02-porteiro/ep02-porteiro_{v}.mp4'
def dec(af):
    r = subprocess.run(['.tools/bin/ffmpeg','-v','error','-i',mp4,'-vn','-af',af,'-ac','1','-ar','48000','-f','f32le','-'],capture_output=True)
    return np.frombuffer(r.stdout, np.float32)
SR=48000
cel = dec('pan=mono|c0=0.5*c0+0.5*c1,highpass=f=300,lowpass=f=7000')
cheio = dec('pan=mono|c0=0.5*c0+0.5*c1')
def env(x, w):
    n=int(w*SR); k=len(x)//n; return 20*np.log10(np.sqrt((x[:k*n].reshape(k,n)**2).mean(1))+1e-9)
ev = json.load(open(f'saida/ep02-porteiro/eventos_{v}.json'))
e50 = env(cel, 0.05)
def pico(t0, t1): a=max(0,int(t0/0.05)); b=max(a+1,int(t1/0.05)); return e50[a:b].max()
print('celular, pico de 50 ms nos 0,25 s depois do instante (dB FS):')
for nome in ['TEC-TEC (caneta, gancho)','BZZZ da porta (Caio)','LETRAS BATEM NO CHÃO','encaixe (Caio)','letras caem na sacola (abafadas)','TEC-TEC PELA PORTA','página vira','TEC-TEC (o último)','bzzz do interfone, de fora','BZZZ: A LURDES ABRE A PORTA PARA ELE','ENCAIXE FINAL','garfo na marmita de alumínio']:
    e=[x for x in ev if x['nome']==nome]
    if e: t=e[0]['t']; print(f'  {pico(t,t+0.25):6.1f}  fundo {pico(t-0.4,t-0.05):6.1f}  {t:6.2f}  {nome}')
falas=json.load(open('episodios/ep02-porteiro/narracao/tempos.json'))
# maiores picos do episódio no celular
o=np.argsort(e50)[::-1]; vis=[]
for i in o:
    if all(abs(i-j)>8 for j in vis): vis.append(i)
    if len(vis)>=12: break
print('12 maiores picos no celular:', ', '.join(f'{i*0.05:.2f}s {e50[i]:.1f}' for i in sorted(vis)))
# contatos: início do som (maior subida do envelope de 4 ms) perto de cada contato
d = np.abs(np.diff(cheio, prepend=0)); e4 = env(d, 0.004)
print('contatos: desvio do início audível (ms), procurando +-60 ms:')
pior=0
for c in json.load(open(f'saida/ep02-porteiro/contatos_{v}.json')):
    t=c['t']; i=int(t/0.004); best=None
    for j in range(max(6,i-15), i+16): # não olha antes do início do arquivo
        s = e4[j:j+3].mean()-e4[j-6:j].mean()
        if best is None or s>best[0]: best=(s,j)
    dt=(best[1]*0.004-t)*1000; pior=max(pior,abs(dt)) if best[0]>6 else pior
    print(f'  {t:7.3f} {dt:+5.0f} ms  subida {best[0]:4.1f} dB  {c["nome"]}')
print('pior desvio (subidas > 6 dB):', round(pior), 'ms')
