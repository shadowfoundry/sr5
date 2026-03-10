import { characterAttributesPartialModel } from './partial/attributes.js'
import { characterResonanceAttributesPartialModel } from './partial/resonanceAttributes.js'
import { matrixPartialModel } from './partial/matrix.js'
import { specialPropertiesPartialModel } from './partial/specialProperties.js'
import { penaltiesPartialModel } from './partial/penalties.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ActorAgentDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const agentSkillSchema = () => new fields.SchemaField({
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
        computer: agentSkillSchema(),
        hacking: agentSkillSchema(),
        electronicWarfare: agentSkillSchema(),
        cybercombat: agentSkillSchema(),
        hardware: agentSkillSchema(),
        software: agentSkillSchema(),
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
      rating: new fields.NumberField({initial: 0}),
      creatorId: new fields.StringField({initial: ''}),
      creatorItemId: new fields.StringField({initial: ''}),
      creatorData: new fields.ObjectField(),
    }
  }
}
