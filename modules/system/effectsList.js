//Return an effect item based on origin
export const _getSRStatusEffect = async function(origin, value) {
  switch (origin){
    case "dead": 
      return {
        name: game.i18n.localize("SR5.STATUSES_Dead_F"),
        origin: "dead",
        icon: "systems/sr5/assets/img/status/StatusDeadOn.svg",
        flags: {
          core: {
            active: true,
            overlay: true,
          }
        },
        statuses: ["dead"]
      }

    case "unconscious" :
      return {
        name: game.i18n.localize("SR5.STATUSES_Unconscious_F"),
        origin: "unconscious",
        icon: "systems/sr5/assets/img/status/StatusUnconsciousOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["unconscious"]
      }
        
    case "prone":
      return {
        name: game.i18n.localize("SR5.STATUSES_Prone"),
        origin: "prone",
        icon: "systems/sr5/assets/img/status/StatusProneOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["prone"]
      }

    case "astralVision":
      return {
        name: game.i18n.localize("SR5.AstralPerception"),
        origin: "astralVision",
        icon: "systems/sr5/assets/img/status/StatusAstralVisionOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["astralVision"]
      }
    case "cover":
      return {
        name: game.i18n.localize("SR5.Cover"),
        origin: "cover",
        icon: "systems/sr5/assets/img/status/StatusCover.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["cover"]
      }
    case "coverFull":
      return {
        name: game.i18n.localize("SR5.CoverFull"),
        origin: "coverFull",
        icon: "systems/sr5/assets/img/status/StatusCoverFull.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["coverFull"]
      }
    case "fireDamage":
      return {
        name: game.i18n.localize("SR5.CatchFire"),
        origin: "fireDamage",
        icon: "systems/sr5/assets/img/status/StatusInFireOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["fireDamage"]
      }
    case "acidDamage":
      return {
        name: game.i18n.localize("SR5.ElementalDamageAcid"),
        origin: "acidDamage",
        icon: "systems/sr5/assets/img/status/StatusAcidOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["acidDamage"]
      }
    case "electricityDamage":
      return {
        name: game.i18n.localize("SR5.ElementalDamageElectricity"),
        origin: "electricityDamage",
        icon: "systems/sr5/assets/img/status/StatusElectricityOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["electricityDamage"]
      }
    case "anticoagulantDamage":
      return {
        name: game.i18n.localize("SR5.Anticoagulant"),
        origin: "anticoagulantDamage",
        icon: "systems/sr5/assets/img/status/StatusAnticoagulantOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["anticoagulantDamage"]
      }
    case "fullDefense":
      return {
        name: game.i18n.localize("SR5.FullDefense"),
        origin: "fullDefense",
        icon: "systems/sr5/assets/img/status/StatusFullDefense.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["fullDefense"]
      }
    case "sensorLock":
      return {
        name: game.i18n.localize("SR5.EffectSensorLock"),
        origin: "sensorLock",
        icon: "systems/sr5/assets/img/status/StatusSensorLock.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["sensorLock"]
      }
    case "linkLock":
      return {
        name: game.i18n.localize("SR5.EffectLinkLockedConnection"),
        origin: "linkLock",
        icon: "systems/sr5/assets/img/status/StatusLinkLock.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["linkLock"]
      }
    case "signalJam":
      return {
        name: game.i18n.localize("SR5.EffectSignalJam"),
        origin: "signalJam",
        icon: "systems/sr5/assets/img/status/StatusJamSignalsOn.svg",
        flags: {
          core: {
            active: true,
            value: value,
          }
        },
        statuses: ["signalJam"]
      }
    case "signalJammed":
      return {
        name: game.i18n.localize("SR5.EffectSignalJammed"),
        origin: "signalJammed",
        icon: "systems/sr5/assets/img/status/StatusJammedSignalsOn.svg",
        flags: {
          core: {
            active: true,
            value: value,
          }
        },
        statuses: ["signalJammed"]
      }
    case "noAction":
      return {
        name: game.i18n.localize("SR5.EffectNoAction"),
        origin: "noAction",
        icon: "systems/sr5/assets/img/status/StatusNoActionOn.svg",
        flags: {
          core: {
            active: true,
            overlay: true,
          }
        },
        statuses: ["noAction"]
      }
    case "toxinEffectNausea":
      return {
        name: game.i18n.localize("SR5.ToxinEffectNausea"),
        origin: "toxinEffectNausea",
        icon: "systems/sr5/assets/img/status/StatusNauseaOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["toxinEffectNausea"]
      }
    case "toxinEffectDisorientation":
      return {
        name: game.i18n.localize("SR5.ToxinEffectDisorientation"),
        origin: "toxinEffectDisorientation",
        icon: "systems/sr5/assets/img/status/StatusDisorientationOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["toxinEffectDisorientation"]
      }
    case "toxinEffectAgony":
      return {
        name: game.i18n.localize("SR5.ToxinEffectAgony"),
        origin: "toxinEffectAgony",
        icon: "systems/sr5/assets/img/status/StatusAgonyOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["toxinEffectAgony"]
      }
    case "toxinEffectArcaneInhibitor":
      return {
        name: game.i18n.localize("SR5.ToxinEffectArcaneInhibitor"),
        origin: "toxinEffectArcaneInhibitor",
        icon: "systems/sr5/assets/img/status/StatusArcaneInhibtorOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["toxinEffectArcaneInhibitor"]
      }
    case "astralInit":
      return {
        name: game.i18n.localize('SR5.InitiativeAstral'),
        origin: "initiativeMode",
        icon: "systems/sr5/assets/img/status/StatusInitAstalOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["astralInit"]
      }
    case "matrixInit":
      return {
        name: game.i18n.localize('SR5.InitiativeMatrix'),
        origin: "initiativeMode",
        icon: "systems/sr5/assets/img/status/StatusInitMatrixOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["matrixInit"]
      }
    case "slowed":
      return {
        name: game.i18n.localize('SR5.STATUSES_Slowed'),
        origin: "slowed",
        icon: "systems/sr5/assets/img/status/StatusSlowedOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["slowed"]
      }
    case "winded":
      return {
        name: game.i18n.localize('SR5.STATUSES_Winded'),
        origin: "winded",
        icon: "systems/sr5/assets/img/status/StatusWindedOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["winded"]
      }
    case "deafened":
      return {
        name: game.i18n.localize('SR5.STATUSES_Deafened'),
        origin: "deafened",
        icon: "systems/sr5/assets/img/status/StatusDeafenedOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["deafened"]
      }
    case "blinded":
      return {
        name: game.i18n.localize('SR5.STATUSES_Blinded'),
        origin: "blinded",
        icon: "systems/sr5/assets/img/status/StatusBlindedOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["blinded"]
      }
    case "brokenGrip":
      return {
        name: game.i18n.localize('SR5.STATUSES_BrokenGrip'),
        origin: "brokenGrip",
        icon: "systems/sr5/assets/img/status/StatusBrokenGripOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["brokenGrip"]
      }
    case "weakSide":
      return {
        name: game.i18n.localize('SR5.STATUSES_WeakSide'),
        origin: "weakSide",
        icon: "systems/sr5/assets/img/status/StatusWeakSideOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["weakSide"]
      }
    case "nauseous":
      return {
        name: game.i18n.localize('SR5.STATUSES_Nauseous'),
        origin: "nauseous",
        icon: "systems/sr5/assets/img/status/StatusNauseousOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["nauseous"]
      }
    case "buckled":
      return {
        name: game.i18n.localize('SR5.STATUSES_Buckled'),
        origin: "buckled",
        icon: "systems/sr5/assets/img/status/StatusBuckledOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["buckled"]
      }
    case "slowDeath":
      return {
        name: game.i18n.localize('SR5.STATUSES_SlowDeath'),
        origin: "slowDeath",
        icon: "systems/sr5/assets/img/status/StatusSlowDeathOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["slowDeath"]
      }
    case "unableToSpeak":
      return {
        name: game.i18n.localize('SR5.STATUSES_UnableToSpeak'),
        origin: "unableToSpeak",
        icon: "systems/sr5/assets/img/status/StatusUnableToSpeakOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["unableToSpeak"]
      }
    case "bleedOut":
      return {
        name: game.i18n.localize('SR5.STATUSES_BleedOut'),
        origin: "bleedOut",
        icon: "systems/sr5/assets/img/status/StatusBleedOutOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["bleedOut"]
      }
    case "oneArmBandit":
      return {
        name: game.i18n.localize('SR5.STATUSES_OneArmBandit'),
        origin: "oneArmBandit",
        icon: "systems/sr5/assets/img/status/StatusOneArmBanditOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["oneArmBandit"]
      }
    case "pin":
      return {
        name: game.i18n.localize('SR5.STATUSES_Pin'),
        origin: "pin",
        icon: "systems/sr5/assets/img/status/StatusPinOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["pin"]
      }
    case "dirtyTrick":
      return {
        name: game.i18n.localize('SR5.STATUSES_DirtyTrick'),
        origin: "dirtyTrick",
        icon: "systems/sr5/assets/img/status/StatusDirtyTrickOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["dirtyTrick"]
      }
    case "trickShot":
      return {
        name: game.i18n.localize('SR5.STATUSES_TrickShot'),
        origin: "trickShot",
        icon: "systems/sr5/assets/img/status/StatusTrickShotOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["trickShot"]
      }
    case "entanglement":
      return {
        name: game.i18n.localize('SR5.STATUSES_Entanglement'),
        origin: "entanglement",
        icon: "systems/sr5/assets/img/status/StatusEntanglementOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["entanglement"]
      }
    case "antenna":
      return {
        name: game.i18n.localize('SR5.STATUSES_Antenna'),
        origin: "antenna",
        icon: "systems/sr5/assets/img/status/StatusAntennaOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["antenna"]
      }
    case "engineBlock":
      return {
        name: game.i18n.localize('SR5.STATUSES_EngineBlock'),
        origin: "engineBlock",
        icon: "systems/sr5/assets/img/status/StatusEngineBlockOn.svg",
        flags: {
          core: {
            active: true,
            overlay: true,
          }
        },
        statuses: ["engineBlock"]
      }
    case "windowMotor":
      return {
        name: game.i18n.localize('SR5.STATUSES_WindowMotor'),
        origin: "windowMotor",
        icon: "systems/sr5/assets/img/status/StatusWindowMotorOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["windowMotor"]
      }
    case "doorLock":
      return {
        name: game.i18n.localize('SR5.STATUSES_DoorLock'),
        origin: "doorLock",
        icon: "systems/sr5/assets/img/status/StatusDoorLockOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["doorLock"]
      }
    case "axle":
      return {
        name: game.i18n.localize('SR5.STATUSES_Axle'),
        origin: "axle",
        icon: "systems/sr5/assets/img/status/StatusAxleOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["axle"]
      }
    case "fuelTankBattery":
      return {
        name: game.i18n.localize('SR5.STATUSES_FuelTankBattery'),
        origin: "fuelTankBattery",
        icon: "systems/sr5/assets/img/status/StatusFuelTankBatteryOn.svg",
        flags: {
          core: {
            active: true,
            overlay: true,
          }
        },
        statuses: ["fuelTankBattery"]
      }
    case "flared":
      return {
        name: game.i18n.localize('SR5.STATUSES_Flared'),
        origin: "flared",
        icon: "systems/sr5/assets/img/status/StatusFlaredOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["flared"]
      }
    case "shaked":
      return {
        name: game.i18n.localize('SR5.STATUSES_Shaked'),
        origin: "shaked",
        icon: "systems/sr5/assets/img/status/StatusShakedOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["shaked"]
      }
    case "onPinsAndNeedles":
      return {
        name: game.i18n.localize('SR5.STATUSES_OnPinsAndNeedles'),
        origin: "onPinsAndNeedles",
        icon: "systems/sr5/assets/img/status/StatusOnPinsAndNeedlesOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["onPinsAndNeedles"]
      }
    case "feint":
      return {
        name: game.i18n.localize('SR5.STATUSES_Feint'),
        origin: "feint",
        icon: "systems/sr5/assets/img/status/StatusFeintOn.svg",
        flags: {
          core: {
            active: true
          }
        },
        statuses: ["feint"]
      }
    default: return null
  }
}