export class SR5SightLayer extends SightLayer {

  /** @override */
  testVisibility(point, {tolerance=2, object=null}={}, caller) {
    //console.log(caller);
    const visionSources = this.sources;
    const lightSources = canvas.lighting.sources;
    const d = canvas.dimensions;
    if ( !visionSources.size ) return game.user.isGM;

    
    //console.log(visionSources);
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
      //console.log(source);
      //Overrid to Manage astral Perception
      if (caller){
        if (caller.document?.actor && source.object?.document?.actor){
          let callerData = caller.document.actor.data;
          let actor = source.object.document.actor.data;
          //console.log(actor);
          if (callerData.data.initiatives.astralInit.isActive && !actor.data.vision.astral) return false
        }
      }

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