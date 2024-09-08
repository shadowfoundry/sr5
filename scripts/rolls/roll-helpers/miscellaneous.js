import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_SocketHandler } from "../../socket.js";

export class SR5_MiscellaneousHelpers {
    /** Update an actor with given data
     * @param {string} actorId - Target actor's ID
     * @param {string} path - Path to the key, without 'system'
     * @param {number} value - The new value
     * @param {boolean} boolean - If the value to change is a boolean, default = false
     */
    static async updateActorData(actorId, path, value, boolean = false){
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
        if (!actor) return;
        let actorData = foundry.utils.duplicate(actor.system);

        //change value
        if (boolean) {
            let oldvalue = path.split('.').reduce((previous, current) => previous[current], actorData);
            foundry.utils.mergeObject(actorData, {[path]: !oldvalue,});
        } else foundry.utils.mergeObject(actorData, {[path]: value,});

        //update actor
        if (!game.user?.isGM) {
            await SR5_SocketHandler.emitForGM("updateActorData", {
                actorId: actorId,
                dataToUpdate: actorData,
            });
        } else await actor.update({"system": actorData});
    }

    //Socket for updating an actor
    static async _socketUpdateActorData(message) {
        let actor = SR5_EntityHelpers.getRealActorFromID(message.data.actorId);
        await actor.update({'system': message.data.dataToUpdate});
    }

    //Socket for updating an item
    static async _socketUpdateItem(message) {
        let target = await fromUuid(message.data.item);
        await target.update({'system': message.data.info});
	}

    //Socket for deleting an item
    static async _socketDeleteItem(message){
        let item = await fromUuid(message.data.item);
        await item.delete();
    }

    static findMedkitRating(actor){
        let medkit = {};
        let item = actor.items.find(i => i.system.isMedkit)
        if (item && item.system.charge > 0){
            medkit.rating = item.system.itemRating;
            medkit.uuid = item.uuid;
            return medkit;
        }
    }

    //Add an action to actions array, removing foundry.utils.duplicated source
    static addActions(actions, actionToAdd){
        if (!actions.length) actions.push(actionToAdd);
        else {
            if (actions.find(a => a.source === actionToAdd.source)) {
                actions = actions.filter(a => a.source !== actionToAdd.source);
                actions.push(actionToAdd);
            } else {
                actions.push(actionToAdd);
            }
        }
        return actions;
    }

    //Remove an action from array
    static removeActions(actions, actionToRemove){
        if (!actions.length) return actions;
        if (actions.find(a => a.source === actionToRemove)) return actions = actions.filter(a => a.source !== actionToRemove);
        else return actions;
    }

    /**
     *Remove one element of an Array based on key / value
    @param {arr} array the source array
    @param {key} string the key to check
    @param {value} string the targeted value
    */
    static removeElementFromArray(arr, key, value) {
        const index = arr.findIndex((element) => element[key] === value);
        if (index !== -1) {
          arr.splice(index, 1);
        }
    }
}