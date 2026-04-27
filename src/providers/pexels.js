import { normalizeLicense } from "../license.js";

export function createPexelsProvider(apiKey) {
  return {
    id: "pexels",
    name: "Pexels",
    enabled: Boolean(apiKey),
    supportedTypes: ["photo"],
    async search(input) {
      if (!apiKey || input.assetType !== "photo") return [];

      const params = new URLSearchParams({
        query: input.query,
        per_page: String(input.limit),
        orientation: input.orientation || ""
      });

      const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
        headers: { authorization: apiKey }
      });

      if (!response.ok) {
        throw new Error(`Pexels API returned ${response.status}.`);
      }

      const payload = await response.json();
      return (payload.photos || []).map((photo) => ({
        id: `pexels:${photo.id}`,
        provider: "pexels",
        providerAssetId: String(photo.id),
        title: photo.alt || "Pexels photo",
        type: "photo",
        previewUrl: photo.src?.medium || photo.src?.small || "",
        thumbnailUrl: photo.src?.tiny || photo.src?.small || "",
        sourceUrl: photo.url,
        downloadUrl: photo.src?.original || photo.src?.large2x || photo.src?.large || "",
        width: photo.width,
        height: photo.height,
        author: photo.photographer,
        attribution: `Photo by ${photo.photographer} on Pexels`,
        license: normalizeLicense({
          commercialAllowed: true,
          attributionRequired: false,
          rawRedistributionAllowed: false,
          editorialOnly: false,
          source: "Pexels",
          licenseUrl: "https://www.pexels.com/license/"
        })
      }));
    }
  };
}
