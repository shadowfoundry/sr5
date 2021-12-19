import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../helpers.js";

/**
 * Override and extend the core ItemSheet implementation to handle Shadowrun 5 specific item types
 * @type {ItemSheet}
 */
export class SR5ItemSheet extends ItemSheet {
  constructor(...args) {
    super(...args);

    this._sheetTab = null;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 510,
      height: 445,
      classes: ["SR-Item", "sheet", "item"],
      resizable: false,
      scrollY: [".SR_ItemScrollY"],
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".sr-tabs",
          initial: "description",
        },
      ],
    });
  }

  /**
   * Récupère un template html spécifique en fonction du type d'objet
   */

  get template() {
    let type = this.item.type;
    return `systems/sr5/templates/items/${type}-sheet.html`;
  }

  getData(options) {
    const data = super.getData(options);
    data.data = data.data.data;
    data.lists = SR5_EntityHelpers.sortTranslations(SR5);
    return data;
  }

  /**
   * Activate listeners for interactive item sheet events
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".subItem").click(this._onManageSubItem.bind(this));
    html.find(".accessoryChoice").click(this._onAccessoryChoice.bind(this));

    // Checkbox changes
    html.find('input[type="checkbox"]').change((event) => {
      this._onSubmit(event);
    });

    // Help Display
    html.find("[data-helpTitle]").mouseover(this._displayHelpText.bind(this));
    html.find("[data-helpTitle]").mouseout(this._hideHelpText.bind(this));

    // Gestion des cases de dégats
    html.find(".boxes:not(.box-disabled)").click((ev) => {
      let itemData = duplicate(this.item);
      let index = Number($(ev.currentTarget).attr("data-index"));
      let target = $(ev.currentTarget)
        .parents(".SR-MoniteurCases")
        .attr("data-target");

      let value = getProperty(itemData, target);
      if (value == index + 1)
        // If the last one was clicked, decrease by 1
        setProperty(itemData, target, index);
      // Otherwise, value = index clicked
      else setProperty(itemData, target, index + 1);

      this.item.update(itemData);
    });
  }

  // Manage "Sub Item", accessory, licenses, effects...
  async _onManageSubItem(event){
    event.preventDefault();
    const a = event.currentTarget;
    const data = this.item.data.data;
    let target = $(event.currentTarget).attr("data-binding");
    let action = $(event.currentTarget).attr("data-action");
    let index = $(event.currentTarget).attr("data-index");
    let targetValue = $(event.currentTarget).attr("data-targetvalue");
    let key = `data.${target}`;

    //Add a subItem
    if (action === "add") {
      await this._onSubmit(event); // Submit any unsaved changes
      // convert back manually to array... so stupid to have to do this.
      if (typeof data[target] === "object") { data[target] = Object.values(data[target]); } 
      return this.item.update({[key]: data[target].concat([[""]])});
    }

    // Remove a subItem
    if (action === "delete") {
      await this._onSubmit(event); // Submit any unsaved changes
      const li = a.closest(".subItemManagement");
      let removed = duplicate(this.item.data.data[target]);
      // convert back manually to array... so stupid to have to do this.
      if (typeof removed === "object") { removed = Object.values(removed); } 
      removed.splice(Number(li.dataset.key), 1);
      return this.item.update({[key]: removed });
    }

    // Clone a subItem
    if (action === "clone") {
      await this._onSubmit(event); // Submit any unsaved changes
      const li = a.closest(".subItemManagement");
      let cloned = duplicate(this.item.data.data[target]);
      // convert back manually to array... so stupid to have to do this.
      if (typeof cloned === "object") { cloned = Object.values(cloned); }
      cloned.push(cloned[Number(li.dataset.key)]);
      return this.item.update({[key]: cloned });
    }
  }

  //Manage accessory choice
  async _onAccessoryChoice(event){
    let type = $(event.currentTarget).attr("data-type");
    let accessoriesList = {};

    for (let i of this.item.actor.items){
      if (type === "itemArmor"){
        if ((i.type === "itemArmor" || i.type === "itemGear") && i.data.data.isAccessory && !i.data.data.isPlugged){
          accessoriesList[i.id] = i.name;
        }
      } else {
        if ((i.type === type) && i.data.data.isAccessory && !i.data.data.isPlugged){
          accessoriesList[i.id] = i.name;
        }
      }
    }

    let sortedList = SR5_EntityHelpers.sortObjectValue(accessoriesList);

    let cancel = true;
    let dialogData = {
      accessoriesList: sortedList,
    };

    renderTemplate("systems/sr5/templates/interface/chooseAccessory.html", dialogData).then((dlg) => {
      new Dialog({
        title: game.i18n.localize('SR5.ChooseAccessory'),
        content: dlg,
        buttons: {
          ok: {
            label: "Ok",
            callback: () => (cancel = false),
          },
          cancel: {
            label : "Cancel",
            callback: () => (cancel = true),
          },
        },
        default: "ok",
        close: (html) => {
          if (cancel) return;
          let accessory = html.find("[name=accessory]").val();
          if (accessory) {
            let aItem = this.actor.items.find(i => i.id === accessory);
            let cloned = deepClone(this.item.data.data.accessory);
            cloned.push(aItem.toObject(false));
            this.item.update({"data.accessory": cloned });
            aItem.update({
              "data.isActive": this.item.data.data.isActive,
              "data.wirelessTurnedOn": this.item.data.data.wirelessTurnedOn,
            })
          } else {
          }
        },
      }).render(true);
    });
  }


  /* -------------------------------------------- */

  async _displayHelpText(event) {
    if (!game.settings.get("sr5", "sr5Help.active")) return false;

    let target = document.querySelector("#sr5help");
    let property;

    document.querySelector("#sr5helpTitle").innerHTML = "";
    document.querySelector("#sr5helpMessage").innerHTML = "";
    document.querySelector("#sr5helpDetails").innerHTML = "";

    if (target) {
      document.querySelector("#sr5helpTitle").innerHTML = $(event.currentTarget).attr("data-helpTitle");

      if ($(event.currentTarget).attr("data-helpMessage")) document.querySelector("#sr5helpMessage").innerHTML = "<div class='helpMessage'><em>" + $(event.currentTarget).attr("data-helpMessage") + "</em></div>";
      
      let details = $(event.currentTarget).attr("data-helpDetails");
      if (details) {
        property = SR5_EntityHelpers.resolveObjectPath(`item.data.${details}`, this);
      }
    
      if (property) {
        let detailsHTML = `${game.i18n.localize('SR5.HELP_CalculationDetails')}<ul>`;
        if (property.modifiers && property.modifiers.length) {
          if (property.base) detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationBase')}${game.i18n.localize('SR5.Colons')} ${property.base}</li>`;
          for (let modifier of Object.values(property.modifiers)) {
            detailsHTML = detailsHTML + `<li>${modifier.source} [${modifier.type}]${game.i18n.localize('SR5.Colons')} ${(modifier.isMultiplier ? 'x' : (modifier.value >= 0 ? '+' : ''))}${modifier.value}</li>`;
          }
        }
        detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationTotal')}${game.i18n.localize('SR5.Colons')} ${property.value}</li></ul>`;
        document.querySelector("#sr5helpDetails").innerHTML = detailsHTML;
      }
      target.classList.add("active");
    }
  }

  async _hideHelpText() {
    let target = document.querySelector("#sr5help");
    if (target) {
      target.classList.remove("active");
    }
  }

}