//Customize Sheet section

export class SRActorSheetConfig {

  static async buildDialog(actor) {
    let dialogData = actor.system.sheetPreferences
    let actorData = foundry.utils.duplicate(actor.system)
    let template

    if (actor.type === "actorPc") template = "systems/sr5/templates/interface/sheetConfigActor.hbs"
    if (actor.type === "actorGrunt") template = "systems/sr5/templates/interface/sheetConfigGrunt.hbs"

    const dlg = await foundry.applications.handlebars.renderTemplate(template, dialogData)
    const result = await foundry.applications.api.DialogV2.wait({
      window: {
        title: game.i18n.localize('SR5.CharacterSheetCustomization') 
      },
      position: {
        width: 650 
      },
      content: dlg,
      buttons: [
        {
          action: "ok",
          label: "Ok",
          default: true,
          callback: (event, button, dialog) => ({
            action: "ok", element: dialog.element 
          }),
        },
        {
          action: "cancel",
          label: "Cancel",
          callback: () => ({
            action: "cancel" 
          }),
        },
      ],
      rejectClose: false,
      render: (event, dialog) => {
        const element = dialog.element
        const toggleSections = element.querySelectorAll(".toggleSection")

        // Initialize parent state
        for (const p of toggleSections) {
          const targetId = p.closest("ul")?.id
          const isChecked = element.querySelector(`#${p.id}`)?.checked ?? false
          const targetEl = element.querySelector(`#${targetId}`)
          if (isChecked) targetEl?.classList.remove("SR-LightGreyColor")
          else targetEl?.classList.add("SR-LightGreyColor")
        }

        // Toggle parent on click
        toggleSections.forEach(el => {
          el.addEventListener("click", ev => {
            const targetId = ev.currentTarget.closest("ul")?.id
            const elementId = ev.currentTarget.id
            const checkbox = element.querySelector(`#${elementId}`)
            const targetEl = element.querySelector(`#${targetId}`)
            if (checkbox?.checked) targetEl?.classList.remove("SR-LightGreyColor")
            else targetEl?.classList.add("SR-LightGreyColor")
          })
        })
      },
    })

    if (!result || result.action === "cancel") return

    const options = result.element.querySelectorAll("[name='option']")
    for (const o of options) {
      const isChecked = result.element.querySelector(`#${o.id}`)?.checked ?? false
      const path = "sheetPreferences." + o.value
      foundry.utils.setProperty(actorData, path, isChecked)
    }
    actor.update({
      "system": actorData
    })
  }

}
