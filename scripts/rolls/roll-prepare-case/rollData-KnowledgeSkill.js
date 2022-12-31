import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

//Add info for Knowledge / language skill roll
export default function knowledgeSkill(rollData, rollType, item){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.SkillTest") + game.i18n.localize("SR5.Colons") + " " + item.name}`;
    
    //Determine dicepool composition
    rollData.dicePool.composition = item.system.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);
    
    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, item.system.test.modifiers);

    //Add others informations
    rollData.dialogSwitch.specialization = true;
    rollData.test.type = rollType;

    return rollData;
}