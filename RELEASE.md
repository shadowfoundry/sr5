# Release Process

This document describes how to create releases for the Shadowrun 5 System.

## Tag Format

All releases follow [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`):

| Type | Tag format | Example | Branch | GitHub release |
|------|-----------|---------|--------|----------------|
| **Pre-release** | `X.Y.Z-<identifier>.N` | `13.0.1-alpha.3` | `dev` | Pre-release |
| **Stable release** | `X.Y.Z` | `13.0.1` | `main` | Release |

Supported pre-release identifiers: `alpha`, `beta`, `rc`, `dev`, `snapshot`, `canary`.

### MAJOR version rule

The **MAJOR** version number must match the Foundry VTT major version the system targets. For example, if the system is built for Foundry V13, all tags must start with `13.x.x`:

| Foundry version | Valid tags |
|----------------|-----------|
| V13 | `13.0.0`, `13.1.0-alpha.1`, `13.2.3-rc.2` |
| V14 | `14.0.0`, `14.0.1-beta.1`, `14.1.0-dev.3` |

The **MINOR** and **PATCH** numbers are system-specific and independent from Foundry's own minor/patch versions. They track the system's own changes (new features, bug fixes, etc.), not Foundry updates.

When Foundry releases a new major version, bump the MAJOR and reset MINOR and PATCH (e.g. `13.2.1` -> `14.0.0-alpha.1`).

## Prerequisites

Before tagging, make sure the version is updated in `system.json` (`"version"` field). It must match the tag you are about to create.

## Creating a Pre-release

Pre-releases are tagged from the `dev` branch.

1. Switch to dev and pull latest

   ```
   git checkout dev
   git pull origin dev
   ```

2. Update version in `system.json`

   ```json
   "version": "13.0.1-alpha.1"
   ```

3. Commit the version bump

   ```
   git add system.json
   git commit -m "Bump version to 13.0.1-alpha.1"
   ```

4. Tag and push

   ```
   git tag 13.0.1-alpha.1
   git push origin dev --tags
   ```

### Pre-release progression examples

```
13.0.0-alpha.1  ->  13.0.0-alpha.2  ->  13.0.0-alpha.3
                                              |
                                        13.0.0-beta.1   ->  13.0.0-beta.2
                                                                  |
                                                            13.0.0-rc.1  ->  13.0.0-rc.2
                                                                                  |
                                                                              13.0.0  (stable)
```

## Creating a Stable Release

Stable releases are tagged from the `main` branch.

1. Merge dev into main

   ```
   git checkout main
   git pull origin main
   git merge dev
   ```

2. Update version in `system.json`

   ```json
   "version": "13.0.0"
   ```

3. Commit the version bump

   ```
   git add system.json
   git commit -m "Release 13.0.0"
   ```

4. Tag and push

   ```
   git tag 13.0.0
   git push origin main --tags
   ```

## What the CI Does

When a tag is pushed, a single workflow (`shadowfoundry-release-system.yml`) runs and automatically detects whether it is a pre-release or stable release:

1. **Validates** the tag format (semver pre-release or stable)
2. **Verifies** the tag is on the correct branch (`dev` for pre-releases, `main` for stable)
3. **Patches** `system.json` with the correct version, manifest URL, and download URL
4. **Cleans up** development files (less, node_modules, config files)
5. **Creates** a zip archive (`sr5_<tag>.zip`)
6. **Creates** a GitHub release with:
   - The system zip (`sr5_<tag>.zip`)
   - A standalone `system.json` (for Foundry manifest updates)
   - Auto-generated release notes with commit history since the previous tag of the same kind
7. **Updates** the persistent pre-release manifest (for pre-releases only) — uploads `system.json` to a dedicated `pre-release-<identifier>` GitHub release, providing a stable manifest URL per channel
8. **Sends** the zip to Discord (or posts a download link if over 8 MB)

## Manifest URLs

Each release type has a stable manifest URL that always points to the latest release of that kind:

| Channel | Manifest URL |
|---------|-------------|
| Stable | `https://github.com/<owner>/<repo>/releases/latest/download/system.json` |
| Alpha | `https://github.com/<owner>/<repo>/releases/download/pre-release-alpha/system.json` |
| Beta | `https://github.com/<owner>/<repo>/releases/download/pre-release-beta/system.json` |
| RC | `https://github.com/<owner>/<repo>/releases/download/pre-release-rc/system.json` |
| Dev | `https://github.com/<owner>/<repo>/releases/download/pre-release-dev/system.json` |

Users can install from any channel by using the corresponding manifest URL in Foundry's system installer. The manifest is automatically updated each time a new release of that type is published.

## Discord Notifications

| Release type | Secret | Channel |
|-------------|--------|---------|
| Pre-release | `DISCORD_ALPHA_CHANNEL_URL` | Alpha/testing channel |
| Stable | `DISCORD_STABLE_CHANNEL_URL` | Stable release channel |

## Invalid Tags (Ignored)

The following tag formats will **not** trigger any release:

- `v13.0.0` -- `v` prefix not allowed
- `13.0.0-alpha` -- missing `.N` numeric suffix
- `13.0.0-alpha-3` -- must use dot (`.`) not hyphen (`-`) before the number
- `13.0.0-alpha.3.extra` -- extra segments not allowed
- `foo`, `my-tag` -- not semver
