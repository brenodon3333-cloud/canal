# Coleta dados públicos da página de cada vídeo (descrição, capítulos, likes, comentários).
# O player pede login neste ambiente, então não há legenda nem imagem do vídeo: só a página.
import json, re, subprocess, sys, time, os
ids = [l.split()[0] for l in open('ids.txt') if l.strip()]
out = {}
def pega(s, chave):
    i = s.find(chave)
    return i
for vid in ids:
    f = f'pag/{vid}.html'
    os.makedirs('pag', exist_ok=True)
    if not os.path.exists(f):
        subprocess.run(['curl', '-s', '-A', 'Mozilla/5.0', '-H', 'Accept-Language: en-US', f'https://www.youtube.com/watch?v={vid}', '-o', f])
        time.sleep(1.0)
    s = open(f, encoding='utf-8', errors='ignore').read()
    d = {}
    m = re.search(r'"attributedDescription":\{"content":"((?:[^"\\]|\\.)*)"', s)
    d['descricao'] = json.loads('"' + m.group(1) + '"') if m else None
    caps = re.findall(r'"chapterRenderer":\{"title":\{"simpleText":"((?:[^"\\]|\\.)*)"\},"timeRangeStartMillis":(\d+)', s)
    vistos = []; 
    for t, ms in caps:
        k = (t, int(ms))
        if k not in vistos: vistos.append(k)
    d['capitulos'] = [(json.loads('"' + t + '"'), ms / 1000) for t, ms in vistos]
    m = re.search(r'"likeCount":"?(\d+)', s) or re.search(r'like this video along with ([\d,]+) other', s)
    d['likes'] = int(m.group(1).replace(',', '')) if m else None
    m = re.search(r'"commentCount":\{"simpleText":"([^"]+)"', s) or re.search(r'"contextualInfo":\{"runs":\[\{"text":"([\d.,KM]+)"', s)
    d['comentarios'] = m.group(1) if m else None
    m = re.search(r'"publishDate":"([^"]+)"', s) or re.search(r'"uploadDate":"([^"]+)"', s)
    d['data'] = m.group(1) if m else None
    m = re.search(r'"keywords":\[([^\]]*)\]', s)
    d['tags'] = json.loads('[' + m.group(1) + ']') if m else []
    out[vid] = d
json.dump(out, open('detalhes.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), 'vídeos;', sum(1 for d in out.values() if d['capitulos']), 'com capítulos;', sum(1 for d in out.values() if d['likes']), 'com likes')
