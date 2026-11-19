// Lint du jeu : bonnes pratiques JS + règles SonarQube (eslint-plugin-sonarjs) + séparation des couches.
// Lancer : npm run lint   (règles détaillées et corrections attendues : .claude/rules/javascript/)
import js from '@eslint/js';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import importX from 'eslint-plugin-import-x';

// Couches (voir CLAUDE.md) : données ← moteur ← UI. Le moteur et les données n'importent jamais l'UI.
const UI = ['**/ui/**'];
const ENGINE = ['**/engine.js', '**/dig.js'];

export default [
  { ignores: ['.claude/**', 'node_modules/**','proto/**', 'screenshots/**', 'sd_raw/**', '.venv/**', 'assets/**', 'src/grids.js'] },
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['**/*.js'],
    plugins: { 'import-x': importX },
    languageOptions: { ecmaVersion: 2023, sourceType: 'module' },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'all' }],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 4],
      'import-x/no-cycle': 'error',
      'import-x/no-self-import': 'error',
      'import-x/extensions': ['error', 'always', { ignorePackages: true }],
    },
  },
  // UI : seul endroit où le DOM existe
  { files: UI.map(g => g + '/*.js'), languageOptions: { globals: globals.browser } },
  // moteur pur : pas de globals navigateur (document, window… → no-undef), pas d'import de l'UI
  {
    files: ['src/*.js'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{ group: ['**/ui/*'], message: 'Le moteur et les données n\'importent jamais l\'UI.' }] }] },
  },
  // données : n'importent ni le moteur ni l'UI
  {
    files: ['src/data.js'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{ group: [...ENGINE.map(g => g.replace('**/', './')), '**/ui/*'], message: 'Les données n\'importent rien du moteur ni de l\'UI.' }] }] },
  },
  // outils Node (simu, vérifications)
  { files: ['tools/**/*.js', 'eslint.config.js'], languageOptions: { globals: globals.node } },
];
