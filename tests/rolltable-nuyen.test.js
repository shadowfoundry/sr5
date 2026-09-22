import {
  describe, it, expect, beforeEach, afterEach
} from "vitest"

import {
  sr5SplitNuyen
} from "../modules/interface/table-nuyen.js"

import {
  sr5RollNuyenAmount
} from "../modules/entities/rollTables/entityRollTable.js"

/**
 * A Roll that returns what the formula says, so an amount can be stated
 * without depending on dice.
 */
class FakeRoll {
  constructor(formula) {
    this.formula = formula
    if (formula === "boom") throw new Error("unparseable formula")
  }

  static create(formula) {
    return new FakeRoll(formula)
  }

  async evaluate() {
    this.total = Number(this.formula)
    return this
  }
}

describe("sr5SplitNuyen", () => {
  it("gives the whole amount to a lone character", () => {
    expect(sr5SplitNuyen(1000, 1)).toEqual([1000])
  })

  it("splits evenly when it comes out even", () => {
    expect(sr5SplitNuyen(1000, 4)).toEqual([250, 250, 250, 250])
  })

  // Nothing may be lost to rounding: a run's pay is a run's pay.
  it("leaves the remainder with the first share rather than losing it", () => {
    const shares = sr5SplitNuyen(1000, 3)
    expect(shares).toEqual([334, 333, 333])
    expect(shares.reduce((a, b) => a + b, 0)).toBe(1000)
  })

  it("still adds up when there is less money than characters", () => {
    const shares = sr5SplitNuyen(2, 5)
    expect(shares.reduce((a, b) => a + b, 0)).toBe(2)
    expect(shares).toHaveLength(5)
  })

  it("hands back nothing when nobody is there to be paid", () => {
    expect(sr5SplitNuyen(1000, 0)).toEqual([])
  })
})

describe("sr5RollNuyenAmount", () => {
  beforeEach(() => {
    globalThis.Roll = FakeRoll
  })

  afterEach(() => {
    delete globalThis.Roll
  })

  it("says nothing at all when the table has no money formula", async () => {
    expect(await sr5RollNuyenAmount("")).toBeNull()
    expect(await sr5RollNuyenAmount(undefined)).toBeNull()
  })

  // Unlike a count, zero is a result here: a body that carried nothing.
  it("keeps a zero rather than turning it into one", async () => {
    expect(await sr5RollNuyenAmount("0")).toBe(0)
  })

  it("never lets a table take money away", async () => {
    expect(await sr5RollNuyenAmount("-500")).toBe(0)
  })

  it("rounds to the nuyen", async () => {
    expect(await sr5RollNuyenAmount("249.9")).toBe(249)
  })

  it("hands back nothing when the formula does not parse", async () => {
    expect(await sr5RollNuyenAmount("boom", "Planque")).toBeNull()
  })
})
