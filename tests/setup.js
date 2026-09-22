// Foundry VTT document class stubs
globalThis.Actor = class {}
globalThis.Item = class {}
globalThis.Combat = class {}
globalThis.TokenDocument = class {}

// Foundry VTT global mocks
globalThis.foundry = {
  utils: {
    duplicate: (obj) => JSON.parse(JSON.stringify(obj)),
    deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
    getProperty: (obj, key) => key.split('.').reduce((o, k) => o?.[k], obj),
    setProperty: (obj, key, val) => {
      const parts = key.split('.')
      const last = parts.pop()
      const target = parts.reduce((o, k) => (o[k] ??= {
      }, o[k]), obj)
      target[last] = val
    },
    mergeObject: (target, source) => Object.assign(target, source),
  },
  abstract: {
    TypeDataModel: class {},
    DataModel: class {},
  },
  applications: {
    api: {
      ApplicationV2: class {},
      HandlebarsApplicationMixin: (base) => base,
    },
  },
  canvas: {
    placeables: {
      MeasuredTemplate: class {},
      Token: class {},
    },
  },
}

// Canvas stub
if (!globalThis.canvas) globalThis.canvas = {
  ready: false,
}

// Provide game.i18n.localize as identity function (returns the key unchanged)
if (!globalThis.game) globalThis.game = {
}
if (!globalThis.game.i18n) globalThis.game.i18n = {
}
if (!globalThis.game.i18n.localize) globalThis.game.i18n.localize = (key) => key
if (!globalThis.game.settings) globalThis.game.settings = {
  get: () => null,
}
if (!globalThis.game.i18n.format) globalThis.game.i18n.format = (key, _data) => key

// UI notification stubs
if (!globalThis.ui) globalThis.ui = {
}
if (!globalThis.ui.notifications) globalThis.ui.notifications = {
  warn: () => {},
  info: () => {},
  error: () => {},
}

// CONFIG stub: config.js writes its status effects into it on import
if (!globalThis.CONFIG) globalThis.CONFIG = {
}

// Foundry extends String with slugify
if (!String.prototype.slugify) {
   
  String.prototype.slugify = function ({
    replacement = "-", strict = false 
  } = {
  }) {
    let slug = this.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, replacement)
      .replace(new RegExp(`^${replacement}+|${replacement}+$`, "g"), "")
    if (strict) slug = slug.replace(new RegExp(`[^a-z0-9${replacement}]+`, "g"), "")
    return slug
  }
}
