import assert from "node:assert/strict";
import test from "node:test";
import { fakeBedrockResponse, withServer } from "../helpers.js";

const validLead = {
  name: "Jordan Lee",
  email: "jordan@example.com",
  whatsapp: "+628123456789",
  need: "Branding",
  context: "We are preparing to launch a new product.",
  consent: true,
};

test("creates a lead and returns HTTP 201 with a generated string id", async () => {
  await withServer({ bedrock: fakeBedrockResponse({ reply: "Hello", lead: null }) }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validLead),
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(typeof body.id, "string");
    assert.ok(body.id.length > 0);
  });
});

test("rejects missing consent and unsupported service options with clean Zod errors", async () => {
  await withServer({ bedrock: fakeBedrockResponse({ reply: "Hello", lead: null }) }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/leads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...validLead, consent: false, need: "Consulting" }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.error, "Validation failed");
    assert.ok(body.details.some((issue) => issue.path === "consent"));
    assert.ok(body.details.some((issue) => issue.path === "need"));
    assert.equal(JSON.stringify(body).includes("stack"), false);
  });
});
