// Import hook handlers
import {
  sr5HookInit 
} from './hooks/init.js'
import {
  sr5HookReady 
} from './hooks/ready.js'
import {
  sr5HookHotbarDrop 
} from './hooks/hotbar-drop.js'
import {
  sr5HookRenderChatMessageHTML, sr5HookRenderChatLog 
} from './hooks/render-chat-message.js'
import {
  sr5HookRenderPlayers,
  sr5HookRenderFolderConfig,
  sr5HookRenderDialog,
  sr5HookRenderDialogV2,
  sr5HookRenderSettingsConfig,
  sr5HookRenderControlsConfig,
  sr5HookRenderDocumentOwnershipConfig,
  sr5HookRenderDocumentSheetConfig,
  sr5HookRenderWorldConfig,
  sr5HookRenderCombatTrackerConfig,
  sr5HookRenderMacroConfig,
} from './hooks/render-ui.js'
import {
  sr5HookCreateToken, sr5HookUpdateToken, sr5HookPreDeleteToken 
} from './hooks/token.js'
import {
  sr5HookCanvasInit,
  sr5HookDeleteCombatCumulativeDefense,
  sr5HookCreateCombatant,
  sr5HookUpdateCombatant,
  sr5HookDeleteCombatActions,
  sr5HookCloseCombatantConfig,
} from './hooks/combat.js'
import {
  sr5HookCreateActor, sr5HookUpdateActor, sr5HookDeleteActor 
} from './hooks/actor.js'
import {
  sr5HookPreUpdateItem, sr5HookUpdateItem, sr5HookDeleteItem
} from './hooks/item.js'
import {
  sr5HookDeleteActiveEffect, sr5HookCreateActiveEffect 
} from './hooks/active-effect.js'
import {
  sr5HookCanvasReady, sr5HookDrawMeasuredTemplate, sr5HookDeleteMeasuredTemplate, sr5HookUpdateMeasuredTemplate, sr5HookUpdateScene 
} from './hooks/canvas.js'
import {
  sr5HookRenderCompendium, sr5HookRenderCompendiumDirectory 
} from './hooks/compendium.js'

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

// Register all hooks
Hooks.once('init', sr5HookInit)
Hooks.once('ready', sr5HookReady)
Hooks.once('canvasReady', sr5HookCanvasReady)
Hooks.once('renderChatLog', sr5HookRenderChatLog)

Hooks.on('hotbarDrop', sr5HookHotbarDrop)
Hooks.on('renderPlayers', sr5HookRenderPlayers)
Hooks.on('renderChatMessageHTML', sr5HookRenderChatMessageHTML)
Hooks.on('renderFolderConfig', sr5HookRenderFolderConfig)
Hooks.on('renderDialog', sr5HookRenderDialog)
Hooks.on('renderDialogV2', sr5HookRenderDialogV2)
Hooks.on('renderSettingsConfig', sr5HookRenderSettingsConfig)
Hooks.on('renderControlsConfig', sr5HookRenderControlsConfig)
Hooks.on('renderDocumentOwnershipConfig', sr5HookRenderDocumentOwnershipConfig)
Hooks.on('renderDocumentSheetConfig', sr5HookRenderDocumentSheetConfig)
Hooks.on('renderWorldConfig', sr5HookRenderWorldConfig)
Hooks.on('renderCombatTrackerConfig', sr5HookRenderCombatTrackerConfig)
Hooks.on('renderMacroConfig', sr5HookRenderMacroConfig)
Hooks.on('canvasInit', sr5HookCanvasInit)
Hooks.on('createToken', sr5HookCreateToken)
Hooks.on('updateToken', sr5HookUpdateToken)
Hooks.on('preDeleteToken', sr5HookPreDeleteToken)
Hooks.on('createCombatant', sr5HookCreateCombatant)
Hooks.on('updateCombatant', sr5HookUpdateCombatant)
Hooks.on('deleteCombat', sr5HookDeleteCombatCumulativeDefense)
Hooks.on('deleteCombat', sr5HookDeleteCombatActions)
Hooks.on('closeCombatantConfig', sr5HookCloseCombatantConfig)
Hooks.on('preUpdateItem', sr5HookPreUpdateItem)
Hooks.on('updateItem', sr5HookUpdateItem)
Hooks.on('deleteItem', sr5HookDeleteItem)
Hooks.on('createActor', sr5HookCreateActor)
Hooks.on('updateActor', sr5HookUpdateActor)
Hooks.on('deleteActor', sr5HookDeleteActor)
Hooks.on('createActiveEffect', sr5HookCreateActiveEffect)
Hooks.on('deleteActiveEffect', sr5HookDeleteActiveEffect)
Hooks.on('renderCompendium', sr5HookRenderCompendium)
Hooks.on('renderCompendiumDirectory', sr5HookRenderCompendiumDirectory)
Hooks.on('drawMeasuredTemplate', sr5HookDrawMeasuredTemplate)
Hooks.on('deleteMeasuredTemplate', sr5HookDeleteMeasuredTemplate)
Hooks.on('updateMeasuredTemplate', sr5HookUpdateMeasuredTemplate)
Hooks.on('updateScene', sr5HookUpdateScene)
