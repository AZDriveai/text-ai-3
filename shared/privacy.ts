export const textAiLocalStorageKeys = ["textai-draft", "textai-conversations", "textai-attachments"] as const;

export function clearTextAiLocalData(storage: Pick<Storage, "removeItem">) {
  for (const key of textAiLocalStorageKeys) storage.removeItem(key);
}
