import SR5TokenHud from "../interface/tokenHud.js"
import {
  SR5_CompendiumUtility
} from "../entities/actors/utilityCompendium.js"
import {
  initLinkMatchesTooltip 
} from "../interface/link-matches-tooltip.js"
import {
  sr5DeepenModuleTableOfContents 
} from "../interface/journal-heading-levels.js"

export function sr5HookReady() {
  // Apply UI theme based on setting
  const chosenStyle = game.settings.get("sr5", "sr5ChooseStyle") ?? "SR5"
  const themeClass = chosenStyle === "SR6" ? "sr-theme-sr6" : "sr-theme-sr5"
  document.body.classList.add(themeClass)

  // Compendium choices for the base items settings
  SR5_CompendiumUtility.refreshCompendiumChoices()
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
