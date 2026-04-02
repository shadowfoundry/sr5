# Contributing to Shadowrun 5

Thank you for contributing! This guide covers setup, workflow, and conventions.

## Setup

### Quick Start

```bash
git clone <repo-url> sr5
cd sr5
npm install
```

Symlink into Foundry's data directory so changes are loaded live:

```bash
# Linux / macOS
ln -s /path/to/sr5 /path/to/foundry-data/Data/systems/sr5

# Windows (run as Administrator)
mklink /D "C:\FoundryData\Data\systems\sr5" "C:\path\to\sr5"
```

### Required Tools

- **VSCode** with extensions:
  - **Easy LESS** (required) — auto-compiles `.less` on save

## Git Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes, commit with clear messages
3. Push and open a pull request against `main`

### Branch Naming

| Prefix | Purpose |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation |
| `refactor/` | Code restructuring |

### Commit Messages

Use concise, imperative descriptions:
- `Add matrix resistance calculation`
- `Fix edge wheel display on grunt sheet`
- `Update French translations for spells`

## CSS / LESS

Styles are in `styles/` and compiled to `css/`:

```bash
npm run build:css
```

With the Easy LESS extension, files compile on save automatically. **Never edit `css/sr5.css` directly** — it is gitignored and rebuilt on every compilation.

## What to Check Before Submitting

- [ ] `npm run build` compiles without errors
- [ ] Both `lang/en.json` and `lang/fr.json` have matching keys (if you touched localization)
- [ ] No `console.log` left in code (use `SR5_SystemHelpers.srLog()` for debug output)

## CI Checks

Pull requests automatically run:

| Check | What it validates |
|-------|------------------|
| LESS | CSS compiles |
| JSON | Valid syntax, language key parity |

All checks must pass before merging.

## Releases

See [RELEASE.md](RELEASE.md) for the release process (tagging, CI, manifest URLs).
