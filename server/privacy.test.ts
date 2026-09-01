import { describe, expect, it } from "vitest";
import { clearTextAiLocalData, textAiLocalStorageKeys } from "../shared/privacy";

describe("TEXT.AI privacy clearing", () => {
  it("removes all local draft, conversation, and attachment references", () => {
    const removed: string[] = [];
    clearTextAiLocalData({ removeItem: (key) => removed.push(key) });
    expect(removed).toEqual(textAiLocalStorageKeys);
  });

  it("is safe when local storage is empty", () => {
    expect(() => clearTextAiLocalData({ removeItem: () => undefined })).not.toThrow();
  });
});
