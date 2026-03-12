export default class SR5_SpendDialog {

  static async create({title, content, data, buttons, onOk}) {
    const dialogData = data

    return foundry.applications.api.DialogV2.wait({
      window: { title },
      content,
      buttons: [
        {
          action: "ok",
          label: buttons.ok?.label ?? "Ok",
          default: true,
          callback: (event, button, dialog) => {
            if (onOk) onOk()
            return { action: "ok", element: dialog.element }
          },
        },
        {
          action: "cancel",
          label: buttons.cancel?.label ?? "Cancel",
          callback: () => ({ action: "cancel" }),
        },
      ],
      rejectClose: false,
      render: (event, dialog) => {
        const element = dialog.element
        element.querySelectorAll('[name="chooseSpendNetHits"]').forEach(el => {
          el.addEventListener("change", ev => {
            const numberChecked = element.querySelectorAll("[name='checkDisposableHitsEffects']:checked").length
            if (numberChecked > dialogData.disposableHits) {
              ev.target.checked = false
              ui.notifications.warn(game.i18n.format('SR5.WARN_NoMoreHitsToSpend'))
            } else {
              const field = element.querySelector('[name="disposableHits"]')
              if (field) field.value = dialogData.disposableHits - numberChecked
            }
          })
        })
      },
    })
  }

}
