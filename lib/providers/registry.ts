import type { ModelInfo } from './types';

// ============================================================
// Model Registry — pricing & metadata for all supported models
// Prices in USD per 1M tokens (as of early 2025)
// ============================================================
export const MODEL_REGISTRY: Record<string, ModelInfo> = {
    // ---- CHEAP TIER ----
    'gpt-3.5-turbo': {
        id: 'gpt-3.5-turbo',
        provider: 'openai',
        tier: 'cheap',
        inputCostPer1M: 0.50,
        outputCostPer1M: 1.50,
        contextWindow: 16385,
        avgLatencyMs: 800,
        description: 'OpenAI GPT-3.5 Turbo — fast and cheap',
    },
    'gpt-4o-mini': {
        id: 'gpt-4o-mini',
        provider: 'openai',
        tier: 'mid',
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.60,
        contextWindow: 128000,
        avgLatencyMs: 1000,
        description: 'OpenAI GPT-4o Mini — best value mid-tier',
    },
    'gpt-4o': {
        id: 'gpt-4o',
        provider: 'openai',
        tier: 'premium',
        inputCostPer1M: 5.00,
        outputCostPer1M: 15.00,
        contextWindow: 128000,
        avgLatencyMs: 2000,
        description: 'OpenAI GPT-4o — flagship model',
    },
    'claude-3-haiku-20240307': {
        id: 'claude-3-haiku-20240307',
        provider: 'anthropic',
        tier: 'cheap',
        inputCostPer1M: 0.25,
        outputCostPer1M: 1.25,
        contextWindow: 200000,
        avgLatencyMs: 600,
        description: 'Anthropic Claude 3 Haiku — fastest Claude',
    },
    'claude-3-5-sonnet-20241022': {
        id: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
        tier: 'premium',
        inputCostPer1M: 3.00,
        outputCostPer1M: 15.00,
        contextWindow: 200000,
        avgLatencyMs: 2500,
        description: 'Anthropic Claude 3.5 Sonnet — best for coding & analysis',
    },
    'gemini-1.5-flash': {
        id: 'gemini-1.5-flash',
        provider: 'gemini',
        tier: 'cheap',
        inputCostPer1M: 0.075,
        outputCostPer1M: 0.30,
        contextWindow: 1000000,
        avgLatencyMs: 700,
        description: 'Google Gemini 1.5 Flash — cheapest per token',
    },
    'gemini-1.5-pro': {
        id: 'gemini-1.5-pro',
        provider: 'gemini',
        tier: 'premium',
        inputCostPer1M: 3.50,
        outputCostPer1M: 10.50,
        contextWindow: 2000000,
        avgLatencyMs: 3000,
        description: 'Google Gemini 1.5 Pro — largest context window',
    },
    'llama-3.1-8b-instant': {
        id: 'llama-3.1-8b-instant',
        provider: 'groq',
        tier: 'cheap',
        inputCostPer1M: 0.05,
        outputCostPer1M: 0.08,
        contextWindow: 131072,
        avgLatencyMs: 200,
        description: 'Groq Llama 3.1 8B — ultra-fast inference',
    },
    'llama-3.1-70b-versatile': {
        id: 'llama-3.1-70b-versatile',
        provider: 'groq',
        tier: 'mid',
        inputCostPer1M: 0.59,
        outputCostPer1M: 0.79,
        contextWindow: 131072,
        avgLatencyMs: 500,
        description: 'Groq Llama 3.1 70B — fast mid-tier',
    },
    'mistral-small-latest': {
        id: 'mistral-small-latest',
        provider: 'mistral',
        tier: 'cheap',
        inputCostPer1M: 0.20,
        outputCostPer1M: 0.60,
        contextWindow: 32000,
        avgLatencyMs: 900,
        description: 'Mistral Small — efficient European model',
    },
    'mistral-large-latest': {
        id: 'mistral-large-latest',
        provider: 'mistral',
        tier: 'mid',
        inputCostPer1M: 2.00,
        outputCostPer1M: 6.00,
        contextWindow: 128000,
        avgLatencyMs: 2000,
        description: 'Mistral Large — strong reasoning',
    },
};

// Models by tier (ordered by preference within tier)
export const MODELS_BY_TIER: Record<string, string[]> = {
    cheap: [
        'llama-3.1-8b-instant',   // fastest + cheapest
        'gemini-1.5-flash',        // very cheap
        'claude-3-haiku-20240307', // reliable
        'gpt-3.5-turbo',           // fallback
        'mistral-small-latest',
    ],
    mid: [
        'gpt-4o-mini',             // best value
        'llama-3.1-70b-versatile', // fast
        'mistral-large-latest',
    ],
    premium: [
        'gpt-4o',                  // default premium
        'claude-3-5-sonnet-20241022',
        'gemini-1.5-pro',
    ],
};

// The "hypothetical" model used for savings calculation
export const HYPOTHETICAL_MODEL = 'gpt-4o';

export function getModelInfo(modelId: string): ModelInfo | undefined {
    return MODEL_REGISTRY[modelId];
}

export function calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const model = MODEL_REGISTRY[modelId];
    if (!model) return 0;
    const inputCost = (inputTokens / 1_000_000) * model.inputCostPer1M;
    const outputCost = (outputTokens / 1_000_000) * model.outputCostPer1M;
    return inputCost + outputCost;
}
