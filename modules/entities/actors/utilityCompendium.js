import {
  SR5_SystemHelpers 
} from "../../system/utilitySystem.js"
import {
  SR5 
} from "../../config.js"
import {
  SR5_SpiritTypes
} from "../items/spirit-types.js"

export class SR5_CompendiumUtility extends Actor {

  /** Compendiums already reported to the game master, to warn only once. */
  static _warnedMissingCompendiums = new Set()

  /** Actor sub types already reported as arriving with nothing. */
  static _warnedEmptyBaseItems = new Set()

  //Get compendium to search for Items
  //Return an array of items
  static async getItemCompendium(compendium) {
    let compendiumItems = []
    let language = await game.settings.get("core", "language")
    if (!language) SR5_SystemHelpers.srLog(0, "Could not determine core language used in getBaseItems()")

    let compendiumName = `sr5-compendiums.${language}_${compendium}`
    const compendiumPack = game.packs.find((p) => p.collection == compendiumName)
    if (!compendiumPack) {
      SR5_SystemHelpers.srLog(3, `No compendium named '${compendiumName}' found, could not add items to actor`)
      SR5_CompendiumUtility.warnMissingCompendium(compendiumName)
      return compendiumItems
    } else {
      compendiumItems = await compendiumPack.getDocuments()
      return compendiumItems
    }
  }


  //Get base items
  static async getBaseItems(actorType, actorSubType, actorLevel) {
    let baseItems = []

    let weapons = await SR5_CompendiumUtility.getItemCompendium("weapons")
    let powers = await SR5_CompendiumUtility.getItemCompendium("powers-creatures")
    let spritePowers = await SR5_CompendiumUtility.getItemCompendium("powers-sprites")

    if (actorType === "actorPc" || actorType === "actorGrunt") {
      baseItems = await SR5_CompendiumUtility.findBaseItemInCompendium(baseItems, weapons, actorType)
    }

    if (actorType === "actorSpirit") {
      // A custom type borrows the natural weapon of the type it is based on.
      const weaponType = SR5_SpiritTypes.baseType(actorSubType) || actorSubType
      baseItems = await SR5_CompendiumUtility.findBaseItemInCompendium(baseItems, weapons, weaponType)
      baseItems = await SR5_CompendiumUtility.findBaseSpiritPowersInCompendium(baseItems, powers, actorSubType)
      baseItems = await SR5_CompendiumUtility.modifyBaseSpiritWeapon(baseItems, actorLevel)
    }

    if (actorType === "actorSprite") {
      baseItems = await SR5_CompendiumUtility.findBaseItemInCompendium(baseItems, spritePowers, actorSubType)
    }

    // A spirit or a sprite that comes with nothing at all is almost always a
    // missing or misdirected reference compendium, not a badly written type.
    // Nothing on screen used to say so.
    if (!baseItems.length && (actorType === "actorSpirit" || actorType === "actorSprite")) {
      SR5_CompendiumUtility.warnEmptyBaseItems(actorType, actorSubType)
    }

    return baseItems
  }

  /**
	 * Tell the game master, once per compendium, that a reference compendium
	 * could not be found. Players are not told: it is not theirs to fix.
	 */
  static warnMissingCompendium(compendiumName) {
    if (!game.user?.isGM) return
    if (SR5_CompendiumUtility._warnedMissingCompendiums.has(compendiumName)) return
    SR5_CompendiumUtility._warnedMissingCompendiums.add(compendiumName)
    ui.notifications.warn(game.i18n.format("SR5.WARN_MissingCompendium", {
      name: compendiumName
    }), {
      permanent: true
    })
  }

  /** Tell the game master, once per actor sub type, that nothing was found. */
  static warnEmptyBaseItems(actorType, actorSubType) {
    if (!game.user?.isGM) return
    const key = `${actorType}.${actorSubType}`
    if (SR5_CompendiumUtility._warnedEmptyBaseItems.has(key)) return
    SR5_CompendiumUtility._warnedEmptyBaseItems.add(key)
    ui.notifications.warn(game.i18n.localize("SR5.WARN_NoBaseItems"))
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
    let powers = await SR5_CompendiumUtility.getItemCompendium("powers-creatures")

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
    let powers = await SR5_CompendiumUtility.getItemCompendium("powers-sprites")
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
    let weapons = await SR5_CompendiumUtility.getItemCompendium("weapons")
    for (let i of weapons) {
      let systemEffects = i.system.systemEffects
      if (systemEffects.length) {
        for (let systemEffect of Object.values(systemEffects)) {
          if (systemEffect.value === weapon) {
            let iObject = i.toObject(false)
            if (weapon === "corrosiveSpit") {
              i.system.damageValue.base = force * 2
              i.system.armorPenetration.base = -force
            }
            return iObject
          }
        }
      }
    }
  }
}