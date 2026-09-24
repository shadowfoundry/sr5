import {
  describe, it, expect
} from "vitest"
import {
  SR5_CombatHelpers
} from "../modules/rolls/roll-helpers/combat.js"

// The Environmental Modifiers table (SR5 p. 176) has four columns: Visibility,
// "Light / Glare", Wind and Range. The scene keeps Light and Glare as two separate flags, which
// used to make the "equally severe" rule count one condition twice. Nothing covered this function
// before, so these cases are written from the table and not from the previous behaviour.
const LIGNE_VERS_MOD = {
  0: 0, 1: -1, 2: -3, 3: -6, 4: -10
}

function scene(flags) {
  return {
    getFlag: (_module, key) => flags[key] ?? 0
  }
}

function acteur({
  lowLight = false, visibility = 0, light = 0, glare = 0, wind = 0
} = {
}) {
  return {
    itemsProperties: {
      environmentalMod: {
        visibility: {
          value: visibility
        },
        light: {
          value: light
        },
        glare: {
          value: glare
        },
        wind: {
          value: wind
        },
      }
    },
    visions: {
      lowLight: {
        isActive: lowLight
      }
    },
  }
}

const mod = (flags, {
  noWind = false, acteurOptions = {
  }
} = {
}) =>
  SR5_CombatHelpers.handleEnvironmentalModifiers(scene(flags), acteur(acteurOptions), noWind)

describe("handleEnvironmentalModifiers", () => {
  it("converts each row of the table to its dice pool modifier", () => {
    for (const [ligne, attendu] of Object.entries(LIGNE_VERS_MOD)) {
      expect(mod({
        environModVisibility: Number(ligne)
      })).toBe(attendu)
    }
  })

  it("keeps only the most penalising condition", () => {
    // Visibility 1, wind 3: the worst alone decides, so the severe row.
    expect(mod({
      environModVisibility: 1, environModWind: 3
    })).toBe(-6)
  })

  it("steps up one row when two columns are equally severe", () => {
    // Visibility 2 and wind 2 are two distinct conditions of the table: -3 becomes -6.
    expect(mod({
      environModVisibility: 2, environModWind: 2
    })).toBe(-6)
  })

  it("treats light and glare as one column, not two", () => {
    // Dim light with moderate glare is a single row of the "Light / Glare" column, so it stays -3
    // instead of stepping up as if two conditions were equally severe.
    expect(mod({
      environModLight: 2, environModGlare: 2
    })).toBe(-3)
    expect(mod({
      environModLight: 1, environModGlare: 1
    })).toBe(-1)
    // And the worst of the two is what the column is worth.
    expect(mod({
      environModLight: 1, environModGlare: 3
    })).toBe(-6)
  })

  it("still steps up when the light column ties with another column", () => {
    // Light 2 and visibility 2 really are two conditions of the table.
    expect(mod({
      environModLight: 2, environModVisibility: 2
    })).toBe(-6)
    // Glare 2 and visibility 2 as well, the merged column keeping the glare value.
    expect(mod({
      environModGlare: 2, environModVisibility: 2
    })).toBe(-6)
  })

  it("drops the wind column when asked, and only that one", () => {
    expect(mod({
      environModWind: 3
    })).toBe(-6)
    expect(mod({
      environModWind: 3
    }, {
      noWind: true
    })).toBe(0)
    expect(mod({
      environModGlare: 3
    }, {
      noWind: true
    })).toBe(-6)
  })

  it("never steps up past the extreme row", () => {
    expect(mod({
      environModVisibility: 4, environModWind: 4
    })).toBe(-10)
  })

  it("adds what the character's own gear contributes to a column", () => {
    expect(mod({
      environModGlare: 1
    }, {
      acteurOptions: {
        glare: 1
      }
    })).toBe(-3)
  })
})
