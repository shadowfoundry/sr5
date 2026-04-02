// ══════════════════════════════════════════════════════════════════════
//  SR5 Roll System Test Macro
//  Imports example characters, fires archetype-appropriate rolls with
//  auto-submitted dialogs, verifies chat messages, and cleans up.
// ══════════════════════════════════════════════════════════════════════

// ── Abort flag ──
let _aborted = false;
function checkpoint() { if (_aborted) throw new Error("Test aborted by user"); }

// ── Logging (matches srLog pill format) ──
function log(msg, level = 'info') {
  const isActive = game.settings.get("sr5", "sr5Log.active");
  const userLevel = isActive ? game.settings.get("sr5", "sr5Log.level") : 2;
  const msgLevel = level === 'error' ? 0 : level === 'warn' ? 1 : 2;
  if (msgLevel > userLevel && isActive) return;

  const levelColors = {
    0: "rgba(250, 0, 0, 0.8)",
    1: "rgba(250, 120, 0, 0.8)",
    2: "rgba(0, 180, 0, 0.8)",
  };
  const tagLabels = { 0: "ERROR", 1: "WARNING", 2: "INFORMATION" };
  const headerStyle = "color: #fff; background-color: rgba(157, 6, 104, 1); padding: 0 5px; border-radius: 2px;";
  const tagStyle = `color: #fff; background-color: ${levelColors[msgLevel]}; padding: 0 5px; border-radius: 2px;`;
  const consoleFn = msgLevel === 0 ? 'error' : msgLevel === 1 ? 'warn' : 'log';
  console[consoleFn](`%cShadowrun 5%c %c${tagLabels[msgLevel]}%c [Roll Test] ${msg}`, headerStyle, "", tagStyle, "");
}

// ── Results collector ──
const results = { passed: [], failed: [], warnings: [], skipped: [] };

// ── Dialog auto-submit: intercept DialogV2.wait ──
const _originalWait = foundry.applications.api.DialogV2.wait;
let _autoSubmit = false;

function enableAutoSubmit() {
  _autoSubmit = true;
  foundry.applications.api.DialogV2.wait = async function (config) {
    if (!_autoSubmit) return _originalWait.call(this, config);
    log(`Auto-submitting dialog: ${config?.window?.title || 'unknown'}`);
    return { action: "roll", reagentsSpent: 0 };
  };
  log("Auto-submit enabled");
}

function disableAutoSubmit() {
  _autoSubmit = false;
  foundry.applications.api.DialogV2.wait = _originalWait;
}

// ── Wait for a new chat message ──
async function waitForChatMessage(fn, timeoutMs = 5000) {
  const beforeCount = game.messages.size;
  await fn();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (game.messages.size > beforeCount) {
      return game.messages.contents[game.messages.size - 1];
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return null;
}

// ── Individual roll test ──
async function testRoll(label, fn) {
  checkpoint();
  try {
    const msg = await waitForChatMessage(fn);
    if (msg) {
      results.passed.push(label);
      log(`PASS: ${label}`);
    } else {
      results.warnings.push(`${label}: no chat message produced`);
      log(`WARN: ${label} — no chat message produced`, 'warn');
    }
  } catch (e) {
    results.failed.push(`${label}: ${e.message}`);
    log(`FAIL: ${label} — ${e.message}`, 'error');
  }
}

// ── Load example character from JSON ──
async function loadExampleActor(filename) {
  const path = `systems/sr5/examples/actors/${filename}`;
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}: ${response.status}`);
  const data = await response.json();
  // Prefix name to identify test actors
  data.name = `__TEST_${data.name}`;
  // Extract embedded items
  const items = data.items || [];
  delete data.items;
  // Create actor
  const actor = await Actor.create(data);
  // Create embedded items
  if (items.length) {
    await actor.createEmbeddedDocuments("Item", items);
  }
  await new Promise(r => setTimeout(r, 500));
  return actor;
}

// ── Helper: find item by type and optionally subtype ──
function findItem(actor, itemType, subField, subValue) {
  if (subField && subValue) {
    return actor.items.find(i => i.type === itemType && i.system?.[subField] === subValue);
  }
  return actor.items.find(i => i.type === itemType);
}

// ── Roll delay ──
const ROLL_DELAY = 800;

// ══════════════════════════════════════════════════════════════════════
//  Test definitions per archetype
// ══════════════════════════════════════════════════════════════════════

async function testCommonRolls(actor, prefix) {
  // These should work on any actorPc with attributes and skills

  // Attribute tests
  await testRoll(`${prefix} | Attribute: body`, async () => {
    actor.rollTest("attribute", "body");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Attribute: agility`, async () => {
    actor.rollTest("attribute", "agility");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Derived attributes
  await testRoll(`${prefix} | Derived: composure`, async () => {
    actor.rollTest("derivedAttribute", "composure");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Derived: judgeIntentions`, async () => {
    actor.rollTest("derivedAttribute", "judgeIntentions");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Derived: memory`, async () => {
    actor.rollTest("derivedAttribute", "memory");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Defense
  await testRoll(`${prefix} | Defense: dodge`, async () => {
    actor.rollTest("defenseSimple", "dodge");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Resistance
  await testRoll(`${prefix} | Resistance: physicalDamage`, async () => {
    actor.rollTest("resistanceSimple", "physicalDamage");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Lift / Movement
  await testRoll(`${prefix} | Lift: carry`, async () => {
    actor.rollTest("lift", "carry");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Movement: run`, async () => {
    actor.rollTest("movement", "run");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });
}

async function testStreetSamurai(actor, prefix) {
  await testCommonRolls(actor, prefix);

  // Skills
  await testRoll(`${prefix} | Skill: automatics`, async () => {
    actor.rollTest("skill", "automatics");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: perception`, async () => {
    actor.rollTest("skill", "perception");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: sneaking`, async () => {
    actor.rollTest("skill", "sneaking");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Weapon rolls
  const weapon = findItem(actor, "itemWeapon");
  if (weapon) {
    await testRoll(`${prefix} | Weapon: ${weapon.name}`, async () => {
      weapon.rollTest("weapon");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  } else {
    results.skipped.push(`${prefix} | Weapon roll (no weapon found)`);
  }
}

async function testCombatMage(actor, prefix) {
  await testCommonRolls(actor, prefix);

  // Skill: spellcasting
  await testRoll(`${prefix} | Skill: spellcasting`, async () => {
    actor.rollTest("skill", "spellcasting");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Spell rolls
  const spell = findItem(actor, "itemSpell");
  if (spell) {
    await testRoll(`${prefix} | Spell: ${spell.name}`, async () => {
      spell.rollTest("spell");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  } else {
    results.skipped.push(`${prefix} | Spell roll (no spell found)`);
  }

  // Weapon roll (combat mages often have a weapon too)
  const weapon = findItem(actor, "itemWeapon");
  if (weapon) {
    await testRoll(`${prefix} | Weapon: ${weapon.name}`, async () => {
      weapon.rollTest("weapon");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  }
}

async function testDecker(actor, prefix) {
  await testCommonRolls(actor, prefix);

  // Skills
  await testRoll(`${prefix} | Skill: hacking`, async () => {
    actor.rollTest("skill", "hacking");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: electronicWarfare`, async () => {
    actor.rollTest("skill", "electronicWarfare");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: computer`, async () => {
    actor.rollTest("skill", "computer");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Weapon
  const weapon = findItem(actor, "itemWeapon");
  if (weapon) {
    await testRoll(`${prefix} | Weapon: ${weapon.name}`, async () => {
      weapon.rollTest("weapon");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  }
}

async function testTechnomancer(actor, prefix) {
  await testCommonRolls(actor, prefix);

  // Skills
  await testRoll(`${prefix} | Skill: compiling`, async () => {
    actor.rollTest("skill", "compiling");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: registering`, async () => {
    actor.rollTest("skill", "registering");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Complex form
  const cf = findItem(actor, "itemComplexForm");
  if (cf) {
    await testRoll(`${prefix} | Complex Form: ${cf.name}`, async () => {
      cf.rollTest("complexForm");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  } else {
    results.skipped.push(`${prefix} | Complex Form roll (none found)`);
  }
}

async function testShaman(actor, prefix) {
  await testCommonRolls(actor, prefix);

  // Skills
  await testRoll(`${prefix} | Skill: summoning`, async () => {
    actor.rollTest("skill", "summoning");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: spellcasting`, async () => {
    actor.rollTest("skill", "spellcasting");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Spell
  const spell = findItem(actor, "itemSpell");
  if (spell) {
    await testRoll(`${prefix} | Spell: ${spell.name}`, async () => {
      spell.rollTest("spell");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  } else {
    results.skipped.push(`${prefix} | Spell roll (none found)`);
  }
}

async function testFace(actor, prefix) {
  await testCommonRolls(actor, prefix);

  // Social skills
  await testRoll(`${prefix} | Skill: con`, async () => {
    actor.rollTest("skill", "con");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: negotiation`, async () => {
    actor.rollTest("skill", "negotiation");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: etiquette`, async () => {
    actor.rollTest("skill", "etiquette");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Weapon
  const weapon = findItem(actor, "itemWeapon");
  if (weapon) {
    await testRoll(`${prefix} | Weapon: ${weapon.name}`, async () => {
      weapon.rollTest("weapon");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  }
}

async function testPhysicalAdept(actor, prefix) {
  await testCommonRolls(actor, prefix);

  // Combat skills
  await testRoll(`${prefix} | Skill: unarmedCombat`, async () => {
    actor.rollTest("skill", "unarmedCombat");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: gymnastics`, async () => {
    actor.rollTest("skill", "gymnastics");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Weapon
  const weapon = findItem(actor, "itemWeapon");
  if (weapon) {
    await testRoll(`${prefix} | Weapon: ${weapon.name}`, async () => {
      weapon.rollTest("weapon");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  }
}

async function testGunslinger(actor, prefix) {
  await testCommonRolls(actor, prefix);

  // Skills
  await testRoll(`${prefix} | Skill: pistols`, async () => {
    actor.rollTest("skill", "pistols");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: perception`, async () => {
    actor.rollTest("skill", "perception");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // All weapons
  const weapons = actor.items.filter(i => i.type === "itemWeapon");
  for (const weapon of weapons.slice(0, 3)) { // cap at 3 to keep test fast
    await testRoll(`${prefix} | Weapon: ${weapon.name}`, async () => {
      weapon.rollTest("weapon");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  }
}

async function testRigger(actor, prefix) {
  await testCommonRolls(actor, prefix);

  // Skills
  await testRoll(`${prefix} | Skill: pilotGroundCraft`, async () => {
    actor.rollTest("skill", "pilotGroundCraft");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  await testRoll(`${prefix} | Skill: gunnery`, async () => {
    actor.rollTest("skill", "gunnery");
    await new Promise(r => setTimeout(r, ROLL_DELAY));
  });

  // Weapon
  const weapon = findItem(actor, "itemWeapon");
  if (weapon) {
    await testRoll(`${prefix} | Weapon: ${weapon.name}`, async () => {
      weapon.rollTest("weapon");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  }
}

// ══════════════════════════════════════════════════════════════════════
//  Auto-detect rolls for world actors
// ══════════════════════════════════════════════════════════════════════

async function testWorldActor(actor, prefix) {
  const rollableTypes = ["actorPc", "actorGrunt", "actorSpirit", "actorSprite"];
  const hasFullRolls = rollableTypes.includes(actor.type);

  // Common rolls only work on actors with attributes/skills
  if (hasFullRolls) {
    await testCommonRolls(actor, prefix);

    // Test skills that have rating > 0
    const skills = actor.system?.skills || {};
    const testedSkills = new Set();
    for (const [key, skill] of Object.entries(skills)) {
      if (skill?.rating?.value > 0 && testedSkills.size < 5) {
        testedSkills.add(key);
        await testRoll(`${prefix} | Skill: ${key}`, async () => {
          actor.rollTest("skill", key);
          await new Promise(r => setTimeout(r, ROLL_DELAY));
        });
      }
    }
  } else {
    results.skipped.push(`${prefix} | Common/Skill rolls (${actor.type} not supported)`);
  }

  // Test first weapon
  const weapon = findItem(actor, "itemWeapon");
  if (weapon) {
    await testRoll(`${prefix} | Weapon: ${weapon.name}`, async () => {
      weapon.rollTest("weapon");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  }

  // Test first spell
  const spell = findItem(actor, "itemSpell");
  if (spell) {
    await testRoll(`${prefix} | Spell: ${spell.name}`, async () => {
      spell.rollTest("spell");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  }

  // Test first complex form
  const cf = findItem(actor, "itemComplexForm");
  if (cf) {
    await testRoll(`${prefix} | Complex Form: ${cf.name}`, async () => {
      cf.rollTest("complexForm");
      await new Promise(r => setTimeout(r, ROLL_DELAY));
    });
  }
}

// ══════════════════════════════════════════════════════════════════════
//  Character → test function mapping
// ══════════════════════════════════════════════════════════════════════

const EXAMPLE_CHARACTERS = [
  { file: "streetsamurai_razorback.json", label: "Street Samurai", fn: testStreetSamurai },
  { file: "combatmage_inferno.json", label: "Combat Mage", fn: testCombatMage },
  { file: "decker_spectre.json", label: "Decker", fn: testDecker },
  { file: "technomancer_glitch.json", label: "Technomancer", fn: testTechnomancer },
  { file: "shaman_spiritwalker.json", label: "Shaman", fn: testShaman },
  { file: "face_silvertongue.json", label: "Face", fn: testFace },
  { file: "physicaladept_nightwire.json", label: "Phys. Adept", fn: testPhysicalAdept },
  { file: "gunslinger_deadshot.json", label: "Gunslinger", fn: testGunslinger },
  { file: "rigger_axle.json", label: "Rigger", fn: testRigger },
];

// ── Main test runner ──
async function runRollTests(selectedExamples, selectedWorldActorIds) {
  const createdActors = [];
  try {
    enableAutoSubmit();

    // Run example character tests
    for (const idx of selectedExamples) {
      checkpoint();
      const charDef = EXAMPLE_CHARACTERS[idx];
      log(`Loading ${charDef.label}...`);
      let actor;
      try {
        actor = await loadExampleActor(charDef.file);
        createdActors.push(actor);
        log(`Testing ${charDef.label} (${actor.items.size} items)...`);
        await charDef.fn(actor, charDef.label);
      } catch (e) {
        results.failed.push(`${charDef.label}: failed to load/test — ${e.message}`);
        log(`FAIL: ${charDef.label} — ${e.message}`, 'error');
      }
    }

    // Run world actor tests
    for (const actorId of selectedWorldActorIds) {
      checkpoint();
      const actor = game.actors.get(actorId);
      if (!actor) continue;
      const prefix = actor.name;
      log(`Testing world actor ${prefix} (${actor.items.size} items)...`);
      try {
        await testWorldActor(actor, prefix);
      } catch (e) {
        results.failed.push(`${prefix}: ${e.message}`);
        log(`FAIL: ${prefix} — ${e.message}`, 'error');
      }
    }

  } finally {
    disableAutoSubmit();
    // Clean up only example actors (not world actors)
    for (const actor of createdActors) {
      try {
        log(`Cleaning up ${actor.name}...`);
        await actor.delete();
      } catch (e) {
        log(`Failed to delete ${actor.name}: ${e.message}`, 'warn');
      }
    }
  }

  return results;
}

// ── Display results ──
function showResults(results) {
  const total = results.passed.length + results.failed.length + results.warnings.length + results.skipped.length;
  const passRate = total > 0 ? Math.round((results.passed.length / total) * 100) : 0;

  const S = {
    wrap: 'font-family:monospace;font-size:13px;color:#222;',
    h2: 'font-size:15px;margin:0 0 8px;color:#222;border:none;',
    hFail: 'font-size:13px;margin:12px 0 4px;padding:4px 8px;border-radius:3px;color:#fff;background:#b22;border:none;',
    hWarn: 'font-size:13px;margin:12px 0 4px;padding:4px 8px;border-radius:3px;color:#fff;background:#a67c00;border:none;',
    hPass: 'font-size:13px;margin:12px 0 4px;padding:4px 8px;border-radius:3px;color:#fff;background:#287828;border:none;',
    hSkip: 'font-size:13px;margin:12px 0 4px;padding:4px 8px;border-radius:3px;color:#fff;background:#666;border:none;',
    li: 'margin:2px 0;padding:2px 4px;border-radius:2px;background:rgba(0,0,0,0.04);',
  };

  let html = `<div style="${S.wrap};max-height:60vh;overflow-y:auto;padding-right:4px;">`;
  html += `<h2 style="${S.h2}">SR5 Roll Test Results</h2>`;
  html += `<div style="margin-bottom:8px;">${results.passed.length}/${total} passed (${passRate}%)</div>`;

  if (results.failed.length) {
    html += `<h3 style="${S.hFail}">Failed (${results.failed.length})</h3><ul style="list-style:none;padding:0;">`;
    for (const f of results.failed) html += `<li style="${S.li}">${f}</li>`;
    html += `</ul>`;
  }
  if (results.warnings.length) {
    html += `<h3 style="${S.hWarn}">Warnings (${results.warnings.length})</h3><ul style="list-style:none;padding:0;">`;
    for (const w of results.warnings) html += `<li style="${S.li}">${w}</li>`;
    html += `</ul>`;
  }
  if (results.skipped.length) {
    html += `<h3 style="${S.hSkip}">Skipped (${results.skipped.length})</h3><ul style="list-style:none;padding:0;">`;
    for (const s of results.skipped) html += `<li style="${S.li}">${s}</li>`;
    html += `</ul>`;
  }
  if (results.passed.length) {
    html += `<h3 style="${S.hPass}">Passed (${results.passed.length})</h3><ul style="list-style:none;padding:0;">`;
    for (const p of results.passed) html += `<li style="${S.li}">${p}</li>`;
    html += `</ul>`;
  }
  html += `</div>`;

  foundry.applications.api.DialogV2.prompt({
    window: { title: "SR5 Roll Test Results" },
    content: html,
    position: { width: 500 },
    ok: { label: "Close" },
  });
}

// ── Entry point ──
{
  const btnStyle = "padding:3px 10px;font-size:12px;border:1px solid rgba(0,0,0,0.2);border-radius:3px;cursor:pointer;background:rgba(0,0,0,0.06);";
  const sectionStyle = "font-size:13px;font-weight:bold;margin:10px 0 4px;padding:4px 8px;border-radius:3px;background:rgba(0,0,0,0.08);";

  // Example characters section
  const exampleCheckboxes = EXAMPLE_CHARACTERS.map((c, i) =>
    `<label style="display:block;margin:3px 0;cursor:pointer;padding:2px 4px;border-radius:2px;">
      <input type="checkbox" name="example_${i}" data-group="examples" checked style="margin-right:8px;">${c.label}
      <span style="color:#888;font-size:11px;margin-left:4px;">${c.file}</span>
    </label>`
  ).join("");

  // World actors section (all non-test actors, showing type)
  const worldActors = game.actors.filter(a => !a.name.startsWith("__TEST_"));
  const actorTypeLabels = {
    actorPc: "PC", actorGrunt: "Grunt", actorSpirit: "Spirit",
    actorSprite: "Sprite", actorDrone: "Drone", actorAgent: "Agent", actorDevice: "Device",
  };
  const worldCheckboxes = worldActors.map(a =>
    `<label style="display:block;margin:3px 0;cursor:pointer;padding:2px 4px;border-radius:2px;">
      <input type="checkbox" name="world_${a.id}" data-group="world" style="margin-right:8px;">${a.name}
      <span style="color:#888;font-size:11px;margin-left:4px;">${actorTypeLabels[a.type] || a.type} · ${a.items.size} items</span>
    </label>`
  ).join("") || '<span style="color:#888;font-style:italic;">No actors in this world</span>';

  const html = `<div style="font-family:monospace;font-size:13px;">
    <p style="margin:0 0 8px;">Select characters to test rolls with:</p>
    <div style="max-height:50vh;overflow-y:auto;padding-right:4px;">
    <div style="${sectionStyle}">Example Characters</div>
    <div style="margin:0 0 8px;padding:4px 12px;background:rgba(0,0,0,0.04);border-radius:4px;">
      ${exampleCheckboxes}
    </div>
    <div style="${sectionStyle}">World Actors</div>
    <div style="margin:0 0 8px;padding:4px 12px;background:rgba(0,0,0,0.04);border-radius:4px;">
      ${worldCheckboxes}
    </div>
    </div>
    <div style="margin:8px 0;display:flex;gap:6px;">
      <button type="button" class="sr5-select-all" style="${btnStyle}">All</button>
      <button type="button" class="sr5-select-none" style="${btnStyle}">None</button>
      <button type="button" class="sr5-select-examples" style="${btnStyle}">Examples Only</button>
      <button type="button" class="sr5-select-world" style="${btnStyle}">World Only</button>
    </div>
    <p style="color:#a67c00;margin:8px 0 0;font-size:12px;">Roll dialogs will be auto-submitted. Chat messages will be created.</p>
  </div>`;

  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "SR5 Roll Tests" },
    content: html,
    buttons: [
      {
        action: "start",
        label: "Start Tests",
        icon: "fas fa-play",
        default: true,
        callback: (event, button, dialog) => {
          const examples = [];
          EXAMPLE_CHARACTERS.forEach((_, i) => {
            const cb = dialog.element.querySelector(`input[name="example_${i}"]`);
            if (cb?.checked) examples.push(i);
          });
          const worldIds = [];
          dialog.element.querySelectorAll('input[data-group="world"]:checked').forEach(cb => {
            worldIds.push(cb.name.replace("world_", ""));
          });
          return { examples, worldIds };
        },
      },
      { action: "cancel", label: "Cancel", icon: "fas fa-times" },
    ],
    rejectClose: false,
    render: (event, dialog) => {
      const el = dialog.element;
      el.querySelector('.sr5-select-all')?.addEventListener('click', () => {
        el.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = true);
      });
      el.querySelector('.sr5-select-none')?.addEventListener('click', () => {
        el.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
      });
      el.querySelector('.sr5-select-examples')?.addEventListener('click', () => {
        el.querySelectorAll('input[data-group="examples"]').forEach(c => c.checked = true);
        el.querySelectorAll('input[data-group="world"]').forEach(c => c.checked = false);
      });
      el.querySelector('.sr5-select-world')?.addEventListener('click', () => {
        el.querySelectorAll('input[data-group="examples"]').forEach(c => c.checked = false);
        el.querySelectorAll('input[data-group="world"]').forEach(c => c.checked = true);
      });
    },
  });

  // result is {examples, worldIds} from callback, or "cancel" string, or null
  if (!result || result === "cancel" || typeof result !== "object") return;
  const { examples = [], worldIds = [] } = result;
  if (examples.length === 0 && worldIds.length === 0) return;

  const totalChars = examples.length + worldIds.length;
  log(`Starting SR5 Roll Tests with ${totalChars} characters (${examples.length} examples, ${worldIds.length} world)...`);
  const testResults = await runRollTests(examples, worldIds);
  const total = testResults.passed.length + testResults.failed.length + testResults.warnings.length + testResults.skipped.length;
  log(`Roll tests complete: ${testResults.passed.length}/${total} passed, ${testResults.failed.length} failed, ${testResults.warnings.length} warnings`);
  showResults(testResults);
}
