/**
 * Validates package.json structure and required dev dependencies.
 * Exit code 1 if any required field or dependency is missing.
 */
const fs = require('fs')

const raw = fs.readFileSync('package.json', 'utf8')
let pkg

try {
  pkg = JSON.parse(raw)
} catch (e) {
  process.stderr.write(`package.json: invalid JSON — ${e.message}\n`)
  process.exit(1)
}

const errors = []

const requiredFields = ['name', 'license', 'scripts', 'devDependencies']
for (const field of requiredFields) {
  if (!pkg[field]) errors.push(`Missing required field: ${field}`)
}

const requiredDeps = ['vitest', 'eslint', 'husky', 'lint-staged', 'less']
for (const dep of requiredDeps) {
  if (!pkg.devDependencies?.[dep]) errors.push(`Missing required devDependency: ${dep}`)
}

const requiredScripts = ['test', 'lint', 'build:css', 'check', 'prepare', 'release']
for (const script of requiredScripts) {
  if (!pkg.scripts?.[script]) errors.push(`Missing required script: ${script}`)
}

if (errors.length > 0) {
  for (const err of errors) process.stderr.write(`package.json: ${err}\n`)
  process.exit(1)
}

console.log('Dependencies OK')
