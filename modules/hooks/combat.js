import {
  SR5
} from "../config.js"
import {
  SR5_EntityHelpers
} from "../entities/helpers.js"
import {
  SR5_CharacterUtility
} from "../entities/actors/utilityActor.js"
export function sr5HookCanvasInit() {
  // Extend Diagonal Measurement
  //SquareGrid.prototype.measureDistances = measureDistances;
}

export function sr5HookDeleteCombatCumulativeDefense(combat) {
  if ( !game.user.isGM ) return
  for (let combatant of combat.combatants){
    let actor
    if (!combatant.actor.isToken) actor = SR5_EntityHelpers.getRealActorFromID(combatant.actorId)
    else actor = SR5_EntityHelpers.getRealActorFromID(combatant.tokenId)
    actor.unsetFlag("sr5", "cumulativeDefense")
  }
}

export async function sr5HookCreateCombatant(combatant) {
  if (game.user.isGM){
    let key = SR5_CharacterUtility.findActiveInitiative(combatant.actor.system)
    let actor
    if (!combatant.actor.isToken) actor = SR5_EntityHelpers.getRealActorFromID(combatant.actorId)
    else actor = SR5_EntityHelpers.getRealActorFromID(combatant.tokenId)

    actor.update({
      "flags.sr5.cumulativeDefense": 0,
      "system.specialProperties.actions.free.current": actor.system.specialProperties.actions.free.value,
      "system.specialProperties.actions.simple.current": actor.system.specialProperties.actions.simple.value,
      "system.specialProperties.actions.complex.current": actor.system.specialProperties.actions.complex.value,
    })

    await combatant.update({
      "flags.sr5.seizeInitiative" : false,
      "flags.sr5.blitz" : false,
      "flags.sr5.hasPlayed" : combatant.isDefeated,
      "flags.sr5.cumulativeDefense" : 0,
      "flags.sr5.currentInitRating" : combatant.actor.system.initiatives[key].value,
      "flags.sr5.currentInitDice" : combatant.actor.system.initiatives[key].dice.value,
      "flags.sr5.actions.free": actor.system.specialProperties.actions.free.value,
      "flags.sr5.actions.simple": actor.system.specialProperties.actions.simple.value,
      "flags.sr5.actions.complex": actor.system.specialProperties.actions.complex.value,
    })
  }
}

export function sr5HookUpdateCombatant(combatant) {
  if (combatant.isDefeated && !combatant.flags.sr5.hasPlayed) combatant.update({
    "flags.sr5.hasPlayed": true
  })
}

export async function sr5HookDeleteCombatActions(combat) {
  if (game.user.isGM){
    //Reset actions to default values
    let actor, actorData
    for (let combatant of combat.combatants){
      if (!combatant.actor.isToken) actor = SR5_EntityHelpers.getRealActorFromID(combatant.actorId)
      else actor = SR5_EntityHelpers.getRealActorFromID(combatant.tokenId)

      actorData = foundry.utils.duplicate(actor.system)
      for (let key of Object.keys(SR5.actionTypes)) {
        if (actorData.specialProperties.actions[key]) {
          actorData.specialProperties.actions[key].current = actorData.specialProperties.actions[key].value
        }
      }
      await actor.update({
        system: actorData
      })
    }
  }
}

export function sr5HookCloseCombatantConfig(combatant) {
  combatant.document.update({
    "flags.sr5.baseCombatantInitiative": combatant.document.initiative
  })
}
