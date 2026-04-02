import * as macros from "../interface/macros.js"

export function sr5HookHotbarDrop(bar, data, slot) {
  switch (data.type){
    case "Item":
      macros.createSR5MacroItem(data, slot)
      return false
    case "Skill":
    case "MatrixAction":
    case "ResonanceAction":
      macros.createSR5Macro(data, slot)
      return false
    default:
      return
  }
}
