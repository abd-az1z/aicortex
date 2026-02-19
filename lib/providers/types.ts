// ============================================================
// Provider Types — shared interface for all model adapters
// ============================================================

export interface CompletionMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface CompletionRequest {
    messages: CompletionMessage[];
    maxTokens?: number;
    temperature?: number;
    model?: string; // override model
    metadata?: Record<string, string>;
}

export interface CompletionResponse {
    content: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    finishReason?: string;
}

export interface ModelAdapter {
    generateCompletion(request: CompletionRequest): Promise<CompletionResponse>;
    readonly modelId: string;
    readonly provider: string;
}

export type ModelTier = 'cheap' | 'mid' | 'premium';

export interface ModelInfo {
    id: string;
    provider: string;
    tier: ModelTier;
    inputCostPer1M: number;  // USD per 1M input tokens
    outputCostPer1M: number; // USD per 1M output tokens
    contextWindow: number;
    avgLatencyMs: number;
    description: string;
}
