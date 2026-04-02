import {
  matrixPartialModel 
} from './partial/matrix.js'
import {
  recoilPartialModel 
} from './partial/recoil.js'
import {
  visionPartialModel 
} from './partial/vision.js'
import {
  itemsPropertiesPartialModel 
} from './partial/itemsProperties.js'
import {
  specialPropertiesPartialModel 
} from './partial/specialProperties.js'
import {
  penaltiesPartialModel 
} from './partial/penalties.js'
import {
  sr5ModsPartialModel 
} from '../common/mods.js'

export class sr5ActorDroneDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const attrSchema = () => new fields.SchemaField({
      natural: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema() 
      }),
      augmented: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema() 
      }),
    })

    const dicePoolSchema = () => new fields.SchemaField({
      dicePool: new fields.NumberField({
        initial: 0
      }),
      base: new fields.NumberField({
        initial: 0
      }),
      modifiers: new fields.ArrayField(new fields.ObjectField()),
    })

    return {
      ...matrixPartialModel.defineSchema(),
      ...recoilPartialModel.defineSchema(),
      ...visionPartialModel.defineSchema(),
      ...itemsPropertiesPartialModel.defineSchema(),
      ...specialPropertiesPartialModel.defineSchema(),
      ...penaltiesPartialModel.defineSchema(),
      attributes: new fields.SchemaField({
        handling: attrSchema(),
        handlingOffRoad: attrSchema(),
        secondaryPropulsionHandling: attrSchema(),
        secondaryPropulsionHandlingOffRoad: attrSchema(),
        speed: attrSchema(),
        speedOffRoad: attrSchema(),
        secondaryPropulsionSpeed: attrSchema(),
        acceleration: attrSchema(),
        accelerationOffRoad: attrSchema(),
        secondaryPropulsionAcceleration: attrSchema(),
        body: attrSchema(),
        armor: attrSchema(),
        pilot: attrSchema(),
        sensor: attrSchema(),
        seating: attrSchema(),
      }),
      conditionMonitors: new fields.SchemaField({
        condition: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema() 
          }),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
        matrix: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          actual: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema() 
          }),
          boxes: new fields.ArrayField(new fields.ObjectField()),
        }),
      }),
      statusBars: new fields.SchemaField({
        condition: new fields.SchemaField({
          value: new fields.NumberField({
            initial: 0
          }), max: new fields.NumberField({
            initial: 0
          }) 
        }),
        matrix: new fields.SchemaField({
          value: new fields.NumberField({
            initial: 0
          }), max: new fields.NumberField({
            initial: 0
          }) 
        }),
      }),
      defenses: new fields.SchemaField({
        defend: new fields.SchemaField({
          dicePool: new fields.NumberField({
            initial: 0
          }),
          base: new fields.NumberField({
            initial: 0
          }),
          modifiers: new fields.ArrayField(new fields.ObjectField()),
          limit: new fields.SchemaField({
            base: new fields.StringField({
              initial: ''
            }),
            value: new fields.NumberField({
              initial: 0
            }),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
        }),
        ramming: new fields.SchemaField({
          dicePool: new fields.NumberField({
            initial: 0
          }),
          base: new fields.NumberField({
            initial: 0
          }),
          modifiers: new fields.ArrayField(new fields.ObjectField()),
          limit: new fields.SchemaField({
            base: new fields.StringField({
              initial: 'handling'
            }),
            value: new fields.NumberField({
              initial: 0
            }),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
        }),
      }),
      resistances: new fields.SchemaField({
        physicalDamage: dicePoolSchema(),
        crashDamage: dicePoolSchema(),
        directSpellPhysical: dicePoolSchema(),
        specialDamage: new fields.SchemaField({
          acid: dicePoolSchema(),
          water: dicePoolSchema(),
          electricity: dicePoolSchema(),
          fire: dicePoolSchema(),
          cold: dicePoolSchema(),
          pollution: dicePoolSchema(),
          radiation: dicePoolSchema(),
          toxin: dicePoolSchema(),
          sound: dicePoolSchema(),
        }),
      }),
      skills: new fields.SchemaField({
        perception: new fields.SchemaField({
          rating: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema() 
          }),
          test: dicePoolSchema(),
          linkedAttribute: new fields.StringField({
            initial: 'pilot'
          }),
          limit: new fields.SchemaField({
            value: new fields.NumberField({
              initial: 0
            }), base: new fields.StringField({
              initial: 'sensor'
            }), modifiers: new fields.ArrayField(new fields.ObjectField()) 
          }),
          skillGroup: new fields.StringField({
            initial: ''
          }),
          category: new fields.StringField({
            initial: 'physicalSkills'
          }),
          canDefault: new fields.BooleanField({
            initial: true
          }),
          specializations: new fields.StringField({
            initial: ''
          }),
          perceptionType: new fields.SchemaField({
            sight: new fields.SchemaField({
              test: dicePoolSchema(),
              limit: new fields.SchemaField({
                value: new fields.NumberField({
                  initial: 0
                }), base: new fields.StringField({
                  initial: 'mentalLimit'
                }), modifiers: new fields.ArrayField(new fields.ObjectField()) 
              }),
            }),
            hearing: new fields.SchemaField({
              test: dicePoolSchema(),
              limit: new fields.SchemaField({
                value: new fields.NumberField({
                  initial: 0
                }), base: new fields.StringField({
                  initial: 'mentalLimit'
                }), modifiers: new fields.ArrayField(new fields.ObjectField()) 
              }),
            }),
            smell: new fields.SchemaField({
              test: dicePoolSchema(),
              limit: new fields.SchemaField({
                value: new fields.NumberField({
                  initial: 0
                }), base: new fields.StringField({
                  initial: 'mentalLimit'
                }), modifiers: new fields.ArrayField(new fields.ObjectField()) 
              }),
            }),
            touch: new fields.SchemaField({
              test: dicePoolSchema(),
              limit: new fields.SchemaField({
                value: new fields.NumberField({
                  initial: 0
                }), base: new fields.StringField({
                  initial: 'mentalLimit'
                }), modifiers: new fields.ArrayField(new fields.ObjectField()) 
              }),
            }),
            taste: new fields.SchemaField({
              test: dicePoolSchema(),
              limit: new fields.SchemaField({
                value: new fields.NumberField({
                  initial: 0
                }), base: new fields.StringField({
                  initial: 'mentalLimit'
                }), modifiers: new fields.ArrayField(new fields.ObjectField()) 
              }),
            }),
          }),
        }),
        sneaking: new fields.SchemaField({
          rating: new fields.SchemaField({
            ...sr5ModsPartialModel.defineSchema() 
          }),
          test: dicePoolSchema(),
          linkedAttribute: new fields.StringField({
            initial: 'pilot'
          }),
          limit: new fields.SchemaField({
            value: new fields.NumberField({
              initial: 0
            }), base: new fields.StringField({
              initial: 'handling'
            }), modifiers: new fields.ArrayField(new fields.ObjectField()) 
          }),
          skillGroup: new fields.StringField({
            initial: ''
          }),
          category: new fields.StringField({
            initial: 'physicalSkills'
          }),
          canDefault: new fields.BooleanField({
            initial: true
          }),
          specializations: new fields.StringField({
            initial: ''
          }),
        }),
      }),
      initiatives: new fields.SchemaField({
        physicalInit: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema(),
          dice: new fields.SchemaField({
            value: new fields.NumberField({
              initial: 0
            }),
            base: new fields.NumberField({
              initial: 1
            }),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
          }),
          isActive: new fields.BooleanField({
            initial: false
          }),
        }),
      }),
      controlMode: new fields.StringField({
        initial: 'autopilot'
      }),
      vehicleOwner: new fields.SchemaField({
        id: new fields.StringField({
          initial: ''
        }),
        name: new fields.StringField({
          initial: ''
        }),
        system: new fields.ObjectField(),
        items: new fields.ArrayField(new fields.ObjectField()),
      }),
      pilotSkill: new fields.StringField({
        initial: ''
      }),
      offRoadMode: new fields.BooleanField({
        initial: false
      }),
      isSecondaryPropulsion: new fields.BooleanField({
        initial: false
      }),
      secondaryPropulsionType: new fields.StringField({
        initial: ''
      }),
      isSecondaryPropulsionActivate: new fields.BooleanField({
        initial: false
      }),
      riggerInterface: new fields.BooleanField({
        initial: false
      }),
      slaved: new fields.BooleanField({
        initial: false
      }),
      type: new fields.StringField({
        initial: ''
      }),
      price: new fields.NumberField({
        initial: 0
      }),
      vehiclesMod: new fields.ArrayField(new fields.ObjectField()),
      modificationSlots: new fields.SchemaField({
        powerTrain: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema() 
        }),
        protection: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema() 
        }),
        weapons: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema() 
        }),
        body: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema() 
        }),
        electromagnetic: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema() 
        }),
        cosmetic: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema() 
        }),
        extraWeapons: new fields.NumberField({
          initial: 0
        }),
        extraBody: new fields.NumberField({
          initial: 0
        }),
      }),
      model: new fields.StringField({
        initial: ''
      }),
      vehicleTest: new fields.SchemaField({
        actionType: new fields.StringField({
          initial: 'complex'
        }),
        limit: new fields.SchemaField({
          base: new fields.NumberField({
            initial: 0
          }),
          value: new fields.NumberField({
            initial: 0
          }),
          modifiers: new fields.ArrayField(new fields.ObjectField()),
          linkedAttribute: new fields.StringField({
            initial: 'handling'
          }),
        }),
        test: dicePoolSchema(),
      }),
      rammingTest: new fields.SchemaField({
        actionType: new fields.StringField({
          initial: 'complex'
        }),
        limit: new fields.SchemaField({
          base: new fields.NumberField({
            initial: 0
          }),
          value: new fields.NumberField({
            initial: 0
          }),
          modifiers: new fields.ArrayField(new fields.ObjectField()),
          linkedAttribute: new fields.StringField({
            initial: 'handling'
          }),
        }),
        test: dicePoolSchema(),
      }),
      passiveTargeting: new fields.BooleanField({
        initial: false
      }),
      creatorId: new fields.StringField({
        initial: ''
      }),
      creatorItemId: new fields.StringField({
        initial: ''
      }),
    }
  }
}
