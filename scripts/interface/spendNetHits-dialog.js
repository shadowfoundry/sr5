import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "../rolls/diceHelper.js";

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
if (html.find('[name="chooseSpendNetHits"]')[0]) this._updateChooseSpendNetHits(html, dialogData);
html.find('[name="chooseSpendNetHits"]').change(ev => this._updateChooseSpendNetHits(html, dialogData));

    }

    // Update disposable net hits for Called Shots
    async _updateChooseSpendNetHits(html, dialogData){
    let numberCheckedEffects = html.find("[name='checkDisposableHitsEffects']:checked").length;
    let updateDisposableHits = dialogData.disposableHits - numberCheckedEffects;
    html.find('[name="disposableHits"]')[0].value = updateDisposableHits;
    }

}