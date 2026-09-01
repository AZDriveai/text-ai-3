export type ExportConversation<TMessage> = { id: string; title: string; messages?: TMessage[]; [key: string]: unknown };

export function buildWorkspaceExport<TMessage>(conversations: ExportConversation<TMessage>[], activeConversationId: string, activeMessages: TMessage[], savedResponses: unknown[]) {
  return {
    conversations: conversations.map((conversation) => ({ ...conversation, messages: conversation.id === activeConversationId ? activeMessages : conversation.messages ?? [] })),
    savedResponses,
  };
}
