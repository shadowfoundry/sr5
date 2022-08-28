export default class SR5Template extends MeasuredTemplate {
	/**
	 * A factory method to create an AbilityTemplate instance using provided data from an Item5e instance
	 * @param {Item5e} item               The Item object for which to construct the template
	 * @return {AbilityTemplate|null}     The template object, or null if the item does not produce a template
	 */

	static fromItem(item) {
		let target = 0;
		if (item.data.data.category === "grenade") target = item.data.data.blast.radius;
		if (item.data.type === "itemSpell" || item.data.type === "itemPreparation") target = item.data.data.spellAreaOfEffect.value;
		if (item.data.data.type === "grenadeLauncher" || item.data.data.type === "missileLauncher") target = item.data.data.blast.radius;
		const templateShape = "circle";
		if (!templateShape) return null;

		// Prepare template data
		const templateData = {
			t: templateShape,
			flags: { ["item"]: item.id },
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

	drawPreview(event, item) {
		const initialLayer = canvas.activeLayer;
		this.draw();
		this.layer.activate();
		this.layer.preview.addChild(this);
		this.activatePreviewListeners(initialLayer, item);
	}

	/* -------------------------------------------- */

	activatePreviewListeners(initialLayer, item) {
		const handlers = {};
		let moveTime = 0;

		// Update placement (mouse-move)
		handlers.mm = (event) => {
			event.stopPropagation();
			let now = Date.now(); // Apply a 20ms throttle
			if (now - moveTime <= 20) return;
			const center = event.data.getLocalPosition(this.layer);
			const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
			this.data.update({x: snapped.x, y: snapped.y});
			this.refresh();
			moveTime = now;
		};

		// Cancel the workflow (right-click)
		handlers.rc = event => {
			this.layer._onDragLeftCancel(event);
			canvas.stage.off("mousemove", handlers.mm);
			canvas.stage.off("mousedown", handlers.lc);
			canvas.app.view.oncontextmenu = null;
			canvas.app.view.onwheel = null;
			initialLayer.activate();
		};

		// Confirm the workflow (left-click)
		handlers.lc = async (event) => {
			handlers.rc(event);

			// Confirm final snapped position
			const destination = canvas.grid.getSnappedPosition(this.data.x, this.data.y, 2);
			this.data.update(destination);
			canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.data]);
			if (item.type === "itemWeapon"){
				item.rollTest("weapon");
				if (this.actorSheet._minimized) this.actorSheet.maximize();
			}
		};

		// Rotate the template by 3 degree increments (mouse-wheel)
		handlers.mw = (event) => {
			if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
			event.stopPropagation();
			let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
			let snap = event.shiftKey ? delta : 5;
			this.data.update({direction: this.data.direction + (snap * Math.sign(event.deltaY))});;
			this.refresh();
		};

		// Activate listeners
		canvas.stage.on("mousemove", handlers.mm);
		canvas.stage.on("mousedown", handlers.lc);
		canvas.app.view.oncontextmenu = handlers.rc;
		canvas.app.view.onwheel = handlers.mw;
	}
}
