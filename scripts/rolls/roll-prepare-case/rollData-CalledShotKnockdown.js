import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5 } from "../../config.js";

export default function calledShotKnockdown(rollData, rollType, actor, chatData){
    let calledShotEffect = chatData.calledShot.effects.find(e => e.name === rollType);
    calledShotEffect.threshold = chatData.damageValue + 3;
    chatData.calledShot.effects = chatData.calledShot.effects.filter(e => e.name === rollType);

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
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.combat.calledShot = chatData.combat.calledShot;

    return rollData;
}