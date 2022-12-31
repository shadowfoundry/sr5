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

    if (resonanceAction.limit){
        //Determine base limit
        rollData.limit.base = SR5_PrepareRollHelper.getBaseLimit(resonanceAction.limit.value, resonanceAction.limit.modifiers);

        //Determine limit modififiers
        rollData.limit.modifiers = SR5_PrepareRollHelper.getLimitModifiers(rollData, resonanceAction.limit.modifiers);
        rollData.limit.type = resonanceAction.limit.linkedAttribute;
    }

    //Add others informations
    rollData.test.type = "resonanceAction";
    rollData.test.typeSub = rollKey;
    rollData.matrix.actionType = resonanceAction.actionType;
    rollData.matrix.overwatchScore = resonanceAction.increaseOverwatchScore;
    rollData.matrix.level = actor.system.specialAttributes.resonance.augmented.value;
    rollData.dialogSwitch.specialization = true;

    //Handle special case
    if (rollData.target.hasTarget && (rollKey === "killComplexForm" || rollKey === "decompileSprite" || rollKey === "registerSprite")){
        let targetActor = await SR5_PrepareRollHelper.getTargetedActor();
            
        //Kill Complex Form
        if (rollKey === "killComplexForm"){
            let itemList = targetActor.items.filter(i => i.type === "itemComplexForm" && i.system.isActive);
            for (let e of Object.values(targetActor.items.filter(i => i.type === "itemEffect" && i.system.type === "itemComplexForm"))){
                let parentItem = await fromUuid(e.system.ownerItem);
                if (itemList.length === 0) itemList.push(parentItem);
                else {
                    let itemAlreadyIn = itemList.find((i) => i.id === parentItem.id);
                    if (!itemAlreadyIn) itemList.push(parentItem);
                }
            }
            if (itemList.length !== 0){
                for (let s of itemList) rollData.target.itemList[s.uuid] = s.name;
            }
        }

        //Decompiling / Register
        if (rollKey === "decompileSprite" || rollKey === "registerSprite"){
            if (targetActor.type !== "actorSprite") return ui.notifications.warn(`${game.i18n.localize("SR5.WARN_NotASprite")}`);
        }
    }

    return rollData;
}