// ============================================================
// Complexity Scorer — assigns a 0-1 difficulty score to requests
// ============================================================

import type { CompletionMessage } from '../providers/types';

// Keywords that indicate high-complexity tasks
const HIGH_COMPLEXITY_KEYWORDS = [
    // Technical / engineering
    'analyze', 'analysis', 'complex', 'detailed', 'comprehensive', 'research',
    'explain in depth', 'step by step', 'algorithm', 'architecture', 'design',
    'implement', 'debug', 'optimize', 'refactor', 'mathematical', 'proof',
    'derive', 'calculate', 'synthesize', 'evaluate', 'compare', 'contrast',
    'write a', 'create a', 'build a', 'generate a', 'develop a',
    'essay', 'report', 'thesis', 'dissertation', 'paper',
    'code', 'function', 'class', 'module', 'api', 'database', 'sql',
    'machine learning', 'neural', 'transformer', 'embedding',
    // Customer support — issue/escalation signals
    'not working', 'not receiving', 'keeps failing', 'keeps getting', 'error',
    'issue', 'problem', 'trouble', 'troubleshoot', 'broken', 'failed', 'failing',
    'escalate', 'escalation', 'urgent', 'critical', 'blocked', 'blocking',
    'still not', 'third time', 'multiple times', 'again and again',
    // Billing / account complexity
    'dispute', 'charged twice', 'overcharged', 'incorrect charge', 'wrong charge',
    'proration', 'credit', 'refund request', 'penalty', 'sla', 'contract',
    'invoice discrepancy', 'billing issue', 'cancel and refund',
    // Technical setup / integration
    'oauth', 'webhook', 'integration', 'connect', 'embed', 'configure',
    'permission', 'role-based', 'rbac', 'multi-tenant', 'rate limit',
    'signature', 'payload', 'endpoint', 'authentication', 'authorization',
    // Compliance / legal / enterprise
    'compliance', 'gdpr', 'soc2', 'audit', 'data residency', 'legal',
    'liability', 'regulatory', 'enterprise', 'procurement', 'dpa',
    // Multi-part / deep reasoning signals
    'walk me through', 'in detail', 'step by step', 'systematically',
    'root cause', 'methodology', 'framework', 'recommend', 'recommendation',
    'multiple', 'several', 'across', 'each', 'all of', 'comprehensive',
];

// Keywords that indicate low-complexity tasks
const LOW_COMPLEXITY_KEYWORDS = [
    'what is', 'what are', 'who is', 'when did', 'where is',
    'yes or no', 'true or false', 'define', 'list', 'name',
    'translate', 'summarize briefly', 'tldr', 'quick',
    'simple', 'basic', 'easy', 'short', 'brief',
    'hello', 'hi', 'thanks', 'thank you', 'ok', 'okay',
    'how do i', 'do you have', 'can i', 'is there', 'where can',
];

interface ScoringFactors {
    lengthScore: number;       // 0-1 based on token count
    complexityKeywords: number; // 0-1 based on keyword presence
    contextScore: number;      // 0-1 based on conversation length
    final: number;             // weighted average
}

export function scoreComplexity(messages: CompletionMessage[]): {
    score: number;
    tokens: number;
    factors: ScoringFactors;
} {
    const fullText = messages.map(m => m.content).join(' ').toLowerCase();
    const estimatedTokens = Math.ceil(fullText.length / 4); // rough token estimate

    // 1. Length score (0-1): longer prompts = more complex
    // Normalize: 0 tokens = 0, 4000+ tokens = 1
    const lengthScore = Math.min(estimatedTokens / 4000, 1);

    // 2. Keyword complexity score
    const highMatches = HIGH_COMPLEXITY_KEYWORDS.filter(kw => fullText.includes(kw)).length;
    const lowMatches = LOW_COMPLEXITY_KEYWORDS.filter(kw => fullText.includes(kw)).length;

    let keywordScore = 0.5; // neutral baseline
    if (highMatches > 0 || lowMatches > 0) {
        const total = highMatches + lowMatches;
        keywordScore = highMatches / total;
    }

    // 3. Context score (multi-turn conversations are more complex)
    const turnCount = messages.filter(m => m.role !== 'system').length;
    const contextScore = Math.min(turnCount / 10, 1);

    // 4. Weighted final score
    const final = (
        lengthScore * 0.40 +
        keywordScore * 0.45 +
        contextScore * 0.15
    );

    return {
        score: Math.round(final * 100) / 100,
        tokens: estimatedTokens,
        factors: {
            lengthScore: Math.round(lengthScore * 100) / 100,
            complexityKeywords: Math.round(keywordScore * 100) / 100,
            contextScore: Math.round(contextScore * 100) / 100,
            final: Math.round(final * 100) / 100,
        },
    };
}

export function getModelTierForScore(
    score: number,
    preference: 'cost' | 'balanced' | 'quality' = 'balanced'
): 'cheap' | 'mid' | 'premium' {
    // Adjust thresholds based on user preference
    const thresholds = {
        cost: { cheap: 0.4, mid: 0.75 }, // push more to cheap
        balanced: { cheap: 0.2, mid: 0.55 }, // default
        quality: { cheap: 0.1, mid: 0.4 }, // push more to premium
    };

    const t = thresholds[preference];
    if (score < t.cheap) return 'cheap';
    if (score < t.mid) return 'mid';
    return 'premium';
}
