import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function drain(rollData, actor, chatData){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.DrainResistanceTest");
    if (chatData.magic.drain.value >= 0) title += ` (${chatData.magic.drain.value})`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.magic.drainResistance.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, magic.drainResistance.modifiers);

    //Determine drain damage type
    if (chatData.roll.hits > actor.system.specialAttributes.magic.augmented.value) rollData.magic.drain.type = "physical";
    else rollData.magic.drain.type = chatData.magic.drain.type;

    //Add others informations
    rollData.test.type = "drain";
    rollData.magic.drain.value = chatData.magic.drain.value;
    rollData.previousMessage.hits = chatData.roll.hits;

    //Special case for centering metamagic
    if (actor.system.magic.metamagics.centering) rollData.dialogSwitch.centering = true;

    return rollData;
}