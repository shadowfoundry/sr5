import {
  SR5_RollMessage 
} from "../roll-message.js"

export default async function resonanceActionInfo(cardData){
  cardData.previousMessage.hits = cardData.roll.hits
  let testType = cardData.target.hasTarget ? "nonOpposedTest" : "opposedTest"

  switch (cardData.test.typeSub){
    case "compileSprite":
      cardData.chatCard.buttons.compileSpriteResist = SR5_RollMessage.generateChatButton("nonOpposedTest", "compileSpriteResist", game.i18n.localize("SR5.SpriteResistance"), {
        gmAction: true
      })
      break
    case "decompileSprite":
      cardData.chatCard.buttons.decompilingResistance = SR5_RollMessage.generateChatButton(testType, "decompilingResistance", game.i18n.localize("SR5.SpriteResistance"), {
        gmAction: true
      })
      break
    case "registerSprite":
      cardData.chatCard.buttons.registeringResistance = SR5_RollMessage.generateChatButton(testType, "registeringResistance", game.i18n.localize("SR5.SpriteResistance"), {
        gmAction: true
      })
      break
    case "killComplexForm":
      if (cardData.target.itemUuid) {
        let complexForm = await fromUuid(cardData.target.itemUuid)
        cardData.matrix.fading.value = complexForm.system.fadingValue
        // SR5 p. 254: the fading is physical when the complex form Level exceeds the technomancer's Resonance
        cardData.matrix.fadingLevel = complexForm.system.level
        cardData.chatCard.buttons.fadingResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "fading", `${game.i18n.localize("SR5.ResistFading")} (${cardData.matrix.fading.value})`)

        if (cardData.roll.hits > 0) cardData.chatCard.buttons.killComplexFormResistance = SR5_RollMessage.generateChatButton("nonOpposedTest", "killComplexFormResistance", game.i18n.localize("SR5.ComplexFormResistance"), {
          gmAction: true
        })
      }
      break
    default:
  }
}