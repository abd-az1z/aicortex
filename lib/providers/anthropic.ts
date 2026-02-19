import Anthropic from '@anthropic-ai/sdk';
import type { ModelAdapter, CompletionRequest, CompletionResponse } from './types';

export class AnthropicAdapter implements ModelAdapter {
    private client: Anthropic;
    readonly modelId: string;
    readonly provider = 'anthropic';

    constructor(modelId: string = 'claude-3-5-sonnet-20241022') {
        this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        this.modelId = modelId;
    }

    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
        const start = Date.now();

        // Separate system message from user messages
        const systemMessage = request.messages.find(m => m.role === 'system')?.content;
        const userMessages = request.messages.filter(m => m.role !== 'system');

        const response = await this.client.messages.create({
            model: this.modelId,
            max_tokens: request.maxTokens ?? 2048,
            system: systemMessage,
            messages: userMessages.map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
        });

        const latencyMs = Date.now() - start;
        const content = response.content[0];

        return {
            content: content.type === 'text' ? content.text : '',
            model: response.model,
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            latencyMs,
            finishReason: response.stop_reason ?? undefined,
        };
    }
}
