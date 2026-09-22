import {
  describe, it, expect, beforeEach, afterEach
} from "vitest"

import {
  sr5SplitNuyen, sr5LootManifest, sr5SpendPayoutRow
} from "../modules/interface/table-payout.js"

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

describe("sr5LootManifest", () => {
  beforeEach(() => {
    globalThis.foundry = {
      ...globalThis.foundry,
      utils: {
        ...globalThis.foundry.utils,
        parseUuid: uuid => {
          const parts = String(uuid).split(".")
          return parts.length > 1 ? {
            type: parts.at(-2)
          } : null
        }
      }
    }
  })

  /**
   * A drawn line, reduced to what the manifest reads.
   * @param {object} fields
   * @returns {object}
   */
  const ligne = fields => ({
    type: "text", documentUuid: null, ...fields
  })

  it("keeps the items a draw can actually hand over", () => {
    const manifeste = sr5LootManifest([
      ligne({
        type: "document", documentUuid: "Compendium.megapack.gear.Item.abc", sr5Quantity: 12
      })
    ])
    expect(manifeste).toEqual([{
      uuid: "Compendium.megapack.gear.Item.abc", quantity: 12
    }])
  })

  // A line of prose is not a thing to be carried, and neither is a contact
  // the table drew or another table it points at.
  it("leaves out what cannot be carried", () => {
    expect(sr5LootManifest([
      ligne({
        text: "Rien"
      }),
      ligne({
        type: "document", documentUuid: "Actor.xyz"
      }),
      ligne({
        type: "document", documentUuid: "RollTable.def"
      })
    ])).toEqual([])
  })

  it("counts one when the line carried no quantity", () => {
    const manifeste = sr5LootManifest([
      ligne({
        type: "document", documentUuid: "Item.abc"
      })
    ])
    expect(manifeste[0].quantity).toBe(1)
  })
})

describe("sr5SpendPayoutRow", () => {
  const carte = '<div class="table-draw">…</div>' +
    '<footer class="SR-TablePayout">' +
    '<div class="SR-TablePayoutRow" data-payout="loot">' +
    '<span class="SR-TablePayoutLabel">Butin : 3 objet(s)</span>' +
    '<button type="button" data-action="sr5GiveTableLoot">Donner</button></div>' +
    '<div class="SR-TablePayoutRow" data-payout="nuyen">' +
    '<span class="SR-TablePayoutLabel">Nuyens trouvés : 1 000¥</span>' +
    '<button type="button" data-action="sr5PayTableNuyen">Verser</button></div>' +
    '</footer>'

  it("spends the row it was asked for and leaves the other alone", () => {
    const apres = sr5SpendPayoutRow(carte, "loot", "Remis à Ariane.")
    expect(apres).toContain("Remis à Ariane.")
    expect(apres).not.toContain("sr5GiveTableLoot")
    expect(apres).toContain("sr5PayTableNuyen")
  })

  it("leaves the draw itself untouched", () => {
    expect(sr5SpendPayoutRow(carte, "nuyen", "Versé.")).toContain('<div class="table-draw">…</div>')
  })

  it("does nothing when that row is not there", () => {
    expect(sr5SpendPayoutRow('<p>rien</p>', "loot", "x")).toBe('<p>rien</p>')
  })
})
