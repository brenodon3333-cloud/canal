// Confere a sintaxe dos arquivos da animação do jeito que o render junta (sem import/export).
import fs from 'fs';
const strip = (src) => src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+/gm, '');
let ok = true;
for (const f of process.argv.slice(2)) { try { new Function(strip(fs.readFileSync(f, 'utf8'))); console.log('ok', f); } catch (e) { ok = false; console.log('ERRO', f, e.message); } }
process.exitCode = ok ? 0 : 1;
