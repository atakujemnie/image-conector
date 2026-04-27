import { normalizeLicense } from "../license.js";

export function createFreepikProvider(apiKey) {
  return {
    id: "freepik",
    name: "Freepik",
    enabled: Boolean(apiKey),
    supportedTypes: ["photo", "vector", "illustration", "icon", "shape", "clipart"],
    async search(input) {
      if (!apiKey) return [];

      const params = new URLSearchParams({
        term: input.query,
        limit: String(input.limit),
        order: "relevance"
      });

      const response = await fetch(`https://api.freepik.com/v1/resources?${params}`, {
        headers: {
          "x-freepik-api-key": apiKey,
          accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Freepik API returned ${response.status}.`);
      }

      const payload = await response.json();
      const items = payload.data || [];

      return items.map((item) => ({
        id: `freepik:${item.id}`,
        provider: "freepik",
        providerAssetId: String(item.id),
        title: item.title || "Freepik asset",
        type: mapFreepikType(item.type, input.assetType),
        previewUrl: item.image?.source?.url || item.thumbnails?.[0]?.url || "",
        thumbnailUrl: item.image?.source?.url || item.thumbnails?.[0]?.url || "",
        sourceUrl: item.url || "",
        downloadUrl: item.url || "",
        width: item.image?.source?.width || null,
        height: item.image?.source?.height || null,
        author: item.author?.name || "Freepik",
        attribution: "Asset from Freepik",
        license: normalizeLicense({
          commercialAllowed: true,
          attributionRequired: false,
          rawRedistributionAllowed: false,
          editorialOnly: false,
          source: "Freepik",
          licenseUrl: "https://www.freepik.com/legal/terms-of-use"
        })
      }));
    }
  };
}

function mapFreepikType(type, fallback) {
  const normalized = String(type || "").toLowerCase();
  if (normalized.includes("photo")) return "photo";
  if (normalized.includes("icon")) return "icon";
  if (normalized.includes("vector")) return "vector";
  return fallback;
}
