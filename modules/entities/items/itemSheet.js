import {
  SR5 
} from "../../config.js"
import {
  SR5_EntityHelpers 
} from "../helpers.js"
import {
  SR5_UtilityItem 
} from "./utilityItem.js"
import {
  computeItemLayout 
} from "../../interface/compute-item-layout.js"
import {
  enhanceSelects 
} from "../../helpers/enhance-selects.js"

// Item types that include a footer (condition monitors, price/availability)
const ITEM_FOOTER_TYPES = new Set([
  'SRItem-vierge', 'itemAdeptPower', 'itemAmmunition', 'itemArmor',
  'itemAugmentation', 'itemComplexForm', 'itemContact', 'itemDevice',
  'itemDrug', 'itemFocus', 'itemGear', 'itemKarma', 'itemNuyen', 'itemReputation',
  'itemPreparation', 'itemProgram', 'itemQuality', 'itemSin',
  'itemSpell', 'itemSprite', 'itemVehicleMod', 'itemWeapon',
])

/**
 * Override and extend the core ItemSheet implementation to handle Shadowrun 5 specific item types
 * @type {ItemSheetV2}
 */
export class SR5ItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2
) {
  static MODES = Object.freeze({
    PLAY: 1, EDIT: 2 
  })

  _mode = SR5ItemSheet.MODES.EDIT

  get isPlayMode() { return this._mode === SR5ItemSheet.MODES.PLAY }
  get isEditMode() { return this._mode === SR5ItemSheet.MODES.EDIT }

  static DEFAULT_OPTIONS = {
    classes: ["app", "window-app", "sr5", "SR-Item"],
    position: {
      width: 650, height: 445 
    },
    window: {
      resizable: false 
    },
    form: {
      submitOnChange: true 
    },
    actions: {
      toggleMode: SR5ItemSheet._onToggleMode,
    },
  }

  static PARTS = {
    sheet: {
      template: "systems/sr5/templates/items/item-sheet.hbs",
      root: true,
      scrollable: [".sr-panel"],
    },
  }

  get title() {
    return this.document.name
  }

  /** @override — Foundry's _onClickTab uses event.target which misses when clicking SVG icons inside <a> */
  _onClickTab(event) {
    const button = event.target.closest("[data-tab]")
    if (!button || button.classList.contains("active") || (event.button !== 0)) return
    const tab = button.dataset.tab
    const group = button.dataset.group
    this.changeTab(tab, group, {
      event 
    })
  }

  /** @override — refresh scroll indicators when tabs change */
  changeTab(...args) {
    super.changeTab(...args)
    if (this.element) requestAnimationFrame(() => { if (this.element) this._updateScrollFades(this.element) })
  }

  /**
	 * Toggle .can-scroll-up / .can-scroll-down on each .sr-panel-wrap
	 * so CSS indicators show when scrollable content is available.
	 */
  _updateScrollFades(root) {
    for (const panel of root.querySelectorAll('.sr-panel')) {
      const wrap = panel.closest('.sr-panel-wrap')
      if (!wrap) continue
      const update = () => {
        const {
          scrollTop, scrollHeight, clientHeight 
        } = panel
        wrap.classList.toggle('can-scroll-up', scrollTop > 2)
        wrap.classList.toggle('can-scroll-down', scrollTop + clientHeight < scrollHeight - 2)
      }
      update()
      if (!panel.dataset.scrollFade) {
        panel.dataset.scrollFade = '1'
        panel.addEventListener('scroll', update, {
          passive: true 
        })
      }
    }
  }


  static async _onToggleMode(event) {
    event.preventDefault()
    if (!this.isEditable) return
    const newMode = this.isPlayMode ? SR5ItemSheet.MODES.EDIT : SR5ItemSheet.MODES.PLAY
    game.user?.setFlag("sr5", `playMode.${this.item.id}`, newMode)
    await this.render({
      mode: newMode 
    })
  }

  /** Re-render when sibling items change on the parent actor (e.g. weapon list for weapon focus). */
  _onFirstRender(context, options) {
    super._onFirstRender(context, options)
    if (this.item.actor) {
      const rerender = (item) => {
        if (item.parent?.id === this.item.actor?.id) this.render()
      }
      this._createItemHookId = Hooks.on("createItem", rerender)
      this._deleteItemHookId = Hooks.on("deleteItem", rerender)
      this._updateItemHookId = Hooks.on("updateItem", rerender)
    }
    // Re-render ammo sheets when world itemAmmunitionType items change
    if (this.item.type === 'itemAmmunition') {
      const rerenderOnAmmoType = (item) => {
        if (item.type === 'itemAmmunitionType' && !item.parent) this.render()
      }
      this._ammoTypeCreateHookId = Hooks.on("createItem", rerenderOnAmmoType)
      this._ammoTypeDeleteHookId = Hooks.on("deleteItem", rerenderOnAmmoType)
      this._ammoTypeUpdateHookId = Hooks.on("updateItem", rerenderOnAmmoType)
    }
  }

  _onClose(options) {
    super._onClose(options)
    if (this._createItemHookId) {
      Hooks.off("createItem", this._createItemHookId)
      this._createItemHookId = null
    }
    if (this._deleteItemHookId) {
      Hooks.off("deleteItem", this._deleteItemHookId)
      this._deleteItemHookId = null
    }
    if (this._updateItemHookId) {
      Hooks.off("updateItem", this._updateItemHookId)
      this._updateItemHookId = null
    }
    if (this._ammoTypeCreateHookId) {
      Hooks.off("createItem", this._ammoTypeCreateHookId)
      this._ammoTypeCreateHookId = null
    }
    if (this._ammoTypeDeleteHookId) {
      Hooks.off("deleteItem", this._ammoTypeDeleteHookId)
      this._ammoTypeDeleteHookId = null
    }
    if (this._ammoTypeUpdateHookId) {
      Hooks.off("updateItem", this._ammoTypeUpdateHookId)
      this._ammoTypeUpdateHookId = null
    }
  }

  /** Save focused element info before re-render so we can restore it after. */
  _preRender(context, options) {
    super._preRender(context, options)
    const active = this.element?.querySelector(':focus')
    if (active) {
      this._savedFocus = {
        name: active.getAttribute('name'),
        selectionStart: active.selectionStart ?? null,
        selectionEnd: active.selectionEnd ?? null,
      }
    } else {
      this._savedFocus = null
    }
    // Save scroll positions for all panels
    const panels = this.element?.querySelectorAll('.sr-panel')
    this._savedScrollPositions = panels ? Array.from(panels).map(p => p.scrollTop) : []
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options)
    if (options.mode && this.isEditable) this._mode = options.mode
    else if (options.renderContext === `create${this.document.documentName}`) {
      this._mode = SR5ItemSheet.MODES.EDIT
    } else if (!options.mode && this.document?.id) {
      const saved = game.user?.getFlag("sr5", `playMode.${this.document.id}`)
      if (saved) this._mode = saved
    }
  }

  async _renderFrame(options) {
    const frame = await super._renderFrame(options)
    const header = frame.querySelector(".window-header")
    const closeButton = header?.querySelector('[data-action="close"]')

    // Play/Edit toggle button
    if (this.isEditable) {
      const toggleBtn = document.createElement("button")
      toggleBtn.type = "button"
      toggleBtn.classList.add("header-control", "icon", "fa-solid")
      toggleBtn.dataset.action = "toggleMode"
      if (closeButton) closeButton.before(toggleBtn)
      else header?.appendChild(toggleBtn)
    }

    // Move close button to the end
    if (closeButton) header?.appendChild(closeButton)

    return frame
  }

  // Strip ammo-derived fields from form submission to prevent persisting derived values
  _processFormData(event, form, formData) {
    const submitData = super._processFormData(event, form, formData)
    if (this.item.type === 'itemWeapon' && this.item.system.ammunition?.type) {
      delete submitData['system.damageType']
      delete submitData['system.damageElement']
      delete submitData['system.damageElementSecond']
    }
    return submitData
  }

  /**
	 * Compute the panel/tab layout and sync Foundry's tabGroups.
	 * Each panel gets its own independent tab group.
	 */
  _computeSheetLayout() {
    const layout = computeItemLayout(this.item.type)

    // Sync Foundry's tabGroups — one independent group per panel
    for (const panel of layout.panels) {
      const group = panel.group
      if (!this.tabGroups[group] && panel.tabs.length > 0) {
        this.tabGroups[group] = panel.tabs[0].id
      }
      const activeId = this.tabGroups[group]
      if (activeId && !panel.tabs.some(t => t.id === activeId)) {
        this.tabGroups[group] = panel.tabs[0]?.id ?? null
      }
      for (const tab of panel.tabs) {
        tab.cssClass = tab.id === this.tabGroups[group] ? "active" : ""
      }
    }

    // Clean up stale groups
    const validGroups = new Set(layout.panels.map(p => p.group))
    for (const key of Object.keys(this.tabGroups)) {
      if (!validGroups.has(key)) delete this.tabGroups[key]
    }

    return layout
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    const item = this.item
    context.item = item.toObject(false)
    context.system = item.system
    context.isEmbedded = item.isEmbedded
    context.owner = this.document.isOwner
    context.lists = SR5_EntityHelpers.sortTranslations(SR5)
    context.isPlay = this.isPlayMode

    // Custom ammunition type choices for weapon ammo dropdown
    if (item.type === 'itemWeapon') {
      context.weaponAmmoTypeChoices = game.items
        .filter(i => i.type === 'itemAmmunitionType')
        .map(i => {
          const slug = i.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
          return {
            slug,
            name: i.name,
            selected: item.system.ammunition.type === slug
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name))
      // Check if the current ammo type is a custom one (not in the built-in lists)
      const currentType = item.system.ammunition.type
      context.weaponAmmoTypeLinked = currentType && !SR5.allAmmunitionTypes?.[currentType]
      // When custom, don't pass the slug to selectOptions (avoids localization warning)
      context.weaponAmmoBuiltinType = context.weaponAmmoTypeLinked ? '' : currentType
      // Resolved ammo type display label for summary/chat
      if (context.weaponAmmoTypeLinked) {
        const match = context.weaponAmmoTypeChoices.find(c => c.selected)
        context.weaponAmmoTypeLabel = match ? `${game.i18n.localize('SR5.Custom')} (${match.name})` : game.i18n.localize('SR5.Custom')
      } else if (currentType && SR5.allAmmunitionTypes[currentType]) {
        context.weaponAmmoTypeLabel = game.i18n.localize(SR5.allAmmunitionTypes[currentType])
      } else {
        context.weaponAmmoTypeLabel = currentType || ''
      }
    }
    context.cssClass = this.document.isOwner ? "editable" : "locked"

    // Weapon focus: populate weapon choices from parent actor
    if (item.type === "itemFocus" && item.system.type === "weapon" && item.actor) {
      context.weaponChoices = SR5_UtilityItem._generateWeaponFocusWeaponList(item.actor)
    }

    // Qi focus: populate adept power choices from parent actor
    if (item.type === "itemFocus" && item.system.type === "qi" && item.actor) {
      context.adeptPowerChoices = SR5_UtilityItem._generateQiFocusAdeptPowerList(item.actor)
    }

    // Ammunition type choices for itemAmmunition (world itemAmmunitionType items)
    if (item.type === 'itemAmmunition') {
      context.ammunitionTypeChoices = game.items
        .filter(i => i.type === 'itemAmmunitionType')
        .map(i => ({
          uuid: i.uuid,
          name: i.name,
          selected: i.uuid === item.system.ammunitionTypeUuid
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      // When a custom type is linked, don't pass the slug to selectOptions (avoids localization warning)
      context.ammoBuiltinType = item.system.ammunitionTypeUuid ? '' : item.system.type
    }

    // Dynamic layout
    context.layout = this._computeSheetLayout()
    context.hasFooter = ITEM_FOOTER_TYPES.has(item.type)

    return context
  }

  _onRender(context, options) {
    super._onRender(context, options)
    const el = this.element

    // Ammunition type select: handle "Custom" selection
    const ammoTypeSelect = el.querySelector('.sr-ammo-type-select')
    if (ammoTypeSelect) {
      ammoTypeSelect.addEventListener('change', async (ev) => {
        const val = ev.target.value
        if (val === 'custom') {
          ev.preventDefault()
          ev.stopPropagation()
          // Set a placeholder UUID to trigger re-render with second dropdown
          await this.item.update({
            'system.type': '',
            'system.ammunitionTypeUuid': 'pending'
          })
        } else if (this.item.system.ammunitionTypeUuid) {
          ev.preventDefault()
          ev.stopPropagation()
          // Built-in type selected — clear linked ammo type and set the new type
          await this.item.update({
            'system.type': val,
            'system.ammunitionTypeUuid': ''
          })
        }
        // For built-in types with no linked ammo: let the event bubble to form submitOnChange
      })
    }

    // Second dropdown: custom ammo type selection
    const customSelect = el.querySelector('.sr-ammo-type-custom-select')
    if (customSelect) {
      customSelect.addEventListener('change', async (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        const uuid = ev.target.value
        if (!uuid) return
        const ammoType = game.items.get(uuid.split('.').pop())
        const slug = ammoType?.name?.toLowerCase()?.replace(/[^a-z0-9]+/g, '_')?.replace(/^_|_$/g, '') || ''
        await this.item.update({
          'system.type': slug,
          'system.ammunitionTypeUuid': uuid
        })
      })
    }

    // Weapon ammunition type select: explicitly handle all changes
    const weaponAmmoSelect = el.querySelector('.sr-weapon-ammo-type-select')
    if (weaponAmmoSelect) {
      weaponAmmoSelect.addEventListener('change', async (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        const val = ev.target.value
        if (val === 'custom') {
          await this.item.update({
            'system.ammunition.type': '_custom_pending'
          })
        } else {
          await this.item.update({
            'system.ammunition.type': val
          })
        }
      })
    }

    // Weapon second dropdown: custom ammo type selection
    const weaponCustomSelect = el.querySelector('.sr-weapon-ammo-type-custom-select')
    if (weaponCustomSelect) {
      weaponCustomSelect.addEventListener('change', async (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
        const slug = ev.target.value
        if (!slug) return
        await this.item.update({
          'system.ammunition.type': slug
        })
      })
    }

    // Play/Edit mode classes
    el.classList.toggle("sr-mode-edit", this.isEditMode)
    el.classList.toggle("sr-mode-play", this.isPlayMode)

    // Update toggle button icon
    const toggleBtn = el.querySelector('[data-action="toggleMode"]')
    if (toggleBtn) {
      toggleBtn.classList.toggle("fa-lock", this.isPlayMode)
      toggleBtn.classList.toggle("fa-lock-open", this.isEditMode)
      toggleBtn.dataset.tooltip = this.isPlayMode ? "SR5.SwitchToEdit" : "SR5.SwitchToPlay"
    }

    // Disable form inputs in duplicate block instances to prevent FormDataExtended conflicts
    const seenBlocks = new Set()
    for (const blockEl of el.querySelectorAll("[data-block-id]")) {
      const blockId = blockEl.dataset.blockId
      if (seenBlocks.has(blockId)) {
        for (const input of blockEl.querySelectorAll("input[name], select[name], textarea[name]")) {
          input.removeAttribute("name")
          input.setAttribute("tabindex", "-1")
        }
      } else {
        seenBlocks.add(blockId)
      }
    }

    // Activate initial tabs for all groups
    for (const [group, tab] of Object.entries(this.tabGroups)) {
      if (tab) this.changeTab(tab, group, {
        force: true, updatePosition: false 
      })
    }

    // Tab nav click handlers — explicit listeners because data-action="tab" doesn't
    // work reliably with SVG icons inside <a> elements
    el.querySelectorAll(".tabs [data-tab][data-action='tab']").forEach(link => {
      link.addEventListener("click", (event) => {
        event.preventDefault()
        event.stopPropagation()
        const tab = link.dataset.tab
        const group = link.dataset.group
        if (tab && group && !link.classList.contains("active")) {
          this.changeTab(tab, group, {
            event 
          })
        }
      })
    })

    // Custom dropdown enhancement
    enhanceSelects(el)

    // Scroll indicators
    this._updateScrollFades(el)

    // Sub-item management (add/delete/clone effects, licenses, etc.)
    el.querySelectorAll(".subItem").forEach(node => node.addEventListener("click", this.#onManageSubItem.bind(this)))

    // Accessory choice
    el.querySelectorAll(".accessoryChoice").forEach(node => node.addEventListener("click", this.#onAccessoryChoice.bind(this)))

    // Item-based accessory checkbox toggles (avoid form submission destroying item data)
    el.querySelectorAll(".accessory-toggle").forEach(node => node.addEventListener("change", this.#onAccessoryToggle.bind(this)))

    // Help Display (mouseover/mouseout — cannot use data-action)
    el.querySelectorAll("[data-helpTitle]").forEach(node => {
      node.addEventListener("mouseover", this._displayHelpText.bind(this))
      node.addEventListener("mouseout", this._hideHelpText.bind(this))
    })

    // Condition monitor boxes
    el.querySelectorAll(".boxes:not(.box-disabled)").forEach(node => node.addEventListener("click", (ev) => {
      let itemData = foundry.utils.duplicate(this.item)
      let index = Number(ev.currentTarget.dataset.index)
      let target = ev.currentTarget.closest(".SR-MoniteurCases").dataset.target

      let value = foundry.utils.getProperty(itemData, target)
      if (value == index + 1)
        foundry.utils.setProperty(itemData, target, index)
      else foundry.utils.setProperty(itemData, target, index + 1)

      this.item.update(itemData)
    }))

    // Restore focus after re-render (e.g. when tabbing between fields triggers submitOnChange)
    if (this._savedFocus?.name) {
      const target = el.querySelector(`[name="${CSS.escape(this._savedFocus.name)}"]`)
      if (target && target !== document.activeElement) {
        target.focus()
        try {
          if (this._savedFocus.selectionStart != null && typeof target.setSelectionRange === 'function') {
            target.setSelectionRange(this._savedFocus.selectionStart, this._savedFocus.selectionEnd)
          }
        } catch { /* not all input types support setSelectionRange */ }
      }
      this._savedFocus = null
    }

    // Restore scroll positions for all panels
    if (this._savedScrollPositions?.length) {
      const panels = el.querySelectorAll('.sr-panel')
      this._savedScrollPositions.forEach((top, i) => {
        if (panels[i]) panels[i].scrollTop = top
      })
      this._savedScrollPositions = null
    }
  }

  // Manage "Sub Item", accessory, licenses, effects...
  async #onManageSubItem(event) {
    event.preventDefault()
    const a = event.currentTarget
    const itemData = this.item.system
    let target = a.dataset.binding
    let action = a.dataset.subaction
    let key = `system.${target}`

    // Submit any unsaved changes before modifying sub-items
    if (this.isEditable) {
      const formData = new foundry.applications.ux.FormDataExtended(this.element)
      const submitData = this._processFormData(null, this.element, formData)
      if (submitData && Object.keys(submitData).length) {
        await this.document.update(submitData)
      }
    }

    if (action === "add") {
      if (typeof itemData[target] === "object") { itemData[target] = Object.values(itemData[target]) }
      return this.item.update({
        [key]: itemData[target].concat([[""]])
      })
    }

    if (action === "delete") {
      const li = a.closest(".subItemManagement")
      let removed = foundry.utils.duplicate(this.item.system[target])
      if (typeof removed === "object") { removed = Object.values(removed) }
      removed.splice(Number(li.dataset.key), 1)
      return this.item.update({
        [key]: removed 
      })
    }

    if (action === "clone") {
      const li = a.closest(".subItemManagement")
      let cloned = foundry.utils.duplicate(this.item.system[target])
      if (typeof cloned === "object") { cloned = Object.values(cloned) }
      cloned.push(cloned[Number(li.dataset.key)])
      return this.item.update({
        [key]: cloned 
      })
    }
  }

  // Manage accessory choice
  async #onAccessoryChoice(event) {
    let type = event.currentTarget.dataset.type
    let accessoriesList = {
    }

    // For weapons, build set of already-attached accessory IDs
    let attachedIds = new Set()
    if (type === "itemWeapon") {
      const attached = this.item.system.accessory || []
      const arr = Array.isArray(attached) ? attached : Object.values(attached)
      for (const a of arr) {
        if (a._id) attachedIds.add(a._id)
      }
    }

    for (let i of this.item.actor.items) {
      if (type === "itemArmor") {
        if ((i.type === "itemArmor" || i.type === "itemGear") && i.system.isAccessory && !i.system.isPlugged) {
          accessoriesList[i.id] = i.name
        }
      } else if (type === "itemWeapon") {
        if (i.type === "itemWeapon" && i.system.isAccessory && !i.system.isPlugged && !attachedIds.has(i.id)) {
          accessoriesList[i.id] = i.name
        }
      } else {
        if ((i.type === type) && i.system.isAccessory && !i.system.isPlugged) {
          accessoriesList[i.id] = i.name
        }
      }
    }

    let sortedList = SR5_EntityHelpers.sortObjectValue(accessoriesList)

    let dialogData = {
      accessoriesList: sortedList
    }

    const dlg = await foundry.applications.handlebars.renderTemplate("systems/sr5/templates/interface/chooseAccessory.hbs", dialogData)
    const result = await foundry.applications.api.DialogV2.wait({
      window: {
        title: game.i18n.localize('SR5.ChooseAccessory') 
      },
      content: dlg,
      buttons: [
        {
          action: "ok",
          label: "Ok",
          default: true,
          callback: (event, button, dialog) => ({
            action: "ok", element: dialog.element 
          }),
        },
        {
          action: "cancel",
          label: "Cancel",
          callback: () => ({
            action: "cancel" 
          }),
        },
      ],
      rejectClose: false,
    })
    if (!result || result.action !== "ok") return
    let accessory = result.element.querySelector("[name=accessory]")?.value
    if (accessory) {
      let aItem = this.actor.items.find(i => i.id === accessory)
      let accObj = aItem.toObject(false)
      // Set top-level flags for template/processing compatibility
      accObj.isActive = true
      accObj.isFree = false
      let cloned = foundry.utils.deepClone(this.item.system.accessory)
      if (typeof cloned === "object" && !Array.isArray(cloned)) cloned = Object.values(cloned)
      cloned.push(accObj)
      await this.item.update({
        "system.accessory": cloned
      })
      await aItem.update({
        "system.isActive": this.item.system.isActive,
        "system.wirelessTurnedOn": this.item.system.wirelessTurnedOn,
        "system.isPlugged": true,
      })
    }
  }

  // Toggle isFree/isActive on item-based accessories without form submission
  async #onAccessoryToggle(event) {
    event.preventDefault()
    event.stopPropagation()
    const index = Number(event.currentTarget.dataset.index)
    const field = event.currentTarget.dataset.field
    const checked = event.currentTarget.checked
    let accessories = foundry.utils.deepClone(this.item.system.accessory)
    if (typeof accessories === "object" && !Array.isArray(accessories)) {
      accessories = Object.values(accessories)
    }
    if (accessories[index]) {
      accessories[index][field] = checked
      await this.item.update({
        "system.accessory": accessories
      })
    }
  }

  /* -------------------------------------------- */

  async _displayHelpText(event) {
    if (!game.settings.get("sr5", "sr5Help.active")) return false

    let target = document.querySelector("#sr5help")
    if (!target) return

    let property
    const helpTitle = document.querySelector("#sr5helpTitle")
    const helpMessage = document.querySelector("#sr5helpMessage")
    const helpDetails = document.querySelector("#sr5helpDetails")

    if (helpTitle) helpTitle.innerHTML = ""
    if (helpMessage) helpMessage.innerHTML = ""
    if (helpDetails) helpDetails.innerHTML = ""

    {
      const el = event.currentTarget
      if (helpTitle) helpTitle.innerHTML = el.dataset.helptitle || ""

      if (el.dataset.helpmessage && helpMessage) helpMessage.innerHTML = "<div class='helpMessage'><em>" + el.dataset.helpmessage + "</em></div>"

      let details = el.dataset.helpdetails
      if (details) {
        property = SR5_EntityHelpers.resolveObjectPath(`item.system.${details}`, this)
      }

      if (property) {
        let detailsHTML = `${game.i18n.localize('SR5.HELP_CalculationDetails')}<ul>`
        if (property.modifiers && property.modifiers.length) {
          if (property.base) detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationBase')}${game.i18n.localize('SR5.Colons')} ${property.base}</li>`
          for (let modifier of Object.values(property.modifiers)) {
            detailsHTML = detailsHTML + `<li>${modifier.source} [${modifier.type}]${game.i18n.localize('SR5.Colons')} ${(modifier.isMultiplier ? 'x' : (modifier.value >= 0 ? '+' : ''))}${modifier.value}</li>`
          }
        }
        detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationTotal')}${game.i18n.localize('SR5.Colons')} ${property.value}</li></ul>`
        if (helpDetails) helpDetails.innerHTML = detailsHTML
      }
      target.classList.add("active")
    }
  }

  async _hideHelpText() {
    let target = document.querySelector("#sr5help")
    if (target) {
      target.classList.remove("active")
    }
  }

}
