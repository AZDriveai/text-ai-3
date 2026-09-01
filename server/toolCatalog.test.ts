import { describe, expect, it } from "vitest";
import { textAiTools, toolRequiresAvailableKeys } from "../shared/toolCatalog";

describe("TEXT.AI thirty-tool catalog", () => {
  it("contains thirty uniquely numbered tools with required key metadata", () => {
    expect(textAiTools).toHaveLength(30);
    expect(new Set(textAiTools.map((tool) => tool.slug)).size).toBe(30);
    expect(textAiTools.map((tool) => tool.id)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
    for (const tool of textAiTools) {
      expect(tool.name.length).toBeGreaterThan(2);
      expect(tool.requiredKeys.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(12);
    }
  });

  it("marks a tool ready only when every required server key is available", () => {
    const tool = textAiTools.find((item) => item.slug === "open-sora-ui");
    expect(tool).toBeDefined();
    expect(toolRequiresAvailableKeys(tool!, { HF_TOKEN: true, OPENAI_API_KEY: true })).toBe(true);
    expect(toolRequiresAvailableKeys(tool!, { HF_TOKEN: true, OPENAI_API_KEY: false })).toBe(false);
  });
});
