import type { AIProviderInterface } from "./provider";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GoogleAIProvider } from "./google";
import { OllamaProvider } from "./ollama";
import type { AIProvider } from "@/types/ai";

const registry = new Map<string, AIProviderInterface>();

export function registerProvider(key: string, provider: AIProviderInterface) {
  registry.set(key, provider);
}

export function getProvider(key: string): AIProviderInterface {
  const provider = registry.get(key);
  if (!provider) throw new Error(`AI provider "${key}" not found`);
  return provider;
}

export function getAvailableProviders(): string[] {
  return Array.from(registry.keys());
}

registerProvider("OPENAI", new OpenAIProvider());
registerProvider("ANTHROPIC", new AnthropicProvider());
registerProvider("GOOGLE", new GoogleAIProvider());
registerProvider("OLLAMA", new OllamaProvider());

export async function sendMessage(provider: AIProvider, prompt: string, context: string[], options?: { model?: string; temperature?: number; maxTokens?: number; systemPrompt?: string }) {
  const p = getProvider(provider);
  return p.sendMessage(prompt, context, options);
}

export async function countTokens(provider: AIProvider, text: string): Promise<number> {
  const p = getProvider(provider);
  return p.countTokens(text);
}
