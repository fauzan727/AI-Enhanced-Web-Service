import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export class BedrockClient {
  constructor({ region, modelId, timeoutMs }) {
    this.modelId = modelId;
    this.timeoutMs = timeoutMs;
    this.client = new BedrockRuntimeClient({
      region: region || undefined,
      maxAttempts: 2,
    });
  }

  async invoke({ system, messages }) {
    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(
        JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 900,
          system,
          messages,
        }),
      ),
    });
    const response = await this.client.send(command, {
      abortSignal: AbortSignal.timeout(this.timeoutMs),
    });

    return JSON.parse(new TextDecoder().decode(response.body));
  }
}
