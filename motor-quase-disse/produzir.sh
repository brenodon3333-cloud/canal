#!/usr/bin/env bash
# Um comando do áudio ao vídeo conferido.
#   ./produzir.sh <episodio> <gravacao|guia> <versao>
# Exemplos:
#   ./produzir.sh prova-bolo guia v1              (voz-guia local)
#   ./produzir.sh prova-bolo entrada/voz.m4a v3   (gravação real: qualquer formato que o ffmpeg abra)
set -euo pipefail
cd "$(dirname "$0")"
EP=$1; VOZ=$2; VER=$3
if [ "$VOZ" = guia ]; then
  .venv/bin/python motor/voz.py guia "$EP"
else
  .venv/bin/python motor/voz.py alinhar "$EP" "$VOZ"
fi
node motor/render.js "$EP" --versao "$VER"
.venv/bin/python motor/conferir.py "$EP" "$VER"
