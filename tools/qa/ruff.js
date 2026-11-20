// Lance le ruff du venv du projet (règle absolue : Python toujours dans un venv), jamais celui du PATH.
//   node tools/qa/ruff.js check .        (arguments passés tels quels à ruff, code de sortie de ruff renvoyé)
// Windows : .venv-win/Scripts/ruff.exe ; ailleurs : .venv/bin/ruff (venv WSL). Venv absent : erreur, pas de repli.
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IS_WINDOWS = process.platform === 'win32';
const VENV = IS_WINDOWS ? '.venv-win' : '.venv';
const RUFF = IS_WINDOWS ? join(ROOT, VENV, 'Scripts', 'ruff.exe') : join(ROOT, VENV, 'bin', 'ruff');
const SETUP = `uv venv ${VENV} && uv pip sync -p ${VENV} --require-hashes requirements-dev.txt`;

if (!existsSync(RUFF)) {
  console.error(`ruff introuvable dans ${VENV}/ (${RUFF}).\nCréer le venv depuis la racine du projet : ${SETUP}`);
  process.exit(1);
}

const run = spawnSync(RUFF, process.argv.slice(2), {cwd: ROOT, stdio: 'inherit'});
if (run.error) {
  console.error(`ruff n'a pas pu être lancé : ${run.error.message}`);
  process.exit(1);
}
process.exit(run.status ?? 1);
