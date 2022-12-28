import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function passThroughDefense(rollData, chatData){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.ManaBarrierResistance");

    //Determine base dicepool
    rollData.dicePool.base = 2

    //Add others informations
    rollData.test.type = "passThroughDefense";
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.messageId = chatData.owner.messageId;
    rollData.manaBarrierRating = 1;

    return rollData;
}