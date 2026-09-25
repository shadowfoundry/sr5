import {
  describe, it, expect
} from 'vitest'
import {
  SR5_CharacterUtility 
} from '../modules/entities/actors/utilityActor.js'
import {
  migrateLegacyBiographyKeys 
} from '../modules/datamodels/common/biographyMigration.js'
import {
  SR5 
} from '../modules/config.js'

/** Minimal modifiable property, as produced by the actor data models. */
const mod = () => ({
  base: 0, value: 0, modifiers: [] 
})

/** Minimal actor shaped like the parts of the schema applyRacialModifers touches. */
function makeActor(metatype, type = 'actorPc') {
  const resistanceByVector = () => Object.fromEntries(
    Object.keys(SR5.propagationVectors).map((vector) => [vector, mod()])
  )

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
        disease: resistanceByVector(),
        toxin: resistanceByVector(),
      },
      attributes: Object.fromEntries(
        ['body', 'agility', 'reaction', 'strength', 'willpower', 'logic', 'charisma']
          .map((key) => [key, {
            natural: mod() 
          }])
      ),
    },
  }
}

const valueOf = (property) => property.modifiers.reduce((total, m) => total + m.value, 0)

describe('applyRacialModifers - visions', () => {
  it('gives low-light vision to elves and orks', () => {
    for (const metatype of ['elf', 'ork']) {
      const actor = makeActor(metatype)
      SR5_CharacterUtility.applyRacialModifers(actor)
      expect(actor.system.visions.lowLight.natural, metatype).toBe(true)
      expect(actor.system.visions.thermographic.natural, metatype).toBe(false)
    }
  })

  it('gives thermographic vision to dwarves and trolls', () => {
    for (const metatype of ['dwarf', 'troll']) {
      const actor = makeActor(metatype)
      SR5_CharacterUtility.applyRacialModifers(actor)
      expect(actor.system.visions.thermographic.natural, metatype).toBe(true)
      expect(actor.system.visions.lowLight.natural, metatype).toBe(false)
    }
  })

  it('leaves humans without enhanced vision', () => {
    const actor = makeActor('human')
    SR5_CharacterUtility.applyRacialModifers(actor)
    expect(actor.system.visions.lowLight.natural).toBe(false)
    expect(actor.system.visions.thermographic.natural).toBe(false)
  })

  it('applies to player characters, not only grunts (regression)', () => {
    const pc = makeActor('troll', 'actorPc')
    SR5_CharacterUtility.applyRacialModifers(pc)
    expect(pc.system.visions.thermographic.natural).toBe(true)

    const grunt = makeActor('troll', 'actorGrunt')
    SR5_CharacterUtility.applyRacialModifers(grunt)
    expect(grunt.system.visions.thermographic.natural).toBe(true)
  })
})

describe('applyRacialModifers - other racial traits', () => {
  it('gives trolls +1 reach and +1 dermal armor (SR5 p. 68)', () => {
    const actor = makeActor('troll')
    SR5_CharacterUtility.applyRacialModifers(actor)
    expect(valueOf(actor.system.reach)).toBe(1)
    expect(valueOf(actor.system.resistances.physicalDamage)).toBe(1)
  })

  it('gives dwarves +2 against disease and toxin on every vector', () => {
    const actor = makeActor('dwarf')
    SR5_CharacterUtility.applyRacialModifers(actor)
    for (const vector of Object.keys(SR5.propagationVectors)) {
      expect(valueOf(actor.system.resistances.disease[vector]), vector).toBe(2)
      expect(valueOf(actor.system.resistances.toxin[vector]), vector).toBe(2)
    }
  })

  it('applies attribute bonuses to grunts only', () => {
    const pc = makeActor('troll', 'actorPc')
    SR5_CharacterUtility.applyRacialModifers(pc)
    expect(valueOf(pc.system.attributes.body.natural)).toBe(0)

    const grunt = makeActor('troll', 'actorGrunt')
    SR5_CharacterUtility.applyRacialModifers(grunt)
    expect(valueOf(grunt.system.attributes.body.natural)).toBe(4)
    expect(valueOf(grunt.system.attributes.strength.natural)).toBe(4)
    expect(valueOf(grunt.system.attributes.charisma.natural)).toBe(-2)
  })

  it('does nothing when no metatype is set', () => {
    const actor = makeActor('')
    SR5_CharacterUtility.applyRacialModifers(actor)
    expect(actor.system.visions.lowLight.natural).toBe(false)
    expect(actor.system.reach.modifiers).toHaveLength(0)
  })
})

describe('migrateLegacyBiographyKeys', () => {
  it('moves characterMetatype to metatype and drops the old key', () => {
    const source = {
      biography: {
        characterMetatype: 'troll' 
      } 
    }
    migrateLegacyBiographyKeys(source)
    expect(source.biography.metatype).toBe('troll')
    expect(source.biography.characterMetatype).toBeUndefined()
  })

  it('moves characterMetatypeVariant to metatypeVariant', () => {
    const source = {
      biography: {
        characterMetatypeVariant: 'Nocturna' 
      } 
    }
    migrateLegacyBiographyKeys(source)
    expect(source.biography.metatypeVariant).toBe('Nocturna')
    expect(source.biography.characterMetatypeVariant).toBeUndefined()
  })

  it('keeps the current key when both are present', () => {
    const source = {
      biography: {
        metatype: 'elf', characterMetatype: 'troll' 
      } 
    }
    migrateLegacyBiographyKeys(source)
    expect(source.biography.metatype).toBe('elf')
    expect(source.biography.characterMetatype).toBeUndefined()
  })

  it('leaves already-migrated and empty sources alone', () => {
    const source = {
      biography: {
        metatype: 'dwarf' 
      } 
    }
    expect(migrateLegacyBiographyKeys(source).biography.metatype).toBe('dwarf')
    expect(() => migrateLegacyBiographyKeys({
    })).not.toThrow()
    expect(() => migrateLegacyBiographyKeys(undefined)).not.toThrow()
  })

  it('migrated data feeds the racial modifiers (end to end)', () => {
    const actor = makeActor('')
    actor.system.biography = {
      characterMetatype: 'dwarf' 
    }
    migrateLegacyBiographyKeys(actor.system)
    SR5_CharacterUtility.applyRacialModifers(actor)
    expect(actor.system.visions.thermographic.natural).toBe(true)
  })
})
