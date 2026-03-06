import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { computeItemLayout } from "../../interface/compute-item-layout.js";

// Item types that include a footer (condition monitors, price/availability)
const ITEM_FOOTER_TYPES = new Set([
	'SRItem-vierge', 'itemAdeptPower', 'itemAmmunition', 'itemArmor',
	'itemAugmentation', 'itemComplexForm', 'itemContact', 'itemDevice',
	'itemDrug', 'itemFocus', 'itemGear', 'itemKarma', 'itemNuyen',
	'itemPreparation', 'itemProgram', 'itemQuality', 'itemSin',
	'itemSpell', 'itemSprite', 'itemVehicleMod', 'itemWeapon',
]);

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
		position: { width: 650, height: 445 },
		window: { resizable: false },
		form: { submitOnChange: true },
		actions: {
			toggleMode: SR5ItemSheet._onToggleMode,
		},
	};

	static PARTS = {
		sheet: {
			template: "systems/sr5/templates/items/item-sheet.html",
			root: true,
			scrollable: [".sr-panel"],
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

	/** @override — refresh scroll indicators when tabs change */
	changeTab(...args) {
		super.changeTab(...args);
		if (this.element) requestAnimationFrame(() => this._updateScrollFades(this.element));
	}

	/**
	 * Toggle .can-scroll-up / .can-scroll-down on each .sr-panel-wrap
	 * so CSS indicators show when scrollable content is available.
	 */
	_updateScrollFades(root) {
		for (const panel of root.querySelectorAll('.sr-panel')) {
			const wrap = panel.closest('.sr-panel-wrap');
			if (!wrap) continue;
			const update = () => {
				const { scrollTop, scrollHeight, clientHeight } = panel;
				wrap.classList.toggle('can-scroll-up', scrollTop > 2);
				wrap.classList.toggle('can-scroll-down', scrollTop + clientHeight < scrollHeight - 2);
			};
			update();
			if (!panel.dataset.scrollFade) {
				panel.dataset.scrollFade = '1';
				panel.addEventListener('scroll', update, { passive: true });
			}
		}
	}

	static async _onToggleMode(event) {
		event.preventDefault();
		if (!this.isEditable) return;
		const newMode = this.isPlayMode ? SR5ItemSheet.MODES.EDIT : SR5ItemSheet.MODES.PLAY;
		game.user?.setFlag("sr5", `playMode.${this.item.id}`, newMode);
		await this.render({ mode: newMode });
	}

	/** Save focused element info before re-render so we can restore it after. */
	_preRender(context, options) {
		super._preRender(context, options);
		const active = this.element?.querySelector(':focus');
		if (active) {
			this._savedFocus = {
				name: active.getAttribute('name'),
				selectionStart: active.selectionStart ?? null,
				selectionEnd: active.selectionEnd ?? null,
			};
		} else {
			this._savedFocus = null;
		}
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

	/**
	 * Compute the panel/tab layout and sync Foundry's tabGroups.
	 * Each panel gets its own independent tab group.
	 */
	_computeSheetLayout() {
		const layout = computeItemLayout(this.item.type);

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

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const item = this.item;
		context.item = item.toObject(false);
		context.system = item.system;
		context.isEmbedded = item.isEmbedded;
		context.lists = SR5_EntityHelpers.sortTranslations(SR5);
		context.isPlay = this.isPlayMode;
		context.cssClass = this.document.isOwner ? "editable" : "locked";

		// Dynamic layout
		context.layout = this._computeSheetLayout();
		context.hasFooter = ITEM_FOOTER_TYPES.has(item.type);

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

		// Disable form inputs in duplicate block instances to prevent FormDataExtended conflicts
		const seenBlocks = new Set();
		for (const blockEl of el.querySelectorAll("[data-block-id]")) {
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

		// Activate initial tabs for all groups
		for (const [group, tab] of Object.entries(this.tabGroups)) {
			if (tab) this.changeTab(tab, group, { force: true, updatePosition: false });
		}

		// Tab nav click handlers — explicit listeners because data-action="tab" doesn't
		// work reliably with SVG icons inside <a> elements
		el.querySelectorAll(".tabs [data-tab][data-action='tab']").forEach(link => {
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

		// Scroll indicators
		this._updateScrollFades(el);

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

		// Restore focus after re-render (e.g. when tabbing between fields triggers submitOnChange)
		if (this._savedFocus?.name) {
			const target = el.querySelector(`[name="${CSS.escape(this._savedFocus.name)}"]`);
			if (target && target !== document.activeElement) {
				target.focus();
				try {
					if (this._savedFocus.selectionStart != null && typeof target.setSelectionRange === 'function') {
						target.setSelectionRange(this._savedFocus.selectionStart, this._savedFocus.selectionEnd);
					}
				} catch { /* not all input types support setSelectionRange */ }
			}
			this._savedFocus = null;
		}
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
