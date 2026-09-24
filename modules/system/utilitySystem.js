export class SR5_SystemHelpers {
  static registerSystemSettings() {

    // System Migration Version
    game.settings.register("sr5", "systemMigrationVersion", {
      name: "SR5.TEXT_TBD",
      scope: "world",
      config: false,
      type: String,
      default: 0
    })

    // Developper Extra Logging Toggle
    game.settings.register("sr5", "sr5Log.active", {
      name: "SR5.SETTINGS_DevLogActive_T",
      hint: "SR5.SETTINGS_DevLogActive_D",
      scope: "client",
      config: true,
      default: false,
      type: Boolean,
      onChange: () => window.location.reload()
    })
    // Developper Extra Logging Level
    game.settings.register("sr5", "sr5Log.level", {
      name: "SR5.SETTINGS_DevLogLevel_T",
      hint: "SR5.SETTINGS_DevLogLevel_D",
      scope: "client",
      config: true,
      default: 0,
      type: Number,
      choices: {
        0: "SR5.SETTINGS.LoggingLevelError",
        1: "SR5.SETTINGS.LoggingLevelWarning",
        2: "SR5.SETTINGS.LoggingLevelInfo",
        3: "SR5.SETTINGS.LoggingLevelDebug",
      },
      onChange: () => window.location.reload()
    })

    //Choose CSS Style
    game.settings.register("sr5", "sr5ChooseStyle", {
      name: "SR5.SETTINGS_ChooseStyle_T",
      hint: "SR5.SETTINGS_ChooseStyle_D",
      scope: "client",
      config: true,
      default: "SR5",
      type: String,
      choices: {
        "SR5": "SR5.SETTINGS.Sr5Style",
        "SR6": "SR5.SETTINGS.Sr6Style",
      },
      onChange: () => window.location.reload()
    })

    // Compendium browser: add gear without charging it (character creation,
    // or fixing an entry a player already paid for). Remembered per user.
    game.settings.register("sr5", "sr5ShopCreationMode", {
      name: "SR5.SETTINGS_ShopCreationMode_T",
      hint: "SR5.SETTINGS_ShopCreationMode_D",
      scope: "client",
      config: false,
      default: false,
      type: Boolean,
    })

    // What a bonus die costs on an availability test. SR5 p. 420 sells one
    // die per 25 % of the price, up to +12 (four times the price); both are
    // values a table may want to move.
    game.settings.register("sr5", "sr5ShopSurchargePerDie", {
      name: "SR5.SETTINGS_ShopSurchargePerDie_T",
      hint: "SR5.SETTINGS_ShopSurchargePerDie_D",
      scope: "world",
      config: true,
      default: 25,
      type: Number,
    })

    game.settings.register("sr5", "sr5ShopMaxSurchargeDice", {
      name: "SR5.SETTINGS_ShopMaxSurchargeDice_T",
      hint: "SR5.SETTINGS_ShopMaxSurchargeDice_D",
      scope: "world",
      config: true,
      default: 12,
      type: Number,
    })

    // Fencing gear, SR5 p. 421. Every figure of the rule is a setting: the
    // share a found buyer starts from, what a net hit of haggling moves, the
    // threshold to find a buyer at all, what a contact pays per point of
    // Loyalty, and the buyer's own pool — which the book never gives.
    game.settings.register("sr5", "sr5ShopFenceBasePercent", {
      name: "SR5.SETTINGS_ShopFenceBase_T",
      hint: "SR5.SETTINGS_ShopFenceBase_D",
      scope: "world", config: true, default: 25, type: Number,
    })

    game.settings.register("sr5", "sr5ShopFenceStepPercent", {
      name: "SR5.SETTINGS_ShopFenceStep_T",
      hint: "SR5.SETTINGS_ShopFenceStep_D",
      scope: "world", config: true, default: 5, type: Number,
    })

    game.settings.register("sr5", "sr5ShopFenceThreshold", {
      name: "SR5.SETTINGS_ShopFenceThreshold_T",
      hint: "SR5.SETTINGS_ShopFenceThreshold_D",
      scope: "world", config: true, default: 10, type: Number,
    })

    game.settings.register("sr5", "sr5ShopContactFencePercent", {
      name: "SR5.SETTINGS_ShopContactFence_T",
      hint: "SR5.SETTINGS_ShopContactFence_D",
      scope: "world", config: true, default: 5, type: Number,
    })

    game.settings.register("sr5", "sr5ShopFenceBuyerPool", {
      name: "SR5.SETTINGS_ShopFenceBuyerPool_T",
      hint: "SR5.SETTINGS_ShopFenceBuyerPool_D",
      scope: "world", config: true, default: 6, type: Number,
    })

    // Which contact types deal in goods, for the Bargaining specialization
    // on availability tests. Free text on the contact sheet, so this is a
    // keyword list the table can edit.
    game.settings.register("sr5", "sr5ShopDealerKeywords", {
      name: "SR5.SETTINGS_ShopDealerKeywords_T",
      hint: "SR5.SETTINGS_ShopDealerKeywords_D",
      scope: "world",
      config: true,
      default: "fixer, intermediaire, intermédiaire, receleur, recéleur, fourgue, marchand, armurier, talismonger, talismancien, dealer, trafiquant, contrebandier, smuggler, arms dealer",
      type: String,
    })

    // Display Help Window
    game.settings.register("sr5", "sr5Help.active", {
      name: "SR5.SETTINGS_HelpActive_T",
      hint: "SR5.SETTINGS_HelpActive_D",
      scope: "client",
      config: true,
      default: true,
      type: Boolean,
      onChange: () => window.location.reload()
    })

    // Matrix Grid Rules
    game.settings.register("sr5", "sr5MatrixGridRules", {
      name: "SR5.SETTINGS_MatrixGridRules_T",
      hint: "SR5.SETTINGS_MatrixGridRules_D",
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
      onChange: () => window.location.reload()
    })

    // Run & Gun Rules
    game.settings.register("sr5", "sr5CalledShotsRules", {
      name: "SR5.SETTINGS_CalledShotsRules_T",
      hint: "SR5.SETTINGS_CalledShotsRules_D",
      scope: "world",
      config: true,
      default: true,
      type: Boolean,
      onChange: () => window.location.reload()
    })

    // Kill Code Rules
    game.settings.register("sr5", "sr5KillCodeRules", {
      name: "SR5.SETTINGS_KillCodeRules_T",
      hint: "SR5.SETTINGS_KillCodeRules_D",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
      onChange: () => window.location.reload()
    })

    // Rigger 5 Rules
    game.settings.register("sr5", "sr5Rigger5Actions", {
      name: "SR5.SETTINGS_Rigger5Actions_T",
      hint: "SR5.SETTINGS_Rigger5Actions_D",
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
      onChange: () => window.location.reload()
    })
  }

  /* Display Shadowrun Themed Log Entries Based on Logging Level
	// Usage: srLog(LEVEL, message, optional data... );
	// LEVEL can be one the following values:
	//      0 for ERRORS logging only
	//      1 for WARNING and ERRORS
	//      2 for INFO, WARNING and ERRORS
	//      3 for DEBUG (all messages)
	*/
  static srLog() {
    if (game.settings.get("sr5", "sr5Log.active")) {
      let userLogLevel = game.settings.get("sr5", "sr5Log.level")
      let msgLogLevel = 0
      let msgLabel = ""
      let tagLabel = ""
      const headerStyle = "color: #fff; background-color: rgba(157, 6, 104, 1); padding: 0 5px; border-radius: 2px;"
      let tagStyle = "color: #fff; padding: 0 5px; border-radius: 2px;"
      let levelColor = ""

      if (!arguments.length) SR5_SystemHelpers.srLog(0, `Logging function 'srLog()' called without any parameters`)
      else {
        if (!arguments[0].toString().match(/^[0-3]$/)) SR5_SystemHelpers.srLog(0, `Logging function 'srLog()' called without a log level`)
        else {
          msgLogLevel = arguments[0]
          delete arguments[0]
          if (!arguments[1]) SR5_SystemHelpers.srLog(0, `Logging function 'srLog()' called with an empty message`)
          else {
            if (msgLogLevel <= userLogLevel) {
              switch (msgLogLevel) {
                case 0:
                  levelColor = "rgba(250, 0, 0, 0.8)"
                  tagLabel = "ERROR"
                  break
                case 1:
                  levelColor = "rgba(250, 120, 0, 0.8)"
                  tagLabel = "WARNING"
                  break
                case 2:
                  levelColor = "rgba(0, 180, 0, 0.8)"
                  tagLabel = "INFORMATION"
                  break
                case 3:
                  levelColor = "rgba(0, 0, 180, 0.6)"
                  tagLabel = "DEBUG"
                  break
                default:
                  SR5_SystemHelpers.srLog(0, `Logging function 'srLog()' called with an unknown '${msgLogLevel}' log level`)
              }
              tagStyle += `background-color: ${levelColor};`

              // Use appropriate console level: error/warn for 0/1, log for 2/3
              // console.error/warn natively provide stack traces, no need to inject manually
              const consoleFn = msgLogLevel === 0 ? 'error' : msgLogLevel === 1 ? 'warn' : msgLogLevel === 3 ? 'debug' : 'log'

              msgLabel = `%cShadowrun 5%c %c${tagLabel}%c ${arguments[1]}`
              let msgDetails = Array.from(arguments).slice(2).map(v => JSON.parse(JSON.stringify(v)))

              console[consoleFn](`${msgLabel}`, headerStyle, "", tagStyle, "", ...msgDetails)
            }
          }
        }
      }
    }
  }

  static srLogPublic(message) {
    console.log(
      `%cShadowrun 5%c %cBROADCAST%c ${message}`,
      "color: #fff; background-color: rgba(157, 6, 104, 1); padding: 0 5px; border-radius: 2px;",
      "",
      "color: #fff; background-color: rgba(157, 6, 104, 0.7); padding: 0 5px; border-radius: 2px;",
      "font-weight: bold;",
    )
  }

  /**
	 * Return the distance between two documents on the canvas
	 * @param firstDocument     The first document
	 * @param secondDocument    The second document
	 * @return {distance}       The distance between first and second document based on grid scene round to the nearest integrer.
	 */
  static getDistanceBetweenTwoPoint(firstDocument, secondDocument){
    const distance = canvas.grid.measurePath([firstDocument, secondDocument])
    return distance.distance
  }

  /**
	 * Get the position of a template based on the id of the item which has created it
	 * @param itemId                     The item's id which has created the template
	 * @return {templatePosition || 0}   The coordinates of the template on the grid scene
	 */
  static async getTemplateItemPosition(itemId){
    let gridUnit = canvas.scene.grid.size
    let templatePosition = 0
    let templateItem = await canvas.scene.templates.find((template) => template.flags.sr5.item === itemId)
    if (templateItem) {
      //token position is based on top left grid.
      //player will probably launch grenade on the token, so we need to tweak the position of the grenade template
      templatePosition = {
        x: templateItem.x - (gridUnit/2), y: templateItem.y - (gridUnit/2)
      }
    }
    return templatePosition
  }
}

export class SR5_UiModifications {

  static init() {
    SR5_SystemHelpers.srLog(2, `Initializing Shadowrun 5 User Interface Modifications`)
  }

  static ready() {
  }

  static async addHelpWindow() {
    let template = "systems/sr5/templates/interface/help.hbs"
    const html = await foundry.applications.handlebars.renderTemplate(template)

    if (game.settings.get("sr5", "sr5Help.active")) {
      let target = document.querySelector("#sr5help")
      if (!target)
        document.getElementById('pause').insertAdjacentHTML("afterend", html)
    }
  }

}