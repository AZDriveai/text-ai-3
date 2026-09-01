import { afterEach, describe, expect, it, vi } from "vitest";
import { listProviderModels, providerAvailability } from "./providerRouting";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.HF_TOKEN;
  delete process.env.HUGGINGFACE_API_KEY;
});

describe("provider model discovery", () => {
  it("recognizes HF_TOKEN as the Hugging Face server credential", () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.HUGGINGFACE_API_KEY;
    process.env.HF_TOKEN = "hf-test-token";
    expect(providerAvailability()).toEqual({ openai: false, openrouter: false, huggingface: true });
  });

  it("loads all provider catalogs without returning secret values", async () => {
    process.env.OPENAI_API_KEY = "openai-test-token";
    process.env.OPENROUTER_API_KEY = "openrouter-test-token";
    process.env.HF_TOKEN = "hf-test-token";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const data = url.includes("openai.com")
        ? [{ id: "gpt-5", owned_by: "openai" }]
        : url.includes("openrouter.ai")
          ? [{ id: "openrouter/auto", name: "Auto Router" }]
          : [{ id: "meta-llama/Llama-3.3-70B-Instruct", owned_by: "meta" }];
      return { ok: true, json: async () => ({ data }) } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await listProviderModels();

    expect(result.openai.models).toEqual([{ id: "gpt-5", ownedBy: "openai" }]);
    expect(result.openrouter.models).toEqual([{ id: "openrouter/auto", name: "Auto Router" }]);
    expect(result.huggingface.models[0]?.id).toContain("Llama");
    expect(JSON.stringify(result)).not.toContain("test-token");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("reports an unavailable provider without throwing when its catalog endpoint fails", async () => {
    process.env.OPENAI_API_KEY = "openai-test-token";
    process.env.OPENROUTER_API_KEY = "openrouter-test-token";
    process.env.HF_TOKEN = "hf-test-token";
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => ({ ok: String(input).includes("openai.com"), status: 503, json: async () => ({ data: [] }) } as Response)));

    const result = await listProviderModels();

    expect(result.openai.available).toBe(true);
    expect(result.openrouter.available).toBe(false);
    expect(result.huggingface.available).toBe(false);
    expect(result.openrouter.models).toHaveLength(0);
  });
});
