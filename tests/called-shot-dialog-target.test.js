import {
  describe, it, expect
} from 'vitest'
import {
  readFileSync
} from 'node:fs'

// The roll dialog is rendered with rollData itself. The vehicle locations of a
// Specific target called shot (door lock, window motor, axle...; Run & Gun
// p. 129) are offered only if the template reads the path rollData-Weapon.js
// writes. It used to read `targetActorType`, which nothing sets: a drone was
// offered eye, ear, knee...
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const template = read('../templates/rolls/rollDialogPartial/calledShots.hbs')
const weapon = read('../modules/rolls/roll-prepare-case/rollData-Weapon.js')

const droneTest = template.match(/\{\{#if \(eq ([\w.]+) "actorDrone"\)\}\}\s*\{\{selectOptions lists\.calledShotsSpecificDroneTarget/)

describe('called shot dialog, vehicle locations', () => {
  it('chooses the vehicle list on the target actor type', () => {
    expect(droneTest).not.toBeNull()
  })

  it('reads the path the weapon roll data writes', () => {
    const path = droneTest[1]
    const written = weapon.match(/rollData\.([\w.]+) = targetActor\.type/)
    expect(written).not.toBeNull()
    expect(path).toBe(written[1])
  })

  it('resolves to actorDrone for a targeted drone', () => {
    const rollData = {
      target: {
        actorType: 'actorDrone'
      }
    }
    expect(foundry.utils.getProperty(rollData, droneTest[1])).toBe('actorDrone')
  })
})
