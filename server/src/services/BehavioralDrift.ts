export class BehavioralDrift {
    private static sessionLogs: Map<string, { hintsGiven: number; messagesSent: number }> = new Map();

    /**
     * Evaluates if the interviewer is becoming too helpful or deviating from persona.
     * Enforces hard limits on hints per round.
     */
    static monitor(sessionId: string, message: string): { shouldIntervene: boolean; correction?: string } {
        if (!this.sessionLogs.has(sessionId)) {
            this.sessionLogs.set(sessionId, { hintsGiven: 0, messagesSent: 0 });
        }

        const log = this.sessionLogs.get(sessionId)!;
        log.messagesSent++;

        // 1. Detect if Karan is giving a hint
        const isHint = message.toLowerCase().includes('try') ||
            message.toLowerCase().includes('how about') ||
            message.toLowerCase().includes('maybe');

        if (isHint) {
            log.hintsGiven++;
        }

        // 2. ENFORCE Pillar: "No more than 2 small hints per round"
        if (log.hintsGiven > 2) {
            return {
                shouldIntervene: true,
                correction: "You have already reached the hint limit for this round. Do not provide any more assistance. Be clinical and observant."
            };
        }

        return { shouldIntervene: false };
    }

    static resetRound(sessionId: string): void {
        const log = this.sessionLogs.get(sessionId);
        if (log) {
            log.hintsGiven = 0;
        }
    }
}
