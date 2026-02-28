//Customize Sheet section

export class SRActorSheetConfig extends foundry.appv1.api.Dialog {
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

        foundry.applications.handlebars.renderTemplate(template, dialogData).then((dlg) => {
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
                    const element = html instanceof HTMLElement ? html : html[0];
                    let options = element.querySelectorAll("[name='option']");
                    for (let o of options){
                        let isChecked = element.querySelector(`#${o.id}`)?.checked ?? false;
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
        const element = html instanceof HTMLElement ? html : html[0];

        const toggleSections = element.querySelectorAll(".toggleSection");
        if (toggleSections.length) this._checkParentState(toggleSections, element);
        toggleSections.forEach(el => {
            el.addEventListener("click", ev => this._onToggleParent(ev, element));
        });
    }

    _onToggleParent(ev, element){
        let targetId = ev.currentTarget.closest("ul")?.id;
        let elementId = ev.currentTarget.id;

        const checkbox = element.querySelector(`#${elementId}`);
        const targetEl = element.querySelector(`#${targetId}`);
        if (checkbox?.checked) targetEl?.classList.remove("SR-LightGreyColor");
        else targetEl?.classList.add("SR-LightGreyColor");
    }

    _checkParentState(parents, element){
        for (let p of parents){
            let targetId = p.closest("ul")?.id;
            let isChecked = element.querySelector(`#${p.id}`)?.checked ?? false;
            const targetEl = element.querySelector(`#${targetId}`);
            if (isChecked) targetEl?.classList.remove("SR-LightGreyColor");
            else targetEl?.classList.add("SR-LightGreyColor");
        }

    }
}