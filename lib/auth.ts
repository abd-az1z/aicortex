import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { User } from '@/lib/db/schema';

// ============================================================
// API Key Authentication
// ============================================================

export async function validateApiKey(apiKey: string): Promise<User | null> {
    if (!apiKey || !apiKey.startsWith('aicx_')) return null;

    try {
        const result = await db
            .select()
            .from(users)
            .where(eq(users.apiKey, apiKey))
            .limit(1);

        return result[0] ?? null;
    } catch {
        return null;
    }
}

export function extractApiKey(authHeader: string | null): string | null {
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }
    return null;
}

// ============================================================
// Budget Guard — check if user is within budget
// ============================================================
export async function isWithinBudget(
    user: User,
    estimatedCost: number
): Promise<{ allowed: boolean; reason?: string }> {
    if (!user.monthlyBudget) return { allowed: true }; // no limit set

    // Get current month's spend
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    try {
        const { savingsSummary } = await import('./db');
        const { eq, and } = await import('drizzle-orm');

        const summary = await db
            .select()
            .from(savingsSummary)
            .where(and(
                eq(savingsSummary.userId, user.id),
                eq(savingsSummary.period, currentMonth)
            ))
            .limit(1);

        const currentSpend = summary[0]?.totalSpend ?? 0;

        if (currentSpend + estimatedCost > user.monthlyBudget) {
            return {
                allowed: false,
                reason: `Monthly budget of $${user.monthlyBudget} would be exceeded. Current spend: $${currentSpend.toFixed(4)}`,
            };
        }
    } catch {
        // If we can't check, allow the request
    }

    return { allowed: true };
}
