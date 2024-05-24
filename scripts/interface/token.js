export class SR5Token extends Token {

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
        bar.clear().beginFill(new PIXI.Color(subColor).toNumber(), 0.7).lineStyle(0.5, 0x000000, 1);
        // each max draw a green rectangle in background
        for (let index = 0; index < data.max; index++) {
          bar.drawRect(index * (this.w / data.max), 0, this.w / data.max, h);
        }
        // each actual value draw a rectangle from dark green to red
        bar.beginFill(new PIXI.Color(mainColor).toNumber(), 0.7).lineStyle(0.5, 0x000000, 1);
        for (let index = 0; index < Math.clamp(val, 0, data.max); index++) {
          bar.drawRect(index * (this.w / data.max), 0, this.w / data.max, h);
        }
        // Set position
        let posY = number === 0 ? this.h - (h-4) : 2;
        bar.position.set(2.5, (posY));
    }
  
}




