import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function fading(rollData, actor, chatData){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.FadingResistanceTest");
    if (chatData.matrix.fading.value >= 0) title += ` (${chatData.matrix.fading.value})`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.matrix.resistances.fading.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.matrix.resistances.fading.modifiers);

    //Determine fading damage typ
    if (chatData.roll.hits > actor.system.specialAttributes.resonance.augmented.value) rollData.matrix.fading.type = "physical";
    else rollData.matrix.fading.type = chatData.matrix.fading.type;

    //Add others informations
    rollData.test.type = "fading";
    rollData.matrix.fading.value = chatData.matrix.fading.value;
    rollData.previousMessage.hits = chatData.roll.hits;

    return rollData;
}