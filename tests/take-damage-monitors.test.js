import {
  describe, it, expect, vi, beforeEach
} from 'vitest'

// config.js writes into CONFIG at import time
vi.hoisted(() => {
  globalThis.CONFIG ??= {
  }
})

import {
  SR5_ActorHelper
} from '../modules/entities/actors/entityActor-helpers.js'
import {
  SR5_EntityHelpers
} from '../modules/entities/helpers.js'

function monitor(max, damage = 0){
  return {
    value: max, base: max, modifiers: [], actual: {
      value: damage, base: damage, modifiers: []
    }
  }
}

// A character whose source never received the computed maxima (all 0), as a
// freshly created actor, while its prepared data holds the real values.
function fakeActor(type, prepared, source){
  const actor = {
    id: 'a1', type, name: 'Test',
    effects: [],
    system: prepared,
    _source: {
      type, system: source
    },
    // toObject(false) returns prepared data, toJSON (used by duplicate) the source
    toObject: (s = true) => JSON.parse(JSON.stringify(s ? actor._source : {
      type, system: actor.system
    })),
    toJSON: () => actor._source,
    update: vi.fn(async (data) => {
      for (const [path, value] of Object.entries(data)) {
        if (path.startsWith('system.')) foundry.utils.setProperty(actor.system, path.slice(7), value)
      }
    }),
  }
  return actor
}

function pcData(body, willpower, maxima = [8 + Math.ceil(body / 2), 8 + Math.ceil(willpower / 2), body]){
  return {
    limits: {
      physicalLimit: {
        value: 6
      }
    },
    itemsProperties: {
      armor: {
        value: 0
      }
    },
    conditionMonitors: {
      physical: monitor(maxima[0]),
      stun: monitor(maxima[1]),
      overflow: monitor(maxima[2]),
    },
  }
}

function hit(value, type = 'physical'){
  return {
    damage: {
      value, type, matrix: {
        value: 0
      }, element: ''
    },
    combat: {
      ammo: {
      }
    },
    threshold: {
    },
  }
}

let actor, status
beforeEach(() => {
  status = []
  vi.spyOn(SR5_EntityHelpers, 'getRealActorFromID').mockImplementation(() => actor)
  vi.spyOn(SR5_ActorHelper, 'createDeadEffect').mockImplementation(async () => status.push('dead'))
  vi.spyOn(SR5_ActorHelper, 'createKoEffect').mockImplementation(async () => status.push('ko'))
  vi.spyOn(SR5_ActorHelper, 'createProneEffect').mockImplementation(async () => status.push('prone'))
})

describe('takeDamage reads computed condition monitor maxima', () => {
  it('a fresh character (source maxima at 0) survives 5P', async () => {
    actor = fakeActor('actorPc', pcData(4, 4), pcData(4, 4, [0, 0, 0]))
    await SR5_ActorHelper.takeDamage('a1', hit(5))
    expect(status).toEqual([])
    expect(actor.system.conditionMonitors.physical.actual.base).toBe(5)
  })

  it('uses the current maximum, not one frozen in the source', async () => {
    actor = fakeActor('actorPc', pcData(6, 4), pcData(2, 4))
    // Body 2 froze 9 boxes in the source, Body 6 gives 11: 10P leave him standing
    await SR5_ActorHelper.takeDamage('a1', hit(10))
    expect(status).not.toContain('dead')
    expect(status).not.toContain('ko')
  })

  it('only writes damage taken, never the computed maxima', async () => {
    actor = fakeActor('actorPc', pcData(4, 4), pcData(4, 4, [0, 0, 0]))
    await SR5_ActorHelper.takeDamage('a1', hit(3))
    const written = Object.keys(actor.update.mock.calls[0][0])
    expect(written.every(p => p.endsWith('.actual.base'))).toBe(true)
  })

  // Knocked down when damage exceeds the physical limit (computed, 0 in the source)
  it('reads the computed physical limit: 6P stands, 7P knocks down', async () => {
    // Source maxima are right here: only the limit is missing, so nothing else can fail
    const source = pcData(4, 4)
    source.limits.physicalLimit.value = 0
    actor = fakeActor('actorPc', pcData(4, 4), source)
    await SR5_ActorHelper.takeDamage('a1', hit(6))
    expect(status).toEqual([])
    actor = fakeActor('actorPc', pcData(4, 4), source)
    await SR5_ActorHelper.takeDamage('a1', hit(7))
    expect(status).toEqual(['prone'])
  })

  it('a grunt (source maximum at 0) survives 3 damage', async () => {
    const data = {
      limits: {
        physicalLimit: {
          value: 6
        }
      },
      itemsProperties: {
        armor: {
          value: 0
        }
      },
      conditionMonitors: {
        condition: monitor(10)
      }
    }
    const source = JSON.parse(JSON.stringify(data))
    source.conditionMonitors.condition.value = 0
    actor = fakeActor('actorGrunt', data, source)
    await SR5_ActorHelper.takeDamage('a1', hit(3))
    expect(status).toEqual([])
  })
})
