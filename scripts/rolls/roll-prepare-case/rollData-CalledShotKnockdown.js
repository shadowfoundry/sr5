import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5 } from "../../config.js";

export default function calledShotKnockdown(rollData, actor, chatData){
    let calledShotEffect = chatData.combat.calledShot.effects.find(e => e.name === "knockdown");
    calledShotEffect.threshold = chatData.damage.value + 3;
    rollData.combat.calledShot = chatData.combat.calledShot;
    rollData.combat.calledShot.effects = chatData.combat.calledShot.effects.filter(e => e.name === "knockdown");

    //Determine title
    rollData.test.title = `${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[calledShotEffect.name])})} (${calledShotEffect.threshold})`;

    //Determine dicepool composition
    rollData.dicePool.composition = ([
        {source: game.i18n.localize("SR5.Strength"), type: "linkedAttribute", value: actor.system.attributes.strength.augmented.value},
        {source: game.i18n.localize("SR5.Agility"), type: "linkedAttribute", value: (actor.system.attributes.agility.augmented.value)},
    ]);

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Add others informations
    rollData.test.type = "knockdownResistance";
    rollData.previousMessage.hits = calledShotEffect.threshold;
    rollData.previousMessage.messageId = chatData.owner.messageId;

    return rollData;
}