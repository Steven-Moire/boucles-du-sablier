# Direction artistique

## Intention
Du **pixel art « joli »**, dans l'esprit de Little Dig : des pixels nets, une lumière douce, des couleurs chaudes et de petits détails vivants. C'est lisible même en petit, ça a du charme et c'est cohérent avec la mine pixel par pixel, où le décor lui-même est fait de pixels.

## Le héros : le mineur fou
- Cheveux blancs en bataille qui sortent d'un casque de mineur cabossé, avec une lampe frontale.
- Yeux écarquillés et sourire de travers : il est un peu fou parce qu'il revit la même journée.
- Pioche sur l'épaule, tablier de cuir, bottes boueuses.
- **Signe distinctif** : un petit sablier fêlé et lumineux pendu à sa ceinture. C'est le lien visuel avec la boucle, et il pourra se remplir ou se vider à l'écran.

## Spécifications
| Élément | Taille native | Affichage |
|---|---|---|
| Icônes de cases | 32 × 32 | ×2 (64 px) |
| Monstres normaux | 48 × 48 | ×2 |
| Élites | 64 × 64 | ×2 |
| Boss | 96 × 96 | ×2 |
| Portrait du héros | 64 × 64 | ×2 |
| Fonds de scène (par biome) | 320 × 180 | ×3 ou ×4 |

- **Une seule palette pour tout le jeu : Endesga 64** (Lospec), dans `docs/palette.hex`. Choisie par mesure : sur les premiers rendus SD, erreur de couleur moyenne 21,7 contre 28,5 pour Resurrect 64 et 39,2 pour Endesga 32 (Resurrect manque de bruns naturels).
- Lumière venant d'en haut à gauche, contour sombre d'un pixel (pas noir pur) et fond transparent.
- Dans le CSS : `image-rendering: pixelated;`, avec des agrandissements en multiples entiers uniquement.

## Pipeline Stable Diffusion (en local)
1. **Modèle** : SDXL avec un LoRA pixel art (il en existe plusieurs sur Civitai / Hugging Face). Génère en 1024 × 1024, sur fond uni clair.
2. **Préfixe de style** (identique pour tous les assets, pour la cohérence) :
   `pixel art, 16-bit game sprite, clean crisp pixels, limited color palette, soft shading, light from top-left, centered, full body, plain flat light background`
3. **Négatif** : `blurry, gradient background, text, watermark, jpeg artifacts, anti-aliasing, 3d render, photo, realistic`
4. **Exemple pour le héros** :
   `a wild-eyed eccentric old miner, pickaxe on his shoulder, messy white hair under a dented mining helmet with a lamp, leather apron, muddy boots, a small cracked glowing hourglass hanging from his belt, crooked grin`
5. Génère 4 à 8 variantes, garde la meilleure et **note le prompt et la seed** dans le tableau ci-dessous.
6. **Nettoyage automatique** : `python tools/sd_generate.py --build` (ou à la main `python tools/pixelize.py brut.png assets/sprites/heros.png --size 64 --palette docs/palette.hex --bg auto --outline`)
   Le script réduit l'image en vrais pixels, verrouille la palette et détoure le fond.
7. **Retouche à la main** dans Aseprite, LibreSprite ou Pixelorama (gratuit) : contours, yeux, petits défauts. Sur du pixel art, SD produit souvent des « faux pixels », donc cette étape reste nécessaire.

## Assets prioritaires
1. Portrait du héros (le mineur fou)
2. Monstres : mulot, sanglier, sanglier alpha, loup, golem, ours, Gardien du Sablier
3. Icônes de cases : combat, repaire, boss, bosquet, filon, source, trésor, village, puits
4. Fonds de scène : Prés de l'Aube, Collines grises
5. Bâtiments du village (pour une future vue « village »)

## Suivi des assets
| Asset | Fichier | Prompt (résumé) | Seed | État |
|---|---|---|---|---|
| Héros | `assets/sprites/heros.png` | mineur fou + sablier fêlé | | à faire |
