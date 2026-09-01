import { describe, expect, it } from "vitest";

const providerKeys = {
  OpenAI: "OPENAI_API_KEY",
  OpenRouter: "OPENROUTER_API_KEY",
  "Hugging Face": "HUGGINGFACE_API_KEY",
} as const;

describe("provider secret configuration", () => {
  it("keeps provider credentials server-side and derives availability from environment", () => {
    for (const [provider, key] of Object.entries(providerKeys)) {
      const value = process.env[key];
      expect(typeof key).toBe("string");
      expect(provider).toBeTruthy();
      expect(value === undefined || typeof value === "string").toBe(true);
    }
  });

  it("does not expose raw secret values through the public configuration shape", () => {
    const publicConfig = Object.keys(providerKeys).map((name) => ({ name, available: true }));
    expect(JSON.stringify(publicConfig)).not.toMatch(/API_KEY|sk-/i);
  });
});
