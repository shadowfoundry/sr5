export default class SR5Template extends MeasuredTemplate {
	/**
	* Track the timestamp when the last mouse move event was captured.
	* @type {number}
	*/
	#moveTime = 0;

	/* -------------------------------------------- */

	/**
	* The initially active CanvasLayer to re-activate after the workflow is complete.
	* @type {CanvasLayer}
	*/
	#initialLayer;

	/* -------------------------------------------- */

	/**
	* Track the bound event handlers so they can be properly canceled later.
	* @type {object}
	*/
	#events;

	/* -------------------------------------------- */

	/**
	 * A factory method to create an AbilityTemplate instance using provided data from an Item5e instance
	 * @param {Item5e} item               The Item object for which to construct the template
	 * @return {AbilityTemplate|null}     The template object, or null if the item does not produce a template
	 */

	static fromItem(item) {
		let target = 0;
		let flags = {};

		//Add base flags
		flags.sr5= {
			"item": item.id,
			"itemUuid": item.uuid,
		}

		if (item.system.category === "grenade" || item.system.type === "grenadeLauncher" || item.system.type === "missileLauncher") {
			target = item.system.blast.radius;
			for (let e of Object.values(item.system.customEffects)){
				if (e.category === "environmentalModifiers" && e.transfer){
					let modifierType = e.target.replace('system.itemsProperties.environmentalMod.','');
					flags.sr5.environmentalModifiers = {[modifierType]: e.value,}
				}
			}
		}

		if ((item.type === "itemSpell" || item.type === "itemPreparation")) {
			target = item.system.spellAreaOfEffect.value;
			//if spell has a transferable effect, add item to canvas template
			for (let e of Object.values(item.system.customEffects)){
				if (e.transfer){
					flags.sr5.itemHasEffect = true;
					continue;
				}
			}
		}

		const templateShape = "circle";
		if (!templateShape) return null;

		//if target is greater than actual map size, recude it
		if (target > Math.min((canvas.scene.dimensions.rect.width/canvas.scene.dimensions.size), (canvas.scene.dimensions.rect.height/canvas.scene.dimensions.size))){
			target = Math.min((canvas.scene.dimensions.rect.width/canvas.scene.dimensions.size), (canvas.scene.dimensions.rect.height/canvas.scene.dimensions.size));
		}

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
		};

		const cls = CONFIG.MeasuredTemplate.documentClass;
		const template = new cls(templateData, {parent: canvas.scene});
		const object = new this(template);
		object.item = item;
		object.actorSheet = item.actor?.sheet || null;
		return object;
	}

	/* -------------------------------------------- */

	drawPreview() {
		const initialLayer = canvas.activeLayer;

		// Draw the template and switch to the template layer
		this.draw();
		this.layer.activate();
		this.layer.preview.addChild(this);

		// Hide the sheet that originated the preview
		this.actorSheet?.minimize();

		// Activate interactivity
		return this.activatePreviewListeners(initialLayer);
	}

	/* -------------------------------------------- */

	/**
   * Activate listeners for the template preview
   * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
   * @returns {Promise}                 A promise that resolves with the final measured template if created.
   */
 	activatePreviewListeners(initialLayer) {
		return new Promise((resolve, reject) => {
			this.#initialLayer = initialLayer;
			this.#events = {
				cancel: this._onCancelPlacement.bind(this),
				confirm: this._onConfirmPlacement.bind(this),
				move: this._onMovePlacement.bind(this),
				resolve,
				reject,
				rotate: this._onRotatePlacement.bind(this)
		};

		// Activate listeners
		canvas.stage.on("mousemove", this.#events.move);
		canvas.stage.on("mousedown", this.#events.confirm);
		canvas.app.view.oncontextmenu = this.#events.cancel;
		canvas.app.view.onwheel = this.#events.rotate;
		});
  	}

  /* -------------------------------------------- */

  	/**
	* Shared code for when template placement ends by being confirmed or canceled.
	* @param {Event} event  Triggering event that ended the placement.
	*/
	async _finishPlacement(event) {
		this.layer._onDragLeftCancel(event);
		canvas.stage.off("mousemove", this.#events.move);
		canvas.stage.off("mousedown", this.#events.confirm);
		canvas.app.view.oncontextmenu = null;
		canvas.app.view.onwheel = null;
		this.#initialLayer.activate();
		await this.actorSheet?.maximize();
	}

	/* -------------------------------------------- */

	/**
	 * Move the template preview when the mouse moves.
	 * @param {Event} event  Triggering mouse event.
	 */
	_onMovePlacement(event) {
		event.stopPropagation();
		let now = Date.now(); // Apply a 20ms throttle
		if ( now - this.#moveTime <= 20 ) return;
		const center = event.data.getLocalPosition(this.layer);
		const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
		this.document.updateSource({x: snapped.x, y: snapped.y});
		this.refresh();
		this.#moveTime = now;
	}

	/* -------------------------------------------- */

	/**
	 * Rotate the template preview by 3˚ increments when the mouse wheel is rotated.
	 * @param {Event} event  Triggering mouse event.
	 */
	_onRotatePlacement(event) {
		if ( event.ctrlKey ) event.preventDefault(); // Avoid zooming the browser window
		event.stopPropagation();
		let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
		let snap = event.shiftKey ? delta : 5;
		const update = {direction: this.document.direction + (snap * Math.sign(event.deltaY))};
		this.document.updateSource(update);
		this.refresh();
	}

	/* -------------------------------------------- */

	/**
	* Confirm placement when the left mouse button is clicked.
	* @param {Event} event  Triggering mouse event.
	*/
	async _onConfirmPlacement(event) {
		await this._finishPlacement(event);
		const destination = canvas.grid.getSnappedPosition(this.document.x, this.document.y, 2);
		this.document.updateSource(destination);
		await this.#events.resolve(canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]));
	}

	/* -------------------------------------------- */

	/**
	 * Cancel placement when the right mouse button is clicked.
	 * @param {Event} event  Triggering mouse event.
	 */
	async _onCancelPlacement(event) {
		await this._finishPlacement(event);
		this.#events.reject();
	}

}