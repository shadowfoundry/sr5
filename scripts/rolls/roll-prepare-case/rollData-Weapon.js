import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_CombatHelpers } from "../roll-helpers/combat.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5 } from "../../config.js";

//Add info for weapon Roll
export default async function weapon(rollData, actor, item){
    let actorData = actor.system,
        itemData = item.system;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.AttackWith")} ${item.name}`;

    //Determine dicepool composition
    rollData.dicePool.composition = itemData.weaponSkill.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, itemData.weaponSkill.modifiers);

    //Determine limit
    if (itemData.category === "grenade") {
        rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actorData.limits.physicalLimit.value, actorData.limits.physicalLimit.modifiers);
        rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actorData.limits.physicalLimit.modifiers);
        rollData.limit.type = "physicalLimit";
    } else {
        rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(itemData.accuracy.value, itemData.accuracy.modifiers);
        rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, itemData.accuracy.modifiers);
        rollData.limit.type = "accuracy";
    }

    //Recoil Compensation calculation
    rollData.combat.recoil.compensationActor = actorData.recoilCompensation.value;
    rollData.combat.recoil.compensationWeapon = itemData.recoilCompensation.value;
    rollData.combat.recoil.cumulative = -(actor.getFlag("sr5", "cumulativeRecoil") || 0);
    rollData.combat.recoil.value = rollData.combat.recoil.compensationActor - rollData.combat.recoil.cumulative;
    if (actor.type !== "actorDrone") rollData.combat.recoil.value += rollData.combat.recoil.compensationWeapon;
    
    //Handle Targets & range
    rollData = await handleTargetInfo(rollData, actor, item);
    if(!rollData) return;

    //Handle Martial Arts for Called Shots
    rollData = await handleMartialArtsCalledShot(rollData, actor);

    //Handle Toxin
    if (itemData.damageElement === "toxin") rollData.damage.toxin = itemData.toxin;
    
    //Add others informations
    rollData.test.typeSub = itemData.category;
    rollData.test.type = "attack";
    rollData.damage.base = itemData.damageValue.value;
    rollData.damage.value = itemData.damageValue.value;
    rollData.damage.type = itemData.damageType;
    rollData.damage.element = itemData.damageElement;
    if (itemData.isMagical) rollData.damage.source = "magical";
    rollData.combat.armorPenetration = itemData.armorPenetration.value;
    rollData.combat.ammo.type = itemData.ammunition.type;
    rollData.combat.ammo.value = itemData.ammunition.value;
    rollData.combat.ammo.max = itemData.ammunition.max;
    rollData.combat.firingMode.singleShot = itemData.firingMode.singleShot;
    rollData.combat.firingMode.semiAutomatic = itemData.firingMode.semiAutomatic;
    rollData.combat.firingMode.burstFire = itemData.firingMode.burstFire;
    rollData.combat.firingMode.fullyAutomatic = itemData.firingMode.fullyAutomatic;
    rollData.combat.range.short = itemData.range.short.value;
    rollData.combat.range.medium = itemData.range.medium.value;
    rollData.combat.range.long = itemData.range.long.value;
    rollData.combat.range.extreme = itemData.range.extreme.value;
    rollData.combat.weaponType = itemData.type;

    //Special case for engulf
    if (itemData.systemEffects.length){
        for (let e of Object.values(itemData.systemEffects)){
            if (e.value === "engulfWater" || e.value === "engulfFire" || e.value === "engulfAir" || e.value === "engulfEarth") {
                rollData.damage.isContinuous = true;
                rollData.damage.originalValue = itemData.damageValue.value;
            }
        }
    }

    //Special case for Energy aura and melee weapon
    if (actorData.specialProperties.energyAura){
        rollData.damage.base = itemData.damageValue.value + actorData.specialAttributes.magic.augmented.value;
        rollData.damage.value = itemData.damageValue.value + actorData.specialAttributes.magic.augmented.value;
        rollData.combat.armorPenetration = -actorData.specialAttributes.magic.augmented.value;
        rollData.damage.element = actorData.specialProperties.energyAura;
        if (actorData.specialProperties.energyAura !== "electricity") rollData.damage.type = "physical";
    }

    return rollData;
}



//-----------------------------------//
//               Helpers             //
//-----------------------------------//

async function handleTargetInfo(rollData, actor, item){
    let itemData = item.system;
    if (!canvas.scene) return;
    let target = 0,
        sceneEnvironmentalMod;
    rollData.target.range = "short";
    
    //Initialize area environmental modifiers
    let areaEffect = {visibility:0, light:0, glare:0, wind:0}

    //Get attacker position
    let attacker = SR5_EntityHelpers.getActorCanvasPosition(actor);

    //Handle Targets
    if (game.user.targets.size) {
        //For now, only allow one target for attack;
        if (game.user.targets.size > 1) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetTooMany")}`);

        //Get target actor
        let targetActor = await SR5_PrepareRollHelper.getTargetedActor();

        //check if actor is in a template effect
        areaEffect = await checkIfTargetIsInTemplate(actor, targetActor, areaEffect);

        //Add actor type and ID to chatMessage
        rollData.target.hasTarget = true;
        rollData.target.actorType = targetActor.type;
        rollData.target.actorId = await SR5_PrepareRollHelper.getTargetedActorID();

        //Get target position
        const targeted = game.user.targets;
        const targets = Array.from(targeted);
        for (let t of targets) {
            target = {
                x: t.x,
                y: t.y,
            };
        }
    }

    //Add specific data for grenade & missile
    if (itemData.category === "grenade"|| itemData.type === "grenadeLauncher" || itemData.type === "missileLauncher") {
        target = SR5_SystemHelpers.getTemplateItemPosition(item.id);
        rollData.test.typeSub = "grenade";
        rollData.chatCard.templateRemove = true;
        rollData.combat.grenade.isGrenade = true;
        rollData.combat.grenade.damageFallOff = itemData.blast.damageFallOff;
        rollData.combat.grenade.blastRadius = itemData.blast.radius;
    }

    //Calcul distance between Attacker and Target
    rollData.target.rangeInMeters = await SR5_SystemHelpers.getDistanceBetweenTwoPoint(attacker, target);

    //Handle Melee specifics
    if (itemData.category === "meleeWeapon") {
        rollData.combat.reach = itemData.reach.value
        if (rollData.target.rangeInMeters > (itemData.reach.value + 1)) return ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
        sceneEnvironmentalMod = SR5_CombatHelpers.handleEnvironmentalModifiers(game.scenes.active, actor.system, true, areaEffect);
    } else { // Handle weapon ranged based on distance
        if (rollData.target.rangeInMeters < itemData.range.short.value) rollData.target.range = "short";
        else if (rollData.target.rangeInMeters < itemData.range.medium.value) rollData.target.range = "medium";
        else if (rollData.target.rangeInMeters < itemData.range.long.value) rollData.target.range = "long";
        else if (rollData.target.rangeInMeters < itemData.range.extreme.value) rollData.target.range = "extreme";
        else if (rollData.target.rangeInMeters > itemData.range.extreme.value) {
            if (itemData.category === "grenade"|| itemData.type === "grenadeLauncher" || itemData.type === "missileLauncher") SR5_RollMessage.removeTemplate(null, item.id)
            return ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
        }
        sceneEnvironmentalMod = SR5_CombatHelpers.handleEnvironmentalModifiers(game.scenes.active, actor.system, false, areaEffect);
    }

    //Add environmental modifiers
    if (sceneEnvironmentalMod !== 0){
        rollData.dicePool.modifiers.environmentalSceneMod = {};
        rollData.dicePool.modifiers.environmentalSceneMod.value = sceneEnvironmentalMod;
        rollData.dicePool.modifiers.environmentalSceneMod.label = game.i18n.localize("SR5.EnvironmentalModifiers");
    }

    return rollData;
}

async function checkIfTargetIsInTemplate(actor, targetActor, areaEffect){
    let targetActorItems = targetActor.items.filter(i => i.type === "itemEffect" && i.system.type === "areaEffect");
    for (let i of targetActorItems){
        //Check if current actors is not inside the same area effect
        if (!actor.items.find(actorItem => actorItem.system.ownerID === i.system.ownerID)){
            //iterate through customEffects and add modifiers to areaEffect variable
            for (let e of i.system.customEffects){
                if (e.category === "environmentalModifiers") areaEffect[e.target.slice(40)] = e.value;
            }
        }
    }

    return areaEffect;
}

async function handleMartialArtsCalledShot(rollData, actor){
    if (actor.items.find((item) => item.type === "itemMartialArt")) {
        let martialArts = actor.items.filter(i => i.type === "itemMartialArt" && i.system.isActive && i.system.calledShot !== "");
        if (martialArts.length){
            for (let m of martialArts){
                if (m.system.calledShot === "pin") rollData.combat.calledShot.martialArts.pin = true;
                if (m.system.calledShot === "disarm") rollData.combat.calledShot.martialArts.disarm = true;
                if (m.system.calledShot === "entanglement") rollData.combat.calledShot.martialArts.entanglement = true;
                if (m.system.calledShot === "breakWeapon") rollData.combat.calledShot.martialArts.breakWeapon = true;
                if (m.system.calledShot === "feint") rollData.combat.calledShot.martialArts.feint = true;
            }
        }
    }
    return rollData;
}