import { describe, expect, it, afterEach } from "vitest";
import { buildSystemPrompt } from "../shared/promptTemplates";
import { buildProviderMessages, providerAvailability } from "./providerRouting";
import { dataProviderAvailability } from "./routers";

afterEach(() => { delete process.env.OPENAI_API_KEY; delete process.env.OPENROUTER_API_KEY; delete process.env.HUGGINGFACE_API_KEY; delete process.env.DATA_PROVIDER_API_KEY; delete process.env.BUILT_IN_FORGE_API_KEY; });

describe("buildProviderMessages", () => {
  it("adds structured image and file parts to the last user turn", () => {
    const messages = buildProviderMessages({ provider: "openai", templateId: "textai-general-assistant", messages: [{ role: "user", content: "حلّل المرفقات" }], attachments: [{ name: "image.png", url: "/manus-storage/image.png", contentType: "image/png" }, { name: "brief.pdf", url: "/manus-storage/brief.pdf", contentType: "application/pdf" }] });
    const user = messages.find((message) => message.role === "user");
    expect(Array.isArray(user?.content)).toBe(true);
    expect(user?.content).toEqual(expect.arrayContaining([expect.objectContaining({ type: "image_url" }), expect.objectContaining({ type: "file_url" })]));
  });
});

describe("TEXT.AI persona and availability contracts", () => {
  it("keeps persona instructions branded and safety-scoped", () => {
    expect(buildSystemPrompt("textai-sarcastic-persona", "openrouter")).toContain("شخصية TEXT.AI الساخرة");
    expect(buildSystemPrompt("textai-enthusiastic-persona", "openai")).toContain("شخصية TEXT.AI الحماسية");
  });
  it("gates search and deep-search from server-side data-provider keys", () => {
    process.env.BUILT_IN_FORGE_API_KEY = "test";
    expect(dataProviderAvailability()).toEqual({ search: true, deepSearch: false });
    process.env.DATA_PROVIDER_API_KEY = "test";
    expect(dataProviderAvailability()).toEqual({ search: true, deepSearch: true });
  });
  it("reports provider availability only from server-side keys", () => {
    process.env.OPENAI_API_KEY = "test";
    process.env.HUGGINGFACE_API_KEY = "test";
    expect(providerAvailability()).toEqual({ openai: true, openrouter: false, huggingface: true });
  });
});
