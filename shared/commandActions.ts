export const textAiCommands = ["new-chat", "settings", "prompts", "conversation-search", "modern-tools"] as const;
export type TextAiCommand = (typeof textAiCommands)[number];

export function isTextAiCommand(value: string): value is TextAiCommand {
  return (textAiCommands as readonly string[]).includes(value);
}
