import {
  describe, it, expect
} from "vitest"

import {
  sr5GroupResults
} from "../modules/entities/rollTables/entityRollTable.js"

/**
 * A drawn line, reduced to what the grouping actually reads.
 * @param {string} id
 * @param {object} extra
 * @returns {object}
 */
function ligne(id, extra = {
}) {
  return {
    id, type: "text", text: id, ...extra
  }
}

describe("sr5GroupResults", () => {
  it("leaves a draw of distinct lines alone", () => {
    const tire = [ligne("a"), ligne("b"), ligne("c")]
    expect(sr5GroupResults(tire).map(r => r.id)).toEqual(["a", "b", "c"])
  })

  it("merges a line that came up twice, and counts it", () => {
    const groupe = sr5GroupResults([ligne("a"), ligne("b"), ligne("a")])
    expect(groupe.map(r => r.id)).toEqual(["a", "b"])
    expect(groupe[0].sr5Quantity).toBe(2)
  })

  it("adds up the quantities rather than the appearances", () => {
    const groupe = sr5GroupResults([
      ligne("balles", {
        sr5Quantity: 7
      }),
      ligne("balles", {
        sr5Quantity: 4
      })
    ])
    expect(groupe).toHaveLength(1)
    expect(groupe[0].sr5Quantity).toBe(11)
  })

  it("keeps the order the dice produced, on first appearance", () => {
    const groupe = sr5GroupResults([ligne("c"), ligne("a"), ligne("c"), ligne("b")])
    expect(groupe.map(r => r.id)).toEqual(["c", "a", "b"])
  })

  // Two sub-tables can each hold a line reading "Munitions". They are two
  // lines of two tables, and adding them up would state a total the dice
  // never produced.
  it("does not merge two different lines that happen to read alike", () => {
    const groupe = sr5GroupResults([
      ligne("table-a-munitions", {
        text: "Munitions"
      }),
      ligne("table-b-munitions", {
        text: "Munitions"
      })
    ])
    expect(groupe).toHaveLength(2)
  })

  it("survives a line with no id, as a draw handed in from elsewhere may be", () => {
    const sansId = {
      type: "text", text: "Rien"
    }
    const groupe = sr5GroupResults([sansId, {
      type: "text", text: "Rien"
    }])
    expect(groupe).toHaveLength(1)
    expect(groupe[0].sr5Quantity).toBe(2)
  })
})
