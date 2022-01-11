//Return an effect item based on origin
export const _getSRStatusEffect = async function(origin) {
    let effect;

    switch (origin){
        case "dead": 
            return effect = {
                label: game.i18n.localize("SR5.STATUSES_Dead_F"),
                origin: "dead",
                icon: "systems/sr5/img/status/StatusDeadOn.svg",
                flags: {
                    core: {
                        active: true,
                        overlay: true,
                        statusId: "dead"
                    }
                },
            }

        case "unconscious" :
            return effect = {
                label: game.i18n.localize("SR5.STATUSES_Unconscious_F"),
                origin: "unconscious",
                icon: "systems/sr5/img/status/StatusUnconsciousOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "unconscious"
                    }
                },
            }
        
        case "prone":
            return effect = {
                label: game.i18n.localize("SR5.STATUSES_Prone"),
                origin: "prone",
                icon: "systems/sr5/img/status/StatusProneOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "prone"
                    }
                },
            }

        case "handleVisionAstral":
            return effect = {
                label: game.i18n.localize("SR5.AstralPerception"),
                origin: "handleVisionAstral",
                icon: "systems/sr5/img/status/StatusAstralVisionOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "astralVision"
                    }
                },
            }
            
        case "fireDamage":
            return effect = {
                label: game.i18n.localize("SR5.CatchFire"),
                origin: "fireDamage",
                icon: "systems/sr5/img/status/StatusInFireOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "fireDamage"
                    }
                },
            }
            break;
        case "acidDamage":
            return effect = {
                label: game.i18n.localize("SR5.ElementalDamageAcid"),
                origin: "acidDamage",
                icon: "systems/sr5/img/status/StatusAcidOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "acidDamage"
                    }
                },
            }
            break;
        case "electricityDamage":
            return effect = {
                label: game.i18n.localize("SR5.ElementalDamageElectricity"),
                origin: "electricityDamage",
                icon: "systems/sr5/img/status/StatusElectricityOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "electricityDamage"
                    }
                },
            }
            break;
        case "fullDefenseMode":
            return effect = {
                label: game.i18n.localize("SR5.FullDefense"),
                origin: "fullDefense",
                icon: "systems/sr5/img/status/StatusFullDefense.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "fullDefense"
                    }
                },
            }
            break;
        case "sensorLock":
            return effect = {
                label: game.i18n.localize("SR5.EffectSensorLock"),
                origin: "sensorLock",
                icon: "systems/sr5/img/status/StatusSensorLock.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "sensorLock"
                    }
                },
            }
            break;
        default: return null
    }
}