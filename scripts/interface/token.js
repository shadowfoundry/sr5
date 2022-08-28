export class SR5Token extends Token {

    /** @override */
    /*
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
    }*/


    /** @override */
    _drawBar(number, bar, data) {
        let mainColorElement = document.getElementById("players");
        let mainColorRGB = window.getComputedStyle(mainColorElement, null).getPropertyValue("border-color");
        let mainColorArray = mainColorRGB.slice(mainColorRGB.indexOf("(") + 1, mainColorRGB.indexOf(")")).split(", ");
        let mainColor = mainColorArray.map(function convertToFloat(number) {
          return number / 255;
        });
        let subColorElement = document.getElementById("sidebar");
        let subColorRGB = window.getComputedStyle(subColorElement, null).getPropertyValue("border-left-color");
        let subColorArray = subColorRGB.slice(subColorRGB.indexOf("(") + 1, subColorRGB.indexOf(")")).split(", ");
        let subColor = subColorArray.map(function convertToFloat(number) {
          return number / 255;
        });

        bar.scale.set(0.95, 0.5);
        const val = Number(data.value);
        let h = Math.max(canvas.dimensions.size / 12, 8);
        if (this.height >= 2) h *= 1.6; // Enlarge the bar for large tokens
        // Draw the bar
        bar.clear().beginFill(PIXI.utils.rgb2hex(subColor), 0.7).lineStyle(0.5, 0x000000, 1);
        // each max draw a green rectangle in background
        for (let index = 0; index < data.max; index++) {
          bar.drawRect(index * (this.w / data.max), 0, this.w / data.max, h);
        }
        // each actual value draw a rectangle from dark green to red
        bar.beginFill(PIXI.utils.rgb2hex(mainColor), 0.7).lineStyle(0.5, 0x000000, 1);
        for (let index = 0; index < Math.clamped(val, 0, data.max); index++) {
          bar.drawRect(index * (this.w / data.max), 0, this.w / data.max, h);
        }
        // Set position
        let posY = number === 0 ? this.h - (h-2) : 2;
        bar.position.set(2.5, (posY));
    }

    /** @override to change effect position, border and background*/
    /*async _drawEffect(src, i, bg, w, tint) {
        let tex = await loadTexture(src, {fallback: 'icons/svg/hazard.svg'});
        let icon = this.effects.addChild(new PIXI.Sprite(tex));
        //w = w*0.8; // Modif
        icon.width = icon.height = w;
        const nr = Math.floor(this.document.height * 5);
        icon.x = Math.floor(i / nr) * w;
        icon.y = (i % nr) * w;
        //icon.x = Math.floor(i / nr) * w + 3; //modif
        //icon.y = (i % nr) * w + 9; //Modif
        if ( tint ) icon.tint = tint;
        bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 2, w - 2, 2);
    }*/

    /** @override to add custom texture **/
    /*async _drawOverlay({src, tint}={}) {
        debugger;
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
    }*/

    // Add a graphical interface on top of token
    static async addTokenLayer(tokenDocument) {
        let container = canvas.tokens.get(tokenDocument.id);
        let tokenOverlay;
        if (tokenDocument.actor.type === "actorGrunt"){
            tokenOverlay = await loadTexture("systems/sr5/img/ui/TokenLayerGrunt.png");
        } else if (tokenDocument.actor.type === "actorSprite" || tokenDocument.actor.type === "actorDevice"){
            tokenOverlay = await loadTexture("systems/sr5/img/ui/TokenLayerSprite.png");
        } else {
            tokenOverlay = await loadTexture("systems/sr5/img/ui/TokenLayerPC.png");
        }
        const textureSize = container.height * canvas.grid.size;
        tokenOverlay.orig = { height: textureSize, width: textureSize, x: -textureSize, y: -textureSize }
        container.sortableChildren = true;
        let sprite = new PIXI.Sprite(tokenOverlay);
        sprite.anchor.set(0.5)
        let icon = await container.addChild(sprite)
        await icon.position.set(container.width * canvas.grid.w *0.5, container.height * canvas.grid.h *0.5);
        icon.zIndex = 1000;
    }
}




