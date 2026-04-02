import { matrixPartialModel } from './partial/matrix.js'
import { penaltiesPartialModel } from './partial/penalties.js'
import { visionPartialModel } from './partial/vision.js'
import { specialPropertiesPartialModel } from './partial/specialProperties.js'
import { itemsPropertiesPartialModel } from './partial/itemsProperties.js'
import { sr5ModsPartialModel } from '../common/mods.js'

export class sr5ActorDeviceDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    return {
      matrix: new fields.SchemaField({
        ...matrixPartialModel.matrixFields(),
        ice: new fields.SchemaField({
          attackDicepool: new fields.NumberField({initial: 0}),
          defenseFirstAttribute: new fields.StringField({initial: ''}),
          defenseSecondAttribute: new fields.StringField({initial: ''}),
        }),
      }),
      ...penaltiesPartialModel.defineSchema(),
      ...visionPartialModel.defineSchema(),
      ...specialPropertiesPartialModel.defineSchema(),
      ...itemsPropertiesPartialModel.defineSchema(),
      isDirectlyConnected: new fields.BooleanField({initial: false}),
      conditionMonitors: new fields.SchemaField({
        matrix: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({...sr5ModsPartialModel.defineSchema()}),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
      }),
      statusBars: new fields.SchemaField({
        matrix: new fields.SchemaField({
          value: new fields.NumberField({initial: 0}),
          max: new fields.NumberField({initial: 0}),
        }),
      }),
      initiatives: new fields.SchemaField({
        matrixInit: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          dice: new fields.SchemaField({
            value: new fields.NumberField({initial: 0}),
            base: new fields.NumberField({initial: 0}),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
          isActive: new fields.BooleanField({initial: true}),
        }),
      }),
      maglock: new fields.SchemaField({
        hasAntiTamper: new fields.BooleanField({initial: false}),
        antiTamperRating: new fields.NumberField({initial: 0}),
        caseRemoved: new fields.BooleanField({initial: false}),
        type: new fields.SchemaField({
          cardReader: new fields.BooleanField({initial: false}),
          keyPads: new fields.BooleanField({initial: false}),
          facialRecognition: new fields.BooleanField({initial: false}),
          voiceRecognition: new fields.BooleanField({initial: false}),
          printScanner: new fields.BooleanField({initial: false}),
          dnaScanner: new fields.BooleanField({initial: false}),
        }),
      }),
      description: new fields.StringField({initial: ''}),
    }
  }
}
