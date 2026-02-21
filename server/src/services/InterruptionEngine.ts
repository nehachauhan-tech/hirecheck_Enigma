import { BehavioralMetrics } from './SignalAnalyzer';

export interface InterruptionResult {
    shouldInterrupt: boolean;
    reason?: 'rambling' | 'silence' | 'evidence_limit';
    message?: string;
}

export class InterruptionEngine {
    /**
     * Evaluates if the candidate should be interrupted.
     * Authority Pillar: Control of speech and time.
     */
    static evaluate(metrics: {
        timeSpoken: number;
        meceDetected: boolean;
        silenceDuration: number;
        signalProgress: 'none' | 'partial' | 'strong';
    }): InterruptionResult {

        // 1. SILENCE RULE: Silence > 12s
        if (metrics.silenceDuration > 12000) {
            return {
                shouldInterrupt: true,
                reason: 'silence',
                message: "Stop. You've been silent for too long. Give me your MECE categories now."
            };
        }

        // 2. RAMBLING RULE: timeSpoken > 25s AND meceDetected = false
        if (metrics.timeSpoken > 25 && !metrics.meceDetected) {
            return {
                shouldInterrupt: true,
                reason: 'rambling',
                message: "Stop. You are rambling without structure. Divide this into MECE categories."
            };
        }

        // 3. EVIDENCE LIMIT RULE: signalProgress = strong
        if (metrics.signalProgress === 'strong') {
            return {
                shouldInterrupt: true,
                reason: 'evidence_limit',
                message: "That's enough. I've heard what I need. Let's move on."
            };
        }

        return { shouldInterrupt: false };
    }
}
