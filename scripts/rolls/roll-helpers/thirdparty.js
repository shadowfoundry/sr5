import { SR5 } from "../../config.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_SocketHandler } from "../../socket.js";
import { SR5_ConverterHelpers } from "./converter.js";
import { SR5_RollTest } from "../roll-test.js";
import { SR5_PrepareRollTest } from "../roll-prepare.js";

export class SR5_ThirdPartyHelpers {
    /** Handle spirit, sprite or preparation resistance
    * @param {Object} cardData - The origin cardData
    */
    static async createItemResistance(cardData, messageId) {
        let targetItem;
        let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);
        let rollData = SR5_PrepareRollTest.getBaseRollData(null, actor);

        //Transfer basic info from previous message
        rollData.previousMessage.actorId = cardData.owner.actorId;
        rollData.previousMessage.hits = cardData.roll.hits;
        rollData.previousMessage.messageId = messageId;

        //add roll info for Spirit resistance
        if (cardData.test.typeSub === "summoning"){
            rollData.magic.spiritType = cardData.magic.spiritType;
            rollData.magic.force = cardData.magic.force;
            rollData.test.type = "summoningResistance";
            rollData.test.title = `${game.i18n.localize("SR5.SummoningResistance")} (${rollData.previousMessage.hits})`;
            rollData.dicePool.composition = [{source: game.i18n.localize("SR5.Force"), type: "linkedAttribute", value: rollData.magic.force},];
            rollData.dicePool.base = rollData.magic.force;
            rollData.dicePool.value = rollData.magic.force;
        }

        //add roll info for Sprite resistance
        else if (cardData.test.typeSub === "compileSprite"){
            rollData.matrix.spriteType = cardData.matrix.spriteType;
            rollData.matrix.level = cardData.matrix.level;
            rollData.test.type = "compilingResistance";
            rollData.test.title = `${game.i18n.localize("SR5.CompilingResistance")} (${rollData.previousMessage.hits})`;
            rollData.dicePool.composition = [{source: game.i18n.localize("SR5.Level"), type: "linkedAttribute", value: rollData.matrix.level},];
            rollData.dicePool.base = rollData.matrix.level;
            rollData.dicePool.value = rollData.matrix.level;
        }

        //Spell Resistance
        else if (cardData.test.typeSub === "counterspelling"){
            targetItem = await fromUuid(cardData.target.itemUuid);
            rollData.dicePool.value = targetItem.system.casterMagic + targetItem.system.force;
            rollData.dicePool.composition = ([
                {source: game.i18n.localize("SR5.CasterMagic"), type: "linkedAttribute", value: targetItem.system.casterMagic},
                {source: game.i18n.localize("SR5.SpellForce"), type: "linkedAttribute", value: targetItem.system.force},
            ]);
            if (targetItem.system.quickening) {
                rollData.dicePool.value += targetItem.system.karmaSpent;
                rollData.dicePool.composition.push({source: game.i18n.localize("SR5.MetamagicQuickening"), type: "metamagic", value: targetItem.system.karmaSpent});
            }
            rollData.dicePool.base = rollData.dicePool.value;
            rollData.test.type = "dispellResistance";
            rollData.test.title = `${game.i18n.localize("SR5.SpellResistance")} (${targetItem.name})`;
            rollData.target.itemUuid = cardData.target.itemUuid;
        }

        //Enchantment Resistance
        else if (cardData.test.typeSub === "disenchanting"){
            targetItem = await fromUuid(cardData.target.itemUuid);
            if (targetItem.type === "itemFocus") {
                rollData.dicePool.value = targetItem.parent.system.specialAttributes.magic.augmented.value + targetItem.system.itemRating;
                rollData.test.type = "enchantmentResistance";
                rollData.test.title = `${game.i18n.localize("SR5.EnchantmentResistance")} (${targetItem.name})`;
                rollData.dicePool.composition = ([
                    {source: game.i18n.localize("SR5.CasterMagic"), type: "linkedAttribute", value: targetItem.parent.system.specialAttributes.magic.augmented.value},
                    {source: game.i18n.localize("SR5.ItemRating"), type: "linkedAttribute", value: targetItem.system.itemRating},
                ]);
            }
            if (targetItem.type === "itemPreparation") {
                rollData.dicePool.value = targetItem.parent.system.specialAttributes.magic.augmented.value + targetItem.system.force;
                rollData.test.type = "disjointingResistance";
                rollData.test.typeSub = "preparation";
                rollData.test.title = `${game.i18n.localize("SR5.DisjointingResistance")} (${targetItem.name})`;
                rollData.dicePool.composition = ([
                    {source: game.i18n.localize("SR5.CasterMagic"), type: "linkedAttribute", value: targetItem.parent.system.specialAttributes.magic.augmented.value},
                    {source: game.i18n.localize("SR5.ItemRating"), type: "linkedAttribute", value: targetItem.system.force},
                ]);
            }
            rollData.dicePool.base = rollData.dicePool.value;
            rollData.test.title = `${game.i18n.localize("SR5.SpellResistance")} (${targetItem.name})`;
            rollData.target.itemUuid = cardData.target.itemUuid;
        }

        //Preparation resistance
        if (cardData.test.type === "preparationFormula"){
            rollData.dicePool.value = cardData.magic.force;
            rollData.dicePool.base = rollData.dicePool.value;
            rollData.owner.itemId = cardData.owner.itemId;
            rollData.magic.force = cardData.magic.force;
            rollData.magic.preparationTrigger = cardData.magic.preparationTrigger;
            rollData.owner.itemUuid = cardData.owner.itemUuid;
            rollData.test.type = "preparationResistance";
            rollData.test.title = `${game.i18n.localize("SR5.PreparationResistance")} (${rollData.previousMessage.hits})`;
        }

        //Ritual resistance
        else if (cardData.test.type === "ritual"){
            rollData.dicePool.value = cardData.magic.force * 2;
            rollData.dicePool.base = rollData.dicePool.value;
            rollData.dicePool.composition = [
                {source: game.i18n.localize("SR5.Force"), type: "linkedAttribute", value: rollData.magic.force},
                {source: game.i18n.localize("SR5.Force"), type: "linkedAttribute", value: rollData.magic.force},
            ];
            rollData.owner.itemId = cardData.owner.itemId;
            rollData.owner.itemUuid = cardData.owner.itemUuid;
            rollData.magic.force = cardData.magic.force;
            rollData.magic.reagentsSpent = cardData.magic.reagentsSpent;
            rollData.test.type = "ritualResistance";
            rollData.test.title = `${game.i18n.localize("SR5.RitualResistance")} (${rollData.previousMessage.hits})`;
        }

        //Complex form resistance
        else if (cardData.test.type === "resonanceAction" && cardData.test.typeSub === "killComplexForm"){
            targetItem = await fromUuid(cardData.target.itemUuid);
            rollData.dicePool.value = targetItem.system.threaderResonance + targetItem.system.level;
            rollData.dicePool.base = rollData.dicePool.value;
            rollData.dicePool.composition = ([
                {source: game.i18n.localize("SR5.ThreaderResonance"), type: "linkedAttribute", value: targetItem.system.threaderResonance},
                {source: game.i18n.localize("SR5.Level"), type: "linkedAttribute", value: targetItem.system.level},
            ]);
            rollData.target.itemUuid = cardData.target.itemUuid;
            rollData.test.type = "complexFormResistance";
            rollData.test.title = `${game.i18n.localize("SR5.ComplexFormResistance")} (${targetItem.name})`;
        }

        //Escape Engulf
        else if (cardData.test.type === "escapeEngulf"){
            let spirit = SR5_EntityHelpers.getRealActorFromID(cardData.previousMessage.actorId);
            rollData.dicePool.value = spirit.system.attributes.body.augmented.value + spirit.system.specialAttributes.magic.augmented.value;
            rollData.dicePool.base = rollData.dicePool.value;
            rollData.dicePool.composition = ([
                {source: game.i18n.localize("SR5.Body"), type: "linkedAttribute", value: spirit.system.attributes.body.augmented.value},
                {source: game.i18n.localize("SR5.Magic"), type: "linkedAttribute", value: spirit.system.specialAttributes.magic.augmented.value},
            ]);
            rollData.test.type = "engulfResistance";
            rollData.test.title = `${game.i18n.localize("SR5.SpiritResistance")} (${rollData.previousMessage.hits})`;
        }

        //Weapon break Resistance
        else if (cardData.test.type === "defense"){
            let activeWeapons = actor.items.filter(i => i.type === "itemWeapon" && i.system.isActive);
            if (activeWeapons.length === 0) return ui.notifications.warn(game.i18n.localize('SR5.WARN_NoEquippedWeapon'));

            let dialogData = {
                    list: SR5.barrierTypes,
                    weaponList: activeWeapons,
                },
                barrierType, weapon,
                cancel = true;
            
            await new Promise((resolve, reject) => {
                renderTemplate("systems/sr5/templates/interface/chooseWeaponMaterial.html", dialogData).then((dlg) => {
                    new Dialog({
                    title: game.i18n.localize('SR5.ChooseWeaponMaterial'),
                    content: dlg,
                    buttons: {
                        ok: {
                            label: "Ok",
                            callback: () => (cancel = false),
                        },
                        cancel: {
                            label: "Cancel",
                            callback: () => (cancel = true),
                        },
                    },
                    default: "ok",
                    close: (html) => {
                        if (cancel) return;
                        barrierType = html.find("[name=barrierType]").val();
                        weapon = html.find("[name=weapon]").val();
                        resolve(barrierType);
                    },
                    }).render(true);
                });
            });

            let structure = SR5_ConverterHelpers.barrierTypeToStructure(barrierType);
            let armor = SR5_ConverterHelpers.barrierTypeToArmor(barrierType);

            rollData.dicePool.value = armor + structure;
            rollData.dicePool.base = rollData.dicePool.value;
            rollData.dicePool.composition = ([
                {source: game.i18n.localize("SR5.Armor"), type: "linkedAttribute", value: armor},
                {source: game.i18n.localize("SR5.Structure"), type: "linkedAttribute", value: structure},
            ]);
            rollData.damage.value = cardData.damage.value;
            rollData.test.type = "weaponResistance";
            rollData.combat.structure = structure;
            rollData.target.itemUuid = weapon;
            rollData.target.actorId = cardData.owner.actorId;
        }

        rollData.roll = await SR5_RollTest.rollDice({ dicePool: rollData.dicePool.value });

        await SR5_RollTest.addInfoToCard(rollData, cardData.owner.actorId);
        SR5_RollTest.renderRollCard(rollData);
    }

    static async reduceSideckickService(cardData){
        let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.speakerId),
            actorData = foundry.utils.duplicate(actor.system),
            key;

        if (actor.type === "actorSprite"){
            key = "tasks";
            ui.notifications.info(`${actor.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.format('SR5.INFO_TasksReduced', {task: cardData.roll.netHits})}`);
        } else if (actor.type === "actorSpirit"){
            key = "services";
            ui.notifications.info(`${actor.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.format('SR5.INFO_ServicesReduced', {service: cardData.roll.netHits})}`);
        }
        actorData[key].value -= cardData.roll.netHits;
        if (actorData[key].value < 0) actorData[key].value = 0;
        await actor.update({'system': actorData});
    }

    static async enslavedSidekick(cardData, type){
        let actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.speakerId);
        let actorData = foundry.utils.duplicate(actor.system);

        if (type === "registerSprite"){
            actorData.isRegistered = true;
            actorData.tasks.value += cardData.roll.netHits;
            actorData.tasks.max += cardData.roll.netHits;
            ui.notifications.info(`${actor.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.format('SR5.INFO_SpriteRegistered', {task: cardData.roll.netHits})}`);
        } else if (type === "bindSpirit"){
            actorData.isBounded = true;
            actorData.services.value += cardData.roll.netHits;
            actorData.services.max += cardData.roll.netHits;
            ui.notifications.info(`${actor.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.format('SR5.INFO_SpiritBounded', {service: cardData.roll.netHits})}`);
        }
        await actor.update({'system': actorData});
        
        if (actorData.creatorItemId){
            let creator = SR5_EntityHelpers.getRealActorFromID(actorData.creatorId);
            let itemSideKick = creator.items.find(i => i.id === actorData.creatorItemId);
            let itemData = foundry.utils.duplicate(itemSideKick.system);
            if (type === "registerSprite"){
                itemData.isRegistered = true;
                itemData.tasks.value += cardData.roll.netHits;
                itemData.tasks.max += cardData.roll.netHits;
            } else if (type === "bindSpirit"){
                itemData.isBounded = true;
                itemData.services.value += cardData.roll.netHits;
                itemData.services.max += cardData.roll.netHits;
            }
            await itemSideKick.update({'system': itemData});
        }
    }

    static async desactivateFocus(cardData){
        let item = await fromUuid(cardData.target.itemUuid),
            itemData = foundry.utils.duplicate(item.system);
        
        itemData.isActive = false;
        if (!game.user?.isGM){
            SR5_SocketHandler.emitForGM("updateItem", {
                item: cardData.target.itemUuid,
                info: itemData,
            });
        } else await item.update({'system': itemData});
    }

    static async reduceTransferedEffect(cardData){
        let targetedEffect = await fromUuid(cardData.target.itemUuid),
            newEffect = foundry.utils.duplicate(targetedEffect.system),
            key = "hits";

        if (targetedEffect.type ==="itemPreparation") key = "potency";
        newEffect[key] -= cardData.roll.netHits;

        //If item hits are reduce to 0, delete it
        if (newEffect[key] <= 0){
            newEffect[key] = 0;
            newEffect.isActive = false;
            if (newEffect.targetOfEffect) {
                for (let e of newEffect.targetOfEffect){
                    let effect = await fromUuid(e);
                    if (!game.user?.isGM) SR5_SocketHandler.emitForGM("deleteItem", {item: e,});
                    else await effect.delete();
                }
            }
            newEffect.targetOfEffect = [];
        //else, update effect linked
        } else if (key !== "potency"){
            if (newEffect.targetOfEffect) {
                for (let e of newEffect.targetOfEffect){
                    let effect = await fromUuid(e);
                    if (!effect) continue;
                    let updatedEffect = effect.system;
                    updatedEffect.value = newEffect.hits;
                    for (let cs of Object.values(updatedEffect.customEffects)){
                        cs.value = newEffect.hits;
                    }
                    if (!game.user?.isGM){
                        SR5_SocketHandler.emitForGM("updateItem", {
                            item: e,
                            info: updatedEffect,
                        });
                    } else await effect.update({'system': updatedEffect});
                }
            }
        }

        //Update item
        if (!game.user?.isGM){
            SR5_SocketHandler.emitForGM("updateItem", {
                item: cardData.target.itemUuid,
                info: newEffect,
            });
        } else await targetedEffect.update({'system': newEffect});
    }

    static async sealRitual(cardData){
        let item = await fromUuid(cardData.owner.itemUuid),
            itemData = foundry.utils.duplicate(item.system);
        
        itemData.isActive = true;
        if (!game.user?.isGM){
            SR5_SocketHandler.emitForGM("updateItem", {
                item: cardData.owner.itemUuid,
                info: itemData,
            });
        } else await item.update({'system': itemData});
    }

    static async applyEffectToItem(info, type){
        let item = await fromUuid(info.target.itemUuid);
        item = item.toObject(false);
        let actor = SR5_EntityHelpers.getRealActorFromID(info.target.actorId);
        let effect;

        if (type === "decreaseAccuracy"){
            effect = {
                "name": game.i18n.localize("SR5.WeaponBroken"),
                "target": "system.accuracy",
                "wifi": false,
                "type": "value",
                "value": -1,
                "multiplier": 1
            }
        }

        if (type === "decreaseReach"){
            effect = {
                "name": game.i18n.localize("SR5.WeaponBroken"),
                "target": "system.reach",
                "wifi": false,
                "type": "value",
                "value": -1,
                "multiplier": 1
            }
        }

        item.system.itemEffects.push(effect);
        await actor.updateEmbeddedDocuments("Item", [item]);
    }

    //Build a sidekick item
    static async buildItem(messageData, itemType, actor){
        let actorData = actor.system;
        let buildItem;

        switch (itemType){
            case"summonSpirit":
                buildItem = {
                    name: `${game.i18n.localize("SR5.SummonedSpirit")} (${game.i18n.localize(SR5.spiritTypes[messageData.magic.spiritType])}, ${messageData.magic.force})`,
                    type: "itemSpirit",
                    img: `systems/sr5/img/items/itemSpirit.svg`,
                    ["system.type"]: messageData.magic.spiritType,
                    ["system.itemRating"]: messageData.magic.force,
                    ["system.services.max"]: messageData.previousMessage.hits - messageData.roll.hits,
                    ["system.services.value"]: messageData.previousMessage.hits - messageData.roll.hits,
                    ["system.summonerMagic"]: actorData.specialAttributes.magic.augmented.value,
                    ["system.magic.tradition"]: actorData.magic.tradition,
                    ["system.conjurer"]: actor.id,
                };
                ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_SummonSpirit")} ${game.i18n.localize(SR5.spiritTypes[messageData.magic.spiritType])} (${messageData.magic.force})`); 
                break;
            case "compileSprite":
                buildItem = {
                    name: `${game.i18n.localize("SR5.CompiledSprite")} (${game.i18n.localize(SR5.spriteTypes[messageData.matrix.spriteType])}, ${messageData.matrix.level})`,
                    type: "itemSprite",
                    img: `systems/sr5/img/items/itemSprite.svg`,
                    ["system.type"]: messageData.matrix.spriteType,
                    ["system.itemRating"]: messageData.matrix.level,
                    ["system.tasks.max"]: messageData.previousMessage.hits - messageData.roll.hits,
                    ["system.tasks.value"]: messageData.previousMessage.hits - messageData.roll.hits,
                    ["system.compilerResonance"]: actorData.specialAttributes.resonance.augmented.value,
                    ["system.description"]: `${game.i18n.localize(SR5.spriteTypesDescription[messageData.matrix.spriteType])}`,
                    ["system.compiler"]: actor.id,
                };
                ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_CompileSprite")} ${game.i18n.localize(SR5.spriteTypes[messageData.matrix.spriteType])} (${messageData.matrix.level})`);
                break;
            case "createPreparation":
                let preparation = actor.items.find(i => i.uuid === messageData.owner.itemUuid);
                buildItem = {"system": preparation.system,};
                buildItem = foundry.utils.mergeObject(buildItem, {
                    name: `${game.i18n.localize("SR5.Preparation")}${game.i18n.localize("SR5.Colons")} ${preparation.name}`,
                    type: "itemPreparation",
                    img: `systems/sr5/img/items/itemPreparation.svg`,
                    ["system.trigger"]: messageData.magic.preparationTrigger,
                    ["system.potency"]: messageData.previousMessage.hits - messageData.roll.hits,
                    ["system.force"]: messageData.magic.force,
                    ["system.freeSustain"]: true,
                    ["system.hits"]: 0,
                    ["system.drainValue"]:preparation.system.drainValue,
                });
                ui.notifications.info(`${actor.name} ${game.i18n.localize("SR5.INFO_CreatePreparation")} ${preparation.name}`);
                break;
            default: 
                SR5_SystemHelpers.srLog(1, `Unknown '${itemType}' type in 'buildItem()'`);
        }

        await actor.createEmbeddedDocuments("Item", [buildItem]);
    }
}