import {
  sr5ModsPartialModel
} from '../../common/mods.js'

export class matrixPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields
    return {
      matrix: new fields.SchemaField(matrixPartialModel.matrixFields())
    }
  }

  /** Returns the inner matrix field definitions (fresh instances each call). */
  static matrixFields() {
    const fields = foundry.data.fields

    const dicePoolSchema = () => new fields.SchemaField({
      dicePool: new fields.NumberField({
        initial: 0
      }),
      base: new fields.NumberField({
        initial: 0
      }),
      modifiers: new fields.ArrayField(new fields.ObjectField()),
    })

    const fullActionSchema = (actionType, source, increaseOverwatchScore, neededMarks, linkedAttribute) => new fields.SchemaField({
      actionType: new fields.StringField({
        initial: actionType
      }),
      source: new fields.StringField({
        initial: source
      }),
      increaseOverwatchScore: new fields.BooleanField({
        initial: increaseOverwatchScore
      }),
      neededMarks: typeof neededMarks === 'string' ? new fields.StringField({
        initial: neededMarks
      }) : new fields.NumberField({
        initial: neededMarks
      }),
      specialization: new fields.BooleanField({
        initial: false
      }),
      test: dicePoolSchema(),
      limit: new fields.SchemaField({
        base: new fields.NumberField({
          initial: 0
        }),
        value: new fields.NumberField({
          initial: 0
        }),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
        linkedAttribute: new fields.StringField({
          initial: linkedAttribute
        }),
      }),
      defense: dicePoolSchema(),
    })

    const simpleActionSchema = (actionType, neededMarks) => new fields.SchemaField({
      actionType: new fields.StringField({
        initial: actionType
      }),
      neededMarks: new fields.NumberField({
        initial: neededMarks
      }),
    })

    const resonanceTestActionSchema = (actionType, increaseOverwatchScore) => new fields.SchemaField({
      actionType: new fields.StringField({
        initial: actionType
      }),
      increaseOverwatchScore: new fields.BooleanField({
        initial: increaseOverwatchScore
      }),
      neededMarks: new fields.NumberField({
        initial: 0
      }),
      specialization: new fields.BooleanField({
        initial: false
      }),
      test: dicePoolSchema(),
    })

    const resonanceLimitActionSchema = (actionType, increaseOverwatchScore, limitBase) => new fields.SchemaField({
      actionType: new fields.StringField({
        initial: actionType
      }),
      increaseOverwatchScore: new fields.BooleanField({
        initial: increaseOverwatchScore
      }),
      specialization: new fields.BooleanField({
        initial: false
      }),
      neededMarks: new fields.NumberField({
        initial: 0
      }),
      test: dicePoolSchema(),
      limit: new fields.SchemaField({
        base: new fields.StringField({
          initial: limitBase
        }),
        value: new fields.NumberField({
          initial: 0
        }),
        modifiers: new fields.ArrayField(new fields.ObjectField()),
      }),
    })

    const resonanceSimpleActionSchema = (actionType, increaseOverwatchScore) => new fields.SchemaField({
      actionType: new fields.StringField({
        initial: actionType
      }),
      increaseOverwatchScore: new fields.BooleanField({
        initial: increaseOverwatchScore
      }),
      neededMarks: new fields.NumberField({
        initial: 0
      }),
    })

    const programSchema = () => new fields.SchemaField({
      isActive: new fields.BooleanField({
        initial: false
      })
    })

    return {
      userMode: new fields.StringField({
        initial: 'ar'
      }),
      userGrid: new fields.StringField({
        initial: 'local'
      }),
      attributesCollection: new fields.SchemaField({
        value1: new fields.NumberField({
          initial: 0
        }),
        value2: new fields.NumberField({
          initial: 0
        }),
        value3: new fields.NumberField({
          initial: 0
        }),
        value4: new fields.NumberField({
          initial: 0
        }),
        value1isSet: new fields.BooleanField({
          initial: false
        }),
        value2isSet: new fields.BooleanField({
          initial: false
        }),
        value3isSet: new fields.BooleanField({
          initial: false
        }),
        value4isSet: new fields.BooleanField({
          initial: false
        }),
      }),
      attributes: new fields.SchemaField({
        attack: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        dataProcessing: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        firewall: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        noiseReduction: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        sharing: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
        sleaze: new fields.SchemaField({
          ...sr5ModsPartialModel.defineSchema()
        }),
      }),
      complexFormList: new fields.ObjectField(),
      deviceRating: new fields.NumberField({
        initial: 0
      }),
      deviceType: new fields.StringField({
        initial: ''
      }),
      deviceSubType: new fields.StringField({
        initial: ''
      }),
      deviceName: new fields.StringField({
        initial: ''
      }),
      isLinkLocked: new fields.BooleanField({
        initial: false
      }),
      isJamming: new fields.BooleanField({
        initial: false
      }),
      hasLocalAutosoftRunning: new fields.BooleanField({
        initial: false
      }),
      runningSilent: new fields.BooleanField({
        initial: false
      }),
      overwatchScore: new fields.NumberField({
        initial: 0
      }),
      concentration: new fields.BooleanField({
        initial: false
      }),
      programsCurrentActive: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema()
      }),
      programsMaximumActive: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema()
      }),
      programs: new fields.SchemaField({
        armor: programSchema(),
        babyMonitor: programSchema(),
        biofeedback: programSchema(),
        biofeedbackFilter: programSchema(),
        blackout: programSchema(),
        browse: programSchema(),
        configurator: programSchema(),
        decryption: programSchema(),
        defuse: programSchema(),
        demolition: programSchema(),
        edit: programSchema(),
        encryption: programSchema(),
        exploit: programSchema(),
        fork: programSchema(),
        guard: programSchema(),
        hammer: programSchema(),
        lockdown: programSchema(),
        mugger: programSchema(),
        shell: programSchema(),
        signalScrub: programSchema(),
        sneak: programSchema(),
        stealth: programSchema(),
        toolbox: programSchema(),
        track: programSchema(),
        virtualMachine: programSchema(),
        wrapper: programSchema(),
        clearsight: programSchema(),
        electronicWarfare: programSchema(),
        evasion: programSchema(),
        maneuvering: programSchema(),
        stealthAutosoft: programSchema(),
        targeting: programSchema(),
      }),
      resistances: new fields.SchemaField({
        biofeedback: dicePoolSchema(),
        dataBomb: dicePoolSchema(),
        dumpshock: dicePoolSchema(),
        fading: dicePoolSchema(),
        matrixDamage: dicePoolSchema(),
      }),
      marks: new fields.ArrayField(new fields.ObjectField()),
      markedItems: new fields.ArrayField(new fields.ObjectField()),
      actions: new fields.SchemaField({
        jamSignals: fullActionSchema('complex', 'core', true, 4, 'attack'),
        controlDevice: fullActionSchema('special', 'core', true, 'S', 'sleaze'),
        disarmDataBomb: fullActionSchema('complex', 'core', false, 0, 'firewall'),
        editFile: fullActionSchema('complex', 'core', false, 1, 'dataProcessing'),
        eraseMark: fullActionSchema('complex', 'core', true, '3', 'attack'),
        eraseMatrixSignature: fullActionSchema('complex', 'core', true, '0', 'attack'),
        formatDevice: fullActionSchema('complex', 'core', true, 3, 'sleaze'),
        snoop: fullActionSchema('complex', 'core', true, 1, 'sleaze'),
        hackOnTheFly: fullActionSchema('complex', 'core', true, 0, 'sleaze'),
        spoofCommand: fullActionSchema('complex', 'core', true, 1, 'sleaze'),
        garbageInGarbageOut: fullActionSchema('complex', 'core', true, 3, 'sleaze'),
        bruteForce: fullActionSchema('complex', 'core', true, 0, 'attack'),
        matrixPerception: fullActionSchema('complex', 'core', false, 0, 'dataProcessing'),
        dataSpike: fullActionSchema('complex', 'core', true, 0, 'attack'),
        crackFile: fullActionSchema('complex', 'core', true, 1, 'attack'),
        crashProgram: fullActionSchema('complex', 'core', true, 1, 'attack'),
        jumpIntoRiggedDevice: fullActionSchema('complex', 'core', false, 3, 'dataProcessing'),
        setDataBomb: fullActionSchema('complex', 'core', true, 1, 'sleaze'),
        rebootDevice: fullActionSchema('complex', 'core', false, 3, 'dataProcessing'),
        matrixSearch: fullActionSchema('special', 'core', false, 'S', 'dataProcessing'),
        trackback: fullActionSchema('special', 'core', false, 4, 'dataProcessing'),
        hide: fullActionSchema('complex', 'core', true, 0, 'sleaze'),
        jackOut: fullActionSchema('simple', 'core', false, 4, 'firewall'),
        traceIcon: fullActionSchema('complex', 'core', false, 2, 'dataProcessing'),
        checkOverwatchScore: fullActionSchema('simple', 'core', true, 0, 'sleaze'),
        calibration: fullActionSchema('simple', 'killCode', false, 1, 'dataProcessing'),
        denialOfService: fullActionSchema('simple', 'killCode', true, 0, 'attack'),
        iAmTheFirewall: fullActionSchema('interruption', 'killCode', false, 0, 'dataProcessing'),
        haywire: fullActionSchema('complex', 'killCode', true, 0, 'attack'),
        intervene: fullActionSchema('interruption', 'killCode', false, 0, 'dataProcessing'),
        masquerade: fullActionSchema('complex', 'killCode', true, 2, 'sleaze'),
        popupHacking: fullActionSchema('simple', 'killCode', true, 1, 'sleaze'),
        popupCybercombat: fullActionSchema('simple', 'killCode', true, 1, 'sleaze'),
        squelch: fullActionSchema('simple', 'killCode', true, 0, 'attack'),
        subvertInfrastructure: fullActionSchema('complex', 'killCode', true, 1, 'sleaze'),
        tag: fullActionSchema('simple', 'killCode', false, 0, 'dataProcessing'),
        watchdog: fullActionSchema('complex', 'killCode', true, 0, 'sleaze'),
        breakTargetLock: fullActionSchema('simple', 'rigger5', false, 0, 'dataProcessing'),
        confusePilot: fullActionSchema('complex', 'rigger5', true, 0, 'attack'),
        detectTargetLock: fullActionSchema('free', 'rigger5', false, 4, 'dataProcessing'),
        suppressNoise: fullActionSchema('complex', 'rigger5', false, 4, 'dataProcessing'),
        targetDevice: fullActionSchema('complex', 'rigger5', false, 0, 'dataProcessing'),
        changeIcon: simpleActionSchema('simple', 4),
        enterOrExitHost: simpleActionSchema('complex', 1),
        gridHop: simpleActionSchema('complex', 0),
        inviteMark: simpleActionSchema('simple', 4),
        sendMessage: simpleActionSchema('simple', 0),
        switchInterfaceMode: simpleActionSchema('simple', 4),
        loadProgram: simpleActionSchema('free', 0),
        switchTwoMatrixAttributes: simpleActionSchema('free', 0),
        swapTwoPrograms: simpleActionSchema('free', 0),
        unloadProgram: simpleActionSchema('free', 0),
      }),
      resonanceActions: new fields.SchemaField({
        callOrDismissSprite: resonanceSimpleActionSchema('simple', false),
        commandSprite: resonanceSimpleActionSchema('simple', false),
        compileSprite: resonanceTestActionSchema('complex', false),
        decompileSprite: resonanceLimitActionSchema('complex', false, 'socialLimit'),
        eraseResonanceSignature: new fields.SchemaField({
          actionType: new fields.StringField({
            initial: 'complex'
          }),
          increaseOverwatchScore: new fields.BooleanField({
            initial: true
          }),
          specialization: new fields.BooleanField({
            initial: false
          }),
          neededMarks: new fields.NumberField({
            initial: 0
          }),
          test: dicePoolSchema(),
          limit: new fields.SchemaField({
            base: new fields.NumberField({
              initial: 0
            }),
            value: new fields.NumberField({
              initial: 0
            }),
            modifiers: new fields.ArrayField(new fields.ObjectField()),
            linkedAttribute: new fields.StringField({
              initial: 'attack'
            }),
          }),
        }),
        killComplexForm: resonanceLimitActionSchema('complex', false, 'mentalLimit'),
        registerSprite: resonanceTestActionSchema('complex', false),
        threadComplexForm: resonanceTestActionSchema('complex', false),
      }),
      submersionGrade: new fields.NumberField({
        initial: 0
      }),
      connectedObject: new fields.SchemaField({
        augmentations: new fields.ObjectField(),
        weapons: new fields.ObjectField(),
        armors: new fields.ObjectField(),
        gears: new fields.ObjectField(),
        vehicles: new fields.ObjectField(),
      }),
      potentialPanObject: new fields.SchemaField({
        augmentations: new fields.ObjectField(),
        weapons: new fields.ObjectField(),
        armors: new fields.ObjectField(),
        gears: new fields.ObjectField(),
        vehicles: new fields.ObjectField(),
      }),
      pan: new fields.SchemaField({
        max: new fields.NumberField({
          initial: 0
        }),
        current: new fields.NumberField({
          initial: 0
        }),
        content: new fields.ArrayField(new fields.ObjectField()),
      }),
      noise: new fields.SchemaField({
        ...sr5ModsPartialModel.defineSchema()
      }),
      registeredSprite: new fields.SchemaField({
        current: new fields.NumberField({
          initial: 0
        }),
        max: new fields.NumberField({
          initial: 0
        }),
      }),
    }
  }
}
