import { SR5 } from "../config.js";
import { SR5_RollTest } from "./roll-test.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_PrepareRollHelper } from "./roll-prepare-helpers.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import AbilityTemplate from "../interface/canvas-template.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";
import * as SR5_GetRollData from "./roll-prepare-case/index.js";

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
                rollData = await SR5_GetRollData.attributeOnlyRollData(rollData, rollKey, actor);
                break;
            case "knowledgeSkill":
            case "languageSkill":
                rollData = await SR5_GetRollData.knowledgeSkillRollData(rollData, rollType, item);
                break;
            case "skill":
            case "skillDicePool":
                rollData = await SR5_GetRollData.skillRollData(rollData, rollType, rollKey, actor, chatData);
                break;
            case "spell":
                rollData = await SR5_GetRollData.spellRollData(rollData, actor, item);
                break;
            default:
                SR5_SystemHelpers.srLog(3, `Unknown ${rollType} roll type in 'actorRoll()'`);
        }

        console.log(rollData);
        if (rollData) SR5_RollTest.generateRollDialog(rollData);
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
                templatePlace: false,
                templateRemove: false,
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
                penalty: false,
                publicGrid: false,
                reagents: false, //canUseReagents
                sensorLocked: false, //isSensorLocked
                specialization: false,
                spellShaping: false,
                spiritAid: false,
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
            edge: {
                canUseEdge: false,
                hasUsedPushTheLimit: false,
                hasUsedSecondChance: false,
            },
            effects: {
                canApplyEffect: false,
                canApplyEffectOnItem: false,
            },
            limit: {
                base: 0,
                composition: [],
                modifiers: {},
                modifiersTotal: 0,
                type: "", //limitType
                value: 0,
            },
            lists: {
                extendedInterval: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.extendedInterval, "extendedInterval"),
                characterAttributes: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.characterAttributes, "characterAttributes"),
                vehicleAttributes: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.vehicleAttributes, "vehicleAttributes"),
                perceptionModifiers: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.perceptionModifiers, "perceptionModifiers"),
                perceptionTypes: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.perceptionTypes, "perceptionTypes"),
                spiritTypes: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.spiritTypes, "spiritTypes"),
                damageTypes: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.damageTypes, "damageTypes"),
            },
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
                    objectCanResist: false, //objectResistanceTest
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
                itemUuid: null, //matrixTargetItemUuid
                itemList: {},
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