import { SR5 } from "../config.js";

export default class SR5MeasuredTemplateConfig extends foundry.applications.sheets.MeasuredTemplateConfig {
    constructor(...args) {
        super(...args);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        return foundry.utils.mergeObject(super.defaultOptions, {
            tabs: [
				{
					navSelector: ".tabs",
					contentSelector: "form",
					initial: "basic",
				},
			],
            lists: SR5,
        });
    }

    getData(options={}) {
        const context = super.getData(options);
        context.data.flags.sr5.lists = SR5
        return context
    }
    
    get template() {
        return `systems/sr5/templates/interface/srTemplateConfig.html`;
    }

    updateMatrixNoise(element) {
        let matrixNoise = (parseInt(this.document.flags.sr5?.matrixSpam) || 0) + (parseInt(this.document.flags.sr5?.matrixStatic) || 0);
        const noiseField = element.querySelector('[name="sceneNoiseRating"]');
        if (noiseField) noiseField.value = matrixNoise;
        this.document.setFlag("sr5", "matrixNoise", matrixNoise);
    }

    activateListeners(html) {
        super.activateListeners(html);
        const element = html instanceof HTMLElement ? html : html[0];
        this.updateMatrixNoise(element);

        const matrixSpam = element.querySelector('[name="matrixSpam"]');
        if (matrixSpam) matrixSpam.addEventListener("change", ev => {
            let value = (parseInt(ev.target.value) || 0);
            this.document.setFlag("sr5", "matrixSpam", value);
            this.updateMatrixNoise(element);
        });

        const matrixStatic = element.querySelector('[name="matrixStatic"]');
        if (matrixStatic) matrixStatic.addEventListener("change", ev => {
            let value = (parseInt(ev.target.value) || 0);
            this.document.setFlag("sr5", "matrixStatic", value);
            this.updateMatrixNoise(element);
        });
    }
}