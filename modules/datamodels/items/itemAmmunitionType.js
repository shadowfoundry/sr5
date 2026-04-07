import {
  descriptionPartialModel
} from './partial/description.js'

export class sr5ItemAmmunitionTypeDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),

      // Core modifiers
      apMod: new fields.NumberField({
        initial: 0
      }),
      damageMod: new fields.NumberField({
        initial: 0
      }),
      damageType: new fields.StringField({
        initial: ''
      }),
      damageElement: new fields.StringField({
        initial: ''
      }),
      accuracyMod: new fields.NumberField({
        initial: 0
      }),

      // Blast
      blastRadius: new fields.NumberField({
        initial: 0
      }),
      blastFallOff: new fields.NumberField({
        initial: 0
      }),

      // Special behavior
      flatDamage: new fields.NumberField({
        initial: 0
      }),
      disableStrDamage: new fields.BooleanField({
        initial: false
      }),
      overrideBaseAP: new fields.BooleanField({
        initial: false
      }),
      scatterDice: new fields.NumberField({
        initial: 0
      }),
      envRangeMod: new fields.NumberField({
        initial: 0
      }),
      envWindMod: new fields.NumberField({
        initial: 0
      }),

      // Combat rule flags
      gelDamageReduction: new fields.NumberField({
        initial: 0
      }),
      injectionNetHits: new fields.NumberField({
        initial: 0
      }),
      showToxinButton: new fields.BooleanField({
        initial: false
      }),
      antiVehicleAP: new fields.NumberField({
        initial: 0
      }),

      // Called shots
      calledShotTags: new fields.ArrayField(new fields.StringField()),
      calledShotOverrides: new fields.ObjectField({
        initial: {
        }
      }),
    }
  }
}
