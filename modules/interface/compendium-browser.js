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
import {
  SR5Shop 
} from './shop.js'
import {
  SR5ShopAvailability 
} from './shop-availability.js'
import {
  SR5SellDialog 
} from './shop-sell-dialog.js'

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
      buyItem: SR5CompendiumBrowser.#onBuyItem,
      addToCart: SR5CompendiumBrowser.#onAddToCart,
      removeFromCart: SR5CompendiumBrowser.#onRemoveFromCart,
      clearCart: SR5CompendiumBrowser.#onClearCart,
      checkoutCart: SR5CompendiumBrowser.#onCheckoutCart,
      testAvailability: SR5CompendiumBrowser.#onTestAvailability,
      testCartAvailability: SR5CompendiumBrowser.#onTestCartAvailability,
      openSell: SR5CompendiumBrowser.#onOpenSell,
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
    this._buyerId = null
    // Shopping list, kept while the window lives: [{uuid, name, img, quantity}]
    this._cart = []
    this._contactId = null
    this._surcharge = 0
    // A pool typed in by hand, which replaces the computed one when set
    this._overridePool = 0
    this._overrideLimit = 0
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

    // Who is spending, and how much is left to spend
    const buyers = SR5Shop.getBuyers()
    if (this._buyerId && !buyers.some(a => a.id === this._buyerId)) this._buyerId = null
    if (!this._buyerId) this._buyerId = SR5Shop.defaultBuyerId(buyers)
    const buyer = buyers.find(a => a.id === this._buyerId) || null
    const buyerFunds = buyer ? SR5Shop.balance(buyer) : 0
    const creationMode = SR5Shop.creationMode

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
      const price = SR5Shop.isPurchasable(e) ? SR5Shop.unitPrice(e.system) : null
      return {
        ...e,
        typeLabel,
        typeIcon: def?.icon || 'fa-cube',
        info: getEntryInfo(e, lists),
        canBuy: buyer !== null && price !== null,
        priceLabel: price === null ? '' : `${price.toLocaleString()}¥`,
        tooExpensive: !creationMode && price !== null && buyer !== null && price > buyerFunds,
      }
    })

    context.buyers = buyers.map(a => ({
      id: a.id, name: a.name, selected: a.id === this._buyerId 
    }))
    // The cart is priced from the compendium, not from what it was added at:
    // a line whose source has gone stays visible, at zero, rather than lying.
    const cartLines = []
    let cartTotal = 0
    for (const line of this._cart) {
      const entry = allEntries.find(e => e.uuid === line.uuid)
      const unit = entry?.system ? SR5Shop.unitPrice(entry.system) : line.unit ?? 0
      const total = unit * line.quantity
      cartTotal += total
      cartLines.push({
        ...line, unit, total, totalLabel: `${total.toLocaleString()}¥` 
      })
    }
    context.cart = cartLines
    context.cartCount = cartLines.length
    context.cartTotal = cartTotal
    context.cartTotalLabel = `${cartTotal.toLocaleString()}¥`
    context.cartAffordable = creationMode || cartTotal <= buyerFunds
    context.canCheckout = buyer !== null && cartLines.length > 0
    // Who does the looking, and how much is offered on top of the price
    const contacts = SR5ShopAvailability.getContacts(buyer)
    if (this._contactId && !contacts.some(c => c.id === this._contactId)) this._contactId = null
    context.contacts = contacts.map(c => ({
      id: c.id,
      name: c.name,
      connection: c.system.connection,
      selected: c.id === this._contactId,
    }))
    context.hasContacts = contacts.length > 0
    context.overridePool = this._overridePool || ''
    context.overrideLimit = this._overrideLimit || ''
    context.surcharge = this._surcharge
    // The offer ladder follows the configured cost of a die, up to the cap:
    // a table that sells dice at 10 % gets a ladder in tens.
    const {
      step, max 
    } = SR5ShopAvailability.surchargeRules
    const steps = max || 12
    const ladder = [0]
    for (let i = 1; i <= steps; i++) ladder.push(step * i)
    if (!ladder.includes(this._surcharge)) ladder.push(this._surcharge)
    context.surchargeChoices = ladder.sort((a, b) => a - b).map(value => ({
      value,
      label: value ? `+${value}% (+${SR5ShopAvailability.surchargeDice(value)})` : '—',
      selected: value === this._surcharge,
    }))
    context.creationMode = creationMode
    context.buyer = buyer ? {
      id: buyer.id, name: buyer.name, funds: buyerFunds.toLocaleString() 
    } : null
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

    // Quantity fields inside the cart panel
    el.querySelectorAll('.sr-browser-cart-qty').forEach(input => {
      input.addEventListener('change', (event) => {
        const uuid = event.target.closest('[data-uuid]')?.dataset.uuid
        const line = this._cart.find(l => l.uuid === uuid)
        if (!line) return
        line.quantity = Math.max(1, Math.floor(Number(event.target.value) || 1))
        this.render()
      })
      input.addEventListener('click', (event) => event.stopPropagation())
    })

    // The quantity field sits inside a row that opens the sheet when clicked
    el.querySelectorAll('.sr-browser-buy-qty').forEach(input => {
      input.addEventListener('click', (event) => event.stopPropagation())
      input.addEventListener('dragstart', (event) => event.preventDefault())
    })

    // Creation mode
    const creationToggle = el.querySelector('[data-shop-creation]')
    if (creationToggle) {
      creationToggle.addEventListener('change', async (event) => {
        await game.settings.set('sr5', 'sr5ShopCreationMode', event.target.checked)
        this.render()
      })
    }

    // Contact and surcharge selectors
    const contactSelect = el.querySelector('[data-shop-contact]')
    if (contactSelect) {
      contactSelect.addEventListener('change', (event) => {
        this._contactId = event.target.value || null
        this.render()
      })
    }
    el.querySelectorAll('[data-shop-override]').forEach(input => {
      input.addEventListener('change', (event) => {
        const value = Math.max(0, Math.floor(Number(event.target.value) || 0))
        if (event.target.dataset.shopOverride === 'limit') this._overrideLimit = value
        else this._overridePool = value
        this.render()
      })
    })

    const surchargeSelect = el.querySelector('[data-shop-surcharge]')
    if (surchargeSelect) {
      surchargeSelect.addEventListener('change', (event) => {
        this._surcharge = Number(event.target.value) || 0
        this.render()
      })
    }

    // Buyer selector
    const buyerSelect = el.querySelector('[data-shop-buyer]')
    if (buyerSelect) {
      buyerSelect.addEventListener('change', (event) => {
        this._buyerId = event.target.value || null
        this.render()
      })
    }

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

  /** Read the quantity field of the row an action was fired from. */
  static #rowQuantity(row) {
    return Math.max(1, Math.floor(Number(row?.querySelector('.sr-browser-buy-qty')?.value) || 1))
  }

  static async #onAddToCart(event, target) {
    event.stopPropagation()
    const row = target.closest('[data-uuid]')
    const uuid = row?.dataset.uuid
    if (!uuid) return
    const quantity = SR5CompendiumBrowser.#rowQuantity(row)
    const existing = this._cart.find(line => line.uuid === uuid)
    if (existing) {
      existing.quantity += quantity
    } else {
      this._cart.push({
        uuid,
        quantity,
        name: row.querySelector('.sr-browser-result-name')?.textContent.trim() ?? uuid,
        img: row.querySelector('.sr-browser-result-img')?.getAttribute('src') ?? '',
      })
    }
    this._cartOpen = true
    this.render()
  }

  static #onRemoveFromCart(event, target) {
    event.stopPropagation()
    const uuid = target.closest('[data-uuid]')?.dataset.uuid
    this._cart = this._cart.filter(line => line.uuid !== uuid)
    this.render()
  }

  static #onClearCart() {
    this._cart = []
    this.render()
  }

  static async #onCheckoutCart() {
    const actor = game.actors.get(this._buyerId)
    const bought = await SR5Shop.checkout(actor, this._cart.map(line => ({
      uuid: line.uuid, quantity: line.quantity, name: line.name 
    })))
    if (bought) this._cart = []
    this.render()
  }

  /** The hand-typed pool and limit, when the user has filled them in. */
  #overrides() {
    return {
      overridePool: this._overridePool, overrideLimit: this._overrideLimit 
    }
  }

  /** The contact doing the looking, if one is selected. */
  #searchingContact() {
    const buyer = game.actors.get(this._buyerId)
    return this._contactId ? buyer?.items.get(this._contactId) ?? null : null
  }

  static #onOpenSell() {
    SR5SellDialog.open(game.actors.get(this._buyerId))
  }

  static async #onTestAvailability(event, target) {
    event.stopPropagation()
    const row = target.closest('[data-uuid]')
    const uuid = row?.dataset.uuid
    if (!uuid) return
    const actor = game.actors.get(this._buyerId)
    await SR5ShopAvailability.testLines(actor, this.#searchingContact(), [{
      uuid,
      quantity: SR5CompendiumBrowser.#rowQuantity(row),
      name: row.querySelector('.sr-browser-result-name')?.textContent.trim(),
    }], this._surcharge, this.#overrides())
  }

  static async #onTestCartAvailability() {
    if (!this._cart.length) return
    const actor = game.actors.get(this._buyerId)
    await SR5ShopAvailability.testLines(actor, this.#searchingContact(), this._cart.map(line => ({
      uuid: line.uuid, quantity: line.quantity, name: line.name,
    })), this._surcharge, this.#overrides())
  }

  static async #onBuyItem(event, target) {
    event.stopPropagation()
    const row = target.closest('[data-uuid]')
    const uuid = row?.dataset.uuid
    if (!uuid) return
    const quantity = SR5CompendiumBrowser.#rowQuantity(row)
    const actor = game.actors.get(this._buyerId)
    const bought = await SR5Shop.buy(actor, uuid, quantity)
    if (bought) this.render()
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
