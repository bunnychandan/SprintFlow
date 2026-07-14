import type { AIProviderInterface, AIRequestOptions, AIResponse } from "./provider";

export class OpenAIProvider implements AIProviderInterface {
  name = "OpenAI";
  models = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];

  async sendMessage(prompt: string, context: string[], options?: AIRequestOptions): Promise<AIResponse> {
    const start = Date.now();
    const model = options?.model || "gpt-4o-mini";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model, messages: [...(options?.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []), ...context.map((c) => ({ role: "user", content: c })), { role: "user", content: prompt }], temperature: options?.temperature ?? 0.7, max_tokens: options?.maxTokens ?? 2048 }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error ${response.status}: ${errBody.error?.message || response.statusText}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    return { content, model, tokenCount: { input: inputTokens, output: outputTokens }, responseTime: Date.now() - start, cost: this.estimateCost(model, inputTokens + outputTokens) };
  }

  async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }

  estimateCost(model: string, tokens: number): number {
    const rates: Record<string, number> = { "gpt-4o": 0.01, "gpt-4o-mini": 0.0015, "gpt-4-turbo": 0.01, "gpt-3.5-turbo": 0.001 };
    return (rates[model] || 0.001) * (tokens / 1000);
  }
}
