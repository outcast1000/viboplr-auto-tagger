// Minimal mock of the host ViboplrPluginAPI surface used by the Auto Tagger plugin.
// Captures registered event/action handlers and the last setViewData payload so
// tests can assert wiring and drive the plugin without a live host.
function makeMockApi(overrides) {
  overrides = overrides || {};
  const store = Object.assign({}, overrides.store);
  const uiActions = {};
  const libraryEvents = {};
  const viewData = {};
  const notifications = [];

  const api = {
    store,
    uiActions,
    libraryEvents,
    viewData,
    notifications,
    log: function () {},
    storage: {
      get: function (key) { return Promise.resolve(store[key] != null ? store[key] : null); },
      set: function (key, value) { store[key] = value; return Promise.resolve(); },
      delete: function (key) { delete store[key]; return Promise.resolve(); },
    },
    collections: {
      getLocalCollections: function () {
        return Promise.resolve(overrides.collections || []);
      },
    },
    library: {
      getTracks: function () { return Promise.resolve(overrides.tracks || []); },
      applyTags: function () { return Promise.resolve(); },
      applyTagsBulk: function () { return Promise.resolve(); },
      bulkUpdateTracks: function () { return Promise.resolve(); },
      onTrackAdded: function (handler) { libraryEvents.trackAdded = handler; },
      onScanComplete: function (handler) { libraryEvents.scanComplete = handler; },
    },
    ui: {
      setViewData: function (viewId, data) { viewData[viewId] = data; },
      showNotification: function (msg) { notifications.push(msg); },
      requestAction: function () {},
      onAction: function (id, handler) {
        uiActions[id] = handler;
        return function () { delete uiActions[id]; };
      },
    },
  };
  // Hosts >= 1.0.77 draw a header over the view; `legacyHost` models an older
  // one without api.ui.setViewHeader.
  const viewHeaders = [];
  api.viewHeaders = viewHeaders;
  if (!overrides.legacyHost) {
    api.ui.setViewHeader = function (viewId, header) { viewHeaders.push({ viewId, header }); };
  }
  return api;
}

module.exports = { makeMockApi };
