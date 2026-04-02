#!/usr/bin/env node

const {
  execSync,
} = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

let errors = 0

function fail(msg) {
  console.error(`  FAIL: ${msg}`)
  errors++
}

function pass(msg) {
  console.log(`  OK: ${msg}`)
}

function run(label, cmd) {
  try {
    execSync(cmd, {
      cwd: ROOT,
      stdio: 'pipe',
    })
    pass(label)
    return true
  } catch (err) {
    const output = err.stdout?.toString() || err.stderr?.toString() || ''
    if (output.trim()) console.error(output)
    fail(label)
    return false
  }
}

// --- 1. Lint ---
console.log('\n[1/6] Linting...')
run('ESLint passed', 'npm run lint')

// --- 2. Test ---
console.log('\n[2/6] Running tests...')
run('Tests passed', 'npm test')

// --- 3. Build CSS ---
console.log('\n[3/6] Building CSS...')
run('LESS compiled', 'npm run build:css')

// --- 4. Validate ---
console.log('\n[4/6] Validating languages...')
run('Language files OK', 'npm run validate:languages')

console.log('\n[5/6] Validating system, dependencies, and templates...')
run('system.json OK', 'npm run validate:system')
run('Dependencies OK', 'npm run validate:dependencies')
run('Templates OK', 'npm run validate:templates')

// --- 6. Version sync ---
console.log('\n[6/6] Checking version sync...')
const manifestFile = fs.existsSync(path.join(ROOT, 'system.json')) ? 'system.json' : 'module.json'
let manifest
try {
  manifest = JSON.parse(fs.readFileSync(path.join(ROOT, manifestFile), 'utf8'))
} catch (_) { /* ignore */ }
let pkg
try {
  pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
} catch (_) { /* ignore */ }

if (manifest && pkg) {
  const manVersion = manifest.version
  const pkgVersion = pkg.version

  if (manVersion === pkgVersion) {
    pass(`${manifestFile} and package.json versions match: ${manVersion}`)
  } else {
    fail(`${manifestFile} version '${manVersion}' does not match package.json version '${pkgVersion}'`)
  }

  // Check package-lock.json is in sync
  const lockPath = path.join(ROOT, 'package-lock.json')
  if (fs.existsSync(lockPath)) {
    try {
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
      if (lock.version !== pkgVersion) {
        fail(`package-lock.json version '${lock.version}' does not match package.json version '${pkgVersion}' (run npm install)`)
      } else {
        pass('package-lock.json is in sync')
      }
    } catch (err) {
      fail(`package-lock.json is not valid JSON: ${err.message}`)
    }
  } else {
    fail('package-lock.json not found (run npm install)')
  }

  // Check against git tag if provided as argument
  const tag = process.argv[2]
  if (tag) {
    if (tag === manVersion && tag === pkgVersion) {
      pass(`Tag '${tag}' matches both files`)
    } else {
      if (tag !== manVersion) fail(`Tag '${tag}' does not match ${manifestFile} version '${manVersion}'`)
      if (tag !== pkgVersion) fail(`Tag '${tag}' does not match package.json version '${pkgVersion}'`)
    }
  }

  // Validate semver format
  const semverPrerelease = /^[0-9]+\.[0-9]+\.[0-9]+-[a-zA-Z]+\.[0-9]+$/
  const semverStable = /^[0-9]+\.[0-9]+\.[0-9]+$/
  if (semverPrerelease.test(manVersion) || semverStable.test(manVersion)) {
    pass(`Version '${manVersion}' is valid semver`)
  } else {
    fail(`Version '${manVersion}' is not valid semver (expected X.Y.Z or X.Y.Z-identifier.N)`)
  }
}

// --- Summary ---
console.log('')
if (errors > 0) {
  console.error(`Checks failed with ${errors} error(s).`)
  process.exit(1)
} else {
  console.log('All checks passed.')
}
