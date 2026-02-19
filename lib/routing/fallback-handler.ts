import { OpenAIAdapter } from '../providers/openai';
import { AnthropicAdapter } from '../providers/anthropic';
import { GeminiAdapter } from '../providers/gemini';
import { GroqAdapter } from '../providers/groq';
import { MistralAdapter } from '../providers/mistral';
import { MODELS_BY_TIER } from '../providers/registry';
import type { ModelAdapter, CompletionRequest, CompletionResponse } from '../providers/types';

// ============================================================
// Adapter Factory — creates the right adapter for a model ID
// ============================================================
export function createAdapter(modelId: string): ModelAdapter {
    const registry: Record<string, () => ModelAdapter> = {
        // OpenAI
        'gpt-3.5-turbo': () => new OpenAIAdapter('gpt-3.5-turbo'),
        'gpt-4o-mini': () => new OpenAIAdapter('gpt-4o-mini'),
        'gpt-4o': () => new OpenAIAdapter('gpt-4o'),
        // Anthropic
        'claude-3-haiku-20240307': () => new AnthropicAdapter('claude-3-haiku-20240307'),
        'claude-3-5-sonnet-20241022': () => new AnthropicAdapter('claude-3-5-sonnet-20241022'),
        // Gemini
        'gemini-1.5-flash': () => new GeminiAdapter('gemini-1.5-flash'),
        'gemini-1.5-pro': () => new GeminiAdapter('gemini-1.5-pro'),
        // Groq
        'llama-3.1-8b-instant': () => new GroqAdapter('llama-3.1-8b-instant'),
        'llama-3.1-70b-versatile': () => new GroqAdapter('llama-3.1-70b-versatile'),
        // Mistral
        'mistral-small-latest': () => new MistralAdapter('mistral-small-latest'),
        'mistral-large-latest': () => new MistralAdapter('mistral-large-latest'),
    };

    const factory = registry[modelId];
    if (!factory) throw new Error(`Unknown model: ${modelId}`);
    return factory();
}

// ============================================================
// Fallback Handler — retries with escalation on failure
// ============================================================
interface FallbackResult extends CompletionResponse {
    fallbackUsed: boolean;
    finalModelId: string;
}

export async function executeWithFallback(
    request: CompletionRequest,
    tier: 'cheap' | 'mid' | 'premium',
    maxRetries: number = 2
): Promise<FallbackResult> {
    const tierOrder: Array<'cheap' | 'mid' | 'premium'> = ['cheap', 'mid', 'premium'];
    const startTierIndex = tierOrder.indexOf(tier);

    let lastError: Error | null = null;
    let fallbackUsed = false;

    // Try models in the target tier first, then escalate
    for (let tierOffset = 0; tierOffset <= 2; tierOffset++) {
        const currentTierIndex = Math.min(startTierIndex + tierOffset, 2);
        const currentTier = tierOrder[currentTierIndex];
        const modelsInTier = MODELS_BY_TIER[currentTier];

        if (tierOffset > 0) fallbackUsed = true;

        for (const modelId of modelsInTier) {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const adapter = createAdapter(modelId);
                    const response = await adapter.generateCompletion(request);
                    return { ...response, fallbackUsed, finalModelId: modelId };
                } catch (err) {
                    lastError = err instanceof Error ? err : new Error(String(err));
                    console.warn(`[AICortex] Model ${modelId} attempt ${attempt + 1} failed:`, lastError.message);

                    // Don't retry on auth errors
                    if (lastError.message.includes('401') || lastError.message.includes('API key')) {
                        break;
                    }

                    // Brief backoff before retry
                    if (attempt < maxRetries - 1) {
                        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
                    }
                }
            }
        }
    }

    throw lastError ?? new Error('All models failed');
}
