import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function calledShotFear(rollData, actor, chatData){
    let composureThreshold = 0;
    if (chatData.combat.calledShot.name === "extremeIntimidation") {
        chatData.combat.calledShot.initiative = 10;
        rollData.test.type = "intimidationResistance";
        composureThreshold = chatData.previousMessage.attackerNetHits;
    } else if (chatData.combat.calledShot.name === "ricochetShot") {
        composureThreshold = 2;
        rollData.test.type = "ricochetResistance";
    } else if (chatData.combat.calledShot.name === "warningShot") {
        composureThreshold = 4;
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
    rollData.combat.calledShot = chatData.combat.calledShot;
    rollData.previousMessage.messageId = chatData.owner.messageId;
    rollData.previousMessage.hits = composureThreshold;

    return rollData;
}