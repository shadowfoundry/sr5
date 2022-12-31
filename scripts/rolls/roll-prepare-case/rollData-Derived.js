import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5 } from "../../config.js";

//Add info for derived attribute roll
export default async function derived(rollData, rollKey, actor){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.DerivedAttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.characterDerivedAttributes[rollKey])}`;
    
    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.derivedAttributes[rollKey].modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.derivedAttributes[rollKey].modifiers);

    //Add others informations
    rollData.test.type = "derivedAttribute";
    rollData.test.typeSub = rollKey;

    return rollData;
}