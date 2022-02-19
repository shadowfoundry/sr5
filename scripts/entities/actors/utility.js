import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_SystemHelpers } from "../../system/utility.js";
import { SR5Combat } from "../../system/srcombat.js";
import { SR5 } from "../../config.js";


export class SR5_CharacterUtility extends Actor {
  //************************************************//
  //                     ACTORS                     //
  //************************************************//

  // Reset Actors Properties
  static resetCalculatedValues(actor) {
    let data = actor.data, lists = actor.lists, list;

    // Reset Attributes
    switch (actor.type) {
      case "actorDrone":
        list = lists.vehicleAttributes;
        break;
      case "actorPc":
      case "actorGrunt":
      case "actorSpirit":
      case "actorSprite":
        list = lists.characterAttributes;
    }

    if (list){
      for (let key of Object.keys(list)) {
        data.attributes[key].natural.value = 0;
        data.attributes[key].natural.modifiers = [];
        data.attributes[key].augmented.value = 0;
        data.attributes[key].augmented.modifiers = [];
      }
    }

    // Reset Special Attributes
    if (data.specialAttributes) {
      for (let key of Object.keys(lists.characterSpecialAttributes)) {
        if (data.specialAttributes[key]) {
          data.specialAttributes[key].natural.value = 0;
          data.specialAttributes[key].natural.modifiers = [];
          data.specialAttributes[key].augmented.value = 0;
          data.specialAttributes[key].augmented.modifiers = [];
        }
      }
    }

    // Reset Initiatives
    for (let key of Object.keys(lists.characterInitiatives)) {
      if (data.initiatives[key]) {
        data.initiatives[key].value = 0;
        data.initiatives[key].modifiers = [];
        if (!data.initiatives[key].dice) { data.initiatives[key].dice = {value: 0, base: 1, modifiers: []}; }
        data.initiatives[key].dice.value = 0;
        data.initiatives[key].dice.modifiers = [];
      }
    }
    if (!this.findActiveInitiative(actor)) {
      switch (actor.type) {
        case "actorPc":
        case "actorGrunt":
          data.initiatives.physicalInit.isActive = true;
          break;
        case "actorSpirit":
          if (data.initiatives.astralInit)
            data.initiatives.astralInit.isActive = true;
          else
            data.initiatives.physicalInit.isActive = true;
          break;
        case "actorDevice":
          data.initiatives.matrixInit.isActive = true;
          break;
        case "actorDrone":
          data.initiatives.physicalInit.isActive = true;
          break;
      }
    }

    // Reset Limits
    if (data.limits) {
      for (let key of Object.keys(lists.characterLimits)) {
        if (data.limits[key]){
          data.limits[key].value = 0;
          data.limits[key].modifiers = [];
        }
      }
    }

    // Reset Defenses
    if (data.defenses){
      for (let key of Object.keys(lists.characterDefenses)) {
        if (data.defenses[key]) {
          data.defenses[key].dicePool = 0;
          data.defenses[key].modifiers = [];
          data.defenses[key].limit.value = 0;
          data.defenses[key].limit.modifiers = [];
        }
      }
    }

    // Reset Resistances
    if (data.resistances){
      for (let key of Object.keys(lists.characterResistances)) {
        if (data.resistances[key]) {
          let subkey = "";
          switch (key) {
            case "disease":
            case "toxin":
              for (subkey of Object.keys(lists.propagationVectors)) {
                data.resistances[key][subkey].dicePool = 0;
                data.resistances[key][subkey].modifiers = [];
              }
              break;
            case "specialDamage":
              for (subkey of Object.keys(lists.specialDamageTypes)) {
                data.resistances[key][subkey].dicePool = 0;
                data.resistances[key][subkey].modifiers = [];
              }
              break;
            case "physicalDamage":
            case "directSpellMana":
            case "directSpellPhysical":
            case "crashDamage":
              data.resistances[key].dicePool = 0;
              data.resistances[key].modifiers = [];
              break;
          }
        }
      }
    }

    // Reset itemsProperties
    if (data.itemsProperties?.armor){
      data.itemsProperties.armor.value = 0;
      data.itemsProperties.armor.modifiers = [];
      for (let key of Object.keys(lists.specialDamageTypes)){
        data.itemsProperties.armor.specialDamage[key].modifiers = [];
        data.itemsProperties.armor.specialDamage[key].value = [];
      }
    }

    if (data.itemsProperties?.weapon){
      data.itemsProperties.weapon.accuracy.value = 0;
      data.itemsProperties.weapon.accuracy.modifiers = [];
      data.itemsProperties.weapon.damageValue.value = 0;
      data.itemsProperties.weapon.damageValue.modifiers = [];
    }

    if (data.itemsProperties?.environmentalMod){
      for (let key of Object.keys(lists.environmentalModifiers)){
        data.itemsProperties.environmentalMod[key].value = 0;
        data.itemsProperties.environmentalMod[key].modifiers = [];
      }
    }

    // Reset Essence
    if (data.essence) {
      data.essence.value = 0;
      data.essence.modifiers = [];
    }

    // Reset Derived Attributes
    if (data.derivedAttributes) {
      for (let key of Object.keys(lists.characterDerivedAttributes)) {
        data.derivedAttributes[key].dicePool = 0;
        data.derivedAttributes[key].modifiers = [];
      }
    }

    // Reset Recoil Compensation
    if (data.recoilCompensation){
      data.recoilCompensation.value = 0;
      data.recoilCompensation.modifiers = [];
    }

    // Reset Penalties
    if (data.penalties) {
      for (let key of Object.keys(lists.penaltyTypes)) {
        data.penalties[key].actual.value = 0;
        data.penalties[key].actual.modifiers = [];
        if (data.penalties[key].damageReduction){
          data.penalties[key].damageReduction.value = 0;
          data.penalties[key].damageReduction.modifiers = [];
        }
        if (data.penalties[key].step){
          data.penalties[key].step.base = 3;
          data.penalties[key].step.value = 0;
          data.penalties[key].step.modifiers = [];
        }
      }
    }

    // Reset Movements
    if (data.movements) {
      for (let key of Object.keys(lists.movements)) {
        data.movements[key].movement.value = 0;
        data.movements[key].movement.modifiers = [];
        data.movements[key].extraMovement.value = 0;
        data.movements[key].extraMovement.modifiers = [];
        data.movements[key].test.dicePool = 0;
        data.movements[key].test.modifiers = [];
        data.movements[key].maximum.value = 0;
        data.movements[key].maximum.modifiers = [];
        data.movements[key].limit.value = 0;
        data.movements[key].limit.modifiers = [];
      }
    }

    // Reset Weight Actions
    if (data.weightActions) {
      for (let key of Object.keys(lists.weightActions)) {
        data.weightActions[key].baseWeight.value = 0;
        data.weightActions[key].baseWeight.modifiers = [];
        data.weightActions[key].extraWeight.value = 0;
        data.weightActions[key].extraWeight.modifiers = [];
        data.weightActions[key].test.dicePool = 0;
        data.weightActions[key].test.modifiers = [];
      }
    }

    // Reset Reach
    if (data.reach) {
      data.reach.value = 0;
      data.reach.modifiers = [];
    }

    // Reset Skill Groups
    if (data.skillGroups) {
      for (let key of Object.keys(lists.skillGroups)) {
        data.skillGroups[key].value = 0;
        data.skillGroups[key].modifiers = [];
      }
    }

    // Reset Skills
    if (data.skills) {
      for (let key of Object.keys(lists.skills)) {
        if (data.skills[key]) {
          data.skills[key].rating.value = 0;
          data.skills[key].rating.modifiers = [];
          data.skills[key].test.base = 0;
          data.skills[key].test.dicePool = 0;
          data.skills[key].test.modifiers = [];
          data.skills[key].limit.value = 0;
          data.skills[key].limit.modifiers = [];
          switch (key) {
            case "spellcasting":
            case "counterspelling":
            case "ritualSpellcasting":
            case "alchemy": 
              for (let category of Object.keys(lists.spellCategories)) {
                if (data.skills[key].spellCategory[category]) {
                  data.skills[key].spellCategory[category].base = 0;
                  data.skills[key].spellCategory[category].dicePool = 0;
                  data.skills[key].spellCategory[category].modifiers = [];
                } else {
                  data.skills[key].spellCategory[category] = {
                    "base": 0,
                    "value": 0,
                    "modifiers": []
                  };
                }
              }
              break;
            case "binding":
            case "banishing":
            case "summoning":
              for (let type of Object.keys(lists.spiritTypes)) {
                if (data.skills[key].spiritType[type]) {
                  data.skills[key].spiritType[type].base = 0;
                  data.skills[key].spiritType[type].dicePool = 0;
                  data.skills[key].spiritType[type].modifiers = [];
                } else {
                  data.skills[key].spiritType[type] = {
                    "base": 0,
                    "value": 0,
                    "modifiers": []
                  };
                }
              }
              break;
            case "perception":
              for (let type of Object.keys(lists.perceptionTypes)){
                if (data.skills[key].perceptionType[type]) {
                  data.skills[key].perceptionType[type].test.value = 0;
                  data.skills[key].perceptionType[type].test.modifiers = [];
                  data.skills[key].perceptionType[type].limit.base = 0;
                  data.skills[key].perceptionType[type].limit.value = 0;
                  data.skills[key].perceptionType[type].limit.modifiers = [];
                }
              }
          }
        }
      }
    }

    // Reset Vision
    if (data.visions) {
      for (let key of Object.keys(lists.visionTypes)) {
        data.visions[key].hasVision = false;
        data.visions[key].natural = false;
        data.visions[key].augmented = false;
      }
    }

    // Reset Special properties
    if (data.specialProperties) {
      for (let key of Object.keys(lists.specialProperties)) {
        data.specialProperties[key].value = 0;
        data.specialProperties[key].modifiers = [];
      }
    }

    // Reset Vehicule Test
    if (data.vehicleTest) {
      data.vehicleTest.test.base = 0;
      data.vehicleTest.test.modifiers = [];
      data.vehicleTest.limit.base = 0;
      data.vehicleTest.limit.modifiers = [];
    }

    if (data.matrix) {
      //Reset general data
      if (actor.type === "actorPc" ||actor.type === "actorGrunt"){
        data.matrix.deviceType = "";
        data.matrix.deviceName = "";
      }

      // Reset Matrix Attributes
      if (data.matrix.attributes) {
        for (let key of Object.keys(lists.matrixAttributes)) {
          data.matrix.attributes[key].value = 0;
          data.matrix.attributes[key].modifiers = [];
        }
      }

      //Reset Link Lock
      if (data.matrix.isLinkLocked) data.matrix.isLinkLocked = false;
      //Reset Jamming
      if (data.matrix.isJamming) data.matrix.isJamming = false;

      // Reset Matrix Programs
      if (data.matrix.programsCurrentActive) {
        data.matrix.programsCurrentActive.value = 0;
        data.matrix.programsCurrentActive.modifiers = [];
      }
      if (data.matrix.programsMaximumActive) {
        data.matrix.programsMaximumActive.value = 0;
        data.matrix.programsMaximumActive.modifiers = [];
      }
      if (data.matrix.programs) {
        for (let key of Object.keys(lists.programs)) {
          data.matrix.programs[key].isActive = false;
        }
      }

      // Reset Matrix Resistances
      for (let key of Object.keys(lists.matrixResistances)) {
        data.matrix.resistances[key].dicePool = 0;
        data.matrix.resistances[key].modifiers = [];
      }

      // Reset Matrix Noise
      if (data.matrix.noise) {
        data.matrix.noise.value = 0;
        data.matrix.noise.modifiers = [];
      }

      // Reset Matrix Marks
      if (data.matrix.marks) data.matrix.marks = [];

      // Reset Matrix Actions
      if (data.matrix.actions) {
        for (let key of Object.keys(lists.matrixRolledActions)) {
          data.matrix.actions[key].test.base = 0;
          data.matrix.actions[key].test.dicePool = 0;
          data.matrix.actions[key].test.modifiers = [];
          data.matrix.actions[key].limit.value = 0;
          data.matrix.actions[key].limit.modifiers = [];
          data.matrix.actions[key].defense.base = 0;
          data.matrix.actions[key].defense.dicePool = 0;
          data.matrix.actions[key].defense.modifiers = [];
        }

      // Reset Resonance Actions
      if (data.matrix.resonanceActions) {
        for (let key of Object.keys(lists.resonanceActions)) {
          if (data.matrix.resonanceActions[key].test){
            data.matrix.resonanceActions[key].test.dicePool = 0;
            data.matrix.resonanceActions[key].test.modifiers = [];
          }
          if (data.matrix.resonanceActions[key].limit){
            data.matrix.resonanceActions[key].limit.value = 0;
            data.matrix.resonanceActions[key].limit.modifiers = [];
          }
        }
      }

      // Reset Concentration
      data.matrix.concentration = false;
      }
      
      //Reset public grid if Grid rules are not active
      if (!game.settings.get("sr5", "sr5MatrixGridRules")){
        data.matrix.userGrid = "local";
      }

      //Reset connected Objects
      if (data.matrix.connectedObject){
        data.matrix.connectedObject.augmentations = {};
        data.matrix.connectedObject.weapons = {};
        data.matrix.connectedObject.armors = {};
        data.matrix.connectedObject.gears = {};
      }

      //Reset potential PanO Objects
      if (data.matrix.potentialPanObject){
        data.matrix.potentialPanObject.augmentations = {};
        data.matrix.potentialPanObject.weapons = {};
        data.matrix.potentialPanObject.armors = {};
        data.matrix.potentialPanObject.gears = {};
      }
    }

    if (data.magic) {

      // Reset Concentration
      data.magic.concentration = false;

      // Reset Elements
      for (let key of Object.keys(lists.spellCategories)) {
        data.magic.elements[key] = "";
      }

      // Reset Astral Damage
      data.magic.astralDamage.value = 0;
      data.magic.astralDamage.modifiers = [];

      // Reset Astral Defense
      data.magic.astralDefense.dicePool = 0;
      data.magic.astralDefense.modifiers = [];

      // Reset Astral Tracking
      data.magic.astralTracking.dicePool = 0;
      data.magic.astralTracking.modifiers = [];

      // Reset Magic Barrier Traversal
      data.magic.passThroughBarrier.dicePool = 0;
      data.magic.passThroughBarrier.modifiers = [];

      // Reset Power Points
      data.magic.powerPoints.value = 0;
      data.magic.powerPoints.modifiers = [];
      data.magic.powerPoints.maximum.value = 0;
      data.magic.powerPoints.maximum.modifiers = [];

      // Reset Drain Resistance
      data.magic.drainResistance.dicePool = 0;
      data.magic.drainResistance.modifiers = [];
      data.magic.drainResistance.linkedAttribute = "";

      // Reset Possession
      data.magic.isPossessed = false;

    }

    // Reset Monitors
    if (data.conditionMonitors) {
      for (let key of Object.keys(lists.monitorTypes)) {
        if (data.conditionMonitors[key]) {
          data.conditionMonitors[key].value = 0;
          data.conditionMonitors[key].modifiers = [];
        }
      }
    }

    // Reset Karma
    if (data.karma) {
      data.karma.value = 0;
      data.karma.modifiers = [];
    }

    // Reset StreetCred
    if (data.streetCred) {
      data.streetCred.value = 0;
      data.streetCred.modifiers = [];
    }

    // Reset Notoriety
    if (data.notoriety) {
      data.notoriety.value = 0;
      data.notoriety.modifiers = [];
    }

    // Reset Public Awareness
    if (data.publicAwareness) {
      data.publicAwareness.value = 0;
      data.publicAwareness.modifiers = [];
    }

    // Reset Nuyen
    if (data.nuyen) {
      data.nuyen.value = 0;
      data.nuyen.modifiers = [];
    }

  }

  ///////////////////////////////////////

  static updateNuyens(actor) {
    SR5_EntityHelpers.updateValue(actor.data.nuyen);
  }

  static updateKarmas(actor) {
    SR5_EntityHelpers.updateValue(actor.data.karma);
    SR5_EntityHelpers.updateModifier(actor.data.streetCred, `${game.i18n.localize('SR5.Karma')}`, `${game.i18n.localize('SR5.Karma')}`, Math.round(actor.data.karma.value/10), false, false);
  }

  static updateStreetCred(actor) {
    SR5_EntityHelpers.updateValue(actor.data.streetCred);
  }

  static updateNotoriety(actor) {
    if (actor.data.specialProperties.notoriety.value) SR5_EntityHelpers.updateModifier(actor.data.notoriety, `${game.i18n.localize('SR5.ReputationNotoriety')}`, `${game.i18n.localize('SR5.Qualities')}`, actor.data.specialProperties.notoriety.value);
    SR5_EntityHelpers.updateValue(actor.data.notoriety);
  }

  static updatePublicAwareness(actor) {
    SR5_EntityHelpers.updateValue(actor.data.publicAwareness);
  }

  static updatePenalties(actor) {
    if (!actor) { SR5_SystemHelpers.srLog(1, `Missing or invalid actor in call to 'updatePenalties()'`); return; }
    if (!actor.data.penalties) { SR5_SystemHelpers.srLog(1, `No penalties properties for '${actor.name}' actor in call to 'updatePenalties()'`); return; }
    let lists = actor.lists, data = actor.data;

    for (let key of Object.keys(lists.penaltyTypes)) {
        switch (key) {
          case "physical":
          case "stun":
          case "condition":
            if (data.conditionMonitors[key]) {
              SR5_EntityHelpers.updateValue(data.penalties[key].step);
              SR5_EntityHelpers.updateValue(data.penalties[key].boxReduction);
              data.penalties[key].actual.base = -Math.floor( (data.conditionMonitors[key].current - data.penalties[key].boxReduction.value) / data.penalties[key].step.value);
              if (data.penalties[key].actual.base > 0) data.penalties[key].actual.base = 0;
            }
            break;
          case "matrix":
            data.penalties[key].actual.base = 0;
            SR5_CharacterUtility.handleSustaining(actor, "itemComplexForm", key)
            break;
          case "magic":
            data.penalties[key].actual.base = 0;
            SR5_CharacterUtility.handleSustaining(actor, "itemSpell", key);
            break;
          case "special":
            data.penalties[key].actual.base = 0;
            break;
          default:
            SR5_SystemHelpers.srLog(1, `Unknown '${key}' penalty type in 'updatePenalties()'`);
        }

        SR5_EntityHelpers.updateValue(data.penalties[key].actual);
        // Assure penalty is not a positive number
        if (data.penalties[key].actual.value > 0) data.penalties[key].actual.value = 0;
    }

    if (actor.type === "actorPc" || actor.type === "actorSpirit") {
      data.penalties.condition.actual.base = data.penalties.physical.actual.base + data.penalties.stun.actual.base;
      SR5_EntityHelpers.updateValue(data.penalties.condition.actual);
    }
  }

  static applyPenalty(penalty, property, actor) {
    if (!penalty || !property || !actor) { SR5_SystemHelpers.srLog(1, `Missing or invalid parameter in call to 'applyPenalty()'`); return; }
    if (!actor.data.penalties) { SR5_SystemHelpers.srLog(3, `No existing penalties on '${actor.name}' actor in call to 'applyPenalty()'`); return; }
    let lists = actor.lists, data = actor.data;

    switch (penalty) {
      case "condition":
      case "matrix":
      case "magic":
      case "special":
        if (data.penalties[penalty].actual.value) {
          let type = `${game.i18n.localize(lists.penaltyTypes[penalty])}`;
          SR5_EntityHelpers.updateModifier(property, `${game.i18n.localize('SR5.Penalty')}`, type, data.penalties[penalty].actual.value);
        }
        break;
      default:
        SR5_SystemHelpers.srLog(3, `Unknown penalty type '${penalty}' in 'applyPenalty()'`);
        return;
    }
  }

  // Handle sustaining modifiers
  static handleSustaining(actor, itemType, concentrationType) {
    let sustainedMod = 2,
        lists = actor.lists;
    
    //Check sustaining mod. 
    for (let i of actor.items){
       if (i.data.data.systemEffects){
        for (let is of Object.values(i.data.data.systemEffects)){
          if (is.value === "sustainingMod1" && i.data.data.isActive) sustainedMod = 1;
        }
      }
    }

    //Apply sustaining malus.
    for (let i of actor.items) {
      if (i.data.data.isActive && i.type === itemType && !i.data.data.freeSustain) {
        SR5_EntityHelpers.updateModifier(actor.data.penalties[concentrationType].actual,`${i.name}`, `${game.i18n.localize(lists.itemTypes[i.type])}`, -sustainedMod);
      }

      //Except if concentration is active.
      if (i.data.data.isActive && i.type === itemType
        && !i.data.data.freeSustain && !actor.data[concentrationType].concentration
        && (i.data.data.force <= actor.data.specialProperties.concentration.value || i.data.data.level <= actor.data.specialProperties.concentration.value) 
      ){
          SR5_EntityHelpers.updateModifier(actor.data.penalties[concentrationType].actual,`${game.i18n.localize('SR5.QualityTypePositive')}`, `${game.i18n.localize('SR5.Concentration')}`, sustainedMod);
          actor.data[concentrationType].concentration = true;
          i.data.data.freeSustain = true;
        }
    }
  }

  //Handle vision types and environmental modifiers
  static async handleVision(actor){
    let data = actor.data, lists = actor.lists;

    if (actor.type === "actorSpirit") {
      data.visions.astral.natural = true;
      data.visions.astral.hasVision = true;
      data.visions.astral.isActive = true;
    }
    if (data.initiatives.astralInit.isActive) data.visions.augmented = true;
    if (data.visions.astral.natural || data.visions.augmented) data.visions.astral.hasVision = true;
    if (data.visions.astral.isActive) data.visions.astral.hasVision = true;
    
    if (data.visions.astral.isActive){
      SR5_EntityHelpers.updateModifier(data.itemsProperties.environmentalMod.visibility, `${game.i18n.localize('SR5.AstralPerception')}`, `${game.i18n.localize('SR5.VisionType')}`, -4, false, false);
      SR5_EntityHelpers.updateModifier(data.itemsProperties.environmentalMod.light, `${game.i18n.localize('SR5.AstralPerception')}`, `${game.i18n.localize('SR5.VisionType')}`, -4, false, false);
      SR5_EntityHelpers.updateModifier(data.itemsProperties.environmentalMod.glare, `${game.i18n.localize('SR5.AstralPerception')}`, `${game.i18n.localize('SR5.VisionType')}`, -4, false, false);
      SR5_EntityHelpers.updateModifier(data.itemsProperties.environmentalMod.wind, `${game.i18n.localize('SR5.AstralPerception')}`, `${game.i18n.localize('SR5.VisionType')}`, -4, false, false);
    }

    if (data.visions.lowLight.natural || data.visions.lowLight.augmented) {
      data.visions.lowLight.hasVision = true;
      if (data.visions.lowLight.isActive){
        SR5_EntityHelpers.updateModifier(data.itemsProperties.environmentalMod.light, `${game.i18n.localize('SR5.LowLightVision')}`, `${game.i18n.localize('SR5.VisionType')}`, -2, false, false);
      }
    }
    if (data.visions.thermographic.natural || data.visions.thermographic.augmented){ 
      data.visions.thermographic.hasVision = true;
      if (data.visions.thermographic.isActive){
        SR5_EntityHelpers.updateModifier(data.itemsProperties.environmentalMod.light, `${game.i18n.localize('SR5.ThermographicVision')}`, `${game.i18n.localize('SR5.VisionType')}`, -1, false, false);
        SR5_EntityHelpers.updateModifier(data.itemsProperties.environmentalMod.visibility, `${game.i18n.localize('SR5.ThermographicVision')}`, `${game.i18n.localize('SR5.VisionType')}`, -1, false, false);
      }
    }
    if (data.visions.ultrasound.natural || data.visions.ultrasound.augmented){ 
      data.visions.ultrasound.hasVision = true;
      if (data.visions.ultrasound.isActive){
        SR5_EntityHelpers.updateModifier(data.itemsProperties.environmentalMod.visibility, `${game.i18n.localize('SR5.ThermographicVision')}`, `${game.i18n.localize('SR5.VisionType')}`, -1, false, false);
        SR5_EntityHelpers.updateModifier(data.itemsProperties.environmentalMod.light, `${game.i18n.localize('SR5.UltrasoundVision')}`, `${game.i18n.localize('SR5.VisionType')}`, -3, false, false);
      }
    }
    //environmental modifiers
    if (data.itemsProperties?.environmentalMod){
      for (let key of Object.keys(lists.environmentalModifiers)){
        SR5_EntityHelpers.updateValue(data.itemsProperties.environmentalMod[key]);
      }
    }
  } 

  static async switchVision(actor, vision){
    let data = duplicate(actor.data.data),
        lists = actor.data.lists,
        currentVision;

    for (let key of Object.keys(lists.visionActive)){
      if (data.visions[key].isActive) currentVision = key;
    }

    for (let key of Object.keys(lists.visionActive)){
      if (key === vision && key === currentVision) data.visions[key].isActive = false;
      else if (key === vision) data.visions[key].isActive = true;
      else data.visions[key].isActive = false;
    }

    await actor.update({ 'data': data });
  }

  static applyRacialModifers(actor) {
    let lists = actor.lists, data = actor.data;
    let label = `${game.i18n.localize(lists.metatypes[data.biography.characterMetatype])}`;

    switch (data.biography.characterMetatype) {
      case "human":
        break;
      case "elf":
        data.visions.lowLight.natural = true;
        if (actor.type === "actorGrunt") {
          SR5_EntityHelpers.updateModifier(data.attributes.agility.natural, label, `${game.i18n.localize('SR5.Metatype')}`, 1);
          SR5_EntityHelpers.updateModifier(data.attributes.charisma.natural, label, `${game.i18n.localize('SR5.Metatype')}`, 2);
        }
        break;
      case "dwarf":
        // TODO : lifestyle cost * 1.2
        data.visions.thermographic.natural = true;
        for (let vector of Object.keys(lists.propagationVectors)) {
          SR5_EntityHelpers.updateModifier(data.resistances.disease[vector], label, `${game.i18n.localize('SR5.Metatype')}`, 2);
          SR5_EntityHelpers.updateModifier(data.resistances.toxin[vector], label, `${game.i18n.localize('SR5.Metatype')}`, 2);
        }
        if (actor.type === "actorGrunt") {
          SR5_EntityHelpers.updateModifier(data.attributes.body.natural, label, `${game.i18n.localize('SR5.Metatype')}`, 2);
          SR5_EntityHelpers.updateModifier(data.attributes.reaction.natural, label, `${game.i18n.localize('SR5.Metatype')}`, -1);
          SR5_EntityHelpers.updateModifier(data.attributes.strength.natural, label, `${game.i18n.localize('SR5.Metatype')}`, 2);
          SR5_EntityHelpers.updateModifier(data.attributes.willpower.natural, label, `${game.i18n.localize('SR5.Metatype')}`, 1);
        }        
        break;
      case "ork":
        data.visions.lowLight.natural = true;
        if (actor.type === "actorGrunt") {
          SR5_EntityHelpers.updateModifier(data.attributes.body.natural, label, `${game.i18n.localize('SR5.Metatype')}`, 3);
          SR5_EntityHelpers.updateModifier(data.attributes.strength.natural, label, `${game.i18n.localize('SR5.Metatype')}`, 2);
          SR5_EntityHelpers.updateModifier(data.attributes.logic.natural, label, `${game.i18n.localize('SR5.Metatype')}`, -1);
          SR5_EntityHelpers.updateModifier(data.attributes.charisma.natural, label, `${game.i18n.localize('SR5.Metatype')}`, -1);
        }
        break;
      case "troll":
        // TODO : lifestyle cost * 2
        data.visions.thermographic.natural = true;
        SR5_EntityHelpers.updateModifier(data.reach, label, `${game.i18n.localize('SR5.Metatype')}`, 1);
        SR5_EntityHelpers.updateModifier(data.resistances.physicalDamage, label, `${game.i18n.localize('SR5.Metatype')}`, 1);
        if (actor.type === "actorGrunt") {
          SR5_EntityHelpers.updateModifier(data.attributes.body.natural, label, `${game.i18n.localize('SR5.Metatype')}`, 4);
          SR5_EntityHelpers.updateModifier(data.attributes.agility.natural, label, `${game.i18n.localize('SR5.Metatype')}`, -1);
          SR5_EntityHelpers.updateModifier(data.attributes.strength.natural, label, `${game.i18n.localize('SR5.Metatype')}`, 4);
          SR5_EntityHelpers.updateModifier(data.attributes.logic.natural, label, `${game.i18n.localize('SR5.Metatype')}`, -1);
          SR5_EntityHelpers.updateModifier(data.attributes.charisma.natural, label, `${game.i18n.localize('SR5.Metatype')}`, -2);
        }
        break;
      default:
        SR5_SystemHelpers.srLog(3, `Unknown metatype '${data.biography.characterMetatype}' in 'applyRacialModifers()'`);
        return;
    }
  }

  // Update Attributes
  static updateAttributes(actor) {
    let lists = actor.lists, data = actor.data, list;

    if (actor.type == "actorDrone") {
      list = lists.vehicleAttributes;
    } else {
      list = lists.characterAttributes;
    }

    for (let key of Object.keys(list)) {
      SR5_EntityHelpers.updateValue(data.attributes[key].natural, 0);
      data.attributes[key].augmented.base = data.attributes[key].natural.value;
      SR5_EntityHelpers.updateValue(data.attributes[key].augmented, 0);
    }
  }

  static updateSpiritAttributes(actor) {
    let data = actor.data, attributes = data.attributes, specialAttributes = data.specialAttributes, essence = data.essence;
    let lists = actor.lists;

    //Valeur de base des attributs
    for (let key of Object.keys(lists.characterAttributes)) {
      attributes[key].natural.base = data.force.value;
    }
    data.activeSpecialAttribute = "magic";
    specialAttributes.magic.natural.base = data.force.value;
    SR5_EntityHelpers.updateValue(specialAttributes.magic.natural);
    essence.base = data.force.value;
    SR5_EntityHelpers.updateValue(essence);
    let label = `${game.i18n.localize('SR5.SpiritType')} (${data.type})`;

    switch (data.type) {
      case "watcher":
        attributes.body.natural.base = 0;
        attributes.agility.natural.base = 0;
        attributes.reaction.natural.base = 0;
        attributes.strength.natural.base = 0;
        SR5_EntityHelpers.updateModifier(attributes.willpower.natural, label, 'spiritType', -2);
        SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', -2);
        SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', -2);
        SR5_EntityHelpers.updateModifier(attributes.charisma.natural, label, 'spiritType', -2);
        break;
      case "homunculus":
        attributes.body.natural.base = 0;
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', -2);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', -2);
        attributes.willpower.natural.base = 3;
        break;
      case "air":
      case "noxious":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', -2);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +3);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +4);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -3);
        break;
      case "water":
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.charisma.natural, label, 'spiritType', +1);
        break;
      case "sludge":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        break;
      case "man":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -2);
        SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
        break;
      case "plague":
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -2);
        SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
        break;
      case "earth":
      case "barren":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +4);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', -2);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', -1);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +4);
        SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', -1);
        break;
      case "fire":
      case "nuclear":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +3);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -2);
        SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
        break;
      case "beasts":
      case "abomination":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +2);
        break;
      case "shadowMuse":
      case "shadowNightmare":
      case "shadowShade":
      case "shadowSuccubus":
      case "shadowWraith":
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +3);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.willpower.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.charisma.natural, label, 'spiritType', +2);
        break;
      case "blood":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', -1);
        break;
      case "shedim":
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
        break;
      case "shedimMaster":
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.willpower.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
        break;
      case "insectCaretaker":
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +1);
        break;
      case "insectNymph":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', -1);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +3);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', -1);
        break;
      case "insectScout":
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        break;
      case "insectSoldier":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +3);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +3);
        break;
      case "insectWorker":
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
        break;
      case "insectQueen":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +5);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +3);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +4);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +5);
        SR5_EntityHelpers.updateModifier(attributes.willpower.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.intuition.natural, label, 'spiritType', +1);
        break;
      case "guardian":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +3);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +2);
        break;
      case "guidance":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +3);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', -1);
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
        break;
      case "plant":
        SR5_EntityHelpers.updateModifier(attributes.body.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.agility.natural, label, 'spiritType', -1);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +1);
        SR5_EntityHelpers.updateModifier(attributes.logic.natural, label, 'spiritType', -1);
        break;
      case "task":
        SR5_EntityHelpers.updateModifier(attributes.reaction.natural, label, 'spiritType', +2);
        SR5_EntityHelpers.updateModifier(attributes.strength.natural, label, 'spiritType', +2);
        break;
      default:
        SR5_SystemHelpers.srLog(3, `Unknown ${data.type} spirit type in 'updateSpiritAttributes()'`);
        return false;
    }
  }


  static updateSpriteValues(actor) {
    let data = actor.data, attributes = data.attributes, specialAttributes = data.specialAttributes, matrixAttributes = data.matrix.attributes;
    let lists = actor.lists;

    //Base value of attributes. Hidden but needed for rolls.
    for (let key of Object.keys(lists.characterAttributes)) {
      attributes[key].natural.base = data.level;
    }
    specialAttributes.resonance.natural.base = data.level;

    //Base Matrix Attributes
    for (let key of Object.keys(lists.matrixAttributes)) {
      matrixAttributes[key].base = data.level;
    }
    data.matrix.deviceRating = data.level;
  }


  // Update Actors Special Attributes
  static updateSpecialAttributes(actor) {
    let lists = actor.lists, data = actor.data;

    for (let key of Object.keys(lists.characterSpecialAttributes)) {
      if (data.specialAttributes[key]) {
        SR5_EntityHelpers.updateValue(data.specialAttributes[key].natural, 0);

        data.specialAttributes[key].augmented.base = data.specialAttributes[key].natural.value;
        if (key == 'magic' || key == 'resonance') {
          if (data.essence?.base - data.essence?.value) {
            SR5_EntityHelpers.updateModifier(data.specialAttributes[key].augmented, game.i18n.localize('SR5.EssenceLoss'), '', -1 * Math.ceil(data.essence.base - data.essence.value));
          }
        }
        SR5_EntityHelpers.updateValue(data.specialAttributes[key].augmented, 0);
      }
    }

    if (actor.type === "actorPc" || actor.type === "actorGrunt") {
      // Check Magic/Resonance Actor Sheet Display (and Default to Magic)
      if (!data.activeSpecialAttribute) data.activeSpecialAttribute = "magic";

      // Update encumbrance
      let armorAccessoriesModifiers = data.itemsProperties.armor.modifiers.filter(m => m.type == "armorAccessory");
      if (armorAccessoriesModifiers) {
        let totalArmorAccessoriesValue = SR5_EntityHelpers.modifiersSum(armorAccessoriesModifiers);
        if (totalArmorAccessoriesValue > data.attributes.strength.augmented.value + 1) {
          let armorPenalty = Math.floor((totalArmorAccessoriesValue - data.attributes.strength.augmented.value) / 2);
          SR5_EntityHelpers.updateModifier(data.attributes.agility.augmented, game.i18n.localize('SR5.ArmorEncumbrance'), 'armorEncumbrance', -1 * armorPenalty);
          SR5_EntityHelpers.updateModifier(data.attributes.reaction.augmented, game.i18n.localize('SR5.ArmorEncumbrance'), 'armorEncumbrance', -1 * armorPenalty);
          this.updateAttributes(actor);
        }
      }
    }
  }

  // Generate Essence
  static updateEssence(actor) {
    SR5_EntityHelpers.updateValue(actor.data.essence);
  }

  // Generate spirit values
  static updateSpiritValues(actor) {
    SR5_EntityHelpers.updateValue(actor.data.force);
    if (actor.data.type == "homunculus") {
      actor.data.isMaterializing = true;
    }
  }

  // Generate Special Properties
  static updateSpecialProperties(actor) {
    let lists = actor.lists, data = actor.data;
    for (let key of Object.keys(lists.specialProperties)) {
      if (data.specialProperties[key]) {
        SR5_EntityHelpers.updateValue(data.specialProperties[key]);
      }
    }
  }

  // Generate Actor Derived Attributes
  static updateDerivedAttributes(actor) {
    let lists = actor.lists;
    let derivedAttributes = actor.data.derivedAttributes;
    let attributes = actor.data.attributes;

    for (let key of Object.keys(lists.characterDerivedAttributes)) {
      derivedAttributes[key].base = 0
      switch (key) {
        case "composure":
          SR5_EntityHelpers.updateModifier(derivedAttributes[key],`${game.i18n.localize('SR5.Charisma')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.charisma.augmented.value);
          SR5_EntityHelpers.updateModifier(derivedAttributes[key],`${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
          break;
        case "judgeIntentions":
          SR5_EntityHelpers.updateModifier(derivedAttributes[key],`${game.i18n.localize('SR5.Charisma')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.charisma.augmented.value);
          SR5_EntityHelpers.updateModifier(derivedAttributes[key],`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
          break;
        case "memory":
          SR5_EntityHelpers.updateModifier(derivedAttributes[key],`${game.i18n.localize('SR5.Logic')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.logic.augmented.value);
          SR5_EntityHelpers.updateModifier(derivedAttributes[key],`${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
          break;
        case "surprise":
          SR5_EntityHelpers.updateModifier(derivedAttributes[key],`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.reaction.augmented.value);
          SR5_EntityHelpers.updateModifier(derivedAttributes[key],`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
          break;
        default:
          SR5_SystemHelpers.srLog(1, `Unknown derived attribute '${key}' in 'updateDerivedAttributes()'`);
      }
      this.applyPenalty("condition", derivedAttributes[key], actor);
      this.applyPenalty("matrix", derivedAttributes[key], actor);
      this.applyPenalty("magic", derivedAttributes[key], actor);
      this.applyPenalty("special", derivedAttributes[key], actor);
      SR5_EntityHelpers.updateDicePool(derivedAttributes[key], 0);
    }
  }

  // Generate Actors Recoil Compensation
  static updateRecoil(actor) {
    if (actor.type === "actorDrone") actor.data.recoilCompensation.base = actor.data.attributes.body.augmented.value;
    else actor.data.recoilCompensation.base = parseInt(1 + Math.ceil(actor.data.attributes.strength.augmented.value / 3));

    SR5_EntityHelpers.updateValue(actor.data.recoilCompensation);
  }

  // Generate  Actors Weights Actions
  static updateEncumbrance(actor) {
    let lists = actor.lists;
    let attributes = actor.data.attributes;
    let weightActions = actor.data.weightActions;

    for (let key of Object.keys(lists.weightActions)) {
      switch (key) {
        case "carry":
          weightActions[key].baseWeight.base = attributes.strength.augmented.value * 10;
          weightActions[key].extraWeight.base = 10;
          break;
        case "lift":
          weightActions[key].baseWeight.base = attributes.strength.augmented.value * 15;
          weightActions[key].extraWeight.base = 15;
          break;
        case "liftAboveHead":
          weightActions[key].baseWeight.base = attributes.strength.augmented.value * 5;
          weightActions[key].extraWeight.base = 5;
          break;
        default:
          SR5_SystemHelpers.srLog(1, `Unknown weights action '${key}' in 'updateEncumbrance()'`);
      }
      SR5_EntityHelpers.updateValue(weightActions[key].baseWeight);
      SR5_EntityHelpers.updateValue(weightActions[key].extraWeight);
      weightActions[key].test.base = 0;
      SR5_EntityHelpers.updateModifier(weightActions[key].test,`${game.i18n.localize('SR5.Strength')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.strength.augmented.value);
      SR5_EntityHelpers.updateModifier(weightActions[key].test,`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value );
      this.applyPenalty("condition", weightActions[key].test, actor);
      this.applyPenalty("matrix", weightActions[key].test, actor);
      this.applyPenalty("magic", weightActions[key].test, actor);
      this.applyPenalty("special", weightActions[key].test, actor);
      SR5_EntityHelpers.updateDicePool(weightActions[key].test, 0);
    }
  }

  // Handle Actors Movement
  // TODO : Add toggle for running modifiers p.162
  static updateMovements(actor) {
    let lists = actor.lists;
    let movements = actor.data.movements;
    let attributes = actor.data.attributes;
    let skills = actor.data.skills;
    let biography = actor.data.biography;

    for (let key of Object.keys(lists.movements)) {
      movements[key].movement.base = 0;
      switch (key) {
        case "fly":
          if (actor.type == "actorSpirit") {
            movements[key].extraMovement.base = 5;
          }
          break;
        case "verticalJump":
          let height = (biography && biography.characterHeight ? biography.characterHeight / 100 : 1);
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.Agility')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.agility.augmented.value);
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.SkillGymnastics')}`, `${game.i18n.localize('SR5.Skill')}`, skills.gymnastics.rating.value);
          movements[key].extraMovement.base = 0.5;
          movements[key].max = SR5_EntityHelpers.roundDecimal(1.5 * height, 2);
          break;
        case "horizontalJumpStanding":
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.Agility')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.agility.augmented.value);
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.SkillGymnastics')}`, `${game.i18n.localize('SR5.Skill')}`, skills.gymnastics.rating.value);
          movements[key].extraMovement.base = 1;
          movements[key].maximum.base = Math.ceil(1.5 * attributes.agility.augmented.value);
        break;
        case "horizontalJumpRunning":
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.Agility')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.agility.augmented.value);
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.SkillGymnastics')}`, `${game.i18n.localize('SR5.Skill')}`, skills.gymnastics.rating.value);
          movements[key].extraMovement.base = 2;
          movements[key].maximum.base = Math.ceil(1.5 * attributes.agility.augmented.value);
          break;
        case "holdBreath":
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.SkillSwimming')}`, `${game.i18n.localize('SR5.Skill')}`, skills.swimming.rating.value);
          movements[key].movement.base = 60;
          movements[key].extraMovement.base = 15;
          break;
        case "run":
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.Strength')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.strength.augmented.value);
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.SkillRunning')}`, `${game.i18n.localize('SR5.Skill')}`, skills.running.rating.value);
          movements[key].movement.base = attributes.agility.augmented.value * 4;
          if (biography && (biography.characterMetatype === "dwarf" || biography.characterMetatype === "troll"))
            movements[key].extraMovement.base = 1;
          else {
            if (actor.type == "actorSpirit") {
              movements[key].extraMovement.base = 5;
            } else {
              movements[key].extraMovement.base = 2;
            }
          }
          break;
        case "swim":
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.Strength')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.strength.augmented.value);
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.SkillSwimming')}`, `${game.i18n.localize('SR5.Skill')}`, skills.swimming.rating.value);
          movements[key].movement.base = Math.ceil((attributes.strength.augmented.value + attributes.agility.augmented.value) / 2);
          if (biography && (biography.characterMetatype === "elf" || biography.characterMetatype === "troll"))
            movements[key].extraMovement.base = 2;
          else {
            if (actor.type == "actorSpirit") {
              movements[key].extraMovement.base = 5;
            } else {
              movements[key].extraMovement.base = 1;
            }
          }
          break;
        case "treadWater":
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.Strength')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.strength.augmented.value);
          SR5_EntityHelpers.updateModifier(movements[key].test,`${game.i18n.localize('SR5.SkillSwimming')}`, `${game.i18n.localize('SR5.Skill')}`, skills.swimming.rating.value);
          movements[key].movement.base = attributes.strength.augmented.value;
          movements[key].extraMovement.base = attributes.strength.augmented.value;
          break;
        case "walk":
          SR5_EntityHelpers.updateModifier(movements[key].movement,`${game.i18n.localize('SR5.Agility')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.agility.augmented.value * 2);
          break;
        default:
          SR5_SystemHelpers.srLog(1, `Unknown movement '${key}' in 'updateMovements()'`);
      }
      SR5_EntityHelpers.updateValue(movements[key].movement);
      SR5_EntityHelpers.updateValue(movements[key].extraMovement);
      SR5_EntityHelpers.updateValue(movements[key].maximum);
      this.applyPenalty("condition", movements[key].test, actor);
      this.applyPenalty("matrix", movements[key].test, actor);
      this.applyPenalty("magic", movements[key].test, actor);
      this.applyPenalty("special", movements[key].test, actor);
      SR5_EntityHelpers.updateDicePool(movements[key].test, 0);
    }
  }

  // Handle Actors Condition Monitors
  static updateConditionMonitors(actor) {
    let lists = actor.lists, data = actor.data, conditionMonitors = data.conditionMonitors, attributes = data.attributes, specialAttributes = data.specialAttributes;
    if (actor.type == "actorSpirit") {
      if (data.type == "homunculus" || data.type == "watcher") {
        delete data.conditionMonitors.physical;
        delete data.conditionMonitors.stun;
        data.conditionMonitors.condition = {
          "value": 0,
          "base": 0,
          "modifiers": [],
          "current": 0,
          "boxes": []
        };
        delete data.statusBars.physical;
        delete data.statusBars.stun;
        data.statusBars.condition = {
          "value": 0,
          "max": 0
        };
      }
    }

    for (let key of Object.keys(lists.monitorTypes)) {
      if (conditionMonitors[key]) {
        switch (key) {
          case "stun":
            conditionMonitors[key].base = Math.ceil((attributes.willpower.augmented.value / 2) + 8);
            break;
          case "physical":
            conditionMonitors[key].base = Math.ceil((attributes.body.augmented.value / 2) + 8);
            break;
          case "condition":
            if (actor.type == "actorDrone") {
              if (data.type === "drone") conditionMonitors[key].base = Math.ceil((attributes.body.augmented.value / 2) + 6);
              else conditionMonitors[key].base = Math.ceil((attributes.body.augmented.value / 2) + 12);
            } else {
              conditionMonitors[key].base = Math.max(Math.ceil((attributes.willpower.augmented.value / 2) + 8), Math.ceil((attributes.body.augmented.value / 2) + 8));
            }
            break;
          case "overflow":
            conditionMonitors[key].base = attributes.body.augmented.value;
            break;
          case "matrix":
            conditionMonitors[key].base = Math.ceil((data.matrix.deviceRating / 2) + 8);
            break;
          case "edge":
            conditionMonitors[key].base = specialAttributes.edge.augmented.value;
            break;
          default:
            SR5_SystemHelpers.srLog(1, `Unknown '${key}' condition monitor type in 'updateConditionMonitors()'`);
            return;
        }
        SR5_EntityHelpers.updateValue(conditionMonitors[key], 1);
        SR5_EntityHelpers.GenerateMonitorBoxes(data, key);
        SR5_EntityHelpers.updateStatusBars(actor, key);
      }
    }
  }

  // Generate physical initiative
  static updateInitiativePhysical(actor) {
    let data = actor.data, initiatives = data.initiatives, 
        attributes = data.attributes, initPhy = initiatives.physicalInit,
        lists = actor.lists;

    initPhy.base = 0;
    initPhy.dice.base = 0;
    
    switch (actor.type) {
      case "actorDrone":
        let controlerData;
        if (data.vehicleOwner.id) {
          controlerData = actor.flags.sr5.vehicleControler.data;
        }
        switch (data.controlMode){
          case "autopilot":
            SR5_EntityHelpers.updateModifier(initPhy,`${game.i18n.localize('SR5.VehicleStat_PilotShort')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.pilot.augmented.value);
            SR5_EntityHelpers.updateModifier(initPhy,`${game.i18n.localize('SR5.VehicleStat_PilotShort')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.pilot.augmented.value);
            initPhy.dice.base = 4;
            break;
          case "manual":
            SR5_EntityHelpers.updateModifier(initPhy,`${game.i18n.localize('SR5.InitiativePhysical')}`, `${game.i18n.localize('SR5.Controler')}`, controlerData.initiatives.physicalInit.value);
            SR5_EntityHelpers.updateModifier(initPhy.dice,`${game.i18n.localize('SR5.InitiativePhysical')}`, `${game.i18n.localize('SR5.Controler')}`, controlerData.initiatives.physicalInit.dice.value);
            break;
          case "remote":
          case "rigging":
            SR5_EntityHelpers.updateModifier(initPhy,`${game.i18n.localize('SR5.InitiativeMatrix')}`, `${game.i18n.localize('SR5.Controler')}`, controlerData.initiatives.matrixInit.value);
            SR5_EntityHelpers.updateModifier(initPhy.dice,`${game.i18n.localize('SR5.InitiativeMatrix')}`, `${game.i18n.localize('SR5.Controler')}`, controlerData.initiatives.matrixInit.dice.value);
            break;
          default:
            SR5_SystemHelpers.srLog(1, `Unknown controle mode '${data.controlMode}' in 'updateInitiatives() for drone/vehicle'`);
        }
        break;
      case "actorSpirit":
        SR5_EntityHelpers.updateModifier(initPhy,`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
        SR5_EntityHelpers.updateModifier(initPhy,`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.reaction.augmented.value);
        initPhy.dice.base = 1;
        if (data.type !== "homunculus")  SR5_EntityHelpers.updateModifier(initPhy.dice,`${game.i18n.localize('SR5.SpiritType')}`, `${game.i18n.localize(lists.spiritTypes[data.type])}`, 1);
        break;
      default:
        SR5_EntityHelpers.updateModifier(initPhy,`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
        SR5_EntityHelpers.updateModifier(initPhy,`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.reaction.augmented.value);
        initPhy.dice.base = 1;
    }

    this.applyPenalty("condition", initPhy, actor);
    this.applyPenalty("matrix", initPhy, actor);
    this.applyPenalty("magic", initPhy, actor);
    SR5_EntityHelpers.updateValue(initPhy, 0);
    SR5_EntityHelpers.updateValue(initPhy.dice, 0, 5);
    initPhy.dice.value = Math.floor(initPhy.dice.value);
  }

  // Generate astral initiative
  static updateInitiativeAstral(actor) {
    let data = actor.data, initiatives = data.initiatives, attributes = data.attributes, initAst = initiatives.astralInit, lists = actor.lists;

    initAst.base = 0;
    initAst.dice.base = 0;

    if (actor.type === "actorSpirit") {
      SR5_EntityHelpers.updateModifier(initAst,`${game.i18n.localize('SR5.SpiritForce')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.force.value);
      switch (data.type) {
        case "watcher":
          SR5_EntityHelpers.updateModifier(initAst,`${game.i18n.localize('SR5.SpiritForce')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.force.value);
          SR5_EntityHelpers.updateModifier(initAst.dice,`${game.i18n.localize('SR5.SpiritType')}`, `${game.i18n.localize(lists.spiritTypes[data.type])}`, 1);
          break;
        case "shadowMuse":
        case "shadowNightmare":
        case "shadowShade":
        case "shadowSuccubus":
        case "shadowWraith":
          SR5_EntityHelpers.updateModifier(initAst,`${game.i18n.localize('SR5.SpiritForce')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.force.value);
          SR5_EntityHelpers.updateModifier(initAst,`${game.i18n.localize('SR5.SpiritType')}`, `${game.i18n.localize(lists.spiritTypes[data.type])}`, 1);
          SR5_EntityHelpers.updateModifier(initAst.dice,`${game.i18n.localize('SR5.SpiritType')}`, `${game.i18n.localize(lists.spiritTypes[data.type])}`, 3);
          break;
        default:
          SR5_EntityHelpers.updateModifier(initAst,`${game.i18n.localize('SR5.SpiritForce')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.force.value);
          SR5_EntityHelpers.updateModifier(initAst.dice,`${game.i18n.localize('SR5.SpiritType')}`, `${game.i18n.localize(lists.spiritTypes[data.type])}`, 3);
      }
    } else {
      SR5_EntityHelpers.updateModifier(initAst,`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
      SR5_EntityHelpers.updateModifier(initAst,`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
      SR5_EntityHelpers.updateModifier(initAst.dice,`${game.i18n.localize('SR5.AstralProjection')}`, `${game.i18n.localize('SR5.AstralPlane')}`, 3);
    }
    this.applyPenalty("condition", initAst, actor);
    this.applyPenalty("matrix", initAst, actor);
    this.applyPenalty("magic", initAst, actor);
    SR5_EntityHelpers.updateValue(initAst, 0);
    SR5_EntityHelpers.updateValue(initAst.dice, 0, 5);
    initAst.dice.value = Math.floor(initAst.dice.value);
  }

  // Generate matrix initiative
  static updateInitiativeMatrix(actor) {
    let data = actor.data, initiatives = data.initiatives, attributes = data.attributes, initMat = initiatives.matrixInit, 
        matrixAttributes = data.matrix.attributes, lists = actor.lists;
    initMat.base = 0;
    initMat.dice.base = 0;

    switch (actor.type){
      case "actorPc":
      case "actorGrunt":
        switch (data.matrix.userMode) {
          case "ar":
            initMat.modifiers = initMat.modifiers.concat(initiatives.physicalInit.modifiers);
            initMat.dice.base = 1;
            initMat.dice.modifiers = initMat.dice.modifiers.concat(initiatives.physicalInit.dice.modifiers);
            break;
          case "coldsim":
            SR5_EntityHelpers.updateModifier(initMat,`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
            SR5_EntityHelpers.updateModifier(initMat, data.matrix.deviceName, `${game.i18n.localize('SR5.Device')}`, matrixAttributes.dataProcessing.value);
            SR5_EntityHelpers.updateModifier(initMat.dice, game.i18n.localize('SR5.VirtualRealityColdSimShort'), game.i18n.localize('SR5.MatrixUserMode'), 3);
            break;
          case "hotsim":
            SR5_EntityHelpers.updateModifier(initMat,`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
            SR5_EntityHelpers.updateModifier(initMat, data.matrix.deviceName, `${game.i18n.localize('SR5.Device')}`, matrixAttributes.dataProcessing.value);
            SR5_EntityHelpers.updateModifier(initMat.dice, `${game.i18n.localize('SR5.VirtualRealityColdSimShort')}`, `${game.i18n.localize('SR5.MatrixUserMode')}`, 4);
            break;
          default:
            SR5_SystemHelpers.srLog(1, `Unknown matrix userMode '${data.matrix.userMode}' in 'updateInitiativeMatrix()'`);
        }
      break;
      case "actorSprite":
        SR5_EntityHelpers.updateModifier(initMat,`${game.i18n.localize('SR5.Level')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.level);
        SR5_EntityHelpers.updateModifier(initMat, `${game.i18n.localize('SR5.DataProcessing')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, matrixAttributes.dataProcessing.value);
        SR5_EntityHelpers.updateModifier(initMat.dice, `${game.i18n.localize(lists.spriteTypes[data.type])}`, `${game.i18n.localize('ACTOR.TypeActorsprite')}`, 4);
        break;
      case "actorAgent":
        SR5_EntityHelpers.updateModifier(initMat,`${game.i18n.localize('SR5.Rating')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.rating);
        SR5_EntityHelpers.updateModifier(initMat, `${game.i18n.localize('SR5.DataProcessing')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, matrixAttributes.dataProcessing.value);
        SR5_EntityHelpers.updateModifier(initMat.dice, `${game.i18n.localize(lists.spriteTypes[data.type])}`, `${game.i18n.localize('ACTOR.TypeActoragent')}`, 4);
        break;
      case "actorDevice":
      //case "actorDrone":
        SR5_EntityHelpers.updateModifier(initMat,`${game.i18n.localize('SR5.DeviceRating')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.matrix.deviceRating);
        SR5_EntityHelpers.updateModifier(initMat,`${game.i18n.localize('SR5.DataProcessing')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, matrixAttributes.dataProcessing.value);
        SR5_EntityHelpers.updateModifier(initMat.dice, `${game.i18n.localize(lists.deviceTypes[data.matrix.deviceType])}`, `${game.i18n.localize('ACTOR.TypeActordevice')}`, 4);
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown actor type '${actor.type}' in 'updateInitiativeMatrix()'`);
    }

    if (data.matrix.userMode !== "ar") this.applyPenalty("condition", initMat, actor);
    this.applyPenalty("matrix", initMat, actor);
    this.applyPenalty("magic", initMat, actor);
    SR5_EntityHelpers.updateValue(initMat, 0);
    SR5_EntityHelpers.updateValue(initMat.dice, 0, 5);
    initMat.dice.value = Math.floor(initMat.dice.value);
  }

  // Find Actor Active Initiative
  static findActiveInitiative(actor) {
    let data = actor.data, initiatives = data.initiatives;
    for (let [key, value] of Object.entries(initiatives)) {
      if (value.isActive) return key;
    }
    return false;
  }

  // Switch Actor To New Initiative
  static async switchToInitiative(entity, initiative) {
    let actor;
    if (entity.token) actor = entity.token.getActor();
    else actor = entity;

    let data = duplicate(actor.data.data),
        initiatives = data.initiatives,
        currentInitiative = this.findActiveInitiative(actor.data);
    
    if (currentInitiative) initiatives[currentInitiative].isActive = false;
    if (currentInitiative === "astralInit") data.visions.astral.isActive = false;
    initiatives[initiative].isActive = true;
    if (initiative === "astralInit") data.visions.astral.isActive = true;

    await actor.update({ 'data': data });

    //check if previous effect is on
    let previousInitiativeEffect = actor.data.effects.find(effect => effect.data.origin === "initiativeMode"); 
    //generate effect
    let initiativeEffect;
    if (initiative !== "physicalInit") initiativeEffect = SR5_CharacterUtility.generateInitiativeEffect(initiative);

    // if initiative is physical remove effect, else add or update active effect
    if (initiative === "physicalInit"){
      if(previousInitiativeEffect) await actor.deleteEmbeddedDocuments('ActiveEffect', [previousInitiativeEffect.id]);
    } else {
      if(previousInitiativeEffect) await previousInitiativeEffect.update(initiativeEffect);
      else actor.createEmbeddedDocuments('ActiveEffect', [initiativeEffect]);
    }
  }

  /**
  * @param {String} initiativeType - Initiative type (as per SR5.characterInitiatives)
  **/
  static generateInitiativeEffect(initiativeType){
    let initiativeIcon, initiativeLabel;
    switch(initiativeType){
      case "astralInit":
        initiativeLabel = game.i18n.localize('SR5.InitiativeAstral');
        initiativeIcon = 'systems/sr5/img/status/StatusInitAstalOn.svg';
        break;
      case "matrixInit":
        initiativeLabel = game.i18n.localize('SR5.InitiativeMatrix');
        initiativeIcon = 'systems/sr5/img/status/StatusInitMatrixOn.svg';
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown initiative mode '${initiative}' in 'switchToInitiative()'`);
    }

    let initiativeEffect = {
        label: initiativeLabel,
        origin: "initiativeMode",
        icon: initiativeIcon,
        flags: {
          core: {
              active: true,
              statusId: initiativeType
          }
        },
      }

    return initiativeEffect;
  }

  // Generate Actor defense
  static updateDefenses(actor) {
    let lists = actor.lists, data = actor.data, attributes = data.attributes, skills = data.skills, defenses = data.defenses;

    for (let key of Object.keys(lists.characterDefenses)) {
      if (defenses[key]) {
        defenses[key].base = 0;
        switch (key) {
          case "block":
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.reaction.augmented.value);
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.SkillUnarmedCombat')}`, `${game.i18n.localize('SR5.Skill')}`, skills.unarmedCombat.rating.value);
            break;
          case "defend":
            if (actor.type == "actorDrone") {
              let controlerData;
              if (data.vehicleOwner.id) controlerData = actor.flags.sr5.vehicleControler.data;
              switch (data.controlMode){
                case "autopilot":
                  SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.VehicleStat_PilotShort')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.pilot.augmented.value);
                  break;
                case "remote":
                case "manual":
                  SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.Controler')}`, controlerData.attributes.reaction.augmented.value);
                  SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.Controler')}`, controlerData.attributes.intuition.augmented.value);
                  break;
                case "rigging":
                  SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.Controler')}`, controlerData.attributes.reaction.augmented.value);
                  SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.Controler')}`, controlerData.attributes.intuition.augmented.value);
                  if (controlerData.specialProperties.controlRig.value) SR5_EntityHelpers.updateModifier(defenses[key], `${game.i18n.localize('SR5.ControlRig')}`, `${game.i18n.localize('SR5.Augmentation')}`, controlerData.specialProperties.controlRig.value);
                  if (controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(defenses[key], `${game.i18n.localize('SR5.VirtualRealityHotSimShort')}`, `${game.i18n.localize('SR5.MatrixUserMode')}`, 1);
                  break;
                default:
                  SR5_SystemHelpers.srLog(1, `Unknown controle mode '${data.controlMode}' in 'updateDefenses() for drone/vehicle'`);
              }
              
            } else {
              SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.reaction.augmented.value);
              SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
            }
            break;
          case "dodge":
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.reaction.augmented.value);
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.SkillGymnastics')}`, `${game.i18n.localize('SR5.Skill')}`, skills.gymnastics.rating.value);
            break;
          case "parryClubs":
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.reaction.augmented.value);
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.SkillClubs')}`, `${game.i18n.localize('SR5.Skill')}`, skills.clubs.rating.value);
            break;
          case "parryBlades":
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Reaction')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.reaction.augmented.value);
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
            SR5_EntityHelpers.updateModifier(defenses[key],`${game.i18n.localize('SR5.SkillBlades')}`, `${game.i18n.localize('SR5.Skill')}`, skills.blades.rating.value);
            break;
          default:
            SR5_SystemHelpers.srLog(1, `Unknown '${key}' defense in 'updateDefenses()'`);
        }
      this.applyPenalty("condition", defenses[key], actor);
      this.applyPenalty("matrix", defenses[key], actor);
      this.applyPenalty("magic", defenses[key], actor);
      this.applyPenalty("special", defenses[key], actor);
        SR5_EntityHelpers.updateDicePool(defenses[key], 0);
      }
    }
  }

  // Generate Actors Armor
  static updateArmor(actor) {
    let lists = actor.lists;
    SR5_EntityHelpers.updateValue(actor.data.itemsProperties.armor, 0);
    for (let key of Object.keys(lists.specialDamageTypes)){
      SR5_EntityHelpers.updateValue(actor.data.itemsProperties.armor.specialDamage[key], 0);
    }
  }
  // Generate Actors Resistances
  static updateResistances(actor) {
    let lists = actor.lists, data = actor.data, resistances = data.resistances, attributes = data.attributes;

    for (let key of Object.keys(lists.characterResistances)) {
      if (resistances[key]) {
        switch (key) {
          case "fatigue":
            resistances[key].base = 0;
            SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value);
            SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
            SR5_EntityHelpers.updateDicePool(resistances[key], 0);
            break;
          case "specialDamage":
            for (let specialDamage of Object.keys(lists.specialDamageTypes)) {
              if (actor.type == "actorDrone") {
                resistances[key][specialDamage].base = 0;
                SR5_EntityHelpers.updateModifier(resistances[key][specialDamage],`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value);
                SR5_EntityHelpers.updateModifier(resistances[key][specialDamage],`${game.i18n.localize('SR5.VehicleStat_ArmorShort')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.armor.augmented.value);
              } else {
                resistances[key][specialDamage].base = 0;
                SR5_EntityHelpers.updateModifier(resistances[key][specialDamage],`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value);
                if (data.itemsProperties) {
                  resistances.specialDamage[specialDamage].modifiers = resistances.specialDamage[specialDamage].modifiers.concat(data.itemsProperties.armor.modifiers);
                  resistances.specialDamage[specialDamage].modifiers = resistances.specialDamage[specialDamage].modifiers.concat(data.itemsProperties.armor.specialDamage[specialDamage].modifiers);
                }
              }
              SR5_EntityHelpers.updateDicePool(resistances[key][specialDamage], 0);
            }
            break;
          case "disease":
          case "toxin":
            for (let vector of Object.keys(lists.propagationVectors)) {
              resistances[key][vector].base = 0;
              SR5_EntityHelpers.updateModifier(resistances[key][vector],`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value);
              SR5_EntityHelpers.updateModifier(resistances[key][vector],`${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
              SR5_EntityHelpers.updateDicePool(resistances[key][vector], 0);
            }
            break;
          case "directSpellMana":
            resistances[key].base = 0;
            SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
            SR5_EntityHelpers.updateDicePool(resistances[key], 0);
            break;
          case "directSpellPhysical":
            if (actor.type == "actorDrone") {
              resistances[key].base = 0;
              SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value);
              SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.VehicleStat_ArmorShort')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.armor.augmented.value);
            } else {
              resistances[key].base = 0;
              SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value);
            }
            SR5_EntityHelpers.updateDicePool(resistances[key], 0);
            break;
          case "physicalDamage":
          case "fall":
            if (actor.type == "actorDrone") {
              resistances[key].base = 0;
              SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value);
              SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.VehicleStat_ArmorShort')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.armor.augmented.value);
            } else {
              resistances[key].base = 0;
              SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value);
            }
            if (data.itemsProperties) resistances[key].modifiers = resistances[key].modifiers.concat(data.itemsProperties.armor.modifiers);
            SR5_EntityHelpers.updateDicePool(resistances[key], 0);
            break;
          case "crashDamage":
            if (actor.type == "actorDrone"){
              resistances[key].base = 0;
              SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.Body')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.body.augmented.value);
              SR5_EntityHelpers.updateModifier(resistances[key],`${game.i18n.localize('SR5.VehicleStat_ArmorShort')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.armor.augmented.value);
              SR5_EntityHelpers.updateDicePool(resistances[key], 0);
            }
            break;
          default:
            SR5_SystemHelpers.srLog(1, `Unknown resistance '${key}' in 'updateResistances()'`);
        }
      }
    }
  }

  // // Generate Actors Limits
  static updateLimits(actor) {
    let lists = actor.lists, data = actor.data, limits = data.limits, attributes = data.attributes;

    for (let key of Object.keys(lists.characterLimits)) {
      switch (key) {
        case "astralLimit":
          if (limits[key]){
            limits[key].base = Math.max(
              Math.ceil((attributes.logic.augmented.value * 2 + attributes.intuition.augmented.value + attributes.willpower.augmented.value) / 3),
              Math.ceil((attributes.charisma.augmented.value * 2 + attributes.willpower.augmented.value + data.essence.value) / 3)
            );
          }
          break;
        case "mentalLimit":
          if (limits[key]){
            limits[key].base = Math.ceil((attributes.logic.augmented.value * 2 + attributes.intuition.augmented.value + attributes.willpower.augmented.value) / 3);
          }
          break;
        case "physicalLimit":
          if (limits[key]){
            limits[key].base = Math.ceil((attributes.strength.augmented.value * 2 + attributes.body.augmented.value + attributes.reaction.augmented.value) / 3);
          }
          break;
        case "socialLimit":
          if (limits[key]){
            limits[key].base = Math.ceil((attributes.charisma.augmented.value * 2 + attributes.willpower.augmented.value + data.essence.value) / 3);
          }
          break;
        default:
          SR5_SystemHelpers.srLog(1, `Unknown limit '${key}' in 'updateLimits()'`);
      }
      if (limits[key]) SR5_EntityHelpers.updateValue(limits[key], 0);
    }
  }

  // Vehicle Skills Calculations
  static generateVehicleSkills(actor) {
    let data = actor.data, skills = data.skills, attributes = data.attributes;
    let controlerData;
    if (data.vehicleOwner.id) {
      controlerData = actor.flags.sr5.vehicleControler.data;
    }

    skills.sneaking.rating.base = 0;
    skills.sneaking.limit.base = 0;
    skills.perception.rating.base = 0;
    skills.perception.limit.base = 0;

      switch (data.controlMode){
        case "autopilot":
          SR5_EntityHelpers.updateModifier(skills.sneaking.rating, game.i18n.localize('SR5.VehicleStat_PilotShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.pilot.augmented.value);
          SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.VehicleStat_HandlingShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.handling.augmented.value);
          SR5_EntityHelpers.updateModifier(skills.perception.rating, game.i18n.localize('SR5.VehicleStat_PilotShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.pilot.augmented.value);
          SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.VehicleStat_SensorShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.sensor.augmented.value);
          break;
        case "remote":
          SR5_EntityHelpers.updateModifier(skills.perception.test, game.i18n.localize('SR5.ControlMode'), game.i18n.localize('SR5.ControlMode'), controlerData.skills.perception.test.dicePool);
          SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.VehicleStat_SensorShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.sensor.augmented.value);
          if (controlerData.matrix.attributes.dataProcessing.value < attributes.sensor.augmented.value){
            let mod = controlerData.matrix.attributes.dataProcessing.value - attributes.sensor.augmented.value;
            SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.DataProcessingLimit'), game.i18n.localize('SR5.ControlMode'), mod);
          }
          //TODO : sneaking is equal to lesser value between pilotSkill and Sneaking(pilotSkill)
          if (data.pilotSkill){
            SR5_EntityHelpers.updateModifier(skills.sneaking.test, game.i18n.localize('SR5.Controler'), game.i18n.localize('SR5.ControlMode'), controlerData.skills[data.pilotSkill].test.dicePool);
          }
          SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.VehicleStat_HandlingShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.handling.augmented.value);
          if (controlerData.matrix.attributes.dataProcessing.value < attributes.handling.augmented.value){
            let mod = controlerData.matrix.attributes.dataProcessing.value - attributes.handling.augmented.value;
            SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.DataProcessingLimit'), game.i18n.localize('SR5.ControlMode'), mod);
          }
          break;
        case "manual":
          SR5_EntityHelpers.updateModifier(skills.perception.test, game.i18n.localize('SR5.Controler'), game.i18n.localize('SR5.ControlMode'), controlerData.skills.perception.test.dicePool);
          SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.VehicleStat_SensorShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.sensor.augmented.value);
          //TODO : sneaking is equal to lesser value between pilotSkill and Sneaking(pilotSkill)
          if (data.pilotSkill){
            SR5_EntityHelpers.updateModifier(skills.sneaking.test, game.i18n.localize('SR5.Controler'), game.i18n.localize('SR5.ControlMode'), controlerData.skills[data.pilotSkill].test.dicePool);
          }
          SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.VehicleStat_HandlingShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.handling.augmented.value);
          break;
        case "rigging":
          if (controlerData.specialProperties.controlRig.value) {
            SR5_EntityHelpers.updateModifier(skills.perception.test, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
            SR5_EntityHelpers.updateModifier(skills.sneaking.test, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
            SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
          }
          SR5_EntityHelpers.updateModifier(skills.perception.test, game.i18n.localize('SR5.Controler'), game.i18n.localize('SR5.ControlMode'), controlerData.skills.perception.test.dicePool);
          SR5_EntityHelpers.updateModifier(skills.perception.limit, game.i18n.localize('SR5.VehicleStat_SensorShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.sensor.augmented.value);
          //TODO : sneaking is equal to lesser value between pilotSkill and Sneaking(pilotSkill)
          if (data.pilotSkill){
            SR5_EntityHelpers.updateModifier(skills.sneaking.test, game.i18n.localize('SR5.Controler'), game.i18n.localize('SR5.ControlMode'), controlerData.skills[data.pilotSkill].test.dicePool);
          }
          SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.VehicleStat_HandlingShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.handling.augmented.value);
          SR5_EntityHelpers.updateModifier(skills.sneaking.limit, game.i18n.localize('SR5.ControlRigging'), game.i18n.localize('SR5.ControlMode'), 1);
          if (controlerData.matrix.userMode === "hotsim") {
            SR5_EntityHelpers.updateModifier(skills.perception.test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), game.i18n.localize('SR5.MatrixUserMode'), 1);
            SR5_EntityHelpers.updateModifier(skills.sneaking.test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), game.i18n.localize('SR5.MatrixUserMode'), 1);
          }
          break;
        default:
          SR5_SystemHelpers.srLog(1, `Unknown controle mode '${data.controlMode}' in 'generateVehicleSkills()'`);
    }

    //Update Values
    SR5_EntityHelpers.updateValue(skills.sneaking.rating, 0);
    SR5_EntityHelpers.updateValue(skills.perception.rating, 0);
    //Update DicePools
    skills.sneaking.test.base = 0;
    skills.sneaking.test.modifiers = skills.sneaking.test.modifiers.concat(skills.sneaking.rating.modifiers);
    skills.perception.test.base = 0;
    skills.perception.test.modifiers = skills.perception.test.modifiers.concat(skills.perception.rating.modifiers);
    SR5_EntityHelpers.updateDicePool(skills.sneaking.test, 0);
    SR5_EntityHelpers.updateDicePool(skills.perception.test, 0);
    //Update Limits
    SR5_EntityHelpers.updateValue(skills.sneaking.limit, 0);
    SR5_EntityHelpers.updateValue(skills.perception.limit, 0);
  }

  //
  static generateVehicleTest(actor){
    let data = actor.data, vehicleTest = data.vehicleTest, attributes = data.attributes, lists = actor.lists;
    vehicleTest.limit.base = attributes.handling.augmented.value;
    vehicleTest.test.base = 0;
    let controlerData;
    if (data.vehicleOwner.id) controlerData = actor.flags.sr5.vehicleControler.data;

    switch (data.controlMode){
      case "autopilot":
        SR5_EntityHelpers.updateModifier(vehicleTest.test, game.i18n.localize('SR5.VehicleStat_PilotShort'), game.i18n.localize('SR5.LinkedAttribute'), attributes.pilot.augmented.value);
        break;
      case "remote":
        if (data.pilotSkill) SR5_EntityHelpers.updateModifier(vehicleTest.test, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize(lists.pilotSkills[data.pilotSkill])})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills[data.pilotSkill].test.dicePool);
        if (controlerData.matrix.userMode === "ar") SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.AugmentedReality'), game.i18n.localize('SR5.MatrixUserMode'), 1);
        else if (controlerData.matrix.userMode === "coldsim" || controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.VirtualReality'), game.i18n.localize('SR5.MatrixUserMode'), 2);
        break;
      case "manual":
        if (data.pilotSkill) SR5_EntityHelpers.updateModifier(vehicleTest.test, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize(lists.pilotSkills[data.pilotSkill])})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills[data.pilotSkill].test.dicePool);
        if (controlerData.matrix.userMode === "ar") SR5_EntityHelpers.updateModifier(vehicleTest.limit,  game.i18n.localize('SR5.AugmentedReality'), game.i18n.localize('SR5.MatrixUserMode'), 1);
        else if (controlerData.matrix.userMode === "coldsim" || controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.VirtualReality'), game.i18n.localize('SR5.MatrixUserMode'), 2);
        break;
      case "rigging":
        if (data.pilotSkill) SR5_EntityHelpers.updateModifier(vehicleTest.test, `${game.i18n.localize('SR5.Controler')} (${game.i18n.localize(lists.pilotSkills[data.pilotSkill])})`, game.i18n.localize('SR5.ControlMode'), controlerData.skills[data.pilotSkill].test.dicePool);
        SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.ControlRigging'), game.i18n.localize('SR5.ControlMode'), 3);
        if (controlerData.specialProperties.controlRig.value){
          SR5_EntityHelpers.updateModifier(vehicleTest.test, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
          SR5_EntityHelpers.updateModifier(vehicleTest.limit, game.i18n.localize('SR5.ControlRig'), game.i18n.localize('SR5.Augmentation'), controlerData.specialProperties.controlRig.value);
        }
        if (controlerData.matrix.userMode === "hotsim") SR5_EntityHelpers.updateModifier(vehicleTest.test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), game.i18n.localize('SR5.MatrixUserMode'), 1);
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown controle mode '${data.controlMode}' in 'generateVehicleTest()'`);
    }

    //update vehicle Actions Value
    SR5_EntityHelpers.updateDicePool(vehicleTest.test, 0);
    SR5_EntityHelpers.updateValue(vehicleTest.limit, 0);
  }

  // Spirit Skills Calculations
  static generateSpiritSkills(actor) {
    let lists = actor.lists, data = actor.data, skills = data.skills;

    skills.astralCombat.rating.base = data.force.value;
    skills.assensing.rating.base = data.force.value;
    skills.perception.rating.base = data.force.value;
    data.magic.tradition = actor.data.magic.tradition;

    switch (data.type) {
      case "homunculus":
        skills.unarmedCombat.rating.base = data.force.value;
        break;
      case "air":
      case "noxious":
        skills.exoticRangedWeapon.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        skills.running.rating.base = data.force.value;
        skills.flight.rating.base = data.force.value;
        break;
      case "water":
        skills.exoticRangedWeapon.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        skills.swimming.rating.base = data.force.value;
        break;
      case "man":
        skills.unarmedCombat.rating.base = data.force.value;
        skills.running.rating.base = data.force.value;
        skills.spellcasting.rating.base = data.force.value;
        skills.swimming.rating.base = data.force.value;
        break;
      case "earth":
      case "sludge":
      case "barren":
        skills.exoticRangedWeapon.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        break;
      case "fire":
      case "nuclear":
        skills.exoticRangedWeapon.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        skills.flight.rating.base = data.force.value;
        break;
      case "beasts":
      case "blood":
        skills.unarmedCombat.rating.base = data.force.value;
        skills.running.rating.base = data.force.value;
        break;
      case "abomination":
        skills.exoticRangedWeapon.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        skills.running.rating.base = data.force.value;
        skills.gymnastics.rating.base = data.force.value;
        break;
      case "plague":
        skills.unarmedCombat.rating.base = data.force.value;
        skills.spellcasting.rating.base = data.force.value;
        break;
      case "shadowMuse":
      case "shadowNightmare":
      case "shadowShade":
      case "shadowSuccubus":
      case "shadowWraith":
        skills.unarmedCombat.rating.base = data.force.value;
        skills.con.rating.base = data.force.value;
        skills.gymnastics.rating.base = data.force.value;
        skills.intimidation.rating.base = data.force.value;
        break;
      case "shedim":
        skills.unarmedCombat.rating.base = data.force.value;
        break;
      case "shedimMaster":
        skills.unarmedCombat.rating.base = data.force.value;
        skills.counterspelling.rating.base = data.force.value;
        skills.gymnastics.rating.base = data.force.value;
        skills.spellcasting.rating.base = data.force.value;
        break;
      case "insectScout":
        skills.unarmedCombat.rating.base = data.force.value;
        skills.sneaking.rating.base = data.force.value;
        skills.gymnastics.rating.base = data.force.value;
        break;
      case "insectCaretaker":
        skills.unarmedCombat.rating.base = data.force.value;
        skills.spellcasting.rating.base = data.force.value;
        skills.leadership.rating.base = data.force.value;
        break;
      case "insectNymph":
        skills.unarmedCombat.rating.base = data.force.value;
        skills.gymnastics.rating.base = data.force.value;
        skills.spellcasting.rating.base = data.force.value;
        break;
      case "insectWorker":
        skills.unarmedCombat.rating.base = data.force.value;
        break;
      case "insectSoldier":
        skills.exoticRangedWeapon.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        skills.counterspelling.rating.base = data.force.value;
        skills.gymnastics.rating.base = data.force.value;
        break;
      case "insectQueen":
        skills.unarmedCombat.rating.base = data.force.value;
        skills.counterspelling.rating.base = data.force.value;
        skills.con.rating.base = data.force.value;
        skills.gymnastics.rating.base = data.force.value;
        skills.spellcasting.rating.base = data.force.value;
        skills.leadership.rating.base = data.force.value;
        skills.negociation.rating.base = data.force.value;
        break;
      case "guardian":
        skills.exoticRangedWeapon.rating.base = data.force.value;
        skills.clubs.rating.base = data.force.value;
        skills.blades.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        break;
      case "guidance":
        skills.arcana.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        skills.counterspelling.rating.base = data.force.value;
        break;
      case "plant":
        skills.exoticRangedWeapon.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        skills.counterspelling.rating.base = data.force.value;
        break;
      case "task":
        skills.artisan.rating.base = data.force.value;
        skills.unarmedCombat.rating.base = data.force.value;
        break;
    }

    for (let key of Object.keys(lists.skills)) {
      if (skills[key] && skills[key].rating.base) {
        SR5_EntityHelpers.updateValue(skills[key].rating, 0);
        if (skills[key].rating.value) {
          skills[key].test.base = skills[key].rating.value;
          this.applyPenalty("condition", skills[key].test, actor);
          this.applyPenalty("matrix", skills[key].test, actor);
          this.applyPenalty("magic", skills[key].test, actor);
          this.applyPenalty("special", skills[key].test, actor);
          SR5_EntityHelpers.updateDicePool(skills[key].test, 0);
        }
      }
    }
  }

  // Sprite Skills Calculations
  static generateSpriteSkills(actor) {
    let lists = actor.lists, data = actor.data, skills = data.skills;

    switch (data.type) {
      case "courier":
        skills.computer.rating.base = data.level;
        skills.hacking.rating.base = data.level;
        break;
      case "crack":
        skills.computer.rating.base = data.level;
        skills.hacking.rating.base = data.level;
        skills.electronicWarfare.rating.base = data.level;
        break;
      case "data":
        skills.computer.rating.base = data.level;
        skills.electronicWarfare.rating.base = data.level;
        break;
      case "fault":
        skills.computer.rating.base = data.level;
        skills.cybercombat.rating.base = data.level;
        skills.hacking.rating.base = data.level;
        break;
      case "machine":
        skills.computer.rating.base = data.level;
        skills.electronicWarfare.rating.base = data.level;
        skills.hardware.rating.base = data.level;
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${data.type}' sprite type in '_generateSpriteSkills()'`);
        return;
    }

    for (let key of Object.keys(lists.skills)) {
      if (skills[key] && skills[key].rating.base) {
        SR5_EntityHelpers.updateValue(skills[key].rating, 0);
        if (skills[key].rating.value) {
          skills[key].test.base = skills[key].rating.value;
          SR5_EntityHelpers.updateDicePool(skills[key].test, 0);
        }
      }
    }
  }

  // Skills and Skill Groups Calculations
  static updateSkills(actor) {
    let lists = actor.lists, data = actor.data;

    for (let skillGroup of Object.keys(lists.skillGroups)) {
      if (data.skillGroups){
        SR5_EntityHelpers.updateValue(data.skillGroups[skillGroup], 0);
      }
    }

    for (let key of Object.keys(lists.skills)) {
      if (data.skills[key]) {
        if (data.skills[key].skillGroup) {
          let linkedGroup = data.skills[key].skillGroup;
          if (data.skillGroups[linkedGroup].value) {
            if (data.skills[key].base === 0) {
              SR5_EntityHelpers.updateModifier(data.skills[key].rating, `${game.i18n.localize(lists.skillGroups[linkedGroup])}`, `${game.i18n.localize('SR5.SkillGroup')}`, data.skillGroups[linkedGroup].value);
            } else if (data.skillGroups[linkedGroup].value > data.skills[key].rating.base){
              let mod = data.skillGroups[linkedGroup].value - data.skills[key].rating.base;
              SR5_EntityHelpers.updateModifier(data.skills[key].rating, `${game.i18n.localize(lists.skillGroups[linkedGroup])}`, `${game.i18n.localize('SR5.SkillGroup')}`, mod);
            }
          }
        }
        let linkedAttribute = data.skills[key].linkedAttribute;
        if (linkedAttribute == 'magic' || linkedAttribute == 'resonance' || linkedAttribute == 'edge') {
          let label = `${game.i18n.localize(lists.characterSpecialAttributes[linkedAttribute])}`;
          SR5_EntityHelpers.updateModifier(data.skills[key].test, label, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.specialAttributes[linkedAttribute].augmented.value);
        } else {
          let label = `${game.i18n.localize(lists.characterAttributes[linkedAttribute])}`;
          SR5_EntityHelpers.updateModifier(data.skills[key].test, label, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.attributes[linkedAttribute].augmented.value);
        }
        SR5_EntityHelpers.updateValue(data.skills[key].rating, 0);
        if (data.skills[key].rating.value) {
          data.skills[key].test.base = data.skills[key].rating.base;
          data.skills[key].test.modifiers = data.skills[key].test.modifiers.concat(data.skills[key].rating.modifiers);
          //data.skills[key].rating.value;
        } else {
          if (data.skills[key].canDefault) {
            data.skills[key].test.base = 0;
            SR5_EntityHelpers.updateModifier(data.skills[key].test, game.i18n.localize('SR5.Defaulting'), game.i18n.localize('SR5.Skill'), -1);
          } else {
            data.skills[key].test.modifiers = [];
          }
        }
        this.applyPenalty("condition", data.skills[key].test, actor);
        this.applyPenalty("matrix", data.skills[key].test, actor);
        this.applyPenalty("magic", data.skills[key].test, actor);
        this.applyPenalty("special", data.skills[key].test, actor);
        SR5_EntityHelpers.updateDicePool(data.skills[key].test, 0);

        // limit calculation
        let linkedLimit = data.skills[key].limit.base;
        if (data.limits[linkedLimit]) {
          data.skills[key].limit.value = data.limits[linkedLimit].value + SR5_EntityHelpers.modifiersSum(data.skills[key].limit.modifiers);
        }
      }
    }

    if (actor.type !== "actorSprite"){
      for (let key of Object.keys(lists.spellCategories)) {
        if (data.skills.spellcasting.rating.value > 0) {
          data.skills.spellcasting.spellCategory[key].base = data.skills.spellcasting.rating.base;
          data.skills.spellcasting.spellCategory[key].modifiers = data.skills.spellcasting.spellCategory[key].modifiers.concat(data.skills.spellcasting.test.modifiers);
        }
        if (data.skills.counterspelling.rating.value > 0) {
          data.skills.counterspelling.spellCategory[key].base = data.skills.counterspelling.rating.base;
          data.skills.counterspelling.spellCategory[key].modifiers = data.skills.counterspelling.spellCategory[key].modifiers.concat(data.skills.counterspelling.test.modifiers);
        }
        if (data.skills.ritualSpellcasting.rating.value > 0) {
          data.skills.ritualSpellcasting.spellCategory[key].base = data.skills.ritualSpellcasting.rating.base;
          data.skills.ritualSpellcasting.spellCategory[key].modifiers = data.skills.ritualSpellcasting.spellCategory[key].modifiers.concat(data.skills.ritualSpellcasting.test.modifiers);
        }
        if (data.skills.alchemy.rating.value > 0) {
          data.skills.alchemy.spellCategory[key].base = data.skills.alchemy.rating.base;
          data.skills.alchemy.spellCategory[key].modifiers = data.skills.alchemy.spellCategory[key].modifiers.concat(data.skills.alchemy.test.modifiers);
        }
        SR5_EntityHelpers.updateDicePool(data.skills.spellcasting.spellCategory[key], 0);
        SR5_EntityHelpers.updateDicePool(data.skills.counterspelling.spellCategory[key], 0);
        SR5_EntityHelpers.updateDicePool(data.skills.ritualSpellcasting.spellCategory[key], 0);
        SR5_EntityHelpers.updateDicePool(data.skills.alchemy.spellCategory[key], 0);
      }

      for (let key of Object.keys(lists.spiritTypes)) {
        data.skills.summoning.spiritType[key].base = data.skills.summoning.test.dicePool;
        data.skills.binding.spiritType[key].base = data.skills.binding.test.dicePool;
        data.skills.banishing.spiritType[key].base = data.skills.banishing.test.dicePool;
        SR5_EntityHelpers.updateDicePool(data.skills.summoning.spiritType[key], 0);
        SR5_EntityHelpers.updateDicePool(data.skills.binding.spiritType[key], 0);
        SR5_EntityHelpers.updateDicePool(data.skills.banishing.spiritType[key], 0);
      }

      for (let key of Object.keys(lists.perceptionTypes)){
        SR5_EntityHelpers.updateValue(data.skills.perception.perceptionType[key].test, 0);
        SR5_EntityHelpers.updateValue(data.skills.perception.perceptionType[key].limit, 0);
      }
    }
  }

  // Knowledge Dice Pools Calculations
  static _generateKnowledgeSkills(knowledge, actor) {
    let lists = actor.lists, data = actor.data, attributes = data.attributes;    
    switch (knowledge.type) {
      case "academic":
      case "professional":
        knowledge.linkedAttribute = "logic";
        break;
      case "interests":
      case "street":
      case "tactics":
        knowledge.linkedAttribute = "intuition";
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${knowledge.type}' knowledge type in '_generateKnowledgeSkills()'`);
        return;
    }

    let label = `${game.i18n.localize(lists.characterAttributes[knowledge.linkedAttribute])}`;
    SR5_EntityHelpers.updateModifier(knowledge, label, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes[knowledge.linkedAttribute].augmented.value);
    this.applyPenalty("condition", knowledge, actor);
    this.applyPenalty("matrix", knowledge, actor);
    this.applyPenalty("magic", knowledge, actor);
    this.applyPenalty("special", knowledge, actor);
    SR5_EntityHelpers.updateValue(knowledge);
  }

  // Language Skills Calculations
  static _generateLanguageSkills(language, actor) {
    let attributes = actor.data.attributes;

    if (!language.isNative) {
      SR5_EntityHelpers.updateModifier(language, `${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
      this.applyPenalty("condition", language, actor);
      this.applyPenalty("matrix", language, actor);
      this.applyPenalty("magic", language, actor);
      this.applyPenalty("special", language, actor);
      SR5_EntityHelpers.updateValue(language, 0);
    }
  }

  // Magical Traditions Calculations
  static updateTradition(actor) {
    let data = actor.data, lists = actor.lists, magic = data.magic, specialAttributes = data.specialAttributes;

    if (!magic.magicType) {
      SR5_SystemHelpers.srLog(3, `Actor has no magic type selected or no magic capabilities for ${this.name}`);
      return;
    }

    switch (magic.magicType) {
      case "adept":
        magic.tradition = "";
        magic.drainResistance.linkedAttribute = "body";
        for (let category of Object.keys(lists.spellCategories)) {
          magic.elements[category] = "";
        }
        magic.powerPoints.base = 0;
        SR5_EntityHelpers.updateValue(magic.powerPoints);
        magic.powerPoints.maximum.base = specialAttributes.magic.augmented.value;
        SR5_EntityHelpers.updateValue(magic.powerPoints.maximum);
        magic.isPossessed = false;
        break;
      case "mysticalAdept":
      case "magician":
      case "aspectedMagician":
        if (magic.magicType == "mysticalAdept") {
        magic.powerPoints.base = 0;
        SR5_EntityHelpers.updateValue(magic.powerPoints);
        magic.powerPoints.maximum.base = 0;
        SR5_EntityHelpers.updateValue(magic.powerPoints.maximum);
        }
        switch (magic.tradition) {
          case "aztec":
            magic.drainResistance.linkedAttribute = "charisma";
            magic.elements.combat = "guardian";
            magic.elements.detection = "fire";
            magic.elements.illusion = "water";
            magic.elements.manipulation = "beasts";
            magic.elements.health = "plant";
            magic.isPossessed = false;
            break;
          case "buddhism":
            magic.drainResistance.linkedAttribute = "intuition";
            magic.elements.combat = "air";
            magic.elements.detection = "guidance";
            magic.elements.illusion = "fire";
            magic.elements.manipulation = "water";
            magic.elements.health = "earth";
            magic.isPossessed = false;
            break;
          case "qabbalism":
            magic.drainResistance.linkedAttribute = "logic";
            magic.elements.combat = "air";
            magic.elements.detection = "earth";
            magic.elements.illusion = "water";
            magic.elements.manipulation = "task";
            magic.elements.health = "fire";
            magic.isPossessed = true;
            break;
          case "chamanism":
            magic.drainResistance.linkedAttribute = "charisma";
            magic.elements.combat = "beasts";
            magic.elements.detection = "water";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "man";
            magic.elements.health = "earth";
            magic.isPossessed = false;
            break;
          case "druid":
            magic.drainResistance.linkedAttribute = "intuition";
            magic.elements.combat = "beasts";
            magic.elements.detection = "water";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "earth";
            magic.elements.health = "plant";
            magic.isPossessed = false;
            break;
          case "hermeticism":
            magic.drainResistance.linkedAttribute = "logic";
            magic.elements.combat = "fire";
            magic.elements.detection = "air";
            magic.elements.illusion = "water";
            magic.elements.manipulation = "earth";
            magic.elements.health = "man";
            magic.isPossessed = false;
            break;
          case "hinduism":
            magic.drainResistance.linkedAttribute = "logic";
            magic.elements.combat = "beasts";
            magic.elements.detection = "water";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "earth";
            magic.elements.health = "plant";
            magic.isPossessed = false;
            break;
          case "islam":
            magic.drainResistance.linkedAttribute = "logic";
            magic.elements.combat = "guardian";
            magic.elements.detection = "earth";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "fire";
            magic.elements.health = "plant";
            magic.isPossessed = false;
            break;
          case "chaosMagic":
            magic.drainResistance.linkedAttribute = "intuition";
            magic.elements.combat = "fire";
            magic.elements.detection = "air";
            magic.elements.illusion = "man";
            magic.elements.manipulation = "water";
            magic.elements.health = "earth";
            magic.isPossessed = false;
            break;
          case "blackMagic":
            magic.drainResistance.linkedAttribute = "charisma";
            magic.elements.combat = "fire";
            magic.elements.detection = "water";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "man";
            magic.elements.health = "earth";
            magic.isPossessed = false;
            break;
          case "shinto":
            magic.drainResistance.linkedAttribute = "charisma";
            magic.elements.combat = "air";
            magic.elements.detection = "water";
            magic.elements.illusion = "beasts";
            magic.elements.manipulation = "man";
            magic.elements.health = "plant";
            magic.isPossessed = false;
            break;
          case "christianTheurgy":
            magic.drainResistance.linkedAttribute = "charisma";
            magic.elements.combat = "fire";
            magic.elements.detection = "water";
            magic.elements.illusion = "earth";
            magic.elements.manipulation = "guidance";
            magic.elements.health = "air";
            magic.isPossessed = false;
            break;
          case "sioux":
            magic.drainResistance.linkedAttribute = "intuition";
            magic.elements.combat = "beasts";
            magic.elements.detection = "plant";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "guardian";
            magic.elements.health = "fire";
            magic.isPossessed = false;
            break;
          case "vodou":
            magic.drainResistance.linkedAttribute = "charisma";
            magic.elements.combat = "guardian";
            magic.elements.detection = "water";
            magic.elements.illusion = "guidance";
            magic.elements.manipulation = "task";
            magic.elements.health = "man";
            magic.isPossessed = true;
            break;
          case "pathOfTheWheel":
            magic.drainResistance.linkedAttribute = "charisma";
            magic.elements.combat = "earth";
            magic.elements.detection = "guidance";
            magic.elements.illusion = "water";
            magic.elements.manipulation = "fire";
            magic.elements.health = "air";
            magic.isPossessed = false;
            break;
          case "wicca":
            magic.drainResistance.linkedAttribute = "intuition";
            magic.elements.combat = "fire";
            magic.elements.detection = "water";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "earth";
            magic.elements.health = "plant";
            magic.isPossessed = false;
            break;
          case "wiccaGardnerian":
            magic.drainResistance.linkedAttribute = "logic";
            magic.elements.combat = "fire";
            magic.elements.detection = "water";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "earth";
            magic.elements.health = "plant";
            magic.isPossessed = false;
            break;
          case "wuxing":
            magic.drainResistance.linkedAttribute = "logic";
            magic.elements.combat = "fire";
            magic.elements.detection = "earth";
            magic.elements.illusion = "water";
            magic.elements.manipulation = "guidance";
            magic.elements.health = "plant";
            magic.isPossessed = false;
            break;
          case "zoroastrianism":
            magic.drainResistance.linkedAttribute = "logic";
            magic.elements.combat = "man";
            magic.elements.detection = "water";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "plant";
            magic.elements.health = "fire";
            magic.isPossessed = false;
            break;
          case "norse":
            magic.drainResistance.linkedAttribute = "charisma";
            magic.elements.combat = "guardian";
            magic.elements.detection = "earth";
            magic.elements.illusion = "air";
            magic.elements.manipulation = "fire";
            magic.elements.health = "plant";
            magic.isPossessed = false;
            break;
          case "cosmic":
              magic.drainResistance.linkedAttribute = "logic";
              magic.elements.combat = "earth";
              magic.elements.detection = "guidance";
              magic.elements.illusion = "air";
              magic.elements.manipulation = "fire";
              magic.elements.health = "water";
              magic.isPossessed = false;
              break;
            case "elderGod":
              magic.drainResistance.linkedAttribute = "intuition";
              magic.elements.combat = "task";
              magic.elements.detection = "guardian";
              magic.elements.illusion = "fire";
              magic.elements.manipulation = "water";
              magic.elements.health = "earth";
              magic.isPossessed = false;
              break;
            case "greenMagic":
              magic.drainResistance.linkedAttribute = "charisma";
              magic.elements.combat = "plant";
              magic.elements.detection = "earth";
              magic.elements.illusion = "air";
              magic.elements.manipulation = "fire";
              magic.elements.health = "water";
              magic.isPossessed = false;
              break;
            case "missionists":
              magic.drainResistance.linkedAttribute = "charisma";
              magic.elements.combat = "man";
              magic.elements.detection = "air";
              magic.elements.illusion = "fire";
              magic.elements.manipulation = "earth";
              magic.elements.health = "water";
              magic.isPossessed = false;
              break;
            case "necroMagic":
              magic.drainResistance.linkedAttribute = "logic";
              magic.elements.combat = "man";
              magic.elements.detection = "beasts";
              magic.elements.illusion = "earth";
              magic.elements.manipulation = "fire";
              magic.elements.health = "plant";
              magic.isPossessed = false;
              break;
            case "olympianism":
              magic.drainResistance.linkedAttribute = "logic";
              magic.elements.combat = "guardian";
              magic.elements.detection = "air";
              magic.elements.illusion = "water";
              magic.elements.manipulation = "fire";
              magic.elements.health = "earth";
              magic.isPossessed = false;
              break;
            case "planarMagic":
              magic.drainResistance.linkedAttribute = "logic";
              magic.elements.combat = "guardian";
              magic.elements.detection = "guidance";
              magic.elements.illusion = "air";
              magic.elements.manipulation = "task";
              magic.elements.health = "water";
              magic.isPossessed = false;
              break;
            case "redMagic":
              magic.drainResistance.linkedAttribute = "intuition";
              magic.elements.combat = "beasts";
              magic.elements.detection = "air";
              magic.elements.illusion = "earth";
              magic.elements.manipulation = "man";
              magic.elements.health = "water";
              magic.isPossessed = false;
              break;
            case "romani":
              magic.drainResistance.linkedAttribute = "willpower";
              magic.elements.combat = "fire";
              magic.elements.detection = "air";
              magic.elements.illusion = "water";
              magic.elements.manipulation = "earth";
              magic.elements.health = "plant";
              magic.isPossessed = false;
              break;
            case "tarot":
              magic.drainResistance.linkedAttribute = "logic";
              magic.elements.combat = "air";
              magic.elements.detection = "fire";
              magic.elements.illusion = "man";
              magic.elements.manipulation = "earth";
              magic.elements.health = "water";
              magic.isPossessed = false;
              break;
          default:
            magic.drainResistance.linkedAttribute = null;
            magic.elements.combat = null;
            magic.elements.detection = null;
            magic.elements.illusion = null;
            magic.elements.manipulation = null;
            magic.elements.health = null;
            magic.isPossessed = false;
            break;
        }
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${magic.magicType}' magic type in updateTradition()`);
    }
  }

  // Magic and Astral Calculations
  static updateAstralValues(actor) {
    let items = actor.items, data = actor.data, lists = actor.lists, magic = data.magic, attributes = data.attributes, specialAttributes = data.specialAttributes, skills = data.skills;

    if (!magic.magicType) {
      SR5_SystemHelpers.srLog(3, `Actor has no magic type selected or no magic capabilities for ${this.name}`);
      return;
    }
    if (magic.magicType == 'adept' || magic.magicType == 'mysticalAdept') {
      if (items) {
        for (let item of Object.values(items)) {
          if (item.type === 'itemAdeptPower' && item.data.powerPointsCost.value) {
            let label = `${item.name} (${game.i18n.localize(lists.itemTypes[item.type])})`;
            SR5_EntityHelpers.updateModifier(magic.powerPoints, label, `itemAdeptPower_${item.id}`, item.data.powerPointsCost.value);
            SR5_EntityHelpers.updateValue(magic.powerPoints);
          }
        }
      }
    }

    if (magic.magicType == 'magician' || magic.magicType == 'aspectedMagician' || magic.magicType == 'mysticalAdept') {
      magic.passThroughBarrier.base = 0;
      SR5_EntityHelpers.updateModifier(magic.passThroughBarrier, `${game.i18n.localize('SR5.Charisma')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.charisma.augmented.value);
      SR5_EntityHelpers.updateModifier(magic.passThroughBarrier, `${game.i18n.localize('SR5.Magic')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, specialAttributes.magic.augmented.value);
      magic.astralDefense.base = 0;
      SR5_EntityHelpers.updateModifier(magic.astralDefense, `${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
      SR5_EntityHelpers.updateModifier(magic.astralDefense, `${game.i18n.localize('SR5.Logic')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.logic.augmented.value);
    }
    this.applyPenalty("condition", magic.passThroughBarrier, actor);
    this.applyPenalty("matrix", magic.passThroughBarrier, actor);
    this.applyPenalty("magic", magic.passThroughBarrier, actor);
    this.applyPenalty("special", magic.passThroughBarrier, actor);
    SR5_EntityHelpers.updateDicePool(magic.passThroughBarrier, 0);
    this.applyPenalty("condition", magic.astralDefense, actor);
    this.applyPenalty("matrix", magic.astralDefense, actor);
    this.applyPenalty("magic", magic.astralDefense, actor);
    this.applyPenalty("special", magic.astralDefense, actor);
    SR5_EntityHelpers.updateDicePool(magic.astralDefense, 0);

    magic.drainResistance.base = 0;
    SR5_EntityHelpers.updateModifier(magic.drainResistance, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
    if (magic.drainResistance.linkedAttribute) {
      let label = `${game.i18n.localize(lists.characterAttributes[magic.drainResistance.linkedAttribute])}`;
      SR5_EntityHelpers.updateModifier(magic.drainResistance, label, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes[magic.drainResistance.linkedAttribute].augmented.value);
    }
    SR5_EntityHelpers.updateDicePool(magic.drainResistance, 0);

    magic.astralDamage.base = 0;
    
    if ((actor.type === "actorPc") || (actor.type === "actorGrunt")) SR5_EntityHelpers.updateModifier(magic.astralDamage, `${game.i18n.localize('SR5.Charisma')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.charisma.augmented.value);
    if (actor.type === "actorSpirit"){
      if ((data.type === "homunculus") || (data.type === "watcher")){
        SR5_EntityHelpers.updateModifier(magic.astralDamage, `${game.i18n.localize(lists.spiritTypes[spiritType])}`, `${game.i18n.localize('ACTOR.TypeActorspirit')}`, 1);
      } else {
        SR5_EntityHelpers.updateModifier(magic.astralDamage, `${game.i18n.localize('SR5.SpiritForceShort')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, data.force.value);
      }
    }
    SR5_EntityHelpers.updateValue(magic.astralDamage, 0);

    magic.astralTracking.base = 0;
    SR5_EntityHelpers.updateModifier(magic.astralTracking, `${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.intuition.augmented.value);
    if (skills.assensing.rating.value) {
      SR5_EntityHelpers.updateModifier(magic.astralTracking, `${game.i18n.localize('SR5.SkillAssensing')}`, `${game.i18n.localize('SR5.Skill')}`, skills.assensing.rating.value);
    }
    this.applyPenalty("condition", magic.astralTracking, actor);
    this.applyPenalty("matrix", magic.astralTracking, actor);
    this.applyPenalty("magic", magic.astralTracking, actor);
    this.applyPenalty("special", magic.astralTracking, actor);
    SR5_EntityHelpers.updateDicePool(magic.astralTracking, 0);

  }

  // Generate Matrix attributes
  static generateMatrixAttributes(deck, actor) {
    let lists = actor.lists, data = actor.data, attributes = data.attributes;
    let matrix = data.matrix, matrixAttributes = matrix.attributes;
    
    matrix.deviceType = deck.data.type;
    matrix.deviceName = deck.name;

    switch (deck.data.type) {
      case "cyberdeck":
        matrix.attributesCollection.value1 = deck.data.attributesCollection.value1;
        matrix.attributesCollection.value2 = deck.data.attributesCollection.value2;
        matrix.attributesCollection.value3 = deck.data.attributesCollection.value3;
        matrix.attributesCollection.value4 = deck.data.attributesCollection.value4;
        matrix.programsMaximumActive.base = 0;
        SR5_EntityHelpers.updateModifier(matrix.programsMaximumActive, deck.name, `${game.i18n.localize('SR5.Device')}`, deck.data.program.max, false, false);
        matrix.deviceRating = deck.data.deviceRating;
        break;
      case "riggerCommandConsole":
        matrix.attributes.attack.base = 0;
        matrix.attributes.sleaze.base = 0;
        matrix.attributes.dataProcessing.base = deck.data.attributesCollection.value3;
        matrix.attributes.firewall.base = deck.data.attributesCollection.value4;
        matrix.programsMaximumActive.base = 0;
        SR5_EntityHelpers.updateModifier(matrix.programsMaximumActive, deck.name, `${game.i18n.localize('SR5.DeviceRating')}`, deck.data.deviceRating, false, false);
        matrix.deviceRating = deck.data.deviceRating;
        break;
      case "commlink":
        matrix.attributes.attack.base = 0;
        matrix.attributes.sleaze.base = 0;
        matrix.attributes.dataProcessing.base = deck.data.deviceRating;
        matrix.attributes.firewall.base = deck.data.deviceRating;
        matrix.programsMaximumActive.base = 0;
        SR5_EntityHelpers.updateModifier(matrix.programsMaximumActive, deck.name, `${game.i18n.localize('SR5.DeviceRating')}`, deck.data.deviceRating, false, false);
        matrix.deviceRating = deck.data.deviceRating;
        break;
      case "livingPersona":
        matrix.attributes.attack.base = attributes.charisma.augmented.value;
        matrix.attributes.sleaze.base = attributes.intuition.augmented.value;
        matrix.attributes.dataProcessing.base = attributes.logic.augmented.value;
        matrix.attributes.firewall.base = attributes.willpower.augmented.value;
        matrix.deviceRating = data.specialAttributes.resonance.augmented.value;
        break;
      case "headcase":
        matrix.attributes.attack.base = attributes.charisma.augmented.value + data.specialAttributes.resonance.augmented.value;
        matrix.attributes.sleaze.base = attributes.intuition.augmented.value + data.specialAttributes.resonance.augmented.value;
        matrix.attributes.dataProcessing.base = attributes.logic.augmented.value + data.specialAttributes.resonance.augmented.value;
        matrix.attributes.firewall.base = attributes.willpower.augmented.value + data.specialAttributes.resonance.augmented.value;
        matrix.deviceRating = data.specialAttributes.resonance.augmented.value;
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${deck.data.type}' deck type in generateMatrixAttributes()`);
        return;
    }

    matrix.pan = deck.data.pan;
    matrix.marks = deck.data.marks;
    matrix.markedItems = deck.data.markedItems;
    SR5_EntityHelpers.updateValue(matrix.noise);
    SR5_EntityHelpers.updateValue(matrix.programsMaximumActive, 0);
    SR5_EntityHelpers.updateValue(matrix.programsCurrentActive, 0);

    for (let key of Object.keys(lists.matrixAttributes)) {
      SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
    }
  }

  // Generate Matrix resistances, actions, actions defenses, user mode....
  static generateResonanceMatrix(deck, actor) {
    let lists = actor.lists;
    let data = actor.data, specialAttributes = data.specialAttributes, skills = data.skills;
    let matrix = data.matrix, resonanceActions = matrix.resonanceActions;

    resonanceActions.compileSprite.test.base = 0;
    SR5_EntityHelpers.updateModifier(resonanceActions.compileSprite.test, `${game.i18n.localize('SR5.Resonance')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, specialAttributes.resonance.augmented.value);
    SR5_EntityHelpers.updateModifier(resonanceActions.compileSprite.test,`${game.i18n.localize('SR5.MatrixActionCompileSprite')}`, `${game.i18n.localize('SR5.Skill')}`, skills.compiling.rating.value);
    resonanceActions.decompileSprite.test.base = 0;
    SR5_EntityHelpers.updateModifier(resonanceActions.decompileSprite.test, `${game.i18n.localize('SR5.Resonance')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, specialAttributes.resonance.augmented.value);
    SR5_EntityHelpers.updateModifier(resonanceActions.decompileSprite.test,`${game.i18n.localize('SR5.MatrixActionDecompileSprite')}`, `${game.i18n.localize('SR5.Skill')}`, skills.decompiling.rating.value);
    resonanceActions.eraseResonanceSignature.test.base = 0;
    SR5_EntityHelpers.updateModifier(resonanceActions.eraseResonanceSignature.test, `${game.i18n.localize('SR5.Resonance')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, specialAttributes.resonance.augmented.value);
    SR5_EntityHelpers.updateModifier(resonanceActions.eraseResonanceSignature.test,`${game.i18n.localize('SR5.SkillComputer')}`, `${game.i18n.localize('SR5.Skill')}`, skills.computer.rating.value);
    resonanceActions.killComplexForm.test.base = 0;
    SR5_EntityHelpers.updateModifier(resonanceActions.killComplexForm.test, `${game.i18n.localize('SR5.Resonance')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, specialAttributes.resonance.augmented.value);
    SR5_EntityHelpers.updateModifier(resonanceActions.killComplexForm.test,`${game.i18n.localize('SR5.SkillSoftware')}`, `${game.i18n.localize('SR5.Skill')}`, skills.software.rating.value);
    resonanceActions.registerSprite.test.base = 0;
    SR5_EntityHelpers.updateModifier(resonanceActions.registerSprite.test, `${game.i18n.localize('SR5.Resonance')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, specialAttributes.resonance.augmented.value);
    SR5_EntityHelpers.updateModifier(resonanceActions.registerSprite.test,`${game.i18n.localize('SR5.SkillRegistering')}`, `${game.i18n.localize('SR5.Skill')}`, skills.registering.rating.value);
    resonanceActions.threadComplexForm.test.base = 0;
    SR5_EntityHelpers.updateModifier(resonanceActions.threadComplexForm.test, `${game.i18n.localize('SR5.Resonance')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, specialAttributes.resonance.augmented.value);
    SR5_EntityHelpers.updateModifier(resonanceActions.threadComplexForm.test,`${game.i18n.localize('SR5.SkillSoftware')}`, `${game.i18n.localize('SR5.Skill')}`, skills.software.rating.value);
 
    // handle resonance final calculation
    for (let key of Object.keys(lists.resonanceActions)) {
      if (resonanceActions[key].test){
        this.applyPenalty("condition", resonanceActions[key].test, actor);
        this.applyPenalty("matrix", resonanceActions[key].test, actor);
        this.applyPenalty("magic", resonanceActions[key].test, actor);
        this.applyPenalty("special", resonanceActions[key].test, actor);
        if (matrix.userMode === "hotsim" && key === "eraseResonanceSignature") {
          SR5_EntityHelpers.updateModifier(resonanceActions[key].test, "deckModes", "hotsim", 2);
        }
        //test
        SR5_EntityHelpers.updateDicePool(resonanceActions[key].test);
        if (resonanceActions[key].test.dicePool < 0) resonanceActions[key].test.dicePool = 0;
        //limit
        if (resonanceActions[key].limit) SR5_EntityHelpers.updateValue(resonanceActions[key].limit);
      }
    }
  }

  static generateMatrixActions(actor){
    let lists = actor.lists;
    let data = actor.data, attributes = data.attributes, skills = data.skills;
    let matrix = data.matrix, matrixAttributes = matrix.attributes, matrixActions = matrix.actions;

    SR5_EntityHelpers.updateModifier(matrixActions.jamSignals.test, game.i18n.localize('SR5.SkillElectronicWarfare'), game.i18n.localize('SR5.Skill'), skills.electronicWarfare.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.jamSignals.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.controlDevice.test, game.i18n.localize('SR5.SkillElectronicWarfare'), game.i18n.localize('SR5.Skill'), skills.electronicWarfare.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.controlDevice.test, game.i18n.localize('SR5.Intuition'), game.i18n.localize('SR5.LinkedAttribute'), attributes.intuition.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.disarmDataBomb.test, game.i18n.localize('SR5.SkillSoftware'), game.i18n.localize('SR5.Skill'), skills.software.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.disarmDataBomb.test, game.i18n.localize('SR5.Intuition'), game.i18n.localize('SR5.LinkedAttribute'), attributes.intuition.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.editFile.test, game.i18n.localize('SR5.SkillComputer'), game.i18n.localize('SR5.Skill'), skills.computer.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.editFile.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.eraseMark.test, game.i18n.localize('SR5.SkillComputer'), game.i18n.localize('SR5.Skill'), skills.computer.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.eraseMark.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.formatDevice.test, game.i18n.localize('SR5.SkillComputer'), game.i18n.localize('SR5.Skill'), skills.computer.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.formatDevice.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.snoop.test, game.i18n.localize('SR5.SkillElectronicWarfare'), game.i18n.localize('SR5.Skill'), skills.electronicWarfare.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.snoop.test, game.i18n.localize('SR5.Intuition'), game.i18n.localize('SR5.LinkedAttribute'), attributes.intuition.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.hackOnTheFly.test, game.i18n.localize('SR5.SkillHacking'), game.i18n.localize('SR5.Skill'), skills.hacking.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.hackOnTheFly.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.spoofCommand.test, game.i18n.localize('SR5.SkillHacking'), game.i18n.localize('SR5.Skill'), skills.hacking.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.spoofCommand.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.garbageInGarbageOut.test, game.i18n.localize('SR5.SkillComputer'), game.i18n.localize('SR5.Skill'), skills.computer.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.garbageInGarbageOut.test, game.i18n.localize('SR5.Intuition'), game.i18n.localize('SR5.LinkedAttribute'), attributes.intuition.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.bruteForce.test, game.i18n.localize('SR5.SkillCybercombat'), game.i18n.localize('SR5.Skill'), skills.cybercombat.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.bruteForce.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.matrixPerception.test, game.i18n.localize('SR5.SkillComputer'), game.i18n.localize('SR5.Skill'), skills.computer.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.matrixPerception.test, game.i18n.localize('SR5.Intuition'), game.i18n.localize('SR5.LinkedAttribute'), attributes.intuition.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.dataSpike.test, game.i18n.localize('SR5.SkillCybercombat'), game.i18n.localize('SR5.Skill'), skills.cybercombat.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.dataSpike.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.crackFile.test, game.i18n.localize('SR5.SkillHacking'), game.i18n.localize('SR5.Skill'), skills.hacking.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.crackFile.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.crashProgram.test, game.i18n.localize('SR5.SkillCybercombat'), game.i18n.localize('SR5.Skill'), skills.cybercombat.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.crashProgram.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.setDataBomb.test, game.i18n.localize('SR5.SkillSoftware'), game.i18n.localize('SR5.Skill'), skills.software.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.setDataBomb.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.jumpIntoRiggedDevice.test, game.i18n.localize('SR5.SkillElectronicWarfare'), game.i18n.localize('SR5.Skill'), skills.electronicWarfare.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.jumpIntoRiggedDevice.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.rebootDevice.test, game.i18n.localize('SR5.SkillComputer'), game.i18n.localize('SR5.Skill'), skills.computer.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.rebootDevice.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.trackback.test, game.i18n.localize('SR5.SkillComputer'), game.i18n.localize('SR5.Skill'), skills.computer.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.trackback.test, game.i18n.localize('SR5.Intuition'), game.i18n.localize('SR5.LinkedAttribute'), attributes.intuition.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.matrixSearch.test, game.i18n.localize('SR5.SkillComputer'), game.i18n.localize('SR5.Skill'), skills.computer.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.matrixSearch.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.hide.test, game.i18n.localize('SR5.SkillElectronicWarfare'), game.i18n.localize('SR5.Skill'), skills.electronicWarfare.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.hide.test, game.i18n.localize('SR5.Intuition'), game.i18n.localize('SR5.LinkedAttribute'), attributes.intuition.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.jackOut.test, game.i18n.localize('SR5.SkillHardware'), game.i18n.localize('SR5.Skill'), skills.hardware.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.jackOut.test, game.i18n.localize('SR5.Willpower'), game.i18n.localize('SR5.LinkedAttribute'), attributes.willpower.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.traceIcon.test, game.i18n.localize('SR5.SkillComputer'), game.i18n.localize('SR5.Skill'), skills.computer.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.traceIcon.test, game.i18n.localize('SR5.Intuition'), game.i18n.localize('SR5.LinkedAttribute'), attributes.intuition.augmented.value);
    SR5_EntityHelpers.updateModifier(matrixActions.checkOverwatchScore.test, game.i18n.localize('SR5.SkillElectronicWarfare'), game.i18n.localize('SR5.Skill'), skills.electronicWarfare.rating.value);
    SR5_EntityHelpers.updateModifier(matrixActions.checkOverwatchScore.test, game.i18n.localize('SR5.Logic'), game.i18n.localize('SR5.LinkedAttribute'), attributes.logic.augmented.value);

    for (let key of Object.keys(lists.matrixActions)) {
      if (matrixActions[key].test !== undefined) {
        // test
        if (matrix.runningSilent) {
          SR5_EntityHelpers.updateModifier(matrixActions[key].test, game.i18n.localize('SR5.RunningSilent'), game.i18n.localize('SR5.MatrixUserMode'), -2);
        }
        if (matrix.userMode === "hotsim") {
          SR5_EntityHelpers.updateModifier(matrixActions[key].test, game.i18n.localize('SR5.VirtualRealityHotSimShort'), game.i18n.localize('SR5.MatrixUserMode'), 2);
        }
        this.applyPenalty("condition", matrixActions[key].test, actor);
        this.applyPenalty("matrix", matrixActions[key].test, actor);
        this.applyPenalty("magic", matrixActions[key].test, actor);
        this.applyPenalty("special", matrixActions[key].test, actor);
        SR5_EntityHelpers.updateDicePool(matrixActions[key].test, 0);
        // limits
        let linkedAttribute = matrixActions[key].limit.linkedAttribute;
        matrixActions[key].limit.base = 0;
        SR5_EntityHelpers.updateModifier(matrixActions[key].limit, game.i18n.localize(lists.matrixAttributes[linkedAttribute]), game.i18n.localize('SR5.LinkedAttribute'), matrixAttributes[linkedAttribute].value);
        SR5_EntityHelpers.updateValue(matrixActions[key].limit, 0);
      }
    }
  }

  static generateMatrixActionsDefenses(actor) {
    let lists = actor.lists;
    let data = actor.data;
    let matrix = data.matrix, matrixAttributes = matrix.attributes, matrixActions = matrix.actions;
    let intuitionValue, willpowerValue, logicValue, firewallValue, sleazeValue, dataProcessingValue, attackValue;

    if (actor.type === "actorPc" || actor.type === "actorGrunt" || actor.type === "actorAgent"){
      intuitionValue = data.attributes.intuition.augmented.value;
      willpowerValue = data.attributes.willpower.augmented.value;
      logicValue = data.attributes.logic.augmented.value;
      firewallValue = matrixAttributes.firewall.value;
      sleazeValue = matrixAttributes.sleaze.value;
      dataProcessingValue = matrixAttributes.dataProcessing.value;
      attackValue = matrixAttributes.attack.value;
    }

    if (actor.type === "actorDevice" || actor.type === "actorSprite" || actor.type === "actorDrone") {
      if ((matrix.deviceType === "slavedDevice" && data.isDirectlyConnected) || matrix.deviceType === "device" || actor.type === "actorDrone") {
        intuitionValue = matrix.deviceRating;
        willpowerValue = matrix.deviceRating;
        logicValue = matrix.deviceRating;
        firewallValue = matrix.deviceRating;
        sleazeValue = matrix.deviceRating;
        dataProcessingValue = matrix.deviceRating;
        attackValue = matrix.deviceRating;
      } else {
        intuitionValue = matrix.deviceRating;
        willpowerValue = matrix.deviceRating;
        logicValue = matrix.deviceRating;
        firewallValue = matrixAttributes.firewall.value;
        sleazeValue = matrixAttributes.sleaze.value;
        dataProcessingValue = matrixAttributes.dataProcessing.value;
        attackValue = matrixAttributes.attack.value;
      }
    }

    SR5_EntityHelpers.updateModifier(matrixActions.editFile.defense, `${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, intuitionValue);
    SR5_EntityHelpers.updateModifier(matrixActions.editFile.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.eraseMark.defense, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, willpowerValue);
    SR5_EntityHelpers.updateModifier(matrixActions.eraseMark.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.formatDevice.defense, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, willpowerValue);
    SR5_EntityHelpers.updateModifier(matrixActions.formatDevice.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.snoop.defense, `${game.i18n.localize('SR5.Logic')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, logicValue);
    SR5_EntityHelpers.updateModifier(matrixActions.snoop.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.hackOnTheFly.defense, `${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, intuitionValue);
    SR5_EntityHelpers.updateModifier(matrixActions.hackOnTheFly.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue);
    SR5_EntityHelpers.updateModifier(matrixActions.spoofCommand.defense, `${game.i18n.localize('SR5.Logic')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, logicValue);
    SR5_EntityHelpers.updateModifier(matrixActions.spoofCommand.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.garbageInGarbageOut.defense, `${game.i18n.localize('SR5.Logic')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, logicValue);
    SR5_EntityHelpers.updateModifier(matrixActions.garbageInGarbageOut.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.bruteForce.defense, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, willpowerValue);
    SR5_EntityHelpers.updateModifier(matrixActions.bruteForce.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.matrixPerception.defense, `${game.i18n.localize('SR5.Logic')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, logicValue);
    SR5_EntityHelpers.updateModifier(matrixActions.matrixPerception.defense, `${game.i18n.localize('SR5.Sleaze')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, sleazeValue);
    SR5_EntityHelpers.updateModifier(matrixActions.dataSpike.defense, `${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, intuitionValue);
    SR5_EntityHelpers.updateModifier(matrixActions.dataSpike.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.crashProgram.defense, `${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, intuitionValue);
    SR5_EntityHelpers.updateModifier(matrixActions.crashProgram.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.jumpIntoRiggedDevice.defense, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, willpowerValue);
    SR5_EntityHelpers.updateModifier(matrixActions.jumpIntoRiggedDevice.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.rebootDevice.defense, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, willpowerValue);
    SR5_EntityHelpers.updateModifier(matrixActions.rebootDevice.defense, `${game.i18n.localize('SR5.Firewall')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, firewallValue );
    SR5_EntityHelpers.updateModifier(matrixActions.hide.defense, `${game.i18n.localize('SR5.Intuition')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, intuitionValue);
    SR5_EntityHelpers.updateModifier(matrixActions.hide.defense, `${game.i18n.localize('SR5.DataProcessing')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, dataProcessingValue );
    SR5_EntityHelpers.updateModifier(matrixActions.jackOut.defense, `${game.i18n.localize('SR5.Logic')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, logicValue);
    SR5_EntityHelpers.updateModifier(matrixActions.jackOut.defense, `${game.i18n.localize('SR5.MatrixAttack')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, attackValue);
    SR5_EntityHelpers.updateModifier(matrixActions.traceIcon.defense, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, willpowerValue);
    SR5_EntityHelpers.updateModifier(matrixActions.traceIcon.defense, `${game.i18n.localize('SR5.Sleaze')}`, `${game.i18n.localize('SR5.MatrixAttribute')}`, sleazeValue);
    matrixActions.checkOverwatchScore.defense.base = 6;

    //Special case for drone slaved to a Rigger
    if (actor.type === "actorDrone") {
      if (data.vehicleOwner.id && data.slaved){
        let controler = actor.flags.sr5.vehicleControler.data;        
        for (let key of Object.keys(lists.matrixActionsDefenses)) {
          data.matrix.actions[key].defense.base = 0;
          SR5_EntityHelpers.updateModifier(data.matrix.actions[key].defense, game.i18n.localize('SR5.DeviceRating'), game.i18n.localize('SR5.Controler'), controler.matrix.actions[key].defense.dicePool);
        }
      } 
    }

    // handle final calculation
    for (let key of Object.keys(lists.matrixActions)) {
      if (matrixActions[key].defense) {
        this.applyPenalty("condition", matrixActions[key].defense, actor);
        this.applyPenalty("matrix", matrixActions[key].defense, actor);
        this.applyPenalty("magic", matrixActions[key].defense, actor);
        this.applyPenalty("special", matrixActions[key].defense, actor);
        SR5_EntityHelpers.updateDicePool(matrixActions[key].defense, 0);
      }
    }
  }

  static generateMatrixResistances(actor, deck){
    let lists = actor.lists;
    let data = actor.data, attributes = data.attributes, specialAttributes = data.specialAttributes;
    let matrix = data.matrix, matrixAttributes = matrix.attributes, matrixResistances = matrix.resistances;

    matrixResistances.matrixDamage.base = 0;
    matrixResistances.biofeedback.base = 0;
    matrixResistances.dumpshock.base = 0;
    matrixResistances.dataBomb.base = 0;
    matrixResistances.fading.base = 0;
    switch(deck.data.type){
      case "commlink":
        SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.DeviceRating')}`, deck.data.deviceRating);
        SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        break;
      case "cyberdeck":
      case "riggerCommandConsole":
        SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.DeviceRating')}`, deck.data.deviceRating);
        SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.biofeedback, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.biofeedback, deck.name, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.dumpshock, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.dumpshock, deck.name, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, deck.name, `${game.i18n.localize('SR5.DeviceRating')}`, deck.data.deviceRating);
        SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, deck.name, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        break;
      case "livingPersona":
      case "headcase":
        SR5_EntityHelpers.updateModifier(matrixResistances.fading, `${game.i18n.localize('SR5.Resonance')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, specialAttributes.resonance.augmented.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.fading, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, `${game.i18n.localize('SR5.Resonance')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, specialAttributes.resonance.augmented.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.biofeedback, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.biofeedback, deck.name, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.dumpshock, `${game.i18n.localize('SR5.Willpower')}`, `${game.i18n.localize('SR5.LinkedAttribute')}`, attributes.willpower.augmented.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.dumpshock, deck.name, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, deck.name, `${game.i18n.localize('SR5.DeviceRating')}`, deck.data.deviceRating);
        SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, deck.name, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        break;
      case "baseDevice":
        if (actor.type === "actorDrone"){
          if (actor.data.vehicleOwner.id && data.slaved){
            let controler = actor.flags.sr5.vehicleControler.data;
            SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.Controler')}`, controler.matrix.resistances.matrixDamage.dicePool);
          } else {
            SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.DeviceRating')}`, data.matrix.deviceRating);
            SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.Firewall')}`, data.matrix.attributes.firewall.value);
          }
        } else if (actor.type === "actorDevice"){
          SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.DeviceRating')}`, data.matrix.deviceRating);
          SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, deck.name, `${game.i18n.localize('SR5.Firewall')}`, data.matrix.attributes.firewall.value);
        } else if (actor.type === "actorSprite"){
          SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('ACTOR.TypeActorsprite'), `${game.i18n.localize('SR5.Level')}`, matrix.deviceRating);
          SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, game.i18n.localize('ACTOR.TypeActorsprite'), `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
          SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, game.i18n.localize('ACTOR.TypeActorsprite'), `${game.i18n.localize('SR5.Level')}`, matrix.deviceRating);
          SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, game.i18n.localize('ACTOR.TypeActorsprite'), `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        } else if (actor.type === "actorAgent"){
          SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, `${game.i18n.localize('SR5.ProgramTypeAgent')}`, `${game.i18n.localize('SR5.ItemRating')}`,data.rating);
          SR5_EntityHelpers.updateModifier(matrixResistances.matrixDamage, `${game.i18n.localize('SR5.ProgramTypeAgent')}`, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
          SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, `${game.i18n.localize('SR5.ProgramTypeAgent')}`, `${game.i18n.localize('SR5.ItemRating')}`, data.rating);
          SR5_EntityHelpers.updateModifier(matrixResistances.dataBomb, `${game.i18n.localize('SR5.ProgramTypeAgent')}`, `${game.i18n.localize('SR5.Firewall')}`, matrixAttributes.firewall.value);
        }
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${deck.data.type}' deck type in generateMatrixResistances()`);
        return;
    }

    for (let key of Object.keys(lists.matrixResistances)) {
      SR5_EntityHelpers.updateDicePool(matrixResistances[key]);
    }
  }

  static generateVehicleMatrix(actor, deck) {
    let lists = actor.lists, data = actor.data;

    data.matrix.deviceRating = data.attributes.pilot.augmented.value;
    data.matrix.programsMaximumActive.value = Math.ceil(data.matrix.deviceRating / 2);
    data.matrix.marks = deck.data.marks;
    data.matrix.markedItems = deck.data.markedItems;

    for (let key of Object.keys(lists.matrixAttributes)) {
      data.matrix.attributes[key].base = 0;
      SR5_EntityHelpers.updateModifier(data.matrix.attributes[key], game.i18n.localize('SR5.DeviceRating'), game.i18n.localize('SR5.LinkedAttribute'), data.matrix.deviceRating);
      SR5_EntityHelpers.updateValue(data.matrix.attributes[key]);
    } 

    SR5_EntityHelpers.updateValue(data.matrix.noise);
  }

  static generateDeviceMatrix(actor, deck) {
    let lists = actor.lists, data = actor.data,
        matrix = data.matrix, matrixAttributes = matrix.attributes, matrixResistances = matrix.resistances, matrixActions = matrix.actions;

    data.matrix.marks = deck.data.marks;
    data.matrix.markedItems = deck.data.markedItems;
    matrix.deviceName = actor.name;

    if (matrix.deviceType === "host"){
      matrix.attributesCollection.value1 = matrix.deviceRating;
      matrix.attributesCollection.value2 = matrix.deviceRating + 1;
      matrix.attributesCollection.value3 = matrix.deviceRating + 2;
      matrix.attributesCollection.value4 = matrix.deviceRating + 3;
    }

    //Handle Ice attack and defense
    if (matrix.deviceType === "ice") {
      matrix.ice.attackDicepool = matrix.deviceRating * 2;
      matrix.actions.matrixPerception.test.dicePool = matrix.deviceRating * 2;
      SR5_EntityHelpers.updateValue(matrixAttributes.dataProcessing, 0);
      matrix.actions.matrixPerception.limit.value = matrixAttributes.dataProcessing.value;
      switch(matrix.deviceSubType){
        case "iceAcid" :
        case "iceScramble" :
          matrix.ice.defenseFirstAttribute = "willpower";
          matrix.ice.defenseSecondAttribute = "firewall";
          break;
        case "iceBinder" :
          matrix.ice.defenseFirstAttribute = "willpower";
          matrix.ice.defenseSecondAttribute = "dataProcessing";
          break;
        case "iceCrash" :
        case "iceBlack" :
        case "iceKiller" :
        case "iceProbe" :
        case "iceSparky" :
          matrix.ice.defenseFirstAttribute = "intuition";
          matrix.ice.defenseSecondAttribute = "firewall";
          break;
        case "iceBlaster" :
        case "iceTarBaby" :
          matrix.ice.defenseFirstAttribute = "logic";
          matrix.ice.defenseSecondAttribute = "firewall";
          break;
        case "iceJammer" :
          matrix.ice.defenseFirstAttribute = "willpower";
          matrix.ice.defenseSecondAttribute = "attack";
          break;
        case "iceTrack" :  
        case "iceMarker" :
          matrix.ice.defenseFirstAttribute = "willpower";
          matrix.ice.defenseSecondAttribute = "sleaze";
          break;
        case "icePatrol" :
          break;
        default :
          SR5_SystemHelpers.srLog(1, `Unknown '${matrix.deviceSubType}' ice type in generateDeviceMatrix()`);  
      }
    }

    //Handle Attributes
    if ((matrix.deviceType === "device") || (matrix.deviceType === "slavedDevice" && data.isDirectlyConnected)){
      for (let key of Object.keys(lists.matrixAttributes)) {
        matrixAttributes[key].base = matrix.deviceRating;
        SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
      }
    } else {
      for (let key of Object.keys(lists.matrixAttributes)) {
        SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
      }
    }

    SR5_EntityHelpers.updateValue(matrix.noise)
  }

  static generateSpriteMatrix(actor, deck) {
    let lists = actor.lists, data = actor.data, matrix = data.matrix;
    let matrixAttributes = matrix.attributes, matrixResistances = matrix.resistances, matrixActions = matrix.actions;

    data.matrix.marks = deck.data.marks;
    data.matrix.markedItems = deck.data.markedItems;
    matrix.deviceRating = data.level;

    //Handle base matrix attributes
    for (let key of Object.keys(lists.matrixAttributes)) {
      matrixAttributes[key].base = matrix.deviceRating;
    }

    //Apply matrix attributes by type
    let label = `${game.i18n.localize(lists.spriteTypes[data.type])}`;
    switch (data.type) {
      case "courier":
        SR5_EntityHelpers.updateModifier(matrixAttributes.sleaze, label, `${game.i18n.localize('SR5.SpriteType')}`, +3);
        SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, `${game.i18n.localize('SR5.SpriteType')}`, +1);
        SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, `${game.i18n.localize('SR5.SpriteType')}`, +2);
        break;
      case "crack":
        SR5_EntityHelpers.updateModifier(matrixAttributes.sleaze, label, `${game.i18n.localize('SR5.SpriteType')}`, +3);
        SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, `${game.i18n.localize('SR5.SpriteType')}`, +2);
        SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, `${game.i18n.localize('SR5.SpriteType')}`, +1);
        break;
      case "data":
        SR5_EntityHelpers.updateModifier(matrixAttributes.attack, label, `${game.i18n.localize('SR5.SpriteType')}`, -1);
        SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, `${game.i18n.localize('SR5.SpriteType')}`, +4);
        SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, `${game.i18n.localize('SR5.SpriteType')}`, +2);
        break;
      case "fault":
        SR5_EntityHelpers.updateModifier(matrixAttributes.attack, label, `${game.i18n.localize('SR5.SpriteType')}`, +3);
        SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, `${game.i18n.localize('SR5.SpriteType')}`, +1);
        SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, `${game.i18n.localize('SR5.SpriteType')}`, +2);
        break;
      case "machine":
        SR5_EntityHelpers.updateModifier(matrixAttributes.attack, label, `${game.i18n.localize('SR5.SpriteType')}`, +1);
        SR5_EntityHelpers.updateModifier(matrixAttributes.dataProcessing, label, `${game.i18n.localize('SR5.SpriteType')}`, +3);
        SR5_EntityHelpers.updateModifier(matrixAttributes.firewall, label, `${game.i18n.localize('SR5.SpriteType')}`, +2);
        break;
      default:
        SR5_SystemHelpers.srLog(1, `Unknown '${data.type}' sprite type in generateSpriteMatrix()`);
    }

    //handle matrix attributes
    for (let key of Object.keys(lists.matrixAttributes)) {
      SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
    }

    SR5_EntityHelpers.updateValue(matrix.noise)
  }

  static generateAgentMatrix(actor, deck){
    let lists = actor.lists;
    let actorData = actor.data;
    if(!actorData.creatorData) return;
    let matrixAttributes = actorData.matrix.attributes, creatorMatrix = actorData.creatorData.data.matrix;

    actorData.matrix.marks = deck.data.marks;
    actorData.matrix.markedItems = deck.data.markedItems;
    //Device
    actorData.matrix.deviceRating = creatorMatrix.deviceRating;

    //Agent attributes are equal to the rating (Kill code page 26)
    for (let key of Object.keys(lists.characterAttributes)) {
      actorData.attributes[key].augmented.value = actorData.rating;
    }
    //Agent matrix attributes are the same as decker attributes
    for (let key of Object.keys(lists.deckerAttributes)) {
      matrixAttributes[key].base = creatorMatrix.attributes[key].value;
      SR5_EntityHelpers.updateValue(matrixAttributes[key], 0);
    }
    //Agent skills are equal to program rating
    for (let key of Object.keys(lists.agentSkills)){
      actorData.skills[key].rating.base = actorData.rating;
      SR5_EntityHelpers.updateValue(actorData.skills[key].rating, 0);
      actorData.skills[key].test.base = actorData.skills[key].rating.value;
      SR5_EntityHelpers.updateDicePool(actorData.skills[key].test, 0);
    }
    //Noise
    SR5_EntityHelpers.updateValue(actorData.matrix.noise)
    //Grid
    actorData.userGrid = creatorMatrix.userGrid;
  }

  static async updateAgentOwner(agent){
    if(!agent.data.creatorData) return;
    if(!canvas.scene) return;
    let owner = SR5_EntityHelpers.getRealActorFromID(agent.data.creatorId);
    let ownerDeck = owner.items.find(i => i.data.type === "itemDevice" && i.data.data.isActive);    
    let newDeck = duplicate(ownerDeck);
    if (newDeck.data.conditionMonitors.matrix.current !== agent.data.conditionMonitors.matrix.current){
      newDeck.data.conditionMonitors.matrix = agent.data.conditionMonitors.matrix;
      ownerDeck.update(newDeck);
    }
  }

  static async updateAgent(actor, deck){
    if (game.actors) {
      for (let a of game.actors) {
        if(a.data.type === "actorAgent" && a.data.data.creatorId === actor._id){
          let agent = duplicate(a);
          agent.data.conditionMonitors.matrix = deck.data.conditionMonitors.matrix;
          agent.data.creatorData = actor.toObject(false);
          a.update(agent);
        }
      }
    }
  }

  static applyProgramToAgent(actor){
    let actorData = actor.data;
    if(!actorData.creatorData) return;
    for (let i of actorData.creatorData.items){
      if (i.type === "itemProgram" && (i.data.type === "common" || i.data.type === "hacking")){
        if (Object.keys(i.data.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
      }
    }

  }

  static async updateControledVehicle(actor){ 
    if (game.actors) {
      for (let a of game.actors) {
        if(a.data.type === "actorDrone" && a.data.data.vehicleOwner.id === actor._id){
          await a.setFlag("sr5", "vehicleControler", actor.toObject(false));
        }
      }
    }

    if (canvas.scene){
      for (let t of canvas.tokens.placeables) {
        if(t.actor.data.type === "actorDrone" && t.actor.data.data.vehicleOwner.id === actor._id){
          await t.actor.setFlag("sr5", "vehicleControler", actor.toObject(false));
          if (t.actor.token) await t.actor.token.setFlag("sr5", "vehicleControler", actor.toObject(false));
        }
      }
    }
  }

  static applyAutosoftEffect(actor){
    let controler = actor.flags.sr5.vehicleControler;
    let hasLocalAutosoftRunning = actor.items.find(a => a.data.data.type === "autosoft" && a.data.data.isActive);
    if (hasLocalAutosoftRunning) actor.data.matrix.hasLocalAutosoftRunning = true;
    else actor.data.matrix.hasLocalAutosoftRunning = false;
    
    if (actor.data.controlMode === "autopilot"){
      for (let i of controler.items){
        if (i.type === "itemProgram" && i.data.type === "autosoft" && i.data.isActive && !hasLocalAutosoftRunning){
          if (i.data.isModelBased){
            if (i.data.model === actor.data.model){
              if (Object.keys(i.data.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
            }
          } else {
            if (Object.keys(i.data.customEffects).length) SR5_CharacterUtility.applyCustomEffects(i, actor);
          }
        }
      }
    }
  }

  //////////////// MODIFS D'OBJETS ///////////////////

  // Modif dû à la possession d'un esprit
  static _actorModifPossession(spirit, actor) {
    let lists = actor.lists, data = actor.data, actorAttribute = data.attributes;
    let spiritForce = spirit.data.data.itemRating, spiritType = spirit.data.data.type, spiritAttributes = spirit.data.data.attributes;

    // Attributes modifiers
    for (let key of Object.keys(lists.characterPhysicalAttributes)) {
      if (actorAttribute[key].augmented.base < spiritForce) { 
        SR5_EntityHelpers.updateModifier(actorAttribute[key].augmented, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(lists.spiritTypes[spiritType])})`, "Possesion", Math.floor(spiritForce / 2));
      }
    }
    for (let key of Object.keys(lists.characterMentalAttributes)) {
      let mod = spiritAttributes[key] - actorAttribute[key].augmented.base;
      SR5_EntityHelpers.updateModifier(actorAttribute[key].augmented, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(lists.spiritTypes[spiritType])})`, "Possesion", mod);
    }
    for (let key of Object.keys(lists.characterSpecialAttributes)) {
      if(spiritAttributes[key]){
        let mod = spiritAttributes[key] - data.specialAttributes[key].augmented.base;
        SR5_EntityHelpers.updateModifier(data.specialAttributes[key].augmented, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(lists.spiritTypes[spiritType])})`, "Possesion", mod);
      }
    }

    // Skills modifiers
    for (let key of Object.keys(lists.skillGroups)){
      if (data.skillGroups[key]){
        let mod = data.skillGroups[key].base;
        SR5_EntityHelpers.updateModifier(data.skillGroups[key], `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(lists.spiritTypes[spiritType])})`, "Possesion", -mod);
      }
    }
    for (let key of Object.keys(lists.skills)) {
      if (data.skills[key]){
        let spiritSkill = spirit.data.data.skill.find(skill => skill === key);
        if (spiritSkill === key) {
          let mod = spiritForce - data.skills[key].rating.value;
          SR5_EntityHelpers.updateModifier(data.skills[key].rating, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(lists.spiritTypes[spiritType])})`, "Possesion", mod);
        } else {
          let mod = data.skills[key].rating.base;
          SR5_EntityHelpers.updateModifier(data.skills[key].rating, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(lists.spiritTypes[spiritType])})`, "Possesion", -mod);
        }
      }
    }

    // Initiative "modifier"
    data.initiatives.physicalInit.dice.base = 2;

    // Penalties modifiers (rules are so cryptic, I prefer to simplify and just put a "bonus" to penalty)
    SR5_EntityHelpers.updateModifier(data.penalties.condition.actual, `${game.i18n.localize('SR5.Possession')} (${game.i18n.localize(lists.spiritTypes[spiritType])})`, "Possesion", spiritForce);

  }

  static applyCustomEffects(item, actor) {
    let lists = actor.lists;
    for (let customEffect of Object.values(item.data.customEffects)) {
      let skipCustomEffect = false,
          cumulative = customEffect.cumulative,
          isMultiplier = false;

      if (!customEffect.target || !customEffect.type) {
        SR5_SystemHelpers.srLog(3, `Empty custom effect target or type in applyCustomEffects()`, customEffect);
        skipCustomEffect = true;
      }

      // For effect depending on wifi
      if (customEffect.wifi && !item.data.wirelessTurnedOn){ 
        skipCustomEffect = true;
      }

      if (item.type === "itemDrug"){
        if (!item.data.isActive && !customEffect.wifi) skipCustomEffect = true;
      }

      let targetObject = SR5_EntityHelpers.resolveObjectPath(customEffect.target, actor);
      if (targetObject === null) skipCustomEffect = true;

      if (!skipCustomEffect) {    
        if (!customEffect.multiplier) customEffect.multiplier = 1;

        //Special case for items'effects which modify all weapons weared by the actor
        if (customEffect.category === "weaponEffectTargets"){
          if (customEffect.target === "data.itemsProperties.weapon.accuracy"){
            customEffect.value = (customEffect.value || 0);
            SR5_EntityHelpers.updateModifier(targetObject, `${item.name} (${game.i18n.localize(lists.itemTypes[item.type])})`, customEffect.type, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
          }
          if (customEffect.target === "data.itemsProperties.weapon.damageValue"){
            customEffect.value = (customEffect.value || 0);
            SR5_EntityHelpers.updateModifier(targetObject, `${item.name} (${game.i18n.localize(lists.itemTypes[item.type])})`, customEffect.type, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
          }
        }

        switch (customEffect.type) {
          case "rating":
            customEffect.value = (item.data.itemRating || 0);
            SR5_EntityHelpers.updateModifier(targetObject, `${item.name}`, `${game.i18n.localize(lists.itemTypes[item.type])}`, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
            break;
          case "hits":
            customEffect.value = (item.data.hits || 0);
            SR5_EntityHelpers.updateModifier(targetObject, `${item.name}`, `${game.i18n.localize(lists.itemTypes[item.type])}`, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
            break;
          case "value":
            customEffect.value = (customEffect.value || 0);
            SR5_EntityHelpers.updateModifier(targetObject, `${item.name}`, `${game.i18n.localize(lists.itemTypes[item.type])}`, customEffect.value * customEffect.multiplier, isMultiplier, cumulative);
            break;
          case "valueReplace":
            targetObject.modifiers= [];
            if (targetObject.base < 1) targetObject.base = 0;
            let modValue = -targetObject.base + (customEffect.value || 0);
            SR5_EntityHelpers.updateModifier(targetObject, `${item.name}`, `${game.i18n.localize(lists.itemTypes[item.type])}`, modValue * customEffect.multiplier, isMultiplier, cumulative);
            break;
          //currently disabled in effects.html
          case "ratingReplace":
            targetObject.modifiers= [];
            customEffect.value = (item.data.itemRating || 0);
            if (targetObject.base < 1) targetObject.base = 0;
            let modRating = -targetObject.base + customEffect.value;
            SR5_EntityHelpers.updateModifier(targetObject, `${item.name}`, `${game.i18n.localize(lists.itemTypes[item.type])}`, modRating * customEffect.multiplier, isMultiplier, cumulative);
            break;
          case "boolean":
            let booleanValue;
            if (customEffect.value === "true") booleanValue = true;
            else booleanValue = false;
            setProperty(actor, customEffect.target, booleanValue);
            break;
          default:
            SR5_SystemHelpers.srLog(1, `Unknown '${customEffect.type}' custom effect type in applyCustomEffects()`, customEffect);
        }
        
      }
    }
  }

}
