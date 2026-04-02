import {
  SR5
} from "../config.js"
import {
  SR5_SystemHelpers
} from "../system/utilitySystem.js"
import {
  SR5_EntityHelpers
} from "../entities/helpers.js"
import {
  registerHandlebarsHelpers
} from "../handlebars.js"
import {
  preloadHandlebarsTemplates
} from "../templates.js"
import {
  SR5_SocketHandler
} from "../socket.js"
import {
  SR5Actor
} from "../entities/actors/entityActor.js"
import {
  SR5ActorSheet
} from "../entities/actors/characterSheet.js"
import {
  SR5SpiritSheet
} from "../entities/actors/spiritSheet.js"
import {
  SR5GruntSheet
} from "../entities/actors/gruntSheet.js"
import {
  SR5DroneSheet
} from "../entities/actors/droneSheet.js"
import {
  SR5AppareilSheet
} from "../entities/actors/deviceSheet.js"
import {
  SR5SpriteSheet
} from "../entities/actors/spriteSheet.js"
import {
  SR5AgentSheet
} from "../entities/actors/agentSheet.js"
import {
  SR5Item
} from "../entities/items/entityItem.js"
import {
  SR5ItemSheet
} from "../entities/items/itemSheet.js"
import {
  SR5Combat, _getInitiativeFormula
} from "../system/srcombat.js"
import {
  SR5Token
} from "../interface/token.js"
import * as SRVision from "../system/vision.js"
import {
  SR5CombatTracker
} from "../interface/srcombat-tracker.js"
import SR5SceneConfig from "../interface/sceneConfig.js"
import SR5MeasuredTemplateConfig from "../interface/measuredTemplateConfig.js"
import * as macros from "../interface/macros.js"
import Migration from "../migration.js"
import {
  SR5CompendiumBrowser
} from "../interface/compendium-browser.js"

// Item DataModels
import {
  sr5ItemAdeptPowerDataModel
} from "../datamodels/items/itemAdeptPower.js"
import {
  sr5ItemAmmunitionDataModel
} from "../datamodels/items/itemAmmunition.js"
import {
  sr5ItemArmorDataModel
} from "../datamodels/items/itemArmor.js"
import {
  sr5ItemAugmentationDataModel
} from "../datamodels/items/itemAugmentation.js"
import {
  sr5ItemComplexFormDataModel
} from "../datamodels/items/itemComplexForm.js"
import {
  sr5ItemContactDataModel
} from "../datamodels/items/itemContact.js"
import {
  sr5ItemDeviceDataModel
} from "../datamodels/items/itemDevice.js"
import {
  sr5ItemDrugDataModel
} from "../datamodels/items/itemDrug.js"
import {
  sr5ItemEchoDataModel
} from "../datamodels/items/itemEcho.js"
import {
  sr5ItemEffectDataModel
} from "../datamodels/items/itemEffect.js"
import {
  sr5ItemFocusDataModel
} from "../datamodels/items/itemFocus.js"
import {
  sr5ItemGearDataModel
} from "../datamodels/items/itemGear.js"
import {
  sr5ItemKarmaDataModel
} from "../datamodels/items/itemKarma.js"
import {
  sr5ItemKnowledgeDataModel
} from "../datamodels/items/itemKnowledge.js"
import {
  sr5ItemLanguageDataModel
} from "../datamodels/items/itemLanguage.js"
import {
  sr5ItemLifestyleDataModel
} from "../datamodels/items/itemLifestyle.js"
import {
  sr5ItemMarkDataModel
} from "../datamodels/items/itemMark.js"
import {
  sr5ItemMartialArtDataModel
} from "../datamodels/items/itemMartialArt.js"
import {
  sr5ItemMetamagicDataModel
} from "../datamodels/items/itemMetamagic.js"
import {
  sr5ItemNuyenDataModel
} from "../datamodels/items/itemNuyen.js"
import {
  sr5ItemPowerDataModel
} from "../datamodels/items/itemPower.js"
import {
  sr5ItemPreparationDataModel
} from "../datamodels/items/itemPreparation.js"
import {
  sr5ItemProgramDataModel
} from "../datamodels/items/itemProgram.js"
import {
  sr5ItemQualityDataModel
} from "../datamodels/items/itemQuality.js"
import {
  sr5ItemReputationDataModel
} from "../datamodels/items/itemReputation.js"
import {
  sr5ItemRitualDataModel
} from "../datamodels/items/itemRitual.js"
import {
  sr5ItemSinDataModel
} from "../datamodels/items/itemSin.js"
import {
  sr5ItemSpellDataModel
} from "../datamodels/items/itemSpell.js"
import {
  sr5ItemSpiritDataModel
} from "../datamodels/items/itemSpirit.js"
import {
  sr5ItemSpriteDataModel
} from "../datamodels/items/itemSprite.js"
import {
  sr5ItemSpritePowerDataModel
} from "../datamodels/items/itemSpritePower.js"
import {
  sr5ItemTraditionDataModel
} from "../datamodels/items/itemTradition.js"
import {
  sr5ItemVehicleDataModel
} from "../datamodels/items/itemVehicle.js"
import {
  sr5ItemVehicleModDataModel
} from "../datamodels/items/itemVehicleMod.js"
import {
  sr5ItemWeaponDataModel
} from "../datamodels/items/itemWeapon.js"

// Actor DataModels
import {
  sr5ActorPcDataModel
} from "../datamodels/actors/actorPc.js"
import {
  sr5ActorGruntDataModel
} from "../datamodels/actors/actorGrunt.js"
import {
  sr5ActorSpiritDataModel
} from "../datamodels/actors/actorSpirit.js"
import {
  sr5ActorDroneDataModel
} from "../datamodels/actors/actorDrone.js"
import {
  sr5ActorDeviceDataModel
} from "../datamodels/actors/actorDevice.js"
import {
  sr5ActorSpriteDataModel
} from "../datamodels/actors/actorSprite.js"
import {
  sr5ActorAgentDataModel
} from "../datamodels/actors/actorAgent.js"

export async function sr5HookInit() {
  SR5_SystemHelpers.registerSystemSettings()
  SR5_SystemHelpers.srLogPublic(`Welcome to the Sixth World, chummer!`)
  SR5_SystemHelpers.srLogPublic(`Remember: Never, ever, cut a deal with a dragon!`)
  SR5_SystemHelpers.srLog(2, `Initializing game system`)

  // Create a namespace within the game global
  game.sr5 = {
    config: SR5_EntityHelpers.sortTranslations(SR5),
    entities: {
      SR5Actor,
      SR5Item,
    },
    migration: Migration,
    macros: macros,
    rollItemMacro: macros.rollItemMacro,
    rollMacro: macros.rollMacro,
    compendiumBrowser: SR5CompendiumBrowser,
  }

  // Register DataModels
  Object.assign(CONFIG.Actor.dataModels, {
    actorPc: sr5ActorPcDataModel,
    actorGrunt: sr5ActorGruntDataModel,
    actorSpirit: sr5ActorSpiritDataModel,
    actorDrone: sr5ActorDroneDataModel,
    actorDevice: sr5ActorDeviceDataModel,
    actorSprite: sr5ActorSpriteDataModel,
    actorAgent: sr5ActorAgentDataModel,
  })
  Object.assign(CONFIG.Item.dataModels, {
    itemAdeptPower: sr5ItemAdeptPowerDataModel,
    itemAmmunition: sr5ItemAmmunitionDataModel,
    itemArmor: sr5ItemArmorDataModel,
    itemAugmentation: sr5ItemAugmentationDataModel,
    itemComplexForm: sr5ItemComplexFormDataModel,
    itemContact: sr5ItemContactDataModel,
    itemDevice: sr5ItemDeviceDataModel,
    itemDrug: sr5ItemDrugDataModel,
    itemEcho: sr5ItemEchoDataModel,
    itemEffect: sr5ItemEffectDataModel,
    itemFocus: sr5ItemFocusDataModel,
    itemGear: sr5ItemGearDataModel,
    itemKarma: sr5ItemKarmaDataModel,
    itemKnowledge: sr5ItemKnowledgeDataModel,
    itemLanguage: sr5ItemLanguageDataModel,
    itemLifestyle: sr5ItemLifestyleDataModel,
    itemMark: sr5ItemMarkDataModel,
    itemMartialArt: sr5ItemMartialArtDataModel,
    itemMetamagic: sr5ItemMetamagicDataModel,
    itemNuyen: sr5ItemNuyenDataModel,
    itemPower: sr5ItemPowerDataModel,
    itemPreparation: sr5ItemPreparationDataModel,
    itemProgram: sr5ItemProgramDataModel,
    itemQuality: sr5ItemQualityDataModel,
    itemReputation: sr5ItemReputationDataModel,
    itemRitual: sr5ItemRitualDataModel,
    itemSin: sr5ItemSinDataModel,
    itemSpell: sr5ItemSpellDataModel,
    itemSpirit: sr5ItemSpiritDataModel,
    itemSprite: sr5ItemSpriteDataModel,
    itemSpritePower: sr5ItemSpritePowerDataModel,
    itemTradition: sr5ItemTraditionDataModel,
    itemVehicle: sr5ItemVehicleDataModel,
    itemVehicleMod: sr5ItemVehicleModDataModel,
    itemWeapon: sr5ItemWeaponDataModel,
  })

  // Record Configuration Values
  CONFIG.SR5 = SR5_EntityHelpers.sortTranslations(SR5)
  CONFIG.Actor.documentClass = SR5Actor
  CONFIG.Item.documentClass = SR5Item
  CONFIG.Combat.documentClass = SR5Combat
  CONFIG.ui.combat = SR5CombatTracker
  CONFIG.Token.objectClass = SR5Token
  CONFIG.Canvas.visionModes.astralvision = SRVision.astralVision

  // ACTIVATE HOOKS DEBUG
  CONFIG.debug.hooks = false

  // Patch Core Functions
  foundry.documents.Combatant.prototype._getInitiativeFormula = _getInitiativeFormula

  // Register sheet application classes
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5ActorSheet, {
    types: ["actorPc"],
    makeDefault: true,
    label: "SR5.Sheet.Character"
  })
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5SpiritSheet, {
    types: ["actorSpirit"],
    makeDefault: true,
    label: "SR5.Sheet.Spirit"
  })
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5GruntSheet, {
    types: ["actorGrunt"],
    makeDefault: true,
    label: "SR5.Sheet.Grunt"
  })
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5DroneSheet, {
    types: ["actorDrone"],
    makeDefault: true,
    label: "SR5.Sheet.Drone"
  })
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5AppareilSheet, {
    types: ["actorDevice"],
    makeDefault: true,
    label: "SR5.Sheet.Device"
  })
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5SpriteSheet, {
    types: ["actorSprite"],
    makeDefault: true,
    label: "SR5.Sheet.Sprite"
  })
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5AgentSheet, {
    types: ["actorAgent"],
    makeDefault: true,
    label: "SR5.Sheet.Agent"
  })
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "SR5", SR5ItemSheet, {
    makeDefault: true,
    label: "SR5.Sheet.Item"
  })
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Scene, "SR5", SR5SceneConfig, {
    makeDefault: true
  })
  //foundry.applications.apps.DocumentSheetConfig.unregisterSheet("core", foundry.applications.sheets.MeasuredTemplateConfig);
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.MeasuredTemplateDocument, "SR5", SR5MeasuredTemplateConfig, {
    makeDefault: true
  })

  // Preload Handlebars Templates
  await preloadHandlebarsTemplates()

  //Socket
  SR5_SocketHandler.registerSocketListeners()

  // Patch creation dialog buttons with document-type icons
  const docTypes = ["Actor", "Item", "Scene", "JournalEntry", "RollTable", "Cards", "Playlist", "Macro"]
  for (const docName of docTypes) {
    const cls = CONFIG[docName]?.documentClass
    if (!cls?.createDialog) continue
    const original = cls.createDialog
    cls.createDialog = function(data={
    }, createOptions={
    }, options={
    }) {
      const icon = CONFIG[docName]?.sidebarIcon
      if (icon && !options?.ok?.icon) {
        options = foundry.utils.mergeObject({
          ok: {
            icon
          }
        }, options)
      }
      return original.call(this, data, createOptions, options)
    }
  }

  // Register Handlebars helpers
  registerHandlebarsHelpers()

  SR5_SystemHelpers.srLog(2, `Finished initializing game system`)
}
