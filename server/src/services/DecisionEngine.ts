
import { SignalExtractor, ExtractedSignals } from './SignalExtractor';
import { ProbePlanner, ProbeOutcome, ProbeType } from './ProbePlanner';
import { CompanyDNA, companyData } from '../data/company-dna';
import { FairnessLayer } from './FairnessLayer';
import { DecisionTrace } from './DecisionTrace';

export interface DecisionState {
    lossScore: number;
    companyRisk: number;
    signals: ExtractedSignals;
    probe: ProbeOutcome;
    verdictTrace: string[];
}

export class DecisionEngine {
    /**
     * The core "Thinking" layer. 
     * Moves evaluation from "Vibe" to "Math".
     */
    static analyze(
        userInput: string,
        companyName: string,
        currentStage: number,
        codeChangeCount: number = 0,
        sessionId: string = 'ANONYMOUS',
        category: string = 'General',
        mode?: string
    ): DecisionState {

        const isBehavioral = mode === 'behavioral' || category?.toLowerCase().includes('behavioral');

        const company = Object.values(companyData).find(c =>
            c.name.toLowerCase() === companyName.toLowerCase()
        ) || companyData['Amazon'];

        // 1. Extract deterministic signals
        const signals = SignalExtractor.extract(userInput, codeChangeCount);

        // 2. Compute Loss Function (The "Company Risk")
        const trace: string[] = [];
        let penalty = 0;

        const weights = company.diagnosticWeights;

        if (!isBehavioral) {
            if (!signals.usedMetrics) {
                penalty += weights.missingMetrics;
                trace.push(`- No metrics mentioned (${company.name} delta: +${weights.missingMetrics})`);
            } else {
                trace.push(`+ Used metrics (Confidence: ${signals.metricsConfidence.toFixed(2)})`);
            }
        }

        if (signals.ownershipStance === 'WE') {
            penalty += weights.pluralOwnership;
            trace.push(`- Plural ownership "WE" detected (${company.name} penalty: +${weights.pluralOwnership})`);
        } else if (signals.ownershipStance === 'I') {
            trace.push(`+ Ownership confirmed: "I" (Confidence: ${signals.ownershipConfidence.toFixed(2)})`);
        }

        if (!isBehavioral) {
            if (!signals.tradeoffDetected) {
                penalty += weights.noTradeoffs;
                trace.push(`- No tradeoffs discussed (+${weights.noTradeoffs})`);
            } else {
                trace.push(`+ Tradeoff markers detected`);
            }
        }

        if (signals.hesitationSignals > 3) {
            penalty += weights.highHesitation;
            trace.push(`- High hesitation/filler frequency (+${weights.highHesitation})`);
        }

        // 3. Signal Consistency Check
        const isConsistent = SignalExtractor.verifyConsistency(signals, null);
        if (!isConsistent) {
            penalty += 0.5;
            trace.push(`- CRITICAL: Cross-signal inconsistency detected (Proxy match failed)`);
        }

        const lossScore = Math.min(penalty, 1.0);

        // 4. Plan the Probe
        let probe = ProbePlanner.plan(signals, company, currentStage, lossScore, category);

        // 5. Apply Fairness Governor
        const audit = FairnessLayer.applyGovernance({ lossScore, companyRisk: penalty, signals, probe, verdictTrace: trace });

        if (audit.adjustment) {
            trace.push(`[GOVERNOR]: ${audit.adjustment}`);
        }

        // 6. Log Decision Trace
        DecisionTrace.log(sessionId, trace, lossScore > 0.6 ? 'REJECT' : 'PROCEED', audit.modifiedLossScore);

        return {
            lossScore: audit.modifiedLossScore,
            companyRisk: penalty,
            signals,
            probe,
            verdictTrace: trace
        };
    }
}
