import { SR5_EntityHelpers } from "../entities/helpers.js";

export default class SR5_PanDialog extends foundry.appv1.api.Dialog {
    
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            height: 'auto',
            resizable: false,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        const element = html instanceof HTMLElement ? html : html[0];
        const actorSelect = element.querySelector('[name="actor"]');
        if (actorSelect) actorSelect.addEventListener("change", ev => {
            ev.preventDefault();
            let actor = SR5_EntityHelpers.getRealActorFromID(ev.target.value);
            let dialogData = {
                actor: actor.id,
                list: actor.system.matrix.potentialPanObject,
                actorList: this.data.data.actorList,
            };

            this.updateDialog(dialogData);
        });

    }

    async updateDialog(dialogData){
        const content = await foundry.applications.handlebars.renderTemplate("systems/sr5/templates/interface/addItemToPan.html", dialogData);
        this.data.content = content
        this.render(true);
    }

}