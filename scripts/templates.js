/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [

    // Common sheet partials - Header icons
    "systems/sr5/img/icons/nav-attributes.svg.hbs",
    "systems/sr5/img/icons/nav-augmentations.svg.hbs",
    "systems/sr5/img/icons/nav-bio.svg.hbs",
    "systems/sr5/img/icons/nav-configuration.svg.hbs",
    "systems/sr5/img/icons/nav-contacts.svg.hbs",
    "systems/sr5/img/icons/nav-deck.svg.hbs",
    "systems/sr5/img/icons/nav-derived.svg.hbs",
    "systems/sr5/img/icons/nav-gear.svg.hbs",
    "systems/sr5/img/icons/nav-information.svg.hbs",
    "systems/sr5/img/icons/nav-magic.svg.hbs",
    "systems/sr5/img/icons/nav-matrix.svg.hbs",
    "systems/sr5/img/icons/nav-modifiers.svg.hbs",
    "systems/sr5/img/icons/nav-qualities.svg.hbs",
    "systems/sr5/img/icons/nav-skills.svg.hbs",
    "systems/sr5/img/icons/nav-spells.svg.hbs",
    "systems/sr5/img/icons/nav-weapons.svg.hbs",
    "systems/sr5/img/icons/nav-materialize.svg.hbs",
    "systems/sr5/img/icons/nav-dismiss.svg.hbs",
    "systems/sr5/img/icons/nav-link.svg.hbs",

    /***************************************************************** */
    /**                      ACTOR PARTIALS                         ** */
    /***************************************************************** */

    // Actor sheet - Headers
    "systems/sr5/templates/actors/_partials/header/header.html",

      // Actor sheet - Headers - Navigation hub
      "systems/sr5/templates/actors/_partials/header/nav/actorPC.html",
      "systems/sr5/templates/actors/_partials/header/nav/actorDevice.html",
      "systems/sr5/templates/actors/_partials/header/nav/actorDrone.html",
      "systems/sr5/templates/actors/_partials/header/nav/actorGrunt.html",
      "systems/sr5/templates/actors/_partials/header/nav/actorSpirit.html",
      "systems/sr5/templates/actors/_partials/header/nav/actorSprite.html",
      "systems/sr5/templates/actors/_partials/header/nav/actorAgent.html",

        // Actor sheet - Headers - Navigation parts
        "systems/sr5/templates/actors/_partials/header/navParts/coreInfos.html",
        "systems/sr5/templates/actors/_partials/header/navParts/augmentation.html",
        "systems/sr5/templates/actors/_partials/header/navParts/biography.html",
        "systems/sr5/templates/actors/_partials/header/navParts/combat.html",
        "systems/sr5/templates/actors/_partials/header/navParts/derived.html",
        "systems/sr5/templates/actors/_partials/header/navParts/gear.html",
        "systems/sr5/templates/actors/_partials/header/navParts/magic.html",
        "systems/sr5/templates/actors/_partials/header/navParts/magicUser.html",
        "systems/sr5/templates/actors/_partials/header/navParts/matrix.html",
        "systems/sr5/templates/actors/_partials/header/navParts/matrixUser.html",
        "systems/sr5/templates/actors/_partials/header/navParts/modification.html",
        "systems/sr5/templates/actors/_partials/header/navParts/qualities.html",
        "systems/sr5/templates/actors/_partials/header/navParts/skills.html",
        "systems/sr5/templates/actors/_partials/header/navParts/social.html",
        "systems/sr5/templates/actors/_partials/header/navParts/technomancer.html",
    
    // Actor sheet - Footers
    "systems/sr5/templates/actors/_partials/footer/footer.html",

      // Actor sheet - Footers partials
      "systems/sr5/templates/actors/_partials/footer/parts/monitor-edge.html",
      "systems/sr5/templates/actors/_partials/footer/parts/monitor-matrix.html",
      "systems/sr5/templates/actors/_partials/footer/parts/monitor-combined.html",
      "systems/sr5/templates/actors/_partials/footer/parts/monitor-physical.html",
      "systems/sr5/templates/actors/_partials/footer/parts/monitor-stun.html",
      "systems/sr5/templates/actors/_partials/footer/parts/drone-model.html",
      "systems/sr5/templates/actors/_partials/footer/parts/spirit-info.html",
      "systems/sr5/templates/actors/_partials/footer/parts/sprite-info.html",
      "systems/sr5/templates/actors/_partials/footer/parts/metatype-choice.html",

    //Left Tab - Core infos partials
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/attributes.html",
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/resistances.html",
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/defenses.html",
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/initiatives.html",
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/controlMode.html",

    //Left Tab - Derived partials
    "systems/sr5/templates/actors/_partials/left-tabs/derived/limits.html",
    "systems/sr5/templates/actors/_partials/left-tabs/derived/derivedAttributes.html",
    "systems/sr5/templates/actors/_partials/left-tabs/derived/essence.html",
    "systems/sr5/templates/actors/_partials/left-tabs/derived/carrying.html",
    "systems/sr5/templates/actors/_partials/left-tabs/derived/movement.html",

    //Left Tab - Magic user partials
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/type.html",
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/adeptPowerPoint.html",
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/tradition.html",
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/astral.html",
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/initiation.html",
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/reagents.html",

    //Left Tab - Matrix user partials
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/device.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/noDevice.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixAttributes.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/collection.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/noiseReduction.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/sharing.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/attack.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/sleaze.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/dataProcessing.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/firewall.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/overwatchScore.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixMonitor.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixPrograms.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixResistances.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/marks.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/marksControled.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/silentMode.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixInit.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/grid.html",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/pan.html",

    //Left Tab - Qualities partials
    "systems/sr5/templates/actors/_partials/left-tabs/qualities/qualities.html",
    "systems/sr5/templates/actors/_partials/left-tabs/qualities/visions.html",

    //Right Tab - Skills partials
    "systems/sr5/templates/actors/_partials/right-tabs/skills/activeSkills.html",
    "systems/sr5/templates/actors/_partials/right-tabs/skills/skillGroups.html",
    "systems/sr5/templates/actors/_partials/right-tabs/skills/knowledgeSkills.html",
    "systems/sr5/templates/actors/_partials/right-tabs/skills/languageSkills.html",

    //Right Tab - Combat partials
    "systems/sr5/templates/actors/_partials/right-tabs/combat/rangedWeapons.html",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/meleeWeapons.html",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/martialArts.html",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/spiritWeapons.html",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/grenades.html",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/armors.html",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/ammunitions.html",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/martialArts.html",

    //Right Tab - Gear partials
    "systems/sr5/templates/actors/_partials/right-tabs/gear/variousGear.html",
    "systems/sr5/templates/actors/_partials/right-tabs/gear/vehicles.html",
    "systems/sr5/templates/actors/_partials/right-tabs/gear/money.html",

    //Right Tab - Augmentations partials
    "systems/sr5/templates/actors/_partials/right-tabs/augmentation/augmentations.html",

    //Right Tab - Magic partials
    "systems/sr5/templates/actors/_partials/right-tabs/magic/spells.html",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/adeptPowers.html",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/summonedSpirits.html",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/foci.html",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/powers.html",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/metamagics.html",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/preparations.html",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/rituals.html",
    
    //Right Tab - Matrix partials
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/devices.html",
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/iceAttack.html",
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/programs.html",
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/matrixActions.html",
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/spritePowers.html",
    

    //Right Tab - Technomancer partials
    "systems/sr5/templates/actors/_partials/right-tabs/technomancer/resonanceActions.html",
    "systems/sr5/templates/actors/_partials/right-tabs/technomancer/complexForms.html",
    "systems/sr5/templates/actors/_partials/right-tabs/technomancer/sprites.html",
    "systems/sr5/templates/actors/_partials/right-tabs/technomancer/echoes.html",
    

    //Right Tab - Social partials
    "systems/sr5/templates/actors/_partials/right-tabs/social/contacts.html",
    "systems/sr5/templates/actors/_partials/right-tabs/social/lifestyles.html",
    "systems/sr5/templates/actors/_partials/right-tabs/social/sins.html",
    "systems/sr5/templates/actors/_partials/right-tabs/social/reputation.html",

    //Right Tab - Bio partials
    "systems/sr5/templates/actors/_partials/right-tabs/biography/biography.html",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/description.html",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/descriptionGrunt.html",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/background.html",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/karma.html",

    //Right Tab - Effects partials
    "systems/sr5/templates/actors/_partials/right-tabs/effects/externalEffects.html",

    //Right Tab - Drone
    "systems/sr5/templates/actors/_partials/right-tabs/droneStuff/droneRoll.html",
    "systems/sr5/templates/actors/_partials/right-tabs/droneStuff/modifications.html",
    

    /************************************************************************************* */
    /**                                ITEM PARTIALS                                    ** */
    /************************************************************************************* */

    // Item sheet headers
    "systems/sr5/templates/items/_partial/header/header.html",
    "systems/sr5/templates/items/_partial/header/header-simple.html",
    "systems/sr5/templates/items/_partial/header/header-noIcon.html",
    "systems/sr5/templates/items/_partial/header/header-noEffect.html",

    // Item sheet footers
    "systems/sr5/templates/items/_partial/footer/footer.html",
    "systems/sr5/templates/items/_partial/footer/footer-drone.html",
    "systems/sr5/templates/items/_partial/footer/footer-simple.html",
    
    // Item sheet effect tab
    "systems/sr5/templates/items/_partial/effect/effect.html",
    "systems/sr5/templates/items/_partial/effect/itemEffect.html",
    "systems/sr5/templates/items/_partial/effect/systemEffect.html",
    
    //Item sheet line titles
    "systems/sr5/templates/items/_partial/title/damage.html",
    "systems/sr5/templates/items/_partial/title/generalInformation.html",
    "systems/sr5/templates/items/_partial/title/spellInformation.html",
    "systems/sr5/templates/items/_partial/title/summary.html",

    //Item sheet summary
    "systems/sr5/templates/items/_partial/summary/_common/actionType-summary.html",
    "systems/sr5/templates/items/_partial/summary/_common/capacity-summary.html",
    "systems/sr5/templates/items/_partial/summary/_common/deviceRating-summary.html",
    "systems/sr5/templates/items/_partial/summary/_common/durationMagic-summary.html",
    "systems/sr5/templates/items/_partial/summary/_common/quantity-summary.html",
    "systems/sr5/templates/items/_partial/summary/_common/rangeMagic-summary.html",
    "systems/sr5/templates/items/_partial/summary/_common/rating-summary.html",
    "systems/sr5/templates/items/_partial/summary/_common/source-summary.html",

        //Specific summary
        "systems/sr5/templates/items/_partial/summary/ammunition-summary.html",
        "systems/sr5/templates/items/_partial/summary/adeptPower-summary.html",
        "systems/sr5/templates/items/_partial/summary/armor-summary.html",
        "systems/sr5/templates/items/_partial/summary/augmentation-summary.html",
        "systems/sr5/templates/items/_partial/summary/complexForm-summary.html",
        "systems/sr5/templates/items/_partial/summary/contact-summary.html",
        "systems/sr5/templates/items/_partial/summary/device-summary.html",
        "systems/sr5/templates/items/_partial/summary/drug-summary.html",
        "systems/sr5/templates/items/_partial/summary/focus-summary.html",
        "systems/sr5/templates/items/_partial/summary/lifestyle-summary.html",
        "systems/sr5/templates/items/_partial/summary/martialArt-summary.html",
        "systems/sr5/templates/items/_partial/summary/power-summary.html",
        "systems/sr5/templates/items/_partial/summary/preparation-summary.html",
        "systems/sr5/templates/items/_partial/summary/program-summary.html",
        "systems/sr5/templates/items/_partial/summary/quality-summary.html",
        "systems/sr5/templates/items/_partial/summary/sin-summary.html",
        "systems/sr5/templates/items/_partial/summary/spell-summary.html",
        "systems/sr5/templates/items/_partial/summary/spirit-summary.html",
        "systems/sr5/templates/items/_partial/summary/sprite-summary.html",
        "systems/sr5/templates/items/_partial/summary/vehicle-summary.html",
        "systems/sr5/templates/items/_partial/summary/vehicleMod-summary.html",
        "systems/sr5/templates/items/_partial/summary/weapon-summary.html",
        "systems/sr5/templates/items/_partial/summary/tradition-summary.html",
        "systems/sr5/templates/items/_partial/summary/ritual-summary.html",
        
    // Item sheet block editable
    "systems/sr5/templates/items/_partial/editable/_common/description-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/descriptionGameEffect-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/actionType-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/capacity-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/deviceRating-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/price-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/priceMultiplier-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/rating-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/concealabilityModifier-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/charge-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/magicType-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/magicRange-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/magicDuration-edit.html",
    "systems/sr5/templates/items/_partial/editable/_common/accessoryChoice-edit.html",

        //Adept power
        "systems/sr5/templates/items/_partial/editable/adeptPower/powerPointCost-edit.html",
        "systems/sr5/templates/items/_partial/editable/adeptPower/powerAction-edit.html",
        "systems/sr5/templates/items/_partial/editable/adeptPower/testComponent-edit.html",
        "systems/sr5/templates/items/_partial/editable/adeptPower/drain-edit.html",

        //Ammunition
        "systems/sr5/templates/items/_partial/editable/ammunition/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/ammunition/class-edit.html",
        "systems/sr5/templates/items/_partial/editable/ammunition/case-edit.html",

        //Armor
        "systems/sr5/templates/items/_partial/editable/armor/armorRating-edit.html",

        //Augmentation
        "systems/sr5/templates/items/_partial/editable/augmentation/category-edit.html",
        "systems/sr5/templates/items/_partial/editable/augmentation/essenceCost-edit.html",
        "systems/sr5/templates/items/_partial/editable/augmentation/grade-edit.html",
        "systems/sr5/templates/items/_partial/editable/augmentation/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/augmentation/cyberlimbsAttribute-edit.html",

        //Complex form
        "systems/sr5/templates/items/_partial/editable/complexForm/defenseTest-edit.html",
        "systems/sr5/templates/items/_partial/editable/complexForm/duration-edit.html",
        "systems/sr5/templates/items/_partial/editable/complexForm/fadingModifier-edit.html",
        "systems/sr5/templates/items/_partial/editable/complexForm/target-edit.html",

        //Contact
				"systems/sr5/templates/items/_partial/title/generalInformation.html",
        "systems/sr5/templates/items/_partial/editable/contact/connection-edit.html",
        "systems/sr5/templates/items/_partial/editable/contact/loyality-edit.html",
        "systems/sr5/templates/items/_partial/editable/contact/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/contact/metatype-edit.html",
        "systems/sr5/templates/items/_partial/editable/contact/gender-edit.html",
        "systems/sr5/templates/items/_partial/editable/contact/age-edit.html",
        "systems/sr5/templates/items/_partial/editable/contact/paymentMethod-edit.html",
        "systems/sr5/templates/items/_partial/editable/contact/hobby-edit.html",
        "systems/sr5/templates/items/_partial/editable/contact/familySituation-edit.html",
        
        //Device
        "systems/sr5/templates/items/_partial/editable/device/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/device/programMax-edit.html",
        "systems/sr5/templates/items/_partial/editable/device/attributesCollection-edit.html",
        "systems/sr5/templates/items/_partial/editable/device/commlinkModule-edit.html",
        "systems/sr5/templates/items/_partial/editable/device/commlinkDongle-edit.html",

        //Drugs
        "systems/sr5/templates/items/_partial/editable/drug/attributes-edit.html",
        "systems/sr5/templates/items/_partial/editable/drug/addiction-edit.html",

        //Focus
        "systems/sr5/templates/items/_partial/editable/focus/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/focus/subType-edit.html",
        "systems/sr5/templates/items/_partial/editable/focus/weaponLink-edit.html",

        //Karma
        "systems/sr5/templates/items/_partial/editable/karma/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/karma/amount-edit.html",

        //Knowledge
        "systems/sr5/templates/items/_partial/editable/knowledge/rating-edit.html",
        "systems/sr5/templates/items/_partial/editable/knowledge/type-edit.html",

        //Language
        "systems/sr5/templates/items/_partial/editable/language/rating-edit.html",
        "systems/sr5/templates/items/_partial/editable/language/native-edit.html",

        //Lifestyle
        "systems/sr5/templates/items/_partial/editable/lifestyle/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/lifestyle/rent-edit.html",
        "systems/sr5/templates/items/_partial/editable/lifestyle/linkedIdentity-edit.html",
        "systems/sr5/templates/items/_partial/editable/lifestyle/address-edit.html",
        "systems/sr5/templates/items/_partial/editable/lifestyle/options-edit.html",

        //Martial Arts
        "systems/sr5/templates/items/_partial/editable/martialArts/type-edit.html",

        //Nuyen
        "systems/sr5/templates/items/_partial/editable/nuyen/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/nuyen/amount-edit.html",

        //Power
        "systems/sr5/templates/items/_partial/editable/power/attributeTest-edit.html",
        "systems/sr5/templates/items/_partial/editable/power/defenseTest-edit.html",

        //Program
        "systems/sr5/templates/items/_partial/editable/program/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/program/autosoft-edit.html",

        //Quality
        "systems/sr5/templates/items/_partial/editable/quality/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/quality/karmaCost-edit.html",

        //Ritual
        "systems/sr5/templates/items/_partial/editable/ritual/details-edit.html",
        "systems/sr5/templates/items/_partial/editable/ritual/duration-edit.html",

        //Sin
        "systems/sr5/templates/items/_partial/editable/sin/nationality-edit.html",
        "systems/sr5/templates/items/_partial/editable/sin/familySituation-edit.html",
        "systems/sr5/templates/items/_partial/editable/sin/licenses-edit.html",

        //Spell
        "systems/sr5/templates/items/_partial/editable/spell/category-edit.html",
        "systems/sr5/templates/items/_partial/editable/spell/drainModifier-edit.html",
        "systems/sr5/templates/items/_partial/editable/spell/fetish-edit.html",
        "systems/sr5/templates/items/_partial/editable/spell/preparation-edit.html",
        "systems/sr5/templates/items/_partial/editable/spell/defenseTest-edit.html",
        "systems/sr5/templates/items/_partial/editable/spell/quickening-edit.html",

        //Spirit
        "systems/sr5/templates/items/_partial/editable/spirit/force-edit.html",
        "systems/sr5/templates/items/_partial/editable/spirit/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/spirit/serviceMax-edit.html",
        "systems/sr5/templates/items/_partial/editable/spirit/bound-edit.html",
        "systems/sr5/templates/items/_partial/editable/spirit/optionalPowers-edit.html",
        "systems/sr5/templates/items/_partial/editable/spirit/spellSustain-edit.html",

        //Sprite
        "systems/sr5/templates/items/_partial/editable/sprite/level-edit.html",
        "systems/sr5/templates/items/_partial/editable/sprite/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/sprite/taskMax-edit.html",
        "systems/sr5/templates/items/_partial/editable/sprite/registered-edit.html",
        "systems/sr5/templates/items/_partial/editable/sprite/complexFormSustain-edit.html",

        //Tradition
        "systems/sr5/templates/items/_partial/editable/tradition/drain-edit.html",
        "systems/sr5/templates/items/_partial/editable/tradition/spirits-edit.html",
        "systems/sr5/templates/items/_partial/editable/tradition/possession-edit.html",

        //Preparation
        "systems/sr5/templates/items/_partial/editable/preparation/lynchpin-edit.html",
        "systems/sr5/templates/items/_partial/editable/preparation/trigger-edit.html",
        "systems/sr5/templates/items/_partial/editable/preparation/potency-edit.html",
        "systems/sr5/templates/items/_partial/editable/preparation/force-edit.html",

        //Sprite Power
        "systems/sr5/templates/items/_partial/editable/spritePower/attributeTest-edit.html",
        "systems/sr5/templates/items/_partial/editable/spritePower/defenseTest-edit.html",

        //Vehicle
        "systems/sr5/templates/items/_partial/editable/vehicle/category-edit.html",
        "systems/sr5/templates/items/_partial/editable/vehicle/type-edit.html",
        "systems/sr5/templates/items/_partial/editable/vehicle/skill-edit.html",
        "systems/sr5/templates/items/_partial/editable/vehicle/attributes-edit.html",
        "systems/sr5/templates/items/_partial/editable/vehicle/items-edit.html",

        //Vehicle modifications
        "systems/sr5/templates/items/_partial/editable/vehicleMod/category-edit.html",
        "systems/sr5/templates/items/_partial/editable/vehicleMod/skill-edit.html",
        "systems/sr5/templates/items/_partial/editable/vehicleMod/slot-edit.html",        
        "systems/sr5/templates/items/_partial/editable/vehicleMod/tools-edit.html",
        "systems/sr5/templates/items/_partial/editable/vehicleMod/threshold-edit.html",
        "systems/sr5/templates/items/_partial/editable/vehicleMod/weaponMount-edit.html",        
        "systems/sr5/templates/items/_partial/editable/vehicleMod/priceMultiplierVehicleMod-edit.html",

        //Weapon
        "systems/sr5/templates/items/_partial/editable/weapon/accessories-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/accuracy-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/aerodynamic-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/ammunitionMax-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/ammunitionType-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/armorPenetration-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/blast-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/category-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/damage-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/firingModes-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/range-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/reach-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/recoilCompensation-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/reloadingMethod-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/requiredHands-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/skill-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/toxin-edit.html",
        "systems/sr5/templates/items/_partial/editable/weapon/type-edit.html",

    /************************************************************************************* */
    /**                                DIALOG PARTIALS                                    ** */
    /************************************************************************************* */
    "systems/sr5/templates/rolls/rollDialogPartial/dicePool.html",
    "systems/sr5/templates/rolls/rollDialogPartial/woundModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/specializationModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/firingModeModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/recoilModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/attackRangeModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/environmentalModifiers.html",
    "systems/sr5/templates/rolls/rollDialogPartial/attributeChoice.html",
    "systems/sr5/templates/rolls/rollDialogPartial/force.html",
    "systems/sr5/templates/rolls/rollDialogPartial/summoningModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseRangedModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseMeleeModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseActiveModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseCumulativeModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseFullModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/coverModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/markModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/matrixNoiseModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/compileSpriteModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/extendedTest.html",
    "systems/sr5/templates/rolls/rollDialogPartial/resistPhysicalDamage.html",
    "systems/sr5/templates/rolls/rollDialogPartial/limit.html",
    "systems/sr5/templates/rolls/rollDialogPartial/ammo.html",
    "systems/sr5/templates/rolls/rollDialogPartial/backgroundCountModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/preparationTrigger.html",
    "systems/sr5/templates/rolls/rollDialogPartial/level.html",
    "systems/sr5/templates/rolls/rollDialogPartial/fading.html",
    "systems/sr5/templates/rolls/rollDialogPartial/fadingBase.html",
    "systems/sr5/templates/rolls/rollDialogPartial/drain.html",
    "systems/sr5/templates/rolls/rollDialogPartial/drainBase.html",
    "systems/sr5/templates/rolls/rollDialogPartial/recklessSpellcasting.html",
    "systems/sr5/templates/rolls/rollDialogPartial/perceptionType.html",
    "systems/sr5/templates/rolls/rollDialogPartial/signature.html",
    "systems/sr5/templates/rolls/rollDialogPartial/sensorLock.html",
    "systems/sr5/templates/rolls/rollDialogPartial/matrixGrid.html",
    "systems/sr5/templates/rolls/rollDialogPartial/matrixTargetGrid.html",
    "systems/sr5/templates/rolls/rollDialogPartial/matrixSearch.html",
    "systems/sr5/templates/rolls/rollDialogPartial/chooseTargetEffect.html",
    "systems/sr5/templates/rolls/rollDialogPartial/reagents.html",
    "systems/sr5/templates/rolls/rollDialogPartial/spiritAid.html",
    "systems/sr5/templates/rolls/rollDialogPartial/targetTypeModifier.html",
    "systems/sr5/templates/rolls/rollDialogPartial/objectResistanceChoice.html",
    "systems/sr5/templates/rolls/rollDialogPartial/astralDamageType.html",
    "systems/sr5/templates/rolls/rollDialogPartial/centering.html",
    "systems/sr5/templates/rolls/rollDialogPartial/spellShaping.html",
    "systems/sr5/templates/rolls/rollDialogPartial/manaBarrierRating.html",


    /************************************************************************************* */
    /**                             CHATCARDS PARTIALS                                    **/
    /************************************************************************************* */
    "systems/sr5/templates/rolls/rollCardPartial/dicePoolRoll.html",
    "systems/sr5/templates/rolls/rollCardPartial/attackRoll.html",
    "systems/sr5/templates/rolls/rollCardPartial/drainRoll.html",
    "systems/sr5/templates/rolls/rollCardPartial/limitRoll.html",
    "systems/sr5/templates/rolls/rollCardPartial/summoningRoll.html",
    "systems/sr5/templates/rolls/rollCardPartial/matrixDamageRoll.html",
    "systems/sr5/templates/rolls/rollCardPartial/assensingRoll.html",
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
