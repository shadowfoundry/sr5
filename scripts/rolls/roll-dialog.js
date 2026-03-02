import { SR5 } from "../config.js";
import { SR5_EntityHelpers } from "../entities/helpers.js";
import { SR5_PrepareRollHelper } from "./roll-prepare-helpers.js";
import { SR5_ConverterHelpers } from "./roll-helpers/converter.js";
import { SR5_CombatHelpers } from "./roll-helpers/combat.js";
import { SR5_MiscellaneousHelpers } from "./roll-helpers/miscellaneous.js";
import { SR5_CalledShotHelpers } from "./roll-helpers/calledShot.js";
import { SR5Combat } from "../system/srcombat.js";

export default class SR5_RollDialog {

    constructor(dialog, element, dialogData) {
        this.dialog = dialog;
        this.element = element;
        this.dialogData = dialogData;
        this.dicePoolModifier = {};
        this.limitModifier = {};
        this.drainModifier = {};
        this.fadingModifier = {};
    }

    updateDicePoolValue(html) {
        let dicePoolModifier = 0;
        for (let key of Object.values(this.dialogData.dicePool.modifiers)){
            dicePoolModifier += key.value;
        }
        if (html.querySelector('[name="dicePoolModifiers"]')) html.querySelector('[name="dicePoolModifiers"]').value = dicePoolModifier;
        let modifiedDicePool = dicePoolModifier + parseInt(html.querySelector('[name="baseDicePool"]').value);
        this.dialogData.dicePool.base = parseInt(html.querySelector('[name="baseDicePool"]').value);
        if (modifiedDicePool < 0) modifiedDicePool = 0;
        html.querySelector('[data-action="roll"]').innerHTML = `<i class="fas fa-dice-six"></i> ${game.i18n.localize("SR5.RollDice")} (${modifiedDicePool})`;
    }

    updateLimitValue(html) {
        if (html.querySelector('[name="baseLimit"]')){
            let modifiedLimit = parseInt(html.querySelector('[name="baseLimit"]').value)
            let limitModifier = 0;
            for (let key of Object.values(this.dialogData.limit.modifiers)){
                limitModifier += key.value;
                //if (key === "reagents") modifiedLimit = value;
            }
            modifiedLimit += limitModifier;
            if (modifiedLimit < 0) modifiedLimit = 0;
            html.querySelector('[name="modifiedLimit"]').value = modifiedLimit;
            this.dialogData.limit.base = parseInt(html.querySelector('[name="baseLimit"]').value);
        }
    }

    updateDrainValue(html) {
        this.dialogData.magic.force = parseInt(html.querySelector('[name="force"]').value);
        if (html.querySelector('[name="drainValue"]')){
            let drainModifier = 0;
            for (let key of Object.values(this.dialogData.magic.drain.modifiers)){
                drainModifier += key.value;
            }
            let drainFinalValue = parseInt(html.querySelector('[name="force"]').value) + drainModifier;
            if (drainFinalValue < 2) drainFinalValue = 2
            html.querySelector('[name="drainValue"]').value = drainFinalValue;
            this.dialogData.magic.drain.value = drainFinalValue;
        }
    }

    updateFadingValue(html) {
        this.dialogData.matrix.level = parseInt(html.querySelector('[name="level"]').value);
        if (html.querySelector('[name="fadingValue"]')){
            let fadingModifier = 0;
            for (let key of Object.values(this.dialogData.matrix.fading.modifiers)){
                fadingModifier += key.value;
            }
            let fadingFinalValue = parseInt(html.querySelector('[name="level"]').value) + fadingModifier;
            if (fadingFinalValue < 2) fadingFinalValue = 2
            html.querySelector('[name="fadingValue"]').value = fadingFinalValue;
            this.dialogData.matrix.fading.value = fadingFinalValue;
        }
    }

    calculRecoil(html){
        let firingModeValue,
            dialogData = this.dialogData;

        if (dialogData.combat.firingMode.selected === "SS" || dialogData.combat.firingMode.selected === "SF"){
            firingModeValue = 0;
            html.querySelectorAll(".hideBulletsRecoil").forEach(el => el.style.display = 'none');
        } else firingModeValue = SR5_ConverterHelpers.firingModeToBullet(dialogData.combat.firingMode.selected);

        dialogData.combat.ammo.fired = SR5_ConverterHelpers.firingModeToBullet(dialogData.combat.firingMode.selected);
        html.querySelector('[name="recoilBullets"]').value = firingModeValue;
        html.querySelector('[name="recoilCumulative"]').value = dialogData.combat.recoil.cumulative;
        if (dialogData.combat.recoil.compensationWeapon < 1) html.querySelectorAll(".hideWeaponRecoil").forEach(el => el.style.display = 'none');
        if (dialogData.combat.recoil.cumulative < 1) html.querySelectorAll(".hideCumulativeRecoil").forEach(el => el.style.display = 'none');

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
        this.dialog.setPosition(this.dialog.position);
        html.querySelector('[name="recoil"]').value = recoil;
        SR5_MiscellaneousHelpers.removeElementFromArray(dialogData.dicePool.modifiers, 'type', "recoil")
        this.updateDicePoolValue(html);
    }

    async getTargetType(target){
        let item = await fromUuid(target);
        if (item?.type === "itemSpell") return item.system.category;
        else return null;
    }

    activateListeners(html) {
        const element = html;
        let dialogData = this.dialogData;
        let actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorId);

        this.updateDicePoolValue(element);
        this.updateLimitValue(element);

        //Show some block on initial draw
        if (dialogData.test.type === "ritual") {
            const useReagentsEl = element.querySelector('#useReagents');
            if (useReagentsEl) useReagentsEl.style.display = '';
            const reagentsModControlEl = element.querySelector('#reagentsModControl');
            if (reagentsModControlEl) reagentsModControlEl.style.display = '';
        }

        //General commands for input
        element.querySelectorAll('.SR-ModInput').forEach(el => el.addEventListener('change', ev => this._manualInputModifier(ev, element, dialogData)));
        //General commands for input buttons
        element.querySelectorAll('.SR-ModControl').forEach(el => el.addEventListener('click', ev => this._manualInputModifier(ev, element, dialogData, true)));
        //General commands for input already filled by dialogData
        const filledInputs = element.querySelectorAll('.SR-ModInputFilled'); if (filledInputs.length) this._filledInputModifier(filledInputs, element, dialogData);
        //General commands for checkbox
        const filledCheckboxes = element.querySelectorAll('.SR-ModCheckboxFilled'); if (filledCheckboxes.length) this._filledCheckBox(filledCheckboxes, element, dialogData);
        element.querySelectorAll('.SR-ModCheckbox').forEach(el => el.addEventListener('change', ev => this._checkboxModifier(ev, element, dialogData)));
        //General commands for select
        element.querySelectorAll('.SR-ModSelect').forEach(el => el.addEventListener('change', ev => this._selectModifiers(ev, element, dialogData)));
        //General commands for select already filled by dialogData
        const filledSelects = element.querySelectorAll('.SR-ModSelectFilled'); if (filledSelects.length) this._filledSelectModifier(filledSelects, element, dialogData);
        //Manage Threshold
        element.querySelectorAll('.SR-ManageThreshold').forEach(el => el.addEventListener('change', ev => this._manageThreshold(ev, element, dialogData)));
        const thresholdEls = element.querySelectorAll('.SR-ManageThreshold'); if (thresholdEls.length) this._filledThreshold(thresholdEls, element, dialogData);

        // Reset Recoil
        element.querySelectorAll(".resetRecoil").forEach(el => el.addEventListener('click', ev => this._onResetRecoil(ev, element, dialogData, actor)));
        // Reset Cumulative Defense
        element.querySelectorAll(".resetCumulativeDefense").forEach(el => el.addEventListener('click', ev => this._onResetDefense(ev, element, dialogData, actor)));

        // Extended test
        element.querySelectorAll('[name="toggleExtendedTest"]').forEach(el => el.addEventListener('change', ev => this._onToggleExtendedTest(ev.target.checked, dialogData, element)));
        element.querySelectorAll('[name="extendedTime"]').forEach(el => el.addEventListener('change', ev => this._onChangeExtendedTest(ev.target.checked, dialogData, element)));
        element.querySelectorAll('[name="extendedMultiplier"]').forEach(el => el.addEventListener('change', ev => this._onChangeExtendedTest(ev.target.checked, dialogData, element)));

        //auto fill extended test if data are already present
        if (dialogData.test.isExtended){
            element.querySelector('[name="toggleExtendedTest"]').checked = true;
            element.querySelector('[name="extendedTime"]').value = dialogData.test.extended.interval;
            element.querySelector('[name="extendedMultiplier"]').value = dialogData.test.extended.multiplier;
            const extendedBlockEl = element.querySelector('#extendedBlock');
            if (extendedBlockEl) extendedBlockEl.style.display = '';
        }
        //Toggle hidden div
        element.querySelectorAll(".SR-DialogToggle").forEach(el => el.addEventListener('click', ev => this._toggleDiv(ev, element)));
    }

    //Show or Hide section of the dialog
    _toggleDiv(ev, html){
        let target = ev.currentTarget.dataset.target,
            action = ev.currentTarget.dataset.action,
            position = this.dialog.position;

        if (action === "show"){
            const targetEl = html.querySelector(`#${target}`);
            if (targetEl) targetEl.style.display = '';
            html.querySelectorAll(`[data-target="${target}"][data-action="show"]`).forEach(el => el.style.display = 'none');
            html.querySelectorAll(`[data-target="${target}"][data-action="hide"]`).forEach(el => el.style.display = '');
        } else {
            const targetEl = html.querySelector(`#${target}`);
            if (targetEl) targetEl.style.display = 'none';
            html.querySelectorAll(`[data-target="${target}"][data-action="hide"]`).forEach(el => el.style.display = 'none');
            html.querySelectorAll(`[data-target="${target}"][data-action="show"]`).forEach(el => el.style.display = '');
        }

        position.height = "auto";
        this.dialog.setPosition(position);
    }

    //Add checkbox modifiers
    _checkboxModifier(ev, html, dialogData){
        let isChecked = ev.target.checked,
            target = ev.currentTarget.dataset.target,
            name = `[name=${target}]`,
            modifierName = ev.currentTarget.dataset.modifier,
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
                    const useReagentsEl = html.querySelector('#useReagents');
                    if (useReagentsEl) useReagentsEl.style.display = '';
                    const reagentsModControlEl = html.querySelector('#reagentsModControl');
                    if (reagentsModControlEl) reagentsModControlEl.style.display = '';
                }
                else {
                    const useReagentsEl = html.querySelector('#useReagents');
                    if (useReagentsEl) useReagentsEl.style.display = 'none';
                    const reagentsModControlEl = html.querySelector('#reagentsModControl');
                    if (reagentsModControlEl) reagentsModControlEl.style.display = 'none';
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
                html.querySelector(name).value = value;
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
                html.querySelector(name).value = value;
                let threshold = parseInt(html.querySelector('[name="restraintThreshold"]').value);
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
            html.querySelector(name).value = value;
            dialogData.dicePool.modifiers.push({
                type: modifierName,
                label: label,
                value: value
            })
            this.updateDicePoolValue(html);
        } else {
            html.querySelector(name).value = 0;
            SR5_MiscellaneousHelpers.removeElementFromArray(dialogData.dicePool.modifiers, 'type', modifierName)
            this.updateDicePoolValue(html);
        }
    }

    //Auto check checkbox modifiers
    _filledCheckBox(checkboxs, html, dialogData){
        if (checkboxs.length === 0) return;
        let checkboxName, modifierName, inputName, value;

        let actor = SR5_EntityHelpers.getRealActorFromID(this.dialogData.owner.actorId),
            targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.target.actorId),
            label,
            isProned = actor.effects.find(e => e.statuses.has("prone"));

        for (let e of checkboxs){
            modifierName = e.dataset.modifier;
            checkboxName = `[data-modifier=${modifierName}]`;
            inputName = `[name=${e.dataset.target}]`;
            label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);

            switch (modifierName){
                case "patientAwakenedOrEmerged":
                    if (targetActor?.system.specialAttributes.magic.augmented.value > 0 || targetActor?.system.specialAttributes.resonance.augmented.value > 0){
                        html.querySelector(checkboxName).checked = true;
                        value = -2;
                        html.querySelector(inputName).value = value;
                        dialogData.dicePool.modifiers.push({
                            type: modifierName,
                            label: label,
                            value: value
                        })
                        this.updateDicePoolValue(html);
                    }
                    continue;
                case "fullDefense":
                    let fullDefenseEffect = actor.effects.find(e => e.origin === "fullDefense");
		            let isInFullDefense = (fullDefenseEffect) ? true : false;
                    if (isInFullDefense){
                        html.querySelector(checkboxName).checked = true;
                        value = actor.system.specialProperties.fullDefenseValue || 0;
                    }
                    break;
                case "defenseProneClose":
                    if (isProned && dialogData.target.rangeInMeters <= 5){
                        html.querySelector(checkboxName).checked = true;
                        value = -2;
                    }
                    break;
                case "defenseProneFar":
                    if (isProned && dialogData.target.rangeInMeters >= 20){
                        html.querySelector(checkboxName).checked = true;
                        value = 4;
                    }
                    break;
                case "defenseProne":
                    if (isProned){
                        html.querySelector(checkboxName).checked = true;
                        value = -2;
                    }
                    break;
                case "defenseTargetedByArea":
                    html.querySelector(checkboxName).checked = true;
                    value = -2;
                    break;
            }

            if (html.querySelector(checkboxName).checked){
                html.querySelector(inputName).value = value;
                dialogData.dicePool.modifiers.push({
                    type: modifierName,
                    label: label,
                    value: value
                })
                this.updateDicePoolValue(html);
            }
        }


    }

    //Manage manual input modifier
    _manualInputModifier(ev, html, dialogData, button = false){
        let target, name, modifierName, value, operator;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.dialogData.owner.actorId);
        let targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.target.actorId);

        if (button){ //Manage plus minus input
            target = ev.currentTarget.dataset.target;
            operator = ev.currentTarget.dataset.type;
            modifierName = ev.currentTarget.dataset.modifier;
            name = `[name=${target}]`;
            value = html.querySelector(name).value;
            if (operator === "plus"){
                value++;
                html.querySelector(name).value = value;
            } else {
                value--;
                html.querySelector(name).value = value;
            }
        } else {
            target = ev.currentTarget.getAttribute("name");
            name = `[name=${target}]`;
            modifierName = ev.currentTarget.dataset.modifier;
            value = parseInt(ev.target.value);
        }

        switch (target){
            case "force":
                this.updateDrainValue(html);
                if (html.querySelector('#force')) {
                    html.querySelector('#force').value = value;
                    dialogData.limit.base = value;
                }
                if (dialogData.test.type === "ritual") this._updateReagents(value, actor, html, dialogData);
                return;
            case "reagentsSpent":
                this._updateReagents(value, actor, html, dialogData);
                return;
            case "level":
                this.updateFadingValue(html);
                if (html.querySelector('#level')) html.querySelector('#level').value = value;
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
                let barrierRating = parseInt((html.querySelector('[name="manaBarrierRating"]').value || 1));
                html.querySelector('[name="baseDicePool"]').value = barrierRating * 2;
                this.dialogData.dicePool.value = barrierRating * 2;
                this.updateDicePoolValue(html);
                return;
            case "patientEssence":
                value = -Math.floor((6 - Math.ceil(value))/2);
                html.querySelector('[name="dicePoolModPatientEssence"]').value = value;
                SR5_MiscellaneousHelpers.removeElementFromArray(dialogData.dicePool.modifiers, 'type', "patientEssence")
                dialogData.dicePool.modifiers.push({
                    type: "patientEssence",
                    label: `${game.i18n.localize(SR5.dicePoolModTypes[target])} (${value})`,
                    value: value
                })
                this.updateDicePoolValue(html);
                return;
            case "limitModHealingSupplies":
            case "limitModPerception":
            case "limitModVarious":
                html.querySelector(name).value = value;
                dialogData.limit.modifiers[modifierName] = {
                    value: value,
                    label: `${game.i18n.localize(SR5.limitModTypes[modifierName])}`,
                }
                this.limitModifier[modifierName] = value;
                this.updateLimitValue(html);
                return;
        }

        html.querySelector(name).value = value;
        SR5_MiscellaneousHelpers.removeElementFromArray(dialogData.dicePool.modifiers, 'type', modifierName)
        dialogData.dicePool.modifiers.push({
            type: modifierName,
            label: game.i18n.localize(SR5.dicePoolModTypes[modifierName]),
            value: value
        })
        this.updateDicePoolValue(html);
    }

    _filledInputModifier(ev, html, dialogData){
        if (ev.length === 0) return;
        let modifierName, name, value;
        let actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorId),
            targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.target.actorId),
            label;

        for (let e of ev){
            modifierName = e.dataset.modifier;
            name = `[data-modifier=${modifierName}]`;
            label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]);

            switch (modifierName){
                case "matrixNoiseReduction":
                    if (html.querySelector('[data-modifier="matrixRange"]').value === "wired") {
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
                    if (html.querySelector('[data-modifier="matrixRange"]').value !== "wired") value = dialogData.matrix.noiseScene;
                    else value = 0;
                    break;
                case "matrixActorNoise":
                    if (html.querySelector('[data-modifier="matrixRange"]').value !== "wired") value = dialogData.matrix.personalNoise;
                    else value = 0;
                    break;
                case "incomingPA":
                    let armorValue = parseInt((html.querySelector('[data-modifier="armor"]').value || 0));
                    let incomingAP = parseInt((html.querySelector('[data-modifier="incomingPA"]').value || 0))
                    if (armorValue >= -incomingAP) value = incomingAP;
                    else {
                        let usedAP = armorValue + incomingAP;
                        value = incomingAP - usedAP;
                    }
                    break;
                case "armor":
                    continue;
                case "publicGrid":
                    if (html.querySelector('[data-modifier="matrixRange"]').value !== "wired" && game.settings.get("sr5", "sr5MatrixGridRules")) value = -2;
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
                    html.querySelector('[name="patientEssence"]').value = patientEssence;
                    value = -Math.floor((6 - Math.ceil(patientEssence))/2);
                    html.querySelector('[name="dicePoolModPatientEssence"]').value = value;
                    dialogData.dicePool.modifiers.push({
                        type: "patientEssence",
                        label: `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${patientEssence})`,
                        value: value
                    })
                    this.updateDicePoolValue(html);
                    continue;
                case "backgroundCount":
                    value = parseInt((html.querySelector(name).value || 0));
                    label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.traditionTypes[dialogData.sceneData.backgroundAlignement])})`;
                    break;
                default:
                    value = parseInt((html.querySelector(name).value || 0));
            }

            html.querySelector(name).value = value;
            dialogData.dicePool.modifiers.push({
                type: modifierName,
                label: label,
                value: value
            })
            this.updateDicePoolValue(html);
        }
    }

    //Select modifiers
    async _selectModifiers(ev, html, dialogData){
        let target = ev.currentTarget.dataset.target,
            name = `[name=${target}]`,
            modifierName = ev.currentTarget.dataset.modifier,
            value, limitDV, action, rangeType,
            actor = SR5_EntityHelpers.getRealActorFromID(dialogData.owner.actorId),
            label = game.i18n.localize(SR5.dicePoolModTypes[modifierName]),
            position = this.dialog.position,
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
                    else {
                        if (ev.target.value === "edge" || ev.target.value === "magic" || ev.target.value === "resonance"){
                            value = actor.system.specialAttributes[ev.target.value].augmented.value;
                        } else {
                            value = actor.system.attributes[ev.target.value].augmented.value;
                        }
                    }
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
                        html.querySelector("[name=chokeSettings]").value = chokeLimitModify;
                        this.limitModifier[modifierName] = chokeLimitModify;
                        this.updateLimitValue(html);
                        dialogData.combat.choke.limit = chokeLimitModify;
                        }
                    }
                    break;
                case "chokeSettings":
                    dialogData.combat.choke.selected = ev.target.value;
                    html.querySelector(name).value = value;
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
                        const matrixNoiseSceneEl = html.querySelector('#matrixNoiseScene');
                        if (matrixNoiseSceneEl) matrixNoiseSceneEl.style.display = '';
                        const matrixNoiseReductionEl = html.querySelector('#matrixNoiseReduction');
                        if (matrixNoiseReductionEl) matrixNoiseReductionEl.style.display = '';
                        const matrixTargetGridEl = html.querySelector('#matrixTargetGrid');
                        if (matrixTargetGridEl) matrixTargetGridEl.style.display = '';
                        if (dialogData.target.grid !== actor.system.matrix.userGrid) {
                            html.querySelector('[name="dicePoolModTargetGrid"]').value = -2;
                            SR5_MiscellaneousHelpers.removeElementFromArray(dialogData.dicePool.modifiers, 'type', "targetGrid")
                            dialogData.dicePool.modifiers.push({
                                type: "targetGrid",
                                label: `${game.i18n.localize(SR5.dicePoolModTypes["targetGrid"])} (${game.i18n.localize(SR5.gridTypes[html.querySelector('[data-modifier="targetGrid"]').value])})`,
                                value: -2
                            })
                            this.dicePoolModifier.targetGrid = -2;
                        }
                        if ((dialogData.matrix.personalNoise < 0) && (html.querySelector('#matrixNoiseActor'))) {
                            const matrixNoiseActorEl = html.querySelector('#matrixNoiseActor');
                            if (matrixNoiseActorEl) matrixNoiseActorEl.style.display = '';
                        }
                    } else {
                        const matrixNoiseSceneEl = html.querySelector('#matrixNoiseScene');
                        if (matrixNoiseSceneEl) matrixNoiseSceneEl.style.display = 'none';
                        const matrixNoiseReductionEl = html.querySelector('#matrixNoiseReduction');
                        if (matrixNoiseReductionEl) matrixNoiseReductionEl.style.display = 'none';
                        const matrixTargetGridEl = html.querySelector('#matrixTargetGrid');
                        if (matrixTargetGridEl) matrixTargetGridEl.style.display = 'none';
                        const matrixNoiseActorEl = html.querySelector('#matrixNoiseActor');
                        if (matrixNoiseActorEl) matrixNoiseActorEl.style.display = 'none';
                        html.querySelector('[name="dicePoolModTargetGrid"]').value = 0;
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
                        html.querySelector(name).value = actor.system.skills.summoning.spiritType[ev.target.value].dicePool - actor.system.skills.summoning.test.dicePool;
                        dialogData.dicePool.composition = SR5_PrepareRollHelper.getDicepoolComposition(actor.system.skills.summoning.spiritType[ev.target.value].modifiers);
                        dialogData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(dialogData);
                        dialogData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(dialogData, actor.system.skills.summoning.spiritType[ev.target.value].modifiers);
                    }
                    dialogData.magic.spiritType = ev.target.value;
                    this.updateDicePoolValue(html);
                    return;
                case "preparationTrigger":
                    value = SR5_ConverterHelpers.triggerToMod(ev.target.value);
                    html.querySelector(name).value = value;
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
                        const sightPerceptionEl = html.querySelector('#sightPerception');
                        if (sightPerceptionEl) sightPerceptionEl.style.display = '';
                        if (canvas.scene) {
                            SR5_MiscellaneousHelpers.removeElementFromArray(dialogData.dicePool.modifiers, 'type', "environmentalSceneMod")
                            dialogData.dicePool.modifiers.push({
                                type: "environmentalSceneMod",
                                label: game.i18n.localize(SR5.dicePoolModTypes["environmentalSceneMod"]),
                                value: SR5_CombatHelpers.handleEnvironmentalModifiers(game.scenes.active, actor.system, true),
                            })
                            label = `${game.i18n.localize(SR5.dicePoolModTypes[modifierName])} (${game.i18n.localize(SR5.perceptionTypes[ev.target.value])})`;
                        }
                        html.querySelector('[data-modifier="environmentalSceneMod"]').value = dialogData.dicePool.modifiers.environmentalSceneMod.value;
                        this.dicePoolModifier.environmental = dialogData.dicePool.modifiers.environmentalSceneMod.value;
                    } else {
                        const sightPerceptionEl = html.querySelector('#sightPerception');
                        if (sightPerceptionEl) sightPerceptionEl.style.display = 'none';
                        SR5_MiscellaneousHelpers.removeElementFromArray(dialogData.dicePool.modifiers, 'type', "environmentalSceneMod")
                        this.dicePoolModifier.environmental = 0;
                    }
                    dialogData.various.perceptionType = ev.target.value;
                    dialogData.limit.modifiers.perception = {
                        value: limitMod,
                        label: `${game.i18n.localize(SR5.limitModTypes["perception"])} (${game.i18n.localize(SR5.perceptionTypes[ev.target.value])})`,
                    }
                    this.limitModifier.perceptionType = limitMod;
                    html.querySelector('[name="limitModPerception"]').value = limitMod;
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
                    html.querySelector(name).value = value;
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
                    html.querySelector('[name="limitModHealingSupplies"]').value = 0;
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
                                html.querySelector('[name="limitModHealingSupplies"]').value = value;
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
                    html.querySelector('[name="modifiedDamage"]').value = value;
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
                    html.querySelector('[name="baseDicePool"]').value = parseInt(ev.target.value);
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
                    if (ev.target.value === "specificTarget") {
                        const calledShotEl = html.querySelector('#calledShotSpecificTarget');
                        if (calledShotEl) calledShotEl.style.display = '';
                    }
                    else {
                        const calledShotEl = html.querySelector('#calledShotSpecificTarget');
                        if (calledShotEl) calledShotEl.style.display = 'none';
                    }
                    dialogData.combat.calledShot.name = ev.target.value;
                    dialogData.combat.calledShot.effects = SR5_CalledShotHelpers.convertCalledShotToEffect(ev.target.value, dialogData.combat.ammo.type);
                    dialogData.combat.calledShot.limitDV = SR5_CalledShotHelpers.convertCalledShotToLimitDV(ev.target.value, dialogData.combat.ammo.type);
                    switch (ev.target.value){
                        case "shakeUp":
                            dialogData.combat.calledShot.initiative = SR5_CalledShotHelpers.convertCalledShotToInitiativeMod(dialogData.combat.ammo.type);
                            break;
                        case "bullsEye": //Errata: "The attack results in an AP increase equal to the BASE weapon AP multiplied by the number of bullets in the burst with a maximum modifier of x3."
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
                                return html.querySelector(`[data-modifier="calledShot"]`).value = "";
                            } else {
                                let targetActor = SR5_EntityHelpers.getRealActorFromID(dialogData.target.actorId);
                                value = -(targetActor.system.itemsProperties.armor.value + Math.floor(targetActor.system.attributes.body.augmented.value / 2));
                            }
                            break;
                        case "upTheAnte":
                            const upTheAnteEl = html.querySelector('#calledShotSpecificTarget');
                            if (upTheAnteEl) upTheAnteEl.style.display = '';
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
                    if (html.querySelector('[data-modifier="calledShot"]').value === "upTheAnte") {
                            value = value - 4;
                            limitDV = limitDV * 2;
                        }
                    dialogData.combat.calledShot = {
                        limitDV: limitDV,
                        location: ev.target.value,
                        name: html.querySelector('[data-modifier="calledShot"]').value,
                        effects: SR5_CalledShotHelpers.convertCalledShotToEffect(ev.target.value),
                    }
                    break;
                default: value = ev.target.value;
            }
        }

        this.dialog.setPosition(position);
        html.querySelector(name).value = value;

        //Remove previous mod
        SR5_MiscellaneousHelpers.removeElementFromArray(dialogData.dicePool.modifiers, 'type', modifierName)

        if (modifierName !== "chokeSettings") {
            dialogData.dicePool.modifiers.push({
                type: modifierName,
                label: label,
                value: value,
            })
        }
        this.updateDicePoolValue(html);
        if (modifierName === "matrixRange") this._filledInputModifier(html.querySelectorAll('.SR-ModInputFilled'), html, dialogData);
    }

    async _filledSelectModifier(ev, html, dialogData){
        if (ev.length === 0) return;
        let modifierName, targetInput, targetInputName, name, inputValue, selectValue;
        let actor = SR5_EntityHelpers.getRealActorFromID(this.dialogData.owner.actorId),
            label, action;

        for (let e of ev){
            modifierName = e.dataset.modifier;
            targetInput = e.dataset.target;
            targetInputName = `[name=${targetInput}]`;
            name = `[data-modifier=${modifierName}]`;

            switch (modifierName){
                case "mark":
                    selectValue = html.querySelector(name).value;
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
                    html.querySelector(name).value = selectValue;
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
                    selectValue = html.querySelector(name).value;
                    html.querySelector(targetInputName).value = actor.system.skills.summoning.spiritType[selectValue].dicePool - actor.system.skills.summoning.test.dicePool;
                    dialogData.dicePool.composition = SR5_PrepareRollHelper.getDicepoolComposition(actor.system.skills.summoning.spiritType[selectValue].modifiers);
                    dialogData.dicePool.base = SR5_PrepareRollHelper.getBaseDicepool(dialogData);
                    dialogData.dicePool.modifiers = SR5_PrepareRollHelper.getDicepoolModifiers(dialogData, actor.system.skills.summoning.spiritType[selectValue].modifiers);
                    dialogData.magic.spiritType = selectValue;
                    this.updateDicePoolValue(html);
                    continue;
                case "spriteType":
                    dialogData.matrix.spriteType = html.querySelector(name).value;
                    continue;
                case "preparationTrigger":
                    inputValue = SR5_ConverterHelpers.triggerToMod(html.querySelector('[data-modifier="preparationTrigger"]').value);
                    dialogData.magic.drain.modifiers.trigger = inputValue;
                    dialogData.magic.preparationTrigger = html.querySelector('[data-modifier="preparationTrigger"]').value;
                    dialogData.magic.drain.modifiers.trigger = {
                        value: inputValue,
                        label: `${game.i18n.localize("SR5.PreparationTrigger")} (${game.i18n.localize(SR5.preparationTriggerTypes[dialogData.magic.preparationTrigger])})`,
                    };
                    this.drainModifier.preparationTrigger = inputValue;
                    this.updateDrainValue(html);
                    continue;
                case "searchType":
                    selectValue = html.querySelector(name).value;
                    inputValue = SR5_ConverterHelpers.searchTypeToThreshold(selectValue);
                    dialogData.threshold.value = inputValue;
                    dialogData.threshold.type = selectValue;
                    html.querySelector(targetInputName).value = inputValue;
                    continue;
                case "damageType":
                    dialogData.damage.type = html.querySelector(name).value;
                    continue;
                case "socialResult":
                case "socialAttitude":
                    inputValue = 0;
                    break;
                case "speedRammingAttacker":
                    selectValue = SR5_ConverterHelpers.speedToDamageValue(html.querySelector(name).value, actor.system.attributes.body.augmented.value);
                    dialogData.owner.speed = html.querySelector(name).value;
                    dialogData.damage.value = selectValue;
                    html.querySelector('[name="modifiedDamage"]').value = selectValue;
                    continue;
                case "speedRammingTarget":
                    dialogData.target.speed = html.querySelector(name).value;
                    continue;
                case "targetEffect":
                    selectValue = html.querySelector(name).value;
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

            html.querySelector(targetInputName).value = inputValue;
            html.querySelector(name).value = selectValue;
            dialogData.dicePool.modifiers.push({
                type: modifierName,
                label: label,
                value: inputValue,
            })
            this.updateDicePoolValue(html);
        }
    }

    //Manage auto filled threhsold
    _filledThreshold(ev, html, dialogData){
        if (ev.length === 0) return;
        let targetInput, name, value, label;

        for (let e of ev){
            targetInput = e.dataset.target;
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
        html.querySelector(name).value = value;
        dialogData.threshold.value = value;
        dialogData.threshold.type = label;
    }

    //Manage threhsold
    _manageThreshold(ev, html, dialogData){
        let value, label;
        let targetInput = ev.currentTarget.dataset.target;

        label = ev.target.value;
        value = ev.target.value;
        if (targetInput === "survivalThreshold") value = SR5_ConverterHelpers.survivalTypeToThreshold(ev.target.value);
        else if (targetInput === "restraintThreshold") value = SR5_ConverterHelpers.restraintTypeToThreshold(ev.target.value);
        else if (targetInput === "perceptionThreshold") value = SR5_ConverterHelpers.perceptionTypeToThreshold(ev.target.value);

        let name = `[name=${targetInput}]`;
        html.querySelector(name).value = value;
        dialogData.threshold.value = value;
        dialogData.threshold.type = label;
    }

    _updateReagents(value, actor, html, dialogData){
        if (value > actor.system.magic.reagents){
            value = actor.system.magic.reagents;
            ui.notifications.warn(game.i18n.format('SR5.WARN_MaxReagents', {reagents: value}));
            if (dialogData.test.type === "ritual") html.querySelector('[name="force"]').value = value;
        }
        html.querySelector('[data-modifier="reagents"]').checked = true;
        html.querySelector('[name="reagentsSpent"]').value = value;
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
        SR5_MiscellaneousHelpers.removeElementFromArray(dialogData.dicePool.modifiers, 'type', "cumulativeDefense")
        actor.flags.sr5.cumulativeDefense = 0;
        ev.currentTarget.closest('li').querySelector('input').value = 0;
        this.updateDicePoolValue(html);
    }

    //Handle Extended Test
    _onToggleExtendedTest(isChecked, dialogData, html){
        let position = this.dialog.position;
        position.height = "auto";

        if (isChecked) {
            dialogData.test.isExtended = true;
            dialogData.test.extended.interval = html.querySelector('[name="extendedTime"]').value;
            dialogData.test.extended.multiplier = 1;
            html.querySelector('[name="extendedMultiplier"]').value = 1
            const extendedBlockEl = html.querySelector('#extendedBlock');
            if (extendedBlockEl) extendedBlockEl.style.display = '';
            this.dialog.setPosition(position);
        }
        else {
            dialogData.test.isExtended = false;
            const extendedBlockEl = html.querySelector('#extendedBlock');
            if (extendedBlockEl) extendedBlockEl.style.display = 'none';
            this.dialog.setPosition(position);
        }
    }

    //Handle Extended Test Value
    _onChangeExtendedTest(isChecked, dialogData, html){
            dialogData.test.extended.interval = html.querySelector('[name="extendedTime"]').value;
            dialogData.test.extended.multiplier = html.querySelector('[name="extendedMultiplier"]').value;
    }

}
