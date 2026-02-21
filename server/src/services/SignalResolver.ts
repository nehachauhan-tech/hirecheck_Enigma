import { SignalNode } from './SignalGraph';

export class SignalResolver {
    /**
     * Resolves the state of a signal based on behavioral metrics and code stability.
     */
    static resolve(
        signal: SignalNode,
        metrics: any,
        isCodeSuccessful: boolean = true
    ): SignalNode['state'] {
        // 1. If code failed execution, we cannot confirm anything above WEAK
        if (!isCodeSuccessful) {
            return 'WEAK';
        }

        // 2. Clinical Evaluation Logic
        const stabilityScore = metrics.approachConsistency;
        const churn = metrics.rewriteDensity;

        // CONFIRMED: High stability, low churn, good execution
        if (stabilityScore > 0.8 && churn < 0.2) {
            return 'CONFIRMED';
        }

        // ADEQUATE: Reasonable progress, some churn
        if (stabilityScore > 0.5 && churn < 0.5) {
            return 'ADEQUATE';
        }

        // WEAK: High churn or low consistency even if code works
        if (churn > 0.6 || stabilityScore < 0.4) {
            return 'WEAK';
        }

        // 3. DISQUALIFYING: Irrecoverable Mistakes (Security/Logic/Safety)
        if (metrics.criticalFailures && metrics.criticalFailures.length > 0) {
            return 'DISQUALIFYING';
        }

        return 'ADEQUATE';
    }
}
