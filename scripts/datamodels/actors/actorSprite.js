import { characterAttributesPartialModel } from './partial/attributes.js'
import { characterResonanceAttributesPartialModel } from './partial/resonanceAttributes.js'
import { matrixPartialModel } from './partial/matrix.js'
import { specialPropertiesPartialModel } from './partial/specialProperties.js'
import { penaltiesPartialModel } from './partial/penalties.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ActorSpriteDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const spriteSkillSchema = () => new fields.SchemaField({
      rating: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      test: new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
      linkedAttribute: new fields.StringField({initial: 'logic'}),
      limit: new fields.SchemaField({
        value: new fields.NumberField({initial: 0}),
        base: new fields.StringField({initial: 'mentalLimit'}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
    })

    return {
      ...characterAttributesPartialModel.defineSchema(),
      ...characterResonanceAttributesPartialModel.defineSchema(),
      ...matrixPartialModel.defineSchema(),
      ...specialPropertiesPartialModel.defineSchema(),
      ...penaltiesPartialModel.defineSchema(),
      initiatives: new fields.SchemaField({
        matrixInit: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          dice: new fields.SchemaField({
            value: new fields.NumberField({initial: 0}),
            base: new fields.NumberField({initial: 0}),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
          isActive: new fields.BooleanField({initial: true}),
        }),
      }),
      skills: new fields.SchemaField({
        computer: spriteSkillSchema(),
        hacking: spriteSkillSchema(),
        electronicWarfare: spriteSkillSchema(),
        cybercombat: spriteSkillSchema(),
        hardware: spriteSkillSchema(),
        software: spriteSkillSchema(),
      }),
      conditionMonitors: new fields.SchemaField({
        matrix: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
      }),
      statusBars: new fields.SchemaField({
        matrix: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
      }),
      limits: new fields.SchemaField({
        mentalLimit: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      }),
      isRegistered: new fields.BooleanField({initial: false}),
      type: new fields.StringField({initial: ''}),
      level: new fields.NumberField({initial: 0}),
      compilerResonance: new fields.NumberField({initial: 0}),
      creatorId: new fields.StringField({initial: ''}),
      creatorItemId: new fields.StringField({initial: ''}),
      tasks: new fields.SchemaField({
        value: new fields.NumberField({initial: 0}),
        max: new fields.NumberField({initial: 0}),
      }),
    }
  }
}
