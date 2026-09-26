import {
  describe, it, expect
} from "vitest"
import {
  SR5_CombatHelpers
} from "../modules/rolls/roll-helpers/combat.js"

// A stand-in for Foundry's SquareGrid, limited to what scatterOffset uses.
//
// Its numbers were checked against the real thing inside Foundry 13.351 (SquareGrid with
// size 100, distance 1.5) before this file was written: for a 6 m translation at 45 degrees,
// getTranslatedPoint returns (400, 400) under EQUIDISTANT and (282.843, 282.843) under EXACT,
// and measurePath reads both back as 6.
const DIAGONALS = {
  EQUIDISTANT: 0, EXACT: 1, RECTILINEAR: 3
}

class FakeSquareGrid {
  constructor({
    size, distance, diagonals
  }){
    this.size = size
    this.distance = distance
    this.diagonals = diagonals
  }

  // Pixels per scene unit.
  get #scale(){
    return this.size / this.distance
  }

  #diagonalCost(){
    if (this.diagonals === DIAGONALS.EQUIDISTANT) return 1
    if (this.diagonals === DIAGONALS.EXACT) return Math.SQRT2
    if (this.diagonals === DIAGONALS.RECTILINEAR) return 2
    throw new Error(`unsupported diagonal rule ${this.diagonals}`)
  }

  getTranslatedPoint(origin, direction, distance){
    const radians = Math.toRadians ? Math.toRadians(direction) : direction * Math.PI / 180
    const dx = Math.cos(radians)
    const dy = Math.sin(radians)
    // Only the axis-aligned and 45-degree cases matter here, which is all scatter ever asks for.
    const diagonal = Math.abs(Math.abs(dx) - Math.abs(dy)) < 1e-9
    const cost = diagonal ? this.#diagonalCost() : 1
    const length = distance * this.#scale / cost
    return {
      x: origin.x + dx * length * (diagonal ? Math.SQRT2 : 1),
      y: origin.y + dy * length * (diagonal ? Math.SQRT2 : 1),
    }
  }

  measurePath([a, b]){
    const dx = Math.abs(b.x - a.x) / this.#scale
    const dy = Math.abs(b.y - a.y) / this.#scale
    const diagonalSteps = Math.min(dx, dy)
    const straightSteps = Math.abs(dx - dy)
    return {
      distance: diagonalSteps * this.#diagonalCost() + straightSteps
    }
  }
}

// What the old code did, kept so the test states what it is guarding against: the four diagonals
// halved each axis, which divides each component by 2 instead of dividing the norm by sqrt(2).
function legacyOffset(grid, direction, distance){
  const gridUnit = grid.size / (grid.distance || 1)
  const full = distance * gridUnit
  const half = full / 2
  switch(direction){
    case 1: return {
      x: 0, y: full
    }
    case 2: return {
      x: -half, y: half
    }
    case 3: return {
      x: -full, y: 0
    }
    case 4: return {
      x: -half, y: -half
    }
    case 5: return {
      x: 0, y: -full
    }
    case 6: return {
      x: half, y: -half
    }
    case 7: return {
      x: full, y: 0
    }
    case 8: return {
      x: half, y: half
    }
  }
}

const SCALES = [
  {
    label: "1 m per square", size: 100, distance: 1
  },
  {
    label: "1.5 m per square", size: 100, distance: 1.5
  },
  {
    label: "5 m per square", size: 100, distance: 5
  },
  {
    label: "1.5 m per square, 70 px squares", size: 70, distance: 1.5
  },
]

const RULES = [
  {
    label: "equidistant diagonals", diagonals: DIAGONALS.EQUIDISTANT
  },
  {
    label: "exact diagonals", diagonals: DIAGONALS.EXACT
  },
  {
    label: "rectilinear diagonals", diagonals: DIAGONALS.RECTILINEAR
  },
]

const ORIGIN = {
  x: 0, y: 0
}
const CARDINALS = [1, 3, 5, 7]
const DIAGONAL_ROLLS = [2, 4, 6, 8]

describe("SR5_CombatHelpers.scatterOffset — SR5 p. 183", () => {
  for (const scale of SCALES){
    for (const rule of RULES){
      it(`lands at the announced distance in all eight directions (${scale.label}, ${rule.label})`, () => {
        const grid = new FakeSquareGrid({
          ...scale, diagonals: rule.diagonals
        })
        for (const distance of [1, 6, 13]){
          for (let direction = 1; direction <= 8; direction++){
            const offset = SR5_CombatHelpers.scatterOffset(grid, direction, distance)
            const read = grid.measurePath([ORIGIN, offset]).distance
            expect(read, `direction ${direction}, ${distance} m`).toBeCloseTo(distance, 6)
          }
        }
      })
    }
  }

  it("rolls the 1d8 as a compass: 7 is east, and the eight results are eight distinct points", () => {
    const grid = new FakeSquareGrid({
      size: 100, distance: 1.5, diagonals: DIAGONALS.EQUIDISTANT
    })
    const east = SR5_CombatHelpers.scatterOffset(grid, 7, 6)
    expect(east.x).toBeCloseTo(400, 6)
    expect(east.y).toBeCloseTo(0, 6)

    const seen = new Set()
    for (let direction = 1; direction <= 8; direction++){
      const o = SR5_CombatHelpers.scatterOffset(grid, direction, 6)
      seen.add(`${Math.round(o.x)},${Math.round(o.y)}`)
    }
    expect(seen.size).toBe(8)
  })

  it("keeps the same eight directions the old code aimed at", () => {
    const grid = new FakeSquareGrid({
      size: 100, distance: 1, diagonals: DIAGONALS.EQUIDISTANT
    })
    for (let direction = 1; direction <= 8; direction++){
      const now = SR5_CombatHelpers.scatterOffset(grid, direction, 6)
      const before = legacyOffset(grid, direction, 6)
      // + 0 turns a -0 from the trigonometry back into 0, which Object.is tells apart.
      expect(Math.sign(Math.round(now.x)) + 0, `direction ${direction}, x sign`).toBe(Math.sign(before.x) + 0)
      expect(Math.sign(Math.round(now.y)) + 0, `direction ${direction}, y sign`).toBe(Math.sign(before.y) + 0)
    }
  })

  it("the old code was wrong on the four diagonals under either reading, and right on the four cardinals", () => {
    const grid = new FakeSquareGrid({
      size: 100, distance: 1.5, diagonals: DIAGONALS.EQUIDISTANT
    })
    for (const direction of CARDINALS){
      const before = legacyOffset(grid, direction, 6)
      expect(grid.measurePath([ORIGIN, before]).distance).toBeCloseTo(6, 6)
    }
    for (const direction of DIAGONAL_ROLLS){
      const before = legacyOffset(grid, direction, 6)
      // Half the announced distance by the scene's ruler...
      expect(grid.measurePath([ORIGIN, before]).distance).toBeCloseTo(3, 6)
      // ...and 4.24 m as the crow flies, so short under the other reading too.
      const asCrowFlies = Math.hypot(before.x, before.y) / (grid.size / grid.distance)
      expect(asCrowFlies).toBeCloseTo(6 / Math.SQRT2, 6)
    }
  })
})
