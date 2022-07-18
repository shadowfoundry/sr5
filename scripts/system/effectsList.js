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
                }
        default: return null
    }
}