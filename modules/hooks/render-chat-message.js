import {
  SR5_RollMessage
} from "../rolls/roll-message.js"

export function sr5HookRenderChatMessageHTML(message, html, _data) {
  // Apply SR5 custom styling for messages with SR5 roll data
  if (message.flags?.sr5data) {
    html.classList.add("SRCustomMessage")
    const borderColor = message.flags?.sr5data?.owner?.borderColor
    if (borderColor && typeof borderColor === "string") html.style.borderColor = borderColor

    // Inject actor thumbnail into Foundry's default message header
    const msgHeader = html.querySelector(":scope > header")
    if (msgHeader) {
      const imgSrc = message.flags?.sr5data?.owner?.speakerImg || "systems/sr5/assets/img/ui/SR6_Logo.svg"
      const img = document.createElement("img")
      img.classList.add("SRAuthorIcon")
      img.src = imgSrc
      img.title = message.speaker?.alias || ""
      msgHeader.prepend(img)
    }
  }

  // Attach SR5 chat card listeners for messages with roll card content
  const hasSr5Card = html.querySelector(".SR-CardHeader")
  if (hasSr5Card) SR5_RollMessage.chatListeners(html, message)
}

// v13: keep chat scrolled to bottom when SR5 roll messages change height.
// Track whether the user is at the bottom; when chat content resizes
// (message updates, card expand/collapse), snap back to bottom instantly.
// This doesn't interfere with smooth "Jump to Bottom" animations because
// wasAtBottom is false while the user is scrolled up.
export function sr5HookRenderChatLog(app) {
  const scroll = app.element.querySelector(".chat-scroll")
  if (!scroll) return
  const log = scroll.querySelector(".chat-log")
  if (!log) return
  let wasAtBottom = true
  scroll.addEventListener("scroll", () => {
    wasAtBottom = (scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight) < 5
  })
  new ResizeObserver(() => {
    if (wasAtBottom) {
      scroll.scrollTo({
        top: scroll.scrollHeight, behavior: "instant"
      })
    }
  }).observe(log)
}
