import SR5TokenHud from "../interface/tokenHud.js"
import {
  SR5_SpiritTypes
} from "../entities/items/spirit-types.js"
import {
  SR5_SystemHelpers
} from "../system/utilitySystem.js"
import {
  initLinkMatchesTooltip 
} from "../interface/link-matches-tooltip.js"
import {
  sr5DeepenModuleTableOfContents 
} from "../interface/journal-heading-levels.js"

export function sr5HookReady() {
  // Register the GM-authored spirit types, so that they are offered wherever
  // the official ones are, then keep the list in step with the world.
  SR5_SpiritTypes.reload().catch(e => SR5_SystemHelpers.srLog(1, `Spirit types could not be registered: ${e}`))
  for (const hook of ["createItem", "updateItem", "deleteItem"]) {
    Hooks.on(hook, (item) => {
      if (item.type !== "itemSpiritType") return
      SR5_SpiritTypes.reload().catch(e => SR5_SystemHelpers.srLog(1, `Spirit types could not be registered: ${e}`))
    })
  }
  // Deleting or adding a whole compendium fires no item hook, and would
  // otherwise leave a type in the list with nothing behind it.
  for (const hook of ["createCompendium", "deleteCompendium"]) {
    Hooks.on(hook, () => {
      SR5_SpiritTypes.reload().catch(e => SR5_SystemHelpers.srLog(1, `Spirit types could not be registered: ${e}`))
    })
  }

  // Apply UI theme based on setting
  const chosenStyle = game.settings.get("sr5", "sr5ChooseStyle") ?? "SR5"
  const themeClass = chosenStyle === "SR6" ? "sr-theme-sr6" : "sr-theme-sr5"
  document.body.classList.add(themeClass)

  // Translate the headers of the core "link matches" tooltip
  initLinkMatchesTooltip()

  // The deeper table of contents also reaches the window of Monk's Enhanced Journal
  sr5DeepenModuleTableOfContents()

  //game.settings.set("sr5", "systemMigrationVersion", "0.0.1");
  // Determine whether a system migration is required and feasible
  if ( !game.user.isGM ) return
  const currentVersion = game.settings.get("sr5", "systemMigrationVersion")
  const NEEDS_MIGRATION_VERSION = "13.0.0-alpha.22"
  const needsMigration = !currentVersion || foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion) //isNewerVersion(v0, v1)

  // Perform the migration
  if (needsMigration) new game.sr5.migration().migrateWorld()

  //Token hud
  canvas.hud.token = new SR5TokenHud()
}
