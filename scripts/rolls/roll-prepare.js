import { SR5 } from "../config.js";
import { SR5_RollTest } from "./roll-test.js";
import { SR5_PrepareRollHelper } from "./roll-prepare-helpers.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
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

        //Add system optionnal rules
        if (game.settings.get("sr5", "sr5CalledShotsRules")) rollData.systemRules.calledShots = true;
        if (game.settings.get("sr5", "sr5MatrixGridRules")) rollData.systemRules.grid = true;

 
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
                rollData = await SR5_GetRollData.calledShotBuckled(rollData, actor, chatData);
                break;
            case "calledShotFear":
                rollData = await SR5_GetRollData.calledShotFear(rollData, actor, chatData);
                break;
            case "calledShotKnockdown":
                rollData = await SR5_GetRollData.calledShotKnockdown(rollData, actor, chatData);
                break;
            case "calledShotNauseous":
                rollData = await SR5_GetRollData.calledShotNauseous(rollData, actor, chatData);
                break;
            case "calledShotStunned":
                rollData = await SR5_GetRollData.calledShotStunned(rollData, actor, chatData);
                break;
            case "complexForm":
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
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
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.iceAttack(rollData, actor);
                break;
            case "iceDefense":
                rollData = await SR5_GetRollData.iceDefense(rollData, actor, chatData);
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
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.matrixAction(rollData, rollKey, actor);
                break;
            case "matrixDefense":
                rollData = await SR5_GetRollData.matrixDefense(rollData, rollKey, actor, chatData);
                break;
            case "matrixDefenseSimple":
                rollData = await SR5_GetRollData.matrixDefenseSimple(rollData, rollKey, actor);
                break;
            case "matrixResistance":
                rollData = await SR5_GetRollData.matrixResistance(rollData, actor, chatData);
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
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
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
            case "ramming":
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.ramming(rollData, actor);
                break;
            case "rammingDefense":
                rollData = await SR5_GetRollData.rammingDefense(rollData, actor, chatData);
                break;
            case "regeneration":
                rollData = await SR5_GetRollData.regeneration(rollData, actor);
                break;
            case "registeringResistance":
                rollData = await SR5_GetRollData.registeringResistance(rollData, actor, chatData);
                break;
            case "resonanceAction":
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.resonanceAction(rollData, rollKey, actor);
                break;
            case "resistanceCard":
            case "resistanceCardAura":
            case "fatiguedCard":
            case "resistanceToxin":
                rollData = await SR5_GetRollData.resistance(rollData, rollType, actor, chatData);
                break;
            case "resistanceSimple":
                rollData = await SR5_GetRollData.resistanceSimple(rollData, rollKey, actor);
                break;
            case "resistFire":
                rollData = await SR5_GetRollData.resistFire(rollData, actor, chatData);
                break;
            case "ritual":
                rollData = await SR5_GetRollData.ritual(rollData, actor, item);
                break;
            case "sensorTarget":
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.sensorTarget(rollData, actor);
                break;
            case "sensorDefense":
                rollData = await SR5_GetRollData.sensorDefense(rollData, actor, chatData);
                break;
            case "skill":
            case "skillDicePool":
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.skill(rollData, rollType, rollKey, actor, chatData);
                break;
            case "spell":
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.spell(rollData, actor, item);
                break;
            case "spellResistance":
                rollData = await SR5_GetRollData.spellResistance(rollData, actor, chatData);
                break;
            case "spritePower":
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.spritePower(rollData, actor, item);
                break;
            case "weapon":
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.weapon(rollData, actor, item);
                break;
            case "weaponAstral":
                if (game.user.targets.size) rollData = await SR5_PrepareRollHelper.getTargetData(rollData);
                rollData = await SR5_GetRollData.weaponAstral(rollData, item);
                break;
            case "vehicleTest":
                rollData = await SR5_GetRollData.vehicleTest(rollData, actor, chatData);
                break;
            default:
                SR5_SystemHelpers.srLog(3, `Unknown ${rollType} roll type in 'actorRoll()'`);
        }
        
        if (rollData) SR5_RollTest.generateRollDialog(rollData);
    }

    //Get the base data to build a roll test
    static getBaseRollData(document, actor) {
        let actorData, item, itemData, speakerActor, speakerId, speakerImg;
        actorData = actor.system;

        if (document?.documentName === "Item"){
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
                actions: [],
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
                armorPenetration: 0,
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
                choke: {
                    selected: "",
                    limit: "",
                    defense: "",
                    damageModify: 0,
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
                base: 0,
                value: 0,
                type: "",
                element: null,
                toxin: {},
                isContinuous: false,
                source: "",
                resistanceType: "",
                matrix: {
                    value: 0,
                    base: 0,
                    modifiers:{},
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
                reagents: false,
                specialization: false,
                spellShaping: false,
                spiritAid: false,
                transferEffect: false,
                transferEffectOnItem: false,
            },
            dicePool: {
                base: 0,
                composition: [],
                modifiers: [],
                modifiersTotal: 0,
                value: 0,
                cumulativeDefense: 0
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
                type: "",
                value: 0,
            },
            lists: {
                allAttributesWithoutEdge: actor.system.lists.allAttributesWithoutEdge,
                extendedIntervals: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.extendedIntervals, "extendedIntervals"),
                characterAttributes: actor.system.lists.characterAttributes,
                vehicleAttributes: actor.system.lists.vehicleAttributes,
                perceptionModifiers: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.perceptionModifiers, "perceptionModifiers"),
                perceptionTypes: SR5_EntityHelpers.sortByTranslatedTerm(actor.system.lists.perceptionTypes, "perceptionTypes"),
                spiritTypes: actor.system.lists.spiritTypes,
                damageTypes: actor.system.lists.damageTypes,
                gridTypes: actor.system.lists.gridTypes,
                spriteTypes: actor.system.lists.spriteTypes,
                targetSignature: actor.system.lists.targetSignature,
                objectTypes: actor.system.lists.objectTypes,
                perceptionThresholdType: actor.system.lists.perceptionThresholdType,
                matrixSearchInfoType: actor.system.lists.matrixSearchInfoType,
                matrixNoiseDistance: actor.system.lists.matrixNoiseDistance,
                matrixMarks: actor.system.lists.matrixMarks,
                healingConditions: actor.system.lists.healingConditions,
                healingSupplies: actor.system.lists.healingSupplies,
                restraintType: actor.system.lists.restraintType,
                weaponModesCode: actor.system.lists.weaponModesCode,
                coverTypes: actor.system.lists.coverTypes,
                characterSpecialDefensesDodge: actor.system.lists.characterSpecialDefensesDodge,
                characterSpecialDefenses: actor.system.lists.characterSpecialDefenses,
                chokeSettings: actor.system.lists.chokeSettings,
                workingCondition: actor.system.lists.chokeSettings,
                toolsAndParts: actor.system.lists.toolsAndParts,
                plansMaterial: actor.system.lists.plansMaterial,
                weaponRanges: actor.system.lists.weaponRanges,
                preparationTriggerTypes: actor.system.lists.preparationTriggerTypes,
                vehicleSpeed: actor.system.lists.vehicleSpeed,
                socialAttitude: actor.system.lists.socialAttitude,
                socialResult: actor.system.lists.socialResult,
                survivalWeather: actor.system.lists.survivalWeather,
                survivalTerrain: actor.system.lists.survivalTerrain,
            },
            magic: {
                drain: {
                    value: 0,
                    type: "",
                    modifiers: {},
                },
                force: null,
                hasUsedReagents: false,
                spell: {
                    category: "",
                    isResisted: false,
                    objectCanResist: false,
                    range: 0,
                    area: 0,
                    type: "",
                },
                spiritAid: {
                    id: "",
                    modifier: 0,
                },
                elements: null,
                spiritType: null,
                tradition: actor.system.magic?.tradition,
                preparationTrigger: null,
            },
            matrix: {
                defenderDoBiofeedbackDamage: false,
                iceType: "",
                mark: 0,
                actionType: "",
                overwatchScore: false,
                noiseRange: "wired",
                noiseScene: 0,
                level: null,
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
                actorId: null,
                itemUuid: null,
                attackerStrength: 0,
                damage: 0,
                messageId: null,
                hits: 0,
            },
            roll: {},
            systemRules:{
                calledShots: false,
                grid: false,
            },
            target: {
                hasTarget: false,
                actorId: null,
                actorType: "",
                itemUuid: null,
                itemList: {},
                grid: "",
                rangeInMeters: 0,
                range: 0,
            },
            test: {
                actionType: "",
                isExtended: false,
                isOpposed: false,
                extended: {
                    interval: "",
                    intervalValue: 0,
                    multiplier: 1,
                },
                title: "",
                type: "",
                typeSub: "",
            },
            threshold: {
                value: 0,
                type: null,
            },
            various: {},
        };

        return rollData;
    }
}