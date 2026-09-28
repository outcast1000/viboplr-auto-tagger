const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadPlugin } = require("./harness/sandbox.js");
const { makeMockApi } = require("./harness/mock-api.js");

const viewHeaderFor = loadPlugin()._viewHeaderFor;

function settle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

test("no rules and no candidates: descriptive subtitle, 'No rules yet'", () => {
  const h = viewHeaderFor({ ruleCount: 0, candidateCount: 0, autoAssign: true });
  assert.match(h.subtitle, /recurring patterns/);
  assert.deepEqual(h.status, { variant: "muted", label: "No rules yet" });
  assert.deepEqual(h.actions, []);
});

test("rules with auto-assign on: count subtitle, success status", () => {
  const h = viewHeaderFor({ ruleCount: 1, candidateCount: 0, autoAssign: true });
  assert.equal(h.subtitle, "1 rule");
  assert.deepEqual(h.status, { variant: "success", label: "Auto-assign on" });
});

test("auto-assign off is muted", () => {
  const h = viewHeaderFor({ ruleCount: 3, candidateCount: 0, autoAssign: false });
  assert.deepEqual(h.status, { variant: "muted", label: "Auto-assign off" });
});

test("candidates to review are counted, with thousands separators", () => {
  const h = viewHeaderFor({ ruleCount: 1204, candidateCount: 2, autoAssign: true });
  assert.equal(h.subtitle, "1,204 rules · 2 candidates to review");
  const none = viewHeaderFor({ ruleCount: 0, candidateCount: 1, autoAssign: true });
  assert.equal(none.subtitle, "0 rules · 1 candidate to review");
});

test("running work wins over the idle status", () => {
  assert.equal(viewHeaderFor({ ruleCount: 5, analyzing: true, autoAssign: true }).status.label, "Analyzing…");
  assert.equal(viewHeaderFor({ ruleCount: 5, applying: true, autoAssign: true }).status.label, "Applying rules…");
});

test("header fits the host's limits", () => {
  const cases = [
    { ruleCount: 0, candidateCount: 0 },
    { ruleCount: 999999, candidateCount: 999999, autoAssign: true },
    { ruleCount: 2, applying: true },
  ];
  for (const c of cases) {
    const h = viewHeaderFor(c);
    assert.ok(h.subtitle.length <= 160, h.subtitle);
    assert.ok(h.status.label.length <= 32, h.status.label);
    assert.ok(["success", "warning", "error", "muted"].includes(h.status.variant));
  }
});

test("activate pushes the header once, and not again when nothing changed", async () => {
  const api = makeMockApi({ store: { "approved-items": [{ ngram: "jazz", type: "tag" }] } });
  loadPlugin().activate(api);
  await settle();
  assert.equal(api.viewHeaders.length, 1);
  assert.equal(api.viewHeaders[0].viewId, "auto-tagger-view");
  assert.equal(api.viewHeaders[0].header.subtitle, "1 rule");
  api.uiActions["switch-tab"]({ tabId: "settings" });
  api.uiActions["analyze-search"]({ query: "x" });
  assert.equal(api.viewHeaders.length, 1, "unchanged header must not be re-sent");
  api.uiActions["toggle-auto-assign"]();
  assert.equal(api.viewHeaders.length, 2);
  assert.equal(api.viewHeaders[1].header.status.label, "Auto-assign off");
});

test("run-approved shows 'Applying rules…' then returns to idle", async () => {
  const api = makeMockApi({ store: { "approved-items": [{ ngram: "jazz", type: "tag" }] } });
  loadPlugin().activate(api);
  await settle();
  api.uiActions["run-approved"]();
  assert.equal(api.viewHeaders[api.viewHeaders.length - 1].header.status.label, "Applying rules…");
  await settle();
  assert.equal(api.viewHeaders[api.viewHeaders.length - 1].header.status.label, "Auto-assign on");
});

test("older hosts without setViewHeader still activate and render", async () => {
  const api = makeMockApi({ legacyHost: true });
  loadPlugin().activate(api);
  await settle();
  assert.equal(typeof api.ui.setViewHeader, "undefined");
  assert.ok(api.viewData["auto-tagger-view"]);
});
