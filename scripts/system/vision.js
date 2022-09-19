import { SR5Token } from "../interface/token.js";

export const astralVision = new VisionMode({
	id: "astralvision",
	label: "SR5.VISION.ModeAstralvision",
	canvas: {
		shader: AmplificationSamplerShader,
		uniforms: { enable: true, contrast: 0, saturation: -0.5, exposure: -0.25, tint: [0.38, 0.8, 0.38] }
	},
	lighting: {
		background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
		illumination: {
			postProcessingModes: ["EXPOSURE"],
			uniforms: { exposure: 0.8 }
		},
		coloration: {
			postProcessingModes: ["SATURATION", "TINT", "EXPOSURE"],
			uniforms: { saturation: -0.75, exposure: 8.0, tint: [0.38, 0.8, 0.38] }
		},
		levels: {
			[VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT,
			[VisionMode.LIGHTING_LEVELS.BRIGHT]: VisionMode.LIGHTING_LEVELS.BRIGHTEST
		}
	},
	vision: {
		darkness: { adaptive: false },
		defaults: { attenuation: 0, contrast: 0, saturation: -0.5, brightness: 1 },
		background: { shader: AmplificationBackgroundVisionShader, uniforms: {tint: [0.5, 0.5, 0.5]} }
	}
});

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
}

CONFIG.Canvas.detectionModes.astralvision = new DetectionModeAstral();