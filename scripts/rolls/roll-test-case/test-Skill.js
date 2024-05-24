import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_RollMessage } from "../roll-message.js";
import { SR5_CombatHelpers } from "../roll-helpers/combat.js";

export default async function skillInfo(cardData){
    let itemTarget;
    let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);
    let actorData = actor.system;

    let testType = cardData.target.hasTarget ? "nonOpposedTest" : "opposedTest";

    if (cardData.target.itemUuid) itemTarget = await fromUuid(cardData.target.itemUuid);

    switch (cardData.test.typeSub){
        case "astralCombat":
            if (cardData.roll.hits > 0) cardData.chatCard.buttons.defenseAstralCombat = SR5_RollMessage.generateChatButton("opposedTest","defenseAstralCombat",game.i18n.localize("SR5.Defend"));
            break;
        case "banishing":
            cardData.chatCard.buttons.banishingResistance = SR5_RollMessage.generateChatButton(testType, "banishingResistance", game.i18n.localize("SR5.SpiritResistance"), {gmAction: true});
            break;
        case "binding":
            cardData.chatCard.buttons.bindingResistance = SR5_RollMessage.generateChatButton(testType, "bindingResistance", game.i18n.localize("SR5.SpiritResistance"), {gmAction: true});
            break;
        case "counterspelling":
            if (itemTarget){
                //Get Drain value
                cardData.magic.drain.value = itemTarget.system.drainValue.value;
                if (itemTarget.system.force > actorData.specialAttributes.magic.augmented.value) cardData.magic.drain.type = "physical";
                else cardData.magic.drain.type = "stun";
                //Add buttons to chat
                cardData.chatCard.buttons.drain = SR5_RollMessage.generateChatButton("nonOpposedTest", "drain", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
                if (cardData.roll.hits > 0) cardData.chatCard.buttons.dispellResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "dispellResistance", game.i18n.localize("SR5.SpellResistance"), {gmAction: true});
            }
            break;
        case "disenchanting":
            if (itemTarget){
                if (itemTarget.type === "itemPreparation"){
                    cardData.magic.drain.value = itemTarget.system.drainValue.value;
                    if (cardData.roll.hits > actorData.specialAttributes.magic.augmented.value) cardData.magic.drain.type = "physical";
                    else cardData.magic.drain.type = "stun";
                    cardData.chatCard.buttons.drain = SR5_RollMessage.generateChatButton("nonOpposedTest", "drain", `${game.i18n.localize("SR5.ResistDrain")} (${cardData.magic.drain.value})`);
                }
                if (cardData.roll.hits > 0) {
                    if (itemTarget.type === "itemFocus") cardData.chatCard.buttons.enchantmentResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "enchantmentResistance", game.i18n.localize("SR5.EnchantmentResistance"), {gmAction: true});
                    if (itemTarget.type === "itemPreparation") cardData.chatCard.buttons.disjointingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "disjointingResistance", game.i18n.localize("SR5.DisjointingResistance"), {gmAction: true});
                }
            }
            break;
        case "escapeArtist":
            if (cardData.roll.hits >= cardData.threshold.value){
                cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.EscapeArtistSuccess"));
            } else {
                cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.EscapeArtistFailed"));
            }
            break;
        case "firstAid":
            if (cardData.roll.criticalGlitchRoll) {
                let failedDamage = new Roll(`1d3`);
                await failedDamage.evaluate();
                cardData.damage.value = failedDamage.total;
                cardData.damage.type = await SR5_CombatHelpers.chooseDamageType();
                if (cardData.target.hasTarget) cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("nonOpposedTest", "damage", `${game.i18n.format('SR5.HealButtonFailed', {hits: cardData.damage.value, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damage.type]))})}`);
                else cardData.chatCard.buttons.damage = SR5_RollMessage.generateChatButton("opposedTest", "damage", `${game.i18n.format('SR5.HealButtonFailed', {hits: cardData.damage.value, damageType: (game.i18n.localize(SR5.damageTypesShort[cardData.damage.type]))})}`);
            } else if (cardData.roll.hits > 2) {
                cardData.roll.netHits = cardData.roll.hits - 2;
                if (cardData.roll.netHits > actorData.skills.firstAid.rating.value) cardData.roll.netHits = actorData.skills.firstAid.rating.value;
                if (cardData.target.hasTarget) cardData.chatCard.buttons.firstAid = SR5_RollMessage.generateChatButton("nonOpposedTest", "firstAid", `${game.i18n.format('SR5.FirstAidButton', {hits: cardData.roll.netHits})}`);
                else cardData.chatCard.buttons.firstAid = SR5_RollMessage.generateChatButton("opposedTest", "firstAid", `${game.i18n.format('SR5.FirstAidButton', {hits: cardData.roll.netHits})}`);
            } else {
                cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.HealingFailed"));
            }
            break;
        case "locksmith":
            let targetActor = SR5_EntityHelpers.getRealActorFromID(cardData.target.actorId);
            if (cardData.threshold.value > 0){
                if (targetActor.system.maglock.type.cardReader || targetActor.system.maglock.type.keyPads){
                    if (targetActor.system.maglock.hasAntiTamper && targetActor.system.maglock.caseRemoved){
                        if (cardData.roll.hits >= cardData.threshold.value) cardData.chatCard.buttons.removeAntiTamper = SR5_RollMessage.generateChatButton("nonOpposedTest","removeAntiTamper", game.i18n.localize("SR5.MaglockRemoveAntiTamper"));
                        else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.AlarmTriggered"));
                    } else if (cardData.roll.hits >= cardData.threshold.value) {
                        if (!targetActor.system.maglock.caseRemoved) cardData.chatCard.buttons.removeCase = SR5_RollMessage.generateChatButton("nonOpposedTest","removeCase", game.i18n.localize("SR5.MaglockRemoveCase"));
                        else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.MaglockIsOpen"));
                        cardData.test.isExtended = false;
                    }
                }
            }
            break;
        case "perception":
            if (cardData.test.isOpposed){
                if (cardData.roll.hits >= cardData.threshold.value) cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
                else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.FailedDefense"));
            } else {
                if (cardData.threshold.value > 0){
                    if (cardData.roll.hits >= cardData.threshold.value) cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.PerceptionSuccess"));
                    else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.PerceptionFailed"));
                }
            }
            break;
        case "summoning":
            cardData.chatCard.buttons.summoningResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "summoningResistance", game.i18n.localize("SR5.SpiritResistance"), {gmAction: true});
            break;
        case "con":
        case "impersonation":
        case "etiquette":
        case "negociation":
        case "intimidation":
        case "performance":
        case "leadership":
            if (cardData.test.isOpposed){
                if (cardData.roll.hits >= cardData.threshold.value) cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulDefense"));
                else cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.FailedDefense"));
            } else {
                if (cardData.roll.hits > 0) cardData.chatCard.buttons.con = SR5_RollMessage.generateChatButton("opposedTest", cardData.test.typeSub, game.i18n.localize("SR5.Resist"));
                cardData.test.isOpposed = true;
            }
            break;
        default:
            //Manage extended tests with threshold
            if (cardData.threshold.value > 0){
                if (cardData.roll.hits >= cardData.threshold.value) {
                    cardData.chatCard.buttons.actionEnd = SR5_RollMessage.generateChatButton("SR-CardButtonHit endTest","",game.i18n.localize("SR5.SuccessfulTest"));
                    cardData.test.isExtended = false;
                }
            }
    }
}