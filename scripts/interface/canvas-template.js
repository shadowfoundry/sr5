import { SR5_RollMessage } from "../rolls/roll-message.js";

export default class SR5Template extends MeasuredTemplate {
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

		if ((item.type === "itemSpell" || item.type === "itemPreparation") && !item.system.resisted) {
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

	drawPreview(event, item, messageId) {
		const initialLayer = canvas.activeLayer;
		this.draw();
		this.layer.activate();
		this.layer.preview.addChild(this);
		this.activatePreviewListeners(initialLayer, item, messageId);
	}

	/* -------------------------------------------- */

	activatePreviewListeners(initialLayer, item, messageId) {
		if (!canvas.ready || !canvas.stage || !canvas.app) return;

		const handlers = {};
		let moveTime = 0;

		// Update placement (mouse-move)
		handlers.mm = (event) => {
			event.stopPropagation();
			let now = Date.now(); // Apply a 20ms throttle
			if (now - moveTime <= 20) return;
			const center = event.data.getLocalPosition(this.layer);
			const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
			this.document.updateSource({x: snapped.x, y: snapped.y});
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
		handlers.lc = (event) => {
			handlers.rc(event);
			if (!canvas.grid) return;
			// Confirm final snapped position
			const destination = canvas.grid.getSnappedPosition(this.document.x, this.document.y, 2);

			const templateData = this.document.toObject();
            templateData.x = destination.x;
            templateData.y = destination.y;

			canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
			if (item.type === "itemWeapon"){
				item.rollTest("weapon");
				if (this.actorSheet._minimized) this.actorSheet.maximize();
			}
			if (messageId) SR5_RollMessage.updateChatButtonHelper(messageId, "templatePlace");
		};

		// Rotate the template by 3 degree increments (mouse-wheel)
		handlers.mw = (event) => {
			if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
			event.stopPropagation();
			let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
			let snap = event.shiftKey ? delta : 5;
			const direction = this.document.direction + snap * Math.sign(event.deltaY);
			this.document.updateSource({direction});
			this.refresh();
		};

		// Activate listeners
		canvas.stage.on("mousemove", handlers.mm);
		canvas.stage.on("mousedown", handlers.lc);
		canvas.app.view.oncontextmenu = handlers.rc;
		canvas.app.view.onwheel = handlers.mw;
	}
}