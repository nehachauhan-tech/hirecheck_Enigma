import { SignalGraph, SignalNode } from './SignalGraph';
import { ProbeEngine, ProbeStrategy } from './ProbeEngine';
import { ISession } from '../models/Session';

export class QuestionDeliveryEngine {
    private static graphs: Map<string, SignalGraph> = new Map();

    /**
     * Generates the clinical intent for the next question.
     */
    static getNextQuestionIntent(session: ISession): { signal: SignalNode; strategy: ProbeStrategy; intent: string } | null {
        const sessionId = session._id.toString();

        if (!this.graphs.has(sessionId)) {
            this.graphs.set(sessionId, new SignalGraph());
        }

        const graph = this.graphs.get(sessionId)!;

        // 1. Identify the next signal we need evidence for
        const signal = graph.getNextRiskiestSignal();
        if (!signal) return null;

        // 2. Select the probe strategy (AQDE Layer 3)
        const strategy = ProbeEngine.selectStrategy(signal, session.metadata.experienceLevel);

        // 3. Construct the intent (AQDE Layer 4)
        const intent = ProbeEngine.getProbeIntent(strategy, signal.label);

        return { signal, strategy, intent };
    }

    /**
     * Updates the graph based on the AI's resolution of a signal.
     */
    static resolveSignal(sessionId: string, signalId: string, state: SignalNode['state']): void {
        const graph = this.graphs.get(sessionId);
        if (graph) {
            graph.updateSignalState(signalId, state);
        }
    }

    static getAnalytics(sessionId: string): any {
        return this.graphs.get(sessionId)?.getGraphState() || {};
    }
}
