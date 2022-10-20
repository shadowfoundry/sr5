import { SR5 } from "../config.js";
import { SR5_RollTest } from "./roll-test.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_PrepareRollHelper } from "./roll-prepare-helpers.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import AbilityTemplate from "../interface/canvas-template.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";

export class SR5_PrepareRollTest {

    static async rollTest(document, rollType, rollKey, chatData) {
        //Get the actor who is rolling the test
        let actor = SR5_PrepareRollHelper.getRollingActor(document);
        //Get the item rolling the test
        let item = document;

        //Get the base infos for roll
        let rollData = this.getBaseRollData(document, actor);

        //Add reference to the previous chatMessage
        if (chatData) rollData.previousMessage.messageID = chatData.originalMessage;

        //Add system optionnal rules
        if (game.settings.get("sr5", "sr5CalledShotsRules")) rollData.systemRules.calledShots = true;
        if (game.settings.get("sr5", "sr5MatrixGridRules")) rollData.systemRules.grid = true;

        //Add targeted token info
        if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);

        //Iterate through roll type and add data to rollData;
        switch (rollType){
            case "attribute":
                rollData = await this.getAttributeOnlyRollData(rollData, rollKey, actor);
                break;
            case "languageSkill":
            case "knowledgeSkill":
                rollData = await this.getKnowledgeSkillRollData(rollData, rollType, actor, item);
                break;
            default:
                SR5_SystemHelpers.srLog(3, `Unknown ${rollType} roll type in 'actorRoll()'`);
        }

        console.log(rollData);
        await SR5_RollTest.generateRollDialog(rollData);
    }

    //Add info for Attribute only roll
    static async getAttributeOnlyRollData(rollData, rollKey, actor){
        //Determine title
        if (actor.type === "actorDrone") rollData.test.title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.vehicleAttributes[rollKey])}`;
        else rollData.test.title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.allAttributes[rollKey])}`;

        //Determine base dicepool
        if (rollKey === "edge" || rollKey === "magic" || rollKey === "resonance") rollData.dicePool.base = actor.system.specialAttributes[rollKey].augmented.value;
        else rollData.dicePool.base = actor.system.attributes[rollKey]?.augmented.value;
        
        //Determine dicepool composition
        rollData.dicePool.composition = ([{source: game.i18n.localize(SR5.allAttributes[rollKey]), type: "linkedAttribute", value: rollData.dicePool.base},]);

        //Add others informations
        rollData.lists.characterAttributes = SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.characterAttributes, "characterAttributes");
        rollData.lists.vehicleAttributes = SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.vehicleAttributes, "vehicleAttributes");
        rollData.lists.extendedInterval = SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.extendedInterval, "extendedInterval");
        rollData.dialogSwitch.attribute = true;
        rollData.dialogSwitch.penalty = true;
        rollData.dialogSwitch.extended = true;
        
        //add test type and return modified data
        rollData.test.type = "attributeOnly";
        return rollData;
    }

    //Add info for Knowledge / language skill roll
    static async getKnowledgeSkillRollData(rollData, rollType, actor, item){
        //Determine title
        rollData.test.title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + item.name}`;

        //Determine base dicepool
        rollData.dicePool.base = item.system.value;
        
        //Determine dicepool composition
        rollData.dicePool.composition = item.system.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute"));

        //Determine dicepool modififiers
        rollData.dicePool.modifiers = item.system.modifiers.filter(mod => (mod.type !== "skillRating" || mod.type !== "linkedAttribute"));

        //Add others informations
        rollData.lists.extendedInterval = SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.extendedInterval, "extendedInterval");
        rollData.dialogSwitch.specialization = true;
        
        //add test type and return modified data
        rollData.test.type = rollType;
        return rollData;
    }

    //Get the base data to build a roll test
    static getBaseRollData(document, actor) {
        let actorData, item, itemData, speakerActor, speakerId, speakerImg;
        actorData = actor.system;

        if (document.documentName === "Item"){
            item = document;
            itemData = document.system;
        }

        //Get owner chat message base data
        if (actor.isToken){
            speakerActor = actor.token.name;
            speakerId = actor.token.id;
            speakerImg = actor.token.texture.src;
        } else {
            speakerId = actor.id;
            let token = canvas.scene?.tokens.find((t) => t.actorId === speakerId);
            if (token){
                speakerActor = token.name;
                speakerImg = token.texture.src;
            } else {
                speakerActor = actor.name;
                speakerImg = actor.img;
            }
        }

        let rollData = {
            armor: {
                value: 0,
                composition: [],
                penetration: 0, //incomingPA
            },
            chatCard: {
                canEditResult: false,
                buttons: {},
            },
            combat: {
                activeDefenses: {
                    dodge: 0,
                    block: 0,
                    parryClubs: 0,
                    parryBlades: 0,
                },
                activeDefenseSelected: "",
                ammoType: "",
                ammoValue: 0,
                ammoMax: 0,
                ammoFired: 0,
                calledShot: "",
                firingMode: {
                    singleShot: false,
                    semiAutomatic: false,
                    burstFire: false,
                    fullyAutomatic: false,
                },
                firingModeSelected: "",
                range: {
                    short: 0,
                    medium: 0,
                    long: 0,
                    extreme: 0,
                },
                reach: 0,
                weaponType: "",
                isGrenade: false,
                damageFallOff: 0,
                blastRadius: 0,
                recoilCompensation: 0,
            },
            damage: {
                base: 0, //damageValueBase
                value: 0,  //accidentValue
                type: "", //damageType
                element: "", //damageElement
                isToxin: false,
                toxinType: "",              //toxin
                continuous: false,          //damageContinuous
                isContinuating: false,      //damageIsContinuating
                source: "",                 //damageSource
                isFatiguedCard: false       //change to source ?
            },
            dialogSwitch:{
                attribute: false,
                centering: false,
                chooseDamageType: false,
                cover: false,
                extended: false,
                objectResistanceTest: false,
                penalty: false,
                publicGrid: false,
                reagents: false, //canUseReagents
                sensorLocked: false, //isSensorLocked
                specialization: false,
                spellShaping: false,
                spiritAid: false,
                templatePlace: false,
                templateRemove: false,
                transferEffect: false,
                transferEffectOnItem: false,
            },
            dicePool: {
                base: 0, //dicePoolBase
                composition: [],
                modifiers: {},
                modifiersTotal: 0,
                value: 0, //
                penaltyValue: 0, //replace by getting data from actor
                cumulativeDefense: 0 //
            },
            effectsList: {}, //C'est quoi ca ?
            edge: {
                canUseEdge: false,
                hasUsedPushTheLimit: false,
                hasUsedSecondChance: false,
            },
            limit: {
                base: 0,
                composition: [],
                modifiers: {},
                modifiersTotal: 0,
                type: "", //limitType
                value: 0,
            },
            lists: {},
            magic: {
                drain: {
                    value: 0,
                    type: "",
                    modifiers: {},
                },
                force: 0,
                hasUsedReagents: false,
                spell: {
                    category: "",
                    isResisted: false,
                    range: 0,
                    area: 0,
                    type: "",
                    itemUuid: "",
                },
                spiritAid: {
                    id: "",
                    modifier: 0,
                }
            },
            matrix: {
                defenderDoBiofeedbackDamage: false,
                damage: 0, //matrixDamageValue
                damageBase: 0, //matrixDamageValueBase
                iceType: "",
                mark: 0,
                actionType: "", //matrixActionType
                overwatchScore: 0,
                noiseRange: "", //matrixNoiseRange
                noiseScene: 0, //matrixNoiseScene
                level: 0,
                fading: {
                    value: 0,
                    type: "",
                    modifiers: {},
                }
            },
            owner: {
                actorID: speakerId,
                actorMagic: "", //remplacer ?
                actorResonance: "", //remplacer ?
                actorMagicElements: "", //elements / replace ?
                actorTradition: "", //remplacer ?
                actorType: actor?.type,
                itemID: "",
                itemUuid: "",
                speakerActor: speakerActor,
                speakerId: speakerId,
                speakerImg: speakerImg,
            },
            previousMessage:{
                hits: 0,
                messageID: "", //originalMessage //continuousDamageId
                actorID: "", //attackerId //originalActionUser //originalActionActor
                attackerStrength: 0, //remplacer?
                damage: 0, //damageOriginalValue
                hits: 0, //previousHits
            },
            roll: {},
            systemRules:{
                calledShots: false, //rulesCalledShot
                grid: false,  //rulesMatrixGrid
            },
            target: {
                hasTarget: false,
                actorID: "", //targetActor
                actorType: "", //targetActorType remplacer ?
                essence: 0, //remplacer ?
                isEmergedOrAwakened: false, //isEmergedOrAwakened remplacer ?
                itemUuid: "", //matrixTargetItemUuid
                grid: "", //targetGrid
                rangeInMeters: 0,
                range: 0,
            },
            test: {
                actionType: "",
                isExtended: false, //extendedTest
                isOpposed: false, //opposedSkillTest
                extended: {
                    interval: "", //extendedInterval
                    intervalValue: 0, //extendedIntervalValue
                    multiplier: 1, //extendedMultiplier
                },
                title: "",
                type: "", //testType
                typeSub: "",
            },
            threshold: {
                value: 0, //opposedSkillThreshold //fireTreshold
                type: "",
            },
            various: {
                derivedBaseValue: 0, //peut être récupéré via l'acteur
                derivedExtraValue: 0, //peut être récupéré via l'acteur
                unit: "", //peut être récupéré via un helper
                defenseFirstAttribute: "",
                defenseSecondAttribute: "",
                defenseFull: 0, //remplacer
            },
        };

        return rollData;
    }

    
}