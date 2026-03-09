import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/persona/route";

describe("/api/persona route", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("calls the Gemini latest endpoint with x-goog-api-key", async () => {
    process.env.GOOGLE_AI_KEY = "google-test-key";
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "false";
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: "Gemini narrative" }],
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await POST(
      new Request("http://localhost/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: "Tester",
          ageGroup: "40s",
          tendency: "Water",
          queryType: "daily",
          rawSajuData: { dayPillar: "갑자" },
        }),
      }),
    );

    const payload = await response.json();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "x-goog-api-key": "google-test-key",
        }),
      }),
    );
    expect(payload.status).toBe("success");
    expect(payload.narrative).toBe("Gemini narrative");
    expect(payload.routing.selectedModel).toBe("GEMINI-1.5");
    expect(payload.reader.id).toBe("timing_signal");
  });

  it("returns fallback narrative when no live LLM is available", async () => {
    delete process.env.GOOGLE_AI_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = "false";

    const fetchSpy = vi.spyOn(global, "fetch");

    const response = await POST(
      new Request("http://localhost/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: "Fallback User",
          ageGroup: "20s",
          tendency: "Balanced",
          queryType: "result",
        }),
      }),
    );

    const payload = await response.json();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(payload.status).toBe("success");
    expect(payload.narrative).toBe(payload.dualNarrative.expert);
    expect(typeof payload.dualNarrative.easy).toBe("string");
    expect(payload.dualNarrative.easy.length).toBeGreaterThan(0);
    expect(payload.dualNarrative.action.length).toBeGreaterThan(0);
  });
});
