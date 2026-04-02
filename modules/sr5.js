// Import Modules
import {
  registerHandlebarsHelpers 
} from "./handlebars.js"
import {
  registerHooks 
} from "./hooks.js"

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

registerHooks()
registerHandlebarsHelpers()
