#!/usr/bin/env bash
# Prepara as ferramentas do projeto dentro da própria pasta (nada global).
# Rode uma vez por ambiente novo: ./preparar.sh
set -euo pipefail
cd "$(dirname "$0")"

[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q imageio-ffmpeg numpy piper-tts faster-whisper
npm install --silent

mkdir -p .tools/bin .tools/voz .tools/hf assets/fontes
FF=$(.venv/bin/python -c "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())")
ln -sf "$FF" .tools/bin/ffmpeg

VOZ=faber/medium/pt_BR-faber-medium
N=$(basename $VOZ)
BASE=https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR
[ -s .tools/voz/$N.onnx ] || curl -sL -o .tools/voz/$N.onnx $BASE/$VOZ.onnx
[ -s .tools/voz/$N.onnx.json ] || curl -sL -o .tools/voz/$N.onnx.json $BASE/$VOZ.onnx.json

F=https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack
[ -s assets/fontes/ArchivoBlack-Regular.ttf ] || curl -sL -o assets/fontes/ArchivoBlack-Regular.ttf $F/ArchivoBlack-Regular.ttf
[ -s assets/fontes/OFL-ArchivoBlack.txt ] || curl -sL -o assets/fontes/OFL-ArchivoBlack.txt $F/OFL.txt

echo "pronto: ffmpeg=$(.tools/bin/ffmpeg -version | head -1 | cut -c1-40)"

# conferência (acrescentada no pacote de transferência, 19/11/2026): na reconstrução de teste,
# a primeira passada terminou sem o módulo nativo do canvas e sem o numpy. Rodar de novo resolveu.
ok=1
node -e "require('@napi-rs/canvas')" 2>/dev/null || { echo "FALTA @napi-rs/canvas: rode 'npm install' de novo"; ok=0; }
.venv/bin/python -c "import numpy, imageio_ffmpeg, piper, faster_whisper" 2>/dev/null || { echo "FALTA pacote Python: rode '.venv/bin/pip install imageio-ffmpeg numpy piper-tts faster-whisper'"; ok=0; }
[ -s .tools/voz/pt_BR-faber-medium.onnx ] || { echo "FALTA a voz Piper: copie de recursos/voz/ do pacote"; ok=0; }
[ -s assets/fontes/ArchivoBlack-Regular.ttf ] || { echo "FALTA a fonte Archivo Black"; ok=0; }
[ $ok = 1 ] && echo "ambiente conferido: tudo presente"
