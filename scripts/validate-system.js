/**
 * Validates system.json structure and required Foundry VTT manifest fields.
 * Exit code 1 if any required field is missing or malformed.
 */
const fs = require('fs')

const raw = fs.readFileSync('system.json', 'utf8')
let manifest

try {
  manifest = JSON.parse(raw)
} catch (e) {
  process.stderr.write(`system.json: invalid JSON — ${e.message}\n`)
  process.exit(1)
}

const errors = []

const required = ['id', 'title', 'version', 'compatibility', 'manifest', 'download', 'license']
for (const field of required) {
  if (!manifest[field]) errors.push(`Missing required field: ${field}`)
}

if (manifest.compatibility) {
  if (!manifest.compatibility.minimum) errors.push('compatibility.minimum is missing')
  if (!manifest.compatibility.verified) errors.push('compatibility.verified is missing')
}

if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
  errors.push(`version "${manifest.version}" does not follow semver (expected x.y.z)`)
}

if (manifest.manifest && manifest.manifest.includes('TBD')) {
  errors.push('manifest URL is still set to TBD')
}
if (manifest.download && manifest.download.includes('TBD')) {
  errors.push('download URL is still set to TBD')
}

if (errors.length > 0) {
  for (const err of errors) process.stderr.write(`system.json: ${err}\n`)
  process.exit(1)
}

console.log('System manifest OK')
