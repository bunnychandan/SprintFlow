export interface AIProviderInterface {
  name: string;
  models: string[];
  sendMessage(prompt: string, context: string[], options?: AIRequestOptions): Promise<AIResponse>;
  countTokens(text: string): Promise<number>;
  estimateCost(model: string, tokens: number): number;
}

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  tokenCount: { input: number; output: number };
  responseTime: number;
  cost: number;
}
