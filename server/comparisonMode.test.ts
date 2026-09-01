import { describe, expect, it } from "vitest";
import { buildComparisonPlan, comparisonFailure, comparisonSuccess } from "../shared/comparisonMode";

describe("comparison mode", () => {
  it("preserves explicit left and right provider/model selections", () => {
    expect(buildComparisonPlan({ provider: "openai", model: "GPT-5" }, { provider: "openrouter", model: "DeepSeek R1" })).toEqual({
      left: { provider: "openai", model: "GPT-5" },
      right: { provider: "openrouter", model: "DeepSeek R1" },
      status: "ready",
    });
  });

  it("rejects identical sides and exposes success/error states", () => {
    expect(() => buildComparisonPlan({ provider: "openai", model: "GPT-5" }, { provider: "openai", model: "GPT-5" })).toThrow("different model selections");
    expect(comparisonSuccess("left answer", "right answer")).toEqual({ status: "success", left: "left answer", right: "right answer" });
    expect(comparisonFailure("provider unavailable")).toEqual({ status: "error", message: "provider unavailable" });
  });
});
