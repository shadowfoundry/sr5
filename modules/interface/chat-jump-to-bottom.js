/**
 * Chat forms (sidebar chat and chat popout) mapped to their own "jump to bottom" button,
 * so a button moved into the chat controls can go back to its form.
 * @type {WeakMap<HTMLFormElement, HTMLButtonElement>}
 */
const jumpButtons = new WeakMap()

/**
 * Show the chat "jump to bottom" button in the chat controls row, right after the roll mode buttons,
 * instead of floating above them.
 * Core moves #chat-controls between the chat form of the sidebar, the chat popout and the
 * notifications area (collapsed sidebar), then calls the renderChatInput hook. A button is only
 * placed in the controls while they are inside its own form, otherwise it goes back to that form.
 */
export function sr5PlaceChatJumpToBottom() {
  const controls = document.getElementById("chat-controls")
  const privacy = document.getElementById("roll-privacy")

  for (const app of [ui.chat, ui.chat?.popout]) {
    const form = app?.element?.querySelector(".chat-form")
    if (!form) continue
    const jump = form.querySelector(":scope > .jump-to-bottom") ?? jumpButtons.get(form)
    if (!jump) continue
    jumpButtons.set(form, jump)

    if (privacy && controls?.parentElement === form) privacy.after(jump)
    else if (jump.parentElement !== form) form.prepend(jump)
  }
}
