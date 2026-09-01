import { describe, expect, it } from "vitest";
import { buildSystemPrompt, templatesForProvider, textAiPromptTemplates } from "../shared/promptTemplates";

describe("TEXT.AI prompt templates", () => {
  it("provides templates for all three configured providers", () => {
    expect(templatesForProvider("openai").length).toBeGreaterThan(0);
    expect(templatesForProvider("openrouter").length).toBe(textAiPromptTemplates.length);
    expect(templatesForProvider("huggingface").length).toBe(textAiPromptTemplates.length);
  });

  it("uses TEXT.AI identity and provider-specific routing notes", () => {
    const openRouterPrompt = buildSystemPrompt("textai-builder", "openrouter");
    const huggingFacePrompt = buildSystemPrompt("textai-builder", "huggingface");
    expect(openRouterPrompt).toContain("TEXT.AI");
    expect(openRouterPrompt).toContain("OpenRouter");
    expect(huggingFacePrompt).toContain("Hugging Face");
    expect(openRouterPrompt).not.toContain("أنت كلود");
  });
});
