import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_DiceHelper } from "./diceHelper.js";
import { SR5_SystemHelpers } from "../system/utilitySystem.js";
import { SR5 } from "../config.js";
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
        if (html.find('[name="dicePoolModifiers"]').length) html.find('[name="dicePoolModifiers"]')[0].value = dicePoolModifier;
        let modifiedDicePool = dicePoolModifier + parseInt(html.find('[name="baseDicePool"]')[0].value);
        this.data.data.dicePoolBase = parseInt(html.find('[name="baseDicePool"]')[0].value);
        if (modifiedDicePool < 0) modifiedDicePool = 0;
        html.find('[data-button="roll"]')[0].innerHTML = `<i class="fas fa-dice-six"></i> ${game.i18n.localize("SR5.RollDice")} (${modifiedDicePool})`;
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
            let drainModifier = this.data.data.drainMod.spell.value;
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

    calculRecoil(html){
        let firingModeValue,
            actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            item = actor.items.find(i => i.id === this.data.data.itemId);

        if (html.find('[data-modifier="firingMode"]')[0].value === "SS"){
            firingModeValue = 0;
            $(html).find(".hideBulletsRecoil").hide();
        } else firingModeValue = SR5_DiceHelper.convertModeToBullet(html.find('[data-modifier="firingMode"]')[0].value);

        this.data.data.firedAmmo = firingModeValue;
        html.find('[name="recoilBullets"]')[0].value = firingModeValue;
        html.find('[name="recoilCumulative"]')[0].value = actor.flags.sr5?.cumulativeRecoil || 0;
        if (item.system.recoilCompensation.value < 1) $(html).find(".hideWeaponRecoil").hide();
        if (actor.flags.sr5?.cumulativeRecoil < 1) $(html).find(".hideCumulativeRecoil").hide();

        let modifiedRecoil = this.data.data.rc - firingModeValue;
        if (modifiedRecoil > 0) modifiedRecoil = 0;
        return modifiedRecoil || 0;
    }

    async getTargetType(target){
        let item = await fromUuid(target);
        if (item.type === "itemSpell") return item.system.category;
        else return null;
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.dicePoolModifier = {};
        this.limitModifier = {};
        this.drainModifier = {};
        this.fadingModifier = {};
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId);
        let dialogData = this.data.data;

        this.updateDicePoolValue(html);
        this.updateLimitValue(html);

        //Show some block on initial draw
        if (dialogData.type === "ritual") {
            $(html).find('#useReagents').show();
            $(html).find('#reagentsModControl').show();
        }

        //General commands for input
        html.find('.SR-ModInput').change(ev => this._manualInputModifier(ev, html, dialogData));
        //General commands for input buttons
        html.find('.SR-ModControl').click(ev => this._manualInputModifier(ev, html, dialogData, true));
        //General commands for input already filled by dialogData
        if (html.find('.SR-ModInputFilled')) this._filledInputModifier(html.find('.SR-ModInputFilled'), html, dialogData);
        //General commands for checkbox
        if (html.find('.SR-ModCheckboxFilled')) this._filledCheckBox(html.find('.SR-ModCheckboxFilled'), html, dialogData);
        html.find('.SR-ModCheckbox').change(ev => this._checkboxModifier(ev, html, dialogData));    
        //General commands for select
        html.find('.SR-ModSelect').change(ev => this._selectModifiers(ev, html, dialogData));
        //General commands for select already filled by dialogData
        if (html.find('.SR-ModSelectFilled')) this._filledSelectModifier(html.find('.SR-ModSelectFilled'), html, dialogData);
        //Manage Threshold
        html.find('.SR-ManageThreshold').change(ev => this._manageThreshold(ev, html, dialogData));
        if (html.find('.SR-ManageThreshold')) this._filledThreshold(html.find('.SR-ManageThreshold'), html, dialogData);

        // Reset Recoil
        html.find(".resetRecoil").click(ev => this._onResetRecoil(ev, html, dialogData, actor));
        // Reset Cumulative Defense
        html.find(".resetCumulativeDefense").click(ev => this._onResetDefense(ev, html, dialogData, actor));

        // Extended test
        html.find('[name="toggleExtendedTest"]').change(ev => this._onToggleExtendedTest(ev.target.checked, dialogData, html));

        //Set extended test for Astral Traking or Healing test
        if (dialogData.type === "astralTracking" || dialogData.type === "healing"){
            html.find('[name="toggleExtendedTest"]')[0].checked = true;
            dialogData.extendedTest = true;
            if (dialogData.typeSub === "physical"){
                html.find('[name="extendedTime"]')[0].value = "day";
            }
            this._onToggleExtendedTest(true, dialogData)
        }

        //Toggle hidden div
        html.find(".SR-DialogToggle").click(ev => this._toggleDiv(ev, html));
    }

    //Show or Hide section of the dialog
    _toggleDiv(ev, html){
        let target = $(ev.currentTarget).attr("data-target"),
            action = $(ev.currentTarget).attr("data-action"),
            position = this.position;

        if (action === "show"){
            $(html).find(`#${target}`).show();
            $(html).find(`[data-target=${target}]`).filter(`[data-action="show"]`).hide();
            $(html).find(`[data-target=${target}]`).filter(`[data-action="hide"]`).show();
        } else {
            $(html).find(`#${target}`).hide();
            $(html).find(`[data-target=${target}]`).filter(`[data-action="hide"]`).hide();
            $(html).find(`[data-target=${target}]`).filter(`[data-action="show"]`).show();
        }
        
        position.height = "auto";
        this.setPosition(position);
    }

    //Add checkbox modifiers
    _checkboxModifier(ev, html, dialogData){
        let isChecked = ev.target.checked,
            target = $(ev.currentTarget).attr("data-target"),
            name = `[name=${target}]`,
            modifierName = $(ev.currentTarget).attr("data-modifier"),
            label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]),
            value = 0;

        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId);

        switch (modifierName){
            case "socialReputation":
                value = actor.system.streetCred.value;
                break;
            case "workingFromMemory":
                if (actor.system.attributes.logic.augmented.value >= 5) value = 0;
                else value = -(5 - actor.system.attributes.logic.augmented.value);
                break;
            case "penalty":
                value = dialogData.penaltyValue;
                break;
            case "fullDefense":
                value = dialogData.defenseFull;
                break;
            case "reagents":
                if (isChecked) {
                    $(html).find('#useReagents').show();
                    $(html).find('#reagentsModControl').show();
                }
                else {
                    $(html).find('#useReagents').hide();
                    $(html).find('#reagentsModControl').hide();
                }
                return;
            case "recklessSpellcasting":
                if (isChecked) value = 3;
                html.find(name)[0].value = value;
                dialogData.drainMod.recklessSpellcasting = {
                    value: value,
                    label: game.i18n.localize(SR5.drainModTypes[modifierName]),
                }
                this.drainModifier.recklessSpellcasting = value;
                this.updateDrainValue(html);
                return;
            case "spiritAid":
                value = dialogData.spiritAidMod;
                break;
            case "centering":
                value = actor.system.magic.metamagics.centeringValue.value;
                break;
            case "restraintReinforced":
                if (isChecked) value = 1;
                html.find(name)[0].value = value;
                let threshold = parseInt(html.find('[name="restraintThreshold"]')[0].value);
                dialogData.threshold = threshold + 1;
                return;
            case "specificallyLooking":
                value = 3;
                break;
            case "escapeSituationPicks":
            case "specialization":
            case "standsOutInSomeWay":
            case "camping":
            case "socialAce":
            case "socialRomantic":
            case "socialOutnumber":
            case "socialWieldingWeapon":
            case "socialTorture":
            case "socialObliviousToDanger":
            case "socialFan":
            case "socialBlackmailed":
                value = 2;
                break;
            case "controlAvailable":
            case "socialIsDistracted":
            case "socialAuthority":
                value = 1;
                break;
            case "socialIsDistractedInverse":
            case "socialIntoxicated":
            case "socialEvaluateSituation":
                value = -1;
                break;
            case "escapeSituationWatched":
            case "patientAwakenedOrEmerged":
            case "patientCooperation":
            case "distracted":
            case "notInImmediateVicinity":
            case "interfering":
            case "noFoundOrWater":
            case "socialBadLook":
            case "socialNervous":
            case "socialOutnumberTarget":
            case "socialWieldingWeaponTarget":
            case "socialLacksKnowledge":
                value = -2;
                break;
            case "farAway":
                value = -3;
                break;
        }

        if (isChecked){
            html.find(name)[0].value = value;
            dialogData.dicePoolMod[modifierName] = value;
            dialogData.dicePoolMod[modifierName] = {
                value: value,
                label: label,
            }
            this.dicePoolModifier[modifierName] = value;
            this.updateDicePoolValue(html);
        } else {
            html.find(name)[0].value = 0;
            dialogData.dicePoolMod[modifierName] = {
                value: 0,
                label: label,
            }
            this.dicePoolModifier[modifierName] = 0;
            this.updateDicePoolValue(html);
        }
    }

    //Auto check checkbox modifiers
    _filledCheckBox(checkboxs, html, dialogData){
        if (checkboxs.length === 0) return;
        let checkboxName, modifierName, inputName, value;

        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            label;

        for (let e of checkboxs){
            modifierName = $(e).attr("data-modifier");
            checkboxName = `[data-modifier=${modifierName}]`;
            inputName = `[name=${$(e).attr("data-target")}]`;
            label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);

            switch (modifierName){
                case "patientAwakenedOrEmerged":
                    if (dialogData.isEmergedOrAwakened){
                        html.find(checkboxName)[0].checked = true;
                        value = -2;
                    }
                    break;
                case "fullDefense":
                    let fullDefenseEffect = actor.effects.find(e => e.origin === "fullDefense");
		            let isInFullDefense = (fullDefenseEffect) ? true : false;
                    if (isInFullDefense){
                        html.find(checkboxName)[0].checked = true;
                        value = dialogData.defenseFull;
                    }
                    break;
            }
        }

        if (html.find(checkboxName)[0].checked){
            html.find(inputName)[0].value = value;
            dialogData.dicePoolMod[modifierName] = {
                value: value,
                label: label,
            }
            this.dicePoolModifier[modifierName] = value;
            this.updateDicePoolValue(html);
        }
    }

    //Manage manual input modifier
    _manualInputModifier(ev, html, dialogData, button = false){
        let target, name, modifierName, value, operator;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId);

        if (button){ //Manage plus minus input
            target = $(ev.currentTarget).attr("data-target");
            operator = $(ev.currentTarget).attr("data-type");
            modifierName = $(ev.currentTarget).attr("data-modifier");
            name = `[name=${target}]`;
            value = html.find(name)[0].value;
            if (operator === "plus"){
                value++;
                html.find(name)[0].value = value;
            } else {
                value--;
                html.find(name)[0].value = value;
            }
        } else {
            target = $(ev.currentTarget).attr("name");
            name = `[name=${target}]`;
            modifierName = $(ev.currentTarget).attr("data-modifier");
            value = parseInt(ev.target.value);
        }

        switch (target){
            case "force":
                this.updateDrainValue(html);
                if (html.find('#force').length) html.find('#force')[0].value = value;
                if (dialogData.type === "ritual") this._updateReagents(value, actor, html, dialogData);
                return;
            case "reagentsSpent":
                this._updateReagents(value, actor, html, dialogData);
                return;
            case "level":
                this.updateFadingValue(html);
                if (html.find('#level').length) html.find('#level')[0].value = value;
                return;
            case "dicePoolModSpellShaping":
                if (value > 0) {
                    ui.notifications.warn(game.i18n.format('SR5.WARN_SpellShapingMin'));
                    value = 0;
                } else if (-value > actor.system.magic.metamagics.spellShapingValue.value){
                    value = -actor.system.magic.metamagics.spellShapingValue.value;
                    ui.notifications.warn(game.i18n.format('SR5.WARN_SpellShapingMaxMagic', {magic: value}));
                }
                dialogData.spellAreaMod = -value;
                break;
            case "manaBarrierRating":
                let barrierRating = parseInt((html.find('[name="manaBarrierRating"]')[0].value || 1));
                html.find('[name="baseDicePool"]')[0].value = barrierRating * 2;
                this.data.data.dicePool = barrierRating * 2;
                this.updateDicePoolValue(html);
                return;
            case "patientEssence":
                dialogData.patientEssence = value;
                let essence = 6 - Math.ceil(dialogData.patientEssence);
                value = -Math.floor(essence/2);
                html.find('[name="dicePoolModPatientEssence"]')[0].value = value;
                dialogData.dicePoolMod.patientEssence = {
                    value: value,
                    label: `${game.i18n.localize(SR5.dicePoolModTypes[target])} (${dialogData.patientEssence})`,
                }
                this.dicePoolModifier.patientEssence = value;
                this.updateDicePoolValue(html);
                return;
            case "limitModHealingSupplies":
            case "limitModPerception":
            case "limitModVarious":
                html.find(name)[0].value = value;
                dialogData.limitMod[modifierName] = {
                    value: value,
                    label: `${game.i18n.localize(SR5.limitModTypes[modifierName])}`,
                }
                this.limitModifier[modifierName] = value;
                this.updateLimitValue(html);
                return;
        }

        html.find(name)[0].value = value;
        dialogData.dicePoolMod[modifierName] = {
            value: value,
            label: game.i18n.localize(SR5.dicePoolModTypes[modifierName]),
        }
        this.dicePoolModifier[modifierName] = value;
        this.updateDicePoolValue(html);
    }

    _filledInputModifier(ev, html, dialogData){
        if (ev.length === 0) return;
        let modifierName, name, value;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            label;

        for (let e of ev){
            modifierName = $(e).attr("data-modifier");
            name = `[data-modifier=${modifierName}]`;
            label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);

            switch (modifierName){
                case "matrixNoiseReduction":
                    if (html.find('[data-modifier="matrixRange"]')[0].value === "wired") {
                        this.dicePoolModifier.matrixNoiseReduction = 0;
                        value = 0;
                    }
                    else {
                        let rangeMod = this.dicePoolModifier.matrixRange || 0,
                            sceneNoise = this.dicePoolModifier.matrixSceneNoise || 0;
                        value = actor.system.matrix.attributes.noiseReduction.value;
                        if (-value < rangeMod + sceneNoise) value = -(rangeMod + sceneNoise);
                        if (rangeMod + sceneNoise === 0) value = 0;
                    }
                    break;
                case "matrixSceneNoise":
                    if (html.find('[data-modifier="matrixRange"]')[0].value !== "wired") value = dialogData.matrixNoiseScene;
                    else value = 0;
                    break;
                case "incomingPA":
                    let armorValue = parseInt((html.find('[data-modifier="armor"]')[0].value || 0));
                    let incomingAP = parseInt((html.find('[data-modifier="incomingPA"]')[0].value || 0))
                    if (armorValue >= -incomingAP) value = incomingAP;
                    else {
                        let usedAP = armorValue + incomingAP;
                        value = incomingAP - usedAP;
                    }
                    break;
                case "armor":
                    continue;
                case "publicGrid":
                    if (html.find('[data-modifier="matrixRange"]')[0].value !== "wired" && game.settings.get("sr5", "sr5MatrixGridRules")) value = -2;
                    else value = 0;
                    break;
                case "force":
                    this.updateDrainValue(html);
                    if (dialogData.type === "ritual") this._updateReagents(1, actor, html, dialogData);
                    continue;
                case "level":
                    this.updateFadingValue(html)
                    continue;
                case "spiritType":
                    if (dialogData.targetActor && (dialogData.typeSub === "binding")){
                        let targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.targetActor)
                        let targetType = targetActor.system.type;
                        value = actor.system.skills.binding.spiritType[targetType].dicePool - actor.system.skills.binding.test.dicePool;
                        label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.spiritTypes[targetType])})`;
                    } else {
                        value = 0;
                    }
                    break;
                case "patientEssence":
                    dialogData.patientEssence = (dialogData.targetEssence ? dialogData.targetEssence : 6);
                    html.find('[name="patientEssence"]')[0].value = dialogData.patientEssence;
                    let essence = 6 - Math.ceil(dialogData.patientEssence);
                    value = -Math.floor(essence/2);
                    html.find('[name="dicePoolModPatientEssence"]')[0].value = value;
                    dialogData.dicePoolMod.patientEssence = {
                        value: value,
                        label: `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${dialogData.patientEssence})`,
                    }
                    this.dicePoolModifier.patientEssence = value;
                    this.updateDicePoolValue(html);
                    continue;
                case "backgroundCount":
                    value = parseInt((html.find(name)[0].value || 0));
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.traditionTypes[dialogData.sceneData.backgroundAlignement])})`;
                    break;
                default:
                    value = parseInt((html.find(name)[0].value || 0));
            }

            html.find(name)[0].value = value;
            dialogData.dicePoolMod[modifierName] = {
                value: value,
                label: label,
            }
            this.dicePoolModifier[modifierName] = value;
            this.updateDicePoolValue(html);
        }
    }

    //Select modifiers
    async _selectModifiers(ev, html, dialogData){
        let target = $(ev.currentTarget).attr("data-target"),
            name = `[name=${target}]`,
            modifierName = $(ev.currentTarget).attr("data-modifier"),
            value, limitDV,
            actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]),
            position = this.position;

        position.height = "auto";

        if (ev === null) value = 0;
        else {
            switch (modifierName){
                case "weather":
                    value = SR5_DiceHelper.convertWeatherModifierToMod(ev.target.value);
                    break;
                case "socialAttitude":
                    value = SR5_DiceHelper.convertSocialAttitudeValueToMod(ev.target.value);
                    break;
                case "socialResult":
                    value = SR5_DiceHelper.convertSocialResultValueToMod(ev.target.value);
                    break;
                case "workingCondition":
                    value = SR5_DiceHelper.convertWorkingConditionToMod(ev.target.value);
                    break;
                case "toolsAndParts":
                    value = SR5_DiceHelper.convertToolsAndPartsToMod(ev.target.value);
                    break;
                case "plansMaterial":
                    value = SR5_DiceHelper.convertPlansMaterialToMod(ev.target.value);
                    break;
                case "attribute":
                    value = SR5_DiceHelper.getAttributeValue(ev.target.value, actor);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.allAttributes[ev.target.value])})`;
                    break;
                case "incomingFiringMode":
                    value = SR5_DiceHelper.convertFiringModeToDefenseDicepoolMod(ev.target.value);
                    label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    break;
                case "targetRange":
                    let baseRange = SR5_DiceHelper.convertRangeToEnvironmentalLine(ev.target.value);
                    baseRange += actor.system.itemsProperties.environmentalMod.range.value;
                    value = SR5_DiceHelper.convertEnvironmentalModToDicePoolMod(baseRange);
                    label = label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    break;
                case "firingMode":
                    value = this.calculRecoil(html);
                    dialogData.firingModeSelected = ev.target.value;
                    modifierName = "recoil";
                    label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    break;
                case "defenseMode":
                    value = SR5_DiceHelper.convertActiveDefenseToMod(ev.target.value, dialogData.activeDefenses);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.characterDefenses[ev.target.value])})`;
                    dialogData.activeDefenseMode = ev.target.value;
                    break;
                case "cover":
                    value = SR5_DiceHelper.convertCoverToMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.coverTypes[ev.target.value])})`;
                    break
                case "mark":
                    value = SR5_DiceHelper.convertMarkToMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${ev.target.value})`;
                    break;
                case "matrixRange":
                    value = SR5_DiceHelper.convertMatrixDistanceToDiceMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.matrixNoiseDistance[ev.target.value])})`;
                    if (ev.target.value !== "wired") {
                        if (html.find('#matrixNoiseScene')) $(html).find('#matrixNoiseScene').show();
                        if (html.find('#matrixNoiseReduction')) $(html).find('#matrixNoiseReduction').show();
                        if (html.find('#matrixTargetGrid')) $(html).find('#matrixTargetGrid').show();
                        if (dialogData.targetGrid !== actor.system.matrix.userGrid) {
                            html.find('[name="dicePoolModTargetGrid"]')[0].value = -2;
                            dialogData.dicePoolMod.targetGrid = {
                                value: -2,
                                label: `${game.i18n.localize(SR5.dicePoolModTypes["targetGrid"])} (${game.i18n.localize(SR5.gridTypes[html.find('[data-modifier="targetGrid"]')[0].value])})`,
                            }
                            this.dicePoolModifier.targetGrid = -2;
                        }
                    }
                    else {
                        if (html.find('#matrixNoiseScene')) $(html).find('#matrixNoiseScene').hide();
                        if (html.find('#matrixNoiseReduction')) $(html).find('#matrixNoiseReduction').hide();
                        if (html.find('#matrixTargetGrid')) $(html).find('#matrixTargetGrid').hide();
                        html.find('[name="dicePoolModTargetGrid"]')[0].value = 0;
                    }
                    dialogData.matrixNoiseRange = ev.target.value;
                    break;
                case "targetGrid":
                    if (ev.target.value !== actor.system.matrix.userGrid && ev.target.value !== "none") {
                        value = -2
                        label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.gridTypes[ev.target.value])})`;
                    } else value = 0;
                    break;
                case "spriteType":
                    dialogData.spriteType = ev.target.value;
                    return;
                case "spiritType":
                    if (ev.target.value !== ""){
                        value = actor.system.skills.summoning.spiritType[ev.target.value].dicePool - actor.system.skills.summoning.test.dicePool;
                        label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.spiritTypes[ev.target.value])})`;
                        dialogData.spiritType = ev.target.value;
                    } else value = 0;
                    break;
                case "preparationTrigger":
                    value = SR5_DiceHelper.convertTriggerToMod(ev.target.value);
                    html.find(name)[0].value = value;
                    dialogData.drainMod.trigger = {
                        value: value,
                        label: `${game.i18n.localize(SR5.drainModTypes[modifierName])} (${game.i18n.localize(SR5.preparationTriggerTypes[ev.target.value])})`,
                    };
                    dialogData.preparationTrigger = ev.target.value;
                    this.drainModifier.preparationTrigger = value;
                    this.updateDrainValue(html);
                    return;
                case "perceptionType":
                    let limitMod = 0;
                    value = 0;
                    if (ev.target.value !== ""){
                        value = actor.system.skills.perception.perceptionType[ev.target.value].test.value;
                        limitMod = actor.system.skills.perception.perceptionType[ev.target.value].limit.value;
                    }
                    if (ev.target.value === "sight") {
                        $(html).find('#sightPerception').show();
                        if (canvas.scene) {
                            dialogData.dicePoolMod.environmentalSceneMod = {
                                value: SR5_DiceHelper.handleEnvironmentalModifiers(game.scenes.active, actor.system, true),
                                label: game.i18n.localize(SR5.dicePoolModTypes["environmentalSceneMod"]),
                            }
                            label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.perceptionTypes[ev.target.value])})`;
                        }
                        html.find('[data-modifier="environmentalSceneMod"]')[0].value = dialogData.dicePoolMod.environmentalSceneMod.value;
                        this.dicePoolModifier.environmental = dialogData.dicePoolMod.environmentalSceneMod.value;
                    } else {
                        $(html).find('#sightPerception').hide();
                        dialogData.dicePoolMod.environmentalSceneMod = {
                            value: 0,
                            label: game.i18n.localize(SR5.dicePoolModTypes["environmentalSceneMod"]),
                        }
                        this.dicePoolModifier.environmental = 0;
                    }
                    dialogData.perceptionType = ev.target.value;
                    dialogData.limitMod.perception = {
                        value: limitMod,
                        label: `${game.i18n.localize(SR5.limitModTypes["perception"])} (${game.i18n.localize(SR5.perceptionTypes[ev.target.value])})`,
                    }
                    this.limitModifier.perceptionType = limitMod;
                    html.find('[name="limitModPerception"]')[0].value = limitMod;
                    this.updateLimitValue(html);
                    break;
                case "signatureSize":
                    value = SR5_DiceHelper.convertSignatureToDicePoolMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.targetSignature[ev.target.value])})`;
                    break;
                case "searchType":
                    value = SR5_DiceHelper.convertSearchTypeToThreshold(ev.target.value);
                    dialogData.threshold = value;
                    dialogData.thresholdType = ev.target.value;
                    html.find(name)[0].value = value;
                    return;
                case "damageType":
                    dialogData.damageType = ev.target.value;
                    return;
                case "healingCondition":
                    value = SR5_DiceHelper.convertHealingConditionToDiceMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.healingConditions[ev.target.value])})`;
                    dialogData.healingCondition = ev.target.value;
                    break;
                case "healingSupplies":
                    dialogData.limitMod.healingSupplies = 0;
                    this.limitModifier.healingSupplies = 0;
                    html.find('[name="limitModHealingSupplies"]')[0].value = 0;
                    switch(ev.target.value){
                        case "noSupplies":
                            value = -3;
                            break;
                        case "improvised":
                            value = -1;
                            break;
                        case "medkit":
                            let medkit = SR5_DiceHelper.findMedkitRating(actor);
                            if (medkit){
                                value = medkit.rating;
                                dialogData.itemId = medkit.id;
                                dialogData.limitMod.healingSupplies = {
                                    value: medkit.rating,
                                    label: game.i18n.localize(SR5.dicePoolModTypes[modifierName]),
                                }
                                this.limitModifier.healingSupplies = medkit.rating;
                                html.find('[name="limitModHealingSupplies"]')[0].value = medkit.rating;
                            } else {
                                ui.notifications.warn(game.i18n.format('SR5.WARN_NoMedkit'));
                                value = 0;
                            }
                            this.updateLimitValue(html);
                            break;
                        default:
                            value = 0;
                    }
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.healingSupplies[ev.target.value])})`;
                    break;
                case "speedRammingAttacker":                
                    value = SR5_DiceHelper.convertSpeedToDamageValue(ev.target.value, actor.system.attributes.body.augmented.value);
                    dialogData.damageValue = value;
                    html.find('[name="modifiedDamage"]')[0].value = value;
                    return;
                case "speedRammingTarget":
                    value = SR5_DiceHelper.convertSpeedToAccidentValue(ev.target.value, dialogData.target);
                    dialogData.accidentValue = value;
                    html.find(name)[0].value = value;
                    return;
                case "targetEffect":
                    dialogData.targetEffect = ev.target.value;
                    if (dialogData.typeSub === "counterspelling"){
                        let spellCategory = await this.getTargetType(dialogData.targetEffect);
                        value = parseInt(actor.system.skills.counterspelling.spellCategory[spellCategory].dicePool - actor.system.skills.counterspelling.test.dicePool);
                        label = `${game.i18n.localize(SR5.dicePoolModTypes["spellCategory"])} (${game.i18n.localize(SR5.spellCategories[spellCategory])})`;
                    } else value = 0;
                    break;
                case "objectType":
                    html.find('[name="baseDicePool"]')[0].value = parseInt(ev.target.value);
                    this.updateDicePoolValue(html);
                    return;
                case "calledShot":
                    value = SR5_DiceHelper.convertCalledShotToMod(ev.target.value, dialogData.ammoType);
                    if (ev.target.value === "specificTarget") $(html).find('#calledShotSpecificTarget').show();
                    else $(html).find('#calledShotSpecificTarget').hide();
                    dialogData.calledShot.name = ev.target.value;
                    dialogData.calledShot.effects = SR5_DiceHelper.convertCalledShotToEffect(ev.target.value, dialogData.ammoType);
                    dialogData.calledShot.limitDV = SR5_DiceHelper.convertCalledShotToLimitDV(ev.target.value, dialogData.ammoType);
                    switch (ev.target.value){
                        case "shakeUp":
                            dialogData.calledShot.initiative = SR5_DiceHelper.convertCalledShotToInitiativeMod(dialogData.ammoType);
                            break;
                        case "bullsEye": //Errata: “The attack results in an AP increase equal to the BASE weapon AP multiplied by the number of bullets in the burst with a maximum modifier of x3.”
                            dialogData.incomingPA = dialogData.incomingPA + ((dialogData.incomingPA + 4) * Math.min(dialogData.firedAmmo, 3));
                            break;
                        case "hitEmWhereItCounts":
                            if (dialogData.toxin.power > 0) {
                                dialogData.toxin.power += 2;
                                if (dialogData.damageValue > 0) {
                                    dialogData.damageValue += 2;
                                    dialogData.damageValueBase += 2;
                                }
                            }
                            if (dialogData.toxin.speed > 0) dialogData.toxin.speed -= 1;
                            break;
                        case "throughAndInto":
                            if (!dialogData.targetActorId) {
                                ui.notifications.warn(game.i18n.localize('SR5.WARN_TargetTroughAndInto'));
                                return html.find(ev.currentTarget)[0].value = "";
                            } else {
                                let targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.targetActorId)
                                value = -(targetActor.data.data.itemsProperties.armor.value + Math.floor(targetActor.data.data.attributes.body.augmented.value / 2));
                            }
                            break;
                        case "upTheAnte":
                            $(html).find('#calledShotSpecificTarget').show();         
                            break;
                        case "harderKnock":
                            dialogData.damageType = "physical";
                            break;
                        case "vitals":
                            dialogData.damageValueBase += 2;
                            dialogData.damageValue += 2;
                            break;
                    }
                    break;
                case "calledShotSpecificTarget":
                    modifierName = "calledShot";
                    value = SR5_DiceHelper.convertCalledShotToMod(ev.target.value);
                    limitDV = SR5_DiceHelper.convertCalledShotToLimitDV(ev.target.value);
                    if (html.find('[data-modifier="calledShot"]')[0].value === "upTheAnte") {
                            value = value - 4;
                            limitDV = limitDV * 2;
                        }
                    dialogData.calledShot = {
                        limitDV: limitDV,
                        location: ev.target.value,
                        name: html.find('[data-modifier="calledShot"]')[0].value,
                        effects: SR5_DiceHelper.convertCalledShotToEffect(ev.target.value),
                    }
                    break;
                default: value = ev.target.value;
            }
        }

        this.setPosition(position);
        html.find(name)[0].value = value;
        dialogData.dicePoolMod[modifierName] = {
            value: value,
            label: label,
        }
        this.dicePoolModifier[modifierName] = value;
        this.updateDicePoolValue(html);
        if (modifierName === "matrixRange") this._filledInputModifier(html.find('.SR-ModInputFilled'), html, dialogData);
    }

    async _filledSelectModifier(ev, html, dialogData){
        if (ev.length === 0) return;
        let modifierName, targetInput, targetInputName, name, inputValue, selectValue;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.actorId),
            label;

        for (let e of ev){
            modifierName = $(e).attr("data-modifier");
            targetInput = $(e).attr("data-target");
            targetInputName = `[name=${targetInput}]`;
            name = `[data-modifier=${modifierName}]`;

            switch (modifierName){
                case "incomingFiringMode":
                    selectValue = dialogData.incomingFiringMode;
                    inputValue = SR5_DiceHelper.convertFiringModeToDefenseDicepoolMod(selectValue);
                    break;
                case "targetRange":
                    selectValue = dialogData.targetRange;
                    let baseRange = SR5_DiceHelper.convertRangeToEnvironmentalLine(dialogData.targetRange);
                    baseRange += actor.system.itemsProperties.environmentalMod.range.value;
                    inputValue = SR5_DiceHelper.convertEnvironmentalModToDicePoolMod(baseRange);
                    label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    break;
                case "firingMode":
                    inputValue = this.calculRecoil(html);
                    selectValue = null;
                    dialogData.firingModeSelected = html.find(name)[0].value;
                    modifierName = "recoil";
                    break;
                case "spiritType":
                    selectValue = html.find(name)[0].value;
                    inputValue = actor.system.skills.summoning.spiritType[selectValue].dicePool - actor.system.skills.summoning.test.dicePool;
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.spiritTypes[selectValue])})`;
                    dialogData.spiritType = selectValue;
                    break;
                case "spriteType":
                    dialogData.spriteType = html.find(name)[0].value;
                    continue;
                case "preparationTrigger":
                    inputValue = SR5_DiceHelper.convertTriggerToMod(html.find('[data-modifier="preparationTrigger"]')[0].value);
                    dialogData.drainMod.trigger = inputValue;
                    dialogData.preparationTrigger = html.find('[data-modifier="preparationTrigger"]')[0].value;
                    dialogData.drainMod.trigger = {
                        value: inputValue,
                        label: `${game.i18n.localize(SR5.drainModTypes[modifierName])} (${game.i18n.localize(SR5.preparationTriggerTypes[dialogData.preparationTrigger])})`,
                    };
                    this.drainModifier.preparationTrigger = inputValue;
                    this.updateDrainValue(html);
                    continue;
                case "searchType":
                    selectValue = html.find(name)[0].value;
                    inputValue = SR5_DiceHelper.convertSearchTypeToThreshold(selectValue);
                    dialogData.threshold = inputValue;
                    dialogData.thresholdType = selectValue;
                    html.find(targetInputName)[0].value = inputValue;
                    continue;
                case "damageType":
                    dialogData.damageType = html.find(name)[0].value;
                    continue;
                case "socialResult":
                case "socialAttitude":
                    inputValue = 0;
                    break;
                case "speedRammingAttacker":
                    selectValue = SR5_DiceHelper.convertSpeedToDamageValue(html.find(name)[0].value, actor.system.attributes.body.augmented.value);
                    dialogData.damageValue = selectValue;
                    html.find('[name="modifiedDamage"]')[0].value = selectValue;
                    continue;
                case "speedRammingTarget":
                    selectValue = SR5_DiceHelper.convertSpeedToAccidentValue(html.find(name)[0].value, dialogData.target);
                    dialogData.accidentValue = selectValue;
                    html.find(targetInputName)[0].value = selectValue;
                    continue;
                case "targetEffect":
                    selectValue = html.find(name)[0].value;
                    dialogData.targetEffect = selectValue;
                    if (dialogData.typeSub === "counterspelling"){
                        let spellCategory = await this.getTargetType(dialogData.targetEffect);
                        inputValue = parseInt(actor.system.skills.counterspelling.spellCategory[spellCategory].dicePool - actor.system.skills.counterspelling.test.dicePool);
                        label = `${game.i18n.localize(SR5.dicePoolModTypes["spellCategory"])} (${game.i18n.localize(SR5.spellCategories[spellCategory])})`;
                    } else inputValue = 0;
                    break;
            }

            html.find(targetInputName)[0].value = inputValue;
            if (selectValue) html.find(name)[0].value = selectValue;
            dialogData.dicePoolMod[modifierName] = {
                value: inputValue,
                label: label,
            }
            this.dicePoolModifier[modifierName] = inputValue;
            this.updateDicePoolValue(html);
        }
    }

    //Manage auto filled threhsold
    _filledThreshold(ev, html, dialogData){
        if (ev.length === 0) return;
        let targetInput, name, value, label;

        for (let e of ev){
            targetInput = $(e).attr("data-target");
            if (targetInput === "survivalThreshold") {
                value = 1;
                label = "mild";
            } else if (targetInput === "restraintThreshold"){
                value = 2;
                label = "rope";
            } else if (targetInput === "perceptionThreshold"){
                value = 0;
                label = "opposed";
            }
        }

        name = `[name=${targetInput}]`;
        html.find(name)[0].value = value;
        dialogData.threshold = value;
        dialogData.thresholdType = label;
    }

    //Manage threhsold
    _manageThreshold(ev, html, dialogData){
        let value, label;
        let targetInput = $(ev.currentTarget).attr("data-target");
        
        label = ev.target.value;
        value = ev.target.value;
        if (targetInput === "survivalThreshold") value = SR5_DiceHelper.convertSurvivalThresholdTypeToThreshold(ev.target.value);
        else if (targetInput === "restraintThreshold") value = SR5_DiceHelper.convertRestraintTypeToThreshold(ev.target.value);
        else if (targetInput === "perceptionThreshold") value = SR5_DiceHelper.convertPerceptionTypeToThreshold(ev.target.value);

        let name = `[name=${targetInput}]`;
        html.find(name)[0].value = value;
        dialogData.threshold = value;
        dialogData.thresholdType = label;
    }

    _updateReagents(value, actor, html, dialogData){
        if (value > actor.system.magic.reagents){
            value = actor.system.magic.reagents;
            ui.notifications.warn(game.i18n.format('SR5.WARN_MaxReagents', {reagents: value}));
            if (dialogData.type === "ritual") html.find('[name="force"]')[0].value = value;
        }
        html.find('[data-modifier="reagents"]')[0].checked = true;
        html.find('[name="reagentsSpent"]')[0].value = value;
        dialogData.reagentsUsed = true;
        if (dialogData.type !== "ritual"){
            this.limitModifier.reagents = value;
            this.updateLimitValue(html);
        }
    }

    //Add full defense modifier on dialog start
    _addFullDefenseModifierOnStart(html, dialogData, actor){
        let fullDefenseEffect = actor.effects.find(e => e.origin === "fullDefense");
		let isInFullDefense = (fullDefenseEffect) ? true : false;
        if (isInFullDefense){
            html.find('[data-modifier="fullDefense"]')[0].checked = true;
            html.find('[name="dicePoolModFullDefense"]')[0].value = dialogData.defenseFull;
            dialogData.dicePoolMod.defenseFull = {
                value: dialogData.defenseFull,
                label: game.i18n.localize(SR5.dicePoolModTypes["fullDefense"]),
            }
            this.dicePoolModifier.fullDefense = dialogData.defenseFull;
            this.updateDicePoolValue(html);
        }
    }

    //Toggle reset recoil
    _onResetRecoil(ev, html, dialogData, actor){
        ev.preventDefault();
        let resetedActor = SR5_EntityHelpers.getRealActorFromID(actor._id)
        resetedActor.resetRecoil();
        dialogData.rc += actor.flags.sr5.cumulativeRecoil;
        dialogData.dicePoolMod.recoil.value = 0;
        actor.flags.sr5.cumulativeRecoil = 0;
        let recoil = this.calculRecoil(html);
        html.find('[name="recoil"]')[0].value = recoil;
        this.dicePoolModifier.recoil = recoil;
        this.updateDicePoolValue(html);
    }

    //Toggle reset defense
    _onResetDefense(ev, html, dialogData, actor){
        ev.preventDefault();
        let resetedActor = SR5_EntityHelpers.getRealActorFromID(actor._id)
        resetedActor.resetCumulativeDefense();
        dialogData.dicePoolMod.cumulativeDefense.value = 0;
        actor.flags.sr5.cumulativeDefense = 0;
        html.find('[data-modifier="cumulativeDefense"]')[0].value = 0;
        this.dicePoolModifier.cumulativeDefense = 0;
        this.updateDicePoolValue(html);
    }

    //Handle Extended Test
    _onToggleExtendedTest(isChecked, dialogData, html){
        let position = this.position;
        position.height = "auto";    

        if (isChecked) {
            dialogData.extendedTest = true;
            $(html).find('#extendedBlock').show();
            this.setPosition(position);
        }
        else {
            dialogData.extendedTest = false;
            $(html).find('#extendedBlock').hide();
            this.setPosition(position);
        }
    }

}