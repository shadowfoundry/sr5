import { SR5 } from "../config.js";

export default class SR5SceneConfig extends SceneConfig {
    constructor(...args) {
        super(...args);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        return foundry.utils.mergeObject(super.defaultOptions, {
            lists: SR5,
        });
    }

    get template() {
        return `systems/sr5/templates/interface/sceneConfig.html`;
    }

    getData(options={}) {
        const context = super.getData(options);
        if (foundry.utils.isEmpty(context.data.flags.sr5)) context.data.flags.sr5 = {}
        context.data.flags.sr5.lists = SR5
        return context
    }

    updateMatrixNoise(html) {
        let matrixNoise = (parseInt(this.document.flags.sr5?.matrixSpam) || 0) + (parseInt(this.document.flags.sr5?.matrixStatic) || 0);
        html.find('[name="sceneNoiseRating"]')[0].value = matrixNoise;
        this.document.setFlag("sr5", "matrixNoise", matrixNoise);
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.updateMatrixNoise(html);

        html.find('[name="matrixSpam"]').change(ev => {
            let value = (parseInt(ev.target.value) || 0);
            this.document.setFlag("sr5", "matrixSpam", value);
            this.updateMatrixNoise(html);
        });

        html.find('[name="matrixStatic"]').change(ev => {
            let value = (parseInt(ev.target.value) || 0);
            this.document.setFlag("sr5", "matrixStatic", value);
            this.updateMatrixNoise(html);
        });
    }

}