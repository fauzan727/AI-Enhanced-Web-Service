import assert from "node:assert/strict";
import test from "node:test";
import { fakeBedrockResponse, withServer } from "../helpers.js";

const modelResult = {
  reply: "Saga Studio can help bring that brand to life.",
  lead: null,
};

test("serves the health endpoint and static landing page", async () => {
  await withServer({ bedrock: fakeBedrockResponse(modelResult) }, async (baseUrl) => {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: "ok" });

    const landing = await fetch(`${baseUrl}/`);
    assert.equal(landing.status, 200);
    assert.match(await landing.text(), /Saga Studio/);
  });
});

test("valid chat calls mocked Bedrock with studio knowledge and returns lead status", async () => {
  let modelInput;
  await withServer({
    bedrock: fakeBedrockResponse(modelResult, (input) => {
      modelInput = input;
    }),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([
        { role: "user", content: "Can you help with a new brand?" },
      ]),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      reply: modelResult.reply,
      lead: null,
      missingFields: ["name", "email", "need", "context", "consent"],
      leadReady: false,
    });
    assert.match(modelInput.system, /Saga Studio/);
    assert.match(modelInput.system, /Video Production/);
    assert.deepEqual(modelInput.messages, [
      { role: "user", content: "Can you help with a new brand?" },
    ]);
  });
});

test("rejects non-alternating chat messages without calling Bedrock", async () => {
  let modelCalled = false;
  await withServer({
    bedrock: fakeBedrockResponse(modelResult, () => {
      modelCalled = true;
    }),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([
        { role: "user", content: "First message" },
        { role: "user", content: "Repeated user role" },
      ]),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "Validation failed");
    assert.ok(body.details.some((issue) => /alternate/.test(issue.message)));
    assert.equal(modelCalled, false);
  });
});

test("enforces chat message count and content size limits", async () => {
  let modelCalled = false;
  await withServer({
    bedrock: fakeBedrockResponse(modelResult, () => {
      modelCalled = true;
    }),
  }, async (baseUrl) => {
    const tooManyMessages = Array.from({ length: 13 }, (_value, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      content: "A message",
    }));
    const tooLongContent = [{ role: "user", content: "x".repeat(1001) }];

    for (const body of [tooManyMessages, tooLongContent]) {
      const response = await fetch(`${baseUrl}/api/v1/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error, "Validation failed");
    }

    assert.equal(modelCalled, false);
  });
});

test("sanitizes provider failures and never returns stack or provider details", async () => {
  await withServer({
    bedrock: {
      async invoke() {
        throw new Error("private AWS credentials response");
      },
    },
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify([
        { role: "user", content: "Tell me about your studio." },
      ]),
    });
    const body = await response.text();

    assert.equal(response.status, 500);
    assert.equal(body, '{"error":"Internal Server Error"}');
    assert.doesNotMatch(body, /private AWS|at\s/);
  });
});
