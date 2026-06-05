# Viboplr Auto Tagger Plugin

Discovers recurring patterns in your library's file paths and metadata, then lets
you classify them as **tags**, **artists**, **albums**, or **years** and apply
them across the library — manually or automatically as new tracks are added.

The plugin contributes a sidebar view (**Auto Tagger**) with three tabs:

- **Analyze** — scan a collection, generate n-grams from paths + metadata, and
  surface ones that recur above a frequency threshold as candidates.
- **Approved** — review your saved classification rules, run them on demand, and
  prune them.
- **Settings** — frequency threshold, n-gram size, stopwords, and whether to
  auto-assign on `track:added` / `scan:complete`.

It works entirely against the host's `api.library`, `api.collections`,
`api.storage`, and `api.ui` surfaces — no network, no external binaries.

Plugin id: `auto-tagger` (so an installed copy overrides the app's bundled
built-in of the same id, if any).

New to writing Viboplr plugins? See **[DEVELOPING.md](DEVELOPING.md)** for the
develop/reload/debug workflow.

## Requirements

None beyond the app itself.

## Install

In Viboplr: **Extensions → Install from URL** and paste this repo's URL, or it
auto-updates if already installed (the app checks `updateUrl` every 24h).

## Develop & Release

For every release: edit `index.js` / `manifest.json`, **bump `version` in
`manifest.json`**, and add a `## vX.Y.Z` section at the top of `CHANGELOG.md`.
Then publish via CI (preferred) or manually.

Bump helper: `scripts/bump.sh <patch|minor|major|X.Y.Z>` rewrites the
`manifest.json` version and prepends a `## vX.Y.Z` CHANGELOG section (with a
`TODO` to fill in). It does not commit/tag/push — review, fill in the changelog,
then release.

### Release via CI (preferred)

A GitHub Actions workflow (`.github/workflows/release.yml`) builds and publishes
the release. It verifies the `manifest.json` version matches the release version
and that the zip has `manifest.json` at its root, then attaches `auto-tagger.zip`
+ `update.json`. Two ways to trigger it:

- **Push a tag:** after committing the version bump + changelog, run
  `git tag vX.Y.Z && git push origin vX.Y.Z`.
- **Manual dispatch:** GitHub → Actions → *Release* → *Run workflow*, enter the
  version (must equal `manifest.json`). CI creates the tag for you.

### Release manually (fallback)

1. `scripts/package.sh` → produces `auto-tagger.zip` + `update.json`.
   - The zip MUST contain `manifest.json` at its root (the script guarantees this;
     verify via the printed `unzip -l`).
2. `gh release create vX.Y.Z auto-tagger.zip update.json --repo outcast1000/viboplr-auto-tagger --title "vX.Y.Z" --notes-file CHANGELOG.md`

The update endpoint is the permanent
`https://github.com/outcast1000/viboplr-auto-tagger/releases/latest/download/update.json`.

## Tests

```bash
node --test     # or: npm test
```

Zero-dependency suite: it loads the real `index.js` in a faithful sandbox and
drives `activate()` through a mocked `api` bridge (no library, no disk). It
asserts that activation subscribes to library events, registers every UI action
handler, renders the view, and that tab switching + the `track:added` path don't
throw. CI runs the same command and a release will not publish unless it passes.
