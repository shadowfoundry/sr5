import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "./diceHelper.js";
export default class SR5_RollDialog extends Dialog {

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = false;
        return options;
    }

    updateDicePoolValue(html) {
        let dicePoolModifier = 0;
        for (let value of Object.values(this.dicePoolModifier)){
            dicePoolModifier += value;
        }
        let modifiedDicePool = dicePoolModifier + parseInt(html.find('[name="baseDicePool"]')[0].value);
        this.data.data.dicePoolBase = parseInt(html.find('[name="baseDicePool"]')[0].value);
        if (modifiedDicePool < 0) modifiedDicePool = 0;
        html.find('[name="modifiedDicePool"]')[0].value = modifiedDicePool;
    }

    updateLimitValue(html) {
        if (html.find('[name="baseLimit"]')[0]){
            let limitModifier = 0;
            for (let value of Object.values(this.limitModifier)){
                limitModifier += value;
            }
            let modifiedLimit = limitModifier + parseInt(html.find('[name="baseLimit"]')[0].value)
            if (modifiedLimit < 0) modifiedLimit = 0;
            html.find('[name="modifiedLimit"]')[0].value = modifiedLimit;
            this.data.data.limitBase = parseInt(html.find('[name="baseLimit"]')[0].value);
        }
    }

    updateDrainValue(html) {
        this.data.data.force = parseInt(html.find('[name="force"]')[0].value);
        if (html.find('[name="drainValue"]')[0]){
            let drainModifier = this.data.data.drainMod.spell;
            for (let value of Object.values(this.drainModifier)){
                drainModifier += value;
            }
            let drainFinalValue = parseInt(html.find('[name="force"]')[0].value) + drainModifier;
            if (drainFinalValue < 2) drainFinalValue = 2
            html.find('[name="drainValue"]')[0].value = drainFinalValue;
            this.data.data.drainValue = drainFinalValue;
        }
    }

    updateFadingValue(html) {
        this.data.data.level = parseInt(html.find('[name="level"]')[0].value);
        if (html.find('[name="fadingValue"]')[0]){
            let fadingModifier = this.data.data.fadingModifier;
            for (let value of Object.values(this.fadingModifier)){
                fadingModifier += value;
            }
            let fadingFinalValue = parseInt(html.find('[name="level"]')[0].value) + fadingModifier;
            if (fadingFinalValue < 2) fadingFinalValue = 2
            html.find('[name="fadingValue"]')[0].value = fadingFinalValue;
            this.data.data.fadingValue = fadingFinalValue;
        }
    }

    updateMatrixNoise(html){
        let noiseValue = 0;
        let noiseRangeMod = SR5_DiceHelper.convertMatrixDistanceToDiceMod(html.find('[name="matrixRange"]')[0].value);
        this.data.data.dicePoolMod.matrixNoiseRange = noiseRangeMod;
        this.data.data.noiseRange = html.find('[name="matrixRange"]')[0].value;
        let sceneNoise = this.data.data.dicePoolMod.matrixNoiseScene || 0;  
        let noiseReduction = this.data.data.actor.data.matrix.attributes.noiseReduction.value;
        if (noiseReduction > (-noiseRangeMod - sceneNoise)) noiseReduction = (-noiseRangeMod - sceneNoise);
        if ((noiseRangeMod + sceneNoise) === 0) noiseReduction = 0;
        this.data.data.dicePoolMod.matrixNoiseReduction = noiseReduction;
        if (html.find('[name="matrixNoiseReduction"]')[0]) html.find('[name="matrixNoiseReduction"]')[0].value = noiseReduction;

        noiseValue = noiseRangeMod + sceneNoise + noiseReduction;
        if (noiseValue > 0) noiseValue = 0;
        this.dicePoolModifier.matrixNoise = noiseValue;
        
        html.find('[name="matrixNoiseRangeValue"]')[0].value = noiseRangeMod;
        if (html.find('[name="matrixSceneNoiseValue"]')[0]) html.find('[name="matrixSceneNoiseValue"]')[0].value = sceneNoise;
        html.find('[name="matrixNoise"]')[0].value = noiseValue;
        this.updateDicePoolValue(html);
    }

    calculRecoil(html){
        let firingModeValue;
        if (html.find('[name="firingMode"]')[0].value === "SS"){
            firingModeValue = 0;
            $(html).find(".hideBulletsRecoil").hide();
        } else firingModeValue = SR5_DiceHelper.convertModeToBullet(html.find('[name="firingMode"]')[0].value);
        this.data.data.firedAmmo = firingModeValue;
        html.find('[name="recoilBullets"]')[0].value = firingModeValue;
        html.find('[name="recoilCumulative"]')[0].value = this.data.data.actor.flags.sr5?.cumulativeRecoil || 0;
        if (this.data.data.item.data.recoilCompensation.value < 1) $(html).find(".hideWeaponRecoil").hide();
        if (this.data.data.actor.flags.sr5?.cumulativeRecoil < 1) $(html).find(".hideCumulativeRecoil").hide();
        let recoil = this.data.data.rc;
        let modifiedRecoil = recoil - firingModeValue;
        if (modifiedRecoil > 0) modifiedRecoil = 0;
        return modifiedRecoil || 0;
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.dicePoolModifier = {};
        this.limitModifier = {};
        this.drainModifier = {};
        this.fadingModifier = {};
        let actor = this.data.data.actor;

        if (html.find('[name="matrixSceneNoiseValue"]')[0]) this.updateMatrixNoise(html);
        this.updateDicePoolValue(html);
        this.updateLimitValue(html);
        if (document.getElementById("interval")) document.getElementById("interval").style.display = "none";
        

        if (html.find('[name="armor"]')[0]){
            this.dicePoolModifier.armorModifier = parseInt((html.find('[name="armor"]')[0].value || 0));
            this.updateDicePoolValue(html);
        }

        if (html.find('[name="incomingPA"]')[0]){
            let armorValue = parseInt((html.find('[name="armor"]')[0].value || 0));
            let incomingAP = parseInt((html.find('[name="incomingPA"]')[0].value || 0))
            let modifiedAP;
            if (armorValue >= -incomingAP) modifiedAP = incomingAP;
            else {
                let usedAP = armorValue + incomingAP;
                modifiedAP = incomingAP - usedAP;
            }
            this.dicePoolModifier.incomingAPModifier = modifiedAP;
            this.updateDicePoolValue(html);
        }

        // Various modifiers
        html.find('[name="dicePoolModVarious"]').change(ev => {
            this.dicePoolModifier.variousModifier = (parseInt(ev.target.value) || 0);
            this.data.data.dicePoolMod.various =  (parseInt(ev.target.value) || 0);
            this.updateDicePoolValue(html);
        });

        // Specialization modifier
        html.find(".specialization").change(ev => {
            if (ev.target.value) {
              html.find('[name="dicePoolModSpecialization"]')[0].value = 2;
              this.dicePoolModifier.specialization = 2;
              this.data.data.dicePoolMod.specialization = 2;
            } else {
              html.find('[name="dicePoolModSpecialization"]')[0].value = 0;
              this.dicePoolModifier.specialization = 0;
              this.data.data.dicePoolMod.specialization = 0;
            }
            this.updateDicePoolValue(html);
        });

        // Penalties modifiers
        html.find(".penaltyMod").change(ev => {
            html.find('[name="dicePoolModPenalty"]')[0].value = (parseInt(ev.target.value) || 0);
            this.data.data.dicePoolMod.penalty = (parseInt(ev.target.value) || 0)
            this.dicePoolModifier.penalties = (parseInt(ev.target.value) || 0);
            this.updateDicePoolValue(html);
        });

        // Attribute modifiers
        html.find(".attribute").change(ev => {
            let value = SR5_DiceHelper.getAttributeValue(ev.target.value, this.data.data.actor);
            html.find('[name="dicePoolModAttribute"]')[0].value = value;
            if (ev.target.value !== "none") this.data.data.attributeKey = ev.target.value;
            this.data.data.dicePoolMod.attribute = value;
            this.dicePoolModifier.attributeFirst = value;
            this.updateDicePoolValue(html);
        });

        // Incoming Firing Mode modifiers
        if (html.find('[name="incomingFiringMode"]')[0]){
            this.dicePoolModifier.incomingFiringMode = parseInt((html.find('[name="incomingFiringMode"]')[0].value || 0));
            this.data.data.dicePoolMod.defenseFiringMode = parseInt((html.find('[name="incomingFiringMode"]')[0].value || 0));
            this.updateDicePoolValue(html);
        }

        html.find(".incomingFiringMode").change(ev => {
            html.find('[name="dicePoolModDefenseFiringMode"]')[0].value = (parseInt(ev.target.value) || 0);
            this.data.data.dicePoolMod.defenseFiringMode = (parseInt(ev.target.value) || 0);
            this.dicePoolModifier.incomingFiringMode = (parseInt(ev.target.value) || 0);
            this.updateDicePoolValue(html);
        });

        // Defense modifiers
        html.find(".defenseMode").change(ev => {
            let value = SR5_DiceHelper.convertActiveDefenseToMod(html.find('[name="defenseMode"]')[0].value, this.data.data.activeDefenses);
            html.find('[name="dicePoolModDefenseActive"]')[0].value = value;
            this.data.data.dicePoolMod.defenseActive = value;
            this.data.data.activeDefenseMode = html.find('[name="defenseMode"]')[0].value;
            this.dicePoolModifier.defenseMode = value;
            this.updateDicePoolValue(html);
          });
    
        
        // Cumulative Defense 
        if (html.find('[name="dicePoolModDefenseCumulative"]')[0]){
            this.dicePoolModifier.cumulativeDefense = parseInt((html.find('[name="dicePoolModDefenseCumulative"]')[0].value || 0));
            this.data.data.dicePoolMod.defenseCumulative = parseInt((html.find('[name="dicePoolModDefenseCumulative"]')[0].value || 0));
            this.updateDicePoolValue(html);
        }

        // Cover modifiers
        html.find(".cover").change(ev => {
            html.find('[name="dicePoolModCover"]')[0].value = (parseInt(ev.target.value) || 0);
            this.data.data.dicePoolMod.defenseCover = (parseInt(ev.target.value) || 0);
            this.dicePoolModifier.cover = (parseInt(ev.target.value) || 0);
            this.updateDicePoolValue(html);
        });

        // Full Defense modifiers
        if (html.find(".fullDefense")){
            let fullDefenseEffect = actor.effects.find(e => e.origin === "fullDefense");
			let isInFullDefense = (fullDefenseEffect) ? true : false;
            if (isInFullDefense){
                html.find('[name="fullDefense"]')[0].value = this.data.data.defenseFull;
                html.find('[name="dicePoolModFullDefense"]')[0].value = this.data.data.defenseFull;
                this.data.data.dicePoolMod.defenseFull = this.data.data.defenseFull;
                this.dicePoolModifier.fullDefense = this.data.data.defenseFull;
                this.updateDicePoolValue(html);
            }
        }
        html.find(".fullDefense").change(ev => {
            html.find('[name="dicePoolModFullDefense"]')[0].value = (parseInt(ev.target.value) || 0);
            this.data.data.dicePoolMod.defenseFull = (parseInt(ev.target.value) || 0);
            this.dicePoolModifier.fullDefense = (parseInt(ev.target.value) || 0);
            this.updateDicePoolValue(html);
        });

        // Reach modifiers
        if (html.find('[name="reachValue"]')[0]){
            this.dicePoolModifier.range = parseInt((html.find('[name="reachValue"]')[0].value || 0));
            this.data.data.dicePoolMod.reach = parseInt((html.find('[name="reachValue"]')[0].value || 0));
            this.updateDicePoolValue(html);
        }

        // Environmental modifier 
        if (html.find('[name="dicePoolModEnvironmental"]')[0]){
            this.dicePoolModifier.environmental = parseInt((html.find('[name="dicePoolModEnvironmental"]')[0].value || 0));
            //this.data.data.dicePoolMod.defenseCumulative = parseInt((html.find('[name="dicePoolModDefenseCumulative"]')[0].value || 0));
            this.updateDicePoolValue(html);
        }

        // Range modifiers
        if (html.find('[name="dicePoolModRange"]')[0]){
            let baseRange = parseInt(html.find('[name="targetRange"]')[0].value);
            baseRange += this.data.data.actor.data.itemsProperties.environmentalMod.range.value;
            let rangevalue = SR5_DiceHelper.convertEnvironmentalModToDicePoolMod(baseRange);
            html.find('[name="dicePoolModRange"]')[0].value = rangevalue;
            this.dicePoolModifier.range = rangevalue;
            this.data.data.dicePoolMod.range = rangevalue;
            this.updateDicePoolValue(html);
        }
        
        html.find(".range").change(ev => {
            let baseRange = parseInt(html.find('[name="targetRange"]')[0].value);
            baseRange += this.data.data.actor.data.itemsProperties.environmentalMod.range.value;
            let rangevalue = SR5_DiceHelper.convertEnvironmentalModToDicePoolMod(baseRange);
            html.find('[name="dicePoolModRange"]')[0].value = rangevalue;
            this.dicePoolModifier.range = rangevalue;
            this.data.data.dicePoolMod.range = rangevalue;
            this.updateDicePoolValue(html);
        });

        // Recoil and firing mode
        if (html.find('[name="firingMode"]')[0]){
            let recoil = this.calculRecoil(html);
            this.data.data.firingMode = html.find('[name="firingMode"]')[0].value;
            html.find('[name="rcModifier"]')[0].value = recoil;
            this.dicePoolModifier.recoiCompensation = recoil;
            this.data.data.dicePoolMod.recoil = recoil;
            this.updateDicePoolValue(html);
        }

        html.find(".firingMode").change(ev => {
            this.data.data.firingMode = html.find('[name="firingMode"]')[0].value;
            let recoil = this.calculRecoil(html);
            html.find('[name="rcModifier"]')[0].value = recoil;
            this.dicePoolModifier.recoiCompensation = recoil;
            this.data.data.dicePoolMod.recoil = recoil;
            this.updateDicePoolValue(html);
        });

        html.find(".resetRecoil").click(event => {
            event.preventDefault();
            let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actor._id)
            actor.resetRecoil();
            this.data.data.rc += this.data.data.actor.flags.sr5.cumulativeRecoil;
            this.data.data.dicePoolMod.recoil = 0;
            this.data.data.actor.flags.sr5.cumulativeRecoil = 0;
            let recoil = this.calculRecoil(html);
            html.find('[name="rcModifier"]')[0].value = recoil;
            this.dicePoolModifier.recoiCompensation = recoil;
            this.updateDicePoolValue(html);
        });

        // Mark modifiers
        html.find(".mark").change(ev => {
            html.find('[name="dicePoolModMarkWanted"]')[0].value = -(parseInt(ev.target.value) || 0);
            this.data.data.dicePoolMod.matrixMarkWanted = -(parseInt(ev.target.value) || 0);
            this.dicePoolModifier.mark = -(parseInt(ev.target.value) || 0);
            this.updateDicePoolValue(html);
        }); 

        // Matrix Distance 
        html.find(".matrixNoiseRange").change(ev => {
            this.updateMatrixNoise(html);
        }); 

        // Matrix Noise reduction
        if (html.find('[name="matrixNoiseReduction"]')[0]) {
            this.updateMatrixNoise(html);
        }

        // Limit modifier
        html.find(".limitModifier").change(ev => {
            html.find('[name="limitModVarious"]')[0].value = (parseInt(ev.target.value) || 0);
            this.data.data.limitMod.various = (parseInt(ev.target.value) || 0);
            this.limitModifier.variousModifier = (parseInt(ev.target.value) || 0);
            this.updateLimitValue(html);
        }); 

        // Extended test
        html.find('[name="extendedValue"]').change(ev => {
            let value = html.find('[name="extendedValue"]')[0].value;
            if (value === "true") {
                this.data.data.extendedTest = true;
                document.getElementById("interval").style.display = "block";
            }
            else {
                this.data.data.extendedTest = false;
                document.getElementById("interval").style.display = "none";
            }
        }); 

        //Sprite
        if (html.find('[name="spriteType"]')[0]){
            this.data.data.spriteType = html.find('[name="spriteType"]')[0].value;
        }

        // Spirit type modifier       
        if (html.find('[name="spiritType"]')[0]){        
            let spiritType = html.find('[name="spiritType"]')[0].value;
            if (spiritType !== ""){
                let modifier = 0;
                for (let mod of this.data.data.actor.data.skills.summoning.spiritType[spiritType].modifiers){
                    if (mod) modifier += parseInt(mod.value);
                }
                html.find('[name="summoningSpiritTypeModifier"]')[0].value = modifier;
                this.dicePoolModifier.summoningSpiritType = modifier;
                this.data.data.spiritType = spiritType;
                this.updateDicePoolValue(html);
            }
        }; 

        html.find('[name="spiritType"]').change(ev => {
            let spiritType = ev.target.value;
            let modifier = 0;
            for (let mod of this.data.data.actor.data.skills.summoning.spiritType[spiritType].modifiers){
                if (mod) modifier += parseInt(mod.value);
            }
            html.find('[name="summoningSpiritTypeModifier"]')[0].value = modifier;
            this.dicePoolModifier.summoningSpiritType = modifier;
            this.data.data.spiritType = spiritType;
            this.updateDicePoolValue(html);
        }); 

        if (html.find('[name="backgroundCount"]')[0]){
            let backgroundCount = parseInt(html.find('[name="backgroundCount"]')[0].value);
            this.dicePoolModifier.backgroundCount = backgroundCount;
            this.data.data.dicePoolMod.backgroundCount = backgroundCount;
            this.updateDicePoolValue(html);
        }

        // Force change, recalcul Drain
        if (html.find('[name="force"]')[0]){
            this.updateDrainValue(html);
        }

        html.find('[name="force"]').change(ev => {
            this.updateDrainValue(html);
        });

        html.find('[name="recklessSpellcasting"]').change(ev => {
            let recklessSpellcasting = parseInt(html.find('[name="recklessSpellcasting"]')[0].value);
            html.find('[name="recklessSpellcastingValue"]')[0].value = recklessSpellcasting;
            this.data.data.drainMod.recklessSpellcasting = recklessSpellcasting;
            this.drainModifier.recklessSpellcasting = recklessSpellcasting;
            this.updateDrainValue(html);
        });

        // Preparation trigger modifiers
        if (html.find('[name="preparationTrigger"]')[0]){
            this.drainModifier.preparationTrigger = parseInt(html.find('[name="triggerValue"]')[0].value);
            this.data.data.preparationTrigger = html.find('[name="preparationTrigger"]')[0].value;
            this.data.data.drainMod.trigger = parseInt(html.find('[name="triggerValue"]')[0].value);
            this.updateDrainValue(html);
        }

        html.find('[name="preparationTrigger"]').change(ev => {
            let value;
            switch (ev.target.value){
                case "command":
                case "time":
                    value = 2;
                    break;
                case "contact":
                    value = 1;
                    break;
                default: value = 0;
            }
            html.find('[name="triggerValue"]')[0].value = value;
            this.data.data.drainMod.trigger = value;
            this.data.data.preparationTrigger = html.find('[name="preparationTrigger"]')[0].value;
            this.drainModifier.preparationTrigger = value;
            this.updateDrainValue(html);
        });

        // Level change, recalcul Fading
        if (html.find('[name="level"]')[0]){
            this.updateFadingValue(html);
        }

        html.find('[name="level"]').change(ev => {
            this.updateFadingValue(html);
        });

        // Perception types
        html.find('[name="perceptionType"]').change(ev => {
            let key = ev.target.value;
            let modifier = 0;
            let limitMod = 0;
            if (key !== ""){
                modifier = this.data.data.actor.data.skills.perception.perceptionType[key].test.value;
                limitMod = this.data.data.actor.data.skills.perception.perceptionType[key].limit.value;
            }
            this.data.data.perceptionType = key;
            this.data.data.dicePoolMod.perception = modifier;
            this.dicePoolModifier.perceptionType = modifier;
            this.data.data.limitMod.perception = limitMod;
            this.limitModifier.perceptionType = limitMod;
            html.find('[name="perceptionValue"]')[0].value = modifier;
            html.find('[name="limitModPerception"]')[0].value = limitMod;
            this.updateDicePoolValue(html);
            this.updateLimitValue(html);
        });
    }
}