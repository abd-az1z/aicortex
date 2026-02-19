import { db, requests, savingsSummary } from '@/lib/db';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

// ============================================================
// Analytics Queries for Dashboard
// ============================================================

export async function getDashboardStats(userId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Monthly summary
    const [summary] = await db
        .select()
        .from(savingsSummary)
        .where(and(eq(savingsSummary.userId, userId), eq(savingsSummary.period, currentMonth)))
        .limit(1);

    // Recent requests for latency & error rate
    const recentRequests = await db
        .select({
            latencyMs: requests.latencyMs,
            status: requests.status,
            costActual: requests.costActual,
            modelUsed: requests.modelUsed,
            modelTier: requests.modelTier,
            createdAt: requests.createdAt,
        })
        .from(requests)
        .where(and(eq(requests.userId, userId), gte(requests.createdAt, thirtyDaysAgo)))
        .orderBy(desc(requests.createdAt))
        .limit(500);

    const totalRequests = recentRequests.length;
    const failedRequests = recentRequests.filter(r => r.status === 'failed').length;
    const avgLatency = totalRequests > 0
        ? Math.round(recentRequests.reduce((sum, r) => sum + r.latencyMs, 0) / totalRequests)
        : 0;
    const errorRate = totalRequests > 0 ? Math.round((failedRequests / totalRequests) * 100) : 0;

    // Spend by model
    const spendByModel: Record<string, number> = {};
    for (const req of recentRequests) {
        spendByModel[req.modelUsed] = (spendByModel[req.modelUsed] ?? 0) + req.costActual;
    }

    return {
        totalSpend: summary?.totalSpend ?? 0,
        totalSavings: summary?.totalSavings ?? 0,
        totalHypotheticalSpend: summary?.totalHypotheticalSpend ?? 0,
        savingsPercent: summary && summary.totalHypotheticalSpend > 0
            ? Math.round((summary.totalSavings / summary.totalHypotheticalSpend) * 100)
            : 0,
        requestCount: summary?.requestCount ?? 0,
        totalInputTokens: summary?.totalInputTokens ?? 0,
        totalOutputTokens: summary?.totalOutputTokens ?? 0,
        avgLatency,
        errorRate,
        spendByModel,
    };
}

export async function getRecentRequests(userId: string, limit = 50) {
    return db
        .select()
        .from(requests)
        .where(eq(requests.userId, userId))
        .orderBy(desc(requests.createdAt))
        .limit(limit);
}

export async function getSpendOverTime(userId: string) {
    // Last 6 months of savings summaries
    const summaries = await db
        .select()
        .from(savingsSummary)
        .where(eq(savingsSummary.userId, userId))
        .orderBy(savingsSummary.period);

    return summaries.map(s => ({
        period: s.period,
        spend: s.totalSpend,
        savings: s.totalSavings,
        hypothetical: s.totalHypotheticalSpend,
    }));
}
