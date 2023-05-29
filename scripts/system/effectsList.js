//Return an effect item based on origin
export const _getSRStatusEffect = async function(origin, value) {
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
                statuses: ["dead"]
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
                statuses: ["unconscious"]
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
                statuses: ["prone"]
            }

        case "astralVision":
            return effect = {
                label: game.i18n.localize("SR5.AstralPerception"),
                origin: "astralVision",
                icon: "systems/sr5/img/status/StatusAstralVisionOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "astralVision"
                    }
                },
                statuses: ["astralVision"]
            }
        case "cover":
            return effect = {
                label: game.i18n.localize("SR5.Cover"),
                origin: "cover",
                icon: "systems/sr5/img/status/StatusCover.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "cover"
                    }
                },
                statuses: ["cover"]
            }
        case "coverFull":
            return effect = {
                label: game.i18n.localize("SR5.CoverFull"),
                origin: "coverFull",
                icon: "systems/sr5/img/status/StatusCoverFull.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "coverFull"
                    }
                },
                statuses: ["coverFull"]
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
                statuses: ["fireDamage"]
            }
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
                statuses: ["acidDamage"]
            }
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
                statuses: ["electricityDamage"]
            }
        case "anticoagulantDamage":
            return effect = {
                label: game.i18n.localize("SR5.Anticoagulant"),
                origin: "anticoagulantDamage",
                icon: "systems/sr5/img/status/StatusAnticoagulantOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "anticoagulantDamage",
                    }
                },
                statuses: ["anticoagulantDamage"]
            }
        case "fullDefense":
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
                statuses: ["fullDefense"]
            }
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
                statuses: ["sensorLock"]
            }
        case "linkLock":
            return effect = {
                label: game.i18n.localize("SR5.EffectLinkLockedConnection"),
                origin: "linkLock",
                icon: "systems/sr5/img/status/StatusLinkLock.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "linkLock"
                    }
                },
                statuses: ["linkLock"]
            }
        case "signalJam":
            return effect = {
                label: game.i18n.localize("SR5.EffectSignalJam"),
                origin: "signalJam",
                icon: "systems/sr5/img/status/StatusJamSignalsOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "signalJam",
                        value: value,
                    }
                },
                statuses: ["signalJam"]
            }
        case "signalJammed":
            return effect = {
                label: game.i18n.localize("SR5.EffectSignalJammed"),
                origin: "signalJammed",
                icon: "systems/sr5/img/status/StatusJammedSignalsOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "signalJammed",
                        value: value,
                    }
                },
                statuses: ["signalJammed"]
            }
        case "noAction":
            return effect = {
                label: game.i18n.localize("SR5.EffectNoAction"),
                origin: "noAction",
                icon: "systems/sr5/img/status/StatusNoActionOn.svg",
                flags: {
                    core: {
                        active: true,
                        overlay: true,
                        statusId: "noAction",
                    }
                },
                statuses: ["noAction"]
            }
        case "toxinEffectNausea":
            return effect = {
                label: game.i18n.localize("SR5.ToxinEffectNausea"),
                origin: "toxinEffectNausea",
                icon: "systems/sr5/img/status/StatusNauseaOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "toxinEffectNausea",
                    }
                },
                statuses: ["toxinEffectNausea"]
            }
        case "toxinEffectDisorientation":
            return effect = {
                label: game.i18n.localize("SR5.ToxinEffectDisorientation"),
                origin: "toxinEffectDisorientation",
                icon: "systems/sr5/img/status/StatusDisorientationOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "toxinEffectDisorientation",
                    }
                },
                statuses: ["toxinEffectDisorientation"]
            }
        case "toxinEffectAgony":
            return effect = {
                label: game.i18n.localize("SR5.ToxinEffectAgony"),
                origin: "toxinEffectAgony",
                icon: "systems/sr5/img/status/StatusAgonyOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "toxinEffectAgony",
                    }
                },
                statuses: ["toxinEffectAgony"]
            }
        case "toxinEffectArcaneInhibitor":
            return effect = {
                label: game.i18n.localize("SR5.ToxinEffectArcaneInhibitor"),
                origin: "toxinEffectArcaneInhibitor",
                icon: "systems/sr5/img/status/StatusArcaneInhibtorOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "toxinEffectArcaneInhibitor",
                    }
                },
                statuses: ["toxinEffectArcaneInhibitor"]
            }
        case "astralInit":
            return effect = {
                label: game.i18n.localize('SR5.InitiativeAstral'),
                origin: "initiativeMode",
                icon: "systems/sr5/img/status/StatusInitAstalOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "astralInit",
                    }
                },
                statuses: ["astralInit"]
            }
        case "matrixInit":
            return effect = {
                label: game.i18n.localize('SR5.InitiativeMatrix'),
                origin: "initiativeMode",
                icon: "systems/sr5/img/status/StatusInitMatrixOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "matrixInit",
                    }
                },
                statuses: ["matrixInit"]
            }
        case "slowed":
            return effect = {
                label: game.i18n.localize('SR5.STATUSES_Slowed'),
                origin: "slowed",
                icon: "systems/sr5/img/status/StatusSlowedOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "slowed",
                    }
                },
                statuses: ["slowed"]
            }
            case "winded":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Winded'),
                    origin: "winded",
                    icon: "systems/sr5/img/status/StatusWindedOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "winded",
                        }
                    },
                    statuses: ["winded"]
                }
            case "deafened":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Deafened'),
                    origin: "deafened",
                    icon: "systems/sr5/img/status/StatusDeafenedOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "deafened",
                        }
                    },
                    statuses: ["deafened"]
                }
            case "blinded":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Blinded'),
                    origin: "blinded",
                    icon: "systems/sr5/img/status/StatusBlindedOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "blinded",
                        }
                    },
                    statuses: ["blinded"]
                }
            case "brokenGrip":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_BrokenGrip'),
                    origin: "brokenGrip",
                    icon: "systems/sr5/img/status/StatusBrokenGripOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "brokenGrip",
                        }
                    },
                    statuses: ["brokenGrip"]
                }
        case "weakSide":
            return effect = {
                label: game.i18n.localize('SR5.STATUSES_WeakSide'),
                origin: "weakSide",
                icon: "systems/sr5/img/status/StatusWeakSideOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "weakSide",
                    }
                },
                statuses: ["weakSide"]
            }
            case "nauseous":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Nauseous'),
                    origin: "nauseous",
                    icon: "systems/sr5/img/status/StatusNauseousOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "nauseous",
                        }
                    },
                    statuses: ["nauseous"]
                }
            case "buckled":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Buckled'),
                    origin: "buckled",
                    icon: "systems/sr5/img/status/StatusBuckledOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "buckled",
                        }
                    },
                    statuses: ["buckled"]
                }
        case "slowDeath":
            return effect = {
                label: game.i18n.localize('SR5.STATUSES_SlowDeath'),
                origin: "slowDeath",
                icon: "systems/sr5/img/status/StatusSlowDeathOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "slowDeath",
                    }
                },
                statuses: ["slowDeath"]
            }
            case "unableToSpeak":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_UnableToSpeak'),
                    origin: "unableToSpeak",
                    icon: "systems/sr5/img/status/StatusUnableToSpeakOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "unableToSpeak",
                        }
                    },
                    statuses: ["unableToSpeak"]
                }
        case "bleedOut":
            return effect = {
                label: game.i18n.localize('SR5.STATUSES_BleedOut'),
                origin: "bleedOut",
                icon: "systems/sr5/img/status/StatusBleedOutOn.svg",
                flags: {
                    core: {
                        active: true,
                        statusId: "bleedOut",
                    }
                },
                statuses: ["bleedOut"]
            }
            case "oneArmBandit":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_OneArmBandit'),
                    origin: "oneArmBandit",
                    icon: "systems/sr5/img/status/StatusOneArmBanditOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "oneArmBandit",
                        }
                    },
                    statuses: ["oneArmBandit"]
                }
            case "pin":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Pin'),
                    origin: "pin",
                    icon: "systems/sr5/img/status/StatusPinOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "pin",
                        }
                    },
                    statuses: ["pin"]
                }
            case "dirtyTrick":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_DirtyTrick'),
                    origin: "dirtyTrick",
                    icon: "systems/sr5/img/status/StatusDirtyTrickOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "dirtyTrick",
                        }
                    },
                    statuses: ["dirtyTrick"]
                }
            case "trickShot":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_TrickShot'),
                    origin: "trickShot",
                    icon: "systems/sr5/img/status/StatusTrickShotOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "trickShot",
                        }
                    },
                    statuses: ["trickShot"]
                }
            case "entanglement":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Entanglement'),
                    origin: "entanglement",
                    icon: "systems/sr5/img/status/StatusEntanglementOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "entanglement",
                        }
                    },
                    statuses: ["entanglement"]
                }
            case "antenna":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Antenna'),
                    origin: "antenna",
                    icon: "systems/sr5/img/status/StatusAntennaOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "antenna",
                        }
                    },
                    statuses: ["antenna"]
                }
            case "engineBlock":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_EngineBlock'),
                    origin: "engineBlock",
                    icon: "systems/sr5/img/status/StatusEngineBlockOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "engineBlock",
                            overlay: true,
                        }
                    },
                    statuses: ["engineBlock"]
                }
            case "windowMotor":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_WindowMotor'),
                    origin: "windowMotor",
                    icon: "systems/sr5/img/status/StatusWindowMotorOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "windowMotor",
                        }
                    },
                    statuses: ["windowMotor"]
                }
            case "doorLock":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_DoorLock'),
                    origin: "doorLock",
                    icon: "systems/sr5/img/status/StatusDoorLockOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "doorLock",
                        }
                    },
                    statuses: ["doorLock"]
                }
            case "axle":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Axle'),
                    origin: "axle",
                    icon: "systems/sr5/img/status/StatusAxleOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "axle",
                        }
                    },
                    statuses: ["axle"]
                }
            case "fuelTankBattery":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_FuelTankBattery'),
                    origin: "fuelTankBattery",
                    icon: "systems/sr5/img/status/StatusFuelTankBatteryOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "fuelTankBattery",
                            overlay: true,
                        }
                    },
                    statuses: ["fuelTankBattery"]
                }
            case "flared":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Flared'),
                    origin: "flared",
                    icon: "systems/sr5/img/status/StatusFlaredOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "flared",
                        }
                    },
                    statuses: ["flared"]
                }
            case "shaked":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Shaked'),
                    origin: "shaked",
                    icon: "systems/sr5/img/status/StatusShakedOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "shaked",
                        }
                    },
                    statuses: ["shaked"]
                }
            case "onPinsAndNeedles":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_OnPinsAndNeedles'),
                    origin: "onPinsAndNeedles",
                    icon: "systems/sr5/img/status/StatusOnPinsAndNeedlesOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "onPinsAndNeedles",
                        }
                    },
                    statuses: ["onPinsAndNeedles"]
                }
            case "feint":
                return effect = {
                    label: game.i18n.localize('SR5.STATUSES_Feint'),
                    origin: "feint",
                    icon: "systems/sr5/img/status/StatusFeintOn.svg",
                    flags: {
                        core: {
                            active: true,
                            statusId: "feint",
                        }
                    },
                    statuses: ["feint"]
                }
        default: return null
    }
}