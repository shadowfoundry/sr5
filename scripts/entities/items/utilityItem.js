import { SR5 } from "../../config.js";
import { SR5_SystemHelpers } from "../../system/utility.js";
import { SR5_EntityHelpers } from "../helpers.js";

export class SR5_UtilityItem extends Actor {
  //************************************************//
  //                     ITEMS                      //
  //************************************************//

  // Returns the display name of item types
  static findDisplayName(type) {
    var displayName = "";
    switch (type) {
      case "itemKnowledge":
        displayName = game.i18n.localize("SR5.KnowledgeSkillNew");
        break;
      case "itemLanguage":
        displayName = game.i18n.localize("SR5.LanguageNew");
        break;
      case "itemDevice":
        displayName = game.i18n.localize("SR5.DeviceNew");
        break;
      case "itemWeapon":
        displayName = game.i18n.localize("SR5.WeaponNew");
        break;
      case "itemArmor":
        displayName = game.i18n.localize("SR5.ArmorNew");
        break;
      case "itemMark":
        displayName = game.i18n.localize("SR5.MarkNew");
        break;
      case "itemProgram":
        displayName = game.i18n.localize("SR5.ProgramNew");
        break;
      case "itemGear":
        displayName = game.i18n.localize("SR5.GearNew");
        break;
      case "itemVehicle":
        displayName = game.i18n.localize("SR5.VehicleNew");
        break;
      case "itemAugmentation":
        displayName = game.i18n.localize("SR5.AugmentationNew");
        break;
      case "itemSpell":
        displayName = game.i18n.localize("SR5.SpellNew");
        break;
      case "itemPower":
        displayName = game.i18n.localize("SR5.PowerNew");
        break;
      case "itemAdeptPower":
        displayName = game.i18n.localize("SR5.AdeptPowerNew");
        break;
      case "itemFocus":
        displayName = game.i18n.localize("SR5.FocusNew");
        break;
      case "itemSpirit":
        displayName = game.i18n.localize("SR5.SpiritNew");
        break;
      case "itemMetamagic":
        displayName = game.i18n.localize("SR5.MetamagicNew");
        break;
      case "itemContact":
        displayName = game.i18n.localize("SR5.ContactNew");
        break;
      case "itemSin":
        displayName = game.i18n.localize("SR5.SystemIdentificationNumberNew");
        break;
      case "itemLifestyle":
        displayName = game.i18n.localize("SR5.LifestyleNew");
        break;
      case "itemQuality":
        displayName = game.i18n.localize("SR5.QualityNew");
        break;
      case "itemKarmaLoss":
        displayName = game.i18n.localize("SR5.KarmaNewLoss");
        break;
      case "itemKarma":
        displayName = game.i18n.localize("SR5.KarmaNew");
        break;
      case "itemNuyen":
        displayName = game.i18n.localize("SR5.NuyenNew");
        break;
      case "itemPreparation":
        displayName = game.i18n.localize("SR5.PreparationNew");
        break;
      case "itemComplexForm":
        displayName = game.i18n.localize("SR5.ComplexFormNew");
        break;
      case "itemAmmunition":
        displayName = game.i18n.localize("SR5.AmmunitionNew");
        break;
      case "itemSprite":
        displayName = game.i18n.localize("SR5.SpriteNew");
        break;
      case "itemSpritePower":
        displayName = game.i18n.localize("SR5.SpritePowerNew");
        break;
      case "itemEcho":
        displayName = game.i18n.localize("SR5.EchoNew");
      break;
      default:
        displayName = false;
        SR5_SystemHelpers.srLog(1, `Unknown '${type}' item type`);
    }
    return displayName;
  }

  // Reset les modifs de prix et de dispo des items
  static _resetItemModifiers(itemData) {
    let data = itemData.data;

    //Reset accessory
    if (itemData.type === "itemAugmentation" || itemData.type === "itemGear"){
      if (!itemData.document.isOwned) data.accessory = [];
    }

    //Reset price & availability
    if (data.price) data.price.modifiers = [];
    if (data.availability) data.availability.modifiers = [];
    if (data.essenceCost) data.essenceCost.modifiers = [];

    //Reset weapon modifiers
    if (itemData.type === "itemWeapon") {
      data.firingMode.value = [];
      data.damageValue.modifiers = [];
      data.armorPenetration.modifiers = [];
      data.recoilCompensation.modifiers = [];
      data.weaponSkill.base = 0;
      data.weaponSkill.modifiers = [];
      data.concealment.modifiers = [];
      data.accuracy.modifiers = [];
      data.reach.modifiers = [];
      data.range.short.modifiers = [];
      data.range.medium.modifiers = [];
      data.range.long.modifiers = [];
      data.range.extreme.modifiers = [];
      for (let key of Object.keys(SR5.propagationVectors)) {
        data.toxin.vector[key] = false;
      }
      for (let key of Object.keys(SR5.toxinEffects)) {
        data.toxin.effect[key] = false;
      }
    }

    if (itemData.type === "itemKnowledge"){
      data.modifiers = [];
    }

    if (itemData.type === "itemLanguage"){
      data.modifiers = [];
    }

    if (itemData.type === "itemDrug"){
      data.vector.value = [];
    }

    if (itemData.type === "itemArmor"){
      data.armorValue.value = 0;
      data.armorValue.modifiers = [];
    }

    if (itemData.type === "itemSpell") {
      data.freeSustain = false;
      data.damageValue.modifiers = [];
      data.armorPenetration.modifiers = [];
      data.drainValue.modifiers = [];
      data.spellAreaOfEffect.modifiers = [];
    }

    if (itemData.type === "itemComplexForm") {
      data.freeSustain = false;
    }

    if (itemData.type === "itemPower"){
      data.test.modifiers = [];
    }

    if (itemData.type === "itemPreparation"){
      data.test.modifiers = [];
    }

    if (typeof data.systemEffects === "object") {
      data.systemEffects = Object.values(data.systemEffects);
    }

    if (typeof data.itemEffects === "object") {
      data.itemEffects = Object.values(data.itemEffects);
    }
  }

  static _handleItemCapacity(item) {
    let valueMultiplier = 0, valueTakenMultiplier = 0, lists = SR5;

    //Capacity
    if (item.capacity.multiplier == "rating") {
        valueMultiplier = item.itemRating;
    }
    if (item.capacity.multiplier) {
      let modifierSource = `${game.i18n.localize(lists.valueMultipliers[item.capacity.propertyMultiplier])} ${game.i18n.localize('SR5.Multiplier')}`;
      SR5_EntityHelpers.updateModifier(item.capacity, modifierSource, `valueMultiplier`, valueMultiplier, true, false);
    }
    SR5_EntityHelpers.updateValue(item.capacity, 0);

    //Capacity taken
    if (item.capacityTaken.multiplier == "rating") {
        valueTakenMultiplier = item.itemRating;
    }
    if (item.capacityTaken.multiplier) {
      let modifierSource = `${game.i18n.localize(lists.valueMultipliers[item.capacityTaken.propertyMultiplier])} ${game.i18n.localize('SR5.Multiplier')}`;
      SR5_EntityHelpers.updateModifier(item.capacityTaken, modifierSource, `valueMultiplier`, valueTakenMultiplier, true, false);
    }
    SR5_EntityHelpers.updateValue(item.capacityTaken, 0);
  }

  static _handleItemPrice(item) {
    let multiplier, lists = SR5;
    switch (item.price.multiplier) {
      case "rating":
        multiplier = item.itemRating;
        break;
      case "capacity":
        multiplier = item.capacity.value;
        break;
      default:
    }
    if (item.price.multiplier) {
      SR5_EntityHelpers.updateModifier(item.price, game.i18n.localize(lists.valueMultipliers[item.price.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
    }
    SR5_EntityHelpers.updateValue(item.price, 0);
  }

  static _handleAmmoPrice(item) {
    let multiplier = item.quantity;
    SR5_EntityHelpers.updateModifier(item.price, game.i18n.localize('SR5.Quantity'), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
    SR5_EntityHelpers.updateValue(item.price, 0);
  }

  static _handleItemEssenceCost(item) {
    let multiplier, lists = SR5;
    switch (item.essenceCost.multiplier) {
      case "rating":
        multiplier = item.itemRating;
        break;
      case "capacity":
        multiplier = item.capacity.value;
        break;
      default:
    }
    if (item.essenceCost.multiplier) {
      SR5_EntityHelpers.updateModifier(item.essenceCost, game.i18n.localize(lists.valueMultipliers[item.essenceCost.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
    }
    SR5_EntityHelpers.updateValue(item.essenceCost, 0);
  }

  static _handleItemAvailability(item) {
    let multiplier, lists = SR5;
    switch (item.availability.multiplier) {
      case "rating":
        multiplier = item.itemRating;
        break;
      case "capacity":
        multiplier = item.capacity.value;
        break;
      default:
    }
    if (item.availability.multiplier) {
      SR5_EntityHelpers.updateModifier(item.availability, game.i18n.localize(lists.valueMultipliers[item.availability.multiplier]), game.i18n.localize('SR5.Multiplier'), multiplier, true, false);
    }
    SR5_EntityHelpers.updateValue(item.availability, 0);
  }

  static _handleItemConcealment(item) {
    SR5_EntityHelpers.updateValue(item.concealment, 0);
  }

  static _handleArmorValue(item) {
    SR5_EntityHelpers.updateValue(item.armorValue, 0);
  }

  ////////////////////// ARMES ///////////////////////
  // Définit la sous-famille d'arme
  static _handleBow(weapon) {
    if (weapon.data.type === "bow") {
      SR5_EntityHelpers.updateModifier(weapon.data.price, weapon.name, game.i18n.localize('SR5.ItemRating'), ((weapon.data.price.base * weapon.data.itemRating) - 100));
      SR5_EntityHelpers.updateModifier(weapon.data.availability, weapon.name, game.i18n.localize('SR5.ItemRating'), weapon.data.itemRating);
      SR5_EntityHelpers.updateModifier(weapon.data.armorPenetration, weapon.name, game.i18n.localize('SR5.ItemRating'), -Math.floor(weapon.data.itemRating / 4));
      SR5_EntityHelpers.updateModifier(weapon.data.damageValue, weapon.name, game.i18n.localize('SR5.ItemRating'), weapon.data.itemRating);
    }
  }

  // Calcul la RDD des armes
  static _generateWeaponDicepool(item, actorData) {
    let weapon = item.data;
    if (actorData) {
      if (actorData.type === "actorDrone") {
        let controlerData;
        if (actorData.data.vehicleOwner.id) {
          controlerData = actorData.flags.sr5.vehicleControler.data;
        }
        weapon.weaponSkill.base = 0;
        switch (actorData.data.controlMode){
          case "autopilot":
            for (let i of actorData.items) {
              let iData = i.data.data;
              if (iData.model === item.name && i.type === "itemProgram" && iData.isActive) {
                SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize('SR5.VehicleStat_PilotShort'), game.i18n.localize('SR5.LinkedAttribute'), actorData.data.attributes.pilot.augmented.value);
                SR5_EntityHelpers.updateModifier(weapon.weaponSkill, i.name, game.i18n.localize('SR5.Program'), iData.itemRating);
              }
            }
            if (controlerData){
              for (let i of actorData.flags.sr5.vehicleControler.items) {
                if (i.data.model === item.name && i.type === "itemProgram" && i.data.isActive) {
                  SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize('SR5.VehicleStat_PilotShort'), game.i18n.localize('SR5.LinkedAttribute'), actorData.data.attributes.pilot.augmented.value);
                  SR5_EntityHelpers.updateModifier(weapon.weaponSkill, i.name, `${game.i18n.localize('SR5.Program')} (${game.i18n.localize('SR5.Controler')})`, i.data.itemRating);
                }
              }
            }
            break;
          case "manual":
            SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills.gunnery.test.dicePool);
            break;
          case "remote":
            SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills.gunnery.rating.value, false, true);
            SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.Logic')})`, game.i18n.localize('SR5.ControlMode'), controlerData.attributes.logic.augmented.value, false, true);
            break;
          case "rigging":
            SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize('SR5.SkillGunnery')})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills.gunnery.test.dicePool);
            SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize('SR5.ControlRigging'), game.i18n.localize('SR5.ControlMode'), 1, false, true);
            if (controlerData.specialProperties.controlRig.value) {
              SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
              SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
            }
            if (controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize('SR5.VirtualRealityHotSimShort'), game.i18n.localize('SR5.MatrixUserMode'), 1);
            SR5_EntityHelpers.updateValue(weapon.accuracy);
            break;
          default:
            SR5_SystemHelpers.srLog(1, `Unknown controle mode '${data.controlMode}' in '_generateWeaponDicepool()'`);
        }
      } else {
        if (weapon.weaponSkill.specialization === true) {
          SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.Specialization')}`, `${game.i18n.localize('SR5.Skill')}`, 2, false, true);
        }
        let actorSkill = weapon.weaponSkill.category;
        if(actorData.data.skills[actorSkill] === undefined){
          SR5_SystemHelpers.srLog(1, `Unknown weapon skill '${actorSkill}' in '_generateWeaponDicepool()'`);
          weapon.weaponSkill.base = 0;
        } else {
          weapon.weaponSkill.base = actorData.data.skills[actorSkill].rating.base;
          weapon.weaponSkill.modifiers = weapon.weaponSkill.modifiers.concat(actorData.data.skills[actorSkill].test.modifiers);
          //Special case : bow
          if (weapon.type === "bow" && (actorData.data.attributes.strength.augmented.value < weapon.itemRating)){
            let malus = (actorData.data.attributes.strength.augmented.value - weapon.itemRating) * 3;
            SR5_EntityHelpers.updateModifier(weapon.weaponSkill, `${game.i18n.localize('SR5.WeaponTypeBow')}`, `${game.i18n.localize('SR5.ItemRating')}`, malus, false, true);
          }
        }
      }
    }  
      SR5_EntityHelpers.updateDicePool(weapon.weaponSkill);
      if (weapon.weaponSkill.dicePool < 0) weapon.weaponSkill.dicePool = 0;
  }

  // Reset les modifs d'armes
  static _generateWeaponDamage(weapon, actor) {
    if (actor) {
      if (weapon.accuracy.isPhysicalLimitBased) weapon.accuracy.base = actor.data.limits.physicalLimit.value;
      if (weapon.damageValue.isStrengthBased && actor.type !=="actorDrone") {
        SR5_EntityHelpers.updateModifier(weapon.damageValue, `${game.i18n.localize('SR5.Strength')}`, `${game.i18n.localize('SR5.Attribute')}`, actor.data.attributes.strength.augmented.value);
      }
      if (actor.data.itemsProperties?.weapon) {
        for (let modifier of actor.data.itemsProperties.weapon.accuracy.modifiers) {
          if (modifier.type === weapon.weaponSkill.category) weapon.accuracy.modifiers = weapon.accuracy.modifiers.concat(modifier);
        }
        for (let modifier of actor.data.itemsProperties.weapon.damageValue.modifiers) {
          if (modifier.type === weapon.weaponSkill.category) weapon.damageValue.modifiers = weapon.damageValue.modifiers.concat(modifier);
        }
      }
    }

    weapon.firingMode.value = [];
    for (let key of Object.keys(SR5.weaponModes)) {
      if (weapon.firingMode[key]) {
        weapon.firingMode.value.push(game.i18n.localize(SR5.weaponModesAbbreviated[key]));
      }
    }

    SR5_EntityHelpers.updateValue(weapon.damageValue);
    SR5_EntityHelpers.updateValue(weapon.armorPenetration);
    SR5_EntityHelpers.updateValue(weapon.recoilCompensation);
    SR5_EntityHelpers.updateValue(weapon.accuracy);
  }

  // Modif des munitions & grenades
  static _handleWeaponAmmunition(weapon) {
    let armorPenetration = 0,
      damageValue = 0,
      damageType = weapon.damageType,
      damageElement = weapon.damageElement,
      blastRadius = 0,
      blastDamageFallOff = 0,
      lists = SR5;
    switch (weapon.ammunition.type) {
      case "regular":
      case "assaultCannon":
      case "taserDart":
      case "injection":
      case "tracer":
      case "flashPack":
        // No modification
        break;
      case "av":
        armorPenetration = -1;
        break;
      case "apds":
        armorPenetration = -4;
        break;
      case "capsule":
        armorPenetration = 4;
        damageValue = -4;
        break;
      case "explosive":
        armorPenetration = 1;
        damageValue = -1;
        break;
      case "exExplosive":
        armorPenetration = -1;
        damageValue = 2;
        break;
      case "flechette":
        armorPenetration = 5;
        damageValue = 2;
        break;
      case "frangible":
        armorPenetration = 4;
        damageValue = -1;
        break;
      case "gel":
        armorPenetration = 1;
        damageType = "stun";
        break;
      case "hollowPoint":
        armorPenetration = 2;
        damageValue = 1;
        break;
      case "stickNShock":
        armorPenetration = -5;
        damageValue = -2;
        damageType = "stun";
        damageElement = "electricity";
        break;
      case "tracker":
        armorPenetration = 2;
        damageValue = -2;
        break;
      case "flashBang":
      case "flashBangMini":
        armorPenetration = -4;
        damageValue = 10;
        damageType = "stun";
        blastRadius = 10;
        break;
      case "fragmentation":
      case "fragmentationMini":
        armorPenetration = 5;
        damageValue = 18;
        damageType = "stun";
        blastDamageFallOff = -1;
        blastRadius = 18;
        break;
      case "fragmentationRocket":
      case "fragmentationMissile":
        armorPenetration = 5;
        damageValue = 23;
        damageType = "physical";
        blastDamageFallOff = -1;
        blastRadius = 23;
        break;
      case "smoke":
      case "smokeMini":
      case "smokeThermal":
      case "smokeThermalMini":
      case "gas":
      case "gasMini":
        damageType = "";
        blastRadius = 10;
        break;
      case "highlyExplosiveRocket":
      case "highlyExplosiveMissile":
        armorPenetration = -2;
        damageValue = 21;
        blastDamageFallOff = -2;
        blastRadius = 10;
        break;
      case "highlyExplosiveMini":
      case "highlyExplosive":
        armorPenetration = -2;
        damageValue = 16;
        blastDamageFallOff = -2;
        blastRadius = 8;
        break;
      case "antivehicleRocket":
      case "antivehicleMissile":
        armorPenetration = -4;
        damageValue = 24;
        blastDamageFallOff = -4;
        blastRadius = 6;
        break;
      default:
        SR5_SystemHelpers.srLog(3, "_handleWeaponAmmunition", `Unknown ammunition type: '${weapon.ammunition.type}'`);
        return;
    }
    if (armorPenetration) SR5_EntityHelpers.updateModifier(weapon.armorPenetration, game.i18n.localize(lists.allAmmunitionTypes[weapon.ammunition.type]), game.i18n.localize('SR5.Ammunition'), armorPenetration);
    if (damageValue) SR5_EntityHelpers.updateModifier(weapon.damageValue, game.i18n.localize(lists.allAmmunitionTypes[weapon.ammunition.type]), game.i18n.localize('SR5.Ammunition'), damageValue);
    weapon.damageType = damageType;
    weapon.damageElement = damageElement;
    weapon.blast.damageFallOff = blastDamageFallOff;
    weapon.blast.radius = blastRadius;
  }

  // Génére les spec des toxines pour les munitions & grenades
  static _handleWeaponToxin(weapon) {
    switch (weapon.toxin.type) {
      case "gamma":
        weapon.toxin.vector.injection = true;
        weapon.toxin.speed = 0;
        weapon.toxin.power = 12;
        weapon.toxin.penetration = 0;
        weapon.toxin.effect.paralysis = true;
        weapon.damageValue.base = 0
        weapon.damageType = null;
        break;
      case "csTearGas":
        weapon.toxin.vector.contact = true;
        weapon.toxin.vector.inhalation = true;
        weapon.toxin.speed = 1;
        weapon.toxin.power = 8;
        weapon.toxin.penetration = 0;
        weapon.toxin.effect.disorientation = true;
        weapon.toxin.effect.nausea = true;
        weapon.damageValue.base = 8;
        weapon.damageType = "stun";
        break;
      case "pepperPunch":
        weapon.toxin.vector.contact = true;
        weapon.toxin.vector.inhalation = true;
        weapon.toxin.speed = 1;
        weapon.toxin.power = 11;
        weapon.toxin.penetration = 0;
        weapon.toxin.effect.nausea = true;
        weapon.damageValue.base = 11;
        weapon.damageType = "stun";
        break;
      case "nauseaGas":
        weapon.toxin.vector.inhalation = true;
        weapon.toxin.speed = 3;
        weapon.toxin.power = 9;
        weapon.toxin.penetration = 0;
        weapon.toxin.effect.disorientation = true;
        weapon.toxin.effect.nausea = true;
        weapon.damageValue.base = 0;
        weapon.damageType = null;
        break;
      case "narcoject":
        weapon.toxin.vector.inhalation = true;
        weapon.toxin.vector.injection = true;
        weapon.toxin.speed = 3;
        weapon.toxin.power = 9;
        weapon.toxin.penetration = 0;
        weapon.toxin.effect.disorientation = true;
        weapon.toxin.effect.nausea = true;
        weapon.damageValue.base = 15;
        weapon.damageType = "stun";
        break;
      case "neuroStunHeight":
      case "neuroStunNine":
        weapon.toxin.vector.contact = true;
        weapon.toxin.vector.inhalation = true;
        weapon.toxin.speed = 1;
        weapon.toxin.power = 15;
        weapon.toxin.penetration = 0;
        weapon.toxin.effect.disorientation = true;
        weapon.damageValue.base = 15;
        weapon.damageType = "stun";
        break;
      case "neuroStunTen":
        weapon.toxin.vector.contact = true;
        weapon.toxin.vector.inhalation = true;
        weapon.toxin.speed = 1;
        weapon.toxin.power = 15;
        weapon.toxin.penetration = -2;
        weapon.toxin.effect.disorientation = true;
        weapon.damageValue.base = 15;
        weapon.damageType = "stun";
        break;
      case "seven":
        weapon.toxin.vector.contact = true;
        weapon.toxin.vector.inhalation = true;
        weapon.toxin.speed = 1;
        weapon.toxin.power = 12;
        weapon.toxin.penetration = -2;
        weapon.toxin.effect.disorientation = true;
        weapon.toxin.effect.nausea = true;
        weapon.damageValue.base = 12;
        weapon.damageType = "physical";
        break;
      default:
        SR5_SystemHelpers.srLog(3, "_handleWeaponToxin", `Unknown toxin type: '${weapon.toxin.type}'`);
    }

  }

  //Calcule la distance des armes de jet en fonction de la force
  static _generateWeaponRange(weapon, actor) {
    if (weapon.range.isStrengthBased) {
      if (actor !== undefined) {
        let actorStrength = actor.data.attributes.strength.augmented.value;

        SR5_EntityHelpers.updateModifier(weapon.range.short, 'strength', 'attribute', (actorStrength * weapon.range.short.base) - weapon.range.short.base);
        SR5_EntityHelpers.updateModifier(weapon.range.medium, 'strength', 'attribute', (actorStrength * weapon.range.medium.base) - weapon.range.medium.base);
        if (weapon.aerodynamic){
          SR5_EntityHelpers.updateModifier(weapon.range.long, 'strength', 'attribute', (actorStrength * (weapon.range.long.base +2)) - weapon.range.long.base);
          SR5_EntityHelpers.updateModifier(weapon.range.extreme, 'strength', 'attribute', (actorStrength * (weapon.range.extreme.base +5)) - weapon.range.extreme.base);
        } else {
          SR5_EntityHelpers.updateModifier(weapon.range.long, 'strength', 'attribute', (actorStrength * weapon.range.long.base) - weapon.range.long.base);
          SR5_EntityHelpers.updateModifier(weapon.range.extreme, 'strength', 'attribute', (actorStrength * weapon.range.extreme.base) - weapon.range.extreme.base);
        }
      }
    }

    if (actor !== undefined && weapon.category === "meleeWeapon" && actor.data.reach) {
      weapon.reach.modifiers = weapon.reach.modifiers.concat(actor.data.reach.modifiers);
    }

    for (let key of Object.keys(SR5.weaponRanges)) {
      SR5_EntityHelpers.updateValue(weapon.range[key]);
    }
    SR5_EntityHelpers.updateValue(weapon.reach);
  }

  // Modifie les armes en fonction des accessoires
  static _handleWeaponAccessory(weapon, actor) {
    for (let a of weapon.accessory) {   
      a.price = 0;
      switch (a.name) {
        case "advancedSafetySystem":
          a.price = 600;
          break;
        case "advancedSafetySystemElec":
          a.price = 950;
          break;
        case "advancedSafetySystemExSD":
          a.price = 1000;
          break;
        case "advancedSafetySystemImmo":
          a.price = 700;
          break;
        case "advancedSafetySystemSelfD":
          a.price = 800;
          break;
        case "airburstLink":
          a.price = 600;
          break;
        case "batteryBackPack":
          a.price = 2500;
          break;
        case "batteryClip":
          a.price = 400;
          break;
        case "batteryPack":
          a.price = 900;
          break;
        case "bayonet":
          a.price = 50;
          break;
        case "bipod":
          a.price = 200;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2);
          break;
        case "capBall":
          break;
        case "concealableHolster":
          a.price = 150;
          if (a.isActive) {
            if (weapon.wirelessTurnedOn) SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -2);
            else SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1);
          }
          break;
        case "concealedQDHolster":
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), -1);
          break;
        case "electronicFiring":
          a.price = 1000;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
          break;
        case "extendedBarrel":
          a.price = 50;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
          break;
        case "extremeEnvironment":
          a.price = 1500;
          break;
        case "flashLight":
          a.price = 50;
          break;
        case "flashLightInfrared":
          a.price = 400;
          break;
        case "flashLightLowLight":
          a.price = 200;
          break;
        case "foldingStock":
          a.price = 30;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
          break;
        case "foregrip":
          a.price = 100;
          if (a.isActive) {
            SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
            SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
          }
          break;
        case "gasVentSystemOne":
          a.price = 200;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
          break;
        case "gasVentSystemTwo":
          a.price = 400;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2);
          break;
        case "gasVentSystemThree":
          a.price = 600;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 3);
          break;
        case "geckoGrip":
          a.price = 100;
          break;
        case "guncam":
          a.price = 350;
          break;
        case "gyroMount":
          a.price = 1400;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 6);
          break;
        case "hiddenArmSlide":
          a.price = 350;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.concealment, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
          break;
        case "hipPad":
          a.price = 250;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
          break;
        case "imagingScope":
          a.price = 300;
          break;
        case "improvedRangeFinder":
          a.price = 2000;
          break;
        case "laserSight":
          a.price = 150;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
          if (weapon.wirelessTurnedOn) SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
          break;
        case "meleeHardening":
          a.price = 300;
          break;
        case "periscope":
          a.price = 70;
          break;
        case "quickDrawHolster":
          a.price = 175;
          break;
        case "reducedWeight":
          break;
        case "safeTargetSystem":
          a.price = 750;
          break;
        case "safeTargetSystemWithImage":
          a.price = 1100;
          break;
        case "shockPad":
          a.price = 50;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1);
          break;
        case "silencerSuppressor":
          a.price = 500;
          break;
        case "slideMount":
          a.price = 500;
          break;
        case "sling":
          a.price = 15;
          break;
        case "smartFiringPlatform":
          a.price = 2500;
          break;
        case "smartgunSystemInternal":
          a.price = "x2";
          if (!a.isFree) SR5_EntityHelpers.updateModifier(weapon.availability, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2);
          if (a.isActive) {
            if ((actor !== undefined) && (actor.type !== "actorDrone")) {
              let smartlink = actor.data.specialProperties.smartlink.value;
              if (smartlink) {
                SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
                if (weapon.wirelessTurnedOn) {
                  if (smartlink === 2) {
                    SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
                  } else if (smartlink === 1) {
                    SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
                  }
                }
              }
            }
          }
          break;
        case "smartgunSystemExternal":
          a.price = 200;
          if (a.isActive) {
            if ((actor !== undefined) && (actor.type !== "actorDrone")) {
              let smartlink = actor.data.specialProperties.smartlink.value;
              if (smartlink) {
                SR5_EntityHelpers.updateModifier(weapon.accuracy, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
                if (weapon.wirelessTurnedOn) {
                  if (smartlink === 2) {
                    SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 2, false, false);
                  } else if (smartlink === 1) {
                    SR5_EntityHelpers.updateModifier(weapon.weaponSkill, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 1, false, false);
                  }
                }
              }
            }
          }
          break;
        case "speedLoader":
          a.price = 25;
          break;
        case "tracker":
          a.price = 150;
          break;
        case "triggerRemoval":
          a.price = 50;
          break;        
        case "tripod":
          a.price = 500;
          if (a.isActive) SR5_EntityHelpers.updateModifier(weapon.recoilCompensation, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), 6);
          break;
        case "trollAdaptation":
          break; 
        case "underbarrelBolaLauncher":
          a.price = 350;
          break; 
        case "underbarrelChainsaw":
          a.price = 500;
          break; 
        case "underbarrelFlamethrower":
          a.price = 200;
          break; 
        case "underbarrelGrappleGun":
          a.price = 600;
          break; 
        case "underbarrelGrenadeLauncher":
          a.price = 3500;
          break; 
        case "vintage":
          break; 
        case "weaponCommlink":
          a.price = 200;
          break; 
        case "weaponPersonality":
          a.price = 250;
          break; 
        default:
          SR5_SystemHelpers.srLog(1, `Unknown '${a}' accessory in _handleWeaponAccessory()`);
      }

      //If accessory is correctly selected
      if (a.name){
        //Get the game info and put it in the array
        let nameString = a.name.charAt(0).toUpperCase() + a.name.slice(1);
        let gameEffectString = 'SR5.Accessory'+ `${nameString}` + '_GE';
        a.gameEffects = game.i18n.localize(gameEffectString);
        //Add price modifier to weapon
        if (!a.isFree){
          if (a.name === "smartgunSystemInternal") {
            SR5_EntityHelpers.updateModifier(weapon.price, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), weapon.price.base);
          } else {
            SR5_EntityHelpers.updateModifier(weapon.price, game.i18n.localize(SR5.weaponAccessories[a.name]), game.i18n.localize('SR5.WeaponAccessory'), a.price);
          }
        }
      }

    }
  }

  ////////////////////// AUGMENTATIONS ///////////////////////
  static _handleAugmentation(augmentation, actor) {
    let lists = SR5;
    let modifierSource, essenceMultiplier, deviceRating, availabilityModifier, priceMultiplier;

    if (augmentation.category === "cyberlimbs"){
      let cyberlimbs = augmentation.cyberlimbs;
      cyberlimbs.agility.value = cyberlimbs.agility.base + cyberlimbs.agility.customization;
      cyberlimbs.strength.value = cyberlimbs.strength.base + cyberlimbs.strength.customization;
      let cyberlimbsPriceMod = (cyberlimbs.agility.customization + cyberlimbs.strength.customization) * 5000;
      let cyberlimbsAvailabilityMod = (cyberlimbs.agility.customization + cyberlimbs.strength.customization);
      SR5_EntityHelpers.updateModifier(augmentation.availability, 'CustomCyberlimb', 'CustomCyberlimb', cyberlimbsAvailabilityMod);
      SR5_EntityHelpers.updateModifier(augmentation.price, 'CustomCyberlimb', 'CustomCyberlimb', cyberlimbsPriceMod);
    }

    switch (augmentation.grade){
      case "standard":
        essenceMultiplier = 1;
        deviceRating = 2;
        availabilityModifier = 0;
        priceMultiplier = 1;
        break;
      case "alphaware":
        essenceMultiplier = 0.8;
        deviceRating = 3;
        availabilityModifier = 2;
        priceMultiplier = 1.2;
        break;
      case "betaware":
        essenceMultiplier = 0.7;
        deviceRating = 4;
        availabilityModifier = 4;
        priceMultiplier = 1.5;
        break;
      case "deltaware":
        essenceMultiplier = 0.5;
        deviceRating = 5;
        availabilityModifier = 8;
        priceMultiplier = 2.5;
        break;
      case "used":
        essenceMultiplier = 1.25;
        deviceRating = 2;
        availabilityModifier = -4;
        priceMultiplier = 0.75;
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${augmentation.grade}' grade in _handleAugmentation()`);
        return;
    }
    augmentation.deviceRating = deviceRating;
    modifierSource = `${game.i18n.localize(lists.augmentationGrades[augmentation.grade])}`;
    SR5_EntityHelpers.updateModifier(augmentation.availability, modifierSource, game.i18n.localize('SR5.AugmentationGrade'), availabilityModifier, false, false);
    SR5_EntityHelpers.updateModifier(augmentation.price, modifierSource, game.i18n.localize('SR5.AugmentationGrade'), priceMultiplier, true, false);

    if (actor){
      for (let i of actor.items){
        let WeakImmuneSystem = i.data.data.systemEffects?.find(iEffect => iEffect.value === "doubleEssenceCost")
        if (WeakImmuneSystem) SR5_EntityHelpers.updateModifier(augmentation.essenceCost, i.name, game.i18n.localize(lists.itemTypes[i.type]), 2, true, false);
      }
    }

    SR5_EntityHelpers.updateModifier(augmentation.essenceCost, modifierSource, game.i18n.localize('SR5.AugmentationGrade'), (augmentation.isRatingBased ? essenceMultiplier * augmentation.itemRating : essenceMultiplier), true, false);
    this._handleItemCapacity(augmentation);
    this._handleItemPrice(augmentation);
    this._handleItemAvailability(augmentation);
    this._handleItemEssenceCost(augmentation);
    augmentation.conditionMonitors.matrix.value = Math.ceil(augmentation.deviceRating / 2) + 8;
    SR5_EntityHelpers.GenerateMonitorBoxes(augmentation, 'matrix');
  }

  ////////////////// SORTS ////////////////////

  //Handle spell
  static _handleSpell(i, actorData) {

    // Calcul des dégâts en fonction du type de sort
    if (i.data.category === "combat") {
      i.data.damageValue.base = 0;
      if (i.data.subCategory === "indirect") {
        SR5_EntityHelpers.updateModifier(i.data.damageValue, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), parseInt(i.data.force || 0), false, true);
        SR5_EntityHelpers.updateModifier(i.data.damageValue, game.i18n.localize('SR5.DiceHits'), game.i18n.localize('SR5.SkillSpellcasting'), parseInt(i.data.hits || 0), false, true);
        SR5_EntityHelpers.updateValue(i.data.damageValue, 0);
        SR5_EntityHelpers.updateModifier(i.data.armorPenetration, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), -(i.data.force || 0), false, true);
        SR5_EntityHelpers.updateValue(i.data.armorPenetration);
      } else {
        SR5_EntityHelpers.updateModifier(i.data.damageValue, game.i18n.localize('SR5.DiceHits'), game.i18n.localize('SR5.SkillSpellcasting'), (i.data.hits || 0), false, true);
        SR5_EntityHelpers.updateValue(i.data.damageValue, 0);
      }
    }

    // Calcul de la portée 
    i.data.spellAreaOfEffect.base = 0;
    if (i.data.range === "area" || i.data.category === "detection"){
      SR5_EntityHelpers.updateModifier(i.data.spellAreaOfEffect, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), parseInt(i.data.force || 0), false, true);
    }
    //des sorts de détection
    if (i.data.category === "detection") {
      SR5_EntityHelpers.updateModifier(i.data.spellAreaOfEffect, game.i18n.localize('SR5.SpellRangeShort'), game.i18n.localize('SR5.SpellCategoryDetection'), actorData.data.specialAttributes.magic.augmented.value, true, true);
      if (i.data.spellAreaExtended === true) {
        SR5_EntityHelpers.updateModifier(i.data.spellAreaOfEffect, game.i18n.localize('SR5.ExtendedRange'), game.i18n.localize('SR5.SpellCategoryDetection'), 10, true, true);
      } 
    }
    SR5_EntityHelpers.updateValue(i.data.spellAreaOfEffect, 0);

    // Calcul du Drain modifié
    i.data.drainValue.base = 0;
    SR5_EntityHelpers.updateModifier(i.data.drainValue, game.i18n.localize('SR5.SpellForce'), game.i18n.localize('SR5.SkillSpellcasting'), (i.data.force || 0), false, true);
    SR5_EntityHelpers.updateModifier(i.data.drainValue, game.i18n.localize('SR5.SpellDrain'), game.i18n.localize('SR5.DrainModifier'), i.data.drainModifier, false, true);
    SR5_EntityHelpers.updateValue(i.data.drainValue, 2);
  }

  //Handle Preparation
  static _handlePreparation(i, actorData){
    i.data.test.base = 0;
    SR5_EntityHelpers.updateModifier(i.data.test, game.i18n.localize('SR5.PreparationPotency'), game.i18n.localize('SR5.SkillSpellcasting'), (i.data.potency || 0), false, true);
    SR5_EntityHelpers.updateModifier(i.data.test, game.i18n.localize('SR5.Force'), game.i18n.localize('SR5.LinkedAttribute'), (i.data.force || 0), false, true);
    SR5_EntityHelpers.updateDicePool(i.data.test);
  }

  //Handle power point cost
  static _handleAdeptPower(power) {
    if (power.powerPointsCost.isRatingBased) {
      power.powerPointsCost.value = power.powerPointsCost.base * power.itemRating;
    } else {
      power.powerPointsCost.value = power.powerPointsCost.base;
    }
  }

  ////////////////////// FOCUS ///////////////////////
  static _handleFocus(focus) {
    this._handleItemPrice(focus);
    this._handleItemAvailability(focus);
  }

  static _focusMaintien(focus, actor) {
    let spellList = [];
    for (let i of actor.items) {
      if (i.type === "itemSpell" && i.data.data.category === focus.subType) {
        spellList.push(i.name);
      }
    }
    return spellList;
  }

  ////////////////////// DECK & PROGRAMMES ///////////////////////
  static _handleCommlink(commlink) {
    switch (commlink.module){
      case "standard":
        SR5_EntityHelpers.updateModifier(commlink.price, 'standard', 'module', 100);
        break;
      case "hotsim":
        SR5_EntityHelpers.updateModifier(commlink.price, 'hotsim', 'module', 250);
        SR5_EntityHelpers.updateModifier(commlink.availability, 'hotsim', 'module', 4);
        break;
      default:
        SR5_SystemHelpers.srLog(3,"_handleCommlink",`Unknown module : '${commlink.module}'`);
    }
  }

  //Handle complex form
  static _handleComplexForm(i, actorData) {
    // Fading calculation
    i.fadingValue = i.fadingModifier + (i.level || 0);
    if (i.fadingValue < 2) {
      i.fadingValue = 2;
    }
  }

  ////////////////////// SIN /////////////////////////////////
  static _handleSinLicense(item) {
    item.price.base = 2500 * item.itemRating;
    item.availability.base = 3 * item.itemRating;
    item.legality = "F";
    for (let l of item.license) {
      l.price = l.rating * 200;
      l.availability = l.rating * 3;
      l.legality = "F";
    }
  }

  ////////////////////// STYLE DE VIE  ///////////////////////
  // Calcul le loyer des styles de vie
  static _handleLifeStyle(lifeStyle) {
    switch (lifeStyle.type) {
      case "luxury":
        lifeStyle.price.base = 100000;
        break;
      case "high":
        lifeStyle.price.base = 10000;
        break;
      case "middle":
        lifeStyle.price.base = 5000;
        break;
      case "low":
        lifeStyle.price.base = 2000;
        break;
      case "squatter":
        lifeStyle.price.base = 500;
        break;
      case "streets":
        lifeStyle.price.base = 0;
        break;
      default:
        lifeStyle.price.base = 0;
    }

    let priceMultiplier = 1;
    for (let option of lifeStyle.options) {
      switch (option){
        case "specialWorkArea":
          SR5_EntityHelpers.updateModifier(lifeStyle.price, 'specialWorkArea', 'option', 1000);
          break;
        case "cramped":
          priceMultiplier -= 0.1;
          break;
        case "difficultToFind":
          priceMultiplier += 0.1;
          break;
        case "extraSecure":
          priceMultiplier += 0.2;
          break;
        case "dangerousArea":
          priceMultiplier -= 0.2;
          break;
        default:
          SR5_SystemHelpers.srLog(1, `Unknown '${option}' option in _handleLifeStyle()`);
      }
    }

    //TODO
    //SR5_EntityHelpers.updateModifier(lifeStyle.price, 'specialWorkArea', 'option', priceMultiplier);
  }

  ////////////////////// VEHICULES  ///////////////////////
  static _handleVehicle(vehicle) {
    if (vehicle.riggerInterface) {
      SR5_EntityHelpers.updateModifier(vehicle.price, 'riggerInterface', 'riggerInterface', 1000);
    }
    for (let mount of vehicle.mount){
      switch (mount.type) {
        case "heavy":
          SR5_EntityHelpers.updateModifier(vehicle.price, 'heavy', 'mount', 5000);
          break;
        case "standard":
          SR5_EntityHelpers.updateModifier(vehicle.price, 'standard', 'mount', 2500);
          break;
        default:
          SR5_SystemHelpers.srLog(1, `Unknown '${mount.type}' mount type in _handleVehicle()`);
      }

      if (mount.manual) SR5_EntityHelpers.updateModifier(vehicle.price, 'manual', 'mount', 2500);
    }

    if (vehicle.category === "drone") vehicle.deviceRating = vehicle.attributes.pilot;
    else vehicle.deviceRating = 2;
  }

  ////////////////////// ESPRITS  //////s////////////////
  static _handleSpirit(spirit) {

    for (let att of Object.keys(spirit.attributes)) {
      spirit.attributes[att] = spirit.itemRating;
    }
    switch (spirit.type) {
      case "air":
      case "noxious":
        spirit.attributes.body += -2;
        spirit.attributes.agility += 3;
        spirit.attributes.reaction += 4;
        spirit.attributes.strength += -3;
        spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "running", "flight");
        break;
      case "abomination":
        spirit.attributes.body += 2;
        spirit.attributes.agility += 1;
        spirit.attributes.strength += 2;
        spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "running", "gymnastics");
        break;
      case "beasts":
        spirit.attributes.body += 2;
        spirit.attributes.agility += 1;
        spirit.attributes.strength += 2;
        spirit.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
        break;
      case "blood":
        spirit.attributes.body += 2;
        spirit.attributes.agility += 2;
        spirit.attributes.strength += 2;
        spirit.attributes.logic += -1;
        spirit.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
        break;
      case "earth":
      case "barren":
        spirit.attributes.body += 4;
        spirit.attributes.agility += -2;
        spirit.attributes.reaction += -1;
        spirit.attributes.strength += 4;
        spirit.attributes.logic += -1;
        spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat");
        break;
      case "fire":
      case "nuclear":
        spirit.attributes.body += 1;
        spirit.attributes.agility += 2;
        spirit.attributes.reaction += 3;
        spirit.attributes.strength += -2;
        spirit.attributes.intuition += 1;
        spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "flight");
        break;
      case "guardian":
        spirit.attributes.body += 1;
        spirit.attributes.agility += 2;
        spirit.attributes.reaction += 3;
        spirit.attributes.strength += 2;
        spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "clubs", "blades");
        break;
      case "guidance":
        spirit.attributes.body += 3;
        spirit.attributes.agility += -1;
        spirit.attributes.reaction += 2;
        spirit.attributes.strength += 1;
        spirit.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
        break;
      case "insectCaretaker":
        spirit.attributes.agility += 1;
        spirit.attributes.reaction += 1;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "spellcasting", "leadership");
        break;
      case "insectNymph":
        spirit.attributes.body += -1;
        spirit.attributes.reaction += 3;
        spirit.attributes.strength += -1;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "spellcasting", "gymnastics");
        break;
      case "insectQueen":
        spirit.attributes.body += 5;
        spirit.attributes.agility += 3;
        spirit.attributes.reaction += 4;
        spirit.attributes.strength += 5;
        spirit.attributes.willpower += 1;
        spirit.attributes.logic += 1;
        spirit.attributes.intuition += 1;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "counterspelling", "con", "gymnastics", "spellcasting", "leadership", "negociation");
        break;
      case "insectScout":
        spirit.attributes.agility += 2;
        spirit.attributes.reaction += 2;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "sneaking", "gymnastics");
        break;
      case "insectSoldier":
        spirit.attributes.body += 3;
        spirit.attributes.agility += 1;
        spirit.attributes.reaction += 1;
        spirit.attributes.strength += 3;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "exoticRangedWeapon", "counterspelling", "gymnastics");
        break;
      case "insectWorker":
        spirit.attributes.strength += 1;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat");
        break;
      case "man":
        spirit.attributes.body += 1;
        spirit.attributes.reaction += 2;
        spirit.attributes.strength += -2;
        spirit.attributes.intuition += 1;
        spirit.skill.push("astralCombat", "assensing", "perception", "running", "unarmedCombat", "spellcasting", "swimming");
        break;
      case "plague":
        spirit.attributes.reaction += 2;
        spirit.attributes.intuition += -1;
        spirit.attributes.strength += -2;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "spellcasting");
        break;
      case "plant":
        spirit.attributes.body += 2;
        spirit.attributes.agility += -1;
        spirit.attributes.strength += 1;
        spirit.attributes.logic += -1;
        spirit.skill.push("astralCombat", "assensing", "perception", "artisan", "unarmedCombat");
        break;
      case "shadowMuse":
      case "shadowNightmare":
      case "shadowShade":
      case "shadowSuccubus":
      case "shadowWraith":
        spirit.attributes.agility += 3;
        spirit.attributes.reaction += 2;
        spirit.attributes.willpower += 1;
        spirit.attributes.intuition += 1;
        spirit.attributes.charisma += 2;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "con", "gymnastics", "intimidation");
        break;
      case "shedim":
        spirit.attributes.reaction += 2;
        spirit.attributes.strength += 1;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat");
        break;
      case "shedimMaster":
        spirit.attributes.reaction += 2;
        spirit.attributes.strength += 1;
        spirit.attributes.willpower += 1;
        spirit.attributes.logic += 1;
        spirit.attributes.intuition += 1;
        spirit.skill.push("astralCombat", "assensing", "perception", "unarmedCombat", "counterspelling", "gymnastics", "spellcasting");
        break;
      case "sludge":
        spirit.attributes.body += 1;
        spirit.attributes.agility += 1;
        spirit.attributes.reaction += 2;
        spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat");
        break;
      case "task":
        spirit.attributes.reaction += 2;
        spirit.attributes.strength += 2;
        spirit.skill.push("astralCombat", "assensing", "perception", "arcana", "unarmedCombat", "counterspelling");
        break;
      case "water":
        spirit.attributes.agility += 1;
        spirit.attributes.reaction += 2;
        spirit.attributes.charisma += 1;
        spirit.skill.push("astralCombat", "assensing", "perception", "exoticRangedWeapon", "unarmedCombat", "swimming");
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${spirit.type}' type in _handleSpirit()`);
    }

    for (let att of Object.keys(spirit.attributes)) {
      if (spirit.attributes[att] < 1) spirit.attributes[att] = 1;
    }
  }

  static _handlePower(power, actor) {
    let lists = SR5;
    let firstAttribute, secondAttibute;
    if (power.testFirstAttribute){
      if (power.testFirstAttribute === "edge" || power.testFirstAttribute === "magic" || power.testFirstAttribute === "resonance"){
        firstAttribute = actor.data.specialAttributes[power.testFirstAttribute].augmented.value;
      } else {
        firstAttribute = actor.data.attributes[power.testFirstAttribute].augmented.value;
      }
    }

    if (power.testSecondAttribute){
      if (power.testSecondAttribute === "edge" || power.testSecondAttribute === "magic" || power.testSecondAttribute === "resonance"){
        secondAttibute = actor.data.specialAttributes[power.testSecondAttribute].augmented.value;
      } else {
        secondAttibute = actor.data.attributes[power.testSecondAttribute].augmented.value;
      }
    }
    power.test.base = 0;
    if (firstAttribute) SR5_EntityHelpers.updateModifier(power.test, game.i18n.localize(lists.allAttributes[power.testFirstAttribute]), game.i18n.localize('SR5.LinkedAttribute'), firstAttribute, false, true);
    if (secondAttibute) SR5_EntityHelpers.updateModifier(power.test, game.i18n.localize(lists.allAttributes[power.testSecondAttribute]), game.i18n.localize('SR5.LinkedAttribute'), secondAttibute, false, true);
    SR5_EntityHelpers.updateDicePool(power.test);
  }

  static _handleSpritePower(power, actor) {
    power.test.base = 0;
    let skill = 0;
    if (power.testSkill) {
      skill = actor.data.skills[power.testSkill].rating.value;
      power.test.base = (skill || 0) + actor.data.level;
    }
    
    SR5_EntityHelpers.updateDicePool(power.test);
  }

  static async _checkIfAccessoryIsPlugged (gear, actor){
    for (let i of actor.items){
      if (i.type === "itemGear" || i.type === "itemArmor" || i.type === "itemAugmentation") {
        if (Object.keys(i.data.data.accessory).length){
          if (typeof i.data.data.accessory === "object") i.data.data.accessory = Object.values(i.data.data.accessory);
          let accessory = i.data.data.accessory.find(a => a._id === gear._id)
          if (accessory){
            gear.data.isPlugged = true;
            return;
          }      
        } else {
          gear.data.isPlugged = false;
        }
      }
    }
  }

  static _updatePluggedAccessory(gear, actor){
    for (let a of gear.data.accessory){
      if (a != ''){
        let item = actor.items.find(i => i.id === a._id);
        let index = gear.data.accessory.findIndex(b => b._id === a._id);
        item = item.toObject(false);
        gear.data.accessory[index] = item;
      }
    }
  }

  static applyItemEffects(item){
    for (let customEffect of Object.values(item.data.itemEffects)) {
      let skipCustomEffect = false,
          cumulative = customEffect.cumulative,
          isMultiplier = false;

      if (!customEffect.target || !customEffect.type) {
        SR5_SystemHelpers.srLog(3, `Empty custom effect target or type in applyItemEffects()`, customEffect);
        skipCustomEffect = true;
      }

      // For effect depending on wifi
      if (customEffect.wifi && !item.data.wirelessTurnedOn){ 
        skipCustomEffect = true;
      }

      let targetObject = SR5_EntityHelpers.resolveObjectPath(customEffect.target, item);
      if (targetObject === null) skipCustomEffect = true;

      if (!skipCustomEffect) {    
        if (!customEffect.multiplier) customEffect.multiplier = 1;

        //Modifier type
        switch (customEffect.type) {
          case "rating":
            customEffect.value = (item.data.itemRating || 0);
            SR5_EntityHelpers.updateModifier(targetObject, `${customEffect.name}`, `${game.i18n.localize('SR5.ItemEffect')}`, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
            break;
          case "value":
            customEffect.value = (customEffect.value || 0);
            SR5_EntityHelpers.updateModifier(targetObject, `${customEffect.name}`, `${game.i18n.localize('SR5.ItemEffect')}`, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
            break;
          default:
            SR5_SystemHelpers.srLog(1, `Unknown '${customEffect.type}' item effect type in applyItemEffects()`, customEffect);
        }
      }
    }
  }

}
