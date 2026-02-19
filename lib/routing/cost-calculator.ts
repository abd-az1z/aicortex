import { calculateCost, HYPOTHETICAL_MODEL } from '../providers/registry';

// ============================================================
// Cost Calculator — computes actual and hypothetical costs
// ============================================================

export interface CostResult {
    costActual: number;      // USD
    costHypothetical: number; // USD (if GPT-4o was used)
    savingsDelta: number;    // costHypothetical - costActual
    savingsPercent: number;  // percentage saved
}

export function computeCosts(
    modelId: string,
    inputTokens: number,
    outputTokens: number
): CostResult {
    const costActual = calculateCost(modelId, inputTokens, outputTokens);
    const costHypothetical = calculateCost(HYPOTHETICAL_MODEL, inputTokens, outputTokens);
    const savingsDelta = Math.max(0, costHypothetical - costActual);
    const savingsPercent = costHypothetical > 0
        ? Math.round((savingsDelta / costHypothetical) * 100)
        : 0;

    return {
        costActual: Math.round(costActual * 1_000_000) / 1_000_000, // 6 decimal places
        costHypothetical: Math.round(costHypothetical * 1_000_000) / 1_000_000,
        savingsDelta: Math.round(savingsDelta * 1_000_000) / 1_000_000,
        savingsPercent,
    };
}

export function formatCostUSD(amount: number): string {
    if (amount < 0.001) return `$${(amount * 1000).toFixed(4)}m`; // millicents
    if (amount < 1) return `$${(amount * 100).toFixed(4)}¢`;
    return `$${amount.toFixed(4)}`;
}
