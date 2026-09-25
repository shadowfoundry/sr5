import {
  describe, it, expect 
} from 'vitest'
import {
  existsSync, readFileSync 
} from 'node:fs'

// SR5Item gives every new item `assets/img/items/<type>.svg`: a type without
// its file shows a broken image on every item created from it.
describe('default item icons', () => {
  const system = JSON.parse(readFileSync('system.json', 'utf8'))
  for (const type of Object.keys(system.documentTypes.Item)) {
    it(`${type} has its default icon`, () => {
      expect(existsSync(`assets/img/items/${type}.svg`)).toBe(true)
    })
  }
})
