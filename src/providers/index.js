import { config } from "../config.js";
import { createPexelsProvider } from "./pexels.js";
import { createPixabayProvider } from "./pixabay.js";
import { createFreepikProvider } from "./freepik.js";
import { createIconfinderProvider } from "./iconfinder.js";

const allProviders = [
  createPexelsProvider(config.keys.pexels),
  createPixabayProvider(config.keys.pixabay),
  createFreepikProvider(config.keys.freepik),
  createIconfinderProvider(config.keys.iconfinder)
];

export function getProviders() {
  return allProviders.filter((provider) => {
    if (!provider.enabled) return false;
    if (!config.providers) return true;
    return config.providers.has(provider.id);
  });
}

export function describeProviders() {
  return allProviders.map((provider) => ({
    id: provider.id,
    name: provider.name,
    enabled: provider.enabled && (!config.providers || config.providers.has(provider.id)),
    supportedTypes: provider.supportedTypes
  }));
}
