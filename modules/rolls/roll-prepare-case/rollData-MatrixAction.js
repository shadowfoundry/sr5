import {
  SR5 
} from "../../config.js"
import {
  SR5_PrepareRollHelper 
} from "../roll-prepare-helpers.js"
import {
  SR5_MiscellaneousHelpers 
} from "../roll-helpers/miscellaneous.js"
import SR5_RollDialog from "../roll-dialog.js"
import {
  SR5_MarkHelpers, WATCHDOG_INTERRUPTION_COST
} from "../roll-helpers/mark.js"

export default async function matrixAction(rollData, rollKey, actor){
  let matrixAction = actor.system.matrix.actions[rollKey]

  //Determine title
  rollData.test.title = `${game.i18n.localize("SR5.MatrixActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`

  //Determine dicepool composition
  rollData.dicePool.composition = matrixAction.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"))

  //Determine base dicepool
  rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData)

  //Determine dicepool modififiers
  rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, matrixAction.test.modifiers)

  //Determine base limit
  rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(matrixAction.limit.value, matrixAction.limit.modifiers)

  //Determine limit modififiers
  rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, matrixAction.limit.modifiers)

  //Add others informations
  rollData.test.type = "matrixAction"
  rollData.test.typeSub = rollKey
  rollData.limit.type = matrixAction.limit.linkedAttribute
  rollData.matrix.actionType = matrixAction.limit.linkedAttribute
  rollData.matrix.overwatchScore = matrixAction.increaseOverwatchScore
  rollData.dialogSwitch.specialization = true

  //Manage actions
  rollData.combat.actions = SR5_MiscellaneousHelpers.addActions(rollData.combat.actions, {
    type: matrixAction.actionType, value: 1, source: "matrixAction"
  })

  // Kill Code p. 43-44: an Interruption action costs 5 Initiative. I Am the Firewall can also be taken as a Complex action
  // (chosen in the dialog, Complex by default on the hacker's own turn); Intervene is always an Interruption.
  // Kill Code p. 45: a Watchdog mark also opens Haywire and Popup as Interruption actions (-10 Initiative),
  // and Squelch as an Interruption action (-5 Initiative), against the marked target.
  let isActorTurn = game.combat?.combatant?.actor?.uuid === actor.uuid

  if (matrixAction.actionType === "interruption") {
    rollData.combat.interruptionInitiativeCost = 5
    if (rollKey === "iAmTheFirewall") {
      rollData.dialogSwitch.matrixActionType = true
      rollData.combat.matrixActionTypeDefault = "complex"
      rollData.combat.matrixActionTypeLabel = game.i18n.localize(SR5.actionTypes.complex)
      rollData.combat.matrixActionType = (isActorTurn || !SR5_RollDialog.hasInitiativeForInterruption(actor, 5)) ? "complex" : "interruption"
    } else {
      if (!SR5_RollDialog.hasInitiativeForInterruption(actor, 5)) return
      rollData.combat.matrixActionType = "interruption"
    }
  } else if (WATCHDOG_INTERRUPTION_COST[rollKey] && !isActorTurn && hasWatchdogMarkOnTarget(rollData)) {
    rollData.dialogSwitch.matrixActionType = true
    rollData.combat.interruptionInitiativeCost = WATCHDOG_INTERRUPTION_COST[rollKey]
    rollData.combat.matrixActionTypeDefault = matrixAction.actionType
    rollData.combat.matrixActionTypeLabel = game.i18n.localize(SR5.actionTypes[matrixAction.actionType])
    rollData.combat.matrixActionType = matrixAction.actionType
  }

  if (rollData.combat.matrixActionType) {
    rollData.combat.actions = SR5_MiscellaneousHelpers.addActions(rollData.combat.actions, {
      type: rollData.combat.matrixActionType,
      value: 1,
      source: "matrixAction",
      initiativeCost: rollData.combat.interruptionInitiativeCost,
    })
  }

  //Add public grid switch
  if (actor.system.matrix.userGrid === "public") rollData.dialogSwitch.publicGrid = true
    
  //Check target's Marks before rolling if a target is selected (the support actions target allies, not Matrix icons)
  if (game.user.targets.size && rollKey !== "iAmTheFirewall" && rollKey !== "intervene") {
    let canContinue = await checkTargetMarks(rollData, matrixAction, actor)
    if (!canContinue) return
  }

  //Add scene noise modifier, if any
  let noiseScene = SR5_PrepareRollHelper.getSceneNoise()
  if (noiseScene) rollData.matrix.noiseScene = noiseScene
  rollData.matrix.personalNoise = -actor.system.matrix.noise.value

  //Add special info for Data spike
  if (rollKey === "dataSpike" || rollKey === "popupCybercombat") rollData.damage.matrix.base = actor.system.matrix.attributes.attack.value

  return rollData
}

/** Kill Code p. 45: tell whether the hacker holds a Watchdog mark on the single targeted icon
 * @param {Object} rollData - the roll being prepared
 * @return {Boolean} true if the interruption actions are open against that target
 */
function hasWatchdogMarkOnTarget(rollData){
  if (game.user.targets.size !== 1) return false
  const target = Array.from(game.user.targets)[0]
  return SR5_MarkHelpers.hasWatchdogMark(target.actor, rollData.owner.speakerId)
}

async function checkTargetMarks(rollData, matrixAction, actor){
  if (game.user.targets.size > 1) {
    ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetTooMany")}`)
    return false
  }

  const targeted = game.user.targets
  const cibles = Array.from(targeted)

  for (let t of cibles) {
    rollData.target.grid = t.actor.system.matrix.userGrid

    if (matrixAction.neededMarks > 0 && t.actor.id !== actor.id){
      let listOfMarkedItem = t.actor.items.map(i => i.system.marks)
      listOfMarkedItem = listOfMarkedItem.filter(i => i !== undefined)
      let markItem
      for (let i of listOfMarkedItem){
        markItem = i.find(m => m.ownerId === rollData.owner.speakerId)
        if (markItem) return true
      }
      if (markItem === undefined || markItem?.value < matrixAction.neededMarks) {
        ui.notifications.info(game.i18n.localize("SR5.NotEnoughMarksOnTarget"))
        return false
      }
    } else return true
  }
}