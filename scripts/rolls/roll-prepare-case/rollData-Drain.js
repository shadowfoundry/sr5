import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5 } from "../../config.js";

export default function drain(rollData, actor, chatData){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.DrainResistanceTest");

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.magic.drainResistance.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.magic.drainResistance.modifiers);

    //Determine drain damage type
    if (chatData.test.type === "summoningResistance" || chatData.test.type === "binding" || chatData.test.type === "banishing"){
        if (chatData.magic.force > actor.system.specialAttributes.magic.augmented.value) rollData.magic.drain.type = "physical";
        else rollData.magic.drain.type = "stun";    
    } else {
        if (chatData.roll.hits > actor.system.specialAttributes.magic.augmented.value) rollData.magic.drain.type = "physical";
        else rollData.magic.drain.type = "stun";
    }

    //Add details to title
    if (chatData.magic.drain.value >= 0) rollData.test.title += ` (${chatData.magic.drain.value}${game.i18n.localize(SR5.damageTypesShort[rollData.magic.drain.type])})`;

    //Add others informations
    rollData.test.type = "drain";
    rollData.magic.drain.value = chatData.magic.drain.value;
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.messageId = chatData.owner.messageId;

    //Special case for centering metamagic
    if (actor.system.magic.metamagics.centering) rollData.dialogSwitch.centering = true;

    return rollData;
}