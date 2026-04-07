import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  boughtOrSoldPartialModel 
} from './partial/boughtOrSold.js'

export class sr5ItemAmmunitionDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      quantity: new fields.NumberField({
        initial: 1
      }),
      type: new fields.StringField({
        initial: ''
      }),
      class: new fields.StringField({
        initial: ''
      }),
      caseType: new fields.StringField({
        initial: ''
      }),
      rating: new fields.StringField({
        initial: ''
      }),
      ammunitionTypeUuid: new fields.StringField({
        initial: ''
      }),
      effects: new fields.SchemaField({
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
        blastRadius: new fields.NumberField({
          initial: 0
        }),
        blastFallOff: new fields.NumberField({
          initial: 0
        }),
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
        calledShotTags: new fields.ArrayField(new fields.StringField()),
        calledShotOverrides: new fields.ObjectField({
          initial: {
          }
        }),
      }),
    }
  }
}
