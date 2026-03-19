import {BLOCK_REGISTRY, BLOCK_SIZE, BLOCK_MIN_COLUMNS, TAB_ICONS} from './block-registry.js'
import { getDefaultLayout } from './default-layout.js'

/**
 * Sheet customization dialog — panel-first architecture.
 *
 * Panels define the fixed sheet structure (always visible, independent scrolling).
 * Tabs are assigned to panels and switch independently per panel.
 */
export class SR5SheetConfigDialog extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {

  constructor(actor, options = {}) {
    super(options)
    this.actor = actor
    this._draft = this._buildDraft()
  }

  get title() {
    return `${game.i18n.localize('SR5.CustomizeSheetDisplay')} — ${this.actor.name}`
  }

  static DEFAULT_OPTIONS = {
    id: 'sr5-sheet-config-{id}',
    tag: 'form',
    classes: ['sr5', 'sr-sheet-config'],
    position: { width: 750, height: 750 },
    window: { title: 'SR5.CustomizeSheetDisplay', resizable: true },
    actions: {
      addPanel: SR5SheetConfigDialog._onAddPanel,
      deletePanel: SR5SheetConfigDialog._onDeletePanel,
      setPanelWidth: SR5SheetConfigDialog._onSetPanelWidth,
      addTab: SR5SheetConfigDialog._onAddTab,
      deleteTab: SR5SheetConfigDialog._onDeleteTab,
      toggleColumn: SR5SheetConfigDialog._onToggleColumn,
      toggleCatalogGroup: SR5SheetConfigDialog._onToggleCatalogGroup,
      togglePanelFold: SR5SheetConfigDialog._onTogglePanelFold,
      toggleTabFold: SR5SheetConfigDialog._onToggleTabFold,
      togglePanelHidden: SR5SheetConfigDialog._onTogglePanelHidden,
      toggleTabHidden: SR5SheetConfigDialog._onToggleTabHidden,
      clearAll: SR5SheetConfigDialog._onClearAll,
      resetDefaults: SR5SheetConfigDialog._onResetDefaults,
      applyConfig: SR5SheetConfigDialog._onApply,
      saveConfig: SR5SheetConfigDialog._onSave,
      cancelConfig: SR5SheetConfigDialog._onCancel,
    },
  }

  static PARTS = {content: { template: 'systems/sr5/templates/interface/sheet-config.html' }}

  /* ---------------------------------------------------------------------- */
  /*  Singleton per actor                                                    */
  /* ---------------------------------------------------------------------- */

  static _instances = new Map()
  static _positions = new Map()

  static open(actor) {
    const key = actor.uuid
    let dialog = SR5SheetConfigDialog._instances.get(key)
    if (dialog?.rendered) {
      dialog.bringToFront()
      return dialog
    }
    const opts = {}
    const saved = SR5SheetConfigDialog._positions.get(key)
    if (saved) opts.position = saved
    dialog = new SR5SheetConfigDialog(actor, opts)
    SR5SheetConfigDialog._instances.set(key, dialog)
    dialog.render(true)
    return dialog
  }

  async close(options) {
    const key = this.actor.uuid
    const pos = this.position
    if (pos) {
      SR5SheetConfigDialog._positions.set(key, {
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
      })
    }
    SR5SheetConfigDialog._instances.delete(key)
    return super.close(options)
  }

  /* ---------------------------------------------------------------------- */
  /*  Draft state                                                            */
  /* ---------------------------------------------------------------------- */

  _buildDraft() {
    const prefs = this.actor.system.sheetPreferences ?? {}
    const draft = (prefs.customLayout?.panels?.length) ?
      foundry.utils.deepClone(prefs.customLayout) :
      getDefaultLayout(this.actor.sheet?.constructor?.name ?? 'SR5ActorSheet')
    for (const panel of (draft.panels ?? [])) {
      for (const tab of (panel.tabs ?? [])) {
        for (const block of (tab.blocks ?? [])) {
          if (!block.uid) block.uid = foundry.utils.randomID()
        }
      }
    }
    return draft
  }

  /* ---------------------------------------------------------------------- */
  /*  Context                                                                */
  /* ---------------------------------------------------------------------- */

  async _prepareContext(_options) {
    const draft = this._draft

    // Count how many times each block is placed
    const assignedCounts = {}
    for (const panel of (draft.panels ?? [])) {
      for (const tab of (panel.tabs ?? [])) {
        for (const block of (tab.blocks ?? [])) {
          assignedCounts[block.id] = (assignedCounts[block.id] ?? 0) + 1
        }
      }
    }

    // Build block catalog grouped by size
    const catalogBlocks = { single: [], double: [], triple: [] }
    for (const [blockId, def] of Object.entries(BLOCK_REGISTRY)) {
      catalogBlocks[def.size].push({
        id: blockId,
        label: game.i18n.localize(def.label),
        size: def.size,
        count: assignedCounts[blockId] ?? 0,
      })
    }
    for (const size of Object.keys(catalogBlocks)) {
      catalogBlocks[size].sort((a, b) => a.label.localeCompare(b.label))
    }

    // Build panel data
    const totalWidth = draft.panels?.reduce((s, p) => s + (p.width ?? 1), 0) ?? 0
    const canAddPanel = totalWidth < 3

    const panels = (draft.panels ?? []).map(panel => {
      const panelWidth = panel.width ?? 1
      const tabs = (panel.tabs ?? []).map(tab => {
        const blocks = (tab.blocks ?? []).map(block => {
          const def = BLOCK_REGISTRY[block.id]
          if (!def) return null
          const result = {
            id: block.id,
            uid: block.uid,
            label: game.i18n.localize(def.label),
            size: def.size,
            column: block.column,
          }
          const showPosition = (def.size === BLOCK_SIZE.SINGLE && panelWidth > 1) ||
            (def.size === BLOCK_SIZE.DOUBLE && panelWidth === 3)
          if (showPosition) {
            result.showPosition = true
            const col = block.column ?? 0
            if (def.size === BLOCK_SIZE.DOUBLE) {
              result.positionIcon = col === 0 ? 'fa-align-left' : 'fa-align-right'
            } else if (panelWidth === 2) {
              result.positionIcon = col === 0 ? 'fa-align-left' : 'fa-align-right'
            } else {
              result.positionIcon = col === 0 ? 'fa-align-left' : col === 1 ? 'fa-align-center' : 'fa-align-right'
            }
          }
          return result
        }).filter(Boolean)
        return {
          id: tab.id,
          label: tab.label ?? '',
          icon: tab.icon ?? TAB_ICONS.core,
          hidden: !!tab.hidden,
          blocks,
        }
      })
      return {
        id: panel.id,
        label: panel.label ?? '',
        width: panel.width ?? 1,
        hidden: !!panel.hidden,
        tabs,
      }
    })

    // Available icons for icon picker
    const icons = Object.entries(TAB_ICONS).map(([key, path]) => ({
      key,
      path,
      label: game.i18n.localize(`SR5.SheetConfig.Icon.${key}`),
    }))

    return { catalogBlocks, panels, icons, canAddPanel }
  }

  /* ---------------------------------------------------------------------- */
  /*  Listeners                                                              */
  /* ---------------------------------------------------------------------- */

  render(options) {
    if (this.element) {
      const pool = this.element.querySelector('.sr-config-unused-pool')
      const list = this.element.querySelector('.sr-config-panels-list')
      this._savedScroll = {
        pool: pool?.scrollTop ?? 0,
        list: list?.scrollTop ?? 0,
      }
    }
    return super.render(options)
  }

  _onRender(context, options) {
    super._onRender(context, options)
    if (this._savedScroll) {
      const pool = this.element.querySelector('.sr-config-unused-pool')
      const list = this.element.querySelector('.sr-config-panels-list')
      if (pool) pool.scrollTop = this._savedScroll.pool ?? 0
      if (list) list.scrollTop = this._savedScroll.list ?? 0
      this._savedScroll = null
    }
    for (const group of (this._foldedGroups ?? [])) {
      const el = this.element.querySelector(`.sr-config-unused-group[data-size-group="${group}"]`)
      if (el) el.classList.add('sr-config-folded')
    }
    for (const panelId of (this._foldedPanels ?? [])) {
      const el = this.element.querySelector(`.sr-config-panel-section[data-panel-id="${panelId}"]`)
      if (el) el.classList.add('sr-config-panel-folded')
    }
    for (const key of (this._foldedTabs ?? [])) {
      const [panelId, tabId] = key.split(':')
      const el = this.element.querySelector(`.sr-config-tab-section[data-tab-id="${tabId}"][data-panel-id="${panelId}"]`)
      if (el) el.classList.add('sr-config-tab-folded')
    }
  }

  _attachPartListeners(partId, htmlElement, options) {
    super._attachPartListeners(partId, htmlElement, options)

    htmlElement.querySelectorAll('.sr-config-panel-name').forEach(input => {
      input.addEventListener('change', this._onPanelNameChange.bind(this))
    })
    htmlElement.querySelectorAll('.sr-config-tab-name').forEach(input => {
      input.addEventListener('change', this._onTabNameChange.bind(this))
    })
    htmlElement.querySelectorAll('.sr-config-icon-select').forEach(select => {
      select.addEventListener('change', this._onIconChange.bind(this))
    })

    // Block drag and drop
    htmlElement.querySelectorAll('.sr-config-block').forEach(el => {
      el.setAttribute('draggable', 'true')
      el.addEventListener('dragstart', this._onBlockDragStart.bind(this))
      el.addEventListener('dragend', this._onBlockDragEnd.bind(this))
    })
    htmlElement.querySelectorAll('.sr-config-tab-blocks, .sr-config-unused-pool').forEach(el => {
      el.addEventListener('dragover', this._onBlockDragOver.bind(this))
      el.addEventListener('dragleave', this._onBlockDragLeave.bind(this))
      el.addEventListener('drop', this._onBlockDrop.bind(this))
    })

    // Tab drag reordering
    htmlElement.querySelectorAll('.sr-config-tab-section').forEach(el => {
      el.setAttribute('draggable', 'true')
      el.addEventListener('dragstart', this._onTabDragStart.bind(this))
      el.addEventListener('dragend', this._onTabDragEnd.bind(this))
      el.addEventListener('dragover', this._onTabDragOver.bind(this))
      el.addEventListener('drop', this._onTabDrop.bind(this))
    })

    // Panel drag reordering
    htmlElement.querySelectorAll('.sr-config-panel-section').forEach(el => {
      el.setAttribute('draggable', 'true')
      el.addEventListener('dragstart', this._onPanelDragStart.bind(this))
      el.addEventListener('dragend', this._onPanelDragEnd.bind(this))
      el.addEventListener('dragover', this._onPanelDragOver.bind(this))
      el.addEventListener('drop', this._onPanelDrop.bind(this))
    })
  }

  /* ---------------------------------------------------------------------- */
  /*  Name & icon editing                                                    */
  /* ---------------------------------------------------------------------- */

  _onPanelNameChange(event) {
    const input = event.currentTarget
    const panelId = input.dataset.panelId
    const panel = this._draft.panels?.find(p => p.id === panelId)
    if (panel) panel.label = input.value.trim() || ''
  }

  _onTabNameChange(event) {
    const input = event.currentTarget
    const panelId = input.dataset.panelId
    const tabId = input.dataset.tabId
    const panel = this._draft.panels?.find(p => p.id === panelId)
    const tab = panel?.tabs?.find(t => t.id === tabId)
    if (tab) tab.label = input.value.trim() || ''
  }

  _onIconChange(event) {
    const select = event.currentTarget
    const panelId = select.dataset.panelId
    const tabId = select.dataset.tabId
    const panel = this._draft.panels?.find(p => p.id === panelId)
    const tab = panel?.tabs?.find(t => t.id === tabId)
    if (tab) {
      tab.icon = TAB_ICONS[select.value] ?? TAB_ICONS.core
      this.render()
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  Drag insert indicators                                                 */
  /* ---------------------------------------------------------------------- */

  _clearInsertIndicators() {
    this.element.querySelectorAll('.sr-config-insert-before, .sr-config-insert-after').forEach(el => {
      el.classList.remove('sr-config-insert-before', 'sr-config-insert-after')
    })
  }

  _showInsertIndicator(container, event, selector) {
    this._clearInsertIndicators()
    const target = event.target.closest(selector)
    if (!target || !container.contains(target)) return
    const rect = target.getBoundingClientRect()
    const cls = event.clientY < rect.top + rect.height / 2 ?
      'sr-config-insert-before' : 'sr-config-insert-after'
    target.classList.add(cls)
  }

  /* ---------------------------------------------------------------------- */
  /*  Block drag and drop                                                    */
  /* ---------------------------------------------------------------------- */

  _onBlockDragStart(event) {
    const el = event.currentTarget
    const blockId = el.dataset.blockId
    const blockUid = el.dataset.blockUid ?? null
    const tabId = el.closest('[data-tab-id]')?.dataset.tabId ?? null
    const panelId = el.closest('[data-panel-id]')?.dataset.panelId ?? null
    event.dataTransfer.setData('application/sr5-block', JSON.stringify({blockId, blockUid, panelId, tabId}))
    event.dataTransfer.effectAllowed = 'move'
    el.classList.add('sr-config-dragging')
    event.stopPropagation()
  }

  _onBlockDragEnd(event) {
    event.currentTarget.classList.remove('sr-config-dragging')
    this._clearInsertIndicators()
    this.element.querySelectorAll('.sr-config-drag-over').forEach(el =>
      el.classList.remove('sr-config-drag-over')
    )
  }

  _onBlockDragOver(event) {
    if (!event.dataTransfer.types.includes('application/sr5-block')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    event.currentTarget.classList.add('sr-config-drag-over')
    this._showInsertIndicator(event.currentTarget, event, '.sr-config-block')
  }

  _onBlockDragLeave(event) {
    const container = event.currentTarget
    if (!container.contains(event.relatedTarget)) {
      container.classList.remove('sr-config-drag-over')
      this._clearInsertIndicators()
    }
  }

  _onBlockDrop(event) {
    event.preventDefault()
    event.currentTarget.classList.remove('sr-config-drag-over')
    this._clearInsertIndicators()

    let data
    try { data = JSON.parse(event.dataTransfer.getData('application/sr5-block')) } catch { return }
    if (!data?.blockId) return

    const { blockId, blockUid, panelId: sourcePanelId, tabId: sourceTabId } = data
    const def = BLOCK_REGISTRY[blockId]
    if (!def) return

    const targetTabEl = event.currentTarget.closest('[data-tab-id]')
    const targetPanelEl = event.currentTarget.closest('[data-panel-id]')
    const targetTabId = targetTabEl?.dataset.tabId ?? null
    const targetPanelId = targetPanelEl?.dataset.panelId ?? null
    const isPool = event.currentTarget.classList.contains('sr-config-unused-pool')
    const isPlaced = !!(blockUid && sourcePanelId && sourceTabId)

    // Remove from source (or from wherever the block already exists)
    let removedBlock = null
    if (isPlaced) {
      const sourcePanel = this._draft.panels.find(p => p.id === sourcePanelId)
      const sourceTab = sourcePanel?.tabs?.find(t => t.id === sourceTabId)
      if (sourceTab) {
        const idx = sourceTab.blocks.findIndex(b => b.uid === blockUid)
        if (idx !== -1) removedBlock = sourceTab.blocks.splice(idx, 1)[0]
      }
    }

    if (isPool) {
      if (isPlaced) this.render()
      return
    }

    if (targetPanelId && targetTabId) {
      const targetPanel = this._draft.panels.find(p => p.id === targetPanelId)
      const targetTab = targetPanel?.tabs?.find(t => t.id === targetTabId)
      if (!targetTab || !targetPanel) return

      const minCols = BLOCK_MIN_COLUMNS[def.size] ?? 1
      if (targetPanel.width < minCols) {
        ui.notifications.warn('Block is too large for this panel width.')
        if (removedBlock) {
          const sourcePanel = this._draft.panels.find(p => p.id === sourcePanelId)
          const sourceTab = sourcePanel?.tabs?.find(t => t.id === sourceTabId)
          if (sourceTab) sourceTab.blocks.push(removedBlock)
        }
        this.render()
        return
      }

      const targetBlock = event.target.closest('.sr-config-block')
      let insertIdx = targetTab.blocks.length
      if (targetBlock) {
        const hoveredUid = targetBlock.dataset.blockUid
        if (hoveredUid) {
          const idx = targetTab.blocks.findIndex(b => b.uid === hoveredUid)
          if (idx !== -1) {
            const rect = targetBlock.getBoundingClientRect()
            insertIdx = event.clientY < rect.top + rect.height / 2 ? idx : idx + 1
          }
        }
      }

      const blockEntry = { id: blockId, uid: blockUid ?? foundry.utils.randomID() }
      if (def.size === BLOCK_SIZE.SINGLE && targetPanel.width > 1) {
        blockEntry.column = 0
      } else if (def.size === BLOCK_SIZE.DOUBLE && targetPanel.width === 3) {
        blockEntry.column = 0
      }

      targetTab.blocks.splice(insertIdx, 0, blockEntry)
    }

    this.render()
  }

  /* ---------------------------------------------------------------------- */
  /*  Tab drag reordering (within same panel)                                */
  /* ---------------------------------------------------------------------- */

  _onTabDragStart(event) {
    if (event.target.closest('.sr-config-block')) return
    const el = event.currentTarget
    const tabId = el.dataset.tabId
    const panelId = el.closest('[data-panel-id]')?.dataset.panelId
    event.dataTransfer.setData('application/sr5-tab', JSON.stringify({ tabId, panelId }))
    event.dataTransfer.effectAllowed = 'move'
    el.classList.add('sr-config-dragging')
    event.stopPropagation()
  }

  _onTabDragEnd(event) {
    event.currentTarget.classList.remove('sr-config-dragging')
    this._clearInsertIndicators()
  }

  _onTabDragOver(event) {
    if (!event.dataTransfer.types.includes('application/sr5-tab')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    this._clearInsertIndicators()
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const cls = event.clientY < rect.top + rect.height / 2 ?
      'sr-config-insert-before' : 'sr-config-insert-after'
    target.classList.add(cls)
  }

  _onTabDrop(event) {
    this._clearInsertIndicators()
    let data
    try { data = JSON.parse(event.dataTransfer.getData('application/sr5-tab')) } catch { return }
    if (!data?.tabId) return
    event.preventDefault()

    const { tabId: draggedTabId, panelId: sourcePanelId } = data
    const targetTabId = event.currentTarget.dataset.tabId
    const targetPanelId = event.currentTarget.closest('[data-panel-id]')?.dataset.panelId
    if (!targetTabId || draggedTabId === targetTabId) return
    if (sourcePanelId !== targetPanelId) return

    const panel = this._draft.panels.find(p => p.id === sourcePanelId)
    if (!panel) return

    const tabs = panel.tabs
    const fromIdx = tabs.findIndex(t => t.id === draggedTabId)
    let toIdx = tabs.findIndex(t => t.id === targetTabId)
    if (fromIdx === -1 || toIdx === -1) return

    const rect = event.currentTarget.getBoundingClientRect()
    const insertAfter = event.clientY >= rect.top + rect.height / 2

    const [moved] = tabs.splice(fromIdx, 1)
    if (fromIdx < toIdx) toIdx--
    tabs.splice(insertAfter ? toIdx + 1 : toIdx, 0, moved)

    this.render()
  }

  /* ---------------------------------------------------------------------- */
  /*  Panel drag reordering                                                  */
  /* ---------------------------------------------------------------------- */

  _onPanelDragStart(event) {
    if (event.target.closest('.sr-config-tab-section') || event.target.closest('.sr-config-block')) return
    const el = event.currentTarget
    const panelId = el.dataset.panelId
    event.dataTransfer.setData('application/sr5-panel', JSON.stringify({ panelId }))
    event.dataTransfer.effectAllowed = 'move'
    el.classList.add('sr-config-dragging')
  }

  _onPanelDragEnd(event) {
    event.currentTarget.classList.remove('sr-config-dragging')
    this._clearInsertIndicators()
  }

  _onPanelDragOver(event) {
    if (!event.dataTransfer.types.includes('application/sr5-panel')) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    this._clearInsertIndicators()
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const cls = event.clientY < rect.top + rect.height / 2 ?
      'sr-config-insert-before' : 'sr-config-insert-after'
    target.classList.add(cls)
  }

  _onPanelDrop(event) {
    this._clearInsertIndicators()
    let data
    try { data = JSON.parse(event.dataTransfer.getData('application/sr5-panel')) } catch { return }
    if (!data?.panelId) return
    event.preventDefault()

    const { panelId: draggedPanelId } = data
    const targetPanelId = event.currentTarget.dataset.panelId
    if (!targetPanelId || draggedPanelId === targetPanelId) return

    const panels = this._draft.panels
    const fromIdx = panels.findIndex(p => p.id === draggedPanelId)
    let toIdx = panels.findIndex(p => p.id === targetPanelId)
    if (fromIdx === -1 || toIdx === -1) return

    const rect = event.currentTarget.getBoundingClientRect()
    const insertAfter = event.clientY >= rect.top + rect.height / 2

    const [moved] = panels.splice(fromIdx, 1)
    if (fromIdx < toIdx) toIdx--
    panels.splice(insertAfter ? toIdx + 1 : toIdx, 0, moved)

    this.render()
  }

  /* ---------------------------------------------------------------------- */
  /*  Actions                                                                */
  /* ---------------------------------------------------------------------- */

  static _onAddPanel(_event) {
    const currentTotal = this._draft.panels.reduce((s, p) => s + (p.width ?? 1), 0)
    if (currentTotal >= 3) {
      ui.notifications.warn('Maximum total panel width (3) reached.')
      return
    }
    this._draft.panels.push({
      id: foundry.utils.randomID(),
      label: 'New Panel',
      width: 1,
      tabs: [],
    })
    this.render()
  }

  static async _onDeletePanel(event, target) {
    const panelId = target.dataset.panelId
    const panel = this._draft.panels.find(p => p.id === panelId)
    if (!panel) return
    const blockCount = panel.tabs?.reduce((s, t) => s + (t.blocks?.length ?? 0), 0) ?? 0
    if (blockCount > 0) {
      const yes = await foundry.applications.api.DialogV2.confirm({
        window: { title: 'Delete Panel' },
        content: '<p>This panel contains blocks. Delete anyway?</p>',
      })
      if (!yes) return
    }
    this._draft.panels = this._draft.panels.filter(p => p.id !== panelId)
    this.render()
  }

  static async _onSetPanelWidth(event, target) {
    const panelId = target.closest('[data-panel-id]')?.dataset.panelId
    const newWidth = parseInt(target.dataset.width, 10)
    const panel = this._draft.panels.find(p => p.id === panelId)
    if (!panel || !newWidth) return

    const otherWidth = this._draft.panels
      .filter(p => p.id !== panelId)
      .reduce((s, p) => s + (p.width ?? 1), 0)

    if (otherWidth + newWidth > 3) {
      ui.notifications.warn('Maximum total panel width (3) reached.')
      return
    }

    if (newWidth < (panel.width ?? 1)) {
      let removeCount = 0
      for (const tab of (panel.tabs ?? [])) {
        for (const b of (tab.blocks ?? [])) {
          const def = BLOCK_REGISTRY[b.id]
          if (def && newWidth < (BLOCK_MIN_COLUMNS[def.size] ?? 1)) removeCount++
        }
      }
      if (removeCount > 0) {
        const yes = await foundry.applications.api.DialogV2.confirm({
          window: { title: 'Reduce Panel Width' },
          content: `<p>${removeCount} block(s) will be removed because they no longer fit. Continue?</p>`,
        })
        if (!yes) return
      }
    }

    panel.width = newWidth

    for (const tab of (panel.tabs ?? [])) {
      tab.blocks = tab.blocks.filter(b => {
        const def = BLOCK_REGISTRY[b.id]
        if (!def) return false
        return newWidth >= (BLOCK_MIN_COLUMNS[def.size] ?? 1)
      })
      for (const block of tab.blocks) {
        const def = BLOCK_REGISTRY[block.id]
        if (def?.size === BLOCK_SIZE.SINGLE && newWidth > 1) {
          if (block.column === undefined || block.column >= newWidth) block.column = 0
        } else if (def?.size === BLOCK_SIZE.DOUBLE && newWidth === 3) {
          if (block.column === undefined || block.column >= 2) block.column = 0
        } else {
          delete block.column
        }
      }
    }

    this.render()
  }

  static _onAddTab(event, target) {
    const panelId = target.dataset.panelId
    const panel = this._draft.panels.find(p => p.id === panelId)
    if (!panel) return
    panel.tabs.push({
      id: foundry.utils.randomID(),
      label: 'New Tab',
      icon: TAB_ICONS.core,
      blocks: [],
    })
    this.render()
  }

  static async _onDeleteTab(event, target) {
    const panelId = target.closest('[data-panel-id]')?.dataset.panelId
    const tabId = target.dataset.tabId
    const panel = this._draft.panels.find(p => p.id === panelId)
    if (!panel) return
    const tab = panel.tabs.find(t => t.id === tabId)
    if (tab?.blocks?.length) {
      const yes = await foundry.applications.api.DialogV2.confirm({
        window: { title: 'Delete Tab' },
        content: '<p>This tab contains blocks. Delete anyway?</p>',
      })
      if (!yes) return
    }
    panel.tabs = panel.tabs.filter(t => t.id !== tabId)
    this.render()
  }

  static _onToggleCatalogGroup(event, target) {
    const group = target.dataset.sizeGroup
    if (!group) return
    if (!this._foldedGroups) this._foldedGroups = new Set()
    const groupEl = target.closest('.sr-config-unused-group')
    if (groupEl?.classList.toggle('sr-config-folded')) {
      this._foldedGroups.add(group)
    } else {
      this._foldedGroups.delete(group)
    }
  }

  static _onTogglePanelFold(event, target) {
    const panelEl = target.closest('.sr-config-panel-section')
    const panelId = panelEl?.dataset.panelId
    if (!panelId) return
    if (!this._foldedPanels) this._foldedPanels = new Set()
    if (panelEl.classList.toggle('sr-config-panel-folded')) {
      this._foldedPanels.add(panelId)
    } else {
      this._foldedPanels.delete(panelId)
    }
  }

  static _onToggleTabFold(event, target) {
    const tabEl = target.closest('.sr-config-tab-section')
    const tabId = tabEl?.dataset.tabId
    const panelId = tabEl?.closest('[data-panel-id]')?.dataset.panelId
    if (!tabId || !panelId) return
    if (!this._foldedTabs) this._foldedTabs = new Set()
    const key = `${panelId}:${tabId}`
    if (tabEl.classList.toggle('sr-config-tab-folded')) {
      this._foldedTabs.add(key)
    } else {
      this._foldedTabs.delete(key)
    }
  }

  static _onToggleColumn(event, target) {
    const blockUid = target.dataset.blockUid
    const panelId = target.closest('[data-panel-id]')?.dataset.panelId
    const tabId = target.closest('[data-tab-id]')?.dataset.tabId
    const panel = this._draft.panels.find(p => p.id === panelId)
    const tab = panel?.tabs?.find(t => t.id === tabId)
    if (!tab || !panel) return

    const block = tab.blocks.find(b => b.uid === blockUid)
    if (!block) return
    const def = BLOCK_REGISTRY[block.id]
    if (!def) return

    let maxPositions
    if (def.size === BLOCK_SIZE.SINGLE) {
      maxPositions = panel.width
    } else if (def.size === BLOCK_SIZE.DOUBLE && panel.width === 3) {
      maxPositions = 2
    } else {
      return
    }

    block.column = ((block.column ?? 0) + 1) % maxPositions
    this.render()
  }

  static _onTogglePanelHidden(event, target) {
    const panelId = target.closest('[data-panel-id]')?.dataset.panelId
    const panel = this._draft.panels.find(p => p.id === panelId)
    if (panel) panel.hidden = !panel.hidden
    this.render()
  }

  static _onToggleTabHidden(event, target) {
    const panelId = target.closest('[data-panel-id]')?.dataset.panelId
    const tabId = target.closest('[data-tab-id]')?.dataset.tabId
    const panel = this._draft.panels.find(p => p.id === panelId)
    const tab = panel?.tabs?.find(t => t.id === tabId)
    if (tab) tab.hidden = !tab.hidden
    this.render()
  }

  static async _onClearAll(_event) {
    const yes = await foundry.applications.api.DialogV2.confirm({
      window: { title: 'Clear All' },
      content: '<p>Remove all panels and blocks? This cannot be undone.</p>',
    })
    if (!yes) return
    this._draft = { panels: [] }
    this.render()
  }

  static async _onResetDefaults(_event) {
    const yes = await foundry.applications.api.DialogV2.confirm({
      window: { title: 'Reset to Defaults' },
      content: '<p>Reset the layout to defaults? Any custom changes will be lost.</p>',
    })
    if (!yes) return
    this._draft = getDefaultLayout(this.actor.sheet?.constructor?.name ?? 'SR5ActorSheet')
    this.render()
  }

  /* ---------------------------------------------------------------------- */
  /*  Save / Apply / Cancel                                                  */
  /* ---------------------------------------------------------------------- */

  async _persistDraft() {
    await this.actor.update({'system.sheetPreferences.customLayout': foundry.utils.deepClone(this._draft)})
  }

  static async _onApply(_event) {
    await this._persistDraft()
  }

  static async _onSave(_event) {
    await this._persistDraft()
    this.close()
  }

  static _onCancel(_event) {
    this.close()
  }
}
