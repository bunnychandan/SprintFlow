import type { AIProviderInterface, AIRequestOptions, AIResponse } from "./provider";

export class OllamaProvider implements AIProviderInterface {
  name = "Ollama";
  models = ["llama3", "mistral", "codellama", "mixtral"];

  private baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  async sendMessage(prompt: string, context: string[], options?: AIRequestOptions): Promise<AIResponse> {
    const start = Date.now();
    const model = options?.model || "llama3";
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [...(options?.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []), ...context.map((c) => ({ role: "user", content: c })), { role: "user", content: prompt }], options: { temperature: options?.temperature ?? 0.7, num_predict: options?.maxTokens ?? 2048 } }),
    });
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`Ollama API error ${response.status}: ${errBody.error || response.statusText}`);
    }
    const data = await response.json();
    const content = data.message?.content || "";
    const tokens = Math.ceil(content.length / 4);
    return { content, model, tokenCount: { input: Math.ceil(prompt.length / 4), output: tokens }, responseTime: Date.now() - start, cost: 0 };
  }

  async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }

  estimateCost(_model: string, _tokens: number): number {
    return 0;
  }
}
