import {
  describe, it, expect
} from 'vitest'
import {
  SR5_SystemHelpers
} from '../modules/system/utilitySystem.js'

// Melee range is the adjacent square, diagonal included, plus one square per point of Reach (SR5 p. 187).
// A square grid prices a diagonal step differently under each of Foundry's diagonal rules; the count of
// squares between two cells must not depend on it.

const SIZE = 100

// A square grid shaped like Foundry's: getOffset turns a point into a cell, measurePath prices the diagonals
// according to CONST.GRID_DIAGONALS (every rule but ILLEGAL, which forbids diagonal moves altogether).
function squareGrid(distance, rule) {
  const diagonalCost = {
    EQUIDISTANT: (d) => d,
    EXACT: (d) => d * Math.SQRT2,
    APPROXIMATE: (d) => d * 1.5,
    RECTILINEAR: (d) => d * 2,
    ALTERNATING_1: (d) => d + Math.floor(d / 2),
    ALTERNATING_2: (d) => d + Math.ceil(d / 2),
  }[rule]
  return {
    isSquare: true,
    distance,
    getOffset: (point) => ({
      i: Math.floor(point.y / SIZE), j: Math.floor(point.x / SIZE)
    }),
    measurePath: ([a, b]) => {
      const di = Math.abs(Math.floor(a.y / SIZE) - Math.floor(b.y / SIZE))
      const dj = Math.abs(Math.floor(a.x / SIZE) - Math.floor(b.x / SIZE))
      const diag = Math.min(di, dj), straight = Math.max(di, dj) - diag
      return {
        distance: (straight + diagonalCost(diag)) * distance
      }
    },
  }
}

const RULES = ['EQUIDISTANT', 'EXACT', 'APPROXIMATE', 'RECTILINEAR', 'ALTERNATING_1', 'ALTERNATING_2']
const SCALES = [1.5, 1, 5]
const attacker = {
  x: 1000, y: 1000
}
const at = (dx, dy) => ({
  x: attacker.x + dx * SIZE, y: attacker.y + dy * SIZE
})

describe('isInMeleeRange', () => {
  for (const rule of RULES) {
    describe(`diagonal rule ${rule}`, () => {
      for (const distance of SCALES) {
        const grid = squareGrid(distance, rule)

        it(`reaches every adjacent square with Reach 0, at ${distance} per square`, () => {
          for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
            expect(SR5_SystemHelpers.isInMeleeRange(grid, attacker, at(dx, dy), 0)).toBe(true)
          }
        })

        it(`does not reach two squares away with Reach 0, at ${distance} per square`, () => {
          for (const [dx, dy] of [[2, 0], [2, 1], [2, 2]]) {
            expect(SR5_SystemHelpers.isInMeleeRange(grid, attacker, at(dx, dy), 0)).toBe(false)
          }
        })

        it(`adds one square per point of Reach, diagonals included, at ${distance} per square`, () => {
          for (const [dx, dy] of [[2, 0], [2, 2], [1, 2]]) {
            expect(SR5_SystemHelpers.isInMeleeRange(grid, attacker, at(dx, dy), 1)).toBe(true)
          }
          expect(SR5_SystemHelpers.isInMeleeRange(grid, attacker, at(3, 3), 1)).toBe(false)
          expect(SR5_SystemHelpers.isInMeleeRange(grid, attacker, at(3, 3), 2)).toBe(true)
        })
      }
    })
  }

  // The comparison this replaces: a distance against (Reach + 1) squares' worth of distance. It lost the
  // adjacent diagonal square under every rule whose first diagonal step costs more than one square -- which
  // is what the tests above guard against.
  it('witness: a distance bound loses the adjacent diagonal under four of the six rules', () => {
    const lost = RULES.filter(rule => {
      const grid = squareGrid(1.5, rule)
      return grid.measurePath([attacker, at(1, 1)]).distance > 1 * grid.distance
    })
    expect(lost).toEqual(['EXACT', 'APPROXIMATE', 'RECTILINEAR', 'ALTERNATING_2'])
  })

  it('compares a distance on a grid with no diagonals (hexagonal or gridless)', () => {
    const grid = {
      isSquare: false,
      distance: 1.5,
      measurePath: () => ({
        distance: 3
      })
    }
    expect(SR5_SystemHelpers.isInMeleeRange(grid, attacker, at(2, 0), 1)).toBe(true)
    expect(SR5_SystemHelpers.isInMeleeRange(grid, attacker, at(2, 0), 0)).toBe(false)
  })
})
