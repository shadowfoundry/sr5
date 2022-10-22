import { SR5 } from "../../config.js";
//Add info for Attribute only roll
export default function attributeOnlyRollData(rollData, rollKey, actor){
    //Determine title
    if (actor.type === "actorDrone") rollData.test.title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.vehicleAttributes[rollKey])}`;
    else rollData.test.title = `${game.i18n.localize("SR5.AttributeTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.allAttributes[rollKey])}`;

    //Determine base dicepool
    if (rollKey === "edge" || rollKey === "magic" || rollKey === "resonance") rollData.dicePool.base = actor.system.specialAttributes[rollKey].augmented.value;
    else rollData.dicePool.base = actor.system.attributes[rollKey]?.augmented.value;
    
    //Determine dicepool composition
    rollData.dicePool.composition = ([{source: game.i18n.localize(SR5.allAttributes[rollKey]), type: "linkedAttribute", value: rollData.dicePool.base},]);

    //Add others informations
    rollData.dialogSwitch.attribute = true;
    rollData.dialogSwitch.penalty = true;
    rollData.dialogSwitch.extended = true;
    rollData.test.type = "attributeOnly";

    return rollData;
}