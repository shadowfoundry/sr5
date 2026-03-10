import { descriptionPartialModel } from './partial/description.js'
import { characterAttributesPartialModel } from '../actors/partial/attributes.js'
import { characterMagicAttributesPartialModel } from '../actors/partial/magicAttributes.js'
import { skillGroupsPartialModel } from '../actors/partial/skillGroups.js'
import { skillsPartialModel } from '../actors/partial/skills.js'
import { sheetPreferencesPartialModel } from '../actors/partial/sheetPreferences.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ItemContactDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...characterAttributesPartialModel.defineSchema(),
      ...characterMagicAttributesPartialModel.defineSchema(),
      ...skillGroupsPartialModel.defineSchema(),
      ...skillsPartialModel.defineSchema(),
      ...sheetPreferencesPartialModel.defineSchema(),
      connection: new fields.NumberField({initial: 0}),
      loyalty: new fields.NumberField({initial: 0}),
      metatype: new fields.StringField({initial: ''}),
      gender: new fields.StringField({initial: ''}),
      age: new fields.StringField({initial: ''}),
      type: new fields.StringField({initial: ''}),
      paymentMethod: new fields.StringField({initial: ''}),
      hobby: new fields.StringField({initial: ''}),
      familySituation: new fields.StringField({initial: ''}),
      nickname: new fields.StringField({initial: ''}),
      metatypeVariant: new fields.StringField({initial: ''}),
      ethnicalGroup: new fields.StringField({initial: ''}),
      nationality: new fields.StringField({initial: ''}),
      language: new fields.ArrayField(new fields.ObjectField()),
      knowledge: new fields.ArrayField(new fields.ObjectField()),
      weapons: new fields.ArrayField(new fields.ObjectField()),
      ammunitions: new fields.ArrayField(new fields.ObjectField()),
      armors: new fields.ArrayField(new fields.ObjectField()),
      decks: new fields.ArrayField(new fields.ObjectField()),
      vehicles: new fields.ArrayField(new fields.ObjectField()),
      conditionMonitors: new fields.SchemaField({
        condition: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema(),
          }),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
        edge: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema(),
          }),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
      }),
      isCreated: new fields.BooleanField({initial: false}),
    }
  }
}
