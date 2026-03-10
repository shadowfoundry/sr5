/**
 * Compares all lang/*.json files against en.json to ensure matching keys.
 * Exit code 1 if any file has missing or extra keys.
 */
const fs = require('fs')
const path = require('path')

function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  return JSON.parse(raw)
}

function getKeyPaths(obj, prefix = '') {
  const paths = []
  for (const k of Object.keys(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      paths.push(...getKeyPaths(obj[k], p))
    } else {
      paths.push(p)
    }
  }
  return paths
}

const langDir = path.join(__dirname, '..', 'lang')
const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json')).sort()

if (files.length < 2) {
  console.log('Only one language file found, nothing to compare.')
  process.exit(0)
}

const reference = 'en.json'
const refPath = path.join(langDir, reference)
const refData = readJSON(refPath)
const refKeys = new Set(getKeyPaths(refData))

let failed = false

for (const file of files) {
  if (file === reference) continue
  const data = readJSON(path.join(langDir, file))
  const keys = new Set(getKeyPaths(data))

  const missing = [...refKeys].filter(k => !keys.has(k))
  const extra = [...keys].filter(k => !refKeys.has(k))

  if (missing.length || extra.length) {
    failed = true
    console.log(`\n${file} vs ${reference}:`)
    if (missing.length) {
      console.log(`  Missing ${missing.length} key(s):`)
      for (const k of missing) console.log(`    - ${k}`)
    }
    if (extra.length) {
      console.log(`  Extra ${extra.length} key(s):`)
      for (const k of extra) console.log(`    + ${k}`)
    }
  } else {
    console.log(`${file}: OK (${keys.size} keys match ${reference})`)
  }
}

if (failed) {
  process.exit(1)
} else {
  console.log(`\nAll language files match ${reference}.`)
}
