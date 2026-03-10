# How to Report a Bug

Found a bug in the Shadowrun 5 system? Here's how to submit a useful report.

## Before Reporting

1. **Update to the latest version** — the bug may already be fixed
2. **Disable other modules** — check if the bug persists with all modules disabled (Setup > Manage Modules). If it only happens with a specific module active, the issue may be with that module instead
3. **Search existing issues** — someone may have already reported it

## What to Include

### Required

- **System version** — found in Foundry's system management screen or `system.json`
- **Foundry VTT version** — found in the bottom-right of Foundry's setup screen
- **What happened** — describe the actual behavior
- **What you expected** — describe what should have happened
- **Steps to reproduce** — exact steps to trigger the bug, starting from a known state

### Helpful Extras

- **Console errors** — open browser DevTools (`F12`), go to the Console tab, and copy any red error messages. These are often the fastest way to identify the problem
- **Screenshots or screen recordings** — especially useful for visual bugs (layout issues, missing elements, wrong values)
- **Actor type** — PC, Grunt, Spirit, or Drone
- **Active modules** — list any modules you have enabled

## Example Report

> **System version:** 13.0.1-alpha.8
> **Foundry version:** 13.331
>
> **Description:** When I open a grunt sheet and switch to the Combat tab, ranged weapons show a damage value of 0 even though the weapon has correct values on its item sheet.
>
> **Steps to reproduce:**
> 1. Create a new Grunt actor
> 2. Drag an Ares Predator from the compendium onto the grunt
> 3. Open the grunt sheet
> 4. Click the Combat tab
> 5. Damage value shows 0
>
> **Console errors:**
> ```
> TypeError: Cannot read properties of undefined (reading 'damage')
>     at calculateWeaponDamage (sr5-item.js:342)
> ```
>
> **Modules:** None (tested with all modules disabled)

## Where to Submit

Open an issue on the GitHub repository using the **Bug Report** template. The template will guide you through all the fields above.
