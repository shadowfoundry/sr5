import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5 } from "../../config.js";
import { SR5_ConverterHelpers } from "../roll-helpers/converter.js";
import { SR5_RollTest } from "../roll-test.js";
import { SR5_PrepareRollTest } from "../roll-prepare.js";

export default async function defenseInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
    let actorData = actor.system;
    cardData.roll.netHits = cardData.previousMessage.hits - cardData.roll.hits;

    //Special case for injection ammo, need 3 net hits if armor is weared
    if (cardData.combat.ammo.type === "injection" && actor.system.itemsProperties.armor.value > 0){
        if (cardData.roll.netHits < 3) {
            cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
            return ui.notifications.info(game.i18n.localize("SR5.INFO_NeedAtLeastThreeNetHits"));
        }
    }

    //Handle Energetic Aura
	if (actorData.specialProperties?.energyAura !== "" && cardData.test.typeSub === "meleeWeapon") await handleEnergeticAura(cardData, actorData);

    //If Defenser win, return
    if (cardData.roll.netHits <= 0) {
        if (cardData.combat.calledShot.name === "throughAndInto") {
            let originalAttackMessage = duplicate(game.messages.get(cardData.previousMessage.messageId));
            originalAttackMessage.flags.sr5data.combat.calledShot.name = '';
            cardData.originalAttackMessage = originalAttackMessage.flags.sr5data;
            cardData.chatCard.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseThroughAndInto",game.i18n.localize("SR5.DefendSecondTarget"));
        }
        return cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
    }

    //Special case for ramming
    if (cardData.test.type === "rammingDefense") await handleRamming(cardData, actorData);

    //Handle astral combat damage
    if (cardData.test.typeSub === "astralCombat") cardData.damage.resistanceType = "astralDamage";
    else cardData.damage.resistanceType = "physicalDamage";

    //If Hardened Armor, check if damage do something
    if ((actorData.specialProperties?.hardenedArmor.value > 0) && (cardData.damage.source !== "magical")) {
        let immunity = actorData.specialProperties.hardenedArmor.value + cardData.combat.armorPenetration;
        if (cardData.damage.value + cardData.roll.netHits <= immunity) {
            cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NormalWeaponsImmunity"));
            return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: actorData.essence.value * 2, pa: cardData.combat.armorPenetration, damage: cardData.damage.value})}`);
        }
    }

    //Damage value calculation
    if (cardData.combat.firingMode.selected === "SF") cardData.damage.value = cardData.damage.base;
    else if (cardData.damage.element === "toxin") {
        if (cardData.damage.toxin.type === "airEngulf") cardData.damage.value = cardData.damage.base + cardData.roll.netHits;
        else cardData.damage.value = cardData.damage.base;
    } else cardData.damage.value = cardData.damage.base + cardData.roll.netHits;
        
    //Handle Called Shot specifics
    if (cardData.combat.calledShot.name) cardData = await handleCalledShotDefenseInfo(cardData, actorData);

    //Add fire threshold
    if (cardData.damage.element === "fire") cardData.threshold.value = cardData.roll.netHit;

    //Special case for Drone and vehicle
    if (actor.type === "actorDrone" || actor.type === "actorVehicle") {
        if (cardData.damage.type === "stun" && cardData.damage.element === "electricity") {
            cardData.damage.type = "physical";
            ui.notifications.info(`${game.i18n.localize("SR5.INFO_ElectricityChangeDamage")}`);
        }
        if (cardData.damage.type === "stun") {
            cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.VehicleArmorResistance"));
            return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
        }
        if (actorData.attributes.armor.augmented.value >= cardData.damage.value && cardData.test.type !== "rammingDefense") {
            cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest", "", game.i18n.localize("SR5.VehicleArmorResistance"));
            return ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: actorData.attributes.armor.augmented.value, damage:cardData.damage.value})}`); //
        }
    }

    //Special case for called shots
    if (cardData.combat.calledShot.name === "breakWeapon") return cardData.chatCard.buttons.weaponResistance = SR5_RollMessage.generateChatButton("nonOpposedTest","weaponResistance",game.i18n.localize("SR5.WeaponResistance"));
    if (cardData.combat.calledShot.name === "feint") return;

    //Generate Resistance chat button if not already done by called shot
    if (!cardData.chatCard.calledShotButton) {
        let label = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`;
        if (cardData.damage.element === "toxin" && !cardData.damage.type) label = `${game.i18n.localize("SR5.ResistToxin")}`;
        if (cardData.combat.armorPenetration) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.combat.armorPenetration}`;
        cardData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard",label);
    }
}


async function handleCalledShotDefenseInfo(cardData, actorData){
    cardData.chatCard.calledShotButton = true;
    let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId);
    if (typeof cardData.combat.calledShot.effects === "object") cardData.combat.calledShot.effects = Object.values(cardData.combat.calledShot.effects);

    switch (cardData.combat.calledShot.name){
        case "dirtyTrick":
            if (cardData.combat.calledShot.limitDV === 0) cardData.damage.value = 0;
            else cardData.chatCard.calledShotButton = false;
            cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.combat.calledShot.name])}`);
            break;
        case "disarm":
            if ((cardData.roll.netHits + attacker.system.attributes.strength.augmented.value) > actorData.limits.physicalLimit.value) cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.Disarm"));
            else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDisarm"));
            break;
        case "knockdown":
            if ((cardData.roll.netHits + attacker.system.attributes.strength.augmented.value) > actorData.limits.physicalLimit.value) {
                cardData.combat.calledShot.effects = {"0": {"name": "prone",}};
                cardData.damage.value = 0;				
                cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.combat.calledShot.name])}`);
            } else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
            break;
        case "blastOutOfHand":
            if (cardData.combat.calledShot.limitDV === 0) cardData.damage.value = 0;
            else cardData.chatCard.calledShotButton = false;
            let mod = cardData.combat.calledShot.effects.find(e => e.name === "blastOutOfHand");
            cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",`${game.i18n.format('SR5.BlastOutOfHand', {range: cardData.roll.netHits + mod.modFingerPopper})}`);
            break;
        case "feint":
            cardData.chatCard.calledShotButton = false;
            cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.combat.calledShot.name])}`);
            break;
        case "reversal":
            cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize('SR5.ReversedSituation'));
            break;
        case "onPinsAndNeedles":
            cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.combat.calledShot.name])}`);
            break;
        case "tag":
            cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize('SR5.CS_AS_Tag'));
            break;
        case "throughAndInto":
            let originalAttackMessage = duplicate(game.messages.get(cardData.previousMessage.messageId));
            originalAttackMessage.flags.sr5data.combat.calledShot.name = '';
            originalAttackMessage.flags.sr5data.damage.value -= 1;
            originalAttackMessage.flags.sr5data.damage.base -= 1;
            cardData.originalAttackMessage = originalAttackMessage.flags.sr5data;
            cardData.chatCard.buttons.defenseRangedWeapon = SR5_RollMessage.generateChatButton("opposedTest","defenseThroughAndInto",game.i18n.localize("SR5.DefendSecondTarget"));
            cardData.chatCard.calledShotButton = false;
            break;
        case "entanglement":
            cardData.combat.calledShot.effects = {
                "0": {
                    "name": "entanglement",
                    "netHits": cardData.roll.netHits,
                }
            };
            cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect", `${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.combat.calledShot.name])}`);
            break;
        default:
            cardData.chatCard.calledShotButton = false;
    }

    //Handle Called Shots specifics
    if (!cardData.combat.calledShot.hitsSpent && cardData.combat.calledShot.limitDV !== 0 && (cardData.combat.calledShot.name === "specificTarget" || cardData.combat.calledShot.name === "upTheAnte") && cardData.target.actorType !== "actorDrone") {
        if (cardData.roll.netHits > 1) {
            cardData.chatCard.buttons.spendNetHits = SR5_RollMessage.generateChatButton("attackerTest", "spendNetHits", `${game.i18n.localize("SR5.SpendHits")} (${cardData.roll.netHits - 1})`);
            cardData.chatCard.calledShotButton = true;
        } else {
            cardData.chatCard.calledShotButton = false;
        }
    }

    // Handle Fatigued
    if (cardData.combat.calledShot.effects.length){
        if (cardData.combat.calledShot.effects.find(e => e.name === "fatigued")){
            cardData.damage.valueFatiguedBase = Math.floor(cardData.damage.value/2);
            cardData.chatCard.buttons.fatiguedCard = SR5_RollMessage.generateChatButton("nonOpposedTest","fatiguedCard", `${game.i18n.localize("SR5.TakeOnDamageShort")} (${game.i18n.localize("SR5.STATUSES_Fatigued")}) ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damage.valueFatiguedBase}${game.i18n.localize("SR5.DamageTypeStunShort")}`);
            cardData.chatCard.calledShotButton = false;
        }
    }

    if (cardData.combat.hitsSpent) cardData.chatCard.calledShotButton = false;
    return cardData;
}

async function handleRamming(cardData, actorData) {
    //Get the attacker actor
    let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId);

    //build roll data
    let rollData = SR5_PrepareRollTest.getBaseRollData(null, attacker);
    rollData.test.type = "falseTest";
    rollData.test.typeSub = "accident";
    rollData.test.title = game.i18n.localize("SR5.CrashDamageResistance");
    rollData.damage.base = SR5_ConverterHelpers.speedToAccidentValue(cardData.owner.speed, actorData.attributes.body.augmented.value);
    rollData.damage.value = rollData.damage.base;
    rollData.damage.type = "physical";
    rollData.damage.resistanceType = "physicalDamage";
    rollData.target.actorId = null;
    rollData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest", "resistanceCard", `${game.i18n.localize("SR5.ResistAccident")} (${rollData.damage.value})`);
    rollData.chatCard.buttons.vehicleTest = SR5_RollMessage.generateChatButton("nonOpposedTest", "vehicleTest", `${game.i18n.localize("SR5.VehicleTest")} (2)`);
    
    // roll a fake test and render chat message
    rollData.roll = await SR5_RollTest.rollDice({ dicePool: 0 });
    SR5_RollTest.renderRollCard(rollData);

    //Add vehicle test to defender chat Message
    cardData.chatCard.buttons.vehicleTest = SR5_RollMessage.generateChatButton("nonOpposedTest", "vehicleTest", `${game.i18n.localize("SR5.VehicleTest")} (3)`);
}

async function handleEnergeticAura(cardData, actorData){
    //Get the attacker actor
    let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId);
    
    //build roll data
    let rollData = SR5_PrepareRollTest.getBaseRollData(null, attacker);
    rollData.test.type = "falseTest";
    rollData.test.typeSub = "energeticAura";
    rollData.test.title = game.i18n.localize("SR5.SpiritPowerEnergyAura");
    rollData.damage.base = actorData.specialAttributes.magic.augmented.value * 2;
    rollData.damage.value = rollData.damage.base;
    rollData.damage.type = "physical";
    rollData.damage.resistanceType = "physicalDamage";
    rollData.damage.source = "magical";
    rollData.combat.armorPenetration = -actorData.specialAttributes.magic.augmented.value;
    rollData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCard", `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${rollData.damage.value}${game.i18n.localize(SR5.damageTypesShort[rollData.damage.type])}  / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${rollData.combat.armorPenetration}`);

    // roll a fake test and render chat message
    rollData.roll = await SR5_RollTest.rollDice({ dicePool: 0 });
    SR5_RollTest.renderRollCard(rollData);
}