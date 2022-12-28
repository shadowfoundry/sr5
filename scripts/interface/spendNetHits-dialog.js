export default class SR5_SpendDialog extends Dialog {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            height: 'auto',
            resizable: false,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        let dialogData = this.data.data;

        // Update disposable net hits for Called Shots
        html.find('[name="chooseSpendNetHits"]').change(ev => this._updateChooseSpendNetHits(ev, html, dialogData));
    }

    // Update disposable net hits for Called Shots
    async _updateChooseSpendNetHits(ev, html, dialogData){
        let numberCheckedEffects = html.find("[name='checkDisposableHitsEffects']:checked").length;
        if (numberCheckedEffects > dialogData.disposableHits) {
            ev.target.checked = false;
            ui.notifications.warn(game.i18n.format('SR5.WARN_NoMoreHitsToSpend'));
        } else {
            let updateDisposableHits = dialogData.disposableHits - numberCheckedEffects;
            html.find('[name="disposableHits"]')[0].value = updateDisposableHits;
        }
    }

}