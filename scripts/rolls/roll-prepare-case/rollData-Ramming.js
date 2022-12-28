import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function ramming(rollData, actor){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.RammingWith")} ${actor.name}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.rammingTest.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.rammingTest.test.modifiers);

    //Determine base limit
    rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.rammingTest.limit.value, actor.system.rammingTest.limit.modifiers);

    //Determine limit modififiers
    rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.rammingTest.limit.modifiers);
    rollData.limit.type = "handling";

    //Add others informations
    rollData.test.type = "ramming";
    rollData.damage.base = actor.system.attributes.body.augmented.value;
    rollData.damage.value = actor.system.attributes.body.augmented.value;
    rollData.damage.type = "physical";
    rollData.combat.armorPenetration = -6;
    rollData.combat.activeDefenses.full = actor.system.specialProperties.fullDefenseValue || 0;
    rollData.combat.activeDefenses.dodge = actor.system.skills?.gymnastics?.rating.value || 0;

    return rollData;
}