# Release Process

This document describes how to create releases for the Shadowrun 5 System.

## Tag Format

All releases follow [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`):

| Type | Tag format | Example | Branch | GitHub release |
|------|-----------|---------|--------|----------------|
| **Pre-release** | `X.Y.Z-<identifier>.N` | `13.0.1-alpha.3` | any (except main) | Pre-release |
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

## Creating a Release

The `npm run release` script automates the entire process: it validates your environment, bumps the version in `system.json` and `package.json`, regenerates `package-lock.json`, runs all checks, commits, and creates the git tag.

### Pre-release

Pre-releases can be created from any branch except `main`/`master`.

```bash
git checkout dev        # or any non-main branch
git pull
npm run release -- 13.0.1-alpha.3
```

Then push:

```bash
git push origin HEAD --tags
```

### Stable release

Stable releases must be created from the `main` branch.

```bash
git checkout main
git pull origin main
git merge dev
npm run release -- 13.0.1
```

Then push:

```bash
git push origin main --tags
```

### What `npm run release` does

1. Validates the version format (semver)
2. Checks the working directory is clean (no uncommitted changes)
3. Checks you are on the correct branch (main for stable, non-main for pre-release)
4. Checks the tag does not already exist
5. Bumps version in `system.json` and `package.json`
6. Regenerates `package-lock.json`
7. Runs `npm run check` (lint, tests, CSS build, validators)
8. Commits the version bump
9. Creates the git tag

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

## What the CI Does

When a tag is pushed, a single workflow (`shadowfoundry-release-system.yml`) runs and automatically detects whether it is a pre-release or stable release:

1. **Installs** dependencies and **runs** `npm run check` (lint, tests, validators)
2. **Verifies** the tag is on the correct branch (`main` for stable, non-main for pre-releases)
3. **Patches** the manifest with the correct version, manifest URL, and download URL
4. **Creates** a zip archive containing only the release contents (allowlist-based packaging)
5. **Creates** a GitHub release with:
   - The system zip (`sr5_<tag>.zip`)
   - A standalone `system.json` (for Foundry manifest updates)
   - Auto-generated release notes with chronological commit history since the previous tag of the same kind
6. **Updates** the persistent pre-release manifest (for pre-releases only) -- uploads `system.json` to a dedicated `pre-release-<identifier>` GitHub release, providing a stable manifest URL per channel
7. **Sends** a Discord notification:
   - Public repos: text message with link to the GitHub release page
   - Private repos: text message + zip file upload (chunked if over 9.9 MB)

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
