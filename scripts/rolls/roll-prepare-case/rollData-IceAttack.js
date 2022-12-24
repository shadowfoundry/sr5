export default function iceAttack(rollData, actor){
    //Determine title
    rollData.test.title = game.i18n.localize("SR5.IceAttack");

    //Determine base dicepool
    rollData.dicePool.base = actor.system.matrix.ice.attackDicepool;

    //Determine dicepool composition
    rollData.dicePool.composition = [
        {source: game.i18n.localize("SR5.HostRating"), type: "linkedAttribute", value: actor.system.matrix.deviceRating},
        {source: game.i18n.localize("SR5.HostRating"), type: "linkedAttribute", value: actor.system.matrix.deviceRating},
    ];

    //Determine base limit
    rollData.limit.base = actor.system.matrix.attributes.attack.value;
    rollData.limit.type = "attack";
    
    //Add others informations
    rollData.test.type = "iceAttack";
    rollData.test.typeSub = actor.system.matrix.deviceSubType;
    rollData.damage.matrix.value = actor.system.matrix.attributes.attack.value;
    rollData.damage.matrix.base = actor.system.matrix.attributes.attack.value;
    rollData.various.defenseFirstAttribute = actor.system.matrix.ice.defenseFirstAttribute;
    rollData.various.defenseSecondAttribute = actor.system.matrix.ice.defenseSecondAttribute;

    return rollData;
}