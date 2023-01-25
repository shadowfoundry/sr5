import { SR5 } from "../../config.js";
import { SR5_EntityHelpers } from "../helpers.js";
import { SR5Combat } from "../../system/srcombat.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5_CompendiumUtility } from "./utilityCompendium.js";
import { SR5_CombatHelpers } from "../../rolls/roll-helpers/combat.js";
import { SR5_CalledShotHelpers } from "../../rolls/roll-helpers/calledShot.js";
import { SR5_MarkHelpers } from "../../rolls/roll-helpers/mark.js";
import { SR5_PrepareRollTest } from "../../rolls/roll-prepare.js";
import { SR5_SocketHandler } from "../../socket.js";
import { _getSRStatusEffect } from "../../system/effectsList.js";

export class SR5_ActorHelper {
    
    //Apply Damage to actor
	static async takeDamage(actorId, options) {
        let realActor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let damage = options.damage.value,
			damageType = options.damage.type,
			actor = duplicate(realActor),
			actorData = actor.system,
			gelAmmo = 0,
			damageReduction = 0,
			realDamage;

		if (options.combat.ammo.type === "gel") gelAmmo = -2;
		if (actorData.specialProperties?.damageReduction) damageReduction = actorData.specialProperties.damageReduction.value;
		if (damage > 1) damage -= damageReduction;

		switch (actor.type){
			case "actorPc":
			case "actorSpirit":
				if (options.damage.matrix.value > 0) {
					damage = options.damage.matrix.value;
					damageType = "stun";
				}
				if (damageType === "stun") {
					actorData.conditionMonitors.stun.actual.base += damage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors[damageType].actual, 0);
					if (actorData.conditionMonitors.stun.actual.value > actorData.conditionMonitors.stun.value){
						realDamage = damage - (actorData.conditionMonitors.stun.actual.value - actorData.conditionMonitors.stun.value);
					} else realDamage = damage;        
				} else if (damageType === "physical") {
					actorData.conditionMonitors.physical.actual.base += damage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors[damageType].actual, 0);
					if (actorData.conditionMonitors.physical.actual.value > actorData.conditionMonitors.physical.value) {
						realDamage = damage - (actorData.conditionMonitors.physical.actual.value - actorData.conditionMonitors.physical.value);
					} else realDamage = damage ;
				}
				if (realDamage > 0) ui.notifications.info(`${realActor.name}: ${realDamage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);

				if (actorData.conditionMonitors.stun.actual.value > actorData.conditionMonitors.stun.value) {
					let carriedDamage = actorData.conditionMonitors.stun.actual.value - actorData.conditionMonitors.stun.value;
					actorData.conditionMonitors.physical.actual.base += carriedDamage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.physical.actual, 0);
					actorData.conditionMonitors.stun.actual.base = actorData.conditionMonitors.stun.value;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.stun.actual, 0);
					ui.notifications.info(`${realActor.name}: ${carriedDamage}${game.i18n.localize(SR5.damageTypesShort.physical)} ${game.i18n.localize("SR5.Applied")}.`);
				}

				if ((actorData.conditionMonitors.physical.actual.value > actorData.conditionMonitors.physical.value) && actorData.type === "actorPc") {
					let carriedDamage = actorData.conditionMonitors.physical.actual.value - actorData.conditionMonitors.physical.value;
					actorData.conditionMonitors.overflow.actual.base += carriedDamage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.overflow.actual, 0);
					actorData.conditionMonitors.physical.actual.base = actorData.conditionMonitors.physical.value;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.physical.actual, 0);
					if (actorData.conditionMonitors.overflow.actual.value > actorData.conditionMonitors.overflow.value){
						actorData.conditionMonitors.overflow.actual.base = actorData.conditionMonitors.overflow.value;
						SR5_EntityHelpers.updateValue(actorData.conditionMonitors.overflow.actual, 0);
					}
				}
				break;
			case "actorGrunt":
				actorData.conditionMonitors.condition.actual.base += damage;
				SR5_EntityHelpers.updateValue(actorData.conditionMonitors.condition.actual, 0);
				ui.notifications.info(`${realActor.name}: ${damage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);
				break;
			case "actorDrone":
				if (damageType === "physical") {
					actorData.conditionMonitors.condition.actual.base += damage;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.condition.actual, 0);
					ui.notifications.info(`${realActor.name}: ${damage}${game.i18n.localize(SR5.damageTypesShort[damageType])} ${game.i18n.localize("SR5.Applied")}.`);
					if (actorData.controlMode === "rigging"){
						let controler = SR5_EntityHelpers.getRealActorFromID(actorData.vehicleOwner.id);
						let chatData = SR5_PrepareRollTest.getBaseRollData(null, controler);
						chatData.damage.resistanceType = "biofeedback";
						chatData.damage.value = Math.ceil(damage/2);
						chatData.owner.messageId = options.owner.messageId;
						controler.rollTest("resistanceCard", null, chatData);
					}
				}
				if (options.damage.element === "electricity") options.damage.matrix.value = Math.floor(options.damage.value / 2);
				if (options.damage.matrix.value > 0) {
					actorData.conditionMonitors.matrix.actual.base += options.damage.matrix.value;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.matrix.actual, 0);
					ui.notifications.info(`${realActor.name}: ${options.damage.matrix.value} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
				}
				break;
			case "actorAgent":
			case "actorSprite":
			case "actorDevice":
				if (options.damage.matrix.value > 0) {
					actorData.conditionMonitors.matrix.actual.base += options.damage.matrix.value;
					SR5_EntityHelpers.updateValue(actorData.conditionMonitors.matrix.actual, 0);
					ui.notifications.info(`${realActor.name}: ${options.damage.matrix.value} ${game.i18n.localize("SR5.AppliedMatrixDamage")}.`);
				}
				break;
		}

		await realActor.update({system: actorData});

		//Status
		switch (actor.type){
			case "actorPc":
			case "actorSpirit":
				if (actorData.conditionMonitors.physical.actual.value >= actorData.conditionMonitors.physical.value) await SR5_ActorHelper.createDeadEffect(actorId);
				else if (actorData.conditionMonitors.stun.actual.value >= actorData.conditionMonitors.stun.value) await SR5_ActorHelper.createKoEffect(actorId);
				else if ((damage > (actorData.limits.physicalLimit.value + gelAmmo) || damage >= 10)
				  && actorData.conditionMonitors.stun.actual.value < actorData.conditionMonitors.stun.value
				  && actorData.conditionMonitors.physical.actual.value < actorData.conditionMonitors.physical.value) await SR5_ActorHelper.createProneEffect(actorId, damage, gelAmmo);
				break;
			case "actorGrunt":        
				if (actorData.conditionMonitors.condition.actual.value >= actorData.conditionMonitors.condition.value) await SR5_ActorHelper.createDeadEffect(actorId);
				else if (damage > (actorData.limits.physicalLimit.value + gelAmmo) || damage >= 10){ await SR5_ActorHelper.createProneEffect(actorId, damage, gelAmmo);}
			case "actorDrone":
				if (actorData.conditionMonitors.condition.actual.value >= actorData.conditionMonitors.condition.value) await SR5_ActorHelper.createDeadEffect(actorId);
				break;
			case "actorSprite":
			case "actorDevice":
				if (actorData.conditionMonitors.matrix.actual.value >= actorData.conditionMonitors.matrix.value) await SR5_ActorHelper.createDeadEffect(actorId);
				break;
		}

		//Special Element Damage
		if (options.damage.element === "electricity" && actorData.type !== "actorDrone") await SR5_ActorHelper.electricityDamageEffect(actorId);
		if (options.damage.element === "anticoagulant" && actorData.type !== "actorDrone") await SR5_ActorHelper.anticoagulantDamageEffect(actorId);
		if (options.damage.element === "acid") await SR5_ActorHelper.acidDamageEffect(actorId, damage, options.damage.source);
		if (options.damage.element === "fire"){
			if (actorData.itemsProperties.armor.value <= 0) await SR5_ActorHelper.fireDamageEffect(actorId)
			else await SR5_ActorHelper.checkIfCatchFire(actorId, options.threshold.value, options.damage.source, options.combat.armorPenetration);
		}
	}

	static async _socketTakeDamage(message){
		await SR5_ActorHelper.takeDamage(message.data.actorId, message.data.options);
	}

    //Handle prone effect
	static async createProneEffect(actorId, damage, gelAmmo, duration, source){
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
            actorData = actor.system;
            
		for (let e of actor.effects){
			if (e.flags.core?.statusId === "prone") return;
		}

		//Currently, if duration is null, prone is comming from Damage
		if (!duration){
			duration = {
				type: "special",
				duration: 0,
			}
			source = "damage"
		}

		let effect = {
			name: `${game.i18n.localize("SR5.STATUSES_Prone")}`,
			type: "itemEffect",
			"system.type": "prone",
			"system.source": source,
			"system.target": game.i18n.localize("SR5.Special"),
			"system.value": 0,
			"system.durationType": duration.type,
			"system.duration": duration.duration,
		}

		let statusEffect = await _getSRStatusEffect("prone");
		await actor.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
		await actor.createEmbeddedDocuments("Item", [effect]);
		if (damage >= 10) ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_DamageDropProneTen", {damage: damage})}`);
		else if (gelAmmo < 0) ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_DamageDropProneGel", {damage: damage, limit: actorData.limits.physicalLimit.value})}`);
		else if (damage > 0) ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_DamageDropProne", {damage: damage, limit: actorData.limits.physicalLimit.value})}`);
		else ui.notifications.info(`${actor.name} ${game.i18n.format("SR5.INFO_DropProne")}`);
	}

    //Handle death effect
	static async createDeadEffect(actorId){
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		for (let e of actor.effects){
			if (e.flags.core?.statusId === "dead") return;
		}
		let effect = await _getSRStatusEffect("dead");
		await actor.createEmbeddedDocuments('ActiveEffect', [effect]);
		ui.notifications.info(`${actor.name}: ${game.i18n.localize("SR5.INFO_DamageActorDead")}`);
	}

	//Handle ko effect
	static async createKoEffect(actorId){
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		for (let e of actor.effects){
			if (e.flags.core?.statusId === "unconscious") return;
		}
		let effect = await _getSRStatusEffect("unconscious")
		await actor.createEmbeddedDocuments('ActiveEffect', [effect]);
		ui.notifications.info(`${actor.name}: ${game.i18n.localize("SR5.INFO_DamageActorKo")}`);
	}

    //Handle Elemental Damage : Electricity
	static async electricityDamageEffect(actorId){
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let existingEffect = actor.items.find((item) => item.type === "itemEffect" && item.system.type === "electricityDamage");

		if (existingEffect){
			let updatedEffect = existingEffect.toObject(false);
			updatedEffect.system.duration += 1;
			await actor.updateEmbeddedDocuments("Item", [updatedEffect]);
			ui.notifications.info(`${actor.name}: ${existingEffect.name} ${game.i18n.localize("SR5.INFO_DurationExtendOneRound")}.`);
		} else {
			let effect = {
				name: `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageElectricity")})`,
				type: "itemEffect",
				"system.type": "electricityDamage",
				"system.target": game.i18n.localize("SR5.GlobalPenalty"),
				"system.value": -1,
				"system.durationType": "round",
				"system.duration": 1,
				"system.customEffects": {
					"0": {
							"category": "penaltyTypes",
							"target": "system.penalties.special.actual",
							"type": "value",
							"value": -1,
							"forceAdd": true,
					}
				}
			}
			ui.notifications.info(`${actor.name}: ${effect.name} ${game.i18n.localize("SR5.Applied")}.`);
			await SR5Combat.changeInitInCombatHelper(actorId, -5);
			await actor.createEmbeddedDocuments("Item", [effect]);

			let statusEffect = await _getSRStatusEffect("electricityDamage");
			await actor.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
		}
	}

	//Handle Special Damage : Anticoagulant
	static async anticoagulantDamageEffect(actorId){
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let existingEffect = actor.items.find((item) => item.type === "itemEffect" && item.system.type === "anticoagulantDamage");

		if (existingEffect) return ;

			let effect = {
				name: `${game.i18n.localize("SR5.Anticoagulant")}`,
				type: "itemEffect",
				"system.type": "anticoagulantDamage",
				"system.target": game.i18n.localize("SR5.ConditionMonitorStunShort"),
				"system.value": -2,
				"system.durationType": "minute",
				"system.duration": 1,
				"system.gameEffect": game.i18n.localize("SR5.Anticoagulant_GE")
			}

			ui.notifications.info(`${actor.name}: ${effect.name} ${game.i18n.localize("SR5.Applied")}.`);
			await SR5Combat.changeInitInCombatHelper(actorId, -5);
			await actor.createEmbeddedDocuments("Item", [effect]);

			let statusEffect = await _getSRStatusEffect("anticoagulantDamage");
			await actor.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
	}

    //Handle Elemental Damage : Acid
	static async acidDamageEffect(actorId, damage, source){
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let existingEffect = actor.items.find((item) => item.type === "itemEffect" && item.system.type === "acidDamage");
        if (existingEffect) return;

		let armor = actor.items.find((item) => item.type === "itemArmor" && item.system.isActive && !item.system.isAccessory);
		if (armor){
			let updatedArmor = armor.toObject(false);
			let armorEffect = {
				"name": `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageAcid")})`,
				"target": "system.armorValue",
				"wifi": false,
				"type": "value",
				"value": -1,
				"multiplier": 1
			}
			updatedArmor.system.itemEffects.push(armorEffect);
			await actor.updateEmbeddedDocuments("Item", [updatedArmor]);
			ui.notifications.info(`${actor.name}: ${game.i18n.format("SR5.INFO_AcidReduceArmor", {armor: armor.name})}`);
		}

		let duration;
		if (source === "spell") duration = 1;
		else duration = damage;
		let effect = {
			name: `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageAcid")})`,
			type: "itemEffect",
			"system.type": "acidDamage",
			"system.target": `${game.i18n.localize("SR5.Armor")}, ${game.i18n.localize("SR5.Damage")}`,
			"system.value": damage,
			"system.durationType": "round",
			"system.duration": duration,
		}
		
        ui.notifications.info(`${actor.name}: ${effect.name} ${game.i18n.localize("SR5.Applied")}.`);
		await SR5Combat.changeInitInCombatHelper(actorId, -5);
		await actor.createEmbeddedDocuments("Item", [effect]);

		let statusEffect = await _getSRStatusEffect("acidDamage");
		await actor.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
	}

    //Handle Elemental Damage : Fire
    static async fireDamageEffect(actorId){
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
        let existingEffect = actor.items.find((item) => item.type === "itemEffect" && item.system.type === "fireDamage");
        if (existingEffect) return;

        let effect = {
            name: `${game.i18n.localize("SR5.ElementalDamage")} (${game.i18n.localize("SR5.ElementalDamageFire")})`,
            type: "itemEffect",
            "system.type": "fireDamage",
            "system.target": game.i18n.localize("SR5.PenaltyValuePhysical"),
            "system.value": 3,
            "system.durationType": "special",
            "system.duration": 0,
        }
        ui.notifications.info(`${actor.name}: ${effect.name} ${game.i18n.localize("SR5.Applied")}.`);
        await actor.createEmbeddedDocuments("Item", [effect]);

        let statusEffect = await _getSRStatusEffect("fireDamage");
        await actor.createEmbeddedDocuments('ActiveEffect', [statusEffect]);
    }

    //Check if an actor catch fire
    static async checkIfCatchFire (actorId, firethreshold, source, force){
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
        let ap = (source === "spell") ? force : -6;
        let fireType = (source === "spell") ? "fireMagical" : "fire";
        
        let rollInfo = SR5_PrepareRollTest.getBaseRollData(null, actor);
        rollInfo.threshold.type = fireType;
        rollInfo.combat.armorPenetration = ap;
        rollInfo.threshold.value = firethreshold;

        actor.rollTest("resistFire", null, rollInfo);
    }

    //Raise owerwatch score
    static async overwatchIncrease(defenseHits, actorId) {
        let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
        let actorData = duplicate(actor.system);

        if (actorData.matrix.overwatchScore === null) actorData.matrix.overwatchScore = 0;
        actorData.matrix.overwatchScore += defenseHits;
        actor.update({system: actorData});
        ui.notifications.info(`${actor.name}, ${game.i18n.localize("SR5.OverwatchScoreActual")} ${actorData.matrix.overwatchScore}`);
    }

    //Socket for increasing overwatch score;
    static async _socketOverwatchIncrease(message) {
        await SR5_ActorHelper.overwatchIncrease(message.data.defenseHits, message.data.actorId);
    }

    //Delete Marks on Other actors
	static async deleteMarksOnActor(actorData, actorId){
		for (let m of actorData.matrix.markedItems){
			let itemToClean = await fromUuid(m.uuid);
			if (itemToClean) {
				let cleanData = duplicate(itemToClean.system);
				for (let i = 0; i < cleanData.marks.length; i++){
					if (cleanData.marks[i].ownerId === actorId) {
						cleanData.marks.splice(i, 1);
						i--;
					}
				}
				await itemToClean.update({"system" : cleanData});
				//For Host, keep slaved device marks synchro
				if (itemToClean.parent.system.matrix.deviceType === "host") SR5_MarkHelpers.markSlavedDevice(itemToClean.parent.id);
			} else {
				SR5_SystemHelpers.srLog(1, `No Item to Clean in deleteMarksOnActor()`);
			}
		}
	}

	//Socket for deletings marks on other actors;
	static async _socketDeleteMarksOnActor(message) {
		await SR5_ActorHelper.deleteMarksOnActor(message.data.actorData, message.data.actorId);
	}

    //Delete Mark info from deck
	static async deleteMarkInfo(actorId, item){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		if (!actor) return SR5_SystemHelpers.srLog(1, `No Actor in deleteMarkInfo()`);

		let deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive),
			deckData = duplicate(deck.system),
			index=0;

		for (let m of deckData.markedItems){
			if (m.uuid.includes(item)){
				deckData.markedItems.splice(index, 1);
				index--;
			}
			index++;
		}

		await deck.update({"system": deckData});

		//For host, update all unlinked token with same marked items
		if (actor.system.matrix.deviceType === "host" && canvas.scene){
			for (let token of canvas.tokens.placeables){
				if (token.actor.id === actorId) {
					let tokenDeck = token.actor.items.find(i => i.type === "itemDevice" && i.system.isActive);
					let tokenDeckData = duplicate(tokenDeck.system);
					tokenDeckData.markedItems = deckData.markedItems;
					await tokenDeck.update({"system": tokenDeckData});
				}
			}
		}
	}

	//Socket for deletings marks info other actors;
	static async _socketDeleteMarkInfo(message) {
		await SR5_ActorHelper.deleteMarkInfo(message.data.actorId, message.data.item);
	}

    //Create a Sidekick
	static async createSidekick(item, userId, actorId){
        let permissionPath, petType, img,
		    itemData = item.system,
		    ownerActor = SR5_EntityHelpers.getRealActorFromID(actorId);

		if (item.type === "itemSpirit") petType = "actorSpirit";
		else if (item.type === "itemVehicle") petType = "actorDrone";
		else if (item.type === "itemSprite") petType = "actorSprite";
        else if (item.type === "itemProgram") petType = "actorAgent";

		if (item.img === `systems/sr5/img/items/${item.type}.svg`) img = `systems/sr5/img/actors/${petType}.svg`;
		else img = item.img;

		// Handle base data for Actor Creation
		let sideKickData = {
			"name": item.name,
			"type": petType,
			"img": img,
		};

		// Give permission to player
		if (userId) {
			permissionPath = 'permission.' + userId;
			sideKickData = mergeObject(sideKickData, {[permissionPath]: 3,});
		}

		// Handle specific data for Actor creation
		if (item.type === "itemSpirit") {
			let baseItems = await SR5_CompendiumUtility.getBaseItems("actorSpirit", itemData.type, itemData.itemRating);
			baseItems = await SR5_CompendiumUtility.addOptionalSpiritPowersFromItem(baseItems, itemData.optionalPowers);

			for (let power of baseItems){
				if (power.system.systemEffects.length){
					for (let syseffect of power.system.systemEffects){
						if (syseffect.value === "noxiousBreath" && power.type === "itemPower"){
							let newWeapon = await SR5_CompendiumUtility.getWeaponFromCompendium("noxiousBreath");
							if (newWeapon) baseItems.push(newWeapon);
						}
						if (syseffect.value === "corrosiveSpit" && power.type === "itemPower"){
							let newWeapon = await SR5_CompendiumUtility.getWeaponFromCompendium("corrosiveSpit", itemData.itemRating);
							if (newWeapon) baseItems.push(newWeapon);
						}
					}
				}
			}

			sideKickData = mergeObject(sideKickData, {
				"system.type": itemData.type,
				"system.force.base": itemData.itemRating,
				"system.isBounded": itemData.isBounded,
				"system.services.value": itemData.services.value,
				"system.services.max": itemData.services.max,
				"system.summonerMagic": itemData.summonerMagic,
				"system.creatorId": actorId,
				"system.creatorItemId": item._id,
				"system.magic.tradition": itemData.magic.tradition,
				"system.conditionMonitors.physical.actual": itemData.conditionMonitors.physical.actual,
				"system.conditionMonitors.stun.actual": itemData.conditionMonitors.stun.actual,
				"items": baseItems,
			});
		}

		if (item.type === "itemSprite") {
			let baseItems = await SR5_CompendiumUtility.getBaseItems("actorSprite", itemData.type, itemData.itemRating);
			for (let deck of itemData.decks) {
				deck.system.marks = [];
				baseItems.push(deck);
			}

			sideKickData = mergeObject(sideKickData, {
				"system.type": itemData.type,
				"system.level": itemData.itemRating,
				"system.isRegistered": itemData.isRegistered,
				"system.tasks.value": itemData.tasks.value,
				"system.tasks.max": itemData.tasks.max,
				"system.compilerResonance": itemData.compilerResonance,
				"system.creatorId": actorId,
				"system.creatorItemId": item._id,
				"system.conditionMonitors.matrix.actual": itemData.conditionMonitors.matrix.actual,
				"items": baseItems,
			});
		}

		if (item.type === "itemProgram") {
			let baseItems = [];
			let ownerDeck = ownerActor.items.find(i => i.type === "itemDevice" && i.system.isActive);
			if(!ownerDeck) return;
			for (let deck of itemData.decks) {
				deck.system.marks = [];
				baseItems.push(deck);
			}

			let creatorData = SR5_EntityHelpers.getRealActorFromID(actorId);
			creatorData = creatorData.toObject(false);
			sideKickData = mergeObject(sideKickData, {
				"system.creatorId": actorId,
				"system.creatorItemId": item._id,
				"system.creatorData": creatorData,
				"system.conditionMonitors.matrix": ownerDeck.system.conditionMonitors.matrix,
				"system.rating": itemData.itemRating,
				"items": baseItems,
			});
		}

		if (item.type === "itemVehicle") {
			let baseItems = [];
			for (let autosoft of itemData.autosoft) baseItems.push(autosoft);
			for (let ammo of itemData.ammunitions) baseItems.push(ammo);
			for (let weapon of itemData.weapons) baseItems.push(weapon);
			for (let armor of itemData.armors) baseItems.push(armor);
			for (let vehicleMod of itemData.vehiclesMod) baseItems.push(vehicleMod);
			for (let deck of itemData.decks) {
				deck.system.marks = [];
				baseItems.push(deck);
			}
			let ownerActorObject = ownerActor.toObject(false);

			sideKickData = mergeObject(sideKickData, {
				"system.creatorId": actorId,
				"system.creatorItemId": item._id,
				"system.type": itemData.type,
				"system.model": itemData.model,
				"system.attributes.handling.natural.base": itemData.attributes.handling,
				"system.attributes.handlingOffRoad.natural.base": itemData.attributes.handlingOffRoad,
				"system.attributes.secondaryPropulsionHandling.natural.base": itemData.secondaryPropulsion.handling,
				"system.attributes.secondaryPropulsionHandlingOffRoad.natural.base": itemData.secondaryPropulsion.handlingOffRoad,
				"system.attributes.speed.natural.base": itemData.attributes.speed,
				"system.attributes.speedOffRoad.natural.base": itemData.attributes.speedOffRoad,
				"system.attributes.secondaryPropulsionSpeed.natural.base": itemData.secondaryPropulsion.speed,
				"system.attributes.acceleration.natural.base": itemData.attributes.acceleration,
				"system.attributes.accelerationOffRoad.natural.base": itemData.attributes.accelerationOffRoad,
				"system.attributes.secondaryPropulsionAcceleration.natural.base": itemData.secondaryPropulsion.acceleration,
				"system.attributes.body.natural.base": itemData.attributes.body,
				"system.attributes.armor.natural.base": itemData.attributes.armor,
				"system.attributes.pilot.natural.base": itemData.attributes.pilot,
				"system.attributes.sensor.natural.base": itemData.attributes.sensor,
				"system.attributes.seating.natural.base": itemData.seating,
				"system.modificationSlots.powerTrain.base": itemData.modificationSlots.powerTrain,
				"system.modificationSlots.protection.base": itemData.modificationSlots.protection,
				"system.modificationSlots.weapons.base": itemData.modificationSlots.weapons,
				"system.modificationSlots.extraWeapons": itemData.modificationSlots.extraWeapons,
				"system.modificationSlots.extraBody": itemData.modificationSlots.extraBody,
				"system.modificationSlots.body.base": itemData.modificationSlots.body,
				"system.modificationSlots.electromagnetic.base": itemData.modificationSlots.electromagnetic,
				"system.modificationSlots.cosmetic.base": itemData.modificationSlots.cosmetic,
				"system.conditionMonitors.condition.actual": itemData.conditionMonitors.condition.actual,
				"system.conditionMonitors.matrix.actual": itemData.conditionMonitors.matrix.actual,
				"system.isSecondaryPropulsion": itemData.secondaryPropulsion.isSecondaryPropulsion,
				"system.secondaryPropulsionType": itemData.secondaryPropulsion.type,
				"system.pilotSkill": itemData.pilotSkill,
				"system.riggerInterface": itemData.riggerInterface,
				"system.offRoadMode": itemData.offRoadMode,
				"system.price": itemData.price.base,
				"system.slaved": itemData.slaved,
				"system.isSlavedToPan": itemData.isSlavedToPan,
				"system.panMaster": itemData.panMaster,
				"system.vehicleOwner.id": actorId,
				"system.vehicleOwner.name": ownerActor.name,
				"system.vehicleOwner.system": ownerActorObject.system,
				"system.vehicleOwner.items": ownerActorObject.items,
				"system.controlMode": itemData.controlMode,
				"items": baseItems,
			});
		}

		let originalItem = ownerActor.getEmbeddedDocument("Item", item._id);
		await originalItem.update({"system.isCreated": true,});

		//Create actor
		await Actor.createDocuments([sideKickData]);
	}

	//Socket for creating sidekick;
	static async _socketCreateSidekick(message) {
		await SR5_ActorHelper.createSidekick(message.data.item, message.data.userId, message.data.actorId);
	}

	//Dismiss sidekick : update his parent item and then delete actor
	static async dimissSidekick(actor){
		let ownerActor = SR5_EntityHelpers.getRealActorFromID(actor.system.creatorId);
		let item = ownerActor.getEmbeddedDocument("Item", actor.system.creatorItemId);
		let modifiedItem = duplicate(item);

		if (actor.type === "actorSpirit"){
			modifiedItem.img = actor.img;
			modifiedItem.system.services.value = actor.system.services.value;
			modifiedItem.system.services.max = actor.system.services.max;
			modifiedItem.system.conditionMonitors.physical.actual = actor.system.conditionMonitors.physical.actual;
			modifiedItem.system.conditionMonitors.stun.actual = actor.system.conditionMonitors.stun.actual;
			modifiedItem.system.isBounded = actor.system.isBounded;
			modifiedItem.system.isCreated = false;
			await item.update(modifiedItem);
		}

		if (actor.type === "actorSprite"){
			let decks = [];
			for (let a of actor.items){
				if (a.type === "itemDevice") decks.push(a);
			}
			modifiedItem.img = actor.img;
			modifiedItem.system.decks = decks;
			modifiedItem.system.tasks.value = actor.system.tasks.value;
			modifiedItem.system.tasks.max = actor.system.tasks.max;
			modifiedItem.system.conditionMonitors.matrix.actual = actor.system.conditionMonitors.matrix.actual;
			modifiedItem.system.isRegistered = actor.system.isRegistered;
			modifiedItem.system.isCreated = false;
			item.update(modifiedItem);
		}

		if (actor.type === "actorAgent"){
		    let decks = [];
			for (let a of actor.items){
				if (a.type === "itemDevice") decks.push(a);
			}
			modifiedItem.img = actor.img;
			modifiedItem.system.decks = decks;
			item.update(modifiedItem);
		}

		if (actor.type === "actorDrone"){
			let autosoft = [],
				weapons = [],
				ammunitions = [],
				armors = [],
				decks = [],
				vehiclesMod = [];
			for (let a of actor.items){
				if (a.type === "itemProgram") autosoft.push(a);
				if (a.type === "itemWeapon") weapons.push(a);
				if (a.type === "itemAmmunition") ammunitions.push(a);
				if (a.type === "itemArmor") armors.push(a);
				if (a.type === "itemDevice") decks.push(a);
				if (a.type === "itemVehicleMod") vehiclesMod.push(a);
			}
			modifiedItem.img = actor.img;
			modifiedItem.system.autosoft = autosoft;
			modifiedItem.system.weapons = weapons;
			modifiedItem.system.ammunitions = ammunitions;
			modifiedItem.system.armors = armors;
			modifiedItem.system.decks = decks;
			modifiedItem.system.vehiclesMod = vehiclesMod;
			modifiedItem.system.model = actor.system.model;
			modifiedItem.system.slaved = actor.system.slaved;
			modifiedItem.system.controlMode = actor.system.controlMode;
			modifiedItem.system.riggerInterface = actor.system.riggerInterface;
			modifiedItem.system.offRoadMode = actor.system.offRoadMode; 
			modifiedItem.system.attributes.handling = actor.system.attributes.handling.natural.base;
			modifiedItem.system.attributes.handlingOffRoad = actor.system.attributes.handlingOffRoad.natural.base;
			modifiedItem.system.secondaryPropulsion.handling = actor.system.attributes.secondaryPropulsionHandling.natural.base;
			modifiedItem.system.secondaryPropulsion.handlingOffRoad = actor.system.attributes.secondaryPropulsionHandlingOffRoad.natural.base;
			modifiedItem.system.attributes.speed = actor.system.attributes.speed.natural.base;
			modifiedItem.system.attributes.speedOffRoad = actor.system.attributes.speedOffRoad.natural.base;
			modifiedItem.system.secondaryPropulsion.speed = actor.system.attributes.secondaryPropulsionSpeed.natural.base;
			modifiedItem.system.attributes.acceleration = actor.system.attributes.acceleration.natural.base;
			modifiedItem.system.attributes.accelerationOffRoad = actor.system.attributes.accelerationOffRoad.natural.base;
			modifiedItem.system.secondaryPropulsion.acceleration = actor.system.attributes.secondaryPropulsionAcceleration.natural.base;
			modifiedItem.system.attributes.body = actor.system.attributes.body.natural.base;
			modifiedItem.system.attributes.armor = actor.system.attributes.armor.natural.base;
			modifiedItem.system.attributes.pilot = actor.system.attributes.pilot.natural.base;
			modifiedItem.system.attributes.sensor = actor.system.attributes.sensor.natural.base;
			modifiedItem.system.seating = actor.system.attributes.seating.natural.base;
			modifiedItem.system.modificationSlots.powerTrain = actor.system.modificationSlots.powerTrain.base;
			modifiedItem.system.modificationSlots.protection = actor.system.modificationSlots.protection.base;
			modifiedItem.system.modificationSlots.weapons = actor.system.modificationSlots.weapons.base;
			modifiedItem.system.modificationSlots.extraWeapons = actor.system.modificationSlots.extraWeapons;
			modifiedItem.system.modificationSlots.extraBody = actor.system.modificationSlots.extraBody;
			modifiedItem.system.modificationSlots.body = actor.system.modificationSlots.body.base;
			modifiedItem.system.modificationSlots.electromagnetic = actor.system.modificationSlots.electromagnetic.base;
			modifiedItem.system.modificationSlots.cosmetic = actor.system.modificationSlots.cosmetic.base;
			modifiedItem.system.conditionMonitors.condition.actual = actor.system.conditionMonitors.condition.actual;
			modifiedItem.system.conditionMonitors.matrix.actual = actor.system.conditionMonitors.matrix.actual;
			modifiedItem.system.secondaryPropulsion.isSecondaryPropulsion = actor.system.isSecondaryPropulsion;
			modifiedItem.system.secondaryPropulsion.type = actor.system.secondaryPropulsionType;
			modifiedItem.system.isCreated = false;
			modifiedItem.img = actor.img;
			item.update(modifiedItem);
		}

		if (canvas.scene){
			for (let token of canvas.tokens.placeables) {
				if (token.document.actorId === actor._id) await token.document.delete();
			}
		}
		await Actor.deleteDocuments([actor._id]);
	}

	//Socket to dismiss sidekick;
	static async _socketDismissSidekick(message) {
		await SR5_ActorHelper.dimissSidekick(message.data.actor);
	}

    //Add item to actor's PAN
    static async addItemtoPan(targetItem, actorId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive),
			item = await fromUuid(targetItem),
			itemToAdd = item.toObject(false);

		itemToAdd.system.isSlavedToPan = true;
		itemToAdd.system.panMaster = actorId;
		await item.update({"system": itemToAdd.system});

		let currentPan = duplicate(deck.system.pan);
		let panObject = {
			"name": item.name,
			"uuid": targetItem,
		}
		currentPan.content.push(panObject);
		await deck.update({"system.pan": currentPan,});
	}

	static async _socketAddItemToPan(message){
		await SR5_ActorHelper.addItemtoPan(message.data.targetItem, message.data.actorId);
	}

    //Delete item from actor's PAN
	static async deleteItemFromPan(targetItem, actorId, index){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			deck = actor.items.find(d => d.type === "itemDevice" && d.system.isActive),
			item = await fromUuid(targetItem);

		if (!deck) return;

		if (item) {
			let newItem = duplicate(item.system);
			newItem.isSlavedToPan = false;
			newItem.panMaster = "";
			await item.update({"system": newItem,});
		}

		let currentPan = duplicate(deck.system.pan);
		if (index){
			currentPan.content.splice(index, 1);
		} else {
			index = 0;
			let isExisting;
			for (let p of currentPan.content){
				isExisting = await fromUuid(p.uuid);
				if (!isExisting){
					currentPan.content.splice(index, 1);
					index--;
				}
				index++;
			}
		}

		await deck.update({"system.pan": currentPan,});
	}

	static async _socketDeleteItemFromPan(message){
		await SR5_ActorHelper.deleteItemFromPan(message.data.targetItem, message.data.actorId, message.data.index);
	}

    //Update the source Item of an external Effect
	static async linkEffectToSource(actorId, targetItem, effectUuid){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			item = await fromUuid(targetItem),
			newItem = duplicate(item.system);

		if (newItem.duration === "sustained") newItem.isActive = true;
		if (item.type === "itemAdeptPower" || item.type === "itemPower") newItem.isActive = true;
		newItem.targetOfEffect.push(effectUuid);
		await item.update({"system": newItem});
	}

	static async _socketLinkEffectToSource(message){
		await SR5_ActorHelper.linkEffectToSource(message.data.actorId, message.data.targetItem, message.data.effectUuid);
	}

	static async deleteSustainedEffect(targetItem){
		let item = await fromUuid(targetItem);
		if (item) await item.parent.deleteEmbeddedDocuments("Item", [item.id]);
		else SR5_SystemHelpers.srLog(2, `No item to delete in deleteSustainedEffect()`);
	}

	static async _socketDeleteSustainedEffect(message){
		await SR5_ActorHelper.deleteSustainedEffect(message.data.targetItem);
	}

    //Delete an effect on an item when parent's ItemEffect is deleted
	static async deleteItemEffectFromItem(actorId, parentItemEffect){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			index, dataToUpdate;

		for (let i of actor.items){
			let needUpdate = false;
			if (i.system.itemEffects?.length){
				dataToUpdate = duplicate(i.system)
				index = 0;
				for (let e of dataToUpdate.itemEffects){
					if (e.ownerItem === parentItemEffect){
						dataToUpdate.itemEffects.splice(index, 1);
						needUpdate = true;
						index--;
					}
					index++;
				}
				if (needUpdate) await i.update({"system": dataToUpdate,});
			}
		}
	}

	//Delete an itemEffect when the activeEffect is deleted
	static async deleteItemEffectLinkedToActiveEffect(actorId, itemId){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		await actor.deleteEmbeddedDocuments("Item", [itemId]);
	}

    //Keep Agent condition Monitor synchro with Owner deck
	static async keepAgentMonitorSynchro(agent){
		if(!agent.system.creatorData) return SR5_SystemHelpers.srLog(1, `No CreatorData for Agent in keepAgentMonitorSynchro()`);
		if(!canvas.scene) return;
		
		let owner = SR5_EntityHelpers.getRealActorFromID(agent.system.creatorId);
		if (!owner) return SR5_SystemHelpers.srLog(1, `No Owner in keepAgentMonitorSynchro()`);
		let ownerDeck = owner.items.find(i => i.type === "itemDevice" && i.system.isActive);
		if (!ownerDeck) return SR5_SystemHelpers.srLog(1, `No Owner Deck in keepAgentMonitorSynchro()`);
		if (ownerDeck.system.conditionMonitors.matrix.actual.value !== agent.system.conditionMonitors.matrix.actual.value){
			let updatedActor = duplicate(agent.system);
			updatedActor.conditionMonitors.matrix = ownerDeck.system.conditionMonitors.matrix;
			await agent.update({"system": updatedActor,});
		}
	}

	//Keep Owner deck condition Monitor synchro with Agent
	static async keepDeckSynchroWithAgent(agent){
		let owner = SR5_EntityHelpers.getRealActorFromID(agent.system.creatorId);
		if (!owner) return SR5_SystemHelpers.srLog(1, `No Owner in keepDeckSynchroWithAgent()`);
		let ownerDeck = owner.items.find(i => i.type === "itemDevice" && i.system.isActive);
		if (!ownerDeck) return SR5_SystemHelpers.srLog(1, `No Owner Deck in keepDeckSynchroWithAgent()`);;
		if (ownerDeck.system.conditionMonitors.matrix.actual.value !== agent.system.conditionMonitors.matrix.actual.value){
			let newDeck = duplicate(ownerDeck.system);
			newDeck.conditionMonitors.matrix = agent.system.conditionMonitors.matrix;
			await ownerDeck.update({"system": newDeck});
		}
	}

	//Keep grunt edge synchro across unlinked tokens
	static async keepEdgeSynchroWithGrunt(document){
		if(!canvas.scene) return;
		for (let t of canvas.tokens.ownedTokens){
			if (t.document.actorId === document.id){
				let actor = SR5_EntityHelpers.getRealActorFromID(t.document.id);
				let updatedActor = duplicate(actor.system);
				updatedActor.conditionMonitors.edge = document.system.conditionMonitors.edge;
				actor.update({"system": updatedActor,});
			}
		}
	}

    //Manage Healing
	static async heal(targetActorID, data){
		let damageToRemove = data.roll.netHits,
			damageType = data.test.typeSub,
			targetActor = SR5_EntityHelpers.getRealActorFromID(targetActorID),
			actorData = deepClone(targetActor);
				
		actorData = actorData.toObject(false);
		actorData.system.conditionMonitors[damageType].actual.base -= damageToRemove;
		await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors[damageType].actual, 0);
		await targetActor.update({system: actorData.system});
	}

	//Manage Healing by socket
	static async _socketHeal(message){
		await SR5_ActorHelper.heal(message.data.targetActor, message.data.healData);
	}

	//Manage Regeneration
	static async regenerate(actorId, data){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let damageToRemove = data.roll.netHits;
		let actorData = deepClone(actor);
		actorData = actorData.toObject(false);

		if (actorData.type === "actorGrunt"){
			if (actorData.system.conditionMonitors.condition.actual.value > 0){
				actorData.system.conditionMonitors.condition.actual.base -= damageToRemove;
				damageToRemove -= actorData.system.conditionMonitors.condition.actual.value;
				await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors.condition.actual, 0);
			}
		} else {
			if (actorData.system.conditionMonitors.overflow.actual.value > 0){
				actorData.system.conditionMonitors.overflow.actual.base -= damageToRemove;
				damageToRemove -= actorData.system.conditionMonitors.overflow.actual.value;
				await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors.overflow.actual, 0);
			}
			if (actorData.system.conditionMonitors.physical.actual.value > 0 && damageToRemove > 0){
				actorData.system.conditionMonitors.physical.actual.base -= damageToRemove;
				damageToRemove -= actorData.system.conditionMonitors.physical.actual.value;
				await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors.physical.actual, 0);
			}
			if (actorData.system.conditionMonitors.stun.actual.value > 0 && damageToRemove > 0){
				actorData.system.conditionMonitors.stun.actual.base -= damageToRemove;
				damageToRemove -= actorData.system.conditionMonitors.stun.actual.value;
				await SR5_EntityHelpers.updateValue(actorData.system.conditionMonitors.stun.actual, 0);
			}
		}

		await actor.update({system: actorData.system});
	}

	//Apply an external effect to actor (such spell, complex form). Data is provided by chatMessage
	static async applyExternalEffect(actorId, data, effectType){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId);
		let item = await fromUuid(data.owner.itemUuid);
		let itemData = item.system;

		for (let e of Object.values(itemData[effectType])){
			if (e.transfer) {
				let value, key, newData;
				if (e.type === "hits") value = Math.floor(data.roll.hits * (e.multiplier || 1));
				else if (e.type === "netHits") value = Math.floor(data.roll.netHits * (e.multiplier || 1));
				else if (e.type === "value") value = Math.floor(e.value * (e.multiplier || 1));
				else if (e.type === "rating") value = Math.floor(item.system.itemRating * (e.multiplier || 1));

				//Handle heal effect
				if (e.target.includes("removeDamage")){
					key = e.target.replace('.removeDamage','');
					newData = actor.system;
					if(newData.conditionMonitors[key]){
						newData.conditionMonitors[key].actual.base -= value;
						SR5_EntityHelpers.updateValue(newData.conditionMonitors[key].actual, 0);
						await actor.update({"system": newData});
						continue;
					} else continue;
				}

				//Handle non resisted damage
				if (e.target.includes("addDamage")){
					key = e.target.replace('.addDamage','');
					newData = actor.system;
					if(newData.conditionMonitors[key]){
						newData.conditionMonitors[key].actual.base += value;
						SR5_EntityHelpers.updateValue(newData.conditionMonitors[key].actual, 0);
						await actor.update({"system": newData});
						continue;
					} else continue;
				}

				let targetName = SR5_EntityHelpers.getLabelByKey(e.target);

				//Create the itemEffect
				let itemEffect = {
					name: item.name,
					type: "itemEffect",
					"system.target": targetName,
					"system.value": value,
					"system.type": item.type,
					"system.ownerID": data.owner.actorId,
					"system.ownerName": data.owner.speakerActor,
					"system.ownerItem": data.owner.itemUuid,
					"system.duration": 0,
					"system.durationType": "sustained",
				};

				if (effectType === "customEffects"){
					itemEffect = mergeObject(itemEffect, {
						"system.customEffects": {
							"0": {
								"category": e.category,
								"target": e.target,
								"type": "value",
								"value": value,
								"forceAdd": true,
							}
						},
					});
				} else if (effectType === "itemEffects"){
					itemEffect = mergeObject(itemEffect, {
						"system.hasEffectOnItem": true,
					});
				}
				await actor.createEmbeddedDocuments("Item", [itemEffect]);

				//Link Effect to source owner
				let effect;
				if (actor.isToken) {
					for (let i of actor.token.actor.items){
						if (i.system.ownerItem === data.owner.itemUuid){
							if (!Object.keys(itemData.targetOfEffect).length) effect = i;
							else for (let e of Object.values(itemData.targetOfEffect)) if (e !== data.owner.itemUuid) effect = i;
						}
					}
				} else {
					for (let i of actor.items){
						if (i.system.ownerItem === data.owner.itemUuid){
							if (!Object.keys(itemData.targetOfEffect).length) effect = i;
							else for (let e of Object.values(itemData.targetOfEffect)) if (e !== data.owner.itemUuid) effect = i;
						}
					}
				}

				if (!game.user?.isGM) {
					SR5_SocketHandler.emitForGM("linkEffectToSource", {
						actorId: data.owner.actorId,
						targetItem: data.owner.itemUuid,
						effectUuid: effect.uuid,
					});
				} else {
					await SR5_ActorHelper.linkEffectToSource(data.owner.actorId, data.owner.itemUuid, effect.uuid);
				}

				//If effect is on Item, update it
				if (effectType === "itemEffects"){
					let itemToUpdate;
					//Find the item
					if (data.test.typeSub === "redundancy"){
						if (actor.isToken) itemToUpdate = actor.token.actor.items.find(d => d.type === "itemDevice" && d.system.isActive);
						else itemToUpdate = actor.items.find(d => d.type === "itemDevice" && d.system.isActive);
					}
					//Add effect to Item
					if (itemToUpdate){
						let newItem = itemToUpdate.toObject(false);
						let effectItem ={
							"name": itemData.name,
							"target": e.target,
							"wifi": false,
							"type": "value",
							"value": value,
							"multiplier": 1,
							"ownerItem": data.owner.itemUuid,
						}
						newItem.system.itemEffects.push(effectItem);
						await actor.updateEmbeddedDocuments("Item", [newItem]);
					}
				}
			}
		}
	}

	//Apply specific toxin effect
	static async applyToxinEffect(actorId, data){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			effects, status, isStatusEffectOn,
			toxinEffects = [],
			statusEffects = [];

		for (let [key, value] of Object.entries(data.damage.toxin.effect)){
			if (value) {
				effects = await SR5_CombatHelpers.getToxinEffect(key, data, actor);
				toxinEffects = toxinEffects.concat(effects);
				//Nausea Status Effect
				if (key === "nausea"){
					isStatusEffectOn = actor.effects.find(e => e.origin === "toxinEffectNausea");
					if (!isStatusEffectOn){
						status = await _getSRStatusEffect("toxinEffectNausea");
						statusEffects = statusEffects.concat(status);
					}
					if (data.damage.value > actor.system.attributes.willpower.augmented.value){
						isStatusEffectOn = actor.effects.find(e => e.origin === "noAction");
						if (!isStatusEffectOn){
							status = await _getSRStatusEffect("noAction");
							statusEffects = statusEffects.concat(status);
						}
					}
				}
				//Disorientation Status Effect
				if (key === "disorientation"){
					isStatusEffectOn = actor.effects.find(e => e.origin === "toxinEffectDisorientation");
					if (!isStatusEffectOn){
						status = await _getSRStatusEffect("toxinEffectDisorientation");
						statusEffects = statusEffects.concat(status);
					}
				}
				//Paralysis Status Effect
				if (key === "paralysis" && (data.damage.value > actor.system.attributes.reaction.augmented.value)){
					let isStatusEffectOn = actor.effects.find(e => e.origin === "noAction");
					if (!isStatusEffectOn){
						status = await _getSRStatusEffect("noAction");
						statusEffects = statusEffects.concat(status);
					}
				}
				//Agony Status Effect
				if (key === "agony" && (data.damage.value > actor.system.attributes.willpower.augmented.value)){
					let isStatusEffectOn = actor.effects.find(e => e.origin === "agony");
					if (!isStatusEffectOn){
						status = await _getSRStatusEffect("agony");
						statusEffects = statusEffects.concat(status);
					}
				}
			}
		}

		if (toxinEffects.length) await actor.createEmbeddedDocuments("Item", toxinEffects);
		if (statusEffects.length) await actor.createEmbeddedDocuments("ActiveEffect", statusEffects);
		if (data.damage.type && data.damage.value > 0) await actor.takeDamage(data);
	}

	static async applyCalledShotsEffect(actorId, data){
		let actor = SR5_EntityHelpers.getRealActorFromID(actorId),
			effects, status, weakSideEffect,
			cSEffects = [],
			statusEffects = [];

		if (typeof data.combat.calledShot.effects === "object") data.combat.calledShot.effects = Object.values(data.combat.calledShot.effects);

		for (let key of Object.values(data.combat.calledShot.effects)){
			//Special for stunned, skip
			if (key.name === "stunned") continue;

			//special for called shot linked to weak side effect
			if (data.combat.calledShot.effects.find(e => e.name === "weakSide") && (data.combat.calledShot.effects.find(e => e.name === "oneArmBandit") || data.combat.calledShot.effects.find(e => e.name === "brokenGrip"))) {
				data.combat.calledShot.effects = data.combat.calledShot.effects.filter(e => e.name !== "weakSide");
				weakSideEffect = true;
				if (key.name === "weakSide") continue;
			}

			//Get the itemEffect
			effects = await SR5_CalledShotHelpers.getCalledShotsEffect(key, data, actor, weakSideEffect);

			//Skip for "prone" effect as it is already applied by getCalledShotsEffect()
			if (key.name === "buckled" || key.name === "knockdown") continue;
			cSEffects = cSEffects.concat(effects);

			if (!actor.effects.find(e => e.origin === key.name)){
				status = await _getSRStatusEffect(key.name);
				statusEffects = statusEffects.concat(status);
				ui.notifications.info(`${actor.name}: ${status.label} ${game.i18n.localize("SR5.Applied")}.`);
			}
		}
	
		if (weakSideEffect){
			if (!actor.effects.find(e => e.origin === "weakSide") && (!statusEffects.find(s => s.origin === "weakSide")) ){
				status = await _getSRStatusEffect("weakSide");
				statusEffects = statusEffects.concat(status);
				ui.notifications.info(`${actor.name}: ${status.label} ${game.i18n.localize("SR5.Applied")}.`);
			}
		}

		if (cSEffects.length) await actor.createEmbeddedDocuments("Item", cSEffects);
		if (statusEffects.length) await actor.createEmbeddedDocuments("ActiveEffect", statusEffects);
	}
}