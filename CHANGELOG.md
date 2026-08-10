# Changelog

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
