import { descriptionPartialModel } from './partial/description.js'
import { boughtOrSoldPartialModel } from './partial/boughtOrSold.js'
import { wirelessPartialModel } from './partial/wireless.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ItemVehicleDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      ...descriptionPartialModel.defineSchema(),
      ...boughtOrSoldPartialModel.defineSchema(),
      ...wirelessPartialModel.defineSchema(),
      type: new fields.StringField({initial: ''}),
      category: new fields.StringField({initial: ''}),
      model: new fields.StringField({initial: ''}),
      attributes: new fields.SchemaField({
        handling: new fields.NumberField({initial: 0}),
        handlingOffRoad: new fields.NumberField({initial: 0}),
        speed: new fields.NumberField({initial: 0}),
        speedOffRoad: new fields.NumberField({initial: 0}),
        acceleration: new fields.NumberField({initial: 0}),
        accelerationOffRoad: new fields.NumberField({initial: 0}),
        body: new fields.NumberField({initial: 0}),
        armor: new fields.NumberField({initial: 0}),
        pilot: new fields.NumberField({initial: 0}),
        sensor: new fields.NumberField({initial: 0}),
      }),
      modificationSlots: new fields.SchemaField({
        powerTrain: new fields.NumberField({initial: 0}),
        protection: new fields.NumberField({initial: 0}),
        weapons: new fields.NumberField({initial: 0}),
        extraWeapons: new fields.NumberField({initial: 0}),
        body: new fields.NumberField({initial: 0}),
        extraBody: new fields.NumberField({initial: 0}),
        electromagnetic: new fields.NumberField({initial: 0}),
        cosmetic: new fields.NumberField({initial: 0}),
      }),
      seating: new fields.NumberField({initial: 0}),
      controlMode: new fields.StringField({initial: 'autopilot'}),
      offRoadMode: new fields.BooleanField({initial: false}),
      riggerInterface: new fields.BooleanField({initial: false}),
      autosoft: new fields.ArrayField(new fields.ObjectField()),
      weapons: new fields.ArrayField(new fields.ObjectField()),
      ammunitions: new fields.ArrayField(new fields.ObjectField()),
      armors: new fields.ArrayField(new fields.ObjectField()),
      decks: new fields.ArrayField(new fields.ObjectField()),
      vehiclesMod: new fields.ArrayField(new fields.ObjectField()),
      secondaryPropulsion: new fields.SchemaField({
        isSecondaryPropulsion: new fields.BooleanField({initial: false}),
        type: new fields.StringField({initial: ''}),
        handling: new fields.NumberField({initial: 0}),
        handlingOffRoad: new fields.NumberField({initial: 0}),
        speed: new fields.NumberField({initial: 0}),
        acceleration: new fields.NumberField({initial: 0}),
      }),
      pilotSkill: new fields.StringField({initial: ''}),
      isCreated: new fields.BooleanField({initial: false}),
      slaved: new fields.BooleanField({initial: false}),
      conditionMonitors: new fields.SchemaField({
        condition: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema(),
          }),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
        matrix: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema(),
          }),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
      }),
    }
  }
}
