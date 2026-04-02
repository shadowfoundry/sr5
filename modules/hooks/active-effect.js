import {
  SR5_ActorHelper
} from "../entities/actors/entityActor-helpers.js"
import {
  SR5Combat
} from "../system/srcombat.js"
import {
  SR5_EffectArea
} from "../system/effectArea.js"

export async function sr5HookDeleteActiveEffect(effect) {
  if (!game.user.isGM ) return
  if (effect.statuses.has("prone")){
    let itemEffect = effect.parent.items.find(i => i.type === "itemEffect" && i.system.type === "prone")
    let actorId = (effect.parent.isToken ? effect.parent.token.id : effect.parent.id)
    if (itemEffect) await SR5_ActorHelper.deleteItemEffectLinkedToActiveEffect(actorId, itemEffect.id)
    SR5Combat.changeActionInCombat(actorId, [{
      type: "simple", value: 1, source: "standUp"
    }])
  }
}

export function sr5HookCreateActiveEffect(effect) {
  if (!game.user.isGM ) return
  let actorId = (effect.parent.isToken ? effect.parent.token.id : effect.parent.id)
  if (effect.statuses === "signalJam") SR5_EffectArea.onJamCreation(actorId)
  if ((effect.statuses === "cover" || effect.statuses === "coverFull") && game.combat) SR5Combat.changeActionInCombat(actorId, [{
    type: "simple", value: 1, source: "takeCover"
  }])
}
