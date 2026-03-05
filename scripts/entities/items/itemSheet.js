import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../helpers.js";

/**
 * Override and extend the core ItemSheet implementation to handle Shadowrun 5 specific item types
 * @type {ItemSheetV2}
 */
export class SR5ItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(
	foundry.applications.sheets.ItemSheetV2
) {
	static MODES = Object.freeze({ PLAY: 1, EDIT: 2 });

	_mode = SR5ItemSheet.MODES.EDIT;

	get isPlayMode() { return this._mode === SR5ItemSheet.MODES.PLAY; }
	get isEditMode() { return this._mode === SR5ItemSheet.MODES.EDIT; }

	static DEFAULT_OPTIONS = {
		classes: ["app", "window-app", "sr5", "SR-Item"],
		position: { width: 510, height: 445 },
		window: { resizable: false },
		form: { submitOnChange: true },
		actions: {
			toggleMode: SR5ItemSheet._onToggleMode,
		},
	};

	static PARTS = {
		sheet: {
			template: "systems/sr5/templates/items/itemGear-sheet.html",
			root: true,
			scrollable: [".SR_ItemScrollY"],
		},
	};

	static TABS = {
		primary: {
			tabs: [
				{ id: "tab-info" },
				{ id: "tab-stat" },
				{ id: "tab-effect" },
			],
			initial: "tab-info",
		},
	};

	get title() {
		return this.document.name;
	}

	static async _onToggleMode(event) {
		event.preventDefault();
		if (!this.isEditable) return;
		const newMode = this.isPlayMode ? SR5ItemSheet.MODES.EDIT : SR5ItemSheet.MODES.PLAY;
		game.user?.setFlag("sr5", `playMode.${this.item.id}`, newMode);
		await this.render({ mode: newMode });
	}

	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		if (options.mode && this.isEditable) this._mode = options.mode;
		else if (options.renderContext === `create${this.document.documentName}`) {
			this._mode = SR5ItemSheet.MODES.EDIT;
		} else if (!options.mode && this.document?.id) {
			const saved = game.user?.getFlag("sr5", `playMode.${this.document.id}`);
			if (saved) this._mode = saved;
		}
	}

	/** Dynamically set the template path based on item type */
	_configureRenderParts(options) {
		const parts = super._configureRenderParts(options);
		parts.sheet.template = `systems/sr5/templates/items/${this.item.type}-sheet.html`;
		return parts;
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

		// Move close button to the end
		if (closeButton) header?.appendChild(closeButton);

		return frame;
	}

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const item = this.item;
		context.item = item.toObject(false);
		context.system = item.system;
		context.isEmbedded = item.isEmbedded;
		context.lists = SR5_EntityHelpers.sortTranslations(SR5);
		context.tabs = this._prepareTabs("primary");
		context.isPlay = this.isPlayMode;
		// Provide cssClass for template compatibility
		context.cssClass = this.document.isOwner ? "editable" : "locked";
		return context;
	}

	_onRender(context, options) {
		super._onRender(context, options);
		const el = this.element;

		// Play/Edit mode classes
		el.classList.toggle("sr-mode-edit", this.isEditMode);
		el.classList.toggle("sr-mode-play", this.isPlayMode);

		// Update toggle button icon
		const toggleBtn = el.querySelector('[data-action="toggleMode"]');
		if (toggleBtn) {
			toggleBtn.classList.toggle("fa-lock", this.isPlayMode);
			toggleBtn.classList.toggle("fa-lock-open", this.isEditMode);
			toggleBtn.dataset.tooltip = this.isPlayMode ? "SR5.SwitchToEdit" : "SR5.SwitchToPlay";
		}

		// Activate initial tabs (only if tabs exist in the DOM — some items have no tabs)
		for (const [group, tab] of Object.entries(this.tabGroups)) {
			if (tab && el.querySelector(`nav.tabs [data-group="${group}"]`)) {
				this.changeTab(tab, group, { force: true, updatePosition: false });
			}
		}

		// Sub-item management (add/delete/clone effects, licenses, etc.)
		el.querySelectorAll(".subItem").forEach(node => node.addEventListener("click", this.#onManageSubItem.bind(this)));

		// Accessory choice
		el.querySelectorAll(".accessoryChoice").forEach(node => node.addEventListener("click", this.#onAccessoryChoice.bind(this)));

		// Help Display (mouseover/mouseout — cannot use data-action)
		el.querySelectorAll("[data-helpTitle]").forEach(node => {
			node.addEventListener("mouseover", this._displayHelpText.bind(this));
			node.addEventListener("mouseout", this._hideHelpText.bind(this));
		});

		// Condition monitor boxes
		el.querySelectorAll(".boxes:not(.box-disabled)").forEach(node => node.addEventListener("click", (ev) => {
			let itemData = foundry.utils.duplicate(this.item);
			let index = Number(ev.currentTarget.dataset.index);
			let target = ev.currentTarget.closest(".SR-MoniteurCases").dataset.target;

			let value = foundry.utils.getProperty(itemData, target);
			if (value == index + 1)
				foundry.utils.setProperty(itemData, target, index);
			else foundry.utils.setProperty(itemData, target, index + 1);

			this.item.update(itemData);
		}));
	}

	// Manage "Sub Item", accessory, licenses, effects...
	async #onManageSubItem(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const itemData = this.item.system;
		let target = a.dataset.binding;
		let action = a.dataset.subaction;
		let key = `system.${target}`;

		// Submit any unsaved changes before modifying sub-items
		if (this.isEditable) {
			const formData = new foundry.applications.ux.FormDataExtended(this.element);
			const submitData = this._processFormData(null, this.element, formData);
			if (submitData && Object.keys(submitData).length) {
				await this.document.update(submitData);
			}
		}

		if (action === "add") {
			if (typeof itemData[target] === "object") { itemData[target] = Object.values(itemData[target]); }
			return this.item.update({[key]: itemData[target].concat([[""]])});
		}

		if (action === "delete") {
			const li = a.closest(".subItemManagement");
			let removed = foundry.utils.duplicate(this.item.system[target]);
			if (typeof removed === "object") { removed = Object.values(removed); }
			removed.splice(Number(li.dataset.key), 1);
			return this.item.update({[key]: removed });
		}

		if (action === "clone") {
			const li = a.closest(".subItemManagement");
			let cloned = foundry.utils.duplicate(this.item.system[target]);
			if (typeof cloned === "object") { cloned = Object.values(cloned); }
			cloned.push(cloned[Number(li.dataset.key)]);
			return this.item.update({[key]: cloned });
		}
	}

	// Manage accessory choice
	async #onAccessoryChoice(event) {
		let type = event.currentTarget.dataset.type;
		let accessoriesList = {};

		for (let i of this.item.actor.items) {
			if (type === "itemArmor") {
				if ((i.type === "itemArmor" || i.type === "itemGear") && i.system.isAccessory && !i.system.isPlugged) {
					accessoriesList[i.id] = i.name;
				}
			} else {
				if ((i.type === type) && i.system.isAccessory && !i.system.isPlugged) {
					accessoriesList[i.id] = i.name;
				}
			}
		}

		let sortedList = SR5_EntityHelpers.sortObjectValue(accessoriesList);

		let dialogData = {
			accessoriesList: sortedList,
		};

		const dlg = await foundry.applications.handlebars.renderTemplate("systems/sr5/templates/interface/chooseAccessory.html", dialogData);
		const result = await foundry.applications.api.DialogV2.wait({
			window: { title: game.i18n.localize('SR5.ChooseAccessory') },
			content: dlg,
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
		if (!result || result.action !== "ok") return;
		let accessory = result.element.querySelector("[name=accessory]")?.value;
		if (accessory) {
			let aItem = this.actor.items.find(i => i.id === accessory);
			let cloned = foundry.utils.deepClone(this.item.system.accessory);
			cloned.push(aItem.toObject(false));
			this.item.update({"system.accessory": cloned });
			aItem.update({
				"system.isActive": this.item.system.isActive,
				"system.wirelessTurnedOn": this.item.system.wirelessTurnedOn,
			})
		}
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
				property = SR5_EntityHelpers.resolveObjectPath(`item.system.${details}`, this);
			}

			if (property) {
				let detailsHTML = `${game.i18n.localize('SR5.HELP_CalculationDetails')}<ul>`;
				if (property.modifiers && property.modifiers.length) {
					if (property.base) detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationBase')}${game.i18n.localize('SR5.Colons')} ${property.base}</li>`;
					for (let modifier of Object.values(property.modifiers)) {
						detailsHTML = detailsHTML + `<li>${modifier.source} [${modifier.type}]${game.i18n.localize('SR5.Colons')} ${(modifier.isMultiplier ? 'x' : (modifier.value >= 0 ? '+' : ''))}${modifier.value}</li>`;
					}
				}
				detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationTotal')}${game.i18n.localize('SR5.Colons')} ${property.value}</li></ul>`;
				if (helpDetails) helpDetails.innerHTML = detailsHTML;
			}
			target.classList.add("active");
		}
	}

	async _hideHelpText() {
		let target = document.querySelector("#sr5help");
		if (target) {
			target.classList.remove("active");
		}
	}

}
