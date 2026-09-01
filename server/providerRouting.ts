import { buildSystemPrompt, type TextAiProvider } from "../shared/promptTemplates";

type ChatTurn = { role: "user" | "assistant"; content: string };
type AttachmentContext = { name: string; url: string; contentType: string };
export type ReasoningDepth = "minimal" | "low" | "medium" | "high";
type ProviderContent = string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } } | { type: "file_url"; file_url: { url: string; mime_type?: string } }>;

type ProviderConfig = { keyNames: readonly string[]; endpoint: string };
export type ProviderModel = { id: string; name?: string; ownedBy?: string };
export type ProviderModelStatus = { available: boolean; models: ProviderModel[]; error?: string };
export type ProviderModelsResponse = Record<TextAiProvider, ProviderModelStatus>;

const providerConfig: Record<TextAiProvider, ProviderConfig> = {
  openai: { keyNames: ["OPENAI_API_KEY"], endpoint: "https://api.openai.com/v1/chat/completions" },
  openrouter: { keyNames: ["OPENROUTER_API_KEY"], endpoint: "https://openrouter.ai/api/v1/chat/completions" },
  huggingface: { keyNames: ["HF_TOKEN", "HUGGINGFACE_API_KEY"], endpoint: "https://router.huggingface.co/v1/chat/completions" },
};

const modelCatalogEndpoints: Record<TextAiProvider, string> = {
  openai: "https://api.openai.com/v1/models",
  openrouter: "https://openrouter.ai/api/v1/models",
  huggingface: "https://router.huggingface.co/v1/models",
};

function providerApiKey(provider: TextAiProvider) {
  return providerConfig[provider].keyNames.map((keyName) => process.env[keyName]).find(Boolean);
}

export function providerAvailability() {
  return Object.fromEntries(Object.keys(providerConfig).map((provider) => [provider, Boolean(providerApiKey(provider as TextAiProvider))])) as Record<TextAiProvider, boolean>;
}

function normalizeModels(payload: unknown): ProviderModel[] {
  if (!payload || typeof payload !== "object" || !("data" in payload) || !Array.isArray(payload.data)) return [];
  const seen = new Set<string>();
  const models: ProviderModel[] = [];
  for (const item of payload.data) {
    if (!item || typeof item !== "object" || !("id" in item) || typeof item.id !== "string" || !item.id.trim() || seen.has(item.id)) continue;
    seen.add(item.id);
    const record = item as { id: string; name?: unknown; owned_by?: unknown };
    models.push({ id: record.id, ...(typeof record.name === "string" ? { name: record.name } : {}), ...(typeof record.owned_by === "string" ? { ownedBy: record.owned_by } : {}) });
  }
  return models;
}

async function fetchProviderModels(provider: TextAiProvider): Promise<ProviderModelStatus> {
  const token = providerApiKey(provider);
  if (!token) return { available: false, models: [], error: "لا يوجد مفتاح مهيأ لهذا المزود." };
  try {
    const response = await fetch(modelCatalogEndpoints[provider], {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!response.ok) return { available: false, models: [], error: `تعذر قراءة النماذج (HTTP ${response.status}).` };
    const models = normalizeModels(await response.json());
    return { available: true, models, ...(models.length ? {} : { error: "استجاب المزود دون قائمة نماذج قابلة للاستخدام." }) };
  } catch {
    return { available: false, models: [], error: "تعذر الاتصال بخدمة قائمة النماذج." };
  }
}

export async function listProviderModels(): Promise<ProviderModelsResponse> {
  const entries = await Promise.all((Object.keys(providerConfig) as TextAiProvider[]).map(async (provider) => [provider, await fetchProviderModels(provider)] as const));
  return Object.fromEntries(entries) as ProviderModelsResponse;
}

export function buildProviderMessages(input: { provider: TextAiProvider; templateId: string; extraInstruction?: string; attachments?: AttachmentContext[]; messages: ChatTurn[] }): Array<{ role: "system" | "user" | "assistant"; content: ProviderContent }> {
  const context = input.attachments?.length ? `\n\nمرفقات المستخدم متاحة كعناصر متعددة الوسائط؛ استخدمها عند الحاجة، ولا تدّع قراءة ملف لا يدعمه النموذج.` : "";
  const turns = input.messages.map((message) => ({ role: message.role, content: message.content as ProviderContent }));
  const lastUserIndex = turns.map((turn) => turn.role).lastIndexOf("user");
  if (lastUserIndex >= 0 && input.attachments?.length) {
    const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } } | { type: "file_url"; file_url: { url: string; mime_type?: string } }> = [{ type: "text", text: String(turns[lastUserIndex].content) }];
    for (const attachment of input.attachments) {
      if (attachment.contentType.startsWith("image/")) content.push({ type: "image_url", image_url: { url: attachment.url, detail: "auto" } });
      else content.push({ type: "file_url", file_url: { url: attachment.url, mime_type: attachment.contentType } });
    }
    turns[lastUserIndex] = { role: "user", content };
  }
  return [{ role: "system", content: buildSystemPrompt(input.templateId, input.provider, `${input.extraInstruction ?? ""}${context}`) }, ...turns];
}

export async function routeTextAiChat(input: {
  provider: TextAiProvider;
  model: string;
  templateId: string;
  messages: ChatTurn[];
  extraInstruction?: string;
  attachments?: AttachmentContext[];
  reasoningDepth?: ReasoningDepth;
}) {
  const token = providerApiKey(input.provider);
  const config = providerConfig[input.provider];
  if (!token) throw new Error(`${input.provider} is not configured on the server`);
  const startedAt = Date.now();
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(input.provider === "openrouter" ? { "HTTP-Referer": "https://text.ai", "X-Title": "TEXT.AI" } : {}),
    },
    body: JSON.stringify({
      model: input.model,
      messages: buildProviderMessages(input),
      temperature: 0.7,
      ...(input.provider === "openai" && input.reasoningDepth ? { reasoning: { effort: input.reasoningDepth } } : {}),
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Provider request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: { total_tokens?: number } };
  const content = payload.choices?.[0]?.message?.content ?? "";
  return { content, provider: input.provider, model: input.model, latencyMs: Date.now() - startedAt, tokenEstimate: payload.usage?.total_tokens ?? Math.ceil(content.length / 4) };
}
