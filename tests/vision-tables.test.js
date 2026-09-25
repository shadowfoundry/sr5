import {
  describe, it, expect
} from "vitest"
import {
  SR5_TOKEN_VISION_MODES,
  SR5_VISION_RANGE_SETTINGS,
  SR5_VISION_DETECTION_MODES,
  SR5_VISION_COLORS,
} from "../modules/system/vision.js"

// This file exists because vision.js used to reach into `foundry.canvas.perception` on its
// first line : importing it outside a running Foundry threw, and every test file that
// imported it transitively died before its first assertion. Importing the module at all is
// therefore the point of this suite.
describe("vision.js", () => {
  it("can be imported without a running Foundry", () => {
    expect(SR5_TOKEN_VISION_MODES).toBeTypeOf("object")
  })

  it("describes the same vision types everywhere", () => {
    const types = Object.keys(SR5_TOKEN_VISION_MODES)
    expect(types).toEqual(["astral", "lowLight", "thermographic", "ultrasound"])
    expect(Object.keys(SR5_VISION_RANGE_SETTINGS)).toEqual(types)
    expect(Object.keys(SR5_VISION_COLORS)).toEqual(types)
    for (const vision of Object.keys(SR5_VISION_DETECTION_MODES)) {
      expect(types).toContain(vision)
    }
  })

  it("names a world setting for every range", () => {
    for (const setting of Object.values(SR5_VISION_RANGE_SETTINGS)) {
      expect(setting).toMatch(/^sr5VisionRange[A-Z]/)
    }
  })
})
