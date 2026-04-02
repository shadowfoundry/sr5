import {
  SR5_EffectArea
} from "../system/effectArea.js"

export function sr5HookCanvasReady(data) {
  for (let token of data.tokens.placeables.filter(t => t.isOwner)){
    if (token.document.actorLink && (token.scene.flags.sr5?.backgroundCountValue !== 0)){
      token.document.actor.prepareData()
    }
  }
}

export async function sr5HookDrawMeasuredTemplate(template) {
  if ( !game.user.isGM ) return
  await SR5_EffectArea.initiateTemplateEffect(template)
}

export async function sr5HookDeleteMeasuredTemplate(templateDocument) {
  if ( !game.user.isGM ) return
  await SR5_EffectArea.removeTemplateEffect(templateDocument)
}

export async function sr5HookUpdateMeasuredTemplate(templateDocument) {
  if ( !game.user.isGM ) return
  await SR5_EffectArea.checkUpdatedTemplateEffect(templateDocument)
}

export async function sr5HookUpdateScene(data) {
  //relaunch prepare Data of all actor when a scene is modified, so background count and other effect are correctly applied without needing to manualy refresh an actor
  if (!game.user.isGM) return
  for (let token of data.tokens){
    token.actor.prepareData()
    if (token.actor.sheet.rendered) token.actor.sheet.render()
  }
}
