# Changelog

## v2.2.0
- **Runs in the plugin worker runtime.** It now gets only what it asks for
  — `library:read`, `library:write` — and can't reach anything else in the app. Viboplr asks
  you to allow these once when you update. Requires Viboplr 1.0.85.

## v2.1.0
- Fills in the header Viboplr 1.0.77+ draws over the view. The subtitle
  counts your rules and any candidates still to review. A status word shows
  what the plugin is doing ("Analyzing…", "Applying rules…") or, when idle,
  whether new tracks get tagged automatically ("Auto-assign on" / "off",
  "No rules yet"). Older app versions are unaffected.
- "Run Now" now reports failures instead of failing silently, and ignores a
  second click while a run is already in progress.

## v2.0.1
- Declares `updateUrl` in its manifest, so "Check for updates" can see this
  plugin at all. The app skips any installed plugin whose manifest omits the
  field — before comparing versions — so v2.0.0 installs were never checked and
  would have missed every future release. Nothing else changed.
- Copies already installed stay silent until reinstalled once from the gallery:
  the check reads the manifest on disk, so the fix can't announce itself.

## v2.0.0
- Initial standalone release. Extracted from the Viboplr app's bundled plugins
  into its own repository with independent CI + release flow. Behaviour is
  unchanged from the bundled `auto-tagger` plugin: n-gram analysis of paths +
  metadata, tag/artist/album/year classification, and auto-assign on
  `track:added` / `scan:complete`.
