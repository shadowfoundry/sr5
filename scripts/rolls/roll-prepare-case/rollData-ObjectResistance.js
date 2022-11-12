export default function objectResistance(rollData, chatData){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.ObjectResistanceTest");

    //Determine base dicepool
    rollData.dicePool.base = 3;

    //Add others informations
    rollData.test.type = "objectResistance";
    rollData.previousMessage.hits = chatData.roll.hits;

    return rollData;
}