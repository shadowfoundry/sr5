import { SR5 } from "../config.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";

export class SR5CompendiumInfo {
    static async onRenderCompendium(compendium, html, compendiumData) {
        const pack = compendium.collection;
        if (pack.metadata.system === "sr5") {
            html.querySelectorAll('.directory-item').forEach(el => {
                SR5CompendiumInfo.selectInfo(pack, el);
            });
        }
    }

    static async selectInfo(pack, element){
        let itemId = element.dataset.documentId ?? element.dataset.entryId;
        if (!itemId) {
            SR5_SystemHelpers.srLog(1, `Compendium selectInfo: element has no documentId or entryId in pack "${pack.metadata.label}" (${pack.metadata.id})`);
            return;
        }
        let item = await pack.getDocument(itemId);
        if (!item) {
            SR5_SystemHelpers.srLog(1, `Compendium selectInfo: getDocument("${itemId}") returned undefined in pack "${pack.metadata.label}" (${pack.metadata.id})`);
            return;
        }
        let info;

        switch (item.type){
            case "itemWeapon":
                if (item.system.category === "grenade") info = game.i18n.localize('SR5.Grenade');
                else info = game.i18n.localize(SR5.allWeaponsTypes[item.system.type]);
            break;
            case "itemArmor":
                if (item.system.isAccessory) info = game.i18n.localize('SR5.ArmorAccessory');
                else info = `${game.i18n.localize('SR5.ArmorRating')}${game.i18n.localize('SR5.Colons')} ${item.system.armorValue.value}`;
                break;
            case "itemDevice":
                info = `${game.i18n.localize(SR5.deckTypes[item.system.type])} (${item.system.deviceRating})`;
                break;
            case "itemAugmentation":
                info = `${game.i18n.localize(SR5.augmentationTypes[item.system.type])}`;
                break;
            case "itemProgram":
                info = `${game.i18n.localize(SR5.programTypes[item.system.type])}`;
                break;
            case "itemSpell":
                info = `${game.i18n.localize(SR5.spellCategories[item.system.category])}`;
                break;
            case "itemQuality":
                info = `${game.i18n.localize('SR5.KarmaCost')}${game.i18n.localize('SR5.Colons')} ${item.system.karmaCost}`;
                break;
            case "itemVehicle":
                info = `${game.i18n.localize(SR5.vehiclesCategories[item.system.category])}`;
                break;
            case "itemVehicleMod":
                info = `${game.i18n.localize(SR5.vehicleModType[item.system.type])}`;
                break;
            case "actorPc":
                if (item.system.sheetPreferences.tabBiography.critterBiography && item.system.critterBiography.terrain !== "") {
                    info = `${game.i18n.localize('SR5.CritterTerrain')}${game.i18n.localize('SR5.Colons')} ${item.system.critterBiography.terrain}`;
                }
                else info = ""
                break;
            default:
                info = ""
        }
        if (info !== "") SR5CompendiumInfo.insertInfo(element, info);
    }

    static async insertInfo(element, info){
        element.children[1].insertAdjacentHTML('afterend', `<div class="grid SR-CompendiumSubType"><div class="col-12">${info}</div></div>`);
    }
}