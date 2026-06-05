const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadPlugin } = require("./harness/sandbox.js");
const { makeMockApi } = require("./harness/mock-api.js");

// UI actions the plugin wires up via api.ui.onAction.
const EXPECTED_ACTIONS = [
  "switch-tab",
  "select-collection",
  "analyze-search",
  "run-analyze",
  "set-threshold",
  "set-ngram-size",
  "apply-classifications",
  "run-approved",
  "save-approved",
  "remove-unchecked-approved",
  "set-default-threshold",
  "toggle-auto-assign",
  "toggle-auto-assign-metadata",
  "update-stopwords",
];

function activateAndSettle(api) {
  const plugin = loadPlugin();
  plugin.activate(api);
  // The plugin's init chain (loadSettings -> getLocalCollections -> render) is
  // async; flush microtasks so the first render() has run.
  return new Promise((resolve) => setTimeout(() => resolve(plugin), 0));
}

test("activate does not throw and subscribes to library events", async () => {
  const api = makeMockApi();
  await activateAndSettle(api);
  assert.equal(typeof api.libraryEvents.trackAdded, "function");
  assert.equal(typeof api.libraryEvents.scanComplete, "function");
});

test("activate registers every expected UI action handler", async () => {
  const api = makeMockApi();
  await activateAndSettle(api);
  for (const id of EXPECTED_ACTIONS) {
    assert.equal(typeof api.uiActions[id], "function", "missing action handler: " + id);
  }
});

test("activate renders the view after init", async () => {
  const api = makeMockApi({ collections: [{ id: 1, name: "Music", path: "/music" }] });
  await activateAndSettle(api);
  const data = api.viewData["auto-tagger-view"];
  assert.ok(data, "expected setViewData('auto-tagger-view', ...) to have been called");
  assert.equal(data.type, "layout");
  assert.ok(Array.isArray(data.children) && data.children.length > 0);
});

test("switching tabs re-renders without throwing", async () => {
  const api = makeMockApi();
  await activateAndSettle(api);
  assert.doesNotThrow(() => api.uiActions["switch-tab"]({ tabId: "settings" }));
  const data = api.viewData["auto-tagger-view"];
  // The settings tab renders settings-row children.
  const kinds = data.children.map((c) => c.type);
  assert.ok(kinds.includes("settings-row"), "settings tab should render settings rows");
});

test("track:added handler is a no-op when auto-assign has no approved items", async () => {
  const api = makeMockApi();
  await activateAndSettle(api);
  // No approved items loaded -> handler must return quietly.
  assert.doesNotThrow(() => api.libraryEvents.trackAdded({ trackId: 1, title: "X" }));
});

test("deactivate is a safe no-op", async () => {
  const api = makeMockApi();
  const plugin = await activateAndSettle(api);
  assert.doesNotThrow(() => plugin.deactivate());
});
