import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function rammingDefense(rollData, actor, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.PhysicalDefenseTest")} (${chatData.roll.hits})`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.defenses.defend.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup" || mod.type === "controler"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.defenses.defend.modifiers.filter(mod => (mod.type !== "controler")));

    //Determine base limit & modifiers
    if (actor.type === "actorDrone"){
        rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.vehicleTest.limit.value, actor.system.vehicleTest.limit.modifiers);
        rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.vehicleTest.limit.modifiers);
    } else {
        rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.limits.physicalLimit.value, actor.system.limits.physicalLimit.modifiers);
        rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.limits.physicalLimit.modifiers);
    }

    //Add others informations
    rollData.test.type = "rammingDefense";
    rollData.damage.base =  chatData.damage.base;
    rollData.damage.value = chatData.damage.value;
    rollData.damage.type = chatData.damage.type;
    rollData.combat.armorPenetration = chatData.combat.armorPenetration;
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.previousMessage.messageId = chatData.owner.messageId;
    rollData.combat.activeDefenses.full = actor.system.specialProperties.fullDefenseValue || 0;
    rollData.combat.activeDefenses.dodge = actor.system.skills?.gymnastics?.rating.value || 0;
    rollData.owner.speed = chatData.target.speed;
    rollData.target.speed = chatData.owner.speed;

    return rollData;
}