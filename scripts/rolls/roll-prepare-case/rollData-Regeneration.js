import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function regeneration(rollData, actor){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.RegenerationTest");

    //Determine dicepool composition
    rollData.dicePool.composition = ([
        {source: game.i18n.localize("SR5.Magic"), type: "linkedAttribute", value: actor.system.specialAttributes.magic.augmented.value},
        {source: game.i18n.localize("SR5.Body"), type: "linkedAttribute", value: actor.system.attributes.body.augmented.value},
    ]);

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Add others informations
    rollData.test.type = "regeneration";

    return rollData;
}