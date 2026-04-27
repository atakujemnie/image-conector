import test from "node:test";
import assert from "node:assert/strict";
import { normalizeLicense, validateUsage } from "../src/license.js";

test("approves commercial website usage for no-attribution assets", () => {
  const asset = {
    license: normalizeLicense({
      commercialAllowed: true,
      attributionRequired: false,
      rawRedistributionAllowed: false,
      editorialOnly: false
    })
  };

  const result = validateUsage(asset, "commercial_website", {
    requireNoAttribution: true
  });

  assert.equal(result.approved, true);
});

test("rejects assets requiring attribution when no attribution is required", () => {
  const asset = {
    license: normalizeLicense({
      commercialAllowed: true,
      attributionRequired: true,
      rawRedistributionAllowed: false,
      editorialOnly: false
    })
  };

  const result = validateUsage(asset, "advertisement", {
    requireNoAttribution: true
  });

  assert.equal(result.approved, false);
  assert.match(result.reason, /requires attribution/i);
});

test("rejects template resale without raw redistribution rights", () => {
  const asset = {
    license: normalizeLicense({
      commercialAllowed: true,
      attributionRequired: false,
      rawRedistributionAllowed: false,
      editorialOnly: false
    })
  };

  const result = validateUsage(asset, "template_for_resale");

  assert.equal(result.approved, false);
  assert.match(result.reason, /resale/i);
});
