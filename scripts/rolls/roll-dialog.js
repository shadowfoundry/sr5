import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "./diceHelper.js";
export default class SR5_RollDialog extends Dialog {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            height: 'auto',
            resizable: false,
        });
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
            let modifiedLimit = parseInt(html.find('[name="baseLimit"]')[0].value)
            let limitModifier = 0;
            for (let [key, value] of Object.entries(this.limitModifier)){
                if (key === "reagents") modifiedLimit = value;
                else limitModifier += value;
            }
            modifiedLimit += limitModifier;
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

    async updateMatrixNoise(html){
        let noiseValue = 0,
            noiseRangeMod = 0,
            sceneNoise = 0,
            noiseReduction = 0,
            actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId);

        if (html.find('[name="matrixRange"]')[0].value === 'wired') {
            $(html).find(".hideMatrixNoise").hide();
            if(game.settings.get("sr5", "sr5MatrixGridRules")){
                this.dicePoolModifier.differentGrid = 0;
                this.data.data.dicePoolMod.differentGrid = 0;
                if (html.find('[name="publicGridMod"]')[0]){
                    this.dicePoolModifier.publicGrid = 0;
                    this.data.data.dicePoolMod.publicGrid = 0;
                    html.find('[name="publicGridMod"]')[0].value = 0;
                }
            }
        } else {
            $(html).find(".hideMatrixNoise").show();
            noiseRangeMod = SR5_DiceHelper.convertMatrixDistanceToDiceMod(html.find('[name="matrixRange"]')[0].value);
            if (html.find('[name="publicGridMod"]')[0] && game.settings.get("sr5", "sr5MatrixGridRules")){
                this.dicePoolModifier.publicGrid = -2;
                this.data.data.dicePoolMod.publicGrid = -2;
                html.find('[name="publicGridMod"]')[0].value = -2;
            }
            sceneNoise = this.data.data.matrixNoiseScene;
            noiseReduction = actor.data.data.matrix.attributes.noiseReduction.value;
            if (noiseReduction > (-noiseRangeMod - sceneNoise)) noiseReduction = (-noiseRangeMod - sceneNoise);
            if ((noiseRangeMod + sceneNoise) === 0) noiseReduction = 0;
            noiseValue = noiseRangeMod + sceneNoise + noiseReduction;
            if (noiseValue > 0) noiseValue = 0;
        }
        this.data.data.dicePoolMod.matrixNoiseRange = noiseRangeMod;
        this.data.data.matrixNoiseRange = html.find('[name="matrixRange"]')[0].value;
        this.data.data.dicePoolMod.matrixNoiseReduction = noiseReduction;
        this.data.data.dicePoolMod.matrixNoiseScene = sceneNoise;
        if (html.find('[name="matrixNoiseReduction"]')[0]) html.find('[name="matrixNoiseReduction"]')[0].value = noiseReduction;
        this.dicePoolModifier.matrixNoise = noiseValue;
        html.find('[name="matrixNoiseRangeValue"]')[0].value = noiseRangeMod;
        if (html.find('[name="matrixSceneNoiseValue"]')[0]) html.find('[name="matrixSceneNoiseValue"]')[0].value = sceneNoise;
        html.find('[name="matrixNoise"]')[0].value = noiseValue;
        this.updateDicePoolValue(html);
        let element = document.getElementById(this.id);
        element.style.height = "auto";
    }

    calculRecoil(html){
        let firingModeValue,
            actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            item = actor.items.find(i => i.id === this.data.data.itemId);

        if (html.find('[name="firingMode"]')[0].value === "SS"){
            firingModeValue = 0;
            $(html).find(".hideBulletsRecoil").hide();
        } else firingModeValue = SR5_DiceHelper.convertModeToBullet(html.find('[name="firingMode"]')[0].value);

        this.data.data.firedAmmo = firingModeValue;
        html.find('[name="recoilBullets"]')[0].value = firingModeValue;
        html.find('[name="recoilCumulative"]')[0].value = actor.data.flags.sr5?.cumulativeRecoil || 0;
        if (item.data.data.recoilCompensation.value < 1) $(html).find(".hideWeaponRecoil").hide();
        if (actor.data.flags.sr5?.cumulativeRecoil < 1) $(html).find(".hideCumulativeRecoil").hide();

        let modifiedRecoil = this.data.data.rc - firingModeValue;
        if (modifiedRecoil > 0) modifiedRecoil = 0;
        return modifiedRecoil || 0;
    }

    async getTargetType(target){
        let item = await fromUuid(target);
        if (item.type === "itemSpell") return item.data.data.category;
        else return null;
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.dicePoolModifier = {};
        this.limitModifier = {};
        this.drainModifier = {};
        this.fadingModifier = {};
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId);
        let actorData = actor.data;
        let dialogData = this.data.data;

        this.updateDicePoolValue(html);
        this.updateLimitValue(html);

        if (document.getElementById("interval")) document.getElementById("interval").style.display = "none";
        if (document.getElementById("useReagents")) document.getElementById("useReagents").style.display = "none";
        if (document.getElementById("useSpiritAid")) document.getElementById("useSpiritAid").style.display = "none";

        if (dialogData.type === "ritual"){
            document.getElementById("useReagents").style.display = "block";
            html.find('[name="reagents"]')[0].value = "true";
            html.find('[name="reagentsSpent"]')[0].value = 1;
        }

        // Various modifiers
        html.find('[name="dicePoolModVarious"]').change(ev => this._addVariousModifier(ev, html, dialogData));

        // Specialization modifier
        html.find(".specialization").change(ev => this._addSpecializationModifier(ev, html, dialogData));

        // Penalties modifiers
        html.find(".penaltyMod").change(ev => this._addPenaltyModifier(ev, html, dialogData));

        // Attribute modifiers
        html.find(".attribute").change(ev => this._addAttributeModifier(ev, html, dialogData, actorData));

        // Armor
        if (html.find('[name="armor"]')[0]) this._addArmorModifier(html);

        // Incoming AP
        if (html.find('[name="incomingPA"]')[0]) this._addArmorPenetrationModifier(html)

        // Incoming Firing Mode modifiers
        if (html.find('[name="incomingFiringMode"]')[0]) this._addIncomingFireModeModifiers(null, html, dialogData);
        html.find(".incomingFiringMode").change(ev => this._addIncomingFireModeModifiers(ev, html, dialogData));

        // Range modifiers
        if (html.find('[name="dicePoolModRange"]')[0]) this._addRangeModifier(html, dialogData, actorData);
        html.find(".range").change(ev => this._addRangeModifier(html, dialogData, actorData));

        // Firing mode
        if (html.find('[name="firingMode"]')[0]) this._addFiringModeModifier(html, dialogData);
        html.find(".firingMode").change(ev => this._addFiringModeModifier(html, dialogData));

        // Called Shots
        if (html.find('[name="incomingCalledShots"]')[0]) this._addincomingCalledShotsModifier(null, html, dialogData);
        html.find('[name="incomingCalledShots"]').change(ev => this._addincomingCalledShotsModifier(null, html, dialogData));

        // Called Shots Specific Target
        if (html.find('[name="incomingSpecificTarget"]')[0]) this._addincomingSpecificTargetModifier(null, html, dialogData, actorData);
        html.find('[name="incomingSpecificTarget"]').change(ev => this._addincomingSpecificTargetModifier(null, html, dialogData, actorData));

        // Called Shots Ammo Specific
        if (html.find('[name="incomingAmmoSpecific"]')[0]) this._addincomingAmmoSpecificModifier(null, html, dialogData, actorData);
        html.find('[name="incomingAmmoSpecific"]').change(ev => this._addincomingAmmoSpecificModifier(null, html, dialogData, actorData));

        // Reset Recoil
        html.find(".resetRecoil").click(ev => this._onResetRecoil(ev, html, dialogData, actorData));

        // Defense modifiers
        html.find(".defenseMode").change(ev => this._addDefenseModeModifier(ev, html, dialogData));

        // Speed Attacker modifiers
        html.find(".speedRammingAttacker").change(ev => this._addSpeedRammingAttackerModifier(ev, html, dialogData, actorData));

        // Speed Target modifiers
        html.find(".speedRammingTarget").change(ev => this._addSpeedRammingTargetModifier(ev, html, dialogData, actorData));

        // Cumulative Defense
        if (html.find('[name="dicePoolModDefenseCumulative"]')[0]) this._addCumulativeDefenseModifier(html, dialogData);

        // Cover modifiers
        html.find(".cover").change(ev => this._addCoverModifier(ev, html, dialogData));

        // Full Defense modifiers
        if (html.find(".fullDefense")) this._addFullDefenseModifierOnStart(html, dialogData, actorData);
        html.find(".fullDefense").change(ev => this._addFullDefenseModifier(ev, html, dialogData));

        // Reach modifiers
        if (html.find('[name="reachValue"]')[0]) this._addReachModifier(html, dialogData);

        // Environmental modifier
        if (html.find('[name="dicePoolModEnvironmental"]')[0]) this._addEnvironmentalModifier(html, dialogData);

        // Mark modifiers
        if (html.find('[name="dicePoolModMarkWanted"]')[0]) dialogData.dicePoolMod.matrixMarkWanted = -(html.find('[name="dicePoolModMarkWanted"]')[0].value);
        html.find(".mark").change(ev => this._addWantedMarksModifier(ev, html, dialogData));

        // Matrix Distance
        html.find(".matrixNoiseRange").change(ev => this.updateMatrixNoise(html));

        // Matrix Noise reduction
        if (html.find('[name="matrixNoiseReduction"]')[0]) this.updateMatrixNoise(html);

        // Limit modifier
        html.find(".limitModifier").change(ev => this._addVariousLimitModifier(ev, html, dialogData));

        // Extended test
        html.find('[name="extendedValue"]').change(ev => this._onExtendedTest(ev, dialogData));

        // Sprite type
        if (html.find('[name="spriteType"]')[0]) dialogData.spriteType = html.find('[name="spriteType"]')[0].value;

        // Spirit type modifier
        if (html.find('[name="spiritType"]')[0]) this._addSpiritTypeModifier(html, dialogData, actorData);
        html.find('[name="spiritType"]').change(ev => this._addSpiritTypeModifier(html, dialogData, actorData));

        // Background count
        if (html.find('[name="backgroundCount"]')[0]) this._addBackgroundCountModifier(html, dialogData);

        // Force change, recalcul Drain
        if (html.find('[name="force"]')[0]) this.updateDrainValue(html);
        html.find('[name="force"]').change(ev => this._onForceChange(ev, html, dialogData, actorData));

        //Reckless spellcasting
        html.find('[name="recklessSpellcasting"]').change(ev => this._addRecklessSpellcastingModifier(html, dialogData));

        // Preparation trigger modifiers
        if (html.find('[name="preparationTrigger"]')[0]){
            this.drainModifier.preparationTrigger = parseInt(html.find('[name="triggerValue"]')[0].value);
            dialogData.preparationTrigger = html.find('[name="preparationTrigger"]')[0].value;
            dialogData.drainMod.trigger = parseInt(html.find('[name="triggerValue"]')[0].value);
            this.updateDrainValue(html);
        }
        html.find('[name="preparationTrigger"]').change(ev => this._addPreparationTriggerModifier(ev, html, dialogData));

        // Level change, recalcul Fading
        if (html.find('[name="level"]')[0]) this.updateFadingValue(html);
        html.find('[name="level"]').change(ev => this.updateFadingValue(html));

        // Perception types
        html.find('[name="perceptionType"]').change(ev => this._addPerceptionTypeModifier(ev, html, dialogData, actorData));

        //Signature for Sensor
        html.find('[name="signatureSize"]').change(ev => this._addSignatureSizeModifier(ev, html, dialogData));

        //Locked by sensor
        if (html.find('[name="sensorLockMod"]')[0]) this._addSensorLockModifier(html);

        //Grid management
        if (game.settings.get("sr5", "sr5MatrixGridRules")){
            if (html.find('[name="publicGridMod"]')[0] && (html.find('[name="matrixRange"]')[0].value !== "wired")) {
                dialogData.dicePoolMod.publicGrid = -2;
                this.updateDicePoolValue(html);
            }
            if (html.find('[name="targetGrid"]')[0]) this._addGridModifier(html, dialogData, actorData);
            html.find('[name="targetGrid"]').change(ev => this._addGridModifier(html, dialogData, actorData));
        }

        //Matrix Search
        if (html.find('[name="searchType"]')[0]) this._getMatrixSearchType(html, dialogData);
        html.find('[name="searchType"]').change(ev => this._getMatrixSearchType(html, dialogData));

        //Reagents use
        html.find('[name="reagents"]').change(ev => this._toggleReagentsUse(ev, dialogData));
        html.find('[name="reagentsSpent"]').change(ev => this._addReagentsLimitModifier(ev, html, dialogData, actorData));

        //Spirit aid
        html.find('[name="spiritAid"]').change(ev => this._addSpiritAidModifier(ev, html, dialogData));

        //Add modifier depending of the type of the token Targeted
        if (html.find('[name="targetTypeModifier"]')[0]) this._addTargetTypeModifier(html, dialogData, actorData);

        //Add modifier depending of the type of item Targeted
        if (html.find('[name="targetEffect"]')[0]) this._addTargetItemModifier(html, dialogData, actorData);
        html.find('[name="targetEffect"]').change(ev => this._addTargetItemModifier(html, dialogData, actorData));

        //Get Object Resistance Test base dicepool
        html.find(".objectType").change(ev => this._getObjectTypeDicePool(ev, html, dialogData));

        //Get Damage type, for astral combat
        if (html.find('[name="damageType"]')[0]) this._getDamageType(html, dialogData);
        html.find('[name="damageType"]').change(ev => this._getDamageType(html, dialogData));

        //Add modifier for centering metamagic
        html.find('[name="centering"]').change(ev => this._addCenteringModifier(ev, html, dialogData, actorData));

        //Add modifier for spell shaping metamagic
        html.find('[name="spellShaping"]').change(ev => this._addSpellShapingModifier(ev, html, dialogData, actorData));

        //Set extended test for Astral Traking
        if (dialogData.type === "astralTracking"){
            html.find('[name="extendedValue"]')[0].value = "true";
            dialogData.extendedTest = true;
            document.getElementById("interval").style.display = "block";
            document.getElementById("extendedSpace").style.display = "none";
        }

        //Calcul Mana Barrier DicePool
        html.find('[name="manaBarrierRating"]').change(ev => this._calculManaBarrierDicePool(ev, html, dialogData));
    }

    //Calcul Mana Barrier DicePool
    _calculManaBarrierDicePool(ev, html, dialogData){
        let barrierRating = parseInt((html.find('[name="manaBarrierRating"]')[0].value || 1));
        html.find('[name="baseDicePool"]')[0].value = barrierRating * 2;
        this.data.data.dicePool = barrierRating * 2;
        this.updateDicePoolValue(html);
    }

    //Get Damage type, for astral combat
    _getDamageType(html, dialogData){
        dialogData.damageType = html.find('[name="damageType"]')[0].value;
    }

    //Add Armor modifiers
    _addArmorModifier(html){
        this.dicePoolModifier.armorModifier = parseInt((html.find('[name="armor"]')[0].value || 0));
        this.updateDicePoolValue(html);
    }

    //Add Armor Penetration modifiers
    _addArmorPenetrationModifier(html){
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

    //Add Various modifiers
    _addVariousModifier(ev, html, dialogData){
        this.dicePoolModifier.variousModifier = (parseInt(ev.target.value) || 0);
        dialogData.dicePoolMod.various =  (parseInt(ev.target.value) || 0);
        this.updateDicePoolValue(html);
    }

    //Add Specialization modifiers
    _addSpecializationModifier(ev, html, dialogData){
        if (ev.target.value) {
            html.find('[name="dicePoolModSpecialization"]')[0].value = 2;
            this.dicePoolModifier.specialization = 2;
            dialogData.dicePoolMod.specialization = 2;
        } else {
            html.find('[name="dicePoolModSpecialization"]')[0].value = 0;
            this.dicePoolModifier.specialization = 0;
            dialogData.dicePoolMod.specialization = 0;
        }
        this.updateDicePoolValue(html);
    }

    //Add Penalty modifiers
    _addPenaltyModifier(ev, html, dialogData){
        html.find('[name="dicePoolModPenalty"]')[0].value = (parseInt(ev.target.value) || 0);
        dialogData.dicePoolMod.penalty = (parseInt(ev.target.value) || 0)
        this.dicePoolModifier.penalties = (parseInt(ev.target.value) || 0);
        this.updateDicePoolValue(html);
    }

    //Add attribute modifiers
    _addAttributeModifier(ev, html, dialogData, actorData){
        let value = SR5_DiceHelper.getAttributeValue(ev.target.value, actorData);
        html.find('[name="dicePoolModAttribute"]')[0].value = value;
        if (ev.target.value !== "none") dialogData.attributeKey = ev.target.value;
        dialogData.dicePoolMod.attribute = value;
        this.dicePoolModifier.attributeFirst = value;
        this.updateDicePoolValue(html);
    }

    //Add incoming fire mode modifiers
    _addIncomingFireModeModifiers(ev, html, dialogData){
        let value;
        if (ev === null) value = parseInt(html.find('[name="incomingFiringMode"]')[0].value);
        else value = parseInt(ev.target.value);

        html.find('[name="dicePoolModDefenseFiringMode"]')[0].value = value;
        dialogData.dicePoolMod.defenseFiringMode = value;
        this.dicePoolModifier.incomingFiringMode = value;
        this.updateDicePoolValue(html);
    }

    //Add defense mode modifiers
    _addDefenseModeModifier(ev, html, dialogData){
        let value = SR5_DiceHelper.convertActiveDefenseToMod(html.find('[name="defenseMode"]')[0].value, dialogData.activeDefenses);
        html.find('[name="dicePoolModDefenseActive"]')[0].value = value;
        dialogData.dicePoolMod.defenseActive = value;
        dialogData.activeDefenseMode = html.find('[name="defenseMode"]')[0].value;
        this.dicePoolModifier.defenseMode = value;
        this.updateDicePoolValue(html);
    }

    //Add speed ramming attacker modifiers
    _addSpeedRammingAttackerModifier(ev, html, dialogData, actorData){
        let speed = html.find('[name="speedRammingAttacker"]')[0].value;
        let body = actorData.data.attributes.body.augmented.value;
        let value;
        switch(speed) {
            case "speedRamming1" :
                value = Math.ceil(body/2);
            break;
            case "speedRamming11" :
                value = body;
            break;
            case "speedRamming51" :
                value = body*2;
            break;
            case "speedRamming201" :
                value = body*3;
            break;
            case "speedRamming301" :
                value = body*5;
            break;
            case "speedRamming501" :
                value = body*10;
            break;
        default:
        }
        dialogData.damageValue = value;
        html.find('[name="modifiedDamage"]')[0].value = value;
    }

        //Add speed ramming target modifiers
        _addSpeedRammingTargetModifier(ev, html, dialogData, actorData){
            let speed = html.find('[name="speedRammingTarget"]')[0].value;
            let body = dialogData.target;
            let value, accidentValue;
            switch(speed) {
                case "speedRamming1" :
                    value = Math.ceil(body/2);
                    accidentValue = Math.ceil(value/2);
                break;
                case "speedRamming11" :
                    value = body;
                    accidentValue = Math.ceil(value/2);
                break;
                case "speedRamming51" :
                    value = body*2;
                    accidentValue = Math.ceil(value/2);
                break;
                case "speedRamming201" :
                    value = body*3;
                    accidentValue = Math.ceil(value/2);
                break;
                case "speedRamming301" :
                    value = body*5;
                    accidentValue = Math.ceil(value/2);
                break;
                case "speedRamming501" :
                    value = body*10;
                    accidentValue = Math.ceil(value/2);
                break;
            default:
            }
            dialogData.accidentValue = accidentValue;
            html.find('[name="accidentValue"]')[0].value = accidentValue;
        }

    //Add cumulative defense modifiers
    _addCumulativeDefenseModifier(html, dialogData){
        this.dicePoolModifier.cumulativeDefense = parseInt((html.find('[name="dicePoolModDefenseCumulative"]')[0].value || 0));
        dialogData.dicePoolMod.defenseCumulative = parseInt((html.find('[name="dicePoolModDefenseCumulative"]')[0].value || 0));
        this.updateDicePoolValue(html);
    }

    //Add cover modifiers
    _addCoverModifier(ev, html, dialogData){
        html.find('[name="dicePoolModCover"]')[0].value = (parseInt(ev.target.value) || 0);
        dialogData.dicePoolMod.defenseCover = (parseInt(ev.target.value) || 0);
        this.dicePoolModifier.cover = (parseInt(ev.target.value) || 0);
        this.updateDicePoolValue(html);
    }

    //Add full defense modifier on dialog start
    _addFullDefenseModifierOnStart(html, dialogData, actorData){
        let fullDefenseEffect = actorData.effects.find(e => e.origin === "fullDefense");
		let isInFullDefense = (fullDefenseEffect) ? true : false;
        if (isInFullDefense){
            html.find('[name="fullDefense"]')[0].value = dialogData.defenseFull;
            html.find('[name="dicePoolModFullDefense"]')[0].value = dialogData.defenseFull;
            dialogData.dicePoolMod.defenseFull = dialogData.defenseFull;
            this.dicePoolModifier.fullDefense = dialogData.defenseFull;
            this.updateDicePoolValue(html);
        }
    }

    //Add full defense modifier
    _addFullDefenseModifier(ev, html, dialogData){
        html.find('[name="dicePoolModFullDefense"]')[0].value = (parseInt(ev.target.value) || 0);
        dialogData.dicePoolMod.defenseFull = (parseInt(ev.target.value) || 0);
        this.dicePoolModifier.fullDefense = (parseInt(ev.target.value) || 0);
        this.updateDicePoolValue(html);
    }

    //Add reach modifiers
    _addReachModifier(html, dialogData){
        this.dicePoolModifier.range = parseInt((html.find('[name="reachValue"]')[0].value || 0));
        dialogData.dicePoolMod.reach = parseInt((html.find('[name="reachValue"]')[0].value || 0));
        this.updateDicePoolValue(html);
    }

    //Add Environmental modifier
    _addEnvironmentalModifier(html, dialogData){
        this.dicePoolModifier.environmental = parseInt((html.find('[name="dicePoolModEnvironmental"]')[0].value || 0));
        this.updateDicePoolValue(html);
    }

    //Add range modifiers
    _addRangeModifier(html, dialogData, actorData){
        let baseRange = parseInt(html.find('[name="targetRange"]')[0].value);
        baseRange += actorData.data.itemsProperties.environmentalMod.range.value;
        let rangevalue = SR5_DiceHelper.convertEnvironmentalModToDicePoolMod(baseRange);
        html.find('[name="dicePoolModRange"]')[0].value = rangevalue;
        this.dicePoolModifier.range = rangevalue;
        dialogData.dicePoolMod.range = rangevalue;
        this.updateDicePoolValue(html);
    }

    //Add firing mode modifier
    _addFiringModeModifier(html, dialogData){
        dialogData.firingMode = html.find('[name="firingMode"]')[0].value;
        let recoil = this.calculRecoil(html);
        html.find('[name="rcModifier"]')[0].value = recoil;
        this.dicePoolModifier.recoiCompensation = recoil;
        dialogData.dicePoolMod.recoil = recoil;
        this.updateDicePoolValue(html);
    }

    //Add Called Shots modifier
    _addincomingCalledShotsModifier(ev, html, dialogData, actorData){
        let calledShot = html.find('[name="incomingCalledShots"]')[0].value;
        let calledShotValue, position = this.position;
        position.height = "auto";
        switch(calledShot) {
            case "CS_AmmoSpecific" :
                calledShotValue = 0;
                document.getElementById("incomingAmmoSpecific").style.display = 'block';
                document.getElementById("incomingSpecificTarget").style.display = 'none';
                this.setPosition(position);
            break;
            case "CS_SpecificTarget" :
                calledShotValue = 0;
                document.getElementById("incomingSpecificTarget").style.display = 'block';
                document.getElementById("incomingAmmoSpecific").style.display = 'none';
                this.setPosition(position);
            break;
            case "CS_BlastOutOfHand" :
            case "CS_DirtyTrick" :
            case "CS_Entanglement" :
            case "CS_Pin" :
            case "CS_SplittingDamage" :
            case "CS_ShakeUp" :
            case "CS_TrickShot" :
            case "CS_BreakWeapon" :
            case "CS_Disarm" :
            case "CS_Feint" :
            case "CS_Knockdown" :
            case "CS_Reversal" :
                calledShotValue = -4;
                document.getElementById("incomingAmmoSpecific").style.display = 'none';
                document.getElementById("incomingSpecificTarget").style.display = 'none';
            break;
            case "noChoice" :
                calledShotValue = 0;
                document.getElementById("incomingAmmoSpecific").style.display = 'none';
                document.getElementById("incomingSpecificTarget").style.display = 'none';
            break;
        default:
        }
        html.find('[name="dicePoolModCalledShots"]')[0].value = calledShotValue;
        this.dicePoolModifier.calledShot = calledShotValue;
        dialogData.dicePoolMod.calledShot = calledShotValue;
        dialogData.calledShot = calledShot;
        this.updateDicePoolValue(html);
    }

    //Add Called Shots on specific target modifier
    _addincomingSpecificTargetModifier(ev, html, dialogData, actorData){
        let calledShotSpecificTarget = html.find('[name="incomingSpecificTarget"]')[0].value;
        let calledShotValue, limitDV, effect = {};
        let upTheAnte = html.find('[name="incomingAmmoSpecific"]')[0].value;
        let position = this.position;
        position.height = "auto";
        switch(calledShotSpecificTarget) {
            case "CS_ST_Gut" : 
                calledShotValue = -6;
                limitDV = 8;
        break;               
            case "CS_ST_Forearm" :
            case "CS_ST_Shin" : 
                calledShotValue = -6;
                limitDV = 2;
        break;
            case "CS_ST_Shoulder" :                   
            case "CS_ST_Thigh" : 
            case "CS_ST_Hip" : 
                calledShotValue = -6;
                limitDV = 3;
        break; 
            case "CS_ST_Ankle" :
            case "CS_ST_Knee" :
            case "CS_ST_Hand" :
            case "CS_ST_Foot" :
                calledShotValue = -8;
                limitDV = 1;
        break;
            case "CS_ST_Neck" :
                calledShotValue = -8;
                limitDV = 10;
        break;
            case "CS_ST_Jaw" :
                calledShotValue = -8;
                limitDV = 2;
        break;
            case "CS_ST_Ear" :
            case "CS_ST_Eye" :
                calledShotValue = -10;
                limitDV = 1;
        break;
            case "CS_ST_Genitals" :
                calledShotValue = -10;
                limitDV = 4;
        break;
            case "CS_ST_Sternum" :
                calledShotValue = -10;
                limitDV = 10;
        break;
            case "CS_ST_Antenna" :
            calledShotValue = -8;
            limitDV = 2;
            effect = {
				"0": {
					"name": "antenna",
				}
			};
        break;
            case "CS_ST_EngineBlock" :
            calledShotValue = -4;
            limitDV = "";
            effect = {
				"0": {
					"name": "engineBlock",
				}
			};
        break;
            case "CS_ST_WindowMotor" :
            calledShotValue = -4;
            limitDV = 0;
            effect = {
				"0": {
					"name": "windowMotor",
				}
			};
        break;
            case "CS_ST_DoorLock" :
            calledShotValue = -6;
            limitDV = 0;
            effect = {
				"0": {
					"name": "doorLock",
				}
			};
        break;
            case "CS_ST_Axle" :
            calledShotValue = -6;
            limitDV = 6;
            effect = {
				"0": {
					"name": "axle",
				}
			};
        break;
            case "CS_ST_FuelTankBattery" :
            calledShotValue = -6;
            limitDV = "";
            effect = {
				"0": {
					"name": "fuelTankBattery",
				}
			};
        break;
            case "noChoice" :
            calledShotValue = 0;
            limitDV = "";
        break;
        default:
        }
        if (upTheAnte === "CS_AS_UpTheAnte") calledShotValue = calledShotValue - 4;
        html.find('[name="dicePoolModCalledShots"]')[0].value = calledShotValue;
        this.dicePoolModifier.calledShot = calledShotValue;
        dialogData.dicePoolMod.calledShot = calledShotValue;
        if (upTheAnte === "CS_AS_UpTheAnte") limitDV = limitDV * 2;
        dialogData.limitDV = limitDV;
        dialogData.calledShotLocalisation = calledShotSpecificTarget;
        dialogData.calledShot = html.find('[name="incomingCalledShots"]')[0].value;
        dialogData.calledShotsEffects = effect;
        this.updateDicePoolValue(html);
    }
    
    //Add Called Shots with specific ammo modifier
    _addincomingAmmoSpecificModifier(ev, html, dialogData, actorData){
        let calledShotAmmoSpecific = html.find('[name="incomingAmmoSpecific"]')[0].value;
        let ammoType = dialogData.ammoType;
        let calledShotValue, initiative, limitDV, effect = {};
        let position = this.position;
        position.height = "auto";
        switch(calledShotAmmoSpecific) {
            case "CS_AS_Bellringer" : 
            calledShotValue = -8;
            limitDV = 4;
        break; 
            case "CS_AS_ExtremeIntimidation" :  
            calledShotValue = -4;
            limitDV = 0;
        break; 
            case "CS_AS_OnPinsAndNeedles" : 
            case "CS_AS_Tag" :  
            calledShotValue = -4;
            limitDV = 0;
        break; 
            case "CS_AS_BullsEye" :   
            calledShotValue = -4;
            limitDV = "";
        break; 
            case "CS_AS_DownTheGullet" :  
            calledShotValue = -8;
            limitDV = 2;
        break; 
            case "CS_AS_FingerPopper" : 
                switch(ammoType) {
                    case "explosive" : 
                    case "gel" : 
                    case "hollowPoint" : 
                        calledShotValue = -4;
                        limitDV = 2;
                        effect = {
                            "0": {
                                "name": "blastOutOfHand",
                                "modFingerPopper": 0,
                            }
                        };
                break; 
                case "flechette" : 
                    calledShotValue = -4;
                    limitDV = 2;
                    effect = {
                        "0": {
                            "name": "blastOutOfHand",
                            "modFingerPopper": -1,
                        }
                    };
                break; 
                case "exExplosive" : 
                    calledShotValue = -4;
                    limitDV = 3;
                    effect = {
                        "0": {
                            "name": "blastOutOfHand",
                            "modFingerPopper": 1,
                        }
                    };
                break; 
                default:                     
                    calledShotValue = -4;
                    limitDV = "";
                    effect = {
                    "0": {
                    "name": "blastOutOfHand",
                    "modFingerPopper": -1,
                    }
                };
            }
        break;
            case "CS_AS_FlameOn" : 
            switch(ammoType) {
                case "flare" :
                case "gyrojet" : 
                    calledShotValue = -10;
                    limitDV = 1;
            break; 
                case "tracer" : 
                    calledShotValue = -6;
                    limitDV = 1;
            break;
                }      
        break; 
            case "CS_AS_FlashBlind" :  
                calledShotValue = -6;
                limitDV = 2;
                effect = {
                    "0": {
                        "name": "flared",
                    }
                };
        break;  
            case "CS_AS_HereMuckInYourEye" : 
            switch(ammoType) { 
                case "exExplosive" :  
                calledShotValue = -4;
                limitDV = 0;
                effect = {
                    "0": {
                        "name": "dirtyTrick",
                        "value": -6,
                    }
                };
                case "explosive" :
                case "frangible" : 
                case "hollowPoint" : 
                    calledShotValue = -4;
                    limitDV = 0;
                    effect = {
                        "0": {
                            "name": "dirtyTrick",
                            "value": -5,
                        }
                    };
            break; 
                case "gel" : 
                case "gyrojet" :
                    calledShotValue = -4;
                    limitDV = 2;
                    effect = {
                        "0": {
                            "name": "dirtyTrick",
                            "value": -4,
                        }
                    };
            break; 
                default:                     
                    calledShotValue = -4;
                    limitDV = 0;
                    effect = {
                        "0": {
                            "name": "dirtyTrick",
                            "value": -4,
                        }
                    };
            }
        break; 
            case "CS_AS_HitEmWhereItCounts" : 
                calledShotValue = -6;
                limitDV = 1;
        break;
            case "CS_AS_WarningShot" : 
                calledShotValue = -6;
                limitDV = 0;
        break; 
            case "CS_AS_RicochetShot" :  
                calledShotValue = -6;
                limitDV = "";
        break; 
            case "CS_AS_ShakeRattle" : 
                switch(ammoType) {
                    case "explosive" : 
                        calledShotValue = -4;
                        limitDV = "";
                        initiative = -6; 
                break; 
                    case "exExplosive" : 
                        calledShotValue = -4;
                        limitDV = ""; 
                        initiative = -8;
                break; 
                default:                     
                        calledShotValue = -4;
                        limitDV = "";
                        initiative = -5;
                }
        break;
            case "CS_AS_ShreddedFlesh" : 
                calledShotValue = -4;
                limitDV = 10;
                effect = {
                    "0": {
                        "name": "bleedOut",
                    }
                };
        break;
            case "CS_AS_ThroughAndInto" : 
                calledShotValue = 0;
                limitDV = 1;
        break; 
            case "CS_AS_UpTheAnte" : 
            document.getElementById("incomingSpecificTarget").style.display = 'block';            
            this.setPosition(position);
            calledShotValue = -4;
        break;
            case "noChoice" :
                calledShotValue = 0;
                limitDV = "";
        break;
        default:
        }
        html.find('[name="dicePoolModCalledShots"]')[0].value = calledShotValue;
        this.dicePoolModifier.calledShot = calledShotValue;
        dialogData.dicePoolMod.calledShot = calledShotValue;
        dialogData.calledShotAmmoLocalisation = calledShotAmmoSpecific;
        dialogData.limitDV = limitDV;
        dialogData.calledShotInitiative = initiative;
        dialogData.calledShotsEffects = effect;
        dialogData.calledShot = html.find('[name="incomingCalledShots"]')[0].value;
        this.updateDicePoolValue(html);
    }



    //Toggle reset recoil
    _onResetRecoil(ev, html, dialogData, actorData){
        ev.preventDefault();
        let resetedActor = SR5_EntityHelpers.getRealActorFromID(actorData._id)
        resetedActor.resetRecoil();
        dialogData.rc += actorData.flags.sr5.cumulativeRecoil;
        dialogData.dicePoolMod.recoil = 0;
        actorData.flags.sr5.cumulativeRecoil = 0;
        let recoil = this.calculRecoil(html);
        html.find('[name="rcModifier"]')[0].value = recoil;
        this.dicePoolModifier.recoiCompensation = recoil;
        this.updateDicePoolValue(html);
    }

    //Add wanted marks modifier
    _addWantedMarksModifier(ev, html, dialogData){
        html.find('[name="dicePoolModMarkWanted"]')[0].value = -(parseInt(ev.target.value) || 0);
        dialogData.dicePoolMod.matrixMarkWanted = -(parseInt(ev.target.value) || 0);
        this.dicePoolModifier.mark = -(parseInt(ev.target.value) || 0);
        this.updateDicePoolValue(html);
    }

    //Add various limit modifiers
    _addVariousLimitModifier(ev, html, dialogData){
        html.find('[name="limitModVarious"]')[0].value = (parseInt(ev.target.value) || 0);
        dialogData.limitMod.various = (parseInt(ev.target.value) || 0);
        this.limitModifier.variousModifier = (parseInt(ev.target.value) || 0);
        this.updateLimitValue(html);
    }

    //Handle Extended Test
    _onExtendedTest(ev, dialogData){
        let value = ev.target.value;
        if (value === "true") {
            dialogData.extendedTest = true;
            document.getElementById("interval").style.display = "block";
            document.getElementById("extendedSpace").style.display = "none";
        }
        else {
            dialogData.extendedTest = false;
            document.getElementById("interval").style.display = "none";
            document.getElementById("extendedSpace").style.display = "block";
        }
    }

    //Add Spirit type modifier
    _addSpiritTypeModifier(html, dialogData, actorData){
        let spiritType = html.find('[name="spiritType"]')[0].value;
        if (spiritType !== ""){
            let modifier = actorData.data.skills.summoning.spiritType[spiritType].dicePool - actorData.data.skills.summoning.test.dicePool;
            html.find('[name="summoningSpiritTypeModifier"]')[0].value = modifier;
            this.dicePoolModifier.spiritType = modifier;
            dialogData.dicePoolMod.spiritType = modifier;
            dialogData.spiritType = spiritType;
            this.updateDicePoolValue(html);
        }
    }

    //Add Background count modifier
    _addBackgroundCountModifier(html, dialogData){
        let backgroundCount = parseInt(html.find('[name="backgroundCount"]')[0].value);
        this.dicePoolModifier.backgroundCount = backgroundCount;
        dialogData.dicePoolMod.backgroundCount = backgroundCount;
        this.updateDicePoolValue(html);
    }

    //Handle force change
    _onForceChange(ev, html, dialogData, actorData){
        this.updateDrainValue(html);
        let value = ev.target.value;
        if (dialogData.type === "ritual"){
            if (value > actorData.data.magic.reagents){
                value = actorData.data.magic.reagents;
                ui.notifications.warn(game.i18n.format('SR5.WARN_MaxReagents', {reagents: value}));
                html.find('[name="force"]')[0].value = value;
            }
            document.getElementById("useReagents").style.display = "block";
            html.find('[name="reagents"]')[0].value = "true";
            html.find('[name="reagentsSpent"]')[0].value = value;
        }
    }

    //Add Reckless Spellcasting modifiers
    _addRecklessSpellcastingModifier(html, dialogData){
        let recklessSpellcasting = parseInt(html.find('[name="recklessSpellcasting"]')[0].value);
        html.find('[name="recklessSpellcastingValue"]')[0].value = recklessSpellcasting;
        dialogData.drainMod.recklessSpellcasting = recklessSpellcasting;
        this.drainModifier.recklessSpellcasting = recklessSpellcasting;
        this.updateDrainValue(html);
    }

    //Add Preparation trigger modifiers
    _addPreparationTriggerModifier(ev, html, dialogData){
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
        dialogData.drainMod.trigger = value;
        dialogData.preparationTrigger = html.find('[name="preparationTrigger"]')[0].value;
        this.drainModifier.preparationTrigger = value;
        this.updateDrainValue(html);
    }

    //Add specific Perception type modifiers
    _addPerceptionTypeModifier(ev, html, dialogData, actorData){
        let key = ev.target.value;
        let modifier = 0;
        let limitMod = 0;
        if (key !== ""){
            modifier = actorData.data.skills.perception.perceptionType[key].test.value;
            limitMod = actorData.data.skills.perception.perceptionType[key].limit.value;
        }
        dialogData.perceptionType = key;
        dialogData.dicePoolMod.perception = modifier;
        this.dicePoolModifier.perceptionType = modifier;
        dialogData.limitMod.perception = limitMod;
        this.limitModifier.perceptionType = limitMod;
        html.find('[name="perceptionValue"]')[0].value = modifier;
        html.find('[name="limitModPerception"]')[0].value = limitMod;
        this.updateDicePoolValue(html);
        this.updateLimitValue(html);
    }

    //Signature size modifiers
    _addSignatureSizeModifier(ev, html, dialogData){
        let modifier = SR5_DiceHelper.convertSignatureToDicePoolMod(ev.target.value);
        this.dicePoolModifier.signatureType = modifier;
        dialogData.signatureType = ev.target.value;
        dialogData.dicePoolMod.signatureType = modifier;
        html.find('[name="dicePoolModSignature"]')[0].value = modifier;
        this.updateDicePoolValue(html);
    }

    //Sensor lock modifiers
    _addSensorLockModifier(html){
        this.dicePoolModifier.sensorLockMod = parseInt((html.find('[name="sensorLockMod"]')[0].value || 0));
        this.updateDicePoolValue(html);
    }

    //Add Grid modifiers
    _addGridModifier(html, dialogData, actorData){
        let targetGrid = html.find('[name="targetGrid"]')[0].value;
        if (targetGrid !== actorData.data.matrix.userGrid && targetGrid !== "none"){
            this.dicePoolModifier.differentGrid = -2;
            this.updateDicePoolValue(html);
            html.find('[name="dicePoolModGridTarget"]')[0].value = -2;
            dialogData.dicePoolMod.differentGrid = -2;
        } else {
            this.dicePoolModifier.differentGrid = 0;
            this.updateDicePoolValue(html);
            html.find('[name="dicePoolModGridTarget"]')[0].value = 0;
            dialogData.dicePoolMod.differentGrid = 0;
        }
    }

    //Handle Matrix search
    _getMatrixSearchType(html, dialogData){
        dialogData.matrixSearchType = html.find('[name="searchType"]')[0].value;
    }

    //Toggle Reagents use
    _toggleReagentsUse(ev, dialogData){
        let value = ev.target.value;
        if (value === "true") {
            dialogData.reagentsUsed = true;
            document.getElementById("useReagents").style.display = "block";
        }
        else {
            dialogData.reagentsUsed = false;
            document.getElementById("useReagents").style.display = "none";
        }
    }

    //Add limit modifier for reagents spent
    _addReagentsLimitModifier(ev, html, dialogData, actorData){
        let value = ev.target.value;
        if (value > actorData.data.magic.reagents){
            value = actorData.data.magic.reagents;
            ui.notifications.warn(game.i18n.format('SR5.WARN_MaxReagents', {reagents: value}));
        }
        html.find('[name="reagentsSpent"]')[0].value = value;
        this.limitModifier.reagents = parseInt(value);
        this.updateLimitValue(html);
    }

    //Add modifier for Spirit Aid
    _addSpiritAidModifier(ev, html, dialogData){
        let value = ev.target.value;
        if (value === "true") {
            document.getElementById("useSpiritAid").style.display = "block";
            this.dicePoolModifier.spiritAid = dialogData.spiritAidMod;
            this.updateDicePoolValue(html);
            dialogData.dicePoolMod.spiritAid = dialogData.spiritAidMod;
        }
        else {
            document.getElementById("useSpiritAid").style.display = "none";
            this.dicePoolModifier.spiritAid = 0;
            this.updateDicePoolValue(html);
            dialogData.dicePoolMod.spiritAid = 0;
        }
    }

    //Add modifier for Centering
    _addCenteringModifier(ev, html, dialogData, actorData){
        let value = ev.target.value;
        if (value === "true") {
            this.dicePoolModifier.centering = actorData.data.magic.metamagics.centeringValue.value;
            this.updateDicePoolValue(html);
            dialogData.dicePoolMod.centering = actorData.data.magic.metamagics.centeringValue.value;
            html.find('[name="dicePoolModCentering"]')[0].value = actorData.data.magic.metamagics.centeringValue.value;
        } else {
            this.dicePoolModifier.centering = 0;
            this.updateDicePoolValue(html);
            dialogData.dicePoolMod.centering = 0;
            html.find('[name="dicePoolModCentering"]')[0].value = 0;
        }
    }

    //Add modifier depending of the type of the token Targeted
    _addTargetTypeModifier(html, dialogData, actorData){
        let targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.targetActor)
        if (dialogData.typeSub === "binding"){
            let targetType = targetActor.data.data.type;
            let modifier = actorData.data.skills.binding.spiritType[targetType].dicePool - actorData.data.skills.binding.test.dicePool;
            html.find('[name="targetTypeModifier"]')[0].value = modifier;
            this.dicePoolModifier.spiritType = modifier;
            dialogData.dicePoolMod.spiritType = modifier;
            this.updateDicePoolValue(html);
        }
    }

    //Add modifier depending of the type of item Targeted
    _addTargetItemModifier(html, dialogData, actorData){
        dialogData.targetEffect = html.find('[name="targetEffect"]')[0].value;
        if (dialogData.typeSub === "counterspelling"){
            this.getTargetType(dialogData.targetEffect).then((spellCategory) => {
                let modifier = actorData.data.skills.counterspelling.spellCategory[spellCategory].dicePool - actorData.data.skills.counterspelling.test.dicePool;
                html.find('[name="targetEffectTypeModifier"]')[0].value = modifier;
                this.dicePoolModifier.spellCategory = modifier;
                dialogData.dicePoolMod.spellCategory = modifier;
                this.updateDicePoolValue(html);
            });
        }
    }

    //Get Object Resistance Test base dicepool
    _getObjectTypeDicePool(ev, html, dialogData){
        html.find('[name="baseDicePool"]')[0].value = parseInt(ev.target.value);
        this.updateDicePoolValue(html);
    }

    //Add spell shaping metamagic modifiers
    _addSpellShapingModifier(ev, html, dialogData, actorData){
        let value = parseInt(ev.target.value);
        if (value > 0) {
            ui.notifications.warn(game.i18n.format('SR5.WARN_SpellShapingMin'));
            value = 0;
            html.find('[name="spellShaping"]')[0].value = 0;
        } else if (-value > actorData.data.magic.metamagics.spellShapingValue.value){
            value = -actorData.data.magic.metamagics.spellShapingValue.value;
            html.find('[name="spellShaping"]')[0].value = value;
            ui.notifications.warn(game.i18n.format('SR5.WARN_SpellShapingMaxMagic', {magic: value}));
        }
        this.dicePoolModifier.variousModifier = value;
        dialogData.dicePoolMod.spellShaping = value;
        dialogData.spellAreaMod = -value;
        this.updateDicePoolValue(html);
    }
    
}