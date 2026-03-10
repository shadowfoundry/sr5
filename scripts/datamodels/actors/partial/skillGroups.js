import { sr5ModsPartialModel } from '../../common/mods.js'

export class skillGroupsPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const skillGroupSchema = () => new fields.SchemaField({
      ...sr5ModsPartialModel.defineSchema(),
      isHidden: new fields.BooleanField({initial: false}),
    })

    return {
      skillGroups: new fields.SchemaField({
        actingGroup: skillGroupSchema(),
        athleticsGroup: skillGroupSchema(),
        biotechGroup: skillGroupSchema(),
        closeCombatGroup: skillGroupSchema(),
        conjuringGroup: skillGroupSchema(),
        crackingGroup: skillGroupSchema(),
        electronicsGroup: skillGroupSchema(),
        enchantingGroup: skillGroupSchema(),
        engineeringGroup: skillGroupSchema(),
        firearmsGroup: skillGroupSchema(),
        influenceGroup: skillGroupSchema(),
        outdoorsGroup: skillGroupSchema(),
        sorceryGroup: skillGroupSchema(),
        stealthGroup: skillGroupSchema(),
        taskingGroup: skillGroupSchema(),
      }),
    }
  }
}
