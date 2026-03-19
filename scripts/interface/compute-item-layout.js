/**
 * Item Layout Computation — merges default layout with the item block registry
 * to produce a fully resolved layout ready for template rendering.
 *
 * Mirrors compute-layout.js but uses ITEM_BLOCK_REGISTRY.
 */

import { ITEM_BLOCK_REGISTRY, ITEM_BLOCK_SIZE, ITEM_TAB_ICONS } from './item-block-registry.js'
import { getItemDefaultLayout } from './item-default-layout.js'

// ---------------------------------------------------------------------------
//  _buildSections — group blocks into rendering sections
// ---------------------------------------------------------------------------

function _buildSections(blocks, panelCols) {
  const sections = []
  let current = null

  for (const block of blocks) {
    const def = ITEM_BLOCK_REGISTRY[block.id]
    if (!def) continue
    if (block.hidden) continue

    const isColumnBlock = def.size === ITEM_BLOCK_SIZE.SINGLE && panelCols > 1 && block.column !== undefined
    const type = isColumnBlock ? 'columns' : 'full'

    if (!current || current.type !== type) {
      if (type === 'columns') {
        const cols = []
        for (let i = 0; i < panelCols; i++) cols.push([])
        current = { type: 'columns', columns: cols }
      } else {
        current = { type: 'full', blocks: [] }
      }
      sections.push(current)
    }

    const blockData = {
      id: block.id,
      uid: block.uid ?? block.id,
      partial: def.partial,
      label: def.label,
      size: def.size,
    }

    if (type === 'columns') {
      const colIdx = Math.min(block.column ?? 0, panelCols - 1)
      current.columns[colIdx].push(blockData)
    } else {
      current.blocks.push(blockData)
    }
  }

  return sections
}

// ---------------------------------------------------------------------------
//  computeItemLayout — public entry point
// ---------------------------------------------------------------------------

export function computeItemLayout(itemType) {
  const source = getItemDefaultLayout(itemType)

  const panels = []

  for (let i = 0; i < source.panels.length; i++) {
    const panelDef = source.panels[i]
    if (panelDef.hidden) continue
    const width = panelDef.width ?? 1
    const group = `panel-${i}`

    const tabs = []
    for (const tabDef of (panelDef.tabs ?? [])) {
      if (tabDef.hidden) continue
      const sections = _buildSections(tabDef.blocks ?? [], width)
      if (sections.length === 0) continue

      // Normalize legacy .svg.hbs paths to .svg
      const rawIcon = tabDef.icon?.replace(/\.svg\.hbs$/, '.svg')

      const iconKey = tabDef.iconKey ??
        Object.entries(ITEM_TAB_ICONS).find(([, v]) => v === rawIcon)?.[0] ??
        'info'

      tabs.push({
        id: tabDef.id,
        label: tabDef.label ?? '',
        icon: ITEM_TAB_ICONS[iconKey] ?? ITEM_TAB_ICONS.info,
        iconKey,
        group,
        sections,
      })
    }

    if (tabs.length === 0) continue

    panels.push({
      id: panelDef.id,
      width,
      group,
      tabs,
    })
  }

  return { panels }
}
