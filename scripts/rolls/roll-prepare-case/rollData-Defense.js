import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_CombatHelpers } from "../roll-helpers/combat.js";

//Add info for Defense Roll
export default async function defense(rollData, actor, chatData){
    if (actor.type === "actorDevice" || actor.type === "actorSprite") return;
    let actorData = actor.system;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.PhysicalDefenseTest")} (${chatData.roll.hits})`;

    //Determine dicepool composition
    rollData.dicePool.composition = actorData.defenses.defend.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup" || mod.type === "controler"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actorData.defenses.defend.modifiers.filter(mod => (mod.type !== "controler")));

    //Add others informations
    rollData.test.type = "defense";
    rollData.test.typeSub = chatData.test.typeSub;
    rollData.dialogSwitch.cover = true;
    rollData.combat.activeDefenses.full = actorData.specialProperties.fullDefenseValue || 0;
    rollData.combat.activeDefenses.dodge = actorData.skills?.gymnastics?.rating.value || 0;
    rollData.combat.activeDefenses.block = actorData.skills?.unarmedCombat?.rating.value || 0;
    rollData.combat.activeDefenses.parryClubs = actorData.skills?.clubs?.rating.value || 0;
    rollData.combat.activeDefenses.parryBlades = actorData.skills?.blades?.rating.value || 0;

    //Transfering data from chatCard
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.messageId = chatData.owner.messageId;
    rollData.previousMessage.damage = chatData.damage.value;
    rollData.previousMessage.userId = chatData.owner.userId;
    rollData.damage.element = chatData.damage.element;
    rollData.damage.value = chatData.damage.value;
    rollData.damage.base = chatData.damage.base;
    rollData.damage.type = chatData.damage.type;
    rollData.damage.source = chatData.damage.source;
    rollData.damage.isContinuous = chatData.damage.isContinuous;
    rollData.damage.originalValue = chatData.damage.originalValue;
    rollData.combat.ammo.type = chatData.combat.ammo.type;
    rollData.combat.calledShot = chatData.combat.calledShot;
    rollData.combat.armorPenetration = chatData.combat.armorPenetration;
    rollData.combat.firingMode.selected = chatData.combat.firingMode.selected;
    rollData.target.actorType = chatData.target.actorType;
    rollData.target.rangeInMeters = chatData.target.rangeInMeters;   
    rollData.target.range = chatData.target.range; 
    rollData.combat.choke = chatData.target.choke;  

    //Add special info for Suppressive fire
    if (chatData.combat.firingMode.selected === "SF"){
        rollData = await handleSuppressiveFire(rollData, actorData);
    }

    //Add special info for Melee Weapon modifiers
    if (chatData.test.typeSub === "meleeWeapon"){
        rollData = await handleMeleeWeaponModifiers(rollData, actor, chatData);
    }
    
    //Handle Astral combat defense
    if (chatData.test.typeSub === "astralCombat"){
        if ((actor.type === "actorDevice" || actor.type === "actorSprite") || !actorData.visions.astral.isActive) return ui.notifications.info(`${game.i18n.format("SR5.INFO_TargetIsNotInAstral", {name:actor.name})}`);
        rollData = await handleAstralCombat(rollData, actor, chatData);
    }
                
    //Manage spell area templates
    if (canvas.scene && chatData.type === "spell" && chatData.spellRange === "area"){
        rollData = await handleSpellAreaTemplate(rollData, actor, chatData);
        if (!rollData) return;
    }
        
    //Spell damage source
    if (chatData.test.type === "spell") rollData.damage.source = "magical";

    //Add modifiers if actor is locked by sensorHandle sensor locked
    rollData = await handleSensorLocked(rollData, actor, chatData);
                
    //Handle toxin, if any
    if (chatData.damage.toxin.type) {
        if (chatData.damage.toxin.power > 0 && chatData.combat.calledShot.name === "downTheGullet") chatData.damage.toxin.power += 2; 
        rollData.damage.toxin = chatData.damage.toxin;
    }

    //Handle cumulative defense
    rollData = await SR5_PrepareRollHelper.handleCumulativeDefense(rollData, actor);
    
    return rollData;
}

async function handleSuppressiveFire(rollData, actorData){
    //Determine base dicepool
    rollData.dicePool.base = actorData.attributes.reaction.augmented.value + (actorData.specialAttributes?.edge?.augmented?.value || 0);

    //Determine dicepool composition
    rollData.dicePool.composition = [
        {source: game.i18n.localize("SR5.Reaction"), type: "linkedAttribute", value: actorData.attributes.reaction.augmented.value},
        {source: game.i18n.localize("SR5.Edge"), type: "linkedAttribute", value: (actorData.specialAttributes?.edge?.augmented?.value || 0)},
    ]

    //Add others informations
    rollData.dialogSwitch.cover = false;
    rollData.combat.firingMode.selected = "SF";

    return rollData;
}

async function handleMeleeWeaponModifiers(rollData, actor, chatData){
    //Add reach modifiers
    let reach = (actor.system.reach?.value || 0) - chatData.combat.reach;
    let weaponUsedToDefend = actor.items.find(i => (i.type === "itemWeapon") && (i.system.category === "meleeWeapon") && (i.system.isActive));
    if (weaponUsedToDefend) reach = weaponUsedToDefend.system.reach.value - chatData.combat.reach;
    rollData.combat.reach = reach;
    if (reach !== 0){
        rollData.dicePool.modifiers.reach = {};
        rollData.dicePool.modifiers.reach.value = reach;
        rollData.dicePool.modifiers.reach.label = game.i18n.localize("SR5.CharacterReach");
    }
    
    //Add environmental modifiers
    let environmentalMod = SR5_CombatHelpers.handleEnvironmentalModifiers(game.scenes.active, actor.system, true);
    if (environmentalMod !== 0){
        rollData.dicePool.modifiers.environmentalSceneMod = {};
        rollData.dicePool.modifiers.environmentalSceneMod.value = SR5_CombatHelpers.handleEnvironmentalModifiers(game.scenes.active, actor.system, true);
        rollData.dicePool.modifiers.environmentalSceneMod.label = game.i18n.localize("SR5.EnvironmentalModifiers");
    }

    return rollData;
}

async function handleAstralCombat(rollData, actor, chatData){
    let actorData = actor.system;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.AstralDefenseTest")} (${chatData.roll.hits})`;
    //Determine dicepool composition
    rollData.dicePool.composition = actorData.magic.astralDefense.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);
    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actorData.magic.astralDefense.modifiers);
    //Add others informations
    rollData.dialogSwitch.cover = false;

    return rollData;
}

async function handleSpellAreaTemplate(rollData, actor, chatData){
    // Spell position
    let spellPosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.owner.itemId); 
    
    // Get defenser position
    let defenserPosition = SR5_EntityHelpers.getActorCanvasPosition(actor);
    
    // Calcul distance between grenade and defenser
    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(spellPosition, defenserPosition);
    
    //modify the damage based on distance and damage dropoff.
    if (chatData.magic.spell.area < distance) return ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
    rollData.magic.spell.range = chatData.magic.spell.range;

    return rollData;
}

async function handleSensorLocked(rollData, actor, chatData){
    let sensorLocked = actor.items.find(i => (i.type === "itemEffect") && (i.system.type === "sensorLock") && (i.system.ownerID === chatData.owner.speakerId) );
    if(sensorLocked){
        rollData.dicePool.modifiers.sensorLockMod = {};
        rollData.dicePool.modifiers.sensorLockMod.value = sensorLocked.system.value;
        rollData.dicePool.modifiers.sensorLockMod.label = game.i18n.localize("SR5.EffectSensorLock");
    }

    return rollData;
}