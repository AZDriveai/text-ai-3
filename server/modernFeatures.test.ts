import { describe, expect, it } from "vitest";
import { modernFeatures } from "../shared/modernFeatures";

describe("modern TEXT.AI feature registry", () => {
  it("contains twenty uniquely identified additions", () => {
    expect(modernFeatures).toHaveLength(20);
    expect(new Set(modernFeatures.map((feature) => feature.id)).size).toBe(20);
  });

  it("keeps each feature categorized and explicitly interactive or planned", () => {
    for (const feature of modernFeatures) {
      expect(["workflow", "media", "accessibility", "privacy"]).toContain(feature.category);
      expect(["interactive", "planned"]).toContain(feature.status);
      expect(feature.description.length).toBeGreaterThan(8);
    }
  });
});
