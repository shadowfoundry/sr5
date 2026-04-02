import { sr5ModsPartialModel } from '../../common/mods.js'

export class magicPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields


    const dicePoolSchema = () => {
      return {
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }
    }

    return {
      magic: new fields.SchemaField({
        magicType: new fields.StringField({initial: ''}),
        tradition: new fields.StringField({initial: ''}),
        concentration: new fields.BooleanField({initial: false}),
        elements: new fields.SchemaField({
          combat: new fields.StringField({initial: ''}),
          detection: new fields.StringField({initial: ''}),
          illusion: new fields.StringField({initial: ''}),
          manipulation: new fields.StringField({initial: ''}),
          health: new fields.StringField({initial: ''}),
        }),
        astralDamage: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        astralDefense: new fields.SchemaField({...dicePoolSchema()}),
        astralTracking: new fields.SchemaField({...dicePoolSchema()}),
        passThroughBarrier: new fields.SchemaField({...dicePoolSchema()}),
        initiationGrade: new fields.NumberField({initial: 0}),
        powerPoints: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          maximum: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        drainResistance: new fields.SchemaField({
          dicePool: new fields.NumberField({initial: 0}),
          base: new fields.NumberField({initial: 0}),
          modifiers: new fields.ArrayField(new fields.ObjectField()),
          linkedAttribute: new fields.StringField({initial: ''}),
        }),
        possession: new fields.BooleanField({initial: false}),
        hasAstralProjection: new fields.BooleanField({initial: false}),
        counterSpellPool: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          current: new fields.NumberField({initial: 0}),
        }),
        reagents: new fields.NumberField({initial: 0}),
        boundedSpirit: new fields.SchemaField({
          current: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
        spellList: new fields.ObjectField(),
        metamagics: new fields.SchemaField({
          centering: new fields.BooleanField({initial: false}),
          centeringValue: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          quickening: new fields.BooleanField({initial: false}),
          shielding: new fields.BooleanField({initial: false}),
          spellShaping: new fields.BooleanField({initial: false}),
          spellShapingValue: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        }),
        bgCount: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
      }),
    }
  }
}
