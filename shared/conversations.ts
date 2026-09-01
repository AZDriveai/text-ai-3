export type ConversationRecord = { id: string; title: string };

export function renameConversation(records: ConversationRecord[], id: string, title: string) {
  return records.map((record) => record.id === id ? { ...record, title } : record);
}

export function deleteConversation(records: ConversationRecord[], id: string) {
  return records.filter((record) => record.id !== id);
}
