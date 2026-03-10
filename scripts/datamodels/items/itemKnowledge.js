import { descriptionPartialModel } from './partial/description.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ItemKnowledgeDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      type: new fields.StringField({initial: ''}),
      linkedAttribute: new fields.StringField({initial: ''}),
      rating: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
      }),
      test: new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
    }
  }
}
