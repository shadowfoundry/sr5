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

// Mental Attributes
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

SR5.magicOrResonance = {
	magic                     : "SR5.Magic",
	resonance                 : "SR5.Resonance",
};

//
SR5.allAttributes = {
	...SR5.characterAttributes,
	...SR5.characterSpecialAttributes
}

SR5.allAttributesWithoutEdge = {
	...SR5.characterAttributes,
	...SR5.magicOrResonance
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

SR5.characterSpecialDefenses = {
	block                     : "SR5.Block",
	dodge                     : "SR5.Dodge",
	parryBlades               : "SR5.ParrySlashing",
	parryClubs                : "SR5.ParryBlunt",
};

SR5.characterSpecialDefensesDodge = {
	dodge                     : "SR5.Dodge",
};

// Resistances
SR5.characterResistances = {
	astralDamage              : "SR5.AstralDamage",
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

// Drugs
SR5.drugs = {
	bliss                     : "SR5.DrugBliss",
	cram                      : "SR5.DrugCram",
	deepweed                  : "SR5.DrugDeepweed",
	jazz                      : "SR5.DrugJazz",
	kamikaze                  : "SR5.DrugKamikaze",
	longHaul                  : "SR5.DrugLongHaul",
	nitro                     : "SR5.DrugNitro",
	novacoke                  : "SR5.DrugNovacoke",
	psyche                    : "SR5.DrugPsyche",
	zen                       : "SR5.DrugZen",
	aexd                      : "SR5.DrugAEXD",
	aisa                      : "SR5.DrugAisa",
	animalTongue              : "SR5.DrugAnimalTongue",
	ayaosWill                 : "SR5.DrugAyaosWill",
	betel                     : "SR5.DrugBetel",
	betameth                  : "SR5.DrugBetameth",
	cereprax                  : "SR5.DrugCeteprax",
	crimsonOrchid             : "SR5.DrugCrimsonOrchid",
	dopadrine                 : "SR5.DrugDopadrine",
	eX                        : "SR5.DrugEX",
	forgetMeNot               : "SR5.DrugForgetMeNot",
	galak                     : "SR5.DrugGalak",
	g3                        : "SR5.DrugG3",
	guts                      : "SR5.DrugGuts",
	hecatesBlessing           : "SR5.DrugHecatesBlessing",
	hurlg                     : "SR5.DrugHurlg",
	immortalFlower            : "SR5.DrugImmortalFlower",
	k10                       : "SR5.DrugK10",
	laes                      : "SR5.DrugLaes",
	leal                      : "SR5.DrugLeal",
	littleSmoke               : "SR5.DrugLittleSmoke",
	memoryFog                 : "SR5.DrugMemoryFog",
	nightwatch                : "SR5.DrugNightwatch",
	noPaint                   : "SR5.DrugNoPaint",
	oneiro                    : "SR5.DrugOneiro",
	oxygenatedFluorocarbons   : "SR5.DrugOxygenatedFluorocarbons",
	overdrive                 : "SR5.DrugOverdrive",
	pixieDust                 : "SR5.DrugPixieDust",
	push                      : "SR5.DrugPush",
	redMescaline              : "SR5.DrugRedMescaline",
	ripper                    : "SR5.DrugRipper",
	rockLizardBlood           : "SR5.DrugRockLizardBlood",
	shade                     : "SR5.DrugShade",
	slab                      : "SR5.DrugSlab",
	snuff                     : "SR5.DrugSnuff",
	soberTime                 : "SR5.DrugSoberTime",
	soothsayer                : "SR5.DrugSoothSayer",
	trance                    : "SR5.DrugTrance",
	woad                      : "SR5.DrugWoad",
	wuduAku                   : "SR5.DrugWuduAku",
	zero                      : "SR5.DrugZero",
	zombieDust                : "SR5.DrugZombieDust",
	zone                      : "SR5.DrugZone",
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

SR5.PCConditionMonitors = {
	physical                  : "SR5.ConditionMonitorPhysicalShort",
	stun                      : "SR5.ConditionMonitorStunShort",
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
	medecine                  : "SR5.SkillMedicine",
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
	languageSkills            : "SR5.LanguagesSkills",
	knowledgeSkills           : "SR5.KnowledgeSkills",
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
	astral                    : "SR5.AstralPerception",
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
	boltHole                  : "SR5.LifestyleBoltHole",
	streets                   : "SR5.LifestyleStreets",
	squatter                  : "SR5.LifestyleSquatter",
	low                       : "SR5.LifestyleLow",
	medium                    : "SR5.LifestyleMedium",
	high                      : "SR5.LifestyleHigh",
	luxury                    : "SR5.LifestyleLuxury",  
	traveler                  : "SR5.LifestyleTraveler",
	commercial                : "SR5.LifestyleCommercial",
  };
  
  // Lifestyle Options Types
  SR5.lifestyleOptionsTypes = {
	asset                   : "SR5.LifestyleOptionsTypesAsset",
	service                 : "SR5.LifestyleOptionsTypesService",
	negativeOption          : "SR5.LifestyleOptionsTypesNegativeOption",
	positiveOption          : "SR5.LifestyleOptionsTypesPositiveOption",
	outing                  : "SR5.LifestyleOptionsTypesOuting",
	modification            : "SR5.LifestyleOptionsTypesModification",
  };
  
  // Lifestyle Options All
  SR5.allLifestyleOptions = {
	addComforts               : "SR5.LifeStyleAddComforts",
	addSecurity               : "SR5.LifeStyleAddSecurity",
	addNeighborhood           : "SR5.LifeStyleAddNeighborhood",
	difficultToFind           : "SR5.LifeStyleOptionDifficultToFind",
	specialWorkArea           : "SR5.LifeStyleOptionSpecialWorkArea",
	cramped                   : "SR5.LifeStyleOptionCramped",
	extraSecure               : "SR5.LifeStyleOptionExtraSecure",
	dangerousArea             : "SR5.LifeStyleOptionDangerousArea",  
	armory                    : "SR5.LifeStyleOptionArmory",
	cleaningServiceStandard   : "SR5.LifeStyleOptionCleaningStandard",
	cleaningServiceMage       : "SR5.LifeStyleOptionCleaningMage",
	cleaningServicePollution  : "SR5.LifeStyleOptionCleaningPollution",
	discreetCleaningService   : "SR5.LifeStyleOptionDiscreetCleaning",
	discreetDeliveryman       : "SR5.LifeStyleOptionDiscreetDeliveryman",
	garageAirplane            : "SR5.LifeStyleOptionGarageAirplane",
	garageBoat                : "SR5.LifeStyleOptionGarageBoat",
	garageSmallCar            : "SR5.LifeStyleOptionGarageSmallCar",
	garageLargeCar            : "SR5.LifeStyleOptionGarageLargeCar",
	garageHelicopter          : "SR5.LifeStyleOptionGarageHelicopter",
	greenHouse                : "SR5.LifeStyleOptionGreenHouse",
	gridSubscription          : "SR5.LifeStyleOptionGridSubscription",
	gym                       : "SR5.LifeStyleOptionGym",
	indoorArboretum           : "SR5.LifeStyleOptionIndoorArboretum",
	localBarPatron            : "SR5.LifeStyleOptionLocalBarPatron",
	merchandiseGoods          : "SR5.LifeStyleOptionMerchandiseGoods",
	merchandisePawnShop       : "SR5.LifeStyleOptionMerchandisePawnShop",
	merchandiseUsedGoods      : "SR5.LifeStyleOptionMerchandiseUsedGoods",
	panicRoom                 : "SR5.LifeStyleOptionPanicRoom",
	patronConcerts            : "SR5.LifeStyleOptionPatronConcerts",
	patronPrivateClub         : "SR5.LifeStyleOptionPatronPrivateClub",
	patronPublicEntertainment : "SR5.LifeStyleOptionPatronPublicEnter",
	patronThemeParks          : "SR5.LifeStyleOptionPatronThemeParks",
	privateRoom               : "SR5.LifeStyleOptionPrivateRoom",
	publicTransportation      : "SR5.LifeStyleOptionPublicTransportation",
	railwayPass               : "SR5.LifeStyleOptionRailwayPass",
	shootingRange             : "SR5.LifeStyleOptionShootingRange",
	soyProcessingUnit         : "SR5.LifeStyleOptionSoyProcessingUnit",
	sportsCourt               : "SR5.LifeStyleOptionSportsCourt",
	swimmingPool              : "SR5.LifeStyleOptionSwimmingPool",
	walkinFreezer             : "SR5.LifeStyleOptionWalkinFreezer",
	workshopFacility          : "SR5.LifeStyleOptionWorkshopFacility",
	yard                      : "SR5.LifeStyleOptionYard",
	zenDenBatCave             : "SR5.LifeStyleOptionZenDenBatCave",
	angryDrunkReputation      : "SR5.LifeStyleOptionAngryDrunkReputation",
	corporateOwned            : "SR5.LifeStyleOptionCorporateOwned",
	hotelCalifornia           : "SR5.LifeStyleOptionHotelCalifornia",
	maidIsOut                 : "SR5.LifeStyleOptionMaidIsOut",
	notAHome                  : "SR5.LifeStyleOptionNotAHome",
	safehouse                 : "SR5.LifeStyleOptionSafehouse",
	safetyThird               : "SR5.LifeStyleOptionSafetyThird",
	wZone                     : "SR5.LifeStyleOptionWZone",
	onlyGoodThingAbout        : "SR5.LifeStyleOptionOnlyGoodThingAbout",
  }
  
  // Lifestyle Options
  SR5.lifestyleOptions = {
	addComforts               : "SR5.LifeStyleAddComforts",
	addSecurity               : "SR5.LifeStyleAddSecurity",
	addNeighborhood           : "SR5.LifeStyleAddNeighborhood",
	difficultToFind           : "SR5.LifeStyleOptionDifficultToFind",
	specialWorkArea           : "SR5.LifeStyleOptionSpecialWorkArea",
	cramped                   : "SR5.LifeStyleOptionCramped",
	extraSecure               : "SR5.LifeStyleOptionExtraSecure",
	dangerousArea             : "SR5.LifeStyleOptionDangerousArea",
	armory                    : "SR5.LifeStyleOptionArmory",
	cleaningServiceStandard   : "SR5.LifeStyleOptionCleaningStandard",
	cleaningServiceMage       : "SR5.LifeStyleOptionCleaningMage",
	cleaningServicePollution  : "SR5.LifeStyleOptionCleaningPollution",
	discreetCleaningService   : "SR5.LifeStyleOptionDiscreetCleaning",
	discreetDeliveryman       : "SR5.LifeStyleOptionDiscreetDeliveryman",
	garageAirplane            : "SR5.LifeStyleOptionGarageAirplane",
	garageBoat                : "SR5.LifeStyleOptionGarageBoat",
	garageSmallCar            : "SR5.LifeStyleOptionGarageSmallCar",
	garageLargeCar            : "SR5.LifeStyleOptionGarageLargeCar",
	garageHelicopter          : "SR5.LifeStyleOptionGarageHelicopter",
	greenHouse                : "SR5.LifeStyleOptionGreenHouse",
	gridSubscription          : "SR5.LifeStyleOptionGridSubscription",
	gym                       : "SR5.LifeStyleOptionGym",
	indoorArboretum           : "SR5.LifeStyleOptionIndoorArboretum",
	localBarPatron            : "SR5.LifeStyleOptionLocalBarPatron",
	panicRoom                 : "SR5.LifeStyleOptionPanicRoom",
	patronConcerts            : "SR5.LifeStyleOptionPatronConcerts",
	patronPrivateClub         : "SR5.LifeStyleOptionPatronPrivateClub",
	patronPublicEntertainment : "SR5.LifeStyleOptionPatronPublicEnter",
	patronThemeParks          : "SR5.LifeStyleOptionPatronThemeParks",
	privateRoom               : "SR5.LifeStyleOptionPrivateRoom",
	publicTransportation      : "SR5.LifeStyleOptionPublicTransportation",
	railwayPass               : "SR5.LifeStyleOptionRailwayPass",
	shootingRange             : "SR5.LifeStyleOptionShootingRange",
	soyProcessingUnit         : "SR5.LifeStyleOptionSoyProcessingUnit",
	sportsCourt               : "SR5.LifeStyleOptionSportsCourt",
	swimmingPool              : "SR5.LifeStyleOptionSwimmingPool",
	workshopFacility          : "SR5.LifeStyleOptionWorkshopFacility",
	yard                      : "SR5.LifeStyleOptionYard",
	zenDenBatCave             : "SR5.LifeStyleOptionZenDenBatCave",
	angryDrunkReputation      : "SR5.LifeStyleOptionAngryDrunkReputation",
	corporateOwned            : "SR5.LifeStyleOptionCorporateOwned",
	hotelCalifornia           : "SR5.LifeStyleOptionHotelCalifornia",
	maidIsOut                 : "SR5.LifeStyleOptionMaidIsOut",
	notAHome                  : "SR5.LifeStyleOptionNotAHome",
	safehouse                 : "SR5.LifeStyleOptionSafehouse",
	safetyThird               : "SR5.LifeStyleOptionSafetyThird",
	wZone                     : "SR5.LifeStyleOptionWZone",
  };
  
  // Lifestyle Options boltHole
  SR5.lifestyleOptionsBoltHole = {
	addComforts               : "SR5.LifeStyleAddComforts",
	addSecurity               : "SR5.LifeStyleAddSecurity",
	addNeighborhood           : "SR5.LifeStyleAddNeighborhood",
	difficultToFind           : "SR5.LifeStyleOptionDifficultToFind",
	specialWorkArea           : "SR5.LifeStyleOptionSpecialWorkArea",
	cramped                   : "SR5.LifeStyleOptionCramped",
	extraSecure               : "SR5.LifeStyleOptionExtraSecure",
	dangerousArea             : "SR5.LifeStyleOptionDangerousArea",
	armory                    : "SR5.LifeStyleOptionArmory",
	garageAirplane            : "SR5.LifeStyleOptionGarageAirplane",
	garageBoat                : "SR5.LifeStyleOptionGarageBoat",
	garageSmallCar            : "SR5.LifeStyleOptionGarageSmallCar",
	garageLargeCar            : "SR5.LifeStyleOptionGarageLargeCar",
	garageHelicopter          : "SR5.LifeStyleOptionGarageHelicopter",
	greenHouse                : "SR5.LifeStyleOptionGreenHouse",
	gridSubscription          : "SR5.LifeStyleOptionGridSubscription",
	gym                       : "SR5.LifeStyleOptionGym",
	indoorArboretum           : "SR5.LifeStyleOptionIndoorArboretum",
	panicRoom                 : "SR5.LifeStyleOptionPanicRoom",
	privateRoom               : "SR5.LifeStyleOptionPrivateRoom",
	shootingRange             : "SR5.LifeStyleOptionShootingRange",
	soyProcessingUnit         : "SR5.LifeStyleOptionSoyProcessingUnit",
	sportsCourt               : "SR5.LifeStyleOptionSportsCourt",
	swimmingPool              : "SR5.LifeStyleOptionSwimmingPool",
	workshopFacility          : "SR5.LifeStyleOptionWorkshopFacility",
	yard                      : "SR5.LifeStyleOptionYard",
	zenDenBatCave             : "SR5.LifeStyleOptionZenDenBatCave",
	angryDrunkReputation      : "SR5.LifeStyleOptionAngryDrunkReputation",
	corporateOwned            : "SR5.LifeStyleOptionCorporateOwned",
	hotelCalifornia           : "SR5.LifeStyleOptionHotelCalifornia",
	maidIsOut                 : "SR5.LifeStyleOptionMaidIsOut",
	notAHome                  : "SR5.LifeStyleOptionNotAHome",
	safehouse                 : "SR5.LifeStyleOptionSafehouse",
	safetyThird               : "SR5.LifeStyleOptionSafetyThird",
	wZone                     : "SR5.LifeStyleOptionWZone",
  };
  
  // Lifestyle Options Traveler
  SR5.lifestyleOptionsTraveler = {
	addComforts               : "SR5.LifeStyleAddComforts",
	addSecurity               : "SR5.LifeStyleAddSecurity",
	difficultToFind           : "SR5.LifeStyleOptionDifficultToFind",
	specialWorkArea           : "SR5.LifeStyleOptionSpecialWorkArea",
	cramped                   : "SR5.LifeStyleOptionCramped",
	extraSecure               : "SR5.LifeStyleOptionExtraSecure",
	dangerousArea             : "SR5.LifeStyleOptionDangerousArea", 
	armory                    : "SR5.LifeStyleOptionArmory",
	cleaningServiceStandard   : "SR5.LifeStyleOptionCleaningStandard",
	cleaningServiceMage       : "SR5.LifeStyleOptionCleaningMage",
	cleaningServicePollution  : "SR5.LifeStyleOptionCleaningPollution",
	discreetCleaningService   : "SR5.LifeStyleOptionDiscreetCleaning",
	discreetDeliveryman       : "SR5.LifeStyleOptionDiscreetDeliveryman",
	garageAirplane            : "SR5.LifeStyleOptionGarageAirplane",
	garageBoat                : "SR5.LifeStyleOptionGarageBoat",
	garageSmallCar            : "SR5.LifeStyleOptionGarageSmallCar",
	garageLargeCar            : "SR5.LifeStyleOptionGarageLargeCar",
	garageHelicopter          : "SR5.LifeStyleOptionGarageHelicopter",
	greenHouse                : "SR5.LifeStyleOptionGreenHouse",
	gridSubscription          : "SR5.LifeStyleOptionGridSubscription",
	gym                       : "SR5.LifeStyleOptionGym",
	indoorArboretum           : "SR5.LifeStyleOptionIndoorArboretum",
	panicRoom                 : "SR5.LifeStyleOptionPanicRoom",
	privateRoom               : "SR5.LifeStyleOptionPrivateRoom",
	publicTransportation      : "SR5.LifeStyleOptionPublicTransportation",
	railwayPass               : "SR5.LifeStyleOptionRailwayPass",
	shootingRange             : "SR5.LifeStyleOptionShootingRange",
	soyProcessingUnit         : "SR5.LifeStyleOptionSoyProcessingUnit",
	sportsCourt               : "SR5.LifeStyleOptionSportsCourt",
	swimmingPool              : "SR5.LifeStyleOptionSwimmingPool",
	workshopFacility          : "SR5.LifeStyleOptionWorkshopFacility",
	yard                      : "SR5.LifeStyleOptionYard",
	zenDenBatCave             : "SR5.LifeStyleOptionZenDenBatCave",
	angryDrunkReputation      : "SR5.LifeStyleOptionAngryDrunkReputation",
	corporateOwned            : "SR5.LifeStyleOptionCorporateOwned",
	hotelCalifornia           : "SR5.LifeStyleOptionHotelCalifornia",
	maidIsOut                 : "SR5.LifeStyleOptionMaidIsOut",
	notAHome                  : "SR5.LifeStyleOptionNotAHome",
	onlyGoodThingAbout        : "SR5.LifeStyleOptionOnlyGoodThingAbout",
	safehouse                 : "SR5.LifeStyleOptionSafehouse",
	safetyThird               : "SR5.LifeStyleOptionSafetyThird",
	thrifty                   : "SR5.LifeStyleOptionThrifty",
	wZone                     : "SR5.LifeStyleOptionWZone",
  };
  
  // Lifestyle Options for Commercial
  SR5.lifestyleOptionsCommercial = {
	addComforts               : "SR5.LifeStyleAddComforts",
	addSecurity               : "SR5.LifeStyleAddSecurity",
	addNeighborhood           : "SR5.LifeStyleAddNeighborhood",
	difficultToFind           : "SR5.LifeStyleOptionDifficultToFind",
	specialWorkArea           : "SR5.LifeStyleOptionSpecialWorkArea",
	cramped                   : "SR5.LifeStyleOptionCramped",
	extraSecure               : "SR5.LifeStyleOptionExtraSecure",
	dangerousArea             : "SR5.LifeStyleOptionDangerousArea",  
	armory                    : "SR5.LifeStyleOptionArmory",
	cleaningServiceStandard   : "SR5.LifeStyleOptionCleaningStandard",
	cleaningServiceMage       : "SR5.LifeStyleOptionCleaningMage",
	cleaningServicePollution  : "SR5.LifeStyleOptionCleaningPollution",
	discreetCleaningService   : "SR5.LifeStyleOptionDiscreetCleaning",
	discreetDeliveryman       : "SR5.LifeStyleOptionDiscreetDeliveryman",
	garageAirplane            : "SR5.LifeStyleOptionGarageAirplane",
	garageBoat                : "SR5.LifeStyleOptionGarageBoat",
	garageSmallCar            : "SR5.LifeStyleOptionGarageSmallCar",
	garageLargeCar            : "SR5.LifeStyleOptionGarageLargeCar",
	garageHelicopter          : "SR5.LifeStyleOptionGarageHelicopter",
	greenHouse                : "SR5.LifeStyleOptionGreenHouse",
	gridSubscription          : "SR5.LifeStyleOptionGridSubscription",
	gym                       : "SR5.LifeStyleOptionGym",
	indoorArboretum           : "SR5.LifeStyleOptionIndoorArboretum",
	localBarPatron            : "SR5.LifeStyleOptionLocalBarPatron",
	merchandiseGoods          : "SR5.LifeStyleOptionMerchandiseGoods",
	merchandisePawnShop       : "SR5.LifeStyleOptionMerchandisePawnShop",
	merchandiseUsedGoods      : "SR5.LifeStyleOptionMerchandiseUsedGoods",
	panicRoom                 : "SR5.LifeStyleOptionPanicRoom",
	patronConcerts            : "SR5.LifeStyleOptionPatronConcerts",
	patronPrivateClub         : "SR5.LifeStyleOptionPatronPrivateClub",
	patronPublicEntertainment : "SR5.LifeStyleOptionPatronPublicEnter",
	patronThemeParks          : "SR5.LifeStyleOptionPatronThemeParks",
	privateRoom               : "SR5.LifeStyleOptionPrivateRoom",
	publicTransportation      : "SR5.LifeStyleOptionPublicTransportation",
	railwayPass               : "SR5.LifeStyleOptionRailwayPass",
	shootingRange             : "SR5.LifeStyleOptionShootingRange",
	soyProcessingUnit         : "SR5.LifeStyleOptionSoyProcessingUnit",
	sportsCourt               : "SR5.LifeStyleOptionSportsCourt",
	swimmingPool              : "SR5.LifeStyleOptionSwimmingPool",
	walkinFreezer             : "SR5.LifeStyleOptionWalkinFreezer",
	workshopFacility          : "SR5.LifeStyleOptionWorkshopFacility",
	yard                      : "SR5.LifeStyleOptionYard",
	zenDenBatCave             : "SR5.LifeStyleOptionZenDenBatCave",
	angryDrunkReputation      : "SR5.LifeStyleOptionAngryDrunkReputation",
	corporateOwned            : "SR5.LifeStyleOptionCorporateOwned",
	hotelCalifornia           : "SR5.LifeStyleOptionHotelCalifornia",
	maidIsOut                 : "SR5.LifeStyleOptionMaidIsOut",
	notAHome                  : "SR5.LifeStyleOptionNotAHome",
	safehouse                 : "SR5.LifeStyleOptionSafehouse",
	safetyThird               : "SR5.LifeStyleOptionSafetyThird",
	wZone                     : "SR5.LifeStyleOptionWZone",
  };

// Reputation
SR5.reputationTypes = {
	streetCred                : "SR5.ReputationStreetCred",
	notoriety                 : "SR5.ReputationNotoriety",
	publicAwareness           : "SR5.ReputationPublicAwareness",
}

SR5.actionTypes = {
	free                      : "SR5.ActionTypeFree",
	simple                    : "SR5.ActionTypeSimple",
	complex                   : "SR5.ActionTypeComplex",
	interruption              : "SR5.ActionTypeInterruption",
	special 				  : "SR5.ActionTypeSpecial",
}

SR5.actionSources = {
	activateFocus			  : "SR5.ActionSourceActivateFocus",
	attack					  : "SR5.ActionSourceAttack",
	calledShot				  : "SR5.ActionSourceCalledShot",
	callSpirit 				  : "SR5.ActionSourceCallSpirit",
	callSprite 				  : "SR5.ActionSourceCallSprite",
	castRecklessSpell		  : "SR5.ActionSourceCastRecklessSpell",
	castSpell				  : "SR5.ActionSourceCastSpell",
	changeChokeSettings       : "SR5.ActionSourceChangeChokeSettings",
	changeFiringMode		  : "SR5.ActionSourceChangeFiringMode",
	changeSilentMode		  : "SR5.ActionSourceChangeSilentMode",
	complexForm				  : "SR5.ActionSourceComplexForm",
	desactivateFocus		  : "SR5.ActionSourceDesactivateFocus",
	dismissSpirit			  : "SR5.ActionSourceDismissSpirit",
	dismissSprite			  : "SR5.ActionSourceDismissSprite",
	insertClip				  : "SR5.ActionSourceInsertClip",
	insertRound				  : "SR5.ActionSourceInsertRound",
	loadAgent				  : "SR5.ActionSourceLoadAgent",
	loadProgram     		  : "SR5.ActionSourceLoadProgram",
	manual		     		  : "SR5.ActionSourceManual",
	matrixAction              : "SR5.ActionSourceMatrixAction",
	ramming					  : "SR5.ActionSourceRamming",
	rebootDeck				  : "SR5.ActionSourceRebootDeck",
	replaceClip				  : "SR5.ActionSourceReplaceClip",
	removeClip				  : "SR5.ActionSourceRemoveClip",
	standUp  				  : "SR5.ActionSourceStandUp",
	switchAttributes		  : "SR5.ActionSourceSwitchAttributes",
	switchInitToAstral		  : "SR5.ActionSourceSwitchInitToAstral",
	switchInitToPhysical	  : "SR5.ActionSourceSwitchInitToPhysical",
	switchInitToMatrix		  : "SR5.ActionSourceSwitchInitToMatrix",
	switchPerception		  : "SR5.ActionSourceSwitchPerception",
	takeCover				  : "SR5.ActionSourceTakeCover",
	turnOnWifi				  : "SR5.ActionSourceTurnOnWifi",
	turnOffWifi				  : "SR5.ActionSourceTurnOffWifi",
	unloadAgent				  : "SR5.ActionSourceUnloadAgent",
	unloadProgram	 		  : "SR5.ActionSourceUnloadProgram",
	useActiveSensor			  : "SR5.ActionSourceUseActiveSensor",
	useCentering 			  : "SR5.ActionSourceUseCentering",
	usePreparation			  : "SR5.ActionSourceUsePreparation",
	useSkill				  : "SR5.ActionSourceUseSkill",
	vehicleTest				  : "SR5.ActionSourceVehicleTest",
}

//-----------------------------------//
//            SCENES                 //
//-----------------------------------//

SR5.environModVisibility = {
	0: "SR5.EnvironmentalVisibilityClear",
	1: "SR5.EnvironmentalVisibilityLight",
	2: "SR5.EnvironmentalVisibilityModerate",
	3: "SR5.EnvironmentalVisibilityHeavy",
}

SR5.environModLight = {
	0: "SR5.EnvironmentalLightFull",
	1: "SR5.EnvironmentalLightPartial",
	2: "SR5.EnvironmentalLightDim",
	3: "SR5.EnvironmentalLightDarkness",
}

SR5.environModGlare = {
	0: "SR5.EnvironmentalGlareNo",
	1: "SR5.EnvironmentalGlareWeak",
	2: "SR5.EnvironmentalGlareModerate",
	3: "SR5.EnvironmentalGlareBlinding",
}

SR5.environModWind = {
	0: "SR5.EnvironmentalWindNone",
	1: "SR5.EnvironmentalWindLight",
	2: "SR5.EnvironmentalWindModerate",
	3: "SR5.EnvironmentalWindStrong",
}

SR5.matrixSpam = {
	0: "SR5.None",
	1: "SR5.SceneSpamCity",
	2: "SR5.SceneSpamSprawl",
	3: "SR5.SceneSpamMajorEvent",
	4: "SR5.SceneSpamCityCommercial",
	5: "SR5.SceneSpamSprawlCommercial",
	6: "SR5.SceneSpamMassiveGatering",
}

SR5.matrixStatic = {
	0: "SR5.None",
	1: "SR5.SceneStaticAbandonedBuilding",
	2: "SR5.SceneStaticAbandonedNeighborhood",
	3: "SR5.SceneStaticRuralArea",
	4: "SR5.SceneStaticWilderness",
	5: "SR5.SceneStaticRemotePlace",
	6: "SR5.SceneStaticRemoteEnclosedPlace",
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
	FA                        : "SR5.WeaponModeFAShort",
	FAc                       : "SR5.WeaponModeFAcShort",
	SF                        : "SR5.WeaponModeSFShort",
};

// Weapon Ranges
SR5.weaponRanges ={
	short                     : "SR5.WeaponRangeShort",
	medium                    : "SR5.WeaponRangeMedium",
	long                      : "SR5.WeaponRangeLong",
	extreme                   : "SR5.WeaponRangeExtreme",
};

// Choke settings
SR5.chokeSettings ={
	narrow                    : "SR5.ChokeSettingsNarrowSpread",
	medium                    : "SR5.ChokeSettingsMediumSpread",
	wide                      : "SR5.ChokeSettingsWideSpread",
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
	unarmedCombat             : "SR5.MeleeWeaponTypeUnarmed",
	exoticMeleeWeapon         : "SR5.MeleeWeaponTypeOther",
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
	exoticRangedWeapon        : "SR5.WeaponTypeSpecial",
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
	exoticRangedWeapon        : "SR5.WeaponTypeSpecial",
};

// Types d'arbalète
SR5.rangedWeaponCrossbowTypes = {
	heavyCrossbow             : "SR5.WeaponTypeHeavyCrossbow",
	lightCrossbow             : "SR5.WeaponTypeLightCrossbow",
	mediumCrossbow            : "SR5.WeaponTypeMediumCrossbow",
	harpoonGuns               : "SR5.WeaponTypeHarpoonGuns",
	exoticRangedWeapon        : "SR5.WeaponTypeSpecial",
};

SR5.rangedWeaponTaserTypes = {
	taser                     : "SR5.WeaponTypeTaser",
	exoticRangedWeapon        : "SR5.WeaponTypeSpecial",
};

SR5.rangedWeaponLauncherTypes = {
	missileLauncher           : "SR5.WeaponTypeMissileLauncher",
	exoticRangedWeapon        : "SR5.WeaponTypeSpecial",
};

SR5.rangedWeaponGrenadeLauncherTypes = {
	grenadeLauncher           : "SR5.WeaponTypeGrenadeLauncher",
	exoticRangedWeapon        : "SR5.WeaponTypeSpecial",
};

SR5.rangedWeaponCanonTypes = {
	assaultCannon             : "SR5.WeaponTypeAssaultCannon",
	exoticRangedWeapon        : "SR5.WeaponTypeSpecial",
};

SR5.weaponUsingFlareTypes = {
	shotgun                   : "SR5.WeaponTypeShotgun",
	heavyPistol               : "SR5.WeaponTypeHeavyPistol",
	assaultRifle              : "SR5.WeaponTypeAssaultRifle",
	submachineGun             : "SR5.WeaponTypeSubmachineGun",
}

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
	gyrojet                   : "SR5.AmmunitionTypeGyrojet",
	gyrojetTaser              : "SR5.AmmunitionTypeGyrojetTaser",
	injection                 : "SR5.AmmunitionTypeInjectionDart",
	flare                     : "SR5.AmmunitionTypeFlare",
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
	arrowBarbedHead           : "SR5.AmmunitionTypeArrowBarbedHead",
	arrowExplosiveHead	      : "SR5.AmmunitionTypeArrowExplosiveHead",
	arrowHammerhead		   	  : "SR5.AmmunitionTypeArrowHammerhead",
	arrowIncendiaryHead	      : "SR5.AmmunitionTypeArrowIncendiaryHead",
	arrowScreamerHead	      : "SR5.AmmunitionTypeArrowScreamerHead",
	arrowStickNShock          : "SR5.AmmunitionTypeArrowStickNShock",
	arrowStaticShaft		  : "SR5.AmmunitionTypeArrowStaticShaft",
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
	gauss                     : "SR5.AmmunitionTypeGauss"
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
	additionalClipMagazine    : "SR5.AccessoryAdditionalClipMagazine",
	advancedSafetySystem      : "SR5.AccessoryAdvancedSafetySystem",
	advancedSafetySystemElec  : "SR5.AccessoryAdvancedSafetySystemElec",
	advancedSafetySystemExSD  : "SR5.AccessoryAdvancedSafetySystemExSD",
	advancedSafetySystemImmo  : "SR5.AccessoryAdvancedSafetySystemImmo",
	advancedSafetySystemSelfD : "SR5.AccessoryAdvancedSafetySystemSelfD",
	airburstLink              : "SR5.AccessoryAirburstLink",
	ammoSkipSystem            : "SR5.AccessoryAmmoSkipSystem",
	batteryBackPack           : "SR5.AccessoryBatteryBackPack",
	batteryClip               : "SR5.AccessoryBatteryClip",
	batteryPack               : "SR5.AccessoryBatteryPack",
	bayonet                   : "SR5.AccessoryBayonet",
	bipod                     : "SR5.AccessoryBipod",
	capBall                   : "SR5.AccessoryCapBall",
	ceramicPlasteelCompo1     : "SR5.AccessoryCeramicPlasteelCompo1",
	ceramicPlasteelCompo2     : "SR5.AccessoryCeramicPlasteelCompo2",
	ceramicPlasteelCompo3     : "SR5.AccessoryCeramicPlasteelCompo3",
	ceramicPlasteelCompo4     : "SR5.AccessoryCeramicPlasteelCompo4",
	ceramicPlasteelCompo5     : "SR5.AccessoryCeramicPlasteelCompo5",
	ceramicPlasteelCompo6     : "SR5.AccessoryCeramicPlasteelCompo6",
	chameleonCoating          : "SR5.AccessoryChameleonCoating",
	concealableHolster        : "SR5.AccessoryConcealableHolster",
	concealedQDHolster        : "SR5.AccessoryConcealedQDHolster",
	customLook                : "SR5.AccessoryCustomLook",
	easyBreakdownManual       : "SR5.AccessoryEasyBreakdownManual",
	easyBreakdownPowered      : "SR5.AccessoryEasyBreakdownPowered",
	electronicFiring          : "SR5.AccessoryElectronicFiring",
	explosiveClip             : "SR5.AccessoryExplosiveClip",
	extendedBarrel            : "SR5.AccessoryExtendedBarrel",
	extendedClip1             : "SR5.AccessoryExtendedClip1",
	extendedClip2             : "SR5.AccessoryExtendedClip2",
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
	holographicSight          : "SR5.AccessoryHolographicSight",
	hiddenArmSlide            : "SR5.AccessoryHiddenArmSlide",
	hipPad                    : "SR5.AccessoryHipPad",
	imagingScope              : "SR5.AccessoryImagingScope",
	improvedRangeFinder       : "SR5.AccessoryImprovedRangeFinder",
	krimePack                 : "SR5.AccessoryKrimePack",
	krimeStunONet             : "SR5.AccessoryKrimeStunONet",
	laserSight                : "SR5.AccessoryLaserSight",
	longbarrel                : "SR5.AccessoryLongbarrel",
	meleeHardening            : "SR5.AccessoryMeleeHardening",
	mountedCrossbow           : "SR5.AccessoryMountedCrossbow",
	narcojectDazzler          : "SR5.AccessoryNarcojectDazzler",
	overcloked                : "SR5.AccessoryOverclocked",
	periscope                 : "SR5.AccessoryPeriscope",
	personalizedGrip          : "SR5.AccessoryPersonalizedGrip",
	quickDrawHolster          : "SR5.AccessoryQuickDrawHolster",
	redDotSight               : "SR5.AccessoryRedDotSight",
	reducedWeight             : "SR5.AccessoryReducedWeight",
	retractibleBayonet        : "SR5.AccessoryRetractibleBayonet",
	sawedoffShortbarrel       : "SR5.AccessorySawedoffShortbarrel",
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
	stockRemoval              : "SR5.AccessoryStockRemoval",
	tracker                   : "SR5.AccessoryTracker",
	triggerRemoval            : "SR5.AccessoryTriggerRemoval",
	tripod                    : "SR5.AccessoryTripod",
	trollAdaptation           : "SR5.AccessoryTrollAdaptation",
	underbarrelBolaLauncher   : "SR5.AccessoryUnderbarrelBolaLauncher",
	underbarrelChainsaw       : "SR5.AccessoryUnderbarrelChainsaw",
	underbarrelLaser          : "SR5.AccessoryUnderbarrelLaser",
	underbarrelFlamethrower   : "SR5.AccessoryUnderbarrelFlamethrower",
	underbarrelGrappleGun     : "SR5.AccessoryUnderbarrelGrappleGun",
	underbarrelGrenadeLauncher : "SR5.AccessoryUnderbarrelGrenadeLauncher",
	underbarrelShotgun        : "SR5.AccessoryUnderbarrelShotgun",
	vintage                   : "SR5.AccessoryVintage",
	weaponCommlink            : "SR5.AccessoryWeaponCommlink",
	weaponPersonality         : "SR5.AccessoryWeaponPersonality",
};

//Weapon Accessory Types
SR5.weaponAccessoryTypes = {
	accessory                 : "SR5.WeaponAccessoryTypeAccessory",
	modification              : "SR5.WeaponAccessoryTypeModification",
	trait                     : "SR5.WeaponAccessoryTypeTrait",
};

//Weapon Accessory Slot
SR5.weaponAccessorySlots = {
	top                       : "SR5.WeaponAccessorySlotTop",
	underneath                : "SR5.WeaponAccessorySlotUnderneath",
	side                      : "SR5.WeaponAccessorySlotSide",
	internal                  : "SR5.WeaponAccessorySlotInternal",
	barrel                    : "SR5.WeaponAccessorySlotBarrel",
	stock                     : "SR5.WeaponAccessorySlotStock",
};

// Toxins
SR5.toxinTypes = {
	airEngulf                 : "SR5.SpiritPowerEngulfAir",
	gamma                     : "SR5.ToxinGamma",
	csTearGas                 : "SR5.ToxinCSTearGas",
	pepperPunch               : "SR5.ToxinPepperPunch",
	nauseaGas                 : "SR5.ToxinNauseaGas",
	narcoject                 : "SR5.ToxinNarcojet",
	neuroStunHeight           : "SR5.ToxinNeuroStunHeight",
	neuroStunNine             : "SR5.ToxinNeuroStunNine",
	neuroStunTen              : "SR5.ToxinNeuroStunTen",
	seven                     : "SR5.ToxinSeven",
	kokoroCobraVenom          : "SR5.ToxinKokoroCobraVenom",
	deathrattleVenom          : "SR5.ToxinDeathrattleVenom",
	flatwormViperVenom		  : "SR5.ToxinFlatwormViperVenom",
	glowRatVenom			  : "SR5.ToxinGlowRatVenom",	
	iridescentOwlVenom		  : "SR5.ToxinIridescentOwlFeathersVenom",
	nagaVenom                 : "SR5.ToxinNagaVenom",	
	novaScorpionVenom         : "SR5.ToxinNovaScorpionVenom",
	martichorasVenom          : "SR5.ToxinMartichorasVenom",
	montaukVenom              : "SR5.ToxinMontaukVenom",
	snakeVenom                : "SR5.ToxinSnakeVenom",
	snowSnakeVenom            : "SR5.ToxinSnowSnakeVenom",
	spiderBeastVenom          : "SR5.ToxinSpiderBeastVenom",
	voidWaspVenom             : "SR5.ToxinVoidWaspVenom",
	noxiousBreath             : "SR5.SpiritPowerNoxiousBreath",
};

// Toxins Effects
SR5.toxinEffects = {
	disorientation            : "SR5.ToxinEffectDisorientation",
	nausea                    : "SR5.ToxinEffectNausea",
	paralysis                 : "SR5.ToxinEffectParalysis",
	agony                     : "SR5.ToxinEffectAgony",
	arcaneInhibitor			  : "SR5.ToxinEffectArcaneInhibitor",
};

//Cover
SR5.coverTypes = {
	none                      : "SR5.CoverNone",
	partial                   : "SR5.CoverPartial",
	full                      : "SR5.CoverFull",
}


// Called Shots
SR5.calledShots = {
	ammoSpecific              : "SR5.CS_AmmoSpecific",
	blastOutOfHand            : "SR5.CS_BlastOutOfHand",
	dirtyTrick                : "SR5.CS_DirtyTrick",
	entanglement              : "SR5.CS_Entanglement",
	pin                       : "SR5.CS_Pin",
	shakeUp                   : "SR5.CS_ShakeUp",
	splittingDamage           : "SR5.CS_SplittingDamage",
	specificTarget            : "SR5.CS_SpecificTarget",
	trickShot                 : "SR5.CS_TrickShot",
	disarm                    : "SR5.CS_Disarm",
	feint                     : "SR5.CS_Feint",
	knockdown                 : "SR5.CS_Knockdown",
	reversal                  : "SR5.CS_Reversal",
	extremeIntimidation       : "SR5.CS_AS_ExtremeIntimidation",
	ricochetShot              : "SR5.CS_AS_RicochetShot",
	warningShot               : "SR5.CS_AS_WarningShot",
	hitEmWhereItCounts        : "SR5.CS_AS_HitEmWhereItCounts",
	onPinsAndNeedles          : "SR5.CS_AS_OnPinsAndNeedles",
	shreddedFlesh             : "SR5.CS_AS_ShreddedFlesh",
	tag                       : "SR5.CS_AS_Tag",
	throughAndInto            : "SR5.CS_AS_ThroughAndInto",
	upTheAnte                 : "SR5.CS_AS_UpTheAnte",
	harderKnock               : "SR5.CS_HarderKnock",
	vitals                    : "SR5.CS_Vitals",
	breakWeapon				  : "SR5.CS_BreakWeapon",
};

SR5.calledShotsSpecifics = {  
	ankle                     : "SR5.CS_ST_Ankle",
	ear                       : "SR5.CS_ST_Ear",
	eye                       : "SR5.CS_ST_Eye",
	foot                      : "SR5.CS_ST_Foot",
	forearm                   : "SR5.CS_ST_Forearm",
	genitals                  : "SR5.CS_ST_Genitals",
	gut                       : "SR5.CS_ST_Gut",
	hand                      : "SR5.CS_ST_Hand",
	hip                       : "SR5.CS_ST_Hip",
	jaw                       : "SR5.CS_ST_Jaw",
	knee                      : "SR5.CS_ST_Knee",
	neck                      : "SR5.CS_ST_Neck",
	shin                      : "SR5.CS_ST_Shin",
	shoulder                  : "SR5.CS_ST_Shoulder",
	sternum                   : "SR5.CS_ST_Sternum",
	thigh                     : "SR5.CS_ST_Thigh",  
	engineBlock               : "SR5.CS_ST_EngineBlock",
	fuelTankBattery           : "SR5.CS_ST_FuelTankBattery",
	axle                      : "SR5.CS_ST_Axle",
	antenna                   : "SR5.CS_ST_Antenna",
	doorLock                  : "SR5.CS_ST_DoorLock",
	windowMotor               : "SR5.CS_ST_WindowMotor",  
	bellringer                : "SR5.CS_AS_Bellringer",
	bullsEye                  : "SR5.CS_AS_BullsEye",
	downTheGullet             : "SR5.CS_AS_DownTheGullet",
	extremeIntimidation       : "SR5.CS_AS_ExtremeIntimidation",
	fingerPopper              : "SR5.CS_AS_FingerPopper",
	flashBlind                : "SR5.CS_AS_FlashBlind",
	flameOn                   : "SR5.CS_AS_FlameOn",
	hereMuckInYourEye         : "SR5.CS_AS_HereMuckInYourEye",
	shakeRattle               : "SR5.CS_AS_ShakeRattle",
}

SR5.calledShotsAll = {
	...SR5.calledShots,
	...SR5.calledShotsSpecifics,
}

// Called Shots Effects
SR5.calledShotsEffects = {
	slowed                   : "SR5.STATUSES_Slowed",
	winded                   : "SR5.STATUSES_Winded",
	deafened                 : "SR5.STATUSES_Deafened",
	stunned                  : "SR5.STATUSES_Stunned",
	blinded                  : "SR5.STATUSES_Blinded",
	brokenGrip               : "SR5.STATUSES_BrokenGrip",
	weakSide                 : "SR5.STATUSES_WeakSide",
	nauseous                 : "SR5.STATUSES_Nauseous",
	buckled                  : "SR5.STATUSES_Buckled",
	slowDeath                : "SR5.STATUSES_SlowDeath",
	knockdown                : "SR5.STATUSES_Knockdown",
	unableToSpeak            : "SR5.STATUSES_UnableToSpeak",
	bleedOut                 : "SR5.STATUSES_BleedOut",
	oneArmBandit             : "SR5.STATUSES_OneArmBandit",
	fatigued                 : "SR5.STATUSES_Fatigued",
	pin                      : "SR5.STATUSES_Pin",
	dirtyTrick               : "SR5.STATUSES_DirtyTrick",
	entanglement             : "SR5.STATUSES_Entanglement",
	trickShot                : "SR5.STATUSES_TrickShot",
	antenna                  : "SR5.STATUSES_Antenna",
	engineBlock              : "SR5.STATUSES_EngineBlock",
	windowMotor              : "SR5.STATUSES_WindowMotor",
	doorLock                 : "SR5.STATUSES_DoorLock",
	axle                     : "SR5.STATUSES_Axle",
	fuelTankBattery          : "SR5.STATUSES_FuelTankBattery",  
	flared                   : "SR5.STATUSES_Flared",  
	shaked                   : "SR5.STATUSES_Shaked",
	onPinsAndNeedles         : "SR5.STATUSES_OnPinsAndNeedles",
	feint                    : "SR5.STATUSES_Feint",
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

SR5.valueMultipliersVehicle = {
	acceleration              : "SR5.VehicleStat_AccelerationShort",
	handling                  : "SR5.VehicleStat_HandlingShort",
	body                      : "SR5.VehicleStat_BodyShort",
	speed                     : "SR5.VehicleStat_SpeedShort",
	seating                   : "SR5.Vehicle_SeatingShort",
	vehicle                   : "SR5.VehicleFull",
};

SR5.valueMultipliers = {
	...SR5.valueMultipliersNoCapacity,
	...SR5.valueMultipliersNoRating,
};

SR5.valueMultipliersAll = {
	...SR5.valueMultipliersNoCapacity,
	...SR5.valueMultipliersNoRating,
	...SR5.valueMultipliersVehicle,
};

// Addiction types
SR5.addictionTypes = {
	both                      : "SR5.AddictionBoth",
	physiological             : "SR5.AddictionPhysiological",
	psychological             : "SR5.AddictionPsychological",
};

// Addiction types Shorts
SR5.addictionTypesShort = {
	both                      : "SR5.AddictionBothShort",
	physiological             : "SR5.AddictionPhysiologicalShort",
	psychological             : "SR5.AddictionPsychologicalShort",
};

SR5.itemRollTestType = {
	rating 					  : "SR5.ItemRating",
	ratingX2				  : "SR5.ItemRatingX2",
}

//-----------------------------------//
//             AUGMENTATIONS         //
//-----------------------------------//

// Types d'Augmentations
SR5.augmentationTypes = {
	bioware                   : "SR5.AugmentationTypeBioware",
	culturedBioware           : "SR5.AugmentationTypeCulturedBioware",
	cyberware                 : "SR5.AugmentationTypeCyberware",
	genetech                  : "SR5.AugmentationTypeGenetech",
	nanocyber                 : "SR5.AugmentationTypeNanocyber",
	hardNanoware              : "SR5.AugmentationTypeHardNanoware",
	softNanoware              : "SR5.AugmentationTypeSoftNanoware",
	symbionts                 : "SR5.AugmentationTypeSymbionts",
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

// Catégories d'Augmentations génétiques
SR5.augmentationGeneCategories = {
	geneticRestoration        : "SR5.AugmentationGeneticRestoration",
	phenotypeAdjustment       : "SR5.AugmentationPhenotypeAdjustment",
	exoticMetagenetics        : "SR5.AugmentationExoticMetagenetics",
	transgenics               : "SR5.AugmentationTransgenics",
	environmentalMicro        : "SR5.AugmentationEnvironmentalMicro",
	immunization              : "SR5.AugmentationImmunization",
	transgenicAlteration      : "SR5.AugmentationTransgenicAlteration",
	complimentaryGenetics     : "SR5.AugmentationComplimentaryGenetics",
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
	reagents                  : "SR5.Reagents",
	level					  : "SR5.Level",
	handling				  : "SR5.VehicleStat_HandlingShort",
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

SR5.healingConditions = {
	good                      : "SR5.HealingConditionsGoodShort",
	average                   : "SR5.HealingConditionsAverageShort",
	poor                      : "SR5.HealingConditionsPoorShort",
	bad                       : "SR5.HealingConditionsBadShort",
	terrible                  : "SR5.HealingConditionsTerribleShort",
}

SR5.healingSupplies = {
	noSupplies                : "SR5.HealingSuppliesNone",
	improvised                : "SR5.HealingSuppliesImprovised",
	medkit                    : "SR5.HealingSuppliesMedkit",
}

SR5.restraintType = {
	rope                      : "SR5.RestraintTypeRope",
	metal                     : "SR5.RestraintTypeMetal",
	straitjacket              : "SR5.RestraintTypeStraitjacket",
	containment               : "SR5.RestraintTypeContainment",
}

SR5.perceptionModifiers = {
	distracted                : "SR5.PerceptionModDistracted",
	specificallyLooking       : "SR5.PerceptionModSpecificallyLooking",
	notInImmediateVicinity    : "SR5.PerceptionModNotInImmediateVicinity",
	farAway                   : "SR5.PerceptionModFarAway",
	standsOutInSomeWay        : "SR5.PerceptionModStandsOutInSomeWay",
	interfering               : "SR5.PerceptionModInterfering",
}

SR5.perceptionThresholdType = {
	opposed                   : "SR5.Opposed",
	obvious                   : "SR5.PerceptionThresholdObvious",
	normal                    : "SR5.PerceptionThresholdNormal",
	obscured                  : "SR5.PerceptionThresholdObscured",
	hidden                    : "SR5.PerceptionThresholdHidden",
}

SR5.survivalModifiers = {
	camping                   : "SR5.SurvivalModCamping",
	noFoundOrWater            : "SR5.SurvivalModNoFoundOrWater",
	controlAvailable          : "SR5.SurvivalModControlAvailable",
	clothing                  : "SR5.SurvivalModClothing",
	travel                    : "SR5.SurvivalModTravel",
	toxic                     : "SR5.SurvivalModToxic",
}

SR5.survivalTerrain = {
	mild                      : "SR5.SurvivalTerrainMild",
	moderate                  : "SR5.SurvivalTerrainModerate",
	tough                     : "SR5.SurvivalTerrainTough",
	extreme                   : "SR5.SurvivalTerrainExtreme",
}

SR5.survivalWeather = {
	poor                      : "SR5.SurvivalWeatherPoor",
	terrible                  : "SR5.SurvivalWeatherTerrible",
	extreme                   : "SR5.SurvivalWeatherExtreme",
}

SR5.socialAttitude = {
	friendly                  : "SR5.SocialModAttitudeFriendly",
	neutral                   : "SR5.SocialModAttitudeNeutral",
	suspicious                : "SR5.SocialModAttitudeSuspicious",
	prejudiced                : "SR5.SocialModAttitudePrejudiced",
	hostile                   : "SR5.SocialModAttitudeHostile",
	enemy                     : "SR5.SocialModAttitudeEnemy",
}

SR5.socialResult = {
	advantageous              : "SR5.SocialModDesiredResultAdvantageous",
	ofNoValue                 : "SR5.SocialModDesiredResultOfNoValue",
	annoying                  : "SR5.SocialModDesiredResultAnnoying",
	harmful                   : "SR5.SocialModDesiredResultHarmful",
	disastrous                : "SR5.SocialModDesiredResultDisastrous",
}

SR5.socialMod = {
	reputation                : "SR5.SocialModReputation",
	reputationTarget          : "SR5.SocialModReputationTarget",
	ace                       : "SR5.SocialModAce",
	romantic                  : "SR5.SocialModRomantic",
	intoxicated               : "SR5.SocialModIntoxicated",
}

SR5.conModifier = {
	evidence                  : "SR5.SocialModEvidence",
	evaluateSituation         : "SR5.SocialModEvaluateSituation",
	isDistracted              : "SR5.SocialModIsDistracted",
}

SR5.etiquetteModifier = {
	badLook                   : "SR5.SocialModBadLook",
	nervous                   : "SR5.SocialModNervous",
	isDistractedInverse       : "SR5.SocialModIsDistracted",
}

SR5.intimidationModifier = {
	imposing                  : "SR5.SocialModImposing",
	imposingTarget            : "SR5.SocialModImposingTarget",
	outnumber                 : "SR5.SocialModOutnumber",
	outnumberTarget           : "SR5.SocialModOutnumberTarget",
	wieldingWeapon            : "SR5.SocialModWieldingWeapon",
	wieldingWeaponTarget      : "SR5.SocialModWieldingWeaponTarget",
	torture                   : "SR5.SocialModTorture",
	obliviousToDanger         : "SR5.SocialModObliviousToDanger",
}

SR5.leadershipModifier = {
	rank                      : "SR5.SocialModRank",
	rankTarget                : "SR5.SocialModRankTarget",
	authority                 : "SR5.SocialModAuthority",
	strata                    : "SR5.SocialModStrata",
	fan                       : "SR5.SocialModFan",
}

SR5.negociationModifier = {
	lacksKnowledge            : "SR5.SocialModLacksKnowledge",
	blackmailed               : "SR5.SocialModBlackmailed",
}

SR5.workingCondition = {
	distracting               : "SR5.WorkingConditionDistracting",
	poor                      : "SR5.WorkingConditionPoor",
	bad                       : "SR5.WorkingConditionBad",
	terrible                  : "SR5.WorkingConditionTerrible",
	superior                  : "SR5.WorkingConditionSuperior",
}

SR5.toolsAndParts = {
	inadequate                : "SR5.ToolsAndPartsInadequate",
	unavailable               : "SR5.ToolsAndPartsUnavailable",
	superior                  : "SR5.ToolsAndPartsSuperior",
}

SR5.plansMaterial = {
	available                 : "SR5.PlansMaterialAvailable",
	augmented                 : "SR5.PlansMaterialAugmented",
}

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
	aboriginal                : "SR5.TraditionAboriginal",
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
	pathOfPariah              : "SR5.TraditionpathOfPariah",
	planarMagic               : "SR5.TraditionPlanarMagic",	
	psionic                   : "SR5.TraditionPsionic",
	redMagic                  : "SR5.TraditionRedMagic",
	romani                    : "SR5.TraditionRomani",
	tarot                     : "SR5.TraditionTarot",
	insect                    : "SR5.TraditionInsect",
	toxic                     : "SR5.TraditionToxic",
	egyptian                  : "SR5.TraditionEgyptian",
	draconic                  : "SR5.TraditionDraconic",
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
SR5.powerActionTypes = {
	free                      : "SR5.ActionTypeFree",
	simple                    : "SR5.ActionTypeSimple",
	complex                   : "SR5.ActionTypeComplex",
	interruption              : "SR5.ActionTypeInterruption",
	permanent                 : "SR5.ActionTypePermanent",
	automatic                 : "SR5.ActionTypeAutomatic",
	special                   : "SR5.ActionTypeSpecial",
};

//Adept powers drain types
SR5.adeptPowerDrainTypes = {
	rating                    : "SR5.ItemRating",
	magic                     : "SR5.Magic",
}

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

//Ritual duration
SR5.ritualDurations = {
	instantaneous             : "SR5.DurationInstantaneous",
	sustained                 : "SR5.DurationSustained",
	permanent                 : "SR5.DurationPermanent",
	combatTurn                : "SR5.CombatTurns",
	minute                    : "SR5.Minutes",
	hour                      : "SR5.Hours",
	day                       : "SR5.Days",
	week                      : "SR5.Weeks",
	month                     : "SR5.Months",
};

SR5.ritualDurationMultipliers = {
	force                  : "SR5.Force",
	netHits                : "SR5.NetHits",
}

//Metamagics
SR5.metamagics = {
	centering                : "SR5.MetamagicCentering",
	quickening               : "SR5.MetamagicQuickening",
	shielding                : "SR5.MetamagicShielding",
	spellShaping             : "SR5.MetamagicSpellShaping",
}

//-----------------------------------//
//             MARTIAL ARTS          //
//-----------------------------------//
// Martial Arts types
SR5.martialArtsTypes = {
	blocks52                  : "SR5.martialArtsType52blocks",
	aikido                    : "SR5.martialArtsTypeaikido",
	arnisdemano               : "SR5.martialArtsTypearnisdemano",
	bartitsu                  : "SR5.martialArtsTypebartitsu",
	boxingbrawler             : "SR5.martialArtsTypeboxingbrawler",
	boxingclassic             : "SR5.martialArtsTypeboxingclassic",
	boxingswarming            : "SR5.martialArtsTypeboxingswarming",
	capoeira                  : "SR5.martialArtsTypecapoeira",
	carromeleg                : "SR5.martialArtsTypecarromeleg",
	chakramfighting           : "SR5.martialArtsTypechakramfighting",
	drunkenboxing             : "SR5.martialArtsTypedrunkenboxing",
	fioredeiliberi            : "SR5.martialArtsTypefioredeiliberi",
	firefight                 : "SR5.martialArtsTypefirefight",
	gunkata                   : "SR5.martialArtsTypegunkata",
	jeetkunedo                : "SR5.martialArtsTypejeetkunedo",
	jogodupau                 : "SR5.martialArtsTypejogodupau",
	jujitsu                   : "SR5.martialArtsTypejujitsu",
	karate                    : "SR5.martialArtsTypekarate",
	kenjutsu                  : "SR5.martialArtsTypekenjutsu",
	knighterranttactical      : "SR5.martialArtsTypeknighterranttactical",
	kravmaga                  : "SR5.martialArtsTypekravmaga",
	kunstdesfechtens          : "SR5.martialArtsTypekunstdesfechtens",
	kyujutsu                  : "SR5.martialArtsTypekyujutsu",
	laverdaderadestreza       : "SR5.martialArtsTypelaverdaderadestreza",
	lonestartactical          : "SR5.martialArtsTypelonestartactical",
	muaythai                  : "SR5.martialArtsTypemuaythai",
	ninjutsu                  : "SR5.martialArtsTypeninjutsu",
	okichitaw                 : "SR5.martialArtsTypeokichitaw",
	parkour                   : "SR5.martialArtsTypeparkour",
	pentjaksilat              : "SR5.martialArtsTypepentjaksilat",
	quarterstafffighting      : "SR5.martialArtsTypequarterstafffighting",
	sangreyacero              : "SR5.martialArtsTypesangreyacero",
	taekwondo                 : "SR5.martialArtsTypetaekwondo",
	thecowboyway              : "SR5.martialArtsTypethecowboyway",
	turkisharchery            : "SR5.martialArtsTypeturkisharchery",
	whipfighting              : "SR5.martialArtsTypewhipfighting",
	wildcat                   : "SR5.martialArtsTypewildcat",
	wrestlingmma              : "SR5.martialArtsTypewrestlingmma",
	wrestlingprofessionnal    : "SR5.martialArtsTypewrestlingprofessionnal",
	wrestlingsport            : "SR5.martialArtsTypewrestlingsport",
	wrestlingsumo             : "SR5.martialArtsTypewrestlingsumo",
	wudangsword               : "SR5.martialArtsTypewudangsword",
};

SR5.calledShotsMartialArts = {
	breakWeapon				  : "SR5.CS_BreakWeapon",
	disarm 					  : "SR5.CS_Disarm",
	entanglement			  : "SR5.CS_Entanglement",
	feint					  : "SR5.CS_Feint",
	pin 					  : "SR5.CS_Pin",
}

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
SR5.matrixCoreRolledActions = {
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

// Resonance Actions with rolled
SR5.resonanceActionsRolled = {
	compileSprite             : "SR5.MatrixActionCompileSprite",
	decompileSprite           : "SR5.MatrixActionDecompileSprite",
	eraseResonanceSignature   : "SR5.MatrixActionEraseResonanceSignature",
	killComplexForm           : "SR5.MatrixActionKillComplexForm",
	registerSprite            : "SR5.MatrixActionRegisterSprite",
	threadComplexForm         : "SR5.MatrixActionThreadComplexForm",
};

// Kill Code Actions
SR5.matrixKillCodeActions = {
	calibration               : "SR5.MatrixActionCalibration",
	denialOfService           : "SR5.MatrixActionDenialOfService",
	iAmTheFirewall            : "SR5.MatrixActionIAmTheFirewall",
	haywire                   : "SR5.MatrixActionHaywire",
	intervene                 : "SR5.MatrixActionIntervene",
	masquerade                : "SR5.MatrixActionMasquerade",
	popupCybercombat          : "SR5.MatrixActionPopupCybercombat",
	popupHacking              : "SR5.MatrixActionPopupHacking",
	squelch                   : "SR5.MatrixActionSquelch",
	subvertInfrastructure     : "SR5.MatrixActionSubvertInfrastructure",
	tag                       : "SR5.MatrixActionTag",
	watchdog                  : "SR5.MatrixActionWatchdog",
};

// Rigger 5 Actions
SR5.matrixRigger5Actions = {
	breakTargetLock           : "SR5.MatrixActionBreakTargetLock",
	confusePilot              : "SR5.MatrixActionConfusePilot",
	detectTargetLock          : "SR5.MatrixActionDetectTargetLock",
	suppressNoise             : "SR5.MatrixActionSuppressNoise",
	targetDevice              : "SR5.MatrixActionTargetDevice",
};

SR5.matrixRolledActions = {
		...SR5.matrixCoreRolledActions,
		...SR5.matrixKillCodeActions,		
		...SR5.matrixRigger5Actions,
	};

SR5.matrixActions = {
	...SR5.matrixRolledActions,
	...SR5.matrixOtherActions,
};

// Matrix Informations Game Effects
SR5.matrixGameEffects = {
	bruteForce                : "SR5.MatrixActionBruteForce_GE",
	checkOverwatchScore       : "SR5.MatrixActionCheckOverwatchScore_GE",
	controlDevice             : "SR5.MatrixActionControlDevice_GE",
	crackFile                 : "SR5.MatrixActionCrackFile_GE",
	crashProgram              : "SR5.MatrixActionCrashProgram_GE",
	dataSpike                 : "SR5.MatrixActionDataSpike_GE",
	disarmDataBomb            : "SR5.MatrixActionDisarmDataBomb_GE",
	editFile                  : "SR5.MatrixActionEditFile_GE",
	eraseMark                 : "SR5.MatrixActionEraseMark_GE",
	eraseMatrixSignature      : "SR5.MatrixActionEraseMatrixSignature_GE",
	formatDevice              : "SR5.MatrixActionFormatDevice_GE",
	garbageInGarbageOut       : "SR5.MatrixActionGarbageInGarbageOut_GE",
	hackOnTheFly              : "SR5.MatrixActionHackOnTheFly_GE",
	hide                      : "SR5.MatrixActionHide_GE",
	jackOut                   : "SR5.MatrixActionJackOut_GE",
	jamSignals                : "SR5.MatrixActionJamSignals_GE",
	jumpIntoRiggedDevice      : "SR5.MatrixActionJumpIntoRiggedDevice_GE",
	matrixPerception          : "SR5.MatrixActionMatrixPerception_GE",
	matrixSearch              : "SR5.MatrixActionMatrixSearch_GE",
	rebootDevice              : "SR5.MatrixActionRebootDevice_GE",
	setDataBomb               : "SR5.MatrixActionSetDataBomb_GE",
	snoop                     : "SR5.MatrixActionSnoop_GE",
	spoofCommand              : "SR5.MatrixActionSpoofCommand_GE",
	traceIcon                 : "SR5.MatrixActionTraceIcon_GE",
	trackback                 : "SR5.MatrixActionTrackback_GE",
	changeIcon                : "SR5.MatrixActionChangeIcon_GE",
	enterOrExitHost           : "SR5.MatrixActionEnterOrExitHost_GE",
	gridHop                   : "SR5.MatrixActionGridHop_GE",
	inviteMark                : "SR5.MatrixActionInviteMark_GE",
	sendMessage               : "SR5.MatrixActionSendMessage_GE",
	switchInterfaceMode       : "SR5.MatrixActionSwitchInterfaceMode_GE",
	loadProgram               : "SR5.MatrixActionLoadProgram_GE",
	switchTwoMatrixAttributes : "SR5.MatrixActionSwitchTwoMatrixAttributes_GE",
	swapTwoPrograms           : "SR5.MatrixActionSwapTwoPrograms_GE",
	unloadProgram             : "SR5.MatrixActionUnloadProgram_GE",
	calibration               : "SR5.MatrixActionCalibration_GE",
	denialOfService           : "SR5.MatrixActionDenialOfService_GE",
	iAmTheFirewall            : "SR5.MatrixActionIAmTheFirewall_GE",
	haywire                   : "SR5.MatrixActionHaywire_GE",
	intervene                 : "SR5.MatrixActionIntervene_GE",
	masquerade                : "SR5.MatrixActionMasquerade_GE",
	popupCybercombat          : "SR5.MatrixActionPopupCybercombat_GE",
	popupHacking              : "SR5.MatrixActionPopupHacking_GE",
	squelch                   : "SR5.MatrixActionSquelch_GE",
	subvertInfrastructure     : "SR5.MatrixActionSubvertInfrastructure_GE",
	tag                       : "SR5.MatrixActionTag_GE",
	watchdog                  : "SR5.MatrixActionWatchdog_GE",
	breakTargetLock           : "SR5.MatrixActionBreakTargetLock_GE",
	confusePilot              : "SR5.MatrixActionConfusePilot_GE",
	detectTargetLock          : "SR5.MatrixActionDetectTargetLock_GE",
	suppressNoise             : "SR5.MatrixActionSuppressNoise_GE",
	targetDevice              : "SR5.MatrixActionTargetDevice_GE",
};

// Complex Form Targets
SR5.complexFormTargets = {
	device                    : "SR5.ComplexFormTargetDevice",
	file                      : "SR5.ComplexFormTargetFile",
	host                      : "SR5.ComplexFormTargetHost",
	ice                       : "SR5.DEVICE_TYPE_Ice_F",
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
	companion                 : "SR5.SpriteCompanion",
	generalist                : "SR5.SpriteGeneralist",
}

// Sprite Types
SR5.spriteTypesDescription = {
	courier                   : "SR5.SpriteCourierDescription",
	crack                     : "SR5.SpriteCrackDescription",
	data                      : "SR5.SpriteDataDescription",
	fault                     : "SR5.SpriteFaultDescription",
	machine                   : "SR5.SpriteMachineDescription",
	companion                 : "SR5.SpriteCompanionDescription",
	generalist                : "SR5.SpriteGeneralistDescription",
}

SR5.spriteOptionalPowers = {
	activeAnalytics           : "SR5.SpritePowerActiveAnalytics",
	borrowedIP                : "SR5.SpritePowerBorrowedIP",
	decompilingResistance     : "SR5.SpritePowerDecompilingResistance",
	enhance                   : "SR5.SpritePowerEnhance",
	navi                      : "SR5.SpritePowerNavi",
	resilientCode             : "SR5.SpritePowerResilientCode",
	resonanceSpooling         : "SR5.SpritePowerResonanceSpooling",

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
	denialOfService           : "SR5.MatrixActionDenialOfService",
	haywire                   : "SR5.MatrixActionHaywire",
	masquerade                : "SR5.MatrixActionMasquerade",
	popupCybercombat          : "SR5.MatrixActionPopupCybercombat",
	popupHacking              : "SR5.MatrixActionPopupHacking",
	squelch                   : "SR5.MatrixActionSquelch",
	subvertInfrastructure     : "SR5.MatrixActionSubvertInfrastructure",
	tag                       : "SR5.MatrixActionTag",
	watchdog                  : "SR5.MatrixActionWatchdog",
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

//Matrix marks
SR5.matrixMarks = {
	1													:"SR5.MarkOne",
	2													:"SR5.MarkTwo",
	3													:"SR5.MarkThree",
}

//-----------------------------------//
//            VEHICULES              //
//-----------------------------------//

// Vehicle/Drone Attributes
SR5.vehicleAttributes = {
	handling                             : "SR5.VehicleStat_HandlingShort",
	handlingOffRoad                      : "SR5.VehicleStat_HandlingORShort",
	secondaryPropulsionHandling          : "SR5.VehicleStat_SPHandlingShort",
	secondaryPropulsionHandlingOffRoad   : "SR5.VehicleStat_SPHandlingORShort",
	speed                                : "SR5.VehicleStat_SpeedShort",
	secondaryPropulsionSpeed             : "SR5.VehicleStat_SPSpeedShort",
	speedOffRoad                         : "SR5.VehicleStat_SpeedORShort",
	acceleration                         : "SR5.VehicleStat_AccelerationShort",
	secondaryPropulsionAcceleration      : "SR5.VehicleStat_SPAccelerationShort",
	accelerationOffRoad                  : "SR5.VehicleStat_AccelerationORShort",
	body                                 : "SR5.VehicleStat_BodyShort",
	armor                                : "SR5.VehicleStat_ArmorShort",
	pilot                                : "SR5.VehicleStat_PilotShort",
	sensor                               : "SR5.VehicleStat_SensorShort",
	seating                              : "SR5.Vehicle_SeatingShort",
};

// Types de véhicules
SR5.vehicleTypes = {
	drone                     : "SR5.DroneFull",
	vehicle                   : "SR5.VehicleFull",
};

// Types de drones et véhicules
SR5.vehiclesCategories = {
	microdrone                : "SR5.DRONES_Microdrone_F",
	minidrone                 : "SR5.DRONES_Minidrone_F",
	smallDrone                : "SR5.DRONES_SmallDrone_F",
	mediumDrone               : "SR5.DRONES_MediumDrone_F",
	largeDrone                : "SR5.DRONES_LargeDrone_F",
	hugeDrone                 : "SR5.DRONES_HugeDrone_F",
	vectorThrustCraft         : "SR5.VectorThrustCraftFull",
	fixedWingAircraft         : "SR5.FixedWingAircraftFull",
	boat                      : "SR5.BoatFull",
	truck                     : "SR5.TruckFull",
	rotorCraft                : "SR5.RotorCraftFull",
	bike                      : "SR5.BikeFull",
	submarine                 : "SR5.SubmarineFull",  
	car                       : "SR5.CarFull",
	lta                       : "SR5.LTAFull",
};

// Types de drones
SR5.droneCategories = {
	microdrone                : "SR5.DRONES_Microdrone_F",
	minidrone                 : "SR5.DRONES_Minidrone_F",
	smallDrone                : "SR5.DRONES_SmallDrone_F",
	mediumDrone               : "SR5.DRONES_MediumDrone_F",
	largeDrone                : "SR5.DRONES_LargeDrone_F",
	hugeDrone                 : "SR5.DRONES_HugeDrone_F",
};

// Types de véhicules
SR5.vehicleCategories = {
	vectorThrustCraft         : "SR5.VectorThrustCraftFull",
	fixedWingAircraft         : "SR5.FixedWingAircraftFull",
	boat                      : "SR5.BoatFull",
	truck                     : "SR5.TruckFull",
	rotorCraft                : "SR5.RotorCraftFull",
	bike                      : "SR5.BikeFull",
	submarine                 : "SR5.SubmarineFull",  
	car                       : "SR5.CarFull",
	lta                       : "SR5.LTAFull",
};

// Weapon Mount : Size
SR5.WeaponMountSize = {
	light                   : "SR5.VEHICLE_WeaponMountSize_L",
	standard                : "SR5.VEHICLE_WeaponMountSize_S",
	heavy                   : "SR5.VEHICLE_WeaponMountSize_H",
};

// Weapon Mount : Visibility
SR5.WeaponMountVisibility = {
	external                : "SR5.VEHICLE_WeaponMountVis_E",
	internal                : "SR5.VEHICLE_WeaponMountVis_I",
	concealed               : "SR5.VEHICLE_WeaponMountVis_C",
};

// Weapon Mount : Flexibility
SR5.WeaponMountFlexibility = {
	fixed                  : "SR5.VEHICLE_WeaponMountFlex_Fi",
	flexible               : "SR5.VEHICLE_WeaponMountFlex_Fl",
	turret                 : "SR5.VEHICLE_WeaponMountFlex_T",
};

// Weapon Mount : Control mode
SR5.WeaponMountControl = {
	remote                 : "SR5.VEHICLE_WeaponMountCon_R",
	manual                 : "SR5.VEHICLE_WeaponMountCon_M",
	armoredManual          : "SR5.VEHICLE_WeaponMountCon_AM",
};


// Vehicle and Drone Control mode
SR5.vehicleSecondaryPropulsionMode = {
	amphibiousSurface         : "SR5.VEHICLE_SP_AmphibiousSurface",
	amphibiousSubmersible     : "SR5.VEHICLE_SP_AmphibiousSubmersible",
	hovercraft                : "SR5.VEHICLE_SP_Hovercraft",
	rotor                     : "SR5.VEHICLE_SP_Rotor",
	tracked                   : "SR5.VEHICLE_SP_Tracked",
	walker                    : "SR5.VEHICLE_SP_Walker",
};

// Vehicle and Drone Control mode
SR5.vehicleControlModesAutopilot = {
	autopilot                 : "SR5.ControlAutopilot",
}

SR5.vehicleControlModesSimple = {
	manual                    : "SR5.ControlManual",
	remote                    : "SR5.ControlRemote",
}

SR5.vehicleControlModesRigging = {
	rigging                   : "SR5.ControlRigging",
}

SR5.vehicleControlModes = {
	autopilot                 : "SR5.ControlAutopilot",
	manual                    : "SR5.ControlManual",
	remote                    : "SR5.ControlRemote",
	rigging                   : "SR5.ControlRigging",
};

// Vehicle actions
SR5.vehicleActions = {
	vehicleTest               : "SR5.VehicleTest",
	ramming                   : "SR5.Ramming",
	cutOff                    : "SR5.CutOff",
	catchUpBreakAway          : "SR5.CatchUpBreakAway",
	stunt                     : "SR5.Stunt",
};

// Vehicle actions
SR5.vehicleRelativeSpeed = {
	vehicleRelativeSpeed_1    : "SR5.VehicleRelativeSpeed_1",   
	vehicleRelativeSpeed_11   : "SR5.VehicleRelativeSpeed_11",  
	vehicleRelativeSpeed_51   : "SR5.VehicleRelativeSpeed_51",
	vehicleRelativeSpeed_201  : "SR5.VehicleRelativeSpeed_201", 
	vehicleRelativeSpeed_301  : "SR5.VehicleRelativeSpeed_301", 
	vehicleRelativeSpeed_501  : "SR5.VehicleRelativeSpeed_501", 
};

//Target signature
SR5.targetSignature = {
	vehicleLarge              : "SR5.SignatureVehicleLarge",
	vehicleElectric           : "SR5.SignatureVehicleElectric",
	metahuman                 : "SR5.SignatureMetahuman",
	drone                     : "SR5.SignatureDrone",
	droneMicro                : "SR5.SignatureDroneMicro",
};

// Type de modification de véhicule/drone
SR5.vehicleModType = {
	equipment                 : "SR5.VehicleModTypeEquipment",
	powerTrain                : "SR5.VehicleModTypePowerTrain",
	protection                : "SR5.VehicleModTypeProtection",
	weapons                   : "SR5.VehicleModTypeWeapon",
	electromagnetic           : "SR5.VehicleModTypeElectromagnetic",
	body                      : "SR5.VehicleModTypeBody",
	cosmetic                  : "SR5.VehicleModTypeCosmetic",
};

// Type d'installation nécessaires
SR5.vehicleModTools = {
	kit                       : "SR5.VehicleModToolsKit",
	shop                      : "SR5.VehicleModToolsShop",
	facility                  : "SR5.VehicleModToolsFacility",
};

SR5.vehicleSpeed = {
	speedRamming1							: "SR5.VehicleRelativeSpeed_1",
	speedRamming11						: "SR5.VehicleRelativeSpeed_11",
	speedRamming51						: "SR5.VehicleRelativeSpeed_51",
	speedRamming201						: "SR5.VehicleRelativeSpeed_201",
	speedRamming301						: "SR5.VehicleRelativeSpeed_301",
	speedRamming501						: "SR5.VehicleRelativeSpeed_501",
};

//-----------------------------------//
//             SPIRITS               //
//-----------------------------------//

// Spirit types
SR5.spiritTypes = {
	abomination               : "SR5.Abomination",
	anarch                    : "SR5.Anarch",
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
	allergyEarth               : "SR5.SpiritPowerAllergyEarth",
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
	essenceLoss                : "SR5.SpiritPowerEssenceLoss",
}

SR5.spiritOptionalPowersblood = {
	concealment                : "SR5.SpiritPowerConcealment",
	confusion                  : "SR5.SpiritPowerConfusion",
	guard                      : "SR5.SpiritPowerGuard",
	hemoragy                   : "SR5.SpiritPowerHemoragy",
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
	energyAuraFire             : "SR5.SpiritPowerEnergyAura",
	engulfFire                 : "SR5.SpiritPowerEngulfFire",
	materialization            : "SR5.SpiritPowerMaterialization",
	sapience                   : "SR5.SpiritPowerSapience",
	allergyWater               : "SR5.SpiritPowerAllergyWater",
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
	allergyInsecticides        : "SR5.SpiritPowerAllergyInsecticides",
	evanescence                : "SR5.SpiritPowerEvanescence",
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
	allergyInsecticides        : "SR5.SpiritPowerAllergyInsecticides",
	evanescence                : "SR5.SpiritPowerEvanescence",
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
	allergyInsecticides        : "SR5.SpiritPowerAllergyInsecticides",
	evanescence                : "SR5.SpiritPowerEvanescence",
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
	allergyInsecticides        : "SR5.SpiritPowerAllergyInsecticides",
	evanescence                : "SR5.SpiritPowerEvanescence",
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
	allergyInsecticides        : "SR5.SpiritPowerAllergyInsecticides",
	evanescence                : "SR5.SpiritPowerEvanescence",
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
	allergyInsecticides        : "SR5.SpiritPowerAllergyInsecticides",
	evanescence                : "SR5.SpiritPowerEvanescence",
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
	allergySun                 : "SR5.SpiritPowerAllergySun",
	evanescence                : "SR5.SpiritPowerEvanescence",
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
	allergySun                 : "SR5.SpiritPowerAllergySun",
	evanescence                : "SR5.SpiritPowerEvanescence",
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
	allergyWater               : "SR5.SpiritPowerAllergyWater",
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
	allergyFire                : "SR5.SpiritPowerAllergyFire",
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


SR5.spiritBasePowersanarch = {
	accident                   : "SR5.SpiritPowerAccident",
	auraMasking                : "SR5.SpiritPowerAuraMasking",
	banishingResistance        : "SR5.SpiritPowerBanishingResistance",	
	materialization            : "SR5.SpiritPowerMaterialization",
	realisticForm              : "SR5.SpiritPowerRealisticForm",
	sapience                   : "SR5.SpiritPowerSapience",
	naturalWeapon              : "SR5.SpiritPowerNaturalWeapon",
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
	enhancedSensesHearing      : "SR5.SpiritPowerEnhancedSensesHearing",
	enhancedSensesSmell        : "SR5.SpiritPowerEnhancedSensesSmell",
	enhancedSensesSonar        : "SR5.SpiritPowerEnhancedSensesSonar",
	enhancedSensesLowLight     : "SR5.SpiritPowerEnhancedSensesLowLight",
	enhancedSensesThermographic: "SR5.SpiritPowerEnhancedSensesThermographic",
	fear                       : "SR5.SpiritPowerFear",
	guard                      : "SR5.SpiritPowerGuard",
	hemoragy                   : "SR5.SpiritPowerHemoragy",
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
	paralyzingHowl             : "SR5.SpiritPowerParalyzingHowl",
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
//              DEVICE               //
//-----------------------------------//
// Devices types
SR5.deviceTypes = {
	device                    : "SR5.DEVICE_TYPE_Device_F",
	slavedDevice              : "SR5.DEVICE_TYPE_SlavedDevice_F",
	host                      : "SR5.DEVICE_TYPE_Host_F",
	ice                       : "SR5.DEVICE_TYPE_Ice_F",
	maglock					  : "SR5.DEVICE_TYPE_Maglock",
};

// Ice types
SR5.iceTypes = {
	iceAcid                   : "SR5.IceAcid",
	iceBinder                 : "SR5.IceBinder",
	iceBlack                  : "SR5.IceBlack",
	iceBlaster                : "SR5.IceBlaster",
	iceBloodhound             : "SR5.IceBloodhound",
	iceBlueGoo                : "SR5.IceBlueGoo",
	iceCatapult               : "SR5.IceCatapult",
	iceCrash                  : "SR5.IceCrash",
	iceFlicker                : "SR5.IceFlicker",
	iceJammer                 : "SR5.IceJammer",
	iceKiller                 : "SR5.IceKiller",
	iceMarker                 : "SR5.IceMarker",
	icePatrol                 : "SR5.IcePatrol",
	iceProbe                  : "SR5.IceProbe",
	iceScramble               : "SR5.IceScramble",
	iceShocker                : "SR5.IceShocker",
	iceSparky                 : "SR5.IceSparky",
	iceSleuther               : "SR5.IceSleuther",
	iceTarBaby                : "SR5.IceTarBaby",
	iceTrack                  : "SR5.IceTrack",
}

//Maglocks types
SR5.maglockTypes = {
	cardReader				  : "SR5.MaglockCardReader",
	dnaScanner				  : "SR5.MaglockDnaScanner",
	facialRecognition		  : "SR5.MaglockFacialRecognition",
	keyPads					  : "SR5.MaglockKeyPad",
    printScanner			  : "SR5.MaglockPrintScanner",
    voiceRecognition		  : "SR5.MaglockVoiceRecognition",
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
	netHits                   : "SR5.NetHits",
	boolean                   : "SR5.Boolean",
	divide                    : "SR5.Divide",
};

SR5.effectTypes = {
	damage                    : "SR5.Damage",
	iceAttack                 : "SR5.EffectTypeIceAttack",
	electricityDamage         : "SR5.ElementalDamage",
	acidDamage                : "SR5.ElementalDamage",
	fireDamage                : "SR5.ElementalDamage",
	sensorLock                : "SR5.SensorTargetingActive",
	signalJam                 : "SR5.EffectSignalJam",
	signalJammed              : "SR5.EffectSignalJammed",
	linkLock                  : "SR5.EffectLinkLockedConnection",
	itemComplexForm           : "TYPES.Item.itemComplexForm",
	itemSpell                 : "TYPES.Item.itemSpell",
	itemAdeptPower            : "TYPES.Item.itemAdeptPower",
	itemPreparation           : "TYPES.Item.itemPreparation",
	itemPower                 : "TYPES.Item.itemPower",
	derezz                    : "SR5.Derezz",
	toxinEffect               : "SR5.Toxin",
	toxinEffectDisorientation : "SR5.ToxinEffectDisorientation",
	toxinEffectNausea         : "SR5.ToxinEffectNausea",
	toxinEffectParalysis      : "SR5.ToxinEffectParalysis",
	toxinEffectAgony          : "SR5.ToxinEffectAgony",
	toxinEffectArcaneInhibitor: "SR5.ToxinEffectArcaneInhibitor",
	slowed                    : "SR5.STATUSES_Slowed",
	winded                    : "SR5.STATUSES_Winded",
	deafened                  : "SR5.STATUSES_Deafened",
	blinded                   : "SR5.STATUSES_Blinded",
	brokenGrip                : "SR5.STATUSES_BrokenGrip",
	weakSide                  : "SR5.STATUSES_WeakSide",
	nauseous                  : "SR5.STATUSES_Nauseous",
	buckled                   : "SR5.STATUSES_Buckled",
	slowDeath                 : "SR5.STATUSES_SlowDeath",
	knockdown                 : "SR5.STATUSES_Knockdown",
	unableToSpeak             : "SR5.STATUSES_UnableToSpeak",
	bleedOut                  : "SR5.STATUSES_BleedOut",
	oneArmBandit              : "SR5.STATUSES_OneArmBandit", 
	pin                       : "SR5.STATUSES_Pin",
	dirtyTrick                : "SR5.STATUSES_DirtyTrick",
	entanglement              : "SR5.STATUSES_Entanglement",  
	trickShot                 : "SR5.STATUSES_TrickShot",  
	antenna                   : "SR5.STATUSES_Antenna",
	engineBlock               : "SR5.STATUSES_EngineBlock",
	windowMotor               : "SR5.STATUSES_WindowMotor",
	doorLock                  : "SR5.STATUSES_DoorLock",
	axle                      : "SR5.STATUSES_Axle",
	fuelTankBattery           : "SR5.STATUSES_FuelTankBattery",
	flared                    : "SR5.STATUSES_Flared",
	shaked                    : "SR5.STATUSES_Shaked",
	calledShot                : "SR5.CS_CalledShot",
	onPinsAndNeedles          : "SR5.STATUSES_OnPinsAndNeedles",
	prone                     : "SR5.STATUSES_Prone",
	visibility				  : "SR5.EnvironmentalModVisibility",
	areaEffect				  : "SR5.AreaEffect",
	backgroundCount			  : "SR5.SceneBackgroundCount",
	anticoagulantDamage       : "SR5.Anticoagulant",
	matrixAction              : "SR5.MatrixAction",
}

SR5.effectDuration = {
	round                     : "SR5.CombatTurn",
	permanent                 : "SR5.DurationPermanent",
	special                   : "SR5.DurationSpecial",
	sustained                 : "SR5.DurationSustained",
	reboot                    : "SR5.UntilReboot",
	minute                    : "SR5.Minutes",
	hour                      : "SR5.Hours",
	action                    : "SR5.Action",
}

SR5.specialProperties = {
	concentration             : "SR5.Concentration",
	controlRig                : "SR5.ControlRig",
	smartlink                 : "SR5.Smartlink",
	damageReduction           : "SR5.DamageReduction",
}

SR5.specialPropertiesList = {
	concentration             : "SR5.Concentration",
	controlRig                : "SR5.ControlRig",
	smartlink                 : "SR5.Smartlink",
	damageReduction           : "SR5.DamageReduction",
	doublePenalties           : "SR5.PenaltyDouble",
	regeneration              : "SR5.SpiritPowerRegeneration",
	anticoagulant             : "SR5.Anticoagulant",
	essenceDrain              : "SR5.EssenceDrain",
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

SR5.hardenedArmorTypes = {
	normalWeapon              : "SR5.HardenedArmorNormalWeapon",
	astral                    : "SR5.HardenedAstalArmor",
	fire                      : "SR5.HardenedFireArmor",
	cold                      : "SR5.HardenedColdArmor",
	toxins 					  : "SR5.HardenedToxinArmor",
	pathogens				  : "SR5.HardenedPathogenArmor",
}

SR5.hardenedArmorValueTypes = {
	rating                    : "SR5.ItemRating",
	essence                   : "SR5.Essence",
	essenceX2                 : "SR5.EssenceX2",
	body                      : "SR5.Body"
}

SR5.hardenedAstralArmorValueTypes = {
	rating                    : "SR5.ItemRating",
	willpower                 : "SR5.Willpower"
}

SR5.fullDefense = {
	fullDefense               : "SR5.FullDefense",
}

//-----------------------------------//
//             MODIFIERS             //
//-----------------------------------//
SR5.dicePoolModTypes = {
	attribute                 : "SR5.Attribute",
	various                   : "SR5.VariousModifiers",
	patientEssence            : "SR5.PatientEssence",
	specialization            : "SR5.Specialization",
	penalty                   : "SR5.Penalty",
	incomingFiringMode        : "SR5.WeaponMode",
	recoil                    : "SR5.Recoil",
	targetRange               : "SR5.Range",
	reach                     : "SR5.WeaponReach",
	environmentalSceneMod     : "SR5.EnvironmentalModifiers",
	perceptionType            : "SR5.SkillPerceptionType",
	cumulativeDefense         : "SR5.CumulativeDefense",
	defenseMode               : "SR5.ActiveDefense",
	fullDefense               : "SR5.FullDefense",
	cover                     : "SR5.Cover",
	incomingPA                : "SR5.ArmorPenetration",
	backgroundCount           : "SR5.SceneBackgroundCount",
	matrixRange               : "SR5.MatrixNoise",
	matrixSceneNoise          : "SR5.SceneNoiseRating",
	matrixNoiseReduction      : "SR5.NoiseReduction",
	matrixActorNoise 		  : "SR5.PersonalMatrixNoise",
	publicGrid                : "SR5.GridPublicOn",
	targetGrid                : "SR5.GridTargetDifferent",
	spiritAid                 : "SR5.SpiritAid",
	spiritType                : "SR5.SpiritTypeBonus",
	spellCategory             : "SR5.SpellCategoryBonus",
	sensorLockMod             : "SR5.SensorLockedTarget",
	signatureSize             : "SR5.TargetSize",
	mark                      : "SR5.NumberOfWantedMarks",
	centering                 : "SR5.MetamagicCentering",
	spellShaping              : "SR5.MetamagicSpellShaping",
	healingCondition          : "SR5.HealingConditions",
	patientCooperation        : "SR5.UncooperativePatient",
	patientAwakenedOrEmerged  : "SR5.PatientAwakenedOrEmerged",
	healingSupplies           : "SR5.HealingSupplies",
	escapeSituationWatched    : "SR5.EscapeArtistSituationWatched",
	restrainerStrength        : "SR5.EscapeArtistSituationRestrained",
	escapeSituationPicks      : "SR5.EscapeArtistSituationPicks",
	distracted                : "SR5.PerceptionModDistracted",
	specificallyLooking       : "SR5.PerceptionModSpecificallyLooking",
	notInImmediateVicinity    : "SR5.PerceptionModNotInImmediateVicinity",
	farAway                   : "SR5.PerceptionModFarAway",
	standsOutInSomeWay        : "SR5.PerceptionModStandsOutInSomeWay",
	interfering               : "SR5.PerceptionModInterfering",
	camping                   : "SR5.SurvivalModCamping",
	noFoundOrWater            : "SR5.SurvivalModNoFoundOrWater",
	controlAvailable          : "SR5.SurvivalModControlAvailable",
	clothing                  : "SR5.SurvivalModClothing",
	travel                    : "SR5.SurvivalModTravel",
	toxic                     : "SR5.SurvivalModToxic",
	weather                   : "SR5.SurvivalWeather",
	socialAttitude            : "SR5.SocialModAttitude",
	socialResult              : "SR5.SocialModDesiredResult",
	socialReputation          : "SR5.SocialModReputation",
	socialReputationTarget    : "SR5.SocialModReputationTarget",
	socialAce                 : "SR5.SocialModAce",
	socialRomantic            : "SR5.SocialModRomantic",
	socialIntoxicated         : "SR5.SocialModIntoxicated",
	socialEvidence            : "SR5.SocialModEvidence",
	socialIsDistracted        : "SR5.SocialModIsDistracted",
	socialEvaluateSituation   : "SR5.SocialModEvaluateSituation",
	socialBadLook             : "SR5.SocialModBadLook",
	socialNervous             : "SR5.SocialModNervous",
	socialIsDistractedInverse : "SR5.SocialModIsDistracted",
	socialImposing            : "SR5.SocialModImposing",
	socialImposingTarget      : "SR5.SocialModImposingTarget",
	socialOutnumber           : "SR5.SocialModOutnumber",
	socialOutnumberTarget     : "SR5.SocialModOutnumberTarget",
	socialWieldingWeapon      : "SR5.SocialModWieldingWeapon",
	socialWieldingWeaponTarget: "SR5.SocialModWieldingWeaponTarget",
	socialTorture             : "SR5.SocialModTorture",
	socialObliviousToDanger   : "SR5.SocialModObliviousToDanger",
	socialRank                : "SR5.SocialModRank",
	socialRankTarget          : "SR5.SocialModRankTarget",
	socialAuthority           : "SR5.SocialModAuthority",
	socialStrata              : "SR5.SocialModStrata",
	socialFan                 : "SR5.SocialModFan",
	socialLacksKnowledge      : "SR5.SocialModLacksKnowledge",
	socialBlackmailed         : "SR5.SocialModBlackmailed",
	workingCondition          : "SR5.WorkingCondition",
	toolsAndParts             : "SR5.ToolsAndParts",
	plansMaterial             : "SR5.PlansMaterial",
	workingFromMemory         : "SR5.WorkingFromMemory",
	calledShot                : "SR5.CS_CalledShot",
	defenseInMelee 			  : "SR5.DefenseModInMeleeTargetedByRange",
	defenseInsideVehicle      : "SR5.DefenseModInsideMovingVehicle",
	defenseProne 			  : "SR5.DefenseModProne",
	defenseProneClose    	  : "SR5.DefenseModProneAndAttackerClose",
	defenseProneFar 		  : "SR5.DefenseModProneAndAttackerFar",
	defenseReceivingCharge    : "SR5.DefenseModReceivingCharge",
	defenseRunning            : "SR5.DefenseModRunning",
	defenseTargetedByArea     : "SR5.DefenseModTargetedByAreaEffect",
	attackCharge              : "SR5.AttackModCharge",
	attackFriendsInMelee      : "SR5.AttackModFriendsInMelee",
	attackOpponentProne       : "SR5.AttackModOpponentProne",
	attackProne               : "SR5.AttackModProne",
	attackSuperiorPosition    : "SR5.AttackModSuperiorPosition",
	attackTouchOnly           : "SR5.AttackModTouchOnly",
	attackWrongHand 		  : "SR5.AttackModUsingWrongHand",
	attackBlindFire 		  : "SR5.AttackModBlindFire",
	attackInMelee   		  : "SR5.AttackModInMelee",
	attackFromVehicle 		  : "SR5.AttackModFiringFromVehicle",
	attackWithImagingDevice	  : "SR5.AttackModFiringWithImagingDevice",
	attackIsRunning 		  : "SR5.AttackModRunning",
	attackTakeAim   		  : "SR5.AttackModTakeAim",
	chokeSettings             : "SR5.ChokeSettings",
}

SR5.drainModTypes = {
	recklessSpellcasting      : "SR5.RecklessSpellcasting",
	trigger                   : "SR5.PreparationTrigger",
	reagents                  : "SR5.Reagents",
	hits                      : "SR5.DiceHits",
	ritualResistance          : "SR5.Force",
	spell                     : "SR5.DrainModifier",
}

SR5.limitModTypes = {
	limitModVarious         : "SR5.VariousModifiers",
	limitModPerception      : "SR5.SkillPerceptionType",
	limitModHealingSupplies : "SR5.HealingSupplies",
	backgroundCount			    : "SR5.SceneBackgroundCount",
}

//-----------------------------------//
//             BARRIERS              //
//-----------------------------------//

SR5.barrierTypes = {
	fragile                   : "SR5.BarrierFragile",
	cheap                     : "SR5.BarrierCheapMaterial",
	average                   : "SR5.BarrierAverageMaterial",
	heavy                     : "SR5.BarrierHeavyMaterial",
	reinforced                : "SR5.BarrierReinforcedMaterial",
	structural                : "SR5.BarrierStructuralMaterial",
	structuralHeavy           : "SR5.BarrierStructuralHeavyMaterial",
	armored                   : "SR5.BarrierArmoredMaterial",
	hardened                  : "SR5.BarrierHardenedMaterial",
}

SR5.objectTypes = {
	3													: "SR5.ObjectTypeNatural",
	6													: "SR5.ObjectTypeManufacturedLow",
	9													: "SR5.ObjectTypeManufacturedHigh",
	15												: "SR5.ObjectTypeHighlyProcessed",
}


//-----------------------------------//
//             ITEM TYPES            //
//-----------------------------------//

SR5.itemTypes = {
	itemAdeptPower            : "TYPES.Item.itemAdeptPower",
	itemArmor                 : "TYPES.Item.itemArmor",
	itemAugmentation          : "TYPES.Item.itemAugmentation",
	itemAmmunition            : "TYPES.Item.itemAmmunition",
	itemComplexForm           : "TYPES.Item.itemComplexForm",
	itemContact               : "TYPES.Item.itemContact",
	itemDevice                : "TYPES.Item.itemDevice",
	itemEcho                  : "TYPES.Item.itemEcho",
	itemEffect                : "TYPES.Item.itemEffect",
	itemFocus                 : "TYPES.Item.itemFocus",
	itemGear                  : "TYPES.Item.itemGear",
	itemKarma                 : "TYPES.Item.itemKarma",
	itemKnowledge             : "TYPES.Item.itemKnowledge",
	itemLanguage              : "TYPES.Item.itemLanguage",
	itemLifestyle             : "TYPES.Item.itemLifestyle",
	itemMark                  : "TYPES.Item.itemMark",
	itemMartialArt            : "TYPES.Item.itemMartialArt",
	itemMetamagic             : "TYPES.Item.itemMetamagic",
	itemNuyen                 : "TYPES.Item.itemNuyen",
	itemPower                 : "TYPES.Item.itemPower",
	itemPreparation           : "TYPES.Item.itemPreparation",
	itemProgram               : "TYPES.Item.itemProgram",
	itemQuality               : "TYPES.Item.itemQuality",
	itemRitual                : "TYPES.Item.itemRitual",
	itemSin                   : "TYPES.Item.itemSin",
	itemSpell                 : "TYPES.Item.itemSpell",
	itemSpirit                : "TYPES.Item.itemSpirit",
	itemSprite                : "TYPES.Item.itemSprite",
	itemSpritePower           : "TYPES.Item.itemSpritePower",
	itemTradition             : "TYPES.Item.itemTradition",
	itemVehicle               : "TYPES.Item.itemVehicle",
	itemVehicleMod            : "TYPES.Item.itemVehicleMod",
	itemWeapon                : "TYPES.Item.itemWeapon",
};

//-----------------------------------//
//             ACTOR TYPES           //
//-----------------------------------//

SR5.actorTypes = {
	actorDevice               : "TYPES.Actor.actorDevice",
	actorDrone                : "TYPES.Actor.actorDrone",
	actorGrunt                : "TYPES.Actor.actorGrunt",
	actorPc                   : "TYPES.Actor.actorPc",
	actorSpirit               : "TYPES.Actor.actorSpirit",
	actorSprite               : "TYPES.Actor.actorSprite",
	actorAgent                : "TYPES.Actor.actorAgent",
};

//-----------------------------------//
//             SOURCE TYPES           //
//-----------------------------------//

SR5.sourceList = {
	core                      : "SOURCE.CoreRulebook",
	runAndGun                 : "SOURCE.RunAndGun",
	stolenSouls               : "SOURCE.StolenSouls",
	streetGrimoire            : "SOURCE.StreetGrimoire",
	runFaster                 : "SOURCE.RunFaster",
	dataTrails                : "SOURCE.DataTrails",
	chromeFlesh               : "SOURCE.ChromeFlesh",
	rigger5                   : "SOURCE.Rigger5",
	hardTargets               : "SOURCE.HardTargets",
	howlingShadows            : "SOURCE.HowlingShadows",
	courtOfShadows            : "SOURCE.CourtOfShadows",
	cutingAces                : "SOURCE.CutingAces",  
	forbiddenArcana           : "SOURCE.ForbiddenArcana",
	completeTrog              : "SOURCE.CompleteTrog",
	darkTerrors               : "SOURCE.DarkTerrors",
	streetLethal              : "SOURCE.StreetLethal",
	killCode                  : "SOURCE.KillCode",
	betterThanBad             : "SOURCE.BetterThanBad",
	noFuture                  : "SOURCE.NoFuture",
	assassinPrimer            : "SOURCE.AssassinPrimer",
	coyotes                   : "SOURCE.Coyotes",
	gunHeaven3                : "SOURCE.GunHeaven3",
	bulletsAndBandages        : "SOURCE.BulletsAndBandages",
	shadowSpells              : "SOURCE.ShadowSpells",
	lockdown 				  : "SOURCE.Lockdown",
};

//-----------------------------------//
//          MODIFIERS TYPE           //
//-----------------------------------//

SR5.modifiersTypes = {
	adeptPower				  : "SR5.AdeptPower",
	ammunitionType 			  : "SR5.AmmunitionType",
	armor 					  : "SR5.Armor",
	armorAccessory			  : "SR5.ArmorAccessory",
	augmentations 			  : "SR5.Augmentations",
	augmentationGrade		  : "SR5.AugmentationGrade",
	areaEffect 				  : "SR5.AreaEffect",
	armorAccessory			  : "SR5.ArmorAccessory",
	armorEncumbrance		  : "SR5.ArmorEncumbrance",
	armorMain 				  : "SR5.Armor",
	astralPlane				  : "SR5.AstralPlane",
	concentration 			  : "SR5.Concentration",
	controler 				  : "SR5.Controler",
	controlerProgram		  : "SR5.ControlerProgram",
	controleMode			  : "SR5.ControlMode",
	customCyberlimb			  : "SR5.CutomCyberlimb",
	device 					  : "SR5.Device",
	deviceRating 			  : "SR5.DeviceRating",
	drainModifier			  : "SR5.DrainModifier",
	hardenedArmor 			  : "SR5.HardenedArmor",
	hardenedAstralArmor 	  : "SR5.HardenedAstalArmor",
	iceAttack                 : "SR5.EffectTypeIceAttack",
	itemRating				  : "SR5.ItemRating",
	karma 					  : "SR5.Karma",
	level 					  : "SR5.Level",
	lifeStyleOption 		  : "SR5.LifestyleOption",
	linkedAttribute 		  : "SR5.LinkedAttribute",
	matrixAttribute 		  : "SR5.MatrixAttribute",
	matrixUserMode 			  : "SR5.MatrixUserMode",
	silentMode				  : "SR5.MatrixUserMode",
	metatype				  : "SR5.Metatype",
	metamagic 				  : "SR5.Metamagic",
	module					  : "SR5.CommlinkModule",
	multiplier   			  : "SR5.Multiplier",
	notoriety 				  : "SR5.ReputationNotoriety",
	penaltycondition		  : "SR5.PenaltyDamage",
	penaltydamage 			  : "SR5.PenaltyDamage",
	penaltymagic	   		  : "SR5.PenaltyValueMagic",
	penaltymatrix			  : "SR5.PenaltyValueMatrix",
	penaltyspecial		  	  : "SR5.PenaltyValueSpecial",
	pilotAttribute            : "SR5.VehicleStat_PilotShort",
	possession 				  : "SR5.Possession",
	program 				  : "SR5.Program",
	sensorAttribute           : "SR5.VehicleStat_SensorShort",
	specialization 			  : "SR5.Skill",
	skillRating				  : "SR5.SkillRating",
	skillGroup 				  : "SR5.SkillGroup",
	spell 					  : "SR5.Spell",
	spiritType                : "SR5.SpiritType",
	spriteType 				  : "SR5.SpriteType",
	vehicleMod				  : "SR5.VehicleMod",
	visionType				  : "SR5.VisionType",
	weaponAccessory 		  : "SR5.WeaponAccessory",
};

SR5.modifierTypes = {
	...SR5.itemTypes,
	...SR5.vehicleControlModes,
	...SR5.vehicleModType,
	...SR5.actorTypes,
	...SR5.traditionTypes,
	...SR5.matrixAttributes,
	...SR5.modifiersTypes,
};

//-----------------------------------//
//          STATUS EFFECTS           //
//-----------------------------------//

SR5.statusEffects = [
	{
		img: "systems/sr5/img/status/StatusUnconsciousOn.svg",
		id: "unconscious",
		name: "SR5.STATUSES_Unconscious_F",
		flags: {
			core: {
				overlay: true,
			}
		}
	},
	{
		img: "systems/sr5/img/status/StatusDeadOn.svg",
		id: "dead",
		name: "SR5.STATUSES_Dead_F",
		flags: {
			core: {
				overlay: true,
			}
		},
	},
	{
		img: "systems/sr5/img/status/StatusProneOn.svg",
		id: "prone",
		name: "SR5.STATUSES_Prone",
		origin: "prone",
	},
	{
		img: "systems/sr5/img/status/StatusFullDefense.svg",
		id: "fullDefense",
		name: "SR5.STATUSES_FullDefense",
		origin: "fullDefense"
	},
	{
		img: "systems/sr5/img/status/StatusNoActionOn.svg",
		id: "noAction",
		name: "SR5.EffectNoAction",
		flags: {
			core: {
				overlay: true,
			}
		},
		origin: "noAction"
	},
	{
		img: "systems/sr5/img/status/StatusCover.svg",
		id: "cover",
		name: "SR5.Cover",
		origin: "cover"
	},
	{
		img: "systems/sr5/img/status/StatusCoverFull.svg",
		id: "coverFull",
		name: "SR5.CoverFull",
		origin: "coverFull"
	},
];

CONFIG.statusEffects = SR5.statusEffects;
