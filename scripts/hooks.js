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
import { SR5_RollMessage } from "./rolls/roll-message.js";
import { SR5Combat, _getInitiativeFormula } from "./system/srcombat.js";
import { SR5Token } from "./interface/token.js";
import { SR5SightLayer, drawSight } from "./interface/vision.js";
import { SR5CombatTracker } from "./interface/srcombat-tracker.js";
import { _getSRStatusEffect } from "./system/effectsList.js";
import  SR5TokenHud from "./interface/tokenHud.js";
import { checkDependencies } from "./apps/dependencies.js"
import { measureDistances } from "./interface/canvas.js";
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
    CONFIG.Canvas.layers.sight.layerClass = SR5SightLayer;
    CONFIG.Token.objectClass = SR5Token;

    // ACTIVATE HOOKS DEBUG
    CONFIG.debug.hooks = false;

    // Patch Core Functions
    Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;
    VisionSource.prototype.drawSight = drawSight;


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
        CONFIG.TinyMCE.content_css = CONFIG.TinyMCE.content_css.concat("systems/sr5/css/sr6.css");
        break;
      }
      default : {
        $('link[href="systems/sr5/css/sr5.css"]').prop("disabled", false);
        CONFIG.TinyMCE.content_css = "systems/sr5/css/sr5.css";
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
    const NEEDS_MIGRATION_VERSION = "0.0.3.7";
    const needsMigration = !currentVersion || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion); //isNewerVersion(v0, v1)

    // Perform the migration
    if (needsMigration) {
      new game.sr5.migration().migrateWorld();
    }

    canvas.hud.token = new SR5TokenHud();
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
    Hooks.once("canvasPan", async (canvas) => {
      const tokenOverlay = game.settings.get("sr5", "sr5TokenGraphic");
      if (tokenOverlay){
        for (let token of canvas.tokens.placeables) {
          if(token.actor){
            await SR5Token.addTokenLayer(token);
          }
        }
      }
    })
  });

  Hooks.on("getCombatTrackerEntryContext", SR5CombatTracker.addCombatTrackerContextOptions);
  Hooks.on("renderCombatTracker", (app, html, data) => SR5CombatTracker.renderCombatTracker(app, html, data));

  Hooks.on('deleteCombat', (combat) => {
    if ( !game.user.isGM ) return;
    for (let combatant of combat.combatants){
      let actor;
      if (!combatant.actor.isToken) actor = SR5_EntityHelpers.getRealActorFromID(combatant.data.actorId)
      else actor = SR5_EntityHelpers.getRealActorFromID(combatant.data.tokenId)
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

  Hooks.on("preCreateToken", (tokenDocument) => {
    if (tokenDocument.data.img.includes("systems/sr5/img/actors/")) tokenDocument.data.update({img: tokenDocument.actor.img});
  });

  Hooks.on("createToken", async function(tokenDocument) {
    const tokenOverlay = game.settings.get("sr5", "sr5TokenGraphic");
    if (tokenOverlay) await SR5Token.addTokenLayer(tokenDocument);
  });

  Hooks.on("updateToken", async function(tokenDocument) {
    const tokenOverlay = game.settings.get("sr5", "sr5TokenGraphic");
    if (tokenOverlay) await SR5Token.addTokenLayer(tokenDocument);
  });

  Hooks.on("preDeleteToken", (scene, token) => {
    let deleteToken = canvas.tokens.get(token._id)
    if (!deleteToken) return;
    TweenMax.killTweensOf(deleteToken.children)
  });

  Hooks.on("createCombatant", (combatant) => {
    let key = SR5_CharacterUtility.findActiveInitiative(combatant.actor.data);

    combatant.update({
      "flags.sr5.seizeInitiative" : false,
      "flags.sr5.blitz" : false,
      "flags.sr5.hasPlayed" : combatant.isDefeated,
      "flags.sr5.cumulativeDefense" : 0,
      "flags.sr5.currentInitRating" : combatant.actor.data.data.initiatives[key].value,
      "flags.sr5.currentInitDice" : combatant.actor.data.data.initiatives[key].dice.value,
    });

    let actor;
    if (!combatant.actor.isToken) actor = SR5_EntityHelpers.getRealActorFromID(combatant.data.actorId)
    else actor = SR5_EntityHelpers.getRealActorFromID(combatant.data.tokenId)
    actor.setFlag("sr5", "cumulativeDefense", 0);
  });

  Hooks.on("updateCombatant", (combatant) => {
    if (combatant.isDefeated && !combatant.data.flags.sr5.hasPlayed){
      combatant.update({"flags.sr5.hasPlayed": true,})
    }
  });

  Hooks.on("updateItem", async(document, data, options, userId) => {
    if (document.isOwned && game.combat) SR5Combat.changeInitInCombat(document.actor);
  });

  Hooks.on("updateActor", async(document, data, options, userId) => {
    if (game.combat) SR5Combat.changeInitInCombat(document);
    if (data.data?.visions) canvas.sight.refresh()
  
    let astralVisionEffect = document.effects.find(e => e.data.origin === "handleVisionAstral")
    if (document.data.data.visions?.astral.isActive){
      if (!astralVisionEffect){
        let astralEffect = await _getSRStatusEffect("handleVisionAstral");
        await document.createEmbeddedDocuments('ActiveEffect', [astralEffect]);
      }
    } else {
      if (astralVisionEffect) await document.deleteEmbeddedDocuments('ActiveEffect', [astralVisionEffect.id]);
    }
    //let truc = document.effects.find(e => e.data.origin = "handleVisionAstral")
    //if (truc) await document.deleteEmbeddedDocuments('ActiveEffect', [truc.id]);
  });

  Hooks.on("deleteItem", async (item) =>{
    if (item.type === "itemEffect"){
      let statusEffect = item.actor.effects.find(e => e.data.origin === item.data.data.type);
      if (statusEffect) await item.actor.deleteEmbeddedDocuments('ActiveEffect', [statusEffect.id]);
    }
  });

  Hooks.on("deleteActiveEffect", (effect) =>{
    if (effect.data.flags.core?.statusId === "astralInit") canvas.sight.refresh()
  });

  Hooks.on("createActiveEffect", (effect) =>{
    if (effect.data.flags.core?.statusId === "astralInit") canvas.sight.refresh()
  });

  Hooks.on("lightingRefresh", () => {
    for (const source of canvas.sight.sources) {

      }
  });

  Hooks.on("deleteActiveEffect", (effect) =>{
    if (effect.data.flags.core?.statusId === "astralInit") canvas.sight.refresh()
  });

  Hooks.on("createActiveEffect", (effect) =>{
    if (effect.data.flags.core?.statusId === "astralInit") canvas.sight.refresh()
  });

}