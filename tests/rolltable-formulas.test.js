import {
  describe, it, expect, beforeEach, afterEach
} from "vitest"

import {
  sr5RollFormulaAmount, SR5TableResult
} from "../modules/entities/rollTables/entityRollTable.js"

/**
 * A Roll that returns whatever the formula asks for, so a test can state a
 * total without depending on dice: "3" gives 3, "boom" throws the way core's
 * parser does on nonsense.
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

describe("sr5RollFormulaAmount", () => {
  beforeEach(() => {
    globalThis.Roll = FakeRoll
  })

  afterEach(() => {
    delete globalThis.Roll
  })

  it("treats a table without a formula as a single draw", async () => {
    expect(await sr5RollFormulaAmount(undefined)).toBe(1)
    expect(await sr5RollFormulaAmount(null)).toBe(1)
    expect(await sr5RollFormulaAmount("")).toBe(1)
    expect(await sr5RollFormulaAmount("   ")).toBe(1)
  })

  it("returns the whole number the formula rolled", async () => {
    expect(await sr5RollFormulaAmount("4")).toBe(4)
    expect(await sr5RollFormulaAmount(" 7 ")).toBe(7)
  })

  it("rounds a fractional total down", async () => {
    expect(await sr5RollFormulaAmount("2.9")).toBe(2)
  })

  // A count of zero would drop the line from the card without saying so, and
  // a silent disappearance is worse than an extra line: a table that yields
  // nothing writes a "Rien" result of its own.
  it("never drops a line, whatever the formula rolls", async () => {
    expect(await sr5RollFormulaAmount("0")).toBe(1)
    expect(await sr5RollFormulaAmount("-3")).toBe(1)
  })

  it("falls back to a single draw when the formula does not parse", async () => {
    expect(await sr5RollFormulaAmount("boom", "Butin de gang")).toBe(1)
  })
})

describe("SR5TableResult#getHTML", () => {
  /**
   * Stand in for core's own rendering, so only what SR5 adds is measured.
   * @param {number} quantity
   * @returns {Promise<string>}
   */
  async function render(quantity) {
    const result = new SR5TableResult()
    result.sr5Quantity = quantity
    return result.getHTML()
  }

  beforeEach(() => {
    Object.getPrototypeOf(SR5TableResult.prototype).getHTML = async () => "<div>Balles</div>"
  })

  it("says nothing when a line came up once", async () => {
    expect(await render(1)).toBe("<div>Balles</div>")
  })

  it("says nothing when no quantity was rolled", async () => {
    expect(await render(undefined)).toBe("<div>Balles</div>")
  })

  it("puts the count in front of the line when it came up several times", async () => {
    expect(await render(12))
      .toBe("<span class=\"SR-TableQuantity\">×12</span><div>Balles</div>")
  })
})
