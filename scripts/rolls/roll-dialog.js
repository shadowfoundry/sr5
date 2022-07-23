import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "./diceHelper.js";
export default class SR5_RollDialog extends Dialog {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            height: 'auto',
            width: 450,
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
        if (document.getElementById("sightPerception")) document.getElementById("sightPerception").style.display = "none";
        
        if (dialogData.type === "ritual"){
            document.getElementById("useReagents").style.display = "block";
            html.find('[name="reagents"]')[0].value = "true";
            html.find('[name="reagentsSpent"]')[0].value = 1;
        }

        // Various modifiers
        html.find('[name="dicePoolModVarious"]').change(ev => this._addVariousModifier(ev, html, dialogData));

        // Specialization modifier
        html.find('[name="specialization"]').change(ev => this._trueOrFalseModifier(ev, html, dialogData, "specialization", 2, 0, "dicePoolModSpecialization"));

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
        if (html.find('[name="incomingCalledShots"]')[0]) this._addincomingCalledShotsModifier(html, dialogData);
        html.find('[name="incomingCalledShots"]').change(ev => this._addincomingCalledShotsModifier(html, dialogData));

        // Called Shots Specific Target
        if (html.find('[name="incomingSpecificTarget"]')[0]) this._addincomingSpecificTargetModifier(html, dialogData);
        html.find('[name="incomingSpecificTarget"]').change(ev => this._addincomingSpecificTargetModifier(html, dialogData));

        // Called Shots Ammo Specific
        if (html.find('[name="incomingAmmoSpecific"]')[0]) this._addincomingAmmoSpecificModifier(html, dialogData);
        html.find('[name="incomingAmmoSpecific"]').change(ev => this._addincomingAmmoSpecificModifier(html, dialogData));

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
        html.find('[name="centering"]').change(ev => this._trueOrFalseModifier(ev, html, dialogData, "centering", actorData.data.magic.metamagics.centeringValue.value, 0, "dicePoolModCentering"));

        //Add modifier for spell shaping metamagic
        html.find('[name="spellShaping"]').change(ev => this._addSpellShapingModifier(ev, html, dialogData, actorData));

        //Set extended test for Astral Traking or Healing test
        if (dialogData.type === "astralTracking" || dialogData.type === "healing"){
            html.find('[name="extendedValue"]')[0].value = "true";
            dialogData.extendedTest = true;
            document.getElementById("interval").style.display = "block";
            document.getElementById("extendedSpace").style.display = "none";
            if (dialogData.typeSub === "physical"){
                html.find('[name="extendedTime"]')[0].value = "day";
            }
        }

        //Calcul Mana Barrier DicePool
        html.find('[name="manaBarrierRating"]').change(ev => this._calculManaBarrierDicePool(ev, html, dialogData));

        //Add healing modifier for Medecine conditions
        html.find('[name="healingCondition"]').change(ev => this._addHealingConditionModifier(html, dialogData));

        //Add healing modifier for Patient cooperation
        html.find('[name="patientCooperation"]').change(ev => this._addHealingPatientCooperationModifier(ev, html, dialogData));
        
        //Add healing modifier for Patient awakened or emerged
        if (html.find('[name="patientAwakenedOrEmerged"]')[0]) this._addHealingPatientAwakenedOrEmergedModifier(null, html, dialogData);
        html.find('[name="patientAwakenedOrEmerged"]').change(ev => this._addHealingPatientAwakenedOrEmergedModifier(ev, html, dialogData));
        
        //Add healing modifier for Patient Essence
        if (html.find('[name="patientEssence"]')[0]) this._addHealingPatientEssenceModifier(null, html, dialogData);
        html.find('[name="patientEssence"]').change(ev => this._addHealingPatientEssenceModifier(ev, html, dialogData));

        //Add healing modifier for supplies
        html.find('[name="healingSupplies"]').change(ev => this._addHealingSuppliesModifier(ev, html, dialogData, actor));

        //Add Escape Artist modifier for being watched
        html.find('[name="escapeSituationWatched"]').change(ev => this._trueOrFalseModifier(ev, html, dialogData, "escapeSituationWatched", -2, 0, "dicePoolModEscapeSituationWatched"));

        //Add Escape Artist modifier for picks
        html.find('[name="escapeSituationPicks"]').change(ev => this._trueOrFalseModifier(ev, html, dialogData, "escapeSituationPicks", 2, 0, "dicePoolModEscapeSituationPicks"));

        //Add Escape Artist modifier for restrained
        html.find('[name="escapeSituationRestrained"]').change(ev => this._inputModifier(ev, html, dialogData, "escapeSituationRestrained", "dicePoolModEscapeSituationRestrained", true));

        //Add Escape Artist Threshold modifier
        if (html.find('[name="restraintType"]')[0]) this._manageThreshold(null, html, dialogData, "restraintThreshold");
        html.find('[name="restraintType"]').change(ev => this._manageThreshold(ev, html, dialogData, "restraintThreshold"));
        html.find('[name="restraintType"]').change(ev => this._setEscapeArtistThreshold(html, dialogData));
        html.find('[name="restraintReinforced"]').change(ev => this._addRestraintReinforcedModifier(ev, html, dialogData));

        //Add Perception modifiers
        html.find('[name="distracted"]').change(ev => this._checkboxModifier(ev, html, dialogData, "distracted", "dicePoolModPerceptionDistracted", "perception"));
        html.find('[name="specificallyLooking"]').change(ev => this._checkboxModifier(ev, html, dialogData, "specificallyLooking", "dicePoolModPerceptionSpecificallyLooking", "perception"));
        html.find('[name="notInImmediateVicinity"]').change(ev => this._checkboxModifier(ev, html, dialogData, "notInImmediateVicinity", "dicePoolModPerceptionNotInImmediateVicinity", "perception"));
        html.find('[name="farAway"]').change(ev => this._checkboxModifier(ev, html, dialogData, "farAway", "dicePoolModPerceptionFarAway", "perception"));
        html.find('[name="standsOutInSomeWay"]').change(ev => this._checkboxModifier(ev, html, dialogData, "standsOutInSomeWay", "dicePoolModStandsOutInSomeWay", "perception"));
        html.find('[name="interfering"]').change(ev => this._checkboxModifier(ev, html, dialogData, "interfering", "dicePoolModInterfering", "perception"));
        //Set Perception threshold
        if (html.find('[name="perceptionThresholdType"]')[0]) this._manageThreshold(null, html, dialogData, "perceptionThreshold");
        html.find('[name="perceptionThresholdType"]').change(ev => this._manageThreshold(ev, html, dialogData, "perceptionThreshold"));

        //Add Survival modifiers
        html.find('[name="camping"]').change(ev => this._checkboxModifier(ev, html, dialogData, "camping", "dicePoolModSurvivalCamping", "survival"));
        html.find('[name="noFoundOrWater"]').change(ev => this._checkboxModifier(ev, html, dialogData, "noFoundOrWater", "dicePoolModSurvivalNoFoundOrWater", "survival"));
        html.find('[name="controlAvailable"]').change(ev => this._checkboxModifier(ev, html, dialogData, "controlAvailable", "dicePoolModSurvivalControlAvailable", "survival"));
        html.find('[name="clothing"]').change(ev => this._inputModifier(ev, html, dialogData, "clothing", "clothing"));
        html.find('[name="travel"]').change(ev => this._inputModifier(ev, html, dialogData, "travel", "travel"));
        html.find('[name="toxic"]').change(ev => this._inputModifier(ev, html, dialogData, "toxic", "toxic"));
        html.find('[name="weather"]').change(ev => this._selectModifiers(ev, html, dialogData, "weather", "dicePoolModWeather"));
        html.find('[name="survivalThresholdType"]').change(ev => this._manageThreshold(ev, html, dialogData, "survivalThreshold"));
        if (html.find('[name="survivalThresholdType"]')[0]) this._manageThreshold(null, html, dialogData, "survivalThreshold");

        //Add general social modifiers
        html.find('[name="socialAttitude"]').change(ev => this._selectModifiers(ev, html, dialogData, "socialAttitude", "dicePoolModSocialAttitude"));
        html.find('[name="socialResult"]').change(ev => this._selectModifiers(ev, html, dialogData, "socialResult", "dicePoolModSocialResult"));
        html.find('[name="socialAce"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialAce", "dicePoolModSocialAce", "social"));
        html.find('[name="socialRomantic"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialRomantic", "dicePoolModSocialRomantic", "social"));
        html.find('[name="socialIntoxicated"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialIntoxicated", "dicePoolModSocialIntoxicated", "social"));
        html.find('[name="socialReputation"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialReputation", "dicePoolModSocialReputation", "social"));
        html.find('[name="dicePoolModSocialReputationTarget"]').change(ev => this._inputModifier(ev, html, dialogData, "socialReputationTarget", "dicePoolModSocialReputationTarget"));
        //Add Con modifiers
        html.find('[name="dicePoolModSocialEvidence"]').change(ev => this._inputModifier(ev, html, dialogData, "socialEvidence", "dicePoolModSocialEvidence"));
        html.find('[name="socialIsDistracted"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialIsDistracted", "dicePoolModSocialIsDistracted", "social"));
        html.find('[name="socialEvaluateSituation"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialEvaluateSituation", "dicePoolModSocialEvaluateSituation", "social"));
        //Add Etiquette modifiers
        html.find('[name="socialBadLook"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialBadLook", "dicePoolModSocialBadLook", "social"));
        html.find('[name="socialNervous"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialNervous", "dicePoolModSocialNervous", "social"));
        html.find('[name="socialIsDistractedInverse"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialIsDistractedInverse", "dicePoolModSocialIsDistractedInverse", "social"));
        //Add Intimidation modifiers
        html.find('[name="dicePoolModSocialImposing"]').change(ev => this._inputModifier(ev, html, dialogData, "socialImposing", "dicePoolModSocialImposing"));
        html.find('[name="dicePoolModSocialImposingTarget"]').change(ev => this._inputModifier(ev, html, dialogData, "socialImposingTarget", "dicePoolModSocialImposingTarget"));
        html.find('[name="socialOutnumber"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialOutnumber", "dicePoolModSocialOutnumber", "social"));
        html.find('[name="socialOutnumberTarget"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialOutnumberTarget", "dicePoolModSocialOutnumberTarget", "social"));
        html.find('[name="socialWieldingWeapon"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialWieldingWeapon", "dicePoolModSocialWieldingWeapon", "social"));
        html.find('[name="socialWieldingWeaponTarget"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialWieldingWeaponTarget", "dicePoolModSocialWieldingWeaponTarget", "social"));
        html.find('[name="socialTorture"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialTorture", "dicePoolModSocialTorture", "social"));
        html.find('[name="socialObliviousToDanger"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialObliviousToDanger", "dicePoolModSocialObliviousToDanger", "social"));
        //Add Leadership modifiers
        html.find('[name="dicePoolModSocialRank"]').change(ev => this._inputModifier(ev, html, dialogData, "socialRank", "dicePoolModSocialRank"));
        html.find('[name="dicePoolModSocialRankTarget"]').change(ev => this._inputModifier(ev, html, dialogData, "socialRankTarget", "dicePoolModSocialRankTarget"));
        html.find('[name="dicePoolModSocialStrata"]').change(ev => this._inputModifier(ev, html, dialogData, "socialStrata", "dicePoolModSocialStrata"));
        html.find('[name="socialFan"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialFan", "dicePoolModSocialFan", "social"));
        html.find('[name="socialAuthority"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialAuthority", "dicePoolModSocialAuthority", "social"));
        //Add Negociation modifiers
        html.find('[name="socialLacksKnowledge"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialLacksKnowledge", "dicePoolModSocialLacksKnowledge", "social"));
        html.find('[name="socialBlackmailed"]').change(ev => this._checkboxModifier(ev, html, dialogData, "socialBlackmailed", "dicePoolModSocialBlackmailed", "social"));

        //Add Building modifiers
        html.find('[name="workingCondition"]').change(ev => this._selectModifiers(ev, html, dialogData, "workingCondition", "dicePoolModWorkingCondition"));
        html.find('[name="toolsAndParts"]').change(ev => this._selectModifiers(ev, html, dialogData, "toolsAndParts", "dicePoolModToolsAndParts"));
        html.find('[name="plansMaterial"]').change(ev => this._selectModifiers(ev, html, dialogData, "plansMaterial", "dicePoolModPlansMaterial"));
        html.find('[name="workingFromMemory"]').change(ev => this._checkboxModifier(ev, html, dialogData, "workingFromMemory", "dicePoolWorkingFromMemory", "building"));
    }

    //Select modifiers
    _selectModifiers(ev, html, dialogData, modifierName, inputName){
        let value;
        if (ev === null){
            value = 0;
        } else {
            value = ev.target.value;
            if (modifierName === "weather") value = SR5_DiceHelper.convertWeatherModifierToMod(ev.target.value);
            if (modifierName === "socialAttitude") value = SR5_DiceHelper.convertSocialAttitudeValueToMod(ev.target.value);
            if (modifierName === "socialResult") value = SR5_DiceHelper.convertSocialResultValueToMod(ev.target.value);
            if (modifierName === "workingCondition") value = SR5_DiceHelper.convertWorkingConditionToMod(ev.target.value);
            if (modifierName === "toolsAndParts") value = SR5_DiceHelper.convertToolsAndPartsToMod(ev.target.value);
            if (modifierName === "plansMaterial") value = SR5_DiceHelper.convertPlansMaterialToMod(ev.target.value);
        }

        let name = `[name=${inputName}]`;
        html.find(name)[0].value = value;
        dialogData.dicePoolMod[modifierName] = value;
        this.dicePoolModifier[modifierName] = value;
        this.updateDicePoolValue(html);
    }

    //Add checkbox modifiers
    _checkboxModifier(ev, html, dialogData, modifierName, inputName, type){
        let isChecked = ev.target.checked,
            name = `[name=${inputName}]`,
            value = 0;

        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId);
        let actorData = actor.data;

        if (type === "perception") value = SR5_DiceHelper.convertPerceptionModifierToMod(modifierName);
        if (type === "survival") value = SR5_DiceHelper.convertSurvivalModifierToMod(modifierName);
        if (type === "social") value = SR5_DiceHelper.convertSocialCheckboxToMod(modifierName, actorData);
        if (type === "building") value = SR5_DiceHelper.convertBuildingCheckboxToMod(modifierName, actorData);

        if (isChecked){
            html.find(name)[0].value = value;
            dialogData.dicePoolMod[modifierName] = value;
            this.dicePoolModifier[modifierName] = value;
            this.updateDicePoolValue(html);
        } else {
            html.find(name)[0].value = 0;
            dialogData.dicePoolMod[modifierName] = 0;
            this.dicePoolModifier[modifierName] = 0;
            this.updateDicePoolValue(html);
        }
    }

    //Manage true or false select and modifier
    _trueOrFalseModifier(ev, html, dialogData, modifierName, trueValue, falseValue, inputName){
        let value = ev.target.value;
        let name = `[name=${inputName}]`;
        if (value === "false") {
            html.find(name)[0].value = falseValue;
            dialogData.dicePoolMod[modifierName] = falseValue;
            this.dicePoolModifier[modifierName] = falseValue;
            this.updateDicePoolValue(html);
        } else {
            html.find(name)[0].value = trueValue;
            dialogData.dicePoolMod[modifierName] = trueValue;
            this.dicePoolModifier[modifierName] = trueValue;
            this.updateDicePoolValue(html);
        }
    }

    //Manage input modifier
    _inputModifier(ev, html, dialogData, modifierName, inputName, inverse = false){
        let value = parseInt(ev.target.value);
        if (inverse) value = -value;
        let name = `[name=${inputName}]`;
        html.find(name)[0].value = value;
        dialogData.dicePoolMod[modifierName] = value;
        this.dicePoolModifier[modifierName] = value;
        this.updateDicePoolValue(html);
    }

    //Manage threhsold
    _manageThreshold(ev, html, dialogData, inputName){
        let value, label;
        
        if (ev === null){
            if (inputName === "survivalThreshold") {
                value = 1;
                label = "mild";
            } else if (inputName === "restraintType"){
                value = 2;
                label = "rope";
            } else if (inputName === "perceptionThreshold"){
                value = 0;
                label = "opposed";
            }
        } else {
            label = ev.target.value;
            value = ev.target.value;
            if (inputName === "survivalThreshold") value = SR5_DiceHelper.convertSurvivalThresholdTypeToThreshold(ev.target.value);
            else if (inputName === "restraintType") value = SR5_DiceHelper.convertRestraintTypeToThreshold(ev.target.value);
            else if (inputName === "perceptionThreshold") value = SR5_DiceHelper.convertPerceptionTypeToThreshold(ev.target.value);
        }

        let name = `[name=${inputName}]`;
        html.find(name)[0].value = value;
        dialogData.threshold = value;
        dialogData.thresholdType = label;
    }

    _addRestraintReinforcedModifier(ev, html, dialogData){
        let value = ev.target.value;
        let threshold = SR5_DiceHelper.convertRestraintTypeToThreshold((html.find('[name="restraintType"]')[0].value));
        if (value === "false") {
            html.find('[name="restraintReinforcedMod"]')[0].value = 0;
            dialogData.escapeArtistThreshold = threshold;
        } else {
            html.find('[name="restraintReinforcedMod"]')[0].value = 1;
            dialogData.escapeArtistThreshold = threshold + 1;
        }
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
    _addincomingCalledShotsModifier(html, dialogData){
        let calledShot = html.find('[name="incomingCalledShots"]')[0].value;
        let diceMod, position = this.position;
        position.height = "auto";
        switch(calledShot) {
            case "ammoSpecific" :
                diceMod = 0;
                document.getElementById("incomingAmmoSpecific").style.display = 'block';
                document.getElementById("incomingSpecificTarget").style.display = 'none';
                this.setPosition(position);
            break;
            case "specificTarget" :
                diceMod = 0;
                document.getElementById("incomingSpecificTarget").style.display = 'block';
                document.getElementById("incomingAmmoSpecific").style.display = 'none';
                this.setPosition(position);
            break;
            case "blastOutOfHand" :
            case "dirtyTrick" :
            case "entanglement" :
            case "pin" :
            case "splittingDamage" :
            case "shakeUp" :
            case "trickShot" :
            case "breakWeapon" :
            case "disarm" :
            case "feint" :
            case "knockdown" :
            case "reversal" :
                diceMod = -4;
                document.getElementById("incomingAmmoSpecific").style.display = 'none';
                document.getElementById("incomingSpecificTarget").style.display = 'none';
            break;
        default:
            diceMod = 0;
            document.getElementById("incomingAmmoSpecific").style.display = 'none';
            document.getElementById("incomingSpecificTarget").style.display = 'none';
        }
        html.find('[name="dicePoolModCalledShots"]')[0].value = diceMod;
        this.dicePoolModifier.calledShot = diceMod;
        dialogData.dicePoolMod.calledShot = diceMod;
        dialogData.calledShot.name = calledShot;
        this.updateDicePoolValue(html);
    }

    //Add Called Shots on specific target modifier
    _addincomingSpecificTargetModifier(html, dialogData){
        let calledShotSpecificTarget = html.find('[name="incomingSpecificTarget"]')[0].value;
        let diceMod, limitDV, effect = {};
        let upTheAnte = html.find('[name="incomingAmmoSpecific"]')[0].value;
        let position = this.position;
        position.height = "auto";
        switch(calledShotSpecificTarget) {
            case "gut" : 
                diceMod = -6;
                limitDV = 8;
        break;               
            case "forearm" :
            case "shin" : 
                diceMod = -6;
                limitDV = 2;
        break;
            case "shoulder" :                   
            case "thigh" : 
            case "hip" : 
                diceMod = -6;
                limitDV = 3;
        break; 
            case "ankle" :
            case "knee" :
            case "hand" :
            case "foot" :
                diceMod = -8;
                limitDV = 1;
        break;
            case "neck" :
                diceMod = -8;
                limitDV = 10;
        break;
            case "jaw" :
                diceMod = -8;
                limitDV = 2;
        break;
            case "ear" :
            case "eye" :
                diceMod = -10;
                limitDV = 1;
        break;
            case "genitals" :
                diceMod = -10;
                limitDV = 4;
        break;
            case "sternum" :
                diceMod = -10;
                limitDV = 10;
        break;
            case "antenna" :
                diceMod = -8;
                limitDV = 2;
                effect = {
		    		"0": {
			    		"name": "antenna",
				    }
	    		};
        break;
            case "engineBlock" :
                diceMod = -4;                
                limitDV = "";
                effect = {
		    		"0": {
			    		"name": "engineBlock",
				    }
		    	};
        break;
            case "windowMotor" :
                diceMod = -4;
                limitDV = 0;
                effect = {
			    	"0": {
				    	"name": "windowMotor",
				    }
			    };
        break;
            case "doorLock" :
                diceMod = -6;
                limitDV = 0;
                effect = {
			    	"0": {
				    	"name": "doorLock",
				    }
	    		};
        break;
            case "axle" :
                diceMod = -6;
                limitDV = 6;
                effect = {
			    	"0": {
				    	"name": "axle",
				    }
		    	};
        break;
            case "fuelTankBattery" :
                diceMod = -6;                
                limitDV = "";
                effect = {
			    	"0": {
				    	"name": "fuelTankBattery",
				    }
			    };
        break;
        default:
            diceMod = 0;
        }
        if (upTheAnte === "upTheAnte") diceMod = diceMod - 4;
        html.find('[name="dicePoolModCalledShots"]')[0].value = diceMod;
        this.dicePoolModifier.calledShot = diceMod;
        dialogData.dicePoolMod.calledShot = diceMod;
        if (upTheAnte === "upTheAnte") limitDV = limitDV * 2;
        dialogData.calledShot = {
            limitDV: limitDV,
            location: calledShotSpecificTarget,
            name: html.find('[name="incomingCalledShots"]')[0].value,
            effects: effect,
        }
        this.updateDicePoolValue(html);
    }
    
    //Add Called Shots with specific ammo modifier
    _addincomingAmmoSpecificModifier(html, dialogData){
        let calledShotAmmoSpecific = html.find('[name="incomingAmmoSpecific"]')[0].value;
        let ammoType = dialogData.ammoType;
        let diceMod, initiative, limitDV, effect = {};
        let position = this.position;
        position.height = "auto";
        switch(calledShotAmmoSpecific) {
            case "bellringer" : 
            diceMod = -8;
            limitDV = 4;
        break; 
            case "extremeIntimidation" :  
            diceMod = -4;
            limitDV = 0;
        break; 
            case "onPinsAndNeedles" : 
            case "tag" :  
            diceMod = -4;
            limitDV = 0;
        break; 
            case "bullsEye" :   
            diceMod = -4;
            limitDV = "";
        break; 
            case "downTheGullet" :  
            diceMod = -8;
            limitDV = 2;
        break; 
            case "fingerPopper" : 
                switch(ammoType) {
                    case "explosive" : 
                    case "gel" : 
                    case "hollowPoint" : 
                        diceMod = -4;
                        limitDV = 2;
                        effect = {
                            "0": {
                                "name": "blastOutOfHand",
                                "modFingerPopper": 0,
                            }
                        };
                break; 
                case "flechette" : 
                    diceMod = -4;
                    limitDV = 2;
                    effect = {
                        "0": {
                            "name": "blastOutOfHand",
                            "modFingerPopper": -1,
                        }
                    };
                break; 
                case "exExplosive" : 
                    diceMod = -4;
                    limitDV = 3;
                    effect = {
                        "0": {
                            "name": "blastOutOfHand",
                            "modFingerPopper": 1,
                        }
                    };
                break; 
                default:                     
                    diceMod = -4;
                    limitDV = "";
                    effect = {
                    "0": {
                    "name": "blastOutOfHand",
                    "modFingerPopper": -1,
                    }
                };
            }
        break;
            case "flameOn" : 
            switch(ammoType) {
                case "flare" :
                case "gyrojet" : 
                    diceMod = -10;
                    limitDV = 1;
            break; 
                case "tracer" : 
                    diceMod = -6;
                    limitDV = 1;
            break;
                }      
        break; 
            case "flashBlind" :  
                diceMod = -6;
                limitDV = 2;
                effect = {
                    "0": {
                        "name": "flared",
                    }
                };
        break;  
            case "hereMuckInYourEye" : 
            switch(ammoType) { 
                case "exExplosive" :  
                diceMod = -4;
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
                    diceMod = -4;
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
                    diceMod = -4;
                    limitDV = 2;
                    effect = {
                        "0": {
                            "name": "dirtyTrick",
                            "value": -4,
                        }
                    };
            break; 
                default:                     
                    diceMod = -4;
                    limitDV = 0;
                    effect = {
                        "0": {
                            "name": "dirtyTrick",
                            "value": -4,
                        }
                    };
            }
        break; 
            case "hitEmWhereItCounts" : 
                diceMod = -6;
                limitDV = 1;
        break;
            case "warningShot" : 
                diceMod = -6;
                limitDV = 0;
        break; 
            case "ricochetShot" :  
                diceMod = -6;
                limitDV = "";
        break; 
            case "shakeRattle" : 
                switch(ammoType) {
                    case "explosive" : 
                        diceMod = -4;
                        limitDV = "";
                        initiative = -6; 
                break; 
                    case "exExplosive" : 
                        diceMod = -4;
                        limitDV = ""; 
                        initiative = -8;
                break; 
                default:                     
                        diceMod = -4;
                        limitDV = "";
                        initiative = -5;
                }
        break;
            case "shreddedFlesh" : 
                diceMod = -4;
                limitDV = 10;
                effect = {
                    "0": {
                        "name": "bleedOut",
                    }
                };
        break;
            case "throughAndInto" : 
                diceMod = 0;
                limitDV = 1;
        break; 
            case "upTheAnte" : 
            document.getElementById("incomingSpecificTarget").style.display = 'block';            
            this.setPosition(position);
            diceMod = -4;
        break;
        default:
            diceMod = 0;
            limitDV = "";
        }
        html.find('[name="dicePoolModCalledShots"]')[0].value = diceMod;
        this.dicePoolModifier.calledShot = diceMod;
        dialogData.dicePoolMod.calledShot = diceMod;
        dialogData.calledShot = {
            ammoLocation: calledShotAmmoSpecific,
            limitDV: limitDV,
            initiative: initiative,
            effects: effect,
            name: html.find('[name="incomingCalledShots"]')[0].value,  
        }
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
        let key = ev.target.value,
            modifier = 0,
            limitMod = 0,
            position = this.position;

        position.height = "auto";
        
        if (key !== ""){
            modifier = actorData.data.skills.perception.perceptionType[key].test.value;
            limitMod = actorData.data.skills.perception.perceptionType[key].limit.value;
            if (key === "sight") {
                document.getElementById("sightPerception").style.display = "block";
                this.setPosition(position);
                if (canvas.scene) dialogData.dicePoolMod.environmentalSceneMod = SR5_DiceHelper.handleEnvironmentalModifiers(game.scenes.active, actorData.data, true);
                html.find('[name="dicePoolModEnvironmental"]')[0].value = dialogData.dicePoolMod.environmentalSceneMod;
                this.dicePoolModifier.environmental = dialogData.dicePoolMod.environmentalSceneMod;
            } else {
                document.getElementById("sightPerception").style.display = "none";
                this.setPosition(position);
                dialogData.dicePoolMod.environmentalSceneMod = 0;
                this.dicePoolModifier.environmental = 0;
            }
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


    //Add Healing conditions modifiers
    _addHealingConditionModifier(html, dialogData){
        let healingModifier = SR5_DiceHelper.convertHealingConditionToDiceMod(html.find('[name="healingCondition"]')[0].value);
        html.find('[name="dicePoolModHealingCondition"]')[0].value = healingModifier;
        dialogData.dicePoolMod.healingModifier = healingModifier;
        dialogData.healingCondition = html.find('[name="healingCondition"]')[0].value;
        this.dicePoolModifier.healingModifier = healingModifier;
        this.updateDicePoolValue(html);
    }

    //Add Healing Patient is awakened or emerged modifiers
    _addHealingPatientAwakenedOrEmergedModifier(ev, html, dialogData){
        let value;
        if (ev === null) {
            value = dialogData.isEmergedOrAwakened ? dialogData.isEmergedOrAwakened : "false";
            html.find('[name="patientAwakenedOrEmerged"]')[0].value = value;
        } else value = ev.target.value;
        if (value === "true" || value === true) {
            html.find('[name="dicePoolModPatientAwakenedOrEmerged"]')[0].value = -2;
            dialogData.dicePoolMod.patientAwakenedOrEmerged = -2;
            this.dicePoolModifier.patientAwakenedOrEmerged = -2;
            this.updateDicePoolValue(html);
        } else {
            html.find('[name="dicePoolModPatientAwakenedOrEmerged"]')[0].value = 0;
            dialogData.dicePoolMod.patientAwakenedOrEmerged = 0;
            this.dicePoolModifier.patientAwakenedOrEmerged = 0;
            this.updateDicePoolValue(html);
        }
    }

    //Add Healing Patient cooperation modifiers
    _addHealingPatientCooperationModifier(ev, html, dialogData){
        let value = ev.target.value;
        if (value === "true") {
            html.find('[name="dicePoolModPatientCooperation"]')[0].value = 0;
            dialogData.dicePoolMod.patientCooperation = 0;
            this.dicePoolModifier.patientCooperation = 0;
            this.updateDicePoolValue(html);
        } else {
            html.find('[name="dicePoolModPatientCooperation"]')[0].value = -2;
            dialogData.dicePoolMod.patientCooperation = -2;
            this.dicePoolModifier.patientCooperation = -2;
            this.updateDicePoolValue(html);
        }
    }

    //Add healing Patient Essence modifiers
    _addHealingPatientEssenceModifier(ev, html, dialogData){
        if (ev === null) {
            dialogData.patientEssence = (dialogData.targetEssence ? dialogData.targetEssence : 6);
            html.find('[name="patientEssence"]')[0].value = dialogData.patientEssence;
        }
        else dialogData.patientEssence = ev.target.value;
        let essence = 6 - Math.ceil(dialogData.patientEssence);
        let value = -Math.floor(essence/2);
        html.find('[name="dicePoolModPatientEssence"]')[0].value = value;
        dialogData.dicePoolMod.patientEssence = value;
        this.dicePoolModifier.patientEssence = value;
        this.updateDicePoolValue(html);
    }

    //Add healing Patient supplies modifiers
    _addHealingSuppliesModifier(ev, html, dialogData, actor){
        let value = ev.target.value;
        let modifier;
        switch(value){
            case "noSupplies":
                modifier = -3;
                break;
            case "improvised":
                modifier = -1;
                break;
            case "medkit":
                let medkit = SR5_DiceHelper.findMedkitRating(actor);
                if (medkit){
                    modifier = medkit.rating;
                    dialogData.itemId = medkit.id;
                    dialogData.limitMod.healingSupplies = medkit.rating;
                    this.limitModifier.healingSupplies = medkit.rating;
                    html.find('[name="limitModHealingSupplies"]')[0].value = medkit.rating;
                    this.updateLimitValue(html);
                } else {
                    ui.notifications.warn(game.i18n.format('SR5.WARN_NoMedkit'));
                    modifier = 0;
                }
                break;
            default:
                modifier = 0;
        }
        html.find('[name="dicePoolModHealingSupplies"]')[0].value = modifier;
        dialogData.dicePoolMod.healingSupplies = modifier;
        dialogData.healingSupplies = value;
        this.dicePoolModifier.healingSupplies = modifier;
        this.updateDicePoolValue(html);
    }

}