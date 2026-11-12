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
1. **Modèle** : Juggernaut XI + LoRA Pixel Art XL (`nerijs/pixel-art-xl`, installé dans `C:\StableDiffusion\forge\webui\models\Lora\`). Génère en 1024 × 1024, sur fond uni clair.
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
Prompts complets, modèle et seeds : `tools/sprites.json`. Modèle actuel (v2) : **Juggernaut XI + LoRA Pixel Art XL** (poids 1,2 ; 30 pas ; CFG 6 ; DPM++ 2M Karras), pixelisation sans saturation et 24 couleurs. Les fonds restent ceux de la v1 (DreamShaperXL Turbo, profil `v1_turbo`) : en v2 leur ciel tombait sur le cyan de la palette.
Limites connues : le héros tient une lampe-bâton plutôt qu'une pioche, petites ombres grises sous certains monstres. À retoucher à la main.

| Asset | Fichier | Prompt (résumé) | Seed | État |
|---|---|---|---|---|
| Héros | `assets/sprites/heros.png` | mineur fou, casque jaune + pioche | pxl_1101 | v2 (Juggernaut + Pixel Art XL) |
| Mulot dentu | `assets/sprites/mulot.png` | souris en colère, grandes incisives | pxl_2002 | v2 (Juggernaut + Pixel Art XL) |
| Sanglier | `assets/sprites/sanglier.png` | sanglier de profil | pxl_3103 | v2 (Juggernaut + Pixel Art XL) |
| Sanglier alpha | `assets/sprites/sanglier_alpha.png` | sanglier couvert de boue, couronne de brindilles | pxl_4103 | v2 (Juggernaut + Pixel Art XL) |
| Loup gris | `assets/sprites/loup.png` | loup qui grogne, de profil | pxl_5000 | v2 (Juggernaut + Pixel Art XL) |
| Golem de pierre | `assets/sprites/golem.png` | golem de rochers, cœur de cristal bleu | pxl_6000 | v2 (Juggernaut + Pixel Art XL) |
| Ours ancien | `assets/sprites/ours.png` | ours géant, runes gravées | pxl_7100 | v2 (Juggernaut + Pixel Art XL) |
| Gardien du Sablier | `assets/sprites/gardien.png` | gardien de pierre et d'or | pxl_8103 | v2 (Juggernaut + Pixel Art XL) |
| Fond Prés de l'Aube | `assets/sprites/bg_pres.png` | prairie à l'aube, ciel rose | 9000 | v1 (Turbo) |
| Fond Collines grises | `assets/sprites/bg_collines.png` | collines rocheuses, falaises | 9500 | v1 (Turbo) |
