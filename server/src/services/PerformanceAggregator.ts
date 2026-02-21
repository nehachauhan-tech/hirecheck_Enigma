
import { DecisionState } from './DecisionEngine';

export interface PerformanceSnapshot {
    timestamp: number;
    company: string;
    lossScore: number;
    topStrengths: string[];
    topGaps: string[];
}

export class PerformanceAggregator {
    private static history: PerformanceSnapshot[] = [];

    /**
     * Tracks a session's outcome and updates the long-term profile.
     */
    static trackSession(state: DecisionState, companyName: string): void {
        const snapshot: PerformanceSnapshot = {
            timestamp: Date.now(),
            company: companyName,
            lossScore: state.lossScore,
            topStrengths: [],
            topGaps: []
        };

        // Calculate strengths/gaps from signals
        if (state.signals.usedMetrics) snapshot.topStrengths.push('Quantifiable Impact');
        else snapshot.topGaps.push('Metric-Driven Communication');

        if (state.signals.ownershipStance === 'I') snapshot.topStrengths.push('Technical Ownership');
        else snapshot.topGaps.push('Individual Agency');

        this.history.push(snapshot);
    }

    /**
     * Calculates the Technical Velocity (Improvement over time).
     */
    static getVelocity(): number {
        if (this.history.length < 2) return 0;
        const first = this.history[0].lossScore;
        const last = this.history[this.history.length - 1].lossScore;
        return first - last; // Positive = Improvement (Loss decreased)
    }

    /**
     * Generates the Master Audit Verdict.
     */
    static getMasterVerdict(): string {
        const velocity = this.getVelocity();
        if (velocity > 0.4) return 'Exceptional Trajectory: Rapidly adapting to corporate DNA.';
        if (velocity > 0.1) return 'Moderate Growth: Technical signals stabilizing.';
        if (velocity < -0.1) return 'Regression Detected: Signals becoming noisier over time.';
        return 'Stability Phase: Consistent performance across multiple domains.';
    }
}
