
import { ExtractedSignals } from './SignalExtractor';
import { CompanyDNA } from '../data/company-dna';

export enum ProbeType {
    CLARIFICATION = 'CLARIFICATION',
    TRADEOFF = 'TRADEOFF',
    FAILURE_INJECTION = 'FAILURE_INJECTION',
    INVERSION = 'INVERSION',
    REQUIREMENT_SHIFT = 'REQUIREMENT_SHIFT',
    RECONSTRUCTION = 'RECONSTRUCTION'
}

export interface ProbeOutcome {
    type: ProbeType;
    targetWeakness: string;
    stage: number; // 1 to 4 (Progressive Constraint)
    instruction: string;
}

export class ProbePlanner {
    /**
     * Plans the next expert probe based on signals and company context.
     */
    static plan(
        signals: ExtractedSignals,
        company: CompanyDNA,
        currentStage: number,
        lossScore: number,
        category: string = 'General'
    ): ProbeOutcome {
        const isBehavioral = category.toLowerCase().includes('behavioral');

        const weights = company.diagnosticWeights || {
            highHesitation: 0.5,
            pluralOwnership: 0.5,
            missingMetrics: 0.5,
            noTradeoffs: 0.5
        };

        if (isBehavioral) {
            // Behavioral-specific probes (STAR method, Leadership, etc.)
            // WEIGHTED: Plural Ownership Penalty
            if (signals.ownershipStance === 'WE' && weights.pluralOwnership > 0.6) {
                return {
                    type: ProbeType.RECONSTRUCTION,
                    targetWeakness: 'Individual Contribution',
                    stage: currentStage,
                    instruction: `High DNA Penalty on "We". "You keep saying 'We'. ${company.name} demands ownership. What did YOU specifically drive?"`
                };
            }

            // WEIGHTED: Hesitation Penalty (Strictness varies by company)
            // TCS (0.8) -> Threshold 2. Google (0.3) -> Threshold 5.
            const hesitationThreshold = Math.max(2, 6 - (weights.highHesitation * 5));
            if (signals.hesitationSignals > hesitationThreshold) {
                return {
                    type: ProbeType.CLARIFICATION,
                    targetWeakness: 'Communication Confidence',
                    stage: currentStage,
                    instruction: `Confidence Flag. "You are hesitating. ${company.name} requires concise communication. Summarize your point in 10 words."`
                };
            }

            return {
                type: ProbeType.TRADEOFF,
                targetWeakness: 'Culture Alignment',
                stage: currentStage,
                instruction: `Challenge a principle of ${company.name}. "How did this action align with ${company.focusAreas[0]}? What were the alternatives?"`
            };
        }

        // 1. SILENCE AS STATE TRANSITION logic
        if (signals.hesitationSignals > 5 && lossScore > 0.5) {
            return {
                type: ProbeType.CLARIFICATION,
                targetWeakness: 'Panic/Block',
                stage: currentStage,
                instruction: 'Reduce cognitive load. Ask for a simpler sub-component explanation.'
            };
        }

        // 2. SURGICAL SIGNAL ROUTING (Dogmatic Thinking)
        if (signals.dogmaticMarkers > 2) {
            return {
                type: ProbeType.INVERSION,
                targetWeakness: 'Dogmatic Thinking',
                stage: 4,
                instruction: 'Challenge their use of industry buzzwords. "You mentioned Clean Code—explain exactly where this pattern becomes a bottleneck in a high-churn startup."'
            };
        }

        // 3. CATEGORY-AWARE SCENARIOS (Stack-Specific)
        const isMern = category.toLowerCase().includes('mern') || category.toLowerCase().includes('javascript') || category.toLowerCase().includes('node');

        if (isMern && currentStage >= 3) {
            return {
                type: ProbeType.FAILURE_INJECTION,
                targetWeakness: 'Node/JS Internals',
                stage: currentStage,
                instruction: 'The Node.js event loop is blocked by a massive JSON.parse. How do you maintain responsiveness without adding servers?'
            };
        }

        // 4. SURGICAL SIGNAL ROUTING (Targeted Ceiling Testing)
        if (signals.ownershipStance === 'WE' && currentStage >= 2 && weights.pluralOwnership > 0.5) {
            return {
                type: ProbeType.RECONSTRUCTION,
                targetWeakness: 'Individual Agency',
                stage: currentStage,
                instruction: 'Isolate their contribution. "Which exact line of this logic did YOU design versus the team? Explain the core loop."'
            };
        }

        // WEIGHTED: Metric Driven Thinking (Amazon/Google Critical)
        if (!signals.usedMetrics && currentStage >= 2 && weights.missingMetrics > 0.6) {
            return {
                type: ProbeType.REQUIREMENT_SHIFT,
                targetWeakness: 'Metric-Driven Thinking',
                stage: currentStage,
                instruction: `Force quantitative analysis (${company.name} Requirement). "What is the specific SLO? Your answer is anecdotal. Give me numbers."`
            };
        }

        // 5. STAGE ADVANCEMENT LOGIC
        // If loss is low, move to the next diagnostic level
        let targetStage = currentStage;
        if (lossScore < 0.3 && currentStage < 4) {
            targetStage = currentStage + 1;
        }

        if (signals.techTerms.length === 0 && lossScore > 0.3) {
            return {
                type: ProbeType.RECONSTRUCTION,
                targetWeakness: 'Shallow Knowledge',
                stage: targetStage,
                instruction: 'Force deletion of a core line. "Delete your middleware and explain how auth survives."'
            };
        }

        // 6. PROGRESSIVE CONSTRAINT PATHWAY
        if (targetStage === 1) {
            return {
                type: ProbeType.RECONSTRUCTION,
                targetWeakness: 'Fundamentals',
                stage: 1,
                instruction: 'Ask for a low-level implementation detail of their primary data structure.'
            };
        }

        if (targetStage === 2) {
            return {
                type: ProbeType.REQUIREMENT_SHIFT,
                targetWeakness: 'Scaling Blindness',
                stage: 2,
                instruction: `Increase traffic by 100x. Focus on ${company.focusAreas[0]}.`
            };
        }

        if (targetStage === 3) {
            return {
                type: ProbeType.FAILURE_INJECTION,
                targetWeakness: 'Resilience',
                stage: 3,
                instruction: 'The primary database is read-only. How does the write path behave?'
            };
        }

        if (targetStage === 4) {
            return {
                type: ProbeType.INVERSION,
                targetWeakness: 'Dogmatic Thinking',
                stage: 4,
                instruction: 'Why is this entire architectural choice the WRONG one for this specific company?'
            };
        }

        // Default: Deepen Tradeoffs
        return {
            type: ProbeType.TRADEOFF,
            targetWeakness: 'Decision Making',
            stage: targetStage,
            instruction: 'Force a choice between latency and consistency.'
        };
    }
}
