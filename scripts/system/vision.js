import { SR5Token } from "../interface/token.js";

export const astralVision = new foundry.canvas.perception.VisionMode({
	id: "astralvision",
	label: "SR5.VISION.ModeAstralvision",
	canvas: {
		shader: foundry.canvas.rendering.shaders.AmplificationSamplerShader,
		uniforms: { enable: true, contrast: 0, saturation: -0.5, exposure: -0.25, tint: [0.75, 0.75, 1] }
	},
	lighting: {
		background: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.DISABLED },
		illumination: {
			postProcessingModes: ["EXPOSURE"],
			uniforms: { exposure: 0.8 }
		},
		coloration: {
			//postProcessingModes: ["SATURATION", "TINT", "EXPOSURE"], BUG in v11
			uniforms: { saturation: -0.75, exposure: 8.0, tint: [0.75, 0.75, 1] }
		},
		levels: {
			[foundry.canvas.perception.VisionMode.LIGHTING_LEVELS.DIM]: foundry.canvas.perception.VisionMode.LIGHTING_LEVELS.BRIGHT,
			[foundry.canvas.perception.VisionMode.LIGHTING_LEVELS.BRIGHT]: foundry.canvas.perception.VisionMode.LIGHTING_LEVELS.BRIGHTEST
		}
	},
	vision: {
		darkness: { adaptive: false },
		defaults: { attenuation: 0, contrast: 0, saturation: -0.5, brightness: 1 },
		background: { shader: foundry.canvas.rendering.shaders.AmplificationBackgroundVisionShader, uniforms: {tint: [0.75, 0.75, 1]} }
	}
});

class DetectionModeBasicSightSR extends foundry.canvas.perception.DetectionModeDarkvision {
	constructor(){
		super({
			id: "basicSight",
			label: "DETECTION.BasicSight",
			type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT
		})
	}

	/** @override */
	_canDetect(visionSource, target) {
		let detected = super._canDetect(visionSource, target);
		const tgt = target?.document;
		if ((tgt instanceof TokenDocument)) {
			//check if target has astral effect and hide it if true;
			detected = tgt.actor?.effects?.find(e => e.statuses.has("astralInit"));
			return !detected;
		} else return true;
	}
  }

class DetectionModeAstral extends foundry.canvas.perception.DetectionMode {
	constructor(){
		super({
			id: "astralvision",
			label: "SR5.VISION.ModeAstralvision",
			//tokenConfig: false,
			walls: true,
			type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.OTHER
		})
	}

	_canDetect(visionSource, target) {
		return true;
	  }

	/** @override */
	static getDetectionFilter() {
		return this._detectionFilter ??= GlowOverlayFilter.create({
			glowColor: [0, 0.57, 0.99, 1],
			distance: 10,
		})
	}
}

CONFIG.Canvas.detectionModes.astralvision = new DetectionModeAstral();
CONFIG.Canvas.detectionModes.basicSight = new DetectionModeBasicSightSR();