import { SR5Combat } from "./system/srcombat.js";
import { SR5_SystemHelpers } from "./system/utilitySystem.js";
import { SR5Actor } from "./entities/actors/entityActor.js";
import { SR5_RollMessage } from "./rolls/roll-message.js";
import { SR5_MarkHelpers } from "./rolls/roll-helpers/mark.js";
import { SR5_MiscellaneousHelpers } from "./rolls/roll-helpers/miscellaneous.js";
import { SR5_ActorHelper } from "./entities/actors/entityActor-helpers.js";

export class SR5_SocketHandler {
    static registerSocketListeners() {
        const hooks = {
            "doNextRound": [SR5Combat._socketDoNextRound],
            "doInitPass": [SR5Combat._socketDoInitPass],
            "updateCombat": [SR5Combat._socketUpdateCombat],
            "changeInitInCombat": [SR5Combat._socketChangeInitInCombat],
            "createSidekick": [SR5_ActorHelper._socketCreateSidekick],
            "dismissSidekick": [SR5_ActorHelper._socketDismissSidekick],
            "addItemToPan": [SR5_ActorHelper._socketAddItemToPan],
            "deleteItemFromPan": [SR5_ActorHelper._socketDeleteItemFromPan],
            "deleteMarksOnActor": [SR5_ActorHelper._socketDeleteMarksOnActor],
            "deleteMarkInfo": [SR5_ActorHelper._socketDeleteMarkInfo],
            "updateDeckMarkedItems": [SR5_MarkHelpers._socketUpdateDeckMarkedItems],
            "markPanMaster": [SR5_MarkHelpers._socketMarkPanMaster],
            "markSlavedDevice": [SR5_MarkHelpers._socketMarkSlavedDevice],
            "markItem": [SR5_MarkHelpers._socketMarkItem],
            "eraseMark": [SR5_MarkHelpers._socketEraseMark],
            "overwatchIncrease": [SR5_ActorHelper._socketOverwatchIncrease],
            "linkEffectToSource": [SR5_ActorHelper._socketLinkEffectToSource],
            "deleteSustainedEffect": [SR5_ActorHelper._socketDeleteSustainedEffect],
            "deleteItem": [SR5_MiscellaneousHelpers._socketDeleteItem],
            "updateItem": [SR5_MiscellaneousHelpers._socketUpdateItem],
            "updateChatButton": [SR5_RollMessage._socketUpdateChatButton],
            "updateRollCard": [SR5_RollMessage._socketUpdateRollCard],
            "heal": [SR5_ActorHelper._socketHeal],
            "updateActorData": [SR5_MiscellaneousHelpers._socketUpdateActorData],
            "takeDamage":[SR5_ActorHelper._socketTakeDamage],
            "actorRoll": [SR5Actor._socketRollTest],
        }

        game.socket.on(`system.sr5`, async (message) => {
            SR5_SystemHelpers.srLog(3,'Received Shadowrun 5 system socket message.', message);
            const handlers = hooks[message.type];
            if (!handlers || handlers.length === 0) return console.warn('System socket message without handler!', message);
            if (message.userId && game.user.id !== message.userId) return;
            if (message.userId && game.user.id) SR5_SystemHelpers.srLog(3,'GM is handling Shadowrun 5 system socket message');

            for (const handler of handlers) {
                await handler(message);
            }
        });
    }

    static _createMessage(type, data, userId) {
        return {type, data, userId}
    }

    static async emit(type, data) {
        const message = SR5_SocketHandler._createMessage(type, data);
        await game.socket.emit(`system.sr5`, message);
    }

    static async emitForGM(type, data) {
        if (game.user.isGM) return SR5_SystemHelpers.srLog(1, 'Active user is GM, abort');

        const gmUser = game.users.find(user => user.isGM && user.active);
        if (!gmUser) return SR5_SystemHelpers.srLog(1, 'No active GM user!');

        const message = SR5_SocketHandler._createMessage(type, data, gmUser.id);
        await game.socket.emit(`system.sr5`, message);
    }

    static async emitForPlayer(type, data, playerId) {
        const message = SR5_SocketHandler._createMessage(type, data, playerId);
        await game.socket.emit(`system.sr5`, message);
    }
}