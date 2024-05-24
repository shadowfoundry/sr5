import { SR5 } from "../config.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_PrepareRollHelper } from "./roll-prepare-helpers.js";
import { SR5_ConverterHelpers } from "./roll-helpers/converter.js";
import { SR5_CombatHelpers } from "./roll-helpers/combat.js";
import { SR5_MiscellaneousHelpers } from "./roll-helpers/miscellaneous.js";
import { SR5_CalledShotHelpers } from "./roll-helpers/calledShot.js";
import { SR5Combat } from "../system/srcombat.js";

export default class SR5_RollDialog extends Dialog {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            height: 'auto',
            width: 450,
            resizable: false,
        });
    }

    updateDicePoolValue(html) {
        let dicePoolModifier = 0;
        for (let key of Object.values(this.data.data.dicePool.modifiers)){
            dicePoolModifier += key.value;
        }
        if (html.find('[name="dicePoolModifiers"]').length) html.find('[name="dicePoolModifiers"]')[0].value = dicePoolModifier;
        let modifiedDicePool = dicePoolModifier + parseInt(html.find('[name="baseDicePool"]')[0].value);
        this.data.data.dicePool.base = parseInt(html.find('[name="baseDicePool"]')[0].value);
        if (modifiedDicePool < 0) modifiedDicePool = 0;
        html.find('[data-button="roll"]')[0].innerHTML = `<i class="fas fa-dice-six"></i> ${game.i18n.localize("SR5.RollDice")} (${modifiedDicePool})`;
    }

    updateLimitValue(html) {
        if (html.find('[name="baseLimit"]')[0]){
            let modifiedLimit = parseInt(html.find('[name="baseLimit"]')[0].value)
            let limitModifier = 0;
            for (let key of Object.values(this.data.data.limit.modifiers)){
                limitModifier += key.value;
                //if (key === "reagents") modifiedLimit = value;
            }
            modifiedLimit += limitModifier;
            if (modifiedLimit < 0) modifiedLimit = 0;
            html.find('[name="modifiedLimit"]')[0].value = modifiedLimit;
            this.data.data.limit.base = parseInt(html.find('[name="baseLimit"]')[0].value);
        }
    }

    updateDrainValue(html) {
        this.data.data.magic.force = parseInt(html.find('[name="force"]')[0].value);
        if (html.find('[name="drainValue"]')[0]){
            let drainModifier = 0;
            for (let key of Object.values(this.data.data.magic.drain.modifiers)){
                drainModifier += key.value;
            }
            let drainFinalValue = parseInt(html.find('[name="force"]')[0].value) + drainModifier;
            if (drainFinalValue < 2) drainFinalValue = 2
            html.find('[name="drainValue"]')[0].value = drainFinalValue;
            this.data.data.magic.drain.value = drainFinalValue;
        }
    }

    updateFadingValue(html) {
        this.data.data.matrix.level = parseInt(html.find('[name="level"]')[0].value);
        if (html.find('[name="fadingValue"]')[0]){
            let fadingModifier = 0;
            for (let key of Object.values(this.data.data.matrix.fading.modifiers)){
                fadingModifier += key.value;
            }
            let fadingFinalValue = parseInt(html.find('[name="level"]')[0].value) + fadingModifier;
            if (fadingFinalValue < 2) fadingFinalValue = 2
            html.find('[name="fadingValue"]')[0].value = fadingFinalValue;
            this.data.data.matrix.fading.value = fadingFinalValue;
        }
    }

    calculRecoil(html){
        let firingModeValue,
            dialogData = this.data.data;

        if (dialogData.combat.firingMode.selected === "SS" || dialogData.combat.firingMode.selected === "SF"){
            firingModeValue = 0;
            $(html).find(".hideBulletsRecoil").hide();
        } else firingModeValue = SR5_ConverterHelpers.firingModeToBullet(dialogData.combat.firingMode.selected);

        dialogData.combat.ammo.fired = SR5_ConverterHelpers.firingModeToBullet(dialogData.combat.firingMode.selected);
        html.find('[name="recoilBullets"]')[0].value = firingModeValue;
        html.find('[name="recoilCumulative"]')[0].value = dialogData.combat.recoil.cumulative;
        if (dialogData.combat.recoil.compensationWeapon < 1) $(html).find(".hideWeaponRecoil").hide();
        if (dialogData.combat.recoil.cumulative < 1) $(html).find(".hideCumulativeRecoil").hide();

        let modifiedRecoil = (dialogData.combat.recoil.compensationActor + dialogData.combat.recoil.compensationWeapon) - (firingModeValue + dialogData.combat.recoil.cumulative);
        if (modifiedRecoil > 0) modifiedRecoil = 0;
        return modifiedRecoil || 0;
    }

    //Toggle reset recoil
    _onResetRecoil(ev, html, dialogData, actor){
        ev.preventDefault();
        let resetedActor = SR5_EntityHelpers.getRealActorFromID(actor._id)
        resetedActor.resetRecoil();
        dialogData.combat.recoil.cumulative = 0;
        dialogData.combat.recoil.value = dialogData.combat.recoil.compensationActor;
        let recoil = this.calculRecoil(html);
        this.setPosition(this.position);
        html.find('[name="recoil"]')[0].value = recoil;
        dialogData.dicePool.modifiers.recoil = {
            value: recoil,
            label: game.i18n.localize(SR5.dicePoolModTypes.recoil),
        }
        this.updateDicePoolValue(html);
    }

    async getTargetType(target){
        let item = await fromUuid(target);
        if (item?.type === "itemSpell") return item.system.category;
        else return null;
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.dicePoolModifier = {};
        this.limitModifier = {};
        this.drainModifier = {};
        this.fadingModifier = {};
        let dialogData = this.data.data;
        let actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorId);

        this.updateDicePoolValue(html);
        this.updateLimitValue(html);

        //Show some block on initial draw
        if (dialogData.test.type === "ritual") {
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
        html.find('[name="extendedTime"]').change(ev => this._onChangeExtendedTest(ev.target.checked, dialogData, html));
        html.find('[name="extendedMultiplier"]').change(ev => this._onChangeExtendedTest(ev.target.checked, dialogData, html));

        //auto fill extended test if data are already present
        if (dialogData.test.isExtended){
            html.find('[name="toggleExtendedTest"]')[0].checked = true;
            html.find('[name="extendedTime"]')[0].value = dialogData.test.extended.interval;
            html.find('[name="extendedMultiplier"]')[0].value = dialogData.test.extended.multiplier;
            $(html).find('#extendedBlock').show();
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

        let actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorId);

        switch (modifierName){
            case "socialReputation":
                value = actor.system.streetCred.value;
                break;
            case "workingFromMemory":
                if (actor.system.attributes.logic.augmented.value >= 5) value = 0;
                else value = -(5 - actor.system.attributes.logic.augmented.value);
                break;
            case "penalty":
                value = actor.system.penalties.condition?.actual.value + actor.system.penalties.matrix?.actual.value + actor.system.penalties.magic?.actual.value + actor.system.penalties.special?.actual.value;;
                break;
            case "fullDefense":
                value = actor.system.specialProperties.fullDefenseValue || 0;
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
                dialogData.combat.actions = [];
                if (isChecked) {
                    value = 3;
                    dialogData.combat.actions = SR5_MiscellaneousHelpers.addActions(dialogData.combat.actions, {type: "simple", value: 1, source: "castRecklessSpell"});
                } else {
                    dialogData.combat.actions = SR5_MiscellaneousHelpers.addActions(dialogData.combat.actions, {type: "complex", value: 1, source: "castSpell"});
                }
                html.find(name)[0].value = value;
                dialogData.magic.drain.modifiers.recklessSpellcasting = {
                    value: value,
                    label: game.i18n.localize(SR5.drainModTypes[modifierName]),
                }
                this.drainModifier.recklessSpellcasting = value;
                this.updateDrainValue(html);             
                return;
            case "spiritAid":
                value = dialogData.magic.spiritAid.modifier;
                break;
            case "centering":
                value = actor.system.magic.metamagics.centeringValue.value;
                if (isChecked) dialogData.combat.actions = SR5_MiscellaneousHelpers.addActions(dialogData.combat.actions, {type: "free", value: 1, source: "useCentering"});
                break;
            case "restraintReinforced":
                if (isChecked) value = 1;
                html.find(name)[0].value = value;
                let threshold = parseInt(html.find('[name="restraintThreshold"]')[0].value);
                dialogData.threshold.value = threshold + 1;
                return;
            case "defenseProneFar":
                value = 4;
                break;
            case "specificallyLooking":
            case "defenseInsideVehicle":
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
            case "defenseRunning":
            case "attackCharge":
            case "attackSuperiorPosition":
            case "attackTouchOnly":
                value = 2;
                break;
            case "controlAvailable":
            case "socialIsDistracted":
            case "socialAuthority":
            case "defenseReceivingCharge":
            case "attackFriendsInMelee":
            case "attackOpponentProne":
            case "attackTakeAim":
                value = 1;
                break;
            case "socialIsDistractedInverse":
            case "socialIntoxicated":
            case "socialEvaluateSituation":
            case "attackProne":
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
            case "defenseProne":
            case "defenseProneClose":
            case "defenseTargetedByArea":
            case "attackWrongHand":
            case "attackFromVehicle":
            case "attackIsRunning":
                value = -2;
                break;
            case "farAway":
            case "defenseInMelee":
            case "attackWithImagingDevice":
            case "attackInMelee":
                value = -3;
                break;
            case "attackBlindFire":
                value = -6;
                break;
        }

        if (isChecked){
            html.find(name)[0].value = value;
            dialogData.dicePool.modifiers[modifierName] = value;
            dialogData.dicePool.modifiers[modifierName] = {
                value: value,
                label: label,
            }
            this.updateDicePoolValue(html);
        } else {
            html.find(name)[0].value = 0;
            dialogData.dicePool.modifiers[modifierName] = {
                value: 0,
                label: label,
            }
            this.updateDicePoolValue(html);
        }
    }

    //Auto check checkbox modifiers
    _filledCheckBox(checkboxs, html, dialogData){
        if (checkboxs.length === 0) return;
        let checkboxName, modifierName, inputName, value;

        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.owner.actorId),
            targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.target.actorId),
            label, 
            isProned = actor.effects.find(e => e.statuses.has("prone"));
        
        for (let e of checkboxs){
            modifierName = $(e).attr("data-modifier");
            checkboxName = `[data-modifier=${modifierName}]`;
            inputName = `[name=${$(e).attr("data-target")}]`;
            label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);

            switch (modifierName){
                case "patientAwakenedOrEmerged":
                    if (targetActor?.system.specialAttributes.magic.augmented.value > 0 || targetActor?.system.specialAttributes.resonance.augmented.value > 0){
                        html.find(checkboxName)[0].checked = true;
                        value = -2;
                        html.find(inputName)[0].value = value;
                        dialogData.dicePool.modifiers[modifierName] = {
                            value: value,
                            label: label,
                        }
                        this.updateDicePoolValue(html);
                    }
                    continue;
                case "fullDefense":
                    let fullDefenseEffect = actor.effects.find(e => e.origin === "fullDefense");
		            let isInFullDefense = (fullDefenseEffect) ? true : false;
                    if (isInFullDefense){
                        html.find(checkboxName)[0].checked = true;
                        value = actor.system.specialProperties.fullDefenseValue || 0;
                    }
                    break;
                case "defenseProneClose":
                    if (isProned && dialogData.target.rangeInMeters <= 5){
                        html.find(checkboxName)[0].checked = true;
                        value = -2;
                    }
                    break;
                case "defenseProneFar":
                    if (isProned && dialogData.target.rangeInMeters >= 20){
                        html.find(checkboxName)[0].checked = true;
                        value = 4;
                    }
                    break;
                case "defenseProne":
                    if (isProned){
                        html.find(checkboxName)[0].checked = true;
                        value = -2;
                    }
                    break;
                case "defenseTargetedByArea":
                    html.find(checkboxName)[0].checked = true;
                    value = -2;
                    break;
            }

            if (html.find(checkboxName)[0].checked){
                html.find(inputName)[0].value = value;
                dialogData.dicePool.modifiers[modifierName] = {
                    value: value,
                    label: label,
                }
                this.updateDicePoolValue(html);
            }
        }

        
    }

    //Manage manual input modifier
    _manualInputModifier(ev, html, dialogData, button = false){
        let target, name, modifierName, value, operator;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.owner.actorId);
        let targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.target.actorId);

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
                if (html.find('#force').length) {
                    html.find('#force')[0].value = value;
                    dialogData.limit.base = value;
                }
                if (dialogData.test.type === "ritual") this._updateReagents(value, actor, html, dialogData);
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
                dialogData.magic.spell.area = -value;
                break;
            case "manaBarrierRating":
                let barrierRating = parseInt((html.find('[name="manaBarrierRating"]')[0].value || 1));
                html.find('[name="baseDicePool"]')[0].value = barrierRating * 2;
                this.data.data.dicePool.value = barrierRating * 2;
                this.updateDicePoolValue(html);
                return;
            case "patientEssence":
                value = -Math.floor((6 - Math.ceil(value))/2);
                html.find('[name="dicePoolModPatientEssence"]')[0].value = value;
                dialogData.dicePool.modifiers.patientEssence = {
                    value: value,
                    label: `${game.i18n.localize(SR5.dicePoolModTypes[target])} (${value})`,
                }
                this.updateDicePoolValue(html);
                return;
            case "limitModHealingSupplies":
            case "limitModPerception":
            case "limitModVarious":
                html.find(name)[0].value = value;
                dialogData.limit.modifiers[modifierName] = {
                    value: value,
                    label: `${game.i18n.localize(SR5.limitModTypes[modifierName])}`,
                }
                this.limitModifier[modifierName] = value;
                this.updateLimitValue(html);
                return;
        }

        html.find(name)[0].value = value;
        dialogData.dicePool.modifiers[modifierName] = {
            value: value,
            label: game.i18n.localize(SR5.dicePoolModTypes[modifierName]),
        }
        this.updateDicePoolValue(html);
    }

    _filledInputModifier(ev, html, dialogData){
        if (ev.length === 0) return;
        let modifierName, name, value;
        let actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorId),
            targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.target.actorId),
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
                        let rangeMod = dialogData.matrix.noiseRangeValue || 0,
                            sceneNoise = dialogData.matrix.noiseScene || 0,
                            actorNoise = dialogData.matrix.personalNoise || 0;
                        value = actor.system.matrix.attributes.noiseReduction.value;
                        if (-value < rangeMod + sceneNoise + actorNoise) value = -(rangeMod + sceneNoise + actorNoise);
                        if (rangeMod + sceneNoise + actorNoise === 0) value = 0;
                    }
                    break;
                case "matrixSceneNoise":
                    if (html.find('[data-modifier="matrixRange"]')[0].value !== "wired") value = dialogData.matrix.noiseScene;
                    else value = 0;
                    break;
                case "matrixActorNoise":
                    if (html.find('[data-modifier="matrixRange"]')[0].value !== "wired") value = dialogData.matrix.personalNoise;
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
                    if (dialogData.test.type === "ritual") this._updateReagents(1, actor, html, dialogData);
                    continue;
                case "level":
                    this.updateFadingValue(html)
                    continue;
                case "spiritType":
                    if (dialogData.target.actorId && (dialogData.test.typeSub === "binding")){
                        value = actor.system.skills.binding.spiritType[targetActor.system.type].dicePool - actor.system.skills.binding.test.dicePool;
                        label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.spiritTypes[targetActor.system.type])})`;
                    } else {
                        value = 0;
                    }
                    break;
                case "patientEssence":
                    let patientEssence = (targetActor?.system.essence.value ? targetActor.system.essence.value : 6);
                    html.find('[name="patientEssence"]')[0].value = patientEssence;
                    value = -Math.floor((6 - Math.ceil(patientEssence))/2);
                    html.find('[name="dicePoolModPatientEssence"]')[0].value = value;
                    dialogData.dicePool.modifiers.patientEssence = {
                        value: value,
                        label: `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${patientEssence})`,
                    }
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
            dialogData.dicePool.modifiers[modifierName] = {
                value: value,
                label: label,
            }
            this.updateDicePoolValue(html);
        }
    }

    //Select modifiers
    async _selectModifiers(ev, html, dialogData){
        let target = $(ev.currentTarget).attr("data-target"),
            name = `[name=${target}]`,
            modifierName = $(ev.currentTarget).attr("data-modifier"),
            value, limitDV, action, rangeType,
            actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorId),
            label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]),
            position = this.position,
            chokeLimitModify, chokeLimitModified, weapon;

        position.height = "auto";

        if (ev === null) value = 0;
        else {
            switch (modifierName){
                case "weather":
                    value = SR5_ConverterHelpers.weatherConditionToMod(ev.target.value);
                    break;
                case "socialAttitude":
                    value = SR5_ConverterHelpers.socialAttitudeToMod(ev.target.value);
                    break;
                case "socialResult":
                    value = SR5_ConverterHelpers.socialResultToMod(ev.target.value);
                    break;
                case "workingCondition":
                    value = SR5_ConverterHelpers.workingConditionToMod(ev.target.value);
                    break;
                case "toolsAndParts":
                    value = SR5_ConverterHelpers.toolsAndPartsToMod(ev.target.value);
                    break;
                case "plansMaterial":
                    value = SR5_ConverterHelpers.plansMaterialToMod(ev.target.value);
                    break;
                case "attribute":
                    if (ev.target.value === "none") value = 0;
                    else value = actor.system.attributes[ev.target.value].augmented.value;
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.allAttributes[ev.target.value])})`;
                    break;
                case "incomingFiringMode":
                    value = SR5_ConverterHelpers.firingModeToDefenseMod(ev.target.value);
                    label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    break;
                case "targetRange":
                    let baseRange = SR5_ConverterHelpers.rangeToEnvironmentalLine(ev.target.value);
                    baseRange += actor.system.itemsProperties.environmentalMod.range.value;
                    value = SR5_ConverterHelpers.environmentalLineToMod(baseRange);
                    label = label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    dialogData.target.range = ev.target.value;
                    // Handle choke 
                    if (dialogData.combat.weaponType === "shotgun") {
                        dialogData.combat.choke.damageModify = SR5_PrepareRollHelper.chokeSettingsOnDamage(dialogData.combat.choke.selected, dialogData.target.range);
                        chokeLimitModify = SR5_PrepareRollHelper.chokeSettingsOnLimit(dialogData.combat.choke.selected, dialogData.target.range);
                        dialogData.combat.choke.defense = SR5_PrepareRollHelper.chokeSettingsOnDefense(dialogData.combat.choke.selected, dialogData.target.range);
                        chokeLimitModified = Object.keys(dialogData.limit.modifiers).find(e => e === "chokeSettings");
                        if (chokeLimitModify && !chokeLimitModified) {                     
                            dialogData.limit.modifiers["chokeSettings"] = {
                                value: chokeLimitModify,
                                label: `${game.i18n.localize(SR5.chokeSettings[dialogData.combat.choke.selected])}`,
                            }                        
                        html.find("[name=chokeSettings]")[0].value = chokeLimitModify;
                        this.limitModifier[modifierName] = chokeLimitModify;
                        this.updateLimitValue(html);
                        dialogData.combat.choke.limit = chokeLimitModify;
                        } 
                    }
                    break;
                case "chokeSettings":
                    dialogData.combat.choke.selected = ev.target.value;
                    html.find(name)[0].value = value;
                    label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    dialogData.combat.choke.damageModify = SR5_PrepareRollHelper.chokeSettingsOnDamage(ev.target.value, dialogData.target.range);
                    chokeLimitModify = SR5_PrepareRollHelper.chokeSettingsOnLimit(ev.target.value, dialogData.target.range);
                    dialogData.combat.choke.defense = SR5_PrepareRollHelper.chokeSettingsOnDefense(dialogData.combat.choke.selected, dialogData.target.range);
                    value = chokeLimitModify;
                    chokeLimitModified = Object.keys(dialogData.limit.modifiers).find(e => e === "chokeSettings");
                    if (chokeLimitModify && !chokeLimitModified) {                         
                        dialogData.limit.modifiers[modifierName] = {
                          value: chokeLimitModify,
                          label: `${game.i18n.localize(SR5.chokeSettings[dialogData.combat.choke.selected])}`,
                        }
                        this.limitModifier[modifierName] = chokeLimitModify;
                        this.updateLimitValue(html);
                        dialogData.combat.choke.limit = chokeLimitModify;
                    }
                    //actions
                    weapon = await fromUuid(dialogData.owner.itemUuid);
                    if (weapon.system.choke.current !== dialogData.combat.choke.selected && !dialogData.combat.choke.actionSpent){
                        action = [{type: "simple", value: 1, source: "changeChokeSettings"}];
                        if (weapon.system.isWireless && (weapon.system.accessory.find(a => a.name === "smartgunSystemInternal" || a.name === "smartgunSystemExternal")) && (actor.system.specialProperties.smartlink.value > 0)) action = [{type: "free", value: 1, source: "changeChokeSettings"}];
                        SR5Combat.changeActionInCombat(dialogData.owner.actorId, action);
                        dialogData.combat.choke.actionSpent = true;
                    } else if (weapon.system.choke.current === dialogData.combat.choke.selected && dialogData.combat.choke.actionSpent){
                        action = [{type: "simple", value: -1, source: "changeChokeSettings"}];
                        if (weapon.system.isWireless && (weapon.system.accessory.find(a => a.name === "smartgunSystemInternal" || a.name === "smartgunSystemExternal")) && (actor.system.specialProperties.smartlink.value > 0)) action = [{type: "free", value: -1, source: "changeChokeSettings"}];
                        SR5Combat.changeActionInCombat(dialogData.owner.actorId, action);
                        dialogData.combat.choke.actionSpent = false;
                    }

                    break;
                case "firingMode":
                    dialogData.combat.firingMode.selected = ev.target.value;
                    value = this.calculRecoil(html);
                    action = SR5_ConverterHelpers.firingModeToAction(ev.target.value);
                    dialogData.combat.actions = SR5_MiscellaneousHelpers.addActions(dialogData.combat.actions, action);
                    modifierName = "recoil";
                    label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    //actions
                    weapon = await fromUuid(dialogData.owner.itemUuid);
                    if (weapon.system.firingMode.current !== dialogData.combat.firingMode.selected && !dialogData.combat.firingMode.actionSpent){
                        action = [{type: "simple", value: 1, source: "changeFiringMode"}];
                        if (weapon.system.isWireless && (weapon.system.accessory.find(a => a.name === "smartgunSystemInternal" || a.name === "smartgunSystemExternal")) && (actor.system.specialProperties.smartlink.value > 0)) action = [{type: "free", value: 1, source: "changeFiringMode"}];
                        SR5Combat.changeActionInCombat(dialogData.owner.actorId, action);
                        dialogData.combat.firingMode.actionSpent = true;
                    } else if (weapon.system.firingMode.current === dialogData.combat.firingMode.selected && dialogData.combat.firingMode.actionSpent){
                        action = [{type: "simple", value: -1, source: "changeFiringMode"}];
                        if (weapon.system.isWireless && (weapon.system.accessory.find(a => a.name === "smartgunSystemInternal" || a.name === "smartgunSystemExternal")) && (actor.system.specialProperties.smartlink.value > 0)) action = [{type: "free", value: -1, source: "changeFiringMode"}];
                        SR5Combat.changeActionInCombat(dialogData.owner.actorId, action);
                        dialogData.combat.firingMode.actionSpent = false;
                    }
                    break;
                case "defenseMode":
                    value = SR5_ConverterHelpers.activeDefenseToMod(ev.target.value, dialogData.combat.activeDefenses);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.characterDefenses[ev.target.value])})`;
                    dialogData.combat.activeDefenseSelected = ev.target.value;
                    break;
                case "cover":
                    value = SR5_ConverterHelpers.coverToMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.coverTypes[ev.target.value])})`;
                    if (ev.target.value === "partial") {
                        SR5_EntityHelpers.addEffectToActor(actor, "cover");
                        SR5_EntityHelpers.deleteEffectOnActor(actor, "coverFull");
                    } else if (ev.target.value === "full") {
                        SR5_EntityHelpers.addEffectToActor(actor, "coverFull");
                        SR5_EntityHelpers.deleteEffectOnActor(actor, "cover");
                    }
                    else {
                       SR5_EntityHelpers.deleteEffectOnActor(actor, "cover");
                       SR5_EntityHelpers.deleteEffectOnActor(actor, "coverFull");
                    }
                    break
                case "mark":
                    value = SR5_ConverterHelpers.markToMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${ev.target.value})`;
                    dialogData.matrix.mark = parseInt(ev.target.value);
                    break;
                case "matrixRange":
                    value = SR5_ConverterHelpers.matrixDistanceToMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.matrixNoiseDistance[ev.target.value])})`;
                    if (ev.target.value !== "wired") {
                        if (html.find('#matrixNoiseScene')) $(html).find('#matrixNoiseScene').show();
                        if (html.find('#matrixNoiseReduction')) $(html).find('#matrixNoiseReduction').show();
                        if (html.find('#matrixTargetGrid')) $(html).find('#matrixTargetGrid').show();
                        if (dialogData.target.grid !== actor.system.matrix.userGrid) {
                            html.find('[name="dicePoolModTargetGrid"]')[0].value = -2;
                            dialogData.dicePool.modifiers.targetGrid = {
                                value: -2,
                                label: `${game.i18n.localize(SR5.dicePoolModTypes["targetGrid"])} (${game.i18n.localize(SR5.gridTypes[html.find('[data-modifier="targetGrid"]')[0].value])})`,
                            }
                            this.dicePoolModifier.targetGrid = -2;
                        }
                        if ((dialogData.matrix.personalNoise < 0) && (html.find('#matrixNoiseActor'))) $(html).find('#matrixNoiseActor').show();
                    } else {
                        if (html.find('#matrixNoiseScene')) $(html).find('#matrixNoiseScene').hide();
                        if (html.find('#matrixNoiseReduction')) $(html).find('#matrixNoiseReduction').hide();
                        if (html.find('#matrixTargetGrid')) $(html).find('#matrixTargetGrid').hide();
                        if (html.find('#matrixNoiseActor')) $(html).find('#matrixNoiseActor').hide();
                        html.find('[name="dicePoolModTargetGrid"]')[0].value = 0;
                    }
                    dialogData.matrix.noiseRangeValue = value;
                    dialogData.matrix.noiseRange = ev.target.value;
                    break;
                case "targetGrid":
                    if (ev.target.value !== actor.system.matrix.userGrid && ev.target.value !== "none") {
                        value = -2
                        label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.gridTypes[ev.target.value])})`;
                    } else value = 0;
                    break;
                case "spriteType":
                    dialogData.matrix.spriteType = ev.target.value;
                    return;
                case "spiritType":
                    if (ev.target.value !== ""){
                        html.find(name)[0].value = actor.system.skills.summoning.spiritType[ev.target.value].dicePool - actor.system.skills.summoning.test.dicePool;
                        dialogData.dicePool.composition = SR5_PrepareRollHelper.getDicepoolComposition(actor.system.skills.summoning.spiritType[ev.target.value].modifiers);
                        dialogData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(dialogData);
                        dialogData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(dialogData, actor.system.skills.summoning.spiritType[ev.target.value].modifiers);
                    } 
                    dialogData.magic.spiritType = ev.target.value;
                    this.updateDicePoolValue(html);
                    return;
                case "preparationTrigger":
                    value = SR5_ConverterHelpers.triggerToMod(ev.target.value);
                    html.find(name)[0].value = value;
                    dialogData.magic.drain.modifiers.trigger = {
                        value: value,
                        label: `${game.i18n.localize("SR5.PreparationTrigger")} (${game.i18n.localize(SR5.preparationTriggerTypes[ev.target.value])})`,
                    };
                    dialogData.magic.preparationTrigger = ev.target.value;
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
                            dialogData.dicePool.modifiers.environmentalSceneMod = {
                                value: SR5_CombatHelpers.handleEnvironmentalModifiers(game.scenes.active, actor.system, true),
                                label: game.i18n.localize(SR5.dicePoolModTypes["environmentalSceneMod"]),
                            }
                            label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.perceptionTypes[ev.target.value])})`;
                        }
                        html.find('[data-modifier="environmentalSceneMod"]')[0].value = dialogData.dicePool.modifiers.environmentalSceneMod.value;
                        this.dicePoolModifier.environmental = dialogData.dicePool.modifiers.environmentalSceneMod.value;
                    } else {
                        $(html).find('#sightPerception').hide();
                        dialogData.dicePool.modifiers.environmentalSceneMod = {
                            value: 0,
                            label: game.i18n.localize(SR5.dicePoolModTypes["environmentalSceneMod"]),
                        }
                        this.dicePoolModifier.environmental = 0;
                    }
                    dialogData.various.perceptionType = ev.target.value;
                    dialogData.limit.modifiers.perception = {
                        value: limitMod,
                        label: `${game.i18n.localize(SR5.limitModTypes["perception"])} (${game.i18n.localize(SR5.perceptionTypes[ev.target.value])})`,
                    }
                    this.limitModifier.perceptionType = limitMod;
                    html.find('[name="limitModPerception"]')[0].value = limitMod;
                    this.updateLimitValue(html);
                    break;
                case "signatureSize":
                    value = SR5_ConverterHelpers.signatureToMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.targetSignature[ev.target.value])})`;
                    break;
                case "searchType":
                    value = SR5_ConverterHelpers.searchTypeToThreshold(ev.target.value);
                    dialogData.threshold.value = value;
                    dialogData.threshold.type = ev.target.value;
                    html.find(name)[0].value = value;
                    return;
                case "damageType":
                    dialogData.damage.type = ev.target.value;
                    return;
                case "healingCondition":
                    value = SR5_ConverterHelpers.healingConditionToMod(ev.target.value);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.healingConditions[ev.target.value])})`;
                    dialogData.healingCondition = ev.target.value;
                    break;
                case "healingSupplies":
                    dialogData.limit.modifiers.healingSupplies = {value:0,};
                    html.find('[name="limitModHealingSupplies"]')[0].value = 0;
                    switch(ev.target.value){
                        case "noSupplies":
                            value = -3;
                            break;
                        case "improvised":
                            value = -1;
                            break;
                        case "medkit":
                            let medkit = SR5_MiscellaneousHelpers.findMedkitRating(actor);
                            if (medkit){
                                value = medkit.rating;
                                dialogData.owner.itemUuid = medkit.uuid;
                                dialogData.limit.modifiers.healingSupplies.value = value;
                                dialogData.limit.modifiers.healingSupplies.label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                                html.find('[name="limitModHealingSupplies"]')[0].value = value;
                            } else {
                                ui.notifications.warn(game.i18n.format('SR5.WARN_NoMedkit'));
                                value = 0;
                            }
                            break;
                        default:
                            value = 0;
                    }
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.healingSupplies[ev.target.value])})`;                   
                    this.updateLimitValue(html);
                    break;
                case "speedRammingAttacker":                
                    value = SR5_ConverterHelpers.speedToDamageValue(ev.target.value, actor.system.attributes.body.augmented.value);
                    dialogData.owner.speed = ev.target.value;
                    dialogData.damage.value = value;
                    html.find('[name="modifiedDamage"]')[0].value = value;
                    return;
                case "speedRammingTarget":
                    dialogData.target.speed = ev.target.value;
                    return;
                case "targetEffect":
                    dialogData.target.itemUuid = ev.target.value;
                    if (dialogData.test.typeSub === "counterspelling"){
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
                    if (dialogData.target.hasTarget){
                        let targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.target.actorId);
                        let padded = targetActor.system.itemsProperties.armor.padded ? true : false;
                        value = SR5_CalledShotHelpers.convertCalledShotToMod(ev.target.value, dialogData.combat.ammo.type, padded);
                    } else {
                        value = SR5_CalledShotHelpers.convertCalledShotToMod(ev.target.value, dialogData.combat.ammo.type);
                    }
                    if (ev.target.value === "specificTarget") $(html).find('#calledShotSpecificTarget').show();
                    else $(html).find('#calledShotSpecificTarget').hide();
                    dialogData.combat.calledShot.name = ev.target.value;
                    dialogData.combat.calledShot.effects = SR5_CalledShotHelpers.convertCalledShotToEffect(ev.target.value, dialogData.combat.ammo.type);
                    dialogData.combat.calledShot.limitDV = SR5_CalledShotHelpers.convertCalledShotToLimitDV(ev.target.value, dialogData.combat.ammo.type);
                    switch (ev.target.value){
                        case "shakeUp":
                            dialogData.combat.calledShot.initiative = SR5_CalledShotHelpers.convertCalledShotToInitiativeMod(dialogData.combat.ammo.type);
                            break;
                        case "bullsEye": //Errata: “The attack results in an AP increase equal to the BASE weapon AP multiplied by the number of bullets in the burst with a maximum modifier of x3.”
                            dialogData.combat.armorPenetration = ((dialogData.combat.armorPenetration + 4) * Math.min(dialogData.combat.ammo.fired, 3)) - 4;
                            break;
                        case "hitEmWhereItCounts":
                            if (dialogData.damage.toxin.power > 0) {
                                dialogData.damage.toxin.power += 2;
                                if (dialogData.damage.value > 0) {
                                    dialogData.damage.value += 2;
                                    dialogData.damage.base += 2;
                                }
                            }
                            if (dialogData.damage.toxin.speed > 0) dialogData.damage.toxin.speed -= 1;
                            break;
                        case "throughAndInto":
                            if (!dialogData.target.actorId) {
                                ui.notifications.warn(game.i18n.localize('SR5.WARN_TargetTroughAndInto'));
                                return html.find(ev.currentTarget)[0].value = "";
                            } else {
                                let targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.target.actorId);
                                value = -(targetActor.system.itemsProperties.armor.value + Math.floor(targetActor.system.attributes.body.augmented.value / 2));
                            }
                            break;
                        case "upTheAnte":
                            $(html).find('#calledShotSpecificTarget').show();         
                            break;
                        case "harderKnock":
                            dialogData.damage.type = "physical";
                            break;
                        case "vitals":
                            dialogData.damage.base += 2;
                            dialogData.damage.value += 2;
                            break;
                    }
                    //Manage actions
                    if (ev.target.value !== "") dialogData.combat.actions = SR5_MiscellaneousHelpers.addActions(dialogData.combat.actions, {type: "free", value: 1, source: "calledShot"});
                    else dialogData.combat.actions = SR5_MiscellaneousHelpers.removeActions(dialogData.combat.actions, "calledShot");
                    break;
                case "calledShotSpecificTarget":
                    modifierName = "calledShot";
                    value = SR5_CalledShotHelpers.convertCalledShotToMod(ev.target.value);
                    limitDV = SR5_CalledShotHelpers.convertCalledShotToLimitDV(ev.target.value);
                    if (html.find('[data-modifier="calledShot"]')[0].value === "upTheAnte") {
                            value = value - 4;
                            limitDV = limitDV * 2;
                        }
                    dialogData.combat.calledShot = {
                        limitDV: limitDV,
                        location: ev.target.value,
                        name: html.find('[data-modifier="calledShot"]')[0].value,
                        effects: SR5_CalledShotHelpers.convertCalledShotToEffect(ev.target.value),
                    }
                    break;
                default: value = ev.target.value;
            }
        }

        this.setPosition(position);
        html.find(name)[0].value = value;
        if (modifierName !== "chokeSettings") {
            dialogData.dicePool.modifiers[modifierName] = {
            value: value,
            label: label,
            }
        }
        this.updateDicePoolValue(html);
        if (modifierName === "matrixRange") this._filledInputModifier(html.find('.SR-ModInputFilled'), html, dialogData);
    }

    async _filledSelectModifier(ev, html, dialogData){
        if (ev.length === 0) return;
        let modifierName, targetInput, targetInputName, name, inputValue, selectValue;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.data.data.owner.actorId),
            label, action;

        for (let e of ev){
            modifierName = $(e).attr("data-modifier");
            targetInput = $(e).attr("data-target");
            targetInputName = `[name=${targetInput}]`;
            name = `[data-modifier=${modifierName}]`;

            switch (modifierName){
                case "mark":
                    selectValue = html.find(name)[0].value;
                    inputValue = SR5_ConverterHelpers.markToMod(selectValue);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${inputValue})`;
                    dialogData.matrix.mark = parseInt(selectValue);
                    break;
                case "incomingFiringMode":
                    selectValue = dialogData.combat.firingMode.selected;
                    inputValue = SR5_ConverterHelpers.firingModeToDefenseMod(selectValue);
                    break;
                case "targetRange":
                    selectValue = dialogData.target.range;
                    let baseRange = SR5_ConverterHelpers.rangeToEnvironmentalLine(dialogData.target.range);
                    baseRange += actor.system.itemsProperties.environmentalMod.range.value;
                    inputValue = SR5_ConverterHelpers.environmentalLineToMod(baseRange);
                    label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    break;
                case "chokeSettings":
                    selectValue = dialogData.combat.choke.selected;
                    html.find(name)[0].value = selectValue;
                    label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    dialogData.combat.choke.defense = SR5_PrepareRollHelper.chokeSettingsOnDefense(dialogData.combat.choke.selected, dialogData.target.range);
                    dialogData.combat.choke.damageModify = SR5_PrepareRollHelper.chokeSettingsOnDamage(selectValue, dialogData.target.range);
                    //if (dialogData.damage.value) dialogData.damage.value -= ;
                    let chokeLimitModify = SR5_PrepareRollHelper.chokeSettingsOnLimit(selectValue, dialogData.target.range);
                    dialogData.combat.choke.defense = SR5_PrepareRollHelper.chokeSettingsOnDefense(selectValue, dialogData.target.range);
                    inputValue = chokeLimitModify;
                    let chokeLimitModified = Object.keys(dialogData.limit.modifiers).find(e => e === "chokeSettings");
                    if (chokeLimitModify && !chokeLimitModified) {                         
                        dialogData.limit.modifiers[modifierName] = {
                          value: chokeLimitModify,
                          label: `${game.i18n.localize(SR5.chokeSettings[selectValue])}`,
                        }
                        this.limitModifier[modifierName] = chokeLimitModify;
                        this.updateLimitValue(html);
                        dialogData.combat.choke.limit = chokeLimitModify;
                    }
                    break;
                case "firingMode":
                    selectValue = dialogData.combat.firingMode.selected;
                    inputValue = this.calculRecoil(html);
                    action = SR5_ConverterHelpers.firingModeToAction(selectValue);
                    dialogData.combat.actions = SR5_MiscellaneousHelpers.addActions(dialogData.combat.actions, action);
                    modifierName = "recoil";
                    label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);
                    break;
                case "spiritType":
                    selectValue = html.find(name)[0].value;
                    html.find(targetInputName)[0].value = actor.system.skills.summoning.spiritType[selectValue].dicePool - actor.system.skills.summoning.test.dicePool;
                    dialogData.dicePool.composition = SR5_PrepareRollHelper.getDicepoolComposition(actor.system.skills.summoning.spiritType[selectValue].modifiers);
                    dialogData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(dialogData);
                    dialogData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(dialogData, actor.system.skills.summoning.spiritType[selectValue].modifiers);
                    dialogData.magic.spiritType = selectValue;
                    this.updateDicePoolValue(html);
                    continue;
                case "spriteType":
                    dialogData.matrix.spriteType = html.find(name)[0].value;
                    continue;
                case "preparationTrigger":
                    inputValue = SR5_ConverterHelpers.triggerToMod(html.find('[data-modifier="preparationTrigger"]')[0].value);
                    dialogData.magic.drain.modifiers.trigger = inputValue;
                    dialogData.magic.preparationTrigger = html.find('[data-modifier="preparationTrigger"]')[0].value;
                    dialogData.magic.drain.modifiers.trigger = {
                        value: inputValue,
                        label: `${game.i18n.localize("SR5.PreparationTrigger")} (${game.i18n.localize(SR5.preparationTriggerTypes[dialogData.magic.preparationTrigger])})`,
                    };
                    this.drainModifier.preparationTrigger = inputValue;
                    this.updateDrainValue(html);
                    continue;
                case "searchType":
                    selectValue = html.find(name)[0].value;
                    inputValue = SR5_ConverterHelpers.searchTypeToThreshold(selectValue);
                    dialogData.threshold.value = inputValue;
                    dialogData.threshold.type = selectValue;
                    html.find(targetInputName)[0].value = inputValue;
                    continue;
                case "damageType":
                    dialogData.damage.type = html.find(name)[0].value;
                    continue;
                case "socialResult":
                case "socialAttitude":
                    inputValue = 0;
                    break;
                case "speedRammingAttacker":
                    selectValue = SR5_ConverterHelpers.speedToDamageValue(html.find(name)[0].value, actor.system.attributes.body.augmented.value);
                    dialogData.owner.speed = html.find(name)[0].value;
                    dialogData.damage.value = selectValue;
                    html.find('[name="modifiedDamage"]')[0].value = selectValue;
                    continue;
                case "speedRammingTarget":
                    dialogData.target.speed = html.find(name)[0].value;
                    continue;
                case "targetEffect":
                    selectValue = html.find(name)[0].value;
                    dialogData.target.itemUuid = selectValue;
                    if (dialogData.test.typeSub === "counterspelling" && selectValue){
                        let spellCategory = await this.getTargetType(dialogData.target.itemUuid);
                        inputValue = parseInt(actor.system.skills.counterspelling.spellCategory[spellCategory].dicePool - actor.system.skills.counterspelling.test.dicePool);
                        label = `${game.i18n.localize(SR5.dicePoolModTypes["spellCategory"])} (${game.i18n.localize(SR5.spellCategories[spellCategory])})`;
                    } else inputValue = 0;
                    break;
                case "cover":
                    let coverEffect = actor.effects.find(e => e.origin === "cover");
                    let coverFullEffect = actor.effects.find(e => e.origin === "coverFull")
                    if (coverFullEffect) selectValue = "full";
                    else if (coverEffect) selectValue = "partial";
                    else selectValue = "none";
                    inputValue = SR5_ConverterHelpers.coverToMod(selectValue);
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.coverTypes[selectValue])})`;
                    break;                    
                case "defenseChokeSettings":
                inputValue = dialogData.combat.choke.defense;
                break;
            }

            html.find(targetInputName)[0].value = inputValue;
            html.find(name)[0].value = selectValue;
            dialogData.dicePool.modifiers[modifierName] = {
                value: inputValue,
                label: label,
            }
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
        dialogData.threshold.value = value;
        dialogData.threshold.type = label;
    }

    //Manage threhsold
    _manageThreshold(ev, html, dialogData){
        let value, label;
        let targetInput = $(ev.currentTarget).attr("data-target");
        
        label = ev.target.value;
        value = ev.target.value;
        if (targetInput === "survivalThreshold") value = SR5_ConverterHelpers.survivalTypeToThreshold(ev.target.value);
        else if (targetInput === "restraintThreshold") value = SR5_ConverterHelpers.restraintTypeToThreshold(ev.target.value);
        else if (targetInput === "perceptionThreshold") value = SR5_ConverterHelpers.perceptionTypeToThreshold(ev.target.value);

        let name = `[name=${targetInput}]`;
        html.find(name)[0].value = value;
        dialogData.threshold.value = value;
        dialogData.threshold.type = label;
    }

    _updateReagents(value, actor, html, dialogData){
        if (value > actor.system.magic.reagents){
            value = actor.system.magic.reagents;
            ui.notifications.warn(game.i18n.format('SR5.WARN_MaxReagents', {reagents: value}));
            if (dialogData.test.type === "ritual") html.find('[name="force"]')[0].value = value;
        }
        html.find('[data-modifier="reagents"]')[0].checked = true;
        html.find('[name="reagentsSpent"]')[0].value = value;
        dialogData.magic.hasUsedReagents = true;
        if (dialogData.test.type !== "ritual"){
            this.limitModifier.reagents = value;
            this.updateLimitValue(html);
        }
    }

    

    //Toggle reset defense
    _onResetDefense(ev, html, dialogData, actor){
        ev.preventDefault();
        let resetedActor = SR5_EntityHelpers.getRealActorFromID(actor._id)
        resetedActor.resetCumulativeDefense();
        dialogData.dicePool.modifiers.cumulativeDefense.value = 0;
        actor.flags.sr5.cumulativeDefense = 0;
        html.find('[data-type="cumulativeDefense"]')[0].value = 0;
        this.updateDicePoolValue(html);
    }

    //Handle Extended Test
    _onToggleExtendedTest(isChecked, dialogData, html){
        let position = this.position;
        position.height = "auto";    

        if (isChecked) {
            dialogData.test.isExtended = true;
            dialogData.test.extended.interval = html.find('[name="extendedTime"]')[0].value;
            dialogData.test.extended.multiplier = html.find('[name="extendedMultiplier"]')[0].value;
            $(html).find('#extendedBlock').show();
            this.setPosition(position);
        }
        else {
            dialogData.test.isExtended = false;
            $(html).find('#extendedBlock').hide();
            this.setPosition(position);
        }
    }

    //Handle Extended Test Value
    _onChangeExtendedTest(isChecked, dialogData, html){
            dialogData.test.extended.interval = html.find('[name="extendedTime"]')[0].value;
            dialogData.test.extended.multiplier = html.find('[name="extendedMultiplier"]')[0].value;
    }

}