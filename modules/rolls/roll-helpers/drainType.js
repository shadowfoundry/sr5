// Tests whose drain turns physical when the spirit's Force exceeds the magician's Magic (SR5 p. 303-304)
const SPIRIT_FORCE_TESTS = ["banishing", "binding"]

// Drain damage type resisted from a previous card: the spirit's Force for summoning, binding and banishing,
// the hits of the test for every other card, compared to the magician's Magic
export function getDrainTypeFromCard(chatData, magic) {
  let compared = chatData.roll.hits
  if (chatData.test.type === "summoningResistance" || SPIRIT_FORCE_TESTS.includes(chatData.test.typeSub)) compared = chatData.magic.force
  return compared > magic ? "physical" : "stun"
}
