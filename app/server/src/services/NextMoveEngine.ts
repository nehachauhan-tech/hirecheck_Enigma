import { SignalNode } from './SignalGraph';
import { ProbeStrategy } from './ProbeEngine';

export type InterviewMove = 'ESCALATE' | 'PIVOT' | 'TRAP' | 'TERMINATE' | 'STAY';

export class NextMoveEngine {
    /**
     * Determines the next tactical move based on the last signal's resolution.
     */
    static determineMove(
        lastSignal: SignalNode,
        lastState: SignalNode['state']
    ): InterviewMove {
        switch (lastState) {
            case 'CONFIRMED':
                return 'ESCALATE'; // Move to harder topics
            case 'ADEQUATE':
                return 'PIVOT';    // Broaden the search
            case 'WEAK':
                return 'TRAP';     // Test if it was a fluke or lack of knowledge
            case 'DISQUALIFYING':
                return 'TERMINATE'; // Hard fail
            case 'TESTING':
                return 'STAY';     // Keep probing the same signal
            default:
                return 'PIVOT';
        }
    }

    /**
     * Provides a hint for the next probe strategy based on the move.
     */
    static getStrategyHint(move: InterviewMove): ProbeStrategy {
        switch (move) {
            case 'ESCALATE':
                return 'CONSTRAINT';
            case 'TRAP':
                return 'CONTRADICTION';
            case 'PIVOT':
                return 'OPEN';
            default:
                return 'OPEN';
        }
    }
}
