import { SR5_RollMessage } from "../roll-message.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";

export default async function resonanceActionInfo(cardData){
    cardData.previousMessage.hits = cardData.roll.hits;
    let testType = cardData.target.hasTarget ? "nonOpposedTest" : "opposedTest";

    switch (cardData.test.typeSub){
        case "compileSprite":
            cardData.chatCard.buttons.compileSpriteResist = SR5_RollMessage.generateChatButton("nonOpposedTest", "compileSpriteResist", game.i18n.localize("SR5.SpriteResistance"), {gmAction: true});
            break;
        case "decompileSprite":
            cardData.chatCard.buttons.decompilingResistance = SR5_RollMessage.generateChatButton(testType, "decompilingResistance", game.i18n.localize("SR5.SpriteResistance"), {gmAction: true});
            break;
        case "registerSprite":
            cardData.chatCard.buttons.registeringResistance = SR5_RollMessage.generateChatButton(testType, "registeringResistance", game.i18n.localize("SR5.SpriteResistance"), {gmAction: true});;
            break;
        case "killComplexForm":
            if (cardData.target.itemUuid) {
                let complexForm = await fromUuid(cardData.target.itemUuid);
                let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);
                cardData.matrix.fading.value = complexForm.system.fadingValue;
                if (complexForm.system.level > actor.system.specialAttributes.resonance.augmented.value) cardData.fadingType = "physical";
                else cardData.fadingType = "stun";
                cardData.chatCard.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fading", `${game.i18n.localize("SR5.ResistFading")} (${cardData.matrix.fading.value})`);

                if (cardData.roll.hits > 0) cardData.chatCard.buttons.killComplexFormResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "killComplexFormResistance", game.i18n.localize("SR5.ComplexFormResistance"), {gmAction: true});
            }
        default:
    }
}