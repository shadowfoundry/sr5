import {
  descriptionPartialModel 
} from './partial/description.js'
import {
  boughtOrSoldPartialModel 
} from './partial/boughtOrSold.js'

export class sr5ItemStorageDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      // Kind of storage: stash, safe, backpack, garage...
      type: new fields.StringField({
        initial: ''
      }),
      // How many items fit in. 0 means no limit.
      capacity: new fields.SchemaField({
        value: new fields.NumberField({
          initial: 0
        }),
        used: new fields.NumberField({
          initial: 0
        }),
      }),
      // A garage holds a single vehicle of a given kind (Run Faster p. 216)
      vehicleType: new fields.StringField({
        initial: ''
      }),
      // Lifestyle this storage belongs to, if any
      linkedLifestyle: new fields.StringField({
        initial: ''
      }),
      // Can be dropped on the canvas as its own actor
      isDeployable: new fields.BooleanField({
        initial: false
      }),
      isDeployed: new fields.BooleanField({
        initial: false
      }),
      deployedActorId: new fields.StringField({
        initial: ''
      }),
      streetAddress: new fields.StringField({
        initial: ''
      }),
      city: new fields.StringField({
        initial: ''
      }),
      country: new fields.StringField({
        initial: ''
      }),
    }
  }
}
