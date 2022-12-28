import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5 } from "../../config.js";

//Add info for Resistance Roll
export default async function resistanceSimple(rollData, rollKey, actor){
    let subKey = rollKey.split("_").pop();
    let resistanceKey = rollKey.split("_").shift();
    
    //Iterate throught Resistant type to add title and dicepool composition
    switch (resistanceKey){
        case "physicalDamage":
            rollData.test.title = game.i18n.localize(SR5.characterResistances.physicalDamage);
            rollData.dicePool.composition = actor.system.resistances.physicalDamage.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
            rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.resistances.physicalDamage.modifiers);
            break;
        case "directSpellMana":
            rollData.test.title = game.i18n.localize(SR5.characterResistances.directSpellMana);
            rollData.dicePool.composition = actor.system.resistances.directSpellMana.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
            rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.resistances.directSpellMana.modifiers);
            break;
        case "directSpellPhysical":
            rollData.test.title = game.i18n.localize(SR5.characterResistances.directSpellPhysical);
            rollData.dicePool.composition = actor.system.resistances.directSpellPhysical.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
            rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.resistances.directSpellPhysical.modifiers);
            break;
        case "toxin":
            rollData.test.title = game.i18n.localize(SR5.characterResistances.toxin) + " (" + game.i18n.localize(SR5.propagationVectors[subKey]) + ")";
            rollData.dicePool.composition = actor.system.resistances.toxin[subKey].modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
            rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.resistances.toxin[subKey].modifiers);
            break;
        case "disease":
            rollData.test.title = game.i18n.localize(SR5.characterResistances.disease) + " (" + game.i18n.localize(SR5.propagationVectors[subKey]) + ")";
            rollData.dicePool.composition = actor.system.resistances.disease[subKey].modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
            rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.resistances.disease[subKey].modifiers);
            break;
        case "specialDamage":
            rollData.test.title = game.i18n.localize(SR5.characterResistances.specialDamage) + " (" + game.i18n.localize(SR5.specialDamageTypes[subKey]) + ")";
            rollData.dicePool.composition = actor.system.resistances.specialDamage[subKey].modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));
            rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.resistances.specialDamage[subKey].modifiers);
            break;
        default:
            SR5_SystemHelpers.srLog(1, `Unknown '${resistanceKey}' Damage Resistance Type in roll`);
    }

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Add others informations
    rollData.test.type = "resistanceSimple";
    rollData.test.typeSub = rollKey;

    return rollData;
}