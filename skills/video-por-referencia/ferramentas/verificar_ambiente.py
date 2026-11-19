"""Confere se o computador tem tudo para a skill video-por-referencia e diz o que falta.

Uso:  python -I -X utf8 verificar_ambiente.py
"""
import importlib.util, os, shutil, subprocess, sys

ok_total = True
def linha(nome, ok, dica=""):
    global ok_total
    ok_total &= ok or dica.startswith("(opcional)")
    print(f"  {'OK   ' if ok else 'FALTA'}  {nome}" + ("" if ok else f"  ->  {dica}"))

def versao(cmd):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=20).stdout.splitlines()[0][:60]
    except Exception:
        return ""

print("\nProgramas")
linha(f"Python {sys.version.split()[0]}", sys.version_info >= (3, 10), "instale o Python 3.10+ em python.org")
linha("ffmpeg / ffprobe " + versao(["ffmpeg", "-version"]).replace("ffmpeg version ", ""), bool(shutil.which("ffmpeg") and shutil.which("ffprobe")),
      "Windows: winget install Gyan.FFmpeg · Mac: brew install ffmpeg · Linux: sudo apt install ffmpeg")
linha("Node.js " + versao(["node", "-v"]), bool(shutil.which("node")), "instale o Node 18+ em nodejs.org")
linha("npx", bool(shutil.which("npx") or shutil.which("npx.cmd")), "vem junto com o Node.js")
linha("curl", bool(shutil.which("curl")), "Windows 10+ já tem; Mac/Linux: instale pelo gerenciador de pacotes")

print("\nBibliotecas Python  (pip install -r requirements.txt)")
for mod, pip in [("faster_whisper", "faster-whisper"), ("numpy", "numpy"), ("PIL", "pillow"), ("rembg", "rembg[cpu]"), ("onnxruntime", "onnxruntime")]:
    linha(mod, importlib.util.find_spec(mod) is not None, f"pip install {pip}")

print("\nOpcional")
aqui = os.path.dirname(os.path.abspath(__file__))
esr = os.environ.get("REALESRGAN") or shutil.which("realesrgan-ncnn-vulkan") or next(
    (os.path.join(aqui, "realesrgan", n) for n in ["realesrgan-ncnn-vulkan.exe", "realesrgan-ncnn-vulkan"] if os.path.exists(os.path.join(aqui, "realesrgan", n))), None)
if not esr and os.path.exists(os.path.join(aqui, "config_local.json")):
    import json
    esr = json.load(open(os.path.join(aqui, "config_local.json"), encoding="utf-8")).get("realesrgan")
linha("Real-ESRGAN (aumentar fotos pequenas)", bool(esr and os.path.exists(esr)),
      "(opcional) baixe em github.com/xinntao/Real-ESRGAN/releases e descompacte em " + os.path.join(aqui, "realesrgan"))
modelo = os.path.join(aqui, "..", "modelo_remotion", "package.json")
linha("modelo de montagem (Remotion)", os.path.exists(modelo), "a pasta modelo_remotion não está junto da skill: reinstale o pacote")

print("\nNo Claude Code (confira você mesmo)")
print("  - Conector de geração de imagem/música/efeitos (ex.: Higgsfield). Sem ele, a skill escreve os pedidos para você gerar.")
print("  - Navegador: Claude in Chrome ou o navegador do app, para o Wikimedia Commons e a Library of Congress.")
print("  - Agentes pesquisador-documentario e revisor-de-risco em ~/.claude/agents/ (o instalador copia).")
print("\nResultado:", "TUDO PRONTO" if ok_total else "instale o que está marcado como FALTA e rode de novo", "\n")
