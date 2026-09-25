import {
  describe, it, expect
} from 'vitest'
import fs from 'node:fs'

const raw = fs.readFileSync(new URL('../system.json', import.meta.url), 'utf8')
const system = JSON.parse(raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw)

describe('system.json grid', () => {
  it('declares a grid distance, so new scenes do not fall back to Foundry default of 1', () => {
    expect(typeof system.grid?.distance).toBe('number')
  })

  it('declares a square of 1.5 meters', () => {
    expect(system.grid.distance).toBe(1.5)
    expect(system.grid.units).toBe('m')
  })
})
