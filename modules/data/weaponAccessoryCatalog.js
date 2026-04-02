/**
 * Weapon Accessory Catalog
 *
 * Each entry maps the legacy accessory key to its item data.
 * Fields:
 *   price           — fixed price (0 if free or price-relative)
 *   priceMultiplier — multiplier of parent weapon's base price (0 = use fixed price)
 *   slot            — default slot ("top","underneath","side","internal","barrel","stock","")
 *   type            — accessory type ("accessory","modification","trait")
 *   itemEffects     — array of modifier effects applied to the parent weapon
 *                     { target, type:"value", value, name (i18n key), wifi, cumulative }
 *   systemEffects   — array of special-case flags for complex logic
 *                     { value: "smartgunInternal"|"smartgunExternal"|"overclocked"|... }
 *
 * Effect targets use paths relative to weapon system data:
 *   system.recoilCompensation, system.accuracy, system.concealment,
 *   system.damageValue, system.weaponSkill, system.availability, system.price
 */

export const WEAPON_ACCESSORY_CATALOG = {

  // ── Price-only accessories (no game effects) ──────────────────────

  additionalClipMagazine:   {
    price: 0, priceMultiplier: 1, slot: "side", type: "accessory" 
  },
  advancedSafetySystem:     {
    price: 600, slot: "", type: "accessory" 
  },
  advancedSafetySystemElec: {
    price: 950, slot: "", type: "accessory" 
  },
  advancedSafetySystemExSD: {
    price: 1000, slot: "", type: "accessory" 
  },
  advancedSafetySystemImmo: {
    price: 700, slot: "", type: "accessory" 
  },
  advancedSafetySystemSelfD:{
    price: 800, slot: "", type: "accessory" 
  },
  airburstLink:             {
    price: 600, slot: "", type: "accessory" 
  },
  ammoSkipSystem:           {
    price: 250, slot: "underneath", type: "accessory" 
  },
  batteryBackPack:          {
    price: 2500, slot: "", type: "accessory" 
  },
  batteryClip:              {
    price: 400, slot: "", type: "accessory" 
  },
  batteryPack:              {
    price: 900, slot: "", type: "accessory" 
  },
  bayonet:                  {
    price: 50, slot: "", type: "accessory" 
  },
  capBall:                  {
    price: 0, slot: "", type: "accessory" 
  },
  ceramicPlasteelCompo1:    {
    price: 0, priceMultiplier: 1, slot: "", type: "modification" 
  },
  ceramicPlasteelCompo2:    {
    price: 0, priceMultiplier: 2, slot: "", type: "modification" 
  },
  ceramicPlasteelCompo3:    {
    price: 0, priceMultiplier: 3, slot: "", type: "modification" 
  },
  ceramicPlasteelCompo4:    {
    price: 0, priceMultiplier: 4, slot: "", type: "modification" 
  },
  ceramicPlasteelCompo5:    {
    price: 0, priceMultiplier: 5, slot: "", type: "modification" 
  },
  ceramicPlasteelCompo6:    {
    price: 0, priceMultiplier: 6, slot: "", type: "modification" 
  },
  customLook:               {
    price: 300, slot: "", type: "modification" 
  },
  easyBreakdownManual:      {
    price: 750, slot: "side", type: "modification" 
  },
  easyBreakdownPowered:     {
    price: 1250, slot: "side", type: "modification" 
  },
  explosiveClip:            {
    price: 20, slot: "", type: "accessory" 
  },
  extendedClip1:            {
    price: 35, slot: "", type: "accessory" 
  },
  extendedClip2:            {
    price: 35, slot: "", type: "accessory" 
  },
  extremeEnvironment:       {
    price: 1500, slot: "", type: "modification" 
  },
  flashLight:               {
    price: 50, slot: "", type: "accessory" 
  },
  geckoGrip:                {
    price: 100, slot: "", type: "accessory" 
  },
  guncam:                   {
    price: 350, slot: "", type: "accessory" 
  },
  improvedRangeFinder:      {
    price: 2000, slot: "", type: "accessory" 
  },
  krimePack:                {
    price: 500, slot: "", type: "accessory" 
  },
  krimeStunONet:            {
    price: 800, slot: "underneath", type: "accessory" 
  },
  longbarrel:               {
    price: 0, priceMultiplier: 1, slot: "barrel", type: "modification" 
  },
  meleeHardening:           {
    price: 300, slot: "", type: "modification" 
  },
  mountedCrossbow:          {
    price: 1000, slot: "", type: "accessory" 
  },
  narcojectDazzler:         {
    price: 1000, slot: "top", type: "accessory" 
  },
  periscope:                {
    price: 70, slot: "", type: "accessory" 
  },
  quickDrawHolster:         {
    price: 175, slot: "", type: "accessory" 
  },
  reducedWeight:            {
    price: 0, slot: "", type: "modification" 
  },
  redDotSight:              {
    price: 75, slot: "top", type: "accessory" 
  },
  retractibleBayonet:       {
    price: 200, slot: "", type: "accessory" 
  },
  safeTargetSystem:         {
    price: 750, slot: "", type: "accessory" 
  },
  safeTargetSystemWithImage:{
    price: 1100, slot: "", type: "accessory" 
  },
  sling:                    {
    price: 15, slot: "", type: "accessory" 
  },
  smartFiringPlatform:      {
    price: 2500, slot: "", type: "accessory" 
  },
  speedLoader:              {
    price: 25, slot: "", type: "accessory" 
  },
  tracker:                  {
    price: 150, slot: "", type: "accessory" 
  },
  triggerRemoval:           {
    price: 50, slot: "", type: "modification" 
  },
  trollAdaptation:          {
    price: 0, slot: "", type: "modification" 
  },
  underbarrelBolaLauncher:  {
    price: 350, slot: "", type: "accessory" 
  },
  underbarrelChainsaw:      {
    price: 500, slot: "", type: "accessory" 
  },
  underbarrelLaser:         {
    price: 22000, slot: "", type: "accessory" 
  },
  underbarrelFlamethrower:  {
    price: 200, slot: "", type: "accessory" 
  },
  underbarrelGrappleGun:    {
    price: 600, slot: "", type: "accessory" 
  },
  underbarrelGrenadeLauncher:{
    price: 3500, slot: "", type: "accessory" 
  },
  underbarrelShotgun:       {
    price: 600, slot: "underneath", type: "accessory" 
  },
  vintage:                  {
    price: 0, slot: "", type: "trait" 
  },
  weaponCommlink:           {
    price: 200, slot: "", type: "accessory" 
  },
  weaponPersonality:        {
    price: 250, slot: "", type: "accessory" 
  },

  // ── Accessories with standard modifier effects ────────────────────

  bipod: {
    price: 200, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 2 
      },
    ],
  },

  electronicFiring: {
    price: 1000, slot: "", type: "modification",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 1 
      },
    ],
  },

  extendedBarrel: {
    price: 50, slot: "", type: "modification",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 1 
      },
    ],
  },

  foldingStock: {
    price: 30, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 1 
      },
    ],
  },

  foregrip: {
    price: 100, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.concealment", type: "value", value: 1 
      },
      {
        target: "system.recoilCompensation", type: "value", value: 1 
      },
    ],
  },

  gasVentSystemOne: {
    price: 200, slot: "", type: "modification",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 1 
      },
    ],
  },

  gasVentSystemTwo: {
    price: 400, slot: "", type: "modification",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 2 
      },
    ],
  },

  gasVentSystemThree: {
    price: 600, slot: "", type: "modification",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 3 
      },
    ],
  },

  gyroMount: {
    price: 1400, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 6 
      },
    ],
  },

  hiddenArmSlide: {
    price: 350, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.concealment", type: "value", value: 1 
      },
    ],
  },

  hipPad: {
    price: 250, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 1 
      },
    ],
  },

  holographicSight: {
    price: 125, slot: "top", type: "accessory",
    itemEffects: [
      {
        target: "system.accuracy", type: "value", value: 1, cumulative: false 
      },
      {
        target: "system.weaponSkill", type: "value", value: 1, cumulative: false, wifi: true 
      },
    ],
  },

  laserSight: {
    price: 150, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.accuracy", type: "value", value: 1, cumulative: false 
      },
      {
        target: "system.weaponSkill", type: "value", value: 1, cumulative: false, wifi: true 
      },
    ],
  },

  personalizedGrip: {
    price: 100, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.accuracy", type: "value", value: 1, cumulative: false 
      },
    ],
  },

  shockPad: {
    price: 50, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 1 
      },
    ],
  },

  slideMount: {
    price: 500, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 1 
      },
    ],
  },

  stockRemoval: {
    price: 20, slot: "stock", type: "modification",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: -1 
      },
      {
        target: "system.concealment", type: "value", value: -1 
      },
    ],
  },

  tripod: {
    price: 500, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.recoilCompensation", type: "value", value: 6 
      },
    ],
  },

  // ── Accessories with conditional / complex effects ────────────────

  concealedQDHolster: {
    price: 275, slot: "", type: "accessory",
    itemEffects: [
      {
        target: "system.concealment", type: "value", value: -1 
      },
    ],
  },

  sawedoffShortbarrel: {
    price: 20, slot: "barrel", type: "modification",
    itemEffects: [
      {
        target: "system.damageValue", type: "value", value: -1, cumulative: false 
      },
    ],
  },

  // ── Accessories needing special handlers (systemEffects) ──────────

  chameleonCoating: {
    price: 1000, slot: "side", type: "modification",
    systemEffects: [{
      value: "chameleonCoating" 
    }],
  },

  concealableHolster: {
    price: 150, slot: "", type: "accessory",
    systemEffects: [{
      value: "concealableHolster" 
    }],
  },

  overcloked: {
    price: 200, slot: "", type: "modification",
    systemEffects: [{
      value: "overclocked" 
    }],
  },

  silencerSuppressor: {
    price: 500, slot: "", type: "modification",
    systemEffects: [{
      value: "silencerSuppressor" 
    }],
  },

  smartgunSystemInternal: {
    price: 0, priceMultiplier: 2, slot: "internal", type: "modification",
    systemEffects: [{
      value: "smartgunInternal" 
    }],
  },

  smartgunSystemExternal: {
    price: 200, slot: "", type: "accessory",
    systemEffects: [{
      value: "smartgunExternal" 
    }],
  },

  // ── Vision-related accessories (actor-level environmental mods) ───

  flashLightInfrared: {
    price: 400, slot: "", type: "accessory",
    systemEffects: [{
      value: "flashLightInfrared" 
    }],
  },

  flashLightLowLight: {
    price: 200, slot: "", type: "accessory",
    systemEffects: [{
      value: "flashLightLowLight" 
    }],
  },

  imagingScope: {
    price: 300, slot: "", type: "accessory",
    systemEffects: [{
      value: "imagingScope" 
    }],
  },
}
