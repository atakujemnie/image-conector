import { normalizeLicense } from "../license.js";

export function createIconfinderProvider(apiKey) {
  return {
    id: "iconfinder",
    name: "Iconfinder",
    enabled: Boolean(apiKey),
    supportedTypes: ["icon", "illustration", "vector", "shape", "clipart"],
    async search(input) {
      if (!apiKey || input.assetType === "photo") return [];

      const params = new URLSearchParams({
        query: input.query,
        count: String(input.limit),
        premium: "all",
        vector: "all"
      });

      const response = await fetch(`https://api.iconfinder.com/v4/icons/search?${params}`, {
        headers: {
          authorization: `Bearer ${apiKey}`,
          accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Iconfinder API returned ${response.status}.`);
      }

      const payload = await response.json();
      return (payload.icons || []).map((icon) => {
        const raster = icon.raster_sizes?.at(-1)?.formats?.[0];
        const vector = icon.vector_sizes?.[0]?.formats?.[0];
        const license = icon.licenses?.[0] || {};

        return {
          id: `iconfinder:${icon.icon_id}`,
          provider: "iconfinder",
          providerAssetId: String(icon.icon_id),
          title: icon.tags?.join(", ") || "Iconfinder icon",
          type: "icon",
          previewUrl: raster?.preview_url || "",
          thumbnailUrl: icon.raster_sizes?.[0]?.formats?.[0]?.preview_url || "",
          sourceUrl: icon.iconset?.website_url || "",
          downloadUrl: vector?.download_url || raster?.download_url || "",
          width: raster?.width || null,
          height: raster?.height || null,
          author: icon.iconset?.author?.name || "",
          attribution: icon.iconset?.author?.name ? `Icon by ${icon.iconset.author.name}` : null,
          license: normalizeLicense({
            commercialAllowed: true,
            attributionRequired: Boolean(license.requires_attribution),
            rawRedistributionAllowed: false,
            editorialOnly: false,
            source: "Iconfinder",
            licenseUrl: license.url || "https://www.iconfinder.com/licenses"
          })
        };
      });
    }
  };
}
