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
        if (chatData) rollData.previousMessage.messageId = chatData.originalMessage;

        //Add system optionnal rules
        if (game.settings.get("sr5", "sr5CalledShotsRules")) rollData.systemRules.calledShots = true;
        if (game.settings.get("sr5", "sr5MatrixGridRules")) rollData.systemRules.grid = true;

        //Add targeted token info
        if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);

        //Iterate through roll type and add data to rollData;
        switch (rollType){
            case "astralTracking":
                rollData = await SR5_GetRollData.astralTracking(rollData, actor);
                break;
            case "attribute":
                rollData = await SR5_GetRollData.attributeOnly(rollData, rollKey, actor);
                break;
            case "banishingResistance":
                rollData = await SR5_GetRollData.banishingResistance(rollData, actor, chatData);
                break;
            case "bindingResistance":
                rollData = await SR5_GetRollData.bindingResistance(rollData, actor, chatData);
                break;
            case "calledShotBuckled":
                rollData = await SR5_GetRollData.calledShotBuckled(rollData, rollType, actor, chatData);
                break;
            case "calledShotFear":
                rollData = await SR5_GetRollData.calledShotFear(rollData, chatData);
                break;
            case "calledShotKnockdown":
                rollData = await SR5_GetRollData.calledShotKnockdown(rollData, rollType, actor, chatData);
                break;
            case "calledShotNauseous":
                rollData = await SR5_GetRollData.calledShotNauseous(rollData, rollType, actor, chatData);
                break;
            case "calledShotStunned":
                rollData = await SR5_GetRollData.calledShotStunned(rollData, rollType, actor, chatData);
                break;
            case "complexForm":
                rollData = await SR5_GetRollData.complexForm(rollData, actor, item);
                break;
            case "complexFormDefense":
                rollData = await SR5_GetRollData.complexFormDefense(rollData, actor, chatData);
                break;
            case "decompilingResistance":
                rollData = await SR5_GetRollData.decompilingResistance(rollData, actor, chatData);
                break;
            case "defense":
                rollData = await SR5_GetRollData.defense(rollData, actor, chatData);
                break;
            case "defenseSimple":
                rollData = await SR5_GetRollData.defenseSimple(rollData, rollKey, actor);
                break;
            case "derivedAttribute":
                rollData = await SR5_GetRollData.derived(rollData, rollKey, actor);
                break;
            case "drain":
                rollData = await SR5_GetRollData.drain(rollData, actor, chatData);
                break;
            case "eraseMark":
                rollData = await SR5_GetRollData.eraseMark(rollData, actor, chatData);
                break;
            case "escapeEngulf":
                rollData = await SR5_GetRollData.escapeEngulf(rollData, actor, chatData);
                break;
            case "fading":
                rollData = await SR5_GetRollData.fading(rollData, actor, chatData);
                break;
            case "healing":
                rollData = await SR5_GetRollData.healing(rollData, rollKey, actor);
                break;
            case "iceAttack":
                rollData = await SR5_GetRollData.iceAttack(rollData, actorData);
                break;
            case "iceDefense":
                rollData = await SR5_GetRollData.iceDefense(rollData, actorData);
                break;
            case "itemRoll":
                rollData = await SR5_GetRollData.itemRoll(rollData, item);
                break;
            case "knowledgeSkill":
            case "languageSkill":
                rollData = await SR5_GetRollData.knowledgeSkill(rollData, rollType, item);
                break;
            case "lift":
                rollData = await SR5_GetRollData.lift(rollData, rollKey, actor);
                break;
            case "martialArtDefense":
                rollData = await SR5_GetRollData.martialArtsDefense(rollData, actor, chatData);
                break;
            case "matrixAction":
                rollData = await SR5_GetRollData.matrixAction(rollData, rollKey, actor);
                break;
            case "matrixDefense":
                rollData = await SR5_GetRollData.matrixDefense(rollData, rollKey, actor, chatData);
                break;
            case "matrixDefenseSimple":
                rollData = await SR5_GetRollData.matrixDefenseSimple(rollData, rollKey, actor);
                break;
            case "matrixResistance":
                rollData = await SR5_GetRollData.matrixResistance(rollData, rollKey, actor, chatData);
                break;
            case "movement":
                rollData = await SR5_GetRollData.movement(rollData, rollKey, actor);
                break;
            case "objectResistance":
                rollData = await SR5_GetRollData.objectResistance(rollData, chatData);
                break;
            case "passThroughBarrier":
                rollData = await SR5_GetRollData.passThroughBarrier(rollData, actor);
                break;
            case "passThroughDefense":
                rollData = await SR5_GetRollData.passThroughDefense(rollData, chatData);
                break;
            case "power":
            case "adeptPower":
            case "martialArt": 
                rollData = await SR5_GetRollData.power(rollData, rollType, item);
                break;
            case "powerDefense":
                rollData = await SR5_GetRollData.powerDefense(rollData, actor, chatData);
                break;
            case "preparation":
                rollData = await SR5_GetRollData.preparation(rollData, actor, item);
                break;
            case "preparationFormula":
                rollData = await SR5_GetRollData.preparationFormula(rollData, actor, item);
                break;
            case "regeneration":
                rollData = await SR5_GetRollData.regeneration(rollData, actor);
                break;
            case "resonanceAction":
                rollData = await SR5_GetRollData.resonanceAction(rollData, rollKey, actor);
                break;
            case "resistanceCard":
            case "resistanceCardAura":
            case "fatiguedCard":
                rollData = await SR5_GetRollData.resistance(rollData, rollType, actor, chatData);
                break;
            case "ramming":
                rollData = await SR5_GetRollData.ramming(rollData, actor);
                break;
            case "rammingDefense":
                rollData = await SR5_GetRollData.rammingDefense(rollData, actor, chatData);
                break;
            case "registeringResistance":
                rollData = await SR5_GetRollData.registeringResistance(rollData, actor, chatData);
                break;
            case "resistanceSimple":
                rollData = await SR5_GetRollData.resistanceSimple(rollData, rollKey, actor);
                break;
            case "resistFire":
                rollData = await SR5_GetRollData.resistFire(rollData, actorData, chatData);
                break;
            case "ritual":
                rollData = await SR5_GetRollData.ritual(rollData, actor, item);
                break;
            case "sensorTarget":
                rollData = await SR5_GetRollData.sensorTarget(rollData, actor);
                break;
            case "sensorDefense":
                rollData = await SR5_GetRollData.sensorDefense(rollData, actor, chatData);
                break;
            case "skill":
            case "skillDicePool":
                rollData = await SR5_GetRollData.skill(rollData, rollType, rollKey, actor, chatData);
                break;
            case "spell":
                rollData = await SR5_GetRollData.spell(rollData, actor, item);
                break;
            case "spellResistance":
                rollData = await SR5_GetRollData.spellResistance(rollData, chatData);
                break;
            case "spritePower":
                rollData = await SR5_GetRollData.spritePower(rollData, actor, item);
                break;
            case "weapon":
                rollData = await SR5_GetRollData.weapon(rollData, actor, item);
                break;
            case "weaponAstral":
                rollData = await SR5_GetRollData.weaponAstral(rollData, item);
                break;
            case "vehicleTest":
                rollData = await SR5_GetRollData.vehicleTest(rollData, actor);
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
            chatCard: {
                calledShotButton: false,
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
                    full: 0,
                    selected: null,
                },
                ammo: {
                    type: "",
                    value: 0,
                    max: 0,
                    fired: 0,
                },
                armorPenetration: 0, //incomingPA
                calledShot: {
                    name: null,
                    effects: [],
                    hitsSpent: false,
                    initiative: null,
                    limitDV: 0,
                    location: null,
                    martialArts: {
                        pin: false,
                        disarm: false,
                        entanglement: false,
                        breakWeapon: false,
                        feint: false,
                    },
                },
                firingMode: {
                    singleShot: false,
                    semiAutomatic: false,
                    burstFire: false,
                    fullyAutomatic: false,
                    selected: "",
                },
                grenade: {
                    isGrenade: false,
                    damageFallOff: 0,
                    blastRadius: 0,
                },
                range: {
                    short: 0,
                    medium: 0,
                    long: 0,
                    extreme: 0,
                },
                reach: 0,
                recoil:{
                    compensationWeapon: 0,
                    compensationActor: 0,
                    cumulative: 0,
                    value: 0,
                },
                weaponType: "",
            },
            damage: {
                base: 0, //damageValueBase
                value: 0,  //accidentValue
                accidentValue: 0,
                type: "", //damageType
                element: null, //damageElement
                toxin: {
                    type: null,
                    penetration: 0,
                    power: 0,
                    speed: 0,
                },              //toxin
                continuous: false,          //damageContinuous
                isContinuating: false,      //damageIsContinuating
                source: "",                 //damageSource
                isFatiguedCard: false,       //change to source ?
                resistanceType: "",
                fatigued: 0,
                matrix: {
                    value: 0, //matrixDamageValue
                    base: 0, //matrixDamageValueBase
                },
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
                gridTypes: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.gridTypes, "gridTypes"),
                spriteTypes: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.spriteTypes, "spriteTypes"),
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
                },
                spiritAid: {
                    id: "",
                    modifier: 0,
                }
            },
            matrix: {
                defenderDoBiofeedbackDamage: false,
                iceType: "",
                mark: 0,
                actionType: "", //matrixActionType
                overwatchScore: false,
                noiseRange: "wired",
                noiseScene: 0,
                level: 0,
                fading: {
                    value: 0,
                    type: "",
                    modifiers: {},
                }
            },
            owner: {
                actorId: speakerId,
                actorType: actor?.type,
                itemId: item?.id,
                itemUuid: item?.uuid,
                messageId: null,
                speakerActor: speakerActor,
                speakerId: speakerId,
                speakerImg: speakerImg,
            },
            previousMessage:{
                actorId: null, //attackerId //originalActionUser //originalActionActor
                itemUuid: null,
                attackerStrength: 0, //remplacer?
                damage: 0, //damageOriginalValue
                messageId: null, //originalMessage //continuousDamageId
                hits: 0, //previousHits
            },
            roll: {},
            systemRules:{
                calledShots: false, //rulesCalledShot
                grid: false,  //rulesMatrixGrid
            },
            target: {
                hasTarget: false,
                actorId: null, //targetActor
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
                type: null,
            },
            various: {
                derivedBaseValue: 0, //peut être récupéré via l'acteur
                derivedExtraValue: 0, //peut être récupéré via l'acteur
                unit: null, //peut être récupéré via un helper
                defenseFirstAttribute: null, //defenseAttribute
                defenseSecondAttribute: null, //defenseMatrixAttribute
            },
        };

        return rollData;
    }
}