import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5 } from "../../config.js";
import { SR5Combat } from "../../system/srcombat.js";

export default async function resistanceInfo(cardData, actorId){
    let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
    let actorData = actor.system;

    //Remove Resist chat button from previous chat message, if necessary
    handlePreviousButtons(cardData);

    //Toxin management
    if (cardData.damage.element === "toxin"){
        cardData.damage.value = cardData.damage.base - cardData.roll.hits;

        //Handle called Shot specifics
        if (cardData.combat.calledShot.name){
            if (cardData.previousMessage.messageId) SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "spendNetHits");
            cardData = await handleCalledShotResistanceInfo(cardData, actor);
        }

        if (cardData.damage.value > 0) {
            //Get Damage info
            let damage = "";
            if (cardData.damage.type) damage = `& ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`;
            
            //Get Speed info
            let speed = game.i18n.localize("SR5.ApplyToxinEffectAtTheEndOfTheRound");
            if (cardData.damage.toxin.speed > 0) speed = `${game.i18n.format('SR5.ApplyToxinEffectAtTheEndOfXRound', {round: cardData.damage.toxin.speed})}`; //TODO
            
            //If Actor is in combat, adjust speed to display the good round
            let combatant = SR5Combat.getCombatantFromActor(actor);
            if (combatant){
                let speedRound = combatant.combat.round + cardData.damage.toxin.speed;
                speed = `${game.i18n.format('SR5.ApplyToxinEffectAtTheEndOfXRound', {round: speedRound})}`;
            }
            if (cardData.damage.toxin.type === "airEngulf") return cardData.chatCard.buttons.toxinEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "toxinEffect",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`);
            else return cardData.chatCard.buttons.toxinEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "toxinEffect",`${game.i18n.localize("SR5.ApplyToxinEffect")} ${damage}<br> ${speed}`);
        }
        else return cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDamage"));
    }

    //Add automatic succes for Hardened Armor.
    if ((actorData.specialProperties?.hardenedArmor.value > 0) && (cardData.damage.source !== "magical")) {
        let hardenedArmor = Math.floor((actorData.specialProperties.hardenedArmor.value + cardData.combat.armorPenetration) / 2);
        if (hardenedArmor > 0) {
            ui.notifications.info(`${game.i18n.localize("SR5.HardenedArmor")}: ${hardenedArmor} ${game.i18n.localize("SR5.INFO_AutomaticHits")}`);
            cardData.roll.hits += hardenedArmor;
        }
    }

    //Calcul damage value
    cardData.damage.value = cardData.damage.base - cardData.roll.hits;

    //If no Damage, return
    if (cardData.damage.value <= 0) return cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.NoDamage"));
    
    //Handle continous damage
    if (cardData.damage.isContinuous && cardData.test.typeSub !== "continuousDamage") {
        cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`);
        let label = `${game.i18n.localize("SR5.TakeOnDamageContinuous")} ${game.i18n.localize("SR5.DamageValueShort")}${game.i18n.localize("SR5.Colons")} ${cardData.damage.originalValue}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`; //TODO
        if (cardData.combat.armorPenetration) label += ` / ${game.i18n.localize("SR5.ArmorPenetrationShort")}${game.i18n.localize("SR5.Colons")} ${cardData.combat.armorPenetration}`;
        cardData.chatCard.buttons.resistanceCard = SR5_RollMessage.generateChatButton("nonOpposedTest","resistanceCardContinuousDamage",label);
        cardData.damage.resistanceType = "physicalDamage";
        //Escape engulf
        cardData.chatCard.buttons.escapeEngulf = SR5_RollMessage.generateChatButton("nonOpposedTest","escapeEngulf", game.i18n.localize("SR5.EscapeEngulfAttempt"));
        return;
    }

    //Handle called Shot specifics
    if (cardData.combat.calledShot.name){
        if (cardData.previousMessage.messageId) SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "spendNetHits");
        if (cardData.damage.resistanceType !== "fatiguedDamage") cardData = await handleCalledShotResistanceInfo(cardData, actor);
        if (cardData.combat.calledShot.name === "splittingDamage") {
            if (cardData.damage.splittedTwo) return cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damage.splittedOne}${game.i18n.localize('SR5.DamageTypeStunShort')} & ${cardData.damage.splittedTwo}${game.i18n.localize('SR5.DamageTypePhysicalShort')}`);
            else return cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damage.splittedOne}${game.i18n.localize('SR5.DamageTypeStunShort')}`);
        }
    }

    //Normal damage
    if (cardData.damage.value > 0) cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage",`${game.i18n.localize("SR5.ApplyDamage")} ${cardData.damage.value}${game.i18n.localize(SR5.damageTypesShort[cardData.damage.type])}`);		
}


function handlePreviousButtons(cardData) {
    let originalMessage, prevData;

    if (cardData.previousMessage.messageId) {
        originalMessage = game.messages.get(cardData.previousMessage.messageId);
        prevData = originalMessage.flags?.sr5data;
    }

    if (prevData?.test.type === "spell" && prevData?.magic.spell.range === "area");
    else if (prevData?.test.typeSub === "grenade");
    else if (cardData.damage.isContinuous && cardData.test.typeSub === "continuousDamage");
    else if (cardData.damage.resistanceType === "fatiguedDamage") SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "fatiguedCard"); 
    else SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "resistanceCard");

    //Remove Biofeedback chat button from previous chat message
    if (cardData.test.typeSub === "biofeedbackDamage") {
        if (prevData.chatCard.buttons.attackerDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "attackerDoBiofeedbackDamage");
        if (prevData.chatCard.buttons.defenderDoBiofeedbackDamage) SR5_RollMessage.updateChatButton(cardData.previousMessage.messageId, "defenderDoBiofeedbackDamage");
    }
}

async function handleCalledShotResistanceInfo(cardData, actor){
    cardData.roll.netHits = cardData.previousMessage.hits - cardData.roll.hits;

    //Handle specific target limit damage if any 
    if (cardData.combat.calledShot.limitDV !== 0) {
        if (cardData.combat.calledShot.limitDV < cardData.damage.value) ui.notifications.info(`${game.i18n.format("SR5.INFO_DVLimitByCalledShot", {value: cardData.combat.calledShot.limitDV})}`);
        cardData.damage.value = Math.min(cardData.damage.value, cardData.combat.calledShot.limitDV);
    }

    switch(cardData.combat.calledShot.name){
        case "flameOn":
            actor.fireDamageEffect(cardData);
            break;
        case "extremeIntimidation":
            cardData.chatCard.buttons.fear = SR5_RollMessage.generateChatButton("nonOpposedTest","calledShotFear",`${game.i18n.localize('SR5.Composure')} (${cardData.previousMessage.attackerNetHits})`);
            cardData.damage.value = 0;
            break;
        case "warningShot":
            cardData.chatCard.buttons.fear = SR5_RollMessage.generateChatButton("nonOpposedTest","calledShotFear",`${game.i18n.localize('SR5.Composure')} (4)`);
            cardData.damage.value = 0;
            break;
        case "ricochetShot":
            cardData.chatCard.buttons.fear = SR5_RollMessage.generateChatButton("nonOpposedTest","calledShotFear",`${game.i18n.localize('SR5.Composure')} (2)`);
            cardData.combat.calledShot.effects = {"0":  {"name": "shaked",}};
            break;
        case "bellringer":
            SR5Combat.changeInitInCombat(actor, -10);
            ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_Stunned", {initiative: 10})}`)
            cardData.chatCard.buttons.bellringerEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", `${game.i18n.localize("SR5.EffectApplied")} (${game.i18n.localize("SR5.STATUSES_Stunned")})`);
            break;
        case "shakeUp":
            SR5Combat.changeInitInCombat(actor, cardData.combat.calledShot.initiative);			
            ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_ShakeUp", {value: cardData.combat.calledShot.initiative})}`);
            cardData.chatCard.buttons.shakeUpEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", `${game.i18n.localize("SR5.EffectApplied")} (${game.i18n.localize("SR5.STATUSES_Shaked")})`);
            break;
        case "pin":
            if (cardData.damage.value > actor.system.itemsProperties.armor.value){
                cardData.combat.calledShot.effects = {
                    "0": {
                        "name": "pin",
                        "initialDV": cardData.damage.value - actor.system.itemsProperties.armor.value,
                    }
                };
                cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.combat.calledShot.name])}`);
            }
            break;
        case "dirtyTrick":
            if (cardData.roll.netHits > 0){
                cardData.combat.calledShot.effects = {"0": {"name": "dirtyTrick",}};
                cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect",`${game.i18n.localize("SR5.ApplyEffect")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.calledShotsEffects[cardData.combat.calledShot.name])}`);
            }
            break;
        case "splittingDamage":
            let originalDamage = cardData.damage.value;
            cardData.damage.splittedOne = Math.ceil(originalDamage/2);
            if (originalDamage > (actor.system.itemsProperties.armor.value + cardData.combat.armorPenetration)) cardData.damage.splittedTwo = Math.floor(originalDamage/2);				
            break;
    }

    if (cardData.combat.calledShot.effects.length) {		
        let effectsName = [];
        for (let effect of Object.values(cardData.combat.calledShot.effects)) {
            switch (effect.name){
                case "stunned":
                    cardData.chatCard.buttons[effect.name] = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotStunned",`${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[effect.name])})}`);
                    break;
                case "buckled":
                    cardData.chatCard.buttons[effect.name] = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotBuckled",`${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[effect.name])})}`);
                    break;
                case "nauseous":
                    cardData.chatCard.buttons[effect.name] = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotNauseous",`${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[effect.name])})}`);
                    break;
                case "knockdown":
                    cardData.chatCard.buttons[effect.name] = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotKnockdown",`${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[effect.name])})}`);
                    break;
                case "fatigued":
                    break;
                default:
                    effectsName.push(effect.name);
                    let effectsLabel = effectsName.map(e => game.i18n.localize(SR5.calledShotsEffects[e]));
                    effectsLabel = effectsLabel.join(", ");
                    let applyLabel = (effectsName.length > 1) ? game.i18n.localize("SR5.ApplyEffects") : game.i18n.localize("SR5.ApplyEffect");
                    cardData.chatCard.buttons.calledShotEffect = SR5_RollMessage.generateChatButton("nonOpposedTest", "calledShotEffect", `${applyLabel}${game.i18n.localize("SR5.Colons")} ${effectsLabel}`);
            }
        }
    }

    return cardData;
}