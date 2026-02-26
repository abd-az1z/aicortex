import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ModelAdapter, CompletionRequest, CompletionResponse } from './types';

export class GeminiAdapter implements ModelAdapter {
    private client: GoogleGenerativeAI;
    readonly modelId: string;
    readonly provider = 'gemini';

    constructor(modelId: string = 'gemini-1.5-flash') {
        if (!process.env.GOOGLE_AI_API_KEY) {
            throw new Error('GOOGLE_AI_API_KEY not configured');
        }
        this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        this.modelId = modelId;
    }

    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
        const start = Date.now();

        const model = this.client.getGenerativeModel({
            model: this.modelId,
            generationConfig: {
                maxOutputTokens: request.maxTokens ?? 2048,
                temperature: request.temperature ?? 0.7,
            },
        });

        // Build prompt from messages
        const systemMessage = request.messages.find(m => m.role === 'system')?.content ?? '';
        const userMessages = request.messages.filter(m => m.role !== 'system');

        const history = userMessages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

        const lastMessage = userMessages[userMessages.length - 1];
        const prompt = systemMessage
            ? `${systemMessage}\n\n${lastMessage?.content ?? ''}`
            : (lastMessage?.content ?? '');

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(prompt);
        const response = await result.response;

        const latencyMs = Date.now() - start;
        const usageMetadata = response.usageMetadata;

        return {
            content: response.text(),
            model: this.modelId,
            inputTokens: usageMetadata?.promptTokenCount ?? 0,
            outputTokens: usageMetadata?.candidatesTokenCount ?? 0,
            latencyMs,
            finishReason: response.candidates?.[0]?.finishReason ?? undefined,
        };
    }
}
