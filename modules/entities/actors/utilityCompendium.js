import {
  SR5_SystemHelpers 
} from "../../system/utilitySystem.js"
import {
  SR5 
} from "../../config.js"

export class SR5_CompendiumUtility extends Actor {

  static _warnedMissingCompendiums = new Set()
  static _compendiumCache = new Map()
  static _compendiumChoices = {
  }

  // Compendiums used to build actors: each one can be chosen by the GM in the system settings.
  // "auto" uses the sr5-compendiums module packs for the world language.
  static CATEGORIES = {
    creaturePowers: {
      setting: "compendium.creaturePowers", itemType: "itemPower", defaults: ["powers-creatures"]
    },
    spritePowers: {
      setting: "compendium.spritePowers", itemType: "itemSpritePower", defaults: ["powers-sprites"]
    },
    baseWeapons: {
      setting: "compendium.baseWeapons", itemType: "itemWeapon", defaults: ["weapons-melee", "weapons-ranged"]
    },
  }

  static registerSettings() {
    for (const [key, category] of Object.entries(SR5_CompendiumUtility.CATEGORIES)) {
      const label = key.charAt(0).toUpperCase() + key.slice(1)
      game.settings.register("sr5", category.setting, {
        name: `SR5.SETTINGS_Compendium${label}_T`,
        hint: `SR5.SETTINGS_Compendium${label}_D`,
        scope: "world",
        config: true,
        type: String,
        default: "auto",
        // Filled on ready, once compendiums are available
        choices: SR5_CompendiumUtility._compendiumChoices,
        onChange: () => SR5_CompendiumUtility._compendiumCache.clear()
      })
    }
  }

  static refreshCompendiumChoices() {
    const choices = SR5_CompendiumUtility._compendiumChoices
    for (const key of Object.keys(choices)) delete choices[key]
    choices.auto = game.i18n.localize("SR5.SETTINGS.CompendiumAuto")
    for (const pack of game.packs.filter(p => p.documentName === "Item")) {
      choices[pack.collection] = `${pack.title} (${pack.collection})`
    }
    // Keep a saved choice selectable even if its compendium is no longer available
    for (const category of Object.values(SR5_CompendiumUtility.CATEGORIES)) {
      const value = game.settings.get("sr5", category.setting)
      if (!(value in choices)) choices[value] = game.i18n.format("SR5.SETTINGS.CompendiumMissing", {
        name: value
      })
    }
  }

  static getCompendiumIds(categoryKey) {
    const category = SR5_CompendiumUtility.CATEGORIES[categoryKey]
    const chosen = game.settings.get("sr5", category.setting)
    if (chosen && chosen !== "auto") return [chosen]
    const language = game.settings.get("core", "language")
    if (!language) SR5_SystemHelpers.srLog(0, "Could not determine core language used in getCompendiumIds()")
    return category.defaults.map(name => `sr5-compendiums.${language}_${name}`)
  }

  //Get the items of a category from its configured compendium(s)
  //Return an array of items
  static async getCategoryItems(categoryKey) {
    const {
      itemType
    } = SR5_CompendiumUtility.CATEGORIES[categoryKey]
    const items = []
    for (const compendiumId of SR5_CompendiumUtility.getCompendiumIds(categoryKey)) {
      const documents = await SR5_CompendiumUtility.getCompendiumDocuments(compendiumId)
      // A single compendium may hold every category: keep only the expected item type
      items.push(...documents.filter(i => i.type === itemType))
    }
    return items
  }

  static async getCompendiumDocuments(compendiumId) {
    const compendiumPack = game.packs.get(compendiumId)
    if (!compendiumPack) {
      SR5_SystemHelpers.srLog(1, `No compendium named '${compendiumId}' found, could not add items to actor`)
      // Tell the GM once per session: without it, actors are created without their base items/powers
      if (game.user.isGM && !SR5_CompendiumUtility._warnedMissingCompendiums.has(compendiumId)) {
        SR5_CompendiumUtility._warnedMissingCompendiums.add(compendiumId)
        ui.notifications.warn(game.i18n.format("SR5.WARN_MissingCompendium", {
          name: compendiumId
        }), {
          permanent: true
        })
      }
      return []
    }
    // The same compendium can back several categories during one actor creation: load it once
    const cached = SR5_CompendiumUtility._compendiumCache.get(compendiumId)
    if (cached && (Date.now() - cached.time < 10000)) return cached.documents
    const documents = await compendiumPack.getDocuments()
    SR5_CompendiumUtility._compendiumCache.set(compendiumId, {
      time: Date.now(), documents
    })
    return documents
  }

  //Get base items
  static async getBaseItems(actorType, actorSubType, actorLevel) {
    let baseItems = []

    if (actorType === "actorPc" || actorType === "actorGrunt") {
      const weapons = await SR5_CompendiumUtility.getCategoryItems("baseWeapons")
      baseItems = await SR5_CompendiumUtility.findBaseItemInCompendium(baseItems, weapons, actorType)
    }

    if (actorType === "actorSpirit") {
      const weapons = await SR5_CompendiumUtility.getCategoryItems("baseWeapons")
      const powers = await SR5_CompendiumUtility.getCategoryItems("creaturePowers")
      baseItems = await SR5_CompendiumUtility.findBaseItemInCompendium(baseItems, weapons, actorSubType)
      baseItems = await SR5_CompendiumUtility.findBaseSpiritPowersInCompendium(baseItems, powers, actorSubType)
      baseItems = await SR5_CompendiumUtility.modifyBaseSpiritWeapon(baseItems, actorLevel)
    }

    if (actorType === "actorSprite") {
      const spritePowers = await SR5_CompendiumUtility.getCategoryItems("spritePowers")
      baseItems = await SR5_CompendiumUtility.findBaseItemInCompendium(baseItems, spritePowers, actorSubType)
    }

    return baseItems
  }

  static async findBaseItemInCompendium(baseItems, compendium, actorType) {
    for (let i of compendium) {
      let systemEffects = i.system.systemEffects
      if (systemEffects.length) {
        for (let systemEffect of Object.values(systemEffects)) {
          if ((systemEffect.category === "baseOwnItem") && (systemEffect.value === actorType)) {
            let iObject = i.toObject(false)
            baseItems.push(iObject)
          }
        }
      }
    }
    return baseItems
  }

  //Modify weapons based on Force for Spirit
  static async modifyBaseSpiritWeapon(baseItems, force) {
    for (let i of baseItems) {
      if (i.type === "itemWeapon") {
        i.system.damageValue.base = force * 2
        i.system.armorPenetration.base = -force
        i.system.range.short.base = force
        i.system.range.medium.base = force * 2
        i.system.range.long.base = force * 3
        i.system.range.extreme.base = force * 4
      }
    }

    return baseItems
  }

  // Find base powers of a spirit
  static async findBaseSpiritPowersInCompendium(baseItems, compendium, spiritType) {
    let listName = `spiritBasePowers${spiritType}`
    let list
    for (let [key, value] of Object.entries(SR5)) {
      if (key === listName) list = value
    }
    if (!list) return baseItems

    for (let key of Object.keys(list)) {
      for (let i of compendium) {
        let systemEffects = i.system.systemEffects
        if (systemEffects.length) {
          for (let systemEffect of Object.values(systemEffects)) {
            if ((systemEffect.category === "spiritPower") && (systemEffect.value === key)) {
              let iObject = i.toObject(false)
              baseItems.push(iObject)
            }
          }
        }
      }
    }

    return baseItems
  }

  //Add optional powers to an array of existing powers based on an itemSpirit
  static async addOptionalSpiritPowersFromItem(baseItems, optionalPowers) {
    let powers = await SR5_CompendiumUtility.getCategoryItems("creaturePowers")

    for (let value of Object.values(optionalPowers)) {
      if (value) {
        for (let i of powers) {
          let systemEffects = i.system.systemEffects
          if (systemEffects.length) {
            for (let systemEffect of Object.values(systemEffects)) {
              if ((systemEffect.category === "spiritPower") && (systemEffect.value === value)) {
                let iObject = i.toObject(false)
                baseItems.push(iObject)
              }
            }
          }
        }
      }
    }

    return baseItems
  }

  //Add optional powers to an array of existing powers based on an itemSprite
  static async addOptionalSpritePowersFromItem(baseItems, optionalPowers) {
    //console.log("addOptionalSpritePowersFromItem ok !");
    //console.log("optionalPowers : " + JSON.stringify(optionalPowers));
    let powers = await SR5_CompendiumUtility.getCategoryItems("spritePowers")
    //console.log("powers : " + JSON.stringify(powers));

    for (let value of Object.values(optionalPowers)) {
      if (value) {
        for (let i of powers) {
          let systemEffects = i.system.systemEffects
          if (systemEffects.length) {
            for (let systemEffect of Object.values(systemEffects)) {
              if ((systemEffect.category === "spritePower") && (systemEffect.value === value)) {
                let iObject = i.toObject(false)
                baseItems.push(iObject)
              }
            }
          }
        }
      }
    }

    return baseItems
  }

  static async createItemFromArray(ItemArray) {
    let baseItems = []
    for (let i of ItemArray) {
      baseItems.push(i)
    }
    return baseItems
  }

  //Get a particular item from a particular compendium
  static async getWeaponFromCompendium(weapon, force) {
    let weapons = await SR5_CompendiumUtility.getCategoryItems("baseWeapons")
    for (let i of weapons) {
      let systemEffects = i.system.systemEffects
      if (systemEffects.length) {
        for (let systemEffect of Object.values(systemEffects)) {
          if (systemEffect.value === weapon) {
            let iObject = i.toObject(false)
            if (weapon === "corrosiveSpit") {
              iObject.system.damageValue.base = force * 2
              iObject.system.armorPenetration.base = -force
            }
            return iObject
          }
        }
      }
    }
  }
}