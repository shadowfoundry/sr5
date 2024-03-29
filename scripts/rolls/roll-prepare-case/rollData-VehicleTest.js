import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5_MiscellaneousHelpers } from "../roll-helpers/miscellaneous.js";

export default function vehicleTest(rollData, actor, chatData){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.VehicleTest")}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.vehicleTest.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup" || mod.type === "manual"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.vehicleTest.test.modifiers.filter(mod => (mod.type !== "manual")));

    //Determine base limit
    rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(actor.system.vehicleTest.limit.value, actor.system.vehicleTest.limit.modifiers);

    //Determine limit modififiers
    rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, actor.system.vehicleTest.limit.modifiers);
    rollData.limit.type = "handling";

    //Add others informations
    if (chatData) rollData.previousMessage.messageId = chatData.owner.messageId;
    rollData.test.type = "vehicleTest";

    //Handle Actions
    rollData.combat.actions = SR5_MiscellaneousHelpers.addActions(rollData.combat.actions, {type: "complex", value: 1, source: "vehicleTest"});

    //Special, for ramming test
    if (chatData){
        if (chatData.test.type === "rammingDefense") {rollData.threshold.value = 3;}
        if (chatData.test.type === "ramming") rollData.threshold.value = 2;
        rollData.test.typeSub = chatData.test.type;
        rollData.test.title = `${game.i18n.localize("SR5.VehicleTest")} (${rollData.threshold.value})`;
    }

    return rollData;
}