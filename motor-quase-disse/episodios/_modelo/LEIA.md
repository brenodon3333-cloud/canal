# Episódio modelo (mínimo)

Copie `episodios/_modelo/` para `episodios/<nome-do-episodio>/` e troque o texto de `falas.json`.

```
.venv/bin/python motor/voz.py guia <ep>            # voz-guia Piper + alinhamento -> narracao/tempos.json
node motor/render.js <ep> --versao t1 --escala 0.5 --quadros 1.0,2.5   # só quadros, para olhar
node motor/render.js <ep> --versao v1              # som + vídeo
.venv/bin/python motor/conferir.py <ep> v1         # mede o mp4
```
O contrato do episódio está explicado em docs/09_arquitetura_do_motor.md.
