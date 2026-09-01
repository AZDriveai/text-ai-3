export type PromptPreset = { name: string; template: string };

export function extractPromptVariables(template: string) {
  return Array.from(new Set(Array.from(template.matchAll(/{{([^}]+)}}/g)).map((match) => match[1].trim())));
}

export function fillPromptTemplate(template: string, values: Record<string, string>) {
  return template.replace(/{{([^}]+)}}/g, (_match, variable: string) => values[variable.trim()] || `[${variable.trim()}]`);
}
