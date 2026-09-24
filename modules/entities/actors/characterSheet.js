import {
  ActorSheetSR5 
} from "./baseSheet.js"

/**
 * An Actor sheet for player character type actors in the Shadowrun 5 system.
 */
export class SR5ActorSheet extends ActorSheetSR5 {
  constructor(...args) {
    super(...args)

    this._shownKarmaGains = true
    this._shownKarmaExpenses = true
    this._shownNuyenGains = true
    this._shownNuyenExpenses = true
    this._shownReputationGains = true
    this._shownReputationExpenses = true
    this._shownUntrainedSkills = false
    this._shownNonRollableMatrixActions = false
    this._shownInactiveMatrixPrograms = true
    this._shownUntrainedGroups = false
    this._filters = {
      skills: "",
      matrixActions: "",
    }
  }

  static DEFAULT_OPTIONS = {
    classes: ["app", "window-app", "sr5", "actor", "pc"],
    position: {
      width: 800, height: 618 
    },
    window: {
      resizable: false 
    },
  }

  static PARTS = {
    sheet: {
      template: "systems/sr5/templates/actors/pc-sheet.hbs",
      root: true,
      scrollable: [".sr-panel"],
    },
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)

    this._prepareItems(context.actor)
    this._prepareSkills(context.actor)
    this._prepareSkillGroups(context.actor)
    this._prepareMatrixActions(context.actor)

    context.rulesMatrixGrid = game.settings.get("sr5", "sr5MatrixGridRules")
    context.rulesCalledShot = game.settings.get("sr5", "sr5CalledShotsRules")
    context.rulesKillCode = game.settings.get("sr5", "sr5KillCodeRules")
    context.matrixActionsRigger5 = game.settings.get("sr5", "sr5Rigger5Actions")

    return context
  }

  _prepareSkills(actor) {
    const activeSkills = {
    }
    for (let [key, skill] of Object.entries(actor.system.skills)) {
      if (skill.rating.value > 0 || this._shownUntrainedSkills) activeSkills[key] = skill
    }
    actor.system.skills = activeSkills
  }

  _prepareSkillGroups(actor) {
    const activeGroups = {
    }
    for (let [key, group] of Object.entries(actor.system.skillGroups)) {
      if (group.value > 0 || this._shownUntrainedGroups) {
        activeGroups[key] = group
      }
    }
    actor.system.skillGroups = activeGroups
  }

  _prepareMatrixActions(actor) {
    const activeMatrixActions = {
    }
    let hasAttack = (actor.system.matrix.attributes.attack.value > 0) ? true : false
    let hasSleaze = (actor.system.matrix.attributes.sleaze.value > 0) ? true : false
    let killCodeRules = game.settings.get("sr5", "sr5KillCodeRules") ? true : false
    let rigger5Actions = game.settings.get("sr5", "sr5Rigger5Actions") ? true : false
    for (let [key, matrixAction] of Object.entries(actor.system.matrix.actions)) {
      let linkedAttribute = matrixAction.limit?.linkedAttribute
      if ( (matrixAction.source === "core" || (killCodeRules && matrixAction.source === "killCode") || (rigger5Actions && matrixAction.source === "rigger5")) && ((matrixAction.test?.dicePool >= 0 && (linkedAttribute === "attack" && hasAttack) ) ||
        (matrixAction.test?.dicePool >= 0 && (linkedAttribute === "sleaze" && hasSleaze) ) ||
        (matrixAction.test?.dicePool > 0 && (linkedAttribute === "firewall" || linkedAttribute === "dataProcessing" || linkedAttribute === "") ) ||
        this._shownNonRollableMatrixActions)) {
        activeMatrixActions[key] = matrixAction
      }
    }
    actor.system.matrix.actions = activeMatrixActions
  }

  _prepareItems(actor) {
    const knowledges = []
    const languages = []
    const weapons = []
    const armors = []
    const augmentations = []
    const qualities = []
    const spells = []
    const focuses = []
    const adeptPowers = []
    const metamagics = []
    const gears = []
    const spirits = []
    const cyberdecks = []
    const programs = []
    const karmas = []
    const nuyens = []
    const contacts = []
    const lifestyles = []
    const sins = []
    const vehicles = []
    const vehiclesMod = []
    const martialArts = []
    const powers = []
    const preparations = []
    const complexForms = []
    const sprites = []
    const echoes = []
    const ammunitions = []
    const externalEffects = []
    const traditions = []
    const rituals = []
    const reputations = []
    const storages = []

    // Iterate through items, allocating to containers
    for (let i of actor.items) {
      if (i.type === "itemKnowledge") knowledges.push(i)
      else if (i.type === "itemLanguage") languages.push(i)
      else if (i.type === "itemQuality") qualities.push(i)
      else if (i.type === "itemSpell") spells.push(i)
      else if (i.type === "itemFocus") focuses.push(i)
      else if (i.type === "itemWeapon") weapons.push(i)
      else if (i.type === "itemArmor") armors.push(i)
      else if (i.type === "itemAugmentation") augmentations.push(i)
      else if (i.type === "itemAdeptPower") adeptPowers.push(i)
      else if (i.type === "itemMartialArt") martialArts.push(i)
      else if (i.type === "itemMetamagic") metamagics.push(i)
      else if (i.type === "itemGear") gears.push(i)
      else if (i.type === "itemSpirit") spirits.push(i)
      else if (i.type === "itemDevice") cyberdecks.push(i)
      else if (i.type === "itemProgram") {
        if (i.system.isActive === true || i.system.type === "agent" || this._shownInactiveMatrixPrograms) programs.push(i)
      }
      else if (i.type === "itemKarma") {
        if (i.system.type == "gain" && this._shownKarmaGains) karmas.push(i)
        if (i.system.type == "loss" && this._shownKarmaExpenses) karmas.push(i)
      }
      else if (i.type === "itemNuyen") {
        if (i.system.type == "gain" && this._shownNuyenGains) nuyens.push(i)
        if (i.system.type == "loss" && this._shownNuyenExpenses) nuyens.push(i)
      }
      else if (i.type === "itemContact") contacts.push(i)
      else if (i.type === "itemLifestyle") lifestyles.push(i)
      else if (i.type === "itemStorage") storages.push(i)
      else if (i.type === "itemSin") sins.push(i)
      else if (i.type === "itemVehicle") vehicles.push(i)
      else if (i.type === "itemVehicleMod") vehiclesMod.push(i)
      else if (i.type === "itemPower") powers.push(i)
      else if (i.type === "itemPreparation") preparations.push(i)
      else if (i.type === "itemComplexForm") complexForms.push(i)
      else if (i.type === "itemSprite") sprites.push(i)
      else if (i.type === "itemEcho") echoes.push(i)
      else if (i.type === "itemAmmunition") ammunitions.push(i)
      else if (i.type === "itemEffect") externalEffects.push(i)
      else if (i.type === "itemDrug") gears.push(i)
      else if (i.type === "itemTradition") traditions.push(i)
      else if (i.type === "itemRitual") rituals.push(i)
      else if (i.type === "itemReputation") {
        if (i.system.type == "gain" && this._shownReputationGains) reputations.push(i)
        if (i.system.type == "loss" && this._shownReputationExpenses) reputations.push(i)
      }
    }

    actor.knowledges = knowledges
    actor.languages = languages
    actor.weapons = weapons
    actor.weaponAccessories = weapons
      .filter(w => w.system.category === "weaponAccessory")
      .sort((a, b) => a.name.localeCompare(b.name))
    actor.armors = armors
    actor.augmentations = augmentations
    actor.qualities = qualities
    actor.spells = spells
    actor.focuses = focuses
    actor.adeptPowers = adeptPowers
    actor.metamagics = metamagics
    actor.spirits = spirits
    actor.gears = gears
    actor.cyberdecks = cyberdecks
    actor.programs = programs
    actor.karmas = karmas
    actor.nuyens = nuyens
    actor.contacts = contacts
    actor.lifestyles = lifestyles
    actor.sins = sins
    actor.vehicles = vehicles
    actor.vehiclesMod = vehiclesMod
    actor.martialArts = martialArts
    actor.powers = powers
    actor.preparations = preparations
    actor.complexForms = complexForms
    actor.sprites = sprites
    actor.echoes = echoes
    actor.ammunitions = ammunitions
    actor.externalEffects = externalEffects
    actor.traditions = traditions
    actor.rituals = rituals
    actor.reputations = reputations
    actor.storages = this._prepareStorages(actor, storages)
    this._applyStoredGear(actor, storages)
  }

  /**
   * Stored gear leaves the lists a player reads to act — Combat, Matrix,
   * Magic — because none of it is within reach. It stays in the lists that
   * say what the character owns, greyed out and saying where it sits, so
   * nobody thinks their gear has gone missing.
   */
  _applyStoredGear(actor, storages) {
    const names = new Map(storages.map(s => [s._id, s.name]))
    const isStored = i => !!i.system?.storedIn

    // Out of reach: these lists answer "what can I do right now?"
    actor.weapons = actor.weapons.filter(i => !isStored(i))
    actor.weaponAccessories = actor.weaponAccessories.filter(i => !isStored(i))
    actor.armors = actor.armors.filter(i => !isStored(i))
    actor.ammunitions = actor.ammunitions.filter(i => !isStored(i))
    actor.cyberdecks = actor.cyberdecks.filter(i => !isStored(i))
    actor.programs = actor.programs.filter(i => !isStored(i))
    actor.focuses = actor.focuses.filter(i => !isStored(i))

    // Still listed: these answer "what do I own?"
    for (const list of [actor.gears, actor.vehicles, actor.augmentations]) {
      for (const item of list) {
        if (isStored(item)) item.storedInName = names.get(item.system.storedIn) ?? ""
      }
    }
  }

  /**
   * Build the view model for the Storage tab: each storage with what sits
   * inside it. Stored items are left in their usual lists on purpose — being
   * stored does not yet take an item out of play.
   */
  // One icon per kind of storage. Font Awesome, so it takes the sheet's own
  // text colour and stays readable on a light surface.
  static STORAGE_ICONS = {
    stash: "fa-house",
    safe: "fa-vault",
    backpack: "fa-suitcase",
    cache: "fa-box-archive",
    garage: "fa-warehouse",
  }

  _prepareStorages(actor, storages) {
    const stored = actor.items.filter(i => i.system?.storedIn)
    return storages
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(storage => {
        const contents = stored
          .filter(i => i.system.storedIn === storage._id)
          .sort((a, b) => a.name.localeCompare(b.name))
        const max = storage.system.capacity.value
        // What the lot is worth. Item prices, not the actor's nuyen: that
        // field sums every transaction and is not a balance.
        const value = contents.reduce((total, i) => {
          const price = i.system.price?.value ?? i.system.price?.base ?? 0
          return total + price * (i.system.quantity ?? 1)
        }, 0)
        return {
          _id: storage._id,
          name: storage.name,
          img: storage.img,
          type: storage.system.type,
          icon: SR5ActorSheet.STORAGE_ICONS[storage.system.type] ?? "fa-box",
          isDeployable: storage.system.isDeployable,
          isDeployed: storage.system.isDeployed,
          contents: contents,
          used: contents.length,
          max: max,
          value: value,
          hasLimit: max > 0,
          isFull: max > 0 && contents.length >= max,
        }
      })
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    switch(itemData.type){
      case "itemTradition":
        for (let i of this.actor.items){
          if (i.type === "itemTradition") {
            return ui.notifications.warn(game.i18n.localize('SR5.WARN_OnlyOneTradition'))
          }
        }
        return super._onDropItemCreate(itemData)
      case "itemDevice":
        for (let i of this.actor.items){
          if (i.type === "itemDevice" && i.system.isActive) {
            return super._onDropItemCreate(itemData)
          }
        }
        itemData.system.isActive = true
        return super._onDropItemCreate(itemData)
      case "itemArmor":
        for (let i of this.actor.items){
          if (i.type === "itemArmor" && i.system.isActive) {
            return super._onDropItemCreate(itemData)
          }
        }
        itemData.system.isActive = true
        return super._onDropItemCreate(itemData)
      case "itemWeapon":
        for (let i of this.actor.items){
          if (i.type === "itemWeapon" && i.system.isActive && (i.system.category === itemData.system.category)) {
            return super._onDropItemCreate(itemData)
          }
        }
        itemData.system.isActive = true
        return super._onDropItemCreate(itemData)
      case "itemFocus":
      case "itemAugmentation":
      case "itemQuality":
      case "itemEcho":
        itemData.system.isActive = true
        return super._onDropItemCreate(itemData)
      case "itemAdeptPower":
      case "itemPower":
      case "itemMartialArt" :
        if (itemData.system.actionType === "permanent") itemData.system.isActive = true
        return super._onDropItemCreate(itemData)
      case "itemVehicleMod":
        return ui.notifications.info(game.i18n.localize('SR5.INFO_ForbiddenItemType'))
      default:
        return super._onDropItemCreate(itemData)
    }
  }
}
