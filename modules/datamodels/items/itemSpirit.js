import {
  ratingPartialModel 
} from './partial/rating.js'
import {
  activationPartialModel 
} from './partial/activation.js'
import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  sr5ModsPartialModel 
} from '../common/mods.js'

export class sr5ItemSpiritDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...ratingPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...descriptionPartialModel.defineSchema(),
      type: new fields.StringField({
        initial: ''
      }),
      services: new fields.SchemaField({
        value: new fields.NumberField({
          initial: 0
        }),
        max: new fields.NumberField({
          initial: 0
        }),
      }),
      isBounded: new fields.BooleanField({
        initial: false
      }),
      magic: new fields.SchemaField({
        tradition: new fields.StringField({
          initial: ''
        }),
        magicType: new fields.StringField({
          initial: 'spirit'
        }),
        drainResistance: new fields.SchemaField({
          dicePool: new fields.NumberField({
            initial: 0
          }),
          base: new fields.NumberField({
            initial: 0
          }),
          modifiers: new fields.ArrayField(new fields.ObjectField()),
          linkedAttribute: new fields.StringField({
            initial: ''
          }),
        }),
      }),
      summonerMagic: new fields.NumberField({
        initial: 0
      }),
      isCreated: new fields.BooleanField({
        initial: false
      }),
      attributes: new fields.SchemaField({
        body: new fields.NumberField({
          initial: 0
        }),
        agility: new fields.NumberField({
          initial: 0
        }),
        reaction: new fields.NumberField({
          initial: 0
        }),
        strength: new fields.NumberField({
          initial: 0
        }),
        willpower: new fields.NumberField({
          initial: 0
        }),
        logic: new fields.NumberField({
          initial: 0
        }),
        intuition: new fields.NumberField({
          initial: 0
        }),
        charisma: new fields.NumberField({
          initial: 0
        }),
        essence: new fields.NumberField({
          initial: 0
        }),
        magic: new fields.NumberField({
          initial: 0
        }),
      }),
      skill: new fields.ArrayField(new fields.ObjectField()),
      optionalPowers: new fields.SchemaField({
        power1: new fields.StringField({
          initial: ''
        }),
        power2: new fields.StringField({
          initial: ''
        }),
        power3: new fields.StringField({
          initial: ''
        }),
        power4: new fields.StringField({
          initial: ''
        }),
        power5: new fields.StringField({
          initial: ''
        }),
      }),
      powers: new fields.ArrayField(new fields.ObjectField()),
      conditionMonitors: new fields.SchemaField({
        physical: new fields.SchemaField({
          actual: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          })
        }),
        stun: new fields.SchemaField({
          actual: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema()
          })
        }),
      }),
      sustainedSpell: new fields.ArrayField(new fields.ObjectField()),
      conjurer: new fields.StringField({
        initial: ''
      }),
      spellType: new fields.StringField({
        initial: ''
      }),
    }
  }
}
