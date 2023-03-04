import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../../entities/helpers.js";
import { SR5_SocketHandler } from "../../socket.js";
import { SR5_ActorHelper } from "../../entities/actors/entityActor-helpers.js";

export class SR5_MarkHelpers {

    /** Put a mark on a specific Item
   * @param {Object} targetActor - The Actor who owns the item
   * @param {Object} attackerID - Actor ID who wants to put a mark
   * @param {Object} mark - Number of Marks to put
   * @param {Object} targetItem - Target item
   */
    static async markItem(targetActorID, attackerID, mark, targetItem) {
        let attacker = await SR5_EntityHelpers.getRealActorFromID(attackerID),
            targetActor = await SR5_EntityHelpers.getRealActorFromID(targetActorID),
            realAttackerID = attackerID,
            existingMark = false,
            item;

        if (targetItem) item = await fromUuid(targetItem);
        else item = targetActor.items.find(i => i.type === "itemDevice" && i.system.isActive);
        if (item.parent.type === "actorDevice" && item.parent.isToken) item = targetActor.items.find(i => i.type === "itemDevice" && i.system.isActive);

        let itemToMark = duplicate(item.system);

        //If attacker is an ice use serveur id to mark
        if(attacker.system.matrix.deviceType === "ice" && attacker.isToken){
            realAttackerID = attacker.id;
        }
        // If item is already marked, increase marks
        for (let m of itemToMark.marks){
            if (m.ownerId === realAttackerID) {
                m.value += mark;
                if (m.value > 3) m.value = 3;
                existingMark = true;
            }
        }
        // Add new mark to item
        if (!existingMark){
            let newMark = {
                "ownerId": realAttackerID,
                "value": mark,
                "ownerName": attacker.name,
            }
            itemToMark.marks.push(newMark)
        }
        await item.update({"system": itemToMark});

        //Update attacker deck with info
        if (!game.user?.isGM) {
                await SR5_SocketHandler.emitForGM("updateDeckMarkedItems", {
                ownerID: realAttackerID,
                markedItem: item.uuid,
                mark: mark,
            });
            if (itemToMark.isSlavedToPan){
                await SR5_SocketHandler.emitForGM("markPanMaster", {
                    itemToMark: itemToMark,
                    attackerID: realAttackerID,
                    mark: mark,
                });
            }
            if (targetActor.system.matrix.deviceType === "host"){
                await SR5_SocketHandler.emitForGM("markSlavedDevice", {
                    targetActorID: targetActorID,
                });
            }
        } else {  
            await SR5_MarkHelpers.updateDeckMarkedItems(realAttackerID, item.uuid, mark);
            if (itemToMark.isSlavedToPan) await SR5_MarkHelpers.markPanMaster(itemToMark, realAttackerID, mark);
            if (targetActor.system.matrix.deviceType === "host") await SR5_MarkHelpers.markSlavedDevice(targetActorID);
        }
    }

    //Socket for adding marks to main Device;
    static async _socketMarkItem(message) {
        await SR5_MarkHelpers.markItem(message.data.targetActor, message.data.attackerID, message.data.mark);
    }

    //Add mark to pan Master of the item
    static async markPanMaster(itemToMark, attackerID, mark){
        let panMaster = SR5_EntityHelpers.getRealActorFromID(itemToMark.panMaster);
        let masterDevice = panMaster.items.find(d => d.type === "itemDevice" && d.system.isActive);
        await SR5_MarkHelpers.markItem(itemToMark.panMaster, attackerID, mark, masterDevice.uuid);
    }

    //Socket for adding marks to pan Master of the item
    static async _socketMarkPanMaster(message) {
        await SR5_MarkHelpers.markPanMaster(message.data.itemToMark, message.data.attackerID, message.data.mark);
	}

    //Mark slaved device: for host, update all unlinked token with same marks
    static async markSlavedDevice(targetActorID){
        let targetActor = await SR5_EntityHelpers.getRealActorFromID(targetActorID),
            item = targetActor.items.find(i => i.type === "itemDevice" && i.system.isActive);

        for (let token of canvas.tokens.placeables){
            if (token.actor.id === targetActorID) {
                let tokenDeck = token.actor.items.find(i => i.type === "itemDevice" && i.system.isActive);
                let tokenDeckData = duplicate(tokenDeck.system);
                tokenDeckData.marks = item.system.marks;
                await tokenDeck.update({"system": tokenDeckData});
            }
        }
    }

    //Socket for marking slaved device
    static async _socketMarkSlavedDevice(message) {
        await SR5_MarkHelpers.markSlavedDevice(message.data.targetActorID);
	}

    //Add mark info to attacker deck
    static async updateDeckMarkedItems(ownerID, markedItem, mark){
        let owner = SR5_EntityHelpers.getRealActorFromID(ownerID),
            ownerDeck = owner.items.find(i => i.type === "itemDevice" && i.system.isActive),
            deckData = duplicate(ownerDeck.system),
            itemMarked = await fromUuid(markedItem),
            alreadyMarked = false;

        //If item is already marked, update value
        for (let m of deckData.markedItems){
            if (m.uuid === itemMarked.uuid) {
                m.value += mark;
                if (m.value > 3) m.value = 3;
                alreadyMarked = true;
            }
        }
        if (!alreadyMarked){
            let newMark = {
                "uuid": itemMarked.uuid,
                "value": mark,
                "itemName": itemMarked.name,
                'itemOwner': itemMarked.actor.name,
            }
            deckData.markedItems.push(newMark);
        }
        await ownerDeck.update({"system": deckData});

        //For host, update all unlinked token with same marked items
        if (owner.system.matrix.deviceType === "host"){
            for (let token of canvas.tokens.placeables){
                if (token.actor.id === ownerID) {
                    let tokenDeck = token.actor.items.find(i => i.type === "itemDevice" && i.system.isActive);
                    let tokenDeckData = duplicate(tokenDeck.system);
                    tokenDeckData.markedItems = deckData.markedItems;
                    await tokenDeck.update({"system": tokenDeckData});
                }
            }
        }
    }

    //Socket for updating marks items on other actors;
    static async _socketUpdateDeckMarkedItems(message) {
        await SR5_MarkHelpers.updateDeckMarkedItems(message.data.ownerID, message.data.markedItem, message.data.mark);
	}

    /** Find if an Actor has a Mark item with the same ID as the attacker
     * @param {Object} targetActor - The Target Actor who owns the Mark
     * @param {Object} attackerID - The ID of the attacker who wants to mark
     * @return {Object} the mark item
     */
    static async findMarkValue(item, ownerID){
        if (item.marks.length) {
            for (let m of item.marks){
                if (m.ownerId === ownerID) return m.value;
            }
            return 0;
        } else return 0;
    }

    static async eraseMarkChoice(cardData){
        let actor, cancel = true, newData = cardData;

        //Determine actor who is marked
        if (cardData.target.actorId) actor = SR5_EntityHelpers.getRealActorFromID(cardData.target.actorId);
        else actor = SR5_EntityHelpers.getRealActorFromID(cardData.owner.actorId);

        //Build marked items list
        let markedItems = actor.items.filter(i => i.system.marks?.length > 0);
        let dialogData = {list: markedItems,};

        //Check if at least one item has a mark
        if (!markedItems.length) return ui.notifications.info(`${actor.name}${game.i18n.localize("SR5.Colons")} ${game.i18n.localize('SR5.INFO_NoMarksToDelete')}`);

        //Render dialog to choose marked item
        renderTemplate("systems/sr5/templates/interface/chooseMark.html", dialogData).then((dlg) => {
            new Dialog({
                title: game.i18n.localize('SR5.ChooseMarkToErase'),
                content: dlg,
                data: dialogData,
                buttons: {
                    ok: {
                        label: "Ok",
                        callback: () => (cancel = false),
                    },
                    cancel: {
                        label: "Cancel",
                        callback: () => (cancel = true),
                    },
                },
                default: "ok",
                close: (html) => {
                    if (cancel) return;

                    let targetItem = html.find("[name=item]").val(),
                        item = markedItems.find(i => i.id === targetItem),
                        markOwner = SR5_EntityHelpers.getRealActorFromID(item.system.marks[0].ownerId);//Determine actor who marked

                    //Add info for building roll
                    newData.previousMessage.actorId = actor.id;
                    newData.previousMessage.itemUuid = item.uuid;

                    //Roll matrix defense test
                    markOwner.rollTest("matrixDefense", "eraseMark", newData);
                },
            }).render(true);
        });
    }

    static async eraseMark(cardData){
        let item = await fromUuid(cardData.previousMessage.itemUuid),
            itemData = duplicate(item.system);

        //Iterate through marked item and remove the one from the same source
        for (let i = 0; i < itemData.marks.length; i++){
            if (itemData.marks[i].ownerId === cardData.owner.actorId) {
                itemData.marks[i].value -= 1;
                if (itemData.marks[i].value <= 0){
                    itemData.marks.splice(i, 1);
                    i--;
                }
            }
        }
        await item.update({"system": itemData});
        //Delete mark from owner deck
        await SR5_ActorHelper.deleteMarkInfo(cardData.owner.actorId, cardData.previousMessage.itemUuid);
    }

    static async _socketEraseMark(message){
        await SR5_MarkHelpers.eraseMark(message.data.cardData);
    }
}