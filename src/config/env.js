import "dotenv/config";

function positiveInteger(value, fallback, name) {
  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

export const config = Object.freeze({
  port: positiveInteger(process.env.PORT, 3000, "PORT"),
  awsRegion: process.env.AWS_REGION?.trim() || "",
  bedrockModelId:
    process.env.BEDROCK_MODEL_ID?.trim() ||
    "anthropic.claude-3-5-sonnet-20241022-v2:0",
  bedrockTimeoutMs: positiveInteger(
    process.env.BEDROCK_TIMEOUT_MS,
    30000,
    "BEDROCK_TIMEOUT_MS",
  ),
  maxRequestBytes: positiveInteger(
    process.env.MAX_REQUEST_BYTES,
    16384,
    "MAX_REQUEST_BYTES",
  ),
});
