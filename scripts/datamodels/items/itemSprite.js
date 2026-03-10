import { ratingPartialModel } from './partial/rating.js'
import { descriptionPartialModel } from './partial/description.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ItemSpriteDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...ratingPartialModel.defineSchema(),
      ...descriptionPartialModel.defineSchema(),
      type: new fields.StringField({initial: ''}),
      compilerResonance: new fields.NumberField({initial: 0}),
      level: new fields.NumberField({initial: 0}),
      tasks: new fields.SchemaField({
        value: new fields.NumberField({initial: 0}),
        max: new fields.NumberField({initial: 0}),
      }),
      decks: new fields.ArrayField(new fields.ObjectField()),
      optionalPowers: new fields.SchemaField({
        power1: new fields.StringField({initial: ''}),
        power2: new fields.StringField({initial: ''}),
        power3: new fields.StringField({initial: ''}),
        power4: new fields.StringField({initial: ''}),
        power5: new fields.StringField({initial: ''}),
      }),
      spritePowers: new fields.ArrayField(new fields.ObjectField()),
      isRegistered: new fields.BooleanField({initial: false}),
      conditionMonitors: new fields.SchemaField({
        matrix: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema(),
          }),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
      }),
      sustainedComplexForm: new fields.ArrayField(new fields.ObjectField()),
      compiler: new fields.StringField({initial: ''}),
    }
  }
}
