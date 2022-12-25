import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_CombatHelpers } from "../roll-helpers/combat.js";
import { SR5 } from "../../config.js";

//Add info for Resistance Roll
export default async function resistance(rollData, rollType, actor, chatData){
    let actorData = actor.system;
    //Transfert necessary info from chatCard
    rollData.damage.base = chatData.damage.value;
    rollData.damage.type = chatData.damage.type;
    rollData.damage.element = chatData.damage.element;
    rollData.damage.source = chatData.damage.source;
    rollData.previousMessage.messageId = chatData.owner.messageId;
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.attackerNetHits = chatData.roll.netHits;
    rollData.combat.calledShot = chatData.combat.calledShot;

    rollData.test.title = game.i18n.localize("SR5.TakeOnDamageShort");
    
    //Special case for fatigued called shot
    if (rollType === "fatiguedCard") {
        rollData.damage.base = chatData.damage.valueFatiguedBase;
        rollData.damage.type = "stun";
        rollData.damage.resistanceType = "fatiguedDamage";
    }

    //Special case for Aura
    if (rollType === "resistanceCardAura") {
        let auraOwner = SR5_EntityHelpers.getRealActorFromID(chatData.owner.actorId);
        rollData.damage.base = auraOwner.system.specialAttributes.magic.augmented.value * 2;
        rollData.combat.armorPenetration = -auraOwner.system.specialAttributes.magic.augmented.value;
        rollData.damage.element = auraOwner.system.specialProperties.energyAura;
        if (rollData.damage.element === "fire") rollData.threshold.value = auraOwner.system.specialAttributes.magic.augmented.value;
    }
    
    //handle distance between defenser and explosive device
    if (rollData.combat.grenade.isGrenade) await handleGrenade(rollData, chatData, actor);

    //Iterate throught damage type and add corresponding info
    switch (chatData.damage.resistanceType){
        case "physicalDamage":
            rollData = await handlePhysicalDamage(rollData, actor, chatData);
            break;
        case "directSpellMana":
            if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToManaSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
            rollData = await handleDirectSpell(rollData, actorData, chatData);
            break;
        case "directSpellPhysical":
            if (actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToPhysicalSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
            rollData = await handleDirectSpell(rollData, actorData, chatData);
            break;
        case "biofeedback":
            rollData = await handleBiofeedbackDamage(rollData, actorData, chatData);
            break;
        case "dumpshock":
            rollData = await handleDumpshockDamage(rollData, actorData);
            break;
        case "astralDamage":
            rollData = await handleAstralDamage(rollData, actorData, chatData);
            break;
        case "fatiguedDamage":
            rollData = await handleFatiguedDamage(rollData, actorData, chatData);
            break;
        default:
            SR5_SystemHelpers.srLog(1, `Unknown '${chatData.damage.resistanceType}' Damage Resistance Type in roll`);
    }
    
    if(!rollData) return;

    //Add general information
    rollData.combat.armorPenetration = chatData.combat.armorPenetration;
    rollData.test.type = "resistanceCard";
    
    return rollData;
}


//-----------------------------------//
//       Physical Damage Part        //
//-----------------------------------//
async function handlePhysicalDamage(rollData, actor, chatData){
    let actorData = actor.system, armor;

    //Determine title
    if (chatData.combat.calledShot.name === "splittingDamage" && (actor.type === "actorPc" || actor.type === "actorSpirit")) {
        rollData.test.title = `${game.i18n.localize("SR5.TakeOnDamage")} (${rollData.damage.base}${game.i18n.localize('SR5.DamageTypeStunShort')}/${game.i18n.localize('SR5.DamageTypePhysicalShort')})`;
    } else rollData.test.title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damage.type])} (${rollData.damage.base})`;
    
    //Iterate throught actor type to add dicepool info
    switch (actor.type){
        case "actorDrone":
            if (chatData.damage.element === "toxin") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToToxin")}`);
            if (chatData.damage.type === "stun") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
            rollData = await handleDroneDamage(rollData, actorData, chatData);
            break;
        case "actorSpirit":
            if (chatData.damage.element === "toxin") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToToxin")}`);
            rollData = await handleSpiritDamage(rollData, actorData, chatData);
            break;
        case "actorPc":
        case "actorGrunt":
            armor = actorData.itemsProperties.armor.value;
            if (chatData.damage.element) {
                if (chatData.damage.element === "toxin") rollData = await handleToxinDamage(rollData, actorData, chatData);
                else rollData = await handleElementDamage(rollData, actorData, chatData, armor);
            } else rollData = await handleNormalPhysicalDamage(rollData, actor, chatData, armor);
            break;
        default:
    }

    if(!rollData) return;

    //Add others informations
    rollData.test.typeSub = "physicalDamage";
    rollData.damage.source = chatData.damage.source;
    rollData.previousMessage.actorId = chatData.previousMessage.actorId;
    if (rollData.damage.element === "fire") rollData.threshold.value = chatData.roll.netHits;

    //handle continuous damage;
    rollData.damage.originalValue = chatData.damage.originalValue;
    rollData.damage.isContinuous = chatData.damage.isContinuous;
    if (chatData.test.typeSub === "continuousDamage"){
        rollData.test.typeSub = chatData.test.typeSub;
        rollData.damage.base = chatData.damage.originalValue;
    }

    return rollData;
}

async function handleNormalPhysicalDamage(rollData, actor, chatData, armor){
    //Check if AP is greater than Armor
    if (-chatData.combat.armorPenetration > armor) chatData.combat.armorPenetration = -armor;

    //Add AP modifiers to dicepool
    rollData.dicePool.modifiers.armorPenetration = {};
    rollData.dicePool.modifiers.armorPenetration.value = chatData.combat.armorPenetration;
    rollData.dicePool.modifiers.armorPenetration.label = game.i18n.localize("SR5.ArmorPenetration");

    //Get the base dicepool and composition
    rollData.dicePool.composition = actor.system.resistances.physicalDamage.modifiers;
    rollData.dicePool.base = actor.system.resistances.physicalDamage.dicePool;

    //Check if damage must be converted to stun
    if (rollData.damage.base < (armor + chatData.combat.armorPenetration) && chatData.combat.calledShot.name !== "splittingDamage"){
        rollData.test.title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[rollData.damage.type])} (${rollData.damage.base})`;
        rollData.damage.type = "stun";
        ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDVSoStun", {armor: armor + chatData.combat.armorPenetration, damage:rollData.damage.base})}`); 
    }

    return rollData;
}

async function handleElementDamage(rollData, actorData, chatData, armor){
    let element = chatData.damage.element;
    
    //Add special armor if any
    armor += actorData.itemsProperties.armor.specialDamage[element].value;

    //Check if AP is greater than Armor
    if (-chatData.combat.armorPenetration > armor) chatData.combat.armorPenetration = -armor;

    //Add AP modifiers to dicepool
    rollData.dicePool.modifiers.armorPenetration = {};
    rollData.dicePool.modifiers.armorPenetration.value = chatData.combat.armorPenetration;
    rollData.dicePool.modifiers.armorPenetration.label = game.i18n.localize("SR5.ArmorPenetration");

    //Get the base dicepool and composition
    rollData.dicePool.composition = actorData.resistances.specialDamage[element].modifiers;
    rollData.dicePool.base = actorData.resistances.specialDamage[element].dicePool;

    return rollData;
}

async function handleToxinDamage(rollData, actorData, chatData){
    let toxinType, vectors = [];
    
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize(SR5.toxinTypes[chatData.damage.toxin.type])}`;
    
    //If more than one vector is present, open dialog box
    for (let [key, value] of Object.entries(chatData.damage.toxin.vector)){
        if (value) {
            toxinType = key;
            vectors.push(key);
        }
    }
    if (vectors.length > 1) toxinType = await SR5_CombatHelpers.chooseToxinVector(vectors);

    //Check if toxin penetration is greater than armor
    let armor = actorData.itemsProperties.armor.toxin[toxinType].value;
    if (-chatData.damage.toxin.penetration > armor) chatData.damage.toxin.penetration = armor;

    //Add toxin penetration modifiers to dicepool
    rollData.dicePool.modifiers.toxinPenetration = {};
    rollData.dicePool.modifiers.toxinPenetration.value = chatData.damage.toxin.penetration;
    rollData.dicePool.modifiers.toxinPenetration.label = game.i18n.localize("SR5.ToxinPenetration");

    //Get the base dicepool and composition
    rollData.dicePool.composition = actorData.resistances.toxin[toxinType].modifiers;
    rollData.dicePool.base = actorData.resistances.toxin[toxinType].dicePool;

    //Add others informations  
    rollData.damage.base = chatData.damage.toxin.power;
    rollData.damage.toxin = chatData.damage.toxin;

    return rollData;
}

async function handleDroneDamage(rollData, actorData, chatData){
    let armor = actorData.attributes.armor.augmented.value;
    for (let a of actorData.resistances.physicalDamage.modifiers.filter(a => a.type === "armor")){
        armor += a.value;
    }  

    //Check if AP is greater than Armor
    if ((rollData.damage.base < (armor + chatData.combat.armorPenetration)) && chatData.test.type !== "ramming") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: armor + chatData.combat.armorPenetration, damage: rollData.damage.base})}`);
    if (-chatData.combat.armorPenetration > armor) chatData.combat.armorPenetration = -armor;
    
    //Add AP modifiers to dicepool
    rollData.dicePool.modifiers.armorPenetration = {};
    rollData.dicePool.modifiers.armorPenetration.value = chatData.combat.armorPenetration;
    rollData.dicePool.modifiers.armorPenetration.label = game.i18n.localize("SR5.ArmorPenetration");

    //Get the base dicepool and composition
    rollData.dicePool.composition = actorData.resistances.physicalDamage.modifiers;
    rollData.dicePool.base = actorData.resistances.physicalDamage.dicePool;

    return rollData;
}

async function handleSpiritDamage(rollData, actorData, chatData){
    let armor = 0;
    if (chatData.damage.source === "magical"){
        let hardenedArmor = actorData.resistances.physicalDamage.modifiers.filter((el) => el.type === "hardenedArmor");
        rollData.dicePool.composition = actorData.resistances.physicalDamage.modifiers.filter((el) => el.type !=="hardenedArmor");
        rollData.dicePool.base = actorData.resistances.physicalDamage.dicePool - hardenedArmor[0].value;
    } else {
        armor = actorData.essence.value * 2;

        //Check if AP is greater than Armor
        if (rollData.damage.base < (armor + chatData.combat.armorPenetration)) return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: armor, pa: chatData.combat.armorPenetration, damage: rollData.damage.base})}`);
        
        //Add AP modifiers to dicepool
        if (-chatData.combat.armorPenetration > armor) chatData.combat.armorPenetration = -armor;
        rollData.dicePool.modifiers.armorPenetration = {};
        rollData.dicePool.modifiers.armorPenetration.value = chatData.combat.armorPenetration;
        rollData.dicePool.modifiers.armorPenetration.label = game.i18n.localize("SR5.ArmorPenetration");
    
        //Get the base dicepool and composition
        rollData.dicePool.composition = actorData.resistances.physicalDamage.modifiers;
        rollData.dicePool.base = actorData.resistances.physicalDamage.dicePool;
    }
    
    return rollData;
}


//-----------------------------------//
//        Others Damage types        //
//-----------------------------------//

async function handleDirectSpell(rollData, actorData, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.ResistanceTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterResistances[chatData.damage.resistanceType])} (${rollData.damage.base})`;

    //Determine base dicepool & composition
    rollData.dicePool.base = actorData.resistances[chatData.damage.resistanceType].dicePool;
    rollData.dicePool.composition = actorData.resistances[chatData.damage.resistanceType].modifiers;

    //Add others informations
    rollData.test.typeSub = "spellDamage";
    
    return rollData;
}

async function handleBiofeedbackDamage(rollData, actorData, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.ResistBiofeedbackDamage")} (${rollData.damage.base})`;

    //Determine base dicepool & composition
    rollData.dicePool.base = actorData.matrix.resistances.biofeedback.dicePool;
    rollData.dicePool.composition = actorData.matrix.resistances.biofeedback.modifiers;

    //Determine damage type
    if (chatData.blackout) rollData.damage.type = "stun";
    else {
        if (actorData.matrix.userMode === "coldsim") rollData.damage.type = "stun";
        else if (actorData.matrix.userMode === "hotsim") rollData.damage.type = "physical";
    }

    //Handle defender's biofeedback
    if (chatData.chatCard.buttons.defenderDoBiofeedbackDamage) rollData.matrix.defenderDoBiofeedbackDamage = true;

    //Add others informations
    rollData.test.typeSub = "biofeedbackDamage";

    return rollData;
}

async function handleDumpshockDamage(rollData, actorData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.ResistDumpshock")} (6)`;

    //Determine base dicepool & composition
    rollData.dicePool.base = actorData.matrix.resistances.dumpshock.dicePool;
    rollData.dicePool.composition = actorData.matrix.resistances.dumpshock.modifiers;

    //Determine damage type & value
    if (actorData.matrix.userMode === "coldsim") rollData.damage.type = "stun";
    else if (actorData.matrix.userMode === "hotsim") rollData.damage.type = "physical";
    rollData.damage.base = 6;

    //Add others informations
    rollData.test.typeSub = "dumpshock";

    return rollData;
}

async function handleAstralDamage(rollData, actorData, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damage.type])} (${rollData.damage.base})`;

    //Determine base dicepool & composition
    rollData.dicePool.base = actorData.resistances.astralDamage.dicePool;
    rollData.dicePool.composition = actorData.resistances.astralDamage.modifiers;

    //Determine damage type
    rollData.damage.type = chatData.damage.type;

    //Add others informations
    rollData.test.typeSub = "astralDamage";
    
    return rollData;
}

async function handleFatiguedDamage(rollData, actorData, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damage.type])} (${damage.base})`; //TODO: add details

    //Determine base dicepool & composition
    rollData.dicePool.base = actorData.resistances.physicalDamage.dicePool - actorData.itemsProperties.armor.value;
    rollData.dicePool.composition = actorData.resistances.physicalDamage.modifiers.filter((el) => !actorData.itemsProperties.armor.modifiers.includes(el));

    //Determine damage type
    rollData.damage.type = chatData.damage.type;

    //Add others informations
    rollData.test.typeSub = "physicalDamage";
}


//-----------------------------------//
//               Helpers             //
//-----------------------------------//
async function handleGrenade(rollData, chatData, actor){
    let grenadePosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.itemId);          
    let defenserPosition = SR5_EntityHelpers.getActorCanvasPosition(actor);
    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(grenadePosition, defenserPosition);
    let modToDamage = distance * rollData.combat.grenade.damageFallOff;
    rollData.damage.base  = chatData.damage.base + modToDamage;
    if (rollData.damage.base <= 0 && chatData.damage.element !== "toxin") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);  
    if (modToDamage === 0) ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistance", {distance:distance})}`);
    else ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistanceFallOff", {distance:distance, modifiedDamage: modToDamage, finalDamage: rollData.damage.base})}`);
}