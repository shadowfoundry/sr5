import { SR5_RollMessage } from "./roll-message.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_SocketHandler } from "../socket.js";

export class SR5_RollTestHelper {

    //Handle when a test is aborted
    static handleCanceledTest(actor, dialogData){
        //If item have placed a canvas template before rolling the test (like grenade), remove it
        if (dialogData.dialogSwitch.templateRemove) SR5_RollMessage.removeTemplate(null, dialogData.itemUuid);
        //Remove last cumulative Defense if roll is cancelled.
		if (actor.flags?.sr5?.cumulativeDefense){
			actor.setFlag("sr5", "cumulativeDefense", (actor.flags.sr5.cumulativeDefense -1));
		}    
    }


    //Determine if current actor rolling test can use Edge on it
	static async canUseEdge(actor, dialogData){
		let canUseEdge = false;
		if (actor.system.specialAttributes?.edge && (actor.system.conditionMonitors.edge?.actual.value < actor.system.specialAttributes?.edge?.augmented.value)) {
			canUseEdge = true;
		}
		if (actor.type === "actorSpirit" && actor.system.creatorId){
			let creator = SR5_EntityHelpers.getRealActorFromID(actor.system.creatorId);
			if (creator.system.conditionMonitors.edge?.actual?.value < creator.system.specialAttributes?.edge?.augmented?.value){
				canUseEdge = true;
			}
		}
		if (dialogData.test.type === "objectResistance")  canUseEdge = false;
		if (dialogData.test.type === "preparation")  canUseEdge = false;
		return canUseEdge;
	}

    //Handle the use of Edge : remove edge point from actor and add info to roll data
    static async handleEdgeUse(edgeActor, dialogData){
        dialogData.dicePool.modifiers.edge = {
            value: edgeActor.system.specialAttributes.edge.augmented.value,
            label: game.i18n.localize("SR5.Edge"),
        }
        edgeActor.update({
            "system.conditionMonitors.edge.actual.base": edgeActor.system.conditionMonitors.edge.actual.base + 1,
        });
        dialogData.edge.canUseEdge = false;
        return dialogData;
    }

    //Determine from whom actor edge must be reduce
	static async determineEdgeActor(actor){
		let edgeActor = actor;
		if (actor.type === "actorSpirit" && actor.system.creatorId){
			let creator = SR5_EntityHelpers.getRealActorFromID(actor.system.creatorId);
			if (creator.system.conditionMonitors.edge?.actual?.value < creator.system.specialAttributes?.edge?.augmented?.value){
				edgeActor = creator;
			}
		}
		return edgeActor;
	}

    //Remove 1 edge from actor
	static async removeEdgeFromActor(messageData, actor) {
		if (actor.type === "actorSpirit") {
			let creator = SR5_EntityHelpers.getRealActorFromID(actor.system.creatorId);
			creator.update({ "system.conditionMonitors.edge.actual.base": creator.system.conditionMonitors.edge.actual.base + 1 });
		} else {
			//If actor is grunt, change actor to parent
			if (actor.isToken) actor = game.actors.get(actor.id);
			actor.update({ "system.conditionMonitors.edge.actual.base": actor.system.conditionMonitors.edge.actual.base + 1 });
		}
	}

    //Iterate through roll dicepool modifiers and get the final dicePool
    static async handleDicePoolModifiers(dialogData){
        dialogData.dicePool.modifiersTotal = 0;
        for (let key in dialogData.dicePool.modifiers){
            dialogData.dicePool.modifiersTotal += dialogData.dicePool.modifiers[key].value;
            dialogData.dicePool.hasModifier = true;
        }
        dialogData.dicePool.value = dialogData.dicePool.base + dialogData.dicePool.modifiersTotal;
        //Debug DicePool can't be negative
        if (dialogData.dicePool.value < 0) dialogData.dicePool.value = 0;
        return dialogData;
    }

    //Iterate through roll limit modifiers and get the final limit
    static async handleLimitModifiers(dialogData){
        for (let key in dialogData.limit.modifiers){
            dialogData.limit.modifiersTotal += dialogData.limit.modifiers[key].value;
            dialogData.limit.hasModifier = true;
        }
        dialogData.limit.value = dialogData.limit.base + dialogData.limit.modifiersTotal;
        //Debug limit can't be negative
        if (dialogData.limit.value < 0) dialogData.limit.value = 0;
        return dialogData;
    }

    // Update an item after a roll
    static async updateItemAfterRoll(cardData) {
        let item = await fromUuid(cardData.owner.itemUuid);
        let newItem = duplicate(item);
        let firedAmmo = cardData.combat.ammo.fired;
        
        //Discard for none supported item
        if (newItem.type === "itemKnowledge") return;

        //update weapon ammo and fire Mode
        if (!firedAmmo) firedAmmo = 1;
        if (newItem.type === "itemWeapon" && newItem.system.category === "rangedWeapon") {
            newItem.system.ammunition.value -= firedAmmo;
            if (newItem.system.ammunition.value < 0) newItem.system.ammunition.value = 0;
            if (newItem.system.firingMode.current !== cardData.combat.firingMode.selected){
                newItem.system.firingMode.current = cardData.combat.firingMode.selected;
            }
            if (newItem.system.choke.current !== cardData.combat.choke.selected){
                newItem.system.choke.current = cardData.combat.choke.selected;
            }
        }
        //update force and hits
        if (newItem.type === "itemSpell" || newItem.type === "itemPreparation" || newItem.type === "itemAdeptPower") {
            newItem.system.hits = cardData.roll.hits;
            newItem.system.force = cardData.magic.force;
        }
        //update level and hits
        if (newItem.type === "itemComplexForm") {
            newItem.system.hits = cardData.roll.hits;
            newItem.system.level = cardData.matrix.level;
        }
        //Update net hits
        if (newItem.type === "itemRitual") {
            newItem.system.force = cardData.magic.force;
            newItem.system.hits = cardData.roll.hits;
            newItem.system.netHits = cardData.previousMessage.hits - cardData.roll.hits;
            if (newItem.system.netHits < 0) newItem.system.netHits = 0;
        }
        //updateCharge
        if (newItem.type === "itemGear"){
            newItem.system.charge -= 1;
        }

        
        if (game.user?.isGM || cardData.owner.actorId == game.user?.character?._id) item.update(newItem);
        else SR5_SocketHandler.emitForGM("updateItem", {
            item: item.uuid,
            info: newItem,
        });
    }
}