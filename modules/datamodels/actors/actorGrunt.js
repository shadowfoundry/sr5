import { sheetPreferencesPartialModel } from './partial/sheetPreferences.js'
import { characterAttributesPartialModel } from './partial/attributes.js'
import { characterInitiativesPartialModel } from './partial/initiatives.js'
import { characterLimitsPartialModel } from './partial/limits.js'
import { characterDefensesPartialModel } from './partial/defenses.js'
import { characterResistancesPartialModel } from './partial/resistances.js'
import { characterDerivedAttributesPartialModel } from './partial/derivedAttributes.js'
import { characterEssencePartialModel } from './partial/essence.js'
import { characterMovementsPartialModel } from './partial/movements.js'
import { characterWeightActionsPartialModel } from './partial/weightActions.js'
import { characterReachPartialModel } from './partial/reach.js'
import { skillGroupsPartialModel } from './partial/skillGroups.js'
import { allSkillFields, baseSkillSchema } from './partial/skills.js'
import { penaltiesPartialModel } from './partial/penalties.js'
import { visionPartialModel } from './partial/vision.js'
import { specialPropertiesPartialModel } from './partial/specialProperties.js'
import { recoilPartialModel } from './partial/recoil.js'
import { itemsPropertiesPartialModel } from './partial/itemsProperties.js'
import { matrixPartialModel } from './partial/matrix.js'
import { magicPartialModel } from './partial/magic.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ActorGruntDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    return {
      ...sheetPreferencesPartialModel.defineSchema(),
      ...characterAttributesPartialModel.defineSchema(),
      ...characterInitiativesPartialModel.defineSchema(),
      ...characterLimitsPartialModel.defineSchema(),
      ...characterDefensesPartialModel.defineSchema(),
      ...characterResistancesPartialModel.defineSchema(),
      ...characterDerivedAttributesPartialModel.defineSchema(),
      ...characterEssencePartialModel.defineSchema(),
      ...characterMovementsPartialModel.defineSchema(),
      ...characterWeightActionsPartialModel.defineSchema(),
      ...characterReachPartialModel.defineSchema(),
      ...skillGroupsPartialModel.defineSchema(),
      ...penaltiesPartialModel.defineSchema(),
      ...visionPartialModel.defineSchema(),
      ...specialPropertiesPartialModel.defineSchema(),
      ...recoilPartialModel.defineSchema(),
      ...itemsPropertiesPartialModel.defineSchema(),
      ...matrixPartialModel.defineSchema(),
      ...magicPartialModel.defineSchema(),
      specialAttributes: new fields.SchemaField({
        edge: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        magic: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        resonance: new fields.SchemaField({
          natural: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          augmented: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
      }),
      skills: new fields.SchemaField({
        ...allSkillFields(),
        flight: new fields.SchemaField({...baseSkillSchema('agility', 'physicalLimit', '', 'physicalSkills', true)}),
        compiling: new fields.SchemaField({...baseSkillSchema('resonance', 'spriteLevel', 'taskingGroup', 'resonanceSkills', false)}),
        decompiling: new fields.SchemaField({...baseSkillSchema('resonance', 'socialLimit', 'taskingGroup', 'resonanceSkills', false)}),
        registering: new fields.SchemaField({...baseSkillSchema('resonance', 'spriteLevel', 'taskingGroup', 'resonanceSkills', false)}),
      }),
      languageSkills: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      knowledgeSkills: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      conditionMonitors: new fields.SchemaField({
        condition: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
        edge: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
      }),
      statusBars: new fields.SchemaField({
        condition: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
        edge: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
      }),
      biography: new fields.SchemaField({
        characterMetatype: new fields.StringField({initial: ''}),
        nickname: new fields.StringField({initial: ''}),
        description: new fields.StringField({initial: ''}),
        metatypeVariant: new fields.StringField({initial: ''}),
        ethnicalGroup: new fields.StringField({initial: ''}),
        gender: new fields.StringField({initial: ''}),
        nationality: new fields.StringField({initial: ''}),
        age: new fields.StringField({initial: ''}),
        paymentMethod: new fields.StringField({initial: ''}),
        hobby: new fields.StringField({initial: ''}),
        familySituation: new fields.StringField({initial: ''}),
        background: new fields.StringField({initial: ''}),
      }),
      addictions: new fields.ArrayField(new fields.ObjectField()),
      activeSpecialAttribute: new fields.StringField({initial: 'magic'}),
    }
  }
}
