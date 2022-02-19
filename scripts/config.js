// Namespace SR5 Configuration Values
export const SR5 = {};

CONFIG.ChatMessage.template = "systems/sr5/templates/interface/chat-message.html";

// Attributes
SR5.characterAttributes = {
  body                      : "SR5.Body",
  agility                   : "SR5.Agility",
  reaction                  : "SR5.Reaction",
  strength                  : "SR5.Strength",
  willpower                 : "SR5.Willpower",
  logic                     : "SR5.Logic",
  intuition                 : "SR5.Intuition",
  charisma                  : "SR5.Charisma",
};

// Physical Attributes
SR5.characterPhysicalAttributes = {
  body                      : "SR5.Body",
  agility                   : "SR5.Agility",
  reaction                  : "SR5.Reaction",
  strength                  : "SR5.Strength",
};

// Metnal Attributes
SR5.characterMentalAttributes = {
  willpower                 : "SR5.Willpower",
  logic                     : "SR5.Logic",
  intuition                 : "SR5.Intuition",
  charisma                  : "SR5.Charisma",
};

// Special Attributes
SR5.characterSpecialAttributes = {
  edge                      : "SR5.Edge",
  magic                     : "SR5.Magic",
  resonance                 : "SR5.Resonance",
};

//
SR5.allAttributes = {
  ...SR5.characterAttributes,
  ...SR5.characterSpecialAttributes
}

// Initiatives
SR5.characterInitiatives = {
  physicalInit              : "SR5.InitiativePhysicalShort",
  matrixInit                : "SR5.InitiativeMatrixShort",
  astralInit                : "SR5.InitiativeAstralShort",
};

// Main Limits
SR5.characterLimits = {
  astralLimit               : "SR5.AstralLimitShort",
  mentalLimit               : "SR5.MentalLimitShort",
  physicalLimit             : "SR5.PhysicalLimitShort",
  socialLimit               : "SR5.SocialLimitShort",
};

// Defensive Actions
SR5.characterDefenses = {
  block                     : "SR5.Block",
  defend                    : "SR5.StandardDefense",
  dodge                     : "SR5.Dodge",
  parryBlades               : "SR5.ParrySlashing",
  parryClubs                : "SR5.ParryBlunt",
};

// Resistances
SR5.characterResistances = {
  physicalDamage            : "SR5.Damage",
  crashDamage               : "SR5.CrashDamageResistance",
  directSpellMana           : "SR5.DirectSpellMana",
  directSpellPhysical       : "SR5.DirectSpellPhysical",
  disease                   : "SR5.Pathogen",
  toxin                     : "SR5.Toxin",
  specialDamage             : "SR5.SpecialDamage",
  fatigue                   : "SR5.Fatigue",
  fall                      : "SR5.Fall",
};

// Special Damage Types
SR5.specialDamageTypes = {
  acid                      : "SR5.ElementalDamageAcid",
  cold                      : "SR5.ElementalDamageCold",
  electricity               : "SR5.ElementalDamageElectricity",
  fire                      : "SR5.ElementalDamageFire",
  pollution                 : "SR5.ElementalDamagePollution",
  radiation                 : "SR5.ElementalDamageRadiation",
  sound                     : "SR5.ElementalDamageSound",
  toxin                     : "SR5.ElementalDamageToxin",
  water                     : "SR5.ElementalDamageWater",
};

// Propagation Vector Types for Disease/Toxin
SR5.propagationVectors = {
  contact                   : "SR5.VectorContact",
  ingestion                 : "SR5.VectorIngestion",
  inhalation                : "SR5.VectorInhalation",
  injection                 : "SR5.VectorInjection",
};

// Derived Attributes
SR5.characterDerivedAttributes = {
  composure                 : "SR5.Composure",
  judgeIntentions           : "SR5.JudgeIntentions",
  memory                    : "SR5.Memory",
  surprise                  : "SR5.Surprise",
};

// PC/NPC Condition Monitors
SR5.characterConditionMonitors = {
  physical                  : "SR5.ConditionMonitorPhysicalShort",
  stun                      : "SR5.ConditionMonitorStunShort",
  condition                 : "SR5.ConditionMonitorShort",
};

SR5.characterOtherMonitors = {
  overflow                  : "SR5.ConditionMonitorPhysicalOverflowShort",
  edge                      : "SR5.Edge",
}
// Device Condition Monitors
SR5.deviceConditionMonitors = {
  matrix                    : "SR5.ConditionMonitorMatrix",
};

// Drone Condition Monitors
SR5.droneConditionMonitors = {
  condition                 : "SR5.ConditionMonitor",
  matrix                    : "SR5.ConditionMonitorMatrix",
};

// Grunt Condition Monitors
SR5.gruntConditionMonitors = {
  condition                 : "SR5.ConditionMonitor",
};

// Spirit Condition Monitors
SR5.spiritConditionMonitors = {
  physical                  : "SR5.ConditionMonitorPhysicalShort",
  stun                      : "SR5.ConditionMonitorStunShort",
};

// Condition Monitors
SR5.conditionMonitorTypes = {
  ...SR5.characterConditionMonitors,
  ...SR5.deviceConditionMonitors,
  ...SR5.droneConditionMonitors,
  ...SR5.gruntConditionMonitors,
  ...SR5.spiritConditionMonitors,
};

SR5.monitorTypes = {
  ...SR5.characterConditionMonitors,
  ...SR5.deviceConditionMonitors,
  ...SR5.characterOtherMonitors,
};

SR5.penaltyTypes = {
  physical                  : "SR5.PenaltyValuePhysical",
  stun                      : "SR5.PenaltyValueStun",
  condition                 : "SR5.PenaltyDamage",
  matrix                    : "SR5.PenaltyValueMatrix",
  magic                     : "SR5.PenaltyValueMagic",
  special                   : "SR5.PenaltyValueSpecial",
};

// Weight Actions
SR5.weightActions = {
  carry                     : "SR5.Carrying",
  lift                      : "SR5.Lifting",
  liftAboveHead             : "SR5.LiftingAboveHead",
};

// Movements
SR5.movements = {
  walk                      : "SR5.Walking",
  run                       : "SR5.Running",
  horizontalJumpStanding    : "SR5.HorizontalJumpStanding",
  horizontalJumpRunning     : "SR5.HorizontalJumpRunning",
  verticalJump              : "SR5.VerticalJump",
  swim                      : "SR5.Swimming",
  treadWater                : "SR5.Floating",
  holdBreath                : "SR5.HoldingBreath",
  fly                       : "SR5.Flying",
};

// Skill Groups
SR5.skillGroups = {
  actingGroup               : "SR5.SkillGroupActing",
  athleticsGroup            : "SR5.SkillGroupAthletics",
  biotechGroup              : "SR5.SkillGroupBiotech",
  closeCombatGroup          : "SR5.SkillGroupCloseCombat",
  conjuringGroup            : "SR5.SkillGroupConjuring",
  crackingGroup             : "SR5.SkillGroupCracking",
  electronicsGroup          : "SR5.SkillGroupElectronics",
  enchantingGroup           : "SR5.SkillGroupEnchanting",
  engineeringGroup          : "SR5.SkillGroupEngineering",
  firearmsGroup             : "SR5.SkillGroupFirearms",
  influenceGroup            : "SR5.SkillGroupInfluence",
  outdoorsGroup             : "SR5.SkillGroupOutdoors",
  sorceryGroup              : "SR5.SkillGroupSorcery",
  stealthGroup              : "SR5.SkillGroupStealth",
  taskingGroup              : "SR5.SkillGroupTasking",
};

// Combat Skills
SR5.combatSkills = {
  archery                   : "SR5.SkillArchery",
  automatics                : "SR5.SkillAutomatics",
  blades                    : "SR5.SkillBlades",
  clubs                     : "SR5.SkillClubs",
  exoticMeleeWeapon         : "SR5.SkillExoticMeleeWeapon",
  exoticRangedWeapon        : "SR5.SkillExoticRangedWeapon",
  heavyWeapons              : "SR5.SkillHeavyWeapons",
  longarms                  : "SR5.SkillLongarms",
  pistols                   : "SR5.SkillPistols",
  throwingWeapons           : "SR5.SkillThrowingWeapons",
  unarmedCombat             : "SR5.SkillUnarmedCombat",
};

// Magical Skills
SR5.magicSkills = {
  alchemy                   : "SR5.SkillAlchemy",
  arcana                    : "SR5.SkillArcana",
  artificing                : "SR5.SkillArtificing",
  assensing                 : "SR5.SkillAssensing",
  astralCombat              : "SR5.SkillAstralCombat",
  banishing                 : "SR5.SkillBanishing",
  binding                   : "SR5.SkillBinding",
  counterspelling           : "SR5.SkillCounterspelling",
  disenchanting             : "SR5.SkillDisenchanting",
  ritualSpellcasting        : "SR5.SkillRitualSpellcasting",
  spellcasting              : "SR5.SkillSpellcasting",
  summoning                 : "SR5.SkillSummoning",
};

// Physical Skills
SR5.physicalSkills = {
  disguise                  : "SR5.SkillDisguise",
  diving                    : "SR5.SkillDiving",
  escapeArtist              : "SR5.SkillEscapeArtist",
  flight                    : "SR5.SkillFlight",
  freeFall                  : "SR5.SkillFreeFall",
  gymnastics                : "SR5.SkillGymnastics",
  palming                   : "SR5.SkillPalming",
  perception                : "SR5.SkillPerception",
  running                   : "SR5.SkillRunning",
  sneaking                  : "SR5.SkillSneaking",
  survival                  : "SR5.SkillSurvival",
  swimming                  : "SR5.SkillSwimming",
  tracking                  : "SR5.SkillTracking",
};

// Resonance Skills
SR5.resonanceSkills = {
  compiling                 : "SR5.SkillCompiling",
  decompiling               : "SR5.SkillDecompiling",
  registering               : "SR5.SkillRegistering",
};

// Social Skills
SR5.socialSkills = {
  con                       : "SR5.SkillCon",
  etiquette                 : "SR5.SkillEtiquette",
  impersonation             : "SR5.SkillImpersonation",
  instruction               : "SR5.SkillInstruction",
  intimidation              : "SR5.SkillIntimidation",
  leadership                : "SR5.SkillLeadership",
  negociation               : "SR5.SkillNegociation",
  performance               : "SR5.SkillPerformance",
};

// Special Skills
SR5.specialSkills = {
  flight                    : "SR5.SkillFly",
};

// Technical Skills
SR5.technicalSkills = {
  aeronauticsMechanic       : "SR5.SkillAeronauticsMechanic",
  animalHandling            : "SR5.SkillAnimalHandling",
  armorer                   : "SR5.SkillArmorer",
  artisan                   : "SR5.SkillArtisan",
  automotiveMechanic        : "SR5.SkillAutomotiveMechanic",
  biotechnology             : "SR5.SkillBiotechnology",
  chemistry                 : "SR5.SkillChemistry",
  computer                  : "SR5.SkillComputer",
  cybercombat               : "SR5.SkillCybercombat",
  cybertechnology           : "SR5.SkillCybertechnology",
  demolitions               : "SR5.SkillDemolitions",
  electronicWarfare         : "SR5.SkillElectronicWarfare",
  firstAid                  : "SR5.SkillFirstAid",
  forgery                   : "SR5.SkillForgery",
  hacking                   : "SR5.SkillHacking",
  hardware                  : "SR5.SkillHardware",
  industrialMechanic        : "SR5.SkillIndustrialMechanic",
  locksmith                 : "SR5.SkillLocksmith",
  medecine                  : "SR5.SkillMedecine",
  nauticalMechanic          : "SR5.SkillNauticalMechanic",
  navigation                : "SR5.SkillNavigation",
  software                  : "SR5.SkillSoftware",
};

// Vehicle Skills
SR5.vehicleSkills = {
  gunnery                   : "SR5.SkillGunnery",
  pilotAerospace            : "SR5.SkillPilotAerospace",
  pilotAircraft             : "SR5.SkillPilotAircraft",
  pilotExoticVehicle        : "SR5.SkillPilotExoticVehicle",
  pilotGroundCraft          : "SR5.SkillPilotGroundCraft",
  pilotWatercraft           : "SR5.SkillPilotWatercraft",
  walker                    : "SR5.SkillPilotWalker",
};

// Pilot Skills
SR5.pilotSkills = {
  pilotAerospace            : "SR5.SkillPilotAerospace",
  pilotAircraft             : "SR5.SkillPilotAircraft",
  pilotExoticVehicle        : "SR5.SkillPilotExoticVehicle",
  pilotGroundCraft          : "SR5.SkillPilotGroundCraft",
  pilotWatercraft           : "SR5.SkillPilotWatercraft",
  walker                    : "SR5.SkillPilotWalker",
};

SR5.spriteSkills = {
  computer                  : "SR5.SkillComputer",
  hacking                   : "SR5.SkillHacking",
  electronicWarfare         : "SR5.SkillElectronicWarfare",
  cybercombat               : "SR5.SkillCybercombat",
  hardware                  : "SR5.SkillHardware",
}

SR5.agentSkills = {
  computer                  : "SR5.SkillComputer",
  hacking                   : "SR5.SkillHacking",
  cybercombat               : "SR5.SkillCybercombat",
}

// Skills
SR5.skills = {
  ...SR5.combatSkills,
  ...SR5.magicSkills,
  ...SR5.physicalSkills,
  ...SR5.resonanceSkills,
  ...SR5.socialSkills,
  ...SR5.specialSkills,
  ...SR5.technicalSkills,
  ...SR5.vehicleSkills,
};

// Skill Categories
SR5.skillCategories = {
  none                      : "SR5.SkillCategoryNone",
  combatSkills              : "SR5.SkillCategoryCombat",
  magicSkills               : "SR5.SkillCategoryMagical",
  physicalSkills            : "SR5.SkillCategoryPhysical",
  resonanceSkills           : "SR5.SkillCategoryResonance",
  socialSkills              : "SR5.SkillCategorySocial",
  technicalSkills           : "SR5.SkillCategoryTechnical",
  vehicleSkills             : "SR5.SkillCategoryVehicles",
};

SR5.perceptionTypes = {
  sight                     : "SR5.SkillPerceptionSight",
  hearing                   : "SR5.SkillPerceptionHearing",
  smell                     : "SR5.SkillPerceptionSmell",
  touch                     : "SR5.SkillPerceptionTouch",
  taste                     : "SR5.SkillPerceptionTaste",
}

// Vision Types
SR5.visionTypes = {
  lowLight                  : "SR5.LowLightVision",
  thermographic             : "SR5.ThermographicVision",
  ultrasound                : "SR5.UltrasoundVision",
  astral                    : "SR5.AstralPerception",
};

SR5.visionActive = {
  //astralIsChecked         : "SR5.AstralPerception",
  lowLight                  : "SR5.LowLightVision",
  thermographic             : "SR5.ThermographicVision",
  ultrasound                : "SR5.UltrasoundVision",
}

//Environmental Modifiers
SR5.environmentalModifiers = {
  visibility                : "SR5.EnvironmentalModVisibility",
  light                     : "SR5.EnvironmentalModLight",
  glare                     : "SR5.EnvironmentalModGlare",
  wind                      : "SR5.EnvironmentalModWind",
  range                     : "SR5.EnvironmentalModRange",
}

// Genders
SR5.genders = {
  female                    : "SR5.GenderFemale",
  male                      : "SR5.GenderMale",
  other                     : "SR5.GenderOther",
};

// Metatypes
SR5.metatypes = {
  human                     : "SR5.MetatypeHuman",
  elf                       : "SR5.MetatypeElf",
  dwarf                     : "SR5.MetatypeDwarf",
  ork                       : "SR5.MetatypeOrc",
  troll                     : "SR5.MetatypeTroll",
};

// Lifestyle Types
SR5.lifestyleTypes = {
  streets                   : "SR5.LifestyleStreets",
  squatter                  : "SR5.LifestyleSquatter",
  low                       : "SR5.LifestyleLow",
  middle                    : "SR5.LifestyleMiddle",
  high                      : "SR5.LifestyleHigh",
  luxury                    : "SR5.LifestyleLuxury",
};

// Lifestyle Options
SR5.lifestyleOptions = {
  difficultToFind           : "SR5.LifeStyleOptionDifficultToFind",
  specialWorkArea           : "SR5.LifeStyleOptionSpecialWorkArea",
  cramped                   : "SR5.LifeStyleOptionCramped",
  extraSecure               : "SR5.LifeStyleOptionExtraSecure",
  dangerousArea             : "SR5.LifeStyleOptionDangerousArea",
};

// Reputation

SR5.reputationTypes = {
  streetCred                : "SR5.ReputationStreetCred",
  notoriety                 : "SR5.ReputationNotoriety",
  publicAwareness           : "SR5.ReputationPublicAwareness",
}

//-----------------------------------//
//            WEAPONS                //
//-----------------------------------//

// Weapon Firing Modes
SR5.weaponModes = {
  singleShot                : "SR5.WeaponModeSS",
  semiAutomatic             : "SR5.WeaponModeSA",
  burstFire                 : "SR5.WeaponModeBF",
  fullyAutomatic            : "SR5.WeaponModeFA",
};

SR5.weaponModesAbbreviated = {
  singleShot                : "SR5.WeaponModeSSShort",
  semiAutomatic             : "SR5.WeaponModeSAShort",
  burstFire                 : "SR5.WeaponModeBFShort",
  fullyAutomatic            : "SR5.WeaponModeFAShort",
};

SR5.weaponModesCode = {
  SS                        : "SR5.WeaponModeSSShort",
  SA                        : "SR5.WeaponModeSAShort",
  SB                        : "SR5.WeaponModeSBShort",
  BF                        : "SR5.WeaponModeBFShort",
  LB                        : "SR5.WeaponModeLBShort",
  FAs                       : "SR5.WeaponModeFA",
  SF                        : "SR5.WeaponModeSF",
};

// Weapon Ranges
SR5.weaponRanges ={
  short                     : "SR5.WeaponRangeShort",
  medium                    : "SR5.WeaponRangeMedium",
  long                      : "SR5.WeaponRangeLong",
  extreme                   : "SR5.WeaponRangeExtreme",
};


// Modes de rechargement des armes à distance
SR5.reloadingMethods = {
  belt                      : "SR5.ReloadingBelt",
  cylinder                  : "SR5.ReloadingCylinder",
  breakAction               : "SR5.ReloadingBreakAction",
  clip                      : "SR5.ReloadingClip",
  internalMag               : "SR5.ReloadingInternalMag",
  muzzle                    : "SR5.ReloadingMuzzle",
  drum                      : "SR5.ReloadingDrum",
  special                   : "SR5.ReloadingSpecial",
};

// Catégorie d'armes
SR5.weaponCategories = {
  grenade                   : "SR5.Grenade",
  meleeWeapon               : "SR5.MeleeWeapon",
  rangedWeapon              : "SR5.RangedWeapon",
};

// Types d'armes de mêlées
SR5.meleeWeaponTypes = {
  clubs                     : "SR5.MeleeWeaponTypeClubs",
  blades                    : "SR5.MeleeWeaponTypeBlades",
  unarmed                   : "SR5.MeleeWeaponTypeUnarmed",
  exoticMeleeWeapon               : "SR5.MeleeWeaponTypeOther",
};

// Types d'armes à distance
SR5.rangedWeaponTypes = {
  exoticRangedWeapon        : "SR5.WeaponTypeSpecial",
  assaultCannon             : "SR5.WeaponTypeAssaultCannon",
  assaultRifle              : "SR5.WeaponTypeAssaultRifle",
  bow                       : "SR5.WeaponTypeBow",
  grenadeLauncher           : "SR5.WeaponTypeGrenadeLauncher",
  harpoonGuns               : "SR5.WeaponTypeHarpoonGuns",
  heavyCrossbow             : "SR5.WeaponTypeHeavyCrossbow",
  heavyMachineGun           : "SR5.WeaponTypeHeavyMachineGun",
  heavyPistol               : "SR5.WeaponTypeHeavyPistol",
  holdOut                   : "SR5.WeaponTypeHoldOut",
  implantedCyber            : "SR5.WeaponTypeImplantedCyber",
  lightCrossbow             : "SR5.WeaponTypeLightCrossbow",
  lightMachineGun           : "SR5.WeaponTypeLightMachineGun",
  lightPistol               : "SR5.WeaponTypeLightPistol",
  machinePistol             : "SR5.WeaponTypeMachinePistol",
  mediumCrossbow            : "SR5.WeaponTypeMediumCrossbow",
  mediumMachineGun          : "SR5.WeaponTypeMediumMachineGun",
  missileLauncher           : "SR5.WeaponTypeMissileLauncher",
  shotgun                   : "SR5.WeaponTypeShotgun",
  sniperRifle               : "SR5.WeaponTypeSniperRifle",
  submachineGun             : "SR5.WeaponTypeSubmachineGun",
  taser                     : "SR5.WeaponTypeTaser",
  throwing                  : "SR5.WeaponTypeThrowing",
};

// Types d'armes à feu
SR5.rangedWeaponFireTypes = {
  exoticRangedWeapon               : "SR5.WeaponTypeSpecial",
  assaultRifle              : "SR5.WeaponTypeAssaultRifle",
  heavyMachineGun           : "SR5.WeaponTypeHeavyMachineGun",
  heavyPistol               : "SR5.WeaponTypeHeavyPistol",
  holdOut                   : "SR5.WeaponTypeHoldOut",
  implantedCyber            : "SR5.WeaponTypeImplantedCyber",
  lightMachineGun           : "SR5.WeaponTypeLightMachineGun",
  lightPistol               : "SR5.WeaponTypeLightPistol",
  machinePistol             : "SR5.WeaponTypeMachinePistol",
  mediumMachineGun          : "SR5.WeaponTypeMediumMachineGun",
  shotgun                   : "SR5.WeaponTypeShotgun",
  sniperRifle               : "SR5.WeaponTypeSniperRifle",
  submachineGun             : "SR5.WeaponTypeSubmachineGun",
};

// Types d'arc
SR5.rangedWeaponBowTypes = {
  bow                       : "SR5.WeaponTypeBow",
  exoticRangedWeapon               : "SR5.WeaponTypeSpecial",
};

// Types d'arbalète
SR5.rangedWeaponCrossbowTypes = {
  heavyCrossbow             : "SR5.WeaponTypeHeavyCrossbow",
  lightCrossbow             : "SR5.WeaponTypeLightCrossbow",
  mediumCrossbow            : "SR5.WeaponTypeMediumCrossbow", 
  harpoonGuns               : "SR5.WeaponTypeHarpoonGuns", 
  exoticRangedWeapon               : "SR5.WeaponTypeSpecial",
};

SR5.rangedWeaponTaserTypes = {
  taser                     : "SR5.WeaponTypeTaser",
  exoticRangedWeapon               : "SR5.WeaponTypeSpecial",
};

SR5.rangedWeaponLauncherTypes = {
  missileLauncher           : "SR5.WeaponTypeMissileLauncher",
  exoticRangedWeapon               : "SR5.WeaponTypeSpecial",
};

SR5.rangedWeaponGrenadeLauncherTypes = {
  grenadeLauncher           : "SR5.WeaponTypeGrenadeLauncher",
  exoticRangedWeapon               : "SR5.WeaponTypeSpecial",
};

SR5.rangedWeaponCanonTypes = {
  assaultCannon             : "SR5.WeaponTypeAssaultCannon",
  exoticRangedWeapon               : "SR5.WeaponTypeSpecial",
};

// Types d'armes tout
SR5.allWeaponsTypes = {
  ...SR5.meleeWeaponTypes,
  ...SR5.rangedWeaponTypes
};

// Types de munitions
SR5.ammunitionTypes = {
  av                        : "SR5.AmmunitionTypeAV",
  apds                      : "SR5.AmmunitionTypeAPDS",
  capsule                   : "SR5.AmmunitionTypeCapsule",
  capsuleDmso               : "SR5.AmmunitionTypeCapsuleDMSO",
  exExplosive               : "SR5.AmmunitionTypeExExplosive",
  explosive                 : "SR5.AmmunitionTypeExplosive",
  flechette                 : "SR5.AmmunitionTypeFlechette",
  injection                 : "SR5.AmmunitionTypeInjectionDart",
  frangible                 : "SR5.AmmunitionTypeFrangible",
  gel                       : "SR5.AmmunitionTypeGel",
  regular                   : "SR5.AmmunitionTypeRegular",
  hollowPoint               : "SR5.AmmunitionTypeHollowPoint",
  stickNShock               : "SR5.AmmunitionTypeStickNShock",
  tracer                    : "SR5.AmmunitionTypeTracer",
  tracker                   : "SR5.AmmunitionTypeTracker",
};

// Types de grenades
SR5.grenadeTypes = {
  flashBang                 : "SR5.GrenadeTypeFlashBang",
  flashPack                 : "SR5.GrenadeTypeFlashPak",
  fragmentation             : "SR5.GrenadeTypeFragmentation",
  smoke                     : "SR5.GrenadeTypeSmoke",
  smokeThermal              : "SR5.GrenadeTypeSmokeThermal",
  gas                       : "SR5.GrenadeTypeGas",
  highlyExplosive           : "SR5.GrenadeTypeHighlyExplosive",
};

// Types de munitions d'arme de trait
SR5.ammunitionCrossbowTypes = {
  bolt                      : "SR5.AmmunitionTypeBolt",
  boltInjection             : "SR5.AmmunitionTypeInjectionBolt",
};

SR5.ammunitionBowTypes = {
  arrow                     : "SR5.AmmunitionTypeArrow",
  arrowInjection            : "SR5.AmmunitionTypeInjectionArrow",
};

//Types de munitions de lance grenade
SR5.miniGrenadeTypes = {
  flashBangMini             : "SR5.MiniGrenadeTypeFlashBang",
  fragmentationMini         : "SR5.MiniGrenadeTypeFragmentation",
  smokeMini                 : "SR5.MiniGrenadeTypeSmoke",
  smokeThermalMini          : "SR5.MiniGrenadeTypeSmokeThermal",
  gasMini                   : "SR5.MiniGrenadeTypeGas",
  highlyExplosiveMini       : "SR5.MiniGrenadeTypeHighlyExplosive",
};

// Types de munitions de lance-missile
SR5.ammunitionLauncherTypes = {
  fragmentationRocket       : "SR5.RocketTypeFragmentation",
  fragmentationMissile      : "SR5.MissileTypeFragmentation",
  highlyExplosiveRocket     : "SR5.RocketTypeHighlyExplosive",
  highlyExplosiveMissile    : "SR5.MissileTypeHighlyExplosive",
  antivehicleRocket         : "SR5.RocketAntiVehicle",
  antivehicleMissile        : "SR5.MissileAntiVehicle",
};

SR5.ammunitionCannonTypes = {
  assaultCannon             : "SR5.AmmunitionTypeAssaultCannon",
};

SR5.ammunitionTaserTypes = {
  taserDart                 : "SR5.AmmunitionTypeTaserDart",
};

SR5.ammunitionSpecialTypes = {
  special                   : "SR5.Special",
};

SR5.allAmmunitionTypes = {
  ...SR5.ammunitionTypes,
  ...SR5.ammunitionCrossbowTypes,
  ...SR5.ammunitionBowTypes,
  ...SR5.ammunitionLauncherTypes,
  ...SR5.ammunitionCannonTypes,
  ...SR5.miniGrenadeTypes,
  ...SR5.ammunitionTaserTypes,
  ...SR5.ammunitionSpecialTypes,
}

SR5.ammunitionCaseType = {
  cased                     : "SR5.AmmunitionCased",
  caseless                  : "SR5.AmmunitionCaseless",
}

// Types de dégâts
SR5.damageTypesShort = {
  stun                      : "SR5.DamageTypeStunShort",
  physical                  : "SR5.DamageTypePhysicalShort",
  condition                 : "",
};

SR5.damageTypes = {
  stun                      : "SR5.DamageTypeStun",
  physical                  : "SR5.DamageTypePhysical",
};

// Données d'armes modifiables par un customEffect
SR5.weaponEffectTargets = {
  accuracy                  : "SR5.Accuracy",
  damageValue               : "SR5.DamageValue",
};

// Accessoires pour armes à feu
SR5.weaponAccessories = {
  advancedSafetySystem      : "SR5.AccessoryAdvancedSafetySystem",
  advancedSafetySystemElec  : "SR5.AccessoryAdvancedSafetySystemElec",
  advancedSafetySystemExSD  : "SR5.AccessoryAdvancedSafetySystemExSD",
  advancedSafetySystemImmo  : "SR5.AccessoryAdvancedSafetySystemImmo",
  advancedSafetySystemSelfD : "SR5.AccessoryAdvancedSafetySystemSelfD",
  airburstLink              : "SR5.AccessoryAirburstLink",
  batteryBackPack           : "SR5.AccessoryBatteryBackPack",
  batteryClip               : "SR5.AccessoryBatteryClip",
  batteryPack               : "SR5.AccessoryBatteryPack",
  bayonet                   : "SR5.AccessoryBayonet",
  bipod                     : "SR5.AccessoryBipod",
  capBall                   : "SR5.AccessoryCapBall",
  concealableHolster        : "SR5.AccessoryConcealableHolster",
  concealedQDHolster        : "SR5.AccessoryConcealedQDHolster",
  electronicFiring          : "SR5.AccessoryElectronicFiring",
  extendedBarrel            : "SR5.AccessoryExtendedBarrel",
  extremeEnvironment        : "SR5.AccessoryExtremeEnvironment",
  flashLight                : "SR5.AccessoryFlashLight",
  flashLightInfrared        : "SR5.AccessoryFlashLightInfrared",
  flashLightLowLight        : "SR5.AccessoryFlashLightLowLight",
  foldingStock              : "SR5.AccessoryFoldingStock",
  foregrip                  : "SR5.AccessoryForegrip",
  gasVentSystemOne          : "SR5.AccessoryGasVentSystemOne",
  gasVentSystemThree        : "SR5.AccessoryGasVentSystemThree",
  gasVentSystemTwo          : "SR5.AccessoryGasVentSystemTwo",
  geckoGrip                 : "SR5.AccessoryGeckoGrip",
  guncam                    : "SR5.AccessoryGuncam",
  gyroMount                 : "SR5.AccessoryGyroMount",
  hiddenArmSlide            : "SR5.AccessoryHiddenArmSlide",
  hipPad                    : "SR5.AccessoryHipPad",
  imagingScope              : "SR5.AccessoryImagingScope",
  improvedRangeFinder       : "SR5.AccessoryImprovedRangeFinder",
  laserSight                : "SR5.AccessoryLaserSight",
  meleeHardening            : "SR5.AccessoryMeleeHardening",
  periscope                 : "SR5.AccessoryPeriscope",
  quickDrawHolster          : "SR5.AccessoryQuickDrawHolster",
  reducedWeight             : "SR5.AccessoryReducedWeight",
  safeTargetSystem          : "SR5.AccessorySafeTargetSystem",
  safeTargetSystemWithImage : "SR5.AccessorySafeTargetSystemWithImage",
  shockPad                  : "SR5.AccessoryShockPad",
  silencerSuppressor        : "SR5.AccessorySilencerSuppressor",
  slideMount                : "SR5.AccessorySlideMount",
  sling                     : "SR5.AccessorySling",
  smartFiringPlatform       : "SR5.AccessorySmartFiringPlatform",
  smartgunSystemExternal    : "SR5.AccessorySmartgunSystemExternal",
  smartgunSystemInternal    : "SR5.AccessorySmartgunSystemInternal",
  speedLoader               : "SR5.AccessorySpeedLoader",
  tracker                   : "SR5.AccessoryTracker",
  triggerRemoval            : "SR5.AccessoryTriggerRemoval",
  tripod                    : "SR5.AccessoryTripod",
  trollAdaptation           : "SR5.AccessoryTrollAdaptation",
  underbarrelBolaLauncher   : "SR5.AccessoryUnderbarrelBolaLauncher",
  underbarrelChainsaw       : "SR5.AccessoryUnderbarrelChainsaw",
  underbarrelFlamethrower   : "SR5.AccessoryUnderbarrelFlamethrower",
  underbarrelGrappleGun     : "SR5.AccessoryUnderbarrelGrappleGun",
  underbarrelGrenadeLauncher : "SR5.AccessoryUnderbarrelGrenadeLauncher",
  vintage                   : "SR5.AccessoryVintage",
  weaponCommlink            : "SR5.AccessoryWeaponCommlink",
  weaponPersonality         : "SR5.AccessoryWeaponPersonality",
};

//Weapon Accessory Types
SR5.weaponAccessoryTypes = {
  accessory                 : "SR5.WeaponAccessoryTypeAccessory",
  modification              : "SR5.WeaponAccessoryTypeModification",
  trait                     : "SR5.WeaponAccessoryTypeTrait",
}

//Weapon Accessory Slot
SR5.weaponAccessorySlots = {
  top                       : "SR5.WeaponAccessorySlotTop",
  underneath                : "SR5.WeaponAccessorySlotUnderneath",
  side                      : "SR5.WeaponAccessorySlotSide",
  internal                  : "SR5.WeaponAccessorySlotInternal",
  barrel                    : "SR5.WeaponAccessorySlotBarrel",
  stock                     : "SR5.WeaponAccessorySlotStock",
}

// Toxins
SR5.toxinTypes = {
  gamma                     : "SR5.ToxinGamma",
  csTearGas                 : "SR5.ToxinCSTearGas",
  pepperPunch               : "SR5.ToxinPepperPunch",
  nauseaGas                 : "SR5.ToxinNauseaGas",
  narcoject                 : "SR5.ToxinNarcojet",
  neuroStunHeight           : "SR5.ToxinNeuroStunHeight",
  neuroStunNine             : "SR5.ToxinNeuroStunNine",
  neuroStunTen              : "SR5.ToxinNeuroStunTen",
  seven                     : "SR5.ToxinSeven",
};

// Toxins Effects
SR5.toxinEffects = {
  disorientation            : "SR5.ToxinEffectDisorientation",
  nausea                    : "SR5.ToxinEffectNausea",
  paralysis                 : "SR5.ToxinEffectParalysis",
};


//-----------------------------------//
//              ITEMS                //
//-----------------------------------//

// Types de Légalité
SR5.legalTypes = {
  R                         : "SR5.Restricted",
  F                         : "SR5.Forbidden",
};

SR5.legalTypesShort = {
  R                         : "SR5.RestrictedShort",
  F                         : "SR5.ForbiddenShort",
};

SR5.valueMultipliersNoCapacity = {
  rating                    : "SR5.ItemRating",
};

SR5.valueMultipliersNoRating = {
  capacity                  : "SR5.Capacity",
};

SR5.valueMultipliers = {
  ...SR5.valueMultipliersNoCapacity,
  ...SR5.valueMultipliersNoRating
};

// Addiction types
SR5.addictionTypes = {
  both                      : "SR5.AddictionBoth",
  physiological             : "SR5.AddictionPhysiological",
  psychological             : "SR5.AddictionPsychological",
}

//-----------------------------------//
//             AUGMENTATIONS         //
//-----------------------------------//

// Types d'Augmentations
SR5.augmentationTypes = {
  bioware                   : "SR5.AugmentationTypeBioware",
  culturedBioware           : "SR5.AugmentationTypeCulturedBioware",
  cyberware                 : "SR5.AugmentationTypeCyberware",
};

// Catégories d'Augmentations
SR5.augmentationCategories = {
  earware                   : "SR5.AugmentationEarware",
  headware                  : "SR5.AugmentationHeadware",
  eyeware                   : "SR5.AugmentationEyeware",
  cyberlimbs                : "SR5.AugmentationCyberlimbs",
  cyberlimbsAccessory       : "SR5.AugmentationCyberlimbAccessories",
  bodyware                  : "SR5.AugmentationBodyware",
  cyberweapon               : "SR5.AugmentationCyberImplantWeapons",
};

// Grades d'Augmentations
SR5.augmentationGrades = {
  used                      : "SR5.GradeUsed",
  standard                  : "SR5.GradeStandard",
  alphaware                 : "SR5.GradeAlphaware",
  betaware                  : "SR5.GradeBetaware",
  deltaware                 : "SR5.GradeDeltaware",
};

//-----------------------------------//
//         ROLL & MODIFIERS          //
//-----------------------------------//

SR5.extendedInterval = {
  combatTurn                : "SR5.CombatTurn",
  minute                    : "SR5.Minute",
  hour                      : "SR5.Hour",
  day                       : "SR5.Day",
  week                      : "SR5.Week",
  month                     : "SR5.Month",
};

SR5.extendedIntervals = {
  combatTurn                : "SR5.CombatTurns",
  minute                    : "SR5.Minutes",
  hour                      : "SR5.Hours",
  day                       : "SR5.Days",
  week                      : "SR5.Weeks",
  month                     : "SR5.Months",
};

SR5.testLimits = {
  astralLimit               : "SR5.AstralLimitShort",
  mentalLimit               : "SR5.MentalLimitShort",
  physicalLimit             : "SR5.PhysicalLimitShort",
  socialLimit               : "SR5.SocialLimitShort",
  accuracy                  : "SR5.Accuracy",
  force                     : "SR5.Force",
  spiritForce               : "SR5.SpiritForce",
  attack                    : "SR5.MatrixAttack",
  dataProcessing            : "SR5.DataProcessing",
  firewall                  : "SR5.Firewall",
  noiseReduction            : "SR5.NoiseReduction",
  sharing                   : "SR5.Sharing",
  sleaze                    : "SR5.Sleaze",
};

//-----------------------------------//
//        KNOWLEDGE & SKILLS         //
//-----------------------------------//

// Types de Traits
SR5.qualityTypes = {
  positive                  : "SR5.QualityTypePositive",
  negative                  : "SR5.QualityTypeNegative",
};

SR5.qualityTypesShort = {
  positive                  : "SR5.QualityTypePositiveShort",
  negative                  : "SR5.QualityTypeNegativeShort",
};

SR5.knowledgeSkillTypes = {
  academic                  : "SR5.KnowledgeSkillAcademic",
  interests                 : "SR5.KnowledgeSkillInterests",
  professional              : "SR5.KnowledgeSkillProfessional",
  street                    : "SR5.KnowledgeSkillStreet",
  tactics                   : "SR5.KnowledgeSkillTactics",
};


//-----------------------------------//
//                MAGIC              //
//-----------------------------------//

// Magic Types
SR5.magicTypes = {
  adept                     : "SR5.Adept",
  mysticalAdept             : "SR5.MysticalAdept",
  magician                  : "SR5.Magician",
  aspectedMagician          : "SR5.AspectedMagician",
};


// Magical Tradition Types
SR5.traditionTypes = {
  aztec                     : "SR5.TraditionAztec",
  buddhism                  : "SR5.TraditionBuddhism",
  qabbalism                 : "SR5.TraditionQabbalism",
  chamanism                 : "SR5.TraditionChamanism",
  druid                     : "SR5.TraditionDruid",
  hermeticism               : "SR5.TraditionHermeticism",
  hinduism                  : "SR5.TraditionHinduism",
  islam                     : "SR5.TraditionIslam",
  chaosMagic                : "SR5.TraditionChaosMagic",
  blackMagic                : "SR5.TraditionBlackMagic",
  shinto                    : "SR5.TraditionShinto",
  christianTheurgy          : "SR5.TraditionChristianTheurgy",
  sioux                     : "SR5.TraditionSioux",
  vodou                     : "SR5.TraditionVodou",
  pathOfTheWheel            : "SR5.TraditionPathoftheWheel",
  wicca                     : "SR5.TraditionWicca",
  wiccaGardnerian           : "SR5.TraditionWiccaGardnerian",
  wuxing                    : "SR5.TraditionWuxing",
  zoroastrianism            : "SR5.TraditionZoroastrianism",
  norse                     : "SR5.TraditionNorse",
  cosmic                    : "SR5.TraditionCosmic",
  elderGod                  : "SR5.TraditionElderGod",
  greenMagic                : "SR5.TraditionGreenMagic",
  missionists               : "SR5.TraditionMissionists",
  necroMagic                : "SR5.TraditionNecroMagic",
  olympianism               : "SR5.TraditionOlympianism",
  pathofPariah              : "SR5.TraditionPathofPariah",
  planarMagic               : "SR5.TraditionPlanarMagic",
  redMagic                  : "SR5.TraditionRedMagic",
  romani                    : "SR5.TraditionRomani",
  tarot                    : "SR5.TraditionTarot",
};

// Types de sorts
SR5.spellTypes = {
  mana                      : "SR5.SpellTypeMana",
  physical                  : "SR5.SpellTypePhysical",
};
SR5.spellTypesShort = {
  mana                      : "SR5.SpellTypeManaShort",
  physical                  : "SR5.SpellTypePhysicalShort",
};

// Types de sorts de combat
SR5.spellCombatTypes = {
  direct                    : "SR5.CombatSpellTypeDirect",
  indirect                  : "SR5.CombatSpellTypeIndirect",
};

SR5.spellCombatTypesShort = {
  direct                    : "SR5.CombatSpellTypeDirectShort",
  indirect                  : "SR5.CombatSpellTypeIndirectShort",
};

// Type de durées de sort
SR5.spellDurations = {
  instantaneous             : "SR5.DurationInstantaneous",
  sustained                 : "SR5.DurationSustained",
  permanent                 : "SR5.DurationPermanent",
  special                   : "SR5.DurationSpecial",
};
SR5.spellDurationsShort = {
  instantaneous             : "SR5.DurationInstantaneousShort",
  sustained                 : "SR5.DurationSustainedShort",
  permanent                 : "SR5.DurationPermanentShort",
  special                   : "SR5.DurationSpecialShort",
};

// Spell Categories
SR5.spellCategories = {
  combat                    : "SR5.SpellCategoryCombat",
  detection                 : "SR5.SpellCategoryDetection",
  health                    : "SR5.SpellCategoryHealth",
  illusion                  : "SR5.SpellCategoryIllusion",
  manipulation              : "SR5.SpellCategoryManipulation",
};

// Type de portées de sort
SR5.spellRanges = {
  touch                     : "SR5.RangeTouch",
  lineOfSight               : "SR5.RangeLineOfSight",
  area                      : "SR5.RangeArea",
  personal                  : "SR5.RangePersonal",
  special                   : "SR5.RangeSpecial",
};
SR5.spellRangesShort = {
  touch                     : "SR5.RangeTouchShort",
  lineOfSight               : "SR5.RangeLineOfSightShort",
  area                      : "SR5.RangeAreaShort",
  personal                  : "SR5.RangePersonalShort",
  special                   : "SR5.RangeSpecialShort",
};

// Type de sort de Détection
SR5.spellDetectionTypes = {
  aeraEffect                : "SR5.SpellTypeDetectionAreaEffect",
  directional               : "SR5.SpellTypeDetectionDirectional",
  psychic                   : "SR5.SpellTypeDetectionPsychic",
};

// Type de sort de Détection (sens)
SR5.spellDetectionSens = {
  active                    : "SR5.SpellDetectionSenseActive",
  passive                   : "SR5.SpellDetectionSensePassive",
};

// Type de sort d'illusion
SR5.spellIllusionTypes = {
  obvious                   : "SR5.SpellTypeIllusionObvious",
  realistic                 : "SR5.SpellTypeIllusionRealistic",
};

// Type de sort d'illusion (sens)
SR5.spellIllusionSens = {
  single                    : "SR5.SpellTypeIllusionSingleSense",
  multi                     : "SR5.SpellTypeIllusionMultiSense",
};

// Type de sort de Manipulation
SR5.spellManipulationTypes = {
  environmental             : "SR5.SpellTypeManipulationEnvironmental",
  mental                    : "SR5.SpellTypeManipulationMental",
  physical                  : "SR5.SpellTypeManipulationPhysical",
};

// Type de déclencheurs alchimiques
SR5.preparationTriggerTypes = {
  command                   : "SR5.PreparationTriggerCommand",
  contact                   : "SR5.PreparationTriggerContact",
  time                      : "SR5.PreparationTriggerTime",
};

// Type d'action des pouvoirs d'adepte
SR5.actionTypes = {
  free                      : "SR5.ActionTypeFree",
  simple                    : "SR5.ActionTypeSimple",
  complex                   : "SR5.ActionTypeComplex",
  interruption              : "SR5.ActionTypeInterruption",
  permanent                 : "SR5.ActionTypePermanent",
  automatic                 : "SR5.ActionTypeAutomatic",
  special                   : "SR5.ActionTypeSpecial",
};

// Focus
SR5.focusTypes = {
  alchemical                : "SR5.FocusAlchemical",
  weapon                    : "SR5.FocusWeapon",
  banishing                 : "SR5.FocusBanishing",
  masking                   : "SR5.FocusMasking",
  centering                 : "SR5.FocusCentering",
  counterspelling           : "SR5.FocusCounterspelling",
  disenchanting             : "SR5.FocusDisenchanting",
  spellShaping              : "SR5.FocusSpellShaping",
  summoning                 : "SR5.FocusSummoning",
  spellcasting              : "SR5.FocusSpellcasting",
  binding                   : "SR5.FocusBinding",
  ritualSpellcasting        : "SR5.FocusRitualSpellcasting",
  sustaining                : "SR5.FocusSustaining",
  power                     : "SR5.FocusPower",
  flexibleSignature         : "SR5.FocusFlexibleSignature",
  qi                        : "SR5.FocusQi",
};

// Attributes for sprite powers
SR5.spritePowerAttributes = {
  willpower                 : "SR5.Willpower",
  logic                     : "SR5.Logic",
  intuition                 : "SR5.Intuition",
  charisma                  : "SR5.Charisma",
  resonance                 : "SR5.Resonance",
};

SR5.spritePowerDefenseAttributes = {
  willpower                 : "SR5.Willpower",
  logic                     : "SR5.Logic",
  intuition                 : "SR5.Intuition",
  charisma                  : "SR5.Charisma",
  resonance                 : "SR5.Resonance",
  deviceRating              : "SR5.DeviceRating",
};

//-----------------------------------//
//             MARTIAL ARTS          //
//-----------------------------------//
// Martial Arts types
SR5.martialArtsTypes = {
blocks52 : "SR5.martialArtsType52blocks",
aikido : "SR5.martialArtsTypeaikido",
arnisdemano : "SR5.martialArtsTypearnisdemano",
bartitsu : "SR5.martialArtsTypebartitsu",
boxingbrawler : "SR5.martialArtsTypeboxingbrawler",
boxingclassic : "SR5.martialArtsTypeboxingclassic",
boxingswarming : "SR5.martialArtsTypeboxingswarming",
capoeira : "SR5.martialArtsTypecapoeira",
carromeleg : "SR5.martialArtsTypecarromeleg",
chakramfighting : "SR5.martialArtsTypechakramfighting",
drunkenboxing : "SR5.martialArtsTypedrunkenboxing",
fioredeiliberi : "SR5.martialArtsTypefioredeiliberi",
firefight : "SR5.martialArtsTypefirefight",
gunkata : "SR5.martialArtsTypegunkata",
jeetkunedo : "SR5.martialArtsTypejeetkunedo",
jogodupau : "SR5.martialArtsTypejogodupau",
jujitsu : "SR5.martialArtsTypejujitsu",
karate : "SR5.martialArtsTypekarate",
kenjutsu : "SR5.martialArtsTypekenjutsu",
knighterranttactical : "SR5.martialArtsTypeknighterranttactical",
kravmaga : "SR5.martialArtsTypekravmaga",
kunstdesfechtens : "SR5.martialArtsTypekunstdesfechtens",
kyujutsu : "SR5.martialArtsTypekyujutsu",
laverdaderadestreza : "SR5.martialArtsTypelaverdaderadestreza",
lonestartactical : "SR5.martialArtsTypelonestartactical",
muaythai : "SR5.martialArtsTypemuaythai",
ninjutsu : "SR5.martialArtsTypeninjutsu",
okichitaw : "SR5.martialArtsTypeokichitaw",
parkour : "SR5.martialArtsTypeparkour",
pentjaksilat : "SR5.martialArtsTypepentjaksilat",
quarterstafffighting : "SR5.martialArtsTypequarterstafffighting",
sangreyacero : "SR5.martialArtsTypesangreyacero",
taekwondo : "SR5.martialArtsTypetaekwondo",
thecowboyway : "SR5.martialArtsTypethecowboyway",
turkisharchery : "SR5.martialArtsTypeturkisharchery",
whipfighting : "SR5.martialArtsTypewhipfighting",
wildcat : "SR5.martialArtsTypewildcat",
wrestlingmma : "SR5.martialArtsTypewrestlingmma",
wrestlingprofessionnal : "SR5.martialArtsTypewrestlingprofessionnal",
wrestlingsport : "SR5.martialArtsTypewrestlingsport",
wrestlingsumo : "SR5.martialArtsTypewrestlingsumo",
wudangsword : "SR5.martialArtsTypewudangsword",
};

//-----------------------------------//
//             MATRIX                //
//-----------------------------------//
// Matrix Attributes
SR5.matrixAttributes = {
  attack                    : "SR5.MatrixAttack",
  dataProcessing            : "SR5.DataProcessing",
  firewall                  : "SR5.Firewall",
  noiseReduction            : "SR5.NoiseReduction",
  sharing                   : "SR5.Sharing",
  sleaze                    : "SR5.Sleaze",
};

// Deck Attributes
SR5.deckerAttributes = {
  attack                    : "SR5.MatrixAttack",
  dataProcessing            : "SR5.DataProcessing",
  firewall                  : "SR5.Firewall",
  sleaze                    : "SR5.Sleaze",
};

// Common Programs
SR5.commonPrograms = {
  browse                    : "SR5.ProgramBrowse",
  configurator              : "SR5.ProgramConfigurator",
  edit                      : "SR5.ProgramEdit",
  encryption                : "SR5.ProgramEncryption",
  signalScrub               : "SR5.ProgramSignalScrub",
  toolbox                   : "SR5.ProgramToolbox",
  virtualMachine            : "SR5.ProgramVirtualMachine",
};

// Hacking Programs
SR5.hackingPrograms = {
  armor                     : "SR5.ProgramArmor",
  babyMonitor               : "SR5.ProgramBabyMonitor",
  biofeedback               : "SR5.ProgramBiofeedback",
  biofeedbackFilter         : "SR5.ProgramBiofeedbackFilter",
  blackout                  : "SR5.ProgramBlackout",
  decryption                : "SR5.ProgramDecryption",
  defuse                    : "SR5.ProgramDefuse",
  demolition                : "SR5.ProgramDemolition",
  exploit                   : "SR5.ProgramExploit",
  fork                      : "SR5.ProgramFork",
  guard                     : "SR5.ProgramGuard",
  hammer                    : "SR5.ProgramHammer",
  lockdown                  : "SR5.ProgramLockdown",
  mugger                    : "SR5.ProgramMugger",
  shell                     : "SR5.ProgramShell",
  sneak                     : "SR5.ProgramSneak",
  stealth                   : "SR5.ProgramStealth",
  track                     : "SR5.ProgramTrack",
  wrapper                   : "SR5.ProgramWrapper",
}

// Common Programs
SR5.autosoftPrograms = {
  clearsight                : "SR5.ProgramClearsight",
  electronicWarfare         : "SR5.ProgramElectronicWarfare",
  evasion                   : "SR5.ProgramEvasion",
  maneuvering               : "SR5.ProgramManeuvering",
  stealthAutosoft           : "SR5.ProgramStealthAutosoft",
  targeting                 : "SR5.ProgramTargeting",
};

// Programs
SR5.programs = {
  ...SR5.commonPrograms,
  ...SR5.hackingPrograms,
  ...SR5.autosoftPrograms,
};

// Matrix Resistances
SR5.matrixResistances = {
  biofeedback               : "SR5.BiofeedbackDamage",
  dataBomb                  : "SR5.DataBomb",
  dumpshock                 : "SR5.Dumpshock",
  fading                    : "SR5.Fading",
  matrixDamage              : "SR5.MatrixDamage",
};

// Matrix Rolled Actions
SR5.matrixRolledActions = {
  bruteForce                : "SR5.MatrixActionBruteForce",
  checkOverwatchScore       : "SR5.MatrixActionCheckOverwatchScore",
  controlDevice             : "SR5.MatrixActionControlDevice",
  crackFile                 : "SR5.MatrixActionCrackFile",
  crashProgram              : "SR5.MatrixActionCrashProgram",
  dataSpike                 : "SR5.MatrixActionDataSpike",
  disarmDataBomb            : "SR5.MatrixActionDisarmDataBomb",
  editFile                  : "SR5.MatrixActionEditFile",
  eraseMark                 : "SR5.MatrixActionEraseMark",
  eraseMatrixSignature      : "SR5.MatrixActionEraseMatrixSignature",
  formatDevice              : "SR5.MatrixActionFormatDevice",
  garbageInGarbageOut       : "SR5.MatrixActionGarbageInGarbageOut",
  hackOnTheFly              : "SR5.MatrixActionHackOnTheFly",
  hide                      : "SR5.MatrixActionHide",
  jackOut                   : "SR5.MatrixActionJackOut",
  jamSignals                : "SR5.MatrixActionJamSignals",
  jumpIntoRiggedDevice      : "SR5.MatrixActionJumpIntoRiggedDevice",
  matrixPerception          : "SR5.MatrixActionMatrixPerception",
  matrixSearch              : "SR5.MatrixActionMatrixSearch",
  rebootDevice              : "SR5.MatrixActionRebootDevice",
  setDataBomb               : "SR5.MatrixActionSetDataBomb",
  snoop                     : "SR5.MatrixActionSnoop",
  spoofCommand              : "SR5.MatrixActionSpoofCommand",
  traceIcon                 : "SR5.MatrixActionTraceIcon",
  trackback                 : "SR5.MatrixActionTrackback",
};

// Matrix Non Rolled Actions
SR5.matrixOtherActions = {
  changeIcon                : "SR5.MatrixActionChangeIcon",
  enterOrExitHost           : "SR5.MatrixActionEnterOrExitHost",
  gridHop                   : "SR5.MatrixActionGridHop",
  inviteMark                : "SR5.MatrixActionInviteMark",
  sendMessage               : "SR5.MatrixActionSendMessage",
  switchInterfaceMode       : "SR5.MatrixActionSwitchInterfaceMode",
  loadProgram               : "SR5.MatrixActionLoadProgram",
  switchTwoMatrixAttributes : "SR5.MatrixActionSwitchTwoMatrixAttributes",
  swapTwoPrograms           : "SR5.MatrixActionSwapTwoPrograms",
  unloadProgram             : "SR5.MatrixActionUnloadProgram",
};

// Resonance Actions
SR5.resonanceActions = {
  callOrDismissSprite       : "SR5.MatrixActionCallOrDismissSprite",
  commandSprite             : "SR5.MatrixActionCommandSprite",
  compileSprite             : "SR5.MatrixActionCompileSprite",
  decompileSprite           : "SR5.MatrixActionDecompileSprite",
  eraseResonanceSignature   : "SR5.MatrixActionEraseResonanceSignature",
  killComplexForm           : "SR5.MatrixActionKillComplexForm",
  registerSprite            : "SR5.MatrixActionRegisterSprite",
  threadComplexForm         : "SR5.MatrixActionThreadComplexForm",
};

SR5.matrixActions = {
  ...SR5.matrixRolledActions,
  ...SR5.matrixOtherActions,
};

// Complex Form Targets
SR5.complexFormTargets = {
  device                    : "SR5.ComplexFormTargetDevice",
  file                      : "SR5.ComplexFormTargetFile",
  persona                   : "SR5.ComplexFormTargetPersona",
  self                      : "SR5.ComplexFormTargetSelf",
  sprite                    : "SR5.ComplexFormTargetSprite",
};

// Sprite Types
SR5.spriteTypes = {
  courier                   : "SR5.SpriteCourier",
  crack                     : "SR5.SpriteCrack",
  data                      : "SR5.SpriteData",
  fault                     : "SR5.SpriteFault",
  machine                   : "SR5.SpriteMachine",
}

SR5.matrixActionsDefenses = {
  editFile                  : "SR5.MatrixActionEditFile",
  eraseMark                 : "SR5.MatrixActionEraseMark",
  formatDevice              : "SR5.MatrixActionFormatDevice",
  snoop                     : "SR5.MatrixActionSnoop",
  hackOnTheFly              : "SR5.MatrixActionHackOnTheFly",
  spoofCommand              : "SR5.MatrixActionSpoofCommand",
  garbageInGarbageOut       : "SR5.MatrixActionGarbageInGarbageOut",
  bruteForce                : "SR5.MatrixActionBruteForce",
  matrixPerception          : "SR5.MatrixActionMatrixPerception",
  dataSpike                 : "SR5.MatrixActionDataSpike",
  crashProgram              : "SR5.MatrixActionCrashProgram",
  jumpIntoRiggedDevice      : "SR5.MatrixActionJumpIntoRiggedDevice",
  rebootDevice              : "SR5.MatrixActionRebootDevice",
  matrixSearch              : "SR5.MatrixActionMatrixSearch",
  hide                      : "SR5.MatrixActionHide",
  jackOut                   : "SR5.MatrixActionJackOut",
  traceIcon                 : "SR5.MatrixActionTraceIcon",
  checkOverwatchScore       : "SR5.MatrixActionCheckOverwatchScore",
};

// Type de deck
SR5.deckTypes = {
  commlink                  : "SR5.DeckTypeCommlink",
  cyberdeck                 : "SR5.DeckTypeCyberdeck",
  riggerCommandConsole      : "SR5.DeckTypeRiggerCommandConsole",
  livingPersona             : "SR5.DeckTypeLivingPersona",
  headcase                  : "SR5.DeckTypeHeadcase",
};

// Type de modules
SR5.deckModules = {
  standard                  : "SR5.ModuleStandardSim",
  hotsim                    : "SR5.ModuleHotSim",
};

// Type de Dongle
SR5.deckDongles = {
  attack                    : "SR5.DongleAttack",
  stun                      : "SR5.DongleStun",
  stealth                   : "SR5.DongleStealth",
  receiver                  : "SR5.DongleReceiver",
};

// Type de programmes de decking
SR5.programTypes = {
  common                    : "SR5.ProgramTypeCommon",
  hacking                   : "SR5.ProgramTypeHacking",
  autosoft                  : "SR5.ProgramTypeAutosoft",
  agent                     : "SR5.ProgramTypeAgent",
  activesoft                : "SR5.ProgramTypeActivesoft",
  datasoft                  : "SR5.ProgramTypeDatasoft",
  knowsoft                  : "SR5.ProgramTypeKnowsoft", 
  linguasoft                : "SR5.ProgramTypeLinguasoft", 
  mapsoft                   : "SR5.ProgramTypeMapsoft",
  shopsoft                  : "SR5.ProgramTypeShopsoft", 
  tutorsoft                 : "SR5.ProgramTypeTutorsoft",
};


// Modes de decking
SR5.deckModes = {
  ar                        : "SR5.AugmentedReality",
  coldsim                   : "SR5.VirtualRealityColdSim",
  hotsim                    : "SR5.VirtualRealityHotSim",
};

// Modes de decking
SR5.personaModes = {
  ar                        : "SR5.AugmentedReality",
  hotsim                    : "SR5.VirtualRealityHotSim",
};

//Matrix Noise Distance
SR5.matrixNoiseDistance = {
  wired                     : "SR5.MatrixDistanceConnected",
  upTo100m                  : "SR5.MatrixDistance100m",
  upTo1km                   : "SR5.MatrixDistance1km",
  upTo10km                  : "SR5.MatrixDistance10km",
  upTo100km                 : "SR5.MatrixDistance100km",
  farAway                   : "SR5.MatrixDistanceGreater",
}

//Matrix grid
SR5.gridTypes = {
  public                    :"SR5.GridPublic",
  local                     :"SR5.GridLocal",
  global                    :"SR5.GridGlobal",
  host                      :"SR5.GridHost",
}

//Matrix Search information type
SR5.matrixSearchInfoType = {
  general                   :"SR5.MatrixSearchInfoTypeGeneral",
  limited                   :"SR5.MatrixSearchInfoTypeLimited",
  hidden                    :"SR5.MatrixSearchInfoTypeHidden",
}

//-----------------------------------//
//            VEHICULES              //
//-----------------------------------//

// Vehicle/Drone Attributes
SR5.vehicleAttributes = {
  handling                  : "SR5.VehicleStat_HandlingShort",
  speed                     : "SR5.VehicleStat_SpeedShort",
  acceleration              : "SR5.VehicleStat_AccelerationShort",
  body                      : "SR5.VehicleStat_BodyShort",
  armor                     : "SR5.VehicleStat_ArmorShort",
  pilot                     : "SR5.VehicleStat_PilotShort",
  sensor                    : "SR5.VehicleStat_SensorShort",
  seating                   : "SR5.Vehicle_SeatingShort",
};

// Types de véhicules
SR5.vehicleCategories = {
  drone                     : "SR5.DroneFull",
  vehicle                   : "SR5.VehicleFull",
};

// Types de drones
SR5.droneTypes = {
  microdrone                : "SR5.DRONES_Microdrone_F",
  minidrone                 : "SR5.DRONES_Minidrone_F",
  smallDrone                : "SR5.DRONES_SmallDrone_F",
  mediumDrone               : "SR5.DRONES_MediumDrone_F",
  largeDrone                : "SR5.DRONES_LargeDrone_F",
};

// Types de véhicules
SR5.vehicleTypes = {
  vectorThrustCraft         : "SR5.VectorThrustCraftFull",
  fixedWingAircraft         : "SR5.FixedWingAircraftFull",
  boat                      : "SR5.BoatFull",
  truck                     : "SR5.TruckFull",
  rotorCraft                : "SR5.RotorCraftFull",
  bike                      : "SR5.BikeFull",
  submarine                 : "SR5.SubmarineFull",
  car                       : "SR5.CarFull",
};

// Types de montures
SR5.mountTypes = {
  standard                  : "SR5.VEHICLE_WeaponMountStandard_F",
  heavy                     : "SR5.VEHICLE_WeaponMountHeavy_F",
};

// Vehicle and Drone Control mode
SR5.vehicleControlModes = {
  autopilot                 : "SR5.ControlAutopilot",
  manual                    : "SR5.ControlManual",
  remote                    : "SR5.ControlRemote",
  rigging                   : "SR5.ControlRigging",
}

// Vehicle actions
SR5.vehicleActions = {
  vehicleTest               : "SR5.VehicleTest",
  ramming                   : "SR5.Ramming",
  cutOff                    : "SR5.CutOff",
  catchUpBreakAway          : "SR5.CatchUpBreakAway",
  stunt                     : "SR5.Stunt",
}

//Target signature
SR5.targetSignature = {
  vehicleLarge              : "SR5.SignatureVehicleLarge",
  vehicleElectric           : "SR5.SignatureVehicleElectric",
  metahuman                 : "SR5.SignatureMetahuman",
  drone                     : "SR5.SignatureDrone",
  droneMicro                : "SR5.SignatureDroneMicro",
}

//-----------------------------------//
//             ESPRITS               //
//-----------------------------------//

// Types d'esprit
SR5.spiritTypes = {
  abomination               : "SR5.Abomination",
  air                       : "SR5.Air",
  barren                    : "SR5.Barren",
  beasts                    : "SR5.Beasts",
  blood                     : "SR5.Blood",
  earth                     : "SR5.Earth",
  fire                      : "SR5.Fire",
  guardian                  : "SR5.Guardian",
  guidance                  : "SR5.Guidance",
  homunculus                : "SR5.Homunculus",
  insectCaretaker           : "SR5.InsectCaretaker",
  insectNymph               : "SR5.InsectNymph",
  insectQueen               : "SR5.InsectQueenMother",
  insectScout               : "SR5.InsectScout",
  insectSoldier             : "SR5.InsectSoldier",
  insectWorker              : "SR5.InsectWorker",
  man                       : "SR5.Man",
  noxious                   : "SR5.Noxious",
  nuclear                   : "SR5.Nuclear",
  plague                    : "SR5.Plague",
  plant                     : "SR5.Plant",
  shadowMuse                : "SR5.ShadowMuse",
  shadowNightmare           : "SR5.ShadowNightmare",
  shadowShade               : "SR5.ShadowShade",
  shadowSuccubus            : "SR5.ShadowSuccubus",
  shadowWraith              : "SR5.ShadowWraith",
  shedim                    : "SR5.Shedim",
  shedimMaster              : "SR5.MasterShedim",
  sludge                    : "SR5.Sludge",
  task                      : "SR5.Task",
  watcher                   : "SR5.Watcher",
  water                     : "SR5.Water",
};

SR5.spiritBasePowersabomination = {
  animalControl              : "SR5.SpiritPowerAnimalControl",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  mutagen                    : "SR5.SpiritPowerMutagen",
  naturalWeapon              : "SR5.SpiritPowerNaturalWeapon",
  pestilence                 : "SR5.SpiritPowerPestilence",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritOptionalPowersabomination = {
  concealment                : "SR5.SpiritPowerConcealment",
  corrosiveSpit              : "SR5.SpiritPowerCorrosiveSpit",
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
  mimicry                    : "SR5.SpiritPowerMimicry",
  search                     : "SR5.SpiritPowerSearch",
  venom                      : "SR5.SpiritPowerVenom",
}

SR5.spiritBasePowersair = {
  accident                   : "SR5.SpiritPowerAccident",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  engulfAir                  : "SR5.SpiritPowerEngulfAir",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowersair = {
  elementalAttack            : "SR5.SpiritPowerElementalAttack",
  energyAura                 : "SR5.SpiritPowerEnergyAura",
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
  psychokinesis              : "SR5.SpiritPowerPsychokinesis",
}

SR5.spiritBasePowersbarren = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  binding                    : "SR5.SpiritPowerBinding",
  elementalAttackPolluant    : "SR5.SpiritPowerElementalAttackPolluant",
  engulfEarth                : "SR5.SpiritPowerEngulfEarth",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowersbarren = {
  accident                   : "SR5.SpiritPowerAccident",
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
}

SR5.spiritBasePowersbeasts = {
  animalControl              : "SR5.SpiritPowerAnimalControl",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  fear                       : "SR5.SpiritPowerFear",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritOptionalPowersbeasts = {
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  guard                      : "SR5.SpiritPowerGuard",
  naturalWeapon              : "SR5.SpiritPowerNaturalWeapon",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
  search                     : "SR5.SpiritPowerSearch",
  venom                      : "SR5.SpiritPowerVenom",
}

SR5.spiritBasePowersblood = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  binding                    : "SR5.SpiritPowerBinding",
  energyDrain                : "SR5.SpiritPowerEnergyDrain",
  fear                       : "SR5.SpiritPowerFear",
  materialization            : "SR5.SpiritPowerMaterialization",
}

SR5.spiritOptionalPowersblood = {
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  guard                      : "SR5.SpiritPowerGuard",
  movement                   : "SR5.SpiritPowerMovement",
  naturalWeapon              : "SR5.SpiritPowerNaturalWeapon",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
}

SR5.spiritBasePowersearth = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  binding                    : "SR5.SpiritPowerBinding",
  guard                      : "SR5.SpiritPowerGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowersearth = {
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  elementalAttack            : "SR5.SpiritPowerElementalAttack",
  engulfEarth                : "SR5.SpiritPowerEngulfEarth",
  fear                       : "SR5.SpiritPowerFear",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritBasePowersfire = {
  accident                   : "SR5.SpiritPowerAccident",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  confusion                  : "SR5.SpiritPowerConfusion",
  elementalAttack            : "SR5.SpiritPowerElementalAttack",
  energyAura                 : "SR5.SpiritPowerEnergyAura",
  engulfFire                 : "SR5.SpiritPowerEngulfFire",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritOptionalPowersfire = {
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritBasePowersguardian = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritOptionalPowersguardian = {
  animalControl              : "SR5.SpiritPowerAnimalControl",
  concealment                : "SR5.SpiritPowerConcealment",
  elementalAttack            : "SR5.SpiritPowerElementalAttack",
  naturalWeapon              : "SR5.SpiritPowerNaturalWeapon",
  psychokinesis              : "SR5.SpiritPowerPsychokinesis",
}

SR5.spiritBasePowersguidance = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  confusion                  : "SR5.SpiritPowerConfusion",
  divining                   : "SR5.SpiritPowerDivining",
  guard                      : "SR5.SpiritPowerGuard",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
  shadowCloak                : "SR5.SpiritPowerShadowCloak",
}

SR5.spiritBasePowershomonculus = {
  dualNatured                : "SR5.SpiritPowerDualNatured",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritBasePowersinsectCaretaker = {
  animalControl              : "SR5.SpiritPowerAnimalControl",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  guard                      : "SR5.SpiritPowerGuard",
  hiveMind                   : "SR5.SpiritPowerHiveMind",
  inhabitation               : "SR5.SpiritPowerInhabitation",
  innateSpell                : "SR5.SpiritPowerInnateSpell",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritOptionalPowersinsectCaretaker = {
  binding                    : "SR5.SpiritPowerBinding",
  confusion                  : "SR5.SpiritPowerConfusion",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
}

SR5.spiritBasePowersinsectNymph = {
  animalControl              : "SR5.SpiritPowerAnimalControl",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  hiveMind                   : "SR5.SpiritPowerHiveMind",
  inhabitation               : "SR5.SpiritPowerInhabitation",
  innateSpell                : "SR5.SpiritPowerInnateSpell",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritOptionalPowersinsectNymph = {
  compulsion                 : "SR5.SpiritPowerCompulsion",
  fear                       : "SR5.SpiritPowerFear",
}

SR5.spiritBasePowersinsectQueen = {
  animalControl              : "SR5.SpiritPowerAnimalControl",
  astralGateway              : "SR5.SpiritPowerAstralGateway",
  banishingResistance        : "SR5.SpiritPowerBanishingResistance",
  compulsion                 : "SR5.SpiritPowerCompulsion",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  fear                       : "SR5.SpiritPowerFear",
  hiveMind                   : "SR5.SpiritPowerHiveMind",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
  wealth                     : "SR5.SpiritPowerWealth",
}

SR5.spiritOptionalPowersinsectQueen = {
  concealment                : "SR5.SpiritPowerConcealment",
  guard                      : "SR5.SpiritPowerGuard",
  naturalWeapon              : "SR5.SpiritPowerNaturalWeapon",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
  venom                      : "SR5.SpiritPowerVenom",
}

SR5.spiritBasePowersinsectScout = {
  animalControl              : "SR5.SpiritPowerAnimalControl",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  concealment                : "SR5.SpiritPowerConcealment",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  hiveMind                   : "SR5.SpiritPowerHiveMind",
  inhabitation               : "SR5.SpiritPowerInhabitation",
  innateSpell                : "SR5.SpiritPowerInnateSpell",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowersinsectScout = {
  confusion                  : "SR5.SpiritPowerConfusion",
  guard                      : "SR5.SpiritPowerGuard",
  naturalWeapon              : "SR5.SpiritPowerNaturalWeapon",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
}

SR5.spiritBasePowersinsectSoldier = {
  animalControl              : "SR5.SpiritPowerAnimalControl",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  fear                       : "SR5.SpiritPowerFear",
  hiveMind                   : "SR5.SpiritPowerHiveMind",
  inhabitation               : "SR5.SpiritPowerInhabitation",
  naturalWeapon              : "SR5.SpiritPowerNaturalWeapon",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritOptionalPowersinsectSoldier = {
  concealment                : "SR5.SpiritPowerConcealment",
  binding                    : "SR5.SpiritPowerBinding",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
  venom                      : "SR5.SpiritPowerVenom",
}

SR5.spiritBasePowersinsectWorker = {
  animalControl              : "SR5.SpiritPowerAnimalControl",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  hiveMind                   : "SR5.SpiritPowerHiveMind",
  inhabitation               : "SR5.SpiritPowerInhabitation",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowersinsectWorker = {
  concealment                : "SR5.SpiritPowerConcealment",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  venom                      : "SR5.SpiritPowerVenom",
}

SR5.spiritOptionalPowersguidance = {
  engulf                     : "SR5.SpiritPowerEngulf",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  fear                       : "SR5.SpiritPowerFear",
  influence                  : "SR5.SpiritPowerInfluence",
}

SR5.spiritBasePowersman = {
  accident                   : "SR5.SpiritPowerAccident",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  guard                      : "SR5.SpiritPowerGuard",
  influence                  : "SR5.SpiritPowerInfluence",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowersman = {
  fear                       : "SR5.SpiritPowerFear",
  innateSpell                : "SR5.SpiritPowerInnateSpell",
  movement                   : "SR5.SpiritPowerMovement",
  psychokinesis              : "SR5.SpiritPowerPsychokinesis",
}

SR5.spiritBasePowersnoxious = {
  accident                   : "SR5.SpiritPowerAccident",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  engulfAir                  : "SR5.SpiritPowerEngulfAir",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowersnoxious = {
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
  psychokinesis              : "SR5.SpiritPowerPsychokinesis",
  weatherControl             : "SR5.SpiritPowerWeatherControl",
}

SR5.spiritBasePowersnuclear = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  elementalAttackRadiation   : "SR5.SpiritPowerElementalAttackRadiation",
  energyAura                 : "SR5.SpiritPowerEnergyAura",
  engulfFire                 : "SR5.SpiritPowerEngulfFire",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritOptionalPowersnuclear = {
  confusion                  : "SR5.SpiritPowerConfusion",
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritBasePowersplague = {
  accident                   : "SR5.SpiritPowerAccident",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  desireReflexion            : "SR5.SpiritPowerDesireReflexion",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  fear                       : "SR5.SpiritPowerFear",
  materialization            : "SR5.SpiritPowerMaterialization",
  mutagen                    : "SR5.SpiritPowerMutagen",
  pestilence                 : "SR5.SpiritPowerPestilence",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowersplague = {
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  guard                      : "SR5.SpiritPowerGuard",
  innateSpell                : "SR5.SpiritPowerInnateSpell",
  movement                   : "SR5.SpiritPowerMovement",
  psychokinesis              : "SR5.SpiritPowerPsychokinesis",
}

SR5.spiritBasePowersplant = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  concealment                : "SR5.SpiritPowerConcealment",
  engulf                     : "SR5.SpiritPowerEngulf",
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
  silence                    : "SR5.SpiritPowerSilence",
}

SR5.spiritOptionalPowersplant = {
  accident                   : "SR5.SpiritPowerAccident",
  confusion                  : "SR5.SpiritPowerConfusion",
  movement                   : "SR5.SpiritPowerMovement",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritBasePowersshadowMuse = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  banishingResistance        : "SR5.SpiritPowerBanishingResistance",
  energyDrain                : "SR5.SpiritPowerEnergyDrain",
  influence                  : "SR5.SpiritPowerInfluence",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
  spiritPact                 : "SR5.SpiritPowerSpiritPact",
}

SR5.spiritOptionalPowersshadowMuse = {
  compulsion                 : "SR5.SpiritPowerCompulsion",
  mindLink                   : "SR5.SpiritPowerMindLink",
  realisticForm              : "SR5.SpiritPowerRealisticForm",
}

SR5.spiritBasePowersshadowNightmare = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  banishingResistance        : "SR5.SpiritPowerBanishingResistance",
  energyDrain                : "SR5.SpiritPowerEnergyDrain",
  influence                  : "SR5.SpiritPowerInfluence",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
  spiritPact                 : "SR5.SpiritPowerSpiritPact",
}

SR5.spiritOptionalPowersshadowNightmare = {
  mindLink                   : "SR5.SpiritPowerMindLink",
  fear                       : "SR5.SpiritPowerFear",
  shadowCloak                : "SR5.SpiritPowerShadowCloak",
}

SR5.spiritBasePowersshadowShade = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  banishingResistance        : "SR5.SpiritPowerBanishingResistance",
  energyDrain                : "SR5.SpiritPowerEnergyDrain",
  influence                  : "SR5.SpiritPowerInfluence",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
  spiritPact                 : "SR5.SpiritPowerSpiritPact",
}

SR5.spiritOptionalPowersshadowShade = {
  compulsion                 : "SR5.SpiritPowerCompulsion",
  shadowCloak                : "SR5.SpiritPowerShadowCloak",
  silence                    : "SR5.SpiritPowerSilence",
}

SR5.spiritBasePowersshadowSuccubus = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  banishingResistance        : "SR5.SpiritPowerBanishingResistance",
  energyDrain                : "SR5.SpiritPowerEnergyDrain",
  influence                  : "SR5.SpiritPowerInfluence",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
  spiritPact                 : "SR5.SpiritPowerSpiritPact",
}

SR5.spiritOptionalPowersshadowSuccubus = {
  compulsion                 : "SR5.SpiritPowerCompulsion",
  desireReflexion            : "SR5.SpiritPowerDesireReflexion",
  mutableForm                : "SR5.SpiritPowerMutableForm",
  realisticForm              : "SR5.SpiritPowerRealisticForm",
}

SR5.spiritBasePowersshadowWraith = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  banishingResistance        : "SR5.SpiritPowerBanishingResistance",
  energyDrain                : "SR5.SpiritPowerEnergyDrain",
  influence                  : "SR5.SpiritPowerInfluence",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  sapience                   : "SR5.SpiritPowerSapience",
  spiritPact                 : "SR5.SpiritPowerSpiritPact",
}

SR5.spiritOptionalPowersshadowWraith = {
  compulsion                 : "SR5.SpiritPowerCompulsion",
  confusion                  : "SR5.SpiritPowerConfusion",
  fear                       : "SR5.SpiritPowerFear",
}

SR5.spiritBasePowersshedim = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  deathlyAura                : "SR5.SpiritPowerDeathlyAura",
  energyDrain                : "SR5.SpiritPowerEnergyDrain",
  fear                       : "SR5.SpiritPowerFear",
  immunity                   : "SR5.SpiritPowerImmunity",
  paralyzingTouch            : "SR5.SpiritPowerParalyzingTouch",
  possession                 : "SR5.SpiritPowerPossession",
  sapience                   : "SR5.SpiritPowerSapience",
}

SR5.spiritOptionalPowersshedim = {
  accident                   : "SR5.SpiritPowerAccident",
  auraMasking                : "SR5.SpiritPowerAuraMasking",
  compulsion                 : "SR5.SpiritPowerCompulsion",
  regeneration               : "SR5.SpiritPowerRegeneration", 
  search                     : "SR5.SpiritPowerSearch",
  shadowCloak                : "SR5.SpiritPowerShadowCloak",
  silence                    : "SR5.SpiritPowerSilence",
}

SR5.spiritBasePowersshedimMaster = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  astralGateway              : "SR5.SpiritPowerAstralGateway",
  auraMasking                : "SR5.SpiritPowerAuraMasking",
  banishingResistance        : "SR5.SpiritPowerBanishingResistance",
  compulsion                 : "SR5.SpiritPowerCompulsion",
  deathlyAura                : "SR5.SpiritPowerDeathlyAura",
  energyDrain                : "SR5.SpiritPowerEnergyDrain",
  fear                       : "SR5.SpiritPowerFear",
  immunity                   : "SR5.SpiritPowerImmunity",
  possession                 : "SR5.SpiritPowerPossession",
  regeneration               : "SR5.SpiritPowerRegeneration", 
  sapience                   : "SR5.SpiritPowerSapience",
  shadowCloak                : "SR5.SpiritPowerShadowCloak",
  spiritPact                 : "SR5.SpiritPowerSpiritPact",
}

SR5.spiritOptionalPowersshedimMaster = {
  accident                   : "SR5.SpiritPowerAccident",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
  search                     : "SR5.SpiritPowerSearch",
  silence                    : "SR5.SpiritPowerSilence",
}

SR5.spiritBasePowersludge = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  binding                    : "SR5.SpiritPowerBinding",
  elementalAttackPolluant    : "SR5.SpiritPowerElementalAttackPolluant",
  engulfWater                : "SR5.SpiritPowerEngulfWater",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  mutagen                    : "SR5.SpiritPowerMutagen",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowersludge = {
  accident                   : "SR5.SpiritPowerAccident",
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
}

SR5.spiritBasePowerstask = {
  accident                   : "SR5.SpiritPowerAccident",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  binding                    : "SR5.SpiritPowerBinding",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowerstask = {
  concealment                : "SR5.SpiritPowerConcealment",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  influence                  : "SR5.SpiritPowerInfluence",
  psychokinesis              : "SR5.SpiritPowerPsychokinesis",
}

SR5.spiritBasePowerswater = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  engulfWater                : "SR5.SpiritPowerEngulfWater",
  materialization            : "SR5.SpiritPowerMaterialization",
  movement                   : "SR5.SpiritPowerMovement",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.spiritOptionalPowerswater = {
  accident                   : "SR5.SpiritPowerAccident",
  elementalAttack            : "SR5.SpiritPowerElementalAttack",
  energyAura                 : "SR5.SpiritPowerEnergyAura",
  guard                      : "SR5.SpiritPowerGuard",
  weatherControl             : "SR5.SpiritPowerWeatherControl",
}

SR5.spiritBasePowerswatcher = {
  astralForm                 : "SR5.SpiritPowerAstralForm",
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
}

SR5.AllSpiritPowers = {
  accident                   : "SR5.SpiritPowerAccident",
  animalControl              : "SR5.SpiritPowerAnimalControl",
  astralForm                 : "SR5.SpiritPowerAstralForm",
  astralGateway              : "SR5.SpiritPowerAstralGateway",
  auraMasking                : "SR5.SpiritPowerAuraMasking",
  banishingResistance        : "SR5.SpiritPowerBanishingResistance",
  binding                    : "SR5.SpiritPowerBinding",
  compulsion                 : "SR5.SpiritPowerCompulsion",
  concealment                : "SR5.SpiritPowerConcealment",
  confusion                  : "SR5.SpiritPowerConfusion",
  corrosiveSpit              : "SR5.SpiritPowerCorrosiveSpit",
  deathlyAura                : "SR5.SpiritPowerDeathlyAura",
  desireReflexion            : "SR5.SpiritPowerDesireReflexion",
  divining                   : "SR5.SpiritPowerDivining",
  dualNatured                : "SR5.SpiritPowerDualNatured",
  elementalAttack            : "SR5.SpiritPowerElementalAttack",
  elementalAttackPolluant    : "SR5.SpiritPowerElementalAttackPolluant",
  elementalAttackRadiation   : "SR5.SpiritPowerElementalAttackRadiation",
  energyAura                 : "SR5.SpiritPowerEnergyAura",
  energyDrain                : "SR5.SpiritPowerEnergyDrain",
  engulf                     : "SR5.SpiritPowerEngulf",
  engulfAir                  : "SR5.SpiritPowerEngulfAir",
  engulfEarth                : "SR5.SpiritPowerEngulfEarth",
  engulfFire                 : "SR5.SpiritPowerEngulfFire",
  engulfWater                : "SR5.SpiritPowerEngulfWater",
  enhancedSenses             : "SR5.SpiritPowerEnhancedSenses",
  fear                       : "SR5.SpiritPowerFear",
  guard                      : "SR5.SpiritPowerGuard",
  hiveMind                   : "SR5.SpiritPowerHiveMind",
  immunity                   : "SR5.SpiritPowerImmunity",
  influence                  : "SR5.SpiritPowerInfluence",
  inhabitation               : "SR5.SpiritPowerInhabitation",
  innateSpell                : "SR5.SpiritPowerInnateSpell",
  magicalGuard               : "SR5.SpiritPowerMagicalGuard",
  materialization            : "SR5.SpiritPowerMaterialization",
  mimicry                    : "SR5.SpiritPowerMimicry",
  mindLink                   : "SR5.SpiritPowerMindLink",
  movement                   : "SR5.SpiritPowerMovement",
  mutableForm                : "SR5.SpiritPowerMutableForm",
  mutagen                    : "SR5.SpiritPowerMutagen",
  naturalWeapon              : "SR5.SpiritPowerNaturalWeapon",
  noxiousBreath              : "SR5.SpiritPowerNoxiousBreath",
  paralyzingTouch            : "SR5.SpiritPowerParalyzingTouch",
  pestilence                 : "SR5.SpiritPowerPestilence",
  possession                 : "SR5.SpiritPowerPossession",
  psychokinesis              : "SR5.SpiritPowerPsychokinesis",
  realisticForm              : "SR5.SpiritPowerRealisticForm",
  regeneration               : "SR5.SpiritPowerRegeneration", 
  sapience                   : "SR5.SpiritPowerSapience",
  search                     : "SR5.SpiritPowerSearch",
  shadowCloak                : "SR5.SpiritPowerShadowCloak",
  silence                    : "SR5.SpiritPowerSilence",
  spiritPact                 : "SR5.SpiritPowerSpiritPact",
  venom                      : "SR5.SpiritPowerVenom",
  wealth                     : "SR5.SpiritPowerWealth",
  weatherControl             : "SR5.SpiritPowerWeatherControl",
}

//-----------------------------------//
//            APPAREILS              //
//-----------------------------------//
// Types d'appareil
SR5.deviceTypes = {
  device                    : "SR5.DEVICE_TYPE_Device_F",
  slavedDevice              : "SR5.DEVICE_TYPE_SlavedDevice_F",
  host                      : "SR5.DEVICE_TYPE_Host_F",
  ice                       : "SR5.DEVICE_TYPE_Ice_F",
};

// Types de CI
SR5.iceTypes = {
  iceAcid                   : "SR5.IceAcid",
  iceBinder                 : "SR5.IceBinder",
  iceBlack                  : "SR5.IceBlack",
  iceBlaster                : "SR5.IceBlaster",
  iceCrash                  : "SR5.IceCrash",
  iceJammer                 : "SR5.IceJammer",
  iceKiller                 : "SR5.IceKiller",
  iceMarker                 : "SR5.IceMarker",
  icePatrol                 : "SR5.IcePatrol",
  iceProbe                  : "SR5.IceProbe",
  iceScramble               : "SR5.IceScramble",
  iceSparky                 : "SR5.IceSparky",
  iceTarBaby                : "SR5.IceTarBaby",
  iceTrack                  : "SR5.IceTrack",
}

//-----------------------------------//
//              EFFECTS              //
//-----------------------------------//

SR5.customEffectsTypes = {
  value                     : "SR5.Value",
  valueReplace              : "SR5.ValueReplace",
  rating                    : "SR5.Rating",
  ratingReplace             : "SR5.RatingReplace",
  hits                      : "SR5.DiceHits",
  boolean                   : "SR5.Boolean",
};

SR5.effectTypes = {
  iceAttack                 : "SR5.EffectTypeIceAttack",
  electricityDamage         : "SR5.ElementalDamage",
  acidDamage                : "SR5.ElementalDamage",
  fireDamage                : "SR5.ElementalDamage",
  sensorLock                : "SR5.SensorTargetingActive",
  signalJam                 : "SR5.EffectSignalJam",
  signalJammed              : "SR5.EffectSignalJammed",
  linkLock                  : "SR5.EffectLinkLockedConnection",
}

SR5.effectDuration = {
  round                     : "SR5.CombatTurn",
  permanent                 : "SR5.DurationPermanent",
  special                   : "SR5.DurationSpecial"
}

SR5.specialProperties = {
  concentration             : "SR5.Concentration",
  controlRig                : "SR5.ControlRig",
  smartlink                 : "SR5.Smartlink",
  damageReduction           : "SR5.DamageReduction",
  notoriety                 : "SR5.ReputationNotoriety",
}

SR5.transactionsTypes = {
  gain                      : "SR5.CharacterGain",
  loss                      : "SR5.CharacterExpense",
};

SR5.fireType = {
  natural                   : "SR5.FireNatural",
  magical                   : "SR5.FireMagic",
  weapon                    : "SR5.FireWeapon",
}


//-----------------------------------//
//             ITEM TYPES            //
//-----------------------------------//

SR5.itemTypes = {
  itemAdeptPower            : "ITEM.TypeItemadeptpower",
  itemArmor                 : "ITEM.TypeItemarmor",
  itemAugmentation          : "ITEM.TypeItemaugmentation",
  itemAmmunition            : "ITEM.TypeItemammunition",
  itemComplexForm           : "ITEM.TypeItemcomplexform",
  itemContact               : "ITEM.TypeItemcontact",
  itemDevice                : "ITEM.TypeItemdevice",
  itemEcho                  : "ITEM.TypeItemecho",
  itemEffect                : "ITEM.TypeItemeffect",
  itemFocus                 : "ITEM.TypeItemfocus",
  itemGear                  : "ITEM.TypeItemgear",
  itemKarma                 : "ITEM.TypeItemkarma",
  itemKnowledge             : "ITEM.TypeItemknowledge",
  itemLanguage              : "ITEM.TypeItemlanguage",
  itemLifestyle             : "ITEM.TypeItemlifestyle",
  itemMark                  : "ITEM.TypeItemmark",
  itemMartialArt            : "ITEM.TypeItemmartialart",
  itemMetamagic             : "ITEM.TypeItemmetamagic",
  itemNuyen                 : "ITEM.TypeItemnuyen",
  itemPower                 : "ITEM.TypeItempower",
  itemPreparation           : "ITEM.TypeItempreparation",
  itemProgram               : "ITEM.TypeItemprogram",
  itemQuality               : "ITEM.TypeItemquality",
  itemSin                   : "ITEM.TypeItemsin",
  itemSpell                 : "ITEM.TypeItemspell",
  itemSpirit                : "ITEM.TypeItemspirit",
  itemSprite                : "ITEM.TypeItemsprite",
  itemSpritePower           : "ITEM.TypeItemspritepower",
  itemVehicle               : "ITEM.TypeItemvehicle",
  itemWeapon                : "ITEM.TypeItemweapon",
};

//-----------------------------------//
//             ACTOR TYPES           //
//-----------------------------------//

SR5.actorTypes = {
  actorDevice               : "ACTOR.TypeActordevice",
  actorDrone                : "ACTOR.TypeActordrone",
  actorGrunt                : "ACTOR.TypeActorgrunt",
  actorPc                   : "ACTOR.TypeActorpc",
  actorSpirit               : "ACTOR.TypeActorspirit",
  actorSprite               : "ACTOR.TypeActorsprite",
  actorAgent                : "ACTOR.TypeActoragent",
};

//-----------------------------------//
//          STATUS EFFECTS           //
//-----------------------------------//


SR5.statusEffects = [
  {
    icon: "systems/sr5/img/status/StatusUnconsciousOn.svg",
    id: "unconscious",
    label: "SR5.STATUSES_Unconscious_F",
    flags: {
      core: {
        overlay: true,
      }
    }
  },
  {
    icon: "systems/sr5/img/status/StatusDeadOn.svg",
    id: "dead",
    label: "SR5.STATUSES_Dead_F",
    flags: {
      core: {
        overlay: true,
      }
    },    
  },
  {
    icon: "systems/sr5/img/status/StatusProneOn.svg",
    id: "prone",
    label: "SR5.STATUSES_Prone",
  },
  {
    icon: "systems/sr5/img/status/StatusFullDefense.svg",
    id: "fullDefense",
    label: "SR5.STATUSES_FullDefense",
    origin: "fullDefense"
  },
];

CONFIG.statusEffects = SR5.statusEffects;
