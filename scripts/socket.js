import { SR5Combat } from "./system/srcombat.js";
import { SR5_SystemHelpers } from "./system/utility.js";
import { SR5Actor } from "./entities/actors/entityActor.js";

export class SR5_SocketHandler {
    static registerSocketListeners() {
        const hooks = {
            "doNextRound": [SR5Combat._handleDoNextRoundSocketMessage],
            "doInitPass": [SR5Combat._handleDoInitPassSocketMessage],
            "createSidekick": [SR5Actor._handlecreateSidekickSocketMessage],
            "dismissSidekick": [SR5Actor._handleDismissSidekickSocketMessage],
            "addItemToPan": [SR5Actor._handleAddItemToPanSocketMessage],
            "deleteItemFromPan": [SR5Actor._handleDeleteItemFromPanSocketMessage],
        }

        game.socket.on(`system.sr5`, async (message) => {
            SR5_SystemHelpers.srLog(3,'Received Shadowrun5e system socket message.', message);
            const handlers = hooks[message.type];
            if (!handlers || handlers.length === 0) return console.warn('System socket message without handler!', message);
            // In case of targeted socket message only execute with target user (intended for GM usage)
            if (message.userId && game.user.id !== message.userId) return;
            if (message.userId && game.user.id) SR5_SystemHelpers.srLog(3,'GM is handling Shadowrun5e system socket message');

            for (const handler of handlers) {
                SR5_SystemHelpers.srLog(3, 'Handover Shadowrun5e system socket message to handler', handler);
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
        if (game.user.isGM) return SR5_SystemHelpers.srLog(1, 'Active user is GM! Aborting socket message...');

        const gmUser = game.users.find(user => user.isGM);
        if (!gmUser) return SR5_SystemHelpers.srLog(1, 'No active GM user! One GM must be active for this action to work.');

        const message = SR5_SocketHandler._createMessage(type, data, gmUser.id);
        await game.socket.emit(`system.sr5`, message);
    }
}