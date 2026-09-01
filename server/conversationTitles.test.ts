import { describe, expect, it } from "vitest";
import { deriveConversationTitle } from "../shared/conversationTitles";
import { restoreActiveConversation } from "../shared/conversationPersistence";

describe("deriveConversationTitle", () => {
  it("derives a title once from the first user message", () => {
    expect(deriveConversationTitle("أي اسم مبدئي", [{ role: "assistant", content: "ترحيب" }], "  خطة إطلاق TEXT.AI  ")).toBe("خطة إطلاق TEXT.AI");
  });
  it("does not overwrite a later user message or manual name", () => {
    expect(deriveConversationTitle("الخطة الأصلية", [{ role: "user", content: "أولاً" }], "ثانياً")).toBe("الخطة الأصلية");
    expect(deriveConversationTitle("اسم يدوي", [], "رسالة", true)).toBe("اسم يدوي");
  });
  it("keeps an auto title stable after reload serialization", () => {
    const stored = JSON.parse(JSON.stringify({ id: "restored", title: "خطة الإطلاق", titleGenerated: true, messages: [{ role: "user", content: "ابدأ الخطة" }], attachments: [{ name: "brief.pdf" }] }));
    const restored = restoreActiveConversation([stored], "restored").active;
    expect(deriveConversationTitle(restored.title, restored.messages as Array<{ role: "user" | "assistant"; content: string }>, "رسالة لاحقة", false, restored.titleGenerated)).toBe("خطة الإطلاق");
    expect(restored.attachments).toHaveLength(1);
  });
});
