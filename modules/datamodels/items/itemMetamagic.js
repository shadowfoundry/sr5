import { descriptionPartialModel } from './partial/description.js'
import { effectsPartialModel } from './partial/effects.js'
import { activationPartialModel } from './partial/activation.js'

export class sr5ItemMetamagicDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      rank: new fields.NumberField({initial: 0}),
    }
  }
}
