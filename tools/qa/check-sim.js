// Non-régression de l'équilibrage : la sortie de la simu doit rester identique, octet pour octet, aux références.
//   node tools/qa/check-sim.js            compare (code de sortie 1 si une sortie a changé)
//   node tools/qa/check-sim.js --update   réécrit les références (après un changement de gameplay VOULU)
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SIM = join(ROOT, 'tools', 'sim.js');
const REF_DIR = join(ROOT, 'tools', 'qa', 'ref');
const RUNS = [
  {name: 'sim.txt', args: []},
  {name: 'sim-outils.txt', args: ['--outils']},
  {name: 'sim-malin.txt', args: ['--malin']},
  {name: 'sim-moyen.txt', args: ['--moyen']},
];

const runSim = args => execFileSync(process.execPath, [SIM, ...args], {cwd: ROOT, encoding: 'utf8'});

function firstDiff(a, b) {
  const la = a.split('\n'),
    lb = b.split('\n');
  const i = la.findIndex((line, k) => line !== lb[k]);
  const at = i < 0 ? la.length : i;
  return `ligne ${at + 1}\n  attendu : ${lb[at] ?? '(fin)'}\n  obtenu  : ${la[at] ?? '(fin)'}`;
}

function check(update) {
  mkdirSync(REF_DIR, {recursive: true});
  let failed = 0;
  for (const {name, args} of RUNS) {
    const out = runSim(args),
      ref = join(REF_DIR, name);
    if (update) {
      writeFileSync(ref, out);
      console.log(`référence réécrite : ${name}`);
      continue;
    }
    if (!existsSync(ref)) {
      console.error(`référence absente : ${name} (lancer avec --update)`);
      failed++;
      continue;
    }
    const expected = readFileSync(ref, 'utf8');
    if (out === expected) {
      console.log(`identique : ${name}`);
      continue;
    }
    console.error(`DIFFÉRENT : ${name}, ${firstDiff(out, expected)}`);
    failed++;
  }
  return failed;
}

process.exitCode = check(process.argv.includes('--update')) ? 1 : 0;
