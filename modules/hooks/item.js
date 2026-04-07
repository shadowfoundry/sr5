import {
  SR5Combat
} from "../system/srcombat.js"
import {
  SR5_ActorHelper
} from "../entities/actors/entityActor-helpers.js"
import {
  SR5_EffectArea
} from "../system/effectArea.js"

// Copy effect fields from an itemAmmunitionType into an effects snapshot
function _copyAmmoTypeEffects(ammoTypeSystem) {
  return {
    apMod: ammoTypeSystem.apMod ?? 0,
    damageMod: ammoTypeSystem.damageMod ?? 0,
    damageType: ammoTypeSystem.damageType ?? '',
    damageElement: ammoTypeSystem.damageElement ?? '',
    accuracyMod: ammoTypeSystem.accuracyMod ?? 0,
    blastRadius: ammoTypeSystem.blastRadius ?? 0,
    blastFallOff: ammoTypeSystem.blastFallOff ?? 0,
    flatDamage: ammoTypeSystem.flatDamage ?? 0,
    disableStrDamage: ammoTypeSystem.disableStrDamage ?? false,
    overrideBaseAP: ammoTypeSystem.overrideBaseAP ?? false,
    scatterDice: ammoTypeSystem.scatterDice ?? 0,
    envRangeMod: ammoTypeSystem.envRangeMod ?? 0,
    envWindMod: ammoTypeSystem.envWindMod ?? 0,
    gelDamageReduction: ammoTypeSystem.gelDamageReduction ?? 0,
    injectionNetHits: ammoTypeSystem.injectionNetHits ?? 0,
    showToxinButton: ammoTypeSystem.showToxinButton ?? false,
    antiVehicleAP: ammoTypeSystem.antiVehicleAP ?? 0,
    calledShotTags: ammoTypeSystem.calledShotTags ?? [],
    calledShotOverrides: ammoTypeSystem.calledShotOverrides ?? {
    },
  }
}

// When an itemAmmunition's ammunitionTypeUuid changes, copy effects from the referenced type
export function sr5HookPreUpdateItem(document, data, _options, _userId) {
  if (document.type !== 'itemAmmunition') return
  const newUuid = data.system?.ammunitionTypeUuid
  if (newUuid === undefined) return // UUID not being changed

  if (!newUuid) {
    // Unlinking — clear effects
    data.system.effects = _copyAmmoTypeEffects({
    })
    return
  }

  const ammoType = fromUuidSync(newUuid)
  if (!ammoType || ammoType.type !== 'itemAmmunitionType') return
  data.system.effects = _copyAmmoTypeEffects(ammoType.system)

  // Auto-set the type field to a slug of the ammo type name (for weapon matching)
  if (!data.system.type || data.system.type === document.system.type) {
    data.system.type = ammoType.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  }
}

export async function sr5HookUpdateItem(document, data, _options, _userId) {
  // When an itemAmmunitionType is edited, re-sync all itemAmmunition items referencing it
  if (document.type === 'itemAmmunitionType' && data.system) {
    const uuid = document.uuid
    const effects = _copyAmmoTypeEffects(document.system)
    for (const actor of game.actors) {
      for (const item of actor.items) {
        if (item.type === 'itemAmmunition' && item.system.ammunitionTypeUuid === uuid) {
          await item.update({
            'system.effects': effects
          })
        }
      }
    }
    // Also check unowned world items
    for (const item of game.items) {
      if (item.type === 'itemAmmunition' && item.system.ammunitionTypeUuid === uuid) {
        await item.update({
          'system.effects': effects
        })
      }
    }
  }

  if (document.isOwned && game.combat && game.user?.isGM) {
    if (document.type === "itemSpell" || document.type === "itemComplexForm") SR5Combat.changeInitInCombatHelper(document.actor.id)
  }

  //Keep agent condition monitor synchro with owner deck
  if(document.type === "itemDevice" && data.system.conditionMonitors?.matrix && document.testUserPermission(game.user, 3) || (game.user?.isGM)){
    if (document.parent?.type === "actorPc" || document.parent?.type === "actorGrunt"){
      for (let a of game.actors) {
        if(a.type === "actorAgent" && a.system.creatorId === document.parent.id) await SR5_ActorHelper.keepAgentMonitorSynchro(a)
      }
    }
  }
}

export async function sr5HookDeleteItem(item) {
  if (item.testUserPermission(game.user, 3) || (game.user?.isGM)){
    if (item.system.type === "signalJam"){
      let actorId = item.parent.id
      SR5_EffectArea.onJamEnd(actorId)
    }
    if (item.type === "itemEffect"){
      if (item.system.hasEffectOnItem && item.parent){
        if (item.parent.isToken) await SR5_ActorHelper.deleteItemEffectFromItem(item.parent.token.id, item.system.ownerItem)
        else await SR5_ActorHelper.deleteItemEffectFromItem(item.parent.id, item.system.ownerItem)
      }
    }

  }
  //Remove isSlavedToPan switch if PAN master is deleted
  if (item.system.pan?.content?.length){
    for (let i of item.system.pan.content){
      let panItem = await fromUuid(i.uuid)
      let newItem = foundry.utils.duplicate(panItem.system)
      newItem.isSlavedToPan = false
      newItem.panMaster = ""
      await panItem.update({
        "system": newItem
      })
    }
  }
  //Remove item from PAN if it was slaved
  if (item.system.isSlavedToPan){
    SR5_ActorHelper.deleteItemFromPan(item.uuid, item.system.panMaster, null)
  }
}
