import {
  SR5 
} from "../../config.js"
import {
  SR5_EntityHelpers 
} from "../../entities/helpers.js"
import {
  SR5_RollMessage 
} from "../roll-message.js"
import {
  SR5_MatrixHelpers 
} from "../roll-helpers/matrix.js"
import {
  SR5_ActorHelper
} from "../../entities/actors/entityActor-helpers.js"
import {
  SR5_SocketHandler
} from "../../socket.js"

export default async function matrixActionInfo(cardData, actorId){
  let actor = SR5_EntityHelpers.getRealActorFromID(actorId)
  let actorData = actor.system
  cardData.previousMessage.actorId = cardData.speakerId

  //Matrix search special case
  if (cardData.test.typeSub === "matrixSearch"){
    let netHits = cardData.roll.hits - cardData.threshold.value
    cardData.matrix.searchDuration = await SR5_MatrixHelpers.getMatrixSearchDuration(cardData, netHits)
    if (netHits <=0) {
      netHits = 1
      cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.MatrixSearchFailed"))
    } else {
      cardData.chatCard.buttons.matrixSearchSuccess = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "matrixSearchSuccess", `${game.i18n.localize("SR5.MatrixSearchSuccess")} [${cardData.matrix.searchDuration}]`)
    }
    return cardData.test.title = `${game.i18n.localize("SR5.MatrixActionTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[cardData.test.typeSub])} (${cardData.threshold.value})`
  }

  //AI Depth actions (Data Trails p. 159-161)
  if (cardData.matrix.emulateRating > 0) {
    //Emulate: the emulated rating is added to the Overwatch Score at once
    cardData.test.title += ` (${game.i18n.localize("SR5.MatrixActionEmulate")} ${cardData.matrix.emulateRating})`
    await raiseOverwatchScore(cardData.matrix.emulateRating, actor)
  }
  if (cardData.test.typeSub === "redefineOwnership") {
    let depth = cardData.matrix.depth || 0, threshold = Number(cardData.threshold.value) || 0
    cardData.test.title = `${game.i18n.localize("SR5.MatrixActionTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions.redefineOwnership)} (${threshold})`
    //A glitch adds Depth to the Overwatch Score, a critical glitch triggers convergence
    if (cardData.roll.criticalGlitchRoll) ui.notifications.warn(`${actor.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize("SR5.INFO_RedefineOwnershipConvergence")}`)
    else if (cardData.roll.glitchRoll) await raiseOverwatchScore(depth, actor)
    if (threshold > 0 && cardData.roll.hits >= threshold) {
      cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.format("SR5.MatrixActionRedefineOwnershipSuccess", {
        depth: depth
      }))
    }
    return
  }

  if (cardData.roll.hits > 0) {
    if (cardData.test.typeSub === "jackOut" && actorData.matrix.isLinkLocked) cardData.chatCard.buttons.jackOut = SR5_RollMessage.generateChatButton("nonOpposedTest", "jackOut", game.i18n.localize("SR5.MatrixActionJackOutResistance"), true)
    else if (cardData.test.typeSub === "eraseMark") cardData.chatCard.buttons.eraseMark = SR5_RollMessage.generateChatButton("opposedTest", "eraseMark", game.i18n.localize("SR5.ChooseMarkToErase"))
    else if (cardData.test.typeSub === "checkOverwatchScore") cardData.chatCard.buttons.checkOverwatchScore = SR5_RollMessage.generateChatButton("nonOpposedTest", "checkOverwatchScore", game.i18n.localize("SR5.OverwatchResistance"), true)
    else if (cardData.test.typeSub === "jamSignals") cardData.chatCard.buttons.matrixJamSignals = SR5_RollMessage.generateChatButton("nonOpposedTest", "matrixJamSignals", game.i18n.localize("SR5.MatrixActionJamSignals"))
    else if (cardData.test.typeSub === "iAmTheFirewall") cardData.chatCard.buttons.iAmTheFirewall = SR5_RollMessage.generateChatButton("opposedTest", "iAmTheFirewall", game.i18n.localize("SR5.ApplyEffect"))
    else if (cardData.test.typeSub === "intervene") cardData.chatCard.buttons.intervene = SR5_RollMessage.generateChatButton("opposedTest", "intervene", `${game.i18n.format("SR5.MatrixActionInterveneEffect", {
      hits: cardData.roll.hits
    })}`)
    else cardData.chatCard.buttons.matrixAction = SR5_RollMessage.generateChatButton("opposedTest", "matrixDefense", game.i18n.localize("SR5.Defend"))
  } else {
    cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.ActionFailure"))
  }
}

//Raise the Overwatch Score of the acting AI (owner or GM)
async function raiseOverwatchScore(value, actor){
  if (game.user.isGM || actor.isOwner) await SR5_ActorHelper.overwatchIncrease(value, actor.id)
  else SR5_SocketHandler.emitForGM("overwatchIncrease", {
    defenseHits: value,
    actorId: actor.id,
  })
}
