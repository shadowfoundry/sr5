import {
  describe, it, expect, beforeEach, afterEach, vi
} from "vitest"
import {
  SR5_CharacterUtility
} from "../modules/entities/actors/utilityActor.js"
import {
  SR5_EntityHelpers
} from "../modules/entities/helpers.js"

// handleAstralVision returned early as soon as the token document already carried the
// 'astralvision' mode. getVisionData also settles the range and the detection modes, so such a
// token kept a range of 0 and no astral detection mode when astral perception was switched on.
describe("SR5_CharacterUtility.handleAstralVision", () => {
  let token, saved

  beforeEach(() => {
    saved = {
      scene: globalThis.canvas.scene, get: globalThis.game.settings.get, isNumeric: Number.isNumeric
    }
    token = {
      id: "t1",
      actorId: "a1",
      sight: {
        visionMode: "astralvision", range: 0, enabled: true
      },
      detectionModes: [],
      update: vi.fn(),
    }
    globalThis.canvas.scene = {
      tokens: [token]
    }
    globalThis.game.settings.get = (_system, key) => (key === "sr5VisionRangeAstral" ? 300 : 0)
    Number.isNumeric ??= (n) => Number.isFinite(Number(n))
    vi.spyOn(SR5_EntityHelpers, "addEffectToActor").mockResolvedValue()
  })

  afterEach(() => {
    globalThis.canvas.scene = saved.scene
    globalThis.game.settings.get = saved.get
    Number.isNumeric = saved.isNumeric
    vi.restoreAllMocks()
  })

  it("gives the astral range and detection mode to a token already in astral vision mode", async () => {
    const actor = {
      id: "a1",
      token: null,
      system: {
        visions: {
          astral: {
            isActive: true
          }
        }
      },
    }
    await SR5_CharacterUtility.handleAstralVision(actor)

    expect(token.update).toHaveBeenCalledTimes(1)
    const data = token.update.mock.calls[0][0]
    expect(data.sight.visionMode).toBe("astralvision")
    expect(data.sight.range).toBe(300)
    expect(data.detectionModes.map(d => d.id)).toContain("astralvision")
  })
})
