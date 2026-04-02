// Import Modules
import { registerHandlebarsHelpers } from "./modules/handlebars.js";
import { registerHooks } from "./modules/hooks.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

registerHooks();
registerHandlebarsHelpers();
