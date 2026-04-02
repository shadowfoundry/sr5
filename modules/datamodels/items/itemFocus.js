import { descriptionPartialModel } from './partial/description.js'
import { effectsPartialModel } from './partial/effects.js'
import { boughtOrSoldPartialModel } from './partial/boughtOrSold.js'
import { activationPartialModel } from './partial/activation.js'
import { ratingPartialModel } from './partial/rating.js'

export class sr5ItemFocusDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...ratingPartialModel.defineSchema(),
      type: new fields.StringField({initial: ''}),
      subType: new fields.StringField({initial: ''}),
      spellChoices: new fields.ArrayField(new fields.ObjectField()),
      weaponChoices: new fields.ArrayField(new fields.ObjectField()),
      sustainedSpell: new fields.StringField({initial: ''}),
      linkedWeapon: new fields.StringField({initial: ''}),
      linkedWeaponName: new fields.StringField({initial: ''}),
      linkedAdeptPower: new fields.StringField({initial: ''}),
      linkedAdeptPowerName: new fields.StringField({initial: ''}),
    }
  }
}
