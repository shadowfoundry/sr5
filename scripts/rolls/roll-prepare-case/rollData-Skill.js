import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5 } from "../../config.js";
import { SR5_MiscellaneousHelpers } from "../roll-helpers/miscellaneous.js";

//Add info for skill dicePool roll
export default async function skill(rollData, rollType, rollKey, actor, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey])}`;
    
    if(rollType === "skill"){
        //Determine base dicepool
        rollData.dicePool.base = actor.system.skills[rollKey].rating.value;

        //Determine dicepool composition
        rollData.dicePool.composition = actor.system.skills[rollKey].rating.modifiers;

        //Add others informations
        rollData.dialogSwitch.attribute = true;
        rollData.dialogSwitch.penalty = true;
    } else {
        //Add details to title
        if (actor.type === "actorDrone") {
            if (actor.system.controlMode === "autopilot") rollData.test.title += `${" + " + game.i18n.localize(SR5.vehicleAttributes[actor.system.skills[rollKey].linkedAttribute])}`;
        } else rollData.test.title += `${" + " + game.i18n.localize(SR5.allAttributes[actor.system.skills[rollKey].linkedAttribute])}`;

        //Determine dicepool composition
        rollData.dicePool.composition = SR5_PrepareRollHelper.getDicepoolComposition(actor.system.skills[rollKey].test.modifiers);

        //Determine base dicepool
        rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);
        
        //Determine dicepool modififiers
        rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.skills[rollKey].test.modifiers);
    }

    //Determine base limit
    rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.skills[rollKey].limit.value, actor.system.skills[rollKey].limit.modifiers);

    //Determine limit modififiers
    rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.skills[rollKey].limit.modifiers);

    //Handle Actions
    rollData.combat.actions = SR5_MiscellaneousHelpers.addActions(rollData.combat.actions, {type: "complex", value: 1, source: "spell"});

    //Add others informations
    rollData.test.type = "skillDicePool";
    rollData.test.typeSub = rollKey;
    rollData.limit.type = actor.system.skills[rollKey].limit.base;
    rollData.dialogSwitch.extended = true;
    rollData.dialogSwitch.specialization = true;

    //Special case for magical skills
    if(rollKey === "banishing" || rollKey === "binding" || rollKey === "counterspelling" || rollKey === "disenchanting" || rollKey === "summoning"){
        rollData.dialogSwitch.extended = false;
        if (actor.system.magic.reagents > 0 && rollKey !== "binding") rollData.dialogSwitch.reagents = true;
        rollData.magic.elements = actor.system.magic.elements;
        //Add background count limit modifiers if any
        if (actor.system.magic.bgCount.value > 0){
            rollData = SR5_PrepareRollHelper.addBackgroundCountLimitModifiers(rollData, actor);
        }
    }

    //Add force default
    if (rollKey === "summoning") rollData.magic.force = 1;

    //Special case for Astral combat
    if (rollKey === "astralCombat"){
        if (!actor.system.visions.astral.isActive) return ui.notifications.info(`${game.i18n.format("SR5.INFO_ActorIsNotInAstral", {name:actor.name})}`);
        rollData.damage.base = actor.system.magic.astralDamage.value;
        rollData.damage.value = actor.system.magic.astralDamage.value;
        rollData.dialogSwitch.extended = false;
        rollData.dialogSwitch.chooseDamageType = true;
    }

    //If roll has target, add special info to roll
    if (rollData.target.hasTarget){
        rollData = await getTargetedData(rollData, rollKey);
    }

    //If roll is opposed, add special info to roll
    if(chatData?.test?.isOpposed){
        rollData = await getOpposedData(rollData, chatData, rollKey, actor);
    }

    return rollData;
}



//-----------------------------------//
//               Helpers             //
//-----------------------------------//

async function getTargetedData(rollData, rollKey){
    let targetActor = SR5_EntityHelpers.getRealActorFromID(rollData.target.actorId);

    switch (rollKey){
        case "banishing":
            if (targetActor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);
            break;
        case "binding":
            if (targetActor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);
            else if (targetActor.system.isBounded) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_SpiritAlreadyBounded")}`);
            else rollData.limit.base = targetActor.system.force.value;
            break;
        case "counterspelling":
            let spellList = targetActor.items.filter(i => i.type === "itemSpell" && i.system.isActive);
            for (let e of Object.values(targetActor.items.filter(i => i.type === "itemEffect" && i.system.type === "itemSpell"))){
                let parentItem = await fromUuid(e.system.ownerItem);
                if (spellList.length === 0) spellList.push(parentItem);
                else {
                    let itemAlreadyIn = spellList.find((i) => i.id === parentItem.id);
                    if (!itemAlreadyIn) spellList.push(parentItem);
                }
            }
            if (spellList.length !== 0) {
                for (let s of spellList) rollData.target.itemList[s.uuid] = s.name;
            }
            break;
        case "disenchanting":
            let focusList = targetActor.items.filter(i => (i.type === "itemFocus" && i.system.isActive) || i.type === "itemPreparation");
            if (focusList.length !== 0) {
                for (let s of focusList) rollData.target.itemList[s.uuid] = s.name;
            }
            break;
        case "locksmith":
            if (targetActor.type === "actorDevice"){
                if (targetActor.system.maglock.type.cardReader || targetActor.system.maglock.type.keyPads){
                    if (targetActor.system.maglock.hasAntiTamper && targetActor.system.maglock.caseRemoved){
                        rollData.threshold.value = targetActor.system.maglock.antiTamperRating;
                    } else {
                        rollData.test.isExtended = true;
                        rollData.threshold.value = targetActor.system.matrix.deviceRating * 2;
                        rollData.test.extended.interval = "combatTurn";
                        rollData.test.extended.intervalValue = 1;
                        rollData.test.extended.multiplier = 1;
                    }
                }
            }
            break;
    }

    return rollData;
}

function getOpposedData(rollData, chatData, rollKey, actor){
    let actorData = actor.system;
    rollData.dialogSwitch.extended = false;
    rollData.test.isOpposed = true;
    rollData.threshold.value = chatData.roll.hits;
    rollData.limit.base = 0;

    if (chatData.test.typeSub === "etiquette"){
        rollData.test.title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize("SR5.Charisma") + " (" + chatData.roll.hits + ")"}`;
        rollData.dicePool.base = actorData.skills[rollKey].rating.value + actorData.attributes.charisma.augmented.value;
        rollData.limit.base = actorData.limits.socialLimit.value;
        rollData.limit.type = "socialLimit";
        rollData.dicePool.composition = ([
            {source: game.i18n.localize("SR5.Charisma"), type: "linkedAttribute", value: actorData.attributes.charisma.augmented.value},
            {source: game.i18n.localize("SR5.SkillPerception"), type: "skillRating", value: actorData.skills[rollKey].rating.value },
        ]);
    }

    if (chatData.test.typeSub === "leadership"){
        rollData.test.title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize("SR5.Willpower") + " (" + chatData.roll.hits + ")"}`;
        rollData.dicePool.base = actorData.skills[rollKey].rating.value + actorData.attributes.willpower.augmented.value;
        rollData.dicePool.composition = ([
            {source: game.i18n.localize("SR5.Willpower"), type: "linkedAttribute", value: actorData.attributes.willpower.augmented.value},
            {source: game.i18n.localize("SR5.SkillPerception"), type: "skillRating", value: actorData.skills[rollKey].rating.value },
        ]);
    }

    if (chatData.test.typeSub === "intimidation" || chatData.test.typeSub === "performance"){
        rollData.test.title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize("SR5.Charisma") + " + " + game.i18n.localize("SR5.Willpower") + " (" + chatData.roll.hits + ")"}`;
        rollData.dicePool.base = actorData.skills[rollKey].rating.value + actorData.attributes.willpower.augmented.value;
        rollData.dicePool.composition = ([
            {source: game.i18n.localize("SR5.Willpower"), type: "linkedAttribute", value: actorData.attributes.willpower.augmented.value},
            {source: game.i18n.localize("SR5.Charisma"), type: "linkedAttribute", value: actorData.attributes.charisma.augmented.value},
        ]);
    }

    if (chatData.test.typeSub === "impersonation") rollData.test.title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.allAttributes[actorData.skills[rollKey].linkedAttribute])  + " (" + chatData.roll.hits + ")"}`;
    if (chatData.test.typeSub === "negociation") rollData.test.title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.allAttributes[actorData.skills[rollKey].linkedAttribute])  + " (" + chatData.roll.hits + ")"}`;

    return rollData;
}