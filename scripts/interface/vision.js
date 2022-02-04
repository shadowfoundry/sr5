import { SR5_EffectArea } from "../system/effectArea.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";

export class SR5SightLayer extends SightLayer {

  /** @override */
  testVisibility(point, {tolerance=2, object=null}={}, caller) {
    const visionSources = this.sources;
    const lightSources = canvas.lighting.sources;
    const d = canvas.dimensions;
    if ( !visionSources.size ) return game.user.isGM;

    // Determine the array of offset points to test
    const t = tolerance;
    const offsets = t > 0 ? [[0, 0],[-t,0],[t,0],[0,-t],[0,t],[-t,-t],[-t,t],[t,t],[t,-t]] : [[0,0]];
    const points = offsets.map(o => new PIXI.Point(point.x + o[0], point.y + o[1]));

    // If the point is inside the buffer region, it may be hidden from view
    if ( !this._inBuffer && !points.some(p => d.sceneRect.contains(p.x, p.y)) ) return false;

    // We require both LOS and FOV membership for a point to be visible
    let hasLOS = false;
    let requireFOV = !canvas.lighting.globalLight;
    let hasFOV = false;

    // Check vision sources
    for ( let source of visionSources.values() ) {
      //Override Start here
      if (caller){
        let callerData = caller.document.actor.data;
        let actor = SR5_EntityHelpers.getRealActorFromID(source.object.document.id);
        if (callerData.data?.initiatives?.astralInit?.isActive && !actor.data.data?.visions?.astral.isActive) return false;
      }
      //End of Override
      if ( !source.active ) continue;               // The source may be currently inactive
      if ( !hasLOS || (!hasFOV && requireFOV) ) {   // Do we need to test for LOS?
        if ( points.some(p => source.los.contains(p.x, p.y)) ) {
          hasLOS = true;
          if ( !hasFOV && requireFOV ) {            // Do we need to test for FOV?
            if ( points.some(p => source.fov.contains(p.x, p.y)) ) {
              hasFOV = true;
            }
          }
        }
      }
      if ( hasLOS && (!requireFOV || hasFOV) ) {    // Did we satisfy all required conditions?
        return true;
      }
    }

    // Check light sources
    for ( let source of lightSources.values() ) {
      if ( !source.active ) continue;               // The source may be currently inactive
      if ( points.some(p => source.containsPoint(p)) ) {
        if ( source.data.vision ) hasLOS = true;
        hasFOV = true;
      }
      if (hasLOS && (!requireFOV || hasFOV)) return true;
    }
    return false;
  }

}

  /** @override */
export const drawSight = function() {
  const c = new PIXI.Container();
  const fov = c.addChild(new PIXI.LegacyGraphics());
  if (this.object?.document?.actor?.data?.data?.vision?.astral && game.settings.get("sr5", "sr5AstralOverlay")) {
    let bgtex = PIXI.Texture.from("systems/sr5/img/ui/astral.jpg");
    fov.beginTextureFill({
      texture: bgtex,
      alpha: 0.8,
    }).drawCircle(this.x, this.y, this.radius).endFill();
    fov.blendMode = 4; //4 ou 18
  } else {
    fov.beginFill(0xFFFFFF).drawCircle(this.x, this.y, this.radius).endFill();
  }
  
  const los = c.addChild(new PIXI.LegacyGraphics());
  los.beginFill(0xFFFFFF).drawShape(this.los).endFill();
  c.mask = los;
  return c;
}