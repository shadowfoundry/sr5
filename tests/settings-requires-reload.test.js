import {
  describe, it, expect, beforeAll, afterAll
} from 'vitest'
import {
  SR5_SystemHelpers
} from '../modules/system/utilitySystem.js'

// La fenêtre des réglages de Foundry V13 enregistre les réglages un par un :
// un onChange qui recharge la page coupe l'enregistrement des suivants.
// Un réglage qui demande un rechargement le déclare par requiresReload,
// que Foundry traite une seule fois, après tout l'enregistrement.
describe('registerSystemSettings', () => {
  const registered = new Map()
  let previousSettings

  beforeAll(() => {
    previousSettings = globalThis.game.settings
    globalThis.game.settings = {
      ...previousSettings,
      register: (namespace, key, data) => registered.set(`${namespace}.${key}`, data),
    }
    SR5_SystemHelpers.registerSystemSettings()
  })

  afterAll(() => {
    globalThis.game.settings = previousSettings
  })

  it('never reloads the page from an onChange callback', () => {
    for (const [key, data] of registered) {
      const source = data.onChange?.toString() ?? ''
      expect(source, key).not.toMatch(/reload/)
    }
  })

  it('asks for a reload on the settings that need one', () => {
    for (const key of [
      'sr5.sr5Log.active',
      'sr5.sr5Log.level',
      'sr5.sr5ChooseStyle',
      'sr5.sr5Help.active',
      'sr5.sr5MatrixGridRules',
      'sr5.sr5CalledShotsRules',
      'sr5.sr5KillCodeRules',
      'sr5.sr5Rigger5Actions',
    ]) {
      expect(registered.get(key)?.requiresReload, key).toBe(true)
    }
  })
})
