/**
 * Default Layouts — defines the initial tab/panel/block arrangement for each
 * SR5 actor type. These match the current hardcoded template structure.
 */

import {
  TAB_ICONS 
} from './block-registry.js'

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------

let _nextId = 0
function _id() { return `default-${_nextId++}` }

function _panel(label, width, tabs) {
  return {
    id: _id(), label, width, tabs 
  }
}

function _tab(label, icon, blocks) {
  return {
    id: _id(), label, icon: TAB_ICONS[icon], iconKey: icon, blocks 
  }
}

function _block(id, column) {
  return column !== undefined ? {
    id, column 
  } : {
    id 
  }
}

// ---------------------------------------------------------------------------
//  Character (PC) — 2 panels: sidebar (1-col) + main (2-col)
// ---------------------------------------------------------------------------

function _characterDefaultLayout() {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Core', 'core', [
          _block('attributes'), _block('resistances'),
          _block('defenses'), _block('initiatives'),
        ]),
        _tab('Derived', 'derived', [
          _block('limits'), _block('derivedAttributes'),
          _block('essence'), _block('carrying'), _block('movement'),
        ]),
        _tab('Magic', 'magic', [
          _block('magicUserType'), _block('adeptPowerPoint'),
          _block('tradition'), _block('astral'), _block('reagents'),
        ]),
        _tab('Matrix', 'matrix', [
          _block('matrixDevice'), _block('matrixSilentMode'),
          _block('matrixInit'), _block('matrixGrid'),
          _block('matrixAttributes'), _block('matrixPrograms'),
          _block('matrixMonitor'), _block('matrixResistances'),
          _block('matrixPan'), _block('matrixMarksControled'),
          _block('matrixOverwatch'), _block('matrixMarks'),
        ]),
        _tab('Qualities', 'qualities', [
          _block('qualities'), _block('visions'), _block('addictions'),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Skills', 'skills', [
          _block('activeSkills'), _block('skillGroups'),
          _block('knowledgeSkills'), _block('languageSkills'),
        ]),
        _tab('Combat', 'combat', [
          _block('rangedWeapons'), _block('meleeWeapons'),
          _block('grenades'), _block('armors'),
          _block('ammunitions'), _block('martialArts'),
        ]),
        _tab('Gear', 'gear', [
          _block('variousGear'), _block('vehicles'), _block('money'),
        ]),
        _tab('Augmentations', 'augmentation', [
          _block('augmentations'), _block('externalEffects'),
        ]),
        _tab('Magician', 'magician', [
          _block('spells'), _block('adeptPowers'),
          _block('summonedSpirits'), _block('foci'),
          _block('preparations'), _block('rituals'),
          _block('powers'), _block('metamagics'),
        ]),
        _tab('Technomancer', 'technomancer', [
          _block('resonanceActions'), _block('complexForms'),
          _block('spriteItems'), _block('echoes'), _block('powers'),
        ]),
        _tab('Matrix', 'matrix', [
          _block('matrixDevicesList'), _block('matrixProgramsList'),
          _block('matrixActionsList'),
        ]),
        _tab('Social', 'social', [
          _block('contacts'), _block('lifestyles'),
          _block('sins'), _block('reputation'),
        ]),
        _tab('Bio', 'bio', [
          _block('biography'), _block('critterBiography'),
          _block('description'), _block('background'), _block('karma'),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  Grunt — same as character but simplified bio tab
// ---------------------------------------------------------------------------

function _gruntDefaultLayout() {
  _nextId = 0
  const layout = _characterDefaultLayout()
  // Replace Bio tab with grunt-specific version (no biography, no karma)
  const mainPanel = layout.panels.find(p => p.label === 'MAIN')
  if (mainPanel) {
    const bioIdx = mainPanel.tabs.findIndex(t => t.label === 'Bio')
    if (bioIdx !== -1) {
      mainPanel.tabs[bioIdx] = _tab('Bio', 'bio', [
        _block('biographyContact'), _block('descriptionGrunt'),
        _block('background'),
      ])
    }
    // Grunt gear tab has no money
    const gearIdx = mainPanel.tabs.findIndex(t => t.label === 'Gear')
    if (gearIdx !== -1) {
      mainPanel.tabs[gearIdx] = _tab('Gear', 'gear', [
        _block('variousGear'), _block('vehicles'),
      ])
    }
  }
  return layout
}

// ---------------------------------------------------------------------------
//  Spirit — simplified: 3 left tabs, 1 right section
// ---------------------------------------------------------------------------

function _spiritDefaultLayout() {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Core', 'core', [
          _block('attributes'), _block('resistances'),
          _block('defenses'), _block('initiatives'),
        ]),
        _tab('Derived', 'derived', [
          _block('limits'), _block('derivedAttributes'),
          _block('essence'), _block('carrying'), _block('movement'),
        ]),
        _tab('Magic', 'magic', [
          _block('astral'), _block('tradition'),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Combat', 'combat', [
          _block('spiritWeapons'), _block('activeSkills'),
          _block('powers'), _block('spells'),
          _block('externalEffects'),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  Drone — 2 left tabs, 3 right tabs
// ---------------------------------------------------------------------------

function _droneDefaultLayout() {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Core', 'core', [
          _block('attributes'), _block('resistances'),
          _block('defenses'), _block('controlMode'), _block('initiatives'),
        ]),
        _tab('Matrix', 'matrix', [
          _block('matrixDevice'), _block('matrixSilentMode'),
          _block('matrixGrid'), _block('matrixPrograms'),
          _block('matrixResistances'), _block('matrixMarksControled'),
          _block('matrixMarks'),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Combat', 'combat', [
          _block('droneRoll'), _block('activeSkills'),
          _block('rangedWeapons'), _block('armors'),
          _block('ammunitions'), _block('externalEffects'),
        ]),
        _tab('Matrix', 'matrix', [
          _block('matrixProgramsList'), _block('matrixActionsList'),
        ]),
        _tab('Modifications', 'drone', [
          _block('modifications'),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  Sprite — 1 left tab, 1 right section
// ---------------------------------------------------------------------------

function _spriteDefaultLayout() {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Matrix', 'matrix', [
          _block('matrixAttributes'), _block('matrixSilentMode'),
          _block('matrixGrid'), _block('initiatives'),
          _block('matrixResistances'), _block('matrixMarksControled'),
          _block('matrixOverwatch'), _block('matrixMarks'),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Abilities', 'skills', [
          _block('activeSkills'), _block('matrixActionsList'),
          _block('spritePowers'), _block('externalEffects'),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  Device — 1 left block, 2 right tabs
// ---------------------------------------------------------------------------

function _deviceDefaultLayout() {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Device', 'device', [
          _block('matrixDevice'), _block('matrixMaglockType'),
          _block('matrixAttributes'), _block('initiatives'),
          _block('matrixSilentMode'), _block('matrixGrid'),
          _block('matrixMarksControled'), _block('matrixMarks'),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Matrix', 'matrix', [
          _block('iceAttack'), _block('matrixActionsList'),
          _block('externalEffects'),
        ]),
        _tab('Bio', 'bio', [
          _block('description'),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  Agent — 1 left tab, 1 right section
// ---------------------------------------------------------------------------

function _agentDefaultLayout() {
  _nextId = 0
  return {
    panels: [
      _panel('SIDEBAR', 1, [
        _tab('Matrix', 'matrix', [
          _block('matrixAttributes'), _block('matrixSilentMode'),
          _block('matrixGrid'), _block('initiatives'),
          _block('matrixResistances'), _block('matrixMarksControled'),
          _block('matrixOverwatch'), _block('matrixMarks'),
        ]),
      ]),
      _panel('MAIN', 2, [
        _tab('Abilities', 'skills', [
          _block('activeSkills'), _block('matrixProgramsList'),
          _block('matrixActionsList'), _block('externalEffects'),
        ]),
      ]),
    ],
  }
}

// ---------------------------------------------------------------------------
//  Public API
// ---------------------------------------------------------------------------

export function getDefaultLayout(actorType) {
  switch (actorType) {
    case 'SR5ActorSheet':     return _characterDefaultLayout()
    case 'SR5GruntSheet':     return _gruntDefaultLayout()
    case 'SR5SpiritSheet':    return _spiritDefaultLayout()
    case 'SR5DroneSheet':     return _droneDefaultLayout()
    case 'SR5SpriteSheet':    return _spriteDefaultLayout()
    case 'SR5AppareilSheet':  return _deviceDefaultLayout()
    case 'SR5AgentSheet':     return _agentDefaultLayout()
    default:                  return _characterDefaultLayout()
  }
}
