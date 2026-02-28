export default class SR5_SpendDialog extends foundry.appv1.api.Dialog {
    
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            height: 'auto',
            resizable: false,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        const element = html instanceof HTMLElement ? html : html[0];
        let dialogData = this.data.data;

        // Update disposable net hits for Called Shots
        element.querySelectorAll('[name="chooseSpendNetHits"]').forEach(el => {
            el.addEventListener("change", ev => this._updateChooseSpendNetHits(ev, element, dialogData));
        });
    }

    // Update disposable net hits for Called Shots
    async _updateChooseSpendNetHits(ev, element, dialogData){
        let numberCheckedEffects = element.querySelectorAll("[name='checkDisposableHitsEffects']:checked").length;
        if (numberCheckedEffects > dialogData.disposableHits) {
            ev.target.checked = false;
            ui.notifications.warn(game.i18n.format('SR5.WARN_NoMoreHitsToSpend'));
        } else {
            let updateDisposableHits = dialogData.disposableHits - numberCheckedEffects;
            const field = element.querySelector('[name="disposableHits"]');
            if (field) field.value = updateDisposableHits;
        }
    }

}