
import { DecisionState } from './DecisionEngine';
import { ProbeType } from './ProbePlanner';

export interface FairnessAudit {
    isSafe: boolean;
    adjustment: string | null;
    modifiedLossScore: number;
}

export class FairnessLayer {
    private static probeHistory: ProbeType[] = [];

    /**
     * Applies the "Governor Layer" rules to ensure fairness.
     * Based on Expert Implementation Plan Step 5 & 6.
     */
    static applyGovernance(state: DecisionState): FairnessAudit {
        const { lossScore, probe, signals } = state;
        this.probeHistory.push(probe.type);

        // 1. MULTI-PROBE CONFIRMATION (Rule 1)
        // Don't escalate to "Max Aggression" if it's the first time seeing a weakness.
        if (lossScore > 0.8 && this.probeHistory.length < 3) {
            return {
                isSafe: true,
                adjustment: 'Multi-probe confirmation required. Downgrading initial penalty.',
                modifiedLossScore: 0.6
            };
        }

        // 2. COGNITIVE LOAD CONTROL (Rule 2)
        // No more than two "Brutal" probes back-to-back.
        const lastThree = this.probeHistory.slice(-3);
        const brutalCount = lastThree.filter(t =>
            t === ProbeType.FAILURE_INJECTION || t === ProbeType.INVERSION
        ).length;

        if (brutalCount >= 2) {
            return {
                isSafe: true,
                adjustment: 'Cognitive load threshold reached. Forcing Stabilization Probe.',
                modifiedLossScore: 0.4 // Reset to help candidate recover
            };
        }

        // 3. THE RECOVERY SANCTUARY (Rule 3)
        // If signals show positive tradeoff or metrics, drop aggression immediately.
        if (signals.usedMetrics && signals.tradeoffDetected && lossScore > 0.5) {
            return {
                isSafe: true,
                adjustment: 'High Signal detected. Executing Aggression Reset (Recovery Sanctuary).',
                modifiedLossScore: 0.3
            };
        }

        return {
            isSafe: true,
            adjustment: null,
            modifiedLossScore: lossScore
        };
    }
}
