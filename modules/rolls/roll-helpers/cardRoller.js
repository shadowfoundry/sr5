// Tests whose card buttons are handled by the targeted spirit or sprite (resistance, reduce services or tasks)
const TARGET_HANDLED_TESTS = ["banishing", "binding", "decompileSprite", "registerSprite"]

// Resistances that stay with the card owner even on those cards:
// the drain goes to the magician (SR5 p. 304), the fading to the technomancer (SR5 p. 254)
const OWNER_RESISTANCES = ["drain", "fading"]

// True when a non-opposed button of the card must be rolled by the target instead of the card owner
export function isRolledByTarget(type, typeSub, targetActorId) {
  if (!targetActorId) return false
  if (OWNER_RESISTANCES.includes(type)) return false
  return TARGET_HANDLED_TESTS.includes(typeSub)
}
