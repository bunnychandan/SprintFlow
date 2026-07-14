import type { AIProviderInterface, AIRequestOptions, AIResponse } from "./provider";

export class AnthropicProvider implements AIProviderInterface {
  name = "Anthropic";
  models = ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"];

  async sendMessage(prompt: string, context: string[], options?: AIRequestOptions): Promise<AIResponse> {
    const start = Date.now();
    const model = options?.model || "claude-3-haiku";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: options?.maxTokens ?? 2048, system: options?.systemPrompt, messages: [...context.map((c) => ({ role: "user", content: c })), { role: "user", content: prompt }] }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error ${response.status}: ${errBody.error?.message || response.statusText}`);
    }
    const data = await response.json();
    const content = data.content?.[0]?.text || "";
    const inputTokens = data.usage?.input_tokens || 0;
    const outputTokens = data.usage?.output_tokens || 0;
    return { content, model, tokenCount: { input: inputTokens, output: outputTokens }, responseTime: Date.now() - start, cost: this.estimateCost(model, inputTokens + outputTokens) };
  }

  async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 3.5);
  }

  estimateCost(model: string, tokens: number): number {
    const rates: Record<string, number> = { "claude-3-opus": 0.015, "claude-3-sonnet": 0.003, "claude-3-haiku": 0.00025 };
    return (rates[model] || 0.003) * (tokens / 1000);
  }
}
