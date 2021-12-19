import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utility.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_Dice } from "./dice.js";


export class SR5_DiceHelper {

    // Update an item after a roll
    static async srDicesUpdateItem(cardData, actor) {
        let item = actor.getEmbeddedDocument("Item", cardData.item._id);
        let newItem = duplicate(item.data);
        let firedAmmo = cardData.firedAmmo;
        
        //update weapon ammo
        if (!firedAmmo) firedAmmo = 1;
        if (newItem.type === "itemWeapon" && newItem.data.category === "rangedWeapon") {
            newItem.data.ammunition.value -= firedAmmo;
            if (newItem.data.ammunition.value < 0) newItem.data.ammunition.value = 0;
            item.update(newItem);
        }
        //update spell force
        if (newItem.type === "itemSpell") {
            newItem.data.hits = cardData.test.hits;
            newItem.data.force = cardData.force;
            item.update(newItem);
        }
        //update preparation hits
        if (newItem.type === "itemPreparation") {
            newItem.data.hits = cardData.test.hits;
            newItem.data.force = cardData.force;
            item.update(newItem);
        }
        //update complex form level
        if (newItem.type === "itemComplexForm") {
            newItem.data.hits = cardData.test.hits;
            newItem.data.level = cardData.level;
            item.update(newItem);
        }
    }

    /** Handle spirit, sprite or preparation resistance
    * @param {Object} message - The origin message
    */
    static async createItemResistance(message) {
        let data = message.data.flags.sr5data;
        let actor = SR5_EntityHelpers.getRealActorFromID(data.invocaAuthor);
        actor = actor.toObject(false);
        let dicePool;

        let cardData = {
            button: {},
            actor: actor,
            invocaAuthor: data.invocaAuthor,    
            hits: data.hits,
            speakerId: data.speakerId,
            speakerActor: data.speakerActor,
            speakerImg: data.speakerImg,
        };

        //Spirit resistance
        if (data.typeSub === "summoning"){
            cardData = mergeObject(cardData, {
                spiritType: data.spiritType,
                force: data.force,
                type: "summoningResistance",
                title: `${game.i18n.localize("SR5.SummoningResistance")} (${cardData.hits})`,
            });
            dicePool = cardData.force;
        }

        //Sprite resistance
        if (data.typeSub === "compileSprite"){
            cardData = mergeObject(cardData, {
                spriteType: data.spriteType,
                level: data.level,
                type: "compilingResistance",
                title: `${game.i18n.localize("SR5.CompilingResistance")} (${cardData.hits})`,
            });
            dicePool = cardData.level;    
        }

        //Preparation resistance
        if (data.type === "preparationFormula"){
            cardData = mergeObject(cardData, {
                item: data.item,
                force: data.force,
                preparationTrigger : data.preparationTrigger,
                type: "preparationResistance",
                title: `${game.i18n.localize("SR5.PreparationResistance")} (${cardData.hits})`,
            });
            dicePool = cardData.force;    
        }

        let result = SR5_Dice.srd6({ dicePool: dicePool });
        cardData.test = result;

        SR5_Dice.srDicesAddInfoToCard(cardData, data.actor);
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
            case "FAs":
                return 6;
            case "FAc":
                return 10;
            case "SF":
                return 20;
            default: return 0;
        }
    }

    //Convert active defense mode to dice mod value
    static convertActiveDefenseToMod(defenseMode, defenseValue){
        switch(defenseMode){
            case "defenseDodge": 
                return defenseValue.dodge;
            case "defenseBlock":
                return defenseValue.block;
            case "defenseParryClubs":
                return defenseValue.parryClubs;
            case "defenseParryBlades":
                return defenseValue.parryBlades;
            default: 
                return 0;
        }
    }

    //Convert active defense mode to initiative modifier value
    static convertActiveDefenseToInitModifier(defenseMode){
        switch(defenseMode){
            case "defenseDodge": 
            case "defenseBlock":
            case "defenseParryClubs":
            case "defenseParryBlades":
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

    //Get augmented attribute value from attribute name
    static getAttributeValue(key, actor){
        if (key === "none") return 0;
        else return actor.data.attributes[key].augmented.value;
    }

    /** Put a mark on Actor
   * @param {Object} targetActor - The Target Actor
   * @param {Object} attackerID - Actor ID who wants to put a mark
   * @param {Object} mark - Number of Marks to put
   */
    static async markActor(targetActor, attackerID, mark) {
        let attacker = SR5_EntityHelpers.getRealActorFromID(attackerID);
        // slaved device and Ice share their marks with server.
        if (attacker.isToken && attacker.type === "actorDevice") attackerID = attacker.id;
        // If defender already marked, increase marks
        let existingMark = await SR5_DiceHelper.findMarkValue(targetActor, attackerID);
        if (existingMark) {
            let newMark = existingMark.data.data.value + mark;
            // Keep number of marks under 3
            if (newMark > 3) newMark = 3;
            existingMark.update({"data.value": newMark});
        } else {
            let markData = {
                name: attacker.data.name,
                type: "itemMark",
                "data.owner": attackerID,
                "data.value": mark,
            };
            targetActor.createEmbeddedDocuments("Item", [markData]);
        }
        ui.notifications.info(`${attacker.data.name} ${game.i18n.format("SR5.INFO_ActorPutMark", {mark: mark})} ${targetActor.name}`);
    }

    /** Find if an Actor has a Mark item with the same ID as the attacker
   * @param {Object} targetActor - The Target Actor who owns the Mark
   * @param {Object} attackerID - The ID of the attacker who wants to mark
   * @return {Object} the mark item
   */
    static async findMarkValue(targetActor, attackerID){
        if (targetActor.data.items.find((i) => i.data.data.owner === attackerID)) {
            let i = targetActor.data.items.find((i) => i.data.data.owner === attackerID);
            let iMark = targetActor.items.get(i.id);
            return iMark;
        } else return false;
    }

    /** Apply Matrix Damage to a Dack
   * @param {Object} targetActor - The Target Actor who owns the deck
   * @param {Object} damageValue - Number of damage box
   * @param {Object} attacker - Actor who do the damage
   */
    static applyDamageToDecK(targetActor, damageValue, attacker) {
        let deck = targetActor.items.find((item) => item.type === "itemDevice" && item.data.data.isActive);
        let newDeck = duplicate(deck.data);
        if (targetActor.data.data.matrix.programs.virtualMachine.isActive) damageValue += 1;
        newDeck.data.conditionMonitors.matrix.current += damageValue;
        deck.update(newDeck);
        if (attacker) ui.notifications.info(`${attacker.name} ${game.i18n.format("SR5.INFO_ActorDoMatrixDamage", {damageValue: damageValue})} ${targetActor.name}.`); 
        else ui.notifications.info(`${targetActor.name} (${deck.name}): ${damageValue} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
    }

    // Update Matrix Damage to a Deck
    static async updateMatrixDamage(cardData, netHits, defender){
        let attacker = SR5_EntityHelpers.getRealActorFromID(cardData.matrixActionAuthor),
            attackerData = attacker?.data.data,
            damage = cardData.matrixDamageValueBase,
            mark = 0,
            markItem = defender.items.find((i) => i.data.owner === cardData.matrixActionAuthor);

        cardData.matrixDamageMod = {};
        cardData.matrixDamageMod.netHits = netHits;
        if (markItem !== undefined) {
            mark = markItem.data.value;
            cardData.matrixDamageMod.markQty = mark;
        }
        //Mugger program
        if (mark > 0 && attackerData.matrix.programs.mugger.isActive) {
            mark = mark * 2;
            cardData.matrixDamageMod.muggerIsActive = true;
        }
        //Guard program
        if (defender.data.matrix.programs.guard.isActive) {
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
        if (!canvas.scene){
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoActiveScene")}`);
            return;
        }
        let distanceMod = message.test.hits;
        let gridUnit = canvas.scene.data.grid;
    
        let template = canvas.scene.data.templates.find((t) => t.data.flags.item === message.item._id);
        if (template === undefined){
            ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoTemplateInScene")}`);
            return;
        }
    
        let distanceDice = 1;
        if (message.item.data.aerodynamic) distanceDice = 2;
        if (message.item.data.ammunition.type){
            switch(message.item.data.ammunition.type){
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
    
        let newPosition = deepClone(template.data);
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
            "data.type": "iceAttack",
            "data.ownerID": ice.data._id,
            "data.ownerName": ice.name,
            "data.duration": "permanent",
        };
        switch(messageData.iceType){
            case "iceAcid":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceFirewall"),
                    "data.target": game.i18n.localize("SR5.Firewall"),
                    "data.value": -1,
                    "data.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "data.matrix.attributes.firewall",
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
                    "data.target": game.i18n.localize("SR5.DataProcessing"),
                    "data.value": -1,
                    "data.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "data.matrix.attributes.dataProcessing",
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
                    if (i.type === "itemProgram" && (i.data.data.type === "hacking" || i.data.data.type === "common") && i.data.data.isActive){
                        programs.push(i);
                    }
                }
                let randomProgram = programs[Math.floor(Math.random()*programs.length)]
                randomProgram.update({"data.isActive": false});
                ui.notifications.info(`${randomProgram.name} ${game.i18n.localize("SR5.INFO_CrashProgram")}`);
                break;
            case "iceJammer":
                effect = mergeObject(effect, {
                    name: game.i18n.localize("SR5.EffectReduceAttack"),
                    "data.target": game.i18n.localize("SR5.MatrixAttack"),
                    "data.value": -1,
                    "data.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "data.matrix.attributes.attack",
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
                    "data.target": game.i18n.localize("SR5.Sleaze"),
                    "data.value": -1,
                    "data.customEffects": {
                        "0": {
                            "category": "matrixAttributes",
                            "target": "data.matrix.attributes.sleaze",
                            "type": "value",
                            "value": -1,
                            "forceAdd": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
                break;
            case "iceScramble":
                if (messageData.actor.data.matrix.userMode !== "ar"){
                    messageData.damageResistanceType = "dumpshock";
                    target.rollTest("resistanceCard", null, messageData);
                }
                let deck = target.items.find((item) => item.type === "itemDevice" && item.data.data.isActive);
                target.rebootDeck(deck);
                break;
            case "iceBlaster":
            case "iceBlack":
            case "iceTarBaby":
                effect = mergeObject(effect, {
                name: game.i18n.localize("SR5.EffectLinkLockedConnection"),
                    "data.target": "",
                    "data.value": "",
                    "data.customEffects": {
                        "0": {
                            "category": "special",
                            "target": "data.matrix.isLinkLocked",
                            "type": "boolean",
                            "value": true,
                        }
                    },
                });
                target.createEmbeddedDocuments("Item", [effect]);
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

}