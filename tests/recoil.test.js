import {
  describe, it, expect
} from 'vitest'
import {
  isRecoilCarriedOver
} from '../modules/rolls/roll-helpers/recoil.js'

const linkedActor = {
  id: "a1", isToken: false, token: null
}
const tokenActor = {
  id: "a1", isToken: true, token: {
    id: "t2"
  }
}

describe('progressive recoil carries over only in combat (SR5 p. 178)', () => {
  it('does not carry over outside any combat', () => {
    expect(isRecoilCarriedOver(linkedActor, null)).toBe(false)
    expect(isRecoilCarriedOver(linkedActor, undefined)).toBe(false)
  })

  it('does not carry over when the actor is not a combatant', () => {
    expect(isRecoilCarriedOver(linkedActor, {
      combatants: [{
        actorId: "other", tokenId: "t9"
      }]
    })).toBe(false)
  })

  it('carries over for a linked actor in the combat', () => {
    expect(isRecoilCarriedOver(linkedActor, {
      combatants: [{
        actorId: "a1", tokenId: "t1"
      }]
    })).toBe(true)
  })

  it('matches an unlinked token actor by its token, not its base actor', () => {
    expect(isRecoilCarriedOver(tokenActor, {
      combatants: [{
        actorId: "a1", tokenId: "t1"
      }]
    })).toBe(false)
    expect(isRecoilCarriedOver(tokenActor, {
      combatants: [{
        actorId: "a1", tokenId: "t2"
      }]
    })).toBe(true)
  })
})
