import type { AIProviderInterface, AIRequestOptions, AIResponse } from "./provider";

export class GoogleAIProvider implements AIProviderInterface {
  name = "Google AI";
  models = ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash"];

  async sendMessage(prompt: string, context: string[], options?: AIRequestOptions): Promise<AIResponse> {
    const start = Date.now();
    const model = options?.model || "gemini-1.5-flash";
    const contents = [...context.map((c) => ({ parts: [{ text: c }], role: "user" })), { parts: [{ text: prompt }], role: "user" }];
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: { temperature: options?.temperature ?? 0.7, maxOutputTokens: options?.maxTokens ?? 2048 } }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`Google AI API error ${response.status}: ${errBody.error?.message || response.statusText}`);
    }
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const inputTokens = data.usageMetadata?.promptTokenCount || 0;
    const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;
    return { content, model, tokenCount: { input: inputTokens, output: outputTokens }, responseTime: Date.now() - start, cost: this.estimateCost(model, inputTokens + outputTokens) };
  }

  async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 3);
  }

  estimateCost(model: string, tokens: number): number {
    const rates: Record<string, number> = { "gemini-pro": 0.001, "gemini-1.5-pro": 0.0035, "gemini-1.5-flash": 0.0005 };
    return (rates[model] || 0.001) * (tokens / 1000);
  }
}
