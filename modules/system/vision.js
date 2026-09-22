const VisionMode = foundry.canvas.perception.VisionMode
const DetectionMode = foundry.canvas.perception.DetectionMode
const DetectionModeDarkvision = foundry.canvas.perception.DetectionModeDarkvision
const DetectionModeInvisibility = foundry.canvas.perception.DetectionModeInvisibility
const AmplificationSamplerShader = foundry.canvas.rendering.shaders.AmplificationSamplerShader
const AmplificationBackgroundVisionShader = foundry.canvas.rendering.shaders.AmplificationBackgroundVisionShader
const ColorAdjustmentsSamplerShader = foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader
const WaveBackgroundVisionShader = foundry.canvas.rendering.shaders.WaveBackgroundVisionShader
const WaveColorationVisionShader = foundry.canvas.rendering.shaders.WaveColorationVisionShader
const GlowOverlayFilter = foundry.canvas.rendering.filters.GlowOverlayFilter

// Vision type of the actor (SR5.visionTypes) -> vision mode of the token
export const SR5_TOKEN_VISION_MODES = {
  astral: "astralvision",
  lowLight: "lowLight",
  thermographic: "thermographic",
  ultrasound: "ultrasound",
}

// Vision type of the actor -> world setting holding its range, in scene units
export const SR5_VISION_RANGE_SETTINGS = {
  astral: "sr5VisionRangeAstral",
  lowLight: "sr5VisionRangeLowLight",
  thermographic: "sr5VisionRangeThermographic",
  ultrasound: "sr5VisionRangeUltrasound",
}

// Detection mode carried by a vision type, added on top of the token's basic sight
export const SR5_VISION_DETECTION_MODES = {
  astral: "astralvision",
  ultrasound: "ultrasound",
}

// Tint of the vision cone, per vision type
export const SR5_VISION_COLORS = {
  astral: "#303c50",
  lowLight: null,
  thermographic: "#4a2410",
  ultrasound: "#1b2c38",
}

/**
 * Range of a vision type, in scene units. 0 means "only what is lit".
 * @param {string} vision key of SR5.visionTypes
 * @returns {number}
 */
export function getVisionRange(vision) {
  const setting = SR5_VISION_RANGE_SETTINGS[vision]
  if (!setting) return 0
  const range = game.settings.get("sr5", setting)
  return Number.isNumeric(range) ? Math.max(0, Number(range)) : 0
}

/* -------------------------------------------- */
/*  Vision modes                                */
/* -------------------------------------------- */

// Astral perception : SR5 p. 313
export const astralVision = new VisionMode({
  id: "astralvision",
  label: "SR5.VISION.ModeAstralvision",
  canvas: {
    shader: AmplificationSamplerShader,
    uniforms: {
      enable: true, contrast: 0, saturation: -0.5, exposure: -0.25, tint: [0.75, 0.75, 1]
    }
  },
  lighting: {
    background: {
      visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED
    },
    illumination: {
      postProcessingModes: ["EXPOSURE"],
      uniforms: {
        exposure: 0.8
      }
    },
    coloration: {
      //postProcessingModes: ["SATURATION", "TINT", "EXPOSURE"], BUG in v11
      uniforms: {
        saturation: -0.75, exposure: 8.0, tint: [0.75, 0.75, 1]
      }
    },
    levels: {
      [VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT,
      [VisionMode.LIGHTING_LEVELS.BRIGHT]: VisionMode.LIGHTING_LEVELS.BRIGHTEST
    }
  },
  vision: {
    darkness: {
      adaptive: false
    },
    defaults: {
      attenuation: 0, contrast: 0, saturation: -0.5, brightness: 1
    },
    background: {
      shader: AmplificationBackgroundVisionShader, uniforms: {
        tint: [0.75, 0.75, 1]
      }
    }
  }
})

// Low-light vision : sees in dim light as if in full light, but not in total darkness (SR5 p. 176)
export const lowLightVision = new VisionMode({
  id: "lowLight",
  label: "SR5.LowLightVision",
  canvas: {
    shader: AmplificationSamplerShader,
    uniforms: {
      saturation: -0.35, tint: [0.45, 0.82, 0.45]
    }
  },
  lighting: {
    background: {
      postProcessingModes: ["SATURATION", "EXPOSURE"],
      uniforms: {
        saturation: -0.35, exposure: 1.2, tint: [0.45, 0.82, 0.45]
      }
    },
    illumination: {
      postProcessingModes: ["SATURATION"],
      uniforms: {
        saturation: -0.35
      }
    },
    coloration: {
      postProcessingModes: ["SATURATION", "EXPOSURE"],
      uniforms: {
        saturation: -0.35, exposure: 1.2, tint: [0.45, 0.82, 0.45]
      }
    },
    levels: {
      [VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT
    }
  },
  vision: {
    darkness: {
      adaptive: false
    },
    defaults: {
      attenuation: 0, contrast: 0, saturation: -0.35, brightness: 0.5
    },
    background: {
      shader: AmplificationBackgroundVisionShader, uniforms: {
        tint: [0.45, 0.82, 0.45]
      }
    }
  }
})

// Thermographic vision : sees heat, so it works in the dark and through most smoke (SR5 p. 176)
export const thermographicVision = new VisionMode({
  id: "thermographic",
  label: "SR5.ThermographicVision",
  canvas: {
    shader: ColorAdjustmentsSamplerShader,
    uniforms: {
      contrast: 0.25, saturation: -0.8, exposure: -0.1, tint: [1, 0.6, 0.35]
    }
  },
  lighting: {
    background: {
      visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED,
      postProcessingModes: ["SATURATION", "TINT"],
      uniforms: {
        saturation: -0.8, tint: [1, 0.6, 0.35]
      }
    },
    illumination: {
      postProcessingModes: ["SATURATION"],
      uniforms: {
        saturation: -0.8
      }
    },
    coloration: {
      postProcessingModes: ["SATURATION", "TINT"],
      uniforms: {
        saturation: -0.8, tint: [1, 0.6, 0.35]
      }
    },
    levels: {
      [VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT
    }
  },
  vision: {
    darkness: {
      adaptive: false
    },
    defaults: {
      attenuation: 0, contrast: 0.2, saturation: -0.8, brightness: 0.65
    },
    background: {
      shader: AmplificationBackgroundVisionShader, uniforms: {
        tint: [1, 0.6, 0.35]
      }
    }
  }
})

// Ultrasound : a sound picture, blind to colour and light, stopped by walls (SR5 p. 449)
export const ultrasoundVision = new VisionMode({
  id: "ultrasound",
  label: "SR5.UltrasoundVision",
  canvas: {
    shader: ColorAdjustmentsSamplerShader,
    uniforms: {
      contrast: 0.2, saturation: -1, exposure: -0.3
    }
  },
  lighting: {
    background: {
      visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED
    },
    illumination: {
      visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED
    },
    coloration: {
      visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED
    },
    darkness: {
      visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED
    }
  },
  vision: {
    darkness: {
      adaptive: false
    },
    defaults: {
      attenuation: 0, contrast: 0.2, saturation: -1, brightness: 0.8
    },
    background: {
      shader: WaveBackgroundVisionShader
    },
    coloration: {
      shader: WaveColorationVisionShader
    }
  }
}, {
  animated: true
})

/* -------------------------------------------- */
/*  Detection modes                             */
/* -------------------------------------------- */

class DetectionModeBasicSightSR extends DetectionModeDarkvision {
  constructor(){
    super({
      id: "basicSight",
      label: "DETECTION.BasicSight",
      type: DetectionMode.DETECTION_TYPES.SIGHT
    })
  }

  /** @override */
  _canDetect(visionSource, target) {
    let detected = super._canDetect(visionSource, target)
    const tgt = target?.document
    if ((tgt instanceof foundry.documents.TokenDocument)) {
      //check if target has astral effect and hide it if true;
      detected = tgt.actor?.effects?.find(e => e.statuses.has("astralInit"))
      return !detected
    } else return true
  }
}

class DetectionModeAstral extends DetectionMode {
  constructor(){
    super({
      id: "astralvision",
      label: "SR5.VISION.ModeAstralvision",
      //tokenConfig: false,
      walls: true,
      type: DetectionMode.DETECTION_TYPES.OTHER
    })
  }

  _canDetect(_visionSource, _target) {
    return true
  }

  /** @override */
  static getDetectionFilter() {
    return this._detectionFilter ??= GlowOverlayFilter.create({
      glowColor: [0, 0.57, 0.99, 1],
      distance: 10,
    })
  }
}

// Ultrasound paints a sound picture of what optics cannot see : it reveals someone hidden
// by an Invisibility spell, but it stops at walls (SR5 p. 449).
class DetectionModeUltrasound extends DetectionModeInvisibility {
  constructor(){
    super({
      id: "ultrasound",
      label: "SR5.UltrasoundVision",
      walls: true,
      angle: true,
      type: DetectionMode.DETECTION_TYPES.OTHER
    })
  }

  /** @override */
  static getDetectionFilter() {
    return this._detectionFilter ??= GlowOverlayFilter.create({
      glowColor: [0.4, 0.75, 0.9, 1],
      distance: 10,
    })
  }
}

/* -------------------------------------------- */
/*  Registration                                */
/* -------------------------------------------- */

/**
 * Replace the vision and detection modes of the core software by those of Shadowrun.
 * Called once at init.
 */
export function registerVisionModes() {
  const modes = CONFIG.Canvas.visionModes
  // Vision modes that have no meaning in Shadowrun are removed from the token configuration
  for (const id of ["darkvision", "monochromatic", "tremorsense", "lightAmplification"]) delete modes[id]
  // Normal metahuman sight
  if (modes.basic) modes.basic.label = "SR5.VISION.ModeNatural"
  modes.lowLight = lowLightVision
  modes.thermographic = thermographicVision
  modes.ultrasound = ultrasoundVision
  modes.astralvision = astralVision

  const detection = CONFIG.Canvas.detectionModes
  detection.astralvision = new DetectionModeAstral()
  detection.basicSight = new DetectionModeBasicSightSR()
  detection.ultrasound = new DetectionModeUltrasound()
  // Detection modes of the core software that no Shadowrun vision uses
  for (const id of ["seeInvisibility", "senseInvisibility", "feelTremor"]) {
    if (detection[id]) detection[id].updateSource({
      tokenConfig: false
    })
  }
}
