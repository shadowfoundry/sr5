export class SR5Token extends Token {

    /** @override */
    get isVisible() {
        // Only GM users can see hidden tokens
        const gm = game.user.isGM;
        if ( this.data.hidden && !gm ) return false;

        // Some tokens are always visible
        if ( !canvas.sight.tokenVision ) return true;
        if ( this._controlled ) return true;
    
        // Otherwise test visibility against current sight polygons    
        if ( canvas.sight.sources.has(this.sourceId) ) return true;
        const tolerance = Math.min(this.w, this.h) / 4;
        
        // Here is the override: add the caller to function
        return canvas.sight.testVisibility(this.center, {tolerance, object: this}, this);
      }

}


/** @override to change effect position, border and background*/
export const _drawEffect = async function(src, i, bg, w, tint) {
    bg.beginFill(0,0);
    bg.lineStyle(0, 0);
    let tex = await loadTexture(src, {fallback: 'icons/svg/hazard.svg'});
    let icon = this.hud.effects.addChild(new PIXI.Sprite(tex));
    w = w*0.8; // Modif
    icon.width = icon.height = w;
    const nr = Math.floor(this.data.height * 5);
    icon.x = Math.floor(i / nr) * w + 3; //modif
    icon.y = (i % nr) * w + 9; //Modif
    if ( tint ) icon.tint = tint;
    bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 1, w - 1, 2);
}

// Add a graphical interface on top of token 
export const addTokenLayer = async function(tokenDocument) {
    let container = canvas.tokens.get(tokenDocument.id);
    let tokenOverlay;
    if (tokenDocument.actor.type === "actorGrunt"){
        tokenOverlay = await loadTexture("systems/sr5/img/ui/TokenLayerGrunt.png");
    } else if (tokenDocument.actor.type === "actorSprite" || tokenDocument.actor.type === "actorDevice"){
        tokenOverlay = await loadTexture("systems/sr5/img/ui/TokenLayerSprite.png");
    } else {
        tokenOverlay = await loadTexture("systems/sr5/img/ui/TokenLayerPC.png");
    }
    const textureSize = container.data.height * canvas.grid.size;
    tokenOverlay.orig = { height: textureSize, width: textureSize, x: -textureSize, y: -textureSize }
    container.sortableChildren = true;
    let sprite = new PIXI.Sprite(tokenOverlay);
    sprite.anchor.set(0.5)
    let icon = await container.addChild(sprite)
    await icon.position.set(container.data.width * canvas.grid.w *0.5, container.data.height * canvas.grid.h *0.5);
    icon.zIndex = 1000;
}

/** @override to add custom texture **/
export const _drawOverlay = async function({src, tint}={}) {
    if ( !src ) return;

    //Add custom overlay texture on top of token
    const bgtex = await loadTexture("systems/sr5/img/ui/TokenOverlay.png");
    const textureSize = this.data.height * canvas.grid.size;
    bgtex.orig = { height: textureSize, width: textureSize, x: -textureSize, y: -textureSize };
    this.sortableChildren = true;
    let sprite = new PIXI.Sprite(bgtex);
    sprite.anchor.set(0.5)
    sprite.position.set(this.data.width * canvas.grid.w *0.5, this.data.height * canvas.grid.h *0.5);

    //Add the effect logo
    const tex = await loadTexture(src, {fallback: 'icons/svg/hazard.svg'});
    const icon = new PIXI.Sprite(tex);
    const size = Math.min(this.w * 0.6, this.h * 0.6);
    icon.width = icon.height = size;
    icon.position.set((this.w - size) / 2, (this.h - size) / 2);
    icon.alpha = 0.80;
    if ( tint ) icon.tint = tint;
    this.hud.effects.addChild(sprite, icon);
  }