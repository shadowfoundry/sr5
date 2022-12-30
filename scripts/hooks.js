import { SR5 } from "./config.js";
import { SR5_SystemHelpers, SR5_UiModifications } from "./system/utilitySystem.js";
import { SR5_EntityHelpers } from "./entities/helpers.js";
import { registerHandlebarsHelpers } from "./handlebars.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { SR5_SocketHandler } from "./socket.js";
import { SR5Actor } from "./entities/actors/entityActor.js";
import { SR5_CharacterUtility } from "./entities/actors/utilityActor.js";
import { SR5_UtilityItem } from "./entities/items/utilityItem.js";
import { SR5ActorSheet } from "./entities/actors/characterSheet.js";
import { SR5SpiritSheet } from "./entities/actors/spiritSheet.js";
import { SR5GruntSheet } from "./entities/actors/gruntSheet.js";
import { SR5DroneSheet } from "./entities/actors/droneSheet.js";
import { SR5AppareilSheet } from "./entities/actors/deviceSheet.js";
import { SR5SpriteSheet } from "./entities/actors/spriteSheet.js";
import { SR5AgentSheet } from "./entities/actors/agentSheet.js";
import { SR5Item } from "./entities/items/entityItem.js";
import { SR5ItemSheet } from "./entities/items/itemSheet.js";
import { SR5_RollMessage } from "./rolls/roll-message.js";
import { SR5Combat, _getInitiativeFormula } from "./system/srcombat.js";
import { SR5Token } from "./interface/token.js";
import * as SRVision from "./system/vision.js";
import { SR5CombatTracker } from "./interface/srcombat-tracker.js";
import { SR5_EffectArea } from "./system/effectArea.js";
import { _getSRStatusEffect } from "./system/effectsList.js";
import  SR5TokenHud from "./interface/tokenHud.js";
import { measureDistances } from "./interface/canvas.js";
import  SR5SceneConfig  from "./interface/sceneConfig.js";
import  SR5MeasuredTemplateConfig  from "./interface/measuredTemplateConfig.js";
import {SR5CompendiumInfo} from "./interface/compendium.js";
import * as macros from "./interface/macros.js";
import Migration from "./migration.js";
import { SR5_ActorHelper } from "./entities/actors/entityActor-helpers.js";

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
			rollMacro: macros.rollMacro,
		};

		// Record Configuration Values
		CONFIG.SR5 = SR5_EntityHelpers.sortTranslations(SR5);
		CONFIG.Actor.documentClass = SR5Actor;
		CONFIG.Item.documentClass = SR5Item;
		CONFIG.Combat.documentClass = SR5Combat;
		CONFIG.ui.combat = SR5CombatTracker;
		CONFIG.Token.objectClass = SR5Token;
		CONFIG.Canvas.visionModes.astralvision = SRVision.astralVision;
		//CONFIG.MeasuredTemplate.sheetClasses.SRTest = SR5MeasuredTemplateConfig;
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
		Actors.registerSheet("SR5", SR5AgentSheet, {
			types: ["actorAgent"],
			makeDefault: true
		});
		Items.unregisterSheet("core", ItemSheet);
		Items.registerSheet("SR5", SR5ItemSheet, {
			makeDefault: true
		});
		DocumentSheetConfig.registerSheet(Scene, "SR5", SR5SceneConfig, {
			makeDefault: true
		})
		//DocumentSheetConfig.unregisterSheet("core", MeasuredTemplateConfig);
		DocumentSheetConfig.registerSheet(MeasuredTemplateDocument, "SR5", SR5MeasuredTemplateConfig, {
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
		//game.settings.set("sr5", "systemMigrationVersion", "0.0.1");
		// Determine whether a system migration is required and feasible
		if ( !game.user.isGM ) return;
		const currentVersion = game.settings.get("sr5", "systemMigrationVersion");
		const NEEDS_MIGRATION_VERSION = "0.1.4";
		const needsMigration = !currentVersion || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion); //isNewerVersion(v0, v1)

		// Perform the migration
		if (needsMigration) new game.sr5.migration().migrateWorld();

		//Token hud
		canvas.hud.token = new SR5TokenHud();
	});

	Hooks.on("hotbarDrop", (bar, data, slot) => {
		switch (data.type){
			case "Item":
				macros.createSR5MacroItem(data, slot);
				return false;
			case "Skill":
			case "MatrixAction":
			case "ResonanceAction":
				macros.createSR5Macro(data, slot);
				return false;
			default:
				return;
		}
	})

	registerHandlebarsHelpers();

	Hooks.on('renderPlayerList', () => {
		SR5_SystemHelpers.srLog(3, `Renderering Shadowrun 5 Help Window`);
		SR5_UiModifications.addHelpWindow();
	});

	Hooks.once('canvasReady', data => {
		for (let token of data.tokens.ownedTokens){
			if (token.document.actorLink && (token.scene.flags.sr5.backgroundCountValue !== 0)){
				token.document.actor.prepareData();
			}
		}
	});

	Hooks.on("renderChatMessage", (app, html, data) => {
		if (!app.isRoll) SR5_RollMessage.chatListeners(html, data);
		if (app.isRoll) html[0].classList.add("SRCustomMessage");
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
			if (!combatant.actor.isToken) actor = SR5_EntityHelpers.getRealActorFromID(combatant.actorId)
			else actor = SR5_EntityHelpers.getRealActorFromID(combatant.tokenId)
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

	Hooks.on("createToken", async function(tokenDocument) {
		if (!game.user.isGM) return;
		let tokenData = duplicate(tokenDocument);
		if (tokenDocument.texture.src.includes("systems/sr5/img/actors/")) tokenData.texture.src = tokenDocument.actor.img;
		if (tokenDocument.actor.system.visions?.astral?.isActive) tokenData = await SR5_EntityHelpers.getAstralVisionData(tokenData);
		else tokenData = await SR5_EntityHelpers.getBasicVisionData(tokenData);
		await tokenDocument.update(tokenData);
	});

	Hooks.on("updateToken", async function(tokenDocument, change) {
		if (change.x || change.y) {
			SR5_EffectArea.tokenAura(tokenDocument);
			if (game.user.isGM) SR5_EffectArea.checkIfTokenIsInTemplate(tokenDocument);
		}
	});

	Hooks.on("preDeleteToken", (scene, token) => {
		let deleteToken = canvas.tokens.get(token._id)
		if (!deleteToken) return;
		TweenMax.killTweensOf(deleteToken.children)
	});

	Hooks.on("createCombatant", (combatant) => {
		let key = SR5_CharacterUtility.findActiveInitiative(combatant.actor.system);

		if (game.user.isGM){
			combatant.update({
				"flags.sr5.seizeInitiative" : false,
				"flags.sr5.blitz" : false,
				"flags.sr5.hasPlayed" : combatant.isDefeated,
				"flags.sr5.cumulativeDefense" : 0,
				"flags.sr5.currentInitRating" : combatant.actor.system.initiatives[key].value,
				"flags.sr5.currentInitDice" : combatant.actor.system.initiatives[key].dice.value,
			});
			
			let actor;
			if (!combatant.actor.isToken) actor = SR5_EntityHelpers.getRealActorFromID(combatant.actorId)
			else actor = SR5_EntityHelpers.getRealActorFromID(combatant.tokenId)
			actor.setFlag("sr5", "cumulativeDefense", 0);
		}
	});

	Hooks.on("updateCombatant", (combatant) => {
		if (combatant.isDefeated && !combatant.flags.sr5.hasPlayed) combatant.update({"flags.sr5.hasPlayed": true,});
	});

	Hooks.on("closeCombatantConfig", (combatant) => {
		combatant.document.update({"flags.sr5.baseCombatantInitiative": combatant.document.initiative,})
	});

	Hooks.on("updateItem", async(document, data, options, userId) => {
		if (document.isOwned && game.combat && game.user?.isGM) SR5Combat.changeInitInCombatHelper(document.actor.id);
		
		//Keep agent condition monitor synchro with owner deck
		if(document.type === "itemDevice" && data.system.conditionMonitors?.matrix && document.testUserPermission(game.user, 3) || (game.user?.isGM)){
			if (document.parent?.type === "actorPc" || document.parent?.type === "actorGrunt"){
				for (let a of game.actors) {
					if(a.type === "actorAgent" && a.system.creatorId === document.parent.id) await SR5_ActorHelper.keepAgentMonitorSynchro(a);
				}
			} 
		}
	});

	Hooks.on("updateActor", async(document, data, options, userId) => {
		if (game.combat && game.user?.isGM) {
			let actorId = document.id;
			if (document.isToken) actorId = document.token.id;
			SR5Combat.changeInitInCombatHelper(actorId);
		}

		//Keep deck condition monitor synchro with agent condition monitor
		if (document.type === "actorAgent" && data.system.conditionMonitors?.matrix && (document.testUserPermission(game.user, 3) || (game.user?.isGM))){
			await SR5_ActorHelper.keepDeckSynchroWithAgent(document);
		}

		//Keep edge monitor synchro with tokens
		if (document.type === "actorGrunt" && data.system?.conditionMonitors?.edge && (document.testUserPermission(game.user, 3) || (game.user?.isGM))){
			await SR5_ActorHelper.keepEdgeSynchroWithGrunt(document);
		}
		//let truc = document.effects.find(e => e.origin = "linkLock")
		//if (truc) await document.deleteEmbeddedDocuments('ActiveEffect', [truc.id]);
	});

	Hooks.on("deleteItem", async (item) =>{
		if (item.testUserPermission(game.user, 3) || (game.user?.isGM)){
			if (item.system.type === "signalJam"){
				let actorId = item.parent.id
				SR5_EffectArea.onJamEnd(actorId);
			}
			if (item.type === "itemEffect"){
				if (item.system.hasEffectOnItem && item.parent){
					if (item.parent.isToken) await SR5_ActorHelper.deleteItemEffectFromItem(item.parent.token.id, item.system.ownerItem);
					else await SR5_ActorHelper.deleteItemEffectFromItem(item.parent.id, item.system.ownerItem);
				}
			}

		}
		//Remove isSlavedToPan switch if PAN master is deleted
		if (item.system.pan?.content?.length){
			for (let i of item.system.pan.content){
				let panItem = await fromUuid(i.uuid);
				let newItem = duplicate(panItem.system);
				newItem.isSlavedToPan = false;
				newItem.panMaster = "";
				await panItem.update({"system": newItem,});
			}
		}
		//Remove item from PAN if it was slaved
		if (item.system.isSlavedToPan){
			SR5_ActorHelper.deleteItemFromPan(item.uuid, item.system.panMaster, null);
		}
	});

	Hooks.on("deleteActiveEffect", async (effect) =>{
		if (effect.flags.core?.statusId === "prone" && game.user?.isGM){
			let itemEffect = effect.parent.items.find(i => i.type === "itemEffect" && i.system.type === "prone");
			if (itemEffect) {
				if (itemEffect.parent.isToken) await SR5_ActorHelper.deleteItemEffectLinkedToActiveEffect(itemEffect.parent.token.id, itemEffect.id);
				else await SR5_ActorHelper.deleteItemEffectLinkedToActiveEffect(itemEffect.parent.id, itemEffect.id);
			}
		}
	});

	Hooks.on("createActiveEffect", (effect) =>{
		if ( !game.user.isGM ) return;
		if (effect.flags.core?.statusId === "signalJam") {
			let actorId = effect.parent.id
			if (effect.parent.isToken) actorId = effect.parent.token.id;
			SR5_EffectArea.onJamCreation(actorId);
		}
	});

	Hooks.on("createActor", async (actor) =>{
		if ( !game.user.isGM ) return;

		//Add itemDevice to Drone/Sprite/Agent if they have none.
		if (actor.type === "actorDrone" || actor.type === "actorSprite" || actor.type === "actorAgent"){
			let hasDevice = false;
			for (let i of actor.items){
				if (i.type === "itemDevice") hasDevice = true;
			}

			if (!hasDevice){
				let deviceItem = {
					"name": game.i18n.localize("SR5.Device"),
					"type": "itemDevice",
					"system.isActive": true,
					"system.type": "baseDevice",
				}
				await actor.createEmbeddedDocuments("Item", [deviceItem]);
			}
		}

		if (actor.type ==="actorSpirit") {
			SR5_CharacterUtility.switchToInitiative(actor, "astralInit");
		}
	});

	Hooks.on('renderCompendium', async (pack, html, compendiumData) => {
		SR5CompendiumInfo.onRenderCompendium(pack, html, compendiumData)
	});

	Hooks.on('drawMeasuredTemplate', async (template) => {
		if ( !game.user.isGM ) return;
		await SR5_EffectArea.initiateTemplateEffect(template);
	});

	Hooks.on('deleteMeasuredTemplate', async (templateDocument) => {
		if ( !game.user.isGM ) return;
		await SR5_EffectArea.removeTemplateEffect(templateDocument);
	});

	Hooks.on('updateMeasuredTemplate', async (templateDocument) => {
		if ( !game.user.isGM ) return;
		await SR5_EffectArea.checkUpdatedTemplateEffect(templateDocument);
	});
	
}