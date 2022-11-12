import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function healingInfo(cardData){
    if (cardData.roll.glitchRoll || cardData.roll.criticalGlitchRoll) cardData.extendedIntervalValue = cardData.extendedIntervalValue *2;
    if (cardData.roll.criticalGlitchRoll) {
        let failedDamage = new Roll(`1d3`);
        await failedDamage.evaluate({async: true});
        cardData.damage.value = failedDamage.total;
        cardData.damage.type = cardData.test.typeSub;
        cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.format('SR5.HealButtonFailed', {hits: cardData.damage.value, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.test.typeSub]))})}`);
    }
    if (cardData.roll.hits > 0) cardData.chatCard.buttons.heal = SR5_RollMessage.generateChatButton("nonOpposedTest", "heal", `${game.i18n.format('SR5.HealButton', {hits: cardData.roll.hits, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.test.typeSub]))})}`);
}