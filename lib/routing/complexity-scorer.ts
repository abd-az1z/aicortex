// ============================================================
// Complexity Scorer — assigns a 0-1 difficulty score to requests
// ============================================================

import type { CompletionMessage } from '../providers/types';

// Keywords that indicate high-complexity tasks
const HIGH_COMPLEXITY_KEYWORDS = [
    'analyze', 'analysis', 'complex', 'detailed', 'comprehensive', 'research',
    'explain in depth', 'step by step', 'algorithm', 'architecture', 'design',
    'implement', 'debug', 'optimize', 'refactor', 'mathematical', 'proof',
    'derive', 'calculate', 'synthesize', 'evaluate', 'compare', 'contrast',
    'write a', 'create a', 'build a', 'generate a', 'develop a',
    'essay', 'report', 'thesis', 'dissertation', 'paper',
    'code', 'function', 'class', 'module', 'api', 'database', 'sql',
    'machine learning', 'neural', 'transformer', 'embedding',
];

// Keywords that indicate low-complexity tasks
const LOW_COMPLEXITY_KEYWORDS = [
    'what is', 'what are', 'who is', 'when did', 'where is',
    'yes or no', 'true or false', 'define', 'list', 'name',
    'translate', 'summarize briefly', 'tldr', 'quick',
    'simple', 'basic', 'easy', 'short', 'brief',
    'hello', 'hi', 'thanks', 'thank you', 'ok', 'okay',
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
        cost: { cheap: 0.5, mid: 0.8 }, // push more to cheap
        balanced: { cheap: 0.3, mid: 0.7 }, // default
        quality: { cheap: 0.2, mid: 0.5 }, // push more to premium
    };

    const t = thresholds[preference];
    if (score < t.cheap) return 'cheap';
    if (score < t.mid) return 'mid';
    return 'premium';
}
