
export class sheetPreferencesPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      sheetPreferences: new fields.SchemaField({
        tabAugmentations: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          augmentations: new fields.BooleanField({initial: true}),
          effects: new fields.BooleanField({initial: true}),
        }),
        tabAwaken: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          type: new fields.BooleanField({initial: true}),
          tradition: new fields.BooleanField({initial: true}),
          astral: new fields.BooleanField({initial: true}),
          reagents: new fields.BooleanField({initial: true}),
        }),
        tabBiography: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          biography: new fields.BooleanField({initial: true}),
          critterBiography: new fields.BooleanField({initial: false}),
          description: new fields.BooleanField({initial: true}),
          background: new fields.BooleanField({initial: true}),
          karma: new fields.BooleanField({initial: true}),
        }),
        tabCombat: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          rangedWeapons: new fields.BooleanField({initial: true}),
          meleeWeapons: new fields.BooleanField({initial: true}),
          grenades: new fields.BooleanField({initial: true}),
          armors: new fields.BooleanField({initial: true}),
          ammunitions: new fields.BooleanField({initial: true}),
          martialArts: new fields.BooleanField({initial: true}),
        }),
        tabGear: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          various: new fields.BooleanField({initial: true}),
          vehicles: new fields.BooleanField({initial: true}),
          money: new fields.BooleanField({initial: true}),
        }),
        tabMagic: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          spells: new fields.BooleanField({initial: true}),
          adeptPowers: new fields.BooleanField({initial: true}),
          summonedSpirits: new fields.BooleanField({initial: true}),
          foci: new fields.BooleanField({initial: true}),
          preparations: new fields.BooleanField({initial: true}),
          rituals: new fields.BooleanField({initial: true}),
          powers: new fields.BooleanField({initial: true}),
          metamagics: new fields.BooleanField({initial: true}),
        }),
        tabMatrix: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          programs: new fields.BooleanField({initial: true}),
          matrixActions: new fields.BooleanField({initial: true}),
        }),
        tabMatrixUser: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          programs: new fields.BooleanField({initial: true}),
          pan: new fields.BooleanField({initial: true}),
          marksControled: new fields.BooleanField({initial: true}),
        }),
        tabSkill: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          actives: new fields.BooleanField({initial: true}),
          groups: new fields.BooleanField({initial: true}),
          knowledge: new fields.BooleanField({initial: true}),
          languages: new fields.BooleanField({initial: true}),
        }),
        tabSocial: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          contacts: new fields.BooleanField({initial: true}),
          lifestyles: new fields.BooleanField({initial: true}),
          sins: new fields.BooleanField({initial: true}),
          reputation: new fields.BooleanField({initial: true}),
        }),
        tabTechno: new fields.SchemaField({
          isActive: new fields.BooleanField({initial: true}),
          resonanceActions: new fields.BooleanField({initial: true}),
          complexForms: new fields.BooleanField({initial: true}),
          sprites: new fields.BooleanField({initial: true}),
          echoes: new fields.BooleanField({initial: true}),
          powers: new fields.BooleanField({initial: true}),
        }),
        selections: new fields.SchemaField({
          activeDefense: new fields.StringField({initial: 'dodge'}),
          resistanceDisease: new fields.StringField({initial: 'contact'}),
          resistanceToxin: new fields.StringField({initial: 'contact'}),
          resistanceSpecialDamage: new fields.StringField({initial: 'acid'}),
        }),
        customLayout: new fields.ObjectField({ initial: {} }),
      }),
    }
  }
}
