import {
  descriptionPartialModel
} from './partial/description.js'

/**
 * A GM-authored spirit type: everything the hard-coded switches decide for the
 * 33 official types, expressed as data so a table can add its own.
 *
 * Absolute values are nullable: left empty, they are inherited from the type
 * named by `basedOn`, or from the generic spirit defaults when it is empty.
 * Everything else (attribute modifiers, skills, powers) is additive.
 */
export class sr5ItemSpiritTypeDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const attribute = () => new fields.SchemaField({
      modifier: new fields.NumberField({
        initial: 0, integer: true
      }),
      override: new fields.NumberField({
        initial: null, nullable: true, integer: true, min: 0
      }),
    })

    return {
      ...descriptionPartialModel.defineSchema(),
      // Identifier written into an actor's system.type. Stable across worlds.
      key: new fields.StringField({
        initial: '', blank: true
      }),
      // Official spirit type whose rules apply before this one's own values.
      basedOn: new fields.StringField({
        initial: '', blank: true
      }),
      attributes: new fields.SchemaField({
        body: attribute(),
        agility: attribute(),
        reaction: attribute(),
        strength: attribute(),
        willpower: attribute(),
        logic: attribute(),
        intuition: attribute(),
        charisma: attribute(),
      }),
      // Astral Combat, Assensing and Perception, which every spirit gets.
      baseSkillsRatio: new fields.StringField({
        initial: '', blank: true
      }),
      // Skills the type grants, at Force and at half Force.
      skills: new fields.ArrayField(new fields.StringField()),
      halfSkills: new fields.ArrayField(new fields.StringField()),
      initiative: new fields.SchemaField({
        physicalDice: new fields.NumberField({
          initial: null, nullable: true, integer: true, min: 0
        }),
        astralDice: new fields.NumberField({
          initial: null, nullable: true, integer: true, min: 0
        }),
        astralBonus: new fields.NumberField({
          initial: 0, integer: true
        }),
      }),
      // "" inherits, "standard" gives Physical + Stun, "single" a lone monitor.
      conditionMonitor: new fields.StringField({
        initial: '', blank: true
      }),
      powers: new fields.ArrayField(new fields.StringField()),
      optionalPowers: new fields.ArrayField(new fields.StringField()),
    }
  }
}
