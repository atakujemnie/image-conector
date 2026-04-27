import { createServer } from "node:http";
import { config } from "./config.js";
import { readJsonBody, sendError, sendJson, notFound } from "./http.js";
import { describeProviders } from "./providers/index.js";
import {
  downloadAsset,
  recordAssetUsage,
  searchAssets,
  validateAsset
} from "./assets.js";

const routes = {
  "GET /health": async () => ({
    ok: true,
    service: "asset-connector-api"
  }),
  "GET /v1/providers": async () => ({
    providers: describeProviders()
  }),
  "POST /v1/assets/search": async (request) => searchAssets(await readJsonBody(request)),
  "POST /v1/assets/validate": async (request) => validateAsset(await readJsonBody(request)),
  "POST /v1/assets/download": async (request) => downloadAsset(await readJsonBody(request)),
  "POST /v1/assets/usage": async (request) => recordAssetUsage(await readJsonBody(request))
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const key = `${request.method} ${url.pathname}`;
  const handler = routes[key];

  if (!handler) {
    notFound(response);
    return;
  }

  try {
    const payload = await handler(request);
    sendJson(response, 200, payload);
  } catch (error) {
    sendError(response, error);
  }
});

server.listen(config.port, () => {
  console.log(`Asset Connector API listening on http://localhost:${config.port}`);
});
