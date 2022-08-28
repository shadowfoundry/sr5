import { SR5_EntityHelpers } from "../helpers.js";
import { SR5_SystemHelpers } from "../../system/utilitySystem.js";
import { SR5 } from "../../config.js";

export class SR5_CompendiumUtility extends Actor {

	//Get compendium to search for Items
  	//Return an array of items
  	static async getItemCompendium(compendium) {
		let compendiumItems = []
		let language = await game.settings.get("core", "language");
		if (!language) SR5_SystemHelpers.srLog(0, "Could not determine core language used in getBaseItems()");

		let compendiumName = `sr5-Item-Full-${language}.${language}_${compendium}`;
		const compendiumPack = game.packs.find((p) => p.collection == compendiumName);
		if (!compendiumPack){
	  		SR5_SystemHelpers.srLog(1, `No compendium named '${compendiumName}' found, could not add items to actor`);
	  		return compendiumItems;
		} else {
	  		compendiumItems = await compendiumPack.getDocuments();
	  		return compendiumItems;
		}
  	}


	//Get base items
	static async getBaseItems(actorType, actorSubType, actorLevel) {
		let baseItems = [];
		
		let weapons = await SR5_CompendiumUtility.getItemCompendium("weapons");
		let powers = await SR5_CompendiumUtility.getItemCompendium("powers-creatures");
		let spritePowers = await SR5_CompendiumUtility.getItemCompendium("powers-sprites");
	
		if (actorType === "actorPc" || actorType === "actorGrunt"){
		  baseItems = await SR5_CompendiumUtility.findBaseItemInCompendium(baseItems, weapons, actorType);
		}
	
		if (actorType === "actorSpirit"){
		  baseItems = await SR5_CompendiumUtility.findBaseItemInCompendium(baseItems, weapons, actorSubType);
		  baseItems = await SR5_CompendiumUtility.findBaseSpiritPowersInCompendium(baseItems, powers, actorSubType);
		  baseItems = await SR5_CompendiumUtility.modifyBaseSpiritWeapon(baseItems, actorLevel);
		}
	
		if (actorType === "actorSprite"){
		  baseItems = await SR5_CompendiumUtility.findBaseItemInCompendium(baseItems, spritePowers, actorSubType);
		}
	
		return baseItems;
	  }
	
	  static async findBaseItemInCompendium(baseItems, compendium, actorType) {
		for (let i of compendium){
		  let systemEffects = i.data.data.systemEffects;
		  if (systemEffects.length){
			for (let systemEffect of Object.values(systemEffects)){
			  if ((systemEffect.category === "baseOwnItem") && (systemEffect.value === actorType)){
				let iObject = i.data.toObject(false);
				baseItems.push(iObject);
			  }
			}
		  }
		}
		return baseItems;
	  }
	
	  //Modify weapons based on Force for Spirit
	  static async modifyBaseSpiritWeapon(baseItems, force){
		for (let i of baseItems){
		  if (i.type === "itemWeapon"){
			i.data.damageValue.base = force*2;
			i.data.armorPenetration.base = -force;
			i.data.range.short.base = force;
			i.data.range.medium.base = force*2;
			i.data.range.long.base = force*3;
			i.data.range.extreme.base = force*4;
		  }
		}
	
		return baseItems;
	  }
	
	  // Find base powers of a spirit
	  static async findBaseSpiritPowersInCompendium(baseItems, compendium, spiritType) {
		let listName = `spiritBasePowers${spiritType}`;
		let list;
		for (let [key, value] of Object.entries(SR5)) {
		  	if (key === listName) list = value;
		}
		if (!list) return baseItems;
		
		for (let key of Object.keys(list)) {
		  	for (let i of compendium){
				let systemEffects = i.data.data.systemEffects;
				if (systemEffects.length){
			  		for (let systemEffect of Object.values(systemEffects)){
						if ((systemEffect.category === "spiritPower") && (systemEffect.value === key)){
				  			let iObject = i.data.toObject(false);
				  			baseItems.push(iObject);
						}
			  		}
				}
		  	}
		}
	
		return baseItems;
	}

	//Add optional powers to an array of existing powers based on an itemSpirit
	static async addOptionalSpiritPowersFromItem(baseItems, optionalPowers) {
		let powers = await SR5_CompendiumUtility.getItemCompendium("powers-creatures");
		
		for (let value of Object.values(optionalPowers)){
			if (value) {
				for (let i of powers){
					let systemEffects = i.data.data.systemEffects;
					if (systemEffects.length){
					  	for (let systemEffect of Object.values(systemEffects)){
							if ((systemEffect.category === "spiritPower") && (systemEffect.value === value)){
						  		let iObject = i.data.toObject(false);
						  		baseItems.push(iObject);
							}
					  	}
					}
				}
			}
		}
	
		return baseItems;
	}

	static async createItemFromArray(ItemArray){
		let baseItems = [];
		for (let i of ItemArray){
			baseItems.push(i);
		}
		return baseItems
	}
  
	//Get a particular item from a particular compendium
	static async getWeaponFromCompendium(weapon, force){
		let weapons = await SR5_CompendiumUtility.getItemCompendium("weapons");
		for (let i of weapons){
			let systemEffects = i.data.data.systemEffects;
			if (systemEffects.length){
				for (let systemEffect of Object.values(systemEffects)){
					if (systemEffect.value === weapon){
						let iObject = i.data.toObject(false);
						if (weapon === "corrosiveSpit"){
							i.data.damageValue.base = force*2;
							i.data.armorPenetration.base = -force;
						}
						return iObject;
					}
				}
			}
		}
	}
}