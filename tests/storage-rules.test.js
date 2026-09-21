import {
  describe, it, expect
} from 'vitest'
import {
  SR5
} from '../modules/config.js'
import {
  STORABLE_TYPES, isStorable, garageRequirement, meetsGarageLifestyle,
} from '../modules/interface/storage-rules.js'

const item = (type, system = {
}) => ({
  type, system
})
const storage = (type, vehicleType = '') => ({
  system: {
    type, vehicleType
  }
})

const stash = storage('stash')
const garage = storage('garage', 'carLight')

describe('isStorable', () => {
  it('takes ordinary gear into a stash', () => {
    expect(isStorable(item('itemGear'), stash)).toBe(true)
    expect(isStorable(item('itemWeapon', {
      type: 'pistol'
    }), stash)).toBe(true)
    expect(isStorable(item('itemArmor'), stash)).toBe(true)
  })

  it('refuses what is not gear at all', () => {
    for (const type of ['itemSin', 'itemLifestyle', 'itemProgram', 'itemComplexForm', 'itemSpell']) {
      expect(isStorable(item(type), stash), type).toBe(false)
    }
  })

  it('refuses bare hands and natural weapons, which are part of the body', () => {
    expect(isStorable(item('itemWeapon', {
      type: 'unarmedCombat'
    }), stash)).toBe(false)
  })

  it('refuses a mod while it is fitted, and takes it once removed', () => {
    const fitted = {
      isAccessory: true, isPlugged: true
    }
    const loose = {
      isAccessory: true, isPlugged: false
    }
    expect(isStorable(item('itemWeapon', fitted), stash)).toBe(false)
    expect(isStorable(item('itemWeapon', loose), stash)).toBe(true)
  })

  it('refuses an implant until it comes out', () => {
    expect(isStorable(item('itemAugmentation', {
      isActive: true
    }), stash)).toBe(false)
    expect(isStorable(item('itemAugmentation', {
      isActive: false
    }), stash)).toBe(true)
  })

  it('refuses property that is not a thing: a contract, a licence', () => {
    expect(isStorable(item('itemGear', {
      isIntangible: true
    }), stash)).toBe(false)
  })

  it('sends vehicles to a garage and everything else elsewhere', () => {
    expect(isStorable(item('itemVehicle'), garage)).toBe(true)
    expect(isStorable(item('itemVehicle'), stash)).toBe(false)
    expect(isStorable(item('itemGear'), garage)).toBe(false)
  })

  it('answers for the item alone when no storage is named', () => {
    expect(isStorable(item('itemVehicle'), null)).toBe(true)
    expect(isStorable(item('itemSin'), null)).toBe(false)
  })

  it('lists only types that exist', () => {
    for (const type of STORABLE_TYPES) {
      expect(SR5.itemTypes[type], type).toBeTruthy()
    }
  })
})

describe('the garage rule (Run Faster p. 216)', () => {
  it('asks nothing of a storage that is not a garage', () => {
    expect(garageRequirement(stash)).toBe(null)
  })

  it('asks nothing of a garage with no vehicle named yet', () => {
    expect(garageRequirement(storage('garage', ''))).toBe(null)
  })

  it('carries the printed cost and minimum lifestyle for each vehicle', () => {
    const table = {
      motorcycle: {
        lifestyle: 'medium', points: 1, cost: 50
      },
      carLight: {
        lifestyle: 'medium', points: 1, cost: 50
      },
      carHeavy: {
        lifestyle: 'medium', points: 2, cost: 100
      },
      boat: {
        lifestyle: 'high', points: 3, cost: 5000
      },
      plane: {
        lifestyle: 'luxury', points: 4, cost: 20000
      },
      helicopter: {
        lifestyle: 'luxury', points: 4, cost: 10000
      },
    }
    for (const [vehicle, printed] of Object.entries(table)) {
      const rule = garageRequirement(storage('garage', vehicle))
      expect(rule, vehicle).toBeTruthy()
      expect(rule.lifestyle, vehicle).toBe(printed.lifestyle)
      expect(rule.points, vehicle).toBe(printed.points)
      expect(rule.cost, vehicle).toBe(printed.cost)
    }
  })

  it('names a vehicle category the rest of the system knows', () => {
    for (const vehicle of Object.keys(SR5.storageGarageRequirements)) {
      expect(SR5.storageVehicleTypes[vehicle], vehicle).toBeTruthy()
    }
  })

  it('names a lifestyle the rest of the system knows', () => {
    for (const rule of Object.values(SR5.storageGarageRequirements)) {
      expect(SR5.lifestyleTypes[rule.lifestyle], rule.lifestyle).toBeTruthy()
    }
  })
})

describe('meetsGarageLifestyle', () => {
  // Ranks as _handleLifeStyle() writes them: squatter 2, low 3, medium 4,
  // high 5, luxury 6, commercial 7.
  const car = garageRequirement(storage('garage', 'carLight'))
  const boat = garageRequirement(storage('garage', 'boat'))
  const helicopter = garageRequirement(storage('garage', 'helicopter'))

  it('lets a Medium lifestyle park a car but not a boat or a helicopter', () => {
    expect(meetsGarageLifestyle(car, [4])).toBe(true)
    expect(meetsGarageLifestyle(boat, [4])).toBe(false)
    expect(meetsGarageLifestyle(helicopter, [4])).toBe(false)
  })

  it('turns a Low lifestyle away from any garage', () => {
    expect(meetsGarageLifestyle(car, [3])).toBe(false)
  })

  it('lets a Luxury lifestyle park anything', () => {
    for (const rule of [car, boat, helicopter]) {
      expect(meetsGarageLifestyle(rule, [6])).toBe(true)
    }
  })

  it('keeps the best lifestyle when the character has several', () => {
    expect(meetsGarageLifestyle(boat, [2, 5, 3])).toBe(true)
    expect(meetsGarageLifestyle(helicopter, [2, 5, 3])).toBe(false)
  })

  it('turns away a character with no lifestyle at all', () => {
    expect(meetsGarageLifestyle(car, [])).toBe(false)
  })

  it('asks nothing when the garage asks nothing', () => {
    expect(meetsGarageLifestyle(null, [])).toBe(true)
  })
})
