import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  effectsPartialModel 
} from './partial/effects.js'

export class sr5ItemTraditionDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      drainAttribute: new fields.StringField({
        initial: ''
      }),
      spiritCombat: new fields.StringField({
        initial: ''
      }),
      spiritDetection: new fields.StringField({
        initial: ''
      }),
      spiritIllusion: new fields.StringField({
        initial: ''
      }),
      spiritManipulation: new fields.StringField({
        initial: ''
      }),
      spiritHealth: new fields.StringField({
        initial: ''
      }),
      possession: new fields.BooleanField({
        initial: false
      }),
    }
  }
}
