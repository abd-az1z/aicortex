import OpenAI from 'openai';
import type { ModelAdapter, CompletionRequest, CompletionResponse } from './types';

export class OpenAIAdapter implements ModelAdapter {
    private client: OpenAI;
    readonly modelId: string;
    readonly provider = 'openai';

    constructor(modelId: string = 'gpt-4o') {
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.modelId = modelId;
    }

    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
        const start = Date.now();

        const response = await this.client.chat.completions.create({
            model: this.modelId,
            messages: request.messages,
            max_tokens: request.maxTokens ?? 2048,
            temperature: request.temperature ?? 0.7,
        });

        const latencyMs = Date.now() - start;
        const choice = response.choices[0];

        return {
            content: choice.message.content ?? '',
            model: response.model,
            inputTokens: response.usage?.prompt_tokens ?? 0,
            outputTokens: response.usage?.completion_tokens ?? 0,
            latencyMs,
            finishReason: choice.finish_reason ?? undefined,
        };
    }
}
