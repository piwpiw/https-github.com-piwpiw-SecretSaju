import { describe, expect, it } from "vitest";
import { routeAIPersona } from "../src/core/ai-routing";

describe("AI Routing", () => {
  it("returns a known model name", () => {
    const result = routeAIPersona({
      userName: "테스트",
      ageGroup: "20s",
      tendency: "Balanced",
      queryType: "result",
    });
    expect(result.model).toBeTruthy();
    expect(typeof result.model).toBe("string");
  });

  it("returns systemPrompt, userPrompt, and reader", () => {
    const result = routeAIPersona({
      userName: "테스트",
      ageGroup: "30s",
      tendency: "Tree",
      queryType: "result",
    });
    expect(typeof result.systemPrompt).toBe("string");
    expect(result.systemPrompt.length).toBeGreaterThan(0);
    expect(typeof result.userPrompt).toBe("string");
    expect(result.reader.name.length).toBeGreaterThan(0);
  });

  it("respects a custom reader selection", () => {
    const result = routeAIPersona({
      userName: "테스트",
      ageGroup: "20s",
      tendency: "Balanced",
      queryType: "result",
      readerId: "easy_translator",
    });
    expect(result.reader.id).toBe("easy_translator");
  });

  it("recommends love reader for compatibility requests", () => {
    const result = routeAIPersona({
      userName: "A",
      ageGroup: "20s",
      tendency: "Balanced",
      queryType: "compatibility",
    });
    expect(result.reader.category).toBe("love");
  });

  it("recommends timing reader for daily requests", () => {
    const result = routeAIPersona({
      userName: "A",
      ageGroup: "40s",
      tendency: "Water",
      queryType: "daily",
    });
    expect(result.reader.id).toBe("timing_signal");
  });

  it("handles missing rawSajuData gracefully", () => {
    expect(() =>
      routeAIPersona({
        userName: "테스트",
        ageGroup: "20s",
        tendency: "Balanced",
        queryType: "result",
        rawSajuData: undefined,
      }),
    ).not.toThrow();
  });
});
