import { SR5 } from "../../config.js";

export default function iceDefense(rollData, actor, chatData){
    if (actor.type !== "actorPc" && actor.type !== "actorGrunt" 
      && actor.type !== "actorAgent" && actor.type !== "actorSprite") return ui.notifications.warn(game.i18n.localize('SR5.WARN_InvalidActorType'));

    //Determine title
    rollData.test.title = game.i18n.localize("SR5.Defense");

    //Determine base dicepool & composition
    let firstAttribute = actor.system.attributes[chatData.various.defenseFirstAttribute].augmented.value || 0;
    let secondAttribute = actor.system.matrix.attributes[chatData.various.defenseSecondAttribute].value || 0;
    rollData.dicePool.composition = ([
        {source: game.i18n.localize(SR5.allAttributes[chatData.various.defenseFirstAttribute]), type: "linkedAttribute", value: firstAttribute},
        {source: game.i18n.localize(SR5.matrixAttributes[chatData.various.defenseSecondAttribute]), type: "matrixAttribute", value: secondAttribute},
    ]);
    rollData.dicePool.base = firstAttribute + secondAttribute;

    //Determine targeted device
    let deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive);
    rollData.target.itemUuid = deck.uuid

    //Add others informations
    rollData.test.type = "iceDefense";
    rollData.test.typeSub = chatData.test.typeSub
    rollData.previousMessage.hits = chatData.roll.hits;
    rollData.previousMessage.actorId = chatData.owner.actorId;
    rollData.damage.matrix.base = rollData.damage.matrix.value;

    return rollData;
}