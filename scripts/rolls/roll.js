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
            originalMessage,
            effectsList,
            spiritHelp,
            canUseReagents = false,
            canBeExtended = true,
            dicePoolComposition,
            rulesMatrixGrid = false,
            firstAttribute, secondAttribute;

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

        if (chatData) originalMessage = chatData.originalMessage;
        //Reagents
        if ((actor.type === "actorPc" || actor.type === "actorGrunt") && actorData.magic.reagents > 0) canUseReagents = true;

        if (game.settings.get("sr5", "sr5MatrixGridRules")) rulesMatrixGrid = true;

        switch (rollType){
            case "attribute":
                if (actor.data.type === "actorDrone") title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.vehicleAttributes[rollKey])}`;
                else title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.allAttributes[rollKey])}`;
                dicePool = actorData.attributes[rollKey]?.augmented.value;
                if (dicePool === undefined) dicePool = actorData.specialAttributes[rollKey].augmented.value;
                optionalData = {
                    "lists.characterAttributes": actor.data.lists.characterAttributes,
                    "lists.vehicleAttributes": actor.data.lists.vehicleAttributes,
                    "lists.extendedInterval": actor.data.lists.extendedInterval,
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
                itemData.modifiers.unshift({source: game.i18n.localize("SR5.SkillRating"), value: itemData.base});
                optionalData = {
                    "switch.specialization": true,
                    "switch.extended": canBeExtended,
                    "lists.extendedInterval": actor.data.lists.extendedInterval,
                    dicePoolComposition: itemData.modifiers,
                }
                break;

            case "skill":
            case "skillDicePool":
                if (actor.data.type === "actorDrone") {
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
                            "lists.spiritTypes": actor.data.lists.spiritTypes,
                        });
                        canBeExtended = false;
                        break;
                    default:
                        canUseReagents = false;
                }

                optionalData = mergeObject(optionalData, {
                    "switch.extended": canBeExtended,
                    "lists.extendedInterval": actor.data.lists.extendedInterval,
                    "lists.perceptionTypes": actor.data.lists.perceptionTypes,
                    "switch.specialization": true,
                    "switch.canUseReagents": canUseReagents,
                    limitType: skill.limit.base,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                    dicePoolComposition: dicePoolComposition,
                });

                if (game.user.targets.size && (typeSub === "counterspelling" || typeSub === "binding" || typeSub === "banishing" || typeSub === "disenchanting")){
                    if (game.user.targets.size === 0) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetChooseOne")}`);
                    else if (game.user.targets.size > 1) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetTooMany")}`);
                    else {
                        let targets = Array.from(game.user.targets);
                        let targetActorId = targets[0].actor.isToken ? targets[0].actor.token.id : targets[0].actor.id;
                        let targetActor = SR5_EntityHelpers.getRealActorFromID(targetActorId);
                        
                        //Counterspell 
                        if (typeSub === "counterspelling"){
                            effectsList = targetActor.items.filter(i => i.type === "itemSpell" && i.data.data.isActive);
                            let currentEffectList = targetActor.items.filter(i => i.type === "itemEffect" && i.data.data.type === "itemSpell");
                            for (let e of Object.values(currentEffectList)){
                                let parentItem = await fromUuid(e.data.data.ownerItem);
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
                            if (targetActor.data.data.isBounded) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_SpiritAlreadyBounded")}`);
                            limit = targetActor.data.data.force.value;
                            optionalData = mergeObject(optionalData, {
                                hasTarget: true,
                                targetActor: targetActorId,
                            });
                        }

                        //Banishing
                        if (typeSub === "banishing"){
                            if (targetActor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);
                            optionalData = mergeObject(optionalData, {
                                hasTarget: true,
                                targetActor: targetActorId,
                            });
                        }

                        //Disenchanting
                        if (typeSub === "disenchanting"){
                            effectsList = targetActor.items.filter(i => (i.type === "itemFocus" && i.data.data.isActive) || i.type === "itemPreparation");
                            if (effectsList.length !== 0){
                                optionalData = mergeObject(optionalData, {
                                    hasTarget: true,
                                    effectsList: effectsList,
                                });
                            }
                        }
                    }
                }

                if (typeSub === "astralCombat"){
                    if (!actorData.visions.astral.isActive) 
                    return ui.notifications.info(`${game.i18n.format("SR5.INFO_ActorIsNotInAstral", {name:actor.name})}`);
                    optionalData = mergeObject(optionalData, {
                        damageValue: actorData.magic.astralDamage.value,
                        damageValueBase: actorData.magic.astralDamage.value,
                        "lists.damageTypes": actor.data.lists.damageTypes,
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
                let damageValueBase = chatData.damageValue;
                //handle distance between defenser and explosive device
                if (chatData.isGrenade){
                    let grenadePosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.itemId);          
                    let defenserPosition = SR5_EntityHelpers.getActorCanvasPosition(actor);
                    let distance = SR5_SystemHelpers.getDistanceBetweenTwoPoint(grenadePosition, defenserPosition);
                    let modToDamage = distance * (chatData.damageFallOff || 0);
                    damageValueBase = chatData.damageValueBase + modToDamage;
                    if (damageValueBase <= 0 && chatData.damageElement !== "toxin") {
                        ui.notifications.info(`${game.i18n.localize("SR5.INFO_TargetIsTooFar")}`);
                        return;
                    }
                    if (modToDamage === 0) ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistance", {distance:distance})}`);
                    else ui.notifications.info(`${game.i18n.format("SR5.INFO_GrenadeTargetDistanceFallOff", {distance:distance, modifiedDamage: modToDamage, finalDamage: damageValueBase})}`);
                }

                switch (chatData.damageResistanceType){
                    case "physicalDamage":
                        title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${damageValueBase})`; //TODO: add details
                        typeSub = "physicalDamage";
                        let armor, modifiedArmor, resistanceValue, armorComposition = [];
                        let armorSpecialValue = 0

                        switch (actor.data.type){
                            case "actorDrone":                           
                                if (chatData.damageElement === "toxin") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToToxin")}`);     
                                armor = actorData.attributes.armor.augmented.value;
                                resistanceValue = actorData.resistances.physicalDamage.dicePool - armor;
                                modifiedArmor = armor + (chatData.incomingPA || 0);
                                if (modifiedArmor < 0) modifiedArmor = 0;
                                if (damageValueBase < (armor + chatData.incomingPA)) {
                                    ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDV", {armor: armor + chatData.incomingPA, damage:damageValueBase})}`); 
                                    return;
                                }
                                if (chatData.damageType === "stun") {
                                    ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToStunDamage")}`);
                                    return;
                                }
                                break;
                            case "actorSpirit":
                                if (chatData.damageElement === "toxin") return ui.notifications.info(`${game.i18n.localize("SR5.INFO_ImmunityToToxin")}`);
                                armor = actorData.essence.value * 2;
                                modifiedArmor = armor + (chatData.incomingPA || 0);
                                if (modifiedArmor < 0) modifiedArmor = 0
                                if (damageValueBase < (armor + chatData.incomingPA)) {
                                    ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToNormalWeapons", {essence: armor, pa: chatData.incomingPA, damage: damageValueBase})}`);
                                    return;    
                                }
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
                                if (damageValueBase < (armor + chatData.incomingPA) && chatData.damageElement !== "acid"){
                                    chatData.damageType = "stun";
                                    title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${damageValueBase})`; //TODO: add details
                                    ui.notifications.info(`${game.i18n.format("SR5.INFO_ArmorGreaterThanDVSoStun", {armor: armor + chatData.incomingPA, damage:damageValueBase})}`); 
                                }
                                break;
                            default:
                        }

                        dicePool = resistanceValue + modifiedArmor;

                        optionalData = {
                            attackerId: chatData.attackerId,
                            chatActionType: "damage",
                            incomingPA: chatData.incomingPA,
                            armor: armor,
                            armorComposition: armorComposition,
                            ammoType: chatData.ammoType,
                            damageValueBase: damageValueBase,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                            dicePoolBase : resistanceValue,
                            dicePoolComposition: dicePoolComposition,
                        }
                        if (chatData.damageSource === "spell") optionalData = mergeObject(optionalData,{damageSource: "spell",});
                        if (chatData.fireTreshold) optionalData = mergeObject(optionalData,{fireTreshold: chatData.fireTreshold,});
                        
                        if (chatData.damageElement === "toxin") optionalData = mergeObject(optionalData, {toxin: chatData.toxin,});
                        debugger;
                        if (chatData.engulfMessage) optionalData = mergeObject(optionalData, {engulfMessage: chatData.engulfMessage,});
                        break;
                    case "directSpellMana":       
                        if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToManaSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
                        title = `${game.i18n.localize("SR5.ResistanceTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterResistances[chatData.damageResistanceType])} (${damageValueBase})`;
                        dicePool = actorData.resistances[chatData.damageResistanceType].dicePool;
                        typeSub = "spellDamage";
                        optionalData = {
                            chatActionType: "damage",
                            damageValueBase: damageValueBase,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                        }
                        break;
                    
                    case "directSpellPhysical":
                        if (actor.type === "actorDevice" || actor.type === "actorSprite") return ui.notifications.info(`${game.i18n.format("SR5.INFO_ImmunityToPhysicalSpell", {type: game.i18n.localize(SR5.actorTypes[actor.type])})}`);
                        title = `${game.i18n.localize("SR5.ResistanceTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterResistances[chatData.damageResistanceType])} (${damageValueBase})`;
                        dicePool = actorData.resistances[chatData.damageResistanceType].dicePool;
                        typeSub = "manaSpellDamage";
                        optionalData = {
                            chatActionType: "damage",
                            damageValueBase: damageValueBase,
                            damageType: chatData.damageType,
                            damageElement: chatData.damageElement,
                        }
                        break;

                    case "biofeedback":
                        dicePool = actorData.matrix.resistances.biofeedback.dicePool;
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
                            chatActionType: "damage",
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
                        typeSub = "dumpshock";
                        title = `${game.i18n.localize("SR5.ResistDumpshock")} (6)`;
                        let dumpshockType;
                        if (actorData.matrix.userMode === "coldsim") dumpshockType = "stun";
                        else if (actorData.matrix.userMode === "hotsim") dumpshockType = "physical";
                        optionalData = {
                            chatActionType: "damage",
                            damageType: dumpshockType,
                            damageValueBase: 6,
                        }
                        break;
                    case "astralDamage":
                        dicePool = actorData.resistances.astralDamage.dicePool;
                        typeSub = "astralDamage";
                        title = `${game.i18n.localize("SR5.TakeOnDamage")} ${game.i18n.localize(SR5.damageTypes[chatData.damageType])} (${damageValueBase})`;
                        optionalData = {
                            chatActionType: "damage",
                            damageValueBase: damageValueBase,
                            damageType: chatData.damageType,
                        }
                        break;
                    default:
                        SR5_SystemHelpers.srLog(1, `Unknown '${chatData.damageResistanceType}' Damage Resistance Type in roll`);
                }
                break;

            case "derivedAttribute":
                title = `${game.i18n.localize("SR5.DerivedAttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.characterDerivedAttributes[rollKey])}`;
                optionalData = mergeObject(optionalData, {
                    dicePoolComposition: actorData.derivedAttributes[rollKey].modifiers,
                });
                dicePool = actorData.derivedAttributes[rollKey].dicePool;
                break;

            case "lift":
                title = `${game.i18n.localize("SR5.CarryingTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.weightActions[rollKey])}`;
                dicePool = actorData.weightActions[rollKey].test.dicePool;
                typeSub = rollKey;
                optionalData = {
                    derivedBaseValue: actorData.weightActions[rollKey].baseWeight.value,
                    derivedExtraValue: actorData.weightActions[rollKey].extraWeight.value,
                    dicePoolComposition: actorData.weightActions[rollKey].test.modifiers,
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
                    unit: unit,
                    dicePoolComposition: actorData.movements[rollKey].test.modifiers,
                }
                break;

            case "resistFire":
                title = `${game.i18n.localize("SR5.TryToNotCatchFire")} (${chatData.fireTreshold})`
                dicePool = actorData.itemsProperties.armor.value + actorData.itemsProperties.armor.specialDamage.fire.value + chatData.incomingPA;
                let armored = actorData.itemsProperties.armor.value + actorData.itemsProperties.armor.specialDamage.fire.value;
                optionalData = {
                    //chatActionType: "damage",
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
                    chatActionType: "iceDefense",
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
                    {source: game.i18n.localize(SR5.allAttributes[chatData.defenseFirstAttribute]), value: iceFirstAttribute},
                    {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseSecondAttribute]), value: iceSecondAttribute},
                ]);
                dicePool = iceFirstAttribute + iceSecondAttribute;
                let deck = actor.items.find(d => d.type === "itemDevice" && d.data.data.isActive);

                optionalData = {
                    hits: chatData.test.hits,
                    iceType: chatData.typeSub,
                    originalActionAuthor: chatData?.originalActionAuthor,
                    matrixDamageValueBase: chatData.matrixDamageValue,
                    mark: chatData?.mark,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                    matrixTargetItemUuid: deck.uuid,
                    dicePoolComposition: dicePoolComposition,
                }
                break;

            case "matrixAction":
                title = `${game.i18n.localize("SR5.MatrixActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.matrixRolledActions[rollKey])}`;
                dicePool = matrixAction.test.dicePool;
                limit = matrixAction.limit.value;
                typeSub = rollKey;

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
                    chatActionType: "matrixDefense",
                    matrixActionType: matrixAction.limit.linkedAttribute,
                    overwatchScore: matrixAction.increaseOverwatchScore,
                    matrixNoiseRange: "wired",
                    matrixNoiseScene: sceneNoise + actorData.matrix.noise.value,
                    "dicePoolMod.matrixNoiseScene": sceneNoise + actorData.matrix.noise.value,
                    "dicePoolMod.matrixNoiseReduction": actorData.matrix.attributes.noiseReduction.value,
                    dicePoolComposition: matrixAction.test.modifiers,
                    rulesMatrixGrid: rulesMatrixGrid,
                    "lists.gridTypes": actor.data.lists.gridTypes,
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
                typeSub = rollKey;

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
                    optionalData = mergeObject(optionalData, {matrixTargetItemUuid: targetItem.uuid,});  
                } else {
                    let deck = actor.items.find(d => d.type === "itemDevice" && d.data.data.isActive);
                    optionalData = mergeObject(optionalData, {matrixTargetItemUuid: deck.uuid,});
                }

                optionalData = mergeObject(optionalData, {
                    matrixActionType: matrixAction.limit.linkedAttribute,
                    overwatchScore: matrixAction.increaseOverwatchScore,
                    hits: chatData?.test.hits,
                    originalActionAuthor: chatData?.originalActionAuthor,
                    mark: chatData?.mark,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                    dicePoolComposition:  matrixAction.defense.modifiers,
                });
                break;

            case "matrixResistance":
                title = `${game.i18n.localize("SR5.TakeOnDamageMatrix")} (${chatData.matrixDamageValue})`;
                dicePool = actorData.matrix.resistances[rollKey].dicePool;
                if (chatData.matrixTargetItemUuid){
                    let matrixTargetItem = await fromUuid(chatData.matrixTargetItemUuid);
                    if (matrixTargetItem.data.data.type !== "baseDevice" && matrixTargetItem.data.data.type !== "livingPersona" && matrixTargetItem.data.data.type !== "headcase"){ 
                        title = `${matrixTargetItem.name}: ${game.i18n.localize("SR5.TakeOnDamageShort")} (${chatData.matrixDamageValue})`;
                        dicePool = matrixTargetItem.data.data.deviceRating * 2;
                        optionalData = mergeObject(optionalData, {
                            matrixTargetItemUuid: chatData.matrixTargetItemUuid,
                        }); 
                    }
                }

                optionalData = mergeObject(optionalData, {
                    chatActionType: "damage",
                    matrixDamageValue: chatData.matrixDamageValue,
                    matrixDamageValueBase: chatData.matrixDamageValue,
                    damageType: chatData.damageType,
                    originalActionAuthor: chatData.originalActionAuthor,
                    dicePoolComposition:  actorData.matrix.resistances[rollKey].modifiers,
                });
                break;

            case "resonanceAction":
                title = `${game.i18n.localize("SR5.ResonanceActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.resonanceActions[rollKey])}`;
                dicePool = resonanceAction.test.dicePool;
                limit = resonanceAction.limit?.value;
                typeSub = rollKey;
            
                optionalData = {
                    chatActionType: "resonanceDefense",
                    matrixActionType: resonanceAction.limit?.linkedAttribute,
                    overwatchScore: resonanceAction.increaseOverwatchScore,
                    dicePoolComposition: resonanceAction.test.modifiers,
                    actorResonance: actorData.specialAttributes.resonance.augmented.value,
                    "lists.spriteTypes": actor.data.lists.spriteTypes,
                }

                if (game.user.targets.size && (typeSub === "killComplexForm" || typeSub === "decompileSprite" || typeSub === "registerSprite")){
                    if (game.user.targets.size === 0) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetChooseOne")}`);
                    else if (game.user.targets.size > 1) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetTooMany")}`);
                    else {
                        let targets = Array.from(game.user.targets);
                        let targetActorId = targets[0].actor.isToken ? targets[0].actor.token.id : targets[0].actor.id;
                        let targetActor = SR5_EntityHelpers.getRealActorFromID(targetActorId);

                        //Kill Complex Form
                        if (typeSub === "killComplexForm"){
                            effectsList = targetActor.items.filter(i => i.type === "itemComplexForm" && i.data.data.isActive);
                            let currentEffectList = targetActor.items.filter(i => i.type === "itemEffect" && i.data.data.type === "itemComplexForm");
                            for (let e of Object.values(currentEffectList)){
                                let parentItem = await fromUuid(e.data.data.ownerItem);
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
                                targetActor: targetActorId,
                            });
                        }
                    }
                }
                break;

            case "fadingCard":
                title = game.i18n.localize("SR5.FadingResistanceTest");
                if (chatData.fadingValue >= 0) title += ` (${chatData.fadingValue})`;
                dicePool = actorData.matrix.resistances.fading.dicePool;
                if (chatData.hits > actorData.specialAttributes.resonance.augmented.value) chatData.fadingType = "physical";
                optionalData = {
                    chatActionType: "damage",
                    fadingValue: chatData.fadingValue,
                    fadingType: chatData.fadingType,
                    actorResonance: chatData.actorResonance,
                    hits: chatData.hits,
                    dicePoolComposition: actorData.matrix.resistances.fading.modifiers,
                }
                break;
            
            case "drainCard":
                title = game.i18n.localize("SR5.DrainResistanceTest");
                if (chatData.drainValue >= 0) title += ` (${chatData.drainValue})`;
                dicePool = actorData.magic.drainResistance.dicePool;
                if (chatData.hits > actorData.specialAttributes.magic.augmented.value) chatData.drainType = "physical";
                optionalData = {
                    chatActionType: "damage",
                    drainValue: chatData.drainValue,
                    drainType: chatData.drainType,
                    actorMagic: chatData.actorMagic,
                    hits: chatData.hits,
                    dicePoolComposition: actorData.magic.drainResistance.modifiers,
                };

                //Centering metamagic
                if (actorData.magic.metamagics.centering){
                    optionalData = mergeObject(optionalData,{
                        "switch.centering": true,
                    });
                }
                break;

            case "drain":
                title = game.i18n.localize("SR5.DrainResistanceTest");
                dicePool = actorData.magic.drainResistance.dicePool;
                optionalData = {
                    dicePoolComposition: actorData.magic.drainResistance.modifiers,
                };
                break;

            case "defense":
                title = `${game.i18n.localize("SR5.PhysicalDefenseTest")}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize(SR5.characterDefenses[rollKey])}`;
                dicePool = actorData.defenses[rollKey].dicePool;
                if (rollKey !== "defend") limit = actorData.limits.physicalLimit.value;
                optionalData = {
                    cover: true,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                    dicePoolComposition: actorData.defenses[rollKey].modifiers,
                }
                break;

            case "defenseCard":
                if (actor.type === "actorDevice" || actor.type === "actorSprite") return;
                title = `${game.i18n.localize("SR5.PhysicalDefenseTest")} (${chatData.test.hits})`;
                dicePool = actorData.defenses.defend.dicePool;
                dicePoolComposition = actorData.defenses.defend.modifiers;
                typeSub = chatData.typeSub;
                let cover = true;

                if (chatData.firingMode === "SF"){
                    dicePool = actorData.attributes.reaction.augmented.value + (actorData.specialAttributes?.edge?.augmented?.value || 0);
                    cover = false;
                    optionalData = mergeObject(optionalData, {firingMode: "SF",});
                    dicePoolComposition = [
                        {source: game.i18n.localize("SR5.Reaction"), value: actorData.attributes.reaction.augmented.value},
                        {source: game.i18n.localize("SR5.Edge"), value: (actorData.specialAttributes?.edge?.augmented?.value || 0)},
                    ]
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

                if (typeSub === "astralCombat"){
                    if ((actor.type === "actorDevice" || actor.type === "actorSprite") || !actorData.visions.astral.isActive) return ui.notifications.info(`${game.i18n.format("SR5.INFO_TargetIsNotInAstral", {name:actor.name})}`);
                    title = `${game.i18n.localize("SR5.AstralDefenseTest")} (${chatData.test.hits})`;
                    cover = false;
                    dicePool = actorData.magic.astralDefense.dicePool;
                    dicePoolComposition = actorData.magic.astralDefense.modifiers;
                }
                if (canvas.scene && chatData.type === "spell" && chatData.spellRange === "area"){
                    // Spell position
                    let spellPosition = SR5_SystemHelpers.getTemplateItemPosition(chatData.itemId); 
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

                //Handle toxin, if any
                if (chatData.toxin) optionalData = mergeObject(optionalData, {toxin: chatData.toxin,});

                let cumulativeDefense = actor.getFlag("sr5", "cumulativeDefense");
                if(cumulativeDefense !== null) actor.setFlag("sr5", "cumulativeDefense", cumulativeDefense + 1);

                optionalData = mergeObject(optionalData, {
                    attackerId: chatData.actorId,
                    chatActionType: "resistanceCard",
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
                    dicePoolComposition: dicePoolComposition,
                });
                break;

            case "weapon":
                title = `${game.i18n.localize("SR5.AttackWith")} ${item.name}`;
                dicePool = itemData.weaponSkill.dicePool;
                limit = itemData.accuracy.value;
                limitType = "accuracy";
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
                            "templateRemove": true,
                            "isGrenade": true,
                            "damageFallOff": itemData.blast.damageFallOff,
                            "blastRadius": itemData.blast.radius,
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
                    actorRecoil: actorData.recoilCompensation.value,
                    actorRecoilCumulative: actor.data.flags.sr5.cumulativeRecoil,
                    ammoType: itemData.ammunition.type,
                    ammoValue: itemData.ammunition.value,
                    ammoMax: itemData.ammunition.max,
                    "dicePoolMod.environmentalSceneMod": sceneEnvironmentalMod,
                    dicePoolComposition: itemData.weaponSkill.modifiers,
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

                if (itemData.damageElement === "toxin"){
                    optionalData = mergeObject(optionalData, {
                        toxin: itemData.toxin,
                    })
                }
                break;

            case "astralWeapon":
                title = `${game.i18n.localize("SR5.AstralAttackWith")} ${item.name}`;
                dicePool = itemData.weaponSkill.dicePool;

                optionalData = mergeObject(optionalData, {
                    limiteType: "accuracy",
                    limit: itemData.accuracy.value, 
                    damageValue: itemData.damageValue.value,
                    damageValueBase: itemData.damageValue.value,
                    dicePoolComposition: itemData.weaponSkill.modifiers,
                    "switch.extended": false,
                    "switch.chooseDamageType": true,
                    "switch.specialization": true,
                    "lists.damageTypes": actor.data.lists.damageTypes,
                    type: "skillDicePool",
                    typeSub: "astralCombat",
                });
                break;

            case "spell":
                let spellCategory = itemData.category;
                typeSub = itemData.subCategory;
                title = `${game.i18n.localize("SR5.CastSpell")} ${item.name}`;
                dicePool = actorData.skills.spellcasting.spellCategory[spellCategory].dicePool;
                
                optionalData = {
                    "drainMod.spell": itemData.drain.value,
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
                    dicePoolComposition: actorData.skills.spellcasting.spellCategory[spellCategory].modifiers,
                    itemUuid: item.uuid,
                }
                if (itemData.range === "area"){
                    optionalData = mergeObject(optionalData, {
                        "templatePlace": true,
                    });
                    //Spell Shaping metamagic
                    if (actorData.magic.metamagics.spellShaping){
                        optionalData = mergeObject(optionalData, {
                            "switch.spellShaping": true,
                        });
                    }
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
                spiritHelp = actor.items.find(i => (i.type === "itemSpirit" && i.data.data.isBounded && i.data.data.spellType === itemData.category && i.data.data.services.value > 0));
                if (spiritHelp){
                    optionalData = mergeObject(optionalData, {
                        "spiritAidId": spiritHelp.uuid,
                        "spiritAidMod": spiritHelp.data.data.itemRating,
                        "switch.spiritAid": true,
                    });
                }
                break;

            case "resistSpell":
                let spellItem = await fromUuid(chatData.itemUuid);
                let spellData = spellItem.data.data;
                title = `${game.i18n.localize("SR5.ResistSpell")}${game.i18n.localize("SR5.Colons")} ${spellItem.name}`;

                firstAttribute = actorData.attributes[spellData.defenseFirstAttribute].augmented.value;
                secondAttribute = actorData.attributes[spellData.defenseSecondAttribute].augmented.value;
                dicePoolComposition = ([
                    {source: game.i18n.localize(SR5.allAttributes[spellData.defenseFirstAttribute]), value: firstAttribute},
                    {source: game.i18n.localize(SR5.allAttributes[spellData.defenseSecondAttribute]), value: secondAttribute},
                ]);
                dicePool = firstAttribute + secondAttribute;

                optionalData = {
                    hits: chatData.test.hits,
                    dicePoolComposition: dicePoolComposition,
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
                    dicePoolComposition: dicePoolComposition,
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
                    spellCategory: itemData.category,
                    spellResisted: itemData.resisted,
                    force: itemData.force,
                    "sceneData.backgroundCount" : backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                    dicePoolComposition: itemData.test.modifiers,
                    itemUuid: item.uuid,
                }
                if (itemData.range === "area"){
                    optionalData = mergeObject(optionalData, {
                        "templatePlace": true,
                    });
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
                break;

            case "preparationFormula":
                let alchemicalSpellCategories = itemData.category;
                typeSub = itemData.subCategory;
                title = `${game.i18n.localize("SR5.PreparationCreate")}${game.i18n.localize("SR5.Colons")} ${item.name}`;
                dicePool = actorData.skills.alchemy.spellCategory[alchemicalSpellCategories].dicePool;
                optionalData = {
                    "switch.specialization": true,
                    "switch.canUseReagents": canUseReagents,
                    "drainMod.spell": itemData.drain.value,
                    drainType: "stun",
                    force: actorData.specialAttributes.magic.augmented.value,
                    actorMagic: actorData.specialAttributes.magic.augmented.value,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                    dicePoolComposition: actorData.skills.alchemy.spellCategory[alchemicalSpellCategories].modifiers,
                }

                //Check if a spirit can aid sorcery
                spiritHelp = actor.items.find(i => (i.type === "itemSpirit" && i.data.data.isBounded && i.data.data.spellType === itemData.category && i.data.data.services.value > 0));
                if (spiritHelp){
                     optionalData = mergeObject(optionalData, {
                         "spiritAidId": spiritHelp.uuid,
                         "spiritAidMod": spiritHelp.data.data.itemRating,
                         "switch.spiritAid": true,
                     });
                 }
                break;

            case "complexForm":
                title = `${game.i18n.localize("SR5.Thread")} ${item.name}`;
                dicePool = actorData.matrix.resonanceActions.threadComplexForm.test.dicePool;                
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
                    "dicePoolMod.matrixNoiseScene": sceneNoise + actorData.matrix.noise.value,
                    "dicePoolMod.matrixNoiseReduction": actorData.matrix.attributes.noiseReduction.value,
                    dicePoolComposition: actorData.matrix.resonanceActions.threadComplexForm.test.modifiers,
                    rulesMatrixGrid: rulesMatrixGrid,
                    "lists.gridTypes": actor.data.lists.gridTypes,
                }

                if (actorData.matrix.userGrid === "public"){
                    optionalData = mergeObject(optionalData, {
                        "switch.publicGrid": true,
                    });
                }

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
                        {source: game.i18n.localize("SR5.DeviceRating"), value: defenseAttribute},
                        {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseMatrixAttribute]), value: defenseMatrixAttribute},
                    ]);
                } else {
                    if (actorData.attributes[chatData.defenseAttribute]){
                        defenseAttribute = actorData.attributes[chatData.defenseAttribute].augmented.value;
                        defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                        dicePoolComposition = ([
                            {source: game.i18n.localize(SR5.allAttributes[chatData.defenseAttribute]), value: defenseAttribute},
                            {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseMatrixAttribute]), value: defenseMatrixAttribute},
                        ]);
                    } else {
                        if (actor.type === "actorDrone" && actorData.slaved && actor.data.flags.sr5?.vehicleControler !== undefined) {
                            defenseAttribute = actor.data.flags.sr5.vehicleControler.data.attributes[chatData.defenseAttribute].augmented.value;
                            defenseMatrixAttribute = actor.data.flags.sr5.vehicleControler.data.matrix.attributes[chatData.defenseMatrixAttribute].value;
                            dicePoolComposition = ([
                                {source: game.i18n.localize(SR5.allAttributes[chatData.defenseAttribute]), value: defenseAttribute},
                                {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseMatrixAttribute]), value: defenseMatrixAttribute},
                            ]);
                        } else {
                            defenseAttribute = actorData.matrix.deviceRating;
                            defenseMatrixAttribute = actorData.matrix.attributes[chatData.defenseMatrixAttribute].value;
                            dicePoolComposition = ([
                                {source: game.i18n.localize("SR5.DeviceRating"), value: defenseAttribute},
                                {source: game.i18n.localize(SR5.matrixAttributes[chatData.defenseMatrixAttribute]), value: defenseMatrixAttribute},
                            ]);
                        }
                    }
                }
                dicePool = defenseAttribute + defenseMatrixAttribute;
                
                typeSub = chatData.typeSub;
                optionalData = {
                    hits: chatData.test.hits,
                    originalActionAuthor: chatData?.originalActionAuthor,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                    dicePoolComposition: dicePoolComposition,
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
                title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;
                dicePool = itemData.test.dicePool;

                optionalData = {
                    "switch.extended": true,
                    "sceneData.backgroundCount": backgroundCount,
                    "sceneData.backgroundAlignement": backgroundAlignement,
                    dicePoolComposition: itemData.test.modifiers,
                }

                if (itemData.defenseFirstAttribute && itemData.defenseSecondAttribute){
                    optionalData = mergeObject(optionalData, {
                        "switch.extended": false,
                        typeSub: "powerWithDefense",
                        defenseFirstAttribute: itemData.defenseFirstAttribute || 0,
                        defenseSecondAttribute: itemData.defenseSecondAttribute || 0,
                        "sceneData.backgroundCount": backgroundCount,
                        "sceneData.backgroundAlignement": backgroundAlignement,
                        dicePoolComposition: itemData.test.modifiers,
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
                break;

            case "powerDefense":
                let powerItem = await fromUuid(chatData.itemUuid);
                if (actor.type === "actorDrone" || actor.type === "actorDevice" || actor.type === "actorSprite") return;
                title = `${game.i18n.localize("SR5.Defense")} ${game.i18n.localize("SR5.Against")} ${powerItem.name}`;
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
                dicePoolComposition = ([
                    {source: game.i18n.localize(SR5.allAttributes[chatData.defenseFirstAttribute]), value: firstAttribute},
                    {source: game.i18n.localize(SR5.allAttributes[chatData.defenseSecondAttribute]), value: secondAttribute},
                ]);
                dicePool = firstAttribute + secondAttribute;
                optionalData = {
                    hits: chatData.test.hits,
                    defenseFull: actorData.attributes?.willpower?.augmented.value || 0,
                    dicePoolComposition: dicePoolComposition,
                }

                if (chatData.switch?.transferEffect){
                    optionalData = mergeObject(optionalData, {
                        "switch.transferEffect": true,
                    });

                    let powerItem = await fromUuid(chatData.itemUuid);
                    let powerData = powerItem.data.data;
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
                break;
            
            case "spritePower":
                title = `${game.i18n.localize("SR5.UsePower")} ${item.name}`;
                dicePool = itemData.test.dicePool;
                limit = actorData.matrix.attributes[itemData.testLimit].value;
                optionalData = {
                    defenseAttribute: itemData.defenseAttribute,
                    defenseMatrixAttribute: itemData.defenseMatrixAttribute,
                    dicePoolComposition: itemData.test.modifiers,
                }
                break;
            
            case "vehicleTest":
                title = `${game.i18n.localize("SR5.VehicleTest")}`;
                dicePool = actorData.vehicleTest.test.dicePool;
                limit = actorData.vehicleTest.limit.value;
                optionalData = {dicePoolComposition: actorData.vehicleTest.test.modifiers,};
                break;

            case "activeSensorTargeting":
                title = `${game.i18n.localize("SR5.SensorTargeting")}`;
                dicePool = actorData.skills.perception.test.dicePool;
                limit = actorData.skills.perception.limit.value;
                optionalData = {
                    dicePoolComposition: actorData.skills.perception.test.modifiers,
                    "lists.targetSignature": actor.data.lists.targetSignature,
                };
                break;

            case "activeSensorDefense":
                title = `${game.i18n.localize("SR5.SensorDefense")}`;
                dicePool = actorData.skills.sneaking.test.dicePool;
                dicePoolComposition = actorData.skills.sneaking.test.modifiers;
                if (actor.type === "actorDrone"){    
                    limit = actorData.skills.sneaking.limit.value;
                } else {
                    limit = actorData.limits.physicalLimit.value;
                }

                optionalData = {
                    originalActionAuthor: chatData.originalActionAuthor,
                    hits: chatData.test.hits,
                    dicePoolComposition: dicePoolComposition,
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
                dicePoolComposition = [{source: game.i18n.localize("SR5.Level"), value: actorData.level}];
                if (actorData.isRegistered) {
                    dicePool += actorData.compilerResonance;
                    dicePoolComposition.push({source: game.i18n.localize("SR5.SpriteCompilerResonance"), value: actorData.compilerResonance});
                }
                optionalData = {
                    ownerAuthor: chatData.ownerAuthor,
                    hits: chatData.test.hits,
                    dicePoolComposition: dicePoolComposition,
                }
                break;

            case "registeringResistance":
                if (actor.type !== "actorSprite") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASprite")}`);
                title = game.i18n.localize("SR5.ResistRegistering"); 
                dicePool = actorData.level * 2;
                dicePoolComposition = [
                    {source: game.i18n.localize("SR5.Level"), value: actorData.level},
                    {source: game.i18n.localize("SR5.Level"), value: actorData.level},
                ];
                optionalData = {
                    ownerAuthor: chatData.ownerAuthor,
                    hits: chatData.test.hits,
                    dicePoolComposition: dicePoolComposition,
                }
                break;

            case "bindingResistance":
                if (actor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);
                title = game.i18n.localize("SR5.ResistBinding");
                dicePool = actorData.force.value * 2;
                dicePoolComposition = [
                    {source: game.i18n.localize("SR5.Force"), value: actorData.force.value},
                    {source: game.i18n.localize("SR5.Force"), value: actorData.force.value},
                ];
                optionalData = {
                    ownerAuthor: chatData.ownerAuthor,
                    hits: chatData.test.hits,
                    dicePoolComposition: dicePoolComposition,
                }
                break;
            
            case "banishingResistance":
                if (actor.type !== "actorSpirit") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASpirit")}`);
                title = game.i18n.localize("SR5.ResistBanishing");
                dicePool = actorData.force.value;
                dicePoolComposition = [{source: game.i18n.localize("SR5.Force"), value: actorData.force.value}];
                if (actorData.isBounded) {
                    dicePool += actorData.summonerMagic;
                    dicePoolComposition.push({source: game.i18n.localize("SR5.SpiritSummonerMagic"), value: actorData.summonerMagic});
                }
                optionalData = {
                    ownerAuthor: chatData.ownerAuthor,
                    hits: chatData.test.hits,
                    dicePoolComposition: dicePoolComposition,
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
                    dicePoolComposition: dicePoolComposition,
                    "switch.extended": true,
                    "lists.extendedInterval": actor.data.lists.extendedInterval,
                }
                break;
            case "passThroughBarrier":
                title = game.i18n.localize("SR5.PassThroughBarrierTest");
                dicePool = actorData.magic.passThroughBarrier.dicePool;
                dicePoolComposition = actorData.magic.passThroughBarrier.modifiers;
                limitType = "astral";
                limit = actorData.limits.astralLimit.value;
                optionalData = {
                    dicePoolComposition: dicePoolComposition,
                }
                break;
            case "passThroughDefense":
                title = game.i18n.localize("SR5.ManaBarrierResistance");
                dicePool = 2;
                optionalData = {
                    hits: chatData.test.hits,
                    manaBarrierRating: 1,
                }
                break;
            case "escapeEngulf":
                title = game.i18n.localize("SR5.EscapeEngulfAttempt");
                dicePoolComposition = ([
                    {source: game.i18n.localize("SR5.Strength"), value: actorData.attributes.strength.augmented.value},
                    {source: game.i18n.localize("SR5.Body"), value: actorData.attributes.body.augmented.value},
                ]);
                dicePool = actorData.attributes.strength.augmented.value + actorData.attributes.body.augmented.value;
                optionalData = {
                    attackerId: chatData.attackerId,
                    dicePoolComposition: dicePoolComposition,
                }
                break;
            default:
                SR5_SystemHelpers.srLog(3, `Unknown ${rollType} roll type in 'actorRoll()'`);
        }

        let dialogData = {
            title: title,
            actorId: speakerId,
            actorType: actor.type,
            speakerActor: speakerActor,
            speakerId: speakerId,
            speakerImg: speakerImg,
            dicePool: dicePool,
            dicePoolComposition: {},
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
}