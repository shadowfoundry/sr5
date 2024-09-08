import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_CombatHelpers } from "../roll-helpers/combat.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5_MiscellaneousHelpers } from "../roll-helpers/miscellaneous.js";
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
    rollData.combat.recoil.cumulative = actor.getFlag("sr5", "cumulativeRecoil") || 0;
    rollData.combat.recoil.value = rollData.combat.recoil.compensationActor - rollData.combat.recoil.cumulative;
    if (actor.type !== "actorDrone") rollData.combat.recoil.value += rollData.combat.recoil.compensationWeapon;
    
    //Handle Targets & range
    rollData = await handleTargetInfo(rollData, actor, item);
    if(!rollData) return;

    //Handle Martial Arts for Called Shots
    rollData = await handleMartialArtsCalledShot(rollData, actor);

    //Handle Toxin
    if (itemData.damageElement === "toxin") rollData.damage.toxin = itemData.toxin;

    //Handle Anticoagulant
    if (actorData.specialProperties.anticoagulant === true) itemData.damageElement = "anticoagulant";

    //Handle Actions
    if (itemData.category === "meleeWeapon") rollData.combat.actions = SR5_MiscellaneousHelpers.addActions(rollData.combat.actions, {type: "complex", value: 1, source: "attack"});
    
    //Add others informations
    rollData.test.typeSub = itemData.category;
    rollData.test.type = "attack";
    rollData.damage.base = itemData.damageValue.value;
    rollData.damage.value = itemData.damageValue.value;
    rollData.damage.type = itemData.damageType;
    rollData.damage.element = itemData.damageElement;
    if (itemData.isMagical) rollData.damage.source = "magical";
    rollData.combat.armorPenetration = itemData.armorPenetration.value;
    if (itemData.ammunition.type === "av" && rollData.target.actorType === "actorDrone") rollData.combat.armorPenetration -= 4;
    rollData.combat.ammo.type = itemData.ammunition.type;
    rollData.combat.ammo.value = itemData.ammunition.value;
    rollData.combat.ammo.max = itemData.ammunition.max;
    rollData.combat.firingMode.singleShot = itemData.firingMode.singleShot;
    rollData.combat.firingMode.semiAutomatic = itemData.firingMode.semiAutomatic;
    rollData.combat.firingMode.burstFire = itemData.firingMode.burstFire;
    rollData.combat.firingMode.fullyAutomatic = itemData.firingMode.fullyAutomatic;

    rollData.lists.firingModes = {}
    if (rollData.combat.firingMode.singleShot) rollData.lists.firingModes.SS = `${game.i18n.localize("SR5.WeaponModeSS")} (${game.i18n.localize("SR5.WeaponModeSSShort")} [-1 ${game.i18n.localize("SR5.Bullet")}]`;
    if (rollData.combat.firingMode.semiAutomatic) {
        rollData.lists.firingModes.SA = `${game.i18n.localize("SR5.WeaponModeSA")} (${game.i18n.localize("SR5.WeaponModeSAShort")} [-1 ${game.i18n.localize("SR5.Bullet")}]`;
        rollData.lists.firingModes.SB = `${game.i18n.localize("SR5.WeaponModeSB")} (${game.i18n.localize("SR5.WeaponModeSBShort")} [-3 ${game.i18n.localize("SR5.Bullets")}]`;
    }
    if (rollData.combat.firingMode.burstFire) {
        rollData.lists.firingModes.BF = `${game.i18n.localize("SR5.WeaponModeBF")} (${game.i18n.localize("SR5.WeaponModeBFShort")} [-3 ${game.i18n.localize("SR5.Bullets")}]`;
        rollData.lists.firingModes.LB = `${game.i18n.localize("SR5.WeaponModeLB")} (${game.i18n.localize("SR5.WeaponModeLBShort")} [-6 ${game.i18n.localize("SR5.Bullets")}]`;
    }
    if (rollData.combat.firingMode.fullyAutomatic) {
        rollData.lists.firingModes.FA = `${game.i18n.localize("SR5.WeaponModeFA")} (${game.i18n.localize("SR5.WeaponModeFAShort")} [-6 ${game.i18n.localize("SR5.Bullets")}]`;
        rollData.lists.firingModes.FAc = `${game.i18n.localize("SR5.WeaponModeFA")} (${game.i18n.localize("SR5.WeaponModeFAShort")} [-10 ${game.i18n.localize("SR5.Bullets")}]`;
        rollData.lists.firingModes.SF = `${game.i18n.localize("SR5.WeaponModeSF")} (${game.i18n.localize("SR5.WeaponModeSFShort")} [-20 ${game.i18n.localize("SR5.Bullets")}]`;
    }
    
    rollData.combat.range.short = itemData.range.short.value;
    rollData.combat.range.medium = itemData.range.medium.value;
    rollData.combat.range.long = itemData.range.long.value;
    rollData.combat.range.extreme = itemData.range.extreme.value;
    rollData.combat.weaponType = itemData.type;
    rollData.lists.weaponRanges = {
        short: `${game.i18n.localize("SR5.WeaponRangeShort")} (${game.i18n.localize("SR5.WeaponRangeUpTo")} ${rollData.combat.range.short}) ${game.i18n.localize("SR5.MeterUnit")}`,
        medium: `${game.i18n.localize("SR5.WeaponRangeMedium")} (${game.i18n.localize("SR5.WeaponRangeUpTo")} ${rollData.combat.range.medium}) ${game.i18n.localize("SR5.MeterUnit")}`,
        long: `${game.i18n.localize("SR5.WeaponRangeLong")} (${game.i18n.localize("SR5.WeaponRangeUpTo")} ${rollData.combat.range.long}) ${game.i18n.localize("SR5.MeterUnit")}`,
        extreme: `${game.i18n.localize("SR5.WeaponRangeExtreme")} (${game.i18n.localize("SR5.WeaponRangeUpTo")} ${rollData.combat.range.extreme}) ${game.i18n.localize("SR5.MeterUnit")}`,
    }

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

    _buildCalledShotList(rollData)

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
        if (rollData.target.rangeInMeters > (itemData.reach.value + 1,41)) return ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
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

    //Handle ranged weapon current firing mode
    if (itemData.category === "rangedWeapon") {
        if (itemData.firingMode.current !== "") rollData.combat.firingMode.selected = itemData.firingMode.current;
        else rollData.combat.firingMode.selected = itemData.firingMode.value[0];
    }
    
    //Handle shotgun current choke settings
    if (itemData.type === "shotgun") {
        if (itemData.choke.current !== "") rollData.combat.choke.selected = itemData.choke.current;
        else rollData.combat.choke.selected = itemData.choke.value[0];
    }

    //Add environmental modifiers
    if (sceneEnvironmentalMod !== 0){
        rollData.dicePool.modifiers.push({
            type: "environmentalSceneMod", 
            label: game.i18n.localize("SR5.EnvironmentalModifiers"),
            value: sceneEnvironmentalMod,
        })
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
    for (let [key, value] of Object.entries(actor.system.itemsProperties.martialArts)){
        if (value.isActive) rollData.combat.calledShot.martialArts[key] = true;
    }
    return rollData;
}

function _buildCalledShotList(rollData){
    rollData.lists.calledShots = {}
    rollData.lists.calledShotsSpecific = {}

    let ammoType = rollData.combat.ammo.type

    if (ammoType === "explosive" || ammoType ==="exExplosive" || ammoType === "flechette" || ammoType === "arrow" || ammoType === "bolt" || ammoType === "gel" || ammoType === "hollowPoint") {
        rollData.lists.calledShots.blastOutOfHand = game.i18n.localize("SR5.CS_AS_FingerPopper")
    } else {
        rollData.lists.calledShots.blastOutOfHand = game.i18n.localize("SR5.CS_BlastOutOfHand")
    }

    if (rollData.test.typeSub === "meleeWeapon" && rollData.combat.calledShot.martialArts.breakWeapon){
        rollData.lists.calledShots.breakWeapon = game.i18n.localize("SR5.CS_BreakWeapon")
    }

    if (rollData.damageType === "stun"){
        rollData.lists.calledShots.harderKnock = game.i18n.localize("SR5.CS_HarderKnock")
    }

    rollData.lists.calledShots.specificTarget = game.i18n.localize("SR5.CS_SpecificTarget")

    if (ammoType === "explosive" || ammoType ==="exExplosive" || ammoType === "frangible" || ammoType === "gel" || ammoType === "gyrojet" || ammoType === "gyrojetTaser" || ammoType === "hollowPoint") {
        rollData.lists.calledShots.dirtyTrick = game.i18n.localize("SR5.CS_AS_HereMuckInYourEye")
    } else {
        rollData.lists.calledShots.dirtyTrick = game.i18n.localize("SR5.CS_DirtyTrick")
    }

    if ((ammoType === "special" || ammoType ==="bolt" || ammoType ==="boltInjection" || ammoType ==="arrow" || ammoType ==="arrowInjection") && rollData.combat.calledShot.martialArts.pin){
        rollData.lists.calledShots.pin = game.i18n.localize("SR5.CS_Pin")
    }
    
    if (rollData.combat.weaponType === "unarmed" && rollData.combat.calledShot.martialArts.disarm){
        rollData.lists.calledShots.disarm = game.i18n.localize("SR5.CS_Disarm")
    }

    if ((rollData.combat.weaponType === "exoticRangedWeapon" || rollData.combat.weaponType === "exoticMeleeWeapon") && rollData.combat.calledShot.martialArts.entanglement){
        rollData.lists.calledShots.entanglement = game.i18n.localize("SR5.CS_Entanglement")
    }

    if (ammoType === "explosive" || ammoType ==="exExplosive") {
        rollData.lists.calledShots.shakeUp = game.i18n.localize("SR5.CS_AS_ShakeRattle")
    } else {
        rollData.lists.calledShots.shakeUp = game.i18n.localize("SR5.CS_ShakeUp")
    }

    if (rollData.combat.weaponType === "meleeWeapon" && rollData.combat.calledShot.martialArts.feint){
        rollData.lists.calledShots.feint = game.i18n.localize("SR5.CS_Feint")
    }

    rollData.lists.calledShots.splittingDamage = game.i18n.localize("SR5.CS_SplittingDamage")

    if (rollData.combat.weaponType === "meleeWeapon"){
        rollData.lists.calledShots.knockdown = game.i18n.localize("SR5.CS_Knockdown")
    }

    rollData.lists.calledShots.trickShot = game.i18n.localize("SR5.CS_TrickShot")

    if (rollData.combat.weaponType === "meleeWeapon" || rollData.combat.weaponType === "meleeWeunarmedapon"){
        rollData.lists.calledShots.reversal = game.i18n.localize("SR5.CS_Reversal")
    }

    rollData.lists.calledShots.vitals = game.i18n.localize("SR5.CS_Vitals")

    //Ammo specifics called shots
    if (ammoType === "gel") rollData.lists.calledShotsSpecific.bellringer = game.i18n.localize("SR5.CS_AS_Bellringer")
    if (ammoType === "gel" || ammoType === "gyrojet" || ammoType === "gyrojetTaser") rollData.lists.calledShotsSpecific.ricochetShot = game.i18n.localize("SR5.CS_AS_RicochetShot")
    if (ammoType === "apds") rollData.lists.calledShotsSpecific.bullsEye = game.i18n.localize("SR5.CS_AS_BullsEye")
    if (ammoType === "capsule" || ammoType === "capsuleDmso") rollData.lists.calledShotsSpecific.downTheGullet = game.i18n.localize("SR5.CS_AS_DownTheGullet")
    if (ammoType === "assaultCannon") rollData.lists.calledShotsSpecific.extremeIntimidation = game.i18n.localize("SR5.CS_AS_ExtremeIntimidation")
    if (ammoType === "injection" || ammoType === "boltInjection" || ammoType === "arrowInjection") {
        rollData.lists.calledShotsSpecific.warningShot = game.i18n.localize("SR5.CS_AS_WarningShot")
        rollData.lists.calledShotsSpecific.hitEmWhereItCounts = game.i18n.localize("SR5.CS_AS_HitEmWhereItCounts")
    }
    if (ammoType === "flare" || ammoType === "gyrojetTaser" || ammoType === "tracer") rollData.lists.calledShotsSpecific.flameOn = game.i18n.localize("SR5.CS_AS_FlameOn")
    if (ammoType === "flare") rollData.lists.calledShotsSpecific.flashBlind = game.i18n.localize("SR5.CS_AS_FlashBlind")
    if (ammoType === "flechette" || ammoType === "arrow" || ammoType === "arrowBarbedHead" || ammoType === "arrowExplosiveHead" 
       || ammoType === "arrowHammerhead" || ammoType === "arrowIncendiaryHead" || ammoType === "arrowScreamerHead"
       || ammoType === "arrowStickNShock" || ammoType === "arrowStaticShaft" || ammoType === "bolt") {
        rollData.lists.calledShotsSpecific.onPinsAndNeedles = game.i18n.localize("SR5.CS_AS_OnPinsAndNeedles")
        rollData.lists.calledShotsSpecific.shreddedFlesh = game.i18n.localize("SR5.CS_AS_ShreddedFlesh")
    }
    if (ammoType === "tracker") rollData.lists.calledShotsSpecific.flashBlind = game.i18n.localize("SR5.CS_AS_Tag")
    if (ammoType === "apds" || ammoType === "gauss") rollData.lists.calledShotsSpecific.throughAndInto = game.i18n.localize("SR5.CS_AS_ThroughAndInto")
    if (ammoType === "av" || ammoType === "assaultCannon") rollData.lists.calledShotsSpecific.upTheAnte = game.i18n.localize("SR5.CS_AS_UpTheAnte")

    rollData.lists.calledShotsSpecificDroneTarget = {
        engineBlock: game.i18n.localize("SR5.CS_ST_EngineBlock"),
        fuelTankBattery: game.i18n.localize("SR5.CS_ST_FuelTankBattery"),
        axle: game.i18n.localize("SR5.CS_ST_Axle"),
        antenna: game.i18n.localize("SR5.CS_ST_Antenna"),
        doorLock: game.i18n.localize("SR5.CS_ST_DoorLock"),
        windowMotor: game.i18n.localize("SR5.CS_ST_WindowMotor"),
    }

    rollData.lists.calledShotsSpecificTarget = {
        ankle: game.i18n.localize("SR5.CS_ST_Ankle"),
        ear: game.i18n.localize("SR5.CS_ST_Ear"),
        eye: game.i18n.localize("SR5.CS_ST_Eye"),
        foot: game.i18n.localize("SR5.CS_ST_Foot"),
        forearm: game.i18n.localize("SR5.CS_ST_Forearm"),
        genitals: game.i18n.localize("SR5.CS_ST_Genitals"),
        gut: game.i18n.localize("SR5.CS_ST_Gut"),
        hand: game.i18n.localize("SR5.CS_ST_Hand"),
        hip: game.i18n.localize("SR5.CS_ST_Hip"),
        jaw: game.i18n.localize("SR5.CS_ST_Jaw"),
        knee: game.i18n.localize("SR5.CS_ST_Knee"),
        neck: game.i18n.localize("SR5.CS_ST_Neck"),
        shin: game.i18n.localize("SR5.CS_ST_Shin"),
        shoulder: game.i18n.localize("SR5.CS_ST_Shoulder"),
        sternum: game.i18n.localize("SR5.CS_ST_Sternum"),
        thigh: game.i18n.localize("SR5.CS_ST_Thigh"),
    }

    return rollData
}