import { SR5 } from "./config.js";
import { SR5_SystemHelpers } from "./system/utility.js";
import { SR5_EntityHelpers } from "./entities/helpers.js";

export const registerHandlebarsHelpers = function () {

  // if equal
  Handlebars.registerHelper("ife", function (v1, v2, options) {
    if (v1 === v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if not equal
  Handlebars.registerHelper("ifne", function (v1, v2, options) {
    if (v1 !== v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if less or equal than
  Handlebars.registerHelper("if_le", function (v1, v2, options) {
    if (v1 <= v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if greater or equal than
  Handlebars.registerHelper("if_ge", function (v1, v2, options) {
    if (v1 >= v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if less than
  Handlebars.registerHelper("if_l", function (v1, v2, options) {
    if (v1 < v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if greater than
  Handlebars.registerHelper("if_g", function (v1, v2, options) {
    if (v1 > v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if more than one
  Handlebars.registerHelper(
    "ifmto",
    function (testValue, textIfTrue, textIfFalse) {
      if (testValue > 1) return game.i18n.localize(textIfTrue);
      else return game.i18n.localize(textIfFalse);
    }
  );

  // if key exist
  Handlebars.registerHelper('isdefined', function (value) {
    return value !== undefined;
  });

  const reduceOp = function (args, reducer) {
    args = Array.from(args);
    args.pop(); // => options
    var first = args.shift();
    return args.reduce(reducer, first);
  };

  // check if argument is missing/empty : to be used with `{{#if (missing arg1 arg2 arg3 arg4)}}{{else}}{{/if}})
  Handlebars.registerHelper("missing", function () {
    return !reduceOp(arguments, (a, b) => a && b);
  });

  // Display amount of nuyens
  Handlebars.registerHelper("nuyen", function (amount) {
    if (!amount) return "0 ¥";
    let lang = game.settings.get("core", "language");
    if (lang === "fr")
      return amount.toLocaleString('fr-FR', { maximumFractionDigits: 2 }).concat(" ¥");
    else
      return amount.toLocaleString('en-US', { maximumFractionDigits: 2 }).concat(" ¥");
  });

    // Display nummber
  Handlebars.registerHelper("number", function (amount) {
    if (!amount) return "0";
    let lang = game.settings.get("core", "language");
    if (lang === "fr")
      return amount.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
    else
      return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
  });

  // get translation key from config.js of
  Handlebars.registerHelper("findTranslation", function (table, key) {
    if (!table) {
      SR5_SystemHelpers.srLog(0, `No translation table provided`);
      return game.i18n.localize(SR5.HBS_ErrorNoTableGiven);
    }
    if (!SR5[table]) {
      SR5_SystemHelpers.srLog(0, `Translation table '${table}' does not exist`);
      return game.i18n.localize(SR5.HBS_ErrorUnknownTable);
    }
    if (Array.isArray(key)) {
      key = key[0];
    }
    if (!key) {
      SR5_SystemHelpers.srLog(3, `No lookup key provided for a lookup in the '${table}' translation table`);
      return game.i18n.localize(SR5.HBS_ErrorNoKeyGiven);;
    }
    const translatedTerm = game.i18n.localize(SR5[table][key]);
    if (!translatedTerm) {
      SR5_SystemHelpers.srLog(1, `No translation could be found for the '${key}' lookup key in the '${table}' translation table`);
      return null;
    }
    return translatedTerm;
  });

  Handlebars.registerHelper('valueOrDash', function () {
    let args = Array.from(arguments);
    args.pop(); // => options
    let value = args[0];
    if (value) return args.join("");
    else return "-";
  });

  Handlebars.registerHelper('findMultiplierValue', function (property, item) {
    let value;
    switch (property) {
      case "rating":
        value = item.data.itemRating;
        break;
      default:
        value = SR5_EntityHelpers.resolveObjectPath(`data.${property}.value`, item);
    }
    return value;
  });

  Handlebars.registerHelper('countObjects', function (array, objectType) {
    if (Array.isArray(array)) {
      let count = 0;
      for (let object of Object.values(array)) {
        if (objectType == '*' || object.data.type == objectType) count++;
      }
      return count;
    } else return 'ERR';
  });

  Handlebars.registerHelper('gainModifiersSum', function (property) {
    if (property.modifiers) {
      let additiveModifiers = property.modifiers.filter(m => (m.type.split("_").pop() == 'gain' && m.isMultiplier == false));
      let total = 0;
      for (let modifier of Object.values(additiveModifiers)) {
        total += modifier.value;
      }
      return total;
    } else return 'ERR';
  });

    Handlebars.registerHelper('lossModifiersSum', function (property) {
    if (property.modifiers) {
      let additiveModifiers = property.modifiers.filter(m => (m.type.split("_").pop() == 'loss' && m.isMultiplier == false));
      let total = 0;
      for (let modifier of Object.values(additiveModifiers)) {
        total += modifier.value;
      }
      return total;
    } else return 'ERR';
  });

  Handlebars.registerHelper('minus', function(a, b) {
    if (Number(a) !== a) throw new TypeError('expected the first argument to be a number');
    if (Number(b) !== b) throw new TypeError('expected the second argument to be a number');
    return Number(a) - Number(b);
  });

  Handlebars.registerHelper('autoLabel', function (str, limit) {
    if (typeof str !== 'string') return 'ERR (autoLabel)';
    if (typeof limit !== 'number' || str.length <= limit) {
      return game.i18n.localize(str);
    }
    if (limit == 1) return game.i18n.localize(str).slice(0, limit);
    return game.i18n.localize(str).slice(0, limit) + ".";
  });

  Handlebars.registerHelper('dropdownOptions', function () {
    let valueTypes = Array.from(arguments); valueTypes.pop(); // => options, ignoring it
    if (!valueTypes.length) { SR5_SystemHelpers.srLog(1, `No value types in 'dropdownOptions' HBS helper`); return; }
    let outputHTML = '<option class="SR-LightGreyColor" value="">' + game.i18n.localize('SR5.ChooseOne') + '</option>';
    for (let valueType of Object.values(valueTypes)) {
      if (SR5.customEffectsTypes[valueType] === undefined) { SR5_SystemHelpers.srLog(1, `Unknown ${valueType} value type in 'dropdownOptions' HBS helper`); return; }
      outputHTML += `<option value="${valueType}">${game.i18n.localize(SR5.customEffectsTypes[valueType])}</option>`;
    }
    return new Handlebars.SafeString(outputHTML);
  });

  Handlebars.registerHelper('endsWith', function (string, subString) {
    if (!string || !subString) { SR5_SystemHelpers.srLog(1, `Missing string or subString in 'endsWith' HBS helper`); return; }
    if (string.endsWith(subString))
      return true;
    return false;
  });

  Handlebars.registerHelper("includes", function (string, subString) {
    if (!string || !subString) {
      SR5_SystemHelpers.srLog(
        1,
        `Missing string or subString in 'includes' HBS helper`
      );
      return;
    }
    if (string.includes(subString)) return true;
    return false;
  });

  //Concat multiple strings or data to one string
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for(var arg in arguments){
        if(typeof arguments[arg]!='object'){
            outStr += arguments[arg];
        }
    }
    return outStr;
  });

};