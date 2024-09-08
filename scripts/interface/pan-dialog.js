import { SR5_EntityHelpers } from "../entities/helpers.js";

export default class SR5_PanDialog extends Dialog {
    
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            height: 'auto',
            resizable: false,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('[name="actor"]').change(ev => {
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
        const content = await renderTemplate("systems/sr5/templates/interface/addItemToPan.html", dialogData);
        this.data.content = content
        this.render(true);
    }

}