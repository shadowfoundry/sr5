import { SR5_EntityHelpers } from "../entities/helpers.js";

export default class SR5_PanDialog {

    static async create({title, content, data}) {
        let dialogData = {...data};

        return foundry.applications.api.DialogV2.wait({
            window: { title },
            content,
            buttons: [
                {
                    action: "ok",
                    label: "Ok",
                    default: true,
                    callback: (event, button, dialog) => ({ action: "ok", element: dialog.element }),
                },
                {
                    action: "cancel",
                    label: "Cancel",
                    callback: () => ({ action: "cancel" }),
                },
            ],
            rejectClose: false,
            render: (event, dialog) => {
                const element = dialog.element;
                // Use event delegation so listener persists across content updates
                element.addEventListener("change", async ev => {
                    if (ev.target.name !== "actor") return;
                    ev.preventDefault();
                    let actor = SR5_EntityHelpers.getRealActorFromID(ev.target.value);
                    dialogData = {
                        actor: actor.id,
                        list: actor.system.matrix.potentialPanObject,
                        actorList: dialogData.actorList,
                    };
                    const newContent = await foundry.applications.handlebars.renderTemplate(
                        "systems/sr5/templates/interface/addItemToPan.html", dialogData
                    );
                    const contentDiv = element.querySelector('.dialog-content');
                    if (contentDiv) contentDiv.innerHTML = newContent;
                });
            },
        });
    }

}
