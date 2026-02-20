export class AlgorithmicPersona {
    private static silenceTimers: Map<string, number> = new Map();
    private static aggressionLevels: Map<string, number> = new Map(); // 0 to 1

    /**
     * Evaluates if a silence-based probe should be triggered.
     * Expert Pillar: 15s probe triggering.
     */
    static evaluateSilence(sessionId: string, lastActivityTime: number): boolean {
        const now = Date.now();
        const silenceDuration = now - lastActivityTime;

        if (silenceDuration > 15000) { // 15 seconds
            const lastProbe = this.silenceTimers.get(sessionId) || 0;
            // Don't trigger silence probes more than once every 45s
            if (now - lastProbe > 45000) {
                this.silenceTimers.set(sessionId, now);
                return true;
            }
        }
        return false;
    }

    /**
     * Scales interviewer aggression based on candidate confidence score.
     * If candidate is too confident (high dnaMatch), Karan gets sharper.
     */
    static getAggressionScaling(dnaMatch: number): 'STANDARD' | 'SHARP' | 'BRUTAL' {
        if (dnaMatch > 85) return 'BRUTAL';
        if (dnaMatch > 70) return 'SHARP';
        return 'STANDARD';
    }

    /**
     * Gets prompt instruction based on aggression level.
     */
    static getAggressionPrompt(dnaMatch: number): string {
        const level = this.getAggressionScaling(dnaMatch);
        switch (level) {
            case 'BRUTAL':
                return "The candidate is performing exceptionally well. AGGRESSION SCALING: BRUTAL. Challenge their architectural ceiling. Ask about failures, trade-offs, and edge cases. Do not be polite.";
            case 'SHARP':
                return "The candidate is strong. AGGRESSION SCALING: SHARP. Probing should be more technical and less supportive. Focus on depth.";
            default:
                return "AGGRESSION SCALING: STANDARD. Maintain the clinical persona focus.";
        }
    }

    /**
     * Gets customized system prompt instruction based on Company DNA.
     */
    static getCompanyInstruction(dna: any): string {
        if (!dna) return "";

        const baseInstruction = `INTERVIEWER_STYLE: ${dna.interviewStyle}`;
        const focusAreas = `FOCUS_AREAS: ${dna.focusAreas.join(', ')}`;
        const triggers = `SECRET_TRIGGERS_TO_WATCH: ${dna.secretTriggers.join(' | ')}`;
        const advice = `ADVICE: ${dna.interviewerAdvice}`;

        return `\n${baseInstruction}\n${focusAreas}\n${triggers}\n${advice}\nYOU MUST ADOPT THIS SPECIFIC CORPORATE PERSONA.`;
    }
}
