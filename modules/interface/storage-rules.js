/**
 * What a character may leave in a storage, and what a garage asks for.
 *
 * Kept free of Foundry globals so the rules can be read — and tested — on
 * their own, away from a running game.
 */

/**
 * What a garage costs and asks for, per vehicle (Run Faster p. 216). A garage
 * is a lifestyle Asset holding a single vehicle, bought again for each one.
 * `level` is the minimum lifestyle rank, as numbered in _handleLifeStyle().
 *
 * It lives here rather than in config.js because that file holds translation
 * tables, which sortTranslations() walks expecting a string behind every key.
 */
export const GARAGE_REQUIREMENTS = {
  motorcycle: {
    lifestyle: 'medium', level: 4, points: 1, cost: 50 
  },
  carLight: {
    lifestyle: 'medium', level: 4, points: 1, cost: 50 
  },
  carHeavy: {
    lifestyle: 'medium', level: 4, points: 2, cost: 100 
  },
  boat: {
    lifestyle: 'high', level: 5, points: 3, cost: 5000 
  },
  plane: {
    lifestyle: 'luxury', level: 6, points: 4, cost: 20000 
  },
  helicopter: {
    lifestyle: 'luxury', level: 6, points: 4, cost: 10000 
  },
}

// Item types a character can leave behind in a storage.
export const STORABLE_TYPES = [
  "itemGear", "itemWeapon", "itemArmor", "itemAmmunition",
  "itemDevice", "itemDrug", "itemFocus", "itemVehicle",
  "itemAugmentation",
]

/**
 * Whether an item can be put away, and whether this storage will take it.
 * A fitted mod follows the item it is on, bare hands and natural weapons are
 * part of the body, an implant has to come out first, and a contract or a
 * licence is not a thing you can leave in a box.
 * A garage holds vehicles and drones; every other storage holds the rest.
 */
export function isStorable(item, storage) {
  const data = item?.system ?? {
  }
  if (!STORABLE_TYPES.includes(item?.type)) return false
  if (data.isAccessory && data.isPlugged) return false
  if (item.type === "itemWeapon" && data.type === "unarmedCombat") return false
  if (item.type === "itemGear" && data.isIntangible) return false
  if (item.type === "itemAugmentation" && data.isActive) return false

  if (!storage) return true
  const isVehicle = item.type === "itemVehicle"
  return storage.system?.type === "garage" ? isVehicle : !isVehicle
}

/**
 * What the rule asks of this garage, from the vehicle it is meant to hold:
 * a minimum lifestyle, a monthly cost and a cost in lifestyle points
 * (Run Faster p. 216). Null when the storage asks nothing.
 */
export function garageRequirement(storage) {
  if (storage?.system?.type !== "garage") return null
  return GARAGE_REQUIREMENTS[storage.system.vehicleType] ?? null
}

/**
 * Whether any of these lifestyle ranks reaches what the garage asks for.
 * Ranks are the numbers _handleLifeStyle() writes on a lifestyle.
 */
export function meetsGarageLifestyle(requirement, lifestyleLevels) {
  if (!requirement) return true
  return lifestyleLevels.some(level => (Number(level) || 0) >= requirement.level)
}
