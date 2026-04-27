import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const usageLogPath = resolve(process.cwd(), "data", "usage-log.jsonl");

export async function recordUsage(entry) {
  const record = {
    ...entry,
    recordedAt: new Date().toISOString()
  };

  await mkdir(dirname(usageLogPath), { recursive: true });
  await appendFile(usageLogPath, `${JSON.stringify(record)}\n`, "utf8");

  return record;
}
