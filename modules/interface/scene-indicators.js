import {
  SR5
} from "../config.js"

// Players panel layout: players list (expand button on the own player row), then scene noise / background count, then latency / FPS
export function arrangePlayersPanel() {
  const playersActive = document.getElementById("players-active")
  if (!playersActive) return

  const expandButton = document.getElementById("players-expand")
  const playerRow = playersActive.querySelector(".player.self") ?? playersActive.querySelector(".player")
  if (expandButton && playerRow && expandButton.parentElement !== playerRow) playerRow.append(expandButton)

  renderSceneIndicators()
}

// Matrix noise and background count of the viewed scene, displayed above the players latency / FPS
export function renderSceneIndicators() {
  const playersActive = document.getElementById("players-active")
  if (!playersActive) return

  let indicators = playersActive.querySelector("#sr5-scene-indicators")
  if (!indicators) {
    indicators = document.createElement("div")
    indicators.id = "sr5-scene-indicators"
    indicators.className = "flexrow"
    const performanceStats = playersActive.querySelector("#performance-stats")
    if (performanceStats) performanceStats.before(indicators)
    else playersActive.append(indicators)
  }

  const flags = canvas.scene?.flags?.sr5 ?? {
  }
  const noise = Number(flags.matrixNoise) || 0
  const backgroundCount = Number(flags.backgroundCountValue) || 0
  let backgroundCountLabel = String(backgroundCount)
  const alignment = SR5.traditionTypes[flags.backgroundCountAlignement]
  if (backgroundCount && alignment) backgroundCountLabel += ` (${game.i18n.localize(alignment)})`

  const escape = foundry.utils.escapeHTML
  indicators.innerHTML = `
    <div id="sr5-scene-noise" class="${noise ? "active" : ""}" data-tooltip="${escape(game.i18n.localize("SR5.SceneNoiseRating"))}">
      <label>${escape(game.i18n.localize("SR5.Noise"))}</label>
      <span class="value">${noise}</span>
    </div>
    <div id="sr5-scene-background-count" class="${backgroundCount ? "active" : ""}" data-tooltip="${escape(game.i18n.localize("SR5.SceneBackgroundCountRating"))}">
      <label>${escape(game.i18n.localize("SR5.SceneBackgroundCount"))}</label>
      <span class="value">${escape(backgroundCountLabel)}</span>
    </div>
  `
}

export function sr5HookUpdateSceneIndicators(scene) {
  if (scene?.id === canvas.scene?.id) renderSceneIndicators()
}
