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

		// ACTIVATE HOOKS DEBUG
		CONFIG.debug.hooks = false;

		// Patch Core Functions
		foundry.documents.Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;

		// Register sheet application classes
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5ActorSheet, {
			types: ["actorPc"],
			makeDefault: true,
			label: "SR5.Sheet.Character"
		});
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5SpiritSheet, {
			types: ["actorSpirit"],
			makeDefault: true,
			label: "SR5.Sheet.Spirit"
		});
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5GruntSheet, {
			types: ["actorGrunt"],
			makeDefault: true,
			label: "SR5.Sheet.Grunt"
		});
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5DroneSheet, {
			types: ["actorDrone"],
			makeDefault: true,
			label: "SR5.Sheet.Drone"
		});
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5AppareilSheet, {
			types: ["actorDevice"],
			makeDefault: true,
			label: "SR5.Sheet.Device"
		});
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5SpriteSheet, {
			types: ["actorSprite"],
			makeDefault: true,
			label: "SR5.Sheet.Sprite"
		});
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "SR5", SR5AgentSheet, {
			types: ["actorAgent"],
			makeDefault: true,
			label: "SR5.Sheet.Agent"
		});
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "SR5", SR5ItemSheet, {
			makeDefault: true,
			label: "SR5.Sheet.Item"
		});
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Scene, "SR5", SR5SceneConfig, {
			makeDefault: true
		})
		//foundry.applications.apps.DocumentSheetConfig.unregisterSheet("core", foundry.applications.sheets.MeasuredTemplateConfig);
		foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.MeasuredTemplateDocument, "SR5", SR5MeasuredTemplateConfig, {
			makeDefault: true
		})

		// Preload Handlebars Templates
		await preloadHandlebarsTemplates();

		//CSS Switch
		const uitheme = game.settings.get("sr5", "sr5ChooseStyle");
		switch (uitheme) {
			case "SR6": {
				const sr5Link = document.querySelector('link[href="systems/sr5/css/sr5.css"]');
				if (sr5Link) sr5Link.disabled = true;
				const sr6Link = document.createElement("link");
				sr6Link.rel = "stylesheet";
				sr6Link.type = "text/css";
				sr6Link.media = "all";
				sr6Link.href = "systems/sr5/css/sr6.css";
				document.head.appendChild(sr6Link);
				break;
			}
			default : {
				const sr5Link = document.querySelector('link[href="systems/sr5/css/sr5.css"]');
				if (sr5Link) sr5Link.disabled = false;
			}
		}
		
		//Socket
		SR5_SocketHandler.registerSocketListeners();

		// Patch creation dialog buttons with document-type icons
		const docTypes = ["Actor", "Item", "Scene", "JournalEntry", "RollTable", "Cards", "Playlist", "Macro"];
		for (const docName of docTypes) {
			const cls = CONFIG[docName]?.documentClass;
			if (!cls?.createDialog) continue;
			const original = cls.createDialog;
			cls.createDialog = function(data={}, createOptions={}, options={}) {
				const icon = CONFIG[docName]?.sidebarIcon;
				if (icon && !options?.ok?.icon) {
					options = foundry.utils.mergeObject({ ok: { icon } }, options);
				}
				return original.call(this, data, createOptions, options);
			};
		}

		SR5_SystemHelpers.srLog(2, `Finished initializing game system`);  
	});

	Hooks.once("ready", function () {
		//game.settings.set("sr5", "systemMigrationVersion", "0.0.1");
		// Determine whether a system migration is required and feasible
		if ( !game.user.isGM ) return;
		const currentVersion = game.settings.get("sr5", "systemMigrationVersion");
		const NEEDS_MIGRATION_VERSION = "11.0.3";
		const needsMigration = !currentVersion || foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion); //isNewerVersion(v0, v1)

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

	Hooks.on('renderPlayers', () => {
		SR5_SystemHelpers.srLog(3, `Renderering Shadowrun 5 Help Window`);
		SR5_UiModifications.addHelpWindow();
	});

	Hooks.once('canvasReady', data => {
		for (let token of data.tokens.placeables.filter(t => t.isOwner)){
			if (token.document.actorLink && (token.scene.flags.sr5?.backgroundCountValue !== 0)){
				token.document.actor.prepareData();
			}
		}
	});

	Hooks.on("renderChatMessageHTML", (message, html, data) => {
		// Apply SR5 custom styling for messages with SR5 roll data
		if (message.flags?.sr5data) {
			html.classList.add("SRCustomMessage");
			const borderColor = message.flags?.sr5data?.owner?.borderColor;
			if (borderColor && typeof borderColor === "string") html.style.borderColor = borderColor;

			// Inject actor thumbnail into Foundry's default message header
			const msgHeader = html.querySelector(":scope > header");
			if (msgHeader) {
				const imgSrc = message.flags?.sr5data?.owner?.speakerImg || "systems/sr5/img/ui/SR6_Logo.svg";
				const img = document.createElement("img");
				img.classList.add("SRAuthorIcon");
				img.src = imgSrc;
				img.title = message.speaker?.alias || "";
				msgHeader.prepend(img);
			}
		}

		// Attach SR5 chat card listeners for messages with roll card content
		const hasSr5Card = html.querySelector(".SR-CardHeader");
		if (hasSr5Card) SR5_RollMessage.chatListeners(html, message);
	});

	// v13: keep chat scrolled to bottom when SR5 roll messages change height.
	// Track whether the user is at the bottom; when chat content resizes
	// (message updates, card expand/collapse), snap back to bottom instantly.
	// This doesn't interfere with smooth "Jump to Bottom" animations because
	// wasAtBottom is false while the user is scrolled up.
	Hooks.once("renderChatLog", (app) => {
		const scroll = app.element.querySelector(".chat-scroll");
		if (!scroll) return;
		const log = scroll.querySelector(".chat-log");
		if (!log) return;
		let wasAtBottom = true;
		scroll.addEventListener("scroll", () => {
			wasAtBottom = (scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight) < 5;
		});
		new ResizeObserver(() => {
			if (wasAtBottom) {
				scroll.scrollTo({ top: scroll.scrollHeight, behavior: "instant" });
			}
		}).observe(log);
	});

	Hooks.on("canvasInit", function() {
		// Extend Diagonal Measurement
		//SquareGrid.prototype.measureDistances = measureDistances;
	});


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
		const input = html.querySelector(`input[type=text]`);
		if (input && !input.value) {
			input.value = input.placeholder;
			input.focus();
		}
	});

	Hooks.on("renderDialog", (dialog, html) => {
		const input = html.querySelector(`input[type=text]`);
		if (input && !input.value) {
			input.value = input.placeholder;
			input.focus();
		}
	});

	Hooks.on("createToken", async function(tokenDocument) {
		if (!game.user.isGM) return;
		let tokenData = foundry.utils.duplicate(tokenDocument);
		if (tokenData.texture.src == "") tokenData.texture.src = tokenDocument.actor.img;
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

	Hooks.on("preDeleteToken", (tokenDocument, options, userId) => {
		let deleteToken = canvas.tokens.get(tokenDocument.id);
		if (!deleteToken) return;
		// GSAP/TweenMax was removed in Foundry v12+; no animation cleanup needed
	});

	Hooks.on("createCombatant", async (combatant) => {
		if (game.user.isGM){
			let key = SR5_CharacterUtility.findActiveInitiative(combatant.actor.system);
			let actor;
			if (!combatant.actor.isToken) actor = SR5_EntityHelpers.getRealActorFromID(combatant.actorId)
			else actor = SR5_EntityHelpers.getRealActorFromID(combatant.tokenId)

			actor.update({
				"flags.sr5.cumulativeDefense": 0,
				"system.specialProperties.actions.free.current": actor.system.specialProperties.actions.free.value,
				"system.specialProperties.actions.simple.current": actor.system.specialProperties.actions.simple.value,
				"system.specialProperties.actions.complex.current": actor.system.specialProperties.actions.complex.value,
			})

			await combatant.update({
				"flags.sr5.seizeInitiative" : false,
				"flags.sr5.blitz" : false,
				"flags.sr5.hasPlayed" : combatant.isDefeated,
				"flags.sr5.cumulativeDefense" : 0,
				"flags.sr5.currentInitRating" : combatant.actor.system.initiatives[key].value,
				"flags.sr5.currentInitDice" : combatant.actor.system.initiatives[key].dice.value,
				"flags.sr5.actions.free": actor.system.specialProperties.actions.free.value,
				"flags.sr5.actions.simple": actor.system.specialProperties.actions.simple.value,
				"flags.sr5.actions.complex": actor.system.specialProperties.actions.complex.value,
			});
		}
	});

	Hooks.on("updateCombatant", (combatant) => {
		if (combatant.isDefeated && !combatant.flags.sr5.hasPlayed) combatant.update({"flags.sr5.hasPlayed": true,});
	});

	Hooks.on("deleteCombat", async (combat) => {
		if (game.user.isGM){
			//Reset actions to default values
			let actor, actorData;
			for (let combatant of combat.combatants){
				if (!combatant.actor.isToken) actor = SR5_EntityHelpers.getRealActorFromID(combatant.actorId)
				else actor = SR5_EntityHelpers.getRealActorFromID(combatant.tokenId)

				actorData = foundry.utils.duplicate(actor.system);
				for (let key of Object.keys(SR5.actionTypes)) {
					if (actorData.specialProperties.actions[key]) {
						actorData.specialProperties.actions[key].current = actorData.specialProperties.actions[key].value;
					}
				}
				await actor.update({system: actorData});
			}
		}
	});

	Hooks.on("closeCombatantConfig", (combatant) => {
		combatant.document.update({"flags.sr5.baseCombatantInitiative": combatant.document.initiative,})
	});

	Hooks.on("updateItem", async(document, data, options, userId) => {
		if (document.isOwned && game.combat && game.user?.isGM) {
			if (document.type === "itemSpell" || document.type === "itemComplexForm") SR5Combat.changeInitInCombatHelper(document.actor.id);
		}
		
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
		if (game.combat && game.user?.isGM && (data.system?.initiatives || data.system?.conditionMonitors || data.system?.matrix)) {
			let actorId = document.id;
			if (document.isToken) actorId = document.token.id;
			
			if (actorId) await SR5Combat.changeInitInCombatHelper(actorId);
		}

		//Keep deck condition monitor synchro with agent condition monitor
		if (document.type === "actorAgent" && data.system.conditionMonitors?.matrix && (document.testUserPermission(game.user, 3) || (game.user?.isGM))){
			await SR5_ActorHelper.keepDeckSynchroWithAgent(document);
		}

		//Keep edge monitor synchro with tokens
		if (document.type === "actorGrunt" && data.system?.conditionMonitors?.edge && (document.testUserPermission(game.user, 3) || (game.user?.isGM))){
			await SR5_ActorHelper.keepEdgeSynchroWithGrunt(document);
		}

		//Propagate owner data changes to linked drones and agents
		if ((document.type === "actorPc" || document.type === "actorGrunt") && (document.testUserPermission(game.user, 3))) {
			await SR5_CharacterUtility.updateControledVehicle(document);
			if (document.items.find(item => item.system.type === "agent")) await SR5_CharacterUtility.updateProgramAgent(document);
		}

		// Re-render open item sheets when actor data changes (e.g. metamagic toggles affect spell display)
		for (const item of document.items) {
			if (item.sheet?.rendered) item.sheet.render();
		}
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
				let newItem = foundry.utils.duplicate(panItem.system);
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
		if (!game.user.isGM ) return;
		if (effect.statuses.has("prone")){
			let itemEffect = effect.parent.items.find(i => i.type === "itemEffect" && i.system.type === "prone");
			let actorId = (effect.parent.isToken ? effect.parent.token.id : effect.parent.id);
			if (itemEffect) await SR5_ActorHelper.deleteItemEffectLinkedToActiveEffect(actorId, itemEffect.id);
			SR5Combat.changeActionInCombat(actorId, [{type: "simple", value: 1, source: "standUp"}]);
		}
	});

	Hooks.on("createActiveEffect", (effect) =>{
		if (!game.user.isGM ) return;
		let actorId = (effect.parent.isToken ? effect.parent.token.id : effect.parent.id);
		if (effect.statuses === "signalJam") SR5_EffectArea.onJamCreation(actorId);
		if ((effect.statuses === "cover" || effect.statuses === "coverFull") && game.combat) SR5Combat.changeActionInCombat(actorId, [{type: "simple", value: 1, source: "takeCover"}]);
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

	Hooks.on('updateScene', async (data) => {
		//relaunch prepare Data of all actor when a scene is modified, so background count and other effect are correctly applied without needing to manualy refresh an actor
		if (!game.user.isGM) return;
		for (let token of data.tokens){
			token.actor.prepareData();
			if (token.actor.sheet.rendered) token.actor.sheet.render();
		}
	});
}