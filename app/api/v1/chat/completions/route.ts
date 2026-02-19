import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { z } from 'zod';
import { createHash } from 'crypto';
import { db, requests, users, savingsSummary } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { extractApiKey, validateApiKey, isWithinBudget } from '@/lib/auth';
import { scoreComplexity, getModelTierForScore } from '@/lib/routing/complexity-scorer';
import { executeWithFallback } from '@/lib/routing/fallback-handler';
import { computeCosts } from '@/lib/routing/cost-calculator';
import { MODEL_REGISTRY } from '@/lib/providers/registry';

// ============================================================
// Request Schema (OpenAI-compatible)
// ============================================================
const ChatCompletionSchema = z.object({
    model: z.string().optional().default('auto'),
    messages: z.array(z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
    })).min(1),
    max_tokens: z.number().int().positive().optional(),
    temperature: z.number().min(0).max(2).optional(),
    stream: z.boolean().optional().default(false),
    metadata: z.record(z.string()).optional(),
});

// ============================================================
// POST /api/v1/chat/completions
// ============================================================
export async function POST(req: NextRequest) {
    const startTime = Date.now();

    // 1. Auth
    const authHeader = req.headers.get('authorization');
    const apiKey = extractApiKey(authHeader);

    if (!apiKey) {
        return NextResponse.json(
            { error: { message: 'Missing API key. Include Authorization: Bearer aicx_...', type: 'auth_error' } },
            { status: 401 }
        );
    }

    const user = await validateApiKey(apiKey);
    if (!user) {
        return NextResponse.json(
            { error: { message: 'Invalid API key', type: 'auth_error' } },
            { status: 401 }
        );
    }

    // 2. Parse & validate body
    let body: z.infer<typeof ChatCompletionSchema>;
    try {
        const raw = await req.json();
        body = ChatCompletionSchema.parse(raw);
    } catch (err) {
        return NextResponse.json(
            { error: { message: 'Invalid request body', type: 'invalid_request_error', details: String(err) } },
            { status: 400 }
        );
    }

    // 3. Streaming not supported in MVP
    if (body.stream) {
        return NextResponse.json(
            { error: { message: 'Streaming is not yet supported. Set stream: false', type: 'invalid_request_error' } },
            { status: 400 }
        );
    }

    // 4. Score complexity & determine routing
    const { score: difficultyScore, tokens: inputTokensEstimate } = scoreComplexity(body.messages);
    const preference = (user.routingPreference as 'cost' | 'balanced' | 'quality') ?? 'balanced';

    // If user specified a concrete model, use it directly; otherwise route
    let targetTier: 'cheap' | 'mid' | 'premium';
    let targetModelId: string;

    if (body.model !== 'auto' && MODEL_REGISTRY[body.model]) {
        targetModelId = body.model;
        targetTier = MODEL_REGISTRY[body.model].tier;
    } else {
        targetTier = getModelTierForScore(difficultyScore, preference);
        // We don't know the exact model yet (fallback handler picks), but we can estimate
        // based on the most expensive model in that tier for the budget check
        targetModelId = targetTier === 'premium' ? 'gpt-4o' : targetTier === 'mid' ? 'gpt-4o-mini' : 'gemini-1.5-flash';
    }

    // 4.5 Plan Request Limit (Starter = 500K/month)
    if (user.plan === 'starter') {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { savingsSummary } = await import('@/lib/db');
        const { and } = await import('drizzle-orm');
        const monthlySummary = await db
            .select()
            .from(savingsSummary)
            .where(and(eq(savingsSummary.userId, user.id), eq(savingsSummary.period, currentMonth)))
            .limit(1);

        if ((monthlySummary[0]?.requestCount ?? 0) >= 500_000) {
            return NextResponse.json(
                { error: { message: 'Monthly request limit of 500,000 reached on the Starter plan. Upgrade to Growth for unlimited requests.', type: 'plan_limit_exceeded' } },
                { status: 403 }
            );
        }
    }

    // 4.6 Budget Guardrail Check
    const checkModelInfo = MODEL_REGISTRY[targetModelId];
    const estimatedOutputTokens = body.max_tokens ?? 500;
    const estimatedCost = ((inputTokensEstimate * checkModelInfo.inputCostPer1M) / 1000000) +
        ((estimatedOutputTokens * checkModelInfo.outputCostPer1M) / 1000000);

    const budgetCheck = await isWithinBudget(user, estimatedCost);
    if (!budgetCheck.allowed) {
        return NextResponse.json(
            { error: { message: budgetCheck.reason, type: 'budget_exceeded_error' } },
            { status: 403 }
        );
    }

    // 5. Execute with fallback
    let completionResult;
    let fallbackUsed = false;
    let status: 'success' | 'failed' | 'fallback' | 'timeout' = 'success';
    let errorMessage: string | undefined;

    try {
        completionResult = await executeWithFallback(body, targetTier);
        fallbackUsed = completionResult.fallbackUsed;
        if (fallbackUsed) status = 'fallback';
    } catch (err) {
        status = 'failed';
        errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
            { error: { message: 'All models failed. Please try again.', type: 'api_error', details: errorMessage } },
            { status: 503 }
        );
    }

    const totalLatencyMs = Date.now() - startTime;

    // 6. Compute costs
    const costs = computeCosts(
        completionResult.model,
        completionResult.inputTokens,
        completionResult.outputTokens
    );

    // 7. Log request to DB (non-blocking)
    const promptHash = createHash('sha256')
        .update(body.messages.map(m => m.content).join('|'))
        .digest('hex')
        .slice(0, 16);

    const finalModelInfo = MODEL_REGISTRY[completionResult.model];

    // Fire-and-forget DB logging
    (async () => {
        try {
            await db.insert(requests).values({
                userId: user.id,
                promptHash,
                modelUsed: completionResult.model,
                modelTier: finalModelInfo?.tier ?? 'mid',
                inputTokens: completionResult.inputTokens,
                outputTokens: completionResult.outputTokens,
                costActual: costs.costActual,
                costHypothetical: costs.costHypothetical,
                savingsDelta: costs.savingsDelta,
                latencyMs: totalLatencyMs,
                difficultyScore,
                status,
                fallbackUsed,
                errorMessage,
            });

            // Update monthly savings summary
            const period = new Date().toISOString().slice(0, 7);
            const existing = await db
                .select()
                .from(savingsSummary)
                .where(and(eq(savingsSummary.userId, user.id), eq(savingsSummary.period, period)))
                .limit(1);

            if (existing.length > 0) {
                await db
                    .update(savingsSummary)
                    .set({
                        totalSpend: existing[0].totalSpend + costs.costActual,
                        totalHypotheticalSpend: existing[0].totalHypotheticalSpend + costs.costHypothetical,
                        totalSavings: existing[0].totalSavings + costs.savingsDelta,
                        requestCount: existing[0].requestCount + 1,
                        totalInputTokens: existing[0].totalInputTokens + completionResult.inputTokens,
                        totalOutputTokens: existing[0].totalOutputTokens + completionResult.outputTokens,
                        updatedAt: new Date(),
                    })
                    .where(and(eq(savingsSummary.userId, user.id), eq(savingsSummary.period, period)));
            } else {
                await db.insert(savingsSummary).values({
                    userId: user.id,
                    period,
                    totalSpend: costs.costActual,
                    totalHypotheticalSpend: costs.costHypothetical,
                    totalSavings: costs.savingsDelta,
                    requestCount: 1,
                    totalInputTokens: completionResult.inputTokens,
                    totalOutputTokens: completionResult.outputTokens,
                });
            }
        } catch (dbErr) {
            console.error('[AICortex] DB logging failed:', dbErr);
        }
    })();

    // 8. Return OpenAI-compatible response with AICortex metadata
    return NextResponse.json({
        id: `aicx-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: completionResult.model,
        choices: [
            {
                index: 0,
                message: {
                    role: 'assistant',
                    content: completionResult.content,
                },
                finish_reason: completionResult.finishReason ?? 'stop',
            },
        ],
        usage: {
            prompt_tokens: completionResult.inputTokens,
            completion_tokens: completionResult.outputTokens,
            total_tokens: completionResult.inputTokens + completionResult.outputTokens,
        },
        // AICortex metadata (extra fields, ignored by OpenAI-compatible clients)
        aicortex: {
            difficulty_score: difficultyScore,
            model_tier: targetTier,
            cost_actual_usd: costs.costActual,
            cost_hypothetical_usd: costs.costHypothetical,
            savings_usd: costs.savingsDelta,
            savings_percent: costs.savingsPercent,
            fallback_used: fallbackUsed,
            latency_ms: totalLatencyMs,
            routing_preference: preference,
        },
    });
}

// Health check
export async function GET() {
    return NextResponse.json({ status: 'ok', service: 'AICortex API', version: '1.0.0' });
}
