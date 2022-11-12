import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";
import { SR5 } from "../../config.js";

export default function healing(rollData, rollKey, actor){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.NaturalRecoveryTest")} [${game.i18n.localize(SR5.damageTypes[rollKey])}]`;

    //Determine dicepool composition
    if (rollKey === "stun"){
        rollData.dicePool.composition = ([
            {source: game.i18n.localize("SR5.Body"), type: "linkedAttribute", value: actor.system.attributes.body.augmented.value},
            {source: game.i18n.localize("SR5.Willpower"), type: "linkedAttribute", value: actor.system.attributes.willpower.augmented.value},
        ]);
    } else {
        rollData.dicePool.composition = ([
            {source: game.i18n.localize("SR5.Body"), type: "linkedAttribute", value: actor.system.attributes.body.augmented.value},
            {source: game.i18n.localize("SR5.Body"), type: "linkedAttribute", value: actor.system.attributes.body.augmented.value},
        ]);
    }

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Add others informations
    rollData.test.type = "healing";
    rollData.test.subType = rollKey;
    rollData.dialogSwitch.extended = true;

    return rollData;  
}