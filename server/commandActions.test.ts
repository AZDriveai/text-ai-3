import { describe, expect, it } from "vitest";
import { isTextAiCommand, textAiCommands } from "../shared/commandActions";

describe("TEXT.AI command actions", () => {
  it("exposes the core actions used by the command palette", () => {
    expect(textAiCommands).toEqual(["new-chat", "settings", "prompts", "conversation-search", "modern-tools"]);
  });

  it("rejects unknown action identifiers", () => {
    expect(isTextAiCommand("new-chat")).toBe(true);
    expect(isTextAiCommand("delete-everything")).toBe(false);
  });
});
