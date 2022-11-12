export default function iceAttack(rollData, actorData){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.IceAttack");

    //Determine base dicepool
    rollData.dicePool.base = actorData.matrix.ice.attackDicepool;

    //Determine base limit
    rollData.limit.base = actorData.matrix.attributes.attack.value;
    
    //Add others informations
    rollData.test.type = "iceAttack";
    rollData.test.typeSub = actorData.matrix.deviceSubType;
    rollData.damage.matrix.value = actorData.matrix.attributes.attack.value;
    rollData.damage.matrix.base = actorData.matrix.attributes.attack.value;
    rollData.various.defenseFirstAttribute = actorData.matrix.ice.defenseFirstAttribute;
    rollData.various.defenseSecondAttribute = actorData.matrix.ice.defenseSecondAttribute;

    return rollData;
}