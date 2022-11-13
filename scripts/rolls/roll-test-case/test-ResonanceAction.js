import { SR5_RollMessage } from "../roll-message.js";

export default async function resonanceActionInfo(cardData){
    cardData.previousMessage.hits = cardData.roll.hits;
    let testType = cardData.hasTarget ? "nonOpposedTest" : "opposedTest";

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
            if (cardData.targetEffect) {
                let complexForm = await fromUuid(cardData.targetEffect);
                let actor = SR5_EntityHelpers.getRealActorFromID(cardData.actorId);
                cardData.fadingValue = complexForm.system.fadingValue;
                if (complexForm.system.level > actor.system.specialAttributes.resonance.augmented.value) cardData.fadingType = "physical";
                else cardData.fadingType = "stun";
                cardData.chatCard.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fading", `${game.i18n.localize("SR5.ResistFading")} (${cardData.fadingValue})`);

                if (cardData.roll.hits > 0) cardData.chatCard.buttons.killComplexFormResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "killComplexFormResistance", game.i18n.localize("SR5.ComplexFormResistance"), {gmAction: true});
            }
        default:
    }
}