import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function calledShotFear(rollData, chatData){
    let composureThreshold = 0;
    if (chatData.combat.calledShot.name === "extremeIntimidation") {
        rollData.test.type = "intimidationResistance";
        rollData.previousMessage.hits = chatData.roll.netHits;
    } else if (chatData.combat.calledShot.name === "ricochetShot") {
        rollData.previousMessage.hits = 2;
        rollData.test.type = "ricochetResistance";
    } else if (chatData.combat.calledShot.name === "warningShot") {
        rollData.previousMessage.hits = 4;
        rollData.test.type ="warningResistance";
    }

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.Composure")} (${composureThreshold})`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.derivedAttributes.composure.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.derivedAttributes.composure.modifiers);

    //Add others informations
    rollData.test.type = "calledShotFear";
    rollData.combat.calledShot = chatData.combat.calledShot;

    return rollData;
}