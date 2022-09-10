import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5Actor } from "../entities/actors/entityActor.js";
import { _getSRStatusEffect } from "../system/effectsList.js";
import { SR5_Dice } from "./dice.js";
import { SR5_SocketHandler } from "../socket.js";
import { SR5_RollMessage } from "./roll-message.js";
import SR5_SpendDialog from "../interface/spendNetHits-dialog.js";


export class SR5_DiceHelper {

    // Update an item after a roll
    static async srDicesUpdateItem(cardData, actor) {
        let item = actor.getEmbeddedDocument("Item", cardData.itemId);
        let newItem = duplicate(item);
        let firedAmmo = cardData.firedAmmo;
        
        //update weapon ammo
        if (!firedAmmo) firedAmmo = 1;
        if (newItem.type === "itemWeapon" && newItem.system.category === "rangedWeapon") {
            newItem.system.ammunition.value -= firedAmmo;
            if (newItem.system.ammunition.value < 0) newItem.system.ammunition.value = 0;           
        }
        //update force and hits
        if (newItem.type === "itemSpell" || newItem.type === "itemPreparation" || newItem.type === "itemAdeptPower") {
            newItem.system.hits = cardData.test.hits;
            newItem.system.force = cardData.force;
        }
        //update level and hits
        if (newItem.type === "itemComplexForm") {
            newItem.system.hits = cardData.test.hits;
            newItem.system.level = cardData.level;
        }
        //Update net hits
        if (newItem.type === "itemRitual") {
            newItem.system.force = cardData.force;
            newItem.system.hits = cardData.hits;
            newItem.system.netHits = cardData.hits - cardData.test.hits;
            if (newItem.system.netHits < 0) newItem.system.netHits = 0;
        }
        //updateCharge
        if (newItem.type === "itemGear"){
            newItem.system.charge -= 1;
        }

        item.update(newItem);
    }

    /** Handle spirit, sprite or preparation resistance
    * @param {Object} message - The origin message
    */
    static async createItemResistance(message) {
        let dicePool, targetItem, type, title, dicePoolComposition;
        let cardData = {
            actorId: message.ownerAuthor,
            ownerAuthor: message.ownerAuthor,    
            hits: message.hits,
            speakerId: message.speakerId,
            originalActionUser: message.originalActionUser,
            speakerActor: message.speakerActor,
            speakerImg: message.speakerImg,
            originalMessage: message.originalMessage._id,
        };

        //Spirit resistance
        if (message.typeSub === "summoning"){
            cardData = mergeObject(cardData, {
                spiritType: message.spiritType,
                force: message.force,
                type: "summoningResistance",
                title: `${game.i18n.localize("SR5.SummoningResistance")} (${cardData.hits})`,
            });
            dicePool = cardData.force;
        }

        //Sprite resistance
        if (message.typeSub === "compileSprite"){
            cardData = mergeObject(cardData, {
                spriteType: message.spriteType,
                actorResonance: message.actorResonance,
                level: message.level,
                type: "compilingResistance",
                title: `${game.i18n.localize("SR5.CompilingResistance")} (${cardData.hits})`,
            });
            dicePool = cardData.level;    
        }

        //Preparation resistance
        if (message.type === "preparationFormula"){
            cardData = mergeObject(cardData, {
                itemId: message.itemId,
                force: message.force,
                preparationTrigger: message.preparationTrigger,
                type: "preparationResistance",
                title: `${game.i18n.localize("SR5.PreparationResistance")} (${cardData.hits})`,
            });
            dicePool = cardData.force;    
        }

        //Ritual resistance
        if (message.type === "ritual"){
            cardData = mergeObject(cardData, {
                itemId: message.itemId,
                itemUuid: message.itemUuid,
                originalMessage: message.originalMessage,
                force: message.force,
                reagentsSpent: message.reagentsSpent,
                type: "ritualResistance",
                title: `${game.i18n.localize("SR5.RitualResistance")} (${cardData.hits})`,
            });
            dicePool = cardData.force * 2;
        }

        //Complex form resistance
        if (message.type === "resonanceAction" && message.typeSub === "killComplexForm"){
            targetItem = await fromUuid(message.targetEffect);
            dicePool = targetItem.system.threaderResonance + targetItem.system.level;
            dicePoolComposition = ([
                {source: game.i18n.localize("SR5.ThreaderResonance"), value: targetItem.system.threaderResonance},
                {source: game.i18n.localize("SR5.Level"), value: targetItem.system.level},
            ]);
            cardData = mergeObject(cardData, {
                dicePoolComposition: dicePoolComposition,
                targetEffect: message.targetEffect,
                hits: message.test.hits,
                type: "complexFormResistance",
                title: `${game.i18n.localize("SR5.ComplexFormResistance")} (${targetItem.name})`,
            });
        }

        //Spell Resistance
        if (message.typeSub === "counterspelling"){
            targetItem = await fromUuid(message.targetEffect);
            dicePool = targetItem.system.casterMagic + targetItem.system.force;
            dicePoolComposition = ([
                {source: game.i18n.localize("SR5.CasterMagic"), value: targetItem.system.casterMagic},
                {source: game.i18n.localize("SR5.SpellForce"), value: targetItem.system.force},
            ]);
            if (targetItem.system.quickening) {
                dicePool += targetItem.system.karmaSpent;
                dicePoolComposition.push({source: game.i18n.localize("SR5.MetamagicQuickening"), value: targetItem.system.karmaSpent});
            }
            cardData = mergeObject(cardData, {
                dicePoolComposition: dicePoolComposition,
                targetEffect: message.targetEffect,
                hits: message.test.hits,
                type: "spellResistance",
                title: `${game.i18n.localize("SR5.SpellResistance")} (${targetItem.name})`,
            });
        }

        //Enchantment Resistance
        if (message.typeSub === "disenchanting"){
            targetItem = await fromUuid(message.targetEffect);
            if (targetItem.type === "itemFocus") {
                dicePool = targetItem.parent.system.specialAttributes.magic.augmented.value + targetItem.system.itemRating;
                type = "enchantmentResistance";
                title = `${game.i18n.localize("SR5.EnchantmentResistance")} (${targetItem.name})`;
                dicePoolComposition = ([
                    {source: game.i18n.localize("SR5.CasterMagic"), value: targetItem.parent.system.specialAttributes.magic.augmented.value},
                    {source: game.i18n.localize("SR5.ItemRating"), value: targetItem.system.itemRating},
                ]);
            }
            if (targetItem.type === "itemPreparation") {
                dicePool = targetItem.parent.system.specialAttributes.magic.augmented.value + targetItem.system.force;
                type = "disjointingResistance";
                title = `${game.i18n.localize("SR5.DisjointingResistance")} (${targetItem.name})`;
                dicePoolComposition = ([
                    {source: game.i18n.localize("SR5.CasterMagic"), value: targetItem.parent.system.specialAttributes.magic.augmented.value},
                    {source: game.i18n.localize("SR5.ItemRating"), value: targetItem.system.itemRating},
                ]);
            }
            cardData = mergeObject(cardData, {
                dicePoolComposition: dicePoolComposition,
                targetEffect: message.targetEffect,
                hits: message.test.hits,
                type: type,
                title: title,
            });
        }

        //Escape Engulf
        if (message.type === "escapeEngulf"){
            let spirit = SR5_EntityHelpers.getRealActorFromID(message.attackerId);
            dicePool = spirit.system.attributes.body.augmented.value + spirit.system.specialAttributes.magic.augmented.value;
            dicePoolComposition = ([
                {source: game.i18n.localize("SR5.Body"), value: spirit.system.attributes.body.augmented.value},
                {source: game.i18n.localize("SR5.Magic"), value: spirit.system.specialAttributes.magic.augmented.value},
            ]);
            cardData = mergeObject(cardData, {
                attackerId: message.attackerId,
                dicePoolComposition: dicePoolComposition,
                originalMessage: message.originalMessage,
                hits: message.test.hits,
                type: "engulfResistance",
                title: `${game.i18n.localize("SR5.SpiritResistance")} (${cardData.hits})`,
            });
        }

        //Weapon break Resistance
        if (message.type === "defenseCard"){
            let dialogData = {list: SR5.barrierTypes},
                barrierType,
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
                        resolve(barrierType);
                    },
                    }).render(true);
                });
            });
            let structure = SR5_DiceHelper.convertBarrierTypeToStructure(barrierType);
            let armor = SR5_DiceHelper.convertBarrierTypeToArmor(barrierType);
            dicePool = armor + structure;
            dicePoolComposition = ([
                {source: game.i18n.localize("SR5.Armor"), value: armor},
                {source: game.i18n.localize("SR5.Structure"), value: structure},
            ]);

            message.ownerAuthor = message.speakerId;
            cardData = mergeObject(cardData, {
                ownerAuthor: message.speakerId,
                actorId: message.speakerId,
                originalMessage: message.originalMessage,
                type: "weaponResistance",
                hits: message.damageValue,
                dicePoolComposition: dicePoolComposition,
                structure: structure,
            });
        }

        let result = SR5_Dice.srd6({ dicePool: dicePool });
        cardData.test = result;

        await SR5_Dice.srDicesAddInfoToCard(cardData, message.ownerAuthor);
        SR5_Dice.renderRollCard(cardData);
    }


    //Convert firing mode choice to  number of bullets
    static convertModeToBullet(mode){
        switch(mode){
            case "SS":
            case "SA":
                return 1;
            case "SB":
            case "BF":
                return 3;
            case "LB":
            case "FA":
                return 6;
            case "FAc":
                return 10;
            case "SF":
                return 20;
            default: return 0;
        }
    }

    //Convert firing mode choice to  number of bullets
    static convertFiringModeToDefenseDicepoolMod(mode){
        switch(mode){
            case "SS":
            case "SA":
                return 0;
            case "SB":
            case "BF":
                return -2;
            case "LB":
            case "FA":
                return -5;
            case "FAc":
                return -9;
            case "SF":
                return 0;
            default: return 0;
        }
    }

    //Convert range  to environmental line
    static convertRangeToEnvironmentalLine(mode){
        switch(mode){
            case "short":
                return 0;
            case "medium":
                return 1;
            case "long":
                return 2;
            case "extreme":
                return 3;
            default: return 0;
        }
    }

    //Convert active defense mode to dice mod value
    static convertActiveDefenseToMod(defenseMode, defenseValue){
        switch(defenseMode){
            case "dodge": 
                return defenseValue.dodge;
            case "block":
                return defenseValue.block;
            case "parryClubs":
                return defenseValue.parryClubs;
            case "parryBlades":
                return defenseValue.parryBlades;
            default: 
                return 0;
        }
    }

    //Convert active defense mode to initiative modifier value
    static convertActiveDefenseToInitModifier(defenseMode){
        switch(defenseMode){
            case "dodge": 
            case "block":
            case "parryClubs":
            case "parryBlades":
                return -5;
            default: 
                return 0;
        }
    }

    //Convert bullet number in defense dice mod.
    static mapRoundsToDefenseMod(rounds) {
        if (rounds === 1) return 0;
        if (rounds === 3) return -2;
        if (rounds === 6) return -5;
        if (rounds === 10) return -9;
        return 0;
    }

    //Convert mark mod dice in number of mark;
    static calculMark(mark) {
        if (mark === 0) return 1;
        if (mark === 4) return 2;
        if (mark === 10) return 3;
        return 0;
    }

    //convert matrix distance to dice mod
    static convertMatrixDistanceToDiceMod (distance){
        switch (distance){
            case "wired":
            case "upTo100m":
                return 0;
            case "upTo1km":
                return -1;
            case "upTo10km":
                return -3;
            case "upTo100km":
                return -5;
            case "farAway":
                return -8;
        }
    }

    //convert matrix search to dice mod
    static convertMatrixSearchToTreshold (type){
        switch (type){
            case "general":
                return 1;
            case "limited":
                return 3;
            case "hidden":
                return 6;
            default: return 0;
        }
    }

    //convert matrix search info to interval multiplier for an extended test
    static convertMatrixSearchTypeToTime (type){
        switch (type){
            case "general":
                return 1;
            case "limited":
                return 30;
            case "hidden":
                return 12;
            default: return 1;
        }
    }

    //convert matrix search info to interval multiplier for an extended test
    static convertMatrixSearchTypeToUnitTime (type){
        switch (type){
            case "general":
            case "limited":
                return "minute";
            case "hidden":
                return "hour";
            default: return "minute";
        }
    }

    //Get time spent on a matrix search
    static async getMatrixSearchDuration(cardData, netHits){
        let timeSpent, duration = "";
        cardData.matrixSearchUnit = SR5_DiceHelper.convertMatrixSearchTypeToUnitTime(cardData.thresholdType);
		cardData.matrixSearchTime = SR5_DiceHelper.convertMatrixSearchTypeToTime(cardData.thresholdType);

        if (cardData.matrixSearchUnit === "minute") timeSpent = (cardData.matrixSearchTime * 60)/netHits;
        if (cardData.matrixSearchUnit === "hour") timeSpent = (cardData.matrixSearchTime * 60 * 60)/netHits;
        
        let time = new Date(null);
        time.setSeconds(timeSpent);
        let seconds = time.getSeconds();
        let minutes = time.getMinutes();
        let hours = time.getHours()-1;
        
        if (hours) duration = `${hours}${game.i18n.localize("SR5.HoursUnit")} `;
        if (minutes) duration += `${minutes}${game.i18n.localize("SR5.MinuteUnit")} `;
        if (seconds) duration += `${seconds}${game.i18n.localize("SR5.SecondUnit")} `;
        
        return duration;
    }

    //Get augmented attribute value from attribute name
    static getAttributeValue(key, actor){
        if (key === "none") return 0;
        else return actor.system.attributes[key].augmented.value;
    }

    //Handle environmental modifiers
    static handleEnvironmentalModifiers(scene, actor, noWind){
        let actorData = actor.itemsProperties.environmentalMod;
        let visibilityMod = Math.max(parseInt(scene.getFlag("sr5", "environModVisibility")) + actorData.visibility.value, 0);
        let lightMod = Math.max(parseInt(scene.getFlag("sr5", "environModLight")) + actorData.light.value, 0);
        if (actor.visions.lowLight.isActive && scene.getFlag("sr5", "environModLight") > 2) visibilityMod = 3;
        let glareMod = Math.max(parseInt(scene.getFlag("sr5", "environModGlare")) + actorData.glare.value, 0);
        let windMod = Math.max(parseInt(scene.getFlag("sr5", "environModWind")) + actorData.wind.value, 0);

        let arrayMod = [visibilityMod, lightMod, glareMod, windMod];
        if (noWind){
            arrayMod = [visibilityMod, lightMod, glareMod];
        }
        let finalMod = Math.max(...arrayMod);

        if (finalMod > 0 && finalMod < 4) {
            let nbrOfMaxValue = 0;
            for (let i = 0; i < arrayMod.length; i++) {
                if (arrayMod[i] === finalMod) nbrOfMaxValue++;
            }
            if (nbrOfMaxValue > 1) finalMod++;
        }

        let dicePoolMod = SR5_DiceHelper.convertEnvironmentalModToDicePoolMod(finalMod);
        return dicePoolMod;
    }

    //Convert environmental modifier to dice pool modifier
    static convertEnvironmentalModToDicePoolMod(modifier){
        switch (modifier){
            case 0:
                return 0;
            case 1:
                return -1;
            case 2:
                return -3;
            case 3:
                return -6;
            case 4:
                return -10;
            default:
                return 0;
        }
    }

    //Get signature modifier
    static convertSignatureToDicePoolMod(signature){
        switch (signature){
            case "vehicleLarge":
                return 3;
            case "vehicleElectric":
                return -3;
            case "metahuman":
                return -3;
            case "drone":
                return -3;
            case "droneMicro":
                return -6;
            default:
                return 0;
        }
    }

    //Apply Full defense effect to an actor
    static async applyFullDefenseEffect(actor){
        let effect = await _getSRStatusEffect("fullDefenseMode");
        actor.createEmbeddedDocuments("ActiveEffect", [effect]);
    }

    /** Put a mark on a specific Item
   * @param {Object} targetActor - The Actor who owns the item
   * @param {Object} attackerID - Actor ID who wants to put a mark
   * @param {Object} mark - Number of Marks to put
   * @param {Object} targetItem - Target item
   */
    static async markItem(targetActorID, attackerID, mark, targetItem) {
        let attacker = await SR5_EntityHelpers.getRealActorFromID(attackerID),
            targetActor = await SR5_EntityHelpers.getRealActorFromID(targetActorID),
            realAttackerID = attackerID,
            existingMark = false,
            item;

        if (targetItem) item = await fromUuid(targetItem);
        else item = targetActor.items.find(i => i.type === "itemDevice" && i.system.isActive);
        if (item.parent.type === "actorDevice" && item.parent.isToken) item = targetActor.items.find(i => i.type === "itemDevice" && i.system.isActive);

        let itemToMark = duplicate(item.system);

        //If attacker is an ice use serveur id to mark
        if(attacker.system.matrix.deviceType === "ice" && attacker.isToken){
            realAttackerID = attacker.id;
        }
        // If item is already marked, increase marks
        for (let m of itemToMark.marks){
            if (m.ownerId === realAttackerID) {
                m.value += mark;
                if (m.value > 3) m.value = 3;
                existingMark = true;
            }
        }
        // Add new mark to item
        if (!existingMark){
            let newMark = {
                "ownerId": realAttackerID,
                "value": mark,
                "ownerName": attacker.name,
            }
            itemToMark.marks.push(newMark)
        }
        await item.update({"system": itemToMark});

        //Update attacker deck with data
        if (!game.user?.isGM) {
                await SR5_SocketHandler.emitForGM("updateDeckMarkedItems", {
                ownerID: realAttackerID,
                markedItem: item.uuid,
                mark: mark,
            });
            if (itemToMark.isSlavedToPan){
                await SR5_SocketHandler.emitForGM("markPanMaster", {
                    itemToMark: itemToMark,
                    attackerID: realAttackerID,
                    mark: mark,
                });
            }
            if (targetActor.system.matrix.deviceType === "host"){
                await SR5_SocketHandler.emitForGM("markSlavedDevice", {
                    targetActorID: targetActorID,
                });
            }
        } else {  
            await SR5_DiceHelper.updateDeckMarkedItems(realAttackerID, item.uuid, mark);
            if (itemToMark.isSlavedToPan) await SR5_DiceHelper.markPanMaster(itemToMark, realAttackerID, mark);
            if (targetActor.system.matrix.deviceType === "host") await SR5_DiceHelper.markSlavedDevice(targetActorID);
        }
        
    }

    //Add mark to pan Master of the item
    static async markPanMaster(itemToMark, attackerID, mark){
        let panMaster = SR5_EntityHelpers.getRealActorFromID(itemToMark.panMaster);
        let masterDevice = panMaster.items.find(d => d.type === "itemDevice" && d.system.isActive);
        await SR5_DiceHelper.markItem(itemToMark.panMaster, attackerID, mark, masterDevice.uuid);
    }

    //Socket for adding marks to pan Master of the item
    static async _socketMarkPanMaster(message) {
        await SR5_DiceHelper.markPanMaster(message.data.itemToMark, message.data.attackerID, message.data.mark);
	}

    //Mark slaved device: for host, update all unlinked token with same marks
    static async markSlavedDevice(targetActorID){
        let targetActor = await SR5_EntityHelpers.getRealActorFromID(targetActorID),
            item = targetActor.items.find(i => i.type === "itemDevice" && i.system.isActive);

        for (let token of canvas.tokens.placeables){
            if (token.actor.id === targetActorID) {
                let tokenDeck = token.actor.items.find(i => i.type === "itemDevice" && i.system.isActive);
                let tokenDeckData = duplicate(tokenDeck.system);
                tokenDeckData.marks = item.system.marks;
                await tokenDeck.update({"system": tokenDeckData});
            }
        }
    }

    //Socket for marking slaved device
    static async _socketMarkSlavedDevice(message) {
        await SR5_DiceHelper.markSlavedDevice(message.data.targetActorID);
	}

    //Add mark info to attacker deck
    static async updateDeckMarkedItems(ownerID, markedItem, mark){
        let owner = SR5_EntityHelpers.getRealActorFromID(ownerID),
            ownerDeck = owner.items.find(i => i.type === "itemDevice" && i.system.isActive),
            deckData = duplicate(ownerDeck.system),
            itemMarked = await fromUuid(markedItem),
            alreadyMarked = false;

        //If item is already marked, update value
        for (let m of deckData.markedItems){
            if (m.uuid === itemMarked.uuid) {
                m.value += mark;
                if (m.value > 3) m.value = 3;
                alreadyMarked = true;
            }
        }
        if (!alreadyMarked){
            let newMark = {
                "uuid": itemMarked.uuid,
                "value": mark,
                "itemName": itemMarked.name,
                'itemOwner': itemMarked.actor.name,
            }
            deckData.markedItems.push(newMark);
        }
        await ownerDeck.update({"system": deckData});

        //For host, update all unlinked token with same marked items
        if (owner.system.matrix.deviceType === "host"){
            for (let token of canvas.tokens.placeables){
                if (token.actor.id === ownerID) {
                    let tokenDeck = token.actor.items.find(i => i.type === "itemDevice" && i.system.isActive);
                    let tokenDeckData = duplicate(tokenDeck.system);
                    tokenDeckData.markedItems = deckData.markedItems;
                    await tokenDeck.update({"system": tokenDeckData});
                }
            }
        }
    }

    //Socket for updating marks items on other actors;
    static async _socketUpdateDeckMarkedItems(message) {
        await SR5_DiceHelper.updateDeckMarkedItems(message.data.ownerID, message.data.markedItem, message.data.mark);
	}

    //Socket for adding marks to main Device;
    static async _socketMarkItem(message) {
        await SR5_DiceHelper.markItem(message.data.targetActor, message.data.attackerID, message.data.mark);
	}

    /** Find if an Actor has a Mark item with the same ID as the attacker
   * @param {Object} targetActor - The Target Actor who owns the Mark
   * @param {Object} attackerID - The ID of the attacker who wants to mark
   * @return {Object} the mark item
   */
    static async findMarkValue(item, ownerID){
        if (item.marks.length) {
            for (let m of item.marks){
                if (m.ownerId === ownerID) return m.value;
            }
            return 0;
        } else return 0;
    }

    /** Apply Matrix Damage to a Deck
   * @param {Object} targetActor - The Target Actor who owns the deck/item
   * @param {Object} messageData - Message data
   * @param {Object} attacker - Actor who do the damage
   */
    static async applyDamageToDecK(targetActor, messageData, defender, defenderWin) {
        let damageValue = messageData.matrixDamageValue;
        let targetItem;
        if (messageData.matrixTargetItemUuid && !defenderWin) targetItem = await fromUuid(messageData.matrixTargetItemUuid);
        if (!targetItem) targetItem = targetActor.items.find((item) => item.type === "itemDevice" && item.system.isActive);
        let newItem = duplicate(targetItem);

        //targetActor.takeDamage(messageData);
        if (targetItem.system.type === "livingPersona" || targetItem.system.type === "headcase" ){
            return targetActor.takeDamage(messageData);
        }
        
        if (targetActor.system.matrix.programs.virtualMachine.isActive) damageValue += 1;

        newItem.system.conditionMonitors.matrix.actual.base += damageValue;
        SR5_EntityHelpers.updateValue(newItem.system.conditionMonitors.matrix.actual, 0, newItem.system.conditionMonitors.matrix.value);
        if (newItem.system.conditionMonitors.matrix.actual.value >= newItem.system.conditionMonitors.matrix.value){
            if (targetItem.type === "itemDevice" && targetActor.system.matrix.userMode !== "ar"){
                let dumpshockData = {damageResistanceType: "dumpshock"};
                targetActor.rollTest("resistanceCard", null, dumpshockData);
                ui.notifications.info(`${targetActor.name} ${game.i18n.localize("SR5.INFO_IsDisconnected")}.`);
            }
            newItem.system.isActive = false;
            newItem.system.wirelessTurnedOn = false;
          }
        targetItem.update({system: newItem.system});

        if (defender) ui.notifications.info(`${defender.name} ${game.i18n.format("SR5.INFO_ActorDoMatrixDamage", {damageValue: damageValue})} ${targetActor.name}.`); 
        else ui.notifications.info(`${targetActor.name} (${targetItem.name}): ${damageValue} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
    }

    // Update Matrix Damage to a Deck
    static async updateMatrixDamage(cardData, netHits, defender){
        let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.originalActionActor),
            attackerData = attacker?.system,
            damage = cardData.matrixDamageValueBase,
            item = await fromUuid(cardData.matrixTargetItemUuid),
            mark = await SR5_DiceHelper.findMarkValue(item.system, cardData.originalActionActor);

        if (attacker.type === "actorDevice"){
            if (attacker.system.matrix.deviceType = "ice"){
                mark = await SR5_DiceHelper.findMarkValue(item.system, attacker.id);
            }
        }
        cardData.matrixDamageMod = {};
        cardData.matrixDamageMod.netHits = netHits;
        cardData.matrixDamageMod.markQty = mark;
        
        //Mugger program
        if (mark > 0 && attackerData.matrix.programs.mugger.isActive) {
            mark = mark * 2;
            cardData.matrixDamageMod.muggerIsActive = true;
        }
        //Guard program
        if (defender.system.matrix.programs.guard.isActive) {
            damage = cardData.matrixDamageValueBase + netHits + mark;
            cardData.matrixDamageMod.guardIsActive = true;
            cardData.matrixDamageMod.markDamage = mark;
        } else {
            damage = cardData.matrixDamageValueBase + netHits + (mark * 2);
            cardData.matrixDamageMod.markDamage = mark*2;
        }

        //Hammer program
        if (attackerData.matrix.programs.hammer.isActive) {
            damage += 2;
            cardData.matrixDamageMod.hammerDamage = 2;
        }

        cardData.matrixDamageValue = damage;
        return cardData;
    }

    //Handle grenade scatter
    static async rollScatter(message){
        let actor = SR5_EntityHelpers.getRealActorFromID(message.actorId);
        let item = actor.items.find(i => i.id === message.itemId);
        let itemData = item.system;

        if (!canvas.scene){
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActiveScene")}`);
            return;
        }
        let distanceMod = message.test.hits;
        let gridUnit = canvas.scene.grid.size;
    
        let template = canvas.scene.templates.find((t) => t.flags.item === message.itemId);
        if (template === undefined){
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoTemplateInScene")}`);
            return;
        }
    
        let distanceDice = 1;
        if (itemData.aerodynamic) distanceDice = 2;
        if (itemData.ammunition.type){
            switch(itemData.ammunition.type){
                case "fragmentationRocket":
                case "highlyExplosiveRocket":
                case "antivehicleRocket":
                    distanceDice = 5;
                break;
                case "fragmentationMissile":
                case "highlyExplosiveMissile":
                case "antivehicleMissile":
                    distanceDice = 4;
                break;
            }
        }
        let directionRoll = new Roll(`1d8`);
        await directionRoll.evaluate({async: true});
    
        let distanceFormula = `${distanceDice}d6 - ${distanceMod}`;
        let distanceRoll= new Roll(distanceFormula);
        await distanceRoll.evaluate({async: true});
        if (distanceRoll.total < 1) {
            ui.notifications.info(`${game.i18n.localize("SR5.INFO_NoScattering")}`);
            return;
        } else {
            ui.notifications.info(`${game.i18n.format("SR5.INFO_ScatterDistance", {distance: distanceRoll.total})}`);
        }
        
        let coordinate = {x:0, y:0};
        switch(directionRoll.total){
            case 1:
                coordinate = {
                    x: 0, 
                    y: distanceRoll.total*gridUnit,
                };
                break;
            case 2:
                coordinate = {
                    x: -(distanceRoll.total*gridUnit)/2, 
                    y: (distanceRoll.total*gridUnit)/2, 
                };
                break;
            case 3:
                coordinate = {
                    x: -distanceRoll.total*gridUnit, 
                    y: 0,
                };
                break;
            case 4:
                coordinate = {
                    x: -(distanceRoll.total*gridUnit)/2, 
                    y: -(distanceRoll.total*gridUnit)/2, 
                };
                break;
            case 5:
                coordinate = {
                    x: 0, 
                    y: -distanceRoll.total*gridUnit,
                };
                break;
            case 6:
                coordinate = {
                    x: (distanceRoll.total*gridUnit)/2, 
                    y: -(distanceRoll.total*gridUnit)/2, 
                };
                break;
            case 7:
                coordinate = {
                    x: distanceRoll.total*gridUnit, 
                    y: 0,
                };
                break;
            case 8:
                coordinate = {
                    x: (distanceRoll.total*gridUnit)/2, 
                    y: (distanceRoll.total*gridUnit)/2, 
                };
                break;
        }
    
        let newPosition = duplicate(template);
        newPosition.x += coordinate.x;
        newPosition.y += coordinate.y;
    
        template.update(newPosition);
    }

    /** Handle ICE specific attack effect
    * @param {Object} messageData - The chat message data
    * @param {Object} ice - The ICE actor
    * @param {Object} target - Actor who is the target of the ICE attack
    */
    static async applyIceEffect(messageData, ice, target){
        let effect = {
            type: "itemEffect",
            "system.type": "iceAttack",
            "system.ownerID": ice.id,
            "system.ownerName": ice.name,
            "system.durationType": "reboot",
        };

        switch(messageData.iceType){
            case "iceAcid":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceFirewall"),
                    "system.target": game.i18n.localize("SR5.Firewall"),
                    "system.value": -1,
                    "system.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "system.matrix.attributes.firewall",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceBinder":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceDataProcessing"),
                    "system.target": game.i18n.localize("SR5.DataProcessing"),
                    "system.value": -1,
                    "system.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "system.matrix.attributes.dataProcessing",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceCrash":
                let programs = [];
                for (let i of target.items){
                    if (i.type === "itemProgram" && (i.system.type === "hacking" || i.system.type === "common") && i.system.isActive){
                        programs.push(i);
                    }
                }
                let randomProgram = programs[Math.floor(Math.random()*programs.length)]
                randomProgram.update({"system.isActive": false});
                ui.notifications.info(`${randomProgram.name} ${game.i18n.localize("SR5.INFO_CrashProgram")}`);
                break;
            case "iceJammer":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceAttack"),
                    "system.target": game.i18n.localize("SR5.MatrixAttack"),
                    "system.value": -1,
                    "system.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "system.matrix.attributes.attack",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceMarker":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceSleaze"),
                    "system.target": game.i18n.localize("SR5.Sleaze"),
                    "system.value": -1,
                    "system.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "system.matrix.attributes.sleaze",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceScramble":
                if (target.system.matrix.userMode !== "ar"){
                    messageData.damageResistanceType = "dumpshock";
                    target.rollTest("resistanceCard", null, messageData);
                }
                let deck = target.items.find((item) => item.type === "itemDevice" && item.system.isActive);
                target.rebootDeck(deck);
                break;
            case "iceBlaster":
            case "iceBlack":
            case "iceTarBaby":
                await SR5_DiceHelper.linkLock(ice, target);
                break;
            case "iceSparky":
            case "iceKiller":
            case "iceTrack":
            case "icePatrol":
            case "iceProbe":
                break;
            default:
                SR5_SystemHelpers.srLog(1, `Unknown '${messageData.iceType}' type in applyIceEffect`);
        }
    }

    //create link lock effet
    static async linkLock(attacker, target){
        let effect = {
            type: "itemEffect",
            "system.type": "linkLock",
            "system.ownerID": attacker.id,
            "system.ownerName": attacker.name,
            "system.durationType": "permanent",
            name: game.i18n.localize("SR5.EffectLinkLockedConnection"),
            "system.target": game.i18n.localize("SR5.EffectLinkLockedConnection"),
            "system.value": attacker.system.matrix.actions.jackOut.defense.dicePool,
            "system.customEffects": {
                "0": {
                    "category": "special",
                    "target": "system.matrix.isLinkLocked",
                    "type": "boolean",
                    "value": "true",
                }
            },
        };
        target.createEmbeddedDocuments("Item", [effect]);
        let statusEffect = await _getSRStatusEffect("linkLock");
        await target.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
        ui.notifications.info(`${target.name}: ${game.i18n.localize('SR5.INFO_IsLinkLocked')} ${attacker.name}`);
    }

    //create sensor lock effect
    static async lockTarget(messageData, drone, target){
        let value = messageData.test.hits - messageData.hits;
        let effect = {
            name: game.i18n.localize("SR5.EffectSensorLock"),
            type: "itemEffect",
            "system.type": "sensorLock",
            "system.ownerID": drone.id,
            "system.ownerName": drone.name,
            "system.durationType": "permanent",
            "system.target": game.i18n.localize("SR5.Defense"),
            "system.value": value,
        };
        target.createEmbeddedDocuments("Item", [effect]);
        let statusEffect = await _getSRStatusEffect("sensorLock");
        await target.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
    }

    static async chooseMatrixDefender(messageData, actor){
        let cancel = true;
        let list = {};
        for (let key of Object.keys(actor.system.matrix.connectedObject)){
            if (Object.keys(actor.system.matrix.connectedObject[key]).length) {
                list[key] = SR5_EntityHelpers.sortObjectValue(actor.system.matrix.connectedObject[key]);
            }
        }
        let dialogData = {
            device: actor.system.matrix.deviceName,
            list: list,
        };
        renderTemplate("systems/sr5/templates/interface/itemMatrixTarget.html", dialogData).then((dlg) => {
            new Dialog({
              title: game.i18n.localize('SR5.ChooseMatrixTarget'),
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
                let targetItem = html.find("[name=target]").val();
                messageData.matrixTargetDevice = targetItem;
                actor.rollTest("matrixDefense", messageData.typeSub, messageData);
              },
            }).render(true);
        });
    }

    static async chooseToxinVector(vectors){
        let cancel = true;
        let dialogData = {list: vectors}
        return new Promise((resolve, reject) => {
            renderTemplate("systems/sr5/templates/interface/chooseVector.html", dialogData).then((dlg) => {
                new Dialog({
                title: game.i18n.localize('SR5.ChooseToxinVector'),
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
                    let vector = html.find("[name=vector]").val();
                    resolve(vector);
                },
                }).render(true);
            });
        });
    }

    static async chooseDamageType(){
        let cancel = true;
        let dialogData = {list: SR5.PCConditionMonitors}
        return new Promise((resolve, reject) => {
            renderTemplate("systems/sr5/templates/interface/chooseDamageType.html", dialogData).then((dlg) => {
                new Dialog({
                title: game.i18n.localize('SR5.ChooseDamageType'),
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
                    let damageType = html.find("[name=damageType]").val();
                    resolve(damageType);
                },
                }).render(true);
            });
        });
    }

    static async rollJackOut(message){
        let actor = SR5_EntityHelpers.getRealActorFromID(message.originalActionActor);
        actor = actor.toObject(false);
        let dicePool;

        let itemEffectID;
        for (let i of actor.items){
            if (i.type === "itemEffect"){
                if (Object.keys(i.system.customEffects).length){
                    for (let e of Object.values(i.system.customEffects)){
                        if (e.target === "system.matrix.isLinkLocked"){
                            dicePool = i.system.value;
                            itemEffectID = i.id;
                        }
                    }
                }
            }
        }

        let cardData = {
            type: "jackOutDefense",
            title: `${game.i18n.localize("SR5.MatrixActionJackOutResistance")} (${message.test.hits})`,
            dicePool: dicePool, 
            actorId: message.originalActionActor,
            originalActionActor: message.originalActionActor,
            itemEffectID: itemEffectID,   
            hits: message.test.hits,
            speakerId: message.speakerId,
            speakerActor: message.speakerActor,
            speakerImg: message.speakerImg,
        };

        let result = SR5_Dice.srd6({ dicePool: dicePool });
        cardData.test = result;

        await SR5_Dice.srDicesAddInfoToCard(cardData, message.originalActionActor);
        SR5_Dice.renderRollCard(cardData);
    }

    static async jackOut(message){
        let actor = SR5_EntityHelpers.getRealActorFromID(message.originalActionActor);
        await actor.deleteEmbeddedDocuments("Item", [message.itemEffectID]);
        let statusEffect = actor.effects.find(e => e.origin === "linkLock");
        if (statusEffect) await actor.deleteEmbeddedDocuments('ActiveEffect', [statusEffect.id]);
    }

    static async eraseMarkChoice(messageData){
        let actor = SR5_EntityHelpers.getRealActorFromID(messageData.originalActionActor),
            cancel = true,
            target;

        if (game.user.targets.size) {
            const targeted = game.user.targets;
            const targets = Array.from(targeted);
            for (let t of targets) {
                target = t.document;
            }
            if (target) actor = target.getActor();
        }

        let markedItems = actor.items.filter(i => i.system.marks?.length > 0);
        let dialogData = {
            list: markedItems,
        };

        if (!markedItems.length) {
            return ui.notifications.info(`${actor.name}: ${game.i18n.localize('SR5.INFO_NoMarksToDelete')}`);
        }
      
        renderTemplate("systems/sr5/templates/interface/chooseMark.html", dialogData).then((dlg) => {
            new Dialog({
              title: game.i18n.localize('SR5.ChooseMarkToErase'),
              content: dlg,
              data: dialogData,
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
                let targetItem = html.find("[name=item]").val(),
                    item = markedItems.find(i => i.id === targetItem),
                    markOwner = SR5_EntityHelpers.getRealActorFromID(item.system.marks[0].ownerId),
                    dicePool = markOwner.system.matrix.actions.eraseMark.defense.dicePool;
                messageData = mergeObject(messageData, {
                    markOwner: markOwner.id,
                    dicePool: dicePool,
                    markeditem: item.uuid,
                });
                actor.rollTest("eraseMark", "", messageData);
              },
            }).render(true);
        });
    }

    static async eraseMark(messageData, data){
        let markOwner = SR5_EntityHelpers.getRealActorFromID(messageData.markOwner),
            item = await fromUuid(messageData.markeditem),
            itemData = duplicate(item.system);

        for (let i = 0; i < itemData.marks.length; i++){
            if (itemData.marks[i].ownerId === messageData.markOwner) {
                itemData.marks.splice(i, 1);
                i--;
            }
        }
        await item.update({"system": itemData});
        await SR5Actor.deleteMarkInfo(messageData.markOwner, messageData.markeditem)
    }

    static async rollOverwatchDefense(message){
        let actor = SR5_EntityHelpers.getRealActorFromID(message.originalActionActor);
        actor = actor.toObject(false);
        let dicePool = 6;

        let cardData = {
            type: "overwatchResistance",
            title: `${game.i18n.localize("SR5.OverwatchResistance")} (${message.test.hits})`,
            dicePool: dicePool, 
            actorId: message.originalActionActor,
            originalActionActor: message.originalActionActor, 
            hits: message.test.hits,
            speakerId: message.speakerId,
            speakerActor: message.speakerActor,
            speakerImg: message.speakerImg,
        };

        let result = SR5_Dice.srd6({ dicePool: dicePool });
        cardData.test = result;

        await SR5_Dice.srDicesAddInfoToCard(cardData, message.originalActionActor);
        SR5_Dice.renderRollCard(cardData);
    }

    static async jamSignals(message){
        let actor = SR5_EntityHelpers.getRealActorFromID(message.originalActionActor);
        let effect = {
            name: game.i18n.localize("SR5.EffectSignalJam"),
            type: "itemEffect",
            "system.type": "signalJam",
            "system.ownerID": actor.id,
            "system.ownerName": actor.name,
            "system.duration": 0,
            "system.durationType": "permanent",
            "system.target": game.i18n.localize("SR5.MatrixNoise"),
            "system.value": -message.test.hits,
            "system.customEffects": {
                "0": {
                    "category": "matrixAttributes",
                    "target": "system.matrix.noise",
                    "type": "value",
                    "value": -message.test.hits,
                    "forceAdd": true,
                }
            },
        };
        await actor.createEmbeddedDocuments("Item", [effect]);
        let statusEffect = await _getSRStatusEffect("signalJam", -message.test.hits);
        await actor.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
    }

    static _getThresholdEffect(location){
        switch(location){
			case "genitals":
                return 4;
			case "neck":
			case "eye":
			case "foot":
			case "sternum": 
                return 3;
			case "gut":                    
			case "knee":
            case "jaw":
			case "hand":
			case "ear":
                return 2;
			case "shoulder":
                return 1;
            default: return 0;
		}
    }
    
    static _getInitiativeEffect(location){
        switch(location){
			case "gut": 
			case "shoulder":   
            case "jaw":
		    case "hand":
			case "foot":
                return 5;
			case "neck":                
			case "knee":
			case "eye":
			case "genitals":
			case "sternum":
			case "ear":
                return 10;
            default: return 0;
		}
    }

    static async chooseSpendNetHits(message, actor){
        let messageData = message.flags.sr5data;
        let cancel = true;
        let effects = [];
        let numberCheckedEffects = 0, 
            checkedEffects = {};
        let dialogData = {
            calledShot: messageData.calledShot,
            disposableHits: messageData.netHits - 1,
        };

        renderTemplate("systems/sr5/templates/interface/chooseSpendNetHits.html", dialogData).then((dlg) => {
            new SR5_SpendDialog({
                title: game.i18n.localize('SR5.SpendHitsForStatus'),
                content: dlg,
                data: dialogData,
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
                    numberCheckedEffects = html.find("[name='checkDisposableHitsEffects']:checked").length;
                    for (let i = 0; i < numberCheckedEffects; ++i) {
                        let name = html.find("[name='checkDisposableHitsEffects']:checked")[i].value;
                        checkedEffects = {
                            name: name,
                            type: messageData.calledShot.location,
                            threshold: (name === "stunned") ? this._getThresholdEffect(messageData.calledShot.location) : 0,
                            initiative: (name === "stunned") ? this._getInitiativeEffect(messageData.calledShot.location) : 0,
                            initialDV: messageData.damageValue,
                        };
                        effects.push(checkedEffects);
                    }
                    ui.notifications.info(`${actor.name}: ${game.i18n.format('SR5.INFO_SpendHitsOnEffects', {checkedEffects: numberCheckedEffects})}`);      
                    messageData = mergeObject(messageData, {
                        calledShotHitsSpent: true,
                        calledShot: {
                            "effects": effects,
                        },
                    });

                    //Update chatMessage
                    let newMessage = duplicate(messageData);
                    newMessage.hits = messageData.hits - numberCheckedEffects;
                    SR5_Dice.srDicesAddInfoToCard(newMessage, actor.id);
                    if (!game.user?.isGM) SR5_SocketHandler.emitForGM("updateRollCard", {message: messageData.originalMessage, newMessage: newMessage,});
                    else SR5_RollMessage.updateRollCard(messageData.originalMessage, newMessage);
                },
            }).render(true);
        });
    }

    static async reduceSideckickService(message){
        let actor = SR5_EntityHelpers.getRealActorFromID(message.speakerId),
            actorData = duplicate(actor.system),
            key;

        if (actor.type === "actorSprite"){
            key = "tasks";
            ui.notifications.info(`${actor.name}: ${game.i18n.format('SR5.INFO_TasksReduced', {task: message.netHits})}`);
        } else if (actor.type === "actorSpirit"){
            key = "services";
            ui.notifications.info(`${actor.name}: ${game.i18n.format('SR5.INFO_ServicesReduced', {service: message.netHits})}`);
        }
        actorData[key].value -= message.netHits;
        if (actorData[key].value < 0) actorData[key].value = 0;
        await actor.update({'system': actorData});
    }

    static async enslavedSidekick(message, type){
        let actor = SR5_EntityHelpers.getRealActorFromID(message.speakerId);
        let actorData = duplicate(actor.system);

        if (type === "registerSprite"){
            actorData.isRegistered = true;
            actorData.tasks.value += message.netHits;
            actorData.tasks.max += message.netHits;
            ui.notifications.info(`${actor.name}: ${game.i18n.format('SR5.INFO_SpriteRegistered', {task: message.netHits})}`);
        } else if (type === "bindSpirit"){
            actorData.isBounded = true;
            actorData.services.value += message.netHits;
            actorData.services.max += message.netHits;
            ui.notifications.info(`${actor.name}: ${game.i18n.format('SR5.INFO_SpiritBounded', {service: message.netHits})}`);
        }
        await actor.update({'system': actorData});
        
        if (actorData.creatorItemId){
            let creator = SR5_EntityHelpers.getRealActorFromID(actorData.creatorId);
            let itemSideKick = creator.items.find(i => i.id === actorData.creatorItemId);
            let itemData = duplicate(itemSideKick.system);
            if (type === "registerSprite"){
                itemData.isRegistered = true;
                itemData.tasks.value += message.netHits;
                itemData.tasks.max += message.netHits;
            } else if (type === "bindSpirit"){
                itemData.isBounded = true;
                itemData.services.value += message.netHits;
                itemData.services.max += message.netHits;
            }
            await itemSideKick.update({'system': itemData});
        }
    }

    static async desactivateFocus(message){
        let item = await fromUuid(message.targetEffect),
            itemData = duplicate(item.system);
        
        itemData.isActive = false;
        if (!game.user?.isGM){
            SR5_SocketHandler.emitForGM("updateItem", {
                item: item,
                data: itemData,
            });
        } else await item.update({'data': itemData});
    }

    static async applyDerezzEffect(message, sourceActor, target){
        let itemEffect = {
            name: game.i18n.localize("SR5.EffectReduceFirewall"),
            type: "itemEffect",
            "system.target": game.i18n.localize("SR5.Firewall"),
            "system.value": -message.matrixDamageValue,
            "system.type": "derezz",
            "system.ownerID": sourceActor.id,
            "system.ownerName": sourceActor.name,
            "system.duration": 0,
            "system.durationType": "reboot",
            "system.customEffects": {
              "0": {
                  "category": "matrixAttributes",
                  "target": "system.matrix.attributes.firewall",
                  "type": "value",
                  "value": -message.matrixDamageValue,
                  "forceAdd": true,
                }
            },
        };
        if (!target.items.find(i => i.system.type === "derezz")) await target.createEmbeddedDocuments("Item", [itemEffect]);
    }

    static async reduceTransferedEffect(message){
        let targetedEffect = await fromUuid(message.targetEffect),
            newEffect = duplicate(targetedEffect.system),
            key = "hits";

        if (targetedEffect.type ==="itemPreparation") key = "potency";
        newEffect[key] += message.netHits;

        //If item hits are reduce to 0, delete it
        if (newEffect[key] <= 0){
            newEffect[key] = 0;
            newEffect.isActive = false;
            if (newEffect.targetOfEffect) {
                for (let e of newEffect.targetOfEffect){
                    let effect = await fromUuid(e);
                    if (!game.user?.isGM){
                        SR5_SocketHandler.emitForGM("deleteItem", {
                            item: e,
                        });
                    } else await effect.delete();
                }
            }
            newEffect.targetOfEffect = [];
        //else, update effect linked
        } else if (key !== "potency"){
            if (newEffect.targetOfEffect) {
                for (let e of newEffect.targetOfEffect){
                    let effect = await fromUuid(e);
                    let updatedEffect = effect.system;
                    updatedEffect.value = newEffect.hits;
                    for (let cs of Object.values(updatedEffect.customEffects)){
                        cs.value = newEffect.hits;
                    }
                    if (!game.user?.isGM){
                        SR5_SocketHandler.emitForGM("updateItem", {
                            item: e,
                            data: updatedEffect,
                        });
                    } else await effect.update({'data': updatedEffect});
                }
            }
        }

        //Update item
        if (!game.user?.isGM){
            SR5_SocketHandler.emitForGM("updateItem", {
                item: targetedEffect.uuid,
                data: newEffect,
            });
        } else await targetedEffect.update({'data': newEffect});
    }

    //Socket for updating an item
    static async _socketUpdateItem(message) {
        let target = await fromUuid(message.data.item);
        await target.update({'data': message.system});
	}

    //Socket for deleting an item
    static async _socketDeleteItem(message){
        let item = await fromUuid(message.data.item);
        await item.delete();
    }

    static async sealRitual(message){
        let actor = SR5_EntityHelpers.getRealActorFromID(message.ownerAuthor);
        let item = actor.items.find(i => i.id === message.itemId),
            itemData = duplicate(item.system);
        
        itemData.isActive = true;
        if (!game.user?.isGM){
            SR5_SocketHandler.emitForGM("updateItem", {
                item: item,
                data: itemData,
            });
        } else await item.update({'data': itemData});
    }

    static async getToxinEffect(effecType, data, actor){
        let itemEffects = [];
        let toxinType = data.toxin.type;
        let hasEffect;

        let effect = {
            name: game.i18n.localize(SR5.toxinTypes[toxinType]),
            type: "itemEffect",
        }

        switch (effecType){
            case "disorientation":
                hasEffect = actor.items.find(i => i.system.type === "toxinEffectDisorientation");
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.type": "toxinEffectDisorientation",
                        "system.value": -2,
                        "system.duration": 10,
                        "system.durationType": "minute",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -2,
                                "forceAdd": true,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.ToxinEffectDisorientation_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "nausea":
                hasEffect = actor.items.find(i => i.system.type === "toxinEffectNausea");
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.PenaltyDouble"),
                        "system.type": "toxinEffectNausea",
                        "system.value": "x2",
                        "system.duration": 10,
                        "system.durationType": "minute",
                        "system.customEffects": {
                            "0": {
                                "category": "specialProperties",
                                "target": "system.specialProperties.doublePenalties",
                                "type": "boolean",
                                "value": "true",
                                "forceAdd": true,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.ToxinEffectNausea_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "paralysis":
                hasEffect = actor.items.find(i => i.system.type === "toxinEffectParalysis");
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.type": "toxinEffectParalysis",
                        "system.value": -2,
                        "system.duration": 1,
                        "system.durationType": "hour",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -2,
                                "forceAdd": true,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.ToxinEffectParalysis_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            default:
        }
    
    return itemEffects;
    }

    static async getCalledShotsEffect(effecType, data, actor, weakSideSpecific){
        let itemEffects = [],
            calledShotsType = effecType.name,
            hasEffect = actor.items.find(i => i.system.type === calledShotsType),
            duration, 
            hasWeakSide = actor.items.find(i => i.system.type === "weakSide");

        let effect = {
            name: game.i18n.localize(SR5.calledShotsEffects[calledShotsType]),
            type: "itemEffect",
            "system.type": calledShotsType,
        }
        let effect2 = effect;

        switch (calledShotsType){
            case "bleedOut": //done, can't be automatised
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_BleedOut_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "blinded": //partially done: effect apply to all sight action, but for now only perception is concerned
                if (hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.SightPenalty"),
                        "system.value": -8,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                              "category": "skills",
                              "target": "system.skills.perception.perceptionType.sight.test",
                              "type": "value",
                              "value": -8,
                            }
                          },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Blinded_GE"),
                    });
                    await actor.deleteEmbeddedDocuments("Item", [hasEffect.id]);
                    itemEffects.push(effect);
                } else {
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.SightPenalty"),
                        "system.value": -4,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Blinded_GE"),
                        "system.customEffects": {
                            "0": {
                              "category": "skills",
                              "target": "system.skills.perception.perceptionType.sight.test",
                              "type": "value",
                              "value": -4,
                            }
                          },
                    });
                    itemEffects.push(effect);
                }
                break;
            case "brokenGrip": //Partially done: can't apply an effect based on arm usage
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -1,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_BrokenGrip_GE"),
                    });
                    itemEffects.push(effect);
                }
                if (hasWeakSide || weakSideSpecific) {
                    if(hasWeakSide) await actor.deleteEmbeddedDocuments("Item", [hasWeakSide.id]);
                    effect2 = mergeObject(effect2, {
                        "name": game.i18n.localize(SR5.calledShotsEffects["weakSide"]),
                        "system.type": "weakSide",
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -1,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -1,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -1,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -1,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -1,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -1,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WeakSide_GE"),
                    });
                    itemEffects.push(effect2);
                }
                break;
            case "buckled": //done
                duration = {
                    type: "round",
                    duration: data.hits - data.test.hits,
                }
                await actor.createProneEffect(0, actor.system, 0, duration, "buckled");
                break;
            case "deafened": //done        
                if (hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.HearingPenalty"),
                        "system.value": -4,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                              "category": "skills",
                              "target": "system.skills.perception.perceptionType.hearing.test",
                              "type": "value",
                              "value": -4,
                            }
                          },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Deafened_GE"),
                    });
                    await actor.deleteEmbeddedDocuments("Item", [hasEffect.id]);
                    itemEffects.push(effect);
                }
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.HearingPenalty"),
                        "system.value": -2,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                              "category": "skills",
                              "target": "system.skills.perception.perceptionType.hearing.test",
                              "type": "value",
                              "value": -2,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Deafened_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "dirtyTrick": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.value": effecType.value || -4,
                        "system.duration": 1,
                        "system.durationType": "action",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": effecType.value || -4,
                                "forceAdd": true,
                            }
                        },                    
                        "system.gameEffect": game.i18n.format("SR5.STATUSES_DirtyTrick_GE", {value: effecType.value || -4}),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "entanglement": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Agility"),
                        "system.value": -effecType.netHits,
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.customEffects": {
                            "0": {
                                "category": "characterAttributes",
                                "target": "system.attributes.agility.augmented",
                                "type": "value",
                                "value": -effecType.netHits,
                            }
                        },                    
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Entanglement_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "feint":  //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -data.netHits,
                        "system.duration": 1,
                        "system.durationType": "action",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -data.netHits,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -data.netHits,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -data.netHits,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -data.netHits,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -data.netHits,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Feint_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "flared": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.value": -8,
                        "system.duration": 1,
                        "system.durationType": "action",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -8,
                                "forceAdd": true,
                            }
                        }, 
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Flared_GE"),
                    });
                    effect2 = mergeObject(effect2, {
                        "system.target": game.i18n.localize("SR5.SightPenalty"),
                        "system.value": -99,
                        "system.duration": 10,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.skills.perception.perceptionType.sight.test",
                                "type": "value",
                                "value": -99,
                                "forceAdd": true,
                            }
                        }, 
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Flared_GE"),
                    });
                    itemEffects.push(effect, effect2);
                }
                break;
            case "knockdown": //done
                duration = {
                    type: "special",
                    duration: 0,
                }
                await actor.createProneEffect(0, actor.system, 0, duration, "knockdown");
                break;
            case "oneArmBandit": //Partially done: can't apply an effect based on arm usage
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -6,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_OneArmBandit_GE"),
                    });
                    itemEffects.push(effect);
                }
                //Apply weak side effect in the same time
                if (hasWeakSide || weakSideSpecific) {
                    if (hasWeakSide) await actor.deleteEmbeddedDocuments("Item", [hasWeakSide.id]);
                    effect2 = mergeObject(effect2, {
                        "name": game.i18n.localize(SR5.calledShotsEffects["weakSide"]),
                        "system.type": "weakSide",
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -1,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -1,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -1,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -1,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -1,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -1,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WeakSide_GE"),
                    });
                    itemEffects.push(effect2);
                }
                break;
            case "onPinsAndNeedles": //done, can't be automatised
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.MovementPenalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_OnPinsAndNeedles_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "nauseous": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.value": -4,
                        "system.duration": data.hits - data.test.hits,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -4,
                                "forceAdd": true,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Nauseous_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "pin": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Defenses"),
                        "system.value": effecType.initialDV,
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -2,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -2,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -2,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -2,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -2,
                            }
                        },                       
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Pin_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "shaked": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.GlobalPenalty"),
                        "system.value": -1,
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.customEffects": {
                            "0": {
                                "category": "penaltyTypes",
                                "target": "system.penalties.special.actual",
                                "type": "value",
                                "value": -1,
                                "forceAdd": true,
                            }
                        }, 
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Shaked_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;  
            case "slowDeath": //done, can't be automatised
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_SlowDeath_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "slowed": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.MovementPenalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.customEffects": {
                            "0": {
                              "category": "movements",
                              "target": "system.movements.run.movement",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "1": {
                              "category": "movements",
                              "target": "system.movements.run.extraMovement",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "2": {
                              "category": "movements",
                              "target": "system.movements.run.maximum",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "3": {
                              "category": "movements",
                              "target": "system.movements.walk.movement",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "4": {
                              "category": "movements",
                              "target": "system.movements.walk.extraMovement",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                            "5": {
                              "category": "movements",
                              "target": "system.movements.walk.maximum",
                              "type": "divide",
                              "value": 0,
                              "multiplier": 2,
                              "wifi": false,
                              "transfer": false
                            },
                          },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Slowed_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "trickShot": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.SkillIntimidation"),
                        "system.value": data.netHits,
                        "system.duration": "1",
                        "system.durationType": "action",
                        "system.customEffects": {
                            "0": {
                                "category": "skills",
                                "target": "system.skills.intimidation.test",
                                "type": "value",
                                "value": data.netHits,

                            }
                        },                    
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_TrickShot_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "unableToSpeak": //done, can't be automatised
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Language"),
                        "system.value": "",
                        "system.duration": data.damageValue,
                        "system.durationType": "hour",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_UnableToSpeak_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "weakSide": //done
                let hasBrokenGrip = actor.items.find(i => i.system.type === "brokenGrip");
                let hasOneArm = actor.items.find(i => i.system.type === "oneArmBandit");
                if (hasEffect) await actor.deleteEmbeddedDocuments("Item", [hasEffect.id]);
                if (hasBrokenGrip || hasOneArm) {
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.value": -1,
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.customEffects": {
                            "0": {
                                "category": "characterDefenses",
                                "target": "system.defenses.block",
                                "type": "value",
                                "value": -1,
                            },
                            "1": {
                                "category": "characterDefenses",
                                "target": "system.defenses.defend",
                                "type": "value",
                                "value": -1,
                            },
                            "2": {
                                "category": "characterDefenses",
                                "target": "system.defenses.dodge",
                                "type": "value",
                                "value": -1,
                            },
                            "3": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryBlades",
                                "type": "value",
                                "value": -1,
                            },
                            "4": {
                                "category": "characterDefenses",
                                "target": "system.defenses.parryClubs",
                                "type": "value",
                                "value": -1,
                            }
                        },
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WeakSide_GE"),
                    });
                    itemEffects.push(effect);
                } else {
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.Penalty"),
                        "system.duration": "",
                        "system.durationType": "special",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WeakSide_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "winded": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.ComplexAction"),
                        "system.duration": effecType.initialDV,
                        "system.durationType": "round",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Winded_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "antenna":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_Antenna"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",                  
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Antenna_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "engineBlock": //done
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_EngineBlock"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",                
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_EngineBlock_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "windowMotor":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_WindowMotor"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_WindowMotor_GE"),
                    });
                itemEffects.push(effect);
                }
                break;
            case "doorLock":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_DoorLock"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",              
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_DoorLock_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "axle":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_Axle"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",
                        "system.customEffects":  {
                            "0": {
                                "category": "vehicleAttributes",
                                "target": "system.attributes.speed.augmented",
                                "type": "valueReplace",
                                "value": 1,
                                "multiplier": null,
                                "wifi": false,
                                "transfer": false
                            },
                            "1": {
                                "category": "vehicleAttributes",
                                "target": "system.attributes.speedOffRoad.augmented",
                                "type": "valueReplace",
                                "value": 1,
                                "multiplier": null,
                                "wifi": false,
                                "transfer": false
                            }
                        },                   
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_Axle_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            case "fuelTankBattery":
                if (!hasEffect){
                    effect = mergeObject(effect, {
                        "system.target": game.i18n.localize("SR5.CS_ST_FuelTankBattery"),
                        "system.value": "",
                        "system.duration": "",
                        "system.durationType": "permanent",
                        "system.gameEffect": game.i18n.localize("SR5.STATUSES_FuelTankBattery_GE"),
                    });
                    itemEffects.push(effect);
                }
                break;
            default:
        }
        return itemEffects;
    }

    static convertCalledShotToMod(calledShot, ammoType){
        switch(calledShot) {
            case "shakeUp":
            case "trickShot":
            case "breakWeapon":
            case "disarm":
            case "feint":
            case "knockdown":
            case "reversal":
            case "splittingDamage":
            case "pin":
            case "entanglement":
            case "dirtyTrick":
            case "windowMotor":
            case "engineBlock":
            case "extremeIntimidation":
            case "onPinsAndNeedles": 
            case "tag":
            case "bullsEye":
            case "blastOutOfHand":
            case "shakeRattle":
            case "shreddedFlesh":
            case "upTheAnte":
            case "harderKnock":
            case "vitals":
                return -4;
            case "gut": 
            case "forearm":
            case "shin": 
            case "shoulder":                   
            case "thigh": 
            case "hip": 
            case "doorLock":
            case "axle":
            case "fuelTankBattery":
            case "flashBlind":
            case "hitEmWhereItCounts":
            case "warningShot":
            case "ricochetShot":
                return -6;
            case "ankle":
            case "knee":
            case "hand":
            case "foot":
            case "neck":
            case "jaw":
            case "antenna":
            case "bellringer":
            case "downTheGullet":
                return -8;
            case "ear":
            case "eye":
            case "genitals":
            case "sternum":
                return -10;
            case "flameOn": 
                switch(ammoType) {
                    case "flare":
                    case "gyrojet": 
                        return -10;
                    case "tracer": 
                        return -6;
                }
            default:
                return 0;
        }
    }

    static convertCalledShotToLimitDV(calledShot, ammoType){
        switch(calledShot) {
            case "gut": 
                return 8;               
            case "forearm":
            case "shin": 
            case "jaw":
            case "antenna":
            case "downTheGullet":
            case "flashBlind":
                return 2;
            case "shoulder":                   
            case "thigh": 
            case "hip": 
                return 3;
            case "ankle":
            case "knee":
            case "hand":
            case "foot":
            case "ear":
            case "eye":
            case "flameOn":
            case "hitEmWhereItCounts":
            case "throughAndInto":
                return 1;
            case "sternum":
            case "neck":
            case "shreddedFlesh":
                return 10;
            case "genitals":
            case "bellringer":
                return 4;
            case "axle":
                return 6;
            case "blastOutOfHand":
                switch(ammoType) {
                    case "explosive": 
                    case "gel": 
                    case "hollowPoint": 
                    case "flechette":
                        return 2;
                    case "exExplosive": 
                        return 3;                      
                    default:                     
                        return 0;
                }
            case "dirtyTrick": 
                if (ammoType === "gel" || ammoType === "gyrojet") return 2;
                else return 0;
            default:
                return 0;
        }
    }

    static convertCalledShotToEffect(calledShot, ammoType){
        let effect;
        switch(calledShot) {
            case "dirtyTrick":
                switch(ammoType) { 
                    case "exExplosive":  
                        return effect = {"0": {"name": calledShot, "value": -6}};
                    case "explosive":
                    case "frangible": 
                    case "hollowPoint": 
                        return effect = {"0": {"name": calledShot, "value": -5}};
                    case "gel":
                    case "gyrojet":
                        return effect = {"0": {"name": calledShot, "value": -4}};
                    default:                     
                        return effect = {"0": {"name": calledShot, "value": -4,}};
                }
            case "antenna":
            case "axle":
            case "doorLock": 
            case "engineBlock":
            case "fuelTankBattery":
            case "windowMotor":
            case "onPinsAndNeedles":
            case "trickShot":
            case "feint":
                return effect = {"0": {"name": calledShot,}};
            case "blastOutOfHand":
                switch(ammoType) {
                    case "explosive": 
                    case "gel": 
                    case "hollowPoint": 
                        return effect = {"0": {"name": calledShot, "modFingerPopper": 0,}};
                    case "exExplosive": 
                        return effect = {"0": {"name": calledShot, "modFingerPopper": 1,}};
                    default:                     
                        return effect = {"0": {"name": calledShot, "modFingerPopper": -1,}};
                }
            case "flashBlind":
                return effect = {"0": {"name": "flared",}};               
            case "shreddedFlesh":
                return effect = {"0": {"name": "bleedOut",}};
            default:
                return effect = {};
        }
    }

    static convertCalledShotToInitiativeMod(ammoType){
        switch(ammoType) {
            case "explosive": 
                return -6; 
            case "exExplosive": 
                return -8;
            default:                     
                return -5;
        }
    }

    static convertHealingConditionToDiceMod(condition){
        switch (condition){
            case "good":
                return 0;
            case "average":
                return -1;
            case "poor":
                return -2;
            case "bad":
                return -3;
            case "terrible":
                return -4;
            default: return 0;
        }
    }

    static findMedkitRating(actor){
        let medkit = {};
        let item = actor.items.find(i => i.system.isMedkit)
        if (item && item.system.charge > 0){
            medkit.rating = item.system.itemRating;
            medkit.id = item.id;
            return medkit;
        }
    }

    static convertRestraintTypeToThreshold(type){
        switch (type){
            case "rope":
                return 2;
            case "metal":
                return 3;
            case "straitjacket":
                return 4;
            case "containment":
                return 5;
            default: return 2;
        }
    }

    static convertPerceptionTypeToThreshold(type){
        switch (type){
            case "opposed":
                return 0;
            case "obvious":
                return 1;
            case "normal":
                return 2;
            case "obscured":
                return 3;
            case "hidden":
                return 4;
            default: return 0;
        }
    }

    static convertWeatherModifierToMod(type){
        switch (type){
            case "poor":
                return -1;
            case "terrible":
                return -2;
            case "extreme":
                return -4;
            default: return 0;
        }
    }

    static convertSurvivalThresholdTypeToThreshold(type){
        switch (type){
            case "mild":
                return 1;
            case "moderate":
                return 2;
            case "tough":
                return 3;
            case "extreme":
                return 4;
            default: return 0;
        }
    }

    static convertSocialAttitudeValueToMod(type){
        switch (type){
            case "friendly":
                return 2;
            case "neutral":
                return 0;
            case "suspicious":
                return -1;
            case "prejudiced":
                return -2;
            case "hostile":
                return -3;
            case "enemy":
                return -4;
            default: return 0;
        }
    }

    static convertSocialResultValueToMod(type){
        switch (type){
            case "advantageous":
                return 1;
            case "ofNoValue":
                return 0;
            case "annoying":
                return -1;
            case "harmful":
                return -3;
            case "disastrous":
                return -4;
            default: return 0;
        }
    }

    static convertWorkingConditionToMod(type){
        switch (type){
            case "distracting":
                return -1;
            case "poor":
                return -2;
            case "bad":
                return -3;
            case "terrible":
                return -4;
            case "superior":
                return 1;
            default: return 0;
        }
    }

    static convertToolsAndPartsToMod(type){
        switch (type){
            case "inadequate":
                return -2;
            case "unavailable":
                return -4;
            case "superior":
                return 1;
            default: return 0;
        }
    }

    static convertPlansMaterialToMod(type){
        switch (type){
            case "available":
                return 1;
            case "augmented":
                return 2;
            default: return 0;
        }
    }

    static convertCoverToMod(type){
        switch (type){
            case "none":
                return 0;
            case "partial":
                return 2;
            case "full":
                return 4;
            default: return 0;
        }
    }
    
    static convertMarkToMod(type){
        switch (type){
            case "1":
                return 0;
            case "2":
                return -4;
            case "3":
                return -10;
            default: return 0;
        }
    }

    static convertTriggerToMod(type){
        switch (type){
            case "command":
            case "time":
                return 2;
            case "contact":
                return 1;
            default: return 0;
        }
    }

    static convertSearchTypeToThreshold(type){
        switch (type){
            case "general":
                return 1;
            case "limited":
                return 3;
            case "hidden":
                return 1;
            default: return 0;
        }
    }

    static convertSpeedToDamageValue(speed, body){
        switch(speed) {
            case "speedRamming1":
                return Math.ceil(body/2);
            case "speedRamming11":
                return body;
            case "speedRamming51":
                return body*2;
            case "speedRamming201":
                return body*3;
            case "speedRamming301":
                return body*5;
            case "speedRamming501":
                return body*10;
            default:
        }
    }

    static convertSpeedToAccidentValue(speed, body){
        switch(speed) {
            case "speedRamming1":
                return Math.ceil(body/4);
            case "speedRamming11":
                return Math.ceil(body/2);
            case "speedRamming51":
                return body;
            case "speedRamming201":
                return Math.ceil((body*3)/2);
            case "speedRamming301":
                return Math.ceil(body*2,5);
            case "speedRamming501":
                return Math.ceil(body*5);
            default:
        }
    }

    static convertBarrierTypeToStructure(barrierType){
        switch(barrierType){
            case "fragile":
                return 1
            case "cheap":
                return 2
            case "average":
                return 4
            case "heavy":
                return 6
            case "reinforced":
                return 8
            case "structural":
                return 10
            case "structuralHeavy":
                return 12
            case "armored":
                return 14
            case "hardened":
                return 16
            default: return 6
        }
    }
    
    static convertBarrierTypeToArmor(barrierType){
        switch(barrierType){
            case "fragile":
                return 2
            case "cheap":
                return 4
            case "average":
                return 6
            case "heavy":
                return 8
            case "reinforced":
                return 12
            case "structural":
                return 16
            case "structuralHeavy":
                return 20
            case "armored":
                return 24
            case "hardened":
                return 32
            default: return 8
        }
    }

    static async applyEffectToItem(data, type){
        let item = await fromUuid(data.targetItem);
        item = item.toObject(false);
        let actor = SR5_EntityHelpers.getRealActorFromID(data.actorId);
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

    static async sortDicePoolComposition(dicePool){
        let attributes = [],
            skills = [],
            armors = [],
            powers = [],
            everythingElse = [];

        for (let a of dicePool){
            switch(a.type){
                case "Attribut lié":
                case "Linked Attribute":
                    attributes.push(a);
                    break;
                case "Indice de compétence":
                case "Groupe de compétences":
                case "Skill rating":
                case "Skill Group":
                    skills.push(a);
                    break;
                case "Armure":
                case "Armor":
                    armors.push(a);
                    break;
                default: everythingElse.push(a);
            }
        }

        attributes.sort((a,b) => (a.source > b.source) ? 1 : -1);
        skills.sort((a,b) => (a.source > b.source) ? 1 : -1);
        armors.sort((a,b) => (a.source > b.source) ? 1 : -1);
        powers.sort((a,b) => (a.source > b.source) ? 1 : -1);
        everythingElse.sort((a,b) => (a.source > b.source) ? 1 : -1);
        let dicePoolComposition = attributes.concat(skills, armors, powers, everythingElse);
        return dicePoolComposition;
    }
}