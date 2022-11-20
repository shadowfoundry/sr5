import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default async function matrixAction(rollData, rollKey, actor){
    let matrixAction = actor.system.matrix.actions[rollKey];
    debugger;
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.MatrixActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`;

    //Determine dicepool composition
    rollData.dicePool.composition = matrixAction.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, matrixAction.test.modifiers);

    //Determine base limit
    rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(matrixAction.limit.value, matrixAction.limit.modifiers);

    //Determine limit modififiers
    rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, matrixAction.limit.modifiers);

    //Add others informations
    rollData.test.type = "matrixAction";
    rollData.test.typeSub = rollKey;
    rollData.limit.type = matrixAction.limit.linkedAttribute;
    rollData.matrix.actionType = matrixAction.limit.linkedAttribute;
    rollData.matrix.overwatchScore = matrixAction.increaseOverwatchScore;
    rollData.dialogSwitch.specialization = true;

    //Add public grid switch
    if (actor.system.matrix.userGrid === "public") rollData.dialogSwitch.publicGrid = true;
    
    //Check target's Marks before rolling if a target is selected.
    if (game.user.targets.size) {
        let canContinue = await checkTargetMarks(rollData, matrixAction, actor);
        if (!canContinue) return;
    }

    //Add scene noise modifier, if any
    let noiseScene = SR5_PrepareRollHelper.getSceneNoise();
    if (noiseScene) rollData.matrix.noiseScene = noiseScene;

    //Add special info for Data spike
    if (rollKey === "dataSpike") rollData.damage.matrix.base = actor.system.matrix.attributes.attack.value;

    return rollData;
}

async function checkTargetMarks(rollData, matrixAction, actor){
    if (game.user.targets.size > 1) {
        ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetTooMany")}`);
        return false;
    }

    const targeted = game.user.targets;
    const cibles = Array.from(targeted);

    for (let t of cibles) {
        rollData.target.grid = t.actor.system.matrix.userGrid;

        if (matrixAction.neededMarks > 0 && t.actor.id !== actor.id){
            let listOfMarkedItem = t.actor.items.map(i => i.system.marks);
            listOfMarkedItem = listOfMarkedItem.filter(i => i !== undefined);
            let markItem;
            for (let i of listOfMarkedItem){
                markItem = i.find(m => m.ownerId === rollData.owner.speakerId);
                if (markItem) return true;
            }
            if (markItem === undefined || markItem?.value < matrixAction.neededMarks) {
                ui.notifications.info(game.i18n.localize("SR5.NotEnoughMarksOnTarget"));
                return false;
            }
        } else return true;
    }
}