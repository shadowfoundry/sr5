import {
  SR5
} from "../../config.js"
import {
  SR5_EntityHelpers
} from "../helpers.js"
import {
  SR5_SystemHelpers
} from "../../system/utilitySystem.js"

/**
 * Registry of GM-authored spirit types (itemSpiritType).
 *
 * The 33 official types are switch cases scattered across the character
 * utility; they are left untouched. A custom type declares an optional
 * `basedOn` official type: the official branch runs first, then the custom
 * values are applied on top. A custom type with no base starts from the
 * generic spirit rules (every attribute at Force, Physical + Stun monitors,
 * +1 physical initiative die, Force x2 and +3 dice in astral).
 *
 * Nothing here belongs in config.js, which only holds translation tables.
 */
export class SR5_SpiritTypes {

  /** @type {Map<string, object>} key -> registered entry */
  static registry = new Map()

  /** Official keys, captured before anything is injected. */
  static _officialKeys = null

  // -------------------------------------------------------------------------
  //  Lookup
  // -------------------------------------------------------------------------

  /**
	 * @param {string} type An actor's system.type
	 * @returns {object|null} The custom type registered under that key, if any.
	 */
  static get(type) {
    if (!type) return null
    return SR5_SpiritTypes.registry.get(type) ?? null
  }

  /**
	 * The key the official switches should be given for this actor type:
	 * the custom type's base when there is one, the type itself otherwise.
	 * @param {string} type
	 * @returns {string}
	 */
  static baseType(type) {
    const custom = SR5_SpiritTypes.get(type)
    if (!custom) return type
    return custom.system.basedOn || ""
  }

  /** Label shown for a type, custom types included. */
  static label(type) {
    const custom = SR5_SpiritTypes.get(type)
    if (custom) return custom.name
    return SR5.spiritTypes[type] ? game.i18n.localize(SR5.spiritTypes[type]) : type
  }

  // -------------------------------------------------------------------------
  //  Registration
  // -------------------------------------------------------------------------

  /**
	 * Rebuild the registry from the world's items and every Item compendium,
	 * then inject the result into the spirit type list so that custom types
	 * are offered everywhere the official ones are.
	 */
  static async refresh() {
    if (!SR5_SpiritTypes._officialKeys) SR5_SpiritTypes._officialKeys = new Set(Object.keys(SR5.spiritTypes))

    const found = new Map()

    for (const item of game.items?.filter(i => i.type === "itemSpiritType") ?? []) {
      SR5_SpiritTypes._add(found, item)
    }

    for (const pack of game.packs.filter(p => p.documentName === "Item")) {
      let index
      try {
        index = await pack.getIndex()
      } catch {
        continue
      }
      const ids = index.filter(e => e.type === "itemSpiritType").map(e => e._id)
      for (const id of ids) {
        const item = await pack.getDocument(id)
        if (item) SR5_SpiritTypes._add(found, item)
      }
    }

    SR5_SpiritTypes.registry = found
    SR5_SpiritTypes._inject()
    return found
  }

  /** Register one item, refusing keys that are taken. */
  static _add(found, item) {
    const key = SR5_SpiritTypes.keyOf(item)
    if (!key) {
      SR5_SystemHelpers.srLog(2, `Spirit type '${item.name}' has no usable key and was ignored`)
      return
    }
    if (SR5_SpiritTypes._officialKeys.has(key)) {
      SR5_SystemHelpers.srLog(2, `Spirit type '${item.name}' uses the official key '${key}' and was ignored`)
      return
    }
    if (found.has(key)) {
      SR5_SystemHelpers.srLog(2, `Spirit type '${item.name}' repeats the key '${key}' and was ignored`)
      return
    }
    found.set(key, item)
  }

  /**
	 * The key an item registers under: its own if it has one, a slug of its
	 * name otherwise, so a type created and never configured still works.
	 */
  static keyOf(item) {
    const own = (item.system?.key ?? "").trim()
    if (own) return own.slugify({
      strict: true
    })
    return (item.name ?? "").slugify({
      strict: true
    })
  }

  /**
	 * Put the registered types into the list, and take away the stale ones.
	 *
	 * A custom type also gets the two power tables the system looks up by name
	 * (spiritBasePowers<key> and spiritOptionalPowers<key>), so that the
	 * compendium lookup and the summoner's optional power picker work on it
	 * without knowing it is custom. Both are plain translation tables.
	 */
  static _inject() {
    for (const key of Object.keys(SR5.spiritTypes)) {
      if (SR5_SpiritTypes._officialKeys.has(key) || SR5_SpiritTypes.registry.has(key)) continue
      delete SR5.spiritTypes[key]
      delete SR5[`spiritBasePowers${key}`]
      delete SR5[`spiritOptionalPowers${key}`]
    }
    for (const [key, item] of SR5_SpiritTypes.registry) {
      SR5.spiritTypes[key] = item.name
      SR5[`spiritBasePowers${key}`] = SR5_SpiritTypes._powerTable("spiritBasePowers", item, item.system.powers)
      SR5[`spiritOptionalPowers${key}`] = SR5_SpiritTypes._powerTable("spiritOptionalPowers", item, item.system.optionalPowers)
    }
    if (CONFIG.SR5) CONFIG.SR5.spiritTypes = SR5.spiritTypes
  }

  /** The base type's powers, plus the ones this type adds. */
  static _powerTable(prefix, item, extra) {
    const table = {
    }
    const base = item.system.basedOn
    if (base && SR5[`${prefix}${base}`]) Object.assign(table, SR5[`${prefix}${base}`])
    for (const power of extra ?? []) table[power] = SR5.AllSpiritPowers[power] ?? power
    return table
  }

  /** Rebuild the registry and let every open sheet catch up. */
  static async reload() {
    await SR5_SpiritTypes.refresh()
    for (const actor of game.actors) {
      actor.reset()
      actor.sheet?.rendered && actor.sheet.render(false)
    }
  }

  // -------------------------------------------------------------------------
  //  What the sheet needs to say
  // -------------------------------------------------------------------------

  /**
	 * Why this type would be refused, so that the sheet can say it instead of
	 * leaving the answer in a log nobody reads.
	 * @returns {string} "empty", "official", "duplicate", or "" when accepted.
	 */
  static conflictFor(item) {
    const key = SR5_SpiritTypes.keyOf(item)
    if (!key) return "empty"
    if (SR5_SpiritTypes._officialKeys?.has(key)) return "official"
    const owner = SR5_SpiritTypes.registry.get(key)
    if (owner && owner.uuid !== item.uuid) return "duplicate"
    return ""
  }

  /**
	 * What a spirit built on this type actually has, at a given Force.
	 *
	 * Built by preparing a throwaway spirit rather than by restating the official
	 * rules a second time: what the preview shows is what the table will roll,
	 * inheritance included. A type that is not registered — a brand new item, or
	 * one whose key is refused — has no preview.
	 */
  static preview(item, force) {
    const key = SR5_SpiritTypes.keyOf(item)
    if (!key || SR5_SpiritTypes.registry.get(key)?.uuid !== item.uuid) return null

    let spirit
    try {
      spirit = new CONFIG.Actor.documentClass({
        name: item.name,
        type: "actorSpirit",
        system: {
          type: key, force: {
            base: force
          }
        },
      })
    } catch (e) {
      SR5_SystemHelpers.srLog(1, `Spirit type preview failed for '${key}': ${e}`)
      return null
    }

    const data = spirit.system
    const attributes = []
    for (const [attribute, label] of Object.entries(SR5.characterAttributes)) {
      const value = data.attributes?.[attribute]?.augmented?.value
      if (value !== undefined) attributes.push({
        label, value
      })
    }

    const skills = []
    for (const [skill, label] of Object.entries(SR5.skills)) {
      const value = data.skills?.[skill]?.rating?.value
      if (value) skills.push({
        label, value
      })
    }

    const powers = Object.keys(SR5[`spiritBasePowers${key}`] ?? {
    })
      .map(p => game.i18n.localize(SR5.AllSpiritPowers[p] ?? p))
      .sort((a, b) => a.localeCompare(b))

    return {
      force,
      attributes,
      skills,
      powers,
      initiativeDice: data.initiatives?.physicalInit?.dice?.value ?? 0,
      astral: data.initiatives?.astralInit?.value ?? 0,
      astralDice: data.initiatives?.astralInit?.dice?.value ?? 0,
      singleMonitor: !data.conditionMonitors?.physical,
    }
  }

  // -------------------------------------------------------------------------
  //  Applying a custom type
  // -------------------------------------------------------------------------

  /**
	 * Apply a custom type's attribute values, after the official branch of
	 * `basedOn` has run. An override replaces the base, a modifier adds to it.
	 */
  static applyAttributes(custom, attributes, label) {
    const values = custom.system.attributes ?? {
    }
    for (const [key, value] of Object.entries(values)) {
      if (!attributes[key]) continue
      if (value.override !== null && value.override !== undefined) attributes[key].natural.base = value.override
      if (value.modifier) SR5_EntityHelpers.updateModifier(attributes[key].natural, label, "spiritType", value.modifier)
    }
  }

  /**
	 * Apply a custom type's skills. Astral Combat, Assensing and Perception
	 * are handled by the caller; this adds the type's own list.
	 */
  static applySkills(custom, skills, force) {
    for (const key of custom.system.skills ?? []) {
      if (skills[key]) skills[key].rating.base = force
    }
    for (const key of custom.system.halfSkills ?? []) {
      if (skills[key]) skills[key].rating.base = Math.ceil(force / 2)
    }
  }

  /** "full", "half", or "" when the base type's own choice should stand. */
  static baseSkillsRatio(custom) {
    return custom.system.baseSkillsRatio || ""
  }

  /** Physical initiative dice bonus, or null to keep the base type's. */
  static physicalDice(custom) {
    return custom.system.initiative?.physicalDice ?? null
  }

  /** Astral initiative dice bonus, or null to keep the base type's. */
  static astralDice(custom) {
    return custom.system.initiative?.astralDice ?? null
  }

  /** Flat bonus added to astral initiative. */
  static astralBonus(custom) {
    return custom.system.initiative?.astralBonus ?? 0
  }

  /** "standard", "single", or "" to keep the base type's monitors. */
  static conditionMonitor(custom) {
    return custom.system.conditionMonitor || ""
  }

  // -------------------------------------------------------------------------
  //  Power list
  // -------------------------------------------------------------------------

  /**
	 * Every spirit power key the system knows. Used to fill the pickers on the
	 * type's sheet.
	 * @returns {object} key -> translation key
	 */
  static allPowers() {
    return SR5.AllSpiritPowers ?? {
    }
  }
}
