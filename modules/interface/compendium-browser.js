import {
  SR5 
} from '../config.js'
import {
  SR5_EntityHelpers 
} from '../entities/helpers.js'
import {
  BROWSER_FILTERS, ACTOR_BROWSER_FILTERS, OTHER_BROWSER_FILTERS, ITEM_INDEX_FIELDS, ACTOR_INDEX_FIELDS, getEntryInfo 
} from './compendium-browser-filters.js'
import {
  enhanceSelects 
} from '../helpers/enhance-selects.js'

const ALL_FILTERS = {
  ...BROWSER_FILTERS, ...ACTOR_BROWSER_FILTERS, ...OTHER_BROWSER_FILTERS 
}

export class SR5CompendiumBrowser extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  // Singleton
  static _instance = null

  static open(initialType = null) {
    if (SR5CompendiumBrowser._instance?.rendered) {
      SR5CompendiumBrowser._instance.bringToFront()
      if (initialType) {
        SR5CompendiumBrowser._instance._selectedTypes = new Set([initialType])
        SR5CompendiumBrowser._instance.render()
      }
      return SR5CompendiumBrowser._instance
    }
    const browser = new SR5CompendiumBrowser()
    SR5CompendiumBrowser._instance = browser
    if (initialType) browser._selectedTypes = new Set([initialType])
    browser.render(true)
    return browser
  }

  static DEFAULT_OPTIONS = {
    id: 'sr5-compendium-browser',
    classes: ['sr5', 'sr-application', 'sr-compendium-browser'],
    position: {
      width: 900, height: 700 
    },
    window: {
      title: 'SR5.CompendiumBrowser',
      icon: 'fas fa-search',
      resizable: true,
    },
    actions: {
      viewItem: SR5CompendiumBrowser.#onViewItem,
      clearFilters: SR5CompendiumBrowser.#onClearFilters,
      refreshIndex: SR5CompendiumBrowser.#onRefreshIndex,
    },
  }

  static PARTS = {
    browser: {
      template: 'systems/sr5/templates/interface/compendium-browser.hbs' 
    } 
  }

  constructor(options = {
  }) {
    super(options)
    this._selectedTypes = new Set()
    this._searchText = ''
    this._activeFilters = {
    }
    this._sortKey = 'name'
    this._sortDirection = 'asc'
    this._indexCache = null
    this._page = 0
    this._pageSize = 100
  }

  /* -------------------------------------------- */
  /*  Data Loading                                */
  /* -------------------------------------------- */

  async _loadAllIndices() {
    const allEntries = []

    const indexPack = async (pack, docName, fields, useDocNameAsType) => {
      try {
        const index = await pack.getIndex({
          fields 
        })
        for (const entry of index) {
          allEntries.push({
            ...entry,
            type: useDocNameAsType ? docName : entry.type,
            docName,
            uuid: `Compendium.${pack.collection}.${docName}.${entry._id}`,
            packId: pack.collection,
            packLabel: pack.metadata.label,
          })
        }
      } catch (err) {
        console.warn(`SR5 Compendium Browser: Failed to index pack ${pack.collection}`, err)
      }
    }

    const otherDocTypes = Object.keys(OTHER_BROWSER_FILTERS)
    const promises = [
      ...game.packs.filter(p => p.documentName === 'Item').map(p => indexPack(p, 'Item', ITEM_INDEX_FIELDS)),
      ...game.packs.filter(p => p.documentName === 'Actor').map(p => indexPack(p, 'Actor', ACTOR_INDEX_FIELDS)),
      ...game.packs.filter(p => otherDocTypes.includes(p.documentName)).map(p => indexPack(p, p.documentName, [], true)),
    ]

    await Promise.all(promises)
    this._indexCache = allEntries
    return allEntries
  }

  /* -------------------------------------------- */
  /*  Filtering                                   */
  /* -------------------------------------------- */

  _pruneFilters() {
    const validKeys = new Set()
    for (const sel of this._selectedTypes) {
      const baseType = sel.includes(':') ? sel.split(':')[0] : sel
      const typeDef = ALL_FILTERS[baseType]
      if (typeDef) for (const f of typeDef.filters) validKeys.add(f.key)
    }
    for (const key of Object.keys(this._activeFilters)) {
      if (!validKeys.has(key)) delete this._activeFilters[key]
    }
  }

  _filterEntries(entries) {
    let results = entries

    // Filter by item type(s) — supports compound keys like "itemWeapon:meleeWeapon"
    if (this._selectedTypes.size) {
      results = results.filter(e => {
        for (const sel of this._selectedTypes) {
          if (!sel.includes(':')) {
            // Simple type match
            if (e.type === sel) return true
          } else {
            // Compound key: "itemType:subtypeValue"
            const [itemType, subVal] = sel.split(':')
            if (e.type !== itemType) continue
            const def = ALL_FILTERS[itemType]
            if (!def?.subtypes) continue
            const entrySubVal = foundry.utils.getProperty(e, def.subtypes.field) || '_none'
            if (entrySubVal === subVal) return true
          }
        }
        return false
      })
    }

    // Filter by search text
    if (this._searchText) {
      const search = this._searchText.toLowerCase()
      results = results.filter(e => e.name.toLowerCase().includes(search))
    }

    // Filter by active type-specific filters
    for (const [key, value] of Object.entries(this._activeFilters)) {
      if (value === '' || value === undefined) continue
      results = results.filter(e => {
        const entryValue = foundry.utils.getProperty(e, key)
        if (typeof value === 'boolean') return !!entryValue === value
        return String(entryValue) === String(value)
      })
    }

    // Sort
    results.sort((a, b) => {
      let aVal = foundry.utils.getProperty(a, this._sortKey) ?? ''
      let bVal = foundry.utils.getProperty(b, this._sortKey) ?? ''
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return this._sortDirection === 'asc' ? cmp : -cmp
    })

    return results
  }

  /* -------------------------------------------- */
  /*  Context Preparation                         */
  /* -------------------------------------------- */

  async _prepareContext(options) {
    const context = await super._prepareContext(options)

    // Load indices if not cached
    if (!this._indexCache) await this._loadAllIndices()
    const allEntries = this._indexCache

    // Build type/subtype counts
    const typeCounts = {
    }
    const subtypeCounts = {
    }
    for (const e of allEntries) {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1
      const def = ALL_FILTERS[e.type]
      if (def?.subtypes) {
        const subVal = foundry.utils.getProperty(e, def.subtypes.field) || '_none'
        const compoundKey = `${e.type}:${subVal}`
        subtypeCounts[compoundKey] = (subtypeCounts[compoundKey] || 0) + 1
      }
    }

    // Build type list — expand subtypes where defined
    const itemTypes = []
    for (const [key, def] of Object.entries(ALL_FILTERS)) {
      if (!typeCounts[key]) continue
      if (def.subtypes) {
        const optionsMap = SR5[def.subtypes.options] || {
        }
        for (const [subVal, i18nKey] of Object.entries(optionsMap)) {
          const compoundKey = `${key}:${subVal}`
          const count = subtypeCounts[compoundKey] || 0
          if (!count) continue
          itemTypes.push({
            key: compoundKey,
            label: game.i18n.localize(i18nKey),
            icon: def.icon,
            count,
            selected: this._selectedTypes.has(compoundKey),
          })
        }
      } else {
        itemTypes.push({
          key,
          label: game.i18n.localize(def.label),
          icon: def.icon,
          count: typeCounts[key] || 0,
          selected: this._selectedTypes.has(key),
        })
      }
    }
    itemTypes.sort((a, b) => a.label.localeCompare(b.label))

    // Build filter definitions from the union of all selected types
    let filterDefs = []
    const seenFilterKeys = new Set()
    for (const sel of this._selectedTypes) {
      const type = sel.includes(':') ? sel.split(':')[0] : sel
      const typeDef = ALL_FILTERS[type]
      if (!typeDef) continue
      for (const f of typeDef.filters) {
        if (seenFilterKeys.has(f.key)) continue
        seenFilterKeys.add(f.key)
        const def = {
          ...f, label: game.i18n.localize(f.label) 
        }
        if (f.type === 'select' && f.options) {
          const configOptions = SR5[f.options] || {
          }
          def.choices = Object.entries(configOptions).map(([k, v]) => ({
            key: k,
            label: game.i18n.localize(v),
            selected: this._activeFilters[f.key] === k,
          })).sort((a, b) => a.label.localeCompare(b.label))
        }
        if (f.type === 'boolean') {
          def.checked = !!this._activeFilters[f.key]
        }
        filterDefs.push(def)
      }
    }

    // Filter entries
    const filtered = this._filterEntries(allEntries)
    const totalCount = filtered.length

    // Paginate
    const lists = SR5_EntityHelpers.sortTranslations(SR5)
    const maxItems = (this._page + 1) * this._pageSize
    const results = filtered.slice(0, maxItems).map(e => {
      const def = ALL_FILTERS[e.type]
      let typeLabel = game.i18n.localize(def?.label || e.type)
      if (def?.subtypes) {
        const subVal = foundry.utils.getProperty(e, def.subtypes.field)
        const optionsMap = SR5[def.subtypes.options] || {
        }
        if (subVal && optionsMap[subVal]) typeLabel = game.i18n.localize(optionsMap[subVal])
      }
      return {
        ...e,
        typeLabel,
        typeIcon: def?.icon || 'fa-cube',
        info: getEntryInfo(e, lists),
      }
    })

    context.itemTypes = itemTypes
    context.filterDefs = filterDefs
    context.results = results
    context.totalCount = totalCount
    context.shownCount = results.length
    context.hasMore = maxItems < totalCount
    context.searchText = this._searchText
    context.hasTypeFilter = this._selectedTypes.size > 0
    context.sortKey = this._sortKey
    context.sortDirection = this._sortDirection

    return context
  }

  /* -------------------------------------------- */
  /*  Render Lifecycle                             */
  /* -------------------------------------------- */

  _onRender(context, options) {
    super._onRender(context, options)
    const el = this.element

    // Custom dropdown enhancement
    enhanceSelects(el)

    // Search input
    const searchInput = el.querySelector('.sr-browser-search input')
    if (searchInput) {
      searchInput.focus()
      const len = searchInput.value.length
      searchInput.setSelectionRange(len, len)
      let debounce = null
      searchInput.addEventListener('input', (event) => {
        clearTimeout(debounce)
        debounce = setTimeout(() => {
          this._searchText = event.target.value
          this._page = 0
          this.render()
        }, 300)
      })
    }

    // Type checkboxes
    el.querySelectorAll('.sr-browser-type-cb').forEach(cb => {
      cb.addEventListener('change', (event) => {
        const type = event.target.dataset.type
        if (event.target.checked) {
          this._selectedTypes.add(type)
        } else {
          this._selectedTypes.delete(type)
        }
        this._pruneFilters()
        this._page = 0
        this.render()
      })
    })

    // Filter selects
    el.querySelectorAll('[data-filter-key]').forEach(select => {
      select.addEventListener('change', (event) => {
        const key = event.target.dataset.filterKey
        this._activeFilters[key] = event.target.value || undefined
        this._page = 0
        this.render()
      })
    })

    // Boolean filter checkboxes
    el.querySelectorAll('[data-filter-boolean]').forEach(cb => {
      cb.addEventListener('change', (event) => {
        const key = event.target.dataset.filterBoolean
        this._activeFilters[key] = event.target.checked || undefined
        this._page = 0
        this.render()
      })
    })

    // Load more button
    const loadMore = el.querySelector('.sr-browser-load-more')
    if (loadMore) {
      loadMore.addEventListener('click', () => {
        this._page++
        this.render()
      })
    }

    // Sort buttons
    el.querySelectorAll('[data-sort-key]').forEach(btn => {
      btn.addEventListener('click', (event) => {
        const key = event.currentTarget.dataset.sortKey
        if (this._sortKey === key) {
          this._sortDirection = this._sortDirection === 'asc' ? 'desc' : 'asc'
        } else {
          this._sortKey = key
          this._sortDirection = 'asc'
        }
        this.render()
      })
    })

    // Drag support on result rows
    el.querySelectorAll('.sr-browser-result[draggable]').forEach(row => {
      row.addEventListener('dragstart', (event) => {
        const uuid = event.currentTarget.dataset.uuid
        const docType = event.currentTarget.dataset.docName || 'Item'
        event.dataTransfer.setData('text/plain', JSON.stringify({
          type: docType, uuid 
        }))
      })
    })
  }

  /* -------------------------------------------- */
  /*  Actions                                     */
  /* -------------------------------------------- */

  static async #onViewItem(event, target) {
    const uuid = target.closest('[data-uuid]')?.dataset.uuid
    if (!uuid) return
    const doc = await fromUuid(uuid)
    if (doc) doc.sheet.render(true)
  }

  static #onClearFilters() {
    this._searchText = ''
    this._activeFilters = {
    }
    this._selectedTypes.clear()
    this._page = 0
    this.render()
  }

  static #onRefreshIndex() {
    this._indexCache = null
    this._page = 0
    this.render()
  }
}
