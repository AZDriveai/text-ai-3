import { describe, expect, it } from "vitest";
import { deleteConversation, renameConversation, type ConversationRecord } from "../shared/conversations";

describe("conversation record helpers", () => {
  const records: ConversationRecord[] = [{ id: "a", title: "متكرر" }, { id: "b", title: "متكرر" }];

  it("renames only the selected stable ID", () => {
    expect(renameConversation(records, "a", "جديد")).toEqual([{ id: "a", title: "جديد" }, { id: "b", title: "متكرر" }]);
  });

  it("deletes only the selected stable ID", () => {
    expect(deleteConversation(records, "b")).toEqual([{ id: "a", title: "متكرر" }]);
  });
});
