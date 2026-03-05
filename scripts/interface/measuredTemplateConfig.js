import { SR5 } from "../config.js";

export default class SR5MeasuredTemplateConfig extends foundry.applications.sheets.MeasuredTemplateConfig {

    static PARTS = {
        ...foundry.applications.sheets.MeasuredTemplateConfig.PARTS,
        sr5tabs: { template: "systems/sr5/templates/interface/template-sr5-tabs.html" }
    };

    static TABS = {
        sheet: {
            tabs: [
                { id: "main", icon: "fa-solid fa-ruler-combined", label: "CONTROLS.MeasureConfigHint" },
                { id: "environmentalMod", icon: "fa-solid fa-cloud-sun-rain", label: "SR5.EnvironmentalModifiers" },
            ],
            initial: "main"
        }
    };

    async _preparePartContext(partId, context, options) {
        context = await super._preparePartContext(partId, context, options);
        if (partId === "sr5tabs") {
            context.sr5lists = SR5;
        }
        return context;
    }

    updateMatrixNoise(element) {
        let matrixNoise = (parseInt(this.document.flags.sr5?.matrixSpam) || 0) + (parseInt(this.document.flags.sr5?.matrixStatic) || 0);
        const noiseField = element.querySelector('[name="sceneNoiseRating"]');
        if (noiseField) noiseField.value = matrixNoise;
        this.document.setFlag("sr5", "matrixNoise", matrixNoise);
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        this.updateMatrixNoise(this.element);

        const matrixSpam = this.element.querySelector('[name="flags.sr5.matrixSpam"]');
        if (matrixSpam) matrixSpam.addEventListener("change", ev => {
            this.updateMatrixNoise(this.element);
        });

        const matrixStatic = this.element.querySelector('[name="flags.sr5.matrixStatic"]');
        if (matrixStatic) matrixStatic.addEventListener("change", ev => {
            this.updateMatrixNoise(this.element);
        });
    }
}
