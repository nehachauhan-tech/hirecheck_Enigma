import { ISession } from '../models/Session';

export class MemoryManager {
    /**
     * Summarizes the current round results into scoped memory for the next round.
     * Only critical summaries and active risks flow forward, not raw chat.
     */
    static summarizeRound(session: ISession, roundResult: any): void {
        const { scorecard, rejectionSignals, notes } = roundResult;

        // Identify active risks (dimensions where score < 0.5)
        const activeRisks = Object.entries(scorecard)
            .filter(([_, score]) => (score as number) < 0.5)
            .map(([dimension]) => dimension);

        // Construct a clinical summary for the next round's interviewer
        const summary = `
      Round ${session.currentRound} (${session.metadata.problemTitle}) Summary:
      - Performance: ${roundResult.verdict}
      - Strengths: ${Object.entries(scorecard).filter(([_, s]) => (s as number) > 0.7).map(([k]) => k).join(', ')}
      - Risks Identified: ${rejectionSignals.join(', ') || 'None'}
      - Internal Notes: ${notes || 'Stable performance.'}
    `.trim();

        session.roundScopedMemory.lastSummary = summary;
        session.roundScopedMemory.activeRisks = Array.from(new Set([...session.roundScopedMemory.activeRisks, ...activeRisks]));
    }

    /**
     * Retrieves context for the AI prompt that includes summary of previous rounds.
     */
    static getFlowContext(session: ISession): string {
        if (!session.roundScopedMemory.lastSummary) return '';

        return `
      [PREVIOUS ROUND SUMMARY]
      ${session.roundScopedMemory.lastSummary}
      
      [ACTIVE RISKS TO PROBE]
      ${session.roundScopedMemory.activeRisks.join(', ') || 'Standard exploration.'}
    `.trim();
    }
}
