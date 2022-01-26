// Test d'attribut simple
import { SR5 } from "../config.js";
import { SR5_Dice } from "./dice.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import AbilityTemplate from "../interface/canvas-template.js";
import { SR5_SystemHelpers } from "../system/utility.js";

export class SR5_Roll {

    static async actorRoll(entity, rollType, rollKey, chatData) {
        let actor,
            item,
            actorData,
            itemData,
            title = "",
            typeSub,
            testType = "nonOpposedTest",
            dicePool = 0,
            limit,
            optionalData = {},
            matrixAction,
            resonanceAction,
            skill,
            penalties = 0,
            speakerActor,
            speakerId,
            speakerImg,
            activeScene,
            backgroundCount,
            backgroundAlignement, 
            sceneNoise,
            sceneEnvironmentalMod,
            originalMessage;

        if (entity.documentName === "Actor") {
            actor = entity;
            actorData = entity.data.data;
            if (actor.isToken){
                speakerActor = actor.token.name;
                speakerId = actor.token.id;
                speakerImg = actor.token.data.img;
            } else {
                speakerId = actor.id;
                let token = canvas.scene?.data?.tokens.find((t) => t.data.actorId === speakerId);
                if (token){
                    speakerActor = token.data.name;
                    speakerImg = token.data.img;
                } else {
                    speakerActor = actor.name;
                    speakerImg = actor.img;
                }
            }
            matrixAction = actorData.matrix?.actions[rollKey];
            resonanceAction = actorData.matrix?.resonanceActions[rollKey];
            if (actor.data.type !== "actorDevice"){ 
                skill = actorData.skills[rollKey];
                //calcul penalties
                if(actorData.penalties){
                    penalties = actorData.penalties.condition.actual.value
                                + actorData.penalties.matrix.actual.value
                                + actorData.penalties.magic.actual.value
                                + actorData.penalties.special.actual.value;
                }
            }
        }

        if (entity.documentName === "Item"){
            item = entity;
            itemData = entity.data.data;
            actor = item.actor;
            actorData = actor.data.data;
            if (actor.isToken){
                speakerActor = actor.token.name;
                speakerId = actor.token.id;
                speakerImg = actor.token.data.img;
            } else {
                speakerId = actor.id;
                let token = canvas.scene?.data?.tokens.find((t) => t.data.actorId === speakerId);
                if (token){
                    speakerActor = token.data.name;
                    speakerImg = token.data.img;
                } else {
                    speakerActor = actor.name;
                    speakerImg = actor.img;
                }
            }
        }

        if (canvas.scene) {
            activeScene = game.scenes.active;
            sceneNoise = -activeScene.getFlag("sr5", "matrixNoise") || 0;
            backgroundAlignement = activeScene.getFlag("sr5", "backgroundCountAlignement") || "";
            if (backgroundAlignement === actorData.magic?.tradition) backgroundCount = 0;
            else backgroundCount = activeScene.getFlag("sr5", "backgroundCountValue") || 0;
        }

        if (chatData) originalMessage = chatData.originalMessage

        switch (rollType){
            case "attribute":
                if (actor.data.type === "actorDrone") title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.vehicleAttributes[rollKey])}`;
                else title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.allAttributes[rollKey])}`;
                dicePool = actorData.attributes[rollKey]?.augmented.value;
                if (dicePool === undefined) dicePool = actorData.specialAttributes[rollKey].augmented.value;
                optionalData = {
                    "switch.attribute": true,
                    "switch.penalty": true,
                    "switch.extended": true,
                    penaltyValue: penalties,
                }
                break;

            case "skill":
                title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey])}`;
                dicePool = actorData.skills[rollKey].rating.value;
                typeSub = rollKey;
                //TODO : find a solution for skill with limit depending on item.
                switch(rollKey){
                    case "spellcasting":
                    case "preparationForce":
                    case "vehicleHandling":
                    case "weaponAccuracy":
                    case "formulaForce":
                    case "spiritForce":
                        limit = 0;
                        break;
                    default:
                        limit = skill.limit.value;
                }
                optionalData = {
                    "switch.attribute": true,
                    attributeKey: actorData.skills[rollKey].linkedAttribute,
                    "switch.penalty": true,
                    penaltyValue: penalties,
                    "switch.specialization": true,
                    "switch.extended": true,
                    limitType: skill.limit.base,
                    "sceneData.backgroundCount" : backgroundCount,
                    "sceneData.backgroundAlignement" : backgroundAlignement,
                }
                break;

            case "languageSkill":
            case "knowledgeSkill":
                title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + item.name}`;
                dicePool = itemData.value;
                optionalData = {
                    "switch.specialization": true,
                    "switch.extended": true,
                }
                break;

            case "skillDicePool":
                if (actor.data.type === "actorDrone") {
                    if (actorData.controlMode === "autopilot") title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.vehicleAttributes[skill.linkedAttribute])}`;
                    else title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey])}`;
                } else title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.allAttributes[skill.linkedAttribute])}`;
                dicePool = actorData.skills[rollKey].test.dicePool;
                typeSub = rollKey;
                //TODO : find a solution for skill with limit depending on item.
                switch(rollKey){
                    case "spellcasting":
                    case "preparationForce":
                    case "vehicleHandling":
                    case "weaponAccuracy":
                    case "formulaForce":
                    case "spiritForce":
                        limit = 0;
                        break;
                    default:
                        limit = skill.limit.value;
                }
                optionalData = {
                    "switch.extended": true,
                    "switch.specialization": true,
                    limitType: skill.limit.base,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                }
                break;

            case "resistance":
                let subKey = rollKey.split("_").pop();
                let resistanceKey = rollKey.split("_").shift();
                switch (resistanceKey){
                    case "physicalDamage":
                        dicePool = actorData.resistances.physicalDamage.dicePool;
                        title = game.i18n.localize(SR5.characterResistances.physicalDamage);
                        break;
                    case "directSpellMana":
                        dicePool = actorData.resistances.directSpellMana.dicePool;
                        title = game.i18n.localize(SR5.characterResistances.directSpellMana);
                        break;
                    case "directSpellPhysical":
                        dicePool = actorData.resistances.directSpellPhysical.dicePool;
                        title = game.i18n.localize(SR5.characterResistances.directSpellPhysical);
                        break;
                    case "toxin":
                        dicePool = actorData.resistances.toxin[subKey].dicePool;
                        title = game.i18n.localize(SR5.characterResistances.toxin) + " (" + game.i18n.localize(SR5.propagationVectors[subKey]) + ")";
                        break;
                    case "disease":
                        dicePool = actorData.resistances.disease[subKey].dicePool;
                        title = game.i18n.localize(SR5.characterResistances.disease) + " (" + game.i18n.localize(SR5.propagationVectors[subKey]) + ")";
                        break;
                    case "specialDamage":
                        dicePool = actorData.resistances.specialDamage[subKey].dicePool;
                        title = game.i18n.localize(SR5.characterResistances.specialDamage) + " (" + game.i18n.localize(SR5.specialDamageTypes[subKey]) + ")";
                        break;
                    default:
                        SR5_SystemHelpers.srLog(1, `Unknown '${resistanceKey}' Damage Resistance Type in roll`);
                }
                break;

            case "resistanceCard":
                title = game.i18n.localize("SR5.TakeOnDamageShort") //TODO:  add details

                //handle distance between defenser and explosive device
                if (chatData.item?.data.category === "grenade" 
                 || chatData.item?.data.type === "grenadeLauncher" 
                 || chatData.item?.data.type === "missileLauncher"){
                    let grenadePosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.item._id);          
                    let defenserPosition = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(grenadePosition, defenserPosition);
                    let modToDamage = distance * (chatData.item.data.blast.damageFallOff || 0);
                    chatData.damageValue = chatData.damageValueBase + modToDamage;
                    if (chatData.damageValue <= 0) {
                        ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                        return;
                    }
                    if (modToDamage === 0) ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistance", {distance:distance})}`);
                    else ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistanceFallOff", {distance:distance, modifiedDamage: modToDamage, finalDamage: chatData.damageValue})}`);
                }

                switch (chatData.damageResistanceType){
                    case "physicalDamage":
                        title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${chatData.damageValue})`; //TODO: add details
                        typeSub = "physicalDamage";
                        let armor, resistanceValue;

                        switch (actor.data.type){
                            case "actorDrone":                                
                                armor = actorData.attributes.armor.augmented.value;
                                resistanceValue = actorData.resistances.physicalDamage.dicePool - armor;
                                if (chatData.damageValue < (armor + chatData.incomingPA)) {
                                    ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: armor + chatData.incomingPA, damage:chatData.damageValue})}`); 
                                    return;
                                }
                                if (chatData.damageType === "stun") {
                                    ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
                                    return;
                                }
                                break;
                            case "actorSpirit":
                                armor = actorData.essence.value * 2;
                                if (chatData.damageValue < (armor + chatData.incomingPA)) {
                                    ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: armor, pa: chatData.incomingPA, damage: chatData.damageValue})}`);
                                    return;    
                                }
                                resistanceValue = actorData.resistances.physicalDamage.dicePool;
                                break;
                            case "actorPc":
                            case "actorGrunt":
                                armor = actorData.itemsProperties.armor.value;
                                if (chatData.damageElement) {
                                    let element = chatData.damageElement;
                                    armor += actorData.itemsProperties.armor.specialDamage[element].value;
                                    resistanceValue = actorData.resistances.specialDamage[element].dicePool - armor;
                                } else {
                                    resistanceValue = actorData.resistances.physicalDamage.dicePool - armor;
                                }
                                if (chatData.damageValue < (armor + chatData.incomingPA) && chatData.damageElement !== "acid"){
                                    chatData.damageType = "stun";
                                    title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${chatData.damageValue})`; //TODO: add details
                                    ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDVSoStun", {armor: armor + chatData.incomingPA, damage:chatData.damageValue})}`); 
                                }
                                break;
                            default:
                        }

                        let modifiedArmor = armor + chatData.incomingPA;
                        if (modifiedArmor < 0) modifiedArmor = 0;
                        dicePool = resistanceValue + modifiedArmor;

                        optionalData = {
                            chatActionType: "msgTest_damage",
                            incomingPA: chatData.incomingPA,
                            armor: armor,
                            ammoType: chatData.ammoType,
                            damageValueBase: chatData.damageValue,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                            dicePoolBase : resistanceValue
                        }
                        if (chatData.damageSource === "spell") optionalData = mergeObject(optionalData,{damageSource: "spell",});
                        if (chatData.fireTreshold) optionalData = mergeObject(optionalData,{fireTreshold: chatData.fireTreshold,});
                        

                        break;
                    case "directSpellMana":       
                        if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToManaSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
                        title = `${game.i18n.localize("SR5.ResistanceTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterResistances[chatData.damageResistanceType])} (${chatData.damageValue})`;
                        dicePool = actorData.resistances[chatData.damageResistanceType].dicePool;
                        typeSub = "spellDamage";
                        optionalData = {
                            chatActionType: "msgTest_damage",
                            damageValueBase: chatData.damageValue,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                        }
                        break;
                    
                    case "directSpellPhysical":
                        if (actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToPhysicalSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
                        title = `${game.i18n.localize("SR5.ResistanceTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterResistances[chatData.damageResistanceType])} (${chatData.damageValue})`;
                        dicePool = actorData.resistances[chatData.damageResistanceType].dicePool;
                        typeSub = "manaSpellDamage";
                        optionalData = {
                            chatActionType: "msgTest_damage",
                            damageValueBase: chatData.damageValue,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                        }
                        break;
                    case "biofeedback":
                        dicePool = actorData.matrix.resistances.biofeedback.dicePool;
                        typeSub = "biofeedbackDamage";
                        title = `${game.i18n.localize("SR5.ResistBiofeedbackDamage")} (${chatData.damageValue})`;
                        let damageType;
                        if (chatData.blackout) {
                            damageType = "stun";
                        } else {
                            if (actorData.matrix.userMode === "coldsim") damageType = "stun";
                            else if (actorData.matrix.userMode === "hotsim") damageType = "physical";
                        }
                        optionalData = {
                            chatActionType: "msgTest_damage",
                            damageType: damageType,
                            damageValueBase: chatData.damageValue,
                        }
                        break;
                    case "dumpshock":
                        dicePool = actorData.matrix.resistances.dumpshock.dicePool;
                        typeSub = "dumpshock";
                        title = `${game.i18n.localize("SR5.ResistDumpshock")} (6)`;
                        let dumpshockType;
                        if (actorData.matrix.userMode === "coldsim") dumpshockType = "stun";
                        else if (actorData.matrix.userMode === "hotsim") dumpshockType = "physical";
                        optionalData = {
                            chatActionType: "msgTest_damage",
                            damageType: dumpshockType,
                            damageValueBase: 6,
                        }
                        break;
                    default:
                        SR5_SystemHelpers.srLog(1, `Unknown '${chatData.damageResistanceType}' Damage Resistance Type in roll`);
                }
                break;

            case "derivedAttribute":
                title = `${game.i18n.localize("SR5.DerivedAttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.characterDerivedAttributes[rollKey])}`;
                dicePool = actorData.derivedAttributes[rollKey].dicePool;
                break;

            case "lift":
                title = `${game.i18n.localize("SR5.CarryingTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.weightActions[rollKey])}`;
                dicePool = actorData.weightActions[rollKey].test.dicePool;
                typeSub = rollKey;
                optionalData = {
                    derivedBaseValue: actorData.weightActions[rollKey].baseWeight.value,
                    derivedExtraValue: actorData.weightActions[rollKey].extraWeight.value
                }
                break;

            case "movement":
                title = `${game.i18n.localize("SR5.MovementTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.movements[rollKey])}`;
                dicePool = actorData.movements[rollKey].test.dicePool;
                typeSub = rollKey;
                limit = actorData.movements[rollKey].limit.value;
                let unit;
                switch (rollKey){
                    case "treadWater":
                    unit = `${game.i18n.localize("SR5.MinuteUnit")}`;
                    break;
                case "holdBreath":
                    unit = `${game.i18n.localize("SR5.SecondUnit")}`;
                    break;
                default:
                    unit = `${game.i18n.localize("SR5.MeterUnit")}`;
                }

                optionalData = {
                    derivedBaseValue: actorData.movements[rollKey].movement.value,
                    derivedExtraValue: actorData.movements[rollKey].extraMovement.value,
                    unit: unit
                }
                break;

            case "resistFire":
                title = `${game.i18n.localize("SR5.TryToNotCatchFire")} (${chatData.fireTreshold})`
                dicePool = actorData.itemsProperties.armor.value + actorData.itemsProperties.armor.specialDamage.fire.value + chatData.incomingPA;
                let armored = actorData.itemsProperties.armor.value + actorData.itemsProperties.armor.specialDamage.fire.value;
                optionalData = {
                    //chatActionType: "msgTest_damage",
                    armor: armored,
                    incomingPA: chatData.incomingPA,
                    fireTreshold: chatData.fireTreshold,
                    dicePoolBase : 0,
                }
                break;

            case "matrixIceAttack":
                title = `${game.i18n.localize("SR5.IceAttack")}`;
                dicePool = actorData.matrix.ice.attackDicepool;
                limit = actorData.matrix.attributes.attack.value;
                optionalData = {
                    chatActionType: "msgTest_iceDefense",
                    typeSub: actorData.matrix.deviceSubType,
                    matrixDamageValue: actorData.matrix.attributes.attack.value,
                    defenseFirstAttribute: actorData.matrix.ice.defenseFirstAttribute,
                    defenseSecondAttribute: actorData.matrix.ice.defenseSecondAttribute,
                }
                break
            
            case "iceDefense":
                title = game.i18n.localize("SR5.Defense");
                let iceFirstAttribute, iceSecondAttribute;
                iceFirstAttribute = actorData.attributes[chatData.defenseFirstAttribute].augmented.value || 0;
                iceSecondAttribute = actorData.matrix.attributes[chatData.defenseSecondAttribute].value || 0;
                dicePool = iceFirstAttribute + iceSecondAttribute;
                let deck = actor.items.find(d => d.type === "itemDevice" && d.data.data.isActive);

                optionalData = {
                    hits: chatData.test.hits,
                    iceType: chatData.typeSub,
                    originalActionAuthor: chatData?.originalActionAuthor,
                    matrixDamageValueBase: chatData.matrixDamageValue,
                    mark: chatData?.mark,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                    matrixTargetItem: deck.toObject(false),
                }
                break;

            case "matrixAction":
                title = `${game.i18n.localize("SR5.MatrixActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`;
                dicePool = matrixAction.test.dicePool;
                limit = matrixAction.limit.value;
                typeSub = rollKey;
                if (matrixAction.defense.dicePool) {
                    if (typeSub === "jackOut" && actorData.matrix.isLinkLocked){
                        testType = "nonOpposedTest";
                    } else if (typeSub === "eraseMark"){
                        testType = "nonOpposedTest";
                    }
                    else {
                        testType = "opposedTest";
                    }
                }
                if (actorData.matrix.userGrid === "public"){
                    optionalData = mergeObject(optionalData, {
                        "switch.publicGrid": true,
                    });
                }
                
                //Check target's Marks before rolling if a target is selected.
                if (game.user.targets.size) {
                    const targeted = game.user.targets;
                    const cibles = Array.from(targeted);
                    for (let t of cibles) {
                        optionalData = mergeObject(optionalData, {
                            targetGrid: t.actor.data.data.matrix.userGrid,
                        });
                        if (matrixAction.neededMarks > 0){
                            let markItem = t.actor.data.items.find((i) => i.data.owner === speakerId);
                            if (markItem === undefined || markItem?.value < matrixAction.neededMarks) {
                                ui.notifications.info(game.i18n.localize("SR5.NotEnoughMarksOnTarget"));
                                return;
                            }
                        }
                    }
                }

                optionalData = mergeObject(optionalData, {
                    limitType: matrixAction.limit.linkedAttribute,
                    chatActionType: "msgTest_matrixDefense",
                    matrixActionType: matrixAction.limit.linkedAttribute,
                    overwatchScore: matrixAction.increaseOverwatchScore,
                    matrixNoiseRange: "wired",
                    matrixNoiseScene: sceneNoise,
                    "dicePoolMod.matrixNoiseScene": sceneNoise,
                    "dicePoolMod.matrixNoiseReduction": actorData.matrix.attributes.noiseReduction.value,
                });
                
                if (typeSub === "dataSpike"){
                    optionalData = mergeObject(optionalData, {
                        matrixDamageValueBase: actorData.matrix.attributes.attack.value,
                    });
                }
                break;

            case "matrixSimpleDefense":
                title = `${game.i18n.localize("SR5.MatrixDefenseTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`;
                dicePool = matrixAction.defense.dicePool;
                typeSub = rollKey;
                optionalData = {
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
            break;

            case "matrixDefense":
                if (actor.type === "actorSpirit") return;
                title = `${game.i18n.localize("SR5.MatrixDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[rollKey])} (${chatData.test.hits})`;
                dicePool = matrixAction.defense.dicePool;
                //Handle item targeted
                if (chatData.matrixTargetDevice && chatData.matrixTargetDevice !== "device"){
                    let targetItem = actor.items.find(i => i.id === chatData.matrixTargetDevice);
                    if (!targetItem.data.data.isSlavedToPan){
                        title = `${targetItem.name} - ${game.i18n.localize("SR5.MatrixDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[rollKey])} (${chatData.test.hits})`;
                        dicePool = targetItem.data.data.deviceRating * 2 || 0;
                    } else {
                        let panMaster = SR5_EntityHelpers.getRealActorFromID(targetItem.data.data.panMaster);
                        let panMasterDefense = panMaster.data.data.matrix.actions[rollKey].defense.dicePool;
                        dicePool = Math.max(targetItem.data.data.deviceRating * 2, panMasterDefense);
                    }
                    optionalData = mergeObject(optionalData, {
                        matrixTargetItem: targetItem.toObject(false),
                    });  
                } else {
                    let deck = actor.items.find(d => d.type === "itemDevice" && d.data.data.isActive);
                    optionalData = mergeObject(optionalData, {
                        matrixTargetItem: deck.toObject(false),
                    });
                }

                typeSub = rollKey;

                optionalData = mergeObject(optionalData, {
                    matrixActionType: matrixAction.limit.linkedAttribute,
                    overwatchScore: matrixAction.increaseOverwatchScore,
                    hits: chatData?.test.hits,
                    originalActionAuthor: chatData?.originalActionAuthor,
                    mark: chatData?.mark,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                });
                break;

            case "matrixResistance":
                title = `${game.i18n.localize("SR5.TakeOnDamageMatrix")} (${chatData.matrixDamageValue})`;
                dicePool = actorData.matrix.resistances[rollKey].dicePool;
                if (chatData.matrixTargetItem && chatData.matrixTargetItem?.data?.type !== "baseDevice" && chatData.matrixTargetItem?.data?.type !== "livingPersona" && chatData.matrixTargetItem?.data?.type !== "headcase"){
                    title = `${chatData.matrixTargetItem.name}: ${game.i18n.localize("SR5.TakeOnDamageShort")} (${chatData.matrixDamageValue})`;
                    dicePool = chatData.matrixTargetItem.data.deviceRating * 2;
                    optionalData = mergeObject(optionalData, {
                        matrixTargetItem: chatData.matrixTargetItem._id,
                    }); 
                }

                optionalData = mergeObject(optionalData, {
                    chatActionType: "msgTest_damage",
                    matrixDamageValue: chatData.matrixDamageValue,
                    matrixDamageValueBase: chatData.matrixDamageValue,
                    damageType: chatData.damageType,
                    originalActionAuthor: chatData.originalActionAuthor,
                });
                break;

            case "resonanceAction":
                title = `${game.i18n.localize("SR5.ResonanceActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.resonanceActions[rollKey])}`;
                dicePool = resonanceAction.test.dicePool;
                limit = resonanceAction.limit?.value;
                typeSub = rollKey;
            
                optionalData = {
                    chatActionType: "msgTest_resonanceDefense",
                    matrixActionType: resonanceAction.limit?.linkedAttribute,
                    overwatchScore: resonanceAction.increaseOverwatchScore,
                }
                break;

            case "defense":
                title = `${game.i18n.localize("SR5.PhysicalDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterDefenses[rollKey])}`;
                dicePool = actorData.defenses[rollKey].dicePool;
                if (rollKey !== "defend") limit = actorData.limits.physicalLimit.value;
                optionalData = {
                    cover: true,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
                break;

            case "fadingCard":
                title = game.i18n.localize("SR5.FadingResistanceTest");
                if (chatData.fadingValue >= 0) title += ` (${chatData.fadingValue})`;
                dicePool = actorData.matrix.resistances.fading.dicePool;
                if (chatData.hits > actorData.specialAttributes.resonance.augmented.value) chatData.fadingType = "physical";
                optionalData = {
                    chatActionType: "msgTest_damage",
                    fadingValue: chatData.fadingValue,
                    fadingType: chatData.fadingType,
                    actorResonance: chatData.actorResonance,
                    hits: chatData.hits,
                }
                break;
            
            case "drainCard":
                title = game.i18n.localize("SR5.DrainResistanceTest");
                if (chatData.drainValue >= 0) title += ` (${chatData.drainValue})`;
                dicePool = actorData.magic.drainResistance.dicePool;
                if (chatData.hits > actorData.specialAttributes.magic.augmented.value) chatData.drainType = "physical";
                optionalData = {
                    chatActionType: "msgTest_damage",
                    drainValue: chatData.drainValue,
                    drainType: chatData.drainType,
                    actorMagic: chatData.actorMagic,
                    hits: chatData.hits,
                }
                break;

            case "drain":
                title = game.i18n.localize("SR5.DrainResistanceTest");
                dicePool = actorData.magic.drainResistance.dicePool;
                break;

            case "defenseCard":
                if (actor.type === "actorDevice" || actor.type === "actorSprite") return;
                title = `${game.i18n.localize("SR5.PhysicalDefenseTest")} (${chatData.test.hits})`;
                dicePool = actorData.defenses.defend.dicePool;
                typeSub = chatData.typeSub;
                let cover = true;

                if (chatData.firingMode === "SF"){
                    dicePool = actorData.attributes.reaction.augmented.value + (actorData.specialAttributes?.edge?.augmented?.value || 0);
                    cover = false;
                    optionalData = mergeObject(optionalData, {firingMode: "SF",});
                }


                if (typeSub === "meleeWeapon"){
                    let reach = (actorData.reach?.value || 0) - chatData.attackerReach;
                    let weaponUsedToDefend = actor.items.find(i => (i.type === "itemWeapon") && (i.data.data.category === "meleeWeapon") && (i.data.data.isActive) );
                    if (weaponUsedToDefend) reach = weaponUsedToDefend.data.data.reach.value - chatData.attackerReach;
                    optionalData = mergeObject(optionalData, {
                        reach: reach,
                    });
                    sceneEnvironmentalMod = SR5_DiceHelper.handleEnvironmentalModifiers(activeScene, actorData, true);
                    optionalData = mergeObject(optionalData, {
                        "dicePoolMod.environmentalSceneMod": sceneEnvironmentalMod,
                    });
                }  

                if (canvas.scene && chatData.type === "spell" && chatData.item.data.range === "area"){
                    // Spell position
                    let spellPosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.item._id); 
                    // Get defenser position
                    let defenserPosition = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    // Calcul distance between grenade and defenser
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(spellPosition, defenserPosition);
                    //modify the damage based on distance and damage dropoff.
                    if (chatData.spellArea < distance) {
                        ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                        return;
                    }
                }

                if (chatData.type === "spell"){
                    optionalData = mergeObject(optionalData,{
                        damageSource: "spell",
                    });
                }

                //Handle sensor locked
                let sensorLocked = actor.items.find(i => (i.type === "itemEffect") && (i.data.data.type === "sensorLock") && (i.data.data.ownerID === chatData.speakerId) );
                if(sensorLocked){
                    optionalData = mergeObject(optionalData, {
                        "dicePoolMod.sensorLockMod": sensorLocked.data.data.value,
                        "switch.isSensorLocked": true,
                    });
                }

                let cumulativeDefense = actor.getFlag("sr5", "cumulativeDefense");
                if(cumulativeDefense !== null) actor.setFlag("sr5", "cumulativeDefense", cumulativeDefense + 1);

                optionalData = mergeObject(optionalData, {
                    chatActionType: "msgTest_attackResistance",
                    damageElement: chatData.damageElement,
                    damageValue: chatData.damageValue,
                    damageValueBase: chatData.damageValue,
                    damageType: chatData.damageType,
                    ammoType: chatData.ammoType,
                    incomingPA: chatData.incomingPA,
                    incomingFiringMode: chatData.firingModeDefenseMod,
                    cumulativeDefense: cumulativeDefense,
                    hits: chatData.test.hits,
                    cover: cover,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                    "activeDefenses.dodge": actorData.skills?.gymnastics?.rating.value || 0,
                    "activeDefenses.block": actorData.skills?.unarmedCombat?.rating.value  || 0,
                    "activeDefenses.parryClubs": actorData.skills?.clubs?.rating.value  || 0,
                    "activeDefenses.parryBlades": actorData.skills?.blades?.rating.value  || 0,
                });
                break;

            case "weapon":
                title = `${game.i18n.localize("SR5.AttackWith")} ${item.name}`;
                dicePool = itemData.weaponSkill.dicePool;
                limit = itemData.accuracy.value;
                let limitType = "accuracy";
                if (itemData.category === "grenade") {
                    limit = actorData.limits.physicalLimit.value;
                    limitType = "physicalLimit";
                }
                typeSub = itemData.category;
                testType = "opposedTest";
                rollType = "attack";

                // Recoil Compensation calculation
                let recoilCompensation = actorData.recoilCompensation.value;
                if (actor.data.type !== "actorDrone") recoilCompensation += itemData.recoilCompensation.value;
                let cumulativeRecoil = actor.getFlag("sr5", "cumulativeRecoil") || 0;
                recoilCompensation -= cumulativeRecoil;

                //let rangeModifier = 0;
                let rangeValue = 0;
                // Get actor and target position and calcul range modifiers
                if (canvas.scene){
                    // Get attacker position
                    let attacker = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    // Get target position
                    let target;
                    if (game.user.targets.size) {
                        const targeted = game.user.targets;
                        const targets = Array.from(targeted);
                        for (let t of targets) {
                            target = t._validPosition;
                        }
                    } else { target = 0;}
                    if (itemData.category === "grenade"|| itemData.type === "grenadeLauncher" || itemData.type === "missileLauncher") {
                        typeSub = "grenade";
                        target = SR5_SystemHelpers.getTemplateItemPosition(entity.id); 
                        optionalData = mergeObject(optionalData, {
                            "button.removeTemplate": true,
                        });
                    }
                    // Calcul distance between Attacker and Target
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(attacker, target);

                    if (itemData.category === "meleeWeapon") {
                        optionalData = mergeObject(optionalData, {attackerReach: itemData.reach.value,});
                        if (distance > (itemData.reach.value + 1)) ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                        sceneEnvironmentalMod = SR5_DiceHelper.handleEnvironmentalModifiers(activeScene, actorData, true);
                    } else { 
                        // Handle weapon ranged based on distance
                        if (distance < itemData.range.short.value) rangeValue = 0;
                        else if (distance < itemData.range.medium.value) rangeValue = 1;
                        else if (distance < itemData.range.long.value) rangeValue = 2;
                        else if (distance < itemData.range.extreme.value) rangeValue = 3;
                        else if (distance > itemData.range.extreme.value) {
                            if (itemData.category === "grenade"|| itemData.type === "grenadeLauncher" || itemData.type === "missileLauncher"){
                                SR5_RollMessage.removeTemplate(null, item.id)
                            }
                            ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                            return;
                        }
                        sceneEnvironmentalMod = SR5_DiceHelper.handleEnvironmentalModifiers(activeScene, actorData, false);
                    }
                }

                optionalData = mergeObject(optionalData, {
                    limiteType: limitType,
                    damageValue: itemData.damageValue.value,
                    damageValueBase: itemData.damageValue.value,
                    damageType: itemData.damageType,
                    damageElement: itemData.damageElement,
                    incomingPA: itemData.armorPenetration.value,
                    targetRange: rangeValue,
                    rc: recoilCompensation,
                    "dicePoolMod.environmentalSceneMod": sceneEnvironmentalMod,
                });
                break;

            case "spell":
                let spellCategory = itemData.category;
                typeSub = itemData.subCategory;
                title = `${game.i18n.localize("SR5.CastSpell")} ${item.name}`;
                dicePool = actorData.skills.spellcasting.spellCategory[spellCategory].dicePool;
                
                optionalData = {
                    "drainMod.spell": itemData.drainModifier,
                    drainType: "stun",
                    damageType: itemData.damageType,
                    damageElement: itemData.damageElement,
                    spellType: itemData.type,
                    limitType: "force",
                    force: actorData.specialAttributes.magic.augmented.value,
                    actorMagic: actorData.specialAttributes.magic.augmented.value,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                }
                if (itemData.range === "area"){
                    optionalData = mergeObject(optionalData, {
                        "button.placeTemplate": true,
                    });
                }
                break;

            case "preparation":
                title = `${game.i18n.localize("SR5.PreparationUse")}${game.i18n.localize("SR5.Colons")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                limit = itemData.force;
                typeSub = itemData.subCategory;

                optionalData = {
                    damageType: itemData.damageType,
                    damageElement: itemData.damageElement,
                    spellType: itemData.type,
                    force: itemData.force,
                    "sceneData.backgroundCount" : backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                }
                if (itemData.range === "area"){
                    optionalData = mergeObject(optionalData, {
                        "button.placeTemplate": true,
                    });
                }
                break;

            case "preparationFormula":
                title = `${game.i18n.localize("SR5.PreparationCreate")}${game.i18n.localize("SR5.Colons")} ${item.name}`;
                dicePool = actorData.skills.alchemy.test.dicePool;
                optionalData = {
                    "switch.specialization": true,
                    "drainMod.spell": itemData.drainModifier,
                    drainType: "stun",
                    force: actorData.specialAttributes.magic.augmented.value,
                    actorMagic: actorData.specialAttributes.magic.augmented.value,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                }
                break;

            case "complexForm":
                title = `${game.i18n.localize("SR5.Thread")} ${item.name}`;
                dicePool = actorData.matrix.resonanceActions.threadComplexForm.test.dicePool;                
                for (let e of itemData.systemEffects){
                    if (e.value === "sre_ResonanceSpike") typeSub = "resonanceSpike";
                }
                optionalData = {
                    fadingModifier: itemData.fadingModifier,
                    fadingType: "stun",
                    level: actorData.specialAttributes.resonance.augmented.value,
                    actorResonance: actorData.specialAttributes.resonance.augmented.value,
                    defenseAttribute: itemData.defenseAttribute,
                    defenseMatrixAttribute: itemData.defenseMatrixAttribute,
                    "dicePoolMod.matrixNoiseScene": sceneNoise,
                    "dicePoolMod.matrixNoiseReduction": actorData.matrix.attributes.noiseReduction.value,
                }

                if (actorData.matrix.userGrid === "public"){
                    optionalData = mergeObject(optionalData, {
                        "switch.publicGrid": true,
                    });
                }
                break;
            
            case "complexFormDefense":
                title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${chatData.item.name} (${chatData.hits})`;
                let defenseAttribute;
                let defenseMatrixAttribute;

                if (actor.type === "actorSpirit"){
                    return;
                } else if (actor.type === "actorDevice" || actor.type === "actorSprite") {
                    defenseAttribute = actorData.matrix.deviceRating;
                    defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                } else {
                    if (actorData.attributes[chatData.defenseAttribute]){
                        defenseAttribute = actorData.attributes[chatData.defenseAttribute].augmented.value;
                        defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                    } else {
                        if (actor.type === "actorDrone" && actorData.slaved && actor.data.flags.sr5?.vehicleControler !== undefined) {
                            defenseAttribute = actor.data.flags.sr5.vehicleControler.data.attributes[chatData.defenseAttribute].augmented.value;
                            defenseMatrixAttribute = actor.data.flags.sr5.vehicleControler.data.matrix.attributes[chatData.defenseMatrixAttribute].value
                        } else {
                            defenseAttribute = actorData.matrix.deviceRating;
                            defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                        }
                    }
                }
                dicePool = defenseAttribute + defenseMatrixAttribute;
                typeSub = chatData.typeSub;
                optionalData = {
                    hits: chatData.test.hits,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
                break;

            case "power":
                title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                if (itemData.defenseFirstAttribute && itemData.defenseSecondAttribute){
                    optionalData = {
                        defenseFirstAttribute: itemData.defenseFirstAttribute || 0,
                        defenseSecondAttribute: itemData.defenseSecondAttribute || 0,
                        "sceneData.backgroundCount": backgroundCount,
                        "sceneData.backgroundAlignement": backgroundAlignement,
                    }
                }
                break;

            case "powerDefense":
                if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return;
                title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${chatData.item.name}`;
                let firstAttribute, secondAttribute;
                if (chatData.defenseFirstAttribute === "edge" || chatData.defenseFirstAttribute === "magic" || chatData.defenseFirstAttribute === "resonance"){
                    firstAttribute = actorData.specialAttributes[chatData.defenseFirstAttribute].augmented.value;
                } else {
                    firstAttribute = actorData.attributes[chatData.defenseFirstAttribute].augmented.value;
                }
                if (chatData.defenseSecondAttribute === "edge" || chatData.defenseecondAttribute === "magic" || chatData.defenseSecondAttribute === "resonance"){
                    secondAttribute = actorData.specialAttributes[chatData.defenseSecondAttribute].augmented.value;
                } else {
                    secondAttribute = actorData.attributes[chatData.defenseSecondAttribute].augmented.value;
                }
                dicePool = firstAttribute + secondAttribute;
                optionalData = {
                    hits: chatData.test.hits,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                }
                break;
            
            case "spritePower":
                title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                limit = actorData.matrix.attributes[itemData.testLimit].value;
                optionalData = {
                    defenseAttribute: itemData.defenseAttribute,
                    defenseMatrixAttribute: itemData.defenseMatrixAttribute,
                }
                break;
            
            case "vehicleTest":
                title = `${game.i18n.localize("SR5.VehicleTest")}`;
                dicePool = actorData.vehicleTest.test.dicePool;
                limit = actorData.vehicleTest.limit.value;
                break;

            case "activeSensorTargeting":
                title = `${game.i18n.localize("SR5.SensorTargeting")}`;
                dicePool = actorData.skills.perception.test.dicePool;
                limit = actorData.skills.perception.limit.value;
                break;

            case "activeSensorDefense":
                title = `${game.i18n.localize("SR5.SensorDefense")}`;
                if (actor.type === "actorDrone"){
                    dicePool = actorData.skills.sneaking.test.dicePool;
                    limit = actorData.skills.sneaking.limit.value;
                } else {
                    dicePool = actorData.skills.sneaking.test.dicePool;
                    limit = actorData.limits.physicalLimit.value;
                }

                optionalData = {
                    originalActionAuthor: chatData.originalActionAuthor,
                    hits: chatData.test.hits,
                }
                break;
                
            case "eraseMark":
                title = `${game.i18n.localize("SR5.MarkResistance")}`;                
                dicePool = chatData.dicePool;
                optionalData = {
                    markOwner: chatData.markOwner,
                    markeditem: chatData.markeditem,
                    hits: chatData.test.hits,
                }
                break;
            default:
        }

        let dialogData = {
            title: title,
            actor: actor.toObject(false),
            lists: actor.data.lists,
            speakerActor: speakerActor,
            speakerId: speakerId,
            speakerImg: speakerImg,
            dicePool: dicePool,
            dicePoolMod: {},
            limit: limit,
            limitMod: {},
            type: rollType,
            typeSub: typeSub,
            testType: testType,
            button: {},
            originalMessage: originalMessage,
        };

        if (item) {
            dialogData = mergeObject(dialogData, {
                item: item.toObject(false),
            });
        }

        mergeObject(dialogData, optionalData);
        SR5_Dice.prepareRollDialog(dialogData);
    }
}