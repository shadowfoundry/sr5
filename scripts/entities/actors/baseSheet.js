import { SR5_SystemHelpers } from "../../system/utility.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_UtilityItem } from "../items/utilityItem.js";
import { SR5_CharacterUtility } from "./utility.js";
import { SR5_SocketHandler } from "../../socket.js";
import SR5_PanDialog from "../../interface/pan-dialog.js";
import { SR5 } from "../../config.js";
import { SR5Actor } from "./entityActor.js";

/**
 * Extend the basic ActorSheet class to do all the SR5 things!
 * This sheet is an Abstract layer which is not used.
 *
 * @type {ActorSheet}
 */

export class ActorSheetSR5 extends ActorSheet {
  constructor(...args) {
    super(...args);
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      scrollY: [".SR-ActorMainCentre", ".SR-ActorColGauche"],
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".sr-tabs",
          initial: "tab-skills",
        },
        {
          navSelector: ".tabs2",
          contentSelector: ".sr-tabs2",
          initial: "tab-attributs",
        },
      ],
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Owned Item management
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-clone").click(this._onItemClone.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".item-management").mousedown(this._onItemManagement.bind(this));
    //Edit item value from actor sheet
    html.find(".edit-value").focusout(this._onEditItemValue.bind(this));
    html.find(".select-value").change(this._onEditItemValue.bind(this));
    html.find(".toggle-value").click(this._onEditItemValue.bind(this));
    html.find(".changeValueByClick").mousedown(this._onChangeValueByClick.bind(this));
    //
    html.find(".toggle-actorValue").click(this._onEditActorValue.bind(this));
    //Choose controler
    html.find(".chooseControler").click(this._onChooseControler.bind(this));
    //Recharge les armes
    html.find(".reload-ammo").click(this._onReloadAmmo.bind(this));
    //Reset weapon recoil
    html.find(".resetRecoil").click(this._onResetRecoil.bind(this));
    //Reboot le deck
    html.find(".reset-deck").click(this._onRebootDeck.bind(this));
    // Checkbox changes
    html.find('input[type="checkbox"]').change(this._onSubmit.bind(this));
    // Déplie les infos
    html.find(".deplie").click(this._onItemSummary.bind(this));
    // Lancés de dés
    html.find(".sr-roll").click(this._onRoll.bind(this));
    html.find(".sr-rollGrenade").click(this._onRollGrenade.bind(this));
    // Summon Spirit
    html.find(".sidekickCreate").click(this._OnSidekickCreate.bind(this));
    html.find(".sidekickDestroy").click(this._OnSidekickDestroy.bind(this));
    // Dismiss Actor
    html.find(".dismissActor").click(this._OnDismissActor.bind(this));
    // Switch vision
    html.find(".vision-switch").click(this._onVisionSwitch.bind(this));
    // Switch initiatives
    html.find(".init-switch").click(this._onInitiativeSwitch.bind(this));
    // Add item to PAN
    html.find(".addItemToPan").click(this._onAddItemToPan.bind(this));
    html.find(".deleteItemFromPan").click(this._onDeleteItemFromPan.bind(this));
    // Stop jamming signals
    html.find(".stop-jamming").click(this._onStopJamming.bind(this));


    // Affiche les compétences
    html.find(".hidden").hide();
    html.find(".filtre-skill").click((event) => {
      event.preventDefault();
      this._shownUntrainedSkills = !this._shownUntrainedSkills;
      this._render(true);
    });
    html.find(".filtre-groupe").click((event) => {
      event.preventDefault();
      this._shownUntrainedGroups = !this._shownUntrainedGroups;
      this._render(true);
    });
    html.find(".filtre-matrixActions").click((event) => {
      event.preventDefault();
      this._shownNonRollableMatrixActions = !this._shownNonRollableMatrixActions;
      this._render(true);
    });

    // Item Dragging
    if (this.actor.isOwner) {
      /* Item Dragging */
      // Core handlers from foundry.js
      var handler;
      if (!isNewerVersion(game.version, "0.7")) {
        handler = ev => this._onDragItemStart(ev);
      }
      else {
        handler = ev => this._onDragStart(ev);
      }
      html.find('li.item').each((i, li) => {
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
      html.find('div.draggableAttribute').each((i, div) => {
        //div.setAttribute("draggable", true);
        div.addEventListener("dragstart", handler, false);
      });
    }

    // Help Display
    html.find("[data-helpTitle]").mouseover(this._displayHelpText.bind(this));
    html.find("[data-helpTitle]").mouseout(this._hideHelpText.bind(this));

    // Gestion des cases de dégats
    html.find(".boxes:not(.box-disabled)").click((ev) => {
      let actorData = duplicate(this.actor);
      let index = Number($(ev.currentTarget).attr("data-index"));
      let target = $(ev.currentTarget)
        .parents(".SR-MoniteurCases")
        .attr("data-target");

      let value = getProperty(actorData, target);
      if (value == index + 1)
        // If the last one was clicked, decrease by 1
        setProperty(actorData, target, index);
      // Otherwise, value = index clicked
      else setProperty(actorData, target, index + 1);

      if (target == 'data.conditionMonitors.physical.current' && getProperty(actorData, 'data.conditionMonitors.overflow.current')) {
        if (actorData.data.conditionMonitors.physical.current < actorData.data.conditionMonitors.physical.value) {
          setProperty(actorData, 'data.conditionMonitors.overflow.current', 0);
        }
      }

      this.actor.update(actorData);
    });
  }

  async _onDragStart(event) {
    if (!canvas.ready) return;
    let dragData = {};
    const target = event.currentTarget;

    if (target.dataset.matrixattribute){
      dragData.value = target.dataset.matrixattribute;
      dragData.valueFromCollection = target.id;
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
      return;
    }

    if (target.dataset.dropmatrixattribute){
      dragData.value = target.dataset.droppedvalue;
      dragData.valueFromAttribute = target.dataset.dropmatrixattribute;
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
      return;
    }

    return super._onDragStart(event);
  }

  async _onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    let actorData = duplicate(this.actor);
    const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));
    const target = event.target;

    if (dropData.valueFromCollection){
      let existingValue = parseInt(target.dataset.droppedvalue);
      if (existingValue > 0) {
        for (let [key, value] of Object.entries(actorData.data.matrix.attributesCollection)){
          if (value === existingValue){
            setProperty(actorData, `data.matrix.attributesCollection.${key}isSet`, false);
            break;
          }
        }
      }
      setProperty(actorData, target.dataset.dropmatrixattribute, parseInt(dropData.value));
      setProperty(actorData, `data.matrix.attributesCollection.${dropData.valueFromCollection}`, true);
      await this.actor.update(actorData);
    }

    if (dropData.valueFromAttribute){
      setProperty(actorData, target.dataset.dropmatrixattribute, parseInt(dropData.value));
      setProperty(actorData, dropData.valueFromAttribute, parseInt(target.dataset.droppedvalue));
      await this.actor.update(actorData);
    }
    await super._onDrop(event);
  }

  // Handles initiative switching from the derived attributes tab
  _onInitiativeSwitch(event) {
    let wantedInitiative = $(event.currentTarget).attr("data-binding");
    SR5_CharacterUtility.switchToInitiative(this.actor, wantedInitiative);
  }

  _onVisionSwitch(event){
    let wantedVision = $(event.currentTarget).attr("data-binding");
    SR5_CharacterUtility.switchVision(this.actor, wantedVision);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();

    const header = event.currentTarget;
    const type = header.dataset.type;
    const itemName = SR5_UtilityItem.findDisplayName(type);
    if (!itemName) {
      SR5_SystemHelpers.srLog(2, `Aborting item creation of '${type}' type`);
      return false;
    }
    if (type === "itemTradition"){
      for (let i of this.actor.items){
        if (i.type === "itemTradition"){
          return ui.notifications.warn(game.i18n.localize('SR5.WARN_OnlyOneTradition'));
        }
      }
    }

    const itemData = {
      name: `${itemName.capitalize()}`,
      type: type,
      data: foundry.utils.deepClone(header.dataset),
      img: `systems/sr5/img/items/${type}.svg`,
    };
    if (header.dataset.subtype) {
      itemData.data.type = header.dataset.subtype;
      delete itemData.data.subtype;
    } else if (header.dataset.weaponcategory){
      itemData.data.category = header.dataset.weaponcategory;
      delete itemData.data.weaponcategory;
      delete itemData.data.type;
    } else {
      delete itemData.data.type;
    }

    SR5_SystemHelpers.srLog(2, `Creating a new item of '${type}' type`, itemData);
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using data defined in an existing Owned Item
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemClone(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    let newItem = item.toObject();
    if (newItem.data.accessory?.length) newItem.data.accessory = [];
    SR5_SystemHelpers.srLog(2, `Creating a new clone of item '${item.name}'`, item);
    return this.actor.createEmbeddedDocuments("Item", [newItem]);
  }

  /* -------------------------------------------- */

  /**
   * Handle editing an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemEdit(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    // check window state (0 means did not exist before)
    let state = item.sheet._state;
    SR5_SystemHelpers.srLog(3, "item.sheet", item.sheet);
    item.sheet.render(true);
    SR5_SystemHelpers.srLog(3, "item.sheet", item.sheet);
    // if window already exists, bring it to top
    if (state > 0) item.sheet.bringToTop();
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemDelete(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    if (event.ctrlKey) {
      if ( item ) {
        await item.delete();
        let statusEffect = this.actor.effects.find(e => e.data.origin === item.data.data.type);
        if (statusEffect) this.actor.deleteEmbeddedDocuments('ActiveEffect', [statusEffect.id]);
        return
      }
    } else {
      Dialog.confirm({
        title: `${game.i18n.localize('SR5.Delete')} '${item.name}'${game.i18n.localize('SR5.QuestionMark')}`,
        content: "<h3>" + game.i18n.localize('SR5.DIALOG_Warning') + "</h3><p>" + game.i18n.format('SR5.DIALOG_WarningPermanentDelete', {type: game.i18n.localize("ITEM.Type" + item.type.replace(/^\w/, c => c.toUpperCase())), actor: this.actor.name, itemName: item.name}) + "</p>",
        yes: () => {
          item.delete();
          if (item.type === "itemEffect"){
            let statusEffect = this.actor.effects.find(e => e.data.origin === item.data.data.type);
            if (statusEffect) this.actor.deleteEmbeddedDocuments('ActiveEffect', [statusEffect.id]);
          }
        },
      });
    }
  }

  /* -------------------------------------------- */

  _onItemManagement(event){
    event.preventDefault();
    switch (event.button) {
      case 0:
        if (event.shiftKey) this._onItemDelete(event);
        else if (event.ctrlKey) this._onItemClone(event);
        else this._onItemEdit(event)
        break;
    }
  }

  /* -------------------------------------------- */

  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item"),
      item = this.actor.items.get(li.data("item-id")),
      expandData = item.getExpandData({ secrets: this.actor.isOwner });
    // Déplie les informations de jeu pour un Objet.
    if (li.hasClass("expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      let accessoryClass = ($(event.currentTarget).hasClass("SR-MarginLeft10") ? "SR-MarginLeft10" : "");
      let div = $(`<div class="col-x item-summary ${accessoryClass}">${expandData.gameEffect}</div>`);
      let props = $(`<div class="item-properties"></div>`);
      expandData.properties.forEach((p) => {
        if (Array.isArray(p)) {
          let index = expandData.properties.indexOf(p);
          props.append(`<span class="tag tag-summary" data-index=${index}>${p[0]}</span>`)
        } else {
          props.append(`<span class="tag">${p}</span>`)
        }
      });

      div.append(props);
      li.append(div.hide());
      div.slideDown(200);

      div.find(".tag-summary").click((event) => {
        let i =  $(event.currentTarget).attr("data-index");
        let gameEffect = expandData.properties[i][1];

        let tagDiv = $(`<div class="item-properties tag-description ${i}">${gameEffect}</div>`);

        if (div.hasClass("expandedTag") && div.hasClass(i)){
          let tagSummary = div.children(".tag-description");
          tagSummary.slideUp(200, () => tagSummary.remove());
          div.removeClass(i);
        } else if (div.hasClass("expandedTag")) {
          let tagSummary = div.children(".tag-description");
          tagSummary.slideUp(200, () => tagSummary.remove());
          div.removeClass();
          div.addClass("col-x item-summary expdandedTag");
          div.addClass(i);
          div.append(tagDiv.hide());
          tagDiv.slideDown(200);
        } else {
          div.append(tagDiv.hide());
          div.addClass(i);
          tagDiv.slideDown(200);
        }
        div.toggleClass("expandedTag");
      });

    }
    li.toggleClass("expanded");
  }

  /* -------------------------------------------- */
  // Edit Item value from Actor Sheet
  async _onEditItemValue(event) {
    let id = $(event.currentTarget).parents(".item").attr("data-item-id");
    let target = $(event.currentTarget).attr("data-binding");
    let actor = this.actor.toObject(false);
    let actorData = actor.data;
    let itemList = duplicate(this.actor.items);
    let item = itemList.find((i) => i._id === id);

    let value = event.target.value;
    if ($(event.currentTarget).attr("data-dtype") === "Number")
      value = Number(event.target.value);
    if ($(event.currentTarget).attr("data-dtype") === "Boolean") {
      let oldValue = getProperty(item, target);
      value = !oldValue;
    }
    setProperty(item, target, value);

    //Spécial, pour les decks, désactiver les autres decks lorsque l'un d'entre eux et équipé
    if (item.type === "itemDevice" && target !== "data.conditionMonitors.matrix.current") {
      for (let otherItem of itemList) {
        if (otherItem.type === "itemDevice" && (otherItem._id !== id)) otherItem.data.isActive = false;
      }

      for (let key of Object.keys(actorData.matrix.attributes)){
        actorData.matrix.attributes[key].base = 0;
      }
      actorData.matrix.attributesCollection.value1 = 0;
      actorData.matrix.attributesCollection.value2 = 0;
      actorData.matrix.attributesCollection.value3 = 0;
      actorData.matrix.attributesCollection.value4 = 0;
      actorData.matrix.attributesCollection.value1isSet = false;
      actorData.matrix.attributesCollection.value2isSet = false;
      actorData.matrix.attributesCollection.value3isSet = false;
      actorData.matrix.attributesCollection.value4isSet = false;
    }

    //Special case for armor
    if (target === "data.isActive" && item.type === "itemArmor" && !item.data.isCumulative) {
      for (let otherItem of itemList) {
        if (otherItem.type === "itemArmor" && !otherItem.data.isCumulative && (otherItem._id !== id)) otherItem.data.isActive = false;
      }
    }

    if (item.type === "itemDrug") {
      if (target === "data.isActive"){
        setProperty(item, "data.wirelessTurnedOn", false);
      } else if (target === "data.wirelessTurnedOn"){
        setProperty(item, "data.isActive", false);
      }
    }

    if (item.type === "itemProgram" && target === "data.isCreated"){
      let oldValue = getProperty(item, "data.isActive");
      value = !oldValue;
      setProperty(item, "data.isActive", value);
    }

    if (item.data.accessory?.length){
      for (let a of item.data.accessory){
        let accessory = itemList.find(i => i._id === a._id);
        if (accessory) {
          accessory.data.isActive = item.data.isActive;
          accessory.data.wirelessTurnedOn = item.data.wirelessTurnedOn;
        }
      }
    }

    await this.actor.update({
      "data": actorData,
      "items": itemList,
    })
    if (this.actor.isToken){
      this.actor.sheet.render();
    }

    //Delete effects linked to sustaining
    if ((item.type === "itemComplexForm" || item.type === "itemSpell") && target === "data.isActive"){
      if (!item.data.isActive && item.data.targetOfEffect.length) {
        for (let e of item.data.targetOfEffect){
          if (!game.user?.isGM) {
            await SR5_SocketHandler.emitForGM("deleteSustainedEffect", {
              targetItem: e,
            });
          } else {
            await SR5Actor.deleteSustainedEffect(e);
          }
        }
        item.data.targetOfEffect = [];
        this.actor.updateEmbeddedDocuments("Item", [item]);
      }
    }

  }

  /* -------------------------------------------- */
  //Change value of an item from actor sheet by clicking with mouse
  _onChangeValueByClick(event) {
    let id = $(event.currentTarget).parents(".item").attr("data-item-id"),
        target = $(event.currentTarget).attr("data-binding"),
        entity,
        original;

    if (id) original = this.actor.items.get(id);
    else original = this.actor;

    entity = original.toObject(false);
    let value = getProperty(entity, target);
    switch (event.button) {
      case 0:
        if (event.ctrlKey && target === "data.quantity") value -= 10;
        else value--;
        if (value < 0) value = 0;
        break;
      case 2:
        if ((target === "data.matrix.attributes.sharing.base") || (target === "data.matrix.attributes.noiseReduction.base")){
          let deviceRating = entity.data.matrix.deviceRating;
          let noiseReduction = entity.data.matrix.attributes.noiseReduction.base;
          let sharing = entity.data.matrix.attributes.sharing.base;
          if (target === "data.matrix.attributes.sharing.base"){
            if ((value + noiseReduction) < deviceRating) {
              value++;
            } else {
              if (noiseReduction > 0) {
                setProperty(entity, "data.matrix.attributes.noiseReduction.base", (noiseReduction - 1));
                value++;
              } else {
                console.log("valeur maximale");
              }
            }
          }
          if (target === "data.matrix.attributes.noiseReduction.base"){
            if ((value + sharing) < deviceRating) {
              value++;
            } else {
              if (sharing > 0) {
                setProperty(entity, "data.matrix.attributes.sharing.base", (sharing - 1));
                value++;
              } else {
                console.log("valeur maximale");
              }
            }
          }
        } else {
          if (event.ctrlKey && target === "data.quantity") value += 10;
          else value++;
        }
        break;
    }

    if (id){
      setProperty(entity, target, value);
      this.actor.updateEmbeddedDocuments("Item", [entity]);
    } else {
      setProperty(entity, target, value);
      this.actor.update(entity);
    }
  }

  /* -------------------------------------------- */
  //Change value of an actor by click
  _onEditActorValue(event){
    let target = $(event.currentTarget).attr("data-binding");
    let actor = this.actor.toObject(false);


    let value = event.target.value;
    if ($(event.currentTarget).attr("data-dtype") === "Boolean") {
      let oldValue = getProperty(actor, target);
      value = !oldValue;
    }
    setProperty(actor, target, value);
    let actorData = actor.data;
    this.actor.update({'data': actorData})
  }


  /* -------------------------------------------- */
  // Reset actor recoil to 0
  async _onResetRecoil(event){
    event.preventDefault();
    this.actor.resetRecoil();
  }

  /* -------------------------------------------- */
  //Recharge les armes
  async _onReloadAmmo(event) {
    event.preventDefault();
    const id = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(id);
    if (item) item.reloadAmmo();
  }

  /* -------------------------------------------- */
  //Reboot le deck
  async _onRebootDeck(event) {
    event.preventDefault();
    this.actor.rebootDeck();
  }

  /* -------------------------------------------- */
  ///Roll dices
  /* -------------------------------------------- */
  async _onRoll(event) {
    event.preventDefault();
    let iid;
    if (event.currentTarget.closest(".item")) iid = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(iid);
    const rollKey = event.currentTarget.dataset.rollkey;
    const rollType = event.currentTarget.dataset.rolltype;
    if(item) item.rollTest(rollType, rollKey);
    else this.actor.rollTest(rollType, rollKey);
  }

  async _onRollGrenade(event) {
    event.preventDefault();
    const iid = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(iid);
    item.placeGabarit(event);
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
        property = SR5_EntityHelpers.resolveObjectPath(`actor.data.${details}`, this);
      }

      let itemId = $(event.currentTarget).attr("data-helpItemId");
      if (itemId) {
        let item = this.actor.items.find(i => i.id === itemId);
        let detailsItem = $(event.currentTarget).attr("data-helpDetailsItem");
        property = SR5_EntityHelpers.resolveObjectPath(`data.${detailsItem}`, item);
      }

      if (property) {
        let detailsHTML = `${game.i18n.localize('SR5.HELP_CalculationDetails')}<ul>`;
        if (property.modifiers && property.modifiers.length) {
          if (property.base) detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationBase')}${game.i18n.localize('SR5.Colons')} ${property.base}</li>`;
          for (let modifier of Object.values(property.modifiers)) {
            if (modifier.type === "armorAccessory") modifier.type = game.i18n.localize('SR5.ArmorAccessory');
            if (modifier.type === "armorMain") modifier.type = game.i18n.localize('SR5.Armor');
            if (modifier.value != undefined)
              detailsHTML = detailsHTML + `<li>${modifier.source} [${modifier.type}]${game.i18n.localize('SR5.Colons')} ${(modifier.isMultiplier ? 'x' : (modifier.value >= 0 ? '+' : ''))}${modifier.value}</li>`;
            else
              detailsHTML = detailsHTML + `<li>${modifier.source} [${modifier.type}]${game.i18n.localize('SR5.Colons')} ${(modifier.isMultiplier ? 'x' : (modifier.dicePool >= 0 ? '+' : ''))}${modifier.dicePool}</li>`;
          }
        }
          if (property.value != undefined)
            detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationTotal')}${game.i18n.localize('SR5.Colons')} ${property.value}</li></ul>`;
          else
            detailsHTML += `<li>${game.i18n.localize('SR5.HELP_CalculationTotal')}${game.i18n.localize('SR5.Colons')} ${property.dicePool}</li></ul>`;
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

  //Handle controler choice of a drone / Vehicle
  async _onChooseControler(event){
    //let worldActors = await Array.from(game.actors);
    let controlerList = {};
    for (let a of game.actors){
      if (a.data.type === "actorPc" || (a.data.type === "actorGrunt" && a.data.token.actorLink)){
        if (game.user.isGM) {
          controlerList[a.id] = a.name;
        } else {
          if (a.hasPlayerOwner) controlerList[a.id] = a.name;
        }
      }
    }
    let cancel = true;
    let dialogData = {
      controlerList: controlerList,
    };
    renderTemplate("systems/sr5/templates/interface/chooseControler.html", dialogData).then((dlg) => {
      new Dialog({
        title: game.i18n.localize('SR5.ChooseControler'),
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
          let controler = html.find("[name=controler]").val();
          let controlerName = "";
          if (controler) {
            controlerName = controlerList[controler];
            let vehicleControler = SR5_EntityHelpers.getRealActorFromID(controler);
            this.actor.update({
              "data.vehicleOwner.id": controler,
              "data.vehicleOwner.name": controlerName,
              "flags.sr5.vehicleControler": vehicleControler.data.toObject(false),
            });
          } else {
            this.actor.update({
              "data.vehicleOwner.id": "",
              "data.vehicleOwner.name": "",
              "data.controlMode": "autopilot"
            });
            this.actor.unsetFlag("sr5", "vehicleControler");
          }
        },
      }).render(true);
    });

  }

  //Handle the creation of a 'side kick'
  async _OnSidekickCreate(event){
    event.preventDefault();
    const id = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(id);
    let actorId = this.actor.id;
    if (this.actor.isToken) actorId = this.actor.token.id;
    item = item.toObject(false);
    if (!game.user?.isGM) {
      await SR5_SocketHandler.emitForGM("createSidekick", {
        item: item,
        userId: game.user.id,
        actorId: actorId,
      });
    } else {
      SR5Actor.createSidekick(item, game.user.id, actorId);
    }
  }

  //
  async _OnDismissActor(event){
    event.preventDefault();
    if (!game.user?.isGM) {
      await SR5_SocketHandler.emitForGM("dismissSidekick", {
        actor: this.actor.toObject(false),
      });
    } else {
      SR5Actor.dimissSidekick(this.actor.toObject(false));
    }
  }

  async _OnSidekickDestroy(event){
    event.preventDefault();
    const id = event.currentTarget.closest(".item").dataset.itemId;
    let sidekick;
    for (let a of game.actors){
      if (a.data.data.creatorItemId === id) {
        sidekick = a.toObject(false);
        break;
      }
    }
    if(sidekick !== undefined) {
      if (!game.user?.isGM) {
        await SR5_SocketHandler.emitForGM("dismissSidekick", {
          actor: sidekick,
        });
      } else {
        SR5Actor.dimissSidekick(sidekick);
      }
    }
  }

  async _onAddItemToPan(event){
    let actor = this.actor.data,
        cancel = true,
        list = {},
        actorList = {},
        baseActor = this.actor.id;

    if (actor.data.matrix.pan.current === actor.data.matrix.pan.max){
      ui.notifications.info(`${actor.name}: ${game.i18n.localize("SR5.INFO_PanIsFull")}`);
      return;
    }

    for (let key of Object.keys(actor.data.matrix.potentialPanObject)){
      if (Object.keys(actor.data.matrix.potentialPanObject[key]).length) {
        list[key] = SR5_EntityHelpers.sortObjectValue(actor.data.matrix.potentialPanObject[key]);
      }
    }

    for (let a of game.actors){
      if (a.data.type === "actorPc" || (a.data.type === "actorGrunt" && a.data.token.actorLink)){
        if (game.user.isGM) actorList[a.id] = a.name;
        else if (a.hasPlayerOwner) actorList[a.id] = a.name;
      }
    }

    if (canvas.scene && game.user.isGM){
      for (let token of canvas.tokens.placeables) {
        if (token.actor.isToken && (token.actor.type === "actorGrunt")) {
          actorList[token.id] = token.name;
        }
      }
    }

    if (this.actor.isToken) baseActor = this.actor.token.id;

    let dialogData = {
      actor: baseActor,
      list: list,
      actorList: actorList,
    };

    renderTemplate("systems/sr5/templates/interface/addItemToPan.html", dialogData).then((dlg) => {
      new SR5_PanDialog({
        title: game.i18n.localize('SR5.ChooseItemToPan'),
        content: dlg,
        data: dialogData,
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
          let targetItem = html.find("[name=itemToAdd]").val();
          if (targetItem === "none") return;
          if (!game.user?.isGM) {
            SR5_SocketHandler.emitForGM("addItemToPan", {
              targetItem: targetItem,
              actorId: baseActor,
            });
          } else {
            SR5Actor.addItemtoPan(targetItem, baseActor);
          }

        },
      }).render(true);
  });
  }

  async _onDeleteItemFromPan(event){
    event.preventDefault();
    await this._onSubmit(event); // Submit any unsaved changes
    let index = $(event.currentTarget).attr("data-index");
    let itemId = $(event.currentTarget).attr("data-key");
    let actor = this.actor.id;
    if (this.actor.isToken) actor = this.actor.token.id;

    if (!game.user?.isGM) {
      SR5_SocketHandler.emitForGM("deleteItemFromPan", {
        targetItem: itemId,
        index: index,
        actorId: actor,
      });
    } else {
      SR5Actor.deleteItemFromPan(itemId, actor, index);
    }
  }

  async _onStopJamming(event){
    event.preventDefault();
    let jammingItem = this.actor.items.find(i => i.data.data.type === "signalJam");
    let statusEffect = this.actor.effects.find(e => e.data.origin === "signalJam");
    if (statusEffect) await this.actor.deleteEmbeddedDocuments('ActiveEffect', [statusEffect.id]);
    await this.actor.deleteEmbeddedDocuments("Item", [jammingItem.id]);
  }

}
