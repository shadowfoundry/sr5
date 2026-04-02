/**
 * SR5 DataModel Migration Test Suite
 *
 * Run as a Foundry Script macro. Tests all 43 DataModel types:
 * - 7 actor types: create, prepareData, open sheet, cycle tabs, scroll, cleanup
 * - 36 item types: create, prepareData, open sheet, cycle tabs, scroll, cleanup
 *
 * Features a control panel with Start, Pause/Resume, Cancel,
 * and configurable settings for tab delay, scroll speed, and tab navigation toggle.
 * Results are logged to console and displayed in a dialog.
 */

const ACTOR_TYPES = [
  'actorPc',
  'actorGrunt',
  'actorSpirit',
  'actorSprite',
  'actorDrone',
  'actorDevice',
  'actorAgent',
];

const ITEM_TYPES = [
  'itemAdeptPower',
  'itemAmmunition',
  'itemArmor',
  'itemAugmentation',
  'itemComplexForm',
  'itemContact',
  'itemDevice',
  'itemDrug',
  'itemEcho',
  'itemEffect',
  'itemFocus',
  'itemGear',
  'itemKarma',
  'itemKnowledge',
  'itemLanguage',
  'itemLifestyle',
  'itemMark',
  'itemMartialArt',
  'itemMetamagic',
  'itemNuyen',
  'itemPower',
  'itemPreparation',
  'itemProgram',
  'itemQuality',
  'itemReputation',
  'itemRitual',
  'itemSin',
  'itemSpell',
  'itemSpirit',
  'itemSprite',
  'itemSpritePower',
  'itemTradition',
  'itemVehicle',
  'itemVehicleMod',
  'itemWeapon',
];

// Special creation data for actor types that require it.
// Note: passing `items: []` bypasses SR5Actor.create()'s dialog logic (line 75 check).
function getActorCreateData(type) {
  const base = { name: `__TEST_${type}`, type, items: [] };
  switch (type) {
    case 'actorSpirit':
      base.system = { force: { base: 3, value: 3, modifiers: [] }, type: 'fire' };
      return base;
    case 'actorSprite':
      base.system = { level: 3, type: 'courier' };
      return base;
    default:
      return base;
  }
}

// ── Settings (read from UI before start) ──
const settings = {
  tabDelay: 1000,       // ms per tab
  scrollStep: 40,       // px per scroll tick
  scrollInterval: 50,   // ms between scroll ticks
  scrollPause: 500,     // ms pause at bottom before scrolling back
  navigateTabs: true,   // whether to cycle tabs at all
};

const results = { passed: [], failed: [], warnings: [] };

// ── Run control state ──
const ctrl = { paused: false, cancelled: false };

async function checkpoint() {
  if (ctrl.cancelled) throw new Error('__CANCELLED__');
  while (ctrl.paused) {
    await new Promise(r => setTimeout(r, 200));
    if (ctrl.cancelled) throw new Error('__CANCELLED__');
  }
}

// ── Control-panel UI ──
const TOTAL = ACTOR_TYPES.length + ITEM_TYPES.length;
let controlPanel = null;

function createControlPanel() {
  const panel = document.createElement('div');
  panel.id = 'sr5-test-runner';
  panel.innerHTML = `
    <style>
      #sr5-test-runner {
        position: fixed; top: 10px; right: 10px; z-index: 10000;
        background: #1a1a2e; color: #eee; border: 2px solid #555;
        border-radius: 8px; padding: 0; width: 340px;
        font-family: monospace; font-size: 13px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        user-select: none;
      }
      #sr5-test-runner .sr5t-titlebar {
        background: #2a2a4e; padding: 8px 12px; border-radius: 6px 6px 0 0;
        cursor: grab; display: flex; justify-content: space-between; align-items: center;
      }
      #sr5-test-runner .sr5t-titlebar:active { cursor: grabbing; }
      #sr5-test-runner .sr5t-titlebar h3 { margin: 0; font-size: 14px; color: #8cf; }
      #sr5-test-runner .sr5t-body { padding: 8px 12px 12px; }
      #sr5-test-runner .sr5t-row { margin: 4px 0; }
      #sr5-test-runner .sr5t-settings { margin: 8px 0; padding: 8px; background: #222244; border-radius: 4px; }
      #sr5-test-runner .sr5t-settings label { display: flex; justify-content: space-between; align-items: center; margin: 4px 0; }
      #sr5-test-runner .sr5t-settings input[type="number"] {
        width: 60px; background: #1a1a2e; color: #eee; border: 1px solid #555;
        border-radius: 3px; padding: 2px 4px; font-family: monospace; text-align: right;
      }
      #sr5-test-runner .sr5t-settings input[type="checkbox"] { width: 18px; height: 18px; }
      #sr5-test-runner .sr5t-buttons { margin-top: 10px; display: flex; gap: 8px; }
      #sr5-test-runner button {
        flex: 1; padding: 6px; border: 1px solid #666; border-radius: 4px;
        cursor: pointer; font-size: 12px; font-family: monospace;
      }
      #sr5-test-runner .sr5t-start { background: #2a5a2a; color: #afa; }
      #sr5-test-runner .sr5t-start:hover { background: #3a6a3a; }
      #sr5-test-runner .sr5t-pause { background: #2a4a6a; color: #adf; }
      #sr5-test-runner .sr5t-pause:hover { background: #3a5a7a; }
      #sr5-test-runner .sr5t-cancel { background: #5a2a2a; color: #faa; }
      #sr5-test-runner .sr5t-cancel:hover { background: #6a3a3a; }
    </style>
    <div class="sr5t-titlebar" id="sr5t-titlebar">
      <h3>SR5 Test Runner</h3>
      <span style="font-size:11px; color:#888;">${TOTAL} types</span>
    </div>
    <div class="sr5t-body">
      <div class="sr5t-row"><b>Progress:</b> <span id="sr5t-progress">0 / ${TOTAL}</span></div>
      <div class="sr5t-row"><b>Status:</b> <span id="sr5t-status">Ready</span></div>
      <div class="sr5t-row">
        <span style="color:#6f6;"><b>Pass:</b> <span id="sr5t-pass">0</span></span> &nbsp;
        <span style="color:#f66;"><b>Fail:</b> <span id="sr5t-fail">0</span></span> &nbsp;
        <span style="color:#fc6;"><b>Warn:</b> <span id="sr5t-warn">0</span></span>
      </div>

      <div class="sr5t-settings" id="sr5t-settings">
        <label>Tab navigation <input type="checkbox" id="sr5t-opt-tabs" checked></label>
        <label>Tab delay (ms) <input type="number" id="sr5t-opt-delay" value="1000" min="100" step="100"></label>
        <label>Scroll step (px) <input type="number" id="sr5t-opt-scroll-step" value="40" min="10" step="10"></label>
        <label>Scroll interval (ms) <input type="number" id="sr5t-opt-scroll-int" value="50" min="10" step="10"></label>
        <label>Scroll pause (ms) <input type="number" id="sr5t-opt-scroll-pause" value="500" min="0" step="100"></label>
      </div>

      <div class="sr5t-buttons" id="sr5t-start-buttons">
        <button class="sr5t-start" id="sr5t-start-btn"><i class="fas fa-play"></i> Start</button>
      </div>
      <div class="sr5t-buttons" id="sr5t-run-buttons" style="display:none;">
        <button class="sr5t-pause" id="sr5t-pause-btn"><i class="fas fa-pause"></i> Pause</button>
        <button class="sr5t-cancel" id="sr5t-cancel-btn"><i class="fas fa-stop"></i> Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(panel);

  // ── Dragging ──
  const titlebar = panel.querySelector('#sr5t-titlebar');
  let dragging = false, dragX = 0, dragY = 0;
  titlebar.addEventListener('mousedown', (e) => {
    dragging = true;
    dragX = e.clientX - panel.offsetLeft;
    dragY = e.clientY - panel.offsetTop;
    panel.style.left = panel.offsetLeft + 'px';
    panel.style.right = 'auto';
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    panel.style.left = (e.clientX - dragX) + 'px';
    panel.style.top = (e.clientY - dragY) + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });

  // ── Pause / Cancel ──
  panel.querySelector('#sr5t-pause-btn').addEventListener('click', () => {
    ctrl.paused = !ctrl.paused;
    panel.querySelector('#sr5t-pause-btn').innerHTML = ctrl.paused
      ? '<i class="fas fa-play"></i> Resume'
      : '<i class="fas fa-pause"></i> Pause';
    log(ctrl.paused ? 'PAUSED' : 'RESUMED');
  });

  panel.querySelector('#sr5t-cancel-btn').addEventListener('click', () => {
    ctrl.cancelled = true;
    ctrl.paused = false;
    log('CANCELLED by user');
  });

  return panel;
}

function waitForStart() {
  return new Promise((resolve) => {
    controlPanel.querySelector('#sr5t-start-btn').addEventListener('click', () => {
      // Read settings from UI
      settings.navigateTabs = controlPanel.querySelector('#sr5t-opt-tabs').checked;
      settings.tabDelay = parseInt(controlPanel.querySelector('#sr5t-opt-delay').value) || 1000;
      settings.scrollStep = parseInt(controlPanel.querySelector('#sr5t-opt-scroll-step').value) || 80;
      settings.scrollInterval = parseInt(controlPanel.querySelector('#sr5t-opt-scroll-int').value) || 50;
      settings.scrollPause = parseInt(controlPanel.querySelector('#sr5t-opt-scroll-pause').value) ?? 500;

      // Hide settings and start button, show run buttons
      controlPanel.querySelector('#sr5t-settings').style.display = 'none';
      controlPanel.querySelector('#sr5t-start-buttons').style.display = 'none';
      controlPanel.querySelector('#sr5t-run-buttons').style.display = 'flex';
      controlPanel.querySelector('#sr5t-status').textContent = 'Running...';
      resolve();
    });
  });
}

function updateControlPanel(current, status) {
  if (!controlPanel) return;
  controlPanel.querySelector('#sr5t-progress').textContent = `${current} / ${TOTAL}`;
  controlPanel.querySelector('#sr5t-status').textContent = status;
  controlPanel.querySelector('#sr5t-pass').textContent = results.passed.length;
  controlPanel.querySelector('#sr5t-fail').textContent = results.failed.length;
  controlPanel.querySelector('#sr5t-warn').textContent = results.warnings.length;
}

/**
 * Smoothly scroll a container from top to bottom, then back to top.
 * Respects checkpoint (pause/cancel) between scroll ticks.
 */
async function scrollContainer(container) {
  if (!container || container.scrollHeight <= container.clientHeight) return;
  const maxScroll = container.scrollHeight - container.clientHeight;
  // Scroll down
  container.scrollTop = 0;
  while (container.scrollTop < maxScroll) {
    await checkpoint();
    const prev = container.scrollTop;
    container.scrollTop = Math.min(prev + settings.scrollStep, maxScroll);
    await new Promise(r => setTimeout(r, settings.scrollInterval));
    if (container.scrollTop === prev) break; // can't scroll further, bail out
  }
  // Brief pause at the bottom before scrolling back
  if (settings.scrollPause > 0) await new Promise(r => setTimeout(r, settings.scrollPause));
  // Scroll back up
  while (container.scrollTop > 0) {
    await checkpoint();
    const prev = container.scrollTop;
    container.scrollTop = Math.max(prev - settings.scrollStep, 0);
    await new Promise(r => setTimeout(r, settings.scrollInterval));
    if (container.scrollTop === prev) break;
  }
}

/**
 * Find scrollable panels relevant to the currently active tab and scroll them.
 *
 * Actor sheets: .sr-panel (overflow-y:auto) is the PARENT of .sr-tab-region.tab.active
 *   hierarchy: .sr-panel > .sr-tab-region.tab.active
 *   So we find active tabs, then walk UP to their .sr-panel ancestor.
 *
 * Item sheets (legacy): scrollable areas are .SR-MainWindows, .SR-ItemColGauche,
 *   .SR-ItemColDroite, .SR-ItemConfig (all overflow:auto, often with .SR_ItemScrollY class)
 */
async function scrollActiveTab(sheetEl, tabId) {
  if (!sheetEl) return;
  const scrolled = new Set();

  // Strategy 1: Find .sr-panel ancestors of the active tab region (actor sheets)
  const activeTabs = tabId
    ? sheetEl.querySelectorAll(`.tab[data-tab="${tabId}"].active, .sr-tab-region[data-tab="${tabId}"].active`)
    : sheetEl.querySelectorAll('.tab.active, .sr-tab-region.active');
  for (const tab of activeTabs) {
    const panel = tab.closest('.sr-panel');
    if (panel && panel.scrollHeight > panel.clientHeight + 10 && !scrolled.has(panel)) {
      scrolled.add(panel);
      await scrollContainer(panel);
    }
  }

  // Strategy 2: Legacy item sheet scrollable areas
  const legacyCandidates = sheetEl.querySelectorAll('.SR_ItemScrollY, .SR-MainWindows, .SR-ItemColGauche, .SR-ItemColDroite, .SR-ItemConfig');
  for (const el of legacyCandidates) {
    if (el.scrollHeight > el.clientHeight + 10 && !scrolled.has(el)) {
      scrolled.add(el);
      await scrollContainer(el);
    }
  }
}

/**
 * Cycle through every tab on an open sheet, scrolling each.
 * Returns an array of tab errors (empty if all tabs rendered fine).
 */
async function cycleSheetTabs(sheet) {
  const tabErrors = [];
  const el = sheet.element;
  if (!el) return tabErrors;

  if (!settings.navigateTabs) return tabErrors;

  // Collect unique tab/group pairs from nav links
  const tabLinks = el.querySelectorAll('a[data-action="tab"][data-tab]');
  const seen = new Set();
  const tabs = [];
  for (const link of tabLinks) {
    const tab = link.dataset.tab;
    const group = link.dataset.group;
    const key = `${group}::${tab}`;
    if (!seen.has(key)) {
      seen.add(key);
      tabs.push({ tab, group });
    }
  }

  for (const { tab, group } of tabs) {
    await checkpoint();
    try {
      sheet.changeTab(tab, group, { force: true });
      // Highlight the active nav link
      const navLink = el.querySelector(`a[data-action="tab"][data-tab="${tab}"][data-group="${group}"]`)
        || el.querySelector(`a[data-action="tab"][data-tab="${tab}"]`);
      if (navLink) {
        navLink.style.outline = '2px solid #0f0';
        navLink.style.outlineOffset = '-1px';
        navLink.style.backgroundColor = 'rgba(0, 255, 0, 0.15)';
      }
      await new Promise(r => setTimeout(r, 300)); // brief settle
      await scrollActiveTab(el, tab);
      await new Promise(r => setTimeout(r, settings.tabDelay));
      // Remove highlight
      if (navLink) {
        navLink.style.outline = '';
        navLink.style.outlineOffset = '';
        navLink.style.backgroundColor = '';
      }
    } catch (e) {
      tabErrors.push(`tab "${tab}" (${group}): ${e.message}`);
    }
  }

  return tabErrors;
}

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
  console[consoleFn](`%cShadowrun 5%c %c${tagLabels[msgLevel]}%c [Test] ${msg}`, headerStyle, "", tagStyle, "");
}

async function testActorType(type, index) {
  await checkpoint();
  updateControlPanel(index, `Testing ${type}...`);

  const label = `Actor: ${type}`;
  let doc;
  try {
    const createData = getActorCreateData(type);
    doc = await Actor.create(createData);
    if (!doc) {
      results.failed.push(`${label}: creation returned null`);
      return;
    }
    log(`Created ${type} (${doc.id})`);

    if (doc.system === undefined) {
      results.failed.push(`${label}: system data is undefined`);
      await doc.delete();
      return;
    }

    const schemaKeys = Object.keys(doc.system.schema.fields);
    if (schemaKeys.length === 0) {
      results.warnings.push(`${label}: schema has no fields (empty schema is valid)`);
      log(`${label}: schema has no fields (empty schema is valid)`, 'warn');
      results.passed.push(label);
      await doc.delete();
      return;
    }

    let sheetError = null;
    let tabErrors = [];
    try {
      await doc.sheet.render(true);
      await new Promise(r => setTimeout(r, 500));
      tabErrors = await cycleSheetTabs(doc.sheet);
      await doc.sheet.close();
    } catch (e) {
      sheetError = e.message;
    }

    if (sheetError) {
      results.warnings.push(`${label}: sheet render issue - ${sheetError}`);
    }
    for (const te of tabErrors) {
      results.warnings.push(`${label}: ${te}`);
    }

    results.passed.push(label);
    log(`PASS: ${label} (${schemaKeys.length} schema fields, ${tabErrors.length ? tabErrors.length + ' tab warnings' : 'all tabs ok'})`);
  } catch (e) {
    if (e.message === '__CANCELLED__') throw e;
    results.failed.push(`${label}: ${e.message}`);
    log(`FAIL: ${label}: ${e.message}`, 'error');
    console.error(e);
  } finally {
    if (doc) {
      try { await doc.sheet?.close(); } catch (_) {}
      try { await doc.delete(); } catch (_) {}
    }
  }
}

async function testItemType(type, index) {
  await checkpoint();
  updateControlPanel(index, `Testing ${type}...`);

  const label = `Item: ${type}`;
  let doc;
  try {
    doc = await Item.create({ name: `__TEST_${type}`, type });

    if (!doc) {
      results.failed.push(`${label}: creation returned null`);
      return;
    }
    log(`Created ${type} (${doc.id})`);

    if (doc.system === undefined) {
      results.failed.push(`${label}: system data is undefined`);
      await doc.delete();
      return;
    }

    const schemaKeys = Object.keys(doc.system.schema.fields);
    if (schemaKeys.length === 0) {
      results.warnings.push(`${label}: schema has no fields (empty schema is valid)`);
      log(`${label}: schema has no fields (empty schema is valid)`, 'warn');
      results.passed.push(label);
      await doc.delete();
      return;
    }

    let sheetError = null;
    let tabErrors = [];
    try {
      await doc.sheet.render(true);
      await new Promise(r => setTimeout(r, 500));
      tabErrors = await cycleSheetTabs(doc.sheet);
      await doc.sheet.close();
    } catch (e) {
      sheetError = e.message;
    }

    if (sheetError) {
      results.warnings.push(`${label}: sheet render issue - ${sheetError}`);
    }
    for (const te of tabErrors) {
      results.warnings.push(`${label}: ${te}`);
    }

    results.passed.push(label);
    log(`PASS: ${label} (${schemaKeys.length} schema fields, ${tabErrors.length ? tabErrors.length + ' tab warnings' : 'all tabs ok'})`);
  } catch (e) {
    if (e.message === '__CANCELLED__') throw e;
    results.failed.push(`${label}: ${e.message}`);
    log(`FAIL: ${label}: ${e.message}`, 'error');
    console.error(e);
  } finally {
    if (doc) {
      try { await doc.sheet?.close(); } catch (_) {}
      try { await doc.delete(); } catch (_) {}
    }
  }
}

function showResults(wasCancelled = false) {
  const total = results.passed.length + results.failed.length;
  const passRate = total > 0 ? Math.round((results.passed.length / total) * 100) : 0;

  const S = {
    wrap: 'font-family:monospace;font-size:13px;color:#222;',
    h2: 'font-size:15px;margin:0 0 8px;color:#222;border:none;',
    hFail: 'font-size:13px;margin:12px 0 4px;padding:4px 8px;border-radius:3px;color:#fff;background:#b22;border:none;',
    hWarn: 'font-size:13px;margin:12px 0 4px;padding:4px 8px;border-radius:3px;color:#fff;background:#a67c00;border:none;',
    hPass: 'font-size:13px;margin:12px 0 4px;padding:4px 8px;border-radius:3px;color:#fff;background:#287828;border:none;',
    ul: 'margin:4px 0;padding-left:20px;',
    liFail: 'margin:2px 0;color:#900;font-weight:bold;',
    liWarn: 'margin:2px 0;color:#7a5500;',
    liPass: 'margin:2px 0;color:#1a5c1a;',
  };

  let html = `<div style="${S.wrap}">
      <h2 style="${S.h2}">SR5 DataModel Test Results${wasCancelled ? ' (Cancelled)' : ''}</h2>
      <p style="color:#222;"><strong>${results.passed.length}/${total} passed (${passRate}%)</strong></p>`;

  if (results.failed.length > 0) {
    html += `<h3 style="${S.hFail}">Failed (${results.failed.length})</h3><ul style="${S.ul}">`;
    for (const f of results.failed) html += `<li style="${S.liFail}">${f}</li>`;
    html += `</ul>`;
  }

  if (results.warnings.length > 0) {
    html += `<h3 style="${S.hWarn}">Warnings (${results.warnings.length})</h3><ul style="${S.ul}">`;
    for (const w of results.warnings) html += `<li style="${S.liWarn}">${w}</li>`;
    html += `</ul>`;
  }

  if (results.passed.length > 0) {
    html += `<h3 style="${S.hPass}">Passed (${results.passed.length})</h3><ul style="${S.ul}">`;
    for (const p of results.passed) html += `<li style="${S.liPass}">${p}</li>`;
    html += `</ul>`;
  }

  html += `</div>`;

  foundry.applications.api.DialogV2.prompt({
    window: { title: 'SR5 DataModel Test Results' },
    content: html,
    ok: { label: 'Close' },
  });
}

// ── Main execution ──
log('SR5 Test Runner ready. Waiting for Start...');
controlPanel = createControlPanel();
await waitForStart();

log('Starting DataModel migration tests...');
log(`Testing ${ACTOR_TYPES.length} actor types and ${ITEM_TYPES.length} item types`);
log(`Settings: tabs=${settings.navigateTabs}, tabDelay=${settings.tabDelay}ms, scrollStep=${settings.scrollStep}px, scrollInterval=${settings.scrollInterval}ms, scrollPause=${settings.scrollPause}ms`);

let wasCancelled = false;
try {
  let index = 0;

  for (const type of ACTOR_TYPES) {
    await testActorType(type, index++);
  }

  for (const type of ITEM_TYPES) {
    await testItemType(type, index++);
  }
} catch (e) {
  if (e.message === '__CANCELLED__') {
    wasCancelled = true;
    log('Test run cancelled by user.');
  } else {
    throw e;
  }
}

// Close control panel and show results
try { controlPanel?.remove(); } catch (_) {}
log(`Tests ${wasCancelled ? 'cancelled' : 'complete'}: ${results.passed.length} passed, ${results.failed.length} failed, ${results.warnings.length} warnings`);
showResults(wasCancelled);
