// SR5 p. 178: progressive recoil carries over "from one action phase and combat turn to the next".
// Outside a combat there are no action phases: each shot stands alone and nothing carries over.
export function isRecoilCarriedOver(actor, combat = globalThis.game?.combat){
  if (!combat) return false
  if (actor.isToken) return combat.combatants.some(c => c.tokenId === actor.token?.id)
  return combat.combatants.some(c => c.actorId === actor.id)
}
