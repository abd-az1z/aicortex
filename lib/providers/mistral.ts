import { Mistral } from '@mistralai/mistralai';
import type { ModelAdapter, CompletionRequest, CompletionResponse } from './types';

export class MistralAdapter implements ModelAdapter {
    private client: Mistral;
    readonly modelId: string;
    readonly provider = 'mistral';

    constructor(modelId: string = 'mistral-small-latest') {
        this.client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        this.modelId = modelId;
    }

    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
        const start = Date.now();

        const response = await this.client.chat.complete({
            model: this.modelId,
            messages: request.messages.map(m => ({
                role: m.role,
                content: m.content,
            })),
            maxTokens: request.maxTokens ?? 2048,
            temperature: request.temperature ?? 0.7,
        });

        const latencyMs = Date.now() - start;
        const choice = response.choices?.[0];
        const content = choice?.message?.content;

        return {
            content: typeof content === 'string' ? content : '',
            model: response.model ?? this.modelId,
            inputTokens: response.usage?.promptTokens ?? 0,
            outputTokens: response.usage?.completionTokens ?? 0,
            latencyMs,
            finishReason: choice?.finishReason ?? undefined,
        };
    }
}
