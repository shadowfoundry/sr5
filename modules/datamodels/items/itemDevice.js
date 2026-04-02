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
  concealmentPartialModel 
} from './partial/concealment.js'
import {
  wirelessPartialModel 
} from './partial/wireless.js'
import {
  effectsPartialModel 
} from './partial/effects.js'

export class sr5ItemDeviceDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...concealmentPartialModel.defineSchema(),
      ...wirelessPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      attributesCollection: new fields.SchemaField({
        value1: new fields.NumberField({
          initial: 0
        }),
        value2: new fields.NumberField({
          initial: 0
        }),
        value3: new fields.NumberField({
          initial: 0
        }),
        value4: new fields.NumberField({
          initial: 0
        }),
        value1isSet: new fields.BooleanField({
          initial: false
        }),
        value2isSet: new fields.BooleanField({
          initial: false
        }),
        value3isSet: new fields.BooleanField({
          initial: false
        }),
        value4isSet: new fields.BooleanField({
          initial: false
        }),
      }),
      type: new fields.StringField({
        initial: ''
      }),
      program: new fields.SchemaField({
        value: new fields.NumberField({
          initial: 0
        }),
        max: new fields.NumberField({
          initial: 0
        }),
      }),
      module: new fields.StringField({
        initial: ''
      }),
      dongle: new fields.StringField({
        initial: ''
      }),
      modifiers: new fields.ArrayField(new fields.ObjectField()),
      pan: new fields.SchemaField({
        max: new fields.NumberField({
          initial: 0
        }),
        current: new fields.NumberField({
          initial: 0
        }),
        content: new fields.ArrayField(new fields.ObjectField()),
      }),
      markedItems: new fields.ArrayField(new fields.ObjectField()),
    }
  }
}
