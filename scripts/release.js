#!/usr/bin/env node
// Prepares a new release: bumps version in the manifest and package.json,
// regenerates the lockfile, runs full validation, commits, and creates a git tag.
//
// Interactive:  npm run release           (guides you through version selection)
// Direct:       npm run release -- 13.0.1-alpha.2

const {
  execSync
} = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const ROOT = path.resolve(__dirname, '..')

const SEMVER_RE = /^[0-9]+\.[0-9]+\.[0-9]+(?:-(alpha|beta|rc|dev|snapshot|canary)\.[0-9]+)?$/
const PRERELEASE_RE = /^([0-9]+)\.([0-9]+)\.([0-9]+)-(alpha|beta|rc|dev|snapshot|canary)\.([0-9]+)$/
const STABLE_RE = /^([0-9]+)\.([0-9]+)\.([0-9]+)$/
const PROMOTION_ORDER = ['alpha', 'beta', 'rc']

// Auto-detect manifest file: system.json for systems, module.json for modules.
const MANIFEST = fs.existsSync(path.join(ROOT, 'system.json')) ? 'system.json' :
  fs.existsSync(path.join(ROOT, 'module.json')) ? 'module.json' :
    null

if (!MANIFEST) {
  console.error('Error: could not find system.json or module.json in the project root.')
  process.exit(1)
}

// ── Read current state ───────────────────────────────────────────────────────

function getCurrentVersion() {
  const content = fs.readFileSync(path.join(ROOT, MANIFEST), 'utf8')
  const match = content.match(/"version"\s*:\s*"([^"]*)"/)
  return match ? match[1] : null
}

function getBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD', {
    cwd: ROOT
  }).toString().trim()
}

function getExistingTags() {
  return execSync('git tag --list', {
    cwd: ROOT
  }).toString().split('\n').filter(Boolean)
}

function parseVersion(ver) {
  const pre = ver.match(PRERELEASE_RE)
  if (pre) {
    return {
      major: parseInt(pre[1]),
      minor: parseInt(pre[2]),
      patch: parseInt(pre[3]),
      identifier: pre[4],
      num: parseInt(pre[5]),
      isPrerelease: true,
    }
  }
  const stable = ver.match(STABLE_RE)
  if (stable) {
    return {
      major: parseInt(stable[1]),
      minor: parseInt(stable[2]),
      patch: parseInt(stable[3]),
      identifier: null,
      num: null,
      isPrerelease: false,
    }
  }
  return null
}

function formatVersion(v) {
  if (v.identifier) return `${v.major}.${v.minor}.${v.patch}-${v.identifier}.${v.num}`
  return `${v.major}.${v.minor}.${v.patch}`
}

// ── Interactive version selection ────────────────────────────────────────────

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin, output: process.stdout
  })
  return new Promise(resolve => rl.question(query, answer => {
    rl.close()
    resolve(answer.trim())
  }))
}

function buildChoices(parsed, isMainBranch, existingTags) {
  const choices = []
  const v = parsed

  if (isMainBranch) {
    // On main: offer stable release
    if (v.isPrerelease) {
      choices.push({
        label: 'Stable release',
        version: formatVersion({
          ...v, identifier: null, num: null
        }),
        desc: 'Ship it! Production-ready, merged and validated.',
      })
    }
    choices.push({
      label: 'Enter manually',
      version: null,
    })
    return choices
  }

  // On non-main branch
  const cycle = `${v.major}.${v.minor}.${v.patch}`
  if (v.isPrerelease) {
    // Next increment of same identifier
    choices.push({
      label: `Next ${v.identifier}`,
      version: formatVersion({
        ...v, num: v.num + 1
      }),
      desc: 'Keep adding changes to this release.',
      section: `continue`,
    })

    // Promote to next identifier in the chain
    const idx = PROMOTION_ORDER.indexOf(v.identifier)
    if (idx >= 0 && idx < PROMOTION_ORDER.length - 1) {
      const next = PROMOTION_ORDER[idx + 1]
      choices.push({
        label: `Promote to ${next}`,
        version: formatVersion({
          ...v, identifier: next, num: 1
        }),
        desc: next === 'beta' ?
          'No more new features — only bug fixes and testing from now on.' :
          'Feature-complete and stable. Final validation before going live.',
        section: 'continue',
      })
    }
    if (v.identifier === 'rc') {
      choices.push({
        label: 'Promote to stable',
        version: formatVersion({
          ...v, identifier: null, num: null
        }),
        desc: 'Ship it! (must be on main branch)',
        section: 'continue',
      })
    }

    // New patch cycle
    choices.push({
      label: 'New patch release',
      version: formatVersion({
        major: v.major, minor: v.minor, patch: v.patch + 1, identifier: 'alpha', num: 1
      }),
      desc: `Start fresh for a new round of fixes (close ${cycle} cycle).`,
      section: 'new',
    })

    // New minor cycle
    choices.push({
      label: 'New minor release',
      version: formatVersion({
        major: v.major, minor: v.minor + 1, patch: 0, identifier: 'alpha', num: 1
      }),
      desc: 'Start fresh for a bigger release with new features.',
      section: 'new',
    })
  } else {
    // Current version is stable, on a non-main branch (post-merge or development)
    choices.push({
      label: 'New patch release',
      version: formatVersion({
        major: v.major, minor: v.minor, patch: v.patch + 1, identifier: 'alpha', num: 1
      }),
      desc: 'Bug fixes and small improvements.',
      section: 'new',
    })
    choices.push({
      label: 'New minor release',
      version: formatVersion({
        major: v.major, minor: v.minor + 1, patch: 0, identifier: 'alpha', num: 1
      }),
      desc: 'Significant new features or breaking changes.',
      section: 'new',
    })
  }

  choices.push({
    label: 'Enter manually',
    version: null,
  })

  // Filter out versions that already have a tag
  return choices.filter(c => !c.version || !existingTags.includes(c.version))
}

async function interactiveSelect() {
  const currentVersion = getCurrentVersion()
  const branch = getBranch()
  const isMainBranch = branch === 'main' || branch === 'master'
  const existingTags = getExistingTags()

  const parsed = parseVersion(currentVersion)
  if (!parsed) {
    console.error(`Error: current version "${currentVersion}" is not valid semver. Use manual mode:`)
    console.error('  npm run release -- <version>')
    process.exit(1)
  }

  const choices = buildChoices(parsed, isMainBranch, existingTags)

  console.log(`\nCurrent version: ${currentVersion}  (branch: ${branch})`)

  let lastSection = null
  let i = 1
  for (const c of choices) {
    // Section headers
    if (c.section && c.section !== lastSection) {
      console.log('')
      if (c.section === 'continue') {
        const cycle = `${parsed.major}.${parsed.minor}.${parsed.patch}`
        console.log(`  Continue current release (${cycle}):`)
      } else if (c.section === 'new') {
        console.log('  Start a new release:')
      }
      lastSection = c.section
    }
    if (!c.section && lastSection) {
      console.log('')
      lastSection = null
    }

    if (c.version) {
      console.log(`    ${i}. ${c.label.padEnd(22)} → ${c.version}`)
      if (c.desc) console.log(`       ${c.desc}`)
    } else {
      console.log(`    ${i}. ${c.label}`)
    }
    i++
  }

  console.log('')
  const answer = await askQuestion(`Choice [1]: `)
  const idx = (answer === '' ? 1 : parseInt(answer)) - 1

  if (isNaN(idx) || idx < 0 || idx >= choices.length) {
    console.error('Invalid choice.')
    process.exit(1)
  }

  const chosen = choices[idx]
  if (!chosen.version) {
    const manual = await askQuestion('Enter version: ')
    if (!manual) {
      console.error('No version entered.')
      process.exit(1)
    }
    return manual
  }

  return chosen.version
}

// ── Version validation and execution ─────────────────────────────────────────

async function main() {
  let version = process.argv[2]

  if (!version) {
    version = await interactiveSelect()
  }

  if (!SEMVER_RE.test(version)) {
    console.error(`Error: "${version}" is not a valid version.`)
    console.error(`Expected: X.Y.Z or X.Y.Z-(${['alpha', 'beta', 'rc', 'dev', 'snapshot', 'canary'].join('|')}).N`)
    process.exit(1)
  }

  const isPrerelease = version.includes('-')

  // --- Check git state ---
  const gitStatus = execSync('git status --porcelain', {
    cwd: ROOT
  }).toString().trim()
  if (gitStatus) {
    console.error('Error: working directory has uncommitted changes. Commit or stash them first.')
    process.exit(1)
  }

  // --- Check branch ---
  const branch = getBranch()
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
  const existingTags = getExistingTags()
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
  execSync('npm install', {
    cwd: ROOT, stdio: 'inherit'
  })

  // --- Validate ---
  console.log('Running checks...')
  execSync('npm run check', {
    cwd: ROOT, stdio: 'inherit'
  })

  // --- Commit ---
  execSync(`git add ${MANIFEST} package.json package-lock.json`, {
    cwd: ROOT
  })
  execSync(`git commit -m "Bump version to ${version}"`, {
    cwd: ROOT
  })

  // --- Tag ---
  execSync(`git tag ${version}`, {
    cwd: ROOT
  })

  console.log(`\nVersion bumped to ${version} and tagged.`)
  console.log('\nTo publish the release, push the commit and tag:')
  if (isMainBranch) {
    console.log('  git push origin main --tags')
  } else {
    console.log('  git push origin HEAD --tags')
  }
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
