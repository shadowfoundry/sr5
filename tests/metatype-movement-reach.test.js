import {
  describe, it, expect, vi, beforeEach, afterEach
} from 'vitest'
import {
  SR5_CharacterUtility
} from '../modules/entities/actors/utilityActor.js'
import {
  SR5
} from '../modules/config.js'

// The metatype lives in biography.metatype since #587. Three readers outside
// applyRacialModifers depend on it and none of the other tests reaches them:
// the dwarf/troll running rate, the elf/troll swimming rate, and
// the total of the actor's own Reach (troll +1, SR5 p. 68), which the melee
// defense roll reads. A merge that keeps an older side of utilityActor.js
// drops them without breaking anything else.

/** Minimal modifiable property, as produced by the actor data models. */
const mod = (base = 0) => ({
  base, value: base, dicePool: 0, modifiers: []
})

function makeActor(metatype, type = 'actorPc') {
  const movements = Object.fromEntries(Object.keys(SR5.movements).map((key) => [key, {
    movement: mod(), extraMovement: mod(), maximum: mod(), test: mod(), multiplier: mod(key === 'run' ? 4 : 2),
  }]))
  const attribute = (value) => ({
    augmented: {
      value
    }, natural: mod()
  })
  const skill = () => ({
    rating: {
      value: 0
    }
  })

  return {
    type,
    system: {
      biography: {
        metatype
      },
      visions: {
        lowLight: {
          natural: false
        },
        thermographic: {
          natural: false
        },
      },
      reach: mod(),
      resistances: {
        physicalDamage: mod(),
        disease: Object.fromEntries(Object.keys(SR5.propagationVectors).map((vector) => [vector, mod()])),
        toxin: Object.fromEntries(Object.keys(SR5.propagationVectors).map((vector) => [vector, mod()])),
      },
      attributes: Object.fromEntries(
        ['body', 'agility', 'reaction', 'strength', 'willpower', 'logic', 'intuition', 'charisma'].map((key) => [key, attribute(3)])
      ),
      skills: {
        running: skill(), swimming: skill(), gymnastics: skill(), flight: skill()
      },
      movements,
      defenses: {
      },
    },
  }
}

beforeEach(() => {
  // Wound and sustaining penalties are not what these tests are about.
  vi.spyOn(SR5_CharacterUtility, 'applyPenalty').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('movements read biography.metatype', () => {
  const extra = (metatype, key) => {
    const actor = makeActor(metatype)
    SR5_CharacterUtility.updateMovements(actor)
    return actor.system.movements[key].extraMovement.value
  }

  it('dwarves and trolls gain 1 m per running hit, others 2', () => {
    expect(extra('dwarf', 'run')).toBe(1)
    expect(extra('troll', 'run')).toBe(1)
    expect(extra('human', 'run')).toBe(2)
    expect(extra('elf', 'run')).toBe(2)
  })

  it('elves and trolls gain 2 m per swimming hit, others 1', () => {
    expect(extra('elf', 'swim')).toBe(2)
    expect(extra('troll', 'swim')).toBe(2)
    expect(extra('human', 'swim')).toBe(1)
    expect(extra('dwarf', 'swim')).toBe(1)
  })
})

describe('the actor Reach is totalled (SR5 p. 68)', () => {
  it('a troll ends with Reach 1 once defenses are updated', () => {
    const actor = makeActor('troll')
    SR5_CharacterUtility.applyRacialModifers(actor)
    actor.system.reach.value = 0
    SR5_CharacterUtility.updateDefenses(actor)
    expect(actor.system.reach.value).toBe(1)
  })

  it('a human keeps Reach 0', () => {
    const actor = makeActor('human')
    SR5_CharacterUtility.applyRacialModifers(actor)
    SR5_CharacterUtility.updateDefenses(actor)
    expect(actor.system.reach.value).toBe(0)
  })
})
