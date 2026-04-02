/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [

    // Common sheet partials - Header icons
    "systems/sr5/assets/img/icons/nav-attributes.svg",
    "systems/sr5/assets/img/icons/nav-augmentations.svg",
    "systems/sr5/assets/img/icons/nav-bio.svg",
    "systems/sr5/assets/img/icons/nav-configuration.svg",
    "systems/sr5/assets/img/icons/nav-contacts.svg",
    "systems/sr5/assets/img/icons/nav-deck.svg",
    "systems/sr5/assets/img/icons/nav-derived.svg",
    "systems/sr5/assets/img/icons/nav-gear.svg",
    "systems/sr5/assets/img/icons/nav-information.svg",
    "systems/sr5/assets/img/icons/nav-magic.svg",
    "systems/sr5/assets/img/icons/nav-matrix.svg",
    "systems/sr5/assets/img/icons/nav-modifiers.svg",
    "systems/sr5/assets/img/icons/nav-qualities.svg",
    "systems/sr5/assets/img/icons/nav-skills.svg",
    "systems/sr5/assets/img/icons/nav-spells.svg",
    "systems/sr5/assets/img/icons/nav-weapons.svg",
    "systems/sr5/assets/img/icons/nav-materialize.svg",
    "systems/sr5/assets/img/icons/nav-dismiss.svg",
    "systems/sr5/assets/img/icons/nav-link.svg",

    /***************************************************************** */
    /**                      ACTOR PARTIALS                         ** */
    /***************************************************************** */

    // Dynamic layout templates (SR6-style block system)
    "systems/sr5/templates/actors/_partials/content.hbs",
    "systems/sr5/templates/actors/_partials/nav.hbs",

    // Sheet config dialog
    "systems/sr5/templates/interface/sheet-config.hbs",
    "systems/sr5/templates/interface/compendium-browser.hbs",

    // Actor sheet - Headers
    "systems/sr5/templates/actors/_partials/header/header.hbs",

    // Actor sheet - Headers - Navigation hub
    "systems/sr5/templates/actors/_partials/header/nav/actorPC.hbs",
    "systems/sr5/templates/actors/_partials/header/nav/actorDevice.hbs",
    "systems/sr5/templates/actors/_partials/header/nav/actorDrone.hbs",
    "systems/sr5/templates/actors/_partials/header/nav/actorGrunt.hbs",
    "systems/sr5/templates/actors/_partials/header/nav/actorSpirit.hbs",
    "systems/sr5/templates/actors/_partials/header/nav/actorSprite.hbs",
    "systems/sr5/templates/actors/_partials/header/nav/actorAgent.hbs",

    // Actor sheet - Headers - Navigation parts
    "systems/sr5/templates/actors/_partials/header/navParts/coreInfos.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/augmentation.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/biography.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/combat.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/derived.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/gear.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/magic.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/magicUser.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/matrix.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/matrixUser.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/modification.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/qualities.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/skills.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/social.hbs",
    "systems/sr5/templates/actors/_partials/header/navParts/technomancer.hbs",
		
    // Actor sheet - Footers
    "systems/sr5/templates/actors/_partials/footer/footer.hbs",

    // Actor sheet - Footers partials
    "systems/sr5/templates/actors/_partials/footer/parts/monitor-edge.hbs",
    "systems/sr5/templates/actors/_partials/footer/parts/monitor-matrix.hbs",
    "systems/sr5/templates/actors/_partials/footer/parts/monitor-combined.hbs",
    "systems/sr5/templates/actors/_partials/footer/parts/monitor-physical.hbs",
    "systems/sr5/templates/actors/_partials/footer/parts/monitor-stun.hbs",
    "systems/sr5/templates/actors/_partials/footer/parts/drone-model.hbs",
    "systems/sr5/templates/actors/_partials/footer/parts/spirit-info.hbs",
    "systems/sr5/templates/actors/_partials/footer/parts/sprite-info.hbs",
    "systems/sr5/templates/actors/_partials/footer/parts/metatype-choice.hbs",

    //Left Tab - Core infos partials
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/attributes.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/resistances.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/defenses.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/initiatives.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/coreInfos/controlMode.hbs",

    //Left Tab - Derived partials
    "systems/sr5/templates/actors/_partials/left-tabs/derived/limits.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/derived/derivedAttributes.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/derived/essence.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/derived/carrying.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/derived/movement.hbs",

    //Left Tab - Magic user partials
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/type.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/adeptPowerPoint.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/tradition.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/astral.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/magicUser/reagents.hbs",

    //Left Tab - Matrix user partials
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/device.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/noDevice.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixAttributes.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/collection.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/noiseReduction.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/sharing.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/attack.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/sleaze.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/dataProcessing.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/attributes/firewall.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/overwatchScore.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixMonitor.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixPrograms.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixResistances.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/marks.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/marksControled.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/silentMode.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/matrixInit.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/grid.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/pan.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/matrixUser/maglockType.hbs",

    //Left Tab - Qualities partials
    "systems/sr5/templates/actors/_partials/left-tabs/qualities/qualities.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/qualities/visions.hbs",
    "systems/sr5/templates/actors/_partials/left-tabs/qualities/addictions.hbs",

    //Right Tab - Skills partials
    "systems/sr5/templates/actors/_partials/right-tabs/skills/activeSkills.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/skills/skillGroups.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/skills/knowledgeSkills.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/skills/languageSkills.hbs",

    //Right Tab - Combat partials
    "systems/sr5/templates/actors/_partials/right-tabs/combat/rangedWeapons.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/meleeWeapons.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/martialArts.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/spiritWeapons.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/grenades.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/weaponAccessories.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/armors.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/ammunitions.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/combat/martialArts.hbs",

    //Right Tab - Gear partials
    "systems/sr5/templates/actors/_partials/right-tabs/gear/variousGear.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/gear/vehicles.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/gear/money.hbs",

    //Right Tab - Augmentations partials
    "systems/sr5/templates/actors/_partials/right-tabs/augmentation/augmentations.hbs",

    //Right Tab - Magic partials
    "systems/sr5/templates/actors/_partials/right-tabs/magic/spells.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/adeptPowers.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/summonedSpirits.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/foci.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/powers.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/metamagics.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/preparations.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/magic/rituals.hbs",
		
    //Right Tab - Matrix partials
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/devices.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/iceAttack.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/programs.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/matrixActions.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/spritePowers.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/matrix/description.hbs",


    //Right Tab - Technomancer partials
    "systems/sr5/templates/actors/_partials/right-tabs/technomancer/resonanceActions.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/technomancer/complexForms.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/technomancer/sprites.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/technomancer/echoes.hbs",
		

    //Right Tab - Social partials
    "systems/sr5/templates/actors/_partials/right-tabs/social/contacts.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/social/lifestyles.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/social/sins.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/social/reputation.hbs",

    //Right Tab - Bio partials
    "systems/sr5/templates/actors/_partials/right-tabs/biography/biography.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/critterBiography.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/description.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/descriptionGrunt.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/biographyContact.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/background.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/biography/karma.hbs",

    //Right Tab - Effects partials
    "systems/sr5/templates/actors/_partials/right-tabs/effects/externalEffects.hbs",

    //Right Tab - Drone
    "systems/sr5/templates/actors/_partials/right-tabs/droneStuff/droneRoll.hbs",
    "systems/sr5/templates/actors/_partials/right-tabs/droneStuff/modifications.hbs",
		

    /************************************************************************************* */
    /**                                ITEM PARTIALS                                    ** */
    /************************************************************************************* */

    // Item sheet — dynamic layout
    "systems/sr5/templates/items/_partials/item-header.hbs",

    // Item block templates (summary + stat blocks)
    "systems/sr5/templates/items/blocks/adeptPower/adeptPower-stat.hbs",
    "systems/sr5/templates/items/blocks/adeptPower/adeptPower-summary.hbs",
    "systems/sr5/templates/items/blocks/ammunition/ammunition-stat.hbs",
    "systems/sr5/templates/items/blocks/ammunition/ammunition-summary.hbs",
    "systems/sr5/templates/items/blocks/armor/armor-stat.hbs",
    "systems/sr5/templates/items/blocks/armor/armor-summary.hbs",
    "systems/sr5/templates/items/blocks/augmentation/augmentation-stat.hbs",
    "systems/sr5/templates/items/blocks/augmentation/augmentation-summary.hbs",
    "systems/sr5/templates/items/blocks/complexForm/complexForm-stat.hbs",
    "systems/sr5/templates/items/blocks/complexForm/complexForm-summary.hbs",
    "systems/sr5/templates/items/blocks/contact/contact-stat.hbs",
    "systems/sr5/templates/items/blocks/contact/contact-summary.hbs",
    "systems/sr5/templates/items/blocks/device/device-stat.hbs",
    "systems/sr5/templates/items/blocks/device/device-summary.hbs",
    "systems/sr5/templates/items/blocks/drug/drug-stat.hbs",
    "systems/sr5/templates/items/blocks/drug/drug-summary.hbs",
    "systems/sr5/templates/items/blocks/echo/echo-summary.hbs",
    "systems/sr5/templates/items/blocks/effect/effect-summary.hbs",
    "systems/sr5/templates/items/blocks/focus/focus-stat.hbs",
    "systems/sr5/templates/items/blocks/focus/focus-summary.hbs",
    "systems/sr5/templates/items/blocks/gear/gear-stat.hbs",
    "systems/sr5/templates/items/blocks/gear/gear-summary.hbs",
    "systems/sr5/templates/items/blocks/karma/karma-summary.hbs",
    "systems/sr5/templates/items/blocks/knowledge/knowledge-summary.hbs",
    "systems/sr5/templates/items/blocks/language/language-summary.hbs",
    "systems/sr5/templates/items/blocks/lifestyle/lifestyle-stat.hbs",
    "systems/sr5/templates/items/blocks/lifestyle/lifestyle-summary.hbs",
    "systems/sr5/templates/items/blocks/mark/mark-summary.hbs",
    "systems/sr5/templates/items/blocks/martialArt/martialArt-stat.hbs",
    "systems/sr5/templates/items/blocks/martialArt/martialArt-summary.hbs",
    "systems/sr5/templates/items/blocks/metamagic/metamagic-summary.hbs",
    "systems/sr5/templates/items/blocks/nuyen/nuyen-summary.hbs",
    "systems/sr5/templates/items/blocks/reputation/reputation-summary.hbs",
    "systems/sr5/templates/items/blocks/power/power-stat.hbs",
    "systems/sr5/templates/items/blocks/power/power-summary.hbs",
    "systems/sr5/templates/items/blocks/preparation/preparation-stat.hbs",
    "systems/sr5/templates/items/blocks/preparation/preparation-summary.hbs",
    "systems/sr5/templates/items/blocks/program/program-stat.hbs",
    "systems/sr5/templates/items/blocks/program/program-summary.hbs",
    "systems/sr5/templates/items/blocks/quality/quality-stat.hbs",
    "systems/sr5/templates/items/blocks/quality/quality-summary.hbs",
    "systems/sr5/templates/items/blocks/ritual/ritual-stat.hbs",
    "systems/sr5/templates/items/blocks/ritual/ritual-summary.hbs",
    "systems/sr5/templates/items/blocks/sin/sin-stat.hbs",
    "systems/sr5/templates/items/blocks/sin/sin-summary.hbs",
    "systems/sr5/templates/items/blocks/spell/spell-stat.hbs",
    "systems/sr5/templates/items/blocks/spell/spell-summary.hbs",
    "systems/sr5/templates/items/blocks/spirit/spirit-stat.hbs",
    "systems/sr5/templates/items/blocks/spirit/spirit-summary.hbs",
    "systems/sr5/templates/items/blocks/sprite/sprite-stat.hbs",
    "systems/sr5/templates/items/blocks/sprite/sprite-summary.hbs",
    "systems/sr5/templates/items/blocks/spritePower/spritePower-stat.hbs",
    "systems/sr5/templates/items/blocks/spritePower/spritePower-summary.hbs",
    "systems/sr5/templates/items/blocks/tradition/tradition-stat.hbs",
    "systems/sr5/templates/items/blocks/tradition/tradition-summary.hbs",
    "systems/sr5/templates/items/blocks/vehicle/vehicle-stat.hbs",
    "systems/sr5/templates/items/blocks/vehicle/vehicle-summary.hbs",
    "systems/sr5/templates/items/blocks/vehicleMod/vehicleMod-stat.hbs",
    "systems/sr5/templates/items/blocks/vehicleMod/vehicleMod-summary.hbs",
    "systems/sr5/templates/items/blocks/vierge/vierge-stat.hbs",
    "systems/sr5/templates/items/blocks/vierge/vierge-summary.hbs",
    "systems/sr5/templates/items/blocks/weapon/weapon-stat.hbs",
    "systems/sr5/templates/items/blocks/weapon/weapon-summary.hbs",

    // Item sheet headers (legacy)
    "systems/sr5/templates/items/_partial/header/header.hbs",
    "systems/sr5/templates/items/_partial/header/header-simple.hbs",
    "systems/sr5/templates/items/_partial/header/header-noIcon.hbs",
    "systems/sr5/templates/items/_partial/header/header-noEffect.hbs",

    // Item sheet footers
    "systems/sr5/templates/items/_partial/footer/footer.hbs",
    "systems/sr5/templates/items/_partial/footer/footer-drone.hbs",
    "systems/sr5/templates/items/_partial/footer/footer-simple.hbs",
		
    // Item sheet effect tab
    "systems/sr5/templates/items/_partial/effect/effect.hbs",
    "systems/sr5/templates/items/_partial/effect/itemEffect.hbs",
    "systems/sr5/templates/items/_partial/effect/systemEffect.hbs",
		
    //Item sheet line titles
    "systems/sr5/templates/items/_partial/title/damage.hbs",
    "systems/sr5/templates/items/_partial/title/generalInformation.hbs",
    "systems/sr5/templates/items/_partial/title/spellInformation.hbs",
    "systems/sr5/templates/items/_partial/title/summary.hbs",

    //Item sheet summary
    "systems/sr5/templates/items/_partial/summary/_common/actionType-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/_common/capacity-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/_common/deviceRating-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/_common/durationMagic-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/_common/quantity-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/_common/rangeMagic-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/_common/rating-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/_common/source-summary.hbs",

    //Specific summary
    "systems/sr5/templates/items/_partial/summary/ammunition-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/adeptPower-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/armor-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/augmentation-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/complexForm-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/contact-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/device-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/drug-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/focus-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/lifestyle-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/martialArt-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/power-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/preparation-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/program-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/quality-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/sin-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/spell-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/spirit-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/sprite-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/vehicle-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/vehicleMod-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/weapon-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/tradition-summary.hbs",
    "systems/sr5/templates/items/_partial/summary/ritual-summary.hbs",
				
    // Item sheet block editable
    "systems/sr5/templates/items/_partial/editable/_common/description-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/descriptionGameEffect-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/actionType-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/capacity-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/deviceRating-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/price-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/priceMultiplier-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/rating-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/concealabilityModifier-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/charge-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/magicType-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/magicRange-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/magicDuration-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/accessoryChoice-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/_common/testRoll-edit.hbs",

    //Adept power
    "systems/sr5/templates/items/_partial/editable/adeptPower/powerPointCost-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/adeptPower/powerAction-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/adeptPower/testComponent-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/adeptPower/drain-edit.hbs",

    //Ammunition
    "systems/sr5/templates/items/_partial/editable/ammunition/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/ammunition/class-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/ammunition/case-edit.hbs",
    //Armor
    "systems/sr5/templates/items/_partial/editable/armor/armorRating-edit.hbs",

    //Augmentation
    "systems/sr5/templates/items/_partial/editable/augmentation/category-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/augmentation/essenceCost-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/augmentation/grade-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/augmentation/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/augmentation/cyberlimbsAttribute-edit.hbs",

    //Complex form
    "systems/sr5/templates/items/_partial/editable/complexForm/defenseTest-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/complexForm/duration-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/complexForm/fadingModifier-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/complexForm/target-edit.hbs",

    //Contact
    "systems/sr5/templates/items/_partial/title/generalInformation.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/connection-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/loyality-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/metatype-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/gender-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/age-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/paymentMethod-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/hobby-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/familySituation-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/contact/items-edit.hbs",
				
    //Device
    "systems/sr5/templates/items/_partial/editable/device/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/device/programMax-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/device/attributesCollection-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/device/commlinkModule-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/device/commlinkDongle-edit.hbs",

    //Drugs
    "systems/sr5/templates/items/_partial/editable/drug/attributes-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/drug/addiction-edit.hbs",
				
    //Focus
    "systems/sr5/templates/items/_partial/editable/focus/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/focus/subType-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/focus/weaponLink-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/focus/adeptPowerLink-edit.hbs",

    //Karma
    "systems/sr5/templates/items/_partial/editable/karma/date-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/karma/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/karma/amount-edit.hbs",

    //Knowledge
    "systems/sr5/templates/items/_partial/editable/knowledge/rating-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/knowledge/type-edit.hbs",

    //Language
    "systems/sr5/templates/items/_partial/editable/language/rating-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/language/native-edit.hbs",

    //Lifestyle
    "systems/sr5/templates/items/_partial/editable/lifestyle/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/lifestyle/rent-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/lifestyle/linkedIdentity-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/lifestyle/address-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/lifestyle/categories-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/lifestyle/options-edit.hbs",

    //Martial Arts
    "systems/sr5/templates/items/_partial/editable/martialArts/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/martialArts/martialAction-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/martialArts/attributeTest-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/martialArts/defenseTest-edit.hbs",        

    //Nuyen
    "systems/sr5/templates/items/_partial/editable/nuyen/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/nuyen/amount-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/nuyen/date-edit.hbs",

    //Reputation
    "systems/sr5/templates/items/_partial/editable/reputation/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/reputation/category-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/reputation/amount-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/reputation/date-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/reputation/gameDate-edit.hbs",

    //Power
    "systems/sr5/templates/items/_partial/editable/power/attributeTest-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/power/defenseTest-edit.hbs",

    //Program
    "systems/sr5/templates/items/_partial/editable/program/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/program/autosoft-edit.hbs",

    //Quality
    "systems/sr5/templates/items/_partial/editable/quality/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/quality/karmaCost-edit.hbs",

    //Ritual
    "systems/sr5/templates/items/_partial/editable/ritual/details-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/ritual/duration-edit.hbs",

    //Sin
    "systems/sr5/templates/items/_partial/editable/sin/nationality-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/sin/familySituation-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/sin/licenses-edit.hbs",

    //Spell
    "systems/sr5/templates/items/_partial/editable/spell/category-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spell/drainModifier-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spell/fetish-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spell/preparation-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spell/defenseTest-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spell/quickening-edit.hbs",

    //Spirit
    "systems/sr5/templates/items/_partial/editable/spirit/force-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spirit/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spirit/serviceMax-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spirit/bound-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spirit/optionalPowers-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spirit/spellSustain-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spirit/powers.hbs",

    //Sprite
    "systems/sr5/templates/items/_partial/editable/sprite/level-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/sprite/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/sprite/taskMax-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/sprite/registered-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/sprite/complexFormSustain-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/sprite/spritePowers.hbs",
    "systems/sr5/templates/items/_partial/editable/sprite/optionalPowers-edit.hbs",

    //Tradition
    "systems/sr5/templates/items/_partial/editable/tradition/drain-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/tradition/spirits-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/tradition/possession-edit.hbs",

    //Preparation
    "systems/sr5/templates/items/_partial/editable/preparation/lynchpin-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/preparation/trigger-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/preparation/potency-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/preparation/force-edit.hbs",

    //Sprite Power
    "systems/sr5/templates/items/_partial/editable/spritePower/attributeTest-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/spritePower/defenseTest-edit.hbs",

    //Vehicle
    "systems/sr5/templates/items/_partial/editable/vehicle/category-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/vehicle/type-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/vehicle/skill-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/vehicle/attributes-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/vehicle/items-edit.hbs",

    //Vehicle modifications
    "systems/sr5/templates/items/_partial/editable/vehicleMod/category-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/vehicleMod/skill-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/vehicleMod/slot-edit.hbs",        
    "systems/sr5/templates/items/_partial/editable/vehicleMod/tools-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/vehicleMod/threshold-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/vehicleMod/priceMultiplierVehicleMod-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/vehicleMod/weaponMount-edit.hbs",
				
    //Weapon
    "systems/sr5/templates/items/_partial/editable/weapon/accessories-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/accuracy-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/aerodynamic-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/ammunitionMax-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/ammunitionType-edit.hbs",        
    "systems/sr5/templates/items/_partial/editable/weapon/ammunitionRating-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/armorPenetration-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/blast-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/category-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/damage-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/firingModes-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/chokeSettings-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/range-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/reach-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/recoilCompensation-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/reloadingMethod-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/requiredHands-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/skill-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/toxin-edit.hbs",
    "systems/sr5/templates/items/_partial/editable/weapon/type-edit.hbs",

    /************************************************************************************* */
    /**                                DIALOG PARTIALS                                    ** */
    /************************************************************************************* */
    "systems/sr5/templates/rolls/rollDialogPartial/dicePool.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/modifiers.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/customModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/woundModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/specializationModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/firingModeModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/recoilModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/attackRangeModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/chokeSettingsModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/attributeChoice.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/force.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/summoningModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseRangedModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseMeleeModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseActiveModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseFullModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/coverModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/markModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/matrixNoiseModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/compileSpriteModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/extendedTest.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/limit.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/ammo.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/backgroundCountModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/preparationTrigger.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/level.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/fading.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/fadingBase.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/drain.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/drainBase.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/recklessSpellcasting.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/perceptionType.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/signature.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/matrixGrid.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/matrixTargetGrid.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/matrixSearchThreshold.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/chooseTargetEffect.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/reagents.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/spiritAidCommand.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/spiritAidModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/targetTypeModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/objectResistanceChoice.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/astralDamageType.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/centering.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/spellShaping.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/manaBarrierRating.hbs",    
    "systems/sr5/templates/rolls/rollDialogPartial/rammingOptions.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/calledShots.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/manaBarrierRating.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/healingModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/escapeArtistModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/escapeArtistThreshold.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/perceptionThreshold.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/survivalModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/survivalThreshold.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/socialModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/buildingModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/spellOptions.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/preparationFormulaOptions.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/ritualOptions.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/summoningOptions.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/complexFormOptions.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/resonanceActionsOptions.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseOptions.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/matrixActionsOptions.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/meleeModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/attackRangedModifier.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/defenseRangedModifiers.hbs",
    "systems/sr5/templates/rolls/rollDialogPartial/meleeOptions.hbs",


    /************************************************************************************* */
    /**                             CHATCARDS PARTIALS                                    **/
    /************************************************************************************* */
    "systems/sr5/templates/rolls/rollCardPartial/dicePoolRoll.hbs",
    "systems/sr5/templates/rolls/rollCardPartial/attackRoll.hbs",
    "systems/sr5/templates/rolls/rollCardPartial/drainRoll.hbs",
    "systems/sr5/templates/rolls/rollCardPartial/limitRoll.hbs",
    "systems/sr5/templates/rolls/rollCardPartial/summoningRoll.hbs",
    "systems/sr5/templates/rolls/rollCardPartial/matrixDamageRoll.hbs",
    "systems/sr5/templates/rolls/rollCardPartial/assensingRoll.hbs",
    "systems/sr5/templates/rolls/rollCardPartial/threshold.hbs",
    "systems/sr5/templates/rolls/rollCardPartial/actions.hbs",
  ]

  // SVG icons need manual registration as Handlebars partials
  // (loadTemplates may skip non-.hbs/.hbs extensions)
  const svgPaths = templatePaths.filter(p => p.endsWith('.svg'))
  const otherPaths = templatePaths.filter(p => !p.endsWith('.svg'))

  // Register SVG partials manually
  await Promise.all(svgPaths.map(async (path) => {
    const resp = await fetch(path)
    if (resp.ok) {
      const text = await resp.text()
      Handlebars.registerPartial(path, text)
    }
  }))

  // Load the rest normally
  return foundry.applications.handlebars.loadTemplates(otherPaths)
}
