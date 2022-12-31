import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default function complexForm(rollData, actor, item){
    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.Thread")} ${item.name}`;

    //Determine dicepool composition
    rollData.dicePool.composition = actor.system.matrix.resonanceActions.threadComplexForm.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, actor.system.matrix.resonanceActions.threadComplexForm.test.modifiers);

    //Add others informations
    rollData.test.type = "complexForm";
    rollData.matrix.fading.type = "stun";
    rollData.matrix.level = actor.system.specialAttributes.resonance.augmented.value;
    rollData.various.defenseFirstAttribute = item.system.defenseAttribute;
    rollData.various.defenseSecondAttribute = item.system.defenseMatrixAttribute;
    rollData.owner.itemUuid = item.uuid;
    rollData.matrix.fading.modifiers.complexForm = {
        value: item.system.fadingModifier,
        label: game.i18n.localize("SR5.FadingModifier"),
    }

    //Determine sub type
    for (let e of item.system.systemEffects){
        if (e.value === "sre_ResonanceSpike") rollData.test.typeSub = "resonanceSpike";
        if (e.value === "sre_Derezz") rollData.test.typeSub = "derezz";
        if (e.value === "sre_Redundancy") rollData.test.typeSub = "redundancy";
    }

    //Add public grid switch
    if (actor.system.matrix.userGrid === "public") rollData.dialogSwitch.publicGrid = true;

    //Check if an effect is transferable
    rollData = SR5_PrepareRollHelper.addTransferableEffect(rollData, item);

    return rollData;
}