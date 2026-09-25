import {
  describe, it, expect
} from "vitest"

import {
  readdirSync, readFileSync, existsSync, statSync
} from "node:fs"
import {
  join, dirname, resolve
} from "node:path"

/**
 * Every script under modules/, walked recursively.
 * @param {string} dir
 * @returns {string[]}
 */
function scripts(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return scripts(path)
    return path.endsWith(".js") ? [path] : []
  })
}

// One relative import pointing at a file that is gone stops the whole system
// from loading, and no test that imports a single module would notice it: a
// merge brought back such an import once, on a branch that no longer had the
// file.
describe("relative imports", () => {
  it("point at files that exist", () => {
    const missing = []
    for (const file of scripts(resolve("modules"))) {
      const source = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "")
      for (const [, target] of source.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
        if (!existsSync(resolve(dirname(file), target))) missing.push(`${file} -> ${target}`)
      }
    }
    expect(missing).toEqual([])
  })
})
