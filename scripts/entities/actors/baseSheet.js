import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_UtilityItem } from "../items/utilityItem.js";
import { SR5_CharacterUtility } from "./utilityActor.js";
import { SR5_SocketHandler } from "../../socket.js";
import SR5_PanDialog from "../../interface/pan-dialog.js";
import { SR5 } from "../../config.js";
import { SR5Actor } from "./entityActor.js";
import { SR5_ActorHelper } from "./entityActor-helpers.js";
import { SR5_RollMessage } from "../../rolls/roll-message.js";
import { SR5_PrepareRollTest } from "../../rolls/roll-prepare.js";
import { SR5Combat } from "../../system/srcombat.js";
import { SRActorSheetConfig } from "../../interface/sheet-config.js";
import { computeLayout } from "../../interface/compute-layout.js";
import { SR5SheetConfigDialog } from "../../interface/sheet-config-dialog.js";

/**
 * Extend the basic ActorSheet class to do all the SR5 things!
 * This sheet is an Abstract layer which is not used.
 *
 * @type {ActorSheetV2}
 */

export class ActorSheetSR5 extends foundry.applications.api.HandlebarsApplicationMixin(
	foundry.applications.sheets.ActorSheetV2
) {
	static MODES = Object.freeze({ PLAY: 1, EDIT: 2 });

	_mode = ActorSheetSR5.MODES.EDIT;

	get isPlayMode() { return this._mode === ActorSheetSR5.MODES.PLAY; }
	get isEditMode() { return this._mode === ActorSheetSR5.MODES.EDIT; }

	constructor(...args) {
		super(...args);
	}

	static DEFAULT_OPTIONS = {
		classes: ["app", "window-app", "sr5", "actor"],
		form: { submitOnChange: true },
		dragDrop: [{ dragSelector: "li.item, div.draggableAttribute", dropSelector: null }],
		actions: {
			actorConfig: ActorSheetSR5._onActorConfig,
			toggleMode: ActorSheetSR5._onToggleMode,
			configureSheet: ActorSheetSR5._onConfigureSheet,
		},
	};

	get title() {
		return this.document.name;
	}

	/** @override — Foundry's _onClickTab uses event.target which misses when clicking SVG icons inside <a> */
	_onClickTab(event) {
		const button = event.target.closest("[data-tab]");
		if (!button || button.classList.contains("active") || (event.button !== 0)) return;
		const tab = button.dataset.tab;
		const group = button.dataset.group;
		this.changeTab(tab, group, { event });
	}

	_getHeaderControls() {
		const controls = super._getHeaderControls();
		if (this.actor?.isOwner && (this.actor.type === "actorPc" || this.actor.type === "actorGrunt")) {
			controls.unshift({
				action: "actorConfig",
				icon: "fas fa-tools",
				label: "",
			});
		}
		return controls;
	}

	static _onActorConfig(event, target) {
		SRActorSheetConfig.buildDialog(this.actor);
	}

	static async _onToggleMode(event) {
		event.preventDefault();
		if (!this.isEditable) return;
		const newMode = this.isPlayMode ? ActorSheetSR5.MODES.EDIT : ActorSheetSR5.MODES.PLAY;
		game.user?.setFlag("sr5", `playMode.${this.actor.id}`, newMode);
		await this.render({ mode: newMode });
	}

	static _onConfigureSheet(event) {
		event.preventDefault();
		SR5SheetConfigDialog.open(this.actor);
	}

	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		if (options.mode && this.isEditable) this._mode = options.mode;
		else if (options.renderContext === `create${this.document.documentName}`) {
			this._mode = ActorSheetSR5.MODES.EDIT;
		} else if (!options.mode && this.document?.id) {
			const saved = game.user?.getFlag("sr5", `playMode.${this.document.id}`);
			if (saved) this._mode = saved;
		}
	}

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const actorData = this.actor.toObject(false);
		context.actor = actorData;
		context.system = actorData.system;
		context.items = actorData.items;
		context.owner = this.actor.isOwner;
		context.editable = this.isEditable;
		context.filters = this._filters || {};
		context.lists = actorData.system.lists;
		context.isPlay = this.isPlayMode;
		// Provide cssClass for template compatibility
		context.cssClass = this.document.isOwner ? "editable" : "locked";

		// Sort Owned Items
		for (let i of context.items) {
			const item = this.actor.items.get(i._id);
			if (item) i.labels = item.labels;
		}
		context.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));

		// Compute dynamic layout (SR6-style panel/tab/block system)
		context.layout = this._computeSheetLayout(this.actor);

		return context;
	}

	/**
	 * Compute the panel/tab layout and sync Foundry's tabGroups.
	 * Each panel gets its own independent tab group.
	 */
	_computeSheetLayout(actor) {
		const prefs = actor.system.sheetPreferences ?? {};
		const layout = computeLayout(this.constructor.name, prefs);

		// Sync Foundry's tabGroups — one independent group per panel
		for (const panel of layout.panels) {
			const group = panel.group;
			if (!this.tabGroups[group] && panel.tabs.length > 0) {
				this.tabGroups[group] = panel.tabs[0].id;
			}
			const activeId = this.tabGroups[group];
			if (activeId && !panel.tabs.some(t => t.id === activeId)) {
				this.tabGroups[group] = panel.tabs[0]?.id ?? null;
			}
			for (const tab of panel.tabs) {
				tab.cssClass = tab.id === this.tabGroups[group] ? "active" : "";
			}
		}

		// Clean up stale groups
		const validGroups = new Set(layout.panels.map(p => p.group));
		for (const key of Object.keys(this.tabGroups)) {
			if (!validGroups.has(key)) delete this.tabGroups[key];
		}

		return layout;
	}

	async _renderFrame(options) {
		const frame = await super._renderFrame(options);
		const header = frame.querySelector(".window-header");
		const closeButton = header?.querySelector('[data-action="close"]');

		// Play/Edit toggle button
		if (this.isEditable) {
			const toggleBtn = document.createElement("button");
			toggleBtn.type = "button";
			toggleBtn.classList.add("header-control", "icon", "fa-solid");
			toggleBtn.dataset.action = "toggleMode";
			if (closeButton) closeButton.before(toggleBtn);
			else header?.appendChild(toggleBtn);
		}

		// Sheet config button (visibility toggled in _onRender based on mode)
		if (this.actor?.isOwner) {
			const configBtn = document.createElement("button");
			configBtn.type = "button";
			configBtn.classList.add("header-control", "icon", "fa-solid", "fa-tools");
			configBtn.dataset.action = "configureSheet";
			configBtn.dataset.tooltip = "Configure Sheet";
			if (closeButton) closeButton.before(configBtn);
			else header?.appendChild(configBtn);
		}

		return frame;
	}

	_onRender(context, options) {
		super._onRender(context, options);
		const element = this.element;

		// Play/Edit mode classes
		element.classList.toggle("sr-mode-edit", this.isEditMode);
		element.classList.toggle("sr-mode-play", this.isPlayMode);

		// Update toggle button icon
		const toggleBtn = element.querySelector('[data-action="toggleMode"]');
		if (toggleBtn) {
			toggleBtn.classList.toggle("fa-lock", this.isPlayMode);
			toggleBtn.classList.toggle("fa-lock-open", this.isEditMode);
			toggleBtn.dataset.tooltip = this.isPlayMode ? "SR5.SwitchToEdit" : "SR5.SwitchToPlay";
		}

		// Show/hide config button based on mode
		const configBtn = element.querySelector('[data-action="configureSheet"]');
		if (configBtn) configBtn.style.display = this.isPlayMode ? "none" : "";

		// Disable form inputs in duplicate block instances to prevent FormDataExtended conflicts.
		// When the same block appears multiple times, only the first instance keeps its name attributes;
		// subsequent instances become read-only mirrors.
		const seenBlocks = new Set();
		for (const blockEl of element.querySelectorAll("[data-block-id]")) {
			const blockId = blockEl.dataset.blockId;
			if (seenBlocks.has(blockId)) {
				for (const input of blockEl.querySelectorAll("input[name], select[name], textarea[name]")) {
					input.removeAttribute("name");
					input.setAttribute("tabindex", "-1");
				}
			} else {
				seenBlocks.add(blockId);
			}
		}

		// Activate initial tabs for all groups (AppV2 doesn't auto-activate on render)
		for (const [group, tab] of Object.entries(this.tabGroups)) {
			if (tab) this.changeTab(tab, group, { force: true, updatePosition: false });
		}

		// Tab nav click handlers — explicit listeners because data-action="tab" doesn't
		// work reliably with SVG icons inside <a> elements (event.target is the SVG, not the <a>)
		element.querySelectorAll(".tabs [data-tab][data-action='tab']").forEach(link => {
			link.addEventListener("click", (event) => {
				event.preventDefault();
				event.stopPropagation();
				const tab = link.dataset.tab;
				const group = link.dataset.group;
				if (tab && group && !link.classList.contains("active")) {
					this.changeTab(tab, group, { event });
				}
			});
		});

		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Helper for binding events
		const on = (sel, evt, fn) => element.querySelectorAll(sel).forEach(el => el.addEventListener(evt, fn));

		// Owned Item management
		on(".item-create", "click", this._onItemCreate.bind(this));
		on(".item-clone", "click", this._onItemClone.bind(this));
		on(".item-edit", "click", this._onItemEdit.bind(this));
		on(".item-delete", "click", this._onItemDelete.bind(this));
		on(".item-management", "mousedown", this._onItemManagement.bind(this));
		on(".subItem", "click", this._onManageSubItem.bind(this));
		//Edit item value from actor sheet
		on(".edit-value", "change", this._onEditItemValue.bind(this));
		on(".select-value", "change", this._onEditItemValue.bind(this));
		on(".toggle-value", "click", this._onEditItemValue.bind(this));
		on(".changeValueByClick", "mousedown", this._onChangeValueByClick.bind(this));
		//
		on(".toggle-actorValue", "click", this._onEditActorValue.bind(this));
		//Choose controler
		on(".chooseControler", "click", this._onChooseControler.bind(this));
		//Recharge les armes
		on(".reload-ammo", "mousedown", this._onReloadAmmo.bind(this));
		//Reset weapon recoil
		on(".resetRecoil", "click", this._onResetRecoil.bind(this));
		//Reset drug addiction
		on(".resetAddiction", "click", this._onResetAddiction.bind(this));
		//Reboot le deck
		on(".reset-deck", "click", this._onRebootDeck.bind(this));
		// Déplie les infos
		on(".deplie", "click", this._onItemSummary.bind(this));
		// Déplie les infos matricielles
		on(".deplieMatrix", "click", this._onMatrixSummary.bind(this));
		// Lancés de dés
		on(".sr-roll", "click", this._onRoll.bind(this));
		on(".sr-rollGrenade", "click", this._onRollGrenade.bind(this));
		// Summon Spirit
		on(".sidekickCreate", "click", this._OnSidekickCreate.bind(this));
		on(".sidekickDestroy", "click", this._OnSidekickDestroy.bind(this));
		// Dismiss Actor
		on(".dismissActor", "click", this._OnDismissActor.bind(this));
		// Switch vision
		on(".vision-switch", "click", this._onVisionSwitch.bind(this));
		// Switch initiatives
		on(".init-switch", "click", this._onInitiativeSwitch.bind(this));
		// Add item to PAN
		on(".addItemToPan", "click", this._onAddItemToPan.bind(this));
		on(".deleteItemFromPan", "click", this._onDeleteItemFromPan.bind(this));
		// Stop jamming signals
		on(".stop-jamming", "click", this._onStopJamming.bind(this));
		// Change matrix user mode
		on(".changeMatrixMode", "change", this._onChangeMatrixMode.bind(this));
		// Change matrix silent mode
		on(".changeSilentMode", "click", this._onChangeSilentMode.bind(this));

		// Hide or display some information by clicking on headers allowing it
		element.querySelectorAll(".hidden").forEach(el => el.style.display = "none");
		on(".filtre-skill", "click", (event) => {
			event.preventDefault();
			this._shownUntrainedSkills = !this._shownUntrainedSkills;
			this.render();
		});
		on(".filtre-groupe", "click", (event) => {
			event.preventDefault();
			this._shownUntrainedGroups = !this._shownUntrainedGroups;
			this.render();
		});
		on(".filtre-matrixActions", "click", (event) => {
			event.preventDefault();
			this._shownNonRollableMatrixActions = !this._shownNonRollableMatrixActions;
			this.render();
		});
		on(".filterMatrixPrograms", "click", (event) => {
			event.preventDefault();
			this._shownInactiveMatrixPrograms = !this._shownInactiveMatrixPrograms;
			this.render();
		});
		on(".filterNuyenGains", "click", (event) => {
			event.preventDefault();
			this._shownNuyenGains = !this._shownNuyenGains;
			this.render();
		});
		on(".filterNuyenExpenses", "click", (event) => {
			event.preventDefault();
			this._shownNuyenExpenses = !this._shownNuyenExpenses;
			this.render();
		});
		on(".filterKarmaGains", "click", (event) => {
			event.preventDefault();
			this._shownKarmaGains = !this._shownKarmaGains;
			this.render();
		});
		on(".filterKarmaExpenses", "click", (event) => {
			event.preventDefault();
			this._shownKarmaExpenses = !this._shownKarmaExpenses;
			this.render();
		});
		// Light color indicator (for dark headers)
		if (!this._shownUntrainedSkills) element.querySelectorAll(".filtre-skill").forEach(el => { el.classList.toggle("unfoldLight"); el.classList.toggle("foldLight"); });
		if (!this._shownUntrainedGroups) element.querySelectorAll(".filtre-groupe").forEach(el => { el.classList.toggle("unfoldLight"); el.classList.toggle("foldLight"); });
		if (!this._shownNonRollableMatrixActions) element.querySelectorAll(".filtre-matrixActions").forEach(el => { el.classList.toggle("unfoldLight"); el.classList.toggle("foldLight"); });
		if (!this._shownInactiveMatrixPrograms) element.querySelectorAll(".filterMatrixPrograms").forEach(el => { el.classList.toggle("unfoldLight"); el.classList.toggle("foldLight"); });
		// Dark color indicator (for light headers)
		if (!this._shownNuyenExpenses) element.querySelectorAll(".filterNuyenExpenses").forEach(el => { el.classList.toggle("unfoldDark"); el.classList.toggle("foldDark"); });
		if (!this._shownNuyenGains) element.querySelectorAll(".filterNuyenGains").forEach(el => { el.classList.toggle("unfoldDark"); el.classList.toggle("foldDark"); });
		if (!this._shownKarmaExpenses) element.querySelectorAll(".filterKarmaExpenses").forEach(el => { el.classList.toggle("unfoldDark"); el.classList.toggle("foldDark"); });
		if (!this._shownKarmaGains) element.querySelectorAll(".filterKarmaGains").forEach(el => { el.classList.toggle("unfoldDark"); el.classList.toggle("foldDark"); });

		// Help Display
		element.querySelectorAll("[data-helpTitle]").forEach(el => {
			el.addEventListener("mouseover", this._displayHelpText.bind(this));
			el.addEventListener("mouseout", this._hideHelpText.bind(this));
		});

		// Quick monitor reset on monitor's name right-click
		on(".monitorReset", "mousedown", (e) => {
			e.preventDefault();
			let monitor = e.currentTarget.dataset.target;
			if (e.which === 1){
				if (monitor === "stun" || monitor === "physical") this.actor.rollTest("healing", monitor);
			}
			if ((e.which === 3 || e.button === 2)) {
				let actorData = foundry.utils.duplicate(this.actor);
				foundry.utils.setProperty(actorData, `system.conditionMonitors.${monitor}.actual.base`, 0);
				this.actor.update(actorData);
			}
		});

		// Gestion des cases de dégats
		on(".boxes:not(.box-disabled)", "click", (ev) => {
			let actorData = foundry.utils.duplicate(this.actor);
			let index = Number(ev.currentTarget.dataset.index);
			let target = ev.currentTarget.closest(".SR-MoniteurCases").dataset.target;

			let value = foundry.utils.getProperty(actorData, target);
			if (value == index + 1)
				// If the last one was clicked, decrease by 1
				foundry.utils.setProperty(actorData, target, index);
			// Otherwise, value = index clicked
			else foundry.utils.setProperty(actorData, target, index + 1);

			if (target == 'system.conditionMonitors.physical.actual.base' && foundry.utils.getProperty(actorData, 'system.conditionMonitors.overflow.actual.value')) {
				if (actorData.system.conditionMonitors.physical.actual.value < actorData.system.conditionMonitors.physical.value.value) {
					foundry.utils.setProperty(actorData, 'system.conditionMonitors.overflow.actual.base', 0);
				}
			}

			this.actor.update(actorData);
		});
	}

	async _onDragStart(event) {
		if (!canvas.ready) return;
		let dragData = {};
		const target = event.currentTarget;

		if (target.dataset.matrixattribute){
			dragData.value = target.dataset.matrixattribute;
			dragData.valueFromCollection = target.id;
			event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
			return;
		}

		if (target.dataset.dropmatrixattribute){
			dragData.value = target.dataset.droppedvalue;
			dragData.valueFromAttribute = target.dataset.dropmatrixattribute;
			event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
			return;
		}

		if (target.dataset.skill){
			dragData.type = "Skill";
			dragData.subType = target.dataset.skill;
			dragData.actor = this.actor;
			event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
		}

		if (target.dataset.matrix){
			dragData.type = "MatrixAction";
			dragData.subType = target.dataset.matrix;
			event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
		}

		if (target.dataset.resonance){
			dragData.type = "ResonanceAction";
			dragData.subType = target.dataset.resonance;
			event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
		}

		return super._onDragStart(event);
	}

	async _onDrop(event) {
		event.preventDefault();
		event.stopPropagation();
		let actorData = foundry.utils.duplicate(this.actor);
		const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));
		const dropZone = event.target.closest('[data-dropmatrixattribute]');

		if (dropData.valueFromCollection){
			if (!dropZone) return;
			let existingValue = parseInt(dropZone.dataset.droppedvalue);
			if (existingValue > 0) {
				for (let [key, value] of Object.entries(actorData.system.matrix.attributesCollection)){
					if (value === existingValue){
						foundry.utils.setProperty(actorData, `system.matrix.attributesCollection.${key}isSet`, false);
						break;
					}
				}
			}
			foundry.utils.setProperty(actorData, dropZone.dataset.dropmatrixattribute, parseInt(dropData.value));
			foundry.utils.setProperty(actorData, `system.matrix.attributesCollection.${dropData.valueFromCollection}`, true);
			await this.actor.update(actorData);
			return;
		}

		if (dropData.valueFromAttribute){
			if (!dropZone) return;
			foundry.utils.setProperty(actorData, dropZone.dataset.dropmatrixattribute, parseInt(dropData.value));
			foundry.utils.setProperty(actorData, dropData.valueFromAttribute, parseInt(dropZone.dataset.droppedvalue));
			//Manage action
			let actorId = (this.actor.isToken ? this.actor.token.id : this.actor.id);
			actorData.system.specialProperties.actions.free.current -=1;
			await this.actor.update(actorData);
			SR5Combat.changeActionInCombat(actorId, [{type: "free", value: 1, source:"switchAttributes"}], false);
			return;
		}

		await super._onDrop(event);
	}

	// Handles initiative switching from the derived attributes tab
	_onInitiativeSwitch(event) {
		let wantedInitiative = event.currentTarget.dataset.binding;
		SR5_CharacterUtility.switchToInitiative(this.actor, wantedInitiative);
		//special case for materialization button on spirit sheet
		if (event.target.id === "materializeIcon"){
			let item;
			for (let i of this.actor.items){
				if (i.system.systemEffects.find(e => e.value === "materialization")) item = i;
			}
			if (item){
				let value = foundry.utils.getProperty(item, "system.isActive");
				item.update({"system.isActive": !value})
			}
		}
	}

	_onVisionSwitch(event){
		let wantedVision = event.currentTarget.dataset.binding;
		SR5_CharacterUtility.switchVision(this.actor, wantedVision);
	}

	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onItemCreate(event) {
		event.preventDefault();

		const header = event.currentTarget;
		const type = header.dataset.type;
		const itemName = SR5_UtilityItem.findDisplayName(type);
		if (!itemName) {
			SR5_SystemHelpers.srLog(2, `Aborting item creation of '${type}' type`);
			return false;
		}
		if (type === "itemTradition"){
			for (let i of this.actor.items){
				if (i.type === "itemTradition") return ui.notifications.warn(game.i18n.localize('SR5.WARN_OnlyOneTradition'));
			}
		}

		// v13: spread dataset to plain object (DOMStringMap doesn't deep-clone reliably)
		const systemData = {...header.dataset};
		delete systemData.title;
		delete systemData.type;

		if (header.dataset.subtype) {
			systemData.type = header.dataset.subtype;
			delete systemData.subtype;
		} else if (header.dataset.weaponcategory){
			systemData.category = header.dataset.weaponcategory;
			delete systemData.weaponcategory;
		}

		const itemData = {
			name: `${itemName.capitalize()}`,
			type: type,
			system: systemData,
			img: `systems/sr5/img/items/${type}.svg`,
		};

		SR5_SystemHelpers.srLog(2, `Creating a new item of '${type}' type`, itemData);
		return this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

	/* -------------------------------------------- */

	/**
	 * Handle creating a new Owned Item for the actor using data defined in an existing Owned Item
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onItemClone(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		if (item.type === "itemTradition") return ui.notifications.warn(game.i18n.localize('SR5.WARN_OnlyOneTradition'));
		let newItem = item.toObject();
		if (newItem.system.accessory?.length) newItem.system.accessory = [];
		SR5_SystemHelpers.srLog(2, `Creating a new clone of item '${item.name}'`, item);
		return this.actor.createEmbeddedDocuments("Item", [newItem]);
	}

	/* -------------------------------------------- */

	/**
	 * Handle editing an existing Owned Item for the Actor
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onItemEdit(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		// check window state
		const wasRendered = item.sheet.rendered;
		SR5_SystemHelpers.srLog(3, "item.sheet", item.sheet);
		item.sheet.render({ force: true });
		SR5_SystemHelpers.srLog(3, "item.sheet", item.sheet);
		// if window already exists, bring it to top
		if (wasRendered) item.sheet.bringToTop();
	}

	/* -------------------------------------------- */

	/**
	 * Handle deleting an existing Owned Item for the Actor
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onItemDelete(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		if (event.ctrlKey) {
			if ( item ) {
				await item.delete();
				await SR5_EntityHelpers.deleteEffectOnActor(this.actor, item.system.type);
				return
			}
		} else {
			const confirmed = await foundry.applications.api.DialogV2.confirm({
				window: { title: `${game.i18n.localize('SR5.Delete')} '${item.name}'${game.i18n.localize('SR5.QuestionMark')}` },
				content: "<h3>" + game.i18n.localize('SR5.DIALOG_Warning') + "</h3><p>" + game.i18n.format('SR5.DIALOG_WarningPermanentDelete', {type: game.i18n.localize("ITEM.Type" + item.type.replace(/^\w/, c => c.toUpperCase())), actor: this.actor.name, itemName: item.name}) + "</p>",
			});
			if (confirmed) {
				item.delete();
				if (item.type === "itemEffect"){
					SR5_EntityHelpers.deleteEffectOnActor(this.actor, item.system.type);
				}
			}
		}
	}	/* -------------------------------------------- */

	_onItemManagement(event){
		event.preventDefault();
		switch (event.button) {
			case 0:
				if (event.shiftKey) this._onItemDelete(event);
				else if (event.ctrlKey) this._onItemClone(event);
				else this._onItemEdit(event)
				break;
		}
	}	/* -------------------------------------------- */

		// Manage "Sub Item", accessory, licenses, effects...
		async _onManageSubItem(event){
	
			event.preventDefault();
			const a = event.currentTarget;
			const actorData = this.actor.system;
			let target = event.currentTarget.dataset.binding;
			let action = event.currentTarget.dataset.subaction;
			let index = event.currentTarget.dataset.index;
			let targetValue = event.currentTarget.dataset.targetvalue;
			let key = `system.${target}`;

			// Remove a subItem
			if (action === "delete") {
				// Submit any unsaved changes
				if (this.isEditable) {
					const formData = new FormDataExtended(this.element);
					const submitData = this._processFormData(null, this.element, formData);
					if (submitData && Object.keys(submitData).length) {
						await this.document.update(submitData);
					}
				}
				const li = a.closest(".subItemManagement");
				let removed = foundry.utils.duplicate(this.actor.system[target]);
				// convert back manually to array... so stupid to have to do this.
				if (typeof removed === "object") { removed = Object.values(removed); } 
				removed.splice(Number(li.dataset.key), 1);
				return this.actor.update({[key]: removed });
			}
		}

			/* -------------------------------------------- */
	// Reset actor drug addictions to blank
	async _onResetAddiction(event){
		event.preventDefault();
		this.actor.resetAddiction();
	}

	/* -------------------------------------------- */

	_onItemSummary(event) {
		event.preventDefault();
		let li = event.currentTarget.closest(".item");
		let item = this.actor.items.get(li.dataset.itemId);
		let expandData = item.getExpandData({ secrets: this.actor.isOwner });

		if (!expandData.properties.length && (expandData.gameEffect === "" || !expandData.gameEffect)) return;
		// Déplie les informations de jeu pour un Objet.
		if (li.classList.contains("expanded")) {
			let summary = li.querySelector(":scope > .item-summary");
			if (summary) summary.remove();
		} else {
			let accessoryClass = (event.currentTarget.classList.contains("SR-MarginLeft10") ? "SR-MarginLeft10" : "");
			let div = document.createElement("div");
			div.className = `col-x item-summary ${accessoryClass}`;
			div.innerHTML = expandData.gameEffect;
			let props = document.createElement("div");
			props.className = "item-properties";
			expandData.properties.forEach((p) => {
				if (Array.isArray(p)) {
					let index = expandData.properties.indexOf(p);
					props.insertAdjacentHTML("beforeend", `<span class="tag tag-summary" data-index=${index}>${p[0]}</span>`);
				} else {
					props.insertAdjacentHTML("beforeend", `<span class="tag">${p}</span>`);
				}
			});

			div.appendChild(props);
			li.appendChild(div);

			div.querySelectorAll(".tag-summary").forEach(el => el.addEventListener("click", (event) => {
				let i = event.currentTarget.dataset.index;
				let gameEffect = expandData.properties[i][1];

				if (div.classList.contains("expandedTag") && div.classList.contains(i)){
					let tagSummary = div.querySelector(":scope > .tag-description");
					if (tagSummary) tagSummary.remove();
					div.classList.remove(i);
				} else if (div.classList.contains("expandedTag")) {
					let tagSummary = div.querySelector(":scope > .tag-description");
					if (tagSummary) tagSummary.remove();
					div.className = "col-x item-summary expdandedTag";
					div.classList.add(i);
					let tagDiv = document.createElement("div");
					tagDiv.className = `item-properties tag-description ${i}`;
					tagDiv.innerHTML = gameEffect;
					div.appendChild(tagDiv);
				} else {
					let tagDiv = document.createElement("div");
					tagDiv.className = `item-properties tag-description ${i}`;
					tagDiv.innerHTML = gameEffect;
					div.appendChild(tagDiv);
					div.classList.add(i);
				}
				div.classList.toggle("expandedTag");
			}));

		}
		li.classList.toggle("expanded");
	}

	/* -------------------------------------------- */

	_onMatrixSummary(event) {
		event.preventDefault();
		let li = event.currentTarget.closest(".item");
		let key = li.dataset.itemId;
		let expandData = this.actor.system.matrix.actions[key];

		if (expandData === "" || !expandData) return;

		// Déplie les informations de jeu pour un Objet.
		if (li.classList.contains("expanded")) {
			let summary = li.querySelector(":scope > .item-summary");
			if (summary) summary.remove();
		} else {
			let accessoryClass = (event.currentTarget.classList.contains("SR-MarginLeft10") ? "SR-MarginLeft10" : "");

			let div = document.createElement("div");
			div.className = `col-x item-summary ${accessoryClass}`;
			div.innerHTML = game.i18n.localize(SR5.matrixGameEffects[key]);
			let props = document.createElement("div");
			props.className = "item-properties";

			div.appendChild(props);
			li.appendChild(div);

			div.querySelectorAll(".tag-summary").forEach(el => el.addEventListener("click", (event) => {
				let i = event.currentTarget.dataset.index;
				let gameEffect = `${game.i18n.localize(SR5.matrixGameEffects[key])}`;

				if (div.classList.contains("expandedTag") && div.classList.contains(i)){
					let tagSummary = div.querySelector(":scope > .tag-description");
					if (tagSummary) tagSummary.remove();
					div.classList.remove(i);
				} else if (div.classList.contains("expandedTag")) {
					let tagSummary = div.querySelector(":scope > .tag-description");
					if (tagSummary) tagSummary.remove();
					div.className = "col-x item-summary expdandedTag";
					div.classList.add(i);
					let tagDiv = document.createElement("div");
					tagDiv.className = `item-properties tag-description ${i}`;
					tagDiv.innerHTML = gameEffect;
					div.appendChild(tagDiv);
				} else {
					let tagDiv = document.createElement("div");
					tagDiv.className = `item-properties tag-description ${i}`;
					tagDiv.innerHTML = gameEffect;
					div.appendChild(tagDiv);
					div.classList.add(i);
				}
				div.classList.toggle("expandedTag");
			}));

		}
		li.classList.toggle("expanded");
	}

	/* -------------------------------------------- */
	// Edit Item value from Actor Sheet
	async _onEditItemValue(event) {
		let id = event.currentTarget.closest(".item")?.dataset.itemId;
		let target = event.currentTarget.dataset.binding;
		let actor = this.actor;
		let actorData = foundry.utils.duplicate(actor.system);
		let itemList = foundry.utils.duplicate(this.actor.items);
		let item = itemList.find((i) => i._id === id);
		let realItem = this.actor.items.find(i => i.id === id);
		let oldValue, actions;
		let actorId = actor.id;
		if (actor.isToken) actorId = actor.token.id;
		
		let value = event.target.value;
		if (event.currentTarget.dataset.dtype === "Number")
			value = Number(event.target.value);
		if (event.currentTarget.dataset.dtype === "Boolean") {
			oldValue = foundry.utils.getProperty(item, target);
			value = !oldValue;
		}
		foundry.utils.setProperty(item, target, value);

		//Spécial, pour les decks, désactiver les autres decks lorsque l'un d'entre eux et équipé
		if (item.type === "itemDevice" && target !== "system.conditionMonitors.matrix.actual.base") {
			for (let otherItem of itemList) {
				if (otherItem.type === "itemDevice" && (otherItem._id !== id)) otherItem.system.isActive = false;
			}

			for (let key of Object.keys(actorData.matrix.attributes)){
				actorData.matrix.attributes[key].base = 0;
			}
			actorData.matrix.attributesCollection.value1 = 0;
			actorData.matrix.attributesCollection.value2 = 0;
			actorData.matrix.attributesCollection.value3 = 0;
			actorData.matrix.attributesCollection.value4 = 0;
			actorData.matrix.attributesCollection.value1isSet = false;
			actorData.matrix.attributesCollection.value2isSet = false;
			actorData.matrix.attributesCollection.value3isSet = false;
			actorData.matrix.attributesCollection.value4isSet = false;

			//Remove item from PAN
			if (item.system.pan.content.length){
				for (let obj of item.system.pan.content){
					if (!game.user?.isGM) {
						SR5_SocketHandler.emitForGM("deleteItemFromPan", {
							targetItem: obj.uuid,
							actorId: this.actor.id,
						});
					} else {
						SR5_ActorHelper.deleteItemFromPan(obj.uuid, this.actor.id);
					}
				}
				item.system.pan.content = [];
			}
		}

		//Special case for armor
		if (target === "system.isActive" && item.type === "itemArmor" && !item.system.isCumulative) {
			for (let otherItem of itemList) {
				if (otherItem.type === "itemArmor" && !otherItem.system.isCumulative && (otherItem._id !== id)) otherItem.system.isActive = false;
			}
		}

		if (item.type === "itemDrug") {
			let drugType = "", drug = [], itemData = item.system;
			if (Object.keys(itemData.systemEffects).length) {
				drugType = Object.values(itemData.systemEffects).find(i => i.category === "drug");
			}
			
			
			if (target === "system.isActive"){
				foundry.utils.setProperty(item, "system.wirelessTurnedOn", false);

				// Handle drug taken
				SR5_SystemHelpers.srLog(1, "Handle drug taken: " + drugType);

				let alreadyTaken = actorData.addictions.find((d) => item.name === d.name);
				let addiction = [];

				// Handle quantity 				
				itemData.quantity -= 1;

				// Check if the drug is activated
				if (item.system.isActive) {
						// Check if the drug has already been taken
						if (alreadyTaken) {
							// Add one take
							alreadyTaken.shot.value += 1;
							// Reset the threshold
							alreadyTaken.addiction.threshold = item.system.addiction.threshold;
						}
						else {
							// Generate and populate the drug addiction
							addiction = SR5_CharacterUtility.generateDrugAddiction(item);
							actorData.addictions = actorData.addictions.concat(addiction);
							actorData.addictions = Object.values(actorData.addictions);
						}		
          
						SR5_SystemHelpers.srLog(1, "actorData.addictions : " + JSON.stringify(actorData.addictions));
						if (actorData.addictions.shot) SR5_EntityHelpers.updateValue(actorData.addictions.shot);
						if (actorData.addictions.weekAddiction) SR5_EntityHelpers.updateValue(actorData.addictions.weekAddiction);		
					
					// Check if the drug is set on systemEffect					
					if (drugType) {
						
						SR5_SystemHelpers.srLog(1, "Check drugType");

						// Generate the drug stat
						drug = await SR5_CharacterUtility.handleDrugShots(item, drugType, actorData);
						itemData.handleShot = drug;
						
						let speedType = "";

						if (!itemData.interact) {	
							console.log("drug : " + item.name);						
							// Generate the drug stat
							drug = await SR5_CharacterUtility.handleDrugShots(item, drugType, actorData);
							itemData.handleShot = drug;
							itemData.onUse.duration = `${itemData.handleShot.duration} ${game.i18n.localize(SR5.extendedIntervals[itemData.handleShot.durationType])}`;
							itemData.onUse.contrecoup = "";
							
							// Generate the speed type if not pure text
							if (itemData.handleShot.speedType) speedType = game.i18n.localize(itemData.handleShot.speedType);
						}

						// Handle interaction but reparsing so ...
						let interactionDrug = actor.items.filter((d) => d.type === "itemDrug" && (d.system.isActive || d.system.wirelessTurnedOn));
						if (interactionDrug.length > 0) {
							let roll, interactionDiceResult, drugs = [];
							roll = new Roll(`${interactionDrug.length}d6`);
							interactionDiceResult = await roll.evaluate();

							for (let d of interactionDrug){						
							await d.update({"system.interact": true});
							drugs.push(d.name);
							console.log("for (let d of interactionDrug) : " + JSON.stringify(d));
							}

							let damageInfo;

							switch(interactionDiceResult.total){
								case 1:
									// not working
									await ui.notifications.info(`${game.i18n.format("SR5.DrugInteraction")} ${drugs.toString().replace(",", ", ")}${game.i18n.format("SR5.Colons")} ${game.i18n.format("SR5.DrugDurationDoubled")}`);

									console.log(" before : " + JSON.stringify(interactionDrug));

									for (let d of interactionDrug){
										let duration, onUseDuration; 
										if (d.system.handleShot.duration) duration = d.system.handleShot.duration * 2;
										if (d.system.onUse.duration) onUseDuration = `${d.system.handleShot.duration * 2} ${game.i18n.localize(SR5.extendedIntervals[d.system.handleShot.durationType])}`; 
										let updatedDrug = {};
										foundry.utils.mergeObject(updatedDrug, {
											"system.handleShot.duration": duration || 0,
											"system.onUse.duration": onUseDuration || 0,
										});
										
										await d.updateSource(updatedDrug);
										await d.update(updatedDrug);										
										await actor.updateEmbeddedDocuments("Item", [d]);
										await actor.updateItems(actor);
										//await d.update(updatedDrug);
										//await d.getExpandData({ secrets: this.actor.isOwner });
									}
								
									console.log(" after : " + JSON.stringify(interactionDrug));
									break;
								case 2, 3, 4:
									await ui.notifications.info(`${game.i18n.format("SR5.DrugInteraction")} ${drugs.toString().replace(",", ", ")}${game.i18n.format("SR5.Colons")} ${game.i18n.format("SR5.DrugNoInteractEffect")}`);
									break;
								case 5, 6 :
									// not working
									await ui.notifications.info(`${game.i18n.format("SR5.DrugInteraction")} ${drugs.toString().replace(",", ", ")}${game.i18n.format("SR5.Colons")} ${game.i18n.format("SR5.DrugContrecoupDurationDoubled")}`);

									console.log(" before : " + JSON.stringify(interactionDrug));

									for (let d of interactionDrug){
										let contrecoup, onUseContrecoup; 
										if (d.system.handleShot.durationContrecoup) contrecoup = d.system.handleShot.durationContrecoup * 2;
										if (d.system.onUse.contrecoup) onUseContrecoup = `${d.system.handleShot.durationContrecoup} ${game.i18n.localize(SR5.extendedIntervals[d.system.handleShot.durationContrecoupType])}`;
										let updatedDrug = {};
										foundry.utils.mergeObject(updatedDrug, {
											"system.handleShot.durationContrecoup": contrecoup || 0,
											"system.onUse.contrecoup": onUseContrecoup || 0,
										});
										
										await d.updateSource(updatedDrug);
										await d.update(updatedDrug);										
										await actor.updateEmbeddedDocuments("Item", [d]);
										await actor.updateItems(actor);
										//await d.update(updatedDrug);
										//await d.getExpandData({ secrets: this.actor.isOwner });
									}
								
									console.log(" after : " + JSON.stringify(interactionDrug));
									break;
								case 7, 8, 9:
									//not working
									await ui.notifications.info(`${game.i18n.format("SR5.DrugInteraction")} ${drugs.toString().replace(",", ", ")}${game.i18n.format("SR5.Colons")} ${game.i18n.format("SR5.DrugContrecoupDurationDoubled")}`);

									console.log(" before : " + JSON.stringify(interactionDrug));

									let activeDrugs = actor.items.filter((d) => d.type === "itemDrug" && d.system.isActive);

									if (activeDrugs.length){										
										for (let d of activeDrugs){
											foundry.utils.setProperty(d, "system.isActive", false);
											foundry.utils.setProperty(d, "system.wirelessTurnedOn", true);
										}
									}
								
									console.log(" after : " + JSON.stringify(interactionDrug));
									break;
								case 10:
									await ui.notifications.info(`${game.i18n.format("SR5.DrugInteraction")}${game.i18n.format("SR5.Colons")} ${drugs.toString().replace(",", ", ")}`);
									damageInfo = SR5_PrepareRollTest.getBaseRollData(null, actor);
									damageInfo.damage.value = 10;
									damageInfo.damage.type = "stun";
									this.actor.takeDamage(damageInfo);
									break;
								case 11, 12, 13:
									await ui.notifications.info(`${game.i18n.format("SR5.DrugInteraction")}${game.i18n.format("SR5.Colons")} ${drugs.toString().replace(",", ", ")} ${interactionDiceResult.total}`);
									break;
								default:
									console.log(interactionDiceResult.total);
									await ui.notifications.info(`${game.i18n.format("SR5.DrugInteraction")}${game.i18n.format("SR5.Colons")} ${drugs.toString().replace(",", ", ")}`);
									damageInfo = SR5_PrepareRollTest.getBaseRollData(null, actor);
									damageInfo.damage.value = 10;
									damageInfo.damage.type = "physical";
									damageInfo.damage.resistanceType = "physicalDamage";
									damageInfo.combat.armorPenetration = -20;
									this.actor.rollTest("resistanceCard", null, damageInfo);
									break;
							}
						}
						
						// Notify info drug taken
						await ui.notifications.info(`${actor.name}${game.i18n.format("SR5.Colons")} ${game.i18n.localize(SR5.drugs[itemData.handleShot.name])}${game.i18n.format("SR5.Colons")}<ul><li>${game.i18n.format("SR5.ToxinSpeed")}${game.i18n.format("SR5.Colons")} ${itemData.handleShot.speed} ${speedType}</li><li>${game.i18n.format("SR5.Duration")}${game.i18n.format("SR5.Colons")} ${itemData.handleShot.duration} ${game.i18n.localize(SR5.extendedIntervals[itemData.handleShot.durationType])}</li></ul>`);
						
						// Notify info on effect for Laes/Leal
						if (itemData.handleShot.effectDuration) await ui.notifications.info(`${actor.name}${game.i18n.format("SR5.Colons")} ${game.i18n.format("SR5.ErasedMemoryFor")} ${itemData.handleShot.effectDuration} ${game.i18n.localize(itemData.handleShot.effectDurationType)}`);

					}

				}

				if (!item.system.isActive) {
					itemData.onUse.duration = "";					
					itemData.interact = false;
				}

			} else if (target === "system.wirelessTurnedOn"){
				foundry.utils.setProperty(item, "system.isActive", false);

								
				itemData.onUse.duration = "";
				if (itemData.handleShot.durationContrecoup) itemData.onUse.contrecoup = `${itemData.handleShot.durationContrecoup} ${game.i18n.localize(SR5.extendedIntervals[itemData.handleShot.durationContrecoupType])}`;
				
				// Check if the item is a drug set on systemEffect and has contrecoup duration
				if (item.system.wirelessTurnedOn && drugType && itemData.handleShot.durationContrecoup) {
					// Notify info on contrecoup				
					await ui.notifications.info(`${actor.name}${game.i18n.format("SR5.Colons")} ${game.i18n.format("SR5.DrugContrecoup")} (${game.i18n.localize(SR5.drugs[itemData.handleShot.name])})${game.i18n.format("SR5.Colons")} ${itemData.handleShot.durationContrecoup} ${game.i18n.localize(SR5.extendedIntervals[itemData.handleShot.durationContrecoupType])}`);
				}
				
				// Handle if the item is a drug set on systemEffect and has untresisted stun contrecoup
				if (item.system.wirelessTurnedOn && drugType && itemData.handleShot.unresistedStunDamage) {
					let damageInfo = SR5_PrepareRollTest.getBaseRollData(null, actor);
					damageInfo.damage.value = itemData.handleShot.unresistedStunDamage;
					damageInfo.damage.type = "stun";
					this.actor.takeDamage(damageInfo);
				}
				
				// Handle if the item is a drug set on systemEffect and has resisted stun contrecoup
				if (item.system.wirelessTurnedOn && drugType && itemData.handleShot.resistedStunDamage) {
					let damageInfo = SR5_PrepareRollTest.getBaseRollData(null, actor);
					damageInfo.damage.value = itemData.handleShot.resistedStunDamage;
					damageInfo.damage.type = "stun";
					damageInfo.damage.resistanceType = "physicalDamage";
					this.actor.rollTest("resistanceCard", null, damageInfo);
				}

				if (!item.system.wirelessTurnedOn) {
					itemData.interact = false;
					itemData.onUse.contrecoup = "";
				}
			}
		}

		if (item.type === "itemProgram" && target === "system.isCreated"){
			oldValue = foundry.utils.getProperty(item, "system.isActive");
			value = !oldValue;
			foundry.utils.setProperty(item, "system.isActive", value);
		}

		if (item.type === "itemAdeptPower" && !item.system.isActive && item.system.hasDrain && !item.system.needRoll){
			let rollData = SR5_PrepareRollTest.getBaseRollData(null, actor);
			rollData.magic.drain.value = item.system.drainValue.value;
			this.actor.rollTest("drain", null, rollData);
		}

		if (item.system.accessory?.length){
			for (let a of item.system.accessory){
				let accessory = itemList.find(i => i._id === a._id);
				if (accessory) {
					accessory.system.isActive = item.system.isActive;
					accessory.system.wirelessTurnedOn = item.system.wirelessTurnedOn;
				}
			}
		}

		//Manage actions
		if (item.type === "itemFocus" && target === "system.isActive"){
			if(oldValue === false) {
				actions = [{type: "simple", value: 1, source: "activateFocus"}];
				actorData.specialProperties.actions.simple.current -=1;

				// Handle focus addicition
				let alreadyTaken = actorData.addictions.find((d) => item.name === d.name);
				let addiction = [];
				if (item.system.isActive){
					if (alreadyTaken) {
						alreadyTaken.shot.value += 1;
						alreadyTaken.weekAddiction.value = 11 - item.system.itemRating;
						alreadyTaken.addiction.threshold = 2;
					}
					else {
						addiction = SR5_CharacterUtility.generateDrugAddiction(item);
						actorData.addictions = actorData.addictions.concat(addiction);
					}		
					if (actorData.addictions.shot) SR5_EntityHelpers.updateValue(actorData.addictions.shot);
					if (actorData.addictions.weekAddiction) SR5_EntityHelpers.updateValue(actorData.addictions.weekAddiction);		
				}

			} else {
				actions = [{type: "free", value: 1, source: "desactivateFocus"}];
				actorData.specialProperties.actions.free.current -=1;

			}
		}
		if (item.type === "itemProgram" && target === "system.isActive"){
			if(oldValue === false) actions = [{type: "free", value: 1, source: "loadProgram"}];
			else actions = [{type: "free", value: 1, source: "unloadProgram"}];
			actorData.specialProperties.actions.free.current -=1;
		}
		if (target === "system.wirelessTurnedOn"){
			if(oldValue === false) actions = [{type: "free", value: 1, source: "turnOnWifi"}];
			else actions = [{type: "free", value: 1, source: "turnOffWifi"}];
			actorData.specialProperties.actions.simple.current -=1;
		}

		//Special case for materialization
		if (item.type === "itemPower" && actor.type === "actorSpirit"){
			if (realItem.system.systemEffects.find(e => e.value === "materialization")){
				actorData.isMaterializing = value;
			}
		}
		
		//Update actor
		await this.actor.update({
			"system": actorData,
			"items": itemList,
		})
		if (this.actor.isToken) this.actor.sheet.render();

		//Delete effects linked to sustaining
		if ((item.type === "itemComplexForm" || item.type === "itemSpell" || item.type === "itemAdeptPower" || item.type === "itemPower") && target === "system.isActive"){
			if (!item.system.isActive) {

				//Delete effects
				if (item.system.targetOfEffect.length){
					for (let e of item.system.targetOfEffect){
						if (!game.user?.isGM) {
							await SR5_SocketHandler.emitForGM("deleteSustainedEffect", {
								targetItem: e,
							});
						} else {
							await SR5_ActorHelper.deleteSustainedEffect(e);
						}
					}
					item.system.targetOfEffect = [];
					this.actor.updateEmbeddedDocuments("Item", [item]);
				}
				
				//Delete template, if any
				if (item.system.range === "area"){
					let messageId = null;
					for (let m of game.messages){
						if(m.flags.sr5data?.owner.itemId === item._id && m.flags.sr5data?.chatCard.templateRemove) messageId = m.id;
					}
					if (messageId) await SR5_RollMessage.removeTemplate(messageId, realItem.uuid);
				}
				
			}
		}

		//Manage actions for combatants
		if (game.combat && actions){
			SR5Combat.changeActionInCombat(actorId, actions, false);
		}

	}

	/* -------------------------------------------- */
	//Change value of an item from actor sheet by clicking with mouse
	_onChangeValueByClick(event) {
		let id = event.currentTarget.closest(".item")?.dataset.itemId,
				target = event.currentTarget.dataset.binding,
				entity,
				original;

		if (id) original = this.actor.items.get(id);
		else original = this.actor;
		entity = original.toObject(false);
		let value = foundry.utils.getProperty(entity, target);
		switch (event.button) {
			case 0:
				if (event.ctrlKey && target === "system.quantity") value -= 10;
				else value--;
				if (value < 0) value = 0;
				break;
			case 2:
				if ((target === "system.matrix.attributes.sharing.base") || (target === "system.matrix.attributes.noiseReduction.base")){
					let deviceRating = entity.system.matrix.deviceRating;
					let noiseReduction = entity.system.matrix.attributes.noiseReduction.base;
					let sharing = entity.system.matrix.attributes.sharing.base;
					if (target === "system.matrix.attributes.sharing.base"){
						if ((value + noiseReduction) < deviceRating) {
							value++;
						} else {
							if (noiseReduction > 0) {
								foundry.utils.setProperty(entity, "system.matrix.attributes.noiseReduction.base", (noiseReduction - 1));
								value++;
							} else {
								SR5_SystemHelpers.srLog(3, "Reached maximum value");
							}
						}
					}
					if (target === "system.matrix.attributes.noiseReduction.base"){
						if ((value + sharing) < deviceRating) {
							value++;
						} else {
							if (sharing > 0) {
								foundry.utils.setProperty(entity, "system.matrix.attributes.sharing.base", (sharing - 1));
								value++;
							} else {
								SR5_SystemHelpers.srLog(3, "Reached maximum value");
							}
						}
					}
				} else {
					if (event.ctrlKey && target === "system.quantity") value += 10;
					else value++;
				}
				break;
		}

		if (id){
			foundry.utils.setProperty(entity, target, value);
			this.actor.updateEmbeddedDocuments("Item", [entity]);
		} else {
			foundry.utils.setProperty(entity, target, value);
			this.actor.update(entity);
		}
	}

	/* -------------------------------------------- */
	//Change value of an actor by click
	_onEditActorValue(event){
		let target = event.currentTarget.dataset.binding;
		let actor = this.actor.toObject(false);

		let value = event.target.value;
		if (event.currentTarget.dataset.dtype === "Boolean") {
			let oldValue = foundry.utils.getProperty(actor, target);
			value = !oldValue;
		}
		foundry.utils.setProperty(actor, target, value);
		let actorData = actor.system;
		this.actor.update({'system': actorData})
	}


	/* -------------------------------------------- */
	// Reset actor recoil to 0
	async _onResetRecoil(event){
		event.preventDefault();
		this.actor.resetRecoil();
	}

	/* -------------------------------------------- */
	//Reload weapon ammo
	async _onReloadAmmo(event) {
		event.preventDefault();
		const id = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(id);
		let option;

		if (!item) return;

		switch (item.system.ammunition.casing){
			case "clip":
			case "drum":
			case "belt":
				if (event.button === 0){
					option = "insert";
					if (event.shiftKey) option = "replace";
					if (event.ctrlKey) option = "insertRound";
					if (event.shiftKey && event.ctrlKey) option = "insertRoundFull";
				} else if (event.button ===2){
					option = "remove";
				}
				break;
			case "breakAction":
			case "internalMag":
			case "muzzle":
				option = "insertRound";
				if (event.shiftKey && event.ctrlKey) option = "insertRoundFull";
				break;
			case "cylinder":
				option = "insertRound";
				if (event.shiftKey && (item.system.accessory.find(a => a.name === "speedLoader"))) option = "insertRoundFull";
				if (event.shiftKey && event.ctrlKey) option = "insertRoundFull";
				break;
			case "special":
				option = "insertRoundFull";
				break;
			default: return ui.notifications.warn(game.i18n.localize('SR5.WARN_MissingCasing'));
		}

		item.reloadAmmo(option);
	}

	/* -------------------------------------------- */
	//Reboot deck
	async _onRebootDeck(event) {
		event.preventDefault();
		this.actor.rebootDeck();
	}

	/* -------------------------------------------- */
	///Roll dices
	/* -------------------------------------------- */
	async _onRoll(event) {
		event.preventDefault();
		let iid;
		if (event.currentTarget.closest(".item")) iid = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(iid);
		const rollKey = event.currentTarget.dataset.rollkey;
		const rollType = event.currentTarget.dataset.rolltype;
		if(item) item.rollTest(rollType, rollKey);
		else this.actor.rollTest(rollType, rollKey);
	}

	async _onRollGrenade(event) {
		event.preventDefault();
		const iid = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(iid);
		await item.placeGabarit();
	}

	/* -------------------------------------------- */

	async _displayHelpText(event) {
		if (!game.settings.get("sr5", "sr5Help.active")) return false;

		let target = document.querySelector("#sr5help");
		if (!target) return;

		let property;
		const helpTitle = document.querySelector("#sr5helpTitle");
		const helpMessage = document.querySelector("#sr5helpMessage");
		const helpDetails = document.querySelector("#sr5helpDetails");

		if (helpTitle) helpTitle.innerHTML = "";
		if (helpMessage) helpMessage.innerHTML = "";
		if (helpDetails) helpDetails.innerHTML = "";

		{
			const el = event.currentTarget;
			if (helpTitle) helpTitle.innerHTML = el.dataset.helptitle || "";

			if (el.dataset.helpmessage && helpMessage) helpMessage.innerHTML = "<div class='helpMessage'><em>" + el.dataset.helpmessage + "</em></div>";

			let details = el.dataset.helpdetails;
			if (details) {
				property = SR5_EntityHelpers.resolveObjectPath(`actor.${details}`, this);
			}

			let itemId = el.dataset.helpitemid;
			if (itemId) {
				let item = this.actor.items.find(i => i.id === itemId);
				let detailsItem = el.dataset.helpdetailsitem;
				property = SR5_EntityHelpers.resolveObjectPath(`${detailsItem}`, item);
			}

			if (property) {
				let detailsHTML = `${game.i18n.localize('SR5.HELP_CalculationDetails')}<ul>`;
				if (property.modifiers && property.modifiers.length) {
					if (property.base) detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationBase')}${game.i18n.localize('SR5.Colons')} ${property.base}</li>`;
					for (let modifier of Object.values(property.modifiers)) {
						if (modifier.value != undefined) {
							if (modifier.type === "penaltyspecial" && modifier.details.length){
								let modifierDetails = "";
								for (let i = 0; i < modifier.details.length; i++){
									let m = modifier.details[i];
									if (m.value === 0) continue;
									modifierDetails += `${m.source} (${m.value})`;
									if((i + 1) !== (modifier.details.length)) modifierDetails += `, `;
								}
								detailsHTML = detailsHTML + `<li>${game.i18n.localize('SR5.PenaltyValueSpecial')} [${modifierDetails}]${game.i18n.localize('SR5.Colons')} ${modifier.value}</li>`;
							} else detailsHTML = detailsHTML + `<li>${modifier.source} [${game.i18n.localize(SR5.modifierTypes[modifier.type])}]${game.i18n.localize('SR5.Colons')} ${(modifier.isMultiplier ? 'x' : (modifier.value >= 0 ? '+' : ''))}${modifier.value}</li>`;
						} else detailsHTML = detailsHTML + `<li>${modifier.source} [${game.i18n.localize(SR5.modifierTypes[modifier.type])}]${game.i18n.localize('SR5.Colons')} ${(modifier.isMultiplier ? 'x' : (modifier.dicePool >= 0 ? '+' : ''))}${modifier.dicePool}</li>`;
					}
				}
				if (property.value != undefined) detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationTotal')}${game.i18n.localize('SR5.Colons')} ${property.value}</li></ul>`;
				else detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationTotal')}${game.i18n.localize('SR5.Colons')} ${property.dicePool}</li></ul>`;
				if (helpDetails) helpDetails.innerHTML = detailsHTML;
			}
			target.classList.add("active");
		}
	}

	async _hideHelpText() {
		let target = document.querySelector("#sr5help");
		if (target) target.classList.remove("active");
	}

	//Handle controler choice of a drone / Vehicle
	async _onChooseControler(event){
		//let worldActors = await Array.from(game.actors);
		let controlerList = {};
		for (let a of game.actors){
			if (a.system.type === "actorPc" || (a.system.type === "actorGrunt" && a.system.token.actorLink)){
				if (game.user.isGM) {
					controlerList[a.id] = a.name;
				} else {
					if (a.hasPlayerOwner) controlerList[a.id] = a.name;
				}
			}
		}
		let dialogData = {
			controlerList: controlerList,
		};
		const ctrlDlg = await foundry.applications.handlebars.renderTemplate("systems/sr5/templates/interface/chooseControler.html", dialogData);
		const ctrlResult = await foundry.applications.api.DialogV2.wait({
			window: { title: game.i18n.localize('SR5.ChooseControler') },
			content: ctrlDlg,
			buttons: [
				{
					action: "ok",
					label: "Ok",
					default: true,
					callback: (event, button, dialog) => ({ action: "ok", element: dialog.element }),
				},
				{
					action: "cancel",
					label: "Cancel",
					callback: () => ({ action: "cancel" }),
				},
			],
			rejectClose: false,
		});
		if (!ctrlResult || ctrlResult.action !== "ok") return;
		let controler = ctrlResult.element.querySelector("[name=controler]")?.value;
		let controlerName = "";
		if (controler) {
			controlerName = controlerList[controler];
			let vehicleControler = SR5_EntityHelpers.getRealActorFromID(controler);
			vehicleControler = vehicleControler.toObject(false);
			this.actor.update({
				"system.vehicleOwner.id": controler,
				"system.vehicleOwner.name": controlerName,
				"system.vehicleOwner.system": vehicleControler.system,
				"system.vehicleOwner.items": vehicleControler.items,
			});
		} else {
			this.actor.update({
				"system.vehicleOwner.id": "",
				"system.vehicleOwner.name": "",
				"system.vehicleOwner.system": "",
				"system.vehicleOwner.items": [],
				"system.controlMode": "autopilot"
			});
		}

	}

	//Handle the creation of a 'side kick'
	async _OnSidekickCreate(event){
		event.preventDefault();
		const id = event.currentTarget.closest(".item").dataset.itemId;
		let item = this.actor.items.get(id);
		let actorId = this.actor.id;
		if (this.actor.isToken) actorId = this.actor.token.id;
		item = item.toObject(false);
		if (!game.user?.isGM) {
			await SR5_SocketHandler.emitForGM("createSidekick", {
				item: item,
				userId: game.user.id,
				actorId: actorId,
			});
		} else {
			SR5_ActorHelper.createSidekick(item, game.user.id, actorId);
		}

		//manage actions
		if (item.type === "itemProgram") SR5Combat.changeActionInCombat(actorId, [{type: "free", value: 1, source:"loadAgent"}]);
		else if (item.type === "itemSprite") SR5Combat.changeActionInCombat(actorId, [{type: "simple", value: 1, source:"callSprite"}]);
		else if (item.type === "itemSpirit") SR5Combat.changeActionInCombat(actorId, [{type: "simple", value: 1, source:"callSpirit"}]);
	}

	//
	async _OnDismissActor(event){
		event.preventDefault();
		if (!game.user?.isGM) {
			await SR5_SocketHandler.emitForGM("dismissSidekick", {
				actor: this.actor.toObject(false),
			});
		} else {
			await SR5_ActorHelper.dimissSidekick(this.actor.toObject(false));
		}
	}

	async _OnSidekickDestroy(event){
		event.preventDefault();
		const id = event.currentTarget.closest(".item").dataset.itemId;
		let sidekick;
		let item = this.actor.items.get(id);
		let actorId = this.actor.id;
		
		for (let a of game.actors){
			if (a.system.creatorItemId === id) {
				sidekick = a.toObject(false);
				break;
			}
		}

		if(sidekick !== undefined) {
			if (!game.user?.isGM) {
				await SR5_SocketHandler.emitForGM("dismissSidekick", {
					actor: sidekick,
				});
			} else {
				await SR5_ActorHelper.dimissSidekick(sidekick);
			}
		} else {
			item.update({"system.isCreated": false})
		}

		//manage actions
		if (this.actor.isToken) actorId = this.actor.token.id;
		if (item.type === "itemProgram") SR5Combat.changeActionInCombat(actorId, [{type: "free", value: 1, source: "unloadAgent"}]);
		else if (item.type === "itemSprite") SR5Combat.changeActionInCombat(actorId, [{type: "simple", value: 1, source:"dismissSprite"}]);
		else if (item.type === "itemSpirit") SR5Combat.changeActionInCombat(actorId, [{type: "simple", value: 1, source:"dismissSpirit"}]);
	}

	async _onAddItemToPan(event){
		let actor = this.actor,
				cancel = true,
				list = {},
				actorList = {},
				baseActor = this.actor.id;

		if (actor.system.matrix.pan.current === actor.system.matrix.pan.max){
			ui.notifications.info(`${actor.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.INFO_PanIsFull")}`);
			return;
		}

		for (let key of Object.keys(actor.system.matrix.potentialPanObject)){
			if (Object.keys(actor.system.matrix.potentialPanObject[key]).length) {
				list[key] = SR5_EntityHelpers.sortObjectValue(actor.system.matrix.potentialPanObject[key]);
			}
		}

		for (let a of game.actors){
			if (a.type === "actorPc" || (a.type === "actorGrunt" && a.token?.actorLink)){
				if (game.user.isGM) actorList[a.id] = a.name;
				else if (a.hasPlayerOwner) actorList[a.id] = a.name;
			}
		}

		if (canvas.scene && game.user.isGM){
			for (let token of canvas.tokens.placeables) {
				if (token.actor.isToken && (token.actor.type === "actorGrunt")) {
					actorList[token.id] = token.name;
				}
			}
		}

		if (this.actor.isToken) baseActor = this.actor.token.id;

		let dialogData = {
			actor: baseActor,
			list: list,
			actorList: actorList,
		};

		const dlg = await foundry.applications.handlebars.renderTemplate("systems/sr5/templates/interface/addItemToPan.html", dialogData);
		const result = await SR5_PanDialog.create({
			title: game.i18n.localize('SR5.ChooseItemToPan'),
			content: dlg,
			data: dialogData,
		});

		if (!result || result.action === "cancel") return;
		let targetItem = result.element.querySelector("[name=itemToAdd]")?.value;
		if (targetItem === "none") return;
		if (!game.user?.isGM) {
			SR5_SocketHandler.emitForGM("addItemToPan", {
				targetItem: targetItem,
				actorId: baseActor,
			});
		} else {
			SR5_ActorHelper.addItemtoPan(targetItem, baseActor);
		}
	}

	async _onDeleteItemFromPan(event){
		event.preventDefault();
		// Submit any unsaved changes
		if (this.isEditable) {
			const formData = new FormDataExtended(this.element);
			const submitData = this._processFormData(null, this.element, formData);
			if (submitData && Object.keys(submitData).length) {
				await this.document.update(submitData);
			}
		}
		let index = event.currentTarget.dataset.index;
		let itemId = event.currentTarget.dataset.key;
		let actor = this.actor.id;
		if (this.actor.isToken) actor = this.actor.token.id;

		if (!game.user?.isGM) {
			SR5_SocketHandler.emitForGM("deleteItemFromPan", {
				targetItem: itemId,
				index: index,
				actorId: actor,
			});
		} else {
			SR5_ActorHelper.deleteItemFromPan(itemId, actor, index);
		}
	}

	async _onStopJamming(event){
		event.preventDefault();
		let jammingItem = this.actor.items.find(i => i.system.type === "signalJam");
		await this.actor.deleteEmbeddedDocuments("Item", [jammingItem.id]);
		await SR5_EntityHelpers.deleteEffectOnActor(this.actor, "signalJam");
	}

	_onChangeMatrixMode(event){
		let actorId = this.actor.id;
		if (this.actor.isToken) actorId = this.actor.token.id;

		//manage actions
		SR5Combat.changeActionInCombat(actorId, [{type: "simple", value: 1, source: "switchInitToMatrix"}]);
	}

	_onChangeSilentMode(event){
		let actorId = this.actor.id;
		if (this.actor.isToken) actorId = this.actor.token.id;
		
		//manage actions
		let action = [{type: "free", value: 1, source: "changeSilentMode"}];
		//action = [{type: "simple", value: 1}];
		SR5Combat.changeActionInCombat(actorId, action);
	}

}
