import {
  describe, it, expect, afterEach
} from 'vitest'
import {
  SR5_SystemHelpers
} from '../modules/system/utilitySystem.js'

// SR5 states every distance in meters: the weapon range table is headed "RANGE IN METERS" (SR5 p. 186), a
// blast loses damage per meter (p. 184), an area spell covers a radius in meters equal to its Force (p. 282).
// A scene's unit is a display setting, so the system converts what it measures instead of constraining the GM.

const FOOT_IN_METERS = 0.3048

function setScene(units, measuredDistance = 0) {
  globalThis.canvas = {
    scene: {
      grid: {
        units: units
      }
    },
    grid: {
      measurePath: () => ({
        distance: measuredDistance
      })
    },
  }
}

describe('Scene unit conversion', () => {
  afterEach(() => {
    delete globalThis.canvas
  })

  describe('getSceneUnitInMeters', () => {
    it('leaves a scene already measured in meters alone', () => {
      for (const units of ['m', 'M', ' m ', 'meters', 'mètres', 'metres', 'm.']) {
        setScene(units)
        expect(SR5_SystemHelpers.getSceneUnitInMeters()).toBe(1)
      }
    })

    it('recognises every spelling of feet Foundry and its users write', () => {
      for (const units of ['ft', 'FT', 'ft.', ' ft ', 'feet', 'Feet', 'foot', "'", 'pi', 'pied', 'pieds']) {
        setScene(units)
        expect(SR5_SystemHelpers.getSceneUnitInMeters()).toBe(FOOT_IN_METERS)
      }
    })

    it('assumes meters for a unit it does not know, rather than guessing', () => {
      // Guessing at "yd", "km" or a label the GM typed would trade a known wrong answer for an
      // unpredictable one. An unknown unit keeps the behaviour the system had before this fix.
      for (const units of ['yd', 'yards', 'km', 'mi', 'cases', 'hexes', '']) {
        setScene(units)
        expect(SR5_SystemHelpers.getSceneUnitInMeters()).toBe(1)
      }
    })

    it('takes an empty unit as meters -- a scene in the world has one', () => {
      setScene('')
      expect(SR5_SystemHelpers.getSceneUnitInMeters()).toBe(1)
      setScene('   ')
      expect(SR5_SystemHelpers.getSceneUnitInMeters()).toBe(1)
    })

    it('survives a scene that has no unit at all', () => {
      globalThis.canvas = undefined
      expect(SR5_SystemHelpers.getSceneUnitInMeters()).toBe(1)
      globalThis.canvas = {
        scene: null
      }
      expect(SR5_SystemHelpers.getSceneUnitInMeters()).toBe(1)
      setScene(undefined)
      expect(SR5_SystemHelpers.getSceneUnitInMeters()).toBe(1)
    })
  })

  describe('both directions of conversion', () => {
    it('turns a measured distance into meters', () => {
      setScene('ft')
      expect(SR5_SystemHelpers.convertSceneUnitsToMeters(40)).toBeCloseTo(12.192, 3)
      setScene('m')
      expect(SR5_SystemHelpers.convertSceneUnitsToMeters(40)).toBe(40)
    })

    it('turns a radius taken from the books into scene units', () => {
      setScene('ft')
      // An area spell of Force 6 covers 6 meters (SR5 p. 282), which is just under 20 feet.
      expect(SR5_SystemHelpers.convertMetersToSceneUnits(6)).toBeCloseTo(19.685, 3)
      setScene('m')
      expect(SR5_SystemHelpers.convertMetersToSceneUnits(6)).toBe(6)
    })

    it('makes a round trip in either order', () => {
      setScene('ft')
      expect(SR5_SystemHelpers.convertSceneUnitsToMeters(SR5_SystemHelpers.convertMetersToSceneUnits(18))).toBeCloseTo(18, 9)
      expect(SR5_SystemHelpers.convertMetersToSceneUnits(SR5_SystemHelpers.convertSceneUnitsToMeters(18))).toBeCloseTo(18, 9)
    })
  })

  describe('getDistanceInMetersBetweenTwoPoint', () => {
    it('gives the range band of an Ares Predator V its book value on a scene measured in feet', () => {
      // Ares Predator V: 0-5 / 6-20 / 21-40 / 41-60 meters (SR5 p. 186).
      // 40 feet is 12.2 m -- medium range. Measured raw, 40 would have read as long range, and 65 feet
      // (19.8 m, still medium) would have been refused as beyond extreme range.
      setScene('ft', 40)
      expect(SR5_SystemHelpers.getDistanceInMetersBetweenTwoPoint({
        x: 0, y: 0
      }, {
        x: 0, y: 0
      })).toBeCloseTo(12.192, 3)

      setScene('ft', 65)
      const far = SR5_SystemHelpers.getDistanceInMetersBetweenTwoPoint({
        x: 0, y: 0
      }, {
        x: 0, y: 0
      })
      expect(far).toBeCloseTo(19.812, 3)
      expect(far).toBeLessThanOrEqual(20)
    })

    it('changes nothing on a scene measured in meters', () => {
      setScene('m', 37)
      expect(SR5_SystemHelpers.getDistanceInMetersBetweenTwoPoint({
        x: 0, y: 0
      }, {
        x: 0, y: 0
      })).toBe(37)
    })
  })
})
