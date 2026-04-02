import {
  SR5Combat
} from "../system/srcombat.js"
import {
  SR5_ActorHelper
} from "../entities/actors/entityActor-helpers.js"
import {
  SR5_EffectArea
} from "../system/effectArea.js"

export async function sr5HookUpdateItem(document, data, _options, _userId) {
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
