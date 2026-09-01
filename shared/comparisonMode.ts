export type ComparisonProvider = "openai" | "openrouter" | "huggingface";

export type ComparisonSide = { provider: ComparisonProvider; model: string };

export function buildComparisonPlan(left: ComparisonSide, right: ComparisonSide) {
  if (left.provider === right.provider && left.model === right.model) {
    throw new Error("Comparison sides must use different model selections.");
  }
  return { left, right, status: "ready" as const };
}

export function comparisonFailure(message: string) {
  return { status: "error" as const, message };
}

export function comparisonSuccess(left: string, right: string) {
  return { status: "success" as const, left, right };
}
