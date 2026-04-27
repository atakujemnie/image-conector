import { normalizeLicense } from "../license.js";

export function createPixabayProvider(apiKey) {
  return {
    id: "pixabay",
    name: "Pixabay",
    enabled: Boolean(apiKey),
    supportedTypes: ["photo", "illustration", "vector"],
    async search(input) {
      if (!apiKey) return [];

      const imageType = mapAssetType(input.assetType);
      if (!imageType) return [];

      const params = new URLSearchParams({
        key: apiKey,
        q: input.query,
        per_page: String(input.limit),
        safesearch: "true",
        image_type: imageType
      });

      const response = await fetch(`https://pixabay.com/api/?${params}`);

      if (!response.ok) {
        throw new Error(`Pixabay API returned ${response.status}.`);
      }

      const payload = await response.json();
      return (payload.hits || []).map((hit) => ({
        id: `pixabay:${hit.id}`,
        provider: "pixabay",
        providerAssetId: String(hit.id),
        title: hit.tags || "Pixabay image",
        type: input.assetType,
        previewUrl: hit.webformatURL || "",
        thumbnailUrl: hit.previewURL || "",
        sourceUrl: hit.pageURL,
        downloadUrl: hit.largeImageURL || hit.webformatURL || "",
        width: hit.imageWidth,
        height: hit.imageHeight,
        author: hit.user,
        attribution: `Image by ${hit.user} on Pixabay`,
        license: normalizeLicense({
          commercialAllowed: true,
          attributionRequired: false,
          rawRedistributionAllowed: false,
          editorialOnly: false,
          source: "Pixabay",
          licenseUrl: "https://pixabay.com/service/license-summary/"
        })
      }));
    }
  };
}

function mapAssetType(assetType) {
  if (assetType === "photo") return "photo";
  if (assetType === "illustration" || assetType === "clipart") return "illustration";
  if (assetType === "vector" || assetType === "shape") return "vector";
  return null;
}
