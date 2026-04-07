/**
 * Progressive enhancement: transforms native <select> elements into custom
 * styled dropdowns while keeping the hidden <select> as the form value source.
 *
 * Call from any ApplicationV2's _onRender() after super._onRender():
 *   import { enhanceSelects } from '../../helpers/enhance-selects.js'
 *   enhanceSelects(this.element)
 */

// ── Global click-outside listener (registered once) ──────────────────────
let _outsideListenerRegistered = false

function _registerOutsideListener() {
  if (_outsideListenerRegistered) return
  _outsideListenerRegistered = true

  document.addEventListener('mousedown', (event) => {
    const openMenus = document.querySelectorAll('.sr-dropdown-menu.sr-dropdown-menu-visible')
    for (const menu of openMenus) {
      const host = menu._srHost
      if (host && !host.contains(event.target) && !menu.contains(event.target)) {
        _closeMenu(host, menu)
      }
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const openMenus = document.querySelectorAll('.sr-dropdown-menu.sr-dropdown-menu-visible')
      for (const menu of openMenus) {
        const host = menu._srHost
        if (host) _closeMenu(host, menu)
      }
    }
  })
}

// ── Main enhancement function ─────────────────────────────────────────────
export function enhanceSelects(rootElement) {
  if (!rootElement) return
  _registerOutsideListener()

  const selects = rootElement.querySelectorAll('select:not([data-sr-enhanced])')
  for (const select of selects) {
    _enhanceOneSelect(select)
  }
}

function _enhanceOneSelect(select) {
  select.setAttribute('data-sr-enhanced', '1')

  // The "host" is the element that gets the .sr-dropdown class.
  // If the select lives inside a .sr-select-wrapper (which is usually also
  // a grid cell like sr-grid-12), reuse that element as the host.
  // Otherwise wrap the select in a new div.
  let host
  const parent = select.parentElement
  if (parent?.classList?.contains('sr-select-wrapper')) {
    host = parent
    host.classList.add('sr-dropdown')
  } else {
    host = document.createElement('div')
    host.className = 'sr-dropdown'
    select.parentNode.insertBefore(host, select)
    host.appendChild(select)
  }

  if (select.disabled) host.classList.add('sr-dropdown-disabled')

  // Build trigger — insert before the select inside the host
  const trigger = document.createElement('div')
  trigger.className = 'sr-dropdown-trigger'
  trigger.setAttribute('tabindex', '0')

  const label = document.createElement('span')
  label.className = 'sr-dropdown-label'
  label.textContent = _getSelectedLabel(select)
  trigger.appendChild(label)

  const chevron = document.createElement('i')
  chevron.className = 'fas fa-chevron-down sr-dropdown-chevron'
  trigger.appendChild(chevron)

  host.insertBefore(trigger, select)

  // Build menu — portaled to document.body so it's never clipped by overflow
  const menu = document.createElement('div')
  menu.className = 'sr-dropdown-menu'
  menu._srHost = host
  _buildMenuItems(menu, select)
  document.body.appendChild(menu)

  // Store references
  host._srMenu = menu
  host._srLabel = label

  // Clean up the portaled menu when the host is removed from the DOM
  const cleanupObserver = new MutationObserver(() => {
    if (!host.isConnected) {
      menu.remove()
      cleanupObserver.disconnect()
    }
  })
  cleanupObserver.observe(document.body, {
    childList: true, subtree: true 
  })

  // ── Event listeners ────────────────────────────────────────────────────

  trigger.addEventListener('mousedown', (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (select.disabled) return

    // Close any other open menus first
    const allOpen = document.querySelectorAll('.sr-dropdown-menu.sr-dropdown-menu-visible')
    for (const m of allOpen) {
      if (m !== menu) {
        const h = m._srHost
        if (h) _closeMenu(h, m)
      }
    }

    if (menu.classList.contains('sr-dropdown-menu-visible')) {
      _closeMenu(host, menu)
    } else {
      _openMenu(host, trigger, menu)
    }
  })

  menu.addEventListener('mousedown', (event) => {
    event.preventDefault()
    event.stopPropagation()
    const item = event.target.closest('.sr-dropdown-item')
    if (!item) return

    const value = item.dataset.value ?? ''
    select.value = value
    label.textContent = item.textContent
    _closeMenu(host, menu)

    menu.querySelectorAll('.sr-dropdown-item.selected').forEach(el => el.classList.remove('selected'))
    item.classList.add('selected')

    select.dispatchEvent(new Event('change', {
      bubbles: true 
    }))
  })

  trigger.addEventListener('keydown', (event) => {
    if (select.disabled) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!menu.classList.contains('sr-dropdown-menu-visible')) {
        _openMenu(host, trigger, menu)
      }
      _moveFocus(menu, event.key === 'ArrowDown' ? 1 : -1)
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const focused = menu.querySelector('.sr-dropdown-item.sr-dropdown-focused')
      if (focused && menu.classList.contains('sr-dropdown-menu-visible')) {
        focused.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true 
        }))
      } else if (!menu.classList.contains('sr-dropdown-menu-visible')) {
        _openMenu(host, trigger, menu)
      } else {
        _closeMenu(host, menu)
      }
    }

    if (event.key === 'Escape') {
      _closeMenu(host, menu)
    }
  })

  const observer = new MutationObserver(() => {
    label.textContent = _getSelectedLabel(select)
    _syncSelectedClass(menu, select.value)
  })
  observer.observe(select, {
    attributes: true, childList: true, subtree: true 
  })
}

// ── Open / Close helpers ──────────────────────────────────────────────────

function _openMenu(host, trigger, menu) {
  const rect = trigger.getBoundingClientRect()

  // Match portaled menu font to the trigger's computed font (avoids rem vs em mismatch)
  const triggerStyle = window.getComputedStyle(trigger)
  menu.style.fontSize = triggerStyle.fontSize
  menu.style.fontFamily = triggerStyle.fontFamily

  menu.style.left = `${rect.left}px`
  menu.style.width = `${rect.width}px`
  menu.classList.add('sr-dropdown-menu-visible')
  host.classList.add('sr-dropdown-open')

  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const menuHeight = Math.min(menu.scrollHeight, 250)

  if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
    menu.style.top = `${rect.bottom}px`
    menu.style.bottom = ''
    menu.style.maxHeight = `${Math.min(250, spaceBelow - 4)}px`
  } else {
    menu.style.top = ''
    menu.style.bottom = `${window.innerHeight - rect.top}px`
    menu.style.maxHeight = `${Math.min(250, spaceAbove - 4)}px`
  }

  const selectedItem = menu.querySelector('.sr-dropdown-item.selected')
  if (selectedItem) selectedItem.scrollIntoView({
    block: 'nearest' 
  })
}

function _closeMenu(host, menu) {
  menu.classList.remove('sr-dropdown-menu-visible')
  host.classList.remove('sr-dropdown-open')
  menu.querySelectorAll('.sr-dropdown-focused').forEach(el => el.classList.remove('sr-dropdown-focused'))
}

// ── Helpers ───────────────────────────────────────────────────────────────

function _getSelectedLabel(select) {
  const option = select.options[select.selectedIndex]
  return option ? option.textContent.trim() : ''
}

function _buildMenuItems(menu, select) {
  menu.innerHTML = ''

  for (const child of select.children) {
    if (child.tagName === 'OPTGROUP') {
      const groupHeader = document.createElement('div')
      groupHeader.className = 'sr-dropdown-group'
      groupHeader.textContent = child.label
      menu.appendChild(groupHeader)

      for (const opt of child.children) {
        if (opt.tagName === 'OPTION') {
          menu.appendChild(_createItem(opt, select.value))
        }
      }
    } else if (child.tagName === 'OPTION') {
      menu.appendChild(_createItem(child, select.value))
    }
  }
}

function _createItem(option, currentValue) {
  const item = document.createElement('div')
  if (option.disabled) {
    item.className = 'sr-dropdown-separator'
    return item
  }
  item.className = 'sr-dropdown-item'
  item.dataset.value = option.value
  item.textContent = option.textContent.trim()
  if (option.value === currentValue) item.classList.add('selected')
  return item
}

function _syncSelectedClass(menu, value) {
  menu.querySelectorAll('.sr-dropdown-item.selected').forEach(el => el.classList.remove('selected'))
  const match = menu.querySelector(`.sr-dropdown-item[data-value="${CSS.escape(value)}"]`)
  if (match) match.classList.add('selected')
}

function _moveFocus(menu, direction) {
  const items = [...menu.querySelectorAll('.sr-dropdown-item')]
  if (!items.length) return

  const currentIndex = items.findIndex(el => el.classList.contains('sr-dropdown-focused'))
  items.forEach(el => el.classList.remove('sr-dropdown-focused'))

  let nextIndex
  if (currentIndex === -1) {
    nextIndex = direction === 1 ? 0 : items.length - 1
  } else {
    nextIndex = currentIndex + direction
    if (nextIndex < 0) nextIndex = items.length - 1
    if (nextIndex >= items.length) nextIndex = 0
  }

  items[nextIndex].classList.add('sr-dropdown-focused')
  items[nextIndex].scrollIntoView({
    block: 'nearest' 
  })
}
