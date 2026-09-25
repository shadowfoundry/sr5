import {
  describe, it, expect, beforeAll
} from 'vitest'

// Detection spell range (SR5 p. 287): Force × caster's Magic metres, × 10 when extended.
// The range used to be computed in the actor's first pass on items, before the caster's
// Magic was known (magic.augmented.value still 0): a detection spell showed Force metres.

let SR5Actor
beforeAll(async () => {
  globalThis.CONFIG ??= {
  }
  globalThis.game ??= {
  }
  globalThis.game.i18n ??= {
    localize: (k) => k, format: (k) => k 
  }
  ;({
    SR5Actor 
  } = await import('../modules/entities/actors/entityActor.js'))
})

function spell({
  force, category = "detection", range = "los", extended = false 
}) {
  return {
    type: "itemSpell",
    system: {
      force, category, range, spellAreaExtended: extended,
      // State left by the first pass, when the caster's Magic was still 0
      spellAreaOfEffect: {
        base: 0, value: force * 0, modifiers: [] 
      },
    },
  }
}

function actorWithMagic(magic, items) {
  return {
    system: {
      specialAttributes: {
        magic: {
          augmented: {
            value: magic 
          } 
        } 
      } 
    }, items 
  }
}

describe('detection spell range', () => {
  for (const force of [4, 6]) {
    for (const magic of [4, 6]) {
      it(`Force ${force}, Magic ${magic}: ${force * magic} m, extended ${force * magic * 10} m`, () => {
        const normal = spell({
          force 
        })
        const extended = spell({
          force, extended: true 
        })
        SR5Actor.prototype.updateItems(actorWithMagic(magic, [normal, extended]))
        expect(normal.system.spellAreaOfEffect.value).toBe(force * magic)
        expect(extended.system.spellAreaOfEffect.value).toBe(force * magic * 10)
      })
    }
  }

  it('area spell radius stays Force metres, without the Magic factor', () => {
    const area = spell({
      force: 5, category: "combat", range: "area" 
    })
    SR5Actor.prototype.updateItems(actorWithMagic(6, [area]))
    expect(area.system.spellAreaOfEffect.value).toBe(5)
  })

  it('recomputing twice does not stack modifiers', () => {
    const s = spell({
      force: 4 
    })
    const actor = actorWithMagic(6, [s])
    SR5Actor.prototype.updateItems(actor)
    SR5Actor.prototype.updateItems(actor)
    expect(s.system.spellAreaOfEffect.value).toBe(24)
  })
})
