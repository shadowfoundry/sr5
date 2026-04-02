import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  activationPartialModel 
} from './partial/activation.js'
import {
  effectsPartialModel 
} from './partial/effects.js'

export class sr5ItemComplexFormDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      level: new fields.NumberField({
        initial: 0
      }),
      hits: new fields.NumberField({
        initial: 0
      }),
      fadingModifier: new fields.NumberField({
        initial: 0
      }),
      fadingValue: new fields.NumberField({
        initial: 0
      }),
      threaderResonance: new fields.NumberField({
        initial: 0
      }),
      target: new fields.StringField({
        initial: ''
      }),
      duration: new fields.StringField({
        initial: ''
      }),
      defenseAttribute: new fields.StringField({
        initial: ''
      }),
      defenseMatrixAttribute: new fields.StringField({
        initial: ''
      }),
      freeSustain: new fields.BooleanField({
        initial: false
      }),
      targetOfEffect: new fields.ArrayField(new fields.ObjectField()),
    }
  }
}
