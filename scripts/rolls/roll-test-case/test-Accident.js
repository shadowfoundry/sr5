import { SR5_RollMessage } from "../roll-message.js";

export default async function accidentInfo(cardData){
    let damageValue = cardData.accidentValue - cardData.roll.hits;		

    //Accident do damage
    if (damageValue > 0) {
        cardData.damage.value = damageValue;
        cardData.damage.type = "physical";
        //Add Accident damage button
        let label = cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.localize("SR5.ApplyDamage")} (${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])})`);
        if (cardData.combat.armorPenetration) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.combat.armorPenetration}`;
    } else {
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.NoDamage"));
    }
}