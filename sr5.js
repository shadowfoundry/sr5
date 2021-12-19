// Import Modules
import { registerHandlebarsHelpers } from "./scripts/handlebars.js";
import { registerHooks } from "./scripts/hooks.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

registerHooks();
registerHandlebarsHelpers();
