import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function spellInfo(cardData){
    let actionType, label, item;
    let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);
    let actorData = actor.system;
	if (cardData.owner.itemUuid) item = await fromUuid(cardData.owner.itemUuid);

	//Add Resist Drain chat button
	if (cardData.test.type === "spell" || (cardData.test.type === "adeptPower" && cardData.magic.drain > 0)) {
		cardData.chatCard.buttons.drain = SR5_RollMessage.generateChatButton("nonOpposedTest", "drain", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
	}

	//Roll Succeed
	if (cardData.roll.hits > 0) {
		//Handle Attack spell type
		if (cardData.magic.spell.category === "combat") {
			if (cardData.test.typeSub === "indirect") {
				actionType = "defenseRangedWeapon";
				label = game.i18n.localize("SR5.Defend");
				cardData.damage.value = cardData.magic.force;
				cardData.combat.armorPenetration = -cardData.magic.force;
				cardData.damage.resistanceType = "physicalDamage";
			} else if (cardData.test.typeSub === "direct") {
                actionType = "resistanceCard";
				label = game.i18n.localize("SR5.ResistDirectSpell");
				cardData.damage.value = cardData.roll.hits;
				if (cardData.magic.spell.type === "mana") cardData.damage.resistanceType = "directSpellMana";
				else cardData.damage.resistanceType = "directSpellPhysical";
			}
			//Generate Resist spell chat button
			cardData.chatCard.buttons[actionType] = SR5_RollMessage.generateChatButton("opposedTest", actionType, label);
		} else if (cardData.magic.spell.isResisted) {
			actionType = "spellResistance";
			label = game.i18n.localize("SR5.ResistSpell");
			cardData.chatCard.buttons[actionType] = SR5_RollMessage.generateChatButton("opposedTest", actionType, label);
		} 
			
		//Handle object resistance 
		if (cardData.magic.spell.objectCanResist){
			actionType = "objectResistance";
			label = game.i18n.localize("SR5.ObjectResistanceTest");
			cardData.chatCard.buttons[actionType] = SR5_RollMessage.generateChatButton("nonOpposedTest", actionType, label, {gmAction: true});
		}
			
		//Handle spell Area
		if (cardData.magic.spell.range === "area"){
			cardData.magic.spell.area += cardData.magic.force;
			if (item.system.category === "detection") {
				if (item.system.spellAreaExtended === true) cardData.magic.spell.area = cardData.magic.spell.area * actorData.specialAttributes.magic.augmented.value * 10;
				else cardData.magic.spell.area = cardData.magic.spell.area * actorData.specialAttributes.magic.augmented.value;
			}
		}

		//Generate apply effect on Actor chat button
		if (cardData.effects.canApplyEffect) cardData.chatCard.buttons.applyEffect = SR5_RollMessage.generateChatButton("opposedTest", "applyEffect", game.i18n.localize("SR5.ApplyEffect"));
		//Generate apply effect on Item chat button
		if (cardData.effects.canApplyEffectOnItem) cardData.chatCard.buttons.applyEffectOnItem = SR5_RollMessage.generateChatButton("opposedTest", "applyEffectOnItem", game.i18n.localize("SR5.ApplyEffect"));
	} 

    //Roll failed
	else {
		if (cardData.test.type === "spell") label = game.i18n.localize("SR5.SpellCastingFailed");
		else if (cardData.test.type === "adeptPower" || cardData.test.type === "power") label = game.i18n.localize("SR5.PowerFailure");
		else label = game.i18n.localize("SR5.PreparationCreateFailed");
		cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", label);
	}
}