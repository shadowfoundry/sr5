import { SR5Combat } from "./system/srcombat.js";
import { SR5_SystemHelpers } from "./system/utility.js";
import { SR5Actor } from "./entities/actors/entityActor.js";
import { SR5_DiceHelper } from "./rolls/diceHelper.js";

export class SR5_SocketHandler {
    static registerSocketListeners() {
        const hooks = {
            "doNextRound": [SR5Combat._socketDoNextRound],
            "doInitPass": [SR5Combat._socketDoInitPass],
            "createSidekick": [SR5Actor._socketCreateSidekick],
            "dismissSidekick": [SR5Actor._socketDismissSidekick],
            "addItemToPan": [SR5Actor._socketAddItemToPan],
            "deleteItemFromPan": [SR5Actor._socketDeleteItemFromPan],
            "deleteMarksOnActor": [SR5Actor._socketDeleteMarksOnActor],
            "deleteMarkInfo": [SR5Actor._socketDeleteMarkInfo],
            "updateDeckMarkedItems": [SR5_DiceHelper._socketUpdateDeckMarkedItems],
            "markPanMaster": [SR5_DiceHelper._socketMarkPanMaster],
            "markDevice": [SR5_DiceHelper._socketMarkDevice],
            "overwatchIncrease": [SR5Actor._socketOverwatchIncrease],
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
}