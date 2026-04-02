import { descriptionPartialModel } from './partial/description.js'
import { effectsPartialModel } from './partial/effects.js'
import { activationPartialModel } from './partial/activation.js'

export class sr5ItemRitualDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...activationPartialModel.defineSchema(),
      ...effectsPartialModel.defineSchema(),
      adeptRitual: new fields.BooleanField({initial: false}),
      anchored: new fields.BooleanField({initial: false}),
      bloody: new fields.BooleanField({initial: false}),
      contractual: new fields.BooleanField({initial: false}),
      manaRitual: new fields.BooleanField({initial: false}),
      materialLink: new fields.BooleanField({initial: false}),
      minion: new fields.BooleanField({initial: false}),
      organicalLink: new fields.BooleanField({initial: false}),
      spell: new fields.BooleanField({initial: false}),
      spotter: new fields.BooleanField({initial: false}),
      durationToPerform: new fields.StringField({initial: ''}),
      duration: new fields.StringField({initial: ''}),
      durationMultiplier: new fields.StringField({initial: ''}),
      durationValue: new fields.NumberField({initial: 0}),
      materialLinked: new fields.StringField({initial: ''}),
      spellChoices: new fields.ArrayField(new fields.ObjectField()),
      spellLinked: new fields.StringField({initial: ''}),
      spellLinkedType: new fields.StringField({initial: ''}),
      spellLinkedName: new fields.StringField({initial: ''}),
      force: new fields.NumberField({initial: 0}),
      hits: new fields.NumberField({initial: 0}),
      netHits: new fields.NumberField({initial: 0}),
    }
  }
}
