import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function escapeEngulf(rollData, actor, chatData){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.EscapeEngulfAttempt");

    //Determine dicepool composition
    rollData.dicePool.composition = ([
        {source: game.i18n.localize("SR5.Strength"), type: "linkedAttribute", value: actor.system.attributes.strength.augmented.value},
        {source: game.i18n.localize("SR5.Body"), type: "linkedAttribute", value: actor.system.attributes.body.augmented.value},
    ]);

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Add others informations
    rollData.test.type = "escapeEngulf";
    rollData.previousMessage.actorId = chatData.owner.actorId;

    return rollData;
}