import { sheetPreferencesPartialModel } from './partial/sheetPreferences.js'
import { characterAttributesPartialModel } from './partial/attributes.js'
import { characterMagicAttributesPartialModel } from './partial/magicAttributes.js'
import { characterResonanceAttributesPartialModel } from './partial/resonanceAttributes.js'
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
import { skillsPartialModel, allSkillFields, baseSkillSchema } from './partial/skills.js'
import { penaltiesPartialModel } from './partial/penalties.js'
import { visionPartialModel } from './partial/vision.js'
import { specialPropertiesPartialModel } from './partial/specialProperties.js'
import { recoilPartialModel } from './partial/recoil.js'
import { itemsPropertiesPartialModel } from './partial/itemsProperties.js'
import { matrixPartialModel } from './partial/matrix.js'
import { magicPartialModel } from './partial/magic.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ActorPcDataModel extends foundry.abstract.TypeDataModel {
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
        compiling: new fields.SchemaField({...baseSkillSchema('resonance', 'spriteLevel', 'taskingGroup', 'resonanceSkills', false)}),
        decompiling: new fields.SchemaField({...baseSkillSchema('resonance', 'socialLimit', 'taskingGroup', 'resonanceSkills', false)}),
        registering: new fields.SchemaField({...baseSkillSchema('resonance', 'spriteLevel', 'taskingGroup', 'resonanceSkills', false)}),
      }),
      languageSkills: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
      }),
      knowledgeSkills: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema(),
      }),
      conditionMonitors: new fields.SchemaField({
        stun: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
        physical: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
        edge: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
        overflow: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
      }),
      statusBars: new fields.SchemaField({
        stun: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
        physical: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
        edge: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
        condition: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
        matrix: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
        overflow: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
      }),
      biography: new fields.SchemaField({
        name: new fields.StringField({initial: ''}),
        alias: new fields.StringField({initial: ''}),
        nationality: new fields.StringField({initial: ''}),
        birthPlace: new fields.StringField({initial: ''}),
        familySituation: new fields.StringField({initial: ''}),
        dependants: new fields.StringField({initial: ''}),
        metatype: new fields.StringField({initial: ''}),
        metatypeVariant: new fields.StringField({initial: ''}),
        ethnicalGroup: new fields.StringField({initial: ''}),
        gender: new fields.StringField({initial: ''}),
        age: new fields.StringField({initial: ''}),
        eyes: new fields.StringField({initial: ''}),
        height: new fields.StringField({initial: ''}),
        weight: new fields.StringField({initial: ''}),
        hair: new fields.StringField({initial: ''}),
        skin: new fields.StringField({initial: ''}),
        description: new fields.StringField({initial: ''}),
        background: new fields.StringField({initial: ''}),
      }),
      critterBiography: new fields.SchemaField({
        binomial: new fields.StringField({initial: ''}),
        terrain: new fields.StringField({initial: ''}),
        diet: new fields.StringField({initial: ''}),
        activity: new fields.StringField({initial: ''}),
        aggroIndex: new fields.StringField({initial: ''}),
        lengthHeight: new fields.StringField({initial: ''}),
        mass: new fields.StringField({initial: ''}),
      }),
      karma: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      nuyen: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      streetCred: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      notoriety: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      addictions: new fields.ArrayField(new fields.ObjectField()),
      publicAwareness: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      activeSpecialAttribute: new fields.StringField({initial: 'magic'}),
    }
  }
}
