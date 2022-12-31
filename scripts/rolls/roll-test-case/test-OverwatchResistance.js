import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function overwatchResistanceInfo(cardData){
    let label;
    let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId);
    let currentOS = attacker.system.matrix.overwatchScore;
    cardData.attackerName = attacker.name;
    
    if (cardData.roll.hits < cardData.previousMessage.hits) label = `${game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreSuccess")} ${currentOS}`;
    else label = game.i18n.localize("SR5.MatrixActionCheckOverwatchScoreFailed");
    
    //Add owerwatch
    if (cardData.roll.hits > 0)cardData.chatCard.buttons.overwatch = await SR5_RollMessage.generateChatButton("nonOpposedTest", "overwatch", `${game.i18n.format('SR5.IncreaseOverwatch', {name: attacker.name, score: cardData.roll.hits})}`);

    cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", label);
}