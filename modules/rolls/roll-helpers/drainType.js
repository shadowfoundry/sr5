// Tests whose drain turns physical when the spirit's Force exceeds the magician's Magic (SR5 p. 303-304)
const SPIRIT_FORCE_TESTS = ["banishing", "binding"]

// True when the drain type of a previous card depends on the spirit's Force instead of the hits:
// summoning has its own resistance card, binding and banishing are skill tests told apart by typeSub
export function isSpiritForceDrain(chatData) {
  return chatData.test.type === "summoningResistance" || SPIRIT_FORCE_TESTS.includes(chatData.test.typeSub)
}
