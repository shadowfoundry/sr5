import {
  SR5_CharacterUtility
} from "../entities/actors/utilityActor.js"
import {
  SR5_ActorHelper
} from "../entities/actors/entityActor-helpers.js"
import {
  SR5Combat
} from "../system/srcombat.js"

export async function sr5HookCreateActor(actor) {
  if ( !game.user.isGM ) return

  //Add itemDevice to Drone/Sprite/Agent if they have none.
  if (actor.type === "actorDrone" || actor.type === "actorSprite" || actor.type === "actorAgent"){
    let hasDevice = false
    for (let i of actor.items){
      if (i.type === "itemDevice") hasDevice = true
    }

    if (!hasDevice){
      let deviceItem = {
        "name": game.i18n.localize("SR5.Device"),
        "type": "itemDevice",
        "system.isActive": true,
        "system.type": "baseDevice",
      }
      await actor.createEmbeddedDocuments("Item", [deviceItem])
    }
  }

  if (actor.type ==="actorSpirit") {
    SR5_CharacterUtility.switchToInitiative(actor, "astralInit")
  }
}

export async function sr5HookUpdateActor(document, data, _options, _userId) {
  if (game.combat && game.user?.isGM && (data.system?.initiatives || data.system?.conditionMonitors || data.system?.matrix)) {
    let actorId = document.id
    if (document.isToken) actorId = document.token.id

    if (actorId) await SR5Combat.changeInitInCombatHelper(actorId)
  }

  //Keep deck condition monitor synchro with agent condition monitor
  if (document.type === "actorAgent" && data.system.conditionMonitors?.matrix && (document.testUserPermission(game.user, 3) || (game.user?.isGM))){
    await SR5_ActorHelper.keepDeckSynchroWithAgent(document)
  }

  //Keep edge monitor synchro with tokens
  if (document.type === "actorGrunt" && data.system?.conditionMonitors?.edge && (document.testUserPermission(game.user, 3) || (game.user?.isGM))){
    await SR5_ActorHelper.keepEdgeSynchroWithGrunt(document)
  }

  //Propagate owner data changes to linked drones and agents
  if ((document.type === "actorPc" || document.type === "actorGrunt") && (document.testUserPermission(game.user, 3))) {
    await SR5_CharacterUtility.updateControledVehicle(document)
    if (document.items.find(item => item.system.type === "agent")) await SR5_CharacterUtility.updateProgramAgent(document)
  }

  // Re-render open item sheets when actor data changes (e.g. metamagic toggles affect spell display)
  for (const item of document.items) {
    if (item.sheet?.rendered) item.sheet.render()
  }
}

// When an actor is deleted, remove all its tokens from every scene
export async function sr5HookDeleteActor(actor, options, userId) {
  if (game.user.id !== userId) return
  for (const scene of game.scenes) {
    const tokens = scene.tokens.filter(t => t.actorId === actor.id)
    if (tokens.length) {
      await scene.deleteEmbeddedDocuments("Token", tokens.map(t => t.id))
    }
  }
}
