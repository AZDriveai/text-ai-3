import { describe, expect, it } from "vitest";
import { buildWorkspaceExport } from "../shared/workspaceExport";

describe("buildWorkspaceExport", () => {
  it("keeps complete histories for active and inactive conversations", () => {
    const result = buildWorkspaceExport(
      [{ id: "a", title: "A", messages: [{ role: "assistant", content: "old" }] }, { id: "b", title: "B", messages: [{ role: "user", content: "other" }] }],
      "a",
      [{ role: "user", content: "new" }, { role: "assistant", content: "reply" }],
      [],
    );
    expect(result.conversations[0]?.messages).toHaveLength(2);
    expect(result.conversations[1]?.messages).toEqual([{ role: "user", content: "other" }]);
  });
});
