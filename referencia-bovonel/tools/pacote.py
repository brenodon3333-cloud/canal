#!/usr/bin/env python3
"""Monta PACOTE_MESTRE_DO_CANAL.zip na raiz do repositório.

Uso (da raiz):  python3 tools/pacote.py

Leva tudo o que é leve e necessário para continuar o canal em outra conta:
arquivo mestre, regras, catálogo, ideias, ferramentas, artes do canal e, em cada
vídeo, textos, código da animação, narração e sincronia, thumbnails e QA.
Deixa de fora vídeos (.mov/.mp4), áudio final (.wav), imagens de revisão
(folhas/, preview/, cenas/) e o teste do CapCut. Para avisar se passar de 95 MB
(limite prático do GitHub é 100 MiB por arquivo).
"""
import os
import sys
import zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'PACOTE_MESTRE_DO_CANAL.zip')
PASTA_NO_ZIP = 'PACOTE_MESTRE_DO_CANAL'
LIMITE = 95 * 1000 * 1000

ARQUIVOS_RAIZ = ['ARQUIVO_MESTRE_DO_CANAL.md', 'README.md', 'catalogo-visual.md']
PASTAS_INTEIRAS = ['.kiro/steering', 'ideias', 'tools', 'canal']
FORA_DE_CANAL = ['canal/teste-capcut']
PASTAS_FORA = {'folhas', 'preview', 'cenas', 'node_modules', '.git'}
EXT_FORA = {'.mov', '.mp4', '.wav', '.zip'}
SAIDA_OK = ('thumb', 'storyboard', 'qa.txt')


def arquivos():
    lista = [f for f in ARQUIVOS_RAIZ if os.path.isfile(os.path.join(RAIZ, f))]
    for pasta in PASTAS_INTEIRAS:
        for base, dirs, nomes in os.walk(os.path.join(RAIZ, pasta)):
            rel_base = os.path.relpath(base, RAIZ)
            dirs[:] = [d for d in sorted(dirs)
                       if d not in PASTAS_FORA and os.path.join(rel_base, d) not in FORA_DE_CANAL]
            for n in sorted(nomes):
                if os.path.splitext(n)[1].lower() not in EXT_FORA:
                    lista.append(os.path.join(rel_base, n))
    for video in sorted(d for d in os.listdir(RAIZ) if d.startswith('video-')):
        vpasta = os.path.join(RAIZ, video)
        for n in sorted(os.listdir(vpasta)):
            if os.path.isfile(os.path.join(vpasta, n)) and os.path.splitext(n)[1] in ('.md', '.txt'):
                lista.append(os.path.join(video, n))
        for sub in ('animacao', 'audio'):
            spasta = os.path.join(vpasta, sub)
            if os.path.isdir(spasta):
                for n in sorted(os.listdir(spasta)):
                    if os.path.isfile(os.path.join(spasta, n)) and os.path.splitext(n)[1].lower() not in EXT_FORA:
                        lista.append(os.path.join(video, sub, n))
        spasta = os.path.join(vpasta, 'saida')
        if os.path.isdir(spasta):
            for n in sorted(os.listdir(spasta)):
                if os.path.isfile(os.path.join(spasta, n)) and n.startswith(SAIDA_OK):
                    lista.append(os.path.join(video, 'saida', n))
    return lista


def main():
    lista = arquivos()
    total = sum(os.path.getsize(os.path.join(RAIZ, f)) for f in lista)
    conteudo = ['Conteúdo do pacote (caminho e tamanho em KB). Veja a seção 11 do ARQUIVO_MESTRE_DO_CANAL.md',
                'para o que ficou de fora e onde está.', '']
    conteudo += ['%10.1f  %s' % (os.path.getsize(os.path.join(RAIZ, f)) / 1024, f) for f in lista]
    conteudo += ['', '%d arquivos, %.1f MB antes de compactar' % (len(lista), total / 1e6)]
    tmp = SAIDA + '.tmp'
    with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr(PASTA_NO_ZIP + '/CONTEUDO_DO_PACOTE.txt', '\n'.join(conteudo) + '\n')
        for f in lista:
            z.write(os.path.join(RAIZ, f), PASTA_NO_ZIP + '/' + f.replace(os.sep, '/'))
    with zipfile.ZipFile(tmp) as z:
        ruim = z.testzip()
        if ruim:
            sys.exit('arquivo corrompido no zip: ' + ruim)
    os.replace(tmp, SAIDA)
    tam = os.path.getsize(SAIDA)
    print('%s: %d arquivos, %.1f MB' % (os.path.relpath(SAIDA, RAIZ), len(lista) + 1, tam / 1e6))
    if tam > LIMITE:
        sys.exit('ATENÇÃO: passou de 95 MB; o GitHub pode recusar. Tire algo do pacote.')


if __name__ == '__main__':
    main()
