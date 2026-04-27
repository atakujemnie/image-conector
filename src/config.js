import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

loadDotEnv();

export const config = {
  port: Number(process.env.PORT || 8787),
  providers: parseProviders(process.env.PROVIDERS),
  keys: {
    pexels: process.env.PEXELS_API_KEY || "",
    pixabay: process.env.PIXABAY_API_KEY || "",
    freepik: process.env.FREEPIK_API_KEY || "",
    iconfinder: process.env.ICONFINDER_API_KEY || ""
  }
};

function parseProviders(value) {
  if (!value) return null;
  return new Set(
    value
      .split(",")
      .map((provider) => provider.trim().toLowerCase())
      .filter(Boolean)
  );
}

function loadDotEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}
