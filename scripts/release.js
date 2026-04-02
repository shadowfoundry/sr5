#!/usr/bin/env node
// Prepares a new release: bumps version in the manifest and package.json,
// regenerates the lockfile, runs full validation, commits, and creates a git tag.
// Usage: node scripts/release.js <version>
// Example: node scripts/release.js 13.0.1-alpha.2

const {execSync} = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

const SEMVER_RE = /^[0-9]+\.[0-9]+\.[0-9]+(?:-(alpha|beta|rc|dev|snapshot|canary)\.[0-9]+)?$/
const PRERELEASE_IDENTIFIERS = ['alpha', 'beta', 'rc', 'dev', 'snapshot', 'canary']

// Auto-detect manifest file: system.json for systems, module.json for modules.
const MANIFEST = fs.existsSync(path.join(ROOT, 'system.json')) ? 'system.json' :
  fs.existsSync(path.join(ROOT, 'module.json')) ? 'module.json' :
    null

if (!MANIFEST) {
  console.error('Error: could not find system.json or module.json in the project root.')
  process.exit(1)
}

// --- Args ---
const version = process.argv[2]
if (!version) {
  console.error('Usage: npm run release -- <version>')
  console.error('Examples:')
  console.error('  npm run release -- 13.0.1-alpha.2   (pre-release, from any non-main branch)')
  console.error('  npm run release -- 13.0.1            (stable, from main branch)')
  process.exit(1)
}

if (!SEMVER_RE.test(version)) {
  console.error(`Error: "${version}" is not a valid version.`)
  console.error(`Expected: X.Y.Z or X.Y.Z-(${PRERELEASE_IDENTIFIERS.join('|')}).N`)
  process.exit(1)
}

const isPrerelease = version.includes('-')

// --- Check git state ---
const gitStatus = execSync('git status --porcelain', {cwd: ROOT}).toString().trim()
if (gitStatus) {
  console.error('Error: working directory has uncommitted changes. Commit or stash them first.')
  process.exit(1)
}

// --- Check branch ---
const branch = execSync('git rev-parse --abbrev-ref HEAD', {cwd: ROOT}).toString().trim()
const isMainBranch = branch === 'main' || branch === 'master'

if (!isPrerelease && !isMainBranch) {
  console.error(`Error: stable releases must be tagged from the main branch (current: ${branch}).`)
  process.exit(1)
}
if (isPrerelease && isMainBranch) {
  console.error('Error: pre-releases must not be tagged from the main/master branch.')
  process.exit(1)
}

// --- Check tag does not already exist ---
const existingTags = execSync('git tag --list', {cwd: ROOT}).toString().split('\n')
if (existingTags.includes(version)) {
  console.error(`Error: tag "${version}" already exists.`)
  process.exit(1)
}

// --- Bump version in a file using regex (preserves formatting) ---
function bumpVersion(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  if (!/"version"\s*:\s*"[^"]*"/.test(content)) {
    console.error(`Error: could not find "version" field in ${filePath}`)
    process.exit(1)
  }
  const updated = content.replace(
    /("version"\s*:\s*)"[^"]*"/,
    `$1"${version}"`
  )
  fs.writeFileSync(filePath, updated)
}

console.log(`\nManifest: ${MANIFEST}`)
console.log(`Bumping version to ${version}...`)
bumpVersion(path.join(ROOT, MANIFEST))
bumpVersion(path.join(ROOT, 'package.json'))

// --- Regenerate lockfile ---
console.log('Regenerating package-lock.json...')
execSync('npm install', {cwd: ROOT, stdio: 'inherit'})

// --- Validate ---
console.log('Running checks...')
execSync('npm run check', {cwd: ROOT, stdio: 'inherit'})

// --- Commit ---
execSync(`git add ${MANIFEST} package.json package-lock.json`, {cwd: ROOT})
execSync(`git commit -m "Bump version to ${version}"`, {cwd: ROOT})

// --- Tag ---
execSync(`git tag ${version}`, {cwd: ROOT})

console.log(`\nVersion bumped to ${version} and tagged.`)
console.log('\nTo publish the release, push the commit and tag:')
if (isMainBranch) {
  console.log('  git push origin main --tags')
} else {
  console.log('  git push origin HEAD --tags')
}
