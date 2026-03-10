import { sr5ModsPartialModel } from '../../common/mods.js'

export class specialPropertiesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      specialProperties: new fields.SchemaField({
        smartlink: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        concentration: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        controlRig: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        damageReduction: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
        hardenedArmors: new fields.SchemaField({
          normalWeapon: new fields.SchemaField({
            type: new fields.StringField({initial: ''}),
            ...sr5ModsPartialModel.defineSchema(),
          }),
          astral: new fields.SchemaField({
            type: new fields.StringField({initial: ''}),
            ...sr5ModsPartialModel.defineSchema(),
          }),
          cold: new fields.SchemaField({
            type: new fields.StringField({initial: ''}),
            ...sr5ModsPartialModel.defineSchema(),
          }),
          fire: new fields.SchemaField({
            type: new fields.StringField({initial: ''}),
            ...sr5ModsPartialModel.defineSchema(),
          }),
          toxins: new fields.SchemaField({
            type: new fields.StringField({initial: ''}),
            ...sr5ModsPartialModel.defineSchema(),
          }),
          pathogens: new fields.SchemaField({
            type: new fields.StringField({initial: ''}),
            ...sr5ModsPartialModel.defineSchema(),
          }),
        }),
        doublePenalties: new fields.BooleanField({initial: false}),
        energyAura: new fields.StringField({initial: ''}),
        regeneration: new fields.BooleanField({initial: false}),
        essenceDrain: new fields.BooleanField({initial: false}),
        anticoagulant: new fields.BooleanField({initial: false}),
        fullDefenseAttribute: new fields.StringField({initial: 'willpower'}),
        fullDefenseValue: new fields.NumberField({initial: 0}),
        actions: new fields.SchemaField({
          free: new fields.SchemaField({
            value: new fields.NumberField({initial: 1}),
            base: new fields.NumberField({initial: 1}),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
            current: new fields.NumberField({initial: 1}),
          }),
          simple: new fields.SchemaField({
            value: new fields.NumberField({initial: 2}),
            base: new fields.NumberField({initial: 2}),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
            current: new fields.NumberField({initial: 2}),
          }),
          complex: new fields.SchemaField({
            value: new fields.NumberField({initial: 1}),
            base: new fields.NumberField({initial: 1}),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
            current: new fields.NumberField({initial: 1}),
          }),
          interruption: new fields.SchemaField({
            value: new fields.NumberField({initial: 10}),
            base: new fields.NumberField({initial: 10}),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
            current: new fields.NumberField({initial: 10}),
          }),
        }),
      }),
    }
  }
}
