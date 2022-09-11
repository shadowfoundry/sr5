import { SR5_SystemHelpers } from "./system/utilitySystem.js";

export default class Migration {

	async migrateWorld() {
		ui.notifications.info(`Applying SR5 System Migration for version ${game.system.version}. Please be patient and do not close your game or shut down your server.`, { permanent: true }); //To Translate

		// Migrate World Items
		for (let i of game.items.contents) {
			try {
			  const updateData = this.migrateItemData(i.toObject());
			  if (!foundry.utils.isEmpty(updateData)) {
				SR5_SystemHelpers.srLog(2, `Migrating Item documment ${i.name}`);
				await i.update(updateData, { enforceTypes: false });
			  }
			} catch (err) {
			  err.message = `Failed sr5 system migration for Item ${i.name}: ${err.message}`;
			  console.error(err);
			}
		}

		// Migrate World Compendium Packs
		for (let p of game.packs) {
			if (p.metadata.type == "Item" && p.metadata.package == "world")
			  await this.migrateCompendium(p);
		  }
		  for (let p of game.packs) {
			if (p.metadata.type == "Actor" && p.metadata.package == "world")
			  await this.migrateCompendium(p);
		  }
		  for (let p of game.packs) {
			if (p.metadata.type == "Scene" && p.metadata.package == "world")
			  await this.migrateCompendium(p);
		}

		// Migrate World Actors
		for (let a of game.actors.contents) {
			try {
			  const updateData = this.migrateActorData(a);
			  if (!foundry.utils.isEmpty(updateData)) {
				SR5_SystemHelpers.srLog(2, `Migrating Actor entity ${a.name}`);
				await a.update(updateData, { enforceTypes: false });
			  }
			} catch (err) {
			  err.message = `Failed sr5 system migration for Actor ${a.name}: ${err.message}`;
			  console.error(err);
			}
		}

		// Migrate Actor Override Tokens
		for (let s of game.scenes.contents) {
			try {
			  const updateData = this.migrateSceneData(s);
			  if (!foundry.utils.isEmpty(updateData)) {
				SR5_SystemHelpers.srLog(2, `Migrating Scene entity ${s.name}`);
				await s.update(updateData, { enforceTypes: false });
				// If we do not do this, then synthetic token actors remain in cache
				// with the un-updated actorData.
				s.tokens.contents.forEach(t => t._actor = null);
			  }
			} catch (err) {
			  err.message = `Failed sr5 system migration for Scene ${s.name}: ${err.message}`;
			  console.error(err);
			}
		  }

		// Set the migration as complete
		game.settings.set("sr5", "systemMigrationVersion", game.system.version);
		ui.notifications.info(`SR5 System Migration to version ${game.system.version} completed!`, { permanent: true }); //To Translate.
	}

	/* -------------------------------------------- */

	/**
	 * Apply migration rules to all Entities within a single Compendium pack
	 * @param pack
	 * @return {Promise}
	 */
	async migrateCompendium(pack) {
		const document = pack.metadata.document;
		if (!["Actor", "Item", "Scene"].includes(document)) return;

		// Unlock the pack for editing
		const wasLocked = pack.locked;
		await pack.configure({ locked: false });

		// Begin by requesting server-side data model migration and get the migrated content
		await pack.migrate();
		const documents = await pack.getDocuments();

		// Iterate over compendium entries - applying fine-tuned migration functions
		for (let doc of documents) {
		let updateData = {};
		try {
			switch (document) {
			case "Actor":
				updateData = this.migrateActorData(doc.data);
				break;
			case "Item":
				updateData = this.migrateItemData(doc.toObject());
				break;
			case "Scene":
				updateData = this.migrateSceneData(doc.data);
				break;
			}

			// Save the entry, if data was changed
			if (foundry.utils.isEmpty(updateData)) continue;
			await doc.update(updateData);
			SR5_SystemHelpers.srLog(2, `Migrated ${document} document ${doc.name} in Compendium ${pack.collection}`);
		}

		// Handle migration failures
		catch (err) {
			err.message = `Failed sr5 system migration for document ${doc.name} in pack ${pack.collection}: ${err.message}`;
			console.error(err);
		}
		}

		// Apply the original locked status for the pack
		await pack.configure({ locked: wasLocked });
		SR5_SystemHelpers.srLog(2,`Migrated all ${document} entities from Compendium ${pack.collection}`);
	};

	/* -------------------------------------------- */
  	/*  Entity Type Migration Helpers               */
  	/* -------------------------------------------- */

  	/**
   	* Migrate a single Actor entity to incorporate latest data model changes
   	* Return an Object of updateData to be applied
   	* @param {object} actor    The actor data object to update
   	* @return {Object}         The updateData to apply
   	*/
   	migrateActorData(actor) {
	    const updateData = {};

    	// Actor Data Updates
    	if (actor.system) {
			//Do stuff on Actor
			if(actor.type !== "actorDrone") updateData["system.penalties.-=resonance"] = null;
			if(actor.system.vision) updateData["system.-=vision"] = null;
			if (actor.type === "actorSpirit"){
				if(actor.system.magic.magicType === "") updateData["system.magic.magicType"] = "spirit";
			}


			//Add itemDevice to actor if there is not TO REMOVE ON 0.4.4
			if (actor.type === "actorDrone" || actor.type === "actorSprite" || actor.type === "actorDevice"){
				let hasDevice = false;
				if (actor.items){
					for (let i of actor.items){
						if (i.type === "itemDevice") hasDevice = true;
					}

					if (!hasDevice){
						let deviceItem = {
							"name": game.i18n.localize("SR5.Device"),
							"type": "itemDevice",
						}
						deviceItem.system = {
							"isActive": true,
							"type": "baseDevice",
						}
						actor.document.createEmbeddedDocuments("Item", [deviceItem]);
					}
				}
			}

			//Change on conditionMonitors template to handle temporary damage
			if (actor.system.conditionMonitors){
				for (let key of Object.keys(actor.system.conditionMonitors)){
					if (actor.system.conditionMonitors[key].current) {
						if (key === "condition") {
							updateData["system.conditionMonitors.condition.actual.base"] = actor.system.conditionMonitors.condition.current;
							updateData["system.conditionMonitors.condition.-=current"] = null;
						}
						if (key === "matrix") {
							updateData["system.conditionMonitors.matrix.actual.base"] = actor.system.conditionMonitors.matrix.current;
							updateData["system.conditionMonitors.matrix.-=current"] = null;
						}
						if (key === "stun") {
							updateData["system.conditionMonitors.stun.actual.base"] = actor.system.conditionMonitors.stun.current;
							updateData["system.conditionMonitors.stun.-=current"] = null;
						}
						if (key === "physical") {
							updateData["system.conditionMonitors.physical.actual.base"] = actor.system.conditionMonitors.physical.current;
							updateData["system.conditionMonitors.physical.-=current"] = null;
						}
						if (key === "edge") {
							updateData["system.conditionMonitors.edge.actual.base"] = actor.system.conditionMonitors.edge.current;
							updateData["system.conditionMonitors.edge.-=current"] = null;
						}
						if (key === "overflow") {
							updateData["system.conditionMonitors.overflow.actual.base"] = actor.system.conditionMonitors.overflow.current;
							updateData["system.conditionMonitors.overflow.-=current"] = null;
						}
					}
				}
			}

			//Change astralCombat limit
			if (actor.system.skills?.astralCombat){
				updateData["system.skills.astralCombat.limit.base"] = "astralLimit";
			}

			//v10 embedded items in actor
			if (actor.system.creatorData){
				let newCreatorData = duplicate(actor.system.creatorData);
				if (newCreatorData.items){
					for (let i of newCreatorData.items){
						i.system = i.data;
						if (i.system.customEffects){
							for (let e of Object.values(i.system.customEffects)){
								if (e.target){
									if (e.target.includes("data."))	e.target = e.target.replace('data.','system.');
								}
							}
						}
					}
				}
				if (newCreatorData.data) newCreatorData.system = newCreatorData.data;
				updateData["system.creatorData"] = newCreatorData;
			}

			if(actor.flags?.sr5?.vehicleControler){
				let newFlag = duplicate(actor.flags.sr5.vehicleControler);
				newFlag.system = newFlag.data;
				if (newFlag.items){
					for (let i of newFlag.items){
						i.system = i.data;
						if (i.system.customEffects){
							for (let e of Object.values(i.system.customEffects)){
								if (e.target){
									if (e.target.includes("data."))	e.target = e.target.replace('data.','system.');
								}
							}
						}
					}
				}
				updateData["flags.sr5.vehicleControler"] = newFlag;
			}

    	}

		// Migrate Owned Items
		if (actor.items) {
			const items = actor.items.reduce((arr, i) => {
				// Migrate the Owned Item
				const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
				let itemUpdate = this.migrateItemData(itemData);

				// Update the Owned Item
				if (!foundry.utils.isEmpty(itemUpdate)) {
					itemUpdate._id = itemData._id;
					arr.push(expandObject(itemUpdate));
				}
				return arr;
			}, []);
			if (items.length > 0) updateData.items = items;
		}

		return updateData;
	};

	/* -------------------------------------------- */


	/**
	 * Scrub an Actor's system data, removing all keys which are not explicitly defined in the system template
	 * @param {Object} actorData    The data object for an Actor
	 * @return {Object}             The scrubbed Actor data
	 */
	cleanActorData(actorData) {

		// Scrub system data
		const model = game.system.model.Actor[actorData.type];
		actorData.system = filterObject(actorData.system, model);

		// Return the scrubbed data
		return actorData;
	}

	/* -------------------------------------------- */

	/**
	* Migrate a single Item entity to incorporate latest data model changes
	*
	* @param {object} item  Item data to migrate
	* @return {object}      The updateData to apply
	*/
	migrateItemData(item) {
		const updateData = {};
		//Migrate Items
		if (item.type == "itemQuality"){
			updateData["system.isActive"] = true;
		}

		if (item.type == "itemWeapon"){
			if(item.system.type === "amt_special") updateData["system.type"] = "exoticMeleeWeapon";
			if(item.system.type === "adt_special") updateData["system.type"] = "exoticRangedWeapon";
			if(item.system.weaponSkill.category === "amt_special") updateData["system.weaponSkill.category"] = "exoticMeleeWeapon";
			if(item.system.weaponSkill.category === "adt_special") updateData["system.weaponSkill.category"] = "exoticRangedWeapon";
			if(item.system.category === "grenade"){
				updateData["system.range.short.base"] = 2;
				updateData["system.range.medium.base"] = 4;
				updateData["system.range.long.base"] = 6;
				updateData["system.range.extreme.base"] = 10;
			}
		}

		if (item.system?.conditionMonitors){
			if (item.system.conditionMonitors.matrix) {
				updateData["system.conditionMonitors.matrix.actual.base"] = item.system.conditionMonitors.matrix.current;
				updateData["system.conditionMonitors.matrix.-=current"] = null;
			}
			if (item.system.conditionMonitors.condition) {
				updateData["system.conditionMonitors.condition.actual.base"] = item.system.conditionMonitors.condition.current;
				updateData["system.conditionMonitors.condition.-=current"] = null;
			}
			if (item.system.conditionMonitors.stun) {
				updateData["system.conditionMonitors.stun.actual.base"] = item.system.conditionMonitors.stun.current;
				updateData["system.conditionMonitors.stun.-=current"] = null;
			}
			if (item.system.conditionMonitors.physical) {
				updateData["system.conditionMonitors.physical.actual.base"] = item.system.conditionMonitors.physical.current;
				updateData["system.conditionMonitors.physical.-=current"] = null;
			}
		}

		if (item.type == "itemSpell"){
			if (item.system.drainModifier) {		
				updateData["system.drain.base"] = item.system.drainModifier;
				updateData["system.-=drainModifier"] = null;
			}
		}

		//v10 migrate custom effects path
		if (item.system?.customEffects){
			let newCustomEffects = item.system.customEffects;
			for (let e of Object.values(newCustomEffects)){
				if (e.target){
					if (e.target.includes("data."))	e.target = e.target.replace('data.','system.');
				}
			}
			updateData["system.customEffects"] = newCustomEffects;
		}

		//v10 migrate items effects path
		if (item.system?.itemEffects){
			let newItemEffects = item.system.itemEffects;
			for (let e of Object.values(newItemEffects)){
				if (e.target){
					if (e.target.includes("data."))	e.target = e.target.replace('data.','system.');
				}
			}
			updateData["system.itemEffects"] = newItemEffects;
		}

		//v10 migrate system effects path
		if (item.system?.systemEffects){
			let newSystemEffects = item.system.systemEffects;
			for (let e of Object.values(newSystemEffects)){
				if (e.target){
					if (e.target.includes("data."))	e.target = e.target.replace('data.','system.');
				}
			}
			updateData["system.systemEffects"] = newSystemEffects;
		}

		//v10 migrate agent item
		if (item.system?.decks){
			let newDecks = item.system.decks;
			for (let i of Object.values(newDecks)){
				if (i.data) i.system = i.data;
			}
			updateData["system.decks"] = newDecks;
		}

		// Migrate Effects
		if (item.effects) {
		const effects = item.effects.reduce((arr, e) => {
			// Migrate the Owned Item
			const effectData = e instanceof CONFIG.ActiveEffect.documentClass ? e.toObject() : e;
			let effectUpdate = this.migrateEffectData(effectData);

			// Update the Owned Item
			if (!foundry.utils.isEmpty(effectUpdate)) {
				effectUpdate._id = effectData._id;
				arr.push(expandObject(effectUpdate));
			}

			return arr;
		}, []);
		if (effects.length > 0) updateData.effects = effects;
		}

		return updateData;
	};

	/* -------------------------------------------- */

	/**
   * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
   * Return an Object of updateData to be applied
   * @param {Object} scene  The Scene data to Update
   * @return {Object}       The updateData to apply
   */
	migrateSceneData(scene) {
		const tokens = scene.tokens.map(token => {
			const t = token.toJSON();
			if (!t.actorId || t.actorLink) {
				t.actorData = {};
			}
			else if (!game.actors.has(t.actorId)) {
				t.actorId = null;
				t.actorData = {};
			}
			else if (!t.actorLink) {
				const actorData = duplicate(t.actorData);
				actorData.type = token.actor?.type;
				if (actorData.items){
					for (let i of Object.values(actorData.items)){
						i.system = i.data;
					}
				}
				const update = this.migrateActorData(actorData);
				['items', 'effects'].forEach(embeddedName => {
					if (!update[embeddedName]?.length) return;
					const updates = new Map(update[embeddedName].map(u => [u._id, u]));
					t.actorData[embeddedName].forEach(original => {
						const update = updates.get(original._id);
						if (update) mergeObject(original, update);
					});
					delete update[embeddedName];
				});

				mergeObject(t.actorData, update);
			}
			return t;
		});
		return { tokens };
	};
}