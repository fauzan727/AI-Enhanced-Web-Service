import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/env.js";
import { createChatRouter } from "./routes/chat.js";
import { createLeadsRouter } from "./routes/leads.js";
import { BedrockClient } from "./services/bedrock-client.js";
import { createChatAssistant } from "./services/chat-assistant.js";
import sagaStudioKnowledge from "./knowledge/saga-studio.js";
import { createLeadService } from "./services/lead-service.js";
import { errorHandler } from "./middleware/error-handler.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export function createApp({
  bedrock,
  knowledge = sagaStudioKnowledge,
  leadService = createLeadService(),
  settings = config,
} = {}) {
  const model = bedrock ?? new BedrockClient({
    region: settings.awsRegion,
    modelId: settings.bedrockModelId,
    timeoutMs: settings.bedrockTimeoutMs,
  });
  const assistant = createChatAssistant({ bedrock: model, knowledge });
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: settings.maxRequestBytes }));
  app.use(express.static(path.join(projectRoot, "..", "public")));
  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });
  app.use("/api/v1/chat", createChatRouter({ assistant }));
  app.use("/api/v1/leads", createLeadsRouter({ leadService }));
  app.use((_request, response) => {
    response.status(404).json({ error: "Not Found" });
  });
  app.use(errorHandler);

  return app;
}
