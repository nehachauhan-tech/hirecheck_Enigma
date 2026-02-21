
export interface TraceLog {
    timestamp: number;
    sessionId: string;
    signals: string[];
    verdict: string;
    lossScore: number;
}

export class DecisionTrace {
    private static logs: TraceLog[] = [];

    static log(sessionId: string, signals: string[], verdict: string, lossScore: number): void {
        const entry: TraceLog = {
            timestamp: Date.now(),
            sessionId,
            signals,
            verdict,
            lossScore
        };
        this.logs.push(entry);
        console.log(`[DECISION_TRACE] Session: ${sessionId} | Score: ${lossScore.toFixed(2)} | Signals: ${signals.join(', ')}`);
    }

    static getHistory(sessionId: string): TraceLog[] {
        return this.logs.filter(l => l.sessionId === sessionId);
    }

    static clear(sessionId: string): void {
        this.logs = this.logs.filter(l => l.sessionId !== sessionId);
    }
}
