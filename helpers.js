import { once } from "node:events";
import { createServer } from "node:http";
import { createApp } from "./src/app.js";

export const testSettings = {
  port: 0,
  awsRegion: "us-east-1",
  bedrockModelId: "fake-model",
  bedrockTimeoutMs: 1000,
  maxRequestBytes: 16384,
};

export async function withServer({ bedrock, leadService }, run) {
  const server = createServer(createApp({
    bedrock,
    leadService,
    settings: testSettings,
  }));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

export function fakeBedrockResponse(result, onInvoke = () => {}) {
  return {
    async invoke(input) {
      onInvoke(input);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    },
  };
}
