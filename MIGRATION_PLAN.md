# SR5 System: Foundry v12 → v13 Migration Plan

## Overview

This plan covers migrating the SR5 (Shadowrun 5th Edition) system from Foundry VTT v12 to v13. The approach is **incremental** — we prioritize breaking changes first, then tackle deprecation replacements, and finally optional modernization.

The v13 release preserves backward compatibility for AppV1 sheets (they still work under `foundry.appv1`), so the system won't be completely non-functional, but several hooks, APIs, and patterns have **hard breaks** that must be fixed.

---

## Phase 1: Critical Breaking Fixes (Must-do for v13 compatibility)

### 1.1 — Fix `preDeleteToken` hook signature
**File:** `scripts/hooks.js:236`
**Issue:** Uses the old v10-era signature `(scene, token)`. In v12+ the signature is `(tokenDocument, options, userId)`. This was deprecated in v11 and the old form may not fire correctly in v13.
**Fix:** Update to `(tokenDocument, options, userId)` and use `tokenDocument` directly.

### 1.2 — Fix `renderChatMessage` hook
**File:** `scripts/hooks.js:181-184`
**Issue:** `app.isRoll` is not a standard property in v13. The `html` parameter is now a raw DOM element in ApplicationV2 contexts, not a jQuery object.
**Fix:** Replace `app.isRoll` with a check on `message.rolls.length > 0` or equivalent, and use native DOM methods instead of `html[0]`.

### 1.3 — Fix `renderCombatTracker` hook
**File:** `scripts/hooks.js:192`
**Issue:** `CombatTracker` has been converted to ApplicationV2 in v13. The hook arguments change — `html` is now a raw DOM element, not jQuery.
**Fix:** Update `SR5CombatTracker.renderCombatTracker()` to handle native DOM element.

### 1.4 — Fix `getCombatTrackerEntryContext` hook
**File:** `scripts/hooks.js:191`, `scripts/interface/srcombat-tracker.js:16-100`
**Issue:** Context menu callbacks receive different arguments in v13's ApplicationV2-based CombatTracker. `li.data("combatant-id")` is jQuery — this will break.
**Fix:** Update all `li.data()` calls to use `li.dataset.combatantId` (native DOM).

### 1.5 — Fix `renderFolderConfig` and `renderDialog` hooks
**Files:** `scripts/hooks.js:204-218`
**Issue:** `html.find()` is jQuery. In v13, render hooks for ApplicationV2 apps pass raw DOM elements.
**Fix:** Replace `html.find()` with `html.querySelector()`.

### 1.6 — Fix `renderCompendium` hook
**File:** `scripts/hooks.js:406`
**Issue:** `SidebarDirectory` class renamed to `DocumentDirectory`. Compendium rendering may have changed in v13.
**Fix:** Verify `SR5CompendiumInfo.onRenderCompendium` still works, update if needed.

### 1.7 — Fix `CONFIG.TinyMCE` references
**File:** `scripts/hooks.js:121, 126`
**Issue:** TinyMCE is deprecated in v13 (removal in v14). `CONFIG.TinyMCE.content_css` may not exist or work.
**Fix:** Replace with ProseMirror equivalent or guard with existence checks. Consider using `CONFIG.compatibility` or just removing these lines if the CSS is already loaded via `system.json` styles.

### 1.8 — Update `system.json` compatibility
**File:** `system.json`
**Issue:** Currently declares `"minimum": "12"`, `"maximum": "13"`, `"verified": "12.346"`. Needs to be updated for v13 verified support.
**Fix:** Set `"minimum": "13"`, `"verified": "13.xxx"` (latest stable), remove or raise maximum.

---

## Phase 2: jQuery → Native DOM Migration (Required for long-term support)

### Scope
520 occurrences of `$()`, `html.find()`, `.find()` across 49 files. The heaviest files:

| File | Occurrences |
|------|-------------|
| `scripts/entities/actors/baseSheet.js` | ~105 |
| `scripts/rolls/roll-dialog.js` | ~179 |
| `scripts/rolls/roll-message.js` | ~24 |
| `scripts/entities/actors/entityActor-helpers.js` | ~23 |
| `scripts/entities/items/itemSheet.js` | ~18 |
| `scripts/interface/srcombat-tracker.js` | ~7 |
| `scripts/interface/sheet-config.js` | ~12 |

### Strategy
Since AppV1 sheets still pass jQuery-wrapped `html` to `activateListeners()`, the jQuery in sheet classes (`baseSheet.js`, `characterSheet.js`, `itemSheet.js`, etc.) **still works in v13** but is on a deprecation path. Priority order:

1. **Hooks callbacks** (Phase 1 — already covered above, these break now)
2. **Dialog subclasses** (`roll-dialog.js`, `spendNetHits-dialog.js`, `pan-dialog.js`, `sheet-config.js`)
3. **Sheet classes** (`baseSheet.js`, `itemSheet.js`, and all actor sheets)
4. **Utility/helper files** (roll-message.js, roll-helpers, etc.)

### Pattern Replacements
| jQuery | Native DOM |
|--------|-----------|
| `html.find('.selector')` | `html.querySelector('.selector')` or `html.querySelectorAll('.selector')` |
| `html.find('.x').click(fn)` | `html.querySelector('.x').addEventListener('click', fn)` |
| `html.find('.x').change(fn)` | `html.querySelector('.x').addEventListener('change', fn)` |
| `html.find('.x')[0].value` | `html.querySelector('.x').value` |
| `html.find('.x').val()` | `html.querySelector('.x').value` |
| `html.find('.x').prop('checked')` | `html.querySelector('.x').checked` |
| `html.find('.x').mousedown(fn)` | `html.querySelector('.x').addEventListener('mousedown', fn)` |
| `$(selector)` | `document.querySelector(selector)` |
| `$('head').append(...)` | `document.head.insertAdjacentHTML(...)` |
| `li.data("combatant-id")` | `li.dataset.combatantId` |

---

## Phase 3: Dialog → DialogV2 Migration

### Files affected:
- `scripts/rolls/roll-dialog.js` — `SR5_RollDialog extends Dialog` (heaviest, ~179 jQuery occurrences)
- `scripts/interface/spendNetHits-dialog.js` — `SR5_SpendDialog extends Dialog`
- `scripts/interface/sheet-config.js` — `SRActorSheetConfig extends Dialog`
- `scripts/interface/pan-dialog.js` — `SR5_PanDialog extends Dialog`

### Also uses `Dialog.prompt()`:
- `scripts/entities/actors/entityActor.js:47` — `SR5Actor.createDialog()` uses `Dialog.prompt()`

### Strategy
The `Dialog` class still works in v13 (it's in `foundry.appv1`), so this is **not an immediate break** but should be migrated. `DialogV2` at `foundry.applications.api.DialogV2` uses a different pattern:
- No more `activateListeners(html)` — use `_onRender()` or action-based events
- `rejectClose` default changed from `true` to `false` in v13
- The callback pattern changes

This is the **largest single piece of work** due to `SR5_RollDialog` being heavily jQuery-dependent and complex.

---

## Phase 4: CSS Layers Adaptation

### Issue
v13 uses CSS Cascade Layers. System styles should be placed in the `system` layer for proper specificity.

### Files affected:
- `css/sr5.css`
- `css/sr6.css`
- The CSS switching logic in `scripts/hooks.js:116-128`

### Strategy
1. Wrap system CSS in `@layer system { ... }` blocks
2. Replace the jQuery-based CSS switching (`$('link[href=...]').prop(...)`, `$('head').append(...)`) with native DOM manipulation
3. Test that styles render correctly in both light and dark themes

---

## Phase 5: Optional Modernization (Future-proofing)

These are **not required for v13** but will be required eventually (v14+):

### 5.1 — AppV1 → AppV2 Sheet Migration
Convert `ActorSheetSR5`, `SR5ItemSheet`, and all actor-type sheets from `foundry.appv1.sheets.ActorSheet` / `foundry.appv1.sheets.ItemSheet` to ApplicationV2.

This is a **massive** undertaking:
- `static get defaultOptions()` → `static DEFAULT_OPTIONS`
- `getData()` → `async _prepareContext()`
- `activateListeners(html)` → action-based events + `_onRender()`
- All ~105 jQuery listener bindings in `baseSheet.js` must be refactored
- Template rendering differences

**Recommendation:** Defer to a separate v14-prep effort unless you want to do it now.

### 5.2 — Implement TypeData Models
Use `CONFIG.Actor.dataModels` / `CONFIG.Item.dataModels` instead of raw `template.json`-style data. This enables schema validation, migration helpers, and `prepareBaseData()` / `prepareDerivedData()` at the data model level.

### 5.3 — TinyMCE → ProseMirror
Replace any TinyMCE editor usage with ProseMirror before v14.

---

## Recommended Execution Order

```
Phase 1 (Critical Breaks)     — ~2-3 days of work
  1.1  Fix preDeleteToken hook
  1.2  Fix renderChatMessage hook
  1.3  Fix renderCombatTracker hook
  1.4  Fix getCombatTrackerEntryContext hook
  1.5  Fix renderFolderConfig / renderDialog hooks
  1.6  Fix renderCompendium hook
  1.7  Fix CONFIG.TinyMCE references
  1.8  Update system.json

Phase 2 (jQuery Cleanup)       — ~3-5 days of work
  Hooks & utilities first, then dialogs, then sheets

Phase 3 (DialogV2)             — ~3-4 days of work
  SR5_RollDialog is the bulk of this effort

Phase 4 (CSS Layers)           — ~1 day of work
  Wrap CSS in @layer, fix CSS switching

Phase 5 (Optional/Future)      — ~2+ weeks of work
  AppV2 sheets, TypeData models, ProseMirror
```

---

## Files Inventory

### Will require changes (Phase 1-2):
- `system.json`
- `scripts/hooks.js`
- `scripts/interface/srcombat-tracker.js`
- `scripts/interface/compendium.js`
- `scripts/entities/actors/baseSheet.js`
- `scripts/entities/items/itemSheet.js`
- `scripts/rolls/roll-dialog.js`
- `scripts/rolls/roll-message.js`
- `scripts/interface/sheet-config.js`
- `scripts/interface/pan-dialog.js`
- `scripts/interface/spendNetHits-dialog.js`
- `scripts/interface/sceneConfig.js`
- `scripts/interface/measuredTemplateConfig.js`
- `css/sr5.css`
- `css/sr6.css`

### Likely unaffected (pure logic, no UI/hooks):
- `scripts/config.js`
- `scripts/rolls/roll-prepare-case/*.js` (mostly)
- `scripts/rolls/roll-test-case/*.js` (mostly)
- `scripts/system/vision.js` (may need review for canvas API changes)
- `scripts/migration.js`
