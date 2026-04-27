import { getProviders } from "./providers/index.js";
import { validateUsage } from "./license.js";
import { recordUsage } from "./usage-store.js";

const assetCache = new Map();

const allowedAssetTypes = new Set([
  "photo",
  "icon",
  "illustration",
  "vector",
  "shape",
  "clipart",
  "texture"
]);

export async function searchAssets(input) {
  const normalized = normalizeSearchInput(input);
  const providers = getProviders().filter((provider) =>
    provider.supportedTypes.includes(normalized.assetType)
  );

  const providerResults = await Promise.allSettled(
    providers.map(async (provider) => ({
      provider: provider.id,
      assets: await provider.search(normalized)
    }))
  );

  const errors = [];
  const assets = [];

  for (const result of providerResults) {
    if (result.status === "rejected") {
      errors.push(result.reason.message);
      continue;
    }

    for (const asset of result.value.assets) {
      const validation = validateUsage(asset, normalized.usage, {
        requireNoAttribution: normalized.requireNoAttribution
      });

      if (!validation.approved) continue;

      const enriched = {
        ...asset,
        licenseStatus: validation,
        decisionHints: createDecisionHints(asset, normalized)
      };
      assetCache.set(enriched.id, enriched);
      assets.push(enriched);
    }
  }

  return {
    query: normalized.query,
    assetType: normalized.assetType,
    usage: normalized.usage,
    count: assets.length,
    assets: assets.slice(0, normalized.limit),
    providerErrors: errors
  };
}

export function validateAsset(input) {
  const asset = resolveAsset(input);
  const usage = requireString(input.usage, "usage");
  return {
    assetId: asset.id,
    usage,
    ...validateUsage(asset, usage, {
      requireNoAttribution: Boolean(input.requireNoAttribution)
    })
  };
}

export function downloadAsset(input) {
  const asset = resolveAsset(input);
  const usage = requireString(input.usage, "usage");
  const validation = validateUsage(asset, usage, {
    requireNoAttribution: Boolean(input.requireNoAttribution)
  });

  if (!validation.approved) {
    const error = new Error(validation.reason);
    error.statusCode = 403;
    throw error;
  }

  return {
    assetId: asset.id,
    provider: asset.provider,
    url: asset.downloadUrl,
    previewUrl: asset.previewUrl,
    sourceUrl: asset.sourceUrl,
    license: asset.license,
    requiredAttribution: validation.requiredAttribution,
    note: "This URL follows provider terms as normalized by the connector. Do not expose raw provider URLs when your provider contract forbids it."
  };
}

export async function recordAssetUsage(input) {
  const asset = resolveAsset(input);
  const usage = requireString(input.usage, "usage");
  const projectId = input.projectId ? String(input.projectId) : null;
  const outputId = input.outputId ? String(input.outputId) : null;

  const validation = validateUsage(asset, usage, {
    requireNoAttribution: Boolean(input.requireNoAttribution)
  });

  if (!validation.approved) {
    const error = new Error(validation.reason);
    error.statusCode = 403;
    throw error;
  }

  return recordUsage({
    assetId: asset.id,
    provider: asset.provider,
    providerAssetId: asset.providerAssetId,
    usage,
    projectId,
    outputId,
    sourceUrl: asset.sourceUrl,
    license: asset.license,
    requiredAttribution: validation.requiredAttribution
  });
}

function normalizeSearchInput(input) {
  const query = requireString(input.query, "query");
  const assetType = requireString(input.assetType || input.type, "assetType");
  const usage = requireString(input.usage, "usage");

  if (!allowedAssetTypes.has(assetType)) {
    const error = new Error(`Unsupported assetType "${assetType}".`);
    error.statusCode = 400;
    throw error;
  }

  return {
    query,
    assetType,
    usage,
    requireNoAttribution: Boolean(input.requireNoAttribution),
    limit: Math.max(1, Math.min(Number(input.limit || 10), 50)),
    orientation: input.orientation ? String(input.orientation) : ""
  };
}

function resolveAsset(input) {
  const asset = input.asset || assetCache.get(requireString(input.assetId, "assetId"));
  if (!asset) {
    const error = new Error("Asset not found in cache. Search first or pass a full asset object.");
    error.statusCode = 404;
    throw error;
  }
  return asset;
}

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    const error = new Error(`Field "${field}" is required.`);
    error.statusCode = 400;
    throw error;
  }

  return value.trim();
}

function createDecisionHints(asset, input) {
  const hints = {
    bestFor: [],
    avoidFor: [],
    hasPeople: null,
    isEditorialOnly: asset.license.editorialOnly
  };

  if (asset.type === "photo" && input.usage === "commercial_website") {
    hints.bestFor.push("landing_hero", "website_background");
  }

  if (asset.type === "icon") {
    hints.bestFor.push("app_ui", "feature_icon");
  }

  if (!asset.license.rawRedistributionAllowed) {
    hints.avoidFor.push("template_resale", "raw_asset_marketplace");
  }

  return hints;
}
