import {
  describe, it, expect
} from 'vitest'
import {
  SR5_SystemHelpers
} from '../modules/system/utilitySystem.js'

// Melee range is the adjacent grid space, diagonal included, plus one space per point of Reach (SR5 p. 187).
// It is counted between the spaces each token covers (TokenDocument#getOccupiedGridSpaceOffsets): a token
// larger than one space is in contact through any of them, and a diagonal costs the same as a straight step
// whatever the scene's diagonal rule.

const square = {
  isSquare: true
}

// The spaces a token of w x h squares covers, from its top-left space.
const footprint = (i, j, w = 1, h = 1) => {
  const cells = []
  for (let di = 0; di < h; di++) for (let dj = 0; dj < w; dj++) cells.push({
    i: i + di, j: j + dj
  })
  return cells
}
const reach = (attacker, target, r) => SR5_SystemHelpers.isInMeleeRange(square, attacker, target, r)

describe('isInMeleeRange on a square grid', () => {
  const me = footprint(10, 10)

  it('reaches the eight adjacent squares with Reach 0, and not two squares away', () => {
    for (const [di, dj] of [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      expect(reach(me, footprint(10 + di, 10 + dj), 0)).toBe(true)
    }
    for (const [di, dj] of [[0, 2], [2, 0], [2, 2], [-2, 1]]) {
      expect(reach(me, footprint(10 + di, 10 + dj), 0)).toBe(false)
    }
  })

  it('adds one square per point of Reach, diagonals included', () => {
    expect(reach(me, footprint(12, 12), 1)).toBe(true)
    expect(reach(me, footprint(13, 10), 1)).toBe(false)
    expect(reach(me, footprint(13, 13), 2)).toBe(true)
  })

  // A 2x2 target touching the attacker on any side: its top-left space is two squares away on the right and
  // below, which a corner-to-corner count refused.
  it('reaches a 2x2 target touching the attacker on each of its four sides and corners', () => {
    for (const [i, j] of [[10, 11], [11, 10], [10, 8], [8, 10], [11, 11], [8, 8], [8, 11], [11, 8]]) {
      expect(reach(me, footprint(i, j, 2, 2), 0)).toBe(true)
    }
    expect(reach(me, footprint(10, 12, 2, 2), 0)).toBe(false)
    expect(reach(me, footprint(12, 12, 2, 2), 0)).toBe(false)
  })

  it('lets a 2x2 attacker reach through any of its spaces', () => {
    const big = footprint(10, 10, 2, 2)
    for (const [i, j] of [[10, 12], [12, 10], [12, 12], [9, 9], [11, 12], [12, 11]]) {
      expect(reach(big, footprint(i, j), 0)).toBe(true)
    }
    expect(reach(big, footprint(10, 13), 0)).toBe(false)
    expect(reach(big, footprint(10, 13), 1)).toBe(true)
  })

  it('reaches between two large tokens by their closest spaces', () => {
    expect(reach(footprint(10, 10, 3, 3), footprint(10, 13, 2, 2), 0)).toBe(true)
    expect(reach(footprint(10, 10, 3, 3), footprint(10, 14, 2, 2), 0)).toBe(false)
  })

  it('has nothing to count without spaces (gridless scene, or no token)', () => {
    expect(reach([], footprint(10, 11), 0)).toBe(null)
    expect(reach(me, undefined, 0)).toBe(null)
  })
})

// Hexagonal grids, shaped like Foundry's: offsetToCube depends on the orientation, cubeDistance is static.
// Rows ("pointy" hexes, odd rows shifted right) and columns ("flat" hexes, odd columns shifted down).
class HexGrid {
  constructor(columns) {
    this.isSquare = false
    this.columns = columns
  }
  offsetToCube({
    i, j
  }) {
    if (this.columns) {
      const q = j, r = i - (j - (j & 1)) / 2
      return {
        q, r, s: -q - r
      }
    }
    const q = j - (i - (i & 1)) / 2, r = i
    return {
      q, r, s: -q - r
    }
  }
  static cubeDistance(a, b) {
    return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2
  }
}

// The six neighbours of a hex, written out by hand for each orientation and parity, not derived from the
// grid under test.
const NEIGHBOURS = {
  rows: {
    even: [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]],
    odd: [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]],
  },
  columns: {
    even: [[-1, 0], [1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]],
    odd: [[-1, 0], [1, 0], [0, -1], [1, -1], [0, 1], [1, 1]],
  },
}
// Spaces one square away on a square grid but two hexes away: a count that ignored the hex shape would
// take them for neighbours.
const NOT_NEIGHBOURS = {
  rows: {
    even: [[-1, 1], [1, 1]], odd: [[-1, -1], [1, -1]]
  },
  columns: {
    even: [[1, -1], [1, 1]], odd: [[-1, -1], [-1, 1]]
  },
}

for (const orientation of ['rows', 'columns']) {
  describe(`isInMeleeRange on a hexagonal grid (${orientation})`, () => {
    const grid = new HexGrid(orientation === 'columns')
    for (const parity of ['even', 'odd']) {
      const origin = parity === 'even' ? {
        i: 10, j: 10
      } : orientation === 'rows' ? {
        i: 11, j: 10
      } : {
        i: 10, j: 11
      }
      const at = ([di, dj]) => [{
        i: origin.i + di, j: origin.j + dj
      }]

      it(`reaches the six neighbours of an ${parity} ${orientation.slice(0, -1)} with Reach 0`, () => {
        for (const d of NEIGHBOURS[orientation][parity]) {
          expect(SR5_SystemHelpers.isInMeleeRange(grid, [origin], at(d), 0)).toBe(true)
        }
      })

      it(`does not reach two hexes away from an ${parity} ${orientation.slice(0, -1)} with Reach 0`, () => {
        for (const d of NOT_NEIGHBOURS[orientation][parity]) {
          expect(SR5_SystemHelpers.isInMeleeRange(grid, [origin], at(d), 0)).toBe(false)
          expect(SR5_SystemHelpers.isInMeleeRange(grid, [origin], at(d), 1)).toBe(true)
        }
      })
    }
  })
}
