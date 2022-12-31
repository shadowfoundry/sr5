import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default async function spellResistance(rollData, actor, chatData){
    if (actor.type === "actorAgent" || actor.type === "actorSprite" || actor.type === "actorDevice") return;
    let spellItem = await fromUuid(chatData.owner.itemUuid);
    let spellData = spellItem.system;

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.ResistSpell")}${game.i18n.localize("SR5.Colons")} ${spellItem.name}`;

    //Determine base dicepool & composition
    if (actor.type === "actorDrone" || actor.type === "actorDevice"){
        rollData.dicePool.base = 15;
        rollData.dicePool.composition = ([{source: game.i18n.localize("SR5.ObjectHighlyProcessed"), type: "linkedAttribute", value: 15},]);
    } else {
        let firstAttribute = actor.system.attributes[spellData.defenseFirstAttribute].augmented.value;
        let secondAttribute = actor.system.attributes[spellData.defenseSecondAttribute].augmented.value;
        rollData.dicePool.composition = ([
            {source: game.i18n.localize(SR5.allAttributes[spellData.defenseFirstAttribute]), type: "linkedAttribute", value: firstAttribute},
            {source: game.i18n.localize(SR5.allAttributes[spellData.defenseSecondAttribute]), type: "linkedAttribute", value: secondAttribute},
        ]);
        rollData.dicePool.base = firstAttribute + secondAttribute;
    }

    //Add others informations
    rollData.test.type = "spellResistance";
    rollData.magic.force = chatData.magic.force;
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.itemUuid = chatData.owner.itemUuid;
    rollData.previousMessage.messageId = chatData.owner.messageId;

    //Add transferable effects
    rollData = SR5_PrepareRollHelper.addTransferableEffect(rollData, spellItem);

    return rollData;

}