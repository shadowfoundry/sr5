//Customize Sheet section

export class SRActorSheetConfig extends Dialog {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            height: 'auto',
            width: 600,
            resizable: false,
        });
    }

    static async buildDialog(actor) {
        let cancel = true;
        let dialogData = actor.system.sheetPreferences;
        let actorData = foundry.utils.duplicate(actor.system);
        let template;

        if (actor.type === "actorPc") template = "systems/sr5/templates/interface/sheetConfigActor.html";
        if (actor.type === "actorGrunt") template = "systems/sr5/templates/interface/sheetConfigGrunt.html";

        renderTemplate(template, dialogData).then((dlg) => {
            new SRActorSheetConfig({
                title: game.i18n.localize('SR5.CharacterSheetCustomization'),
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
                close: async (html) => {
                    if (cancel) return;
                    let options = html.find("[name='option']");
                    for (let o of options){
                        let isChecked = html.find(`[id=${o.id}]`).is(":checked");
                        let path= "sheetPreferences." + o.value;
                        foundry.utils.setProperty(actorData, path, isChecked);
                    }
                    actor.update({"system": actorData});

                    
                },
            }).render(true);
        });

    }

    activateListeners(html) {
        super.activateListeners(html)

        if (html.find(".toggleSection")) this._checkParentState(html.find(".toggleSection"), html);
        html.find(".toggleSection").click(ev => this._onToggleParent(ev, html));
    }

    _onToggleParent(ev, html){
        let targetId = $(ev.currentTarget).closest("ul").attr("id");
        let elementId = $(ev.currentTarget).attr("id");
        
        if (html.find(`[id=${elementId}]`).is(":checked")) html.find(`[id=${targetId}]`)[0].classList.remove("SR-LightGreyColor");
        else html.find(`[id=${targetId}]`)[0].classList.add("SR-LightGreyColor");
    }

    _checkParentState(parents, html){
        for (let p of parents){
            let targetId = html.find(`[id=${p.id}]`).closest("ul").attr("id");
            let isChecked = html.find(`[id=${p.id}]`).is(":checked");
            if (isChecked) html.find(`[id=${targetId}]`)[0].classList.remove("SR-LightGreyColor");
            else html.find(`[id=${targetId}]`)[0].classList.add("SR-LightGreyColor");
        }

    }
}