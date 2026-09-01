export type PersistedConversation = { id: string; title: string; messages?: unknown[]; attachments?: unknown[]; titleGenerated?: boolean };

export function restoreActiveConversation(conversations: PersistedConversation[], requestedId: string) {
  const active = conversations.find((conversation) => conversation.id === requestedId) ?? conversations[0];
  return { activeId: active?.id ?? requestedId, active };
}
