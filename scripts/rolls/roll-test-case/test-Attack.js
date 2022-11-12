import { SR5_RollMessage } from "../roll-message.js";
import { SR5 } from "../../config.js";

export default async function attackInfo(cardData){
    cardData.damage.resistanceType = "physicalDamage";

	if (cardData.test.typeSub === "grenade") {
		cardData.damage.value = cardData.damage.base;
		//Handle scatter
		if (cardData.roll.hits < 3) cardData.chatCard.buttons.scatter = SR5_RollMessage.generateChatButton("nonOpposedTest","scatter",game.i18n.localize("SR5.Scatter"));
		//Handle Grenade Resistant chat button
		let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`;
		if (cardData.combat.armorPenetration) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.combat.armorPenetration}`;
		if (cardData.damage.element === "toxin") label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.Toxin")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.toxinTypes[cardData.damage.toxinType])}`;
		if (cardData.damage.value > 0) cardData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("opposedTest","resistanceCard",label);
	} else if (cardData.roll.hits > 0) {
		if (cardData.test.typeSub === "rangedWeapon") cardData.chatCard.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseRangedWeapon",game.i18n.localize("SR5.Defend"));
		else if (cardData.test.typeSub === "meleeWeapon") cardData.chatCard.buttons.defenseMeleeWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseMeleeWeapon",game.i18n.localize("SR5.Defend"));
	} else {
		if (cardData.type === "ramming") cardData.chatCard.buttons.defenseRamming = SR5_RollMessage.generateChatButton("opposedTest","defenseRamming",game.i18n.localize("SR5.Defend"));
		cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.AttackMissed"));
	}
}