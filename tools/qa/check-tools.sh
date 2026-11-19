#!/usr/bin/env bash
# Lance les scripts Python de tools/ (sous WSL, .venv en 3.10) et écrit sorties + empreintes.
# Usage (WSL, depuis la racine) : bash tools/qa/check-tools.sh <etiquette>
#   → screenshots/qa-<etiquette>/ (dossier ignoré par git) : log.txt (sorties, codes) et sha.txt (empreintes).
# Lancer avant puis après un changement, et comparer log.txt (au nom du dossier près) et sha.txt.
# Réécrit src/enemies/grids.generated.js en place : git status doit rester propre.
set -u
L=${1:?usage : bash tools/qa/check-tools.sh <etiquette>}
R="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$R" || exit 1
P=.venv/bin/python
O=screenshots/qa-$L
rm -rf "$O"; mkdir -p "$O"
LOG=$O/log.txt
run() { echo "\$ $*" >>"$LOG"; "$@" >>"$LOG" 2>&1; echo "-> code $?" >>"$LOG"; }

# 1. --build complet, sortie redirigée vers le dossier ignoré
run $P -c "
import json, sys
sys.path.insert(0, 'tools')
import sd_generate as s
s.OUT = s.ROOT / '$O' / 'build'
s.build(json.loads(s.SPEC.read_text(encoding='utf-8')))
"
# 2. Aide des CLI (argparse et docstrings)
run $P tools/sd_generate.py --help
run $P tools/pixelize.py --help
# 3. Variantes de pixelize
SRC=sd_raw/golem/pxl_6000.png
run $P tools/pixelize.py $SRC $O/px/defaut.png
run $P tools/pixelize.py $SRC $O/px/jeu.png --size 48 --palette docs/palette.hex --bg auto --outline
run $P tools/pixelize.py $SRC $O/px/nocrop.png --no-crop --colors 8
run $P tools/pixelize.py $SRC $O/px/preview.png --preview 4 --sat 1
run $P tools/pixelize.py $SRC $O/px/tol.png --bg auto --tol 60 --size 32
# 4. lab / nearest
run $P -c "
import sys
sys.path.insert(0, 'tools')
from pixelize import lab, load_palette, nearest
cols = load_palette('docs/palette.hex')
for c in [(0, 0, 0), (255, 255, 255), (120, 80, 40), (30, 200, 180), (250, 10, 90)]:
    print(c, [round(v, 6) for v in lab(c)], nearest(c, cols))
"
# 5. sprite_grids (réécrit src/enemies/grids.generated.js en place)
run $P tools/sprite_grids.py
sha256sum src/enemies/grids.generated.js >>"$LOG"
# 6. compare_shots : identique, différent, absent, --tol, sans argument
A=$O/cs/a; B=$O/cs/b; C=$O/cs/c
mkdir -p $A $B $C
cp $O/build/golem.png $O/build/loup.png $O/build/mulot.png $A/
cp $A/*.png $B/; cp $A/golem.png $A/loup.png $C/
$P -c "
from PIL import Image
im = Image.open('$B/loup.png').convert('RGBA'); im.putpixel((5, 5), (255, 0, 255, 255)); im.save('$B/loup.png')
"
run $P tools/qa/compare_shots.py $A $A
run $P tools/qa/compare_shots.py $A $B
run $P tools/qa/compare_shots.py $A $C
run $P tools/qa/compare_shots.py $A $B --tol 50
run $P tools/qa/compare_shots.py
# Empreintes de tout ce qui a été écrit
(cd "$O" && find . -type f ! -name log.txt ! -name sha.txt | sort | xargs sha256sum) >"$O/sha.txt"
echo "fini : $O"
