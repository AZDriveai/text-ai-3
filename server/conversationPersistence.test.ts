import { describe, expect, it } from "vitest";
import { restoreActiveConversation } from "../shared/conversationPersistence";

describe("restoreActiveConversation", () => {
  it("restores the requested conversation with its messages, attachments, and title state", () => {
    const result = restoreActiveConversation([
      { id: "one", title: "أولى" },
      { id: "two", title: "خطة", messages: [{ role: "user", content: "ابدأ" }], attachments: [{ name: "brief.pdf" }], titleGenerated: true },
    ], "two");
    expect(result.activeId).toBe("two");
    expect(result.active?.messages).toHaveLength(1);
    expect(result.active?.attachments).toHaveLength(1);
    expect(result.active?.titleGenerated).toBe(true);
  });
  it("falls back safely when the stored active id is missing", () => {
    expect(restoreActiveConversation([{ id: "one", title: "أولى" }], "missing").activeId).toBe("one");
  });
  it("selects the matching conversation from serialized localStorage-style values", () => {
    const storedConversations = JSON.parse(JSON.stringify([{ id: "alpha", title: "ألف" }, { id: "beta", title: "باء", messages: [{ role: "assistant", content: "محفوظ" }] }]));
    const storedActiveId = JSON.parse(JSON.stringify("beta"));
    expect(restoreActiveConversation(storedConversations, storedActiveId).active?.id).toBe("beta");
  });
});
