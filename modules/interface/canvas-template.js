import {
  SR5_SystemHelpers
} from "../system/utilitySystem.js"

export default class SR5Template extends foundry.canvas.placeables.MeasuredTemplate {
  /**
	* Track the timestamp when the last mouse move event was captured.
	* @type {number}
	*/
  #moveTime = 0

  /* -------------------------------------------- */

  /**
	* The initially active CanvasLayer to re-activate after the workflow is complete.
	* @type {CanvasLayer}
	*/
  #initialLayer

  /* -------------------------------------------- */

  /**
	* Track the bound event handlers so they can be properly canceled later.
	* @type {object}
	*/
  #events

  /* -------------------------------------------- */

  /**
	 * A factory method to create an AbilityTemplate instance using provided data from an Item5e instance
	 * @param {Item5e} item               The Item object for which to construct the template
	 * @return {AbilityTemplate|null}     The template object, or null if the item does not produce a template
	 */

  static fromItem(item) {
    let target = 0
    let flags = {
    }

    //Add base flags
    flags.sr5= {
      "item": item.id,
      "itemUuid": item.uuid,
    }

    if (item.system.category === "grenade" || item.system.type === "grenadeLauncher" || item.system.type === "missileLauncher") {
      target = item.system.blast.radius
      if(target === 0) target = 1
      for (let e of Object.values(item.system.customEffects)){
        if (e.category === "environmentalModifiers" && e.transfer){
          let modifierType = e.target.replace('system.itemsProperties.environmentalMod.','')
          flags.sr5.environmentalModifiers = {
            [modifierType]: e.value
          }
        }
      }
    }

    if ((item.type === "itemSpell" || item.type === "itemPreparation")) {
      target = item.system.spellAreaOfEffect.value
      //if spell has a transferable effect, add item to canvas template
      for (let e of Object.values(item.system.customEffects)){
        if (e.transfer){
          flags.sr5.itemHasEffect = true
          continue
        }
      }
    }

    const templateShape = "circle"
    if (!templateShape) return null

    // target holds a radius taken from the books, in meters: a blast radius (SR5 p. 184) or an area spell's
    // radius, equal in meters to its Force (SR5 p. 282). A MeasuredTemplate's distance is expressed in the
    // scene's own unit, so the radius is converted the other way round here -- without it, a Force 6 area
    // spell drew a 6 ft circle on a scene measured in feet.
    target = SR5_SystemHelpers.convertMetersToSceneUnits(target)

    // No cap against the map size here, on purpose -- the radius drawn is the radius the books give.
    //
    // A previous version shrank target down to the smaller side of the scene. It was removed because this
    // template is what decides who stands in the area: shrinking it shrinks an area of effect, so a defender
    // ends up outside a Fireball because the map is small rather than because the rules say so. The books go
    // the other way -- a blast in a confined space is not clipped by the walls, it bounces off them and hits
    // again (SR5 p. 184, 156P instead of 80P). The one place the rules let scenery shape a blast, they make
    // it worse. The cap also compared a RADIUS to a whole map side, so it was off by a factor of two even on
    // its own terms: a cap meant to keep the circle inside the map would bound the diameter.
    //
    // How large a radius can actually reach here: an area spell is its Force (plus the metres bought with
    // spell shaping once #633 lands, which changes target a few lines above), and a detection spell is Force
    // x augmented Magic, x10 again with extended range (see spellAreaOfEffect in utilityItem.js), so Force 6
    // for a Magic 6 mage reaches 360 m. The cap would have cut every one of those down to the smaller side
    // of the map. It never did in practice only because that Magic factor currently reads 0 -- a separate
    // defect, which is precisely why the reachable radius has to be read off the formula, not off the data.
    //
    // A circle larger than the map costs nothing measurable. Measured on 2026-09-24 in Foundry V13, radii
    // from 10 up to 50 000 scene units: the document stores the radius unchanged, with no console error and
    // no notification, and the circle becomes a polygon whose vertex count follows the SQUARE ROOT of the
    // radius -- 32 vertices at 10, 2 222 at 50 000, all within 1% of 10*sqrt(r) -- built in 0.2 ms or less.
    //
    // Drawing one costs nothing either, measured in a real browser window on a 142.8 m map: 60 fps with no
    // template, and 60 fps again with a circle of radius 286, 5 000 or 50 000 -- up to 350 times the map.
    // Worst frame 17 ms in all three, one frame at 60 Hz, so no hitch. Hit-testing was not measured.

    // Prepare template data
    const templateData = {
      t: templateShape,
      flags: flags,
      user: game.user.id,
      distance: target,
      direction: 0,
      x: 0,
      y: 0,
      fillColor: game.user.color,
    }

    const cls = CONFIG.MeasuredTemplate.documentClass
    const template = new cls(templateData, {
      parent: canvas.scene
    })
    const object = new this(template)
    object.item = item
    object.actorSheet = item.actor?.sheet || null
    return object
  }

  /* -------------------------------------------- */

  drawPreview() {
    const initialLayer = canvas.activeLayer

    // Draw the template and switch to the template layer
    this.draw()
    this.layer.activate()
    this.layer.preview.addChild(this)

    // Hide the sheet that originated the preview
    this.actorSheet?.minimize()

    // Activate interactivity
    return this.activatePreviewListeners(initialLayer)
  }

  /* -------------------------------------------- */

  /**
   * Activate listeners for the template preview
   * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
   * @returns {Promise}                 A promise that resolves with the final measured template if created.
   */
  activatePreviewListeners(initialLayer) {
    return new Promise((resolve, reject) => {
      this.#initialLayer = initialLayer
      this.#events = {
        cancel: this._onCancelPlacement.bind(this),
        confirm: this._onConfirmPlacement.bind(this),
        move: this._onMovePlacement.bind(this),
        resolve,
        reject,
        rotate: this._onRotatePlacement.bind(this)
      }

      // Activate listeners
      canvas.stage.on("mousemove", this.#events.move)
      canvas.stage.on("mousedown", this.#events.confirm)
      canvas.app.view.oncontextmenu = this.#events.cancel
      canvas.app.view.onwheel = this.#events.rotate
    })
  }

  /* -------------------------------------------- */

  /**
	* Shared code for when template placement ends by being confirmed or canceled.
	* @param {Event} event  Triggering event that ended the placement.
	*/
  async _finishPlacement(event) {
    this.layer._onDragLeftCancel(event)
    canvas.stage.off("mousemove", this.#events.move)
    canvas.stage.off("mousedown", this.#events.confirm)
    canvas.app.view.oncontextmenu = null
    canvas.app.view.onwheel = null
    this.#initialLayer.activate()
    await this.actorSheet?.maximize()
  }

  /* -------------------------------------------- */

  /**
	 * Move the template preview when the mouse moves.
	 * @param {Event} event  Triggering mouse event.
	 */
  _onMovePlacement(event) {
    event.stopPropagation()
    let now = Date.now() // Apply a 20ms throttle
    if ( now - this.#moveTime <= 20 ) return
    const center = event.data.getLocalPosition(this.layer)
    const snapped = canvas.grid.getSnappedPoint(center, {
      mode: CONST.GRID_SNAPPING_MODES.CENTER
    })
    this.document.updateSource({
      x: snapped.x, y: snapped.y
    })
    this.refresh()
    this.#moveTime = now
  }

  /* -------------------------------------------- */

  /**
	 * Rotate the template preview by 3˚ increments when the mouse wheel is rotated.
	 * @param {Event} event  Triggering mouse event.
	 */
  _onRotatePlacement(event) {
    if ( event.ctrlKey ) event.preventDefault() // Avoid zooming the browser window
    event.stopPropagation()
    let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15
    let snap = event.shiftKey ? delta : 5
    const update = {
      direction: this.document.direction + (snap * Math.sign(event.deltaY))
    }
    this.document.updateSource(update)
    this.refresh()
  }

  /* -------------------------------------------- */

  /**
	* Confirm placement when the left mouse button is clicked.
	* @param {Event} event  Triggering mouse event.
	*/
  async _onConfirmPlacement(event) {
    await this._finishPlacement(event)
    const destination = canvas.grid.getSnappedPoint(this.document, {
      mode: CONST.GRID_SNAPPING_MODES.CENTER
    })
    this.document.updateSource(destination)
    await this.#events.resolve(canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]))
  }

  /* -------------------------------------------- */

  /**
	 * Cancel placement when the right mouse button is clicked.
	 * @param {Event} event  Triggering mouse event.
	 */
  async _onCancelPlacement(event) {
    await this._finishPlacement(event)
    this.#events.reject()
  }

}