import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";

export default async function actionHitInfo(cardData, type){
    let key, label, labelEnd, testType, gmAction = false;

    switch (type){
        case "sensorTarget":
            label = game.i18n.localize("SR5.SensorDefense");
            labelEnd = game.i18n.localize("SR5.SensorTargetingActiveFailed");
            key = "sensorDefense";
            testType = "opposedTest";
            break;
        case "ramming":
            label = game.i18n.localize("SR5.Defend");
            labelEnd = game.i18n.localize("SR5.ActionFailure");
            key = "rammingDefense";
            testType = "opposedTest";
            break;
        case "preparationFormula":
            label = game.i18n.localize("SR5.PreparationResistance");
            labelEnd = game.i18n.localize("SR5.PreparationCreateFailed");
            key = "preparationResist";
            testType = "nonOpposedTest";
            cardData.chatCard.buttons.drain = SR5_RollMessage.generateChatButton("nonOpposedTest", "drain", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
            break;
        case "iceAttack":
            label = game.i18n.localize("SR5.Defend");
            labelEnd = game.i18n.localize("SR5.ActionFailure");
            key = "iceDefense";
            testType = "opposedTest";
            break;
        case "spritePower":
            label = game.i18n.localize("SR5.Defend");
            labelEnd = game.i18n.localize("SR5.PowerFailure");
            key = "complexFormDefense";
            testType = "opposedTest";
            break;
        case "power":
            label = game.i18n.localize("SR5.Defend");
            labelEnd = game.i18n.localize("SR5.PowerFailure");
            key = "powerDefense";
            testType = "opposedTest";
            break;
        case "martialArt":
            label = game.i18n.localize("SR5.Defend");
            labelEnd = game.i18n.localize("SR5.ActionFailure");
            key = "martialArtDefense";
            testType = "opposedTest";
            break;
        case "ritual":
            label = game.i18n.localize("SR5.RitualResistance");
            labelEnd = game.i18n.localize("SR5.RitualFailed");
            key = "ritualResistance";
            testType = "nonOpposedTest";
            gmAction = true;
            break;
        case "passThroughBarrier":
            label = game.i18n.localize("SR5.ManaBarrierResistance");
            labelEnd = game.i18n.localize("SR5.PassThroughBarrierFailed");
            gmAction = true;
            key = "passThroughDefense";
            testType = "nonOpposedTest";
            break;
        case "escapeEngulf":
            label = game.i18n.localize("SR5.SpiritResistance");
            labelEnd = game.i18n.localize("SR5.EscapeEngulfFailed");
            gmAction = true;
            key = "escapeEngulfDefense";
            testType = "nonOpposedTest";
            break;
        default:
    }

    if (cardData.roll.hits > 0) {
        cardData.chatCard.buttons[key] = SR5_RollMessage.generateChatButton(testType, key, label, gmAction);
    } else {
        cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","", labelEnd);
    }
}