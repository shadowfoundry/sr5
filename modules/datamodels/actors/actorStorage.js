/**
 * A storage a character has put down: a pack dropped in an alley, a crate
 * left behind. It carries what was inside it, and the way back to the item
 * and the character it came from.
 */
import {
  sheetPreferencesPartialModel 
} from './partial/sheetPreferences.js'

export class sr5ActorStorageDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...sheetPreferencesPartialModel.defineSchema(),
      // Kind of storage, from SR5.storageTypes
      type: new fields.StringField({
        initial: ''
      }),
      capacity: new fields.SchemaField({
        value: new fields.NumberField({
          initial: 0
        }),
        used: new fields.NumberField({
          initial: 0
        }),
      }),
      // Shaped like the other actors so the shared Description block binds
      biography: new fields.SchemaField({
        description: new fields.StringField({
          initial: ''
        }),
      }),
      // Way back to the character who put it down, and to the item it is
      creatorId: new fields.StringField({
        initial: ''
      }),
      creatorItemId: new fields.StringField({
        initial: ''
      }),
      sideKickPrototypeToken: new fields.ObjectField(),
    }
  }
}
