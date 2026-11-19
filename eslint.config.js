// Lint du jeu : bonnes pratiques JS + règles SonarQube (eslint-plugin-sonarjs) + séparation des couches.
// Lancer : npm run lint   (règles détaillées et corrections attendues : .claude/rules/javascript/)
import js from '@eslint/js';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import importX from 'eslint-plugin-import-x';
import prettierConfig from 'eslint-config-prettier/flat';

// Couches repérées par le suffixe (voir .claude/rules/javascript/architecture.md) :
// *.data.js ← *.engine.js ← *.view.js ← app/main.js ; shared/ = briques de l'UI, sous les vues.
const DATA = ['src/**/*.data.js'];
const ENGINE = ['src/**/*.engine.js'];
const VIEWS = ['src/**/*.view.js'];
const SHARED = ['src/shared/**/*.js'];
const restrict = (group, message) => ({'no-restricted-imports': ['error', {patterns: [{group, message}]}]});
// tout chemin qui ne finit pas par .data.js
const restrictNonData = message => ({
  'no-restricted-imports': ['error', {patterns: [{regex: String.raw`^(?!.*\.data\.js$)`, message}]}],
});

export default [
  {
    ignores: [
      '.claude/**',
      'node_modules/**',
      'proto/**',
      'screenshots/**',
      'sd_raw/**',
      '.venv/**',
      'assets/**',
      'src/**/*.generated.js',
    ],
  },
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['**/*.js'],
    plugins: {'import-x': importX},
    languageOptions: {ecmaVersion: 2023, sourceType: 'module'},
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['error', {argsIgnorePattern: '^_', caughtErrors: 'all'}],
      'max-lines-per-function': ['warn', {max: 50, skipBlankLines: true, skipComments: true}],
      'max-lines': ['warn', {max: 300, skipBlankLines: true, skipComments: true}],
      'max-depth': ['warn', 4],
      'import-x/no-cycle': 'error',
      'import-x/no-self-import': 'error',
      'import-x/extensions': ['error', 'always', {ignorePackages: true}],
    },
  },
  // UI (vues, app/, shared/) : seul endroit où le DOM existe ; le moteur et les données n'ont pas les globals navigateur
  {files: [...VIEWS, 'src/app/**/*.js', ...SHARED], languageOptions: {globals: globals.browser}},
  // données : n'importent que d'autres données
  {files: DATA, rules: restrictNonData("Les données n'importent que d'autres *.data.js.")},
  // moteur pur : jamais une vue, ni shared/, ni app/ (tools/sim.js le fait tourner dans Node)
  {
    files: ENGINE,
    rules: restrict(
      ['**/*.view.js', '**/shared/**', '**/app/**'],
      "Le moteur n'importe que des *.data.js et *.engine.js.",
    ),
  },
  // vues : jamais main.js (demander un rendu avec requestRender() de shared/render.js)
  {
    files: VIEWS,
    rules: restrict(['**/app/main.js', './main.js'], "Une vue n'importe jamais main.js : requestRender()."),
  },
  // shared/ : briques du bas de l'UI, n'importent aucune vue
  {files: SHARED, rules: restrict(['**/*.view.js'], "shared/ n'importe aucune vue.")},
  // outils Node (simu, vérifications)
  {files: ['tools/**/*.js', 'eslint.config.js'], languageOptions: {globals: globals.node}},
  // mise en forme : laissée à Prettier (npm run format), on coupe les règles ESLint qui la contrediraient
  prettierConfig,
];
