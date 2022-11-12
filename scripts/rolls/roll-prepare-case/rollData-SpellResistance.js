import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default async function spellResistance(rollData, chatData){
    let spellItem = await fromUuid(chatData.owner.itemUuid);
    let spellData = spellItem.system;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.ResistSpell")}${game.i18n.localize("SR5.Colons")} ${spellItem.name}`;

    //Determine base dicepool & composition
    if (actor.type === "actorDrone" || actor.type === "actorDevice"){
        rollData.dicePool.base = 15;
        rollData.dicePool.composition = ([{source: game.i18n.localize(SR5.ObjectHighlyProcessed), type: game.i18n.localize('SR5.Special'), value: 15},]);
    } else {
        let firstAttribute = actorData.attributes[spellData.defenseFirstAttribute].augmented.value;
        let secondAttribute = actorData.attributes[spellData.defenseSecondAttribute].augmented.value;
        rollData.dicePool.composition = ([
            {source: game.i18n.localize(SR5.allAttributes[spellData.defenseFirstAttribute]), type: "linkedAttribute", value: firstAttribute},
            {source: game.i18n.localize(SR5.allAttributes[spellData.defenseSecondAttribute]), type: "linkedAttribute", value: secondAttribute},
        ]);
        rollData.dicePool.base = firstAttribute + secondAttribute;
    }

    //Add others informations
    rollData.test.type = "spellResistance";
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.itemUuid = chatData.owner.itemUuid;

    //Add transferable effects
    rollData = SR5_PrepareRollHelper.addTransferableEffect(rollData, item);

    return rollData;

}