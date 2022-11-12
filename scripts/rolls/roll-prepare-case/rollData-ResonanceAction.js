import { SR5 } from "../../config.js";
import { SR5_PrepareRollHelper } from "../roll-prepare-helpers.js";

export default async function resonanceAction(rollData, rollKey, actor){
    let resonanceAction = actor.system.matrix?.resonanceActions[rollKey];

    //Determine title
    rollData.test.title = `${game.i18n.localize("SR5.ResonanceActionTest") + game.i18n.localize("SR5.Colons") + " " + game.i18n.localize(SR5.resonanceActions[rollKey])}`;

    //Determine dicepool composition
    rollData.dicePool.composition = resonanceAction.test.modifiers.filter(mod => (mod.type === "skillRating" || mod.type === "linkedAttribute" || mod.type === "skillGroup"));

    //Determine base dicepool
    rollData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(rollData);

    //Determine dicepool modififiers
    rollData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(rollData, resonanceAction.test.modifiers);

    //Determine base limit
    rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(resonanceAction.limit.value, resonanceAction.limit.modifiers);

    //Determine limit modififiers
    rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, resonanceAction.limit.modifiers);

    //Add others informations
    rollData.test.type = "resonanceAction";
    rollData.test.typeSub = rollKey;
    rollData.limit.type = resonanceAction.limit.linkedAttribute;
    rollData.matrix.actionType = resonanceAction.limit.linkedAttribute;
    rollData.matrix.overwatchScore = resonanceAction.increaseOverwatchScore;
    rollData.matrix.level = actorData.specialAttributes.resonance.augmented.value;
    rollData.dialogSwitch.specialization = true;

    //Handle special case
    if (game.user.targets.size && (typeSub === "killComplexForm" || typeSub === "decompileSprite" || typeSub === "registerSprite")){
        if (game.user.targets.size === 0) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetChooseOne")}`);
        else if (game.user.targets.size > 1) return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_TargetTooMany")}`);
        else {
            let targetActor = await SR5_PrepareRollHelper.getTargetedActor();
            
            //Kill Complex Form
            if (typeSub === "killComplexForm"){
            let itemList = targetActor.items.filter(i => i.type === "itemComplexForm" && i.system.isActive);
            let currentItemList = targetActor.items.filter(i => i.type === "itemEffect" && i.system.type === "itemComplexForm");
            for (let e of Object.values(currentItemList)){
                let parentItem = await fromUuid(e.system.ownerItem);
                if (itemList.length === 0) itemList.push(parentItem);
                else {
                    let itemAlreadyIn = itemList.find((i) => i.id === parentItem.id);
                    if (!itemAlreadyIn) itemList.push(parentItem);
                }
            }
            if (itemList.length !== 0){
                rollData.target.hasTarget = true;
                rollData.target.itemList = itemList;
            }

            //Decompiling / Register
            if (typeSub === "decompileSprite" || typeSub === "registerSprite"){
                if (targetActor.type !== "actorSprite") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASprite")}`);
                    rollData.target.hasTarget = true;
                    rollData.target.actorId = targetActor.id;
                }
            }
        }
    }
}