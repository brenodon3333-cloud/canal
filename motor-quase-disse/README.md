# Canal de animação · projeto

Animação desenhada, animada, sonorizada e renderizada por código. Só a narração é gravada por uma pessoa.

- `IDENTIDADE.md`: proposta de identidade do canal
- `DECISOES.md`: o que foi verificado no ambiente, regras que funcionaram, pendências
- `episodios/<ep>/`: `falas.json` (texto da narração), `episodio.js` (tempos, planos, atuação, som), `ROTEIRO.md`
- `motor/`: `tempo.js` (blocos e palavras), `desenho.js`, `som.js`, `voz.py` (guia e alinhamento), `render.js`, `conferir.py`, `folha.js`
- `saida/<ep>/`: vídeos, wav, planilha de som e conferência de cada versão

```
./preparar.sh                                   # uma vez por ambiente
./produzir.sh prova-bolo guia v1                # voz-guia local
./produzir.sh prova-bolo entrada/voz.m4a v3     # gravação real
node motor/render.js prova-bolo --versao x --quadros 8.3,9.0 --escala 0.5   # só quadros
```
