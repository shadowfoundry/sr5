import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  boughtOrSoldPartialModel 
} from './partial/boughtOrSold.js'
import {
  activationPartialModel 
} from './partial/activation.js'
import {
  effectsPartialModel 
} from './partial/effects.js'

export class sr5ItemDrugDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      quantity: new fields.NumberField({
        initial: 1
      }),
      vector: new fields.SchemaField({
        contact: new fields.BooleanField({
          initial: false
        }),
        ingestion: new fields.BooleanField({
          initial: false
        }),
        inhalation: new fields.BooleanField({
          initial: false
        }),
        injection: new fields.BooleanField({
          initial: false
        }),
        value: new fields.ArrayField(new fields.StringField()),
      }),
      speed: new fields.StringField({
        initial: ''
      }),
      duration: new fields.StringField({
        initial: ''
      }),
      addiction: new fields.SchemaField({
        type: new fields.StringField({
          initial: ''
        }),
        rating: new fields.NumberField({
          initial: 0
        }),
        threshold: new fields.NumberField({
          initial: 0
        }),
      }),
      onUse: new fields.SchemaField({
        duration: new fields.StringField({
          initial: ''
        }),
        contrecoup: new fields.StringField({
          initial: ''
        }),
      }),
      interact: new fields.BooleanField({
        initial: false
      }),
      handleShot: new fields.ArrayField(new fields.ObjectField()),
      wirelessTurnedOn: new fields.BooleanField({
        initial: false
      }),
    }
  }
}
