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
        let actorData = duplicate(actor.system);

        //change value
        if (boolean) {
            let oldvalue = path.split('.').reduce((previous, current) => previous[current], actorData);
            mergeObject(actorData, {[path]: !oldvalue,});
        } else mergeObject(actorData, {[path]: value,});

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

}