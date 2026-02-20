
import { SignalGraph } from './SignalGraph';

export interface ExtractedSignals {
    usedMetrics: boolean;
    metricsConfidence: number;
    ownershipStance: 'I' | 'WE' | 'NEUTRAL';
    ownershipConfidence: number;
    techTerms: string[];
    specificityScore: number;
    tradeoffDetected: boolean;
    hesitationSignals: number;
    hasCodeModification: boolean;
    dogmaticMarkers: number; // Detection of pattern-spam without context
}

export class SignalExtractor {
    private static TECH_DICTIONARY = [
        'idempotency', 'race condition', 'deadlock', 'concurrency', 'latency',
        'backpressure', 'stream', 'buffer', 'sharding', 'horizontal scaling',
        'referential stability', 'memoization', 'closure', 'middleware', 'hook',
        'hydration', 'ssr', 'csr', 'isr', 'microservices', 'monolith', 'cap theorem'
    ];

    static extract(input: string, codeChangeCount: number = 0): ExtractedSignals {
        const rawInput = input.toLowerCase();

        // 1. Metric Detection (Regex for numbers/percentages + tech units)
        const metricsMatch = input.match(/\d+(?:\.\d+)?\s*(%|ms|s|gb|mb|rps|tps|users|latency)/gi);
        const usedMetrics = !!metricsMatch;
        const metricsConfidence = usedMetrics ? Math.min(0.3 + (metricsMatch.length * 0.2), 1.0) : 0.3;

        // 2. Ownership Detection
        const iMatches = (rawInput.match(/\bi\b|\bmy\b|\bmine\b/g) || []).length;
        const weMatches = (rawInput.match(/\bwe\b|\bour\b|\bus\b/g) || []).length;

        let ownershipStance: 'I' | 'WE' | 'NEUTRAL' = 'NEUTRAL';
        if (iMatches > weMatches) ownershipStance = 'I';
        else if (weMatches > iMatches) ownershipStance = 'WE';

        const totalOwnershipHits = iMatches + weMatches;
        const ownershipConfidence = totalOwnershipHits > 0 ? Math.min(0.3 + (totalOwnershipHits * 0.1), 0.9) : 0.3;

        // 3. Tech Terminology Cross-Reference
        const techTerms = this.TECH_DICTIONARY.filter(term => rawInput.includes(term));

        // 4. Tradeoff Markers
        const tradeoffs = ['however', 'but', 'tradeoff', 'trade-off', 'compromise', 'alternatively', 'instead of', 'balancing'];
        const tradeoffDetected = tradeoffs.some(t => rawInput.includes(t));

        // 5. Hesitation / Vibe signals (e.g., filler words)
        const fillers = ['um', 'uh', 'ah', 'like', 'uhm', 'so basically', 'kind of'];
        const hesitationSignals = fillers.filter(f => rawInput.includes(f)).length;

        // 6. Dogmatic Thinking (Pattern Spam)
        const buzzwords = ['best practice', 'industry standard', 'clean code', 'solid', 'design pattern', 'decoupling'];
        const dogmaticMarkers = buzzwords.filter(b => rawInput.includes(b)).length;

        // 6. Specificity Score (Heuristic: Word count / technical density)
        const wordCount = input.split(/\s+/).length;
        const specificityScore = wordCount > 0 ? (techTerms.length * 5 + (usedMetrics ? 10 : 0)) / wordCount : 0;

        return {
            usedMetrics,
            metricsConfidence,
            ownershipStance,
            ownershipConfidence,
            techTerms,
            specificityScore,
            tradeoffDetected,
            hesitationSignals,
            hasCodeModification: codeChangeCount > 0,
            dogmaticMarkers
        };
    }

    /**
     * Cross-Consistency Check (The Expert Rule)
     * Prevents "gaming" the mirror.
     */
    static verifyConsistency(signals: ExtractedSignals, auditLogs: any): boolean {
        // If user claims metrics but code didn't change performance-critical lines
        if (signals.usedMetrics && signals.metricsConfidence > 0.7 && !signals.hasCodeModification) {
            return false; // Inconsistency: Talking numbers without code action
        }

        // If ownership is "I" but candidate hesitation is high
        if (signals.ownershipStance === 'I' && signals.hesitationSignals > 3) {
            return false; // Inconsistency: Claiming power but sounding unsure
        }

        return true;
    }
}
