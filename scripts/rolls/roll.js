// Test d'attribut simple
import { SR5 } from "../config.js";
import { SR5_Dice } from "./dice.js";
import { SR5_RollMessage } from "./roll-message.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import AbilityTemplate from "../interface/canvas-template.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";

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
            cumulativeDefense,
            limit,
            limitType,
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
            calledShot = {
                "name": "",
                "location": "",
                "initiative": "",
                "effects": {},
                "limitDV": 0,
            },
            calledShotEffect,
            originalMessage,
            effectsList,
            spiritHelp,
            canUseReagents = false,
            canBeExtended = true,
            dicePoolComposition = [],
            rulesMatrixGrid = false,
            rulesCalledShot = false,
            targetActor,
            firstAttribute, secondAttribute, damageValueBase;

            if (entity.documentName === "Actor") {           
            actor = entity;
            actorData = entity.system;
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
            matrixAction = actorData.matrix?.actions[rollKey];
            resonanceAction = actorData.matrix?.resonanceActions[rollKey];
            if (actor.type !== "actorDevice"){ 
                skill = actorData.skills[rollKey];
                //calcul penalties
                if(actorData.penalties){
                    penalties = actorData.penalties.condition.actual.value + actorData.penalties.matrix.actual.value + actorData.penalties.magic.actual.value + actorData.penalties.special.actual.value;
                }
            }
        }

        if (entity.documentName === "Item"){
            item = entity;
            itemData = entity.system;
            actor = item.actor;
            actorData = actor.system;
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
        }

        if (canvas.scene) {
            activeScene = game.scenes.active;
            sceneNoise = -activeScene.getFlag("sr5", "matrixNoise") || 0;
            backgroundAlignement = activeScene.getFlag("sr5", "backgroundCountAlignement") || "";
            if (backgroundAlignement === actorData.magic?.tradition) backgroundCount = 0;
            else backgroundCount = activeScene.getFlag("sr5", "backgroundCountValue") || 0;
        }

        if (chatData) originalMessage = chatData.originalMessage;
        //Reagents
        if ((actor.type === "actorPc" || actor.type === "actorGrunt") && actorData.magic.reagents > 0) canUseReagents = true;
        //System rules
        if (game.settings.get("sr5", "sr5CalledShotsRules")) rulesCalledShot = true;
        if (game.settings.get("sr5", "sr5MatrixGridRules")) rulesMatrixGrid = true;

        switch (rollType){
            case "attribute":
                if (actor.type === "actorDrone") title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.vehicleAttributes[rollKey])}`;
                else title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.allAttributes[rollKey])}`;
                dicePool = actorData.attributes[rollKey]?.augmented.value;
                if (dicePool === undefined) dicePool = actorData.specialAttributes[rollKey].augmented.value;
                dicePoolComposition = ([{source: game.i18n.localize(SR5.allAttributes[rollKey]), type: game.i18n.localize("SR5.LinkedAttribute"), value: dicePool},]);
                optionalData = {
                    "lists.characterAttributes": actor.system.lists.characterAttributes,
                    "lists.vehicleAttributes": actor.system.lists.vehicleAttributes,
                    "lists.extendedInterval": actor.system.lists.extendedInterval,
                    "switch.attribute": true,
                    "switch.penalty": true,
                    "switch.extended": canBeExtended,
                    penaltyValue: penalties,
                }
                break;

            case "languageSkill":
            case "knowledgeSkill":
                title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + item.name}`;
                dicePool = itemData.value;
                itemData.modifiers.unshift({source: item.name, type: game.i18n.localize("SR5.SkillRating"), value: itemData.base});
                dicePoolComposition = itemData.modifiers;
                optionalData = {
                    "switch.specialization": true,
                    "switch.extended": canBeExtended,
                    "lists.extendedInterval": actor.system.lists.extendedInterval,
                }
                break;

            case "skill":
            case "skillDicePool":
                if (actor.type === "actorDrone") {
                    if (actorData.controlMode === "autopilot") title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.vehicleAttributes[skill.linkedAttribute])}`;
                    else title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey])}`;
                } else title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.allAttributes[skill.linkedAttribute])}`;
                
                if (rollType === "skill") {
                    title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey])}`;
                    dicePool = actorData.skills[rollKey].rating.value;
                    dicePoolComposition = actorData.skills[rollKey].rating.modifiers;
                    optionalData = mergeObject(optionalData, {
                        hasTarget: true,
                        effectsList: effectsList,
                        "switch.attribute": true,
                        attributeKey: actorData.skills[rollKey].linkedAttribute,
                        "switch.penalty": true,
                        penaltyValue: penalties,
                        "lists.characterAttributes": actor.system.lists.characterAttributes,
                        "lists.characterSpecialAttributes": actor.system.lists.characterSpecialAttributes,
                        "lists.vehicleAttributes": actor.system.lists.vehicleAttributes,
                    });
                } else {
                    dicePool = actorData.skills[rollKey].test.dicePool;
                    dicePoolComposition = actorData.skills[rollKey].test.modifiers;
                }
                
                typeSub = rollKey;
                limit = skill.limit.value;

                //Switch management
                switch (typeSub) {
                    case "counterspelling":
                    case "binding":
                    case "banishing":
                    case "summoning":
                    case "disenchanting":
                        optionalData = mergeObject(optionalData, {
                            actorMagic: actorData.specialAttributes.magic.augmented.value,
                            actorTradition: actorData.magic.tradition,
                            elements: actorData.magic.elements,
                            "lists.spiritTypes": actor.system.lists.spiritTypes,
                            force: actorData.specialAttributes.magic.augmented.value,
                        });
                        canBeExtended = false;
                        break;
                    default:
                        canUseReagents = false;
                }

                optionalData = mergeObject(optionalData, {
                    "switch.extended": canBeExtended,
                    "lists.extendedInterval": actor.system.lists.extendedInterval,
                    "lists.perceptionTypes": actor.system.lists.perceptionTypes,
                    "switch.specialization": true,
                    "switch.canUseReagents": canUseReagents,
                    limitType: skill.limit.base,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                });

                if (chatData?.opposedSkillTest) {
                    optionalData = mergeObject(optionalData, {
                        opposedSkillTest : true,
                        opposedSkillThreshold: chatData.hits,
                        "switch.extended": false,
                    });

                    if (chatData.opposedSkillTestType === "etiquette"){
                        title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize("SR5.Charisma") + " (" + chatData.hits + ")"}`;
                        dicePool = actorData.skills[rollKey].rating.value + actorData.attributes.charisma.augmented.value;
                        limit = actorData.limits.socialLimit.value;
                        dicePoolComposition = ([
                            {source: game.i18n.localize("SR5.Charisma"), type: game.i18n.localize("SR5.LinkedAttribute"), value: actorData.attributes.charisma.augmented.value},
                            {source: game.i18n.localize("SR5.SkillPerception"), type: game.i18n.localize("SR5.Skill"), value: actorData.skills[rollKey].rating.value },
                        ]);
                        optionalData = mergeObject(optionalData, {limitType : "socialLimit",});
                    }

                    if (chatData.opposedSkillTestType === "leadership"){
                        title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize("SR5.Willpower") + " (" + chatData.hits + ")"}`;
                        dicePool = actorData.skills[rollKey].rating.value + actorData.attributes.willpower.augmented.value;
                        dicePoolComposition = ([
                            {source: game.i18n.localize("SR5.Willpower"), type: game.i18n.localize("SR5.LinkedAttribute"), value: actorData.attributes.willpower.augmented.value},
                            {source: game.i18n.localize("SR5.SkillPerception"), type: game.i18n.localize("SR5.Skill"), value: actorData.skills[rollKey].rating.value },
                        ]);
                    }

                    if (chatData.opposedSkillTestType === "intimidation" || chatData.opposedSkillTestType === "performance"){
                        title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize("SR5.Charisma") + " + " + game.i18n.localize("SR5.Willpower") + " (" + chatData.hits + ")"}`;
                        dicePool = actorData.skills[rollKey].rating.value + actorData.attributes.willpower.augmented.value;
                        dicePoolComposition = ([
                            {source: game.i18n.localize("SR5.Willpower"), type: game.i18n.localize("SR5.LinkedAttribute"), value: actorData.attributes.willpower.augmented.value},
                            {source: game.i18n.localize("SR5.Charisma"), type: game.i18n.localize("SR5.LinkedAttribute"), value: actorData.attributes.charisma.augmented.value},
                        ]);
                        limit = 0;
                        optionalData = mergeObject(optionalData, {
                            limitType : null,
                            "switch.specialization": false,
                        });
                    }

                    if (chatData.opposedSkillTestType === "impersonation") title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.allAttributes[skill.linkedAttribute])  + " (" + chatData.hits + ")"}`;
                    if (chatData.opposedSkillTestType === "negociation") title = `${game.i18n.localize("SR5.OpposedTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.skills[rollKey]) + " + " + game.i18n.localize(SR5.allAttributes[skill.linkedAttribute])  + " (" + chatData.hits + ")"}`;
                }

                if (typeSub === "perception") optionalData = mergeObject(optionalData, {"lists.perceptionModifiers": actor.system.lists.perceptionModifiers,});

                if (game.user.targets.size && (typeSub === "counterspelling" || typeSub === "binding" || typeSub === "banishing" || typeSub === "disenchanting" || typeSub === "firstAid" || typeSub === "medecine")){
                    if (game.user.targets.size === 0) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetChooseOne")}`);
                    else if (game.user.targets.size > 1) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetTooMany")}`);
                    else {
                        targetActor = await SR5_Roll.getTargetedActor();
                        
                        //Counterspell 
                        if (typeSub === "counterspelling"){
                            effectsList = targetActor.items.filter(i => i.type === "itemSpell" && i.system.isActive);
                            let currentEffectList = targetActor.items.filter(i => i.type === "itemEffect" && i.system.type === "itemSpell");
                            for (let e of Object.values(currentEffectList)){
                                let parentItem = await fromUuid(e.system.ownerItem);
                                if (effectsList.length === 0) effectsList.push(parentItem);
                                else {
                                    let itemAlreadyIn = effectsList.find((i) => i.id === parentItem.id);
                                    if (!itemAlreadyIn) effectsList.push(parentItem);
                                }
                            }
                            if (effectsList.length !== 0){
                                optionalData = mergeObject(optionalData, {
                                    hasTarget: true,
                                    effectsList: effectsList,
                                });
                            }
                        }

                        //Binding
                        if (typeSub === "binding"){
                            if (targetActor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);
                            if (targetActor.system.isBounded) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_SpiritAlreadyBounded")}`);
                            limit = targetActor.system.force.value;
                            optionalData = mergeObject(optionalData, {
                                hasTarget: true,
                                targetActor: targetActor.id,
                            });
                        }

                        //Banishing
                        if (typeSub === "banishing"){
                            if (targetActor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);
                            optionalData = mergeObject(optionalData, {
                                hasTarget: true,
                                targetActor: targetActor.id,
                            });
                        }

                        //Disenchanting
                        if (typeSub === "disenchanting"){
                            effectsList = targetActor.items.filter(i => (i.type === "itemFocus" && i.system.isActive) || i.type === "itemPreparation");
                            if (effectsList.length !== 0){
                                optionalData = mergeObject(optionalData, {
                                    hasTarget: true,
                                    effectsList: effectsList,
                                });
                            }
                        }

                        //First Aid
                        if (typeSub === "firstAid" || typeSub === "medecine"){
                            let isEmergedOrAwakened = targetActor.system.specialAttributes.magic.augmented.value > 0 ? true :
                                targetActor.system.specialAttributes.resonance.augmented.value > 0 ? true :
                                false;
                            optionalData = mergeObject(optionalData, {
                                hasTarget: true,
                                targetEssence: targetActor.system.essence.value,
                                isEmergedOrAwakened: isEmergedOrAwakened,
                                targetActor: targetActor.id,
                            });
                        }
                    }
                }

                if (typeSub === "astralCombat"){
                    if (!actorData.visions.astral.isActive) return ui.notifications.info(`${game.i18n.format("SR5.INFO_ActorIsNotInAstral", {name:actor.name})}`);
                    optionalData = mergeObject(optionalData, {
                        damageValue: actorData.magic.astralDamage.value,
                        damageValueBase: actorData.magic.astralDamage.value,
                        "lists.damageTypes": actor.system.lists.damageTypes,
                        "switch.extended": false,
                        "switch.chooseDamageType": true,
                    });
                }
                break;

            case "resistance":
                let subKey = rollKey.split("_").pop();
                let resistanceKey = rollKey.split("_").shift();
                switch (resistanceKey){
                    case "physicalDamage":
                        dicePool = actorData.resistances.physicalDamage.dicePool;
                        dicePoolComposition = actorData.resistances.physicalDamage.modifiers;
                        title = game.i18n.localize(SR5.characterResistances.physicalDamage);
                        break;
                    case "directSpellMana":
                        dicePool = actorData.resistances.directSpellMana.dicePool;
                        dicePoolComposition = actorData.resistances.directSpellMana.modifiers;
                        title = game.i18n.localize(SR5.characterResistances.directSpellMana);
                        break;
                    case "directSpellPhysical":
                        dicePool = actorData.resistances.directSpellPhysical.dicePool;
                        dicePoolComposition = actorData.resistances.directSpellPhysical.modifiers;
                        title = game.i18n.localize(SR5.characterResistances.directSpellPhysical);
                        break;
                    case "toxin":
                        dicePool = actorData.resistances.toxin[subKey].dicePool;
                        dicePoolComposition = actorData.resistances.toxin[subKey].modifiers;
                        title = game.i18n.localize(SR5.characterResistances.toxin) + " (" + game.i18n.localize(SR5.propagationVectors[subKey]) + ")";
                        break;
                    case "disease":
                        dicePool = actorData.resistances.disease[subKey].dicePool;
                        dicePoolComposition = actorData.resistances.disease[subKey].modifiers;
                        title = game.i18n.localize(SR5.characterResistances.disease) + " (" + game.i18n.localize(SR5.propagationVectors[subKey]) + ")";
                        break;
                    case "specialDamage":
                        dicePool = actorData.resistances.specialDamage[subKey].dicePool;
                        dicePoolComposition = actorData.resistances.specialDamage[subKey].modifiers;
                        title = game.i18n.localize(SR5.characterResistances.specialDamage) + " (" + game.i18n.localize(SR5.specialDamageTypes[subKey]) + ")";
                        break;
                    default:
                        SR5_SystemHelpers.srLog(1, `Unknown '${resistanceKey}' Damage Resistance Type in roll`);
                }
                break;
            
            case "resistanceCard":
            case "resistanceCardAura":
            case "fatiguedCard":
                title = game.i18n.localize("SR5.TakeOnDamageShort");
                damageValueBase = chatData.damageValue;

                //Special case for fatigued called shot
                if (rollType === "fatiguedCard") {
                    damageValueBase = chatData.damageValueFatiguedBase;
                    chatData.damageType = "stun";
                    rollType = "resistanceCard";
                    chatData.damageResistanceType = "fatiguedDamage";
                }

                //Special case for Aura
                if (rollType === "resistanceCardAura") {
                    let auraOwner = SR5_EntityHelpers.getRealActorFromID(chatData.energeticAuraOwner);
                    damageValueBase = auraOwner.system.specialAttributes.magic.augmented.value * 2;
                    chatData.incomingPA = -auraOwner.system.specialAttributes.magic.augmented.value;
                    chatData.damageElement = auraOwner.system.specialProperties.energyAura;
                    if (chatData.damageElement === "fire") chatData.fireTreshold = auraOwner.system.specialAttributes.magic.augmented.value;
                }
                if (chatData.damageIsContinuating) damageValueBase = chatData.damageOriginalValue;

                //handle distance between defenser and explosive device
                if (chatData.isGrenade){
                    let grenadePosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.itemId);          
                    let defenserPosition = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(grenadePosition, defenserPosition);
                    let modToDamage = distance * (chatData.damageFallOff || 0);
                    damageValueBase = chatData.damageValueBase + modToDamage;
                    if (damageValueBase <= 0 && chatData.damageElement !== "toxin") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                    if (modToDamage === 0) ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistance", {distance:distance})}`);
                    else ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistanceFallOff", {distance:distance, modifiedDamage: modToDamage, finalDamage: damageValueBase})}`);
                }

                switch (chatData.damageResistanceType){
                    case "physicalDamage":
                        title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${damageValueBase})`; //TODO: add details
                        typeSub = "physicalDamage";
                        let armor, modifiedArmor, resistanceValue, armorComposition = [];

                        switch (actor.type){
                            case "actorDrone":                           
                                if (chatData.damageElement === "toxin") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToToxin")}`);     
                                armor = actorData.attributes.armor.augmented.value;
                                resistanceValue = actorData.resistances.physicalDamage.dicePool - armor;
                                modifiedArmor = armor + (chatData.incomingPA || 0);
                                if (modifiedArmor < 0) modifiedArmor = 0;
                                if (damageValueBase < (armor + chatData.incomingPA)) return ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: armor + chatData.incomingPA, damage:damageValueBase})}`);
                                if (chatData.damageType === "stun") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
                                break;
                            case "actorSpirit":
                                if (chatData.damageElement === "toxin") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToToxin")}`);
                                armor = actorData.essence.value * 2;
                                modifiedArmor = armor + (chatData.incomingPA || 0);
                                if (modifiedArmor < 0) modifiedArmor = 0
                                if (damageValueBase < (armor + chatData.incomingPA)) return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: armor, pa: chatData.incomingPA, damage: damageValueBase})}`);
                                resistanceValue = actorData.resistances.physicalDamage.dicePool;
                                break;
                            case "actorPc":
                            case "actorGrunt":
                                armor = actorData.itemsProperties.armor.value;
                                armorComposition = actorData.itemsProperties.armor.modifiers;
                                if (chatData.damageElement) {
                                    if (chatData.damageElement === "toxin"){
                                        let toxinType;
                                        let vectors = [];
                                        for (let [key, value] of Object.entries(chatData.toxin.vector)){
                                            if (value) {
                                                toxinType = key;
                                                vectors.push(key);
                                            }
                                        }
                                        if (vectors.length > 1) toxinType = await SR5_DiceHelper.chooseToxinVector(vectors);
                                        armor = actorData.itemsProperties.armor.toxin[toxinType].value;
                                        modifiedArmor = armor + (chatData.toxin.penetration || 0);
                                        if (modifiedArmor < 0) modifiedArmor = 0;
                                        armorComposition = actorData.itemsProperties.armor.toxin[toxinType].modifiers;
                                        resistanceValue = actorData.resistances.toxin[toxinType].dicePool - armor;
                                        dicePoolComposition = actorData.resistances.toxin[toxinType].modifiers.filter((el) => !armorComposition.includes(el));
                                        title = `${game.i18n.localize("SR5.TakeOnDamageShort")} ${game.i18n.localize(SR5.toxinTypes[chatData.toxin.type])}`;
                                        damageValueBase = chatData.toxin.power;
                                        optionalData = mergeObject(optionalData, {
                                            isToxin: true,
                                            toxin: chatData.toxin,
                                        })
                                    } else {
                                        let element = chatData.damageElement;
                                        armor += actorData.itemsProperties.armor.specialDamage[element].value;
                                        modifiedArmor = armor + (chatData.incomingPA || 0);
                                        if (modifiedArmor < 0) modifiedArmor = 0
                                        armorComposition = armorComposition.concat(actorData.itemsProperties.armor.specialDamage[element].modifiers);
                                        resistanceValue = actorData.resistances.specialDamage[element].dicePool - armor;
                                        dicePoolComposition = actorData.resistances.specialDamage[element].modifiers.filter((el) => !armorComposition.includes(el));
                                    }
                                } else {
                                    modifiedArmor = armor + (chatData.incomingPA || 0);
                                    if (modifiedArmor < 0) modifiedArmor = 0
                                    resistanceValue = actorData.resistances.physicalDamage.dicePool - armor;
                                    dicePoolComposition = actorData.resistances.physicalDamage.modifiers.filter((el) => !armorComposition.includes(el));
                                }
                                if (damageValueBase < (armor + chatData.incomingPA) && !chatData.damageElement && chatData.calledShot.name !== "splittingDamage"){
                                    chatData.damageType = "stun";
                                    title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${damageValueBase})`; //TODO: add details
                                    ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDVSoStun", {armor: armor + chatData.incomingPA, damage:damageValueBase})}`); 
                                }
                                break;
                            default:
                        }

                        if (chatData.calledShot?.name === "splittingDamage" && (actor.type === "actorPc" || actor.type === "actorSpirit")) {
                            title = `${game.i18n.localize("SR5.TakeOnDamage")} (${damageValueBase}${game.i18n.localize('SR5.DamageTypeStunShort')}/${game.i18n.localize('SR5.DamageTypePhysicalShort')})`;
                        }

                        dicePool = resistanceValue + armor;
                        optionalData = {
                            attackerId: chatData.attackerId,
                            incomingPA: chatData.incomingPA,
                            armor: armor,
                            armorComposition: armorComposition,
                            ammoType: chatData.ammoType,
                            calledShot: chatData.calledShot,
                            originalActionUser: chatData.originalActionUser,
                            targetActorType: chatData.targetActorType,
                            attackerStrength: chatData.attackerStrength,
                            damageValueBase: damageValueBase,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                            dicePoolBase: resistanceValue + armor,
                            damageContinuous: chatData.damageContinuous,
                            damageIsContinuating: chatData.damageIsContinuating,
                            damageOriginalValue: chatData.damageOriginalValue,
                            previousHits: chatData.hits,
                            hits: chatData.test.hits,
                        }
                        if (chatData.damageSource === "spell") optionalData = mergeObject(optionalData,{damageSource: "spell",});
                        if (chatData.fireTreshold) optionalData = mergeObject(optionalData,{fireTreshold: chatData.fireTreshold,});
                        if (chatData.damageElement === "toxin") optionalData = mergeObject(optionalData, {toxin: chatData.toxin,});
                        if (chatData.continuousDamageId) optionalData = mergeObject(optionalData, {continuousDamageId: chatData.continuousDamageId,});
                        break;

                    case "directSpellMana":       
                        if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToManaSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
                        title = `${game.i18n.localize("SR5.ResistanceTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterResistances[chatData.damageResistanceType])} (${damageValueBase})`;
                        dicePool = actorData.resistances[chatData.damageResistanceType].dicePool;
                        dicePoolComposition = actorData.resistances[chatData.damageResistanceType].modifiers;
                        typeSub = "spellDamage";
                        optionalData = {
                            damageValueBase: damageValueBase,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                        }
                        break;
                    
                    case "directSpellPhysical":
                        if (actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToPhysicalSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
                        title = `${game.i18n.localize("SR5.ResistanceTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterResistances[chatData.damageResistanceType])} (${damageValueBase})`;
                        dicePool = actorData.resistances[chatData.damageResistanceType].dicePool;
                        dicePoolComposition = actorData.resistances[chatData.damageResistanceType].modifiers;
                        typeSub = "manaSpellDamage";
                        optionalData = {
                            damageValueBase: damageValueBase,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                        }
                        break;

                    case "biofeedback":
                        dicePool = actorData.matrix.resistances.biofeedback.dicePool;
                        dicePoolComposition = actorData.matrix.resistances.biofeedback.modifiers;
                        typeSub = "biofeedbackDamage";
                        title = `${game.i18n.localize("SR5.ResistBiofeedbackDamage")} (${damageValueBase})`;
                        let damageType;
                        if (chatData.blackout) {
                            damageType = "stun";
                        } else {
                            if (actorData.matrix.userMode === "coldsim") damageType = "stun";
                            else if (actorData.matrix.userMode === "hotsim") damageType = "physical";
                        }
                        optionalData = {
                            damageType: damageType,
                            damageValueBase: damageValueBase,
                        }
                        if (chatData.buttons.defenderDoBiofeedbackDamage){
                            optionalData = mergeObject(optionalData, {
                                defenderDoBiofeedbackDamage: true,
                            });
                        }
                        break;

                    case "dumpshock":
                        dicePool = actorData.matrix.resistances.dumpshock.dicePool;
                        dicePoolComposition = actorData.matrix.resistances.dumpshock.modifiers;
                        typeSub = "dumpshock";
                        title = `${game.i18n.localize("SR5.ResistDumpshock")} (6)`;
                        let dumpshockType;
                        if (actorData.matrix.userMode === "coldsim") dumpshockType = "stun";
                        else if (actorData.matrix.userMode === "hotsim") dumpshockType = "physical";
                        optionalData = {
                            damageType: dumpshockType,
                            damageValueBase: 6,
                        }
                        break;
                    
                    case "astralDamage":
                        dicePool = actorData.resistances.astralDamage.dicePool;
                        dicePoolComposition = actorData.resistances.astralDamage.modifiers;
                        typeSub = "astralDamage";
                        title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${damageValueBase})`;
                        optionalData = {
                            damageValueBase: damageValueBase,
                            damageType: chatData.damageType,
                        }
                        break;
                    
                    case "fatiguedDamage":
                        title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${damageValueBase})`; //TODO: add details
                        typeSub = "physicalDamage";
                        dicePool = actorData.resistances.physicalDamage.dicePool - actorData.itemsProperties.armor.value;
                        dicePoolComposition = actorData.resistances.physicalDamage.modifiers.filter((el) => !actorData.itemsProperties.armor.modifiers.includes(el));
                        optionalData = {
                            damageValueBase: damageValueBase,
                            damageType: chatData.damageType,
                            dicePoolBase: dicePool,
                            hits: chatData.test.hits,
                            isFatiguedCard: true,
                        }
                        break;

                    default:
                        SR5_SystemHelpers.srLog(1, `Unknown '${chatData.damageResistanceType}' Damage Resistance Type in roll`);
                }
                break;

            case "derivedAttribute":
                title = `${game.i18n.localize("SR5.DerivedAttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.characterDerivedAttributes[rollKey])}`;
                dicePool = actorData.derivedAttributes[rollKey].dicePool;
                dicePoolComposition = actorData.derivedAttributes[rollKey].modifiers;
                break;

            case "lift":
                title = `${game.i18n.localize("SR5.CarryingTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.weightActions[rollKey])}`;
                dicePool = actorData.weightActions[rollKey].test.dicePool;
                dicePoolComposition = actorData.weightActions[rollKey].test.modifiers;
                typeSub = rollKey;
                optionalData = {
                    derivedBaseValue: actorData.weightActions[rollKey].baseWeight.value,
                    derivedExtraValue: actorData.weightActions[rollKey].extraWeight.value
                }
                break;

            case "movement":
                title = `${game.i18n.localize("SR5.MovementTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.movements[rollKey])}`;
                dicePool = actorData.movements[rollKey].test.dicePool;
                dicePoolComposition = actorData.movements[rollKey].test.modifiers;
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
                    unit: unit,
                }
                break;

            case "resistFire":
                title = `${game.i18n.localize("SR5.TryToNotCatchFire")} (${chatData.fireTreshold})`
                dicePool = actorData.itemsProperties.armor.value + actorData.itemsProperties.armor.specialDamage.fire.value + chatData.incomingPA;
                dicePoolComposition = actorData.itemsProperties.armor.specialDamage.fire.modifiers.concat(actorData.itemsProperties.armor.modifiers);
                let armored = actorData.itemsProperties.armor.value + actorData.itemsProperties.armor.specialDamage.fire.value;
                optionalData = {
                    armor: armored,
                    incomingPA: chatData.incomingPA,
                    fireTreshold: chatData.fireTreshold,
                    dicePoolBase: actorData.itemsProperties.armor.value + actorData.itemsProperties.armor.specialDamage.fire.value,
                    dicePoolComposition: dicePoolComposition,
                }
                break;

            case "matrixIceAttack":
                title = `${game.i18n.localize("SR5.IceAttack")}`;
                dicePool = actorData.matrix.ice.attackDicepool;
                limit = actorData.matrix.attributes.attack.value;
                optionalData = {
                    typeSub: actorData.matrix.deviceSubType,
                    matrixDamageValue: actorData.matrix.attributes.attack.value,
                    defenseFirstAttribute: actorData.matrix.ice.defenseFirstAttribute,
                    defenseSecondAttribute: actorData.matrix.ice.defenseSecondAttribute,
                }
                break
            
            case "iceDefense":
                if (actor.type !== "actorPc" && actor.type !== "actorGrunt") return ui.notifications.warn(game.i18n.localize('SR5.WARN_InvalidActorType'));
                title = game.i18n.localize("SR5.Defense");
                let iceFirstAttribute, iceSecondAttribute;
                iceFirstAttribute = actorData.attributes[chatData.defenseFirstAttribute].augmented.value || 0;
                iceSecondAttribute = actorData.matrix.attributes[chatData.defenseSecondAttribute].value || 0;
                dicePoolComposition = ([
                    {source: game.i18n.localize(SR5.allAttributes[chatData.defenseFirstAttribute]), type: game.i18n.localize('SR5.LinkedAttribute'), value: iceFirstAttribute},
                    {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseSecondAttribute]), type: game.i18n.localize('SR5.MatrixAttribute'), value: iceSecondAttribute},
                ]);
                dicePool = iceFirstAttribute + iceSecondAttribute;
                let deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive);

                optionalData = {
                    hits: chatData.test.hits,
                    iceType: chatData.typeSub,
                    originalActionActor: chatData?.originalActionActor,
                    matrixDamageValueBase: chatData.matrixDamageValue,
                    mark: chatData?.mark,
                    defenseFull: actorData.specialProperties.fullDefenseValue || 0,
                    matrixTargetItemUuid: deck.uuid,
                }
                break;

            case "matrixAction":
                title = `${game.i18n.localize("SR5.MatrixActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`;
                dicePool = matrixAction.test.dicePool;
                dicePoolComposition = matrixAction.test.modifiers;
                limit = matrixAction.limit.value;
                typeSub = rollKey;

                if (actorData.matrix.userGrid === "public") optionalData = mergeObject(optionalData, {"switch.publicGrid": true,});
                
                //Check target's Marks before rolling if a target is selected.
                if (game.user.targets.size) {
                    const targeted = game.user.targets;
                    const cibles = Array.from(targeted);
                    for (let t of cibles) {
                        optionalData = mergeObject(optionalData, {targetGrid: t.actor.system.matrix.userGrid,});
                        if (matrixAction.neededMarks > 0){
                            let listOfMarkedItem = t.actor.items.map(i => i.system.marks);
                            listOfMarkedItem = listOfMarkedItem.filter(i => i !== undefined);
                            let markItem;
                            for (let i of listOfMarkedItem){
                                markItem = i.find(m => m.ownerId === speakerId);
                                if (markItem) break;
                            }
                            if (markItem === undefined || markItem?.value < matrixAction.neededMarks) {
                                ui.notifications.info(game.i18n.localize("SR5.NotEnoughMarksOnTarget"));
                                return;
                            }
                        }
                    }
                }

                optionalData = mergeObject(optionalData, {
                    limitType: matrixAction.limit.linkedAttribute,
                    matrixActionType: matrixAction.limit.linkedAttribute,
                    overwatchScore: matrixAction.increaseOverwatchScore,
                    matrixNoiseRange: "wired",
                    matrixNoiseScene: sceneNoise + actorData.matrix.noise.value,
                    "switch.specialization": true,
                    rulesMatrixGrid: rulesMatrixGrid,
                    "lists.gridTypes": actor.system.lists.gridTypes,
                });
                
                if (typeSub === "dataSpike") optionalData = mergeObject(optionalData, {matrixDamageValueBase: actorData.matrix.attributes.attack.value,});
                break;

            case "matrixSimpleDefense":
                title = `${game.i18n.localize("SR5.MatrixDefenseTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`;
                dicePool = matrixAction.defense.dicePool;
                dicePoolComposition = matrixAction.defense.modifiers;
                typeSub = rollKey;
                optionalData = {defenseFull: actorData.specialProperties.fullDefenseValue || 0,}
            break;

            case "matrixDefense":
                if (actor.type === "actorSpirit") return;
                title = `${game.i18n.localize("SR5.MatrixDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[rollKey])} (${chatData.test.hits})`;
                dicePool = matrixAction.defense.dicePool;
                dicePoolComposition = matrixAction.defense.modifiers,
                typeSub = rollKey;

                //Handle item targeted
                if (chatData.matrixTargetDevice && chatData.matrixTargetDevice !== "device"){
                    let targetItem = actor.items.find(i => i.id === chatData.matrixTargetDevice);
                    if (!targetItem.system.isSlavedToPan){
                        title = `${targetItem.name} - ${game.i18n.localize("SR5.MatrixDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.matrixRolledActions[rollKey])} (${chatData.test.hits})`;
                        dicePool = targetItem.system.deviceRating * 2 || 0;
                        dicePoolComposition = ([
                            {source: game.i18n.localize("SR5.DeviceRating"), type: game.i18n.localize('SR5.LinkedAttribute'), value: targetItem.system.deviceRating},
                            {source: game.i18n.localize("SR5.DeviceRating"), type: game.i18n.localize('SR5.LinkedAttribute'), value: targetItem.system.deviceRating},
                        ]);
                    } else {
                        let panMaster = SR5_EntityHelpers.getRealActorFromID(targetItem.system.panMaster);
                        let panMasterDefense = panMaster.system.matrix.actions[rollKey].defense.dicePool;
                        if (targetItem.system.deviceRating * 2 > panMasterDefense){
                            dicePool = targetItem.system.deviceRating;
                            dicePoolComposition = ([
                                {source: game.i18n.localize("SR5.DeviceRating"), type: game.i18n.localize('SR5.LinkedAttribute'), value: targetItem.system.deviceRating},
                                {source: game.i18n.localize("SR5.DeviceRating"), type: game.i18n.localize('SR5.LinkedAttribute'), value: targetItem.system.deviceRating},
                            ]);
                        } else {
                            dicePool = panMasterDefense;
                            dicePoolComposition = panMaster.system.matrix.actions[rollKey].defense.modifiers;
                        }
                    }
                    optionalData = mergeObject(optionalData, {matrixTargetItemUuid: targetItem.uuid,});  
                } else {
                    let deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive);
                    optionalData = mergeObject(optionalData, {matrixTargetItemUuid: deck.uuid,});
                }

                optionalData = mergeObject(optionalData, {
                    matrixActionType: matrixAction.limit.linkedAttribute,
                    overwatchScore: matrixAction.increaseOverwatchScore,
                    hits: chatData?.test.hits,
                    originalActionActor: chatData?.originalActionActor,
                    mark: chatData?.mark,
                    defenseFull: actorData.specialProperties?.fullDefenseValue || 0,
                });
                break;

            case "matrixResistance":
                title = `${game.i18n.localize("SR5.TakeOnDamageMatrix")} (${chatData.matrixDamageValue})`;
                dicePool = actorData.matrix.resistances[rollKey].dicePool;
                dicePoolComposition = actorData.matrix.resistances[rollKey].modifiers;
                if (chatData.matrixTargetItemUuid){
                    let matrixTargetItem = await fromUuid(chatData.matrixTargetItemUuid);
                    if (matrixTargetItem.system.type !== "baseDevice" && matrixTargetItem.system.type !== "livingPersona" && matrixTargetItem.system.type !== "headcase"){ 
                        title = `${matrixTargetItem.name}: ${game.i18n.localize("SR5.TakeOnDamageShort")} (${chatData.matrixDamageValue})`;
                        dicePool = matrixTargetItem.system.deviceRating * 2;
                        dicePoolComposition = ([
                            {source: game.i18n.localize("SR5.DeviceRating"), type: game.i18n.localize('SR5.LinkedAttribute'), value: matrixTargetItem.system.deviceRating},
                            {source: game.i18n.localize("SR5.DeviceRating"), type: game.i18n.localize('SR5.LinkedAttribute'), value: matrixTargetItem.system.deviceRating},
                        ]);
                    }
                    optionalData = mergeObject(optionalData, {
                        matrixTargetItemUuid: chatData.matrixTargetItemUuid,
                    }); 
                }

                optionalData = mergeObject(optionalData, {
                    matrixDamageValue: chatData.matrixDamageValue,
                    matrixDamageValueBase: chatData.matrixDamageValue,
                    damageType: chatData.damageType,
                    originalActionActor: chatData.originalActionActor,
                });
                break;

            case "resonanceAction":
                title = `${game.i18n.localize("SR5.ResonanceActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.resonanceActions[rollKey])}`;
                dicePool = resonanceAction.test.dicePool;
                dicePoolComposition = resonanceAction.test.modifiers;
                limit = resonanceAction.limit?.value;
                typeSub = rollKey;
            
                optionalData = {
                    matrixActionType: resonanceAction.limit?.linkedAttribute,
                    overwatchScore: resonanceAction.increaseOverwatchScore,
                    actorResonance: actorData.specialAttributes.resonance.augmented.value,
                    level: actorData.specialAttributes.resonance.augmented.value,
                    "lists.spriteTypes": actor.system.lists.spriteTypes,
                    "switch.specialization": true,
                }

                if (game.user.targets.size && (typeSub === "killComplexForm" || typeSub === "decompileSprite" || typeSub === "registerSprite")){
                    if (game.user.targets.size === 0) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetChooseOne")}`);
                    else if (game.user.targets.size > 1) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetTooMany")}`);
                    else {
                        targetActor = await SR5_Roll.getTargetedActor();

                        //Kill Complex Form
                        if (typeSub === "killComplexForm"){
                            effectsList = targetActor.items.filter(i => i.type === "itemComplexForm" && i.system.isActive);
                            let currentEffectList = targetActor.items.filter(i => i.type === "itemEffect" && i.system.type === "itemComplexForm");
                            for (let e of Object.values(currentEffectList)){
                                let parentItem = await fromUuid(e.system.ownerItem);
                                if (effectsList.length === 0) effectsList.push(parentItem);
                                else {
                                    let itemAlreadyIn = effectsList.find((i) => i.id === parentItem.id);
                                    if (!itemAlreadyIn) effectsList.push(parentItem);
                                }
                            }
                            if (effectsList.length !== 0){
                                optionalData = mergeObject(optionalData, {
                                    hasTarget: true,
                                    effectsList: effectsList,
                                });
                            }
                        }

                        //Decompiling / Register
                        if (typeSub === "decompileSprite" || typeSub === "registerSprite"){
                            if (targetActor.type !== "actorSprite") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASprite")}`);
                            optionalData = mergeObject(optionalData, {
                                hasTarget: true,
                                targetActor: targetActor.id,
                            });
                        }
                    }
                }
                break;

            case "fadingCard":
                title = game.i18n.localize("SR5.FadingResistanceTest");
                if (chatData.fadingValue >= 0) title += ` (${chatData.fadingValue})`;
                dicePool = actorData.matrix.resistances.fading.dicePool;
                dicePoolComposition = actorData.matrix.resistances.fading.modifiers;
                if (chatData.hits > actorData.specialAttributes.resonance.augmented.value) chatData.fadingType = "physical";
                optionalData = {
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
                dicePoolComposition = actorData.magic.drainResistance.modifiers;
                if (chatData.hits > actorData.specialAttributes.magic.augmented.value) chatData.drainType = "physical";
                optionalData = {
                    drainValue: chatData.drainValue,
                    drainType: chatData.drainType,
                    actorMagic: chatData.actorMagic,
                    hits: chatData.hits,
                };

                //Centering metamagic
                if (actorData.magic.metamagics.centering) optionalData = mergeObject(optionalData,{"switch.centering": true,});
                break;            

            //TO-DO Refacto this to normal resistanceCard case
            case "accidentCard":
                title = game.i18n.localize("SR5.AccidentResistanceTest");
                if (chatData.accidentValue >= 0) title += ` (${chatData.accidentValue})`;

                let accidentValue = chatData.accidentValue;
                let armor, modifiedArmor, resistanceValue, armorComposition = [];
                switch (actor.type){
                    case "actorDrone":                           
                        armor = actorData.attributes.armor.augmented.value;
                        resistanceValue = actorData.resistances.physicalDamage.dicePool - armor;
                        modifiedArmor = armor + (chatData.incomingPA || 0);
                        if (modifiedArmor < 0) modifiedArmor = 0;
                        if (accidentValue < (armor + chatData.incomingPA)) {
                            ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: armor + chatData.incomingPA, damage:accidentValue})}`); 
                            return;
                        }
                        break;
                    case "actorSpirit":
                        armor = actorData.essence.value * 2;
                        modifiedArmor = armor + (chatData.incomingPA || 0);
                        if (modifiedArmor < 0) modifiedArmor = 0
                        if (accidentValue < (armor + chatData.incomingPA)) {
                            ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: armor, pa: chatData.incomingPA, damage: accidentValue})}`);
                            return;    
                        }
                        resistanceValue = actorData.resistances.physicalDamage.dicePool;
                    break;
                    case "actorPc":
                    case "actorGrunt":
                        armor = actorData.itemsProperties.armor.value;
                        armorComposition = actorData.itemsProperties.armor.modifiers;
                        modifiedArmor = armor + (chatData.incomingPA || 0);
                        if (modifiedArmor < 0) modifiedArmor = 0
                        resistanceValue = actorData.resistances.physicalDamage.dicePool - armor;
                        dicePoolComposition = actorData.resistances.physicalDamage.modifiers.filter((el) => !armorComposition.includes(el));     
                        if (accidentValue < (armor + chatData.incomingPA) && !chatData.damageElement){
                            chatData.damageType = "stun";
                            title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${accidentValue})`; //TODO: add details
                            ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDVSoStun", {armor: armor + chatData.incomingPA, damage:accidentValue})}`); 
                        }
                        break;
                    default:
                }

                dicePool = resistanceValue + modifiedArmor;

                optionalData = {
                    hits: chatData.hits,
                    accidentValue: chatData.accidentValue,
                    damageType: "physical",                    
                    incomingPA: -6,
                    damageElement: "",
                    ammoType: "",
                    armor: armor,
                    armorComposition: armorComposition,
                    actorType: actor.type,
                };
                break;

            case "drain":
                title = game.i18n.localize("SR5.DrainResistanceTest");
                dicePool = actorData.magic.drainResistance.dicePool;
                dicePoolComposition = actorData.magic.drainResistance.modifiers;
                break;

            case "defense":
                title = `${game.i18n.localize("SR5.PhysicalDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterDefenses[rollKey])}`;
                dicePool = actorData.defenses[rollKey].dicePool;
                dicePoolComposition = actorData.defenses[rollKey].modifiers;
                if (rollKey !== "defend") limit = actorData.limits.physicalLimit.value;
                cumulativeDefense = actor.getFlag("sr5", "cumulativeDefense");
                if (cumulativeDefense !== null) actor.setFlag("sr5", "cumulativeDefense", cumulativeDefense + 1);
                optionalData = {
                    cover: true,
                    defenseFull: actorData.specialProperties.fullDefenseValue || 0,
                    cumulativeDefense: cumulativeDefense,
                }
                break;

            case "defenseCard":
                if (actor.type === "actorDevice" || actor.type === "actorSprite") return;
                title = `${game.i18n.localize("SR5.PhysicalDefenseTest")} (${chatData.test.hits})`;
                dicePool = actorData.defenses.defend.dicePool;
                dicePoolComposition = actorData.defenses.defend.modifiers;
                typeSub = chatData.typeSub;
                let cover = true;

                //Handle Suppressive fire
                if (chatData.firingMode === "SF"){
                    dicePool = actorData.attributes.reaction.augmented.value + (actorData.specialAttributes?.edge?.augmented?.value || 0);
                    dicePoolComposition = [
                        {source: game.i18n.localize("SR5.Reaction"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.reaction.augmented.value},
                        {source: game.i18n.localize("SR5.Edge"), type: game.i18n.localize('SR5.LinkedAttribute'), value: (actorData.specialAttributes?.edge?.augmented?.value || 0)},
                    ]
                    cover = false;
                    optionalData = mergeObject(optionalData, {firingMode: "SF",});
                }

                //Handle Melee Weapon modifiers
                if (typeSub === "meleeWeapon"){
                    let reach = (actorData.reach?.value || 0) - chatData.attackerReach;
                    let weaponUsedToDefend = actor.items.find(i => (i.type === "itemWeapon") && (i.system.category === "meleeWeapon") && (i.system.isActive) );
                    if (weaponUsedToDefend) reach = weaponUsedToDefend.system.reach.value - chatData.attackerReach;
                    sceneEnvironmentalMod = SR5_DiceHelper.handleEnvironmentalModifiers(activeScene, actorData, true);
                    optionalData = mergeObject(optionalData, {
                        reach: reach,
                        "dicePoolMod.environmentalSceneMod.value": sceneEnvironmentalMod,
                        "dicePoolMod.environmentalSceneMod.label": game.i18n.localize("SR5.EnvironmentalModifiers"),
                    });
                }

                //Handle Astral combat defense
                if (typeSub === "astralCombat"){
                    if ((actor.type === "actorDevice" || actor.type === "actorSprite") || !actorData.visions.astral.isActive) return ui.notifications.info(`${game.i18n.format("SR5.INFO_TargetIsNotInAstral", {name:actor.name})}`);
                    title = `${game.i18n.localize("SR5.AstralDefenseTest")} (${chatData.test.hits})`;
                    cover = false;
                    dicePool = actorData.magic.astralDefense.dicePool;
                    dicePoolComposition = actorData.magic.astralDefense.modifiers;
                }
                
                //Manage spell area templates
                if (canvas.scene && chatData.type === "spell" && chatData.spellRange === "area"){
                    // Spell position
                    let spellPosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.itemId); 
                    // Get defenser position
                    let defenserPosition = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    // Calcul distance between grenade and defenser
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(spellPosition, defenserPosition);
                    //modify the damage based on distance and damage dropoff.
                    if (chatData.spellArea < distance) return ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                }

                //Spell damage source
                if (chatData.type === "spell"){optionalData = mergeObject(optionalData,{damageSource: "spell",});}

                //Handle calledShot specifics
                if (chatData.calledShot?.name){
                    if (chatData.calledShot.name === "disarm" || chatData.calledShot.name === "knockdown") optionalData = mergeObject(optionalData,{ attackerStrength: chatData.attackerStrength, });
                }

                //Handle sensor locked
                let sensorLocked = actor.items.find(i => (i.type === "itemEffect") && (i.system.type === "sensorLock") && (i.system.ownerID === chatData.speakerId) );
                if(sensorLocked){
                    optionalData = mergeObject(optionalData, {
                        "dicePoolMod.sensorLockMod": sensorLocked.system.value,
                        "switch.isSensorLocked": true,
                    });
                }

                //Handle toxin, if any
                if (chatData.toxin) {
                    if (chatData.toxin.power > 0 && chatData.calledShot.name === "downTheGullet") chatData.toxin.power += 2; 
                    optionalData = mergeObject(optionalData, {toxin: chatData.toxin,});
                }

                //Handle cumulative defense
                cumulativeDefense = actor.getFlag("sr5", "cumulativeDefense");
                if(cumulativeDefense !== null) actor.setFlag("sr5", "cumulativeDefense", cumulativeDefense + 1);

                optionalData = mergeObject(optionalData, {
                    originalActionUser: chatData.originalActionUser,
                    attackerId: chatData.actorId,
                    damageElement: chatData.damageElement,
                    damageValue: chatData.damageValue,
                    damageValueBase: chatData.damageValue,
                    damageType: chatData.damageType,
                    ammoType: chatData.ammoType,
                    calledShot: chatData.calledShot,
                    targetActorType: chatData.targetActorType,
                    incomingPA: chatData.incomingPA,
                    firingMode: chatData.firingMode,
                    incomingFiringMode: chatData.firingModeSelected,
                    cumulativeDefense: cumulativeDefense,
                    hits: chatData.test.hits,
                    cover: cover,
                    defenseFull: actorData.specialProperties.fullDefenseValue || 0,
                    "activeDefenses.dodge": actorData.skills?.gymnastics?.rating.value || 0,
                    "activeDefenses.block": actorData.skills?.unarmedCombat?.rating.value  || 0,
                    "activeDefenses.parryClubs": actorData.skills?.clubs?.rating.value  || 0,
                    "activeDefenses.parryBlades": actorData.skills?.blades?.rating.value  || 0,
                    damageContinuous: chatData.damageContinuous,
                    damageOriginalValue: chatData.damageOriginalValue,
                });
                break;

            case "weapon":
                title = `${game.i18n.localize("SR5.AttackWith")} ${item.name}`;
                dicePool = itemData.weaponSkill.dicePool;
                dicePoolComposition = itemData.weaponSkill.modifiers;
                limit = itemData.accuracy.value;
                limitType = "accuracy";
                if (itemData.category === "grenade") {
                    limit = actorData.limits.physicalLimit.value;
                    limitType = "physicalLimit";
                }
                typeSub = itemData.category;
                testType = "opposedTest";
                rollType = "attack";

                //Handle type of weapons for Called Shots
                if (itemData.type === "unarmed" || itemData.type === "exoticMeleeWeapon" || itemData.type === "exoticRangedWeapon"){                    
                    optionalData = mergeObject(optionalData, {typeWeapon: itemData.type,})
                }

                //Handle Martial Arts for Called Shots 
                if (actor.items.find((item) => item.type === "itemMartialArt")) {
                    let martialArts = actor.items.filter(i => i.type === "itemMartialArt" && i.system.isActive && i.system.calledShot !== "");
                    if (martialArts.length){
                        for (let m of martialArts){
                            if (m.system.calledShot === "pin") calledShot = mergeObject(calledShot, {"martialArtPin": true,});
                            if (m.system.calledShot === "disarm") calledShot = mergeObject(calledShot, {"martialArtDisarm": true,});
                            if (m.system.calledShot === "entanglement") calledShot = mergeObject(calledShot, {"martialArtEntanglement": true,});
                            if (m.system.calledShot === "breakWeapon") calledShot = mergeObject(calledShot, {"martialArtBreakWeapon": true,});
                            if (m.system.calledShot === "feint") calledShot = mergeObject(calledShot, {"martialArtFeint": true,});
                        }
                    }
                }

                //Recoil Compensation calculation
                let recoilCompensation = actorData.recoilCompensation.value;
                if (actor.type !== "actorDrone") recoilCompensation += itemData.recoilCompensation.value;
                let cumulativeRecoil = actor.getFlag("sr5", "cumulativeRecoil") || 0;
                recoilCompensation -= cumulativeRecoil;

                //Handle Targets & range
                let rangeValue = "short";
                //Get actor and target position and calcul range modifiers
                if (canvas.scene){
                    //Get attacker position
                    let attacker = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    //Handle Targets
                    let target;
                    if (game.user.targets.size) {
                        //For now, only allow one target for attack;
                        if (game.user.targets.size > 1) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetTooMany")}`);
                        //Get target actor type
                        targetActor = await SR5_Roll.getTargetedActor();
                        optionalData = mergeObject(optionalData, {
                            targetActorType: targetActor.type,
                            targetActorId: targetActor.id,
                        });
                        //Get target position
                        const targeted = game.user.targets;
                        const targets = Array.from(targeted);
                        for (let t of targets) {
                            target = {
                                x: t.x,
                                y: t.y,
                            };
                        }
                    } else { target = 0;}
                    //Add specific data for grenade & missile
                    if (itemData.category === "grenade"|| itemData.type === "grenadeLauncher" || itemData.type === "missileLauncher") {
                        typeSub = "grenade";
                        target = SR5_SystemHelpers.getTemplateItemPosition(entity.id); 
                        optionalData = mergeObject(optionalData, {
                            "templateRemove": true,
                            "isGrenade": true,
                            "damageFallOff": itemData.blast.damageFallOff,
                            "blastRadius": itemData.blast.radius,
                        });
                    }
                    //Calcul distance between Attacker and Target
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(attacker, target);
                    //Handle Melee specifics
                    if (itemData.category === "meleeWeapon") {
                        optionalData = mergeObject(optionalData, {
                            attackerReach: itemData.reach.value,
                            attackerStrength: actor.system.attributes.strength.augmented.value,
                        });
                        if (distance > (itemData.reach.value + 1)) ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                        sceneEnvironmentalMod = SR5_DiceHelper.handleEnvironmentalModifiers(activeScene, actorData, true);
                    } else { 
                    // Handle weapon ranged based on distance
                        if (distance < itemData.range.short.value) rangeValue = "short";
                        else if (distance < itemData.range.medium.value) rangeValue = "medium";
                        else if (distance < itemData.range.long.value) rangeValue = "long";
                        else if (distance < itemData.range.extreme.value) rangeValue = "extreme";
                        else if (distance > itemData.range.extreme.value) {
                            if (itemData.category === "grenade"|| itemData.type === "grenadeLauncher" || itemData.type === "missileLauncher") SR5_RollMessage.removeTemplate(null, item.id)
                            return ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                        }
                        sceneEnvironmentalMod = SR5_DiceHelper.handleEnvironmentalModifiers(activeScene, actorData, false);
                    }
                }

                optionalData = mergeObject(optionalData, {
                    originalActionUser: game.user.id,
                    limiteType: limitType,
                    damageValue: itemData.damageValue.value,
                    damageValueBase: itemData.damageValue.value,
                    damageType: itemData.damageType,
                    damageElement: itemData.damageElement,
                    incomingPA: itemData.armorPenetration.value,
                    targetRange: rangeValue,
                    rc: recoilCompensation,
                    actorRecoil: actorData.recoilCompensation.value,
                    actorRecoilCumulative: actor.flags.sr5.cumulativeRecoil,
                    ammoType: itemData.ammunition.type,
                    ammoValue: itemData.ammunition.value,
                    ammoMax: itemData.ammunition.max,
                    calledShot: calledShot,
                    rulesCalledShot: rulesCalledShot,                 
                    "dicePoolMod.environmentalSceneMod.value": sceneEnvironmentalMod,
                    "dicePoolMod.environmentalSceneMod.label": game.i18n.localize("SR5.EnvironmentalModifiers"),
                    "firingMode.singleShot": itemData.firingMode.singleShot,
                    "firingMode.semiAutomatic": itemData.firingMode.semiAutomatic,
                    "firingMode.burstFire": itemData.firingMode.burstFire,
                    "firingMode.fullyAutomatic": itemData.firingMode.fullyAutomatic,
                    "range.short": itemData.range.short.value,
                    "range.medium": itemData.range.medium.value,
                    "range.long": itemData.range.long.value,
                    "range.extreme": itemData.range.extreme.value,
                    weaponRecoil: itemData.recoilCompensation.value,
                });

                if (itemData.damageElement === "toxin") optionalData = mergeObject(optionalData, {toxin: itemData.toxin,});

                //Special case for engulf
                if (itemData.systemEffects.length){
                    for (let e of Object.values(itemData.systemEffects)){
                        if (e.value === "engulfWater" || e.value === "engulfFire" || e.value === "engulfAir" || e.value === "engulfEarth") {
                            optionalData = mergeObject(optionalData, {
                                damageContinuous: true,
                                damageOriginalValue: itemData.damageValue.value,
                            });
                        }
                    }
                }

                //Special case for Energy aura and melee weapon
                if (actorData.specialProperties.energyAura){
                    optionalData = mergeObject(optionalData, {
                        damageValue: itemData.damageValue.value + actorData.specialAttributes.magic.augmented.value,
                        damageValueBase: itemData.damageValue.value + actorData.specialAttributes.magic.augmented.value,
                        incomingPA: -actorData.specialAttributes.magic.augmented.value,
                        damageElement: actorData.specialProperties.energyAura,
                    });
                    if (actorData.specialProperties.energyAura !== "electricity" ) optionalData = mergeObject(optionalData, {damageType: "physical",});
                }
                break;

            case "astralWeapon":
                title = `${game.i18n.localize("SR5.AstralAttackWith")} ${item.name}`;
                dicePool = itemData.weaponSkill.dicePool;
                dicePoolComposition = itemData.weaponSkill.modifiers;

                optionalData = mergeObject(optionalData, {
                    limiteType: "accuracy",
                    limit: itemData.accuracy.value, 
                    damageValue: itemData.damageValue.value,
                    damageValueBase: itemData.damageValue.value,
                    "switch.extended": false,
                    "switch.chooseDamageType": true,
                    "switch.specialization": true,
                    "lists.damageTypes": actor.system.lists.damageTypes,
                    type: "skillDicePool",
                    typeSub: "astralCombat",
                });
                break;

            case "spell":
                let spellCategory = itemData.category;
                typeSub = itemData.subCategory;
                title = `${game.i18n.localize("SR5.CastSpell")} ${item.name}`;
                dicePool = actorData.skills.spellcasting.spellCategory[spellCategory].dicePool;
                dicePoolComposition =  actorData.skills.spellcasting.spellCategory[spellCategory].modifiers;
                
                optionalData = {
                    "drainMod.spell.value": itemData.drain.value,
                    "drainMod.spell.label": game.i18n.localize("SR5.DrainModifier"),
                    drainType: "stun",
                    damageType: itemData.damageType,
                    damageElement: itemData.damageElement,
                    spellType: itemData.type,
                    spellCategory: itemData.category,
                    spellResisted: itemData.resisted,
                    spellRange: itemData.range,
                    limitType: "force",
                    force: actorData.specialAttributes.magic.augmented.value,
                    actorMagic: actorData.specialAttributes.magic.augmented.value,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                    "switch.canUseReagents": canUseReagents,
                    "switch.specialization": true,
                    itemUuid: item.uuid,
                }
                if (itemData.range === "area"){
                    optionalData = mergeObject(optionalData, {"templatePlace": true,});
                    //Spell Shaping metamagic
                    if (actorData.magic.metamagics.spellShaping) optionalData = mergeObject(optionalData, {"switch.spellShaping": true,});
                }

                if (!itemData.resisted){
                    //Check if an effect is transferable on taget actor and give the necessary infos
                    for (let e of Object.values(itemData.customEffects)){
                        if (e.transfer) {
                            optionalData = mergeObject(optionalData, {
                                "itemUuid": item.uuid,
                                "switch.transferEffect": true,
                            });
                        }
                    }

                    //Check if an effect is transferable on target item and give the necessary infos
                    for (let e of Object.values(itemData.itemEffects)){
                        if (e.transfer) {
                            optionalData = mergeObject(optionalData, {
                                "itemUuid": item.uuid,
                                "switch.transferEffectOnItem": true,
                            });
                        }
                    }
                }

                //Check if an object can resist to spell
                for (let e of Object.values(itemData.systemEffects)){
                    if (e.value === "sre_ObjectResistance"){
                        optionalData = mergeObject(optionalData, {
                            "itemUuid": item.uuid,
                            "switch.objectResistanceTest": true,
                        });
                    }
                }

                //Check if a spirit can aid sorcery
                spiritHelp = actor.items.find(i => (i.type === "itemSpirit" && i.system.isBounded && i.system.spellType === itemData.category && i.system.services.value > 0));
                if (spiritHelp){
                    optionalData = mergeObject(optionalData, {
                        "spiritAidId": spiritHelp.uuid,
                        "spiritAidMod": spiritHelp.system.itemRating,
                        "switch.spiritAid": true,
                    });
                }
                break;

            case "resistSpell":
                let spellItem = await fromUuid(chatData.itemUuid);
                let spellData = spellItem.system;
                title = `${game.i18n.localize("SR5.ResistSpell")}${game.i18n.localize("SR5.Colons")} ${spellItem.name}`;
                firstAttribute = actorData.attributes[spellData.defenseFirstAttribute].augmented.value;
                secondAttribute = actorData.attributes[spellData.defenseSecondAttribute].augmented.value;
                dicePoolComposition = ([
                    {source: game.i18n.localize(SR5.allAttributes[spellData.defenseFirstAttribute]), type: game.i18n.localize('SR5.LinkedAttribute'), value: firstAttribute},
                    {source: game.i18n.localize(SR5.allAttributes[spellData.defenseSecondAttribute]), type: game.i18n.localize('SR5.LinkedAttribute'), value: secondAttribute},
                ]);
                dicePool = firstAttribute + secondAttribute;

                optionalData = {
                    hits: chatData.test.hits,
                    itemUuid: chatData.itemUuid,
                }

                //Check if an effect is transferable on taget actor and give the necessary infos
                for (let e of Object.values(spellData.customEffects)){
                    if (e.transfer) {
                        optionalData = mergeObject(optionalData, {
                            "itemUuid": spellItem.uuid,
                            "switch.transferEffect": true,
                        });
                    }
                }

                //Check if an effect is transferable on target item and give the necessary infos
                for (let e of Object.values(spellData.itemEffects)){
                    if (e.transfer) {
                        optionalData = mergeObject(optionalData, {
                            "itemUuid": spellItem.uuid,
                            "switch.transferEffectOnItem": true,
                        });
                    }
                }
                break;

            case "ritual":
                if (!canUseReagents) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NoReagents")}`);
                title = `${game.i18n.localize("SR5.PerformRitual")} ${item.name}`;
                if (itemData.spellLinkedType !== ""){
                    dicePool = actorData.skills.ritualSpellcasting.spellCategory[itemData.spellLinkedType].dicePool;
                    dicePoolComposition = actorData.skills.ritualSpellcasting.spellCategory[itemData.spellLinkedType].modifiers;
                } else {
                    dicePool = actorData.skills.ritualSpellcasting.test.dicePool;
                    dicePoolComposition = actorData.skills.ritualSpellcasting.test.modifiers;
                }

                optionalData = {
                    limitType: "force",
                    force: 1,
                    itemUuid: item.uuid,
                    actorMagic: actorData.specialAttributes.magic.augmented.value,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                    "switch.canUseReagents": canUseReagents,
                    "switch.specialization": true,
                }
                break;

            case "preparation":
                title = `${game.i18n.localize("SR5.PreparationUse")}${game.i18n.localize("SR5.Colons")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                dicePoolComposition = itemData.test.modifiers,
                limit = itemData.force;
                typeSub = itemData.subCategory;

                optionalData = {
                    damageType: itemData.damageType,
                    damageElement: itemData.damageElement,
                    spellType: itemData.type,
                    spellCategory: itemData.category,
                    spellResisted: itemData.resisted,
                    force: itemData.force,
                    "sceneData.backgroundCount" : backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                    itemUuid: item.uuid,
                }

                if (itemData.range === "area") optionalData = mergeObject(optionalData, {"templatePlace": true,});

                if (!itemData.resisted){
                    //Check if an effect is transferable on taget actor and give the necessary infos
                    for (let e of Object.values(itemData.customEffects)){
                        if (e.transfer) {
                            optionalData = mergeObject(optionalData, {
                                "itemUuid": item.uuid,
                                "switch.transferEffect": true,
                            });
                        }
                    }

                    //Check if an effect is transferable on target item and give the necessary infos
                    for (let e of Object.values(itemData.itemEffects)){
                        if (e.transfer) {
                            optionalData = mergeObject(optionalData, {
                                "itemUuid": item.uuid,
                                "switch.transferEffectOnItem": true,
                            });
                        }
                    }
                }

                //Check if an object can resist to spell
                for (let e of Object.values(itemData.systemEffects)){
                    if (e.value === "sre_ObjectResistance"){
                        optionalData = mergeObject(optionalData, {
                            "itemUuid": item.uuid,
                            "switch.objectResistanceTest": true,
                        });
                    }
                }
                break;

            case "preparationFormula":
                let alchemicalSpellCategories = itemData.category;
                typeSub = itemData.subCategory;
                title = `${game.i18n.localize("SR5.PreparationCreate")}${game.i18n.localize("SR5.Colons")} ${item.name}`;
                dicePool = actorData.skills.alchemy.spellCategory[alchemicalSpellCategories].dicePool;
                dicePoolComposition = actorData.skills.alchemy.spellCategory[alchemicalSpellCategories].modifiers;

                optionalData = {
                    "switch.specialization": true,
                    "switch.canUseReagents": canUseReagents,
                    "drainMod.spell.value": itemData.drain.value,
                    "drainMod.spell.label": game.i18n.localize("SR5.DrainModifier"),
                    drainType: "stun",
                    force: actorData.specialAttributes.magic.augmented.value,
                    actorMagic: actorData.specialAttributes.magic.augmented.value,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                }

                //Check if a spirit can aid sorcery
                spiritHelp = actor.items.find(i => (i.type === "itemSpirit" && i.system.isBounded && i.system.spellType === itemData.category && i.system.services.value > 0));
                if (spiritHelp){
                     optionalData = mergeObject(optionalData, {
                         "spiritAidId": spiritHelp.uuid,
                         "spiritAidMod": spiritHelp.system.itemRating,
                         "switch.spiritAid": true,
                     });
                 }
                break;

            case "complexForm":
                title = `${game.i18n.localize("SR5.Thread")} ${item.name}`;
                dicePool = actorData.matrix.resonanceActions.threadComplexForm.test.dicePool;                
                dicePoolComposition = actorData.matrix.resonanceActions.threadComplexForm.test.modifiers;
                for (let e of itemData.systemEffects){
                    if (e.value === "sre_ResonanceSpike") typeSub = "resonanceSpike";
                    if (e.value === "sre_Derezz") typeSub = "derezz";
                    if (e.value === "sre_Redundancy") typeSub = "redundancy";
                }
                optionalData = {
                    fadingModifier: itemData.fadingModifier,
                    fadingType: "stun",
                    level: actorData.specialAttributes.resonance.augmented.value,
                    actorResonance: actorData.specialAttributes.resonance.augmented.value,
                    defenseAttribute: itemData.defenseAttribute,
                    defenseMatrixAttribute: itemData.defenseMatrixAttribute,
                    rulesMatrixGrid: rulesMatrixGrid,
                    "lists.gridTypes": actor.system.lists.gridTypes,
                }

                if (actorData.matrix.userGrid === "public") optionalData = mergeObject(optionalData, {"switch.publicGrid": true,});

                //Check if an effect is transferable on taget actor and give the necessary infos
                for (let e of Object.values(itemData.customEffects)){
                    if (e.transfer) {
                        optionalData = mergeObject(optionalData, {
                            "itemUuid": item.uuid,
                            "switch.transferEffect": true,
                        });
                    }
                }

                //Check if an effect is transferable on target item and give the necessary infos
                for (let e of Object.values(itemData.itemEffects)){
                    if (e.transfer) {
                        optionalData = mergeObject(optionalData, {
                            "itemUuid": item.uuid,
                            "switch.transferEffectOnItem": true,
                        });
                    }
                }
                break;
            
            case "complexFormDefense":
                let complexFormItem = await fromUuid(chatData.itemUuid);
                title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${complexFormItem.name} (${chatData.hits})`;
                let defenseAttribute, defenseMatrixAttribute;
                
                if (actor.type === "actorSpirit"){
                    return;
                } else if (actor.type === "actorDevice" || actor.type === "actorSprite") {
                    defenseAttribute = actorData.matrix.deviceRating;
                    defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                    dicePoolComposition = ([
                        {source: game.i18n.localize("SR5.DeviceRating"), type: game.i18n.localize('SR5.LinkedAttribute'), value: defenseAttribute},
                        {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseMatrixAttribute]), type: game.i18n.localize('SR5.MatrixAttribute'), value: defenseMatrixAttribute},
                    ]);
                } else {
                    if (actorData.attributes[chatData.defenseAttribute]){
                        defenseAttribute = actorData.attributes[chatData.defenseAttribute].augmented.value;
                        defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                        dicePoolComposition = ([
                            {source: game.i18n.localize(SR5.allAttributes[chatData.defenseAttribute]), type: game.i18n.localize('SR5.LinkedAttribute'), value: defenseAttribute},
                            {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseMatrixAttribute]), type: game.i18n.localize('SR5.MatrixAttribute'), value: defenseMatrixAttribute},
                        ]);
                    } else {
                        if (actor.type === "actorDrone" && actorData.slaved && actor.flags.sr5?.vehicleControler !== undefined) {
                            defenseAttribute = actor.flags.sr5.vehicleControler.system.attributes[chatData.defenseAttribute].augmented.value;
                            defenseMatrixAttribute = actor.flags.sr5.vehicleControler.system.matrix.attributes[chatData.defenseMatrixAttribute].value;
                            dicePoolComposition = ([
                                {source: game.i18n.localize(SR5.allAttributes[chatData.defenseAttribute]), type: game.i18n.localize('SR5.LinkedAttribute'), value: defenseAttribute},
                                {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseMatrixAttribute]), type: game.i18n.localize('SR5.MatrixAttribute'), value: defenseMatrixAttribute},
                            ]);
                        } else {
                            defenseAttribute = actorData.matrix.deviceRating;
                            defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                            dicePoolComposition = ([
                                {source: game.i18n.localize("SR5.DeviceRating"), type: game.i18n.localize('SR5.LinkedAttribute'), value: defenseAttribute},
                                {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseMatrixAttribute]), type: game.i18n.localize('SR5.MatrixAttribute'), value: defenseMatrixAttribute},
                            ]);
                        }
                    }
                }
                dicePool = defenseAttribute + defenseMatrixAttribute;
                
                typeSub = chatData.typeSub;
                optionalData = {
                    hits: chatData.test.hits,
                    originalActionActor: chatData?.originalActionActor,
                    defenseFull: actorData.specialProperties.fullDefenseValue || 0,
                }

                //Check if an effect is transferable and give the necessary infos
                if (chatData.switch.transferEffect){
                    optionalData = mergeObject(optionalData, {
                        "itemUuid": chatData.itemUuid,
                        "switch.transferEffect": true,
                    });
                }
                break;

            case "power":
            case "adeptPower":
            case "martialArt":
                title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                dicePoolComposition = itemData.test.modifiers;

                optionalData = {
                    "switch.extended": true,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                    "lists.extendedInterval": actor.system.lists.extendedInterval,
                }

                if (itemData.defenseFirstAttribute && itemData.defenseSecondAttribute){
                    optionalData = mergeObject(optionalData, {
                        "switch.extended": false,
                        typeSub: "powerWithDefense",
                        defenseFirstAttribute: itemData.defenseFirstAttribute || 0,
                        defenseSecondAttribute: itemData.defenseSecondAttribute || 0,
                        "sceneData.backgroundCount": backgroundCount,
                        "sceneData.backgroundAlignement": backgroundAlignement,
                        "itemUuid": item.uuid,
                    });
                }

                //Check if an effect is transferable on taget actor and give the necessary infos
                for (let e of Object.values(itemData.customEffects)){
                    if (e.transfer) {
                        optionalData = mergeObject(optionalData, {
                            "switch.transferEffect": true,
                        });
                    }
                }

                //Add drain roll if needed
                if (rollType === "adeptPower" && itemData.hasDrain){
                    optionalData = mergeObject(optionalData, {
                        "hasDrain": true,
                        "drainValue": itemData.drainValue.value,
                    });
                }

                //Special power cases
                if (itemData.systemEffects.length){
                    for (let e of Object.values(itemData.systemEffects)){
                        if (e.value === "paralyzingHowl") {optionalData = mergeObject(optionalData, {isParalyzingHowl: true,});}
                        if (e.value === "regeneration") {optionalData = mergeObject(optionalData, {
                            isRegeneration: true,
                            actorBody: actorData.attributes?.body?.augmented.value,
                        });}
                    }
                }
                break;

                case "martialArtDefense":
                    let firstLabel, secondLabel, firstType, secondType;
                    let martialArtItem = await fromUuid(chatData.itemUuid);
                    if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return;
                    title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${martialArtItem.name}`;
                    
                    if (Object.keys(SR5.characterAttributes).find(e => e === chatData.defenseFirstAttribute)){
                        firstAttribute = actorData.attributes[chatData.defenseFirstAttribute].augmented.value;
                        firstLabel = game.i18n.localize(SR5.allAttributes[chatData.defenseFirstAttribute]);
                        firstType = game.i18n.localize('SR5.LinkedAttribute');
                    } else {
                        firstAttribute = actorData.skills[chatData.defenseFirstAttribute].rating.value;
                        firstLabel = game.i18n.localize(SR5.skills[chatData.defenseFirstAttribute]);
                        firstType = game.i18n.localize('SR5.Skill');
                    }
                    if (Object.keys(SR5.characterAttributes).find(e => e === chatData.defenseSecondAttribute)){
                        secondAttribute = actorData.attributes[chatData.defenseSecondAttribute].augmented.value;
                        secondLabel = game.i18n.localize(SR5.allAttributes[chatData.defenseSecondAttribute]);
                        secondType = game.i18n.localize('SR5.LinkedAttribute');
                    } else {
                        secondAttribute = actorData.skills[chatData.defenseSecondAttribute].rating.value;                        
                        secondLabel = game.i18n.localize(SR5.skills[chatData.defenseSecondAttribute]);
                        secondType = game.i18n.localize('SR5.Skill');
                    }

                    dicePoolComposition = ([
                        {source: firstLabel, type: firstType, value: firstAttribute},
                        {source: secondLabel, type: secondType, value: secondAttribute},
                    ]);
                    dicePool = firstAttribute + secondAttribute;
                    optionalData = {
                        hits: chatData.test.hits,
                        defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                    }
    
                    if (chatData.switch?.transferEffect){
                        optionalData = mergeObject(optionalData, {"switch.transferEffect": true,});
                        let martialArtData = martialArtItem.system;
                        //Check if an effect is transferable on taget actor and give the necessary infos
                        for (let e of Object.values(martialArtData.customEffects)){
                            if (e.transfer) {
                                optionalData = mergeObject(optionalData, {
                                    "itemUuid": martialArtItem.uuid,
                                    "switch.transferEffect": true,
                                });
                            }
                        }
                        //Check if an effect is transferable on target item and give the necessary infos
                        for (let e of Object.values(martialArtData.itemEffects)){
                            if (e.transfer) {
                                optionalData = mergeObject(optionalData, {
                                    "itemUuid": martialArtItem.uuid,
                                    "switch.transferEffectOnItem": true,
                                });
                            }
                        }
                    }
                    break;

            case "powerDefense":
                let powerItem = await fromUuid(chatData.itemUuid);
                if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return;
                title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${powerItem.name}`;
                if (chatData.defenseFirstAttribute === "edge" || chatData.defenseFirstAttribute === "magic" || chatData.defenseFirstAttribute === "resonance") firstAttribute = actorData.specialAttributes[chatData.defenseFirstAttribute].augmented.value;
                else firstAttribute = actorData.attributes[chatData.defenseFirstAttribute].augmented.value;
                if (chatData.defenseSecondAttribute === "edge" || chatData.defenseecondAttribute === "magic" || chatData.defenseSecondAttribute === "resonance") secondAttribute = actorData.specialAttributes[chatData.defenseSecondAttribute].augmented.value;
                else secondAttribute = actorData.attributes[chatData.defenseSecondAttribute].augmented.value;
                dicePoolComposition = ([
                    {source: game.i18n.localize(SR5.allAttributes[chatData.defenseFirstAttribute]), type: game.i18n.localize('SR5.LinkedAttribute'), value: firstAttribute},
                    {source: game.i18n.localize(SR5.allAttributes[chatData.defenseSecondAttribute]), type: game.i18n.localize('SR5.LinkedAttribute'), value: secondAttribute},
                ]);
                dicePool = firstAttribute + secondAttribute;
                optionalData = {
                    hits: chatData.test.hits,
                    defenseFull: actorData.specialProperties.fullDefenseValue || 0,
                }

                if (chatData.switch?.transferEffect){
                    optionalData = mergeObject(optionalData, {"switch.transferEffect": true,});
                    let powerItem = await fromUuid(chatData.itemUuid);
                    let powerData = powerItem.system;
                    //Check if an effect is transferable on taget actor and give the necessary infos
                    for (let e of Object.values(powerData.customEffects)){
                        if (e.transfer) {
                            optionalData = mergeObject(optionalData, {
                                "itemUuid": powerItem.uuid,
                                "switch.transferEffect": true,
                            });
                        }
                    }
                    //Check if an effect is transferable on target item and give the necessary infos
                    for (let e of Object.values(powerData.itemEffects)){
                        if (e.transfer) {
                            optionalData = mergeObject(optionalData, {
                                "itemUuid": powerItem.uuid,
                                "switch.transferEffectOnItem": true,
                            });
                        }
                    }
                }

                //Special case for Paralyzing Howl
                if (chatData.isParalyzingHowl){
                    dicePool = firstAttribute + secondAttribute + actorData.itemsProperties.armor.specialDamage.sound.value;
                    dicePoolComposition = dicePoolComposition.concat(actorData.itemsProperties.armor.specialDamage.sound.modifiers);
                }
                break;
            
            case "spritePower":
                title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                dicePoolComposition = itemData.test.modifiers;
                limit = actorData.matrix.attributes[itemData.testLimit].value;
                optionalData = {
                    defenseAttribute: itemData.defenseAttribute,
                    defenseMatrixAttribute: itemData.defenseMatrixAttribute,
                }
                break;
            
            case "vehicleTest":
                title = `${game.i18n.localize("SR5.VehicleTest")}`;
                dicePool = actorData.vehicleTest.test.dicePool;
                dicePoolComposition = actorData.vehicleTest.test.modifiers;
                limit = actorData.vehicleTest.limit.value;
                break;
            
            case "rammingTest":
                title = `${game.i18n.localize("SR5.RammingWith")} ${speakerActor}`;
                dicePool = actorData.rammingTest.test.dicePool;
                dicePoolComposition = actorData.rammingTest.test.modifiers;
                limit = actorData.rammingTest.limit.value;
                typeSub = "ramming";

                let target;
                    if (game.user.targets.size) {
                        const targeted = game.user.targets;
                        const targets = Array.from(targeted);
                        for (let t of targets) {
                            target = t.actor.system.attributes.body.augmented.value;
                        }
                    } else { target = actorData.attributes.body.augmented.value;}

                optionalData = {
                    damageValue: actorData.attributes.body.augmented.value,
                    damageValueBase: actorData.attributes.body.augmented.value,
                    modifiedDamage: actorData.attributes.body.augmented.value,
                    damageType: "physical",                    
                    incomingPA: -6,
                    ammoType: "",
                    damageElement: "",
                    defenseFull: actorData.specialProperties.fullDefenseValue || 0,
                    "activeDefenses.dodge": actorData.skills?.gymnastics?.rating.value || 0,
                    target: target,
                    accidentValue: Math.ceil(target/2),
                };
                break;

            case "rammingDefense":                     
                title = `${game.i18n.localize("SR5.PhysicalDefenseTest")} (${chatData.test.hits})`;
                dicePool = actorData.defenses.defend.dicePool;
                dicePoolComposition = actorData.defenses.defend.modifiers;
                typeSub = chatData.typeSub;
                if (actor.type === "actorDrone"){    
                    limit = actorData.vehicleTest.limit.value;
                } else {
                    limit = actorData.limits.physicalLimit.value;
                }
                optionalData = {
                    attackerId: chatData.actorId,
                    damageValue: chatData.damageValue,
                    damageValueBase: chatData.damageValue,
                    damageType: chatData.damageType,
                    incomingPA: chatData.incomingPA,
                    hits: chatData.test.hits,
                    defenseFull: actorData.specialProperties.fullDefenseValue || 0,
                    "activeDefenses.dodge": actorData.skills?.gymnastics?.rating.value || 0,
                    damageOriginalValue: chatData.damageOriginalValue,
                };
                break;

            case "activeSensorTargeting":
                title = `${game.i18n.localize("SR5.SensorTargeting")}`;
                dicePool = actorData.skills.perception.test.dicePool;
                dicePoolComposition = actorData.skills.perception.test.modifiers;
                limit = actorData.skills.perception.limit.value;
                optionalData = {"lists.targetSignature": actor.system.lists.targetSignature,};
                break;

            case "activeSensorDefense":
                title = `${game.i18n.localize("SR5.SensorDefense")}`;
                dicePool = actorData.skills.sneaking.test.dicePool;
                dicePoolComposition = actorData.skills.sneaking.test.modifiers;
                if (actor.type === "actorDrone") limit = actorData.skills.sneaking.limit.value;
                else limit = actorData.limits.physicalLimit.value;
                optionalData = {
                    originalActionActor: chatData.originalActionActor,
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

            case "decompilingResistance":
                if (actor.type !== "actorSprite") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASprite")}`);
                title = game.i18n.localize("SR5.ResistDecompiling"); 
                dicePool = actorData.level;
                dicePoolComposition = [{source: game.i18n.localize("SR5.Level"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.level}];
                if (actorData.isRegistered) {
                    dicePool += actorData.compilerResonance;
                    dicePoolComposition.push({source: game.i18n.localize("SR5.SpriteCompilerResonance"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.compilerResonance});
                }
                optionalData = {
                    ownerAuthor: chatData.ownerAuthor,
                    hits: chatData.test.hits,
                }
                break;

            case "registeringResistance":
                if (actor.type !== "actorSprite") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASprite")}`);
                title = game.i18n.localize("SR5.ResistRegistering"); 
                dicePool = actorData.level * 2;
                dicePoolComposition = [
                    {source: game.i18n.localize("SR5.Level"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.level},
                    {source: game.i18n.localize("SR5.Level"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.level},
                ];
                optionalData = {
                    ownerAuthor: chatData.ownerAuthor,
                    hits: chatData.test.hits,
                }
                break;

            case "bindingResistance":
                if (actor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);
                title = game.i18n.localize("SR5.ResistBinding");
                dicePool = actorData.force.value * 2;
                dicePoolComposition = [
                    {source: game.i18n.localize("SR5.Force"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.force.value},
                    {source: game.i18n.localize("SR5.Force"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.force.value},
                ];
                optionalData = {
                    ownerAuthor: chatData.ownerAuthor,
                    hits: chatData.test.hits,
                }
                break;
            
            case "banishingResistance":
                if (actor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);
                title = game.i18n.localize("SR5.ResistBanishing");
                dicePool = actorData.force.value;
                dicePoolComposition = [{source: game.i18n.localize("SR5.Force"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.force.value}];
                if (actorData.isBounded) {
                    dicePool += actorData.summonerMagic;
                    dicePoolComposition.push({source: game.i18n.localize("SR5.SpiritSummonerMagic"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.summonerMagic});
                }
                optionalData = {
                    ownerAuthor: chatData.ownerAuthor,
                    hits: chatData.test.hits,
                }
                break;

            case "objectResistance":
                title = game.i18n.localize("SR5.ObjectResistanceTest");
                dicePool = 3;
                optionalData = {
                    hits: chatData.test.hits,
                }
                break;

            case "astralTracking":
                title = game.i18n.localize("SR5.AstralTrackingTest");
                dicePool = actorData.magic.astralTracking.dicePool;
                dicePoolComposition = actorData.magic.astralTracking.modifiers;
                limitType = "astral";
                limit = actorData.limits.astralLimit.value;
                optionalData = {
                    "switch.extended": true,
                    "lists.extendedInterval": actor.system.lists.extendedInterval,
                }
                break;

            case "passThroughBarrier":
                title = game.i18n.localize("SR5.PassThroughBarrierTest");
                dicePool = actorData.magic.passThroughBarrier.dicePool;
                dicePoolComposition = actorData.magic.passThroughBarrier.modifiers;
                limitType = "astral";
                limit = actorData.limits.astralLimit.value;
                break;

            case "passThroughDefense":
                title = game.i18n.localize("SR5.ManaBarrierResistance");
                dicePool = 2;
                optionalData = {
                    hits: chatData.test.hits,
                    manaBarrierRating: 1,
                }
                break;

            case "fear":
                let composureThreshold = 0;
                if (chatData.calledShot.name === "extremeIntimidation") {
                    rollType = "intimidationResistance";
                    composureThreshold = chatData.netHits;
                    chatData.initiativeMod = 10;
                } else if (chatData.calledShot.name === "ricochetShot") {
                    composureThreshold = 2;
                    rollType = "ricochetResistance";
                } else if (chatData.calledShot.name === "warningShot") {
                    composureThreshold = 4;
                    rollType = "warningResistance";
                }
                title = `${game.i18n.localize("SR5.Composure")} (${composureThreshold})`;
                dicePool = actorData.derivedAttributes.composure.dicePool;
                dicePoolComposition = actorData.derivedAttributes.composure.modifiers;
                optionalData = {
                    hits: composureThreshold,
                    calledShot: chatData.calledShot,
                    initiativeMod: chatData.initiativeMod,
                }
                break;

            case "stunned":
                calledShotEffect = chatData.calledShot.effects.find(e => e.name === rollType);
                rollType = "stunnedResistance";
                title = `${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[calledShotEffect.name])})} (${calledShotEffect.threshold})`;
                dicePool = actorData.attributes.body.augmented.value + actorData.attributes.willpower.augmented.value;
                dicePoolComposition = ([
                    {source: game.i18n.localize("SR5.Body"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.body.augmented.value},
                    {source: game.i18n.localize("SR5.Willpower"), type: game.i18n.localize('SR5.LinkedAttribute'), value: (actorData.attributes.willpower.augmented.value)},
                ]);
                optionalData = {
                    hits: calledShotEffect.threshold,
                    initiativeMod: calledShotEffect.initiative,
                }
                break;

            case "buckled":
                calledShotEffect = chatData.calledShot.effects.find(e => e.name === rollType);
                chatData.calledShot.effects = chatData.calledShot.effects.filter(e => e.name === rollType);
                title = `${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[calledShotEffect.name])})} (${chatData.damageValue})`;
                rollType = "buckledResistance";
                dicePool = actorData.attributes.body.augmented.value;
                dicePoolComposition = ([{source: game.i18n.localize("SR5.Body"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.body.augmented.value},]);                   
                optionalData = {
                    hits: chatData.damageValue,
                    calledShot: chatData.calledShot,
                }
                break;

            case "nauseous":
                calledShotEffect = chatData.calledShot.effects.find(e => e.name === rollType);
                chatData.calledShot.effects = chatData.calledShot.effects.filter(e => e.name === rollType);
                title = `${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[calledShotEffect.name])})} (4)`;
                rollType = "nauseousResistance";
                dicePool = actorData.attributes.body.augmented.value + actorData.attributes.willpower.augmented.value;
                dicePoolComposition = ([
                    {source: game.i18n.localize("SR5.Body"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.body.augmented.value},
                    {source: game.i18n.localize("SR5.Willpower"), type: game.i18n.localize('SR5.LinkedAttribute'), value: (actorData.attributes.willpower.augmented.value)},
                ]);
                optionalData = {
                    hits: 4,
                    calledShot: chatData.calledShot,
                }
                break;

            case "knockdown":
                calledShotEffect = chatData.calledShot.effects.find(e => e.name === rollType);
                calledShotEffect.threshold = chatData.damageValue + 3;
                chatData.calledShot.effects = chatData.calledShot.effects.filter(e => e.name === rollType);
                title = `${game.i18n.format('SR5.EffectResistanceTest', {effect: game.i18n.localize(SR5.calledShotsEffects[calledShotEffect.name])})} (${calledShotEffect.threshold})`;
                rollType = "knockdownResistance";
                dicePool = actorData.attributes.strength.augmented.value + actorData.attributes.agility.augmented.value;
                dicePoolComposition = ([
                    {source: game.i18n.localize("SR5.Strength"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.strength.augmented.value},
                    {source: game.i18n.localize("SR5.Agility"), type: game.i18n.localize('SR5.LinkedAttribute'), value: (actorData.attributes.agility.augmented.value)},
                ]);
                optionalData = {
                    hits: calledShotEffect.threshold,
                    calledShot: chatData.calledShot,
                }
                break;
                
            case "escapeEngulf":
                title = game.i18n.localize("SR5.EscapeEngulfAttempt");
                dicePoolComposition = ([
                    {source: game.i18n.localize("SR5.Strength"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.strength.augmented.value},
                    {source: game.i18n.localize("SR5.Body"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.body.augmented.value},
                ]);
                dicePool = actorData.attributes.strength.augmented.value + actorData.attributes.body.augmented.value;
                optionalData = {attackerId: chatData.attackerId,}
                break;

            case "regeneration":
                title = game.i18n.localize("SR5.RegenerationTest");
                dicePoolComposition = ([
                    {source: game.i18n.localize("SR5.Magic"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.specialAttributes.magic.augmented.value},
                    {source: game.i18n.localize("SR5.Body"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.body.augmented.value},
                ]);
                dicePool = actorData.specialAttributes.magic.augmented.value + actorData.attributes.body.augmented.value;
                optionalData = {actorBody: actorData.attributes.body.augmented.value,}
                break;

            case "healing":
                title = `${game.i18n.localize("SR5.NaturalRecoveryTest")} [${game.i18n.localize(SR5.damageTypes[rollKey])}]`;
                if (rollKey === "stun"){
                    dicePoolComposition = ([
                        {source: game.i18n.localize("SR5.Body"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.body.augmented.value},
                        {source: game.i18n.localize("SR5.Willpower"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.willpower.augmented.value},
                    ]);
                    dicePool = actorData.attributes.body.augmented.value + actorData.attributes.willpower.augmented.value;
                } else {
                    dicePoolComposition = ([
                        {source: game.i18n.localize("SR5.Body"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.body.augmented.value},
                        {source: game.i18n.localize("SR5.Body"), type: game.i18n.localize('SR5.LinkedAttribute'), value: actorData.attributes.body.augmented.value},
                    ]);
                    dicePool = actorData.attributes.body.augmented.value + actorData.attributes.body.augmented.value;
                }
                optionalData = {
                    "lists.extendedInterval": actor.system.lists.extendedInterval,
                    "switch.extended": true,
                    typeSub: rollKey,
                }
                break;

            default:
                SR5_SystemHelpers.srLog(3, `Unknown ${rollType} roll type in 'actorRoll()'`);
        }

        //Sort alphabeticaly the dice pool composition
        dicePoolComposition = await SR5_DiceHelper.sortDicePoolComposition(dicePoolComposition);

        let dialogData = {
            title: title,
            actorId: speakerId,
            actorType: actor.type,
            speakerActor: speakerActor,
            speakerId: speakerId,
            speakerImg: speakerImg,
            dicePool: dicePool,
            dicePoolComposition: dicePoolComposition,
            dicePoolMod: {},
            limit: limit,
            limitMod: {},
            type: rollType,
            typeSub: typeSub,
            testType: testType,
            originalMessage: originalMessage,
        };

        if (item) {
            dialogData = mergeObject(dialogData, {
                itemId: item.id,
            });
        }

        mergeObject(dialogData, optionalData);
        await SR5_Dice.prepareRollDialog(dialogData);
    }

    //Return the actor object targeted on canvas
    static async getTargetedActor(){
        let targets = Array.from(game.user.targets);
        let targetActorId = targets[0].actor.isToken ? targets[0].actor.token.id : targets[0].actor.id;
        return SR5_EntityHelpers.getRealActorFromID(targetActorId);
    }
}