import {
  SR5ShopFence
} from './shop-fence.js'
import {
  SR5ShopAvailability
} from './shop-availability.js'
import {
  enhanceSelects
} from '../helpers/enhance-selects.js'

/**
 * The counter a character sells over: its own gear on one side, a contact or
 * the open market on the other. Opened from the compendium browser, which
 * handles the buying half.
 */
export class SR5SellDialog extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  static _instance = null

  static open(actor) {
    if (!actor) {
      ui.notifications.warn(game.i18n.localize('SR5.WARN_ShopNoBuyer'))
      return null
    }
    if (SR5SellDialog._instance?.rendered) {
      SR5SellDialog._instance.actor = actor
      SR5SellDialog._instance.bringToFront()
      SR5SellDialog._instance.render()
      return SR5SellDialog._instance
    }
    const dialog = new SR5SellDialog({
      actor
    })
    SR5SellDialog._instance = dialog
    dialog.render(true).catch(err => {
      console.error('SR5 Sell: failed to open', err)
      ui.notifications?.error(game.i18n.localize('SR5.WARN_ShopSellFailed'))
    })
    return dialog
  }

  static DEFAULT_OPTIONS = {
    id: 'sr5-sell-dialog',
    classes: ['sr5', 'sr-application', 'sr-sell-dialog'],
    position: {
      width: 620, height: 600
    },
    window: {
      title: 'SR5.ShopSell',
      icon: 'fas fa-hand-holding-dollar',
      resizable: true,
    },
    actions: {
      sellToContact: SR5SellDialog.#onSellToContact,
      sellOnMarket: SR5SellDialog.#onSellOnMarket,
      clearSelection: SR5SellDialog.#onClearSelection,
    },
  }

  static PARTS = {
    sell: {
      template: 'systems/sr5/templates/interface/shop-sell-dialog.hbs'
    }
  }

  constructor(options = {
  }) {
    super(options)
    this.actor = options.actor
    this._selection = new Map()
    this._contactId = null
    this._overridePool = 0
    this._useAvailability = true
    this._searchText = ''
  }

  async _prepareContext() {
    const context = await super._prepareContext?.() ?? {
    }
    const actor = this.actor
    const contacts = SR5ShopAvailability.getContacts(actor)
    if (this._contactId && !contacts.some(c => c.id === this._contactId)) this._contactId = null
    const contact = this._contactId ? actor.items.get(this._contactId) : null

    const needle = this._searchText.toLowerCase()
    const items = SR5ShopFence.sellableItems(actor)
      .filter(item => !needle || item.name.toLowerCase().includes(needle))
      .map(item => {
        const selected = this._selection.get(item.id)
        const owned = Math.max(1, Number(item.system?.quantity ?? 1))
        const listed = SR5ShopFence.listedPrice(item)
        return {
          id: item.id,
          name: item.name,
          img: item.img,
          owned,
          listed,
          listedLabel: `${listed.toLocaleString()}¥`,
          availability: SR5ShopAvailability.availabilityOf(item.system),
          selected: selected !== undefined,
          quantity: selected ?? 1,
          contactLabel: contact ?
            `${(SR5ShopFence.contactOffer(item, contact) * (selected ?? 1)).toLocaleString()}¥` : '',
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))

    context.actorName = actor.name
    context.items = items
    context.hasSelection = this._selection.size > 0
    context.contacts = contacts.map(c => ({
      id: c.id,
      name: c.name,
      loyalty: c.system.loyalty,
      selected: c.id === this._contactId,
    }))
    context.hasContacts = contacts.length > 0
    context.hasContact = !!contact
    context.overridePool = this._overridePool || ''
    context.useAvailability = this._useAvailability
    context.searchText = this._searchText
    context.rules = SR5ShopFence.rules
    return context
  }

  /** The lines the buttons act on. */
  #lines() {
    return [...this._selection.entries()].map(([itemId, quantity]) => ({
      itemId, quantity
    }))
  }

  _onRender(context, options) {
    super._onRender(context, options)
    const el = this.element
    enhanceSelects(el)

    const search = el.querySelector('.sr-sell-search input')
    if (search) {
      let debounce = null
      search.addEventListener('input', (event) => {
        clearTimeout(debounce)
        debounce = setTimeout(() => {
          this._searchText = event.target.value
          this.render()
        }, 300)
      })
    }

    el.querySelectorAll('.sr-sell-check').forEach(cb => {
      cb.addEventListener('change', (event) => {
        const id = event.target.closest('[data-item-id]')?.dataset.itemId
        if (!id) return
        if (event.target.checked) this._selection.set(id, 1)
        else this._selection.delete(id)
        this.render()
      })
    })

    el.querySelectorAll('.sr-sell-qty').forEach(input => {
      input.addEventListener('change', (event) => {
        const id = event.target.closest('[data-item-id]')?.dataset.itemId
        if (!id || !this._selection.has(id)) return
        this._selection.set(id, Math.max(1, Math.floor(Number(event.target.value) || 1)))
        this.render()
      })
    })

    const contactSelect = el.querySelector('[data-sell-contact]')
    if (contactSelect) {
      contactSelect.addEventListener('change', (event) => {
        this._contactId = event.target.value || null
        this.render()
      })
    }

    const override = el.querySelector('[data-sell-override]')
    if (override) {
      override.addEventListener('change', (event) => {
        this._overridePool = Math.max(0, Math.floor(Number(event.target.value) || 0))
        this.render()
      })
    }

    const availability = el.querySelector('[data-sell-availability]')
    if (availability) {
      availability.addEventListener('change', (event) => {
        this._useAvailability = event.target.checked
      })
    }
  }

  /* -------------------------------------------- */
  /*  Actions                                     */
  /* -------------------------------------------- */

  static async #onSellToContact() {
    const contact = this._contactId ? this.actor.items.get(this._contactId) : null
    await SR5ShopFence.sellToContact(this.actor, contact, this.#lines())
  }

  static async #onSellOnMarket() {
    await SR5ShopFence.sellOnMarket(this.actor, this.#lines(), {
      useAvailability: this._useAvailability,
      overridePool: this._overridePool,
    })
  }

  static #onClearSelection() {
    this._selection.clear()
    this.render()
  }
}
