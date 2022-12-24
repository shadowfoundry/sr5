import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5 } from "../../config.js";

export default function calledShotNauseous(rollData, actor, chatData){
    let calledShotEffect = chatData.combat.calledShot.effects.find(e => e.name === "nauseous");
    rollData.combat.calledShot = chatData.combat.calledShot;
    rollData.combat.calledShot.effects = chatData.combat.calledShot.effects.filter(e => e.name === "nauseous");

    //Determine title
    rollData.test.title = `${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[calledShotEffect.name])})} (4)`;

    //Determine dicepool composition
    rollData.dicePool.composition = ([
        {source: game.i18n.localize("SR5.Body"), type: "linkedAttribute", value: actor.system.attributes.body.augmented.value},
        {source: game.i18n.localize("SR5.Willpower"), type: "linkedAttribute", value: (actor.system.attributes.willpower.augmented.value)},
    ]);

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Add others informations
    rollData.test.type = "nauseousResistance";
    rollData.previousMessage.hits = 4;
    rollData.previousMessage.messageId = chatData.owner.messageId;

    return rollData;
}