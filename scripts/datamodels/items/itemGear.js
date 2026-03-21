import { descriptionPartialModel } from './partial/description.js'
import { ratingPartialModel } from './partial/rating.js'
import { boughtOrSoldPartialModel } from './partial/boughtOrSold.js'
import { wirelessPartialModel } from './partial/wireless.js'
import { activationPartialModel } from './partial/activation.js'
import { concealmentPartialModel } from './partial/concealment.js'
import { effectsPartialModel } from './partial/effects.js'
import { capacityPartialModel } from './partial/capacity.js'

export class sr5ItemGearDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...wirelessPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...concealmentPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...capacityPartialModel.defineSchema(),
      quantity: new fields.NumberField({initial: 1}),
      charge: new fields.NumberField({initial: 0}),
      isMedkit: new fields.BooleanField({initial: false}),
      isPlugged: new fields.BooleanField({initial: false}),
      accessory: new fields.ArrayField(new fields.ObjectField()),
      canRollTest: new fields.BooleanField({initial: false}),
      // Weapon accessory fields (used when isAccessory && gearCategory === "weaponAccessory")
      gearCategory: new fields.StringField({initial: ''}),
      weaponAccessory: new fields.SchemaField({
        slot: new fields.StringField({initial: ''}),
        type: new fields.StringField({initial: 'accessory'}),
        priceMultiplier: new fields.NumberField({initial: 0}),
      }),
      test: new fields.SchemaField({
        dicePool: new fields.NumberField({initial: 0}),
        base: new fields.NumberField({initial: 0}),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
        type: new fields.StringField({initial: ''}),
      }),
    }
  }
}
