const js = require('@eslint/js')
const globals = require('globals')

// Foundry VTT globals used in this codebase.
// Deprecated V13 utilities (duplicate, mergeObject, etc.) are kept here to
// avoid false-positive no-undef warnings until they are removed from the code.
const foundryGlobals = {
  // 3rd party
  Handlebars:   'readonly',
  // Core objects
  canvas:       'readonly',
  CONFIG:       'readonly',
  CONST:        'readonly',
  foundry:      'readonly',
  game:         'readonly',
  PIXI:         'readonly',
  ui:           'readonly',

  // Document classes
  ActiveEffect:  'readonly',
  Actor:         'readonly',
  Canvas:        'readonly',
  CanvasLayer:   'readonly',
  ChatMessage:   'readonly',
  Combat:        'readonly',
  Combatant:     'readonly',
  Compendium:    'readonly',
  Dialog:        'readonly',
  Entity:        'readonly',
  Folder:        'readonly',
  Hooks:         'readonly',
  Item:          'readonly',
  JournalEntry:  'readonly',
  Macro:         'readonly',
  Roll:          'readonly',
  Scene:         'readonly',
  Tabs:          'readonly',
  Token:         'readonly',
  TokenDocument: 'readonly',
  User:          'readonly',

  // Collection singletons
  Actors:    'readonly',
  Folders:   'readonly',
  Items:     'readonly',
  Playlists: 'readonly',
  Scenes:    'readonly',
  Users:     'readonly',

  // Global functions
  fromUuid:            'readonly',
  fromUuidSync:        'readonly',
  getDocumentClass:    'readonly',
  getTemplate:         'readonly',
  loadTemplates:       'readonly',
  renderTemplate:      'readonly',
  enrichHTML:          'readonly',

  // V2 Sheet classes
  DocumentSheetConfig: 'readonly',
  TextEditor:          'readonly',
  FilePicker:          'readonly',

  // SR5-specific
  GlowOverlayFilter:  'readonly',
  SR5:                 'readonly',

  // Deprecated V13 utilities (still present in codebase)
  duplicate:     'readonly',
  expandObject:  'readonly',
  flattenObject: 'readonly',
  getProperty:   'readonly',
  hasProperty:   'readonly',
  isNewerVersion:'readonly',
  mergeObject:   'readonly',
  setProperty:   'readonly',
}

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...foundryGlobals,
      },
    },
    rules: {
      'comma-dangle':        ['error', 'only-multiline'],
      'indent':              ['warn', 2, { SwitchCase: 1 }],
      'max-len':             'off',
      'no-tabs':             'off',
      'no-undef':            'warn',
      'no-underscore-dangle':'off',
      'no-unused-vars':      ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', args: 'after-used' }],
      'no-useless-assignment': 'off',
      'object-curly-newline':['error', 'always'],
      'operator-linebreak':  ['error', 'after'],
      'padded-blocks':       'off',
      'prefer-destructuring':'off',
      'semi':                ['error', 'never'],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        afterAll:   'readonly',
        afterEach:  'readonly',
        beforeAll:  'readonly',
        beforeEach: 'readonly',
        describe:   'readonly',
        expect:     'readonly',
        it:         'readonly',
        test:       'readonly',
        vi:         'readonly',
      },
    },
  },
]
