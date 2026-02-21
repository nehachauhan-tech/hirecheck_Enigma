import { SignalNode } from './SignalGraph';

export type ProbeStrategy =
    | 'OPEN'          // reveal thinking
    | 'CONSTRAINT'    // test depth
    | 'STRESS'        // test pressure
    | 'CONTRADICTION'  // test consistency
    | 'OWNERSHIP'     // test accountability
    | 'RECOVERY';     // test learning

export class ProbeEngine {
    /**
     * Selects a probe strategy based on candidate seniority and current signal state.
     */
    static selectStrategy(
        signal: SignalNode,
        experienceLevel: string = 'intermediate',
        previousProbes: ProbeStrategy[] = []
    ): ProbeStrategy {
        const isSenior = experienceLevel.toLowerCase().includes('senior') || experienceLevel.toLowerCase().includes('staff');

        // Rule 1: Seniors get sharper probes
        if (isSenior) {
            if (signal.state === 'ADEQUATE' && !previousProbes.includes('CONTRADICTION')) {
                return 'CONTRADICTION';
            }
            if (signal.state === 'WEAK') return 'STRESS';
            return 'CONSTRAINT';
        }

        // Rule 2: If we've already done an OPEN probe and it was ADEQUATE, increase depth
        if (previousProbes.includes('OPEN') && signal.state === 'ADEQUATE') {
            return 'CONSTRAINT';
        }

        // Rule 3: Catch-all for new signals
        if (signal.state === 'UNTESTED') {
            return isSenior ? 'CONSTRAINT' : 'OPEN';
        }

        return 'OPEN';
    }

    /**
     * Formats a probe intent for the AI to shape the question.
     */
    static getProbeIntent(strategy: ProbeStrategy, signalLabel: string): string {
        const intents: Record<ProbeStrategy, string> = {
            'OPEN': `Ask an open-ended question to understand their mental model of ${signalLabel}.`,
            'CONSTRAINT': `Introduce a resource or time constraint (e.g., "memory is limited" or "this must run in <10ms") to test depth in ${signalLabel}.`,
            'STRESS': `Apply direct pressure. Ask why ${signalLabel} would fail in a production spike or edge case. Be abrupt.`,
            'CONTRADICTION': `Challenge a previous claim about ${signalLabel}. Point out a potential inconsistency or trade-off they ignored.`,
            'OWNERSHIP': `Ask about their specific, individual contribution to ${signalLabel} in a past project. Penalize "we-speak".`,
            'RECOVERY': `If they failed a previous point, offer one "last chance" hint and see if they can pivot correctly.`
        };

        return intents[strategy];
    }
}
