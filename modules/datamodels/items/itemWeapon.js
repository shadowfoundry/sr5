import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  effectsPartialModel 
} from './partial/effects.js'
import {
  activationPartialModel 
} from './partial/activation.js'
import {
  concealmentPartialModel 
} from './partial/concealment.js'
import {
  boughtOrSoldPartialModel 
} from './partial/boughtOrSold.js'
import {
  ratingPartialModel 
} from './partial/rating.js'
import {
  wirelessPartialModel 
} from './partial/wireless.js'
import {
  damagePartialModel 
} from './partial/damage.js'
import {
  sr5ModsPartialModel 
} from '../common/mods.js'

export class sr5ItemWeaponDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...concealmentPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      ...wirelessPartialModel.defineSchema(),
      ...damagePartialModel.defineSchema(),
      quantity: new fields.NumberField({
        initial: 1
      }),
      category: new fields.StringField({
        initial: ''
      }),
      type: new fields.StringField({
        initial: ''
      }),
      requiredHands: new fields.NumberField({
        initial: 1
      }),
      range: new fields.SchemaField({
        short: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        medium: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        long: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        extreme: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        isStrengthBased: new fields.BooleanField({
          initial: false
        }),
      }),
      reach: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema()
      }),
      blast: new fields.SchemaField({
        radius: new fields.NumberField({
          initial: 0
        }),
        damageFallOff: new fields.NumberField({
          initial: 0
        }),
      }),
      aerodynamic: new fields.BooleanField({
        initial: false
      }),
      firingMode: new fields.SchemaField({
        singleShot: new fields.BooleanField({
          initial: false
        }),
        semiAutomatic: new fields.BooleanField({
          initial: false
        }),
        burstFire: new fields.BooleanField({
          initial: false
        }),
        fullyAutomatic: new fields.BooleanField({
          initial: false
        }),
        value: new fields.ArrayField(new fields.StringField()),
        current: new fields.StringField({
          initial: ''
        }),
      }),
      choke: new fields.SchemaField({
        current: new fields.StringField({
          initial: ''
        }),
        value: new fields.ArrayField(new fields.StringField()),
      }),
      ammunition: new fields.SchemaField({
        value: new fields.NumberField({
          initial: 0
        }),
        max: new fields.NumberField({
          initial: 0
        }),
        type: new fields.StringField({
          initial: ''
        }),
        casing: new fields.StringField({
          initial: ''
        }),
        rating: new fields.StringField({
          initial: ''
        }),
        clipInserted: new fields.BooleanField({
          initial: true
        }),
      }),
      recoilCompensation: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema()
      }),
      accessory: new fields.ArrayField(new fields.ObjectField()),
      weaponSkill: new fields.SchemaField({
        dicePool: new fields.NumberField({
          initial: 0
        }),
        base: new fields.NumberField({
          initial: 0
        }),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
        specialization: new fields.BooleanField({
          initial: false
        }),
        category: new fields.StringField({
          initial: ''
        }),
      }),
      toxin: new fields.SchemaField({
        type: new fields.StringField({
          initial: ''
        }),
        vector: new fields.SchemaField({
          contact: new fields.BooleanField({
            initial: false
          }),
          ingestion: new fields.BooleanField({
            initial: false
          }),
          inhalation: new fields.BooleanField({
            initial: false
          }),
          injection: new fields.BooleanField({
            initial: false
          }),
        }),
        speed: new fields.StringField({
          initial: ''
        }),
        power: new fields.NumberField({
          initial: 0
        }),
        effect: new fields.SchemaField({
          disorientation: new fields.BooleanField({
            initial: false
          }),
          nausea: new fields.BooleanField({
            initial: false
          }),
          paralysis: new fields.BooleanField({
            initial: false
          }),
          agony: new fields.BooleanField({
            initial: false
          }),
          arcaneInhibitor: new fields.BooleanField({
            initial: false
          }),
        }),
        penetration: new fields.NumberField({
          initial: 0
        }),
        damageType: new fields.StringField({
          nullable: true, initial: null
        }),
      }),
      isLinkedToFocus: new fields.BooleanField({
        initial: false
      }),
      isUsedAsFocus: new fields.BooleanField({
        initial: false
      }),
      isLinkedToMount: new fields.BooleanField({
        initial: false
      }),
      isUsedAsMount: new fields.BooleanField({
        initial: false
      }),
      isMagical: new fields.BooleanField({
        initial: false
      }),
      // Weapon accessory fields (used when category === "weaponAccessory")
      isAccessory: new fields.BooleanField({
        initial: false
      }),
      isPlugged: new fields.BooleanField({
        initial: false
      }),
      weaponAccessory: new fields.SchemaField({
        slot: new fields.StringField({
          initial: ''
        }),
        type: new fields.StringField({
          initial: 'accessory'
        }),
        priceMultiplier: new fields.NumberField({
          initial: 0
        }),
        specialEffect: new fields.StringField({
          initial: ''
        }),
      }),
    }
  }
}
