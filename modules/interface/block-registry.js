/**
 * Block Registry — single source of truth for all SR5 character sheet blocks.
 *
 * Each block maps to a Handlebars partial that can be rendered inside any
 * panel on any tab. Blocks have a `size` that determines which panel
 * column-counts can host them.
 */

const PARTIAL_ROOT = 'systems/sr5/templates/actors/_partials'
const ICON_ROOT = 'systems/sr5/assets/img/icons'

// ---------------------------------------------------------------------------
//  Size constants
// ---------------------------------------------------------------------------

export const BLOCK_SIZE = Object.freeze({
  SINGLE: 'single',
  DOUBLE: 'double',
  TRIPLE: 'triple',
})

export const BLOCK_MIN_COLUMNS = Object.freeze({
  [BLOCK_SIZE.SINGLE]: 1,
  [BLOCK_SIZE.DOUBLE]: 2,
  [BLOCK_SIZE.TRIPLE]: 3,
})

// ---------------------------------------------------------------------------
//  Tab icons — SVG partials rendered in the right-side nav
//  Re-uses existing nav icons in img/icons/
// ---------------------------------------------------------------------------

export const TAB_ICONS = {
  core:          `${ICON_ROOT}/nav-attributes.svg`,
  derived:       `${ICON_ROOT}/nav-derived.svg`,
  magic:         `${ICON_ROOT}/nav-magic.svg`,
  matrix:        `${ICON_ROOT}/nav-matrix.svg`,
  qualities:     `${ICON_ROOT}/nav-qualities.svg`,
  skills:        `${ICON_ROOT}/nav-skills.svg`,
  combat:        `${ICON_ROOT}/nav-weapons.svg`,
  gear:          `${ICON_ROOT}/nav-gear.svg`,
  augmentation:  `${ICON_ROOT}/nav-augmentations.svg`,
  magician:      `${ICON_ROOT}/nav-spells.svg`,
  technomancer:  `${ICON_ROOT}/nav-deck.svg`,
  social:        `${ICON_ROOT}/nav-contacts.svg`,
  bio:           `${ICON_ROOT}/nav-bio.svg`,
  effects:       `${ICON_ROOT}/nav-modifiers.svg`,
  device:        `${ICON_ROOT}/nav-information.svg`,
  drone:         `${ICON_ROOT}/nav-gear.svg`,
}

// ---------------------------------------------------------------------------
//  Block definitions — { partial, label, size }
// ---------------------------------------------------------------------------

export const BLOCK_REGISTRY = {

  // ---- Core Info (single) ----
  attributes:          {
    partial: `${PARTIAL_ROOT}/left-tabs/coreInfos/attributes.hbs`,          label: 'SR5.SheetConfig.Block.Attributes',       size: BLOCK_SIZE.SINGLE 
  },
  resistances:         {
    partial: `${PARTIAL_ROOT}/left-tabs/coreInfos/resistances.hbs`,         label: 'SR5.SheetConfig.Block.Resistances',      size: BLOCK_SIZE.SINGLE 
  },
  defenses:            {
    partial: `${PARTIAL_ROOT}/left-tabs/coreInfos/defenses.hbs`,            label: 'SR5.SheetConfig.Block.Defenses',         size: BLOCK_SIZE.SINGLE 
  },
  initiatives:         {
    partial: `${PARTIAL_ROOT}/left-tabs/coreInfos/initiatives.hbs`,         label: 'SR5.SheetConfig.Block.Initiatives',      size: BLOCK_SIZE.SINGLE 
  },
  controlMode:         {
    partial: `${PARTIAL_ROOT}/left-tabs/coreInfos/controlMode.hbs`,         label: 'SR5.SheetConfig.Block.ControlMode',      size: BLOCK_SIZE.SINGLE 
  },

  // ---- Derived (single) ----
  limits:              {
    partial: `${PARTIAL_ROOT}/left-tabs/derived/limits.hbs`,                label: 'SR5.SheetConfig.Block.Limits',           size: BLOCK_SIZE.SINGLE 
  },
  derivedAttributes:   {
    partial: `${PARTIAL_ROOT}/left-tabs/derived/derivedAttributes.hbs`,     label: 'SR5.SheetConfig.Block.DerivedAttributes', size: BLOCK_SIZE.SINGLE 
  },
  essence:             {
    partial: `${PARTIAL_ROOT}/left-tabs/derived/essence.hbs`,               label: 'SR5.SheetConfig.Block.Essence',          size: BLOCK_SIZE.SINGLE 
  },
  carrying:            {
    partial: `${PARTIAL_ROOT}/left-tabs/derived/carrying.hbs`,              label: 'SR5.SheetConfig.Block.Carrying',         size: BLOCK_SIZE.SINGLE 
  },
  movement:            {
    partial: `${PARTIAL_ROOT}/left-tabs/derived/movement.hbs`,              label: 'SR5.SheetConfig.Block.Movement',         size: BLOCK_SIZE.SINGLE 
  },

  // ---- Magic User sidebar (single) ----
  magicUserType:       {
    partial: `${PARTIAL_ROOT}/left-tabs/magicUser/type.hbs`,                label: 'SR5.SheetConfig.Block.MagicUserType',    size: BLOCK_SIZE.SINGLE 
  },
  adeptPowerPoint:     {
    partial: `${PARTIAL_ROOT}/left-tabs/magicUser/adeptPowerPoint.hbs`,     label: 'SR5.SheetConfig.Block.AdeptPowerPoint',  size: BLOCK_SIZE.SINGLE 
  },
  tradition:           {
    partial: `${PARTIAL_ROOT}/left-tabs/magicUser/tradition.hbs`,           label: 'SR5.SheetConfig.Block.Tradition',        size: BLOCK_SIZE.SINGLE 
  },
  astral:              {
    partial: `${PARTIAL_ROOT}/left-tabs/magicUser/astral.hbs`,              label: 'SR5.SheetConfig.Block.Astral',           size: BLOCK_SIZE.SINGLE 
  },
  reagents:            {
    partial: `${PARTIAL_ROOT}/left-tabs/magicUser/reagents.hbs`,            label: 'SR5.SheetConfig.Block.Reagents',         size: BLOCK_SIZE.SINGLE 
  },

  // ---- Matrix User sidebar (single) ----
  matrixDevice:        {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/device.hbs`,             label: 'SR5.SheetConfig.Block.MatrixDevice',     size: BLOCK_SIZE.SINGLE 
  },
  matrixSilentMode:    {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/silentMode.hbs`,         label: 'SR5.SheetConfig.Block.SilentMode',       size: BLOCK_SIZE.SINGLE 
  },
  matrixInit:          {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/matrixInit.hbs`,         label: 'SR5.SheetConfig.Block.MatrixInit',       size: BLOCK_SIZE.SINGLE 
  },
  matrixGrid:          {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/grid.hbs`,               label: 'SR5.SheetConfig.Block.MatrixGrid',       size: BLOCK_SIZE.SINGLE 
  },
  matrixAttributes:    {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/matrixAttributes.hbs`,   label: 'SR5.SheetConfig.Block.MatrixAttributes', size: BLOCK_SIZE.SINGLE 
  },
  matrixPrograms:      {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/matrixPrograms.hbs`,     label: 'SR5.SheetConfig.Block.MatrixPrograms',   size: BLOCK_SIZE.SINGLE 
  },
  matrixMonitor:       {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/matrixMonitor.hbs`,      label: 'SR5.SheetConfig.Block.MatrixMonitor',    size: BLOCK_SIZE.SINGLE 
  },
  matrixResistances:   {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/matrixResistances.hbs`,  label: 'SR5.SheetConfig.Block.MatrixResistances', size: BLOCK_SIZE.SINGLE 
  },
  matrixPan:           {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/pan.hbs`,                label: 'SR5.SheetConfig.Block.MatrixPan',        size: BLOCK_SIZE.SINGLE 
  },
  matrixMarksControled:{
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/marksControled.hbs`,     label: 'SR5.SheetConfig.Block.MarksControled',   size: BLOCK_SIZE.SINGLE 
  },
  matrixOverwatch:     {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/overwatchScore.hbs`,     label: 'SR5.SheetConfig.Block.Overwatch',        size: BLOCK_SIZE.SINGLE 
  },
  matrixMarks:         {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/marks.hbs`,              label: 'SR5.SheetConfig.Block.MatrixMarks',      size: BLOCK_SIZE.SINGLE 
  },
  matrixNoDevice:      {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/noDevice.hbs`,           label: 'SR5.SheetConfig.Block.NoDevice',         size: BLOCK_SIZE.SINGLE 
  },
  matrixMaglockType:   {
    partial: `${PARTIAL_ROOT}/left-tabs/matrixUser/maglockType.hbs`,        label: 'SR5.SheetConfig.Block.MaglockType',      size: BLOCK_SIZE.SINGLE 
  },

  // ---- Qualities sidebar (single) ----
  qualities:           {
    partial: `${PARTIAL_ROOT}/left-tabs/qualities/qualities.hbs`,           label: 'SR5.SheetConfig.Block.Qualities',        size: BLOCK_SIZE.SINGLE 
  },
  visions:             {
    partial: `${PARTIAL_ROOT}/left-tabs/qualities/visions.hbs`,             label: 'SR5.SheetConfig.Block.Visions',          size: BLOCK_SIZE.SINGLE 
  },
  addictions:          {
    partial: `${PARTIAL_ROOT}/left-tabs/qualities/addictions.hbs`,          label: 'SR5.SheetConfig.Block.Addictions',       size: BLOCK_SIZE.SINGLE 
  },

  // ---- Skills (double) ----
  activeSkills:        {
    partial: `${PARTIAL_ROOT}/right-tabs/skills/activeSkills.hbs`,          label: 'SR5.SheetConfig.Block.ActiveSkills',     size: BLOCK_SIZE.DOUBLE 
  },
  skillGroups:         {
    partial: `${PARTIAL_ROOT}/right-tabs/skills/skillGroups.hbs`,           label: 'SR5.SheetConfig.Block.SkillGroups',      size: BLOCK_SIZE.DOUBLE 
  },
  knowledgeSkills:     {
    partial: `${PARTIAL_ROOT}/right-tabs/skills/knowledgeSkills.hbs`,       label: 'SR5.SheetConfig.Block.KnowledgeSkills',  size: BLOCK_SIZE.DOUBLE 
  },
  languageSkills:      {
    partial: `${PARTIAL_ROOT}/right-tabs/skills/languageSkills.hbs`,        label: 'SR5.SheetConfig.Block.LanguageSkills',   size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Combat (double) ----
  rangedWeapons:       {
    partial: `${PARTIAL_ROOT}/right-tabs/combat/rangedWeapons.hbs`,         label: 'SR5.SheetConfig.Block.RangedWeapons',    size: BLOCK_SIZE.DOUBLE 
  },
  meleeWeapons:        {
    partial: `${PARTIAL_ROOT}/right-tabs/combat/meleeWeapons.hbs`,          label: 'SR5.SheetConfig.Block.MeleeWeapons',     size: BLOCK_SIZE.DOUBLE 
  },
  grenades:            {
    partial: `${PARTIAL_ROOT}/right-tabs/combat/grenades.hbs`,              label: 'SR5.SheetConfig.Block.Grenades',         size: BLOCK_SIZE.DOUBLE 
  },
  weaponAccessories:   {
    partial: `${PARTIAL_ROOT}/right-tabs/combat/weaponAccessories.hbs`,     label: 'SR5.SheetConfig.Block.WeaponAccessories', size: BLOCK_SIZE.DOUBLE 
  },
  armors:              {
    partial: `${PARTIAL_ROOT}/right-tabs/combat/armors.hbs`,                label: 'SR5.SheetConfig.Block.Armors',           size: BLOCK_SIZE.DOUBLE 
  },
  ammunitions:         {
    partial: `${PARTIAL_ROOT}/right-tabs/combat/ammunitions.hbs`,           label: 'SR5.SheetConfig.Block.Ammunitions',      size: BLOCK_SIZE.DOUBLE 
  },
  martialArts:         {
    partial: `${PARTIAL_ROOT}/right-tabs/combat/martialArts.hbs`,           label: 'SR5.SheetConfig.Block.MartialArts',      size: BLOCK_SIZE.DOUBLE 
  },
  spiritWeapons:       {
    partial: `${PARTIAL_ROOT}/right-tabs/combat/spiritWeapons.hbs`,         label: 'SR5.SheetConfig.Block.SpiritWeapons',    size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Gear (double) ----
  variousGear:         {
    partial: `${PARTIAL_ROOT}/right-tabs/gear/variousGear.hbs`,             label: 'SR5.SheetConfig.Block.VariousGear',      size: BLOCK_SIZE.DOUBLE 
  },
  vehicles:            {
    partial: `${PARTIAL_ROOT}/right-tabs/gear/vehicles.hbs`,                label: 'SR5.SheetConfig.Block.Vehicles',         size: BLOCK_SIZE.DOUBLE 
  },
  money:               {
    partial: `${PARTIAL_ROOT}/right-tabs/gear/money.hbs`,                   label: 'SR5.SheetConfig.Block.Money',            size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Augmentation (double) ----
  augmentations:       {
    partial: `${PARTIAL_ROOT}/right-tabs/augmentation/augmentations.hbs`,   label: 'SR5.SheetConfig.Block.Augmentations',    size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Effects (double) ----
  externalEffects:     {
    partial: `${PARTIAL_ROOT}/right-tabs/effects/externalEffects.hbs`,      label: 'SR5.SheetConfig.Block.ExternalEffects',  size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Magic (double) ----
  spells:              {
    partial: `${PARTIAL_ROOT}/right-tabs/magic/spells.hbs`,                 label: 'SR5.SheetConfig.Block.Spells',           size: BLOCK_SIZE.DOUBLE 
  },
  adeptPowers:         {
    partial: `${PARTIAL_ROOT}/right-tabs/magic/adeptPowers.hbs`,            label: 'SR5.SheetConfig.Block.AdeptPowers',      size: BLOCK_SIZE.DOUBLE 
  },
  summonedSpirits:     {
    partial: `${PARTIAL_ROOT}/right-tabs/magic/summonedSpirits.hbs`,        label: 'SR5.SheetConfig.Block.SummonedSpirits',  size: BLOCK_SIZE.DOUBLE 
  },
  foci:                {
    partial: `${PARTIAL_ROOT}/right-tabs/magic/foci.hbs`,                   label: 'SR5.SheetConfig.Block.Foci',             size: BLOCK_SIZE.DOUBLE 
  },
  preparations:        {
    partial: `${PARTIAL_ROOT}/right-tabs/magic/preparations.hbs`,           label: 'SR5.SheetConfig.Block.Preparations',     size: BLOCK_SIZE.DOUBLE 
  },
  rituals:             {
    partial: `${PARTIAL_ROOT}/right-tabs/magic/rituals.hbs`,                label: 'SR5.SheetConfig.Block.Rituals',          size: BLOCK_SIZE.DOUBLE 
  },
  powers:              {
    partial: `${PARTIAL_ROOT}/right-tabs/magic/powers.hbs`,                 label: 'SR5.SheetConfig.Block.Powers',           size: BLOCK_SIZE.DOUBLE 
  },
  metamagics:          {
    partial: `${PARTIAL_ROOT}/right-tabs/magic/metamagics.hbs`,             label: 'SR5.SheetConfig.Block.Metamagics',       size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Technomancer (double) ----
  resonanceActions:    {
    partial: `${PARTIAL_ROOT}/right-tabs/technomancer/resonanceActions.hbs`, label: 'SR5.SheetConfig.Block.ResonanceActions', size: BLOCK_SIZE.DOUBLE 
  },
  complexForms:        {
    partial: `${PARTIAL_ROOT}/right-tabs/technomancer/complexForms.hbs`,     label: 'SR5.SheetConfig.Block.ComplexForms',    size: BLOCK_SIZE.DOUBLE 
  },
  spriteItems:         {
    partial: `${PARTIAL_ROOT}/right-tabs/technomancer/sprites.hbs`,          label: 'SR5.SheetConfig.Block.Sprites',         size: BLOCK_SIZE.DOUBLE 
  },
  echoes:              {
    partial: `${PARTIAL_ROOT}/right-tabs/technomancer/echoes.hbs`,            label: 'SR5.SheetConfig.Block.Echoes',          size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Matrix main (double) ----
  matrixDevicesList:   {
    partial: `${PARTIAL_ROOT}/right-tabs/matrix/devices.hbs`,               label: 'SR5.SheetConfig.Block.MatrixDevices',    size: BLOCK_SIZE.DOUBLE 
  },
  matrixProgramsList:  {
    partial: `${PARTIAL_ROOT}/right-tabs/matrix/programs.hbs`,              label: 'SR5.SheetConfig.Block.MatrixProgramsList', size: BLOCK_SIZE.DOUBLE 
  },
  matrixActionsList:   {
    partial: `${PARTIAL_ROOT}/right-tabs/matrix/matrixActions.hbs`,         label: 'SR5.SheetConfig.Block.MatrixActions',    size: BLOCK_SIZE.DOUBLE 
  },
  iceAttack:           {
    partial: `${PARTIAL_ROOT}/right-tabs/matrix/iceAttack.hbs`,             label: 'SR5.SheetConfig.Block.IceAttack',        size: BLOCK_SIZE.DOUBLE 
  },
  spritePowers:        {
    partial: `${PARTIAL_ROOT}/right-tabs/matrix/spritePowers.hbs`,          label: 'SR5.SheetConfig.Block.SpritePowers',     size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Social (double) ----
  contacts:            {
    partial: `${PARTIAL_ROOT}/right-tabs/social/contacts.hbs`,              label: 'SR5.SheetConfig.Block.Contacts',         size: BLOCK_SIZE.DOUBLE 
  },
  lifestyles:          {
    partial: `${PARTIAL_ROOT}/right-tabs/social/lifestyles.hbs`,            label: 'SR5.SheetConfig.Block.Lifestyles',       size: BLOCK_SIZE.DOUBLE 
  },
  sins:                {
    partial: `${PARTIAL_ROOT}/right-tabs/social/sins.hbs`,                  label: 'SR5.SheetConfig.Block.Sins',             size: BLOCK_SIZE.DOUBLE 
  },
  reputation:          {
    partial: `${PARTIAL_ROOT}/right-tabs/social/reputation.hbs`,            label: 'SR5.SheetConfig.Block.Reputation',       size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Biography (double) ----
  biography:           {
    partial: `${PARTIAL_ROOT}/right-tabs/biography/biography.hbs`,          label: 'SR5.SheetConfig.Block.Biography',        size: BLOCK_SIZE.DOUBLE 
  },
  biographyContact:    {
    partial: `${PARTIAL_ROOT}/right-tabs/biography/biographyContact.hbs`,   label: 'SR5.SheetConfig.Block.BiographyContact', size: BLOCK_SIZE.DOUBLE 
  },
  critterBiography:    {
    partial: `${PARTIAL_ROOT}/right-tabs/biography/critterBiography.hbs`,   label: 'SR5.SheetConfig.Block.CritterBio',      size: BLOCK_SIZE.DOUBLE 
  },
  description:         {
    partial: `${PARTIAL_ROOT}/right-tabs/biography/description.hbs`,        label: 'SR5.SheetConfig.Block.Description',      size: BLOCK_SIZE.DOUBLE 
  },
  descriptionGrunt:    {
    partial: `${PARTIAL_ROOT}/right-tabs/biography/descriptionGrunt.hbs`,   label: 'SR5.SheetConfig.Block.DescriptionGrunt', size: BLOCK_SIZE.DOUBLE 
  },
  background:          {
    partial: `${PARTIAL_ROOT}/right-tabs/biography/background.hbs`,         label: 'SR5.SheetConfig.Block.Background',       size: BLOCK_SIZE.DOUBLE 
  },
  karma:               {
    partial: `${PARTIAL_ROOT}/right-tabs/biography/karma.hbs`,              label: 'SR5.SheetConfig.Block.Karma',            size: BLOCK_SIZE.DOUBLE 
  },

  // ---- Drone (double) ----
  droneRoll:           {
    partial: `${PARTIAL_ROOT}/right-tabs/droneStuff/droneRoll.hbs`,         label: 'SR5.SheetConfig.Block.DroneRoll',        size: BLOCK_SIZE.DOUBLE 
  },
  modifications:       {
    partial: `${PARTIAL_ROOT}/right-tabs/droneStuff/modifications.hbs`,     label: 'SR5.SheetConfig.Block.Modifications',    size: BLOCK_SIZE.DOUBLE 
  },
}
