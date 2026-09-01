export function deriveConversationTitle(currentTitle: string, messages: Array<{ role: "user" | "assistant"; content: string }>, firstUserMessage: string, manuallyNamed = false, titleGenerated = false): string {
  if (manuallyNamed || titleGenerated || messages.some((message) => message.role === "user")) return currentTitle;
  const normalized = firstUserMessage.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, 42) : currentTitle;
}
