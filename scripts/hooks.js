import { SR5 } from "./config.js";
import { SR5_SystemHelpers, SR5_UiModifications } from "./system/utility.js";
import { SR5_EntityHelpers } from "./entities/helpers.js";
import { registerHandlebarsHelpers } from "./handlebars.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { SR5_SocketHandler } from "./socket.js";
import { SR5Actor } from "./entities/actors/entityActor.js";
import { SR5_CharacterUtility } from "./entities/actors/utility.js";
import { SR5ActorSheet } from "./entities/actors/characterSheet.js";
import { SR5SpiritSheet } from "./entities/actors/spiritSheet.js";
import { SR5GruntSheet } from "./entities/actors/gruntSheet.js";
import { SR5DroneSheet } from "./entities/actors/droneSheet.js";
import { SR5AppareilSheet } from "./entities/actors/deviceSheet.js";
import { SR5SpriteSheet } from "./entities/actors/spriteSheet.js";
import { SR5Item } from "./entities/items/entityItem.js";
import { SR5ItemSheet } from "./entities/items/itemSheet.js";
import { SR5_Dice } from "./rolls/dice.js";
import { SR5_RollMessage } from "./rolls/roll-message.js";
import { SR5Combat, _getInitiativeFormula } from "./srcombat.js";
import { SR5CombatTracker } from "./srcombat-tracker.js";
import { checkDependencies } from "./apps/dependencies.js"
import { measureDistances } from "./canvas.js";
import  SR5SceneConfig  from "./interface/sceneConfig.js";
import * as macros from "./interface/macros.js";
import Migration from "./migration.js";

export const registerHooks = function () {
  Hooks.once("init", async function () {
    SR5_SystemHelpers.registerSystemSettings();
    SR5_SystemHelpers.srLogPublic(`Welcome to the Sixth World, chummer!`);
    SR5_SystemHelpers.srLogPublic(`Remember: Never, ever, cut a deal with a dragon!`);

    SR5_SystemHelpers.srLog(2, `Initializing game system`);

    // Create a namespace within the game global
    game.sr5 = {
      config: SR5_EntityHelpers.sortTranslations(SR5),
      entities: {
        SR5Actor,
        SR5Item,
      },
      migration: Migration,
      macros: macros,
      rollItemMacro: macros.rollItemMacro,
    };

    // Record Configuration Values
    CONFIG.SR5 = SR5_EntityHelpers.sortTranslations(SR5);
    CONFIG.Actor.documentClass = SR5Actor;
    CONFIG.Item.documentClass = SR5Item;
    CONFIG.Combat.documentClass = SR5Combat;
    CONFIG.ui.combat = SR5CombatTracker;
    //CONFIG.Scene.sheetClass = SR5SceneConfig;

    // ACTIVATE HOOKS DEBUG
    CONFIG.debug.hooks = false;

    // Patch Core Functions
    Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("SR5", SR5ActorSheet, {
      types: ["actorPc"],
      makeDefault: true
    });
    Actors.registerSheet("SR5", SR5SpiritSheet, {
      types: ["actorSpirit"],
      makeDefault: true
    });
    Actors.registerSheet("SR5", SR5GruntSheet, {
      types: ["actorGrunt"],
      makeDefault: true
    });
    Actors.registerSheet("SR5", SR5DroneSheet, {
      types: ["actorDrone"],
      makeDefault: true
    });
    Actors.registerSheet("SR5", SR5AppareilSheet, {
      types: ["actorDevice"],
      makeDefault: true
    });
    Actors.registerSheet("SR5", SR5SpriteSheet, {
      types: ["actorSprite"],
      makeDefault: true
    });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("SR5", SR5ItemSheet, {
      makeDefault: true
    });
    DocumentSheetConfig.registerSheet(Scene, "SR5", SR5SceneConfig, {
      makeDefault: true
    })

    // Preload Handlebars Templates
    await preloadHandlebarsTemplates();

    //CSS Switch
    const uitheme = game.settings.get("sr5", "sr5ChooseStyle");
    switch (uitheme) {
      case "SR6": {
        $('link[href="systems/sr5/css/sr5.css"]').prop("disabled", true);
        $("head").append('<link href="systems/sr5/css/sr6.css" rel="stylesheet" type="text/css" media="all">');
        break;
      }
      default : {
        $('link[href="systems/sr5/css/sr5.css"]').prop("disabled", false);
      }
    }
    

    //Socket
    SR5_SocketHandler.registerSocketListeners();

    SR5_SystemHelpers.srLog(2, `Finished initializing game system`);

    
  });

  Hooks.once("ready", function () {

    checkDependencies();

    Hooks.on("hotbarDrop", (bar, data, slot) => macros.createSR5Macro(data, slot));
    
    //game.settings.set("sr5", "systemMigrationVersion", "0.0.1");
    // Determine whether a system migration is required and feasible
    if ( !game.user.isGM ) return;
    const currentVersion = game.settings.get("sr5", "systemMigrationVersion");
    const NEEDS_MIGRATION_VERSION = "0.0.3";
    const needsMigration = !currentVersion || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion); //isNewerVersion(v0, v1)

    // Perform the migration
    if (needsMigration) {
     new game.sr5.migration().migrateWorld();
    }
  });

  registerHandlebarsHelpers();

  Hooks.on('renderPlayerList', () => {
    SR5_SystemHelpers.srLog(3, `Renderering Shadowrun 5 Help Window`);
    SR5_UiModifications.addHelpWindow();
  });

  Hooks.on("renderChatMessage", (app, html, data) => {
    if (!app.isRoll) SR5_RollMessage.chatListeners(html, data);
  });

  Hooks.on("canvasInit", function() {
    // Extend Diagonal Measurement
    SquareGrid.prototype.measureDistances = measureDistances;
  });

  Hooks.on("getCombatTrackerEntryContext", SR5CombatTracker.addCombatTrackerContextOptions);
  Hooks.on("renderCombatTracker", (app, html, data) => SR5CombatTracker.renderCombatTracker(app, html, data));

  Hooks.on('deleteCombat', (combat) => {
    if ( !game.user.isGM ) return;
    for (let combatant of combat.combatants){
      let actor;
      if (!combatant.actor.isToken) {
        actor = SR5_EntityHelpers.getRealActorFromID(combatant.data.actorId)
      } else {
        actor = SR5_EntityHelpers.getRealActorFromID(combatant.data.tokenId)
      }
      actor.unsetFlag("sr5", "cumulativeDefense");
    }
  });

  Hooks.on("renderFolderConfig", (dialog, html) => {
    // Copies the placeholder text as the default text entry
    if (html.find(`input[type=text]`)[0] && !html.find(`input[type=text]`)[0].value) {
      html.find(`input[type=text]`)[0].value = html.find(`input[type=text]`)[0].placeholder;
      html.find(`input[type=text]`)[0].focus();
    }
  });

  Hooks.on("renderDialog", (dialog, html) => {
    // Copies the placeholder text as the default text entry
    if (html.find(`input[type=text]`)[0] && !html.find(`input[type=text]`)[0].value) {
        html.find(`input[type=text]`)[0].value = html.find(`input[type=text]`)[0].placeholder;
        html.find(`input[type=text]`)[0].focus();
    }
  });

  Hooks.once("setup", async function () {

    let mainColorElement = document.getElementById("players");
    let mainColorRGB = window.getComputedStyle(mainColorElement, null).getPropertyValue("border-color");
    let mainColorArray = mainColorRGB.slice(mainColorRGB.indexOf("(") + 1, mainColorRGB.indexOf(")")).split(", ");
    let mainColor = mainColorArray.map(function convertToFloat(number) {
      return number / 255;
    });
    let subColorElement = document.getElementById("sidebar");
    let subColorRGB = window.getComputedStyle(subColorElement, null).getPropertyValue("border-left-color");
    let subColorArray = subColorRGB.slice(subColorRGB.indexOf("(") + 1, subColorRGB.indexOf(")")).split(", ");
    let subColor = subColorArray.map(function convertToFloat(number) {
      return number / 255;
    });

    Token.prototype._drawBar = function (number, bar, data) {
      const val = Number(data.value);
      let h = Math.max(canvas.dimensions.size / 12, 8);
      if (this.data.height >= 2) h *= 1.6; // Enlarge the bar for large tokens
      // Draw the bar
      bar.clear().beginFill(PIXI.utils.rgb2hex(subColor), 0.8).lineStyle(1, 0x000000, 1);
      // each max draw a green rectangle in background
      for (let index = 0; index < data.max; index++) {
        bar.drawRect(index * (this.w / data.max), 0, this.w / data.max, h);
      }
      // each actual value draw a rectangle from dark green to red
      bar.beginFill(PIXI.utils.rgb2hex(mainColor), 0.8).lineStyle(1, 0x000000, 1);
      for (let index = 0; index < Math.clamped(val, 0, data.max); index++) {
        bar.drawRect(index * (this.w / data.max), 0, this.w / data.max, h);
      }
      // Set position
      let posY = number === 0 ? this.h - h : 0;
      bar.position.set(0, posY);
    };
  });

  Hooks.on("preCreateToken", (tokenDocument) => {
    tokenDocument.data.update({img: tokenDocument.actor.img});
  });

  Hooks.on("createCombatant", (combatant) => {
    let key = SR5_CharacterUtility.findActiveInitiative(combatant.actor.data);

    combatant.update({
      "flags.sr5.seizeInitiative" : false,
      "flags.sr5.blitz" : false,
      "flags.sr5.hasPlayed" : false,
      "flags.sr5.cumulativeDefense" : 0,
      "flags.sr5.currentInitRating" : combatant.actor.data.data.initiatives[key].value,
      "flags.sr5.currentInitDice" : combatant.actor.data.data.initiatives[key].dice.value,
    });

    let actor;
    if (!combatant.actor.isToken) {
      actor = SR5_EntityHelpers.getRealActorFromID(combatant.data.actorId)
    } else {
      actor = SR5_EntityHelpers.getRealActorFromID(combatant.data.tokenId)
    }
    actor.setFlag("sr5", "cumulativeDefense", 0);
  });

  Hooks.on("updateItem", async(document, data, options, userId) => {
    if (document.isOwned && game.combat){
      SR5Combat.changeInitInCombat(document.actor);
    }
  });

  Hooks.on("updateActor", async(document, data, options, userId) => {
    if (game.combat){
      SR5Combat.changeInitInCombat(document);
    }
  });

}