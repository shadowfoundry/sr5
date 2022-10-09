export class SR5_SystemHelpers {
	static registerSystemSettings() {

		// System Migration Version
		game.settings.register("sr5", "systemMigrationVersion", {
			name: "SR5.TEXT_TBD",
			scope: "world",
			config: false,
			type: String,
			default: 0
		});

		// Developper Extra Logging Toggle
		game.settings.register("sr5", "sr5Log.active", {
			name: "SR5.SETTINGS_DevLogActive_T",
			hint: "SR5.SETTINGS_DevLogActive_D",
			scope: "client",
			config: true,
			default: false,
			type: Boolean,
			onChange: () => window.location.reload()
		});
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
		});

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
		});

		// Display Help Window
		game.settings.register("sr5", "sr5Help.active", {
			name: "SR5.SETTINGS_HelpActive_T",
			hint: "SR5.SETTINGS_HelpActive_D",
			scope: "client",
			config: true,
			default: true,
			type: Boolean,
			onChange: () => window.location.reload()
		});

		// Matrix Grid Rules
		game.settings.register("sr5", "sr5MatrixGridRules", {
			name: "SR5.SETTINGS_MatrixGridRules_T",
			hint: "SR5.SETTINGS_MatrixGridRules_D",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
			onChange: () => window.location.reload()
		});

		// Matrix Grid Rules
		game.settings.register("sr5", "sr5CalledShotsRules", {
			name: "SR5.SETTINGS_CalledShotsRules_T",
			hint: "SR5.SETTINGS_CalledShotsRules_D",
			scope: "world",
			config: true,
			default: true,
			type: Boolean,
			onChange: () => window.location.reload()
		});
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
			let userLogLevel = game.settings.get("sr5", "sr5Log.level");
			let msgLogLevel = 0;
			let msgLabel = "";
			let tagLabel = "";
			let headerStyle = "color: rgba(157, 6, 104, 1);";
			let msgStyle = "width: 100%; padding: 0 auto;";
			let tagStyle = "width: 100%; padding: 0 auto; color: rgba(255, 255, 255, 1); padding: 0 5px; border-radius: 2px;";

			if (!arguments.length) SR5_SystemHelpers.srLog(0, `Logging function 'srLog()' called without any parameters`);
			else {
				if (!arguments[0].toString().match(/^[0-3]$/)) SR5_SystemHelpers.srLog(0, `Logging function 'srLog()' called without a log level`);
				else {
					msgLogLevel = arguments[0];
					delete arguments[0];
					if (!arguments[1]) SR5_SystemHelpers.srLog(0, `Logging function 'srLog()' called with an empty message`);
					else {
						if (msgLogLevel <= userLogLevel) {
							switch (msgLogLevel) {
								case 0:
									tagStyle += "background-color: rgba(250, 0, 0, 0.8); ";
									tagLabel = " ERROR ";
									msgStyle += "color: rgba(157, 6, 104, 1);";
									arguments.stack = (new Error()).stack;
									break;
								case 1:
									tagStyle += "background-color: rgba(250, 120, 0, 0.8);";
									tagLabel = "WARNING";
									msgStyle += "color: rgba(157, 6, 104, 0.8);";
									arguments.stack = (new Error()).stack;
									break;
								case 2:
									tagStyle += "background-color: rgba(0, 180, 0, 0.8);";
									tagLabel = " INFO. ";
									msgStyle += "color: rgba(157, 6, 104, 0.6);";
									break;
								case 3:
									tagStyle += "background-color: rgba(0, 0, 180, 0.4);";
									tagLabel = " DEBUG ";
									msgStyle += "color: rgba(157, 6, 104, 0.4);";
									break;
								default:
									SR5_SystemHelpers.srLog(0, `Logging function 'srLog()' called with an unknown '${msgLogLevel}' log level`);
							}

							msgLabel = `%cShadowrun 5 | %c${tagLabel}%c ${arguments[1]}`;
							delete arguments[1];
							let msgDetails = {
								...arguments
							};

							if (Object.values(msgDetails).length) {
								console.groupCollapsed(`${msgLabel}`, headerStyle, tagStyle, msgStyle);
								for (let v of Object.values(msgDetails)) {
									console.log(`%o`, JSON.parse(JSON.stringify(v)));
								}
								console.groupEnd();
							} else {
								console.log(`${msgLabel}`, headerStyle, tagStyle, msgStyle);
							}
						}
					}
				}
			}
		}
	}

	static srLogPublic(message) {
		console.log(
			`%cShadowrun 5 | %cMESSAGE%c ${message}`,
			"color: rgba(157, 6, 104, 1);",
			"background-color: rgba(157, 6, 104, 1); width: 100%; padding: 0 auto; color: rgba(255, 255, 255, 1); padding: 0 5px; border-radius: 2px;",
			"color: rgba(157, 6, 104, 1); font-weight: bold;",
		);
	}

	/**
	 * Return the distance between two documents on the canvas
	 * @param firstDocument     The first document
	 * @param secondDocument    The second document
	 * @return {distance}       The distance between first and second document based on grid scene round to the nearest integrer.
	 */
	static getDistanceBetweenTwoPoint(firstDocument, secondDocument){
		const r = new Ray(firstDocument, secondDocument);
		const segments = [{ ray: r }];
		const distance = Math.round(canvas.grid.measureDistances(segments));
		return distance;
	}

	/**
	 * Get the position of a template based on the id of the item which has created it
	 * @param itemId                     The item's id which has created the template
	 * @return {templatePosition || 0}   The coordinates of the template on the grid scene
	 */
	static getTemplateItemPosition(itemId){
		let gridUnit = canvas.scene.grid.size;
		let templatePosition = 0;
		let templateItem = canvas.scene.templates.find((template) => template.flags.sr5.item === itemId);
		if (templateItem) {
			//token position is based on top left grid.
			//player will probably launch grenade on the token, so we need to tweak the position of the grenade template
			templatePosition = { x: templateItem.x - (gridUnit/2), y: templateItem.y - (gridUnit/2)};
		}
		return templatePosition;
	}
}

export class SR5_UiModifications {

	static init() {
		SR5_SystemHelpers.srLog(2, `Initializing Shadowrun 5 User Interface Modifications`);
	}

	static ready() {
	}

	static async addHelpWindow() {
		let template = "systems/sr5/templates/interface/help.html";
		const html = await renderTemplate(template);

		if (game.settings.get("sr5", "sr5Help.active")) {
			document.getElementById('pause').insertAdjacentHTML("afterend", html);
		}
	}

}